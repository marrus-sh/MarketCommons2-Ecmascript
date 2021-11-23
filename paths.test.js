//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: paths.test.js
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

import { normalizeReferences, sigilValue } from "./paths.js";
import { assertEquals } from "https://deno.land/std@0.106.0/testing/asserts.ts";

sigilValueTesting: {
  Deno.test("produces the correct value from B·M·P sigils", () =>
    assertEquals(sigilValue("&#x2764;"), "❤"));
  Deno.test("produces the correct value from non‐B·M·P sigils", () =>
    assertEquals(sigilValue("&#x1F494;"), "💔"));
  Deno.test("produces the correct value from multiple sigils", () =>
    assertEquals(
      sigilValue("&#x2600;&#x2601;&#x2602;&#x2603;"),
      "☀☁☂☃",
    ));
}

referenceNormalizationTesting: {
  Deno.test("character reference normalization", () =>
    assertEquals(
      normalizeReferences(
        "&#x2764;&#xfe0f;&#0061;&#x1F197;&#0;",
      ),
      "&#10084;&#65039;&#61;&#127383;&#0;",
    ));
  Deno.test("don’t normalize things which aren’t character references", () =>
    assertEquals(
      normalizeReferences("&#x2764&#fe0f;#0061;&#x1G197;&#;"),
      "&#x2764&#fe0f;#0061;&#x1G197;&#;",
    ));
}
