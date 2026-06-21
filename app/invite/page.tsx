"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { supabase } from "@/lib/supabase";

type Guest = {
  full_name: string;
  category: string | null;
  invite_code: string;
  rsvp_status: string | null;
};

export default function InvitePage() {
  const ticketRef = useRef<HTMLDivElement>(null);

  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = ["/pastor-slide-1.png?v=1", "/pastor-slide-2.png?v=1"];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");

    if (!codeFromUrl) {
      setError("Invalid invitation link");
      setLoading(false);
      return;
    }

    fetchGuest(codeFromUrl);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  async function fetchGuest(rawCode: string) {
    const cleanedCode = rawCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from("guests")
      .select("full_name, category, invite_code, rsvp_status")
      .eq("invite_code", cleanedCode)
      .single();

    if (error || !data) setError("Invitation not found");
    else setGuest(data);

    setLoading(false);
  }

  async function acceptInvitation() {
    if (!guest) return;

    setAccepting(true);

    const { error } = await supabase
      .from("guests")
      .update({ rsvp_status: "Accepted" })
      .eq("invite_code", guest.invite_code);

    if (error) alert(error.message);
    else setGuest({ ...guest, rsvp_status: "Accepted" });

    setAccepting(false);
  }

  async function downloadInvite() {
    if (!ticketRef.current || !guest) return;

    try {
      setDownloading(true);

      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: "#160024",
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");

      link.href = image;
      link.download = `${guest.full_name}-e-ticket.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("DOWNLOAD ERROR:", error);
      alert(String(error));
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <main style={pageStyle}>Loading invitation...</main>;

  if (error || !guest) {
    return (
      <main style={pageStyle}>
        <div style={errorCardStyle}>
          <h1>Invitation Error</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  const qrValue = `https://event-invitation-platform.vercel.app/admin/verify?code=${guest.invite_code}`;
  const hasAccepted = guest.rsvp_status === "Accepted";

  return (
    <main style={pageStyle}>
      <style>
        {`
          @keyframes shineLine {
            0% { left: -45%; }
            100% { left: 115%; }
          }

          @keyframes floatParticle {
            0% { transform: translateY(0) scale(1); opacity: .25; }
            50% { opacity: 1; }
            100% { transform: translateY(-22px) scale(1.15); opacity: .35; }
          }

          @keyframes softGlow {
            0%, 100% { box-shadow: 0 0 42px rgba(250,204,21,.18); }
            50% { box-shadow: 0 0 70px rgba(250,204,21,.34); }
          }
        `}
      </style>

      <div style={particleOneStyle} />
      <div style={particleTwoStyle} />
      <div style={particleThreeStyle} />
      <div style={particleFourStyle} />

      <div style={{ width: "100%", maxWidth: "980px", position: "relative" }}>
        <img src="/logo.png" alt="Celebrating Pastor Obi" style={topLogoStyle} />

        <div style={sliderStyle}>
          {slides.map((slide, index) => (
            <img
              key={slide}
              src={slide}
              alt="Birthday Banquet"
              style={{
                ...slideImageStyle,
                opacity: currentSlide === index ? 1 : 0,
                transform: currentSlide === index ? "scale(1.06)" : "scale(1)",
                transition: "opacity 1.2s ease, transform 4s ease",
              }}
            />
          ))}

          <div style={slideOverlayStyle} />

          <div style={slideTextStyle}>
            <p style={slideSmallText}>SPECIAL INVITATION TO THE</p>
            <h1 style={slideTitleText}>Birthday Banquet</h1>
          </div>
        </div>

        <div style={dotsStyle}>
          {slides.map((_, index) => (
            <div
              key={index}
              style={{
                width: currentSlide === index ? "24px" : "10px",
                height: "10px",
                borderRadius: "999px",
                backgroundColor:
                  currentSlide === index ? "#facc15" : "rgba(255,255,255,.35)",
                transition: "all .3s ease",
              }}
            />
          ))}
        </div>

        <AnimatedDivider />

        <div style={webCardStyle}>
          <p style={smallGoldText}>YOU ARE INVITED</p>
          <p
  style={{
    color: "red",
    fontWeight: "bold",
    fontSize: "24px",
    marginTop: "20px",
  }}
>
  TEST VERSION JUNE 2026
</p>
          <p style={smallWhiteText}>HIGHLY ESTEEMED</p>

          <h1 style={guestNameStyle}>{guest.full_name}</h1>

          <AnimatedDivider />

          <p style={bodyText}>
            You are cordially invited to celebrate with us. We have reserved 1
            seat in your honour.
          </p>

          {!hasAccepted ? (
            <button onClick={acceptInvitation} style={acceptButtonStyle}>
              {accepting ? "ACCEPTING..." : "✓ ACCEPT INVITATION"}
            </button>
          ) : (
            <div style={acceptedStyle}>✓ INVITATION ACCEPTED</div>
          )}

          <p style={thankYouText}>
            THANK YOU, WE CAN&apos;T WAIT TO CELEBRATE WITH YOU.
          </p>

          <div style={qrWrapStyle}>
            <div style={qrBoxStyle}>
              <QRCode value={qrValue} size={180} />
            </div>
          </div>

          <p style={inviteCodeText}>
            INVITE CODE:{" "}
            <span style={{ color: "#facc15", fontWeight: "bold" }}>
              {guest.invite_code}
            </span>
          </p>

          <button
            type="button"
            onClick={downloadInvite}
            disabled={downloading}
            style={downloadButtonStyle}
          >
            {downloading ? "DOWNLOADING..." : "DOWNLOAD E-INVITE"}
          </button>
        </div>

        <div style={footerStyle}>
          <AnimatedDivider />
          <h2 style={footerTitleStyle}>With Love & Honour</h2>
          <p style={footerTextStyle}>YOUR PRESENCE IS OUR GREATEST GIFT</p>
          <div style={{ marginTop: "34px" }}>
            <span style={{ color: "#facc15", fontSize: "24px" }}>✦</span>
          </div>
        </div>

        <div style={hiddenTicketWrapper}>
          <div ref={ticketRef} style={ticketStyle}>
            <div style={ticketInnerBorder}>
              <img
                src="/logo.png"
                alt="Celebrating Pastor Obi"
                style={ticketLogoStyle}
              />

              <p style={ticketSmallGold}>GRAND CELEBRATION</p>
              <h1 style={ticketTitle}>Birthday Banquet</h1>

              <div style={ticketDivider} />

              <p style={ticketPresented}>THIS INVITATION IS PRESENTED TO</p>
              <h2 style={ticketGuestName}>{guest.full_name}</h2>

              <p style={ticketDate}>Wednesday, 17th June 2026 · 10:00 AM</p>
              <p style={ticketVenue}>The Assembly, Ogbomoso</p>

              <div style={ticketQRBox}>
                <QRCode value={qrValue} size={285} />
              </div>

              <p style={ticketAccessLabel}>ACCESS CODE</p>
              <p style={ticketCode}>{guest.invite_code}</p>

              <p style={ticketInstruction}>
                Present this QR ticket at the Access Control Point
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function AnimatedDivider() {
  return (
    <div style={animatedDividerStyle}>
      <span style={dividerStarStyle}>✦</span>
      <span style={dividerShineStyle} />
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top, #5b1496 0%, #3b0764 45%, #2a0248 100%)",
  color: "#ffffff",
  display: "flex",
  justifyContent: "center",
  padding: "60px 16px",
  position: "relative",
  overflow: "hidden",
};

const animatedDividerStyle: React.CSSProperties = {
  width: "360px",
  maxWidth: "80%",
  height: "1px",
  margin: "34px auto",
  background:
    "linear-gradient(90deg, transparent, rgba(250,204,21,.35), #facc15, rgba(250,204,21,.35), transparent)",
  position: "relative",
  overflow: "hidden",
};

const dividerStarStyle: React.CSSProperties = {
  position: "absolute",
  top: "-7px",
  left: "50%",
  transform: "translateX(-50%)",
  color: "#facc15",
  backgroundColor: "#3b0764",
  padding: "0 14px",
  fontSize: "13px",
  zIndex: 2,
};

const dividerShineStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: "-45%",
  width: "45%",
  height: "100%",
  background:
    "linear-gradient(90deg, transparent, rgba(255,255,255,.95), transparent)",
  animation: "shineLine 2.8s infinite",
};

const particleOneStyle: React.CSSProperties = {
  position: "absolute",
  width: "5px",
  height: "5px",
  borderRadius: "999px",
  backgroundColor: "#facc15",
  top: "18%",
  left: "12%",
  animation: "floatParticle 3.2s infinite",
};

const particleTwoStyle: React.CSSProperties = {
  position: "absolute",
  width: "4px",
  height: "4px",
  borderRadius: "999px",
  backgroundColor: "#facc15",
  top: "48%",
  right: "10%",
  animation: "floatParticle 4.1s infinite",
};

const particleThreeStyle: React.CSSProperties = {
  position: "absolute",
  width: "3px",
  height: "3px",
  borderRadius: "999px",
  backgroundColor: "#facc15",
  bottom: "18%",
  left: "18%",
  animation: "floatParticle 3.8s infinite",
};

const particleFourStyle: React.CSSProperties = {
  position: "absolute",
  width: "4px",
  height: "4px",
  borderRadius: "999px",
  backgroundColor: "#facc15",
  bottom: "28%",
  right: "18%",
  animation: "floatParticle 4.5s infinite",
};

const errorCardStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  color: "#000000",
  borderRadius: "20px",
  padding: "32px",
  textAlign: "center",
};

const topLogoStyle: React.CSSProperties = {
  width: "220px",
  height: "220px",
  margin: "0 auto 48px",
  display: "block",
  borderRadius: "999px",
  objectFit: "cover",
  boxShadow: "0 0 50px rgba(250,204,21,.35)",
};

const sliderStyle: React.CSSProperties = {
  width: "100%",
  height: "430px",
  borderRadius: "28px",
  overflow: "hidden",
  border: "1px solid #d4af37",
  boxShadow: "0 0 45px rgba(212,175,55,.25)",
  position: "relative",
  animation: "softGlow 4s infinite",
};

const slideImageStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const slideOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top, rgba(0,0,0,.65), rgba(0,0,0,.1))",
};

const slideTextStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "34px",
  width: "100%",
  textAlign: "center",
  color: "#facc15",
};

const slideSmallText: React.CSSProperties = {
  letterSpacing: ".35em",
  fontSize: "13px",
  marginBottom: "10px",
};

const slideTitleText: React.CSSProperties = {
  fontSize: "68px",
  fontFamily: "serif",
  margin: 0,
};

const dotsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "10px",
  marginTop: "18px",
  marginBottom: "40px",
};

const webCardStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(250,204,21,.65)",
  borderRadius: "28px",
  padding: "56px 48px",
  textAlign: "center",
  color: "#ffffff",
  backgroundColor: "rgba(59,7,100,.4)",
  boxShadow: "inset 0 0 35px rgba(250,204,21,.08)",
};

const smallGoldText: React.CSSProperties = {
  letterSpacing: "0.55em",
  color: "#facc15",
  fontSize: "14px",
};

const smallWhiteText: React.CSSProperties = {
  letterSpacing: "0.42em",
  color: "#e9d5ff",
  fontSize: "14px",
  marginTop: "30px",
};

const guestNameStyle: React.CSSProperties = {
  fontSize: "78px",
  lineHeight: "1",
  fontFamily: "serif",
  color: "#facc15",
  marginTop: "28px",
  marginBottom: "0",
  textShadow: "0 0 20px rgba(250,204,21,.2)",
};

const bodyText: React.CSSProperties = {
  fontSize: "20px",
  marginTop: "28px",
};

const acceptButtonStyle: React.CSSProperties = {
  marginTop: "32px",
  border: "1px solid #facc15",
  borderRadius: "14px",
  padding: "16px 34px",
  letterSpacing: "0.15em",
  color: "#facc15",
  backgroundColor: "transparent",
  cursor: "pointer",
};

const acceptedStyle: React.CSSProperties = {
  marginTop: "32px",
  display: "inline-block",
  border: "1px solid #facc15",
  borderRadius: "14px",
  padding: "16px 34px",
  letterSpacing: "0.15em",
  color: "#facc15",
};

const thankYouText: React.CSSProperties = {
  marginTop: "32px",
  letterSpacing: "0.25em",
  fontSize: "14px",
};

const qrWrapStyle: React.CSSProperties = {
  marginTop: "34px",
  display: "flex",
  justifyContent: "center",
};

const qrBoxStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "0 0 30px rgba(250,204,21,.18)",
};

const inviteCodeText: React.CSSProperties = {
  marginTop: "22px",
  letterSpacing: "0.35em",
  fontSize: "14px",
};

const downloadButtonStyle: React.CSSProperties = {
  marginTop: "24px",
  backgroundColor: "#facc15",
  color: "#3b0764",
  padding: "16px 40px",
  borderRadius: "12px",
  fontWeight: "bold",
  letterSpacing: "0.15em",
  border: "none",
  cursor: "pointer",
};

const footerStyle: React.CSSProperties = {
  marginTop: "70px",
  textAlign: "center",
};

const footerTitleStyle: React.CSSProperties = {
  color: "#facc15",
  fontSize: "48px",
  fontFamily: "serif",
  margin: 0,
};

const footerTextStyle: React.CSSProperties = {
  letterSpacing: "0.3em",
  fontSize: "13px",
  color: "#ffffff",
};

const hiddenTicketWrapper: React.CSSProperties = {
  position: "fixed",
  left: "-9999px",
  top: 0,
};

const ticketStyle: React.CSSProperties = {
  width: "1080px",
  height: "1350px",
  backgroundColor: "#160024",
  padding: "28px",
  color: "#ffffff",
};

const ticketInnerBorder: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: "5px solid #d4af37",
  borderRadius: "34px",
  padding: "44px 52px",
  textAlign: "center",
  boxSizing: "border-box",
  background:
    "radial-gradient(circle at top, #34104f 0%, #1b062b 55%, #12001f 100%)",
};

const ticketLogoStyle: React.CSSProperties = {
  width: "190px",
  height: "190px",
  borderRadius: "999px",
  objectFit: "cover",
  margin: "0 auto 38px",
  display: "block",
};

const ticketSmallGold: React.CSSProperties = {
  letterSpacing: "0.35em",
  color: "#facc15",
  fontSize: "28px",
  fontWeight: "bold",
  margin: 0,
};

const ticketTitle: React.CSSProperties = {
  fontFamily: "serif",
  fontSize: "84px",
  color: "#f6df7a",
  margin: "18px 0 14px",
  fontStyle: "italic",
};

const ticketDivider: React.CSSProperties = {
  width: "280px",
  height: "2px",
  backgroundColor: "#9f7e2c",
  margin: "0 auto 40px",
};

const ticketPresented: React.CSSProperties = {
  color: "#d8cdea",
  fontSize: "24px",
  fontWeight: "bold",
  margin: 0,
};

const ticketGuestName: React.CSSProperties = {
  fontFamily: "serif",
  fontSize: "100px",
  color: "#fff7e0",
  fontStyle: "italic",
  margin: "18px 0 14px",
};

const ticketDate: React.CSSProperties = {
  color: "#d8cdea",
  fontSize: "25px",
  margin: 0,
};

const ticketVenue: React.CSSProperties = {
  color: "#d8cdea",
  fontSize: "25px",
  marginTop: "8px",
};

const ticketQRBox: React.CSSProperties = {
  width: "340px",
  height: "340px",
  borderRadius: "22px",
  backgroundColor: "#ffffff",
  margin: "24px auto 12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const ticketAccessLabel: React.CSSProperties = {
  color: "#d8cdea",
  fontSize: "18px",
  letterSpacing: "0.22em",
  marginBottom: "-8px",
};

const ticketCode: React.CSSProperties = {
  color: "#facc15",
  fontSize: "34px",
  letterSpacing: "0.3em",
  fontWeight: "bold",
  margin: "14px 0",
};

const ticketInstruction: React.CSSProperties = {
  color: "#d8cdea",
  fontSize: "22px",
  marginTop: "14px",
};