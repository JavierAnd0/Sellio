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

interface WelcomeEmailProps {
  businessName: string;
  dashboardUrl: string;
}

export function WelcomeEmail({ businessName, dashboardUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Sellio, {businessName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logo}>
              Sellio<span style={{ color: '#E8341A' }}>.</span>
            </Heading>
          </Section>

          <Heading as="h1" style={h1}>
            Bienvenido, {businessName}
          </Heading>

          <Text style={paragraph}>
            Tu cuenta está lista. En los próximos minutos puedes crear tu primera tarjeta de
            lealtad y empezar a fidelizar clientes.
          </Text>

          <Section style={buttonSection}>
            <Button href={dashboardUrl} style={button}>
              Ir al dashboard
            </Button>
          </Section>

          <Text style={paragraph}>
            Si tienes alguna duda, responde a este email. Tenemos una persona real leyendo.
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

export default WelcomeEmail;

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
