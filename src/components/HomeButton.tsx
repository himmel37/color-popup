"use client";

import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/hall")}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "rgba(255,255,255,0.08)",
        backdropFilter: "blur(12px)",
        border: "0.5px solid rgba(255,255,255,0.15)",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 100,
        fontSize: 12,
        letterSpacing: "0.06em",
        cursor: "pointer",
        transition: "background 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.15)";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "rgba(255,255,255,0.3)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLButtonElement).style.borderColor =
          "rgba(255,255,255,0.15)";
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
      Hall
    </button>
  );
}
