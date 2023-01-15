// 🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript ∷ attributes.js
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
// This module contains code pertaining to Market Commons ⅠⅠ attribute
// processing.

import "./errors.js";
import "./jargons.js";

/** @typedef {import("./errors.js").ErrorOptions} ErrorOptions */
/** @typedef {import("./jargons.js").Jargon} Jargon */

/**
 * Resolved attributes object.
 *
 * @typedef {{[index:string]:Readonly<{localName:string,namespace:?string,value:string}>}} ResolvedAttributes
 */

/**
 * Adds the provided `value` to the attribute with the provided `name`
 * to the provided `attributes` object, as resolved according to the
 * provided `jargon`.
 *
 * @argument {Jargon} jargon
 * @argument {ResolvedAttributes} attributes
 * @argument {string} name
 * @argument {string} value
 * @argument {ErrorOptions&{path?:string}} options
 */
export function addValueToAttributes(
  jargon,
  attributes,
  name,
  value,
  options,
) {
  if (name in attributes) {
    // There is already an existing attribute with the provided `name`
    // in the provided `attributes`.
    const existing = attributes[name];
    Object.defineProperty(attributes, name, {
      value: Object.freeze({
        ...existing,
        value: `${existing.value} ${value}`,
      }),
    });
  } else {
    // There is no existing attribute with the provided `name` in the
    // provided `attributes`; the name must be resolved and an
    // attribute added.
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
