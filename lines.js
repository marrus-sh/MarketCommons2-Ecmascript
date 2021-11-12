//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: lines.js
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
//  This module contains code pertaining to lines of Market Commons ⅠⅠ
//    source code.

import /* for `typeof Jargon` */ "./dj.js";
import { sigilToRegExp } from "./paths.js";
import { NODE_TYPE } from "./symbols.js";
import { trim, trimEnd, trimStart } from "./text.js";

/**
 *  A `String` object with an attached `index`.
 */
export class Line extends /** @type {any} */ (String) {
  /**
   *  Creates a `Line` with at provided `index` and which has a value
   *    of the provided `contents`.
   *
   *  @argument {number} index
   *  @argument {string} contents
   */
  constructor(index, contents) {
    super(contents);
    this.index = index >> 0;
    Object.defineProperty(this, index, { writable: false });
  }

  /**
   *  Returns an object indicating the number of consecutive `sigil`s
   *    that begin this `Line`, starting from the offset given by the
   *    provided `lastIndex`, or `null` if none applies.
   *
   *  If `nodeType` is `NODE_TYPE.BLOCK`, `NODE_TYPE.INLINE`, or
   *    `NODE_TYPE.ATTRIBUTE`, a maximum of one sigil will be counted:
   *  The resulting `count` will be `1`.
   *
   *  @argument {import("./dj.js").Jargon} jargon
   *  @argument {typeof NODE_TYPE.SECTION|typeof NODE_TYPE.HEADING|typeof NODE_TYPE.BLOCK|typeof NODE_TYPE.INLINE|typeof NODE_TYPE.ATTRIBUTE} nodeType
   *  @argument {string} path
   *  @argument {number} [lastIndex]
   *  @returns {?{sigil:string,count:number,index:number,lastIndex:number}}
   */
  countSigils(jargon, nodeType, path, lastIndex = 0) {
    const index = lastIndex >> 0;
    /** @type {{[index:string]:?{sigil:string,count:number,index:number,lastIndex:number},"":null}} */
    const matches = Object.create(null, {
      "": {
        configurable: false,
        enumerable: false,
        value: null,
        writable: false,
      },
    });
    const string = String(this);
    for (const sigil of jargon.sigilsInScope(nodeType, path)) {
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
        } else {
          continue;
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
    return matches[
      Object.keys(matches).reduce(
        (best, next) => next.length > best.length ? next : best,
        "",
      )
    ];
  }

  /**
   *  Effectively the same as `String::slice`, but returns a `Line`.
   *
   *  @argument {number} [start]
   *  @argument {number} [end]
   *  @returns {Line}
   */
  slice(start, end) {
    return new Line(
      this.index,
      String.prototype.slice.call(this, start, end),
    );
  }

  /**
   *  Effectively the same as `String::split`, but returns an array of
   *    `Line`s.
   *
   *  @argument {{[Symbol.split]:(string:string,limit?:number|undefined)=>string[]}} separator
   *  @argument {number} [limit]
   *  @returns {Line[]}
   */
  split(separator, limit) {
    return String.prototype.split.call(this, separator, limit).map(
      ($) => new Line(this.index, $),
    );
  }

  /**
   *  Effectively the same as `String::substring`, but returns a
   *    `Line`.
   *
   *  @argument {number} start
   *  @argument {number} [end]
   *  @returns {Line}
   */
  substring(start, end) {
    return new Line(
      this.index,
      String.prototype.substring.call(this, start, end),
    );
  }

  /**
   *  Effectively the same as `String::trim`, but returns a `Line`.
   *
   *  @returns {Line}
   */
  trim() {
    return new Line(this.index, trim(String(this)));
  }

  /**
   *  Effectively the same as `String::trimEnd`, but returns a `Line`.
   *
   *  @returns {Line}
   */
  trimEnd() {
    return new Line(this.index, trimEnd(String(this)));
  }

  /**
   *  Effectively the same as `String::trimStart`, but returns a `Line`.
   *
   *  @returns {Line}
   */
  trimStart() {
    return new Line(this.index, trimStart(String(this)));
  }
}
