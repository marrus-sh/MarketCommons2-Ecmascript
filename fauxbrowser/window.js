//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: fauxbrowser/window.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Sets up a `window` and `document` for scripts which expect it to
 *    be present, and assigns `DOMParser` and `XMLSerializer` on the
 *    former.
 *
 *  Import this module *first* (before any modules wot expect these
 *    things to be present).
 *
 *  @module MarketCommons2/fauxbrowser/window
 */

import { x·h·t·m·lNamespace } from "../names.js"
import { DOMParser, XMLSerializer }
	from "https://esm.sh/@xmldom/xmldom@0.7.0"

const window = globalThis
window.DOMParser = DOMParser
window.XMLSerializer = XMLSerializer
const document = window.document =
	//  A blank X·H·T·M·L page.
	(new DOMParser).parseFromString(
		`<html xmlns="${ x·h·t·m·lNamespace }"><head/><body/></html>`,
		"application/xhtml+xml"
	)
