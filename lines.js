// 🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript ∷ lines.js
// ====================================================================
//
// Copyright © 2021, 2023 Margaret KIBI.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at <https://mozilla.org/MPL/2.0/>.
//
// ____________________________________________________________________
//
// This module contains code pertaining to lines of Market Commons ⅠⅠ
// source code.

import { trim, trimEnd, trimStart } from "./text.js";

/** A `String` object with an attached `index`. */
export class Line extends /** @type {ObjectConstructor} */ (
  /** @type {unknown} */ (String)
) {
  /**
   * Creates a `Line` with at provided `index` and which has a value of
   * the provided `contents`.
   *
   * @argument {number} index
   * @argument {string} contents
   */
  constructor(index, contents) {
    super(contents);
    this.index = index | 0;
    Object.defineProperty(this, index, { writable: false });
  }

  /**
   * Effectively the same as `String::slice`, but returns a `Line`.
   *
   * @argument {number} [start]
   * @argument {number} [end]
   * @returns {Line}
   */
  slice(start, end) {
    return new Line(
      this.index,
      String.prototype.slice.call(this, start, end),
    );
  }

  /**
   * Effectively the same as `String::split`, but returns an array of
   * `Line`s.
   *
   * @argument {{[Symbol.split]:(string:string,limit?:number|undefined)=>string[]}} separator
   * @argument {number} [limit]
   * @returns {Line[]}
   */
  split(separator, limit) {
    return String.prototype.split.call(this, separator, limit).map(
      ($) => new Line(this.index, $),
    );
  }

  /**
   * Effectively the same as `String::substring`, but returns a `Line`.
   *
   * @argument {number} start
   * @argument {number} [end]
   * @returns {Line}
   */
  substring(start, end) {
    return new Line(
      this.index,
      String.prototype.substring.call(this, start, end),
    );
  }

  /**
   * Effectively the same as `String::trim`, but returns a `Line`.
   *
   * This uses the X·M·L definition of whitespace, not the Ecmascript
   * one.
   *
   * @returns {Line}
   */
  trim() {
    return new Line(this.index, trim(`${this}`));
  }

  /**
   * Effectively the same as `String::trimEnd`, but returns a `Line`.
   *
   * This uses the X·M·L definition of whitespace, not the Ecmascript
   * one.
   *
   * @returns {Line}
   */
  trimEnd() {
    return new Line(this.index, trimEnd(`${this}`));
  }

  /**
   * Effectively the same as `String::trimStart`, but returns a `Line`.
   *
   * This uses the X·M·L definition of whitespace, not the Ecmascript
   * one.
   *
   * @returns {Line}
   */
  trimStart() {
    return new Line(this.index, trimStart(`${this}`));
  }
}
