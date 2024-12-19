import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import { Icon } from "@mui/material"
import PeopleSvg from '../../assets/icon/people.svg';

// 自定义图标组件
function PeopleIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M14.2854 5.19648C14.261 5.04354 14.2265 4.89584 14.1828 4.75438H16.0166C16.123 4.75438 16.2093 4.6748 16.2093 4.57665C16.2093 4.4785 16.123 4.39892 16.0166 4.39891H14.0482C13.6776 3.58283 12.9786 3.04883 12.1958 3.04883C11.4131 3.04883 10.7141 3.58284 10.3435 4.39891H8.37544C8.26906 4.39891 8.18281 4.4785 8.18281 4.57665C8.18281 4.6748 8.26905 4.75438 8.37544 4.75438H10.2088C10.1652 4.89584 10.1306 5.04354 10.1063 5.19648L10.011 5.79337C7.03607 6.43352 6.43601 8.35381 6.43601 9.79028C6.43601 10.3979 6.59984 11.1972 6.83733 11.7514C6.83747 11.8232 6.83887 11.8953 6.84156 11.9678C6.65288 11.8361 6.46952 11.7876 6.3159 11.8414C5.87367 12.0001 5.81431 12.9445 6.18107 13.9507C6.54385 14.9463 7.18906 15.6283 7.62834 15.4863C7.65789 15.4936 7.687 15.4984 7.71555 15.5005C8.09545 16.3516 8.5766 17.0988 9.12817 17.6974C9.03728 17.6609 8.92825 17.6734 8.84984 17.7387C8.79484 17.7846 8.76351 17.8499 8.76351 17.9175V18.7693L5.35986 20.0231C7.28296 21.297 9.64379 22.0488 12.1957 22.0488C14.7478 22.0488 17.1085 21.297 19.0317 20.0231L15.6282 18.7693V17.9175C15.6282 17.8499 15.5967 17.7846 15.5417 17.7362C15.4776 17.6828 15.3928 17.6648 15.3142 17.68C15.8618 17.0794 16.3404 16.333 16.7213 15.4898C16.7315 15.4876 16.7419 15.4851 16.7522 15.4822C17.1918 15.6381 17.8453 14.9553 18.2115 13.9507C18.5781 12.9471 18.5161 12.0029 18.0767 11.8414C17.9645 11.8019 17.8398 11.8161 17.7084 11.8752L17.7309 11.827C17.9865 11.2719 18.1658 10.4261 18.1658 9.79028C18.1658 8.31952 17.5367 6.34013 14.3736 5.74906L14.2854 5.19648ZM14.5824 18.3621C13.8627 18.923 13.0616 19.2454 12.2285 19.2454C11.3112 19.2454 10.4293 18.8642 9.65257 18.2031L12.0838 20.701C12.121 20.7018 12.1583 20.7023 12.1957 20.7023C12.2331 20.7023 12.2704 20.7018 12.3075 20.701L14.5824 18.3621Z" />
        </SvgIcon>
    );
}

function SealIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M20.8263 17.5563H4.57994C3.82163 17.5563 3.20312 18.1769 3.20312 18.9331V20.4052H22.2031V18.9331C22.2031 18.1769 21.5825 17.5563 20.8263 17.5563ZM19.8287 15.2602H14.1901C14.0884 15.0187 14.0333 14.7667 14.0333 14.5061C14.0333 13.7161 14.2409 12.998 14.9802 12.4684C16.4544 11.6614 17.4521 10.0982 17.4521 8.29989C17.4521 5.67547 15.3254 3.54883 12.701 3.54883C10.0766 3.54883 7.94995 5.67547 7.94995 8.29989C7.94995 10.0982 8.94972 11.6614 10.4219 12.4684C11.1632 12.998 11.3687 13.7161 11.3687 14.5061C11.3687 14.7667 11.3136 15.0187 11.2119 15.2602H5.5776V16.9823H19.8287V15.2602ZM4.09276 20.6425H21.3135V20.9877H4.09276V20.6425Z" />
        </SvgIcon>
    );
}

function PaintingIcon(props) {
    return (
        <SvgIcon {...props}>
            <path d="M11.7457 8.64303C11.5443 8.4497 11.3067 8.29665 11.0348 8.18186C10.7609 8.06706 10.4709 8.00866 10.1648 8.00866C9.84863 8.00866 9.5546 8.06505 9.28072 8.18186C9.00683 8.29665 8.77121 8.4497 8.56982 8.64303C8.36843 8.83636 8.20732 9.06393 8.0885 9.32573C7.96767 9.58754 7.90927 9.86545 7.90927 10.1595C7.90927 10.4535 7.96969 10.7314 8.0885 10.9932C8.20934 11.255 8.36843 11.4846 8.56982 11.682C8.77121 11.8793 9.00884 12.0364 9.28072 12.1512C9.5546 12.266 9.84863 12.3244 10.1648 12.3244C10.4709 12.3244 10.7609 12.266 11.0348 12.1512C11.3087 12.0364 11.5443 11.8793 11.7457 11.682C11.9471 11.4846 12.1082 11.255 12.227 10.9932C12.3458 10.7314 12.4062 10.4535 12.4062 10.1595C12.4062 9.86545 12.3458 9.58754 12.227 9.32573C12.1082 9.06192 11.9471 8.83435 11.7457 8.64303ZM19.626 4.54883H5.18853C4.20374 4.54883 3.40625 5.3141 3.40625 6.25861V18.3721C3.40625 19.3166 4.20374 20.0818 5.18853 20.0818H19.624C20.6088 20.0818 21.4062 19.3166 21.4062 18.3721V6.25861C21.4083 5.3141 20.6108 4.54883 19.626 4.54883ZM19.6119 16.0299C19.4206 15.607 19.197 15.176 18.9433 14.735C18.6895 14.294 18.4116 13.8952 18.1095 13.5367C17.8075 13.1783 17.4792 12.8863 17.1248 12.6607C16.7703 12.4352 16.4018 12.3224 16.0171 12.3224C15.566 12.3224 15.1834 12.407 14.8672 12.5761C14.551 12.7473 14.2771 12.9588 14.0476 13.2165C13.818 13.4743 13.6105 13.7502 13.4293 14.0442C13.248 14.3383 13.0648 14.6142 12.8835 14.8719C12.7023 15.1297 12.5029 15.3432 12.2874 15.5124C12.0719 15.6815 11.8162 15.7661 11.5181 15.7661C11.2201 15.7661 10.9663 15.746 10.7569 15.7037C10.5454 15.6614 10.3561 15.609 10.189 15.5446C10.0218 15.4801 9.86474 15.4096 9.72176 15.3311C9.57877 15.2526 9.42169 15.1821 9.25454 15.1176C9.08739 15.0532 8.89607 15.0008 8.67857 14.9585C8.46308 14.9162 8.20732 14.8961 7.90927 14.8961C7.65955 14.8961 7.41386 14.9585 7.16816 15.0814C6.92449 15.2062 6.68685 15.3633 6.45727 15.5567C6.22769 15.75 6.00616 15.9655 5.79672 16.2051C5.58526 16.4448 5.39394 16.6824 5.22075 16.9221V7.03395C5.22075 6.61103 5.57922 6.26868 6.02026 6.26868H18.8124C19.2534 6.26868 19.6119 6.61103 19.6119 7.03395V16.0299Z" />
        </SvgIcon>
    );
}

export default function NestedList() {
    const [open1, setOpen1] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);
    const [open3, setOpen3] = React.useState(false);

    const handleClick1 = () => {
        setOpen1(!open1);
    };
    const handleClick2 = () => {
        setOpen2(!open2);
    };
    const handleClick3 = () => {
        setOpen3(!open3);
    };
    return (
        <div
            style={{
                position: 'absolute', // 悬浮效果
                top: '10px',          // 距离顶部 10px
                right: '10px',         // 距离左侧 10px
                zIndex: 1000,         // 确保在其他内容之上
                backgroundColor: '#ffffff', // 背景颜色
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)', // 添加阴影
                borderRadius: '8px', // 圆角
                padding: '8px',      // 内边距
                width: '300px',      // 设置菜单宽度
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
                    <ListSubheader component="div" id="nested-list-subheader">
                        统计列表
                    </ListSubheader>
                }
            >
                <ListItemButton onClick={handleClick1}>
                    <ListItemIcon>
                        <PeopleIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Sent mail" />
                    {open1 ? (
                        <ExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <ExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>
                <Collapse in={open1} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <StarBorder />
                            </ListItemIcon>
                            <ListItemText primary="Starred" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                    </List>
                </Collapse>

                <ListItemButton onClick={handleClick2}>
                    <ListItemIcon>
                        <PaintingIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Drafts" />
                    {open2 ? (
                        <ExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <ExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>
                <Collapse in={open2} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <StarBorder />
                            </ListItemIcon>
                            <ListItemText primary="Starred" />
                            {/* 添加删除按钮 */}
                            <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemButton>
                    </List>
                </Collapse>

                <ListItemButton onClick={handleClick3}>
                    <ListItemIcon>
                        <SealIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="Inbox" />
                    {open3 ? (
                        <ExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <ExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>
                <Collapse in={open3} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton sx={{ pl: 4 }}>
                            <ListItemIcon>
                                <StarBorder />
                            </ListItemIcon>
                            <ListItemText primary="Starred" />
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
