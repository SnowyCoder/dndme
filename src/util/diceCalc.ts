
class Context {
    expr: string;
    curr: number;

    constructor(expr: string, curr: number) {
        this.expr = expr;
        this.curr = curr;
    }

    copyFrom(c: Context): void {
        this.expr = c.expr;
        this.curr = c.curr;
    }

    peek(): string | null {
        return this.curr > this.expr.length ? null :  this.expr[this.curr];
    }

    consumeWhitespace() {
        while (this.curr < this.expr.length && ' \t\n'.includes(this.expr[this.curr])) this.curr++;
    }

    consumeStr(x: string): boolean {
        this.consumeWhitespace;
        if (this.expr.substring(this.curr).startsWith(x)) {
            this.curr += x.length;
            return true;
        }
        return false;
    }
}

function cparseFloat(c: Context): number | null {
    const start = c.curr;
    const re = /^[+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?/;
    const res = c.expr.substring(c.curr).match(re);
    if (!res) return null;
    c.curr += res[0].length;
    return parseFloat(res[0]);
}

function cparseTerm(c: Context): number | null {
    c.consumeWhitespace();
    if (!c.consumeStr('(')) return cparseFloat(c);
    const i = c.expr.indexOf(')', c.curr);
    if (i === -1) throw Error();
    const nested = new Context(c.expr.substring(c.curr, i), 0);
    c.curr = i + 1;
    return parseExpr(nested);
}

function parseDiceNumber(x: Context): number | null {
    let left = cparseTerm(x);
    x.consumeWhitespace();
    const hasD = x.peek() == 'd';
    if (!hasD) return left;
    left = left ?? 1;
    if ((left | 0) !== left) return left;
    x.curr++;
    const right = cparseTerm(x);
    if (right === null) throw Error();

    const times = Math.abs(left | 0);
    const num = Math.abs(Math.floor(right));
    let sum = 0;
    for (let i = 0; i < times; i++) {
        sum += 1 + Math.floor(Math.random() * num);
    }
    if (left < 0) sum = -sum;
    return sum;
}

function parseExp(x: Context): number | null {
    const n = parseDiceNumber(x);
    if (n === null) return null;
    if (!x.consumeStr("^")) {
        return n;
    }
    const r = parseDiceNumber(x);
    if (r == null) throw Error();
    return n ** r;
}

function parseMul(x: Context): number | null {
    const n = parseExp(x);
    if (n === null) return null;
    x.consumeWhitespace();
    const isMul = x.peek() == '*';
    if (!(isMul || x.peek() == '/')) {
        return n;
    }
    x.curr++;
    const r = parseMul(x);
    if (r == null) throw Error();
    return isMul ? n * r : n / r;
}

function parseAdd(x: Context): number | null {
    const n = parseMul(x);
    if (n === null) return null;
    x.consumeWhitespace();
    const isPlus = x.peek() == '+';
    if (!(isPlus || x.peek() == '-')) {
        return n;
    }
    x.curr++;
    const r = parseAdd(x);
    if (r == null) throw Error();
    return isPlus ? n + r : n - r;
}

function parseExpr(x: Context): number {
    const n = parseAdd(x);
    if (n === null) throw Error();
    if (x.expr.substring(x.curr).trim() !== '') throw Error();
    return n;
}

export function diceComputeExpr(x: string): number {
    if (x.trim() === '') return 0;
    return parseExpr(new Context(x, 0));
}
