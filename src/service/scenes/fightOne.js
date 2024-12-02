import dialogFigth from "../dialogFigth";
import { enemiesDefeated, playerIsOnDialogue, store } from "../store";
import { pipeline } from '@huggingface/transformers';

export default async function figthOne(k, backScene) {
    const canvasWidth = k.width();
    const canvasHeight = k.height();
    const enemiesCount = store.get(enemiesDefeated);

    let questionTransformer; // Variable para almacenar el modelo

    // Cargar el modelo de Hugging Face
    async function loadModel() {
        try {
            questionTransformer = await pipeline('text2text-generation', 'Xenova/t5-small');
            console.log("Modelo cargado exitosamente");
        } catch (error) {
            console.error("Error al cargar el modelo:", error);
        }
    }

    // Transformar la pregunta
    async function transformQuestion(originalQuestion) {
        try {
            if (questionTransformer) {
                const transformedQuestionData = await questionTransformer(originalQuestion, {
                    max_length: 120,
                    do_sample: true,
                });
                return transformedQuestionData[0].generated_text;
            } else {
                console.warn("El modelo no está cargado, se usa la pregunta original.");
                return originalQuestion;
            }
        } catch (error) {
            console.error("Error al transformar la pregunta:", error);
            return originalQuestion;
        }
    }

    // Función de diálogo introductorio
    async function introDialogue() {
        console.log("¿El jugador está en diálogo?", store.get(playerIsOnDialogue));

        const originalQuestion = "¿Qué tan frecuentemente se recomienda cambiar tus contraseñas?";
        const correctAnswer = "c. Cada 3 a 6 meses";

        // Obtener la pregunta transformada
        const transformedQuestion = await transformQuestion(originalQuestion);

        dialogFigth(
            k,
            transformedQuestion, // Mostrar la pregunta transformada
            [
                "a. Solo cuando alguien la descubre",
                "b. Cada año",
                "c. Cada 3 a 6 meses",
                "d. Nunca, si es fuerte",
            ],
            k.vec2(canvasWidth / 2, canvasHeight / 2),
            (selectedOption) => {
                console.log("Opción seleccionada:", selectedOption);
                if (selectedOption === correctAnswer) {
                    alert("¡Felicitaciones, respondiste correctamente!");
                    store.set(enemiesDefeated, [...enemiesCount, 1]);
                    console.log("Cantidad de enemigos derrotados:", store.get(enemiesDefeated));
                    backScene();
                } else {
                    alert("Respuesta incorrecta. Intenta de nuevo.");
                    backScene();
                }
            },
            () => {
                console.log("Diálogo cerrado.");
            }
        );
    }

    // Cargar el modelo antes de ejecutar
    await loadModel();

    // Configuración del fondo y elementos de la escena
    const background = k.add([
        k.sprite("background_level_02"),
        k.scale(1, 0.9),
        k.pos(-150, 0),
    ]);

    k.add([
        k.rect(canvasWidth, 200),
        k.pos(0, canvasHeight - 50),
        k.area(),
        k.body({ isStatic: true }),
        k.color(k.Color.fromHex("#2e4053")),
    ]);

    const player = k.make([
        k.sprite("character"),
        { anim: "idle" },
        k.area({
            shape: new k.Rect(new k.vec2(0), 26, 26),
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
        "player",
    ]);

    const enemies_one = k.add([
        k.sprite("enemies_one"),
        k.pos(200, canvasHeight - 50),
        k.area({
            shape: new k.Rect(k.vec2(0), 30, 40),
        }),
        k.body(),
        { anim: "idle" },
        k.anchor("center"),
        k.scale(8),
    ]);

    const gravity = 200;
    k.setGravity(gravity);

    enemies_one.play("idle");
    k.add(player);

    // Llamar al diálogo introductorio cuando todo esté listo
    await introDialogue();
}
