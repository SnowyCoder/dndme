

export function arrayRemoveElem<T>(arr: T[], elem: T): boolean {
    let index = arr.indexOf(elem);
    if (index !== -1) arr.splice(index, 1);
    return index !== -1;
}