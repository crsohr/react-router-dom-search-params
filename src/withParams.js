import React from "react";
import { useSearchParams } from "./hooks";

/**
 * Wraps a component with additional properties that gives access to value of some
 * search params as well as setters to update the value.
 *
 * `params` must be an object whose keys are the name of the props, and values is
 * an object with the following properties:
 * - `name`: the name of the search param in the URL, defaults to the current key
 * - `defaultValue`: the default value for the param
 * - `getterProp`: the name of the getter prop added to the component, defaults to
 *   `name`
 * - `setterProp`: the name of the setter prop; for example if the name of the
 *   getter is `selected`, the setter is `setSelected`
 *
 * Optionally, values in the `params` object might also be a function, in which
 * case it is applied with the current props of the component.
 *
 * @method withParams
 * @param {Component} WrappedComponent the component
 * @param {Object} params the params
 */
export default function withParams(WrappedComponent, params) {
  return function WrappingComponent(props) {
    const searchParams = useSearchParams();
    const paramsProps = {};
    Object.entries(params).forEach(([param, paramOptions]) => {
      const options = typeof paramOptions === "function"? paramOptions(props): paramOptions;
      const {
        name = param,
        defaultValue,
        getterProp,
        setterProp,
      } = options;
      const [value, setter] = searchParams.param(name, defaultValue);
      paramsProps[getterProp || param] = value;
      paramsProps[
        setterProp ||
          (getterProp || param).replace(
            /^(.)(.*)/,
            (_, head, tail) => `set${head.toUpperCase()}${tail}`
          )
      ] = setter;
    });
    return <WrappedComponent {...paramsProps} {...props} />;
  };
}
