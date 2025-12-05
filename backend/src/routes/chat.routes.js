const Router = require('koa-router');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = new Router();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

router.post('/api/chat', async (ctx) => {
  try {
    const { message, dataMalla, cursosAprobados } = ctx.request.body;

    // Obtener información detallada de los cursos aprobados
    const cursosAprobadosDetalle = cursosAprobados?.map(codSigla => {
      const curso = dataMalla.Ramos.find(r => r.CodSigla === codSigla || r.CodLista === codSigla);
      return curso ? `${curso.Nombre} (${codSigla})` : codSigla;
    }) || [];

    // Calcular créditos aprobados
    const creditosAprobados = cursosAprobados?.reduce((total, codSigla) => {
      const curso = dataMalla.Ramos.find(r => r.CodSigla === codSigla || r.CodLista === codSigla);
      return total + (curso?.Creditos || 0);
    }, 0) || 0;

    const prompt = `
Eres un consejero académico experto de la carrera ${dataMalla.Nombre}.

INFORMACIÓN DEL PROGRAMA:
${JSON.stringify(dataMalla, null, 2)}

CURSOS APROBADOS POR EL ESTUDIANTE (${cursosAprobados?.length || 0} cursos, ${creditosAprobados} créditos):
${cursosAprobadosDetalle.length > 0 ? cursosAprobadosDetalle.join('\n') : 'Ningún curso aprobado aún'}

PREGUNTA DEL ESTUDIANTE: ${message}

INSTRUCCIONES:
1. Analiza qué cursos puede tomar el estudiante basándote en:
   - Los cursos que ya aprobó (tiene los prerrequisitos cumplidos)
   - Los requisitos de cada curso en la malla
   - La carga académica recomendada (50-60 créditos por año)
   - La progresión lógica del plan de estudios

2. Responde de manera natural y conversacional, como un consejero real.

3. Si te piden recomendaciones de cursos, incluye al final un JSON con este formato exacto:
{
  "cursos_sugeridos": ["CodSigla1 - Nombre Curso1", "CodSigla2 - Nombre Curso2"],
  "explicacion": "Breve justificación de por qué estos cursos"
}

4. Considera:
   - Si un curso requiere prerrequisitos que el estudiante NO ha aprobado, NO lo recomiendes
   - Si un curso requiere corequisitos, menciona que deben tomarse juntos
   - Da prioridad a cursos de semestres tempranos si el estudiante está comenzando
   - Sugiere una carga balanceada (típicamente 4-6 cursos por semestre)
5. Se breve y conciso en tu respuesta`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const respuesta = result.response.text();

    // Intentar extraer JSON si existe
    let cursosRecomendados = null;
    const jsonMatch = respuesta.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        cursosRecomendados = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.log('No JSON encontrado en respuesta');
      }
    }

    ctx.body = {
      success: true,
      respuesta,
      cursosRecomendados
    };

  } catch (error) {
    console.error('Error en /api/chat:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message
    };
  }
});

module.exports = router;