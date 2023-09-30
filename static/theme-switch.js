(({ cmEditor }) => {
  const darkSwitchId = 'darkSwitch';
  const darkSwitch = document.getElementById(darkSwitchId);

  const setMode = mode => {
    localStorage.setItem(darkSwitchId, mode);
    document.body.setAttribute('data-theme', mode);

    if (cmEditor) {
      cmEditor.setOption("theme", mode === 'd' ? 'material' : 'default');
    }
  };

  let mode = localStorage.getItem(darkSwitchId);
  if (mode) {
    darkSwitch.checked = mode === 'd';
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    mode = 'd';
  } else {
    mode = 'l';
  }

  setMode(mode);

  darkSwitch.addEventListener('change', () => {
    setMode(darkSwitch.checked ? 'd' : 'l');
  });
})(window);