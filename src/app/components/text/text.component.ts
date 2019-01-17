import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { MousePosition, TextBox } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

import { Field } from 'dynaform';

@Component({
    selector: 'app-text',
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.css']
})
export class TextComponent extends ShapeComponent implements OnInit {
    constructor() {
        super();
        console.log('TextComponent constructor');
        this.shape = new TextBox();
        this.shapeType = ShapeType.TextBox;
    }

    ngOnInit() {
        console.log('TextComponent ngOnInit');
    }

    getFormFields(): Field[] {
        var formFields: Field[] = [];
        if (this.shape instanceof TextBox) {
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
                    name: 'value',
                    label: 'Text:',
                    type: 'input',
                    inputType: 'text',
                    value: this.shape.value
                },
                {
                    type: "button",
                    label: "Submit"
                }
            ];
        }
        return formFields;
    }

    updateShapeProperties(value: any) {
        console.log('TextComponent : updateShapeProperties');
        if (this.shape instanceof TextBox) {
            this.shape.shapeProperties.name = value.name;
            this.shape.value = value.value;
            this.shape.originX = value.x;
            this.shape.originY = value.y;
        }
    }

    setStyles() {
        let styles = {
            'fill': this.shape.shapeProperties.strokeColor
        };
        return styles;
    }

    startDrawing(beginPosition: MousePosition): void {
        if (this.shape instanceof TextBox) {
            this.shape.originX = beginPosition.x;
            this.shape.originY = beginPosition.y;
        }
        console.log('TextComponent startDrawing at ', beginPosition, ', ', this.shape);

    }

}
