import React from 'react';
import { act } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";
import { MemoryRouter, Route } from 'react-router-dom';

import ParamProvider from './ParamProvider';
import { useURL, useSearchParams } from './hooks';

function Wrapper({ locationRef, url, children, keep }) {
  return (
    <MemoryRouter initialEntries={url?[url]:undefined}>
      <ParamProvider keep={keep} minimumDelay={-1}>
        {children}
      </ParamProvider>
      <Route path="*" render={locationRef && (({location}) => (locationRef.current = location, null))} />
    </MemoryRouter>
  );
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

function TestUseURL({ registerURL }) {
  const url = useURL();
  if(registerURL) {
    registerURL(url);
  }
  return <div/>;
}

function TestUseSearchParams({ registerSearchParams }) {
  const searchParams = useSearchParams();
  if(registerSearchParams) {
    registerSearchParams(searchParams);
  }
  return <div/>;
}

describe('useURL', () => {
  test('keeps the params on different URL', () => {
    let url;
    act(() => {
      const registerURL = x => url = x;
      render(<Wrapper url="/?a=1&b=2" keep={['a']}><TestUseURL registerURL={registerURL} /></Wrapper>, container);
    });

    expect(url('/different')).toBe('/different?a=1');
    expect(url('/different?a=2')).toBe('/different?a=2');
    expect(url('/different?b=2', { b: 3 })).toBe('/different?a=1&b=3');
  });

  test('does not keep the params on same URL', () => {
    let url;
    act(() => {
      const registerURL = x => url = x;
      render(<Wrapper url="/?a=1&b=2" keep={['a']}><TestUseURL registerURL={registerURL} /></Wrapper>, container);
    });

    expect(url('/')).toBe('/?a=1&b=2');
    expect(url('/?a=2')).toBe('/?a=2&b=2');
    expect(url('/?b=0', { b: 3 })).toBe('/?a=1&b=3');
  });
});

describe('useSearchParams', () => {
  test('use default values', () => {
    let searchParams;
    act(() => {
      const registerSearchParams = x => searchParams = x;
      render(<Wrapper url="/"><TestUseSearchParams registerSearchParams={registerSearchParams} /></Wrapper>, container);
    });

    expect(searchParams.param('key1', 'value')[0]).toBe('value');
    expect(searchParams.param('key2', 42)[0]).toBe(42);
    expect(searchParams.param('key3', ['a'])[0]).toStrictEqual(['a']);
    expect(searchParams.param('key4', { a: 1 })[0]).toStrictEqual({ a: 1 });
  });

  test('handle string value', () => {
    let searchParams, locationRef = {};
    act(() => {
      const registerSearchParams = x => searchParams = x;
      render(<Wrapper locationRef={locationRef} url="/?a=value"><TestUseSearchParams registerSearchParams={registerSearchParams} /></Wrapper>, container);
    });

    const [ a, setA ] = searchParams.param('a');
    expect(a).toBe('value');
    expect(locationRef.current.search).toBe('?a=value');
    setA('value2');
    expect(locationRef.current.search).toBe('?a=value2');
  });

  test('handle number value', () => {
    let searchParams, locationRef = {};
    act(() => {
      const registerSearchParams = x => searchParams = x;
      render(<Wrapper locationRef={locationRef} url="/?a=2"><TestUseSearchParams registerSearchParams={registerSearchParams} /></Wrapper>, container);
    });

    const [ a, setA ] = searchParams.param('a', 1);
    expect(a).toBe(2);
    expect(locationRef.current.search).toBe('?a=2');
    setA(3);
    expect(locationRef.current.search).toBe('?a=3');
  });

  test('handle arrays', () => {
    let searchParams, locationRef = {};
    act(() => {
      const registerSearchParams = x => searchParams = x;
      render(<Wrapper locationRef={locationRef} url="/?a=x,y"><TestUseSearchParams registerSearchParams={registerSearchParams} /></Wrapper>, container);
    });

    const [ a, setA ] = searchParams.param('a', []);
    expect(a).toStrictEqual(['x', 'y']);
    expect(locationRef.current.search).toBe('?a=x,y');
    setA(['y', 'z']);
    expect(locationRef.current.search).toBe('?a=y%2Cz');
  });

  test('handle objects', () => {
    let searchParams, locationRef = {};
    act(() => {
      const registerSearchParams = x => searchParams = x;
      render(<Wrapper locationRef={locationRef} url="/?ab=B&ac=C"><TestUseSearchParams registerSearchParams={registerSearchParams} /></Wrapper>, container);
    });

    const [ a, setA ] = searchParams.param('a', {});
    expect(a).toStrictEqual({ b: 'B', c: 'C' });
    expect(locationRef.current.search).toBe('?ab=B&ac=C');
    setA({ y: 'Y', z: 'Z' });
    expect(locationRef.current.search).toBe('?ay=Y&az=Z');
  });
});
