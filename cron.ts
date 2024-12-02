import { MODE } from './env.ts';

if (MODE === 'demo') {
  const INTERVAL = Number(Deno.env.get('DEMO_CLEAR_INTERVAL')) ?? 5;

  Deno.cron('Clear KV', { minute: { every: INTERVAL } }, async () => {
    const KV = await Deno.openKv();

    for await (const e of KV.list({ prefix: [] })) {
      await KV.delete(e.key);
    }

    KV.close();
  });
}