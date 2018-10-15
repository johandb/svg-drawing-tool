import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/model/field.interface';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.css']
})
export class SelectComponent implements OnInit {
    field: Field;
    group: FormGroup;

    constructor() { }

    ngOnInit() {
    }

}
