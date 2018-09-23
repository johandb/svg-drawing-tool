export declare enum ColorFormats {
    HEX = 0,
    RGBA = 1,
    HSLA = 2
}
export declare class Cmyk {
    c: number;
    m: number;
    y: number;
    k: number;
    constructor(c: number, m: number, y: number, k: number);
}
export declare class Hsla {
    h: number;
    s: number;
    l: number;
    a: number;
    constructor(h: number, s: number, l: number, a: number);
}
export declare class Hsva {
    h: number;
    s: number;
    v: number;
    a: number;
    constructor(h: number, s: number, v: number, a: number);
}
export declare class Rgba {
    r: number;
    g: number;
    b: number;
    a: number;
    constructor(r: number, g: number, b: number, a: number);
}
