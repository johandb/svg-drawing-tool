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
import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
export class SwitchView {
    /**
     * @param {?} _viewContainerRef
     * @param {?} _templateRef
     */
    constructor(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
        this._created = false;
    }
    /**
     * @return {?}
     */
    create() {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    }
    /**
     * @return {?}
     */
    destroy() {
        this._created = false;
        this._viewContainerRef.clear();
    }
    /**
     * @param {?} created
     * @return {?}
     */
    enforceState(created) {
        if (created && !this._created) {
            this.create();
        }
        else if (!created && this._created) {
            this.destroy();
        }
    }
}
if (false) {
    /**
     * @type {?}
     * @private
     */
    SwitchView.prototype._created;
    /**
     * @type {?}
     * @private
     */
    SwitchView.prototype._viewContainerRef;
    /**
     * @type {?}
     * @private
     */
    SwitchView.prototype._templateRef;
}
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
 * ```
 *     <container-element [ngSwitch]="switch_expression">
 *       <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *       <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *       <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *       <ng-container *ngSwitchCase="match_expression_3">
 *         <!-- use a ng-container to group multiple root nodes -->
 *         <inner-element></inner-element>
 *         <inner-other-element></inner-other-element>
 *       </ng-container>
 *       <some-element *ngSwitchDefault>...</some-element>
 *     </container-element>
 * ```
 * \@description
 *
 * Adds / removes DOM sub-trees when the nest match expressions matches the switch expression.
 *
 * `NgSwitch` stamps out nested views when their match expression value matches the value of the
 * switch expression.
 *
 * In other words:
 * - you define a container element (where you place the directive with a switch expression on the
 * `[ngSwitch]="..."` attribute)
 * - you define inner views inside the `NgSwitch` and place a `*ngSwitchCase` attribute on the view
 * root elements.
 *
 * Elements within `NgSwitch` but outside of a `NgSwitchCase` or `NgSwitchDefault` directives will
 * be preserved at the location.
 *
 * The `ngSwitchCase` directive informs the parent `NgSwitch` of which view to display when the
 * expression is evaluated.
 * When no matching expression is found on a `ngSwitchCase` view, the `ngSwitchDefault` view is
 * stamped out.
 *
 * \@publicApi
 */
export class NgSwitch {
    constructor() {
        this._defaultUsed = false;
        this._caseCount = 0;
        this._lastCaseCheckIndex = 0;
        this._lastCasesMatched = false;
    }
    /**
     * @param {?} newValue
     * @return {?}
     */
    set ngSwitch(newValue) {
        this._ngSwitch = newValue;
        if (this._caseCount === 0) {
            this._updateDefaultCases(true);
        }
    }
    /**
     * \@internal
     * @return {?}
     */
    _addCase() { return this._caseCount++; }
    /**
     * \@internal
     * @param {?} view
     * @return {?}
     */
    _addDefault(view) {
        if (!this._defaultViews) {
            this._defaultViews = [];
        }
        this._defaultViews.push(view);
    }
    /**
     * \@internal
     * @param {?} value
     * @return {?}
     */
    _matchCase(value) {
        /** @type {?} */
        const matched = value == this._ngSwitch;
        this._lastCasesMatched = this._lastCasesMatched || matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        return matched;
    }
    /**
     * @private
     * @param {?} useDefault
     * @return {?}
     */
    _updateDefaultCases(useDefault) {
        if (this._defaultViews && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (let i = 0; i < this._defaultViews.length; i++) {
                /** @type {?} */
                const defaultView = this._defaultViews[i];
                defaultView.enforceState(useDefault);
            }
        }
    }
}
NgSwitch.decorators = [
    { type: Directive, args: [{ selector: '[ngSwitch]' },] }
];
NgSwitch.propDecorators = {
    ngSwitch: [{ type: Input }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._defaultViews;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._defaultUsed;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._caseCount;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._lastCaseCheckIndex;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._lastCasesMatched;
    /**
     * @type {?}
     * @private
     */
    NgSwitch.prototype._ngSwitch;
}
/**
 * \@ngModule CommonModule
 *
 * \@usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * </container-element>
 * ```
 * \@description
 *
 * Creates a view that will be added/removed from the parent {\@link NgSwitch} when the
 * given expression evaluate to respectively the same/different value as the switch
 * expression.
 *
 * Insert the sub-tree when the expression evaluates to the same value as the enclosing switch
 * expression.
 *
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * See {\@link NgSwitch} for more details and example.
 *
 * \@publicApi
 */
export class NgSwitchCase {
    /**
     * @param {?} viewContainer
     * @param {?} templateRef
     * @param {?} ngSwitch
     */
    constructor(viewContainer, templateRef, ngSwitch) {
        this.ngSwitch = ngSwitch;
        ngSwitch._addCase();
        this._view = new SwitchView(viewContainer, templateRef);
    }
    /**
     * @return {?}
     */
    ngDoCheck() { this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase)); }
}
NgSwitchCase.decorators = [
    { type: Directive, args: [{ selector: '[ngSwitchCase]' },] }
];
/** @nocollapse */
NgSwitchCase.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: TemplateRef },
    { type: NgSwitch, decorators: [{ type: Host }] }
];
NgSwitchCase.propDecorators = {
    ngSwitchCase: [{ type: Input }]
};
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgSwitchCase.prototype._view;
    /** @type {?} */
    NgSwitchCase.prototype.ngSwitchCase;
    /**
     * @type {?}
     * @private
     */
    NgSwitchCase.prototype.ngSwitch;
}
/**
 * \@ngModule CommonModule
 * \@usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-other-element *ngSwitchDefault>...</some-other-element>
 * </container-element>
 * ```
 *
 * \@description
 *
 * Creates a view that is added to the parent {\@link NgSwitch} when no case expressions
 * match the switch expression.
 *
 * Insert the sub-tree when no case expressions evaluate to the same value as the enclosing switch
 * expression.
 *
 * See {\@link NgSwitch} for more details and example.
 *
 * \@publicApi
 */
export class NgSwitchDefault {
    /**
     * @param {?} viewContainer
     * @param {?} templateRef
     * @param {?} ngSwitch
     */
    constructor(viewContainer, templateRef, ngSwitch) {
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
}
NgSwitchDefault.decorators = [
    { type: Directive, args: [{ selector: '[ngSwitchDefault]' },] }
];
/** @nocollapse */
NgSwitchDefault.ctorParameters = () => [
    { type: ViewContainerRef },
    { type: TemplateRef },
    { type: NgSwitch, decorators: [{ type: Host }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLyIsInNvdXJjZXMiOlsicGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQVcsSUFBSSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFN0YsTUFBTSxPQUFPLFVBQVU7Ozs7O0lBR3JCLFlBQ1ksaUJBQW1DLEVBQVUsWUFBaUM7UUFBOUUsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQUFVLGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUhsRixhQUFRLEdBQUcsS0FBSyxDQUFDO0lBR29FLENBQUM7Ozs7SUFFOUYsTUFBTTtRQUNKLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDL0QsQ0FBQzs7OztJQUVELE9BQU87UUFDTCxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztRQUN0QixJQUFJLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDakMsQ0FBQzs7Ozs7SUFFRCxZQUFZLENBQUMsT0FBZ0I7UUFDM0IsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7Q0FDRjs7Ozs7O0lBdEJDLDhCQUF5Qjs7Ozs7SUFHckIsdUNBQTJDOzs7OztJQUFFLGtDQUF5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QUM7Ozs7WUFoSmUsZ0JBQWdCO1lBQTdCLFdBQVc7WUF5SnBCLFFBQVEsdUJBQWpDLElBQUk7OzsyQkFMUixLQUFLOzs7Ozs7O0lBRk4sNkJBQTBCOztJQUUxQixvQ0FDa0I7Ozs7O0lBSWQsZ0NBQWtDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUErQnhDLE1BQU0sT0FBTyxlQUFlOzs7Ozs7SUFDMUIsWUFDSSxhQUErQixFQUFFLFdBQWdDLEVBQ3pELFFBQWtCO1FBQzVCLFFBQVEsQ0FBQyxXQUFXLENBQUMsSUFBSSxVQUFVLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDbkUsQ0FBQzs7O1lBTkYsU0FBUyxTQUFDLEVBQUMsUUFBUSxFQUFFLG1CQUFtQixFQUFDOzs7O1lBdkxZLGdCQUFnQjtZQUE3QixXQUFXO1lBMkw1QixRQUFRLHVCQUF6QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgRG9DaGVjaywgSG9zdCwgSW5wdXQsIFRlbXBsYXRlUmVmLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuZXhwb3J0IGNsYXNzIFN3aXRjaFZpZXcge1xuICBwcml2YXRlIF9jcmVhdGVkID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICBwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmLCBwcml2YXRlIF90ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0Pikge31cblxuICBjcmVhdGUoKTogdm9pZCB7XG4gICAgdGhpcy5fY3JlYXRlZCA9IHRydWU7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5fdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gZmFsc2U7XG4gICAgdGhpcy5fdmlld0NvbnRhaW5lclJlZi5jbGVhcigpO1xuICB9XG5cbiAgZW5mb3JjZVN0YXRlKGNyZWF0ZWQ6IGJvb2xlYW4pIHtcbiAgICBpZiAoY3JlYXRlZCAmJiAhdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5jcmVhdGUoKTtcbiAgICB9IGVsc2UgaWYgKCFjcmVhdGVkICYmIHRoaXMuX2NyZWF0ZWQpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiAgICAgPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICAgICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzJcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fM1wiPi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogICAgICAgPG5nLWNvbnRhaW5lciAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+XG4gKiAgICAgICAgIDwhLS0gdXNlIGEgbmctY29udGFpbmVyIHRvIGdyb3VwIG11bHRpcGxlIHJvb3Qgbm9kZXMgLS0+XG4gKiAgICAgICAgIDxpbm5lci1lbGVtZW50PjwvaW5uZXItZWxlbWVudD5cbiAqICAgICAgICAgPGlubmVyLW90aGVyLWVsZW1lbnQ+PC9pbm5lci1vdGhlci1lbGVtZW50PlxuICogICAgICAgPC9uZy1jb250YWluZXI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaERlZmF1bHQ+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgICAgPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyAvIHJlbW92ZXMgRE9NIHN1Yi10cmVlcyB3aGVuIHRoZSBuZXN0IG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoZXMgdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIGBOZ1N3aXRjaGAgc3RhbXBzIG91dCBuZXN0ZWQgdmlld3Mgd2hlbiB0aGVpciBtYXRjaCBleHByZXNzaW9uIHZhbHVlIG1hdGNoZXMgdGhlIHZhbHVlIG9mIHRoZVxuICogc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogSW4gb3RoZXIgd29yZHM6XG4gKiAtIHlvdSBkZWZpbmUgYSBjb250YWluZXIgZWxlbWVudCAod2hlcmUgeW91IHBsYWNlIHRoZSBkaXJlY3RpdmUgd2l0aCBhIHN3aXRjaCBleHByZXNzaW9uIG9uIHRoZVxuICogYFtuZ1N3aXRjaF09XCIuLi5cImAgYXR0cmlidXRlKVxuICogLSB5b3UgZGVmaW5lIGlubmVyIHZpZXdzIGluc2lkZSB0aGUgYE5nU3dpdGNoYCBhbmQgcGxhY2UgYSBgKm5nU3dpdGNoQ2FzZWAgYXR0cmlidXRlIG9uIHRoZSB2aWV3XG4gKiByb290IGVsZW1lbnRzLlxuICpcbiAqIEVsZW1lbnRzIHdpdGhpbiBgTmdTd2l0Y2hgIGJ1dCBvdXRzaWRlIG9mIGEgYE5nU3dpdGNoQ2FzZWAgb3IgYE5nU3dpdGNoRGVmYXVsdGAgZGlyZWN0aXZlcyB3aWxsXG4gKiBiZSBwcmVzZXJ2ZWQgYXQgdGhlIGxvY2F0aW9uLlxuICpcbiAqIFRoZSBgbmdTd2l0Y2hDYXNlYCBkaXJlY3RpdmUgaW5mb3JtcyB0aGUgcGFyZW50IGBOZ1N3aXRjaGAgb2Ygd2hpY2ggdmlldyB0byBkaXNwbGF5IHdoZW4gdGhlXG4gKiBleHByZXNzaW9uIGlzIGV2YWx1YXRlZC5cbiAqIFdoZW4gbm8gbWF0Y2hpbmcgZXhwcmVzc2lvbiBpcyBmb3VuZCBvbiBhIGBuZ1N3aXRjaENhc2VgIHZpZXcsIHRoZSBgbmdTd2l0Y2hEZWZhdWx0YCB2aWV3IGlzXG4gKiBzdGFtcGVkIG91dC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nU3dpdGNoXSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2RlZmF1bHRWaWV3cyAhOiBTd2l0Y2hWaWV3W107XG4gIHByaXZhdGUgX2RlZmF1bHRVc2VkID0gZmFsc2U7XG4gIHByaXZhdGUgX2Nhc2VDb3VudCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlQ2hlY2tJbmRleCA9IDA7XG4gIHByaXZhdGUgX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfbmdTd2l0Y2g6IGFueTtcblxuICBASW5wdXQoKVxuICBzZXQgbmdTd2l0Y2gobmV3VmFsdWU6IGFueSkge1xuICAgIHRoaXMuX25nU3dpdGNoID0gbmV3VmFsdWU7XG4gICAgaWYgKHRoaXMuX2Nhc2VDb3VudCA9PT0gMCkge1xuICAgICAgdGhpcy5fdXBkYXRlRGVmYXVsdENhc2VzKHRydWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZENhc2UoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX2Nhc2VDb3VudCsrOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkRGVmYXVsdCh2aWV3OiBTd2l0Y2hWaWV3KSB7XG4gICAgaWYgKCF0aGlzLl9kZWZhdWx0Vmlld3MpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRWaWV3cyA9IFtdO1xuICAgIH1cbiAgICB0aGlzLl9kZWZhdWx0Vmlld3MucHVzaCh2aWV3KTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX21hdGNoQ2FzZSh2YWx1ZTogYW55KTogYm9vbGVhbiB7XG4gICAgY29uc3QgbWF0Y2hlZCA9IHZhbHVlID09IHRoaXMuX25nU3dpdGNoO1xuICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSB0aGlzLl9sYXN0Q2FzZXNNYXRjaGVkIHx8IG1hdGNoZWQ7XG4gICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4Kys7XG4gICAgaWYgKHRoaXMuX2xhc3RDYXNlQ2hlY2tJbmRleCA9PT0gdGhpcy5fY2FzZUNvdW50KSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWZhdWx0Q2FzZXMoIXRoaXMuX2xhc3RDYXNlc01hdGNoZWQpO1xuICAgICAgdGhpcy5fbGFzdENhc2VDaGVja0luZGV4ID0gMDtcbiAgICAgIHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZWQ7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVEZWZhdWx0Q2FzZXModXNlRGVmYXVsdDogYm9vbGVhbikge1xuICAgIGlmICh0aGlzLl9kZWZhdWx0Vmlld3MgJiYgdXNlRGVmYXVsdCAhPT0gdGhpcy5fZGVmYXVsdFVzZWQpIHtcbiAgICAgIHRoaXMuX2RlZmF1bHRVc2VkID0gdXNlRGVmYXVsdDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fZGVmYXVsdFZpZXdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGRlZmF1bHRWaWV3ID0gdGhpcy5fZGVmYXVsdFZpZXdzW2ldO1xuICAgICAgICBkZWZhdWx0Vmlldy5lbmZvcmNlU3RhdGUodXNlRGVmYXVsdCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiA8L2NvbnRhaW5lci1lbGVtZW50PlxuICpgYGBcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgd2lsbCBiZSBhZGRlZC9yZW1vdmVkIGZyb20gdGhlIHBhcmVudCB7QGxpbmsgTmdTd2l0Y2h9IHdoZW4gdGhlXG4gKiBnaXZlbiBleHByZXNzaW9uIGV2YWx1YXRlIHRvIHJlc3BlY3RpdmVseSB0aGUgc2FtZS9kaWZmZXJlbnQgdmFsdWUgYXMgdGhlIHN3aXRjaFxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBJbnNlcnQgdGhlIHN1Yi10cmVlIHdoZW4gdGhlIGV4cHJlc3Npb24gZXZhbHVhdGVzIHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBlbmNsb3Npbmcgc3dpdGNoXG4gKiBleHByZXNzaW9uLlxuICpcbiAqIElmIG11bHRpcGxlIG1hdGNoIGV4cHJlc3Npb25zIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiB2YWx1ZSwgYWxsIG9mIHRoZW0gYXJlIGRpc3BsYXllZC5cbiAqXG4gKiBTZWUge0BsaW5rIE5nU3dpdGNofSBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hDYXNlXSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoQ2FzZSBpbXBsZW1lbnRzIERvQ2hlY2sge1xuICBwcml2YXRlIF92aWV3OiBTd2l0Y2hWaWV3O1xuXG4gIEBJbnB1dCgpXG4gIG5nU3dpdGNoQ2FzZTogYW55O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBASG9zdCgpIHByaXZhdGUgbmdTd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgbmdTd2l0Y2guX2FkZENhc2UoKTtcbiAgICB0aGlzLl92aWV3ID0gbmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpO1xuICB9XG5cbiAgbmdEb0NoZWNrKCkgeyB0aGlzLl92aWV3LmVuZm9yY2VTdGF0ZSh0aGlzLm5nU3dpdGNoLl9tYXRjaENhc2UodGhpcy5uZ1N3aXRjaENhc2UpKTsgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxjb250YWluZXItZWxlbWVudCBbbmdTd2l0Y2hdPVwic3dpdGNoX2V4cHJlc3Npb25cIj5cbiAqICAgPHNvbWUtZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8xXCI+Li4uPC9zb21lLWVsZW1lbnQ+XG4gKiAgIDxzb21lLW90aGVyLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtb3RoZXItZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKiBgYGBcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgdmlldyB0aGF0IGlzIGFkZGVkIHRvIHRoZSBwYXJlbnQge0BsaW5rIE5nU3dpdGNofSB3aGVuIG5vIGNhc2UgZXhwcmVzc2lvbnNcbiAqIG1hdGNoIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBJbnNlcnQgdGhlIHN1Yi10cmVlIHdoZW4gbm8gY2FzZSBleHByZXNzaW9ucyBldmFsdWF0ZSB0byB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgZW5jbG9zaW5nIHN3aXRjaFxuICogZXhwcmVzc2lvbi5cbiAqXG4gKiBTZWUge0BsaW5rIE5nU3dpdGNofSBmb3IgbW9yZSBkZXRhaWxzIGFuZCBleGFtcGxlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hEZWZhdWx0XSd9KVxuZXhwb3J0IGNsYXNzIE5nU3dpdGNoRGVmYXVsdCB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZiwgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICBASG9zdCgpIG5nU3dpdGNoOiBOZ1N3aXRjaCkge1xuICAgIG5nU3dpdGNoLl9hZGREZWZhdWx0KG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlUmVmKSk7XG4gIH1cbn1cbiJdfQ==