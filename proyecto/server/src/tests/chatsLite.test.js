import logica from "../scripts/logica";

const usuarioPrueba = "prof_ana"; // El estudiante que estamos probando

// Almacenará los datos de prueba
let mapaProfTfg = {};
let likesUsuario = {};

describe("Comprobacion de que ambos usuarios hayan dado like", () => {

    /**
     * Prepara los datos antes de que se ejecuten los tests.
     * 1. Obtiene todos los chats del 'usuarioPrueba'.
     * 2. Crea 'mapaProfTfg': un objeto que mapea { profesor -> [lista de TFGs en chat] }.
     * 3. Crea 'likesUsuario': un objeto que mapea { profesor -> [lista de TFGs que le gustan] }.
     */
    beforeAll(async () => {
        // 1. Obtiene los chats
        const chatsUsuario = await logica.chatsUsuarioLite(usuarioPrueba);
        
        // 2. Crea el mapa de { Profesor -> [TFGs en chat] }
        mapaProfTfg = chatsUsuario.reduce((acumulador, chat) => {
            if (acumulador[chat.profesor]) {
                acumulador[chat.profesor].push(chat.tfg);
            } else {
                acumulador[chat.profesor] = [chat.tfg];
            }
            return acumulador;
        }, {});
        
        // 3. Obtiene los "likes" de cada profesor que tiene un chat
        const profesores = Object.keys(mapaProfTfg);
        
        // Crea un array de promesas
        const promesasDeLikes = profesores.map(async (prof) => {
            const likes = await logica.likesUsuario(prof);
            return { [prof]: likes };
        });

        // Espera a que todas las promesas se resuelvan
        const likesArray = await Promise.all(promesasDeLikes);
        likesUsuario = likesArray.reduce((acumulador, obj) => {
            const prof = Object.keys(obj)[0]; // Obtiene el nombre (ej: "prof_ana")
            // Extrae solo el nombre del TFG (ej: de {tfg: 'TFG1'} a 'TFG1')
            acumulador[prof] = obj[prof].map(like => like.tfg); 
            return acumulador;
        }, {});
    });

    afterAll(async () => {
        await logica.finPrueba();
    });

    /**
     * TEST: Comprueba que si existe un chat entre un profesor y un alumno sobre un TFG,
     * es porque ese profesor SÍ le ha dado like a ese TFG.
     */
    test("Los usuarios que tienen chats con el usuario de pruebas deben de haber dado like al tfg", async () => {    
        
        console.log("El usuario de pruebas tiene " + Object.keys(mapaProfTfg).length + " chats");
        Object.entries(mapaProfTfg).forEach(([profesor, tfgsEnChat]) => {
            expect(Object.keys(likesUsuario)).toContain(profesor);
            console.log("EL profesor " + profesor + " existe en los chats del usuario de prueba");
            tfgsEnChat.forEach(tfg => {
                expect(likesUsuario[profesor]).toContain(tfg);
            });
            console.log("El profesor " + profesor + " tiene todos los TFGs en comun con el usuario de prueba ");
        });
    });
});