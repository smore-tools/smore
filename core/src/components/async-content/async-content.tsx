import { Component } from '@stencil/core';


@Component({
    tag: 'smore-async-content',
    styleUrl: 'async-content.css',
    shadow: true
})
export class AsyncContent {

    render() {
        return (
            <div>
                <p>Hello AsyncContent!</p>
            </div>
        );
    }
}
