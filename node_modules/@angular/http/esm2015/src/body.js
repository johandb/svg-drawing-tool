/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { stringToArrayBuffer } from './http_utils';
import { URLSearchParams } from './url_search_params';
/**
 * HTTP request body used by both {\@link Request} and {\@link Response}
 * https://fetch.spec.whatwg.org/#body
 * @abstract
 */
export class Body {
    /**
     * Attempts to return body as parsed `JSON` object, or raises an exception.
     * @return {?}
     */
    json() {
        if (typeof this._body === 'string') {
            return JSON.parse((/** @type {?} */ (this._body)));
        }
        if (this._body instanceof ArrayBuffer) {
            return JSON.parse(this.text());
        }
        return this._body;
    }
    /**
     * Returns the body as a string, presuming `toString()` can be called on the response body.
     *
     * When decoding an `ArrayBuffer`, the optional `encodingHint` parameter determines how the
     * bytes in the buffer will be interpreted. Valid values are:
     *
     * - `legacy` - incorrectly interpret the bytes as UTF-16 (technically, UCS-2). Only characters
     *   in the Basic Multilingual Plane are supported, surrogate pairs are not handled correctly.
     *   In addition, the endianness of the 16-bit octet pairs in the `ArrayBuffer` is not taken
     *   into consideration. This is the default behavior to avoid breaking apps, but should be
     *   considered deprecated.
     *
     * - `iso-8859` - interpret the bytes as ISO-8859 (which can be used for ASCII encoded text).
     * @param {?=} encodingHint
     * @return {?}
     */
    text(encodingHint = 'legacy') {
        if (this._body instanceof URLSearchParams) {
            return this._body.toString();
        }
        if (this._body instanceof ArrayBuffer) {
            switch (encodingHint) {
                case 'legacy':
                    return String.fromCharCode.apply(null, new Uint16Array((/** @type {?} */ (this._body))));
                case 'iso-8859':
                    return String.fromCharCode.apply(null, new Uint8Array((/** @type {?} */ (this._body))));
                default:
                    throw new Error(`Invalid value for encodingHint: ${encodingHint}`);
            }
        }
        if (this._body == null) {
            return '';
        }
        if (typeof this._body === 'object') {
            return JSON.stringify(this._body, null, 2);
        }
        return this._body.toString();
    }
    /**
     * Return the body as an ArrayBuffer
     * @return {?}
     */
    arrayBuffer() {
        if (this._body instanceof ArrayBuffer) {
            return (/** @type {?} */ (this._body));
        }
        return stringToArrayBuffer(this.text());
    }
    /**
     * Returns the request's body as a Blob, assuming that body exists.
     * @return {?}
     */
    blob() {
        if (this._body instanceof Blob) {
            return (/** @type {?} */ (this._body));
        }
        if (this._body instanceof ArrayBuffer) {
            return new Blob([this._body]);
        }
        throw new Error('The request body isn\'t either a blob or an array buffer');
    }
}
if (false) {
    /**
     * \@internal
     * @type {?}
     * @protected
     */
    Body.prototype._body;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9keS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2h0dHAvc3JjL2JvZHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDakQsT0FBTyxFQUFDLGVBQWUsRUFBQyxNQUFNLHFCQUFxQixDQUFDOzs7Ozs7QUFPcEQsTUFBTSxPQUFnQixJQUFJOzs7OztJQVN4QixJQUFJO1FBQ0YsSUFBSSxPQUFPLElBQUksQ0FBQyxLQUFLLEtBQUssUUFBUSxFQUFFO1lBQ2xDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBUSxJQUFJLENBQUMsS0FBSyxFQUFBLENBQUMsQ0FBQztTQUN2QztRQUVELElBQUksSUFBSSxDQUFDLEtBQUssWUFBWSxXQUFXLEVBQUU7WUFDckMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ2hDO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0lBQ3BCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBZ0JELElBQUksQ0FBQyxlQUFvQyxRQUFRO1FBQy9DLElBQUksSUFBSSxDQUFDLEtBQUssWUFBWSxlQUFlLEVBQUU7WUFDekMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQzlCO1FBRUQsSUFBSSxJQUFJLENBQUMsS0FBSyxZQUFZLFdBQVcsRUFBRTtZQUNyQyxRQUFRLFlBQVksRUFBRTtnQkFDcEIsS0FBSyxRQUFRO29CQUNYLE9BQU8sTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksV0FBVyxDQUFDLG1CQUFBLElBQUksQ0FBQyxLQUFLLEVBQWUsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JGLEtBQUssVUFBVTtvQkFDYixPQUFPLE1BQU0sQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLFVBQVUsQ0FBQyxtQkFBQSxJQUFJLENBQUMsS0FBSyxFQUFlLENBQUMsQ0FBQyxDQUFDO2dCQUNwRjtvQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO2FBQ3RFO1NBQ0Y7UUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO1lBQ3RCLE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssS0FBSyxRQUFRLEVBQUU7WUFDbEMsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzVDO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQy9CLENBQUM7Ozs7O0lBS0QsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLEtBQUssWUFBWSxXQUFXLEVBQUU7WUFDckMsT0FBTyxtQkFBYSxJQUFJLENBQUMsS0FBSyxFQUFBLENBQUM7U0FDaEM7UUFFRCxPQUFPLG1CQUFtQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Ozs7O0lBS0QsSUFBSTtRQUNGLElBQUksSUFBSSxDQUFDLEtBQUssWUFBWSxJQUFJLEVBQUU7WUFDOUIsT0FBTyxtQkFBTSxJQUFJLENBQUMsS0FBSyxFQUFBLENBQUM7U0FDekI7UUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLFlBQVksV0FBVyxFQUFFO1lBQ3JDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUMvQjtRQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsMERBQTBELENBQUMsQ0FBQztJQUM5RSxDQUFDO0NBQ0Y7Ozs7Ozs7SUFuRkMscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge3N0cmluZ1RvQXJyYXlCdWZmZXJ9IGZyb20gJy4vaHR0cF91dGlscyc7XG5pbXBvcnQge1VSTFNlYXJjaFBhcmFtc30gZnJvbSAnLi91cmxfc2VhcmNoX3BhcmFtcyc7XG5cblxuLyoqXG4gKiBIVFRQIHJlcXVlc3QgYm9keSB1c2VkIGJ5IGJvdGgge0BsaW5rIFJlcXVlc3R9IGFuZCB7QGxpbmsgUmVzcG9uc2V9XG4gKiBodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jYm9keVxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQm9keSB7XG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIHByb3RlY3RlZCBfYm9keTogYW55O1xuXG4gIC8qKlxuICAgKiBBdHRlbXB0cyB0byByZXR1cm4gYm9keSBhcyBwYXJzZWQgYEpTT05gIG9iamVjdCwgb3IgcmFpc2VzIGFuIGV4Y2VwdGlvbi5cbiAgICovXG4gIGpzb24oKTogYW55IHtcbiAgICBpZiAodHlwZW9mIHRoaXMuX2JvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZSg8c3RyaW5nPnRoaXMuX2JvZHkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ib2R5IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiBKU09OLnBhcnNlKHRoaXMudGV4dCgpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fYm9keTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBib2R5IGFzIGEgc3RyaW5nLCBwcmVzdW1pbmcgYHRvU3RyaW5nKClgIGNhbiBiZSBjYWxsZWQgb24gdGhlIHJlc3BvbnNlIGJvZHkuXG4gICAqXG4gICAqIFdoZW4gZGVjb2RpbmcgYW4gYEFycmF5QnVmZmVyYCwgdGhlIG9wdGlvbmFsIGBlbmNvZGluZ0hpbnRgIHBhcmFtZXRlciBkZXRlcm1pbmVzIGhvdyB0aGVcbiAgICogYnl0ZXMgaW4gdGhlIGJ1ZmZlciB3aWxsIGJlIGludGVycHJldGVkLiBWYWxpZCB2YWx1ZXMgYXJlOlxuICAgKlxuICAgKiAtIGBsZWdhY3lgIC0gaW5jb3JyZWN0bHkgaW50ZXJwcmV0IHRoZSBieXRlcyBhcyBVVEYtMTYgKHRlY2huaWNhbGx5LCBVQ1MtMikuIE9ubHkgY2hhcmFjdGVyc1xuICAgKiAgIGluIHRoZSBCYXNpYyBNdWx0aWxpbmd1YWwgUGxhbmUgYXJlIHN1cHBvcnRlZCwgc3Vycm9nYXRlIHBhaXJzIGFyZSBub3QgaGFuZGxlZCBjb3JyZWN0bHkuXG4gICAqICAgSW4gYWRkaXRpb24sIHRoZSBlbmRpYW5uZXNzIG9mIHRoZSAxNi1iaXQgb2N0ZXQgcGFpcnMgaW4gdGhlIGBBcnJheUJ1ZmZlcmAgaXMgbm90IHRha2VuXG4gICAqICAgaW50byBjb25zaWRlcmF0aW9uLiBUaGlzIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHRvIGF2b2lkIGJyZWFraW5nIGFwcHMsIGJ1dCBzaG91bGQgYmVcbiAgICogICBjb25zaWRlcmVkIGRlcHJlY2F0ZWQuXG4gICAqXG4gICAqIC0gYGlzby04ODU5YCAtIGludGVycHJldCB0aGUgYnl0ZXMgYXMgSVNPLTg4NTkgKHdoaWNoIGNhbiBiZSB1c2VkIGZvciBBU0NJSSBlbmNvZGVkIHRleHQpLlxuICAgKi9cbiAgdGV4dChlbmNvZGluZ0hpbnQ6ICdsZWdhY3knfCdpc28tODg1OScgPSAnbGVnYWN5Jyk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBVUkxTZWFyY2hQYXJhbXMpIHtcbiAgICAgIHJldHVybiB0aGlzLl9ib2R5LnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgc3dpdGNoIChlbmNvZGluZ0hpbnQpIHtcbiAgICAgICAgY2FzZSAnbGVnYWN5JzpcbiAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBuZXcgVWludDE2QXJyYXkodGhpcy5fYm9keSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBjYXNlICdpc28tODg1OSc6XG4gICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkodGhpcy5fYm9keSBhcyBBcnJheUJ1ZmZlcikpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCB2YWx1ZSBmb3IgZW5jb2RpbmdIaW50OiAke2VuY29kaW5nSGludH1gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYm9keSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB0aGlzLl9ib2R5ID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMuX2JvZHksIG51bGwsIDIpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLl9ib2R5LnRvU3RyaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRoZSBib2R5IGFzIGFuIEFycmF5QnVmZmVyXG4gICAqL1xuICBhcnJheUJ1ZmZlcigpOiBBcnJheUJ1ZmZlciB7XG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgcmV0dXJuIDxBcnJheUJ1ZmZlcj50aGlzLl9ib2R5O1xuICAgIH1cblxuICAgIHJldHVybiBzdHJpbmdUb0FycmF5QnVmZmVyKHRoaXMudGV4dCgpKTtcbiAgfVxuXG4gIC8qKlxuICAgICogUmV0dXJucyB0aGUgcmVxdWVzdCdzIGJvZHkgYXMgYSBCbG9iLCBhc3N1bWluZyB0aGF0IGJvZHkgZXhpc3RzLlxuICAgICovXG4gIGJsb2IoKTogQmxvYiB7XG4gICAgaWYgKHRoaXMuX2JvZHkgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgICByZXR1cm4gPEJsb2I+dGhpcy5fYm9keTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fYm9keSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gbmV3IEJsb2IoW3RoaXMuX2JvZHldKTtcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByZXF1ZXN0IGJvZHkgaXNuXFwndCBlaXRoZXIgYSBibG9iIG9yIGFuIGFycmF5IGJ1ZmZlcicpO1xuICB9XG59XG4iXX0=