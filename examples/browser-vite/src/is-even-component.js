import isEven from 'is-even';

const template = document.createElement('template');

template.innerHTML = `<div>
<label>number <input id="input" type="number" /></label>
</div>`;

class IsEvenComponent extends HTMLElement {
  get value() {
    const inputValue = this.shadowRoot.getElementById('input').value;
    return inputValue !== void 0 ? Number(inputValue) : 0;
  }

  set value(val) {
    this.shadowRoot.getElementById('input').value = Number(val);
  }

  get isEven() {
    return isEven(this.value) === true;
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.value = 2;
  }
}

customElements.define('is-even', IsEvenComponent);

export default IsEvenComponent;
