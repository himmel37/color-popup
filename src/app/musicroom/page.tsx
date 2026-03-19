"use client";

import { useState, useEffect, useRef } from "react";
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
    spotify: "https://open.spotify.com/track/7BRP4zawz4T1PhAdj2Nr4Z",
    melon: "https://www.melon.com/",
    youtube: "28dAfmIAlCo",
  },
  {
    num: "02",
    title: "Baby Blue",
    type: "",
    color: "#85b7eb",
    bg: "#080f1a",
    desc: "하늘빛처럼 맑고 청량한 곡. 설레는 감정을 파란 하늘에 담아낸다.",
    mood: "Dreamy · Soft · Fresh",
    spotify: "https://open.spotify.com/track/5Vhv7grrhFyhTYkXKrNo67",
    melon: "https://www.melon.com/",
    youtube: "FBr4hA9L90s",
  },
  {
    num: "03",
    title: "Surf",
    type: "",
    color: "#4ecdc4",
    bg: "#08181a",
    desc: "파도를 타듯 자유롭게. 여름의 에너지가 물결치는 업템포 트랙.",
    mood: "Free · Energetic · Summer",
    spotify: "https://open.spotify.com/track/0ONXDvqXoLojpLSRr2npja",
    melon: "https://www.melon.com/",
    youtube: "1pyO6oNmACs",
  },
  {
    num: "04",
    title: "Cheat Code",
    type: "",
    color: "#3db87a",
    bg: "#081a10",
    desc: "게임 같은 인생에서 나만의 치트키. 몽환적이고 중독적인 멜로디.",
    mood: "Mysterious · Addictive · Cool",
    spotify: "https://open.spotify.com/track/0dE5yWQgpEMBtEiLqsKbL2",
    melon: "https://www.melon.com/",
    youtube: "4VvbSmlcGxo",
  },
  {
    num: "05",
    title: "Videohood",
    type: "",
    color: "#d4537e",
    bg: "#1a0808",
    desc: "비디오 속 세계처럼 아련하고 감성적인 미드템포 곡.",
    mood: "Nostalgic · Emotional · Cinematic",
    spotify: "https://open.spotify.com/track/348MxMVyHYOKA4XrHJEQAk",
    melon: "https://www.melon.com/",
    youtube: "5cIo87AEbeY",
  },
  {
    num: "06",
    title: "WICHU",
    type: "",
    color: "#f0b429",
    bg: "#1a1208",
    desc: "위츄! 밝고 귀여운 에너지가 넘치는 곡. 함께하고 싶은 마음을 담았다.",
    mood: "Playful · Bright · Sweet",
    spotify: "https://open.spotify.com/track/37bG7biGfYaLebbXIuQbxK",
    melon: "https://www.melon.com/",
    youtube: "BKJlyleaaqM",
  },
  {
    num: "07",
    title: "고양이 릴스",
    type: "",
    color: "#e8609a",
    bg: "#081a12",
    desc: "귀여운 고양이처럼 사랑스럽고 중독적인 마지막 트랙.",
    mood: "Cute · Addictive · Cozy",
    spotify: "https://open.spotify.com/track/2lQVBSfjBVCvI245h4oJNi",
    melon: "https://www.melon.com/",
    youtube: "ya_LLqsH92s",
  },
];

type Track = (typeof TRACKS)[0];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function TrackSection({
  track,
  onVisible,
}: {
  track: Track;
  onVisible: (track: Track) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          onVisible(track);
        } else setVisible(false);
      },
      { threshold: 0.6 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [track, onVisible]);

  return (
    <section
      ref={ref}
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        padding: "0 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 배경 트랙 넘버 */}
      <div
        style={{
          position: "absolute",
          right: -40,
          top: "50%",
          transform: "translateY(-50%)",
          fontFamily: "var(--font-playfair)",
          fontSize: "clamp(180px, 28vw, 360px)",
          fontWeight: 700,
          color: track.color,
          opacity: visible ? 0.06 : 0,
          transition: "opacity 1s ease",
          letterSpacing: "-0.06em",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {track.num}
      </div>

      {/* 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 600 }}>
        <p
          style={{
            fontFamily: "var(--font-playfair)",
            fontSize: "clamp(48px, 8vw, 96px)",
            fontWeight: 700,
            color: track.color,
            lineHeight: 1,
            opacity: visible ? 0.3 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            marginBottom: -8,
            letterSpacing: "-0.04em",
          }}
        >
          {track.num}
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-playfair)",
              fontSize: "clamp(48px, 8vw, 96px)",
              fontWeight: 700,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            {track.title}
          </h2>
          {track.type && (
            <span
              style={{
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: track.color,
                border: `0.5px solid ${track.color}60`,
                padding: "5px 12px",
                borderRadius: 100,
                background: `${track.color}12`,
                whiteSpace: "nowrap",
              }}
            >
              {track.type}
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: track.color,
            opacity: visible ? 0.8 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            marginBottom: 20,
          }}
        >
          {track.mood}
        </p>

        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.8,
            maxWidth: 480,
            marginBottom: 36,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
          }}
        >
          {track.desc}
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s",
          }}
        >
          <button
            onClick={() => window.open(track.spotify, "_blank")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#1DB954",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 100,
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            ▶ Spotify
          </button>
          <button
            onClick={() => window.open(track.melon, "_blank")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "transparent",
              color: "#fff",
              border: "0.5px solid rgba(255,255,255,0.2)",
              padding: "12px 24px",
              borderRadius: 100,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            🍈 Melon
          </button>
        </div>
      </div>
    </section>
  );
}

export default function MusicRoomPage() {
  const router = useRouter();
  const [activeTrack, setActiveTrack] = useState<Track>(TRACKS[0]);
  const [muted, setMuted] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<ReturnType<Window["YT"]["Player"]> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentVideoId = useRef<string>("");

  // YouTube IFrame API 로드
  useEffect(() => {
    if (window.YT?.Player) {
      queueMicrotask(() => setPlayerReady(true));
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setPlayerReady(true);
  }, []);

  // 트랙 바뀌면 영상 교체 (재생 유지)
  useEffect(() => {
    if (!playerReady || !activeTrack.youtube) return;
    if (!playerRef.current) {
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: activeTrack.youtube,
        playerVars: {
          autoplay: 1,
          controls: 0,
          loop: 1,
          playlist: activeTrack.youtube,
          mute: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (e: {
            target: {
              setVolume: (v: number) => void;
              mute: () => void;
              unMute: () => void;
            };
          }) => {
            currentVideoId.current = activeTrack.youtube;
            e.target.setVolume(80);
          },
        },
      });
    } else if (currentVideoId.current !== activeTrack.youtube) {
      playerRef.current.loadVideoById({
        videoId: activeTrack.youtube,
        suggestedQuality: "hd720",
      });
      currentVideoId.current = activeTrack.youtube;
      if (muted) playerRef.current.mute();
      else playerRef.current.unMute();
    }
  }, [playerReady, activeTrack]);

  // 소리만 토글 — 재생 유지
  const toggleMute = () => {
    if (!playerRef.current) return;
    if (muted) {
      playerRef.current.unMute();
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const scrollToTrack = (index: number) => {
    containerRef.current?.scrollTo({
      top: index * window.innerHeight,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, display: "flex" }}>
      {/* 배경색 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: activeTrack.bg,
          transition: "background 0.8s ease",
          zIndex: 0,
        }}
      />

      {/* YouTube 전체 배경 — IFrame API */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        <div
          id="yt-player"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "177.78vh",
            height: "100vh",
            minWidth: "100%",
            minHeight: "56.25vw",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.52)",
          }}
        />
      </div>

      {/* 글로우 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          background: `radial-gradient(ellipse at 30% 50%, ${activeTrack.color}14 0%, transparent 60%)`,
          transition: "background 0.8s ease",
        }}
      />

      {/* 스크롤 컨테이너 */}
      <div
        ref={containerRef}
        className="hide-scrollbar"
        style={{
          position: "relative",
          zIndex: 3,
          flex: 1,
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
        }}
      >
        {/* 헤더 */}
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 260,
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 80px",
          }}
        >
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
              Music Room
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={toggleMute}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "0.5px solid rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: 11,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "8px 16px",
                borderRadius: 100,
              }}
            >
              {muted ? "🔊 Sound On" : "🔇 Mute"}
            </button>
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
        </header>

        {TRACKS.map((track, i) => (
          <div key={track.num} style={{ scrollSnapAlign: "start" }}>
            <TrackSection track={track} onVisible={setActiveTrack} />
          </div>
        ))}
      </div>

      {/* 오른쪽 트랙리스트 */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: 260,
          borderLeft: "0.5px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 24px",
        }}
      >
        <p
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            marginBottom: 16,
          }}
        >
          Tracklist
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TRACKS.map((track, i) => {
            const isActive = activeTrack.title === track.title;
            return (
              <button
                key={track.num}
                onClick={() => scrollToTrack(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `0.5px solid ${isActive ? "rgba(255,255,255,0.1)" : "transparent"}`,
                  background: isActive ? `${track.color}18` : "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 0.3s",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: track.color,
                    flexShrink: 0,
                    opacity: isActive ? 1 : 0.35,
                    transition: "opacity 0.3s",
                  }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                    width: 20,
                    flexShrink: 0,
                  }}
                >
                  {track.num}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: isActive ? "#fff" : "rgba(255,255,255,0.45)",
                    fontWeight: isActive ? 500 : 400,
                    flex: 1,
                    transition: "color 0.3s",
                  }}
                >
                  {track.title}
                </span>
                {track.type && (
                  <span
                    style={{
                      fontSize: 8,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: track.color,
                    }}
                  >
                    {track.type}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            height: 2,
            borderRadius: 1,
            overflow: "hidden",
            opacity: 0.25,
            marginTop: 24,
          }}
        >
          {TRACKS.map((t, i) => (
            <button
              key={t.num}
              onClick={() => scrollToTrack(i)}
              style={{
                flex: 1,
                border: "none",
                background: t.color,
                cursor: "pointer",
                opacity: activeTrack.title === t.title ? 1 : 0.4,
                transition: "opacity 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
