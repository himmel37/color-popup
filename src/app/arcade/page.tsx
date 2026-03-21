"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const COLORS = [
  "#7c6dfa",
  "#e03030",
  "#4ab8e8",
  "#3db87a",
  "#f0b429",
  "#e8609a",
];
const MEMBER_NAMES = ["SION", "RIKU", "YUUSHI", "JAEHI", "RYO", "SAKUYA"];

const W = 700;
const H = 340;
const GROUND = H - 60;
const GRAVITY = 0.55;
const JUMP_FORCE = -12;
const GAME_SPEED_INIT = 4;

type Jelly = {
  x: number;
  y: number;
  color: string;
  member: string;
  collected: boolean;
};
type Obstacle = {
  x: number;
  y: number;
  w: number;
  h: number;
  tall: boolean;
  superTall: boolean;
};
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
};

export default function ArcadePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    running: false,
    dead: false,
    started: false,
    score: 0,
    hiScore: 0,
    frame: 0,
    speed: GAME_SPEED_INIT,
    playerY: GROUND,
    playerVY: 0,
    onGround: true,
    jumpCount: 0,
    jellies: [] as Jelly[],
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    bgColorIndex: 0,
    bgProgress: 0,
    groundOffset: 0,
    scanOffset: 0,
    lives: 3,
  });
  const rafRef = useRef<number>(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">(
    "idle",
  );
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState(0);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});
  const imagesLoadedRef = useRef(false);

  useEffect(() => {
    const files = [
      "sion_idle",
      "sion_hurt",
      "sion_jump1",
      "sion_jump2",
      "sion_run1",
      "sion_run2",
      "sion_run3",
      "sion_run4",
      "sion_run5",
      "sion_run6",
      "jelly1",
      "jelly2",
      "obstacle1",
      "obstacle2",
      "obstacle3",
    ];
    let loaded = 0;
    files.forEach((name) => {
      const img = new Image();
      img.src = `/sprites/${name}.png`;
      img.onload = () => {
        loaded++;
        if (loaded === files.length) imagesLoadedRef.current = true;
      };
      imagesRef.current[name] = img;
    });
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (!s.started) {
      s.started = true;
      s.running = true;
      setGameState("playing");
    }
    if (s.dead) return;
    if (s.jumpCount < 2) {
      s.playerVY = JUMP_FORCE;
      s.onGround = false;
      s.jumpCount++;
    }
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    Object.assign(s, {
      running: true,
      dead: false,
      started: true,
      score: 0,
      frame: 0,
      speed: GAME_SPEED_INIT,
      playerY: GROUND,
      playerVY: 0,
      onGround: true,
      jumpCount: 0,
      jellies: [],
      obstacles: [],
      particles: [],
      bgColorIndex: 0,
      bgProgress: 0,
      groundOffset: 0,
      lives: 3,
    });
    setScore(0);
    setGameState("playing");
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (stateRef.current.dead) reset();
        else jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    function drawPixelChar(
      x: number,
      y: number,
      dead: boolean,
      jumping: boolean,
    ) {
      const imgs = imagesRef.current;
      const frame = stateRef.current.frame;
      const bounce = jumping ? -6 : Math.sin(frame * 0.15) * 2;
      const by = y + bounce;
      const size = 48;

      // 그림자
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(x, GROUND + 6, 16, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      let img: HTMLImageElement;
      if (dead) {
        img = imgs["sion_hurt"];
      } else if (jumping) {
        const jumpFrame = Math.floor(frame / 6) % 2;
        img = imgs[`sion_jump${jumpFrame + 1}`];
      } else {
        const runFrame = (Math.floor(frame / 6) % 6) + 1;
        img = imgs[`sion_run${runFrame}`];
      }

      if (img?.complete) {
        ctx.drawImage(img, x - size / 2, by - size, size, size);
      }
    }

    function drawJelly(x: number, y: number, color: string, frame: number) {
      const bob = Math.sin(frame * 0.05 + x * 0.01) * 3;
      const by = y + bob;
      const size = 32;
      const imgs = imagesRef.current;

      const colorIndex = COLORS.indexOf(color);
      const imgName = colorIndex % 2 === 0 ? "jelly1" : "jelly2";

      // 그림자
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.beginPath();
      ctx.ellipse(x, y + 14, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      const img = imgs[imgName];
      if (img?.complete) {
        ctx.drawImage(img, x - size / 2, by - size / 2, size, size);
      }
    }
    function drawObstacle(obs: Obstacle & { superTall?: boolean }) {
      const { x, y, w, h } = obs;
      const imgs = imagesRef.current;

      let imgName: string;
      if (obs.superTall) {
        imgName = "obstacle2";
      } else if (obs.tall) {
        imgName = "obstacle1";
      } else {
        imgName = "obstacle3";
      }

      const img = imgs[imgName];
      if (img?.complete && img.naturalWidth > 0) {
        const drawW = obs.superTall ? 64 : obs.tall ? 56 : 52;
        const drawH = obs.superTall ? 120 : obs.tall ? 90 : 52;
        ctx.fillStyle = "rgba(220, 50, 50, 0.25)";
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h + 4, drawW / 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(img, x - (drawW - w) / 2, y - (drawH - h), drawW, drawH);
      }
    }

    function drawBackground(bgColorIndex: number, bgProgress: number) {
      // 하늘 그라디언트
      const c1 = COLORS[bgColorIndex % COLORS.length];
      const c2 = COLORS[(bgColorIndex + 1) % COLORS.length];
      const grad = ctx.createLinearGradient(0, 0, 0, GROUND);
      grad.addColorStop(0, `${c1}18`);
      grad.addColorStop(1, `${c2}08`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, GROUND);

      // 별
      const stars = [
        [50, 30],
        [120, 15],
        [200, 45],
        [300, 20],
        [400, 35],
        [500, 10],
        [580, 50],
        [650, 25],
        [100, 60],
        [350, 55],
      ];
      stars.forEach(([sx, sy], i) => {
        const twinkle = Math.sin(stateRef.current.frame * 0.05 + i) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255,255,255,${twinkle * 0.6})`;
        ctx.fillRect(sx, sy, 2, 2);
      });

      // 구름 (픽셀)
      const cloudOffset = (stateRef.current.groundOffset * 0.3) % W;
      [
        [100, 40],
        [300, 60],
        [550, 30],
      ].forEach(([cx, cy]) => {
        const x = (((cx - cloudOffset) % W) + W) % W;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillRect(x, cy, 60, 12);
        ctx.fillRect(x + 10, cy - 10, 40, 12);
        ctx.fillRect(x + 20, cy - 18, 20, 10);
      });

      // 파란 집 (멀리)
      const houseX =
        ((((450 - stateRef.current.groundOffset * 0.1) % (W + 200)) + W + 200) %
          (W + 200)) -
        100;
      ctx.fillStyle = "rgba(74, 120, 184, 0.3)";
      ctx.fillRect(houseX, GROUND - 80, 60, 60);
      ctx.fillStyle = "rgba(45, 82, 134, 0.3)";
      ctx.beginPath();
      ctx.moveTo(houseX - 5, GROUND - 80);
      ctx.lineTo(houseX + 30, GROUND - 110);
      ctx.lineTo(houseX + 65, GROUND - 80);
      ctx.fill();
    }

    function drawGround(offset: number, color: string) {
      // 잔디
      ctx.fillStyle = "#1a3a1a";
      ctx.fillRect(0, GROUND + 10, W, H - GROUND - 10);
      ctx.fillStyle = "#2d5e2d";
      ctx.fillRect(0, GROUND + 10, W, 8);

      // 픽셀 타일
      const tileW = 32;
      for (let i = 0; i < W + tileW; i += tileW) {
        const tx = ((i - (offset % tileW) + tileW) % (W + tileW)) - tileW;
        ctx.fillStyle = i % (tileW * 2) === 0 ? "#234023" : "#1e381e";
        ctx.fillRect(tx, GROUND + 18, tileW - 1, 12);
        // 꽃
        if (Math.floor((i + offset) / tileW) % 5 === 0) {
          ctx.fillStyle = color + "80";
          ctx.fillRect(tx + 14, GROUND + 6, 4, 4);
          ctx.fillRect(tx + 12, GROUND + 8, 8, 2);
        }
      }

      // 땅 선
      ctx.fillStyle = color + "60";
      ctx.fillRect(0, GROUND + 10, W, 2);
    }

    function drawScanlines() {
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      for (let i = 0; i < H; i += 3) {
        ctx.fillRect(0, i, W, 1);
      }
    }

    function loop() {
      const s = stateRef.current;
      s.frame++;

      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, W, H);

      drawBackground(s.bgColorIndex, s.bgProgress);

      if (!s.running && !s.dead) {
        // 대기화면
        drawGround(0, COLORS[0]);
        drawPixelChar(120, GROUND, false, false);

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(W / 2 - 200, H / 2 - 70, 400, 130);
        ctx.strokeStyle = COLORS[0];
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 200, H / 2 - 70, 400, 130);

        ctx.fillStyle = "#f0b429";
        ctx.font = "bold 22px monospace";
        ctx.textAlign = "center";
        ctx.fillText("✦ WISH JELLY RUNNER ✦", W / 2, H / 2 - 30);
        ctx.fillStyle = "rgba(255,255,255,0.7)";
        ctx.font = "14px monospace";
        ctx.fillText("SPACE / CLICK / TAP to start", W / 2, H / 2 + 5);
        ctx.fillStyle = "rgba(255,255,255,0.35)";
        ctx.font = "11px monospace";
        ctx.fillText(
          "double jump available!  ✦  avoid obstacles!",
          W / 2,
          H / 2 + 30,
        );

        drawScanlines();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      if (s.running) {
        s.speed = GAME_SPEED_INIT + s.frame * 0.002;
        s.groundOffset += s.speed;
        s.bgProgress += 0.0006;
        if (s.bgProgress >= 1) {
          s.bgProgress = 0;
          s.bgColorIndex++;
        }

        // 물리
        s.playerVY += GRAVITY;
        s.playerY += s.playerVY;
        if (s.playerY >= GROUND) {
          s.playerY = GROUND;
          s.playerVY = 0;
          s.onGround = true;
          s.jumpCount = 0;
        }

        // 젤리 생성
        if (s.frame % 55 === 0) {
          const ci = Math.floor(Math.random() * COLORS.length);
          const rand = Math.random();
          let jellyY: number;
          if (rand < 0.4) {
            jellyY = GROUND - 12; // 그냥 달리면 먹힘
          } else if (rand < 0.7) {
            jellyY = GROUND - 65; // 한 번 점프해야 먹힘
          } else {
            jellyY = GROUND - 120; // 더블 점프해야 먹힘
          }
          s.jellies.push({
            x: W + 20,
            y: jellyY,
            color: COLORS[ci],
            member: MEMBER_NAMES[ci],
            collected: false,
          });
        }

        // 장애물 생성
        const interval = Math.max(80, 140 - s.frame * 0.04);
        if (s.frame % Math.floor(interval) === 0) {
          const rand = Math.random();
          const superTall = rand < 0.2;
          const tall = !superTall && rand < 0.5;
          const h = superTall ? 100 : tall ? 55 : 28;
          s.obstacles.push({
            x: W + 10,
            y: GROUND - h,
            w: 28,
            h,
            tall,
            superTall,
          });
        }

        // 젤리 이동
        s.jellies.forEach((j) => (j.x -= s.speed));
        s.jellies = s.jellies.filter((j) => j.x > -20);

        // 젤리 충돌
        const charX = 120;
        const charTop = s.playerY - 36;
        const charBottom = s.playerY - 4;
        s.jellies.forEach((j) => {
          if (
            !j.collected &&
            Math.abs(j.x - charX) < 20 &&
            j.y + 10 >= charTop &&
            j.y - 10 <= charBottom
          ) {
            j.collected = true;
            s.score++;
            setScore(s.score);
            if (s.score > s.hiScore) {
              s.hiScore = s.score;
              setHiScore(s.score);
            }
            for (let i = 0; i < 10; i++) {
              s.particles.push({
                x: j.x,
                y: j.y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                color: j.color,
                life: 1,
              });
            }
          }
        });
        s.jellies = s.jellies.filter((j) => !j.collected);

        // 장애물 이동 및 충돌
        s.obstacles.forEach((o) => (o.x -= s.speed));
        s.obstacles = s.obstacles.filter((o) => o.x > -50);
        s.obstacles.forEach((o) => {
          if (
            charX + 10 > o.x &&
            charX - 10 < o.x + o.w &&
            charBottom > o.y &&
            charTop < o.y + o.h
          ) {
            s.lives--;
            // 장애물 제거 (같은 장애물에 계속 맞지 않게)
            o.x = -100;
            if (s.lives <= 0) {
              s.running = false;
              s.dead = true;
              setGameState("dead");
            }
          }
        });

        // 파티클
        s.particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.life -= 0.04;
        });
        s.particles = s.particles.filter((p) => p.life > 0);
      }

      drawGround(s.groundOffset, COLORS[s.bgColorIndex % COLORS.length]);

      // 젤리
      s.jellies.forEach((j) => drawJelly(j.x, j.y, j.color, s.frame));

      // 장애물
      s.obstacles.forEach((o) => drawObstacle(o));

      // 파티클
      s.particles.forEach((p) => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // 캐릭터
      drawPixelChar(120, s.playerY, s.dead, !s.onGround);

      // HUD
      const activeColor = COLORS[s.bgColorIndex % COLORS.length];
      ctx.fillStyle = activeColor + "cc";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`✦ ${s.score}`, 16, 28);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "10px monospace";
      ctx.fillText(`BEST ${s.hiScore}`, 16, 44);
      // 목숨 표시
      ctx.font = "16px serif";
      ctx.textAlign = "left";
      for (let i = 0; i < s.lives; i++) {
        ctx.fillText("❤️", 16 + i * 22, 62);
      }

      // 속도 게이지
      const speedRatio = Math.min((s.speed - GAME_SPEED_INIT) / 6, 1);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(W - 80, 16, 64, 6);
      ctx.fillStyle = activeColor;
      ctx.fillRect(W - 80, 16, 64 * speedRatio, 6);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText("SPEED", W - 16, 14);

      drawScanlines();

      if (s.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = "#e03030";
        ctx.lineWidth = 2;
        ctx.strokeRect(W / 2 - 180, H / 2 - 65, 360, 120);
        ctx.fillStyle = "rgba(10,0,0,0.8)";
        ctx.fillRect(W / 2 - 180, H / 2 - 65, 360, 120);
        ctx.fillStyle = "#e03030";
        ctx.font = "bold 28px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", W / 2, H / 2 - 18);
        ctx.fillStyle = "#f0b429";
        ctx.font = "bold 18px monospace";
        ctx.fillText(`SCORE: ${s.score}`, W / 2, H / 2 + 12);
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        ctx.font = "11px monospace";
        ctx.fillText("SPACE / CLICK to retry", W / 2, H / 2 + 38);
      }

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleClick = () => {
    if (stateRef.current.dead) reset();
    else jump();
  };

  const activeColor = COLORS[0];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05050e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        fontFamily: "monospace",
      }}
    >
      {/* 오락실 게임기 외관 */}
      <div style={{ position: "relative", display: "inline-block" }}>
        {/* 게임기 상단 — 네온 사인 */}
        <div
          style={{
            background: "linear-gradient(180deg, #0d0d1a 0%, #111128 100%)",
            border: "3px solid #1a1a3a",
            borderBottom: "none",
            borderRadius: "16px 16px 0 0",
            padding: "14px 32px 10px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 상단 레인보우 바 */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${COLORS.join(", ")})`,
              opacity: 0.9,
            }}
          />

          {/* 메인 타이틀 */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: "bold",
                letterSpacing: "0.2em",
                color: "#f0b429",
                textShadow:
                  "0 0 10px #f0b429, 0 0 20px #f0b42966, 0 0 40px #f0b42933",
                fontFamily: "monospace",
              }}
            >
              위시네 PC방
            </div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: "0.35em",
                color: "rgba(255,255,255,0.3)",
                marginTop: 2,
                fontFamily: "monospace",
                textTransform: "uppercase",
              }}
            >
              ✦ wish jelly runner ✦
            </div>
          </div>
        </div>

        {/* 게임기 본체 */}
        <div
          style={{
            background: "#0a0a18",
            border: "3px solid #1a1a3a",
            borderTop: "none",
            borderBottom: "none",
            padding: "8px 16px",
            position: "relative",
          }}
        >
          {/* 좌우 네온 */}
          <div
            style={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {COLORS.slice(0, 3).map((c, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  background: c,
                  boxShadow: `0 0 8px ${c}`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
          <div
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {COLORS.slice(3).map((c, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 24,
                  borderRadius: 2,
                  background: c,
                  boxShadow: `0 0 8px ${c}`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>

          {/* 캔버스 — CRT 베젤 */}
          <div
            style={{
              border: "4px solid #0d0d2a",
              borderRadius: 4,
              boxShadow:
                "inset 0 0 20px rgba(0,0,0,0.8), 0 0 20px rgba(124,109,250,0.15)",
            }}
          >
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              onClick={handleClick}
              style={{ display: "block", cursor: "pointer", borderRadius: 2 }}
            />
          </div>
        </div>

        {/* 게임기 하단 — 컨트롤 패널 */}
        <div
          style={{
            background: "linear-gradient(180deg, #111128 0%, #0d0d1a 100%)",
            border: "3px solid #1a1a3a",
            borderTop: "1px solid #2a2a4a",
            borderRadius: "0 0 16px 16px",
            padding: "12px 32px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* 코인 투입구 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: 40,
                height: 6,
                background: "#1a1a2e",
                border: "1px solid #333",
                borderRadius: 3,
              }}
            />
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.08em",
              }}
            >
              INSERT COIN
            </span>
          </div>

          {/* 점수 + 컨트롤 */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
                marginBottom: 4,
              }}
            >
              SPACE · CLICK · TAP
            </div>
            <div
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.06em",
              }}
            >
              double jump available
            </div>
          </div>

          {/* 조이스틱 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              onClick={handleClick}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, #e03030, #800000)",
                border: "2px solid #600",
                cursor: "pointer",
                boxShadow: "0 4px 8px rgba(0,0,0,0.5), 0 0 8px #e0303066",
              }}
            />
            <span
              style={{
                fontSize: 8,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.08em",
              }}
            >
              JUMP
            </span>
          </div>
        </div>

        {/* 하단 네온 줄 */}
        <div
          style={{
            height: 2,
            background: `linear-gradient(90deg, ${COLORS.join(", ")})`,
            borderRadius: "0 0 14px 14px",
            opacity: 0.6,
          }}
        />
      </div>

      {/* 멤버 컬러 범례 */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {COLORS.map((c, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 5 }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c,
                boxShadow: `0 0 4px ${c}`,
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.08em",
              }}
            >
              {MEMBER_NAMES[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Hall 버튼 */}
      <button
        onClick={() => router.push("/hall")}
        style={{
          marginTop: 16,
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.25)",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
        }}
      >
        ← Back to Hall
      </button>
    </main>
  );
}
