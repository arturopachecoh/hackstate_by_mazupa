const Router = require("koa-router");
const router = new Router();
const fs = require('fs');
const path = require('path');

// Load the new mallas.json file
const mallasDataPath = path.resolve(__dirname, '../../mallas.json');
let mallasData;

try {
    mallasData = JSON.parse(fs.readFileSync(mallasDataPath, 'utf8'));
} catch (error) {
    console.error("Error al cargar mallas.json:", error);
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

    try {
        // 1. Get Code for Major, Minor, and Plan Común
        const listadoMajor = mallasData.getListadoMajor['{}'];
        const listadoMinor = mallasData.getListadoMinor['{}'];

        const majorInfo = listadoMajor.find(m => m.Nombre === major);
        const minorInfo = minor ? listadoMinor.find(m => m.Nombre === minor) : null;
        const planComunInfo = listadoMajor.find(m => m.Nombre === 'Plan Común');

        const codMajor = majorInfo ? majorInfo.CodMajor : null;
        const codMinor = minorInfo ? minorInfo.CodMinor : null;
        const codPlanComun = planComunInfo ? planComunInfo.CodMajor : 'PC'; // Fallback to 'PC'

        if (!codMajor) {
            ctx.status(404);
            ctx.body = { error: `Major con nombre "${major}" no encontrado.` };
            return;
        }

        console.log(`Codes found -> Major: ${codMajor}, Minor: ${codMinor}, Plan Común: ${codPlanComun}`);

        // 2. Find the course lists in getMallaSugerida
        const mallaSugerida = mallasData.getMallaSugerida;
        let majorRamos = [];
        let minorRamos = [];

        for (const key in mallaSugerida) {
            // The key is a JSON string, so we need to parse it
            const parsedKey = JSON.parse(key);

            // Find Major Ramos (assuming it has no minor code associated, i.e., "N")
            if (parsedKey.CodMajor === codMajor && parsedKey.CodMinor === 'N') {
                majorRamos = mallaSugerida[key];
                console.log(`Found ${majorRamos.length} ramos for Major ${codMajor}`);
            }

            // Find Minor Ramos
            if (codMinor && parsedKey.CodMinor === codMinor) {
                minorRamos = mallaSugerida[key];
                console.log(`Found ${minorRamos.length} ramos for Minor ${codMinor}`);
            }
        }
        
        // Combine only major and minor ramos. Plan Común courses will be included if they are part of these lists.
        const combinedRamos = [...majorRamos, ...minorRamos];
        
        const ramosWithSigla = combinedRamos.filter(ramo => ramo.Sigla);
        const ramosWithoutSigla = combinedRamos.filter(ramo => !ramo.Sigla);

        const uniqueRamosWithSigla = Array.from(new Map(ramosWithSigla.map(ramo => [ramo.Sigla, ramo])).values());

        const uniqueRamos = [...uniqueRamosWithSigla, ...ramosWithoutSigla];

        console.log(`Total unique ramos: ${uniqueRamos.length}`);

        // 4. Return result
        ctx.body = {
            Nombre: `${major}${minor ? ' con minor ' + minor : ''}`,
            Ramos: uniqueRamos
        };

    } catch (error) {
        console.error('Error processing malla:', error);
        ctx.status = 500;
        ctx.body = { error: 'Ocurrió un error al procesar la malla.' };
    }
});

module.exports = router;