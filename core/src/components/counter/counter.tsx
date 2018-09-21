import { Component, Element, State, Event, EventEmitter, Prop, Watch } from '@stencil/core';
import { parseInput } from './utils';
import { commas } from '../../utils';


@Component({
    tag: 'smore-counter',
    styleUrl: 'counter.css',
    shadow: true
})
export class MoCounter {

    private io: IntersectionObserver;

    @Element() el: HTMLElement;
    private proxy: Element;

    @State() ended: boolean = false;
    @State() intersecting: boolean = false;
    @State() _pad: boolean = false;
    @State() _from: number = 0;
    @State() _to: number = 0;
    
    @State() progress = 0;
    @State() timer: number;

    @State() prefix: string;
    @State() suffix: string;
    @State() decimals: number;
    @State() commas: boolean;

    @Event() smoreAnimationStart: EventEmitter<void>;
    @Event() smoreAnimationEnd: EventEmitter<void>;

    @Prop() pad: string;
    @Watch('pad')
    padChanged() {
        if (this.pad === undefined) this._pad = false;
        else if (this.pad === '' || this.pad === 'true') this._pad = true;
    }

    @Prop() from: string = "0";
    @Watch('from')
    fromChanged() {
        const { value } = parseInput(this.from.trim());
        this._from = value;
    }

    componentDidLoad() {
        this.padChanged();
        this.fromChanged();
        this.proxy = (this.el.shadowRoot || this.el).querySelector('.proxy');
        
        this.addIO();
        const { prefix, value, suffix, decimals, commas } = parseInput(this.el.textContent.trim());
        this.prefix = prefix;
        this.suffix = suffix;
        this.decimals = decimals;
        this.commas = commas;
        
        this._to = value;

        this.proxy.addEventListener('animationstart', () => {
            this.onStart();
            this.smoreAnimationStart.emit();
        });
        this.proxy.addEventListener('animationend', () => {
            this.ended = true;
            this.onEnd();
            this.smoreAnimationEnd.emit();
        });
    }

    private addIO() {
        if ('IntersectionObserver' in window) {
            this.removeIO();
            this.io = new IntersectionObserver(([el]) => {
                this.intersecting = el.isIntersecting;
                if (this.intersecting) {
                    this.onStart();
                } else {
                    this.onEnd();
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

    private onStart() {
        if (this.ended) return;
        this.run();
    }

    private onEnd() {
        cancelAnimationFrame(this.timer);
        if (this.ended) {
            this.removeIO();
        }
    }


    private run() {
        if (this.proxy) {
            const cb = () => {
                if (this.timer) cancelAnimationFrame(this.timer);
                this.progress = Number.parseFloat(getComputedStyle(this.proxy).opacity);
                
                this.timer = requestAnimationFrame(cb);
            }
            this.timer = requestAnimationFrame(cb);
        }
    }

    hostData() {
        return {
            class: {
                'is-paused': !this.intersecting,
                'did-finish': this.ended
            }
        }
    }
    render() {
        const Value = () => {
            let value: number|string = this._from + ((this._to - this._from) * this.progress);
            value = this.commas ? commas(Number.parseInt(`${value}`)) : value.toFixed(this.decimals);
            if (this._pad) {
                const len = `${this._to}`.length;
                value = this.commas ? commas(value.padStart(len, '0')) : value.padStart(len, '0');
            }
            return <span> {this.prefix}{value}{this.suffix} </span>
        }

        if (!this.ended) {
            return [
                <Value/>,
                <div class="proxy"></div>
            ];
        } else {
            return (
                <Value/>
            )
        }
    }
}
