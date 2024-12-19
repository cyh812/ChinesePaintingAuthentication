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

export default function CustomizedDividers() {
    const [alignment, setAlignment] = React.useState('left');
    const [formats, setFormats] = React.useState(() => ['italic']);

    const handleFormat = (event, newFormats) => {
        setFormats(newFormats);
    };

    const handleAlignment = (event, newAlignment) => {
        setAlignment(newAlignment);
    };

    return (
        <div
            style={{
                position: 'absolute', // 绝对定位
                bottom: '10px',          // 距离顶部 10px
                left: '60px',         // 距离左侧 10px
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
                    exclusive
                    onChange={handleAlignment}
                    aria-label="text alignment"
                >
                    <CustomToggleButton value="left" aria-label="left aligned">
                        <CloudUploadIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="center" aria-label="centered">
                        <ZoomInOutlinedIcon />
                    </CustomToggleButton>
                    <CustomToggleButton value="right" aria-label="right aligned">
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
        </div>
    );
}
