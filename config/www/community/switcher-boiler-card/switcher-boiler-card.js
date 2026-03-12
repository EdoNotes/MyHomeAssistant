function t(t,e,s,i){var o,n=arguments.length,r=n<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,s):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,s,i);else for(var a=t.length-1;a>=0;a--)(o=t[a])&&(r=(n<3?o(r):n>3?o(e,s,r):o(e,s))||r);return n>3&&r&&Object.defineProperty(e,s,r),r}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e=globalThis,s=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),o=new WeakMap;let n=class{constructor(t,e,s){if(this._$cssResult$=!0,s!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(s&&void 0===t){const s=void 0!==e&&1===e.length;s&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),s&&o.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const s=1===t.length?t[0]:e.reduce(((e,s,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[i+1]),t[0]);return new n(s,t,i)},a=s?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,i))(e)})(t):t
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:u,getPrototypeOf:p}=Object,f=globalThis,m=f.trustedTypes,g=m?m.emptyScript:"",_=f.reactiveElementPolyfillSupport,b=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let s=t;switch(e){case Boolean:s=null!==t;break;case Number:s=null===t?null:Number(t);break;case Object:case Array:try{s=JSON.parse(t)}catch(t){s=null}}return s}},$=(t,e)=>!l(t,e),y={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:$};Symbol.metadata??=Symbol("metadata"),f.litPropertyMetadata??=new WeakMap;class x extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=y){if(e.state&&(e.attribute=!1),this._$Ei(),this.elementProperties.set(t,e),!e.noAccessor){const s=Symbol(),i=this.getPropertyDescriptor(t,s,e);void 0!==i&&c(this.prototype,t,i)}}static getPropertyDescriptor(t,e,s){const{get:i,set:o}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get(){return i?.call(this)},set(e){const n=i?.call(this);o.call(this,e),this.requestUpdate(t,n,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??y}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=p(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...d(t),...u(t)];for(const s of e)this.createProperty(s,t[s])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,s]of e)this.elementProperties.set(t,s)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const s=this._$Eu(t,e);void 0!==s&&this._$Eh.set(s,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const t of s)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const s=e.attribute;return!1===s?void 0:"string"==typeof s?s:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const s of e.keys())this.hasOwnProperty(s)&&(t.set(s,this[s]),delete this[s]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(s)t.adoptedStyleSheets=i.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const s of i){const i=document.createElement("style"),o=e.litNonce;void 0!==o&&i.setAttribute("nonce",o),i.textContent=s.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,s){this._$AK(t,s)}_$EC(t,e){const s=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,s);if(void 0!==i&&!0===s.reflect){const o=(void 0!==s.converter?.toAttribute?s.converter:v).toAttribute(e,s.type);this._$Em=t,null==o?this.removeAttribute(i):this.setAttribute(i,o),this._$Em=null}}_$AK(t,e){const s=this.constructor,i=s._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=s.getPropertyOptions(i),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=i,this[i]=o.fromAttribute(e,t.type),this._$Em=null}}requestUpdate(t,e,s){if(void 0!==t){if(s??=this.constructor.getPropertyOptions(t),!(s.hasChanged??$)(this[t],e))return;this.P(t,e,s)}!1===this.isUpdatePending&&(this._$ES=this._$ET())}P(t,e,s){this._$AL.has(t)||this._$AL.set(t,e),!0===s.reflect&&this._$Em!==t&&(this._$Ej??=new Set).add(t)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,s]of t)!0!==s.wrapped||this._$AL.has(e)||void 0===this[e]||this.P(e,this[e],s)}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(e)):this._$EU()}catch(e){throw t=!1,this._$EU(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Ej&&=this._$Ej.forEach((t=>this._$EC(t,this[t]))),this._$EU()}updated(t){}firstUpdated(t){}}x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[b("elementProperties")]=new Map,x[b("finalized")]=new Map,_?.({ReactiveElement:x}),(f.reactiveElementVersions??=[]).push("2.0.4");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const w=globalThis,A=w.trustedTypes,E=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",C=`lit$${Math.random().toFixed(9).slice(2)}$`,k="?"+C,P=`<${k}>`,O=document,T=()=>O.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,R=Array.isArray,H="[ \t\n\f\r]",M=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,N=/-->/g,z=/>/g,L=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),j=/'/g,I=/"/g,B=/^(?:script|style|textarea|title)$/i,D=(t=>(e,...s)=>({_$litType$:t,strings:e,values:s}))(1),V=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),F=new WeakMap,q=O.createTreeWalker(O,129);function J(t,e){if(!R(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const K=(t,e)=>{const s=t.length-1,i=[];let o,n=2===e?"<svg>":3===e?"<math>":"",r=M;for(let e=0;e<s;e++){const s=t[e];let a,l,c=-1,h=0;for(;h<s.length&&(r.lastIndex=h,l=r.exec(s),null!==l);)h=r.lastIndex,r===M?"!--"===l[1]?r=N:void 0!==l[1]?r=z:void 0!==l[2]?(B.test(l[2])&&(o=RegExp("</"+l[2],"g")),r=L):void 0!==l[3]&&(r=L):r===L?">"===l[0]?(r=o??M,c=-1):void 0===l[1]?c=-2:(c=r.lastIndex-l[2].length,a=l[1],r=void 0===l[3]?L:'"'===l[3]?I:j):r===I||r===j?r=L:r===N||r===z?r=M:(r=L,o=void 0);const d=r===L&&t[e+1].startsWith("/>")?" ":"";n+=r===M?s+P:c>=0?(i.push(a),s.slice(0,c)+S+s.slice(c)+C+d):s+C+(-2===c?e:d)}return[J(t,n+(t[s]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class Y{constructor({strings:t,_$litType$:e},s){let i;this.parts=[];let o=0,n=0;const r=t.length-1,a=this.parts,[l,c]=K(t,e);if(this.el=Y.createElement(l,s),q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=q.nextNode())&&a.length<r;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(S)){const e=c[n++],s=i.getAttribute(t).split(C),r=/([.?@])?(.*)/.exec(e);a.push({type:1,index:o,name:r[2],strings:s,ctor:"."===r[1]?tt:"?"===r[1]?et:"@"===r[1]?st:Q}),i.removeAttribute(t)}else t.startsWith(C)&&(a.push({type:6,index:o}),i.removeAttribute(t));if(B.test(i.tagName)){const t=i.textContent.split(C),e=t.length-1;if(e>0){i.textContent=A?A.emptyScript:"";for(let s=0;s<e;s++)i.append(t[s],T()),q.nextNode(),a.push({type:2,index:++o});i.append(t[e],T())}}}else if(8===i.nodeType)if(i.data===k)a.push({type:2,index:o});else{let t=-1;for(;-1!==(t=i.data.indexOf(C,t+1));)a.push({type:7,index:o}),t+=C.length-1}o++}}static createElement(t,e){const s=O.createElement("template");return s.innerHTML=t,s}}function Z(t,e,s=t,i){if(e===V)return e;let o=void 0!==i?s._$Co?.[i]:s._$Cl;const n=U(e)?void 0:e._$litDirective$;return o?.constructor!==n&&(o?._$AO?.(!1),void 0===n?o=void 0:(o=new n(t),o._$AT(t,s,i)),void 0!==i?(s._$Co??=[])[i]=o:s._$Cl=o),void 0!==o&&(e=Z(t,o._$AS(t,e.values),o,i)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:s}=this._$AD,i=(t?.creationScope??O).importNode(e,!0);q.currentNode=i;let o=q.nextNode(),n=0,r=0,a=s[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new G(o,o.nextSibling,this,t):1===a.type?e=new a.ctor(o,a.name,a.strings,this,t):6===a.type&&(e=new it(o,this,t)),this._$AV.push(e),a=s[++r]}n!==a?.index&&(o=q.nextNode(),n++)}return q.currentNode=O,i}p(t){let e=0;for(const s of this._$AV)void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,e),e+=s.strings.length-2):s._$AI(t[e])),e++}}class G{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,s,i){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Z(this,t,e),U(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>R(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(O.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:s}=t,i="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=Y.createElement(J(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new X(i,this),s=t.u(this.options);t.p(e),this.T(s),this._$AH=t}}_$AC(t){let e=F.get(t.strings);return void 0===e&&F.set(t.strings,e=new Y(t)),e}k(t){R(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let s,i=0;for(const o of t)i===e.length?e.push(s=new G(this.O(T()),this.O(T()),this,this.options)):s=e[i],s._$AI(o),i++;i<e.length&&(this._$AR(s&&s._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class Q{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,s,i,o){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=o,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=W}_$AI(t,e=this,s,i){const o=this.strings;let n=!1;if(void 0===o)t=Z(this,t,e,0),n=!U(t)||t!==this._$AH&&t!==V,n&&(this._$AH=t);else{const i=t;let r,a;for(t=o[0],r=0;r<o.length-1;r++)a=Z(this,i[s+r],e,r),a===V&&(a=this._$AH[r]),n||=!U(a)||a!==this._$AH[r],a===W?t=W:t!==W&&(t+=(a??"")+o[r+1]),this._$AH[r]=a}n&&!i&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class tt extends Q{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class et extends Q{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class st extends Q{constructor(t,e,s,i,o){super(t,e,s,i,o),this.type=5}_$AI(t,e=this){if((t=Z(this,t,e,0)??W)===V)return;const s=this._$AH,i=t===W&&s!==W||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,o=t!==W&&(s===W||i);i&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class it{constructor(t,e,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){Z(this,t)}}const ot=w.litHtmlPolyfillSupport;ot?.(Y,G),(w.litHtmlVersions??=[]).push("3.2.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
let nt=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,s)=>{const i=s?.renderBefore??e;let o=i._$litPart$;if(void 0===o){const t=s?.renderBefore??null;i._$litPart$=o=new G(e.insertBefore(T(),t),t,void 0,s??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}};nt._$litElement$=!0,nt.finalized=!0,globalThis.litElementHydrateSupport?.({LitElement:nt});const rt=globalThis.litElementPolyfillSupport;rt?.({LitElement:nt}),(globalThis.litElementVersions??=[]).push("4.1.1");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const at={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:$},lt=(t=at,e,s)=>{const{kind:i,metadata:o}=s;let n=globalThis.litPropertyMetadata.get(o);if(void 0===n&&globalThis.litPropertyMetadata.set(o,n=new Map),n.set(s.name,t),"accessor"===i){const{name:i}=s;return{set(s){const o=e.get.call(this);e.set.call(this,s),this.requestUpdate(i,o,t)},init(e){return void 0!==e&&this.P(i,void 0,t),e}}}if("setter"===i){const{name:i}=s;return function(s){const o=this[i];e.call(this,s),this.requestUpdate(i,o,t)}}throw Error("Unsupported decorator location: "+i)};function ct(t){return(e,s)=>"object"==typeof s?lt(t,e,s):((t,e,s)=>{const i=e.hasOwnProperty(s);return e.constructor.createProperty(s,i?{...t,wrapped:!0}:t),i?Object.getOwnPropertyDescriptor(e,s):void 0})(t,e,s)
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */}function ht(t){return ct({...t,state:!0,attribute:!1})}var dt=r`

  ha-card {
    display: flex;
    align-items: center;
    flex-direction: column;
    cursor: pointer;
    transition: background-color 0.2s ease;
    height: 100%;
  }

  .container {
      display: flex;
      flex-direction: column;
      flex: 1;
      width: 100%
  }

  .content {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-top: 9px;
      padding-bottom: 10px;
      padding-left: 9px;
      padding-right: 9px;
      flex: 1;
      box-sizing: border-box;
      //pointer-events: none;
      max-width: 100%;
      overflow: hidden;      
  }

  .controls {
      position: relative;
      display: flex;
      flex-direction: column;
      padding: 11px;
      padding-top: 0px;
      gap: 12px;
      width: 100%;
      //height: 100%;
      box-sizing: border-box;
      //justify-content: space-evenly;
  }

  .buttons-group {
    display: inline-flex;
    justify-content: space-between;
    width: 100%;
    gap: 12px;
  }

  .button {
    height: var(--feature-height, 42px);
    cursor: pointer;
    transition: background-color 180ms ease-in-out;
    text-align: center;
    flex: 1;
    -webkit-flex: 1;
    border: none;
    border-radius: var(--control-button-border-radius, 10px);
    //pointer-events: none;
    color: var(--primary-text-color);
    font-family: 'Roboto', sans-serif;
    font-weight: 500;
    font-size: 18px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .button .ripple {
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 1000ms ease-out;
      background-color: currentColor; /* Matches the text color or icon color */
      opacity: 0.08;
      pointer-events: none; /* Prevent interference with button click events */
  }

  @keyframes ripple-animation {
      to {
          transform: scale(30); /* Scale the ripple */
          opacity: 0; /* Fade out */
      }
  }

  .button.power.off {
    background-color: var(--grey-color);
  }

  .button.power.on {
    background-color: #F54436;
  }

  .combined-buttons {
    display: inline-flex;
    flex: 2;
    -webkit-flex: 2;
    gap: 0px;
    border-radius: var(--feature-border-radius, 12px);
    //overflow: hidden;
  }

  .button.dark-theme {
    background-color: rgba(70,70,70,0.2);
  }

  .button.light-theme {
    background-color: rgba(189,189,189,0.2);
  }

  .button.dark-theme:hover {
    background-color: rgba(70,70,70,0.3);
  }

  .button.light-theme:hover {
    background-color: rgba(189,189,189,0.3);
  }

  .combined-buttons .button {
    flex: 1;
    -webkit-flex: 1;
    border-radius: 0;
    background: none;
    display: inline-flex;
    overflow: hidden;
  }

  .combined-buttons .button:first-child {
    border-radius: var(--feature-border-radius, 12px) 0 0 var(--feature-border-radius, 12px);
  }

  .combined-buttons .button:last-child {
    border-radius: 0 var(--feature-border-radius, 12px) var(--feature-border-radius, 12px) 0;
  }

  .button_icon {
    --mdc-icon-size: 20px;
    font-size: 12px;
  }

  .button_icon.power {
    color: rgb(255,255,255);
  }

  .icon-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    position: relative;
    flex: none;
    margin-right: 10px;
    margin-inline-start: initial;
    margin-inline-end: 10px;
    direction: var(--direction);
    transition: transform 180ms ease-in-out;
  }

  .icon-container.on {
    background-color: rgba(245, 68, 54, 0.2); /* Light red for "on" state */
  }

  .icon-container.off {
    background-color: rgba(158, 158, 158, 0.2); /* Light gray for "off" state */
  }

  .icon-container.cold {
    background-color: rgba(33, 150, 243, 0.2); /* Light blue for low temp */
  }

  .icon-container.warm {
    background-color: rgba(255, 111, 34, 0.2); /* Light orange for mid temp */
  }

  .icon-container.hot {
    background-color: rgba(245, 68, 54, 0.2); /* Light red for high temp */
  }  

  .icon {
    font-size: 24px;
    transition: color 0.3s;
    --mdc-icon-size: 24px;
    line-height: 0px;
  }

  .icon.on {
    color: #F54436; /* Red for "on" state */
  }

  .icon.off {
    color: var(--state-light-off-color, var(--state-light-inactive-color, var(--state-inactive-color)));
  }

  .icon-sensor {
    border-radius: 50%;
    //display: flex;
    //justify-content: center;
    //align-items: center;
    width: 100%;
    height: 100%;
    font-family: 'Roboto', sans-serif;
    //font-size: 15px;
    font-weight: 500;
    letter-spacing: -1px;
    line-height: 36px;
    //padding-top: 2px;
    text-align: center;
  }

  .icon-sensor.on {
    color: #F54436; /* Red for "on" state */
  }

  .icon-sensor.off {
    color: var(--primary-text-color);
  }

  .icon-sensor.cold {
    color: rgb(33, 150, 243); /* Blue for low temp */
  }

  .icon-sensor.warm {
    color: rgb(255, 111, 34); /* Orange for mid temp */
  }

  .icon-sensor.hot {
    color: rgb(245, 68, 54); /* Red for high temp */
  }    

  .icon-sensor.resolution-0 {
    font-size: 18px;
  }
  .icon-sensor.resolution-1 {
    font-size: 15px;
  }
  .icon-sensor.resolution-2 {
    font-size: 12px;
  }  

  .label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-left: 12px;
    font-size: 14px;
    color: #000;
    overflow: hidden;
    text-overflow: ellipsis;    
  }

  .primary {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: .1px;
    color: var(--primary-text-color); 
  }

  .secondary {
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: .4px;
    color: var(--primary-text-color);
  }

  span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    width: 100%;
    max-width: 100%;
  }

`;class ut extends nt{constructor(){super(),this.timerValue="15"}static getConfigElement(){return document.createElement("switcher-boiler-card-editor")}static getStubConfig(){return{type:"custom:switcher-boiler-card",name:"Boiler",entity:"",icon:"",time_left:"",sensor_1:"",sensor_2:"",icon_sensor:"",color_thresholds:!1,cold_threshold:20,hot_threshold:50,temp_resolution:1}}setConfig(t){if(!t.entity)throw new Error("You need to define an entity");this.config=t,this.timerValue=this.config.timer_values?this.config.timer_values[0]:"15";const e=this.config.cold_threshold;if(this.config.hot_threshold<=e)throw new Error("Cold Threshold must be lower then Hot Threshold");let s=this.config.temp_resolution;if(null!=s&&null!=s&&""!=s&&(s=Number(s),isNaN(s)||![0,1,2].includes(s)))throw new Error("Temperature Resolution must be a number and only 0, 1, or 2")}render(){var t,e,s,i,o,n;const{name:r,icon:a,entity:l}=this.config,c=!0===this.config.color_thresholds,h=this.config.cold_threshold||20,d=this.config.hot_threshold||50,u=null!==(t=this.config.temp_resolution)&&void 0!==t?t:1,p=null===(s=null===(e=this.hass)||void 0===e?void 0:e.states)||void 0===s?void 0:s[l];if(!p)return;const f=(null===(i=null==p?void 0:p.attributes)||void 0===i?void 0:i.friendly_name)||"Unknown Entity",m=r||f,g=(null==p?void 0:p.state)||"Unavailable",_=a||(null===(o=null==p?void 0:p.attributes)||void 0===o?void 0:o.icon)||"mdi:waves",b="on"===g,v=parseFloat(null===(n=this.hass.states[this.config.icon_sensor])||void 0===n?void 0:n.state),$=this.config.icon_sensor&&this.hass.states[this.config.icon_sensor]&&!isNaN(v);let y="icon-container",x="icon-sensor";c&&$?v<=h?(y+=" cold",x+=" cold"):v>h&&v<=d?(y+=" warm",x+=" warm"):(y+=" hot",x+=" hot"):b?(y+=" on",x+=" on"):(y+=" off",x+=" off"),x+=0===u?" resolution-0":2===u?" resolution-2":" resolution-1";const w=b?"icon on":"icon off";let A="";b?(!this.config.time_left||this.config.sensor_1||this.config.sensor_2||(A=this.hass.states[this.config.time_left].state),this.config.time_left&&!this.config.sensor_1&&this.config.sensor_2&&(A=this.hass.states[this.config.time_left].state+" • "+this.hass.states[this.config.sensor_2].state+this.hass.states[this.config.sensor_2].attributes.unit_of_measurement),this.config.time_left&&this.config.sensor_1&&!this.config.sensor_2&&(A=this.hass.states[this.config.time_left].state+" • "+this.hass.states[this.config.sensor_1].state+this.hass.states[this.config.sensor_1].attributes.unit_of_measurement),this.config.time_left&&this.config.sensor_1&&this.config.sensor_2&&(A=this.hass.states[this.config.time_left].state+" • "+this.hass.states[this.config.sensor_1].state+this.hass.states[this.config.sensor_1].attributes.unit_of_measurement+" • "+this.hass.states[this.config.sensor_2].state+this.hass.states[this.config.sensor_2].attributes.unit_of_measurement),!this.config.time_left&&this.config.sensor_1&&this.config.sensor_2&&(A=this.hass.states[this.config.sensor_1].state+this.hass.states[this.config.sensor_1].attributes.unit_of_measurement+" • "+this.hass.states[this.config.sensor_2].state+this.hass.states[this.config.sensor_2].attributes.unit_of_measurement),this.config.time_left||this.config.sensor_1||!this.config.sensor_2||(A=this.hass.states[this.config.sensor_2].state+this.hass.states[this.config.sensor_2].attributes.unit_of_measurement),this.config.time_left||!this.config.sensor_1||this.config.sensor_2||(A=this.hass.states[this.config.sensor_1].state+this.hass.states[this.config.sensor_1].attributes.unit_of_measurement),this.config.time_left||this.config.sensor_1||this.config.sensor_2||(A=this.hass.localize("component.switch.entity_component._.state.on")||"on")):this.config.sensor_2?(A=this.hass.localize("component.switch.entity_component._.state.off")||"off",A+=" • "+this.hass.states[this.config.sensor_2].state,A+=this.hass.states[this.config.sensor_2].attributes.unit_of_measurement):A=this.hass.localize("component.switch.entity_component._.state.off")||"off";const E=b?"button power on":"button power off",S=this.isDarkTheme()?"button dark-theme":"button light-theme";return D`
      <ha-card class="card" id="card">
        <div class="container">
          <div
            class="content"
            @click="${t=>this._showMoreInfo(t,this.config.entity)}"
          >
            <div class="${y}" id="icon-container">
              ${$?this.renderIconSensor(x,v,u):this.renderIcon(w,_)}
            </div>
            <div class="label">
              <span class="primary" id="name">${m}</span>
              <span class="secondary" id="state">${A}</span>
            </div>
          </div>
          <div class="controls">
            <div class="buttons-group">
              <button
                class="${E}"
                @click="${this._toggleBoiler}"
              >
                <ha-icon icon="mdi:power" class="button_icon power"></ha-icon>
              </button>
              <button
                class="${S} timer"
                @click=${this._turnOnBoilerWithTimer}
              >
                <ha-icon
                  icon="mdi:timer-outline"
                  class="button_icon timer"
                ></ha-icon>
              </button>
              <button
                class="${S} timer_time"
                @click=${this._cycleTimerValue}
              >
                ${this.timerValue}
              </button>
            </div>
          </div>
        </div>
      </ha-card>
    `}renderIconSensor(t,e,s){let i;return i=0===s?Math.round(e).toString():e.toFixed(s),D`
      <span
        class="${t}"
        @click="${t=>this._showMoreInfo(t,this.config.icon_sensor)}"
      >
        ${i}°
      </span>
    `}renderIcon(t,e){return D`
      <ha-icon icon="${e}" class="${t}" id="icon"></ha-icon>
    `}_toggleBoiler(t){t.stopPropagation(),t.preventDefault();const e=this.config.entity;this.hass.callService("homeassistant","toggle",{entity_id:e}),this._rippleEffect(t)}_turnOnBoilerWithTimer(t){t.stopPropagation(),t.preventDefault();const e=this.config.entity;this.hass.callService("switcher_kis","turn_on_with_timer",{entity_id:e,timer_minutes:this.timerValue}),this._rippleEffect(t)}_cycleTimerValue(t){t.stopPropagation(),t.preventDefault();const e=[...new Set((this.config.timer_values||["15","30","45","60"]).map(Number).filter((t=>t>=1&&t<=150)).sort(((t,e)=>t-e)).map(String))],s=e.indexOf(this.timerValue);this.timerValue=-1===s?e[0]:e[(s+1)%e.length],this._rippleEffect(t)}_rippleEffect(t){const e=t.currentTarget;if(!e)return;const s=document.createElement("span");s.classList.add("ripple");const i=e.getBoundingClientRect(),o=Math.max(i.width,i.height),n=t.clientX-i.left-o/2,r=t.clientY-i.top-o/2;s.style.width=s.style.height=`${o}px`,s.style.left=`${n}px`,s.style.top=`${r}px`,e.appendChild(s),setTimeout((()=>s.remove()),1e3)}_showMoreInfo(t,e){if(t.stopPropagation(),t.preventDefault(),!e)return;const s=new CustomEvent("hass-more-info",{bubbles:!0,cancelable:!0,composed:!0,detail:{entityId:e}});this.dispatchEvent(s)}isDarkTheme(){var t;return null!==(t=this.hass.themes.darkMode)&&void 0!==t&&t}getCardSize(){return 3}getLayoutOptions(){return{grid_rows:2,grid_columns:2,grid_min_rows:2,grid_max_rows:2,grid_min_columns:2,grid_max_columns:4}}}ut.styles=dt,t([ht()],ut.prototype,"timerValue",void 0),t([ct({attribute:!1})],ut.prototype,"hass",void 0),t([ct({attribute:!1})],ut.prototype,"config",void 0);var pt=r`

  .card-config {
    /* Cancels overlapping Margins for HAForm + Card Config options */
    overflow: auto;
  }
  ha-switch {
    padding: 16px 6px;
  }
  .side-by-side {
    display: flex;
    align-items: flex-end;
  }
  .side-by-side > * {
    flex: 1;
    padding-right: 8px;
  }
  .side-by-side > *:last-child {
    flex: 1;
    padding-right: 0;
  }
  .suffix {
    margin: 0 8px;
  }
  hui-action-editor,
  ha-select,
  ha-textfield,
  ha-icon-picker {
    margin-top: 8px;
    display: block;
  }
  .timer-values {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-top: 16px;
  }
  .timer-values label {
    display: flex;
    align-items: center;
  }
  .timer-values input {
    margin-right: 8px;
  }
  .timer-values-label {
    margin-top: 24px;
    margin-bottom: 8px;
    margin-right: 6px;
    margin-left: 6px;
  }

`;const ft=[{name:"entity",selector:{entity:{domain:["switch"]}}},{name:"name",selector:{text:{}}},{name:"icon",selector:{icon:{}},context:{icon_entity:"entity"}},{name:"time_left",selector:{entity:{domain:["sensor"]}}},{name:"sensor_1",selector:{entity:{domain:["sensor"]}}},{name:"sensor_2",selector:{entity:{domain:["sensor"]}}},{name:"icon_sensor",selector:{entity:{domain:["sensor"]}}},{name:"color_thresholds",selector:{boolean:{}}},{type:"grid",name:"",schema:[{name:"cold_threshold",selector:{number:{min:10,max:80,step:1,mode:"slider"}}},{name:"hot_threshold",selector:{number:{min:10,max:80,step:1,mode:"slider"}}}]},{name:"temp_resolution",selector:{number:{min:0,max:2,step:1,mode:"slider"}}},{name:"timer_values",selector:{}}];class mt extends nt{constructor(){super(...arguments),this._config={},this._valueChanged=t=>((t,e,s,i={})=>{const o=new CustomEvent(e,{bubbles:void 0===i.bubbles||i.bubbles,cancelable:Boolean(i.cancelable),composed:void 0===i.composed||i.composed,detail:s});return t.dispatchEvent(o),o})(this,"config-changed",{config:t.detail.value}),this._computeLabelCallback=t=>{const{name:e}=t;switch(e){case"time_left":return"Time Left Sensor (Optional)";case"sensor_1":return"Sensor 1 - On state (Optional)";case"sensor_2":return"Sensor 2 - On and Off state (Optional)";case"icon_sensor":return"Icon Sensor (Optional)";case"color_thresholds":return"Color Thresholds (Optional)";case"cold_threshold":return"Cold Threshold";case"hot_threshold":return"Hot Threshold";case"temp_resolution":return"Temperature Resolution (Optional)";default:return`${this.hass.localize(`ui.panel.lovelace.editor.card.generic.${e}`)} (${this.hass.localize("ui.panel.lovelace.editor.card.config.optional")})`}}}setConfig(t){this._config=Object.assign(Object.assign({},t),{timer_values:[...new Set((t.timer_values||["15","30","45","60"]).map(Number).filter((t=>t>=1&&t<=150)).sort(((t,e)=>t-e)).map(String))]})}render(){return this.hass&&this._config?D`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${ft.filter((t=>"temp_resolution"===t.name||"color_thresholds"===t.name?!!this._config.icon_sensor:"grid"===t.type&&Array.isArray(t.schema)&&t.schema.some((t=>"cold_threshold"===t.name))&&t.schema.some((t=>"hot_threshold"===t.name))?!!this._config.icon_sensor&&!!this._config.color_thresholds:"timer_values"!==t.name))}
        .computeLabel=${this._computeLabelCallback}
        @value-changed=${this._valueChanged}
      ></ha-form>
      ${this._renderTimerValues()}
    `:D``}_renderTimerValues(){const t=this._config.timer_values||[];return D`
      <div class="timer-values-label">Timer Values (Minutes) (Optional)</div>
      <div class="timer-values">
        ${[{value:"15",label:"15"},{value:"30",label:"30"},{value:"45",label:"45"},{value:"60",label:"60"},{value:"75",label:"75"},{value:"90",label:"90"},{value:"105",label:"105"},{value:"120",label:"120"},{value:"135",label:"135"},{value:"150",label:"150"}].map((e=>D`
            <label>
              <input
                type="checkbox"
                value="${e.value}"
                ?checked=${t.includes(e.value)}
                @change=${this._onTimerValueChanged}
              />
              ${e.label}
            </label>
          `))}
      </div>
    `}_onTimerValueChanged(t){var e;const s=t.target,i=null==s?void 0:s.value,o=null!==(e=null==s?void 0:s.checked)&&void 0!==e&&e,n=this._config.timer_values||[],r=o?[...n,i]:n.filter((t=>t!==i)),a=r.filter((t=>void 0!==t)).sort(((t,e)=>parseInt(t)-parseInt(e)));this._valueChanged(new CustomEvent("value-changed",{detail:{value:Object.assign(Object.assign({},this._config),{timer_values:a})}}))}}mt.styles=pt,t([ht()],mt.prototype,"_config",void 0);console.groupCollapsed("%c SWITCHER-BOILER-CARD %c v1.4.2","color: white; background: #F54436; font-weight: bold","color: #F54436; font-weight: bold"),console.log("Readme:","https://github.com/dmatik/switcher-boiler-card"),console.groupEnd(),customElements.define("switcher-boiler-card",ut),customElements.define("switcher-boiler-card-editor",mt);window.customCards=window.customCards||[],window.customCards.push({type:"switcher-boiler-card",name:"Switcher Boiler Card",description:"Custom Switcher Boiler Switch card for Home Assistant",preview:!0,documentationURL:"https://github.com/dmatik/switcher-boiler-card",configurable:!0});
