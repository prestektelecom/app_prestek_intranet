# Scripts de diagnóstico (não vão para produção)

Scripts avulsos usados para investigar o IXC e o banco. **Não fazem parte da aplicação.**
Não copiar nem executar no servidor de produção.

- Rodar sempre a partir de `backend/` (o `.env` é lido da pasta atual): `node _diagnostico/<script>.js`.
- Os que escrevem no IXC exigem `CONFIRMAR_ESCRITA_IXC=sim` e atingem o ambiente real (não há staging).
- Podem estar desatualizados em relação ao IXC atual; use como referência de como a API responde.
