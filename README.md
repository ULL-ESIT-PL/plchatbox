# # Documentación de la aplicación
# ## PL Chatbot
Esta aplicación es un chatbot que utiliza OpenAI y Pinecone para responder preguntas sobre el temario de la asignatura de Programación de Lenguajes. 

## Requisitos
- npm (Node Package Manager)
- Claves de API de OpenAI y Pinecone

## Instalación y uso
Para instalar y utilizar la aplicación, sigue estos pasos:

1. **Instalación de dependencias**:
   Asegúrate de tener Node.js y npm instalados. Luego, en la raíz del proyecto, ejecuta:
   ```bash
   npm install
   ```

2. **Configuración del entorno**:
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables de entorno:
    ```plaintext
    OPENAI_API_KEY="tu_clave_de_api_de_openai"
    PINECONE_API_KEY="tu_clave_de_api_de_pinecone"
    PINECONE_ENVIRONMENT='tu_entorno_de_pinecone'
    PINECONE_INDEX_NAME='tu_nombre_de_indice_de_pinecone'
    TOPICS_PATH='ruta/a/tu/directorio/de/temas'
    DOCUMENT_INDEX_PATH='./document_index.json'
    TOPICS_WITH_SUBTOPICS_INDEX_PATH='./src/lib/topics_with_subtopics_index.ts'
    INDEX_INIT_TIMEOUT=240000
    ```
    
3. **correr script de indexación**:
   Para indexar los documentos en Pinecone, ejecuta el siguiente comando:
   ```bash
   npm run prepare:data
   ```
   Este script leerá los archivos en el directorio especificado por `TOPICS_PATH`, extraerá su contenido y lo indexará en Pinecone.

4. **Correr script de indexación de temas con subtemas**:
   Para obtener un arreglo de los temas que contienen subtemas, ejecuta el siguiente comando, esto es necerasio para un correcto funcionamiento de la aplicación:
   ```bash
   npm run index:topics-with-subtopics
   ```
   Este script generará un archivo `topics_with_subtopics_index.ts` que contiene un arreglo de los temas que tienen subtemas. Este archivo se utiliza a la hora de generar las respuestas del chatbot.

5. **Modificar el archivo `prompt-templates.ts` (opcional)**:
   Si deseas personalizar el formato de las respuestas del chatbot, puedes modificar el archivo `src/lib/prompt-templates.ts`.
   
6. **Modificar el archivo `utils.ts` (opcional)**:
   Si deseas personalizar el mensaje inicial del chatbot, puedes modificar el archivo `src/lib/utils.ts`. Para cambiar el mensaje inicial, busca la constante `initialMessages` y modifica el contenido del mensaje de la siguiente manera:
   ```typescript
   export const initialMessages: Message[] = [
     {
       role: "assistant",
       content: "Nuevo mensaje inicial del chatbot",
     },
   ];
   ```   

7. **Iniciar el servidor**:
   Una vez que hayas indexado los documentos, puedes iniciar el servidor ejecutando:
   ```bash
   npm run dev
   ```
8. **Hacer consultas**:
    Abre tu navegador y ve a `http://localhost:3000`. Desde allí, podrás hacer consultas a la aplicación. Introduce tu pregunta en el campo de entrada y presiona "Ask" o tecla Enter. La aplicación buscará en los la base de datos de Pinecone y generará una respuesta utilizando OpenAI.