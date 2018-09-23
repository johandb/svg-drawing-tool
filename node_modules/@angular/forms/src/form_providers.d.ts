/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ModuleWithProviders } from '@angular/core';
/**
 * @description
 * An `NgModule` that registers the directives and providers for template-driven forms.
 *
 * @see [Forms Guide](/guide/forms)
 */
export declare class FormsModule {
}
/**
 * @description
 * An `NgModule` that registers the directives and providers for reactive forms.
 *
 * @see [Reactive Forms Guide](/guide/reactive-forms)
 *
 */
export declare class ReactiveFormsModule {
    /**
     * @description
     * Provides options for configuring the reactive forms module.
     *
     * @param opts An object of configuration options `warnOnNgModelWithFormControl` Configures when
     * to emit a warning when an `ngModel binding is used with reactive form directives.
     */
    static withConfig(opts: {
        /** @deprecated as of v6 */ warnOnNgModelWithFormControl: 'never' | 'once' | 'always';
    }): ModuleWithProviders<ReactiveFormsModule>;
}
