import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import segmentData from '../../assets/data/segment_similarity_with_paths.json';
import paintingToSeals from '../../assets/data/painting_to_seals.json';
import './LLM.css';

const SegmentsAndSeals = forwardRef(({ selectedImageId, onSelectionChange }, ref) => {
  const [segments, setSegments] = useState([]);
  const [seals, setSeals] = useState([]);
  
  // 选中状态: { type: 'segment'|'seal', id: string, path: string, name: string }[]
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!selectedImageId) {
      setSegments([]);
      setSeals([]);
      setSelectedItems([]); // 清空选中项
      return;
    }

    // 提取切片
    extractSegments(selectedImageId);
    
    // 提取印章
    extractSeals(selectedImageId);
    
    // 切换图片时清空选中项
    setSelectedItems([]);
  }, [selectedImageId]);

  // 暴露清空选择的方法给父组件
  useImperativeHandle(ref, () => ({
    clearSelection: () => {
      console.log('🧹 清空所有切片和印章的选择');
      setSelectedItems([]);
      // 通知父组件选中状态已清空
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  }));

  const extractSegments = (imageId) => {
    console.log('🔍 开始查找切片, imageId:', imageId);
    
    // 对于总图(如D001430),需要聚合所有子图(D001430_0, D001430_1等)的切片
    let allSegmentPaths = [];
    
    // 方法1: 直接查找当前imageId的切片
    const directSegments = segmentData[imageId];
    if (directSegments) {
      allSegmentPaths = [...Object.keys(directSegments)];
      console.log(`✅ 找到直接切片: ${allSegmentPaths.length}个`);
    }
    
    // 方法2: 查找所有以imageId开头的子图切片(如D001430_0, D001430_1等)
    Object.keys(segmentData).forEach(key => {
      // 检查是否是子图 (如 D001430_0, D001430_1)
      if (key.startsWith(imageId + '_')) {
        const subSegments = Object.keys(segmentData[key]);
        allSegmentPaths = [...allSegmentPaths, ...subSegments];
        console.log(`✅ 找到子图 ${key} 的切片: ${subSegments.length}个`);
      }
    });

    if (allSegmentPaths.length === 0) {
      console.log(`❌ 未找到切片数据: ${imageId} 及其子图`);
      setSegments([]);
      return;
    }

    console.log(`✅ 总共找到 ${allSegmentPaths.length} 个切片路径`);

    // 转换为前端可用的路径
    const segmentList = allSegmentPaths
      .map(path => {
        const relativePath = path.replace(/\\/g, '/');
        // 从路径中提取实际的图像ID (如: segments_out\D001430_0\D001430_0_seg_001.png -> D001430_0)
        const pathParts = path.split('\\');
        const actualImageId = pathParts.length > 1 ? pathParts[1] : imageId;
        
        return {
          id: path, // 使用原始路径作为唯一ID
          path: `/assets/data/${relativePath}`,
          name: path.split('\\').pop(),
          fullPath: path, // 保留完整路径用于查询
          actualImageId: actualImageId // 实际的图像ID（可能是子图ID）
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`🎯 最终显示 ${segmentList.length} 个切片`);
    setSegments(segmentList);
  };

  const extractSeals = (imageId) => {
    // 处理带下划线的 ID：D001430_1 -> D001430
    let baseId = imageId;
    if (imageId.includes('_')) {
      baseId = imageId.split('_')[0];
    }

    // 从 painting_to_seals.json 中查找
    const paintingData = paintingToSeals.find(
      item => item.painting_code === baseId
    );

    if (!paintingData || !paintingData.seals || paintingData.seals.length === 0) {
      setSeals([]);
      return;
    }

    // 转换印章路径
    const sealList = paintingData.seals.map(seal => ({
      id: seal.seal_code, // 使用印章编号作为唯一ID
      code: seal.seal_code,
      path: `/assets/data/${seal.seal_image}`,
      name: `印章 ${seal.seal_code}`
    }));

    setSeals(sealList);
  };

  /**
   * 切换选中状态
   * @param {string} type - 'segment' 或 'seal'
   * @param {Object} item - 切片或印章对象
   */
  const toggleSelection = (type, item) => {
    setSelectedItems(prevSelected => {
      // 检查是否已选中
      const isSelected = prevSelected.some(
        selected => selected.type === type && selected.id === item.id
      );

      let newSelected;
      if (isSelected) {
        // 取消选中
        newSelected = prevSelected.filter(
          selected => !(selected.type === type && selected.id === item.id)
        );
      } else {
        // 添加选中
        newSelected = [
          ...prevSelected,
          {
            type: type,
            id: item.id,
            // 对于切片，使用actualImageId（子图ID），对于印章使用selectedImageId（基础ID）
            imageId: type === 'segment' && item.actualImageId ? item.actualImageId : selectedImageId,
            ...item
          }
        ];
      }

      // 通知父组件选中状态变化
      if (onSelectionChange) {
        onSelectionChange(newSelected);
      }

      return newSelected;
    });
  };

  /**
   * 检查项是否被选中
   */
  const isItemSelected = (type, itemId) => {
    return selectedItems.some(
      selected => selected.type === type && selected.id === itemId
    );
  };

  return (
    <div className="segments">
      <div className="segments-menu">
        {/* 左栏：切片 (75%) */}
        <div className="segments-menu1">
          {segments.map((segment, index) => (
            <div 
              key={segment.id || index} 
              className={`menu-image ${isItemSelected('segment', segment.id) ? 'selected' : ''}`}
              onClick={() => toggleSelection('segment', segment)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={segment.path} 
                alt={segment.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  pointerEvents: 'none' // 防止图片拖拽
                }}
              />
              {isItemSelected('segment', segment.id) && (
                <div className="selection-indicator">✓</div>
              )}
            </div>
          ))}
        </div>

        {/* 右栏：印章 (25%) */}
        <div className="segments-menu2">
          {seals.map((seal, index) => (
            <div 
              key={seal.id || index} 
              className={`menu-image ${isItemSelected('seal', seal.id) ? 'selected' : ''}`}
              onClick={() => toggleSelection('seal', seal)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={seal.path} 
                alt={seal.name}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  pointerEvents: 'none'
                }}
              />
              {isItemSelected('seal', seal.id) && (
                <div className="selection-indicator">✓</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default SegmentsAndSeals;

