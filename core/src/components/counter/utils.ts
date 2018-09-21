export function parseInput(input: string) {
    let value: number;
    let decimals: number;
    let commas: boolean;

    input = input.trim();
    let num: string = (input.match(/[\d.,]+/)||['0'])[0];
    const [prefix, suffix] = input.split(num);

    commas = (num.indexOf(',') > -1);
    if (commas) num = num.replace(/,/g, '');
    if (num.indexOf('.') > -1) {
        decimals = num.split('.')[1].length;
        value = Number.parseFloat(num);
    } else {
        decimals = 0;
        value = Number.parseInt(num);
    }

    return { prefix, value, suffix, decimals, commas }
}