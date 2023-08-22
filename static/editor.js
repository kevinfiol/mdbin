(() => {
  const cmEl = document.getElementById('editor');
  const textArea = document.getElementById('paste');
  const editorTab = document.getElementById('tab1');
  const editorForm = document.getElementById('editor-form');

  // hide paste textarea
  textArea.style.display = 'none';

  const editor = new CodeMirror(cmEl, {
    mode: 'markdown',
    value: textArea.value,
    keymap: 'sublime',
    theme: 'material'
  });

  // set onChange to update text area with editor text
  // this is helpful for persistence across page reloads & 
  const onChange = debounce((instance) => {
    textArea.value = instance.getValue();
  }, 1500);

  editor.on('change', onChange);

  // set event listener to refresh editor on tab select
  editorTab.addEventListener('click', () => {
    editor.refresh();
  });

  // override form submit
  editorForm.addEventListener('submit', (ev) => {
    ev.preventDefault();

    // set textarea to ensure it is up to date
    textArea.value = editor.getValue();

    editorForm.submit();
  });

  function debounce(cb, wait) {
    let timer;

    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => cb(...args), wait);
    };
  }
})();