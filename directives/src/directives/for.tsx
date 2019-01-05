import { FunctionalComponent } from '@stencil/core';

export const For: FunctionalComponent<{ value: any[] }> = (props, children) => {
    if (children && children.length === 1 && typeof children[0] === 'function') {
        if (typeof props.value === 'object') {
            let values = Array.isArray(props.value) ? props.value : Object.entries(props.value);
            return values.map((item, index) => (children[0] as any)(item, index));
        }
    }
}