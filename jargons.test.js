//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: jargons.test.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla
//    Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can
//    obtain one at <https://mozilla.org/MPL/2.0/>.

//@ts-nocheck
//deno-lint-ignore-file ban-ts-comment no-unused-labels

import {
  NamespaceResolutionError,
  ParseError,
  SigilResolutionError,
} from "./errors.js";
import { Jargon } from "./jargons.js";
import { x·m·lNamespace, x·m·l·n·sNamespace } from "./names.js";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";

namespaceResolutionTesting: {
  //  Test setup.
  const myJargon = {
    namespaces: {
      "": "",
      "xml": x·m·lNamespace,
      "xmlns": x·m·l·n·sNamespace,
    },
  };
  const myJargonWithDefaultNamespace = {
    namespaces: {
      "": "example:default",
      "xml": x·m·lNamespace,
      "xmlns": x·m·l·n·sNamespace,
    },
  };
  Object.setPrototypeOf(myJargon, Jargon.prototype);
  Object.setPrototypeOf(
    myJargonWithDefaultNamespace,
    Jargon.prototype,
  );

  //  Tests.
  Deno.test("can’t resolve non‐qname", () => {
    assertThrows(() => myJargon.resolveQName("foo:"), ParseError);
    assertThrows(() => myJargon.resolveQName(":bar"), ParseError);
    assertThrows(() => myJargon.resolveQName("1024"), ParseError);
    assertThrows(() => myJargon.resolveQName(""), ParseError);
  });
  Deno.test("can’t resolve undefined namespace", () =>
    assertThrows(
      () => myJargon.resolveQName("foo:bar"),
      NamespaceResolutionError,
    ));
  Deno.test("can’t resolve X·M·L·N·S", () => {
    assertThrows(
      () => myJargon.resolveQName("xmlns"),
      ParseError,
    );
    assertThrows(
      () => myJargon.resolveQName("xmlns:foo"),
      ParseError,
    );
  });
  Deno.test("resolves defined namespaces", () => {
    assertEquals(myJargon.resolveQName("xml:foo"), {
      localName: "foo",
      namespace: x·m·lNamespace,
    });
    assertEquals(myJargon.resolveQName("baz"), {
      localName: "baz",
      namespace: null,
    });
  });
  Deno.test("resolves default namespaces (or not)", () => {
    assertEquals(myJargonWithDefaultNamespace.resolveQName("foo"), {
      localName: "foo",
      namespace: "example:default",
    });
    assertEquals(
      myJargonWithDefaultNamespace.resolveQName("foo", true),
      {
        localName: "foo",
        namespace: "example:default",
      },
    );
    assertEquals(
      myJargonWithDefaultNamespace.resolveQName("foo", false),
      {
        localName: "foo",
        namespace: null,
      },
    );
  });
  Deno.test("resolves attributes", () => {
    assertEquals(
      myJargonWithDefaultNamespace.resolveAttributes({
        "xml:foo": "FOO",
        baz: "BAZ",
      }),
      {
        "xml:foo": {
          localName: "foo",
          namespace: x·m·lNamespace,
          value: "FOO",
        },
        "baz": {
          localName: "baz",
          namespace: null,
          value: "BAZ",
        },
      },
    );
  });
}

sigilResolutionTesting: {
  //  Test setup.
  const myBadNodeType = Symbol("my bad node type");
  const myNodeType = Symbol("my node type");
  const myJargon = {
    namespaces: { "": "" },
    [myBadNodeType]: new Map(),
    [myNodeType]: {
      "&#0;": "bad sigil",
      "&#1;": {
        "* * &#1;": { value: "just the sigil" },
        "* * &#2;/&#1;": { value: "same‐type parent" },
        "* * &#2;//&#1;": { value: "same‐type ancestor" },
        "* * &#3;/&#2;/&#1;": { value: "multiple parents" },
        "* * &#3;//&#2;/&#1;": { value: "parent & ancestor" },
        "* * &#3;/&#2;//&#1;": { value: "ancestor & parent" },
        "* &#4;>&#1;": { value: "different‐type parent" },
        "* &#4; &#1;": { value: "different‐type ancestor" },
        "&#5; &#4;>&#1;": {
          value: "different‐type parent & ancestor",
        },
        "&#5;>&#4; &#1;": {
          value: "different‐type ancestor & parent",
        },
      },
    },
  };
  Object.setPrototypeOf(myJargon, Jargon.prototype);
  const resolve = Jargon.prototype.resolve.bind(myJargon);

  //  Tests.
  Deno.test("can’t resolve nonsymbol nodeType", () =>
    assertThrows(
      () => resolve(null, "&#1;"),
      TypeError,
    ));
  Deno.test("can’t resolve empty path", () =>
    assertThrows(
      () => resolve(myNodeType, ""),
      SigilResolutionError,
    ));
  Deno.test("can’t resolve bad node type", () =>
    assertThrows(
      () => resolve(myBadNodeType, "&#1;"),
      SigilResolutionError,
    ));
  Deno.test("can’t resolve bad sigil", () =>
    assertThrows(
      () => resolve(myNodeType, "&#0;"),
      SigilResolutionError,
    ));
  Deno.test("resolves plain sigil", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#1;").value,
      "just the sigil",
    ));
  Deno.test("resolves same‐type parent", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#2;/&#1;").value,
      "same‐type parent",
    ));
  Deno.test("resolves same‐type ancestor", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#2;/&#0;/&#1;").value,
      "same‐type ancestor",
    ));
  Deno.test("resolves multiple parents", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#3;/&#2;/&#1;").value,
      "multiple parents",
    ));
  Deno.test("resolves parent & ancestor", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#3;/&#0;/&#2;/&#1;").value,
      "parent & ancestor",
    ));
  Deno.test("resolves ancestor & parent", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#0;>&#3;/&#2;/&#0;/&#1;").value,
      "ancestor & parent",
    ));
  Deno.test("resolves different‐type parent", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#4;>&#1;").value,
      "different‐type parent",
    ));
  Deno.test("resolves different‐type ancestor", () =>
    assertEquals(
      resolve(myNodeType, "&#0;>&#4;/&#0;>&#0;/&#1;").value,
      "different‐type ancestor",
    ));
  Deno.test("resolves different‐type parent & ancestor", () =>
    assertEquals(
      resolve(myNodeType, "&#5;/&#0;>&#0;/&#4;>&#1;").value,
      "different‐type parent & ancestor",
    ));
  Deno.test("resolves different‐type ancestor & parent", () =>
    assertEquals(
      resolve(myNodeType, "&#5;>&#4;/&#0;>&#0;/&#1;").value,
      "different‐type ancestor & parent",
    ));
  Deno.test("allows top‐level to not be root", () =>
    assertEquals(
      resolve(myNodeType, "&#6;/&#5;/&#0;>&#0;/&#4;>&#1;").value,
      "different‐type parent & ancestor",
    ));
}
