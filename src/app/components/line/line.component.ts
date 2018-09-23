import { Component, OnInit, ContentChild, TemplateRef } from '@angular/core';

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
        console.log('LineComponent constructor');
        this.shape = new Line();
        this.shapeType = ShapeType.Line;
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

    startDragging(beginPosition: MousePosition): void {
        if (this.shape instanceof Line) {
            console.log('LINE!!!!!!!');
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
            this.shape.x2 = beginPosition.x;
            this.shape.y2 = beginPosition.y;
        }
        console.log('LineComponent startDragging at ', beginPosition, ', ', this.shape);

    }

    mouseDragged(currentPosition: MousePosition): void {
        console.log('LineComponent mouseDragged');
        if (this.shape instanceof Line) {
            this.shape.x2 = currentPosition.x;
            this.shape.y2 = currentPosition.y;
        }
    }
}
