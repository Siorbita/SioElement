import SioElement from '/sio/SioElement.js'
class SioDialog extends SioElement {
  static get properties () {
    return {
      closeControl: {
        default: false,
        attribute: true
      }
    }
  }
  static get styles () {
    return `
      @import url( 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined' );
      *{
        box-sizing: border-box;
      }
      dialog {
        border-radius: 5px;
        padding: 1em;
        box-shadow: rgba(6, 24, 44, 0.4) 0px 0px 0px 2px, rgba(6, 24, 44, 0.65) 0px 4px 6px -1px, rgba(255, 255, 255, 0.08) 0px 1px 0px inset;
        background-color: white;
        color: #21262c;
        position: relative;
      }
      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(15px);
        position: fixed; 
        overflow-y: scroll;
        overscroll-behavior: contain;
      }

    `
  }

  constructor () {
    super()
  }
  showModal () {
    this.shadowRoot.querySelector( 'dialog' ).showModal()
    document.body.setAttribute('inert','')
  }
  openModal () {
    this.showModal()
  }
  open(){
    this.showModal()
  }
  removeInert () {
    document.body.removeAttribute('inert')
  }
  closeModal () {
    this.closeDialog()
  }
  closeDialog () {
    this.shadowRoot.querySelector( 'dialog' ).close()
    this.removeInert()
    this.emit( 'close' )
  }
  close(){
    this.closeDialog()
  }
  render () {
    let close = this.closeControl ?
      this.html`
        <span class="material-symbols-outlined"  @click=${ this.closeDialog.bind( this ) }>
          close
        </span>` : ""
    return this.html`
      <dialog @close=${this.removeInert}>
        <slot></slot>
      </dialog>
    `
  }
}
SioDialog.define( 'sio-dialog' )
export default SioDialog