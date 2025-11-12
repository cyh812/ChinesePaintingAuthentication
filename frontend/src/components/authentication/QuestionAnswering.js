import React, { useState } from 'react';
import SvgIcon from '@mui/material/SvgIcon';
import QuestionProcessor from './QuestionProcessor';
import graphManager from './GraphDataManager';
import './LLM.css';

// 发送按钮图标
function SendIcon(props) {
  return (
    <SvgIcon {...props} viewBox="0 0 32 32">
      <path d="M27.6367 15.1132L1.19533 0.9765C0.812515 0.785094 0.347671 1.08587 0.402359 1.49603L2.45314 25.914C2.48048 26.2968 2.8633 26.5156 3.21876 26.3788L11.75 22.7968L16.4258 28.1015C16.7266 28.4296 17.2461 28.2929 17.3555 27.8827L19.5977 19.4882L27.6367 16.0976C28.0195 15.9062 28.0469 15.332 27.6367 15.1132ZM16.4258 25.5585L13.9649 21.1835L1.38673 1.76947L18.0664 18.996L16.4258 25.5585Z" fill="#FDFDFD" />
    </SvgIcon>
  );
}

/**
 * 问答组件 - 处理用户问题并更新图谱
 * @param {string} selectedImageId - 当前选中的画作ID
 * @param {Array} selectedItems - 选中的切片/印章列表
 * @param {Array} segmentSimilarityThreshold - 切片相似度阈值 [min, max]
 * @param {Function} onGraphUpdate - 图谱更新回调 {addedNodes, addedEdges}
 * @param {Function} onClearSelection - 清空选择回调
 */
const QuestionAnswering = ({ 
  selectedImageId, 
  selectedItems = [], 
  segmentSimilarityThreshold = [0.8, 1.0],
  onGraphUpdate,
  onClearSelection
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  
  const questionProcessor = QuestionProcessor.getInstance();

  /**
   * 处理问题提交
   */
  const handleSubmit = async () => {
    if (!question.trim()) {
      return;
    }

    if (!selectedImageId) {
      console.log('⚠️ 请先选择一幅画作');
      return;
    }

    setLoading(true);
    const currentQuestion = question;
    setQuestion(''); // 清空输入框

    try {
      // 处理问题
      const result = await questionProcessor.processQuestion(
        currentQuestion,
        selectedImageId,
        selectedItems,
        segmentSimilarityThreshold
      );

      console.log('📊 问题处理结果:', result);

      if (result.success) {
        console.log('✅ 处理成功:', result.message);

        // 添加到GraphDataManager的历史（无论是否有节点/边，都记录问题和答案）
        graphManager.addToHistory(
          currentQuestion,
          result.message || '',
          result.addedNodes || [],
          result.template || '',
          result.fullAnswer || result.message || '',
          result.template || ''
        );
        
        // 刷新历史列表UI
        if (window.refreshNestedList) {
          window.refreshNestedList();
        }

        // 如果有新增节点或边,通知父组件更新图谱
        if ((result.addedNodes && result.addedNodes.length > 0) || 
            (result.addedEdges && result.addedEdges.length > 0)) {
          
          console.log(`✨ 新增节点: ${result.addedNodes?.length || 0} 个`);
          console.log(`✨ 新增边: ${result.addedEdges?.length || 0} 个`);
          
          if (onGraphUpdate) {
            onGraphUpdate({
              addedNodes: result.addedNodes || [],
              addedEdges: result.addedEdges || [],
              data: result.data,
              fullAnswer: result.fullAnswer
            });
          }
        } else {
          console.log('ℹ️ 没有新增节点或边');
        }

        // 查询成功后清空所有切片和印章的选择
        if (onClearSelection) {
          console.log('🧹 调用清空选择回调');
          onClearSelection();
        }
      } else {
        // 处理失败的情况也记录到历史（比如缺少必选项等）
        console.error('❌ 处理失败:', result.message);
        
        graphManager.addToHistory(
          currentQuestion,
          result.message || '处理失败',
          [],
          '',
          result.fullAnswer || result.message || '处理失败',
          ''
        );
        
        // 刷新历史列表UI
        if (window.refreshNestedList) {
          window.refreshNestedList();
        }
      }
    } catch (error) {
      console.error('❌ 处理问题失败:', error);
      
      // 异常情况也记录到历史
      graphManager.addToHistory(
        currentQuestion,
        `系统错误: ${error.message}`,
        [],
        '',
        `抱歉，处理您的问题时发生了系统错误：${error.message}`,
        ''
      );
      
      // 刷新历史列表UI
      if (window.refreshNestedList) {
        window.refreshNestedList();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-answering-container">
      {/* 输入区域 */}
      <div className="segments-input-container">
        <input
          className="segments-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={
            !selectedImageId 
              ? "请先选择画作..." 
              : "请输入您的问题..."
          }
          disabled={loading || !selectedImageId}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button 
          className="send-button"
          onClick={handleSubmit}
          disabled={loading || !question.trim() || !selectedImageId}
          style={{ fontSize: 20 }}
        >
          {loading ? '...' : <SendIcon sx={{ transform: 'scale(1.5) translateX(3px)' }} />}
        </button>
      </div>
    </div>
  );
};

export default QuestionAnswering;
