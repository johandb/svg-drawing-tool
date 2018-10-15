import { Directive, Input, ComponentFactoryResolver, ViewContainerRef } from '@angular/core';

import { InputComponent } from '../control/input/input.component';
import { SelectComponent } from '../control/select/select.component';
import { RadiobuttonComponent } from '../control/radiobutton/radiobutton.component';
import { CheckboxComponent } from '../control/checkbox/checkbox.component';
import { Field } from '../model/field.interface';
import { FormGroup } from '@angular/forms';

const controlMapper = {
    input: InputComponent,
    select: SelectComponent,
    radiobutton: RadiobuttonComponent,
    checkbox: CheckboxComponent
};

@Directive({
    selector: '[dynamic-field]'
})
export class DynamicFieldDirective {
    @Input() field: Field;
    @Input() group: FormGroup;

    componentRef: any;

    constructor(private resolver: ComponentFactoryResolver, private viewContainer: ViewContainerRef) {
    }

    ngOnInit() {
        const factory = this.resolver.resolveComponentFactory(controlMapper[this.field.type]);
        this.componentRef = this.viewContainer.createComponent(factory);
        this.componentRef.instance.field = this.field;
        this.componentRef.instance.group = this.group;
    }


}
