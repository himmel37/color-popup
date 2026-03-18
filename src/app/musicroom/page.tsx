"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TRACKS = [
  {
    num: "01",
    title: "COLOR",
    type: "Title",
    color: "#7c6dfa",
    bg: "#0d0a1f",
    desc: "강렬한 신디사이저와 재지한 코드 진행. 자신만의 색깔로 세상을 물들이겠다는 당찬 선언.",
    mood: "Electric · Confident · Bold",
    spotify: "https://open.spotify.com/track/",
    melon: "https://www.melon.com/",
  },
  {
    num: "02",
    title: "Baby Blue",
    type: "",
    color: "#85b7eb",
    bg: "#080f1a",
    desc: "하늘빛처럼 맑고 청량한 곡. 설레는 감정을 파란 하늘에 담아낸다.",
    mood: "Dreamy · Soft · Fresh",
    spotify: "https://open.spotify.com/track/",
    melon: "https://www.melon.com/",
  },
  {
    num: "03",
    title: "Surf",
    type: "",
    color: "#4ecdc4",
    bg: "#08181a",
    desc: "파도를 타듯 자유롭게. 여름의 에너지가 물결치는 업템포 트랙.",
    mood: "Free · Energetic · Summer",
    spotify: "https://open.spotify.com/track/",
    melon: "https://www.melon.com/",
  },
  {
    num: "04",
    title: "Cheat Code",
    type: "",
    color: "#7f77dd",
    bg: "#0d0b1a",
    desc: "게임 같은 인생에서 나만의 치트키. 몽환적이고 중독적인 멜로디.",
    mood: "Mysterious · Addictive · Cool",
    spotify: "https://open.spotify.com/track/",
    melon: "https://www.melon.com/",
  },
  {
    num: "05",
    title: "Videohood",
    type: "",
    color: "#d4537e",
    bg: "#1a080f",
    desc: "비디오 속 세계처럼 아련하고 감성적인 미드템포 곡.",
    mood: "Nostalgic · Emotional · Cinematic",
    spotify: "https://open.spotify.com/track/",
    melon: "https://www.melon.com/",
  },
  {
    num: "06",
    title: "WICHU",
    type: "",
    color: "#ef9f27",
    bg: "#1a1008",
    desc: "위츄! 밝고 귀여운 에너지가 넘치는 곡. 함께하고 싶은 마음을 담았다.",
    mood: "Playful · Bright · Sweet",
    spotify: "https://open.spotify.com/track/",
    melon: "https://www.melon.com/",
  },
  {
    num: "07",
    title: "고양이 릴스",
    type: "",
    color: "#5dcaa5",
    bg: "#081a12",
    desc: "귀여운 고양이처럼 사랑스럽고 중독적인 마지막 트랙.",
    mood: "Cute · Addictive · Cozy",
    spotify: "https://open.spotify.com/track/",
    melon: "https://www.melon.com/",
  },
];

type Track = (typeof TRACKS)[0];

export default function MusicRoomPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Track>(TRACKS[0]);
  const [transitioning, setTransitioning] = useState(false);

  function selectTrack(track: Track) {
    if (track.title === selected.title) return;
    setTransitioning(true);
    setTimeout(() => {
      setSelected(track);
      setTransitioning(false);
    }, 300);
  }

  return (
    <main
      className="relative h-screen flex flex-col overflow-hidden transition-colors duration-500"
      style={{ background: selected.bg }}
    >
      {/* 글로우 */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          background: `radial-gradient(ellipse at 60% 40%, ${selected.color}18 0%, transparent 65%)`,
        }}
      />

      {/* 헤더 */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12 md:py-6 shrink-0">
        <div>
          <p className="text-[9px] tracking-[0.2em] uppercase text-white/40 mb-1">
            NCT WISH · COLOR
          </p>
          <h1
            className="text-[22px] font-bold text-white tracking-tight"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Music Room
          </h1>
        </div>
        <button
          onClick={() => router.push("/hall")}
          className="text-[11px] tracking-widest uppercase text-white/40 hover:text-white/70 transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Hall
        </button>
      </header>

      {/* 바디 */}
      <div
        className="relative z-10"
        style={{
          height: "calc(100vh - 76px)",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "48px",
          padding: "0 48px",
          overflow: "hidden",
        }}
      >
        {/* 트랙 디테일 */}
        <div
          className="flex flex-col min-w-0 gap-3"
          style={{
            flex: 1,
            alignSelf: "center",
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? "translateY(12px)" : "translateY(0)",
            transition: "opacity 0.3s, transform 0.3s",
          }}
        >
          {/* 큰 번호 */}
          <p
            className="text-[clamp(72px,12vw,140px)] font-bold leading-none tracking-tighter -mb-2"
            style={{
              fontFamily: "var(--font-playfair)",
              color: selected.color,
              opacity: 0.15,
            }}
          >
            {selected.num}
          </p>

          {/* 타이틀 + 뱃지 */}
          <div className="flex items-center gap-3">
            <h2
              className="text-[clamp(36px,6vw,72px)] font-bold text-white leading-none tracking-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {selected.title}
            </h2>
            {selected.type && (
              <span
                className="text-[10px] tracking-widest uppercase px-3 py-1 rounded-full whitespace-nowrap"
                style={{
                  color: selected.color,
                  border: `0.5px solid ${selected.color}50`,
                  background: `${selected.color}15`,
                }}
              >
                {selected.type}
              </span>
            )}
          </div>

          {/* Mood */}
          <p
            className="text-[11px] tracking-widest uppercase"
            style={{ color: selected.color, opacity: 0.8 }}
          >
            {selected.mood}
          </p>

          {/* 설명 */}
          <p className="text-sm text-white/50 leading-relaxed max-w-md">
            {selected.desc}
          </p>

          {/* 버튼 */}
          <div className="flex gap-3 mt-1">
            <button
              onClick={() => window.open(selected.spotify, "_blank")}
              className="flex items-center gap-2 bg-[#1DB954] text-white text-xs font-medium px-6 py-3 rounded-full cursor-pointer border-none hover:opacity-90 transition-opacity"
            >
              ▶ Spotify
            </button>
            <button
              onClick={() => window.open(selected.melon, "_blank")}
              className="flex items-center gap-2 text-white text-xs px-6 py-3 rounded-full cursor-pointer hover:bg-white/10 transition-colors"
              style={{
                background: "transparent",
                border: "0.5px solid rgba(255,255,255,0.2)",
              }}
            >
              🍈 Melon
            </button>
          </div>
        </div>

        {/* 트랙리스트 */}
        <div
          className="w-full md:w-[220px] shrink-0 flex flex-col justify-center pb-4 md:pb-0"
          style={{ alignSelf: "center" }}
        >
          <p className="text-[9px] tracking-[0.18em] uppercase text-white/30 mb-3">
            Tracklist
          </p>
          <div className="flex flex-col gap-0.5">
            {TRACKS.map((track) => {
              const isActive = selected.title === track.title;
              return (
                <button
                  key={track.num}
                  onClick={() => selectTrack(track)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-colors cursor-pointer border-none"
                  style={{
                    background: isActive ? `${track.color}15` : "transparent",
                    border: `0.5px solid ${isActive ? "rgba(255,255,255,0.1)" : "transparent"}`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{
                      background: track.color,
                      opacity: isActive ? 1 : 0.35,
                    }}
                  />
                  <span className="text-[10px] text-white/30 w-5 shrink-0">
                    {track.num}
                  </span>
                  <span
                    className="text-[13px] flex-1"
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {track.title}
                  </span>
                  {track.type && (
                    <span
                      className="text-[8px] tracking-wider uppercase"
                      style={{ color: track.color }}
                    >
                      {track.type}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 컬러 바 */}
          <div className="flex h-0.5 rounded-sm overflow-hidden mt-5 opacity-25">
            {TRACKS.map((t) => (
              <button
                key={t.num}
                onClick={() => selectTrack(t)}
                className="flex-1 border-none cursor-pointer transition-opacity"
                style={{
                  background: t.color,
                  opacity: selected.title === t.title ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
