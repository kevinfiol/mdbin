const layout = (content: string) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <meta name="description" content="pastebin" >
    <link rel="stylesheet" href="codemirror.min.css">
    <link rel="stylesheet" href="main.css">
    <title>
      pastebin
    </title>
  </head>
  <body>
    ${content}
  </body>
  </html>
`;

export const homePage = ({
  paste = '',
  url = '',
  errors = { url: '' }
} = {}) => layout(`
  <main>
    <input type="radio" name="tabs" id="tab1" class="tab-input" checked />
    <label for="tab1">Editor</label>
    <input type="radio" name="tabs" id="tab2" class="tab-input" />
    <label for="tab2">Preview</label>

    <form method="post" action="/save">
      <div class="tab tab-editor">
        <textarea id="paste" name="paste" required>${paste}</textarea>
        <div id="editor"></div>
      </div>

      <div class="tab tab-preview">
        sup
      </div>

      <input
        name="url"
        type="text"
        placeholder="custom url"
        minlength="3"
        maxlength="40"
        value="${url}"
        pattern=".*\\S+.*"
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
  </main>
`);

export const pastePage = ({ html = '' } = {}) => layout(`
  <main>
    <div class="paste">
      ${html}
    </div>
  </main>
`)

export const errorPage = () => layout(`
  <p>404</p>
`);