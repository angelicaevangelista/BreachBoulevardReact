(function () {
  var t;
  try {
    t = localStorage.getItem('bb.theme');
  } catch (e) {}
  if (t !== 'light' && t !== 'dark')
    t =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark';
  document.documentElement.dataset.theme = t;
  document.documentElement.style.colorScheme = t;
})();
