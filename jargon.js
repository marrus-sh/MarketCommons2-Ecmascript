//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: jargon.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Jargon data structure and processing.
 *
 *  @module MarketCommons2/jargon
 */

import {
	MarketCommonsⅠⅠError,
	NamespaceError,
	SigilResolutionError,
} from "./errors.js"
import {
	x·m·lNamespace,
	x·m·l·n·sNamespace,
} from "./names.js"
import { globRegExp } from "./paths.js"
import { NODE_TYPE } from "./symbols.js"
import { SigilD·J } from "./syntax.js"

/**
 *  The class of parsed Declaration of Jargon objects.
 */
export default class Jargon extends null {
	
	constructor ( ) {
		return Object.create(
			Jargon.prototype,
			{
				namespaces: {             //  [prefix:literal]
					configurable: true,
					enumerable: false,
					value: new Map ([
						[ null, null ],
						[ "xml", x·m·lNamespace ],
						[ "xmlns", x·m·l·n·sNamespace ],
					]),
					writable: false,
				},
				[NODE_TYPE.DOCUMENT]: {   //  `XMLDocument`
					configurable: true,
					enumerable: false,
					value: null,
					writable: false,
				},
				[NODE_TYPE.SECTION]: {    //  [sigil:[path:section]]
					configurable: true,
					enumerable: false,
					value: new Map,
					writable: false,
				},
				[NODE_TYPE.HEADING]: {    //  [sigil:[path:section]]
					configurable: true,
					enumerable: false,
					value: new Map,
					writable: false,
				},
				[NODE_TYPE.BLOCK]: {      //  [sigil:[path:section]]
					configurable: true,
					enumerable: false,
					value: new Map ([ ["#DEFAULT", new Map ] ]),
					writable: false,
				},
				[NODE_TYPE.INLINE]: {     //  [sigil:[path:section]]
					configurable: true,
					enumerable: false,
					value: new Map,
					writable: false,
				},
				[NODE_TYPE.ATTRIBUTE]: {  //  [sigil:[path:section]]
					configurable: true,
					enumerable: false,
					value: new Map,
					writable: false,
				},
			}
		)
	}

	/**
	 *  Resolves the provided `path` for the provided `nodeType` using
	 *    this `Jargon`, and returns the corresponding definition.
	 *
	 *  `path` should be “complete” (contain only sigils, `/`
	 *    [but not `//`], or `>`) and normalized.
	 *
	 *  @argument {symbol} nodeType
	 *  @argument {string} path
	 *  @argument {{line:number}} options
	 *  @returns {Object}
	 */
	resolve ( nodeType, path, options ) {
		//  To keep from having to do a bunch of typically‐needless
		//    typechecking (e.g., that the path map exists and is a
		//    `Map`), and because any failure to resolve ought to
		//    produce a `SigilResolutionError` anyway, the body of this
		//    function is written as a massive `try‐catch`.
		try {
			//  Find the appropriate mapping of paths to jargons.
			//  Then filter entries based on which keys match the
			//    provided `path`, and finally sort by “accuracy”.
			//  If the resulting array is not empty, the final
			//    entry will contain the resolution of the symbol.
			const sigil = String(path).match(
				new RegExp (`(?:${ SigilD·J.source }|#DEFAULT)$`, "u")
			)?.[0]
			const pathMap = this[nodeType].get(sigil)
			const sortedMatchingDefinitions =
				Object.entries(
					Array.from(pathMap.entries())
				).filter(
					//deno-lint-ignore no-unused-vars
					( [ index, [ key, value ] ] ) =>
						//  Build a regular expression from the key and
						//    test `path` against it.
						globRegExp(key).test(path)
				).sort(
					(
						//deno-lint-ignore no-unused-vars
						[ indexA, [ keyA, valueA ] ],
						//deno-lint-ignore no-unused-vars
						[ indexB, [ keyB, valueB ] ]
					) => {
						//  Sort the matching keys by accuracy, in
						//    ascending order.
						//  Keys are considered more “accurate” if they
						//    contain a (non·asterisk) component which
						//    matches an element closer to the end of
						//    the path than the key they are being
						//    compared against.
						//  Parent relations are more accurate than
						//    ancestor relations.
						//
						//  The path & keys are split on (space &)
						//    greaterthan to ensure sigils are only
						//    compared against like sigils.
						//  For the keys, the space & greaterthan are
						//    preserved at the beginning of the split
						//    strings.
						const splitPath =
							String(path).split(/>/gu).reverse()
						const splitA =
							`>${keyA}`  //  add `>` prefix to first
								.split(/(?=[ >])/gu)
								.slice(1)  //  drop empty first
								.reverse()
						const splitB =
							`>${keyB}`  //  add `>` prefix to first
								.split(/(?=[ >])/gu)
								.slice(1)  //  drop empty first
								.reverse()
						for (
							let indexOfLevel = 0 ;
							indexOfLevel < splitPath.length ;
							indexOfLevel++
						) {
							//  Iterate over each “level” (node type)
							//    in the split path and see if one key
							//    is more “accurate” than the other.
							//  If a key’s levels are exhausted, it is
							//    treated as an empty descendant
							//    relation (and will thus always
							//    result in a match for the other key.)
							const level = splitPath[indexOfLevel]
							const splitLevel =
								level.split(/\//gu).reverse()
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
							for ( const sigil of splitLevel ) {
								//  Iterate over each sigil in the
								//    level and check for a match from
								//    one key or the other.
								//  If this loop completes without
								//    returning, A & B have the same
								//    components at this level.
								if (
									splitLevelA[0] == sigil
										&& splitLevelB[0]
											== sigil
								) {
									//  A and B are both direct
									//    matches.
									do {
										//  Shift A and B, ensuring
										//    that they aren’t both
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
									//  A is a direct match and B
									//    isn’t.
									return 1
								} else if (
									splitLevelB[0] == sigil
								) {
									//  B is a direct match and A
									//    isn’t.
									return -1
								} else if (
									splitLevelA.find(
										$ => $ != "/"
									) == sigil
								) {
									//  A is an ancestor match and B
									//    isn’t.
									//  Note that A and B can’t both be
									//    ancestor matches at the same
									//    time (because of the do‐while
									//    above).
									return 1
								} else if (
									splitLevelB.find(
										$ => $ != "/"
									) == sigil
								) {
									//  B is an ancestor match and A
									//    isn’t.
									//  Note that A and B can’t both be
									//    ancestor matches at the same
									//    time (because of the do‐while
									//    above).
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
								//  A is a direct descendant and B
								//    isn’t.
								return 1
							} else if (
								levelA[0] != ">"
									&& levelB[0] == ">"
							) {
								//  B is a direct descendant and B
								//    isn’t.
								return -1
							} else {
								//  A and B both change levels in the
								//    same fashion.
								continue
							}
						}
						return (
							//  Fallback; when A and B are equivalent,
							//    sort by index.
							//  This isn’t strictly necessary; it is
							//    the default behaviour if `0` is
							//    returned (although not in previous
							//    versions of Ecmascript).
							indexA < indexB ? -1
								: indexA > indexB ? 1
								: 0
						)
					}
				).map(
					//  Map each entry to its value.
					//deno-lint-ignore no-unused-vars
					( [ index, [ key, value ] ] ) => value
				)
			if ( sortedMatchingDefinitions.length > 0 ) {
				//  There is a final result; clone it and add an
				//    appropriate `namespace` and `localName` based on
				//    its `qualifiedName` and the defined namespaces.
				const result = structuredClone(
					sortedMatchingDefinitions.pop()
				)
				//deno-lint-ignore no-unused-vars
				const [ qualifiedName, prefix, localName ] =
					/^(?:([^:]+):)?([^:]+)$/u.exec(
						result.qualifiedName
					)
				if ( !this.namespaces.has(prefix ?? null) ) {
					throw new NamespaceError (
						`No definition found for namespace prefix "${ prefix ?? "" }", referenced by sigil path "${ path }."`,
						{ line: options?.line }
					)
				} else {
					result.localName = localName
					result.namespace =
						this.namespaces.get(prefix ?? null)
				}
				return result
			} else {
				//  Resolution failed to produce a result.
				throw new TypeError (
					"The list of matching definitions was empty."
				)
			}
		} catch ( error ) {
			//  Resolution failed.
			throw error instanceof MarketCommonsⅠⅠError ? error
				: new SigilResolutionError (
					path, { line: options?.line, nodeType }
				)
		}
	}
	
}
