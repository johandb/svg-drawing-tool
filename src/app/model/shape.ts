import { ShapeType, State } from './shape-types';

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
    name: string;
    visible: boolean;

    constructor() {
        this.fill = true;
        this.fillColor = '#e7e7e7';
        this.stroke = true;
        this.strokeColor = 'black';
        this.strokeWidth = 1;
        this.name = 'unknown';
        this.visible = true;
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
    shapeProperties: ShapeProperties;
    public originX: number;
    public originY: number;

    constructor(name: string) {
        this.shapeProperties = new ShapeProperties();
        this.originX = this.originY = 0;
        this.shapeProperties.name = name;
    }
}

/*
 * The Line class.
 */
export class Line extends Shape {

    private static id: number = 0;

    public x2: number;
    public y2: number;

    constructor() {
        super('line-' + Line.id++);
        this.x2 = this.y2 = 0;
        console.log('Line constructor ', this);
    }
}

/*
 * The Circle class.
 */
export class Circle extends Shape {
    private static id: number = 0;

    public r: number;

    constructor() {
        super('circle-' + Circle.id++);
        this.r = 0;
        console.log('Circle constructor ', this);
    }
}

/*
 * The Rectangle class.
 */
export class Rectangle extends Shape {
    private static id: number = 0;

    public width: number;
    public height: number;

    constructor() {
        super('rectangle-' + Rectangle.id++);
        this.width = this.height = 0;
        console.log('Rectangle constructor ', this);
    }
}

/*
 * The Square class.
 */
export class Square extends Shape {
    private static id: number = 0;

    public width: number;

    constructor() {
        super('square-' + Square.id++);
        this.width = 0;
        console.log('Rectangle constructor ', this);
    }
}

/*
 * The Ellipse class.
 */
export class Ellipse extends Shape {
    private static id: number = 0;

    public rx: number;
    public ry: number;

    constructor() {
        super('ellipse-' + Ellipse.id++);
        this.rx = this.ry = 0;
        console.log('Ellipse constructor ', this);
    }
}

/*
 * The TextBox class.
 */
export class TextBox extends Shape {
    private static id: number = 0;

    public value: string;

    constructor() {
        super('text-' + TextBox.id++);
        this.value = 'Some text';
        console.log('Text constructor ', this);
    }
}

/*
 * The Image class.
 */
export class ImageBox extends Shape {
    private static id: number = 0;

    public width: number;
    public height: number;
    public url: string;

    constructor() {
        super('image-' + ImageBox.id++);
        this.width = this.height = 0;
        this.url = 'assets/pictures/tiger.png';
        console.log('Image constructor ', this);
    }
}

/*
 * The PolyLine class.
 */
export class PolyLine extends Shape {
    private static id: number = 0;

    public points: MousePosition[];

    constructor() {
        super('polyline-' + PolyLine.id++);
        this.points = [];
        console.log('PolyLine constructor ', this);
    }
}

/*
 * The Path class.
 */
export class Path extends Shape {
    private static id: number = 0;

    public points: MousePosition[];
    public state: State;

    constructor() {
        super('path-' + Path.id++);
        this.points = [];
        this.state = State.None;
        console.log('Path constructor ', this);
    }
}
