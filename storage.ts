import lz from 'lz';

export interface Paste {
  paste: string;
  editCode?: string;
}

const KV = await Deno.openKv();

export const storage = {
  async get(id: string) {
    const result = await KV.get<Paste>([id]);

    if (result.value !== null) {
      result.value.paste = lz.decompress(result.value.paste);
    }

    return result;
  },

  async set(id: string, pasteAttrs: Paste) {
    const compressed = lz.compress(pasteAttrs.paste) as Paste['paste'];
    pasteAttrs.paste = compressed;
    return await KV.set([id], pasteAttrs);
  },

  async delete(id: string) {
    return await KV.delete([id]);
  },
};
