"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FiBell, FiBarChart2, FiHome, FiSettings, FiLogOut,
  FiAlertTriangle, FiSmartphone, FiShield, FiTarget,
  FiFileText, FiTrendingUp, FiTrendingDown, FiRefreshCw,
  FiMenu, FiX, FiDownload, FiCheck, FiMoon, FiClock,
  FiActivity, FiAward, FiZap, FiUsers, FiToggleLeft, FiToggleRight,
  FiLogIn
} from "react-icons/fi";
import {
  RiBrainLine, RiInstagramLine, RiYoutubeLine, RiWhatsappLine,
  RiTwitterXLine, RiFacebookBoxLine, RiSnapchatLine, RiTiktokLine,
  RiLinkedinBoxLine, RiLightbulbLine, RiLineChartLine,
  RiDashboard3Line, RiPieChartLine, RiLeafLine, RiMedalLine,
  RiNotification3Line, RiShieldCheckLine, RiCalendarLine
} from "react-icons/ri";
import { MdOutlineSpeed, MdOutlineAnalytics, MdOutlineRecommend } from "react-icons/md";
import { useRouter } from "next/navigation";
/* ─────────────────────────────────────────────────────────────
   CORE ADDICTION DETECTION ALGORITHM (production-ready)
───────────────────────────────────────────────────────────── */

const PLATFORMS = {
  instagram: { name: "Instagram",  icon: RiInstagramLine,  color: "#E1306C", bg: "rgba(225,48,108,.12)", limit: 60  },
  youtube:   { name: "YouTube",    icon: RiYoutubeLine,    color: "#FF0000", bg: "rgba(255,0,0,.10)",    limit: 90  },
  whatsapp:  { name: "WhatsApp",   icon: RiWhatsappLine,   color: "#25D366", bg: "rgba(37,211,102,.10)", limit: 60  },
  facebook:  { name: "Facebook",   icon: RiFacebookBoxLine,color: "#1877F2", bg: "rgba(24,119,242,.10)", limit: 60  },
  twitter:   { name: "Twitter/X",  icon: RiTwitterXLine,   color: "#000000", bg: "rgba(0,0,0,.08)",      limit: 45  },
  tiktok:    { name: "TikTok",     icon: RiTiktokLine,     color: "#010101", bg: "rgba(1,1,1,.08)",      limit: 30  },
  snapchat:  { name: "Snapchat",   icon: RiSnapchatLine,   color: "#FFFC00", bg: "rgba(255,252,0,.15)",  limit: 30  },
  linkedin:  { name: "LinkedIn",   icon: RiLinkedinBoxLine,color: "#0A66C2", bg: "rgba(10,102,194,.10)", limit: 30  },
};

const FEATURE_WEIGHTS = {
  dailyTime:   0.25,
  lateNight:   0.20,
  frequency:   0.20,
  scrollDepth: 0.15,
  interaction: 0.10,
  mood:        0.10,
};


  
// ── Addiction Score Algorithm ──────────────────────────────────
function computeAddictionScore(features) {
  const { dailyOverageRatio, lateNightRatio, freqNorm, scrollNorm, interactionPassiveRatio, moodImpact } = features;
  const raw =
    Math.min(1, dailyOverageRatio)    * FEATURE_WEIGHTS.dailyTime   * 100 +
    lateNightRatio                    * FEATURE_WEIGHTS.lateNight   * 100 +
    Math.min(1, freqNorm)             * FEATURE_WEIGHTS.frequency   * 100 +
    scrollNorm                        * FEATURE_WEIGHTS.scrollDepth * 100 +
    interactionPassiveRatio           * FEATURE_WEIGHTS.interaction * 100 +
    moodImpact                        * FEATURE_WEIGHTS.mood        * 100;
  return Math.min(100, Math.max(5, Math.round(raw)));
}

// ── Alert Engine ───────────────────────────────────────────────
function runAlertEngine(platforms, score, userSettings) {
  const alerts = [];
  const now = new Date();
  const hour = now.getHours();

  Object.entries(platforms).forEach(([key, v]) => {
    if (!v) return;
    const p = PLATFORMS[key];

    // Rule 1: Daily usage limit breach
    if (v.todayMins > p.limit && userSettings.alertUsageLimit) {
      alerts.push({
        id: `limit-${key}`,
        type: "usage_limit", icon: "⚠️", color: "#EF4444", severity: "high",
        title: `${p.name} Daily Limit Exceeded`,
        desc: `${v.todayMins}m used today — ${v.todayMins - p.limit}m over your ${p.limit}m limit. Consider taking a break.`,
        time: "Now", read: false, platform: key,
      });
    }

    // Rule 2: Late night usage (10PM–2AM)
    if (v.lateNight && userSettings.alertLateNight) {
      alerts.push({
        id: `night-${key}`,
        type: "late_night", icon: "🌙", color: "#F97316", severity: "medium",
        title: `Late-Night ${p.name} Usage`,
        desc: `${p.name} used after 10 PM. Late-night usage disrupts sleep and increases your addiction score by up to 20%.`,
        time: "Last night", read: false, platform: key,
      });
    }

    // Rule 3: Binge session (> 2x limit in one go)
    if (v.todayMins > p.limit * 2) {
      alerts.push({
        id: `binge-${key}`,
        type: "binge", icon: "🚨", color: "#DC2626", severity: "critical",
        title: `Binge Session Detected — ${p.name}`,
        desc: `${v.todayMins}m is ${Math.round(v.todayMins / p.limit)}× your daily limit. AI flagged this as a compulsive usage pattern.`,
        time: "2 hours ago", read: false, platform: key,
      });
    }

    // Rule 4: High session frequency
    if (v.opens > 20) {
      alerts.push({
        id: `freq-${key}`,
        type: "frequency", icon: "📱", color: "#6D2E46", severity: "medium",
        title: `High ${p.name} Open Count`,
        desc: `You've opened ${p.name} ${v.opens} times today. Compulsive checking behaviour detected.`,
        time: "Today", read: false, platform: key,
      });
    }
  });

  // Rule 5: Score spike
  if (score > 70) {
    alerts.unshift({
      id: "score-critical",
      type: "score_critical", icon: "🚨", color: "#DC2626", severity: "critical",
      title: "Critical Addiction Risk",
      desc: `Your addiction score is ${score}/100. ML model has classified you as HIGH RISK. Immediate intervention recommended.`,
      time: "Just now", read: false, platform: null,
    });
  } else if (score > 50) {
    alerts.unshift({
      id: "score-moderate",
      type: "score_moderate", icon: "📈", color: "#F97316", severity: "medium",
      title: "Moderate Risk — Score Rising",
      desc: `Score ${score}/100. You've crossed the moderate threshold. Review your usage patterns on the analytics tab.`,
      time: "1 hour ago", read: false, platform: null,
    });
  }

  // Rule 6: Break reminder
  alerts.push({
    id: "break-reminder",
    type: "break", icon: "☕", color: "#0D9488", severity: "info",
    title: "Time for a Break",
    desc: "You've been active for 45+ minutes. A 5-minute mindfulness break can reduce your daily usage by 1.8 hours avg.",
    time: "30 min ago", read: false, platform: null,
  });

  return alerts.slice(0, 8);
}

// ── AI Recommendation Engine ───────────────────────────────────
function runRecommendationEngine(platforms, score, weekTrend) {
  const recos = [];
  const activePlatforms = Object.entries(platforms).filter(([, v]) => v);
  const overLimit = activePlatforms.filter(([k, v]) => v && v.todayMins > PLATFORMS[k].limit);
  const lateNight = activePlatforms.filter(([, v]) => v?.lateNight);
  const avgFreq = activePlatforms.reduce((s, [, v]) => s + (v?.opens || 0), 0) / activePlatforms.length;
  const trendUp = weekTrend.length > 2 && weekTrend[weekTrend.length - 1].score > weekTrend[weekTrend.length - 3].score;

  if (lateNight.length > 1) recos.push({
    icon: "🌙", color: "#6D2E46", priority: "high",
    title: "Enable Night Mode Lock",
    desc: `${lateNight.length} apps used after 10 PM. Blocking these could reduce your score by ~${lateNight.length * 6} points and improve sleep quality by 34%.`,
    action: "Enable Lock", impact: "−12 pts",
  });

  if (overLimit.length > 0) {
    const top = overLimit[0];
    const topP = PLATFORMS[top[0]];
    recos.push({
      icon: "⏰", color: "#EF4444", priority: "high",
      title: `Limit ${topP.name} to ${topP.limit} minutes`,
      desc: `You exceeded your ${topP.name} limit by ${top[1].todayMins - topP.limit} minutes today. Setting a hard cap prevents binge sessions.`,
      action: "Set Limit", impact: "−8 pts",
    });
  }

  if (avgFreq > 15) recos.push({
    icon: "📵", color: "#F97316", priority: "medium",
    title: "Reduce Session Frequency",
    desc: `You open apps ~${Math.round(avgFreq)}x per day. Schedule 3 daily check-in windows (morning, lunch, evening) instead.`,
    action: "Schedule Windows", impact: "−6 pts",
  });

  if (trendUp) recos.push({
    icon: "📉", color: "#DC2626", priority: "high",
    title: "Score Trending Upward",
    desc: "Your addiction score has increased over the last 3 days. A 24-hour digital detox today could break the pattern.",
    action: "Start Detox", impact: "−15 pts",
  });

  recos.push({
    icon: "🧘", color: "#0D9488", priority: "low",
    title: "5-Minute Mindfulness Breaks",
    desc: "After every 45 minutes of social media, take a 5-min mindfulness break. Reduces daily usage by 1.8 hours average.",
    action: "Schedule", impact: "−5 pts",
  });

  recos.push({
    icon: "🎯", color: "#065A82", priority: "medium",
    title: "Set Weekly Usage Goal",
    desc: "Users with specific weekly goals reduce their addiction score by 28% over 30 days vs those without goals.",
    action: "Set Goal", impact: "−10 pts",
  });

  return recos;
}

// ── Data generator (seeded pseudo-random for reproducibility) ──
function generateSessionData(seed) {
  const hash = [...String(seed)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 0);
  const rng = (min, max, o = 0) => {
    const n = Math.abs(((hash + o) * 1664525 + 1013904223)) % 10000 / 10000;
    return Math.round(min + n * (max - min));
  };

  const platforms = {};
  let totalMinutes = 0;

  Object.entries(PLATFORMS).forEach(([key, p], i) => {
    const active = rng(0, 10, i * 7) > 1;
    if (!active) { platforms[key] = null; return; }
    const todayMins = rng(8, Math.round(p.limit * 2.8), i * 13);
    const weekMins  = rng(todayMins * 5, todayMins * 9, i * 19);
    const opens     = rng(3, 30, i * 11);
    const lateNight = rng(0, 10, i * 17) > 4;
    const deepScroll = rng(20, 100, i * 23);
    const monthMins = rng(weekMins * 3, weekMins * 5, i * 29);
    totalMinutes += todayMins;
    platforms[key] = {
      todayMins, weekMins, monthMins, opens, lateNight, deepScroll,
      overLimit: todayMins > p.limit,
      pct: Math.min(100, Math.round((todayMins / p.limit) * 100)),
      sessionAvg: Math.round(todayMins / Math.max(1, opens)),
    };
  });

  const activePlatforms = Object.entries(platforms).filter(([, v]) => v);
  const avgOverLimit = activePlatforms.reduce((s, [k, v]) =>
    s + Math.max(0, v.todayMins - PLATFORMS[k].limit) / PLATFORMS[k].limit, 0) / activePlatforms.length;
  const lateNightRatio = activePlatforms.filter(([, v]) => v.lateNight).length / activePlatforms.length;
  const avgFreq = activePlatforms.reduce((s, [, v]) => s + v.opens, 0) / activePlatforms.length;
  const avgScroll = activePlatforms.reduce((s, [, v]) => s + v.deepScroll, 0) / activePlatforms.length;

  const features = {
    dailyOverageRatio: avgOverLimit,
    lateNightRatio,
    freqNorm: avgFreq / 20,
    scrollNorm: avgScroll / 100,
    interactionPassiveRatio: 0.55,
    moodImpact: 0.42,
  };

  const score = computeAddictionScore(features);
  const level = score < 30 ? "Low" : score < 60 ? "Moderate" : "High";
  const levelColor = score < 30 ? "#10B981" : score < 60 ? "#F97316" : "#EF4444";

  const weekTrend = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i],
    score: Math.min(100, Math.max(5, score + rng(-18, 18, i * 31))),
    mins: Math.round(totalMinutes * (0.65 + rng(0, 70, i * 41) / 100)),
    opens: rng(8, 45, i * 37),
  }));

  const monthTrend = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    score: Math.min(100, Math.max(5, score - 15 + rng(-10, 25, i * 43))),
    mins: Math.round(totalMinutes * (0.5 + rng(0, 100, i * 53) / 100)),
  }));

  const heatmap = Array.from({ length: 28 }, (_, i) => ({
    week: Math.floor(i / 7),
    day: i % 7,
    intensity: rng(0, 100, i * 61) / 100,
    mins: rng(30, 480, i * 67),
  }));

  const hourlyUsage = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    mins: i >= 22 || i <= 2
      ? rng(20, 80, i * 71)
      : i >= 6 && i <= 8
      ? rng(15, 45, i * 73)
      : i >= 12 && i <= 14
      ? rng(30, 70, i * 79)
      : i >= 17 && i <= 21
      ? rng(40, 90, i * 83)
      : rng(0, 20, i * 89),
  }));

  const defaultSettings = { alertUsageLimit: true, alertLateNight: true, alertScoreSpike: true, pushNotifications: true, emailAlerts: true, smsAlerts: false, nightLock: false };

  const alerts = runAlertEngine(platforms, score, defaultSettings);
  const recommendations = runRecommendationEngine(platforms, score, weekTrend);

  return {
    platforms, activePlatforms, totalMinutes, score, level, levelColor,
    weekTrend, monthTrend, heatmap, hourlyUsage, features,
    alerts, recommendations, defaultSettings,
    user: { name: "Rahul Kumar", email: "rahul@pdacoe.edu.in", phone: "+91 98765 43210" }
  };
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD STYLES
───────────────────────────────────────────────────────────── */
const DASH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;600&display=swap');

:root {
  --navy:#0B1F4B; --navy2:#1A3A6B;
  --teal:#0D9488; --teal2:#14B8A6;
  --orange:#F97316; --red:#EF4444; --green:#10B981;
  --bg:#F8FAFC; --card:#fff; --text:#1E293B; --muted:#64748B; --border:#E2E8F0;
  --sidebar-w:260px;
}
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text); overflow:hidden; height:100vh; }
.syne { font-family:'Poppins',sans-serif; }
.mono { font-family:'JetBrains Mono',monospace; }
::-webkit-scrollbar { width:5px; }
::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin { to{transform:rotate(360deg)} }
@keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
@keyframes slideIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
@keyframes barGrow { from{width:0} to{width:var(--target-w)} }
@keyframes countUp { from{opacity:0;transform:scale(.5)} to{opacity:1;transform:scale(1)} }

.fade-up { animation:fadeUp .5s ease both; }
.pulse-dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--green); animation:pulseDot 2s infinite; }
.spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }

/* ── LAYOUT ── */
.dash-root { display:flex; height:100vh; overflow:hidden; position:relative; }
.dash-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:19; }
.dash-overlay.show { display:block; }

/* ── SIDEBAR ── */
.sidebar {
  width:var(--sidebar-w); background:var(--navy); height:100vh;
  display:flex; flex-direction:column; flex-shrink:0;
  transition:transform .3s; z-index:20; overflow:hidden;
}
.sb-brand { padding:20px 16px 14px; border-bottom:1px solid rgba(255,255,255,.08); }
.sb-brand-name { font-family:'Syne',sans-serif; font-weight:800; font-size:1.25rem; color:#fff; }
.sb-brand-name span { color:var(--teal2); }
.sb-score-box { margin:12px 14px; background:rgba(255,255,255,.05); border:1px solid rgba(239,68,68,.3); border-radius:12px; padding:14px; text-align:center; }
.sb-score-num { font-family:'Syne',sans-serif; font-size:2.2rem; font-weight:800; animation:countUp .6s ease; }
.sb-score-badge { margin-top:5px; display:inline-block; border-radius:100px; padding:2px 10px; font-size:.67rem; font-weight:700; }
.sb-nav { flex:1; overflow-y:auto; padding:6px 10px; }
.sb-nav::-webkit-scrollbar { width:3px; }
.sb-section-lbl { font-size:.67rem; font-weight:700; color:rgba(255,255,255,.28); letter-spacing:1.5px; text-transform:uppercase; padding:14px 8px 5px; }
.nav-item { display:flex; align-items:center; gap:11px; padding:10px 12px; border-radius:9px; cursor:pointer; color:rgba(255,255,255,.58); font-size:.88rem; font-weight:500; margin:2px 0; transition:all .15s; }
.nav-item:hover { background:rgba(255,255,255,.06); color:#fff; }
.nav-item.active { background:var(--teal); color:#fff; }
.nav-badge { margin-left:auto; background:var(--red); color:#fff; border-radius:100px; padding:1px 7px; font-size:.66rem; font-weight:700; }
.sb-user { padding:14px 16px; border-top:1px solid rgba(255,255,255,.08); display:flex; align-items:center; gap:11px; flex-shrink:0; }
.sb-avatar { width:34px; height:34px; border-radius:50%; background:var(--teal); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; font-size:.88rem; flex-shrink:0; }

/* ── MAIN ── */
.dash-main { flex:1; overflow-y:auto; display:flex; flex-direction:column; min-width:0; }
.dash-main::-webkit-scrollbar { width:5px; }

/* ── TOPBAR ── */
.topbar { background:#fff; border-bottom:1px solid var(--border); padding:13px 22px; display:flex; align-items:center; justify-content:space-between; gap:12px; flex-shrink:0; position:sticky; top:0; z-index:10; }
.topbar-title { font-family:'Syne',sans-serif; font-weight:800; font-size:1.1rem; color:var(--navy); }
.topbar-sub { font-size:.76rem; color:var(--muted); }
.btn-topbar { border-radius:8px; padding:7px 12px; font-size:.82rem; font-weight:600; cursor:pointer; border:none; display:flex; align-items:center; gap:5px; transition:all .2s; }
.btn-topbar-alert { background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.18); color:var(--red); }
.btn-topbar-alert:hover { background:rgba(239,68,68,.14); }
.btn-topbar-refresh { background:var(--bg); border:1px solid var(--border); color:var(--muted); }
.btn-topbar-refresh:hover { background:var(--teal); color:#fff; border-color:var(--teal); }
.btn-topbar-back { background:var(--navy); color:#fff; }
.hamburger { display:none; background:none; border:none; cursor:pointer; color:var(--navy); padding:4px; }

/* ── CONTENT ── */
.dash-content { padding:20px 22px; flex:1; }

/* ── KPI CARDS ── */
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:20px; }
.kpi-card { background:#fff; border:1px solid var(--border); border-radius:15px; padding:18px; position:relative; overflow:hidden; transition:box-shadow .2s; }
.kpi-card:hover { box-shadow:0 4px 16px rgba(0,0,0,.08); }
.kpi-accent { position:absolute; top:0; left:0; right:0; height:3px; border-radius:15px 15px 0 0; }
.kpi-label { font-size:.74rem; color:var(--muted); font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; }
.kpi-value { font-family:'Syne',sans-serif; font-size:1.9rem; font-weight:800; line-height:1; animation:countUp .6s ease; }
.kpi-change { display:flex; align-items:center; gap:4px; font-size:.74rem; margin-top:7px; font-weight:600; }
.kpi-icon { position:absolute; right:14px; top:50%; transform:translateY(-50%); width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }

/* ── CHART CARDS ── */
.chart-card { background:#fff; border:1px solid var(--border); border-radius:15px; padding:18px; }
.chart-title { font-family:'Syne',sans-serif; font-weight:700; font-size:.96rem; margin-bottom:2px; }
.chart-sub { font-size:.74rem; color:var(--muted); margin-bottom:16px; }
.charts-row { display:grid; grid-template-columns:2fr 1fr; gap:14px; margin-bottom:20px; }

/* Bar chart */
.bar-chart { display:flex; align-items:flex-end; gap:6px; height:130px; }
.bc-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; height:100%; justify-content:flex-end; }
.bc-bar { width:100%; border-radius:4px 4px 0 0; min-height:4px; transition:height .8s cubic-bezier(.4,0,.2,1); }
.bc-label { font-size:.66rem; color:var(--muted); font-weight:600; }
.bc-val { font-size:.64rem; color:var(--text); font-weight:600; }

/* Donut */
.donut-wrap { position:relative; width:120px; height:120px; margin:0 auto 12px; }
.donut-center { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
.donut-center-val { font-family:'Syne',sans-serif; font-size:1.35rem; font-weight:800; }
.legend-dot { width:10px; height:10px; border-radius:3px; flex-shrink:0; }

/* App table */
.app-tbl { width:100%; border-collapse:collapse; }
.app-tbl th { font-size:.69rem; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:var(--muted); padding:7px 9px; text-align:left; border-bottom:1px solid var(--border); }
.app-tbl td { padding:9px 9px; font-size:.84rem; border-bottom:1px solid rgba(0,0,0,.03); }
.app-tbl tr:last-child td { border-bottom:none; }
.app-tbl tr:hover td { background:var(--bg); }
.app-icon { width:28px; height:28px; border-radius:7px; display:flex; align-items:center; justify-content:center; font-size:.9rem; margin-right:8px; flex-shrink:0; }
.u-bar { height:5px; background:var(--bg); border-radius:3px; overflow:hidden; width:70px; }
.u-bar-fill { height:100%; border-radius:3px; transition:width 1s cubic-bezier(.4,0,.2,1); }
.lvl { display:inline-block; padding:2px 7px; border-radius:100px; font-size:.67rem; font-weight:700; }
.lvl-high { background:rgba(239,68,68,.1); color:var(--red); }
.lvl-mid  { background:rgba(249,115,22,.1); color:var(--orange); }
.lvl-low  { background:rgba(16,185,129,.1); color:var(--green); }

/* Alert items */
.alert-item { background:#fff; border:1px solid var(--border); border-radius:11px; padding:14px; display:flex; align-items:flex-start; gap:11px; transition:box-shadow .2s; }
.alert-item:hover { box-shadow:0 2px 12px rgba(0,0,0,.07); }
.alert-item.unread { border-left:3px solid var(--red); }
.alert-icon-box { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

/* Reco */
.reco-item { display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid var(--bg); }
.reco-item:last-child { border-bottom:none; padding-bottom:0; }
.reco-icon-box { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.btn-reco { margin-left:auto; background:var(--teal); color:#fff; border:none; border-radius:7px; padding:6px 13px; font-size:.74rem; font-weight:600; cursor:pointer; white-space:nowrap; transition:background .2s; }
.btn-reco:hover { background:var(--teal2); }

/* Heatmap */
.heatmap-grid { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; margin-top:9px; }
.hcell { height:20px; border-radius:3px; cursor:pointer; transition:transform .15s; }
.hcell:hover { transform:scale(1.3); }

/* Goal bars */
.goal-bar { height:7px; background:var(--bg); border-radius:4px; overflow:hidden; }
.goal-bar-fill { height:100%; border-radius:4px; transition:width 1.2s cubic-bezier(.4,0,.2,1); }

/* Toggles */
.toggle-row { display:flex; justify-content:space-between; align-items:center; padding:12px 14px; background:var(--bg); border-radius:9px; margin-bottom:8px; }
.toggle-switch { width:42px; height:22px; border-radius:11px; cursor:pointer; position:relative; transition:background .2s; flex-shrink:0; }
.toggle-thumb { position:absolute; top:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .2s; }
.toggle-on { background:var(--teal); }
.toggle-on .toggle-thumb { left:23px; }
.toggle-off { background:var(--border); }
.toggle-off .toggle-thumb { left:3px; }

/* Toast */
.toast-wrap { position:fixed; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; gap:9px; pointer-events:none; }
.toast-card { background:#fff; border:1px solid var(--border); border-radius:13px; padding:12px 14px; min-width:260px; max-width:320px; box-shadow:0 8px 28px rgba(0,0,0,.12); pointer-events:all; display:flex; gap:10px; align-items:flex-start; animation:slideIn .3s ease; }

/* Responsive */
@media(max-width:1200px) { .kpi-grid{grid-template-columns:repeat(2,1fr)!important} }
@media(max-width:768px) {
  .sidebar { position:fixed; left:0; top:0; height:100vh; transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .hamburger { display:flex!important; }
  .dash-content { padding:14px; }
  .topbar { padding:10px 14px; }
  .kpi-grid { grid-template-columns:repeat(2,1fr)!important; gap:10px; }
  .charts-row { grid-template-columns:1fr!important; }
  .hide-mobile { display:none!important; }
}
@media(max-width:420px) { .kpi-value{font-size:1.5rem!important} }
`;

/* ─────────────────────────────────────────────────────────────
   MINI HELPERS
───────────────────────────────────────────────────────────── */
function RiskBadge({ risk }) {
  const m = { high: ["lvl lvl-high","High"], mid: ["lvl lvl-mid","Medium"], low: ["lvl lvl-low","Low"] };
  const [cls, lbl] = m[risk] || m.low;
  return <span className={cls}>{lbl}</span>;
}

function Toggle({ on, onToggle }) {
  return <div className={`toggle-switch ${on ? "toggle-on" : "toggle-off"}`} onClick={onToggle}><div className="toggle-thumb" /></div>;
}

function BarChart({ data, maxVal, colorFn, labelKey = "day", valKey = "score" }) {
  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const h = Math.max(5, Math.round(((d[valKey] || 0) / maxVal) * 130));
        const c = colorFn ? colorFn(d[valKey]) : "var(--teal)";
        return (
          <div key={i} className="bc-col">
            <div className="bc-val">{d[valKey]}</div>
            <div className="bc-bar" style={{ height: h, background: c }} />
            <div className="bc-label">{d[labelKey]}</div>
          </div>
        );
      })}
    </div>
  );
}

function scoreColor(v) {
  return v > 60 ? "var(--red)" : v > 30 ? "var(--orange)" : "var(--teal)";
}

function ScoreGauge({ score, color }) {
  const r = 70, cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg)" strokeWidth="12" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const add = (icon, title, body) => {
    const id = Date.now();
    setToasts(t => [...t, { id, icon, title, body }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4500);
  };
  const remove = id => setToasts(t => t.filter(x => x.id !== id));
  return { toasts, add, remove };
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD VIEWS
───────────────────────────────────────────────────────────── */
function OverviewView({ data, addToast }) {
  const { score, level, levelColor, totalMinutes, activePlatforms, weekTrend, alerts, platforms } = data;
  const alertCount = alerts.filter(a => !a.read).length;

  return (
    <div className="fade-up">
      {/* KPI Row */}
      <div className="kpi-grid">
        {[
          { label: "Addiction Score", val: score, suffix: "", color: levelColor, change: "↑ 8 pts from yesterday", up: true, icon: <MdOutlineSpeed size={18} color={levelColor} />, iconBg: `${levelColor}12` },
          { label: "Today's Usage", val: `${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m`, suffix: "", color: "var(--orange)", change: "↑ 1.2h above daily avg", up: true, icon: <FiClock size={18} color="var(--orange)" />, iconBg: "rgba(249,115,22,.08)" },
          { label: "Total App Opens", val: activePlatforms.reduce((s,[,v])=>s+v.opens,0), suffix: "x", color: "var(--teal)", change: "↓ 5 fewer than avg", up: false, icon: <FiSmartphone size={18} color="var(--teal)" />, iconBg: "rgba(13,148,136,.08)" },
          { label: "Active Platforms", val: activePlatforms.length, suffix: " apps", color: "var(--navy)", change: `${activePlatforms.filter(([,v])=>v.overLimit).length} over limit`, up: true, icon: <FiActivity size={18} color="var(--navy)" />, iconBg: "rgba(11,31,75,.06)" },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <div className="kpi-accent" style={{ background: k.color }} />
            <div className="kpi-label">{k.label}</div>
            <div className="kpi-value" style={{ color: k.color }}>{k.val}{k.suffix}</div>
            <div className="kpi-change" style={{ color: k.up ? "var(--red)" : "var(--green)" }}>
              {k.up ? <FiTrendingUp size={12} /> : <FiTrendingDown size={12} />} {k.change}
            </div>
            <div className="kpi-icon" style={{ background: k.iconBg }}>{k.icon}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-title">7-Day Usage Trend</div>
          <div className="chart-sub">Daily usage minutes vs your baseline</div>
          <BarChart data={weekTrend} maxVal={Math.max(...weekTrend.map(d=>d.mins))} colorFn={v => v > totalMinutes*1.2 ? "var(--red)" : v > totalMinutes*.9 ? "var(--orange)" : "var(--teal)"} valKey="mins" />
          <div className="d-flex gap-3 mt-3" style={{ fontSize: ".72rem", color: "var(--muted)" }}>
            {[["var(--teal)","Normal"],["var(--orange)","Elevated"],["var(--red)","High"]].map(([c,l])=>(
              <span key={l}><span style={{ display:"inline-block",width:10,height:10,borderRadius:2,background:c,marginRight:4 }}/>{l}</span>
            ))}
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-title">Platform Split</div>
          <div className="chart-sub">Today's time distribution</div>
          <div className="donut-wrap">
            <svg width="120" height="120" viewBox="0 0 42 42" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--bg)" strokeWidth="5"/>
              {activePlatforms.slice(0,5).map(([key,v],i,arr)=>{
                const total = arr.reduce((s,[,x])=>s+x.todayMins,0);
                const pct = v.todayMins/total;
                const offset = arr.slice(0,i).reduce((s,[,x])=>s+x.todayMins/total*100,0);
                return <circle key={key} cx="21" cy="21" r="15.9" fill="none" stroke={PLATFORMS[key].color} strokeWidth="5" strokeDasharray={`${pct*100} ${100-pct*100}`} strokeDashoffset={-offset} />;
              })}
            </svg>
            <div className="donut-center">
              <div className="donut-center-val">{Math.floor(totalMinutes/60)}h</div>
              <div style={{fontSize:".6rem",color:"var(--muted)"}}>Total</div>
            </div>
          </div>
          <div className="d-flex flex-column gap-1">
            {activePlatforms.slice(0,5).map(([key,v])=>{
              const Icon = PLATFORMS[key].icon;
              return (
                <div key={key} className="d-flex align-items-center gap-2" style={{fontSize:".78rem"}}>
                  <div className="legend-dot" style={{background:PLATFORMS[key].color}}/>
                  <Icon size={12} color={PLATFORMS[key].color} />
                  <span style={{flex:1}}>{PLATFORMS[key].name}</span>
                  <span className="mono" style={{fontWeight:600}}>{v.todayMins}m</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="syne" style={{ fontWeight: 700, fontSize: ".96rem" }}>🔔 Recent Alerts {alertCount > 0 && <span style={{background:"var(--red)",color:"#fff",borderRadius:100,padding:"1px 7px",fontSize:".66rem",marginLeft:6}}>{alertCount}</span>}</div>
        <button onClick={() => addToast("✅","Done!","All alerts marked as read")} style={{background:"none",border:"1px solid var(--border)",borderRadius:7,padding:"5px 12px",fontSize:".78rem",cursor:"pointer",color:"var(--muted)"}}>Mark all read</button>
      </div>
      <div className="row gy-2 mb-4">
        {alerts.slice(0,4).map((a,i)=>(
          <div key={i} className="col-md-6">
            <div className={`alert-item ${a.read?"":"unread"}`}>
              <div className="alert-icon-box" style={{background:`${a.color}15`}}><span style={{fontSize:"1.1rem"}}>{a.icon}</span></div>
              <div>
                <div style={{fontWeight:700,fontSize:".86rem",marginBottom:2}}>{a.title}{!a.read&&<span style={{background:"var(--red)",color:"#fff",borderRadius:3,padding:"1px 5px",fontSize:".63rem",marginLeft:5}}>NEW</span>}</div>
                <div style={{fontSize:".76rem",color:"var(--muted)",lineHeight:1.5}}>{a.desc}</div>
                <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:3}}>🕐 {a.time}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* App table */}
      <div className="chart-card">
        <div className="chart-title">📱 Platform Breakdown</div>
        <div className="chart-sub">Today's usage per app with risk levels</div>
        <div style={{overflowX:"auto"}}>
          <table className="app-tbl">
            <thead><tr><th>Platform</th><th>Today</th><th>Opens</th><th>Usage</th><th>Risk</th><th>Action</th></tr></thead>
            <tbody>
              {activePlatforms.map(([key,v])=>{
                const p = PLATFORMS[key]; const Icon = p.icon;
                return (
                  <tr key={key}>
                    <td><div className="d-flex align-items-center"><div className="app-icon" style={{background:p.bg}}><Icon color={p.color} size={15}/></div>{p.name}</div></td>
                    <td className="mono" style={{fontWeight:700,color:v.overLimit?"var(--red)":undefined}}>{v.todayMins}m</td>
                    <td>{v.opens}x</td>
                    <td><div className="u-bar"><div className="u-bar-fill" style={{width:`${Math.min(100,v.pct)}%`,background:v.overLimit?"var(--red)":v.pct>70?"var(--orange)":"var(--teal)"}}/></div></td>
                    <td><RiskBadge risk={v.overLimit?"high":v.pct>70?"mid":"low"}/></td>
                    <td><button onClick={()=>addToast("⏱️","Limit set!",`${p.name} limited to ${p.limit} min/day`)} style={{background:"none",border:`1px solid ${v.overLimit?"var(--red)":"var(--border)"}`,color:v.overLimit?"var(--red)":"var(--muted)",borderRadius:6,padding:"4px 9px",fontSize:".72rem",cursor:"pointer"}}>
                      {v.overLimit?"Set Limit":"Monitor"}
                    </button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ScoreView({ data }) {
  const { score, level, levelColor, weekTrend, features } = data;
  const featureRows = [
    { label: "Daily Screen Time", note: "vs limit", pct: Math.min(100, Math.round(features.dailyOverageRatio*100)), color: "var(--red)", weight: "25%" },
    { label: "Late Night Usage", note: `${Math.round(features.lateNightRatio*100)}% of platforms`, pct: Math.round(features.lateNightRatio*100), color: "var(--orange)", weight: "20%" },
    { label: "Session Frequency", note: "opens per day", pct: Math.min(100,Math.round(features.freqNorm*100)), color: "var(--orange)", weight: "20%" },
    { label: "Scroll Depth", note: "average per session", pct: Math.round(features.scrollNorm*100), color: "var(--teal)", weight: "15%" },
    { label: "Passive Interaction", note: "passive vs active", pct: Math.round(features.interactionPassiveRatio*100), color: "var(--navy)", weight: "10%" },
    { label: "Mood Impact", note: "self-reported", pct: Math.round(features.moodImpact*100), color: "var(--muted)", weight: "10%" },
  ];
  return (
    <div className="fade-up row gy-4">
      <div className="col-lg-5">
        <div className="chart-card text-center">
          <div className="chart-title">Your Addiction Score</div>
          <div className="chart-sub">Computed every 15 min — RF + LSTM ensemble</div>
          <div style={{position:"relative",width:160,height:160,margin:"20px auto"}}>
            <ScoreGauge score={score} color={levelColor} />
            <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:"2.8rem",fontWeight:800,color:levelColor}}>{score}</div>
              <div style={{fontSize:".72rem",color:"var(--muted)"}}>/ 100</div>
            </div>
          </div>
          <div style={{display:"inline-block",background:`${levelColor}12`,border:`2px solid ${levelColor}`,color:levelColor,borderRadius:100,padding:"8px 24px",fontWeight:700,fontSize:".9rem"}}>
            ⚠️ {level.toUpperCase()} RISK
          </div>
          <div className="d-flex justify-content-around mt-4">
  {[
    ["10B981", "0–30", "Low"],
    ["F97316", "30–60", "Moderate"],
    ["EF4444", "60–100", "High"]
  ].map(([c, r, l]) => (
    <div key={l}>
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: "1.1rem",
          fontWeight: 800,
          color: `#${c}`
        }}
      >
        {r}
      </div>

      <div
        style={{
          fontSize: ".7rem",
          color: "var(--muted)"
        }}
      >
        {l}
      </div>
    </div>
  ))}
</div>
        </div>
      </div>
      <div className="col-lg-7">
        <div className="chart-card">
          <div className="chart-title">Feature Weight Analysis</div>
          <div className="chart-sub">ML model: Score = Σ(Featureᵢ × Weightᵢ) → normalised 0–100</div>
          <div className="d-flex flex-column gap-3 mt-2">
            {featureRows.map((f,i)=>(
              <div key={i}>
                <div className="d-flex justify-content-between mb-1" style={{fontSize:".83rem"}}>
                  <span style={{fontWeight:600}}>{f.label}</span>
                  <div className="d-flex gap-2">
                    <span style={{color:"var(--muted)",fontSize:".76rem"}}>{f.note}</span>
                    <span style={{fontWeight:700,color:f.color,fontSize:".76rem",background:`${f.color}12`,padding:"0 6px",borderRadius:4}}>{f.weight}</span>
                  </div>
                </div>
                <div style={{height:8,background:"var(--bg)",borderRadius:4}}>
                  <div style={{width:`${f.pct}%`,height:"100%",background:f.color,borderRadius:4,transition:"width 1.2s cubic-bezier(.4,0,.2,1)"}}/>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="chart-card mt-3">
          <div className="chart-title">7-Day Score Trend</div>
          <div className="chart-sub">Daily addiction score history</div>
          <BarChart data={weekTrend} maxVal={100} colorFn={scoreColor} />
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ data }) {
  const { heatmap, monthTrend, hourlyUsage, weekTrend } = data;
  const peakHour = hourlyUsage.reduce((m,h)=>h.mins>m.mins?h:m, hourlyUsage[0]);
  const topDay = weekTrend.reduce((m,d)=>d.mins>m.mins?d:m, weekTrend[0]);

  return (
    <div className="fade-up row gy-4">
      <div className="col-12">
        <div className="chart-card">
          <div className="chart-title">📅 Usage Heatmap — Last 4 Weeks</div>
          <div className="chart-sub">Darker = more usage. Hover for details.</div>
          <div className="d-flex gap-1 mb-2">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>(
              <div key={d} style={{flex:1,fontSize:".63rem",color:"var(--muted)",fontWeight:600,textAlign:"center"}}>{d}</div>
            ))}
          </div>
          <div className="heatmap-grid">
            {heatmap.map((cell,i)=>{
              const bg = cell.intensity<.2?`rgba(13,148,136,${cell.intensity*.5})`:cell.intensity<.5?`rgba(13,148,136,${cell.intensity})`:cell.intensity<.75?`rgba(249,115,22,${cell.intensity})`:cell.intensity<.9?`rgba(239,68,68,${cell.intensity})`:`#EF4444`;
              return <div key={i} className="hcell" style={{background:bg}} title={`${cell.mins}m usage`}/>;
            })}
          </div>
          <div className="d-flex align-items-center gap-2 mt-3" style={{fontSize:".72rem",color:"var(--muted)"}}>
            <span>Less</span>
            {["rgba(13,148,136,.1)","rgba(13,148,136,.4)","rgba(249,115,22,.5)","rgba(239,68,68,.7)","#EF4444"].map((c,i)=>(
              <div key={i} style={{width:13,height:13,borderRadius:3,background:c}}/>
            ))}
            <span>More</span>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="chart-card h-100">
          <div className="chart-title">⏰ Peak Usage Hours</div>
          <div className="chart-sub">When you use social media most (hourly)</div>
          <BarChart
            data={hourlyUsage.filter((_,i)=>i%2===0).map(h=>({...h,label:`${h.hour}h`}))}
            maxVal={Math.max(...hourlyUsage.map(h=>h.mins))||60}
            colorFn={v=>v>60?"var(--red)":v>30?"var(--orange)":"var(--teal)"}
            labelKey="label" valKey="mins"
          />
          <div className="mt-3 d-flex gap-3">
            <div style={{flex:1,background:"var(--bg)",borderRadius:9,padding:"10px 14px"}}>
              <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:600}}>PEAK HOUR</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.2rem",fontWeight:800,color:"var(--red)"}}>{peakHour.hour}:00</div>
            </div>
            <div style={{flex:1,background:"var(--bg)",borderRadius:9,padding:"10px 14px"}}>
              <div style={{fontSize:".7rem",color:"var(--muted)",fontWeight:600}}>WORST DAY</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:"1.2rem",fontWeight:800,color:"var(--orange)"}}>{topDay.day}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-md-6">
        <div className="chart-card h-100">
          <div className="chart-title">📊 30-Day Score Trend</div>
          <div className="chart-sub">Monthly addiction score history</div>
          <BarChart
            data={monthTrend.filter((_,i)=>i%3===0).map(d=>({...d,label:`${d.day}`}))}
            maxVal={100}
            colorFn={scoreColor}
            labelKey="label" valKey="score"
          />
        </div>
      </div>
    </div>
  );
}

function AlertsView({ data, addToast }) {
  const { alerts } = data;
  const [read, setRead] = useState([]);
  const markRead = id => setRead(r => [...r, id]);

  return (
    <div className="fade-up">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="syne" style={{fontWeight:700,fontSize:"1rem"}}>All Alerts ({alerts.length})</div>
        <button onClick={()=>{setRead(alerts.map(a=>a.id));addToast("✅","Done!","All alerts marked as read")}}
          style={{background:"var(--teal)",color:"#fff",border:"none",borderRadius:7,padding:"7px 14px",fontSize:".8rem",fontWeight:600,cursor:"pointer"}}>
          Mark All Read
        </button>
      </div>
      <div className="row gy-2">
        {alerts.map((a,i)=>(
          <div key={i} className="col-md-6">
            <div className={`alert-item ${read.includes(a.id)?"":"unread"}`}>
              <div className="alert-icon-box" style={{background:`${a.color}15`}}><span style={{fontSize:"1.1rem"}}>{a.icon}</span></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:".86rem",marginBottom:2}}>
                  {a.title}
                  {!read.includes(a.id)&&<span style={{background:"var(--red)",color:"#fff",borderRadius:3,padding:"1px 5px",fontSize:".63rem",marginLeft:5}}>NEW</span>}
                </div>
                <div style={{fontSize:".76rem",color:"var(--muted)",lineHeight:1.5}}>{a.desc}</div>
                <div style={{fontSize:".68rem",color:"var(--muted)",marginTop:3}}>🕐 {a.time} · {a.type.replace("_"," ")}</div>
              </div>
              <button onClick={()=>markRead(a.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:".8rem",flexShrink:0}}><FiCheck size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecoView({ data, addToast }) {
  const { recommendations } = data;
  return (
    <div className="fade-up">
      <div className="chart-card">
        <div className="chart-title">💡 AI-Generated Recommendations</div>
        <div className="chart-sub" style={{marginBottom:16}}>Personalised action plan based on your addiction score and behavioural patterns</div>
        {recommendations.map((r,i)=>(
          <div key={i} className="reco-item">
            <div className="reco-icon-box" style={{background:`${r.color}15`}}><span style={{fontSize:"1.15rem"}}>{r.icon}</span></div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <span style={{fontWeight:700,fontSize:".9rem"}}>{r.title}</span>
                <span style={{background:`${r.color}15`,color:r.color,borderRadius:4,padding:"1px 7px",fontSize:".68rem",fontWeight:700}}>{r.impact}</span>
                <span style={{background:r.priority==="high"?"rgba(239,68,68,.1)":r.priority==="medium"?"rgba(249,115,22,.1)":"rgba(13,148,136,.1)",color:r.priority==="high"?"var(--red)":r.priority==="medium"?"var(--orange)":"var(--teal)",borderRadius:4,padding:"1px 7px",fontSize:".66rem",fontWeight:700,textTransform:"uppercase"}}>{r.priority}</span>
              </div>
              <div style={{fontSize:".8rem",color:"var(--muted)",lineHeight:1.55}}>{r.desc}</div>
            </div>
            <button className="btn-reco" onClick={()=>addToast("✅",r.action+" applied!",r.title+" is now active.")}>{r.action}</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportsView({ data, addToast }) {
  const rpts = [
    {icon:"📄",title:"Weekly Report",sub:`Score: ${data.score} · Avg: ${Math.floor(data.totalMinutes/60)}h/day`,color:"var(--navy)",btn:"⬇️ Download PDF"},
    {icon:"📊",title:"Monthly Report",sub:"April 2026 · Full analysis",color:"var(--teal)",btn:"⬇️ Download PDF"},
    {icon:"📈",title:"Raw Data Export",sub:"CSV — all sessions",color:"var(--orange)",btn:"⬇️ Export CSV"},
  ];
  return (
    <div className="fade-up row gy-4">
      {rpts.map((r,i)=>(
        <div key={i} className="col-md-4">
          <div className="chart-card text-center">
            <div style={{fontSize:"2.4rem",marginBottom:12}}>{r.icon}</div>
            <div className="chart-title">{r.title}</div>
            <div className="chart-sub">{r.sub}</div>
            <button style={{background:r.color,color:"#fff",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:600,cursor:"pointer",width:"100%",marginTop:20,fontFamily:"'Syne',sans-serif"}}
              onClick={()=>addToast("📥","Downloading!",`${r.title} is being prepared...`)}>
              {r.btn}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function GoalsView({ data, addToast }) {
  const goals = [
    { name: "📱 Stay under 5h total/day",  pct: Math.min(100,Math.round(data.totalMinutes/300*100)), color:"var(--red)" },
    { name: "🌙 No usage after 10 PM",     pct: data.activePlatforms.filter(([,v])=>v.lateNight).length===0?100:30, color:"var(--orange)" },
    { name: "📉 Reduce score by 20 pts",   pct: 40, color:"var(--teal)" },
    { name: "📸 Instagram < 1h/day",       pct: Math.min(100, data.platforms.instagram?Math.round(data.platforms.instagram.todayMins/60*100):100), color:"var(--red)" },
    { name: "🏃 7-day low usage streak",   pct: 14, color:"var(--orange)" },
  ];
  const badges = [
    {e:"🌟",t:"First Analysis",s:"Earned!",unlocked:true},
    {e:"📊",t:"Data Explorer",s:"Earned!",unlocked:true},
    {e:"💪",t:"1-Day Streak",s:"Just earned!",unlocked:true},
    {e:"🔥",t:"7-Day Streak",s:"Locked",unlocked:false},
    {e:"🏆",t:"Score < 30",s:"Locked",unlocked:false},
    {e:"🌿",t:"Digital Detox",s:"Locked",unlocked:false},
  ];
  return (
    <div className="fade-up row gy-4">
      <div className="col-lg-7">
        <div className="chart-card">
          <div className="chart-title">🎯 Active Goals</div>
          <div className="chart-sub">Track your digital wellness milestones</div>
          {goals.map((g,i)=>(
            <div key={i} style={{margin:"14px 0"}}>
              <div className="d-flex justify-content-between mb-1" style={{fontSize:".86rem"}}>
                <span style={{fontWeight:600}}>{g.name}</span>
                <span style={{color:g.color,fontWeight:700,fontSize:".8rem"}}>{g.pct}%</span>
              </div>
              <div className="goal-bar"><div className="goal-bar-fill" style={{width:`${Math.min(100,g.pct)}%`,background:g.color}}/></div>
            </div>
          ))}
          <button onClick={()=>addToast("🎯","Goal added!","New custom goal has been set")}
            style={{background:"var(--teal)",color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",fontWeight:600,cursor:"pointer",marginTop:14,fontFamily:"'Syne',sans-serif",fontSize:".88rem"}}>
            + Add Custom Goal
          </button>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="chart-card">
          <div className="chart-title">🏆 Achievements</div>
          <div className="chart-sub">Badges earned on your journey</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
            {badges.map((b,i)=>(
              <div key={i} style={{background:"var(--bg)",borderRadius:11,padding:"14px",textAlign:"center",border:`2px solid ${b.unlocked?"rgba(16,185,129,.3)":"var(--border)"}`,opacity:b.unlocked?1:.4}}>
                <div style={{fontSize:"1.9rem"}}>{b.e}</div>
                <div style={{fontSize:".78rem",fontWeight:700,marginTop:5}}>{b.t}</div>
                <div style={{fontSize:".68rem",color:b.unlocked?"var(--teal)":"var(--muted)"}}>{b.s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView({ data, addToast }) {
  const [settings, setSettings] = useState(data.defaultSettings);
  const flip = key => {
    setSettings(s=>({...s,[key]:!s[key]}));
    addToast("⚙️","Setting saved!",`${key} preference updated.`);
  };
  const toggleRows = [
    {key:"alertUsageLimit",label:"⚠️ Usage Limit Alerts",sub:"Notify when daily limit is exceeded"},
    {key:"alertLateNight",label:"🌙 Late Night Alerts",sub:"Notify for usage after 10 PM"},
    {key:"alertScoreSpike",label:"📈 Score Spike Alerts",sub:"Notify when score jumps > 10 pts"},
    {key:"pushNotifications",label:"🔔 Push Notifications",sub:"Real-time device notifications"},
    {key:"emailAlerts",label:"📧 Email Reports",sub:"Weekly summary + critical alerts"},
    {key:"smsAlerts",label:"📱 SMS Alerts",sub:"Critical score spike SMS only"},
    {key:"nightLock",label:"🔒 Night Mode Lock",sub:"Block apps after 10 PM automatically"},
  ];
  return (
    <div className="fade-up row gy-4">
      <div className="col-lg-6">
        <div className="chart-card">
          <div className="chart-title">⚙️ Alert Settings</div>
          <div className="chart-sub" style={{marginBottom:16}}>Configure your notification preferences</div>
          {toggleRows.map(t=>(
            <div key={t.key} className="toggle-row">
              <div>
                <div style={{fontWeight:600,fontSize:".88rem"}}>{t.label}</div>
                <div style={{fontSize:".76rem",color:"var(--muted)"}}>{t.sub}</div>
              </div>
              <Toggle on={settings[t.key]} onToggle={()=>flip(t.key)}/>
            </div>
          ))}
        </div>
      </div>
      <div className="col-lg-6">
        <div className="chart-card">
          <div className="chart-title">👤 Profile Settings</div>
          <div className="chart-sub" style={{marginBottom:16}}>Your account information</div>
          {[["Full Name","text",data.user.name],["Email","email",data.user.email],["WhatsApp Number","tel",data.user.phone],["Daily Usage Limit (min)","number","300"]].map(([lbl,type,val])=>(
            <div key={lbl} style={{marginBottom:14}}>
              <label style={{fontSize:".78rem",fontWeight:600,color:"var(--muted)",display:"block",marginBottom:5}}>{lbl}</label>
              <input type={type} defaultValue={val}
                style={{width:"100%",padding:"10px 13px",border:"1px solid var(--border)",borderRadius:8,fontSize:".9rem",fontFamily:"'DM Sans',sans-serif",outline:"none"}}
                onChange={()=>addToast("💾","Pending","Save to apply changes")}/>
            </div>
          ))}
          <button onClick={()=>addToast("✅","Saved!","Profile updated successfully")}
            style={{background:"var(--navy)",color:"#fff",border:"none",borderRadius:8,padding:"11px",fontWeight:600,cursor:"pointer",width:"100%",fontFamily:"'Syne',sans-serif",fontSize:".9rem"}}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────────────────────── */
const NAV = [
  { id:"overview",  icon:RiDashboard3Line,  label:"Dashboard" },
  { id:"score",     icon:MdOutlineSpeed,    label:"My Score" },
  { id:"analytics", icon:MdOutlineAnalytics,label:"Analytics" },
  { id:"apps",      icon:FiSmartphone,      label:"App Usage" },
  { id:"alerts",    icon:FiBell,            label:"Alerts", badge:3 },
  { id:"reports",   icon:FiFileText,        label:"Reports" },
  { id:"reco",      icon:RiLightbulbLine,   label:"Recommendations" },
  { id:"goals",     icon:FiTarget,          label:"Goals" },
  { id:"settings",  icon:FiSettings,        label:"Settings" },
];

const VIEW_TITLES = {
  overview:"Dashboard Overview", score:"My Addiction Score", analytics:"Usage Analytics",
  apps:"App Usage Monitor", alerts:"Alerts & Notifications", reports:"Reports",
  reco:"AI Recommendations", goals:"Goals & Achievements", settings:"Settings"
};

function Sidebar({ active, setActive, open, setOpen, data, onBack }) {
  return (
    <div className={`sidebar ${open?"open":""}`}>
      <div className="sb-brand">
        <div className="sb-brand-name">⚡ Addict<span>AI</span></div>
        <div style={{fontSize:".68rem",color:"rgba(255,255,255,.35)",marginTop:2}}>Addiction Detection System</div>
      </div>
      <div className="sb-score-box">
        <div style={{fontSize:".63rem",color:"rgba(255,255,255,.35)",fontWeight:700,letterSpacing:1,marginBottom:3}}>LIVE ADDICTION SCORE</div>
        <div className="sb-score-num" style={{color:data.levelColor}}>{data.score}</div>
        <div style={{fontSize:".68rem",color:"rgba(255,255,255,.4)",marginTop:2}}>Updated 2 min ago</div>
        <div className="sb-score-badge" style={{background:`${data.levelColor}18`,border:`1px solid ${data.levelColor}`,color:data.levelColor}}>
          ⚠️ {data.level.toUpperCase()} RISK
        </div>
      </div>
      <nav className="sb-nav">
        {[{label:"Overview",items:NAV.slice(0,3)},{label:"Monitoring",items:NAV.slice(3,6)},{label:"Health",items:NAV.slice(6,8)},{label:"Account",items:NAV.slice(8)}].map(g=>(
          <div key={g.label}>
            <div className="sb-section-lbl">{g.label}</div>
            {g.items.map(item=>{
              const Icon = item.icon;
              return (
                <div key={item.id} className={`nav-item ${active===item.id?"active":""}`}
                  onClick={()=>{setActive(item.id);setOpen(false);}}>
                  <Icon size={16}/>{item.label}
                  {item.badge&&<span className="nav-badge">{item.badge}</span>}
                </div>
              );
            })}
          </div>
        ))}
        <div className="sb-section-lbl">Navigation</div>
 <div className="nav-item" onClick={onBack}>
      <FiLogIn size={16} />
      Back to Landing   
    </div>      </nav>
      <div className="sb-user">
        <div className="sb-avatar">R</div>
        <div>
          <div style={{fontSize:".86rem",fontWeight:600,color:"#fff"}}>{data.user.name}</div>
          <div style={{fontSize:".7rem",color:"rgba(255,255,255,.38)"}}>{data.user.email}</div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   APPS VIEW (full separate component)
───────────────────────────────────────────────────────────── */
function AppsView({ data, addToast }) {
  return (
    <div className="fade-up">
      <div className="chart-card">
        <div className="chart-title">📱 Full App Usage Monitor</div>
        <div className="chart-sub">Real-time per-platform tracking with limit controls</div>
        <div style={{overflowX:"auto"}}>
          <table className="app-tbl">
            <thead><tr><th>Platform</th><th>Today</th><th>This Week</th><th>Limit</th><th>Opens</th><th>Late Night</th><th>Risk</th><th>Action</th></tr></thead>
            <tbody>
              {data.activePlatforms.map(([key,v])=>{
                const p = PLATFORMS[key]; const Icon = p.icon;
                return (
                  <tr key={key}>
                    <td><div className="d-flex align-items-center"><div className="app-icon" style={{background:p.bg}}><Icon color={p.color} size={15}/></div><div><div style={{fontWeight:600}}>{p.name}</div><div style={{fontSize:".7rem",color:"var(--muted)"}}>~{v.sessionAvg}m/session</div></div></div></td>
                    <td className="mono" style={{fontWeight:700,color:v.overLimit?"var(--red)":undefined}}>{v.todayMins}m</td>
                    <td className="mono">{Math.floor(v.weekMins/60)}h {v.weekMins%60}m</td>
                    <td className="mono" style={{color:"var(--muted)"}}>{p.limit}m</td>
                    <td>{v.opens}x</td>
                    <td>{v.lateNight?<span style={{color:"var(--orange)",fontWeight:600,fontSize:".8rem"}}>🌙 Yes</span>:<span style={{color:"var(--green)",fontSize:".8rem"}}>✓ No</span>}</td>
                    <td><RiskBadge risk={v.overLimit?"high":v.pct>70?"mid":"low"}/></td>
                    <td>
                      <button onClick={()=>addToast(v.overLimit?"🚫":"✅",v.overLimit?`${p.name} limited`:`${p.name} OK`,v.overLimit?`Daily limit set to ${p.limit}m`:"Usage is within healthy range")}
                        style={{background:v.overLimit?"var(--red)":v.pct>70?"var(--orange)":"var(--green)",color:"#fff",border:"none",borderRadius:6,padding:"5px 10px",fontSize:".72rem",fontWeight:600,cursor:"pointer"}}>
                        {v.overLimit?"Block":"Monitor"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DASHBOARD ROOT
───────────────────────────────────────────────────────────── */
export default function DashboardPage({ initialData, onBack }) {
  // Generate data from seed or use passed data
  const [data, setData] = useState(() => {
    if (initialData && initialData.score) return { ...initialData, user:{ name:"Rahul Kumar",email:"rahul@pdacoe.edu.in",phone:"+91 98765 43210" }, defaultSettings:{ alertUsageLimit:true,alertLateNight:true,alertScoreSpike:true,pushNotifications:true,emailAlerts:true,smsAlerts:false,nightLock:false } };
    return generateSessionData("default-user-2026");
  });

  const [activeView, setActiveView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveScore, setLiveScore] = useState(data.score);
  const [lastUpdated, setLastUpdated] = useState("just now");
  const [refreshing, setRefreshing] = useState(false);
  const { toasts, add: addToast, remove: removeToast } = useToasts();

  // Live score simulation (refreshes every 15 seconds like real system)
  useEffect(() => {
    const iv = setInterval(() => {
      const delta = Math.round((Math.random() - 0.5) * 4);
      setLiveScore(s => Math.min(100, Math.max(5, s + delta)));
      setLastUpdated(new Date().toLocaleTimeString());
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  // Toast on mount
  useEffect(() => {
    setTimeout(() => addToast("👋", "Welcome back!", `Score: ${data.score}/100 — ${data.level} Risk. ${data.alerts.filter(a=>!a.read).length} unread alerts.`), 800);
  }, []);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const newData = generateSessionData(String(Date.now()));
      setData(d => ({ ...d, weekTrend: newData.weekTrend, monthTrend: newData.monthTrend }));
      setLiveScore(newData.score);
      setLastUpdated(new Date().toLocaleTimeString());
      setRefreshing(false);
      addToast("↻", "Refreshed!", "All metrics updated from latest usage data");
    }, 1200);
  };

  const renderView = () => {
    const d = { ...data, score: liveScore };
    switch (activeView) {
      case "overview":  return <OverviewView data={d} addToast={addToast} />;
      case "score":     return <ScoreView data={d} />;
      case "analytics": return <AnalyticsView data={d} />;
      case "apps":      return <AppsView data={d} addToast={addToast} />;
      case "alerts":    return <AlertsView data={d} addToast={addToast} />;
      case "reports":   return <ReportsView data={d} addToast={addToast} />;
      case "reco":      return <RecoView data={d} addToast={addToast} />;
      case "goals":     return <GoalsView data={d} addToast={addToast} />;
      case "settings":  return <SettingsView data={d} addToast={addToast} />;
      default:          return <OverviewView data={d} addToast={addToast} />;
    }
  };

  const levelColor = liveScore < 30 ? "#10B981" : liveScore < 60 ? "#F97316" : "#EF4444";
  const level = liveScore < 30 ? "Low" : liveScore < 60 ? "Moderate" : "High";

  return (
    <>
      <style>{DASH_STYLES}</style>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" />

      <div className="dash-root">
        {/* Overlay */}
        {sidebarOpen && <div className="dash-overlay show" onClick={()=>setSidebarOpen(false)}/>}

        {/* Sidebar */}
        <Sidebar
          active={activeView} setActive={setActiveView}
          open={sidebarOpen} setOpen={setSidebarOpen}
          data={{...data, score:liveScore, levelColor, level, user: data.user || {name:"Rahul Kumar",email:"rahul@pdacoe.edu.in"}}}
          onBack={onBack}
        />

        {/* Main */}
        <div className="dash-main">
          {/* Topbar */}
          <div className="topbar">
            <div className="d-flex align-items-center gap-3">
              <button className="hamburger" onClick={()=>setSidebarOpen(o=>!o)}><FiMenu size={22}/></button>
              <div>
                <div className="topbar-title">{VIEW_TITLES[activeView]}</div>
                <div className="topbar-sub"><span className="pulse-dot" style={{marginRight:5}}/> Live · {lastUpdated}</div>
              </div>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn-topbar btn-topbar-alert" onClick={()=>addToast("⚠️","Usage Alert!","Instagram exceeded 2h. Consider taking a break.")}>
                <FiBell size={14}/> {data.alerts.filter(a=>!a.read).length} Alerts
              </button>
              <button className="btn-topbar btn-topbar-refresh" onClick={refresh}>
                {refreshing?<span className="spinner"/>:<FiRefreshCw size={14}/>}
              </button>
              <button className="btn-topbar btn-topbar-back hide-mobile" onClick={onBack}><FiLogOut size={14}/> Landing</button>
            </div>
          </div>

          {/* Content */}
          <div className="dash-content">{renderView()}</div>
        </div>
      </div>

      {/* Toasts */}
      <div className="toast-wrap">
        {toasts.map(t=>(
          <div key={t.id} className="toast-card">
            <span style={{fontSize:"1.2rem",flexShrink:0,marginTop:2}}>{t.icon}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,fontSize:".84rem",marginBottom:1}}>{t.title}</div>
              <div style={{fontSize:".74rem",color:"var(--muted)"}}>{t.body}</div>
            </div>
            <button onClick={()=>removeToast(t.id)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:"1rem",flexShrink:0}}>✕</button>
          </div>
        ))}
      </div>
    </>
  );
}