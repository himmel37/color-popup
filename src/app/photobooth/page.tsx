"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const MEMBERS = [
  { id: "sion", name: "시온", color: "#7c6dfa", label: "SION · PURPLE" },
  { id: "riku", name: "리쿠", color: "#d45353", label: "RIKU · RED" },
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
      if (videoRef.current) videoRef.current.srcObject = s;
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

      // 대비 강화 — S커브
      const normalized = gray / 255;
      const contrasted =
        normalized < 0.5
          ? 2 * normalized * normalized
          : 1 - Math.pow(-2 * normalized + 2, 2) / 2;

      const t = contrasted;
      d[i] = Math.min(255, Math.round(r2 + t * (255 - r2)));
      d[i + 1] = Math.min(255, Math.round(g2 + t * (255 - g2)));
      d[i + 2] = Math.min(255, Math.round(b2 + t * (255 - b2)));
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
    if (newShots.length >= 4) setTimeout(() => setShowStrip(true), 300);
  }

  function retake() {
    setShots([]);
    setShotIndex(0);
    setShowStrip(false);
    startCamera();
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

    // footer
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
      style={{ background: "#08080f", padding: "32px 16px" }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* 헤더 */}
        <div className="text-center" style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 8,
              letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            NCT WISH · 2nd Mini Album
          </p>
          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: 10,
            }}
          >
            COLOR{" "}
            <span style={{ fontStyle: "italic", fontWeight: 400 }}>booth</span>
          </h1>
          <div
            style={{
              width: 40,
              height: 1.5,
              background: selectedMember.color,
              margin: "0 auto 10px",
              borderRadius: 1,
              transition: "background 0.4s",
            }}
          />
          <p
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.08em",
            }}
          >
            멤버를 선택하고 4컷 사진을 찍어보세요
          </p>
        </div>

        {/* 멤버 선택 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 8,
            marginBottom: 24,
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
                gap: 6,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: `1.5px solid ${selectedMember.id === m.id ? m.color : "transparent"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform:
                    selectedMember.id === m.id ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.2s, border-color 0.2s",
                  background:
                    selectedMember.id === m.id ? `${m.color}15` : "transparent",
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: m.color,
                    opacity: selectedMember.id === m.id ? 1 : 0.5,
                    transition: "opacity 0.2s",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 9,
                  color:
                    selectedMember.id === m.id
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.3)",
                  letterSpacing: "0.04em",
                  transition: "color 0.2s",
                }}
              >
                {m.name}
              </span>
            </button>
          ))}
        </div>

        {/* 진행 상태 */}
        {!showStrip && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: i < shotIndex ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  background:
                    i < shotIndex
                      ? selectedMember.color
                      : i === shotIndex
                        ? "rgba(255,255,255,0.5)"
                        : "rgba(255,255,255,0.1)",
                  transition: "all 0.3s ease",
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
              borderRadius: 4,
              overflow: "hidden",
              background: "#000",
              aspectRatio: "3/4",
              marginBottom: 16,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${selectedMember.color}20`,
              transition: "box-shadow 0.5s ease",
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
                transform: facingMode === "user" ? "scaleX(-1)" : "none",
              }}
            />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* 컬러 필터 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: selectedMember.color,
                mixBlendMode: "multiply",
                opacity: 0.6,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.0)", // ← screen 오버레이 제거
                mixBlendMode: "screen",
                pointerEvents: "none",
              }}
            />

            {/* 필름 그레인 */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")",
                backgroundSize: "200px 200px",
                opacity: 0.4,
                pointerEvents: "none",
                mixBlendMode: "overlay",
              }}
            />

            {/* 상단 REC + 컷 수 */}
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 14,
                right: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 8,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#ff6b6b",
                    animation: "blink 1.2s infinite",
                  }}
                />
                REC
              </div>
              <span
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.04em",
                }}
              >
                {Math.min(shotIndex + 1, 4)}
                <span style={{ opacity: 0.4 }}>/4</span>
              </span>
            </div>

            {/* 하단 멤버 라벨 + 날짜 */}
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                right: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {selectedMember.label}
              </span>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: selectedMember.color,
                  opacity: 0.8,
                  letterSpacing: "0.06em",
                }}
              ></span>
            </div>

            {/* 프레임 코너 */}
            {[
              { top: 10, left: 10, borderWidth: "1px 0 0 1px" },
              { top: 10, right: 10, borderWidth: "1px 1px 0 0" },
              { bottom: 10, left: 10, borderWidth: "0 0 1px 1px" },
              { bottom: 10, right: 10, borderWidth: "0 1px 1px 0" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 16,
                  height: 16,
                  borderColor: "rgba(255,255,255,0.3)",
                  borderStyle: "solid",
                  ...s,
                }}
              />
            ))}

            {/* 카운트다운 */}
            {countdownNum !== null && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(0,0,0,0.18)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: 100,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1,
                    textShadow: `0 0 40px ${selectedMember.color}`,
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
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 12,
                  background: "#0a0a0f",
                }}
              >
                <span style={{ fontSize: 32, opacity: 0.3 }}>📷</span>
                카메라 권한을 허용해주세요
              </div>
            )}
          </div>
        )}

        {/* 4컷 스트립 결과 */}
        {showStrip && (
          <div
            style={{
              borderRadius: 4,
              overflow: "hidden",
              marginBottom: 16,
              background: "#fff",
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${selectedMember.color}25`,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                background: "#e8e8e8",
                padding: 2,
              }}
            >
              {shots.map((src, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "3/4",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
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
            <div style={{ background: "#fff", padding: "10px 14px 8px" }}>
              <div
                style={{
                  display: "flex",
                  height: 2,
                  borderRadius: 1,
                  overflow: "hidden",
                  marginBottom: 8,
                }}
              >
                {MEMBERS.map((m) => (
                  <div key={m.id} style={{ flex: 1, background: m.color }} />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-playfair)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  COLOR <em style={{ fontWeight: 400 }}>booth</em>
                </span>
                <span
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#999",
                  }}
                >
                  {selectedMember.label}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 컨트롤 버튼 */}
        {!showStrip && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <button
              onClick={flipCamera}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                width: 44,
                height: 44,
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: 18,
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
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "transparent",
                border: `2px solid ${selectedMember.color}`,
                cursor: shooting ? "not-allowed" : "pointer",
                opacity: shooting ? 0.4 : 1,
                transition: "border-color 0.4s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: selectedMember.color,
                  transition: "background 0.4s",
                  boxShadow: `0 0 20px ${selectedMember.color}60`,
                }}
              />
            </button>

            <button
              onClick={() => setTimerOn((t) => !t)}
              style={{
                background: timerOn
                  ? `${selectedMember.color}20`
                  : "rgba(255,255,255,0.06)",
                border: `0.5px solid ${timerOn ? selectedMember.color + "60" : "rgba(255,255,255,0.1)"}`,
                color: timerOn ? selectedMember.color : "rgba(255,255,255,0.5)",
                width: 44,
                height: 44,
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
          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button
              onClick={retake}
              style={{
                flex: 1,
                padding: "13px 0",
                borderRadius: 100,
                background: "transparent",
                border: "0.5px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.4)",
                fontSize: 12,
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              다시 찍기
            </button>
            <button
              onClick={saveStrip}
              style={{
                flex: 2,
                padding: "13px 0",
                borderRadius: 100,
                background: selectedMember.color,
                border: "none",
                color: "#fff",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "background 0.4s",
                boxShadow: `0 8px 24px ${selectedMember.color}50`,
              }}
            >
              저장하기
            </button>
          </div>
        )}

        {/* 하단 컬러 스트립 */}
        <div
          style={{
            display: "flex",
            height: 3,
            borderRadius: 2,
            overflow: "hidden",
            opacity: 0.5,
            marginBottom: 20,
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
              color: "rgba(255,255,255,0.25)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              cursor: "pointer",
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
