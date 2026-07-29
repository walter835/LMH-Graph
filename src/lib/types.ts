interface GraphPoint {
    x: Date;
    y: number;
}
interface GraphLine {
    name: string;
    color: string;
    points: GraphPoint[];
}
export type { GraphPoint, GraphLine };