/**
 * StorylineDataManager - 新的Storyline数据管理器
 * 
 * 节点类型:
 * - P: Painting (画作)
 * - A: Author (作者-石涛)
 * - S: Seal (印章)
 * - SS: Standard Seal (印章标准件)
 * - R: Reference (参考文献)
 * 
 * 关系类型:
 * - ownership: 归属关系 (P→A, SS→A, S→P)
 * - similarity: 相似关系 (P↔P, S↔SS)
 * - reference: 参考关系 (P→R)
 */

import allSealsInfo from '../../assets/data/all_seals_info.json';
import authorInfo from '../../assets/data/author.json';
import paintingReferences from '../../assets/data/painting_references.json';
import paintingToSeals from '../../assets/data/painting_to_seals.json';
import paintingsCompleteInfo from '../../assets/data/paintings_complete_info.json';
import sealMapping from '../../assets/data/seal_mapping.json';
import segmentSimilarity from '../../assets/data/segment_similarity_with_paths.json';
import standardSealsInfo from '../../assets/data/standard_seals_info.json';

class StorylineDataManager {
  constructor() {
    if (StorylineDataManager.instance) {
      return StorylineDataManager.instance;
    }
    
    // 存储所有节点 { nodeId: nodeData }
    this.nodes = new Map();
    
    // 存储所有边 { edgeId: edgeData }
    this.edges = new Map();
    
    // 节点ID到类型的映射
    this.nodeTypes = new Map();
    
    // 初始化石涛节点
    this.initializeAuthorNode();
    
    StorylineDataManager.instance = this;
  }

  /**
   * 初始化石涛节点
   */
  initializeAuthorNode() {
    const authorNode = {
      id: 'AUTHOR_SHITAO',
      type: 'A',
      label: '石涛',
      data: authorInfo,
      displayName: '石涛',
      category: 'A',
      name: authorInfo.name || '石涛',
      // 添加 Storyline 显示所需的字段
      url: `/assets/data/${authorInfo.url}` || '/assets/img/person/石涛.png',
      名字拼音: authorInfo.名字拼音 || 'Shi Tao',
      字号: authorInfo.字号 || '大涤子、清湘老人',
      所属朝代: authorInfo.所属朝代 || '清代',
      生卒年代: authorInfo.生卒年代 || '1642-1707',
      籍贯: authorInfo.籍贯 || '广西全州人'
    };
    
    this.nodes.set(authorNode.id, authorNode);
    this.nodeTypes.set(authorNode.id, 'A');
  }

  /**
   * 添加画作节点
   * @param {string} paintingId - 画作编号 (如 D001430_0)
   * @param {string} paintingName - 画作名称 (可选)
   * @returns {Object} 添加的节点信息
   */
  addPaintingNode(paintingId, paintingName = null) {
    // 检查节点是否已存在
    if (this.nodes.has(paintingId)) {
      return { node: this.nodes.get(paintingId), isNew: false };
    }

    // 查找画作信息 - 直接用paintingId查找(现在已移除所有子图)
    const paintingInfo = paintingsCompleteInfo.find(p => p.painting_code === paintingId || p.编号 === paintingId);
    
    if (!paintingInfo) {
      console.warn(`⚠️ 找不到画作信息: ${paintingId}, 使用默认数据`);
      // 即使找不到信息也创建节点，使用基本信息
      const defaultNode = {
        id: paintingId,
        type: 'P',
        label: paintingName || paintingId,
        data: {},
        displayName: paintingName || paintingId,
        category: 'P',
        name: paintingName || paintingId,
        url: `/assets/data/Paintings_merged/${paintingId}.jpg`,
        作者: '石涛',
        创作时间: '未知',
        用色: '未知',
        尺寸: '未知'
      };
      
      this.nodes.set(paintingId, defaultNode);
      this.nodeTypes.set(paintingId, 'P');
      this.addOwnershipEdge(paintingId, 'AUTHOR_SHITAO');
      
      return { node: defaultNode, isNew: true };
    }

    // 创建画作节点 - 添加 Storyline 显示所需的字段
    const displayName = paintingInfo.总作品名 || paintingInfo.作品名 || paintingInfo.painting_name || paintingName || paintingId;
    
    // 图片路径：使用数据文件中的图像url字段(已统一为总图url)
    const imageUrl = paintingInfo.图像url ? `/assets/data/${paintingInfo.图像url}` : `/assets/data/Paintings_merged/${paintingId}.jpg`;
    
    const paintingNode = {
      id: paintingId,
      type: 'P',
      label: displayName,
      data: paintingInfo,
      displayName: displayName,
      category: 'P',
      name: displayName,  // 节点下方显示的名称
      // 添加 Storyline 显示所需的字段
      url: imageUrl,  // 图片URL
      作者: paintingInfo.作者名 || paintingInfo.author || '石涛',
      创作时间: paintingInfo.创作时间 || paintingInfo.creation_time || '未知',
      用色: paintingInfo.用色 || paintingInfo.color || '未知',
      尺寸: paintingInfo.尺寸 || paintingInfo.size || '未知'
    };

    this.nodes.set(paintingId, paintingNode);
    this.nodeTypes.set(paintingId, 'P');

    // 自动建立与石涛的归属关系
    this.addOwnershipEdge(paintingId, 'AUTHOR_SHITAO');

    return { node: paintingNode, isNew: true };
  }

  /**
   * 添加印章节点
   * @param {string} sealCode - 印章编号
   * @param {string} paintingId - 所属画作ID
   * @returns {Object} 添加的节点信息
   */
  addSealNode(sealCode, paintingId) {
    // 检查节点是否已存在
    if (this.nodes.has(sealCode)) {
      // 如果已存在,只需要添加与新画作的关系
      if (paintingId && this.nodes.has(paintingId)) {
        this.addOwnershipEdge(sealCode, paintingId);
      }
      return { node: this.nodes.get(sealCode), isNew: false };
    }

    // 查找印章信息
    const sealInfo = allSealsInfo.find(s => s.seal_code === sealCode);
    if (!sealInfo) {
      console.error(`找不到印章信息: ${sealCode}`);
      return null;
    }

    // 创建印章节点
    const sealNode = {
      id: sealCode,
      type: 'S',
      label: `印章${sealCode}`,  // 修改为"印章+编号"格式
      data: {
        ...sealInfo,
        sealImage: sealInfo.seal_image,
        owner: sealInfo.owner || '石涛',
        sealName: sealInfo.name  // 保留原始名称在 data 中
      },
      displayName: `印章${sealCode}`,  // 基础显示名称（会在 QuestionProcessor 中被覆盖为"印章{编号}({画名})"）
      category: 'seal',  // 修改为 'seal' 以便于筛选
      name: `印章${sealCode}`  // 修改：使用简单的编号格式，不使用 all_seals_info 中的 name
    };

    this.nodes.set(sealCode, sealNode);
    this.nodeTypes.set(sealCode, 'S');

    // 建立与画作的归属关系
    if (paintingId && this.nodes.has(paintingId)) {
      this.addOwnershipEdge(sealCode, paintingId);
    }

    return { node: sealNode, isNew: true };
  }

  /**
   * 添加印章标准件节点
   * @param {string} standardSealId - 印章标准件编号
   * @returns {Object} 添加的节点信息
   */
  addStandardSealNode(standardSealId) {
    // 检查节点是否已存在
    if (this.nodes.has(standardSealId)) {
      return { node: this.nodes.get(standardSealId), isNew: false };
    }

    // 查找印章标准件信息
    const standardSealInfo = standardSealsInfo.find(s => s.seal_code === standardSealId);
    if (!standardSealInfo) {
      console.error(`找不到印章标准件信息: ${standardSealId}`);
      return null;
    }

    // 创建印章标准件节点
    const standardSealNode = {
      id: standardSealId,
      type: 'SS',
      label: standardSealInfo.name || standardSealId,  // 修正：使用 name 字段
      url: `../../assets/data/${standardSealInfo.standard_image}`,  // 添加图片URL
      data: {
        ...standardSealInfo,
        standardSealImage: standardSealInfo.standard_image  // 添加图片路径
      },
      displayName: standardSealInfo.name || standardSealId,  // 修正：使用 name 字段
      category: 'SS',
      name: standardSealInfo.name || standardSealId,  // 修正：使用 name 字段
      拥有者: standardSealInfo.owner || '石涛'  // 添加拥有者字段
    };

    this.nodes.set(standardSealId, standardSealNode);
    this.nodeTypes.set(standardSealId, 'SS');

    // 建立与石涛的归属关系
    this.addOwnershipEdge(standardSealId, 'AUTHOR_SHITAO');

    return { node: standardSealNode, isNew: true };
  }

  /**
   * 添加参考文献节点
   * @param {string} referenceId - 参考文献编号
   * @param {Object} referenceData - 参考文献数据
   * @returns {Object} 添加的节点信息
   */
  addReferenceNode(referenceId, referenceData) {
    // 检查节点是否已存在
    if (this.nodes.has(referenceId)) {
      return { node: this.nodes.get(referenceId), isNew: false };
    }

    // 创建参考文献节点
    const referenceNode = {
      id: referenceId,
      type: 'R',
      label: referenceData.name || referenceId,
      data: {
        ...referenceData,
        reference_id: referenceId,
        text_record: referenceData.text_record,
        info: referenceData.info
      },
      displayName: referenceData.name || referenceId,
      clickable: true, // 参考文献节点可点击查看详情
      category: 'R',
      name: referenceData.name || referenceId,
      text_record: referenceData.text_record,
      reference_info: referenceData.info
    };

    this.nodes.set(referenceId, referenceNode);
    this.nodeTypes.set(referenceId, 'R');

    return { node: referenceNode, isNew: true };
  }

  /**
   * 添加归属关系边
   * @param {string} fromId - 源节点ID (子节点)
   * @param {string} toId - 目标节点ID (父节点)
   * @param {Object} edgeData - 边的额外数据
   */
  addOwnershipEdge(fromId, toId, edgeData = {}) {
    const edgeId = `ownership_${fromId}_${toId}`;
    
    // 检查边是否已存在
    if (this.edges.has(edgeId)) {
      return { edge: this.edges.get(edgeId), isNew: false };
    }

    // 根据节点类型确定 info.name
    const fromType = this.nodeTypes.get(fromId);
    const toType = this.nodeTypes.get(toId);
    let relationName = 'ownership';
    
    if (fromType === 'P' && toType === 'A') {
      relationName = 'P-A';
    } else if (fromType === 'S' && toType === 'P') {
      relationName = 'P-S';  // 注意：方向是 S -> P，但显示为 P-S
    } else if (fromType === 'S' && toType === 'A') {
      relationName = 'A-S';
    } else if (fromType === 'SS' && toType === 'A') {
      relationName = 'SS-A';
    }

    const edge = {
      id: edgeId,
      type: 'ownership',
      source: fromId,
      target: toId,
      label: '归属',
      info: { 
        name: relationName,
        ...edgeData
      }
    };

    this.edges.set(edgeId, edge);
    return { edge, isNew: true };
  }

  /**
   * 添加参考关系边 (P-R)
   * @param {string} paintingId - 画作ID
   * @param {string} referenceId - 参考文献ID  
   * @param {Object} referenceData - 参考文献数据
   */
  addReferenceEdge(paintingId, referenceId, referenceData = {}) {
    const edgeId = `reference_${paintingId}_${referenceId}`;
    
    // 检查边是否已存在
    if (this.edges.has(edgeId)) {
      return { edge: this.edges.get(edgeId), isNew: false };
    }

    // 明确创建边对象,不包含任何额外字段
    const edge = {
      id: edgeId,
      type: 'reference',
      source: paintingId,
      target: referenceId,
      label: '参考'
    };
    
    // 单独设置info对象,确保name字段是P-R
    const reference = {};
    reference[referenceData.info] = referenceData.text_record;
    
    edge.info = {
      name: 'P-R',
      reference: reference
    };
    
    this.edges.set(edgeId, edge);
    
    // 返回深拷贝,避免外部修改影响Map中的对象
    return { 
      edge: JSON.parse(JSON.stringify(edge)), 
      isNew: true 
    };
  }

  /**
   * 添加相似关系边（支持多重相似关系）
   * @param {string} fromId - 源节点ID
   * @param {string} toId - 目标节点ID
   * @param {Object} similarityData - 相似度数据
   */
  addSimilarityEdge(fromId, toId, similarityData = {}) {
    // 根据节点类型确定 info.name 和可视化参数
    const fromType = this.nodeTypes.get(fromId);
    const toType = this.nodeTypes.get(toId);
    let relationName = 'similarity';
    let url1 = '', url2 = '';
    let angle = similarityData.similarity || 0;
    
    // 使用基础边ID（不包含切片路径），同一对节点间只有一条边
    const baseEdgeId = `similarity_${fromId}_${toId}`;
    
    if (fromType === 'P' && toType === 'P') {
      relationName = 'P-P';
      // 切片图片路径
      url1 = similarityData.segmentPath ? `/assets/data/${similarityData.segmentPath}` : '';
      url2 = similarityData.similarSegmentPath ? `/assets/data/${similarityData.similarSegmentPath}` : '';
    } else if ((fromType === 'S' && toType === 'S')) {
      relationName = 'S-S';
      // 印章图片路径 - 处理路径前缀
      // 如果已经是完整路径（/assets/data/ 或 ../../assets/data/），直接使用
      // 否则添加 ../../assets/data/ 前缀
      url1 = similarityData.sealImage 
        ? (similarityData.sealImage.startsWith('/assets/data/')
           ? `../..${similarityData.sealImage}`  // /assets/data/xxx -> ../../assets/data/xxx
           : similarityData.sealImage.startsWith('../../assets/data/')
             ? similarityData.sealImage 
             : `../../assets/data/${similarityData.sealImage}`)
        : '';
      url2 = similarityData.sealImage2 
        ? (similarityData.sealImage2.startsWith('/assets/data/')
           ? `../..${similarityData.sealImage2}`  // /assets/data/xxx -> ../../assets/data/xxx
           : similarityData.sealImage2.startsWith('../../assets/data/')
             ? similarityData.sealImage2 
             : `../../assets/data/${similarityData.sealImage2}`)
        : '';
    } else if ((fromType === 'S' && toType === 'SS') || (fromType === 'SS' && toType === 'S')) {
      relationName = 'S-SS';
      // 印章与标准印的图片 - 处理路径前缀
      url1 = similarityData.sealImage 
        ? (similarityData.sealImage.startsWith('/assets/data/')
           ? `../..${similarityData.sealImage}`  // /assets/data/xxx -> ../../assets/data/xxx
           : similarityData.sealImage.startsWith('../../assets/data/')
             ? similarityData.sealImage 
             : `../../assets/data/${similarityData.sealImage}`)
        : '';
      url2 = similarityData.standardSealImage 
        ? (similarityData.standardSealImage.startsWith('/assets/data/')
           ? `../..${similarityData.standardSealImage}`
           : similarityData.standardSealImage.startsWith('../../assets/data/')
             ? similarityData.standardSealImage 
             : `../../assets/data/${similarityData.standardSealImage}`)
        : '';
    }
    
    // 创建单个相似关系数据
    const similarityItem = {
      similarity: angle,
      url1: url1,
      url2: url2,
      ...similarityData
    };
    
    // 检查边是否已存在
    if (this.edges.has(baseEdgeId)) {
      // 边已存在，将新的相似关系添加到关系列表中
      const existingEdge = this.edges.get(baseEdgeId);
      
      // 确保 similarities 数组存在
      if (!existingEdge.similarities) {
        // 如果是旧数据，将原有的 info 转换为第一个相似关系
        existingEdge.similarities = [{
          similarity: existingEdge.info.similarity,
          url1: existingEdge.info.url1,
          url2: existingEdge.info.url2,
          segmentPath: existingEdge.info.segmentPath,
          similarSegmentPath: existingEdge.info.similarSegmentPath
        }];
      }
      
      // 检查是否已存在相同的相似关系（通过关键字段判断）
      const isDuplicate = existingEdge.similarities.some(existing => {
        // 对于画作-画作关系，比较切片路径
        if (relationName === 'P-P') {
          return existing.segmentPath === similarityItem.segmentPath &&
                 existing.similarSegmentPath === similarityItem.similarSegmentPath;
        }
        // 对于印章关系，比较图片路径
        else if (relationName === 'S-S' || relationName === 'S-SS') {
          return existing.url1 === similarityItem.url1 &&
                 existing.url2 === similarityItem.url2;
        }
        // 其他情况，比较相似度和url（通用判断）
        return existing.similarity === similarityItem.similarity &&
               existing.url1 === similarityItem.url1 &&
               existing.url2 === similarityItem.url2;
      });
      
      // 如果是重复的相似关系，不添加，直接返回
      if (isDuplicate) {
        console.log(`⚠️ 相似边 ${baseEdgeId} 已存在相同的相似关系，跳过添加`);
        return { 
          edge: existingEdge, 
          isNew: false, 
          isPageAdded: false,  // 不是新增页，而是重复
          isDuplicate: true,  // 标识为重复
          fromNodeId: fromId,
          toNodeId: toId
        };
      }
      
      // 添加新的相似关系
      existingEdge.similarities.push(similarityItem);
      
      // 更新边的标签显示第一个相似度和总数
      const firstSimilarity = existingEdge.similarities[0].similarity;
      const count = existingEdge.similarities.length;
      existingEdge.label = `相似度: ${(firstSimilarity * 100).toFixed(1)}% (${count}组)`;
      
      // 更新 info，保持第一组相似关系的信息（用于渲染），同时包含所有相似关系
      existingEdge.info = {
        id: baseEdgeId,  // 添加边ID用于页码状态管理
        name: relationName,
        similarity: firstSimilarity,
        angle: firstSimilarity,
        url1: existingEdge.similarities[0].url1,
        url2: existingEdge.similarities[0].url2,
        similarities: existingEdge.similarities,  // 包含所有相似关系
        ...existingEdge.similarities[0]
      };
      
      console.log(`📎 合并相似边 ${baseEdgeId}，现有 ${count} 组相似关系`);
      return { 
        edge: existingEdge, 
        isNew: false, 
        isPageAdded: true,  // 标识为翻页增加
        pageIndex: count - 1,  // 新增页的索引
        fromNodeId: fromId,  // 源节点ID
        toNodeId: toId  // 目标节点ID
      };
    }

    // 创建新边，使用 similarities 数组存储所有相似关系
    const edge = {
      id: baseEdgeId,
      type: 'similarity',
      source: fromId,
      target: toId,
      label: `相似度: ${(angle * 100).toFixed(1)}%`,
      data: similarityData,
      similarities: [similarityItem],  // 相似关系数组
      info: { 
        id: baseEdgeId,  // 添加边ID用于页码状态管理
        name: relationName,
        similarity: angle,
        angle: angle,  // 用于扇形绘制
        url1: url1,
        url2: url2,
        similarities: [similarityItem],  // 包含所有相似关系
        ...similarityData
      }
    };

    this.edges.set(baseEdgeId, edge);
    return { edge, isNew: true };
  }

  /**
   * 添加参考关系边
   * @param {string} paintingId - 画作ID
   * @param {string} referenceId - 参考文献ID
   * @param {Object} referenceData - 参考数据
   */
  addReferenceEdge(paintingId, referenceId, referenceData = {}) {
    const edgeId = `reference_${paintingId}_${referenceId}`;
    
    // 检查边是否已存在
    if (this.edges.has(edgeId)) {
      return { edge: this.edges.get(edgeId), isNew: false };
    }

    // 根据节点类型确定 info.name
    const fromType = this.nodeTypes.get(paintingId);
    const toType = this.nodeTypes.get(referenceId);
    let relationName = 'P-R';  // 默认是画作-参考文献
    
    if (fromType === 'A' && toType === 'R') {
      relationName = 'A-R';
    }

    const edge = {
      id: edgeId,
      type: 'reference',
      source: paintingId,
      target: referenceId,
      label: '参考',
      data: referenceData,
      info: { 
        name: relationName,
        reference: referenceData.referenceText ? {
          [referenceData.page || '未知页码']: referenceData.referenceText
        } : (referenceData.info && referenceData.text_record) ? {
          [referenceData.info]: referenceData.text_record
        } : {},
        url: referenceData.url || 'https://www.baidu.com'
      }
    };

    this.edges.set(edgeId, edge);
    return { edge, isNew: true };
  }

  /**
   * 根据切片找相似画作
   * @param {string} sourceImageId - 源画作ID
   * @param {string} segmentPath - 切片路径
   * @param {number} minSimilarity - 最小相似度阈值 (0.8-1.0)
   * @param {number} maxSimilarity - 最大相似度阈值 (默认1.0)
   * @returns {Array} 相似画作列表
   */
  findSimilarPaintingsBySegment(sourceImageId, segmentPath, minSimilarity = 0.8, maxSimilarity = 1.0) {
    const results = [];
    
    // 在segment_similarity_with_paths中查找
    const similarities = segmentSimilarity[sourceImageId];
    if (!similarities || !similarities[segmentPath]) {
      console.log(`未找到切片相似度数据: ${sourceImageId} / ${segmentPath}`);
      return results;
    }
    
    const segmentSimilarities = similarities[segmentPath];
    
    // 遍历所有相似项
    for (const [targetPaintingId, targetSegments] of Object.entries(segmentSimilarities)) {
      for (const [targetSegmentPath, similarity] of Object.entries(targetSegments)) {
        if (similarity >= minSimilarity && similarity <= maxSimilarity) {
          results.push({
            paintingId: targetPaintingId,
            segmentPath: targetSegmentPath,
            similarity: similarity,
            sourceSegmentPath: segmentPath
          });
        }
      }
    }
    
    // 按相似度降序排序
    results.sort((a, b) => b.similarity - a.similarity);
    
    console.log(`找到${results.length}个相似切片,相似度范围[${minSimilarity}, ${maxSimilarity}]`);
    return results;
  }

  /**
   * 根据印章找相似标准印章
   * @param {string} sealCode - 印章编号
   * @param {number} minSimilarity - 最小相似度阈值
   * @returns {Array} 相似标准印章列表
   */
  findSimilarStandardSeals(sealCode, minSimilarity = 0.7) {
    const results = [];
    
    // 在seal_mapping中查找
    const mapping = sealMapping.find(m => m.seal_code === sealCode);
    if (!mapping) {
      console.log(`未找到印章映射数据: ${sealCode}`);
      return results;
    }
    
    // 检查是否有标准参考件（不再检查相似度阈值，只要has_reference为true就添加）
    if (!mapping.has_reference || !mapping.standard_image) {
      console.log(`印章 ${sealCode} 没有标准参考件`);
      return results;
    }
    
    // 通过 standard_image 在 standardSealsInfo 中查找标准印章信息
    const standardSealInfo = standardSealsInfo.find(s => s.standard_image === mapping.standard_image);
    
    if (!standardSealInfo) {
      console.log(`未找到标准印章信息: ${mapping.standard_image}`);
      return results;
    }
    
    // 返回标准印章信息（使用标准印章的seal_code作为ID）
    results.push({
      standardSealId: standardSealInfo.seal_code,  // 使用标准印章的seal_code
      standardSealName: standardSealInfo.name,      // 标准印章名称
      similarity: mapping.similarity || 0,          // 相似度（仅用于显示）
      sealImage: mapping.seal_image,
      standardSealImage: standardSealInfo.standard_image,
      standardSealData: standardSealInfo            // 完整的标准印章数据
    });
    
    console.log(`印章 ${sealCode} 找到标准件: ${standardSealInfo.seal_code} - ${standardSealInfo.name}`);
    
    return results;
  }

  /**
   * 获取画作的所有印章
   * @param {string} paintingId - 画作ID (如 D001430_0)
   * @returns {Array} 印章列表
   */
  getPaintingSeals(paintingId) {
    // 提取基础ID (D001430_0 -> D001430)
    const baseId = paintingId.split('_')[0].split('-')[0];
    
    // 从 allSealsInfo 中筛选属于这个画作的印章
    const seals = allSealsInfo.filter(seal => {
      const sealBaseId = seal.painting_id ? seal.painting_id.split('_')[0].split('-')[0] : '';
      return sealBaseId === baseId;
    });
    
    console.log(`🔖 画作 ${paintingId} (基础ID: ${baseId}) 的印章:`, seals);
    
    return seals;
  }

  /**
   * 获取画作的参考文献
   * @param {string} paintingId - 画作ID
   * @returns {Array} 参考文献列表
   */
  getPaintingReferences(paintingId) {
    const baseId = paintingId.split('_')[0];
    
    // painting_references.json 的格式是 { "D002388": [...], "D001430": [...] }
    const references = paintingReferences[baseId] || [];
    console.log(`📚 获取画作 ${baseId} 的参考文献，共 ${references.length} 条`);
    return references;
  }

  /**
   * 获取画作的完整信息
   * @param {string} paintingId - 画作ID
   * @returns {Object|null} 画作信息
   */
  getPaintingInfo(paintingId) {
    const baseId = paintingId.split('_')[0];
    
    const paintingInfo = paintingsCompleteInfo.find(p => p.编号 === baseId || p.painting_code === baseId);
    return paintingInfo || null;
  }

  /**
   * 获取所有标准印章
   * @returns {Array} 标准印章列表
   */
  getAllStandardSeals() {
    console.log(`🔖 获取所有标准印章，共 ${standardSealsInfo.length} 个`);
    return standardSealsInfo;
  }

  /**
   * 获取所有画作信息
   * @returns {Array} 所有画作的数组
   */
  getAllPaintings() {
    console.log(`🖼️ 获取所有石涛画作，共 ${paintingsCompleteInfo.length} 个`);
    return paintingsCompleteInfo;
  }

  /**
   * 删除节点
   * @param {string} nodeId - 节点ID
   */
  removeNode(nodeId) {
    // 不允许删除石涛节点
    if (nodeId === 'AUTHOR_SHITAO') {
      throw new Error('不能删除石涛节点');
    }

    // 删除所有相关的边
    // 注意：edge.source 和 edge.target 可能是字符串ID，也可能是对象引用（D3处理后）
    const edgesToDelete = [];
    for (const [edgeId, edge] of this.edges.entries()) {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source?.id;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target?.id;
      
      if (sourceId === nodeId || targetId === nodeId) {
        edgesToDelete.push(edgeId);
      }
    }
    
    // 删除收集到的边
    edgesToDelete.forEach(edgeId => this.edges.delete(edgeId));

    // 删除节点
    this.nodes.delete(nodeId);
    this.nodeTypes.delete(nodeId);
    
    console.log(`🗑️ 删除节点 ${nodeId}，同时删除了 ${edgesToDelete.length} 条相关边`);
  }

  /**
   * 删除边
   * @param {string} edgeId - 边ID
   */
  removeEdge(edgeId) {
    this.edges.delete(edgeId);
  }

  /**
   * 删除边的某一页相似关系（用于历史记录的精确删除）
   * @param {string} fromNodeId - 源节点ID
   * @param {string} toNodeId - 目标节点ID  
   * @param {number} pageIndex - 要删除的页码索引
   * @returns {boolean} 是否成功删除
   */
  removeSimilarityPage(fromNodeId, toNodeId, pageIndex) {
    const edgeId = `similarity_${fromNodeId}_${toNodeId}`;
    const edge = this.edges.get(edgeId);
    
    if (!edge || !edge.similarities) {
      console.warn(`⚠️ 边 ${edgeId} 不存在或没有 similarities 数组`);
      return false;
    }

    if (pageIndex < 0 || pageIndex >= edge.similarities.length) {
      console.warn(`⚠️ 无效的页码索引 ${pageIndex}，边 ${edgeId} 共有 ${edge.similarities.length} 页`);
      return false;
    }

    // 删除指定页
    edge.similarities.splice(pageIndex, 1);
    console.log(`🗑️ 删除边 ${edgeId} 的第 ${pageIndex + 1} 页，剩余 ${edge.similarities.length} 页`);

    // 如果删除后还有剩余页，更新边信息
    if (edge.similarities.length > 0) {
      const firstSimilarity = edge.similarities[0].similarity;
      const count = edge.similarities.length;
      edge.label = `相似度: ${(firstSimilarity * 100).toFixed(1)}% ${count > 1 ? `(${count}组)` : ''}`;
      
      // 更新 info
      edge.info.similarity = firstSimilarity;
      edge.info.angle = firstSimilarity;
      edge.info.url1 = edge.similarities[0].url1;
      edge.info.url2 = edge.similarities[0].url2;
      edge.info.similarities = edge.similarities;
      
      console.log(`✅ 边 ${edgeId} 更新后剩余 ${count} 组相似关系`);
    } else {
      // 如果没有剩余页，删除整条边
      this.edges.delete(edgeId);
      console.log(`🗑️ 边 ${edgeId} 所有相似关系已删除，删除整条边`);
    }

    return true;
  }

  /**
   * 获取所有节点
   * @returns {Array} 节点数组
   */
  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取所有边
   * @returns {Array} 边数组
   */
  getAllEdges() {
    // 返回深拷贝,防止D3修改原始数据
    const edges = Array.from(this.edges.values()).map(edge => ({
      ...edge,
      info: edge.info ? { ...edge.info } : undefined
    }));
    
    return edges;
  }

  /**
   * 获取图的JSON表示(用于Storyline渲染)
   * @returns {Object} { nodes, links }
   */
  toStorylineFormat() {
    return {
      nodes: this.getAllNodes(),
      links: this.getAllEdges()
    };
  }

  /**
   * 从JSON恢复图
   * @param {Object} json - { nodes, links }
   */
  fromJSON(json) {
    this.nodes.clear();
    this.edges.clear();
    this.nodeTypes.clear();

    json.nodes.forEach(node => {
      this.nodes.set(node.id, node);
      this.nodeTypes.set(node.id, node.type);
    });

    json.links.forEach(edge => {
      this.edges.set(edge.id, edge);
    });
  }

  /**
   * 清空图(保留石涛节点)
   */
  reset() {
    this.nodes.clear();
    this.edges.clear();
    this.nodeTypes.clear();
    this.initializeAuthorNode();
  }
}

// 导出单例
const storylineManager = new StorylineDataManager();
export default storylineManager;
