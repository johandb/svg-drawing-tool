import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/model/field.interface';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.css']
})
export class ColorPickerComponent implements OnInit {
    field: Field;
    group: FormGroup;

    constructor() { }

    ngOnInit() {
    }

}
