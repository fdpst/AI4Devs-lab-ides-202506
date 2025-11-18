PROMPT 1

Eres un experto fullstack con amplios conocimientos en node.js y react.js. Actualmente disponemos de un proyecto vacío y queremos comenzar agregar funcionalidades. Para conocer el proecto puedes leer el archivo readme.md que se encuentra en la raiz del proyecto para saber de que manera está estructurado el proyecto y que patrones hay que seguir.

En primer lugar, como experto en desarrollador fullstack quiero que te centres solo en la parte front. te voy a explicar una hstoria de usuario para que puedas analizarla y tener en cuenta todos lo necesario para crear el frontend 
Como reclutador,
Quiero tener la capacidad de añadir candidatos al sistema ATS,
Para que pueda gestionar sus datos y procesos de selección de manera eficiente.

Criterios de Aceptación:

Accesibilidad de la función: Debe haber un botón o enlace claramente visible para añadir un nuevo candidato desde la página principal del dashboard del reclutador.
Formulario de ingreso de datos: Al seleccionar la opción de añadir candidato, se debe presentar un formulario que incluya los campos necesarios para capturar la información del candidato como nombre, apellido, correo electrónico, teléfono, dirección, educación y experiencia laboral.
Validación de datos: El formulario debe validar los datos ingresados para asegurar que son completos y correctos. Por ejemplo, el correo electrónico debe tener un formato válido y los campos obligatorios no deben estar vacíos.
Carga de documentos: El reclutador debe tener la opción de cargar el CV del candidato en formato PDF o DOCX.
Confirmación de añadido: Una vez completado el formulario y enviada la información, debe aparecer un mensaje de confirmación indicando que el candidato ha sido añadido exitosamente al sistema.
Errores y manejo de excepciones: En caso de error (por ejemplo, fallo en la conexión con el servidor), el sistema debe mostrar un mensaje adecuado al usuario para informarle del problema.
Accesibilidad y compatibilidad: La funcionalidad debe ser accesible y compatible con diferentes dispositivos y navegadores web.
Notas:

La interfaz debe ser intuitiva y fácil de usar para minimizar el tiempo de entrenamiento necesario para los nuevos reclutadores.
Considerar la posibilidad de integrar funcionalidades de autocompletado para los campos de educación y experiencia laboral, basados en datos preexistentes en el sistema.

PROMPT 2
ahora me gustaría que te centrases el parte del backend. Me gustaría que generes el modelo, migraciones, lógica y todo lo que consideres necsarios para almacenar, listar, eliminar, editar (es decir, un crud completo) para los candidatos que gestionamos desde el formulario del frontend

PROMPT 3
ahora me gustaría que revises la seguridad y privacidad de los datos de los candidatos. Entre otras cosas que puedas ver interesante una de las tareas a realizar sería implementar unlogin para los reclutadores y que solamente los uusarios autorizados puedan ver estos datos. Para ello crea el crud de usuarios y por favor, especificame un usuario y contraseña inicial para poder acceder y la posibilidad de crear más usuarios

ERROR 1 Entro al programa y no hya pantalla de login

PROMPT 4
al acceder al programa debería de ver una pantalla de login y no la veo. puedes revisar si el sistema de login se ha configurado correctamente?

ERROR 2:
ERROR in src/services/api.ts:17:5
TS7053: Element implicitly has an 'any' type because expression of type '"Authorization"' can't be used to index type 'HeadersInit'.
  Property 'Authorization' does not exist on type 'HeadersInit'.
    15 |
    16 |   if (token) {
  > 17 |     headers['Authorization'] = `Bearer ${token}`;
       |     ^^^^^^^^^^^^^^^^^^^^^^^^
    18 |   }
    19 |
    20 |   const response = await fetch(url, {
ERROR in src/services/api.ts:17:5
TS7053: Element implicitly has an 'any' type because expression of type '"Authorization"' can't be used to index type 'HeadersInit'.
  Property 'Authorization' does not exist on type 'HeadersInit'.
    15 |
    16 |   if (token) {
  > 17 |     headers['Authorization'] = `Bearer ${token}`;
       |     ^^^^^^^^^^^^^^^^^^^^^^^^
    18 |   }
    19 |
    20 |   const response = await fetch(url, {

POMPT 5 con el error anterior lo soluciona y ya funciona el proyecto bien.
