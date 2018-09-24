import { Component, ContentChild, TemplateRef, OnInit } from '@angular/core';

import { LineComponent } from './components/line/line.component';
import { ShapeComponent } from './components/shape/shape.component';
import { ShapeProperties, MousePosition } from './model/shape';
import { ShapeType } from './model/shape-types';
import { ShapeComponentFactory } from './service/shape.factory';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'Component Editor';

    svg: any;
    currentPosition: MousePosition = new MousePosition();

    shapeProperties: ShapeProperties = new ShapeProperties();

    private selectedShape: ShapeType;
    public shapeValue: string;
    private shapeComponent: ShapeComponent;

    isDragging: boolean = false;

    shapes: ShapeComponent[] = [];

    @ContentChild(TemplateRef) shapeTemplate: TemplateRef<any>;

    constructor() {
        console.log('constructor');
        console.log('shapeProperties:', this.shapeProperties);
        this.selectedShape = ShapeType.NoShape;
    }

    ngOnInit(): void {
        this.svg = document.querySelector('svg');
        console.log('svg:', this.svg);
    }

    selectShape(shapeType: string): void {
        this.selectedShape = ShapeType[shapeType];
        this.shapeValue = ShapeType[this.selectedShape];
        console.log('selected shape:', this.selectedShape);

    }

    selectTool(toolType: string): void {
        console.log('selected tool:', toolType);
    }

    getMousePosition(event: MouseEvent) {
        var CTM = this.svg.getScreenCTM();
        this.currentPosition.x = (event.clientX - CTM.e) / CTM.a;
        this.currentPosition.y = (event.clientY - CTM.f) / CTM.d;
    }

    onMouseDown(event: MouseEvent): void {
        this.getMousePosition(event);
        console.log('mouse down svg : ', this.currentPosition, ', ', event);
        if (this.selectedShape != ShapeType.NoShape) {
            console.log('create component ', this.selectedShape);
            this.shapeComponent = ShapeComponentFactory.createShape(this.selectedShape);
            console.log('component : ', this.shapeComponent);
            this.shapeComponent.shape.shapeProperties = Object.assign({}, this.shapeProperties);
            this.shapeComponent.startDragging(this.currentPosition);
            this.shapes.push(this.shapeComponent);
            console.log('component shape : ', this.shapeComponent.shape);
            this.isDragging = true;
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.getMousePosition(event);
        if (this.shapeComponent && this.isDragging) {
            this.shapeComponent.mouseDragged(this.currentPosition);
        }
        //console.log('currentPosition:', this.currentPosition);
    }

    onMouseUp(event: MouseEvent): void {
        this.getMousePosition(event);
        console.log('mouse up svg : ', this.currentPosition);
        //this.selectedShape = ShapeType.NoShape;
        this.shapeValue = ShapeType[this.selectedShape];
        this.isDragging = false;
    }
}
