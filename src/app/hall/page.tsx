"use client";

import { useRouter } from "next/navigation";

const BOOTHS = [
  {
    id: "photobooth",
    name: "Photo Booth",
    desc: "나만의 컬러로 4컷 사진 찍기",
    color: "#7c6dfa",
    available: true,
  },
  {
    id: "musicroom",
    name: "Music Room",
    desc: "트랙별 세계관 탐험",
    color: "#4ab8e8",
    available: true,
  },
  {
    id: "gallery",
    name: "Gallery",
    desc: "앨범 컨셉 포토 & 스토리",
    color: "#e8609a",
    available: false,
  },
  {
    id: "giftshop",
    name: "Gift Shop",
    desc: "가상 굿즈 구경하기",
    color: "#f0b429",
    available: false,
  },
];

const MEMBER_COLORS = [
  "#7c6dfa",
  "#f06240",
  "#4ab8e8",
  "#3db87a",
  "#f0b429",
  "#e8609a",
];

export default function HallPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "#08080f", padding: "40px 24px" }}
    >
      {/* 배경 컬러 글로우 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {MEMBER_COLORS.map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 300,
              height: 300,
              background: c,
              opacity: 0.04,
              top: `${[10, 60, 20, 70, 40, 80][i]}%`,
              left: `${[10, 80, 50, 20, 70, 40][i]}%`,
              transform: "translate(-50%, -50%)",
              filter: "blur(80px)",
            }}
          />
        ))}
      </div>

      {/* 헤더 */}
      <div className="text-center mb-12 relative z-10">
        <p
          style={{
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "var(--muted)",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          NCT WISH · COLOR POPUP STORE
        </p>
        <h1
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color: "var(--text)",
            marginBottom: 10,
          }}
        >
          Welcome to
          <br />
          <span style={{ fontStyle: "italic", fontWeight: 400 }}>
            Prism House
          </span>
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "var(--muted)",
            letterSpacing: "0.04em",
          }}
        >
          부스를 선택해 COLOR의 세계로 들어오세요
        </p>
      </div>

      {/* 컬러 바 */}
      <div
        className="flex rounded-full overflow-hidden mb-10"
        style={{ width: 160, height: 2, opacity: 0.4 }}
      >
        {MEMBER_COLORS.map((c) => (
          <div key={c} style={{ flex: 1, background: c }} />
        ))}
      </div>

      {/* 부스 그리드 */}
      <div
        className="relative z-10 w-full"
        style={{
          maxWidth: 480,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {BOOTHS.map((booth) => (
          <button
            key={booth.id}
            onClick={() => booth.available && router.push(`/${booth.id}`)}
            className="relative text-left transition-all duration-200"
            style={{
              background: booth.available
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.02)",
              border: `0.5px solid ${booth.available ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
              borderRadius: 16,
              padding: "28px 22px",
              cursor: booth.available ? "pointer" : "default",
              opacity: booth.available ? 1 : 0.45,
            }}
            onMouseEnter={(e) => {
              if (booth.available) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  booth.color + "60";
              }
            }}
            onMouseLeave={(e) => {
              if (booth.available) {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(255,255,255,0.12)";
              }
            }}
          >
            {/* 컬러 닷 */}
            <div
              className="rounded-full mb-4"
              style={{
                width: 10,
                height: 10,
                background: booth.color,
                opacity: booth.available ? 1 : 0.4,
              }}
            />

            <div
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: 6,
                letterSpacing: "-0.02em",
              }}
            >
              {booth.name}
            </div>
            <div
              style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}
            >
              {booth.desc}
            </div>

            {/* 준비중 뱃지 */}
            {!booth.available && (
              <div
                style={{
                  position: "absolute",
                  top: 14,
                  right: 14,
                  fontSize: 8,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "3px 8px",
                  borderRadius: 100,
                  border: "0.5px solid rgba(255,255,255,0.08)",
                }}
              >
                Soon
              </div>
            )}

            {/* available 화살표 */}
            {booth.available && (
              <div
                style={{
                  position: "absolute",
                  bottom: 18,
                  right: 18,
                  fontSize: 14,
                  color: booth.color,
                  opacity: 0.7,
                }}
              >
                →
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 뒤로가기 */}
      <button
        onClick={() => router.push("/")}
        style={{
          marginTop: 40,
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
        ← Back
      </button>
    </main>
  );
}
