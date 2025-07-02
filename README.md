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
    ```

3. **Iniciar el servidor**:
   Una vez que hayas indexado los documentos, puedes iniciar el servidor ejecutando:
   ```bash
   npm run dev
   ```
4. **Hacer consultas**:
    Abre tu navegador y ve a `http://localhost:3000`. Desde allí, podrás hacer consultas a la aplicación. Introduce tu pregunta en el campo de entrada y presiona "Ask" o tecla Enter. La aplicación buscará en los la base de datos de Pinecone y generará una respuesta utilizando OpenAI.