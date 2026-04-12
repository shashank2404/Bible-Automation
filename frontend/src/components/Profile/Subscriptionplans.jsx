import React, { useState } from "react";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    period: "/month",
    tagline: "Begin your journey",
    color: "#9a8060",
    bg: "#f5f0e8",
    border: "#d9c9a8",
    textColor: "#5a4a30",
    features: [
      "3 chapters per day",
      "Daily verse & devotional",
      "Basic AI Bible chat",
      "Community read access",
    ],
    cta: "Current Plan",
    current: true,
  },
  {
    key: "pro",
    name: "Pro",
    price: "₹199",
    period: "/month",
    tagline: "Deepen your faith",
    color: "#c8941a",
    bg: "#fffaf0",
    border: "#d4a437",
    textColor: "#7a5c00",
    featured: true,
    features: [
      "Unlimited chapters",
      "Advanced AI study guides",
      "Full commentary library",
      "Join unlimited communities",
      "Offline Bible access",
      "Prayer journal & reminders",
    ],
    cta: "Upgrade to Pro",
  },
  {
    key: "scholar",
    name: "Scholar",
    price: "₹499",
    period: "/month",
    tagline: "Master the scripture",
    color: "#6b3fa0",
    bg: "#f8f4ff",
    border: "#c9a8e8",
    textColor: "#4a1d80",
    features: [
      "Everything in Pro",
      "Original language tools (Greek/Hebrew)",
      "1-on-1 AI theologian sessions",
      "Exclusive seminary content",
      "Certificate courses",
      "Early access to new features",
      "Priority support",
    ],
    cta: "Upgrade to Scholar",
  },
];

const SubscriptionPlans = ({ currentPlan = "free" }) => {
  const [billing, setBilling] = useState("monthly");

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.title}>Choose your plan</div>
        <div style={styles.toggle}>
          <button
            onClick={() => setBilling("monthly")}
            style={{ ...styles.toggleBtn, ...(billing === "monthly" ? styles.toggleActive : {}) }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            style={{ ...styles.toggleBtn, ...(billing === "yearly" ? styles.toggleActive : {}) }}
          >
            Yearly <span style={styles.saveBadge}>-20%</span>
          </button>
        </div>
      </div>

      {PLANS.map((plan) => {
        const isCurrent = plan.key === currentPlan;
        const price = billing === "yearly"
          ? `₹${Math.round(parseInt(plan.price.replace("₹", "")) * 0.8 * 12)}`
          : plan.price;
        const period = billing === "yearly" ? "/year" : plan.period;

        return (
          <div
            key={plan.key}
            style={{
              ...styles.card,
              background: plan.bg,
              border: plan.featured
                ? `2px solid ${plan.border}`
                : `1px solid ${plan.border}`,
              borderRadius: "18px",
            }}
          >
            {plan.featured && (
              <div style={{ ...styles.popularBadge, background: plan.color }}>
                ✦ Most Popular
              </div>
            )}
            <div style={styles.planTop}>
              <div>
                <div style={{ ...styles.planName, color: plan.color }}>{plan.name}</div>
                <div style={styles.planTagline}>{plan.tagline}</div>
              </div>
              <div style={styles.priceBlock}>
                <span style={{ ...styles.price, color: plan.color }}>{price}</span>
                <span style={styles.period}>{period}</span>
              </div>
            </div>

            <div style={styles.divider} />

            <ul style={styles.featureList}>
              {plan.features.map((f, i) => (
                <li key={i} style={styles.featureItem}>
                  <span style={{ ...styles.check, color: plan.color }}>✓</span>
                  <span style={{ color: plan.textColor }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              style={{
                ...styles.ctaBtn,
                background: isCurrent ? "transparent" : plan.color,
                color: isCurrent ? plan.color : "#fff",
                border: `1.5px solid ${plan.color}`,
                opacity: isCurrent ? 0.7 : 1,
              }}
            >
              {isCurrent ? "✓ Current Plan" : plan.cta}
            </button>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  wrapper: { marginBottom: "12px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: "14px",
    fontWeight: "700",
    color: "#3a2d1a",
    letterSpacing: "0.5px",
  },
  toggle: {
    display: "flex",
    background: "#ede8de",
    borderRadius: "20px",
    padding: "2px",
  },
  toggleBtn: {
    padding: "4px 12px",
    border: "none",
    background: "transparent",
    borderRadius: "18px",
    fontSize: "11px",
    color: "#9a8060",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontWeight: "500",
  },
  toggleActive: {
    background: "#fff",
    color: "#3a2d1a",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  saveBadge: {
    background: "#2d9e6e",
    color: "#fff",
    fontSize: "9px",
    padding: "1px 5px",
    borderRadius: "8px",
    fontWeight: "700",
  },
  card: {
    padding: "16px",
    marginBottom: "10px",
    position: "relative",
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: "0",
    right: "0",
    padding: "4px 14px",
    fontSize: "10px",
    fontWeight: "700",
    color: "#fff",
    borderBottomLeftRadius: "12px",
    letterSpacing: "0.3px",
  },
  planTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "12px",
  },
  planName: {
    fontFamily: "'Cinzel', serif",
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "1px",
  },
  planTagline: {
    fontSize: "11px",
    color: "#9a8060",
    marginTop: "2px",
  },
  priceBlock: {
    textAlign: "right",
  },
  price: {
    fontSize: "22px",
    fontFamily: "'Cinzel', serif",
    fontWeight: "700",
  },
  period: {
    fontSize: "11px",
    color: "#9a8060",
    marginLeft: "2px",
  },
  divider: {
    height: "1px",
    background: "rgba(0,0,0,0.07)",
    marginBottom: "12px",
  },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 14px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    fontSize: "13px",
  },
  check: {
    fontWeight: "700",
    fontSize: "13px",
    flexShrink: 0,
    marginTop: "1px",
  },
  ctaBtn: {
    width: "100%",
    padding: "11px",
    borderRadius: "12px",
    fontSize: "13px",
    fontFamily: "'Cinzel', serif",
    fontWeight: "700",
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
};

export default SubscriptionPlans;