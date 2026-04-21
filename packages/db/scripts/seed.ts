/* eslint-disable no-console */
/**
 * Seed script — carga datos sintéticos para desarrollo local.
 *
 * Uso:
 *   pnpm db:seed
 *
 * Requiere .env.local con credenciales de Supabase local o dev.
 * NUNCA correr contra producción (el script verifica).
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

// Safety: no correr contra prod
if (SUPABASE_URL.includes('prod') || !SUPABASE_URL.includes('127.0.0.1')) {
  if (!process.env.FORCE_SEED) {
    console.error(
      '⚠️  Seed aborted: SUPABASE_URL does not look local. Set FORCE_SEED=1 to override.',
    );
    process.exit(1);
  }
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Crear un usuario de prueba
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'demo@sellio.co',
    password: 'demo1234',
    email_confirm: true,
    user_metadata: { full_name: 'Usuario Demo' },
  });

  if (authError) {
    console.error('Error creating user:', authError);
    return;
  }
  const userId = authUser.user.id;
  console.log(`  ✓ User created: demo@sellio.co (id: ${userId})`);

  // 2. Crear organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      slug: 'cafe-central',
      name: 'Café Central',
      country: 'CO',
      timezone: 'America/Bogota',
      plan: 'basic',
      primary_color: '#E8341A',
    })
    .select()
    .single();

  if (orgError || !org) {
    console.error('Error creating org:', orgError);
    return;
  }
  console.log(`  ✓ Org: ${org.name}`);

  // 3. Agregar al usuario como owner
  await supabase.from('organization_members').insert({
    org_id: org.id,
    user_id: userId,
    role: 'owner',
  });

  // 4. Crear una card
  const { data: card } = await supabase
    .from('cards')
    .insert({
      org_id: org.id,
      name: 'Tarjeta Café Central',
      description: 'Cada 10 cafés, el siguiente es gratis',
      points_per_checkin: 1,
      points_for_reward: 10,
      reward_description: 'Un café gratis',
      design: {},
    })
    .select()
    .single();

  if (!card) {
    console.error('Failed to create card');
    return;
  }
  console.log(`  ✓ Card: ${card.name}`);

  // 5. Crear algunos customers y memberships con puntos variados
  const customers = [
    { phone: '+573001111111', name: 'Ana Ramírez', points: 3 },
    { phone: '+573002222222', name: 'Pedro Gómez', points: 7 },
    { phone: '+573003333333', name: 'María López', points: 9 },
    { phone: '+573004444444', name: 'Luis Torres', points: 15 },
    { phone: '+573005555555', name: 'Sofía Jiménez', points: 0 },
  ];

  for (const c of customers) {
    const { data: customer } = await supabase
      .from('customers')
      .insert({ org_id: org.id, phone: c.phone, name: c.name })
      .select()
      .single();

    if (!customer) continue;

    const { data: membership } = await supabase
      .from('memberships')
      .insert({ card_id: card.id, customer_id: customer.id })
      .select()
      .single();

    if (!membership) continue;

    // Crear point_transactions para los puntos
    for (let i = 0; i < c.points; i++) {
      await supabase.from('point_transactions').insert({
        membership_id: membership.id,
        type: 'earn',
        points: 1,
        source: 'checkin',
        metadata: {},
      });
    }

    console.log(`  ✓ Customer: ${c.name} (${c.points} points)`);
  }

  console.log('✨ Seed complete.');
  console.log('   Login: demo@sellio.co / demo1234');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
