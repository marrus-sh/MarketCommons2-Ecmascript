//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: chunks.js
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
//  This module contains code pertaining to chunks of Market Commons ⅠⅠ
//    source code.

import "./jargons.js";
import { ParseError } from "./errors.js";
import "./lines.js";
import { sigilToRegExp } from "./paths.js";
import { CONTENT_MODEL, NODE_TYPE } from "./symbols.js";

/** @typedef {import("./errors.js").ErrorOptions} ErrorOptions */
/** @typedef {import("./jargons.js").Jargon} Jargon */
/** @typedef {import("./jargons.js").SectionJargon} SectionJargon */
/** @typedef {import("./jargons.js").HeadingJargon} HeadingJargon */
/** @typedef {import("./jargons.js").BlockJargon} BlockJargon */
/** @typedef {import("./lines.js").Line} Line */
/** @typedef {import("./symbols.js").SECTION_NODE} SECTION_NODE */
/** @typedef {import("./symbols.js").HEADING_NODE} HEADING_NODE */
/** @typedef {import("./symbols.js").BLOCK_NODE} BLOCK_NODE */
/** @typedef {import("./symbols.js").MIXED_CONTENT} MIXED_CONTENT */
/** @typedef {import("./symbols.js").TRANSPARENT_CONTENT} TRANSPARENT_CONTENT */
/** @typedef {import("./symbols.js").INLINE_CONTENT} INLINE_CONTENT */
/** @typedef {import("./symbols.js").TEXT_CONTENT} TEXT_CONTENT */
/** @typedef {import("./symbols.js").COMMENT_CONTENT} COMMENT_CONTENT */
/** @typedef {import("./symbols.js").LITERAL_CONTENT} LITERAL_CONTENT */

/**
 *  @argument {Jargon} jargon
 *  @argument {{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}} attributes
 *  @argument {string} name
 *  @argument {string} value
 *  @argument {ErrorOptions&{path?:string}} options
 */
function addValueToAttributes(
  jargon,
  attributes,
  name,
  value,
  options,
) {
  if (name in attributes) {
    const existing = attributes[name];
    Object.defineProperty(attributes, name, {
      value: Object.freeze({
        ...existing,
        value: `${existing.value} ${value}`,
      }),
    });
  } else {
    const {
      localName,
      namespace,
    } = jargon.resolveQName(name, false, options);
    Object.defineProperty(attributes, name, {
      configurable: true,
      enumerable: true,
      value: Object.freeze({
        localName,
        namespace,
        value,
      }),
      writable: false,
    });
  }
}

export class Chunk {
  /**
   *  Makes a new “chunk” object from the provided (trimmed) `line` at
   *    the provided `path`.
   *
   *  If `hint` is `NODE_TYPE.HEADING`, this is the `#HEADING` of a
   *    section block.
   *  If `hint` is `NODE_TYPE.BLOCK`, this is a nested block.
   *
   *  @argument {Jargon} jargon
   *  @argument {string} path
   *  @argument {Line} line
   *  @argument {SECTION_NODE|HEADING_NODE|BLOCK_NODE} [hint]
   */
  constructor(jargon, path, line, hint = NODE_TYPE.BLOCK) {
    //  Define initial values for instance properties.
    const defaultSigil = hint == NODE_TYPE.HEADING
      ? "#HEADING"
      : hint == NODE_TYPE.BLOCK
      ? "#CONTENT"
      : "#DEFAULT";
    this.jargon = jargon;
    /** @type {SECTION_NODE|HEADING_NODE|BLOCK_NODE} */
    this.nodeType = hint == NODE_TYPE.HEADING
      ? NODE_TYPE.HEADING
      : NODE_TYPE.BLOCK;
    /** @type {MIXED_CONTENT|TRANSPARENT_CONTENT|INLINE_CONTENT|TEXT_CONTENT|COMMENT_CONTENT|LITERAL_CONTENT} */
    this.contentModel = hint == NODE_TYPE.SECTION
      ? CONTENT_MODEL.MIXED
      : CONTENT_MODEL.INLINE;
    this.path = `${path}>${defaultSigil}`;
    this.sigil = defaultSigil;
    this.localName = "";
    this.qualifiedName = "";
    this.namespace = null;
    this.count = 0;
    this.level = (path.match(/[^/]+/gu)?.length ?? 0) + 1;
    /** @type {Readonly<{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}>} */
    this.attributes = Object.freeze(Object.create(null));
    /** @type {?{localName:string,qualifiedName:string,namespace:?string,attributes:Readonly<{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}>}} */
    this.listWrapper = null;
    /** @type {Readonly<Readonly<Chunk>[]>|Readonly<Readonly<Line>[]>} */
    this.children = Object.freeze([]);

    //  Process the chunk.
    if (hint == NODE_TYPE.HEADING) {
      //  Whether nested headings contain attributes or not cannot be
      //    determined from the presently available information.
      //  The attributes and children of this chunk will be overwritten
      //    in `Chunk::#configureAsSectionFromFirstLine()`, below.
      /*  do nothing  */
    } else if (
      hint == NODE_TYPE.SECTION && /^(?:\|[ \t]*)+$/.test(String(line))
    ) {
      //  This chunk is a section closer.
      const count = Array.from(line.matchAll(/\|/gu)).length;
      this.nodeType = NODE_TYPE.SECTION;
      this.path = this.sigil = "#CLOSING";
      this.count = this.level = count;
    } else {
      //  See if `line` begins with a section, heading, or block sigil.
      //  If it does, build the chunk accordingly.
      //  If it doesn’t, the chunk is a default block.
      processingSigil: {
        for (
          const nodeType
            of /** @type {(SECTION_NODE|HEADING_NODE|BLOCK_NODE)[]} */ (
              hint == NODE_TYPE.BLOCK ? [NODE_TYPE.BLOCK] : [
                NODE_TYPE.SECTION,
                NODE_TYPE.HEADING,
                NODE_TYPE.BLOCK,
              ]
            )
        ) {
          const sigilInfo = line.countSigils(
            jargon,
            nodeType,
            nodeType == NODE_TYPE.SECTION
              ? ""
              : hint == NODE_TYPE.BLOCK
              ? path
              : `${path}>`,
          );
          if (sigilInfo != null) {
            //  Some sigil matches, so process the resulting first line.
            //  The `level` of the chunk is one greater than the number
            //    of items in its path.
            //  This is set to its `count` for sections.
            this.nodeType = nodeType;
            const { sigil, count, lastIndex } = sigilInfo;
            this.path = nodeType == NODE_TYPE.SECTION
              ? `${sigil}`
              : nodeType == NODE_TYPE.BLOCK && hint == NODE_TYPE.BLOCK
              ? `${path}/${sigil}`
              : `${path}>${sigil}`;
            this.sigil = sigil;
            this.count = count;
            this.level = nodeType == NODE_TYPE.SECTION
              ? count
              : (path.match(/[^\/>]+/gu)?.length ?? 0) + 1;
            switch (nodeType) {
              case NODE_TYPE.SECTION: {
                this.#configureAsSectionFromFirstLine(line, lastIndex);
                break processingSigil;
              }
              case NODE_TYPE.HEADING: {
                this.#configureAsHeadingFromFirstLine(line, lastIndex);
                break processingSigil;
              }
              case NODE_TYPE.BLOCK: {
                this.#configureAsBlockFromFirstLine(line, lastIndex);
                break processingSigil;
              }
              default: {
                throw new ParseError(
                  "Unexpected node type for chunk.",
                  { line: line.index },
                );
              }
            }
          } else {
            //  The sigil does not match.
            continue;
          }
        }
        if (hint == NODE_TYPE.BLOCK) {
          //  This is not a chunk.
          throw new TypeError("Not a chunk.");
        } else {
          //  This is a default chunk.
          this.#configureAsBlockFromFirstLine(line, 0);
        }
      }
    }

    //  Make properties nonwritable to prevent accidental setting.
    Object.defineProperties(this, {
      jargon: { writable: false },
      nodeType: { writable: false },
      contentModel: { writable: false },
      path: { writable: false },
      sigil: { writable: false },
      localName: { writable: false },
      qualifiedName: { writable: false },
      namespace: { writable: false },
      count: { writable: false },
      level: { writable: false },
      attributes: { writable: false },
      children: { writable: false },
    });
  }

  /**
   *  Configures this `Chunk` as a section chunk according to the
   *    provided `line`.
   *
   *  @argument {Line} line
   *  @argument {number} indexAfterSigils
   */
  #configureAsSectionFromFirstLine(line, indexAfterSigils) {
    //  Set up variables and get the section definition.
    const { count, jargon, path, sigil } = this;
    const definition = /** @type {Readonly<SectionJargon>} */ (
      jargon.resolve(NODE_TYPE.SECTION, path, { line: line.index })
    );
    /** @type {MIXED_CONTENT|TEXT_CONTENT} */
    const contentModel = definition.contentModel;
    const qualifiedName = definition.qualifiedName;
    const { localName, namespace } = jargon.resolveQName(
      qualifiedName,
      true,
      { line: line.index, path },
    );

    //  Initial setup.
    this.localName = localName;
    this.namespace = namespace;
    this.qualifiedName = qualifiedName;
    this.contentModel = contentModel;
    const attributes = this.attributes = jargon.resolveAttributes(
      definition.attributes,
      { line: line.index, path },
    );

    //  Handle section attributes.
    const prefixRegExp = new RegExp(
      String.raw`^(?<attributes>\{[^}]*\})[ \t]*`,
      "yu",
    );
    prefixRegExp.lastIndex = indexAfterSigils;
    const attributesText = prefixRegExp.exec(String(line))?.groups
      ?.attributes;
    const [parsedAttributes, remainder] =
      /** @type {[{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}|undefined,Readonly<Line>]} */ (
        (() => {
          if (attributesText != null) {
            try {
              return [
                jargon.parseAttributesContainer(
                  path,
                  attributesText,
                  undefined,
                  { line: line.index },
                ),
                Object.freeze(line.substring(prefixRegExp.lastIndex)),
              ];
            } catch {
              return [
                ,
                Object.freeze(line.substring(indexAfterSigils)),
              ];
            }
          } else {
            return [, Object.freeze(line.substring(indexAfterSigils))];
          }
        })()
      );
    definition.textTo?.forEach((name) =>
      addValueToAttributes(
        jargon,
        attributes,
        name,
        String(remainder),
        { line: line.index, path },
      )
    );
    definition.countTo?.forEach((name) =>
      addValueToAttributes(
        jargon,
        attributes,
        name,
        String(count),
        { line: line.index, path },
      )
    );
    if (parsedAttributes != null) {
      for (
        const [key, attribute] of Object.entries(parsedAttributes)
      ) {
        if (key in attributes) {
          const existing = attributes[key];
          Object.defineProperty(attributes, key, {
            value: Object.freeze({
              ...existing,
              value: `${existing.value} ${attribute.value}`,
            }),
          });
        } else {
          Object.defineProperty(attributes, key, {
            configurable: true,
            enumerable: true,
            value: attribute,
            writable: false,
          });
        }
      }
    }
    Object.freeze(attributes);

    //  Process section content.
    const headingDefinition = definition.heading;
    if (headingDefinition != null && String(remainder) != "") {
      //  Set up heading.
      const heading = new Chunk(
        jargon,
        path,
        remainder,
        NODE_TYPE.HEADING,
      );
      const headingQName = headingDefinition.qualifiedName;
      const {
        localName: headingLocalName,
        namespace: headingNamespace,
      } = jargon.resolveQName(headingQName, true, {
        line: line.index,
        path: heading.path,
      });
      const headingAttributes = jargon.resolveAttributes(
        headingDefinition.attributes,
        { line: line.index, path: heading.path },
      );
      headingDefinition.countTo?.forEach((name) =>
        addValueToAttributes(
          jargon,
          headingAttributes,
          name,
          String(count),
          { line: line.index, path: heading.path },
        )
      );
      Object.defineProperties(heading, {
        count: { value: count },
        localName: { value: headingLocalName },
        qualifiedName: { value: headingQName },
        namespace: { value: headingNamespace },
        attributes: { value: headingAttributes },
      });

      //  Handle heading attributes and content.
      const suffixMatch = new RegExp(
        String.raw`[ \t]*(?:${
          sigilToRegExp(sigil).source
        }[ \t]*)+(?<attributes>\{[^}]*\})?$`,
        "u",
      ).exec(String(remainder));
      const headingAttributesText = suffixMatch?.groups?.attributes;
      if (headingAttributesText != null) {
        try {
          jargon.parseAttributesContainer(
            heading.path,
            headingAttributesText,
            headingAttributes,
            { line: line.index },
          );
          Object.defineProperty(heading, "children", {
            value: Object.freeze([
              Object.freeze(
                remainder.substring(0, suffixMatch?.index),
              ),
            ]),
          });
        } catch {
          this.children = Object.freeze([remainder]);
        }
      } else {
        Object.defineProperty(heading, "children", {
          value: Object.freeze([
            Object.freeze(
              remainder.substring(0, suffixMatch?.index),
            ),
          ]),
        });
      }
      Object.freeze(headingAttributes);

      //  Nest heading inside section.
      this.children = Object.freeze([Object.freeze(heading)]);
    }
  }

  /**
   *  Configures this `Chunk` as a heading chunk according to the
   *    provided `line`.
   *
   *  @argument {Line} line
   *  @argument {number} indexAfterSigils
   */
  #configureAsHeadingFromFirstLine(line, indexAfterSigils) {
    //  Set up variables and get the heading definition.
    const { count, jargon, path, sigil } = this;
    const definition = /** @type {Readonly<HeadingJargon>} */ (
      jargon.resolve(NODE_TYPE.HEADING, path, { line: line.index })
    );
    const qualifiedName = definition.qualifiedName;
    const { localName, namespace } = jargon.resolveQName(
      qualifiedName,
      true,
      { line: line.index, path },
    );
    const remainder = Object.freeze(line.substring(indexAfterSigils));

    //  Initial setup.
    this.localName = localName;
    this.namespace = namespace;
    this.qualifiedName = qualifiedName;
    this.contentModel = /** @type {INLINE_CONTENT} */ (
      definition.contentModel
    );
    const attributes = this.attributes = jargon.resolveAttributes(
      definition.attributes,
      { line: line.index, path },
    );
    definition.countTo?.forEach((name) =>
      addValueToAttributes(
        jargon,
        attributes,
        name,
        String(count),
        { line: line.index, path },
      )
    );

    //  Handle heading attributes and content.
    const suffixMatch = new RegExp(
      String.raw`[ \t]*(?:${
        sigilToRegExp(sigil).source
      }[ \t]*)+(?<attributes>\{[^}]*\})?$`,
      "u",
    ).exec(String(remainder));
    const attributesText = suffixMatch?.groups?.attributes;
    if (attributesText != null) {
      try {
        jargon.parseAttributesContainer(
          path,
          attributesText,
          attributes,
          { line: line.index },
        );
        this.children = Object.freeze([
          Object.freeze(remainder.substring(0, suffixMatch?.index)),
        ]);
      } catch {
        this.children = Object.freeze([remainder]);
      }
    } else {
      this.children = Object.freeze([
        Object.freeze(remainder.substring(0, suffixMatch?.index)),
      ]);
    }
    Object.freeze(attributes);
  }

  /**
   *  Configures this `Chunk` as a block chunk according to the
   *    provided `line`.
   *
   *  @argument {Line} line
   *  @argument {number} indexAfterSigils
   */
  #configureAsBlockFromFirstLine(line, indexAfterSigils) {
    //  Set up variables and get the block definition.
    const { jargon, path, sigil } = this;
    const definition = /** @type {Readonly<BlockJargon>} */ (
      jargon.resolve(NODE_TYPE.BLOCK, path, { line: line.index })
    );
    /** @type {MIXED_CONTENT|TRANSPARENT_CONTENT|INLINE_CONTENT|COMMENT_CONTENT|LITERAL_CONTENT} */
    const contentModel = definition.contentModel;
    const qualifiedName = definition.qualifiedName;
    const { localName, namespace } = jargon.resolveQName(
      qualifiedName,
      true,
      { line: line.index, path },
    );

    //  Initial setup.
    this.localName = localName;
    this.namespace = namespace;
    this.qualifiedName = qualifiedName;
    this.contentModel = contentModel;
    const attributes = this.attributes = jargon.resolveAttributes(
      definition.attributes,
      { line: line.index, path },
    );

    //  Handle block attributes.
    const remainder = sigil == "#DEFAULT"
      ? Object.freeze(line.substring(indexAfterSigils))
      : (() => {
        const prefixRegExp = new RegExp(
          String.raw`^(?<attributes>\{[^}]*\})[ \t]*`,
          "yu",
        );
        prefixRegExp.lastIndex = indexAfterSigils;
        const attributesText = prefixRegExp.exec(String(line))?.groups
          ?.attributes;
        if (attributesText != null) {
          try {
            jargon.parseAttributesContainer(
              path,
              attributesText,
              attributes,
              { line: line.index },
            );
            return Object.freeze(
              line.substring(prefixRegExp.lastIndex),
            );
          } catch {
            return Object.freeze(line.substring(indexAfterSigils));
          }
        } else {
          return Object.freeze(line.substring(indexAfterSigils));
        }
      })();
    Object.freeze(attributes);

    //  Process block first line content.
    if (
      sigil != "#DEFAULT" && [
        CONTENT_MODEL.MIXED,
        CONTENT_MODEL.TRANSPARENT,
      ].includes(contentModel) && String(remainder) != ""
    ) {
      try {
        this.children = Object.freeze([
          new Chunk(jargon, path, remainder, NODE_TYPE.BLOCK),
        ]);
      } catch {
        this.children = Object.freeze([remainder]);
      }
    } else {
      this.children = Object.freeze([remainder]);
    }

    //  Handle `inList`.
    const listDefinition = definition.inList;
    if (listDefinition != null) {
      const listQName = listDefinition.qualifiedName;
      const {
        localName: listLocalName,
        namespace: listNamespace,
      } = jargon.resolveQName(listQName, true, {
        line: line.index,
        path: `${path}/#WRAPPER`,
      });
      this.listWrapper = Object.freeze({
        localName: listLocalName,
        qualifiedName: listDefinition.qualifiedName,
        namespace: listNamespace,
        attributes: jargon.resolveAttributes(
          listDefinition.attributes,
          { line: line.index, path },
        ),
      });
    }
  }
}
