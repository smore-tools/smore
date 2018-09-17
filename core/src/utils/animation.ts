
interface AnimationProperties {
    delay: number;
    direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    duration: number;
    easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'step-start' | 'step-end' | string | null;
    fillMode: 'none' | 'forwards' | 'backwards' | 'both';
    iterationCount: number | 'infinite';
    name: string | null;
    playState: 'running' | 'paused';
}
export function parse(input: string): AnimationProperties {
    const defaultProperties: AnimationProperties = {
        delay: 0,
        direction: 'normal',
        duration: 0,
        fillMode: 'none',
        iterationCount: 1,
        playState: 'running',
        easing: null,
        name: null
    };
    console.log(input);
    return defaultProperties;
}