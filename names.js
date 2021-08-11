//  @ Market Commons ⅠⅠ – Ecmascript :: names.js
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  Names and namespaces used by Market Commons ⅠⅠ.
 *
 *  @module MarketCommons2/names
 */

/**
 *  The X·H·T·M·L Namespace, used by H·T·M·L and others.
 */
export const x·h·t·m·lNamespace = "http://www.w3.org/1999/xhtml"

/**
 *  The Market Commons namespace, used by Market Commons ⅠⅠ.
 *
 *  Although the original Market Commons markup language was created in
 *    2019, no namespace was set aside for it until 2021.
 */
export const marketNamespace = "tag:go.KIBI.family,2021:market"

/**
 *  The `<parsererror>` namespace, used by `DOMParser`.
 *
 *  This namespace is standardized in
 *    <https://html.spec.whatwg.org/#dom-domparser-parsefromstring>.
 */
export const parsererrorNamespace =
	"http://www.mozilla.org/newlayout/xml/parsererror.xml"
