export default async function fightTwoLevelThree(k, goBackScene){
    // k.add([
    //     k.text("fight 02 level 3"),
    //     k.pos(100, 100)
    // ])

    const canvasWidth = k.width();
    const canvasHeight = k.height();

    const map = k.add([
        k.sprite("back_fight02_level03"),
        k.pos(0, -180),
        k.scale(2.5, 2),
    ])

    k.add([
        k.rect(canvasWidth, 200),
        k.pos(0, canvasHeight - 50),
        k.area(),
        k.body({isStatic: true}),
        k.color(k.Color.fromHex(("#240a25")))
    ]);


    const boss02 = k.add([
        k.sprite("second_boss_level_03"),
        k.pos(200, canvasHeight - 100),
        k.body(),
        k.area({shape: new k.Rect(k.vec2(0), 25, 80)}),
        k.anchor("center"),
        k.scale(3),
        {anim: "idle"}
    ])



    let player = k.add([
        k.sprite("character"),
        { anim: "idle" },
        k.area({
            shape: new k.Rect(new k.vec2(0), 18, 22)
        }),
        k.body(),
        k.anchor("center"),
        k.pos(canvasWidth - 100, canvasHeight - 30),
        k.scale(4),
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


    boss02.play("idle");
    player.play("idle");

    k.onKeyPress("u", () =>{
        goBackScene()
    })
}