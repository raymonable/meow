export interface ChartNote {
    type: "tap" | "air"; // TODO: add other note types
    subtype?: number;
    
    position: number, // in beats
    computedPosition?: number, // don't set this manually
    visualPosition?: number, // also don't set this manually

    width: number, // 2 - 16
    offset: number // 0 - 16
};

export class Chart {
    bpm: number = 120;
    offset: number = 0;
    data: ChartNote[] = [];
};