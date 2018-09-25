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
}
