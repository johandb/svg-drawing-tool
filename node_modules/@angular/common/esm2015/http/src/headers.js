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
 * @record
 */
function Update() { }
if (false) {
    /** @type {?} */
    Update.prototype.name;
    /** @type {?|undefined} */
    Update.prototype.value;
    /** @type {?} */
    Update.prototype.op;
}
/**
 * Immutable set of Http headers, with lazy parsing.
 *
 * \@publicApi
 */
export class HttpHeaders {
    /**
     * @param {?=} headers
     */
    constructor(headers) {
        /**
         * Internal map of lowercased header names to the normalized
         * form of the name (the form seen first).
         */
        this.normalizedNames = new Map();
        /**
         * Queued updates to be materialized the next initialization.
         */
        this.lazyUpdate = null;
        if (!headers) {
            this.headers = new Map();
        }
        else if (typeof headers === 'string') {
            this.lazyInit = () => {
                this.headers = new Map();
                headers.split('\n').forEach(line => {
                    /** @type {?} */
                    const index = line.indexOf(':');
                    if (index > 0) {
                        /** @type {?} */
                        const name = line.slice(0, index);
                        /** @type {?} */
                        const key = name.toLowerCase();
                        /** @type {?} */
                        const value = line.slice(index + 1).trim();
                        this.maybeSetNormalizedName(name, key);
                        if (this.headers.has(key)) {
                            (/** @type {?} */ (this.headers.get(key))).push(value);
                        }
                        else {
                            this.headers.set(key, [value]);
                        }
                    }
                });
            };
        }
        else {
            this.lazyInit = () => {
                this.headers = new Map();
                Object.keys(headers).forEach(name => {
                    /** @type {?} */
                    let values = headers[name];
                    /** @type {?} */
                    const key = name.toLowerCase();
                    if (typeof values === 'string') {
                        values = [values];
                    }
                    if (values.length > 0) {
                        this.headers.set(key, values);
                        this.maybeSetNormalizedName(name, key);
                    }
                });
            };
        }
    }
    /**
     * Checks for existence of header by given name.
     * @param {?} name
     * @return {?}
     */
    has(name) {
        this.init();
        return this.headers.has(name.toLowerCase());
    }
    /**
     * Returns first header that matches given name.
     * @param {?} name
     * @return {?}
     */
    get(name) {
        this.init();
        /** @type {?} */
        const values = this.headers.get(name.toLowerCase());
        return values && values.length > 0 ? values[0] : null;
    }
    /**
     * Returns the names of the headers
     * @return {?}
     */
    keys() {
        this.init();
        return Array.from(this.normalizedNames.values());
    }
    /**
     * Returns list of header values for a given name.
     * @param {?} name
     * @return {?}
     */
    getAll(name) {
        this.init();
        return this.headers.get(name.toLowerCase()) || null;
    }
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    append(name, value) {
        return this.clone({ name, value, op: 'a' });
    }
    /**
     * @param {?} name
     * @param {?} value
     * @return {?}
     */
    set(name, value) {
        return this.clone({ name, value, op: 's' });
    }
    /**
     * @param {?} name
     * @param {?=} value
     * @return {?}
     */
    delete(name, value) {
        return this.clone({ name, value, op: 'd' });
    }
    /**
     * @private
     * @param {?} name
     * @param {?} lcName
     * @return {?}
     */
    maybeSetNormalizedName(name, lcName) {
        if (!this.normalizedNames.has(lcName)) {
            this.normalizedNames.set(lcName, name);
        }
    }
    /**
     * @private
     * @return {?}
     */
    init() {
        if (!!this.lazyInit) {
            if (this.lazyInit instanceof HttpHeaders) {
                this.copyFrom(this.lazyInit);
            }
            else {
                this.lazyInit();
            }
            this.lazyInit = null;
            if (!!this.lazyUpdate) {
                this.lazyUpdate.forEach(update => this.applyUpdate(update));
                this.lazyUpdate = null;
            }
        }
    }
    /**
     * @private
     * @param {?} other
     * @return {?}
     */
    copyFrom(other) {
        other.init();
        Array.from(other.headers.keys()).forEach(key => {
            this.headers.set(key, (/** @type {?} */ (other.headers.get(key))));
            this.normalizedNames.set(key, (/** @type {?} */ (other.normalizedNames.get(key))));
        });
    }
    /**
     * @private
     * @param {?} update
     * @return {?}
     */
    clone(update) {
        /** @type {?} */
        const clone = new HttpHeaders();
        clone.lazyInit =
            (!!this.lazyInit && this.lazyInit instanceof HttpHeaders) ? this.lazyInit : this;
        clone.lazyUpdate = (this.lazyUpdate || []).concat([update]);
        return clone;
    }
    /**
     * @private
     * @param {?} update
     * @return {?}
     */
    applyUpdate(update) {
        /** @type {?} */
        const key = update.name.toLowerCase();
        switch (update.op) {
            case 'a':
            case 's':
                /** @type {?} */
                let value = (/** @type {?} */ (update.value));
                if (typeof value === 'string') {
                    value = [value];
                }
                if (value.length === 0) {
                    return;
                }
                this.maybeSetNormalizedName(update.name, key);
                /** @type {?} */
                const base = (update.op === 'a' ? this.headers.get(key) : undefined) || [];
                base.push(...value);
                this.headers.set(key, base);
                break;
            case 'd':
                /** @type {?} */
                const toDelete = (/** @type {?} */ (update.value));
                if (!toDelete) {
                    this.headers.delete(key);
                    this.normalizedNames.delete(key);
                }
                else {
                    /** @type {?} */
                    let existing = this.headers.get(key);
                    if (!existing) {
                        return;
                    }
                    existing = existing.filter(value => toDelete.indexOf(value) === -1);
                    if (existing.length === 0) {
                        this.headers.delete(key);
                        this.normalizedNames.delete(key);
                    }
                    else {
                        this.headers.set(key, existing);
                    }
                }
                break;
        }
    }
    /**
     * \@internal
     * @param {?} fn
     * @return {?}
     */
    forEach(fn) {
        this.init();
        Array.from(this.normalizedNames.keys())
            .forEach(key => fn((/** @type {?} */ (this.normalizedNames.get(key))), (/** @type {?} */ (this.headers.get(key)))));
    }
}
if (false) {
    /**
     * Internal map of lowercase header names to values.
     * @type {?}
     * @private
     */
    HttpHeaders.prototype.headers;
    /**
     * Internal map of lowercased header names to the normalized
     * form of the name (the form seen first).
     * @type {?}
     * @private
     */
    HttpHeaders.prototype.normalizedNames;
    /**
     * Complete the lazy initialization of this object (needed before reading).
     * @type {?}
     * @private
     */
    HttpHeaders.prototype.lazyInit;
    /**
     * Queued updates to be materialized the next initialization.
     * @type {?}
     * @private
     */
    HttpHeaders.prototype.lazyUpdate;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVhZGVycy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbW1vbi9odHRwL3NyYy9oZWFkZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBUUEscUJBSUM7OztJQUhDLHNCQUFhOztJQUNiLHVCQUF3Qjs7SUFDeEIsb0JBQWdCOzs7Ozs7O0FBUWxCLE1BQU0sT0FBTyxXQUFXOzs7O0lBeUJ0QixZQUFZLE9BQW9EOzs7OztRQWJ4RCxvQkFBZSxHQUF3QixJQUFJLEdBQUcsRUFBRSxDQUFDOzs7O1FBV2pELGVBQVUsR0FBa0IsSUFBSSxDQUFDO1FBR3ZDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO1NBQzVDO2FBQU0sSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRLEVBQUU7WUFDdEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxHQUFHLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLEVBQW9CLENBQUM7Z0JBQzNDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFOzswQkFDM0IsS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO29CQUMvQixJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUU7OzhCQUNQLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7OzhCQUMzQixHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRTs7OEJBQ3hCLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUU7d0JBQzFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ3ZDLElBQUksSUFBSSxD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T0FBTyxDQUFDLEVBQTRDO1FBQ2xELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQzthQUNsQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsbUJBQUEsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxtQkFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNwRixDQUFDO0NBQ0Y7Ozs7Ozs7SUFoTUMsOEJBQXlDOzs7Ozs7O0lBT3pDLHNDQUF5RDs7Ozs7O0lBTXpELCtCQUFrRDs7Ozs7O0lBS2xELGlDQUF5QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW50ZXJmYWNlIFVwZGF0ZSB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmFsdWU/OiBzdHJpbmd8c3RyaW5nW107XG4gIG9wOiAnYSd8J3MnfCdkJztcbn1cblxuLyoqXG4gKiBJbW11dGFibGUgc2V0IG9mIEh0dHAgaGVhZGVycywgd2l0aCBsYXp5IHBhcnNpbmcuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgSHR0cEhlYWRlcnMge1xuICAvKipcbiAgICogSW50ZXJuYWwgbWFwIG9mIGxvd2VyY2FzZSBoZWFkZXIgbmFtZXMgdG8gdmFsdWVzLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgaGVhZGVycyAhOiBNYXA8c3RyaW5nLCBzdHJpbmdbXT47XG5cblxuICAvKipcbiAgICogSW50ZXJuYWwgbWFwIG9mIGxvd2VyY2FzZWQgaGVhZGVyIG5hbWVzIHRvIHRoZSBub3JtYWxpemVkXG4gICAqIGZvcm0gb2YgdGhlIG5hbWUgKHRoZSBmb3JtIHNlZW4gZmlyc3QpLlxuICAgKi9cbiAgcHJpdmF0ZSBub3JtYWxpemVkTmFtZXM6IE1hcDxzdHJpbmcsIHN0cmluZz4gPSBuZXcgTWFwKCk7XG5cbiAgLyoqXG4gICAqIENvbXBsZXRlIHRoZSBsYXp5IGluaXRpYWxpemF0aW9uIG9mIHRoaXMgb2JqZWN0IChuZWVkZWQgYmVmb3JlIHJlYWRpbmcpLlxuICAgKi9cbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgbGF6eUluaXQgITogSHR0cEhlYWRlcnMgfCBGdW5jdGlvbiB8IG51bGw7XG5cbiAgLyoqXG4gICAqIFF1ZXVlZCB1cGRhdGVzIHRvIGJlIG1hdGVyaWFsaXplZCB0aGUgbmV4dCBpbml0aWFsaXphdGlvbi5cbiAgICovXG4gIHByaXZhdGUgbGF6eVVwZGF0ZTogVXBkYXRlW118bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IoaGVhZGVycz86IHN0cmluZ3x7W25hbWU6IHN0cmluZ106IHN0cmluZyB8IHN0cmluZ1tdfSkge1xuICAgIGlmICghaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGhlYWRlcnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLmxhenlJbml0ID0gKCkgPT4ge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgICAgIGhlYWRlcnMuc3BsaXQoJ1xcbicpLmZvckVhY2gobGluZSA9PiB7XG4gICAgICAgICAgY29uc3QgaW5kZXggPSBsaW5lLmluZGV4T2YoJzonKTtcbiAgICAgICAgICBpZiAoaW5kZXggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBuYW1lID0gbGluZS5zbGljZSgwLCBpbmRleCk7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGxpbmUuc2xpY2UoaW5kZXggKyAxKS50cmltKCk7XG4gICAgICAgICAgICB0aGlzLm1heWJlU2V0Tm9ybWFsaXplZE5hbWUobmFtZSwga2V5KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmhlYWRlcnMuaGFzKGtleSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5oZWFkZXJzLmdldChrZXkpICEucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KGtleSwgW3ZhbHVlXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubGF6eUluaXQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmdbXT4oKTtcbiAgICAgICAgT2JqZWN0LmtleXMoaGVhZGVycykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgICBsZXQgdmFsdWVzOiBzdHJpbmd8c3RyaW5nW10gPSBoZWFkZXJzW25hbWVdO1xuICAgICAgICAgIGNvbnN0IGtleSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IFt2YWx1ZXNdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoa2V5LCB2YWx1ZXMpO1xuICAgICAgICAgICAgdGhpcy5tYXliZVNldE5vcm1hbGl6ZWROYW1lKG5hbWUsIGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBmb3IgZXhpc3RlbmNlIG9mIGhlYWRlciBieSBnaXZlbiBuYW1lLlxuICAgKi9cbiAgaGFzKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgcmV0dXJuIHRoaXMuaGVhZGVycy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGZpcnN0IGhlYWRlciB0aGF0IG1hdGNoZXMgZ2l2ZW4gbmFtZS5cbiAgICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBzdHJpbmd8bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICBjb25zdCB2YWx1ZXMgPSB0aGlzLmhlYWRlcnMuZ2V0KG5hbWUudG9Mb3dlckNhc2UoKSk7XG4gICAgcmV0dXJuIHZhbHVlcyAmJiB2YWx1ZXMubGVuZ3RoID4gMCA/IHZhbHVlc1swXSA6IG51bGw7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgbmFtZXMgb2YgdGhlIGhlYWRlcnNcbiAgICovXG4gIGtleXMoKTogc3RyaW5nW10ge1xuICAgIHRoaXMuaW5pdCgpO1xuXG4gICAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5ub3JtYWxpemVkTmFtZXMudmFsdWVzKCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbGlzdCBvZiBoZWFkZXIgdmFsdWVzIGZvciBhIGdpdmVuIG5hbWUuXG4gICAqL1xuICBnZXRBbGwobmFtZTogc3RyaW5nKTogc3RyaW5nW118bnVsbCB7XG4gICAgdGhpcy5pbml0KCk7XG5cbiAgICByZXR1cm4gdGhpcy5oZWFkZXJzLmdldChuYW1lLnRvTG93ZXJDYXNlKCkpIHx8IG51bGw7XG4gIH1cblxuICBhcHBlbmQobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nfHN0cmluZ1tdKTogSHR0cEhlYWRlcnMge1xuICAgIHJldHVybiB0aGlzLmNsb25lKHtuYW1lLCB2YWx1ZSwgb3A6ICdhJ30pO1xuICB9XG5cbiAgc2V0KG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZ3xzdHJpbmdbXSk6IEh0dHBIZWFkZXJzIHtcbiAgICByZXR1cm4gdGhpcy5jbG9uZSh7bmFtZSwgdmFsdWUsIG9wOiAncyd9KTtcbiAgfVxuXG4gIGRlbGV0ZSAobmFtZTogc3RyaW5nLCB2YWx1ZT86IHN0cmluZ3xzdHJpbmdbXSk6IEh0dHBIZWFkZXJzIHtcbiAgICByZXR1cm4gdGhpcy5jbG9uZSh7bmFtZSwgdmFsdWUsIG9wOiAnZCd9KTtcbiAgfVxuXG4gIHByaXZhdGUgbWF5YmVTZXROb3JtYWxpemVkTmFtZShuYW1lOiBzdHJpbmcsIGxjTmFtZTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLm5vcm1hbGl6ZWROYW1lcy5oYXMobGNOYW1lKSkge1xuICAgICAgdGhpcy5ub3JtYWxpemVkTmFtZXMuc2V0KGxjTmFtZSwgbmFtZSk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBpbml0KCk6IHZvaWQge1xuICAgIGlmICghIXRoaXMubGF6eUluaXQpIHtcbiAgICAgIGlmICh0aGlzLmxhenlJbml0IGluc3RhbmNlb2YgSHR0cEhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5jb3B5RnJvbSh0aGlzLmxhenlJbml0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMubGF6eUluaXQoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMubGF6eUluaXQgPSBudWxsO1xuICAgICAgaWYgKCEhdGhpcy5sYXp5VXBkYXRlKSB7XG4gICAgICAgIHRoaXMubGF6eVVwZGF0ZS5mb3JFYWNoKHVwZGF0ZSA9PiB0aGlzLmFwcGx5VXBkYXRlKHVwZGF0ZSkpO1xuICAgICAgICB0aGlzLmxhenlVcGRhdGUgPSBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY29weUZyb20ob3RoZXI6IEh0dHBIZWFkZXJzKSB7XG4gICAgb3RoZXIuaW5pdCgpO1xuICAgIEFycmF5LmZyb20ob3RoZXIuaGVhZGVycy5rZXlzKCkpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIHRoaXMuaGVhZGVycy5zZXQoa2V5LCBvdGhlci5oZWFkZXJzLmdldChrZXkpICEpO1xuICAgICAgdGhpcy5ub3JtYWxpemVkTmFtZXMuc2V0KGtleSwgb3RoZXIubm9ybWFsaXplZE5hbWVzLmdldChrZXkpICEpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjbG9uZSh1cGRhdGU6IFVwZGF0ZSk6IEh0dHBIZWFkZXJzIHtcbiAgICBjb25zdCBjbG9uZSA9IG5ldyBIdHRwSGVhZGVycygpO1xuICAgIGNsb25lLmxhenlJbml0ID1cbiAgICAgICAgKCEhdGhpcy5sYXp5SW5pdCAmJiB0aGlzLmxhenlJbml0IGluc3RhbmNlb2YgSHR0cEhlYWRlcnMpID8gdGhpcy5sYXp5SW5pdCA6IHRoaXM7XG4gICAgY2xvbmUubGF6eVVwZGF0ZSA9ICh0aGlzLmxhenlVcGRhdGUgfHwgW10pLmNvbmNhdChbdXBkYXRlXSk7XG4gICAgcmV0dXJuIGNsb25lO1xuICB9XG5cbiAgcHJpdmF0ZSBhcHBseVVwZGF0ZSh1cGRhdGU6IFVwZGF0ZSk6IHZvaWQge1xuICAgIGNvbnN0IGtleSA9IHVwZGF0ZS5uYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgc3dpdGNoICh1cGRhdGUub3ApIHtcbiAgICAgIGNhc2UgJ2EnOlxuICAgICAgY2FzZSAncyc6XG4gICAgICAgIGxldCB2YWx1ZSA9IHVwZGF0ZS52YWx1ZSAhO1xuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHZhbHVlID0gW3ZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWF5YmVTZXROb3JtYWxpemVkTmFtZSh1cGRhdGUubmFtZSwga2V5KTtcbiAgICAgICAgY29uc3QgYmFzZSA9ICh1cGRhdGUub3AgPT09ICdhJyA/IHRoaXMuaGVhZGVycy5nZXQoa2V5KSA6IHVuZGVmaW5lZCkgfHwgW107XG4gICAgICAgIGJhc2UucHVzaCguLi52YWx1ZSk7XG4gICAgICAgIHRoaXMuaGVhZGVycy5zZXQoa2V5LCBiYXNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkJzpcbiAgICAgICAgY29uc3QgdG9EZWxldGUgPSB1cGRhdGUudmFsdWUgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xuICAgICAgICBpZiAoIXRvRGVsZXRlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgIHRoaXMubm9ybWFsaXplZE5hbWVzLmRlbGV0ZShrZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBleGlzdGluZyA9IHRoaXMuaGVhZGVycy5nZXQoa2V5KTtcbiAgICAgICAgICBpZiAoIWV4aXN0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGV4aXN0aW5nID0gZXhpc3RpbmcuZmlsdGVyKHZhbHVlID0+IHRvRGVsZXRlLmluZGV4T2YodmFsdWUpID09PSAtMSk7XG4gICAgICAgICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5oZWFkZXJzLmRlbGV0ZShrZXkpO1xuICAgICAgICAgICAgdGhpcy5ub3JtYWxpemVkTmFtZXMuZGVsZXRlKGtleSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoa2V5LCBleGlzdGluZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIGZvckVhY2goZm46IChuYW1lOiBzdHJpbmcsIHZhbHVlczogc3RyaW5nW10pID0+IHZvaWQpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBBcnJheS5mcm9tKHRoaXMubm9ybWFsaXplZE5hbWVzLmtleXMoKSlcbiAgICAgICAgLmZvckVhY2goa2V5ID0+IGZuKHRoaXMubm9ybWFsaXplZE5hbWVzLmdldChrZXkpICEsIHRoaXMuaGVhZGVycy5nZXQoa2V5KSAhKSk7XG4gIH1cbn1cbiJdfQ==