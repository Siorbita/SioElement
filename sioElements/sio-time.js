import SioElement from "/sio/SioElement.js"
class SioTime extends SioElement {
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
  static get props(){
    return {
      date:{
        type: Date,
        default: new Date(),
        attribute: true
      },
      format:{
        type: String,
        default: "YYYY-MM-DD HH:mm:ss",
        attribute: true
      },
    }
  }
  constructor(){
    super()
    this._internals = this.attachInternals()
  }
  render(){
    return this.html`
      ${this.date}
    `
  }
}
SioTime.define("sio-time")
export default SioTime