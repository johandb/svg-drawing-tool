import { Component, OnInit } from '@angular/core';
import { DynamicFormComponent } from 'dynaform';
import { FormBuilder } from '@angular/forms';

@Component({
    selector: 'form-properties',
    templateUrl: './shapeproperties.component.html',
    styleUrls: ['./shapeproperties.component.css']
})
export class ShapePropertiesComponent extends DynamicFormComponent implements OnInit {

    constructor(public fb: FormBuilder) {
        super(fb);
    }

    ngOnInit() {
    }

}
