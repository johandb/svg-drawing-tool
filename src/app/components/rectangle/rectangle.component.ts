import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { ShapeType } from '../../model/shape-types';
import { MousePosition, Rectangle } from '../../model/shape';

@Component({
    selector: 'app-rectangle',
    templateUrl: './rectangle.component.html',
    styleUrls: ['./rectangle.component.css']
})
export class RectangleComponent extends ShapeComponent implements OnInit {

    constructor() {
        super();
        console.log('RectangleComponent constructor');
        this.shape = new Rectangle();
        this.shapeType = ShapeType.Rectangle;
    }

    ngOnInit() {
        console.log('RectangleComponent ngOnInit');
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
        console.log('RectanleComponent startDragging at ', beginPosition);
        if (this.shape instanceof Rectangle) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
    }

    mouseDragged(currentPosition: MousePosition): void {
        console.log('RectangleComponent mouseDragged');
        if (this.shape instanceof Rectangle) {
            this.shape.width = Math.abs(currentPosition.x - this.shape.x1);
            this.shape.height = Math.abs(currentPosition.y - this.shape.y1);
        }
    }
}
