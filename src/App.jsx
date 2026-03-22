import { useState, useEffect, useRef, Suspense, lazy } from "react";

// ─── CSS ───────────────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --black:   #050507;
      --white:   #f0ede8;
      --red:     #e8232a;
      --red2:    #ff4d52;
      --grey:    #1a1a22;
      --grey2:   #2c2c38;
      --muted:   #6b6b80;
      --gold:    #c9a84c;
    }

    html { scroll-behavior: smooth; overflow-x: hidden; }

    body {
      background: var(--black);
      color: var(--white);
      font-family: 'Rajdhani', sans-serif;
      font-size: 16px;
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--black); }
    ::-webkit-scrollbar-thumb { background: var(--red); border-radius: 2px; }

    ::selection { background: var(--red); color: #fff; }

    /* ── Noise overlay ── */
    body::before {
      content: '';
      position: fixed; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 9999;
      opacity: .5;
    }

    /* ── Utility ── */
    .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0); }

    /* ── Nav ── */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 48px;
      transition: background .4s, backdrop-filter .4s, padding .3s;
    }
    nav.scrolled {
      background: rgba(5,5,7,.85);
      backdrop-filter: blur(18px);
      padding: 14px 48px;
      border-bottom: 1px solid rgba(232,35,42,.2);
    }
    .nav-logo {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 28px;
      letter-spacing: 3px;
      color: var(--white);
      text-decoration: none;
      display: flex; align-items: center; gap: 8px;
    }
    .nav-logo span { color: var(--red); }
    .nav-links { display: flex; gap: 36px; list-style: none; }
    .nav-links a {
      font-family: 'Rajdhani'; font-weight: 600; font-size: 13px;
      letter-spacing: 2px; text-transform: uppercase;
      color: var(--muted); text-decoration: none;
      transition: color .2s;
      position: relative;
    }
    .nav-links a::after {
      content: ''; position: absolute; bottom: -4px; left: 0; right: 0; height: 1px;
      background: var(--red); transform: scaleX(0); transition: transform .2s;
    }
    .nav-links a:hover { color: var(--white); }
    .nav-links a:hover::after { transform: scaleX(1); }
    .nav-cta {
      background: var(--red); color: #fff; border: none; cursor: pointer;
      font-family: 'Rajdhani'; font-weight: 700; font-size: 13px;
      letter-spacing: 2px; text-transform: uppercase;
      padding: 10px 24px;
      clip-path: polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);
      transition: background .2s, transform .15s;
    }
    .nav-cta:hover { background: var(--red2); transform: translateY(-1px); }
    .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
    .hamburger span { display: block; width: 24px; height: 2px; background: var(--white); transition: .3s; }

    /* ── Hero ── */
    #hero {
      min-height: 100vh;
      display: grid; place-items: center;
      position: relative; overflow: hidden;
      background: radial-gradient(ellipse 80% 60% at 50% 40%, #1a0608 0%, var(--black) 70%);
    }
    .hero-grid-lines {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(232,35,42,.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(232,35,42,.06) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
    }
    .hero-content {
      text-align: center; position: relative; z-index: 2;
      padding: 0 24px;
      animation: fadeUp .9s ease both;
    }
    @keyframes fadeUp {
      from { opacity:0; transform: translateY(40px); }
      to   { opacity:1; transform: translateY(0); }
    }
    .hero-eyebrow {
      font-family: 'Space Mono'; font-size: 11px; letter-spacing: 5px;
      color: var(--red); text-transform: uppercase; margin-bottom: 20px;
      display: flex; align-items: center; justify-content: center; gap: 12px;
    }
    .hero-eyebrow::before, .hero-eyebrow::after {
      content: ''; flex: 1; max-width: 60px; height: 1px; background: var(--red);
    }
    .hero-title {
      font-family: 'Bebas Neue'; font-size: clamp(80px, 14vw, 180px);
      line-height: .92; letter-spacing: -2px;
      background: linear-gradient(160deg, #fff 30%, #888 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    .hero-title em {
      font-style: normal;
      background: linear-gradient(100deg, var(--red) 0%, #ff8c00 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: 18px; font-weight: 300; color: var(--muted);
      letter-spacing: 1px; margin-bottom: 44px; max-width: 480px; margin-left: auto; margin-right: auto;
    }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
    .btn-primary {
      background: var(--red); color: #fff; border: none; cursor: pointer;
      font-family: 'Rajdhani'; font-weight: 700; font-size: 14px;
      letter-spacing: 2.5px; text-transform: uppercase; padding: 14px 36px;
      clip-path: polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%);
      transition: background .2s, transform .2s, box-shadow .2s;
    }
    .btn-primary:hover { background: var(--red2); transform: translateY(-2px); box-shadow: 0 12px 32px rgba(232,35,42,.4); }
    .btn-secondary {
      background: transparent; color: var(--white); border: 1px solid rgba(240,237,232,.25); cursor: pointer;
      font-family: 'Rajdhani'; font-weight: 600; font-size: 14px;
      letter-spacing: 2.5px; text-transform: uppercase; padding: 14px 36px;
      transition: border-color .2s, color .2s, transform .2s;
    }
    .btn-secondary:hover { border-color: var(--white); transform: translateY(-2px); }

    /* ── 3D Bike ── */
    .hero-bike-wrap {
      position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
      width: 900px; max-width: 95vw;
      animation: floatBike 6s ease-in-out infinite;
      pointer-events: none;
      filter: drop-shadow(0 40px 80px rgba(232,35,42,.25));
    }
    @keyframes floatBike {
      0%,100% { transform: translateX(-50%) translateY(0) rotate(0deg); }
      50%      { transform: translateX(-50%) translateY(-18px) rotate(.4deg); }
    }

    /* ── Stats bar ── */
    .stats-bar {
      display: flex; justify-content: center; gap: 0;
      background: var(--grey); border-top: 1px solid rgba(232,35,42,.2);
      overflow: hidden;
    }
    .stat-item {
      flex: 1; max-width: 220px; text-align: center;
      padding: 28px 16px; border-right: 1px solid rgba(255,255,255,.06);
      transition: background .2s;
    }
    .stat-item:last-child { border-right: none; }
    .stat-item:hover { background: rgba(232,35,42,.06); }
    .stat-num {
      font-family: 'Bebas Neue'; font-size: 42px; color: var(--red); letter-spacing: 1px;
    }
    .stat-label { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-top: 2px; }

    /* ── Section wrapper ── */
    section { padding: 96px 48px; }
    .section-tag {
      font-family: 'Space Mono'; font-size: 10px; letter-spacing: 4px;
      color: var(--red); text-transform: uppercase; margin-bottom: 12px;
    }
    .section-title {
      font-family: 'Bebas Neue'; font-size: clamp(42px, 6vw, 72px);
      line-height: 1; letter-spacing: 1px; margin-bottom: 20px;
    }
    .section-sub { color: var(--muted); font-size: 16px; line-height: 1.7; max-width: 480px; }

    /* ── Models ── */
    #models { background: var(--black); }
    .models-header { text-align: center; margin-bottom: 64px; }
    .models-header .section-sub { margin: 0 auto; }
    .models-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2px; max-width: 1280px; margin: 0 auto;
    }
    .model-card {
      position: relative; overflow: hidden;
      background: var(--grey);
      cursor: pointer;
      transition: transform .3s;
    }
    .model-card:hover { transform: scale(1.02); z-index: 2; }
    .model-card-img {
      width: 100%; aspect-ratio: 4/3; object-fit: contain;
      background: radial-gradient(ellipse at 50% 60%, #1c0c0e, var(--grey));
      display: flex; align-items: center; justify-content: center;
      font-size: 120px; transition: transform .5s;
    }
    .model-card:hover .model-card-img { transform: scale(1.06); }
    .model-card-body { padding: 24px; }
    .model-card-badge {
      display: inline-block; font-family: 'Space Mono'; font-size: 9px; letter-spacing: 3px;
      padding: 3px 10px; background: var(--red); color: #fff; text-transform: uppercase; margin-bottom: 8px;
    }
    .model-card-name { font-family: 'Bebas Neue'; font-size: 28px; letter-spacing: 1px; }
    .model-card-price { font-family: 'Rajdhani'; font-weight: 700; font-size: 22px; color: var(--gold); margin-top: 4px; }
    .model-card-specs {
      display: flex; gap: 16px; margin-top: 12px; padding-top: 12px;
      border-top: 1px solid rgba(255,255,255,.07); flex-wrap: wrap;
    }
    .spec-chip {
      font-size: 11px; letter-spacing: 1px; color: var(--muted);
      background: rgba(255,255,255,.04); padding: 4px 10px; border-radius: 2px;
    }
    .model-card-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(232,35,42,.15) 0%, transparent 50%);
      opacity: 0; transition: opacity .3s;
    }
    .model-card:hover .model-card-overlay { opacity: 1; }

    /* ── Features ── */
    #features {
      background: linear-gradient(180deg, var(--grey) 0%, var(--black) 100%);
    }
    .features-inner {
      max-width: 1280px; margin: 0 auto;
      display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
    }
    .features-visual {
      position: relative; display: flex; align-items: center; justify-content: center;
    }
    .features-visual-bg {
      width: 460px; height: 460px; max-width: 90vw; max-height: 90vw;
      border-radius: 50%;
      background: radial-gradient(circle at 40% 40%, rgba(232,35,42,.15), transparent 70%);
      border: 1px solid rgba(232,35,42,.1);
      display: flex; align-items: center; justify-content: center;
      font-size: 200px; position: relative;
      animation: rotateSlow 30s linear infinite;
    }
    @keyframes rotateSlow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .features-visual-inner {
      position: absolute; font-size: 200px;
      animation: rotateSlow 30s linear infinite reverse;
    }
    .feature-list { list-style: none; display: flex; flex-direction: column; gap: 24px; }
    .feature-item {
      display: flex; gap: 16px; padding: 20px;
      border: 1px solid rgba(255,255,255,.05);
      transition: border-color .2s, background .2s;
      cursor: default;
    }
    .feature-item:hover { border-color: rgba(232,35,42,.3); background: rgba(232,35,42,.04); }
    .feature-icon {
      font-size: 28px; width: 48px; height: 48px; flex-shrink: 0;
      background: rgba(232,35,42,.1); display: flex; align-items: center; justify-content: center;
    }
    .feature-text h4 { font-family: 'Bebas Neue'; font-size: 20px; letter-spacing: 1px; margin-bottom: 4px; }
    .feature-text p { color: var(--muted); font-size: 14px; line-height: 1.6; }

    /* ── Configure ── */
    #configure { background: var(--black); }
    .config-inner { max-width: 1100px; margin: 0 auto; }
    .config-preview {
      background: var(--grey);
      border: 1px solid rgba(255,255,255,.06);
      aspect-ratio: 16/7;
      display: flex; align-items: center; justify-content: center;
      font-size: clamp(100px, 18vw, 220px);
      margin-bottom: 32px;
      position: relative; overflow: hidden;
      transition: background .4s;
    }
    .config-overlay-line {
      position: absolute; inset: 0;
      background:
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 39px,
          rgba(255,255,255,.02) 40px
        );
    }
    .config-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 32px; }
    .config-group label {
      display: block; font-family: 'Space Mono'; font-size: 10px;
      letter-spacing: 3px; color: var(--muted); text-transform: uppercase; margin-bottom: 8px;
    }
    .config-select, .config-input {
      width: 100%; background: var(--grey); color: var(--white);
      border: 1px solid rgba(255,255,255,.1); padding: 10px 14px;
      font-family: 'Rajdhani'; font-size: 15px;
      outline: none; appearance: none;
      transition: border-color .2s;
    }
    .config-select:focus, .config-input:focus { border-color: var(--red); }
    .color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
    .color-swatch {
      width: 32px; height: 32px; cursor: pointer; border-radius: 2px;
      border: 2px solid transparent; transition: border-color .15s, transform .15s;
    }
    .color-swatch.active, .color-swatch:hover { border-color: var(--white); transform: scale(1.1); }
    .config-price {
      font-family: 'Bebas Neue'; font-size: 52px; color: var(--gold); margin-bottom: 16px;
    }
    .config-price span { font-family: 'Rajdhani'; font-size: 18px; color: var(--muted); margin-left: 8px; }
    .config-actions { display: flex; gap: 12px; flex-wrap: wrap; }

    /* ── Testimonials ── */
    #reviews { background: var(--grey); }
    .reviews-header { text-align: center; margin-bottom: 56px; }
    .reviews-header .section-sub { margin: 0 auto; }
    .reviews-track { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2px; max-width: 1280px; margin: 0 auto; }
    .review-card {
      background: var(--black); padding: 32px;
      border-top: 2px solid transparent; transition: border-color .2s;
    }
    .review-card:hover { border-color: var(--red); }
    .review-stars { display: flex; gap: 4px; margin-bottom: 16px; color: var(--gold); font-size: 16px; }
    .review-text { font-size: 15px; line-height: 1.75; color: var(--muted); margin-bottom: 20px; font-style: italic; }
    .review-author { font-family: 'Bebas Neue'; font-size: 18px; letter-spacing: 1px; }
    .review-meta { font-size: 11px; letter-spacing: 2px; color: var(--muted); margin-top: 2px; }

    /* ── Gallery ── */
    #gallery { background: var(--black); padding-bottom: 0; }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 240px);
      gap: 3px; max-width: 1280px; margin: 40px auto 0;
    }
    .gallery-cell {
      background: var(--grey);
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; cursor: pointer; position: relative;
      transition: filter .3s;
    }
    .gallery-cell:first-child { grid-column: span 2; grid-row: span 2; }
    .gallery-cell span { font-size: 60px; transition: transform .4s; }
    .gallery-cell:hover span { transform: scale(1.2); }
    .gallery-cell-overlay {
      position: absolute; inset: 0; background: rgba(232,35,42,.15);
      opacity: 0; display: flex; align-items: center; justify-content: center;
      transition: opacity .3s;
    }
    .gallery-cell-overlay-icon { font-size: 32px; }
    .gallery-cell:hover .gallery-cell-overlay { opacity: 1; }

    /* ── CTA band ── */
    #cta-band {
      padding: 80px 48px;
      background: linear-gradient(135deg, #1a0305 0%, var(--black) 60%);
      border-top: 1px solid rgba(232,35,42,.2);
      border-bottom: 1px solid rgba(232,35,42,.2);
      text-align: center;
    }
    .cta-band-title { font-family: 'Bebas Neue'; font-size: clamp(48px, 7vw, 96px); letter-spacing: 2px; margin-bottom: 16px; }
    .cta-band-sub { color: var(--muted); font-size: 17px; margin-bottom: 36px; }

    /* ── Dealers / Map ── */
    #dealers { background: var(--black); }
    .dealers-inner { max-width: 1100px; margin: 0 auto; }
    .dealer-search-bar {
      display: flex; gap: 0; margin-bottom: 40px;
    }
    .dealer-search-input {
      flex: 1; background: var(--grey); color: var(--white);
      border: 1px solid rgba(255,255,255,.1); border-right: none; padding: 14px 18px;
      font-family: 'Rajdhani'; font-size: 15px; outline: none;
    }
    .dealer-search-input:focus { border-color: var(--red); }
    .dealer-search-btn {
      background: var(--red); color: #fff; border: none; cursor: pointer;
      font-family: 'Rajdhani'; font-weight: 700; font-size: 13px;
      letter-spacing: 2px; text-transform: uppercase; padding: 0 24px;
      transition: background .2s;
    }
    .dealer-search-btn:hover { background: var(--red2); }
    .dealers-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2px; }
    .dealer-card { background: var(--grey); padding: 24px; border-left: 2px solid var(--red); }
    .dealer-card h4 { font-family: 'Bebas Neue'; font-size: 20px; letter-spacing: 1px; margin-bottom: 6px; }
    .dealer-card p { font-size: 13px; color: var(--muted); line-height: 1.6; }
    .dealer-card-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; letter-spacing: 2px; text-transform: uppercase;
      color: var(--red); text-decoration: none; margin-top: 12px;
      transition: gap .2s;
    }
    .dealer-card-link:hover { gap: 10px; }

    /* ── Newsletter ── */
    #newsletter {
      background: var(--grey); padding: 80px 48px;
      display: flex; align-items: center; justify-content: center;
    }
    .newsletter-inner { max-width: 540px; text-align: center; }
    .newsletter-inner .section-title { margin-bottom: 12px; }
    .newsletter-inner .section-sub { margin: 0 auto 32px; }
    .newsletter-form { display: flex; gap: 0; }
    .newsletter-input {
      flex: 1; background: var(--black); color: var(--white);
      border: 1px solid rgba(255,255,255,.1); border-right: none; padding: 14px 18px;
      font-family: 'Rajdhani'; font-size: 15px; outline: none;
    }
    .newsletter-input:focus { border-color: var(--red); }
    .newsletter-btn {
      background: var(--red); color: #fff; border: none; cursor: pointer;
      font-family: 'Rajdhani'; font-weight: 700; font-size: 13px;
      letter-spacing: 2px; text-transform: uppercase; padding: 0 28px;
      transition: background .2s;
    }
    .newsletter-btn:hover { background: var(--red2); }
    .newsletter-success { color: #4caf50; margin-top: 12px; font-size: 14px; letter-spacing: 1px; }
    .newsletter-error { color: var(--red2); margin-top: 12px; font-size: 14px; letter-spacing: 1px; }

    /* ── Footer ── */
    footer {
      background: var(--black); border-top: 1px solid rgba(255,255,255,.06);
      padding: 64px 48px 32px;
    }
    .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
    .footer-brand p { color: var(--muted); font-size: 14px; line-height: 1.7; margin-top: 12px; max-width: 260px; }
    .footer-col h5 {
      font-family: 'Space Mono'; font-size: 10px; letter-spacing: 3px;
      text-transform: uppercase; color: var(--muted); margin-bottom: 16px;
    }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .footer-col ul a { color: var(--muted); font-size: 14px; text-decoration: none; transition: color .2s; }
    .footer-col ul a:hover { color: var(--white); }
    .footer-bottom {
      border-top: 1px solid rgba(255,255,255,.06); padding-top: 28px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: gap;
      flex-wrap: wrap; gap: 12px;
    }
    .footer-bottom p { color: var(--muted); font-size: 12px; letter-spacing: 1px; }
    .footer-socials { display: flex; gap: 12px; }
    .footer-social-btn {
      width: 36px; height: 36px; background: var(--grey); border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; transition: background .2s;
    }
    .footer-social-btn:hover { background: var(--red); }

    /* ── Toast ── */
    .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 9998; display: flex; flex-direction: column; gap: 8px; }
    .toast {
      background: var(--grey); border-left: 3px solid var(--red); color: var(--white);
      padding: 14px 20px; font-size: 14px; min-width: 260px;
      animation: slideInToast .3s ease both;
      display: flex; align-items: center; gap: 10px;
    }
    .toast.success { border-color: #4caf50; }
    .toast.error { border-color: var(--red2); }
    @keyframes slideInToast {
      from { opacity:0; transform: translateX(30px); }
      to   { opacity:1; transform: translateX(0); }
    }
    .toast-dismiss { margin-left: auto; background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; }

    /* ── Modal ── */
    .modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.8);
      backdrop-filter: blur(6px); z-index: 500;
      display: flex; align-items: center; justify-content: center; padding: 24px;
      animation: fadeIn .2s;
    }
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
    .modal {
      background: var(--grey); border: 1px solid rgba(232,35,42,.25);
      max-width: 560px; width: 100%; padding: 40px; position: relative;
      animation: scaleIn .25s ease;
    }
    @keyframes scaleIn { from { transform: scale(.94); opacity:0; } to { transform: scale(1); opacity:1; } }
    .modal-close {
      position: absolute; top: 16px; right: 16px; background: none; border: none;
      color: var(--muted); font-size: 24px; cursor: pointer; transition: color .15s;
    }
    .modal-close:hover { color: var(--white); }
    .modal-title { font-family: 'Bebas Neue'; font-size: 32px; letter-spacing: 1px; margin-bottom: 8px; }
    .modal-sub { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
    .modal-form { display: flex; flex-direction: column; gap: 14px; }
    .modal-form input, .modal-form select, .modal-form textarea {
      background: var(--black); color: var(--white);
      border: 1px solid rgba(255,255,255,.1); padding: 12px 16px;
      font-family: 'Rajdhani'; font-size: 15px; outline: none; width: 100%;
      resize: vertical;
    }
    .modal-form input:focus, .modal-form select:focus, .modal-form textarea:focus { border-color: var(--red); }
    .modal-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .modal-err { color: var(--red2); font-size: 12px; margin-top: -8px; }
    .modal-form label {
      font-family: 'Space Mono'; font-size: 9px; letter-spacing: 3px;
      color: var(--muted); text-transform: uppercase; margin-bottom: 4px; display: block;
    }

    /* ── Loading screen ── */
    .loading-screen {
      position: fixed; inset: 0; background: var(--black);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 9999; transition: opacity .6s, visibility .6s;
    }
    .loading-screen.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
    .loading-logo { font-family: 'Bebas Neue'; font-size: 52px; letter-spacing: 4px; margin-bottom: 32px; color: var(--white); }
    .loading-logo span { color: var(--red); }
    .loading-bar-track { width: 240px; height: 2px; background: var(--grey2); overflow: hidden; }
    .loading-bar-fill { height: 100%; background: var(--red); animation: loadBar 1.6s ease-in-out forwards; }
    @keyframes loadBar { from { width: 0%; } to { width: 100%; } }
    .loading-text { font-family: 'Space Mono'; font-size: 11px; letter-spacing: 3px; color: var(--muted); margin-top: 14px; }

    /* ── Cart drawer ── */
    .cart-drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 95vw;
      background: var(--grey); z-index: 200; transform: translateX(100%);
      transition: transform .35s cubic-bezier(.4,0,.2,1);
      border-left: 1px solid rgba(232,35,42,.2);
      display: flex; flex-direction: column;
      overflow: hidden;
    }
    .cart-drawer.open { transform: translateX(0); }
    .cart-drawer-backdrop {
      position: fixed; inset: 0; z-index: 199; background: rgba(0,0,0,.6);
      opacity: 0; pointer-events: none; transition: opacity .35s;
    }
    .cart-drawer-backdrop.open { opacity: 1; pointer-events: all; }
    .cart-header {
      padding: 24px; border-bottom: 1px solid rgba(255,255,255,.06);
      display: flex; align-items: center; justify-content: space-between;
    }
    .cart-header h3 { font-family: 'Bebas Neue'; font-size: 24px; letter-spacing: 2px; }
    .cart-close { background: none; border: none; color: var(--muted); font-size: 24px; cursor: pointer; transition: color .15s; }
    .cart-close:hover { color: var(--white); }
    .cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
    .cart-item {
      display: flex; gap: 12px; padding: 16px 0;
      border-bottom: 1px solid rgba(255,255,255,.06);
      align-items: center;
    }
    .cart-item-emoji { font-size: 36px; width: 60px; height: 60px; background: var(--black); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .cart-item-info { flex: 1; }
    .cart-item-name { font-family: 'Bebas Neue'; font-size: 18px; letter-spacing: 1px; }
    .cart-item-sub { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .cart-item-price { font-family: 'Bebas Neue'; font-size: 20px; color: var(--gold); }
    .cart-item-remove { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; transition: color .15s; }
    .cart-item-remove:hover { color: var(--red); }
    .cart-empty { text-align: center; padding: 60px 0; color: var(--muted); }
    .cart-empty .icon { font-size: 48px; margin-bottom: 16px; }
    .cart-footer { padding: 20px 24px; border-top: 1px solid rgba(255,255,255,.06); }
    .cart-total { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
    .cart-total span { font-family: 'Space Mono'; font-size: 11px; letter-spacing: 2px; color: var(--muted); text-transform: uppercase; }
    .cart-total strong { font-family: 'Bebas Neue'; font-size: 32px; color: var(--gold); }
    .cart-badge {
      position: absolute; top: -6px; right: -6px; width: 18px; height: 18px;
      background: var(--red); border-radius: 50%; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center; color: #fff;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      nav { padding: 16px 24px; }
      nav.scrolled { padding: 12px 24px; }
      .nav-links, .nav-cta { display: none; }
      .hamburger { display: flex; }
      section { padding: 72px 24px; }
      .features-inner { grid-template-columns: 1fr; gap: 40px; }
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(3, 180px); }
      .gallery-cell:first-child { grid-column: span 2; grid-row: span 1; }
    }
    @media (max-width: 600px) {
      .footer-grid { grid-template-columns: 1fr; }
      .gallery-grid { grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 140px); }
      .hero-bike-wrap { bottom: -10px; }
    }

    /* ── Mobile nav menu ── */
    .mobile-menu {
      position: fixed; inset: 0; background: var(--black); z-index: 99;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 32px;
      transform: translateX(-100%); transition: transform .35s;
    }
    .mobile-menu.open { transform: translateX(0); }
    .mobile-menu a {
      font-family: 'Bebas Neue'; font-size: 40px; letter-spacing: 2px; color: var(--white); text-decoration: none;
      transition: color .15s;
    }
    .mobile-menu a:hover { color: var(--red); }
    .mobile-menu-close {
      position: absolute; top: 24px; right: 24px; background: none; border: none;
      color: var(--white); font-size: 32px; cursor: pointer;
    }

    /* ── Tabs ── */
    .tab-bar { display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,.08); margin-bottom: 36px; overflow-x: auto; }
    .tab-btn {
      background: none; border: none; color: var(--muted); cursor: pointer;
      font-family: 'Rajdhani'; font-weight: 600; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;
      padding: 12px 24px; border-bottom: 2px solid transparent; transition: color .2s, border-color .2s;
      white-space: nowrap;
    }
    .tab-btn.active { color: var(--white); border-bottom-color: var(--red); }
    .tab-btn:hover { color: var(--white); }

    /* ── Comparison table ── */
    #compare { background: var(--grey); }
    .compare-table { width: 100%; border-collapse: collapse; margin-top: 24px; }
    .compare-table th {
      font-family: 'Bebas Neue'; font-size: 18px; letter-spacing: 1px;
      text-align: left; padding: 16px; border-bottom: 2px solid var(--red);
      background: var(--black);
    }
    .compare-table td { padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,.05); font-size: 14px; color: var(--muted); }
    .compare-table td:first-child { color: var(--white); font-weight: 600; letter-spacing: .5px; }
    .compare-table tr:hover td { background: rgba(232,35,42,.03); }
    .check { color: #4caf50; }
    .cross { color: var(--red2); }

    /* ── Scroll indicator ── */
    .scroll-progress {
      position: fixed; top: 0; left: 0; height: 3px;
      background: linear-gradient(90deg, var(--red), var(--gold));
      z-index: 101; transition: width .1s linear;
    }
  `}</style>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const MODELS = [
  { id: 1, name: "Phantom R1",  badge: "Bestseller", price: "$18,499", emoji: "🏍️", specs: ["180hp","198km/h","267kg","ABS"], color: "#1a0608", desc: "Raw street aggression meets track precision." },
  { id: 2, name: "Venom S9",   badge: "New 2025",   price: "$24,999", emoji: "🏍️", specs: ["210hp","220km/h","248kg","TC"], color: "#0a1a0a", desc: "The apex predator of the open road." },
  { id: 3, name: "Nomad X3",   badge: "Adventure",  price: "$16,299", emoji: "🛵", specs: ["120hp","170km/h","228kg","IMU"], color: "#0a0e1a", desc: "Conquer every terrain with confidence." },
];

const FEATURES = [
  { icon: "⚡", title: "900cc Turbocharged",   desc: "Triple-cylinder engine delivering 210 horsepower with instant throttle response and adaptive mapping." },
  { icon: "🎯", title: "Cornering ABS + TC",    desc: "6-axis IMU linked to Bosch ABS and traction control for confidence-inspiring performance at lean angles." },
  { icon: "📱", title: "Connected Dashboard",   desc: "7\" TFT display with smartphone integration, turn-by-turn navigation, and real-time performance telemetry." },
  { icon: "🛡️", title: "Carbon Fibre Frame",   desc: "Aerospace-grade carbon composite chassis saving 18 kg versus alloy while increasing torsional rigidity 40%." },
  { icon: "🌙", title: "Adaptive LED Matrix",   desc: "Cornering headlights that pivot 22° with four independent LED cells for unparalleled night visibility." },
  { icon: "🔧", title: "Quick-Shift System",    desc: "Seamless clutchless up- and down-shifts with auto-blipper for lightning-fast gear changes on track or road." },
];

const REVIEWS = [
  { name: "Marcus J.",   role: "Track Racer",    stars: 5, text: "The Venom S9 completely transformed how I attack corners. Nothing in its class comes close to this level of precision and feedback." },
  { name: "Priya R.",    role: "Touring Rider",  stars: 5, text: "Did 4,200 km in 5 days on the Nomad X3. Comfort is extraordinary and the connected dash kept me safe and stress-free the whole way." },
  { name: "Carlos M.",   role: "Commuter",       stars: 4, text: "Phantom R1 turns a mundane commute into the best part of my day. Build quality is exceptional and the sound is absolutely addictive." },
  { name: "Sophie K.",   role: "Stunt Rider",    stars: 5, text: "I've ridden over 50 different machines and VeloceBikes set the bar. The throttle response and chassis balance are in a different league." },
];

const GALLERY_CELLS = ["🏍️","🛣️","⛽","🔧","🏔️","🌆","🌊","🔩"];

const DEALERS = [
  { name: "VeloceHQ Mumbai",  addr: "14-B Linking Road, Bandra West", phone: "+91 22 4010 7700" },
  { name: "VeloceHQ Delhi",   addr: "C-12, Connaught Place, New Delhi", phone: "+91 11 4102 8800" },
  { name: "VeloceHQ Bengaluru", addr: "80 Feet Rd, Indiranagar, Bengaluru", phone: "+91 80 4100 5500" },
  { name: "VeloceHQ Chennai", addr: "75 Anna Salai, Mount Road, Chennai", phone: "+91 44 4108 9900" },
];

const COLORS = [
  { hex: "#1a0608", name: "Phantom Black" },
  { hex: "#8b0000", name: "Blood Red"     },
  { hex: "#1a2240", name: "Midnight Blue" },
  { hex: "#1c1c1c", name: "Stealth Grey"  },
  { hex: "#c9a84c", name: "Gunmetal Gold" },
  { hex: "#fff",    name: "Arctic White"  },
];

const COMPARE_ROWS = [
  ["Engine",          "900cc 3-cyl", "600cc 2-cyl", "1000cc 4-cyl"],
  ["Power",           "210 hp",       "95 hp",        "190 hp"],
  ["Torque",          "120 Nm",       "68 Nm",        "115 Nm"],
  ["Top Speed",       "220 km/h",     "160 km/h",     "210 km/h"],
  ["Weight",          "248 kg",       "178 kg",       "295 kg"],
  ["ABS",             "✓",            "✓",            "✓"],
  ["Traction Control","✓",            "✗",            "✓"],
  ["IMU (6-axis)",    "✓",            "✗",            "✓"],
  ["TFT Display",     "✓",            "✗",            "✓"],
  ["Quickshifter",    "✓",            "✗",            "✓"],
  ["Warranty",        "3 Years",      "2 Years",      "2 Years"],
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const Counter = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(end / 60);
      const timer = setInterval(() => {
        start = Math.min(start + step, end);
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, 22);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return <span ref={ref}>{count}{suffix}</span>;
};

const StarRating = ({ stars }) => (
  <div className="review-stars" role="img" aria-label={`${stars} out of 5 stars`}>
    {[...Array(5)].map((_, i) => <span key={i}>{i < stars ? "★" : "☆"}</span>)}
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
let _setToasts;
const toast = (msg, type = "info") => {
  const id = Date.now();
  _setToasts(p => [...p, { id, msg, type }]);
  setTimeout(() => _setToasts(p => p.filter(t => t.id !== id)), 3800);
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;
  return (
    <div className="toast-container" role="region" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} role="alert">
          <span>{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
          {t.msg}
          <button className="toast-dismiss" onClick={() => setToasts(p => p.filter(x => x.id !== t.id))} aria-label="Dismiss">×</button>
        </div>
      ))}
    </div>
  );
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
const CartDrawer = ({ items, onRemove, onClose, isOpen }) => {
  const total = items.reduce((s, i) => s + parseFloat(i.price.replace(/[^0-9.]/g, "")), 0);
  return (
    <>
      <div className={`cart-drawer-backdrop ${isOpen ? "open" : ""}`} onClick={onClose} aria-hidden="true" />
      <div className={`cart-drawer ${isOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="cart-header">
          <h3>Your Garage</h3>
          <button className="cart-close" onClick={onClose} aria-label="Close cart">×</button>
        </div>
        <div className="cart-items">
          {items.length === 0
            ? <div className="cart-empty"><div className="icon">🏍️</div><p>Your garage is empty.</p><p style={{fontSize:12,marginTop:8,color:"var(--muted)"}}>Configure a bike to add it.</p></div>
            : items.map((item, idx) => (
              <div key={idx} className="cart-item">
                <div className="cart-item-emoji">{item.emoji}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-sub">{item.color} · {item.trim}</div>
                </div>
                <div className="cart-item-price">{item.price}</div>
                <button className="cart-item-remove" onClick={() => onRemove(idx)} aria-label={`Remove ${item.name}`}>×</button>
              </div>
            ))
          }
        </div>
        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <strong>${total.toLocaleString()}</strong>
            </div>
            <button className="btn-primary" style={{width:"100%",clipPath:"none"}} onClick={() => { toast("Checkout coming soon — stay tuned!", "info"); }}>
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Test Ride Modal ──────────────────────────────────────────────────────────
const TestRideModal = ({ onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", model: "", date: "", msg: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^\+?[\d\s\-()]{8,}$/.test(form.phone)) e.phone = "Valid phone required";
    if (!form.model) e.model = "Select a model";
    if (!form.date) e.date = "Select a date";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSent(true);
    toast("Test ride booked! We'll confirm within 24 hours.", "success");
    setTimeout(onClose, 2000);
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        {sent ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <div className="modal-title">Ride Booked!</div>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>We'll confirm your test ride within 24 hours.</p>
          </div>
        ) : (
          <>
            <div className="modal-title" id="modal-title">Book a Test Ride</div>
            <div className="modal-sub">Experience the power firsthand. Complete the form and our team will be in touch.</div>
            <div className="modal-form">
              <div className="modal-form-row">
                <div>
                  <label>Full Name</label>
                  <input placeholder="Alex Rider" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} aria-label="Full name" />
                  {errors.name && <div className="modal-err">{errors.name}</div>}
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" placeholder="alex@example.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} aria-label="Email address" />
                  {errors.email && <div className="modal-err">{errors.email}</div>}
                </div>
              </div>
              <div className="modal-form-row">
                <div>
                  <label>Phone</label>
                  <input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} aria-label="Phone number" />
                  {errors.phone && <div className="modal-err">{errors.phone}</div>}
                </div>
                <div>
                  <label>Preferred Model</label>
                  <select value={form.model} onChange={e => setForm(p => ({...p, model: e.target.value}))} aria-label="Preferred model">
                    <option value="">Select model</option>
                    {MODELS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                  {errors.model && <div className="modal-err">{errors.model}</div>}
                </div>
              </div>
              <div>
                <label>Preferred Date</label>
                <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))} min={new Date().toISOString().split("T")[0]} aria-label="Preferred date" />
                {errors.date && <div className="modal-err">{errors.date}</div>}
              </div>
              <div>
                <label>Message (Optional)</label>
                <textarea rows="3" placeholder="Any specific requests or questions..." value={form.msg} onChange={e => setForm(p => ({...p, msg: e.target.value}))} aria-label="Message" />
              </div>
              <button className="btn-primary" style={{ clipPath: "none", width: "100%" }} onClick={handleSubmit}>
                Book Test Ride →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showTestRide, setShowTestRide] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [configState, setConfigState] = useState({ model: 0, color: 0, trim: "Sport" });
  const [newsletter, setNewsletter] = useState({ email: "", status: null });
  const [dealerSearch, setDealerSearch] = useState("");
  const [filteredDealers, setFilteredDealers] = useState(DEALERS);

  // Loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1800);
    return () => clearTimeout(t);
  }, []);

  // Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
      const prog = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      setScrollProgress(prog);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCart = () => {
    const m = MODELS[configState.model];
    const c = COLORS[configState.color];
    setCartItems(p => [...p, { name: m.name, emoji: m.emoji, price: m.price, color: c.name, trim: configState.trim }]);
    toast(`${m.name} added to your garage!`, "success");
    setCartOpen(true);
  };

  const searchDealers = () => {
    if (!dealerSearch.trim()) { setFilteredDealers(DEALERS); return; }
    const q = dealerSearch.toLowerCase();
    const res = DEALERS.filter(d => d.name.toLowerCase().includes(q) || d.addr.toLowerCase().includes(q));
    if (res.length === 0) toast("No dealers found for that location.", "error");
    setFilteredDealers(res.length ? res : DEALERS);
  };

  const subscribeNewsletter = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsletter.email)) {
      setNewsletter(p => ({ ...p, status: "error" }));
      return;
    }
    setNewsletter({ email: "", status: "success" });
    toast("You're on the VIP list! Welcome to the family.", "success");
  };

  const selectedModel = MODELS[configState.model];
  const configPrice = (() => {
    const base = parseFloat(selectedModel.price.replace(/[^0-9.]/g, ""));
    const trimAdd = configState.trim === "Sport" ? 0 : configState.trim === "Track" ? 2500 : 4200;
    return "$" + (base + trimAdd).toLocaleString();
  })();

  return (
    <>
      <GlobalStyle />

      {/* ── Loading ── */}
      <div className={`loading-screen ${loading ? "" : "hidden"}`} role="status" aria-live="polite">
        <div className="loading-logo">VELOCE<span>MOTO</span></div>
        <div className="loading-bar-track"><div className="loading-bar-fill" /></div>
        <div className="loading-text">Initialising performance…</div>
      </div>

      {/* ── Scroll progress ── */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className={scrolled ? "scrolled" : ""} role="navigation" aria-label="Main navigation">
        <a href="#hero" className="nav-logo" aria-label="VeloceMoto home">VELOCE<span>MOTO</span></a>
        <ul className="nav-links">
          {["Models","Features","Configure","Reviews","Dealers"].map(l => (
            <li key={l}><a href={`#${l.toLowerCase()}`}>{l}</a></li>
          ))}
        </ul>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            style={{ position: "relative", background: "none", border: "none", color: "var(--white)", cursor: "pointer", fontSize: 22, padding: 4 }}
            onClick={() => setCartOpen(true)}
            aria-label={`Open cart, ${cartItems.length} items`}
          >
            🛒
            {cartItems.length > 0 && <span className="cart-badge">{cartItems.length}</span>}
          </button>
          <button className="nav-cta" onClick={() => setShowTestRide(true)}>Book Test Ride</button>
          <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <button className="mobile-menu-close" onClick={() => setMobileOpen(false)} aria-label="Close menu">×</button>
        {["Models","Features","Configure","Reviews","Dealers"].map(l => (
          <a key={l} href={`#${l.toLowerCase()}`} onClick={() => setMobileOpen(false)}>{l}</a>
        ))}
        <button className="btn-primary" style={{ clipPath: "none" }} onClick={() => { setMobileOpen(false); setShowTestRide(true); }}>Book Test Ride</button>
      </div>

      {/* ── Cart ── */}
      <CartDrawer items={cartItems} onRemove={i => setCartItems(p => p.filter((_, idx) => idx !== i))} onClose={() => setCartOpen(false)} isOpen={cartOpen} />

      {/* ── Test Ride Modal ── */}
      {showTestRide && <TestRideModal onClose={() => setShowTestRide(false)} />}

      {/* ── Hero ── */}
      <section id="hero" aria-label="Hero">
        <div className="hero-grid-lines" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-eyebrow">2025 Collection</div>
          <h1 className="hero-title">Born to<br /><em>Dominate</em></h1>
          <p className="hero-sub">Machines forged for those who refuse to settle. Pure performance. Zero compromise.</p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => document.querySelector("#models").scrollIntoView({ behavior: "smooth" })}>Explore Models</button>
            <button className="btn-secondary" onClick={() => setShowTestRide(true)}>Test Ride →</button>
          </div>
        </div>
        <div className="hero-bike-wrap" aria-hidden="true" style={{ fontSize: "clamp(160px, 30vw, 340px)", textAlign: "center" }}>
          🏍️
        </div>
      </section>

      {/* ── Stats ── */}
      <div className="stats-bar" role="region" aria-label="Key statistics">
        {[
          { num: 210, suffix: "hp",  label: "Peak Power"     },
          { num: 220, suffix: "k/h", label: "Top Speed"      },
          { num: 12,  suffix: "k+",  label: "Riders Globally"},
          { num: 3,   suffix: " yr", label: "Warranty"       },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div className="stat-num"><Counter end={s.num} suffix={s.suffix} /></div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Models ── */}
      <section id="models" aria-label="Bike models">
        <div className="models-header">
          <div className="section-tag">Lineup</div>
          <h2 className="section-title">Choose Your Machine</h2>
          <p className="section-sub">Three distinct characters. One uncompromising standard of excellence.</p>
        </div>
        <div className="models-grid">
          {MODELS.map(m => (
            <article key={m.id} className="model-card" tabIndex={0} onKeyDown={e => e.key === "Enter" && setShowTestRide(true)} aria-label={`${m.name} — ${m.price}`}>
              <div className="model-card-overlay" aria-hidden="true" />
              <div className="model-card-img" style={{ background: `radial-gradient(ellipse at 50% 60%, ${m.color}aa, var(--grey))` }} aria-hidden="true">
                {m.emoji}
              </div>
              <div className="model-card-body">
                <span className="model-card-badge">{m.badge}</span>
                <h3 className="model-card-name">{m.name}</h3>
                <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>{m.desc}</p>
                <div className="model-card-price">{m.price}</div>
                <div className="model-card-specs">
                  {m.specs.map(s => <span key={s} className="spec-chip">{s}</span>)}
                </div>
                <button className="btn-primary" style={{ marginTop: 20, clipPath: "none", width: "100%" }} onClick={() => setShowTestRide(true)}>
                  Book Test Ride
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" aria-label="Key features">
        <div className="features-inner">
          <div className="features-visual" aria-hidden="true">
            <div className="features-visual-bg">
              <div className="features-visual-inner">⚙️</div>
            </div>
          </div>
          <div>
            <div className="section-tag">Engineering</div>
            <h2 className="section-title">Built Different</h2>
            <p className="section-sub" style={{ marginBottom: 36 }}>Every component optimised for the rider who demands perfection. No compromises.</p>
            <ul className="feature-list">
              {FEATURES.map((f, i) => (
                <li key={i} className="feature-item">
                  <div className="feature-icon" aria-hidden="true">{f.icon}</div>
                  <div className="feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Configure ── */}
      <section id="configure" aria-label="Build and configure your bike">
        <div className="config-inner">
          <div className="section-tag">Configurator</div>
          <h2 className="section-title">Build Yours</h2>
          <p className="section-sub" style={{ marginBottom: 36 }}>Make it unmistakably yours. Every choice. Every detail.</p>

          <div className="config-preview" style={{ background: `radial-gradient(ellipse at 50% 60%, ${COLORS[configState.color].hex}33, var(--grey))` }} aria-label="Bike preview">
            <div className="config-overlay-line" aria-hidden="true" />
            <span style={{ fontSize: "clamp(100px,18vw,200px)", position: "relative", zIndex: 1, filter: "drop-shadow(0 30px 60px rgba(0,0,0,.6))" }} aria-hidden="true">🏍️</span>
          </div>

          <div className="config-controls">
            <div className="config-group">
              <label htmlFor="model-select">Model</label>
              <select id="model-select" className="config-select" value={configState.model} onChange={e => setConfigState(p => ({...p, model: +e.target.value}))}>
                {MODELS.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
              </select>
            </div>
            <div className="config-group">
              <label htmlFor="trim-select">Trim Level</label>
              <select id="trim-select" className="config-select" value={configState.trim} onChange={e => setConfigState(p => ({...p, trim: e.target.value}))}>
                <option value="Sport">Sport</option>
                <option value="Track">Track (+$2,500)</option>
                <option value="Titanium">Titanium Edition (+$4,200)</option>
              </select>
            </div>
            <div className="config-group">
              <label>Colour</label>
              <div className="color-picker" role="radiogroup" aria-label="Choose colour">
                {COLORS.map((c, i) => (
                  <button
                    key={i}
                    className={`color-swatch ${configState.color === i ? "active" : ""}`}
                    style={{ background: c.hex, border: c.hex === "#fff" ? "1px solid #555" : undefined }}
                    onClick={() => setConfigState(p => ({...p, color: i}))}
                    aria-label={c.name}
                    aria-pressed={configState.color === i}
                    role="radio"
                    aria-checked={configState.color === i}
                  />
                ))}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", letterSpacing: 1 }}>{COLORS[configState.color].name}</div>
            </div>
          </div>

          <div className="config-price" aria-label={`Configured price: ${configPrice}`}>{configPrice} <span>Starting from</span></div>
          <div className="config-actions">
            <button className="btn-primary" onClick={addToCart}>Add to Garage →</button>
            <button className="btn-secondary" onClick={() => setShowTestRide(true)}>Book Test Ride</button>
          </div>
        </div>
      </section>

      {/* ── Compare ── */}
      <section id="compare" aria-label="Model comparison">
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="section-tag">Side by Side</div>
          <h2 className="section-title">Compare Models</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="compare-table" aria-label="Comparison table">
              <thead>
                <tr>
                  <th scope="col">Spec</th>
                  {MODELS.map(m => <th key={m.id} scope="col">{m.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map(([spec, ...vals], i) => (
                  <tr key={i}>
                    <td>{spec}</td>
                    {vals.map((v, j) => (
                      <td key={j} className={v === "✓" ? "check" : v === "✗" ? "cross" : ""}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" aria-label="Customer reviews">
        <div className="reviews-header">
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">Riders Don't Lie</h2>
          <p className="section-sub">Real stories from real machines.</p>
        </div>
        <div className="reviews-track">
          {REVIEWS.map((r, i) => (
            <article key={i} className="review-card">
              <StarRating stars={r.stars} />
              <p className="review-text">"{r.text}"</p>
              <div className="review-author">{r.name}</div>
              <div className="review-meta">{r.role}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" aria-label="Photo gallery">
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="section-tag">Gallery</div>
          <h2 className="section-title">In the Wild</h2>
        </div>
        <div className="gallery-grid" role="list">
          {GALLERY_CELLS.map((emoji, i) => (
            <div key={i} className="gallery-cell" role="listitem" tabIndex={0} onClick={() => toast("Full gallery coming soon!", "info")} onKeyDown={e => e.key === "Enter" && toast("Full gallery coming soon!", "info")} aria-label={`Gallery image ${i+1}`}>
              <span aria-hidden="true">{emoji}</span>
              <div className="gallery-cell-overlay" aria-hidden="true"><span className="gallery-cell-overlay-icon">🔍</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section id="cta-band" aria-label="Call to action">
        <div className="cta-band-title">Ready to Ride?</div>
        <p className="cta-band-sub">Book a test ride at your nearest VeloceMoto showroom. No obligation. Pure thrill.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => setShowTestRide(true)}>Book Test Ride</button>
          <button className="btn-secondary" onClick={() => document.querySelector("#configure").scrollIntoView({ behavior: "smooth" })}>Configure Yours</button>
        </div>
      </section>

      {/* ── Dealers ── */}
      <section id="dealers" aria-label="Dealer locator">
        <div className="dealers-inner">
          <div className="section-tag">Find Us</div>
          <h2 className="section-title">Dealer Locator</h2>
          <p className="section-sub" style={{ marginBottom: 36 }}>Visit a showroom to experience VeloceMoto in person.</p>
          <div className="dealer-search-bar" role="search">
            <input
              className="dealer-search-input"
              placeholder="Search by city or area…"
              value={dealerSearch}
              onChange={e => setDealerSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchDealers()}
              aria-label="Search dealers"
            />
            <button className="dealer-search-btn" onClick={searchDealers}>Search</button>
          </div>
          <div className="dealers-grid">
            {filteredDealers.map((d, i) => (
              <address key={i} className="dealer-card" style={{ fontStyle: "normal" }}>
                <h4>{d.name}</h4>
                <p>{d.addr}</p>
                <p style={{ marginTop: 4 }}>{d.phone}</p>
                <a href="#dealers" className="dealer-card-link" onClick={e => { e.preventDefault(); toast(`Directions to ${d.name} — map integration coming soon!`, "info"); }}>
                  Get Directions →
                </a>
              </address>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section id="newsletter" aria-label="Newsletter signup">
        <div className="newsletter-inner">
          <div className="section-tag">Stay Connected</div>
          <h2 className="section-title">Join the Pack</h2>
          <p className="section-sub">Exclusive launches, riding events, and insider news. Direct to your inbox.</p>
          <div className="newsletter-form" role="form" aria-label="Newsletter sign up">
            <input
              className="newsletter-input"
              type="email"
              placeholder="your@email.com"
              value={newsletter.email}
              onChange={e => setNewsletter(p => ({...p, email: e.target.value, status: null}))}
              onKeyDown={e => e.key === "Enter" && subscribeNewsletter()}
              aria-label="Email address for newsletter"
            />
            <button className="newsletter-btn" onClick={subscribeNewsletter}>Subscribe</button>
          </div>
          {newsletter.status === "success" && <p className="newsletter-success" role="alert">✅ You're in! Welcome to the family.</p>}
          {newsletter.status === "error"   && <p className="newsletter-error"   role="alert">❌ Please enter a valid email address.</p>}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer role="contentinfo">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#hero" className="nav-logo" style={{ fontSize: 24 }}>VELOCE<span>MOTO</span></a>
            <p>Engineering adrenaline since 2009. We build machines for those who chase the horizon and never look back.</p>
          </div>
          {[
            { heading: "Models",   links: ["Phantom R1","Venom S9","Nomad X3","Heritage Classic","E-Thrust EV"] },
            { heading: "Company",  links: ["About Us","Careers","Press","Sustainability","Investors"] },
            { heading: "Support",  links: ["Book Service","Spare Parts","Owner's Portal","Warranty","Contact Us"] },
          ].map(col => (
            <div key={col.heading} className="footer-col">
              <h5>{col.heading}</h5>
              <ul>{col.links.map(l => <li key={l}><a href="#" onClick={e => { e.preventDefault(); toast(`${l} — page coming soon`, "info"); }}>{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© 2025 VeloceMoto. All rights reserved.</p>
          <div style={{ display: "flex", gap: 20 }}>
            <a href="#" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }} onClick={e => e.preventDefault()}>Privacy Policy</a>
            <a href="#" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }} onClick={e => e.preventDefault()}>Terms of Use</a>
            <a href="#" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none" }} onClick={e => e.preventDefault()}>Cookie Settings</a>
          </div>
          <div className="footer-socials" aria-label="Social media links">
            {["𝕏","📸","▶️","🎵"].map((s, i) => (
              <button key={i} className="footer-social-btn" onClick={() => toast("Social links coming soon!", "info")} aria-label={["Twitter/X","Instagram","YouTube","TikTok"][i]}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </footer>

      {/* ── Toasts ── */}
      <ToastContainer />
    </>
  );
}
