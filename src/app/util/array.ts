

export function arrayRemoveElem<T>(arr: T[], elem: T): boolean {
    let index = arr.indexOf(elem);
    if (index !== -1) arr.splice(index, 1);
    return index !== -1;
}

export function arrayFilterInPlace<T>(a: T[], condition: (x: T) => boolean) {
    let i = 0, j = 0;

    while (i < a.length) {
        const val = a[i];
        if (condition(val)) a[j++] = val;
        i++;
    }

    a.length = j;
    return a;
}