import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup, { toggleButtonGroupClasses } from '@mui/material/ToggleButtonGroup';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import AddBoxIcon from '@mui/icons-material/AddBox';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CropIcon from '@mui/icons-material/Crop';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import ImageSelector from './ImageSelector';

const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
    '&.Mui-selected': {
        backgroundColor: '#D19762',
        color: '#ffffff',
    },
}));

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    [`& .${toggleButtonGroupClasses.grouped}`]: {
        margin: theme.spacing(0.5),
        border: 0,
        borderRadius: theme.shape.borderRadius,
        [`&.${toggleButtonGroupClasses.disabled}`]: {
            border: 0,
        },
    },
    [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]: {
        marginLeft: -1,
        borderLeft: '1px solid transparent',
    },
}));

export default function StageMenu({ showStage, currentLabel, onChangeLabel, onReset, onImageSelect, onShowSegments }) {
    const [alignment, setAlignment] = React.useState('');
    const [formats, setFormats] = React.useState(() => ['']);
    const [imageSelectorOpen, setImageSelectorOpen] = React.useState(false);
    const fileInputRef = React.useRef(null);

    const handleFormat = (event, newFormats) => setFormats(newFormats);
    const handleAlignment = (event, newAlignment) => setAlignment(newAlignment);

    const handleFileUploadClick = () => {
        // 打开图片选择对话框
        setImageSelectorOpen(true);
    };

    const handleImageSelect = (selectedImage) => {
        console.log('选中的图片:', selectedImage);
        setImageSelectorOpen(false);
        
        // 显示Stage
        showStage && showStage();
        
        // 通知父组件图片已选择
        onImageSelect && onImageSelect(selectedImage);
    };

    const handleFileChange = (event) => {
        event.preventDefault();
        event.stopPropagation();
        showStage && showStage();
    };

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)', // 水平居中关键
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                padding: '8px',
                maxWidth: '100%', // 限制最大宽度
                width: 'fit-content',          // 宽度自适应内容
            }}

        >
            <Paper
                elevation={0}
                sx={(theme) => ({
                    display: 'flex',
                    border: `1px solid ${theme.palette.divider}`,
                    flexWrap: 'nowrap',          // ✅ 不允许换行
                    backgroundColor: '#FBF5F0',
                    maxWidth: '100%',  // 限制最大宽度
                    overflowX: 'auto',        // 添加水平滚动
                    overflowY: 'hidden',      // 隐藏垂直滚动
                    scrollbarWidth: 'thin',   // Firefox 滚动条样式
                    scrollbarColor: 'rgba(100, 100, 100, 0.5) rgba(0,0,0,0.1)', // 深灰色
                })}
            >
                <StyledToggleButtonGroup size="small" value={alignment} aria-label="left group">
                    {/* 上传 */}
                    <CustomToggleButton value="left" onClick={handleFileUploadClick} aria-label="upload">
                        <CloudUploadIcon />
                    </CustomToggleButton>

                    {/* 正向点：再次点同一按钮 => 取消激活 */}
                    <CustomToggleButton
                        value="positive"
                        aria-label="positive"
                        selected={currentLabel === 1}
                        onClick={() => onChangeLabel && onChangeLabel(currentLabel === 1 ? null : 1)}
                        title="Add positive points"
                    >
                        <AddBoxIcon />
                    </CustomToggleButton>

                    {/* 负向点：再次点同一按钮 => 取消激活 */}
                    <CustomToggleButton
                        value="negative"
                        aria-label="negative"
                        selected={currentLabel === 0}
                        onClick={() => onChangeLabel && onChangeLabel(currentLabel === 0 ? null : 0)}
                        title="Add negative points"
                    >
                        <IndeterminateCheckBoxIcon />
                    </CustomToggleButton>

                    {/* 重置 */}
                    <CustomToggleButton
                        value="reset"
                        aria-label="reset"
                        onClick={() => onReset && onReset()}
                        title="Reset clicks & mask"
                    >
                        <AspectRatioIcon />
                    </CustomToggleButton>
                </StyledToggleButtonGroup>

                <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />

                <StyledToggleButtonGroup
                    size="small"
                    value={formats}
                    exclusive
                    onChange={handleFormat}
                    aria-label="right group"
                >
                    <CustomToggleButton value="bold" aria-label="bold">
                        <AdsClickIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="italic" aria-label="italic">
                        <CropIcon />
                    </CustomToggleButton>
                    <CustomToggleButton 
                        value="underlined" 
                        aria-label="underlined"
                        onClick={() => onShowSegments && onShowSegments()}
                        title="显示切片和印章"
                    >
                        <AutoAwesomeOutlinedIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="color" aria-label="color">
                        <CollectionsBookmarkIcon />
                        <ArrowDropDownIcon />
                    </CustomToggleButton>
                </StyledToggleButtonGroup>
            </Paper>

            {/* 隐藏的文件上传输入框 */}
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />

            {/* 图片选择对话框 */}
            <ImageSelector 
                open={imageSelectorOpen}
                onClose={() => setImageSelectorOpen(false)}
                onSelect={handleImageSelect}
            />
        </div>
    );
}
