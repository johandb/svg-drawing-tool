import { Directive, Input, Type, ComponentFactoryResolver, ViewContainerRef, Injector } from '@angular/core';
import { ShapeComponent } from '../components/shape/shape.component';
import { ShapeType } from '../model/shape-types';
import { LineComponent } from '../components/line/line.component';
import { CircleComponent } from '../components/circle/circle.component';
import { RectangleComponent } from '../components/rectangle/rectangle.component';
import { EllipseComponent } from '../components/ellipse/ellipse.component';
import { SquareComponent } from '../components/square/square.component';
import { TextComponent } from '../components/text/text.component';
import { ImageComponent } from '../components/image/image.component';

@Directive({
    selector: '[svg-dynamic]'
})
export class DynamicSvgDirective {

    @Input() data: ShapeComponent;

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private viewContainerRef: ViewContainerRef) {
    }

    ngOnInit() {
        console.log('DynamicSvgDirective ngOnInit()');
        console.log('DynamicSvgDirective data:', this.data);

        let injector = Injector.create([], this.viewContainerRef.parentInjector);
        let factory = this.componentFactoryResolver.resolveComponentFactory(this.buildComponent(this.data.shapeType));
        let component = factory.create(injector);
        let shapeComponent: ShapeComponent = <ShapeComponent>component.instance;
        shapeComponent.shape = this.data.shape;
        console.log('shapeComponent : ', shapeComponent);
        this.viewContainerRef.createEmbeddedView(shapeComponent.shapeTemplate);
    }

    ngOnDestroy() {
        console.log('DynamicSvgDirective ngOnDestroy()');
        this.viewContainerRef.clear();
    }

    private buildComponent(data: ShapeType): any {
        console.log('buildComponent for :', data);
        switch (data) {
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
        }
        return null;
    }

}
