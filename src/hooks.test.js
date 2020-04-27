import React from "react";
import { act } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";
import { MemoryRouter, Route } from "react-router-dom";

import ParamProvider from "./ParamProvider";
import { useURL, useSearchParams } from "./hooks";

jest.useFakeTimers();

function Wrapper({ locationRef, url, children, keep, minimumDelay = -1 }) {
  return (
    <MemoryRouter initialEntries={url ? [url] : undefined}>
      <ParamProvider keep={keep} minimumDelay={minimumDelay}>
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
  if (registerURL) {
    registerURL(url);
  }
  return <div />;
}

function TestUseSearchParams({ registerSearchParams }) {
  const searchParams = useSearchParams();
  if (registerSearchParams) {
    registerSearchParams(searchParams);
  }
  return <div />;
}

describe("useURL", () => {
  test("keeps the params on different URL", () => {
    let url;
    act(() => {
      const registerURL = (x) => {
        url = x;
      };
      render(
        <Wrapper url="/?a=1&b=2" keep={["a"]}>
          <TestUseURL registerURL={registerURL} />
        </Wrapper>,
        container
      );
    });

    expect(url("/different")).toBe("/different?a=1");
    expect(url("/different?a=2")).toBe("/different?a=2");
    expect(url("/different?b=2", { b: 3 })).toBe("/different?a=1&b=3");
  });

  test("cache the same location", () => {
    let searchParams1;
    let searchParams2;
    act(() => {
      const registerSearchParams1 = (x) => {
        searchParams1 = x;
      };
      const registerSearchParams2 = (x) => {
        searchParams2 = x;
      };
      render(
        <Wrapper url="/">
          <TestUseSearchParams registerSearchParams={registerSearchParams1} />
          <TestUseSearchParams registerSearchParams={registerSearchParams2} />
        </Wrapper>,
        container
      );
    });

    expect(searchParams1).toBeDefined();
    expect(searchParams1).toBe(searchParams2);
  });

  test("cache the same param", () => {
    let searchParams;
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper url="/">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const p1 = searchParams.param("key");
    const p2 = searchParams.param("key");

    expect(p1.length).toBe(2);
    expect(p1 === p2).toBe(true);
  });

  test("does not keep the params on same URL", () => {
    let url;
    act(() => {
      const registerURL = (x) => {
        url = x;
      };
      render(
        <Wrapper url="/?a=1&b=2" keep={["a"]}>
          <TestUseURL registerURL={registerURL} />
        </Wrapper>,
        container
      );
    });

    expect(url("/")).toBe("/?a=1&b=2");
    expect(url("/?a=2")).toBe("/?a=2&b=2");
    expect(url("/?b=0", { b: 3 })).toBe("/?a=1&b=3");
  });
});

describe("useSearchParams", () => {
  test("use default values", () => {
    let searchParams;
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper url="/">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    expect(searchParams.param("key1", "value")[0]).toBe("value");
    expect(searchParams.param("key2", 42)[0]).toBe(42);
    expect(searchParams.param("key3", ["a"])[0]).toStrictEqual(["a"]);
    expect(searchParams.param("key4", { a: 1 })[0]).toStrictEqual({ a: 1 });
    expect(searchParams.param("key5", true)[0]).toBe(true);
  });

  test("handle string value", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=value">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const [a, setA] = searchParams.param("a");
    expect(a).toBe("value");
    expect(locationRef.current.search).toBe("?a=value");
    setA("value2");
    expect(locationRef.current.search).toBe("?a=value2");
  });

  test("handle boolean value", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper
          locationRef={locationRef}
          url="/?off=off&on=on&zero=0&one=1&false=false&true=true"
        >
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const [off, setOff] = searchParams.param("off", false);
    const [on, setOn] = searchParams.param("on", false);
    const [zero, setZero] = searchParams.param("zero", false);
    const [one, setOne] = searchParams.param("one", false);
    const [f, setF] = searchParams.param("false", false);
    const [t, setT] = searchParams.param("true", false);
    expect(off).toBe(false);
    expect(on).toBe(true);
    expect(zero).toBe(false);
    expect(one).toBe(true);
    expect(true).toBe(true);
    expect(f).toBe(false);
    expect(t).toBe(true);
    expect(locationRef.current.search).toBe(
      "?off=off&on=on&zero=0&one=1&false=false&true=true"
    );

    setOff(true);
    expect(locationRef.current.search).toBe(
      "?on=on&zero=0&one=1&false=false&true=true&off=true"
    );

    setOn(false);
    expect(locationRef.current.search).toBe(
      "?zero=0&one=1&false=false&true=true&off=true"
    );

    setZero(true);
    expect(locationRef.current.search).toBe(
      "?one=1&false=false&true=true&off=true&zero=true"
    );

    setOne(false);
    expect(locationRef.current.search).toBe(
      "?false=false&true=true&off=true&zero=true"
    );

    setF(true);
    expect(locationRef.current.search).toBe(
      "?true=true&off=true&zero=true&false=true"
    );

    setT(false);
    expect(locationRef.current.search).toBe("?off=true&zero=true&false=true");
  });

  test("handle number value", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=2">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const [a, setA] = searchParams.param("a", 1);
    expect(a).toBe(2);
    expect(locationRef.current.search).toBe("?a=2");
    setA(3);
    expect(locationRef.current.search).toBe("?a=3");
  });

  test("handle arrays", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=x,y&b=">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const [a, setA] = searchParams.param("a", []);
    expect(a).toStrictEqual(["x", "y"]);
    expect(locationRef.current.search).toBe("?a=x,y&b=");
    setA(["y", "z"]);
    expect(locationRef.current.search).toBe("?b=&a=y%2Cz");

    const [emptyParam] = searchParams.param("b", [1, 2, 3]);
    expect(emptyParam).toStrictEqual([]);

    const [missingParam] = searchParams.param("c", [1, 2, 3]);
    expect(missingParam).toStrictEqual([1, 2, 3]);
  });

  test("handle objects", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?ab=B&ac=42&d=d">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const [a, setA] = searchParams.param("a", {});
    expect(a).toStrictEqual({ b: "B", c: 42 });
    expect(locationRef.current.search).toBe("?ab=B&ac=42&d=d");
    setA({ y: "Y", z: 43 });
    expect(locationRef.current.search).toBe("?d=d&ay=Y&az=43");
  });

  test("pushing the same URL must not mutate history", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?key=value">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const location1 = locationRef.current.search;
    searchParams.push({});
    const location2 = locationRef.current.search;
    expect(location1).toBe(location2);
  });

  test("push must mutate the history", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?key1=value1&key2=value2">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    searchParams.push({ key1: "value1", key2: "value2bis" });
    expect(locationRef.current.search).toBe("?key1=value1&key2=value2bis");
  });

  test("mutation to the location must be queued", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/" minimumDelay={200}>
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const [, setValueA] = searchParams.param("keyA");
    const [, setValueB] = searchParams.param("keyB");

    setValueA("a");
    expect(locationRef.current.search).toBe("");

    setValueB("b");
    expect(locationRef.current.search).toBe("");

    jest.runAllTimers();
    expect(locationRef.current.search).toBe("?keyA=a&keyB=b");
  });

  test("export get()", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=1&b=two">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    expect(searchParams.get("a")).toBe("1");
    expect(searchParams.get("b")).toBe("two");
  });

  test("export entries()", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/?a=1&b=two">
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    expect(Object.fromEntries(searchParams.entries())).toStrictEqual({
      a: "1",
      b: "two",
    });
  });

  test("mutation to the location must be fast only when not too frequent", () => {
    let searchParams;
    const locationRef = {};
    act(() => {
      const registerSearchParams = (x) => {
        searchParams = x;
      };
      render(
        <Wrapper locationRef={locationRef} url="/" minimumDelay={2000}>
          <TestUseSearchParams registerSearchParams={registerSearchParams} />
        </Wrapper>,
        container
      );
    });

    const [, setValueA] = searchParams.param("keyA");
    const [, setValueB] = searchParams.param("keyB");

    setValueA("a");
    expect(locationRef.current.search).toBe("");
    jest.advanceTimersByTime(1);
    expect(locationRef.current.search).toBe("?keyA=a");

    setValueB("b");
    expect(locationRef.current.search).toBe("?keyA=a");
    jest.advanceTimersByTime(1);
    expect(locationRef.current.search).toBe("?keyA=a");

    jest.advanceTimersByTime(2000);
    expect(locationRef.current.search).toBe("?keyA=a&keyB=b");
  });
});
