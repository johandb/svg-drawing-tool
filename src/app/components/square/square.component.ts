import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { Rectangle, MousePosition } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

@Component({
    selector: 'app-square',
    templateUrl: './square.component.html',
    styleUrls: ['./square.component.css']
})
export class SquareComponent extends ShapeComponent implements OnInit {

    constructor() {
        super();
        console.log('SquareComponent constructor');
        this.shape = new Rectangle();
        this.shapeType = ShapeType.Square;
    }

    ngOnInit() {
        console.log('SquareComponent ngOnInit');
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
        console.log('SquareComponent startDragging at ', beginPosition);
        if (this.shape instanceof Rectangle) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
    }

    mouseDragged(currentPosition: MousePosition): void {
        console.log('SquareComponent mouseDragged');
        if (this.shape instanceof Rectangle) {
            this.shape.width = this.shape.height = Math.abs(currentPosition.x - this.shape.x1);
        }
    }
}
