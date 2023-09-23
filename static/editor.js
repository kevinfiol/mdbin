(({ marked }) => {
  const cmEl = document.getElementById('editor');
  const textArea = document.getElementById('paste');
  const editorTab = document.getElementById('tab1');
  const editorForm = document.getElementById('editor-form');
  const preview = document.getElementById('preview');
  const previewTab = document.getElementById('tab2');

  // onload, reset to editorTab since we can't be sure preview tab will be populated
  editorTab.click();

  // hide paste textarea
  textArea.style.display = 'none';

  const editor = new CodeMirror(cmEl, {
    mode: 'markdown',
    value: textArea.value,
    keymap: 'sublime',
    theme: 'material'
  });

  // set onChange to update text area with editor text
  // this is helpful for persistence across page reloads
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

  // populate preview tab when activating it
  previewTab.addEventListener('change', () => {
    preview.innerHTML = marked.parse(editor.getValue());
  });

  function debounce(cb, wait) {
    let timer;

    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => cb(...args), wait);
    };
  }
})(window);