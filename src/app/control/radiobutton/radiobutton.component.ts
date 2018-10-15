import { Component, OnInit } from '@angular/core';
import { Field } from 'src/app/model/field.interface';
import { FormGroup } from '@angular/forms';

@Component({
    selector: 'app-radiobutton',
    templateUrl: './radiobutton.component.html',
    styleUrls: ['./radiobutton.component.css']
})
export class RadiobuttonComponent implements OnInit {
    field: Field;
    group: FormGroup;

    constructor() { }

    ngOnInit() {
    }

}
