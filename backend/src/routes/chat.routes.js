// routes/chat.routes.js
const Router = require('koa-router');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = new Router();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

router.post('/api/chat', async (ctx) => {
  try {
    const { message, dataMalla } = ctx.request.body;

    const prompt = `
Eres un consejero académico experto.

Información del estudiante:
${JSON.stringify(dataMalla, null, 2)}

Pregunta del estudiante: ${message}

Responde de manera natural y conversacional. Si te piden recomendaciones de cursos, incluye un JSON al final con este formato:
{
  "cursos_sugeridos": ["Curso1", "Curso2"],
  "explicacion": "Texto breve"
}
`;

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
        console.log('No JSON encontrado');
      }
    }

    ctx.body = {
      success: true,
      respuesta,
      cursosRecomendados
    };

  } catch (error) {
    console.error('Error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: error.message
    };
  }
});

module.exports = router;