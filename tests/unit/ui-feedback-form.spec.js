import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DialogFooter from '../../src/components/ui/DialogFooter.vue';
import EmptyState from '../../src/components/ui/EmptyState.vue';
import FormDialog from '../../src/components/ui/FormDialog.vue';
import FormSection from '../../src/components/ui/FormSection.vue';
import InfoBanner from '../../src/components/ui/InfoBanner.vue';
import { mountOptions } from './helpers';

describe('表单与反馈组件', () => {
  it('InfoBanner 应显示类型、标题、说明和操作插槽', () => {
    const wrapper = mount(InfoBanner, {
      props: { type: 'warning', title: '资料待补充', description: '仍有 2 项未填写。' },
      slots: { actions: '<button>立即处理</button>' },
    });

    expect(wrapper.classes()).toContain('is-warning');
    expect(wrapper.text()).toContain('资料待补充');
    expect(wrapper.text()).toContain('立即处理');
  });

  it('EmptyState 应传递标题、说明和操作插槽', () => {
    const wrapper = mount(EmptyState, {
      props: { title: '暂无订单', description: '建立订单后会显示在这里。', imageSize: 80 },
      slots: { actions: '<button>新增订单</button>' },
      global: mountOptions.global,
    });

    expect(wrapper.get('[data-test="empty"]').attributes('data-size')).toBe('80');
    expect(wrapper.text()).toContain('暂无订单');
    expect(wrapper.text()).toContain('新增订单');
  });

  it('FormSection 应传递列数、标题和说明', () => {
    const wrapper = mount(FormSection, {
      props: { title: '基础资料', description: '填写必要字段', columns: 3 },
      slots: { default: '<input /><input />' },
    });

    expect(wrapper.find('h3').text()).toBe('基础资料');
    expect(wrapper.text()).toContain('填写必要字段');
    expect(wrapper.find('.ui-form-section__body').attributes('style')).toContain('--app-form-columns: 3');
  });

  it('DialogFooter 应触发确认和取消事件', async () => {
    const wrapper = mount(DialogFooter, {
      props: { confirmText: '保存资料', cancelText: '暂不保存' },
      global: mountOptions.global,
    });

    await wrapper.findAll('button')[0].trigger('click');
    await wrapper.findAll('button')[1].trigger('click');

    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('FormDialog 应传递弹窗 Props，并在取消时关闭和派发事件', async () => {
    const wrapper = mount(FormDialog, {
      props: { modelValue: true, title: '新增车辆', width: '720px' },
      slots: { default: '<div>表单内容</div>' },
      global: mountOptions.global,
    });

    const dialog = wrapper.get('[data-test="dialog"]');
    expect(dialog.attributes('data-visible')).toBe('true');
    expect(dialog.attributes('data-title')).toBe('新增车辆');
    expect(dialog.attributes('data-width')).toBe('720px');
    expect(wrapper.text()).toContain('表单内容');

    await wrapper.findAll('button')[0].trigger('click');

    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });
});
