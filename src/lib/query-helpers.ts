export function getSearchParams(request: Request) {
    const url = new URL(request.url);
    return {
      page: parseInt(url.searchParams.get('page') || '1'),
      limit: parseInt(url.searchParams.get('limit') || '10'),
      search: url.searchParams.get('search') || undefined,
      sortBy: url.searchParams.get('sortBy') || 'createdAt',
      sortOrder: (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc',
    };
  }
  
  export function getPaginationParams(page: number, limit: number) {
    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }
  
  export function buildWhereClause(filters: Record<string, any>) {
    const where: any = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        where[key] = value;
      }
    });
    
    return where;
  }
  