import logica from "../scripts/logica";
let allTfgs = [];
let tfgsNoVistos = [];
let tfgsConLikes = [];

const usuarioPrueba = "alu_laura";

describe("Pruebas de TFGs visibles para un usuario en la página principal", () => {

    //Obtenemos los datos antes de las pruebas
    beforeAll(async () => {
        allTfgs = await logica.allTfgs();
        tfgsNoVistos = await logica.tfgsNoVistos(usuarioPrueba);
        tfgsConLikes = await logica.likesUsuario(usuarioPrueba);
    });

    afterAll(async () => {
        // Cierra la conexión a la BD para que Jest pueda salir
        await logica.finPrueba();
    });

    test("Los TFGs no vistos deben ser correctos según los 'Me gusta' del usuario", () => {

        if (tfgsConLikes.length === 0) {
            console.log("Ejecutando aserción: Sin 'Me gusta'");
            expect(tfgsNoVistos.length).toBe(allTfgs.length);
        } else {
            console.log("Ejecutando aserciónes: Con 'Me gusta'");
            console.log("Hay menos tfgs no vistos que el total de tfgs.");

            expect(tfgsNoVistos.length).toBeLessThan(allTfgs.length);

            const tfgsConLikesNombres = tfgsConLikes.map(tfg => tfg.tfg);
            const tfgsNoVistosNombres = tfgsNoVistos.map(tfg => tfg.nombre);
            
            console.log("Los tfgs con me gusta no apareceran en no vistos.");
            tfgsConLikesNombres.forEach(likedTfg => {
                expect(tfgsNoVistosNombres).not.toContain(likedTfg);
            });
        }
    });
});