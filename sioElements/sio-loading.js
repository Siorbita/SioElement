import SioElement from "/sio/SioElement.js"
class SioLoading extends SioElement {
  static get properties () {
    return {
    }
  }
  static get styles () {
    return `
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin-block-start: 1em;
        margin-block-end: 1em;
        --color-1: var(--sio-loading-color-1, #93dbe9);
        --color-2: var(--sio-loading-color-2, #689cc5);
        --color-3: var(--sio-loading-color-3, #5e6fa3);
        --color-4: var(--sio-loading-color-4, #3b4368);
      }
      svg {
        margin-block-end: 1em;
       
      }
      svg #first {
        fill: var(--color-1);
      }
      svg #second {
        fill: var(--color-2);
      }
      svg #third {
        fill: var(--color-3);
      }
      svg #fourth {
        fill: var(--color-4);
      }
    `
  }
  render(){
    return this.html`
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style=" display: block; shape-rendering: auto;" width="200px" height="200px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <g transform="translate(26.666666666666668,26.666666666666668)">
          <rect x="-20" y="-20" width="40" height="40" id="first">
            <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="-0.3s"></animateTransform>
          </rect>
        </g>
        <g transform="translate(73.33333333333333,26.666666666666668)">
          <rect x="-20" y="-20" width="40" height="40" id="second">
            <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="-0.2s"></animateTransform>
          </rect>
        </g>
        <g transform="translate(26.666666666666668,73.33333333333333)">
          <rect x="-20" y="-20" width="40" height="40" id="third">
            <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="0s"></animateTransform>
          </rect>
        </g>
        <g transform="translate(73.33333333333333,73.33333333333333)">
          <rect x="-20" y="-20" width="40" height="40" id="fourth">
            <animateTransform attributeName="transform" type="scale" repeatCount="indefinite" dur="1s" keyTimes="0;1" values="1.1500000000000001;1" begin="-0.1s"></animateTransform>
          </rect>
        </g>
      </svg>
      <slot></slot>
    `
  }
}
SioLoading.define("sio-loading")
export default SioLoading