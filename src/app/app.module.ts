import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { ColorPickerModule } from 'ngx-color-picker';

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
import { DynamicFieldDirective } from './directives/dynamic-field.directive';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { CheckboxComponent } from './control/checkbox/checkbox.component';
import { InputComponent } from './control/input/input.component';
import { RadiobuttonComponent } from './control/radiobutton/radiobutton.component';
import { SelectComponent } from './control/select/select.component';

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
        DynamicFieldDirective,
        DynamicFormComponent,
        CheckboxComponent,
        InputComponent,
        RadiobuttonComponent,
        SelectComponent
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
        InputComponent,
        SelectComponent,
        CheckboxComponent,
        RadiobuttonComponent
    ], imports: [
        BrowserModule,
        ColorPickerModule,
        FormsModule,
        ReactiveFormsModule
    ],
    providers: [
        ShapeService
    ],
    bootstrap: [AppComponent],

})
export class AppModule { }
