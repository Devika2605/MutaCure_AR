// components/protein/ARLaunchPanel.jsx
// Shows after protein is generated — QR code + Hiro marker on laptop screen
// User scans QR with phone, points phone at Hiro marker on laptop

import { useEffect, useRef } from "react";
import styles from "./ARLaunchPanel.module.css";

const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Get the laptop's local IP for the phone to reach — falls back to localhost
function getBaseUrl() {
  if (typeof window === "undefined") return "http://localhost:3000";
  return window.location.origin;
}

export default function ARLaunchPanel({ result, selectedDisease }) {
  const qrRef = useRef(null);

  // Build the AR URL with all params embedded
  const arUrl = (() => {
    if (!result) return "";
    const base = getBaseUrl();
    const params = new URLSearchParams({
      protein: selectedDisease.target,
      disease: selectedDisease.label,
      mut: result.mutation_info?.split("—")[0]?.trim() || "P115Q",
      risk: selectedDisease.risk,
    });
    return `${base}/ar/index.html?${params.toString()}`;
  })();

  // Generate QR code using qrcode.js CDN
  useEffect(() => {
    if (!arUrl || !qrRef.current) return;
    qrRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
      new window.QRCode(qrRef.current, {
        text: arUrl,
        width: 160,
        height: 160,
        colorDark: "#6fcf7a",
        colorLight: "#0d1a0f",
        correctLevel: window.QRCode.CorrectLevel.M,
      });
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, [arUrl]);

  if (!result) return null;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.icon}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </span>
        <span className={styles.title}>Launch AR on your phone</span>
      </div>

      <div className={styles.body}>
        {/* Step 1 — QR code */}
        <div className={styles.step}>
          <div className={styles.stepNum}>1</div>
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>Scan with your phone</p>
            <div className={styles.qrWrap} ref={qrRef}/>
            <p className={styles.stepSub}>Opens AR viewer in phone browser</p>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider}/>

        {/* Step 2 — Hiro marker */}
        <div className={styles.step}>
          <div className={styles.stepNum}>2</div>
          <div className={styles.stepContent}>
            <p className={styles.stepLabel}>Point phone at this marker</p>
            <div className={styles.markerWrap}>
              {/* Hiro marker as inline SVG — no external dependency */}
              <img
                src="https://raw.githubusercontent.com/nicktindall/cyclon.p2p-rtc-client/master/examples/img/hiro.png"
                alt="Hiro AR marker"
                className={styles.markerImg}
                width={160}
                height={160}
              />
            </div>
            <p className={styles.stepSub}>PPARG protein will float above this</p>
          </div>
        </div>
      </div>

      <div className={styles.mutInfo}>
        <span style={{color:"#e05c5c"}}>⚠</span>
        {" "}{result.mutation_info}
      </div>
    </div>
  );
}