import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/model/field.interface';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
    field: Field;
    group: FormGroup;

    constructor() { }

    ngOnInit() {
    }

}
