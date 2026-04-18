import React, { useContext, useEffect, useState } from "react";
import { InferenceSession } from "onnxruntime-web";
import { handleImageScale } from "../helpers/scaleHelper";
import { onnxMaskToImage } from "../helpers/maskUtils";
import { modelData } from "../helpers/onnxModelAPI";
import Stage from "../Stage";
import AppContext from "../hooks/createContext";
import StageMenu from "./StageMenu";
import "./PaintingDetailSAM.css";

const ort = require("onnxruntime-web");
/* @ts-ignore */
import npyjs from "npyjs";

// 后续可改成 props 传入
// const IMAGE_PATH = "../../assets/data/D011518.jpg";
// const IMAGE_EMBEDDING = "../../assets/data/D011518.npy";
const MODEL_DIR = "../../../model/sam_onnx_example.onnx";

const PaintingDetailSAM = ({ imagePath, embeddingPath, paintingId, onSegmentSearch }) => {
    const {
        clicks: [clicks, setClicks],
        image: [, setImage],
        maskImg: [, setMaskImg],
    } = useContext(AppContext);

    const [model, setModel] = useState(null);
    const [tensor, setTensor] = useState(null);
    const [modelScale, setModelScale] = useState(null);

    const [currentLabel, setCurrentLabel] = useState(1);
    const [hoverClick, setHoverClick] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(0.8);

    const [searchValue, setSearchValue] = useState(0);

    const handleSearchClick = (value) => {
        console.log("PaintingDetailSAM 搜索触发，当前值：", value);
        if (onSegmentSearch) {
            onSegmentSearch(value);
        }
    };

    const handleReset = () => {
        setClicks([]);
        setHoverClick(null);
        setMaskImg(null);
    };

    useEffect(() => {
        const initModel = async () => {
            try {
                if (!MODEL_DIR) return;
                const modelInstance = await InferenceSession.create(MODEL_DIR);
                setModel(modelInstance);
            } catch (e) {
                console.log(e);
            }
        };

        initModel();

        if (imagePath) {
            const url = new URL(imagePath, location.origin);
            loadImage(url);
        }

        if (embeddingPath) {
            Promise.resolve(loadNpyTensor(embeddingPath, "float32")).then((embedding) =>
                setTensor(embedding)
            );
        }
    }, [imagePath, embeddingPath]);

    const loadImage = async (url) => {
        try {
            const img = new Image();
            img.src = url.href;
            img.onload = () => {
                const { height, width, samScale } = handleImageScale(img);
                setModelScale({
                    height,
                    width,
                    samScale,
                });
                img.width = width;
                img.height = height;
                setImage(img);
            };
        } catch (error) {
            console.log(error);
        }
    };

    const loadNpyTensor = async (tensorFile, dType) => {
        const npLoader = new npyjs();
        const npArray = await npLoader.load(tensorFile);
        return new ort.Tensor(dType, npArray.data, npArray.shape);
    };

    useEffect(() => {
        runONNX();
    }, [clicks, hoverClick, model, tensor, modelScale]);

    const runONNX = async () => {
        try {
            if (model === null || tensor === null || modelScale === null) return;

            const mergedClicks = [...(clicks ?? [])];
            if (hoverClick) mergedClicks.push(hoverClick);

            if (mergedClicks.length === 0) {
                setMaskImg(null);
                return;
            }

            const feeds = modelData({
                clicks: mergedClicks,
                tensor,
                modelScale,
            });

            if (!feeds) return;

            const results = await model.run(feeds);
            const output = results[model.outputNames[0]];
            setMaskImg(onnxMaskToImage(output.data, output.dims[2], output.dims[3]));
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div className="painting-detail-sam">
            <div className="painting-detail-sam-body">
                <div className="painting-detail-sam-stage-area">
                    <div className="painting-detail-sam-stage-wrapper">
                        <Stage
                            zoomLevel={zoomLevel}
                            onZoomChange={setZoomLevel}
                            currentLabel={currentLabel}
                            onHoverChange={setHoverClick}
                            onHoverEnd={() => setHoverClick(null)}
                        />
                    </div>
                </div>

                <div className="painting-detail-sam-menu-area">
                    <StageMenu
                        currentLabel={currentLabel}
                        onChangeLabel={setCurrentLabel}
                        onReset={handleReset}
                        searchValue={searchValue}
                        onSearchValueChange={setSearchValue}
                        onSearchClick={handleSearchClick}
                    />
                </div>
            </div>
        </div>
    );
};

export default PaintingDetailSAM;