import { FunctionalComponent } from '@stencil/core';

export const Loop: FunctionalComponent<{ value: number }> = (props, children) => {
    const items = [];
    for (let i = 0; i < props.value; i++) {
        items.push((children[0] as any)(i));
    }
    return items;
}