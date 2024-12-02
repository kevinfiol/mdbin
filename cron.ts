import { DEMO_CLEAR_INTERVAL, MODE } from './env.ts';

if (MODE === 'demo') {
  Deno.cron(
    'Clear KV',
    { minute: { every: DEMO_CLEAR_INTERVAL } },
    async () => {
      const KV = await Deno.openKv();

      for await (const e of KV.list({ prefix: [] })) {
        await KV.delete(e.key);
      }

      KV.close();
    },
  );
}
