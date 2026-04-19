/**
 * formattingService.js
 * Rule-based text formatting for DroidWhisper DICT mode.
 * Operates entirely locally without API calls.
 */

/**
 * Performs minor adjustments to transcription: capitalization, punctuation spacing,
 * and semantic command conversion.
 * @param {string} text - Raw transcription from Whisper.
 * @returns {string} Formatted text.
 */
const formatLiteral = (text) => {
  if (!text) return '';

  let formatted = text.trim();

  // 1. Semantic Commands (Rule-based)
  // Convert verbal cues into punctuation/whitespace
  formatted = formatted
    .replace(/\b(enter|new paragraph|newline)\b/gi, '\n\n')
    .replace(/\b(comma|full stop|period|question mark|exclamation mark)\b/gi, (match) => {
      const map = {
        'comma': ',',
        'full stop': '.',
        'period': '.',
        'question mark': '?',
        'exclamation mark': '!'
      };
      return map[match.toLowerCase()];
    });

  // 2. Fix Spacing around Punctuation
  // Remove spaces before punctuation, ensure space after if not end of string
  formatted = formatted
    .replace(/\s+([,.?!;:]) /g, '$1 ')
    .replace(/\s+([,.?!;:])$/g, '$1');

  // 3. Capitalization
  // Capitalize first letter of the entire block
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

  // Capitalize first letter after . ? or !
  formatted = formatted.replace(/([.?!])\s+([a-z])/g, (match, p1, p2) => {
    return p1 + ' ' + p2.toUpperCase();
  });

  // 4. Clean up excessive whitespace
  formatted = formatted.replace(/ +/g, ' ').replace(/\n /g, '\n').replace(/ \n/g, '\n');

  return formatted;
};

module.exports = {
  formatLiteral
};
