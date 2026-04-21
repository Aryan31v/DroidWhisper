/**
 * formattingService.js
 * Semantic Local Flow for DroidWhisper (Whispr Flow Logic).
 * Deterministic text polish without API keys.
 */

/**
 * Normalizes tech acronyms to correct casing.
 */
const ACRONYM_MAP = {
  'ai': 'AI',
  'ui': 'UI',
  'ux': 'UX',
  'api': 'API',
  'cli': 'CLI',
  'html': 'HTML',
  'css': 'CSS',
  'js': 'JS',
  'vscode': 'VSCode',
  'droidwhisper': 'DroidWhisper',
  'github': 'GitHub',
  'git': 'Git',
  'url': 'URL',
  'http': 'HTTP',
  'https': 'HTTPS',
  'scrcpy': 'scrcpy',
  'xdotool': 'xdotool',
  'xclip': 'xclip',
  'groq': 'Groq',
  'llama': 'Llama',
  'whisper': 'Whisper',
  'k8s': 'K8s',
  'docker': 'Docker',
  'sql': 'SQL',
  'nosql': 'NoSQL',
  'aws': 'AWS',
  'gcp': 'GCP',
  'azure': 'Azure',
  'json': 'JSON',
  'yaml': 'YAML',
  'xml': 'XML'
};

/**
 * Question detection starters.
 */
const QUESTION_STARTERS = [
  'who', 'what', 'where', 'when', 'why', 'how', 
  'is', 'are', 'do', 'does', 'can', 'could', 
  'would', 'should', 'am', 'shall', 'will'
];

/**
 * Semantic Local Pipeline
 */
const formatLiteral = (text) => {
  if (!text) return '';

  let formatted = text.trim();

  // 1. Scrub Filler Words (Whispr Flow Style)
  // Removes "um", "ah", "uh" while preserving words like "umbrella" or "ahead"
  formatted = formatted.replace(/\b(um|uh|ah)\b,?\s?/gi, '');

  // 2. Semantic Commands (Rule-based)
  formatted = formatted
    .replace(/\b(enter|new paragraph|newline)\b/gi, '\n\n')
    .replace(/\b(comma)\b/gi, ',')
    .replace(/\b(full stop|period)\b/gi, '.')
    .replace(/\b(question mark)\b/gi, '?')
    .replace(/\b(exclamation mark)\b/gi, '!');

  // 3. Smart List Conversion
  // Detects "bullet point X" or "next point" and converts to a bullet list
  formatted = formatted
    .replace(/\b(bullet point|next point|point)\b\s?/gi, '\n• ')
    .replace(/• \s+/g, '• ');

  // 4. Tech Acronym Normalization
  Object.keys(ACRONYM_MAP).forEach(key => {
    const regex = new RegExp(`\\b${key}\\b`, 'gi');
    formatted = formatted.replace(regex, ACRONYM_MAP[key]);
  });

  // 5. Spacing & Basic Punctuation Cleanup
  formatted = formatted
    .replace(/\s+([,.?!;:]) /g, '$1 ')
    .replace(/\s+([,.?!;:])$/g, '$1')
    .replace(/ +/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n');

  // 6. Sentence Intelligence (Capitalization)
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  formatted = formatted.replace(/([.?!])\s+([a-z])/g, (match, p1, p2) => {
    return p1 + ' ' + p2.toUpperCase();
  });

  // 7. Question Intelligence
  // If a sentence starts with a question word and doesn't have a question mark, add it.
  formatted = formatted.replace(/(^|\n|[\.!\?]\s+)([A-Z][a-z]+)\s+([^.?!]+)/g, (match, prefix, firstWord, rest) => {
    if (QUESTION_STARTERS.includes(firstWord.toLowerCase())) {
        // Only append ? if the segment doesn't already end in punctuation
        if (!rest.match(/[.?!]$/)) {
            return prefix + firstWord + ' ' + rest.trim() + '?';
        }
    }
    return match;
  });

  return formatted.trim();
};

module.exports = {
  formatLiteral
};
