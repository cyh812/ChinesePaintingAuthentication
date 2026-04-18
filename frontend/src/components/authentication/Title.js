import React, { useState, useEffect } from "react";
import "./Title.css";
import Button from '@mui/material/Button';
import MapIcon from '@mui/icons-material/Map';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';


const Title = ({ onToggleFullGraph = null }) => {
    const [isFullGraphMode, setIsFullGraphMode] = useState(false);

    const handleToggle = () => {
        const newMode = !isFullGraphMode;
        setIsFullGraphMode(newMode);
        if (onToggleFullGraph) {
            onToggleFullGraph(newMode);
        }
    };

    return (
        <div className="title-container">
            <div className="title-left">
                <img src="./assets/img/logo.png" alt="Custom Icon" className="icon" />
                <span className="title">
                    Chinese Ancient Paintings Authentication Interactive Visualization System
                </span>
            </div>
            
            {/* 总图切换按钮 - 仅在提供回调时显示 */}
            {onToggleFullGraph && (
                <div style={{ marginLeft: '20px', marginRight: '20px' }}>
                    <Button
                        variant={isFullGraphMode ? "contained" : "outlined"}
                    startIcon={isFullGraphMode ? <CloseFullscreenIcon /> : <MapIcon />}
                    onClick={handleToggle}
                    sx={{
                        backgroundColor: isFullGraphMode ? '#D19762' : 'transparent',
                        color: isFullGraphMode ? 'white' : '#8a6746',
                        borderColor: '#D19762',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        padding: '6px 16px',
                        '&:hover': {
                            backgroundColor: isFullGraphMode ? '#b8804e' : 'rgba(209, 151, 98, 0.1)',
                            borderColor: '#D19762'
                        }
                    }}
                >
                    {isFullGraphMode ? '退出总图' : '查看总图'}
                </Button>
            </div>
            )}

            <div className="lang">
                <div style={{
                    height: '30px',
                    backgroundColor: '#fef4eb',
                    fontWeight: 'bold',
                    fontFamily: 'Arial, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 16px',
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 0, 0, 0.23)',
                    fontSize: '14px',
                    color: 'rgba(0, 0, 0, 0.87)'
                }}>
                    简体中文
                </div>
            </div>
        </div>

    );
}

export default Title;
