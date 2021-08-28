//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: errors.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Market Commons ⅠⅠ error types.
 *
 *  @module MarketCommons2/errors
 */

/**
 *  A generic Market Commons ⅠⅠ error.
 *
 *  Note that the spelling of `ⅠⅠ` in the name of this class uses
 *    `U+2160 Ⅰ ROMAN NUMERAL ONE`, not
 *    `U+0049 I LATIN CAPITAL LETTER I`.
 */
export class MarketCommonsⅠⅠError extends Error {

	/**
	 *  Create a `MarketCommonsⅠⅠError` from the provided `message`.
	 *
	 *  @argument {string} message
	 *  @argument {{index:number,line:number}} options
	 */
	constructor ( message, options, ...additionalArguments ) {
		const { index, line } = options ?? { }
		super (String(message), ...additionalArguments)
		this.index = index == null ? null : index >>> 0
		this.line = line == null ? null : line >>> 0
	}

	/**
	 *  Generate a string describing this `MarketCommonsⅠⅠError`.
	 *
	 *  @returns {string}
	 */
	toString ( ) {
		return this.index != null
				? `Market Commons ⅠⅠ (@ ${ this.index }): ${ this.constructor.name }: ${ this.message }`
			: this.line != null
				? `Market Commons ⅠⅠ (line ${ this.line } of content): ${ this.constructor.name }: ${ this.message }`
			: `Market Commons ⅠⅠ: ${this.constructor.name}: ${this.message}`
	}

}

/**
 *  A error pertaining to Market Commons ⅠⅠ configuration.
 */
export class ConfigurationError extends MarketCommonsⅠⅠError { }

/**
 *  A error pertaining to Market Commons ⅠⅠ parsing.
 */
export class ParseError extends MarketCommonsⅠⅠError { }

/**
 *  A error pertaining to Market Commons ⅠⅠ namespace processing.
 */
export class NamespaceError extends MarketCommonsⅠⅠError { }

/**
 *  A error pertaining to Market Commons ⅠⅠ sigil resolution.
 */
export class SigilResolutionError extends MarketCommonsⅠⅠError {

	/**
	 *  Create a `SigilResolutionError` at the provided `line` and
	 *    with the provided `nodeType` and `path`.
	 *
	 *  @argument {string} path
	 *  @argument {{line:number}} options
	 */
	constructor ( path, options, ...additionalArguments ) {
		const nodeType = options?.nodeType ?? null
		super (
			`Unable to resolve ${ nodeType.description } sigil path "${ path }"`,
			options,
			...additionalArguments
		)
		this.nodeType = nodeType
		this.path = String(path)
	}

}
