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
    const {x, y, width, height} = this.getBBox();
    document.body.removeChild(this);
    return [x, y, width, height];
  }


  function drawAncestorChart(dataDir, peopleDir){
      const zebraStripe = "#FFE", zebraStripeAlt = "#EFE";
      const maleColour = "#77F", femaleColour = "#F9F", nonBinaryColour = "#9F9";
    const ancestorsFile = dataDir+"ancestors.json";
    const treeWidth = 300;
    const columnWidth = 100;
    const columns = [
        {
          label: "Birth", 
          value: d => d.DateOfBirth, 
          x: treeWidth+columnWidth
        },
        {
          label: "Death", 
          value: d => d.DateOfDeath, 
          x: treeWidth + (2*columnWidth)
        }
      ];
    const width = treeWidth + (columnWidth * columns.length);
    
    function title(row){
        const data = row.data;
        const relationship = data.Relationship != 'Self' ? ` ${data.Relationship} of` : "";
        const person = `${data.Name} (${data.DateOfBirth} - ${data.DateOfDeath})${relationship}`;
        return person;
      }

      function shouldBeLink(data) {
        return data.Name != "X" || data.Relationship != "Self";
      }
    
      console.log("Loading "+ancestorsFile)
      loadJson(ancestorsFile, function(data) {
          console.log("data:");
        console.log(data);
        const root = (function(){ let i = 0; return d3.hierarchy(data, d => d.Parents).eachBefore(d => d.index = i++); })();
        console.log("root:");
        console.log(root);
        console.log("root.descendants()");
        console.log(root.descendants());
        const nodeSize = 17;
    
        const nodes = root.descendants();
        console.log("nodes:");
        console.log(nodes);
    
        const svg = d3.create("svg")
          .attr("viewBox", [-nodeSize / 2, -nodeSize * 3 / 2, width, (nodes.length + 1) * nodeSize])
          .attr("font-family", "sans-serif")
          .attr("font-size", 10)
          .style("overflow", "visible");

          let rectRow = 0;
        svg.append("g")
            .attr("stroke", "none")
            .selectAll("rect")
            .data(root.descendants())
            .join("rect")
            .attr("y", (d,i) => (i * nodeSize) - (nodeSize / 2))
            .attr("height", nodeSize)
            .attr("width", width)
            .attr("fill", (d,i) => i % 2 == 0 ? zebraStripe : zebraStripeAlt)

          
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
    
          node.filter(d=>shouldBeLink(d.data))
            .append("a")
            .attr("href", d=> peopleDir + d.data.Id)
          .append("text")
            .attr("dy", "0.32em")
            .attr("x", d => d.depth * nodeSize + 6)
            .text(d => d.data.Name);
    
          node.filter(d=>!shouldBeLink(d.data))
            .append("text")
            .attr("dy", "0.32em")
            .attr("x", d => d.depth * nodeSize + 6)
            .text(d => d.data.Name);

          node.append("title")
            .text(d => d.ancestors()
              .map(d => title(d))
              .join("\n"));
    
          for (const {label, value, x} of columns) {
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
          const div = document.getElementById("ancestors");
          div.appendChild(result);
      });
  }

