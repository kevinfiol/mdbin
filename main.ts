import { resolve } from 'std/path/mod.ts';
import { walk } from 'std/fs/mod.ts';
import { uid } from './lib/uid.js';
import { marked } from './lib/marked.js';
import { Router } from './router.ts';
import { editPage, errorPage, homePage, pastePage } from './templates.ts';

interface Paste {
  paste: string;
  editCode?: string;
}

const KV = await Deno.openKv();
const STATIC_ROOT = resolve('./static');
const FILES = new Map<string, string>();
const MIMES: Record<string, string> = {
  'js': 'text/javascript',
  'css': 'text/css',
};

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
    const [ext] = filepath.split('.').slice(-1);
    const contentType = MIMES[ext] ?? 'text/plain';
    const file = await Deno.open(filepath, { read: true });
    const readableStream = file.readable;
    return new Response(readableStream, {
      status: 200,
      headers: {
        'content-type': contentType,
      },
    });
  }
});

app.get('/', () => {
  return new Response(homePage(), {
    status: 200,
    headers: { 'content-type': 'text/html' },
  });
});

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

  let editCode: string | undefined = form.get('editcode') as string;
  if (typeof editCode === 'string') {
    editCode = editCode.trim() || undefined;
  }

  if (slug.length > 0) {
    const res = await KV.get<Paste>([slug]);

    if (res.value !== null) {
      status = 422;

      contents = homePage({
        paste,
        url: customUrl,
        errors: { url: `url name unavailable: ${customUrl}` },
      });
    } else {
      await KV.set([slug], { paste, editCode });
      status = 302;
      headers.set('location', '/' + slug.trim());
    }
  } else {
    let id = '';
    let exists = true;

    for (; exists;) {
      id = uid();
      exists = await KV.get<Paste>([id]).then(
        (r) => r.value !== null,
      );
    }

    await KV.set([id], { paste, editCode });
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
  const res = await KV.get<Paste>([id]);

  if (res.value !== null) {
    const { paste } = res.value;
    const html = marked.parse(paste);
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
  const res = await KV.get<Paste>([id]);

  if (res.value !== null) {
    const { editCode, paste } = res.value;
    const hasEditCode = Boolean(editCode);
    contents = editPage({ id, paste, hasEditCode });
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
  let contents = '302';
  let status = 302;

  const id = params.id as string ?? '';
  const form = await req.formData();
  const paste = form.get('paste') as string;
  let editCode: string | undefined = form.get('editcode') as string;
  if (typeof editCode === 'string') {
    editCode = editCode.trim() || undefined;
  }

  const headers = new Headers({
    'content-type': 'text/html',
  });

  if (id.trim().length === 0) {
    headers.set('location', '/');
  } else {
    const res = await KV.get<Paste>([id]);
    const existing = res.value as Paste;
    const hasEditCode = Boolean(existing.editCode);

    if (
      hasEditCode &&
      existing.editCode !== editCode
    ) {
      // editCode mismatch
      status = 400;
      contents = editPage({
        id,
        paste,
        hasEditCode,
        errors: { editCode: 'invalid edit code' },
      });
    } else {
      await KV.set([id], { ...existing, paste });
      headers.set('location', '/' + id);
    }
  }

  return new Response(contents, {
    status,
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
