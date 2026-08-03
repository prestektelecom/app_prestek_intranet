// Chaves de funcionalidade — desligam recursos sem remover código.

/**
 * Comparador de planos.
 *
 * Desativado a pedido: a ideia é retomar depois, com melhorias. O componente
 * (`services/PlanoComparador.jsx`) e o motor de recomendação continuam no repo
 * e funcionando — só não são montados nem oferecidos na interface.
 *
 * Para reativar: mude para `true`. Nada mais precisa ser tocado. Os cards e o
 * modal de detalhes escondem o botão de comparar quando não recebem
 * `onToggleCompare`, então a flag se propaga sozinha a partir do
 * `ServicesDirectory`.
 */
export const COMPARADOR_PLANOS_ATIVO = false;
