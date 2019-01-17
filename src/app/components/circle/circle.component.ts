import { Component, OnInit, ViewChild } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { ShapeType } from '../../model/shape-types';
import { MousePosition, Circle, Shape } from '../../model/shape';

import { Field } from 'dynaform';

@Component({
    selector: 'app-circle',
    templateUrl: './circle.component.html',
    styleUrls: ['./circle.component.css']
})
export class CircleComponent extends ShapeComponent implements OnInit {

    constructor() {
        super();
        this.shape = new Circle();

        this.shapeType = ShapeType.Circle;
        console.log('CircleComponent constructor:', this);
    }

    ngOnInit() {
        console.log('CircleComponent ngOnInit');
    }

    getFormFields(): Field[] {
        var formFields: Field[] = [];
        if (this.shape instanceof Circle) {
            formFields = [
                {
                    name: 'name',
                    label: 'Name:',
                    type: 'input',
                    inputType: 'text',
                    value: this.shape.shapeProperties.name
                },
                {
                    name: 'x',
                    label: 'X:',
                    type: 'input',
                    inputType: 'text',
                    value: this.shape.originX
                },
                {
                    name: 'y',
                    label: 'Y:',
                    type: 'input',
                    inputType: 'text',
                    value: this.shape.originY
                },
                {
                    name: 'r',
                    label: 'Radius:',
                    type: 'input',
                    inputType: 'text',
                    value: this.shape.r
                },
                {
                    name: 'strokeColor',
                    label: 'Stroke color:',
                    type: 'colorpicker',
                    inputType: 'text',
                    value: this.shape.shapeProperties.strokeColor
                },
                {
                    name: 'fillColor',
                    label: 'Fill color:',
                    type: 'colorpicker',
                    inputType: 'text',
                    value: this.shape.shapeProperties.fillColor
                },
                {
                    name: 'strokeWidth',
                    label: 'Stroke width:',
                    type: 'input',
                    inputType: 'text',
                    value: this.shape.shapeProperties.strokeWidth
                },
                {
                    type: "button",
                    label: "Submit"
                }];
        }
        return formFields;
    }

    updateShapeProperties(value: any) {
        console.log('CircleComponent : updateShapeProperties');
        if (this.shape instanceof Circle) {
            this.shape.shapeProperties.name = value.name;
            this.shape.originX = value.x;
            this.shape.originY = value.y;
            this.shape.r = value.r;
            this.shape.shapeProperties.fillColor = value.fillColor;
            this.shape.shapeProperties.strokeColor = value.strokeColor;
            this.shape.shapeProperties.strokeWidth = value.strokeWidth;
        }
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
        console.log('CircleComponent startDrawing at ', beginPosition);
        if (this.shape instanceof Circle) {
            this.shape.originX = beginPosition.x;
            this.shape.originY = beginPosition.y;
        }
    }

    draw(currentPosition: MousePosition): void {
        console.log('CircleComponent draw');
        if (this.shape instanceof Circle) {
            this.shape.r = Math.abs(currentPosition.x - this.shape.originX);
            //console.log('circle properties : ', this.shape.shapeProperties);
        }
    }

    setSelectionPoints(): void {

        // <!-- < svg: rect attr.x = "{{ shape.originX - shape.r }}" attr.y = "{{ shape.originY - shape.r }}" attr.width = "{{ shape.r * 2 }}"
        // attr.height = "{{ shape.r * 2 }}" style = "stroke: red; stroke-width: 1; stroke-dasharray:5; fill:none" /> -->

    }

    resizeShape(resizePosition: MousePosition) {
        console.log('CircleComponent: resizeShape ', resizePosition);
    }


}
