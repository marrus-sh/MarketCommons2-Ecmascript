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

const DOCUMENT_NODE_SYMBOL = Symbol("document");
const SECTION_NODE_SYMBOL = Symbol("section");
const HEADING_NODE_SYMBOL = Symbol("heading");
const BLOCK_NODE_SYMBOL = Symbol("block");
const INLINE_NODE_SYMBOL = Symbol("inline");
const ATTRIBUTE_NODE_SYMBOL = Symbol("attribute");

/** @typedef {typeof DOCUMENT_NODE_SYMBOL} DOCUMENT_NODE */
/** @typedef {typeof SECTION_NODE_SYMBOL} SECTION_NODE */
/** @typedef {typeof HEADING_NODE_SYMBOL} HEADING_NODE */
/** @typedef {typeof BLOCK_NODE_SYMBOL} BLOCK_NODE */
/** @typedef {typeof INLINE_NODE_SYMBOL} INLINE_NODE */
/** @typedef {typeof ATTRIBUTE_NODE_SYMBOL} ATTRIBUTE_NODE */

/**
 *  Types of node; either `SECTION`, `HEADING`, `BLOCK`, `INLINE`,
 *    or `ATTRIBUTE`.
 *
 *  These describe Market Commons ⅠⅠ nodes, not D·O·M ones.
 *
 *  @type {Readonly<{DOCUMENT:DOCUMENT_NODE,SECTION:SECTION_NODE,HEADING:HEADING_NODE,BLOCK:BLOCK_NODE,INLINE:INLINE_NODE,ATTRIBUTE:ATTRIBUTE_NODE}>}
 */
export const NODE_TYPE = Object.preventExtensions(
  Object.create(null, {
    DOCUMENT: {
      configurable: false,
      enumerable: true,
      value: DOCUMENT_NODE_SYMBOL,
      writable: false,
    },
    SECTION: {
      configurable: false,
      enumerable: true,
      value: SECTION_NODE_SYMBOL,
      writable: false,
    },
    HEADING: {
      configurable: false,
      enumerable: true,
      value: HEADING_NODE_SYMBOL,
      writable: false,
    },
    BLOCK: {
      configurable: false,
      enumerable: true,
      value: BLOCK_NODE_SYMBOL,
      writable: false,
    },
    INLINE: {
      configurable: false,
      enumerable: true,
      value: INLINE_NODE_SYMBOL,
      writable: false,
    },
    ATTRIBUTE: {
      configurable: false,
      enumerable: true,
      value: ATTRIBUTE_NODE_SYMBOL,
      writable: false,
    },
  }),
);

/*
Define content models.
*/

const MIXED_CONTENT_SYMBOL = Symbol("mixed");
const INLINE_CONTENT_SYMBOL = Symbol("inline");
const TEXT_CONTENT_SYMBOL = Symbol("text");
const COMMENT_CONTENT_SYMBOL = Symbol("comment");
const LITERAL_CONTENT_SYMBOL = Symbol("literal");

/** @typedef {typeof MIXED_CONTENT_SYMBOL} MIXED_CONTENT */
/** @typedef {typeof INLINE_CONTENT_SYMBOL} INLINE_CONTENT */
/** @typedef {typeof TEXT_CONTENT_SYMBOL} TEXT_CONTENT */
/** @typedef {typeof COMMENT_CONTENT_SYMBOL} COMMENT_CONTENT */
/** @typedef {typeof LITERAL_CONTENT_SYMBOL} LITERAL_CONTENT */

/**
 *  Types of content; either `MIXED`, `INLINE`, `TEXT`, `COMMENT`, or
 *    `LITERAL`.
 *
 *  @type {Readonly<{MIXED:MIXED_CONTENT,INLINE:INLINE_CONTENT,TEXT:TEXT_CONTENT,COMMENT:COMMENT_CONTENT,LITERAL:LITERAL_CONTENT}>}
 */
export const CONTENT_MODEL = Object.preventExtensions(
  Object.create(null, {
    MIXED: {
      configurable: false,
      enumerable: true,
      value: MIXED_CONTENT_SYMBOL,
      writable: false,
    },
    INLINE: {
      configurable: false,
      enumerable: true,
      value: INLINE_CONTENT_SYMBOL,
      writable: false,
    },
    TEXT: {
      configurable: false,
      enumerable: true,
      value: TEXT_CONTENT_SYMBOL,
      writable: false,
    },
    COMMENT: {
      configurable: false,
      enumerable: true,
      value: COMMENT_CONTENT_SYMBOL,
      writable: false,
    },
    LITERAL: {
      configurable: false,
      enumerable: true,
      value: LITERAL_CONTENT_SYMBOL,
      writable: false,
    },
  }),
);
