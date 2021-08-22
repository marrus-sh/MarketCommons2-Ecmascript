//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: text.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Various utility functions related to text processing.
 *
 *  @module MarketCommons2/text
 */

import { ParseError } from "./errors.js"
import { Char, RestrictedChar } from "./syntax.js"

/**
 *  Normalizes line endings in the provided `text` according to X·M·L
 *    rules and returns the result.
 *
 *  If `text` contains a literal character matching `RestrictedChar`,
 *    throws.
 *  This function does *not* check to ensure `text` contains only
 *    `Char`s; this requires an additional pass since it requires
 *    handling surrogate pairs.
 *  However, it does catch U+0000, U+FFFE, and U+FFFF.
 */
export function prepareAsX·M·L ( text ) {
	//  It’s okay to treat strings as arrays here because the
	//    codepoints we are checking are all in the B·M·P.
	return Array.prototype.map.call(text,
		($, ℹ) => {
			if ( RestrictedChar.test($)
					|| /[\x00\uFFFE\uFFFF]/u.test($) ) {
				throw new ParseError (
					ℹ,
					`#x${ $.charCodeAt(0).toString(16).toUpperCase() } is restricted from appearing literally in documents.`
				)
			} else if ( /\x0D[\x0A\x85]?|\x85|\u2028/u.test($) ) {
				return "\n"
			} else { return $ }
		}
	).join("")
}