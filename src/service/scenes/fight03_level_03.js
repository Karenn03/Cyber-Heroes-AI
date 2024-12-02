import dialogFigth from "../dialogFigth";
import { store, enemiesDefeated, playerIsOnDialogue } from "../store";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function fightThreeLevelThree(k, goBackScene) {

    // k.add([
    //     k.text("fight 03 level 3"),
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

    const map = k.add([
        k.sprite("back_fight03_level03"),
        k.pos(0),
        k.scale(1.7, 0.8)
    ])

    k.add([
        k.rect(canvasWidth, 200),
        k.pos(0, canvasHeight - 50),
        k.area(),
        k.body({ isStatic: true }),
        k.color(k.Color.fromHex(("#020232")))
    ]);

    async function introDialogue() {
        store.set(playerIsOnDialogue, true);
        console.log("the player is in dialogue? ", store.get(playerIsOnDialogue));
        
        const originalQuestion = "¿Cuál de los siguientes es un ejemplo de 'malware'?";
        const resp = "b. Un virus que afecta el funcionamiento de tu dispositivo";

        // Transformar la pregunta usando Gemini
        let transformedQuestion = await transformQuestionWithGemini(originalQuestion);

        dialogFigth(
            k,
            transformedQuestion,  // Usa la pregunta transformada
            ["a. Una aplicación de banca segura", "b. Un virus que afecta el funcionamiento de tu dispositivo", "c.	Un sistema operativo actualizado", "d. Un archivo adjunto en un correo de un desconocido."],
            k.vec2(canvasWidth / 2, canvasHeight / 2),
            (selectedOption) => {
                console.log("Opción seleccionada:", selectedOption);
                if (selectedOption === resp) {
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

    const boss03 = k.add([
        k.sprite("third_boss_level_03"),
        k.pos(200, canvasHeight - 300),
        k.body(),
        k.area({ shape: new k.Rect(k.vec2(0), 25, 180) }),
        k.anchor("center"),
        k.scale(3),
        { anim: "idle" }
    ])

    let player = k.add([
        k.sprite("character"),
        { anim: "idle" },
        k.area({
            shape: new k.Rect(new k.vec2(0), 18, 18)
        }),
        k.body(),
        k.anchor("center"),
        k.pos(canvasWidth - 100, canvasHeight - 50),
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

    boss03.play("idle");
    player.play("idle");

    k.onKeyPress("u", () => {
        goBackScene()
    })

    introDialogue();
}