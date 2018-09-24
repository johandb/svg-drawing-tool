import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { Shape } from '../../model/shape';

@Component({
    selector: 'app-group',
    templateUrl: './group.component.html',
    styleUrls: ['./group.component.css']
})
export class GroupComponent extends ShapeComponent implements OnInit {

    private groupObjects: Shape[] = [];

    constructor() {
        super();
        console.log('GroupComponent constructor');
    }

    ngOnInit() {
    }

}
