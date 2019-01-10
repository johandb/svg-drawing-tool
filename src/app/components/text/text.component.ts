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
    formFields: Field[] = [
        {
            name: 'x',
            label: 'X:',
            type: 'input',
            inputType: 'text',
            value: ''
        },
        {
            name: 'y',
            label: 'Y:',
            type: 'input',
            inputType: 'text',
            value: ''
        },
        {
            name: 'value',
            label: 'Text:',
            type: 'input',
            inputType: 'text',
            value: ''
        }
    ];

    constructor() {
        super();
        console.log('TextComponent constructor');
        this.shape = new TextBox();
        this.shapeType = ShapeType.TextBox;
    }

    ngOnInit() {
        console.log('TextComponent ngOnInit');
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
