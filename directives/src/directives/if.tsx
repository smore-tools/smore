import { FunctionalComponent } from '@stencil/core';

export const If: FunctionalComponent<{ value: any }> = (props, children) => {
    return (!!props.value) ? children : null;
}