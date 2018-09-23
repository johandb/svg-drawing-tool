import { Injectable } from '@angular/core';
import { ShapeComponent } from '../components/shape/shape.component';

@Injectable({
    providedIn: 'root'
})
export class ShapeService {

    shapes: ShapeComponent[] = [];

    constructor() {

    }
}
