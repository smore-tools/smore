import { Component } from '@stencil/core';


@Component({
    tag: 'smore-typewriter',
    styleUrl: 'typewriter.css',
    shadow: true
})
export class Typewriter {

    render() {
        return (
            <div>
                <p>Hello Typewriter!</p>
            </div>
        );
    }
}
