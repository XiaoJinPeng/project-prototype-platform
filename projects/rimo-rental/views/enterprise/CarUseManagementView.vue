<template>
            <main class="car-use-page">
                    <PageHeader unstyled class="car-use-page__header mb-6" title="车辆使用范围" description="注意：添加到此列表的车辆将仅限使用人可见可用，其他车辆默认公用。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                        <template #actions>
                            <el-button type="primary" size="large" class="car-use-page__add-button" @click="openCreateDialog">
                                <el-icon class="mr-1"><Plus></Plus></el-icon>
                                新增
                            </el-button>
                        </template>
                    </PageHeader><div class="car-use-page__content-card">
                        <div class="car-use-page__toolbar">
                            <div class="car-use-page__filters">
                                <el-input v-model="searchForm.numberPlate" placeholder="车牌号关键字输入选择" clearable style="width: 240px"></el-input>
                                <el-input v-model="searchForm.parameter" placeholder="部门/员工" clearable style="width: 240px"></el-input>
                                <el-tooltip content="重置" placement="top">
                                    <el-button circle :icon="Refresh" @click="refreshHandel"></el-button>
                                </el-tooltip>
                            </div>
                            <div class="car-use-page__summary">总数量 {{ filteredTableData.length }}</div>
                        </div>

                        <el-table                             ref="tableRef"
                            :data="filteredTableData"
                            stripe
                            style="width: 100%"
                            class="car-use-table flex-1"
                            scrollbar-always-on
                            :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }"
                        >
                            <el-table-column type="index" label="序号" align="center" width="70"></el-table-column>
                            <el-table-column min-width="180" prop="companyName" align="center" label="分公司"></el-table-column>
                            <el-table-column min-width="180" prop="title" label="标题"></el-table-column>
                            <el-table-column label="车牌号" min-width="220" show-overflow-tooltip>
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-900">{{ row.plate }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="限定使用人" min-width="240" show-overflow-tooltip>
                                <template #default="{ row }">
                                    <span class="text-gray-700">{{ row.append }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" label="操作" width="170">
                                <template #default>
                                    <div class="flex items-center justify-center gap-3">
                                        <el-button link type="primary">编辑</el-button>
                                        <el-dropdown trigger="click">
                                            <el-button link type="info">
                                                更多<el-icon class="el-icon--right"><ArrowDown></ArrowDown></el-icon>
                                            </el-button>
                                            <template #dropdown>
                                                <el-dropdown-menu>
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

        <el-dialog v-model="createDialogVisible" title="新增用车设定" width="720px" destroy-on-close>
            <div class="car-use-dialog__hint">建立限定用车设定后，指定车辆仅会对被设定的员工或部门开放使用。</div>
            <el-form label-position="top" :model="createForm">
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="分公司" required>
                        <el-select v-model="createForm.companyName" placeholder="请选择" class="w-full" @change="handleCompanyChange">
                            <el-option v-for="company in companyOptions" :key="company" :label="company" :value="company"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="标题" required>
                        <el-input v-model="createForm.title" placeholder="请输入"></el-input>
                    </el-form-item>
                    <el-form-item label="车牌号" required class="col-span-2">
                        <el-select v-model="createForm.plates" multiple collapse-tags collapse-tags-tooltip filterable placeholder="请选择车牌号" class="w-full">
                            <el-option v-for="plate in filteredVehicleOptions" :key="plate.value" :label="plate.label" :value="plate.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="限定使用人" required class="col-span-2">
                        <el-select v-model="createForm.targets" multiple collapse-tags collapse-tags-tooltip filterable placeholder="请选择员工或部门" class="w-full">
                            <el-option-group v-for="group in filteredTargetOptions" :key="group.label" :label="group.label">
                                <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value"></el-option>
                            </el-option-group>
                        </el-select>
                    </el-form-item>
                </div>
            </el-form>
            <template #footer>
                <div class="car-use-dialog__footer">
                    <el-button @click="createDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="submitCreateDialog">保存</el-button>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onBeforeUnmount, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from '@element-plus/icons-vue';
import { PageHeader } from '@/components/ui';

                const tableRef = ref(null);
                const createDialogVisible = ref(false);
                const searchForm = reactive({ numberPlate: '', parameter: '' });
                const createForm = reactive({
                    companyName: '',
                    title: '',
                    plates: [],
                    targets: []
                });
                const tableData = ref([
                    { companyName: '宝龙分公司', title: '主管专用车', plate: 'XLY-8008、XLY-8009', append: '王怡君、陈建宏、行政部' },
                    { companyName: '启迪分公司', title: '运营值班车', plate: 'XLY-8004', append: '运营部' },
                    { companyName: '人工智能分公司', title: '外勤支援车', plate: 'XLY-8007、XLY-8010', append: '业务部、张志明' }
                ]);
                const filteredTableData = computed(() => {
                    const plateKeyword = searchForm.numberPlate.trim().toLowerCase();
                    const targetKeyword = searchForm.parameter.trim().toLowerCase();
                    return tableData.value.filter(item => {
                        const matchesPlate = !plateKeyword || item.plate.toLowerCase().includes(plateKeyword);
                        const matchesTarget = !targetKeyword || [item.append, item.title, item.companyName]
                            .some(value => value.toLowerCase().includes(targetKeyword));
                        return matchesPlate && matchesTarget;
                    });
                });
                const companyOptions = ref(['宝龙分公司', '启迪分公司', '人工智能分公司']);
                const vehicleOptions = ref([
                    { companyName: '宝龙分公司', label: 'XLY-8008', value: 'XLY-8008' },
                    { companyName: '宝龙分公司', label: 'XLY-8009', value: 'XLY-8009' },
                    { companyName: '启迪分公司', label: 'XLY-8004', value: 'XLY-8004' },
                    { companyName: '人工智能分公司', label: 'XLY-8007', value: 'XLY-8007' },
                    { companyName: '人工智能分公司', label: 'XLY-8010', value: 'XLY-8010' }
                ]);
                const targetOptions = ref([
                    {
                        companyName: '宝龙分公司',
                        label: '部门',
                        options: [
                            { label: '行政部', value: 'dept:行政部' },
                            { label: '业务部', value: 'dept:业务部' }
                        ]
                    },
                    {
                        companyName: '宝龙分公司',
                        label: '员工',
                        options: [
                            { label: '王怡君', value: 'user:王怡君' },
                            { label: '陈建宏', value: 'user:陈建宏' }
                        ]
                    },
                    {
                        companyName: '启迪分公司',
                        label: '部门',
                        options: [
                            { label: '运营部', value: 'dept:运营部' }
                        ]
                    },
                    {
                        companyName: '人工智能分公司',
                        label: '部门',
                        options: [
                            { label: '业务部', value: 'dept:业务部@ai' }
                        ]
                    },
                    {
                        companyName: '人工智能分公司',
                        label: '员工',
                        options: [
                            { label: '张志明', value: 'user:张志明' }
                        ]
                    }
                ]);
                const refreshHandel = () => {
                    searchForm.numberPlate = '';
                    searchForm.parameter = '';
                    syncTableLayout();
                };
                const filteredVehicleOptions = computed(() => {
                    if (!createForm.companyName) return [];
                    return vehicleOptions.value.filter(item => item.companyName === createForm.companyName);
                });
                const filteredTargetOptions = computed(() => {
                    if (!createForm.companyName) return [];
                    return targetOptions.value.filter(item => item.companyName === createForm.companyName);
                });
                const syncTableLayout = () => {
                    nextTick(() => {
                        tableRef.value?.doLayout?.();
                        window.setTimeout(() => tableRef.value?.doLayout?.(), 80);
                    });
                };
                const resetCreateForm = () => {
                    createForm.companyName = '';
                    createForm.title = '';
                    createForm.plates = [];
                    createForm.targets = [];
                };
                const openCreateDialog = () => {
                    resetCreateForm();
                    createDialogVisible.value = true;
                };
                const handleCompanyChange = () => {
                    createForm.plates = [];
                    createForm.targets = [];
                };
                const submitCreateDialog = () => {
                    const missing = [];
                    if (!createForm.companyName) missing.push('分公司');
                    if (!String(createForm.title || '').trim()) missing.push('标题');
                    if (!createForm.plates.length) missing.push('车牌号');
                    if (!createForm.targets.length) missing.push('限定使用人');
                    if (missing.length) {
                        ElMessage.warning(`请先完成：${missing.join('、')}`);
                        return;
                    }

                    const resolveTargetLabel = (value) => {
                        for (const group of targetOptions.value) {
                            const matched = group.options.find(item => item.value === value);
                            if (matched) return matched.label;
                        }
                        return value;
                    };

                    tableData.value.unshift({
                        companyName: createForm.companyName,
                        title: createForm.title.trim(),
                        plate: createForm.plates.join('、'),
                        append: createForm.targets.map(resolveTargetLabel).join('、')
                    });
                    createDialogVisible.value = false;
                    ElMessage.success('用车设定已保存');
                    syncTableLayout();
                };
                onMounted(() => {
                    syncTableLayout();
                    window.addEventListener('resize', syncTableLayout);
                });
                onBeforeUnmount(() => window.removeEventListener('resize', syncTableLayout));
</script>

<style scoped>
        .car-use-page {
            min-height: 100%;
            background: transparent;
        }

        .car-use-page__header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
        }

        .car-use-page__add-button {
            box-shadow: 0 10px 30px rgb(var(--app-color-primary-rgb) / 18%);
        }

        .car-use-page__content-card {
            display: flex;
            min-height: calc(100vh - 284px);
            flex-direction: column;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }

        .car-use-page__toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 16px;
            background: #f9fafb;
            border-bottom: 1px solid #f3f4f6;
            flex-wrap: wrap;
        }

        .car-use-page__filters {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .car-use-page__summary {
            color: #6b7280;
            font-size: 14px;
            white-space: nowrap;
        }

        .car-use-table :deep(.el-table__inner-wrapper::before) {
            display: none;
        }

        .car-use-table :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            padding-top: 0;
            padding-bottom: 0;
        }

        .car-use-table :deep(.el-table__body td.el-table__cell) {
            padding-top: 14px;
            padding-bottom: 14px;
        }

        .car-use-table :deep(.el-table__row td) {
            border-bottom: 1px solid #f3f4f6;
        }

        .car-use-table :deep(.el-table__header table),
        .car-use-table :deep(.el-table__body table),
        .car-use-table :deep(.el-table__footer table) {
            table-layout: fixed !important;
        }

        .car-use-table :deep(.el-table__header th.el-table__cell > .cell) {
            display: flex;
            min-height: 44px;
            align-items: center;
            box-sizing: border-box;
            white-space: nowrap;
        }

        .car-use-table :deep(.el-table__header th.is-center > .cell) {
            justify-content: center;
        }

        .car-use-table :deep(.el-table__header th.is-right > .cell) {
            justify-content: flex-end;
        }

        .car-use-table :deep(.el-button.is-link) {
            font-weight: 500;
        }

        .car-use-dialog__hint {
            margin-bottom: 14px;
            color: #6b7280;
            font-size: 12px;
            line-height: 18px;
        }

        .car-use-dialog__footer {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            width: 100%;
        }

        @media (max-width: 960px) {
            .car-use-page__content-card {
                min-height: calc(100vh - 240px);
            }
        }
</style>
