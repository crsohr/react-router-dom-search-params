import React from "react";
import { act } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";
import { MemoryRouter, Route } from "react-router-dom";

import ParamProvider from "./ParamProvider";
import withParams from "./withParams";

function Wrapper({ locationRef, url, children, keep }) {
  return (
    <MemoryRouter initialEntries={url ? [url] : undefined}>
      <ParamProvider keep={keep} minimumDelay={-1}>
        {children}
      </ParamProvider>
      <Route
        path="*"
        render={
          locationRef &&
          (({ location }) => {
            /* eslint-disable no-param-reassign */
            locationRef.current = location;
            return null;
          })
        }
      />
      <Route
        path="*"
        render={
          locationRef &&
          (({ location }) => {
            /* eslint-disable no-param-reassign */
            locationRef.current = location;
            return null;
          })
        }
      />
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

function RegisterProps(props) {
  const { registerProps, ...otherProps } = props;
  if (registerProps) {
    registerProps(otherProps);
  }
  return <div />;
}

describe("withParams", () => {
  test("use default values", () => {
    let props;
    act(() => {
      const TestWrapped = withParams(RegisterProps, {
        keyString: { defaultValue: "value" },
        keyNumber: { defaultValue: 42 },
        keyArray: { defaultValue: ["foo", "bar"] },
        keyObject: { defaultValue: { a: 1, b: 2 } },
      });
      const registerProps = (x) => {
        props = x;
      };
      render(
        <Wrapper url="/">
          <TestWrapped registerProps={registerProps} />
        </Wrapper>,
        container
      );
    });

    expect(props.keyString).toBe("value");
    expect(props.keyNumber).toBe(42);
    expect(props.keyArray).toStrictEqual(["foo", "bar"]);
    expect(props.keyObject).toStrictEqual({ a: 1, b: 2 });

    expect(typeof props.setKeyString).toBe("function");
    expect(typeof props.setKeyNumber).toBe("function");
    expect(typeof props.setKeyArray).toBe("function");
    expect(typeof props.setKeyObject).toBe("function");
  });

  test("use functional form of params", () => {
    let props;
    act(() => {
      const TestWrapped = withParams(RegisterProps, {
        keyString: ({defaultValue}) => ({ defaultValue }),
      });
      const registerProps = (x) => {
        props = x;
      };
      render(
        <Wrapper url="/">
          <TestWrapped defaultValue="foo" registerProps={registerProps} />
        </Wrapper>,
        container
      );
    });

    expect(props.keyString).toBe("foo");
  });

  test("handle string value", () => {
    let props;
    const locationRef = {};
    act(() => {
      const TestWrapped = withParams(RegisterProps, {
        a: { defaultValue: "" },
      });
      const registerProps = (x) => {
        props = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=value">
          <TestWrapped registerProps={registerProps} />
        </Wrapper>,
        container
      );
    });

    const { a, setA } = props;
    expect(a).toBe("value");
    expect(locationRef.current.search).toBe("?a=value");
    setA("value2");
    expect(locationRef.current.search).toBe("?a=value2");
  });

  test("handle number value", () => {
    let props;
    const locationRef = {};
    act(() => {
      const TestWrapped = withParams(RegisterProps, {
        a: { defaultValue: 1 },
      });
      const registerProps = (x) => {
        props = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=2">
          <TestWrapped registerProps={registerProps} />
        </Wrapper>,
        container
      );
    });

    const { a, setA } = props;
    expect(a).toBe(2);
    expect(locationRef.current.search).toBe("?a=2");
    setA(3);
    expect(locationRef.current.search).toBe("?a=3");
  });

  test("handle array", () => {
    let props;
    const locationRef = {};
    act(() => {
      const TestWrapped = withParams(RegisterProps, {
        a: { defaultValue: [] },
      });
      const registerProps = (x) => {
        props = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=x,y">
          <TestWrapped registerProps={registerProps} />
        </Wrapper>,
        container
      );
    });

    const { a, setA } = props;
    expect(a).toStrictEqual(["x", "y"]);
    expect(locationRef.current.search).toBe("?a=x,y");
    setA(["y", "z"]);
    expect(locationRef.current.search).toBe("?a=y%2Cz");
  });

  test("handle object", () => {
    let props;
    const locationRef = {};
    act(() => {
      const TestWrapped = withParams(RegisterProps, {
        a: { defaultValue: {} },
      });
      const registerProps = (x) => {
        props = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?ab=B&ac=C">
          <TestWrapped registerProps={registerProps} />
        </Wrapper>,
        container
      );
    });

    const { a, setA } = props;
    expect(a).toStrictEqual({ b: "B", c: "C" });
    expect(locationRef.current.search).toBe("?ab=B&ac=C");
    setA({ y: "Y", z: "Z" });
    expect(locationRef.current.search).toBe("?ay=Y&az=Z");
  });
});
