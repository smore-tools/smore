import { Component, Element, State, Prop } from '@stencil/core';
import pick from 'lodash.pick';


@Component({
    tag: 'smore-glitch-text',
    styleUrl: 'glitch-text.css',
    shadow: true
})
export class GlitchText {

    static tag = 'smore-glitch-text';

    @Element() el: HTMLElement;
    private container: HTMLElement;
    private slot: HTMLSlotElement;
    private mo: MutationObserver;
    
    @State() hasError = false;
    @State() child: HTMLElement;
    @State() content: any;
    @State() textStyles: any;

    @State() size: { width: number, height: number };

    @Prop() theme: 'default'|'rgb'|'cmyk' = 'default';

    componentDidLoad() {
        this.slot = (this.el.shadowRoot || this.el).querySelector('slot');
        this.slot.addEventListener('slotchange', this.handleSlotChange);
    }

    componentDidUnload() {
        this.removeMO();
        this.slot = undefined;
        this.child = undefined;
    }

    private handleSlotChange = () => {
        this.setChildElement();
        if (!this.child) return;
        this.addMO();
        this.getStyle();
    }

    private handleContentChange = () => {
        this.setChildElement();
        if (!this.child) return;
    }

    private getStyle() {
        if (!this.child) return;
        this.size = { width: this.child.offsetWidth, height: this.child.offsetHeight };

        const computedStyles = window.getComputedStyle(this.child);
        const applicableStyles = Object.keys(computedStyles).filter(x => x.startsWith('font') || x.startsWith('text') || x.startsWith('letter') || x.startsWith('word'));
        const textStyles = pick(computedStyles, [...applicableStyles, 'color']);
        this.textStyles = textStyles;
    }

    private addMO() {
        this.removeMO();

        this.mo = new MutationObserver(() => {
            this.child = undefined;
            this.handleContentChange();
        });
        
        this.mo.observe(this.child, { childList: true });
    }

    private removeMO() {
        if (this.mo) {
            this.mo.disconnect();
            this.mo = undefined;
        }
    }

    private setChildElement(): void {
        if (this.hasError) this.hasError = false;
        const children = this.getChildren();
        try {
            this.validateChildren(children);
            this.child = children[0];
        } catch (error) {
            this.hasError = true;
            console.warn(GlitchTextErrorMessage.get(error.name));
        }
    }

    private getChildren(): HTMLElement[] {
        return (this.el.shadowRoot || this.el)
            .querySelector('slot')
            .assignedNodes()
            .filter(({ nodeType }) => nodeType === Node.ELEMENT_NODE) as HTMLElement[];
    }

    private validateChildren(children: HTMLElement[]) {
        let GlitchTextError = new Error();

        if (!children || children && !children.length) {
            if (this.el.textContent.trim()) {
                GlitchTextError.name = GlitchTextErrors.TEXT_ONLY;
            } else {
                GlitchTextError.name = GlitchTextErrors.EMPTY;
            }
            throw GlitchTextError;
        }

        if (!children || children && !children.length) {
            GlitchTextError.name = GlitchTextErrors.EMPTY;
            throw GlitchTextError;
        }
        
        if (children.length > 1) {
            GlitchTextError.name = GlitchTextErrors.CHILDREN;
            throw GlitchTextError;
        }

        for (let child of children) {
            if (child.tagName.indexOf('-') > -1) {
                GlitchTextError.name = GlitchTextErrors.CUSTOM_ELEMENT;
                throw GlitchTextError;
            }
            
            if (child.children.length) {
                if (Array.from(child.children).some((subchild) => !!subchild.children.length)) {
                    GlitchTextError.name = GlitchTextErrors.DEPTH;
                    throw GlitchTextError;
                }
            }
        }
    }

    private removeClones() {
        if (this.container && this.container.children.length) {
            while (this.container.lastChild) {
                this.container.removeChild(this.container.lastChild);
            }
        }
    }

    private updateClones() {
        if (!this.child || !this.container) return;
        this.removeClones();
        
        new Array(4)
            .fill(null)
            .map(() => this.child.cloneNode(true) as HTMLElement)
            .forEach(child => {
                this.container.appendChild(child);
            });
    }

    hostData() {
        return {
            class: {
                [`theme-${this.theme}`]: true
            },
            style: {
                '--child-width': this.size ? this.size.width : null,
                '--child-height': this.size ? this.size.height : null,
            }
        }
    }

    render() {
        this.updateClones();

        if (!this.hasError) {
            return [
                <slot />,
                <div class='container' ref={(el) => this.container = el} style={this.textStyles}/>
            ]
        } else {
            return (
                <slot />
            )
        }
    }
}

export enum GlitchTextErrors {
    EMPTY = 'GlitchText: Empty',
    TEXT_ONLY = 'GlitchText: TextOnly',
    CHILDREN = 'GlitchText: Children',
    CUSTOM_ELEMENT = 'GlitchText: CustomElement',
    DEPTH = 'GlitchText: Depth'
}

export const GlitchTextErrorMessage = new Map<GlitchTextErrors, string>([
    [GlitchTextErrors.EMPTY, `<${GlitchText.tag}> appears to be empty.`],
    [GlitchTextErrors.TEXT_ONLY, `<${GlitchText.tag}> requires a child element, but only found text. Wrap your text in an element, like <h1> or <p>.`],
    [GlitchTextErrors.CHILDREN, `<${GlitchText.tag}> only supports one child element. Other elements will be ignored.`],
    [GlitchTextErrors.CUSTOM_ELEMENT, `<${GlitchText.tag}> does not allow custom elements as children (for performance reasons.)`],
    [GlitchTextErrors.DEPTH, `<${GlitchText.tag}> only supports children up to two levels deep (for performance reasons.)\nUse multiple <${GlitchText.tag}> elements instead.`],
])