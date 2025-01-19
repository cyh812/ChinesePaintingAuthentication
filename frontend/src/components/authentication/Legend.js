import React, { useEffect, useRef } from "react";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

const Legend = () => {
    const [value, setValue] = React.useState(30);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <div style={{
            position: 'absolute', // 悬浮效果
            bottom: '20px',          // 距离顶部 10px
            zIndex: 1000,         // 确保在其他内容之上
            backgroundColor: '#ffffff', // 背景颜色
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // 添加阴影
            padding: '1px',      // 内边距
            width: '1550px',      // 设置菜单宽度
            height: '50px',
            color: "black",
            display: "flex",
            flexDirection: "row",
            alignItems:"center"
        }}>
            <Box sx={{ width: 300 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                    <div>image similarity</div>
                    <Slider aria-label="Volume" value={value} onChange={handleChange} />
                </Stack>
            </Box>
               
            <Box sx={{ width: 300 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                <div>Seal similarity</div>
                    <Slider aria-label="Volume" value={value} onChange={handleChange} />
                </Stack>
            </Box>

            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                <div>Seal similarity</div>
                <VolumeDown/>
                </Stack>
            </Box>

            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                <div>Seal similarity</div>
                <VolumeDown/>
                </Stack>
            </Box>

            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                <div>Seal similarity</div>
                <VolumeDown/>
                </Stack>
            </Box>

            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                <div>Seal similarity</div>
                <VolumeDown/>
                </Stack>
            </Box>

            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                <div>Seal similarity</div>
                <VolumeDown/>
                </Stack>
            </Box>

            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ alignItems: 'center', mb: 0 }}>
                <div>Seal similarity</div>
                <VolumeDown/>
                </Stack>
            </Box>
        </div>
    );
};

export default Legend;
