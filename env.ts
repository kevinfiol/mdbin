import { load } from 'std/dotenv/mod.ts';

await load({ export: true });

export const MODE = Deno.env.get('MODE') ?? 'prod';
export const SERVER_PORT = Deno.env.get('SERVER_PORT') ?? 8000;