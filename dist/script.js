const legendHeight = 140;
const margin = {
  top: 20,
  bottom: legendHeight + 10,
  left: 20,
  right: 20,
};

const w = 1400 - margin.left - margin.right;
const h = 900 - margin.top - margin.bottom;

const url =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";

/*other datasets links
Movies 
 https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json


Video games
https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json

Kickstarter
https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json

*/

const colors = [
  "#1f78b4",
  "#a6cee3",
  "#b2df8a",
  "#ff7f00",
  "#33a02c",
  "#fb9a99",
  "#e31a1c",
  "#fdbf6f",
  "#cab2d6",
  "#6a3d9a",
  "#ffff99",
  "#b15928",
  "#8dd3c7",
  "#ffffb3",
  "#bebada",
  "#fb8072",
  "#80b1d3",
  "#fdb462",
  "#b3de69",
  "#fccde5",
  "#d9d9d9",
  "#bc80bd",
  "#ccebc5",
  "#ffed6f",
];

let fontSize = 12;
let textXOffset = 3;
let textYOffset = fontSize;
let tspanYOffset = fontSize;

const title = d3
  .select("body")
  .append("h1")
  .attr("id", "title")
  .text("Kickstarter Funding");

const description = d3
  .select("body")
  .append("h3")
  .attr("id", "description")
  .text(
    "Top 100 Kickstarter Campaign based on Funding grouped in different categories"
  );

const svg = d3
  .select("body")
  .append("div")
  .attr("id", "section")
  .append("svg")
  .attr("width", w)
  .attr("height", h + margin.bottom)
  .attr("id", "tree-map")
  .attr("transfomr", "translate(" + margin.left + "," + margin.top + ")");

const tooltip = d3
  .select("body")
  .append("div")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("opacity", "0");

function ready(data) {
  let childrenOfParent = data.children;

  //sorting parents by their total value
  function totalSum(parent) {
    let total = parent.children.reduce((ag, item) => {
      ag = ag + Number(item.value);
      return ag;
    }, 0);
    return {
      name: parent.name,
      value: total,
    };
  }

  let parentSums = [];

  for (let i = 0; i < childrenOfParent.length; i++) {
    parentSums.push(totalSum(childrenOfParent[i]));
  }

  childrenOfParent.sort((a, b) => {
    let p1 = parentSums.find((item) => item.name == a.name);
    let p2 = parentSums.find((item) => item.name == b.name);
    return p2.value - p1.value;
  });
  const root = d3.hierarchy(data).sum((d) => d.value);

  d3.treemap().size([w, h]).paddingTop(0).paddingLeft(0).paddingInner(1)(root);

  //color scale
  const color = d3
    .scaleOrdinal()
    .range(colors)
    .domain(root.children.map((d) => d.data.name));

  //rectangle tiles generation from root variable

  svg
    .selectAll(".none")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "tiles")
    .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")")
    .append("rect")
    .attr("class", "tile")
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.data.value)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .attr("fill", (d) => color(d.parent.data.name))
    .on("mouseover", (event, d) => {
      s = Object.assign(d3.formatSpecifier("s"), {
        precision: d3.precisionFixed(0.01),
      });

      tooltip
        .style("top", event.pageY + "px")
        .style("left", event.pageX + "px")
        .attr("data-value", d.data.value)
        .style("opacity", "0.8")
        .html(
          "Name: " +
            d.data.name +
            "<br>" +
            "Category: " +
            d.data.category +
            "<br>" +
            "Value: " +
            d3.format(s)(Number(d.data.value))
        );
    })
    .on("mousemove", (event, d) => {
      s = Object.assign(d3.formatSpecifier("s"), {
        precision: d3.precisionFixed(0.01),
      });

      tooltip
        .style("top", event.pageY + "px")
        .style("left", event.pageX + "px")
        .attr("data-value", d.data.value)
        .html(
          "Name: " +
            d.data.name +
            "<br>" +
            "Category: " +
            d.data.category +
            "<br>" +
            "Value: " +
            d3.format(s)(Number(d.data.value))
        );
    })
    .on("mouseout", (d) => {
      tooltip.style("opacity", "0");
    })
    .append("text");

  //tile-text
  svg
    .selectAll(".none")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("x", (d) => d.x0 + textXOffset)
    .attr("y", (d) => d.y0 + textYOffset)
    .attr("class", "text-label")
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .text(" ")
    .style("font-size", fontSize)
    .selectAll(".none")
    .data((d) => {
      let arr = d.data.name.split(/\s|(?<=[/])/);
      if (arr.length * fontSize > d.y1 - d.y0) {
        arr = arr.slice(0, Math.floor(d.y1 - d.y0) / fontSize);
      }
      let newObj = arr.map((item, i) => {
        let setObj = {
          word: item,
          x0: d.x0 + textXOffset,
          y0: d.y0 + i * tspanYOffset + textYOffset,
        };

        return setObj;
      });
      return newObj;
    })
    .enter()
    .append("tspan")
    .text((d) => d.word)
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0);

  //legend

  let legendX = w / 2 - 60;
  let legendY = h + 30;
  let legendYGap = 20;
  let legendXGap = 150;
  let legendCentre = w / 2 - 1.5 * legendXGap;
  let legendTextOffset = 15;

  svg
    .append("g")
    .attr("id", "legend")
    .selectAll(".none")
    .data(color.range().slice(0, color.domain().length))
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("fill", (d) => {
      return d;
    })
    .attr("y", (d, i) => {
      return legendY + legendYGap * (i % 6);
    })
    .attr("width", 15)
    .attr("height", 10)
    .attr("x", (d, i) => legendCentre + Math.floor(i / 6) * legendXGap);

  svg
    .selectAll(".none")
    .data(color.domain())
    .enter()
    .append("text")
    .text((d) => d)
    .attr("y", (d, i) => {
      return legendY + legendYGap * (i % 6) + 11;
    })
    .attr("width", 15)
    .attr("height", 10)
    .attr("x", (d, i) => legendCentre + Math.floor(i / 6) * legendXGap + 20);

  // attribution 
  d3.select('body')
  .append('p')
  .attr('id','attribution')
  .html('<strong>Attribution</strong>: This chart is an exact replica of freecodecamp project at the url: <a href="https://treemap-diagram.freecodecamp.rocks/">https://treemap-diagram.freecodecamp.rocks/</a> and it was done as a part of coursework of data visualisation on freecodecamp.')
}

d3.json(url)
  .then(ready)
  .catch((err) => {
    console.log(err);
  });
