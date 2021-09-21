//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: symbols.js
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
//  This module contains various symbols used as constants during
//    Market Commons ⅠⅠ processing.

/*
Define node types.
*/

const DOCUMENT_NODE = Symbol("document");
const SECTION_NODE = Symbol("section");
const HEADING_NODE = Symbol("heading");
const BLOCK_NODE = Symbol("block");
const INLINE_NODE = Symbol("inline");
const ATTRIBUTE_NODE = Symbol("attribute");

/**
 *  Types of node; either `SECTION`, `HEADING`, `BLOCK`, `INLINE`,
 *    or `ATTRIBUTE`.
 *
 *  These describe Market Commons ⅠⅠ nodes, not D·O·M ones.
 *
 *  @type {{DOCUMENT:typeof DOCUMENT_NODE,SECTION:typeof SECTION_NODE,HEADING:typeof HEADING_NODE,BLOCK:typeof BLOCK_NODE,INLINE:typeof INLINE_NODE,ATTRIBUTE:typeof ATTRIBUTE_NODE}}
 */
export const NODE_TYPE = Object.preventExtensions(
  Object.create(null, {
    DOCUMENT: {
      configurable: false,
      enumerable: true,
      value: DOCUMENT_NODE,
      writable: false,
    },
    SECTION: {
      configurable: false,
      enumerable: true,
      value: SECTION_NODE,
      writable: false,
    },
    HEADING: {
      configurable: false,
      enumerable: true,
      value: HEADING_NODE,
      writable: false,
    },
    BLOCK: {
      configurable: false,
      enumerable: true,
      value: BLOCK_NODE,
      writable: false,
    },
    INLINE: {
      configurable: false,
      enumerable: true,
      value: INLINE_NODE,
      writable: false,
    },
    ATTRIBUTE: {
      configurable: false,
      enumerable: true,
      value: ATTRIBUTE_NODE,
      writable: false,
    },
  }),
);

/*
Define content models.
*/

const MIXED_CONTENT = Symbol("mixed");
const TRANSPARENT_CONTENT = Symbol("transparent");
const INLINE_CONTENT = Symbol("inline");
const TEXT_CONTENT = Symbol("text");
const COMMENT_CONTENT = Symbol("comment");
const LITERAL_CONTENT = Symbol("literal");

/**
 *  Types of content; either `MIXED`, `TRANSPARENT`, `INLINE`, `TEXT`,
 *    `COMMENT`, or `LITERAL`.
 *
 *  @type {{MIXED:typeof MIXED_CONTENT,TRANSPARENT:typeof TRANSPARENT_CONTENT,INLINE:typeof INLINE_CONTENT,TEXT:typeof TEXT_CONTENT,COMMENT:typeof COMMENT_CONTENT,LITERAL:typeof LITERAL_CONTENT}}
 */
export const CONTENT_MODEL = Object.preventExtensions(
  Object.create(null, {
    MIXED: {
      configurable: false,
      enumerable: true,
      value: MIXED_CONTENT,
      writable: false,
    },
    TRANSPARENT: {
      configurable: false,
      enumerable: true,
      value: TRANSPARENT_CONTENT,
      writable: false,
    },
    INLINE: {
      configurable: false,
      enumerable: true,
      value: INLINE_CONTENT,
      writable: false,
    },
    TEXT: {
      configurable: false,
      enumerable: true,
      value: TEXT_CONTENT,
      writable: false,
    },
    COMMENT: {
      configurable: false,
      enumerable: true,
      value: COMMENT_CONTENT,
      writable: false,
    },
    LITERAL: {
      configurable: false,
      enumerable: true,
      value: LITERAL_CONTENT,
      writable: false,
    },
  }),
);
