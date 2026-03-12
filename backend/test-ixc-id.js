import 'dotenv/config'

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

async function test() {
    try {
        console.log("Buscando usuario por email marciofelix@prestek.com.br")
        const urlUser = `https://${host}/webservice/v1/usuarios`
        const r1 = await fetch(urlUser, {
            method: 'POST', headers,
            body: JSON.stringify({
                 qtype: 'usuarios.email', query: 'marciofelix@prestek.com.br', oper: '=', page: '1', rp: '5'
            })
        })
        const d1 = await r1.json()
        
        if(d1.total > 0) {
            const user = d1.registros[0];
            const idUsr = user.id;
            const idFunc = user.funcionario;
            console.log(`Usuario encontrado: ${user.nome}`)
            console.log(` > ID (usuarios): ${idUsr}`)
            console.log(` > ID (funcionario): ${idFunc}`)
            
            // Tentar id_tecnico = idUsr
            const r2 = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
                method: 'POST', headers,
                body: JSON.stringify({
                     qtype: 'su_oss_chamado.id_tecnico', query: idUsr, oper: '=', page: '1', rp: '5'
                })
            }).then(r=>r.json())
            console.log(`OSs por id_tecnico = ${idUsr}: ${r2.total}`)

            // Tentar id_tecnico = idFunc
            const r3 = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
                method: 'POST', headers,
                body: JSON.stringify({
                     qtype: 'su_oss_chamado.id_tecnico', query: idFunc, oper: '=', page: '1', rp: '5'
                })
            }).then(r=>r.json())
            console.log(`OSs por id_tecnico = ${idFunc}: ${r3.total}`)
            
            // Tentar id_atendente = idUsr
            const r4 = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
                method: 'POST', headers,
                body: JSON.stringify({
                     qtype: 'su_oss_chamado.id_atendente', query: idUsr, oper: '=', page: '1', rp: '5'
                })
            }).then(r=>r.json())
            console.log(`OSs por id_atendente = ${idUsr}: ${r4.total}`)
            
            // Tentar id_atendente = idFunc
            const r5 = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
                method: 'POST', headers,
                body: JSON.stringify({
                     qtype: 'su_oss_chamado.id_atendente', query: idFunc, oper: '=', page: '1', rp: '5'
                })
            }).then(r=>r.json())
            console.log(`OSs por id_atendente = ${idFunc}: ${r5.total}`)

        } else {
             console.log("Nenhum usuario encontrado com esse email.")
        }
    } catch (e) {
        console.error(e)
    }
}

test()
