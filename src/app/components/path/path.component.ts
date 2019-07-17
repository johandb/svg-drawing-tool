import { ShapeComponent } from './../shape/shape.component';
import { Component, OnInit } from '@angular/core';
import { ShapeType, State } from '../../model/shape-types';
import { Path, MousePosition } from '../../model/shape';

import { Field } from 'dynaform';

@Component({
    selector: 'app-path',
    templateUrl: './path.component.html',
    styleUrls: ['./path.component.css']
})
export class PathComponent extends ShapeComponent implements OnInit {

    formFields: Field[] = [
        {
            name: 'x',
            label: 'X:',
            type: 'input',
            inputType: 'text',
            value: ''
        },
    ];

    lastPoint: MousePosition;
    controlPoint: MousePosition;

    value: string = '';
    hasPoints: boolean = false;
    isMoving: boolean = false;

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
            if (this.shape.state == State.Moving) {
                this.shape.state = State.Finished;
                this.hasPoints = false;
                this.isMoving = false;
            } else {
                this.lastPoint = Object.assign({}, point);
                this.shape.points.push(this.lastPoint);
                console.log('points = ', this.shape.points, ', size = ', this.shape.points.length, ', %2 = ', this.shape.points.length % 2);
                if (this.shape.points.length % 2 == 0) {
                    this.calculateControlPoint(this.shape.points[0], this.shape.points[1]);
                    this.value = "M" + this.shape.points[0].x + " " + this.shape.points[0].y + " Q " + this.controlPoint.x + " " + this.controlPoint.y + " " + this.shape.points[1].x + " " + this.shape.points[1].y;
                    this.hasPoints = false;
                    this.shape.state = State.Moving;
                    this.isMoving = true;
                }
            }
        }
    }

    draw(currentPosition: MousePosition): void {
        if (this.shape instanceof Path) {
            if (this.shape.state == State.Moving) {
                this.controlPoint = Object.assign({}, currentPosition);
                this.value = "M" + this.shape.points[0].x + " " + this.shape.points[0].y + " Q " + this.controlPoint.x + " " + this.controlPoint.y + " " + this.shape.points[1].x + " " + this.shape.points[1].y;
            } else if (this.shape.state != State.Finished) {
                this.lastPoint = Object.assign({}, currentPosition);
                this.hasPoints = true;
            }
        }
    }

    endDrawing(): void {
        if (this.shape instanceof Path) {
            this.hasPoints = false;
            this.shape.state = State.None;
        }
    }


    private calculateControlPoint(p1: MousePosition, p2: MousePosition): void {
        var mpx = (p2.x + p1.x) * 0.5;
        var mpy = (p2.y + p1.y) * 0.5;

        var theta = Math.atan2(p2.y - p1.y, p2.x - p1.x) - Math.PI / 2;
        var offset = 50;

        var c1x = mpx + offset * Math.cos(theta);
        var c1y = mpy + offset * Math.sin(theta);

        this.controlPoint = {
            x: c1x,
            y: c1y
        }
    }
}
