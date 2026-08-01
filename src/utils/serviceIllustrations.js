// Ilustrações decorativas dos cards de serviço.
//
// Antes eram hotlink de thiings.co (proxy do Next sobre um blob do Vercel de
// terceiros). Numa intranet isso significa que um bloqueio de rede derruba a
// arte de todos os cards de uma vez. Agora são servidas do próprio bundle:
// imports ESM, então o Vite versiona com hash e falha o build se um arquivo
// sumir. Redimensionadas para 400px (renderizam a ~208px no maior breakpoint).

import wifi from '../image/services/wifi.png';
import company from '../image/services/company.png';
import cubes from '../image/services/cubes.png';
import globe from '../image/services/globe.png';

export const SERVICE_ILLUSTRATIONS = {
    wifi,     // planos PF
    company,  // planos PJ e Link Dedicado
    cubes,    // serviços técnicos
    globe,    // pacotes de streaming
};

export const DEFAULT_ILLUSTRATION = 'wifi';

export function resolveIllustration(type) {
    return SERVICE_ILLUSTRATIONS[type] || SERVICE_ILLUSTRATIONS[DEFAULT_ILLUSTRATION];
}
