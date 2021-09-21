//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: html.marketdj.test.js
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

import "./fauxbrowser/mod.js";
import { process } from "./dj.js";
import htmlD·J from "./html.marketdj.js";
import {
  //deno-lint-ignore camelcase
  deno_landXMarket,
  x·h·t·m·lNamespace,
  x·m·lNamespace,
  x·m·l·n·sNamespace,
} from "./names.js";
import { CONTENT_MODEL, NODE_TYPE } from "./symbols.js";
import {
  assert,
  assertEquals,
  assertStrictEquals,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";

const D·J = htmlD·J;
const result = process(D·J);
const jargon = result.jargon;

Deno.test({
  name: "H·T·M·L D·J processing produced jargon.",
  fn: () => assert(result.jargon != null),
});

Deno.test({
  name: "H·T·M·L D·J processing consumed entire string.",
  fn: () => assertEquals(result.lastIndex, D·J.length),
});

Deno.test({
  name: "H·T·M·L D·J namespace declarations process correctly.",
  fn: () =>
    assertEquals(
      jargon.namespaces,
      new Map([
        ["", x·h·t·m·lNamespace],
        ["xml", x·m·lNamespace],
        ["xmlns", x·m·l·n·sNamespace],
      ]),
    ),
});

Deno.test({
  name: "H·T·M·L D·J document declaration processes correctly.",
  fn: () => {
    const { nodeType, contentModel, template } =
      jargon[NODE_TYPE.DOCUMENT];
    assertEquals(nodeType, NODE_TYPE.DOCUMENT);
    assertEquals(contentModel, CONTENT_MODEL.MIXED);
    assertEquals(
      (new XMLSerializer()).serializeToString(template),
      //  There are “errors” in the following string which result
      //    from “bugs” in the `XMLSerializer` implementation.
      //  See <https://github.com/w3c/DOM-Parsing/issues/59> for
      //    the most egregious.
      `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="utf-8"/>
	<meta name="generator" content="market-commons 2.0
${deno_landXMarket}"/>
	<!-- BEGIN PREAMBLE -->
<preamble xmlns="tag:go.KIBI.family,2021:market"></preamble>
	<!-- END PREAMBLE -->
</head>
<body>
	<!-- BEGIN CONTENT -->
<content xmlns="tag:go.KIBI.family,2021:market"></content>
	<!-- END CONTENT -->
</body>
</html>`,
    );
  },
});

Deno.test({
  name: "H·T·M·L D·J section declarations process correctly.",
  fn: () => {
    const sections = {
      "&#36;": { qualifiedName: "section" },
      "&#37;": { qualifiedName: "nav" },
      "&#47;": {
        contentModel: CONTENT_MODEL.TEXT,
        qualifiedName: "div",
        textTo: new Set(["data-title"]),
        heading: null,
      },
      "&#58;": { qualifiedName: "div" },
      "&#60;": { qualifiedName: "aside" },
      "&#62;": { qualifiedName: "blockquote" },
      "&#64;": { qualifiedName: "article" },
      "&#94;": { qualifiedName: "header" },
      "&#95;": { qualifiedName: "footer" },
    };
    assertEquals(
      jargon[NODE_TYPE.SECTION].size,
      Object.keys(sections).length,
    );
    for (const sigil in sections) {
      assertEquals(jargon[NODE_TYPE.SECTION].get(sigil).size, 1);
      const path = sigil;
      const $ = jargon[NODE_TYPE.SECTION].get(sigil).get(path);
      const {
        contentModel,
        heading,
        qualifiedName,
        textTo,
      } = sections[sigil];
      assert($ != null);
      assertEquals($.nodeType, NODE_TYPE.SECTION);
      assertEquals(
        $.contentModel,
        contentModel ?? CONTENT_MODEL.MIXED,
      );
      assertEquals($.sigil, sigil);
      assertEquals($.path, path);
      assertEquals($.qualifiedName, qualifiedName);
      assertEquals($.attributes, new Map());
      assertEquals($.countTo, null);
      assertEquals($.textTo, textTo ?? null);
      assertEquals(
        $.heading,
        heading === undefined
          ? {
            nodeType: NODE_TYPE.HEADING,
            contentModel: CONTENT_MODEL.INLINE,
            sigil: sigil,
            path: `* ${sigil}`,
            qualifiedName: "h1",
            attributes: new Map(),
            countTo: new Set(["aria-level"]),
          }
          : heading,
      );
    }
  },
});

Deno.test({
  name: "H·T·M·L D·J heading declarations process correctly.",
  fn: () => {
    const headings = { "&#45;": { qualifiedName: "h1" } };
    assertEquals(
      jargon[NODE_TYPE.HEADING].size,
      Object.keys(headings).length,
    );
    for (const sigil in headings) {
      assertEquals(jargon[NODE_TYPE.HEADING].get(sigil).size, 1);
      const path = `* ${sigil}`;
      const $ = jargon[NODE_TYPE.HEADING].get(sigil).get(path);
      const { qualifiedName } = headings[sigil];
      assert($ != null);
      assertEquals($.nodeType, NODE_TYPE.HEADING);
      assertEquals($.contentModel, CONTENT_MODEL.INLINE);
      assertEquals($.sigil, sigil);
      assertEquals($.path, path);
      assertEquals($.qualifiedName, qualifiedName);
      assertEquals($.attributes, new Map());
      assertEquals($.countTo, new Set(["aria-level"]));
    }
  },
});

Deno.test({
  name: "H·T·M·L D·J block declarations process correctly.",
  fn: () => {
    const blocks = {
      "&#38;": { qualifiedName: "li", inList: "ol" },
      "&#43;": { qualifiedName: "li", inList: "ul" },
      "&#44;": { qualifiedName: "dd", inList: "dl" },
      "&#46;": {
        contentModel: CONTENT_MODEL.INLINE,
        qualifiedName: "p",
        isDefault: true,
      },
      "&#58;": { qualifiedName: "div" },
      "&#59;": { contentModel: CONTENT_MODEL.COMMENT },
      "&#62;": { qualifiedName: "blockquote" },
      "&#63;": { qualifiedName: "dt", inList: "dl" },
      "&#91;": { qualifiedName: "figure" },
      "&#91;/&#95;": { qualifiedName: "figcaption" },
      "&#93;": { qualifiedName: "address" },
      "&#96;": { contentModel: CONTENT_MODEL.LITERAL },
    };
    assertEquals(
      Array.from(jargon[NODE_TYPE.BLOCK].keys()).filter(
        ($) => $ != "#DEFAULT",
      ).length,
      Object.keys(blocks).length,
    );
    for (const subpath in blocks) {
      const sigil = subpath.substring(
        subpath.lastIndexOf("/") + 1,
      );
      assertEquals(jargon[NODE_TYPE.BLOCK].get(sigil).size, 1);
      const path = `* ${subpath}`;
      const $ = jargon[NODE_TYPE.BLOCK].get(sigil).get(path);
      const {
        contentModel,
        inList,
        isDefault,
        qualifiedName,
      } = blocks[subpath];
      assert($ != null);
      assertEquals($.nodeType, NODE_TYPE.BLOCK);
      assertEquals(
        $.contentModel,
        contentModel ?? CONTENT_MODEL.MIXED,
      );
      assertEquals($.sigil, sigil);
      assertEquals($.path, path);
      assertEquals($.qualifiedName, qualifiedName ?? null);
      assertEquals($.attributes, new Map());
      assertEquals(
        $.isDefault,
        isDefault ?? false,
      );
      if (inList) {
        const list = $.inList;
        assert(list != null);
        assertEquals(list.nodeType, NODE_TYPE.BLOCK);
        assertEquals(list.contentModel, CONTENT_MODEL.MIXED);
        assertEquals(list.sigil, null);
        assertEquals(list.path, null);
        assertEquals(list.qualifiedName, inList);
        assertEquals(list.attributes, new Map());
      }
    }
  },
});

Deno.test({
  name: "H·T·M·L D·J block defaults process correctly.",
  fn: () => {
    assertEquals(jargon[NODE_TYPE.BLOCK].get("#DEFAULT").size, 1);
    assertStrictEquals(
      jargon[NODE_TYPE.BLOCK].get("#DEFAULT").get("*>#DEFAULT"),
      jargon[NODE_TYPE.BLOCK].get("&#46;").get("* &#46;"),
    );
  },
});

Deno.test({
  name: "H·T·M·L D·J inline declarations process correctly.",
  fn: () => {
    const inlines = {
      "&#33;": { qualifiedName: "strong" },
      "&#34;": { qualifiedName: "q", inList: "ul" },
      "&#35;": { qualifiedName: "b", inList: "dl" },
      "&#36;": { qualifiedName: "var", inList: "dl" },
      "&#37;": { qualifiedName: "mark", inList: "dl" },
      "&#38;": {
        contentModel: CONTENT_MODEL.TEXT,
        qualifiedName: "img",
        textTo: new Set(["alt", "title"]),
      },
      "&#39;": { qualifiedName: "cite" },
      "&#42;": { qualifiedName: "em" },
      "&#43;": { qualifiedName: "ins" },
      "&#44;": { qualifiedName: "sub" },
      "&#45;": { qualifiedName: "del" },
      "&#46;": { qualifiedName: "ruby" },
      "&#46;/&#123;": { qualifiedName: "rb" },
      "&#46;/&#125;": { qualifiedName: "rt" },
      "&#47;": { qualifiedName: "i" },
      "&#58;": { qualifiedName: "span" },
      "&#59;": { contentModel: CONTENT_MODEL.COMMENT },
      "&#60;": { qualifiedName: "samp" },
      "&#61;": { qualifiedName: "s" },
      "&#62;": { qualifiedName: "kbd" },
      "&#63;": { qualifiedName: "dfn" },
      "&#64;": { qualifiedName: "a", textFrom: "href" },
      "&#91;": { qualifiedName: "small" },
      "&#92;": {
        contentModel: CONTENT_MODEL.TEXT,
        qualifiedName: "br",
        textTo: new Set(["data-text"]),
      },
      "&#93;": { qualifiedName: "abbr" },
      "&#94;": { qualifiedName: "sup" },
      "&#95;": { qualifiedName: "u" },
      "&#96;": { contentModel: CONTENT_MODEL.LITERAL },
      "&#126;": { qualifiedName: "code" },
    };
    assertEquals(
      jargon[NODE_TYPE.INLINE].size,
      Object.keys(inlines).length,
    );
    for (const subpath in inlines) {
      const sigil = subpath.substring(
        subpath.lastIndexOf("/") + 1,
      );
      assertEquals(jargon[NODE_TYPE.INLINE].get(sigil).size, 1);
      const path = `* * ${subpath}`;
      const $ = jargon[NODE_TYPE.INLINE].get(sigil).get(path);
      const {
        contentModel,
        qualifiedName,
        textFrom,
        textTo,
      } = inlines[subpath];
      assert($ != null);
      assertEquals($.nodeType, NODE_TYPE.INLINE);
      assertEquals(
        $.contentModel,
        contentModel ?? CONTENT_MODEL.INLINE,
      );
      assertEquals($.sigil, sigil);
      assertEquals($.path, path);
      assertEquals($.qualifiedName, qualifiedName ?? null);
      assertEquals($.attributes, new Map());
      assertEquals($.textFrom, textFrom ?? null);
      assertEquals($.textTo, textTo ?? null);
    }
  },
});

Deno.test({
  name: "H·T·M·L D·J attribute declarations process correctly.",
  fn: () => {
    const attributes = {
      "&#33;": { qualifiedName: "href" },
      "&#35;": { qualifiedName: "id" },
      "&#36;": { qualifiedName: "style" },
      "&#37;": { qualifiedName: "resource" },
      "&#38;": { qualifiedName: "src" },
      "&#42;": { qualifiedName: "tabindex" },
      "&#44;": { qualifiedName: "property" },
      "&#46;": { qualifiedName: "class" },
      "&#47;": { qualifiedName: "title" },
      "&#59;": { qualifiedName: "typeof" },
      "&#60;": { qualifiedName: "rev" },
      "&#61;": { qualifiedName: "role" },
      "&#62;": { qualifiedName: "rel" },
      "&#63;": { qualifiedName: "about" },
      "&#64;": { qualifiedName: ["lang", "xml:lang"] },
      "&#94;": { qualifiedName: "datatype" },
      "&#96;": { qualifiedName: "type" },
      "&#126;": { qualifiedName: "content" },
    };
    assertEquals(
      jargon[NODE_TYPE.ATTRIBUTE].size,
      Object.keys(attributes).length,
    );
    for (const subpath in attributes) {
      const sigil = subpath.substring(
        subpath.lastIndexOf("/") + 1,
      );
      assertEquals(
        jargon[NODE_TYPE.ATTRIBUTE].get(sigil).size,
        1,
      );
      const path = `* * * ${subpath}`;
      const $ = jargon[NODE_TYPE.ATTRIBUTE].get(sigil).get(path);
      const { qualifiedName } = attributes[subpath];
      assert($ != null);
      assert(
        Array.from($).every(
          ($$) => $$.nodeType == NODE_TYPE.ATTRIBUTE,
        ),
      );
      assert(
        Array.from($).every(
          ($$) => $$.contentModel == CONTENT_MODEL.TEXT,
        ),
      );
      assert(Array.from($).every(($$) => $$.sigil == sigil));
      assert(Array.from($).every(($$) => $$.path == path));
      assertEquals(
        new Set(Array.from($).map(($$) => $$.qualifiedName)),
        new Set([].concat(qualifiedName)),
      );
    }
  },
});
