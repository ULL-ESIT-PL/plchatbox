import { NUM_SUBTOPICS } from "./config";
import { rankSubtemasPorRelevancia } from "./ranker";

async function search(query: string, topic_selected: string, topK = 5) {
  const pinecone = new Pinecone();
  const index = await pinecone.Index(PINECONE_INDEX_NAME);
  const embedding = await embedQuery(query);

  const hasSubtopic = topicWithSubtopics.includes(topic_selected);

  let filter;
 
  if (hasSubtopic) {
    // Obtener todos los matches sin filtro para rankear
    const rawResults = await index.query({
      vector: embedding,
      topK: 100, // suficiente para rankear subtemas
      includeMetadata: true,
    });

    const subtemasRanked = rankSubtemasPorRelevancia(rawResults.matches);
  //escoger los NUM_SUBTOPICS temas más relevantes
    subtemasSeleccionados = subtemasRanked.slice(0, NUM_SUBTOPICS).map(m => m.filename);

    // Seleccionar solo el subtema más relevante
    const subtemaTop = subtemasRanked[0];

    if (!subtemaTop) {
      // fallback: sin subtema válido
      filter = { tema: { $eq: topic_selected } };
    } else {
      filter = {
        filename: { $eq: subtemaTop }
      };
    }
  } else {
    // No hay subtemas asociados: filtrar por tema
    filter = { tema: { $eq: topic_selected } };
  }
  const finalResults = await index.query({
  vector: embedding,
      topK,
      includeMetadata: true,
      filter,
    });

  return finalResults.matches;
}

export function rankSubtemasPorRelevancia(matches: any[]): string[] {
  const α = 1.0;
  const β = 2.0;
  const γ = 1.5;

  const subtopicStats: Record<string, {
    totalScore: number;
    maxScore: number;
    numMatches: number;
  }> = {};

  matches.forEach((match) => {
    const subtopic = match.metadata?.filename;
    if (!subtopic) return;

    if (!subtopicStats[subtopic]) {
      subtopicStats[subtopic] = {
        totalScore: 0,
        maxScore: 0,
        numMatches: 0,
      };
    }
    subtopicStats[subtopic].totalScore += match.score || 0;
    subtopicStats[subtopic].maxScore = Math.max(subtopicStats[subtopic].maxScore, match.score || 0);
    subtopicStats[subtopic].numMatches += 1;
  });

  const ranked = Object.entries(subtopicStats)
    .map(([subtopic, stats]) => {
      const finalScore = α * stats.totalScore + β * stats.maxScore + γ * stats.numMatches;
      return { subtopic, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .map(({ subtopic }) => subtopic);

  return ranked;
}