<template>
    <main class="vehicle-console-page flex flex-col gap-6">
                <!-- 顶部操作栏 -->
                <div class="flex justify-between items-end shrink-0">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">车辆控制台</h1>
                        <p class="text-gray-500 text-sm mt-1">远程实时操作车辆硬件接口，监控底盘、门锁与网络终端物理工况。</p>
                    </div>
                </div>
                
                <div class="flex-1 flex gap-6 overflow-hidden">

                <!-- 左侧: 车辆搜索与列表选车器 -->
                <div
                    class="w-80 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div class="p-4 border-b border-gray-100 bg-gray-50">
                        <div class="font-bold text-gray-800 mb-3 flex items-center">
                            <el-icon class="mr-2 text-blue-600">
                                <Van />
                            </el-icon> 目标车辆检索
                        </div>
                        <el-tree-select v-model="filters.stationId" :data="orgData" check-strictly
                            placeholder="请选择车行/门市/据点" class="w-full mb-3" clearable>
                        </el-tree-select>
                        <el-input v-model="filters.keyword" placeholder="搜索车牌号/VIN/车型" prefix-icon="Search" clearable>
                        </el-input>
                    </div>

                    <!-- 车辆列表 -->
                    <div class="flex-1 overflow-y-auto p-2 custom-scroll">
                        <div v-if="filteredVehicles.length === 0"
                            class="flex flex-col items-center justify-center h-40 text-gray-400">
                            <el-icon class="text-3xl mb-2">
                                <DataLine />
                            </el-icon>
                            <span class="text-sm">未找到匹配车辆</span>
                        </div>

                        <div v-for="v in filteredVehicles" :key="v.id" @click="selectVehicle(v)"
                            class="p-3 mb-2 rounded-lg border cursor-pointer transition-all duration-200"
                            :class="activeVehicle?.id === v.id ? 'bg-blue-50 border-blue-300 shadow-sm relative' : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'">

                            <!-- 选中状态指示条 -->
                            <div v-if="activeVehicle?.id === v.id"
                                class="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r"></div>

                            <div class="flex justify-between items-start pl-2">
                                <div>
                                    <div class="font-bold text-gray-800">{{ v.licensePlate }}</div>
                                    <div class="text-xs text-gray-500 mt-1">{{ v.model }}</div>
                                </div>
                                <div class="flex flex-col items-end gap-1">
                                    <el-tag size="small" :type="v.isDriving ? 'primary' : 'info'" effect="light" round>
                                        <span class="status-dot mr-1" :class="v.isDriving ? 'driving' : 'offline'"
                                            style="width: 6px; height: 6px;"></span>
                                        {{ v.isDriving ? '行驶中' : '静止' }}
                                    </el-tag>
                                    <span class="text-[10px] text-gray-400" v-if="v.isOnline">在线</span>
                                    <span class="text-[10px] text-red-400" v-else>离线</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧: 车辆实时控制台 -->
                <div class="flex-1 flex flex-col min-w-0" v-if="activeVehicle">
                    <!-- 顶部车辆信息 Bar -->
                    <div
                        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 shrink-0 flex justify-between items-center">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <el-icon class="text-2xl text-gray-400">
                                    <Van />
                                </el-icon>
                            </div>
                            <div>
                                <div class="flex items-center gap-3">
                                    <h2 class="text-2xl font-bold text-gray-800">{{ activeVehicle.licensePlate }}</h2>
                                    <el-tag :type="activeVehicle.isDriving ? 'primary' : 'info'" effect="dark">
                                        <div class="flex items-center">
                                            <span class="status-dot bg-white mr-1.5"
                                                :style="activeVehicle.isDriving ? 'box-shadow: 0 0 5px white;' : ''"></span>
                                            {{ activeVehicle.isDriving ? '车辆行驶中' : '车辆已静止' }}
                                        </div>
                                    </el-tag>
                                    <el-tag type="success" effect="plain"
                                        v-if="telemetry.networkSignal === '强'">通讯正常</el-tag>
                                </div>
                                <div class="text-sm text-gray-500 mt-1 font-mono flex items-center gap-4">
                                    <span>VIN: {{ activeVehicle.vin }}</span>
                                    <span>设备号: {{ activeVehicle.deviceId }}</span>
                                    <span>更新时间: <span class="text-gray-800 font-medium">{{ lastUpdateTime
                                            }}</span></span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <el-button @click="refreshTelemetry" :loading="isRefreshing"
                                icon="Refresh">手动刷新状态</el-button>
                        </div>
                    </div>

                    <!-- 首屏网格: 定位 & 车机状态 & 硬件状态 -->
                    <div class="grid grid-cols-3 gap-4 mb-4 shrink-0">
                        <!-- 1. 实时定位图 -->
                        <div
                            class="col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-56">
                            <div class="p-3 border-b flex justify-between items-center bg-gray-50/50">
                                <span class="font-bold text-sm text-gray-700">最新定位</span>
                                <el-tag size="small" type="info" effect="plain" class="font-mono">GPS: {{
                                    telemetry.gpsSignal }}</el-tag>
                            </div>
                            <!-- Mock Map -->
                            <div class="flex-1 map-placeholder relative group">
                                <div
                                    class="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                    <el-button type="primary" size="small" plain><el-icon class="mr-1">
                                            <Location />
                                        </el-icon>打开全屏地图</el-button>
                                </div>
                                <!-- Pin -->
                                <div
                                    class="absolute top-1/2 left-1/2 -mt-4 -ml-3 text-red-500 drop-shadow-md cursor-pointer hover:scale-110 transition-transform">
                                    <svg viewBox="0 0 24 24" class="w-8 h-8 fill-current">
                                        <path
                                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div class="p-3 text-xs text-gray-600 bg-white truncate" :title="telemetry.address">
                                <el-icon class="mr-1 text-gray-400">
                                    <Position />
                                </el-icon>
                                {{ telemetry.address }}
                            </div>
                        </div>

                        <!-- 2. 硬件控制大字报 -->
                        <div
                            class="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-56 flex flex-col">
                            <div class="font-bold text-sm text-gray-700 mb-4 flex justify-between">
                                远程指令中枢
                                <span
                                    class="text-xs text-orange-500 font-normal border border-orange-200 bg-orange-50 px-2 py-0.5 rounded">危险操作将记录入库</span>
                            </div>
                            <div class="flex-1 grid grid-cols-3 gap-4">
                                <!-- 车门控制 -->
                                <div class="col-span-1 border rounded-lg p-4 flex flex-col justify-center items-center gap-3 relative overflow-hidden"
                                    :class="telemetry.doorLockStatus ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'">
                                    <div class="absolute top-2 left-2 text-[10px] text-gray-400">车门中控</div>
                                    <div class="text-3xl"
                                        :class="telemetry.doorLockStatus ? 'text-emerald-500' : 'text-red-500'">
                                        <el-icon v-if="telemetry.doorLockStatus">
                                            <Lock />
                                        </el-icon>
                                        <el-icon v-else>
                                            <Unlock />
                                        </el-icon>
                                    </div>
                                    <div class="font-bold text-gray-700 tracking-widest">{{ telemetry.doorLockStatus ?
                                        '已落锁' : '已解锁' }}</div>
                                    <div class="flex gap-2 mt-1 w-full px-2">
                                        <el-button type="success" size="small" class="flex-1 remote-btn"
                                            :disabled="telemetry.doorLockStatus"
                                            @click="sendCommand('LOCK_DOOR')">上锁</el-button>
                                        <el-button type="danger" size="small" class="flex-1 remote-btn"
                                            :disabled="!telemetry.doorLockStatus"
                                            @click="sendCommand('UNLOCK_DOOR')">解锁</el-button>
                                    </div>
                                </div>

                                <!-- 防盗锁控制 -->
                                <div class="col-span-1 border rounded-lg p-4 flex flex-col justify-center items-center gap-3 relative overflow-hidden"
                                    :class="telemetry.immobilizerStatus ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'">
                                    <div class="absolute top-2 left-2 text-[10px] text-gray-400">发动机防盗锁</div>
                                    <div class="text-3xl"
                                        :class="telemetry.immobilizerStatus ? 'text-orange-500' : 'text-gray-400'">
                                        <el-icon>
                                            <Warning />
                                        </el-icon>
                                    </div>
                                    <div class="font-bold text-gray-700 tracking-widest">{{ telemetry.immobilizerStatus
                                        ? '已激活' : '已关闭' }}</div>
                                    <div class="flex gap-2 mt-1 w-full px-2">
                                        <el-button type="warning" size="small" class="flex-1 remote-btn"
                                            :disabled="telemetry.immobilizerStatus"
                                            @click="sendCommand('ENABLE_IMMOBILIZER')">锁车</el-button>
                                        <el-button type="info" size="small" class="flex-1 remote-btn"
                                            :disabled="!telemetry.immobilizerStatus"
                                            @click="sendCommand('DISABLE_IMMOBILIZER')">解除</el-button>
                                    </div>
                                </div>

                                <!-- 寻车与扩展 -->
                                <div class="col-span-1 flex flex-col gap-3">
                                    <el-button type="primary"
                                        class="w-full h-1/2 remote-btn !m-0 rounded-lg shadow-sm"
                                        @click="sendCommand('FIND_VEHICLE')">
                                        <div class="flex flex-col items-center">
                                            <el-icon class="text-lg mb-1">
                                                <Bell />
                                            </el-icon>
                                            <span class="font-bold tracking-wider">远程寻车 (鸣笛/闪灯)</span>
                                        </div>
                                    </el-button>
                                    <div
                                        class="w-full h-1/2 border rounded-lg bg-gray-50 flex items-center justify-between px-4 text-sm">
                                        <span class="text-gray-500">电子钥匙回位</span>
                                        <el-tag size="small" :type="telemetry.eKeyReturned ? 'success' : 'danger'"
                                            effect="dark">{{ telemetry.eKeyReturned ? '在位' : '已拔出' }}</el-tag>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 下半部分 Grid: 信号状态 + 控制历史 -->
                    <div class="flex-1 flex gap-4 min-h-0">

                        <!-- 车辆物理状态矩阵 -->
                        <div class="w-72 shrink-0 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                            <div class="p-4 border-b font-bold text-sm text-gray-700 bg-gray-50/50">终端与车辆状态矩阵</div>
                            <div class="flex-1 overflow-y-auto p-2">
                                <ul class="space-y-1">
                                    <li class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                        <span class="text-xs text-gray-500">车机电源 (T-Box)</span>
                                        <span class="text-sm font-medium"
                                            :class="telemetry.tboxPower ? 'text-green-600' : 'text-red-600'">{{
                                            telemetry.tboxPower ? '主电供电' : '备电工作' }}</span>
                                    </li>
                                    <li class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                        <span class="text-xs text-gray-500">网络信号强度</span>
                                        <span class="text-sm font-medium text-gray-700">{{ telemetry.networkSignal
                                            }}</span>
                                    </li>
                                    <li
                                        class="flex justify-between items-center p-2 hover:bg-gray-50 rounded border-b border-gray-100 pb-3">
                                        <span class="text-xs text-gray-500">小电瓶电压</span>
                                        <span class="text-sm font-mono font-medium"
                                            :class="telemetry.batteryVoltage < 11.5 ? 'text-red-500' : 'text-green-600'">{{
                                            telemetry.batteryVoltage }} V</span>
                                    </li>

                                    <li class="flex justify-between items-center p-2 hover:bg-gray-50 rounded pt-3">
                                        <span class="text-xs text-gray-500">点火与引擎 (ACC)</span>
                                        <el-tag size="small" :type="telemetry.accOn ? 'primary' : 'info'"
                                            effect="plain">
                                            {{ telemetry.accOn ? '已点火 (ON)' : '熄火 (OFF)' }}
                                        </el-tag>
                                    </li>
                                    <li class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                        <span class="text-xs text-gray-500">车门物理状态</span>
                                        <el-tag size="small" :type="telemetry.doorOpen ? 'warning' : 'success'"
                                            effect="plain">
                                            {{ telemetry.doorOpen ? '有车门开启' : '全关闭' }}
                                        </el-tag>
                                    </li>
                                    <li class="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                        <span class="text-xs text-gray-500">车辆灯光</span>
                                        <el-tag size="small" :type="telemetry.lightOn ? 'warning' : 'info'"
                                            effect="plain">
                                            {{ telemetry.lightOn ? '开启' : '关闭' }}
                                        </el-tag>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <!-- 控制记录历史列表 -->
                        <div
                            class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                            <div class="p-4 border-b flex justify-between items-center bg-gray-50/50">
                                <span class="font-bold text-sm text-gray-700">车辆远程控制指令台账</span>
                                <el-button size="small" plain @click="fetchHistory"><el-icon class="mr-1">
                                        <RefreshRight />
                                    </el-icon>刷新日志</el-button>
                            </div>
                            <div class="flex-1 p-0 overflow-hidden">
                                <el-table :data="historyLogs" height="100%" stripe size="small" class="w-full">
                                    <el-table-column prop="time" label="下发时间" width="150">
                                        <template #default="{ row }">
                                            <span class="font-mono text-xs text-gray-600">{{ row.time }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
                                    <el-table-column prop="action" label="控制指令" width="130">
                                        <template #default="{ row }">
                                            <span class="font-bold text-xs">{{ getActionName(row.action) }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="plate" label="关联车牌" width="120"></el-table-column>
                                    <el-table-column prop="deviceId" label="执行车机号" width="130"></el-table-column>
                                    <el-table-column prop="status" label="执行结果" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="row.status === 'SUCCESS' ? 'success' : 'danger'"
                                                effect="dark">
                                                {{ row.status === 'SUCCESS' ? '成功' : '失败' }}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="note" label="备注说明" min-width="180">
                                        <template #default="{ row }">
                                            <span
                                                :class="row.status === 'FAIL' ? 'text-red-500 text-xs' : 'text-gray-500 text-xs'">
                                                {{ row.note || '-' }}
                                            </span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 空状态: 未选择车辆 -->
                <div v-else
                    class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <el-icon class="mb-4 text-[120px] opacity-50"><Van /></el-icon>
                    <h3 class="text-xl font-bold text-gray-500 mb-2">未选择监控车辆</h3>
                    <p class="text-sm">请在左侧检索栏中选择一台车辆以开启实时控制与监控面板</p>
                </div>
                </div>

            </main>
</template>

<script>
import { ref, computed, reactive, onMounted } from 'vue';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import dayjs from 'dayjs';

export default {
  name: 'VehicleConsoleView',
  setup() {
                // Mock Org Data
                const orgData = [
                    {
                        value: 'city-tpe',
                        label: '台北管理區',
                        children: [
                            { value: 's-1', label: '台北車站門市' },
                            { value: 's-2', label: '松山機場門市' },
                            { value: 's-3', label: '信義CBD網點' }
                        ]
                    },
                    {
                        value: 'city-khh',
                        label: '高雄管理區',
                        children: [
                            { value: 's-4', label: '左營高鐵站門市' },
                            { value: 's-5', label: '駁二藝術特區中心' }
                        ]
                    }
                ];

                // Mock Vehicles DB
                const allVehicles = ref([
                    { id: 1, stationId: 's-1', licensePlate: 'RAB-1234', model: 'Toyota Corolla Cross Hybrid', vin: 'JTNK1234567890123', deviceId: 'TBX-123456-A1', isDriving: true, isOnline: true },
                    { id: 2, stationId: 's-1', licensePlate: 'RDZ-5566', model: 'Honda CR-V e:HEV', vin: 'MRHRW1840RP012345', deviceId: 'TBX-654321-B2', isDriving: false, isOnline: true },
                    { id: 3, stationId: 's-2', licensePlate: 'TCD-9900', model: 'Toyota Alphard', vin: 'LSGXXXXXXXX111111', deviceId: 'TBX-111111-C3', isDriving: false, isOnline: false },
                    { id: 4, stationId: 's-4', licensePlate: 'REN-8888', model: 'Porsche Macan', vin: 'WP0XXXXXXXX222222', deviceId: 'TBX-222222-D4', isDriving: true, isOnline: true },
                    { id: 5, stationId: 's-5', licensePlate: 'EAB-1234', model: 'Model Y', vin: 'LRWYGCEK8MC333333', deviceId: 'TBX-333333-E5', isDriving: false, isOnline: true }
                ]);

                // Filters
                const filters = reactive({
                    stationId: 's-1', // Default selected
                    keyword: ''
                });

                const filteredVehicles = computed(() => {
                    return allVehicles.value.filter(v => {
                        if (filters.stationId && v.stationId !== filters.stationId) return false;
                        if (filters.keyword &&
                            !v.licensePlate.includes(filters.keyword.toUpperCase()) &&
                            !v.model.includes(filters.keyword) &&
                            !v.vin.includes(filters.keyword.toUpperCase())) {
                            return false;
                        }
                        return true;
                    });
                });

                // Selection & Telemetry State
                const activeVehicle = ref(null);
                const lastUpdateTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'));
                const isRefreshing = ref(false);

                // Mock Telemetry Data
                const telemetry = reactive({
                    doorLockStatus: true,      // true = Locked, false = Unlocked
                    immobilizerStatus: false,  // true = Engine disabled, false = Normal
                    eKeyReturned: true,        // Electronic key present
                    tboxPower: true,           // Main power
                    networkSignal: '极好',
                    gpsSignal: '强 (12卫星)',
                    batteryVoltage: 12.6,
                    accOn: false,
                    doorOpen: false,
                    lightOn: false,
                    address: '台北市信義區市府路45號台北101地下停車場B3'
                });

                const historyLogs = ref([]);

                // Actions
                const selectVehicle = (v) => {
                    activeVehicle.value = v;
                    refreshTelemetry();
                    fetchHistory();
                };

                const refreshTelemetry = () => {
                    if (!activeVehicle.value) return;
                    isRefreshing.value = true;
                    // Simulate API delay
                    setTimeout(() => {
                        lastUpdateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
                        // Randomize some values for demo
                        telemetry.batteryVoltage = (11.8 + Math.random() * 2).toFixed(1);
                        telemetry.networkSignal = ['极好', '良好', '一般', '差'][Math.floor(Math.random() * 4)];

                        if (activeVehicle.value.isDriving) {
                            telemetry.accOn = true;
                            telemetry.doorLockStatus = true;
                            telemetry.address = '台北市大安區建國南路高架橋近信義路下匝道 (以60km/h行駛)';
                        } else {
                            telemetry.accOn = false;
                            telemetry.address = '台北市中山區南京東路三段219號B2層車庫';
                        }

                        isRefreshing.value = false;
                        ElMessage.success({ message: `车机状态已刷新`, duration: 1500 });
                    }, 800);
                };

                const getActionName = (code) => {
                    const map = {
                        'UNLOCK_DOOR': '解锁车门',
                        'LOCK_DOOR': '锁定车门',
                        'ENABLE_IMMOBILIZER': '激活防盗锁 (断油电)',
                        'DISABLE_IMMOBILIZER': '解除防盗锁 (恢复)',
                        'FIND_VEHICLE': '远程寻车 (鸣笛闪灯)'
                    };
                    return map[code] || code;
                };

                const fetchHistory = () => {
                    if (!activeVehicle.value) return;
                    // Mock logs specific to the active car
                    const actions = ['UNLOCK_DOOR', 'LOCK_DOOR', 'FIND_VEHICLE', 'DISABLE_IMMOBILIZER'];
                    const logs = [];
                    for (let i = 0; i < 8; i++) {
                        const isSuccess = Math.random() > 0.15;
                        const action = actions[Math.floor(Math.random() * actions.length)];
                        logs.push({
                            id: i,
                            time: dayjs().subtract(i * Math.floor(Math.random() * 24), 'hour').subtract(Math.floor(Math.random() * 60), 'minute').format('YYYY-MM-DD HH:mm:ss'),
                            operator: Math.random() > 0.5 ? '系统自动处理' : '调度员小周',
                            action: action,
                            plate: activeVehicle.value.licensePlate,
                            deviceId: activeVehicle.value.deviceId,
                            status: isSuccess ? 'SUCCESS' : 'FAIL',
                            note: isSuccess ? '' : (action === 'LOCK_DOOR' ? '指令超时，车机离线或信号弱' : '不满足执行条件，车辆行进中')
                        });
                    }
                    // Sort descending
                    logs.sort((a, b) => dayjs(b.time).valueOf() - dayjs(a.time).valueOf());
                    historyLogs.value = logs;
                };

                const sendCommand = (actionCode) => {
                    ElMessageBox.confirm(
                        `确定要对车辆 ${activeVehicle.value.licensePlate} 执行【${getActionName(actionCode)}】操作吗？`,
                        '安全操作确认',
                        {
                            confirmButtonText: '确定执行',
                            cancelButtonText: '取消',
                            type: actionCode.includes('IMMOBILIZER') ? 'warning' : 'info',
                            confirmButtonClass: actionCode.includes('IMMOBILIZER') ? 'el-button--danger' : 'el-button--primary',
                        }
                    ).then(() => {
                        const loading = ElLoading.service({
                            lock: true,
                            text: '正在通过专用网关下发指令，请等待车机回执...',
                            background: 'rgba(0, 0, 0, 0.7)',
                        });

                        setTimeout(() => {
                            loading.close();
                            // Apply result
                            if (actionCode === 'LOCK_DOOR') telemetry.doorLockStatus = true;
                            if (actionCode === 'UNLOCK_DOOR') {
                                telemetry.doorLockStatus = false;
                                telemetry.immobilizerStatus = false; // Usually unlocking disables immobilizer implicitly or explicitly
                            }
                            if (actionCode === 'ENABLE_IMMOBILIZER') telemetry.immobilizerStatus = true;
                            if (actionCode === 'DISABLE_IMMOBILIZER') telemetry.immobilizerStatus = false;

                            // Log it
                            historyLogs.value.unshift({
                                id: Date.now(),
                                time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                                operator: '当前账号 (SysAdmin)',
                                action: actionCode,
                                plate: activeVehicle.value.licensePlate,
                                deviceId: activeVehicle.value.deviceId,
                                status: 'SUCCESS',
                                note: '手动触发执行成功'
                            });

                            lastUpdateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss');
                            ElMessage.success('指令执行成功！');
                        }, 1500);
                    }).catch(() => {
                        // Cancelled
                    });
                };

                // Init with the first mock car if filtered has any
                onMounted(() => {
                    if (filteredVehicles.value.length > 0) {
                        selectVehicle(filteredVehicles.value[0]);
                    }
                });

                return {
                    orgData,
                    filters,
                    filteredVehicles,
                    activeVehicle, selectVehicle,
                    telemetry, lastUpdateTime, refreshTelemetry, isRefreshing,
                    historyLogs, fetchHistory,
                    sendCommand, getActionName
                };
            
  },
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

        /* Remote control button styles */
        .remote-btn {
            transition: all 0.2s;
        }

        .remote-btn:active {
            transform: scale(0.96);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
        }

        .status-dot.online {
            background-color: #10b981;
            box-shadow: 0 0 4px #10b981;
        }

        .status-dot.offline {
            background-color: #9ca3af;
        }

        .status-dot.driving {
            background-color: #3b82f6;
            box-shadow: 0 0 4px #3b82f6;
        }

        /* Map mock background */
        .map-placeholder {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect x="0" y="0" width="100" height="100" fill="%23e2e8f0"/><path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="%23cbd5e1" stroke-width="2"/><path d="M50,0 L50,100" fill="none" stroke="%23cbd5e1" stroke-width="2"/></svg>');
            background-size: cover;
            background-position: center;
        }
</style>
