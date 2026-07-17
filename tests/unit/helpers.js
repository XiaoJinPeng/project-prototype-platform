import { defineComponent } from 'vue';

export const elementStubs = {
  ElButton: defineComponent({
    emits: ['click'],
    template: '<button :disabled="$attrs.disabled" @click="$emit(\'click\')"><slot /></button>',
  }),
  ElTooltip: defineComponent({
    props: ['content', 'placement'],
    template: '<span data-test="tooltip" :data-content="content" :data-placement="placement"><slot /></span>',
  }),
  ElFormItem: defineComponent({
    props: ['label', 'required'],
    template:
      '<label data-test="form-item" :data-required="required"><span>{{ label }}</span><slot /></label>',
  }),
  ElInput: defineComponent({
    props: ['modelValue', 'placeholder'],
    emits: ['update:modelValue'],
    template:
      '<textarea :value="modelValue" :placeholder="placeholder" @input="$emit(\'update:modelValue\', $event.target.value)" />',
  }),
  ElIcon: defineComponent({
    template: '<span data-test="icon"><slot /></span>',
  }),
  ElTag: defineComponent({
    template: '<span data-test="tag"><slot /></span>',
  }),
  ElDropdown: defineComponent({
    props: ['disabled'],
    emits: ['command'],
    template: '<div data-test="dropdown" :data-disabled="disabled"><slot /><slot name="dropdown" /></div>',
  }),
  ElDropdownMenu: defineComponent({
    template: '<div data-test="dropdown-menu"><slot /></div>',
  }),
  ElDropdownItem: defineComponent({
    props: ['command', 'disabled'],
    template: '<button :disabled="disabled"><slot /></button>',
  }),
  ElDialog: defineComponent({
    props: ['modelValue', 'title', 'width'],
    emits: ['update:modelValue'],
    template:
      '<section data-test="dialog" :data-visible="modelValue" :data-title="title" :data-width="width"><slot /><slot name="footer" /></section>',
  }),
  ElEmpty: defineComponent({
    props: ['description', 'imageSize'],
    template: '<div data-test="empty" :data-size="imageSize">{{ description }}<slot /></div>',
  }),
  ElPagination: defineComponent({
    props: ['currentPage', 'pageSize', 'total'],
    emits: ['update:current-page', 'update:page-size', 'current-change', 'size-change'],
    template:
      '<div data-test="pagination" :data-page="currentPage" :data-size="pageSize" :data-total="total"><button data-test="next-page" @click="$emit(\'update:current-page\', currentPage + 1); $emit(\'current-change\', currentPage + 1)">next</button><button data-test="next-size" @click="$emit(\'update:page-size\', 20); $emit(\'size-change\', 20)">size</button></div>',
  }),
};

export const mountOptions = {
  global: {
    stubs: elementStubs,
    directives: {
      loading: {},
    },
  },
};
