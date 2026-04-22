import React, { useState } from "react";
import "./Title.css";
import Button from "@mui/material/Button";
import MapIcon from "@mui/icons-material/Map";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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

  const handleGoBack = () => {
    window.history.back();
  };

  const isChinese = language === LANG_ZH;

  return (
    <div className="title-container">
      <div className="title-left">
        <span className="title">{t(language, "titleMain")}</span>
      </div>

      {onToggleFullGraph && (
        <div style={{ marginLeft: "20px", marginRight: "20px" }}>
          <Button
            variant={isFullGraphMode ? "contained" : "outlined"}
            startIcon={isFullGraphMode ? <CloseFullscreenIcon /> : <MapIcon />}
            onClick={handleToggle}
            sx={{
              backgroundColor: isFullGraphMode ? "#D19762" : "transparent",
              color: isFullGraphMode ? "white" : "#8a6746",
              borderColor: "#D19762",
              fontWeight: "bold",
              fontSize: "13px",
              padding: "6px 16px",
              "&:hover": {
                backgroundColor: isFullGraphMode
                  ? "#b8804e"
                  : "rgba(209, 151, 98, 0.1)",
                borderColor: "#D19762",
              },
            }}
          >
            {isFullGraphMode
              ? t(language, "exitFullGraph")
              : t(language, "enterFullGraph")}
          </Button>
        </div>
      )}

      <div className="title-right-tools">
        <div
          className={`lang-switch ${isChinese ? "zh-active" : "en-active"}`}
          onClick={handleLanguageToggle}
          title={t(language, "langToggle")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleLanguageToggle();
            }
          }}
        >
          <span className={`lang-switch-label left ${isChinese ? "active" : ""}`}>
            中文
          </span>

          <div className="lang-switch-track">
            <div className="lang-switch-thumb" />
          </div>

          <span className={`lang-switch-label right ${!isChinese ? "active" : ""}`}>
            EN
          </span>
        </div>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
          sx={{
            width: "100px",
            color: "#8a6746",
            borderColor: "#D19762",
            fontWeight: "bold",
            fontSize: "13px",
            padding: "6px 14px",
            backgroundColor: "#fef4eb",
            "&:hover": {
              backgroundColor: "rgb(246, 211, 153)",
              borderColor: "#e6bb93",
            },
          }}
        >
          {t(language, "return")}
        </Button>
      </div>
    </div>
  );
};

export default Title;