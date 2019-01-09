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
/**
 * Polyfill for [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers/Headers), as
 * specified in the [Fetch Spec](https://fetch.spec.whatwg.org/#headers-class).
 *
 * The only known difference between this `Headers` implementation and the spec is the
 * lack of an `entries` method.
 *
 * \@usageNotes
 * ### Example
 *
 * ```
 * import {Headers} from '\@angular/http';
 *
 * var firstHeaders = new Headers();
 * firstHeaders.append('Content-Type', 'image/jpeg');
 * console.log(firstHeaders.get('Content-Type')) //'image/jpeg'
 *
 * // Create headers from Plain Old JavaScript Object
 * var secondHeaders = new Headers({
 *   'X-My-Custom-Header': 'Angular'
 * });
 * console.log(secondHeaders.get('X-My-Custom-Header')); //'Angular'
 *
 * var thirdHeaders = new Headers(secondHeaders);
 * console.log(thirdHeaders.get('X-My-Custom-Header')); //'Angular'
 * ```
 *
 * @deprecated see https://angular.io/guide/http
 * \@publicApi
 */
export class Headers {
    // TODO(vicb): any -> string|string[]
    /**
     * @param {?=} headers
     */
    constructor(headers) {
        /**
         * \@internal header names are lower case
         */
        this._headers = new Map();
        /**
         * \@internal map lower case names to actual names
         */
        this._normalizedNames = new Map();
        if (!headers) {
            return;
        }
        if (headers instanceof Headers) {
            headers.forEach((values, name) => {
                values.forEach(value => this.append(name, value));
            });
            return;
        }
        Object.keys(headers).forEach((name) => {
            /** @type {?} */
            const values = Array.isArray(headers[name]) ? headers[name] : [headers[name]];
            this.delete(name);
            values.forEach(value => this.append(name, value));
        });
    }
    /**
     * Returns a new Headers instance from the given DOMString of Response Headers
     * @param {?} headersString
     * @return {?}
     */
    static fromResponseHeaderString(headersString) {
        /** @type {?} */
        const headers = new Headers();
        headersString.split('\n').forEach(line => {
            /** @type {?} */
            const index = line.indexOf(':');
            if (index > 0) {
                /** @type {?} */
                const name = line.slice(0, index);
                /** @type {?} */
                const value = line.slice(index + 1).trim();
                headers.set(name, value);
            }
        });
        return headers;
    }
    /**
     * Appends a header to existing list of header values for a given header name.
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    append(name, value) {
        /** @type {?} */
        const values = this.getAll(name);
        if (values === null) {
            this.set(name, value);
        }
        else {
            values.push(value);
        }
    }
    /**
     * Deletes all header values for the given name.
     * @param {?} name
     * @return {?}
     */
    delete(name) {
        /** @type {?} */
        const lcName = name.toLowerCase();
        this._normalizedNames.delete(lcName);
        this._headers.delete(lcName);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEach(fn) {
        this._headers.forEach((values, lcName) => fn(values, this._normalizedNames.get(lcName), this._headers));
    }
    /**
     * Returns first header that matches given name.
     * @param {?} name
     * @return {?}
     */
    get(name) {
        /** @type {?} */
        const values = this.getAll(name);
        if (values === null) {
            return null;
        }
        return values.length > 0 ? values[0] : null;
    }
    /**
     * Checks for existence of header by given name.
     * @param {?} name
     * @return {?}
     */
    has(name) { return this._headers.has(name.toLowerCase()); }
    /**
     * Returns the names of the headers
     * @return {?}
     */
    keys() { return Array.from(this._normalizedNames.values()); }
    /**
     * Sets or overrides header value for given name.
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    set(name, value) {
        if (Array.isArray(value)) {
            if (value.length) {
                this._headers.set(name.toLowerCase(), [value.join(',')]);
            }
        }
        else {
            this._headers.set(name.toLowerCase(), [value]);
        }
        this.mayBeSetNormalizedName(name);
    }
    /**
     * Returns values of all headers.
     * @return {?}
     */
    values() { return Array.from(this._headers.values()); }
    /**
     * Returns string of all headers.
     * @return {?}
     */
    // TODO(vicb): returns {[name: string]: string[]}
    toJSON() {
        /** @type {?} */
        const serialized = {};
        this._headers.forEach((values, name) => {
            /** @type {?} */
            const split = [];
            values.forEach(v => split.push(...v.split(',')));
            serialized[(/** @type {?} */ (this._normalizedNames.get(name)))] = split;
        });
        return serialized;
    }
    /**
     * Returns list of header values for a given name.
     * @param {?} name
     * @return {?}
     */
    getAll(name) {
        return this.has(name) ? this._headers.get(name.toLowerCase()) || null : null;
    }
    /**
     * This method is not implemented.
     * @return {?}
     */
    entries() { throw new Error('"entries" method is not implemented on Headers class'); }
    /**
     * @private
     * @param {?} name
     * @return {?}
     */
    mayBeSetNormalizedName(name) {
        /** @type {?} */
        const lcName = name.toLowerCase();
        if (!this._normalizedNames.has(lcName)) {
            this._normalizedNames.set(lcName, name);
        }
    }
}
if (false) {
    /**
     * \@internal header names are lower case
     * @type {?}
     */
    Headers.prototype._headers;
    /**
     * \@internal map lower case names to actual names
     * @type {?}
     */
    Headers.prototype._normalizedNames;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2h0dHAvc3JjL2hlYWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQ0EsTUFBTSxPQUFPLE9BQU87Ozs7O0lBT2xCLFlBQVksT0FBNEM7Ozs7UUFMeEQsYUFBUSxHQUEwQixJQUFJLEdBQUcsRUFBRSxDQUFDOzs7O1FBRTVDLHFCQUFnQixHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDO1FBSWhELElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixPQUFPO1NBQ1I7UUFFRCxJQUFJLE9BQU8sWUFBWSxPQUFPLEVBQUU7WUFDOUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQWdCLEVBQUUsSUFBWSxFQUFFLEVBQUU7Z0JBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTztTQUNSO1FBRUQsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFZLEVBQUUsRUFBRTs7a0JBQ3RDLE1BQU0sR0FBYSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZGLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFD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LFdBQVcsRUFBRTtRQUVqQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN0QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN6QztJQUNILENBQUM7Q0FDRjs7Ozs7O0lBbkpDLDJCQUE0Qzs7Ozs7SUFFNUMsbUNBQWtEIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIFBvbHlmaWxsIGZvciBbSGVhZGVyc10oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hlYWRlcnMvSGVhZGVycyksIGFzXG4gKiBzcGVjaWZpZWQgaW4gdGhlIFtGZXRjaCBTcGVjXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jaGVhZGVycy1jbGFzcykuXG4gKlxuICogVGhlIG9ubHkga25vd24gZGlmZmVyZW5jZSBiZXR3ZWVuIHRoaXMgYEhlYWRlcnNgIGltcGxlbWVudGF0aW9uIGFuZCB0aGUgc3BlYyBpcyB0aGVcbiAqIGxhY2sgb2YgYW4gYGVudHJpZXNgIG1ldGhvZC5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7SGVhZGVyc30gZnJvbSAnQGFuZ3VsYXIvaHR0cCc7XG4gKlxuICogdmFyIGZpcnN0SGVhZGVycyA9IG5ldyBIZWFkZXJzKCk7XG4gKiBmaXJzdEhlYWRlcnMuYXBwZW5kKCdDb250ZW50LVR5cGUnLCAnaW1hZ2UvanBlZycpO1xuICogY29uc29sZS5sb2coZmlyc3RIZWFkZXJzLmdldCgnQ29udGVudC1UeXBlJykpIC8vJ2ltYWdlL2pwZWcnXG4gKlxuICogLy8gQ3JlYXRlIGhlYWRlcnMgZnJvbSBQbGFpbiBPbGQgSmF2YVNjcmlwdCBPYmplY3RcbiAqIHZhciBzZWNvbmRIZWFkZXJzID0gbmV3IEhlYWRlcnMoe1xuICogICAnWC1NeS1DdXN0b20tSGVhZGVyJzogJ0FuZ3VsYXInXG4gKiB9KTtcbiAqIGNvbnNvbGUubG9nKHNlY29uZEhlYWRlcnMuZ2V0KCdYLU15LUN1c3RvbS1IZWFkZXInKSk7IC8vJ0FuZ3VsYXInXG4gKlxuICogdmFyIHRoaXJkSGVhZGVycyA9IG5ldyBIZWFkZXJzKHNlY29uZEhlYWRlcnMpO1xuICogY29uc29sZS5sb2codGhpcmRIZWFkZXJzLmdldCgnWC1NeS1DdXN0b20tSGVhZGVyJykpOyAvLydBbmd1bGFyJ1xuICogYGBgXG4gKlxuICogQGRlcHJlY2F0ZWQgc2VlIGh0dHBzOi8vYW5ndWxhci5pby9ndWlkZS9odHRwXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWFkZXJzIHtcbiAgLyoqIEBpbnRlcm5hbCBoZWFkZXIgbmFtZXMgYXJlIGxvd2VyIGNhc2UgKi9cbiAgX2hlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPiA9IG5ldyBNYXAoKTtcbiAgLyoqIEBpbnRlcm5hbCBtYXAgbG93ZXIgY2FzZSBuYW1lcyB0byBhY3R1YWwgbmFtZXMgKi9cbiAgX25vcm1hbGl6ZWROYW1lczogTWFwPHN0cmluZywgc3RyaW5nPiA9IG5ldyBNYXAoKTtcblxuICAvLyBUT0RPKHZpY2IpOiBhbnkgLT4gc3RyaW5nfHN0cmluZ1tdXG4gIGNvbnN0cnVjdG9yKGhlYWRlcnM/OiBIZWFkZXJzfHtbbmFtZTogc3RyaW5nXTogYW55fXxudWxsKSB7XG4gICAgaWYgKCFoZWFkZXJzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goKHZhbHVlczogc3RyaW5nW10sIG5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaCh2YWx1ZSA9PiB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaCgobmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZXM6IHN0cmluZ1tdID0gQXJyYXkuaXNBcnJheShoZWFkZXJzW25hbWVdKSA/IGhlYWRlcnNbbmFtZV0gOiBbaGVhZGVyc1tuYW1lXV07XG4gICAgICB0aGlzLmRlbGV0ZShuYW1lKTtcbiAgICAgIHZhbHVlcy5mb3JFYWNoKHZhbHVlID0+IHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBIZWFkZXJzIGluc3RhbmNlIGZyb20gdGhlIGdpdmVuIERPTVN0cmluZyBvZiBSZXNwb25zZSBIZWFkZXJzXG4gICAqL1xuICBzdGF0aWMgZnJvbVJlc3BvbnNlSGVhZGVyU3RyaW5nKGhlYWRlcnNTdHJpbmc6IHN0cmluZyk6IEhlYWRlcnMge1xuICAgIGNvbnN0IGhlYWRlcnMgPSBuZXcgSGVhZGVycygpO1xuXG4gICAgaGVhZGVyc1N0cmluZy5zcGxpdCgnXFxuJykuZm9yRWFjaChsaW5lID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBsaW5lLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBsaW5lLnNsaWNlKGluZGV4ICsgMSkudHJpbSgpO1xuICAgICAgICBoZWFkZXJzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGVhZGVycztcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIGEgaGVhZGVyIHRvIGV4aXN0aW5nIGxpc3Qgb2YgaGVhZGVyIHZhbHVlcyBmb3IgYSBnaXZlbiBoZWFkZXIgbmFtZS5cbiAgICovXG4gIGFwcGVuZChuYW1lOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmdldEFsbChuYW1lKTtcblxuICAgIGlmICh2YWx1ZXMgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIGFsbCBoZWFkZXIgdmFsdWVzIGZvciB0aGUgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGRlbGV0ZSAobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGNOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIHRoaXMuX25vcm1hbGl6ZWROYW1lcy5kZWxldGUobGNOYW1lKTtcbiAgICB0aGlzLl9oZWFkZXJzLmRlbGV0ZShsY05hbWUpO1xuICB9XG5cbiAgZm9yRWFjaChmbjogKHZhbHVlczogc3RyaW5nW10sIG5hbWU6IHN0cmluZ3x1bmRlZmluZWQsIGhlYWRlcnM6IE1hcDxzdHJpbmcsIHN0cmluZ1tdPikgPT4gdm9pZCk6XG4gICAgICB2b2lkIHtcbiAgICB0aGlzLl9oZWFkZXJzLmZvckVhY2goXG4gICAgICAgICh2YWx1ZXMsIGxjTmFtZSkgPT4gZm4odmFsdWVzLCB0aGlzLl9ub3JtYWxpemVkTmFtZXMuZ2V0KGxjTmFtZSksIHRoaXMuX2hlYWRlcnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGZpcnN0IGhlYWRlciB0aGF0IG1hdGNoZXMgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgY29uc3QgdmFsdWVzID0gdGhpcy5nZXRBbGwobmFtZSk7XG5cbiAgICBpZiAodmFsdWVzID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVzLmxlbmd0aCA+IDAgPyB2YWx1ZXNbMF0gOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBmb3IgZXhpc3RlbmNlIG9mIGhlYWRlciBieSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faGVhZGVycy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBuYW1lcyBvZiB0aGUgaGVhZGVyc1xuICAgKi9cbiAga2V5cygpOiBzdHJpbmdbXSB7IHJldHVybiBBcnJheS5mcm9tKHRoaXMuX25vcm1hbGl6ZWROYW1lcy52YWx1ZXMoKSk7IH1cblxuICAvKipcbiAgICogU2V0cyBvciBvdmVycmlkZXMgaGVhZGVyIHZhbHVlIGZvciBnaXZlbiBuYW1lLlxuICAgKi9cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xzdHJpbmdbXSk6IHZvaWQge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgaWYgKHZhbHVlLmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9oZWFkZXJzLnNldChuYW1lLnRvTG93ZXJDYXNlKCksIFt2YWx1ZS5qb2luKCcsJyldKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGVhZGVycy5zZXQobmFtZS50b0xvd2VyQ2FzZSgpLCBbdmFsdWVdKTtcbiAgICB9XG4gICAgdGhpcy5tYXlCZVNldE5vcm1hbGl6ZWROYW1lKG5hbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdmFsdWVzIG9mIGFsbCBoZWFkZXJzLlxuICAgKi9cbiAgdmFsdWVzKCk6IHN0cmluZ1tdW10geyByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLl9oZWFkZXJzLnZhbHVlcygpKTsgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHN0cmluZyBvZiBhbGwgaGVhZGVycy5cbiAgICovXG4gIC8vIFRPRE8odmljYik6IHJldHVybnMge1tuYW1lOiBzdHJpbmddOiBzdHJpbmdbXX1cbiAgdG9KU09OKCk6IHtbbmFtZTogc3RyaW5nXTogYW55fSB7XG4gICAgY29uc3Qgc2VyaWFsaXplZDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmdbXX0gPSB7fTtcblxuICAgIHRoaXMuX2hlYWRlcnMuZm9yRWFjaCgodmFsdWVzOiBzdHJpbmdbXSwgbmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBzcGxpdDogc3RyaW5nW10gPSBbXTtcbiAgICAgIHZhbHVlcy5mb3JFYWNoKHYgPT4gc3BsaXQucHVzaCguLi52LnNwbGl0KCcsJykpKTtcbiAgICAgIHNlcmlhbGl6ZWRbdGhpcy5fbm9ybWFsaXplZE5hbWVzLmdldChuYW1lKSAhXSA9IHNwbGl0O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHNlcmlhbGl6ZWQ7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBsaXN0IG9mIGhlYWRlciB2YWx1ZXMgZm9yIGEgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldEFsbChuYW1lOiBzdHJpbmcpOiBzdHJpbmdbXXxudWxsIHtcbiAgICByZXR1cm4gdGhpcy5oYXMobmFtZSkgPyB0aGlzLl9oZWFkZXJzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpIHx8IG51bGwgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZC5cbiAgICovXG4gIGVudHJpZXMoKSB7IHRocm93IG5ldyBFcnJvcignXCJlbnRyaWVzXCIgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZCBvbiBIZWFkZXJzIGNsYXNzJyk7IH1cblxuICBwcml2YXRlIG1heUJlU2V0Tm9ybWFsaXplZE5hbWUobmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgbGNOYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgaWYgKCF0aGlzLl9ub3JtYWxpemVkTmFtZXMuaGFzKGxjTmFtZSkpIHtcbiAgICAgIHRoaXMuX25vcm1hbGl6ZWROYW1lcy5zZXQobGNOYW1lLCBuYW1lKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==