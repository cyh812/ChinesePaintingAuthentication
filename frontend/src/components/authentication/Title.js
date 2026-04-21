import React, { useState, useEffect } from "react";
import "./Title.css";
import Button from '@mui/material/Button';
import MapIcon from '@mui/icons-material/Map';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { LANG_EN, LANG_ZH, t } from "../../i18n/texts";


const Title = ({
    onToggleFullGraph = null,
    language = LANG_ZH,
    onLanguageChange,
}) => {
    const [isFullGraphMode, setIsFullGraphMode] = useState(false);

    const handleToggle = () => {
        const newMode = !isFullGraphMode;
        setIsFullGraphMode(newMode);
        if (onToggleFullGraph) {
            onToggleFullGraph(newMode);
        }
    };

    const handleLanguageToggle = () => {
        const nextLanguage = language === LANG_ZH ? LANG_EN : LANG_ZH;
        if (onLanguageChange) {
            onLanguageChange(nextLanguage);
        }
    };

    return (
        <div className="title-container">
            <div className="title-left">
                <span className="title">
                    {t(language, "titleMain")}
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
                    {isFullGraphMode ? t(language, "exitFullGraph") : t(language, "enterFullGraph")}
                </Button>
            </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                <div className="lang">
                <button
                    onClick={handleLanguageToggle}
                    title={t(language, "langToggle")}
                    style={{
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
                    color: 'rgba(0, 0, 0, 0.87)',
                    cursor: 'pointer'
                }}>
                    {t(language, "langLabel")}
                </button>
                </div>
            </div>
        </div>

    );
}

export default Title;
