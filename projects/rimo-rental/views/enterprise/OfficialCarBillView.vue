<template>
            <main class="company-bill-page">
                    <PageHeader unstyled class="company-bill-page__header mb-6" title="公务车账单"
                        description="查看各账期账单状态、付款进度与汇款明细。"
                        title-class="text-2xl font-bold text-gray-800 tracking-tight"
                        description-class="text-gray-500 text-sm mt-1" />

                    <div class="company-bill-page__content-card">
                        <div class="company-bill-page__toolbar">
                            <div class="company-bill-page__filters">
                                <div class="company-bill-page__date-picker">
                                    <el-date-picker                                         v-model="searchForm.billRange"
                                        type="daterange"
                                        range-separator="-"
                                        start-placeholder="账单期起"
                                        end-placeholder="账单期止"
                                        style="width: 100%"
                                    ></el-date-picker>
                                </div>
                                <el-tooltip content="重置" placement="top">
                                    <el-button circle :icon="Refresh" @click="refreshHandel"></el-button>
                                </el-tooltip>

                                <el-button plain class="company-bill-page__history-button" @click="showHistory">
                                    <el-icon><Clock></Clock></el-icon>
                                    <span>历史账单</span>
                                </el-button>
                            </div>

                            <div class="company-bill-page__summary">总数量 {{ filteredTableData.length }}</div>
                        </div>

                        <el-table                             ref="tableRef"
                            :data="filteredTableData"
                            stripe
                            class="company-bill-table flex-1"
                            style="width: 100%"
                            scrollbar-always-on
                            :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }"
                        >
                            <el-table-column prop="billDate" label="账单日期" min-width="120" align="center"></el-table-column>
                            <el-table-column prop="contractNo" label="合约号" min-width="150" align="center"></el-table-column>
                            <el-table-column prop="type" label="类型" min-width="100" align="center">
                                <template #default="{ row }">
                                    <el-tag size="small" effect="plain" type="info">{{ row.type }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="contractCars" label="合约车数" min-width="110" align="right">
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-700">{{ row.contractCars }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="period" label="有效期" min-width="210" align="center"></el-table-column>
                            <el-table-column prop="total" label="账单合计NT$" min-width="140" align="right">
                                <template #default="{ row }">
                                    <span class="font-semibold text-gray-900">{{ row.total }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="状态" min-width="120" align="center">
                                <template #default="{ row }">
                                    <el-tag                                         round
                                        size="small"
                                        effect="light"
                                        class="company-bill-page__status-tag"
                                        :style="{
                                            color: statusPalette(row.status).text,
                                            backgroundColor: statusPalette(row.status).background,
                                            borderColor: statusPalette(row.status).background
                                        }"
                                    >
                                        {{ row.status }}
                                    </el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="paidCars" label="缴费车数" min-width="110" align="right">
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-700">{{ row.paidCars }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="paidAmount" label="缴费金额" min-width="130" align="right">
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-700">{{ row.paidAmount }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="220" align="center">
                                <template #default="{ row }">
                                    <div class="company-bill-page__action-group">
                                        <el-button                                             v-for="action in row.actions"
                                            :key="action"
                                            link
                                            type="primary"
                                            @click="handleBillAction(row, action)"
                                        >
                                            {{ action }}
                                        </el-button>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
            </main>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { PageHeader } from '@/components/ui';
import { createOfficialCarBillRecords } from '../../data/enterprise-management';

                const tableRef = ref(null);
                const searchForm = reactive({ billRange: [] });
                const tableData = ref(createOfficialCarBillRecords());
                const filteredTableData = computed(() => {
                    if (!Array.isArray(searchForm.billRange) || searchForm.billRange.length !== 2) {
                        return tableData.value;
                    }
                    const [start, end] = searchForm.billRange.map(value => new Date(value).getTime());
                    return tableData.value.filter(item => {
                        const billDate = new Date(item.billDate.replaceAll('/', '-')).getTime();
                        return billDate >= start && billDate <= end;
                    });
                });
                const statusPalette = (status) => {
                    const map = {
                        待确认: { text: '#2563eb', background: '#dbeafe' },
                        待汇款: { text: '#d97706', background: '#fef3c7' },
                        已缴费: { text: '#059669', background: '#d1fae5' },
                        已过期: { text: '#dc2626', background: '#fee2e2' }
                    };
                    return map[status] || { text: '#6b7280', background: '#f3f4f6' };
                };
                const refreshHandel = () => {
                    searchForm.billRange = [];
                    syncTableLayout();
                };
                const showHistory = () => ElMessage.info('当前列表已包含历史账单');
                const handleBillAction = (row, action) => {
                    ElMessage.success(`${action}：${row.contractNo}`);
                };
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
        .company-bill-page {
            min-height: 100%;
            background: transparent;
        }

        .company-bill-page__header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
        }

        .company-bill-page__content-card {
            display: flex;
            min-height: calc(100vh - 244px);
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #f3f4f6;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .company-bill-page__toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            background: #f9fafb;
            flex-wrap: wrap;
        }

        .company-bill-page__filters {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .company-bill-page__date-picker {
            width: 320px;
        }

        .company-bill-page__history-button {
            gap: 8px;
            border-color: #dbe4ee;
            color: #374151;
        }

        .company-bill-page__summary {
            color: #6b7280;
            font-size: 14px;
            white-space: nowrap;
        }

        .company-bill-page__status-tag {
            font-weight: 600;
        }

        .company-bill-page__action-group {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .company-bill-table :deep(.el-table__inner-wrapper::before) {
            display: none;
        }

        .company-bill-table :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            padding-top: 0;
            padding-bottom: 0;
        }

        .company-bill-table :deep(.el-table__body td.el-table__cell) {
            padding-top: 14px;
            padding-bottom: 14px;
        }

        .company-bill-table :deep(.el-table__row td) {
            border-bottom: 1px solid #f3f4f6;
        }

        .company-bill-table :deep(.el-table__header table),
        .company-bill-table :deep(.el-table__body table),
        .company-bill-table :deep(.el-table__footer table) {
            table-layout: fixed !important;
        }

        .company-bill-table :deep(.el-table__header th.el-table__cell > .cell) {
            display: flex;
            min-height: 44px;
            align-items: center;
            box-sizing: border-box;
            white-space: nowrap;
        }

        .company-bill-table :deep(.el-table__header th.is-center > .cell) {
            justify-content: center;
        }

        .company-bill-table :deep(.el-table__header th.is-right > .cell) {
            justify-content: flex-end;
        }

        .company-bill-table :deep(.el-tag) {
            padding-inline: 10px;
        }

        @media (max-width: 960px) {
            .company-bill-page__content-card {
                min-height: calc(100vh - 220px);
            }

            .company-bill-page__date-picker {
                width: 100%;
            }
        }
</style>
