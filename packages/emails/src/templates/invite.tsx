import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface InviteEmailProps {
  orgName: string;
  inviterEmail: string;
  inviteUrl: string;
  role: string;
}

export function InviteEmail({ orgName, inviterEmail, inviteUrl, role }: InviteEmailProps) {
  const roleLabel = role === 'admin' ? 'Administrador' : 'Cajero/Staff';

  return (
    <Html>
      <Head />
      <Preview>Te han invitado a unirte a {orgName} en Sellio</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>
              Sellio<span style={{ color: '#E8341A' }}>.</span>
            </Heading>
          </Section>

          <Heading as="h1" style={h1}>
            Invitación de equipo
          </Heading>

          <Text style={paragraph}>
            El usuario <strong>{inviterEmail}</strong> te ha invitado a unirte al equipo de{' '}
            <strong>{orgName}</strong> en Sellio con el rol de <strong>{roleLabel}</strong>.
          </Text>

          <Text style={paragraph}>
            Como miembro del equipo, podrás administrar las tarjetas de fidelidad, registrar
            visitas de clientes y gestionar recompensas según tu rol asignado.
          </Text>

          <Section style={buttonSection}>
            <Button href={inviteUrl} style={button}>
              Aceptar invitación
            </Button>
          </Section>

          <Text style={paragraph}>
            Este enlace de invitación expirará en 7 días. Si no esperabas esta invitación, puedes
            ignorar este correo de forma segura.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Sellio · Colombia ·{' '}
            <Link href="https://sellio.co" style={{ color: '#6B6560' }}>
              sellio.co
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default InviteEmail;

const main = {
  backgroundColor: '#0A0A0A',
  fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '40px 24px',
  maxWidth: '560px',
};

const logoSection = { marginBottom: '32px' };

const logo = {
  fontFamily: "'Syne', sans-serif",
  fontWeight: 800,
  fontSize: '24px',
  color: '#F5F0EB',
  margin: 0,
};

const h1 = {
  fontFamily: "'Syne', sans-serif",
  fontSize: '28px',
  fontWeight: 800,
  color: '#F5F0EB',
  lineHeight: '1.2',
  margin: '0 0 16px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#F5F0EB',
  margin: '0 0 16px',
};

const buttonSection = { margin: '32px 0' };

const button = {
  backgroundColor: '#E8341A',
  color: '#FFFFFF',
  padding: '14px 24px',
  borderRadius: '10px',
  fontWeight: 700,
  fontSize: '14px',
  textDecoration: 'none',
  display: 'inline-block',
};

const hr = {
  borderColor: 'rgba(245,240,235,0.1)',
  margin: '32px 0',
};

const footer = {
  fontSize: '12px',
  color: '#6B6560',
  margin: 0,
};
