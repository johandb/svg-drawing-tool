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
import { Directive, Input, TemplateRef, ViewContainerRef, ɵstringify as stringify } from '@angular/core';
/**
 * Conditionally includes a template based on the value of an `expression`.
 *
 * `ngIf` evaluates the `expression` and then renders the `then` or `else` template in its place
 * when expression is truthy or falsy respectively. Typically the:
 *  - `then` template is the inline template of `ngIf` unless bound to a different value.
 *  - `else` template is blank unless it is bound.
 *
 *
 * \@usageNotes
 *
 * ### Most common usage
 *
 * The most common usage of the `ngIf` directive is to conditionally show the inline template as
 * seen in this example:
 * {\@example common/ngIf/ts/module.ts region='NgIfSimple'}
 *
 * ### Showing an alternative template using `else`
 *
 * If it is necessary to display a template when the `expression` is falsy use the `else` template
 * binding as shown. Note that the `else` binding points to a `<ng-template>` labeled `#elseBlock`.
 * The template can be defined anywhere in the component view but is typically placed right after
 * `ngIf` for readability.
 *
 * {\@example common/ngIf/ts/module.ts region='NgIfElse'}
 *
 * ### Using non-inlined `then` template
 *
 * Usually the `then` template is the inlined template of the `ngIf`, but it can be changed using
 * a binding (just like `else`). Because `then` and `else` are bindings, the template references can
 * change at runtime as shown in this example.
 *
 * {\@example common/ngIf/ts/module.ts region='NgIfThenElse'}
 *
 * ### Storing conditional result in a variable
 *
 * A common pattern is that we need to show a set of properties from the same object. If the
 * object is undefined, then we have to use the safe-traversal-operator `?.` to guard against
 * dereferencing a `null` value. This is especially the case when waiting on async data such as
 * when using the `async` pipe as shown in following example:
 *
 * ```
 * Hello {{ (userStream|async)?.last }}, {{ (userStream|async)?.first }}!
 * ```
 *
 * There are several inefficiencies in the above example:
 *  - We create multiple subscriptions on `userStream`. One for each `async` pipe, or two in the
 *    example above.
 *  - We cannot display an alternative screen while waiting for the data to arrive asynchronously.
 *  - We have to use the safe-traversal-operator `?.` to access properties, which is cumbersome.
 *  - We have to place the `async` pipe in parenthesis.
 *
 * A better way to do this is to use `ngIf` and store the result of the condition in a local
 * variable as shown in the the example below:
 *
 * {\@example common/ngIf/ts/module.ts region='NgIfAs'}
 *
 * Notice that:
 *  - We use only one `async` pipe and hence only one subscription gets created.
 *  - `ngIf` stores the result of the `userStream|async` in the local variable `user`.
 *  - The local `user` can then be bound repeatedly in a more efficient way.
 *  - No need to use the safe-traversal-operator `?.` to access properties as `ngIf` will only
 *    display the data if `userStream` returns a value.
 *  - We can display an alternative template while waiting for the data.
 *
 * ### Syntax
 *
 * Simple form:
 * - `<div *ngIf="condition">...</div>`
 * - `<ng-template [ngIf]="condition"><div>...</div></ng-template>`
 *
 * Form with an else block:
 * ```
 * <div *ngIf="condition; else elseBlock">...</div>
 * <ng-template #elseBlock>...</ng-template>
 * ```
 *
 * Form with a `then` and `else` block:
 * ```
 * <div *ngIf="condition; then thenBlock else elseBlock"></div>
 * <ng-template #thenBlock>...</ng-template>
 * <ng-template #elseBlock>...</ng-template>
 * ```
 *
 * Form with storing the value locally:
 * ```
 * <div *ngIf="condition as value; else elseBlock">{{value}}</div>
 * <ng-template #elseBlock>...</ng-template>
 * ```
 *
 * \@ngModule CommonModule
 * \@publicApi
 */
export class NgIf {
    /**
     * @param {?} _viewContainer
     * @param {?} templateRef
     */
    constructor(_viewContainer, templateRef) {
        this._viewContainer = _viewContainer;
        this._context = new NgIfContext();
        this._thenTemplateRef = null;
        this._elseTemplateRef = null;
        this._thenViewRef = null;
        this._elseViewRef = null;
        this._thenTemplateRef = templateRef;
    }
    /**
     * @param {?} condition
     * @return {?}
     */
    set ngIf(condition) {
        this._context.$implicit = this._context.ngIf = condition;
        this._updateView();
    }
    /**
     * @param {?} templateRef
     * @return {?}
     */
    set ngIfThen(templateRef) {
        assertTemplate('ngIfThen', templateRef);
        this._thenTemplateRef = templateRef;
        this._thenViewRef = null; // clear previous view if any.
        this._updateView();
    }
    /**
     * @param {?} templateRef
     * @return {?}
     */
    set ngIfElse(templateRef) {
        assertTemplate('ngIfElse', templateRef);
        this._elseTemplateRef = templateRef;
        this._elseViewRef = null; // clear previous view if any.
        this._updateView();
    }
    /**
     * @private
     * @return {?}
     */
    _updateView() {
        if (this._context.$implicit) {
            if (!this._thenViewRef) {
                this._viewContainer.clear();
                this._elseViewRef = null;
                if (this._thenTemplateRef) {
                    this._thenViewRef =
                        this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
                }
            }
        }
        else {
            if (!this._elseViewRef) {
                this._viewContainer.clear();
                this._thenViewRef = null;
                if (this._elseTemplateRef) {
                    this._elseViewRef =
                        this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
                }
            }
        }
    }
    /**
     * Assert the correct type of the expression bound to the `ngIf` input within the template.
     *
     * The presence of this method is a signal to the Ivy template type check compiler that when the
     * `NgIf` structural directive renders its template, the type of the expression bound to `ngIf`
     * should be narrowed in some way. For `NgIf`, it is narrowed to be non-null, which allows the
     * strictNullChecks feature of TypeScript to work with `NgIf`.
     * @template E
     * @param {?} dir
     * @param {?} expr
     * @return {?}
     */
    static ngTemplateGuard_ngIf(dir, expr) { return true; }
}
NgIf.decorators = [
    { type: Directive, args: [{ selector: '[ngIf]' },] }
];
/** @nocollapse */
NgIf.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: TemplateRef }
];
NgIf.propDecorators = {
    ngIf: [{ type: Input }],
    ngIfThen: [{ type: Input }],
    ngIfElse: [{ type: Input }]
};
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    NgIf.ngIfUseIfTypeGuard;
    /**
     * @type {?}
     * @private
     */
    NgIf.prototype._context;
    /**
     * @type {?}
     * @private
     */
    NgIf.prototype._thenTemplateRef;
    /**
     * @type {?}
     * @private
     */
    NgIf.prototype._elseTemplateRef;
    /**
     * @type {?}
     * @private
     */
    NgIf.prototype._thenViewRef;
    /**
     * @type {?}
     * @private
     */
    NgIf.prototype._elseViewRef;
    /**
     * @type {?}
     * @private
     */
    NgIf.prototype._viewContainer;
}
/**
 * \@publicApi
 */
export class NgIfContext {
    constructor() {
        this.$implicit = null;
        this.ngIf = null;
    }
}
if (false) {
    /** @type {?} */
    NgIfContext.prototype.$implicit;
    /** @type {?} */
    NgIfContext.prototype.ngIf;
}
/**
 * @param {?} property
 * @param {?} templateRef
 * @return {?}
 */
function assertTemplate(property, templateRef) {
    /** @type {?} */
    const isTemplateRefOrNull = !!(!templateRef || templateRef.createEmbeddedView);
    if (!isTemplateRefOrNull) {
        throw new Error(`${property} must be a TemplateRef, but received '${stringify(templateRef)}'.`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfaWYuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfaWYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsU0FBUyxFQUFtQixLQUFLLEVBQUUsV0FBVyxFQUFFLGdCQUFnQixFQUFFLFVBQVUsSUFBSSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpR3hILE1BQU0sT0FBTyxJQUFJOzs7OztJQU9mLFlBQW9CLGNBQWdDLEVBQUUsV0FBcUM7UUFBdkUsbUJBQWMsR0FBZCxjQUFjLENBQWtCO1FBTjVDLGFBQVEsR0FBZ0IsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUMxQyxxQkFBZ0IsR0FBa0MsSUFBSSxDQUFDO1FBQ3ZELHFCQUFnQixHQUFrQyxJQUFJLENBQUM7UUFDdkQsaUJBQVksR0FBc0MsSUFBSSxDQUFDO1FBQ3ZELGlCQUFZLEdBQXNDLElBQUksQ0FBQztRQUc3RCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO0lBQ3RDLENBQUM7Ozs7O0lBRUQsSUFDSSxJQUFJLENBQUMsU0FBYztRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUM7UUFDekQsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7Ozs7O0lBRUQsSUFDSSxRQUFRLENBQUMsV0FBMEM7UUFDckQsY0FBYyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsV0FBVyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLENBQUUsOEJBQThCO1FBQ3pELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNyQixDQUFDOzs7OztJQUVELElBQ0ksUUFBUSxDQUFDLFdBQTBDO1FBQ3JELGNBQWMsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLGdCQUFnQixHQUFHLFdBQVcsQ0FBQztRQUNwQyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxDQUFFLDhCQUE4QjtRQUN6RCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDckIsQ0FBQzs7Ozs7SUFFTyxXQUFXO1FBQ2pCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUU7WUFDM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUU7Z0JBQ3RCLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQzVCLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO2dCQUN6QixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtvQkFDekIsSUFBSSxDQUFDLFlBQVk7d0JBQ2IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2lCQUNsRjthQUNGO1NBQ0Y7YUFBTTtZQUNMLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO2dCQUN0QixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztnQkFDekIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7b0JBQ3pCLElBQUksQ0FBQyxZQUFZO3dCQUNiLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDbEY7YUFDRjtTQUNGO0lBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7OztJQWFELE1BQU0sQ0FBQyxvQkFBb0IsQ0FBSSxHQUFTLEVBQUUsSUFBTyxJQUE0QixPQUFPLElBQUksQ0FBQyxDQUFDLENBQUM7OztZQW5FNUYsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLFFBQVEsRUFBQzs7OztZQWhHeUIsZ0JBQWdCO1lBQTdCLFdBQVc7OzttQkE0R25ELEtBQUs7dUJBTUwsS0FBSzt1QkFRTCxLQUFLOzs7Ozs7O0lBK0JOLHdCQUF1Qzs7Ozs7SUF2RHZDLHdCQUFrRDs7Ozs7SUFDbEQsZ0NBQStEOzs7OztJQUMvRCxnQ0FBK0Q7Ozs7O0lBQy9ELDRCQUErRDs7Ozs7SUFDL0QsNEJBQStEOzs7OztJQUVuRCw4QkFBd0M7Ozs7O0FBaUV0RCxNQUFNLE9BQU8sV0FBVztJQUF4QjtRQUNTLGNBQVMsR0FBUSxJQUFJLENBQUM7UUFDdEIsU0FBSSxHQUFRLElBQUksQ0FBQztJQUMxQixDQUFDO0NBQUE7OztJQUZDLGdDQUE2Qjs7SUFDN0IsMkJBQXdCOzs7Ozs7O0FBRzFCLFNBQVMsY0FBYyxDQUFDLFFBQWdCLEVBQUUsV0FBbUM7O1VBQ3JFLG1CQUFtQixHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxJQUFJLFdBQVcsQ0FBQyxrQkFBa0IsQ0FBQztJQUM5RSxJQUFJLENBQUMsbUJBQW1CLEVBQUU7UUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLFFBQVEseUNBQXlDLFNBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakc7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRW1iZWRkZWRWaWV3UmVmLCBJbnB1dCwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWYsIMm1c3RyaW5naWZ5IGFzIHN0cmluZ2lmeX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxuLyoqXG4gKiBDb25kaXRpb25hbGx5IGluY2x1ZGVzIGEgdGVtcGxhdGUgYmFzZWQgb24gdGhlIHZhbHVlIG9mIGFuIGBleHByZXNzaW9uYC5cbiAqXG4gKiBgbmdJZmAgZXZhbHVhdGVzIHRoZSBgZXhwcmVzc2lvbmAgYW5kIHRoZW4gcmVuZGVycyB0aGUgYHRoZW5gIG9yIGBlbHNlYCB0ZW1wbGF0ZSBpbiBpdHMgcGxhY2VcbiAqIHdoZW4gZXhwcmVzc2lvbiBpcyB0cnV0aHkgb3IgZmFsc3kgcmVzcGVjdGl2ZWx5LiBUeXBpY2FsbHkgdGhlOlxuICogIC0gYHRoZW5gIHRlbXBsYXRlIGlzIHRoZSBpbmxpbmUgdGVtcGxhdGUgb2YgYG5nSWZgIHVubGVzcyBib3VuZCB0byBhIGRpZmZlcmVudCB2YWx1ZS5cbiAqICAtIGBlbHNlYCB0ZW1wbGF0ZSBpcyBibGFuayB1bmxlc3MgaXQgaXMgYm91bmQuXG4gKlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIE1vc3QgY29tbW9uIHVzYWdlXG4gKlxuICogVGhlIG1vc3QgY29tbW9uIHVzYWdlIG9mIHRoZSBgbmdJZmAgZGlyZWN0aXZlIGlzIHRvIGNvbmRpdGlvbmFsbHkgc2hvdyB0aGUgaW5saW5lIHRlbXBsYXRlIGFzXG4gKiBzZWVuIGluIHRoaXMgZXhhbXBsZTpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdJZi90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ0lmU2ltcGxlJ31cbiAqXG4gKiAjIyMgU2hvd2luZyBhbiBhbHRlcm5hdGl2ZSB0ZW1wbGF0ZSB1c2luZyBgZWxzZWBcbiAqXG4gKiBJZiBpdCBpcyBuZWNlc3NhcnkgdG8gZGlzcGxheSBhIHRlbXBsYXRlIHdoZW4gdGhlIGBleHByZXNzaW9uYCBpcyBmYWxzeSB1c2UgdGhlIGBlbHNlYCB0ZW1wbGF0ZVxuICogYmluZGluZyBhcyBzaG93bi4gTm90ZSB0aGF0IHRoZSBgZWxzZWAgYmluZGluZyBwb2ludHMgdG8gYSBgPG5nLXRlbXBsYXRlPmAgbGFiZWxlZCBgI2Vsc2VCbG9ja2AuXG4gKiBUaGUgdGVtcGxhdGUgY2FuIGJlIGRlZmluZWQgYW55d2hlcmUgaW4gdGhlIGNvbXBvbmVudCB2aWV3IGJ1dCBpcyB0eXBpY2FsbHkgcGxhY2VkIHJpZ2h0IGFmdGVyXG4gKiBgbmdJZmAgZm9yIHJlYWRhYmlsaXR5LlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdJZi90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ0lmRWxzZSd9XG4gKlxuICogIyMjIFVzaW5nIG5vbi1pbmxpbmVkIGB0aGVuYCB0ZW1wbGF0ZVxuICpcbiAqIFVzdWFsbHkgdGhlIGB0aGVuYCB0ZW1wbGF0ZSBpcyB0aGUgaW5saW5lZCB0ZW1wbGF0ZSBvZiB0aGUgYG5nSWZgLCBidXQgaXQgY2FuIGJlIGNoYW5nZWQgdXNpbmdcbiAqIGEgYmluZGluZyAoanVzdCBsaWtlIGBlbHNlYCkuIEJlY2F1c2UgYHRoZW5gIGFuZCBgZWxzZWAgYXJlIGJpbmRpbmdzLCB0aGUgdGVtcGxhdGUgcmVmZXJlbmNlcyBjYW5cbiAqIGNoYW5nZSBhdCBydW50aW1lIGFzIHNob3duIGluIHRoaXMgZXhhbXBsZS5cbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nSWYvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nTmdJZlRoZW5FbHNlJ31cbiAqXG4gKiAjIyMgU3RvcmluZyBjb25kaXRpb25hbCByZXN1bHQgaW4gYSB2YXJpYWJsZVxuICpcbiAqIEEgY29tbW9uIHBhdHRlcm4gaXMgdGhhdCB3ZSBuZWVkIHRvIHNob3cgYSBzZXQgb2YgcHJvcGVydGllcyBmcm9tIHRoZSBzYW1lIG9iamVjdC4gSWYgdGhlXG4gKiBvYmplY3QgaXMgdW5kZWZpbmVkLCB0aGVuIHdlIGhhdmUgdG8gdXNlIHRoZSBzYWZlLXRyYXZlcnNhbC1vcGVyYXRvciBgPy5gIHRvIGd1YXJkIGFnYWluc3RcbiAqIGRlcmVmZXJlbmNpbmcgYSBgbnVsbGAgdmFsdWUuIFRoaXMgaXMgZXNwZWNpYWxseSB0aGUgY2FzZSB3aGVuIHdhaXRpbmcgb24gYXN5bmMgZGF0YSBzdWNoIGFzXG4gKiB3aGVuIHVzaW5nIHRoZSBgYXN5bmNgIHBpcGUgYXMgc2hvd24gaW4gZm9sbG93aW5nIGV4YW1wbGU6XG4gKlxuICogYGBgXG4gKiBIZWxsbyB7eyAodXNlclN0cmVhbXxhc3luYyk/Lmxhc3QgfX0sIHt7ICh1c2VyU3RyZWFtfGFzeW5jKT8uZmlyc3QgfX0hXG4gKiBgYGBcbiAqXG4gKiBUaGVyZSBhcmUgc2V2ZXJhbCBpbmVmZmljaWVuY2llcyBpbiB0aGUgYWJvdmUgZXhhbXBsZTpcbiAqICAtIFdlIGNyZWF0ZSBtdWx0aXBsZSBzdWJzY3JpcHRpb25zIG9uIGB1c2VyU3RyZWFtYC4gT25lIGZvciBlYWNoIGBhc3luY2AgcGlwZSwgb3IgdHdvIGluIHRoZVxuICogICAgZXhhbXBsZSBhYm92ZS5cbiAqICAtIFdlIGNhbm5vdCBkaXNwbGF5IGFuIGFsdGVybmF0aXZlIHNjcmVlbiB3aGlsZSB3YWl0aW5nIGZvciB0aGUgZGF0YSB0byBhcnJpdmUgYXN5bmNocm9ub3VzbHkuXG4gKiAgLSBXZSBoYXZlIHRvIHVzZSB0aGUgc2FmZS10cmF2ZXJzYWwtb3BlcmF0b3IgYD8uYCB0byBhY2Nlc3MgcHJvcGVydGllcywgd2hpY2ggaXMgY3VtYmVyc29tZS5cbiAqICAtIFdlIGhhdmUgdG8gcGxhY2UgdGhlIGBhc3luY2AgcGlwZSBpbiBwYXJlbnRoZXNpcy5cbiAqXG4gKiBBIGJldHRlciB3YXkgdG8gZG8gdGhpcyBpcyB0byB1c2UgYG5nSWZgIGFuZCBzdG9yZSB0aGUgcmVzdWx0IG9mIHRoZSBjb25kaXRpb24gaW4gYSBsb2NhbFxuICogdmFyaWFibGUgYXMgc2hvd24gaW4gdGhlIHRoZSBleGFtcGxlIGJlbG93OlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdJZi90cy9tb2R1bGUudHMgcmVnaW9uPSdOZ0lmQXMnfVxuICpcbiAqIE5vdGljZSB0aGF0OlxuICogIC0gV2UgdXNlIG9ubHkgb25lIGBhc3luY2AgcGlwZSBhbmQgaGVuY2Ugb25seSBvbmUgc3Vic2NyaXB0aW9uIGdldHMgY3JlYXRlZC5cbiAqICAtIGBuZ0lmYCBzdG9yZXMgdGhlIHJlc3VsdCBvZiB0aGUgYHVzZXJTdHJlYW18YXN5bmNgIGluIHRoZSBsb2NhbCB2YXJpYWJsZSBgdXNlcmAuXG4gKiAgLSBUaGUgbG9jYWwgYHVzZXJgIGNhbiB0aGVuIGJlIGJvdW5kIHJlcGVhdGVkbHkgaW4gYSBtb3JlIGVmZmljaWVudCB3YXkuXG4gKiAgLSBObyBuZWVkIHRvIHVzZSB0aGUgc2FmZS10cmF2ZXJzYWwtb3BlcmF0b3IgYD8uYCB0byBhY2Nlc3MgcHJvcGVydGllcyBhcyBgbmdJZmAgd2lsbCBvbmx5XG4gKiAgICBkaXNwbGF5IHRoZSBkYXRhIGlmIGB1c2VyU3RyZWFtYCByZXR1cm5zIGEgdmFsdWUuXG4gKiAgLSBXZSBjYW4gZGlzcGxheSBhbiBhbHRlcm5hdGl2ZSB0ZW1wbGF0ZSB3aGlsZSB3YWl0aW5nIGZvciB0aGUgZGF0YS5cbiAqXG4gKiAjIyMgU3ludGF4XG4gKlxuICogU2ltcGxlIGZvcm06XG4gKiAtIGA8ZGl2ICpuZ0lmPVwiY29uZGl0aW9uXCI+Li4uPC9kaXY+YFxuICogLSBgPG5nLXRlbXBsYXRlIFtuZ0lmXT1cImNvbmRpdGlvblwiPjxkaXY+Li4uPC9kaXY+PC9uZy10ZW1wbGF0ZT5gXG4gKlxuICogRm9ybSB3aXRoIGFuIGVsc2UgYmxvY2s6XG4gKiBgYGBcbiAqIDxkaXYgKm5nSWY9XCJjb25kaXRpb247IGVsc2UgZWxzZUJsb2NrXCI+Li4uPC9kaXY+XG4gKiA8bmctdGVtcGxhdGUgI2Vsc2VCbG9jaz4uLi48L25nLXRlbXBsYXRlPlxuICogYGBgXG4gKlxuICogRm9ybSB3aXRoIGEgYHRoZW5gIGFuZCBgZWxzZWAgYmxvY2s6XG4gKiBgYGBcbiAqIDxkaXYgKm5nSWY9XCJjb25kaXRpb247IHRoZW4gdGhlbkJsb2NrIGVsc2UgZWxzZUJsb2NrXCI+PC9kaXY+XG4gKiA8bmctdGVtcGxhdGUgI3RoZW5CbG9jaz4uLi48L25nLXRlbXBsYXRlPlxuICogPG5nLXRlbXBsYXRlICNlbHNlQmxvY2s+Li4uPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEZvcm0gd2l0aCBzdG9yaW5nIHRoZSB2YWx1ZSBsb2NhbGx5OlxuICogYGBgXG4gKiA8ZGl2ICpuZ0lmPVwiY29uZGl0aW9uIGFzIHZhbHVlOyBlbHNlIGVsc2VCbG9ja1wiPnt7dmFsdWV9fTwvZGl2PlxuICogPG5nLXRlbXBsYXRlICNlbHNlQmxvY2s+Li4uPC9uZy10ZW1wbGF0ZT5cbiAqIGBgYFxuICpcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdJZl0nfSlcbmV4cG9ydCBjbGFzcyBOZ0lmIHtcbiAgcHJpdmF0ZSBfY29udGV4dDogTmdJZkNvbnRleHQgPSBuZXcgTmdJZkNvbnRleHQoKTtcbiAgcHJpdmF0ZSBfdGhlblRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxOZ0lmQ29udGV4dD58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2Vsc2VUZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8TmdJZkNvbnRleHQ+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF90aGVuVmlld1JlZjogRW1iZWRkZWRWaWV3UmVmPE5nSWZDb250ZXh0PnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfZWxzZVZpZXdSZWY6IEVtYmVkZGVkVmlld1JlZjxOZ0lmQ29udGV4dD58bnVsbCA9IG51bGw7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nSWZDb250ZXh0Pikge1xuICAgIHRoaXMuX3RoZW5UZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICB9XG5cbiAgQElucHV0KClcbiAgc2V0IG5nSWYoY29uZGl0aW9uOiBhbnkpIHtcbiAgICB0aGlzLl9jb250ZXh0LiRpbXBsaWNpdCA9IHRoaXMuX2NvbnRleHQubmdJZiA9IGNvbmRpdGlvbjtcbiAgICB0aGlzLl91cGRhdGVWaWV3KCk7XG4gIH1cblxuICBASW5wdXQoKVxuICBzZXQgbmdJZlRoZW4odGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE5nSWZDb250ZXh0PnxudWxsKSB7XG4gICAgYXNzZXJ0VGVtcGxhdGUoJ25nSWZUaGVuJywgdGVtcGxhdGVSZWYpO1xuICAgIHRoaXMuX3RoZW5UZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICAgIHRoaXMuX3RoZW5WaWV3UmVmID0gbnVsbDsgIC8vIGNsZWFyIHByZXZpb3VzIHZpZXcgaWYgYW55LlxuICAgIHRoaXMuX3VwZGF0ZVZpZXcoKTtcbiAgfVxuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ0lmRWxzZSh0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8TmdJZkNvbnRleHQ+fG51bGwpIHtcbiAgICBhc3NlcnRUZW1wbGF0ZSgnbmdJZkVsc2UnLCB0ZW1wbGF0ZVJlZik7XG4gICAgdGhpcy5fZWxzZVRlbXBsYXRlUmVmID0gdGVtcGxhdGVSZWY7XG4gICAgdGhpcy5fZWxzZVZpZXdSZWYgPSBudWxsOyAgLy8gY2xlYXIgcHJldmlvdXMgdmlldyBpZiBhbnkuXG4gICAgdGhpcy5fdXBkYXRlVmlldygpO1xuICB9XG5cbiAgcHJpdmF0ZSBfdXBkYXRlVmlldygpIHtcbiAgICBpZiAodGhpcy5fY29udGV4dC4kaW1wbGljaXQpIHtcbiAgICAgIGlmICghdGhpcy5fdGhlblZpZXdSZWYpIHtcbiAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5jbGVhcigpO1xuICAgICAgICB0aGlzLl9lbHNlVmlld1JlZiA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLl90aGVuVGVtcGxhdGVSZWYpIHtcbiAgICAgICAgICB0aGlzLl90aGVuVmlld1JlZiA9XG4gICAgICAgICAgICAgIHRoaXMuX3ZpZXdDb250YWluZXIuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMuX3RoZW5UZW1wbGF0ZVJlZiwgdGhpcy5fY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCF0aGlzLl9lbHNlVmlld1JlZikge1xuICAgICAgICB0aGlzLl92aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuX3RoZW5WaWV3UmVmID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX2Vsc2VUZW1wbGF0ZVJlZikge1xuICAgICAgICAgIHRoaXMuX2Vsc2VWaWV3UmVmID1cbiAgICAgICAgICAgICAgdGhpcy5fdmlld0NvbnRhaW5lci5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fZWxzZVRlbXBsYXRlUmVmLCB0aGlzLl9jb250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIHN0YXRpYyBuZ0lmVXNlSWZUeXBlR3VhcmQ6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEFzc2VydCB0aGUgY29ycmVjdCB0eXBlIG9mIHRoZSBleHByZXNzaW9uIGJvdW5kIHRvIHRoZSBgbmdJZmAgaW5wdXQgd2l0aGluIHRoZSB0ZW1wbGF0ZS5cbiAgICpcbiAgICogVGhlIHByZXNlbmNlIG9mIHRoaXMgbWV0aG9kIGlzIGEgc2lnbmFsIHRvIHRoZSBJdnkgdGVtcGxhdGUgdHlwZSBjaGVjayBjb21waWxlciB0aGF0IHdoZW4gdGhlXG4gICAqIGBOZ0lmYCBzdHJ1Y3R1cmFsIGRpcmVjdGl2ZSByZW5kZXJzIGl0cyB0ZW1wbGF0ZSwgdGhlIHR5cGUgb2YgdGhlIGV4cHJlc3Npb24gYm91bmQgdG8gYG5nSWZgXG4gICAqIHNob3VsZCBiZSBuYXJyb3dlZCBpbiBzb21lIHdheS4gRm9yIGBOZ0lmYCwgaXQgaXMgbmFycm93ZWQgdG8gYmUgbm9uLW51bGwsIHdoaWNoIGFsbG93cyB0aGVcbiAgICogc3RyaWN0TnVsbENoZWNrcyBmZWF0dXJlIG9mIFR5cGVTY3JpcHQgdG8gd29yayB3aXRoIGBOZ0lmYC5cbiAgICovXG4gIHN0YXRpYyBuZ1RlbXBsYXRlR3VhcmRfbmdJZjxFPihkaXI6IE5nSWYsIGV4cHI6IEUpOiBleHByIGlzIE5vbk51bGxhYmxlPEU+IHsgcmV0dXJuIHRydWU7IH1cbn1cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjbGFzcyBOZ0lmQ29udGV4dCB7XG4gIHB1YmxpYyAkaW1wbGljaXQ6IGFueSA9IG51bGw7XG4gIHB1YmxpYyBuZ0lmOiBhbnkgPSBudWxsO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRUZW1wbGF0ZShwcm9wZXJ0eTogc3RyaW5nLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PnwgbnVsbCk6IHZvaWQge1xuICBjb25zdCBpc1RlbXBsYXRlUmVmT3JOdWxsID0gISEoIXRlbXBsYXRlUmVmIHx8IHRlbXBsYXRlUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyk7XG4gIGlmICghaXNUZW1wbGF0ZVJlZk9yTnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgJHtwcm9wZXJ0eX0gbXVzdCBiZSBhIFRlbXBsYXRlUmVmLCBidXQgcmVjZWl2ZWQgJyR7c3RyaW5naWZ5KHRlbXBsYXRlUmVmKX0nLmApO1xuICB9XG59XG4iXX0=