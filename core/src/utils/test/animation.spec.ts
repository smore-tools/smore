import { parse } from '../animation';

function matchKeywords(key: string, keywords: string[], pattern: string): boolean {
    let results = keywords.map(k => parse(pattern.replace('%s', k)))
    return results.every((props, i) => props[key] === keywords[i]);
}

describe('parse', () => {
    it('should return default props', () => {
        expect(parse('')).toEqual({
            delay: 0,
            direction: 'normal',
            duration: 0,
            fillMode: 'none',
            iterationCount: 1,
            playState: 'running',
            easing: null,
            name: null
        })
    });

    it('should throw if Global CSS keyword', () => {
        const values = [`initial`, `inherit`, `unset`, `none`];
        values.forEach(value => {
            expect(() => parse(value)).toThrow(/^Global CSS keyword/);
        })
    });

    describe('delay', () => {
        it('should parse', () => {
            const { delay } = parse('1s 100ms');
            expect(delay).toBeTruthy();
        })
        
        // Same handling as 'duration', so only differences need to be tested
        it('should handle negative integer', () => {
            const { delay } = parse('0ms -456ms');
            expect(delay).toEqual(-456);
        });
    });

    describe('direction', () => {
        let keywords: string[];
        
        beforeEach(() => {
            keywords = [ 'normal', 'reverse', 'alternate', 'alternate-reverse' ]
        })
        
        it('should match keywords', () => {
            expect(matchKeywords('direction', keywords, '100ms %s')).toBeTruthy();
        })

        it('should match keywords regardless of location', () => {
            expect(matchKeywords('direction', keywords, '%s 100ms')).toBeTruthy();
        })
    });

    describe('duration', () => {
        it('should parse', () => {
            const { duration } = parse('100ms');
            expect(duration).toBeTruthy();
        })

        it('should ignore values without leading digit', () => {
            const { duration } = parse('coolms');
            expect(duration).toEqual(0);
        })

        it('should ignore values without unit', () => {
            const { duration } = parse('12');
            expect(duration).toEqual(0);
        })

        it('should handle positive integer', () => {
            const { duration } = parse('12s');
            expect(duration).toEqual(12000);
        });

        it('should handle non-integer', () => {
            const { duration } = parse('4.3ms');
            expect(duration).toEqual(4.3);
        });

        it('should handle units case-insensitively', () => {
            const { duration } = parse('14mS');
            expect(duration).toEqual(14);
        });

        it('should handle zero with a leading + and unit', () => {
            const { duration } = parse('+0s');
            expect(duration).toEqual(0);
        });

        it('should throw if negative', () => {
            expect(() => parse('-456ms')).toThrow(/^Invalid <animation-duration>/);
        });

        it('should convert milliseconds', () => {
            const { duration } = parse('100ms');
            expect(duration).toEqual(100);
        });

        it('should convert seconds', () => {
            const { duration } = parse('1s');
            expect(duration).toEqual(1000);
        });
    });

    describe('easing', () => {
        it('should parse', () => {
            const { easing } = parse('linear');
            expect(easing).toBeTruthy();
        });

        describe('linear', () => {
            it('should set easing type', () => {
                const type = 'linear';
                const { easing } = parse(`100ms ${type}`);
                expect(easing.type).toEqual(type);
                expect(easing.value).toBeUndefined();
            })
        });

        describe('cubic-bezier', () => {
            it('should match keywords', () => {
                const keywords = ['ease', 'ease-in', 'ease-out', 'ease-in-out'];
                const results = keywords.map(k => parse(`100ms ${k}`));
                expect(results.every(({ easing }) => easing.type === 'cubic-bezier')).toBeTruthy();
            })

            it('should convert "ease"', () => {
                const { easing } = parse(`100ms ease`);
                const value = { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 };
                expect(easing.value).toEqual(value);
            })
            it('should convert "ease-in"', () => {
                const { easing } = parse(`100ms ease-in`);
                const value = { x1: 0.42, y1: 0, x2: 1, y2: 1 };
                expect(easing.value).toEqual(value);
            })
            it('should convert "ease-out"', () => {
                const { easing } = parse(`100ms ease-out`);
                const value = { x1: 0, y1: 0, x2: 0.58, y2: 1 };
                expect(easing.value).toEqual(value);
            })
            it('should convert "ease-in-out"', () => {
                const { easing } = parse(`100ms ease-in-out`);
                const value = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
                expect(easing.value).toEqual(value);
            })

            it('should match cubic-bezier function', () => {
                let value = {
                    x1: 0.895,
                    y1: 0.03,
                    x2: 0.685,
                    y2: 0.22
                };
                const { easing } = parse(`100ms cubic-bezier(${value.x1}, ${value.y1}, ${value.x2}, ${value.y2})`);
                expect(easing).toEqual({ type: 'cubic-bezier', value });
            })

            it('should throw if fewer than 4 arguments are given', () => {
                expect(() => parse(`cubic-bezier(0, 1, 0)`)).toThrow(/^Invalid <cubic-bezier-timing-function>/);
            })

            it('should throw if more than 4 arguments are given', () => {
                expect(() => parse(`cubic-bezier(0, 1, 0, 1, 0)`)).toThrow(/^Invalid <cubic-bezier-timing-function>/);
            })

            it('should throw if unrecognized keyword', () => {
                expect(() => parse(`cubic-bezier(0, 1, oops, 1)`)).toThrow(/^Invalid <cubic-bezier-timing-function>/);
            })
        });

        describe('step', () => {
            it('should match keywords', () => {
                const keywords = ['step-start', 'step-end'];
                const results = keywords.map(k => parse(`100ms ${k}`));
                expect(results.every(({ easing }) => easing.type === 'steps')).toBeTruthy();
            })

            it('should convert "step-start"', () => {
                const { easing } = parse(`100ms step-start`);
                const value = [1, 'start'];
                expect(easing.value).toEqual(value);
            })
            it('should convert "step-end"', () => {
                const { easing } = parse(`100ms step-end`);
                const value = [1, 'end'];
                expect(easing.value).toEqual(value);
            })

            it('should match steps function', () => {
                let value = [4, 'start'];
                let { easing } = parse(`100ms steps(${value.join(', ')})`);
                expect(easing.type).toEqual('steps');
                expect(easing.value).toEqual(value);
            })

            it('should default second parameter to "end"', () => {
                let { easing } = parse(`100ms steps(4)`);
                expect(easing.type).toEqual('steps');
                expect(easing.value).toEqual([4, 'end']);
            })

            it('should throw if arguments are flipped', () => {
                expect(() => parse(`100ms steps(start, 4)`)).toThrow(/^Invalid <step-timing-function>/);
            })

            it('should throw if more than two arguments are given', () => {
                expect(() => parse(`100ms steps(4, 12, end)`)).toThrow(/^Invalid <step-timing-function>/);
            })

            it('should throw if float', () => {
                expect(() => parse(`100ms steps(4.5)`)).toThrow(/^Invalid <step-timing-function>/);
            })
            
            it('should throw if unrecognized keyword', () => {
                expect(() => parse(`100ms steps(69, nice)`)).toThrow(/^Invalid <step-timing-function>/);
            })
        })

        describe('frames', () => {
            it('should match frames function', () => {
                const type = 'frames';
                const { easing } = parse(`100ms frames(10)`);
                expect(easing.type).toEqual(type);
                expect(easing.value).toEqual(10);
            })

            it('should throw if float', () => {
                expect(() => parse(`100ms frames(4.5)`)).toThrow(/^Invalid <frames-timing-function>/);
            })

            it('should throw if fewer than one argument is given', () => {
                expect(() => parse(`100ms frames()`)).toThrow(/^Invalid <frames-timing-function>/);
            })

            it('should throw if more than one argument is given', () => {
                expect(() => parse(`100ms frames(4, 12)`)).toThrow(/^Invalid <frames-timing-function>/);
            })
        })
    });

    describe('fillMode', () => {
        let keywords: string[];

        beforeEach(() => {
            keywords = ['forwards', 'backwards', 'both', 'none']
        })

        it('should match keywords', () => {
            expect(matchKeywords('fillMode', keywords, '100ms %s')).toBeTruthy();
        })

        it('should match keywords regardless of location', () => {
            expect(matchKeywords('fillMode', keywords, '%s 100ms')).toBeTruthy();
        })
    });

    describe('iterationCount', () => {
        it('should default to 1', () => {
            const { iterationCount } = parse(`100ms ease-in-out`);
            expect(iterationCount).toEqual(1);
        })

        it('should match "infinite"', () => {
            const { iterationCount } = parse(`100ms ease-in-out infinite`);
            expect(iterationCount).toEqual("infinite");
        })

        it('should handle 0', () => {
            const { iterationCount } = parse(`100ms ease-in-out 0`);
            expect(iterationCount).toEqual(0);
        })

        it('should handle non-integer', () => {
            const { iterationCount } = parse(`100ms ease-in-out 4.3`);
            expect(iterationCount).toEqual(4.3);
        })

        it('should throw if negative', () => {
            expect(() => parse('-1')).toThrow(/^Invalid <animation-iteration-count>/);
        });
    });

    describe('name', () => {
        it('should handle first unrecognized token', () => {
            const { name } = parse(`100ms myAnimation`);
            expect(name).toEqual('myAnimation');
        })

        it('should handle single quotes', () => {
            const { name } = parse(`100ms 'myAnimation'`);
            expect(name).toEqual(`'myAnimation'`);
        })

        it('should handle double quotes', () => {
            const { name } = parse(`100ms "myAnimation"`);
            expect(name).toEqual(`"myAnimation"`);
        })

        it('should allow disallowed <custom-ident> if quoted', () => {
            const values = [`"initial"`, `'inherit'`, `"unset"`, `'none'`];
            values.forEach(value => {
                const { name } = parse(`100ms ${value}`);
                expect(name).toEqual(value);
            })
        })

        it('should throw if disallowed <custom-ident>', () => {
            expect(() => parse('100ms initial')).toThrow(/^Invalid <animation-name>/);
            expect(() => parse(`100ms inherit`)).toThrow(/^Invalid <animation-name>/);
            expect(() => parse(`100ms unset`)).toThrow(/^Invalid <animation-name>/);
        })
    });

    describe('playState', () => {
        let keywords: string[];

        beforeEach(() => {
            keywords = ['running', 'paused']
        })

        it('should match keywords', () => {
            expect(matchKeywords('playState', keywords, '100ms %s')).toBeTruthy();
        })

        it('should match keywords regardless of location', () => {
            expect(matchKeywords('playState', keywords, '%s 100ms')).toBeTruthy();
        })
    });
    

    
});