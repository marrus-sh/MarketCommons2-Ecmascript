//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: html.marketdj.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/*
We’re waiting on <https://github.com/denoland/deno/issues/5987> before
  we can make this a plain `.marketdj` file.
*/

export default `<?market-commons 2.0 [
<!--
@ Market Commons ⅠⅠ Default (H·T·M·L) Declaration of Jargon @

This is the default Declaration of Jargon (D·J) used by
	Market Commons ⅠⅠ, if none is specified in a file.
It can be manually specified with the following ~| SystemLiteral |~:
	~| "tag:go.KIBI.family,2021:market/html" |~.
-->

<!-- Document Template -->
<!DOCUMENT [[
<!DOCTYPE html SYSTEM "about:legacy-compat" [ <!ENTITY .htmlfix. '>
	<script type="text/plain">Open H·T·M·L parser fix.'>
	<!-- These entities will only work if the document is correctly served with an X·M·L media type. -->
	<!ENTITY BR '<br/>'>
	<!ENTITY HR '<hr/>'>
	<!ENTITY WBR '<wbr/>'>
]>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<script type="text/plain">Close H·T·M·L parser fix.</script>
	<meta charset="utf-8"/>
	<meta name="generator" content="market-commons 2.0"/>
	<!-- BEGIN PREAMBLE -->
<preamble xmlns="tag:go.KIBI.family,2021:market"/>
	<!-- END PREAMBLE -->
</head>
<body>
	<!-- BEGIN CONTENT -->
<content xmlns="tag:go.KIBI.family,2021:market"/>
	<!-- END CONTENT -->
</body>
</html>
]]>

<!-- Sections -->
<!-- $ --><!SECTION &#x24; section h1>
<!-- % --><!SECTION &#x25; nav h1>
<!-- : --><!SECTION &#x3A; div h1>
<!-- < --><!SECTION &#x3C; aside h1>
<!-- > --><!SECTION &#x3E; blockquote h1>
<!-- @ --><!SECTION &#x40; article h1>
<!-- ^ --><!SECTION &#x5E; header h1>
<!-- _ --><!SECTION &#x5F; footer h1>

<!-- Headings -->
<!-- - --><!HEADING &#x2D; h1 COUNTTO aria-level>

<!-- Blocks -->
<!-- . --><!BLOCK DEFAULT &#x2E; p>
<!-- & --><!BLOCK &#x26; li INLIST ol>
<!-- + --><!BLOCK &#x2B; li INLIST ul>
<!-- , --><!BLOCK &#x2C; dd INLIST dl>
<!-- : --><!BLOCK &#x3A; div>
<!-- ; --><!BLOCK &#x3B; # COMMENT>
<!-- > --><!BLOCK &#x3E; blockquote>
<!-- ? --><!BLOCK &#x3F; dt INLIST dl>
<!-- [ --><!BLOCK &#x5B; figure>
<!-- [ _ --><!BLOCK &#x5B;/&#x5F; figcaption>
<!-- ] --><!BLOCK &#x5D; address>
<!-- \` --><!BLOCK &#x60; # LITERAL>

<!-- Inlines -->
<!-- ! --><!INLINE &#x21; strong>
<!-- " --><!INLINE &#x22; q>
<!-- # --><!INLINE &#x23; b>
<!-- $ --><!INLINE &#x24; var>
<!-- % --><!INLINE &#x25; mark>
<!-- & --><!INLINE &#x26; img TEXTTO alt title>
<!-- ' --><!INLINE &#x27; cite>
<!-- * --><!INLINE &#x2A; em>
<!-- + --><!INLINE &#x2B; ins>
<!-- , --><!INLINE &#x2C; sub>
<!-- - --><!INLINE &#x2D; del>
<!-- . --><!INLINE &#x2E; ruby>
<!-- . { --><!INLINE &#x2E;/&#x7B; rb>
<!-- . } --><!INLINE &#x2E;/&#x7D; rt>
<!-- / --><!INLINE &#x2F; i>
<!-- : --><!INLINE &#x3A; span>
<!-- ; --><!INLINE &#x3B; # COMMENT>
<!-- < --><!INLINE &#x3C; samp>
<!-- = --><!INLINE &#x3D; s>
<!-- > --><!INLINE &#x3E; kbd>
<!-- ? --><!INLINE &#x3F; dfn>
<!-- @ --><!INLINE &#x40; a TEXTFROM href>
<!-- [ --><!INLINE &#x5B; small>
<!-- ] --><!INLINE &#x5D; abbr>
<!-- ^ --><!INLINE &#x5E; sup>
<!-- _ --><!INLINE &#x5F; u>
<!-- \` --><!INLINE &#x60; # LITERAL>
<!-- ~ --><!INLINE &#x7E; code>

<!-- Attributes -->
<!-- ! --><!ATTRIBUTE &#x21; href>
<!-- # --><!ATTRIBUTE &#x23; id>
<!-- $ --><!ATTRIBUTE &#x24; style>
<!-- % --><!ATTRIBUTE &#x25; resource>
<!-- & --><!ATTRIBUTE &#x26; src>
<!-- * --><!ATTRIBUTE &#x2A; tabindex>
<!-- , --><!ATTRIBUTE &#x2C; property>
<!-- . --><!ATTRIBUTE &#x2E; class>
<!-- / --><!ATTRIBUTE &#x2F; title>
<!-- ; --><!ATTRIBUTE &#x3B; typeof>
<!-- < --><!ATTRIBUTE &#x3C; rev>
<!-- = --><!ATTRIBUTE &#x3D; role>
<!-- > --><!ATTRIBUTE &#x3E; rel>
<!-- ? --><!ATTRIBUTE &#x3F; about>
<!-- @ --><!ATTRIBUTE &#x40; lang xml:lang>
<!-- ^ --><!ATTRIBUTE &#x5E; datatype>
<!-- \` --><!ATTRIBUTE &#x60; type>
<!-- ~ --><!ATTRIBUTE &#x7E; content>
]?>
`
