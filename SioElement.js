import { html, render } from "lit-html"
import { classMap } from "lit-html/directives/class-map.js"
import { styleMap } from "lit-html/directives/style-map.js"
import { unsafeHTML } from "lit-html/directives/unsafe-html.js"

// Define a base custom element class using lit-html for rendering
class SioElement extends HTMLElement {
  // Static method to define and register the custom element
  static define(name) {
    if (!name) {
      name = this.name
    }
    // Convert the class name to kebab-case for the custom element name
    name = name
      .replace(/^[A-Z]/, (letter) => letter.toLowerCase())
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
    // Register the custom element if it hasn't been defined yet
    if (!customElements.get(name)) {
      customElements.define(name, this)
    }
  }

  // Helper method to get the attribute name associated with a property
  static _getPropertyAttributeName(propName) {
    const properties = this.properties
    const prop = properties[propName]
    let dirtyName = propName
    if (!prop || !prop.attribute) {
      return null
    }
    const attribute = prop.attribute
    if (typeof attribute === 'string') {
      dirtyName = attribute
    }
    // Sanitize and convert the attribute name to kebab-case
    return dirtyName
      .replace(/\s/g, '_')
      .replace(/"/g, '')
      .replace(/\'/g, '')
      .replace(/>/g, '')
      .replace(/\//g, '')
      .replace(/=/g, '')
      .replace(/^[A-Z]/, (letter) => letter.toLowerCase())
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .toLowerCase()
  }

  // Define which attributes to observe for changes
  static get observedAttributes() {
    const list = []
    for (let prop in this.properties) {
      const attribute = this.properties[prop].attribute
      if (attribute) {
        list.push(this._getPropertyAttributeName(prop))
      }
    }
    return list
  }

  // Define the properties and their configurations
  static get properties() {
    return {}
  }

  // Internal variables to manage component state
  __styleElement = null;
  _updates = 0;
  _renders = 0;
  _propsInitialized = false;

  constructor() {
    super()
    // Expose lit-html utilities to the component instance
    this.html = html
    this.unsafeHTML = unsafeHTML
    this.classMap = classMap
    this.styleMap = styleMap
    this.root = this  // By default, render to the element itself
    this._initializeProperties()  // Initialize component properties
    // Create a style element for component-specific styles
    this.__styleElement = document.createElement("style")
    this.__styleElement.innerHTML = `
      ${this.constructor.styles || ''}
      :host([hidden]) {
        display: none;
      }
      :host([disabled]) {
        pointer-events: none;
      }
    `
    this.updateDebounce = null  // Debounce timer for updates
  }

  // Clean and validate property values based on their defined types
  _cleanProperty(prop, value) {
    const propData = this.constructor.properties[prop]
    if (!propData) {
      return value
    }
    // Convert value to the appropriate type
    if (propData.type === Boolean) {
      return parseBoolean(value)
    }
    if (propData.type === Number) {
      if (isNaN(value)) {
        return Number(propData.default) || 0
      }
      return Number(value)
    }
    if (propData.type === String) {
      return String(value)
    }
    return value  // Return the value as-is for other types
  }

  // Initialize component properties and set up getters and setters
  _initializeProperties() {
    const properties = this.constructor.properties
    for (let prop in properties) {
      // Define getters and setters for each property
      Object.defineProperty(this, prop, {
        get() {
          return this[`_${prop}`]
        },
        set(value) {
          const oldValue = this[`_${prop}`]
          // Clean the property value before setting
          this[`_${prop}`] = this._cleanProperty(prop, value)
          if (this._propsInitialized) {
            // Trigger property change callback if properties have been initialized
            this.propertyChangedCallback(prop, oldValue, value)
          }
        }
      })
      const attributeName = this.constructor._getPropertyAttributeName(prop)
      if (this.hasAttribute(attributeName)) {
        // Initialize property from attribute value if present
        this[prop] = this._cleanProperty(prop, this.getAttribute(attributeName))
      } else {
        if (this[prop] === undefined) {
          // Set default value if property is undefined
          this[prop] = properties[prop].default
        }
        if (properties[prop].attribute) {
          // Reflect property value to attribute if necessary
          this._updateAttribute(prop)
        }
      }
    }
    this._propsInitialized = true  // Mark properties as initialized
  }

  // Reflect property value changes back to the corresponding attribute
  _updateAttribute(prop) {
    const propertyData = this.constructor.properties[prop]
    if (propertyData && propertyData.attribute) {
      const attributeName = this.constructor._getPropertyAttributeName(prop)
      const value = this[prop]
      if (value === false || value === null || value === undefined) {
        // Remove attribute if value is falsy
        this.removeAttribute(attributeName)
      } else {
        // Set or update attribute with the current property value
        this.setAttribute(attributeName, value)
      }
    }
  }

  // Get the property name corresponding to a given attribute name
  _getPropertyNameFromAttribute(attributeName) {
    const properties = this.constructor.properties
    for (let prop in properties) {
      const propAttr = this.constructor._getPropertyAttributeName(prop)
      if (propAttr === attributeName) {
        return prop
      }
    }
    return null
  }

  // Render content into a specified parent node
  __drawToParent(content, parent) {
    return render(content, parent)
  }

  // Render content into the component's root (shadow DOM or light DOM)
  __drawContentToRoot(content) {
    return this.__drawToParent(content, this.root)
  }

  // Main update lifecycle method
  async _update() {
    this._updates++
    if (this._updates === 1) {
      // Call init() method once before the first update, if defined
      if (typeof this.init === "function") {
        await this.init()
      }
    }
    if (typeof this.update === "function") {
      // Call update() hook before rendering
      const res = await this.update()
      if (res === false) {
        // Exit update cycle if update() returns false
        return
      }
    }
    if (this._updates === 1) {
      // Call firstUpdated() after the first update
      if (typeof this.firstUpdated === "function") {
        this.firstUpdated()
      }
    }
    this._render()  // Render the component

    if (typeof this.updated === "function") {
      // Call updated() hook after each update
      this.updated()
    }
    this.emit("updated")  // Emit an 'updated' event
  }

  // Render the component's template and styles
  _render() {
    const data = [this.__styleElement]  // Include the style element
    if (typeof this.render === "function") {
      // Add the rendered template to the content
      data.push(this.render())
    }
    this.__drawContentToRoot(data)  // Render content to the root
    this._renders++
    if (this._renders === 1) {
      // Call firstRender() after the first render
      if (typeof this.firstRender === "function") {
        this.firstRender()
      }
    }
    if (typeof this.rendered === "function") {
      // Call rendered() hook after each render
      this.rendered()
    }
    if (typeof this.afterRender === "function") {
      // Call afterRender() hook if defined (for backward compatibility)
      this.afterRender()
    }
  }

  // Emit a custom event from the component
  emit(name, data) {
    const event = new CustomEvent(name, { detail: data, bubbles: true, composed: true })
    this.dispatchEvent(event)
    return event
  }

  // Request a component update, debouncing multiple requests
  async requestUpdate() {
    if (this.updateDebounce) {
      clearTimeout(this.updateDebounce)
    }
    this.updateDebounce = setTimeout(async () => {
      this.emit("updateRequested")  // Emit an 'updateRequested' event
      await this._update()  // Perform the update
    }, 0)
  }

  // Callback for when an observed attribute changes
  attributeChangedCallback(attributeName, oldValue, newValue) {
    const prop = this._getPropertyNameFromAttribute(attributeName)
    const propData = this.constructor.properties[prop]
    if (propData.type === Boolean) {
      newValue = newValue === null ? false : true
    }
    if (!propData) return
    // Update the property value based on the new attribute value
    this[prop] = this._cleanProperty(prop, newValue)
  }

  // Callback for when a property changes
  async propertyChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (typeof this.propertyChanged === "function") {
        // Call propertyChanged() hook if defined
        await this.propertyChanged(name, oldValue, newValue)
      }
      this._updateAttribute(name)  // Reflect the property change to the attribute
      this.requestUpdate()  // Request a component update
    }
  }

  // Callback for when the component is added to the DOM
  connectedCallback() {
    // Attach a shadow DOM if the component is not configured to use light DOM
    if (!this.constructor.notShadowed && !this.shadowRoot) {
      this.root = this.attachShadow({ mode: "open" })
    }
    this.emit("connected")  // Emit a 'connected' event
    this.requestUpdate()  // Request an initial update
  }
}

// Helper function to parse boolean attribute values
function parseBoolean(value) {
  return ![false, "false", "0", 0, "no", "n", "off", "disabled", "undefined", "null", "NaN", ""].includes(value)
}

export default SioElement
export { html, unsafeHTML, render, classMap, styleMap }