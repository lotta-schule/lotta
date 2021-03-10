export interface SlatePre050Document {
    nodes: SlatePre050Node[];
    operations: [];
    selection: null;
    marks: null;
}

export interface SlatePre050Node {
    object: 'block' | 'inline' | 'text' | 'mark';
    text?: string;
    marks?: SlatePre050Node[];
    type: string;
    data: { [key: string]: any };
    nodes: SlatePre050Node[];
}
