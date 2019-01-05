Functional Components for use as directives in Stencil apps.

> Note that this library does NOT expose any web components. The directives only work within Stencil apps, because they rely on JSX and vDOM.

## Installation

```bash
npm install @smore/directives
```

From here, simply import the directive you'd like to use into your Stencil component file.


## Directives

#### If

If the value prop is truthy, the contents are rendered.

Using this directive is more semantically meaningful than the common JSX trick `{ this.on && <div> On </div> }`

```tsx
import { If } '@smore/directives';

<If value={this.on}> On </If>
```

#### For

For is able to work with array values (`any[]`) and expects a [render prop](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce) as its only child. The render prop should be a function (essentially an `Array.map` callback) that returns a JSX element. It is called for each item in the array.

```tsx
import { For } '@smore/directives';

<For value={this.items}>
    { (item: any, index: number) => (<li> Item {index}: {item.name} </li> )}
</For>
```

#### Loop

Loop expects [render prop](https://cdb.reacttraining.com/use-a-render-prop-50de598f11ce) as its only child. The `value` prop controls how many times the loop should be called. The render prop should be a function that returns a JSX element. It is called for each iteration of the loop, and is passed the index of that iteration.

```tsx
import { Loop } '@smore/directives';

<Loop value={this.max}>
    { (index: number) => (<li> Item {index} </li> )}
</Loop>
```

#### Switch

Switch works pretty much like Javascript's built-in `switch`, `case`, and `default` expressions. No surprises here.

```tsx
import { Switch, Case, Default } '@smore/directives';

<Switch value={this.direction}>
    <Case value='enter'> Hello world! </Case>
    <Case value='exit'> Goodbye world! </Case>
    <Default> Fallback </Default>
</Switch>
```