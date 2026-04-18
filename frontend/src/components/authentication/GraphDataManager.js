/**
 * GraphDataManager - 图数据管理器 (单例模式)
 * 
 * 核心思想:
 * 1. 定义标准问题模板集合 (对应图中所有关系类型)
 * 2. LLM将用户问题映射到标准问题模板
 * 3. 根据问题模板从总图 data6.json 提取相关子图
 * 4. 维护当前显示的子图,随提问逐步扩展
 */

class GraphDataManager {
  constructor() {
    if (GraphDataManager.instance) {
      return GraphDataManager.instance;
    }
    
    this.baseGraph = { nodes: [], links: [] }; // 总图 (data6.json)
    this.currentGraph = { nodes: [], links: [] }; // 当前显示的子图
    this.queryHistory = []; // 查询历史,最多保留5条
    this.isInitialized = false;
    
    // 标准问题模板集合 - 对应图中所有可能的关系
    this.questionTemplates = {
      // 印章相关
      'SEAL_SIMILARITY': {
        description: '查找与指定印章相似的其他印章',
        pattern: /相似.*印章|印章.*相似|类似.*印章/,
        handler: 'findSimilarSeals'
      },
      'SEAL_PAINTINGS': {
        description: '查找使用了指定印章的所有画作',
        pattern: /印.*画|哪些画.*印章|印章.*出现/,
        handler: 'findPaintingsBySeals'
      },
      'SEAL_OWNER': {
        description: '查找印章的拥有者',
        pattern: /拥有者|属于谁|谁的印章/,
        handler: 'findSealOwner'
      },
      
      // 画作相关
      'PAINTING_SIMILARITY': {
        description: '查找与指定画作图像相似的其他画作',
        pattern: /相似.*画|画.*相似|类似.*画作|风格.*相近/,
        handler: 'findSimilarPaintings'
      },
      'PAINTING_SEALS': {
        description: '查找画作上的所有印章',
        pattern: /有哪些印章|印章有|盖了.*印/,
        handler: 'findSealsByPainting'
      },
      'PAINTING_AUTHOR': {
        description: '查找画作的作者',
        pattern: /这幅画.*作者|画作.*作者|谁画的|这.*是.*谁.*画/,
        handler: 'findPaintingAuthor'
      },
      'PAINTING_REFERENCES': {
        description: '查找画作相关的文献资料',
        pattern: /文献|记载|资料|出处|著录/,
        handler: 'findPaintingReferences'
      },
      
      // 作者相关
      'AUTHOR_PAINTINGS': {
        description: '查找作者的所有画作',
        pattern: /画了哪些|作品有|创作.*画|画.*哪些|有哪些.*作品/,
        handler: 'findPaintingsByAuthor'
      },
      'AUTHOR_SEALS': {
        description: '查找作者使用的所有印章',
        pattern: /用了哪些印|印章.*使用/,
        handler: 'findSealsByAuthor'
      },
      
      // 文献相关
      'REFERENCE_PAINTINGS': {
        description: '查找文献中提到的画作',
        pattern: /提到.*画|记载.*画作/,
        handler: 'findPaintingsByReference'
      },
      'REFERENCE_AUTHORS': {
        description: '查找文献中提到的作者',
        pattern: /提到.*作者|记载.*画家/,
        handler: 'findAuthorsByReference'
      }
    };
    
    GraphDataManager.instance = this;
  }

  /**
   * 加载总图数据 (data6.json)
   */
  async loadBaseData() {
    try {
      const response = await fetch('../../assets/data/data6.json');
      this.baseGraph = await response.json();
      this.isInitialized = true;
      console.log('✅ 总图加载成功:', this.baseGraph);
      return this.baseGraph;
    } catch (error) {
      console.error('❌ 加载总图失败:', error);
      return null;
    }
  }

  /**
   * 初始化图 - 根据目标画作
   * @param {string} targetPaintingId - 鉴定目标画作的ID (如 "D011518")
   */
  initializeGraph(targetPaintingId) {
    if (!this.isInitialized) {
      console.error('❌ 请先调用 loadBaseData()');
      return null;
    }

    const targetNode = this.baseGraph.nodes.find(n => n.id === targetPaintingId);
    if (!targetNode) {
      console.error('❌ 未找到目标画作:', targetPaintingId);
      return null;
    }

    // 初始节点: 只包含目标画作
    const initialNodes = [
      targetNode
    ];

    // 添加石涛节点
    const shiTaoNode = this.baseGraph.nodes.find(n => n.name === "石涛" && n.category === "A");
    if (shiTaoNode) {
      initialNodes.push(shiTaoNode);
    }

    // 添加目标画作的印章
    const targetSeals = this.getSealsForPainting(targetPaintingId);
    initialNodes.push(...targetSeals);

    // 找到相关的边
    const allNodeIds = initialNodes.map(n => n.id);
    const initialLinks = this.baseGraph.links.filter(link => {
      const source = link.source?.id || link.source;
      const target = link.target?.id || link.target;
      return allNodeIds.includes(source) && allNodeIds.includes(target);
    });

    this.currentGraph = {
      nodes: initialNodes,
      links: initialLinks
    };

    console.log('✅ 初始图构建完成, 节点数:', this.currentGraph.nodes.length, '边数:', this.currentGraph.links.length);
    return this.currentGraph;
  }

  /**
   * 主入口: 处理用户问题
   * @param {string} userQuestion - 用户原始问题
   * @param {string} aiResponse - AI的回答(用于辅助判断)
   * @returns {Array} 新添加的节点
   */
  async processQuestion(userQuestion, aiResponse = '') {
    console.log('🔍 开始处理问题:', userQuestion);
    
    // 1. 优先从AI回答中提取模板编号
    let mapping = this.extractTemplateFromAIResponse(aiResponse);
    
    // 2. 如果AI没有明确给出模板，则使用正则匹配
    if (!mapping) {
      mapping = this.mapQuestionToTemplate(userQuestion + ' ' + aiResponse);
    }
    
    if (!mapping) {
      console.log('ℹ️ 无法映射到标准问题模板');
      return [];
    }

    // 3. 根据模板调用对应的处理器
    const handler = this[mapping.template.handler];
    if (!handler) {
      console.error('❌ 未找到处理器:', mapping.template.handler);
      return [];
    }

    // 4. 执行处理器,获取新节点
    const newNodes = handler.call(this, mapping.entities);
    
    // 5. 添加到当前图
    if (newNodes && newNodes.length > 0) {
      this.addNodesToGraph(newNodes);
      
      // 6. 添加到历史
      this.addToHistory(userQuestion, aiResponse, newNodes, mapping.template.description);
    }

    return newNodes;
  }

  /**
   * 从AI回答中提取模板编号
   * @param {string} aiResponse - AI的映射回答
   * @returns {Object|null} 映射结果
   */
  extractTemplateFromAIResponse(aiResponse) {
    if (!aiResponse) return null;
    
    // 匹配 "问题类型: 数字" 或 "模板数字"
    const match = aiResponse.match(/问题类型[:：]\s*(\d+)|模板\s*(\d+)/);
    if (!match) return null;
    
    const templateNumber = parseInt(match[1] || match[2]);
    console.log('🎯 AI识别的模板编号:', templateNumber);
    
    // 模板编号到key的映射
    const templateMap = {
      1: 'SEAL_SIMILARITY',
      2: 'SEAL_PAINTINGS',
      3: 'SEAL_OWNER',
      4: 'PAINTING_SIMILARITY',
      5: 'PAINTING_SEALS',
      6: 'PAINTING_AUTHOR',
      7: 'PAINTING_REFERENCES',
      8: 'AUTHOR_PAINTINGS',
      9: 'AUTHOR_SEALS',
      10: 'REFERENCE_PAINTINGS',
      11: 'REFERENCE_AUTHORS'
    };
    
    const templateKey = templateMap[templateNumber];
    if (!templateKey) {
      console.log('⚠️ 无效的模板编号:', templateNumber);
      return null;
    }
    
    const template = this.questionTemplates[templateKey];
    if (!template) {
      console.log('⚠️ 模板不存在:', templateKey);
      return null;
    }
    
    console.log(`✅ 使用AI映射: ${templateKey} - ${template.description}`);
    
    // 从AI回答中提取实体
    const entities = this.extractEntities(aiResponse);
    
    return { templateKey, template, entities };
  }

  /**
   * 问题映射 - 将用户问题映射到标准模板
   */
  mapQuestionToTemplate(combinedText) {
    for (const [key, template] of Object.entries(this.questionTemplates)) {
      if (template.pattern.test(combinedText)) {
        console.log(`🎯 问题映射: ${key} - ${template.description}`);
        const entities = this.extractEntities(combinedText);
        return { templateKey: key, template, entities };
      }
    }
    return null;
  }

  /**
   * 从文本中提取实体
   */
  extractEntities(text) {
    const entities = {
      paintings: [],
      seals: [],
      authors: [],
      references: []
    };

    // 1. 提取画作名称 (《画作名》格式)
    const paintingMatches = text.matchAll(/《([^》]+)》/g);
    for (const match of paintingMatches) {
      entities.paintings.push(match[1]);
    }

    // 2. 提取ID格式的画作 (D000000)
    const idMatches = text.matchAll(/D\d{6}/g);
    for (const match of idMatches) {
      const node = this.baseGraph.nodes.find(n => n.id === match[0]);
      if (node && node.category === 'P') {
        entities.paintings.push(node.name);
      }
    }

    // 3. 提取印章名称
    const sealMatches = text.matchAll(/[「『""]([^」』""]+(?:印|章|济|老人))[」』""]/g);
    for (const match of sealMatches) {
      entities.seals.push(match[1]);
    }

    // 4. 提取作者名字
    const authorMatches = text.matchAll(/(石涛|唐寅|文徵明|沈周|董其昌)/g);
    for (const match of authorMatches) {
      entities.authors.push(match[1]);
    }

    // 5. 如果没有明确实体,从当前图获取上下文
    if (entities.paintings.length === 0 && entities.seals.length === 0) {
      const currentPaintings = this.currentGraph.nodes.filter(n => n.category === 'P' && n.id !== 0);
      if (currentPaintings.length > 0) {
        entities.paintings = currentPaintings.map(p => p.name);
      }
      const currentSeals = this.currentGraph.nodes.filter(n => n.category === 'S');
      if (currentSeals.length > 0) {
        entities.seals = currentSeals.map(s => s.name);
      }
    }

    console.log('🔎 提取实体:', entities);
    return entities;
  }

  // ========== 问题处理器 ==========

  /**
   * 查找相似印章 (S-S关系)
   */
  findSimilarSeals(entities) {
    const foundNodes = [];
    
    const currentSeals = this.currentGraph.nodes.filter(n => n.category === 'S');
    
    currentSeals.forEach(seal => {
      const similarSeals = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return link.info?.name === 'S-S' && (source === seal.id || target === seal.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const targetId = source === seal.id 
            ? (link.target?.id || link.target)
            : source;
          return this.baseGraph.nodes.find(n => n.id === targetId);
        })
        .filter(Boolean);
      
      foundNodes.push(...similarSeals);
    });

    console.log(`✅ 找到 ${foundNodes.length} 个相似印章`);
    return foundNodes;
  }

  /**
   * 查找使用指定印章的画作 (P-S关系)
   */
  findPaintingsBySeals(entities) {
    const foundNodes = [];
    
    const currentSeals = this.currentGraph.nodes.filter(n => n.category === 'S');
    
    currentSeals.forEach(seal => {
      const paintings = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return (link.info?.name === 'P-S' || link.info?.name === 'S-P') && 
                 (source === seal.id || target === seal.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const paintingId = source === seal.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === paintingId && n.category === 'P');
        })
        .filter(Boolean);
      
      foundNodes.push(...paintings);
    });

    console.log(`✅ 找到 ${foundNodes.length} 幅使用该印章的画作`);
    return foundNodes;
  }

  /**
   * 查找印章拥有者 (A-S关系)
   */
  findSealOwner(entities) {
    const foundNodes = [];
    
    const currentSeals = this.currentGraph.nodes.filter(n => n.category === 'S');
    
    currentSeals.forEach(seal => {
      const owners = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return link.info?.name === 'A-S' && (source === seal.id || target === seal.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const authorId = source === seal.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === authorId && n.category === 'A');
        })
        .filter(Boolean);
      
      foundNodes.push(...owners);
    });

    console.log(`✅ 找到 ${foundNodes.length} 位印章拥有者`);
    return foundNodes;
  }

  /**
   * 查找相似画作 (P-P关系)
   */
  findSimilarPaintings(entities) {
    const foundNodes = [];
    
    const currentPaintings = this.currentGraph.nodes.filter(n => n.category === 'P' && n.id !== 0);
    
    currentPaintings.forEach(painting => {
      const similarPaintings = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return link.info?.name === 'P-P' && (source === painting.id || target === painting.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const targetId = source === painting.id 
            ? (link.target?.id || link.target)
            : source;
          return this.baseGraph.nodes.find(n => n.id === targetId);
        })
        .filter(Boolean);
      
      foundNodes.push(...similarPaintings);
    });

    console.log(`✅ 找到 ${foundNodes.length} 幅相似画作`);
    return foundNodes;
  }

  /**
   * 查找画作的印章
   */
  findSealsByPainting(entities) {
    const foundNodes = [];
    
    const currentPaintings = this.currentGraph.nodes.filter(n => n.category === 'P' && n.id !== 0);
    
    currentPaintings.forEach(painting => {
      const seals = this.getSealsForPainting(painting.id);
      foundNodes.push(...seals);
    });

    console.log(`✅ 找到 ${foundNodes.length} 个印章`);
    return foundNodes;
  }

  /**
   * 查找画作的作者
   */
  findPaintingAuthor(entities) {
    const foundNodes = [];
    
    const currentPaintings = this.currentGraph.nodes.filter(n => n.category === 'P' && n.id !== 0);
    
    currentPaintings.forEach(painting => {
      const authors = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return link.info?.name === 'A-P' && (source === painting.id || target === painting.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const authorId = source === painting.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === authorId && n.category === 'A');
        })
        .filter(Boolean);
      
      foundNodes.push(...authors);
    });

    console.log(`✅ 找到 ${foundNodes.length} 位作者`);
    return foundNodes;
  }

  /**
   * 查找画作的文献 (P-R关系)
   */
  findPaintingReferences(entities) {
    const foundNodes = [];
    
    const currentPaintings = this.currentGraph.nodes.filter(n => n.category === 'P' && n.id !== 0);
    
    currentPaintings.forEach(painting => {
      const refs = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return (link.info?.name === 'P-R' || link.info?.name === 'R-P') && 
                 (source === painting.id || target === painting.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const refId = source === painting.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === refId && n.category === 'R');
        })
        .filter(Boolean);
      
      foundNodes.push(...refs);
    });

    console.log(`✅ 找到 ${foundNodes.length} 个文献`);
    return foundNodes;
  }

  /**
   * 查找作者的画作
   */
  findPaintingsByAuthor(entities) {
    const foundNodes = [];
    
    const currentAuthors = this.currentGraph.nodes.filter(n => n.category === 'A');
    
    currentAuthors.forEach(author => {
      const paintings = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return link.info?.name === 'A-P' && (source === author.id || target === author.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const paintingId = source === author.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === paintingId && n.category === 'P');
        })
        .filter(Boolean);
      
      foundNodes.push(...paintings);
    });

    console.log(`✅ 找到 ${foundNodes.length} 幅画作`);
    return foundNodes;
  }

  /**
   * 查找作者的印章
   */
  findSealsByAuthor(entities) {
    const foundNodes = [];
    
    const currentAuthors = this.currentGraph.nodes.filter(n => n.category === 'A');
    
    currentAuthors.forEach(author => {
      const seals = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return link.info?.name === 'A-S' && (source === author.id || target === author.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const sealId = source === author.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === sealId && n.category === 'S');
        })
        .filter(Boolean);
      
      foundNodes.push(...seals);
    });

    console.log(`✅ 找到 ${foundNodes.length} 个印章`);
    return foundNodes;
  }

  /**
   * 查找文献提到的画作
   */
  findPaintingsByReference(entities) {
    const foundNodes = [];
    
    const currentRefs = this.currentGraph.nodes.filter(n => n.category === 'R');
    
    currentRefs.forEach(ref => {
      const paintings = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return (link.info?.name === 'P-R' || link.info?.name === 'R-P') && 
                 (source === ref.id || target === ref.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const paintingId = source === ref.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === paintingId && n.category === 'P');
        })
        .filter(Boolean);
      
      foundNodes.push(...paintings);
    });

    console.log(`✅ 找到 ${foundNodes.length} 幅画作`);
    return foundNodes;
  }

  /**
   * 查找文献提到的作者
   */
  findAuthorsByReference(entities) {
    const foundNodes = [];
    
    const currentRefs = this.currentGraph.nodes.filter(n => n.category === 'R');
    
    currentRefs.forEach(ref => {
      const authors = this.baseGraph.links
        .filter(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          return link.info?.name === 'A-R' && (source === ref.id || target === ref.id);
        })
        .map(link => {
          const source = link.source?.id || link.source;
          const target = link.target?.id || link.target;
          const authorId = source === ref.id ? target : source;
          return this.baseGraph.nodes.find(n => n.id === authorId && n.category === 'A');
        })
        .filter(Boolean);
      
      foundNodes.push(...authors);
    });

    console.log(`✅ 找到 ${foundNodes.length} 位作者`);
    return foundNodes;
  }

  // ========== 辅助方法 ==========

  /**
   * 获取画作的所有印章
   */
  getSealsForPainting(paintingId) {
    return this.baseGraph.links
      .filter(link => {
        const source = link.source?.id || link.source;
        const target = link.target?.id || link.target;
        return (link.info?.name === 'P-S' || link.info?.name === 'S-P') && 
               (source === paintingId || target === paintingId);
      })
      .map(link => {
        const source = link.source?.id || link.source;
        const target = link.target?.id || link.target;
        const sealId = source === paintingId ? target : source;
        return this.baseGraph.nodes.find(n => n.id === sealId && n.category === 'S');
      })
      .filter(Boolean);
  }



  /**
   * 添加节点到当前图中
   * @param {Array} newNodes - 要添加的新节点
   * @returns {Object} 更新后的当前图（新对象）
   */
  addNodesToGraph(newNodes) {
    // 去重: 只添加当前图中不存在的节点
    const existingIds = this.currentGraph.nodes.map(n => n.id);
    const nodesToAdd = newNodes.filter(n => !existingIds.includes(n.id));

    if (nodesToAdd.length === 0) {
      console.log('ℹ️ 没有新节点需要添加');
      // 即使没有新节点，也返回新对象以触发更新
      return {
        nodes: [...this.currentGraph.nodes],
        links: [...this.currentGraph.links]
      };
    }

    // 添加节点
    this.currentGraph.nodes.push(...nodesToAdd);

    // 添加相关的边
    const allNodeIds = this.currentGraph.nodes.map(n => n.id);
    const newLinks = this.baseGraph.links.filter(link => {
      const sourceInGraph = allNodeIds.includes(link.source) || 
                           allNodeIds.includes(link.source?.id);
      const targetInGraph = allNodeIds.includes(link.target) || 
                           allNodeIds.includes(link.target?.id);
      
      // 检查是否已存在
      const alreadyExists = this.currentGraph.links.some(l => {
        const lSource = l.source?.id || l.source;
        const lTarget = l.target?.id || l.target;
        const linkSource = link.source?.id || link.source;
        const linkTarget = link.target?.id || link.target;
        return (lSource === linkSource && lTarget === linkTarget) ||
               (lSource === linkTarget && lTarget === linkSource);
      });

      return sourceInGraph && targetInGraph && !alreadyExists;
    });

    this.currentGraph.links.push(...newLinks);

    console.log('✅ 图已更新, 新增节点:', nodesToAdd.length, '新增边:', newLinks.length);
    
    // 返回新对象，确保React检测到变化
    return {
      nodes: [...this.currentGraph.nodes],
      links: [...this.currentGraph.links]
    };
  }

  /**
   * 添加到查询历史
   * @param {string} question - 用户提问
   * @param {string} answer - AI回答
   * @param {Array} addedNodes - 本次添加的节点
   * @param {string} templateDesc - 问题模板描述
   */
  addToHistory(question, answer, addedNodes, templateDesc = '', fullAnswer = '', templateId = '') {
    const historyItem = {
      id: Date.now(),
      question,
      answer,
      fullAnswer: fullAnswer || answer,  // LLM生成的完整答案
      templateDesc,
      templateId: templateId || templateDesc,  // 模板ID
      addedNodes: addedNodes.map(n => ({ 
        id: n.id, 
        name: n.name, 
        category: n.category,
        isDuplicate: n.isDuplicate || false,  // 是否为重复节点
        isPageAdded: n.isPageAdded || false,  // 是否为翻页增加
        edgeId: n.edgeId,  // 边ID
        pageIndex: n.pageIndex,  // 页码索引
        fromNodeId: n.fromNodeId,  // 源节点ID
        toNodeId: n.toNodeId  // 目标节点ID
      })),
      timestamp: new Date().toISOString()
    };

    this.queryHistory.unshift(historyItem);

    if (this.queryHistory.length > 5) {
      this.queryHistory = this.queryHistory.slice(0, 5);
    }

    console.log('📝 历史记录已更新, 共', this.queryHistory.length, '条');
    return this.queryHistory;
  }

  /**
   * 获取查询历史
   */
  getHistory() {
    return this.queryHistory;
  }

  /**
   * 删除指定节点
   * @param {string} nodeId - 要删除的节点ID
   * @returns {Object} 更新后的当前图（新对象）
   */
  removeNode(nodeId) {
    // 从当前图中移除节点
    this.currentGraph.nodes = this.currentGraph.nodes.filter(n => n.id !== nodeId);
    
    // 移除相关的边
    this.currentGraph.links = this.currentGraph.links.filter(l => {
      const source = l.source?.id || l.source;
      const target = l.target?.id || l.target;
      return source !== nodeId && target !== nodeId;
    });

    // 从历史记录中移除
    this.queryHistory.forEach(item => {
      item.addedNodes = item.addedNodes.filter(n => n.id !== nodeId);
    });

    console.log('🗑️ 已删除节点:', nodeId);
    
    // 返回新对象，确保React检测到变化
    return {
      nodes: [...this.currentGraph.nodes],
      links: [...this.currentGraph.links]
    };
  }

  /**
   * 从历史记录中删除指定节点的翻页记录
   * @param {string} nodeId - 节点ID
   * @param {number} pageIndex - 页码索引
   */
  removeNodeFromHistory(nodeId, pageIndex) {
    this.queryHistory.forEach(item => {
      item.addedNodes = item.addedNodes.filter(n => {
        // 删除匹配的翻页记录
        if (n.id === nodeId && n.isPageAdded && n.pageIndex === pageIndex) {
          return false;
        }
        return true;
      });
    });
    
    console.log(`🗑️ 从历史记录中删除节点 ${nodeId} 的第 ${pageIndex + 1} 页`);
  }

  /**
   * 撤销最后一次添加
   * @returns {Object} 更新后的当前图（新对象）
   */
  undoLastAddition() {
    if (this.queryHistory.length === 0) {
      console.log('ℹ️ 没有可撤销的操作');
      return {
        nodes: [...this.currentGraph.nodes],
        links: [...this.currentGraph.links]
      };
    }

    const lastQuery = this.queryHistory.shift(); // 移除最新的一条
    
    // 删除该次添加的所有节点
    lastQuery.addedNodes.forEach(node => {
      // 直接操作，不调用removeNode避免重复返回
      this.currentGraph.nodes = this.currentGraph.nodes.filter(n => n.id !== node.id);
      this.currentGraph.links = this.currentGraph.links.filter(l => {
        const source = l.source?.id || l.source;
        const target = l.target?.id || l.target;
        return source !== node.id && target !== node.id;
      });
    });

    console.log('↩️ 已撤销最后一次添加, 删除了', lastQuery.addedNodes.length, '个节点');
    
    // 返回新对象，确保React检测到变化
    return {
      nodes: [...this.currentGraph.nodes],
      links: [...this.currentGraph.links]
    };
  }

  /**
   * 获取当前图
   */
  getCurrentGraph() {
    return this.currentGraph;
  }

  /**
   * 获取总图
   */
  getBaseGraph() {
    return this.baseGraph;
  }
}

// 导出单例
const graphManager = new GraphDataManager();
export default graphManager;
