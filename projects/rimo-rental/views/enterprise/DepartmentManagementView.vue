<template>
            <main class="department-page">
                    <PageHeader unstyled class="department-page__header mb-6" title="部门管理"
                        description="管理分公司下的部门资料、成员规模、可用车数与启停状态。"
                        title-class="text-2xl font-bold text-gray-800 tracking-tight"
                        description-class="text-gray-500 text-sm mt-1">
                        <template #actions>
                            <el-button type="primary" size="large" class="department-page__add-button" @click="openCreateDialog">
                                <el-icon class="mr-1"><Plus></Plus></el-icon>
                                新建部门
                            </el-button>
                        </template>
                    </PageHeader>

                    <div class="department-page__content-card">
                        <div class="department-page__toolbar">
                            <div class="department-page__filters">
                                <el-input v-model="searchForm.departmentName" placeholder="部门名称" clearable style="width: 280px"></el-input>
                                <el-tooltip content="重置" placement="top">
                                    <el-button circle :icon="Refresh" @click="refreshHandel"></el-button>
                                </el-tooltip>
                                <el-button type="primary" plain>
                                    <el-icon class="mr-1"><Download></Download></el-icon>
                                    导出数据
                                </el-button>
                                <el-button type="warning" plain>
                                    <el-icon class="mr-1"><Operation></Operation></el-icon>
                                    设置状态
                                </el-button>
                            </div>
                            <div class="department-page__summary">总数量 {{ filteredTableData.length }}</div>
                        </div>

                        <el-table                             ref="tableRef"
                            :data="filteredTableData"
                            stripe
                            class="department-table flex-1"
                            style="width: 100%"
                            scrollbar-always-on
                            :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }"
                        >
                            <el-table-column type="selection" align="center" width="55"></el-table-column>
                            <el-table-column min-width="180" prop="companyName" align="center" label="分公司"></el-table-column>
                            <el-table-column min-width="180" prop="departmentName" align="center" label="部门名称"></el-table-column>
                            <el-table-column min-width="120" prop="userCount" align="right" label="成员数量">
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-700">{{ row.userCount }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column min-width="120" prop="vehicles" align="right" label="可用车数">
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-700">{{ row.vehicles }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column min-width="120" prop="status" align="center" label="状态">
                                <template #default="{ row }">
                                    <el-tag size="small" round :type="row.status === '启用' ? 'success' : 'danger'" effect="light">{{ row.status }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column width="190" align="center" label="操作">
                                <template #default>
                                    <div class="flex items-center justify-center gap-3">
                                        <el-button link type="primary">编辑</el-button>
                                        <el-dropdown trigger="click">
                                            <el-button link type="info">
                                                更多<el-icon class="el-icon--right"><ArrowDown></ArrowDown></el-icon>
                                            </el-button>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item>设置状态</el-dropdown-item>
                                                    <el-dropdown-item divided><span class="text-red-500">刪除</span></el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
            </main>

        <el-dialog v-model="createDialogVisible" title="新建部门" width="640px" destroy-on-close>
            <div class="department-dialog__hint">建立分公司下的新部门资料。</div>
            <el-form label-position="top" :model="createForm">
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="分公司" required>
                        <el-select v-model="createForm.companyName" placeholder="请选择" class="w-full">
                            <el-option v-for="company in companyOptions" :key="company" :label="company" :value="company"></el-option>
                        </el-select>
                    </el-form-item>
                    <div></div>
                    <el-form-item label="部门名称" required class="col-span-2">
                        <el-input v-model="createForm.departmentName" placeholder="请输入"></el-input>
                    </el-form-item>
                </div>
            </el-form>
            <template #footer>
                <div class="department-dialog__footer">
                    <el-button @click="createDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitCreateDialog">保存</el-button>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { PageHeader } from '@/components/ui';
import { createDepartmentRecords, enterpriseCompanyOptions } from '../../data/enterprise-management';

                const tableRef = ref(null);
                const createDialogVisible = ref(false);
                const searchForm = reactive({ departmentName: '' });
                const createForm = reactive({
                    companyName: '',
                    departmentName: ''
                });
                const tableData = ref(createDepartmentRecords());
                const filteredTableData = computed(() => {
                    const keyword = searchForm.departmentName.trim().toLowerCase();
                    if (!keyword) return tableData.value;
                    return tableData.value.filter(item => item.departmentName.toLowerCase().includes(keyword));
                });
                const companyOptions = enterpriseCompanyOptions;
                const refreshHandel = () => {
                    searchForm.departmentName = '';
                    syncTableLayout();
                };
                const syncTableLayout = () => {
                    nextTick(() => {
                        tableRef.value?.doLayout?.();
                        window.setTimeout(() => tableRef.value?.doLayout?.(), 80);
                    });
                };
                const resetCreateForm = () => {
                    createForm.companyName = '';
                    createForm.departmentName = '';
                };
                const openCreateDialog = () => {
                    resetCreateForm();
                    createDialogVisible.value = true;
                };
                const submitCreateDialog = () => {
                    const missing = [];
                    if (!createForm.companyName) missing.push('分公司');
                    if (!String(createForm.departmentName || '').trim()) missing.push('部门名称');
                    if (missing.length) {
                        ElMessage.warning(`请先完成：${missing.join('、')}`);
                        return;
                    }
                    tableData.value.unshift({
                        companyName: createForm.companyName,
                        departmentName: createForm.departmentName.trim(),
                        userCount: 0,
                        vehicles: 0,
                        status: '启用'
                    });
                    createDialogVisible.value = false;
                    ElMessage.success('部门已保存');
                    syncTableLayout();
                };
                onMounted(() => {
                    syncTableLayout();
                    window.addEventListener('resize', syncTableLayout);
                });
                onBeforeUnmount(() => window.removeEventListener('resize', syncTableLayout));
</script>

<style scoped>
        .department-page {
            min-height: 100%;
            background: transparent;
        }

        .department-page__header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
        }

        .department-page__add-button {
            box-shadow: 0 10px 30px rgb(var(--app-color-primary-rgb) / 18%);
        }

        .department-page__content-card {
            display: flex;
            min-height: calc(100vh - 284px);
            flex-direction: column;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .department-page__toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px;
            background: #f9fafb;
            border-bottom: 1px solid #f3f4f6;
            flex-wrap: wrap;
        }

        .department-page__filters {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .department-page__summary {
            color: #6b7280;
            font-size: 14px;
            white-space: nowrap;
        }

        .department-table :deep(.el-table__inner-wrapper::before) {
            display: none;
        }

        .department-table :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            padding-top: 0;
            padding-bottom: 0;
        }

        .department-table :deep(.el-table__body td.el-table__cell) {
            padding-top: 14px;
            padding-bottom: 14px;
        }

        .department-table :deep(.el-table__row td) {
            border-bottom: 1px solid #f3f4f6;
        }

        .department-table :deep(.el-table__header table),
        .department-table :deep(.el-table__body table),
        .department-table :deep(.el-table__footer table) {
            table-layout: fixed !important;
        }

        .department-table :deep(.el-table__header th.el-table__cell > .cell) {
            display: flex;
            min-height: 44px;
            align-items: center;
            box-sizing: border-box;
            white-space: nowrap;
        }

        .department-table :deep(.el-table__header th.is-center > .cell) {
            justify-content: center;
        }

        .department-table :deep(.el-table__header th.is-right > .cell) {
            justify-content: flex-end;
        }

        .department-table :deep(.el-button.is-link) {
            font-weight: 500;
        }

        .department-dialog__hint {
            margin-bottom: 14px;
            color: #6b7280;
            font-size: 12px;
            line-height: 18px;
        }

        .department-dialog__footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            width: 100%;
        }

        @media (max-width: 960px) {
            .department-page__content-card {
                min-height: calc(100vh - 240px);
            }
        }
</style>
