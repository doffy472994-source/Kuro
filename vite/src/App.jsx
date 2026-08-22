import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Plus, Trash2, MessageSquare, Menu, X, Mic, Camera, Image, FileText, Settings, MessageCirclePlus, MessageCircle, MoreHorizontal, Pencil, Check, Copy, RotateCw, Share2, Square, Plug, Monitor } from "lucide-react";

// This app was originally built for an environment providing a global
// window.storage key-value API. Outside that environment (a plain browser),
// this shim backs the same get/set interface with localStorage so every
// call site below works unmodified.
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    async get(key) {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return { key, value: raw };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
      return { key, value };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true };
    },
    async list(prefix = "") {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
      return { keys };
    },
  };
}

const UI_FONT = "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT = "'IBM Plex Mono', ui-monospace, monospace";
const SERIF_FONT = "'IBM Plex Serif', ui-serif, Georgia, serif";

// Groq's mark, used wherever a company/provider badge needs it instead of a text glyph.
function GroqLogo({ size = 13 }) {
  return (
    <svg
      viewBox="0 0 512 512"
      width={size}
      height={size}
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
      strokeLinejoin="round"
      strokeMiterlimit={2}
    >
      <path d="M256.867 16.007c-92.47-.84-167.997 71.999-168.861 162.741-.84 90.767 73.319 164.926 165.789 165.766h58.08V282.93h-55.008c-57.767.672-105.118-44.784-105.79-101.519-.696-56.687 45.623-103.15 103.39-103.822h2.4c57.767 0 104.59 45.96 104.758 102.67v151.318c0 56.207-46.655 101.998-103.75 102.694a104.988 104.988 0 01-72.79-30.047l-44.424 43.63c30.983 30.432 72.599 47.712 116.038 48.144h2.208c91.27-1.344 164.59-73.99 165.093-163.581V176.42c-2.232-89.302-76.39-160.413-167.133-160.413z" />
    </svg>
  );
}

// Anthropic's mark, rendered at fixed dark fill (as provided), so it sits on a light badge.
function AnthropicLogo({ size = 13 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path fill="#181818" d="m13.788825 3.932 6.43325 16.136075h3.5279L17.316725 3.932H13.788825Z" />
      <path
        fill="#181818"
        d="m6.325375 13.682775 2.20125 -5.67065 2.201275 5.67065H6.325375ZM6.68225 3.932 0.25 20.068075h3.596525l1.3155 -3.3886h6.729425l1.315275 3.3886h3.59655L10.371 3.932H6.68225Z"
      />
    </svg>
  );
}

// OpenAI's mark, rendered with a dark fill so it sits on a light badge like Anthropic's.
function OpenAILogo({ size = 13 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="#181614">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.16-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v3l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

// Google's 2025 gradient "G" mark, reproduced exactly (colors/gradients unchanged) from the
// official brand asset. Uses its own radial gradients, so each instance needs unique ids —
// idPrefix keeps multiple on-page copies (e.g. picker + settings) from clashing.
function GoogleLogo({ size = 13, idPrefix = "g" }) {
  const id = (n) => `${idPrefix}-${n}`;
  return (
    <svg viewBox="0 0 2616 2672" width={size} height={size}>
      <defs>
        <radialGradient
          id={id(1)}
          cx="1644.1057"
          cy="-469.8344"
          r="496"
          gradientTransform="matrix(-0.1086 -2.6614 3.9036 -0.1597 3004.592 6565.7583)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1ABD4D" />
          <stop offset="0.1412" stopColor="#1ABD4D" />
          <stop offset="0.251" stopColor="#6EC30D" />
          <stop offset="0.3098" stopColor="#8AC502" />
          <stop offset="0.3686" stopColor="#A2C600" />
          <stop offset="0.451" stopColor="#C8C903" />
          <stop offset="0.5412" stopColor="#EBCB03" />
          <stop offset="0.6196" stopColor="#F7CD07" />
          <stop offset="0.702" stopColor="#FDCD04" />
          <stop offset="0.7686" stopColor="#FDCE05" />
          <stop offset="0.8588" stopColor="#FFCE0A" />
          <stop offset="1" stopColor="#FFCE0A" />
        </radialGradient>
        <radialGradient
          id={id(2)}
          cx="2192.9299"
          cy="1963.396"
          r="465.709"
          gradientTransform="matrix(1 0 0 -1 0 2672)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FB4E5A" />
          <stop offset="0.4118" stopColor="#FB4E5A" />
          <stop offset="1" stopColor="#FF4540" />
        </radialGradient>
        <radialGradient
          id={id(3)}
          cx="2016.1837"
          cy="1833.5604"
          r="516.336"
          gradientTransform="matrix(-2.494 1.3827 1.8744 3.3876 3288.4592 -9180.2812)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FF4541" />
          <stop offset="0.2314" stopColor="#FF4541" />
          <stop offset="0.3098" stopColor="#FF4540" />
          <stop offset="0.4588" stopColor="#FF4640" />
          <stop offset="0.5412" stopColor="#FF473F" />
          <stop offset="0.702" stopColor="#FF5138" />
          <stop offset="0.7686" stopColor="#FF5B33" />
          <stop offset="0.8588" stopColor="#FF6C29" />
          <stop offset="1" stopColor="#FF8C18" />
        </radialGradient>
        <radialGradient
          id={id(4)}
          cx="1855.9985"
          cy="-741.8494"
          r="700.859"
          gradientTransform="matrix(-3.3352 -4.3581 -1.6071 1.2323 6352.5283 11518.7441)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0CBA65" />
          <stop offset="0.1294" stopColor="#0CBA65" />
          <stop offset="0.2118" stopColor="#0BB86D" />
          <stop offset="0.302" stopColor="#09B479" />
          <stop offset="0.4" stopColor="#08AD93" />
          <stop offset="0.4784" stopColor="#0AA6A9" />
          <stop offset="0.5686" stopColor="#0D9CC6" />
          <stop offset="0.6706" stopColor="#1893DD" />
          <stop offset="0.7686" stopColor="#258BF1" />
          <stop offset="0.8588" stopColor="#3086FF" />
          <stop offset="1" stopColor="#3086FF" />
        </radialGradient>
        <radialGradient
          id={id(5)}
          cx="1314.927"
          cy="1525.0094"
          r="476.521"
          gradientTransform="matrix(-0.3455 2.9874 4.1172 0.4792 -4607.6255 -4413.6558)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FF4E3A" />
          <stop offset="0.3686" stopColor="#FF4E3A" />
          <stop offset="0.4588" stopColor="#FF8A1B" />
          <stop offset="0.5412" stopColor="#FFA312" />
          <stop offset="0.6196" stopColor="#FFB60C" />
          <stop offset="0.7686" stopColor="#FFCD0A" />
          <stop offset="0.8588" stopColor="#FECF0A" />
          <stop offset="0.9216" stopColor="#FECF08" />
          <stop offset="1" stopColor="#FDCD01" />
        </radialGradient>
        <radialGradient
          id={id(6)}
          cx="1134.7397"
          cy="1798.9183"
          r="384.924"
          gradientTransform="matrix(-1.2391 1.3736 -3.8652 -3.503 9338.3271 4971.6069)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FF4C3C" />
          <stop offset="0.3216" stopColor="#FF4C3C" />
          <stop offset="0.6" stopColor="#FF692C" />
          <stop offset="0.7294" stopColor="#FF7825" />
          <stop offset="0.8784" stopColor="#FF8D1B" />
          <stop offset="1" stopColor="#FF9F13" />
        </radialGradient>
        <radialGradient
          id={id(7)}
          cx="2281.8198"
          cy="-845.0661"
          r="478.678"
          gradientTransform="matrix(-2.6897 -1.488 2.0215 -3.6457 9554.6182 3162.1162)"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#0FBC5F" />
          <stop offset="0.2314" stopColor="#0FBC5F" />
          <stop offset="0.3098" stopColor="#0FBC5F" />
          <stop offset="0.3686" stopColor="#0FBC5E" />
          <stop offset="0.4588" stopColor="#0FBC5D" />
          <stop offset="0.5412" stopColor="#12BC58" />
          <stop offset="0.702" stopColor="#28BF3C" />
          <stop offset="0.7686" stopColor="#38C02B" />
          <stop offset="0.8588" stopColor="#52C218" />
          <stop offset="0.9216" stopColor="#67C30F" />
          <stop offset="1" stopColor="#86C504" />
        </radialGradient>
      </defs>
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={`url(#${id(1)})`}
          d="M394,2284l598-223c-183-91-326-253-398-447c-4-11-7-22-11-33c-24-75-37-154-38-236H0c2,213,51,413,141,590v1
				C207,2066,292,2183,394,2284z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={`url(#${id(2)})`}
          d="M1849,731l-1-1c-63-60-166-136-312-174c-64-17-131-26-201-26h-2c-35-122-55-322,0-530h2c361,0,663,132,895,349L1849,731z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={`url(#${id(3)})`}
          d="M313,476c2,161,146,342,416,348c145-178,363-294,606-294c4,0,7,0,10,0l-9-530h-1c-289,0-555,92-774,247C469,313,386,390,313,476z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={`url(#${id(4)})`}
          d="M2311,1407l-264,185c0,3-1,7-1,10h11c-12,72-38,144-76,209c-43,75-97,132-153,175c-166,130-359,156-493,156c-5,0-10,0-14,0
				c-130,228-154,348,0,530c4,0,9,0,14,0c211,0,398-39,564-112c119-53,225-121,320-210c127-116,226-260,293-426s104-353,104-555
				L2311,1407z"
        />
        <path
          fill="#3086FF"
          d="M2053,1621h534c5-29,13-62,21-96c5-52,8-104,8-158c0-95-9-191-25-279l0,0H1336v514h721
				C2056,1608,2055,1615,2053,1621z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={`url(#${id(5)})`}
          d="M0,1363c93,52,455,43,545-1c0-9,0-17,0-26c0-89,14-173,41-254c45-135,126-256,230-350c-1-2-2-3-2-3c-1-4-18-1-21-4
				c-12-9-36-14-50-18c-31-9-82-28-110-48c-82-60-208-130-294-213c-78,87-145,185-198,291C50,919,0,1120,0,1336C0,1345,0,1354,0,1363
				z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={`url(#${id(6)})`}
          d="M775,771h-1l0,0c-39,3-84-8-139-42L263,539c84-112,184-211,298-292c76-54,158-100,244-137l228,483C936,634,848,696,775,771
				L775,771z"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          fill={`url(#${id(7)})`}
          d="M719,2020c-258,96-313,105-340,248c52,54,109,104,170,149c150,109,418,255,786,255h1v-530h-1c-149,0-289-43-408-117
				c-21,7-42,15-56,4C835,2003,750,2052,719,2020z"
        />
      </g>
    </svg>
  );
}

// Meta's mark, used wherever a company/provider badge needs it instead of a text glyph.
function MetaLogo({ size = 13 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} fill="currentColor">
      <path d="M5,19.5c0-4.6,2.3-9.4,5-9.4c1.5,0,2.7,0.9,4.6,3.6c-1.8,2.8-2.9,4.5-2.9,4.5c-2.4,3.8-3.2,4.6-4.5,4.6 C5.9,22.9,5,21.7,5,19.5 M20.7,17.8L19,15c-0.4-0.7-0.9-1.4-1.3-2c1.5-2.3,2.7-3.5,4.2-3.5c3,0,5.4,4.5,5.4,10.1 c0,2.1-0.7,3.3-2.1,3.3S23.3,22,20.7,17.8 M16.4,11c-2.2-2.9-4.1-4-6.3-4C5.5,7,2,13.1,2,19.5c0,4,1.9,6.5,5.1,6.5 c2.3,0,3.9-1.1,6.9-6.3c0,0,1.2-2.2,2.1-3.7c0.3,0.5,0.6,1,0.9,1.6l1.4,2.4c2.7,4.6,4.2,6.1,6.9,6.1c3.1,0,4.8-2.6,4.8-6.7 C30,12.6,26.4,7,22.1,7C19.8,7,18,8.8,16.4,11" />
    </svg>
  );
}

// Alibaba Cloud's mark, fixed brand orange as provided, sits on a neutral badge.
function AlibabaLogo({ size = 13 }) {
  return (
    <svg viewBox="0 0 1513 975" width={size} height={size}>
      <path
        fill="#ff5a00"
        d="m989.5 0h67.8c95.3 5.4 196.5 23.1 272.4 85.5 60.6 49.1 86.3 133 71.4 208.6-11.4 56.4-37.4 108.4-65.4 158.1-56.8 98.4-126.6 188.2-193 280.1-11.9 15.2-21.2 33.8-20 53.6 1.1 15.7 13.1 28.4 27.2 34 27.3 11.1 57.5 8.9 86.2 7.3 90.7-9.5 178.1-37 264.6-64.6 6.6-4.1 8.8 2.6 11.3 7.4-91.9 61.3-190.8 112.4-294.8 150-57.5 19.3-118.3 37.6-179.6 30.4-32.2-3.2-64.5-22.4-74.6-54.5-12.5-41.8-7.9-88.1 10.2-127.6 27.5-61.7 70.2-114.7 110.7-168.2 67.1-88 136.4-175.5 189.1-273.3 17.4-34.7 36-76.8 18.7-115.1-16.3-35.3-51.7-56.1-85.6-71.8-60.2-26.9-124.4-43.1-187.7-61.1q-14.3 9.4-28.5 19c22 16.8 44 33.6 65.8 50.7-83.3 15-166.3 31.8-248.3 52.7-124.9 31-246.8 72.5-367.6 116.5 11.8 23.5 23.5 47.1 34.7 70.9-27.3 30.2-54.4 60.7-81.7 90.9 65.6 19.6 136.3 22.3 203.2 7.5 57.2-12.8 111-40.2 154.7-79.3-11.9-14.8-26.9-26.7-43.1-36.5 53.1 1.1 101.4 47.4 101.5 101.1q-15.6 0.1-31 0.2c-2.2-11.7-5.3-23-9.4-34.1-60.3 54.5-138.2 88.6-218.9 97.4-71.1 8.2-143.8-1.6-210.7-26.6 4.5 41.4 9 82.6 13.2 124-38 14.8-73.3 36.2-104.9 62-25.1 21.9-50 47.1-59.6 79.9-9.2 28.9 5.8 61.7 31.1 77.2 30.7 19 66.5 27.8 101.9 32.9 46.7 6.1 93.9 5.6 140.8 2.3 92.1-6.8 183.1-24.1 272.7-45.8 8.9-3.6 13.1 11.1 4 13.4-71.5 36.8-146.3 67.8-224.3 87.8-73.3 18.9-148.8 28.6-224.4 31.2-77.1-2.4-159-17.3-220.1-67.8-45.4-36.8-69.3-95.2-69.5-153.1v-3.1c1.5-61.2 22.2-120.4 52-173.4 39.2-74.8 87.5-145 144.6-207.3 98.7-108.7 222.5-192.8 355.6-253.7 137.9-62.5 285.5-107.4 437.3-115.7z"
      />
    </svg>
  );
}

// --- Model catalog ---
// "provider" is which backend/API Kuro calls (claude | groq | openai | gemini).
// Models are grouped by the lab that actually created them — hosting/inference
// provider (e.g. Groq) is just metadata, shown as a small tag, not a grouping bucket.
const COMPANIES = [
  {
    id: "anthropic",
    name: "Anthropic",
    mark: { bg: "#EDE9E2", fg: "#1a1512", glyph: "svg:anthropic" },
    models: [
      { id: "claude-opus-4-8", name: "Opus 4.8", note: "most capable, deepest reasoning", provider: "claude", host: null },
      { id: "claude-sonnet-5", name: "Sonnet 5", note: "balanced, fast", provider: "claude", host: null },
      { id: "claude-fable-5", name: "Fable 5", note: "Mythos-tier, extra safety layers", provider: "claude", host: null },
      { id: "claude-haiku-4-5-20251001", name: "Haiku 4.5", note: "fastest, lightweight", provider: "claude", host: null },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    mark: { bg: "#EDE9E2", fg: "#181614", glyph: "svg:openai" },
    models: [
      { id: "gpt-5.6-sol", name: "GPT-5.6 Sol", note: "flagship · 1.05M ctx", provider: "openai", host: null },
      { id: "gpt-5.6-terra", name: "GPT-5.6 Terra", note: "balanced · 1.05M ctx", provider: "openai", host: null },
      { id: "gpt-5.6-luna", name: "GPT-5.6 Luna", note: "cost-efficient · 1.05M ctx", provider: "openai", host: null },
      { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", note: "500 t/s · 131K ctx", provider: "groq", host: "Groq" },
      { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", note: "1000 t/s · 131K ctx", provider: "groq", host: "Groq" },
      { id: "openai/gpt-oss-safeguard-20b", name: "GPT-OSS Safeguard 20B", note: "preview · moderation", provider: "groq", host: "Groq" },
    ],
  },
  {
    id: "google",
    name: "Google",
    mark: { bg: "#ffffff", fg: "#181614", glyph: "svg:google" },
    models: [
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", note: "preview · frontier reasoning", provider: "gemini", host: null },
      { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash", note: "coding & agentic workflows", provider: "gemini", host: null },
      { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash", note: "balanced, multimodal", provider: "gemini", host: null },
      { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite", note: "fastest, high-throughput", provider: "gemini", host: null },
    ],
  },
  {
    id: "meta",
    name: "Meta",
    mark: { bg: "#0866FF", fg: "#ffffff", glyph: "svg:meta" },
    models: [
      { id: "meta-llama/llama-prompt-guard-2-86m", name: "Llama Prompt Guard 2 86M", note: "preview · safety", provider: "groq", host: "Groq" },
      { id: "meta-llama/llama-prompt-guard-2-22m", name: "Llama Prompt Guard 2 22M", note: "preview · safety", provider: "groq", host: "Groq" },
    ],
  },
  {
    id: "alibaba",
    name: "Alibaba Cloud",
    mark: { bg: "#ffffff", fg: "#181614", glyph: "svg:alibaba" },
    models: [
      { id: "qwen/qwen3.6-27b", name: "Qwen3.6 27B", note: "preview · 131K ctx", provider: "groq", host: "Groq" },
    ],
  },
  {
    id: "minimax",
    name: "MiniMax",
    mark: { bg: "#E8384F", fg: "#ffffff", glyph: "M" },
    models: [
      { id: "minimaxai/minimax-m2.7", name: "MiniMax M2.7", note: "preview · 196K ctx", provider: "groq", host: "Groq" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    mark: { bg: "#F55036", fg: "#ffffff", glyph: "svg:groq" },
    models: [
      { id: "groq/compound", name: "Compound", note: "450 t/s · agentic system", provider: "groq", host: null },
      { id: "groq/compound-mini", name: "Compound Mini", note: "450 t/s · agentic system", provider: "groq", host: null },
    ],
  },
];

function findModelById(id) {
  for (const c of COMPANIES) {
    const m = c.models.find((mm) => mm.id === id);
    if (m) return m;
  }
  return null;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function nowLabel() {
  return new Date().toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// --- Lightweight markdown renderer (no external deps) ---

function renderInline(text, keyPrefix) {
  // Handles: **bold**, *italic*/_italic_, `code`, [text](url)
  const nodes = [];
  let remaining = text;
  let key = 0;
  const pattern = /(\*\*(.+?)\*\*|`([^`]+?)`|\[([^\]]+)\]\(([^)]+)\)|\*(?!\*)(.+?)\*|_(.+?)_)/;

  while (remaining.length > 0) {
    const m = pattern.exec(remaining);
    if (!m) {
      nodes.push(remaining);
      break;
    }
    if (m.index > 0) nodes.push(remaining.slice(0, m.index));

    if (m[2] !== undefined) {
      nodes.push(<strong key={`${keyPrefix}-b${key++}`}>{m[2]}</strong>);
    } else if (m[3] !== undefined) {
      nodes.push(
        <code
          key={`${keyPrefix}-c${key++}`}
          style={{
            fontFamily: MONO_FONT,
            fontSize: "0.88em",
            background: "#2a251f",
            padding: "1px 5px",
            borderRadius: 4,
          }}
        >
          {m[3]}
        </code>
      );
    } else if (m[4] !== undefined && m[5] !== undefined) {
      nodes.push(
        <a
          key={`${keyPrefix}-a${key++}`}
          href={m[5]}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#C4623A", textDecoration: "underline" }}
        >
          {m[4]}
        </a>
      );
    } else if (m[6] !== undefined || m[7] !== undefined) {
      nodes.push(<em key={`${keyPrefix}-i${key++}`}>{m[6] ?? m[7]}</em>);
    }

    remaining = remaining.slice(m.index + m[0].length);
  }
  return nodes;
}

function Markdown({ text }) {
  if (!text) return null;

  const lines = text.split("\n");
  const blocks = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre
          key={`blk-${blockKey++}`}
          style={{
            background: "#151310",
            border: "1px solid #2a2622",
            borderRadius: 10,
            padding: "12px 14px",
            overflowX: "auto",
            margin: "8px 0",
          }}
        >
          <code
            style={{
              fontFamily: MONO_FONT,
              fontSize: 13,
              lineHeight: 1.55,
              color: "#EDE9E2",
              whiteSpace: "pre",
            }}
          >
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const sizes = { 1: 20, 2: 18, 3: 16.5, 4: 15.5 };
      blocks.push(
        <div
          key={`blk-${blockKey++}`}
          style={{
            fontSize: sizes[level],
            fontWeight: 600,
            margin: level <= 2 ? "14px 0 6px" : "10px 0 4px",
          }}
        >
          {renderInline(headingMatch[2], `h${blockKey}`)}
        </div>
      );
      i++;
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <div
          key={`blk-${blockKey++}`}
          style={{
            borderLeft: "3px solid #3a3632",
            paddingLeft: 12,
            margin: "8px 0",
            color: "#a39d92",
          }}
        >
          {quoteLines.map((ql, idx) => (
            <div key={idx}>{renderInline(ql, `bq${blockKey}-${idx}`)}</div>
          ))}
        </div>
      );
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`blk-${blockKey++}`} style={{ margin: "6px 0", paddingLeft: 22 }}>
          {items.map((it, idx) => (
            <li key={idx} style={{ marginBottom: 3 }}>
              {renderInline(it, `ul${blockKey}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`blk-${blockKey++}`} style={{ margin: "6px 0", paddingLeft: 22 }}>
          {items.map((it, idx) => (
            <li key={idx} style={{ marginBottom: 3 }}>
              {renderInline(it, `ol${blockKey}-${idx}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph (consume consecutive plain lines)
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^```/.test(lines[i]) &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(
      <div key={`blk-${blockKey++}`} style={{ margin: "0 0 4px" }}>
        {renderInline(paraLines.join("\n"), `p${blockKey}`)}
      </div>
    );
  }

  return <>{blocks}</>;
}

// Inline, in-flow marker for a tool call — deliberately NOT a chip/pill, just
// smaller, dimmer text sitting in the message flow so it reads as part of the
// same reply rather than a separate UI element. While the call is in flight a
// soft light sweep passes through the text every couple of seconds; once it
// resolves the sweep stops and the line just sits there, dimmed, as a small
// permanent record of what happened during that reply.
function ToolCallLine({ toolName, serverLabel, status }) {
  const label = serverLabel ? `${serverLabel} · ${toolName}` : toolName;
  const verb = status === "error" ? "Couldn't use" : status === "running" ? "Using" : "Used";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        margin: "2px 0 4px",
        fontFamily: UI_FONT,
      }}
    >
      <Plug size={11} style={{ color: "#5c574e", flexShrink: 0 }} />
      <span
        className={status === "running" ? "tool-call-shimmer" : undefined}
        style={{
          fontSize: 12,
          color: status === "error" ? "#a45a4a" : "#6b655c",
        }}
      >
        {verb} {label}
      </span>
      {status === "running" && (
        <style>{`
          .tool-call-shimmer {
            background: linear-gradient(90deg, #6b655c 40%, #EDE9E2 50%, #6b655c 60%);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: toolShimmer 2.2s ease-in-out infinite;
          }
          @keyframes toolShimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      )}
    </div>
  );
}

// Splits an assistant message's content + toolEvents into an ordered sequence
// of text segments and tool-call lines, so they render inline in one bubble
// instead of the tool call looking like a separate message.
function AssistantContent({ content, toolEvents }) {
  if (!toolEvents || toolEvents.length === 0) {
    return <Markdown text={content} />;
  }
  const sorted = [...toolEvents].sort((a, b) => a.atLength - b.atLength);
  const pieces = [];
  let cursor = 0;
  sorted.forEach((ev, i) => {
    const segment = content.slice(cursor, ev.atLength);
    if (segment) pieces.push(<Markdown key={`t${i}`} text={segment} />);
    pieces.push(
      <ToolCallLine key={ev.id} toolName={ev.toolName} serverLabel={ev.serverLabel} status={ev.status} />
    );
    cursor = ev.atLength;
  });
  const tail = content.slice(cursor);
  if (tail) pieces.push(<Markdown key="tail" text={tail} />);
  return <>{pieces}</>;
}

// ============================================================================
// Local tool-calling framework
// ----------------------------------------------------------------------------
// Kuro no longer hands MCP servers off to the model provider's API to call
// server-side. Instead this app is its own MCP client: it speaks JSON-RPC 2.0
// directly to each configured server over Streamable HTTP, and exposes those
// tools (plus any future built-ins) to the model through a single prompted
// convention — a fenced ```tool_call block containing JSON — rather than each
// provider's native (and mutually incompatible) function-calling APIs. This
// keeps tool support identical across Claude/Groq/OpenAI/Gemini and easy to
// extend with non-MCP tools later (web search, widgets, webhooks, etc.) since
// they'd all register into the same tool registry below.
// ============================================================================

// Tool calls are wrapped in a bare XML tag rather than a fenced code block.
// Markdown fences (```something) collide with a pattern every model has
// seen a million times in ordinary code-formatting contexts, so weaker
// models regress to ```json, add narration around the fence, etc. An XML
// tag with a name that never occurs in normal prose or code is far less
// likely to be produced by accident or drifted away from, and it's cheap to
// scan for mid-stream (see scanForToolCall below) without waiting for a
// closing fence that never comes.
const TOOL_CALL_TAG_OPEN = "<tool_call>";
const TOOL_CALL_TAG_CLOSE = "</tool_call>";
const MAX_TOOL_ROUNDTRIPS = 6; // safety cap so a confused model can't loop forever

// Per-server cache of { tools, sessionId } discovered via initialize + tools/list.
// Keyed by server id so re-sending a message doesn't always re-handshake.
const mcpServerCache = new Map();

async function mcpRpc(server, method, params, sessionId, signal) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (server.token) headers["Authorization"] = `Bearer ${server.token}`;
  if (sessionId) headers["Mcp-Session-Id"] = sessionId;

  const res = await fetch(server.url, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({ jsonrpc: "2.0", id: uid(), method, params: params || {} }),
  });

  const newSessionId = res.headers.get("Mcp-Session-Id") || sessionId || null;
  const contentType = res.headers.get("Content-Type") || "";

  if (!res.ok) {
    throw new Error(`MCP server "${server.name}" returned ${res.status} for ${method}`);
  }

  // Streamable HTTP responses are either a single JSON object or an SSE stream
  // carrying one (occasionally more) JSON-RPC messages as "data:" events.
  if (contentType.includes("text/event-stream")) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let result = null;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (!data) continue;
        try {
          const msg = JSON.parse(data);
          if (msg.id !== undefined) {
            result = msg;
            reader.cancel();
            break;
          }
        } catch {
          // ignore malformed lines
        }
      }
      if (result) break;
    }
    if (!result) throw new Error(`MCP server "${server.name}" closed the stream without a response`);
    if (result.error) throw new Error(result.error.message || `MCP error from "${server.name}"`);
    return { result: result.result, sessionId: newSessionId };
  }

  const body = await res.json();
  if (body.error) throw new Error(body.error.message || `MCP error from "${server.name}"`);
  return { result: body.result, sessionId: newSessionId };
}

// Handshake + list tools for one server, using the cache if we've already done so.
async function mcpDiscoverTools(server, signal) {
  const cached = mcpServerCache.get(server.id);
  if (cached) return cached;

  const init = await mcpRpc(
    server,
    "initialize",
    {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "Kuro", version: "1.0.0" },
    },
    null,
    signal
  );
  const sessionId = init.sessionId;

  // Fire-and-forget notification, per spec, to complete the handshake.
  fetch(server.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
      ...(server.token ? { Authorization: `Bearer ${server.token}` } : {}),
      ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
    },
    body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: {} }),
  }).catch(() => {});

  const listed = await mcpRpc(server, "tools/list", {}, sessionId, signal);
  const tools = (listed.result?.tools || []).map((t) => ({
    fullName: `${server.name}__${t.name}`,
    toolName: t.name,
    serverId: server.id,
    serverLabel: server.name,
    description: t.description || "",
    inputSchema: t.inputSchema || { type: "object", properties: {} },
  }));

  const entry = { tools, sessionId };
  mcpServerCache.set(server.id, entry);
  return entry;
}

// Clears cached discovery for a server (call when a server is edited/removed
// so a stale session id or tool list doesn't linger).
function mcpForgetServer(serverId) {
  mcpServerCache.delete(serverId);
}

// Discovers tools across every enabled server. Servers that fail to connect
// are skipped silently (their tools just won't be offered this turn) rather
// than blocking the whole conversation on one broken connector.
// ----------------------------------------------------------------------------
// Built-in tools — same registry, no MCP server involved. Each one carries its
// own execute(args) function that runs locally in the browser. Kuro doesn't
// treat these specially anywhere else: they're merged into the same tool list
// the model sees and called through the same fenced tool_call convention.
// ----------------------------------------------------------------------------
const BUILTIN_TOOLS = [
  {
    fullName: "kuro__calculator",
    toolName: "calculator",
    serverId: null,
    serverLabel: "Kuro",
    description:
      "Evaluates a basic arithmetic expression and returns the numeric result. Supports + - * / % ^, parentheses, and decimals. Use this instead of doing math by hand whenever a calculation matters.",
    inputSchema: {
      type: "object",
      properties: {
        expression: { type: "string", description: 'Math expression, e.g. "(12 + 8) * 3 / 2"' },
      },
      required: ["expression"],
    },
    execute: (args) => {
      const expr = String(args?.expression ?? "");
      // Only allow digits, whitespace, and arithmetic operators/parentheses —
      // never eval() arbitrary model-provided text.
      if (!/^[0-9+\-*/%^().\s]+$/.test(expr)) {
        throw new Error("Expression contains characters other than numbers, spaces, and + - * / % ^ ( ).");
      }
      const sanitized = expr.replace(/\^/g, "**");
      let value;
      try {
        // eslint-disable-next-line no-new-func
        value = Function(`"use strict"; return (${sanitized});`)();
      } catch {
        throw new Error("Couldn't evaluate that expression.");
      }
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error("Expression didn't evaluate to a finite number.");
      }
      return String(value);
    },
  },
];

// Web search/fetch, backed by Exa (https://exa.ai) via a Cloudflare Worker proxy.
// The worker forwards requests to api.exa.ai server-side, bypassing browser CORS
// restrictions. The worker is hosted at a fixed address, so only an Exa API key
// is needed — it lives in component state and is closed over inside each tool's
// execute(). The tools are always registered; a missing key throws
// MissingExaKeyError, which the UI layer (see handleSend/handleRegenerate)
// catches to pop the setup modal instead of just letting the model see a
// generic tool failure.
class MissingExaKeyError extends Error {}

const EXA_WORKER_BASE = "https://kuro.itsricky.dev/api/exa";

function buildExaTools(exaApiKey) {
  const key = (exaApiKey || "").trim();
  const workerBase = EXA_WORKER_BASE;

  async function exaRequest(path, body, signal) {
    if (!key) {
      throw new MissingExaKeyError("An Exa API key is required for web search.");
    }
    const res = await fetch(`${workerBase}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Exa-Api-Key": key },
      signal,
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(errBody?.error || errBody?.message || `Exa request failed (${res.status})`);
    }
    return res.json();
  }

  return [
    {
      fullName: "kuro__web_search",
      toolName: "web_search",
      serverId: null,
      serverLabel: "Kuro",
      description:
        "Searches the live web and returns a list of relevant results (title, URL, published date, and a short highlight/snippet). Use this whenever you need current information, facts you're unsure about, or anything that could have changed since your training — then use web_fetch on a promising URL if you need the full page.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Natural-language search query." },
          numResults: { type: "number", description: "How many results to return, 1-10. Defaults to 5." },
        },
        required: ["query"],
      },
      execute: async (args, signal) => {
        const query = String(args?.query ?? "").trim();
        if (!query) throw new Error("A search query is required.");
        const numResults = Math.max(1, Math.min(10, Number(args?.numResults) || 5));
        const data = await exaRequest(
          "/search",
          { query, numResults, contents: { highlights: true } },
          signal
        );
        const results = data?.results || [];
        if (!results.length) return "No results found.";
        return results
          .map((r, i) => {
            const highlight = (r.highlights || []).join(" ").slice(0, 400);
            const date = r.publishedDate ? ` (${r.publishedDate.slice(0, 10)})` : "";
            return `${i + 1}. ${r.title || "(untitled)"}${date}\n${r.url}\n${highlight}`.trim();
          })
          .join("\n\n");
      },
    },
    {
      fullName: "kuro__web_fetch",
      toolName: "web_fetch",
      serverId: null,
      serverLabel: "Kuro",
      description:
        "Fetches a specific URL and returns its readable text content (HTML/scripts stripped). Use this after web_search to read the full page behind a promising result, or when the user gives you a URL directly.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "The full URL to fetch, including https://." },
        },
        required: ["url"],
      },
      execute: async (args, signal) => {
        const url = String(args?.url ?? "").trim();
        if (!url) throw new Error("A URL is required.");
        const data = await exaRequest("/contents", { urls: [url], text: { maxCharacters: 6000 } }, signal);
        const status = (data?.statuses || [])[0];
        if (status && status.status === "error") {
          throw new Error(status.error?.tag ? `Couldn't fetch that page (${status.error.tag}).` : "Couldn't fetch that page.");
        }
        const result = (data?.results || [])[0];
        if (!result || !result.text) return "(no readable content at that URL)";
        const title = result.title ? `${result.title}\n${url}\n\n` : "";
        return title + result.text;
      },
    },
  ];
}

async function getAllTools(mcpServers, signal, exaApiKey) {
  const enabled = (mcpServers || []).filter((s) => s.enabled && s.url && s.name);
  const results = await Promise.allSettled(enabled.map((s) => mcpDiscoverTools(s, signal)));
  const tools = [...BUILTIN_TOOLS, ...buildExaTools(exaApiKey)];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      tools.push(...r.value.tools.map((t) => ({ ...t, server: enabled[i] })));
    }
  });
  return tools;
}

async function callTool(tool, args, signal) {
  if (tool.execute) {
    // Built-in tool — runs locally, no network round trip (unless it's one
    // of the Exa web tools, which do fetch and honor the abort signal).
    return await tool.execute(args, signal);
  }
  const cached = mcpServerCache.get(tool.serverId);
  const sessionId = cached?.sessionId || null;
  const { result } = await mcpRpc(
    tool.server,
    "tools/call",
    { name: tool.toolName, arguments: args || {} },
    sessionId,
    signal
  );
  if (result?.isError) {
    const msg = (result.content || []).map((c) => c.text || "").join("\n") || "Tool call failed.";
    throw new Error(msg);
  }
  // Tool results are a list of content blocks; flatten text blocks for the model.
  const text = (result?.content || [])
    .map((c) => (c.type === "text" ? c.text : c.type ? `[${c.type} content]` : ""))
    .filter(Boolean)
    .join("\n");
  return text || "(tool returned no content)";
}

// Builds the system-prompt section that tells the model which tools exist and
// the exact fenced-JSON convention to use when it wants to call one.
//
// This is deliberately over-explicit. The parser (scanForToolCall) does a
// literal string search for the exact substrings "```tool_call" and "```" —
// it is not a lenient/fuzzy parser. Any deviation (```json, ``` tool_call,
// prose before/after on the same line, a second fenced block, etc.) means
// the tool call is silently missed and the model's turn just reads as
// garbled text to the user. Weaker or less-instruction-tuned models default
// to habits learned from normal code-block formatting (adding "json" as the
// tag, narrating what they're about to do, chatting after the block) so the
// prompt spells out the one acceptable form and explicitly rules out the
// nearby-but-wrong forms it tends to produce instead.
function buildToolsPromptBlock(tools) {
  if (!tools.length) return "";
  const list = tools
    .map((t) => {
      const schema = JSON.stringify(t.inputSchema);
      return `- ${t.fullName}: ${t.description || "No description."} Arguments schema: ${schema}`;
    })
    .join("\n");
  return `

## Tools

You have access to the following tools:
${list}

### How to call a tool — read this carefully, the format below is exact and has no variations

When you want to call a tool, your entire output for that turn must be ONLY this, with nothing else on any side of it:
${TOOL_CALL_TAG_OPEN}{"name": "servername__toolname", "args": {"key": "value"}}${TOOL_CALL_TAG_CLOSE}

That's it — the literal opening tag, one line of strict single-line JSON with exactly two keys ("name" and "args"), then the literal closing tag. Not a code block. Not inside backticks. Not inside triple backticks. A bare tag, exactly like the example above, with real double-quoted JSON in between.

This tag is invisible to the user — it never gets shown to them, it's stripped out and interpreted as a tool call the instant it's recognized. That means:
- Nothing before it: no "Let me calculate that" or "I'll check the weather" in the same turn. Say nothing, emit only the tag.
- Nothing after it: no explanation or follow-up in the same turn. Stop generating the moment the closing tag is written.
- Nothing wrapped around it: never put ${TOOL_CALL_TAG_OPEN} inside backticks or a fenced code block — that would make it visible text instead of a real call, and it would not be recognized.

Common mistakes other models make — every one of these is WRONG and will NOT be recognized as a tool call, it will just be shown to the user as broken or missing text:
- Wrapping the tag in backticks or a \`\`\` fence, e.g. \`${TOOL_CALL_TAG_OPEN}...${TOOL_CALL_TAG_CLOSE}\` — this is the single most common mistake to avoid. The tag must appear bare, completely unwrapped, or it will not be caught.
- Using a different tag name, casing, or attributes, e.g. <ToolCall>, <tool-call>, <tool_call name="...">, or <function_call> — the tag is always exactly ${TOOL_CALL_TAG_OPEN} with no attributes, closed with exactly ${TOOL_CALL_TAG_CLOSE}.
- Writing a sentence first, like "Let me calculate that:" before the tag — say nothing before it.
- Adding an explanation or follow-up after the closing tag in the same turn — say nothing after it.
- Pretty-printing the JSON across multiple lines, adding trailing commas, using single quotes, or wrapping the JSON in extra prose inside the tag — it must be one line of strict, valid JSON with double-quoted keys and strings.
- Using different key names like "tool", "function", "tool_name", or "parameters" — the keys are always exactly "name" and "args".
- Emitting more than one tool_call tag in the same turn — exactly one per turn.
- Fabricating what the tool would return and continuing the answer as if you already had a result — never do this. A tool call means you stop and wait; you do not simulate the tool result yourself.

No exceptions to any of the above, regardless of which tool you're calling or how simple the call seems. After you emit the tag exactly as shown, stop generating immediately — the real tool result will be given back to you, and you continue your reply naturally afterward as if uninterrupted. Never mention this tool_call mechanism to the user; it's internal, not something to explain or describe to them.

### A separate rule about XML in general, unrelated to tools

If you ever write XML-style tags for any other reason (showing someone an HTML/XML snippet, explaining markup, writing example code, etc.), that XML is user-facing and must never be left bare, because a bare tag risks being misread as the tool mechanism above. Always wrap it in backticks:
- A short, one-line piece of XML/HTML goes in single backticks, like \`<div class="card">\`.
- Multi-line XML/HTML, or anything long enough to be a code sample, goes in a triple-backtick fenced block, the same way you'd format any other code.
The only tag that must NEVER appear inside backticks is the real ${TOOL_CALL_TAG_OPEN} tool call itself — that one must always be bare so it gets recognized. Every other tag, always wrapped.`;
}

// Key names weaker/drifting models substitute for the real "name"/"args"
// keys, despite instructions. Normalized on the way out so a near-miss
// still fires the tool instead of falling into the "tool doesn't exist"
// branch with name === undefined.
const TOOL_CALL_NAME_ALIASES = ["name", "tool", "tool_name", "function", "function_name"];
const TOOL_CALL_ARGS_ALIASES = ["args", "arguments", "parameters", "params", "input"];

function normalizeToolCallObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const normalized = {};
  for (const key of TOOL_CALL_NAME_ALIASES) {
    if (obj[key] !== undefined) {
      normalized.name = obj[key];
      break;
    }
  }
  for (const key of TOOL_CALL_ARGS_ALIASES) {
    if (obj[key] !== undefined) {
      normalized.args = obj[key];
      break;
    }
  }
  if (normalized.args === undefined) normalized.args = {};
  return normalized;
}

// Case/whitespace-tolerant search for the closing tag, since a drifting
// model is far more likely to mangle capitalization or add a stray space
// than to get the opening tag right and immediately botch the closing one.
const CLOSE_TAG_RE = /<\s*\/\s*tool_call\s*>/i;

// The longest strict prefix of the open tag that could still be sitting at
// the very end of the buffer mid-stream, e.g. "<tool_c" while more chunks
// are still arriving. Used so we never flash a half-written tag to the user
// for a frame before finally recognizing it.
function longestOpenTagPrefixAtEnd(buffer) {
  const max = Math.min(buffer.length, TOOL_CALL_TAG_OPEN.length - 1);
  for (let len = max; len > 0; len--) {
    if (buffer.slice(-len) === TOOL_CALL_TAG_OPEN.slice(0, len)) return len;
  }
  return 0;
}

// True if position `idx` in buffer falls inside an open backtick span —
// inline `code`, or a ``` fenced block — per the system prompt's rule that
// user-facing example XML must be wrapped in backticks. A real tool call is
// always bare, so being inside backticks means "this is a shown example,
// don't treat it as a call" rather than "malformed call". Scans from the
// start of the buffer tracking fence/inline-code state, since the opening
// backtick(s) can be lines away from the tag itself (e.g. a ``` fence).
function isBacktickWrapped(buffer, idx) {
  const before = buffer.slice(0, idx);
  let inFence = false;
  let inInline = false;
  let i = 0;
  while (i < before.length) {
    if (!inInline && before.startsWith("```", i)) {
      inFence = !inFence;
      i += 3;
      continue;
    }
    if (!inFence && before[i] === "`") {
      inInline = !inInline;
      i += 1;
      continue;
    }
    i += 1;
  }
  return inFence || inInline;
}

// Incrementally scans a growing text buffer for a complete <tool_call> tag.
// Returns { visible, pending, complete } where:
//   visible  = text that's safe to show the user right now (tag stripped)
//   pending  = true if we're mid-tag and holding text back
//   complete = the parsed {name, args} once the closing tag arrives, else null
function scanForToolCall(buffer) {
  let searchFrom = 0;
  while (true) {
    const openIdx = buffer.indexOf(TOOL_CALL_TAG_OPEN, searchFrom);
    if (openIdx === -1) {
      // No full open tag anywhere. But a prefix of it might be sitting at
      // the tail end of the buffer, mid-stream — hold that prefix back so
      // it doesn't flash on screen a character at a time.
      const prefixLen = longestOpenTagPrefixAtEnd(buffer);
      if (prefixLen > 0) {
        return { visible: buffer.slice(0, buffer.length - prefixLen), pending: true, complete: null, rest: "" };
      }
      return { visible: buffer, pending: false, complete: null, rest: "" };
    }

    if (isBacktickWrapped(buffer, openIdx)) {
      // Deliberately-shown example XML, not a real call — skip past it and
      // keep scanning in case a genuine bare tag follows later in the turn.
      searchFrom = openIdx + TOOL_CALL_TAG_OPEN.length;
      continue;
    }

    const afterOpen = openIdx + TOOL_CALL_TAG_OPEN.length;
    const closeMatch = CLOSE_TAG_RE.exec(buffer.slice(afterOpen));
    const visible = buffer.slice(0, openIdx);
    if (!closeMatch) {
      // Still streaming the JSON body — hold everything from the tag onward back.
      return { visible, pending: true, complete: null, rest: "" };
    }
    const closeIdx = afterOpen + closeMatch.index;
    const jsonText = buffer.slice(afterOpen, closeIdx).trim();
    const rest = buffer.slice(closeIdx + closeMatch[0].length);
    let complete = null;
    try {
      complete = normalizeToolCallObject(JSON.parse(jsonText));
      if (!complete.name) complete = { __parseError: true };
    } catch {
      complete = { __parseError: true };
    }
    return { visible, pending: false, complete, rest };
  }
}

// Runs the full tool-calling loop on top of a provider-specific single-turn
// streaming function. `streamOneTurn(turnMessages, onRawChunk)` should perform
// exactly one HTTP call and forward raw text deltas to onRawChunk — no tool
// logic lives there anymore, it's all centralized here so every provider gets
// identical tool behavior.
//
// onTextChunk(chunk) is called only with text that should actually render.
// onToolEvent(event) is called with { id, toolName, serverLabel, status } so
// the UI can show the inline shimmering status line without ending the turn.
async function runAgentLoop({ streamOneTurn, initialMessages, tools, onTextChunk, onToolEvent, onMissingExaKey, signal }) {
  let turnMessages = initialMessages;
  let roundtrips = 0;

  while (true) {
    let buffer = "";
    let visibleSoFar = "";
    let toolCallRaw = null;
    let toolCallResult = null;

    await streamOneTurn(turnMessages, (rawChunk) => {
      buffer += rawChunk;
      const scan = scanForToolCall(buffer);
      if (scan.visible) {
        onTextChunk(scan.visible);
        visibleSoFar += scan.visible;
        buffer = buffer.slice(scan.visible.length);
      }
      if (scan.complete) {
        toolCallResult = scan.complete;
        toolCallRaw = buffer; // the fenced block itself, for the transcript we send back
      }
    });

    if (!toolCallResult || roundtrips >= MAX_TOOL_ROUNDTRIPS) {
      return;
    }
    roundtrips++;

    // The model's own turn must stay non-empty for every provider's API, so it
    // carries whatever visible text preceded the tool call (or a neutral note
    // if it called a tool with no preamble) plus the raw tool_call block, which
    // keeps the transcript coherent if the model looks back at its own turn.
    const assistantTurnContent = (visibleSoFar + toolCallRaw).trim() || "(requesting a tool call)";

    if (toolCallResult.__parseError || !toolCallResult.name) {
      // Model emitted a malformed tool_call block — tell it so and let it retry
      // or just continue answering, rather than silently breaking the turn.
      turnMessages = [
        ...turnMessages,
        { role: "assistant", content: assistantTurnContent },
        { role: "user", content: "Your last tool_call block wasn't valid JSON with a name/args. Please continue your answer, calling a tool again only if truly needed." },
      ];
      continue;
    }

    const tool = tools.find((t) => t.fullName === toolCallResult.name);
    const eventId = uid();

    if (!tool) {
      onToolEvent({ id: eventId, toolName: toolCallResult.name, serverLabel: null, status: "error" });
      turnMessages = [
        ...turnMessages,
        { role: "assistant", content: assistantTurnContent },
        { role: "user", content: `Tool "${toolCallResult.name}" doesn't exist. Continue your answer without it, or use one of the listed tools.` },
      ];
      continue;
    }

    onToolEvent({ id: eventId, toolName: tool.toolName, serverLabel: tool.serverLabel, status: "running" });
    try {
      const resultText = await callTool(tool, toolCallResult.args, signal);
      onToolEvent({ id: eventId, toolName: tool.toolName, serverLabel: tool.serverLabel, status: "done" });
      turnMessages = [
        ...turnMessages,
        { role: "assistant", content: assistantTurnContent },
        { role: "user", content: `Tool result for ${tool.fullName}:\n${resultText}` },
      ];
    } catch (e) {
      onToolEvent({ id: eventId, toolName: tool.toolName, serverLabel: tool.serverLabel, status: "error" });
      if (e instanceof MissingExaKeyError && onMissingExaKey) {
        onMissingExaKey();
      }
      turnMessages = [
        ...turnMessages,
        { role: "assistant", content: assistantTurnContent },
        { role: "user", content: `Tool "${tool.fullName}" failed: ${e.message}. Continue your answer, noting the failure if relevant.` },
      ];
    }
  }
}

async function streamClaude(messages, userName, apiKey, onChunk, signal, toolsPromptBlock, model) {
  const body = {
    model: model || "claude-sonnet-4-6",
    max_tokens: 1000,
    stream: true,
    system:
      `Your name is Kuro. If asked your name or who you are, answer as Kuro. Otherwise just be a helpful, direct general-purpose assistant.` +
      (userName
        ? ` The person you're talking to goes by "${userName}". Address them by that name when it's natural to do so, without overusing it.`
        : "") +
      (toolsPromptBlock || ""),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  };

  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true",
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message || `Request failed (${res.status})`);
  }
  const reader = res.body.getReader();
  if (signal) {
    if (signal.aborted) {
      reader.cancel();
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }
    signal.addEventListener("abort", () => reader.cancel(), { once: true });
  }
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    let done, value;
    try {
      ({ done, value } = await reader.read());
    } catch (e) {
      if (signal?.aborted) {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }
      throw e;
    }
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop(); // keep incomplete line
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data) continue;
      try {
        const evt = JSON.parse(data);
        if (
          evt.type === "content_block_delta" &&
          evt.delta?.type === "text_delta" &&
          evt.delta.text
        ) {
          onChunk(evt.delta.text);
        }
      } catch {
        // ignore malformed lines
      }
    }
  }
}

async function streamGroq(messages, userName, apiKey, model, onChunk, signal, toolsPromptBlock) {
  const systemPrompt =
    `Your name is Kuro. If asked your name or who you are, answer as Kuro. Otherwise just be a helpful, direct general-purpose assistant.` +
    (userName
      ? ` The person you're talking to goes by "${userName}". Address them by that name when it's natural to do so, without overusing it.`
      : "") +
    (toolsPromptBlock || "");

  const body = {
    model: model || "openai/gpt-oss-120b",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg = errBody?.error?.message || `Groq request failed (${res.status})`;
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  if (signal) {
    if (signal.aborted) {
      reader.cancel();
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }
    signal.addEventListener("abort", () => reader.cancel(), { once: true });
  }
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    let done, value;
    try {
      ({ done, value } = await reader.read());
    } catch (e) {
      if (signal?.aborted) {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }
      throw e;
    }
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const chunk = JSON.parse(data);
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) onChunk(text);
      } catch {
        // ignore malformed lines
      }
    }
  }
}

async function streamOpenAI(messages, userName, apiKey, model, onChunk, signal, toolsPromptBlock) {
  const systemPrompt =
    `Your name is Kuro. If asked your name or who you are, answer as Kuro. Otherwise just be a helpful, direct general-purpose assistant.` +
    (userName
      ? ` The person you're talking to goes by "${userName}". Address them by that name when it's natural to do so, without overusing it.`
      : "") +
    (toolsPromptBlock || "");

  const body = {
    model: model || "gpt-5.6-terra",
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg = errBody?.error?.message || `OpenAI request failed (${res.status})`;
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  if (signal) {
    if (signal.aborted) {
      reader.cancel();
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }
    signal.addEventListener("abort", () => reader.cancel(), { once: true });
  }
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    let done, value;
    try {
      ({ done, value } = await reader.read());
    } catch (e) {
      if (signal?.aborted) {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }
      throw e;
    }
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const chunk = JSON.parse(data);
        const text = chunk.choices?.[0]?.delta?.content;
        if (text) onChunk(text);
      } catch {
        // ignore malformed lines
      }
    }
  }
}

async function streamGemini(messages, userName, apiKey, model, onChunk, signal, toolsPromptBlock) {
  const systemPrompt =
    `Your name is Kuro. If asked your name or who you are, answer as Kuro. Otherwise just be a helpful, direct general-purpose assistant.` +
    (userName
      ? ` The person you're talking to goes by "${userName}". Address them by that name when it's natural to do so, without overusing it.`
      : "") +
    (toolsPromptBlock || "");

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: messages
      .filter((m) => m.content)
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
  };

  const modelId = model || "gemini-3.6-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal,
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    const msg = errBody?.error?.message || `Gemini request failed (${res.status})`;
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  if (signal) {
    if (signal.aborted) {
      reader.cancel();
      const err = new Error("Aborted");
      err.name = "AbortError";
      throw err;
    }
    signal.addEventListener("abort", () => reader.cancel(), { once: true });
  }
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    let done, value;
    try {
      ({ done, value } = await reader.read());
    } catch (e) {
      if (signal?.aborted) {
        const err = new Error("Aborted");
        err.name = "AbortError";
        throw err;
      }
      throw e;
    }
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data) continue;
      try {
        const chunk = JSON.parse(data);
        const text = chunk.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("");
        if (text) onChunk(text);
      } catch {
        // ignore malformed lines
      }
    }
  }
}

export default function Chatbot() {
  const [conversations, setConversations] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [userName, setUserName] = useState("");
  const [provider, setProvider] = useState("claude"); // which backend the currently-selected model uses
  const [enabledProviders, setEnabledProviders] = useState({ claude: true, groq: false, openai: false, gemini: false }); // which backends are turned on in settings, can be multiple at once
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [groqApiKey, setGroqApiKey] = useState("");
  const [groqModel, setGroqModel] = useState("openai/gpt-oss-120b");
  const [claudeModel, setClaudeModel] = useState("claude-sonnet-4-6");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiModel, setOpenaiModel] = useState("gpt-5.6-terra");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-3.6-flash");
  const [exaApiKey, setExaApiKey] = useState(""); // not a chat provider — powers the built-in web_search/web_fetch tools only
  const [exaKeyModalOpen, setExaKeyModalOpen] = useState(false); // popped automatically when a model tries web_search/web_fetch with no key set
  const [claudeKeyDraft, setClaudeKeyDraft] = useState("");
  const [claudeKeySaved, setClaudeKeySaved] = useState(false);
  const [groqKeyDraft, setGroqKeyDraft] = useState("");
  const [groqKeySaved, setGroqKeySaved] = useState(false);
  const [openaiKeyDraft, setOpenaiKeyDraft] = useState("");
  const [openaiKeySaved, setOpenaiKeySaved] = useState(false);
  const [geminiKeyDraft, setGeminiKeyDraft] = useState("");
  const [geminiKeySaved, setGeminiKeySaved] = useState(false);
  const [exaKeyDraft, setExaKeyDraft] = useState("");
  const [exaKeySaved, setExaKeySaved] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [modelMenuCompany, setModelMenuCompany] = useState(null); // which company's model list is expanded
  const [mcpServers, setMcpServers] = useState([]);
  const [mcpModalOpen, setMcpModalOpen] = useState(false); // list modal, opened from the sidebar
  const [mcpAddModalOpen, setMcpAddModalOpen] = useState(false); // "add server" modal, opened from the + inside the list modal
  const [mcpNameDraft, setMcpNameDraft] = useState("");
  const [mcpUrlDraft, setMcpUrlDraft] = useState("");
  const [mcpTokenDraft, setMcpTokenDraft] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const nameInputRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allChatsOpen, setAllChatsOpen] = useState(false);
  const [menuForId, setMenuForId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const itemMenuRef = useRef(null);
  const renameInputRef = useRef(null);
  const holdTimerRef = useRef(null);
  const attachMenuRef = useRef(null);
  const modelMenuRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 720);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!menuForId) return;
    const handler = (e) => {
      if (itemMenuRef.current && !itemMenuRef.current.contains(e.target)) {
        setMenuForId(null);
        setConfirmDeleteId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [menuForId]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  useEffect(() => {
    if (!attachMenuOpen) return;
    const handler = (e) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target)) {
        setAttachMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [attachMenuOpen]);

  useEffect(() => {
    if (!modelMenuOpen) return;
    const handler = (e) => {
      if (modelMenuRef.current && !modelMenuRef.current.contains(e.target)) {
        setModelMenuOpen(false);
        setModelMenuCompany(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [modelMenuOpen]);

  // When the model menu opens, default the expanded company to whichever
  // backend is currently active so the picker opens on the relevant list.
  useEffect(() => {
    if (modelMenuOpen) {
      setModelMenuCompany(provider === "groq" ? "groq" : "anthropic");
    }
  }, [modelMenuOpen]);

  // Load conversations from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get("conversations");
        if (result && result.value) {
          const parsed = JSON.parse(result.value);
          setConversations(parsed);
          const ids = Object.keys(parsed);
          if (ids.length > 0) {
            const mostRecent = ids.sort(
              (a, b) => parsed[b].updatedAt - parsed[a].updatedAt
            )[0];
            setActiveId(mostRecent);
          } else {
            createNewConversation(parsed);
          }
        } else {
          createNewConversation({});
        }
      } catch (e) {
        createNewConversation({});
      }
      try {
        const nameResult = await window.storage.get("userName");
        if (nameResult && nameResult.value) {
          setUserName(nameResult.value);
        }
      } catch (e) {
        // no name saved yet
      }
      try {
        const settingsResult = await window.storage.get("providerSettings");
        if (settingsResult && settingsResult.value) {
          const parsed = JSON.parse(settingsResult.value);
          if (parsed.provider) setProvider(parsed.provider);
          if (parsed.claudeApiKey) setClaudeApiKey(parsed.claudeApiKey);
          if (parsed.groqApiKey) setGroqApiKey(parsed.groqApiKey);
          if (parsed.groqModel) setGroqModel(parsed.groqModel);
          if (parsed.claudeModel) setClaudeModel(parsed.claudeModel);
          if (parsed.openaiApiKey) setOpenaiApiKey(parsed.openaiApiKey);
          if (parsed.openaiModel) setOpenaiModel(parsed.openaiModel);
          if (parsed.geminiApiKey) setGeminiApiKey(parsed.geminiApiKey);
          if (parsed.geminiModel) setGeminiModel(parsed.geminiModel);
          if (parsed.exaApiKey) setExaApiKey(parsed.exaApiKey);
          if (parsed.enabledProviders)
            setEnabledProviders((prev) => ({ ...prev, ...parsed.enabledProviders }));
        }
      } catch (e) {
        // no provider settings saved yet
      }
      try {
        const mcpResult = await window.storage.get("mcpServers");
        if (mcpResult && mcpResult.value) {
          const parsed = JSON.parse(mcpResult.value);
          if (Array.isArray(parsed)) setMcpServers(parsed);
        }
      } catch (e) {
        // no mcp servers saved yet
      }
      setLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  async function saveUserName(name) {
    const trimmed = name.trim();
    setUserName(trimmed);
    try {
      await window.storage.set("userName", trimmed);
    } catch (e) {
      // fail silently
    }
  }

  async function persistProviderSettings(next) {
    const merged = {
      provider: next.provider ?? provider,
      claudeApiKey: next.claudeApiKey ?? claudeApiKey,
      groqApiKey: next.groqApiKey ?? groqApiKey,
      groqModel: next.groqModel ?? groqModel,
      claudeModel: next.claudeModel ?? claudeModel,
      openaiApiKey: next.openaiApiKey ?? openaiApiKey,
      openaiModel: next.openaiModel ?? openaiModel,
      geminiApiKey: next.geminiApiKey ?? geminiApiKey,
      geminiModel: next.geminiModel ?? geminiModel,
      exaApiKey: next.exaApiKey ?? exaApiKey,
      enabledProviders: next.enabledProviders ?? enabledProviders,
    };
    if (next.provider !== undefined) setProvider(next.provider);
    if (next.claudeApiKey !== undefined) setClaudeApiKey(next.claudeApiKey);
    if (next.groqApiKey !== undefined) setGroqApiKey(next.groqApiKey);
    if (next.groqModel !== undefined) setGroqModel(next.groqModel);
    if (next.claudeModel !== undefined) setClaudeModel(next.claudeModel);
    if (next.openaiApiKey !== undefined) setOpenaiApiKey(next.openaiApiKey);
    if (next.openaiModel !== undefined) setOpenaiModel(next.openaiModel);
    if (next.geminiApiKey !== undefined) setGeminiApiKey(next.geminiApiKey);
    if (next.geminiModel !== undefined) setGeminiModel(next.geminiModel);
    if (next.exaApiKey !== undefined) setExaApiKey(next.exaApiKey);
    if (next.enabledProviders !== undefined) setEnabledProviders(next.enabledProviders);
    try {
      await window.storage.set("providerSettings", JSON.stringify(merged));
    } catch (e) {
      // fail silently
    }
  }

  // Turns a backend on/off in settings. Any combination of Anthropic, Groq,
  // OpenAI, and Gemini can be on at once. Won't let you turn off the last
  // remaining enabled backend, and if you turn off the backend that's
  // currently active for the composer, switches the active model over to
  // whichever backend is still enabled.
  function toggleProviderEnabled(key) {
    const next = { ...enabledProviders, [key]: !enabledProviders[key] };
    const stillHasOne = Object.values(next).some(Boolean);
    if (!stillHasOne) return; // keep at least one backend enabled

    const updates = { enabledProviders: next };
    if (!next[key] && provider === key) {
      const fallback = Object.keys(next).find((k) => next[k]);
      if (fallback) updates.provider = fallback;
    }
    persistProviderSettings(updates);
  }

  // Which model id is currently active, given whichever backend is selected.
  function activeModelId() {
    if (provider === "claude") return claudeModel;
    if (provider === "groq") return groqModel;
    if (provider === "openai") return openaiModel;
    if (provider === "gemini") return geminiModel;
    return null;
  }

  // Called when a model is picked from the composer's model picker dropdown.
  // model.provider says which backend actually serves it (claude | groq | openai | gemini),
  // regardless of which company "owns" the model.
  function selectModel(model) {
    if (model.provider === "claude") {
      persistProviderSettings({ provider: "claude", claudeModel: model.id });
    } else if (model.provider === "groq") {
      persistProviderSettings({ provider: "groq", groqModel: model.id });
    } else if (model.provider === "openai") {
      persistProviderSettings({ provider: "openai", openaiModel: model.id });
    } else if (model.provider === "gemini") {
      persistProviderSettings({ provider: "gemini", geminiModel: model.id });
    }
    setModelMenuOpen(false);
    setModelMenuCompany(null);
  }

  async function persistMcpServers(next) {
    setMcpServers(next);
    try {
      await window.storage.set("mcpServers", JSON.stringify(next));
    } catch (e) {
      // fail silently
    }
  }

  function addMcpServer() {
    const name = mcpNameDraft.trim();
    const url = mcpUrlDraft.trim();
    if (!name || !url) return;
    const server = {
      id: uid(),
      name,
      url,
      token: mcpTokenDraft.trim(),
      enabled: true,
    };
    persistMcpServers([...mcpServers, server]);
    setMcpNameDraft("");
    setMcpUrlDraft("");
    setMcpTokenDraft("");
  }

  function toggleMcpServer(id) {
    mcpForgetServer(id);
    persistMcpServers(
      mcpServers.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }

  function removeMcpServer(id) {
    mcpForgetServer(id);
    persistMcpServers(mcpServers.filter((s) => s.id !== id));
  }

  const persist = useCallback(async (convos) => {
    try {
      await window.storage.set("conversations", JSON.stringify(convos));
    } catch (e) {
      // fail silently, don't block UI
    }
  }, []);

  function createNewConversation(base) {
    const id = uid();
    const newConvo = {
      id,
      title: "New chat",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = { ...(base ?? conversations), [id]: newConvo };
    setConversations(updated);
    setActiveId(id);
    persist(updated);
    return id;
  }

  function renameConversation(id, newTitle) {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    const updated = {
      ...conversations,
      [id]: { ...conversations[id], title: trimmed },
    };
    setConversations(updated);
    persist(updated);
  }

  function confirmDelete(id) {
    deleteConversation(id);
    setConfirmDeleteId(null);
    setMenuForId(null);
  }

  function deleteConversation(id) {
    const updated = { ...conversations };
    delete updated[id];
    setConversations(updated);
    persist(updated);
    const ids = Object.keys(updated);
    if (id === activeId) {
      if (ids.length > 0) {
        setActiveId(ids.sort((a, b) => updated[b].updatedAt - updated[a].updatedAt)[0]);
      } else {
        createNewConversation(updated);
      }
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeId, conversations, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  const active = activeId ? conversations[activeId] : null;

  async function streamReply(messages, onChunk, onToolEvent, signal) {
    const tools = await getAllTools(mcpServers, signal, exaApiKey);
    const toolsPromptBlock = buildToolsPromptBlock(tools);
    const onMissingExaKey = () => setExaKeyModalOpen(true);

    if (provider === "groq") {
      if (!groqApiKey.trim()) {
        throw new Error("Add a Groq API key in Settings first.");
      }
      return runAgentLoop({
        streamOneTurn: (turnMessages, onRaw) =>
          streamGroq(turnMessages, userName, groqApiKey.trim(), groqModel, onRaw, signal, toolsPromptBlock),
        initialMessages: messages,
        tools,
        onTextChunk: onChunk,
        onToolEvent,
        onMissingExaKey,
        signal,
      });
    }
    if (provider === "openai") {
      if (!openaiApiKey.trim()) {
        throw new Error("Add an OpenAI API key in Settings first.");
      }
      return runAgentLoop({
        streamOneTurn: (turnMessages, onRaw) =>
          streamOpenAI(turnMessages, userName, openaiApiKey.trim(), openaiModel, onRaw, signal, toolsPromptBlock),
        initialMessages: messages,
        tools,
        onTextChunk: onChunk,
        onToolEvent,
        onMissingExaKey,
        signal,
      });
    }
    if (provider === "gemini") {
      if (!geminiApiKey.trim()) {
        throw new Error("Add a Gemini API key in Settings first.");
      }
      return runAgentLoop({
        streamOneTurn: (turnMessages, onRaw) =>
          streamGemini(turnMessages, userName, geminiApiKey.trim(), geminiModel, onRaw, signal, toolsPromptBlock),
        initialMessages: messages,
        tools,
        onTextChunk: onChunk,
        onToolEvent,
        onMissingExaKey,
        signal,
      });
    }
    if (!claudeApiKey.trim()) {
      throw new Error("Add an Anthropic API key in Settings first.");
    }
    return runAgentLoop({
      streamOneTurn: (turnMessages, onRaw) =>
        streamClaude(turnMessages, userName, claudeApiKey.trim(), onRaw, signal, toolsPromptBlock, claudeModel),
      initialMessages: messages,
      tools,
      onTextChunk: onChunk,
      onToolEvent,
      onMissingExaKey,
      signal,
    });
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || loading || !active) return;
    setError(null);
    setInput("");

    const userMsg = { role: "user", content: text, id: uid() };
    const isFirst = active.messages.length === 0;
    const title = isFirst ? text.slice(0, 40) + (text.length > 40 ? "…" : "") : active.title;
    const convoId = active.id;

    const withUser = {
      ...active,
      title,
      messages: [...active.messages, userMsg],
      updatedAt: Date.now(),
    };

    // Add a streaming placeholder for the assistant reply
    const assistantId = uid();
    const assistantPlaceholder = { role: "assistant", content: "", id: assistantId, streaming: true, toolEvents: [] };
    const withPlaceholder = {
      ...withUser,
      messages: [...withUser.messages, assistantPlaceholder],
    };
    let updatedAll = { ...conversations, [convoId]: withPlaceholder };
    setConversations(updatedAll);
    persist({ ...conversations, [convoId]: withUser }); // persist without placeholder
    setLoading(true);

    let accumulated = "";
    const toolEvents = [];
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamReply(
        withUser.messages,
        (chunk) => {
          accumulated += chunk;
          setConversations((prev) => {
            const convo = prev[convoId];
            if (!convo) return prev;
            const msgs = convo.messages.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            );
            return { ...prev, [convoId]: { ...convo, messages: msgs } };
          });
        },
        (event) => {
          // Tool events are inserted at the current text length so the renderer
          // can splice the inline status line into the right spot in the bubble,
          // without ever treating it as a new message.
          const idx = toolEvents.findIndex((e) => e.id === event.id);
          const withOffset = { ...event, atLength: idx === -1 ? accumulated.length : toolEvents[idx].atLength };
          if (idx === -1) toolEvents.push(withOffset);
          else toolEvents[idx] = withOffset;
          setConversations((prev) => {
            const convo = prev[convoId];
            if (!convo) return prev;
            const msgs = convo.messages.map((m) =>
              m.id === assistantId ? { ...m, toolEvents: [...toolEvents] } : m
            );
            return { ...prev, [convoId]: { ...convo, messages: msgs } };
          });
        },
        controller.signal
      );
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "Couldn't reach Kuro. Try sending that again.");
      }
    } finally {
      abortRef.current = null;
      // Finalize: remove streaming flag, persist
      setConversations((prev) => {
        const convo = prev[convoId];
        if (!convo) return prev;
        const msgs = convo.messages.map((m) =>
          m.id === assistantId
            ? { role: "assistant", content: accumulated || "…", id: assistantId, toolEvents }
            : m
        );
        const finalConvo = { ...convo, messages: msgs, updatedAt: Date.now() };
        const next = { ...prev, [convoId]: finalConvo };
        persist(next);
        return next;
      });
      setLoading(false);
    }
  }

  async function handleRegenerate(messageId) {
    if (!active || loading) return;
    const idx = active.messages.findIndex((m) => m.id === messageId);
    if (idx === -1) return;
    const priorMessages = active.messages.slice(0, idx);
    if (priorMessages.length === 0 || priorMessages[priorMessages.length - 1].role !== "user")
      return;

    setError(null);
    const convoId = active.id;
    const assistantId = uid();
    const placeholder = { role: "assistant", content: "", id: assistantId, streaming: true, toolEvents: [] };
    const withPlaceholder = { ...active, messages: [...priorMessages, placeholder] };
    let updatedAll = { ...conversations, [convoId]: withPlaceholder };
    setConversations(updatedAll);
    persist({ ...conversations, [convoId]: { ...active, messages: priorMessages } });
    setLoading(true);

    let accumulated = "";
    const toolEvents = [];
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await streamReply(
        priorMessages,
        (chunk) => {
          accumulated += chunk;
          setConversations((prev) => {
            const convo = prev[convoId];
            if (!convo) return prev;
            const msgs = convo.messages.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m
            );
            return { ...prev, [convoId]: { ...convo, messages: msgs } };
          });
        },
        (event) => {
          const idx = toolEvents.findIndex((e) => e.id === event.id);
          const withOffset = { ...event, atLength: idx === -1 ? accumulated.length : toolEvents[idx].atLength };
          if (idx === -1) toolEvents.push(withOffset);
          else toolEvents[idx] = withOffset;
          setConversations((prev) => {
            const convo = prev[convoId];
            if (!convo) return prev;
            const msgs = convo.messages.map((m) =>
              m.id === assistantId ? { ...m, toolEvents: [...toolEvents] } : m
            );
            return { ...prev, [convoId]: { ...convo, messages: msgs } };
          });
        },
        controller.signal
      );
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "Couldn't reach Kuro. Try regenerating again.");
      }
    } finally {
      abortRef.current = null;
      setConversations((prev) => {
        const convo = prev[convoId];
        if (!convo) return prev;
        const msgs = convo.messages.map((m) =>
          m.id === assistantId
            ? { role: "assistant", content: accumulated || "…", id: assistantId, toolEvents }
            : m
        );
        const finalConvo = { ...convo, messages: msgs, updatedAt: Date.now() };
        const next = { ...prev, [convoId]: finalConvo };
        persist(next);
        return next;
      });
      setLoading(false);
    }
  }

  function handleStop() {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }

  async function handleCopy(text, id) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1600);
    } catch (e) {
      // clipboard unavailable, fail silently
    }
  }

  async function handleShare(text) {
    try {
      if (navigator.share) {
        await navigator.share({ text });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      // user cancelled share or clipboard unavailable
    }
  }


  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const convoList = Object.values(conversations).sort(
    (a, b) => b.updatedAt - a.updatedAt
  );

  if (!loaded) {
    return (
      <div
        style={{
          fontFamily: UI_FONT,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#181614",
          color: "#8a8478",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: UI_FONT,
        height: "100vh",
        display: "flex",
        background: "#181614",
        color: "#EDE9E2",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-thumb { background: #3a3632; border-radius: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        textarea { font-family: ${UI_FONT}; }
        textarea::placeholder { color: #6b655c; }
        .sidebar-item:hover .del-btn { opacity: 1; }
        .del-btn { opacity: 0; }
        @media (max-width: 720px) {
          .del-btn { opacity: 1; }
        }
        input, textarea, button { font-size: 16px; }
        @media (max-width: 720px) {
          textarea { font-size: 15px !important; }
          .msg-text { font-size: 14.5px !important; }
          .msg-text.serif { font-size: 15.5px !important; }
        }
        @keyframes attachMenuIn {
          from { opacity: 0; transform: translateY(6px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .attach-menu {
          animation: attachMenuIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: bottom left;
        }
      `}</style>
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 15,
          }}
        />
      )}

      {/* Sidebar */}
      <div
        className="sidebar"
        style={{
          width: 260,
          minWidth: 260,
          borderRight: "1px solid #2a2622",
          background: "#151310",
          display: "flex",
          flexDirection: "column",
          ...(isMobile
            ? {
                position: "fixed",
                top: 0,
                bottom: 0,
                left: 0,
                zIndex: 20,
                boxShadow: sidebarOpen ? "2px 0 24px rgba(0,0,0,0.4)" : "none",
                transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.22s ease",
              }
            : {}),
        }}
      >
        <div
          style={{
            padding: "20px 16px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: SERIF_FONT,
              fontSize: 26,
              fontWeight: 500,
              letterSpacing: 0.2,
            }}
          >
            Kuro
          </span>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#8a8478",
                cursor: "pointer",
                display: "flex",
                padding: 4,
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ padding: "4px 10px 10px" }}>
          <button
            onClick={() => {
              createNewConversation();
              if (isMobile) setSidebarOpen(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 10px",
              borderRadius: 9,
              border: "none",
              background: "transparent",
              color: "#C4623A",
              fontSize: 14.5,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1916")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <MessageCirclePlus size={19} strokeWidth={1.8} />
            New chat
          </button>

          <button
            onClick={() => {
              setAllChatsOpen(true);
              if (isMobile) setSidebarOpen(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 10px",
              borderRadius: 9,
              border: "none",
              background: "transparent",
              color: "#a39d92",
              fontSize: 14.5,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1916")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <MessageCircle size={19} strokeWidth={1.8} />
            Chats
          </button>

          <button
            onClick={() => {
              setMcpModalOpen(true);
              if (isMobile) setSidebarOpen(false);
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 10px",
              borderRadius: 9,
              border: "none",
              background: "transparent",
              color: "#a39d92",
              fontSize: 14.5,
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#1c1916")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Monitor size={19} strokeWidth={1.8} />
            MCP Connectors
          </button>
        </div>

        <div style={{ height: 1, background: "#2a2622", margin: "6px 16px" }} />

        <div
          style={{
            padding: "12px 16px 6px",
            fontSize: 12,
            fontWeight: 600,
            color: "#6b655c",
          }}
        >
          Recents
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
          {convoList.slice(0, 8).map((c) => (
            <div
              key={c.id}
              className="sidebar-item"
              onClick={() => {
                if (renamingId === c.id) return;
                setActiveId(c.id);
                setSidebarOpen(false);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenuForId(c.id);
              }}
              onTouchStart={() => {
                holdTimerRef.current = setTimeout(() => {
                  setMenuForId(c.id);
                }, 480);
              }}
              onTouchEnd={() => clearTimeout(holdTimerRef.current)}
              onTouchMove={() => clearTimeout(holdTimerRef.current)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 10px",
                borderRadius: 9,
                marginBottom: 2,
                cursor: "pointer",
                background:
                  c.id === activeId || menuForId === c.id ? "#2a2622" : "transparent",
                color: c.id === activeId ? "#EDE9E2" : "#c9c4ba",
              }}
              onMouseEnter={(e) => {
                if (c.id !== activeId) e.currentTarget.style.background = "#1c1916";
              }}
              onMouseLeave={(e) => {
                if (c.id !== activeId && menuForId !== c.id)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {renamingId === c.id ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameConversation(c.id, renameValue);
                      setRenamingId(null);
                    } else if (e.key === "Escape") {
                      setRenamingId(null);
                    }
                  }}
                  onBlur={() => {
                    renameConversation(c.id, renameValue);
                    setRenamingId(null);
                  }}
                  style={{
                    flex: 1,
                    background: "#151310",
                    border: "1px solid #C4623A",
                    borderRadius: 6,
                    color: "#EDE9E2",
                    fontSize: 14,
                    padding: "4px 7px",
                    outline: "none",
                    minWidth: 0,
                  }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 14,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {c.title || "New chat"}
                </span>
              )}

              {renamingId !== c.id && (
                <button
                  className="del-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuForId(menuForId === c.id ? null : c.id);
                  }}
                  style={{
                    transition: "opacity 0.15s",
                    background: "none",
                    border: "none",
                    color: "#8a8478",
                    cursor: "pointer",
                    padding: 3,
                    flexShrink: 0,
                    display: "flex",
                  }}
                >
                  <MoreHorizontal size={15} />
                </button>
              )}

              {menuForId === c.id && (
                <div
                  ref={itemMenuRef}
                  className="attach-menu"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 4,
                    width: 168,
                    background: "#211e1a",
                    border: "1px solid #37322c",
                    borderRadius: 12,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                    overflow: "hidden",
                    zIndex: 30,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {confirmDeleteId === c.id ? (
                    <div style={{ padding: 10 }}>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: "#c9c4ba",
                          padding: "2px 4px 8px",
                          lineHeight: 1.4,
                        }}
                      >
                        Delete this chat?
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{
                            flex: 1,
                            padding: "7px 0",
                            borderRadius: 7,
                            border: "1px solid #3a3632",
                            background: "transparent",
                            color: "#c9c4ba",
                            fontSize: 12.5,
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => confirmDelete(c.id)}
                          style={{
                            flex: 1,
                            padding: "7px 0",
                            borderRadius: 7,
                            border: "none",
                            background: "#C4623A",
                            color: "#181614",
                            fontSize: 12.5,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: 6 }}>
                      <button
                        onClick={() => {
                          setRenameValue(c.title || "New chat");
                          setRenamingId(c.id);
                          setMenuForId(null);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          color: "#EDE9E2",
                          fontSize: 13.5,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a251f")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Pencil size={14} style={{ opacity: 0.75 }} />
                        Rename
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(c.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 9,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          color: "#e08573",
                          fontSize: 13.5,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a1f1a")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            borderTop: "1px solid #2a2622",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#C4623A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#181614",
              flexShrink: 0,
            }}
          >
            {(userName.trim()[0] || "?").toUpperCase()}
          </div>
          {editingName ? (
            <input
              ref={nameInputRef}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  saveUserName(nameDraft);
                  setEditingName(false);
                } else if (e.key === "Escape") {
                  setEditingName(false);
                }
              }}
              onBlur={() => {
                saveUserName(nameDraft);
                setEditingName(false);
              }}
              placeholder="Your name"
              style={{
                flex: 1,
                minWidth: 0,
                background: "#151310",
                border: "1px solid #C4623A",
                borderRadius: 6,
                color: "#EDE9E2",
                fontSize: 13.5,
                padding: "4px 7px",
                outline: "none",
              }}
            />
          ) : (
            <span
              onClick={() => {
                setNameDraft(userName);
                setEditingName(true);
              }}
              style={{
                fontSize: 13.5,
                color: userName ? "#EDE9E2" : "#7a746a",
                flex: 1,
                cursor: "pointer",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {userName || "Add your name"}
            </span>
          )}
          <button
            onClick={() => {
              setSettingsOpen(true);
              if (isMobile) setSidebarOpen(false);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#8a8478",
              cursor: "pointer",
              display: "flex",
              padding: 4,
              borderRadius: 6,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1c1916";
              e.currentTarget.style.color = "#EDE9E2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#8a8478";
            }}
          >
            <Settings size={17} />
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #2a2622",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            style={{
              background: "none",
              border: "none",
              color: "#a39d92",
              cursor: "pointer",
              display: "flex",
            }}
          >
            <Menu size={18} />
          </button>
          <span
            style={{
              fontSize: 13,
              color: "#8a8478",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {active?.title || "New chat"}
          </span>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto" }}>
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              padding: isMobile ? "16px 14px 8px" : "24px 20px 12px",
            }}
          >
            {(!active || active.messages.length === 0) && (
              <div
                style={{
                  height: "50vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#5f594f",
                  textAlign: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "#211e1a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <MessageSquare size={18} color="#C4623A" />
                </div>
                <div style={{ fontSize: 15, color: "#a39d92" }}>
                  Kuro's listening.
                </div>
              </div>
            )}

            {active?.messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: 18,
                }}
              >
                <div
                  className={`msg-text${m.role === "assistant" ? " serif" : ""}`}
                  style={{
                    maxWidth: isMobile ? "90%" : "82%",
                    padding: m.role === "user" ? "10px 14px" : "2px 0",
                    borderRadius: 14,
                    background: m.role === "user" ? "#2a251f" : "transparent",
                    fontFamily: m.role === "assistant" ? SERIF_FONT : UI_FONT,
                    fontSize: m.role === "assistant" ? 15.5 : 14.5,
                    lineHeight: 1.6,
                    whiteSpace: m.role === "user" ? "pre-wrap" : "normal",
                    wordBreak: "break-word",
                    color: "#EDE9E2",
                  }}
                >
                  {m.role === "assistant" ? (
                    <AssistantContent content={m.content} toolEvents={m.toolEvents} />
                  ) : (
                    m.content
                  )}
                  {m.streaming && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 2,
                        height: "1em",
                        background: "#C4623A",
                        marginLeft: 2,
                        verticalAlign: "text-bottom",
                        animation: "blink 0.9s step-end infinite",
                      }}
                    />
                  )}
                </div>

                {m.role === "assistant" && !m.streaming && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      marginTop: 6,
                    }}
                  >
                    <button
                      onClick={() => handleCopy(m.content, m.id)}
                      title="Copy"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        border: "none",
                        background: "transparent",
                        color: copiedId === m.id ? "#4CAF6A" : "#8a8478",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#211e1a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    <button
                      onClick={() => handleRegenerate(m.id)}
                      disabled={loading}
                      title="Regenerate"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        border: "none",
                        background: "transparent",
                        color: "#8a8478",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: loading ? "default" : "pointer",
                        opacity: loading ? 0.5 : 1,
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.background = "#211e1a";
                      }}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <RotateCw size={14} />
                    </button>
                    <button
                      onClick={() => handleShare(m.content)}
                      title="Share"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 7,
                        border: "none",
                        background: "transparent",
                        color: "#8a8478",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        transition: "background 0.15s, color 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#211e1a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Share2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && !active?.messages.some((m) => m.streaming) && (
              <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 18 }}>
                <div style={{ display: "flex", gap: 4, padding: "6px 0" }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#6b655c",
                        animation: `pulse 1.2s ${i * 0.15}s infinite ease-in-out`,
                      }}
                    />
                  ))}
                </div>
                <style>{`
                  @keyframes pulse {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
                    40% { opacity: 1; transform: scale(1); }
                  }
                  @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                  }
                `}</style>
              </div>
            )}

            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "#D97757",
                  marginBottom: 12,
                  padding: "8px 12px",
                  background: "#2a1f1a",
                  borderRadius: 8,
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            padding: isMobile
              ? "8px 10px calc(14px + env(safe-area-inset-bottom))"
              : "10px 20px 20px",
          }}
        >
          <div
            style={{
              maxWidth: 680,
              margin: "0 auto",
              background: "#211e1a",
              border: "1px solid #37322c",
              borderRadius: 26,
              padding: "14px 16px 10px",
            }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={active && active.messages.length > 0 ? "Reply to Kuro…" : "Ask Kuro…"}
              rows={1}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                color: "#EDE9E2",
                fontSize: 16,
                lineHeight: 1.5,
                padding: "2px 0 10px",
                maxHeight: 160,
                display: "block",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ position: "relative" }} ref={attachMenuRef}>
                <button
                  onClick={() => setAttachMenuOpen((o) => !o)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "1px solid #3a3632",
                    background: attachMenuOpen ? "#2a251f" : "transparent",
                    color: "#a39d92",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    transition: "background 0.15s, transform 0.15s",
                    transform: attachMenuOpen ? "rotate(45deg)" : "none",
                  }}
                >
                  <Plus size={16} />
                </button>

                {attachMenuOpen && (
                  <div
                    className="attach-menu"
                    style={{
                      position: "absolute",
                      bottom: "calc(100% + 10px)",
                      left: 0,
                      width: 200,
                      background: "#211e1a",
                      border: "1px solid #37322c",
                      borderRadius: 14,
                      boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                      overflow: "hidden",
                      zIndex: 30,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px 8px",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        color: "#8a8478",
                        textTransform: "uppercase",
                        borderBottom: "1px solid #2a2622",
                        paddingBottom: 10,
                      }}
                    >
                      Add file
                    </div>
                    <div style={{ padding: 6 }}>
                      {isMobile && (
                        <button
                          onClick={() => setAttachMenuOpen(false)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "transparent",
                            color: "#EDE9E2",
                            fontSize: 13.5,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#2a251f")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Camera size={16} style={{ opacity: 0.75 }} />
                          Camera
                        </button>
                      )}
                      {isMobile && (
                        <button
                          onClick={() => setAttachMenuOpen(false)}
                          style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 10px",
                            borderRadius: 8,
                            border: "none",
                            background: "transparent",
                            color: "#EDE9E2",
                            fontSize: 13.5,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#2a251f")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <Image size={16} style={{ opacity: 0.75 }} />
                          Photos
                        </button>
                      )}
                      <button
                        onClick={() => setAttachMenuOpen(false)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 10px",
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          color: "#EDE9E2",
                          fontSize: 13.5,
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#2a251f")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <FileText size={16} style={{ opacity: 0.75 }} />
                        Files
                      </button>
                    </div>
                  </div>
                )}
              </div>
                <div style={{ position: "relative" }} ref={modelMenuRef}>
                  <button
                    onClick={() => setModelMenuOpen((o) => !o)}
                    style={{
                      height: 34,
                      padding: "0 14px",
                      borderRadius: 17,
                      border: modelMenuOpen ? "1px solid #C4623A" : "1px solid #3a3632",
                      background: modelMenuOpen ? "#2a1f1a" : "transparent",
                      color: "#EDE9E2",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13.5,
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    {findModelById(activeModelId())?.name || activeModelId() || "Select model"}
                  </button>

                  {modelMenuOpen && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 10px)",
                        left: 0,
                        display: "flex",
                        alignItems: "flex-end",
                        gap: 8,
                        zIndex: 30,
                      }}
                    >
                      {/* Company dropdown */}
                      <div
                        style={{
                          width: 190,
                          background: "#211e1a",
                          border: "1px solid #37322c",
                          borderRadius: 14,
                          boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                          overflow: "hidden",
                          flexShrink: 0,
                          maxHeight: 360,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            padding: "10px 14px 8px",
                            fontSize: 11.5,
                            fontWeight: 600,
                            letterSpacing: 0.3,
                            color: "#8a8478",
                            textTransform: "uppercase",
                            borderBottom: "1px solid #2a2622",
                            paddingBottom: 10,
                            flexShrink: 0,
                          }}
                        >
                          Company
                        </div>
                        <div style={{ padding: 6, overflowY: "auto" }}>
                          {/* Only show companies that have at least one model whose backend
                              is turned on in settings. A company can mix backends (e.g. OpenAI's
                              GPT-5.6 direct models vs. GPT-OSS via Groq), so this checks per-model,
                              not just the company as a whole. */}
                          {COMPANIES.filter((c) => c.models.some((m) => enabledProviders[m.provider])).map((c) => {
                            const isActive = modelMenuCompany === c.id;
                            return (
                              <button
                                key={c.id}
                                onClick={() => setModelMenuCompany(c.id)}
                                style={{
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  padding: "8px 10px",
                                  borderRadius: 8,
                                  border: "none",
                                  background: isActive ? "#2a251f" : "transparent",
                                  color: "#EDE9E2",
                                  fontSize: 13.5,
                                  cursor: "pointer",
                                  textAlign: "left",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#2a251f")}
                                onMouseLeave={(e) => {
                                  if (!isActive) e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <span
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: "50%",
                                    background: c.mark.bg,
                                    color: c.mark.fg,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    flexShrink: 0,
                                  }}
                                >
                                  {c.mark.glyph === "svg:groq" ? (
                                    <GroqLogo size={13} />
                                  ) : c.mark.glyph === "svg:anthropic" ? (
                                    <AnthropicLogo size={13} />
                                  ) : c.mark.glyph === "svg:openai" ? (
                                    <OpenAILogo size={13} />
                                  ) : c.mark.glyph === "svg:google" ? (
                                    <GoogleLogo size={13} idPrefix="picker" />
                                  ) : c.mark.glyph === "svg:meta" ? (
                                    <MetaLogo size={13} />
                                  ) : c.mark.glyph === "svg:alibaba" ? (
                                    <AlibabaLogo size={13} />
                                  ) : (
                                    c.mark.glyph
                                  )}
                                </span>
                                <span style={{ flex: 1, minWidth: 0 }}>{c.name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Model dropdown for the expanded company */}
                      {modelMenuCompany && (
                        <div
                          style={{
                            width: 230,
                            background: "#211e1a",
                            border: "1px solid #37322c",
                            borderRadius: 14,
                            boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                            overflow: "hidden",
                            flexShrink: 0,
                            maxHeight: 360,
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <div
                            style={{
                              padding: "10px 14px 8px",
                              fontSize: 11.5,
                              fontWeight: 600,
                              letterSpacing: 0.3,
                              color: "#8a8478",
                              textTransform: "uppercase",
                              borderBottom: "1px solid #2a2622",
                              paddingBottom: 10,
                              flexShrink: 0,
                            }}
                          >
                            {COMPANIES.find((c) => c.id === modelMenuCompany)?.name}
                          </div>
                          <div style={{ padding: 6, overflowY: "auto" }}>
                            {COMPANIES.find((c) => c.id === modelMenuCompany)?.models
                              .filter((m) => enabledProviders[m.provider])
                              .map((m) => {
                              const isSelected = provider === m.provider && activeModelId() === m.id;
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => selectModel(m)}
                                  style={{
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    gap: 1,
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border: "none",
                                    background: isSelected ? "#2a1f1a" : "transparent",
                                    color: isSelected ? "#EDE9E2" : "#c9c3b8",
                                    fontSize: 13.5,
                                    cursor: "pointer",
                                    textAlign: "left",
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = "#2a251f";
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.background = "transparent";
                                  }}
                                >
                                  <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {m.name}
                                    {isSelected && <Check size={12} style={{ color: "#C4623A" }} />}
                                  </span>
                                  <span style={{ fontSize: 11, color: "#6b655c", display: "flex", alignItems: "center", gap: 5 }}>
                                    {m.note}
                                    {m.host && (
                                      <span
                                        style={{
                                          fontSize: 9.5,
                                          fontWeight: 600,
                                          letterSpacing: 0.2,
                                          color: "#F55036",
                                          border: "1px solid #4a2a22",
                                          borderRadius: 4,
                                          padding: "1px 4px",
                                        }}
                                      >
                                        via {m.host}
                                      </span>
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "1px solid #3a3632",
                    background: "transparent",
                    color: "#a39d92",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <Mic size={15} />
                </button>
                <button
                  onClick={loading ? handleStop : handleSend}
                  disabled={!loading && !input.trim()}
                  title={loading ? "Stop" : "Send"}
                  style={{
                    flexShrink: 0,
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    border: "none",
                    background: loading || input.trim() ? "#C4623A" : "#EDE9E2",
                    color: loading ? "#EDE9E2" : "#181614",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: loading || input.trim() ? "pointer" : "default",
                    transition: "background 0.15s",
                  }}
                >
                  {loading ? <Square size={13} fill="currentColor" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {allChatsOpen && (
        <div
          onClick={() => setAllChatsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              maxHeight: "76vh",
              display: "flex",
              flexDirection: "column",
              background: "#1c1916",
              border: "1px solid #37322c",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 18px 12px",
                borderBottom: "1px solid #2a2622",
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>All chats</span>
              <button
                onClick={() => setAllChatsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8a8478",
                  cursor: "pointer",
                  display: "flex",
                  padding: 4,
                }}
              >
                <X size={17} />
              </button>
            </div>
            <div style={{ overflowY: "auto", padding: 8 }}>
              {convoList.length === 0 && (
                <div style={{ padding: 16, fontSize: 13.5, color: "#8a8478" }}>
                  No conversations yet.
                </div>
              )}
              {convoList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    setAllChatsOpen(false);
                    setSidebarOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 12px",
                    borderRadius: 9,
                    marginBottom: 2,
                    cursor: "pointer",
                    background: c.id === activeId ? "#2a2622" : "transparent",
                    color: c.id === activeId ? "#EDE9E2" : "#c9c4ba",
                  }}
                  onMouseEnter={(e) => {
                    if (c.id !== activeId) e.currentTarget.style.background = "#211e1a";
                  }}
                  onMouseLeave={(e) => {
                    if (c.id !== activeId) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <MessageCircle size={15} style={{ flexShrink: 0, opacity: 0.6 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {c.title || "New chat"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8a8478",
                      cursor: "pointer",
                      padding: 4,
                      flexShrink: 0,
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              maxHeight: "82vh",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
              background: "#1c1916",
              border: "1px solid #37322c",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>Settings</span>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8a8478",
                  cursor: "pointer",
                  display: "flex",
                  padding: 4,
                }}
              >
                <X size={17} />
              </button>
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: 0.3,
                color: "#6b655c",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Model providers
            </div>
            <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 12, lineHeight: 1.5 }}>
              Turn on the backends you want Kuro to use. You can enable both — the model
              picker in the message bar will show every company from your enabled backends.
            </div>

            {/* Anthropic row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 4px",
                borderBottom: enabledProviders.claude ? "none" : "1px solid #2a2622",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#EDE9E2",
                  color: "#1a1512",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <AnthropicLogo size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "#EDE9E2" }}>Anthropic</div>
                <div style={{ fontSize: 11.5, color: "#6b655c" }}>Claude models</div>
              </div>
              <button
                onClick={() => toggleProviderEnabled("claude")}
                title={enabledProviders.claude ? "Enabled — click to disable" : "Disabled — click to enable"}
                style={{
                  width: 34,
                  height: 19,
                  borderRadius: 10,
                  border: "none",
                  background: enabledProviders.claude ? "#C4623A" : "#3a3632",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: enabledProviders.claude ? 17 : 2,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: "#EDE9E2",
                    transition: "left 0.15s",
                  }}
                />
              </button>
            </div>

            {enabledProviders.claude && (
              <div style={{ padding: "10px 4px 4px" }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    color: "#6b655c",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Anthropic API key
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input
                    type="password"
                    value={claudeKeyDraft}
                    onChange={(e) => {
                      setClaudeKeyDraft(e.target.value);
                      setClaudeKeySaved(false);
                    }}
                    placeholder={claudeApiKey ? "•••••••••••••••••••• (saved)" : "sk-ant-…"}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "#151310",
                      border: "1px solid #3a3632",
                      borderRadius: 8,
                      color: "#EDE9E2",
                      fontSize: 13,
                      padding: "9px 10px",
                      outline: "none",
                      fontFamily: MONO_FONT,
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!claudeKeyDraft.trim()) return;
                      persistProviderSettings({ claudeApiKey: claudeKeyDraft.trim() });
                      setClaudeKeyDraft("");
                      setClaudeKeySaved(true);
                      setTimeout(() => setClaudeKeySaved(false), 1800);
                    }}
                    style={{
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "#C4623A",
                      color: "#181614",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Save
                  </button>
                </div>

                {claudeKeySaved && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#4CAF6A",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Check size={13} /> Key saved
                  </div>
                )}
                {!claudeKeySaved && claudeApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    A key is currently saved. Enter a new one to replace it.
                  </div>
                )}
                {!claudeKeySaved && !claudeApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    Get a key at{" "}
                    <span style={{ color: "#a39d92" }}>console.anthropic.com/settings/keys</span>
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#8a8478", lineHeight: 1.6, marginBottom: 4 }}>
                  Using Claude {findModelById(claudeModel)?.name || "Sonnet 4.6"} for responses. Pick a
                  different model from the chip in the message bar.
                </div>
              </div>
            )}

            {/* Groq row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 4px",
                borderTop: "1px solid #2a2622",
                borderBottom: enabledProviders.groq ? "none" : "1px solid #2a2622",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#F55036",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <GroqLogo size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "#EDE9E2", display: "flex", alignItems: "center", gap: 6 }}>
                  Groq
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      color: "#4CAF6A",
                      border: "1px solid #2a4a34",
                      background: "#16241c",
                      borderRadius: 4,
                      padding: "2px 5px",
                    }}
                  >
                    FREE TIER
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#6b655c" }}>
                  OpenAI, Meta, Alibaba Cloud, MiniMax &amp; Groq's own models
                </div>
              </div>
              <button
                onClick={() => toggleProviderEnabled("groq")}
                title={enabledProviders.groq ? "Enabled — click to disable" : "Disabled — click to enable"}
                style={{
                  width: 34,
                  height: 19,
                  borderRadius: 10,
                  border: "none",
                  background: enabledProviders.groq ? "#C4623A" : "#3a3632",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: enabledProviders.groq ? 17 : 2,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: "#EDE9E2",
                    transition: "left 0.15s",
                  }}
                />
              </button>
            </div>

            {enabledProviders.groq && (
              <div style={{ padding: "10px 4px 4px" }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    color: "#6b655c",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Groq API key
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input
                    type="password"
                    value={groqKeyDraft}
                    onChange={(e) => {
                      setGroqKeyDraft(e.target.value);
                      setGroqKeySaved(false);
                    }}
                    placeholder={groqApiKey ? "•••••••••••••••••••• (saved)" : "gsk_…"}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "#151310",
                      border: "1px solid #3a3632",
                      borderRadius: 8,
                      color: "#EDE9E2",
                      fontSize: 13,
                      padding: "9px 10px",
                      outline: "none",
                      fontFamily: MONO_FONT,
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!groqKeyDraft.trim()) return;
                      persistProviderSettings({ groqApiKey: groqKeyDraft.trim() });
                      setGroqKeyDraft("");
                      setGroqKeySaved(true);
                      setTimeout(() => setGroqKeySaved(false), 1800);
                    }}
                    style={{
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "#C4623A",
                      color: "#181614",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Save
                  </button>
                </div>

                {groqKeySaved && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#4CAF6A",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Check size={13} /> Key saved
                  </div>
                )}
                {!groqKeySaved && groqApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    A key is currently saved. Enter a new one to replace it.
                  </div>
                )}
                {!groqKeySaved && !groqApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    Get a key at{" "}
                    <span style={{ color: "#a39d92" }}>console.groq.com/keys</span>
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#8a8478", lineHeight: 1.6, marginBottom: 4 }}>
                  Using {findModelById(groqModel)?.name || groqModel} for Groq-backed responses. Pick a
                  different model — from any of Groq's hosted companies — from the chip in the message bar.
                </div>
              </div>
            )}

            {/* OpenAI row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 4px",
                borderTop: "1px solid #2a2622",
                borderBottom: enabledProviders.openai ? "none" : "1px solid #2a2622",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#EDE9E2",
                  color: "#181614",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <OpenAILogo size={15} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "#EDE9E2" }}>OpenAI</div>
                <div style={{ fontSize: 11.5, color: "#6b655c" }}>GPT-5.6 models, direct from OpenAI</div>
              </div>
              <button
                onClick={() => toggleProviderEnabled("openai")}
                title={enabledProviders.openai ? "Enabled — click to disable" : "Disabled — click to enable"}
                style={{
                  width: 34,
                  height: 19,
                  borderRadius: 10,
                  border: "none",
                  background: enabledProviders.openai ? "#C4623A" : "#3a3632",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: enabledProviders.openai ? 17 : 2,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: "#EDE9E2",
                    transition: "left 0.15s",
                  }}
                />
              </button>
            </div>

            {enabledProviders.openai && (
              <div style={{ padding: "10px 4px 4px" }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    color: "#6b655c",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  OpenAI API key
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input
                    type="password"
                    value={openaiKeyDraft}
                    onChange={(e) => {
                      setOpenaiKeyDraft(e.target.value);
                      setOpenaiKeySaved(false);
                    }}
                    placeholder={openaiApiKey ? "•••••••••••••••••••• (saved)" : "sk-…"}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "#151310",
                      border: "1px solid #3a3632",
                      borderRadius: 8,
                      color: "#EDE9E2",
                      fontSize: 13,
                      padding: "9px 10px",
                      outline: "none",
                      fontFamily: MONO_FONT,
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!openaiKeyDraft.trim()) return;
                      persistProviderSettings({ openaiApiKey: openaiKeyDraft.trim() });
                      setOpenaiKeyDraft("");
                      setOpenaiKeySaved(true);
                      setTimeout(() => setOpenaiKeySaved(false), 1800);
                    }}
                    style={{
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "#C4623A",
                      color: "#181614",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Save
                  </button>
                </div>

                {openaiKeySaved && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#4CAF6A",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Check size={13} /> Key saved
                  </div>
                )}
                {!openaiKeySaved && openaiApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    A key is currently saved. Enter a new one to replace it.
                  </div>
                )}
                {!openaiKeySaved && !openaiApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    Get a key at{" "}
                    <span style={{ color: "#a39d92" }}>platform.openai.com/api-keys</span>
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#8a8478", lineHeight: 1.6, marginBottom: 4 }}>
                  Using {findModelById(openaiModel)?.name || openaiModel} for OpenAI-backed responses. Pick a
                  different model from the chip in the message bar.
                </div>
              </div>
            )}

            {/* Gemini row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 4px",
                borderTop: "1px solid #2a2622",
                borderBottom: enabledProviders.gemini ? "none" : "1px solid #2a2622",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#ffffff",
                  color: "#181614",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                <GoogleLogo size={15} idPrefix="settings" />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "#EDE9E2", display: "flex", alignItems: "center", gap: 6 }}>
                  Google
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      color: "#4CAF6A",
                      border: "1px solid #2a4a34",
                      background: "#16241c",
                      borderRadius: 4,
                      padding: "2px 5px",
                    }}
                  >
                    FREE TIER
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#6b655c" }}>Gemini models, direct from Google</div>
              </div>
              <button
                onClick={() => toggleProviderEnabled("gemini")}
                title={enabledProviders.gemini ? "Enabled — click to disable" : "Disabled — click to enable"}
                style={{
                  width: 34,
                  height: 19,
                  borderRadius: 10,
                  border: "none",
                  background: enabledProviders.gemini ? "#C4623A" : "#3a3632",
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: enabledProviders.gemini ? 17 : 2,
                    width: 15,
                    height: 15,
                    borderRadius: "50%",
                    background: "#EDE9E2",
                    transition: "left 0.15s",
                  }}
                />
              </button>
            </div>

            {enabledProviders.gemini && (
              <div style={{ padding: "10px 4px 4px" }}>
                <div
                  style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    color: "#6b655c",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Gemini API key
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input
                    type="password"
                    value={geminiKeyDraft}
                    onChange={(e) => {
                      setGeminiKeyDraft(e.target.value);
                      setGeminiKeySaved(false);
                    }}
                    placeholder={geminiApiKey ? "•••••••••••••••••••• (saved)" : "AIza…"}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: "#151310",
                      border: "1px solid #3a3632",
                      borderRadius: 8,
                      color: "#EDE9E2",
                      fontSize: 13,
                      padding: "9px 10px",
                      outline: "none",
                      fontFamily: MONO_FONT,
                    }}
                  />
                  <button
                    onClick={() => {
                      if (!geminiKeyDraft.trim()) return;
                      persistProviderSettings({ geminiApiKey: geminiKeyDraft.trim() });
                      setGeminiKeyDraft("");
                      setGeminiKeySaved(true);
                      setTimeout(() => setGeminiKeySaved(false), 1800);
                    }}
                    style={{
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "#C4623A",
                      color: "#181614",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    Save
                  </button>
                </div>

                {geminiKeySaved && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#4CAF6A",
                      marginBottom: 14,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Check size={13} /> Key saved
                  </div>
                )}
                {!geminiKeySaved && geminiApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    A key is currently saved. Enter a new one to replace it.
                  </div>
                )}
                {!geminiKeySaved && !geminiApiKey && (
                  <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14 }}>
                    Get a key at{" "}
                    <span style={{ color: "#a39d92" }}>aistudio.google.com/apikey</span>
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#8a8478", lineHeight: 1.6, marginBottom: 4 }}>
                  Using {findModelById(geminiModel)?.name || geminiModel} for Gemini-backed responses. Pick a
                  different model from the chip in the message bar.
                </div>
              </div>
            )}

            {/* Exa row — same flat layout as the provider rows above, though
                Exa isn't a chat provider: it powers the built-in web_search/
                web_fetch tools and has no enable/disable toggle. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 4px",
                borderTop: "1px solid #2a2622",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#EDE9E2",
                  color: "#1a1512",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                E
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "#EDE9E2", display: "flex", alignItems: "center", gap: 6 }}>
                  Exa
                  <span
                    style={{
                      fontSize: 9.5,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      color: "#4CAF6A",
                      border: "1px solid #2a4a34",
                      background: "#16241c",
                      borderRadius: 4,
                      padding: "2px 5px",
                    }}
                  >
                    FREE TIER
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#6b655c" }}>
                  Powers web_search &amp; web_fetch tools
                </div>
              </div>
            </div>

            <div style={{ padding: "10px 4px 4px" }}>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: 0.3,
                  color: "#6b655c",
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                Exa API key
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, minWidth: 0 }}>
                <input
                  type="password"
                  value={exaKeyDraft}
                  onChange={(e) => {
                    setExaKeyDraft(e.target.value);
                    setExaKeySaved(false);
                  }}
                  placeholder={exaApiKey ? "•••••••••••••••••••• (saved)" : "Exa API key…"}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "#151310",
                    border: "1px solid #3a3632",
                    borderRadius: 8,
                    color: "#EDE9E2",
                    fontSize: 13,
                    padding: "9px 10px",
                    outline: "none",
                    fontFamily: MONO_FONT,
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10, minWidth: 0 }}>
                <button
                  onClick={() => {
                    const k = exaKeyDraft.trim();
                    if (!k) return;
                    persistProviderSettings({ exaApiKey: k });
                    setExaKeyDraft("");
                    setExaKeySaved(true);
                    setTimeout(() => setExaKeySaved(false), 1800);
                  }}
                  style={{
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "none",
                    background: "#C4623A",
                    color: "#181614",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  Save
                </button>
              </div>

              {exaKeySaved && (
                <div
                  style={{
                    fontSize: 12,
                    color: "#4CAF6A",
                    marginBottom: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <Check size={13} /> Saved
                </div>
              )}
              {!exaKeySaved && exaApiKey && (
                <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 4 }}>
                  Key is set.
                </div>
              )}
              {!exaKeySaved && !exaApiKey && (
                <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 4, lineHeight: 1.5 }}>
                  Get a key at <span style={{ color: "#a39d92" }}>dashboard.exa.ai/api-keys</span>.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* MCP Connectors — list modal, opened from the sidebar */}
      {mcpModalOpen && (
        <div
          onClick={() => setMcpModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 380,
              maxHeight: "82vh",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
              background: "#1c1916",
              border: "1px solid #37322c",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Monitor size={17} />
                MCP Connectors
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button
                  onClick={() => setMcpAddModalOpen(true)}
                  title="Add server"
                  style={{
                    background: "none",
                    border: "none",
                    color: "#C4623A",
                    cursor: "pointer",
                    display: "flex",
                    padding: 4,
                  }}
                >
                  <Plus size={18} />
                </button>
                <button
                  onClick={() => setMcpModalOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8a8478",
                    cursor: "pointer",
                    display: "flex",
                    padding: 4,
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#6b655c", marginBottom: 14, lineHeight: 1.5 }}>
              Servers connected here run through Kuro's own local tool framework — Kuro talks to them
              directly rather than routing the connection through a model provider.
            </div>

            {mcpServers.length === 0 && (
              <div
                style={{
                  fontSize: 12.5,
                  color: "#6b655c",
                  textAlign: "center",
                  padding: "24px 10px",
                  border: "1px dashed #2a2622",
                  borderRadius: 10,
                }}
              >
                No MCP servers connected yet.
                <br />
                Tap + to add one.
              </div>
            )}

            {mcpServers.length > 0 && (
              <div>
                {mcpServers.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 9,
                      border: "1px solid #2a2622",
                      marginBottom: 6,
                    }}
                  >
                    <button
                      onClick={() => toggleMcpServer(s.id)}
                      title={s.enabled ? "Enabled — click to disable" : "Disabled — click to enable"}
                      style={{
                        width: 30,
                        height: 17,
                        borderRadius: 9,
                        border: "none",
                        background: s.enabled ? "#C4623A" : "#3a3632",
                        position: "relative",
                        cursor: "pointer",
                        flexShrink: 0,
                        transition: "background 0.15s",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          left: s.enabled ? 15 : 2,
                          width: 13,
                          height: 13,
                          borderRadius: "50%",
                          background: "#EDE9E2",
                          transition: "left 0.15s",
                        }}
                      />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#EDE9E2",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6b655c",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: MONO_FONT,
                        }}
                      >
                        {s.url}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMcpServer(s.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#8a8478",
                        cursor: "pointer",
                        padding: 4,
                        flexShrink: 0,
                        display: "flex",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MCP Connectors — add server modal, opened from the + inside the list modal */}
      {mcpAddModalOpen && (
        <div
          onClick={() => setMcpAddModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 340,
              background: "#1c1916",
              border: "1px solid #37322c",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>Add MCP server</span>
              <button
                onClick={() => setMcpAddModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8a8478",
                  cursor: "pointer",
                  display: "flex",
                  padding: 4,
                }}
              >
                <X size={17} />
              </button>
            </div>

            <input
              value={mcpNameDraft}
              onChange={(e) => setMcpNameDraft(e.target.value)}
              placeholder="Name (e.g. github)"
              style={{
                width: "100%",
                background: "#151310",
                border: "1px solid #3a3632",
                borderRadius: 8,
                color: "#EDE9E2",
                fontSize: 13,
                padding: "9px 10px",
                outline: "none",
                marginBottom: 8,
              }}
            />
            <input
              value={mcpUrlDraft}
              onChange={(e) => setMcpUrlDraft(e.target.value)}
              placeholder="https://example-server.modelcontextprotocol.io/sse"
              style={{
                width: "100%",
                background: "#151310",
                border: "1px solid #3a3632",
                borderRadius: 8,
                color: "#EDE9E2",
                fontSize: 13,
                padding: "9px 10px",
                outline: "none",
                marginBottom: 8,
                fontFamily: MONO_FONT,
              }}
            />
            <input
              type="password"
              value={mcpTokenDraft}
              onChange={(e) => setMcpTokenDraft(e.target.value)}
              placeholder="Auth token (optional)"
              style={{
                width: "100%",
                background: "#151310",
                border: "1px solid #3a3632",
                borderRadius: 8,
                color: "#EDE9E2",
                fontSize: 13,
                padding: "9px 10px",
                outline: "none",
                marginBottom: 12,
                fontFamily: MONO_FONT,
              }}
            />
            <button
              onClick={() => {
                addMcpServer();
                setMcpAddModalOpen(false);
              }}
              disabled={!mcpNameDraft.trim() || !mcpUrlDraft.trim()}
              style={{
                width: "100%",
                padding: "9px 0",
                borderRadius: 8,
                border: "none",
                background: mcpNameDraft.trim() && mcpUrlDraft.trim() ? "#C4623A" : "#3a3632",
                color: mcpNameDraft.trim() && mcpUrlDraft.trim() ? "#181614" : "#6b655c",
                fontSize: 13,
                fontWeight: 600,
                cursor: mcpNameDraft.trim() && mcpUrlDraft.trim() ? "pointer" : "default",
              }}
            >
              Add server
            </button>
          </div>
        </div>
      )}

      {/* Popped automatically when a model tries web_search/web_fetch and the
          Exa key is missing — same state as the Settings panel. */}
      {exaKeyModalOpen && (
        <div
          onClick={() => setExaKeyModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 360,
              background: "#1c1916",
              border: "1px solid #37322c",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>Web search needs setup</span>
              <button
                onClick={() => setExaKeyModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8a8478",
                  cursor: "pointer",
                  display: "flex",
                  padding: 4,
                  flexShrink: 0,
                }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ fontSize: 13, color: "#a39d92", lineHeight: 1.55, marginBottom: 14 }}>
              Web search runs through a Cloudflare Worker proxy to avoid browser CORS restrictions.
              You just need an Exa API key.
            </div>

            <div
              style={{
                background: "#151310",
                border: "1px solid #2a2622",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 14,
              }}
            >
              <ol style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#a39d92", lineHeight: 1.9 }}>
                <li>
                  Get a free Exa key at{" "}
                  <span style={{ color: "#EDE9E2", fontFamily: MONO_FONT }}>dashboard.exa.ai/api-keys</span>
                </li>
                <li>Paste it below and hit Save</li>
              </ol>
            </div>

            <div
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                letterSpacing: 0.3,
                color: "#6b655c",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Exa API key
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input
                type="password"
                value={exaKeyDraft}
                onChange={(e) => {
                  setExaKeyDraft(e.target.value);
                  setExaKeySaved(false);
                }}
                placeholder={exaApiKey ? "•••••••••••••••••••• (saved)" : "Exa API key…"}
                autoFocus
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "#151310",
                  border: "1px solid #3a3632",
                  borderRadius: 8,
                  color: "#EDE9E2",
                  fontSize: 13,
                  padding: "9px 10px",
                  outline: "none",
                  fontFamily: MONO_FONT,
                }}
              />
            </div>

            <button
              onClick={() => {
                const k = exaKeyDraft.trim();
                if (!k) return;
                persistProviderSettings({ exaApiKey: k });
                setExaKeyDraft("");
                setExaKeySaved(true);
                setTimeout(() => setExaKeySaved(false), 1800);
                setExaKeyModalOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 8,
                border: "none",
                background: exaKeyDraft.trim() ? "#C4623A" : "#3a3632",
                color: exaKeyDraft.trim() ? "#181614" : "#6b655c",
                fontSize: 13,
                fontWeight: 600,
                cursor: exaKeyDraft.trim() ? "pointer" : "default",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
