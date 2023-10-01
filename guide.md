# mdbin guide

`mdbin` is a [Markdown](https://en.wikipedia.org/wiki/Markdown) pastebin. It is heavily inspired by [rentry.co](https://rentry.co), but is [free and open-source](https://github.com/kevinfiol/mdbin), and easily self-hostable.

`mdbin` uses [marked.js](https://marked.js.org/#specifications) for Markdown parsing, and thus supports all features of marked.js.

The following guide has been adapted with modifications from [learnxinyminutes](https://learnxinyminutes.com/docs/markdown/).

<div class="toc">
   <ul>
      <li><a href="#mdbin-guide">mdbin guide</a></li>
      <ul>
         <li><a href="#html-elements">HTML Elements</a></li>
         <li><a href="#headings">Headings</a></li>
         <li><a href="#simple-text-styles">Simple text styles</a></li>
         <li><a href="#paragraphs">Paragraphs</a></li>
         <li><a href="#blockquotes">Blockquotes</a></li>
         <li><a href="#lists">Lists</a></li>
         <li><a href="#task-lists">Task Lists</a></li>
         <li><a href="#code-blocks">Code Blocks</a></li>
         <li><a href="#horizontal-rule">Horizontal rule</a></li>
         <li><a href="#links">Links</a></li>
         <li><a href="#table-of-contents">Table of Contents</a></li>
         <li><a href="#images">Images</a></li>
         <li><a href="#tables">Tables</a></li>
      </ul>
   </ul>
</div>

## Custom URLs

When saving a new paste, you may choose to use a custom URL.
* The maximum URL length is 40 characters.
* The only reserved URL is `guide`, for the guide you are reading right now.
* If a custom URL is not provided, it will be generated for you.

## Edit Codes

You may optionally protect your paste from edits and deletion using a custom edit code.

If a custom edit code is not provided, anyone can edit or delete your paste.

## HTML Elements

Markdown is a superset of HTML, so any HTML file is valid Markdown. `mdbin` automatically sanitizes untrusted HTML.

```md
<!--This means we can use HTML elements in Markdown, such as the comment
element, and they won't be affected by a markdown parser. However, if you
create an HTML element in your markdown file, you cannot use markdown syntax
within that element's contents.-->
```

## Headings

```md
# This is an <h1>
## This is an <h2>
### This is an <h3>
#### This is an <h4>
##### This is an <h5>
###### This is an <h6>
```

Markdown also provides us with two alternative ways of indicating h1 and h2.

```md
This is an h1
=============

This is an h2
-------------
```

## Simple text styles

```md
*This text is in italics.*
_And so is this text._

**This text is in bold.**
__And so is this text.__

***This text is in both.***
**_As is this!_**
*__And this!__*

~~This text is rendered with strikethrough.~~
```

## Paragraphs

```md
This is a paragraph. I'm typing in a paragraph isn't this fun?

Now I'm in paragraph 2.
I'm still in paragraph 2 too!


I'm in paragraph three!
```

## Blockquotes

```md
> This is a block quote. You can either
> manually wrap your lines and put a `>` before every line or you can let your lines get really long and wrap on their own.
> It doesn't make a difference so long as they start with a `>`.

> You can also use more than one level
>> of indentation?
> How neat is that?
```

## Lists

```md
* Item
* Item
* Another item

or

+ Item
+ Item
+ One more item

or

- Item
- Item
- One last item

or

1. Item one
2. Item two
3. Item three

or

1. Item one
1. Item two
1. Item three

or

1. Item one
2. Item two
3. Item three
    * Sub-item
    * Sub-item
4. Item four
```

## Task Lists

```md
Boxes below without the 'x' are unchecked HTML checkboxes.
- [ ] First task to complete.
- [ ] Second task that needs done
This checkbox below will be a checked HTML checkbox.
- [x] This task has been completed
```

## Code Blocks

<pre>
```ruby
  def foobar
      puts "Hello world!"
  end
```
</pre>

## Horizontal rule
```md
***
---
- - -
****************
```

## Links

```md
[Click me!](http://test.com/)

[Click me!](http://test.com/ "Link to Test.com")

Relative paths work too:
[Go to music](/music/).

And reference style links:
[Click this link][link1] for more info about it!
[Also check out this link][foobar] if you want to.

[link1]: http://test.com/ "Cool!"
[foobar]: http://foobar.biz/ "Alright!"
```

## Table of Contents

```md
- [Heading](#heading)
- [Another heading](#another-heading)
- [Chapter](#chapter)
  - [Subchapter <h3 />](#subchapter-h3-)
```

`mdbin` also supports automatically generated table of contents using the `[[[TOC]]]` token. For example, typing this:

```md
Here is the table of contents:

[[[TOC]]]
```

Will generate the table of contents containing all headings in your document.

## Images

```md
![This is the alt-attribute for my image](http://imgur.com/myimage.jpg "An optional title")
```

## Tables

```md
| Col1         | Col2     | Col3          |
| :----------- | :------: | ------------: |
| Left-aligned | Centered | Right-aligned |
| blah         | blah     | blah          |
```

or:

```md
Col 1 | Col2 | Col3
:-- | :-: | --:
Ugh this is so ugly | make it | stop
```