#  Breaking Changes From Market Commons to Market Commons ⅠⅠ  #

The following is a list of known incompatibilities between documents
  written in the original Market Commons format and a Market Commons ⅠⅠ
  processor.

 +  Market Commons ⅠⅠ occasionally throws errors!

    **Rationale:** Sometimes this is better!

 +  Spaces are now allowed between any two line‐initial sigils,
      including in section and heading chunks.

    **Rationale:** It is simpler to keep this behaviour consistent, and
      the old behaviour allowed for the easy specification of empty
      headings (which is not something which should be easy).

 +  Support for media elements has changed and been reduced; for
      simplicity, Market Commons ⅠⅠ only supports `<img>` and not
      `<video>` or multiple sources.
    Use inline or block literals if you need this functionality.

    **Rationale:** The way media was handled was pretty magic and
      difficult to generalize in an extensible manner.

 +  Ruby support has been modified to work like other inline elements.
    Instead of `.| base | text |.`, write `.| base }| text |} |.` (or
      `.| {| base |{}| text |} |.`).

    **Rationale:** The original ruby implementation was always finicky
      and may have had bugs.

 +  Market Commons ⅠⅠ preserves references (like `&this;`) instead of
      escaping the ampersand.
    (Note that H·T·M·L entities like `&aelig;` are *not* defined by
      default in Market Commons ⅠⅠ.)
    This can be combined with Market Commons ⅠⅠ Declarations of Jargon
      to define reusable components for documents.
    Backslash‐escapes like ` \U+2764\ ` are no longer supported; use
      character references like `&#x2764;` instead.

    **Rationale:** Entity references are a powerful capability of X·M·L
      and form a better solution for re·usable content than anything
      Market Commons could offer.
    There’s no point in maintaining two ways of escaping characters;
      if X·M·L references are supported, then they should be used.
    This frees up ` \ ` as a potential sigil and makes inserting
      literal whitespace into documents simpler.

 +  Empty inline elements can now be specified using a `#` surrounded
      by sigils.

    **Rationale:** Having a distinct empty element syntax makes it
      clearer when a lack of content is intentional.

 +  `||` is no longer supported as a way of specifying linebreaks.
    Instead, use ` \#\ ` or ` \||\ `.

    **Rationale:** Having a special syntax for just one kind of empty
      element is silly.
    `||` was always kind of a weird special case in processing anyway.

 +  Sections are now closed by some number of `|` pipe characters,
      instead of `/` solidi.

    **Rationale:** This frees up `/` as an ordinary sigil instead of
      making it a special case.
    Importantly, `/| |/` was already being used as an inline tag.

 +  Whitespace behaviour has been made more sensible, which means that
      whitespace output may differ in some cases.

    **Rationale:** The original behaviour was just “what is easy to
      program in Racket”.

 +  Various changes in the formatting of output (which should not
      affect the rendered result).
    In general, less whitespace has been introduced, to enable Market
      Commons ⅠⅠ to be used more readily in contexts where whitespace
      is significant.
