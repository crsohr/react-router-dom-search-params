import { getFinalURL } from "./utils";

describe("utils", () => {
  describe("getFinalURL", () => {
    test("must handle new target with no `to`", () => {
      const location = new URL("http://localhost/path?a=1&b=2");
      expect(getFinalURL({ location, keep: ["a"], params: { c: 1 } })).toBe(
        "/path?a=1&b=2&c=1"
      );
    });

    test("must delete params set to null", () => {
      const location = new URL("http://localhost/path?a=1&b=2");
      expect(getFinalURL({ location, params: { a: null } })).toBe("/path?b=2");
    });
  });
});
