export function toNum(input: string | number): number {
    if (!input) return 0;
    if (typeof input === 'number') return input;
    return (input.indexOf('.') > -1) ? Number.parseFloat(input) : Number.parseInt(input);
}

export function commas(input: number|string) {
    return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}