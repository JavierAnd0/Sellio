import { createClient } from './packages/db/src/server';

async function main() {
  const db = await createClient();
  const { count, error } = await db
      .from('point_transactions')
      .select('..., memberships!inner(card_id)', { count: 'exact', head: true })
      .eq('memberships.card_id', 'some-id');
  console.log({count, error});
}
main();
