<template>
<div class="vehicle-transfer-page">
            
            

            
            <main class="flex flex-col">
                
                <PageHeader unstyled class="flex justify-between items-end mb-6 shrink-0" title="车辆调拨管理" description="负责修改同业务站点分布或执行跨业务线服务切换操作，支持单发及批量调度。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                    <template #actions>
                        <el-button type="primary" size="large" class="shadow-md shadow-theme-primary/20" :disabled="selectedVehicles.length === 0" @click="openBatchTransferDrawer">
                            <el-icon class="mr-1"><Connection></Connection></el-icon> 批量调拨 ({{ selectedVehicles.length }})
                        </el-button>
                    </template>
                </PageHeader><div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-gray-100 flex gap-4 items-center bg-gray-50 flex-wrap shrink-0">
                        <el-input v-model="filters.keyword" placeholder="搜索车牌号/车型" prefix-icon="Search"
                            style="width: 240px" clearable></el-input>

                        <el-tree-select v-model="filters.stationId" :data="orgData" check-strictly placeholder="当前所在站点"
                            clearable style="width: 200px"></el-tree-select>

                        <el-select v-model="filters.serviceType" placeholder="当前服务类型" clearable style="width: 160px">
                            <el-option label="同站租还" value="SHARING_SAME"></el-option>
                            <el-option label="甲租乙还" value="SHARING_ONE_WAY"></el-option>
                            <el-option label="门市租赁" value="STORE_STANDARD"></el-option>
                            <el-option label="24H门市" value="STORE_24H"></el-option>
                        </el-select>

                        <el-tooltip content="重置筛选" placement="top">
                            <el-button circle @click="resetFilters">
                                <el-icon>
                                    <Refresh></Refresh>
                                </el-icon>
                            </el-button>
                        </el-tooltip>
                    </div>

                    
                    <el-table :data="filteredVehicles" class="flex-1 w-full" height="100%"
                        @selection-change="handleSelectionChange">
                        <el-table-column type="selection" width="50" align="center"></el-table-column>

                        <el-table-column label="车辆信息" min-width="200">
                            <template #default="{ row }">
                                <div class="flex items-center gap-3">
                                    <div 
                                        class="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                        <el-icon class="text-gray-400 text-xl">
                                            <Van></Van>
                                        </el-icon>
                                    </div>
                                    <div>
                                        <div class="font-bold text-gray-800">{{ row.licensePlate }} <el-tag 
                                                v-if="row.isTransferring" size="small" type="warning" effect="dark"
                                                class="ml-1 scale-90">调拨中</el-tag></div>
                                        <div class="text-xs text-gray-500 mt-1">{{ row.model }}</div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="当前站点" min-width="160">
                            <template #default="{ row }">
                                <div class="font-medium text-gray-700 flex items-center">
                                    <el-icon class="mr-1 text-gray-400">
                                        <Location></Location>
                                    </el-icon>
                                    <span>{{ getStationName(row.currentStationId) }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="当前服务类型" width="140">
                            <template #default="{ row }">
                                <el-tag :type="getServiceTagType(row.currentServiceType)" effect="light">
                                    {{ getServiceName(row.currentServiceType) }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="row.status === 'IDLE' ? 'success' : 'info'" size="small">
                                    {{ row.status === 'IDLE' ? '空闲中' : '不可调拨' }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="120" fixed="right" align="center">
                            <template #default="{ row }">
                                <el-button link type="primary" :disabled="row.status !== 'IDLE' || row.isTransferring"
                                    @click="openSingleTransfer(row)">
                                    <el-icon class="mr-1">
                                        <Switch></Switch>
                                    </el-icon> 快捷调度
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </main>
        </div>

        
        <el-drawer v-model="transferDrawerVisible" :title="drawerTitle" size="900px" custom-class="custom-drawer"
            :before-close="handleDrawerClose">
            <div class="flex flex-col h-full bg-gray-50/50">
                
                <div v-if="transferList.length > 1" class="shrink-0 p-5 bg-white border-b border-gray-200">
                    <div class="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        <el-icon class="mr-2 text-blue-500 text-lg">
                            <Setting></Setting>
                        </el-icon>
                        批量统一配置 (可选)
                    </div>
                    <div class="flex items-end gap-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                        <div class="flex-1">
                            <div class="text-xs text-gray-500 mb-1">统一变更为服务类型</div>
                            <el-select v-model="bulkConfig.serviceType" placeholder="保持原样" class="w-full" clearable>
                                <el-option label="同站租还" value="SHARING_SAME"></el-option>
                                <el-option label="甲租乙还" value="SHARING_ONE_WAY"></el-option>
                                <el-option label="门市租赁" value="STORE_STANDARD"></el-option>
                            </el-select>
                        </div>
                        <div class="flex-1">
                            <div class="text-xs text-gray-500 mb-1">统一变更为目标站点</div>
                            <el-tree-select v-model="bulkConfig.stationId" :data="orgData" check-strictly
                                placeholder="选择目标站点" class="w-full" clearable></el-tree-select>
                        </div>
                        <el-button type="primary" plain @click="applyBulkConfig">应用到下方所有车辆</el-button>
                    </div>
                </div>

                
                <div class="flex-1 overflow-y-auto p-5 space-y-4">
                    <div class="text-sm font-bold text-gray-700 flex items-center justify-between">
                        <span>调拨执行清单 ({{ transferList.length }}辆)</span>
                        <div class="text-xs font-normal space-x-3">
                            <span class="text-orange-500 font-medium">标识有实质变更</span>
                            <span class="text-gray-400">若无变更将忽略执行</span>
                        </div>
                    </div>

                    <div v-for="(item, index) in transferList" :key="item.vehicle.id"
                        class="bg-white rounded-xl border p-4 shadow-sm transition-colors"
                        :class="hasChanges(item) ? 'border-orange-300' : 'border-gray-200'">

                        <div class="flex items-center">
                            
                            <div class="w-[280px] shrink-0 pr-4 border-r border-gray-100 border-dashed">
                                <div class="font-bold text-gray-800 text-base mb-2">{{ item.vehicle.licensePlate }}
                                </div>
                                <div class="space-y-2">
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-400">目前站点</span>
                                        <span class="font-medium text-gray-700">{{
                                            getStationName(item.vehicle.currentStationId) }}</span>
                                    </div>
                                    <div class="flex justify-between text-sm">
                                        <span class="text-gray-400">服务类型</span>
                                        <el-tag :type="getServiceTagType(item.vehicle.currentServiceType)" size="small"
                                            effect="plain">{{ getServiceName(item.vehicle.currentServiceType)
                                            }}</el-tag>
                                    </div>
                                </div>
                            </div>

                            
                            <div class="px-6 flex flex-col items-center justify-center">
                                <el-icon class="text-2xl transition-colors"
                                    :class="hasChanges(item) ? 'text-orange-400' : 'text-gray-200'">
                                    <Right></Right>
                                </el-icon>
                                <span v-if="hasChanges(item)"
                                    class="text-[10px] text-orange-500 mt-1 font-bold">变更</span>
                            </div>

                            
                            <div class="flex-1 space-y-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-20 text-sm text-gray-500 text-right shrink-0">目标类型</div>
                                    <el-select v-model="item.targetServiceType" class="flex-1"
                                        :class="{'ring-1 ring-orange-300 rounded': isServiceTypeChanged(item)}">
                                        <el-option label="同站租还" value="SHARING_SAME"></el-option>
                                        <el-option label="甲租乙还" value="SHARING_ONE_WAY"></el-option>
                                        <el-option label="门市租赁" value="STORE_STANDARD"></el-option>
                                    </el-select>
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="w-20 text-sm text-gray-500 text-right shrink-0">目标站点</div>
                                    <el-tree-select v-model="item.targetStationId" :data="orgData" check-strictly
                                        class="flex-1"
                                        :class="{'ring-1 ring-orange-300 rounded': isStationChanged(item)}"
                                        placeholder="请选择调入站点"></el-tree-select>
                                </div>
                            </div>
                        </div>

                        
                        <div v-if="!item.targetStationId" class="mt-3 text-xs text-red-500 text-right pr-2">
                            * 必须选择目标站点
                        </div>
                    </div>
                </div>

                
                <div class="shrink-0 p-4 border-t border-gray-200 bg-white flex justify-between items-center">
                    <div class="text-sm">
                        <span class="text-gray-500">检测到</span>
                        <span class="font-bold text-orange-600 mx-1">{{ changedVehicleCount }}</span>
                        <span class="text-gray-500">辆车产生实际变更</span>
                    </div>
                    <div class="flex gap-3">
                        <el-button @click="transferDrawerVisible = false">取消</el-button>
                        <el-button type="primary" color="#ea580c" class="shadow-md"
                            :disabled="changedVehicleCount === 0 || !isAllValid" @click="submitTransfer"
                            :loading="isSubmitting">
                            <el-icon class="mr-1">
                                <Check></Check>
                            </el-icon> 确认执行调拨
                        </el-button>
                    </div>
                </div>
            </div>
        </el-drawer>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { PageHeader } from '@/components/ui';

// Mock Organisation Data
                const orgData = [
                    {
                        value: 'city-tpe',
                        label: '台北市',
                        disabled: true,
                        children: [
                            { value: 's-1', label: '台北車站門市 (所有)' },
                            { value: 's-2', label: '松山機場門市 (單向)' },
                            { value: 's-3', label: '信義CBD網點 (同站)' }
                        ]
                    },
                    {
                        value: 'city-khh',
                        label: '高雄市',
                        disabled: true,
                        children: [
                            { value: 's-4', label: '左營高鐵站門市' },
                            { value: 's-5', label: '駁二藝術特區中心' }
                        ]
                    }
                ];

                // Mock Vehicles List
                const allVehicles = ref([
                    { id: 1, licensePlate: 'RAB-1234', model: 'Model 3', currentStationId: 's-1', currentServiceType: 'SHARING_SAME', status: 'IDLE', isTransferring: false },
                    { id: 2, licensePlate: 'RDZ-5566', model: 'Model 3', currentStationId: 's-3', currentServiceType: 'SHARING_SAME', status: 'IDLE', isTransferring: false },
                    { id: 3, licensePlate: 'TCD-9900', model: 'Toyota Alphard', currentStationId: 's-2', currentServiceType: 'SHARING_ONE_WAY', status: 'IDLE', isTransferring: false },
                    { id: 4, licensePlate: 'REN-8888', model: 'Porsche Macan', currentStationId: 's-4', currentServiceType: 'STORE_STANDARD', status: 'USED', isTransferring: false },
                    { id: 5, licensePlate: 'EAB-1234', model: 'Model Y', currentStationId: 's-5', currentServiceType: 'SHARING_SAME', status: 'IDLE', isTransferring: false }
                ]);

                // Filters
                const filters = reactive({
                    keyword: '',
                    stationId: '',
                    serviceType: ''
                });

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.stationId = '';
                    filters.serviceType = '';
                };

                const filteredVehicles = computed(() => {
                    return allVehicles.value.filter(v => {
                        if (filters.keyword && !v.licensePlate.includes(filters.keyword) && !v.model.includes(filters.keyword)) return false;
                        if (filters.stationId && v.currentStationId !== filters.stationId) return false;
                        if (filters.serviceType && v.currentServiceType !== filters.serviceType) return false;
                        return true;
                    });
                });

                // Selection handling
                const selectedVehicles = ref([]);
                const handleSelectionChange = (val) => {
                    selectedVehicles.value = val;
                };

                // Helpers
                const getStationName = (id) => {
                    if (!id) return '未知站点';
                    for (const city of orgData) {
                        const s = city.children?.find(c => c.value === id);
                        if (s) return s.label;
                    }
                    return id;
                };

                const getServiceName = (type) => {
                    const map = {
                        'SHARING_SAME': '同站租还',
                        'SHARING_ONE_WAY': '甲租乙还',
                        'STORE_STANDARD': '门市租赁',
                        'STORE_24H': '24H门市'
                    };
                    return map[type] || type;
                };

                const getServiceTagType = (type) => {
                    if (type === 'SHARING_SAME') return 'success';
                    if (type === 'SHARING_ONE_WAY') return 'warning';
                    return 'primary';
                };

                // Drawer & Transfer State
                const transferDrawerVisible = ref(false);
                const transferList = ref([]);
                const bulkConfig = reactive({
                    serviceType: '',
                    stationId: ''
                });
                const isSubmitting = ref(false);

                const drawerTitle = computed(() => {
                    return transferList.value.length > 1 ? `批量车辆调拨与服务切换` : `单车快捷调拨`;
                });

                const buildTransferItem = (vehicle) => {
                    return {
                        vehicle,
                        targetServiceType: vehicle.currentServiceType,
                        targetStationId: vehicle.currentStationId
                    };
                };

                const openSingleTransfer = (row) => {
                    transferList.value = [buildTransferItem(row)];
                    bulkConfig.serviceType = '';
                    bulkConfig.stationId = '';
                    transferDrawerVisible.value = true;
                };

                const openBatchTransferDrawer = () => {
                    transferList.value = selectedVehicles.value.map(v => buildTransferItem(v));
                    bulkConfig.serviceType = '';
                    bulkConfig.stationId = '';
                    transferDrawerVisible.value = true;
                };

                const handleDrawerClose = (done) => {
                    done();
                };

                // Diffing Logics
                const isServiceTypeChanged = (item) => item.targetServiceType !== item.vehicle.currentServiceType;
                const isStationChanged = (item) => item.targetStationId !== item.vehicle.currentStationId;
                const hasChanges = (item) => isServiceTypeChanged(item) || isStationChanged(item);

                const changedVehicleCount = computed(() => transferList.value.filter(hasChanges).length);
                const isAllValid = computed(() => transferList.value.every(item => item.targetStationId));

                // Actions
                const applyBulkConfig = () => {
                    transferList.value.forEach(item => {
                        if (bulkConfig.serviceType) item.targetServiceType = bulkConfig.serviceType;
                        if (bulkConfig.stationId) item.targetStationId = bulkConfig.stationId;
                    });
                };

                const submitTransfer = () => {
                    isSubmitting.value = true;
                    setTimeout(() => {
                        transferList.value.forEach(item => {
                            if (hasChanges(item)) {
                                item.vehicle.currentServiceType = item.targetServiceType;
                                item.vehicle.currentStationId = item.targetStationId;
                            }
                        });
                        isSubmitting.value = false;
                        transferDrawerVisible.value = false;
                        ElMessage.success({ message: `成功执行调拨任务`, offset: 50 });
                    }, 1000);
                };
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        .custom-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 3px;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #aaa;
        }
</style>
