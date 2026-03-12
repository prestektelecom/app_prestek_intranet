import 'dotenv/config'
import pool from './db.js';

const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
const host = process.env.IXC_HOST

const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
    ixcsoft: 'listar'
}

async function test() {
    console.log("Teste de Busca Aberta de OS por nome do Funcionario...");
    
    // Supondo o funcionarioId do Marcio no banco = 68
    const dbFuncs = await pool.query("SELECT usuario_nome, funcionario_nome FROM usuarios_perfil WHERE usuario_id = '222'");
    if(dbFuncs.rows.length === 0) return console.log("Func não achado no bd local.");
    let targetName = dbFuncs.rows[0].funcionario_nome || dbFuncs.rows[0].usuario_nome;
    if(!targetName) return console.log("Sem nome.");
    
    // Extract first name and last name
    const parts = targetName.split(' ');
    const first = parts[0].toLowerCase();
    console.log("Buscando OS abertas atreladas ao nome:", targetName, "(Filtro flexível por:", first, ")");
    
    const rOs = await fetch(`https://${host}/webservice/v1/su_oss_chamado`, {
        method: 'POST', headers, body: JSON.stringify({ qtype: 'su_oss_chamado.status', query: 'A', oper: '=', rp: 10000 })
    }).then(r=>r.json());
    
    // Vamos baixar os setores e tecnicos e funcionarios pra fazer um cache local das strings
    const rTecs = await fetch(`https://${host}/webservice/v1/su_ticket_tecnico`, {
        method: 'POST', headers, body: JSON.stringify({ qtype: 'su_ticket_tecnico.id', query: '0', oper: '>', rp: 2000 })
    }).then(r=>r.json());
    
    const rUsers = await fetch(`https://${host}/webservice/v1/usuarios`, {
        method: 'POST', headers, body: JSON.stringify({ qtype: 'usuarios.id', query: '0', oper: '>', rp: 2000 })
    }).then(r=>r.json());
    
    const rFuncsApi = await fetch(`https://${host}/webservice/v1/funcionarios`, {
        method: 'POST', headers, body: JSON.stringify({ qtype: 'funcionarios.id', query: '0', oper: '>', rp: 2000 })
    }).then(r=>r.json());

    // Map dictionaries
    const dicTecs = {}; (rTecs.registros||[]).forEach(t=> {dicTecs[t.id] = (t.tecnico||'').toLowerCase()});
    const dicUsu = {};  (rUsers.registros||[]).forEach(u=> {dicUsu[u.id] = (u.nome||'').toLowerCase()});
    const dicFunc = {}; (rFuncsApi.registros||[]).forEach(f=> {dicFunc[f.id] = (f.funcionario||'').toLowerCase()});
    
    let count = 0;
    
    if(rOs.registros) {
        
        rOs.registros.forEach(os => {
            const tecId = os.id_tecnico;
            const logId = os.id_login;
            const atId = os.id_atendente;
            
            // Reúne todos os nomes das pessoas vinculadas a essa os
            const nomesEnvolvidos = [
                dicTecs[tecId] || '',
                dicUsu[tecId] || '',
                dicFunc[tecId] || '',
                dicUsu[logId] || '',
                dicFunc[logId] || '',
                dicUsu[atId] || '',
                dicFunc[atId] || ''
            ].join(' ');
            
            if(nomesEnvolvidos.includes(first) && nomesEnvolvidos.includes("felix")) {
                count++;
            }
        });
        
    }
    
    console.log("=========================================");
    console.log("TOTAL CALCULADO E EXATO DE OSs QUE MENCIONAM 'Marcio ... Felix':", count);
    console.log("=========================================");
    process.exit(0);
}

test()
