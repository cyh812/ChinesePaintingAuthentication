import React, { useEffect, useRef } from "react";

const Legend = () => {
    return (
        <div style={{
            position: 'absolute', // 悬浮效果
            bottom: '10px',          // 距离顶部 10px
            zIndex: 1000,         // 确保在其他内容之上
            backgroundColor: '#ffffff', // 背景颜色
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // 添加阴影
            padding: '1px',      // 内边距
            width: '1550px',      // 设置菜单宽度
            color:"black"
        }}>
            <img
                src="../../assets/img/legend.png"
                alt="Custom Icon"
                style={{
                    height: '100px' || 'auto', // 自定义高度，默认为原始高度
                    width: 'auto',                 // 保持宽高比
                }}
            />
        </div>
    );
};

export default Legend;
