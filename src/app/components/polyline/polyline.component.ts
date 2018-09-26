import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { PolyLine, MousePosition } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

@Component({
    selector: 'app-polyline',
    templateUrl: './polyline.component.html',
    styleUrls: ['./polyline.component.css']
})
export class PolyLineComponent extends ShapeComponent implements OnInit {

    value: string = '';
    lastPoint: MousePosition;
    currentPoint: MousePosition;
    hasPoints: boolean = false;

    constructor() {
        super();
        this.shape = new PolyLine();
        this.shapeType = ShapeType.PolyLine;
        console.log('PolyLineComponent constructor:', this);

    }

    ngOnInit() {
        console.log('PolyLineComponent ngOnInit');
    }

    setStyles() {
        let styles = {
            'fill': 'none',
            'stroke': this.shape.shapeProperties.strokeColor,
            'stroke-width': this.shape.shapeProperties.strokeWidth
        };
        return styles;
    }

    setPoint(point: MousePosition): void {
        if (this.shape instanceof PolyLine) {
            this.lastPoint = Object.assign({}, point);
            this.shape.points.push(this.lastPoint);
            console.log('points = ', this.shape.points);
            this.value += point.x + "," + point.y + " ";
            console.log('PolyLineComponent value ', this.value);
        }
    }

    draw(currentPosition: MousePosition): void {
        if (this.shape instanceof PolyLine) {
            this.currentPoint = Object.assign({}, currentPosition);
            this.hasPoints = true;
            console.log('PolyLineComponent : draw() last= ', this.lastPoint, ', current=', this.currentPoint, ', points=', this.shape.points);
        }
    }
}
