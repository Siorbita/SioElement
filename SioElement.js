import { html, unsafeHTML, render, classMap, styleMap, Directive, directive, AsyncDirective } from "https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js"

class SioElement extends HTMLElement {
  static define ( name ) {
    if ( !name ) {
      name = this.name
    }
    name = name.replace( /^[A-Z]/, letter => letter.toLowerCase() ).replace( /[A-Z]/g, letter => `-${ letter.toLowerCase() }` )
    if ( !customElements.get( name ) ) {
      customElements.define( name, this )
    }
  }
  static get observedAttributes () {
    let list = []
    for ( let prop in this.properties ) {
      if ( this.properties[ prop ].attribute ) {
        list.push( prop.toLowerCase() )
      }
    }
    return list
  }
  static get properties () {
    return {}
  }
  __styleElement = null
  __updates = 0
  constructor () {
    super()
    this.html = html
    this.unsafeHTML = unsafeHTML
    this.classMap = classMap
    this.styleMap = styleMap
    this.root = this
    for ( let prop in this.constructor.properties ) {
      const already = this[ prop ] || null
      const def = this.constructor.properties[ prop ].default || null
      const isAttribute = this.constructor.properties[ prop ].attribute
      if ( already ) {
        this[ `_${ prop }` ] = this[ prop ]
      } else if ( def ) {
        this[ `_${ prop }` ] = this.constructor.properties[ prop ].default
      } else {
        this[ `_${ prop }` ] = false
      }
      if ( isAttribute ) {
        if ( this[ `_${ prop }` ] ) {
          this.setAttribute( prop, this[ `_${ prop }` ] )
        } else {
          this.removeAttribute( prop )
        }
      }
      this.propertyChangedCallback( prop, null, this[ `_${ prop }` ] )
    }
    this.__styleElement = document.createElement( "style" )
    this.__styleElement.innerHTML = `
      ${ this.constructor.styles || '' }
      :host([hidden]){
        display:none;
      }
      :host([disabled]){
        pointer-events:none;
      }
    `
    for ( let key in this.constructor.properties ) {
      const prop= this.constructor.properties[ key ]
      Object.defineProperty( this, key, {
        get: () => this[ `_${ key }` ],
        set: ( value ) => {
          const prev = this[ `_${ key }` ]
          if(prop.type && typeof prop.type == "function"){
            value = prop.type( value )
          }
          if ( prev !== value ) {
            this[ `_${ key }` ] = value
            if ( prop.attribute ) {
              if ( value ) {
                this.setAttribute( key, value )
              } else {
                this.removeAttribute( key )
              }
            }
            this.propertyChangedCallback( key, prev, value )
          }
        }
      } )
    }
    this.updateDebounce = null
  }
  propertyChangedCallback ( name, oldValue, newValue ) {
    if ( oldValue !== newValue ) {
      this.requestUpdate()
    }
  }
  connectedCallback () {
    if ( !this.constructor.notShadowed ) {
      this.root = this.attachShadow( { mode: "open" } )
    }
    let attributes = this.constructor.observedAttributes
    for ( let attribute of attributes ) {
      let prop = Object.keys( this.constructor.properties ).find( prop => prop.toLowerCase() == attribute.toLowerCase() )
      const propData= this.constructor.properties[ prop ]
      if ( this.hasAttribute( attribute ) ) {
        if ( !this.getAttribute( attribute ) && propData.type == Boolean ) {
          this[ `_${ prop }` ] = true
        } else {
          this[ `_${ prop }` ] = this.getAttribute( attribute )
        }
      }
    }
    this.emit( "connected" )
    this.requestUpdate()
  }
  attributeChangedCallback ( name, oldValue, newValue ) {
    if ( newValue == "" ) {
      newValue = true
    }
    if ( oldValue !== newValue ) {
      let prop = Object.keys( this.constructor.properties ).find( prop => prop.toLowerCase() == name.toLowerCase() )
      const propData= this.constructor.properties[ prop ]
      if(propData.type && typeof propData.type == "function"){
        if(propData.type == Boolean){
          if([false,"false","0",0,"no","n","off","disabled","undefined","null","NaN",""].includes(newValue)){
            newValue = false
          }else{
            newValue = true
          }
        }
        newValue = propData.type( newValue )
      }
      this[ `${ prop }` ] = newValue
      this.propertyChangedCallback( prop, oldValue, newValue )
    }
  }
  __drawToParent ( content, parent ) {
    return render( content, parent )
  }
  __drawContentToRoot ( content ) {
    return this.__drawToParent( content, this.root )
  }
  emit ( name, data ) {
    let event = new CustomEvent( name, { detail: data } )
    this.dispatchEvent( event )
    return event
  }
  hasChanged ( oldValue, newValue ) {
    if ( oldValue !== newValue ) {
      this.requestUpdate()
    }
  }
  async requestUpdate () {
    if ( this.updateDebounce ) {
      clearTimeout( this.updateDebounce )
    }
    this.updateDebounce = setTimeout( async () => {
      this.emit( "updateRequested" )
      await this.__update()
    }, 0 )
  }
  async __update () {
    if ( typeof this.update == "function" ) {
      await this.update()
    }
    this.__render()
    this.__updates++
    if ( this.__updates == 1 ) {
      if ( typeof this.init == "function" ) {
        await this.init()
      }
      if ( typeof this.firstUpdated == "function" ) {
        this.firstUpdated()
      }
    } 
    if ( typeof this.updated == "function" ) {
      this.updated()
    }
    this.emit( "updated" )
  }
  __render () {
    let data = [ this.__styleElement ]
    if ( typeof this.render == "function" ) {
      data.push( this.render() )
    }
    this.__drawContentToRoot( data )
    this.emit( "rendered" )
  }
}
export default SioElement
export { html, unsafeHTML, render, classMap, styleMap, Directive, directive, AsyncDirective }