//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: dj.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla
//    Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can
//    obtain one at <https://mozilla.org/MPL/2.0/>.
//
//  ___________________________________________________________________
//
//  This module provides Declaration of Jargon processing.

import { systemIdentifiers as defaultSystemIdentifiers } from "./defaults.js";
import {
  ConfigurationError,
  MarketCommonsⅠⅠError,
  NamespaceError,
  ParseError,
  SigilResolutionError,
} from "./errors.js";
import {
  marketNamespace,
  parsererrorNamespace,
  x·m·lNamespace,
  x·m·l·n·sNamespace,
} from "./names.js";
import {
  globRegExp,
  normalizeReferences,
  welformedPath,
} from "./paths.js";
import { CONTENT_MODEL, NODE_TYPE } from "./symbols.js";
import {
  AttributeD·J,
  AttValue,
  BlockD·J,
  CharRef,
  Comment,
  DocumentD·J,
  D·J,
  Eq,
  HeadingD·J,
  InlineD·J,
  NamespaceD·J,
  QName,
  S,
  SectionD·J,
  SigilD·J,
} from "./syntax.js";
import { Line, prepareAsX·M·L, welformedName } from "./text.js";

/**
 *  A document jargon.
 *
 *  @typedef {Object} DocumentJargon
 *  @property {typeof NODE_TYPE.DOCUMENT} nodeType
 *  @property {typeof CONTENT_MODEL.MIXED} contentModel
 *  @property {XMLDocument} template
 */

/**
 *  A generic division jargon.
 *
 *  @typedef {Object} DivisionJargon
 *  @property {typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK|typeof NODE_TYPE.INLINE} nodeType
 *  @property {typeof CONTENT_MODEL.MIXED|typeof CONTENT_MODEL.TRANSPARENT|typeof CONTENT_MODEL.INLINE|typeof CONTENT_MODEL.TEXT|typeof CONTENT_MODEL.COMMENT|typeof CONTENT_MODEL.LITERAL} contentModel
 *  @property {?string} sigil
 *  @property {?string} path
 *  @property {string} qualifiedName
 *  @property {Readonly<{[index:string]:string}>} attributes
 */

/**
 *  A section jargon.
 *
 *  @typedef {Object} SectionJargon
 *  @property {typeof NODE_TYPE.SECTION} nodeType
 *  @property {typeof CONTENT_MODEL.TEXT|typeof CONTENT_MODEL.MIXED} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {string} qualifiedName
 *  @property {Readonly<{[index:string]:string}>} attributes
 *  @property {?Readonly<string[]>} countTo
 *  @property {?Readonly<string[]>} textTo
 *  @property {?HeadingJargon} heading
 */

/**
 *  A heading jargon.
 *
 *  @typedef {Object} HeadingJargon
 *  @property {typeof NODE_TYPE.HEADING} nodeType
 *  @property {typeof CONTENT_MODEL.INLINE} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {string} qualifiedName
 *  @property {Readonly<{[index:string]:string}>} attributes
 *  @property {?Readonly<string[]>} countTo
 */

/**
 *  A block jargon.
 *
 *  @typedef {Object} BlockJargon
 *  @property {typeof NODE_TYPE.BLOCK} nodeType
 *  @property {typeof CONTENT_MODEL.INLINE|typeof CONTENT_MODEL.MIXED|typeof CONTENT_MODEL.COMMENT|typeof CONTENT_MODEL.LITERAL} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {string} qualifiedName
 *  @property {Readonly<{[index:string]:string}>} attributes
 *  @property {boolean} isDefault
 *  @property {?Readonly<DivisionJargon>} inList
 */

/**
 *  An inline jargon.
 *
 *  @typedef {Object} InlineJargon
 *  @property {typeof NODE_TYPE.INLINE} nodeType
 *  @property {typeof CONTENT_MODEL.INLINE|typeof CONTENT_MODEL.TEXT|typeof CONTENT_MODEL.COMMENT|typeof CONTENT_MODEL.LITERAL} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {string} qualifiedName
 *  @property {Readonly<{[index:string]:string}>} attributes
 *  @property {?string} textFrom
 *  @property {?Readonly<string[]>} textTo
 */

/**
 *  An attribute jargon.
 *
 *  @typedef {Object} AttributeJargon
 *  @property {typeof NODE_TYPE.ATTRIBUTE} nodeType
 *  @property {typeof CONTENT_MODEL.TEXT} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {string} qualifiedName
 */

/**
 *  A chunk.
 *
 *  @typedef {Object} Chunk
 *  @property {Jargon} jargon
 *  @property {typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK} nodeType
 *  @property {string} path
 *  @property {string} sigil
 *  @property {number} count
 *  @property {number} level
 *  @property {Readonly<Line[]>} lines
 */

/**
 *  A symbol used in options objects to provide a `Set` of document
 *    identifiers which the current declaration is referenced from.
 *  This is intentionally not exported; it should not be available to
 *    users.
 */
const nestedWithin = Symbol();

/**
 *  Parses an attributes declaration into an object associating
 *    attribute names with values.
 *
 *  @argument {?string} attributesDeclaration
 *  @argument {{index?:number}} [options]
 *  @returns {Readonly<{[index:string]:string}>}
 */
function parseAttributes(attributesDeclaration, options = {}) {
  const regExp = new RegExp(
    `(?<name>${QName.source})${Eq.source}(?<attValue>${AttValue.source})`,
    "gu",
  );
  const result = Object.create(null);
  if (attributesDeclaration != null) {
    //  Iterate over each `Attribute` in `attributesDeclaration`
    //    and extract its Name and AttValue, then assign these in
    //    the result object.
    let attribute = null;
    while ((attribute = regExp.exec(attributesDeclaration))) {
      const { name, attValue } =
        /** @type {{name:string,attValue:string}} */ (
          attribute.groups
        );
      if (name in result) {
        //  An attributes declaration must not declare
        //    the same attribute name twice [🆐A‐1].
        throw new ParseError(
          `Attribute @${name} declared twice.`,
          { index: options?.index },
        );
      } else {
        //  Set the attribute.
        result[welformedName(name, options)] = attValue.substring(
          1,
          attValue.length - 1,
        );
      }
    }
  }
  return Object.freeze(result);
}

/**
 *  Extracts an `S` from `source` at `index`, and returns an object
 *    containing the `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{lastIndex:number}}
 */
function processS(source, index) {
  const regExp = new RegExp(S.source, "uy");
  regExp.lastIndex = index;
  return regExp.test(source) ? { lastIndex: regExp.lastIndex } : null;
}

/**
 *  Extracts a `NamespaceD·J` from `source` at `index`, and
 *    returns an object containing the `lastIndex`, `prefix`,
 *    and `literal` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{prefix:string,literal:string,lastIndex:number}}
 */
function processNamespace(source, index) {
  const regExp = new RegExp(NamespaceD·J.source, "uy");
  regExp.lastIndex = index;
  const parseResult = regExp.exec(source);
  if (parseResult == null) {
    //  There is not a namespace declaration at `index` in
    //    `source`.
    return null;
  } else {
    //  Process the namespace declaration.
    const {
      namespacePrefix,
      namespaceLiteral,
    } =
      /** @type {{namespaceLiteral:string,[index:string]:string|undefined}} */ (
        parseResult.groups
      );
    const prefix = namespacePrefix ?? "";
    const literal = namespaceLiteral.substring(
      1,
      namespaceLiteral.length - 1,
    );
    if (prefix == "xmlns") {
      //  `xmlns` is not usable as a prefix [🆐K‐1].
      throw new ParseError(
        `"${prefix}" cannot be used as a namespace prefix.`,
        { index },
      );
    } else if (prefix == "xml" && literal != x·m·lNamespace) {
      //  The prefix `xml` can only be assigned to the X·M·L
      //    namespace [🆐K‐2].
      throw new ParseError(
        `"${prefix}" cannot be assigned to any namespace other than "${x·m·lNamespace}".`,
        { index },
      );
    } else if (prefix != "xml" && literal == x·m·lNamespace) {
      //  The X·M·L namespace can only be assigned to the prefix
      //    `xml` [🆐K‐3].
      throw new ParseError(
        `The namespace "${literal}" can only be assigned to the prefix "xml".`,
        { index },
      );
    } else if (literal == x·m·l·n·sNamespace) {
      //  The X·M·L·N·S namespace cannot be assigned [🆐K‐3].
      throw new ParseError(
        `The namespace "${literal}" cannot be assigned.`,
        { index },
      );
    } else {
      //  Return the processed prefix and literal.
      return {
        prefix,
        literal,
        lastIndex: regExp.lastIndex,
      };
    }
  }
}

/**
 *  Extracts a `DocumentD·J` from `source` at `index`, and
 *    returns an object containing the document `jargon` and
 *    the `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @argument {typeof globalThis.DOMParser} DOMParser
 *  @returns {?{jargon:Readonly<DocumentJargon>,lastIndex:number}}
 */
function processDocument(source, index, DOMParser) {
  const regExp = new RegExp(DocumentD·J.source, "uy");
  regExp.lastIndex = index;
  const parseResult = regExp.exec(source);
  if (parseResult == null) {
    //  There is not a document declaration at `index` in `source`.
    return null;
  } else {
    //  Process the document declaration.
    const document = (new DOMParser()).parseFromString(
      //@ts-ignore: Object definitely is defined.
      parseResult.groups.documentTemplate,
      "application/xml",
    );
    const root = document.documentElement;
    //@ts-ignore: Intentional extension of document.
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
      },
    );
    if (
      root.localName == "parsererror" &&
      root.namespaceURI == parsererrorNamespace
    ) {
      //  The document template must be a welformed X·M·L
      //    document [🆐D‐1].
      throw new ParseError(
        `Document template not welformed: ${root.textContent}`,
        { index },
      );
    } else {
      //  Walk the X·M·L tree and process elements in the
      //    <tag:go.KIBI.family,2021:market> namespace.
      const walker = document.createTreeWalker(
        document,
        0x1, //  NodeFilter.SHOW_ELEMENT
        {
          acceptNode: (/** @type {Element} */ node) =>
            node.namespaceURI == marketNamespace
              ? 1 //  NodeFilter.FILTER_ACCEPT
              : 3, //  NodeFilter.FILTER_SKIP
        },
      );
      while (walker.nextNode()) {
        //  Process the element.
        const node = /** @type {Element} */ (walker.currentNode);
        const name = node.localName;
        if (marketNodes[name] != null) {
          //  An element with this name has already been
          //    processed [🆐D‐2].
          throw new ParseError(
            `Document template contains multiple ${name} elements in the "${marketNamespace}" namespace.`,
            { index },
          );
        } else if (node.childNodes.length != 0) {
          //  The element is not empty [🆐D‐2].
          throw new ParseError(
            `Document template contains nonempty ${name} element in the "${marketNamespace}" namespace.`,
            { index },
          );
        } else if (!(name in marketNodes)) {
          //  The element is not recognized [🆐D‐3].
          throw new ParseError(
            `Document template contains unrecognized ${name} element in the "${marketNamespace}" namespace.`,
            { index },
          );
        } else {
          //  The element is recognized and has not been
          //    encountered before.
          Object.defineProperty(marketNodes, name, { value: node });
        }
      }
      for (const name of ["preamble", "content"]) {
        if (marketNodes[name] == null) {
          //  Both `<preamble>` and `<content>` are required
          //    [🆐D‐2].
          throw new ParseError(
            `Document template lacks a ${name} element in the "${marketNamespace}" namespace.`,
            { index },
          );
        }
      }
    }
    return {
      jargon: Object.freeze({
        nodeType: NODE_TYPE.DOCUMENT,
        contentModel: CONTENT_MODEL.MIXED,
        template: document,
      }),
      lastIndex: regExp.lastIndex,
    };
  }
}

/**
 *  Extracts a `SectionD·J` from `source` at `index`, and
 *    returns an object containing the section `jargon` and the
 *    `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Readonly<SectionJargon>,lastIndex:number}}
 */
function processSection(source, index) {
  const regExp = new RegExp(SectionD·J.source, "uy");
  regExp.lastIndex = index;
  const parseResult = regExp.exec(source);
  if (parseResult == null) {
    //  There is not a section declaration at `index` in
    //    `source`.
    return null;
  } else {
    //  Process the section declaration.
    const {
      sectionAttributes,
      sectionHeadingAttributes,
      sectionHeadingCountTo,
      sectionHeadingName,
      sectionName,
      sectionCountTo,
      sectionSigil,
      sectionTextTo,
    } =
      /** @type {{sectionSigil:string,sectionName:string,[index:string]:string|undefined}} */ (
        parseResult.groups
      );
    const sigil = welformedPath(sectionSigil);
    return {
      jargon: Object.freeze({
        nodeType: NODE_TYPE.SECTION,
        contentModel: sectionTextTo != null
          ? CONTENT_MODEL.TEXT
          : CONTENT_MODEL.MIXED,
        sigil,
        path: sigil,
        qualifiedName: welformedName(sectionName, { index }),
        attributes: parseAttributes(sectionAttributes ?? null, {
          index,
        }),
        countTo: sectionCountTo != null
          ? Object.freeze(
            sectionCountTo.split(S).map(
              (name) => welformedName(name, { index }),
            ),
          )
          : null,
        textTo: sectionTextTo != null
          ? Object.freeze(
            sectionTextTo.split(S).map(
              (name) => welformedName(name, { index }),
            ),
          )
          : null,
        heading: sectionHeadingName != null
          ? Object.freeze({
            nodeType: NODE_TYPE.HEADING,
            contentModel: CONTENT_MODEL.INLINE,
            sigil,
            path: `${sigil} ${sigil}`,
            qualifiedName: welformedName(
              sectionHeadingName,
              { index },
            ),
            attributes: parseAttributes(
              sectionHeadingAttributes ?? null,
              { index },
            ),
            countTo: sectionHeadingCountTo != null
              ? Object.freeze(
                sectionHeadingCountTo.split(S).map(
                  (name) => welformedName(name, { index }),
                ),
              )
              : null,
          })
          : null,
      }),
      lastIndex: regExp.lastIndex,
    };
  }
}

/**
 *  Extracts a `HeadingD·J` from `source` at `index`, and
 *    returns an object containing the heading `jargon` and the
 *    `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Readonly<HeadingJargon>,lastIndex:number}}
 */
function processHeading(source, index) {
  const regExp = new RegExp(HeadingD·J.source, "uy");
  regExp.lastIndex = index;
  const parseResult = regExp.exec(source);
  if (parseResult == null) {
    //  There is not a heading declaration at `index` in
    //    `source`.
    return null;
  } else {
    //  Process the heading declaration.
    const {
      headingAttributes,
      headingCountTo,
      headingName,
      headingSectionSigil,
      headingSectionStrict,
      headingSigil,
    } =
      /** @type {{headingSigil:string,headingName:string,[index:string]:string|undefined}} */ (
        parseResult.groups
      );
    const sigil = welformedPath(headingSigil);
    return {
      jargon: Object.freeze({
        nodeType: NODE_TYPE.HEADING,
        contentModel: CONTENT_MODEL.INLINE,
        sigil,
        path: [
          headingSectionSigil == null
            ? "*"
            : welformedPath(headingSectionSigil),
          headingSectionStrict ?? " ",
          sigil,
        ].join(""),
        qualifiedName: welformedName(headingName, { index }),
        attributes: parseAttributes(headingAttributes ?? null, {
          index,
        }),
        countTo: headingCountTo != null
          ? Object.freeze(
            headingCountTo.split(S).map(
              (name) => welformedName(name, { index }),
            ),
          )
          : null,
      }),
      lastIndex: regExp.lastIndex,
    };
  }
}

/**
 *  Extracts a `BlockD·J` from `source` at `index`, and returns
 *    an object containing the block `jargon` and the
 *    `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Readonly<BlockJargon>,lastIndex:number}}
 */
function processBlock(source, index) {
  const regExp = new RegExp(BlockD·J.source, "uy");
  regExp.lastIndex = index;
  const parseResult = regExp.exec(source);
  if (parseResult == null) {
    //  There is not a block declaration at `index` in `source`.
    return null;
  } else {
    //  Process the block declaration.
    const {
      blockAttributes,
      blockFinal,
      blockListAttributes,
      blockListName,
      blockName,
      blockPath,
      blockSectionSigil,
      blockSectionStrict,
      blockSigil,
      blockSpecial,
    } =
      /** @type {{blockSpecial:"COMMENT"|"LITERAL"|undefined,[index:string]:string|undefined}} */ (
        parseResult.groups
      );
    const definitelyExtantBlockPath = welformedPath(
      /** @type {string} */ (blockPath ?? blockSigil),
    );
    return {
      jargon: Object.freeze({
        nodeType: NODE_TYPE.BLOCK,
        contentModel: blockFinal != null
          ? CONTENT_MODEL.INLINE
          : blockSpecial != null
          ? CONTENT_MODEL[blockSpecial]
          : CONTENT_MODEL.MIXED,
        sigil: welformedPath(
          blockSigil ?? definitelyExtantBlockPath.substring(
            definitelyExtantBlockPath.lastIndexOf("/") + 1,
          ),
        ),
        path: [
          blockSectionSigil == null
            ? "*"
            : welformedPath(blockSectionSigil) ?? "*",
          blockSectionStrict ?? " ",
          definitelyExtantBlockPath,
        ].join(""),
        qualifiedName: blockName != null
          ? welformedName(blockName, { index })
          : "",
        attributes: parseAttributes(blockAttributes ?? null, {
          index,
        }),
        isDefault: blockSigil != null,
        inList: blockListName != null
          ? Object.freeze({
            /** @type {typeof NODE_TYPE.BLOCK} */
            nodeType: NODE_TYPE.BLOCK,
            /** @type {typeof CONTENT_MODEL.MIXED} */
            contentModel: CONTENT_MODEL.MIXED,
            sigil: null,
            path: null,
            qualifiedName: welformedName(blockListName, {
              index,
            }),
            attributes: parseAttributes(
              blockListAttributes ?? null,
              { index },
            ),
          })
          : null,
      }),
      lastIndex: regExp.lastIndex,
    };
  }
}

/**
 *  Extracts an `InlineD·J` from `source` at `index`, and
 *    returns an object containing the inline `jargon` and the
 *    `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{jargon:Readonly<InlineJargon>,lastIndex:number}}
 */
function processInline(source, index) {
  const regExp = new RegExp(InlineD·J.source, "uy");
  regExp.lastIndex = index;
  const parseResult = regExp.exec(source);
  if (parseResult == null) {
    //  There is not an inline declaration at `index` in
    //    `source`.
    return null;
  } else {
    //  Process the inline declaration.
    const {
      inlineAttributes,
      inlineBlockPath,
      inlineBlockStrict,
      inlineFinal,
      inlineName,
      inlinePath,
      //  /*  not needed  */ inlineSectionBlockAny,
      inlineSectionBlockPath,
      inlineSectionBlockStrict,
      inlineSectionSigil,
      inlineSectionStrict,
      inlineSpecial,
      inlineTextFrom,
      inlineTextTo,
    } =
      /** @type {{inlinePath:string,inlineSpecial:"COMMENT"|"LITERAL"|undefined,[index:string]:string|undefined}} */ (
        parseResult.groups
      );
    const possiblyBlockPath = inlineSectionBlockPath ??
      inlineBlockPath;
    return {
      jargon: Object.freeze({
        nodeType: NODE_TYPE.INLINE,
        contentModel: inlineFinal != null || inlineTextTo
          ? CONTENT_MODEL.TEXT
          : inlineSpecial != null
          ? CONTENT_MODEL[inlineSpecial]
          : CONTENT_MODEL.INLINE,
        sigil: welformedPath(
          inlinePath.substring(inlinePath.lastIndexOf("/") + 1),
        ),
        path: [
          inlineSectionSigil == null
            ? "*"
            : welformedPath(inlineSectionSigil),
          inlineSectionStrict ?? " ",
          possiblyBlockPath == null
            ? "*"
            : welformedPath(possiblyBlockPath),
          inlineSectionBlockStrict ?? inlineBlockStrict ?? " ",
          welformedPath(inlinePath),
        ].join(""),
        qualifiedName: inlineName != null
          ? welformedName(inlineName, { index })
          : "",
        attributes: parseAttributes(inlineAttributes ?? null, {
          index,
        }),
        textFrom: inlineTextFrom != null
          ? welformedName(inlineTextFrom, { index })
          : null,
        textTo: inlineTextTo != null
          ? Object.freeze(
            inlineTextTo.split(S).map(
              (name) => welformedName(name, { index }),
            ),
          )
          : null,
      }),
      lastIndex: regExp.lastIndex,
    };
  }
}

/**
 *  Extracts an `AttributeD·J` from `source` at `index`, and
 *    returns an object containing the attribute `jargon` and
 *    the `lastIndex` of the match.
 *
 *  @argument {string} source
 *  @argument {number} index
 *  @returns {?{path:string,sigil:string,jargons:Readonly<Readonly<AttributeJargon>[]>,lastIndex:number}}
 */
function processAttribute(source, index) {
  const regExp = new RegExp(AttributeD·J.source, "uy");
  regExp.lastIndex = index;
  const parseResult = regExp.exec(source);
  if (parseResult == null) {
    //  There is not an attribute declaration at `index` in
    //    `source`.
    return null;
  } else {
    //  Process the attribute declaration.
    const {
      attributeBlockOrInlinePath,
      attributeBlockOrInlineStrict,
      attributeInlineAny,
      attributeInlinePath,
      attributeInlineStrict,
      attributeNames,
      //  /*  not needed  */ attributeSectionBlockOrInlineAny,
      attributeSectionBlockOrInlinePath,
      attributeSectionBlockOrInlineStrict,
      attributeSectionInlineAny,
      attributeSectionInlinePath,
      attributeSectionInlineStrict,
      attributeSectionSigil,
      attributeSectionStrict,
      attributeSigil,
    } =
      /** @type {{attributeSigil:string,attributeNames:string,[index:string]:string|undefined}} */ (
        parseResult.groups
      );
    const blockDefined = attributeSectionInlinePath != null ||
      attributeSectionInlineAny != null ||
      attributeInlinePath != null || attributeInlineAny != null;
    const possiblyBlockPath = blockDefined
      ? attributeSectionBlockOrInlineStrict ??
        attributeBlockOrInlineStrict
      : null;
    const possiblyInlinePath = blockDefined
      ? attributeSectionInlinePath ?? attributeInlinePath
      : attributeSectionBlockOrInlinePath ??
        attributeBlockOrInlinePath;
    const sigil = welformedPath(attributeSigil);
    const path = [
      attributeSectionSigil == null
        ? "*"
        : welformedPath(attributeSectionSigil),
      attributeSectionStrict ?? " ",
      possiblyBlockPath == null
        ? "*"
        : welformedPath(possiblyBlockPath),
      blockDefined
        ? attributeSectionBlockOrInlineStrict ??
          attributeBlockOrInlineStrict ?? " "
        : " ",
      possiblyInlinePath == null ? "*"
      : welformedPath(possiblyInlinePath),
      blockDefined
        ? attributeSectionInlineStrict ?? attributeInlineStrict ??
          " "
        : attributeSectionBlockOrInlineStrict ??
          attributeBlockOrInlineStrict ?? " ",
      sigil,
    ].join("");
    return {
      path,
      sigil,
      jargons: Object.freeze(
        attributeNames.split(S).map((name) =>
          Object.freeze({
            nodeType: NODE_TYPE.ATTRIBUTE,
            contentModel: CONTENT_MODEL.TEXT,
            sigil,
            path,
            qualifiedName: welformedName(name, { index }),
          })
        ),
      ),
      lastIndex: regExp.lastIndex,
    };
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
function processComment(source, index) {
  const regExp = new RegExp(Comment.source, "uy");
  regExp.lastIndex = index;
  return regExp.test(source) ? { lastIndex: regExp.lastIndex } : null;
}

/**
 *  Adds the provided `jargon` to the correct location in the
 *    provided `sigilMap`.
 *
 * @argument {{[index:string]:{[index:string]:object}}} object
 * @argument {any} jargon
 * @argument {string} [jargon]
 * @argument {sigil} [jargon]
 */
function addJargonToObject(
  object,
  jargon,
  sigil = jargon.sigil,
  path = jargon.path,
) {
  if (!(sigil in object)) {
    object[sigil] = Object.create(null);
  }
  object[sigil][path] = jargon;
}

/**
 *  The class of parsed Declaration of Jargon objects.
 *
 *  Instances of this class must not be modified after processing
 *    begins.
 */
export class Jargon {
  #cachedSigilsForPath = {
    /** @type {{[index:string]:string[]}} */
    [NODE_TYPE.SECTION]: Object.create(null),
    /** @type {{[index:string]:string[]}} */
    [NODE_TYPE.HEADING]: Object.create(null),
    /** @type {{[index:string]:string[]}} */
    [NODE_TYPE.BLOCK]: Object.create(null),
    /** @type {{[index:string]:string[]}} */
    [NODE_TYPE.INLINE]: Object.create(null),
    /** @type {{[index:string]:string[]}} */
    [NODE_TYPE.ATTRIBUTE]: Object.create(null),
  };

  /** @type {{[index:string]:string}} */
  namespaces = Object.create(null, {
    "": {
      configurable: true,
      enumerable: true,
      value: "",
      writable: false,
    },
    "xml": {
      configurable: false,
      enumerable: true,
      value: x·m·lNamespace,
      writable: false,
    },
    "xmlns": {
      configurable: false,
      enumerable: true,
      value: x·m·l·n·sNamespace,
      writable: false,
    },
  });

  /** @type {?Readonly<DocumentJargon>} */
  [NODE_TYPE.DOCUMENT] = null;

  /** @type {{[index:string]:{[index:string]:Readonly<SectionJargon>}}} */
  [NODE_TYPE.SECTION] = Object.create(null);

  /** @type {{[index:string]:{[index:string]:Readonly<HeadingJargon>}}} */
  [NODE_TYPE.HEADING] = Object.create(null);

  /** @type {{[index:string]:{[index:string]:Readonly<BlockJargon>},"#DEFAULT":{[index:string]:Readonly<BlockJargon>}}} */
  [NODE_TYPE.BLOCK] = Object.create(null, {
    "#DEFAULT": {
      configurable: false,
      enumerable: false, //  intentionally not enumerable
      value: Object.create(null),
      writable: false,
    },
  });

  /** @type {{[index:string]:{[index:string]:Readonly<InlineJargon>}}} */
  [NODE_TYPE.INLINE] = Object.create(null);

  /** @type {{[index:string]:{[index:string]:Readonly<Readonly<AttributeJargon>[]>}}} */
  [NODE_TYPE.ATTRIBUTE] = Object.create(null);

  /**
   *  Reads the Declaration of Jargon from the beginning of the
   *    provided `source` and creates a new `Jargon` object
   *    representing it.
   *
   *  @argument {string} source
   *  @argument {{DOMParser:typeof globalThis.DOMParser,systemIdentifiers:{[index:string]:string},[nestedWithin]?:Set<string>}} [options]
   */
  constructor(source, options = {
    DOMParser: globalThis.DOMParser,
    systemIdentifiers: {},
  }) {
    //  Protect instance properties from being accidentally overwritten
    //    during processing.
    Object.defineProperties(this, {
      namespaces: { writable: false },
      [NODE_TYPE.DOCUMENT]: { writable: false },
      [NODE_TYPE.SECTION]: { writable: false },
      [NODE_TYPE.HEADING]: { writable: false },
      [NODE_TYPE.BLOCK]: { writable: false },
      [NODE_TYPE.INLINE]: { writable: false },
      [NODE_TYPE.ATTRIBUTE]: { writable: false },
    });

    //  Ensure source begins with a Declaration of Jargon.
    //  Otherwise, throw.
    if (!source.startsWith("<?market-commons")) {
      throw new ParseError(
        "Source did not begin with a Declaration of Jargon.",
        { index: 0 },
      );
    }

    //  Handle options.
    const DOMParser = options?.DOMParser ?? globalThis?.DOMParser;
    if (typeof DOMParser != "function") {
      throw new ConfigurationError(
        "No D·O·M Parser constructor supplied.",
      );
    }
    const systemIdentifiers = options?.systemIdentifiers ?? {};

    //  Parse and process.
    const regExp = new RegExp(D·J.source, "duy");
    const parseResult = regExp.exec(source);
    if (!parseResult) {
      //  Declarations of Jargon must match the `D·J` production.
      throw new ParseError(
        "Declaration of Jargon does not match expected grammar.",
        { index: 0 },
      );
    } else {
      //  Process the parsed Declaration of Jargon.
      /** @type {string|undefined} */
      const quotedExternalName =
        //@ts-ignore: Object definitely is defined.
        parseResult.groups.externalName ??
          //@ts-ignore: Object definitely is defined.
          parseResult.groups.externalSubset;
      const externalName = quotedExternalName != null
        ? quotedExternalName.substring(
          1,
          quotedExternalName.length - 1,
        )
        : null;
      /** @type {number|undefined} */
      const nameIndex = (
        //@ts-ignore: RegExpExecArray.indicies not implemented.
        parseResult.indices.groups.externalName ??
          //@ts-ignore: RegExpExecArray.indicies not implemented.
          parseResult.indices.groups.externalSubset
      );
      if (externalName != null) {
        //  (Attempt to) handle the referenced external Declaration
        //    of Jargon.
        if (options?.[nestedWithin]?.has(externalName) ?? false) {
          //  There is a recursive external reference [🆐J‐2].
          throw new ParseError(
            `Recursive reference to "${externalName}" in Declaration of Jargon.`,
            { index: nameIndex },
          );
        } else {
          /** @type {string|undefined} */
          let externalD·J;
          switch (false) {
            //  Resolve the system identifier.
            case (
              externalD·J = systemIdentifiers[externalName]
            ) == null: {
              break;
            }
            case (
              externalD·J = defaultSystemIdentifiers[externalName]
            ) == null: {
              break;
            }
            default: {
              //  (Attempt to) fetch the system identifier.
              /*  TODO  */
              throw new ParseError(
                "Fetching external Declarations of Jargon is not yet supported.",
                { index: nameIndex },
              );
            }
          }
          try {
            //  Attempt to process the external Declaration of Jargon
            //    and assign to the properties of this instance those
            //    of the result.
            externalD·J = prepareAsX·M·L(externalD·J ?? "");
            const externalResult = new Jargon(externalD·J, {
              ...options,
              [nestedWithin]: new Set(
                options?.[nestedWithin] ?? [],
              ).add(externalName),
            });
            if (
              externalResult == null ||
              externalResult.source.length != externalD·J.length
            ) {
              //  External Declarations of Jargon must consist of
              //    *only* and *exactly* one `D·J`.
              throw new ParseError("Not welformed.", { index: 0 });
            } else {
              Object.assign(
                this.namespaces,
                externalResult.namespaces,
              );
              Object.defineProperty(this, NODE_TYPE.DOCUMENT, {
                value: externalResult[NODE_TYPE.DOCUMENT],
              });
              for (
                const nodeType
                  of /** @type {(typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK|typeof NODE_TYPE.INLINE|typeof NODE_TYPE.ATTRIBUTE)[]} */ (
                    [
                      NODE_TYPE.SECTION,
                      NODE_TYPE.HEADING,
                      NODE_TYPE.BLOCK,
                      NODE_TYPE.INLINE,
                      NODE_TYPE.ATTRIBUTE,
                    ]
                  )
              ) {
                for (
                  const [sigil, pathsObject] of Object.entries(
                    externalResult[nodeType],
                  )
                ) {
                  this[nodeType][sigil] = Object.assign(
                    Object.create(null),
                    pathsObject,
                  );
                }
              }
              Object.assign(
                this[NODE_TYPE.BLOCK]["#DEFAULT"],
                externalResult[NODE_TYPE.BLOCK]["#DEFAULT"],
              );
            }
          } catch {
            //  The external Declaration of Jargon does not match
            //    the `D·J` production [🆐J‐2].
            throw new ParseError(
              `The external Declaration of Jargon "${externalName}" is not welformed.`,
              { index: nameIndex },
            );
          }
        }
      }
      /** @type {?string} */
      const internalDeclarations =
        //@ts-ignore: Object definitely is defined.
        parseResult.groups.internalDeclarations;
      if (internalDeclarations != null) {
        //  Iterate over each internal declaration.
        /** @type {number} */
        let index =
          //@ts-ignore: RegExpExecArray.indicies not implemented.
          parseResult.indices.groups.internalDeclarations[0];
        /** @type {number} */
        const endIndex =
          //@ts-ignore: RegExpExecArray.indicies not implemented.
          parseResult.indices.groups.internalDeclarations[1];
        while (index < endIndex) {
          //  Process the internal declaration and advance the index to
          //    the next.
          processingDeclaration: {
            attemptingS: {
              const result = processS(source, index);
              if (result != null) {
                //  White·space is ignored.
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingS;
              }
            }
            attemptingNamespace: {
              const result = processNamespace(source, index);
              if (result != null) {
                Object.defineProperty(
                  this.namespaces,
                  result.prefix,
                  {
                    configurable: true,
                    enumerable: true,
                    value: result.literal,
                    writable: false,
                  },
                );
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingNamespace;
              }
            }
            attemptingDocument: {
              const result = processDocument(source, index, DOMParser);
              if (result != null) {
                //  Overwrites any previous document declaration.
                Object.defineProperty(
                  this,
                  NODE_TYPE.DOCUMENT,
                  { value: result.jargon },
                );
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingDocument;
              }
            }
            attemptingSection: {
              const result = processSection(source, index);
              if (result != null) {
                addJargonToObject(
                  this[NODE_TYPE.SECTION],
                  result.jargon,
                );
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingSection;
              }
            }
            attemptingHeading: {
              const result = processHeading(source, index);
              if (result != null) {
                addJargonToObject(
                  this[NODE_TYPE.HEADING],
                  result.jargon,
                );
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingHeading;
              }
            }
            attemptingBlock: {
              const result = processBlock(source, index);
              if (result != null) {
                const value = result.jargon;
                addJargonToObject(
                  this[NODE_TYPE.BLOCK],
                  value,
                );
                if (value.isDefault) {
                  //  This is a default block declaration.
                  //  Record it in the defaults map!
                  this[NODE_TYPE.BLOCK]["#DEFAULT"][
                    value.path.substring(
                      0,
                      /[ >][^ >]*$/u.exec(value.path)?.index ??
                        undefined,
                    ) + ">#DEFAULT"
                  ] = value;
                }
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingBlock;
              }
            }
            attemptingInline: {
              const result = processInline(source, index);
              if (result != null) {
                addJargonToObject(
                  this[NODE_TYPE.INLINE],
                  result.jargon,
                );
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingInline;
              }
            }
            attemptingAttribute: {
              const result = processAttribute(source, index);
              if (result != null) {
                //  This is not additive; it overwrites any existing
                //    array.
                addJargonToObject(
                  this[NODE_TYPE.ATTRIBUTE],
                  result.jargons,
                  result.sigil,
                  result.path,
                );
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingAttribute;
              }
            }
            attemptingComment: {
              const result = processComment(source, index);
              if (result != null) {
                //  Comments are ignored.
                index = result.lastIndex;
                break processingDeclaration;
              } else {
                break attemptingComment;
              }
            }
            throw new ParseError(
              "Unexpected syntax in Declaration of Jargon.",
              { index },
            );
          }
        }
      }
    }

    //  Store the source and freeze.
    this.source = source.substring(0, regExp.lastIndex);
    Object.freeze(this.namespaces);
    for (
      const nodeType
        of /** @type {(typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK|typeof NODE_TYPE.INLINE|typeof NODE_TYPE.ATTRIBUTE)[]} */ (
          [
            NODE_TYPE.SECTION,
            NODE_TYPE.HEADING,
            NODE_TYPE.BLOCK,
            NODE_TYPE.INLINE,
            NODE_TYPE.ATTRIBUTE,
          ]
        )
    ) {
      Object.freeze(this[nodeType]);
    }
    Object.freeze(this);
  }

  /**
   *  Returns an object indicating the number of consecutive `sigil`s
   *    that begin the provided `line`, starting from the offset given
   *    by the provided `lastIndex`, or `null` if none applies.
   *
   *  If `nodeType` is `NODE_TYPE.BLOCK`, `NODE_TYPE.INLINE`, or
   *    `NODE_TYPE.ATTRIBUTE`, a maximum of one sigil will be counted:
   *  The resulting `count` will be `1`.
   *
   *  @argument {typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK|typeof NODE_TYPE.INLINE|typeof NODE_TYPE.ATTRIBUTE} nodeType
   *  @argument {string} path
   *  @argument {Line} line
   *  @argument {number} [lastIndex]
   *  @returns {?{sigil:string,count:number,index:number,lastIndex:number}}
   */
  countSigils(nodeType, path, line, lastIndex = 0) {
    const index = lastIndex >> 0;
    /** @type {{[index:string]:{sigil:string,count:number,index:number,lastIndex:number}}} */
    const matches = Object.create(null);
    const string = String(line);
    for (const sigil of this.sigilsInScope(nodeType, path)) {
      let sigilRegExpSource = "";
      for (
        const charRef of normalizeReferences(sigil).matchAll(
          new RegExp(CharRef.source, "gu"),
        )
      ) {
        //  Build up a regular expression source from the character
        //    references in `sigil`.
        sigilRegExpSource += String.raw`${"" //  see <https://github.com/microsoft/TypeScript/issues/42887>
        }\u{${
          //  Drop the `&#` and convert to hexadecimal.
          parseInt(charRef[0].substring(2)).toString(16)
        }}`;
      }
      const suffix =
        nodeType == NODE_TYPE.ATTRIBUTE || nodeType == NODE_TYPE.INLINE
          ? ""
          : String.raw`(?!\|)[ \t]*`;
      const regExp = new RegExp(`${sigilRegExpSource}${suffix}`, "uy");
      regExp.lastIndex = lastIndex;
      if (
        nodeType == NODE_TYPE.SECTION || nodeType == NODE_TYPE.HEADING
      ) {
        let count = 0;
        let nextIndex = index;
        //  A section or heading may consist of repeated sigils.
        while (regExp.test(string)) {
          //  Increment `count` for as long as there is another sigil.
          ++count;
          nextIndex = regExp.lastIndex;
        }
        if (count > 0) {
          matches[sigil] = {
            sigil,
            count,
            index,
            lastIndex: nextIndex,
          };
        }
      } else if (regExp.test(string)) {
        matches[sigil] = {
          sigil,
          count: 1,
          index,
          lastIndex: regExp.lastIndex,
        };
      } else {
        continue;
      }
    }
    const longestMatchingSigil = Object.keys(matches)
      .reduce(
        (longest, current) =>
          current.length > longest.length ? current : longest,
        "",
      );
    if (longestMatchingSigil != "") {
      return matches[longestMatchingSigil];
    } else {
      return null;
    }
  }

  /**
   *  Creates a “chunk” object from the provided (trimmed) `line` at
   *    the provided `path`.
   *
   *  @argument {string} path
   *  @argument {Line} line
   *  @argument {boolean} inBlock
   *  @returns {Chunk}
   */
  makeChunk(path, line, inBlock = false) {
    if (!inBlock && /^(?:\|[ \t]*)+$/.test(String(line))) {
      //  `line` is a section‐close mark.
      const count = Array.from(line.matchAll(/\|/gu)).length;
      return {
        jargon: this,
        nodeType: NODE_TYPE.SECTION,
        path: /** @type {RegExpExecArray} */ (new RegExp(
          `(?:(?:^|/)[^/]+){0,${count - 1}}`,
          "uy",
        ).exec(path))[0],
        sigil: "|",
        count,
        level: count,
        lines: [new Line(line.index, "")],
      };
    } else {
      //  See if `line` begins with a section, heading, or block
      //    sigil.
      //  If it does, build the chunk accordingly.
      //  If it doesn’t, the chunk is a default block.
      for (
        const nodeType
          of /** @type {(typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK)[]} */ (
            inBlock ? [NODE_TYPE.BLOCK] : [
              NODE_TYPE.SECTION,
              NODE_TYPE.HEADING,
              NODE_TYPE.BLOCK,
            ]
          )
      ) {
        const sigilInfo = this.countSigils(
          nodeType,
          NODE_TYPE.SECTION || inBlock ? path : `${path}>`,
          line,
        );
        if (sigilInfo != null) {
          //  Some sigil matches, so assign it to the `matches` object.
          //  The `level` of the chunk is one greater than the number
          //    of items in its path.
          //  This is clamped to its `count` for sections.
          const { sigil, count, lastIndex } = sigilInfo;
          const level = nodeType == NODE_TYPE.SECTION
            ? count
            : (path.match(/[^\/>]+/gu)?.length ?? 0) + 1;
          return {
            jargon: this,
            nodeType,
            path: nodeType == NODE_TYPE.SECTION
              ? `${
                /** @type {RegExpExecArray} */ (
                  new RegExp(
                    `(?:(?:^|/)[^/]+){0,${level - 1}}`,
                    "uy",
                  ).exec(path)
                )[0]
              }/${sigil}`
              : `${path}>${sigil}`,
            sigil,
            count,
            level,
            lines: [new Line(line.index, line.substring(lastIndex))],
          };
        } else {
          //  The sigil does not match.
          continue;
        }
      }
      return {
        jargon: this,
        nodeType: NODE_TYPE.BLOCK,
        path: `${path}>#DEFAULT`,
        sigil: "#DEFAULT",
        count: 0,
        level: path.match(/[^/]+/gu)?.length ?? 0,
        lines: [line],
      };
    }
  }

  /**
   *  Resolves the provided `path` for the provided `nodeType` using
   *    this `Jargon`, and returns the corresponding definition.
   *
   *  `path` should be “complete” (contain only sigils, `/` [but not
   *    `//`], or `>`) and normalized.
   *
   *  @argument {typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK|typeof NODE_TYPE.INLINE|typeof NODE_TYPE.ATTRIBUTE} nodeType
   *  @argument {string} path
   *  @argument {{line?:number}} [options]
   *  @returns {{localName:string,namespace:?string,jargon:SectionJargon|HeadingJargon|BlockJargon|InlineJargon}|{localName:string,namespace:?string,jargon:AttributeJargon}[]}
   */
  resolve(nodeType, path, options = {}) {
    //  Because most any failure to resolve ought to produce a
    //    `SigilResolutionError`, the body of this function is
    //    is written as a massive `try‐catch`.
    try {
      //  Find the appropriate mapping of paths to jargons.
      //  Then filter entries based on which keys match the provided
      //    `path`, and finally sort by “accuracy”.
      //  If the resulting array is not empty, the final entry will
      //    contain the resolution of the symbol.
      const sigil = String(path).match(
        new RegExp(`(?:${SigilD·J.source}|#DEFAULT)$`, "u"),
      )?.[0];
      if (sigil == null) {
        throw new TypeError("No sigil in path.");
      } else {
        const pathsObject = this[nodeType][sigil];
        if (pathsObject == null) {
          throw new TypeError("Sigil not defined.");
        } else {
          /** @type {[string,SectionJargon|HeadingJargon|BlockJargon|InlineJargon|AttributeJargon[]][]} */
          const entries = Object.entries(pathsObject);
          /** @type {(SectionJargon|HeadingJargon|BlockJargon|InlineJargon|AttributeJargon[])[]} */
          const sortedMatchingDefinitions = Object.entries(
            entries,
          ).filter(
            //deno-lint-ignore no-unused-vars
            ([index, [key, value]]) =>
              //  Build a regular expression from the key and test
              //    `path` against it.
              globRegExp(key).test(path),
          ).sort(
            (
              //deno-lint-ignore no-unused-vars
              [indexA, [keyA, valueA]],
              //deno-lint-ignore no-unused-vars
              [indexB, [keyB, valueB]],
            ) => {
              //  Sort the matching keys by accuracy, in ascending
              //    order.
              //  Keys are considered more “accurate” if they
              //    contain a (non·asterisk) component which matches
              //    an element closer to the end of the path than
              //    the key they are being compared against.
              //  Parent relations are more accurate than ancestor
              //    relations.
              //
              //  The path & keys are split on (space &) greaterthan
              //    to ensure sigils are only compared against like
              //    sigils.
              //  For the keys, the space & greaterthan are
              //    preserved at the beginning of the split strings.
              const splitPath = String(path).split(/>/gu).reverse();
              const splitA = `>${keyA}` //  add `>` prefix to first
                .split(/(?=[ >])/gu)
                .slice(1) //  drop empty first
                .reverse();
              const splitB = `>${keyB}` //  add `>` prefix to first
                .split(/(?=[ >])/gu)
                .slice(1) //  drop empty first
                .reverse();
              for (
                let indexOfLevel = 0;
                indexOfLevel < splitPath.length;
                indexOfLevel++
              ) {
                //  Iterate over each “level” (node type) in the
                //    split path and see if one key is more
                //    “accurate” than the other.
                //  If a key’s levels are exhausted, it is treated
                //    as an empty descendant relation (and will thus
                //    always result in a match for the other key.)
                const level = splitPath[indexOfLevel];
                const splitLevel = level.split(/\//gu).reverse();
                const levelA = splitA[indexOfLevel] ?? " ";
                const splitLevelA = levelA
                  .substring(1) //  deprefix
                  .split(/(?=\/(?=\/))|\/(?!\/)/gu)
                  .reverse();
                const levelB = splitB[indexOfLevel] ?? " ";
                const splitLevelB = levelB
                  .substring(1) //  deprefix
                  .split(/(?=\/(?=\/))|\/(?!\/)/gu)
                  .reverse();
                for (const sigil of splitLevel) {
                  //  Iterate over each sigil in the level and check
                  //    for a match from one key or the other.
                  //  If this loop completes without returning, A & B
                  //    have the same components at this level.
                  if (
                    splitLevelA[0] == sigil && splitLevelB[0] == sigil
                  ) {
                    //  A and B are both direct matches.
                    do {
                      //  Shift A and B, ensuring that they aren’t
                      //    both ancestor matches.
                      splitLevelA.shift();
                      splitLevelB.shift();
                    } while (
                      splitLevelA[0] == "/" && splitLevelB[0] == "/"
                    );
                    continue;
                  } else if (splitLevelA[0] == sigil) {
                    //  A is a direct match and B isn’t.
                    return 1;
                  } else if (splitLevelB[0] == sigil) {
                    //  B is a direct match and A isn’t.
                    return -1;
                  } else if (
                    splitLevelA.find(($) => $ != "/") == sigil
                  ) {
                    //  A is an ancestor match and B isn’t.
                    //  Note that A and B can’t both be ancestor
                    //    matches at the same time (because of the
                    //    do‐while above).
                    return 1;
                  } else if (
                    splitLevelB.find(($) => $ != "/") == sigil
                  ) {
                    //  B is an ancestor match and A isn’t.
                    //  Note that A and B can’t both be ancestor
                    //    matches at the same time (because of the
                    //    do‐while above).
                    return -1;
                  } else {
                    //  Neither A nor B match.
                    //  Try the next symbol.
                    continue;
                  }
                }
                if (levelA[0] == ">" && levelB[0] != ">") {
                  //  A is a direct descendant and B isn’t.
                  return 1;
                } else if (levelA[0] != ">" && levelB[0] == ">") {
                  //  B is a direct descendant and B isn’t.
                  return -1;
                } else {
                  //  A and B both change levels in the same fashion.
                  continue;
                }
              }
              return (
                //  Fallback; when A and B are equivalent, sort by
                //    index.
                //  This isn’t strictly necessary; it is the default
                //    behaviour if `0` is returned (although not in
                //    previous versions of Ecmascript).
                indexA < indexB ? -1 : indexA > indexB ? 1 : 0
              );
            },
          ).map(
            //  Map each entry to its value.
            //deno-lint-ignore no-unused-vars
            ([index, [key, value]]) => value,
          );
          if (sortedMatchingDefinitions.length > 0) {
            //  There is a final result; clone it and add an
            //    appropriate `namespace` and `localName` based on
            //    its `qualifiedName` and the defined namespaces.
            /** @type {SectionJargon|HeadingJargon|BlockJargon|InlineJargon|AttributeJargon[]} */
            const jargon =
              //@ts-ignore: structuredClone is a web API.
              structuredClone(
                sortedMatchingDefinitions.pop(),
              );
            return jargon instanceof Array
              ? jargon.map((attribute) => ({
                ...this.resolveQName(attribute.qualifiedName, {
                  ...options,
                  path,
                }),
                jargon: attribute,
              }))
              : {
                ...this.resolveQName(jargon.qualifiedName, {
                  ...options,
                  path,
                }),
                jargon,
              };
          } else {
            //  Resolution failed to produce a result.
            throw new TypeError(
              "The list of matching definitions was empty.",
            );
          }
        }
      }
    } catch (error) {
      //  Resolution failed.
      throw error instanceof MarketCommonsⅠⅠError
        ? error
        : new SigilResolutionError(
          path,
          { line: options.line, nodeType },
        );
    }
  }

  /**
   *  @argument {string} qualifiedName
   *  @argument {{line?:number,path?:string}} [options]
   *  @returns {{localName:string,namespace:?string}}
   */
  resolveQName(qualifiedName, options = {}) {
    const [_, prefix, localName] =
      /^(?:([^:]+):)?([^:]+)$/u.exec(qualifiedName) ?? [];
    const usedPrefix = prefix ?? "";
    if (!(usedPrefix in this.namespaces)) {
      throw new NamespaceError(
        options?.path == null
          ? `No definition found for namespace prefix "${usedPrefix}"`
          : `No definition found for namespace prefix "${usedPrefix}", referenced by sigil path "${options.path}."`,
        { line: options.line },
      );
    } else {
      return {
        localName: localName ?? "",
        namespace: this.namespaces[usedPrefix] || null,
      };
    }
  }

  /**
   *  Returns a `Set` of all the keys in `sigilMap` which can match
   *    the provided `path` in at least some fashion.
   *
   *  @argument {typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK|typeof NODE_TYPE.INLINE|typeof NODE_TYPE.ATTRIBUTE} nodeType
   *  @argument {string} path
   *  @returns {string[]}
   */
  sigilsInScope(nodeType, path) {
    if (path in this.#cachedSigilsForPath[nodeType]) {
      return this.#cachedSigilsForPath[nodeType][path];
    } else {
      const result = Object.entries(this[nodeType]).flatMap(
        ([sigil, pathsObject]) => {
          //  This callback spoofs a compactMap by returning an array of
          //    either 0 or 1 value.
          const pathWithSigil = />$/u.test(path)
            ? `${path}${sigil}`
            : `${path}/${sigil}`;
          for (const glob of Object.keys(pathsObject)) {
            if (globRegExp(glob).test(pathWithSigil)) {
              return [sigil];
            }
          }
          return [];
        },
      );
      this.#cachedSigilsForPath[nodeType][path] = result;
      return result;
    }
  }
}
