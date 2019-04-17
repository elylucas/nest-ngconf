// @ts-check

function createButtons() {
  // @ts-ignore
  $('pre.hljs code').each((x, elem) => {
    const button = $('<button type="button">copy</button>');
    button.click(() => {
      button.text('copied!');
      setTimeout(() => button.text('copy'), 2000);
      copyToClipboard(elem);
    });

    $(elem)
      .parent()
      .before(button);
    $(elem).attr('id', `code-${x}`);
    console.log(elem);
  });
}
