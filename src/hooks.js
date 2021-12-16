import { useContext, useEffect, useMemo, useRef, useCallback } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { ParamContext } from "./ParamProvider";
import { getFinalURL } from "./utils";
import { parseValue, encodeValues } from "./values";

/**
 * Returns a function that can further be curried with an URL and will return
 * another URL keeping all the parameters defined in the `ParamContext`.
 *
 * @method useURL
 * @return {Function} a function: `(to, params) => String`, returning an URL for which
 * the added params have been added
 */
export function useURL() {
  const { keep } = useContext(ParamContext);
  const location = useLocation();
  return (to, params) => {
    return getFinalURL({ location, keep, to, params });
  };
}

/**
 * Returns a function that pushes param change and commit the location after a specified
 * amount of time has passed.
 *
 * @method usePush
 * @private
 */
function usePush() {
  const location = useLocation();
  const history = useHistory();
  const context = useContext(ParamContext);
  const { minimumDelay } = context;
  const paramsRef = useRef(new URLSearchParams(location.search));
  const locationRef = useRef();
  useMemo(() => {
    locationRef.current = location;
  }, [location]);
  const timerRef = useRef();
  return useCallback((values) => {
    const params = paramsRef.current;
    const { lastPush } = context;
    let changed = false;
    Object.entries(values).forEach(([param, value]) => {
      if (value === null) {
        changed = true;
        params.delete(param);
        changed = true;
      } else if (params.get(param) !== value) {
        changed = true;
        params.set(param, value);
      }
    });
    if (!changed) {
      return;
    }
    if (timerRef.current) {
      return;
    }
    const now = Date.now();
    const delaySinceLastPush = now - lastPush;
    context.lastPush = now;

    const doit = () => {
      timerRef.current = null;
      const paramsString = params.toString();
      const url = [
        locationRef.current.pathname,
        paramsString ? `?${paramsString}` : "",
        locationRef.current.hash || "",
      ].join("");
      history.push(url);
    };
    if (minimumDelay < 0) {
      doit();
    } else {
      timerRef.current = setTimeout(
        doit,
        delaySinceLastPush > minimumDelay ? 0 : minimumDelay
      );
    }
  }, [context, history, locationRef, minimumDelay, paramsRef]);
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
 * @return {Object} an instance with a method `param(name, defaultValue)`
 */
export function useSearchParams() {
  const location = useLocation();
  const context = useContext(ParamContext);
  const { cache, setters } = context;

  const paramsRef = useRef();
  useMemo(() => {
  paramsRef.current = new URLSearchParams(location.search);
  }, [location.search]);

  const params = new URLSearchParams(location.search);
  const push = usePush();

  const cached = cache.filter((x) => x.location === location);
  if (cached.length) {
    return cached[0].result;
  }

  const useParams = {};
  const param = (name, defaultValue) => {
    if (useParams[name]) {
      return useParams[name];
    }

    const value = parseValue(params, name, defaultValue);
    let setter = setters.find(({ name: setterName, defaultValue: setterDefaultValue }) => name === setterName && defaultValue === setterDefaultValue)?.setter;
    if(!setter) {
      setter = (newValue) => {
        if (newValue === defaultValue) {
          push({ [name]: null });
        } else {
          push({ [name]: null });
          encodeValues(
            paramsRef.current,
            name,
            newValue,
            defaultValue
          ).forEach(([encodedName, encodedValue]) =>
            push({ [encodedName]: encodedValue })
          );
        }
      };
      setters.push({ setter, name, defaultValue });
    }
    useParams[name] = [value, setter];
    return useParams[name];
  };

  const result = {
    get: (paramName) => params.get(paramName),
    entries: () => params.entries(),
    push,
    param,
  };
  cache.push({ location, result });
  return result;
}
