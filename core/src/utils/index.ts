export function hostContext(selector: string, el: HTMLElement): boolean {
    return el.closest(selector) !== null;
}

export type Flag = boolean | 'true' | 'false' | '';

export function toNum(input: string | number): number {
    if (!input) return 0;
    if (typeof input === 'number') return input;
    return (input.indexOf('.') > -1) ? Number.parseFloat(input) : Number.parseInt(input);
}

export function toBool(input: Flag): boolean {
    return (input === true || input === false) ? input : (input === '' || input === 'true');
}

export function commas(input: number|string) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}