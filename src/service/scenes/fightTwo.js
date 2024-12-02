import dialogFigth from "../dialogFigth";
import { enemiesDefeated, playerIsOnDialogue, store } from "../store";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function figthTwo(k, backScene) {

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
        store.set(playerIsOnDialogue, true)
        console.log("the player is in dialogue? ", store.get(playerIsOnDialogue));
        
        const originalQuestion = "¿Cuál de las siguientes es una buena práctica al crear una contraseña?";
        const resp = "a. Usar combinaciones de letras, números y símbolos";
        
        // Transformar la pregunta usando Gemini
        let transformedQuestion = await transformQuestionWithGemini(originalQuestion);
        
        dialogFigth(
            k,
            transformedQuestion,  // Usa la pregunta transformada
            ["a. Usar combinaciones de letras, números y símbolos", "b.	Usar solo tu nombre y fecha de nacimiento", "c. Usar solo palabras comunes", "d. Elegir una palabra fácil de recordar"],
            k.vec2(canvasWidth / 2, canvasHeight / 2),
            (selectedOption) => {
                console.log("Opción seleccionada:", selectedOption);
                if (selectedOption === resp) {
                    alert("Felicitaciones, Respondiste bien.")
                    store.set(enemiesDefeated, [...enemiesCount, 1])
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

    k.add([
        k.sprite("01_"),
        k.pos(0),
        k.scale(2.9, 2.5),
    ])

    k.add([
        k.sprite("02_"),
        k.pos(10, 100),
        k.scale(2.9, 2.5),
    ])

    k.add([
        k.sprite("03_"),
        k.pos(0),
        k.scale(2.9, 2.5),
    ])

    k.add([
        k.sprite("04_"),
        k.pos(0),
        k.scale(2.9, 2.5),
    ])

    k.add([
        k.rect(canvasWidth, 200),
        k.pos(0, canvasHeight - 50),
        k.area(),
        k.body({ isStatic: true }),
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

    const enemies_two = k.add([
        k.sprite("enemies_two"),
        k.pos(200, canvasHeight - 50),
        k.area({
            shape: new k.Rect(k.vec2(0), 30, 30)
        }),
        k.body(),
        { anim: "idle" },
        k.anchor("center"),
        k.scale(8)
    ])

    const gravity = 200;

    k.setGravity(gravity);

    k.add(player);
    enemies_two.play("idle");
    player.play("idle");
    introDialogue();
}