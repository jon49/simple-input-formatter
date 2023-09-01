(() => {

    customElements.define('format-input', class extends HTMLElement {

        constructor() { super() }

        connectedCallback() {
            if (this.children.length) {
                this._init();
                return;
            }

            // not yet available, watch it for init
            this._observer = new MutationObserver(this._init.bind(this));
            this._observer.observe(this, { childList: true });
        }

        _init() {
            this._observer?.disconnect();
            this._observer = undefined;

            let format = this.dataset.format
            if (!format) return

            let input = this.input = this.querySelector('input')
            if (!input) return

            this.formatter =
                format?.split('.')
                .reduce((acc, val) => acc[val], window)

            let view = this.view = input.cloneNode()
            view.type = 'text'
            view.name = ''

            view.addEventListener('focus', this.edit.bind(this))
            view.addEventListener('blur', this.format.bind(this))

            this.format()

            input.type = 'hidden'
            this.appendChild(view)
        }

        edit() {
            this.view.value = this.input.value
        }

        format() {
            let notValid = this.formatter.isValid(this.view.value)
            if (notValid) {
                this.view.setCustomValidity(notValid)
                return
            } else {
                this.view.setCustomValidity('')
            }
            this.input.value = this.view.value
            this.view.value = this.formatter.format(this.view.value)
        }

        disconnectedCallback() {
            this.view.removeEventListener('focus', this.edit.bind(this))
            this.view.removeEventListener('blur', this.format.bind(this))
        }
    });

})()

