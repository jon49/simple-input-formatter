# Simple Input Formatter

Format the input element to whatever you like and only submit the raw data.

Define your formatter:

```js
(() => {
    let USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }); 

    window.currency = {
        format(value) {
            return USDollar.format(value)
        },
        isValid(value) {
            return (isNaN(value))
                ? 'Must be a number'
            : ''
        }
    }
})()
```

Put on your HTML page:

```js
<form>
    <format-input data-format="currency">
        <input
            type="number"
            step="2"
            name="test"
            placeholder="Give me a number!">
    </format-input>
    <button>OK</button>
</form>
```

See the tests to see how it works!

