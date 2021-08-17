//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: paths.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Sigil path processing utilities.
 *
 *  @module MarketCommons2/paths
 */

import { SigilResolutionError } from "./errors.js"
import { SigilD·J } from "./syntax.js"

/**
 *  Normalizes all `CharRef`s in the provided `path` to use the decimal
 *    (not hexadecimal) format.
 *
 *  @argument {string} path
 *  @returns {string}
 */
export function normalizeReferences ( path ) {
	return String(path).replace(
		//  Fix character reference with leading zeroes.
		/&#(0[0-9]+);/gu,
		( match, decimal ) => `&#${ parseInt(decimal) };`
	).replace(
		//  Fix character reference with hexadecimal.
		/&#x([0-9A-Fa-f]+);/gu,
		( match, hex ) => `&#${ parseInt(hex, 16) };`
	)
}

/**
 *  Resolves the provided `path` for the provided `nodeType` and
 *    `jargon`, and returns the corresponding definition.
 *
 *  `path` should be “complete” (contain only sigils, `/`
 *    [but not `//`], or `>`) and normalized.
 *
 *  @argument {symbol} nodeType
 *  @argument {string} path
 *  @argument {Object} jargon
 *  @argument {{index:number}} options
 *  @returns {Object}
 */
export function resolve ( nodeType, path, jargon, options ) {
	const sigil = String(path).match(
		new RegExp (String.raw `${ SigilD·J.source }$`, "u")
	)?.[0]
	resolving: {
		//  Resolve the path.
		//  If this block is broken out of (with `break resolving`), a
		//    `SigilResolutionError` will be thrown.
		//  Otherwise, a value will be returned before this block
		//    completes.
		const nodeMap = jargon[nodeType]
		if ( typeof nodeType != "symbol" ) {
			//  Error:
			//  The provided `nodeType` is not a symbol.
			break resolving
		} else if ( !(nodeMap instanceof Map) ) {
			//  Error:
			//  The provided `nodeType` has no associated `Map` in the
			//    provided `jargon`.
			break resolving
		} else if ( nodeMap.has(sigil) ) {
			//  A sigil corresponding to the provided `path` is defined
			//    for the provided `nodeType`.
			const pathMap = nodeMap.get(sigil)
			if ( !(pathMap instanceof Map) ) {
				//  Error:
				//  The value associated with the sigil is not a `Map`.
				break resolving
			} else {
				//  The sigil has an associated `Map`.
				//  Filter its entries based on which keys match the
				//    provided `path`, then sort by “accuracy”.
				//  If the resulting array is not empty, the final
				//    entry will contain the resolution of the symbol.
				const sortedMatchingDefinitions =
					Object.entries(
						Array.from(pathMap.entries())
					).filter(
						( [ index, [ key, value ] ] ) =>
							//  Build a regular expression from the key
							//    and test `path` against it.
							new RegExp (
								"^" + String(key).replace(
									//  Escape regular expression
									//    special characters except for
									//    asterisk, which has a special
									//    meaning in paths and will be
									//    handled later.
									//  These characters shouldn’t ever
									//    appear in paths anyway!
									/[.+\-?^${}()|[\]\\]/gu, "\\$&"
								).replace(
									//  Any number of same‐type nodes
									//    may precede the path.
									/^/u, "(?:*/)?"
								).replace(
									//  Space adds an optional asterisk
									//    to the end of what precedes
									//    and the beginning of what
									//    follows.
									/ /gu, "(?:/*)?>(?:*/)?"
								).replace(
									//  Double slash becomes a plain
									//    slash optionally followed by
									//    an asterisk slash.
									/\/\//gu, "/(?:*/)?"
								).replace(
									//  Asterisks match some number of
									//    sigils, separated by slashes.
									/\*/gu,
									`${ SigilD·J.source }(?:/${ SigilD·J.source })*`
								) + "$"
							).test(path)
						).sort(
							(
								[ indexA, [ keyA, valueA ] ],
								[ indexB, [ keyB, valueB ] ]
							) => {
								//  Sort the matching keys by accuracy,
								//    in ascending order.
								//  Keys are considered more “accurate”
								//    if they contain a (non·asterisk)
								//    component which matches an
								//    element closer to the end of the
								//    path than the key they are being
								//    compared against.
								//  Parent relations are more accurate
								//    than ancestor relations.
								//
								//  The path and keys are split on
								//    (space and) greaterthan to ensure
								//    sigils are only compared against
								//    like sigils.
								//  For the keys, the space and
								//    greaterthan are preserved at the
								//    beginning of the split strings.
								const splitPath =
									String(path).split(/>/gu).reverse()
								const splitA =
									`>${keyA}`  //  prefix first
										.split(/(?=[ >])/gu)
										.slice(1)  //  drop empty first
										.reverse()
								const splitB =
									`>${keyB}`  //  prefix first
										.split(/(?=[ >])/gu)
										.slice(1)  //  drop empty first
										.reverse()
								for (
									let indexOfLevel = 0 ;
									indexOfLevel < splitPath.length ;
									indexOfLevel++
								) {
									//  Iterate over each “level”
									//    (node type) in the split
									//    split path and see if one key
									//    is more “accurate” than the
									//    other.
									const level =
										splitPath[indexOfLevel]
									const splitLevel = level.split(
										/\//gu
									).reverse()
									const levelA =
										splitA[indexOfLevel] ?? " "
									const splitLevelA = levelA
										.substring(1)  //  deprefix
										.split(
											/(?=\/(?=\/))|\/(?!\/)/gu
										).reverse()
									const levelB =
										splitB[indexOfLevel] ?? " "
									const splitLevelB = levelB
										.substring(1)  //  deprefix
										.split(
											/(?=\/(?=\/))|\/(?!\/)/gu
										).reverse()
									for ( let sigil of splitLevel ) {
										//  Iterate over each sigil in
										//    the level and check for
										//    a match from one key or
										//    the other.
										//  If this loop completes
										//    without returning,
										//    A and B have the same
										//    components at this level.
										if (
											splitLevelA[0] == sigil
												&& splitLevelB[0]
													== sigil
										) {
											//  A and B are both direct
											//    matches.
											do {
												//  Shift A and B,
												//    ensuring that
												//    they aren’t both
												//    ancestor matches.
												splitLevelA.shift()
												splitLevelB.shift()
											} while (
												splitLevelA[0] == "/"
													&& splitLevelB[0]
														== "/"
											)
											continue
										} else if (
											splitLevelA[0] == sigil
										) {
											//  A is a direct match and
											//    B isn’t.
											return 1
										} else if (
											splitLevelB[0] == sigil
										) {
											//  B is a direct match and
											//    A isn’t.
											return -1
										} else if (
											splitLevelA.find(
												$ => $ != "/"
											) == sigil
										) {
											//  A is an ancestor match
											//    and B isn’t.
											//  Note that A and B can’t
											//    both be ancestor
											//    matches at the same
											//    time (because of the
											//    do‐while above).
											return 1
										} else if (
											splitLevelB.find(
												$ => $ != "/"
											) == sigil
										) {
											//  B is an ancestor match
											//    and A isn’t.
											//  Note that A and B can’t
											//    both be ancestor
											//    matches at the same
											//    time (because of the
											//    do‐while above).
											return -1
										} else {
											//  Neither A nor B match.
											//  Try the next symbol.
											continue
										}
									}
									if (
										levelA[0] == ">"
											&& levelB[0] != ">"
									) {
										//  A is a direct descendant
										//    and B isn’t.
										return 1
									} else if (
										levelA[0] != ">"
											&& levelB[0] == ">"
									) {
										//  B is a direct descendant
										//    and A isn’t.
										return -1
									} else {
										//  A and B both change levels
										//    in the same fashion.
										continue
									}
								}
								return (
									//  Fallback; when A and B are
									//    equivalent, sort by index.
									//  This isn’t strictly necessary;
									//    it is the default behaviour
									//    if `0` is returned (although
									//    not in previous versions
									//    of Ecmascript).
									indexA < indexB ? -1
										: indexA > indexB ? 1
										: 0
								)
							}
						).map(( [ index, [ key, value ] ] ) => value)
				if ( sortedMatchingDefinitions.length > 0 ) {
					//  There is a final result; return it.
					return sortedMatchingDefinitions.pop()
				} else {
					//  Error:
					//  No paths defined on the sigil matched the
					//    provided `path`.
					break resolving
				}
			}
		} else {
			//  Error:
			//  No sigil corresponding to the provided `path` is
			//    defined for the provided `nodeType`.
			break resolving
		}
		throw new Error ("Block was supposed to break, but didn’t.")
	}
	throw new SigilResolutionError (options?.index, nodeType, path)
}
