import { Injectable } from '@angular/core';
import { ShapeComponent } from '../components/shape/shape.component';

@Injectable({
    providedIn: 'root'
})
export class ShapeService {

    private shapesComponents: ShapeComponent[] = [];

    private selectedComponent: ShapeComponent;

    constructor() {
        console.log('ShapeService constructor() :', this.selectedComponent);
    }

    getShapeComponents(): ShapeComponent[] {
        return this.shapesComponents;
    }

    removeAllShapeComponents(): void {
        this.shapesComponents = [];
    }

    setShapeComponent(component: ShapeComponent): void {
        this.selectedComponent = component;
        this.shapesComponents.push(component);
        console.log('ShapeService component : ', component);
        console.log('ShapeService shapes : ', this.shapesComponents);
    }

    getShapeComponent(): ShapeComponent {
        return this.selectedComponent;
    }

    findShapeComponent(name: string): ShapeComponent {
        console.log('find name : ', name);
        for (var i = 0; i < this.shapesComponents.length; i++) {
            console.log('FIND JSON : ', JSON.stringify(this.shapesComponents[i].shape));
        }

        return this.shapesComponents.find(x => x.shape.shapeProperties.name == name);
    }
}
