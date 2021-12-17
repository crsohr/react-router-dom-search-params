import React, { createContext, useMemo } from "react";
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
export default function ParamProvider({
  keep,
  minimumDelay,
  children,
}) {
  const setters = useMemo(() => [], []);
  const value = useMemo(() => ({
    keep,
    lastPush: 0,
    cache: [],
    setters,
    minimumDelay,
  }), [setters, keep, minimumDelay]);

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
