customElements.define('format-input', class extends HTMLElement {

    constructor() { super() }

    connectedCallback() {
        if (this.children.length) {
            this._init()
        }

        // not yet available, watch it for init
        this._observer = new MutationObserver(this._init.bind(this))
        this._observer.observe(this, { childList: true })
    }

    _init() {
        this._observer?.disconnect();
        this._observer = undefined;

        let format = this.dataset.format
        if (!format) return

        let view = this.view = this.querySelector('input')
        if (!view) return

        let input = this.input = view.cloneNode()

        view.addEventListener('focus', this.edit.bind(this))

        view.type = 'text'
        view.removeAttribute('name')

        input.type = 'hidden'
        this.appendChild(input)
        this.addFormatter(format)
    }

    addFormatter(format, wait = 1) {
        setTimeout(() => {
            this.formatter =
                format?.split('.')
                .reduce((acc, val) => acc[val], window)
            if (!this.formatter) {
                this.addFormatter(format, wait * 2)
            } else {
                this.view.addEventListener('blur', this.format.bind(this))
                this.format()
            }
        }, wait)
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
        this.view.value = this.formatter.format(this.input.value)
    }

    disconnectedCallback() {
        this.view.removeEventListener('focus', this.edit.bind(this))
        this.view.removeEventListener('blur', this.format.bind(this))
    }
});

