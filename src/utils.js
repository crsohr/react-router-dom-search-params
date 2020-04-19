function getKeepParams(search, keepParams) {
  const query = new URLSearchParams(search);
  const result = new URLSearchParams();
  keepParams.forEach(param => query.has(param) && result.set(param, query.get(param)));
  return result.toString();
}

export function getFinalURL({ location, keep, to = location.pathname, params = {} }) {
  const toUrl = new URL(`https://localhost${to}`); // dummy host to allow parsing
  const { pathname: toPathname, search: toSearch } = toUrl;
  const toParams = new URLSearchParams(toSearch);
  const query = new URLSearchParams(
    (
      // are we the same URL?
      toPathname === location.pathname?

      // if so, keep all of our params
      location.search.substr(1):

      // else, keep only the parameters to keep accross pages
      getKeepParams(location.search, keep)
    )
    // if the `to` has some search, use it
    //toSearch.substr(1) + '&' 
  );
  Array.from(toParams.entries()).forEach(([param,value]) => query.set(param, value));
  Object.keys(params).forEach(param => {
    const value = params[param];
    query.delete(param);
    if(value !== null) {
      query.set(param, value);
    }
  });
  const queryString = query.toString();
  return `${toPathname}${queryString? `?${queryString}`: ''}`;
}
