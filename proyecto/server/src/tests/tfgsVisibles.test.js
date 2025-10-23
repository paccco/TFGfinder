import bdInstance from "../scripts/conexionBD";
let allTfgs = [];
let tfgsNoVistos = [];
let tfgsConLikes = [];

const usuarioPrueba = "alu_";

describe("Pruebas de TFGs visibles para un usuario en la página principal", () => {

    //Obtenemos los datos antes de las pruebas
    beforeAll(async () => {
        allTfgs = await bdInstance.getTodoslosTFG();
        tfgsNoVistos = await bdInstance.obtenerTFGnoVistos(usuarioPrueba);
        tfgsConLikes = await bdInstance.getLikesUsuario(usuarioPrueba);

        console.log("--- DATOS CARGADOS EN beforeAll ---");
        console.log(`Total TFGs: ${allTfgs.length}`);
        console.log(`No Vistos: ${tfgsNoVistos.length}`);
        console.log(`Con Likes: ${tfgsConLikes.length}`);
        console.log("---------------------------------");
    });

    afterAll(async () => {
        // Cierra la conexión a la BD para que Jest pueda salir
        await bdInstance.closePool();
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