## 1. Helper e Sanitização de Telefones

- [x] 1.1 Criar a função auxiliar `getWhatsAppUrl(celular)` no escopo de `Directory.jsx`
- [x] 1.2 Implementar remoção de caracteres não numéricos na função `getWhatsAppUrl`
- [x] 1.3 Implementar lógica para prefixar o DDI `55` se o número sanitizado possuir 10 ou 11 dígitos

## 2. Refatoração do Botão no EmployeeCardV2

- [x] 2.1 Alterar a renderização condicional do botão de contato baseado na presença de `celular` ou `ramal`
- [x] 2.2 Inserir SVG inline do logotipo oficial do WhatsApp com cores estilizadas correspondentes ao hover
- [x] 2.3 Atualizar o texto do botão para "WhatsApp" (quando celular disponível) ou "Ligar" (quando apenas ramal disponível)
- [x] 2.4 Ajustar o atributo `href` para apontar dinamicamente para o link do WhatsApp (com `target="_blank"` e `rel="noopener noreferrer"`) ou link de `tel:${ramal}`
- [x] 2.5 Atualizar a validação e fallback visual (estado desabilitado) se o colaborador não tiver celular nem ramal

## 3. Testes e Validação

- [x] 3.1 Testar comportamento do botão para colaboradores que possuem telefone celular cadastrado
- [x] 3.2 Testar comportamento do botão para colaboradores que possuem apenas ramal cadastrado
- [x] 3.3 Testar comportamento do botão para colaboradores sem contatos (celular ou ramal) cadastrados
- [x] 3.4 Executar `npm run build` para garantir que as alterações não quebram o build de produção
