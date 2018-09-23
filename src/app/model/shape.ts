import { ShapeType } from './shape-types';

/*
 * The MousePosition object
 */
export class MousePosition {
    x: number;
    y: number;

    constructor() {
        this.x = 0;
        this.y = 0;
    }
}

/*
 * The ShapeProperties object
 */
export class ShapeProperties {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    fill: boolean;
    stroke: boolean;
    shapeType: ShapeType;

    constructor() {
        this.fill = true;
        this.fillColor = '#ebe5e5';
        this.stroke = true;
        this.strokeColor = 'black';
        this.strokeWidth = 1;
    }
}

/*
 * Interface for the shapes 
 */
export interface BaseShape {
}

/*
 * The Shape object
 */
export class Shape implements BaseShape {
    public id: string;
    public name: string;
    public clickable: boolean;
    public visible: boolean;
    public shapeProperties: ShapeProperties;

    constructor() {
        this.shapeProperties = new ShapeProperties();
    }
}

/*
 * The Line class.
 */
export class Line extends Shape {

    public x1: number;
    public x2: number;
    public y1: number;
    public y2: number;

    constructor() {
        super();
        this.x1 = this.y1 = this.x2 = this.y2 = 0;
        console.log('Line constructor ', this);
    }

}

/*
 * The Circle class.
 */
export class Circle extends Shape {

    public x1: number;
    public y1: number;
    public r: number;

    constructor() {
        super();
        this.x1 = this.y1 = this.r = 0;
        console.log('Circle constructor ', this);
    }
}

/*
 * The Rectangle class.
 */
export class Rectangle extends Shape {

    public x1: number;
    public y1: number;
    public width: number;
    public height: number;

    constructor() {
        super();
        this.x1 = this.y1 = this.width = this.height = 0;
        console.log('Rectangle constructor ', this);
    }
}

/*
 * The Ellipse class.
 */
export class Ellipse extends Shape {

    public x1: number;
    public y1: number;
    public rx: number;
    public ry: number;

    constructor() {
        super();
        this.x1 = this.y1 = this.rx = this.ry = 0;
        console.log('Ellipse constructor ', this);
    }
}

/*
 * The TextBox class.
 */
export class TextBox extends Shape {

    public x1: number;
    public y1: number;
    public value: string;

    constructor() {
        super();
        this.x1 = this.y1 = 0;
        this.value = 'Some text';
        console.log('Text constructor ', this);
    }
}
