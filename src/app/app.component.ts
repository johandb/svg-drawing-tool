import { Component, ContentChild, TemplateRef, OnInit, ComponentFactoryResolver, ViewContainerRef, Injector } from '@angular/core';

import { ShapeComponent } from './components/shape/shape.component';
import { ShapeProperties, MousePosition } from './model/shape';
import { ShapeType } from './model/shape-types';
import { ShapeService } from './service/shape.service';
import { LineComponent } from './components/line/line.component';
import { CircleComponent } from './components/circle/circle.component';
import { RectangleComponent } from './components/rectangle/rectangle.component';
import { SquareComponent } from './components/square/square.component';
import { EllipseComponent } from './components/ellipse/ellipse.component';
import { TextComponent } from './components/text/text.component';
import { ImageComponent } from './components/image/image.component';
import { PolyLineComponent } from './components/polyline/polyline.component';

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
    private selectedComponent: ShapeComponent;

    isDragging: boolean = false;
    isDrawing: boolean = false;
    isSelectingPoints: boolean = false;

    @ContentChild(TemplateRef) shapeTemplate: TemplateRef<any>;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef, private shapeService: ShapeService) {
        console.log('AppComponent constructor');
    }

    ngOnInit(): void {
        this.svg = document.querySelector('svg');
        console.log('svg:', this.svg);
        this.selectedShape = ShapeType.NoShape;
        console.log('AppComponent shapeProperties:', this.shapeProperties);
    }

    selectShape(shapeType: string): void {
        this.selectedShape = ShapeType[shapeType];
        this.shapeValue = ShapeType[this.selectedShape];
        this.isSelectingPoints = false;
        console.log('selected shape:', this.selectedShape);
    }

    clearShapes(): void {
        this.shapeService.removeAllShapeComponents();
    }

    getShapes(): ShapeComponent[] {
        return this.shapeService.getShapeComponents();
    }

    selectTool(toolType: string): void {
        console.log('selected tool:', toolType);
    }

    getMousePosition(event: MouseEvent) {
        var CTM = this.svg.getScreenCTM();
        this.currentPosition.x = (event.clientX - CTM.e) / CTM.a;
        this.currentPosition.y = (event.clientY - CTM.f) / CTM.d;
    }

    private buildComponent(shapeType: ShapeType): any {
        console.log('buildComponent for :', shapeType);
        switch (shapeType) {
            case ShapeType.Line:
                return LineComponent;
            case ShapeType.Circle:
                return CircleComponent;
            case ShapeType.Rectangle:
                return RectangleComponent;
            case ShapeType.Square:
                return SquareComponent;
            case ShapeType.Ellipse:
                return EllipseComponent;
            case ShapeType.TextBox:
                return TextComponent;
            case ShapeType.Image:
                return ImageComponent;
            case ShapeType.PolyLine:
                return PolyLineComponent;
        }
        return null;
    }

    onMouseDown(event): void {
        this.getMousePosition(event);
        console.log('mouse down svg : ', this.currentPosition, ', ', event, ', selectedComponent ', this.shapeComponent);
        console.log('isSelectingPoints :', this.isSelectingPoints);
        if (event.target.classList.contains('draggable')) {
            this.selectedComponent = this.shapeService.findShapeComponent(event.target.id);
            console.log(event.target.id, ' DRAGGING :', this.selectedComponent);
            this.startDragging(event);
        } else if (this.isSelectingPoints) {
            console.log('SELECT POINTS!!!! ', this.shapeComponent);
            this.shapeComponent.startDrawing(this.currentPosition);
        } else if (this.selectedShape != ShapeType.NoShape) {
            let injector = Injector.create([], this.viewContainerRef.parentInjector);
            let factory = this.componentFactoryResolver.resolveComponentFactory(this.buildComponent(this.selectedShape));
            let component = factory.create(injector);
            this.shapeComponent = <ShapeComponent>component.instance;

            this.shapeService.setShapeComponent(this.shapeComponent);

            console.log('create component ', this.selectedShape);
            console.log('component : ', this.shapeComponent);
            this.shapeComponent.shape.shapeProperties.fillColor = this.shapeProperties.fillColor;
            this.shapeComponent.shape.shapeProperties.strokeColor = this.shapeProperties.strokeColor;
            this.shapeComponent.shape.shapeProperties.strokeWidth = this.shapeProperties.strokeWidth;
            this.shapeProperties.name = this.shapeComponent.shape.shapeProperties.name;
            this.shapeComponent.startDrawing(this.currentPosition);
            console.log('component shape : ', this.shapeComponent.shape);
            if (this.selectedShape == ShapeType.PolyLine) {
                this.isSelectingPoints = true;
            }
            this.isDrawing = true;
        }
    }

    onMouseMove(event): void {
        this.getMousePosition(event);
        if (this.shapeComponent && this.isDrawing) {
            this.shapeComponent.draw(this.currentPosition);
        } else if (this.selectedComponent && this.isDragging) {
            console.log('DRAGGING move !!!');
            this.selectedComponent.drag(this.currentPosition);
        }
        //console.log('currentPosition:', this.currentPosition);
    }

    onMouseUp(event): void {
        this.getMousePosition(event);
        console.log('mouse up svg : ', this.shapeService.getShapeComponents());
        //this.selectedShape = ShapeType.NoShape;
        this.shapeValue = ShapeType[this.selectedShape];
        this.isDrawing = false;
        this.isDragging = false;
        this.selectedComponent = null;
    }

    startDragging(event): void {
        this.isDragging = true;
        console.log('startDragging()');
        // Make sure the first transform on the element is a translate transform
    }

    dragComponent(event): void {
        console.log('dragComponent()');
    }

    endDragging(): void {
        this.selectedComponent = null;
        console.log('endDragging()');
    }
}
