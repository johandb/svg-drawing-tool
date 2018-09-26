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

    constructor() {
        super();
        this.shape = new PolyLine();
        this.shapeType = ShapeType.PolyLine;
        console.log('PolyLineComponent constructor:', this);

    }

    ngOnInit() {
        console.log('PolyLineComponent ngOnInit');
    }

    getPoints(): string {
        //console.log('PolyLineComponent - getPoints()');

        let value: string = "";
        var point: MousePosition;
        if (this.shape instanceof PolyLine) {
            for (point of this.shape.points) {
                value += point.x + "," + point.y + " ";
            }
        }
        value += "200,180";
        console.log('PolyLineComponent :  return = ', value);
        //return value += "20,20 40,25 60,40 80,120 120,140 200,180";
        return value.trim();
    }

    startDrawing(beginPosition: MousePosition): void {
        if (this.shape instanceof PolyLine) {
            this.shape.points.push(beginPosition);
            console.log('points = ', this.shape.points);
        }
        console.log('PolyLineComponent startDrawing at ', beginPosition, ', ', this.shape);
    }

}
