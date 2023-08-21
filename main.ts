import { uid } from './lib/uid.js';
import { marked } from './lib/marked.js';
import { Router } from './router.ts';
import { homePage, pastePage, errorPage } from "./templates.ts";

const KV = await Deno.openKv();

const MIMES: Record<string, string> = {
  css: 'text/css',
  js: 'text/javascript',
  ico: 'image/vnd.microsoft.icon',
  png: 'image/png'
};

const FILES: Record<string, string> = {
  '/main.css': await Deno.readTextFile('./static/main.css'),
  '/favicon.ico': ''
};

const app = new Router();

app.get('*', (req) => {
  const url = new URL(req.url);

  if (url.pathname in FILES) {
    const file = FILES[url.pathname];
    const ext = url.pathname.split('.')[1];
    const type = MIMES[ext];

    return new Response(file, {
      status: file.length > 0 ? 200 : 404,
      headers: {
        'content-type': type
      }
    });
  }
});

app.get('/', () =>
  new Response(homePage(), {
    status: 200,
    headers: { 'content-type': 'text/html' }
  })
);

app.post('/save', async (req) => {
  let status = 302;
  let contents = '';
  const headers = new Headers({
    'content-type': 'text/html'
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
        errors: { url: `url name unavailable: ${customUrl}` }
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
        (r: { value: string | null }) =>
          r.value !== null
      );
    }

    await KV.set([id], paste);
    status = 302;
    headers.set('location', '/' + id.trim());
  }

  return new Response(contents, {
    status,
    headers
  });
});

app.get('/:id', async (_req, params) => {
  let contents = '';
  let status = 200;
  const id = params.id as string ?? '';
  const res = await KV.get([id]);

  if (res.value !== null) {
    const html = marked.parse(res.value);
    contents = pastePage({ html });
    status = 200;
  } else {
    contents = errorPage();
    status = 404;
  }

  return new Response(contents, {
    status,
    headers: {
      'content-type': 'text/html'
    }
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

// function escapeHTML(str = '') {
//   const escapes = {
//     '&': '&amp;',
//     '<': '&lt;',
//     '>': '&gt;',
//     "'": '&#39;',
//     '"': '&quot;'
//   };

//   return str.replace(
//     /[&<>'"]/g,
//     (tag) => escapes[tag] || tag
//   );
// }