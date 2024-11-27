export default async function figthOne(k) {

    const player = k.make([
        k.sprite("character"),
        { anim: "idle" },
        k.area({
            shape: new k.Rect(new k.vec2(0), 18, 18)
        }),
        k.body(),
        k.anchor("center"),
        k.pos(1000, 550),
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
    k.add(player);

    k.add([
        k.rect(9000, 700),
        k.area(),
        k.outline(2),
        k.pos(0, 650),
        k.body({ isStatic: true }),
    ]); 

    const enemies_one = k.add([
        k.sprite("enemies_one"),
        k.pos(100, 650),
        k.area(),
        k.body(),
        {anim: "idle"},
        k.scale(8)
    ])

   // Add the player to the scene
   enemies_one.play("idle");


    
}
