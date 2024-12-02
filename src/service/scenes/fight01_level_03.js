import dialogFigth from "../dialogFigth";
import { enemiesDefeated, playerIsOnDialogue, store } from "../store";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function fightOneLevelThree(k, goBackScene){
    
    // k.add([
    //     k.text("fight 01 level 3"),
    //     k.pos(100, 100)
    // ])

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
        console.log("the player is in dialogue? ", store.get(playerIsOnDialogue));

        const originalQuestion = "¿Cuál es una señal de que una red Wi-Fi pública puede no ser segura?";
        const resp = "c. No requiere contraseña para conectarse";
        
        // Transformar la pregunta usando Gemini
        let transformedQuestion = await transformQuestionWithGemini(originalQuestion);

        dialogFigth(
            k,
            transformedQuestion,  // Usa la pregunta transformada
            ["a. Tiene una señal fuerte", "b. Es de un lugar popular", "c. No requiere contraseña para conectarse", "d.	Es accesible en varios dispositivos"],
            k.vec2(canvasWidth / 2, canvasHeight / 2),
            (selectedOption) => {
                console.log("Opción seleccionada:", selectedOption);
                if(selectedOption === resp){
                    alert("Felicitaciones, Respondiste bien.")
                    store.set(enemiesDefeated, [...enemiesCount, 1])
                    store.set(playerIsOnDialogue, false);
                    k.setGravity(null)
                    goBackScene()
                } else {
                    alert("Respuesta Incorrecta, Intenta de nuevo");
                    store.set(playerIsOnDialogue, false);
                    goBackScene();
                }
            },
            () => {
                console.log("Diálogo cerrado");
                // Lógica adicional si el diálogo se cierra sin enviar
            }
        );
    }
    
    const map = k.add([
        k.sprite("background_figthTwo"),
        k.pos(0, -320),
        k.scale(1.7, 1.5),
    ])

    k.add([
        k.rect(canvasWidth, 200),
        k.pos(0, canvasHeight - 50),
        k.area(),
        k.body({ isStatic: true }),
        k.color(k.Color.fromHex(("#020232")))
    ]);
    
    const boss01 = k.add([
        k.sprite("first_boss_level_03"),
        k.pos(200, canvasHeight - 50),
        k.body(),
        k.area({shape: new k.Rect(k.vec2(0), 25, 40)}),
        k.anchor("center"),
        k.scale(8),
        {anim: "idle"}
    ])

    let player = k.add([
        k.sprite("character"),
        { anim: "idle" },
        k.area({
            shape: new k.Rect(new k.vec2(0), 18, 18)
        }),
        k.body(),
        k.anchor("center"),
        k.pos(canvasWidth - 130, canvasHeight - 50),
        k.scale(6),
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

    boss01.play("idle");
    player.play("idle");

    k.onKeyPress("u", () =>{
        goBackScene()
    })  
    
    introDialogue();
}