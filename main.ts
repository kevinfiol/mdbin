import { resolve } from 'std/path/mod.ts';
import { walk } from 'std/fs/mod.ts';
import { uid } from './lib/uid.js';
import { marked } from './lib/marked.js';
import { Router } from './router.ts';
import { editPage, errorPage, homePage, pastePage } from './templates.ts';

const KV = await Deno.openKv();

const STATIC_ROOT = resolve('./static');
const FILES = new Map<string, string>();

for await (const file of walk(STATIC_ROOT)) {
  if (file.isFile) {
    FILES.set('/' + file.name.normalize(), file.path);
  }
}

const app = new Router();

app.get('*', async (req) => {
  const url = new URL(req.url);
  const filepath = FILES.get(url.pathname);

  if (filepath) {
    const file = await Deno.open(filepath, { read: true });
    const readableStream = file.readable;
    return new Response(readableStream);
  }
});

app.get('/', () =>
  new Response(homePage(), {
    status: 200,
    headers: { 'content-type': 'text/html' },
  }));

app.post('/save', async (req) => {
  let status = 302;
  let contents = '';
  const headers = new Headers({
    'content-type': 'text/html',
  });

  const form = await req.formData();
  const customUrl = form.get('url') as string;
  const paste = form.get('paste') as string;
  const slug = createSlug(customUrl);

  if (slug.length > 0) {
    const res = await KV.get([slug]);

    if (res.value !== null) {
      status = 422;

      contents = homePage({
        paste,
        url: customUrl,
        errors: { url: `url name unavailable: ${customUrl}` },
      });
    } else {
      await KV.set([slug], paste);
      status = 302;
      headers.set('location', '/' + slug.trim());
    }
  } else {
    let id = '';
    let exists = true;

    for (; exists;) {
      id = uid();
      exists = await KV.get([id]).then(
        (r) => r.value !== null,
      );
    }

    await KV.set([id], paste);
    status = 302;
    headers.set('location', '/' + id.trim());
  }

  return new Response(contents, {
    status,
    headers,
  });
});

app.get('/:id', async (_req, params) => {
  let contents = '';
  let status = 200;
  const id = params.id as string ?? '';
  const res = await KV.get([id]);

  if (res.value !== null) {
    const html = marked.parse(res.value);
    contents = pastePage({ id, html });
    status = 200;
  } else {
    contents = errorPage();
    status = 404;
  }

  return new Response(contents, {
    status,
    headers: {
      'content-type': 'text/html',
    },
  });
});

app.get('/:id/edit', async (_req, params) => {
  let contents = '';
  let status = 200;
  const id = params.id as string ?? '';
  const res = await KV.get([id]);

  if (res.value !== null) {
    const paste = res.value as string;
    contents = editPage({ id, paste });
    status = 200;
  } else {
    contents = errorPage();
    status = 404;
  }

  return new Response(contents, {
    status,
    headers: {
      'content-type': 'text/html',
    },
  });
});

app.post('/:id/save', async (req, params) => {
  const id = params.id as string ?? '';
  const form = await req.formData();
  const paste = form.get('paste') as string;
  const headers = new Headers({
    'content-type': 'text/html',
  });

  if (id.trim().length === 0) {
    headers.set('location', '/');
  } else {
    await KV.set([id], paste);
    headers.set('location', '/' + id);
  }

  return new Response('302', {
    status: 302,
    headers,
  });
});

Deno.serve({ port: 8000 }, app.handler.bind(app));

function createSlug(text = '') {
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const slug = lines[i].toString().toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text

    if (slug.length > 0) return slug;
  }

  return '';
}
