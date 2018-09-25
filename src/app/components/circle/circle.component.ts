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
        this.shape = new Circle();
        this.shapeType = ShapeType.Circle;
        console.log('CircleComponent constructor:', this);
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

    startDrawing(beginPosition: MousePosition): void {
        console.log('CircleComponent startDrawing at ', beginPosition);
        if (this.shape instanceof Circle) {
            this.shape.originX = beginPosition.x;
            this.shape.originY = beginPosition.y;
        }
    }

    draw(currentPosition: MousePosition): void {
        console.log('CircleComponent draw');
        if (this.shape instanceof Circle) {
            this.shape.r = Math.abs(currentPosition.x - this.shape.originX);
            //console.log('circle properties : ', this.shape.shapeProperties);
        }
    }

}
