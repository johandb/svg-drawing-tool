/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NgModule } from '@angular/core';
import { InternalFormsSharedModule, NG_MODEL_WITH_FORM_CONTROL_WARNING, REACTIVE_DRIVEN_DIRECTIVES, TEMPLATE_DRIVEN_DIRECTIVES } from './directives';
import { RadioControlRegistry } from './directives/radio_control_value_accessor';
import { FormBuilder } from './form_builder';
/**
 * @description
 * An `NgModule` that registers the directives and providers for template-driven forms.
 *
 * @see [Forms Guide](/guide/forms)
 */
var FormsModule = /** @class */ (function () {
    function FormsModule() {
    }
    FormsModule.decorators = [
        { type: NgModule, args: [{
                    declarations: TEMPLATE_DRIVEN_DIRECTIVES,
                    providers: [RadioControlRegistry],
                    exports: [InternalFormsSharedModule, TEMPLATE_DRIVEN_DIRECTIVES]
                },] }
    ];
    return FormsModule;
}());
export { FormsModule };
/**
 * @description
 * An `NgModule` that registers the directives and providers for reactive forms.
 *
 * @see [Reactive Forms Guide](/guide/reactive-forms)
 *
 */
var ReactiveFormsModule = /** @class */ (function () {
    function ReactiveFormsModule() {
    }
    /**
     * @description
     * Provides options for configuring the reactive forms module.
     *
     * @param opts An object of configuration options `warnOnNgModelWithFormControl` Configures when
     * to emit a warning when an `ngModel binding is used with reactive form directives.
     */
    ReactiveFormsModule.withConfig = function (opts) {
        return {
            ngModule: ReactiveFormsModule,
            providers: [{
                    provide: NG_MODEL_WITH_FORM_CONTROL_WARNING,
                    useValue: opts.warnOnNgModelWithFormControl
                }]
        };
    };
    ReactiveFormsModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [REACTIVE_DRIVEN_DIRECTIVES],
                    providers: [FormBuilder, RadioControlRegistry],
                    exports: [InternalFormsSharedModule, REACTIVE_DRIVEN_DIRECTIVES]
                },] }
    ];
    return ReactiveFormsModule;
}());
export { ReactiveFormsModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybV9wcm92aWRlcnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9mb3Jtcy9zcmMvZm9ybV9wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFzQixRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLHlCQUF5QixFQUFFLGtDQUFrQyxFQUFFLDBCQUEwQixFQUFFLDBCQUEwQixFQUFDLE1BQU0sY0FBYyxDQUFDO0FBQ25KLE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLDJDQUEyQyxDQUFDO0FBQy9FLE9BQU8sRUFBQyxXQUFXLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUkzQzs7Ozs7R0FLRztBQUNIO0lBQUE7SUFNQSxDQUFDOztnQkFOQSxRQUFRLFNBQUM7b0JBQ1IsWUFBWSxFQUFFLDBCQUEwQjtvQkFDeEMsU0FBUyxFQUFFLENBQUMsb0JBQW9CLENBQUM7b0JBQ2pDLE9BQU8sRUFBRSxDQUFDLHlCQUF5QixFQUFFLDBCQUEwQixDQUFDO2lCQUNqRTs7SUFFRCxrQkFBQztDQUFBLEFBTkQsSUFNQztTQURZLFdBQVc7QUFHeEI7Ozs7OztHQU1HO0FBQ0g7SUFBQTtJQXdCQSxDQUFDO0lBbEJDOzs7Ozs7T0FNRztJQUNJLDhCQUFVLEdBQWpCLFVBQWtCLElBRWpCO1FBQ0MsT0FBTztZQUNMLFFBQVEsRUFBRSxtQkFBbUI7WUFDN0IsU0FBUyxFQUFFLENBQUM7b0JBQ1YsT0FBTyxFQUFFLGtDQUFrQztvQkFDM0MsUUFBUSxFQUFFLElBQUksQ0FBQyw0QkFBNEI7aUJBQzVDLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQzs7Z0JBdkJGLFFBQVEsU0FBQztvQkFDUixZQUFZLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQztvQkFDMUMsU0FBUyxFQUFFLENBQUMsV0FBVyxFQUFFLG9CQUFvQixDQUFDO29CQUM5QyxPQUFPLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSwwQkFBMEIsQ0FBQztpQkFDakU7O0lBb0JELDBCQUFDO0NBQUEsQUF4QkQsSUF3QkM7U0FuQlksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge01vZHVsZVdpdGhQcm92aWRlcnMsIE5nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtJbnRlcm5hbEZvcm1zU2hhcmVkTW9kdWxlLCBOR19NT0RFTF9XSVRIX0ZPUk1fQ09OVFJPTF9XQVJOSU5HLCBSRUFDVElWRV9EUklWRU5fRElSRUNUSVZFUywgVEVNUExBVEVfRFJJVkVOX0RJUkVDVElWRVN9IGZyb20gJy4vZGlyZWN0aXZlcyc7XG5pbXBvcnQge1JhZGlvQ29udHJvbFJlZ2lzdHJ5fSBmcm9tICcuL2RpcmVjdGl2ZXMvcmFkaW9fY29udHJvbF92YWx1ZV9hY2Nlc3Nvcic7XG5pbXBvcnQge0Zvcm1CdWlsZGVyfSBmcm9tICcuL2Zvcm1fYnVpbGRlcic7XG5cblxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQW4gYE5nTW9kdWxlYCB0aGF0IHJlZ2lzdGVycyB0aGUgZGlyZWN0aXZlcyBhbmQgcHJvdmlkZXJzIGZvciB0ZW1wbGF0ZS1kcml2ZW4gZm9ybXMuXG4gKlxuICogQHNlZSBbRm9ybXMgR3VpZGVdKC9ndWlkZS9mb3JtcylcbiAqL1xuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBURU1QTEFURV9EUklWRU5fRElSRUNUSVZFUyxcbiAgcHJvdmlkZXJzOiBbUmFkaW9Db250cm9sUmVnaXN0cnldLFxuICBleHBvcnRzOiBbSW50ZXJuYWxGb3Jtc1NoYXJlZE1vZHVsZSwgVEVNUExBVEVfRFJJVkVOX0RJUkVDVElWRVNdXG59KVxuZXhwb3J0IGNsYXNzIEZvcm1zTW9kdWxlIHtcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqIEFuIGBOZ01vZHVsZWAgdGhhdCByZWdpc3RlcnMgdGhlIGRpcmVjdGl2ZXMgYW5kIHByb3ZpZGVycyBmb3IgcmVhY3RpdmUgZm9ybXMuXG4gKlxuICogQHNlZSBbUmVhY3RpdmUgRm9ybXMgR3VpZGVdKC9ndWlkZS9yZWFjdGl2ZS1mb3JtcylcbiAqIFxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtSRUFDVElWRV9EUklWRU5fRElSRUNUSVZFU10sXG4gIHByb3ZpZGVyczogW0Zvcm1CdWlsZGVyLCBSYWRpb0NvbnRyb2xSZWdpc3RyeV0sXG4gIGV4cG9ydHM6IFtJbnRlcm5hbEZvcm1zU2hhcmVkTW9kdWxlLCBSRUFDVElWRV9EUklWRU5fRElSRUNUSVZFU11cbn0pXG5leHBvcnQgY2xhc3MgUmVhY3RpdmVGb3Jtc01vZHVsZSB7XG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb25cbiAgICogUHJvdmlkZXMgb3B0aW9ucyBmb3IgY29uZmlndXJpbmcgdGhlIHJlYWN0aXZlIGZvcm1zIG1vZHVsZS5cbiAgICpcbiAgICogQHBhcmFtIG9wdHMgQW4gb2JqZWN0IG9mIGNvbmZpZ3VyYXRpb24gb3B0aW9ucyBgd2Fybk9uTmdNb2RlbFdpdGhGb3JtQ29udHJvbGAgQ29uZmlndXJlcyB3aGVuXG4gICAqIHRvIGVtaXQgYSB3YXJuaW5nIHdoZW4gYW4gYG5nTW9kZWwgYmluZGluZyBpcyB1c2VkIHdpdGggcmVhY3RpdmUgZm9ybSBkaXJlY3RpdmVzLlxuICAgKi9cbiAgc3RhdGljIHdpdGhDb25maWcob3B0czoge1xuICAgIC8qKiBAZGVwcmVjYXRlZCBhcyBvZiB2NiAqLyB3YXJuT25OZ01vZGVsV2l0aEZvcm1Db250cm9sOiAnbmV2ZXInIHwgJ29uY2UnIHwgJ2Fsd2F5cydcbiAgfSk6IE1vZHVsZVdpdGhQcm92aWRlcnM8UmVhY3RpdmVGb3Jtc01vZHVsZT4ge1xuICAgIHJldHVybiB7XG4gICAgICBuZ01vZHVsZTogUmVhY3RpdmVGb3Jtc01vZHVsZSxcbiAgICAgIHByb3ZpZGVyczogW3tcbiAgICAgICAgcHJvdmlkZTogTkdfTU9ERUxfV0lUSF9GT1JNX0NPTlRST0xfV0FSTklORyxcbiAgICAgICAgdXNlVmFsdWU6IG9wdHMud2Fybk9uTmdNb2RlbFdpdGhGb3JtQ29udHJvbFxuICAgICAgfV1cbiAgICB9O1xuICB9XG59XG4iXX0=