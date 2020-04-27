/**
 * Parses multiple params that should be decoded to an object. Values that looks like
 * numbers are converted to numbers.
 *
 * @method getValueObject
 * @param {Object} params the params
 * @param {String} prefix only the properties of `params` prefixed by `prefix` will get returned
 * @param {Object} defaultValue the default value
 * @return {Object} an object of all the values in `params` prefixed by `prefix`
 */
function getValueObject(params, prefix, defaultValue) {
  const result = {};
  let found = false;
  Array.from(params.entries()).forEach(([name, value]) => {
    if (name.indexOf(prefix) === 0) {
      found = true;
      result[name.substr(prefix.length)] =
        Number(value).toString() === value ? Number(value) : value;
    }
  });
  return found ? result : defaultValue;
}

/**
 * Parses a value in search params given its name and a default value. If there
 * is no parameter named `name`, then `defaultValue` is returned.
 *
 * If a value is found, it is automatically converted depending on the type
 * of `defaultValue`.
 *
 * If `defaultValue` is an object, then `getValueObject()` is called to return an
 * object will all properties prefixed by `name`.
 *
 * If `defaultValue` is a number, then the value is casted to a number.
 *
 * If `defaultValue` is a boolean, then the result is true unless the value is
 * `0`, `off` or `false`.
 *
 * Else, the value is returned.
 *
 * @method parseValue
 * @param {Object} params the search params
 * @param {String} name the name of the param
 * @param {Any} defaultValue the default value
 */
export function parseValue(params, name, defaultValue) {
  if (typeof defaultValue === "object" && !Array.isArray(defaultValue)) {
    return getValueObject(params, name, defaultValue);
  }
  const value = params.get(name);
  if (Array.isArray(defaultValue)) {
    if (typeof value === "string") {
      return value? value.split(","): [];
    }
    return defaultValue;
  }
  if (typeof defaultValue === "number") {
    if (typeof value === "string") {
      return Number(value);
    }
    return value ?? defaultValue;
  }
  if (typeof defaultValue === "boolean") {
    if (typeof value === "string") {
      return value && value !== "0" && value !== "off" && value !== "false";
    }
    return value ?? defaultValue;
  }
  return value ?? defaultValue;
}

/**
 * Encodes a value to be used in a search param.
 *
 * If the `value` is an array, then all items are joined by a comma.
 *
 * If the `value` is an object, then all its properties are added as a new search param,
 * prefixed with `name`.
 *
 * @method encodeValues
 * @param {URLSearchParams} params the params
 * @param {String} name the name of the param
 * @param {Any} value the value
 * @param {Any} defaultValue the default value
 */
export function encodeValues(params, name, value, defaultValue) {
  if (Array.isArray(defaultValue) && Array.isArray(value)) {
    return [[name, value.join(",")]];
  }
  if (
    typeof defaultValue === "object" &&
    !Array.isArray(defaultValue) &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const result = Object.entries(value).map(([k, v]) => [name + k, v]);
    return result.concat(
      Array.from(params.keys())
        .filter((key) => key.indexOf(name) === 0 && !result.find(([newKey]) => newKey === key))
        .map((key) => [key, null])
    );
  }
  return [[name, value]];
}
