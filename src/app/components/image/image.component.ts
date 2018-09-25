import { Component, OnInit } from '@angular/core';
import { ShapeComponent } from '../shape/shape.component';
import { ImageBox, MousePosition } from '../../model/shape';
import { ShapeType } from '../../model/shape-types';

@Component({
    selector: 'app-image',
    templateUrl: './image.component.html',
    styleUrls: ['./image.component.css']
})
export class ImageComponent extends ShapeComponent implements OnInit {

    constructor() {
        super();
        console.log('ImgeComponent constructor');
        this.shape = new ImageBox();
        this.shapeType = ShapeType.Image;
    }

    ngOnInit() {
        console.log('ImageComponent ngOnInit');
    }

    startDrawing(beginPosition: MousePosition): void {
        if (this.shape instanceof ImageBox) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
        console.log('ImageComponent startDrawing at ', beginPosition, ', ', this.shape);
    }

    draw(currentPosition: MousePosition): void {
        console.log('ImageComponent draw');
        if (this.shape instanceof ImageBox) {
            this.shape.width = Math.abs(currentPosition.x - this.shape.x1);
            this.shape.height = Math.abs(currentPosition.y - this.shape.y1);
        }
    }

}
