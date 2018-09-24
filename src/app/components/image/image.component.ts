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

    startDragging(beginPosition: MousePosition): void {
        if (this.shape instanceof ImageBox) {
            this.shape.x1 = beginPosition.x;
            this.shape.y1 = beginPosition.y;
        }
        console.log('ImageComponent startDragging at ', beginPosition, ', ', this.shape);
    }

    mouseDragged(currentPosition: MousePosition): void {
        console.log('ImageComponent mouseDragged');
        if (this.shape instanceof ImageBox) {
            this.shape.width = Math.abs(currentPosition.x - this.shape.x1);
            this.shape.height = Math.abs(currentPosition.y - this.shape.y1);
            if (this.shape.width == 0 || this.shape.height == 0) {
                this.shape.width = this.shape.height = 50;
            }
        }
    }

}
