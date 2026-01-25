// Cache for subreddit search requests
const requestCache = new Map<string, { data: string[]; timestamp: number }>();
const MAX_CACHE_SIZE = 10;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(query: string): string {
  return query.trim().toLowerCase();
}

function getCachedResult(query: string): string[] | null {
  const key = getCacheKey(query);
  const cached = requestCache.get(key);
  
  if (!cached) {
    return null;
  }

  // Check if cache is still valid
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    requestCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCachedResult(query: string, data: string[]): void {
  const key = getCacheKey(query);
  
  // Limit cache size to MAX_CACHE_SIZE
  if (requestCache.size >= MAX_CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = requestCache.keys().next().value;
    requestCache.delete(firstKey);
  }

  requestCache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

export async function searchSubreddits(
  query: string,
  apiUrl: string = '/api/reddit/subreddits/search'
): Promise<string[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  // Check cache first
  const cached = getCachedResult(query);
  if (cached !== null) {
    return cached;
  }

  try {
    const response = await fetch(`${apiUrl}?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();
    const suggestions = result.suggestions?.map((s: { name: string }) => s.name) || [];
    
    // Cache the result
    setCachedResult(query, suggestions);
    
    return suggestions;
  } catch (error) {
    console.error('Error searching subreddits:', error);
    return [];
  }
}
