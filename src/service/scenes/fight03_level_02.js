import dialogFigth from "../dialogFigth";
import { playerIsOnDialogue,enemiesDefeated, store } from "../store";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function fightThreeLevelTwo(k, goBackScene){

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
        store.set(playerIsOnDialogue, true);
        console.log("the player is in dialogue? ", playerIsOnDialogue);

        const originalQuestion = "¿Por qué es importante usar una red Wi-Fi segura en lugares públicos?";
        const resp = "d. Para evitar que otras personas accedan a tu información ";

        // Transformar la pregunta usando Gemini
        let transformedQuestion = await transformQuestionWithGemini(originalQuestion);

        dialogFigth(
            k,
            transformedQuestion,  // Usa la pregunta transformada
            ["a. Para descargar contenido más rápido ", "b. Para aumentar la velocidad de conexión", "c. Para evitar consumir la batería rápidamente", "d. Para evitar que otras personas accedan a tu información "],
            k.vec2(canvasWidth / 2, canvasHeight / 2),
            (selectedOption) => {
                console.log("Opción seleccionada:", selectedOption);
                if(selectedOption === resp){
                    alert("Felicitaciones, Respondiste bien.")
                    store.set(enemiesDefeated, [...enemiesCount, 1])
                    store.set(playerIsOnDialogue, false);
                    k.setGravity(null)
                    goBackScene();
                } else {
                    alert("Respuesta Incorrecta, Intenta de nuevo");
                    goBackScene();
                }
            },
            () => {
                console.log("Diálogo cerrado");
                // Lógica adicional si el diálogo se cierra sin enviar
            }
        );
    }

    const player = k.make([
        k.sprite("character"),
        { anim: "idle" },
        k.area({
            shape: new k.Rect(new k.vec2(0), 26, 26)
        }),
        k.body(),
        k.anchor("center"),
        k.pos(canvasWidth - 100, canvasHeight - 100),
        k.scale(8),
        {
            speed: 200,
            direction: "left",
            isOnDialogue: false,
            enemiesDefeated: 0,
            currentPosition: {},
            currentLevel: "",
        },
        "player"
    ])

    k.add([
        k.sprite("02_back_palm_orange_sunset"),
        k.pos(0),
        k.scale(6.65 ,5.5),
    ])

    k.add([
        k.sprite("03_back_palm_orange_sunset"),
        k.pos(0),
        k.scale(6.65, 5.5),
    ])

    k.add([
        k.sprite("04_back_palm_orange_sunset"),
        k.pos(0),
        k.scale(5, 4.6),
        k.area({
            shape: new k.Rect(k.vec2(0, 130 ), canvasWidth, 10)
        })
    ])
    
    const enemies_02_two = k.add([
        k.sprite("enemies_02_two"),
        k.pos(200, canvasHeight - 50),
        k.area({
            shape: new k.Rect(k.vec2(0), 30, 30)
        }),
        k.body(),
        {anim: "idle"},
        k.anchor("center"),
        k.scale(7)
    ])

    k.onKeyPress("u", ()=> {
        goBackScene();
    })

    const gravity = 200;

    k.add([
        k.rect(canvasWidth, 200),
        k.pos(0, canvasHeight - 50),
        k.area(),
        k.body({isStatic: true}),
        k.color(k.Color.fromHex(("#2e4053")))
    ])

    // Add the player to the scene
    k.setGravity(gravity);
    k.add(player);
    enemies_02_two.play("idle")
    player.play("idle");
    introDialogue();
}