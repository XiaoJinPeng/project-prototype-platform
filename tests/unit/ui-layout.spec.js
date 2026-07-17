import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import ContentPanel from '../../src/components/ui/ContentPanel.vue';
import PageHeader from '../../src/components/ui/PageHeader.vue';
import PageLayout from '../../src/components/ui/PageLayout.vue';
import SummaryGrid from '../../src/components/ui/SummaryGrid.vue';

describe('页面与布局组件', () => {
  it('PageLayout 应渲染内容、紧凑状态和宽度限制', () => {
    const wrapper = mount(PageLayout, {
      props: { compact: true, maxWidth: '960px' },
      slots: { default: '<p>页面内容</p>' },
    });

    expect(wrapper.classes()).toContain('ui-page-layout');
    expect(wrapper.classes()).toContain('is-compact');
    expect(wrapper.attributes('style')).toContain('max-width: 960px');
    expect(wrapper.text()).toContain('页面内容');
  });

  it('SummaryGrid 应将列数和最小宽度传递为 CSS 变量', () => {
    const wrapper = mount(SummaryGrid, {
      props: { columns: 3, minItemWidth: '220px' },
      slots: { default: '<div>统计项</div>' },
    });

    expect(wrapper.attributes('style')).toContain('--app-summary-columns: 3');
    expect(wrapper.attributes('style')).toContain('--app-summary-min-width: 220px');
    expect(wrapper.text()).toContain('统计项');
  });

  it('PageHeader 应显示标题、说明和操作插槽', () => {
    const wrapper = mount(PageHeader, {
      props: { title: '车辆管理', description: '管理车辆资料', titleClass: 'custom-title' },
      slots: { actions: '<button>新增车辆</button>' },
    });

    expect(wrapper.find('h1').text()).toBe('车辆管理');
    expect(wrapper.find('h1').classes()).toContain('custom-title');
    expect(wrapper.find('p').text()).toBe('管理车辆资料');
    expect(wrapper.text()).toContain('新增车辆');
  });

  it('ContentPanel 应支持标题、操作插槽和无内边距模式', () => {
    const wrapper = mount(ContentPanel, {
      props: { title: '订单资料', padded: false },
      slots: { default: '<div>表单内容</div>', actions: '<button>编辑</button>' },
    });

    expect(wrapper.find('h2').text()).toBe('订单资料');
    expect(wrapper.text()).toContain('编辑');
    expect(wrapper.find('.ui-content-panel__body').classes()).not.toContain('is-padded');
  });
});
