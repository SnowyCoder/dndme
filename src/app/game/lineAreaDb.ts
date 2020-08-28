import {aabbAabbIntersect} from "../util/geometry";

interface Line {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export class LineAreaDb {
    /*
     * For now it's a simple AABB-like implementation, in the future a binary-search approach could be
     * implemented to skim the input data.
     */

    private lines = new Array<Line>();

    addLine(line: Line): void {
        this.lines.push(line);
    }

    removeLine(line: Line): void {
        let i = this.lines.findIndex(v => v.minX == line.minX && v.minY == line.minY && v.maxX == line.maxX && v.maxY == line.maxY);
        if (i >= 0) this.lines.splice(i, 1);
    }

    /**
     * Get lines that are (more or less) inside the AABB,
     *
     * This uses the lines as another AABB and does a (really fast) AABB vs AABB check to filter the lines
     *
     * @param minX top-left point
     * @param minY bottom-left point
     * @param maxX top-right point
     * @param maxY bottom-right point
     */
    *queryAabb(minX: number, minY: number, maxX: number, maxY: number): Generator<Line> {
        let lines = this.lines;
        let lineLen = lines.length;
        for (let i = 0; i < lineLen; i++) {
            let l = lines[i];

            let mx = l.minX;
            let my = l.minY;
            let Mx = l.maxX;
            let My = l.maxY;
            if (mx > Mx) [mx, Mx] = [Mx, mx];
            if (my > My) [my, My] = [My, my];

            //console.log("TEST " +  [l.minX, l.minY, l.maxX, l.maxY] + " vs " + [minX, minY, maxX, maxY]);
            if (aabbAabbIntersect(mx, my, Mx, My, minX, minY, maxX, maxY)) {
                yield l;
            }
        }
    }
}

