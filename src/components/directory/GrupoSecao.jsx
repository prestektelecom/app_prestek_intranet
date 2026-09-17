import React from 'react';

/**
 * Cabeçalho de uma seção de grupo dentro de um setor filtrado.
 *
 * O grupo IXC (`usuarios.id_grupo`) é permissão de sistema, não lotação — ele
 * ATRAVESSA setores: o grupo de supervisão aparece em 10 setores diferentes, o
 * técnico em 5. Por isso ele entra como sub-eixo DENTRO do setor, e não como
 * substituto dele: fora do contexto de um setor, "Grupo 56" agrupa dez chefias
 * que não têm nada a ver umas com as outras.
 *
 * O rótulo é `Grupo <id>` quando ninguém cadastrou um nome em `grupos_nomes` —
 * o IXC nega a leitura de `usuarios_grupo` para o token da intranet, então o id
 * cru é tudo o que existe. É pouco, mas identifica a célula e não mente.
 */
export default function GrupoSecao({ nome, total, supervisor, children, classeLista }) {
    return (
        <section className="flex flex-col gap-3">
            {/* `text-muted` (`--foreground-muted`) reprova como texto no tema
                claro (~3:1 contra `--background`); `text-faint`, apesar do
                nome, é o token com MAIS contraste dos dois — mesmo par
                ink2/muted já corrigido em outras fases. */}
            {/* h2: quando esta seção existe, EmployeeCard já recebe
                headingLevel=3 (Directory.jsx) para ficar aninhado sob ela —
                h1 do hero → h2 aqui → h3 do nome, sem pular nível. */}
            <h2 className="m-0 flex items-baseline gap-2 font-mono text-[13px] font-extrabold uppercase tracking-[0.1em] text-faint">
                {supervisor && (
                    <span
                        className="material-symbols-outlined self-center text-[15px] text-[var(--accent)]"
                        aria-hidden="true"
                    >
                        stars
                    </span>
                )}
                <span className="truncate normal-case tracking-normal text-foreground">{nome}</span>
                <span className="tabular-nums">{total}</span>
            </h2>
            {/* <ul> por seção, não uma só para a página inteira: o leitor de tela
                anuncia "lista com N itens" por grupo, que é justamente a
                contagem escrita no cabeçalho ao lado. */}
            <ul className={classeLista}>{children}</ul>
        </section>
    );
}
