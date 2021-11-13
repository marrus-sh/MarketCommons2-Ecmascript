//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: paths.js
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
//  This module contains Market Commons ⅠⅠ sigil path processing
//    utilities.

import { ParseError } from "./errors.js";
import { CharRef, NCName, SigilD·J, SigilD·JPath } from "./syntax.js";

/**
 *  Builds a regular expression from the provided `glob` for matching
 *    (completely specified) paths.
 *
 *  @argument {string} glob
 *  @returns {RegExp}
 */
export function globRegExp(glob) {
  return new RegExp(
    "^" + String(glob).replace(
      //  Escape regular expression special characters except for
      //    asterisk, which has a special meaning in paths and
      //    will be handled later.
      //  These characters shouldn’t ever appear in paths anyway!
      /[.+\-?^${}()|[\]\\]/gu,
      "\\$&",
    ).replace(
      //  Any number of same‐type nodes may precede the path.
      /^/u,
      "(?:*/)?",
    ).replace(
      //  Space adds an optional asterisk to the end of what
      //    precedes and the beginning of what follows.
      / /gu,
      "(?:/*)?>(?:*/)?",
    ).replace(
      //  Double slash becomes a plain slash optionally followed
      //    by an asterisk slash.
      /\/\//gu,
      "/(?:*/)?",
    ).replace(
      //  Asterisks match some number of sigils or specials, separated
      //    by slashes.
      /\*/gu,
      `(?:${SigilD·J.source}|#${NCName.source})(?:/(?:${SigilD·J.source}|#${NCName.source}))*`,
    ) + "$",
    "u",
  );
}

/**
 *  Normalizes all `CharRef`s in the provided `path` to use the decimal
 *    (not hexadecimal) format.
 *
 *  @argument {string} path
 *  @returns {string}
 */
export function normalizeReferences(path) {
  return String(path).replace(
    //  Fix character reference with leading zeroes.
    /&#(0[0-9]+);/gu,
    (_, decimal) => `&#${parseInt(decimal)};`,
  ).replace(
    //  Fix character reference with hexadecimal.
    /&#x([0-9A-Fa-f]+);/gu,
    (_, hex) => `&#${parseInt(hex, 16)};`,
  );
}

/**
 *  Returns a regular expression for matching a single of the provided
 *    `sigil`.
 *
 *  @argument {string} sigil
 *  @returns {RegExp}
 */
export function sigilToRegExp(sigil) {
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
  return new RegExp(sigilRegExpSource, "u");
}

/**
 *  Throws an error if the provided `path` is not welformed; otherwise,
 *    returns the normalized form.
 *
 *  @argument {string} path
 *  @argument {{index?:number}} [options]
 *  @returns {string}
 */
export function welformedPath(path, options = {}) {
  const normalizedPath = normalizeReferences(path);
  if (!new RegExp(`^${SigilD·JPath.source}$`, "u").test(path)) {
    throw new ParseError(
      `"${path}" is not a sigil path.`,
      options,
    );
  } else {
    for (
      const charRef of normalizedPath.matchAll(
        new RegExp(CharRef.source, "g"),
      )
    ) {
      if (/^(?:&#32;|&#9;|&#10;|&#13;|&#124;)$/u.test(charRef[0])) {
        //  A sigil may not contain a character indicating `S` or
        //    `'|'` [🆐B‐1].
        throw new ParseError(
          `Whitespace and "|" characters are not allowed in sigils.`,
          options,
        );
      } else {
        continue;
      }
    }
    return normalizedPath;
  }
}
