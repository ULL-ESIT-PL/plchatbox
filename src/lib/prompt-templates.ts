// Promp para determinar el tema sobre el que trata la pregunta del usuario.
export const TOPIC_TEMPLATE = `
Dado el siguiente texto del usuario:
"""
{input}
"""
dadas las siguientes descripciones de temas determina el tema más relevante:

1. type-checking: Preguntas sobre tipos de datos, sistemas de tipos, tipado estático/dinámico, polimorfismo, currying, funciones de orden superior, inferencia de tipos, etc. o funciones de orden superior en lenguajes funcionales.

En general, cualquier pregunta que trate sobre cómo se asignan, comprueban o infieren los tipos de datos en lenguajes de programación o compiladores entra dentro de este tema. 
 
2. code-generation: Preguntas sobre bytecode, JIT, motores como V8, optimización, profiling, o compilación de código.

También se incluye cualquier pregunta que aborde el uso práctico o técnico del motor V8 para performance, compilación, análisis de código, o integración con C++.

3. translation: Preguntas sobre cómo añadir nuevas construcciones a un lenguaje, modificar la gramática, generar AST, traducir a otro lenguaje, etc.


Responde únicamente con el nombre del tema (type-checking, code-generation, translation) que más se relaciona. No des ninguna explicación. Limitate a los temas listados arriba. Si no hay coincidencia, responde "Ninguno".
`;

// Prompt para generar una respuesta a partir de un contexto dado
export const ANSWER_TEMPLATE1 = `Responde la siguiente pregunta del usuario usando el contexto proporcionado. En el caso de ser codogo la respuesta, formatea el código en bloques de código Markdown. Si no hay suficiente información, indica que no puedes responder. 
Dados los siguientes enlaces, usa el primero como la fuente principal de información y los siguientes como posibles referencias adicionales.
enlaces:
{url}
Las url debe mostrarse en formato Markdown como similar [documentación relevante]({url}) y en negrita.

Contexto:
{context}

Pregunta:
{query}
`;

export const ANSWER_TEMPLATE = `Responde la siguiente pregunta del usuario utilizando la información contenida en los enlaces proporcionados. Usa el primer enlace como fuente principal, y los otros como referencias adicionales en caso de ser necesario.

Tu respuesta debe ser clara, completa y centrada en responder directamente la pregunta, no te limites a describir los enlaces. Si se requiere mostrar código, utiliza bloques de código Markdown correctamente formateados. Si no hay suficiente información en los enlaces, indícalo de forma clara.

Al final de tu respuesta, en un apartado llamado Fuentes, incluye los enlaces en el siguiente formato Markdown):

    Fuentes:
    **[Fuente principal]({url})**.
    Si hay más de un enlace, deben mostrarse como:
        Posibles referencias adicionales:
        - **[Referencia 1]({url1})**
        - **[Referencia 2]({url2})**


Aquí tienes los elementos necesarios:

    Enlaces:
    {url}

    Contexto:
    {context}

    Pregunta:
    {query}`;

export const SUBTOPIC_TEMPLATE_EXPRESIONES_REGULARES = `
Dado el siguiente texto del usuario:
"""
{input}
"""
y las siguientes categorías de subtemas en los diferentes archivos de documentación: 

-generacion-de-analizadores-lexicos. "Creación de analizadores léxicos en JavaScript usando expresiones regulares avanzadas."
-hello-js. "Ejsemplo práctico de uso de un generador de analizadores léxicos en JavaScript con tokens definidos mediante expresiones regulares."
-hello-unicode-js. "Ejemplo de analizador léxico Unicode-aware en JavaScript usando expresiones regulares con propiedades Unicode."
-introduccion-a-regexp. 
-regexp-en-otros-lenguajes. "Recopilación de recursos (enlaces) y apuntes sobre el uso de expresiones regulares en diversos lenguajes de programación y herramientas."
-regexpejercicios. "Conjunto de ejercicios prácticos de expresiones regulares que incluyen cadenas, números, y validación de números de teléfono."
-unicode-utf-16-and-js. 

Determina el subtema más relevante y responde únicamente con el nombre del archivo (generacion-de-analizadores-lexicos.mdx, hello-js.md, hello-unicode-js.md, introduccion-a-regexp.md, regexp-en-otros-lenguajes.md, regexpejercicios.md, unicode-utf-16-and-js.md) que más se relaciona. No des ninguna explicación. Limitate a los temas listados arriba. Si no hay coincidencia, responde "Ninguno".

`;

