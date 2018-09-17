import { Component } from '@stencil/core';


@Component({
    tag: 'smore-counter',
    styleUrl: 'counter.css',
    shadow: true
})
export class Counter {

    render() {
        return (
            <div>
                <p>Hello Counter!</p>
            </div>
        );
    }
}
