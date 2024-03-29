// @ts-check
/* global HTMLElement */
/* global customElements */

import { Environment } from "../lib/environment.js";

/**
 * As a page, this component becomes a domain dependent container and shall hold organisms, molecules and/or atoms
 *
 * @export
 * @class Login
 */
export default class Login extends HTMLElement {
  constructor() {
    super()

    this.submitListener = (e) => {
      if (this.loginForm?.checkValidity()) {
        e.preventDefault();

        this.dispatchEvent(new CustomEvent('login', {
          detail: {
            /** @type {import("../lib/typing.js").Login} */
            user: {
              identifiant: (this.identifiantField) ? this.identifiantField.value : "",
              password: (this.passwordField) ? this.passwordField.value : ""
            }
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
    }
    /**
    * Listens to the event name/typeArg: 'user'
    *
    * @param {CustomEvent & {detail: import("../controllers/user.js").UserEventDetail}} event
    */
    this.userListener = event => {
      event.detail.fetch
        .then(user => {
          if (user && /^#\/login/.test(location.hash)) {
            self.location.hash = '#/';
          }
        })
        .catch(error => (this.errorMessages = error))
    }
  }

  connectedCallback() {
    if (Environment.auth) {
      self.location.hash = '#/'
    }
    if (this.shouldComponentRender()) this.render()
    this.loginForm?.addEventListener('submit', this.submitListener)
    // @ts-ignore
    document.body.addEventListener('user', this.userListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRender() {
    return !this.innerHTML
  }

  /**
   * renders the footer
   *
   * @return {void}
   */
  render() {
    this.innerHTML = /* html */`
        <div class="l-grid__item">
            <div class="card align--center justify--center f-height">
                <div class="card__header">
                    <h2>Login to Your Account</h2>
                </div>
                <div class="card__body px--32">
                    <ul class="error-messages"></ul>
                    <form id="register-form">
                                <label for="identifiant">Identifiant:</label>
                                <input placeholder="Enter your nickname or your email to login" type="text" id="identifiant" name="identifiant" autocomplete="username" required>
                                <label for="password">Password:</label>
                                <input placeholder="Enter your password" type="password" id="password" name="password" autocomplete="new-password" required>
                        <button class="primary my--16" type="submit">Login</button>
                    </form>

                    <p class="ml--16">Don't have an account? <a href="#/register">Sign up here</a></p>
                </div>
            </div>
        </div>
      `
  }
  /**
   * @return {HTMLFormElement | null}
   */
  get loginForm() {
    return this.querySelector('form')
  }

  /**
  * @return {HTMLInputElement | null}
  */
  get identifiantField() {
    return this.querySelector('input[name="identifiant"]')
  }
  /**
  * @return {HTMLInputElement | null}
  */
  get passwordField() {
    return document.querySelector('input[name="password"]')
  }
  get errorMessages() {
    return this.querySelector('.error-messages')
  }

  set errorMessages(errors) {
    const ul = this.querySelector('.error-messages')
    if (ul && typeof errors === 'object') {
      ul.innerHTML = ''
      for (const key in errors) {
        const li = document.createElement('li')
        li.textContent = `${key}: ${errors[key].reduce((acc, curr) => `${acc}${acc ? ' | ' : ''}${curr}`, '')}`
        ul.appendChild(li)
      }
    }
  }

}
