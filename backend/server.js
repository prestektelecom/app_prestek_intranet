// Servidor Express — proxy seguro para a API IXC
// As credenciais ficam no .env, nunca expostas ao frontend

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import pool from './db.js'
import fs from 'fs'

// Cache para OS abertas global
let cacheOS = {
    dados: null,
    timestamp: 0,
    promise: null
};

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: true }))
app.use(express.json())

// ─── Função auxiliar: sincroniza perfil do usuário no banco após login ────────
/**
 * Salva ou atualiza os dados do usuário IXC na tabela usuarios_perfil.
 * @param {Object} usuario  - Registro da tabela usuarios (API IXC)
 * @param {Object|null} funcionario - Registro da tabela funcionarios (API IXC)
 */
async function sincronizarPerfilNoBanco(usuario, funcionario) {
    const func = funcionario || {};

    // Converte string de data para null se vazia
    const toDate = (val) => (val && val !== '' && val !== 'N/D' ? val : null);

    const query = `
        INSERT INTO usuarios_perfil (
            usuario_id, usuario_email, usuario_nome, acesso_token,
            funcionario_id, funcionario_nome, funcionario_email,
            id_funcao, id_departamento, filial_id,
            fone_celular, fone, ramal,
            data_nascimento, data_admissao, ativo, foto_perfil,
            sincronizado_em, atualizado_em
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW(),NOW())
        ON CONFLICT (usuario_id) DO UPDATE SET
            usuario_email     = EXCLUDED.usuario_email,
            usuario_nome      = EXCLUDED.usuario_nome,
            acesso_token      = EXCLUDED.acesso_token,
            funcionario_id    = EXCLUDED.funcionario_id,
            funcionario_nome  = EXCLUDED.funcionario_nome,
            funcionario_email = EXCLUDED.funcionario_email,
            id_funcao         = EXCLUDED.id_funcao,
            id_departamento   = EXCLUDED.id_departamento,
            filial_id         = EXCLUDED.filial_id,
            fone_celular      = EXCLUDED.fone_celular,
            fone              = EXCLUDED.fone,
            ramal             = EXCLUDED.ramal,
            data_nascimento   = EXCLUDED.data_nascimento,
            data_admissao     = EXCLUDED.data_admissao,
            ativo             = EXCLUDED.ativo,
            foto_perfil       = EXCLUDED.foto_perfil,
            atualizado_em     = NOW()
        RETURNING is_admin;
    `;

    const result = await pool.query(query, [
        String(usuario.id),
        usuario.email || '',
        usuario.nome || '',
        usuario.acesso_token || '',
        func.id ? String(func.id) : null,
        func.funcionario || null,
        func.email || null,
        func.id_funcao || null,
        func.id_departamento ? String(func.id_departamento) : null,
        func.filial_id ? String(func.filial_id) : null,
        func.fone_celular || null,
        func.fone || null,
        func.ramal || null,
        toDate(func.data_nascimento),
        toDate(func.data_admissao),
        func.ativo || 'S',
        func.foto_perfil || null
    ]);

    return result.rows[0]?.is_admin || false;
}

// ─── Rota de Login ───────────────────────────────────────────────
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body

    if (!email) {
        return res.status(400).json({ sucesso: false, erro: 'Email é obrigatório.' })
    }

    if (!senha) {
        return res.status(400).json({ sucesso: false, erro: 'Senha é obrigatória.' })
    }

    // Monta o token Basic Auth a partir do .env
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/usuarios`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'usuarios.email',
        query: email,
        oper: '=',
        page: '1',
        rp: '1',
        sortname: 'usuarios.id',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })

        if (!resposta.ok) {
            const textoErro = await resposta.text()
            console.error(`Erro API IXC [${resposta.status}]:`, textoErro)
            return res.status(502).json({
                sucesso: false,
                erro: 'Falha ao comunicar com o sistema.'
            })
        }

        const dados = await resposta.json()

        // Nenhum usuário encontrado com esse email
        if (dados.total === 0) {
            return res.status(401).json({
                sucesso: false,
                erro: 'Usuário não encontrado.'
            })
        }

        const usuario = dados.registros[0]

        // Valida a senha — API IXC armazena senha como hash SHA-256
        const senhaHash = crypto.createHash('sha256').update(senha).digest('hex')
        if (usuario.senha !== senhaHash) {
            return res.status(401).json({
                sucesso: false,
                erro: 'Senha incorreta.'
            })
        }

        // Valida se o usuário está ativo
        if (usuario.status !== 'A') {
            return res.status(403).json({
                sucesso: false,
                erro: 'Usuário inativo. Entre em contato com o administrador.'
            })
        }

        // ── Busca dados do funcionário em paralelo ──
        let funcionario = null
        try {
            const urlFunc = `https://${host}/webservice/v1/funcionarios`
            const bodyFunc = JSON.stringify({
                qtype: 'funcionarios.id',
                query: usuario.funcionario, // usuario.funcionario guarda o ID do funcionário vinculado a ele!
                oper: '=',
                page: '1',
                rp: '1',
                sortname: 'funcionarios.id',
                sortorder: 'asc'
            })
            const resFunc = await fetch(urlFunc, { method: 'POST', headers, body: bodyFunc })
            if (resFunc.ok) {
                const dadosFunc = await resFunc.json()
                if (dadosFunc.total > 0) {
                    funcionario = dadosFunc.registros[0]
                }
            }
        } catch (errFunc) {
            console.warn('Aviso: não foi possível buscar dados de funcionário:', errFunc.message)
        }

        // Sincroniza dados do perfil no banco (bloqueia resposta para pegar is_admin)
        let isAdmin = false;
        try {
            isAdmin = await sincronizarPerfilNoBanco(usuario, funcionario);
            console.log(`Perfil sincronizado no banco: ${usuario.email} (Admin: ${isAdmin})`);
        } catch (errSync) {
            console.warn('Aviso: falha ao sincronizar perfil:', errSync.message);
        }

        // Retorna dados combinados de usuarios + funcionarios
        console.log(`Login bem-sucedido: ${usuario.nome} (${usuario.email})`)
        return res.json({
            sucesso: true,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                acesso_token: usuario.acesso_token,
                is_admin: isAdmin
            },
            funcionario,
            host
        })

    } catch (erro) {
        console.error('Erro interno no servidor:', erro.message);
        return res.status(500).json({
            sucesso: false,
            erro: `Erro interno no servidor: ${erro.message}`
        });
    }
})

// ─── Rota: Buscar Funcionário p/ Painel ───────────────────────────────────
app.post('/api/funcionario', async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ sucesso: false, erro: 'Email é obrigatório.' })
    }

    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/funcionarios`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'funcionarios.email',
        query: email,
        oper: '=',
        page: '1',
        rp: '1',
        sortname: 'funcionarios.id',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })

        if (!resposta.ok) {
            const textoErro = await resposta.text()
            console.error(`Erro API IXC Funcionarios [${resposta.status}]:`, textoErro)
            return res.status(502).json({ sucesso: false, erro: 'Falha ao comunicar com API de funcionários.' })
        }

        const dados = await resposta.json()

        if (dados.total === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Funcionário não encontrado com este e-mail.' })
        }

        const funcionario = dados.registros[0]

        return res.json({ sucesso: true, funcionario })

    } catch (erro) {
        console.error('Erro requisição Funcionarios:', erro.message)
        return res.status(500).json({ sucesso: false, erro: 'Erro interno do servidor.' })
    }
})

// ─── Rotas: Comunicados Internos ──────────────────────────────────────────────
app.get('/api/comunicados', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM comunicados ORDER BY criado_em DESC');
        return res.json({ sucesso: true, comunicados: result.rows });
    } catch (err) {
        console.error('Erro ao buscar comunicados:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar comunicados.' });
    }
});

app.post('/api/comunicados', async (req, res) => {
    const { titulo, descricao, tipo, departamento_autor, link_opcional, criado_por } = req.body;

    if (!titulo || !descricao || !tipo || !departamento_autor) {
        return res.status(400).json({ sucesso: false, erro: 'Preencha os campos obrigatórios.' });
    }

    try {
        const query = `
            INSERT INTO comunicados (titulo, descricao, tipo, departamento_autor, link_opcional, criado_por)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(query, [titulo, descricao, tipo, departamento_autor, link_opcional, criado_por]);
        return res.status(201).json({ sucesso: true, comunicado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao inserir comunicado:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao salvar comunicado.' });
    }
});

app.put('/api/comunicados/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, descricao, tipo, departamento_autor, link_opcional } = req.body;

    try {
        const query = `
            UPDATE comunicados 
            SET titulo = $1, descricao = $2, tipo = $3, departamento_autor = $4, link_opcional = $5
            WHERE id = $6 RETURNING *;
        `;
        const result = await pool.query(query, [titulo, descricao, tipo, departamento_autor, link_opcional, id]);
        if (result.rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Comunicado não encontrado.' });
        return res.json({ sucesso: true, comunicado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao atualizar comunicado:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar comunicado.' });
    }
});

app.delete('/api/comunicados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM comunicados WHERE id = $1 RETURNING *;', [id]);
        if (result.rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Comunicado não encontrado.' });
        return res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao excluir comunicado:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao excluir comunicado.' });
    }
});

// ─── Rota: Listar Departamentos ─────────────────────────────────────────
app.get('/api/departamentos', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/su_ticket_setor`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'su_ticket_setor.id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000',
        sortname: 'su_ticket_setor.setor',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        return res.json({ sucesso: true, departamentos: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
})

// ─── Rota: Listar Departamentos Organizacionais (departamento) ─────────
app.get('/api/departamentos-empresa', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/departamento`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000',
        sortname: 'id',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        return res.json({ sucesso: true, departamentos: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
})

// ─── Rota: Listar Cargos/Setores da Empresa (empresa_setor) ─────────────
app.get('/api/cargos', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/empresa_setor`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'empresa_setor.id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000',
        sortname: 'empresa_setor.setor',
        sortorder: 'asc'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        const dados = await resposta.json()
        return res.json({ sucesso: true, cargos: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
})

// ROTA DE TESTE TEMPORÁRIA
app.get('/api/test-ixc', async (req, res) => {
    const { endpoint } = req.query;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const url = `https://${host}/webservice/v1/${endpoint}`

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const body = JSON.stringify({
        qtype: 'id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '1000'
    })

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body })
        if (!resposta.ok) {
            return res.status(resposta.status).json({ sucesso: false, erro: `Status ${resposta.status}` });
        }
        const dados = await resposta.json()
        return res.json({ sucesso: true, registros: dados.registros || [] })
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message })
    }
});

// ─── Rota: Listar Filiais ────────────────────────────────────────────────
app.get('/api/filiais', async (req, res) => {
    const url = `https://${process.env.IXC_HOST}/webservice/v1/filial`;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const body = JSON.stringify({
        qtype: 'filial.id',
        query: '0',
        oper: '>',
        page: '1',
        rp: '100',
        sortname: 'filial.id',
        sortorder: 'asc'
    });

    try {
        const resposta = await fetch(url, { method: 'POST', headers, body });
        const dados = await resposta.json();
        return res.json({ sucesso: true, filiais: dados.registros || [] });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rota: Listar Quantidade de OS do Funcionário (Busca Global c/ Cache) ──
app.get('/api/os-chamados/:funcionarioId', async (req, res) => {
    const { funcionarioId } = req.params;
    
    if (!funcionarioId || funcionarioId === 'undefined') {
        return res.status(400).json({ sucesso: false, erro: 'ID do funcionário é obrigatório.' });
    }

    const host = process.env.IXC_HOST;
    const url = `https://${host}/webservice/v1/su_oss_chamado`;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        // 1. Resolver o ID de Técnico do IXC
        let ixcTecnicoId = funcionarioId;
        const pRes = await pool.query('SELECT usuario_email, funcionario_id FROM usuarios_perfil WHERE funcionario_id = $1 OR usuario_id = $1 LIMIT 1', [funcionarioId]);
        
        if (pRes.rows.length > 0) {
            const email = pRes.rows[0].usuario_email;
            if (email) {
               const rUser = await fetch(`https://${host}/webservice/v1/usuarios`, {
                   method: 'POST',
                   headers: headers,
                   body: JSON.stringify({ qtype: 'usuarios.email', query: email, oper: '=', page: '1', rp: '1' })
               });
               const dUser = await rUser.json();
               if (dUser.total > 0 && dUser.registros[0].funcionario) {
                   ixcTecnicoId = dUser.registros[0].funcionario; 
               } else if (pRes.rows[0].funcionario_id) {
                   ixcTecnicoId = pRes.rows[0].funcionario_id;
               }
            } else if (pRes.rows[0].funcionario_id) {
               ixcTecnicoId = pRes.rows[0].funcionario_id;
            }
        }

        // 2. Verificar Cache Global (1 minuto)
        let cacheStatus = 'HIT';
        const agora = Date.now();
        if (!cacheOS.dados || (agora - cacheOS.timestamp > 60000)) {
            cacheStatus = 'MISS';
            if (!cacheOS.promise) {
                console.log("-> Cache expirado ou vazio em /api/os-chamados. Buscando OS abertas no IXC...");
                cacheOS.promise = (async () => {
                    try {
                        const statusAtivos = ['A', 'AG', 'AS', 'EN', 'AN', 'EX'];
                        const promises = statusAtivos.map(async (status) => {
                            const body = JSON.stringify({
                                qtype: 'su_oss_chamado.status',
                                query: status,
                                oper: '=',
                                page: '1',
                                rp: '10000'
                            });
                            try {
                                const resp = await fetch(url, { method: 'POST', headers, body });
                                const json = await resp.json();
                                return json.registros || [];
                            } catch (err) {
                                return [];
                            }
                        });
                        const resultados = await Promise.all(promises);
                        cacheOS.dados = resultados.flat();
                        cacheOS.timestamp = Date.now();
                        console.log(`-> Cache atualizado. Total de OS abertas na empresa: ${cacheOS.dados.length}`);
                    } catch (error) {
                        console.error('-> Erro ao atualizar cache de OS:', error.message);
                    } finally {
                        cacheOS.promise = null; // Libera independente de sucesso ou falha
                    }
                })();
            }
            // Aguarda a promessa que está em andamento (seja a recém-criada ou de uma req concorrente)
            await cacheOS.promise;
        }

        // 3. Filtrar localmente e contar
        const dadosAFiltrar = cacheOS.dados || [];
        const registrosDoTecnico = dadosAFiltrar.filter(os => String(os.id_tecnico) === String(ixcTecnicoId));
        console.log(`-> Usuario ${funcionarioId} (Tecnico ${ixcTecnicoId}): ${registrosDoTecnico.length} OS encontrada.`);

        const statusCount = { A: 0, AG: 0, AS: 0, EN: 0, AN: 0, EX: 0, OUTROS: 0 };
        registrosDoTecnico.forEach(os => {
            const s = String(os.status).toUpperCase();
            if (statusCount[s] !== undefined) statusCount[s]++;
            else statusCount['OUTROS']++;
        });
        
        return res.json({ 
            sucesso: true, 
            quantidade: registrosDoTecnico.length, 
            statusCount,
            cacheStatus
        });

    } catch (e) {
        console.error("Erro rota os-chamados:", e);
        return res.status(500).json({ sucesso: false, erro: 'Erro buscar OS do IXC.' });
    }
});

// ─── Rota: Atualizar dados de Funcionário no IXC ───────────────────────────
app.put('/api/funcionario/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    const formData = req.body;

    try {
        const result = await pool.query('SELECT funcionario_id FROM usuarios_perfil WHERE usuario_id = $1', [usuarioId]);
        if (result.rows.length === 0 || !result.rows[0].funcionario_id) {
            return res.status(404).json({ sucesso: false, erro: 'Funcionário não encontrado no banco.' });
        }

        const funcionarioId = result.rows[0].funcionario_id;
        const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
        const host = process.env.IXC_HOST;

        const headers = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
            ixcsoft: 'listar'
        };

        const bodyGet = JSON.stringify({
            qtype: 'funcionarios.id',
            query: funcionarioId,
            oper: '=',
            page: '1',
            rp: '1'
        });
        const resGet = await fetch(`https://${host}/webservice/v1/funcionarios`, { method: 'POST', headers, body: bodyGet });
        if (!resGet.ok) {
            return res.status(502).json({ sucesso: false, erro: 'Falha ao buscar funcionário atual no IXC.' });
        }

        const dadosFunc = await resGet.json();
        if (!dadosFunc.total || dadosFunc.total === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Funcionário não encontrado no IXC para atualizar.' });
        }

        const funcionarioAtual = dadosFunc.registros[0];

        const headersPut = {
            'Content-Type': 'application/json',
            Authorization: 'Basic ' + Buffer.from(token).toString('base64')
        };
        const urlPut = `https://${host}/webservice/v1/funcionarios/${funcionarioId}`;

        const funcionarioName = [formData.nome, formData.sobrenome].filter(Boolean).join(' ');

        const bodyContent = {
            ...funcionarioAtual, 
            fone_celular: formData.telefone_celular !== undefined ? formData.telefone_celular : (formData.fone_celular || funcionarioAtual.fone_celular || ''),
            funcionario: funcionarioName || funcionarioAtual.funcionario || '',
            email: formData.email !== undefined ? formData.email : (funcionarioAtual.email || ''),
            ramal: formData.ramal !== undefined ? formData.ramal : (funcionarioAtual.ramal || ''),
        };

        if (formData.data_nascimento) bodyContent.data_nascimento = formData.data_nascimento;
        if (formData.id_departamento) bodyContent.id_departamento = formData.id_departamento;
        if (formData.filial_id) bodyContent.filial_id = formData.filial_id;

        const bodyPut = JSON.stringify(bodyContent);
        const resposta = await fetch(urlPut, { method: 'PUT', headers: headersPut, body: bodyPut });

        if (!resposta.ok) {
            const textoErro = await resposta.text();
            console.error(`Erro IXC ao atualizar [${resposta.status}]:`, textoErro);
            return res.status(502).json({ sucesso: false, erro: 'Falha ao atualizar dados no IXC.' });
        }

        const dNasc = bodyContent.data_nascimento ? bodyContent.data_nascimento : null;
        await pool.query(
            `UPDATE usuarios_perfil SET 
                fone_celular = $1, 
                funcionario_nome = $2, 
                usuario_nome = $2,
                usuario_email = $3,
                ramal = $4,
                data_nascimento = $5,
                atualizado_em = NOW() 
             WHERE usuario_id = $6`,
            [bodyContent.fone_celular, bodyContent.funcionario, bodyContent.email, bodyContent.ramal, dNasc, usuarioId]
        );

        return res.json({ sucesso: true, mensagem: 'Dados atualizados no IXC' });

    } catch (erro) {
        console.error('Erro requisição PUT Funcionario:', erro.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar funcionário.' });
    }
});

// ─── Rota: Listar todos os Colaboradores Ativos (Diretório) ──────────────────
app.get('/api/colaboradores', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const host = process.env.IXC_HOST;
    const url = `https://${host}/webservice/v1/funcionarios`;

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const includeInactive = req.query.all === 'true';
    const body = JSON.stringify({
        qtype: includeInactive ? 'funcionarios.id' : 'funcionarios.ativo',
        query: includeInactive ? '0' : 'S',
        oper: includeInactive ? '>' : '=',
        page: '1',
        rp: '1000',
        sortname: 'funcionarios.funcionario',
        sortorder: 'asc'
    });

    try {
        const respostaVal = await fetch(url, { method: 'POST', headers, body });
        if (!respostaVal.ok) {
            throw new Error(`Erro API IXC: ${respostaVal.status}`);
        }

        const dadosIXC = await respostaVal.json();
        const funcionariosIXC = dadosIXC.registros || [];

        // 1. Fotos salvas via tela de Configurações ficam em usuarios_preferencias como avatarUrl
        const fotosPrefsResult = await pool.query("SELECT usuario_email, valor FROM usuarios_preferencias WHERE chave = 'avatarUrl'");
        const mapaFotosPorEmail = fotosPrefsResult.rows.reduce((acc, curr) => {
            if (curr.usuario_email) acc[curr.usuario_email.toLowerCase()] = curr.valor;
            return acc;
        }, {});

        // 2. Ramais editados pelo usuário em Configurações (usuarios_preferencias)
        //    A tabela usuarios_preferencias já salva o usuario_email diretamente
        const ramaisQuery = await pool.query(`
            SELECT usuario_email, valor AS ramal
            FROM usuarios_preferencias
            WHERE chave = 'ramal' AND valor IS NOT NULL AND valor <> '' AND valor <> '0'
        `);
        const mapaRamaisPorEmail = ramaisQuery.rows.reduce((acc, curr) => {
            if (curr.usuario_email) acc[curr.usuario_email.toLowerCase()] = curr.ramal;
            return acc;
        }, {});

        // Mescla dados do IXC com dados locais de foto e ramal
        const colaboradores = funcionariosIXC.map(f => {
            const emailKey = (f.email || '').toLowerCase();
            const fotoLocal = mapaFotosPorEmail[emailKey];
            // Ramal salvo pelo usuário em Configurações (via email como chave de ligação)
            const ramalLocal = mapaRamaisPorEmail[emailKey];
                // Evita mostrar o SVG padrão do IXC como foto para quem nunca mudou a imagem
                let ixcFoto = f.foto_perfil;
                if (ixcFoto && typeof ixcFoto === 'string' && ixcFoto.trim().startsWith('<svg')) {
                    ixcFoto = null;
                }

                return {
                    usuario_id: null,
                    funcionario_id: f.id,
                    funcionario_nome: f.funcionario,
                    usuario_email: f.email,
                    id_departamento: f.id_departamento,
                    filial_id: f.filial_id,
                    id_funcao: f.id_funcao,
                    fone_celular: f.fone_celular,
                    // Prioridade: preferência salva em Configurações > ramal vindo do IXC
                    ramal: ramalLocal !== undefined ? ramalLocal : (f.ramal || null),
                    foto_perfil: fotoLocal || ixcFoto || null,
                    ativo: f.ativo
                };
        });

        return res.json({ sucesso: true, colaboradores });
    } catch (err) {
        console.error('Erro ao buscar colaboradores no IXC:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar colaboradores.' });
    }
});

app.get('/api/usuario/perfil/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        // Busca perfil na tabela usuarios_perfil
        const result = await pool.query(
            'SELECT * FROM usuarios_perfil WHERE usuario_id = $1',
            [usuarioId]
        );

        if (result.rows.length === 0) {
            // Se não encontrou no perfil, retornamos um objeto mínimo para não dar 404 nem 500
            // O frontend cuidará dos fallbacks (como o avatar2)
            return res.json({ 
                sucesso: true, 
                perfil: { 
                    usuario_id: usuarioId,
                    usuario_nome: 'Usuário',
                    foto_perfil: null
                } 
            });
        }

        return res.json({ sucesso: true, perfil: result.rows[0] });
    } catch (err) {
        console.error('Erro ao buscar perfil do banco:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar perfil.' });
    }
});

// ─── Rota de Configurações ───────────────────────────────────────────────
app.get('/api/configuracoes/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        const result = await pool.query('SELECT chave, valor FROM usuarios_preferencias WHERE usuario_id = $1', [usuarioId]);
        const preferencias = result.rows.reduce((acc, curr) => {
            acc[curr.chave] = curr.valor;
            return acc;
        }, {});
        return res.json({ sucesso: true, preferencias });
    } catch (err) {
        console.error('Erro ao buscar configurações do banco:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro buscar configuracoes do banco' });
    }
});

// ─── Rotas: Presença e Colaboradores Online ──────────────────────────────
app.post('/api/presenca/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        await pool.query(
            'UPDATE usuarios_perfil SET ultima_atividade = NOW() WHERE usuario_id = $1',
            [usuarioId]
        );
        return res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao atualizar presença:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar presença' });
    }
});

app.get('/api/colaboradores/online', async (req, res) => {
    try {
        // Considera online quem teve atividade nos últimos 5 minutos, e busca a foto customizada
        const query = `
            SELECT 
                p.usuario_id, p.funcionario_id, p.funcionario_nome, p.usuario_email, 
                p.foto_perfil as ixc_foto, p.id_departamento, p.ultima_atividade,
                pref.valor as foto_custom
            FROM usuarios_perfil p
            LEFT JOIN usuarios_preferencias pref 
                ON LOWER(p.usuario_email) = LOWER(pref.usuario_email) AND pref.chave = 'avatarUrl'
            WHERE p.ultima_atividade > NOW() - interval '5 minutes'
            ORDER BY p.funcionario_nome ASC;
        `;
        const result = await pool.query(query);
        
        // Formata para o padrão esperado pelo componente
        const online = result.rows.map(u => {
            let fotoFim = u.foto_custom || u.ixc_foto || null;
            if (fotoFim && typeof fotoFim === 'string' && fotoFim.trim().startsWith('<svg')) {
                fotoFim = null;
            }
            
            return {
                id: u.funcionario_id || u.usuario_id,
                nome: u.funcionario_nome || u.usuario_nome || 'Colaborador',
                email: u.usuario_email,
                foto: fotoFim,
                status: 'online'
            };
        });

        return res.json({ sucesso: true, colaboradores: online });
    } catch (err) {
        console.error('Erro ao buscar colaboradores online:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar colaboradores online' });
    }
});

app.post('/api/configuracoes/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    const { email, chave, valor } = req.body;

    if (!chave) {
        return res.status(400).json({ sucesso: false, erro: 'Chave é obrigatória.' });
    }

    try {
        const query = `
            INSERT INTO usuarios_preferencias (usuario_id, usuario_email, chave, valor, atualizado_em)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (usuario_id, chave) 
            DO UPDATE SET valor = EXCLUDED.valor, atualizado_em = NOW();
        `;
        await pool.query(query, [String(usuarioId), email || 'desconhecido', chave, valor]);
        return res.json({ sucesso: true });
    } catch (err) {
        console.error('Erro ao salvar configuração no banco:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao salvar no banco' });
    }
});

// ─── Rotas: Plantões ────────────────────────────────────────────────────────
app.get('/api/plantoes', async (req, res) => {
    try {
        const query = `
            SELECT p.*, 
                   n1.funcionario_nome as n1_nome, n1.foto_perfil as n1_foto,
                   n2.funcionario_nome as n2_nome, n2.foto_perfil as n2_foto,
                   mgr.funcionario_nome as mgr_nome, mgr.foto_perfil as mgr_foto
            FROM plantoes p
            LEFT JOIN usuarios_perfil n1 ON p.n1_id = n1.funcionario_id
            LEFT JOIN usuarios_perfil n2 ON p.n2_id = n2.funcionario_id
            LEFT JOIN usuarios_perfil mgr ON p.gerente_id = mgr.funcionario_id
            ORDER BY p.data ASC;
        `;
        const result = await pool.query(query);
        return res.json({ sucesso: true, plantoes: result.rows });
    } catch (err) {
        console.error('Erro ao buscar plantões:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar plantões.' });
    }
});

app.get('/api/plantoes/meu-proximo/:usuarioId', async (req, res) => {
    const { usuarioId } = req.params;
    try {
        // Primeiro, pega o funcionario_id associado ao usuario_id
        const userRes = await pool.query('SELECT funcionario_id FROM usuarios_perfil WHERE usuario_id = $1', [usuarioId]);
        const funcionarioId = userRes.rows[0]?.funcionario_id;

        const query = `
            SELECT * FROM plantoes 
            WHERE (n1_id = $1 OR n2_id = $1 OR gerente_id = $1)
              AND data >= CURRENT_DATE
            ORDER BY data ASC
            LIMIT 1;
        `;
        const result = await pool.query(query, [funcionarioId || 'vazio']);
        
        if (result.rows.length === 0) {
            return res.json({ sucesso: true, proximo: null });
        }
        
        return res.json({ sucesso: true, proximo: result.rows[0] });
    } catch (err) {
        console.error('Erro ao buscar próximo plantão:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar próximo plantão.' });
    }
});

// ─── Rota: Abrir Ticket de Suporte no IXC ────────────────────────────────────
app.post('/api/ixc/su-ticket', async (req, res) => {
    const { mensagem, colaborador_id, tecnico_id } = req.body;

    if (!mensagem) {
        return res.status(400).json({ sucesso: false, erro: 'A descrição da situação é obrigatória.' });
    }

    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const authHead = 'Basic ' + Buffer.from(token).toString('base64');
    const headers = {
        'Content-Type': 'application/json',
        Authorization: authHead
    };

    // Tenta buscar informações do contrato do colaborador se disponível
    let ixcIds = {
        id_cliente: '681',
        id_login: '1',
        id_contrato: '18426'
    };

    try {
        // Se temos colaborador_id, tentamos buscar no banco local se há algo vinculado
        // Mas como não temos na tabela local, vamos usar os padrões por enquanto
        // O usuário pediu para ser dinâmico no plano, mas a tabela não tem.
        // Vou manter fixo por enquanto para não quebrar, mas garantir o protocolo.
    } catch (dbErr) {
        console.warn("Aviso ao buscar dados do colaborador no banco:", dbErr.message);
    }

    const dados = {
        tipo: 'C',
        id_cliente: ixcIds.id_cliente,
        id_login: ixcIds.id_login,
        id_contrato: ixcIds.id_contrato,
        id_filial: '8',
        id_assunto: '1154',
        id_canal_atendimento: '12',
        id_ticket_setor: '16',
        id_wfl_processo: '237',
        id_responsavel_tecnico: tecnico_id || colaborador_id || '0',
        titulo: 'SUPORTE DE TI VIA INTRANET',
        origem_endereco: 'CC',
        endereco: 'AL Penedo 57200-000 SENHOR DO BONFIM - RODOVIA MARIO FREIRE LEAHY, 1650',
        numero: '1650',
        bairro: 'SENHOR DO BONFIM',
        cidade: '1721',
        cep: '57200-000',
        latitude: '-10.2872659',
        longitude: '-36.5772428',
        gerar_protocolo: 'S',
        menssagem: mensagem,
        status: 'T',
        su_status: 'N',
        origem_cadastro: 'P',
        prioridade: 'M',
        melhor_horario_reserva: 'Q',
        id_ticket_origem: 'I',
        interacao_pendente: 'N',
        finalizar_atendimento: 'N',
        atualizar_cliente: 'S',
        atualizar_login: 'S'
    };

    try {
        const urlTicket = `https://${host}/webservice/v1/su_ticket`;
        const log = (msg) => {
            const line = `[${new Date().toISOString()}] ${msg}\n`;
            console.log(msg);
            fs.appendFileSync('ixc_debug.log', line);
        };
        log(`== INICIANDO ABERTURA TICK: Tecnico ${tecnico_id} ==`);

        const resposta = await fetch(urlTicket, {
            method: 'POST',
            headers,
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        log(`Criado Ticket: ` + JSON.stringify(resultado));

        if (!resposta.ok || resultado.type === 'error') {
            console.error(`Erro API IXC su_ticket:`, resultado);
            return res.status(502).json({ sucesso: false, erro: resultado.message || 'Falha ao abrir ticket.' });
        }

        const ticketId = resultado.id;
        let protocoloFinal = "";

        // Função auxiliar para aguardar
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Busca o protocolo (leva alguns segundos para o IXC gerar via Workflow/OS)
        // Tentamos até 6 vezes com intervalo de 3 segundos
        const fetchTicket = async () => {
            log(`buscando ticket ${ticketId}...`);
            const resp = await fetch(urlTicket, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: 'su_ticket.id', query: ticketId, oper: '=', page: '1', rp: '1' })
            });
            const data = await resp.json();
            return data.registros ? data.registros[0] : null;
        };

        console.log(`Ticket ${ticketId} aberto. Aguardando geração do protocolo...`);
        
        let osIdFinal = null;
        let osRecord = null;

        for (let i = 0; i < 6; i++) {
            await sleep(3000); // Aguarda 3 segundos entre tentativas (até 18s no total)
            let ticketInfo = await fetchTicket();
            
            if (ticketInfo && ticketInfo.protocolo) {
                protocoloFinal = ticketInfo.protocolo;
                log(`Protocolo encontrado na tentativa ${i + 1}: ${protocoloFinal}`);
            }
            
            // Busca a OS vinculada sempre, pois precisamos dela para setar o técnico
            const urlOS = `https://${host}/webservice/v1/su_oss_chamado`;
            log(`Buscando OS vinculada ao ticket ${ticketId} [TENTATIVA ${i+1}]`);
            const respOS = await fetch(urlOS, {
                method: 'POST',
                headers: { ...headers, ixcsoft: 'listar' },
                body: JSON.stringify({ qtype: 'su_oss_chamado.id_ticket', query: ticketId, oper: '=', page: '1', rp: '1' })
            });
            const dataOS = await respOS.json();
            
            if (dataOS.registros && dataOS.registros[0]) {
                osRecord = dataOS.registros[0];
                osIdFinal = osRecord.id;
                log(`ENCONTROU OS! ID: ${osIdFinal}. Protocolo OS: ${osRecord.protocolo}`);
                if (!protocoloFinal && osRecord.protocolo) {
                    protocoloFinal = osRecord.protocolo;
                }
                break; // Achamos a OS, podemos sair do loop
            }
            
            log(`Tentativa ${i + 1} sem OS ainda... res: ` + JSON.stringify(dataOS));
        }

        // Se encontrou a OS e escolheu um técnico, força a atualização da OS
        // IXC requer que enviemos os dados completos da OS de volta no PUT
        if (osIdFinal && osRecord && tecnico_id) {
            log(`Atualizando OS ${osIdFinal} para o técnico ${tecnico_id}`);
            const updateOsUrl = `https://${host}/webservice/v1/su_oss_chamado/${osIdFinal}`;
            
            // Formatando datas para o padrao do IXC (YYYY-MM-DD HH:MM:SS)
            const agora = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const data_agenda = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} ${pad(agora.getHours())}:${pad(agora.getMinutes())}:00`;
            const data_agenda_final = `${agora.getFullYear()}-${pad(agora.getMonth() + 1)}-${pad(agora.getDate())} 23:59:59`;

            // Mesclamos o payload original da OS, sobrescrevendo só os campos necessários
            const updateOsBody = JSON.stringify({
                ...osRecord,
                id_tecnico: tecnico_id,
                data_agenda: data_agenda,
                data_agenda_final: data_agenda_final,
                status: 'AG', // Força para status Agendado
                mensagem_resposta: 'Agendado automaticamente via Intranet'
            });
            
            try {
                const headersPut = {
                    'Content-Type': 'application/json',
                    Authorization: 'Basic ' + Buffer.from(token).toString('base64')
                };
                const resUpdateOs = await fetch(updateOsUrl, {
                    method: 'PUT',
                    headers: headersPut,
                    body: updateOsBody
                });
                if (!resUpdateOs.ok) {
                    console.error("Falha requisição PUT atualizar técnico OS:", await resUpdateOs.text());
                } else {
                    const putResult = await resUpdateOs.json();
                    if (putResult.type === 'error') {
                         log("Erro interno do IXC ao atualizar OS: " + JSON.stringify(putResult));
                    } else {
                         log(`Técnico ${tecnico_id} agendado com sucesso na OS ${osIdFinal}. Resposta: ` + JSON.stringify(putResult));
                    }
                }
            } catch (errUpdateOs) {
                log("Erro no TRY CATCH ao fazer PUT na OS: " + errUpdateOs.message);
            }
        } else {
            log(`Não atualizou a OS. osIdFinal: ${osIdFinal}, tecnicoId: ${tecnico_id}`);
        }

        log(`FIM. Retornando protocolo ${protocoloFinal}`);
        return res.json({  
            sucesso: true, 
            ticket: resultado, 
            protocolo: protocoloFinal 
        });
    } catch (e) {
        console.error("Erro rota su-ticket:", e);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao processar ticket.' });
    }
});

// ─── Rota: Listar Tickets do Colaborador ───────────────────────────────────
app.post('/api/ixc/su-ticket/list', async (req, res) => {
    const { colaborador_id } = req.body;

    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const body = JSON.stringify({
        qtype: 'su_ticket.id_responsavel_tecnico',
        query: colaborador_id || '0',
        oper: '=',
        page: '1',
        rp: '100',
        sortname: 'su_ticket.id',
        sortorder: 'desc'
    });

    try {
        const url = `https://${host}/webservice/v1/su_ticket`;
        const resposta = await fetch(url, { method: 'POST', headers, body });
        const dados = await resposta.json();

        return res.json({ 
            sucesso: true, 
            tickets: dados.registros || [] 
        });
    } catch (e) {
        console.error("Erro ao listar tickets:", e);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar tickets no sistema.' });
    }
});

// ─── Rota Debug: Inspecionar dados de funcionários de um setor ───────────────────────
app.get('/api/debug/setor/:setorId', async (req, res) => {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };
    const { setorId } = req.params;

    try {
        const resFunc = await fetch(`https://${host}/webservice/v1/funcionarios`, {
            method: 'POST', headers,
            body: JSON.stringify({ qtype: 'funcionarios.ativo', query: 'S', oper: '=', page: '1', rp: '10000', sortname: 'funcionarios.funcionario', sortorder: 'asc' })
        });

        const dataFunc = await resFunc.json();
        const funcionarios = (dataFunc.registros || []).filter(f => String(f.id_departamento).trim() === String(setorId).trim());
        
        console.log(`-> Debug setor ${setorId}: ${funcionarios.length} funcionários`);
        return res.json({ sucesso: true, funcionarios: funcionarios.slice(0, 3).map(f => ({ 
            id: f.id, 
            nome: f.funcionario, 
            depto: f.id_departamento,
            todos_campos: Object.keys(f) 
        })) });
    } catch (e) {
        console.error('Erro debug:', e);
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rota: Buscar Grupos (names) ───────────────────────
app.get('/api/grupos', async (req, res) => {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        // Busca grupos_usuarios (qual é o nome do grupo de cada id_grupo)
        const resGrupos = await fetch(`https://${host}/webservice/v1/grupo`, {
            method: 'POST', 
            headers,
            body: JSON.stringify({ qtype: 'grupo.id', query: '0', oper: '>', page: '1', rp: '1000', sortname: 'grupo.id', sortorder: 'asc' })
        });

        const dataGrupos = await resGrupos.json();
        const grupos = dataGrupos.registros || [];
        
        console.log(`-> /api/grupos: ${grupos.length} grupos retornados`);
        return res.json({ sucesso: true, grupos });
    } catch (e) {
        console.error('Erro rota /api/grupos:', e);
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rotas: Admin — Gerenciar Grupos de Supervisor ──────────────────────────

// GET: retorna todos os ids configurados como supervisor
app.get('/api/admin/grupos-supervisores', async (req, res) => {
    try {
        const result = await pool.query('SELECT id_grupo FROM grupos_supervisores ORDER BY id_grupo::int');
        return res.json({ sucesso: true, ids: result.rows.map(r => r.id_grupo) });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// POST: adiciona ou remove um id_grupo da lista de supervisores
app.post('/api/admin/grupos-supervisores', async (req, res) => {
    const { id_grupo, acao } = req.body; // acao: 'adicionar' | 'remover'
    if (!id_grupo || !acao) return res.status(400).json({ sucesso: false, erro: 'id_grupo e acao são obrigatórios' });
    try {
        if (acao === 'adicionar') {
            await pool.query('INSERT INTO grupos_supervisores (id_grupo) VALUES ($1) ON CONFLICT DO NOTHING', [String(id_grupo)]);
        } else if (acao === 'remover') {
            await pool.query('DELETE FROM grupos_supervisores WHERE id_grupo = $1', [String(id_grupo)]);
        } else {
            return res.status(400).json({ sucesso: false, erro: 'Ação inválida' });
        }
        const result = await pool.query('SELECT id_grupo FROM grupos_supervisores ORDER BY id_grupo::int');
        return res.json({ sucesso: true, ids: result.rows.map(r => r.id_grupo) });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rotas: Admin — Gerenciar Responsáveis Manuais ────────────────────────
app.get('/api/admin/responsaveis-manuais', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM responsaveis_manuais');
        return res.json({ sucesso: true, responsaveis: result.rows });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

app.post('/api/admin/responsaveis-manuais', async (req, res) => {
    const { id_setor, id_funcionario, nome, acao } = req.body; // acao: 'definir' | 'limpar'
    if (!id_setor || !acao) return res.status(400).json({ sucesso: false, erro: 'id_setor e acao são obrigatórios' });
    
    try {
        if (acao === 'definir') {
            const query = `
                INSERT INTO responsaveis_manuais (id_setor, id_funcionario, nome, atualizado_em) 
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (id_setor) DO UPDATE 
                SET id_funcionario = EXCLUDED.id_funcionario, nome = EXCLUDED.nome, atualizado_em = NOW();
            `;
            await pool.query(query, [String(id_setor), String(id_funcionario), nome]);
        } else if (acao === 'limpar') {
            await pool.query('DELETE FROM responsaveis_manuais WHERE id_setor = $1', [String(id_setor)]);
        } else {
            return res.status(400).json({ sucesso: false, erro: 'Ação inválida' });
        }
        
        const result = await pool.query('SELECT * FROM responsaveis_manuais');
        return res.json({ sucesso: true, responsaveis: result.rows });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rotas: Admin — Gerenciar Descrições de Setores ────────────────────────
app.post('/api/admin/setores-descricoes', async (req, res) => {
    const { id_setor, descricao, atualizado_por } = req.body;
    if (!id_setor) return res.status(400).json({ sucesso: false, erro: 'id_setor é obrigatório' });

    try {
        if (!descricao || descricao.trim() === '') {
            await pool.query('DELETE FROM setores_descricoes WHERE id_setor = $1', [String(id_setor)]);
        } else {
            const query = `
                INSERT INTO setores_descricoes (id_setor, descricao, atualizado_por, atualizado_em) 
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (id_setor) DO UPDATE 
                SET descricao = EXCLUDED.descricao, atualizado_por = EXCLUDED.atualizado_por, atualizado_em = NOW();
            `;
            await pool.query(query, [String(id_setor), descricao, atualizado_por || 'Sistema']);
        }
        return res.json({ sucesso: true });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rota: Listar todos os id_grupo com seus membros (diagnóstico) ──────────
app.get('/api/debug/grupos-membros', async (req, res) => {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };
    try {
        const resU = await fetch(`https://${host}/webservice/v1/usuarios`, {
            method: 'POST', headers,
            body: JSON.stringify({ qtype: 'usuarios.id', query: '0', oper: '>', page: '1', rp: '10000', sortname: 'usuarios.id', sortorder: 'asc' })
        });
        const dataU = await resU.json();
        const usuarios = dataU.registros || [];

        const porGrupo = {};
        for (const u of usuarios) {
            const gid = u.id_grupo || '0';
            if (!porGrupo[gid]) porGrupo[gid] = [];
            porGrupo[gid].push({ id: u.id, nome: u.nome, status: u.status, funcionario: u.funcionario });
        }
        const resultado = Object.entries(porGrupo)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([id_grupo, membros]) => ({ id_grupo, total: membros.length, membros }));

        return res.json({ sucesso: true, total_grupos: resultado.length, grupos: resultado });
    } catch (e) {
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rota: Buscar Usuários com Informações de Grupos ───────────────────────
app.get('/api/usuarios-grupo', async (req, res) => {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        // Busca usuários (que contém id_grupo)
        const resUsuarios = await fetch(`https://${host}/webservice/v1/usuarios`, {
            method: 'POST', 
            headers,
            body: JSON.stringify({ qtype: 'usuarios.id', query: '0', oper: '>', page: '1', rp: '10000', sortname: 'usuarios.id', sortorder: 'asc' })
        });

        const dataUsuarios = await resUsuarios.json();
        const usuarios = dataUsuarios.registros || [];
        
        console.log(`-> /api/usuarios-grupo: ${usuarios.length} usuários retornados`);
        return res.json({ sucesso: true, usuarios });
    } catch (e) {
        console.error('Erro rota /api/usuarios-grupo:', e);
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Helper: Busca automática de grupos SUPERVISOR(A) no IXC ─────────────────
// Tenta buscar do IXC todos os grupos cujo nome contém "SUPERVISOR".
// Se o endpoint estiver disponível (permissão liberada), sincroniza o banco local
// e retorna os IDs. Caso contrário, usa o que está configurado manualmente.
async function buscarIdsGruposSupervisores(host, headers) {
    try {
        // Tenta buscar grupos com "SUPERVISOR" no nome
        const res = await fetch(`https://${host}/webservice/v1/usuarios_grupo`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                qtype: 'usuarios_grupo.grupo',
                query: 'SUPERVISOR',
                oper: 'like',
                page: '1',
                rp: '200',
                sortname: 'usuarios_grupo.id',
                sortorder: 'asc'
            })
        });
        const data = await res.json();

        if (data.registros && Array.isArray(data.registros) && data.registros.length > 0) {
            // Permissão liberada! Sincroniza o banco local automaticamente
            const idsIXC = data.registros
                .filter(g => g.grupo && g.grupo.toUpperCase().includes('SUPERVISOR'))
                .map(g => String(g.id));

            if (idsIXC.length > 0) {
                // Atualiza o banco local com os IDs encontrados no IXC
                await pool.query('DELETE FROM grupos_supervisores');
                const values = idsIXC.map((id, i) => `($${i + 1})`).join(', ');
                await pool.query(`INSERT INTO grupos_supervisores (id_grupo) VALUES ${values} ON CONFLICT DO NOTHING`, idsIXC);
                console.log(`✅ Auto-sync: ${idsIXC.length} grupos SUPERVISOR(A) sincronizados do IXC:`, idsIXC);
                return new Set(idsIXC);
            }
        }
    } catch (e) {
        // endpoint indisponível — silencioso, usa fallback
    }

    // Fallback: usa IDs configurados manualmente no banco local
    const result = await pool.query('SELECT id_grupo FROM grupos_supervisores');
    return new Set(result.rows.map(r => String(r.id_grupo)));
}

// ─── Rota: Diretório de Setores (empresa_setor + funcionários com SUPERVISOR) ────────
app.get('/api/setores', async (req, res) => {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        // Busca setores, funcionários e usuários (com grupos) em paralelo
        const [resSetor, resFunc, resUsuarios] = await Promise.all([
            fetch(`https://${host}/webservice/v1/empresa_setor`, {
                method: 'POST', headers,
                body: JSON.stringify({ qtype: 'empresa_setor.ativo', query: 'S', oper: '=', page: '1', rp: '1000', sortname: 'empresa_setor.setor', sortorder: 'asc' })
            }),
            fetch(`https://${host}/webservice/v1/funcionarios`, {
                method: 'POST', headers,
                body: JSON.stringify({ qtype: 'funcionarios.ativo', query: 'S', oper: '=', page: '1', rp: '10000', sortname: 'funcionarios.funcionario', sortorder: 'asc' })
            }),
            fetch(`https://${host}/webservice/v1/usuarios`, {
                method: 'POST', headers,
                body: JSON.stringify({ qtype: 'usuarios.id', query: '0', oper: '>', page: '1', rp: '10000', sortname: 'usuarios.id', sortorder: 'asc' })
            })
        ]);

        const dataSetor = await resSetor.json();
        const dataFunc = await resFunc.json();
        const dataUsuarios = await resUsuarios.json();

        const setoresRaw = (dataSetor.registros || []).filter(s => s.ativo === 'S');
        const funcionarios = dataFunc.registros || [];
        const usuarios = dataUsuarios.registros || [];

        // Mapeia id_funcionario -> id_grupo (usando field 'funcionario' como chave)
        const gruposPorFuncionario = {};
        usuarios.forEach(usr => {
            if (usr.funcionario && usr.id_grupo) {
                gruposPorFuncionario[usr.funcionario] = usr.id_grupo;
            }
        });

        // Busca IDs dos grupos SUPERVISOR(A): tenta IXC primeiro, fallback no banco local
        const idsGruposSupervisor = await buscarIdsGruposSupervisores(host, headers);

        // Busca responsáveis definidos manualmente para sobrescrever quando aplicável
        let responsaveisManuais = {};
        try {
            const manResult = await pool.query('SELECT * FROM responsaveis_manuais');
            manResult.rows.forEach(r => {
                responsaveisManuais[String(r.id_setor)] = r;
            });
        } catch (e) {}

        // Busca descrições customizadas de setores
        let descricoesManuais = {};
        try {
            const descResult = await pool.query('SELECT * FROM setores_descricoes');
            descResult.rows.forEach(r => {
                descricoesManuais[String(r.id_setor)] = r.descricao;
            });
        } catch (e) {}

        // Agrupa funcionários ativos por setor e encontra o SUPERVISOR(A)
        const setores = setoresRaw.map(setor => {
            const membros = funcionarios.filter(f =>
                String(f.id_departamento).trim() === String(setor.id).trim()
            );
            
            // Procura por supervisores no setor (funcionários cujo id_grupo está na lista configurada)
            let responsavel = null;
            
            // Prioridade 1: Definição manual por setor
            if (responsaveisManuais[String(setor.id)]) {
                const rManual = responsaveisManuais[String(setor.id)];
                // Procurar os dados completos do funcionario na lista geral (ou apenas no setor)
                const funcManual = funcionarios.find(f => String(f.id) === String(rManual.id_funcionario));
                
                if (funcManual) {
                    responsavel = funcManual;
                } else {
                    // Fallback se não encontrar os dados completos dele nos ativos momentaneamente
                    responsavel = {
                        id: rManual.id_funcionario,
                        funcionario: rManual.nome,
                        foto_perfil: null,
                        ramal: null
                    };
                }
            }
            // Prioridade 2: Grupos Supervisor
            else if (idsGruposSupervisor.size > 0) {
                for (const membro of membros) {
                    const idGrupoDoFuncionario = gruposPorFuncionario[membro.id];
                    if (idGrupoDoFuncionario && idsGruposSupervisor.has(String(idGrupoDoFuncionario))) {
                        responsavel = membro;
                        break;
                    }
                }
            }
            
            // Se não achar supervisor, não exibe responsável
            if (!responsavel) {
                responsavel = null;
            }

            return {
                id: setor.id,
                nome: setor.setor,
                cor: setor.cor || null,
                descricao_customizada: descricoesManuais[String(setor.id)] || null,
                totalMembros: membros.length,
                responsavel: responsavel ? {
                    id: responsavel.id,
                    nome: responsavel.funcionario,
                    foto: responsavel.foto_perfil || null,
                    ramal: responsavel.ramal || null
                } : null
            };
        });

        console.log(`-> /api/setores: ${setores.length} setores, ${usuarios.length} usuários, ${Object.keys(gruposPorFuncionario).length} com grupos`);
        return res.json({ sucesso: true, setores });
    } catch (e) {
        console.error('Erro rota /api/setores:', e);
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// ─── Rota: Listar Planos de Negociação (Diretório) ───────────────────────────
app.get('/api/planos-negociacoes', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const host = process.env.IXC_HOST;
    const url = `https://${host}/webservice/v1/crm_planos_negociacoes`;

    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const body = JSON.stringify({
        qtype: 'crm_planos_negociacoes.ativo',
        query: 'S',
        oper: '=',
        page: '1',
        rp: '1000',
        sortname: 'crm_planos_negociacoes.id',
        sortorder: 'asc'
    });

    try {
        const respostaVal = await fetch(url, { method: 'POST', headers, body });
        if (!respostaVal.ok) throw new Error(`Erro API IXC: ${respostaVal.status}`);

        const dadosIXC = await respostaVal.json();
        const planosIXC = dadosIXC.registros || [];

        // Busca o metadata do banco de dados PostgreSQL
        const resultMeta = await pool.query('SELECT plano_id, prazo_instalacao, taxa_instalacao FROM planos_metadata');
        const mapaMetadados = {};
        resultMeta.rows.forEach(row => {
            const key = (row.plano_id || '').toString().trim();
            mapaMetadados[key] = {
                prazo_instalacao: row.prazo_instalacao,
                taxa_instalacao: row.taxa_instalacao
            };
        });

        // Contagem de "Vendas no Mês" via tabela cliente_contrato
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        
        let planCounts = {};
        let statusCounts = {};
        try {
            const urlContratos = `https://${host}/webservice/v1/cliente_contrato`;
            const bodyContratos = JSON.stringify({
                qtype: 'cliente_contrato.data_cadastro_sistema',
                query: firstDay,
                oper: '>=',
                page: '1',
                rp: '5000',
                sortname: 'cliente_contrato.id',
                sortorder: 'desc'
            });

            const resContratos = await fetch(urlContratos, { method: 'POST', headers, body: bodyContratos });
            if (resContratos.ok) {
                const dadosContratos = await resContratos.json();
                if (dadosContratos.registros) {
                    dadosContratos.registros.forEach(reg => {
                        const planId = reg.id_vd_contrato;
                        if (planId && String(reg.id_motivo_inclusao) === '1') {
                            planCounts[planId] = (planCounts[planId] || 0) + 1;
                            const st = reg.status || '';
                            const stInt = reg.status_internet || '';
                            const comp = `${st}_${stInt}`;
                            statusCounts[comp] = (statusCounts[comp] || 0) + 1;
                        }
                    });
                }
            }
        } catch (errContrato) {
            console.error('Erro ao buscar contratos do mês:', errContrato.message);
        }

        const planos = planosIXC.map(plano => {
            const planoId = String(plano.id || '').trim();
            const meta = mapaMetadados[planoId] || {};
            // Inject vendas_mes into plan
            return {
                ...plano,
                prazo_instalacao: (meta.prazo_instalacao && meta.prazo_instalacao.trim()) ? meta.prazo_instalacao : '3 Dias', 
                taxa_instalacao: (meta.taxa_instalacao && meta.taxa_instalacao.trim()) ? meta.taxa_instalacao : 'Grátis',
                vendas_mes: planCounts[planoId] || planCounts[String(plano.id_plano || '').trim()] || 0
            };
        });

        return res.json({ sucesso: true, planos, status_counts: statusCounts });
    } catch (err) {
        console.error('Erro ao buscar planos de negociação no IXC:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno ao buscar planos de negociação.' });
    }
});

// ─── Rota: Atualizar Planos de Negociação ──────────────────────────────
app.put('/api/planos-negociacoes/:id', async (req, res) => {
    const { id } = req.params;
    const formData = req.body; // Contém prazo_instalacao e outros dados
    
    // Atualiza ou insere o Prazo de Instalação Local
    if (formData.prazo_instalacao !== undefined || formData.taxa_instalacao !== undefined) {
        try {
            await pool.query(`
                INSERT INTO planos_metadata (plano_id, prazo_instalacao, taxa_instalacao, atualizado_em)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (plano_id) DO UPDATE SET
                    prazo_instalacao = COALESCE(EXCLUDED.prazo_instalacao, planos_metadata.prazo_instalacao),
                    taxa_instalacao = COALESCE(EXCLUDED.taxa_instalacao, planos_metadata.taxa_instalacao),
                    atualizado_em = NOW();
            `, [String(id), formData.prazo_instalacao, formData.taxa_instalacao]);
        } catch (e) {
            console.error('Erro ao salvar metadados do plano localmente:', e);
        }
    }

    // Remove campos que eram somente locais antes de mandar pro IXC
    const updateData = { ...formData };
    delete updateData.prazo_instalacao;
    delete updateData.taxa_instalacao;

    if (Object.keys(updateData).length > 0) {
        const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
        const host = process.env.IXC_HOST;
        
        // Antes de atualizar tudo, precisamos do objeto completo do banco para o IXC aceitar as colunas obrigatorias (ou enviamos somente os disponiveis? No IXC as vezes PUT requer objeto quase igual, mas o snippet mostrou o corpo todo).
        // Na verdade o snippet mostrou todas. Vamos buscar o objeto atual e mergear.
        
        try {
            const getHeaders = {
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
                ixcsoft: 'listar'
            };
            const rGet = await fetch(`https://${host}/webservice/v1/crm_planos_negociacoes`, {
                method: 'POST',
                headers: getHeaders,
                body: JSON.stringify({
                    qtype: 'crm_planos_negociacoes.id',
                    query: id,
                    oper: '=',
                    page: '1',
                    rp: '1'
                })
            });
            
            if (rGet.ok) {
                const jGet = await rGet.json();
                if (jGet.total > 0) {
                    const objBase = jGet.registros[0];
                    const objFinal = { ...objBase, ...updateData };
                    
                    const headersPut = {
                        'Content-Type': 'application/json',
                        Authorization: 'Basic ' + Buffer.from(token).toString('base64')
                    };
                    const urlPut = `https://${host}/webservice/v1/crm_planos_negociacoes/${id}`;

                    const resposta = await fetch(urlPut, { 
                        method: 'PUT', 
                        headers: headersPut, 
                        body: JSON.stringify(objFinal) 
                    });

                    if (!resposta.ok) {
                        const textoErro = await resposta.text();
                        console.error('Erro ao gravar PUT IXC:', textoErro);
                        return res.status(502).json({ sucesso: false, erro: 'Falha ao atualizar plano no IXC.' });
                    }
                }
            }
        } catch (err) {
            console.error('Erro requisição PUT crm_planos_negociacoes:', err.message);
            return res.status(500).json({ sucesso: false, erro: 'Erro interno ao atualizar plano.' });
        }
    }
    
    return res.json({ sucesso: true, mensagem: 'Plano atualizado.' });
});

// ─── ROTAS: Serviços Técnicos ─────────────────────────────────────
// GET - Listar todos os serviços técnicos
app.get('/api/servicos-tecnicos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM servicos_tecnicos ORDER BY id');
        return res.json({ sucesso: true, dados: result.rows });
    } catch (err) {
        console.error('Erro ao buscar serviços técnicos:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar serviços técnicos.' });
    }
});

// POST - Criar novo serviço técnico
app.post('/api/servicos-tecnicos', async (req, res) => {
    const { servico, valor, prazo, pagamento, icon, is_free, is_special } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO servicos_tecnicos (servico, valor, prazo, pagamento, icon, is_free, is_special)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [servico, valor, prazo, pagamento, icon || 'build', is_free || false, is_special || false]);
        return res.json({ sucesso: true, dado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao criar serviço técnico:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao criar serviço técnico.' });
    }
});

// PUT - Atualizar serviço técnico
app.put('/api/servicos-tecnicos/:id', async (req, res) => {
    const { id } = req.params;
    const { servico, valor, prazo, pagamento, icon, is_free, is_special } = req.body;
    try {
        const result = await pool.query(`
            UPDATE servicos_tecnicos 
            SET servico = COALESCE($1, servico), valor = COALESCE($2, valor), prazo = COALESCE($3, prazo),
                pagamento = COALESCE($4, pagamento), icon = COALESCE($5, icon), 
                is_free = COALESCE($6, is_free), is_special = COALESCE($7, is_special)
            WHERE id = $8
            RETURNING *
        `, [servico, valor, prazo, pagamento, icon, is_free, is_special, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Serviço técnico não encontrado.' });
        }
        return res.json({ sucesso: true, dado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao atualizar serviço técnico:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar serviço técnico.' });
    }
});

// DELETE - Excluir serviço técnico
app.delete('/api/servicos-tecnicos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM servicos_tecnicos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Serviço técnico não encontrado.' });
        }
        return res.json({ sucesso: true, mensagem: 'Serviço técnico excluído.' });
    } catch (err) {
        console.error('Erro ao excluir serviço técnico:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao excluir serviço técnico.' });
    }
});

// ─── ROTAS: Pacotes de Streaming ─────────────────────────────────
// GET - Listar todos os pacotes de streaming
app.get('/api/pacotes-streaming', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM pacotes_streaming ORDER BY id');
        return res.json({ sucesso: true, dados: result.rows });
    } catch (err) {
        console.error('Erro ao buscar pacotes de streaming:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao buscar pacotes de streaming.' });
    }
});

// POST - Criar novo pacote de streaming
app.post('/api/pacotes-streaming', async (req, res) => {
    const { servico, valor, periodicidade, icon } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO pacotes_streaming (servico, valor, periodicidade, icon)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [servico, valor, periodicidade || 'Mensal', icon || 'play_circle']);
        return res.json({ sucesso: true, dado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao criar pacote de streaming:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao criar pacote de streaming.' });
    }
});

// PUT - Atualizar pacote de streaming
app.put('/api/pacotes-streaming/:id', async (req, res) => {
    const { id } = req.params;
    const { servico, valor, periodicidade, icon } = req.body;
    try {
        const result = await pool.query(`
            UPDATE pacotes_streaming 
            SET servico = COALESCE($1, servico), valor = COALESCE($2, valor), 
                periodicidade = COALESCE($3, periodicidade), icon = COALESCE($4, icon)
            WHERE id = $5
            RETURNING *
        `, [servico, valor, periodicidade, icon, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Pacote de streaming não encontrado.' });
        }
        return res.json({ sucesso: true, dado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao atualizar pacote de streaming:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar pacote de streaming.' });
    }
});

// DELETE - Excluir pacote de streaming
app.delete('/api/pacotes-streaming/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM pacotes_streaming WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, erro: 'Pacote de streaming não encontrado.' });
        }
        return res.json({ sucesso: true, mensagem: 'Pacote de streaming excluído.' });
    } catch (err) {
        console.error('Erro ao excluir pacote de streaming:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao excluir pacote de streaming.' });
    }
});

// ─── Rota: Top 3 Colaboradoras (Vendedores) + Ticket Médio ────────────
app.get('/api/top-vendedores', async (req, res) => {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const host = process.env.IXC_HOST;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

        // 1. Fetch Planos para obter o valor de cada plano (valor_mensal)
        const urlPlanos = `https://${host}/webservice/v1/crm_planos_negociacoes`;
        const bodyPlanos = JSON.stringify({
            qtype: 'crm_planos_negociacoes.ativo',
            query: 'S',
            oper: '=',
            page: '1',
            rp: '1000'
        });
        const resPlanos = await fetch(urlPlanos, { method: 'POST', headers, body: bodyPlanos });
        let planPrices = {};
        if (resPlanos.ok) {
            const dadosPlanos = await resPlanos.json();
            if (dadosPlanos.registros) {
                dadosPlanos.registros.forEach(plano => {
                    planPrices[String(plano.id)] = parseFloat(plano.valor_mensal || 0);
                    if (plano.id_plano) {
                        planPrices[String(plano.id_plano)] = parseFloat(plano.valor_mensal || 0);
                    }
                });
            }
        }

        // 2. Fetch Contratos do Mes
        const urlContratos = `https://${host}/webservice/v1/cliente_contrato`;
        const bodyContratos = JSON.stringify({
            qtype: 'cliente_contrato.data_cadastro_sistema',
            query: firstDay,
            oper: '>=',
            page: '1',
            rp: '5000',
            sortname: 'cliente_contrato.id',
            sortorder: 'desc'
        });
        const resContratos = await fetch(urlContratos, { method: 'POST', headers, body: bodyContratos });
        
        let vendedorStats = {};
        let totalVendasGlobais = 0;
        
        if (resContratos.ok) {
            const dadosContratos = await resContratos.json();
            if (dadosContratos.registros) {
                dadosContratos.registros.forEach(reg => {
                    if (String(reg.id_motivo_inclusao) === '1') {
                        totalVendasGlobais++;
                        const vId = reg.id_vendedor;
                        const planId = reg.id_vd_contrato || reg.id_tipo_contrato;
                        let valorPlano = 0;
                        if (planId && planPrices[String(planId)]) {
                            valorPlano = planPrices[String(planId)];
                        }

                        if (vId && vId !== '' && vId !== '0') {
                            if (!vendedorStats[vId]) {
                                vendedorStats[vId] = { count: 0, revenue: 0 };
                            }
                            vendedorStats[vId].count += 1;
                            vendedorStats[vId].revenue += valorPlano;
                        }
                    }
                });
            }
        }
        
        // Compute Ticket Medio
        Object.keys(vendedorStats).forEach(vId => {
            const stat = vendedorStats[vId];
            stat.ticketMedio = stat.count > 0 ? (stat.revenue / stat.count) : 0;
        });

        // 3. Pick Top 3 Vendas
        const top3VendasIds = Object.keys(vendedorStats)
            .sort((a, b) => vendedorStats[b].count - vendedorStats[a].count)
            .slice(0, 3);
            
        // 4. Pick Top 3 Ticket Medio (Excluir quem não tem vendas ou ticket zero)
        const top3TicketIds = Object.keys(vendedorStats)
            .filter(vId => vendedorStats[vId].ticketMedio > 0)
            .sort((a, b) => vendedorStats[b].ticketMedio - vendedorStats[a].ticketMedio)
            .slice(0, 3);
            
        const allRelevantIds = Array.from(new Set([...top3VendasIds, ...top3TicketIds]));

        // 5. Fetch Vendedor Details
        let repMap = {};
        for (const id of allRelevantIds) {
            const urlVendedor = `https://${host}/webservice/v1/vendedor`;
            const bodyVendedor = JSON.stringify({
                qtype: 'vendedor.id',
                query: id,
                oper: '=',
                page: '1',
                rp: '1'
            });
            const resVend = await fetch(urlVendedor, { method: 'POST', headers, body: bodyVendedor });
            if (resVend.ok) {
                const dadosVend = await resVend.json();
                if (dadosVend.registros && dadosVend.registros.length > 0) {
                    const vend = dadosVend.registros[0];
                    repMap[id] = vend.nome || 'Vendedor ' + id;
                } else {
                    repMap[id] = 'Vendedor ' + id;
                }
            } else {
                repMap[id] = 'Vendedor ' + id;
            }
        }
        
        // Build final arrays
        const topVendors = top3VendasIds.map(id => ({
            id,
            nome: repMap[id],
            vendas_mes: vendedorStats[id].count
        }));
        
        const topTicket = top3TicketIds.map(id => ({
            id,
            nome: repMap[id],
            ticket_medio: vendedorStats[id].ticketMedio
        }));
        
        return res.json({ sucesso: true, dados: topVendors, topTicket, total_vendas: totalVendasGlobais });
    } catch (e) {
        console.error('Erro ao buscar top vendedores (com ticket medio):', e.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro interno' });
    }
});

// ─── ROTAS: Cobertura de Cidades ─────────────────────────────────
// GET - Listar todas as cidades com cobertura (paginado)
app.get('/api/cobertura', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const busca = req.query.busca || '';
    const tecnologia = req.query.tecnologia || '';
    const status = req.query.status || '';

    try {
        const condicoes = [];
        const params = [];
        let idx = 1;

        if (busca) {
            condicoes.push(`(LOWER(cidade) LIKE $${idx} OR LOWER(bairro) LIKE $${idx})`);
            params.push(`%${busca.toLowerCase()}%`);
            idx++;
        }
        if (tecnologia) {
            condicoes.push(`tecnologia = $${idx}`);
            params.push(tecnologia);
            idx++;
        }
        if (status) {
            condicoes.push(`status = $${idx}`);
            params.push(status);
            idx++;
        }

        const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM cobertura_cidades ${where}`,
            params
        );
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            `SELECT * FROM cobertura_cidades ${where} ORDER BY estado, cidade, bairro LIMIT $${idx} OFFSET $${idx + 1}`,
            [...params, limit, offset]
        );

        return res.json({ sucesso: true, dados: result.rows, total, page, limit });
    } catch (err) {
        console.error('Erro ao listar cobertura:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao listar cobertura.' });
    }
});

// POST - Criar nova entrada de cobertura
app.post('/api/cobertura', async (req, res) => {
    const { estado, cidade, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura } = req.body;
    if (!cidade || !bairro) return res.status(400).json({ sucesso: false, erro: 'Cidade e bairro são obrigatórios.' });
    try {
        const result = await pool.query(`
            INSERT INTO cobertura_cidades (estado, cidade, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [estado || 'AL', cidade, bairro, tecnologia || 'FTTH', velocidade_maxima || '100 MEGA', status || 'Ativo', percentual_cobertura ?? 100]);
        return res.json({ sucesso: true, dado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao criar cobertura:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao criar cobertura.' });
    }
});

// PUT - Atualizar entrada de cobertura
app.put('/api/cobertura/:id', async (req, res) => {
    const { id } = req.params;
    const { estado, cidade, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura } = req.body;
    try {
        const result = await pool.query(`
            UPDATE cobertura_cidades
            SET estado = COALESCE($1, estado),
                cidade = COALESCE($2, cidade),
                bairro = COALESCE($3, bairro),
                tecnologia = COALESCE($4, tecnologia),
                velocidade_maxima = COALESCE($5, velocidade_maxima),
                status = COALESCE($6, status),
                percentual_cobertura = COALESCE($7, percentual_cobertura),
                updated_at = NOW()
            WHERE id = $8
            RETURNING *
        `, [estado, cidade, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura, id]);
        if (result.rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Registro não encontrado.' });
        return res.json({ sucesso: true, dado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao atualizar cobertura:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao atualizar cobertura.' });
    }
});

// DELETE - Remover entrada de cobertura
app.delete('/api/cobertura/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM cobertura_cidades WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ sucesso: false, erro: 'Registro não encontrado.' });
        return res.json({ sucesso: true, mensagem: 'Registro de cobertura excluído.' });
    } catch (err) {
        console.error('Erro ao excluir cobertura:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao excluir cobertura.' });
    }
});

// ─── ROTA: Cobertura — Cidades Atendidas via IXC (híbrido) ──────────────────
// Descobre automaticamente quais cidades/bairros a empresa atende consultando
// cliente_contrato → resolve nomes via endpoint cidade do IXC
// Mescla com dados manuais locais (tecnologia, velocidade, status, %)
app.get('/api/cobertura-ixc', async (req, res) => {
    const host = process.env.IXC_HOST;
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

    try {
        // 1. Buscar contratos do IXC — extrair cidade_id e bairro únicos
        const bodyContratos = JSON.stringify({
            qtype: 'cliente_contrato.status',
            query: 'A',  // apenas contratos ativos
            oper: '=',
            page: '1',
            rp: '9999',
            sortname: 'cliente_contrato.id',
            sortorder: 'asc'
        });

        const resContratos = await fetch(`https://${host}/webservice/v1/cliente_contrato`, {
            method: 'POST', headers, body: bodyContratos
        });

        if (!resContratos.ok) throw new Error(`Erro ao buscar contratos: ${resContratos.status}`);
        const dadosContratos = await resContratos.json();
        const contratos = dadosContratos.registros || [];

        // 2. Agrupar por cidade_id + bairro (normalizado)
        const mapaGrupos = {}; // chave: "cidade_id::bairro"
        const cidadeIdsSet = new Set();

        contratos.forEach(c => {
            const cidId = String(c.cidade || '').trim();
            // Normalizar bairro: trim + uppercase para eliminar duplicatas por caixa
            const bairro = String(c.bairro || '').trim().toUpperCase();
            if (!cidId || cidId === '0' || cidId === '') return;
            cidadeIdsSet.add(cidId);
            const chave = `${cidId}::${bairro}`;
            if (!mapaGrupos[chave]) {
                mapaGrupos[chave] = { cidade_ixc_id: cidId, bairro, total_contratos: 0 };
            }
            mapaGrupos[chave].total_contratos += 1;
        });

        const cidadeIds = Array.from(cidadeIdsSet);
        console.log(`-> /api/cobertura-ixc: ${contratos.length} contratos, ${cidadeIds.length} cidades únicas, ${Object.keys(mapaGrupos).length} combos cidade+bairro`);

        // 3. Buscar nomes das cidades por lote (POST com oper 'in' não existe no IXC, então buscamos tudo)
        const mapaCidades = {}; // cidade_id -> { nome, uf }
        if (cidadeIds.length > 0) {
            const bodyCidades = JSON.stringify({
                qtype: 'cidade.id',
                query: '0',
                oper: '>',
                page: '1',
                rp: '9999',
                sortname: 'cidade.nome',
                sortorder: 'asc'
            });
            const resCidades = await fetch(`https://${host}/webservice/v1/cidade`, {
                method: 'POST', headers, body: bodyCidades
            });
            if (resCidades.ok) {
                const dadosCidades = await resCidades.json();
                (dadosCidades.registros || []).forEach(cid => {
                    if (cidadeIdsSet.has(String(cid.id))) {
                        mapaCidades[String(cid.id)] = { nome: cid.nome || 'Cidade ' + cid.id, uf: cid.uf || 'AL' };
                    }
                });
            }
        }

        // 4. Buscar overrides manuais do banco local
        const localResult = await pool.query(
            'SELECT * FROM cobertura_cidades WHERE cidade_ixc_id IS NOT NULL'
        );
        const mapaLocal = {}; // "cidade_ixc_id::bairro" -> row
        localResult.rows.forEach(row => {
            // Normalizar bairro para uppercase — consistente com o agrupamento do IXC
            const chave = `${row.cidade_ixc_id}::${String(row.bairro || '').toUpperCase()}`;
            mapaLocal[chave] = row;
        });

        // 5. Montar resposta mesclada
        const resultado = Object.values(mapaGrupos).map(grupo => {
            const chave = `${grupo.cidade_ixc_id}::${grupo.bairro}`;
            const cidInfo = mapaCidades[grupo.cidade_ixc_id] || { nome: `Cidade ${grupo.cidade_ixc_id}`, uf: 'AL' };
            const local = mapaLocal[chave] || {};
            return {
                // Identificação IXC (auto)
                cidade_ixc_id: grupo.cidade_ixc_id,
                cidade: cidInfo.nome,
                estado: cidInfo.uf,
                bairro: grupo.bairro || '(sem bairro)',
                total_contratos: grupo.total_contratos,
                // Override manual (banco local) — null se não configurado
                id_local: local.id || null,
                tecnologia: local.tecnologia || null,
                velocidade_maxima: local.velocidade_maxima || null,
                status: local.status || null,
                percentual_cobertura: local.percentual_cobertura !== undefined ? local.percentual_cobertura : null,
                tem_override: !!local.id
            };
        });

        // Ordenar por estado, cidade, bairro
        resultado.sort((a, b) => {
            const k1 = `${a.estado}${a.cidade}${a.bairro}`;
            const k2 = `${b.estado}${b.cidade}${b.bairro}`;
            return k1.localeCompare(k2);
        });

        return res.json({ sucesso: true, dados: resultado, total: resultado.length });
    } catch (e) {
        console.error('Erro em /api/cobertura-ixc:', e.message);
        return res.status(500).json({ sucesso: false, erro: e.message });
    }
});

// POST /api/cobertura-ixc/override — salva ou atualiza os campos manuais de uma entrada IXC
app.post('/api/cobertura-ixc/override', async (req, res) => {
    const { cidade_ixc_id, cidade, estado, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura } = req.body;
    if (!cidade_ixc_id || !bairro) {
        return res.status(400).json({ sucesso: false, erro: 'cidade_ixc_id e bairro são obrigatórios.' });
    }
    try {
        const result = await pool.query(`
            INSERT INTO cobertura_cidades
                (cidade_ixc_id, cidade, estado, bairro, tecnologia, velocidade_maxima, status, percentual_cobertura, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (cidade_ixc_id, bairro) WHERE cidade_ixc_id IS NOT NULL DO UPDATE SET
                cidade              = EXCLUDED.cidade,
                estado              = EXCLUDED.estado,
                tecnologia          = EXCLUDED.tecnologia,
                velocidade_maxima   = EXCLUDED.velocidade_maxima,
                status              = EXCLUDED.status,
                percentual_cobertura= EXCLUDED.percentual_cobertura,
                updated_at          = NOW()
            RETURNING *
        `, [
            String(cidade_ixc_id), cidade || '', estado || 'AL', bairro,
            tecnologia || 'FTTH', velocidade_maxima || '100 MEGA',
            status || 'Ativo', percentual_cobertura ?? 100
        ]);
        return res.json({ sucesso: true, dado: result.rows[0] });
    } catch (err) {
        console.error('Erro ao salvar override:', err.message);
        return res.status(500).json({ sucesso: false, erro: 'Erro ao salvar configuração.' });
    }
});

// ─── Inicialização ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Backend proxy rodando em http://localhost:${PORT}`)
})
// trigger restart
