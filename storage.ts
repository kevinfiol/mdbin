export interface Paste {
  paste: string;
  editCode?: string;
}

const KV = await Deno.openKv();

export const storage = {
  async get(id: string) {
    return await KV.get<Paste>([id]);
  },

  async set(id: string, pasteAttrs: Paste) {
    return await KV.set([id], pasteAttrs);
  },

  async delete(id: string) {
    return await KV.delete([id]);
  },
};
