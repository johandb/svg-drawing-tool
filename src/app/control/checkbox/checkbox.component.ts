import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/model/field.interface';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-checkbox',
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.css']
})
export class CheckboxComponent implements OnInit {
    field: Field;
    group: FormGroup;

    constructor() { }

    ngOnInit() {
    }

}
