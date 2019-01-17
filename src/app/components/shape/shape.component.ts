import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Shape, MousePosition } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

import { Field } from 'dynaform';

@Component({
    selector: 'app-shape',
    templateUrl: './shape.component.html',
    styleUrls: ['./shape.component.css']
})
export class ShapeComponent implements OnInit {

    @ViewChild('shapeTemplate') shapeTemplate: TemplateRef<any>;

    formFields: Field[] = [];

    public shape: Shape;
    shapeType: ShapeType;
    offset: MousePosition;
    isSelected: boolean = false;
    selectionPoints: MousePosition[] = [];

    constructor() {
        console.log('ShapeComponent constructor');
    }

    ngOnInit() {
        console.log('ShapeComponent ngOnInit');
    }

    getFormFields(): Field[] {
        return this.formFields;
    }

    updateShapeProperties(value: any) {
        console.log('ShapeComponent : updateShapeProperties');
    }

    startDrawing(beginPosition: MousePosition): void {
        console.log('ShapeComponent: startDrawing at ', beginPosition);
    }

    endDrawing(): void {
        console.log('ShapeComponent: endDrawing()');
    }

    draw(currentPosition: MousePosition): void {
        console.log('ShapeComponent: draw at ', currentPosition);
    }

    setPoint(point: MousePosition): void {
        console.log('ShapeComponent: setPoint at ', point);
    }

    drag(draqPosition: MousePosition): void {
        console.log(this.shape.shapeProperties.name + ' drag at ', draqPosition, ', offset : ', this.offset);
        if (this.offset == undefined) {
            this.offset = Object.assign({}, draqPosition);
            this.offset.x -= this.shape.originX;
            this.offset.y -= this.shape.originY;
        }
        this.shape.originX = (draqPosition.x - this.offset.x);
        this.shape.originY = (draqPosition.y - this.offset.y);
    }

    resizeShape(resizePosition: MousePosition) {
        console.log('ShapeComponent: resizeShape ', resizePosition);
    }

}
