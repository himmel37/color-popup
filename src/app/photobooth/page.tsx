"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MEMBERS = [
  { id: "sion", name: "시온", color: "#7c6dfa", label: "SION · PURPLE" },
  { id: "riku", name: "리쿠", color: "#f06240", label: "RIKU · ORANGE" },
  { id: "yuushi", name: "유우시", color: "#4ab8e8", label: "YUUSHI · BLUE" },
  { id: "jaehee", name: "재희", color: "#3db87a", label: "JAEHEE · GREEN" },
  { id: "ryo", name: "료", color: "#f0b429", label: "RYO · YELLOW" },
  { id: "sakuya", name: "사쿠야", color: "#e8609a", label: "SAKUYA · PINK" },
];

export default function PhotoboothPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [selectedMember, setSelectedMember] = useState(MEMBERS[0]);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [timerOn, setTimerOn] = useState(false);
  const [shotIndex, setShotIndex] = useState(0);
  const [shots, setShots] = useState<string[]>([]);
  const [shooting, setShooting] = useState(false);
  const [showStrip, setShowStrip] = useState(false);
  const [camError, setCamError] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [facingMode]);

  async function startCamera() {
    try {
      stopCamera();
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setCamError(false);
    } catch {
      setCamError(true);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function flipCamera() {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
  }

  function startCountdown() {
    if (shooting) return;
    setShooting(true);
    const delay = timerOn ? 5 : 3;
    let count = delay;
    setCountdownNum(count);
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdownNum(null);
        captureShot();
      } else {
        setCountdownNum(count);
      }
    }, 1000);
  }

  function applyDuotone(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    hex: string,
  ) {
    const data = ctx.getImageData(0, 0, w, h);
    const d = data.data;
    const r2 = parseInt(hex.slice(1, 3), 16);
    const g2 = parseInt(hex.slice(3, 5), 16);
    const b2 = parseInt(hex.slice(5, 7), 16);
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      const t = (gray / 255) ** 2;
      d[i] = Math.min(255, Math.round(t * 255 + (1 - t) * r2 * 0.7 + 18));
      d[i + 1] = Math.min(255, Math.round(t * 255 + (1 - t) * g2 * 0.7 + 18));
      d[i + 2] = Math.min(255, Math.round(t * 255 + (1 - t) * b2 * 0.85 + 18));
    }
    ctx.putImageData(data, 0, 0);
  }

  function captureShot() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 720;
    const h = video.videoHeight || 960;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;

    if (facingMode === "user") {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    if (facingMode === "user") ctx.setTransform(1, 0, 0, 1, 0, 0);

    applyDuotone(ctx, w, h, selectedMember.color);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const newShots = [...shots, dataUrl];
    setShots(newShots);
    setShotIndex(newShots.length);
    setShooting(false);

    if (newShots.length >= 4) {
      setTimeout(() => setShowStrip(true), 300);
    }
  }

  function retake() {
    setShots([]);
    setShotIndex(0);
    setShowStrip(false);
  }

  async function saveStrip() {
    const fc = document.createElement("canvas");
    const gap = 6,
      pad = 6,
      footerH = 52,
      sw = 540,
      sh = 720;
    fc.width = sw * 2 + gap + pad * 2;
    fc.height = sh * 2 + gap + pad * 2 + footerH;
    const ctx = fc.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, fc.width, fc.height);

    const positions = [
      [pad, pad],
      [pad + sw + gap, pad],
      [pad, pad + sh + gap],
      [pad + sw + gap, pad + sh + gap],
    ];
    for (let i = 0; i < shots.length; i++) {
      await new Promise<void>((res) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, positions[i][0], positions[i][1], sw, sh);
          res();
        };
        img.src = shots[i];
      });
    }

    const fy = sh * 2 + gap + pad * 2;
    const barW = fc.width / MEMBERS.length;
    MEMBERS.forEach((m, i) => {
      ctx.fillStyle = m.color;
      ctx.fillRect(i * barW, fy, barW, 4);
    });
    ctx.fillStyle = "#111";
    ctx.font = "bold 22px Georgia, serif";
    ctx.textAlign = "left";
    ctx.fillText("COLOR booth", pad + 4, fy + 34);
    ctx.fillStyle = "#aaa";
    ctx.font = "13px Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(selectedMember.label, fc.width - pad - 4, fy + 34);

    const link = document.createElement("a");
    link.download = `color-booth-${selectedMember.id}-4cut.jpg`;
    link.href = fc.toDataURL("image/jpeg", 0.93);
    link.click();
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#08080f", padding: "24px 16px" }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* 헤더 */}
        <div className="text-center" style={{ marginBottom: 20 }}>
          <p
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              color: "var(--muted)",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            NCT WISH · 2nd Mini Album
          </p>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            COLOR{" "}
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>booth</span>
          </h1>
          <p
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 6,
              letterSpacing: "0.04em",
            }}
          >
            멤버를 선택하고 4컷 사진을 찍어보세요
          </p>
        </div>

        {/* 멤버 선택 */}
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 10,
          }}
        >
          멤버 선택
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 6,
            marginBottom: 14,
          }}
        >
          {MEMBERS.map((m) => (
            <button
              key={m.id}
              onClick={() => !shooting && setSelectedMember(m)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  border: `2px solid ${selectedMember.id === m.id ? m.color : "transparent"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform:
                    selectedMember.id === m.id ? "scale(1.12)" : "scale(1)",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: m.color,
                    opacity: selectedMember.id === m.id ? 1 : 0.7,
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 8,
                  color:
                    selectedMember.id === m.id ? "var(--text)" : "var(--muted)",
                  letterSpacing: "0.04em",
                }}
              >
                {m.name}
              </span>
            </button>
          ))}
        </div>

        {/* 진행 점 */}
        {!showStrip && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 7,
              marginBottom: 10,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background:
                    i < shotIndex
                      ? selectedMember.color
                      : i === shotIndex
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.12)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        )}

        {/* 카메라 뷰 */}
        {!showStrip && (
          <div
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              background: "#000",
              aspectRatio: "3/4",
              marginBottom: 10,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* 컬러 필터 오버레이 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: selectedMember.color,
                mixBlendMode: "color",
                opacity: 0.42,
                pointerEvents: "none",
                transition: "background 0.4s",
              }}
            />
            {/* 흰끼 오버레이 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.2)",
                mixBlendMode: "screen",
                pointerEvents: "none",
              }}
            />

            {/* 프레임 코너 */}
            {[
              ["top:12px;left:12px", "borderWidth:1.5px 0 0 1.5px"],
              ["top:12px;right:12px", "borderWidth:1.5px 1.5px 0 0"],
              ["bottom:12px;left:12px", "borderWidth:0 0 1.5px 1.5px"],
              ["bottom:12px;right:12px", "borderWidth:0 1.5px 1.5px 0"],
            ].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 22,
                  height: 22,
                  borderColor: "rgba(255,255,255,0.55)",
                  borderStyle: "solid",
                  ...[
                    { top: 12, left: 12, borderWidth: "1.5px 0 0 1.5px" },
                    { top: 12, right: 12, borderWidth: "1.5px 1.5px 0 0" },
                    { bottom: 12, left: 12, borderWidth: "0 0 1.5px 1.5px" },
                    { bottom: 12, right: 12, borderWidth: "0 1.5px 1.5px 0" },
                  ][i],
                }}
              />
            ))}

            {/* 상태 표시 */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                fontSize: 8,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
                background: "rgba(0,0,0,0.32)",
                padding: "3px 10px",
                borderRadius: 100,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#f06060",
                  marginRight: 4,
                  verticalAlign: "middle",
                  animation: "blink 1.2s infinite",
                }}
              />
              LIVE
            </div>
            <div
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                background: "rgba(0,0,0,0.32)",
                padding: "3px 10px",
                borderRadius: 100,
              }}
            >
              {Math.min(shotIndex + 1, 4)} / 4
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 9,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.8)",
                background: "rgba(0,0,0,0.28)",
                padding: "4px 12px",
                borderRadius: 100,
                border: "0.5px solid rgba(255,255,255,0.18)",
                whiteSpace: "nowrap",
              }}
            >
              {selectedMember.label}
            </div>

            {/* 카운트다운 */}
            {countdownNum !== null && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.22)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: 90,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                  }}
                >
                  {countdownNum}
                </span>
              </div>
            )}

            {/* 카메라 에러 */}
            {camError && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  color: "var(--muted)",
                  fontSize: 12,
                }}
              >
                <span style={{ fontSize: 28, opacity: 0.4 }}>📷</span>
                카메라 권한을 허용해주세요
              </div>
            )}
          </div>
        )}

        {/* 4컷 스트립 결과 */}
        {showStrip && (
          <div
            style={{
              borderRadius: 14,
              overflow: "hidden",
              marginBottom: 10,
              background: "#fff",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 3,
                background: "#fff",
                padding: 3,
              }}
            >
              {shots.map((src, i) => (
                <div key={i} style={{ aspectRatio: "3/4", overflow: "hidden" }}>
                  <img
                    src={src}
                    alt={`shot ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#fff",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#111",
                }}
              >
                COLOR booth
              </span>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#999",
                }}
              >
                {selectedMember.label}
              </span>
            </div>
          </div>
        )}

        {/* 컨트롤 */}
        {!showStrip && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              marginBottom: 10,
            }}
          >
            <button
              onClick={flipCamera}
              style={{
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                color: "var(--muted)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ⟳
            </button>
            <button
              onClick={startCountdown}
              disabled={shooting}
              style={{
                width: 62,
                height: 62,
                borderRadius: "50%",
                background: selectedMember.color,
                border: "3px solid rgba(255,255,255,0.2)",
                cursor: shooting ? "not-allowed" : "pointer",
                opacity: shooting ? 0.4 : 1,
                transition: "background 0.4s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.45)",
                }}
              />
            </button>
            <button
              onClick={() => setTimerOn((t) => !t)}
              style={{
                background: "var(--surface)",
                border: "0.5px solid var(--border)",
                color: timerOn ? selectedMember.color : "var(--muted)",
                width: 40,
                height: 40,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ⏱
            </button>
          </div>
        )}

        {/* 완료 후 액션 */}
        {showStrip && (
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <button
              onClick={retake}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 100,
                background: "transparent",
                border: "0.5px solid var(--border)",
                color: "var(--muted)",
                fontFamily: "var(--font-dm-sans)",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              다시 찍기
            </button>
            <button
              onClick={saveStrip}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 100,
                background: selectedMember.color,
                border: "none",
                color: "#fff",
                fontFamily: "var(--font-dm-sans)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.4s",
              }}
            >
              저장하기
            </button>
          </div>
        )}

        {/* 컬러 스트립 */}
        <div
          style={{
            display: "flex",
            height: 2,
            borderRadius: 1,
            overflow: "hidden",
            opacity: 0.35,
            marginBottom: 16,
          }}
        >
          {MEMBERS.map((m) => (
            <div key={m.id} style={{ flex: 1, background: m.color }} />
          ))}
        </div>

        {/* 뒤로가기 */}
        <div className="text-center">
          <button
            onClick={() => {
              stopCamera();
              router.push("/hall");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            ← Back to Hall
          </button>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
      `}</style>
    </main>
  );
}
