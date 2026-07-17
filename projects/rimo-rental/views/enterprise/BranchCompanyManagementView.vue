<template>
            <main class="branch-company-page">
                    <PageHeader unstyled class="branch-company-page__header mb-6" title="分公司管理"
                        description="管理各分公司资料、部门规模、管理员账号与启停状态。"
                        title-class="text-2xl font-bold text-gray-800 tracking-tight"
                        description-class="text-gray-500 text-sm mt-1">
                        <template #actions>
                            <el-button type="primary" size="large" class="branch-company-page__add-button" @click="openCreateDialog">
                                <el-icon class="mr-1"><Plus></Plus></el-icon>
                                新建分公司
                            </el-button>
                        </template>
                    </PageHeader>

                    <div class="branch-company-page__content-card">
                        <div class="branch-company-page__toolbar">
                            <div class="branch-company-page__filters">
                                <el-input v-model="searchForm.companyName" placeholder="分公司名称" clearable style="width: 280px"></el-input>
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
                            <div class="branch-company-page__summary">总数量 {{ filteredTableData.length }}</div>
                        </div>

                        <el-table                             ref="tableRef"
                            :data="filteredTableData"
                            stripe
                            class="branch-company-table flex-1"
                            style="width: 100%"
                            scrollbar-always-on
                            :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }"
                        >
                            <el-table-column type="selection" align="center" width="55"></el-table-column>
                            <el-table-column min-width="180" prop="companyName" align="center" label="分公司"></el-table-column>
                            <el-table-column min-width="120" prop="departmentCount" align="right" label="部门数">
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-700">{{ row.departmentCount }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column min-width="120" prop="userCount" align="right" label="员工数">
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-700">{{ row.userCount }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column min-width="180" prop="parkingName" align="center" label="用车据点"></el-table-column>
                            <el-table-column min-width="140" prop="sysUserName" align="center" label="管理员姓名"></el-table-column>
                            <el-table-column min-width="140" prop="account" align="center" label="管理员账号"></el-table-column>
                            <el-table-column min-width="120" prop="state" align="center" label="状态">
                                <template #default="{ row }">
                                    <el-tag size="small" round :type="row.state === '启用' ? 'success' : 'info'" effect="plain">{{ row.state }}</el-tag>
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

        <el-dialog v-model="createDialogVisible" title="新建分公司" width="720px" destroy-on-close>
            <div class="branch-company-dialog__hint">建立分公司资料并同时建立该分公司的管理员账号。</div>
            <el-form label-position="top" :model="createForm">
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="分公司名称" required>
                        <el-input v-model="createForm.companyName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="管理员姓名" required>
                        <el-input v-model="createForm.adminName" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="Email">
                        <el-input v-model="createForm.email" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="通知管理员">
                        <div class="h-10 flex items-center">
                            <el-checkbox v-model="createForm.notifyAdmin"></el-checkbox>
                        </div>
                    </el-form-item>
                    <el-form-item label="管理员账号" required>
                        <el-input v-model="createForm.account" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="管理员密码" required>
                        <el-input v-model="createForm.password" type="password" show-password placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="用车据点" required class="col-span-2">
                        <el-select v-model="createForm.stationIds" multiple collapse-tags collapse-tags-tooltip filterable placeholder="请选择" class="w-full">
                            <el-option v-for="site in stationOptions" :key="site.value" :label="site.label" :value="site.value"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
            </el-form>
            <template #footer>
                <div class="branch-company-dialog__footer">
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
import { createBranchCompanyRecords, enterpriseStationOptions } from '../../data/enterprise-management';

                const tableRef = ref(null);
                const createDialogVisible = ref(false);
                const searchForm = reactive({ companyName: '' });
                const createForm = reactive({
                    companyName: '',
                    adminName: '',
                    email: '',
                    notifyAdmin: false,
                    account: '',
                    password: '',
                    stationIds: []
                });
                const stationOptions = enterpriseStationOptions;
                const tableData = ref(createBranchCompanyRecords());
                const filteredTableData = computed(() => {
                    const keyword = searchForm.companyName.trim().toLowerCase();
                    if (!keyword) return tableData.value;
                    return tableData.value.filter(item => item.companyName.toLowerCase().includes(keyword));
                });
                const refreshHandel = () => {
                    searchForm.companyName = '';
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
                    createForm.adminName = '';
                    createForm.email = '';
                    createForm.notifyAdmin = false;
                    createForm.account = '';
                    createForm.password = '';
                    createForm.stationIds = [];
                };
                const openCreateDialog = () => {
                    resetCreateForm();
                    createDialogVisible.value = true;
                };
                const submitCreateDialog = () => {
                    const requiredFields = [
                        ['分公司名称', createForm.companyName],
                        ['管理员姓名', createForm.adminName],
                        ['管理员账号', createForm.account],
                        ['管理员密码', createForm.password]
                    ];
                    const missing = requiredFields.filter(([, value]) => !String(value || '').trim()).map(([label]) => label);
                    if (!createForm.stationIds.length) {
                        missing.push('用车据点');
                    }
                    if (missing.length) {
                        ElMessage.warning(`请先完成：${missing.join('、')}`);
                        return;
                    }
                    const stationNames = createForm.stationIds.map((value) =>
                        stationOptions.value.find((item) => item.value === value)?.label || value
                    );
                    tableData.value.unshift({
                        companyName: createForm.companyName.trim(),
                        departmentCount: 0,
                        userCount: 0,
                        parkingName: stationNames.join('、'),
                        sysUserName: createForm.adminName.trim(),
                        account: createForm.account.trim(),
                        state: '启用'
                    });
                    createDialogVisible.value = false;
                    ElMessage.success('分公司已保存');
                    syncTableLayout();
                };
                onMounted(() => {
                    syncTableLayout();
                    window.addEventListener('resize', syncTableLayout);
                });
                onBeforeUnmount(() => window.removeEventListener('resize', syncTableLayout));
</script>

<style scoped>
        .branch-company-page {
            min-height: 100%;
            background: transparent;
        }

        .branch-company-page__header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
        }

        .branch-company-page__add-button {
            box-shadow: 0 10px 30px rgb(var(--app-color-primary-rgb) / 18%);
        }

        .branch-company-page__content-card {
            display: flex;
            min-height: calc(100vh - 284px);
            flex-direction: column;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .branch-company-page__toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px;
            background: #f9fafb;
            border-bottom: 1px solid #f3f4f6;
            flex-wrap: wrap;
        }

        .branch-company-page__filters {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .branch-company-page__summary {
            color: #6b7280;
            font-size: 14px;
            white-space: nowrap;
        }

        .branch-company-table :deep(.el-table__inner-wrapper::before) {
            display: none;
        }

        .branch-company-table :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            padding-top: 0;
            padding-bottom: 0;
        }

        .branch-company-table :deep(.el-table__body td.el-table__cell) {
            padding-top: 14px;
            padding-bottom: 14px;
        }

        .branch-company-table :deep(.el-table__row td) {
            border-bottom: 1px solid #f3f4f6;
        }

        .branch-company-table :deep(.el-table__header table),
        .branch-company-table :deep(.el-table__body table),
        .branch-company-table :deep(.el-table__footer table) {
            table-layout: fixed !important;
        }

        .branch-company-table :deep(.el-table__header th.el-table__cell > .cell) {
            display: flex;
            min-height: 44px;
            align-items: center;
            box-sizing: border-box;
            white-space: nowrap;
        }

        .branch-company-table :deep(.el-table__header th.is-center > .cell) {
            justify-content: center;
        }

        .branch-company-table :deep(.el-table__header th.is-right > .cell) {
            justify-content: flex-end;
        }

        .branch-company-table :deep(.el-button.is-link) {
            font-weight: 500;
        }

        .branch-company-dialog__hint {
            margin-bottom: 14px;
            color: #6b7280;
            font-size: 12px;
            line-height: 18px;
        }

        .branch-company-dialog__footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            width: 100%;
        }

        @media (max-width: 960px) {
            .branch-company-page__content-card {
                min-height: calc(100vh - 240px);
            }
        }
</style>
