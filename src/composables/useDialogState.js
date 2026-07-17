import { ref } from 'vue';

export function useDialogState(initialValue = false) {
  const visible = ref(initialValue);
  const open = () => {
    visible.value = true;
  };
  const close = () => {
    visible.value = false;
  };
  const toggle = () => {
    visible.value = !visible.value;
  };
  return { visible, open, close, toggle };
}
