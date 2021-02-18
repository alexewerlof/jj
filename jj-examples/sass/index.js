import { ready, html, frag, qut, col, css } from "../../index.js";

/*
.box {
  -webkit-transform: rotate(30deg);
  -ms-transform: rotate(30deg);
  transform: rotate(30deg);
}
*/
const transform = $property => ({
  WebkitTransform: $property,
  "-ms-transform": $property,
  transform: $property
});

const snippet0 = {
  '.box': {
    ...transform("rotate(30deg)")
  }
};

/*
aside[role="complementary"] {
  float: right;
  width: 31.25%;
}
*/
const snippet1 = {
  'aside[role="complementary"]': {
    float: "right",
    width: `${(300 / 960) * 100}%`
  }
};

/*
nav ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
nav li {
  display: inline-block;
}
nav a {
  display: block;
  padding: 6px 12px;
  text-decoration: none;
}
*/
const snippet2 = {
  'nav': {
    'ul': {
      margin: 0,
      padding: 0,
      listStyle: 'none'
    },
    'li': {
      display: 'inline-block'
    },
    'a': {
      display: 'block',
      padding: ['6px', '12px'],
      textDecoration: 'none'
    }
  }
};

/*
.accordion {
  max-width: 600px;
  margin: 4rem auto;
  width: 90%;
  font-family: "Raleway", sans-serif;
  background: #f4f4f4;
}
.accordion__copy {
  display: none;
  padding: 1rem 1.5rem 2rem 1.5rem;
  color: gray;
export function unitParse(str) {
    const parts = str.match(/([-+]?[0-9.]+)([%\w]*)/)
    if (parts) {
        const [, num, unit] = parts
        return { num, unit }
    }
}

export function unitFormat(num, unit) {
    return `${num}${unit}`
}
  line-height: 1.6;
  font-size: 14px;
  font-weight: 500;
}
.accordion__copy--open {
  display: block;
}
*/
const snippet3 = {
  ".accordion": {
    maxWidth: '600px',
    margin: ['4rem', "auto"],
    width: '90%',
    fontFamily: [qut("Raleway"), "sans-serif"],
    background: col("f4f4f4"),
    "&__copy": {
      display: "none",
      padding: ['1rem', '1.5rem', '2rem', '1.5rem'],
      color: "gray",
      lineHeight: 1.6,
      fontSize: '14px',
      fontWeight: 500,
      "&--open": {
        display: "block"
      }
    }
  }
};

/*
@media only screen and (max-width: 600px) {
  body {
    background-color: lightblue;
  }
}
*/

const snippet4 = {
  "@media only screen and (max-width: 600px)": {
    body: {
      backgroundColor: "lightblue",
      h1: {
        fontSize: '16px',
        "&.special": {
          color: "red"
        }
      }
    }
  }
};

const snippets = [snippet0, snippet1, snippet2, snippet3, snippet4];

html(document.body).style({
  backgroundColor: "#eee"
});

ready(() => {
  frag(
    snippets
      .map(snippet => css(snippet))
      .map((sty, i) => html("code")
        .text(`// Snippet #${i}\n`)
        .text(sty.toString())
        .wrap(html("pre"))
        .style({
          backgroundColor: "#333",
          color: "#eee",
          padding: "0.5em",
          borderRadius: "0.3em"
        })
    )
  ).appendToBody();
});
