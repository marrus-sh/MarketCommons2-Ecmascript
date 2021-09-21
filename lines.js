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
//  This module contains Market Commons ⅠⅠ line processing utilities.

/**
 *  A `String` object with an attached `index`.
 */
export class Line extends String {
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
}
