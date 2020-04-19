import { useContext } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { ParamContext } from './ParamProvider';
import { getFinalURL } from './utils';
import { parseValue, encodeValues } from './values';

/**
 * Returns a function that can further be curried with an URL and will return 
 * another URL keeping all the parameters defined in the `ParamContext`.
 *
 * @method useURL
 * @return {Function} a function: `(to, params) => String`, returning an URL for which
 * the added params have been added
 **/
export function useURL() {
  const { keep } = useContext(ParamContext);
  const location = useLocation();
  return (to, params) => {
    return getFinalURL({ location, keep, to, params });
  };
}

/**
 * A custom hook to retrieve values and setters for search params.
 *
 * You can use it like so:
 *
 * ```
 * const searchParams = useSearchParams();
 * const [ filter, setFilter ] = searchParams.param('filter', '')
 * ````
 *
 * Multiple calls to setters are queued until the next tick, so you
 * can change more than values and not have React refresh intermediate
 * component for every intermediate changes.
 *
 * Depending on your use case, it might be best to use `withParams()`
 * to wrap a component with values and setters for your search params.
 *
 * @method useSearchParams
 * @return {Object} an instance with a method `param(name, defaultValue)`
 **/
export function useSearchParams() {
  const location = useLocation();
  const history = useHistory();
  const context = useContext(ParamContext);
  const { cache, lastPush, minimumDelay } = context;

  const cached = cache.filter(x => x.location === location);
  if(cached.length) {
    return cached[0].result;
  }

  const params = new URLSearchParams(location.search);
  let timer;

  const push = values => {
    let changed = false;
    Object.entries(values).forEach(([param, value]) => {
      if(value === null) {
        changed = true;
        params.delete(param);
        changed = true;
      } else {
        if(params.get(param) !== value) {
          changed = true;
          params.set(param, value);
        }
      }
    });
    if(!changed) { return }
    if(timer) { return; }
    let now = Date.now();
    let delaySinceLastPush = now - lastPush;
    context.lastPush = now;

    const doit = () => {
      timer = null;
      const paramsString = params.toString();
      const url = [
        location.pathname,
        paramsString? `?${paramsString}`: '',
        location.hash || '',
      ].join('');
      history.push(url);
    };
    if(minimumDelay < 0) {
      doit();
    } else {
      timer = setTimeout(doit, delaySinceLastPush > minimumDelay? 0: minimumDelay);
    }
  };

  const useParams = {};
  const param = (name, defaultValue) => {
    if(useParams[name]) {
      return useParams[name];
    }

    const value = parseValue(params, name, defaultValue);
    const setter = value => {
      if(value === defaultValue) {
        push({ [name]: null });
      } else {
        push({ [name]: null });
        encodeValues(params, name, value, defaultValue).forEach(([ encodedName, encodedValue ]) => push({ [encodedName]: encodedValue }));
      }
    };
    return useParams[name] = [ value, setter ];
  };

  const result = {
    get: param => params.get(param),
    entries: () => params.entries(),
    push,
    param,
  };
  cache.push({ location, result });
  return result;
}

