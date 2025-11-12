import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import './FullAnswerPanel.css';

/**
 * 完整答案显示面板
 * @param {{answerData: any, onClose: Function}} props
 */
const FullAnswerPanel = ({ answerData, onClose }) => {
  if (!answerData) return null;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="full-answer-overlay" onClick={onClose}>
      <div className="full-answer-panel" onClick={(e) => e.stopPropagation()}>
        {/* 标题栏 */}
        <div className="full-answer-header">
          <h3>问答详情</h3>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>

        {/* 内容区域 */}
        <div className="full-answer-content">
          {/* 问题 */}
          <div className="answer-section">
            <h4>问题</h4>
            <div className="answer-question">{answerData.question}</div>
          </div>

          {/* 时间 */}
          <div className="answer-section">
            <div className="answer-timestamp">
              {formatTimestamp(answerData.timestamp)}
            </div>
          </div>

          {/* 答案 */}
          <div className="answer-section">
            <h4>回答</h4>
            <div className="answer-text">{answerData.answer || answerData.shortAnswer}</div>
          </div>

          {/* 数据统计 */}
          <div className="answer-section">
            <h4>图谱变化</h4>
            <div className="answer-stats">
              <div className="stat-item">
                <span className="stat-label">新增节点：</span>
                <span className="stat-value">{answerData.addedNodes?.length || 0}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">新增关系：</span>
                <span className="stat-value">{answerData.addedEdges?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* 新增节点列表 */}
          {answerData.addedNodes && answerData.addedNodes.length > 0 && (
            <div className="answer-section">
              <h4>新增节点</h4>
              <div className="nodes-list">
                {answerData.addedNodes.map((node, index) => (
                  <div key={index} className="node-item">
                    <span className="node-category">[{node.category}]</span>
                    <span className="node-name">{node.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FullAnswerPanel;
