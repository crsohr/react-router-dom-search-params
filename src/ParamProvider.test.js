import React, { useContext } from "react";
import { act } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";

import ParamProvider, { ParamContext } from "./ParamProvider";

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

function TestContext({ registerContext, registerHistory }) {
  const context = useContext(ParamContext);
  registerContext(context);
  if(registerHistory) {
    registerHistory(window.history);
  }

  return null;
}

describe("ParamProvider", () => {
  test("has sensible defaults", () => {
    let context;
    act(() => {
      const registerContext = (x) => {
        context = x;
      };
      render(
        <ParamProvider>
          <TestContext registerContext={registerContext} />
        </ParamProvider>,
        container
      );
    });

    expect(context).toMatchObject({
      cache: [],
      keep: [],
      lastPush: 0,
      minimumDelay: 300,
      setters: [],
      locationRef: { current: {}},
    });
  });

  test("accept overrides", () => {
    let context;
    act(() => {
      const registerContext = (x) => {
        context = x;
      };
      render(
        <ParamProvider keep={["a", "b"]} minimumDelay={42}>
          <TestContext registerContext={registerContext} />
        </ParamProvider>,
        container
      );
    });

    expect(context).toMatchObject({
      cache: [],
      keep: ["a", "b"],
      lastPush: 0,
      minimumDelay: 42,
      setters: [],
      locationRef: { current: {}},
    });
  });

  test("reloads location on direct pushState calls", () => {
    let context;
    let history;
    act(() => {
      const registerContext = (x) => {
        context = x;
      };
      const registerHistory = (x) => {
        history = x;
      }
      render(
        <ParamProvider keep={["a", "b"]} minimumDelay={42}>
          <TestContext registerContext={registerContext} registerHistory={registerHistory} />
        </ParamProvider>,
        container
      );
    });

    history.pushState({}, null, "/forced-location");
    expect(context.locationRef.current.pathname).toBe("/forced-location");
  });
});
