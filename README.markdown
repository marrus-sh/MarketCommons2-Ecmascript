#  🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript  #

This repository provides an implementation of the Market Commons ⅠⅠ
  markup language into Ecmascript, usable with
  [Deno](https://deno.land/) (and in browsers).

Market Commons ⅠⅠ is a sort of “extensible Markdown for X·M·L”; an
  example follows :—

```market
<?market-commons 2.0 "tag:go.KIBI.family,2021:market/html" [
	<!-- 🌈: <mark class="RAINBOW"> -->
	<!INLINE &#x1F308; mark { class="RAINBOW" }>
]?>
<title lang="en" xml:lang="en">My Market Commons ⅠⅠ Document</title>

@ {@en .MAIN #content} My Market Commons ⅠⅠ Document

This is a sample document written in #|Market Commons ⅠⅠ|#.
It is titled '|My Market Commons ⅠⅠ Document|' {.ARTICLE} and it is
  *|very|* interesting.
🌈|Wow!!|🌈
```

##  Current Status  ##

In development.
Initial release (hopefully) in early September 2021.

🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript is a reference implementation
  written with the hope of being easy to understand and maintain.
Faster algorithms for processing Market Commons ⅠⅠ documents likely
  exist.


##  Prerequisites  ##

🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript requires a contemporary
  Ecmascript environment with some additional D·O·M / Web A·P·Is.
In Deno (1.13+), the missing pieces are suitably filled in by importing
  `./fauxbrowser/mod.js` from this directory.
On the other hand, in browsers, the piece most likely to be missing is
  [`structuredClone()`][WindowOrWorkerGlobalScope.structuredClone].

[WindowOrWorkerGlobalScope.structuredClone]: https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/structuredClone


##  Usage  ##

🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript is available on `deno.land/x`
  with the module name `market`.

```js
import { parse } from "https://deno.land/x/market@VERSION/mod.js"

//  Provides `DOMParser`, `TreeWalker`, and `XMLSerializer`.
//  Only necessary if you are in an environment (e.g., Deno) which
//    doesn’t already support those A·P·Is.
import "https://deno.land/x/market@VERSION/fauxbrowser/mod.ts"

parse(myDocumentText)  //  returns an `XMLDocument`

/*  See `./market2xml.js` for a more extensive example.  */
```

Note that Market Commons ⅠⅠ produces files in the X·M·L, not H·T·M·L,
  syntax.
They should be served with a mediatype of `application/xml` or
  `application/xhtml+xml` (or similar).


##  Description of Market Commons ⅠⅠ  ##

In lieu of a more formal specification, an overview of the Market
  Commons ⅠⅠ markup language follows.


###  Prologue  ###

The prologue of a Market Commons ⅠⅠ document consists of one, both, or
  neither of the following (in order) :—

01. **A Declaration of Jargon (D·J).**
    A document is deemed to contain a Declaration of Jargon if it
      begins with the string `<?market-commons`.
    While *not required*, including a Declaration of Jargon is
      *recommended* to disambiguate Market Commons ⅠⅠ documents from
      [older syntaxes](./BREAKING.markdown).

    If not provided, the default Declaration of Jargon is as follows:

        <?market-commons 2.0 "tag:go.KIBI.family,2021:market/html"?>

02. **A preamble.**
    Preambles *must* match the `content` production in X·M·L and
      *must not* contain any successive line·breaks.
    If no Declaration of Jargon is present, preambles *must* begin
      with a `<`.

    In the default H·T·M·L Declaration of Jargon, preambles are
      inserted into the `<head>` of the document.

Prologues are terminated after the first blank line (successive
  line·break, with no other whitespace) following the Declaration of
  Jargon (if present, or the first blank line in the document
  otherwise).


###  Content  ###


####  Whitespace and Characters  ####

Market Commons ⅠⅠ documents use X·M·L 1.1 definitions for whitespace,
  line breaking, and characters.
They cannot contain any literal `ReservedChar`, and cannot reference
  characters which are not representable in X·M·L (like `U+0000`).

Characters can be escaped using ordinary X·M·L `Reference`s, which are
  preserved in the output.
The default (H·T·M·L) Declaration of Jargon for Market Commons ⅠⅠ
  documents does *not* define any entities, so e·g `&aelig;` will
  produce invalid X·M·L.
On the other hand, default entities like `&lt;`, as well as character
  references like `&#x2764;`, will work in every Market Commons ⅠⅠ
  document.

Byte‐order mark processing is considered out‐of‐band; the Market
  Commons ⅠⅠ processor operates on Unicode text strings, not bytes.
The method of acquiring these text strings is left to implementations.

Support for X·M·L 1.1 (or X·M·L 1.0 Fifth Edition) output which is not
  welformed under X·M·L 1.0 Fourth Edition is necessarily
  environment-dependent.


####  Lines and Sigils  ####

Market Commons ⅠⅠ content is a *line‐based* syntax, meaning that markup
  generally *cannot* extend across linebreaks.
Each line may begin with zero or more sigils and contain some amount of
  inline content.

The available sigils vary depending on the markup type and the
  Declaration of Jargon specified at the top of the file.
Sigils *may* be separated from inline content, or further sigils, by
  whitespace.


####  Attributes  ####

Certain locations in the Market Commons ⅠⅠ syntax allow for the
  specification of attributes.
Attributes are wrapped in curly braces and consist of zero or more of
  the following syntaxes, separated by A·S·C·I·I spaces or tabs :—

 +  `<sigil>value`: Assigns `value` to the attribute name defined by
      `sigil`.

 +  `name=value`: Assigns `value` to the attribute `name`.

 +  `name`: Assigns the empty string to the attribute `name`.

Attribute values can include whitespace through either of the following
  mechanisms :—

 +  Escaping the whitespace using an X·M·L character reference
      (`&#x20;` or `&#x9;`).

 +  Specifying the same attribute multiple times, in which case the
      values will be joined (preserving order) with single spaces.
    
        ]|NASA|]{/National /Aeronautics /and /Space /Administration}
        
        ; Produces:
        ;
        ; ` <p><abbr title="National Aeronautics and Space Administration">NASA</abbr>
        ; ` </p>

The default (H·T·M·L) Declaration of Jargon defines the following
  attribute sigils :—

|      Sigil       | Attribute Name |
| :--------------: | :------------: |
|  `#x21` (`'!'`)  |     `href`     |
|  `#x23` (`'#'`)  |      `id`      |
|  `#x24` (`'$'`)  |    `style`     |
|  `#x25` (`'%'`)  |   `resource`   |
|  `#x26` (`'&'`)  |     `src`      |
|  `#x2A` (`'*'`)  |   `tabindex`   |
|  `#x2C` (`','`)  |   `property`   |
|  `#x2E` (`'.'`)  |    `class`     |
|  `#x2F` (`'/'`)  |    `title`     |
|  `#x3B` (`';'`)  |    `typeof`    |
|  `#x3C` (`'<'`)  |     `rev`      |
|  `#x3D` (`'='`)  |     `role`     |
|  `#x3E` (`'>'`)  |     `rel`      |
|  `#x3F` (`'?'`)  |    `about`     |
|  `#x40` (`'@'`)  |     `lang`     |
|  `#x5E` (`'^'`)  |   `datatype`   |
| `#x60` (``'`'``) |     `type`     |
|  `#x7E` (`'~'`)  |   `content `   |


####  Chunks  ####

The lines of a Market Commons ⅠⅠ document are broken up into “chunks”,
  which can be either section, heading, or block in nature.
The kind of chunk is determined by the sigil which begins the first
  line:
A section sigil produces a section chunk; a heading sigil produces a
  heading chunk; and a block sigil (or no sigil) produces a block
  chunk.
Section sigils take precedence over heading sigils which take
  precedence over block sigils.

Section and heading chunks consist of only a single line.
Block chunks last up until the next line which contains only whitespace
  (A·S·C·I·I spaces and tabs).
The meaning of these chunks are explained in more detail below:


#####  Heading & Section Chunks  #####

Heading and section chunks have fundamentally the same form.

_[To come.]_


#####  Block Chunks  #####

Block chunks represent a containing block element, optionally with
  further block elements nested inside, and usually eventually
  containing inline content.

_[To come.]_


####  Inline Content  ####

_[To come.]_


#####  Inlines  #####

Inlines allow markup to be placed within the inline content of a block.
Inline markup consists of inline content surrounded by an open tag and
  a close tag, which take the form of a sigil followed or preceded by
  a `|` pipe character, respectively.
Whitespace which surrounds inline content is ignored.

    This is some *| inline |* content.
    
    ; Produces:
    ;
    ; ` <p>This is some <em>inline</em> content.
    ; ` </p>

Attributes can be attached to an inline following the close tag.
Whitespace may be placed between the two.

    An :| inline |: { data-with="attributes" }.
    
    ; Produces:
    ;
    ; ` <p>An <span data-with="attributes">inline</span>.
    ; ` </p>

An empty inline can be indicated using a `#` hash between two sigils,
  like so :—

    These are the same:
    @||@ {!http://www.example.com}
    @#@ {!http://www.example.com}
    
    ; Produces:
    ;
    ; ` <p>These are the same:
    ; ` <a href="http://www.example.com">http://www.example.com</a>
    ; ` <a href="http://www.example.com">http://www.example.com</a>
    ; ` </p>
    
Hash has a lower precedence than pipe :—

    :#:||:
    
    ; Produces:
    ;
    ; ` <p>:#<span></span>
    ; ` </p>


###  Miscellaneous  ###

Market Commons ⅠⅠ (as well as the original Market Commons) was designed
  by [Margaret KIBI](https://go.KIBI.family/About/#me).
This implementation, 🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript, is made
  available under the terms of
  [the Mozilla Public License, v. 2.0](./LICENSE).

Market Commons documents have historically been distributed using
  the `text/x.market` mediatype.
However, `application/x.market` is likely a better choice, and for
  Market Commons ⅠⅠ documents (until such a time as a more formal
  registration is made) the latter is *recommended*.
Implementations which need to distinguish between Market Commons and
  Market Commons ⅠⅠ documents *may* use `text/x.market` for the former
  and `application/x.market` for the latter, so relevant parties should
  be advised.

Market Commons [ⅠⅠ] documents are usually given a `.market` extension.
A `.marketdj` extension is *recommended* for external Declaration of
  Jargon documents.

Make your source files available!
Including a `<link>` element in the preamble of your document will help
  others find the original Market Commons ⅠⅠ source.
The following is an example :—

```xml
<link rel="alternate" type="application/x.market" href="index.market"/>
```

[Behind the name.](https://youtu.be/NRNZo0PoNtU)

Historians may be interested in
  [the original Market Commons][MarketCommons].

[MarketCommons]: <https://github.com/marrus-sh/MarketCommons-Racket>
