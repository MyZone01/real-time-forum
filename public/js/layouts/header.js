// @ts-check

/* global HTMLElement */

/**
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Header
 */
export default class Header extends HTMLElement {
    constructor() {
        super()

        /**
         * Listens to the event name/typeArg: 'user'
         *
         * @param {CustomEvent & {detail: import("../controllers/user.js").UserEventDetail}} event
         */
        this.userListener = event => {
            event.detail.fetch.then(user => {
                if (this.shouldComponentRender(user)) this.render(user)
                this.user = user
            }).catch(error => {
                console.log(`Error@UserFetch: ${error}`)
                // @ts-ignore
                if (this.shouldComponentRender(null)) this.render(null)
                this.user = null
            })
        }
    }

    connectedCallback() {
        this.user = undefined

        this.render()
        // @ts-ignore
        document.body.addEventListener('user', this.userListener)
        this.dispatchEvent(new CustomEvent('getUser', {
            bubbles: true,
            cancelable: true,
            composed: true
        }))
    }

    /**
   * evaluates if a render is necessary
   *
   * @param {import("../lib/typing.js").AuthUser} user
   * @return {boolean}
   */
    shouldComponentRender(user) {
        return this.user !== user
    }

    /**
     * renders the header within the body, which is in this case the navbar
     *
     * @param {import("../lib/typing.js").AuthUser} [user = undefined]
     * @return {void}
     */
    render(user) {
        this.innerHTML = /* html */`
        <header>
            <a href="#/">
                <img class="logo" src="./img/logo.svg" draggable="false">
            </a>
            <div>
                ${user ? /* html */`
                <a href="#/profile" class="btn primary not mr--8">Welcome le con ${user.nickname}</a>`
                : /* html */`
                <a href="#/login" class="btn primary not mr--8">Login</a>
                <a href="#/register" class="btn primary not">Register</a>`
            }
            </div>
        </header>`
    }
}
