//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: symbols.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Various symbols used as constants during Market Commons ⅠⅠ
 *    processing.
 *
 *  @module MarketCommons2/symbols
 */

/**
 *  Types of node; either `SECTION`, `HEADING`, `BLOCK`, `INLINE`,
 *    or `ATTRIBUTE`.
 *
 *  These describe Market Commons ⅠⅠ nodes, not D·O·M ones.
 */
export const NODE_TYPE = Object.freeze(
	Object.create(null, {
		DOCUMENT: {
			configurable: false,
			enumerable: true,
			value: Symbol("document"),
			writable: false,
		},
		SECTION: {
			configurable: false,
			enumerable: true,
			value: Symbol("section"),
			writable: false,
		},
		HEADING: {
			configurable: false,
			enumerable: true,
			value: Symbol("heading"),
			writable: false,
		},
		BLOCK: {
			configurable: false,
			enumerable: true,
			value: Symbol("block"),
			writable: false,
		},
		INLINE: {
			configurable: false,
			enumerable: true,
			value: Symbol("inline"),
			writable: false,
		},
		ATTRIBUTE: {
			configurable: false,
			enumerable: true,
			value: Symbol("attribute"),
			writable: false,
		},
	})
)

/**
 *  Types of content; either `MIXED`, `TRANSPARENT`, `TEXT`,
 *    `COMMENT`, or `LITERAL`.
 */
export const CONTENT_MODEL = Object.freeze(
	Object.create(null, {
		MIXED: {
			configurable: false,
			enumerable: true,
			value: Symbol("mixed"),
			writable: false,
		},
		TRANSPARENT: {
			configurable: false,
			enumerable: true,
			value: Symbol("transparent"),
			writable: false,
		},
		INLINE: {
			configurable: false,
			enumerable: true,
			value: Symbol("inline"),
			writable: false,
		},
		TEXT: {
			configurable: false,
			enumerable: true,
			value: Symbol("text"),
			writable: false,
		},
		COMMENT: {
			configurable: false,
			enumerable: true,
			value: Symbol("comment"),
			writable: false,
		},
		LITERAL: {
			configurable: false,
			enumerable: true,
			value: Symbol("literal"),
			writable: false,
		},
	})
)
