import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { MousePosition, Ellipse } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';
import { Field } from 'dynaform';

@Component({
    selector: 'app-ellipse',
    templateUrl: './ellipse.component.html',
    styleUrls: ['./ellipse.component.css']
})
export class EllipseComponent extends ShapeComponent implements OnInit {
    formFields: Field[] = [
        {
            name: 'x',
            label: 'X:',
            type: 'input',
            inputType: 'text',
            value: ''
        },
    ];

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

    startDrawing(beginPosition: MousePosition): void {
        console.log('EllipseComponent startDrawing at ', beginPosition);
        if (this.shape instanceof Ellipse) {
            this.shape.originX = beginPosition.x;
            this.shape.originY = beginPosition.y;
        }
    }

    draw(currentPosition: MousePosition): void {
        console.log('EllipseComponent draw');
        if (this.shape instanceof Ellipse) {
            this.shape.rx = Math.abs(currentPosition.x - this.shape.originX);
            this.shape.ry = Math.abs(currentPosition.y - this.shape.originY);
            //console.log('eliipse properties : ', this.shape);
        }
    }

}
