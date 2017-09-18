(function() {
  var commentTextarea = document.querySelector('.write-comment textarea');

  if (commentTextarea) {
    function onInput() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    }

    commentTextarea.addEventListener('input', onInput, false);

    onInput.call(commentTextarea);
  }
}())