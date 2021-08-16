//  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript :: syntax.js
//  ===================================================================
//
//  Copyright © 2021 Margaret KIBI.
//
//  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
//  If a copy of the MPL was not distributed with this file, You can obtain one at <https://mozilla.org/MPL/2.0/>.

/**
 *  This module contains a number of regular expressions important for
 *    Market Commons ⅠⅠ processing.
 *  Internally (within this file), they are defined as strings (using
 *    `String.raw`) such that they can be easily composed.
 *  They are exported (with the same names) as `RegExp`s with the
 *    `"u"` flag set.
 *
 *  Although you *can* import and use these regular expressions
 *    directly, they are typically the most useful when applied in a
 *    “sticky” manner (via the `y` flag).
 *  You can achieve this using the following code:
 *  
 *      //  Let `$` be a regular expression imported from this file.
 *      new RegExp ($.source, "uy")
 *
 *  Sticky regular expressions generally should *not* be shared across
 *    contexts, which is why they are not exported here.
 *
 *  @module MarketCommons2/syntax
 */

/**
 *  Replaces each `(?<…>` named capture group in the provided
 *    `stringRegExp` with `(?:`, to convert it into a noncapturing
 *    group.
 *
 *  This keeps the RegExp parser from needlessly capturing groups, and
 *    can be used to avoid duplicate capture group names.
 *
 *  @argument {string} stringRegExp
 *  @returns {string}
 */
function uncaptureNamedGroups ( stringRegExp ) {
	//  This function assumes that `(?<…>` begins a named group.
	//  This isn’t true for all regular expressions (do *not* export
	//    this function for general use), but it is for all those
	//    defined in this file.
	return (
		stringRegExp instanceof RegExp ? stringRegExp.source
			: String(stringRegExp)
	).replace(/\(\?<[^>]*>/gu, "(?:")
}

/*
The following are regular expressions defined by the X·M·L 1·1
  specification.
*/

const Char =
	String.raw `[\u{1}-\u{D7FF}\u{E000}-\u{FFFD}\u{10000}-\u{10FFFF}]`
/**
 *  Any Unicode character, excluding U+0000, U+FFFE, and U+FFFF.
 *
 *      [2]   Char           ::= [#x1-#xD7FF]
 *                               | [#xE000-#xFFFD]
 *                               | [#x10000-#x10FFFF]
 */
const Char_RegExp = new RegExp (Char, "u")
export { Char_RegExp as Char }

const RestrictedChar =
	String.raw `[\u{1}-\u{8}\u{B}-\u{C}\u{E}-\u{1F}\u{7F}-\u{84}\u{86}-\u{9F}]`
/**
 *      [2a]  RestrictedChar ::= [#x1-#x8] | [#xB-#xC] | [#xE-#x1F]
 *                               | [#x7F-#x84] | [#x86-#x9F]
 */
const RestrictedChar_RegExp = new RegExp (RestrictedChar, "u")
export { RestrictedChar_RegExp as RestrictedChar }

const S = String.raw `(?:[\u{20}\u{9}\u{D}\u{A}]+)`
/**
 *      [3]   S              ::= (#x20 | #x9 | #xD | #xA)+
 */
const S_RegExp = new RegExp (S, "u")
export { S_RegExp as S }

const NameStartChar =
	String.raw `[:A-Z_a-z\u{C0}-\u{D6}\u{D8}-\u{F6}\u{F8}-\u{2FF}\u{370}-\u{37D}\u{37F}-\u{1FFF}\u{200C}-\u{200D}\u{2070}-\u{218F}\u{2C00}-\u{2FEF}\u{3001}-\u{D7FF}\u{F900}-\u{FDCF}\u{FDF0}-\u{FFFD}\u{10000}-\u{EFFFF}]`
/**
 *      [4]   NameStartChar  ::= ":" | [A-Z] | "_" | [a-z]
 *                               | [#xC0-#xD6] | [#xD8-#xF6]
 *                               | [#xF8-#x2FF] | [#x370-#x37D]
 *                               | [#x37F-#x1FFF] | [#x200C-#x200D]
 *                               | [#x2070-#x218F] | [#x2C00-#x2FEF]
 *                               | [#x3001-#xD7FF] | [#xF900-#xFDCF]
 *                               | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
 */
const NameStartChar_RegExp = new RegExp (NameStartChar, "u")
export { NameStartChar_RegExp as NameStartChar }

const NameChar =
	String.raw `(?:${ NameStartChar }|[-.0-9\u{B7}\u{0300}-\u{036F}\u{203F}-\u{2040}])`
/**
 *      [4a]  NameChar       ::= NameStartChar
 *                               | "-" | "." | [0-9] | #xB7
 *                               | [#x0300-#x036F] | [#x203F-#x2040]
 */
const NameChar_RegExp = new RegExp (NameChar, "u")
export { NameChar_RegExp as NameChar }

const Name = String.raw `(?:${ NameStartChar }${ NameChar }*)`
/**
 *      [5]   Name           ::= NameStartChar (NameChar)*
 */
const Name_RegExp = new RegExp (Name, "u")
export { Name_RegExp as Name }

const CharRef = String.raw `(?:&#[0-9]+;|&#x[0-9a-fA-F]+;)`
/**
 *      [66]  CharRef        ::= '&#' [0-9]+ ';'
 *                               | '&#x' [0-9a-fA-F]+ ';'
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  Characters referred to using character references must match
 *        the production for `Char`.
 */
const CharRef_RegExp = new RegExp (CharRef, "u")
export { CharRef_RegExp as CharRef }

const EntityRef = String.raw `(?:&${ Name };)`
/**
 *      [68]  EntityRef      ::= '&' Name ';'
 */
const EntityRef_RegExp = new RegExp (EntityRef, "u")
export { EntityRef_RegExp as EntityRef }

const Reference = String.raw `(?:${ EntityRef }|${ CharRef })`
/**
 *      [67]  Reference      ::= EntityRef | CharRef
 */
const Reference_RegExp = new RegExp (Reference, "u")
export { Reference_RegExp as Reference }

const AttValue =
	String.raw `(?:"(?:(?=${ Char })[^"<&]|${ Reference })*"|'(?:(?=${ Char })[^'<&]|${ Reference })*')`
/**
 *      [10]  AttValue       ::= '"' ([^<&"] | Reference)* '"'
 *                               |  "'" ([^<&'] | Reference)* "'"
 */
const AttValue_RegExp = new RegExp (AttValue, "u")
export { AttValue_RegExp as AttValue }

const SystemLiteral =
	String.raw `(?:"(?:(?=${ Char })[^"])*"|'(?:(?=${ Char })[^'])*')`
/**
 *      [11]  SystemLiteral  ::= ('"' [^"]* '"') | ("'" [^']* "'")
 */
const SystemLiteral_RegExp = new RegExp (SystemLiteral, "u")
export { SystemLiteral_RegExp as SystemLiteral }

const Comment =
	String.raw `(?:<!--(?:(?!-)${ Char }|-(?!-)${ Char })*-->)`
/**
 *      [15]  Comment        ::= '<!--' (
 *                                 (Char - '-') | ('-' (Char - '-'))
 *                               )* '-->'
 */
const Comment_RegExp = new RegExp (Comment, "u")
export { Comment_RegExp as Comment }

const CData =
	String.raw `(?:(?:(?!\])${ Char }|\](?!\])${ Char }|\]\](?!>)${ Char }|\]\]?$)*)`
/**
 *      [20]  CData          ::= (Char* - (Char* ']]>' Char*))
 */
const CData_RegExp = new RegExp (CData, "u")
export { CData_RegExp as CData }

const CDEnd = String.raw `(?:\]\]>)`
/**
 *      [21]  CDEnd          ::= ']]>'
 */
const CDEnd_RegExp = new RegExp (CDEnd, "u")
export { CDEnd_RegExp as CDEnd }

const Eq = String.raw `(?:${ S }?=${ S }?)`
/**
 *      [25]  Eq             ::= S? '=' S?
 */
const Eq_RegExp = new RegExp (Eq, "u")
export { Eq_RegExp as Eq }

const Attribute = String.raw `(?:${ Name }${ Eq }${ AttValue })`
/**
 *      [41]  Attribute      ::= Name Eq AttValue
 */
const Attribute_RegExp = new RegExp (Attribute, "u")
export { Attribute_RegExp as Attribute }

/*
The following regular expressions help to define the Market Commons ⅠⅠ
  syntax.
*/

const AttributesD·J =
	String.raw `(?:\{(?:${ S }?${ Attribute }(?:${ S }${ Attribute })*)?${ S }?\})`
/**
 *  Attributes declaration.
 *
 *      [🆐A] AttributesD·J  ::= '{' (
 *                                 S? Attribute (S Attribute)*
 *                               )? S? '}'
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  The same attribute name must not appear twice in a single
 *        attributes declaration.
 */
const AttributesD·J_RegExp = new RegExp (AttributesD·J, "u")
export { AttributesD·J_RegExp as AttributesD·J }

const SigilD·J = String.raw `(?:${ CharRef }+)`
/**
 *  Sigil declaration, provided as a sequence of character references.
 *
 *      [🆐B] SigilD·J       ::= CharRef+
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  The character referenced by CharRef must not match `S` or
 *        `'|'`.
 */
const SigilD·J_RegExp = new RegExp (SigilD·J, "u")
export { SigilD·J_RegExp as SigilD·J }

const SigilD·JPath =
	String.raw `(?:${ SigilD·J }(?:${ S }?//?${ S }?${ SigilD·J })*)`
/**
 *  Sigil path.
 *
 * A single solidus gives a child relationship; a double solidus gives
 *   a descendant relationship.
 *
 *      [🆐C] SigilD·JPath   ::= SigilD·J (S? '/' '/'? S? SigilD·J)*
 */
const SigilD·JPath_RegExp = new RegExp (SigilD·JPath, "u")
export { SigilD·JPath_RegExp as SigilD·JPath }

const DocumentD·J =
	String.raw `(?:<!DOCUMENT${ S }\[\[(?<documentTemplate>${ CData })${ CDEnd })`
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
 *
 *  ##  Capture groups  ##
 *
 *  01. `documentTemplate`: Template contents.
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  Template contents must be welformed X·M·L documents.
 *
 *   +  Template contents must contain exactly one of each of the
 *        following:
 *
 *       +  An empty element with local name `preamble` and namespace
 *            `tag:go.KIBI.family,2021:market`.
 *
 *       +  An empty element with local name `content` and namespace
 *            `tag:go.KIBI.family,2021:market`.
 *
 *   +  Template contents must not contain any other elements in the
 *        namespace `tag:go.KIBI.family,2021:market`.
 */
const DocumentD·J_RegExp = new RegExp (DocumentD·J, "u")
export { DocumentD·J_RegExp as DocumentD·J }

const SectionD·J =
	String.raw `(?:<!SECTION${ S }(?<sectionPath>${ SigilD·JPath })${ S }(?<sectionName>${ Name })(?:${ S }(?<sectionAttributes>${ AttributesD·J }))?${ S }(?<sectionHeadingName>${ Name })(?:${ S }(?<sectionHeadingAttributes>${ AttributesD·J }))?${ S }?>)`
/**
 *  Section declaration.
 *
 *  The second `Name` and `AttributesD·J` describes the heading which
 *    may be used to begin the section.
 *
 *      [🆐E] SectionD·J     ::= '<!SECTION' S SigilD·JPath
 *                               S Name (S AttributesD·J)?
 *                               S Name (S AttributesD·J)?
 *                               S? '>'
 *
 *
 *  ##  Capture groups  ##
 *
 *  01. `sectionPath`: Section sigil path.
 *
 *  02. `sectionName`: Section X·M·L element name.
 *
 *  03. `sectionAttributes` (optional): Section attributes declaration.
 *
 *  04. `sectionHeadingName`: Heading X·M·L element name.
 *
 *  05. `sectionHeadingAttributes` (optional): Heading attributes
 *        declaration.
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  For all nonfinal sigils in the section sigil path, there must
 *        be a previous section declaration which defines the sigil
 *        (in the context of any further preceding sigils).
 */
const SectionD·J_RegExp = new RegExp (SectionD·J, "u")
export { SectionD·J_RegExp as SectionD·J }

const HeadingD·J =
	String.raw `(?:<!HEADING(?:${ S }(?<headingSectionPath>${ SigilD·JPath })(?:${ S }(?<headingSectionStrict>>))?)?${ S }(?<headingSigil>${ SigilD·J })${ S }(?<headingName>${ Name })(?:${ S }(?<headingAttributes>${ AttributesD·J }))?(?:${ S }COUNTTO${ S }(?<headingCountTo>${ Name }(?:${ S }${ Name })*))?${ S }?>)`
/**
 *  Heading declaration.
 *
 *      [🆐F] HeadingD·J     ::= '<!HEADING' (
 *                                 S SigilD·JPath (S '>')?
 *                               )? S SigilD·J
 *                               S Name (S AttributesD·J)? (
 *                                 S 'COUNTTO' (S Name)+
 *                               )? S? '>'
 *
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
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  For all sigils in the section sigil path (if present), there
 *        must be a previous section declaration which defines the
 *        sigil (in the context of any further preceding sigils).
 */
const HeadingD·J_RegExp = new RegExp (HeadingD·J, "u")
export { HeadingD·J_RegExp as HeadingD·J }

const BlockD·J =
	String.raw `(?:<!BLOCK(?:${ S }(?<blockSectionPath>${ SigilD·JPath })(?:${ S }(?<blockSectionStrict>>))?)?${ S }(?:(?<blockPath>${ SigilD·JPath })|DEFAULT${ S }(?<blockSigil>${ SigilD·J }))${ S }(?:(?<blockName>${ Name })(?:${ S }(?<blockAttributes>${ AttributesD·J }))?(?:${ S }INLIST${ S }(?<blockListName>${ Name })(?:${ S }(?<blockListAttributes>${ AttributesD·J }))?)?|#${ S }(?<blockSpecial>COMMENT|LITERAL))${ S }?>)`
/**
 *  Block declaration.
 *
 *      [🆐G] BlockD·J       ::= '<!BLOCK' (
 *                                 S SigilD·JPath (S '>')?
 *                               )? S (
 *                                 SigilD·JPath | 'DEFAULT' S SigilD·J
 *                               ) S (
 *                                 Name (S AttributesD·J)? (
 *                                   S 'INLIST'
 *                                   S Name (S AttributesD·J)?
 *                                 )?
 *                                 | '#' S ('COMMENT' | 'LITERAL')
 *                               ) S? '>'
 *
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
 *  07. `blockListName` (optional): List X·M·L element name.
 *
 *  08. `blockListAttributes` (optional): List attributes declaration.
 *
 *  09. `blockSpecial` (optional): `COMMENT` if this sigil defines a
 *        comment block, or `LITERAL` if this sigil defines a literal
 *        block.
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  For all sigils in the section sigil path (if present), there
 *        must be a previous section declaration which defines the
 *        sigil (in the context of any further preceding sigils).
 *
 *   +  For all nonfinal sigils in the block sigil path, there must be
 *        a previous block declaration which defines the sigil (in the
 *        context of any further preceding sigils).
 *
 *   +  There must only be one `DEFAULT` block sigil for a given
 *        section sigil path with a given strictness.
 */
const BlockD·J_RegExp = new RegExp (BlockD·J, "u")
export { BlockD·J_RegExp as BlockD·J }

const InlineD·J =
	String.raw `(?:<!INLINE(?:${ S }(?<inlineSectionOrBlockPath>${ SigilD·JPath })(?:${ S }(?<inlineSectionOrBlockStrict>>))?(?:${ S }(?:(?<inlineBlockPath>${ SigilD·JPath })(?:${ S }(?<inlineBlockStrict>>))?|(?<inlineBlockAny>\*)))?)?${ S }(?<inlinePath>${ SigilD·JPath })${S}(?:(?<inlineName>${ Name })(?:${ S }(?<inlineAttributes>${ AttributesD·J }))?(?:${ S }TEXTFROM${ S }(?<inlineTextFrom>${ Name })|${ S }TEXTTO${ S }(?<inlineTextTo>${ Name }(?:${ S }${ Name })*))?|#${ S }(?<inlineSpecial>COMMENT|LITERAL))${ S }?>)`
/**
 *  Inline declaration.
 *
 *      [🆐H] InlineD·J      ::= '<!INLINE' (
 *                                 S SigilD·JPath (S '>')? (
 *                                   S (SigilD·JPath (S '>')? | '*')
 *                                 )?
 *                               )? S SigilD·JPath
 *                               S (
 *                                 Name (S AttributesD·J)? (
 *                                   S 'TEXTFROM' S Name
 *                                   | S 'TEXTTO' (S Name)+
 *                                 )?
 *                                 | '#' S ('COMMENT' | 'LITERAL')
 *                               ) S? '>'
 *
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
 *  09. `inlineTextFrom` (optional): An attribute name to pull text
 *        from.
 *
 *  10. `inlineTextTo` (optional): One or more attribute names to
 *        send text to.
 *
 *  11. `inlineSpecial` (optional): `COMMENT` if this sigil defines a
 *        comment block, or `LITERAL` if this sigil defines a literal
 *        block.
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  For all sigils in the section sigil path (if present), there
 *        must be a previous section declaration which defines the
 *        sigil (in the context of any further preceding sigils).
 *
 *   +  For all sigils in the block sigil path (if present), there must
 *        be a previous block declaration which defines the sigil (in
 *        the context of any further preceding sigils).
 *
 *   +  For all nonfinal sigils in the inline sigil path, there must be
 *        a previous inline declaration which defines the sigil (in the
 *        context of any further preceding sigils).
 */
const InlineD·J_RegExp = new RegExp (InlineD·J, "u")
export { InlineD·J_RegExp as InlineD·J }

const AttributeD·J =
	String.raw `(?:<!ATTRIBUTE(?:${ S }(?<attributeSectionOrBlockOrInlinePath>${ SigilD·JPath })(?:${ S }(?<attributeSectionOrBlockOrInlineStrict>>))?(?:${ S }(?:(?<attributeBlockOrInlinePath>${ SigilD·JPath })(?:${ S }(?<attributeBlockOrInlineStrict>>))?|(?<attributeBlockOrInlineAny>\*))(?:${ S }(?:(?<attributeInlinePath>${ SigilD·JPath })(?:${ S }(?<attributeInlineStrict>>))?|(?<attributeInlineAny>\*)))?)?)?${ S }(?<attributeSigil>${ SigilD·J })${ S }(?<attributeName>${ Name })${ S }?>)`
/**
 *  Attribute declaration.
 *
 *      [🆐I] AttributeD·J   ::= '<!ATTRIBUTE' (
 *                                 S SigilD·JPath (S '>')? (
 *                                   S (SigilD·JPath (S '>')? | '*') (
 *                                     S (SigilD·JPath (S '>')? | '*')
 *                                   )?
 *                                 )?
 *                               )? S SigilD·J (S Name)+ S? '>'
 *
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
 *  10. `attributeName`: Attribute X·M·L element name.
 *
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  For all sigils in the section sigil path (if present), there
 *        must be a previous section declaration which defines the
 *        sigil (in the context of any further preceding sigils).
 *
 *   +  For all sigils in the block sigil path (if present), there must
 *        be a previous block declaration which defines the sigil (in
 *        the context of any further preceding sigils).
 *
 *   +  For all sigils in the inline sigil path (if present), there
 *        must be a previous inline declaration which defines the
 *        sigil (in the context of any further preceding sigils).
 */
const AttributeD·J_RegExp = new RegExp (AttributeD·J, "u")
export { AttributeD·J_RegExp as AttributeD·J }

//  Declaraton of Jargon.
//  When processing, the external declarations are loaded first, so internal declarations *can* refer to them.
//  External Declarations of Jargon *may* themselves have a `SystemLiteral`, which must then be loaded.
//
//  Only `SystemLiteral`s which provide U·R·Ls are supported by this implementation.
//  The U·R·L `tag:go.KIBI.family,2021:market/html` refers to the default (H·T·M·L) Declaration of Jargon.
//  If no `SystemLiteral` is provided, no external declarations are loaded and internal declarations must be provided.
//
//      [🆐J] D·J            ::= '<?market-commons' S '2.0' (
//                                 S SystemLiteral
//                                 | (S SystemLiteral)? S '[' (
//                                   S
//                                   | DocumentD·J
//                                   | SectionD·J
//                                   | HeadingD·J
//                                   | BlockD·J
//                                   | InlineD·J
//                                   | AttributeD·J
//                                   | Comment
//                                 )* ']'
//                               ) S? '?>'
//
//  Capture groups:
//  01. `externalName`: A system identifier for an external Declaration of Jargon, when no internal declarations are provided (optional).
//  02. `externalSubset`: A system identifier for an external Declaration of Jargon, when internal declarations are also provided (optional).
//  03. `internalDeclarations`: Internal declarations (optional).
//
//  Validation constraints:
//   +  The system identifier must be resolvable to a Market Commons ⅠⅠ file which contains a Declaration of Jargon.
const D·J =
	String.raw `(?:<\?market-commons${ S }2\.0(?:${ S }(?<externalName>${ SystemLiteral })|(?:${ S }(?<externalSubset>${ SystemLiteral }))?${ S }\[(?<internalDeclarations>(?:${ S }|${ uncaptureNamedGroups(DocumentD·J) }|${ uncaptureNamedGroups(SectionD·J) }|${ uncaptureNamedGroups(HeadingD·J) }|${ uncaptureNamedGroups(BlockD·J) }|${ uncaptureNamedGroups(InlineD·J) }|${ uncaptureNamedGroups(AttributeD·J) }|${ Comment })*)\])${ S }?\?>\u{A})`
/**
 *  Declaration of Jargon.
 *
 *      [🆐J] D·J            ::= '<?market-commons' S '2.0' (
 *                                 S SystemLiteral
 *                                 | (S SystemLiteral)? S '[' (
 *                                   S
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
 *
 *  ##  Welformedness constraints  ##
 *
 *   +  The system identifier must be resolvable to a file which
 *        matches the `D·J` production.
 */
const D·J_RegExp = new RegExp (D·J, "u")
export { D·J_RegExp as D·J }
