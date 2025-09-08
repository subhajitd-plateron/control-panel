import searchData from '../data/searchData.json';

export interface SearchResult {
  name: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
  score: number;
  matchType: 'name' | 'description' | 'keyword';
  matchedTerm?: string;
}

/**
 * Calculate fuzzy match score between two strings
 * Higher score means better match
 */
function calculateFuzzyScore(query: string, target: string): number {
  const queryLower = query.toLowerCase().trim();
  const targetLower = target.toLowerCase();
  
  if (queryLower === targetLower) return 100;
  if (targetLower.includes(queryLower)) return 80;
  
  // Calculate character-based similarity
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < targetLower.length && queryIndex < queryLower.length; i++) {
    if (targetLower[i] === queryLower[queryIndex]) {
      score += 2;
      queryIndex++;
    }
  }
  
  // Bonus for matching at word boundaries
  const words = targetLower.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(queryLower)) {
      score += 20;
      break;
    }
    if (word.includes(queryLower)) {
      score += 10;
      break;
    }
  }
  
  // Penalty for length difference
  const lengthDiff = Math.abs(targetLower.length - queryLower.length);
  score -= lengthDiff * 0.5;
  
  return Math.max(0, score);
}

/**
 * Search through pages with fuzzy matching
 */
export function searchPages(query: string, maxResults: number = 10): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase().trim();
  
  for (const page of searchData.pages) {
    let bestScore = 0;
    let matchType: 'name' | 'description' | 'keyword' = 'name';
    let matchedTerm = '';
    
    // Search in name
    const nameScore = calculateFuzzyScore(queryLower, page.name);
    if (nameScore > bestScore) {
      bestScore = nameScore;
      matchType = 'name';
      matchedTerm = page.name;
    }
    
    // Search in description
    const descScore = calculateFuzzyScore(queryLower, page.description);
    if (descScore > bestScore) {
      bestScore = descScore * 0.8; // Slightly lower weight for description matches
      matchType = 'description';
      matchedTerm = page.description;
    }
    
    // Search in keywords
    for (const keyword of page.keywords) {
      const keywordScore = calculateFuzzyScore(queryLower, keyword);
      if (keywordScore > bestScore) {
        bestScore = keywordScore * 0.9; // Slightly lower weight for keyword matches
        matchType = 'keyword';
        matchedTerm = keyword;
      }
    }
    
    // Only include results with a minimum score threshold
    if (bestScore >= 10) {
      results.push({
        ...page,
        score: bestScore,
        matchType,
        matchedTerm
      });
    }
  }
  
  // Sort by score (highest first) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

/**
 * Highlight matching text in search results
 */
export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase();
  
  // Find the best matching substring
  let bestMatch = { start: -1, length: 0 };
  
  // Exact match
  let index = textLower.indexOf(queryLower);
  if (index !== -1) {
    bestMatch = { start: index, length: queryLower.length };
  } else {
    // Fuzzy match - find the longest consecutive matching sequence
    let maxLength = 0;
    let bestStart = -1;
    
    for (let i = 0; i <= textLower.length - queryLower.length; i++) {
      let length = 0;
      let queryIndex = 0;
      
      for (let j = i; j < textLower.length && queryIndex < queryLower.length; j++) {
        if (textLower[j] === queryLower[queryIndex]) {
          if (length === 0) bestStart = j;
          length++;
          queryIndex++;
        } else if (length > 0) {
          break;
        }
      }
      
      if (length > maxLength) {
        maxLength = length;
        bestMatch = { start: bestStart, length: maxLength };
      }
    }
  }
  
  if (bestMatch.start === -1) return text;
  
  const before = text.substring(0, bestMatch.start);
  const match = text.substring(bestMatch.start, bestMatch.start + bestMatch.length);
  const after = text.substring(bestMatch.start + bestMatch.length);
  
  return `${before}<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">${match}</mark>${after}`;
}
