import React, { useEffect, useRef } from "react";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import SvgIcon from '@mui/material/SvgIcon';
import MuiInput from '@mui/material/Input';
import { styled } from '@mui/material/styles';
import VolumeUp from '@mui/icons-material/VolumeUp';

const Input = styled(MuiInput)`
  width: 42px;
`;

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

function PaintingPieIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M13 12V3C11.22 3 9.47991 3.52784 7.99987 4.51677C6.51983 5.50571 5.36628 6.91131 4.68509 8.55585C4.0039 10.2004 3.82567 12.01 4.17294 13.7558C4.5202 15.5016 5.37737 17.1053 6.63604 18.364C7.89471 19.6226 9.49836 20.4798 11.2442 20.8271C12.99 21.1743 14.7996 20.9961 16.4442 20.3149C18.0887 19.6337 19.4943 18.4802 20.4832 17.0001C21.4722 15.5201 22 13.78 22 12H13Z" fill="#1A1AFF" />
            <path opacity="0.2" d="M14 3V11H22C21.6941 8.98766 20.7527 7.12586 19.3134 5.68657C17.8741 4.24728 16.0123 3.30592 14 3Z" fill="#1A1AFF" />
        </SvgIcon>
    );
}

function SealPieIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M13 12V3C11.22 3 9.47991 3.52784 7.99987 4.51677C6.51983 5.50571 5.36628 6.91131 4.68509 8.55585C4.0039 10.2004 3.82567 12.01 4.17294 13.7558C4.5202 15.5016 5.37737 17.1053 6.63604 18.364C7.89471 19.6226 9.49836 20.4798 11.2442 20.8271C12.99 21.1743 14.7996 20.9961 16.4442 20.3149C18.0887 19.6337 19.4943 18.4802 20.4832 17.0001C21.4722 15.5201 22 13.78 22 12H13Z" fill="#FF1A1A" />
            <path opacity="0.2" d="M14 3V11H22C21.6941 8.98766 20.7527 7.12586 19.3134 5.68657C17.8741 4.24728 16.0123 3.30592 14 3Z" fill="#FF1A1A" />
        </SvgIcon>
    );
}

function ReferenceIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M20.0451 5.70996C19.8726 5.69746 19.7051 5.75996 19.5826 5.88246C19.4601 6.00496 19.3976 6.17246 19.4101 6.34496V19.0525C19.3651 19.73 18.8276 20.2725 18.1501 20.3225H7.07261C6.31511 20.3225 5.43511 19.6875 5.43511 19.0525V17.63C5.43511 16.995 6.19261 16.605 6.95011 16.605H17.5276C17.7001 16.6175 17.8676 16.555 17.9901 16.4325C18.1126 16.31 18.1751 16.1425 18.1626 15.97V5.58746C18.1751 4.93496 17.9076 4.30746 17.4226 3.86996C16.9401 3.42996 16.2901 3.21996 15.6426 3.29496H7.07261C5.68011 3.29496 4.29761 4.06246 4.29761 5.58996V19.5675C4.52761 20.74 5.50511 21.62 6.69261 21.7275H18.1626C19.5151 21.7275 20.6276 20.6625 20.6826 19.31V6.36496C20.6626 6.02246 20.3901 5.74996 20.0476 5.72996V5.70996H20.0451ZM17.6101 17.905H7.37011C7.02011 17.905 6.73511 18.19 6.73511 18.54C6.73511 18.89 7.02011 19.175 7.37011 19.175H17.6101C17.9601 19.175 18.2451 18.89 18.2451 18.54C18.2451 18.19 17.9601 17.905 17.6101 17.905Z" fill="#566A96" />
        </SvgIcon>
    );
}

function ReferenceIcon2(props) {
    return (
        <SvgIcon {...props}>
            <path d="M16.2917 3.1625C16.0083 3.1625 15.5833 3.45 15.5833 3.88125V20.125C15.5833 20.8438 15.1583 21.5625 14.45 21.5625H2.975C2.125 21.5625 1.41667 20.8438 1.41667 20.125V18.6875C1.41667 17.9688 2.125 17.25 2.83333 17.25H13.8833C14.1667 17.25 14.1667 17.1062 14.1667 16.8188V2.875C14.1667 1.4375 13.4583 0 11.9 0H2.975C1.55833 0 0 1.29375 0 2.875V20.125C0 20.125 0 20.125 0 20.2688C0 20.4125 0 20.4125 0 20.5563C0.141667 21.85 1.41667 22.8563 2.55 23H2.69167C2.69167 23 2.69167 23 2.83333 23H14.45C15.8667 23 17 21.7063 17 20.125V3.88125C17 3.45 16.575 3.1625 16.2917 3.1625ZM2.975 1.4375H12.0417C12.325 1.4375 12.75 1.86875 12.75 2.875V15.8125H2.83333C2.26667 15.8125 1.41667 16.2438 1.41667 16.5313V2.875C1.41667 2.15625 2.26667 1.4375 2.975 1.4375Z" fill="#566A96" />
            <path d="M13.8833 18.6875H3.11659C2.83325 18.6875 2.54992 18.975 2.54992 19.4063C2.54992 19.8375 2.83325 20.125 3.11659 20.125H13.7416C14.0249 20.125 14.3083 19.8375 14.3083 19.4063C14.3083 18.975 14.1666 18.6875 13.8833 18.6875Z" fill="#566A96" />
        </SvgIcon>
    );
}

const minDistance = 0.01;

const Legend = ({ onSegmentSimilarityChange }) => {
    // 切片相似度范围: 0.8 - 1.0
    const [segmentSimilarity, setSegmentSimilarity] = React.useState([0.8, 1]);

    // Slider 变动时，按拖动的 thumb 更新对应值
    const handleSliderChange = (event, newValue, activeThumb) => {
        if (!Array.isArray(newValue)) return;
        if (activeThumb === 0) {
            const newRange = [Math.min(newValue[0], segmentSimilarity[1] - minDistance), segmentSimilarity[1]];
            setSegmentSimilarity(newRange);
            onSegmentSimilarityChange?.(newRange);
        } else {
            const newRange = [segmentSimilarity[0], Math.max(newValue[1], segmentSimilarity[0] + minDistance)];
            setSegmentSimilarity(newRange);
            onSegmentSimilarityChange?.(newRange);
        }
    };

    // 左侧 Input 变化
    const handleLeftInputChange = (event) => {
        let newLeft = Number(event.target.value);
        // 限制最小值为 0.8，最大值不能超过右侧值 - minDistance
        newLeft = Math.max(newLeft, 0.8);
        newLeft = Math.min(newLeft, segmentSimilarity[1] - minDistance);
        const newRange = [newLeft, segmentSimilarity[1]];
        setSegmentSimilarity(newRange);
        onSegmentSimilarityChange?.(newRange);
    };

    // 右侧 Input 变化
    const handleRightInputChange = (event) => {
        let newRight = Number(event.target.value);
        // 限制最大值为 1.0，最小值不能低于左侧值 + minDistance
        newRight = Math.min(newRight, 1);
        newRight = Math.max(newRight, segmentSimilarity[0] + minDistance);
        const newRange = [segmentSimilarity[0], newRight];
        setSegmentSimilarity(newRange);
        onSegmentSimilarityChange?.(newRange);
    };

    // 失去焦点时，再次校验左侧值
    const handleLeftBlur = () => {
        let newLeft = segmentSimilarity[0];
        if (newLeft < 0.8) newLeft = 0.8;
        if (newLeft > segmentSimilarity[1] - minDistance) newLeft = segmentSimilarity[1] - minDistance;
        const newRange = [newLeft, segmentSimilarity[1]];
        setSegmentSimilarity(newRange);
        onSegmentSimilarityChange?.(newRange);
    };

    // 失去焦点时，再次校验右侧值
    const handleRightBlur = () => {
        let newRight = segmentSimilarity[1];
        if (newRight > 1) newRight = 1;
        if (newRight < segmentSimilarity[0] + minDistance) newRight = segmentSimilarity[0] + minDistance;
        const newRange = [segmentSimilarity[0], newRight];
        setSegmentSimilarity(newRange);
        onSegmentSimilarityChange?.(newRange);
    };


    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            zIndex: 1000,
            backgroundColor: '#ffffff',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            padding: '15px 15px 10px 15px', // 增加顶部内边距
            width: 'calc(100% - 40px)', // 响应式宽度，减去左右边距
            maxWidth: '100%',
            minHeight: '80px', // 增加最小高度
            height: 'auto', // 自动高度
            color: "black",
            display: "flex",
            flexDirection: "row",
            alignItems: 'center',
            justifyContent: 'space-between', // 均匀分布
            borderRadius: "10px",
            border: '2px solid #ddd',
            overflowX: 'auto', // 水平滚动
            overflowY: 'hidden',
            gap: '8px', // 减小间距
            left: '50%', // 居中对齐
            transform: 'translateX(-50%)', // 居中对齐
        }}>
            {/* 容器内部使用 flex-wrap: nowrap 确保横向排列，不换行 */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                width: '100%',
                minWidth: 'fit-content',
                whiteSpace: 'nowrap'
            }}>
                {/* 切片相似度滑块 */}
                <Box sx={{ flex: '1 1 auto', minWidth: '380px', maxWidth: '480px', backgroundColor: '#f7f7f7', borderRadius: '20px', px: 1, py: 1 }}>
                    <Stack spacing={0.5} direction="row" sx={{ alignItems: 'center', mb: 0, mt: 0.5 }}>
                        <div style={{ color: 'black', fontWeight: 'bold', whiteSpace: 'nowrap', borderRight: '5px solid #ffffff', padding: '5px 10px', fontSize: '14px' }}>Segment Similarity</div>
                        <Input sx={{ width: 42 }}
                            value={segmentSimilarity[0]}
                            size="small"
                            onChange={handleLeftInputChange}
                            onBlur={handleLeftBlur}
                            inputProps={{
                                step: 0.01,
                                min: 0.8,
                                max: 1,
                                type: 'number',
                            }}
                        />
                        <Slider
                            getAriaLabel={() => 'Segment similarity range'}
                            value={segmentSimilarity}
                            onChange={handleSliderChange}
                            valueLabelDisplay="auto"
                            disableSwap
                            step={0.01}
                            min={0.8}
                            max={1}
                            sx={{ 
                                mx: 0.5, 
                                flex: 1, 
                                minWidth: '100px',
                                '& .MuiSlider-valueLabel': {
                                    fontSize: '12px',
                                    padding: '2px 6px'
                                }
                            }}
                        />
                        <Input sx={{ width: 42 }}
                            value={segmentSimilarity[1]}
                            size="small"
                            onChange={handleRightInputChange}
                            onBlur={handleRightBlur}
                            inputProps={{
                                step: 0.01,
                                min: 0.8,
                                max: 1,
                                type: 'number',
                            }}
                        />
                    </Stack>
                </Box>

                <Box sx={{ flex: '0 0 auto', minWidth: '85px' }}>
                    <Stack spacing={0.5} direction="row" sx={{ alignItems: 'center', mb: 0, justifyContent: 'center' }}>
                        <div style={{ color: 'black', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '14px' }}>Author</div>
                        <PeopleIcon sx={{ transform: 'scale(1.2)', ml: 0.5 }} />
                    </Stack>
                </Box>

                <Box sx={{ flex: '0 0 auto', minWidth: '100px' }}>
                    <Stack spacing={0.5} direction="row" sx={{ alignItems: 'center', mb: 0, justifyContent: 'center' }}>
                        <div style={{ color: 'black', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '14px' }}>Painting</div>
                        <PaintingIcon sx={{ transform: 'scale(1.2)', ml: 0.5 }} />
                    </Stack>
                </Box>

                <Box sx={{ flex: '0 0 auto', minWidth: '70px' }}>
                    <Stack spacing={0.5} direction="row" sx={{ alignItems: 'center', mb: 0, justifyContent: 'center' }}>
                        <div style={{ color: 'black', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '14px' }}>Seal</div>
                        <SealIcon sx={{ transform: 'scale(1.2)', ml: 0.5 }} />
                    </Stack>
                </Box>

                <Box sx={{ flex: '0 0 auto', minWidth: '105px' }}>
                    <Stack spacing={0.5} direction="row" sx={{ alignItems: 'center', mb: 0, justifyContent: 'center' }}>
                        <div style={{ color: 'black', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: '14px' }}>Literature</div>
                        <ReferenceIcon2 sx={{ transform: 'scale(1.15)', ml: 0.5 }} />
                    </Stack>
                </Box>
            </div>
        </div>
    );
};

export default Legend;
