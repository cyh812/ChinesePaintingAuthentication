// src/components/helpers/exportMask.ts
export type ExportMode = "highlight" | "cutout";

/**
 * 将当前 mask 与原图合成并导出 PNG
 * @param image 原图（HTMLImageElement）
 * @param maskImg 掩码图（HTMLImageElement），可为灰度/黑白；若非透明 alpha，函数会自动将亮度转 alpha
 * @param filename 下载文件名
 * @param mode 导出模式：highlight（外部变暗）或 cutout（外部透明）
 */
export async function exportMaskedPNG(
  image: HTMLImageElement,
  maskImg: HTMLImageElement,
  filename = "segment.png",
  mode: ExportMode = "highlight"
) {
  const w = image.width;
  const h = image.height;

  // 主画布
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // 先准备一个“仅保留 mask 区域的原图”图层
  const brightOnMask = document.createElement("canvas");
  brightOnMask.width = w;
  brightOnMask.height = h;
  const bctx = brightOnMask.getContext("2d")!;

  // 1) 画一张正常亮度的原图
  bctx.clearRect(0, 0, w, h);
  bctx.drawImage(image, 0, 0, w, h);

  // 2) 用 mask 作为 alpha：destination-in 需要 mask 的“alpha”生效
  // 如果你的 mask PNG 外部是透明、内部不透明，那么下面这两行就够了：
  // bctx.globalCompositeOperation = "destination-in";
  // bctx.drawImage(maskImg, 0, 0, w, h);

  // 为了兼容“黑白不带透明”的 mask，这里做一次把亮度转 alpha 的处理：
  const mCanvas = document.createElement("canvas");
  mCanvas.width = w;
  mCanvas.height = h;
  const mctx = mCanvas.getContext("2d")!;
  mctx.drawImage(maskImg, 0, 0, w, h);
  const mdata = mctx.getImageData(0, 0, w, h);
  const d = mdata.data;
  // 将 mask 的亮度映射到 alpha（假设 mask 为黑白/灰度）
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const luma = (r + g + b) / 3; // 简单平均值即可
    d[i + 3] = luma; // 用亮度当 alpha
    d[i] = 255; d[i + 1] = 255; d[i + 2] = 255; // 颜色无所谓，关键是 alpha
  }
  mctx.putImageData(mdata, 0, 0);

  // 把处理好的“有 alpha 的 mask”打到 brightOnMask 上
  bctx.globalCompositeOperation = "destination-in";
  bctx.drawImage(mCanvas, 0, 0, w, h);
  bctx.globalCompositeOperation = "source-over";

  if (mode === "cutout") {
    // 只导出被 mask 的区域（外面透明）
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(brightOnMask, 0, 0);
  } else {
    // highlight：底层画一张“变暗的原图”，再把 brightOnMask 覆盖上去
    ctx.save();
    ctx.filter = "brightness(0.45)";
    ctx.drawImage(image, 0, 0, w, h);
    ctx.restore();
    ctx.drawImage(brightOnMask, 0, 0);
  }

  // 触发下载
  canvas.toBlob((blob) => {
    if (!blob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}


                    // <List component="div" disablePadding>
                    //     <ListItemButton sx={{ pl: 4 }}>
                    //         <ListItemIcon>
                    //             <PaintingIcon />
                    //         </ListItemIcon>
                    //         <ListItemText primary="秋林人醉图" />
                    //         {/* 添加删除按钮 */}
                    //         <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                    //             <DeleteIcon />
                    //         </IconButton>
                    //     </ListItemButton>
                    //     <ListItemButton sx={{ pl: 4 }}>
                    //         <ListItemIcon>
                    //             <PaintingIcon />
                    //         </ListItemIcon>
                    //         <ListItemText primary="江南春霭图" />
                    //         {/* 添加删除按钮 */}
                    //         <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                    //             <DeleteIcon />
                    //         </IconButton>
                    //     </ListItemButton>
                    //     <ListItemButton sx={{ pl: 4 }}>
                    //         <ListItemIcon>
                    //             <PaintingIcon />
                    //         </ListItemIcon>
                    //         <ListItemText primary="太白诗意山水图" />
                    //         {/* 添加删除按钮 */}
                    //         <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                    //             <DeleteIcon />
                    //         </IconButton>
                    //     </ListItemButton>
                    //     <ListItemButton sx={{ pl: 4 }}>
                    //         <ListItemIcon>
                    //             <PaintingIcon />
                    //         </ListItemIcon>
                    //         <ListItemText primary="古木垂阴图" />
                    //         {/* 添加删除按钮 */}
                    //         <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                    //             <DeleteIcon />
                    //         </IconButton>
                    //     </ListItemButton>
                    //     <ListItemButton sx={{ pl: 4 }}>
                    //         <ListItemIcon>
                    //             <PaintingIcon />
                    //         </ListItemIcon>
                    //         <ListItemText primary="山林乐事图" />
                    //         {/* 添加删除按钮 */}
                    //         <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                    //             <DeleteIcon />
                    //         </IconButton>
                    //     </ListItemButton>
                    //     <ListItemButton sx={{ pl: 4 }}>
                    //         <ListItemIcon>
                    //             <PaintingIcon />
                    //         </ListItemIcon>
                    //         <ListItemText primary="长干图" />
                    //         {/* 添加删除按钮 */}
                    //         <IconButton edge="end" aria-label="delete" onClick={() => alert('删除')}>
                    //             <DeleteIcon />
                    //         </IconButton>
                    //     </ListItemButton>
                    // </List>