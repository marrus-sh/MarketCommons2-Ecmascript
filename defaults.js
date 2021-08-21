//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: defaults.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Default values used when configuring the Market Commons ⅠⅠ
 *    processor.
 *
 *  @module MarketCommons2/defaults
 */

import htmlD·J from "./html.marketdj.js"
import { marketNamespace } from "./names.js"

/**
 *  The default `Map` mapping system identifiers to Declarations of
 *    Jargon.
 */
export const systemIdentifierMap = new Map ([
	[ `${ marketNamespace }/html`, htmlD·J ],
])
