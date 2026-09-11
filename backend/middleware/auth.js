import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const EXPIRA_EM = '12h'

// Rotas que não exigem token — comparadas contra req.originalUrl (sem
// querystring), não req.path: quando este middleware é montado com
// app.use('/api', requireAuth), o Express já retira o prefixo '/api' de
// req.path (só req.originalUrl preserva o caminho completo da requisição).
const PUBLICAS = new Set(['/api/login', '/api/health'])

export function assinarToken(usuario) {
    return jwt.sign(
        { id: usuario.id, email: usuario.email, nome: usuario.nome },
        JWT_SECRET,
        { expiresIn: EXPIRA_EM }
    )
}

export function requireAuth(req, res, next) {
    const caminho = req.originalUrl.split('?')[0]
    if (PUBLICAS.has(caminho)) return next()

    const cabecalho = String(req.headers['authorization'] || '')
    const [tipo, token] = cabecalho.split(' ')
    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ sucesso: false, erro: 'Sessão inválida. Faça login novamente.' })
    }

    try {
        req.usuario = jwt.verify(token, JWT_SECRET)
        next()
    } catch (e) {
        return res.status(401).json({ sucesso: false, erro: 'Sessão expirada ou inválida. Faça login novamente.' })
    }
}
