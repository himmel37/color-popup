"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EntryPage() {
  const router = useRouter();
  const [entering, setEntering] = useState(false);

  const handleEnter = () => {
    setEntering(true);
    setTimeout(() => router.push("/hall"), 1200);
  };

  return (
    <main
      className={`relative w-full overflow-hidden transition-opacity duration-1000 ${entering ? "opacity-0" : "opacity-100"}`}
      style={{ minHeight: "100vh", background: "#08080f" }}
    >
      {/* 풀스크린 이미지 */}
      <div className="absolute inset-0">
        <Image
          src="/main.webp"
          alt="NCT WISH COLOR"
          fill
          style={{ objectFit: "cover", objectPosition: "center top" }}
          priority
        />
        {/* 하단 그라디언트 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(8,8,15,0.96) 0%, rgba(8,8,15,0.55) 40%, rgba(8,8,15,0.05) 70%)",
          }}
        />
        {/* 좌우 그라디언트 (데스크탑에서 자연스럽게) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to right, rgba(8,8,15,0.3) 0%, transparent 30%, transparent 70%, rgba(8,8,15,0.3) 100%)",
          }}
        />
      </div>

      {/* 콘텐츠 */}
      <div
        className="relative z-10 flex flex-col justify-end"
        style={{ minHeight: "100vh", padding: "clamp(24px, 5vw, 60px)" }}
      >
        {/* 텍스트 블록 — 하단 왼쪽 */}
        <div style={{ maxWidth: 560 }}>
          <p
            style={{
              fontSize: "clamp(9px, 1vw, 11px)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.55)",
              marginBottom: 12,
            }}
          >
            NCT WISH · 2nd Mini Album
          </p>

          <h1
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(56px, 10vw, 120px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: "#fff",
              marginBottom: 16,
              textShadow: "0 4px 32px rgba(0,0,0,0.4)",
            }}
          >
            COLOR
          </h1>

          <p
            style={{
              fontSize: "clamp(11px, 1.2vw, 14px)",
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.06em",
              marginBottom: 28,
            }}
          >
            자신만의 색으로 세상을 물들이다
          </p>

          {/* 컬러 바 */}
          <div
            style={{
              display: "flex",
              width: "clamp(120px, 15vw, 180px)",
              height: 2,
              borderRadius: 1,
              overflow: "hidden",
              opacity: 0.65,
              marginBottom: 32,
            }}
          >
            {[
              "#7c6dfa",
              "#f06240",
              "#4ab8e8",
              "#3db87a",
              "#f0b429",
              "#e8609a",
            ].map((c) => (
              <div key={c} style={{ flex: 1, background: c }} />
            ))}
          </div>

          <button
            onClick={handleEnter}
            style={{
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              border: "0.5px solid rgba(255,255,255,0.3)",
              color: "#fff",
              padding: "clamp(12px, 1.5vw, 16px) clamp(32px, 4vw, 56px)",
              borderRadius: 100,
              fontSize: "clamp(11px, 1vw, 13px)",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans)",
              transition: "background 0.2s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.22)";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(0)";
            }}
          >
            Enter the World
          </button>
        </div>
      </div>
    </main>
  );
}
