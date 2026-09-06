import * as React from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCardGradient } from "../../hooks/useCardGradient";
import { resolveIllustration } from "../../utils/serviceIllustrations";
import useTouchOnly from "../../hooks/useTouchOnly";

const GradientCard = React.forwardRef(
  (
    {
      className,
      gradient = "gray",
      badgeText,
      badgeColor,
      title,
      subtitle,
      description,
      ctaText = "Ver detalhes",
      onCtaClick,
      onClick,
      imageUrl,
      illustrationType = "wifi",
      children,
      topRightContent,
      footerRight,
      ...props
    },
    ref
  ) => {
    const isTouchOnly = useTouchOnly();
    const { style: gradientStyle } = useCardGradient(gradient);

    const cardAnimation = {
      rest: { scale: 1, y: 0 },
      // Em touch o hover "gruda" depois do toque, então não anima.
      hover: isTouchOnly ? { scale: 1, y: 0 } : { scale: 1.03, y: -4 },
    };

    const imageAnimation = {
      rest: { scale: 1, rotate: 0 },
      hover: isTouchOnly ? { scale: 1, rotate: 0 } : { scale: 1.1, rotate: 3 },
    };

    const graphicSrc = imageUrl || resolveIllustration(illustrationType);

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
            "group relative flex flex-col justify-between h-full w-full overflow-hidden rounded-2xl p-5 sm:p-6 border shadow-md transition-shadow duration-300 hover:shadow-xl",
            className
          )}
          style={gradientStyle}
          {...props}
        >
          {/* Ilustração decorativa de fundo */}
          {graphicSrc && (
            <motion.img
              src={graphicSrc}
              alt=""
              aria-hidden="true"
              loading="lazy"
              width={400}
              height={400}
              variants={imageAnimation}
              transition={{ type: "spring", stiffness: 350, damping: 18 }}
              // Menor e mais discreta que antes: com o card mais denso, a arte
              // de 208px cobria a barra de vendas e o botão de comparar.
              className="absolute -right-6 -bottom-6 w-28 sm:w-32 h-28 sm:h-32 opacity-40 dark:opacity-30 pointer-events-none select-none object-contain"
            />
          )}

          {/* Cabeçalho */}
          <div className="relative z-10 flex items-start justify-between gap-2 mb-3">
            {badgeText ? (
              <div className="inline-flex items-center gap-2 rounded-full bg-black/10 dark:bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md shadow-xs">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: badgeColor || "var(--accent)" }}
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

          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col flex-grow justify-between">
            <div>
              {title && (
                <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight drop-shadow-xs">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 text-[12px] font-semibold opacity-75 line-clamp-2 leading-snug">
                  {subtitle}
                </p>
              )}
              {description && (
                <p className="mt-1.5 text-xs sm:text-sm font-medium opacity-90 line-clamp-2 max-w-[85%] leading-snug">
                  {description}
                </p>
              )}
            </div>

            {children && <div className="my-2">{children}</div>}

            {/* Rodapé: CTA + slot opcional */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <div className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs sm:text-sm font-bold opacity-95">
                <span>{ctaText}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
              {footerRight && (
                // Sem este stopPropagation, clicar no slot também dispara o
                // onClick do card e abre o modal de detalhes.
                <div className="z-20 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {footerRight}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

GradientCard.displayName = "GradientCard";

export { GradientCard };
