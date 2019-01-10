import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ColorPickerModule } from 'ngx-color-picker';
import { DynaformModule } from 'dynaform';

import { ShapeService } from './service/shape.service';

import { AppComponent } from './app.component';
import { LineComponent } from './components/line/line.component';
import { CircleComponent } from './components/circle/circle.component';
import { RectangleComponent } from './components/rectangle/rectangle.component';
import { DynamicSvgDirective } from './directives/dynamic-svg.directive';
import { ShapeComponent } from './components/shape/shape.component';
import { SquareComponent } from './components/square/square.component';
import { EllipseComponent } from './components/ellipse/ellipse.component';
import { TextComponent } from './components/text/text.component';
import { GroupComponent } from './components/group/group.component';
import { ImageComponent } from './components/image/image.component';
import { PolyLineComponent } from './components/polyline/polyline.component';
import { PathComponent } from './components/path/path.component';
import { ShapePropertiesComponent } from './components/shapeproperties/shapeproperties.component';

@NgModule({
    declarations: [
        AppComponent,
        LineComponent,
        CircleComponent,
        RectangleComponent,
        DynamicSvgDirective,
        ShapeComponent,
        SquareComponent,
        EllipseComponent,
        TextComponent,
        GroupComponent,
        ImageComponent,
        PolyLineComponent,
        PathComponent,
        ShapePropertiesComponent,
    ],
    entryComponents: [
        ShapeComponent,
        LineComponent,
        CircleComponent,
        RectangleComponent,
        SquareComponent,
        EllipseComponent,
        TextComponent,
        GroupComponent,
        ImageComponent,
        PolyLineComponent,
        PathComponent,
    ], imports: [
        BrowserModule,
        ColorPickerModule,
        FormsModule,
        ReactiveFormsModule,
        DynaformModule
    ],
    providers: [
        ShapeService
    ],
    bootstrap: [AppComponent],

})
export class AppModule { }
