// 🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript ∷ 🆐/html.marketdj.js
// ====================================================================
//
// Copyright © 2021 Margaret KIBI.
//
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

import {
  //deno-lint-ignore camelcase
  deno_landXMarket,
  marketNamespace,
  xhtmlNamespace,
} from "../names.js";

export default String.raw`<?market-commons 2.0 [
<!--
@ Market Commons ⅠⅠ Default (H·T·M·L) Declaration of Jargon @

This is the default Declaration of Jargon (D·J) used by
	Market Commons ⅠⅠ – Ecmascript, if none is specified in a file.
It can be manually specified with the following ~| SystemLiteral |~:
	~| "tag:ns.1024.gdn,2023:market/html" |~.
-->

<!-- Namespaces -->
<!NAMESPACE "${xhtmlNamespace}">

<!-- Document Template -->
<!DOCUMENT [[<!DOCTYPE html>
<html xmlns="${xhtmlNamespace}">
<head>
	<meta charset="utf-8"/>
	<meta name="generator" content="market-commons 2.0&#xA;${deno_landXMarket}"/>
	<!-- BEGIN PREAMBLE -->
<preamble xmlns="${marketNamespace}"/>
	<!-- END PREAMBLE -->
</head>
<body>
	<!-- BEGIN CONTENT -->
<content xmlns="${marketNamespace}"/>
	<!-- END CONTENT -->
</body>
</html>]]>

<!-- Sections -->
<!-- $ --><!SECTION &#x24; section    | h1 COUNTTO aria-level>
<!-- % --><!SECTION &#x25; nav        | h1 COUNTTO aria-level>
<!-- : --><!SECTION &#x3A; div        | h1 COUNTTO aria-level>
<!-- < --><!SECTION &#x3C; aside      | h1 COUNTTO aria-level>
<!-- > --><!SECTION &#x3E; blockquote | h1 COUNTTO aria-level>
<!-- @ --><!SECTION &#x40; article    | h1 COUNTTO aria-level>
<!-- ^ --><!SECTION &#x5E; header     | h1 COUNTTO aria-level>
<!-- _ --><!SECTION &#x5F; footer     | h1 COUNTTO aria-level>

<!-- For (semi)backcompat with the original Market Commons: -->
<!-- / --><!SECTION &#x2F; div TEXTTO data-title>

<!-- Headings -->
<!-- - --><!HEADING &#x2D; h1 COUNTTO aria-level>

<!-- Blocks -->
<!-- &    --><!BLOCK         &#x26;        li         INLIST  ol>
<!-- +    --><!BLOCK         &#x2B;        li         INLIST  ul>
<!-- ,    --><!BLOCK         &#x2C;        dd         INLIST  dl>
<!-- .    --><!BLOCK DEFAULT &#x2E;        p          FINAL     >
<!-- :    --><!BLOCK         &#x3A;        div                  >
<!-- ;    --><!BLOCK         &#x3B;        #          COMMENT   >
<!-- >    --><!BLOCK         &#x3E;        blockquote           >
<!-- ?    --><!BLOCK         &#x3F;        dt         INLIST  dl>
<!-- [    --><!BLOCK         &#x5B;        figure               >
<!-- [  _ --><!BLOCK         &#x5B;/&#x5F; figcaption           >
<!-- ]    --><!BLOCK         &#x5D;        address              >
<!-- \`   --><!BLOCK         &#x60;        #          LITERAL   >

<!-- Inlines -->
<!-- !    --><!INLINE &#x21;        strong                          >
<!-- "    --><!INLINE &#x22;        q                               >
<!-- #    --><!INLINE &#x23;        b                               >
<!-- $    --><!INLINE &#x24;        var                             >
<!-- %    --><!INLINE &#x25;        mark                            >
<!-- &    --><!INLINE &#x26;        img    TEXTTO    alt       title>
<!-- '    --><!INLINE &#x27;        cite                            >
<!-- *    --><!INLINE &#x2A;        em                              >
<!-- +    --><!INLINE &#x2B;        ins                             >
<!-- ,    --><!INLINE &#x2C;        sub                             >
<!-- -    --><!INLINE &#x2D;        del                             >
<!-- .    --><!INLINE &#x2E;        ruby                            >
<!-- .  { --><!INLINE &#x2E;/&#x7B; rb                              >
<!-- .  } --><!INLINE &#x2E;/&#x7D; rt                              >
<!-- /    --><!INLINE &#x2F;        i                               >
<!-- :    --><!INLINE &#x3A;        span                            >
<!-- ;    --><!INLINE &#x3B;        #       COMMENT                 >
<!-- <    --><!INLINE &#x3C;        samp                            >
<!-- =    --><!INLINE &#x3D;        s                               >
<!-- >    --><!INLINE &#x3E;        kbd                             >
<!-- ?    --><!INLINE &#x3F;        dfn                             >
<!-- @    --><!INLINE &#x40;        a       TEXTFROM href           >
<!-- [    --><!INLINE &#x5B;        small                           >
<!-- \    --><!INLINE &#x5C;        br      TEXTTO   data-text      >
<!-- ]    --><!INLINE &#x5D;        abbr                            >
<!-- ^    --><!INLINE &#x5E;        sup                             >
<!-- _    --><!INLINE &#x5F;        u                               >
<!-- \`   --><!INLINE &#x60;        #       LITERAL                 >
<!-- ~    --><!INLINE &#x7E;        code                            >

<!-- Attributes -->
<!-- !  --><!ATTRIBUTE &#x21; href             >
<!-- #  --><!ATTRIBUTE &#x23; id               >
<!-- $  --><!ATTRIBUTE &#x24; style            >
<!-- %  --><!ATTRIBUTE &#x25; resource         >
<!-- &  --><!ATTRIBUTE &#x26; src              >
<!-- *  --><!ATTRIBUTE &#x2A; tabindex         >
<!-- ,  --><!ATTRIBUTE &#x2C; property         >
<!-- .  --><!ATTRIBUTE &#x2E; class            >
<!-- /  --><!ATTRIBUTE &#x2F; title            >
<!-- ;  --><!ATTRIBUTE &#x3B; typeof           >
<!-- <  --><!ATTRIBUTE &#x3C; rev              >
<!-- =  --><!ATTRIBUTE &#x3D; role             >
<!-- >  --><!ATTRIBUTE &#x3E; rel              >
<!-- ?  --><!ATTRIBUTE &#x3F; about            >
<!-- @  --><!ATTRIBUTE &#x40; lang     xml:lang>
<!-- ^  --><!ATTRIBUTE &#x5E; datatype         >
<!-- \` --><!ATTRIBUTE &#x60; type             >
<!-- ~  --><!ATTRIBUTE &#x7E; content          >
]?>
`;
