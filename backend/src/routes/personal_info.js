const Router = require("koa-router");
const router = new Router();
const fs = require('fs');
const path = require('path');

const mallasDataPath = path.resolve(__dirname, '../../mallas_por_major.json');
let mallasData;

try {
    mallasData = JSON.parse(fs.readFileSync(mallasDataPath, 'utf8'));
} catch (error) {
    console.error("Error al cargar mallas_por_major.json:", error);
    mallasData = {};
}


router.post('/malla', (ctx) => {
    console.log('Received body:', ctx.request.body);
    const { major, minor } = ctx.request.body;

    if (!major) {
        ctx.status = 400;
        ctx.body = { error: 'El parámetro "major" es requerido' };
        return;
    }

    let foundMajorCode = null;
    for (const code in mallasData) {
        if (mallasData[code].Nombre === major) {
            foundMajorCode = code;
            break;
        }
    }

    if (!foundMajorCode) {
        ctx.status = 404;
        ctx.body = { error: 'Major no encontrado por nombre' };
        return;
    }

    const majorData = mallasData[foundMajorCode];

    if (!minor) {
        ctx.body = majorData;
        return;
    }
    
    const filteredRamos = majorData.Ramos.filter(ramo => 
        ramo.Programa === 'Plan Común' || 
        ramo.Programa === minor ||
        ramo.Programa === major
    );

    ctx.body = {
        ...majorData,
        Ramos: filteredRamos
    };
});

module.exports = router;