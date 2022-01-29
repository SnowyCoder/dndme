export class UnionFindSet {
    parents: Array<number>;
    ranks: Array<number>;

    constructor(length: number) {
        this.parents = new Array(length);
        this.ranks = new Array(length);

        for (let i = 0; i < length; i++) {
            this.parents[i] = i;
            this.ranks[i] = 1;
        }
    }

    find(x: number): number {
        /*
        Path splitting:

        while x.parent ≠ x do
            (x, x.parent) := (x.parent, x.parent.parent)
        end while
        return x
        */
        let parent = this.parents[x];
        while (parent !== x) {
            const newpar = this.parents[parent];
            this.parents[x] = this.parents[newpar];
            x = parent;
            parent = newpar;
        }
        return parent;
    }

    union(a: number, b: number): number {
        a = this.find(a);
        b = this.find(b);

        if (a == b) {
            return -1;
        }

        let arank = this.ranks[a];
        let brank = this.ranks[b];
        if (arank < brank) {
            [a, b] = [b, a];
            // Do not swap ranks, we will not use their ordering later
        }

        this.parents[b] = a;
        if (arank === brank) {
            this.ranks[a] += 1;
        }
        return a;
    }
}