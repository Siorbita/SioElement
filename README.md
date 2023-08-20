# SioElement - Custom Web Component Base Class

SioElement is a lightweight base class for creating custom web components using Lit HTML. It provides a set of features and patterns to simplify the process of building and managing web components with attributes, properties, rendering, and lifecycle events.


## Installation

Install SioElement from NPM:

```bash
npm install sioelement
```


## Usage

If you are using express, add the route /sio/SioElement.js the express middleware:

```javascript
import app from 'express'
import sioElement from 'SioElement/express'
sioElement(app)
```

If you are using another framework, add the route /sio/SioElement.js to your routes:

```javascript
import sioElement from 'SioElement/express'
app.get('/sio/SioElement.js', sioElement)
```

Then, import sio/SioElement.js in your custom element class:



## Make Hello World Component

```javascript
import SioElement from '/sio/SioElement.js'
class HelloWorld extends SioElement {
    static get styles(){
      return `
          :host {
              display: block;
              padding: 1em;
              background: #eee;
          }
      `
    }
    static get properties() {
        return {
            text: { type: String, attribute: true }
        };
    }

    render() {
        return this.html`
            <p>${this.text}</p>
        `;
    }
}

HelloWorld.define('hello-world');

```

## Lifecycle Hooks

SioElement provides several lifecycle hooks for customization:

- constructor(): Called once after the first render. Remember to call super() in your constructor.
- async init(): Called before the first render. Use it to load the component initial state, it can be an async function.
- async firstUpdated(): Called after the first render and updates. Use it to load the component initial state, it can be an async function.
- async updated(): Called after every update. Use it to load the component initial state, it can be an async function.
- async updateRequested(): Called before each update. Use it to load the component initial state, it can be an async function.
- attributeChangedCallback(name, oldValue, newValue): Reacts to attribute changes.
- propertyChangedCallback(name, oldValue, newValue): Reacts to property changes.
- disconnectedCallback(): Called when the component is removed from the DOM.
- connectedCallback(): Called when the component is added to the DOM.
- render(): Called to render the component. It must return a this.html`` template literal. The content of the template literal is rendered using Lit HTML.

## Properties

SioElement provides a set of features to simplify the process of building and managing web components with attributes, properties, rendering, and lifecycle events.

### Properties Declaration

Declare the properties of your component using the static get properties() method:

```javascript
static get properties() {
    return {
        text: { type: String, attribute: true, default: 'Your default data for the property' }
    };
}
```

The properties() method must return an object with the properties of your component. Each property is defined by a key-value pair, where the key is the name of the property and the value is an object with the following properties:

- type: The type of the property. It can be String, Number, Boolean, Object, Array, or Date.
- attribute: If true, the property is synchronized with an attribute with the same name. If false, the property is not synchronized with an attribute. If the attribute is not defined, the property is not synchronized with an attribute.
- default: The default value of the property. If the property is not defined, the default value is undefined.

Each time a property is updated, the propertyChangedCallback() method is called. If the property is synchronized with an attribute, the attributeChangedCallback() method is also called, and then the requestUpdate() method is called to request an update.

## Manual Request Update

You can request an update using the requestUpdate() method:

```javascript
this.requestUpdate()
```

The requestUpdate() method calls the updateRequested() method before each update, and then calls the updated() method after each update.

## Lit html exposed imports

SioElement exposes the following Lit HTML imports:

- html: The html template literal tag.
- unsafeHTML: The unsafeHTML template literal tag.
- render: The render() method.
- classMap: The classMap() method.
- styleMap: The styleMap() method.
- Directive: The Directive class.
- directive: The directive() method.
- AsyncDirective: The AsyncDirective class.

Use them by importing them from SioElement:

```javascript
import { html, unsafeHTML, render, classMap, styleMap, Directive, directive, AsyncDirective } from '/sio/SioElement.js'
```