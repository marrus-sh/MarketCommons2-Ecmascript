//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: 🆐/html.marketdj.test.js
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

import "../fauxbrowser/mod.js";
import { Jargon } from "../dj.js";
import htmlD·J from "./html.marketdj.js";
import {
  //deno-lint-ignore camelcase
  deno_landXMarket,
  x·h·t·m·lNamespace,
  x·m·lNamespace,
  x·m·l·n·sNamespace,
} from "../names.js";
import { CONTENT_MODEL, NODE_TYPE } from "../symbols.js";
import {
  assert,
  assertEquals,
  assertStrictEquals,
} from "https://deno.land/std@0.106.0/testing/asserts.ts";

const D·J = htmlD·J;
const jargon = new Jargon(D·J);

Deno.test({
  name: "H·T·M·L D·J processing produced jargon.",
  fn: () => assert(jargon != null),
});

Deno.test({
  name: "H·T·M·L D·J processing consumed entire string.",
  fn: () => assertEquals(jargon.source.length, D·J.length),
});

Deno.test({
  name: "H·T·M·L D·J namespace declarations process correctly.",
  fn: () =>
    assertEquals(
      jargon.namespaces,
      {
        "": x·h·t·m·lNamespace,
        xml: x·m·lNamespace,
        xmlns: x·m·l·n·sNamespace,
      },
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
        textTo: ["data-title"],
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
      Object.keys(jargon[NODE_TYPE.SECTION]).length,
      Object.keys(sections).length,
    );
    for (const sigil in sections) {
      const pathsObject = jargon[NODE_TYPE.SECTION][sigil]
      assertEquals(Object.keys(pathsObject).length, 1);
      const path = sigil;
      const $ = pathsObject[path];
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
      assertEquals($.attributes, {});
      assertEquals($.countTo, null);
      assertEquals($.textTo, textTo ?? null);
      assertEquals(
        $.heading,
        heading === undefined
          ? {
            nodeType: NODE_TYPE.HEADING,
            contentModel: CONTENT_MODEL.INLINE,
            sigil: sigil,
            path: `${sigil} ${sigil}`,
            qualifiedName: "h1",
            attributes: {},
            countTo: ["aria-level"],
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
      Object.keys(jargon[NODE_TYPE.HEADING]).length,
      Object.keys(headings).length,
    );
    for (const sigil in headings) {
      const pathsObject = jargon[NODE_TYPE.HEADING][sigil]
      assertEquals(Object.keys(pathsObject).length, 1);
      const path = `* ${sigil}`;
      const $ = pathsObject[path];
      const { qualifiedName } = headings[sigil];
      assert($ != null);
      assertEquals($.nodeType, NODE_TYPE.HEADING);
      assertEquals($.contentModel, CONTENT_MODEL.INLINE);
      assertEquals($.sigil, sigil);
      assertEquals($.path, path);
      assertEquals($.qualifiedName, qualifiedName);
      assertEquals($.attributes, {});
      assertEquals($.countTo, ["aria-level"]);
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
      Object.keys(jargon[NODE_TYPE.BLOCK]).length,
      Object.keys(blocks).length,
    );
    for (const subpath in blocks) {
      const sigil = subpath.substring(
        subpath.lastIndexOf("/") + 1,
      );
      const pathsObject = jargon[NODE_TYPE.BLOCK][sigil]
      assertEquals(Object.keys(pathsObject).length, 1);
      const path = `* ${subpath}`;
      const $ = pathsObject[path];
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
      assertEquals($.qualifiedName, qualifiedName ?? "");
      assertEquals($.attributes, {});
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
        assertEquals(list.attributes, {});
      }
    }
  },
});

Deno.test({
  name: "H·T·M·L D·J block defaults process correctly.",
  fn: () => {
    const pathsObject = jargon[NODE_TYPE.BLOCK]["#DEFAULT"]
    assertEquals(Object.keys(pathsObject).length, 1);
    assertStrictEquals(
      pathsObject["*>#DEFAULT"],
      jargon[NODE_TYPE.BLOCK]["&#46;"]["* &#46;"],
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
        textTo: ["alt", "title"],
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
        textTo: ["data-text"],
      },
      "&#93;": { qualifiedName: "abbr" },
      "&#94;": { qualifiedName: "sup" },
      "&#95;": { qualifiedName: "u" },
      "&#96;": { contentModel: CONTENT_MODEL.LITERAL },
      "&#126;": { qualifiedName: "code" },
    };
    assertEquals(
      Object.keys(jargon[NODE_TYPE.INLINE]).length,
      Object.keys(inlines).length,
    );
    for (const subpath in inlines) {
      const sigil = subpath.substring(
        subpath.lastIndexOf("/") + 1,
      );
      const pathsObject = jargon[NODE_TYPE.INLINE][sigil]
      assertEquals(Object.keys(pathsObject).length, 1);
      const path = `* * ${subpath}`;
      const $ = pathsObject[path]
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
      assertEquals($.qualifiedName, qualifiedName ?? "");
      assertEquals($.attributes, {});
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
      Object.keys(jargon[NODE_TYPE.ATTRIBUTE]).length,
      Object.keys(attributes).length,
    );
    for (const subpath in attributes) {
      const sigil = subpath.substring(
        subpath.lastIndexOf("/") + 1,
      );
      const pathsObject = jargon[NODE_TYPE.ATTRIBUTE][sigil]
      assertEquals(Object.keys(pathsObject).length, 1);
      const path = `* * * ${subpath}`;
      const $ = pathsObject[path];
      const { qualifiedName } = attributes[subpath];
      assert($ != null);
      assert($.every(($$) => $$.nodeType == NODE_TYPE.ATTRIBUTE));
      assert($.every(($$) => $$.contentModel == CONTENT_MODEL.TEXT));
      assert($.every(($$) => $$.sigil == sigil));
      assert($.every(($$) => $$.path == path));
      assertEquals(
        $.map(($$) => $$.qualifiedName),
        [].concat(qualifiedName),
      );
    }
  },
});
