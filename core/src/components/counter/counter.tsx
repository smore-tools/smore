import { Component, Prop, State, Watch, Element, Method } from '@stencil/core';
import { toNum } from '../../utils';
import { AnimationProperties, parse } from '../../utils/animation';
import BezierEasing from 'bezier-easing';


@Component({
	tag: 'smore-counter',
	styleUrl: 'counter.css',
	shadow: true
})
export class Counter {

	private io?: IntersectionObserver;

	@Element() el!: HTMLElement;

	@State() _animation: AnimationProperties;
	@State() _decimals = 0;
	@State() value: number;
	@State() progress = 0;

	@Prop({ mutable: true }) from: number = 0;
	@Watch('from')
	fromChanged() {
		this.from = toNum(this.from);
	}

	@Prop({ mutable: true }) to: number;
	@Watch('to')
	toChanged() {
		this.to = toNum(this.to);
	}

	@Prop() animation: string;
	@Watch('animation')
	animationChanged() {
		this._animation = parse(this.animation);
		const { direction } = this._animation;
		if (direction === 'alternate-reverse' || direction === 'reverse') {
			const { from, to } = this;
			this.to = from;
			this.from = to;
		}
		console.log(this._animation);
	}

	componentDidLoad() {
		this.animationChanged();
		this.fromChanged();
		this.toChanged();
		this.addIO();
		let value = this.el.textContent.trim();
		const splt = value.split('.')
		if (splt.length === 1) {
			this.to = toNum(value);
		} else {
			this._decimals = splt[1].length;
			this.to = toNum(value);
		}
		this.value = this.from;
	}

	@Method()
	start() {
		if (this._animation.playState === 'running') {
			const timeout = setTimeout(() => {
				clearTimeout(timeout);
				this.count();
			}, this._animation.delay)
	
			setTimeout(() => {
				console.log(`Finish in ${this._animation.duration}, ${this.progress}`);
			}, this._animation.duration);
		}
	}

	@Method()
	end() {
		const { fillMode } = this._animation;
		switch (fillMode) {
			case 'backwards':
				this.progress = 0;
				break;
			case 'forwards':
				this.progress = 1;
				break;
			case 'both':
				this.progress = 1;
				break;
			default:
				this.progress = 1;
				break;
		}
		console.timeEnd(`${this.to}`);
	}

	private addIO() {
		if ('IntersectionObserver' in window) {
			this.removeIO();
			this.io = new IntersectionObserver(data => {
				if (data[0].isIntersecting) {
					this.start();
					this.removeIO();
				}
			});
			this.io.observe(this.el);
		} else {
			setTimeout(() => { }, 200);
		}
	}

	private removeIO() {
		if (this.io) {
			this.io.disconnect();
			this.io = undefined;
		}
	}

	private format() {
		if (this.value) {
			const value = this.from + (this.value * (this.to - this.from));
			return value.toFixed(this._decimals);
		} else {
			return this.from.toFixed(this._decimals);
		}
	}

	private getEasingFunction(): (input: number) => number {
		if (this._animation.easing.type === 'cubic-bezier') {
			const { x1, y1, x2, y2 } = this._animation.easing.value;
			return BezierEasing(x1, y1, x2, y2);
		} else {
			return (x) => x;
		}
	}

	private count() {
		const { direction } = this._animation;
		// console.log(`Counting from "${this.from}" to ${this.to}`);
		console.time(`${this.to}`);
		console.log(this._animation.duration);
		const ease = this.getEasingFunction();
		const granularity = 100;
		const step = 1 / granularity * ((direction === 'alternate-reverse' || direction === 'reverse') ? -1 : 1);
		const rate = this._animation.duration / granularity;
		this.progress = (direction === 'alternate-reverse' || direction === 'reverse') ? 1 : 0;

		const interval = setInterval(() => {
			this.progress += step;
			if (this.progress >= 1) {
				this.progress = 1;
				this.end();
				clearInterval(interval);
			}
			this.value = ease(this.progress);
		}, rate)
	}

	render() {
		return <span>{this.format()}</span>;
	}
}
