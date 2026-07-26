import * as React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADIENT_VARIANTS = {
  orange:
    "bg-gradient-to-br from-[#FDE8D0] via-[#F7D3A6] to-[#E5B574] text-amber-950 border-amber-300/70 dark:from-[#3D2206] dark:via-[#4A2C0A] dark:to-[#2A1603] dark:text-amber-100 dark:border-amber-700/50 shadow-amber-500/5",
  gray:
    "bg-gradient-to-br from-[#E2E8F0] via-[#CBD5E1] to-[#94A3B8] text-slate-900 border-slate-300/70 dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#090D16] dark:text-slate-100 dark:border-slate-700/50 shadow-slate-500/5",
  purple:
    "bg-gradient-to-br from-[#E9D5FF] via-[#D8B4FE] to-[#C084FC] text-purple-950 border-purple-300/70 dark:from-[#2E1065] dark:via-[#3B0764] dark:to-[#1E0542] dark:text-purple-100 dark:border-purple-700/50 shadow-purple-500/5",
  green:
    "bg-gradient-to-br from-[#D1FAE5] via-[#A7F3D0] to-[#6EE7B7] text-emerald-950 border-emerald-300/70 dark:from-[#022C22] dark:via-[#064E3B] dark:to-[#011B14] dark:text-emerald-100 dark:border-emerald-700/50 shadow-emerald-500/5",
  blue:
    "bg-gradient-to-br from-[#E0F2FE] via-[#BAE6FD] to-[#7DD3FC] text-sky-950 border-sky-300/70 dark:from-[#0C4A6E] dark:via-[#075985] dark:to-[#032B42] dark:text-sky-100 dark:border-sky-700/50 shadow-sky-500/5",
  rose:
    "bg-gradient-to-br from-[#FFE4E6] via-[#FECDD3] to-[#FDA4AF] text-rose-950 border-rose-300/70 dark:from-[#4C0519] dark:via-[#881337] dark:to-[#2B020D] dark:text-rose-100 dark:border-rose-700/50 shadow-rose-500/5",
};

// 3D Illustration Graphic Presets
const ILLUSTRATIONS_3D = {
  wifi: "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-5i9EDsbgEZk9k7NBeKt3ImNXkx0F66.png&w=320&q=75", // 3D Shield / Builders
  shield: "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-5i9EDsbgEZk9k7NBeKt3ImNXkx0F66.png&w=320&q=75",
  company: "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-CVv0qK2DYZbOAQP2LboVFgQGt0UMfB.png&w=320&q=75",
  cubes: "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-5WJZLkaCfLUnCYpgNz89tPx5C4KYgJ.png&w=320&q=75",
  globe: "https://www.thiings.co/_next/image?url=https%3A%2F%2Flftz25oez4aqbxpq.public.blob.vercel-storage.com%2Fimage-Q24CTBwBqnBrGujxuykBW9GfOYTdeE.png&w=320&q=75",
};

const GradientCard = React.forwardRef(
  (
    {
      className,
      gradient = "gray",
      badgeText,
      badgeColor,
      title,
      description,
      ctaText = "Ver detalhes",
      ctaHref,
      onCtaClick,
      onClick,
      imageUrl,
      illustrationType = "wifi",
      iconName,
      children,
      topRightContent,
      ...props
    },
    ref
  ) => {
    const cardAnimation = {
      rest: { scale: 1, y: 0 },
      hover: { scale: 1.03, y: -4 },
    };

    const imageAnimation = {
      rest: { scale: 1, rotate: 0 },
      hover: { scale: 1.1, rotate: 3 },
    };

    const gradientClass = GRADIENT_VARIANTS[gradient] || GRADIENT_VARIANTS.gray;
    const graphicSrc = imageUrl || ILLUSTRATIONS_3D[illustrationType] || ILLUSTRATIONS_3D.wifi;

    const handleClick = (e) => {
      if (onClick) onClick(e);
      else if (onCtaClick) onCtaClick(e);
    };

    return (
      <motion.div
        variants={cardAnimation}
        initial="rest"
        whileHover="hover"
        animate="rest"
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
        className="h-full w-full cursor-pointer select-none"
        onClick={handleClick}
        ref={ref}
      >
        <div
          className={cn(
            "relative flex flex-col justify-between h-full w-full overflow-hidden rounded-2xl p-5 sm:p-6 border shadow-md transition-shadow duration-300 hover:shadow-xl",
            gradientClass,
            className
          )}
          {...props}
        >
          {/* Decorative 3D background image with animation */}
          {graphicSrc && (
            <motion.img
              src={graphicSrc}
              alt={`${title} graphic`}
              variants={imageAnimation}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              className="absolute -right-8 -bottom-8 w-44 sm:w-52 h-44 sm:h-52 opacity-85 dark:opacity-75 pointer-events-none select-none object-contain drop-shadow-md"
            />
          )}

          {/* Top Header */}
          <div className="z-10 flex items-center justify-between gap-2 mb-3">
            {badgeText ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-black/10 dark:bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-xs">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: badgeColor || "#4A9EF5" }}
                />
                <span className="truncate">{badgeText}</span>
              </div>
            ) : <div />}

            {topRightContent && (
              <div className="z-20 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                {topRightContent}
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="z-10 flex flex-col flex-grow justify-between pr-8">
            <div>
              {title && (
                <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight mb-1.5 drop-shadow-xs">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs sm:text-sm font-medium opacity-90 line-clamp-2 max-w-[85%] leading-snug">
                  {description}
                </p>
              )}
            </div>

            {/* Custom Content Slot */}
            {children && <div className="my-2">{children}</div>}

            {/* Call to Action */}
            <div className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-bold opacity-95 group">
              <span>{ctaText}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

GradientCard.displayName = "GradientCard";

export { GradientCard, GRADIENT_VARIANTS };
