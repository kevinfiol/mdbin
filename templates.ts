const layout = (content: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="description" content="pastebin" >
    <link rel="stylesheet" href="main.css">
    <title>
      pastebin
    </title>
  </head>
  <body>
    <main>
      ${content}
    </main>
  </body>
  </html>
`;

export const homePage = ({
  paste = '',
  url = '',
  errors = { url: '' }
} = {}) => layout(`
  <form method="post" action="/save">
    <textarea name="paste" required>${paste}</textarea>

    <input
      name="url"
      type="text"
      placeholder="custom url"
      minlength="3"
      maxlength="40"
      value="${url}"
      aria-invalid="${Boolean(errors.url)}"
      ${errors.url ? 'aria-describedby="url-error"' : ''}
    />
    ${errors.url ? `
      <strong id="url-error">${errors.url}</strong>
    ` : ''}

    <button type="submit">
      save
    </button>
  </form>
`);

export const pastePage = ({ html = '' } = {}) => layout(`
  <div class="paste">
    ${html}
  </div>
`)

export const errorPage = () => layout(`
  <p>404</p>
`);