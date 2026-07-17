import { reactive } from 'vue';

export function useResettableFilters(createInitialState) {
  const buildInitialState =
    typeof createInitialState === 'function' ? createInitialState : () => ({ ...createInitialState });
  const filters = reactive(buildInitialState());

  const resetFilters = () => {
    const initialState = buildInitialState();
    Object.keys(filters).forEach((key) => delete filters[key]);
    Object.assign(filters, initialState);
  };

  return { filters, resetFilters };
}
