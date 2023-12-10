// @ts-check

/* global HTMLElement */
/* global AbortController */
/* global CustomEvent */
/* global fetch */
/* global self */

/**
 *
 * @typedef {{ tag?: string, author?: string, favorite?: string, limit?: number, offset?: number, showYourFeed?: boolean }} RequestListPostsEventDetail
 */

/**
 *
 * @typedef {{
  fetch: Promise<import("../lib/typing.js").PostItem[]>
}} ListPostsEventDetail
*/

import { Environment } from '../lib/environment.js'

/**
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'post' on 'requestPost'
 * dispatches: 'post' on 'postPost'
 * reroutes to home on 'deletePost'
 * dispatches: 'listPosts' on 'requestListPosts'
 *
 * @export
 * @class Post
 */
export default class Post extends HTMLElement {
    constructor() {
        super()

        /**
         * Used to cancel ongoing, older fetches
         * this makes sense, if you only expect one and most recent true result and not multiple
         *
         * @type {AbortController | null}
         */
        this.abortController = null

        /**
         * Listens to the event name/typeArg: 'requestListPosts'
         *
         * @param {CustomEvent & {detail: RequestListPostsEventDetail}} event
         */
        // @ts-ignore
        this.requestListPostsListener = event => {
            console.log(event);
            const url = `${Environment.fetchBaseUrl}/posts`
            // reset old AbortController and assign new one
            if (this.abortController) this.abortController.abort()
            this.abortController = new AbortController()
            // answer with event
            this.dispatchEvent(new CustomEvent('listPosts', {
                /** @type {ListPostsEventDetail} */
                detail: {
                    fetch: fetch(url, {
                        signal: this.abortController.signal,
                        ...Environment.fetchHeaders
                    }).then(response => {
                        if (response.status >= 200 && response.status <= 299) return response.json()
                        throw new Error(response.statusText)
                        // @ts-ignore
                    }).then(data => {
                        console.log(data);
                        return data.posts
                    })
                },
                bubbles: true,
                cancelable: true,
                composed: true
            }))
        }
    }

    connectedCallback() {
        // @ts-ignore
        this.addEventListener('requestListPosts', this.requestListPostsListener)
    }

    disconnectedCallback() {
        // @ts-ignore
        this.removeEventListener('requestListPosts', this.requestListPostsListener)
    }
}
