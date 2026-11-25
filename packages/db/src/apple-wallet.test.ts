import http2 from 'node:http2';
import type { AddressInfo } from 'node:net';

import * as forge from 'node-forge';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createApnsTransport,
  extractPemFromP12,
  getApplePushConfig,
  sendApplePassPushes,
} from './apple-wallet';

function selfSignedCert(commonName: string) {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date(Date.now() - 60_000);
  cert.validity.notAfter = new Date(Date.now() + 86_400_000);
  const attrs = [{ name: 'commonName', value: commonName }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([{ name: 'subjectAltName', altNames: [{ type: 2, value: commonName }] }]);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  return { cert, keys };
}

function makeP12Base64(password: string) {
  const { cert, keys } = selfSignedCert('pass.com.sellio.test');
  const asn1 = forge.pkcs12.toPkcs12Asn1(keys.privateKey, [cert], password, { algorithm: '3des' });
  return {
    base64: Buffer.from(forge.asn1.toDer(asn1).getBytes(), 'binary').toString('base64'),
    certPem: forge.pki.certificateToPem(cert),
  };
}

describe('extractPemFromP12', () => {
  it('extracts the certificate and private key from a password-protected .p12', () => {
    const { base64, certPem } = makeP12Base64('secret');
    const pem = extractPemFromP12(Buffer.from(base64, 'base64'), 'secret');

    expect(pem.signerCert).toBe(certPem);
    expect(pem.signerKey).toContain('BEGIN RSA PRIVATE KEY');
  });

  it('throws with the wrong password', () => {
    const { base64 } = makeP12Base64('secret');
    expect(() => extractPemFromP12(Buffer.from(base64, 'base64'), 'wrong')).toThrow();
  });
});

describe('getApplePushConfig', () => {
  it('returns null when Apple Wallet is not configured', () => {
    expect(getApplePushConfig({})).toBeNull();
    expect(getApplePushConfig({ APPLE_PASS_TYPE_IDENTIFIER: 'pass.x' })).toBeNull();
  });

  it('builds the config from env vars', () => {
    const { base64 } = makeP12Base64('pw');
    const config = getApplePushConfig({
      APPLE_PASS_TYPE_IDENTIFIER: 'pass.com.sellio.test',
      APPLE_PASS_CERTIFICATE: base64,
      APPLE_PASS_CERTIFICATE_PWD: 'pw',
    });
    expect(config?.passTypeIdentifier).toBe('pass.com.sellio.test');
    expect(config?.credentials.signerKey).toContain('PRIVATE KEY');
  });
});

describe('sendApplePassPushes', () => {
  it('counts deliveries, collects invalid tokens and never throws', async () => {
    const statuses: Record<string, number> = { ok1: 200, ok2: 200, gone: 410, bad: 400, err: 500 };
    const send = vi.fn(async (token: string) => {
      if (token === 'boom') throw new Error('network');
      return statuses[token]!;
    });

    const result = await sendApplePassPushes(['ok1', 'ok2', 'ok1', 'gone', 'bad', 'err', 'boom', ''], send);

    expect(send).toHaveBeenCalledTimes(6); // dedup + sin vacíos
    expect(result).toEqual({ delivered: 2, failed: 2, invalidTokens: ['gone', 'bad'] });
  });
});

describe('createApnsTransport', () => {
  let server: http2.Http2SecureServer | undefined;

  afterEach(() => {
    server?.close();
    server = undefined;
  });

  it('sends an empty JSON POST to /3/device/{token} with the pass type as apns-topic', async () => {
    const { cert, keys } = selfSignedCert('localhost');
    const serverCert = forge.pki.certificateToPem(cert);
    const received: Array<{ headers: http2.IncomingHttpHeaders; body: string }> = [];

    server = http2.createSecureServer({
      cert: serverCert,
      key: forge.pki.privateKeyToPem(keys.privateKey),
    });
    server.on('stream', (stream, headers) => {
      let body = '';
      stream.on('data', (chunk) => (body += chunk));
      stream.on('end', () => {
        received.push({ headers, body });
        const status = String(headers[':path']).endsWith('/gone-token') ? 410 : 200;
        stream.respond({ ':status': status });
        stream.end(status === 410 ? '{"reason":"Unregistered"}' : '');
      });
    });
    await new Promise<void>((resolve) => server!.listen(0, 'localhost', resolve));
    const { port } = server.address() as AddressInfo;

    const client = makeP12Base64('pw');
    const config = getApplePushConfig({
      APPLE_PASS_TYPE_IDENTIFIER: 'pass.com.sellio.test',
      APPLE_PASS_CERTIFICATE: client.base64,
      APPLE_PASS_CERTIFICATE_PWD: 'pw',
    })!;
    const transport = createApnsTransport(config, { host: `https://localhost:${port}`, ca: serverCert });

    try {
      const result = await sendApplePassPushes(['abc123', 'gone-token'], transport.send);
      expect(result).toEqual({ delivered: 1, failed: 0, invalidTokens: ['gone-token'] });
    } finally {
      transport.close();
    }

    const first = received.find((r) => r.headers[':path'] === '/3/device/abc123');
    expect(first?.headers[':method']).toBe('POST');
    expect(first?.headers['apns-topic']).toBe('pass.com.sellio.test');
    expect(first?.body).toBe('{}');
  });
});
