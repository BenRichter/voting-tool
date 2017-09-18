(function() {
  // Change height of textinput in new comment input based on value
  // ----------------------
  var commentTextarea = document.querySelector('.write-comment textarea');

  if (commentTextarea) {
    function onInput() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    }

    commentTextarea.addEventListener('input', onInput, false);

    onInput.call(commentTextarea);
  }


  // Only show focus styles to keyboard users
  function handleFirstTab(e) {
    if (e.code === 'Tab') {
      document.body.classList.remove('using-mouse');

      window.removeEventListener('keydown', handleFirstTab);
      window.addEventListener('mousedown', handleMouseDownOnce);
    }
  }

  function handleMouseDownOnce() {
    document.body.classList.add('using-mouse');

    window.removeEventListener('mousedown', handleMouseDownOnce);
    window.addEventListener('keydown', handleFirstTab);
  }

  window.addEventListener('mousedown', handleMouseDownOnce);
}())
