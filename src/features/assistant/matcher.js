import { FAQS } from '../../data/faqs.js';

// Intents about a concrete topic win over generic ones when both match
// ("experience with cloud" should answer about cloud, not about experience in general).
const SPECIFIC = new Set(['english', 'cv', 'cloud', 'ai', 'availability', 'location', 'site']);
const SOCIAL = new Set(['greeting', 'thanks']);

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9/+# ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function keywordScore(keyword, text, tokens) {
  if (keyword.includes(' ') || keyword.includes('/')) return text.includes(keyword) ? 2 : 0;
  // Very short keywords ("ai", "cv", "hi") must be whole words to avoid false hits.
  if (keyword.length <= 3) return tokens.includes(keyword) ? 1 : 0;
  return tokens.some((token) => token.startsWith(keyword)) ? 1 : 0;
}

/**
 * Finds the prepared answer that best fits a free-text question.
 * @returns {string | null} intent id, or null when nothing matches well enough
 */
export function matchIntent(question) {
  const text = normalize(question);
  if (!text) return null;
  const tokens = text.split(' ');

  let best = null;
  let bestScore = 0;
  for (const faq of FAQS) {
    let score = 0;
    for (const keyword of faq.keywords) score += keywordScore(keyword, text, tokens);
    if (score === 0) continue;
    if (SPECIFIC.has(faq.id)) score *= 1.5;
    // Greetings only win when the message is nothing more than a greeting.
    if (SOCIAL.has(faq.id)) score = tokens.length <= 4 ? score * 0.9 : score * 0.2;
    if (score > bestScore) {
      bestScore = score;
      best = faq.id;
    }
  }
  return bestScore >= 0.9 ? best : null;
}
