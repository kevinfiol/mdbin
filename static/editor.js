(() => {
  const cmEl = document.getElementById('editor');
  const pasteEl = document.getElementById('paste');

  // hide paste textarea
  pasteEl.style.display = 'none';

  console.log(pasteEl.value);
  const editor = new CodeMirror(cmEl, {
    mode: 'markdown',
    value: pasteEl.value,
    keymap: 'sublime',
    theme: 'ayu-dark'
  });

  // update text area with editor text
  editor.on('change', (instance) => {
    pasteEl.value = instance.getValue();
  });
})();