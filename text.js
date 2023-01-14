// 🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript ∷ text.js
// ====================================================================
//
// Copyright © 2021 Margaret KIBI.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at <https://mozilla.org/MPL/2.0/>.
//
// ____________________________________________________________________
//
// This module contains various utility functions related to text
// processing.

import { ParseError } from "./errors.js";
import { NSAttName, QName, RestrictedChar, S } from "./syntax.js";

/** @typedef {import("./errors.js").ErrorOptions} ErrorOptions */

/**
 * Normalizes line endings in the provided `text` according to X·M·L
 * rules and returns the result.
 *
 * If `text` contains a literal character matching `RestrictedChar`,
 * throws. This function does *not* check to ensure `text` contains
 * only `Char`s; this requires an additional pass since it requires
 * handling surrogate pairs. However, it does catch U+0000, U+FFFE, and
 * U+FFFF.
 *
 *  @argument {string} text
 *  @returns {string}
 */
export const prepareAsXML = (text) =>
  // It’s okay to treat strings as arrays here because the codepoints
  // we are checking are all in the B·M·P.
  Array.prototype.map.call(text, ($, index) => {
    if (RestrictedChar.test($)) {
      // `RestrictedChar`s are not allowed to appear literally.
      throw new ParseError(
        `#x${
          $.charCodeAt(0).toString(16).toUpperCase()
        } is restricted from appearing literally in documents.`,
        { index },
      );
    } else if (
      //deno-lint-ignore no-control-regex
      /[\u{0}\u{FFFE}\u{FFFF}]/u.test($)
    ) {
      // U+0000, U+FFFE, and U+FFFF are not allowed, period.
      throw new ParseError(
        `#x${
          $.charCodeAt(0).toString(16).toUpperCase()
        } is not allowed in documents.`,
        { index },
      );
    } else {
      // Normalize newlines, otherwise return the character.
      if ($ == "\u{D}") {
        // Carriage·return may be followed by a newline.
        return "\u{A}\u{85}".includes(text[index + 1]) ? "" : "\u{A}";
      } else {
        // Normalize other newlines to U+000A.
        return "\u{85}\u{2028}".includes($) ? "\u{A}" : $;
      }
    }
  }).join("");

/**
 * Trims X·M·L whitespace from the beginning and end of the provided
 * `text` and returns the result.
 *
 * This differs from `String.prototype.trim()`, which has a more
 * expansive definition of “whitespace”.
 *
 * @argument {string} text
 * @returns {string}
 */
export const trim = (text) =>
  new RegExp(`^${S.source}?([^]*?)${S.source}?$`, "u").exec(
    text,
  )?.[1] ?? "";

/**
 * Trims X·M·L whitespace from the end of the provided `text` and
 * returns the result.
 *
 * This differs from `String.prototype.trimEnd()`, which has a more
 * expansive definition of “whitespace”.
 *
 * @argument {string} text
 * @returns {string}
 */
export const trimEnd = (text) =>
  new RegExp(`^([^]*?)${S.source}?$`, "u").exec(text)?.[1] ?? "";

/**
 * Trims X·M·L whitespace from the beginning of the provided `text` and
 * returns the result.
 *
 * This differs from `String.prototype.trimStart()`, which has a more
 * expansive definition of “whitespace”.
 *
 * @argument {string} text
 * @returns {string}
 */
export const trimStart = (text) =>
  new RegExp(`^${S.source}?([^]*?)$`, "u").exec(text)?.[1] ?? "";

/**
 * Throws an error if the provided `qualifiedName` is not welformed;
 * otherwise, simply returns it.
 *
 * @argument {string} qualifiedName
 * @argument {ErrorOptions} [options]
 * @returns {string}
 */
export const welformedName = (qualifiedName, options = {}) => {
  if (
    !new RegExp(`^${QName.source}$`, "u").test(qualifiedName) ||
    new RegExp(`^${NSAttName.source}$`, "u").test(qualifiedName)
  ) {
    // Names cannot match the `NSAttName` production [🆐A‐2][🆐E‐2]
    // [🆐F‐2][🆐G‐3][🆐H‐4][🆐I‐4].
    throw new ParseError(
      `"${qualifiedName}" cannot be used as a qualified name.`,
      options,
    );
  } else {
    // Simply return the name.
    return qualifiedName;
  }
};
