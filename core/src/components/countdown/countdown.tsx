import { Component, Prop, Watch, State, Element } from '@stencil/core';

function getTimeRemaining(endtime: string) {
    const t = Date.parse(endtime) - new Date().valueOf();
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    const days = Math.floor(t / (1000 * 60 * 60 * 24));
    return { days, hours, minutes, seconds };
}


@Component({
    tag: 'smore-countdown',
    styleUrl: 'countdown.css',
    shadow: true
})
export class Countdown {

    private io?: IntersectionObserver;
    @Element() el: HTMLElement;
    
    @State() _pad: boolean = false;
    @State() remaining: { seconds: number, minutes: number, hours: number, days: number };
    @State() timers: any[] = [];

    @Prop() pad: string;
    @Watch('pad')
    padChanged() {
        this._pad = (this.pad === '' || this.pad === 'true');
    }
    
    @Prop() datetime: string;
    @Watch('datetime')
    datetimeChanged() {
        this.remaining = getTimeRemaining(this.datetime);
    }

    componentDidLoad() {
        this.padChanged();
        this.datetimeChanged();
        this.addIO();
    }
    

    private start() {
        this.remaining = getTimeRemaining(this.datetime);

        const timer = setInterval(() => {
            this.remaining = getTimeRemaining(this.datetime);
        }, 1000)
        this.timers = [...this.timers, timer];
    }

    private clear() {
        this.timers.map(x => clearInterval(x));
    }

    private addIO() {
        if ('IntersectionObserver' in window) {
            this.removeIO();
            this.io = new IntersectionObserver(([el]) => {
                if (el.isIntersecting) {
                    this.start();
                } else {
                    this.clear();
                }
            });
            this.io.observe(this.el);
        }
    }

    private removeIO() {
        if (this.io) {
            this.io.disconnect();
            this.io = undefined;
        }
    }

    componentDidUnload() {
        this.removeIO();
        this.clear();
    }

    renderValues(): JSX.Element[] {
        return Object.entries(this.remaining)
            .map(([name, value]) => ({
                key: name.slice(0, 1),
                value: value > 0 ? value : 0,
                name
            }))
            .map(({ key, name, value }) => ({
                value: this._pad ? value.toString().padStart(2, '0') : value,
                key, name
            }))
            .map(({ key, name, value }) => (
                <div class="group" aria-labelledby={key}>
                    <h2 class={`value value-${key}`}>
                        {value}
                    </h2>
                    <h3 class={`label label-${key}`} id={key}>
                        <slot name={key}>{name}</slot>
                    </h3>
                </div>
            ));
    }

    render() {
        return (this.remaining) ? this.renderValues() : null;
    }
}
