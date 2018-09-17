import { toNum } from './index';

interface BezierEasing {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}
interface CubicBezierEasing {
    type: 'cubic-bezier';
    value: BezierEasing
}
interface StepsEasing {
    type: 'steps';
    value: [number, 'start'|'end']
}
interface FramesEasing {
    type: 'frames';
    value: number;
}
type Easing = { type: 'linear', value: undefined } | CubicBezierEasing | StepsEasing | FramesEasing;

export interface AnimationProperties {
    delay: number;
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    duration: number;
    easing: Easing|null;
    fillMode: 'none' | 'forwards' | 'backwards' | 'both';
    iterationCount: number | 'infinite';
    name: string | null;
    playState: 'running' | 'paused';
}
export function parse(input: string): AnimationProperties {
    const GLOBAL_CSS_KEYWORD = ['initial', 'inherit', 'unset', 'none'];
    if (GLOBAL_CSS_KEYWORD.includes(input.trim())) { throw new Error(`Global CSS keyword "${input.trim()}" is invalid in this context`) }

    const KEYWORDS = new Map<string, keyof AnimationProperties>([
        ['normal', 'direction'],
        ['reverse', 'direction'],
        ['alternate', 'direction'],
        ['alternate-reverse', 'direction'],
        ['none', 'fillMode'],
        ['forwards', 'fillMode'],
        ['backwards', 'fillMode'],
        ['both', 'fillMode'],
        ['infinite', 'iterationCount'],
        ['running', 'playState'],
        ['paused', 'playState']
    ]);
    const defaultProperties: AnimationProperties = {
        delay: 0,
        direction: 'normal',
        duration: 0,
        easing: null,
        fillMode: 'none',
        iterationCount: 1,
        name: null,
        playState: 'running'
    };
    let properties: AnimationProperties = { ...defaultProperties };
    
    let foundDuration = false;
    input.split(/(?<!,)\s+/).filter(x => x).map((value) => {

        if (KEYWORDS.has(value)) {
            properties = { ...properties, [KEYWORDS.get(value)]: value }
            return;
        }

        // duration, delay
        if (/[0-9]m?s$/i.test(value)) {
            try {
                let key = !foundDuration ? 'duration' : 'delay';
                const mod = /ms$/i.test(value) ? 1 : 1000;
                const num = toNum(value);
                
                if (Number.isNaN(num)) throw false;
                if (key === 'duration') {
                    if (num < 0) throw false;
                    foundDuration = true;
                }
                properties = { ...properties, [key]: num * mod }
            } catch (e) {
                throw new Error(`Invalid <animation-duration>: ${value}`)
            }
            return;
        }

        // easing - linear
        if (value === 'linear') {
            properties = { ...properties, easing: { type: 'linear', value: undefined } }
            return;
        }

        // easing - cubic-bezier
        const CubicBezierKeywords = ['ease', 'ease-in', 'ease-out', 'ease-in-out'];
        const CubicBezierEquivalent = new Map<string, BezierEasing>([
            ['ease', { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 }],
            ['ease-in', { x1: 0.42, y1: 0, x2: 1, y2: 1 }],
            ['ease-out', { x1: 0, y1: 0, x2: 0.58, y2: 1 }],
            ['ease-in-out', { x1: 0.42, y1: 0, x2: 0.58, y2: 1 }]
        ]);
        if (CubicBezierKeywords.includes(value) || /^cubic-bezier/.test(value)) {
            if (CubicBezierKeywords.includes(value)) {
                properties = { ...properties, easing: { type: 'cubic-bezier', value: CubicBezierEquivalent.get(value) } }
            } else {
                try {
                    const args = value.split(',').map((x) => toNum(x.trim().match(/[\d.]+/)[0]));
                    if (args.some(x => Number.isNaN(x))) throw false;
                    if (args.length !== 4) throw false;

                    const [x1, y1, x2, y2] = args;
                    properties = { ...properties, easing: { type: 'cubic-bezier', value: { x1, y1, x2, y2 } } }
                } catch (e) {
                    throw new Error(`Invalid <cubic-bezier-timing-function>: ${value}`);
                }
            }
            return;
        }

        // easing - step
        const StepKeywords = ['step-start', 'step-end'];
        if (StepKeywords.includes(value) || /^steps/.test(value)) {
            if (StepKeywords.includes(value)) {
                properties = { ...properties, easing: { type: 'steps', value: [1, value.replace('step-', '') as 'start'|'end'] } }
            } else {
                try {
                    const args = value.match(/\((.*)\)/)[1].split(',')
                        .map(x => x.trim())
                        .filter(x => x)
                        .map((x, i) => {
                            if (i > 1) { throw false; }
                            if (['start', 'end'].includes(x)) {
                                if (i !== 1) throw false;
                                return x;
                            } else {
                                if (x.indexOf('.') > -1 || Number.isNaN(Number.parseInt(x))) throw false;
                                return toNum(x)
                            }
                        });
                    
                    if (args.length === 1) { args.push('end') }
                    properties = { ...properties, easing: { type: 'steps', value: args as [number, 'start'|'end'] } }
                } catch (e) {
                    throw new Error(`Invalid <step-timing-function>: ${value}`);
                }
            }
            return;
        }

        // easing - frames
        if (/^frames/.test(value)) {
            try {
                const args = value.match(/\((.*)\)/)[1].split(',').map((x) => {
                    if (x.indexOf('.') > -1) throw false;
                    return toNum(x.trim());
                });
                if (args.some(x => Number.isNaN(x))) throw false;
                if (args.length !== 1) throw false;
                properties = { ...properties, easing: { type: 'frames', value: args[0] } }
            } catch (e) {
                throw new Error(`Invalid <frames-timing-function>: ${value}`);
            }
            return;
        }

        // iteration-count
        if (/^\-?[\d.]+$/.test(value)) {
            try {
                const num = toNum(value);
                if (num < 0) throw false;
                properties = { ...properties, iterationCount: num }
            } catch (e) {
                throw new Error(`Invalid <animation-iteration-count>: ${value}`);
            }
            return;
        }

        // name
        const ForbiddenPattern = /^(-?[0-9]|--+)/;
        try {
            if (ForbiddenPattern.test(value)) throw false;
            if (GLOBAL_CSS_KEYWORD.includes(value)) throw false;
            properties = { ...properties, name: value }
        } catch (e) {
            throw new Error(`Invalid <animation-name>: ${value}`);
        }
    })

    return properties;
}