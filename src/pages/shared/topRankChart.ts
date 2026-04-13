export interface TopRankChartRow {
  name: string;
  fullName: string;
  registros: number;
}

export function buildTopRankChartData<T>(
  data: T[],
  options: {
    getName: (row: T) => string;
    getRegistros: (row: T) => number;
    truncateAt: number;
    limit?: number;
  }
): TopRankChartRow[] {
  const limit = options.limit ?? 10;

  return [...data]
    .sort((a, b) => options.getRegistros(b) - options.getRegistros(a))
    .slice(0, limit)
    .map((row) => {
      const fullName = options.getName(row);
      return {
        name: fullName.length > options.truncateAt ? `${fullName.slice(0, options.truncateAt)}…` : fullName,
        fullName,
        registros: options.getRegistros(row),
      };
    });
}
