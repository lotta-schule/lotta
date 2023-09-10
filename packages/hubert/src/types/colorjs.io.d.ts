declare module 'colorjs.io' {
  export type Coords = [number, number, number];
  export type ColorSpace = unknown;
  class Color {
    constructor(colorSpace: string, coordinates: Coords, alpha?: number);
    constructor(color: string);
    constructor(color: Color);

    public coords: Coords;
    public alpha: number;

    public get space(): ColorSpace;
    public get spaceId(): string;
    public get white(): Coords;
    public get luminance(): number;

    public contrast(color: Color): number;
    public deltaE(color: Color, method: any): number;
    public inGamut(space: ColorSpace): boolean;
    // More methods here: https://colorjs.io/api/#Color#deltaE
    // Maybe I will come back later but I don't need detailed typing
    // yet.

    public toJSON(): any;

    public srgb: Coords & { r: number; g: number; b: number };
    // There is very much more, I don't need it yet
  }
  export default Color;
}
