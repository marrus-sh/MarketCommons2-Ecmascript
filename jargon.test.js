//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: jargon.test.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla
//    Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can
//    obtain one at <https://mozilla.org/MPL/2.0/>.

//@ts-nocheck
//deno-lint-ignore-file ban-ts-comment

import { SigilResolutionError } from "./errors.js";
import Jargon from "./jargon.js";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";

const myBadNodeType = Symbol("my bad node type");
const myNodeType = Symbol("my node type");
const myJargon = {
  namespaces: new Map([
    [null, null],
  ]),
  [myBadNodeType]: {},
  [myNodeType]: new Map([
    ["&#0;", "bad sigil"],
    [
      "&#1;",
      new Map(
        [
          ["* * &#1;", { value: "just the sigil" }],
          ["* * &#2;/&#1;", { value: "same‐type parent" }],
          ["* * &#2;//&#1;", {
            value: "same‐type ancestor",
          }],
          ["* * &#3;/&#2;/&#1;", {
            value: "multiple parents",
          }],
          ["* * &#3;//&#2;/&#1;", {
            value: "parent and ancestor",
          }],
          ["* * &#3;/&#2;//&#1;", {
            value: "ancestor and parent",
          }],
          ["* &#4;>&#1;", {
            value: "different‐type parent",
          }],
          ["* &#4; &#1;", {
            value: "different‐type ancestor",
          }],
          ["&#5; &#4;>&#1;", {
            value: "different‐type parent and ancestor",
          }],
          ["&#5;>&#4; &#1;", {
            value: "different‐type ancestor and parent",
          }],
        ],
      ),
    ],
  ]),
};
const resolve = Jargon.prototype.resolve.bind(myJargon);

Deno.test({
  name: "can’t resolve nonsymbol nodeType",
  fn: () =>
    assertThrows(
      () => resolve(null, "&#1;"),
      TypeError,
    ),
});

Deno.test({
  name: "can’t resolve empty path",
  fn: () =>
    assertThrows(
      () => resolve(myNodeType, ""),
      SigilResolutionError,
    ),
});

Deno.test({
  name: "can’t resolve bad node type",
  fn: () =>
    assertThrows(
      () => resolve(myBadNodeType, "&#1;"),
      SigilResolutionError,
    ),
});

Deno.test({
  name: "can’t resolve bad sigil",
  fn: () =>
    assertThrows(
      () => resolve(myNodeType, "&#0;"),
      SigilResolutionError,
    ),
});

Deno.test({
  name: "resolves plain sigil",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#1;").value,
      "just the sigil",
    ),
});

Deno.test({
  name: "resolves same‐type parent",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#2;/&#1;").value,
      "same‐type parent",
    ),
});

Deno.test({
  name: "resolves same‐type ancestor",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#2;/&#0;/&#1;").value,
      "same‐type ancestor",
    ),
});

Deno.test({
  name: "resolves multiple parents",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#3;/&#2;/&#1;").value,
      "multiple parents",
    ),
});

Deno.test({
  name: "resolves parent and ancestor",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#3;/&#0;/&#2;/&#1;").value,
      "parent and ancestor",
    ),
});

Deno.test({
  name: "resolves ancestor and parent",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#3;/&#2;/&#0;/&#1;").value,
      "ancestor and parent",
    ),
});

Deno.test({
  name: "resolves different‐type parent",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#4;>&#1;").value,
      "different‐type parent",
    ),
});

Deno.test({
  name: "resolves different‐type ancestor",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#4;/&#0;>&#0;/&#1;").value,
      "different‐type ancestor",
    ),
});

Deno.test({
  name: "resolves different‐type parent and ancestor",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#5;/&#0;>&#0;/&#4;>&#1;").value,
      "different‐type parent and ancestor",
    ),
});

Deno.test({
  name: "resolves different‐type ancestor and parent",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#5;>&#4;/&#0;>&#0;/&#1;").value,
      "different‐type ancestor and parent",
    ),
});

Deno.test({
  name: "allows top‐level to not be root",
  fn: () =>
    assertEquals(
      resolve(myNodeType, "&#6;/&#5;/&#0;>&#0;/&#4;>&#1;").value,
      "different‐type parent and ancestor",
    ),
});
