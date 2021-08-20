//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: fauxbrowser/mod.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Spoofs a browser well enough that Market Commons ⅠⅠ – Ecmascript
 *    will work in deno.
 *
 *  You’ll need to import this module, or provide your own solution, to
 *    get things working on the command line.
 *
 *  @module MarketCommons2/fauxbrowser
 */

import "./window.js"
import
	//  This is an old, archived script but it seems to do the job.
	"https://raw.githubusercontent.com/Krinkle/dom-TreeWalker-polyfill/v0.2.0/src/TreeWalker-polyfill.js"

//  The above `TreeWalker` polyfill isn’t very good and only assigns
//    `createTreeWalker()` as a method on `window.document`.
//  This moves it to the prototype, so that it will be available in
//    documents created through `XMLParser`.
const DocumentPrototype = Object.getPrototypeOf(window.document)
if ( DocumentPrototype.createTreeWalker == null ) {
	DocumentPrototype.createTreeWalker = document.createTreeWalker
}
