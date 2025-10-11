// Copyright (c) Meta Platforms, Inc. and affiliates.
// All rights reserved.

// This source code is licensed under the license found in the
// LICENSE file in the root directory of this source tree.

import { Tensor } from "onnxruntime-web";

export interface modelScaleProps {
  samScale: number;
  height: number;
  width: number;
}

export interface modelInputProps {
  x: number;
  y: number;
  clickType: number;
}

export interface modeDataProps {
  clicks?: Array<modelInputProps>;
  tensor: Tensor;
  modelScale: modelScaleProps;
}

// export interface ToolProps {
//   handleMouseMove: (e: any) => void;
// }

// export interface ToolProps {
//   handleMouseMove: (e: any) => void;     // 先保留，后面可选启用 hover 预览
//   handleClick: (e: any) => void;         // ✨ 新增：点击追加点
//   handleMouseLeave?: () => void;         // 可选：离开时不清空最终 mask
// }

export interface ToolProps {
  handleMouseMove: (e: any) => void;
  handleClick: (e: any) => void;
  handleMouseLeave: () => void;
  currentLabel: 0 | 1 | null; // ← 新增：用来区分是否处于“仅预览”模式
}
