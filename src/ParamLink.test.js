import React from 'react';
import { act } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";
import { MemoryRouter } from 'react-router-dom';

import ParamLink from './ParamLink';
import ParamProvider from './ParamProvider';

function Wrapper({ url, children, keep }) {
  return <MemoryRouter initialEntries={url?[url]:undefined}><ParamProvider keep={keep}>{children}</ParamProvider></MemoryRouter>;
}

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);

});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('ParamLink', () => {
  test('renders a link', () => {
    act(() => {
      render(<Wrapper><ParamLink to="/target">Text</ParamLink></Wrapper>, container);
    });

    const a = container.querySelector('a');
    expect(a.textContent).toBe('Text');
    expect(a.getAttribute('href')).toBe('/target');
  });

  test('keeps the params on different URL', () => {
    act(() => {
      render(<Wrapper url="/?a=1&b=2" keep={['a']}><ParamLink to="/target?c=3">Text</ParamLink></Wrapper>, container);
    });

    const a = container.querySelector('a');
    expect(a.getAttribute('href')).toBe('/target?a=1&c=3');
  });

  it('keeps the params on the same URL', () => {
    act(() => {
      render(<Wrapper url="/target?a=1&b=2" keep={['a']}><ParamLink to="/target?c=3">Text</ParamLink></Wrapper>, container);
    });

    const a = container.querySelector('a');
    expect(a.getAttribute('href')).toBe('/target?a=1&b=2&c=3');
  });
});
