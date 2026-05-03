import 'dotenv/config';

async function testVariations() {
    const token = `${process.env.IXC_USER_ID}:${process.env.IXC_TOKEN_SECRET}`
    const host = process.env.IXC_HOST
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    }

    const variations = [
        'usuarios_grupo',
        'usuarios_grupos',
        'usuario_grupo',
        'usuario_grupos',
        'grupo_usuarios',
        'grupos_usuarios',
        'acesso_grupo',
        'adm_usuarios_grupo',
        'user_group',
        'users_group',
        'user_groups'
    ];

    for (const v of variations) {
        process.stdout.write(`Variante /v1/${v} ... `);
        try {
            const resp = await fetch(`https://${host}/webservice/v1/${v}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ qtype: 'id', query: '0', oper: '>', page: '1', rp: '1' })
            });
            const data = await resp.json();
            if (data.type !== 'error') {
                console.log(`✅ DISPONÍVEL!`);
                console.log(`  Campos:`, Object.keys(data.registros?.[0] || {}));
            } else {
                console.log(`❌ ${data.message}`);
            }
        } catch (e) {
            console.log(`⚠️ Erro`);
        }
    }
}

testVariations();
