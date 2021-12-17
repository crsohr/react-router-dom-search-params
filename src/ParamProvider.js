import React, { createContext, useRef, useMemo, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from 'prop-types';

export const ParamContext = createContext();

/**
 * Browsers do not like if history is pushed too often. If we try to push
 * another URL faster than this amount, then we will wait the required
 * amount of time so that we don't get errors in the console, and the
 * browser does not ignore our request.
 *
 * @const MINIMUM_DELAY_BETWEEN_TWO_HISTORY_PUSH_IN_MS
 * @type {Number}
 */
const MINIMUM_DELAY_BETWEEN_TWO_HISTORY_PUSH_IN_MS = 300;

/**
 * A React component that should be added on the topmost component on which
 * you want to use this module.
 *
 * @method ParamProvider
 * @param {Array} keep an optional array of the parameters that should be
 * be kept when navigating from one page to another
 */
function useLocationNoThrow() {
  try{
    return useLocation();
  }catch(e) {
    return {};
  }
}
export default function ParamProvider({
  keep,
  minimumDelay,
  children,
}) {
  const location = useLocationNoThrow();
  const locationRef = useRef();
  const [localLocation, setLocalLocation] = useState({...location});
  useEffect(() => {
    // nested react-router-dom router may prevent us from seing location change
    const handler =  () => {
      setLocalLocation({...window.location});
    };
    handler();
    window.addEventListener("popstate", handler);
    const oldHistoryPushState = window.history.pushState;
    window.history.pushState = new Proxy(window.history.pushState, {
      apply: (target, thisArg, argArray) => {
        const result = target.apply(thisArg, argArray);
        setLocalLocation({...window.location});
        return result;
      },
    });
    return () => {
      window.history.pushState = oldHistoryPushState;
      window.removeEventListener("popstate", handler);
    };
  }, []);
  useMemo(() => {
    locationRef.current = {...localLocation};
  }, [localLocation]);
  const value = useMemo(() => ({
    keep,
    lastPush: 0,
    cache: [],
    setters: [],
    minimumDelay,
    locationRef,
  }), [keep, minimumDelay, locationRef]);

  return (
    <ParamContext.Provider value={value}>{children}</ParamContext.Provider>
  );
}

ParamProvider.propTypes = {
  keep: PropTypes.arrayOf(PropTypes.string),
  minimumDelay: PropTypes.number,
  children: PropTypes.node,
};

ParamProvider.defaultProps = {
  keep: [],
  minimumDelay: MINIMUM_DELAY_BETWEEN_TWO_HISTORY_PUSH_IN_MS,
  children: null,
};
