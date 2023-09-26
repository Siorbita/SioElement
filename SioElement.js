import { html, unsafeHTML, render, classMap, styleMap, Directive, directive, AsyncDirective } from "./lithtml.js"
import magicTrap from "./magicTrap.js"

const snakeToCamel=(str)=> {
  return str.toLowerCase().replace(/-([a-z])/g, function(match, letter) {
    return letter.toUpperCase();
  });
}
const camelToSnake=(str)=> {
  return str.replace(/([A-Z])/g, function(match, letter) {
    return '-' + letter.toLowerCase();
  }).toLowerCase();
}
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
        list.push( camelToSnake(prop) )
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
    this.props=magicTrap({})
    this.props.__onChange__(this,(prop,prev,value)=>{
      this.propertyChangedCallback(prop,prev,value)
    })
    this.reactives = magicTrap({})
    this.reactives.__onChange__(this,(prop,prev,value)=>{
      this.requestUpdate()
    })
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
    this.startProps()
    this.updateDebounce = null
  }
  propertyToAttribute ( name ) {
    const attributeName=camelToSnake(name)
    const propInfo=this.constructor.properties[ name ]
    if(this[ name ]==undefined) {
      this.removeAttribute( attributeName )
      return
    }
    if(propInfo.type==Boolean){
      if(this[ name ]){
        this.setAttribute( attributeName, "" )
      }else{
        this.removeAttribute( attributeName )
      }
      return
    }
    if ( this.constructor.properties[ name ].attribute ) {
      this.setAttribute( attributeName, this[ name ].toString() )
    }
  }
  startProps(){
    for ( let prop in this.constructor.properties ) {
      const propInfo = this.constructor.properties[ prop ]
      Object.defineProperty( this, prop, {
        get: () => this.props[prop],
        set: ( value ) => {
          const prev = this.props[prop]
          if(prev==value) return
          if(!propInfo.type){
            propInfo.type=(value)=>value
          }
          if(propInfo.type && typeof propInfo.type == "function"){
            try{
              value = propInfo.type( value )
            }catch(e){
              console.error(e)
              return
            }
          }
          if ( prev !== value ) {
            this.props[prop] = value
          }
          if([String,Number,Boolean].includes(propInfo.type)){
            this.propertyToAttribute( prop )
          }
        }
      } )
      this.props[prop]=propInfo.default
    }
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
    this.emit( "connected" )
    this.requestUpdate()
  }
  attributeChangedCallback ( name, oldValue, newValue ) {
    if(oldValue==newValue) return
    
    const propName=snakeToCamel(name)
    let prop = Object.keys( this.constructor.properties ).find( prop => prop.toLowerCase() == propName.toLowerCase() )
    const propData= this.constructor.properties[ propName ]
    if(propData.type==Boolean){
      if(this.hasAttribute(name)){
        newValue=true
        if(this.hasAttribute(name)=="false"){
          newValue=false
        }
      }else{
        newValue=false
      }
    }
    this[prop]=newValue
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