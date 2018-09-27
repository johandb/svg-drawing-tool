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

    startDrawing(beginPosition: MousePosition): void {
        if (this.shape instanceof Path) {
            this.lastPoint = Object.assign({}, beginPosition);
            this.currentPoint = {
                x: beginPosition.x + 100,
                y: beginPosition.y
            }
            var cp = this.calculateControlPoint();
            this.value = "M" + this.lastPoint.x + " " + this.lastPoint.y + " Q " + cp.x + " " + cp.y + " " + this.currentPoint.x + " " + this.currentPoint.y;
        }
        console.log('PathComponent startDrawing at ', beginPosition, ', ', this.shape);
    }

    calculateControlPoint(): MousePosition {
        var mpx = (this.currentPoint.x + this.lastPoint.x) * 0.5;
        var mpy = (this.currentPoint.y + this.lastPoint.y) * 0.5;

        var theta = Math.atan2(this.currentPoint.y - this.lastPoint.y, this.currentPoint.x - this.lastPoint.x) - Math.PI / 2;
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
    /*
                var p1x = parseFloat(document.getElementById("au").getAttribute("cx"));
                var p1y = parseFloat(document.getElementById("au").getAttribute("cy"));
                var p2x = parseFloat(document.getElementById("sl").getAttribute("cx"));
                var p2y = parseFloat(document.getElementById("sl").getAttribute("cy"));
    
                // mid-point of line:
                var mpx = (p2x + p1x) * 0.5;
                var mpy = (p2y + p1y) * 0.5;
    
                // angle of perpendicular to line:
                var theta = Math.atan2(p2y - p1y, p2x - p1x) - Math.PI / 2;
    
                // distance of control point from mid-point of line:
                var offset = 30;
    
                // location of control point:
                var c1x = mpx + offset * Math.cos(theta);
                var c1y = mpy + offset * Math.sin(theta);
    
                // show where the control point is:
                var c1 = document.getElementById("cp");
                c1.setAttribute("cx", c1x);
                c1.setAttribute("cy", c1y);
    
                // construct the command to draw a quadratic curve
                var curve = "M" + p1x + " " + p1y + " Q " + c1x + " " + c1y + " " + p2x + " " + p2y;
                var curveElement = document.getElementById("curve");
                curveElement.setAttribute("d", curve);
    
    */
}
