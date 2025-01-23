import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';


// 自定义图标组件
function PeopleIcon(props) {
    return (
    );
}

function SealIcon(props) {
    return (
    );
}

function PaintingIcon(props) {
    return (
    );
}

function QueryIcon(props) {
    return (
    );
}


export default function NestedList() {
    const [open1, setOpen1] = React.useState(false);
    const [open2, setOpen2] = React.useState(false);

    const handleClick1 = () => {
        setOpen1(!open1);
    };
    const handleClick2 = () => {
        setOpen2(!open2);
    };
    return (
        <div>
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
                        R&Q History
                    </ListSubheader>
                }
            >
                <ListItemButton onClick={handleClick1}>
                    <ListItemIcon>
                        <QueryIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="1st" />
                    {open1 ? (
                        <ExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <ExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>

                <ListItemButton onClick={handleClick2}>
                    <ListItemIcon>
                        <PaintingIcon sx={{ width: 30, height: 30 }} />
                    </ListItemIcon>
                    <ListItemText primary="艺术作品" />
                    {open2 ? (
                        <ExpandLess sx={{ color: '#000000' }} />
                    ) : (
                        <ExpandMore sx={{ color: '#000000' }} />
                    )}
                </ListItemButton>

            </List>
        </div>
    );
}
