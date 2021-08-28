//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: jargon.test.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

import { normalizeReferences } from "./paths.js"
import { assertEquals } from
	"https://deno.land/std@0.106.0/testing/asserts.ts"

Deno.test({
	name: "character reference normalization",
	fn: ( ) => assertEquals(
		normalizeReferences("&#x2764;&#xfe0f;&#0061;&#x1F197;&#0;"),
		"&#10084;&#65039;&#61;&#127383;&#0;"
	),
})

Deno.test({
	name: "don’t normalize things which aren’t character references",
	fn: ( ) => assertEquals(
		normalizeReferences("&#x2764&#fe0f;#0061;&#x1G197;&#;"),
		"&#x2764&#fe0f;#0061;&#x1G197;&#;"
	),
})
