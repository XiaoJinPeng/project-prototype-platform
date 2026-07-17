<template>
            <main class="review-page">
                    <PageHeader unstyled class="review-page__header mb-6" title="员工申请审核"
                        description="审核员工申请加入企业后的组织归属与职级资料。"
                        title-class="text-2xl font-bold text-gray-800 tracking-tight"
                        description-class="text-gray-500 text-sm mt-1" />

                    <div class="review-page__panel">
                        <div class="review-page__toolbar">
                            <div class="review-page__filters">
                                <el-input                                     v-model="searchForm.keyword"
                                    :prefix-icon="Search"
                                    clearable
                                    placeholder="姓名/手机号/Email/身份证字号"
                                    style="width: 240px"
                                ></el-input>
                                <el-tooltip content="重置" placement="top">
                                    <el-button circle plain :icon="RefreshRight" @click="refreshHandel"></el-button>
                                </el-tooltip>
                            </div>

                            <div class="review-page__actions">
                                <el-dropdown trigger="click">
                                    <el-button type="warning" plain>
                                        批量设置
                                        <el-icon class="ml-1"><ArrowDown></ArrowDown></el-icon>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item @click="reviewSelected(true)">批量通过</el-dropdown-item>
                                            <el-dropdown-item @click="reviewSelected(false)">批量不通过</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                        </div>

                        <el-table                             ref="tableRef"
                            :data="filteredTableData"
                            stripe
                            style="width: 100%"
                            class="review-table flex-1"
                            scrollbar-always-on
                            :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }"
                            @selection-change="selectedRows = $event"
                        >
                            <el-table-column type="selection" align="center" width="55"></el-table-column>
                            <el-table-column min-width="180" prop="name" label="姓名">
                                <template #default="{ row }">
                                    <div class="flex items-center min-w-0">
                                        <span class="review-avatar">{{ getNameInitial(row.name) }}</span>
                                        <span class="min-w-0 truncate font-medium text-gray-900" :title="row.name">{{ row.name }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column min-width="160" align="center" prop="idNumber" label="身份证字号"></el-table-column>
                            <el-table-column min-width="180" align="center" prop="email" label="Email"></el-table-column>
                            <el-table-column min-width="150" align="center" prop="phone" label="联系电话"></el-table-column>
                            <el-table-column min-width="180" align="center" prop="companyName" label="分公司"></el-table-column>
                            <el-table-column min-width="160" align="center" prop="departmentName" label="部门"></el-table-column>
                            <el-table-column min-width="120" align="center" prop="rank" label="职级">
                                <template #default="{ row }">
                                    <el-tag size="small" type="info" effect="plain">{{ row.rank }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column width="170" align="center" label="申请时间">
                                <template #default="{ row }">
                                    <span class="text-gray-600 text-sm">{{ row.applyTime }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="190" align="center" fixed="right">
                                <template #default="{ row }">
                                    <div class="flex items-center justify-center gap-3">
                                        <el-button link type="primary" @click="reviewRows([row], true)">审核通过</el-button>
                                        <el-button link type="danger" @click="reviewRows([row], false)">审核不通过</el-button>
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
import { RefreshRight, Search } from '@element-plus/icons-vue';
import { PageHeader } from '@/components/ui';
import { createEmployeeReviewRecords } from '../../data/enterprise-management';

                const tableRef = ref(null);
                const selectedRows = ref([]);
                const searchForm = reactive({ keyword: '' });
                const tableData = ref(createEmployeeReviewRecords());
                const filteredTableData = computed(() => {
                    const keyword = searchForm.keyword.trim().toLowerCase();
                    if (!keyword) return tableData.value;
                    return tableData.value.filter(item =>
                        [item.name, item.idNumber, item.email, item.phone]
                            .some(value => String(value).toLowerCase().includes(keyword))
                    );
                });
                const refreshHandel = () => {
                    searchForm.keyword = '';
                    syncTableLayout();
                };
                const getNameInitial = (name) => name ? name.slice(0, 1) : '';
                const reviewRows = (rows, approved) => {
                    if (!rows.length) {
                        ElMessage.warning('请先选择需要审核的员工');
                        return;
                    }
                    const names = new Set(rows.map(item => item.name));
                    tableData.value = tableData.value.filter(item => !names.has(item.name));
                    selectedRows.value = [];
                    tableRef.value?.clearSelection?.();
                    ElMessage.success(`已${approved ? '通过' : '驳回'} ${rows.length} 笔员工申请`);
                };
                const reviewSelected = (approved) => reviewRows(selectedRows.value, approved);
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
        .review-page {
            min-height: 100%;
            background: transparent;
        }

        .review-page__panel {
            display: flex;
            min-height: calc(100vh - 220px);
            flex-direction: column;
            overflow: hidden;
            border: 1px solid #f3f4f6;
            border-radius: 12px;
            background: #fff;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .review-page__toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px;
            border-bottom: 1px solid #f3f4f6;
            background: #f9fafb;
            flex-wrap: wrap;
        }

        .review-page__filters,
        .review-page__actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .review-avatar {
            display: inline-flex;
            width: 30px;
            height: 30px;
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

        .review-table :deep(.el-table__inner-wrapper::before) {
            display: none;
        }

        .review-table :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            padding-top: 0;
            padding-bottom: 0;
        }

        .review-table :deep(.el-table__body td.el-table__cell) {
            padding-top: 14px;
            padding-bottom: 14px;
        }

        .review-table :deep(.el-table__row td) {
            border-bottom: 1px solid #f3f4f6;
        }

        .review-table :deep(.el-table__header table),
        .review-table :deep(.el-table__body table),
        .review-table :deep(.el-table__footer table) {
            table-layout: fixed !important;
        }

        .review-table :deep(.el-table__header th.el-table__cell > .cell) {
            display: flex;
            min-height: 44px;
            align-items: center;
            box-sizing: border-box;
            white-space: nowrap;
        }

        .review-table :deep(.el-table__header th.is-center > .cell) {
            justify-content: center;
        }

        .review-table :deep(.el-table__header th.is-right > .cell) {
            justify-content: flex-end;
        }

        .review-table :deep(.el-button.is-link) {
            font-weight: 500;
        }

        @media (max-width: 960px) {
            .review-page__panel {
                min-height: calc(100vh - 180px);
            }
        }
</style>
