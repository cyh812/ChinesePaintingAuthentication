import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./KG.css";
import PaintingsEn from "../../assets/Paintings_en.json";
import ReferencesEn from "../../assets/References_en.json";
import SealsEn from "../../assets/Seals_en.json";
import { LANG_EN } from "../../i18n/texts";

const KG = ({
  language,
  knowledgeData,
  paintingSegmentSimilarityData,
  graphResetToken = 0,
  onNodeClick,
  onLinkClick,
}) => {
  const containerRef = useRef(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [nodesData, setNodesData] = useState([]);
  const [linksData, setLinksData] = useState([]);
  const [isRendered, setIsRendered] = useState(false);

  const initialGraphData = {
    nodes: [],
    links: [],
  };

  const [graphData, setGraphData] = useState(initialGraphData);

  const nodeImages = {
    P: "../../assets/img/painting.png",
    S: "../../assets/img/seal.png",
    R: "../../assets/img/references.png",
  };

  const paintingNameEnMap = new Map(
    (PaintingsEn || []).map((item) => [item.id || item["编号"], item.title || item["总作品名"]])
  );
  const referenceNameEnMap = new Map(
    (ReferencesEn || []).map((item) => [item.reference_id || item.id, item.info])
  );
  const sealNameEnMap = new Map((SealsEn || []).map((item) => [item.seal_code, item.name]));

  const getDisplayNodeName = (node) => {
    if (!node) return "";
    if (language !== LANG_EN) return node.name;

    if (node.category === "P") {
      return paintingNameEnMap.get(node.id) || node.name;
    }

    if (node.category === "R") {
      return referenceNameEnMap.get(node.id) || node.name;
    }

    if (node.category === "S") {
      return sealNameEnMap.get(node.id) || node.name;
    }

    return node.name;
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  useEffect(() => {
    setNodesData(graphData.nodes || []);
    setLinksData(graphData.links || []);
    setIsRendered(true);
  }, []);

  useEffect(() => {
    setGraphData({ nodes: [], links: [] });
  }, [graphResetToken]);

  useEffect(() => {
    if (!knowledgeData) return;

    const knowledgeArray = Array.isArray(knowledgeData)
      ? knowledgeData
      : Array.isArray(knowledgeData?.items)
        ? knowledgeData.items
        : Array.isArray(knowledgeData?.results)
          ? knowledgeData.results
          : [knowledgeData];

    setGraphData((prevGraph) => {
      const nextNodes = [...prevGraph.nodes];
      const nextLinks = [...prevGraph.links];

      const nodeIdSet = new Set(prevGraph.nodes.map((node) => node.id));

      const linkKeySet = new Set(
        prevGraph.links.map((link) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;
          return `${sourceId}__${targetId}__${link.info?.name || ""}`;
        })
      );

      const addNodeIfNotExists = (node) => {
        if (!node?.id) return;
        if (!nodeIdSet.has(node.id)) {
          nodeIdSet.add(node.id);
          nextNodes.push(node);
        }
      };

      const addLinkIfNotExists = (link) => {
        if (!link?.source || !link?.target) return;

        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        const linkType = link.info?.name || "";
        const sourceSlice = link.info?.sourceslice || "";
        const targetSlice = link.info?.targetslice || "";

        // P-P 在“画作对 + 切片对”维度去重；其余边维持原去重策略。
        const key =
          linkType === "P-P"
            ? sourceId <= targetId
              ? `${sourceId}__${targetId}__${linkType}__${sourceSlice}__${targetSlice}`
              : `${targetId}__${sourceId}__${linkType}__${targetSlice}__${sourceSlice}`
            : `${sourceId}__${targetId}__${linkType}`;

        if (!linkKeySet.has(key)) {
          linkKeySet.add(key);
          nextLinks.push(link);
        }
      };

      knowledgeArray.forEach((painting) => {
        const paintingId = painting["编号"] || painting["id"];
        const paintingName =
          painting["总作品名"] || painting["作品名"] || painting["title"] || painting["name"];

        if (!paintingId || !paintingName) return;

        addNodeIfNotExists({
          id: paintingId,
          category: "P",
          name: paintingName,
        });

        const seals = Array.isArray(painting["seals"])
          ? painting["seals"]
          : Array.isArray(painting["印章"])
            ? painting["印章"]
            : [];
        seals.forEach((seal) => {
          const sealId = seal["seal id"] || seal["seal_id"] || seal["id"];
          const sealName = seal["name"];
          const sealSimilarity = seal["similarity"];

          if (!sealId || !sealName) return;

          addNodeIfNotExists({
            id: sealId,
            category: "S",
            name: sealName,
          });

          addLinkIfNotExists({
            source: paintingId,
            target: sealId,
            info: {
              name: "P-S",
              angle:
                typeof sealSimilarity === "number"
                  ? sealSimilarity
                  : parseFloat(sealSimilarity) || 0,
            },
          });
        });

        const references = Array.isArray(painting["考证"])
          ? painting["考证"]
          : Array.isArray(painting["references"])
            ? painting["references"]
            : [];
        references.forEach((ref) => {
          const refId = ref["reference_id"] || ref["reference id"];
          const refName = ref["info"] || ref["title"] || ref["name"];
          const textRecord = ref["text_record"] || ref["text record"] || "";

          if (!refId || !refName) return;

          addNodeIfNotExists({
            id: refId,
            category: "R",
            name: refName,
          });

          addLinkIfNotExists({
            source: paintingId,
            target: refId,
            info: {
              name: "P-R",
              "text record": textRecord,
            },
          });
        });
      });

      return {
        nodes: nextNodes,
        links: nextLinks,
      };
    });
  }, [knowledgeData]);

  useEffect(() => {
    if (!paintingSegmentSimilarityData) return;

    const query = paintingSegmentSimilarityData?.query;
    const results = Array.isArray(paintingSegmentSimilarityData?.results)
      ? paintingSegmentSimilarityData.results
      : [];

    if (!query?.paintingId || !query?.sliceId || results.length === 0) return;

    setGraphData((prevGraph) => {
      const nextNodes = [...prevGraph.nodes];
      const nextLinks = [...prevGraph.links];

      const nodeIdSet = new Set(prevGraph.nodes.map((node) => node.id));

      const linkKeySet = new Set(
        prevGraph.links.map((link) => {
          const sourceId =
            typeof link.source === "object" ? link.source.id : link.source;
          const targetId =
            typeof link.target === "object" ? link.target.id : link.target;
          const linkType = link.info?.name || "";
          const sourceSlice = link.info?.sourceslice || "";
          const targetSlice = link.info?.targetslice || "";

          if (linkType === "P-P") {
            return sourceId <= targetId
              ? `${sourceId}__${targetId}__${linkType}__${sourceSlice}__${targetSlice}`
              : `${targetId}__${sourceId}__${linkType}__${targetSlice}__${sourceSlice}`;
          }

          return `${sourceId}__${targetId}__${linkType}`;
        })
      );

      const addNodeIfNotExists = (node) => {
        if (!node?.id) return false;
        if (!nodeIdSet.has(node.id)) {
          nodeIdSet.add(node.id);
          nextNodes.push(node);
          return true;
        }
        return false;
      };

      const addLinkIfNotExists = (link) => {
        if (!link?.source || !link?.target) return;

        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;
        const linkType = link.info?.name || "";
        const sourceSlice = link.info?.sourceslice || "";
        const targetSlice = link.info?.targetslice || "";

        const key =
          linkType === "P-P"
            ? sourceId <= targetId
              ? `${sourceId}__${targetId}__${linkType}__${sourceSlice}__${targetSlice}`
              : `${targetId}__${sourceId}__${linkType}__${targetSlice}__${sourceSlice}`
            : `${sourceId}__${targetId}__${linkType}`;

        if (!linkKeySet.has(key)) {
          linkKeySet.add(key);
          nextLinks.push(link);
        }
      };

      const sourcePaintingId = query.paintingId;
      const sourceSliceId = query.sliceId;

      results.forEach((item) => {
        const targetPaintingId = item.paintingId;
        const targetSliceId = item.sliceId;
        const targetPaintingName = item.paintingName;
        const similarityScore = item.score;

        if (!targetPaintingId || !targetSliceId) return;

        const didAddNode = addNodeIfNotExists({
          id: targetPaintingId,
          category: "P",
          name: targetPaintingName || targetPaintingId,
        });

        // 无论目标节点是否已存在，都尝试补充“切片级”P-P 连边。
        // addLinkIfNotExists 会在连边相同（同画作对+同切片对）时自动忽略。
        if (didAddNode || nodeIdSet.has(targetPaintingId)) {
          addLinkIfNotExists({
            source: sourcePaintingId,
            target: targetPaintingId,
            info: {
              name: "P-P",
              sourceslice: sourceSliceId,
              targetslice: targetSliceId,
              angle:
                typeof similarityScore === "number"
                  ? similarityScore
                  : parseFloat(similarityScore) || 0,
            },
          });
        }
      });

      return {
        nodes: nextNodes,
        links: nextLinks,
      };
    });
  }, [paintingSegmentSimilarityData]);

  useEffect(() => {
    setNodesData(graphData.nodes || []);
    setLinksData(graphData.links || []);
    setIsRendered(true);
  }, [graphData]);

  useEffect(() => {
    if (
      !isRendered ||
      dimensions.width === 0 ||
      dimensions.height === 0 ||
      nodesData.length === 0
    ) {
      return;
    }

    d3.select(containerRef.current).selectAll("svg").remove();

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    const graphGroup = svg.append("g");
    const ppGroup = svg.append("g");
    const psGroup = svg.append("g");

    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", function (event) {
        graphGroup.attr("transform", event.transform);
        ppGroup.attr("transform", event.transform);
        psGroup.attr("transform", event.transform);
      });

    svg.call(zoom);

    const getNodeId = (nodeOrId) =>
      typeof nodeOrId === "object" ? nodeOrId.id : nodeOrId;

    const normalizeNodePayload = (node) => {
      return {
        type: "node",
        category: node.category,
        data: {
          id: node.id,
          category: node.category,
          name: getDisplayNodeName(node),
        },
      };
    };

    const normalizeLinkPayload = (link) => {
      const sourceId = getNodeId(link.source);
      const targetId = getNodeId(link.target);
      const linkCategory = link.info?.name || "";

      return {
        type: "link",
        category: linkCategory,
        data: {
          source: sourceId,
          target: targetId,
          info: { ...(link.info || {}) },
        },
      };
    };

    const emitNodeClick = (node) => {
      const payload = normalizeNodePayload(node);
      if (onNodeClick) onNodeClick(payload);
    };

    const emitLinkClick = (link) => {
      const payload = normalizeLinkPayload(link);
      if (onLinkClick) onLinkClick(payload);
    };

    const link = graphGroup
      .selectAll("line")
      .data(linksData)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        emitLinkClick(d);
      });

    const node = graphGroup
      .selectAll("image.node")
      .data(nodesData)
      .enter()
      .append("image")
      .attr("class", "node")
      .attr("xlink:href", (d) => nodeImages[d.category])
      .attr("width", 40)
      .attr("height", 40)
      .attr("x", (d) => (d.x || 0) - 20)
      .attr("y", (d) => (d.y || 0) - 20)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        emitNodeClick(d);
      })
      .call(
        d3
          .drag()
          .on("start", function () {
            d3.select(this).raise().classed("active", true);
          })
          .on("drag", function (event, d) {
            d.x = event.x;
            d.y = event.y;

            d3.select(this).attr("x", d.x - 20).attr("y", d.y - 20);

            text
              .filter((t) => t.id === d.id)
              .attr("x", d.x)
              .attr("y", d.y + 35);

            ticked();
          })
          .on("end", function () {
            d3.select(this).classed("active", false);
          })
      );

    const text = graphGroup
      .selectAll("text")
      .data(nodesData)
      .enter()
      .append("text")
      .attr("x", (d) => d.x || 0)
      .attr("y", (d) => (d.y || 0) + 35)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .style("text-shadow", "2px 2px 3px rgba(0, 0, 0, 0.8)")
      .style("font-size", "18px")
      .style("font-family", "Arial, sans-serif")
      .style("font-weight", "bold")
      .style("pointer-events", "none")
      .text((d) => getDisplayNodeName(d));

    const arcGenerator = d3.arc().innerRadius(0).outerRadius(10);

    const ppLinks = linksData.filter((d) => d.info?.name === "P-P");

    const ppCircle = ppGroup
      .selectAll("circle.pp")
      .data(ppLinks)
      .enter()
      .append("circle")
      .attr("class", "pp")
      .attr("fill", "#E5EFF6")
      .attr("r", 10)
      .attr("opacity", 1)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        emitLinkClick(d);
      });

    const ppArc = ppGroup
      .selectAll("path.pp")
      .data(ppLinks)
      .enter()
      .append("path")
      .attr("class", "pp")
      .attr("fill", "#4B80FA")
      .attr("opacity", 0.9)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        emitLinkClick(d);
      });

    const psLinks = linksData.filter((d) => d.info?.name === "P-S");

    const psCircle = psGroup
      .selectAll("circle.ps")
      .data(psLinks)
      .enter()
      .append("circle")
      .attr("class", "ps")
      .attr("fill", "#FFB7B7")
      .attr("r", 10)
      .attr("opacity", 1)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        emitLinkClick(d);
      });

    const psArc = psGroup
      .selectAll("path.ps")
      .data(psLinks)
      .enter()
      .append("path")
      .attr("class", "ps")
      .attr("fill", "red")
      .attr("opacity", 0.9)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        emitLinkClick(d);
      });

    const prLinks = linksData.filter((d) => d.info?.name === "P-R");

    const buttonGroups = graphGroup
      .selectAll("foreignObject.pr")
      .data(prLinks)
      .enter()
      .append("foreignObject")
      .attr("class", "pr")
      .attr("width", 25)
      .attr("height", 25)
      .style("cursor", "pointer")
      .on("click", function (event, d) {
        emitLinkClick(d);
      });

    buttonGroups
      .append("xhtml:div")
      .style("width", "100%")
      .style("height", "100%")
      .style("background-color", "#585858")
      .style("border-radius", "0px")
      .style("cursor", "pointer")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "center")
      .style("padding", "0px")
      .html(`
        <img
          src="../../assets/img/reference-new.png"
          alt="reference"
        />
      `);

    const simulation = d3
      .forceSimulation(nodesData)
      .force("link", d3.forceLink(linksData).id((d) => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-400))
      .force(
        "center",
        d3.forceCenter(dimensions.width / 2, dimensions.height / 2)
      )
      .alphaDecay(0.01)
      .alphaMin(0.0001)
      .on("tick", ticked);

    function updateLinks() {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
    }

    function ticked() {
      node.attr("x", (d) => d.x - 20).attr("y", (d) => d.y - 20);

      text.attr("x", (d) => d.x).attr("y", (d) => d.y + 40);

      graphGroup
        .selectAll("foreignObject")
        .attr("x", (d) => (d.source.x + d.target.x) / 2 - 12)
        .attr("y", (d) => (d.source.y + d.target.y) / 2 - 12);

      ppCircle
        .attr("cx", (d) => (d.source.x + d.target.x) / 2)
        .attr("cy", (d) => (d.source.y + d.target.y) / 2);

      ppArc
        .attr("d", (d) => {
          const angleRatio = d.info?.angle || 0;
          return arcGenerator({
            startAngle: 0,
            endAngle: 2 * Math.PI * angleRatio,
          });
        })
        .attr(
          "transform",
          (d) =>
            `translate(${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`
        );

      psCircle
        .attr("cx", (d) => (d.source.x + d.target.x) / 2)
        .attr("cy", (d) => (d.source.y + d.target.y) / 2);

      psArc
        .attr("d", (d) => {
          const angleRatio = d.info?.angle || 0;
          return arcGenerator({
            startAngle: 0,
            endAngle: 2 * Math.PI * angleRatio,
          });
        })
        .attr(
          "transform",
          (d) =>
            `translate(${(d.source.x + d.target.x) / 2}, ${(d.source.y + d.target.y) / 2})`
        );

      updateLinks();
    }

    updateLinks();
    ticked();

    return () => {
      simulation.stop();
      d3.select(containerRef.current).selectAll("svg").remove();
    };
  }, [dimensions, nodesData, linksData, isRendered, onNodeClick, onLinkClick, language]);

  return <div className="kg" ref={containerRef}></div>;
};

export default React.memo(KG);