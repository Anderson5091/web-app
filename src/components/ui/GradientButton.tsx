interface GradientButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "danger" | "outline";
  className?: string;
}

export default function GradientButton({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  className = "",
}: GradientButtonProps) {
  if (variant === "outline") {
    return (
      <button
        onClick={onPress}
        disabled={disabled || loading}
        className={`w-full h-14 rounded-lg border border-white/20 flex items-center justify-center text-text-primary text-base font-semibold transition-opacity disabled:opacity-40 ${className}`}
      >
        {title}
      </button>
    );
  }

  const gradient = variant === "danger"
    ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF4E8C]"
    : "bg-gradient-to-r from-[#00D6A3] to-[#0084FF]";

  return (
    <button
      onClick={onPress}
      disabled={disabled || loading}
      className={`w-full h-14 rounded-lg ${gradient} flex items-center justify-center text-white text-base font-bold tracking-wide transition-opacity disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        title
      )}
    </button>
  );
}
