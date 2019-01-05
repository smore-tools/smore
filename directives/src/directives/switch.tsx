import { FunctionalComponent } from '@stencil/core';

export const Default: FunctionalComponent = (_props, children) => {
    return {
        vtag: 'switch-default',
        vattrs: { render: children }
    }
}

export const Case: FunctionalComponent<{ value: any }> = (props, children) => {
    return {
        vtag: 'switch-case',
        vattrs: { value: props.value, render: children }
    }
}

export const Switch: FunctionalComponent<{ value: any }> = (props, children, utils) => {
    const { value } = props;
    let render: any = null;
    let renderDefault: any = null;

    console.log(value);
    
    utils.forEach(children, (child) => {
        console.log(child);
        if (child.vtag === 'switch-case' && child.vattrs.value === value) render = child.vattrs.render;
        if (child.vtag === 'switch-default') renderDefault = child.vattrs.render;
    })

    console.log({ value, render, renderDefault });

    if (render) {
        return render;
    } else if (renderDefault) {
        return renderDefault;
    } else {
        return null;
    }
}
