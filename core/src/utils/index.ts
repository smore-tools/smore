export function hostContext(selector: string, el: HTMLElement): boolean {
    return el.closest(selector) !== null;
}

export type BooleanAttr<T extends string> = boolean | '' | T;

export function toNum(input: string | number): number {
    if (!input) return 0;
    if (typeof input === 'number') return input;
    return (input.indexOf('.') > -1) ? Number.parseFloat(input) : Number.parseInt(input);
}

export function toBool<T extends string>(input: BooleanAttr<T>, name: T): boolean {
    if (typeof input === 'boolean') {
        return input;
    } else {
        return (typeof input === 'string' && (input === name || input === ''));
    }
}

export function commas(input: number|string) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}