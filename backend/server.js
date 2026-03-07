// Servidor Express — proxy seguro para a API IXC
// As credenciais ficam no .env, nunca expostas ao frontend

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'crypto'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

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
                qtype: 'funcionarios.email',
                query: email,
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

        // Retorna dados combinados de usuarios + funcionarios
        console.log(`Login bem-sucedido: ${usuario.nome} (${usuario.email})`)
        return res.json({
            sucesso: true,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                acesso_token: usuario.acesso_token
            },
            funcionario,
            host
        })

    } catch (erro) {
        console.error('Erro de requisição para API IXC:', erro.message)
        return res.status(500).json({
            sucesso: false,
            erro: 'Erro interno do servidor.'
        })
    }
})

// ─── Rota de Funcionário ───────────────────────────────────────────────
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

// ─── Inicialização ───────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ Backend proxy rodando em http://localhost:${PORT}`)
})
