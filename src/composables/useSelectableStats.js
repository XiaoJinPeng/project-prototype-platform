import { ref } from 'vue';

export function useSelectableStats(initialValue = null, options = {}) {
  const selectedStat = ref(initialValue);
  const allowEmpty = options.allowEmpty ?? true;

  const selectStat = (value) => {
    if (allowEmpty && selectedStat.value === value) {
      selectedStat.value = null;
      return null;
    }
    selectedStat.value = value;
    return value;
  };

  const clearStat = () => {
    selectedStat.value = null;
  };
  return { selectedStat, selectStat, clearStat };
}
