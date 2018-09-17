import { Component } from '@stencil/core';

@Component({
	tag: 'smore-window',
	styleUrl: 'window.css',
	shadow: true
})
export class Window {

	render() {
		return (
			<div>
				<p>Hello Window!</p>
			</div>
		);
	}
}
