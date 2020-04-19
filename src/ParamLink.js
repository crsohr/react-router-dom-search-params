import React, { useCallback, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ParamContext } from './ParamProvider';
import { getFinalURL } from './utils';

/**
 * This component wraps a `<Link>` and lets you easily assign search params
 * in addition to a `to` URL.
 *
 * @method ParamLink
 * @param {String} to the pathname of the new URL, defaults to the current `pathname`
 * @param {Object} params the params to add to the URL as search params
 **/
export default React.forwardRef(function ParamLink(props, ref) {
  const { to, params, className } = props;
  const location = useLocation();
  const { keep } = useContext(ParamContext);
  const finalURL = getFinalURL({ location, keep, to, params });

  const handleClick = useCallback(e => {
    e.stopPropagation();
  }, []);
  return <Link className={className} onClick={handleClick} ref={ref} {...props} to={finalURL} />;
});

