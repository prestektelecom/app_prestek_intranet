import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "../ui/glowing-effect";
import { useTouchOnly } from "../../hooks/useTouchOnly";
import { cn } from "@/lib/utils";

/**
 * Mapa de posicionamento do grid bento.
 *
 * As strings PRECISAM ser literais aqui para que o Tailwind JIT as detecte
 * durante o scan estático e gere as classes CSS. Nunca interpole ou construa
 * esses valores dinamicamente — o JIT não consegue enxergar strings em runtime.
 *
 * Layout xl (1280px+):
 *   col 1-4      col 5-7      col 8-12
 *   ┌──────────┬────────────┬──────────┐  linha 1
 *   │ sistemas │            │  comun.  │
 *   ├──────────┤  segurança │──────────┤  linha 2
 *   │  gestão  │            │  busca   │
 *   └──────────┴────────────┴──────────┘
 */
const AREA_CLASSES = {
  sistemas: "md:[grid-area:1/1/2/7]  xl:[grid-area:1/1/2/5]",
  gestao:   "md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]",
  seguranca:"md:[grid-area:2/1/3/7]  xl:[grid-area:1/5/3/8]",
  comun:    "md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]",
  busca:    "md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]",
};

const ITEMS = [
  {
    id: "sistemas",
    icon: Box,
    title: "Sistemas Integrados",
    description: "Acesse todas as ferramentas e serviços da Prestek Intranet em um só lugar.",
  },
  {
    id: "gestao",
    icon: Settings,
    title: "Gestão Simplificada",
    description: "Acompanhe indicadores de desempenho, prazos de chamados e solicitações.",
  },
  {
    id: "seguranca",
    icon: Lock,
    title: "Segurança & Auditoria",
    description: "Controle de acesso por setor com histórico de ações e permissões.",
  },
  {
    id: "comun",
    icon: Sparkles,
    title: "Comunicação em Tempo Real",
    description: "Fique por dentro de todos os comunicados e atualizações institucionais.",
  },
  {
    id: "busca",
    icon: Search,
    title: "Busca Rápida de Processos",
    description: "Encontre manuais, procedimentos padrão e contatos de suporte de TI.",
  },
];

export function GlowingEffectDemo() {
  return (
    <ul className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
      {ITEMS.map(({ id, icon: Icon, title, description }) => (
        <GridItem
          key={id}
          areaClass={AREA_CLASSES[id]}
          icon={<Icon className="h-5 w-5" />}
          title={title}
          description={description}
        />
      ))}
    </ul>
  );
}

const GridItem = ({ areaClass, icon, title, description }) => {
  const isTouchOnly = useTouchOnly();

  return (
    <li className={cn("min-h-[14rem] list-none", areaClass)}>
      <div className="relative h-full rounded-[1.25rem] border border-border p-2 md:rounded-[1.5rem] md:p-3 bg-surface shadow-sm">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={isTouchOnly}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative z-10 flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border border-border bg-surface p-2 shadow-xs">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted font-medium">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default GlowingEffectDemo;
