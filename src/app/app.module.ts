import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ColorPickerModule } from 'ngx-color-picker';
import { CommonModule } from '@angular/common';

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
        ImageComponent
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
        ImageComponent
    ], imports: [
        BrowserModule,
        ColorPickerModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
