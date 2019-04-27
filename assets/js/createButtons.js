// @ts-check

function createButtons() {
  // @ts-ignore
  // $('pre.hljs').each((x, elem) => {

  //   $(elem)
  //     .closest('p')
  //     .prev('p')
  //     .find('code')
  //     .addClass('file-path');
  // });

  $('p').each((x, elem) => {
    if (elem.innerText.startsWith('src/')) {
      let url = 'vscode://file/' +
        window.location.href
        .replace('file://', '')
        .replace('Guide.html', elem.innerText);


      $(elem).addClass('file-path');
      $(elem).click(() => {
        window.location.href = url;
      })
    }
  });

  $('p').has('copy-button').addClass('copy-button');
}

customElements.define(
  'copy-button',
  class extends HTMLElement {
    button;
    constructor() {
      super();

      // this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this.button = document.createElement('button');
      this.button.innerHTML = 'copy';
      this.button.onclick = () => {
        this.button.innerHTML = 'copied';
        setTimeout(() => (this.button.innerHTML = 'copy'), 2000);
        copyToClipboard(
          $(this)
            .closest('p')
            .prev('pre.hljs')
            .find('code')[0]
        );
      };
      this.prepend(this.button);
    }
  }
);
