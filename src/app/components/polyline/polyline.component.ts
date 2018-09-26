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

    startDrawing(point: MousePosition): void {
        if (this.shape instanceof PolyLine) {
            this.shape.points.push(point);
            console.log('points = ', this.shape.points);
            this.value += point.x + "," + point.y + " ";
        }
        console.log('PolyLineComponent value ', this.value);
    }

}
