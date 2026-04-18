import StorylineDataManager from './StorylineDataManager';
import llmService from './LLMService';
import segmentSimilarity from '../../assets/data/segment_similarity_with_paths.json';
import standardSealsInfo from '../../assets/data/standard_seals_info.json';
import sealMapping from '../../assets/data/seal_mapping.json';
import allSealsInfo from '../../assets/data/all_seals_info.json';

/**
 * 问题处理器 - 解析用户问题并执行相应的图谱操作
 */
class QuestionProcessor {
  constructor() {
    // StorylineDataManager 直接导出的是实例，不需要 getInstance()
    this.dataManager = StorylineDataManager;
    
    // 问题模板定义 - 完整梳理版本
    this.questionTemplates = [
      // ========== 已实现的功能 ==========
      
      // 1. 当选中切片时，对本图该切片找到相似的图
      {
        id: 'find_similar_paintings_by_segment',
        keywords: ['相似', '切片', '类似', '相同', '比较', '相似的图', '相似的画'],
        requiredSelection: ['segment'],
        description: '查找与选中切片相似的其他画作',
        relationship: 'P-P (通过切片相似)',
        handler: this.handleFindSimilarSegments.bind(this),
        implemented: true
      },
      
      // 2. 对当前图片显示所有的印章
      {
        id: 'show_current_painting_seals',
        keywords: ['所有印章', '全部印章', '印章列表', '包含的印章', '显示印章', '印章', '钤印', '盖章', '有哪些印章'],
        requiredSelection: [],
        description: '显示当前画作的所有印章',
        relationship: 'P-S',
        handler: this.handleShowAllSeals.bind(this),
        implemented: true
      },
      
      // 3. 当选中印章时，对本图该印章找到相似的印章标准件
      {
        id: 'find_standard_seal_by_selected_seal',
        keywords: ['标准件', '标准印', '匹配', '相似的标准', '对应的标准'],
        requiredSelection: ['seal'],
        description: '查找选中印章对应的标准印',
        relationship: 'S-SS',
        handler: this.handleFindStandardSeals.bind(this),
        implemented: true
      },
      
      // 4. 展示石涛的所有印章标准件
      {
        id: 'show_all_standard_seals',
        keywords: ['所有标准印', '全部标准印', '标准印章列表', '石涛的标准印', '石涛标准印', '标准件列表', '所有标准件'],
        requiredSelection: [],
        description: '显示石涛的所有标准印章',
        relationship: 'A-SS',
        handler: this.handleShowAllStandardSeals.bind(this),
        implemented: true
      },
      
      // ========== 未来需要实现的功能 ==========
      
      // 8. 当输入一个图画名，对输入的图画名找相似的图
      {
        id: 'find_similar_paintings_by_name',
        keywords: ['相似的图', '相似的画', '类似作品', '风格相似', '找相似'],
        requiredSelection: [],
        description: '根据输入的画作名称查找相似的画作',
        relationship: 'P-P (通过画作名称)',
        handler: this.handleFindSimilarPaintingsByName.bind(this),
        implemented: true
      },
      
      // 9. 当输入一个图画名，对输入的图画名显示其所有的印章
      {
        id: 'show_painting_seals_by_name',
        keywords: ['画作的印章', '某画的印章', '显示印章', '的印章', '有哪些印章', '印章列表'],
        requiredSelection: [],
        description: '根据输入的画作名称显示其所有印章',
        relationship: 'P-S (通过画作名称)',
        handler: this.handleShowPaintingSealsByName.bind(this),
        implemented: true
      },
      
      // 10. 展示石涛的所有画
      {
        id: 'show_all_paintings_by_author',
        keywords: ['石涛的画', '所有作品', '全部画作', '石涛画作列表'],
        requiredSelection: [],
        description: '显示石涛的所有画作',
        relationship: 'A-P',
        handler: this.handleShowAllPaintingsByAuthor.bind(this),
        implemented: true
      },
      
      // 11. 智能参考文献查询 - 使用LLM判断相关文献
      {
        id: 'smart_reference_query',
        keywords: ['参考文献', '引用', '出处', '来源', '参考资料', '文献', '资料', '记载', '著录'],
        requiredSelection: [],
        description: '智能查询与问题相关的参考文献',
        relationship: 'P-R (智能匹配)',
        handler: this.handleSmartReferenceQuery.bind(this),
        implemented: true
      },
      
      // 14. 当输入印章编号，展示与其相似的标准件
      {
        id: 'find_standard_seal_by_code',
        keywords: ['印章编号', '印章0', '印章1', '印章2', '印章3', '印章4', '印章5', '印章6', '印章7', '印章8', '印章9', '显示印章', '查找印章'],
        requiredSelection: [],
        description: '根据印章编号查找对应的标准印',
        relationship: 'S-SS (通过编号)',
        handler: this.handleFindStandardSealByCode.bind(this),
        implemented: true
      },
      
      // 15. 输入标准件的名字，展示用到标准件印章的所有印章
      {
        id: 'show_seals_by_standard_seal_name',
        keywords: ['标准件的印章', '使用标准印', '标准印的印章', '标准件印章', '用到的印章', '对应的印章'],
        requiredSelection: [],
        description: '根据标准印名称查找所有相似的印章',
        relationship: 'SS-S',
        handler: this.handleShowSealsByStandardSealName.bind(this),
        implemented: true
      }
    ];
  }

  /**
   * 提取基础画作ID（去除子编号）
   * @param {string} paintingId - 画作ID (如 D001430-1, D001430_1, D001430)
   * @returns {string} 基础画作ID (如 D001430)
   */
  getBasePaintingId(paintingId) {
    if (!paintingId) return paintingId;
    // 使用正则表达式分割，支持下划线或连字符
    return paintingId.split(/[-_]/)[0];
  }

  /**
   * 分析用户问题并返回匹配的模板
   * @param {string} question - 用户输入的问题
   * @param {Array} selectedItems - 当前选中的项 [{type, id, imageId, ...}, ...]
   * @returns {Object|null} 匹配的模板
   */
  analyzeQuestion(question, selectedItems) {
    const questionLower = question.toLowerCase();
    
    // 按关键词匹配度排序
    const matches = this.questionTemplates
      .map(template => {
        const matchCount = template.keywords.filter(keyword => 
          questionLower.includes(keyword)
        ).length;
        
        return { template, matchCount };
      })
      .filter(item => item.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    if (matches.length === 0) {
      return null;
    }

    const bestMatch = matches[0].template;
    
    // 检查是否满足选中项要求
    if (bestMatch.requiredSelection.length > 0) {
      const hasRequiredSelection = bestMatch.requiredSelection.some(type =>
        selectedItems.some(item => item.type === type)
      );
      
      if (!hasRequiredSelection) {
        return {
          ...bestMatch,
          error: `此问题需要先选中: ${bestMatch.requiredSelection.join('或')}`
        };
      }
    }

    return bestMatch;
  }

  /**
   * 处理用户问题 (集成LLM)
   * @param {string} question - 用户问题
   * @param {string} currentImageId - 当前选中的画作ID
   * @param {Array} selectedItems - 选中的切片/印章
   * @param {number} segmentSimilarityThreshold - 切片相似度阈值 [min, max]
   * @returns {Promise<Object>} 处理结果 {success, data, message, addedNodes, addedEdges, fullAnswer}
   */
  async processQuestion(question, currentImageId, selectedItems = [], segmentSimilarityThreshold = [0.8, 1.0]) {
    console.log('📝 处理问题:', question);
    console.log('🎯 当前画作:', currentImageId);
    console.log('✅ 选中项:', selectedItems);
    console.log('📊 相似度阈值:', segmentSimilarityThreshold);

    try {
      // 步骤1: 过滤模板 - 根据选中项忽略某些模板
      const filteredTemplates = this.questionTemplates.filter(template => {
        // 如果选中了切片，忽略"根据画作名称查找相似画作"模板
        if (selectedItems.some(item => item.type === 'segment') && 
            template.id === 'find_similar_paintings_by_name') {
          console.log('⊗ 已选中切片，忽略模板: find_similar_paintings_by_name');
          return false;
        }
        
        // 如果未选中印章，忽略"查找选中印章对应的标准印"模板
        if (!selectedItems.some(item => item.type === 'seal') && 
            template.id === 'find_standard_seal_by_selected_seal') {
          console.log('⊗ 未选中印章，忽略模板: find_standard_seal_by_selected_seal');
          return false;
        }
        
        // 如果选中了印章，忽略"展示石涛的所有印章标准件"模板
        if (selectedItems.some(item => item.type === 'seal') && 
            template.id === 'show_all_standard_seals') {
          console.log('⊗ 已选中印章，忽略模板: show_all_standard_seals');
          return false;
        }
        
        return true;
      });
      
      console.log(`📋 过滤后可用模板数: ${filteredTemplates.length}/${this.questionTemplates.length}`);
      
      // 步骤2: 使用LLM分类问题（使用过滤后的模板）
      const classification = await llmService.classifyQuestion(question, filteredTemplates);
      console.log('🤖 LLM分类结果:', classification);

      let result;
      let fullAnswer;

      if (classification.templateId && classification.confidence > 0.2) {
        // 找到匹配的模板 (降低置信度阈值到0.2)
        const template = this.questionTemplates.find(t => t.id === classification.templateId);
        
        if (!template) {
          throw new Error('模板不存在');
        }

        // 检查功能是否已实现
        if (template.implemented === false) {
          return {
            success: false,
            message: `此功能暂未实现，敬请期待`,
            fullAnswer: `抱歉，"${template.description}"功能正在开发中，敬请期待。`
          };
        }

        // 检查是否满足选中项要求
        if (template.requiredSelection.length > 0) {
          const hasRequiredSelection = template.requiredSelection.some(type =>
            selectedItems.some(item => item.type === type)
          );
          
          if (!hasRequiredSelection) {
            return {
              success: false,
              message: `此问题需要先选中: ${template.requiredSelection.join('或')}`,
              fullAnswer: `抱歉，要回答这个问题，您需要先选中 ${template.requiredSelection.join('或')}。`
            };
          }
        }

        console.log('✨ 匹配模板:', template.id, template.implemented ? '(已实现)' : '(未实现)');

        // 步骤2: 执行系统计算
        result = await template.handler(currentImageId, selectedItems, segmentSimilarityThreshold, question);

        // 步骤3: 使用LLM包装答案
        fullAnswer = await llmService.generateAnswer(question, result, template.id);

        return {
          success: true,
          template: template.id,
          question: question,
          ...result,
          fullAnswer: fullAnswer
        };

      } else {
        // 没有找到匹配的模板，使用LLM直接回答
        console.log('💬 未匹配模板，使用LLM直接回答');
        
        const context = this.dataManager.getPaintingInfo(currentImageId) || {};
        fullAnswer = await llmService.directAnswer(question, context);

        return {
          success: true,
          template: null,
          question: question,
          data: null,
          message: fullAnswer,
          addedNodes: [],
          addedEdges: [],
          fullAnswer: fullAnswer
        };
      }

    } catch (error) {
      console.error('❌ 处理问题失败:', error);
      return {
        success: false,
        question: question,
        message: `处理失败: ${error.message}`,
        fullAnswer: `抱歉，处理您的问题时出现了错误：${error.message}`
      };
    }
  }

  /**
   * 处理器: 查找相似切片
   */
  async handleFindSimilarSegments(currentImageId, selectedItems, [minSimilarity, maxSimilarity]) {
    console.log('🔍 查找相似切片...');
    
    const segments = selectedItems.filter(item => item.type === 'segment');
    
    if (segments.length === 0) {
      return {
        success: false,
        message: '请先选择至少一个切片'
      };
    }

    const addedNodes = [];
    const addedEdges = [];
    let totalSimilarPaintings = 0;

    // 对每个选中的切片查找相似画作
    for (const segment of segments) {
      console.log(`  查询切片相似画作 - imageId: ${segment.imageId}, fullPath: ${segment.fullPath}`);
      
      const similarPaintings = this.dataManager.findSimilarPaintingsBySegment(
        segment.imageId,
        segment.fullPath,
        minSimilarity,
        maxSimilarity
      );

      console.log(`  切片 ${segment.name}: 找到 ${similarPaintings.length} 个相似画作`);
      totalSimilarPaintings += similarPaintings.length;

      // 为每个相似画作添加节点和边
      for (const similar of similarPaintings) {
        // 提取基础画作ID: D001430-1 或 D001430_1 -> D001430
        const basePaintingId = this.getBasePaintingId(similar.paintingId);
        
        console.log(`  原始ID: ${similar.paintingId} -> 基础ID: ${basePaintingId}`);
        
        // 添加相似画作节点 (使用基础ID)
        const paintingNode = this.dataManager.addPaintingNode(
          basePaintingId,
          `画作 ${basePaintingId}`
        );
        
        // 添加相似关系边 (使用基础ID)
        const edgeResult = this.dataManager.addSimilarityEdge(
          currentImageId,
          basePaintingId,
          {
            similarity: similar.similarity,
            segmentPath: segment.fullPath,
            segmentName: segment.name,
            similarSegmentPath: similar.segmentPath,
            originalPaintingId: similar.paintingId // 保留原始ID用于调试
          }
        );

        // 如果是翻页增加（节点已存在，但边增加了新页）
        if (edgeResult.isPageAdded) {
          // 添加重复节点标记到历史记录
          addedNodes.push({
            ...paintingNode.node,
            isDuplicate: true,  // 标记为重复节点
            isPageAdded: true,  // 标记为翻页增加
            edgeId: edgeResult.edge.id,
            pageIndex: edgeResult.pageIndex,
            fromNodeId: edgeResult.fromNodeId,
            toNodeId: edgeResult.toNodeId
          });
        } else if (paintingNode.isNew) {
          // 只有新节点才添加到结果中（普通情况）
          addedNodes.push(paintingNode.node);
        }

        // 只有在边是新建或新增页时才添加边
        // 如果是重复的相似关系（isDuplicate: true），不添加边
        if (edgeResult.isNew || (edgeResult.isPageAdded && !edgeResult.isDuplicate)) {
          addedEdges.push(edgeResult.edge);
        } else if (edgeResult.isDuplicate) {
          console.log(`⚠️ 跳过重复的相似关系: ${similar.paintingId}`);
        }
      }
    }

    return {
      data: {
        segmentCount: segments.length,
        similarPaintingsCount: totalSimilarPaintings
      },
      message: `找到 ${totalSimilarPaintings} 个与所选 ${segments.length} 个切片相似的画作`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 查找标准印章
   */
  async handleFindStandardSeals(currentImageId, selectedItems, [minSimilarity, maxSimilarity]) {
    console.log('🔍 查找标准印章...');
    console.log('  注意：只要印章有标准件(has_reference=true)就会添加，不使用相似度阈值');
    
    const seals = selectedItems.filter(item => item.type === 'seal');
    
    if (seals.length === 0) {
      return {
        success: false,
        message: '请先选择至少一个印章'
      };
    }

    const addedNodes = [];
    const addedEdges = [];
    let totalStandardSeals = 0;

    // 获取当前画作信息
    const paintingInfo = this.dataManager.getPaintingInfo(currentImageId);
    const paintingName = paintingInfo?.作品名 || paintingInfo?.painting_name || '未知画作';

    // 对每个选中的印章查找标准印
    for (const seal of seals) {
      // 不传入相似度参数，由方法内部判断has_reference
      const standardSeals = this.dataManager.findSimilarStandardSeals(seal.code);

      console.log(`  印章 ${seal.code}: 找到 ${standardSeals.length} 个标准印`);
      totalStandardSeals += standardSeals.length;

      // 1. 无论是否找到标准件，都要确保印章节点存在，并与当前图像建立关系
      const sealNode = this.dataManager.addSealNode(
        seal.code,
        currentImageId  // 传入当前图像ID，建立归属关系
      );
      
      // 只有新节点才添加到结果中，并设置历史记录显示名称
      if (sealNode && sealNode.isNew) {
        // 为历史记录设置显示名称：印章{编号}({画名})
        const nodeForHistory = {
          ...sealNode.node,
          displayName: `印章${seal.code}(${paintingName})`
        };
        addedNodes.push(nodeForHistory);
        console.log(`  ✓ 添加印章节点: ${seal.code} - 显示为: 印章${seal.code}(${paintingName})`);
      }

      // 2. 无论是否找到标准件，都要确保印章与图像的连接边被添加
      if (currentImageId) {
        const ownershipEdge = this.dataManager.addOwnershipEdge(
          seal.code,
          currentImageId
        );
        // 如果边是新建的，添加到结果中
        if (ownershipEdge && ownershipEdge.isNew) {
          addedEdges.push(ownershipEdge.edge);
          console.log(`  ✓ 建立印章 ${seal.code} 与图像 ${currentImageId} 的归属关系`);
        }
      }

      // 3. 如果没有找到标准印，跳过标准印处理
      if (standardSeals.length === 0) {
        console.log(`  ⊗ 印章 ${seal.code} 没有对应的标准件`);
        continue;
      }

      // 4. 为每个标准印添加节点和边
      for (const standard of standardSeals) {
        console.log(`  → 处理标准印: ${standard.standardSealId} (${standard.standardSealName})`);
        
        // 添加标准印节点
        const standardNode = this.dataManager.addStandardSealNode(
          standard.standardSealId  // 使用标准印章的seal_code
        );
        
        // 只有新节点才添加到结果中，标准印节点使用其原始name
        if (standardNode && standardNode.isNew) {
          // 标准印节点保持原有的 name（如 "痴绝2(标准)"）
          addedNodes.push(standardNode.node);
          console.log(`    ✓ 添加标准印节点: ${standard.standardSealId} - 显示为: ${standard.standardSealName}`);
        }

        // 添加相似关系边（印章 -> 标准印）
        const edge = this.dataManager.addSimilarityEdge(
          seal.code,
          standard.standardSealId,
          {
            similarity: standard.similarity,
            sealImage: seal.path,
            standardSealImage: standard.standardSealImage
          }
        );

        // 处理翻页增加或重复的情况
        if (edge && edge.edge) {
          // 如果是翻页增加但不是重复
          if (edge.isPageAdded && !edge.isDuplicate) {
            addedNodes.push({
              ...standardNode.node,
              isDuplicate: true,
              isPageAdded: true,
              edgeId: edge.edge.id,
              pageIndex: edge.pageIndex,
              fromNodeId: edge.fromNodeId,
              toNodeId: edge.toNodeId
            });
          }
          
          // 只有在边是新建或新增页时才添加边
          if (edge.isNew || (edge.isPageAdded && !edge.isDuplicate)) {
            addedEdges.push(edge.edge);
            const similarityStr = standard.similarity 
              ? `相似度: ${(standard.similarity * 100).toFixed(1)}%` 
              : '无相似度数据';
            console.log(`    ✓ 建立印章 ${seal.code} 与标准印 ${standard.standardSealId} 的相似关系 (${similarityStr})`);
          } else if (edge.isDuplicate) {
            console.log(`    ⚠️ 跳过重复的相似关系: ${seal.code} -> ${standard.standardSealId}`);
          }
        }
      }
    }

    return {
      data: {
        sealCount: seals.length,
        standardSealsCount: totalStandardSeals
      },
      message: `找到 ${totalStandardSeals} 个与所选 ${seals.length} 个印章对应的标准印`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 显示参考文献
   */
  async handleShowReferences(currentImageId, selectedItems, thresholds) {
    console.log('📚 显示参考文献...');
    
    const references = this.dataManager.getPaintingReferences(currentImageId);
    
    if (!references || references.length === 0) {
      return {
        data: { references: [] },
        message: '当前画作没有找到参考文献',
        addedNodes: [],
        addedEdges: []
      };
    }

    const addedNodes = [];
    const addedEdges = [];

    // 为每个参考文献添加节点和边
    for (const ref of references) {
      // 添加参考文献节点
      const refNode = this.dataManager.addReferenceNode(
        ref.reference_id,
        ref.reference_text || `参考文献 ${ref.reference_id}`
      );
      
      // 只有新节点才添加到结果中
      if (refNode.isNew) {
        addedNodes.push(refNode.node);
      }

      // 添加参考关系边
      const edge = this.dataManager.addReferenceEdge(
        currentImageId,
        ref.reference_id,
        {
          referenceText: ref.reference_text,
          page: ref.page,
          context: ref.context
        }
      );

      // 总是添加边
      addedEdges.push(edge.edge);
    }

    return {
      data: { references },
      message: `找到 ${references.length} 条参考文献`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 显示画作信息
   */
  async handleShowPaintingInfo(currentImageId, selectedItems, thresholds) {
    console.log('ℹ️ 显示画作信息...');
    
    const paintingInfo = this.dataManager.getPaintingInfo(currentImageId);
    
    if (!paintingInfo) {
      return {
        data: null,
        message: '未找到画作信息',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 确保画作节点存在
    const paintingNode = this.dataManager.addPaintingNode(
      currentImageId,
      paintingInfo.painting_name || `画作 ${currentImageId}`
    );

    return {
      data: paintingInfo,
      message: `画作: ${paintingInfo.painting_name || currentImageId}`,
      addedNodes: [paintingNode.node], // 总是返回画作节点
      addedEdges: []
    };
  }

  /**
   * 处理器: 显示所有印章
   */
  async handleShowAllSeals(currentImageId, selectedItems, thresholds) {
    console.log('🔖 显示所有印章...');
    
    const seals = this.dataManager.getPaintingSeals(currentImageId);
    
    if (!seals || seals.length === 0) {
      return {
        data: { seals: [] },
        message: '当前画作没有找到印章',
        addedNodes: [],
        addedEdges: []
      };
    }

    const addedNodes = [];
    const addedEdges = [];

    // 获取画作信息用于显示名称
    const paintingInfo = this.dataManager.getPaintingInfo(currentImageId);
    const paintingName = paintingInfo?.作品名 || paintingInfo?.painting_name || '未知画作';

    // 确保画作节点存在
    const paintingNode = this.dataManager.addPaintingNode(
      currentImageId,
      `画作 ${currentImageId}`
    );

    // 为每个印章添加节点和边
    for (const seal of seals) {
      // 添加印章节点 (只传 sealCode 和 paintingId)
      const sealNode = this.dataManager.addSealNode(
        seal.seal_code,
        currentImageId
      );
      
      // 只有新节点才添加到结果中，并设置显示名称
      if (sealNode && sealNode.isNew) {
        // 为历史记录设置显示名称：印章{编号}({画名})
        const nodeForHistory = {
          ...sealNode.node,
          displayName: `印章${seal.seal_code}(${paintingName})`
        };
        addedNodes.push(nodeForHistory);
      }

      // addSealNode 内部已经处理了归属关系边的创建
    }

    return {
      data: { seals },
      message: `找到 ${seals.length} 个印章`,
      addedNodes,
      addedEdges: [] // 边已经在 addSealNode 中添加了
    };
  }

  // ========== 未来需要实现的功能处理器（占位） ==========

  /**
   * 处理器: 根据画作名称查找相似的画作
   */
  async handleFindSimilarPaintingsByName(currentImageId, selectedItems, thresholds, question) {
    console.log('🔍 根据画作名称查找相似画作...', question);
    
    // 1. 获取当前图中所有画作节点的name集合
    const allNodes = this.dataManager.getAllNodes();
    const paintingNodes = allNodes.filter(node => node.type === 'P');
    
    console.log('📊 图中的画作节点:', paintingNodes.map(n => ({ id: n.id, name: n.name })));
    
    if (paintingNodes.length === 0) {
      return {
        data: [],
        message: '当前图中没有画作，请先添加画作',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 2. 从问题中识别画作名称
    let targetPaintingId = null;
    let targetPaintingName = null;
    
    // 遍历所有画作节点,检查问题中是否提到其名称
    for (const node of paintingNodes) {
      const paintingName = node.name || node.label;
      if (paintingName && question.includes(paintingName)) {
        targetPaintingId = node.id;
        targetPaintingName = paintingName;
        console.log(`✓ 在问题中找到画作名称: ${paintingName} (ID: ${targetPaintingId})`);
        break;
      }
    }
    
    // 3. 如果没有提到画作名,使用当前选中的画
    if (!targetPaintingId) {
      if (!currentImageId) {
        return {
          data: [],
          message: '请在问题中指定画作名称，或先选择一幅画作',
          addedNodes: [],
          addedEdges: []
        };
      }
      targetPaintingId = currentImageId;
      const paintingInfo = this.dataManager.getPaintingInfo(currentImageId);
      targetPaintingName = paintingInfo?.作品名 || paintingInfo?.painting_name || currentImageId;
      console.log(`✓ 使用当前选中的画作: ${targetPaintingName} (ID: ${targetPaintingId})`);
    }

    // 4. 获取该画作的所有切片相似度数据
    // 注意：一些画作有多个子编号（如 D001510_0, D001510_1 等）
    // 需要将所有子编号的数据合并
    const basePaintingId = this.getBasePaintingId(targetPaintingId);
    
    // 查找所有以基础ID开头的画作数据
    const allRelatedIds = Object.keys(segmentSimilarity).filter(id => 
      id === basePaintingId || id.startsWith(basePaintingId + '_')
    );
    
    if (allRelatedIds.length === 0) {
      return {
        data: [],
        message: `画作《${targetPaintingName}》没有切片相似度数据`,
        addedNodes: [],
        addedEdges: []
      };
    }

    console.log(`📊 找到 ${allRelatedIds.length} 个相关画作ID:`, allRelatedIds);
    
    // 统计总切片数
    let totalSegments = 0;
    allRelatedIds.forEach(id => {
      totalSegments += Object.keys(segmentSimilarity[id]).length;
    });
    console.log(`📊 总切片数: ${totalSegments} 个`);

    // 找出所有切片中相似度最高的一个
    let maxSimilarity = 0;
    let bestSegmentPath = null;
    let bestSimilarPainting = null;
    let bestSourceId = null;  // 记录来自哪个子编号

    // 遍历所有相关ID的切片
    for (const sourceId of allRelatedIds) {
      const segmentSimilarities = segmentSimilarity[sourceId];
      
      for (const [segmentPath, similarities] of Object.entries(segmentSimilarities)) {
        for (const [similarPaintingId, similarityData] of Object.entries(similarities)) {
          // 数据结构: similarityData = { "切片路径": 相似度值 }
          // 需要提取相似度值
          let similarity = 0;
          let similarSegmentPath = null;
          
          if (typeof similarityData === 'object' && similarityData !== null) {
            // 获取第一个（也是唯一的）切片路径和相似度
            const entries = Object.entries(similarityData);
            if (entries.length > 0) {
              similarSegmentPath = entries[0][0];
              similarity = entries[0][1];
            }
          } else {
            // 如果是直接的数值（向后兼容）
            similarity = similarityData;
          }
          
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
            bestSegmentPath = segmentPath;
            bestSourceId = sourceId;
            bestSimilarPainting = {
              paintingId: similarPaintingId,
              similarity: similarity,
              segmentPath: segmentPath,
              similarSegmentPath: similarSegmentPath || segmentPath
            };
          }
        }
      }
    }

    console.log(`🎯 最高相似度: ${maxSimilarity}, 来自: ${bestSourceId}, 最佳匹配:`, bestSimilarPainting);

    if (!bestSimilarPainting) {
      return {
        data: [],
        message: `画作《${targetPaintingName}》没有找到相似的画作`,
        addedNodes: [],
        addedEdges: []
      };
    }

    console.log(`✓ 找到最相似的画作:`, bestSimilarPainting);

    // 5. 添加相似画作节点和边
    const addedNodes = [];
    const addedEdges = [];

    // 确保源画作节点存在
    const sourcePaintingNode = this.dataManager.addPaintingNode(targetPaintingId);
    if (sourcePaintingNode && sourcePaintingNode.isNew) {
      addedNodes.push(sourcePaintingNode.node);
    }

    // 提取基础画作ID（相似画作的）
    const similarBasePaintingId = this.getBasePaintingId(bestSimilarPainting.paintingId);
    
    console.log(`  原始ID: ${bestSimilarPainting.paintingId} -> 基础ID: ${similarBasePaintingId}`);
    
    // 添加相似画作节点
    const similarPaintingNode = this.dataManager.addPaintingNode(similarBasePaintingId);
    
    if (similarPaintingNode && similarPaintingNode.isNew) {
      addedNodes.push(similarPaintingNode.node);
    }

    // 添加相似关系边
    const edgeResult = this.dataManager.addSimilarityEdge(
      targetPaintingId,
      similarBasePaintingId,
      {
        similarity: bestSimilarPainting.similarity,
        segmentPath: bestSegmentPath,
        segmentName: bestSegmentPath.split('/').pop(),
        similarSegmentPath: bestSimilarPainting.similarSegmentPath,
        originalPaintingId: bestSimilarPainting.paintingId
      }
    );

    // 处理翻页增加的情况
    if (edgeResult.isPageAdded && !edgeResult.isDuplicate) {
      addedNodes.push({
        ...similarPaintingNode.node,
        isDuplicate: true,
        isPageAdded: true,
        edgeId: edgeResult.edge.id,
        pageIndex: edgeResult.pageIndex,
        fromNodeId: edgeResult.fromNodeId,
        toNodeId: edgeResult.toNodeId
      });
    }

    // 只有在边是新建或新增页时才添加边
    // 如果是重复的相似关系（isDuplicate: true），不添加
    if (edgeResult.isNew || (edgeResult.isPageAdded && !edgeResult.isDuplicate)) {
      addedEdges.push(edgeResult.edge);
    } else if (edgeResult.isDuplicate) {
      console.log(`⚠️ 跳过重复的相似关系: ${bestSimilarPainting.paintingId}`);
    }

    // 获取相似画作的名称
    const similarPaintingInfo = this.dataManager.getPaintingInfo(similarBasePaintingId);
    const similarPaintingName = similarPaintingInfo?.作品名 || similarPaintingInfo?.painting_name || similarBasePaintingId;

    return {
      data: {
        sourcePainting: targetPaintingName,
        similarPainting: similarPaintingName,
        similarity: bestSimilarPainting.similarity,
        segmentPath: bestSegmentPath
      },
      message: `找到与《${targetPaintingName}》最相似的画作《${similarPaintingName}》，相似度: ${(bestSimilarPainting.similarity * 100).toFixed(1)}%`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 根据画作名称显示其所有印章
   */
  async handleShowPaintingSealsByName(currentImageId, selectedItems, thresholds, question) {
    console.log('🔖 根据画作名称显示印章...', question);
    
    // 1. 获取当前图中所有画作节点
    const allNodes = this.dataManager.getAllNodes();
    const paintingNodes = allNodes.filter(node => node.type === 'P');
    
    console.log('📊 图中的画作节点:', paintingNodes.map(n => ({ id: n.id, name: n.name })));
    
    if (paintingNodes.length === 0) {
      return {
        data: [],
        message: '当前图中没有画作，请先添加画作',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 2. 从问题中识别画作名称
    let targetPaintingId = null;
    let targetPaintingName = null;
    
    // 遍历所有画作节点,检查问题中是否提到其名称
    for (const node of paintingNodes) {
      const paintingName = node.name || node.label;
      if (paintingName && question.includes(paintingName)) {
        targetPaintingId = node.id;
        targetPaintingName = paintingName;
        console.log(`✓ 在问题中找到画作名称: ${paintingName} (ID: ${targetPaintingId})`);
        break;
      }
    }
    
    // 3. 如果没有提到画作名,使用当前选中的画
    if (!targetPaintingId) {
      if (!currentImageId) {
        return {
          data: [],
          message: '请在问题中指定画作名称，或先选择一幅画作',
          addedNodes: [],
          addedEdges: []
        };
      }
      targetPaintingId = currentImageId;
      const paintingInfo = this.dataManager.getPaintingInfo(currentImageId);
      targetPaintingName = paintingInfo?.作品名 || paintingInfo?.painting_name || currentImageId;
      console.log(`✓ 使用当前选中的画作: ${targetPaintingName} (ID: ${targetPaintingId})`);
    }

    // 4. 获取该画作的所有印章
    const seals = this.dataManager.getPaintingSeals(targetPaintingId);
    
    if (!seals || seals.length === 0) {
      return {
        data: { 
          seals: [],
          paintingName: targetPaintingName,
          paintingId: targetPaintingId
        },
        message: `画作《${targetPaintingName}》没有找到印章`,
        addedNodes: [],
        addedEdges: []
      };
    }

    const addedNodes = [];
    const addedEdges = [];

    // 5. 确保画作节点存在
    const paintingNode = this.dataManager.addPaintingNode(targetPaintingId);
    if (paintingNode && paintingNode.isNew) {
      addedNodes.push(paintingNode.node);
    }

    // 6. 为每个印章添加节点和边
    for (const seal of seals) {
      // 添加印章节点
      const sealNode = this.dataManager.addSealNode(
        seal.seal_code,
        targetPaintingId
      );
      
      // 只有新节点才添加到结果中，并设置显示名称
      if (sealNode && sealNode.isNew) {
        // 为历史记录设置显示名称：印章{编号}({画名})
        const nodeForHistory = {
          ...sealNode.node,
          displayName: `印章${seal.seal_code}(${targetPaintingName})`
        };
        addedNodes.push(nodeForHistory);
      }

      // addSealNode 内部已经处理了归属关系边的创建
    }

    return {
      data: { 
        seals,
        paintingName: targetPaintingName,
        paintingId: targetPaintingId
      },
      message: `找到《${targetPaintingName}》的 ${seals.length} 个印章`,
      addedNodes,
      addedEdges: []
    };
  }

  /**
   * 处理器: 显示石涛的所有画作
   */
  async handleShowAllPaintingsByAuthor(currentImageId, selectedItems, thresholds) {
    console.log('🖼️ 显示石涛的所有画作...');
    
    // 从 StorylineDataManager 获取所有画作
    const paintings = this.dataManager.getAllPaintings();
    
    if (!paintings || paintings.length === 0) {
      return {
        data: { paintings: [] },
        message: '未找到画作数据',
        addedNodes: [],
        addedEdges: []
      };
    }

    const addedNodes = [];
    const addedEdges = [];

    // 石涛节点在初始化时已经创建，验证其存在
    const authorNode = this.dataManager.nodes.get('AUTHOR_SHITAO');
    
    if (!authorNode) {
      console.warn('⚠️ 石涛节点不存在！');
      return {
        success: false,
        message: '系统错误：石涛节点未初始化',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 注意：不将石涛节点添加到 addedNodes，因为它是默认节点，不应在历史记录中显示

    // 为每个画作添加节点和边
    for (const painting of paintings) {
      // 添加画作节点
      const paintingNode = this.dataManager.addPaintingNode(
        painting.编号
      );
      
      // 只有新节点才添加到结果中
      if (paintingNode && paintingNode.isNew) {
        addedNodes.push(paintingNode.node);
      }

      // 添加画作与石涛的归属关系边 (P-A)
      const edge = this.dataManager.addOwnershipEdge(
        painting.编号,
        'AUTHOR_SHITAO',
        {
          relationship: 'owned_by',
          edgeType: 'P-A'
        }
      );

      if (edge) {
        addedEdges.push(edge.edge);
      }
    }

    return {
      data: { paintings },
      message: `找到 ${paintings.length} 个石涛的画作`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 显示当前画作的参考文献
   */
  async handleShowCurrentPaintingReferences(currentImageId, selectedItems, thresholds) {
    console.log('📚 显示当前画作的参考文献...', currentImageId);
    
    if (!currentImageId) {
      return {
        data: [],
        message: '请先选择一个画作',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 获取画作的参考文献
    const references = this.dataManager.getPaintingReferences(currentImageId);
    
    if (!references || references.length === 0) {
      return {
        data: { references: [] },
        message: '该画作暂无参考文献记录',
        addedNodes: [],
        addedEdges: []
      };
    }

    const addedNodes = [];
    const addedEdges = [];

    // 确保当前画作节点存在
    const paintingNode = this.dataManager.addPaintingNode(currentImageId);
    if (paintingNode && paintingNode.isNew) {
      addedNodes.push(paintingNode.node);
    }

    // 为每个参考文献添加节点和边
    for (const reference of references) {
      // 添加参考文献节点
      const referenceNode = this.dataManager.addReferenceNode(
        reference.reference_id,
        reference
      );
      
      // 只有新节点才添加到结果中
      if (referenceNode && referenceNode.isNew) {
        addedNodes.push(referenceNode.node);
      }

      // 添加画作与参考文献的参考关系边 (P-R)
      const edge = this.dataManager.addReferenceEdge(
        currentImageId,
        reference.reference_id,
        {
          info: reference.info,
          text_record: reference.text_record
        }
      );

      if (edge && edge.isNew) {
        addedEdges.push(edge.edge);
      }
    }

    return {
      data: { references },
      message: `找到 ${references.length} 条参考文献`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 智能参考文献查询 - 使用LLM判断相关文献
   */
  async handleSmartReferenceQuery(currentImageId, selectedItems, thresholds, question) {
    console.log('🤖 智能参考文献查询...', question);
    
    // 1. 获取当前图中所有画作的ID
    const allNodes = this.dataManager.getAllNodes();
    const paintingIds = allNodes
      .filter(node => node.type === 'P')
      .map(node => node.id);
    
    console.log('📊 图中的画作:', paintingIds);
    
    if (paintingIds.length === 0) {
      return {
        data: [],
        message: '当前图中没有画作，请先添加画作',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 2. 收集所有这些画作的参考文献
    const allReferences = [];
    const paintingToReferences = new Map(); // 记录每个参考文献对应的画作
    
    for (const paintingId of paintingIds) {
      const references = this.dataManager.getPaintingReferences(paintingId);
      if (references && references.length > 0) {
        for (const ref of references) {
          // 记录参考文献信息
          const refKey = ref.reference_id;
          if (!paintingToReferences.has(refKey)) {
            paintingToReferences.set(refKey, {
              reference: ref,
              paintings: []
            });
          }
          paintingToReferences.get(refKey).paintings.push(paintingId);
        }
      }
    }

    // 转换为数组
    for (const [refId, data] of paintingToReferences.entries()) {
      allReferences.push({
        reference_id: refId,
        name: data.reference.name,
        info: data.reference.info,
        text_record: data.reference.text_record,
        paintings: data.paintings
      });
    }

    console.log('📚 收集到的所有参考文献:', allReferences.length, allReferences);

    if (allReferences.length === 0) {
      return {
        data: [],
        message: '当前图中的画作暂无参考文献记录',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 3. 构建LLM提示词
    const prompt = `你是一个中国古代绘画研究专家。现在用户提出了一个问题，我需要你判断哪些参考文献与这个问题相关。

用户问题：${question}

可用的参考文献列表：
${allReferences.map((ref, index) => `
${index + 1}. 参考文献ID: ${ref.reference_id}
   名称: ${ref.name}
   信息: ${ref.info}
   文本记录: ${ref.text_record}
   相关画作: ${ref.paintings.join(', ')}
`).join('\n')}

请分析用户的问题，判断哪些参考文献与问题相关。如果问题是在询问某幅画的参考文献，则返回该画的所有文献。如果问题是在询问某个时期、某个主题、某个人物等，则返回所有与之相关的文献。

请以JSON格式返回结果：
{
  "relevant_reference_ids": ["参考文献ID1", "参考文献ID2", ...],
  "reason": "选择这些文献的原因"
}

如果没有相关文献，返回空数组。只返回JSON，不要其他解释。`;

    console.log('🤖 发送给LLM的提示词:', prompt);

    // 4. 调用LLM
    let llmResponse;
    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-d92a575188954a01b6a4fc4e2d231fe9'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的中国古代绘画研究专家，擅长分析参考文献与问题的相关性。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3
        })
      });

      if (response.ok) {
        const data = await response.json();
        llmResponse = data.choices[0].message.content;
        console.log('🤖 LLM原始响应:', llmResponse);
      } else {
        const errorText = await response.text();
        console.error('❌ API调用失败:', response.status, errorText);
        throw new Error(`API调用失败: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ LLM调用失败:', error);
      return {
        data: [],
        message: 'LLM调用失败，请稍后重试',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 5. 解析LLM响应
    let relevantReferenceIds = [];
    let reason = '';
    
    try {
      // 尝试从响应中提取JSON
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        relevantReferenceIds = result.relevant_reference_ids || [];
        reason = result.reason || '';
      } else {
        console.warn('⚠️ LLM响应格式不正确，尝试解析失败');
      }
    } catch (error) {
      console.error('❌ 解析LLM响应失败:', error);
    }

    console.log('✅ LLM判断的相关文献:', relevantReferenceIds);
    console.log('📝 判断理由:', reason);

    if (relevantReferenceIds.length === 0) {
      return {
        data: { reason },
        message: reason || '未找到与问题相关的参考文献',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 6. 添加相关文献节点和边到图中
    const addedNodes = [];
    const addedEdges = [];

    for (const refId of relevantReferenceIds) {
      const refData = paintingToReferences.get(refId);
      if (!refData) continue;

      const reference = refData.reference;
      const paintings = refData.paintings;

      // 添加参考文献节点
      const referenceNode = this.dataManager.addReferenceNode(
        refId,
        reference
      );
      
      if (referenceNode && referenceNode.isNew) {
        addedNodes.push(referenceNode.node);
      }

      // 为每个相关画作添加连接边
      for (const paintingId of paintings) {
        // 确保画作节点存在
        const paintingNode = this.dataManager.addPaintingNode(paintingId);
        if (paintingNode && paintingNode.isNew) {
          addedNodes.push(paintingNode.node);
        }

        // 添加画作与参考文献的参考关系边 (P-R)
        const edge = this.dataManager.addReferenceEdge(
          paintingId,
          refId,
          {
            info: reference.info,
            text_record: reference.text_record
          }
        );

        if (edge && edge.isNew) {
          addedEdges.push(edge.edge);
        }
      }
    }

    return {
      data: { 
        relevantReferences: relevantReferenceIds.map(id => paintingToReferences.get(id)?.reference),
        reason 
      },
      message: `${reason}\n\n找到 ${relevantReferenceIds.length} 条相关参考文献`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 根据印章编号查找对应的标准印
   */
  async handleFindStandardSealByCode(currentImageId, selectedItems, thresholds, question) {
    console.log('🔍 根据印章编号查找标准印...', question);
    
    // 1. 从问题中提取印章编号
    // 匹配格式: "印章0003", "印章003", "0003", "003" 等
    const sealCodeMatch = question.match(/印章(\d+)|(\d{3,4})/);
    let sealCode = null;
    
    if (sealCodeMatch) {
      // 提取数字部分
      sealCode = sealCodeMatch[1] || sealCodeMatch[2];
      // 补齐为4位数字
      sealCode = sealCode.padStart(4, '0');
      console.log(`✓ 从问题中提取印章编号: ${sealCode}`);
    } else {
      return {
        data: [],
        message: '请输入完整的印章编号，例如："印章0003" 或 "0003"',
        addedNodes: [],
        addedEdges: []
      };
    }
    
    // 2. 检查该印章是否在当前图中存在
    const allNodes = this.dataManager.getAllNodes();
    const sealNode = allNodes.find(node => node.type === 'S' && node.id === sealCode);
    
    if (!sealNode) {
      console.log(`⚠️ 印章 ${sealCode} 不在当前图中`);
      return {
        data: { sealCode },
        message: `印章${sealCode}不在当前图中，请先添加该印章到图中`,
        addedNodes: [],
        addedEdges: []
      };
    }
    
    console.log(`✓ 找到印章节点:`, sealNode);
    
    // 3. 查找该印章的标准件
    const standardSeals = this.dataManager.findSimilarStandardSeals(sealCode);
    
    if (!standardSeals || standardSeals.length === 0) {
      return {
        data: { sealCode },
        message: `印章${sealCode}没有对应的标准件`,
        addedNodes: [],
        addedEdges: []
      };
    }
    
    console.log(`✓ 找到 ${standardSeals.length} 个标准印`);
    
    // 4. 添加标准印节点和边
    const addedNodes = [];
    const addedEdges = [];
    
    // 获取印章所属的画作信息（用于显示名称）
    let paintingName = '未知画作';
    
    // 从印章节点的边中查找归属的画作
    const allEdges = this.dataManager.getAllEdges();
    const ownershipEdge = allEdges.find(edge => 
      edge.source === sealCode && edge.target && edge.target.startsWith('D')
    );
    
    if (ownershipEdge) {
      const paintingInfo = this.dataManager.getPaintingInfo(ownershipEdge.target);
      paintingName = paintingInfo?.作品名 || paintingInfo?.painting_name || ownershipEdge.target;
    }
    
    // 为每个标准印添加节点和边
    for (const standard of standardSeals) {
      console.log(`  → 处理标准印: ${standard.standardSealId} (${standard.standardSealName})`);
      
      // 添加标准印节点
      const standardNode = this.dataManager.addStandardSealNode(
        standard.standardSealId
      );
      
      // 只有新节点才添加到结果中
      if (standardNode && standardNode.isNew) {
        addedNodes.push(standardNode.node);
        console.log(`    ✓ 添加标准印节点: ${standard.standardSealId} - 显示为: ${standard.standardSealName}`);
      }
      
      // 添加相似关系边（印章 -> 标准印）
      const edge = this.dataManager.addSimilarityEdge(
        sealCode,
        standard.standardSealId,
        {
          similarity: standard.similarity,
          sealImage: standard.sealImage,
          standardSealImage: standard.standardSealImage
        }
      );
      
      // 处理翻页增加或重复的情况
      if (edge && edge.edge) {
        // 如果是翻页增加但不是重复
        if (edge.isPageAdded && !edge.isDuplicate) {
          addedNodes.push({
            ...standardNode.node,
            isDuplicate: true,
            isPageAdded: true,
            edgeId: edge.edge.id,
            pageIndex: edge.pageIndex,
            fromNodeId: edge.fromNodeId,
            toNodeId: edge.toNodeId
          });
        }
        
        // 只有在边是新建或新增页时才添加边
        if (edge.isNew || (edge.isPageAdded && !edge.isDuplicate)) {
          addedEdges.push(edge.edge);
          const similarityStr = standard.similarity 
            ? `相似度: ${(standard.similarity * 100).toFixed(1)}%` 
            : '无相似度数据';
          console.log(`    ✓ 建立印章 ${sealCode} 与标准印 ${standard.standardSealId} 的相似关系 (${similarityStr})`);
        } else if (edge.isDuplicate) {
          console.log(`    ⚠️ 跳过重复的相似关系: ${sealCode} -> ${standard.standardSealId}`);
        }
      }
    }
    
    return {
      data: {
        sealCode,
        paintingName,
        standardSealsCount: standardSeals.length,
        standardSeals
      },
      message: `找到印章${sealCode}的 ${standardSeals.length} 个标准件`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 处理器: 根据标准印名称查找所有相似的印章
   */
  async handleShowSealsByStandardSealName(currentImageId, selectedItems, thresholds, question) {
    console.log('🔍 根据标准印名称查找印章...', question);
    
    // 1. 从问题中提取标准印名称，并查找对应的标准印节点
    const allNodes = this.dataManager.getAllNodes();
    const standardSealNodes = allNodes.filter(node => node.type === 'SS');
    
    console.log('📊 图中的标准印节点:', standardSealNodes.map(n => ({ id: n.id, name: n.name })));
    
    if (standardSealNodes.length === 0) {
      return {
        data: [],
        message: '当前图中没有标准印，请先添加标准印到图中',
        addedNodes: [],
        addedEdges: []
      };
    }
    
    // 2. 从问题中识别标准印名称（支持带不带"(标准)"）
    let targetStandardSealId = null;
    let targetStandardSealName = null;
    
    // 遍历所有标准印节点，检查问题中是否提到其名称
    for (const node of standardSealNodes) {
      const standardSealName = node.name || node.label;
      if (!standardSealName) continue;
      
      // 获取不带"(标准)"的名称
      const nameWithoutSuffix = standardSealName.replace(/\(标准\)$/, '');
      
      // 检查问题中是否包含完整名称（带或不带"(标准)"）
      if (question.includes(standardSealName) || question.includes(nameWithoutSuffix)) {
        targetStandardSealId = node.id;
        targetStandardSealName = standardSealName;
        console.log(`✓ 在问题中找到标准印名称: ${standardSealName} (ID: ${targetStandardSealId})`);
        break;
      }
    }
    
    if (!targetStandardSealId) {
      return {
        data: [],
        message: '未在当前图中找到匹配的标准印，请先添加标准印到图中',
        addedNodes: [],
        addedEdges: []
      };
    }
    
    // 3. 从 seal_mapping.json 中查找所有使用该标准印的印章
    // 获取该标准印对应的 reference 文件名
    const standardSealInfo = standardSealsInfo.find(
      info => info.seal_code === targetStandardSealId
    );
    
    if (!standardSealInfo) {
      return {
        data: [],
        message: `未找到标准印 ${targetStandardSealId} 的信息`,
        addedNodes: [],
        addedEdges: []
      };
    }
    
    const targetReferenceImage = standardSealInfo.standard_image;
    console.log(`  标准印 ${targetStandardSealId} 对应文件: ${targetReferenceImage}`);
    
    // 在 seal_mapping.json 中查找所有 standard_image 匹配的印章
    const relatedSealCodes = new Set();
    
    for (const mapping of sealMapping) {
      if (mapping.has_reference && mapping.standard_image === targetReferenceImage) {
        relatedSealCodes.add(mapping.seal_code);
        console.log(`  从 seal_mapping 找到相关印章: ${mapping.seal_code} (相似度: ${mapping.similarity})`);
      }
    }
    
    if (relatedSealCodes.size === 0) {
      return {
        data: {
          standardSealId: targetStandardSealId,
          standardSealName: targetStandardSealName
        },
        message: `标准印《${targetStandardSealName}》暂无对应的印章`,
        addedNodes: [],
        addedEdges: []
      };
    }
    
    console.log(`✓ 找到 ${relatedSealCodes.size} 个使用该标准印的印章`);
    
    // 4. 为每个印章添加节点和边，并确保印章与其归属的画作连接
    const addedNodes = [];
    const addedEdges = [];
    const sealToPaintingMap = new Map(); // 记录每个印章对应的画作
    
    // 先从 all_seals_info 找出每个印章归属的画作
    for (const sealCode of relatedSealCodes) {
      // 从 all_seals_info 查找该印章的画作归属
      const sealInfo = allSealsInfo.find(
        info => info.seal_code === sealCode
      );
      
      if (sealInfo && sealInfo.painting_id) {
        sealToPaintingMap.set(sealCode, sealInfo.painting_id);
        console.log(`  印章 ${sealCode} 归属于画作 ${sealInfo.painting_id}`);
      } else {
        console.warn(`  ⚠️ 印章 ${sealCode} 未找到归属的画作`);
      }
    }
    
    // 确保标准印节点存在
    const standardSealNode = this.dataManager.addStandardSealNode(targetStandardSealId);
    
    // 为每个印章添加节点和归属关系
    for (const sealCode of relatedSealCodes) {
      const paintingId = sealToPaintingMap.get(sealCode);
      
      // 获取画作信息用于显示名称
      let paintingName = '未知画作';
      if (paintingId) {
        const paintingInfo = this.dataManager.getPaintingInfo(paintingId);
        paintingName = paintingInfo?.作品名 || paintingInfo?.painting_name || paintingId;
        
        // 确保画作节点存在
        const paintingNode = this.dataManager.addPaintingNode(paintingId);
        if (paintingNode && paintingNode.isNew) {
          addedNodes.push(paintingNode.node);
        }
      }
      
      // 添加印章节点
      const sealNode = this.dataManager.addSealNode(sealCode, paintingId);
      
      // 只有新节点才添加到结果中，并设置显示名称
      if (sealNode && sealNode.isNew) {
        // 为历史记录设置显示名称：印章{编号}({画名})
        const nodeForHistory = {
          ...sealNode.node,
          displayName: `印章${sealCode}(${paintingName})`
        };
        addedNodes.push(nodeForHistory);
        console.log(`  ✓ 添加印章节点: ${sealCode} - 显示为: 印章${sealCode}(${paintingName})`);
      }
      
      // 确保印章与画作的归属关系边存在
      if (paintingId) {
        const ownershipEdge = this.dataManager.addOwnershipEdge(sealCode, paintingId);
        if (ownershipEdge && ownershipEdge.isNew) {
          addedEdges.push(ownershipEdge.edge);
          console.log(`  ✓ 建立印章 ${sealCode} 与画作 ${paintingId} 的归属关系`);
        }
      }
      
      // 确保印章与标准印的相似关系边存在
      // 从 StorylineDataManager 获取标准印信息以获取相似度
      const standardSeals = this.dataManager.findSimilarStandardSeals(sealCode);
      const matchingStandard = standardSeals.find(s => s.standardSealId === targetStandardSealId);
      
      if (matchingStandard) {
        const similarityEdge = this.dataManager.addSimilarityEdge(
          sealCode,
          targetStandardSealId,
          {
            similarity: matchingStandard.similarity,
            sealImage: matchingStandard.sealImage,
            standardSealImage: matchingStandard.standardSealImage
          }
        );
        
        if (similarityEdge && (similarityEdge.isNew || (similarityEdge.isPageAdded && !similarityEdge.isDuplicate))) {
          addedEdges.push(similarityEdge.edge);
          console.log(`  ✓ 建立印章 ${sealCode} 与标准印 ${targetStandardSealId} 的相似关系`);
        }
      }
    }
    
    return {
      data: {
        standardSealId: targetStandardSealId,
        standardSealName: targetStandardSealName,
        sealsCount: relatedSealCodes.size,
        seals: Array.from(relatedSealCodes).map(sealCode => ({
          sealCode,
          paintingId: sealToPaintingMap.get(sealCode)
        }))
      },
      message: `找到 ${relatedSealCodes.size} 个使用标准印《${targetStandardSealName}》的印章`,
      addedNodes,
      addedEdges
    };
  }

  // ========== 核心已实现功能处理器 ==========

  /**
   * 处理器: 显示石涛的所有标准印章
   */
  async handleShowAllStandardSeals(currentImageId, selectedItems, thresholds) {
    console.log('🔖 显示石涛的所有标准印章...');
    
    // 从 StorylineDataManager 获取所有标准印章
    const standardSeals = this.dataManager.getAllStandardSeals();
    
    if (!standardSeals || standardSeals.length === 0) {
      return {
        data: { standardSeals: [] },
        message: '未找到标准印章数据',
        addedNodes: [],
        addedEdges: []
      };
    }

    const addedNodes = [];
    const addedEdges = [];

    // 石涛节点在初始化时已经创建，验证其存在
    const authorNode = this.dataManager.nodes.get('AUTHOR_SHITAO');
    
    if (!authorNode) {
      console.warn('⚠️ 石涛节点不存在！');
      return {
        success: false,
        message: '系统错误：石涛节点未初始化',
        addedNodes: [],
        addedEdges: []
      };
    }

    // 注意：不将石涛节点添加到 addedNodes，因为它是默认节点，不应在历史记录中显示

    // 为每个标准印章添加节点和边
    for (const standardSeal of standardSeals) {
      // 添加标准印章节点
      const standardSealNode = this.dataManager.addStandardSealNode(
        standardSeal.seal_code
      );
      
      // 只有新节点才添加到结果中
      if (standardSealNode && standardSealNode.isNew) {
        addedNodes.push(standardSealNode.node);
      }

      // 添加标准印章与石涛的归属关系边 (SS-A)
      const edge = this.dataManager.addOwnershipEdge(
        standardSeal.seal_code,
        'AUTHOR_SHITAO',
        {
          relationship: 'owned_by',
          edgeType: 'SS-A'
        }
      );

      if (edge) {
        addedEdges.push(edge.edge);
      }
    }

    return {
      data: { standardSeals },
      message: `找到 ${standardSeals.length} 个石涛的标准印章`,
      addedNodes,
      addedEdges
    };
  }

  /**
   * 获取所有问题模板的描述 (用于帮助提示)
   */
  getQuestionHelp() {
    return this.questionTemplates.map(t => ({
      id: t.id,
      description: t.description,
      keywords: t.keywords,
      requiredSelection: t.requiredSelection
    }));
  }
}

// 单例模式
let instance = null;

export default {
  getInstance: () => {
    if (!instance) {
      instance = new QuestionProcessor();
    }
    return instance;
  }
};
