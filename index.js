customElements.define('format-input', class extends HTMLElement {

    constructor() {
        super()
    }

    connectedCallback() {
        if (this.children.length) {
            this._init()
        }

        // not yet available, watch it for init
        this._observer = new MutationObserver(this._init.bind(this))
        this._observer.observe(this, { childList: true })
    }

    handleEvent(e) {
        this[`on${e.type}`](e)
    }

    onfocus() {
        if (!this.view.validationMessage) {
            this.view.type = this._type
            this.view.value = this.input.value
        }
    }

    _setMessage() {
        let query = this.dataset.showInvalid
        let message = this.view.validationMessage
        if (query && message) {
            this.querySelector(query).textContent = message
        } else if (query) {
            this.querySelector(query).innerHTML = '&nbsp;'
        }
    }

    formatterWait = 1
    onblur() {
        this.view.setCustomValidity('')
        this._setMessage()
        if (!this.view.checkValidity()) {
            this._setMessage()
            return
        }
        if (!this.formatter) {
            return
        }
        let notValid = this.formatter?.isValid(this.view.value)
        if (notValid) {
            if (!this.inputListener) {
                this.inputListener = true
                this.view.addEventListener('input', this)
            }
            this.view.setCustomValidity(notValid)
            this._setMessage()
            return
        }
        this.input.value = this.view.value
        this.view.type = 'text'
        this.view.value = this.formatter.format(this.input.value)
    }

    onkeydown(e) {
        if (e.key === 'Enter') {
            this.onblur()
        }
    }

    oninput() {
        if (!this.formatter) {
            return
        }

        console.log('input', this.view.value)
        let notValid = this.formatter?.isValid(this.view.value)
        if (!notValid) {
            this.view.setCustomValidity('')
            this.view.removeEventListener('input', this)
            this._setMessage()
        }
    }

    _init() {
        this._observer?.disconnect();
        this._observer = undefined;

        let format = this.dataset.format
        if (!format) return

        let view = this.view = this.querySelector('input')
        if (!view) return

        let input = this.input = view.cloneNode()

        view.addEventListener('focus', this)

        this._type = view.type
        view.type = 'text'
        view.removeAttribute('name')

        input.type = 'hidden'
        this.appendChild(input)
        this.addFormatter(format)
    }

    addFormatter(format, wait = 1) {
        this.timeoutId = setTimeout(() => {
            this.formatter =
                format?.split('.')
                .reduce((acc, val) => acc[val], window)
            if (!this.formatter) {
                this.addFormatter(format, wait * 2)
            } else {
                this.view.addEventListener('blur', this)
                this.view.addEventListener('keydown', this)
                this.onblur()
            }
        }, wait)
    }

    disconnectedCallback() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
        }
    }
});

