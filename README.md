# SioElement - Custom Web Component Base Class

SioElement is a lightweight base class for creating custom web components using Lit HTML. It provides a set of features and patterns to simplify the process of building and managing web components with attributes, properties, rendering, and lifecycle events.

## Installation

You can install `SioElement` via npm:

```bash
npm install lit-html sioelement
```

### Using with Module Bundlers

If you're using a module bundler like webpack or Rollup, you can import `SioElement` directly:

```javascript
import SioElement from 'sioelement';
```

### Using in the Browser with Express and `sio-moduler`

If you're serving modules directly in the browser and using Express, you can set up a route using `sio-moduler`:

```javascript
import express from 'express';
import moduler from 'sio-moduler';

const app = express();

app.use('/modules', moduler(['sioelement']));
```

Then, in your custom element file:

```javascript
// MyElement.js
import SioElement from '/modules/sioelement/SioElement.js';

class MyElement extends SioElement {
    // ...
}
```

### Alternative: Using a CDN

You can also use `SioElement` via a CDN:

```html
<script type="module">
  import SioElement from 'https://unpkg.com/sioelement/SioElement.js';

  class MyElement extends SioElement {
    // ...
  }
</script>
```

## Usage

### Creating a "Hello World" Component

Here's how you can create a simple "Hello World" custom element using `SioElement`:

```javascript
// hello-world.js
import SioElement from '/modules/sioelement/SioElement.js';

class HelloWorld extends SioElement {
    static properties = {
        text: { type: String, attribute: true, default: 'Hello, World!' },
    };

    static styles = `
        :host {
            display: block;
            padding: 1em;
            background: #eee;
            font-family: sans-serif;
        }
    `;

    render() {
        return this.html`<p>${this.text}</p>`;
    }
}

HelloWorld.define('hello-world');
```

**Using the Component in HTML:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World Component</title>
  <script type="module" src="/path/to/hello-world.js"></script>
</head>
<body>
  <hello-world text="Welcome to SioElement!"></hello-world>
</body>
</html>
```

## Lifecycle Hooks

`SioElement` provides several lifecycle hooks for customization:

- **constructor()**: Called when the element is created. Remember to call `super()` as the first line in your constructor.
- **async init()**: Invoked before the first render. Use it to perform any asynchronous setup tasks.
- **connectedCallback()**: Called when the element is inserted into the DOM. Use it to set up event listeners or perform setup that requires the element to be in the document.
- **disconnectedCallback()**: Called when the element is removed from the DOM. Use it to clean up any resources or event listeners.
- **attributeChangedCallback(name, oldValue, newValue)**: Called when any observed attribute changes. Use it to respond to changes in attribute values.
- **propertyChangedCallback(name, oldValue, newValue)**: Similar to `attributeChangedCallback`, but for properties.
- **async requestUpdate()**: Call this method to schedule an update to the element's rendering. It ensures updates are batched efficiently.
- **async update()**: Called before rendering. Use it to make preparations before the DOM is updated.
- **render()**: Defines the element's DOM representation. It must return a `this.html\\`` template literal, which `lit-html` will render.
- **async firstUpdated()**: Called after the first render. Use it for one-time initializations that require the DOM to be rendered.
- **async updated()**: Called after each render. Use it to perform post-update tasks.

**Example Usage of Lifecycle Hooks:**

```javascript
class LifecycleDemo extends SioElement {
  static properties = {
    count: { type: Number, attribute: true, default: 0 },
  };

  constructor() {
    super();
    console.log('Constructor called');
  }

  async init() {
    console.log('Init called');
    // Perform any asynchronous initialization here
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('Connected to the DOM');
    this.interval = setInterval(() => {
      this.count++;
    }, 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    console.log('Disconnected from the DOM');
    clearInterval(this.interval);
  }

  render() {
    return this.html`<p>Count: ${this.count}</p>`;
  }

  updated() {
    console.log('Updated');
  }
}

LifecycleDemo.define('lifecycle-demo');
```

## Properties and Attributes

`SioElement` simplifies property and attribute management for custom elements.

### Defining Properties

Properties are defined using a static `properties` getter:

```javascript
class MyElement extends SioElement {
  static properties = {
    propName: { type: String, attribute: true, default: 'default value' },
    isActive: { type: Boolean, attribute: true, default: false },
    count: { type: Number, attribute: true, default: 0 },
  };
}
```

- **type**: The data type of the property (e.g., String, Number, Boolean). This helps with type conversion.
- **attribute**: If `true`, the property will be reflected as an attribute on the element, and attribute changes will update the property.
- **default**: The default value of the property.

### Property and Attribute Reflection

- Changing a property programmatically updates the attribute (if `attribute: true`).
- Updating an attribute in HTML or via `setAttribute()` updates the corresponding property.

**Example:**

```javascript
class ToggleButton extends SioElement {
  static properties = {
    active: { type: Boolean, attribute: true, default: false },
  };

  render() {
    return this.html`<button @click="${this.toggle}">${this.active ? 'Active' : 'Inactive'}</button>`;
  }

  toggle() {
    this.active = !this.active;
  }
}

ToggleButton.define('toggle-button');
```

In HTML:

```html
<toggle-button active></toggle-button>
```

## Conclusion

With `SioElement`, creating custom web components becomes streamlined and efficient. We encourage you to experiment with it, create your own components, and contribute improvements. 

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Additional Resources
- [Lit HTML Documentation](https://lit-html.polymer-project.org/)
- [Web Components Documentation](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [GitHub Repository](https://github.com/your/repo)