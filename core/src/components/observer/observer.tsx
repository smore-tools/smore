import { Component, Prop, Element, State, Watch } from '@stencil/core';
import { toNum, toBool, BooleanAttr } from '../../utils';

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
    
    @State() ioUnavailable: boolean = false;
    @State() side: 'top'|'bottom'|null = null;
    @State() status: 'enter' | 'exit' | null = null;
    @State() direction: 'up' | 'down' | null = null;
    @State() isCenter: boolean = false;
    @State() didEnter: boolean = false;
    @State() didExit: boolean = false;
    @State() isIntersecting: boolean = false;
    @State() value: number = 0;
    
    @State() shouldDisconnect: boolean = false;
    @State() granularity: string | number = 0.25;

    @Prop() disconnect: BooleanAttr<'disconnect'> = undefined;
    @Watch('disconnect')
    disconnectChanged() {
        this.shouldDisconnect = toBool(this.disconnect, 'disconnect');
    }
    
    @State() watchProgress: boolean = false;
    @Prop({ reflectToAttr: true }) progress: BooleanAttr<'progress'> = undefined;
    @Watch('progress')
    progressChanged() {
        this.watchProgress = toBool(this.progress, 'progress');
    }

    componentDidLoad() {
        this.disconnectChanged();
        this.progressChanged();
        
        this.addIO();
    }

    private addIO() {
        const set = (side: 'top'|'bottom', status: 'enter'|'exit') => {
            this.side = side;
            this.status = status;
        }

        const reset = (opts?: { didEnter?: boolean, didExit?: boolean }) => {
            const { didEnter, didExit } = Object.assign({}, { didEnter: false, didExit: false }, opts);
            this.side = null;
            this.status = null;
            this.didEnter = didEnter;
            this.didExit = didExit;
        }
        
        if ('IntersectionObserver' in window) {
            this.removeIO();

            let previousY = 0;
            let previousRatio = 0;
            
            this.io = new IntersectionObserver(([{ isIntersecting, intersectionRatio, boundingClientRect }]) => {
                this.isIntersecting = isIntersecting;
                const currentY = (boundingClientRect as DOMRect).y;
                const currentRatio = intersectionRatio;

                if (currentY < previousY) {
                    (currentRatio > previousRatio && isIntersecting)
                        ? (currentRatio !== 1) ? set('bottom', 'enter') : reset({ didEnter: true })
                        : (currentRatio !== 0) ? set('top', 'exit') : reset({ didExit: true })
                } else if (currentY > previousY && isIntersecting) {
                    (currentRatio < previousRatio)
                        ? (currentRatio !== 0) ? set('bottom', 'exit') : reset({ didExit: true })
                        : (currentRatio !== 1) ? set('top', 'enter') : reset({ didEnter: true })
                } else if (this.status) {
                    reset({ didExit: (this.status === 'exit') })
                }
                
                if (this.status) {
                    this.didEnter = false;
                    this.didExit = false;
                }
                if (this.didEnter) { this.didExit = false; }
                if (this.didExit) { this.didEnter = false; }

                previousY = currentY;
                previousRatio = currentRatio;

                const { watchProgress, shouldDisconnect, didEnter } = this;


                if (watchProgress) {
                    this.value = intersectionRatio;
                }
                
                if (shouldDisconnect && didEnter) this.removeIO();
                // switch (mode) {
                //     case 'in':
                //         if (this.shouldDisconnect && this.didEnter) this.removeIO();
                //         if (!this.shouldDisconnect) {
                //             if (intersectionRatio <= 0.1) this.didEnter = false;
                //         }

                //         if (!this.didEnter) {
                //             if (this.watchProgress) { this.value = intersectionRatio; }
                //             this.status = (isIntersecting) ? 'enter' : null;
                //             this.didEnter = (intersectionRatio >= 1);
                //         }
                //         if (this.didEnter) {
                //             this.status = null;
                //             if (this.watchProgress) { this.value = 1; }
                //             if (this.shouldDisconnect) this.removeIO();
                //         }
                //         break;
                //     case 'out':
                //     case 'in-out':
                //         if (!this.shouldDisconnect) {
                //             if (intersectionRatio <= 0.1) this.didEnter = false;
                //             if (intersectionRatio >= 0.9) this.didExit = false;
                //         }
                //         if (!this.didEnter) {
                //             if (this.watchProgress) {
                                
                //                 this.value = (mode === 'in-out') ? intersectionRatio : 1;
                //             }
                //             this.status = (isIntersecting) ? 'enter' : null;
                //             this.didEnter = (intersectionRatio >= 1);
                //         }
                //         if (this.didEnter) {
                //             if (!this.didExit) {
                //                 if (this.watchProgress) { this.value = intersectionRatio; }
                //                 this.status = (intersectionRatio < 1) ? 'exit' : null;
                //                 this.didExit = (intersectionRatio <= 0.1);
                //             }
                //             if (this.didExit) {
                //                 this.status = null;
                //                 if (this.shouldDisconnect) this.removeIO();
                //             }
                //         }
                //         break;
                // }
            }, getIOOptions(this.watchProgress, { granularity: toNum(this.granularity) }));
            this.io.observe(this.el);
        } else {
            this.ioUnavailable = true;
        }
    }

    private removeIO() {
        if (this.io) {
            this.io.disconnect();
            this.io = undefined;
        }
    }

    hostData() {
        if (this.ioUnavailable) {
            return {
                class: { 'did-enter': true }
            }
        } else {
            const { status, didEnter, didExit, side } = this;
            
            return {
                style: {
                    '--progress': (this.watchProgress) ? this.value : null,
                    '--dir': side ? (side === 'top' ? '1' : '-1') : null
                },
                class: {
                    [`${status}ing`]: status,
                    [`side-${side}`]: side,
                    'did-enter': didEnter,
                    'did-exit': didExit
                }
            }
        }
    }

    render() {
        return (
            <div class="container">
                <slot />
            </div>
        );
    }
}
