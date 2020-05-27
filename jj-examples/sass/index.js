import { sel, ready, html, frag, qut, perc, rem, col, px, css } from "../../index.js";

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
  [sel()
    .class("box")
    .rnd()]: {
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
  [sel()
    .el("aside")
    .attr("role", "complementary")]: {
    float: "right",
    width: perc((300 / 960) * 100)
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
  [sel("nav")]: {
    [sel().el("ul")]: {
      margin: 0,
      padding: 0,
      listStyle: "none"
    },
    [sel().el("li")]: {
      display: "inline-block"
    },
    [sel().el("a")]: {
      display: "block",
      padding: [px(6), px(12)],
      textDecoration: "none"
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
  [sel().class("accordion")]: {
    maxWidth: px(600),
    margin: [rem(4), "auto"],
    width: perc(90),
    fontFamily: [qut("Raleway"), "sans-serif"],
    background: col("f4f4f4"),
    [sel("&").E("copy")]: {
      display: "none",
      padding: [rem(1), rem(1.5), rem(2), rem(1.5)],
      color: "gray",
      lineHeight: 1.6,
      fontSize: px(14),
      fontWeight: 500,
      [sel("&").M("open")]: {
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
        fontSize: px(16),
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
