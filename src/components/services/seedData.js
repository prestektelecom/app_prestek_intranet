// Dados locais usados enquanto a API não responde — e como último recurso
// quando ela falha. Nesse caso a UI mostra um aviso, para não passar dado
// desatualizado como se fosse do servidor.

export const FALLBACK_TECH_SERVICES = [
    { id: 1, service: "Instalação de roteador", value: "R$ 50,00", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "router", isFree: false },
    { id: 2, service: "Mudar roteador de local", value: "R$ 30,00 + custo material", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "swap_horiz", isFree: false },
    { id: 3, service: "Configurar roteador", value: "R$ 50,00", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "settings", isFree: false },
    { id: 4, service: "Manutenção interna", value: "R$ 50,00", deadline: "Até 5 dias úteis", payment: "À vista ou 2x Boleto", icon: "build", isFree: false },
    { id: 5, service: "Mudar de titularidade", value: "R$ 0,00", deadline: "Até 24 horas", payment: "", icon: "people", isFree: true },
    { id: 6, service: "Mudar tecnologia", value: "Consulte o NOC", deadline: "", payment: "", icon: "info", isSpecial: true },
    { id: 7, service: "Mudar senha no local", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "password", isFree: false },
    { id: 8, service: "Extensão de rede", value: "Custo de material", deadline: "Até 5 dias", payment: "À vista ou 1x Boleto", icon: "lan", isFree: false },
    { id: 9, service: "IP fixo", value: "R$ 99,90 À vista (ANUAL)", deadline: "24h", payment: "À vista (ANUAL) ou 12x R$9,90 junto mensalidade", icon: "dns", isFree: false },
    { id: 10, service: "Roteador 360º WI-FI", value: "R$ 50,00", deadline: "Até 5 dias", payment: "Adicional mensal fatura: R$ 20,00", icon: "wifi_tethering", isFree: false },
    { id: 11, service: "Alteração de senha WI-FI", value: "", deadline: "Até 5 dias", payment: "", icon: "wifi_lock", isFree: true },
    { id: 12, service: "Trocar Comodato", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "swap_vertical_circle", isFree: false },
    { id: 13, service: "Solicitação de Comodato", value: "R$ 50,00", deadline: "Até 5 dias", payment: "À vista ou 2x Boleto", icon: "add_task", isFree: false },
];

export const FALLBACK_STREAMING_PACKAGES = [
    { id: 1, service: "LEVEDUCA", value: "R$ 6,00", deadline: "Mensal", icon: "school" },
    { id: 2, service: "ITTV SMART MINI 32c", value: "R$ 10,00", deadline: "Mensal", icon: "smart_display" },
    { id: 3, service: "ITTV SMART TOTAL 108c", value: "R$ 20,00", deadline: "Mensal", icon: "smart_display" },
    { id: 4, service: "LEVEDUCA+WATCH+PARAMOUNT", value: "R$ 19,90", deadline: "Mensal", icon: "movie" },
    { id: 5, service: "LEVEDUCA+WATCH+PARAMOUNT+ITTV 108c", value: "R$ 29,90", deadline: "Mensal", icon: "movie" },
    { id: 6, service: "LEVEDUCA+WATCH+PARAMOUNT+MAX", value: "R$ 39,90", deadline: "Mensal", icon: "movie" },
    { id: 7, service: "LEVEDUCA+WATCH+PARAMOUNT+MAX+ITTV 108c", value: "R$ 66,00", deadline: "Mensal", icon: "movie" },
    { id: 8, service: "LEVEDUCA+WATCH+PARAMOUNT+MAX+PREMIERE+ITTV 102c", value: "R$ 126,00", deadline: "Mensal", icon: "sports_soccer" },
];
