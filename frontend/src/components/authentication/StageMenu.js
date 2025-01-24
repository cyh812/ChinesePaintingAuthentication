import * as React from 'react';
import { styled } from '@mui/material/styles';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup, {
    toggleButtonGroupClasses,
} from '@mui/material/ToggleButtonGroup';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AspectRatioIcon from '@mui/icons-material/AspectRatio';
import ZoomInOutlinedIcon from '@mui/icons-material/ZoomInOutlined';
import ZoomOutOutlinedIcon from '@mui/icons-material/ZoomOutOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import CropIcon from '@mui/icons-material/Crop';
import AdsClickIcon from '@mui/icons-material/AdsClick';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';

const CustomToggleButton = styled(ToggleButton)(({ theme }) => ({
    // color: '#ffffff', // 默认图标颜色
    // backgroundColor: '#555555', // 默认背景颜色
    // '&:hover': {
    //   backgroundColor: '#777777', // 鼠标悬停时的颜色
    // },
    '&.Mui-selected': {
        backgroundColor: '#D19762', // 选中时的背景颜色
        color: '#ffffff', // 选中时的图标颜色
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
    [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
    {
        marginLeft: -1,
        borderLeft: '1px solid transparent',
    },
}));

export default function StageMenu({ onZoomIn, onZoomOut, showStage }) {
    const [alignment, setAlignment] = React.useState('');
    const [formats, setFormats] = React.useState(() => ['']);

    const fileInputRef = React.useRef(null); // 创建文件输入的引用

    const handleFormat = (event, newFormats) => {
        setFormats(newFormats);
    };

    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    // 添加按钮点击事件处理
    const handleZoomIn = () => {
        if (onZoomIn) onZoomIn();
    };

    const handleZoomOut = () => {
        if (onZoomOut) onZoomOut(); // 调用传入的缩小函数
    };


    // 当点击上传按钮时，触发文件输入框的点击事件
    const handleFileUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click(); // 触发文件选择窗口
        }
    };

    // 当选择文件后，不做任何事情（忽略上传）
    const handleFileChange = (event) => {
        event.preventDefault(); // 阻止默认行为
        event.stopPropagation(); // 阻止事件冒泡
        // 此处不进行任何处理，选择的文件会被忽略
        showStage();
    };

    return (
        <div
            style={{
                position: 'absolute', // 绝对定位
                bottom: '10px',          // 距离顶部 10px
                left: '50px',         // 距离左侧 10px
                zIndex: 10,           // 确保在最上层
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // 半透明背景
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // 添加阴影
                borderRadius: '8px', // 圆角边框
                padding: '8px',      // 内边距
            }}
        >
            <Paper
                elevation={0}
                sx={(theme) => ({
                    display: 'flex',
                    border: `1px solid ${theme.palette.divider}`,
                    flexWrap: 'wrap',
                    backgroundColor: '#FBF5F0'
                })}
            >
                <StyledToggleButtonGroup
                    size="small"
                    value={alignment}
                    // exclusive
                    // onChange={handleAlignment}
                    aria-label="text alignment"
                >
                    <CustomToggleButton value="left" onClick={handleFileUploadClick} aria-label="left aligned">
                        <CloudUploadIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="center" onClick={handleZoomIn} aria-label="centered">
                        <ZoomInOutlinedIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="right" onClick={handleZoomOut} aria-label="right aligned">
                        <ZoomOutOutlinedIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="justify" >
                        <AspectRatioIcon />
                    </CustomToggleButton>
                </StyledToggleButtonGroup>
                <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
                <StyledToggleButtonGroup
                    size="small"
                    value={formats}
                    exclusive
                    onChange={handleFormat}
                    aria-label="text formatting"
                >
                    <CustomToggleButton value="bold" aria-label="bold">
                        <AdsClickIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="italic" aria-label="italic">
                        <CropIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="underlined" aria-label="underlined">
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
                style={{ display: 'none' }} // 隐藏文件选择框
                onChange={handleFileChange} // 选择文件后不做任何处理
            />
        </div>
    );
}
