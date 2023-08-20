import { uid } from './lib/uid.js';
import { marked } from './lib/marked.js';
import { indexPage, pastePage, errorPage } from "./templates.js";

const RESERVED = ['save'];
const kv = await Deno.openKv();
const css = await Deno.readTextFile('./main.css')

// // configure marked
// marked.use({
//   hooks: { preprocess: escapeHTML }
// });

Deno.serve(async (req) => {
  const url = new URL(req.url);

  let contents = '';

  const headers = new Headers({ 'content-type': 'text/html' });
  const init = { status: 404, headers };

  if (url.pathname === '/main.css') {
    contents = css;
    init.status = 200;
    init.headers.set('content-type', 'text/css');
  } else if (url.pathname === '/') {
    contents = indexPage();
    init.status = 200;
  } else if (url.pathname === '/save') {
    const form = await req.formData();
    const customUrl = form.get('url');
    const paste = form.get('paste');

    const slug = createSlug(customUrl);
    if (slug.length > 0) {
      const res = await kv.get([slug]);

      if (res.value !== null || RESERVED.includes(slug)) {
        init.status = 422;

        contents = indexPage({
          paste,
          url: customUrl,
          errors: { url: `url name unavailable: ${customUrl}` }
        });
      } else {
        await kv.set([slug], paste);
        init.status = 302;
        init.headers.set('location', '/' + slug.trim());
      }
    } else {
      let id;
      let exists = true;

      for (; exists;) {
        id = uid();
        exists = await kv.get([id]).then(r => r.value !== null);
      }

      await kv.set([id], paste);
      init.status = 302;
      init.headers.set('location', '/' + id.trim());
    }
  } else if (url.pathname.indexOf('.') < 0) {
    const id = url.pathname.slice(1);
    const res = await kv.get([id]);

    if (res.value !== null) {
      const html = marked.parse(res.value);
      contents = pastePage({ html });
      init.status = 200;
    } else {
      contents = errorPage();
      init.status = 404;
    }
  }

  console.log(`${init.status} - ${req.method} - ${url.pathname}`)
  return new Response(contents, init);
});

function createSlug(text) {
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
