<template>
<div class="tbox-management-page flex min-h-full flex-col">
            
            

            
            <main class="flex-1 flex flex-col gap-4">
                
                <PageHeader unstyled class="flex justify-between items-end shrink-0" title="车机设定中心" description="管理租户下所有车机设备，执行车辆换绑与授权验证操作。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1" /><div 
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 shrink-0 flex justify-between items-center gap-6 relative overflow-hidden">
                    <div 
                        class="absolute right-0 top-0 h-full w-64 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none">
                    </div>

                    <div class="flex gap-8 z-10">
                        <div>
                            <div class="text-xs text-gray-500 font-medium mb-1">租户名下车机总数</div>
                            <div class="text-2xl font-bold text-gray-800">{{ mockDevices.length }} <span 
                                    class="text-sm font-normal text-gray-400">台</span></div>
                        </div>
                        <div class="w-px bg-gray-200"></div>
                        <div>
                            <div class="text-xs text-gray-500 font-medium mb-1">已绑定车辆</div>
                            <div class="text-2xl font-bold text-blue-600">{{ boundCount }} <span 
                                    class="text-sm font-normal text-gray-400">台</span></div>
                        </div>
                        <div class="w-px bg-gray-200"></div>
                        <div>
                            <div class="text-xs text-gray-500 font-medium mb-1">在库闲置 (未绑定)</div>
                            <div class="text-2xl font-bold text-orange-500">{{ unboundCount }} <span 
                                    class="text-sm font-normal text-gray-400">台</span></div>
                        </div>
                    </div>

                    <div class="flex gap-3 z-10 w-1/3">
                        <el-input v-model="searchQuery" placeholder="搜索 CID / SIM卡 / 绑定车牌" prefix-icon="Search"
                            clearable class="w-full">
                        </el-input>
                        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 140px;">
                            <el-option label="所有状态" value="ALL"></el-option>
                            <el-option label="已绑定" value="BOUND"></el-option>
                            <el-option label="未绑定 (闲置)" value="UNBOUND"></el-option>
                        </el-select>
                        <el-button type="primary" icon="Plus">登写入库</el-button>
                    </div>
                </div>

                
                <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <el-table :data="filteredDevices" style="width: 100%; height: 100%;" stripe>
                        
                        <el-table-column label="硬件身份 (CID & SIM)" min-width="200" fixed="left">
                            <template #default="{ row }">
                                <div class="flex items-center gap-3">
                                    <div 
                                        class="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                        <el-icon class="text-blue-500">
                                            <Cpu></Cpu>
                                        </el-icon>
                                    </div>
                                    <div>
                                        <div class="font-bold text-sm text-gray-800 font-mono">{{ row.cid }}</div>
                                        <div class="text-xs text-gray-500 mt-0.5">SIM: <span class="font-mono">{{
                                                row.sim }}</span></div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        
                        <el-table-column label="型号与保固" min-width="140">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700">{{ row.model }}</div>
                                <div class="text-xs mt-0.5"
                                    :class="isExpiringSoon(row.warrantyDate) ? 'text-red-500 font-bold' : 'text-gray-400'">
                                    过保: {{ row.warrantyDate }}
                                </div>
                            </template>
                        </el-table-column>

                        
                        <el-table-column label="系统版本" min-width="120">
                            <template #default="{ row }">
                                <div class="text-xs text-gray-600 font-mono flex flex-col gap-0.5">
                                    <span title="基带/核心版本号(V1)">V1: {{ row.version1 }}</span>
                                    <span title="应用程序版本号(V2)">V2: {{ row.version2 }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        
                        <el-table-column label="电子钥匙 (iButton)" min-width="160">
                            <template #default="{ row }">
                                <div v-if="row.supportsIbutton" class="flex flex-col gap-0.5">
                                    <el-tag size="small" type="success" effect="plain" class="w-max">支持</el-tag>
                                    <span class="text-xs text-gray-500 font-mono mt-1" v-if="row.ibuttonCode">编码: {{
                                        row.ibuttonCode }}</span>
                                    <span class="text-xs text-gray-300 mt-1" v-else>未配对实体钥匙</span>
                                </div>
                                <div v-else>
                                    <el-tag size="small" type="info" effect="plain">硬件不支持</el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        
                        <el-table-column label="近期通讯" min-width="170">
                            <template #default="{ row }">
                                <div class="text-xs text-gray-600 flex flex-col gap-1">
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-400">上电:</span>
                                        <span>{{ row.powerOnTime || '-' }}</span>
                                    </div>
                                    <div class="flex items-center justify-between">
                                        <span class="text-gray-400">最后回传:</span>
                                        <span 
                                            :class="isOnline(row.lastReturnTime) ? 'text-emerald-600 font-medium' : 'text-red-500'">
                                            {{ row.lastReturnTime || '设备未激活' }}
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        
                        <el-table-column label="目前绑定车辆" min-width="140" align="center" fixed="right">
                            <template #default="{ row }">
                                <div v-if="row.boundPlate" class="flex flex-col items-center gap-1">
                                    <el-tag type="primary" effect="dark"
                                        class="font-bold tracking-wider cursor-pointer shadow-sm hover:scale-105 transition-transform">{{
                                        row.boundPlate }}</el-tag>
                                    <span class="text-[10px] text-gray-400">{{ row.vehicleModel }}</span>
                                </div>
                                <div v-else>
                                    <el-tag type="warning" effect="light" class="border-dashed cursor-not-allowed">
                                        在库闲置
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        
                        <el-table-column label="操作" width="130" fixed="right" align="center">
                            <template #default="{ row }">
                                <div class="flex flex-col gap-2">
                                    
                                    <el-button v-if="!row.boundPlate" type="primary" size="small" plain
                                        @click="openBindDialog(row)" class="!m-0">绑定车辆</el-button>

                                    
                                    <template v-else>
                                        <el-button type="primary" size="small" plain @click="openBindDialog(row, true)"
                                            class="!m-0">更换车辆</el-button>
                                        <el-button type="danger" size="small" text @click="unbindVehicle(row)"
                                            class="!m-0">强制解绑</el-button>
                                    </template>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                    
                    <div class="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50">
                        <el-pagination background layout="total, prev, pager, next" :total="filteredDevices.length"
                            :page-size="10" ></el-pagination>
                    </div>
                </div>

            </main>
        </div>

        
        <el-dialog v-model="bindDialogVisible" :title="isChanging ? '车机换绑操作' : '车机绑定操作'" width="500px" destroy-on-close>
            <div v-if="selectedDevice" class="pb-2">

                <div class="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-3 mb-5">
                    <el-icon class="text-blue-500 text-xl mt-0.5">
                        <WarnTriangleFilled></WarnTriangleFilled>
                    </el-icon>
                    <div class="text-sm">
                        <div class="text-blue-800 font-bold mb-1">目标操作车机：<span class="font-mono">{{ selectedDevice.cid
                                }}</span></div>
                        <div class="text-blue-600">请注意，换绑操作将使该车机取代目标车辆上原有的硬件授权信息。</div>
                    </div>
                </div>

                <el-form label-position="top">
                    
                    <el-form-item label="目前绑定的车辆" v-if="isChanging">
                        <el-input disabled
                            :value="selectedDevice.boundPlate + ' (' + selectedDevice.vehicleModel + ')'"></el-input>
                    </el-form-item>

                    <el-form-item :label="isChanging ? '选择新目标车辆' : '选择载体车辆'">
                        <el-select v-model="targetPlate" filterable placeholder="请搜索车牌号码 (如 RAB-1234)" class="w-full"
                            no-match-text="未找到空缺车辆">
                            <el-option v-for="v in unboundVehicles" :key="v.plate" :label="v.plate + ' - ' + v.model"
                                :value="v.plate">
                                <span class="float-left font-bold">{{ v.plate }}</span>
                                <span class="float-right text-gray-400 text-xs">{{ v.model }}</span>
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>

            <template #footer>
                <div class="flex justify-between items-center w-full">
                    <div class="text-xs text-gray-400">
                        请确保现场硬件安装完毕后再进行线上绑定
                    </div>
                    <div>
                        <el-button @click="bindDialogVisible = false">取消</el-button>
                        <el-button type="primary" :disabled="!targetPlate" @click="confirmBinding"
                            :loading="isSubmitting">
                            确认执行
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { PageHeader } from '@/components/ui';
import dayjs from 'dayjs';

// Mock Devices DB (Taiwan specifics with Simplified Chinese)
                const mockDevices = ref([
                    {
                        id: 1,
                        cid: 'TBX-123456-A1',
                        model: 'RIMO-TBOX-V3.2',
                        sim: '8988601234567890123',
                        warrantyDate: '2028-05-20',
                        version1: 'B22.09.11',
                        version2: 'APP_v4.5.1',
                        supportsIbutton: true,
                        ibuttonCode: 'IB-9908123A',
                        powerOnTime: dayjs().subtract(5, 'day').format('YYYY-MM-DD HH:mm:ss'),
                        lastReturnTime: dayjs().subtract(2, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                        boundPlate: 'RAB-1234',
                        vehicleModel: 'Model 3 长续航'
                    },
                    {
                        id: 2,
                        cid: 'TBX-654321-B2',
                        model: 'RIMO-TBOX-V3.2',
                        sim: '8988601234567890456',
                        warrantyDate: '2027-11-15',
                        version1: 'B22.09.11',
                        version2: 'APP_v4.2.0',
                        supportsIbutton: true,
                        ibuttonCode: 'IB-7708333B',
                        powerOnTime: dayjs().subtract(2, 'day').format('YYYY-MM-DD HH:mm:ss'),
                        lastReturnTime: dayjs().subtract(5, 'second').format('YYYY-MM-DD HH:mm:ss'),
                        boundPlate: 'RDZ-5566',
                        vehicleModel: 'Model 3 标准版'
                    },
                    {
                        id: 3,
                        cid: 'TBX-111111-C3',
                        model: 'LITE-TBOX-V2.0',
                        sim: '8988601234567890789',
                        warrantyDate: '2025-01-10', // Expired or expiring soon
                        version1: 'B18.01.01',
                        version2: 'APP_v2.1.0',
                        supportsIbutton: false,
                        ibuttonCode: null,
                        powerOnTime: dayjs().subtract(30, 'day').format('YYYY-MM-DD HH:mm:ss'),
                        lastReturnTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                        boundPlate: 'TCD-9900',
                        vehicleModel: 'Toyota Alphard'
                    },
                    {
                        id: 4,
                        cid: 'TBX-998877-K9',
                        model: 'RIMO-TBOX-V4.MAX',
                        sim: '8988609999999990111',
                        warrantyDate: '2029-12-31',
                        version1: 'B24.01.05',
                        version2: 'APP_v5.0.0',
                        supportsIbutton: true,
                        ibuttonCode: null, // Supported but no key paired
                        powerOnTime: null,
                        lastReturnTime: null,
                        boundPlate: null,
                        vehicleModel: null
                    },
                    {
                        id: 5,
                        cid: 'TBX-333333-E5',
                        model: 'RIMO-TBOX-V3.2',
                        sim: '8988601234567890222',
                        warrantyDate: '2028-06-01',
                        version1: 'B22.09.11',
                        version2: 'APP_v4.5.1',
                        supportsIbutton: true,
                        ibuttonCode: 'IB-5508111C',
                        powerOnTime: dayjs().subtract(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
                        lastReturnTime: dayjs().subtract(5, 'minute').format('YYYY-MM-DD HH:mm:ss'),
                        boundPlate: 'EAB-1234',
                        vehicleModel: 'Model Y'
                    }
                ]);

                // Mock Vehicles without TBOX bounds
                const allMockVehicles = [
                    { plate: 'REN-8888', model: 'Porsche Macan' },
                    { plate: 'AAA-0001', model: 'Tesla Model X' },
                    { plate: 'BBB-0002', model: 'Toyota Camry' },
                    { plate: 'CCC-0003', model: 'Honda CR-V' }
                ];

                // Keep only unbound ones for the selector
                const unboundVehicles = computed(() => {
                    const boundPlates = mockDevices.value.filter(d => d.boundPlate).map(d => d.boundPlate);
                    return allMockVehicles.filter(v => !boundPlates.includes(v.plate));
                });

                // Filters
                const searchQuery = ref('');
                const statusFilter = ref('ALL');

                const filteredDevices = computed(() => {
                    let result = mockDevices.value;

                    if (statusFilter.value === 'BOUND') {
                        result = result.filter(d => !!d.boundPlate);
                    } else if (statusFilter.value === 'UNBOUND') {
                        result = result.filter(d => !d.boundPlate);
                    }

                    if (searchQuery.value) {
                        const q = searchQuery.value.toLowerCase();
                        result = result.filter(d =>
                            d.cid.toLowerCase().includes(q) ||
                            d.sim.includes(q) ||
                            (d.boundPlate && d.boundPlate.toLowerCase().includes(q))
                        );
                    }
                    return result;
                });

                // Stats
                const boundCount = computed(() => mockDevices.value.filter(d => d.boundPlate).length);
                const unboundCount = computed(() => mockDevices.value.filter(d => !d.boundPlate).length);

                // Utilities
                const isExpiringSoon = (date) => {
                    if (!date) return false;
                    const diff = dayjs(date).diff(dayjs(), 'day');
                    // Expiry within 30 days is "soon"
                    return diff < 30;
                };

                const isOnline = (time) => {
                    if (!time) return false;
                    const diffMins = dayjs().diff(dayjs(time), 'minute');
                    return diffMins < 10; // returned within 10 mins is online
                };

                // Dialog State
                const bindDialogVisible = ref(false);
                const isChanging = ref(false);
                const selectedDevice = ref(null);
                const targetPlate = ref('');
                const isSubmitting = ref(false);

                // Actions
                const openBindDialog = (device, changeMode = false) => {
                    selectedDevice.value = { ...device };
                    isChanging.value = changeMode;
                    targetPlate.value = ''; // Reset selection
                    bindDialogVisible.value = true;
                };

                const unbindVehicle = (device) => {
                    ElMessageBox.confirm(
                        `确认要将车机 ${device.cid} 与车辆 ${device.boundPlate} 解除绑定吗？解绑后将失去对该车辆的远程控制权限。`,
                        '解除绑定确认',
                        {
                            confirmButtonText: '确认解绑',
                            cancelButtonText: '取消',
                            type: 'warning',
                        }
                    ).then(() => {
                        const index = mockDevices.value.findIndex(d => d.id === device.id);
                        if (index > -1) {
                            mockDevices.value[index].boundPlate = null;
                            mockDevices.value[index].vehicleModel = null;
                            ElMessage.success('已成功解除绑定');
                        }
                    }).catch(() => { });
                };

                const confirmBinding = () => {
                    isSubmitting.value = true;
                    // Mock API CALL
                    setTimeout(() => {
                        const index = mockDevices.value.findIndex(d => d.id === selectedDevice.value.id);
                        if (index > -1) {
                            const newVehicle = unboundVehicles.value.find(v => v.plate === targetPlate.value);
                            mockDevices.value[index].boundPlate = newVehicle.plate;
                            mockDevices.value[index].vehicleModel = newVehicle.model;
                            // Reset telemetry mock for new bond
                            mockDevices.value[index].powerOnTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
                            mockDevices.value[index].lastReturnTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

                            ElMessage.success(isChanging.value ? '车机换绑成功！' : '车机绑定成功！');
                            bindDialogVisible.value = false;
                        }
                        isSubmitting.value = false;
                    }, 800);
                };
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }

        /* 覆盖 Element UI 默认背景色以匹配 Tailwind bg-gray-50 */
        :deep(.el-table th.el-table__cell) {
            background-color: #f9fafb !important;
            color: #4b5563;
            font-weight: 600;
        }
</style>
