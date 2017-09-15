(function() {
  var newCommentTextarea = document.querySelector('.new-comment textarea');

  if (newCommentTextarea) {
    function onInput() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    }

    newCommentTextarea.addEventListener('input', onInput, false);
  }
}())
