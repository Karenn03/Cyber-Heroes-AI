import dialogFigth from "../dialogFigth";
import { enemiesDefeated, playerIsOnDialogue, store } from "../store";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function figthOne(k, backScene) {
    
    const canvasWidth = k.width();
    const canvasHeight = k.height();
    const enemiesCount = store.get(enemiesDefeated);

    // Inicializar Gemini con tu API key
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

    // Función para procesar y limpiar la respuesta
    function cleanAndFilterResponse(text) {
        // Eliminar el prompt si está presente
        const cleanText = text.replace(/^.?Reformula.?:\s*"/i, '').replace(/"$/, '').trim();
        
        // Dividir en líneas y limpiar
        const lines = cleanText.split(/[\n.!?]+/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
        
        // Seleccionar la versión más corta y clara
        const processedLines = lines.filter(line => 
            line.length >= 10 && 
            line.length <= 50 && 
            line.split(' ').length >= 3 &&
            line.split(' ').length <= 10
        );

        // Devolver la primera línea válida o la línea original si no hay coincidencias
        return processedLines.length > 0 
            ? processedLines[0] + '?' 
            : cleanText.split(/[\n.!?]+/)[0] + '?';
    }

    // Función de transformación de preguntas con Gemini
    async function transformQuestionWithGemini(originalQuestion) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-pro",
                generationConfig: {
                    maxOutputTokens: 40,  // Limitar la longitud de salida
                    temperature: 0.7,     // Añadir algo de creatividad
                }
            });
            
            const prompt = `Reformula esta pregunta sobre ciberseguridad de manera concisa: "${originalQuestion}"`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();

            // Limpiar y procesar la respuesta
            const transformedQuestion = cleanAndFilterResponse(text);

            return transformedQuestion || originalQuestion;
        } catch (error) {
            console.error("Error en transformación de Gemini:", error);
            return originalQuestion;
        }
    }
    
    async function introDialogue() {
        console.log("the player is in dialogue? ", store.get(playerIsOnDialogue));

        const originalQuestion = "¿Qué tan frecuentemente se recomienda cambiar tus contraseñas?";
        const resp = "c. Cada 3 a 6 meses";

        // Transformar la pregunta usando Gemini
        let transformedQuestion = await transformQuestionWithGemini(originalQuestion);

        dialogFigth(
            k,
            transformedQuestion,  // Usa la pregunta transformada
            ["a. Solo cuando alguien la descubre ", "b.	Cada año", "c. Cada 3 a 6 meses", "d. Nunca, si es fuerte"],
            k.vec2(canvasWidth / 2, canvasHeight / 2),
            (selectedOption) => {
                console.log("Opción seleccionada:", selectedOption);
                if(selectedOption === resp){
                    alert("Felicitaciones, Respondiste bien.")
                    store.set(enemiesDefeated, [...enemiesCount, 1])
                    console.log("cantidad de enemigos derrotados: ", store.get(enemiesDefeated));
                    backScene();
                } else {
                    alert("Respuesta Incorrecta, Intenta de nuevo");
                    backScene();
                }
            },
            () => {
                console.log("Diálogo cerrado");
                // Lógica adicional si el diálogo se cierra sin enviar
            }
        );
    }

    const background = k.add ([
        k.sprite("background_level_02"),
        k.scale(1, 0.9),
        k.pos(-150, 0)
    ])
   

    k.add([
        k.rect(canvasWidth, 200),
        k.pos(0, canvasHeight - 50),
        k.area(),
        k.body({isStatic: true}),
        k.color(k.Color.fromHex(("#2e4053")))
    ])
    
    const player = k.make([
        k.sprite("character"),
        { anim: "idle" },
        k.area({
            shape: new k.Rect(new k.vec2(0), 26, 26)
        }),
        k.body(),
        k.anchor("center"),
        k.pos(canvasWidth - 100, canvasHeight - 50),
        k.scale(8),
        {
            speed: 200,
            direction: "left",
            currentPosition: {},
            currentLevel: "",
        },
        "player"
    ])
    const enemies_one = k.add([
        k.sprite("enemies_one"),
        k.pos(200, canvasHeight - 50),
        k.area({
            shape: new k.Rect(k.vec2(0), 30, 40)    
        }),
        k.body(),
        {anim: "idle"},
        k.anchor("center"),
        k.scale(8)
    ])

    const gravity = 200;

    k.setGravity(gravity);

    enemies_one.play("idle");

    k.add(player);
    
   // Add the player to the scene
   enemies_one.play("idle");
   player.play("idle");
    // Llamar a introDialogue cuando todo esté listo
    introDialogue();
}