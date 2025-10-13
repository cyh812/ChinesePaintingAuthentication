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
import IconButton from '@mui/material/IconButton';
import SvgIcon from '@mui/material/SvgIcon';

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

function QueryIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M15.7175 13.9926V5.76758C15.7175 4.94008 15.045 4.26758 14.2175 4.26758H4.40747C3.57997 4.26758 2.90747 4.94008 2.90747 5.76758V13.9951C2.90747 14.8226 3.57997 15.4951 4.40747 15.4951H5.62497V16.8351C5.62497 17.1176 5.78247 17.3751 6.03497 17.5026C6.14247 17.5576 6.25997 17.5851 6.37497 17.5851C6.52997 17.5851 6.68497 17.5376 6.81497 17.4426L9.49997 15.4926H14.2175C15.045 15.4926 15.7175 14.8201 15.7175 13.9926Z" fill="#566A96" />
            <path d="M20.5925 7.54248H16.575V15.2025C16.575 15.755 16.1275 16.2025 15.575 16.2025H11.27V17.195C11.27 18.0225 11.9425 18.695 12.77 18.695H15.0175L17.6925 20.595C17.8225 20.6875 17.975 20.735 18.1275 20.735C18.2575 20.735 18.3875 20.7025 18.505 20.6325C18.74 20.4975 18.8775 20.24 18.8775 19.97V18.8025H20.5925C21.42 18.8025 22.0925 18.13 22.0925 17.3025V9.04248C22.0925 8.21498 21.42 7.54248 20.5925 7.54248Z" fill="#566A96" />
        </SvgIcon>
    );
}

function MyExpandMore() {
    return (
        <ExpandMore
            sx={{
                color: '#FFFFFF',
                backgroundColor: '#6275AC', // 你可以根据需要设置背景颜色
                borderRadius: '50%',
            }}
        />
    );
}

function MyExpandLess() {
    return (
        <ExpandLess
            sx={{
                color: '#FFFFFF',
                backgroundColor: '#6275AC', // 你可以根据需要设置背景颜色
                borderRadius: '50%',
            }}
        />
    );
}


export default function NestedList() {
    // 有缩放的round
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);
    const [open4, setOpen4] = React.useState(false);
    const [open5, setOpen5] = React.useState(false);
    const [open6, setOpen6] = React.useState(false);

    // 每个round的显示
    const [query1, setquery1] = React.useState(false); // 控制第一个按钮显示
    const [query2, setquery2] = React.useState(false); // 控制第二个按钮显示
    const [query3, setquery3] = React.useState(false); // 
    const [query4, setquery4] = React.useState(false); // 
    const [query5, setquery5] = React.useState(false); // 
    const [query6, setquery6] = React.useState(false); // 

    // 每个轮次的对话回答
    const [text1, setText1] = React.useState('');
    const [text2, setText2] = React.useState('');
    const [text3, setText3] = React.useState('');
    const [text4, setText4] = React.useState('');
    const [text5, setText5] = React.useState('');
    const [text6, setText6] = React.useState('');

    // 逐字显示的对话控制
    const [text1Index, setText1Index] = React.useState(0);
    const [text2Index, setText2Index] = React.useState(0);
    const [text3Index, setText3Index] = React.useState(0);
    const [text4Index, setText4Index] = React.useState(0);
    const [text5Index, setText5Index] = React.useState(0);
    const [text6Index, setText6Index] = React.useState(0);

    // 对话框的显示控制
    const [showquery1, setshowquery1] = React.useState(false);
    const [showquery2, setshowquery2] = React.useState(false);
    const [showquery3, setshowquery3] = React.useState(false);
    const [showquery4, setshowquery4] = React.useState(false);
    const [showquery5, setshowquery5] = React.useState(false);
    const [showquery6, setshowquery6] = React.useState(false);

    const message1 = "我可以通过图像匹配、印章匹配以及文本资料检索等功能，帮助您进行中国古画的鉴定。通过比对画作的图像特征、印章信息及历史文献资料，我可以提供辅助判断，帮助您确认画作的作者、创作时间、艺术风格等关键信息。";
    const message2 = `根据图像匹配模块的结果，以下几幅画作与您提供的片段存在相似之处：                                               《兰竹<十八开>》 石涛 (清代)                                                 《山水花卉<十二开>》 石涛 (清代)                                         《山水<十开>》 石涛 (清代)                                           《古木垂阴图》 石涛 (清代)                                              《山林乐事图》 石涛 (清代)                                             《长干图》 石涛 (清代)                                                    这些画作的某些部分与您的片段非常相似，可能是相同或类似的艺术元素。`;
    const message3 = "石涛与张景蔚（字少文、号鹤野、别号借亭）交谊深厚，艺术唱和往来频繁。康熙三十二年，石涛为张景蔚作《仿倪黄笔意图》，张氏回以《书画合璧》跋文，盛赞其“笔墨极平而极奇”，认为石涛“得古人之精微，不所缚”，可见推重之深。同年，石涛又在题跋中记“与张少文史君客学公有声阁，拈笔作倪、黄焦墨法”，自叙合作情景。张景蔚为辽阳人，号莲泊居士，斋名“鹤野书屋”“莲泊山房”，其印鉴多见于石涛诸作，如《萱榴图》《书画合璧》《余杭看山图》等，均为上海博物馆藏。石涛在《山水十开》中亦记张氏来访、观画、唱和之事，可见二人诗画往还密切，为石涛晚年重要的友人与鉴赏者之一。"
    const message4 = "根据印章“清湘老人”的匹配结果，在石涛的《花果图》《花卉（十二开）》《山水花卉（十二开）》等作品中均用过此印章，此外，系统检测到更多使用该印章的作品，您可以继续查阅数据库获取更多相关画作及完整信息。"
    const message5 = "根据相关资料，大涤堂的建立时间和地点可以追溯到以下信息：                                                                         1.大涤堂与石涛在扬州大东门外的活动密切相关，且大涤子号的产生与康熙三十一年（1692年）冬石涛回到扬州有关。                                                                2.石涛在康熙三十三年（1694年）正式在作品上使用“大涤子”款，并在康熙三十五年（1696年）后大量使用，期间也出现了“大涤堂”印章。                                                         因此，大涤堂大致建成时间应为康熙三十年代初期，地点为扬州大东门外。"
    const message6 = "根据相关资料，大涤草堂确实出现在石涛的其他作品中，以下是一些例子：                                                       1.《东岑嫩绿图》：题款中提到“写于大涤草堂”，表明该作品创作于康熙三十五年（1696）以后。                                                        2.《江南春霭图》：题款中提到“大涤堂下”，明确标明该作品与大涤堂有关。                                                          3.《为拱北作山水》：这幅画曾被记录为“大涤堂图”，并且题跋中提到“大涤堂下”。                                                 因此，石涛在多个作品中提到大涤草堂，特别是在他晚期的作品中。"
    const typingSpeed = 100; // 每个字符的显示速度，单位是毫秒

    const handleClick2 = () => {
        setOpen2(!open2);
    };
    const handleClick3 = () => {
        setOpen3(!open3);
    };
    const handleClick4 = () => {
        setOpen4(!open4);
    };
    const handleClick5 = () => {
        setOpen5(!open5);
    };
    const handleClick6 = () => {
        setOpen6(!open6);
    };

    // 当鼠标进入时，启动逐字显示
    const handleMouseEnter1 = () => {
        setshowquery1(true);
    };

    const handleMouseEnter2 = () => {
        setshowquery2(true);
    };

    const handleMouseEnter3 = () => {
        setshowquery3(true);
    };

    const handleMouseEnter4 = () => {
        setshowquery4(true);
    };

    const handleMouseEnter5 = () => {
        setshowquery5(true);
    };

    const handleMouseEnter6 = () => {
        setshowquery6(true);
    };

    // 当鼠标离开时，停止逐字显示
    const handleMouseLeave1 = () => {
        setText1(''); // 重置文本
        setText1Index(0); // 重置显示位置
    };

    const handleMouseLeave2 = () => {
        setText2(''); // 重置文本
        setText2Index(0); // 重置显示位置
    };

    const handleMouseLeave3 = () => {
        setText3(''); // 重置文本
        setText3Index(0); // 重置显示位置
    };

    const handleMouseLeave4 = () => {
        setText4(''); // 重置文本
        setText4Index(0); // 重置显示位置
    };

    const handleMouseLeave5 = () => {
        setText5(''); // 重置文本
        setText5Index(0); // 重置显示位置
    };

    const handleMouseLeave6 = () => {
        setText6(''); // 重置文本
        setText6Index(0); // 重置显示位置
    };

    // 逐字显示文本
    React.useEffect(() => {
        if (query1 && showquery1 && text1Index < message1.length) {
            const interval1 = setInterval(() => {
                setText1((prevText) => prevText + message1[text1Index]);
                setText1Index((prevIndex) => prevIndex + 1);
            }, typingSpeed);
            return () => clearInterval(interval1);
        }
    }, [query1, showquery1, text1Index]);

    React.useEffect(() => {
        if (query2 && showquery2 && text2Index < message2.length) {
            const interval2 = setInterval(() => {
                setText2((prevText) => prevText + message2[text2Index]);
                setText2Index((prevIndex) => prevIndex + 1);
            }, 10);
            return () => clearInterval(interval2);
        }
    }, [query2, showquery2, text2Index]);

    React.useEffect(() => {
        if (query3 && showquery3 && text3Index < message3.length) {
            const interval3 = setInterval(() => {
                setText3((prevText) => prevText + message3[text3Index]);
                setText3Index((prevIndex) => prevIndex + 1);
            }, typingSpeed);
            return () => clearInterval(interval3);
        }
    }, [query3, showquery3, text3Index]);

    React.useEffect(() => {
        if (query4 && showquery4 && text4Index < message4.length) {
            const interval4 = setInterval(() => {
                setText4((prevText) => prevText + message4[text4Index]);
                setText4Index((prevIndex) => prevIndex + 1);
            }, typingSpeed);
            return () => clearInterval(interval4);
        }
    }, [query4, showquery4, text4Index]);

    React.useEffect(() => {
        if (query5 && showquery5 && text5Index < message5.length) {
            const interval5 = setInterval(() => {
                setText5((prevText) => prevText + message5[text5Index]);
                setText5Index((prevIndex) => prevIndex + 1);
            }, 20);
            return () => clearInterval(interval5);
        }
    }, [query5, showquery5, text5Index]);

    React.useEffect(() => {
        if (query6 && showquery6 && text6Index < message6.length) {
            const interval6 = setInterval(() => {
                setText6((prevText) => prevText + message6[text6Index]);
                setText6Index((prevIndex) => prevIndex + 1);
            }, 20);
            return () => clearInterval(interval6);
        }
    }, [query6, showquery6, text6Index]);

    // 监听键盘事件
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === '3') {
                // if (!query1) {
                //     setquery1(true);
                // }
                if (!query2) {
                    setquery2(true)
                }
                else if (!query3) {
                    setquery3(true)
                }
                else if (!query4) {
                    setquery4(true)
                }
                else if (!query5) {
                    setquery5(true)
                }
                else if (!query6) {
                    setquery6(true)
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [query1, query2, query3, query4, query5, query6]);

    return (
        <div
            style={{
                position: 'absolute', // 悬浮效果
                top: '20px',          // 距离顶部 10px
                right: '20px',         // 距离左侧 10px
                zIndex: 1000,         // 确保在其他内容之上
                backgroundColor: '#ffffff', // 背景颜色
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', // 添加阴影
                borderRadius: '8px', // 圆角
                padding: '8px',      // 内边距
                width: '330px',      // 设置菜单宽度
            }}
        >
            <List
                sx={{
                    width: '100%', maxWidth: 360, bgcolor: 'background.paper', '& .MuiListItemText-primary': {
                        color: '#000000', // 设置文本颜色为黑色
                    },
                }}
                component="nav"
                aria-labelledby="nested-list-subheaderX"
                subheader={
                    <ListSubheader component="div" id="nested-list-subheader" style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'black'
                    }}>
                        R&Q History
                    </ListSubheader>
                }
            >
                {query1 && (<ListItemButton
                    onMouseEnter={handleMouseEnter1}
                    onMouseLeave={handleMouseLeave1}
                    sx={{
                        position: 'relative',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                            '&::after': {
                                content: `"${text1}"`, // 动态显示文本
                                position: 'absolute',
                                top: '50%',
                                color: 'black',
                                left: '-420px', // 左侧显示文本框
                                transform: 'translateY(-50%)',
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                visibility: 'visible',
                                opacity: 1,
                                width: '400px', // 设置对话框宽度
                                wordWrap: 'break-word', // 自动换行
                                whiteSpace: 'normal', // 保证文本能够正常换行
                                transition: 'visibility 0s, opacity 0.3s ease', // 平滑过渡
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <QueryIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Round 1" />
                    {/* {open1 ? (
                        <ExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <ExpandMore sx={{ color: '#000000' }} />
                    )} */}
                </ListItemButton>)}

                {query2 && (<ListItemButton onClick={handleClick2}
                    onMouseEnter={handleMouseEnter2}
                    onMouseLeave={handleMouseLeave2}
                    sx={{
                        position: 'relative',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                            '&::after': {
                                content: `"${text2}"`, // 动态显示文本
                                position: 'absolute',
                                top: '50%',
                                color: 'black',
                                left: '-420px', // 左侧显示文本框
                                transform: 'translateY(-50%)',
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                visibility: 'visible',
                                opacity: 1,
                                width: '400px', // 设置对话框宽度
                                wordWrap: 'break-word', // 自动换行
                                whiteSpace: 'pre-wrap', // 保证文本能够正常换行
                                transition: 'visibility 0s, opacity 0.3s ease', // 平滑过渡
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <QueryIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Round 1" />
                    {open2 ? (
                        <MyExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <MyExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>)}
                <Collapse in={open2} timeout="auto" unmountOnExit>

                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="余杭看山图" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="兰竹<十八开>" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="山水<十开>" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="山水花卉<十二开>" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <SealIcon />
                            </ListItemIcon>
                            <ListItemText primary="前有龙眠济(余杭看山图)" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <SealIcon />
                            </ListItemIcon>
                            <ListItemText primary="前有龙眠济(山水花卉<十二开>)" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <SealIcon />
                            </ListItemIcon>
                            <ListItemText primary="前有龙眠济(山水<十开>)" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <SealIcon />
                            </ListItemIcon>
                            <ListItemText primary="前有龙眠济(兰竹图)" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                                                <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PeopleIcon/>
                            </ListItemIcon>
                            <ListItemText primary="石涛" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                    </List>
                </Collapse>

                {query3 && (<ListItemButton onClick={handleClick3}
                    onMouseEnter={handleMouseEnter3}
                    onMouseLeave={handleMouseLeave3}
                    sx={{
                        position: 'relative',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                            '&::after': {
                                content: `"${text3}"`, // 动态显示文本
                                position: 'absolute',
                                top: '50%',
                                color: 'black',
                                left: '-420px', // 左侧显示文本框
                                transform: 'translateY(-50%)',
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                visibility: 'visible',
                                opacity: 1,
                                width: '400px', // 设置对话框宽度
                                wordWrap: 'break-word', // 自动换行
                                whiteSpace: 'normal', // 保证文本能够正常换行
                                transition: 'visibility 0s, opacity 0.3s ease', // 平滑过渡
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <QueryIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Round 2" />
                    {open3 ? (
                        <MyExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <MyExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>)}
                <Collapse in={open3} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <SealIcon />
                            </ListItemIcon>
                            <ListItemText primary="清湘老人" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <SealIcon />
                            </ListItemIcon>
                            <ListItemText primary="膏盲子济" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <SealIcon />
                            </ListItemIcon>
                            <ListItemText primary="唐云审定" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PeopleIcon />
                            </ListItemIcon>
                            <ListItemText primary="石涛" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                    </List>
                </Collapse>

                {query4 && (<ListItemButton onClick={handleClick4}
                    onMouseEnter={handleMouseEnter4}
                    onMouseLeave={handleMouseLeave4}
                    sx={{
                        position: 'relative',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                            '&::after': {
                                content: `"${text4}"`, // 动态显示文本
                                position: 'absolute',
                                top: '50%',
                                color: 'black',
                                left: '-420px', // 左侧显示文本框
                                transform: 'translateY(-50%)',
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                visibility: 'visible',
                                opacity: 1,
                                width: '400px', // 设置对话框宽度
                                wordWrap: 'break-word', // 自动换行
                                whiteSpace: 'normal', // 保证文本能够正常换行
                                transition: 'visibility 0s, opacity 0.3s ease', // 平滑过渡
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <QueryIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Round 4" />
                    {open4 ? (
                        <MyExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <MyExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>)}
                <Collapse in={open4} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="花果图" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="对菊图" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="花卉（十二开）" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="山水花卉（十二开）" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                    </List>
                </Collapse>

                {query5 && (<ListItemButton onClick={handleClick5}
                    onMouseEnter={handleMouseEnter5}
                    onMouseLeave={handleMouseLeave5}
                    sx={{
                        position: 'relative',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                            '&::after': {
                                content: `"${text5}"`, // 动态显示文本
                                position: 'absolute',
                                top: '50%',
                                color: 'black',
                                left: '-420px', // 左侧显示文本框
                                transform: 'translateY(-50%)',
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                visibility: 'visible',
                                opacity: 1,
                                width: '400px', // 设置对话框宽度
                                wordWrap: 'break-word', // 自动换行
                                whiteSpace: 'pre-wrap', // 保证文本能够正常换行
                                transition: 'visibility 0s, opacity 0.3s ease', // 平滑过渡
                            },
                        },
                    }}
                >
                    <ListItemIcon>
                        <QueryIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Round 5" />
                    {open5 ? (
                        <MyExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <MyExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>)}
                <Collapse in={open5} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="余杭看山图" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                    </List>
                </Collapse>


                {query6 && (<ListItemButton
                    onClick={handleClick6}
                    onMouseEnter={handleMouseEnter6}
                    onMouseLeave={handleMouseLeave6}
                    sx={{
                        position: 'relative',
                        '&:hover': {
                            backgroundColor: '#f5f5f5',
                            '&::after': {
                                content: `"${text6}"`, // 动态显示文本
                                position: 'absolute',
                                top: '50%',
                                color: 'black',
                                left: '-420px', // 左侧显示文本框
                                transform: 'translateY(-50%)',
                                backgroundColor: '#f0f0f0',
                                padding: '8px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                visibility: 'visible',
                                opacity: 1,
                                width: '400px', // 设置对话框宽度
                                wordWrap: 'break-word', // 自动换行
                                whiteSpace: 'pre-wrap', // 保证文本能够正常换行
                                transition: 'visibility 0s, opacity 0.3s ease', // 平滑过渡
                            },
                        },
                    }}>
                    <ListItemIcon>
                        <QueryIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Round 6" />
                    {open6 ? (
                        <MyExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <MyExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>)}
                <Collapse in={open6} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="东岑嫩绿图" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <PaintingIcon />
                            </ListItemIcon>
                            <ListItemText primary="为拱北作山水" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                    </List>
                </Collapse>
            </List>
        </div>
    );
}
