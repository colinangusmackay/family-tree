function loadJson(filename, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', filename, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      var actualJson = JSON.parse(xobj.responseText);
      callback(actualJson);
    }
  };
  xobj.send(null);
}

function autoBox() {
  document.body.appendChild(this);
  const { x, y, width, height } = this.getBBox();
  document.body.removeChild(this);
  return [x, y, width, height];
}

function wrap(nodes, width) {
  nodes.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = 1;
    tspan = text.text(null).append("tspan").attr("x", width / 2).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      const computedLength = tspan.node().getComputedTextLength();
      if (computedLength > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        if (tspan.text() != "")
          tspan = text.append("tspan").attr("x", width / 2).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function drawHierarchyChart(options) {
  const dataFile = options.dataFile;
  const peopleDir = options.peopleDir;

  const zebraStripe = "#FFE", zebraStripeAlt = "#EFE";
  const maleColour = "#77F", femaleColour = "#F9F", nonBinaryColour = "#9F9";
  const treeWidth = 300;
  const columnWidth = 100;
  const columns = [
    {
      label: "Birth",
      value: d => d.DateOfBirth,
      x: treeWidth + columnWidth
    },
    {
      label: "Death",
      value: d => d.DateOfDeath,
      x: treeWidth + (2 * columnWidth)
    }
  ];
  const width = treeWidth + (columnWidth * columns.length);

  function title(row) {
    const data = row.data;
    const relationship = data.Relationship != 'Self' ? ` ${data.Relationship} of` : "";
    const person = `${data.Name} (${data.DateOfBirth} - ${data.DateOfDeath})${relationship}`;
    return person;
  }

  function shouldBeLink(data) {
    return data.Name != "X" || data.Relationship != "Self";
  }

  console.log("Loading " + dataFile)
  loadJson(dataFile, function (data) {
    const root = (function () { let i = 0; return d3.hierarchy(data, options.nextLevel).eachBefore(d => d.index = i++); })();
    const nodeSize = 17;
    const nodes = root.descendants();
    const svg = d3.create("svg")
      .attr("viewBox", [-nodeSize / 2, -nodeSize * 3 / 2, width, (nodes.length + 1) * nodeSize])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .style("overflow", "visible");

    svg.append("g")
      .attr("stroke", "none")
      .selectAll("rect")
      .data(root.descendants())
      .join("rect")
      .attr("y", (d, i) => (i * nodeSize) - (nodeSize / 2))
      .attr("height", nodeSize)
      .attr("width", width)
      .attr("fill", (d, i) => i % 2 == 0 ? zebraStripe : zebraStripeAlt)


    const link = svg.append("g")
      .attr("fill", "none")
      .attr("stroke", "#999")
      .selectAll("path")
      .data(root.links())
      .join("path")
      .attr("d", d => `
              M${d.source.depth * nodeSize},${d.source.index * nodeSize}
              V${d.target.index * nodeSize}
              h${nodeSize}
            `);

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("transform", d => `translate(0,${d.index * nodeSize})`);

    node.append("circle")
      .attr("cx", d => d.depth * nodeSize)
      .attr("r", 2.5)
      .attr("fill", d => d.data.Gender == "Male"
        ? maleColour
        : d.data.Gender == "Female"
          ? femaleColour
          : nonBinaryColour);

    node.filter(d => shouldBeLink(d.data))
      .append("a")
      .attr("href", d => peopleDir + d.data.Id)
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", d => d.depth * nodeSize + 6)
      .text(d => d.data.Name);

    node.filter(d => !shouldBeLink(d.data))
      .append("text")
      .attr("dy", "0.32em")
      .attr("x", d => d.depth * nodeSize + 6)
      .text(d => d.data.Name);

    node.append("title")
      .text(d => d.ancestors()
        .map(d => title(d))
        .join("\n"));

    for (const { label, value, x } of columns) {
      svg.append("text")
        .attr("dy", "0.32em")
        .attr("y", -nodeSize)
        .attr("x", x)
        .attr("text-anchor", "end")
        .attr("font-weight", "bold")
        .text(label);

      node.append("text")
        .attr("dy", "0.32em")
        .attr("x", x)
        .attr("text-anchor", "end")
        .attr("fill", d => d.children ? null : "#555")
        .data(root.copy().each(value).descendants())
        .text(d => value(d.data));
    }

    const result = svg.node();
    const div = document.getElementById(options.destinationElementId);
    div.appendChild(result);
  });

}

function drawAncestorChart(dataDir, peopleDir) {
  drawHierarchyChart({
    dataFile: dataDir + "ancestors.json",
    peopleDir: peopleDir,
    nextLevel: d => d.Parents,
    destinationElementId: "ancestors"
  })
}

function drawDescendantChart(dataDir, peopleDir) {
  drawHierarchyChart({
    dataFile: dataDir + "descendants.json",
    peopleDir: peopleDir,
    nextLevel: d => d.Children,
    destinationElementId: "descendants"
  })
}

function drawImmediateFamilyTree(dataDir, peopleDir) {
  const maleColour = "#EEF", femaleColour = "#FEF", nonBinaryColour = "#EFE";
  const maleColourDark = "#668", femaleColourDark = "#868", nonBinaryColourDark = "#686";
  const spouseLineColours = ["#000", "#808", "#080"];

  const dataFile = dataDir + "family-tree.json";
  console.log("Loading " + dataFile)
  loadJson(dataFile, function (data) {
    const nodeWidth = 100;
    const nodeHeight = 75;
    const verticalPadding = 50;
    const horizontalPadding = 25;

    const parentCount = data.Parents.length;
    const genZeroCount = data.Siblings.length + data.Spouses.length;
    const childCount = data.Children.length;

    const widestRow = Math.max(parentCount, genZeroCount, childCount);

    const width = (widestRow * nodeWidth) + ((widestRow - 1) * horizontalPadding);
    const midHorizontal = width / 2;
    const parentRowWidth = (parentCount * nodeWidth) + ((parentCount - 1) * horizontalPadding);
    const genZeroRowWidth = (genZeroCount * nodeWidth) + ((genZeroCount - 1) * horizontalPadding);
    const childRowWidth = (childCount * nodeWidth) + ((childCount - 1) * horizontalPadding);


    function renderPeople(node) {
      function renderTitle(data) {
        let result = data.Name;
        if (data.RelationToSubject && data.RelationToSubject != 'self')
          result += ` (${data.RelationToSubject})`;
        if (data.DateOfBirth)
          result += `\nBirth: ${data.DateOfBirth}`;
        if (data.DateOfDeath)
          result += `\nDeath: ${data.DateOfDeath}`;
        return result;
      }

      node.append("rect")
        .attr("height", nodeHeight)
        .attr("width", nodeWidth)
        .attr("stroke", d => d.Gender == "Male"
          ? maleColourDark
          : d.Gender == "Female"
            ? femaleColourDark
            : nonBinaryColourDark)
        .attr("opacity", d => d.RelationToSubject == 'self' ? 1 : 0.5)
        .attr("fill", d => d.Gender == "Male"
          ? maleColour
          : d.Gender == "Female"
            ? femaleColour
            : nonBinaryColour);

      node.filter(d => d.Name == "X")
        .append("text")
        .attr("fill", "#000")
        .attr("x", nodeWidth / 2)
        .attr("y", nodeHeight / 20)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(d => d.Name)
        .call(wrap, nodeWidth);

      node.filter(d => d.Name != "X")
        .append("a")
        .attr("href", d => peopleDir + d.Id)
        .append("text")
        .attr("fill", "#000")
        .attr("x", nodeWidth / 2)
        .attr("y", nodeHeight / 20)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .text(d => d.Name)
        .call(wrap, nodeWidth);

      node.append("text")
        .attr("fill", "#000")
        .attr("x", nodeWidth / 2)
        .attr("y", nodeHeight - (nodeHeight / 20))
        .attr("dy", "-1em")
        .attr("text-anchor", "middle")
        .text(d => d.DateOfDeath);

      node.append("text")
        .attr("fill", "#000")
        .attr("x", nodeWidth / 2)
        .attr("y", nodeHeight - (nodeHeight / 20))
        .attr("dy", "-2.1em")
        .attr("text-anchor", "middle")
        .text(d => d.DateOfBirth);

      node.append("title")
        .text(renderTitle);
    }

    function getGenerationZeroPeople() {
      const selfIndex = data.Siblings.findIndex(s => s.RelationToSubject == "self");
      const genZeroPeople = data.Siblings.slice(); // This makes a copy
      genZeroPeople.splice(selfIndex + 1, 0, ...data.Spouses);
      return { selfIndex, genZeroPeople };
    }


    function renderParentNodes() {
      const {selfIndex, genZeroPeople} = getGenerationZeroPeople();
      const allParentGroups = genZeroPeople
        .flatMap(p => p.ParentGroupIds ? p.ParentGroupIds : [])
        .filter( (v,i,a) => a.findIndex( e => e.length === v.length && e.every((vv,ii) => vv == v[ii])) === i);
      console.log("Parent Groups:");
      console.log(parentGroups);


      const parentNodes = svg.append("g")
        .selectAll("g")
        .data(data.Parents)
        .join("g")
        .attr("transform", (d, i) =>
          `translate(${(midHorizontal - (parentRowWidth / 2)) + (i * (nodeWidth + horizontalPadding))},0)`);

      renderPeople(parentNodes);
    }

    function renderChildNodes() {
      const childNodes = svg.append("g")
        .selectAll("g")
        .data(data.Children)
        .join("g")
        .attr("transform", (d, i) => `translate(${(midHorizontal - (childRowWidth / 2)) + (i * (nodeWidth + horizontalPadding))},${(nodeHeight * 2) + (verticalPadding * 2)})`);

      renderPeople(childNodes);
    }

    function renderGenerationZero() {
      const { selfIndex, genZeroPeople } = getGenerationZeroPeople();
      const genZeroRowY = nodeHeight + verticalPadding;
      const spouseCount = data.Spouses.length;
      const spouseOffsetY = nodeHeight / (spouseCount + 1);
      const spouseOffsetX = nodeWidth / (spouseCount + 1);
      const spouseGapOffsetY = verticalPadding / (spouseCount + 1);

      const selfRightX = (midHorizontal - (genZeroRowWidth / 2)) + (selfIndex * (nodeWidth + horizontalPadding)) + nodeWidth;

      data.Spouses.forEach(function (sd, i) {
        const colour = spouseLineColours[i % spouseLineColours.length];
        const spouseY = genZeroRowY + (i + 1) * spouseOffsetY;
        const spouseX = selfRightX + (i * nodeWidth) + ((i + 1) * horizontalPadding);
        const g = svg.append("g")
          .attr("stroke", colour)
          .attr("fill", "none");
        g.append("line")
          .attr("x1", selfRightX)
          .attr("y1", spouseY)
          .attr("x2", spouseX)
          .attr("y2", spouseY);
        
        data.Children.forEach(function(cd, ci) {
          if (cd.ParentIds.some(pid => pid == sd.Id)) {
            g.append("path")
            .attr("d", `M${spouseX-(horizontalPadding/2)},${spouseY}
              v${(spouseOffsetY * (spouseCount - i)) + (spouseGapOffsetY * (i + 1))}
              H${(midHorizontal - (childRowWidth / 2)) + (ci * (nodeWidth + horizontalPadding)) + (spouseOffsetY * (i+1))}
              v${spouseGapOffsetY * (spouseCount - i)}
              `);
          }
        });
      });

      const genZeroNodes = svg.append("g")
        .selectAll("g")
        .data(genZeroPeople)
        .join("g")
        .attr("transform", (d, i) => `translate(${(midHorizontal - (genZeroRowWidth / 2)) + (i * (nodeWidth + horizontalPadding))},${genZeroRowY})`);

      renderPeople(genZeroNodes);
    }

    const svg = d3.create("svg")
      .attr("viewBox", [0, 0, (widestRow * nodeWidth) + ((widestRow - 1) * horizontalPadding), (3 * nodeHeight) + (2 * verticalPadding)])
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .style("overflow", "visible");

    const result = svg.node();
    const div = document.getElementById("immediateFamilyTree");
    div.appendChild(result);

    renderParentNodes();

    renderChildNodes();

    renderGenerationZero();

  });


}