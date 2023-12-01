customElements.define('format-input', class extends HTMLElement {

    constructor() {
        super()
    }

    connectedCallback() {
        let o = this
        if (!o.stop) {
            o.stop = true
        } else {
            return
        }

        if (o.children.length) {
            o._init()
            return
        }

        // not yet available, watch it for init
        o._observer = new MutationObserver(o._init.bind(o))
        o._observer.observe(o, { childList: true })
    }

    handleEvent(e) {
        this[`on${e.type}`](e)
    }

    onfocus() {
        let o = this
        if (!o.view.validationMessage) {
            o.view.type = o._type
            o.view.value = o.input.value
        }
    }

    _setMessage() {
        let o = this
        let query = o.dataset.showInvalid
        if (query) {
            o.querySelector(query).textContent = o.view.validationMessage
        }
    }

    formatterWait = 1
    onblur() {
        let o = this
        if (document.activeElement === o.view) return
        o.view.setCustomValidity('')
        o._setMessage()
        if (!o.view.checkValidity()) {
            o._setMessage()
            return
        }
        if (!o.formatter) {
            return
        }
        let notValid = o.formatter?.isValid(o.view.value)
        if (notValid) {
            if (!o.inputListener) {
                o.inputListener = true
                o.view.addEventListener('input', o)
            }
            o.view.setCustomValidity(notValid)
            o._setMessage()
            return
        }
        o.input.value = o.view.value
        o.view.type = 'text'
        o.view.value = o.formatter.format(this.input.value)
    }

    onkeydown(e) {
        if (e.key === 'Enter') {
            this.input.value = this.view.value
        }
    }

    oninput() {
        let o = this
        if (!o.formatter) {
            return
        }

        let notValid = o.formatter?.isValid(o.view.value)
        if (!notValid) {
            o.view.setCustomValidity('')
            o.view.removeEventListener('input', o)
            o._setMessage()
        }
    }

    _init() {
        let o = this
        o._observer?.disconnect();
        o._observer = null;

        let format = o.dataset.format
        if (!format) return

        let view = o.view = o.querySelector('input')
        if (!view) return

        let input = o.input = view.cloneNode()

        view.addEventListener('focus', o)

        o._type = view.type
        view.type = 'text'
        view.removeAttribute('name')

        input.type = 'hidden'
        o.appendChild(input)
        o.addFormatter(format)
    }

    addFormatter(format, wait = 1) {
        let o = this
        o.timeoutId = setTimeout(() => {
            o.formatter =
                format?.split('.')
                .reduce((acc, val) => acc[val], window)
            if (!o.formatter) {
                o.addFormatter(format, wait * 2)
            } else {
                o.view.addEventListener('blur', o)
                o.view.addEventListener('keydown', o)
                o.onblur()
            }
        }, wait)
    }

    disconnectedCallback() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId)
        }
    }
});

