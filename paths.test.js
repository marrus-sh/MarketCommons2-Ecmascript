//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: paths.test.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

import { SigilResolutionError } from "./errors.js"
import { normalizeReferences, resolve } from "./paths.js"
import { assertEquals, assertThrows } from
	"https://deno.land/std@0.105.0/testing/asserts.ts"

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

const myBadNodeType = Symbol("my bad node type")
const myNodeType = Symbol("my node type")
const myJargon = new Map ([
	[myBadNodeType, { }],
	[
		myNodeType,
		new Map ([
			["&#0;", "bad sigil"],
			[
				"&#1;", new Map (
					[
						["* * &#1;", "just the sigil"],
						["* * &#2;/&#1;", "same‐type parent"],
						["* * &#2;//&#1;", "same‐type ancestor"],
						["* * &#3;/&#2;/&#1;", "multiple parents"],
						["* * &#3;//&#2;/&#1;", "parent and ancestor"],
						["* * &#3;/&#2;//&#1;", "ancestor and parent"],
						["* &#4;>&#1;", "different‐type parent"],
						["* &#4; &#1;", "different‐type ancestor"],
						[
							"&#5; &#4;>&#1;",
							"different‐type parent and ancestor",
						],
						[
							"&#5;>&#4; &#1;",
							"different‐type ancestor and parent",
						],
					]
				)
			]
		]),
	]
])

Deno.test({
	name: "can’t resolve nonsymbol nodeType",
	fn: ( ) => assertThrows(
		( ) => resolve(null, "&#1;", myJargon),
		TypeError
	),
})

Deno.test({
	name: "can’t resolve empty path",
	fn: ( ) => assertThrows(
		( ) => resolve(myNodeType, "", myJargon),
		SigilResolutionError
	),
})

Deno.test({
	name: "can’t resolve bad node type",
	fn: ( ) => assertThrows(
		( ) => resolve(myBadNodeType, "&#1;", myJargon),
		SigilResolutionError
	),
})

Deno.test({
	name: "can’t resolve bad sigil",
	fn: ( ) => assertThrows(
		( ) => resolve(myNodeType, "&#0;", myJargon),
		SigilResolutionError
	),
})

Deno.test({
	name: "resolves plain sigil",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#0;>&#1;", myJargon),
		"just the sigil"
	),
})

Deno.test({
	name: "resolves same‐type parent",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#0;>&#2;/&#1;", myJargon),
		"same‐type parent"
	),
})

Deno.test({
	name: "resolves same‐type ancestor",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#0;>&#2;/&#0;/&#1;", myJargon),
		"same‐type ancestor"
	),
})

Deno.test({
	name: "resolves multiple parents",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#0;>&#3;/&#2;/&#1;", myJargon),
		"multiple parents"
	),
})

Deno.test({
	name: "resolves parent and ancestor",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#0;>&#3;/&#0;/&#2;/&#1;", myJargon),
		"parent and ancestor"
	),
})

Deno.test({
	name: "resolves ancestor and parent",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#0;>&#3;/&#2;/&#0;/&#1;", myJargon),
		"ancestor and parent"
	),
})

Deno.test({
	name: "resolves different‐type parent",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#4;>&#1;", myJargon),
		"different‐type parent"
	),
})

Deno.test({
	name: "resolves different‐type ancestor",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#0;>&#4;/&#0;>&#0;/&#1;", myJargon),
		"different‐type ancestor"
	),
})

Deno.test({
	name: "resolves different‐type parent and ancestor",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#5;/&#0;>&#0;/&#4;>&#1;", myJargon),
		"different‐type parent and ancestor"
	),
})

Deno.test({
	name: "resolves different‐type ancestor and parent",
	fn: ( ) => assertEquals(
		resolve(myNodeType, "&#5;>&#4;/&#0;>&#0;/&#1;", myJargon),
		"different‐type ancestor and parent"
	),
})
