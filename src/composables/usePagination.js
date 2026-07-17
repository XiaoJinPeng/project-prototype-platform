import { computed, ref } from 'vue';

export function usePagination(options = {}) {
  const currentPage = ref(options.currentPage ?? 1);
  const pageSize = ref(options.pageSize ?? 10);
  const pageSizes = options.pageSizes ?? [10, 20, 50];
  const offset = computed(() => (currentPage.value - 1) * pageSize.value);
  const resetPage = () => {
    currentPage.value = 1;
  };
  const setPageSize = (value) => {
    pageSize.value = value;
    resetPage();
  };
  return { currentPage, pageSize, pageSizes, offset, resetPage, setPageSize };
}
