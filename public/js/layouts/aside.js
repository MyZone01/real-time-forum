// @ts-check

/* global HTMLElement */

/**
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Footer
 */
export default class Aside extends HTMLElement {
    connectedCallback() {
        if (this.shouldComponentRender()) this.render()
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
        <footer>
            <div class="container">
                <a href="/" class="logo-font">conduit</a>
                <span class="attribution">
                An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.
                </span>
            </div>
        </footer>
      `
    }
}
