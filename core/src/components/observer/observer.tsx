import { Component, Prop, Element, State, Watch } from '@stencil/core';
import { toNum, toBool, Flag } from '../../utils';

export type ObserverMode = 'in' | 'out' | 'in-out';
const modes: string[] = ['in', 'out', 'in-out'];
const valid = (mode: string) => modes.includes(mode);
const enters = (mode: string) => ['in', 'in-out'].includes(mode);

const thresholds = (granularity = 0.33, max = 120) => {
    const x = Math.floor(max * granularity);
    return [...Array.from(Array(x).keys()).map(i => i / x), 1];
}

function getIOOptions(progress = false, options?: { granularity: number }): IntersectionObserverInit {
    return (progress) ? { threshold: thresholds(options.granularity) } : { threshold: [0, 1] }
}

@Component({
    tag: 'smore-observer',
    styleUrl: 'observer.css',
    shadow: true
})
export class Observer {

    private io?: IntersectionObserver;

    @Element() el: HTMLElement;
    
    @State() side: 'top'|'bottom'|null = null;
    @State() status: 'enter' | 'exit' | null = null;
    @State() dir: 'up' | 'down' | null = null;
    @State() isCenter: boolean = false;
    @State() didEnter: boolean = false;
    @State() didExit: boolean = false;
    @State() isIntersecting: boolean = false;
    @State() value: number = 0;
    
    @Prop() mode: ObserverMode = 'in';
    @Prop() granularity: string | number = 0.25;
    
    @State() shouldProgress: boolean = false;
    @Prop() progress: Flag = 'false';
    @Watch('progress')
    progressChanged() {
        this.shouldProgress = toBool(this.progress);
    }
    
    @State() shouldWatch: boolean = false;
    @Prop() watch: Flag = 'false';
    @Watch('watch')
    watchChanged() {
        this.shouldWatch = toBool(this.watch);
    }

    componentDidLoad() {
        this.watchChanged();
        this.progressChanged();
        if (valid(this.mode)) {
            this.addIO();
        } else {
            throw new Error(`Unrecognized <smore-observer> mode "${this.mode}"`);
        }
    }

    private addIO() {
        if ('IntersectionObserver' in window) {
            this.removeIO();
            const { mode } = this;
            this.io = new IntersectionObserver(([{ isIntersecting, intersectionRatio }]) => {
                console.log({ intersectionRatio });
                this.isIntersecting = isIntersecting;

                switch (mode) {
                    case 'in':
                        if (this.shouldWatch) {
                            if (intersectionRatio <= 0.1) this.didEnter = false;
                        }

                        if (!this.didEnter) {
                            if (this.shouldProgress) { this.value = intersectionRatio; }
                            this.status = (isIntersecting) ? 'enter' : null;
                            this.didEnter = (intersectionRatio >= 1);
                        }
                        if (this.didEnter) {
                            this.status = null;
                            if (this.shouldProgress) { this.value = 1; }
                            if (!this.shouldWatch) this.removeIO();
                        }
                        break;
                    case 'out':
                    case 'in-out':
                        if (this.shouldWatch) {
                            if (intersectionRatio <= 0.1) this.didEnter = false;
                            if (intersectionRatio >= 0.9) this.didExit = false;
                        }
                        if (!this.didEnter) {
                            if (this.shouldProgress) { this.value = intersectionRatio; }
                            this.status = (isIntersecting) ? 'enter' : null;
                            this.didEnter = (intersectionRatio >= 1);
                        }
                        if (this.didEnter) {
                            if (!this.didExit) {
                                if (this.shouldProgress) { this.value = intersectionRatio; }
                                this.status = (intersectionRatio < 1) ? 'exit' : null;
                                this.didExit = (intersectionRatio === 0);
                            }
                            if (this.didExit) {
                                this.status = null;
                                if (!this.shouldWatch) this.removeIO();
                            }
                        }
                        break;
                }
            }, getIOOptions(this.shouldProgress, { granularity: toNum(this.granularity) }));
            this.io.observe(this.el);
        }
    }

    private removeIO() {
        if (this.io) {
            this.io.disconnect();
            this.io = undefined;
        }
    }

    hostData() {
        const { mode } = this;
        return {
            style: {
                '--progress': (this.shouldProgress) ? this.value : null,
            },
            class: {
                'entering': enters(mode) ? (this.status === 'enter') : false,
                'did-enter': enters(mode) ? this.didEnter : false,
                'exiting': (this.status === 'exit'),
                'did-exit': this.didExit
            }
        }
    }

    render() {
        return <slot/>
    }
}
