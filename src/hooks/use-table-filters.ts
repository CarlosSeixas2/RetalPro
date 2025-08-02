import { useState, useMemo } from "react";

export interface FilterConfig {
  key: string;
  value: string;
  label: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface TableFiltersState {
  search: string;
  filters: FilterConfig[];
  sort: SortConfig | null;
  page: number;
  itemsPerPage: number;
}

export interface UseTableFiltersOptions<T> {
  data: T[];
  searchFields?: (keyof T)[];
  defaultItemsPerPage?: number;
  defaultSort?: SortConfig | null;
}

export function useTableFilters<T>({
  data,
  searchFields = [],
  defaultItemsPerPage = 10,
  defaultSort = null as SortConfig | null,
}: UseTableFiltersOptions<T>) {
  const [state, setState] = useState<TableFiltersState>({
    search: "",
    filters: [],
    sort: defaultSort,
    page: 1,
    itemsPerPage: defaultItemsPerPage,
  });

  const filteredData = useMemo(() => {
    let result = [...data];

    // Aplicar busca
    if (state.search && searchFields.length > 0) {
      const searchLower = state.search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Aplicar filtros
    state.filters.forEach((filter) => {
      result = result.filter((item) => {
        const value = item[filter.key as keyof T];
        return String(value).toLowerCase().includes(filter.value.toLowerCase());
      });
    });

    // Aplicar ordenação
    if (state.sort) {
      result.sort((a, b) => {
        const aValue = a[state.sort!.key as keyof T];
        const bValue = b[state.sort!.key as keyof T];

        if (aValue < bValue) return state.sort!.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return state.sort!.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, state, searchFields]);

  const paginatedData = useMemo(() => {
    const startIndex = (state.page - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, state.page, state.itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / state.itemsPerPage);

  const setSearch = (search: string) => {
    setState((prev) => ({ ...prev, search, page: 1 }));
  };

  const addFilter = (filter: FilterConfig) => {
    setState((prev) => ({
      ...prev,
      filters: [...prev.filters.filter((f) => f.key !== filter.key), filter],
      page: 1,
    }));
  };

  const removeFilter = (key: string) => {
    setState((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.key !== key),
      page: 1,
    }));
  };

  const clearFilters = () => {
    setState((prev) => ({
      ...prev,
      search: "",
      filters: [],
      page: 1,
    }));
  };

  const setSort = (sort: SortConfig | null) => {
    setState((prev) => ({ ...prev, sort, page: 1 }));
  };

  const setPage = (page: number) => {
    setState((prev) => ({ ...prev, page }));
  };

  const setItemsPerPage = (itemsPerPage: number) => {
    setState((prev) => ({ ...prev, itemsPerPage, page: 1 }));
  };

  return {
    // Estado
    search: state.search,
    filters: state.filters,
    sort: state.sort,
    page: state.page,
    itemsPerPage: state.itemsPerPage,
    
    // Dados processados
    filteredData,
    paginatedData,
    totalItems: filteredData.length,
    totalPages,
    
    // Ações
    setSearch,
    addFilter,
    removeFilter,
    clearFilters,
    setSort,
    setPage,
    setItemsPerPage,
  };
} 