//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: jargons.js
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
  NamespaceResolutionError,
  ParseError,
  SigilResolutionError,
} from "./errors.js";
import {
  marketNamespace,
  parsererrorNamespace,
  x·m·lNamespace,
  x·m·l·n·sNamespace,
} from "./names.js";
import { globRegExp, sigilToRegExp, welformedPath } from "./paths.js";
import { CONTENT_MODEL, NODE_TYPE } from "./symbols.js";
import {
  AttributeD·J,
  AttValue,
  BlockD·J,
  Comment,
  DocumentD·J,
  D·J,
  Eq,
  HeadingD·J,
  InlineD·J,
  LocalPart,
  NamespaceD·J,
  Prefix,
  QName,
  S,
  SectionD·J,
  SigilD·J,
} from "./syntax.js";
import { prepareAsX·M·L, welformedName } from "./text.js";

/** @typedef {import("./errors.js").ErrorOptions} ErrorOptions */
/** @typedef {import("./symbols.js").DOCUMENT_NODE} DOCUMENT_NODE */
/** @typedef {import("./symbols.js").SECTION_NODE} SECTION_NODE */
/** @typedef {import("./symbols.js").HEADING_NODE} HEADING_NODE */
/** @typedef {import("./symbols.js").BLOCK_NODE} BLOCK_NODE */
/** @typedef {import("./symbols.js").INLINE_NODE} INLINE_NODE */
/** @typedef {import("./symbols.js").ATTRIBUTE_NODE} ATTRIBUTE_NODE */
/** @typedef {import("./symbols.js").MIXED_CONTENT} MIXED_CONTENT */
/** @typedef {import("./symbols.js").TRANSPARENT_CONTENT} TRANSPARENT_CONTENT */
/** @typedef {import("./symbols.js").INLINE_CONTENT} INLINE_CONTENT */
/** @typedef {import("./symbols.js").TEXT_CONTENT} TEXT_CONTENT */
/** @typedef {import("./symbols.js").COMMENT_CONTENT} COMMENT_CONTENT */
/** @typedef {import("./symbols.js").LITERAL_CONTENT} LITERAL_CONTENT */

/**
 *  A document jargon.
 *
 *  @typedef {Object} DocumentJargon
 *  @property {DOCUMENT_NODE} nodeType
 *  @property {MIXED_CONTENT} contentModel
 *  @property {string} source
 *  @property {XMLDocument} template
 */

/**
 *  A generic division jargon.
 *
 *  @typedef {Object} DivisionJargon
 *  @property {SECTION_NODE|HEADING_NODE|BLOCK_NODE|INLINE_NODE} nodeType
 *  @property {MIXED_CONTENT|TRANSPARENT_CONTENT|INLINE_CONTENT|TEXT_CONTENT|COMMENT_CONTENT|LITERAL_CONTENT} contentModel
 *  @property {?string} sigil
 *  @property {?string} path
 *  @property {string} qualifiedName
 *  @property {Readonly<{[index:string]:string}>} attributes
 */

/**
 *  A section jargon.
 *
 *  @typedef {Object} SectionJargon
 *  @property {SECTION_NODE} nodeType
 *  @property {MIXED_CONTENT|TEXT_CONTENT} contentModel
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
 *  @property {HEADING_NODE} nodeType
 *  @property {INLINE_CONTENT} contentModel
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
 *  @property {BLOCK_NODE} nodeType
 *  @property {MIXED_CONTENT|TRANSPARENT_CONTENT|INLINE_CONTENT|COMMENT_CONTENT|LITERAL_CONTENT} contentModel
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
 *  @property {INLINE_NODE} nodeType
 *  @property {TRANSPARENT_CONTENT|INLINE_CONTENT|TEXT_CONTENT|COMMENT_CONTENT|LITERAL_CONTENT} contentModel
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
 *  @property {ATTRIBUTE_NODE} nodeType
 *  @property {TEXT_CONTENT} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {string} qualifiedName
 */

/**
 *  The result produced after resolving a sigil.
 *
 *  @typedef {Readonly<SectionJargon>|Readonly<HeadingJargon>|Readonly<BlockJargon>|Readonly<InlineJargon>|Readonly<Readonly<AttributeJargon>[]>} ResolvedJargon
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
 *  @argument {ErrorOptions} [options]
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
          options,
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
    const {
      documentTemplate: documentSource,
    } = /** @type {{documentTemplate:string}} */ (parseResult.groups);
    const document = (new DOMParser()).parseFromString(
      documentSource,
      "application/xml",
    );
    const root = document.documentElement;
    const marketNodes = Object.create(
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
    Object.defineProperty(document, marketNamespace, {
      configurable: true,
      enumerable: false,
      value: marketNodes,
      writable: false,
    });
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
        source: documentSource,
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
      /** @type {{blockSpecial:"TRANSPARENT"|"COMMENT"|"LITERAL"|undefined,[index:string]:string|undefined}} */ (
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
      /** @type {{inlinePath:string,inlineSpecial:"TRANSPARENT"|"COMMENT"|"LITERAL"|undefined,[index:string]:string|undefined}} */ (
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
 *  Adds the provided `jargon` to the correct location in the provided
 *    `object`.
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
    if (parseResult == null) {
      //  Declarations of Jargon must match the `D·J` production.
      throw new ParseError(
        "Declaration of Jargon does not match expected grammar.",
        { index: 0 },
      );
    } else {
      //  Process the parsed Declaration of Jargon.
      const parseGroups =
        /** @type {{externalName?:string,externalSubset?:string,internalDeclarations?:string}} */ (
          parseResult.groups
        );
      const parseGroupIndices =
        /** @type {{externalName?:[number,number],externalSubset?:[number,number],internalDeclarations?:[number,number]}} */ (
          //@ts-ignore: `RegExpExecArray/indices` not implemented.
          parseResult.indices.groups
        );
      /** @type {string|undefined} */
      const quotedExternalName = parseGroups.externalName ??
        parseGroups.externalSubset;
      const externalName = quotedExternalName != null
        ? quotedExternalName.substring(
          1,
          quotedExternalName.length - 1,
        )
        : null;
      /** @type {number|undefined} */
      const nameIndex = (
        parseGroupIndices.externalName ??
          parseGroupIndices.externalSubset
      )?.[0];
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
          const externalD·J = prepareAsX·M·L(
            systemIdentifiers[externalName] ??
              defaultSystemIdentifiers[externalName] ?? (() => {
                //  (Attempt to) fetch the system identifier.
                /*  TODO  */
                throw new ParseError(
                  "Fetching external Declarations of Jargon is not yet supported.",
                  { index: nameIndex },
                );
              })(),
          );
          try {
            //  Attempt to process the external Declaration of Jargon
            //    and assign to the properties of this instance those
            //    of the result.
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
                  of /** @type {(SECTION_NODE|HEADING_NODE|BLOCK_NODE|INLINE_NODE|ATTRIBUTE_NODE)[]} */ (
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
      const { internalDeclarations } = parseGroups;
      if (internalDeclarations != null) {
        //  Iterate over each internal declaration.
        let [index, endIndex] = /** @type {[number, number]} */ (
          parseGroupIndices.internalDeclarations
        );
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
        of /** @type {(SECTION_NODE|HEADING_NODE|BLOCK_NODE|INLINE_NODE|ATTRIBUTE_NODE)[]} */ (
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
   *    that begin the provided `text`, starting from the offset given
   *    by the provided `lastIndex`, or `null` if none applies.
   *
   *  If there are multiple possible sigils at the provided `lastIndex`
   *    in `text`, the longest will be chosen.
   *
   *  If `nodeType` is `NODE_TYPE.BLOCK`, `NODE_TYPE.INLINE`, or
   *    `NODE_TYPE.ATTRIBUTE`, a maximum of one sigil will be counted:
   *  The resulting `count` will be `1`.
   *
   *  @argument {string} text
   *  @argument {SECTION_NODE|HEADING_NODE|BLOCK_NODE|INLINE_NODE|ATTRIBUTE_NODE} nodeType
   *  @argument {string} path
   *  @argument {number} [lastIndex]
   *  @returns {?{sigil:string,count:number,index:number,lastIndex:number}}
   */
  countSigils(text, nodeType, path, lastIndex = 0) {
    /** @type {{[index:string]:?{sigil:string,count:number,index:number,lastIndex:number},"":null}} */
    const matches = Object.create(null, {
      "": {
        configurable: false,
        enumerable: false,
        value: null,
        writable: false,
      },
    });
    for (const sigil of this.sigilsInScope(nodeType, path)) {
      //  Test each sigil in scope and see if it begins the `text`.
      const suffix =
        nodeType == NODE_TYPE.ATTRIBUTE || nodeType == NODE_TYPE.INLINE
          ? ""
          : String.raw`(?!\|)[ \t]*`;
      const regExp = new RegExp(
        `${sigilToRegExp(sigil).source}${suffix}`,
        "uy",
      );
      regExp.lastIndex = lastIndex;
      if (
        nodeType == NODE_TYPE.SECTION || nodeType == NODE_TYPE.HEADING
      ) {
        //  A section or heading may consist of repeated sigils.
        let count = 0;
        let nextIndex = lastIndex;
        while (regExp.test(text)) {
          //  Increment `count` for as long as there is another sigil.
          ++count;
          nextIndex = regExp.lastIndex;
        }
        if (count > 0) {
          matches[sigil] = {
            sigil,
            count,
            index: lastIndex,
            lastIndex: nextIndex,
          };
        } else {
          continue;
        }
      } else if (regExp.test(text)) {
        //  Other node types have a `count` limited to 1.
        matches[sigil] = {
          sigil,
          count: 1,
          index: lastIndex,
          lastIndex: regExp.lastIndex,
        };
      } else {
        continue;
      }
    }
    return matches[
      Object.keys(matches).reduce(
        (best, next) => next.length > best.length ? next : best,
        "",
      )
    ];
  }

  /**
   *  Parses the attributes container (wrapped in braces) provided as
   *    `text` into the provided `intoObject`, or returns a new object
   *    mapping attribute names to values.
   *
   *  @argument {string} path
   *  @argument {string} text
   *  @argument {{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}} [intoObject]
   *  @argument {ErrorOptions} [options]
   *  @returns {{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}}
   */
  parseAttributesContainer(
    path,
    text,
    intoObject = undefined,
    options = {},
  ) {
    /** @type {{[index:string]:{localName:string,namespace:?string,value:string}}} */
    const attributes = Object.create(null);
    const endIndex = text.length - 1;
    if (text[0] != "{" || text[endIndex] != "}") {
      //  This is not a valid attributes container.
      throw new ParseError(
        `Attributes container "${text}" is not wrapped in curly braces.`,
        options,
      );
    } else {
      //  Process the contents of the attributes container, collecting
      //    any attributes into `attributes`.
      for (let index = 1; index < endIndex;) {
        testingWhitespace: {
          //  Skip whtiespace.
          const sRegExp = /[ \t]+/uy;
          sRegExp.lastIndex = index;
          if (sRegExp.test(text)) {
            //  There is whitespace at `index` in `text`; ignore it.
            index = sRegExp.lastIndex;
            continue;
          } else {
            //  There is no whitespace at `index` in `text`.
            break testingWhitespace;
          }
        }
        testingNamedAttribute: {
          //  Check for an attribute name, possibly followed by a
          //    value, and add it if present.
          const attributeRegExp = new RegExp(
            String.raw`(?<name>${QName.source})(?:=(?<value>[^ \t]))?`,
            "uy",
          );
          attributeRegExp.lastIndex = index;
          const parsedAttribute = attributeRegExp.exec(text);
          if (parsedAttribute) {
            //  There is a named attribute at `index` in `text`.
            const { name: qualifiedName, value } =
              /** @type {{name:string,value?:string}} */ (
                parsedAttribute.groups
              );
            if (qualifiedName in attributes) {
              //  There is already an attribute by this name in
              //    `attributes`:
              //  Append the value to the existing object.
              const existing = attributes[qualifiedName];
              existing.value = [existing.value, value ?? ""].join(" ");
            } else if (
              intoObject != null && qualifiedName in intoObject
            ) {
              //  There is not an attribute by this name in
              //    `attributes`, but there is one in `intoObject`:
              //  Copy the existing value into a new object with the
              //    new value appended to it.
              const {
                localName,
                namespace,
                value: existing,
              } = intoObject[qualifiedName];
              attributes[qualifiedName] = {
                localName,
                namespace,
                value: [existing, value ?? ""].join(" "),
              };
            } else {
              //  An attribute by this name does not exist in
              //    `attributes` or `intoObject`:
              //  Resolve the qualified name of the attribute and
              //    construct a new object with the value.
              const { localName, namespace } = this.resolveQName(
                qualifiedName,
                false,
                { ...options, path },
              );
              attributes[qualifiedName] = {
                localName,
                namespace,
                value: value ?? "",
              };
            }
            index = attributeRegExp.lastIndex;
            continue;
          } else {
            //  There is no named attribute at `index` in `text`.
            break testingNamedAttribute;
          }
        }
        testingSigils: {
          //  Check for an attribute sigil in the current scope.
          const sigilInfo = this.countSigils(
            text,
            NODE_TYPE.ATTRIBUTE,
            `${path}>`,
            index,
          );
          if (sigilInfo) {
            //  There is a sigil at `index` in `text`.
            const valueRegExp = /[^ \t]*/uy;
            valueRegExp.lastIndex = sigilInfo.lastIndex;
            const value = valueRegExp.exec(text)?.[0] ?? "";
            for (
              const { qualifiedName }
                of /** @type {Readonly<Readonly<AttributeJargon>[]>} */ (
                  this.resolve(
                    NODE_TYPE.ATTRIBUTE,
                    `${path}>${sigilInfo.sigil}`,
                    options,
                  )
                )
            ) {
              //  Iterate over the qualified names in the sigil
              //    definition and add the value to each one.
              if (qualifiedName in attributes) {
                //  There is already an attribute by this name in
                //    `attributes`:
                //  Append the value to the existing object.
                const existing = attributes[qualifiedName];
                existing.value = `${existing.value} ${value}`;
              } else if (
                intoObject != null && qualifiedName in intoObject
              ) {
                //  There is not an attribute by this name in
                //    `attributes`, but there is one in `intoObject`:
                //  Copy the existing value into a new object with the
                //    new value appended to it.
                const {
                  localName,
                  namespace,
                  value: existing,
                } = intoObject[qualifiedName];
                attributes[qualifiedName] = {
                  localName,
                  namespace,
                  value: `${existing} ${value}`,
                };
              } else {
                //  An attribute by this name does not exist in
                //    `attributes` or `intoObject`:
                //  Resolve the qualified name of the attribute and
                //    construct a new object with the value.
                const { localName, namespace } = this.resolveQName(
                  qualifiedName,
                  false,
                  { ...options, path },
                );
                attributes[qualifiedName] = {
                  localName,
                  namespace,
                  value,
                };
              }
            }
            index = valueRegExp.lastIndex;
            continue;
          } else {
            //  There is no sigil at `index` in `text`.
            break testingSigils;
          }
        }
        throw new ParseError(
          `Unable to parse attributes container "${text}" at index ${index}: No valid sigil or attribute name found.`,
          options,
        );
      }
    }
    return Object.defineProperties(
      intoObject ?? Object.create(null),
      Object.fromEntries(
        Object.entries(attributes).map(([key, value]) => [key, {
          configurable: true,
          enumerable: true,
          value: Object.freeze(value),
          writable: false,
        }]),
      ),
    );
  }

  /**
   *  Resolves the provided `path` for the provided `nodeType` using
   *    this `Jargon`, and returns the corresponding definition.
   *
   *  `path` should be “complete” (contain only sigils, `/` [but not
   *    `//`], or `>`) and normalized.
   *
   *  @argument {SECTION_NODE|HEADING_NODE|BLOCK_NODE|INLINE_NODE|ATTRIBUTE_NODE} nodeType
   *  @argument {string} path
   *  @argument {ErrorOptions} [options]
   *  @returns {ResolvedJargon}
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
          /** @type {[string,ResolvedJargon][]} */
          const entries = Object.entries(pathsObject);
          /** @type {ResolvedJargon[]} */
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
          const bestMatch = sortedMatchingDefinitions.pop();
          if (bestMatch != null) {
            return bestMatch;
          } else {
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
          { ...options, nodeType },
        );
    }
  }

  /**
   *  Resolves the qualified name keys of the provided `attributes` and
   *    returns an object mapping them to an attributes object with
   *    `localName`, `namespace`, and `value`.
   *
   *  @argument {{[index:string]:string}} attributes
   *  @argument {ErrorOptions&{path?:string}} [options]
   *  @returns {{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}}
   */
  resolveAttributes(attributes, options = {}) {
    return Object.create(
      null,
      Object.fromEntries(
        Object.entries(attributes).map(([key, value]) => {
          const {
            localName,
            namespace,
          } = this.resolveQName(key, false, options);
          return [
            key,
            {
              configurable: true,
              enumerable: true,
              value: Object.freeze({
                localName,
                namespace,
                value,
              }),
              writable: false,
            },
          ];
        }),
      ),
    );
  }

  /**
   *  Resolves the provided `qualifiedName` using the namespaces
   *    declared for this `Jargon`.
   *
   *  If `useDefault` is `true`, then a `qualifiedName` with no
   *    namespace component will be assigned the default namespace.
   *
   *  @argument {string} qualifiedName
   *  @argument {boolean} [useDefault]
   *  @argument {ErrorOptions&{path?:string}} [options]
   *  @returns {{localName:string,namespace:?string}}
   */
  resolveQName(qualifiedName, useDefault = true, options = {}) {
    const parsedQualifiedName = new RegExp(
      `^(?:(?<prefix>${Prefix.source}):)?(?<localName>${LocalPart.source})$`,
      "u",
    ).exec(qualifiedName);
    if (parsedQualifiedName == null) {
      throw new ParseError(
        `Name "${qualifiedName}" is not a valid qualified name.`,
        options,
      );
    } else {
      const { prefix, localName } =
        /** @type {{prefix?:string,localName:string}} */ (
          parsedQualifiedName.groups
        );
      const usedPrefix = prefix ?? "";
      if (!useDefault && usedPrefix == "") {
        return {
          localName: localName,
          namespace: null,
        };
      } else if (!(usedPrefix in this.namespaces)) {
        throw new NamespaceResolutionError(usedPrefix, options);
      } else {
        return {
          localName: localName,
          namespace: this.namespaces[usedPrefix] || null,
        };
      }
    }
  }

  /**
   *  Returns an `Array` of all the sigils for the provided `nodeType`
   *    which can match the provided `path` in at least some fashion.
   *
   *  These responses are cached internally.
   *
   *  @argument {SECTION_NODE|HEADING_NODE|BLOCK_NODE|INLINE_NODE|ATTRIBUTE_NODE} nodeType
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
          const pathWithSigil = path == ""
            ? sigil
            : />$/u.test(path)
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
