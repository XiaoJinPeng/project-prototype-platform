<template>
<div class="vehicle-status-list-page flex min-h-full flex-col">
            
            

            
            <main class="flex-1 flex flex-col gap-4">
                
                <PageHeader unstyled class="flex justify-between items-end shrink-0" title="车辆速查表" description="全局查询车辆实时运行工况、调度定位与当前订单当前分配。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1" /><div 
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 shrink-0 flex flex-col gap-4 relative overflow-hidden">
                    <div class="flex justify-between items-center gap-6">
                        <div class="flex gap-3 z-10 w-2/3 items-center flex-wrap">
                            <el-input v-model="filters.keyword" placeholder="搜索车牌号/厂牌/车款..." prefix-icon="Search" clearable
                                class="w-64"></el-input>

                            <el-select v-model="filters.station" placeholder="据点/门店" style="width: 140px;" clearable>
                                <el-option label="台北车站门店" value="S-TPE"></el-option>
                                <el-option label="松山机场门店" value="S-TSA"></el-option>
                                <el-option label="左营高铁站门店" value="S-KHH"></el-option>
                            </el-select>

                            <el-select v-model="filters.status" placeholder="当前状态" style="width: 120px;" clearable>
                                <el-option label="空闲在库" value="IDLE"></el-option>
                                <el-option label="已出租" value="RENTED"></el-option>
                                <el-option label="调度中" value="DISPATCHING"></el-option>
                                <el-option label="维修保养" value="MAINTENANCE"></el-option>
                            </el-select>

                            <el-button type="primary" icon="Filter" plain @click="searchPanelExpanded = !searchPanelExpanded">
                                {{ searchPanelExpanded ? '收起筛选' : '更多筛选' }}
                            </el-button>
                            <el-tooltip content="重置筛选" placement="top">
                                <el-button circle @click="resetFilters">
                                    <el-icon>
                                        <Refresh></Refresh>
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                        </div>

                        <div class="flex gap-8 z-10">
                            <div class="text-right">
                                <div class="text-xs text-gray-500 font-medium mb-1">监控车辆池</div>
                                <div class="text-2xl font-bold text-gray-800">{{ mockData.length }} <span 
                                        class="text-sm font-normal text-gray-400">台</span></div>
                            </div>
                            <div class="w-px bg-gray-200"></div>
                            <div class="text-right">
                                <div class="text-xs text-gray-500 font-medium mb-1">营运中 (在途)</div>
                                <div class="text-2xl font-bold text-blue-600">{{ mockData.filter(v => v.status ===
                                    'RENTED').length }} <span class="text-sm font-normal text-gray-400">台</span></div>
                            </div>
                        </div>
                    </div>

                    <div v-show="searchPanelExpanded" class="pt-4 mt-1 border-t border-gray-100">
                        <div class="flex flex-wrap items-center gap-3">
                            <el-select v-model="advancedFilters.group" placeholder="车组" clearable style="width: 140px;">
                                <el-option v-for="group in groupOptions" :key="group" :label="group" :value="group"></el-option>
                            </el-select>

                            <el-select v-model="advancedFilters.fuelType" placeholder="能源类型" clearable style="width: 130px;">
                                <el-option label="汽油" value="Gasoline"></el-option>
                                <el-option label="柴油" value="Diesel"></el-option>
                                <el-option label="纯电" value="EV"></el-option>
                                <el-option label="油电" value="Hybrid"></el-option>
                            </el-select>

                            <el-select v-model="advancedFilters.orderState" placeholder="订单占用" clearable style="width: 130px;">
                                <el-option label="无订单" value="none"></el-option>
                                <el-option label="有订单" value="occupied"></el-option>
                            </el-select>
                        </div>
                    </div>
                </div>

                
                <div class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <el-table :data="filteredData" style="width: 100%; height: 100%;" stripe border size="small">
                        
                        <el-table-column label="车牌号" width="120" fixed="left" align="center">
                            <template #default="{ row }">
                                <span class="font-bold text-sm tracking-widest text-theme-primary"
                                    :class="{'opacity-50 line-through': row.status === 'MAINTENANCE'}">{{ row.plate
                                    }}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="当前状态" width="100" fixed="left" align="center">
                            <template #default="{ row }">
                                <el-tag v-if="row.status === 'IDLE'" type="success" effect="dark"
                                    size="small">空闲在库</el-tag>
                                <el-tag v-else-if="row.status === 'RENTED'" type="primary" effect="dark"
                                    size="small">已出租</el-tag>
                                <el-tag v-else-if="row.status === 'DISPATCHING'" type="warning" effect="dark"
                                    size="small">调度中</el-tag>
                                <el-tag v-else-if="row.status === 'MAINTENANCE'" type="danger" effect="plain"
                                    size="small">维修/保养</el-tag>
                            </template>
                        </el-table-column>

                        
                        <el-table-column label="车辆基础信息" align="center">
                            <el-table-column prop="brand" label="厂牌" width="100"></el-table-column>
                            <el-table-column prop="model" label="车款" width="150"
                                show-overflow-tooltip></el-table-column>
                            <el-table-column prop="group" label="车组" width="100">
                                <template #default="{ row }">
                                    <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{{ row.group
                                        }}</span>
                                </template>
                            </el-table-column>
                        </el-table-column>

                        
                        <el-table-column label="归属与营运配置" align="center">
                            <el-table-column prop="station" label="所属车行/据点" width="180" show-overflow-tooltip>
                                <template #default="{ row }">
                                    <div class="flex items-center gap-1">
                                        <el-icon class="text-blue-400">
                                            <Shop></Shop>
                                        </el-icon>
                                        <span>{{ row.station }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="serviceType" label="支持服务类型" width="140" show-overflow-tooltip>
                                <template #default="{ row }">
                                    <span class="text-xs text-gray-500 border border-gray-200 px-1 py-0.5 rounded">{{
                                        row.serviceType }}</span>
                                </template>
                            </el-table-column>
                        </el-table-column>

                        
                        <el-table-column label="实时遥测工况 (T-Box)" align="center">
                            <el-table-column prop="mileage" label="现有里程" width="110" align="right">
                                <template #default="{ row }">
                                    <span class="font-mono text-gray-700">{{ row.mileage.toLocaleString() }} <span 
                                            class="text-[10px] text-gray-400">km</span></span>
                                </template>
                            </el-table-column>

                            <el-table-column prop="fuel" label="油量/剩余电量" width="140" align="center">
                                <template #default="{ row }">
                                    <div class="flex flex-col gap-1 px-2" :title="'当前余量: ' + row.fuelLevel + '%'">
                                        <div class="flex justify-between text-[10px] text-gray-500">
                                            <span>{{ row.fuelType === 'EV' ? 'SOC 电量' : '油箱余量' }}</span>
                                            <span class="font-bold whitespace-nowrap"
                                                :class="row.fuelLevel < 20 ? 'text-red-500' : 'text-emerald-500'">{{
                                                row.fuelLevel }} %</span>
                                        </div>
                                        <div class="meter-bar">
                                            <div class="meter-fill"
                                                :class="row.fuelLevel < 20 ? 'bg-red-500' : 'bg-emerald-500'"
                                                :style="{ width: row.fuelLevel + '%' }"></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column prop="voltage" label="电池电压" width="90" align="center">
                                <template #default="{ row }">
                                    <span class="font-mono text-xs"
                                        :class="row.voltage < 11.5 ? 'text-red-500 font-bold' : 'text-gray-500'">{{
                                        row.voltage }}V</span>
                                </template>
                            </el-table-column>
                        </el-table-column>

                        
                        <el-table-column label="行驶动态监控" align="center">
                            <el-table-column prop="speed" label="当前车速" width="90" align="right">
                                <template #default="{ row }">
                                    <span class="font-mono font-bold"
                                        :class="row.speed > 0 ? 'text-blue-600' : 'text-gray-400'">{{ row.speed
                                        }}</span>
                                    <span class="text-[10px] text-gray-400 ml-1">km/h</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="rpm" label="引擎转速" width="90" align="right">
                                <template #default="{ row }">
                                    <span class="font-mono text-xs text-gray-600">{{ row.rpm }} <span 
                                            class="text-gray-300">rpm</span></span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="address" label="当前实时位置" min-width="260" show-overflow-tooltip>
                                <template #default="{ row }">
                                    <div class="flex items-center gap-1.5 truncate">
                                        <el-icon class="mt-0.5 text-red-500 shrink-0">
                                            <Location></Location>
                                        </el-icon>
                                        <span class="text-xs text-gray-600 truncate" :title="row.address">{{ row.address
                                            }}</span>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table-column>

                        
                        <el-table-column label="关联订单预售情况" width="220" fixed="right">
                            <template #default="{ row }">
                                <div v-if="row.orderInfo" class="flex flex-col gap-0.5">
                                    <div class="flex items-center justify-between">
                                        <div class="text-xs font-bold text-blue-700 hover:underline cursor-pointer">#{{
                                            row.orderInfo.orderNo }}</div>
                                        <el-tag size="small" type="success" effect="plain"
                                            v-if="row.orderInfo.status === 'ACTIVE'">进行中</el-tag>
                                        <el-tag size="small" type="warning" effect="plain" v-else>即将提车</el-tag>
                                    </div>
                                    <div class="text-[10px] text-gray-400 font-mono mt-1">预计归还: {{
                                        row.orderInfo.returnTime }}</div>
                                    <div class="text-[10px] text-gray-400 truncate">归还至: {{ row.orderInfo.returnStation
                                        }}</div>
                                </div>
                                <div v-else class="text-center text-gray-300 text-xs py-2">
                                    — 今日无排程订单 —
                                </div>
                            </template>
                        </el-table-column>

                    </el-table>
                    
                    <div class="p-3 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <span class="text-xs text-gray-500">此面板仅展示带有物联设备的可用车辆</span>
                        <el-pagination background layout="total, sizes, prev, pager, next" :total="filteredData.length"
                            :page-size="20" ></el-pagination>
                    </div>
                </div>

            </main>
        </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { PageHeader } from '@/components/ui';

// Mock Filters
                const filters = reactive({
                    keyword: '',
                    station: '',
                    status: ''
                });
                const searchPanelExpanded = ref(false);
                const advancedFilters = reactive({
                    group: '',
                    fuelType: '',
                    orderState: ''
                });

                // Mock Wide Table Data (Taiwan Locale Formatting with Simplified Chinese UI Strings)
                const mockData = ref([
                    {
                        id: 1,
                        plate: 'RAB-1234',
                        brand: 'Tesla',
                        model: 'Model 3',
                        group: '纯电轿车 E组',
                        serviceType: '同站租还 / 甲租乙还',
                        station: '台北管理区 - 台北车站门店',
                        mileage: 45210,
                        fuelType: 'EV',
                        fuelLevel: 85,
                        voltage: 12.8,
                        speed: 65,
                        rpm: 0,
                        address: '台北市大安区建国南路高架桥近信义路下匝道',
                        status: 'RENTED',
                        orderInfo: {
                            orderNo: 'ORD-20260401-001A',
                            status: 'ACTIVE',
                            returnTime: '今日 18:00',
                            returnStation: '松山机场门店'
                        }
                    },
                    {
                        id: 2,
                        plate: 'RDZ-5566',
                        brand: 'Toyota',
                        model: 'Corolla Altis 1.8',
                        group: '经济型 C组',
                        serviceType: '同站租还',
                        station: '台北管理区 - 台北车站门店',
                        mileage: 120500,
                        fuelType: 'GAS',
                        fuelLevel: 15,
                        voltage: 12.2,
                        speed: 0,
                        rpm: 0,
                        address: '台北市中正区北平西路3号 (站区地下停车场B2)',
                        status: 'IDLE',
                        orderInfo: null
                    },
                    {
                        id: 3,
                        plate: 'TCD-9900',
                        brand: 'Toyota',
                        model: 'Alphard 2.5 Hybrid',
                        group: '豪华商务 M组',
                        serviceType: '尊荣代驾 / 同站租还',
                        station: '台北管理区 - 松山机场门店',
                        mileage: 23410,
                        fuelType: 'GAS',
                        fuelLevel: 98,
                        voltage: 13.1,
                        speed: 0,
                        rpm: 850,
                        address: '台北市松山区敦化北路340之9号 (第一航厦门口怠速中)',
                        status: 'DISPATCHING',
                        orderInfo: {
                            orderNo: 'ORD-20260402-VIP1',
                            status: 'PENDING',
                            returnTime: '明日 10:00',
                            returnStation: '松山机场门店'
                        }
                    },
                    {
                        id: 4,
                        plate: 'REN-8888',
                        brand: 'Porsche',
                        model: 'Macan S',
                        group: '豪华SUV S组',
                        serviceType: '同站租还',
                        station: '高雄管理区 - 左营高铁站门店',
                        mileage: 8900,
                        fuelType: 'GAS',
                        fuelLevel: 45,
                        voltage: 12.4,
                        speed: 110,
                        rpm: 2100,
                        address: '高雄市楠梓区国道1号南下351K处',
                        status: 'RENTED',
                        orderInfo: {
                            orderNo: 'ORD-20260330-999X',
                            status: 'ACTIVE',
                            returnTime: '后天 20:00',
                            returnStation: '左营高铁站门店'
                        }
                    },
                    {
                        id: 5,
                        plate: 'EAB-1234',
                        brand: 'Honda',
                        model: 'CR-V 1.5 T',
                        group: '家庭SUV S组',
                        serviceType: '同站租还',
                        station: '高雄管理区 - 左营高铁站门店',
                        mileage: 67100,
                        fuelType: 'GAS',
                        fuelLevel: 50,
                        voltage: 12.0,
                        speed: 0,
                        rpm: 0,
                        address: '高雄市左营区高铁路105号 (合作修理厂内)',
                        status: 'MAINTENANCE',
                        orderInfo: null
                    },
                    {
                        id: 6,
                        plate: 'RCF-0099',
                        brand: 'Tesla',
                        model: 'Model Y Performance',
                        group: '纯电SUV E组',
                        serviceType: '甲租乙还',
                        station: '台北管理区 - 台北车站门店',
                        mileage: 18450,
                        fuelType: 'EV',
                        fuelLevel: 12, // Low battery
                        voltage: 12.6,
                        speed: 0,
                        rpm: 0,
                        address: '新北市板桥区县民大道二段7号 (板桥车站B3超充站充电中)',
                        status: 'IDLE',
                        orderInfo: null
                    }
                ]);

                const filteredData = computed(() => {
                    return mockData.value.filter(item => {
                        let match = true;
                        if (filters.keyword) {
                            const q = filters.keyword.toLowerCase();
                            match = match && (
                                item.plate.toLowerCase().includes(q) ||
                                item.brand.toLowerCase().includes(q) ||
                                item.model.toLowerCase().includes(q)
                            );
                        }
                        if (filters.station) {
                            if (filters.station === 'S-TPE') match = match && item.station.includes('台北车站');
                            if (filters.station === 'S-TSA') match = match && item.station.includes('松山机场');
                            if (filters.station === 'S-KHH') match = match && item.station.includes('左营高铁');
                        }
                        if (filters.status) {
                            match = match && item.status === filters.status;
                        }
                        if (advancedFilters.group) {
                            match = match && item.group === advancedFilters.group;
                        }
                        if (advancedFilters.fuelType) {
                            match = match && item.fuelType === advancedFilters.fuelType;
                        }
                        if (advancedFilters.orderState) {
                            match = match && (advancedFilters.orderState === 'occupied' ? !!item.orderInfo : !item.orderInfo);
                        }
                        return match;
                    });
                });

                const groupOptions = computed(() => [...new Set(mockData.value.map(item => item.group))]);

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.station = '';
                    filters.status = '';
                    advancedFilters.group = '';
                    advancedFilters.fuelType = '';
                    advancedFilters.orderState = '';
                    searchPanelExpanded.value = false;
                };
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
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

        /* 覆盖 Element UI 默认背景色以匹配 Tailwind */
        :deep(.el-table th.el-table__cell) {
            background-color: #f9fafb !important;
            color: #4b5563;
            font-weight: 600;
        }

        .meter-bar {
            height: 6px;
            border-radius: 3px;
            background-color: #e5e7eb;
            overflow: hidden;
            display: flex;
        }

        .meter-fill {
            height: 100%;
            transition: width 0.3s ease;
        }
</style>
