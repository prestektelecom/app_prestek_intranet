// Ilustrações decorativas dos cards de serviço.
//
// Origem: 3dicons (https://3dicons.co) — CC0, uso comercial livre e sem
// exigência de atribuição. Variante "color", ângulo "dynamic".
//
// Substituíram um conjunto do thiings.co que era hotlink externo (bloqueio de
// rede derrubava a arte de todos os cards) e cuja licença comercial é paga.
// Aquelas imagens também não tinham relação com o conteúdo: o card de
// Internet PJ era decorado com uma palheta de guitarra.
//
// Servidas do bundle: imports ESM, então o Vite versiona com hash e o build
// falha se um arquivo sumir.

import wifi from '../image/services/wifi.png';
import computer from '../image/services/computer.png';
import link from '../image/services/link.png';
import tool from '../image/services/tool.png';
import play from '../image/services/play.png';

export const SERVICE_ILLUSTRATIONS = {
    wifi,      // planos de Internet PF — as próprias ondas de sinal
    computer,  // planos de Internet PJ
    link,      // Link Dedicado
    tool,      // serviços técnicos
    play,      // pacotes de streaming
};

export const DEFAULT_ILLUSTRATION = 'wifi';

export function resolveIllustration(type) {
    return SERVICE_ILLUSTRATIONS[type] || SERVICE_ILLUSTRATIONS[DEFAULT_ILLUSTRATION];
}
