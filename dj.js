//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: dj.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Declaration of Jargon processing.
 *
 *  @module MarketCommons2/dj
 */

import { systemIdentifierMap as defaultSystemIdentifierMap }
	from "./defaults.js"
import { ConfigurationError, ParseError } from "./errors.js"
import Jargon from "./jargon.js"
import {
	marketNamespace,
	parsererrorNamespace,
	x·m·lNamespace,
	x·m·l·n·sNamespace,
} from "./names.js"
import { normalizeReferences } from "./paths.js"
import { CONTENT_MODEL, NODE_TYPE } from "./symbols.js"
import * as $ from "./syntax.js"
import { prepareAsX·M·L } from "./text.js"

/**
 *  A symbol used in options objects to provide a `Set` of document
 *    identifiers which the current declaration is referenced from.
 *  This is intentionally not exported; it should not be available to
 *    users.
 */
const nestedWithin = Symbol()

/**
 *  Throws an error if the provided `qualifiedName` is not welformed;
 *    otherwise, simply returns it.
 *
 *  @argument {string} qualifiedName
 *  @argument {{index:number}} options
 *  @returns {string}
 */
function welformedName ( qualifiedName, options ) {
	if ( new RegExp (
		`^${ $.NSAttName.source }$`, "u"
	).test(qualifiedName) ) {
		//  Names cannot match the `NSAttName` production [🆐A‐2]
		//    [🆐E‐2][🆐F‐2][🆐G‐3][🆐H‐4][🆐I‐4].
		throw new ParseError (
			`"${ qualifiedName }" cannot be used as a qualified name.`,
			{ index: options?.index }
		)
	} else {
		//  Simply return the name.
		return qualifiedName
	}
}

/**
 *  Throws an error if the provided `path` is not welformed; otherwise,
 *    returns the normalized form.
 *
 *  @argument {string} sigil
 *  @argument {{index:number}} options
 *  @returns {string}
 */
function welformedSigils ( path, options ) {
	const normalizedPath = normalizeReferences(path)
	for ( const charRef of normalizedPath.matchAll(
		new RegExp ($.CharRef.source, "g")
	) ) {
		if ( /^(?:&#32;|&#9;|&#10;|&#13;|&#124;)$/u.test(charRef) ) {
			//  A sigil may not contain a character indicating `S` or
			//    `'|'`.
			throw new ParseError (
				`Whitespace and "|" characters are not allowed in sigils.`,
				{ index: options?.index }
			)
		} else {
			continue
		}
	}
	return normalizedPath
}

/**
 *  Parses an attributes declaration into a `Map` of attribute names
 *    and values.
 *
 *  @argument {?string} attributesDeclaration
 *  @argument {{index:number}} options
 *  @returns {Map}
 */
function parseAttributes ( attributesDeclaration, options ) {
	const regExp = new RegExp (
		`(?<name>${ $.QName.source })${ $.Eq.source }(?<attValue>${ $.AttValue.source })`,
		"gu"
	)
	const result = new Map
	if ( attributesDeclaration != null ) {
		//  Iterate over each `Attribute` in `attributesDeclaration`
		//    and extract its Name and AttValue, then assign these in
		//    the result `Map`.
		let attribute = null
		while ( (attribute = regExp.exec(attributesDeclaration)) ) {
			const { name, attValue } = attribute.groups
			if ( result.has(name) ) {
				//  An attributes declaration must not declare
				//    the same attribute name twice [🆐A‐1].
				throw new ParseError (
					`Attribute @${ name } declared twice.`,
					{ index: options?.index }
				)
			} else {
				//  Set the attribute.
				result.set(
					welformedName(name, options),
					//  Trim quotes.
					attValue.substring(1, attValue.length - 1)
				)
			}
		}
	}
	return result
}

/**
 *  Extracts an `S` from `source` at `index`, and returns an object
 *    containing the `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{lastIndex:number}}
 */
function processS ( source, index ) {
	const regExp = new RegExp ($.S.source, "uy")
	regExp.lastIndex = index
	return regExp.test(source) ? { lastIndex: regExp.lastIndex } : null
}

/**
 *  Extracts a `NamespaceD·J` from `source` at `index`, and returns an
 *    object containing the `lastIndex`, `prefix`, and `literal` of
 *    the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{lastIndex:number}}
 */
function processNamespace ( source, index ) {
	const regExp = new RegExp ($.NamespaceD·J.source, "uy")
	regExp.lastIndex = index
	const parseResult = regExp.exec(source)
	if ( parseResult == null ) {
		//  There is not a namespace declaration at `index` in
		//    `source`.
		return null
	} else {
		//  Process the namespace declaration.
		const {
			namespacePrefix,
			namespaceLiteral,
		} = parseResult.groups
		const prefix = namespacePrefix ?? null
		const literal = namespaceLiteral.substring(
			1, namespaceLiteral.length - 1
		)
		if ( prefix == "xmlns" ) {
			//  `xmlns` is not usable as a prefix [🆐K‐1].
			throw new ParseError (
				`"${ prefix }" cannot be used as a namespace prefix.`,
				{ index }
			)
		} else if ( prefix == "xml" && literal != x·m·lNamespace ) {
			//  The prefix `xml` can only be assigned to the X·M·L
			//    namespace [🆐K‐2].
			throw new ParseError (
				`"${ prefix }" cannot be assigned to any namespace other than "${ x·m·lNamespace }".`,
				{ index }
			)
		} else if ( prefix != "xml" && literal == x·m·lNamespace ) {
			//  The X·M·L namespace can only be assigned to the prefix
			//    `xml` [🆐K‐3].
			throw new ParseError (
				`The namespace "${ literal }" can only be assigned to the prefix "xml".`,
				{ index }
			)
		} else if ( literal == x·m·l·n·sNamespace ) {
			//  The X·M·L·N·S namespace cannot be assigned [🆐K‐3].
			throw new ParseError (
				`The namespace "${ literal }" cannot be assigned.`,
				{ index }
			)
		} else {
			//  Return the processed prefix and literal.
			return {
				prefix,
				literal: literal == "" ? null : literal,
				lastIndex: regExp.lastIndex,
			}
		}
	}
}

/**
 *  Extracts a `DocumentD·J` from `source` at `index`, and returns an
 *    object containing the `document` template and the `lastIndex` of
 *    the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @argument {function} DOMParser
 *  @returns {?{document:Object,lastIndex:number}}
 */
function processDocument ( source, index, DOMParser ) {
	const regExp = new RegExp ($.DocumentD·J.source, "uy")
	regExp.lastIndex = index
	const parseResult = regExp.exec(source)
	if ( parseResult == null ) {
		//  There is not a document declaration at `index` in `source`.
		return null
	} else {
		//  Process the document declaration.
		const document = (new DOMParser).parseFromString(
			parseResult.groups.documentTemplate, "application/xml"
		)
		const root = document.documentElement
		const marketNodes = document[marketNamespace] = Object.create(
			null,
			{
				preamble: {
					configurable: true,
					enumerable: true,
					value: null,
					writable: false,
				},
				content: {
					configurable: true,
					enumerable: true,
					value: null,
					writable: false,
				},
			}
		)
		if ( root.localName == "parsererror"
				&& root.namespaceURI == parsererrorNamespace ) {
			//  The document template must be a welformed X·M·L
			//    document [🆐D‐1].
			throw new ParseError (
				`Document template not welformed: ${ root.textContent }`,
				{ index }
			)
		} else {
			//  Walk the X·M·L tree and process elements in the
			//    <tag:go.KIBI.family,2021:market> namespace.
			const walker = document.createTreeWalker(
				document,
				0x1,  //  NodeFilter.SHOW_ELEMENT
				{ acceptNode: node =>
					node.namespaceURI == marketNamespace
						? 1  //  NodeFilter.FILTER_ACCEPT
						: 3  //  NodeFilter.FILTER_SKIP
				}
			)
			while ( walker.nextNode() ) {
				//  Process the element.
				const node = walker.currentNode
				const name = node.localName
				if ( marketNodes[name] != null ) {
					//  An element with this name has already been
					//    processed [🆐D‐2].
					throw new ParseError (
						`Document template contains multiple ${ name } elements in the "${ marketNamespace }" namespace.`,
						{ index }
					)
				} else if ( node.childNodes.length != 0 ) {
					//  The element is not empty [🆐D‐2].
					throw new ParseError (
						`Document template contains nonempty ${ name } element in the "${ marketNamespace }" namespace.`,
						{ index }
					)
				} else if ( !(name in marketNodes) ) {
					//  The element is not recognized [🆐D‐3].
					throw new ParseError (
						`Document template contains unrecognized ${ name } element in the "${ marketNamespace }" namespace.`,
						{ index }
					)
				} else {
					//  The element is recognized and has not been
					//    encountered before.
					Object.defineProperty(
						marketNodes, name, { value: node }
					)
				}
			}
			for ( const name of [ "preamble", "content" ] ) {
				if ( marketNodes[name] == null ) {
					//  Both `<preamble>` and `<content>` are required
					//    [🆐D‐2].
					throw new ParseError (
						`Document template lacks a ${ name } element in the "${ marketNamespace }" namespace.`,
						{ index }
					)
				}
			}
		}
		return {
			jargon: {
				nodeType: NODE_TYPE.DOCUMENT,
				contentModel: CONTENT_MODEL.MIXED,
				template: document,
			},
			lastIndex: regExp.lastIndex
		}
	}
}

/**
 *  Extracts a `SectionD·J` from `source` at `index`, and returns an
 *    object containing the section `jargon` and the `lastIndex` of the
 *    match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Object,lastIndex:number}}
 */
function processSection ( source, index ) {
	const regExp = new RegExp ($.SectionD·J.source, "uy")
	regExp.lastIndex = index
	const parseResult = regExp.exec(source)
	if ( parseResult == null ) {
		//  There is not a section declaration at `index` in `source`.
		return null
	} else {
		//  Process the section declaration.
		const {
			sectionAttributes,
			sectionHeadingAttributes,
			sectionHeadingCountTo,
			sectionHeadingName,
			sectionName,
			sectionPath,
			sectionCountTo,
			sectionTextTo,
		} = parseResult.groups
		const path = welformedSigils(sectionPath)
		const sigil = path.substring(path.lastIndexOf("/") + 1)
		return {
			jargon: {
				nodeType: NODE_TYPE.SECTION,
				contentModel:
					sectionTextTo != null ? CONTENT_MODEL.TEXT
						: CONTENT_MODEL.MIXED,
				sigil,
				path,
				qualifiedName: welformedName(sectionName, { index }),
				attributes:
					parseAttributes(sectionAttributes, { index }),
				countTo: sectionCountTo != null ? new Set (
					sectionCountTo.split($.S).map(
						name => welformedName(name, { index })
					)
				) : null,
				textTo: sectionTextTo != null ? new Set (
					sectionTextTo.split($.S).map(
						name => welformedName(name, { index })
					)
				) : null,
				heading: sectionHeadingName != null ? {
					nodeType: NODE_TYPE.HEADING,
					contentModel: CONTENT_MODEL.INLINE,
					sigil,
					path: path.replace(
						new RegExp (
							`//(${ $.SigilD·J.source })$`, "u"
						), " $1"
					).replace(
						new RegExp (`/(${ $.SigilD·J.source })$`, "u"),
						">$1"
					).replace(
						new RegExp (`^(${ $.SigilD·J.source })$`, "u"),
						"* $1"
					),
					qualifiedName:
						welformedName(sectionHeadingName, { index }),
					attributes: parseAttributes(
						sectionHeadingAttributes, { index }
					),
					countTo: sectionHeadingCountTo != null ? new Set (
						sectionHeadingCountTo.split($.S).map(
							name => welformedName(name, { index })
						)
					) : null,
				} : null,
			},
			lastIndex: regExp.lastIndex,
		}
	}
}

/**
 *  Extracts a `HeadingD·J` from `source` at `index`, and returns an
 *    object containing the heading `jargon` and the `lastIndex` of the
 *    match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Object,lastIndex:number}}
 */
function processHeading ( source, index ) {
	const regExp = new RegExp ($.HeadingD·J.source, "uy")
	regExp.lastIndex = index
	const parseResult = regExp.exec(source)
	if ( parseResult == null ) {
		//  There is not a heading declaration at `index` in `source`.
		return null
	} else {
		//  Process the heading declaration.
		const {
			headingAttributes,
			headingCountTo,
			headingName,
			headingSectionPath,
			headingSectionStrict,
			headingSigil,
		} = parseResult.groups
		return {
			jargon: {
				nodeType: NODE_TYPE.HEADING,
				contentModel: CONTENT_MODEL.INLINE,
				sigil: welformedSigils(headingSigil),
				path: welformedSigils(
					[
						headingSectionPath ?? "*",
						headingSectionStrict ?? " ",
						headingSigil,
					].join("")
				),
				qualifiedName: welformedName(headingName, { index }),
				attributes:
					parseAttributes(headingAttributes, { index }),
				countTo: headingCountTo != null ? new Set (
					headingCountTo.split($.S).map(
						name => welformedName(name, { index })
					)
				) : null,
			},
			lastIndex: regExp.lastIndex,
		}
	}
}

/**
 *  Extracts a `BlockD·J` from `source` at `index`, and returns an
 *    object containing the block `jargon` and the `lastIndex` of the
 *    match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Object,lastIndex:number}}
 */
function processBlock ( source, index ) {
	const regExp = new RegExp ($.BlockD·J.source, "uy")
	regExp.lastIndex = index
	const parseResult = regExp.exec(source)
	if ( parseResult == null ) {
		//  There is not a block declaration at `index` in `source`.
		return null
	} else {
		//  Process the block declaration.
		const {
			blockAttributes,
			blockFinal,
			blockListAttributes,
			blockListName,
			blockName,
			blockPath,
			blockSectionPath,
			blockSectionStrict,
			blockSigil,
			blockSpecial,
		} = parseResult.groups
		return {
			jargon: {
				nodeType: NODE_TYPE.BLOCK,
				contentModel: blockFinal != null ? CONTENT_MODEL.INLINE
					: blockSpecial != null
						? CONTENT_MODEL[blockSpecial]
					: CONTENT_MODEL.MIXED,
				sigil: welformedSigils(
					blockSigil ?? blockPath.substring(
						blockPath.lastIndexOf("/") + 1
					)
				),
				path: welformedSigils(
					[
						blockSectionPath ?? "*",
						blockSectionStrict ?? " ",
						blockPath ?? blockSigil,
					].join("")
				),
				qualifiedName: blockName != null
						? welformedName(blockName, { index })
					: null,
				attributes:
					parseAttributes(blockAttributes, { index }),
				isDefault: blockSigil != null,
				inList: blockListName != null ? {
					nodeType: NODE_TYPE.BLOCK,
					contentModel: CONTENT_MODEL.MIXED,
					sigil: null,
					path: null,
					qualifiedName:
						welformedName(blockListName, { index }),
					attributes: parseAttributes(
						blockListAttributes, { index }
					),
				} : null,
			},
			lastIndex: regExp.lastIndex,
		}
	}
}

/**
 *  Extracts an `InlineD·J` from `source` at `index`, and returns an
 *    object containing the inline `jargon` and the `lastIndex` of the
 *    match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Object,lastIndex:number}}
 */
function processInline ( source, index ) {
	const regExp = new RegExp ($.InlineD·J.source, "uy")
	regExp.lastIndex = index
	const parseResult = regExp.exec(source)
	if ( parseResult == null ) {
		//  There is not an inline declaration at `index` in `source`.
		return null
	} else {
		//  Process the inline declaration.
		const {
			inlineAttributes,
			inlineBlockAny,
			inlineBlockPath,
			inlineBlockStrict,
			inlineFinal,
			inlineName,
			inlinePath,
			inlineSectionOrBlockPath,
			inlineSectionOrBlockStrict,
			inlineSpecial,
			inlineTextFrom,
			inlineTextTo,
		} = parseResult.groups
		const sectionDefined =
			inlineBlockPath != null || inlineBlockAny != null
		return {
			jargon: {
				nodeType: NODE_TYPE.INLINE,
				contentModel: inlineFinal != null || inlineTextTo
						? CONTENT_MODEL.TEXT
					: inlineSpecial != null
						? CONTENT_MODEL[inlineSpecial]
					: CONTENT_MODEL.INLINE,
				sigil: welformedSigils(
					inlinePath.substring(
						inlinePath.lastIndexOf("/") + 1
					)
				),
				path: welformedSigils(
					[
						sectionDefined
								? inlineSectionOrBlockPath ?? "*"
							: "*",
						sectionDefined
								? inlineSectionOrBlockStrict ?? " "
							: " ",
						sectionDefined ? inlineBlockPath ?? "*"
							: inlineSectionOrBlockPath ?? "*",
						sectionDefined ? inlineBlockStrict ?? " "
							: inlineSectionOrBlockStrict ?? " ",
						inlinePath,
					].join("")
				),
				qualifiedName: inlineName != null
						? welformedName(inlineName, { index })
					: null,
				attributes:
					parseAttributes(inlineAttributes, { index }),
				textFrom: inlineTextFrom != null
						? welformedName(inlineTextFrom, { index })
					: null,
				textTo: inlineTextTo != null ? new Set (
					inlineTextTo.split($.S).map(
						name => welformedName(name, { index })
					)
				) : null,
			},
			lastIndex: regExp.lastIndex,
		}
	}
}

/**
 *  Extracts an `AttributeD·J` from `source` at `index`, and returns an
 *    object containing the attribute `jargon` and the `lastIndex` of
 *    the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Object,lastIndex:number}}
 */
function processAttribute ( source, index ) {
	const regExp = new RegExp ($.AttributeD·J.source, "uy")
	regExp.lastIndex = index
	const parseResult = regExp.exec(source)
	if ( parseResult == null ) {
		//  There is not an attribute declaration at `index` in
		//    `source`.
		return null
	} else {
		//  Process the attribute declaration.
		const {
			attributeBlockOrInlineAny,
			attributeBlockOrInlinePath,
			attributeBlockOrInlineStrict,
			attributeInlineAny,
			attributeInlinePath,
			attributeInlineStrict,
			attributeNames,
			attributeSectionOrBlockOrInlinePath,
			attributeSectionOrBlockOrInlineStrict,
			attributeSigil,
		} = parseResult.groups
		const sectionDefined =
			//  Implies other paths are also defined.
			attributeInlinePath != null || attributeInlineAny != null
		const blockDefined = attributeBlockOrInlinePath != null
				|| attributeBlockOrInlineAny != null
		const path = welformedSigils(
			[
				sectionDefined
						? attributeSectionOrBlockOrInlinePath ?? "*"
					: "*",
				sectionDefined
						? attributeSectionOrBlockOrInlineStrict ?? " "
					: " ",
				blockDefined
						? sectionDefined
							? attributeBlockOrInlinePath ?? "*"
						: attributeSectionOrBlockOrInlinePath ?? "*"
					: "*",
				blockDefined
						? sectionDefined
							? attributeBlockOrInlineStrict ?? " "
						: attributeSectionOrBlockOrInlineStrict ?? " "
					: " ",
				blockDefined
						? sectionDefined
							? attributeInlinePath ?? "*"
						: attributeBlockOrInlinePath ?? "*"
					: attributeSectionOrBlockOrInlinePath ?? "*",
				blockDefined
						? sectionDefined
							? attributeInlineStrict ?? " "
						: attributeBlockOrInlineStrict ?? " "
					: attributeSectionOrBlockOrInlineStrict ?? " ",
				attributeSigil,
			].join("")
		)
		return {
			jargon: attributeNames.split($.S).map(name => ({
				nodeType: NODE_TYPE.ATTRIBUTE,
				contentModel: CONTENT_MODEL.TEXT,
				sigil: welformedSigils(attributeSigil),
				path,
				qualifiedName: welformedName(name, { index }),
			})),
			lastIndex: regExp.lastIndex,
		}
	}
}

/**
 *  Extracts a `Comment` from `source` at `index`, and returns an
 *    object containing the `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{lastIndex:number}}
 */
function processComment ( source, index ) {
	const regExp = new RegExp ($.Comment.source, "uy")
	regExp.lastIndex = index
	return regExp.test(source) ? { lastIndex: regExp.lastIndex } : null
}

/**
 *  Reads the Declaration of Jargon from the beginning of the provided
 *    `source` and processes it into the `jargon` property on the
 *    returned object.
 *  The `lastIndex` property gives the index of the end of the
 *    Declaration of Jargon in the `source` string.
 *
 *  If the source does not begin with the string `<?market-commons`,
 *    `jargon` will be `null` and `lastIndex` will be `0`.
 */
export function process ( source, options = {
	DOMParser: globalThis.DOMParser,
	systemIdentifiers: { }
} ) {
	
	//  Ensure source begins with a Declaration of Jargon.
	//  Otherwise, return early.
	if ( !source.startsWith("<?market-commons") )
		return { input: source, jargon: null, lastIndex: 0 }
	
	//  Set up data storage.
	let jargon = new Jargon
	
	//  Handle options.
	const DOMParser = options?.DOMParser ?? globalThis?.DOMParser
	if ( typeof DOMParser != "function" ) {
		throw new ConfigurationError (
			"No D·O·M Parser constructor supplied."
		)
	}
	const systemIdentifierMap = options instanceof Map ? options
		: new Map (Object.entries(options?.systemIdentifier ?? { }))
	
	//  Parse and process.
	const regExp = new RegExp ($.D·J.source, "duy")
	const parseResult = regExp.exec(source)
	if ( !parseResult ) {
		//  Declarations of Jargon must match the `D·J` production.
		throw new ParseError (
			"Declaration of Jargon does not match expected grammar.",
			{ index: 0 }
		)
	} else {
		//  Process the parsed Declaration of Jargon.
		const quotedExternalName = parseResult.groups.externalName
			?? parseResult.groups.externalSubset
		const externalName = quotedExternalName != null
				? quotedExternalName.substring(
					1, quotedExternalName.length - 1
				)
			: null
		const nameIndex = (parseResult.indices.groups.externalName ??
			parseResult.indices.groups.externalSubset)
		if ( options?.[nestedWithin]?.has(externalName) ?? false ) {
			//  There is a recursive external reference [🆐J‐2].
			throw new ParseError (
				`Recursive reference to "${ externalName }" in Declaration of Jargon.`,
				{ index: nameIndex }
			)
		} else if ( externalName != null ) {
			//  (Attempt to) handle the referenced external Declaration
			//    of Jargon.
			let externalD·J
			switch ( false ) {
				//  Resolve the system identifier.
				case !(
					externalD·J = systemIdentifierMap.get(externalName)
				): {
					break
				}
				case !(
					externalD·J = defaultSystemIdentifierMap
						.get(externalName)
				): {
					break
				}
				default: {
					//  (Attempt to) fetch the system identifier.
					/*  TODO  */
					throw new ParseError (
						"Fetching external Declarations of Jargon is not yet supported.",
						{ index: nameIndex }
					)
				}
			}
			try {
				//  Attempt to process the external Declaration of
				//    Jargon and replace `jargon` with that of the
				//    result.
				externalD·J = prepareAsX·M·L(externalD·J)
				const externalResult = process(externalD·J, {
					...options,
					[nestedWithin]: new Set (
						options?.[nestedWithin] ?? []
					).add(externalName)
				})
				if ( externalResult == null
					|| externalResult.lastIndex !=
						externalD·J.length ) {
					//  External Declarations of Jargon must consist of
					//    *only* and *exactly* one `D·J`.
					throw new ParseError (
						"Not welformed.", { index: 0 }
					)
				}
				jargon = externalResult.jargon
			} catch {
				//  The external Declaration of Jargon does not match
				//    the `D·J` production [🆐J‐2].
				throw new ParseError (
					`The external Declaration of Jargon "${ externalName }" is not welformed.`,
					{ index: nameIndex }
				)
			}
		}
		const internalDeclarations =
			parseResult.groups.internalDeclarations
		if ( internalDeclarations ) {
			//  Iterate over each internal declaration.
			let index =
				parseResult.indices.groups.internalDeclarations[0]
			const endIndex =
				parseResult.indices.groups.internalDeclarations[1]
			while ( index < endIndex ) {
				//  Process the internal declaration and advance the
				//    index to the next.
				let result = null
				processingDeclaration: {
					//  This block is used to generalize common code
					//    for processing most types of declarations.
					//  In the following `switch` statement,
					//    `break processingDeclaration` signifies that
					//    no additional processing is needed.
					switch ( false ) {
						//  Identify the type of declaration and
						//    process it into `result`.
						//  This switch is exhaustive; one of these
						//    cases must match.
						case !(result = processS(source, index)): {
							//  Whitespace is ignored.
							break processingDeclaration
						}
						case !(
							result = processNamespace(source, index)
						): {
							const { prefix, literal } = result
							jargon.namespaces.set(prefix, literal)
							break processingDeclaration
						}
						case !(
							result = processDocument(
								source, index, DOMParser
							)
						): {
							//  Overwrites any previous document
							//    declaration.
							Object.defineProperty(
								jargon, NODE_TYPE.DOCUMENT, {
									value: result.jargon,
								}
							)
							break processingDeclaration
						}
						case !(
							result = processSection(source, index)
						): {
							//  See below.
							break
						}
						case !(
							result = processHeading(source, index)
						): {
							//  See below.
							break
						}
						case !(result = processBlock(source, index)): {
							//  See below.
							const value = result.jargon
							if ( value.isDefault ) {
								//  This is a default block
								//    declaration.
								//  Record it in the defaults map!
								jargon[NODE_TYPE.BLOCK]
									.get("#DEFAULT")
									.set(
										value.path.substring(
											0, /[ >][^ >]*$/u.exec(
												value.path
											)?.index ?? undefined
										) + ">#DEFAULT", value
									)
							}
							break
						}
						case !(
							result = processInline(source, index)
						): {
							//  See below.
							break
						}
						case !(
							result = processAttribute(source, index)
						): {
							//  This code is more complicated than the
							//    generic case because the same sigil
							//    can signify multiple attributes.
							for ( const value of result.jargon ) {
								const { nodeType, path, sigil } = value
								const jargons = jargon[nodeType]
								if ( jargons.has(sigil) ) {
									//  There is already an attribute
									//    with this `sigil`; add
									//    `value` to the appropriate
									//    `Set` in the existing `Map`.
									const attributeMap = 
										jargons.get(sigil)
									if ( attributeMap.has(path) ) {
										attributeMap
											.get(path)
											.add(value)
									} else {
										attributeMap.set(
											path,
											new Set ([ value ])
										)
									}
								} else {
									//  Create a new `Map` for this
									//    `sigil` and add `value` to
									//    it.
									jargons.set(
										sigil,
										new Map ([ [
											path,
											new Set ([ value ])
										] ])
									)
								}
							}
							break processingDeclaration
						}
						case !(
							result = processComment(source, index)
						): {
							//  Comments are ignored.
							break processingDeclaration
						}
						default: {
							//  Ought to be unreachable.
							throw new ParseError (
								"Unexpected syntax in Declaration of Jargon.",
								{ index }
							)
						}
					}
					const value = result.jargon
					const { nodeType, path, sigil } = value
					const jargons = jargon[nodeType]
					if ( jargons.has(sigil) ) {
						//  There is already a declaration with this
						//    `sigil`; add `value` to the existing
						//    `Map`.
						jargons.get(sigil).set(path, value)
					} else {
						//  Create a new `Map` for this `sigil` and add
						//    `value` to it.
						jargons.set(
							sigil,
							new Map ([ [ path, value ] ])
						)
					}
				}
				index = result.lastIndex
			}
		}
	}
	
	//  Return.
	return { input: source, jargon, lastIndex: regExp.lastIndex }
	
}
