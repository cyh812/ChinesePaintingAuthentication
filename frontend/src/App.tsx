import React, { useCallback, useState } from "react";
import "./assets/scss/App.scss";
/* @ts-ignore */
import "./App.css";

import LLM from "./components/authentication/LLM_QA";
import KG from "./components/authentication/KG";
import Title from "./components/authentication/Title";

import SealNodeDetail from "./components/authentication/SealNodeDetail";
import PaintingNodeDetail from "./components/authentication/PaintingNodeDetail";
import ReferenceNodeDetail from "./components/authentication/ReferenceNodeDetail";

import PSLinkDetail from "./components/authentication/PSLinkDetail";
import PPLinkDetail from "./components/authentication/PPLinkDetail";
import PRLinkDetail from "./components/authentication/PRLinkDetail";

const App = () => {
  const [showNodeDetail, setShowNodeDetail] = useState(true);
  const [showLinkDetail, setShowLinkDetail] = useState(true);

  const [retrievedKnowledge, setRetrievedKnowledge] = useState<any>(null);
  const [paintingSegmentSimilarityData, setPaintingSegmentSimilarityData] =
    useState<any>(null);

  // 当前选中节点 / 连边
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedLink, setSelectedLink] = useState<any>(null);

  // ===== 节点详情总入口 =====
  const NodeDetailRenderer = ({ selectedNode }: any) => {
    if (!selectedNode) {
      return <div className="EmptyDetail">当前暂无选中的节点</div>;
    }

    switch (selectedNode.category) {
      case "P":
        return (
          <PaintingNodeDetail
            node={selectedNode.data}
            onPaintingSegmentSearchResult={(data: any) => {
              console.log("App.tsx 收到 painting segment similarity 数据：", data);
              setPaintingSegmentSimilarityData(data);
            }}
          />
        );
      case "S":
        return <SealNodeDetail node={selectedNode.data} />;
      case "R":
        return <ReferenceNodeDetail node={selectedNode.data} />;
      default:
        return <div className="EmptyDetail">未知节点类型</div>;
    }
  };

  // ===== 连边详情总入口 =====
  const LinkDetailRenderer = ({ selectedLink }: any) => {
    if (!selectedLink) {
      return <div className="EmptyDetail">当前暂无选中的连边</div>;
    }

    switch (selectedLink?.category) {
      case "P-P":
        return <PPLinkDetail link={selectedLink} />;
      case "P-S":
        return <PSLinkDetail link={selectedLink} />;
      case "P-R":
        return <PRLinkDetail link={selectedLink} />;
      default:
        return <div className="EmptyDetail">未知连边类型</div>;
    }
  };

  // 供 KG 调用，使用 useCallback 固定引用，避免 KG 因函数 props 变化而重渲染
  const handleNodeSelect = useCallback((nodeData: any) => {
    setSelectedNode(nodeData);
    setShowNodeDetail(true);
  }, []);

  const handleLinkSelect = useCallback((linkData: any) => {
    setSelectedLink(linkData);
    setShowLinkDetail(true);
  }, []);

  return (
    <>
      <div className="top-bar">
        <Title />
      </div>

      <div className="bottom-container">
        <div className="left-side">
          <div className="left-side-border">
            <LLM onKnowledgeRetrieved={setRetrievedKnowledge} />
          </div>
        </div>

        <div className="right-side">
          <div className="right-side-top">
            <div className="right-side-top-left">
              <div className="DetailPanel">
                {showNodeDetail && (
                  <div className="NodeDetail">
                    <div className="DetailHeader">
                      <div className="DetailHeaderTitle">节点信息</div>
                      <button
                        className="DetailCloseBtn"
                        onClick={() => setShowNodeDetail(false)}
                        aria-label="关闭节点信息"
                      >
                        ×
                      </button>
                    </div>

                    <div className="DetailBody">
                      <NodeDetailRenderer selectedNode={selectedNode} />
                    </div>
                  </div>
                )}

                {showLinkDetail && (
                  <div className="LinkDetail">
                    <div className="DetailHeader">
                      <div className="DetailHeaderTitle">连边信息</div>
                      <button
                        className="DetailCloseBtn"
                        onClick={() => setShowLinkDetail(false)}
                        aria-label="关闭连边信息"
                      >
                        ×
                      </button>
                    </div>

                    <div className="DetailBody">
                      <LinkDetailRenderer selectedLink={selectedLink} />
                    </div>
                  </div>
                )}
              </div>

              <KG
                knowledgeData={retrievedKnowledge}
                paintingSegmentSimilarityData={paintingSegmentSimilarityData}
                onNodeClick={handleNodeSelect}
                onLinkClick={handleLinkSelect}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;