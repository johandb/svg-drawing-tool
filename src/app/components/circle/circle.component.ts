import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { ShapeType } from '../../model/shape-types';
import { MousePosition, Circle } from '../../model/shape';

@Component({
    selector: 'app-circle',
    templateUrl: './circle.component.html',
    styleUrls: ['./circle.component.css']
})
export class CircleComponent extends ShapeComponent implements OnInit {

    constructor() {
        super();
        console.log('CircleComponent constructor');
        this.shape = new Circle();
        this.shapeType = ShapeType.Circle;
    }

    ngOnInit() {
        console.log('CircleComponent ngOnInit');
    }

    setStyles() {
        let styles = {
            'stroke': this.shape.shapeProperties.strokeColor,
            'fill': this.shape.shapeProperties.fillColor,
            'stroke-width': this.shape.shapeProperties.strokeWidth
        };
        return styles;
    }

    startDragging(beginPosition: MousePosition): void {
        console.log('CircleComponent startDragging at ', beginPosition);
        if (this.shape instanceof Circle) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
    }

    mouseDragged(currentPosition: MousePosition): void {
        console.log('CircleComponent mouseDragged');
        if (this.shape instanceof Circle) {
            this.shape.r = Math.abs(currentPosition.x - this.shape.x1);
            console.log('circle properties : ', this.shape.shapeProperties);
        }
    }
}
