import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';
import Chip from '@mui/material/Chip';
import graphManager from './GraphDataManager';
import StorylineDataManager from './StorylineDataManager';

// 自定义图标组件
function PeopleIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M18.9852 14.3983C17.3997 12.8956 15.1954 11.961 12.7784 11.961H12.7591C11.773 11.961 10.8835 11.5762 10.2261 10.9531C9.5687 10.3301 9.16265 9.48712 9.16265 8.53421C9.16265 7.5813 9.5687 6.73834 10.2261 6.11528C10.8835 5.49223 11.7923 5.1074 12.7784 5.1074C13.7839 5.1074 14.6734 5.49223 15.3308 6.11528C15.9882 6.73834 16.3942 7.5813 16.3942 8.53421C16.3942 8.95569 16.3169 9.37717 16.1622 9.762C16.0075 10.1651 15.7755 10.5133 15.4855 10.8249C15.3308 10.9898 15.3308 11.2647 15.5241 11.4113C15.6981 11.5579 15.9882 11.5579 16.1429 11.3746C16.5102 10.9898 16.8003 10.55 16.9936 10.0552C17.187 9.57874 17.2837 9.06564 17.2837 8.53421C17.2837 7.36139 16.781 6.29853 15.9688 5.52888C15.4855 5.07075 14.8667 4.70424 14.19 4.50267V4.46602C14.19 4.35606 14.1706 4.22779 14.1513 4.11784C16.1235 4.11784 17.5931 4.08119 17.5931 4.04454C17.5931 4.00789 16.1235 3.95291 14.1126 3.93458C13.8999 3.38483 13.3392 3 12.7011 3C12.0437 3 11.5023 3.38483 11.2896 3.93458C9.47203 3.95291 8.17653 4.00789 8.17653 4.04454C8.17653 4.08119 9.45269 4.09951 11.2509 4.11784C11.1929 4.24611 11.1736 4.35606 11.1736 4.48434V4.57597C10.5742 4.79587 10.0328 5.12572 9.58804 5.5472C8.77594 6.31686 8.27321 7.37972 8.27321 8.55253C8.27321 9.72534 8.77594 10.7882 9.58804 11.5579C9.85874 11.8144 10.1875 12.0526 10.5355 12.2359C9.00797 12.6207 7.65446 13.3721 6.57166 14.3983C4.98613 15.9009 4 17.9717 4 20.2623V20.7388C4.01934 20.977 4.21269 21.1419 4.46406 21.1236C4.71542 21.1053 4.88945 20.922 4.88945 20.6838C4.88945 20.6105 4.88945 20.5372 4.87011 20.4822V20.2807C4.87011 18.2282 5.75956 16.3591 7.17107 15.003C8.60192 13.6653 10.5548 12.8223 12.7204 12.8223H12.7591C14.9247 12.8223 16.897 13.6653 18.3278 15.003C19.7587 16.3591 20.6288 18.2282 20.6288 20.2807V20.4822C20.6288 20.5372 20.6288 20.6105 20.6094 20.6838C20.5901 20.922 20.7835 21.1053 21.0348 21.1236C21.2862 21.1419 21.4795 20.9587 21.4989 20.7205V20.2623C21.5376 17.99 20.5708 15.9009 18.9852 14.3983Z" fill="#566A96" stroke="#566A96" strokeWidth="0.5" />
            <path d="M4.72925 20.7893H20.7708" stroke="#566A96" strokeWidth="1.5" strokeLinecap="round" />
        </SvgIcon>
    );
}

function SealIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M21.5 20.1364V21.5H4V20.1364H21.5ZM12.7264 4C15.1903 4 16.9366 5.23364 17.2559 7.32409C17.4376 8.51818 16.99 9.68045 15.8689 10.8559C15.4531 11.2923 15.2642 11.9973 15.3838 12.5818C15.5245 13.2668 16.0101 13.6755 16.6091 13.7095L16.6912 13.7118H19.6983L21.1756 18.5455H4.27719L5.75554 13.7118H8.7605C9.39753 13.7118 9.92162 13.2982 10.0684 12.5818C10.188 11.9973 9.99914 11.2923 9.58438 10.8568C8.46278 9.68046 8.01465 8.51818 8.19688 7.32409C8.51514 5.23364 10.263 4 12.7264 4ZM12.7264 5.36364C11.0057 5.36364 9.93497 6.12 9.72348 7.50682C9.60337 8.29455 9.90623 9.08 10.7614 9.97727C11.4836 10.7355 11.7829 11.8536 11.5837 12.825C11.3168 14.1336 10.2296 15.0236 8.88062 15.0732L8.76101 15.0755H6.93361L6.28888 17.1818H19.1634L18.5192 15.0755H16.6912C15.3695 15.0755 14.2776 14.2741 13.9245 13.055L13.8937 12.9395L13.868 12.825C13.6694 11.8532 13.9691 10.735 14.6914 9.97682C15.5465 9.08 15.8494 8.29455 15.7293 7.50682C15.5173 6.12 14.4475 5.36364 12.7264 5.36364Z" fill="#566A96" />
        </SvgIcon>
    );
}

function PaintingIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M21.0274 16.5667C20.9277 16.6839 20.8188 16.8 20.7001 16.9127C20.1079 17.4751 19.2749 17.9488 18.1244 18.0746C17.9288 18.0959 17.7244 18.1074 17.5106 18.1074C16.6473 18.1074 15.8456 17.9469 15.1274 17.626C15.1274 17.626 15.1274 17.626 15.1273 17.626L21.0274 16.5667ZM21.0274 16.5667V19.1465H3.9726V14.3581C3.97549 14.3537 3.97868 14.349 3.98218 14.3438C3.99689 14.3223 4.01294 14.3 4.03202 14.2734C4.04161 14.2601 4.05198 14.2456 4.06332 14.2297L3.87256 14.0938L4.06332 14.2297C4.25546 13.9601 4.59284 13.5305 5.06616 13.1065C6.07782 12.2003 7.18228 11.7517 8.35556 11.7517C9.51057 11.7517 10.5159 12.2029 11.355 13.1089C11.9353 13.7355 12.2312 14.3748 12.2833 14.4937C12.3446 14.6826 12.6328 15.4878 13.3341 16.2923L13.5225 16.1281L13.3341 16.2923C13.7933 16.8192 14.3371 17.2405 14.9504 17.5431L21.0274 16.5667ZM13.4288 14.0846L13.4254 14.0729L13.4208 14.0616L13.414 14.0448C13.414 14.0448 13.414 14.0448 13.414 14.0448C13.3942 13.9956 13.044 13.1433 12.2593 12.2881C11.2027 11.1366 9.85054 10.5212 8.35449 10.5212C7.52971 10.5212 6.72343 10.7006 5.95935 11.053L6.0562 11.263L5.95935 11.053C5.35301 11.3326 4.77945 11.72 4.24517 12.2017L4.24516 12.2018C4.14892 12.2885 4.05818 12.3752 3.9726 12.4607V5.9894H21.0274V13.6864C20.9992 13.8577 20.8779 14.5751 20.4471 15.2904L20.6385 15.4057L20.4471 15.2904C19.8133 16.3426 18.8379 16.8769 17.5108 16.8769C16.1521 16.8769 15.0672 16.4099 14.2624 15.4988C13.6579 14.8145 13.4381 14.1151 13.4335 14.1004C13.4334 14.1002 13.4334 14.1001 13.4334 14.1003L13.4288 14.0846ZM22.25 5.69401C22.25 5.1781 21.8398 4.75 21.3218 4.75H3.67824C3.1602 4.75 2.75 5.1781 2.75 5.69401V19.4202C2.75 19.9361 3.16021 20.3642 3.67824 20.3642H21.3218C21.8398 20.3642 22.25 19.9361 22.25 19.4202V5.69401Z" fill="#566A96" stroke="#566A96" strokeWidth="0.5" />
            <path d="M15.1467 10.3256C15.1467 10.9326 15.3769 11.5147 15.7866 11.944C16.1963 12.3732 16.752 12.6143 17.3314 12.6143C17.9108 12.6143 18.4665 12.3732 18.8762 11.944C19.2859 11.5147 19.5161 10.9326 19.5161 10.3256C19.5161 9.71858 19.2859 9.13644 18.8762 8.70722C18.4665 8.278 17.9108 8.03687 17.3314 8.03687C16.752 8.03687 16.1963 8.278 15.7866 8.70722C15.3769 9.13644 15.1467 9.71858 15.1467 10.3256Z" fill="white" stroke="#566A96" strokeWidth="2" />
        </SvgIcon>
    );
}

function ReferenceIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M15.7175 13.9926V5.76758C15.7175 4.94008 15.045 4.26758 14.2175 4.26758H4.40747C3.57997 4.26758 2.90747 4.94008 2.90747 5.76758V13.9951C2.90747 14.8226 3.57997 15.4951 4.40747 15.4951H5.62497V16.8351C5.62497 17.1176 5.78247 17.3751 6.03497 17.5026C6.14247 17.5576 6.25997 17.5851 6.37497 17.5851C6.52997 17.5851 6.68497 17.5376 6.81497 17.4426L9.49997 15.4926H14.2175C15.045 15.4926 15.7175 14.8201 15.7175 13.9926Z" fill="#566A96" />
            <path d="M20.5925 7.54248H16.575V15.2025C16.575 15.755 16.1275 16.2025 15.575 16.2025H11.27V17.195C11.27 18.0225 11.9425 18.695 12.77 18.695H15.0175L17.6925 20.595C17.8225 20.6875 17.975 20.735 18.1275 20.735C18.2575 20.735 18.3875 20.7025 18.505 20.6325C18.74 20.4975 18.8775 20.24 18.8775 19.97V18.8025H20.5925C21.42 18.8025 22.0925 18.13 22.0925 17.3025V9.04248C22.0925 8.21498 21.42 7.54248 20.5925 7.54248Z" fill="#566A96" />
        </SvgIcon>
    );
}

function QueryIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M15.7175 13.9926V5.76758C15.7175 4.94008 15.045 4.26758 14.2175 4.26758H4.40747C3.57997 4.26758 2.90747 4.94008 2.90747 5.76758V13.9951C2.90747 14.8226 3.57997 15.4951 4.40747 15.4951H5.62497V16.8351C5.62497 17.1176 5.78247 17.3751 6.03497 17.5026C6.14247 17.5576 6.25997 17.5851 6.37497 17.5851C6.52997 17.5851 6.68497 17.5376 6.81497 17.4426L9.49997 15.4926H14.2175C15.045 15.4926 15.7175 14.8201 15.7175 13.9926Z" fill="#566A96" />
            <path d="M20.5925 7.54248H16.575V15.2025C16.575 15.755 16.1275 16.2025 15.575 16.2025H11.27V17.195C11.27 18.0225 11.9425 18.695 12.77 18.695H15.0175L17.6925 20.595C17.8225 20.6875 17.975 20.735 18.1275 20.735C18.2575 20.735 18.3875 20.7025 18.505 20.6325C18.74 20.4975 18.8775 20.24 18.8775 19.97V18.8025H20.5925C21.42 18.8025 22.0925 18.13 22.0925 17.3025V9.04248C22.0925 8.21498 21.42 7.54248 20.5925 7.54248Z" fill="#566A96" />
        </SvgIcon>
    );
}

const EnhancedNestedList = ({ onGraphUpdate, onShowFullAnswer }) => {
    const [history, setHistory] = React.useState([]);
    const [expandedItems, setExpandedItems] = React.useState({});
    const [updateTrigger, setUpdateTrigger] = React.useState(0);
    const [hoveredItem, setHoveredItem] = React.useState(null);  // 当前悬停的历史项
    const [hoveredRect, setHoveredRect] = React.useState(null);  // 当前悬停按钮的位置信息
    const [showAnswerFor, setShowAnswerFor] = React.useState(null);  // 点击按钮后显示答案的项
    const [answerRect, setAnswerRect] = React.useState(null);  // 点击显示答案时的按钮位置
    const buttonRefs = React.useRef({});  // 存储每个按钮的 ref

    // 初始化时获取历史
    React.useEffect(() => {
        const latestHistory = graphManager.getHistory();
        setHistory([...latestHistory]);
    }, []);

    // 监听updateTrigger变化来刷新历史
    React.useEffect(() => {
        if (updateTrigger > 0) {
            const latestHistory = graphManager.getHistory();
            setHistory([...latestHistory]);
        }
    }, [updateTrigger]);

    // 强制刷新历史（外部调用）
    const refreshHistory = React.useCallback(() => {
        const latestHistory = graphManager.getHistory();
        setHistory([...latestHistory]);
    }, []);

    // 暴露刷新方法给父组件
    React.useEffect(() => {
        if (window.refreshNestedList === undefined) {
            window.refreshNestedList = refreshHistory;
        }
    }, [refreshHistory]);

    // 切换展开/折叠
    const handleToggle = (id) => {
        setExpandedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // 切换答案显示
    const handleToggleAnswerDisplay = (itemId, e) => {
        e.stopPropagation();  // 阻止触发父元素的 onClick
        
        if (showAnswerFor === itemId) {
            // 如果已经显示，则隐藏
            setShowAnswerFor(null);
            setAnswerRect(null);
        } else {
            // 显示答案框
            const button = buttonRefs.current[itemId];
            if (button) {
                const rect = button.getBoundingClientRect();
                setAnswerRect(rect);
                setShowAnswerFor(itemId);
            }
        }
    };

    // 删除单个节点
    const handleDeleteNode = (node) => {
        console.log('🗑️ 删除节点/翻页:', node);
        
        // 如果是翻页增加的重复节点，只删除对应的那一页
        if (node.isPageAdded && node.fromNodeId && node.toNodeId && node.pageIndex !== undefined) {
            console.log(`📄 删除翻页: ${node.fromNodeId} -> ${node.toNodeId}, 页码 ${node.pageIndex}`);
            
            // 调用新的删除翻页方法
            StorylineDataManager.removeSimilarityPage(node.fromNodeId, node.toNodeId, node.pageIndex);
            
            // 从历史记录中移除这个节点记录
            graphManager.removeNodeFromHistory(node.id, node.pageIndex);
        } else {
            // 普通节点删除（删除整个节点及相关边）
            console.log(`🗑️ 删除节点: ${node.id}`);
            StorylineDataManager.removeNode(node.id);
            graphManager.removeNode(node.id);
        }
        
        // 立即更新历史显示
        const latestHistory = graphManager.getHistory();
        setHistory([...latestHistory]);
        
        // 获取更新后的图数据并通知父组件
        if (onGraphUpdate) {
            const updatedGraph = StorylineDataManager.toStorylineFormat();
            onGraphUpdate({
                addedNodes: [],
                addedEdges: [],
                data: updatedGraph
            });
        }
    };

    // 撤销最后一次添加
    const handleUndo = () => {
        console.log('↩️ 撤销最后一次添加');
        
        // 从 GraphDataManager 获取最后一次添加的节点
        const lastHistory = graphManager.getHistory()[0];
        if (!lastHistory) {
            console.log('没有可撤销的操作');
            return;
        }
        
        // 删除最后一次添加的所有节点
        if (lastHistory.addedNodes && lastHistory.addedNodes.length > 0) {
            lastHistory.addedNodes.forEach(node => {
                StorylineDataManager.removeNode(node.id);
            });
        }
        
        // 从历史记录中移除
        graphManager.undoLastAddition();
        
        // 立即更新历史显示
        const latestHistory = graphManager.getHistory();
        setHistory([...latestHistory]);
        
        // 获取更新后的图数据并通知父组件
        if (onGraphUpdate) {
            const updatedGraph = StorylineDataManager.toStorylineFormat();
            onGraphUpdate({
                addedNodes: [],
                addedEdges: [],
                data: updatedGraph
            });
        }
    };

    // 获取类别对应的图标
    const getCategoryIcon = (category) => {
        switch(category) {
            case 'P': return <PaintingIcon />;
            case 'S': return <SealIcon />;
            case 'A': return <PeopleIcon />;
            case 'R': return <ReferenceIcon />;
            default: return <QueryIcon />;
        }
    };

    // 获取类别对应的颜色
    const getCategoryColor = (category) => {
        switch(category) {
            case 'P': return '#4B80FA'; // 蓝色 - 画作
            case 'S': return '#FF1A1A'; // 红色 - 印章
            case 'A': return '#4CAF50'; // 绿色 - 作者
            case 'R': return '#FFA726'; // 橙色 - 文献
            default: return '#FF6B6B'; // 其他
        }
    };

    return (
        <>
            <div 
                id="history-container"
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    zIndex: 1000,
                    backgroundColor: '#ffffff',
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
                    borderRadius: '8px',
                    padding: '8px',
                    width: '330px',
                    maxHeight: '80vh',
                    overflow: 'visible'  // 允许悬浮框溢出
                }}>
            <List
                sx={{ 
                    width: '100%', 
                    bgcolor: 'background.paper',
                    maxHeight: 'calc(80vh - 16px)',
                    overflowY: 'auto',
                    overflowX: 'visible',  // 允许水平方向溢出（显示左侧悬浮框）
                    position: 'relative'   // 确保相对定位
                }}
                component="nav"
                subheader={
                    <ListSubheader component="div" style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'black',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>查询历史 (最近5次)</span>
                        {history.length > 0 && (
                            <IconButton 
                                size="small" 
                                onClick={handleUndo}
                                title="撤销最后一次添加"
                            >
                                <UndoIcon fontSize="small" />
                            </IconButton>
                        )}
                    </ListSubheader>
                }
            >
                {history.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                        暂无查询记录
                    </div>
                ) : (
                    history.map((item, index) => (
                        <React.Fragment key={item.id}>
                            {/* 主查询按钮 - hover 显示完整答案 */}
                            <ListItemButton 
                                ref={(el) => buttonRefs.current[item.id] = el}
                                onClick={() => handleToggle(item.id)}
                                onMouseEnter={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    setHoveredRect(rect);
                                    setHoveredItem(item.id);
                                }}
                                onMouseLeave={() => {
                                    setHoveredItem(null);
                                    setHoveredRect(null);
                                }}
                                sx={{ position: 'relative' }}
                            >
                                <ListItemIcon>
                                    <QueryIcon sx={{ width: 30, height: 30 }} />
                                </ListItemIcon>
                                <ListItemText 
                                    primary={`第 ${history.length - index} 次查询`}
                                    secondary={item.question.substring(0, 20) + '...'}
                                    primaryTypographyProps={{
                                        style: { color: '#333', fontWeight: 500 }
                                    }}
                                    secondaryTypographyProps={{
                                        style: { color: '#666' }
                                    }}
                                />
                                {/* 查看答案按钮 */}
                                <IconButton 
                                    size="small"
                                    onClick={(e) => handleToggleAnswerDisplay(item.id, e)}
                                    title={showAnswerFor === item.id ? "隐藏答案" : "查看完整答案"}
                                    sx={{ 
                                        color: showAnswerFor === item.id ? '#4B80FA' : '#666',
                                        marginRight: '4px'
                                    }}
                                >
                                    <ChatBubbleOutlineIcon fontSize="small" />
                                </IconButton>
                                <div style={{ color: '#666' }}>
                                    {expandedItems[item.id] ? <ExpandLess /> : <ExpandMore />}
                                </div>
                            </ListItemButton>

                            {/* 悬浮答案框 - 点击按钮后显示 */}
                            {showAnswerFor === item.id && answerRect && (
                                <div style={{
                                    position: 'fixed',
                                    top: `${answerRect.top}px`,
                                    right: `calc(100vw - ${answerRect.left}px + 10px)`,
                                    width: '450px',
                                    height: `${answerRect.height}px`,
                                    backgroundColor: '#f9f9f9',
                                    padding: '0',
                                    borderRadius: '4px',
                                    border: '2px solid #4B80FA',
                                    boxShadow: '0 4px 12px rgba(75,128,250,0.3)',
                                    zIndex: 10001,
                                    overflow: 'auto',
                                    fontSize: '12px',
                                    lineHeight: '1.5',
                                    color: '#333'
                                }}>
                                    <div style={{
                                        padding: '8px 12px',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word'
                                    }}>
                                        {item.fullAnswer || item.answer || '暂无答案'}
                                    </div>
                                </div>
                            )}

                            {/* 节点列表 */}
                            <Collapse in={expandedItems[item.id]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.addedNodes.length === 0 ? (
                                        <div style={{ padding: '10px 20px', color: '#999', fontSize: '12px' }}>
                                            本次查询未添加新节点
                                        </div>
                                    ) : (
                                        item.addedNodes.map((node, index) => (
                                            <ListItemButton 
                                                key={`${node.id}-${index}`} 
                                                sx={{ pl: 4 }}
                                            >
                                                <ListItemIcon>
                                                    {getCategoryIcon(node.category)}
                                                </ListItemIcon>
                                                <Chip
                                                    label={
                                                        node.isPageAdded 
                                                            ? `${node.displayName || node.name} (翻页 ${node.pageIndex + 1})`
                                                            : node.isDuplicate
                                                                ? `${node.displayName || node.name} (重复)`
                                                                : (node.displayName || node.name)
                                                    }
                                                    size="small"
                                                    onDelete={() => handleDeleteNode(node)}
                                                    deleteIcon={<DeleteIcon />}
                                                    sx={{
                                                        backgroundColor: node.isPageAdded 
                                                            ? '#FF9800'  // 橙色表示翻页
                                                            : node.isDuplicate 
                                                                ? '#9E9E9E'  // 灰色表示重复
                                                                : getCategoryColor(node.category),
                                                        color: 'white',
                                                        '& .MuiChip-deleteIcon': {
                                                            color: 'white'
                                                        }
                                                    }}
                                                />
                                            </ListItemButton>
                                        ))
                                    )}
                                </List>
                            </Collapse>
                        </React.Fragment>
                    ))
                )}
            </List>
        </div>
        </>
    );
};

export default EnhancedNestedList;
