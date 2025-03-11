import React, { useState, useEffect } from "react";
import "./Title.css";
// import FormControl from '@mui/material/FormControl';
// import Select from '@mui/material/Select';
// import InputLabel from '@mui/material/InputLabel';
import { MenuItem, FormControl, Select, InputLabel } from "@mui/material";


const Title = () => {
    const [age, setAge] = React.useState('');

    const handleChange = (event) => {
        setAge(event.target.value);
    };

    return (
        <div className="title-container">
            <img src="./assets/img/logo.png" alt="Custom Icon" className="icon" />
            <span className="title">
                Chinese Ancient Paintings Authentication Interactive Visualization System
            </span>
            <div style={{ width: "150px", marginLeft: "1000px" }}>
                <FormControl fullWidth>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={age}
                        onChange={handleChange}
                        sx={{
                            height: '30px', // 自定义Select高度
                            backgroundColor: '#fef4eb',
                            fontWeight: 'bold', // 例如 'bold' 或者 700
                            fontFamily: 'Arial, sans-serif', // 替换为你希望使用的字体
                            // 如需调整内边距、字体大小等，可继续添加其他样式属性
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    backgroundColor: '#f0f0f0', // 自定义下拉菜单的背景颜色
                                },
                            },
                        }}
                    >
                        <MenuItem value={10}>简体中文</MenuItem>
                        <MenuItem value={20}>English</MenuItem>
                    </Select>
                </FormControl>
            </div>
        </div>

    );
}

export default Title;
