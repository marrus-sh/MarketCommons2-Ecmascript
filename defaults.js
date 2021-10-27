//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: defaults.js
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
//  This module contains default values used when configuring the
//    Market Commons ⅠⅠ processor.

import htmlD·J from "./🆐/html.marketdj.js";
import { marketNamespace } from "./names.js";

/**
 *  The default Declaration of Jargon if none is supplied.
 */
export const declarationOfJargon =
  `<?market-commons 2.0 "${marketNamespace}/html"?>\n`;

/**
 *  The default object associating system identifiers with
 *    Declarations of Jargon.
 */
export const systemIdentifiers = Object.freeze(Object.assign(
  Object.create(null),
  { [`${marketNamespace}/html`]: htmlD·J },
));
