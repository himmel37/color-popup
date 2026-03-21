"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TOTAL_PHOTOS = 38;
const PHOTOS = Array.from(
  { length: TOTAL_PHOTOS },
  (_, i) => `/gallery/photo_${String(i + 1).padStart(2, "0")}.webp`,
);

type ScrapItem = {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  frame: "polaroid" | "tape" | "torn" | "plain";
};

type CropState = { x: number; y: number; w: number; h: number };

function CropPreview({
  src,
  crop,
  frame,
}: {
  src: string;
  crop: CropState;
  frame: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 });

  const cropW = crop.w || 1;
  const cropH = crop.h || 1;

  // 실제 이미지 비율 기반으로 crop 픽셀 비율 계산
  const pixelW = cropW * naturalSize.w;
  const pixelH = cropH * naturalSize.h;
  const aspectRatio = pixelW / pixelH;

  const previewW = 140;
  const previewH = Math.round(previewW / aspectRatio);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !src) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });

      const sx = crop.x * img.naturalWidth;
      const sy = crop.y * img.naturalHeight;
      const sw = cropW * img.naturalWidth;
      const sh = cropH * img.naturalHeight;

      const pw = previewW;
      const ph = Math.round(pw / (sw / sh));

      canvas.width = pw;
      canvas.height = ph;
      ctx.clearRect(0, 0, pw, ph);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, pw, ph);
    };
    img.src = src;
  }, [src, crop]);

  return (
    <div
      style={{
        ...getFrameStyle(frame),
        width: previewW,
        display: "inline-block",
        overflow: "hidden", // ← 핵심
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
      {frame === "polaroid" && (
        <div
          style={{
            height: 36,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "#bbb",
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
            }}
          >
            COLOR
          </span>
        </div>
      )}
    </div>
  );
}

function getFrameStyle(frame: string): React.CSSProperties {
  switch (frame) {
    case "polaroid":
      return {
        background: "#fff",
        padding: "8px 8px 0",
        boxShadow: "3px 5px 16px rgba(0,0,0,0.25)",
        borderRadius: 2,
        overflow: "hidden", // ← 추가
      };
    case "tape":
      return {
        background: "#fff",
        boxShadow: "3px 5px 16px rgba(0,0,0,0.2)",
        borderRadius: 2,
        overflow: "hidden", // ← 추가
      };
    case "torn":
      return {
        background: "#fff",
        boxShadow: "3px 5px 16px rgba(0,0,0,0.2)",
        overflow: "hidden", // ← 추가
        clipPath:
          "polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 1% 99%, 0% 96%)",
      };
    default:
      return {
        borderRadius: 8,
        boxShadow: "3px 5px 16px rgba(0,0,0,0.2)",
        overflow: "hidden",
      };
  }
}

function ScrapItemComponent({
  item,
  isSelected,
  onMouseDown,
  onDelete,
}: {
  item: ScrapItem;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onDelete: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 폴라로이드: 상단 패딩 8px, 좌우 패딩 8px, 하단 텍스트 40px
  const padTop = item.frame === "polaroid" ? 8 : 0;
  const padSide = item.frame === "polaroid" ? 8 : 0;
  const textH = item.frame === "polaroid" ? 40 : 0;
  const canvasW = item.w - padSide * 2;
  const canvasH = item.h - padTop - textH;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const sx = item.cropX * img.naturalWidth;
      const sy = item.cropY * img.naturalHeight;
      const sw = item.cropW * img.naturalWidth;
      const sh = item.cropH * img.naturalHeight;
      canvas.width = canvasW;
      canvas.height = canvasH;
      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvasW, canvasH);
    };
    img.src = item.src;
  }, [item, canvasW, canvasH]);

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, item.id)}
      style={{
        position: "absolute",
        left: item.x,
        top: item.y,
        width: item.w,
        height: item.h,
        transform: `rotate(${item.rotation}deg)`,
        cursor: "grab",
        userSelect: "none",
        zIndex: isSelected ? 100 : 1,
      }}
    >
      {/* 프레임 */}
      {item.frame === "polaroid" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#fff",
            boxShadow: "3px 5px 16px rgba(0,0,0,0.25)",
            borderRadius: 2,
            outline: isSelected ? "2px solid #7c6dfa" : "none",
            outlineOffset: 2,
            display: "flex",
            flexDirection: "column",
            padding: `${padTop}px ${padSide}px 0`,
            boxSizing: "border-box",
          }}
        >
          <div style={{ overflow: "hidden", flex: 1 }}>
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", height: "100%" }}
            />
          </div>
          <div
            style={{
              height: textH,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "#bbb",
                fontStyle: "italic",
                fontFamily: "Georgia, serif",
              }}
            >
              COLOR
            </span>
          </div>
        </div>
      )}

      {item.frame === "tape" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#fff",
            boxShadow: "3px 5px 16px rgba(0,0,0,0.2)",
            borderRadius: 2,
            overflow: "hidden",
            outline: isSelected ? "2px solid #7c6dfa" : "none",
            outlineOffset: 2,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -10,
              left: "50%",
              transform: "translateX(-50%)",
              width: 48,
              height: 20,
              background: "rgba(255,240,180,0.7)",
              borderRadius: 2,
              zIndex: 10,
            }}
          />
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      )}

      {item.frame === "torn" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#fff",
            boxShadow: "3px 5px 16px rgba(0,0,0,0.2)",
            overflow: "hidden",
            outline: isSelected ? "2px solid #7c6dfa" : "none",
            outlineOffset: 2,
            clipPath:
              "polygon(0% 2%, 2% 0%, 98% 1%, 100% 3%, 99% 97%, 97% 100%, 1% 99%, 0% 96%)",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      )}

      {item.frame === "plain" && (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 8,
            boxShadow: "3px 5px 16px rgba(0,0,0,0.2)",
            overflow: "hidden",
            outline: isSelected ? "2px solid #7c6dfa" : "none",
            outlineOffset: 2,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      )}

      {/* × 버튼 */}
      {isSelected && (
        <button
          onMouseDown={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "#e03030",
            border: "2px solid #fff",
            color: "#fff",
            fontSize: 13,
            cursor: "pointer",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function GalleryPage() {
  const router = useRouter();
  const [view, setView] = useState<"gallery" | "crop" | "scrapbook">("gallery");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [cropState, setCropState] = useState<CropState>({
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  });
  const [cropDragging, setCropDragging] = useState(false);
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [selectedFrame, setSelectedFrame] = useState<
    "polaroid" | "tape" | "torn" | "plain"
  >("polaroid");
  const [scrapItems, setScrapItems] = useState<ScrapItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const scrapRef = useRef<HTMLDivElement>(null);

  const addToScrapbook = useCallback(() => {
    if (!selectedPhoto) return;

    const img = new window.Image();
    img.onload = () => {
      const cw = cropState.w || 1;
      const ch = cropState.h || 1;

      const pixelW = cw * img.naturalWidth;
      const pixelH = ch * img.naturalHeight;
      const aspectRatio = pixelW / pixelH;

      const padSide = selectedFrame === "polaroid" ? 8 : 0;
      const padTop = selectedFrame === "polaroid" ? 8 : 0;
      const textH = selectedFrame === "polaroid" ? 40 : 0;

      // 캔버스 너비 기준으로 높이 계산
      const canvasW = 200;
      const canvasH = Math.round(canvasW / aspectRatio);

      // 전체 아이템 크기 = 캔버스 + 패딩
      const totalW = canvasW + padSide * 2;
      const totalH = canvasH + padTop + textH;

      const newItem: ScrapItem = {
        id: `item_${Date.now()}`,
        src: selectedPhoto,
        x: 80 + Math.random() * 300,
        y: 60 + Math.random() * 200,
        w: totalW,
        h: totalH,
        rotation: (Math.random() - 0.5) * 14,
        cropX: cropState.x,
        cropY: cropState.y,
        cropW: cw,
        cropH: ch,
        frame: selectedFrame,
      };
      setScrapItems((prev) => [...prev, newItem]);
      setView("scrapbook");
    };
    img.src = selectedPhoto;
  }, [selectedPhoto, cropState, selectedFrame]);

  const saveScrapbook = useCallback(async () => {
    const el = scrapRef.current;
    if (!el) return;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, { useCORS: true });
    const link = document.createElement("a");
    link.download = `color-scrapbook-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    const item = scrapItems.find((i) => i.id === id);
    if (!item) return;
    setDraggingId(id);
    setSelectedItemId(id);
    setDragOffset({ x: e.clientX - item.x, y: e.clientY - item.y });
    e.stopPropagation(); // ← 추가 (캔버스 클릭으로 선택 해제 방지)
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingId) return;
      setScrapItems((prev) =>
        prev.map((item) =>
          item.id === draggingId
            ? {
                ...item,
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
              }
            : item,
        ),
      );
    },
    [draggingId, dragOffset],
  );

  const handleMouseUp = useCallback(() => setDraggingId(null), []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#08080f",
        color: "#f0f0ff",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 40px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          position: "sticky",
          top: 0,
          background: "rgba(8,8,15,0.9)",
          backdropFilter: "blur(12px)",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {view !== "gallery" && (
            <button
              onClick={() =>
                setView(view === "scrapbook" ? "gallery" : "gallery")
              }
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              ←
            </button>
          )}
          <div>
            <p
              style={{
                fontSize: 9,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 4,
              }}
            >
              NCT WISH · COLOR
            </p>
            <h1
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              {view === "gallery"
                ? "Gallery"
                : view === "crop"
                  ? "Crop Photo"
                  : "Scrapbook"}
            </h1>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {view === "scrapbook" && (
            <>
              <button
                onClick={() => setView("gallery")}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.6)",
                  padding: "8px 16px",
                  borderRadius: 100,
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                + 사진 추가
              </button>
              <button
                onClick={saveScrapbook}
                style={{
                  background: "#7c6dfa",
                  border: "none",
                  color: "#fff",
                  padding: "8px 20px",
                  borderRadius: 100,
                  fontSize: 11,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                저장하기
              </button>
            </>
          )}
          <button
            onClick={() => router.push("/hall")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ← Hall
          </button>
        </div>
      </div>

      {/* 갤러리 뷰 — 마소너리 */}
      {view === "gallery" && (
        <div style={{ padding: "32px 40px" }}>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 28,
            }}
          >
            사진을 클릭해서 스크랩북에 추가해보세요 ✦
          </p>
          <div style={{ columns: "5 180px", gap: 12 }}>
            {PHOTOS.map((src, i) => (
              <div
                key={i}
                onClick={() => {
                  setSelectedPhoto(src);
                  setCropState({ x: 0, y: 0, w: 1, h: 1 });
                  setView("crop");
                }}
                style={{
                  marginBottom: 12,
                  breakInside: "avoid",
                  borderRadius: 10,
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "0.5px solid rgba(255,255,255,0.07)",
                  transition: "transform 0.2s, border-color 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "scale(1.02)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "scale(1)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.07)";
                }}
              >
                <img
                  src={src}
                  alt={`photo ${i + 1}`}
                  style={{ width: "100%", display: "block" }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 크롭 뷰 */}
      {view === "crop" && selectedPhoto && (
        <div
          style={{
            padding: "32px 40px",
            display: "flex",
            gap: 40,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* 크롭 영역 */}
          <div style={{ flex: "1 1 400px", maxWidth: 520 }}>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 12,
                letterSpacing: "0.04em",
              }}
            >
              드래그해서 원하는 영역을 선택하세요
            </p>
            <div
              style={{
                position: "relative",
                width: "100%",
                borderRadius: 12,
                overflow: "hidden",
                cursor: "crosshair",
                userSelect: "none",
              }}
              onMouseDown={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                setCropStart({ x, y });
                setCropDragging(true);
                setCropState({ x, y, w: 0.01, h: 0.01 });
              }}
              onMouseMove={(e) => {
                if (!cropDragging) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.max(
                  0,
                  Math.min(1, (e.clientX - rect.left) / rect.width),
                );
                const y = Math.max(
                  0,
                  Math.min(1, (e.clientY - rect.top) / rect.height),
                );
                setCropState({
                  x: Math.min(cropStart.x, x),
                  y: Math.min(cropStart.y, y),
                  w: Math.max(0.05, Math.abs(x - cropStart.x)),
                  h: Math.max(0.05, Math.abs(y - cropStart.y)),
                });
              }}
              onMouseUp={() => setCropDragging(false)}
            >
              <img
                src={selectedPhoto}
                alt="crop target"
                style={{
                  width: "100%",
                  display: "block",
                  pointerEvents: "none",
                }}
              />

              {/* 선택 안 된 영역 어둡게 — 4개 div로 분할 */}
              {cropState.w > 0.01 && (
                <>
                  {/* 위 */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: `${cropState.y * 100}%`,
                      background: "rgba(0,0,0,0.55)",
                      pointerEvents: "none",
                    }}
                  />
                  {/* 아래 */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: `${(cropState.y + cropState.h) * 100}%`,
                      width: "100%",
                      bottom: 0,
                      height: `${(1 - cropState.y - cropState.h) * 100}%`,
                      background: "rgba(0,0,0,0.55)",
                      pointerEvents: "none",
                    }}
                  />
                  {/* 왼쪽 */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: `${cropState.y * 100}%`,
                      width: `${cropState.x * 100}%`,
                      height: `${cropState.h * 100}%`,
                      background: "rgba(0,0,0,0.55)",
                      pointerEvents: "none",
                    }}
                  />
                  {/* 오른쪽 */}
                  <div
                    style={{
                      position: "absolute",
                      left: `${(cropState.x + cropState.w) * 100}%`,
                      top: `${cropState.y * 100}%`,
                      width: `${(1 - cropState.x - cropState.w) * 100}%`,
                      height: `${cropState.h * 100}%`,
                      background: "rgba(0,0,0,0.55)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* 선택 영역 테두리 */}
                  <div
                    style={{
                      position: "absolute",
                      left: `${cropState.x * 100}%`,
                      top: `${cropState.y * 100}%`,
                      width: `${cropState.w * 100}%`,
                      height: `${cropState.h * 100}%`,
                      border: "1.5px solid #fff",
                      pointerEvents: "none",
                    }}
                  >
                    {/* 코너 핸들 */}
                    {[
                      [0, 0],
                      [100, 0],
                      [0, 100],
                      [100, 100],
                    ].map(([l, t], i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          left: `${l}%`,
                          top: `${t}%`,
                          width: 8,
                          height: 8,
                          background: "#fff",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setCropState({ x: 0, y: 0, w: 1, h: 1 })}
              style={{
                marginTop: 10,
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                padding: "8px 16px",
                borderRadius: 100,
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              전체 선택
            </button>
          </div>

          {/* 오른쪽 옵션 */}
          <div
            style={{
              flex: "0 0 240px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {/* 프레임 선택 */}
            <div>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 12,
                }}
              >
                프레임
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                {(
                  [
                    { id: "polaroid", label: "📷 폴라로이드" },
                    { id: "tape", label: "🖼️ 테이프" },
                    { id: "torn", label: "✂️ 찢은 종이" },
                    { id: "plain", label: "⬜ 심플" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFrame(f.id)}
                    style={{
                      background:
                        selectedFrame === f.id
                          ? "rgba(124,109,250,0.15)"
                          : "rgba(255,255,255,0.04)",
                      border: `0.5px solid ${selectedFrame === f.id ? "#7c6dfa" : "rgba(255,255,255,0.08)"}`,
                      color:
                        selectedFrame === f.id
                          ? "#fff"
                          : "rgba(255,255,255,0.45)",
                      padding: "10px 8px",
                      borderRadius: 10,
                      fontSize: 11,
                      cursor: "pointer",
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 미리보기 */}
            <div>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  marginBottom: 12,
                }}
              >
                미리보기
              </p>
              <CropPreview
                src={selectedPhoto}
                crop={cropState}
                frame={selectedFrame}
              />
            </div>

            <button
              onClick={addToScrapbook}
              style={{
                background: "#7c6dfa",
                border: "none",
                color: "#fff",
                padding: "13px",
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              스크랩북에 추가 →
            </button>
          </div>
        </div>
      )}

      {/* 스크랩북 뷰 */}
      {view === "scrapbook" && (
        <div style={{ padding: "24px 0" }}>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 16,
              paddingLeft: 40,
            }}
          >
            사진을 드래그해서 위치를 바꾸고, 클릭해서 선택 후 수정하세요
          </p>

          {/* 스크랩북 캔버스 — 풀 와이드 */}
          <div
            ref={scrapRef}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedItemId(null);
            }}
            style={{
              position: "relative",
              width: "100%",
              minHeight: 680,
              background: "#f2e0c4",
              backgroundImage: `
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E"),
                radial-gradient(ellipse at 15% 20%, rgba(220,160,80,0.2) 0%, transparent 55%),
                radial-gradient(ellipse at 85% 80%, rgba(180,130,90,0.15) 0%, transparent 55%)
              `,
              boxShadow: "inset 0 0 80px rgba(0,0,0,0.08)",
            }}
          >
            {/* 장식 선 */}
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 24,
                right: 24,
                height: 1,
                background: "rgba(150,100,60,0.15)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 24,
                left: 24,
                right: 24,
                height: 1,
                background: "rgba(150,100,60,0.15)",
              }}
            />

            {scrapItems.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  pointerEvents: "none",
                }}
              >
                <p
                  style={{
                    color: "rgba(120,80,40,0.4)",
                    fontSize: 16,
                    fontStyle: "italic",
                    fontFamily: "Georgia, serif",
                  }}
                >
                  갤러리에서 사진을 추가해보세요
                </p>
              </div>
            )}

            {scrapItems.map((item) => (
              <ScrapItemComponent
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onMouseDown={handleMouseDown}
                onDelete={(id) => {
                  setScrapItems((prev) => prev.filter((i) => i.id !== id));
                  setSelectedItemId(null);
                }}
              />
            ))}
          </div>

          {/* 하단 툴바 */}
          {selectedItemId && (
            <div
              style={{
                display: "flex",
                gap: 8,
                padding: "16px 40px",
                flexWrap: "wrap",
              }}
            >
              {[
                {
                  label: "↺ 회전",
                  action: () =>
                    setScrapItems((p) =>
                      p.map((i) =>
                        i.id === selectedItemId
                          ? { ...i, rotation: i.rotation - 5 }
                          : i,
                      ),
                    ),
                },
                {
                  label: "↻ 회전",
                  action: () =>
                    setScrapItems((p) =>
                      p.map((i) =>
                        i.id === selectedItemId
                          ? { ...i, rotation: i.rotation + 5 }
                          : i,
                      ),
                    ),
                },
                {
                  label: "+ 크게",
                  action: () =>
                    setScrapItems((p) =>
                      p.map((i) =>
                        i.id === selectedItemId
                          ? { ...i, w: i.w + 24, h: i.h + 24 }
                          : i,
                      ),
                    ),
                },
                {
                  label: "- 작게",
                  action: () =>
                    setScrapItems((p) =>
                      p.map((i) =>
                        i.id === selectedItemId
                          ? {
                              ...i,
                              w: Math.max(80, i.w - 24),
                              h: Math.max(80, i.h - 24),
                            }
                          : i,
                      ),
                    ),
                },
              ].map((btn) => (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.6)",
                    padding: "9px 16px",
                    borderRadius: 100,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  {btn.label}
                </button>
              ))}
              <button
                onClick={() => {
                  setScrapItems((p) =>
                    p.filter((i) => i.id !== selectedItemId),
                  );
                  setSelectedItemId(null);
                }}
                style={{
                  background: "rgba(224,48,48,0.12)",
                  border: "0.5px solid rgba(224,48,48,0.25)",
                  color: "#e03030",
                  padding: "9px 16px",
                  borderRadius: 100,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                🗑 삭제
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
