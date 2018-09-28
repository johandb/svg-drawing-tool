import { ShapeComponent } from './../shape/shape.component';
import { Component, OnInit } from '@angular/core';
import { ShapeType } from '../../model/shape-types';
import { Path, MousePosition } from '../../model/shape';

@Component({
    selector: 'app-path',
    templateUrl: './path.component.html',
    styleUrls: ['./path.component.css']
})
export class PathComponent extends ShapeComponent implements OnInit {

    lastPoint: MousePosition;
    currentPoint: MousePosition;
    value: string = '';
    hasPoints: boolean = false;

    constructor() {
        super();
        this.shape = new Path();
        this.shapeType = ShapeType.Path;
        console.log('PathComponent constructor');
    }

    ngOnInit() {
        console.log('PathComponent ngOnInit');
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
        if (this.shape instanceof Path) {
            this.lastPoint = Object.assign({}, point);
            this.shape.points.push(this.lastPoint);
            console.log('points = ', this.shape.points);
            //this.value += point.x + "," + point.y + " ";
            console.log('PathComponent value ', this.value);
        }
    }

    draw(currentPosition: MousePosition): void {
        if (this.shape instanceof Path) {
            this.currentPoint = Object.assign({}, currentPosition);
            this.hasPoints = true;
            var cp = this.calculateControlPoint(null, null);
            this.value = "M" + this.lastPoint.x + " " + this.lastPoint.y + " Q " + cp.x + " " + cp.y + " " + this.currentPoint.x + " " + this.currentPoint.y;
        }
    }

    endDrawing(): void {
        if (this.shape instanceof Path) {
            this.currentPoint = this.lastPoint;
            var cp = this.calculateControlPoint(null, null);
            this.value = "M" + this.shape.points[0].x + " " + this.shape.points[0].y + " Q " + cp.x + " " + cp.y + " " + this.shape.points[1].x + " " + this.shape.points[1].y;
        }
    }


    private calculateControlPoint(p1: MousePosition, p2: MousePosition): MousePosition {
        var mpx = (p2.x + p1.x) * 0.5;
        var mpy = (p2.y + p1.y) * 0.5;

        var theta = Math.atan2(p2.y - p1.y, p2.x - p1.x) - Math.PI / 2;
        var offset = 50;

        var c1x = mpx + offset * Math.cos(theta);
        var c1y = mpy + offset * Math.sin(theta);

        var cp: MousePosition = {
            x: c1x,
            y: c1y
        }
        console.log('controlpoint = ', cp);
        return cp;
    }
}
