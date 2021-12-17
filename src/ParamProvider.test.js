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

function TestContext({ registerContext }) {
  const context = useContext(ParamContext);
  registerContext(context);
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
    });
  });
});
