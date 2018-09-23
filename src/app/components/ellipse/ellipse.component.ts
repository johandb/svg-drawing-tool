import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { MousePosition, Ellipse } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

@Component({
    selector: 'app-ellipse',
    templateUrl: './ellipse.component.html',
    styleUrls: ['./ellipse.component.css']
})
export class EllipseComponent extends ShapeComponent implements OnInit {

    constructor() {
        super();
        console.log('EllipseComponent constructor');
        this.shape = new Ellipse();
        this.shapeType = ShapeType.Ellipse;
    }

    ngOnInit() {
        console.log('EllipseComponent ngOnInit');
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
        console.log('EllipseComponent startDragging at ', beginPosition);
        if (this.shape instanceof Ellipse) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
    }

    mouseDragged(currentPosition: MousePosition): void {
        console.log('EllipseComponent mouseDragged');
        if (this.shape instanceof Ellipse) {
            this.shape.rx = Math.abs(currentPosition.x - this.shape.x1);
            this.shape.ry = Math.abs(currentPosition.y - this.shape.y1);
            console.log('eliipse properties : ', this.shape);
        }
    }

}
