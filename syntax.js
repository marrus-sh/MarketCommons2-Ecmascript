//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: syntax.js
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
//  This module contains a number of regular expressions important for
//    Market Commons ⅠⅠ processing.
//  Internally (within this file), they are defined as strings (using
//    `String.raw`) such that they can be easily composed.
//  They are exported (with the same names) as `RegExp`s with the
//    `"u"` flag set.
//
//  Although you *can* import and use these regular expressions
//    directly, they are typically the most useful when applied in a
//    “sticky” manner (via the `y` flag).
//  You can achieve this using the following code:
//
//  ```js
//  //  Let `$` be a regular expression imported from this file.
//  new RegExp ($.source, "uy")
//  ```
//
//  Sticky regular expressions generally should *not* be shared across
//    contexts, which is why they are not exported here.

//deno-lint-ignore-file camelcase

/**
 *  Replaces each `(?<…>` named capture group in the provided
 *    `stringRegExp` with `(?:`, to convert it into a noncapturing
 *    group.
 *
 *  This keeps the RegExp parser from needlessly capturing groups, and
 *    can be used to avoid duplicate capture group names.
 *
 *  @argument {string|RegExp} stringRegExp
 *  @returns {string}
 */
function uncaptureNamedGroups(stringRegExp) {
  //  This function assumes that `(?<…>` begins a named group.
  //  This isn’t true for all regular expressions (do *not* export
  //    this function for general use), but it is for all those
  //    defined in this file.
  return (stringRegExp instanceof RegExp
    ? stringRegExp.source
    : String(stringRegExp)).replace(/\(\?<[^>]*>/gu, "(?:");
}

/*
The following are regular expressions defined by the X·M·L 1·1
  specification.
*/

const Char = String.raw
  `[\u{1}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]`;
/**
 *  Any Unicode character, excluding U+0000, U+FFFE, and U+FFFF.
 *
 *      [2]   Char           ::= [#x1-#xD7FF]
 *                               | [#xE000-#xFFFD]
 *                               | [#x10000-#x10FFFF]
 */
const Char_RegExp = new RegExp(Char, "u");
export { Char_RegExp as Char };

const RestrictedChar = String.raw
  `[\u{1}-\u{8}\u{B}-\u{C}\u{E}-\u{1F}\u{7F}-\u{84}\u{86}-\u{9F}]`;
/**
 *      [2a]  RestrictedChar ::= [#x1-#x8] | [#xB-#xC] | [#xE-#x1F]
 *                               | [#x7F-#x84] | [#x86-#x9F]
 */
const RestrictedChar_RegExp = new RegExp(RestrictedChar, "u");
export { RestrictedChar_RegExp as RestrictedChar };

const S = String.raw`(?:[\u{20}\u{9}\u{D}\u{A}]+)`;
/**
 *      [3]   S              ::= (#x20 | #x9 | #xD | #xA)+
 */
const S_RegExp = new RegExp(S, "u");
export { S_RegExp as S };

const NameStartChar = String.raw
  `[:A-Z_a-z\u{C0}-\u{D6}\u{D8}-\u{F6}\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}]`;
/**
 *      [4]   NameStartChar  ::= ":" | [A-Z] | "_" | [a-z]
 *                               | [#xC0-#xD6] | [#xD8-#xF6]
 *                               | [#xF8-#x2FF] | [#x370-#x37D]
 *                               | [#x37F-#x1FFF] | [#x200C-#x200D]
 *                               | [#x2070-#x218F] | [#x2C00-#x2FEF]
 *                               | [#x3001-#xD7FF] | [#xF900-#xFDCF]
 *                               | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
 */
const NameStartChar_RegExp = new RegExp(NameStartChar, "u");
export { NameStartChar_RegExp as NameStartChar };

const NameChar = String.raw
  `(?:${NameStartChar}|[-.0-9\u{B7}\u{0300}-\u{036F}\u{203F}-\u{2040}])`;
/**
 *      [4a]  NameChar       ::= NameStartChar
 *                               | "-" | "." | [0-9] | #xB7
 *                               | [#x0300-#x036F] | [#x203F-#x2040]
 */
const NameChar_RegExp = new RegExp(NameChar, "u");
export { NameChar_RegExp as NameChar };

const Name = String.raw`(?:${NameStartChar}${NameChar}*)`;
/**
 *      [5]   Name           ::= NameStartChar (NameChar)*
 */
const Name_RegExp = new RegExp(Name, "u");
export { Name_RegExp as Name };

const CharRef = String.raw`(?:&#[0-9]+;|&#x[0-9a-fA-F]+;)`;
/**
 *      [66]  CharRef        ::= '&#' [0-9]+ ';'
 *                               | '&#x' [0-9a-fA-F]+ ';'
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  Characters referred to using character references must match
 *        the production for `Char`.
 */
const CharRef_RegExp = new RegExp(CharRef, "u");
export { CharRef_RegExp as CharRef };

const EntityRef = String.raw`(?:&${Name};)`;
/**
 *      [68]  EntityRef      ::= '&' Name ';'
 */
const EntityRef_RegExp = new RegExp(EntityRef, "u");
export { EntityRef_RegExp as EntityRef };

const Reference = String.raw`(?:${EntityRef}|${CharRef})`;
/**
 *      [67]  Reference      ::= EntityRef | CharRef
 */
const Reference_RegExp = new RegExp(Reference, "u");
export { Reference_RegExp as Reference };

const AttValue = String.raw
  `(?:"(?:(?=${Char})[^"<&]|${Reference})*"|'(?:(?=${Char})[^'<&]|${Reference})*')`;
/**
 *      [10]  AttValue       ::= '"' ([^<&"] | Reference)* '"'
 *                               |  "'" ([^<&'] | Reference)* "'"
 */
const AttValue_RegExp = new RegExp(AttValue, "u");
export { AttValue_RegExp as AttValue };

const SystemLiteral = String.raw
  `(?:"(?:(?=${Char})[^"])*"|'(?:(?=${Char})[^'])*')`;
/**
 *      [11]  SystemLiteral  ::= ('"' [^"]* '"') | ("'" [^']* "'")
 */
const SystemLiteral_RegExp = new RegExp(SystemLiteral, "u");
export { SystemLiteral_RegExp as SystemLiteral };

const Comment = String.raw`(?:<!--(?:(?!-)${Char}|-(?!-)${Char})*-->)`;
/**
 *      [15]  Comment        ::= '<!--' (
 *                                 (Char - '-') | ('-' (Char - '-'))
 *                               )* '-->'
 */
const Comment_RegExp = new RegExp(Comment, "u");
export { Comment_RegExp as Comment };

const CData = String.raw
  `(?:(?:(?!\])${Char}|\](?!\])${Char}|\]\](?!>)${Char}|\]\]?$)*)`;
/**
 *      [20]  CData          ::= (Char* - (Char* ']]>' Char*))
 */
const CData_RegExp = new RegExp(CData, "u");
export { CData_RegExp as CData };

const CDEnd = String.raw`(?:\]\]>)`;
/**
 *      [21]  CDEnd          ::= ']]>'
 */
const CDEnd_RegExp = new RegExp(CDEnd, "u");
export { CDEnd_RegExp as CDEnd };

const Eq = String.raw`(?:${S}?=${S}?)`;
/**
 *      [25]  Eq             ::= S? '=' S?
 */
const Eq_RegExp = new RegExp(Eq, "u");
export { Eq_RegExp as Eq };

/*
The following are regular expressions defined by the Namespaces in
  X·M·L 1.1 specification.
*/

const DefaultAttName = String.raw`(?:xmlns)`;
/**
 *      [3]   DefaultAttName  ::= 'xmlns'
 */
const DefaultAttName_RegExp = new RegExp(DefaultAttName, "u");
export { DefaultAttName_RegExp as DefaultAttName };

const NCNameChar = String.raw`(?:(?!:)${NameChar})`;
/**
 *      [5]   NCNameChar      ::= NameChar - ':'
 */
const NCNameChar_RegExp = new RegExp(NCNameChar, "u");
export { NCNameChar_RegExp as NCNameChar };

const NCNameStartChar = String.raw`(?:(?!:)${NameStartChar})`;
/**
 *      [6]   NCNameStartChar ::= NameStartChar - ':'
 */
const NCNameStartChar_RegExp = new RegExp(NCNameStartChar, "u");
export { NCNameStartChar_RegExp as NCNameStartChar };

const NCName = String.raw`(?:${NCNameStartChar}${NCNameChar}*)`;
/**
 *      [4]   NCName          ::= NCNameStartChar NCNameChar*
 */
const NCName_RegExp = new RegExp(NCName, "u");
export { NCName_RegExp as NCName };

const PrefixedAttName = String.raw`(?:xmlns:${NCName})`;
/**
 *      [2]   PrefixedAttName ::= 'xmlns:' NCName
 */
const PrefixedAttName_RegExp = new RegExp(PrefixedAttName, "u");
export { PrefixedAttName_RegExp as PrefixedAttName };

const NSAttName = String.raw`(?:${PrefixedAttName}|${DefaultAttName})`;
/**
 *      [1]   NSAttName       ::= PrefixedAttName | DefaultAttName
 */
const NSAttName_RegExp = new RegExp(NSAttName, "u");
export { NSAttName_RegExp as NSAttName };

const Prefix = String.raw`${NCName}`;
/**
 *      [10]  Prefix          ::= NCName
 */
const Prefix_RegExp = new RegExp(Prefix, "u");
export { Prefix_RegExp as Prefix };

const LocalPart = String.raw`${NCName}`;
/**
 *      [11]  LocalPart       ::= NCName
 */
const LocalPart_RegExp = new RegExp(LocalPart, "u");
export { LocalPart_RegExp as LocalPart };

const PrefixedName = String.raw`(?:${Prefix}:${LocalPart})`;
/**
 *      [8]   PrefixedName    ::= Prefix ':' LocalPart
 */
const PrefixedName_RegExp = new RegExp(PrefixedName, "u");
export { PrefixedName_RegExp as PrefixedName };

const UnprefixedName = String.raw`${LocalPart}`;
/**
 *      [9]   UnprefixedName  ::= LocalPart
 */
const UnprefixedName_RegExp = new RegExp(UnprefixedName, "u");
export { UnprefixedName_RegExp as UnprefixedName };

const QName = String.raw`(?:${PrefixedName}|${UnprefixedName})`;
/**
 *      [7]   QName           ::= PrefixedName | UnprefixedName
 */
const QName_RegExp = new RegExp(QName, "u");
export { QName_RegExp as QName };

const Attribute = String.raw
  `(?:${NSAttName}${Eq}${AttValue}|${QName}${Eq}${AttValue})`;
/**
 *      [15]  Attribute       ::= NSAttName Eq AttValue
 *                                | QName Eq AttValue
 */
const Attribute_RegExp = new RegExp(Attribute, "u");
export { Attribute_RegExp as Attribute };

/*
The following regular expressions help to define the Market Commons ⅠⅠ
  syntax.
*/

const AttributesD·J = String.raw
  `(?:\{(?:${S}?${Attribute}(?:${S}${Attribute})*)?${S}?\})`;
/**
 *  Attributes declaration.
 *
 *      [🆐A] AttributesD·J  ::= '{' (
 *                                 S? Attribute (S Attribute)*
 *                               )? S? '}'
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐A‐1] The same attribute name *must not* appear twice in a
 *        single attributes declaration.
 *
 *   +  [🆐A‐2] The attribute name *must not* match the `NSAttName`
 *        production.
 */
const AttributesD·J_RegExp = new RegExp(AttributesD·J, "u");
export { AttributesD·J_RegExp as AttributesD·J };

const SigilD·J = String.raw`(?:${CharRef}+)`;
/**
 *  Sigil declaration, provided as a sequence of character references.
 *
 *      [🆐B] SigilD·J       ::= CharRef+
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐B‐1] Each character referenced by CharRef *must not* match
 *        `S` or `'|'`.
 */
const SigilD·J_RegExp = new RegExp(SigilD·J, "u");
export { SigilD·J_RegExp as SigilD·J };

const SigilD·JPath = String.raw
  `(?:${SigilD·J}(?:${S}?//?${S}?${SigilD·J})*)`;
/**
 *  Sigil path.
 *
 * A single solidus gives a child relationship; a double solidus gives
 *   a descendant relationship.
 *
 *      [🆐C] SigilD·JPath   ::= SigilD·J (S? '/' '/'? S? SigilD·J)*
 */
const SigilD·JPath_RegExp = new RegExp(SigilD·JPath, "u");
export { SigilD·JPath_RegExp as SigilD·JPath };

const NamespaceD·J = String.raw
  `(?:<!NAMESPACE(?:${S}(?<namespacePrefix>${Prefix}):)?${S}(?<namespaceLiteral>${SystemLiteral})${S}?>)`;
/**
 *  Namespace declaration.
 *
 *      [🆐K] NamespaceD·J   ::= '<!NAMESPACE' (S Prefix)?
 *                               S SystemLiteral S? '>'
 *
 *  ##  Capture groups  ##
 *
 *  01. `namespacePrefix` (optional): The namespace prefix.
 *
 *  02. `namespaceLiteral`: The `SystemLiteral` of the namespace
 *        (including quotes).
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐K‐1] The namespace prefix *must not* be `xmlns`.
 *
 *   +  [🆐K‐2] The namespace prefix `xml` *must* only be assigned to
 *        the literal `"http://www.w3.org/XML/1998/namespace"` (any
 *        quotes).
 *
 *   +  [🆐K‐3] Other prefixes, including the null prefix, *must not*
 *         be assigned to the literals
 *         `"http://www.w3.org/XML/1998/namespace"` or
 *         `"http://www.w3.org/2000/xmlns/"` (any quotes).
 */
const NamespaceD·J_RegExp = new RegExp(NamespaceD·J, "u");
export { NamespaceD·J_RegExp as NamespaceD·J };

const DocumentD·J = String.raw
  `(?:<!DOCUMENT${S}\[\[(?<documentTemplate>${CData})${CDEnd})`;
/**
 *  Document (template) declaration.
 *
 *  The syntax of this declaration is very similar to the `CDATA`
 *    production in X·M·L.
 *  Note that this means that the string `]]>` cannot appear *anywhere*
 *    inside document templates (including comments).
 *
 *      [🆐D] DocumentD·J    ::= '<!DOCUMENT' S '[[' CData CDEnd
 *
 *  ##  Capture groups  ##
 *
 *  01. `documentTemplate`: Template contents.
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐D‐1] Template contents *must* be namespace‐welformed X·M·L
 *        documents.
 *
 *   +  [🆐D‐2] Template contents *must* contain exactly one of each of
 *        the following:
 *
 *       +  An empty element with local name `preamble` and namespace
 *            `tag:go.KIBI.family,2021:market`.
 *
 *       +  An empty element with local name `content` and namespace
 *            `tag:go.KIBI.family,2021:market`.
 *
 *   +  [🆐D‐3] Template contents *must not* contain any other elements
 *        in the namespace `tag:go.KIBI.family,2021:market`.
 */
const DocumentD·J_RegExp = new RegExp(DocumentD·J, "u");
export { DocumentD·J_RegExp as DocumentD·J };

const SectionD·J = String.raw
  `(?:<!SECTION${S}(?<sectionPath>${SigilD·JPath})${S}(?<sectionName>${Name})(?:${S}(?<sectionAttributes>${AttributesD·J}))?(?:${S}COUNTTO${S}(?<sectionCountTo>${Name}(?:${S}${Name})*))?(?:${S}\|${S}(?<sectionHeadingName>${Name})(?:${S}(?<sectionHeadingAttributes>${AttributesD·J}))?(?:${S}COUNTTO${S}(?<sectionHeadingCountTo>${Name}(?:${S}${Name})*))?|${S}TEXTTO${S}(?<sectionTextTo>${Name}(?:${S}${Name})*))?${S}?>)`;
/**
 *  Section declaration.
 *
 *  The second `Name` and `AttributesD·J` describes the heading which
 *    may be used to begin the section.
 *
 *      [🆐E] SectionD·J     ::= '<!SECTION' S SigilD·JPath
 *                               S QName (S AttributesD·J)? (
 *                                 S 'COUNTTO' (S QName)+
 *                               )? (
 *                                 S '|' S Name (S AttributesD·J)? (
 *                                   S 'COUNTTO' (S QName)+
 *                                 )? | S 'TEXTTO' (S QName)+
 *                               ) S? '>'
 *
 *  ##  Capture groups  ##
 *
 *  01. `sectionPath`: Section sigil path.
 *
 *  02. `sectionName`: Section X·M·L element name.
 *
 *  03. `sectionAttributes` (optional): Section attributes declaration.
 *
 *  04. `sectionCountTo` (optional): One or more attribute names to
 *        send the section level/count to.
 *
 *  05. `sectionHeadingName` (optional): Heading X·M·L element name.
 *
 *  06. `sectionHeadingAttributes` (optional): Heading attributes
 *        declaration.
 *
 *  07. `sectionHeadingCountTo` (optional): One or more attribute
 *        names to send the heading level/count to.
 *
 *  08. `sectionTextTo` (optional): One or more attribute names to
 *        send (heading) text to, if no heading element is supported.
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐E‐2] Section and heading names and attributes *must not*
 *        match the `NSAttName` production.
 */
const SectionD·J_RegExp = new RegExp(SectionD·J, "u");
export { SectionD·J_RegExp as SectionD·J };

const HeadingD·J = String.raw
  `(?:<!HEADING(?:${S}(?<headingSectionPath>${SigilD·JPath})(?:${S}(?<headingSectionStrict>>))?)?${S}(?<headingSigil>${SigilD·J})${S}(?<headingName>${QName})(?:${S}(?<headingAttributes>${AttributesD·J}))?(?:${S}COUNTTO${S}(?<headingCountTo>${QName}(?:${S}${QName})*))?${S}?>)`;
/**
 *  Heading declaration.
 *
 *      [🆐F] HeadingD·J     ::= '<!HEADING' (
 *                                 S SigilD·JPath (S '>')?
 *                               )? S SigilD·J
 *                               S QName (S AttributesD·J)? (
 *                                 S 'COUNTTO' (S QName)+
 *                               )? S? '>'
 *
 *  ##  Capture groups  ##
 *
 *  01. `headingSectionPath` (optional): Section sigil path.
 *
 *  02. `headingSectionStrict` (optional): `>` if the section sigil
 *    path indicates a parent (rather than ancestor) relationship.
 *
 *  03. `headingSigil`: Heading sigil.
 *
 *  04. `headingName`: Heading X·M·L element name.
 *
 *  05. `headingAttributes` (optional): Heading attributes declaration.
 *
 *  06. `headingCountTo` (optional): One or more attribute names to
 *        send the heading level/count to.
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐F‐2] Heading names and attributes *must not* match the
 *        `NSAttName` production.
 */
const HeadingD·J_RegExp = new RegExp(HeadingD·J, "u");
export { HeadingD·J_RegExp as HeadingD·J };

const BlockD·J = String.raw
  `(?:<!BLOCK(?:${S}(?<blockSectionPath>${SigilD·JPath})(?:${S}(?<blockSectionStrict>>))?)?${S}(?:(?<blockPath>${SigilD·JPath})|DEFAULT${S}(?<blockSigil>${SigilD·J}))${S}(?:(?<blockName>${QName})(?:${S}(?<blockAttributes>${AttributesD·J}))?(?:${S}(?<blockFinal>FINAL))?(?:${S}INLIST${S}(?<blockListName>${QName})(?:${S}(?<blockListAttributes>${AttributesD·J}))?)?|#${S}(?<blockSpecial>TRANSPARENT|COMMENT|LITERAL))${S}?>)`;
/**
 *  Block declaration.
 *
 *      [🆐G] BlockD·J       ::= '<!BLOCK' (
 *                                 S SigilD·JPath (S '>')?
 *                               )? S (
 *                                 SigilD·JPath | 'DEFAULT' S SigilD·J
 *                               ) S (
 *                                 QName (S AttributesD·J)? (
 *                                   S 'FINAL'
 *                                 )? (
 *                                   S 'INLIST'
 *                                   S QName (S AttributesD·J)?
 *                                 )? | '#' S (
 *                                   'TRANSPARENT'
 *                                   | 'COMMENT'
 *                                   | 'LITERAL'
 *                                 )
 *                               ) S? '>'
 *
 *  ##  Capture groups  ##
 *
 *  01. `blockSectionPath` (optional): Section sigil path.
 *
 *  02. `blockSectionStrict` (optional): `>` if the section sigil path
 *        indicates a parent (rather than ancestor) relationship.
 *
 *  03. `blockPath` (optional): Block sigil path (if this is not a
 *        `DEFAULT` block).
 *
 *  04. `blockSigil` (optional): Block sigil (if this is a `DEFAULT`
 *        block).
 *
 *  05. `blockName` (optional): Block X·M·L element name.
 *
 *  06. `blockAttributes` (optional): Block attributes declaration.
 *
 *  07. `blockFinal` (optional): `FINAL` if this block cannot contain
 *        child blocks.
 *
 *  08. `blockListName` (optional): List X·M·L element name.
 *
 *  09. `blockListAttributes` (optional): List attributes declaration.
 *
 *  10. `blockSpecial` (optional): `TRANSPARENT` if this sigil defines
 *        a transparent block, `COMMENT` if this sigil defines a
 *        comment block, or `LITERAL` if this sigil defines a literal
 *        block.
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐G‐3] Block and list names and attributes *must not* match
 *        the `NSAttName` production.
 */
const BlockD·J_RegExp = new RegExp(BlockD·J, "u");
export { BlockD·J_RegExp as BlockD·J };

const InlineD·J = String.raw
  `(?:<!INLINE(?:${S}(?<inlineSectionOrBlockPath>${SigilD·JPath})(?:${S}(?<inlineSectionOrBlockStrict>>))?(?:${S}(?:(?<inlineBlockPath>${SigilD·JPath})(?:${S}(?<inlineBlockStrict>>))?|(?<inlineBlockAny>\*)))?)?${S}(?<inlinePath>${SigilD·JPath})${S}(?:(?<inlineName>${QName})(?:${S}(?<inlineAttributes>${AttributesD·J}))?(?:${S}(?<inlineFinal>FINAL)|${S}TEXTFROM${S}(?<inlineTextFrom>${QName})|${S}TEXTTO${S}(?<inlineTextTo>${QName}(?:${S}${QName})*))?|#${S}(?<inlineSpecial>TRANSPARENT|COMMENT|LITERAL))${S}?>)`;
/**
 *  Inline declaration.
 *
 *      [🆐H] InlineD·J      ::= '<!INLINE' (
 *                                 S SigilD·JPath (S '>')? (
 *                                   S (SigilD·JPath (S '>')? | '*')
 *                                 )?
 *                               )? S SigilD·JPath
 *                               S (
 *                                 QName (S AttributesD·J)? (
 *                                   S 'FINAL'
 *                                   | S 'TEXTFROM' S QName
 *                                   | S 'TEXTTO' (S QName)+
 *                                 )? | '#' S (
 *                                   'TRANSPARENT'
 *                                   | 'COMMENT'
 *                                   | 'LITERAL'
 *                                 )
 *                               ) S? '>'
 *
 *  ##  Capture groups  ##
 *
 *  01. `inlineSectionOrBlockPath` (optional): Section/block sigil
 *        path.
 *
 *  02. `inlineSectionOrBlockStrict` (optional): `>` if the
 *        section/block sigil path indicates a parent (rather than
 *        ancestor) relationship.
 *
 *  03. `inlineBlockPath` (optional): Block sigil path.
 *
 *  04. `inlineBlockStrict` (optional): `>` if the block sigil path
 *        indicates a parent (rather than ancestor) relationship.
 *
 *  05. `inlineBlockAny` (optional): `*` if there is a section but not
 *        block sigil path.
 *
 *  06. `inlinePath`: Inline sigil path.
 *
 *  07. `inlineName` (optional): Inline X·M·L element name.
 *
 *  08. `inlineAttributes` (optional): Inline attributes declaration.
 *
 *  09. `inlineFinal` (optional): `FINAL` if this inline cannot contain
 *        child inlines.
 *
 *  10. `inlineTextFrom` (optional): An attribute name to pull text
 *        from.
 *
 *  11. `inlineTextTo` (optional): One or more attribute names to
 *        send text to.
 *      This implies a `FINAL` inline.
 *
 *  12. `inlineSpecial` (optional): `TRANSPARENT` if this sigil defines
 *        a transparent inline, `COMMENT` if this sigil defines a
 *        comment inline, or `LITERAL` if this sigil defines a literal
 *        inline.
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐H‐4] Inline names and attributes *must not* match the
 *        `NSAttName` production
 */
const InlineD·J_RegExp = new RegExp(InlineD·J, "u");
export { InlineD·J_RegExp as InlineD·J };

const AttributeD·J = String.raw
  `(?:<!ATTRIBUTE(?:${S}(?<attributeSectionOrBlockOrInlinePath>${SigilD·JPath})(?:${S}(?<attributeSectionOrBlockOrInlineStrict>>))?(?:${S}(?:(?<attributeBlockOrInlinePath>${SigilD·JPath})(?:${S}(?<attributeBlockOrInlineStrict>>))?|(?<attributeBlockOrInlineAny>\*))(?:${S}(?:(?<attributeInlinePath>${SigilD·JPath})(?:${S}(?<attributeInlineStrict>>))?|(?<attributeInlineAny>\*)))?)?)?${S}(?<attributeSigil>${SigilD·J})${S}(?<attributeNames>${QName}(?:${S}${QName})*)${S}?>)`;
/**
 *  Attribute declaration.
 *
 *      [🆐I] AttributeD·J   ::= '<!ATTRIBUTE' (
 *                                 S SigilD·JPath (S '>')? (
 *                                   S (SigilD·JPath (S '>')? | '*') (
 *                                     S (SigilD·JPath (S '>')? | '*')
 *                                   )?
 *                                 )?
 *                               )? S SigilD·J (S QName)+ S? '>'
 *
 *  ##  Capture groups  ##
 *
 *  01. `attributeSectionOrBlockOrInlinePath` (optional):
 *        Section/block/inline sigil path.
 *
 *  02. `attributeSectionOrBlockOrInlineStrict` (optional): `>` if the
 *        section/block/inline sigil path indicates a parent (rather
 *        than ancestor) relationship.
 *
 *  03. `attributeBlockOrInlinePath` (optional): Block/inline sigil
 *        path.
 *
 *  04. `attributeBlockOrInlineStrict` (optional): `>` if the
 *        block/inline sigil path indicates a parent (rather than
 *        ancestor) relationship.
 *
 *  05. `attributeBlockOrInlineAny` (optional): `*` if there is a
 *        section/block but not block/inline sigil path.
 *
 *  06. `attributeInlinePath` (optional): Inline sigil path.
 *
 *  07. `attributeInlineStrict` (optional): `>` if the inline sigil
 *        path indicates a parent (rather than ancestor) relationship.
 *
 *  08. `attributeInlineAny` (optional): `*` if there is a
 *        section/block but not inline sigil path.
 *
 *  09. `attibuteSigil`: Attribute sigil.
 *
 *  10. `attributeNames`: Attribute X·M·L element name(s).
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐I‐4] Attribute names *must not* match the `NSAttName`
 *        production.
 */
const AttributeD·J_RegExp = new RegExp(AttributeD·J, "u");
export { AttributeD·J_RegExp as AttributeD·J };

const D·J = String.raw
  `(?:<\?market-commons${S}2\.0(?:${S}(?<externalName>${SystemLiteral})|(?:${S}(?<externalSubset>${SystemLiteral}))?${S}\[(?<internalDeclarations>(?:${S}|${
    uncaptureNamedGroups(NamespaceD·J)
  }|${uncaptureNamedGroups(DocumentD·J)}|${
    uncaptureNamedGroups(SectionD·J)
  }|${uncaptureNamedGroups(HeadingD·J)}|${
    uncaptureNamedGroups(BlockD·J)
  }|${uncaptureNamedGroups(InlineD·J)}|${
    uncaptureNamedGroups(AttributeD·J)
  }|${Comment})*)\])${S}?\?>\u{A})`;
/**
 *  Declaration of Jargon.
 *
 *  It does not make a Declaration of Jargon nonwelformed to fail to
 *    include a document declaration, but such a Declaration of Jargon
 *    cannot be used.
 *  (It *may* be imported by other Declarations of Jargon.)
 *
 *  It does not make a Declaration of Jargon nonwelformed to define a
 *    `PrefixedName` corresponding to an undefined `Prefix`, but it is
 *    an error if such a declaration is ever referenced in a document.
 *  A Declaration of Jargon could (for example) conceivably define:—
 *
 *      <!ATTRIBUTE &#x23; xml:id local:id>
 *
 *  —:and remain welformed even if `local` is never defined.
 *  Other Declarations of Jargon could import this Declaration of
 *    Jargon by `SystemLiteral`, defining the namespace themselves.
 *
 *      [🆐J] D·J            ::= '<?market-commons' S '2.0' (
 *                                 S SystemLiteral
 *                                 | (S SystemLiteral)? S '[' (
 *                                   S
 *                                   | NamespaceD·J
 *                                   | DocumentD·J
 *                                   | SectionD·J
 *                                   | HeadingD·J
 *                                   | BlockD·J
 *                                   | InlineD·J
 *                                   | AttributeD·J
 *                                   | Comment
 *                                 )* ']'
 *                               ) S? '?>' #xA
 *
 *  ##  Capture groups  ##
 *
 *  01. `externalName` (optional):
 *        A system identifier for an external Declaration of Jargon,
 *        when no internal declarations are provided.
 *
 *  02. `externalSubset` (optional):
 *        A system identifier for an external Declaration of Jargon,
 *        when internal declarations are also provided.
 *
 *  03. `internalDeclarations` (optional): Internal declarations.
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  [🆐J‐1] The system identifier *must* be resolvable to a file
 *        which matches the `D·J` production and is welformed according
 *        to the rules in this file.
 *
 *   +  [🆐J‐2] System identifiers *must not* recurse when resolving.
 */
const D·J_RegExp = new RegExp(D·J, "u");
export { D·J_RegExp as D·J };
