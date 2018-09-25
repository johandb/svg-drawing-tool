import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { MousePosition, TextBox } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

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

    setStyles() {
        let styles = {
            'fill': this.shape.shapeProperties.strokeColor
        };
        return styles;
    }

    startDrawing(beginPosition: MousePosition): void {
        if (this.shape instanceof TextBox) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
        console.log('TextComponent startDrawing at ', beginPosition, ', ', this.shape);

    }

}
