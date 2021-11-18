# 🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript

This repository provides an implementation of the Market Commons ⅠⅠ
markup language into Ecmascript, usable with [Deno][Deno] (and in
browsers).

[Deno]: https://deno.land/

Market Commons ⅠⅠ is a sort of “extensible Markdown for X·M·L”; an
example follows&#x202F;:—

```market
<?market-commons 2.0 "tag:go.KIBI.family,2021:market/html" [
	<!-- Defines 🌈| … |🌈 as <mark class="RAINBOW">…</mark>. -->
	<!-- You must use character references when defining sigils! -->
	<!INLINE &#x1F308; mark { class="RAINBOW" }>
]?>
<!-- The following preamble will be inserted into the <head>:— -->
<title lang="en" xml:lang="en">My Market Commons ⅠⅠ Document</title>

@ {@en .MAIN #content} My Market Commons ⅠⅠ Document

This is a sample document written in #|Market Commons ⅠⅠ|#.
It is titled '|My Market Commons ⅠⅠ Document|' {.ARTICLE} and it is *|very|* interesting.
🌈|Wow!!|🌈 { data-rainbow-level=Infinity }
```

This produces the following X·M·L&#x202F;:—

```xml
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
	<meta charset="utf-8"/>
	<meta name="generator" content="market-commons 2.0&#xA;https://deno.land/x/market@VERSION"/>
	<!-- BEGIN PREAMBLE -->
<!-- The following preamble will be inserted into the <head>:— -->
<title lang="en" xml:lang="en">My Market Commons ⅠⅠ Document</title>
	<!-- END PREAMBLE -->
</head>
<body>
	<!-- BEGIN CONTENT -->
<article lang="en" xml:lang="en" class="MAIN" id="content">
	<h1 aria-level="1">My Market Commons ⅠⅠ Document</h1>
	<p>This is a sample document written in <b>Market Commons ⅠⅠ</b>.
It is titled <cite class="ARTICLE">My Market Commons ⅠⅠ Document</cite> and it is <em>very</em> interesting.
<mark class="RAINBOW" data-rainbow-level="Infinity">Wow!!</mark>
</p>
</article>
	<!-- END CONTENT -->
</body>
</html>
```

## Current Status

In development. Initial `v0.1.0` release (hopefully) late 2021.

The `v0.0.⸺` series of releases provide an initial preview of
underlying technologies (e.g. Declaration of Jargon processing), but do
not include a functioning parser.

<cite>🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript</cite> is a reference
implementation written with the hope of being easy to understand and
maintain. Faster algorithms for processing Market Commons ⅠⅠ documents
likely exist.

## Prerequisites

<cite>🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript</cite> requires a
contemporary Ecmascript environment with some additional D·O·M / Web
A·P·Is. In Deno (1.13+), the missing pieces are suitably filled in by
importing `./fauxbrowser/mod.js` from this directory.

This script will exhibit improper behaviour in environments where the
following test fails&#x202F;:—

```js
const re = /fails/uy;
re.lastIndex = "this test ".length;
"this test fails".replace(re, "succeeds");
```

## Limitations

In order to reduce the overall complexity and increase the
maintainability of this library, all X·M·L operations are routed
through the D·O·M. This results in certain limitations, which would
ideally be resolved in a more complete Market Commons ⅠⅠ
implementation&#x202F;:—

- Only X·M·L 1·0, not 1·1, documents are supported. Environments may
  throw errors when attempting to process Fifth Edition documents which
  are invalid in Fourth Edition.

- X·M·L entities are replaced, rather than preserved, during
  processing. There is no support for unparsed entities.

- The exact serialization of Market Commons ⅠⅠ documents may not be
  well‐defined, particularly with respect to such things as namespaces.

## Usage

<cite>🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript</cite> is available on
`deno.land/x` with the module name `market`.

```js
import { parse } from "https://deno.land/x/market@VERSION/mod.js";

//  Provides `DOMParser`, `TreeWalker`, and `XMLSerializer`.
//  Only necessary if you are in an environment (e.g., Deno) which
//    doesn’t already support those A·P·Is.
import "https://deno.land/x/market@VERSION/fauxbrowser/mod.ts";

parse(myDocumentText); //  returns an `XMLDocument`

/*  See `./market2xml.js` for a more extensive example.  */
```

Note that Market Commons ⅠⅠ produces files in the X·M·L, not H·T·M·L,
syntax. They should be served with a mediatype of `application/xml` or
`application/xhtml+xml` (or similar).

## Tips & Tricks

### Making Use of Entities

You can use X·M·L entity references to define re·usable components for
your webpage. This requires overriding the default document template,
but is fairly straightforward to do&#x202F;:—

```market
<?market-commons 2.0 "tag:go.KIBI.family,2021:market/html" [

	<!DOCUMENT [[
<!DOCTYPE html [
	<!-- You can define whatever entities in here you like. -->
	<!ENTITY cutie "(◡ ‿ ◡ ✿)">
]>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><preamble xmlns="tag:go.KIBI.family,2021:market"/></head>
<body><content xmlns="tag:go.KIBI.family,2021:market"/></body>
</html>
	]]>

]?>

girls &cutie;
```

Market Commons ⅠⅠ doesn’t process these entity references at all—this
is an ordinary feature of X·M·L.

### Complex Processing

Market Commons ⅠⅠ is essentially just a “lightweight” alternate syntax
for X·M·L. To achieve more complex processing of content, try combining
it with other Web technologies like X·S·L·T or H·T·M·L Custom Elements.

## Participation & Future

The goal of Market Commons ⅠⅠ is stability. The meaning of existing
documents should not change, and new features will be added rarely (if
ever). If there is a kind of document which is unbearably difficult for
you to produce in the current language, and you have an idea for an
extension to the Declaration of Jargon syntax which will make it
easier, feel free to let us know. Additions to the builtin Declarations
of Jargon may be considered if they are overwhelmingly useful and
unlikely to affect existing documents.

You can discuss the language, get help, and share things you made using
Market Commons ⅠⅠ via [GitHub Discussions][MC2E-Discussions].

[MC2E-Discussions]: https://github.com/marrus-sh/MarketCommons2-Ecmascript/discussions

The best way to assist with Market Commons ⅠⅠ right now is by writing
documentation, particularly of the Declaration of Jargon syntax and its
capabilities. Welwritten tests of various aspects of processing are
also appreciated.

If you have the ability to write a formal standard of the Market
Commons ⅠⅠ language, and/or to have it assigned a proper media type by
the Internet Assigned Numbers Authority—get in touch.

## Description of Market Commons ⅠⅠ

In lieu of a more formal specification, an overview of the Market
Commons ⅠⅠ markup language follows.

### Prologue

The prologue of a Market Commons ⅠⅠ document consists of one, both, or
neither of the following (in order)&#x202F;:—

1. **A Declaration of Jargon (D·J).** A document is deemed to contain a
   Declaration of Jargon if it begins with the string
   `<?market-commons`. While _not required_, including a Declaration of
   Jargon is _recommended_ to disambiguate Market Commons ⅠⅠ documents
   from [older syntaxes](./BREAKING.markdown).

   If not provided, the default Declaration of Jargon is as follows:

       <?market-commons 2.0 "tag:go.KIBI.family,2021:market/html"?>

2. **A preamble.** Preambles _must_ match the `content` production in
   X·M·L and _must not_ contain any successive line·breaks. If no
   Declaration of Jargon is present, preambles _must_ begin with a `<`.

   In the default H·T·M·L Declaration of Jargon, preambles are inserted
   into the `<head>` of the document.

Prologues are terminated after the first blank line (successive
line·break, with no other whitespace) following the Declaration of
Jargon (if present, or the first blank line in the document otherwise).

### Content

#### Whitespace and Characters

Market Commons ⅠⅠ documents use X·M·L 1.1 definitions for whitespace,
line breaking, and characters. They cannot contain any literal
`ReservedChar`, and cannot reference characters which are not
representable in X·M·L (like `U+0000`).

Characters can be escaped using ordinary X·M·L `Reference`s, which are
preserved in the output. The default (H·T·M·L) Declaration of Jargon
for Market Commons ⅠⅠ documents does _not_ define any entities, so e·g
`&aelig;` will produce invalid X·M·L. On the other hand, default
entities like `&lt;`, as well as character references like `&#x2764;`,
will work in every Market Commons ⅠⅠ document.

Byte‐order mark processing is considered out‐of‐band; the Market
Commons ⅠⅠ processor operates on Unicode text strings, not bytes. The
method of acquiring these text strings is left to implementations.

Support for X·M·L 1.1 (or X·M·L 1.0 Fifth Edition) output which is not
welformed under X·M·L 1.0 Fourth Edition is necessarily
environment-dependent.

#### Lines and Sigils

Market Commons ⅠⅠ content is a _line‐based_ syntax, meaning that markup
generally _cannot_ extend across linebreaks. Each line may begin with
zero or more sigils and contain some amount of inline content.

The available sigils vary depending on the markup type and the
Declaration of Jargon specified at the top of the file. Sigils _may_ be
separated from inline content, or further sigils, by whitespace.

#### Attributes

Certain locations in the Market Commons ⅠⅠ syntax allow for the
specification of attributes. Attributes are wrapped in curly braces and
consist of zero or more of the following syntaxes, separated by
A·S·C·I·I spaces or tabs&#x202F;:—

- `<sigil>value`: Assigns `value` to the attribute name defined by
  `sigil`.

- `name=value`: Assigns `value` to the attribute `name`.

- `name`: Assigns the empty string to the attribute `name`.

Attribute values can include whitespace through either of the following
mechanisms&#x202F;:—

- Escaping the whitespace using an X·M·L character reference (`&#x20;`
  or `&#x9;`).

- Specifying the same attribute multiple times, in which case the
  values will be joined (preserving order) with single spaces.

  ```market
  ]|NASA|]{/National /Aeronautics /and /Space /Administration}

  ; Produces:
  ;
  ; ` <p><abbr title="National Aeronautics and Space Administration">NASA</abbr>
  ; ` </p>
  ```

The default (H·T·M·L) Declaration of Jargon defines the following
attribute sigils&#x202F;:—

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
|  `#x7E` (`'~'`)  |   `content`    |

#### Chunks

The lines of a Market Commons ⅠⅠ document are broken up into “chunks”,
which can be either section, heading, or block in nature. The kind of
chunk is determined by the sigil which begins the first line: A section
sigil produces a section chunk; a heading sigil produces a heading
chunk; and a block sigil (or no sigil) produces a block chunk. Section
sigils take precedence over heading sigils which take precedence over
block sigils.

Section and heading chunks consist of only a single line. Block chunks
last up until the next line which contains only whitespace (A·S·C·I·I
spaces and tabs). The meaning of these chunks are explained in more
detail below:

##### Heading & Section Chunks

Heading and section chunks have fundamentally the same form.

_[To come.]_

##### Block Chunks

Block chunks represent a containing block element, optionally with
further block elements nested inside, and usually eventually containing
inline content.

_[To come.]_

#### Inline Content

_[To come.]_

##### Inlines

Inlines allow markup to be placed within the inline content of a block.
Inline markup consists of inline content surrounded by an open tag and
a close tag, which take the form of a sigil followed or preceded by a
`|` pipe character, respectively. Whitespace which surrounds inline
content is ignored.

```market
This is some *| inline |* content.

; Produces:
;
; ` <p>This is some <em>inline</em> content.
; ` </p>
```

Attributes can be attached to an inline following the close tag.
Whitespace may be placed between the two.

```market
An :| inline |: { data-with="attributes" }.

; Produces:
;
; ` <p>An <span data-with="attributes">inline</span>.
; ` </p>
```

An empty inline can be indicated using a `#` hash between two sigils,
like so&#x202F;:—

```market
These are the same:
@||@ {!http://www.example.com}
@#@ {!http://www.example.com}

; Produces:
;
; ` <p>These are the same:
; ` <a href="http://www.example.com">http://www.example.com</a>
; ` <a href="http://www.example.com">http://www.example.com</a>
; ` </p>
```

These have slightly different behaviours in the case of TEXTTO
inlines&#x202F;:—

```market
These are slightly different:
&||& { &./image.png }
&#& { &./image.png }

; Produces:
;
; ` <p>These are slightly different:
; ` <img alt="" src="./image.png"/>
; ` <img src="./image.png"/>
; ` </p>
```

Hash has a lower precedence than pipe&#x202F;:—

```market
:#:||:

; Produces:
;
; ` <p>:#<span></span>
; ` </p>
```

The default (H·T·M·L) Declaration of Jargon defines the following
inline sigils&#x202F;:—

|      Sigil       | Inline Name | Notes                                                         |
| :--------------: | :---------: | ------------------------------------------------------------- |
|  `#x21` (`'!'`)  |  `strong`   |                                                               |
|  `#x22` (`'"'`)  |     `q`     |                                                               |
|  `#x23` (`'#'`)  |     `b`     |                                                               |
|  `#x24` (`'$'`)  |    `var`    |                                                               |
|  `#x25` (`'%'`)  |   `mark`    |                                                               |
|  `#x26` (`'&'`)  |    `img`    | TEXTTO `alt`, `title`                                         |
|  `#x27` (`"'"`)  |   `cite`    |                                                               |
|  `#x2A` (`'*'`)  |    `em`     |                                                               |
|  `#x2B` (`'+'`)  |    `ins`    |                                                               |
|  `#x2C` (`','`)  |    `sub`    |                                                               |
|  `#x2D` (`'-'`)  |    `del`    |                                                               |
|  `#x2E` (`'.'`)  |   `ruby`    | Use `#x7B` (`'{'`) and `#x7D` (`'}'`) for `rb` and `rt`       |
|  `#x2F` (`'/'`)  |     `i`     |                                                               |
|  `#x3A` (`':'`)  |   `span`    |                                                               |
|  `#x3B` (`';'`)  |    _N/A_    | COMMENT: Contents (and attributes) are ignored                |
|  `#x3C` (`'<'`)  |   `samp`    |                                                               |
|  `#x3D` (`'='`)  |     `s`     |                                                               |
|  `#x3E` (`'>'`)  |    `kbd`    |                                                               |
|  `#x3F` (`'?'`)  |    `dfn`    |                                                               |
|  `#x40` (`'@'`)  |     `a`     | TEXTFROM `href` (if empty)                                    |
|  `#x5B` (`'['`)  |   `small`   |                                                               |
|  `#x5C` (`'\'`)  |    `br`     | TEXTTO `data-text`                                            |
|  `#x5D` (`']'`)  |   `abbr`    |                                                               |
|  `#x5E` (`'^'`)  |    `sup`    |                                                               |
|  `#x5F` (`'_'`)  |     `u`     |                                                               |
| `#x60` (``'`'``) |    _N/A_    | LITERAL: Contents are treated as X·M·L; attibutes are ignored |
|  `#x7E` (`'~'`)  |   `code`    |                                                               |

### Miscellaneous

Market Commons ⅠⅠ (as well as the original Market Commons) was designed
by [Margaret KIBI](https://go.KIBI.family/About/#me). This
implementation, <cite>🏪2️⃣🟠 Market Commons ⅠⅠ – Ecmascript</cite>, is
made available under the terms of
[the Mozilla Public License, v. 2.0](./LICENSE).

Market Commons documents have historically been distributed using the
`text/x.market` mediatype. However, `application/x.market` is likely a
better choice, and for Market Commons ⅠⅠ documents (until such a time
as a more formal registration is made) the latter is _recommended_.
Implementations which need to distinguish between Market Commons and
Market Commons ⅠⅠ documents _may_ use `text/x.market` for the former
and `application/x.market` for the latter, so relevant parties should
be advised.

Market Commons [ⅠⅠ] documents are usually given a `.market` extension.
A `.marketdj` extension is _recommended_ for external Declaration of
Jargon documents.

Make your source files available! Including a `<link>` element in the
preamble of your document will help others find the original Market
Commons ⅠⅠ source. The following is an example&#x202F;:—

```xml
<link rel="alternate" type="application/x.market" href="index.market"/>
```

[Behind the name.](https://youtu.be/NRNZo0PoNtU)

Historians may be interested in
[the original Market Commons][MarketCommons].

[MarketCommons]: <https://github.com/marrus-sh/MarketCommons-Racket>
