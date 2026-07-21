## 1. Container Principal

- [ ] 1.1 Converter `className="bg-white border border-[#E4ECF5] rounded-[20px] ..."` para `style={{ backgroundColor: C.surface, border: \`1px solid ${C.line}\` }}` mantendo as demais classes não-cor

## 2. Estado de Loading

- [ ] 2.1 Converter o spinner: remover `border-[#EAF4FF] border-t-[#4A9EF5]`, adicionar `style={{ borderColor: C.accentSoft, borderTopColor: C.accent }}`
- [ ] 2.2 Converter texto de loading: remover `text-[#475467]`, adicionar `style={{ color: C.ink2 }}`

## 3. Estado de Erro

- [ ] 3.1 Converter ícone de erro: remover `text-[#E84545]`, adicionar `style={{ color: C.danger }}`
- [ ] 3.2 Converter título de erro: remover `text-[#0B1B2E]`, adicionar `style={{ color: C.ink }}`
- [ ] 3.3 Converter texto da mensagem de erro: remover `text-[#475467]`, adicionar `style={{ color: C.ink2 }}`
- [ ] 3.4 Converter botão "Tentar Novamente": remover classes Tailwind `from-[#1F5BA8] to-[#4A9EF5] shadow-[#4A9EF5]/30`, adicionar `style={{ background: \`linear-gradient(to right, ${C.accentDeep}, ${C.accent})\`, boxShadow: \`0 4px 12px ${tone(C.accent, 0.3)}\` }}`

## 4. Estado Vazio

- [ ] 4.1 Converter ícone vazio: remover `text-[#8896A8]`, adicionar `style={{ color: C.muted }}`
- [ ] 4.2 Converter título vazio: remover `text-[#0B1B2E]`, adicionar `style={{ color: C.ink }}`
- [ ] 4.3 Converter texto descritivo vazio: remover `text-[#475467]`, adicionar `style={{ color: C.ink2 }}`

## 5. Células da Tabela

- [ ] 5.1 Converter coluna `#ID`: remover `text-[#4A9EF5]`, adicionar `style={{ color: C.accent }}`
- [ ] 5.2 Converter coluna `Mensagem`: remover `text-[#475467]`, adicionar `style={{ color: C.ink2 }}`
- [ ] 5.3 Converter coluna `Data`: remover `text-[#475467]`, adicionar `style={{ color: C.ink2 }}`

## 6. Verificação

- [ ] 6.1 Verificar visual no tema light: sem regressão de aparência
- [ ] 6.2 Verificar visual em pelo menos um tema dark (cyber ou aurora): cores corretas aplicadas
- [ ] 6.3 Confirmar que `tone` já está importado ou usar a função local já definida no arquivo
