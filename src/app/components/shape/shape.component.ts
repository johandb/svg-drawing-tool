import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Shape, MousePosition } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

@Component({
    selector: 'app-shape',
    templateUrl: './shape.component.html',
    styleUrls: ['./shape.component.css']
})
export class ShapeComponent implements OnInit {

    @ViewChild('shapeTemplate') shapeTemplate: TemplateRef<any>;

    shape: Shape;
    shapeType: ShapeType;

    constructor() {
        console.log('ShapeComponent constructor');
    }

    ngOnInit() {
        console.log('ShapeComponent ngOnInit');
    }

    startDrawing(beginPosition: MousePosition): void {
        console.log('ShapeComponent: startDrawing at ', beginPosition);
    }

    draw(currentPosition: MousePosition): void {
        console.log('ShapeComponent: draw');
    }
}
