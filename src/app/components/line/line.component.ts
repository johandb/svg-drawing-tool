import { Component, OnInit } from '@angular/core';

import { Line, MousePosition } from '../../model/shape';
import { ShapeComponent } from '../shape/shape.component';
import { ShapeType } from '../../model/shape-types';

@Component({
    selector: 'app-line',
    templateUrl: './line.component.html',
    styleUrls: ['./line.component.css']
})
export class LineComponent extends ShapeComponent implements OnInit {

    constructor() {
        super();
        this.shape = new Line();
        this.shapeType = ShapeType.Line;
        console.log('LineComponent constructor:', this);
    }

    ngOnInit() {
        console.log('LineComponent ngOnInit');
    }

    setStyles() {
        let styles = {
            'stroke': this.shape.shapeProperties.strokeColor,
            'stroke-width': this.shape.shapeProperties.strokeWidth
        };
        return styles;
    }

    startDrawing(beginPosition: MousePosition): void {
        if (this.shape instanceof Line) {
            this.shape.originX = beginPosition.x;
            this.shape.originY = beginPosition.y;
            this.shape.x2 = beginPosition.x;
            this.shape.y2 = beginPosition.y;
        }
        console.log('LineComponent startDrawing at ', beginPosition, ', ', this.shape);

    }

    draw(currentPosition: MousePosition): void {
        console.log('LineComponent draw');
        if (this.shape instanceof Line) {
            this.shape.x2 = currentPosition.x;
            this.shape.y2 = currentPosition.y;
        }
    }

    // drag(draqPosition: MousePosition): void {
    //     console.log('LINECOMPONENT : ' + this.shape.shapeProperties.name + ' drag at ', draqPosition, ', offset : ', this.offset);
    //     if (this.shape instanceof Line) {
    //         if (this.offset == undefined) {
    //             this.offset = Object.assign({}, draqPosition);
    //             this.offset.x -= this.shape.originX;
    //             this.offset.y -= this.shape.originY;
    //         }
    //         this.shape.originX = (draqPosition.x - this.offset.x);
    //         this.shape.originY = (draqPosition.y - this.offset.y);
    //         this.shape.x2 = (draqPosition.x - this.offset.x);
    //         this.shape.y2 = (draqPosition.y - this.offset.y);
    //     }
    // }

}
