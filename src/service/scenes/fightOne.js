import dialogFigth from "../dialogFigth";
import { enemiesDefeated, playerIsOnDialogue, store } from "../store";
import { pipeline } from '@huggingface/transformers';

export default async function figthOne(k, backScene) {
    
    const canvasWidth = k.width();
    const canvasHeight = k.height();
    const enemiesCount = store.get(enemiesDefeated);

    let questionTransformer;  // Definir la variable para el modelo

    // Cargar el modelo una vez
    async function loadModel() {
        try {
            questionTransformer = await pipeline('text2text-generation', 'Xenova/t5-small');
            console.log("Modelo cargado exitosamente");
            const transformedQuestionData = await questionTransformer("¿Qué tan frecuentemente se recomienda cambiar tus contraseñas?", {
                max_length: 120,
                do_sample: true,
            });
            console.log(transformedQuestionData);
        } catch (error) {
            console.error("Error al cargar el modelo:", error);
        }
    }
    
    async function introDialogue() {
        console.log("the player is in dialogue? ", store.get(playerIsOnDialogue));
    
        const originalQuestion = "¿Qué tan frecuentemente se recomienda cambiar tus contraseñas?";
        const resp = "c. Cada 3 a 6 meses";
    
        let transformedQuestion = originalQuestion; // Iniciar con la pregunta original
    
        if (questionTransformer) {
            try {
                const transformedQuestionData = await questionTransformer(originalQuestion, {
                    max_length: 120,
                    do_sample: true,
                });
                transformedQuestion = transformedQuestionData[0].generated_text;
            } catch (error) {
                console.error("Error transformando la pregunta:", error);
            }
        } else {
            console.error("Modelo no cargado correctamente.");
        }
    
        // Reemplazo temporal: Usar un `prompt` para verificar la lógica
        const options = [
            "a. Solo cuando alguien la descubre",
            "b. Cada año",
            "c. Cada 3 a 6 meses",
            "d. Nunca, si es fuerte",
        ];
        const promptMessage = `${transformedQuestion}\n\n${options
            .map((opt, index) => `${String.fromCharCode(97 + index)}. ${opt}`)
            .join("\n")}\n\nEscribe la letra de tu respuesta:`;
    
        const selectedOption = window.prompt(promptMessage);
    
        // Verificar respuesta
        if (selectedOption && selectedOption.toLowerCase() === "c") {
            alert("¡Felicitaciones, respondiste bien!");
            store.set(enemiesDefeated, [...enemiesCount, 1]);
            console.log("Cantidad de enemigos derrotados: ", store.get(enemiesDefeated));
            backScene();
        } else {
            alert("Respuesta incorrecta, ¡intenta de nuevo!");
            backScene();
        }
    }
    


    // Cargar el modelo antes de ejecutar la función
    await loadModel();

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