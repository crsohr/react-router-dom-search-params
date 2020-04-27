# react-router-dom-search-params

A nifty library to help you manage link props in your components to params in the URL (`?key1=value1&key2=true`).
You can define which params should be automatically kept between pages (such as `?lang=en`) and map your search
params to props and setter props on your components.

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save react-router-dom-search-params

## Usage

This library works with [react-router-dom](https://reacttraining.com/react-router/web/guides/quick-start) and allows you to map
search params in the URL of your document to props of your React component.

## Setup

You must enclose the components using this module in a `<ParamProvider>` component. This component optionally accepts
a `keep` prop, that defines the name of the params that should be kept when navigating from one page to another. 

```js
import { ParamProvider } from 'react-router-dom-search-params';

function App() {
  return (
    <ParamProvider keep={['lang']}>
      /* your app */
    </ParamProvider>
  );
}
```

### Wrap Components To Provide Search Params Props

The easiest way to use this module is to wrap your components with `withParams()`. This will expose a pair of props to the 
wrapped component, one with the value of the param, and another that will be a setter function to update the value (and 
change the current URL).

```js
import { withParams } from 'react-router-dom-search-params';

/* the component accepts a `checked` prop that will be set to the current value of the param,
   and a `setChecked` callback that will set the value of the param */
function Demo({ checked, setChecked }) {
  return <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />;
}

const DemoParam = withParams(Demo, {
  checked: { defaultValue: false },
});
```

If you run this demo, the URL will switch to `?checked=true` anytime the checkbox is checked.

### Hooks

Alternatively, you can also use hooks to get and set the param values.


```js
import { useSearchParams } from 'react-router-dom-search-params';

function Demo() {
  const searchParams = useSearchParams();
  /* note that this works like `useState()` */
  const [ checked, setChecked ] = searchParams.param('checked', false);
  return <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} />;
}
```

## Automatic casts

As a convenience, when the `defaultValue` is a boolean, then the value you receive will be cast
to a boolean (`0`, `off` and `false` are `false`, anything else is `true`).

When the `defaultValue` is an array, then the value is split by commas.

If the `defaultValue` is an object, then all the params whose name is prefixed with `name` will
be merged in an array.

If you need you own serialization/deserialization, provide a `defaultValue` that is a string
and implement the logic yourself.

## Generating your own URLs

You can generate an URL with all the params that should be kept between pages and a new URL
using the `useURL()` hook, that returns a function that you can call with another URL:

```js
const url = useURL();
console.log(url('/another-page'));
```

## Linking to another page while keeping some params

Instead of using `Link` from the `react-router-dom` package, you can use `ParamLink` that
`react-router-dom-search-params` provides. 

This will allow you to place links on your component, that will merge the params you
provide, and the params that should be kept (as defined in `ParamProvider`):

```js
return <ParamLink to="/browse" params={{shop: 'apples'}}>Browse Apples</ParamLink>;
```

## Quality

This package is tested with `jest` and has full 100% coverage.
It's a small package so it shouldn't break.

If you want to submit a PR, please make sure that it still passes ESLint (`npm run lint`)
and that all tests passes (`npm run test`).

## Issues

Please report an issue on the project if you have any questions or comments.
