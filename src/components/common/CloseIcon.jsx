// Ícone de fechar no mesmo traço do conjunto de `Icons.jsx` (1.8, round).
// Existe separado porque o sheet "Mais" usava a ligadura "close" do Material
// Symbols, que o leitor de tela anunciava como a palavra "close".
export function CloseIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ display: 'flex' }}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export default CloseIcon;
