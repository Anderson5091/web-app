interface BadgeProps {
  label: string;
  variant?: "primary" | "secondary" | "warning" | "danger" | "success" | "neutral";
}

const variantStyles: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: "rgba(0, 214, 163, 0.1)", text: "#00D6A3", border: "rgba(0, 214, 163, 0.25)" },
  secondary: { bg: "rgba(0, 132, 255, 0.1)", text: "#0084FF", border: "rgba(0, 132, 255, 0.25)" },
  warning: { bg: "rgba(245, 166, 35, 0.1)", text: "#F5A623", border: "rgba(245, 166, 35, 0.25)" },
  danger: { bg: "rgba(255, 78, 78, 0.1)", text: "#FF4E4E", border: "rgba(255, 78, 78, 0.25)" },
  success: { bg: "rgba(0, 214, 163, 0.1)", text: "#00D6A3", border: "rgba(0, 214, 163, 0.25)" },
  neutral: { bg: "rgba(160, 171, 192, 0.1)", text: "#A0ABC0", border: "rgba(160, 171, 192, 0.2)" },
};

export default function Badge({ label, variant = "primary" }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <span
      className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: v.bg, color: v.text, borderColor: v.border }}
    >
      {label}
    </span>
  );
}
