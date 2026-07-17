import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import DataTablePanel from '../../src/components/ui/DataTablePanel.vue';
import DetailList from '../../src/components/ui/DetailList.vue';
import EntityDetailHeader from '../../src/components/ui/EntityDetailHeader.vue';
import FileImportDialog from '../../src/components/ui/FileImportDialog.vue';
import FilterBar from '../../src/components/ui/FilterBar.vue';
import FilterIconButton from '../../src/components/ui/FilterIconButton.vue';
import ListActionGroup from '../../src/components/ui/ListActionGroup.vue';
import ReasonConfirmDialog from '../../src/components/ui/ReasonConfirmDialog.vue';
import StatCard from '../../src/components/ui/StatCard.vue';
import StatusTag from '../../src/components/ui/StatusTag.vue';
import TablePagination from '../../src/components/ui/TablePagination.vue';
import { mountOptions } from './helpers';

describe('查询与数据组件', () => {
  it('FilterBar 应展示字段、操作、摘要和高级筛选插槽', async () => {
    const wrapper = mount(FilterBar, {
      props: { advancedOpen: true, advancedCount: 2 },
      slots: {
        default: '<input value="关键词" />',
        actions: '<button>查询</button>',
        summary: '<span>共 10 笔</span>',
        advanced: '<div>高级条件</div>',
      },
      global: mountOptions.global,
    });

    expect(wrapper.text()).toContain('查询');
    expect(wrapper.text()).toContain('共 10 笔');
    expect(wrapper.text()).toContain('高级条件');
    expect(wrapper.text()).toContain('收起筛选');
    expect(wrapper.text()).toContain('2');
    await wrapper.get('.ui-filter-bar__advanced-toggle').trigger('click');
    expect(wrapper.emitted('update:advancedOpen')).toEqual([[false]]);
  });

  it('DataTablePanel 应支持子列表标题、筛选、数据区和分页插槽', () => {
    const wrapper = mount(DataTablePanel, {
      props: { title: '订单列表', totalText: '共 3 笔' },
      slots: {
        filters: '<div>筛选区</div>',
        default: '<table><tbody><tr><td>订单数据</td></tr></tbody></table>',
        pagination: '<div>翻页区</div>',
        actions: '<button>导出</button>',
      },
      global: mountOptions.global,
    });

    expect(wrapper.find('h2').text()).toBe('订单列表');
    expect(wrapper.text()).toContain('共 3 笔');
    expect(wrapper.text()).toContain('筛选区');
    expect(wrapper.text()).toContain('订单数据');
    expect(wrapper.text()).toContain('翻页区');
    expect(wrapper.text()).toContain('导出');
  });

  it('DataTablePanel 作为一级列表时不应生成空的二级标题栏', () => {
    const wrapper = mount(DataTablePanel, {
      slots: {
        filters: '<div>筛选区</div>',
        default: '<div>列表数据</div>',
      },
      global: mountOptions.global,
    });

    expect(wrapper.find('.ui-data-table-panel__header').exists()).toBe(false);
    expect(wrapper.text()).toContain('筛选区');
    expect(wrapper.text()).toContain('列表数据');
  });

  it('DetailList 应按字段值和 span 渲染详情网格', () => {
    const wrapper = mount(DetailList, {
      props: {
        columns: 2,
        items: [
          { label: '订单号', value: 'ORDER-001' },
          { label: '据点', value: '台北总部', span: 2 },
        ],
      },
    });

    expect(wrapper.text()).toContain('ORDER-001');
    expect(wrapper.text()).toContain('台北总部');
    expect(wrapper.findAll('.ui-detail-list__item')[1].attributes('style')).toContain('grid-column: span 2');
  });

  it('StatCard 应反映激活与可交互状态，并保留插槽', () => {
    const wrapper = mount(StatCard, {
      props: { label: '待处理', value: 18, active: true },
      slots: { default: '<span>需要关注</span>' },
    });

    expect(wrapper.classes()).toContain('is-active');
    expect(wrapper.attributes('aria-pressed')).toBe('true');
    expect(wrapper.text()).toContain('需要关注');
  });

  it('StatusTag 应展示传入状态内容', () => {
    const tag = mount(StatusTag, { props: { type: 'warning' }, slots: { default: '待确认' } });

    expect(tag.classes()).toContain('is-warning');
    expect(tag.text()).toBe('待确认');
  });

  it('FilterIconButton 应提供提示、无障碍名称并发送点击事件', async () => {
    const icon = { template: '<span>icon</span>' };
    const wrapper = mount(FilterIconButton, {
      props: { label: '重置筛选', icon },
      global: mountOptions.global,
    });

    expect(wrapper.get('[data-test="tooltip"]').attributes('data-content')).toBe('重置筛选');
    expect(wrapper.get('button').attributes('aria-label')).toBe('重置筛选');
    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('TablePagination 应透传分页事件', async () => {
    const wrapper = mount(TablePagination, {
      props: { currentPage: 1, pageSize: 10, total: 42 },
      global: mountOptions.global,
    });

    await wrapper.get('[data-test="next-page"]').trigger('click');
    await wrapper.get('[data-test="next-size"]').trigger('click');

    expect(wrapper.emitted('update:currentPage')).toEqual([[2]]);
    expect(wrapper.emitted('current-change')).toEqual([[2]]);
    expect(wrapper.emitted('update:pageSize')).toEqual([[20]]);
    expect(wrapper.emitted('size-change')).toEqual([[20]]);
  });

  it('ListActionGroup 应统一导入导出、批量状态和选择摘要', async () => {
    const wrapper = mount(ListActionGroup, {
      props: {
        selectedCount: 2,
        clearable: true,
        batchActions: [{ command: 'enable', label: '批量启用' }],
      },
      global: mountOptions.global,
    });

    expect(wrapper.text()).toContain('导入');
    expect(wrapper.text()).toContain('导出');
    expect(wrapper.text()).toContain('已选 2 项');
    expect(wrapper.get('[data-test="dropdown"]').attributes('data-disabled')).toBe('false');
    await wrapper.findAll('button')[0].trigger('click');
    await wrapper.get('.ui-list-action-group__clear').trigger('click');
    expect(wrapper.emitted('import')).toHaveLength(1);
    expect(wrapper.emitted('clear-selection')).toHaveLength(1);
  });

  it('EntityDetailHeader 应展示主体资料并发送返回事件', async () => {
    const wrapper = mount(EntityDetailHeader, {
      props: {
        title: '王小明',
        subtitle: '个人会员',
        tags: [{ label: '正常', type: 'success' }],
        metaItems: [{ label: '手机号：', value: '0912-345-678' }],
      },
      global: mountOptions.global,
    });

    expect(wrapper.text()).toContain('王小明');
    expect(wrapper.text()).toContain('正常');
    expect(wrapper.text()).toContain('0912-345-678');
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('back')).toHaveLength(1);
  });

  it('FileImportDialog 应展示完整状态并允许移除已选文件', async () => {
    const wrapper = mount(FileImportDialog, {
      props: {
        modelValue: true,
        fileName: '名单.xlsx',
        status: 'ready',
        summaryItems: [{ label: '导入成功', value: 8, type: 'success' }],
        errors: [{ row: 3, reason: '手机号重复' }],
        errorColumns: [
          { prop: 'row', label: '行号' },
          { prop: 'reason', label: '异常原因' },
        ],
      },
      global: mountOptions.global,
    });

    expect(wrapper.text()).toContain('名单.xlsx');
    expect(wrapper.text()).toContain('重新选择文件');
    expect(wrapper.text()).toContain('文件已选择，可以开始导入');
    expect(wrapper.text()).not.toContain('导入成功');
    await wrapper
      .findAll('button')
      .find((button) => button.text() === '移除')
      .trigger('click');
    expect(wrapper.emitted('remove-file')).toHaveLength(1);

    await wrapper.setProps({ loading: true });
    expect(wrapper.text()).toContain('正在检查并导入文件');
    await wrapper.setProps({ loading: false });

    await wrapper.setProps({ status: 'success' });
    expect(wrapper.text()).toContain('文件导入完成');
    expect(wrapper.text()).toContain('导入成功');

    await wrapper.setProps({ status: 'error' });
    expect(wrapper.text()).toContain('文件存在异常');
    expect(wrapper.text()).toContain('手机号重复');
  });

  it('ReasonConfirmDialog 应要求填写原因并发送去除首尾空格后的内容', async () => {
    const wrapper = mount(ReasonConfirmDialog, {
      props: {
        modelValue: true,
        title: '确认停用',
        reason: '',
      },
      global: mountOptions.global,
    });

    const confirmButton = wrapper.findAll('button').at(-1);
    expect(confirmButton.attributes('disabled')).toBeDefined();

    await wrapper.setProps({ reason: '  资料异常  ' });
    await wrapper.findAll('button').at(-1).trigger('click');
    expect(wrapper.emitted('confirm')).toEqual([['资料异常']]);
  });
});
