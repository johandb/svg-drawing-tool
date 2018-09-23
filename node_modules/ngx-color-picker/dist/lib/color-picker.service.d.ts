import { Cmyk, Rgba, Hsla, Hsva } from './formats';
import { ColorPickerComponent } from './color-picker.component';
export declare class ColorPickerService {
    private active;
    constructor();
    setActive(active: ColorPickerComponent | null): void;
    hsva2hsla(hsva: Hsva): Hsla;
    hsla2hsva(hsla: Hsla): Hsva;
    hsvaToRgba(hsva: Hsva): Rgba;
    rgbaToCmyk(rgba: Rgba): Cmyk;
    rgbaToHsva(rgba: Rgba): Hsva;
    rgbaToHex(rgba: Rgba, allowHex8?: boolean): string;
    denormalizeRGBA(rgba: Rgba): Rgba;
    stringToHsva(colorString?: string, allowHex8?: boolean): Hsva | null;
    outputFormat(hsva: Hsva, outputFormat: string, alphaChannel: string | null): string;
}
