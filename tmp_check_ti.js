async function checkUG113() {
    const host = 'sistema.prestek.com.br';
    const token = '222:17ff5324f464f2f63af3e4c3d8fe1ea309b49516ad7d384cdcf5a2205758420b';
    const headers = {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(token).toString('base64'),
        ixcsoft: 'listar'
    };

    try {
        const response = await fetch(`https://${host}/webservice/v1/usuarios_grupo`, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify({ qtype: 'usuarios_grupo.id', query: '113', oper: '=', page: '1', rp: '1' }) 
        });
        const data = await response.json();
        console.log("UG 113 DATA:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e.message);
    }
}

checkUG113();
