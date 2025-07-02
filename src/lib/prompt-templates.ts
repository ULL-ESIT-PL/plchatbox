// Promp para determinar el tema sobre el que trata la pregunta del usuario.
export const TOPIC_TEMPLATE = `
Dado el siguiente texto del usuario:
"""
{input}
"""
dadas las siguientes categorías descripciones de temas determina el tema más relevante:

1. type-checking: Preguntas sobre tipos de datos, sistemas de tipos, tipado estático/dinámico, polimorfismo, currying, funciones de orden superior, inferencia de tipos, etc. o funciones de orden superior en lenguajes funcionales.

En general, cualquier pregunta que trate sobre cómo se asignan, comprueban o infieren los tipos de datos en lenguajes de programación o compiladores entra dentro de este tema. 
 
2. code-generation: Preguntas sobre bytecode, JIT, motores como V8, optimización, profiling, o compilación de código.

También se incluye cualquier pregunta que aborde el uso práctico o técnico del motor V8 para performance, compilación, análisis de código, o integración con C++.

3. translation: Preguntas sobre cómo añadir nuevas construcciones a un lenguaje, modificar la gramática, generar AST, traducir a otro lenguaje, etc.


Responde únicamente con el nombre del tema (type-checking, code-generation, translation) que más se relaciona. No des ninguna explicación. Limitate a los temas listados arriba. Si no hay coincidencia, responde "Ninguno".
`;

// Prompt para generar una respuesta a partir de un contexto dado
export const ANSWER_TEMPLATE = `Responde la siguiente pregunta del usuario usando unicamente el contexto proporcionado. Si no hay suficiente información, responde que no lo sabes.

Contexto:
{context}

Pregunta:
{query}
`;