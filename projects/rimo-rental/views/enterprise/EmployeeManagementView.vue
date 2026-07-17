<template>
            <main class="employee-page">
                    <PageHeader unstyled class="employee-page__header mb-6" title="员工管理" description="管理员工资料、所属组织、账号状态与用车记录。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1" /><div class="employee-layout">
                        <div class="employee-org-panel custom-scroll">
                            <div class="mb-3 flex items-center justify-between">
                                <div>
                                    <div class="text-sm font-bold text-gray-800">组织架构</div>
                                    <div class="mt-1 text-xs text-gray-400">分公司 / 部门 / 据点</div>
                                </div>
                                <el-button circle plain size="small">
                                    <el-icon><Refresh></Refresh></el-icon>
                                </el-button>
                            </div>
                            <div class="rounded-xl border border-gray-100 bg-gray-50/70 p-2">
                                <el-tree                                     :data="organizationTreeData"
                                    class="employee-org-tree"
                                    node-key="id"
                                    default-expand-all
                                    highlight-current
                                    :current-node-key="'all'"
                                >
                                    <template #default="{ data }">
                                        <div class="flex items-center w-full py-1">
                                            <span class="employee-tree-icon mr-2 inline-flex h-6 w-6 items-center justify-center rounded-md">
                                                <el-icon v-if="data.level === 'company'"><House></House></el-icon>
                                                <el-icon v-else-if="data.level === 'department'"><Connection></Connection></el-icon>
                                                <el-icon v-else><Location></Location></el-icon>
                                            </span>
                                            <span class="truncate text-[13px]">{{ data.label }}</span>
                                        </div>
                                    </template>
                                </el-tree>
                            </div>
                        </div>

                        <div class="employee-table-panel">
                            <div class="employee-toolbar">
                                <div class="employee-toolbar__filters">
                                    <el-input                                         v-model="searchForm.keyword"
                                        :prefix-icon="Search"
                                        placeholder="姓名/手机号/Email/身份证字号"
                                        clearable
                                        style="width: 240px"
                                    ></el-input>
                                    <el-select v-model="searchForm.employedStatus" clearable placeholder="在职状态" style="width: 140px">
                                        <el-option label="在职" value="employed"></el-option>
                                        <el-option label="离职" value="left"></el-option>
                                    </el-select>
                                    <el-select v-model="searchForm.status" clearable placeholder="状态" style="width: 140px">
                                        <el-option label="启用" value="enabled"></el-option>
                                        <el-option label="停用" value="disabled"></el-option>
                                    </el-select>
                                    <el-tooltip content="重置" placement="top">
                                        <el-button circle plain :icon="Refresh" @click="refreshHandel"></el-button>
                                    </el-tooltip>
                                    <el-dropdown trigger="click">
                                        <el-button type="warning" plain>
                                            批量设置
                                            <el-icon class="ml-1"><ArrowDown></ArrowDown></el-icon>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item>批量删除</el-dropdown-item>
                                                <el-dropdown-item>批量离职</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                    <span v-if="multipleSelection.length" class="text-sm text-gray-500">
                                        已选择
                                        <span class="font-semibold text-theme-primary">{{ multipleSelection.length }}</span>
                                    </span>
                                </div>

                                <div class="search-result-summary">
                                    <span>租用次数：{{ rentalsNumber }}</span>
                                    <span class="ml-4">租用金额：{{ rentalAmount }}</span>
                                </div>
                            </div>

                            <el-table                                 ref="tableRef"
                                :data="filteredTableData"
                                stripe
                                class="employee-table flex-1"
                                style="width: 100%"
                                scrollbar-always-on
                                :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }"
                                @selection-change="handleSelectionChange"
                            >
                                <el-table-column type="selection" width="52" align="center"></el-table-column>
                                <el-table-column label="员工资料" min-width="220" fixed="left">
                                    <template #default="{ row }">
                                        <div class="flex items-center min-w-0">
                                            <span class="employee-avatar">{{ getNameInitial(row.name) }}</span>
                                            <div class="min-w-0">
                                                <div class="flex items-center gap-2">
                                                    <span class="truncate font-semibold text-gray-900" :title="row.name">{{ row.name }}</span>
                                                    <el-tag size="small" type="info" effect="plain">{{ row.rank }}</el-tag>
                                                </div>
                                                <div class="mt-1 truncate text-xs text-gray-400" :title="row.idNumber">{{ row.idNumber }}</div>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="联系方式" min-width="180">
                                    <template #default="{ row }">
                                        <div class="space-y-1 text-sm">
                                            <div class="truncate text-gray-700" :title="row.phone">{{ row.phone }}</div>
                                            <div class="truncate text-gray-500" :title="row.email">{{ row.email }}</div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="组织归属" min-width="130">
                                    <template #default="{ row }">
                                        <div class="space-y-1 text-sm">
                                            <div class="font-medium text-gray-800">{{ row.companyName }}</div>
                                            <div class="text-gray-500">{{ row.departmentName }}</div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="用车统计" min-width="110" align="right">
                                    <template #default="{ row }">
                                        <div class="space-y-1">
                                            <div class="font-semibold text-gray-800">{{ row.rentalsNumber }} 次</div>
                                            <div class="text-sm text-gray-500">{{ row.rentalAmount }}</div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="状态" min-width="100" align="center">
                                    <template #default="{ row }">
                                        <div class="flex flex-col items-center gap-1">
                                            <el-tag size="small" :type="row.employedStatus === '在职' ? 'success' : 'info'" effect="plain">{{ row.employedStatus }}</el-tag>
                                            <el-tag size="small" :type="row.status === '启用' ? 'success' : 'danger'" effect="plain">账号{{ row.status }}</el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column width="110" align="center" label="加入时间">
                                    <template #default="{ row }">
                                        <span class="text-gray-600 text-sm">{{ row.joinTime }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="190" align="right" fixed="right">
                                    <template #default>
                                        <div class="flex items-center justify-end gap-2">
                                            <el-button type="primary" link size="small">订单记录</el-button>
                                            <el-button type="primary" link size="small">编辑</el-button>
                                            <el-button type="primary" link size="small">设置状态</el-button>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
            </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { Refresh, Search } from '@element-plus/icons-vue';
import { PageHeader } from '@/components/ui';

                const tableRef = ref(null);
                const multipleSelection = ref([]);
                const searchForm = reactive({
                    keyword: '',
                    employedStatus: '',
                    status: ''
                });
                const organizationTreeData = [
                    {
                        id: 'all',
                        label: '全部组织',
                        level: 'company',
                        children: [
                            {
                                id: 'baolong',
                                label: '宝龙分公司',
                                level: 'company',
                                children: [
                                    { id: 'baolong-sales', label: '业务部', level: 'department' },
                                    { id: 'baolong-admin', label: '行政部', level: 'department' },
                                    { id: 'baolong-station', label: '八轮测试-宝龙用车点', level: 'station' }
                                ]
                            },
                            {
                                id: 'qidi',
                                label: '启迪分公司',
                                level: 'company',
                                children: [
                                    { id: 'qidi-admin', label: '行政部', level: 'department' },
                                    { id: 'qidi-station', label: '八轮测试-启迪用车点', level: 'station' }
                                ]
                            }
                        ]
                    }
                ];
                const tableData = ref([
                    { name: '王怡君', account: 'yijun.wang', idNumber: 'A123456789', email: 'yijun.wang@rimo.demo', phone: '0912-345-678', companyName: '宝龙分公司', departmentName: '业务部', rank: '主管', joinTime: '2024-03-15', rentalsNumber: 12, rentalAmount: 'NT$ 36,000', employedStatus: '在职', status: '启用' },
                    { name: '陈建宏', account: 'jason.chen', idNumber: 'B223456789', email: 'jason.chen@rimo.demo', phone: '0988-120-776', companyName: '启迪分公司', departmentName: '行政部', rank: '一般员工', joinTime: '2024-06-01', rentalsNumber: 8, rentalAmount: 'NT$ 18,200', employedStatus: '在职', status: '启用' },
                    { name: '林雅婷', account: 'yating.lin', idNumber: 'C323456789', email: 'yating.lin@rimo.demo', phone: '0922-886-301', companyName: '宝龙分公司', departmentName: '财务部', rank: '一般员工', joinTime: '2025-01-10', rentalsNumber: 4, rentalAmount: 'NT$ 9,600', employedStatus: '在职', status: '停用' },
                    { name: '黄柏翰', account: 'bohan.huang', idNumber: 'D423456789', email: 'bohan.huang@rimo.demo', phone: '0900-668-321', companyName: '人工智能分公司', departmentName: '研发部', rank: '主管', joinTime: '2025-09-20', rentalsNumber: 2, rentalAmount: 'NT$ 5,200', employedStatus: '离职', status: '停用' }
                ]);
                const filteredTableData = computed(() => {
                    const keyword = searchForm.keyword.trim().toLowerCase();
                    return tableData.value.filter((item) => {
                        const matchesKeyword = !keyword || [item.name, item.phone, item.email, item.idNumber]
                            .some(value => String(value).toLowerCase().includes(keyword));
                        const matchesEmployment = !searchForm.employedStatus ||
                            (searchForm.employedStatus === 'employed' ? item.employedStatus === '在职' : item.employedStatus === '离职');
                        const matchesStatus = !searchForm.status ||
                            (searchForm.status === 'enabled' ? item.status === '启用' : item.status === '停用');
                        return matchesKeyword && matchesEmployment && matchesStatus;
                    });
                });
                const rentalsNumber = computed(() =>
                    filteredTableData.value.reduce((total, item) => total + item.rentalsNumber, 0)
                );
                const rentalAmount = computed(() => {
                    const amount = filteredTableData.value.reduce((total, item) =>
                        total + Number(String(item.rentalAmount).replace(/[^0-9]/g, '') || 0), 0
                    );
                    return `NT$ ${amount.toLocaleString()}`;
                });
                const refreshHandel = () => {
                    searchForm.keyword = '';
                    searchForm.employedStatus = '';
                    searchForm.status = '';
                    syncTableLayout();
                };
                const handleSelectionChange = (rows) => {
                    multipleSelection.value = rows;
                };
                const getNameInitial = (name) => name ? name.slice(0, 1) : '';
                const syncTableLayout = () => {
                    nextTick(() => {
                        tableRef.value?.doLayout?.();
                        window.setTimeout(() => tableRef.value?.doLayout?.(), 80);
                    });
                };
                onMounted(() => {
                    syncTableLayout();
                    window.addEventListener('resize', syncTableLayout);
                });
                onBeforeUnmount(() => window.removeEventListener('resize', syncTableLayout));
</script>

<style scoped>
        .employee-page {
            min-height: 100%;
            background: transparent;
        }

        .employee-page__header {
            display: block;
        }

        .employee-layout {
            display: flex;
            min-height: calc(100vh - 188px);
            gap: 24px;
        }

        .employee-org-panel {
            display: flex;
            width: 288px;
            flex-shrink: 0;
            flex-direction: column;
            overflow-y: auto;
            border: 1px solid #f3f4f6;
            border-radius: 12px;
            background: #fff;
            padding: 16px;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .employee-table-panel {
            display: flex;
            min-width: 0;
            flex: 1;
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #f3f4f6;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .employee-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            background: #f9fafb;
            flex-wrap: wrap;
        }

        .employee-toolbar__filters,
        .employee-toolbar__actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .search-result-summary {
            margin-left: auto;
            color: #6b7280;
            font-size: 14px;
            white-space: nowrap;
        }

        .employee-avatar {
            display: inline-flex;
            width: 32px;
            height: 32px;
            margin-right: 12px;
            align-items: center;
            justify-content: center;
            color: var(--app-color-primary);
            font-size: 14px;
            font-weight: 700;
            background: #e0f2fe;
            border-radius: 9999px;
            flex-shrink: 0;
        }

        .employee-org-tree {
            background: transparent;
        }

        .employee-org-tree :deep(.el-tree-node__content) {
            height: 40px;
            border-radius: 8px;
            transition: all 0.2s;
        }

        .employee-org-tree :deep(.el-tree-node__content:hover) {
            color: var(--app-color-primary);
            background: #f0f7fb;
        }

        .employee-org-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
            color: var(--app-color-primary);
            font-weight: 600;
            background: #e6f3f8;
        }

        .employee-tree-icon {
            color: #9ca3af;
            background: #f3f4f6;
        }

        .employee-org-tree :deep(.el-tree-node__content:hover .employee-tree-icon),
        .employee-org-tree :deep(.el-tree-node.is-current > .el-tree-node__content .employee-tree-icon) {
            color: var(--app-color-primary);
            background: #e0f2fe;
        }

        .employee-table :deep(.el-table__inner-wrapper::before) {
            display: none;
        }

        .employee-table :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            padding-top: 0;
            padding-bottom: 0;
        }

        .employee-table :deep(.el-table__body td.el-table__cell) {
            padding-top: 12px;
            padding-bottom: 12px;
        }

        .employee-table :deep(.el-table__row td) {
            border-bottom: 1px solid #f3f4f6;
        }

        .employee-table :deep(.el-table__header table),
        .employee-table :deep(.el-table__body table),
        .employee-table :deep(.el-table__footer table) {
            table-layout: fixed !important;
        }

        .employee-table :deep(.el-table__header th.el-table__cell > .cell) {
            display: flex;
            min-height: 44px;
            align-items: center;
            box-sizing: border-box;
            white-space: nowrap;
        }

        .employee-table :deep(.el-table__header th.is-center > .cell) {
            justify-content: center;
        }

        .employee-table :deep(.el-table__header th.is-right > .cell) {
            justify-content: flex-end;
        }

        .employee-table :deep(.el-button.is-link) {
            font-weight: 500;
        }

        @media (max-width: 1180px) {
            .employee-layout {
                flex-direction: column;
            }

            .employee-org-panel {
                width: 100%;
                max-height: 260px;
            }
        }

</style>
