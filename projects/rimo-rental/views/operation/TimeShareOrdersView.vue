<template>
<div class="time-share-orders-page">
            
            

            <main>
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">分时租赁订单</h1>
                        <p class="text-gray-500 text-sm mt-1">管理所有分时租赁订单，支持同站租还和甲租乙还的状态跟踪与查询。</p>
                    </div>
                    <el-dropdown split-button type="primary" size="large" class="primary-split shadow-md shadow-theme-primary/20" @click="handleNewOrder(activeTab)" @command="handleNewOrder">
                        <span class="flex items-center">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新建订单
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="same_station">新建同站租还订单</el-dropdown-item>
                                <el-dropdown-item command="cross_station">新建甲租乙还订单</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-4 flex-1">
                            <el-input v-model="filters.keyword" placeholder="订单号 / 客户 / 企业名 / 车牌号" prefix-icon="Search"
                                clearable style="width: 280px"></el-input>

                            <el-select v-model="filters.clientType" placeholder="客户类型" clearable style="width: 120px">
                                <el-option label="全部客户" value=""></el-option>
                                <el-option label="个人客户" value="personal"></el-option>
                                <el-option label="企业客户" value="corporate"></el-option>
                            </el-select>

                            <el-select v-model="filters.status" placeholder="订单状态" clearable style="width: 140px">
                                <el-option label="全部状态" value=""></el-option>
                                <el-option-group label="待处理">
                                    <el-option label="【全部待处理】" value="group_todo"
                                        class="font-bold text-blue-600 bg-blue-50"></el-option>
                                    <el-option label="待支付" value="pending_payment"></el-option>
                                    <el-option label="已预订" value="reserved"></el-option>
                                </el-option-group>
                                <el-option-group label="进行中">
                                    <el-option label="【全部进行中】" value="group_active"
                                        class="font-bold text-green-600 bg-green-50"></el-option>
                                    <el-option label="验车中" value="inspecting"></el-option>
                                    <el-option label="用车中" value="renting"></el-option>
                                    <el-option label="续租中" value="renewing"></el-option>
                                </el-option-group>
                                <el-option-group label="异常/风险">
                                    <el-option label="【全部异常】" value="group_risk"
                                        class="font-bold text-red-600 bg-red-50"></el-option>
                                    <el-option label="逾期未还" value="overdue"></el-option>
                                    <el-option label="待结算" value="settlement_pending"></el-option>
                                    <el-option label="待补缴" value="payment_due"></el-option>
                                    <el-option label="维修中" value="repairing"></el-option>
                                </el-option-group>
                                <el-option-group label="已结束">
                                    <el-option label="【全部已结束】" value="group_history"
                                        class="font-bold text-gray-600 bg-gray-50"></el-option>
                                    <el-option label="待退款" value="refund_pending"></el-option>
                                    <el-option label="已完成" value="completed"></el-option>
                                    <el-option label="已取消" value="cancelled"></el-option>
                                    <el-option label="已拒绝" value="rejected"></el-option>
                                </el-option-group>
                            </el-select>

                            <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至"
                                start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" format="YYYY/MM/DD"
                                value-format="YYYY-MM-DD"></el-date-picker>

                            
                            <el-popover placement="bottom-start" :width="280" trigger="click">
                                <template #reference>
                                    <div class="inline-block" style="cursor: pointer;">
                                        <el-select 
                                            :model-value="(filters.pickupStore || filters.returnStore) ? '已筛选' : ''"
                                            placeholder="取还门店" style="width: 130px; pointer-events: none;" readonly>
                                        </el-select>
                                    </div>
                                </template>
                                <div class="p-3">
                                    <div class="mb-3">
                                        <div class="text-xs text-gray-500 mb-1.5 font-medium">取车门店</div>
                                        <el-select v-model="filters.pickupStore" placeholder="不限" clearable
                                            class="w-full">
                                            <el-option v-for="store in stores" :key="store" :label="store"
                                                :value="store"></el-option>
                                        </el-select>
                                    </div>
                                    <div>
                                        <div class="text-xs text-gray-500 mb-1.5 font-medium">还车门店</div>
                                        <el-select v-model="filters.returnStore" placeholder="不限" clearable
                                            class="w-full">
                                            <el-option v-for="store in stores" :key="store" :label="store"
                                                :value="store"></el-option>
                                        </el-select>
                                    </div>
                                </div>
                            </el-popover>
                            <el-select v-model="filters.vehicleGroup" placeholder="车型/车组" clearable filterable
                                style="width: 160px">
                                <el-option label="全部车辆" value=""></el-option>
                                <template v-for="item in vehicleTree" :key="item.group">
                                    <el-option :label="'【' + item.group + '】'" :value="'group:' + item.group"
                                        class="font-bold"></el-option>
                                    <el-option v-for="model in item.models" :key="model" :label="'    ' + model"
                                        :value="'model:' + model"></el-option>
                                </template>
                            </el-select>
                        </div>
                        <div>
                            <el-button icon="Refresh" circle @click="resetFilters"></el-button>
                            <el-button type="primary" plain icon="Download">导出</el-button>
                        </div>
                    </div>
                </div>

                
                <div class="mb-0">
                    <el-tabs v-model="activeTab" class="business-tabs">
                        <el-tab-pane name="same_station">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Shop></Shop>
                                    </el-icon>
                                    <span>同站租还</span>
                                    <el-tag size="small" type="info" round effect="plain">{{ storeOrderCount }}</el-tag>
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="cross_station">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Van></Van>
                                    </el-icon>
                                    <span>甲租乙还</span>
                                    <el-tag size="small" type="info" round effect="plain">{{ selfServiceOrderCount
                                        }}</el-tag>
                                </span>
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                </div>


                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <el-table :data="paginatedOrders" style="width: 100%" stripe
                        :header-cell-style="{ background: '#f9fafb', color: '#4b5563', fontWeight: '600' }">
                        <el-table-column label="订单信息" min-width="180">
                            <template #default="scope">
                                <div class="flex flex-col">
                                    <router-link :to="{ path: '/operation/order-detail', query: { id: scope.row.orderId } }"
                                        class="text-theme-primary font-bold hover:underline mb-1 font-mono">
                                        {{ scope.row.orderId }}
                                    </router-link>
                                    <div class="text-xs text-gray-400">{{ scope.row.createTime }}</div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="客户" min-width="180">
                            <template #default="scope">
                                <div class="flex items-center gap-2">
                                    <div class="font-medium text-gray-800">{{ scope.row.customer.name }}</div>
                                    <el-tag v-if="scope.row.clientType === 'corporate'" size="small" color="#F3E5F5"
                                        style="color: #7B1FA2; border-color: #E1BEE7;" effect="light">
                                        {{ scope.row.corporate?.shortName }}
                                    </el-tag>
                                </div>
                                <div class="text-xs text-gray-500 mt-0.5">
                                    {{ scope.row.customer.phone }}
                                </div>
                                <el-tag v-if="scope.row.customer.level" size="small" effect="plain"
                                    class="mt-1 scale-90 origin-left">{{ scope.row.customer.level }}</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="预订车辆" min-width="180">
                            <template #default="scope">
                                <div class="font-medium text-gray-800">{{ scope.row.vehicle.model }}</div>
                                <div class="text-xs text-gray-500">{{ scope.row.vehicle.group }}</div>
                                <el-tag v-if="scope.row.vehicle.plate" size="small" type="info" effect="plain"
                                    class="mt-1 font-mono">{{ scope.row.vehicle.plate }}</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column min-width="200">
                            <template #header>
                                <div class="flex items-center cursor-pointer group">
                                    <span>行程时间</span>
                                    <el-dropdown trigger="click" @command="handleSortCommand">
                                        <span 
                                            class="el-dropdown-link ml-1 p-1 rounded hover:bg-gray-200 transition-colors"
                                            title="点击排序">
                                            <el-icon>
                                                <Sort></Sort>
                                            </el-icon>
                                        </span>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item command="start_asc">取车时间 正序 ↑</el-dropdown-item>
                                                <el-dropdown-item command="start_desc">取车时间 倒序 ↓</el-dropdown-item>
                                                <el-dropdown-item divided command="end_asc">还车时间 正序 ↑</el-dropdown-item>
                                                <el-dropdown-item command="end_desc">还车时间 倒序 ↓</el-dropdown-item>
                                                <el-dropdown-item divided command="default">默认排序</el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                </div>
                            </template>
                            <template #default="scope">
                                <div class="text-sm">
                                    <div class="flex items-center gap-1 mb-1">
                                        <span class="text-gray-400 w-8 text-xs">取车</span>
                                        <span class="font-medium text-gray-700">{{ scope.row.schedule.start }}</span>
                                        <el-tag v-if="scope.row.schedule.start?.includes('2024-05-06')" size="small"
                                            type="success" effect="plain"
                                            class="scale-90 origin-left ml-0.5">今日</el-tag>
                                    </div>
                                    <div class="flex items-center gap-1">
                                        <span class="text-gray-400 w-8 text-xs">还车</span>
                                        <span class="font-medium"
                                            :class="{'text-red-500 font-bold': scope.row.status === 'overdue', 'text-gray-700': scope.row.status !== 'overdue'}">
                                            {{ scope.row.schedule.end }}
                                        </span>
                                        <el-tag v-if="scope.row.schedule.end?.includes('2024-05-06')" size="small"
                                            type="warning" effect="plain"
                                            class="scale-90 origin-left ml-0.5">今日</el-tag>
                                        <el-icon v-if="scope.row.status === 'overdue'" class="text-red-500 ml-1">
                                            <Warning></Warning>
                                        </el-icon>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="取还门店" min-width="160">
                            <template #default="scope">
                                <div class="text-sm">
                                    
                                    <div v-if="scope.row.location.pickup !== scope.row.location.return"
                                        class="flex flex-col gap-1">
                                        <div class="flex items-center gap-1">
                                            <el-tag size="small" type="warning" effect="dark"
                                                class="scale-90 origin-left w-12 text-center">取车</el-tag>
                                            <span class="text-yellow-700 font-bold text-xs">{{ scope.row.location.pickup
                                                }}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <el-tag size="small" type="warning" effect="dark"
                                                class="scale-90 origin-left w-12 text-center">还车</el-tag>
                                            <span class="text-yellow-700 font-bold text-xs">{{ scope.row.location.return
                                                }}</span>
                                        </div>
                                    </div>
                                    
                                    <div v-else>
                                        <div class="flex items-center gap-1 mb-1">
                                            <el-tag size="small" type="info" effect="plain"
                                                class="scale-90 origin-left w-12 text-center">取车</el-tag>
                                            <span class="text-gray-700 text-xs">{{ scope.row.location.pickup }}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <el-tag size="small" type="info" effect="plain"
                                                class="scale-90 origin-left w-12 text-center">还车</el-tag>
                                            <span class="text-gray-700 text-xs">{{ scope.row.location.return }}</span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="金额" min-width="120" align="right">
                            <template #default="scope">
                                <div class="font-bold text-gray-800 font-mono">¥{{ scope.row.amount.toLocaleString() }}
                                </div>
                                <div class="text-xs text-gray-400"
                                    v-if="scope.row.status === 'completed' && !scope.row.pendingPostCharges">已结清</div>
                                
                                <div v-if="scope.row.pendingPostCharges"
                                    class="flex items-center gap-1 mt-1 justify-end">
                                    <el-tag type="warning" size="small" effect="plain" class="scale-90">
                                        <el-icon class="mr-0.5">
                                            <WarningFilled></WarningFilled>
                                        </el-icon>
                                        追缴 ¥{{ scope.row.postChargeAmount?.toLocaleString() }}
                                    </el-tag>
                                </div>
                                <div class="text-xs text-orange-400"
                                    v-else-if="scope.row.status === 'reserved' || scope.row.status === 'pending_payment'">
                                    待支付
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" min-width="100" align="center">
                            <template #default="{ row }">
                                <el-tag :type="getStatusConfig(row.status).type"
                                    :color="getStatusConfig(row.status).color"
                                    :style="getStatusConfig(row.status).color ? { color: '#fff', borderColor: getStatusConfig(row.status).color } : {}"
                                    effect="light" round>
                                    {{ getStatusConfig(row.status).text }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" min-width="150" fixed="right">
                            <template #default="scope">
                                <div class="flex items-center gap-2">
                                    <el-button type="primary" link size="small"
                                        @click="viewOrder(scope.row.orderId)">详情</el-button>

                                    <el-button v-if="scope.row.status === 'reserved'" type="primary" size="small" plain
                                        @click="quickAction(scope.row)">取车</el-button>
                                    <el-button v-if="scope.row.status === 'renting'" type="success" size="small" plain
                                        @click="quickAction(scope.row)">还车</el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>

                    
                    <div class="p-4 border-t border-gray-100 flex justify-end">
                        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                            :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                            :total="filteredOrders.length" @size-change="handleSizeChange"
                            @current-change="handleCurrentChange" ></el-pagination>
                    </div>
                </div>
            </main>
        </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter } from 'vue-router';

const router = useRouter();
// Mock Data
                const orders = reactive([
                    {
                        orderId: "ZT2405060001", createTime: "2024-05-06 09:15", status: "pending_payment",
                        clientType: "personal",
                        customer: { name: "张伟", phone: "0912-345-001", level: "新用户" },
                        vehicle: { group: "经济型", model: "Toyota Vios", plate: "未分配" },
                        schedule: { start: "2024-05-07 10:00", end: "2024-05-08 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 1200
                    },
                    {
                        orderId: "ZT2405060002", createTime: "2024-05-05 14:30", status: "reserved",
                        clientType: "corporate",
                        customer: { name: "王小明", phone: "0912-345-678", level: "金牌会员", dept: "销售部" },
                        corporate: { id: "CORP_001", name: "Google Taiwan", shortName: "Google" },
                        vehicle: { group: "SUV组", model: "Toyota RAV4", plate: "RIMO-888" },
                        schedule: { start: "2024-05-07 09:30", end: "2024-05-10 18:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 1920
                    },
                    // 2. 履行中
                    {
                        orderId: "ZT2405060003", createTime: "2024-05-06 08:50", status: "inspecting",
                        clientType: "corporate",
                        customer: { name: "李小花", phone: "0922-333-444", level: "普通会员", dept: "研发部" },
                        corporate: { id: "CORP_002", name: "TSMC 台积电", shortName: "TSMC" },
                        vehicle: { group: "豪华车组", model: "BMW 3 Series", plate: "RIMO-123" },
                        schedule: { start: "2024-05-06 09:00", end: "2024-05-08 09:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 4500
                    },
                    {
                        orderId: "ZT2405040003", createTime: "2024-05-04 14:20", status: "renting",
                        customer: { name: "李阿美", phone: "0922-123-456", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Toyota Corolla", plate: "RIMO-101" },
                        schedule: { start: "2024-05-04 15:00", end: "2024-05-07 10:00" },
                        location: { pickup: "台北车站店", return: "新北总店" }, amount: 850
                    },
                    {
                        orderId: "ZT2405020008", createTime: "2024-05-02 10:00", status: "renewing",
                        customer: { name: "赵强", phone: "0933-111-222", level: "白金会员" },
                        vehicle: { group: "商务车组", model: "Honda Odyssey", plate: "RIMO-777" },
                        schedule: { start: "2024-05-02 11:00", end: "2024-05-09 11:00" }, // Extended
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 5600
                    },
                    // 3. 异常与风险
                    {
                        orderId: "ZT2404280005", createTime: "2024-04-28 09:00", status: "overdue",
                        customer: { name: "孙悟空", phone: "0987-654-321", level: "黑名单预警" },
                        vehicle: { group: "性能组", model: "Tesla Model 3", plate: "RIMO-911" },
                        schedule: { start: "2024-04-28 10:00", end: "2024-05-05 10:00" }, // Today is 05-06
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 8000
                    },

                    // 4. 结算与支付
                    {
                        orderId: "ZT2405050012", createTime: "2024-05-05 08:00", status: "settlement_pending",
                        customer: { name: "吴杰克", phone: "0955-666-777", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Honda Fit", plate: "RIMO-202" },
                        schedule: { start: "2024-05-05 09:00", end: "2024-05-06 09:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 1500
                    },
                    {
                        orderId: "ZT2405010022", createTime: "2024-05-01 10:30", status: "payment_due",
                        customer: { name: "郑钱", phone: "0966-123-123", level: "普通会员" },
                        vehicle: { group: "豪华车组", model: "Benz C300", plate: "RIMO-300" },
                        schedule: { start: "2024-05-01 14:00", end: "2024-05-04 14:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 4800
                    },
                    {
                        orderId: "ZT2405020018", createTime: "2024-05-02 11:15", status: "refund_pending",
                        customer: { name: "冯宝宝", phone: "0977-444-555", level: "金牌会员" },
                        vehicle: { group: "SUV组", model: "Nissan X-Trail", plate: "RIMO-404" },
                        schedule: { start: "2024-05-02 12:00", end: "2024-05-04 12:00" }, // Early return
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 2800
                    },
                    // 5. 终态
                    {
                        orderId: "ZT2404300001", createTime: "2024-04-30 09:00", status: "completed",
                        customer: { name: "陈大文", phone: "0933-987-654", level: "白金会员" },
                        vehicle: { group: "商务车组", model: "Honda Odyssey", plate: "RIMO-999" },
                        schedule: { start: "2024-04-30 10:00", end: "2024-05-02 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 3200
                    },
                    // 已完成但有追缴费用 (违章罚款待处理)
                    {
                        orderId: "ZT2404250018", createTime: "2024-04-25 10:00", status: "completed",
                        customer: { name: "黄志明", phone: "0912-888-666", level: "金牌会员" },
                        vehicle: { group: "SUV组", model: "Toyota RAV4", plate: "RIMO-666" },
                        schedule: { start: "2024-04-25 11:00", end: "2024-04-28 11:00" },
                        location: { pickup: "新北总店", return: "台北车站店" }, amount: 2800,
                        // 追缴费用标记
                        pendingPostCharges: 2,  // 2笔待处理追缴费用
                        postChargeAmount: 1885  // 追缴总金额
                    },
                    {
                        orderId: "ZT2405010005", createTime: "2024-05-01 08:30", status: "cancelled",
                        customer: { name: "林小佳", phone: "0955-555-123", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Honda Fit", plate: "" },
                        schedule: { start: "2024-05-02 10:00", end: "2024-05-03 10:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 0
                    },
                    {
                        orderId: "ZT2405060099", createTime: "2024-05-06 13:00", status: "rejected",
                        customer: { name: "黑煞", phone: "0900-000-000", level: "黑名单" },
                        vehicle: { group: "豪华车组", model: "Porsche Macan", plate: "" },
                        schedule: { start: "2024-05-07 10:00", end: "2024-05-08 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 0
                    }
                ]);

                // Tab state
                const activeTab = ref('same_station');

                // Order counts by cross station logic
                const storeOrderCount = computed(() => orders.filter(o => o.location.pickup === o.location.return).length);
                const selfServiceOrderCount = computed(() => orders.filter(o => o.location.pickup !== o.location.return).length);

                // Handle new order based on business line
                const handleNewOrder = (command) => {
                    const type = command || activeTab.value;
                    router.push(`/operation/new-order?type=${type}`);
                };

                // Filters
                const filters = reactive({
                    keyword: '',
                    clientType: '', // Added clientType filter
                    status: '',
                    dateRange: [],
                    pickupStore: '',
                    returnStore: '',
                    vehicleGroup: ''
                });

                // Status Configuration
                const statusMap = {
                    // Pre-Rental
                    pending_payment: { text: "待支付", type: "info", color: "" },
                    reserved: { text: "已预订", type: "primary", color: "" },
                    // Fulfillment
                    inspecting: { text: "验车中", type: "warning", color: "" },
                    renting: { text: "用车中", type: "success", color: "" },
                    renewing: { text: "续租中", type: "success", color: "" },
                    overdue: { text: "逾期未还", type: "danger", color: "" },

                    // Settlement
                    settlement_pending: { text: "待结算", type: "warning", color: "#8E44AD" }, // Purple
                    payment_due: { text: "待补缴", type: "warning", color: "#E67E22" },      // Orange
                    refund_pending: { text: "待退款", type: "warning", color: "#E67E22" },   // Orange
                    // Final
                    completed: { text: "已完成", type: "info", color: "" },
                    cancelled: { text: "已取消", type: "info", color: "" },
                    rejected: { text: "已拒绝", type: "danger", color: "" }
                };

                // Pagination
                const currentPage = ref(1);
                const pageSize = ref(20); // Increased page size to see more mock data

                // Computed
                // Extract vehicle hierarchy for filter options
                const vehicleTree = computed(() => {
                    const tree = {};
                    orders.forEach(o => {
                        const g = o.vehicle.group;
                        const m = o.vehicle.model;
                        if (!tree[g]) tree[g] = new Set();
                        tree[g].add(m);
                    });
                    const result = [];
                    Object.keys(tree).sort().forEach(g => {
                        result.push({
                            group: g,
                            models: Array.from(tree[g]).sort()
                        });
                    });
                    return result;
                });

                // Filter search inside the dropdown
                const vehicleSearch = ref('');

                const filteredVehicleTree = computed(() => {
                    if (!vehicleSearch.value) return vehicleTree.value;
                    const query = vehicleSearch.value.toLowerCase();

                    return vehicleTree.value.map(item => {
                        const groupMatch = item.group.toLowerCase().includes(query);
                        const matchingModels = item.models.filter(m => m.toLowerCase().includes(query));

                        if (groupMatch || matchingModels.length > 0) {

                        }
                        return null;
                    }).filter(Boolean);
                });

                // Extract stores dynamically
                const stores = computed(() => {
                    const s = new Set();
                    orders.forEach(o => {
                        if (o.location && o.location.pickup) s.add(o.location.pickup);
                        if (o.location && o.location.return) s.add(o.location.return);
                    });
                    // Ensure default stores are present even if not in current mock data (optional, but good practice)
                    s.add("新北总店");
                    s.add("台北车站店");
                    return Array.from(s).sort();
                });

                const filteredOrders = computed(() => {
                    return orders.filter(order => {
                        const matchKeyword = !filters.keyword ||
                            order.orderId.includes(filters.keyword) ||
                            order.customer.name.includes(filters.keyword) ||
                            order.customer.phone.includes(filters.keyword) ||
                            (order.corporate && order.corporate.name.includes(filters.keyword)) || // Support corporate name search
                            (order.vehicle.plate && order.vehicle.plate.toUpperCase().includes(filters.keyword.toUpperCase()));

                        // Client Type Filter
                        const matchClientType = !filters.clientType ||
                            (filters.clientType === 'corporate' ? order.clientType === 'corporate' : order.clientType !== 'corporate');

                        // Status Filter Logic (Supports individual status and group keys)
                        let matchStatus = true;
                        if (filters.status) {
                            if (filters.status === 'group_todo') {
                                matchStatus = ['pending_payment', 'reserved'].includes(order.status);
                            } else if (filters.status === 'group_active') {
                                matchStatus = ['inspecting', 'renting', 'renewing'].includes(order.status);
                            } else if (filters.status === 'group_active') {
                                matchStatus = ['inspecting', 'renting', 'renewing'].includes(order.status);
                            } else if (filters.status === 'group_risk') {
                                matchStatus = ['overdue', 'settlement_pending', 'payment_due'].includes(order.status);
                            } else if (filters.status === 'group_history') {
                                matchStatus = ['refund_pending', 'completed', 'cancelled', 'rejected'].includes(order.status);
                            } else {
                                // Exact match for single status
                                matchStatus = order.status === filters.status;
                            }
                        }

                        const matchPickupStore = !filters.pickupStore || order.location.pickup === filters.pickupStore;
                        const matchReturnStore = !filters.returnStore || order.location.return === filters.returnStore;

                        // Vehicle Filter Logic (Group or Model)
                        let matchVehicle = true;
                        if (filters.vehicleGroup) {
                            // Check if format is type:value
                            if (filters.vehicleGroup.includes(':')) {
                                const [type, val] = filters.vehicleGroup.split(':');
                                if (type === 'group') {
                                    matchVehicle = order.vehicle.group === val;
                                } else if (type === 'model') {
                                    matchVehicle = order.vehicle.model === val;
                                }
                            } else {
                                // Fallback/Legacy
                                matchVehicle = order.vehicle.group === filters.vehicleGroup;
                            }
                        }

                        return matchKeyword && matchStatus && matchPickupStore && matchReturnStore && matchVehicle && matchClientType;
                    });
                });

                const sortState = reactive({
                    field: '', // 'start' or 'end'
                    order: ''  // 'asc' or 'desc'
                });

                const sortedOrders = computed(() => {
                    let data = [...filteredOrders.value];

                    if (sortState.field && sortState.order) {
                        data.sort((a, b) => {
                            const valA = sortState.field === 'start' ? a.schedule.start : a.schedule.end;
                            const valB = sortState.field === 'start' ? b.schedule.start : b.schedule.end;

                            // Date string sort works for "YYYY-MM-DD HH:mm"
                            if (valA === valB) return 0;
                            const compare = valA > valB ? 1 : -1;
                            return sortState.order === 'asc' ? compare : -compare;
                        });
                    }
                    return data;
                });

                const paginatedOrders = computed(() => {
                    const start = (currentPage.value - 1) * pageSize.value;
                    const end = start + pageSize.value;
                    return sortedOrders.value.slice(start, end);
                });

                // Helpers
                const getStatusConfig = (status) => {
                    return statusMap[status] || { text: status, type: 'info', color: '' };
                };

                const handleSortCommand = (command) => {
                    if (command === 'default') {
                        sortState.field = '';
                        sortState.order = '';
                        return;
                    }
                    // command format: field_order (e.g. start_asc)
                    const [field, order] = command.split('_');
                    sortState.field = field;
                    sortState.order = order;
                };

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.status = '';
                    filters.dateRange = [];
                    filters.pickupStore = '';
                    filters.returnStore = '';
                    filters.vehicleGroup = '';
                    sortState.field = '';
                    sortState.order = '';
                };

                const handleSizeChange = (val) => { pageSize.value = val; };
                const handleCurrentChange = (val) => { currentPage.value = val; };

                const viewOrder = (id) => {
                    router.push(`/operation/order-detail?id=${id}`);
                };

                const goToNewOrder = () => {
                    router.push('/operation/new-order');
                }

                const quickAction = (row) => {
                    if (row.status === 'reserved') {
                        // In real app, open dispatch modal
                        router.push(`/operation/order-detail?id=${row.orderId}&action=dispatch`);
                    } else if (row.status === 'renting') {
                        router.push(`/operation/order-detail?id=${row.orderId}&action=return`);
                    }
                };
</script>

<style scoped>
        .time-share-orders-page {
            min-height: 100%;
        }

        .time-share-orders-page :deep(.el-table .warning-row) {
            --el-table-tr-bg-color: var(--el-color-warning-light-9);
        }

        .time-share-orders-page :deep(.el-table .success-row) {
            --el-table-tr-bg-color: var(--el-color-success-light-9);
        }

        .business-tabs :deep(.el-tabs__item) {
            color: #6b7280;
        }

        .business-tabs :deep(.el-tabs__item.is-active),
        .business-tabs :deep(.el-tabs__item:hover) {
            color: var(--app-color-primary);
        }

        .business-tabs :deep(.el-tabs__active-bar) {
            background-color: var(--app-color-primary);
        }

        .primary-split :deep(.el-button) {
            --el-button-bg-color: var(--app-color-primary);
            --el-button-border-color: var(--app-color-primary);
            --el-button-text-color: #fff;
            --el-button-hover-bg-color: var(--app-color-primary-hover);
            --el-button-hover-border-color: var(--app-color-primary-hover);
            --el-button-hover-text-color: #fff;
            --el-button-active-bg-color: #004f78;
            --el-button-active-border-color: #004f78;
            background-color: var(--app-color-primary) !important;
            border-color: var(--app-color-primary) !important;
            color: #fff !important;
        }

        .primary-split :deep(.el-button:hover),
        .primary-split :deep(.el-button:focus) {
            background-color: var(--app-color-primary-hover) !important;
            border-color: var(--app-color-primary-hover) !important;
            color: #fff !important;
        }
</style>
