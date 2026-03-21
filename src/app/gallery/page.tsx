"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import HomeButton from "@/components/HomeButton";

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
            {/* ← Playfair로 변경 */}
            <span
              style={{
                fontSize: 11,
                color: "#aaa",
                fontFamily: "var(--font-playfair)",
                fontStyle: "italic",
                letterSpacing: "0.08em",
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
  const scrapRef = useRef<HTMLDivElement>(null);
  const scrapWrapperRef = useRef<HTMLDivElement>(null);

  const [modalPhoto, setModalPhoto] = useState<string | null>(null);
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

  const openModal = (src: string) => {
    setModalPhoto(src);
    setCropState({ x: 0, y: 0, w: 1, h: 1 });
  };

  const addToScrapbook = useCallback(() => {
    if (!modalPhoto) return;
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
      const canvasW = 200;
      const canvasH = Math.round(canvasW / aspectRatio);
      const totalW = canvasW + padSide * 2;
      const totalH = canvasH + padTop + textH;
      const newItem: ScrapItem = {
        id: `item_${Date.now()}`,
        src: modalPhoto,
        x: 80 + Math.random() * 400,
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
      setModalPhoto(null);
    };
    img.src = modalPhoto;
  }, [modalPhoto, cropState, selectedFrame]);

  const saveScrapbook = useCallback(async () => {
    const el = scrapRef.current;
    if (!el) return;

    setSelectedItemId(null);
    await new Promise((res) => setTimeout(res, 50));

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

    const scrap = scrapRef.current;
    if (!scrap) return;
    const rect = scrap.getBoundingClientRect();

    setDraggingId(id);
    setSelectedItemId(id);
    // ← 스크랩북 기준 상대 좌표로 offset 계산
    setDragOffset({
      x: e.clientX - rect.left - item.x,
      y: e.clientY - rect.top - item.y,
    });
    e.stopPropagation();
    e.preventDefault();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingId) return;
      const scrap = scrapRef.current;
      if (!scrap) return;
      const rect = scrap.getBoundingClientRect();

      setScrapItems((prev) => {
        const item = prev.find((i) => i.id === draggingId);
        if (!item) return prev;
        const newX = Math.max(
          0,
          Math.min(rect.width - item.w, e.clientX - dragOffset.x - rect.left),
        );
        const newY = Math.max(
          0,
          Math.min(rect.height - item.h, e.clientY - dragOffset.y - rect.top),
        );
        return prev.map((i) =>
          i.id === draggingId ? { ...i, x: newX, y: newY } : i,
        );
      });
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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#08080f",
        color: "#f0f0ff",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 32px 8px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          background: "rgba(8,8,15,0.9)",
          backdropFilter: "blur(12px)",
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 2,
            }}
          >
            NCT WISH · COLOR
          </p>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            Gallery
          </h1>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={saveScrapbook}
            style={{
              background: "#7c6dfa",
              border: "none",
              color: "#fff",
              padding: "7px 18px",
              borderRadius: 100,
              fontSize: 11,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            저장하기
          </button>
          <HomeButton />
        </div>
      </div>

      {/* 갤러리 썸네일 */}
      <div
        style={{
          flexShrink: 0,
          padding: "12px 32px 8px",
          borderBottom: "0.5px solid rgba(255,255,255,0.07)",
          background: "#08080f",
        }}
      >
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            // marginBottom: 10,
          }}
        >
          Gallery · 사진을 클릭해서 스크랩북에 추가하세요
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            overflowX: "auto",
            overflowY: "visible",
            paddingBottom: 12,
            paddingTop: 20,
            scrollbarWidth: "none",
            gap: 0,
          }}
        >
          {PHOTOS.map((src, i) => (
            <div
              key={i}
              onClick={() => openModal(src)}
              style={{
                flexShrink: 0,
                width: 110,
                height: 140,
                marginLeft: i === 0 ? 0 : -52,
                borderRadius: 10,
                overflow: "hidden",
                cursor: "pointer",
                border: "2px solid rgba(255,255,255,0.12)",
                transition:
                  "transform 0.25s ease, box-shadow 0.25s ease, margin 0.25s ease",
                position: "relative",
                zIndex: 1,
                boxShadow: "2px 4px 12px rgba(0,0,0,0.4)",
                transform: `rotate(${((i % 5) - 2) * 1.5}deg)`,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform =
                  "translateY(-28px) scale(1.12) rotate(0deg)";
                el.style.zIndex = "50";
                el.style.marginLeft = i === 0 ? "0px" : "-20px";
                el.style.boxShadow = "4px 12px 32px rgba(0,0,0,0.6)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = `rotate(${((i % 5) - 2) * 1.5}deg)`;
                el.style.zIndex = "1";
                el.style.marginLeft = i === 0 ? "0px" : "-52px";
                el.style.boxShadow = "2px 4px 12px rgba(0,0,0,0.4)";
              }}
            >
              <img
                src={src}
                alt={`photo ${i + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  pointerEvents: "none",
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 32px 16px",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* 4:3 래퍼 */}
        <div
          ref={scrapWrapperRef}
          style={{
            position: "relative",
            aspectRatio: "4/3",
            // width 대신 height 기준으로 맞추기
            height: "100%",
            maxWidth: "100%",
          }}
        >
          <div
            ref={scrapRef}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedItemId(null);
            }}
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              background: "#f2e0c4",
              backgroundImage: `...기존과 동일...`,
              //   borderRadius: 12,
            }}
          >
            {scrapItems.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <p
                  style={{
                    color: "rgba(120,80,40,0.4)",
                    fontSize: 15,
                    fontFamily: "var(--font-playfair)",
                    letterSpacing: "0.02em",
                  }}
                >
                  갤러리에서 스크랩할 사진을 골라보세요
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
        </div>

        {/* 툴바 — scrapRef 밖 */}
        {selectedItemId && (
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              justifyContent: "center",
            }}
          >
            {[
              {
                label: "↺",
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
                label: "↻",
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
                label: "+",
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
                label: "−",
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
                  background: "rgba(255,255,255,0.08)",
                  border: "0.5px solid rgba(255,255,255,0.15)",
                  color: "rgba(255,255,255,0.7)",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  fontSize: 15,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {btn.label}
              </button>
            ))}
            <button
              onClick={() => {
                setScrapItems((p) => p.filter((i) => i.id !== selectedItemId));
                setSelectedItemId(null);
              }}
              style={{
                background: "rgba(224,48,48,0.15)",
                border: "0.5px solid rgba(224,48,48,0.3)",
                color: "#e03030",
                width: 32,
                height: 32,
                borderRadius: "50%",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {/* 크롭 모달 */}
      {modalPhoto && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalPhoto(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              background: "#111118",
              borderRadius: 20,
              padding: 28,
              width: "100%",
              maxWidth: 860,
              maxHeight: "90vh",
              overflow: "auto",
              border: "0.5px solid rgba(255,255,255,0.1)",
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 1 380px" }}>
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
                  src={modalPhoto}
                  alt="crop"
                  style={{
                    width: "100%",
                    display: "block",
                    pointerEvents: "none",
                  }}
                />
                {cropState.w > 0.01 && (
                  <>
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
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: `${(cropState.y + cropState.h) * 100}%`,
                        width: "100%",
                        height: `${(1 - cropState.y - cropState.h) * 100}%`,
                        background: "rgba(0,0,0,0.55)",
                        pointerEvents: "none",
                      }}
                    />
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

            <div
              style={{
                flex: "0 0 200px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
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
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: "auto",
                }}
              >
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
                <button
                  onClick={() => setModalPhoto(null)}
                  style={{
                    background: "transparent",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.4)",
                    padding: "10px",
                    borderRadius: 100,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
