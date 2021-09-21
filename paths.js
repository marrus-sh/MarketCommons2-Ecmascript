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

import { SigilD·J } from "./syntax.js";

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
      //  Asterisks match some number of sigils, separated by
      //    slashes.
      /\*/gu,
      `${SigilD·J.source}(?:/${SigilD·J.source})*`,
    ) + "$",
  );
}

/**
 *  Returns a `Set` of all the keys in `sigilMap` which can match
 *    the provided `path` in at least some fashion.
 *
 *  @argument {string} path
 *  @argument {Map<string,Map<string,any>>} sigilMap
 *  @returns {Set<string>}
 */
export function sigilsInScope(path, sigilMap) {
  const result = new Set();
  checkingSigils:
  for (const [sigil, pathMap] of sigilMap) {
    if (sigil == "#DEFAULT") {
      //  `#DEFAULT` is not a proper sigil and won’t be returned
      //    by this function.
      continue checkingSigils;
    } else {
      //  `sigil` is ordinary and proper.
      const pathWithSigil = />$/u.test(path)
        ? `${path}${sigil}`
        : `${path}/${sigil}`;
      for (const glob of pathMap.keys()) {
        if (globRegExp(glob).test(pathWithSigil)) {
          result.add(sigil);
          continue checkingSigils;
        }
      }
    }
  }
  return result;
}
