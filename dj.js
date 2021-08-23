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
import { marketNamespace, parsererrorNamespace } from "./names.js"
import { normalizeReferences, resolve } from "./paths.js"
import { CONTENT_MODEL, NODE_TYPE } from "./symbols.js"
import * as $ from "./syntax.js"
import { prepareAsX·M·L } from "./text.js"

/**
 *  A symbol used in options objects to provide a `Set` of document
 *    identifiers which the current declaration is referenced from.
 *  This is intentionally not exported; it should not be available to
 *    users.
 */
const nestedWithin = Symbol("")

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
		`(?<name>${ $.Name })${ $.Eq }(?<attValue>${ $.AttValue })`,
		"gu"
	)
	const result = new Map
	if ( attributesDeclaration != null ) {
		//  Iterate over each `Attribute` in `attributesDeclaration`
		//    and extract its Name and AttValue, then assign these in
		//    the result `Map`.
		let attribute = null
		while ( attribute = regExp.exec(attributesDeclaration) ) {
			const { name, attValue } = attribute.groups
			if ( result.has(name) ) {
				//  An attributes declaration must not declare
				//    the same attribute name twice [🆐A‐1].
				throw new ParseError (
					options?.index,
					`Attribute @${ name } declared twice.`
				)
			}
			result.set(
				name,
				//  Trim quotes.
				attValue.substring(1, attValue.length - 1)
			)
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
		const marketNodes = document[marketNamespace] = {
			preamble: null,
			content: null,
		}
		if ( root.localName == "parsererror"
				&& root.namespaceURI == parsererrorNamespace ) {
			//  The document template must be a welformed X·M·L
			//    document [🆐D‐1].
			throw new ParseError (
				index,
				`Document template not welformed: ${ root.textContent }`
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
						index,
						`Document template contains multiple ${ name } elements in the "${ marketNamespace }" namespace.`
					)
				} else if ( node.childNodes.length != 0 ) {
					//  The element is not empty [🆐D‐2].
					throw new ParseError (
						index,
						`Document template contains nonempty ${ name } element in the "${ marketNamespace }" namespace.`
					)
				} else if ( !marketNodes.hasOwnProperty(name) ) {
					//  The element is not recognized [🆐D‐3].
					throw new ParseError (
						index,
						`Document template contains unrecognized ${ name } element in the "${ marketNamespace }" namespace.`
					)
				} else {
					//  The element is recognized and has not been
					//    encountered before.
					marketNodes[name] = node
				}
			}
			for ( const name of [ "preamble", "content" ] ) {
				if ( marketNodes[name] == null ) {
					//  Both `<preamble>` and `<content>` are required
					//    [🆐D‐2].
					throw new ParseError (
						index,
						`Document template lacks a ${ name } element in the "${ marketNamespace }" namespace.`
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
		const path = normalizeReferences(sectionPath)
		const sigil = path.substring(path.lastIndexOf("/") + 1)
		return {
			jargon: {
				nodeType: NODE_TYPE.SECTION,
				contentModel:
					sectionTextTo != null ? CONTENT_MODEL.TEXT
						: CONTENT_MODEL.MIXED,
				sigil,
				path,
				qualifiedName: sectionName,
				attributes:
					parseAttributes(sectionAttributes, { index }),
				countTo: sectionCountTo != null ? new Set (
					sectionCountTo.split($.S)
				) : null,
				textTo: sectionTextTo != null ? new Set (
					sectionTextTo.split($.S)
				) : null,
				heading: sectionHeadingName != null ? {
					nodeType: NODE_TYPE.HEADING,
					contentModel: CONTENT_MODEL.MIXED,
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
					qualifiedName: sectionHeadingName,
					attributes: parseAttributes(
						sectionHeadingAttributes, { index }
					),
					countTo: sectionHeadingCountTo != null ? new Set (
						sectionHeadingCountTo.split($.S)
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
				contentModel: CONTENT_MODEL.MIXED,
				sigil: normalizeReferences(headingSigil),
				path: normalizeReferences(
					[
						headingSectionPath ?? "*",
						headingSectionStrict ?? " ",
						headingSigil,
					].join("")
				),
				qualifiedName: headingName,
				attributes:
					parseAttributes(headingAttributes, { index }),
				countTo: headingCountTo != null ? new Set (
					headingCountTo.split($.S)
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
				contentModel: blockFinal != null ? CONTENT_MODEL.TEXT
					: blockSpecial != null
						? CONTENT_MODEL[blockSpecial]
					: CONTENT_MODEL.MIXED,
				sigil: normalizeReferences(
					blockSigil ?? blockPath.substring(
						blockPath.lastIndexOf("/") + 1
					)
				),
				path: normalizeReferences(
					[
						blockSectionPath ?? "*",
						blockSectionStrict ?? " ",
						blockPath ?? blockSigil,
					].join("")
				),
				qualifiedName: blockName ?? null,
				attributes:
					parseAttributes(blockAttributes, { index }),
				isDefault: blockSigil != null,
				inList: blockListName != null ? {
					nodeType: NODE_TYPE.BLOCK,
					contentModel: CONTENT_MODEL.MIXED,
					sigil: null,
					path: null,
					qualifiedName: blockListName,
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
					: CONTENT_MODEL.MIXED,
				sigil: normalizeReferences(
					inlinePath.substring(
						inlinePath.lastIndexOf("/") + 1
					)
				),
				path: normalizeReferences(
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
				qualifiedName: inlineName ?? null,
				attributes:
					parseAttributes(inlineAttributes, { index }),
				textFrom: inlineTextFrom ?? null,
				textTo: inlineTextTo != null ? new Set (
					inlineTextTo.split($.S)
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
		const path = normalizeReferences(
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
			jargon: attributeNames.split($.S).map(qualifiedName => ({
				nodeType: NODE_TYPE.ATTRIBUTE,
				contentModel: CONTENT_MODEL.TEXT,
				sigil: normalizeReferences(attributeSigil),
				path,
				qualifiedName,
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
	let jargon = {
		[NODE_TYPE.DOCUMENT]: null,      //  `XMLDocument`
		[NODE_TYPE.SECTION]: new Map,    //  [sigil:[path:section]]
		[NODE_TYPE.HEADING]: new Map,    //  [sigil:[path:heading]]
		[NODE_TYPE.BLOCK]: new Map,      //  [sigil:[path:block]]
		[NODE_TYPE.INLINE]: new Map,     //  [sigil:[path:inline]]
		[NODE_TYPE.ATTRIBUTE]: new Map,  //  [sigil:[path:{attribute}]]
	}
	jargon[NODE_TYPE.BLOCK].defaults = new Map

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
			0,
			"Declaration of Jargon does not match expected grammar."
		)
	} else {
		//  Process the parsed Declaration of Jargon.
		const quotedExternalName = parseResult.groups.externalName
			|| parseResult.groups.externalSubset
		const externalName = quotedExternalName != null
				? quotedExternalName.substring(
					1, quotedExternalName.length - 1
				)
			: null
		if ( options?.[nestedWithin]?.has(externalName) ?? false ) {
			//  There is a recursive external reference [🆐J‐2].
			throw new ParseError (
				0,
				`Recursive reference to "${ externalName }" in Declaration of Jargon.`
			)
		} else if ( externalName != null ) {
			//  (Attempt to) handle the referenced external Declaration
			//    of Jargon.
			let externalD·J
			switch ( false ) {
				//  Resolve the system identifier.
				case !(
					externalD·J = systemIdentifierMap.get(externalName)
				):
				case !(
					externalD·J = defaultSystemIdentifierMap
						.get(externalName)
				):
					if ( externalName != `${ marketNamespace }/html`
						&& externalD·J !=
							defaultSystemIdentifierMap.get(
								`${ marketNamespace }/html`
							) ) {
						//  D·J processing cannot yet detect all kinds
						//    of nonwelformed Declarations of Jargon.
						//  For now, only allow the default H·T·M·L
						//    D·J, which is known to be welformed.
						/*  TODO  */
						throw new ParseError (
							0,
							"Only the default H·T·M·L Declaration of Jargon is supported at this time."
						)
					}
					break
				default:
					//  (Attempt to) fetch the system identifier.
					/*  TODO  */
					throw new ParseError (
						0,
						"Fetching external Declarations of Jargon is not yet supported."
					)
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
					throw new ParseError (0, "Not welformed.")
				}
				jargon = externalResult.jargon
			} catch ( error ) {
				//  The external Declaration of Jargon does not match
				//    the `D·J` production [🆐J‐2].
				throw new ParseError (
					0,
					`The external Declaration of Jargon "${ externalName }" is not welformed.`
				)
			}
		}
		const internalDeclarations =
			parseResult.groups.internalDeclarations
		if ( internalDeclarations ) {
			if ( !(
				options?.[nestedWithin]?.has(
					`${ marketNamespace}/html`
				) && options[nestedWithin].size == 1
			) ) {
				//  D·J processing cannot yet detect all kinds of
				//    nonwelformed Declarations of Jargon.
				//  For now, only allow the default H·T·M·L D·J, which
				//    is known to be welformed.
				/*  TODO  */
				throw new ParseError (
					0,
					"Only the default H·T·M·L Declaration of Jargon is supported at this time."
				)
			}
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
						case !(result = processS(source, index)):
							//  Whitespace is ignored.
							break processingDeclaration
						case !(
							result = processDocument(
								source, index, DOMParser
							)
						):
							//  Overwrites any previous document
							//    declaration.
							jargon[NODE_TYPE.DOCUMENT] = result.jargon
							break processingDeclaration
						case !(result = processSection(source, index)):
							//  See below.
							{
								//  Ensure sigils in the path are
								//    properly declared.
								/*  TODO  */
							}
							break
						case !(result = processHeading(source, index)):
							//  See below.
							{
								//  Ensure sigils in the path are
								//    properly declared.
								/*  TODO  */
							}
							break
						case !(result = processBlock(source, index)):
							//  See below.
							{
								//  Ensure sigils in the path are
								//    properly declared.
								/*  TODO  */
							}
							const value = result.jargon
							if ( value.isDefault ) {
								//  This is a default block
								//    declaration.
								//  Record it in the defaults map!
								jargon[NODE_TYPE.BLOCK].defaults.set(
									value.path.substring(
										0, /[ >][^ >]*$/u.exec(
											value.path
										)?.index ?? undefined
									), value
								)
							}
							break
						case !(result = processInline(source, index)):
							//  See below.
							{
								//  Ensure sigils in the path are
								//    properly declared.
								/*  TODO  */
							}
							break
						case !(
							result = processAttribute(source, index)
						):
							//  This code is more complicated than the
							//    generic case because the same sigil
							//    can signify multiple attributes.
							if ( result.jargon.length == 0 ) {
								//  Ought to be unreachable;
								//    implies an attribute
								//    declaration which defines
								//    nothing.
								//  But, there’s no harm in
								//    ignoring such a case.
								break processingDeclaration
							} else {
								//  Ensure sigils in the path are
								//    properly declared.
								//  All jargons produced by a single
								//    attribute definition will have
								//    the same path.
								const path = result.jargon[0].path
								/*  TODO  */
							}
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
						case !(result = processComment(source, index)):
							//  Comments are ignored.
							break processingDeclaration
						default:
							//  Ought to be unreachable.
							throw new ParseError (
								index,
								"Unexpected syntax in Declaration of Jargon."
							)
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
