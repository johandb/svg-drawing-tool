import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { MousePosition, Square } from '../../model/shape';
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
        this.shape = new Square();
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

    startDrawing(beginPosition: MousePosition): void {
        console.log('SquareComponent startDrawing at ', beginPosition);
        if (this.shape instanceof Square) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
    }

    draw(currentPosition: MousePosition): void {
        console.log('SquareComponent draw');
        if (this.shape instanceof Square) {
            this.shape.width = Math.abs(currentPosition.x - this.shape.x1);
        }
    }
}
