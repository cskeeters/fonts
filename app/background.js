chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('font_index.html', {
    'width': 1100,
    'height': 800
  });
});
