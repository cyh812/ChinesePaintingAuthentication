/**
 * LLM服务 - 处理问题分类和答案生成
 */
class LLMService {
  constructor() {
    // 使用 Deepseek API 配置
    this.apiEndpoint = 'https://api.deepseek.com/chat/completions';
    this.apiKey = 'sk-d92a575188954a01b6a4fc4e2d231fe9'; // Deepseek API Key
    this.model = 'deepseek-chat'; // Deepseek 模型
  }

  /**
   * 分类用户问题到问题模板 (完全使用LLM)
   * @param {string} question - 用户问题
   * @param {Array} templates - 可用的问题模板
   * @returns {Promise<Object>} 分类结果 { templateId, confidence, reasoning }
   */
  async classifyQuestion(question, templates) {
    const templateDescriptions = templates.map(t => 
      `ID: ${t.id}\n描述: ${t.description}\n示例关键词: ${t.keywords.join(', ')}`
    ).join('\n\n');

    const prompt = `你是一个中国画作鉴定系统的问题分类助手。请将用户的问题分类到以下模板之一：

${templateDescriptions}

用户问题："${question}"

请仔细分析用户问题的语义,选择最匹配的模板ID。返回JSON格式：
{
  "templateId": "匹配的模板ID，如果都不匹配则为null",
  "confidence": 0.0-1.0之间的置信度,
  "reasoning": "分类理由"
}

注意：
1. 即使用户问题表达方式与示例关键词不完全相同,也要理解其语义含义
2. 置信度应该基于语义匹配程度,而不是关键词完全匹配
3. 只返回JSON,不要其他内容`;

    console.log('🔍 ========== 问题分类LLM输入 ==========');
    console.log('📝 用户问题:', question);
    console.log('📋 可用模板数:', templates.length);
    console.log('💬 完整提示词:\n', prompt);
    console.log('🔍 =====================================');

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: '你是一个专业的中国画作鉴定系统助手。请仔细分析用户问题,返回最匹配的问题模板ID和置信度。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0].message.content;
        console.log('🤖 LLM原始回复:', content);
        
        // 尝试解析JSON
        try {
          const result = JSON.parse(content);
          console.log('✅ LLM分类成功:', result);
          return result;
        } catch (parseError) {
          console.warn('⚠️ JSON解析失败,尝试提取JSON:', parseError);
          // 尝试从文本中提取JSON
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            console.log('✅ 提取JSON成功:', result);
            return result;
          }
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API调用失败:', response.status, errorText);
      }
      
      // 如果LLM调用失败,返回null结果
      return {
        templateId: null,
        confidence: 0,
        reasoning: 'LLM调用失败'
      };
    } catch (error) {
      console.error('❌ LLM分类异常:', error);
      return {
        templateId: null,
        confidence: 0,
        reasoning: `异常: ${error.message}`
      };
    }
  }

  /**
   * 生成用户友好的答案 (完全使用LLM)
   * @param {string} question - 用户问题
   * @param {Object} result - 系统计算结果
   * @param {string} templateId - 使用的模板ID
   * @returns {Promise<string>} 生成的答案
   */
  async generateAnswer(question, result, templateId) {
    const { data, message, addedNodes, addedEdges } = result;

    // 构建节点信息描述
    const nodesDescription = addedNodes && addedNodes.length > 0
      ? addedNodes.map(n => {
          const type = n.category === 'painting' ? '画作' 
                     : n.category === 'seal' ? '印章'
                     : n.category === 'person' ? '作者'
                     : n.category === 'reference' ? '参考文献'
                     : '节点';
          return `${type}: ${n.name}`;
        }).join('\n')
      : '无';

    const prompt = `你是一个中国画作鉴定系统的助手。用户提出了以下问题：

"${question}"

系统已经计算并返回了结果：
- 系统消息: ${message}
- 新增节点数: ${addedNodes?.length || 0}
- 新增连接数: ${addedEdges?.length || 0}
- 节点详情:
${nodesDescription}

请基于这些结果，生成一个专业、友好、自然的回答。要求：
1. 用自然语言描述找到了什么，不要简单重复系统消息
2. 提及具体的画作、印章或其他节点的名称
3. 如果有多个结果，适当列举
4. 语气专业但亲切，像是一个专家在解答
5. 长度控制在2-4句话
6. 对于印章，使用"钤有"等专业术语

只返回答案文本，不要JSON格式或其他标记。`;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: '你是一个专业的中国画作鉴定专家，擅长用自然、专业的语言解释鉴定结果。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7
        })
      });

      if (response.ok) {
        const responseData = await response.json();
        const answer = responseData.choices[0].message.content.trim();
        console.log('✅ LLM生成答案:', answer);
        return answer;
      } else {
        const errorText = await response.text();
        console.error('❌ 答案生成API调用失败:', response.status, errorText);
        // 返回简单的消息作为后备
        return message || '处理完成，已添加相关节点到知识图谱中。';
      }
    } catch (error) {
      console.error('❌ LLM答案生成异常:', error);
      // 返回简单的消息作为后备
      return message || '处理完成，已添加相关节点到知识图谱中。';
    }
  }

  /**
   * 直接使用LLM回答问题（当没有匹配模板时）
   * @param {string} question - 用户问题
   * @param {string} context - 当前画作的上下文信息
   * @returns {Promise<string>} LLM的回答
   */
  async directAnswer(question, context) {
    const prompt = `你是一个中国画作鉴定系统的助手。用户问了一个问题，但系统没有找到对应的计算模板。

当前画作信息：
${JSON.stringify(context, null, 2)}

用户问题："${question}"

请基于你对中国画作鉴定的知识，给出一个专业的回答。如果问题超出了你的知识范围，请诚实地说明。

回答应该：
1. 专业但易懂
2. 如果可能，引用相关的艺术史知识
3. 长度控制在3-5句话
4. 承认系统的局限性（如果适用）

只返回答案文本，不要其他内容。`;

    try {
      if (this.apiKey) {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: this.model,
            messages: [
              { role: 'system', content: '你是一个专业的中国画作鉴定专家，对石涛等清代画家有深入了解。' },
              { role: 'user', content: prompt }
            ],
            temperature: 0.7
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.choices[0].message.content.trim();
        } else {
          console.warn('⚠️ 直接回答API调用失败:', response.status);
        }
      }
      
      // 后备方案
      return '抱歉，这个问题暂时无法回答。请尝试使用系统支持的问题类型，例如：查找相似切片、显示印章信息、查看参考文献等。';
    } catch (error) {
      console.warn('LLM直接回答失败:', error);
      return '抱歉，这个问题暂时无法回答。请尝试使用系统支持的问题类型，例如：查找相似切片、显示印章信息、查看参考文献等。';
    }
  }
}

// 单例模式
const llmService = new LLMService();
export default llmService;
