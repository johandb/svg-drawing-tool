import { Directive, Input, ViewContainerRef, OnInit } from '@angular/core';
import { ShapeComponent } from '../components/shape/shape.component';
import { ShapeService } from '../service/shape.service';

@Directive({
    selector: '[svg-dynamic]'
})
export class DynamicSvgDirective {

    @Input() component: ShapeComponent;

    constructor(private viewContainerRef: ViewContainerRef, private shapeService: ShapeService) {
    }

    ngOnInit() {
        console.log('DynamicSvgDirective ngOnInit() - component : ', this.component);

        let shapeComponent: ShapeComponent = this.shapeService.getShapeComponent();
        this.viewContainerRef.createEmbeddedView(shapeComponent.shapeTemplate);
    }

    ngOnDestroy() {
        console.log('DynamicSvgDirective ngOnDestroy()');
        this.viewContainerRef.clear();
    }
}
