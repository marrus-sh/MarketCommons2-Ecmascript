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

import {
  systemIdentifierMap as defaultSystemIdentifierMap,
} from "./defaults.js";
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
  sigilsInScope,
} from "./paths.js";
import { CONTENT_MODEL, NODE_TYPE } from "./symbols.js";
import * as $ from "./syntax.js";
import { prepareAsX·M·L } from "./text.js";

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
 *  @property {Map<string,string>} attributes
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
 *  @property {Map<string,string>} attributes
 *  @property {?Set<string>} countTo
 *  @property {?Set<string>} textTo
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
 *  @property {Map<string,string>} attributes
 *  @property {?Set<string>} countTo
 */

/**
 *  A block jargon.
 *
 *  @typedef {Object} BlockJargon
 *  @property {typeof NODE_TYPE.BLOCK} nodeType
 *  @property {typeof CONTENT_MODEL.INLINE|typeof CONTENT_MODEL.MIXED|typeof CONTENT_MODEL.COMMENT|typeof CONTENT_MODEL.LITERAL} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {?string} qualifiedName
 *  @property {Map<string,string>} attributes
 *  @property {boolean} isDefault
 *  @property {?DivisionJargon} inList
 */

/**
 *  An inline jargon.
 *
 *  @typedef {Object} InlineJargon
 *  @property {typeof NODE_TYPE.INLINE} nodeType
 *  @property {typeof CONTENT_MODEL.INLINE|typeof CONTENT_MODEL.TEXT|typeof CONTENT_MODEL.COMMENT|typeof CONTENT_MODEL.LITERAL} contentModel
 *  @property {string} sigil
 *  @property {string} path
 *  @property {?string} qualifiedName
 *  @property {Map<string,string>} attributes
 *  @property {?string} textFrom
 *  @property {?Set<string>} textTo
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
 *  The class of parsed Declaration of Jargon objects.
 */
export const Jargon = (() => {
  /**
   *  Returns the number of consecutive provided `sigil`s that are in
   *    the provided `string`, starting from the offset given by the
   *    provided `lastIndex`.
   *  The value will be clamped to `max` if provided.
   *
   *  @argument {string} string
   *  @argument {string} sigil
   *  @argument {number} lastIndex
   *  @argument {number} max
   *  @returns {number}
   */
  function countSigils(string, sigil, lastIndex = 0, max = Infinity) {
    let count = 0;
    let sigilRegExpSource = "";
    for (
      const charRef of normalizeReferences(sigil).matchAll(
        new RegExp($.CharRef.source, "gu"),
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
    const regExp = new RegExp(
      String.raw`${sigilRegExpSource}(?!\|)[ \t]*`,
      "uy",
    );
    regExp.lastIndex = lastIndex;
    while (count < max && regExp.test(string)) {
      //  Increment `count` for as long as there is another sigil, up
      //    to `max`.
      ++count;
    }
    return count;
  }

  return class Jargon {
    /**
     *  @type {Map<string,string>}
     */
    namespaces = new Map([
      ["", ""],
      ["xml", x·m·lNamespace],
      ["xmlns", x·m·l·n·sNamespace],
    ]);

    /**
     *  @type {?DocumentJargon}
     */
    [NODE_TYPE.DOCUMENT] = null;

    /**
     *  @type {Map<string,Map<string,SectionJargon>>}
     */
    [NODE_TYPE.SECTION] = new Map();

    /**
     *  @type {Map<string,Map<string,HeadingJargon>>}
     */
    [NODE_TYPE.HEADING] = new Map();

    /**
     *  @type {Map<string,Map<string,BlockJargon>>}
     */
    [NODE_TYPE.BLOCK] = new Map([["#DEFAULT", new Map()]]);

    /**
     *  @type {Map<string,Map<string,InlineJargon>>}
     */
    [NODE_TYPE.INLINE] = new Map();

    /**
     *  @type {Map<string,Map<string,Set<AttributeJargon>>>}
     */
    [NODE_TYPE.ATTRIBUTE] = new Map();

    /**
     *  Creates a new (empty) `Jargon` object.
     */
    constructor() {
      return Object.defineProperties(this, {
        namespaces: { writable: false },
        [NODE_TYPE.DOCUMENT]: { writable: false },
        [NODE_TYPE.SECTION]: { writable: false },
        [NODE_TYPE.HEADING]: { writable: false },
        [NODE_TYPE.BLOCK]: { writable: false },
        [NODE_TYPE.INLINE]: { writable: false },
        [NODE_TYPE.ATTRIBUTE]: { writable: false },
      });
    }

    /**
     *  Creates a “chunk” object from the provided `line` at the
     *    provided `path`.
     *
     *  @argument {string} path
     *  @argument {import("./text.js").Line} line
     *  @returns {Object}
     */
    makeChunk(path, line) {
      if (/^(?:\|[ \t]*)+$/.test(String(line))) {
        //  `line` is a section‐close mark.
        const count = Array.from(line.matchAll(/\|/gu)).length;
        return {
          jargon: this,
          nodeType: NODE_TYPE.SECTION,
          path: /** @type {RegExpExecArray} */ (new RegExp(
            `(?:(?:^|/)[^/]+){0,${count - 1}}`,
            "uy",
          ).exec(path))[0],
          sigil: null,
          count,
          level: count,
          lines: [line],
        };
      } else {
        //  See if `line` begins with a section, heading, or block
        //    sigil.
        //  If it does, build the chunk accordingly.
        //  If it doesn’t, the chunk is a default block.
        for (
          const nodeType
            of /** @type {(typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK)[]} */ (
              [
                NODE_TYPE.SECTION,
                NODE_TYPE.HEADING,
                NODE_TYPE.BLOCK,
              ]
            )
        ) {
          //  Return the longest sigil of the current `nodeType` which
          //    begins `line`, if one exists.
          const possibilities = sigilsInScope(
            nodeType == NODE_TYPE.SECTION ? path : `${path}>`,
            this[nodeType],
          );
          const matches = Object.create(null);
          for (const sigil of possibilities) {
            //  Iterate over every possible sigil and see if it begins
            //    the line.
            //  For sections and headings, keep track of how many times
            //    the sigil appears (the `count`).
            //  For blocks, the count is limited to `1`.
            const count = countSigils(
              String(line),
              sigil,
              0,
              nodeType == NODE_TYPE.BLOCK ? 1 : Infinity,
            );
            if (count > 0) {
              //  The sigil matches, so assign it to the `matches`
              //    object.
              //  The `level` of the chunk is one greater than the
              //    number of sections in its path.
              //  This is clamped to its `count` for sections.
              const level = nodeType == NODE_TYPE.SECTION
                ? count
                : (path.match(/[^/]+/gu)?.length ?? 0) + 1;
              matches[sigil] = {
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
                lines: [line],
              };
            } else {
              //  The sigil does not match.
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
     *  @returns {Object}
     */
    resolve(nodeType, path, options = {}) {
      //  To keep from having to do a bunch of typically‐needless
      //    typechecking (e.g., that the path map exists and is a
      //    `Map`), and because any failure to resolve ought to produce
      //    a `SigilResolutionError` anyway, the body of this function
      //    is written as a massive `try‐catch`.
      try {
        //  Find the appropriate mapping of paths to jargons.
        //  Then filter entries based on which keys match the provided
        //    `path`, and finally sort by “accuracy”.
        //  If the resulting array is not empty, the final entry will
        //    contain the resolution of the symbol.
        const sigil = String(path).match(
          new RegExp(`(?:${$.SigilD·J.source}|#DEFAULT)$`, "u"),
        )?.[0];
        //@ts-ignore: We are in a try block for this reason.
        const pathMap = this[nodeType].get(sigil);
        const sortedMatchingDefinitions = Object.entries(
          //@ts-ignore: We are in a try block for this reason.
          Array.from(pathMap.entries()),
        ).filter(
          //deno-lint-ignore no-unused-vars
          ([index, [key, value]]) =>
            //  Build a regular expression from the key and test `path`
            //    against it.
            globRegExp(key).test(path),
        ).sort(
          (
            //deno-lint-ignore no-unused-vars
            [indexA, [keyA, valueA]],
            //deno-lint-ignore no-unused-vars
            [indexB, [keyB, valueB]],
          ) => {
            //  Sort the matching keys by accuracy, in ascending order.
            //  Keys are considered more “accurate” if they contain a
            //    (non·asterisk) component which matches an element
            //    closer to the end of the path than the key they are
            //    being compared against.
            //  Parent relations are more accurate than ancestor
            //    relations.
            //
            //  The path & keys are split on (space &) greaterthan to
            //    ensure sigils are only compared against like sigils.
            //  For the keys, the space & greaterthan are preserved at
            //    the beginning of the split strings.
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
              //  Iterate over each “level” (node type) in the split
              //    path and see if one key is more “accurate” than
              //    the other.
              //  If a key’s levels are exhausted, it is treated as an
              //    empty descendant relation (and will thus always
              //    result in a match for the other key.)
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
                //  Iterate over each sigil in the level and check for
                //    a match from one key or the other.
                //  If this loop completes without returning, A & B
                //    have the same components at this level.
                if (
                  splitLevelA[0] == sigil && splitLevelB[0] == sigil
                ) {
                  //  A and B are both direct matches.
                  do {
                    //  Shift A and B, ensuring that they aren’t both
                    //    ancestor matches.
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
                  //  Note that A and B can’t both be ancestor matches
                  //    at the same time (because of the do‐while
                  //    above).
                  return 1;
                } else if (
                  splitLevelB.find(($) => $ != "/") == sigil
                ) {
                  //  B is an ancestor match and A isn’t.
                  //  Note that A and B can’t both be ancestor matches
                  //    at the same time (because of the do‐while
                  //    above).
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
              //  Fallback; when A and B are equivalent, sort by index.
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
          //  There is a final result; clone it and add an appropriate
          //    `namespace` and `localName` based on its
          //    `qualifiedName` and the defined namespaces.
          //@ts-ignore: structuredClone is a web API.
          const result = structuredClone(
            sortedMatchingDefinitions.pop(),
          );
          //deno-lint-ignore no-unused-vars
          const [qualifiedName, prefix, localName] =
            /** @type {RegExpExecArray} */ (
              /^(?:([^:]+):)?([^:]+)$/u.exec(result.qualifiedName)
            );
          const usedPrefix = prefix ?? "";
          if (!this.namespaces.has(usedPrefix)) {
            throw new NamespaceError(
              `No definition found for namespace prefix "${usedPrefix}", referenced by sigil path "${path}."`,
              { line: options.line },
            );
          } else {
            result.localName = localName;
            result.namespace = this.namespaces.get(usedPrefix) || null;
          }
          return result;
        } else {
          //  Resolution failed to produce a result.
          throw new TypeError(
            "The list of matching definitions was empty.",
          );
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
  };
})();

/**
 *  Reads the Declaration of Jargon from the beginning of the
 *    provided `source` and processes it into the `jargon` property
 *    on the returned object.
 *  The `lastIndex` property gives the index of the end of the
 *    Declaration of Jargon in the `source` string.
 *
 *  If the source does not begin with the string `<?market-commons`,
 *    `jargon` will be `null` and `lastIndex` will be `-1`.
 */
export const process = (() => {
  /**
   *  A symbol used in options objects to provide a `Set` of document
   *    identifiers which the current declaration is referenced from.
   *  This is intentionally not exported; it should not be available to
   *    users.
   */
  const nestedWithin = Symbol();

  /**
   *  Adds the provided ˋjargonˋ to the correct location in the
   *    provided ˋsigilMapˋ.
   *
   * @argument {Map<string,Map<string,Object>>} sigilMap
   * @argument {{path:string,sigil:string}} jargon
   */
  function addJargonToSigilMap(sigilMap, jargon) {
    const { path, sigil } = jargon;
    const pathMap = sigilMap.get(sigil);
    if (pathMap !== undefined) {
      //  There is already a declaration with this `sigil`; add
      //    `value` to the existing `Map`.
      pathMap.set(path, jargon);
    } else {
      //  Create a new `Map` for this `sigil` and add `value` to it.
      sigilMap.set(sigil, new Map([[path, jargon]]));
    }
  }

  const {
    processS,
    processNamespace,
    processDocument,
    processSection,
    processHeading,
    processBlock,
    processInline,
    processAttribute,
    processComment,
  } = (() => {
    /**
     *  Throws an error if the provided `qualifiedName` is not
     *    welformed; otherwise, simply returns it.
     *
     *  @argument {string} qualifiedName
     *  @argument {{index?:number}} [options]
     *  @returns {string}
     */
    function welformedName(qualifiedName, options = {}) {
      if (
        new RegExp(`^${$.NSAttName.source}$`, "u").test(qualifiedName)
      ) {
        //  Names cannot match the `NSAttName` production [🆐A‐2]
        //    [🆐E‐2][🆐F‐2][🆐G‐3][🆐H‐4][🆐I‐4].
        throw new ParseError(
          `"${qualifiedName}" cannot be used as a qualified name.`,
          { index: options?.index },
        );
      } else {
        //  Simply return the name.
        return qualifiedName;
      }
    }

    /**
     *  Throws an error if the provided `path` is not welformed;
     *    otherwise, returns the normalized form.
     *
     *  @argument {string} path
     *  @argument {{index?:number}} [options]
     *  @returns {string}
     */
    function welformedSigils(path, options = {}) {
      const normalizedPath = normalizeReferences(path);
      for (
        const charRef of normalizedPath.matchAll(
          new RegExp($.CharRef.source, "g"),
        )
      ) {
        if (/^(?:&#32;|&#9;|&#10;|&#13;|&#124;)$/u.test(charRef[0])) {
          //  A sigil may not contain a character indicating `S` or
          //    `'|'` [🆐B‐1].
          throw new ParseError(
            `Whitespace and "|" characters are not allowed in sigils.`,
            { index: options?.index },
          );
        } else {
          continue;
        }
      }
      return normalizedPath;
    }

    /**
     *  Parses an attributes declaration into a `Map` of attribute
     *    names and values.
     *
     *  @argument {?string} attributesDeclaration
     *  @argument {{index?:number}} [options]
     *  @returns {Map<string,string>}
     */
    function parseAttributes(attributesDeclaration, options = {}) {
      const regExp = new RegExp(
        `(?<name>${$.QName.source})${$.Eq.source}(?<attValue>${$.AttValue.source})`,
        "gu",
      );
      const result = new Map();
      if (attributesDeclaration != null) {
        //  Iterate over each `Attribute` in `attributesDeclaration`
        //    and extract its Name and AttValue, then assign these in
        //    the result `Map`.
        let attribute = null;
        while ((attribute = regExp.exec(attributesDeclaration))) {
          const { name, attValue } =
            /** @type {{name:string,attValue:string}} */ (
              attribute.groups
            );
          if (result.has(name)) {
            //  An attributes declaration must not declare
            //    the same attribute name twice [🆐A‐1].
            throw new ParseError(
              `Attribute @${name} declared twice.`,
              { index: options?.index },
            );
          } else {
            //  Set the attribute.
            result.set(
              welformedName(name, options),
              //  Trim quotes.
              attValue.substring(1, attValue.length - 1),
            );
          }
        }
      }
      return result;
    }

    return {
      /**
       *  Extracts an `S` from `source` at `index`, and returns an
       *    object containing the `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{lastIndex:number}}
       */
      processS(source, index) {
        const regExp = new RegExp($.S.source, "uy");
        regExp.lastIndex = index;
        return regExp.test(source)
          ? { lastIndex: regExp.lastIndex }
          : null;
      },

      /**
       *  Extracts a `NamespaceD·J` from `source` at `index`, and
       *    returns an object containing the `lastIndex`, `prefix`,
       *    and `literal` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{prefix:string,literal:string,lastIndex:number}}
       */
      processNamespace(source, index) {
        const regExp = new RegExp($.NamespaceD·J.source, "uy");
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
      },

      /**
       *  Extracts a `DocumentD·J` from `source` at `index`, and
       *    returns an object containing the document ˋjargonˋ and
       *    the `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @argument {typeof globalThis.DOMParser} DOMParser
       *  @returns {?{jargon:DocumentJargon,lastIndex:number}}
       */
      processDocument(source, index, DOMParser) {
        const regExp = new RegExp($.DocumentD·J.source, "uy");
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
          const marketNodes = document[marketNamespace] = Object
            .create(
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
                Object.defineProperty(
                  marketNodes,
                  name,
                  { value: node },
                );
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
            jargon: {
              nodeType: NODE_TYPE.DOCUMENT,
              contentModel: CONTENT_MODEL.MIXED,
              template: document,
            },
            lastIndex: regExp.lastIndex,
          };
        }
      },

      /**
       *  Extracts a `SectionD·J` from `source` at `index`, and
       *    returns an object containing the section `jargon` and the
       *    `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{jargon:SectionJargon,lastIndex:number}}
       */
      processSection(source, index) {
        const regExp = new RegExp($.SectionD·J.source, "uy");
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
            sectionPath,
            sectionCountTo,
            sectionTextTo,
          } =
            /** @type {{sectionPath:string,sectionName:string,[index:string]:string|undefined}} */ (
              parseResult.groups
            );
          const path = welformedSigils(sectionPath);
          const sigil = path.substring(path.lastIndexOf("/") + 1);
          return {
            jargon: {
              nodeType: NODE_TYPE.SECTION,
              contentModel: sectionTextTo != null
                ? CONTENT_MODEL.TEXT
                : CONTENT_MODEL.MIXED,
              sigil,
              path,
              qualifiedName: welformedName(sectionName, { index }),
              attributes: parseAttributes(sectionAttributes ?? null, {
                index,
              }),
              countTo: sectionCountTo != null
                ? new Set(
                  sectionCountTo.split($.S).map(
                    (name) => welformedName(name, { index }),
                  ),
                )
                : null,
              textTo: sectionTextTo != null
                ? new Set(
                  sectionTextTo.split($.S).map(
                    (name) => welformedName(name, { index }),
                  ),
                )
                : null,
              heading: sectionHeadingName != null
                ? {
                  nodeType: NODE_TYPE.HEADING,
                  contentModel: CONTENT_MODEL.INLINE,
                  sigil,
                  path: path.replace(
                    new RegExp(
                      `//(${$.SigilD·J.source})$`,
                      "u",
                    ),
                    " $1",
                  ).replace(
                    new RegExp(
                      `/(${$.SigilD·J.source})$`,
                      "u",
                    ),
                    ">$1",
                  ).replace(
                    new RegExp(
                      `^(${$.SigilD·J.source})$`,
                      "u",
                    ),
                    "* $1",
                  ),
                  qualifiedName: welformedName(
                    sectionHeadingName,
                    { index },
                  ),
                  attributes: parseAttributes(
                    sectionHeadingAttributes ?? null,
                    { index },
                  ),
                  countTo: sectionHeadingCountTo != null
                    ? new Set(
                      sectionHeadingCountTo.split($.S).map(
                        (name) => welformedName(name, { index }),
                      ),
                    )
                    : null,
                }
                : null,
            },
            lastIndex: regExp.lastIndex,
          };
        }
      },

      /**
       *  Extracts a `HeadingD·J` from `source` at `index`, and
       *    returns an object containing the heading `jargon` and the
       *    `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{jargon:HeadingJargon,lastIndex:number}}
       */
      processHeading(source, index) {
        const regExp = new RegExp($.HeadingD·J.source, "uy");
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
            headingSectionPath,
            headingSectionStrict,
            headingSigil,
          } =
            /** @type {{headingSigil:string,headingName:string,[index:string]:string|undefined}} */ (
              parseResult.groups
            );
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
                ].join(""),
              ),
              qualifiedName: welformedName(headingName, { index }),
              attributes: parseAttributes(headingAttributes ?? null, {
                index,
              }),
              countTo: headingCountTo != null
                ? new Set(
                  headingCountTo.split($.S).map(
                    (name) => welformedName(name, { index }),
                  ),
                )
                : null,
            },
            lastIndex: regExp.lastIndex,
          };
        }
      },

      /**
       *  Extracts a `BlockD·J` from `source` at `index`, and returns
       *    an object containing the block `jargon` and the
       *    `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{jargon:BlockJargon,lastIndex:number}}
       */
      processBlock(source, index) {
        const regExp = new RegExp($.BlockD·J.source, "uy");
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
            blockSectionPath,
            blockSectionStrict,
            blockSigil,
            blockSpecial,
          } =
            /** @type {{blockSpecial:"COMMENT"|"LITERAL"|undefined,[index:string]:string|undefined}} */ (
              parseResult.groups
            );
          const definitelyExtantBlockPath = /** @type {string} */ (
            blockPath ?? blockSigil
          );
          return {
            jargon: {
              nodeType: NODE_TYPE.BLOCK,
              contentModel: blockFinal != null
                ? CONTENT_MODEL.INLINE
                : blockSpecial != null
                ? CONTENT_MODEL[blockSpecial]
                : CONTENT_MODEL.MIXED,
              sigil: welformedSigils(
                blockSigil ?? definitelyExtantBlockPath.substring(
                  definitelyExtantBlockPath.lastIndexOf("/") + 1,
                ),
              ),
              path: welformedSigils(
                [
                  blockSectionPath ?? "*",
                  blockSectionStrict ?? " ",
                  definitelyExtantBlockPath,
                ].join(""),
              ),
              qualifiedName: blockName != null
                ? welformedName(blockName, { index })
                : null,
              attributes: parseAttributes(blockAttributes ?? null, {
                index,
              }),
              isDefault: blockSigil != null,
              inList: blockListName != null
                ? {
                  nodeType: NODE_TYPE.BLOCK,
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
                }
                : null,
            },
            lastIndex: regExp.lastIndex,
          };
        }
      },

      /**
       *  Extracts an `InlineD·J` from `source` at `index`, and
       *    returns an object containing the inline `jargon` and the
       *    `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{jargon:InlineJargon,lastIndex:number}}
       */
      processInline(source, index) {
        const regExp = new RegExp($.InlineD·J.source, "uy");
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
          } =
            /** @type {{inlinePath:string,inlineSpecial:"COMMENT"|"LITERAL"|undefined,[index:string]:string|undefined}} */ (
              parseResult.groups
            );
          const sectionDefined = inlineBlockPath != null ||
            inlineBlockAny != null;
          return {
            jargon: {
              nodeType: NODE_TYPE.INLINE,
              contentModel: inlineFinal != null || inlineTextTo
                ? CONTENT_MODEL.TEXT
                : inlineSpecial != null
                ? CONTENT_MODEL[inlineSpecial]
                : CONTENT_MODEL.INLINE,
              sigil: welformedSigils(
                inlinePath.substring(inlinePath.lastIndexOf("/") + 1),
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
                ].join(""),
              ),
              qualifiedName: inlineName != null
                ? welformedName(inlineName, { index })
                : null,
              attributes: parseAttributes(inlineAttributes ?? null, {
                index,
              }),
              textFrom: inlineTextFrom != null
                ? welformedName(inlineTextFrom, { index })
                : null,
              textTo: inlineTextTo != null
                ? new Set(
                  inlineTextTo.split($.S).map(
                    (name) => welformedName(name, { index }),
                  ),
                )
                : null,
            },
            lastIndex: regExp.lastIndex,
          };
        }
      },

      /**
       *  Extracts an `AttributeD·J` from `source` at `index`, and
       *    returns an object containing the attribute `jargon` and
       *    the `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{jargon:AttributeJargon[],lastIndex:number}}
       */
      processAttribute(source, index) {
        const regExp = new RegExp($.AttributeD·J.source, "uy");
        regExp.lastIndex = index;
        const parseResult = regExp.exec(source);
        if (parseResult == null) {
          //  There is not an attribute declaration at `index` in
          //    `source`.
          return null;
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
          } =
            /** @type {{attributeSigil:string,attributeNames:string,[index:string]:string|undefined}} */ (
              parseResult.groups
            );
          const sectionDefined =
            //  Implies other paths are also defined.
            attributeInlinePath != null || attributeInlineAny != null;
          const blockDefined = attributeBlockOrInlinePath != null ||
            attributeBlockOrInlineAny != null;
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
            ].join(""),
          );
          return {
            jargon: attributeNames.split($.S).map((name) => ({
              nodeType: NODE_TYPE.ATTRIBUTE,
              contentModel: CONTENT_MODEL.TEXT,
              sigil: welformedSigils(attributeSigil),
              path,
              qualifiedName: welformedName(name, { index }),
            })),
            lastIndex: regExp.lastIndex,
          };
        }
      },

      /**
       *  Extracts a `Comment` from `source` at `index`, and returns an
       *    object containing the `lastIndex` of the match.
       *
       *  @argument {string} source
       *  @argument {number} index
       *  @returns {?{lastIndex:number}}
       */
      processComment(source, index) {
        const regExp = new RegExp($.Comment.source, "uy");
        regExp.lastIndex = index;
        return regExp.test(source)
          ? { lastIndex: regExp.lastIndex }
          : null;
      },
    };
  })();

  /**
   *  @argument {string} source
   *  @argument {{DOMParser:typeof globalThis.DOMParser,systemIdentifiers:{[index:string]:string}|Map<string,string>,[nestedWithin]?:Set<string>}} [options]
   *  @returns {{input:string,jargon:null,lastIndex:-1}|{input:string,jargon:InstanceType<typeof Jargon>,lastIndex:number}}
   */
  return function process(source, options = {
    DOMParser: globalThis.DOMParser,
    systemIdentifiers: {},
  }) {
    //  Ensure source begins with a Declaration of Jargon.
    //  Otherwise, return early.
    if (!source.startsWith("<?market-commons")) {
      return { input: source, jargon: null, lastIndex: -1 };
    }

    //  Set up data storage.
    let jargon = new Jargon();

    //  Handle options.
    const DOMParser = options?.DOMParser ?? globalThis?.DOMParser;
    if (typeof DOMParser != "function") {
      throw new ConfigurationError(
        "No D·O·M Parser constructor supplied.",
      );
    }
    const systemIdentifiers = options?.systemIdentifiers ?? {};
    const systemIdentifierMap = systemIdentifiers instanceof Map
      ? systemIdentifiers
      : new Map(Object.entries(systemIdentifiers));

    //  Parse and process.
    const regExp = new RegExp($.D·J.source, "duy");
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
            case !(
              externalD·J = systemIdentifierMap.get(externalName)
            ): {
              break;
            }
            case !(
              externalD·J = defaultSystemIdentifierMap.get(
                externalName,
              )
            ): {
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
            //  Attempt to process the external Declaration of
            //    Jargon and replace `jargon` with that of the
            //    result.
            externalD·J = prepareAsX·M·L(externalD·J ?? "");
            const externalResult = process(externalD·J, {
              ...options,
              [nestedWithin]: new Set(
                options?.[nestedWithin] ?? [],
              ).add(externalName),
            });
            if (
              externalResult == null ||
              externalResult.lastIndex != externalD·J.length
            ) {
              //  External Declarations of Jargon must consist of
              //    *only* and *exactly* one `D·J`.
              throw new ParseError("Not welformed.", { index: 0 });
            } else {
              jargon = /** @type {InstanceType<typeof Jargon>} */ (
                externalResult.jargon
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
                jargon.namespaces.set(
                  result.prefix,
                  result.literal,
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
                  jargon,
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
                addJargonToSigilMap(
                  jargon[NODE_TYPE.SECTION],
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
                addJargonToSigilMap(
                  jargon[NODE_TYPE.HEADING],
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
                addJargonToSigilMap(
                  jargon[NODE_TYPE.BLOCK],
                  value,
                );
                if (value.isDefault) {
                  //  This is a default block declaration.
                  //  Record it in the defaults map!
                  const pathMap =
                    /** @type {Map<string,BlockJargon>} */ (
                      jargon[
                        NODE_TYPE.BLOCK
                      ].get("#DEFAULT")
                    );
                  pathMap.set(
                    value.path.substring(
                      0,
                      /[ >][^ >]*$/u.exec(value.path)?.index ??
                        undefined,
                    ) + ">#DEFAULT",
                    value,
                  );
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
                addJargonToSigilMap(
                  jargon[NODE_TYPE.INLINE],
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
                //  This code is more complicated than the generic
                //    case because the same sigil can signify multiple
                //    attributes.
                for (const value of result.jargon) {
                  const { path, sigil } = value;
                  const sigilMap = jargon[NODE_TYPE.ATTRIBUTE];
                  const attributeMap = sigilMap.get(sigil);
                  if (attributeMap !== undefined) {
                    //  There is already an attribute with this
                    //    `sigil`; add `value` to the appropriate `Set`
                    //    in the existing `Map`.
                    const attributes = attributeMap.get(path);
                    if (attributes !== undefined) {
                      attributes.add(value);
                    } else {
                      attributeMap.set(path, new Set([value]));
                    }
                  } else {
                    //  Create a new `Map` for this `sigil` and add
                    //    `value` to it.
                    sigilMap.set(
                      sigil,
                      new Map([[path, new Set([value])]]),
                    );
                  }
                }
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

    //  Return.
    return { input: source, jargon, lastIndex: regExp.lastIndex };
  };
})();
