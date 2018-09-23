import { ShapeComponent } from "../components/shape/shape.component";
import { ShapeType } from "../model/shape-types";
import { LineComponent } from "../components/line/line.component";
import { CircleComponent } from "../components/circle/circle.component";
import { RectangleComponent } from "../components/rectangle/rectangle.component";
import { SquareComponent } from "../components/square/square.component";
import { EllipseComponent } from "../components/ellipse/ellipse.component";
import { TextComponent } from "../components/text/text.component";

export class ShapeComponentFactory {

    public static createShape(shapeType: ShapeType): ShapeComponent {
        console.log('ShapeComponentFactory createShape for ', shapeType);
        switch (shapeType) {
            case ShapeType.Line:
                return new LineComponent();
            case ShapeType.Circle:
                return new CircleComponent();
            case ShapeType.Rectangle:
                return new RectangleComponent();
            case ShapeType.Square:
                return new SquareComponent();
            case ShapeType.Ellipse:
                return new EllipseComponent();
            case ShapeType.TextBox:
                return new TextComponent();
        }
        return null;
    }
}