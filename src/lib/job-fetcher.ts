// Job fetching service for Adzuna and RemoteOK APIs

export interface ExternalJob {
  id: string;
  slug: string;
  title: string;
  company: string;
  location: string;
  type: string;
  status: string;
  description: string;
  requirements: string;
  languageRequired: string;
  languageLevel: string;
  salary: string | null;
  currency: string | null;
  applicationUrl: string | null;
  email: string | null;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  expiresAt: string | null;
  source: 'adzuna' | 'remoteok';
}

// Country code mapping for Adzuna API
const ADZUNA_COUNTRY_MAP: Record<string, string> = {
  japan: 'jp',
  korea: 'kr',
  uk: 'gb',
  us: 'us',
  australia: 'au',
  canada: 'ca',
  germany: 'de',
  france: 'fr',
  netherlands: 'nl',
  poland: 'pl',
  singapore: 'sg',
  india: 'in',
};

// Country keyword mapping for RemoteOK filtering
const REMOTEOK_COUNTRY_MAP: Record<string, string[]> = {
  japan: ['japan', 'tokyo', 'osaka', 'kyoto', 'asia', 'apac'],
  korea: ['korea', 'south korea', 'seoul', 'asia', 'apac'],
  australia: ['australia', 'sydney', 'melbourne', 'brisbane', 'apac'],
  uk: ['united kingdom', 'london', 'england', 'europe'],
  us: ['united states', 'usa', 'us', 'remote'],
  canada: ['canada', 'toronto', 'vancouver', 'north america'],
  germany: ['germany', 'berlin', 'munich', 'europe'],
  france: ['france', 'paris', 'europe'],
  netherlands: ['netherlands', 'amsterdam', 'europe'],
  poland: ['poland', 'warsaw', 'europe'],
  singapore: ['singapore', 'asia', 'apac'],
  india: ['india', 'bangalore', 'mumbai', 'delhi', 'asia'],
};

function getAdzunaCountry(country: string): string {
  return ADZUNA_COUNTRY_MAP[country.toLowerCase()] || 'jp';
}

function getRemoteOKKeywords(country: string): string[] {
  return REMOTEOK_COUNTRY_MAP[country.toLowerCase()] || ['remote', 'global'];
}

function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base}-${id}`;
}

function extractRequirements(description: string): string {
  // Try to extract requirements section from description
  const reqMatch = description.match(
    /(?:requirements?|qualifications?|what you(?:'|’)ll need|you(?:'|’)ll need)[:\s]*([\s\S]*?)(?:\n\s*(?:benefits?|about|how to apply|apply now)|$)/i
  );
  if (reqMatch && reqMatch[1]) {
    return reqMatch[1].trim().slice(0, 2000);
  }
  // Fallback: return first 500 chars of description
  return description.slice(0, 500);
}

function extractLanguage(description: string, title: string): string {
  const text = `${title} ${description}`.toLowerCase();
  const languages: Record<string, string> = {
    japanese: 'Japanese',
    japan: 'Japanese',
    korean: 'Korean',
    korea: 'Korean',
    english: 'English',
    chinese: 'Chinese',
    mandarin: 'Chinese',
    spanish: 'Spanish',
    french: 'French',
    german: 'German',
  };
  for (const [key, value] of Object.entries(languages)) {
    if (text.includes(key)) return value;
  }
  return 'English';
}

function extractLanguageLevel(description: string): string {
  const text = description.toLowerCase();
  if (text.includes('native')) return 'PROFICIENT';
  if (text.includes('fluent')) return 'ADVANCED';
  if (text.includes('business')) return 'UPPER_INTERMEDIATE';
  if (text.includes('intermediate')) return 'INTERMEDIATE';
  if (text.includes('basic') || text.includes('beginner')) return 'BEGINNER';
  return 'INTERMEDIATE';
}

function extractJobType(type: string | null, description: string): string {
  const t = (type || '').toUpperCase();
  const text = description.toLowerCase();
  if (t.includes('PART') || text.includes('part-time') || text.includes('part time')) return 'PART_TIME';
  if (t.includes('CONTRACT') || text.includes('contract')) return 'CONTRACT';
  if (t.includes('INTERN') || text.includes('internship')) return 'INTERNSHIP';
  return 'FULL_TIME';
}

function extractSalary(salaryMin: number | null, salaryMax: number | null, currency: string | null): { salary: string | null; currency: string | null } {
  if (!salaryMin && !salaryMax) return { salary: null, currency: null };
  const curr = currency || 'USD';
  if (salaryMin && salaryMax) {
    return { salary: `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`, currency: curr };
  }
  if (salaryMin) return { salary: `${salaryMin.toLocaleString()}+`, currency: curr };
  return { salary: `${salaryMax?.toLocaleString() || ''}`, currency: curr };
}

/**
 * Fetch jobs from Adzuna API
 * Requires ADZUNA_APP_ID and ADZUNA_APP_KEY environment variables
 */
export async function fetchFromAdzuna(
  query: string = '',
  country: string = 'japan',
  limit: number = 20
): Promise<ExternalJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  // If no credentials, skip Adzuna
  if (!appId || !appKey) {
    console.log('[Adzuna] Skipping - ADZUNA_APP_ID or ADZUNA_APP_KEY not configured');
    return [];
  }

  const countryCode = getAdzunaCountry(country);
  const searchQuery = query ? `&what=${encodeURIComponent(query)}` : '';
  const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=${limit}&content_type=application/json${searchQuery}`;

  console.log('[Adzuna] Fetching:', url.replace(appKey, '***'));

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('[Adzuna] API Error:', response.status, await response.text());
      return [];
    }

    const json = await response.json();

    if (!json.results || !Array.isArray(json.results)) {
      console.error('[Adzuna] Invalid response format');
      return [];
    }

    console.log(`[Adzuna] Fetched ${json.results.length} jobs`);

    return json.results.map((job: any) => {
      const { salary, currency } = extractSalary(
        job.salary_min,
        job.salary_max,
        job.salary_is_predicted ? null : job.currency
      );
      const description = job.description || '';
      const title = job.title || 'Untitled Position';
      const id = `adzuna-${job.id}`;

      return {
        id,
        slug: generateSlug(title, String(job.id)),
        title,
        company: job.company?.display_name || 'Unknown Company',
        location: job.location?.display_name || 'Remote / Global',
        type: extractJobType(job.contract_type, description),
        status: 'ACTIVE',
        description: description.slice(0, 5000),
        requirements: extractRequirements(description),
        languageRequired: extractLanguage(description, title),
        languageLevel: extractLanguageLevel(description),
        salary,
        currency,
        applicationUrl: job.redirect_url || null,
        email: null,
        viewCount: 0,
        applicationCount: 0,
        createdAt: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
        expiresAt: null,
        source: 'adzuna' as const,
      };
    });
  } catch (err) {
    console.error('[Adzuna] Fetch error:', err);
    return [];
  }
}

/**
 * Fetch jobs from RemoteOK API
 * No API key required
 */
export async function fetchFromRemoteOK(
  query: string = '',
  country: string = 'japan',
  limit: number = 20
): Promise<ExternalJob[]> {
  const url = 'https://remoteok.com/api';

  console.log('[RemoteOK] Fetching:', url);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      console.error('[RemoteOK] API Error:', response.status);
      return [];
    }

    let data = await response.json();

    // Remove the first metadata object
    data = data.filter((job: any) => job.position);

    console.log(`[RemoteOK] Fetched ${data.length} total jobs`);

    // Filter by country keywords
    const keywords = getRemoteOKKeywords(country);
    const q = query.toLowerCase();

    const filtered = data.filter((job: any) => {
      const loc = job.location?.toLowerCase() || '';
      const tags = Array.isArray(job.tags) ? job.tags.join(' ').toLowerCase() : '';
      const title = job.position?.toLowerCase() || '';
      const company = job.company?.toLowerCase() || '';
      const desc = job.description?.toLowerCase() || '';

      const matchCountry = keywords.some((k) =>
        loc.includes(k) || tags.includes(k) || title.includes(k) || desc.includes(k)
      );

      const matchQuery = !q || title.includes(q) || company.includes(q) || tags.includes(q);

      return matchCountry && matchQuery;
    });

    console.log(`[RemoteOK] Filtered ${filtered.length} jobs for country: ${country}`);

    return filtered.map((job: any) => {
      const description = job.description || '';
      const title = job.position || 'Untitled Position';
      const id = `remoteok-${job.id}`;
      const { salary, currency } = extractSalary(
        job.salary_min,
        job.salary_max,
        job.salary_currency
      );

      return {
        id,
        slug: generateSlug(title, String(job.id)),
        title,
        company: job.company || 'Unknown Company',
        location: job.location || 'Remote / Global',
        type: extractJobType(job.type, description),
        status: 'ACTIVE',
        description: description.slice(0, 5000),
        requirements: extractRequirements(description),
        languageRequired: extractLanguage(description, title),
        languageLevel: extractLanguageLevel(description),
        salary,
        currency,
        applicationUrl: job.apply_url || job.url || null,
        email: null,
        viewCount: 0,
        applicationCount: 0,
        createdAt: job.date ? new Date(job.date).toISOString() : new Date().toISOString(),
        expiresAt: null,
        source: 'remoteok' as const,
      };
    });
  } catch (err) {
    console.error('[RemoteOK] Fetch error:', err);
    return [];
  }
}
