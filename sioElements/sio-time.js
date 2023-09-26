import SioElement from "/sio/SioElement.js"
class SioTime extends SioElement {
  static formAssociated = true
  static get styles () {
    return `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin-block-start: 1em;
        margin-block-end: 1em;
      }
      svg {
        margin-block-end: 1em;
      }
    `
  }
  static get properties(){
    return {
      step:{
        type: Number,
        default: 60,
        attribute: true
      }
    }
  }
  constructor(){
    super()
    this._internals = this.attachInternals()
    this._internals.ariaRole = "time"
    this._internals.setFormValue("")
    this._value=null
  }
  set value(val){
    let newValue = val
    if(!val) {
      newValue = ""
    }else if(!isNaN(val)){
      if(val==0){
        newValue = 24*3600
      }if(val<0){
        val = 0
      }
      newValue = val
    }else if(typeof val === "string"){
      const parts = val.split(":")
      const hours = parseInt(parts[0])%24
      const minutes = parseInt(parts[1])%60
      newValue = (hours*3600)+(minutes*60)
    }
    if(newValue==this._value){
      return
    }
    this._value = newValue
    this._internals.setFormValue(this._value,this.userFriendlyValue(this._value))
    this.shadowRoot.querySelector("input").value=this.userFriendlyValue(this._value)
    this.emit("change",this.value)
  }
  get value(){
    return this.userFriendlyValue(this._value)
  }

  addMinutes(minutes=1){
    if(!this._value){
      this._value = 0
    }
    this.value = parseInt(this._value) + parseInt(minutes)*60
  }
  userFriendlyValue(value){
    if(!value){
      return ""
    }
    let hours = Math.floor(value / 3600)%24
    let minutes = Math.floor((value - (hours * 3600)) / 60)%60
    let strHours=hours.toString().padStart(2,"0")
    let strMinutes=minutes.toString().padStart(2,"0")
    return `${strHours}:${strMinutes}`
  }

  _emitInput(){
    this.emit("input",this.shadowRoot.querySelector("input").value)
  }
  _onkeydown(e){
    if(["tab","enter","f1","f2","f5"].includes(e.key.toLowerCase())) {
      return
    }
    e.preventDefault()
    if(["backspace","delete","escape"].includes(e.key.toLowerCase())) {
      this.value = ""
      this._emitInput()
      return
    }
    if(["arrowup"].includes(e.key.toLowerCase())) {
      this.addMinutes(this.step)
      this._emitInput()
      return
    }
    if(["arrowdown"].includes(e.key.toLowerCase())) {
      this.addMinutes(-this.step)
      this._emitInput()
      return
    }
    if(isNaN(parseInt(e.key))){
      return
    }
    const currentInput = this.shadowRoot.querySelector("input").value
    let tempValue = currentInput + e.key
    if(tempValue.length>5){
      tempValue = e.key
    }
    if(tempValue.length==1){
      if(parseInt(tempValue)>2){
        tempValue=`0${tempValue}:`
      }
    }
    if(tempValue.length==2){
      tempValue=`${tempValue}:`
    }
    if(tempValue.length==4){
      const lastChar = tempValue.slice(-1)
      if(parseInt(lastChar)>5){
        tempValue = `${tempValue.slice(0, -1)}0${lastChar}`
      }
    }
    this.shadowRoot.querySelector("input").value=tempValue
    if(tempValue.length<5){
      this._emitInput()
      return
    }
    const parts = tempValue.split(":")
    const hours = parseInt(parts[0])%24
    const minutes = parseInt(parts[1])%60
    this.value = (hours*3600)+(minutes*60)
    this._emitInput()
  }
  render(){
    return this.html`
      <input inputmode="numeric"
        @keydown=${this._onkeydown.bind(this)}
      >
    `
  }
}
SioTime.define("sio-time")
export default SioTime