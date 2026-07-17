<template>
<div class="store-orders-page">
            
            

            <main>
                
                <PageHeader unstyled class="flex justify-between items-end mb-6" title="门市租赁订单" description="管理所有门市租赁订单，支持快速取还车、订单查询及状态跟踪。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                    <template #actions><el-dropdown split-button type="primary" size="large" class="primary-split shadow-md shadow-theme-primary/20" @click="handleNewOrder(activeTab)" @command="handleNewOrder">
                        <span class="flex items-center">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新建订单
                        </span>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="store">新建门市租赁订单</el-dropdown-item>
                                <el-dropdown-item command="self_service">新建24h自助租车订单</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown></template>
                </PageHeader>

                
                <div class="bg-white rounded-xl border border-gray-200 p-3 mb-4">
                    <div class="flex items-center justify-between gap-4 mb-3">
                        <div class="text-sm font-semibold text-gray-700">统计视角</div>
                        <div class="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1">
                            <button 
                                class="px-3 py-1.5 text-sm rounded-md transition-colors"
                                :class="statsView === 'overview' ? 'bg-white text-theme-primary shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'"
                                @click="switchStatsView('overview')">
                                运营总览
                            </button>
                            <button 
                                class="px-3 py-1.5 text-sm rounded-md transition-colors"
                                :class="statsView === 'task' ? 'bg-white text-theme-primary shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'"
                                @click="switchStatsView('task')">
                                今日作业
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
                        <button v-for="item in currentStats" :key="item.key"
                            class="text-left rounded-lg border px-3 py-2 transition-colors"
                            :class="activeStatFilter === item.key || (!activeStatFilter && statsView === 'overview' && item.key === 'all') ? 'border-theme-primary bg-sky-50' : 'border-gray-100 hover:border-theme-primary hover:bg-sky-50'"
                            @click="applyStatFilter(item.key)">
                            <div class="text-xs text-gray-500">{{ item.label }}</div>
                            <div class="mt-1 text-xl font-bold font-mono" :class="item.color">{{ item.count }}</div>
                        </button>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                    <div class="flex flex-wrap items-center gap-4">
                            <el-input v-model="filters.keyword" placeholder="订单号 / 客户 / 企业名 / 车牌号" prefix-icon="Search"
                                clearable style="width: 280px"></el-input>

                            <el-select v-model="filters.clientType" placeholder="客户类型" clearable style="width: 120px">
                                <el-option label="全部客户" value=""></el-option>
                                <el-option label="个人客户" value="personal"></el-option>
                                <el-option label="企业客户" value="corporate"></el-option>
                            </el-select>

                            <el-select v-model="filters.billingMode" placeholder="结算方式" clearable style="width: 130px">
                                <el-option label="全部结算" value=""></el-option>
                                <el-option label="客户自付" value="customer_pay"></el-option>
                                <el-option label="企业月结" value="monthly"></el-option>
                            </el-select>

                            <el-select v-model="filters.status" placeholder="订单状态" multiple collapse-tags
                                collapse-tags-tooltip clearable style="width: 180px">
                                <el-option-group label="待处理">
                                    <el-option label="【全部待处理】" value="group_todo"
                                        class="font-bold text-blue-600 bg-blue-50"></el-option>
                                    <el-option label="待支付" value="pending_payment"></el-option>
                                    <el-option label="已预订" value="reserved"></el-option>
                                    <el-option label="逾期未取" value="pickup_overdue"></el-option>
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
                                    <el-option label="出险处理中" value="accident_processing"></el-option>
                                </el-option-group>
                                <el-option-group label="结算处理">
                                    <el-option label="【全部结算】" value="group_settlement"
                                        class="font-bold text-orange-600 bg-orange-50"></el-option>
                                    <el-option label="待结算" value="settlement_pending"></el-option>
                                    <el-option label="待补缴" value="payment_due"></el-option>
                                    <el-option label="待退款" value="refund_pending"></el-option>
                                </el-option-group>
                                <el-option-group label="已结束">
                                    <el-option label="【全部已结束】" value="group_history"
                                        class="font-bold text-gray-600 bg-gray-50"></el-option>
                                    <el-option label="已完成" value="completed"></el-option>
                                    <el-option label="已取消" value="cancelled"></el-option>
                                    <el-option label="爽约" value="no_show"></el-option>
                                    <el-option label="已拒绝" value="rejected"></el-option>
                                    <el-option label="已关闭" value="closed"></el-option>
                                </el-option-group>
                            </el-select>

                            <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="至"
                                start-placeholder="开始日期" end-placeholder="结束日期" style="width: 260px" format="YYYY/MM/DD"
                                value-format="YYYY-MM-DD"></el-date-picker>

                            <el-button type="primary" icon="Filter" plain @click="searchPanelExpanded = !searchPanelExpanded">
                                {{ searchPanelExpanded ? '收起筛选' : '更多筛选' }}
                            </el-button>
                            <el-button icon="Refresh" circle @click="resetFilters"></el-button>
                            <el-button type="primary" plain icon="Download">导出</el-button>
                    </div>

                    <div v-show="searchPanelExpanded" class="pt-4 mt-4 border-t border-gray-100">
                        <div class="flex flex-wrap items-center gap-4">
                            <el-select v-model="filters.postChargeStatus" placeholder="追缴状态" clearable style="width: 140px">
                                <el-option label="全部追缴" value=""></el-option>
                                <el-option label="存在追缴" value="any"></el-option>
                                <el-option label="追缴待通知" value="pending_notify"></el-option>
                                <el-option label="追缴已通知" value="notified"></el-option>
                                <el-option label="追缴待支付" value="payment_due"></el-option>
                                <el-option label="企业月结追缴" value="monthly_billing"></el-option>
                                <el-option label="追缴已结清" value="paid"></el-option>
                            </el-select>

                            <el-select v-model="filters.riskFlag" placeholder="风险标记" clearable style="width: 130px">
                                <el-option label="全部风险" value=""></el-option>
                                <el-option label="黑名单" value="blacklist"></el-option>
                                <el-option label="证件异常" value="license_issue"></el-option>
                                <el-option label="人工调度" value="dispatch_manual_required"></el-option>
                                <el-option label="需联系客户" value="pickup_overdue_contact"></el-option>
                                <el-option label="事故上报" value="accident"></el-option>
                                <el-option label="违章待处理" value="violation_pending"></el-option>
                            </el-select>

                            
                            <el-popover placement="bottom-start" :width="280" trigger="click">
                                <template #reference>
                                    <div class="inline-block" style="cursor: pointer;">
                                        <el-select 
                                            :model-value="(filters.pickupStore || filters.returnStore) ? '已筛选' : ''"
                                            placeholder="取还站点" style="width: 130px; pointer-events: none;" readonly>
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
                    </div>
                </div>

                
                <div class="mb-0">
                    <el-tabs v-model="activeTab" class="business-tabs">
                        <el-tab-pane name="store">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Shop></Shop>
                                    </el-icon>
                                    <span>门市租车</span>
                                    <el-tag size="small" type="info" round effect="plain">{{ storeOrderCount }}</el-tag>
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="self_service">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Timer></Timer>
                                    </el-icon>
                                    <span>24h自助租车</span>
                                    <el-tag size="small" type="info" round effect="plain">{{ selfServiceOrderCount
                                        }}</el-tag>
                                </span>
                            </template>
                        </el-tab-pane>
                    </el-tabs>
                </div>


                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <el-table :data="paginatedOrders" style="width: 100%" stripe :row-class-name="getRowClassName"
                        :header-cell-style="{ background: '#f9fafb', color: '#4b5563', fontWeight: '600' }">
                        <el-table-column label="订单信息" min-width="180">
                            <template #default="scope">
                                <div class="flex flex-col">
                                    <a :href="buildOrderDetailUrl(scope.row)"
                                        class="text-theme-primary font-bold hover:underline mb-1 font-mono">
                                        {{ scope.row.orderId }}
                                    </a>
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
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <el-tag v-if="scope.row.customer.level" size="small" effect="plain"
                                        class="scale-90 origin-left">{{ scope.row.customer.level }}</el-tag>
                                    <el-tag v-for="flag in getCustomerRiskFlags(scope.row)" :key="flag" size="small"
                                        :type="getRiskFlagConfig(flag).type" :color="getRiskFlagConfig(flag).color"
                                        :style="getRiskFlagConfig(flag).color ? { color: '#fff', borderColor: getRiskFlagConfig(flag).color } : {}"
                                        effect="light" class="scale-90 origin-left">
                                        {{ getRiskFlagConfig(flag).text }}
                                    </el-tag>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="预订车辆" min-width="180">
                            <template #default="scope">
                                <div class="font-medium text-gray-800">{{ scope.row.vehicle.group }}</div>
                                <div v-if="hasAssignedVehicle(scope.row)"
                                    class="text-xs text-gray-600 mt-0.5 flex items-center gap-1">
                                    <span>{{ scope.row.vehicle.model }}</span>
                                    <el-tooltip v-if="shouldShowDispatchIcon(scope.row)" placement="top"
                                        :content="getDispatchStatusConfig(scope.row.dispatchStatus).text">
                                        <el-icon class="text-sm" :class="getDispatchIconClass(scope.row.dispatchStatus)">
                                            <component :is="getDispatchIcon(scope.row.dispatchStatus)"></component>
                                        </el-icon>
                                    </el-tooltip>
                                </div>
                                <div v-if="hasAssignedVehicle(scope.row)"
                                    class="text-xs text-gray-500 font-mono mt-0.5">
                                    {{ scope.row.vehicle.plate }}
                                </div>
                                <div v-else class="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                    <el-icon class="text-gray-400">
                                        <Clock></Clock>
                                    </el-icon>
                                    <span>待派车</span>
                                    <el-tooltip v-if="needsManualDispatch(scope.row)" content="人工调度" placement="top">
                                        <el-icon class="text-orange-500">
                                            <WarningFilled></WarningFilled>
                                        </el-icon>
                                    </el-tooltip>
                                </div>
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
                                        <span class="font-medium"
                                            :class="{'text-orange-500 font-bold': scope.row.status === 'pickup_overdue', 'text-gray-700': scope.row.status !== 'pickup_overdue'}">
                                            {{ scope.row.schedule.start }}
                                        </span>
                                        <el-tag v-if="scope.row.schedule.start?.includes('2024-05-06')" size="small"
                                            type="success" effect="plain"
                                            class="scale-90 origin-left ml-0.5">今日</el-tag>
                                        <el-icon v-if="scope.row.status === 'pickup_overdue'"
                                            class="text-orange-500 ml-1">
                                            <WarningFilled></WarningFilled>
                                        </el-icon>
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

                        <el-table-column label="取还站点" min-width="190">
                            <template #default="scope">
                                <div class="text-sm">
                                    
                                    <div v-if="scope.row.location.pickup !== scope.row.location.return"
                                        class="flex flex-col gap-1">
                                        <div class="flex items-center gap-1">
                                            <el-tag size="small" type="warning" effect="dark"
                                                class="scale-90 origin-left w-12 text-center">取车</el-tag>
                                            <span class="text-yellow-700 font-bold text-xs">{{ getLocationWithStation(scope.row, 'pickup')
                                                }}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <el-tag size="small" type="warning" effect="dark"
                                                class="scale-90 origin-left w-12 text-center">还车</el-tag>
                                            <span class="text-yellow-700 font-bold text-xs">{{ getLocationWithStation(scope.row, 'return')
                                                }}</span>
                                        </div>
                                    </div>
                                    
                                    <div v-else>
                                        <div class="flex items-center gap-1 mb-1">
                                            <el-tag size="small" type="info" effect="plain"
                                                class="scale-90 origin-left w-12 text-center">取车</el-tag>
                                            <span class="text-gray-700 text-xs">{{ getLocationWithStation(scope.row, 'pickup') }}</span>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <el-tag size="small" type="info" effect="plain"
                                                class="scale-90 origin-left w-12 text-center">还车</el-tag>
                                            <span class="text-gray-700 text-xs">{{ getLocationWithStation(scope.row, 'return') }}</span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="金额" min-width="120" align="right">
                            <template #default="scope">
                                <div class="font-bold text-gray-800 font-mono">¥{{ scope.row.amount.toLocaleString() }}
                                </div>
                                <div class="flex flex-col items-end gap-1 mt-1">
                                    <el-tag v-if="shouldShowPaymentStatus(scope.row)" size="small"
                                        :type="getPaymentStatusConfig(scope.row.paymentStatus).type"
                                        :color="getPaymentStatusConfig(scope.row.paymentStatus).color"
                                        :style="getPaymentStatusConfig(scope.row.paymentStatus).color ? { color: '#fff', borderColor: getPaymentStatusConfig(scope.row.paymentStatus).color } : {}"
                                        effect="plain" class="scale-90 origin-right">
                                        {{ getPaymentStatusConfig(scope.row.paymentStatus).text }}
                                    </el-tag>
                                    <el-tag v-if="shouldShowPostChargeStatus(scope.row)" size="small"
                                        :type="getPostChargeConfig(scope.row.postCharge.status).type"
                                        :color="getPostChargeConfig(scope.row.postCharge.status).color"
                                        :style="getPostChargeConfig(scope.row.postCharge.status).color ? { color: '#fff', borderColor: getPostChargeConfig(scope.row.postCharge.status).color } : {}"
                                        effect="plain" class="scale-90 origin-right">
                                        <el-icon class="mr-0.5">
                                            <WarningFilled></WarningFilled>
                                        </el-icon>
                                        {{ getPostChargeConfig(scope.row.postCharge.status).text }} ¥{{
                                        scope.row.postCharge.amount?.toLocaleString() }}
                                    </el-tag>
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

                        <el-table-column label="操作" min-width="260" fixed="right">
                            <template #default="scope">
                                <div class="flex items-center flex-wrap gap-2">
                                    <el-button type="primary" link size="small"
                                        @click="viewOrder(scope.row)">详情</el-button>

                                    <el-button v-if="['reserved', 'pickup_overdue', 'inspecting'].includes(scope.row.status)"
                                        type="primary" size="small" plain @click="quickAction(scope.row)">
                                        {{ scope.row.status === 'inspecting' ? '继续取车' : '取车' }}
                                    </el-button>
                                    <el-button v-if="['pending_payment', 'reserved', 'pickup_overdue'].includes(scope.row.status)"
                                        type="danger" size="small" plain @click="openOrderAction(scope.row, 'cancel')">取消</el-button>
                                    <el-button v-if="scope.row.status === 'pickup_overdue'"
                                        type="danger" size="small" plain @click="openOrderAction(scope.row, 'no_show')">标记爽约</el-button>
                                    <el-button v-if="['renting', 'renewing'].includes(scope.row.status)"
                                        type="primary" size="small" plain @click="openExtendAction(scope.row)">延长</el-button>
                                    <el-button v-if="scope.row.status === 'overdue'"
                                        type="danger" size="small" plain @click="openExtendAction(scope.row)">补办续租</el-button>
                                    <el-button v-if="scope.row.status === 'accident_processing'"
                                        type="danger" size="small" plain @click="openOrderAction(scope.row, 'accident')">处理事故</el-button>
                                    <el-button v-if="['renting', 'renewing', 'overdue', 'accident_processing'].includes(scope.row.status)"
                                        type="success" size="small" plain @click="quickAction(scope.row)">还车</el-button>
                                    <el-button v-if="scope.row.status === 'settlement_pending'"
                                        type="warning" size="small" plain @click="quickAction(scope.row)">
                                        {{ scope.row.billingMode === 'monthly' ? '确认月结' : '继续结算' }}
                                    </el-button>
                                    <el-button v-if="scope.row.status === 'pending_payment'" type="warning" size="small" plain
                                        @click="openFeeAction(scope.row, 'pay')">支付</el-button>
                                    <el-button v-if="scope.row.status === 'payment_due' && scope.row.billingMode !== 'monthly'" type="warning" size="small" plain
                                        @click="quickAction(scope.row)">收款</el-button>
                                    <el-button v-if="scope.row.status === 'refund_pending' && scope.row.billingMode !== 'monthly'" type="warning" size="small" plain
                                        @click="quickAction(scope.row)">退款</el-button>
                                    <el-button v-if="['completed', 'cancelled', 'no_show', 'rejected', 'closed'].includes(scope.row.status) && scope.row.postCharge?.status === 'pending_notify' && !isMonthlyBillingOrder(scope.row)"
                                        type="warning" size="small" plain @click="openFeeAction(scope.row, 'notify')">
                                        通知客户
                                    </el-button>
                                    <el-button v-if="['completed', 'cancelled', 'no_show', 'rejected', 'closed'].includes(scope.row.status) && ['notified', 'payment_due'].includes(scope.row.postCharge?.status) && !isMonthlyBillingOrder(scope.row)"
                                        type="warning" size="small" plain @click="openFeeAction(scope.row, 'collect')">
                                        追缴收款
                                    </el-button>
                                    <el-button v-if="['completed', 'cancelled', 'no_show', 'rejected', 'closed'].includes(scope.row.status) && scope.row.postCharge && isMonthlyBillingOrder(scope.row)"
                                        type="primary" size="small" plain @click="openFeeAction(scope.row, 'fees')">
                                        查看费用
                                    </el-button>
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
import { PageHeader } from '@/components/ui';

const router = useRouter();
// Mock Data
                const orders = reactive([
                    {
                        orderId: "ZT2405060001", createTime: "2024-05-06 09:15", status: "pending_payment",
                        clientType: "personal",
                        customer: { name: "张伟", phone: "0912-345-001", level: "新用户" },
                        vehicle: { group: "经济型", model: "Toyota Vios", plate: "未分配" },
                        schedule: { start: "2024-05-07 10:00", end: "2024-05-08 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 1200,
                        dispatchStatus: "pending", paymentStatus: "unpaid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405060015", createTime: "2024-05-06 09:45", status: "pending_payment",
                        clientType: "corporate",
                        billingMode: "customer_pay",
                        customer: { name: "刘承恩", phone: "0988-456-210", level: "企业员工", dept: "市场部" },
                        corporate: { id: "CORP_002", name: "TSMC 台积电", shortName: "TSMC", billingType: "员工自付" },
                        vehicle: { group: "经济车组", model: "Toyota Yaris", plate: "未分配" },
                        schedule: { start: "2024-05-07 13:00", end: "2024-05-08 13:00" },
                        location: { pickup: "新北总店", return: "台北车站店" }, amount: 1380,
                        dispatchStatus: "pending", paymentStatus: "unpaid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405060002", createTime: "2024-05-05 14:30", status: "reserved",
                        clientType: "corporate",
                        customer: { name: "王小明", phone: "0912-345-678", level: "金牌会员", dept: "销售部" },
                        corporate: { id: "CORP_001", name: "Google Taiwan", shortName: "Google" },
                        vehicle: { group: "SUV组", model: "Toyota RAV4", plate: "RIMO-888" },
                        schedule: { start: "2024-05-07 09:30", end: "2024-05-10 18:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 1920,
                        dispatchStatus: "locked", paymentStatus: "deposit_paid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405060028", createTime: "2024-05-05 15:20", status: "reserved",
                        clientType: "personal",
                        customer: { name: "周庭安", phone: "0920-118-520", level: "金牌会员" },
                        vehicle: { group: "SUV组", model: "Honda CR-V", plate: "RIMO-620", currentStation: "新北总店 - 停车场A" },
                        schedule: { start: "2024-05-08 10:00", end: "2024-05-10 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 2600,
                        dispatchStatus: "pre_assigned", paymentStatus: "deposit_paid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405060010", createTime: "2024-05-05 16:10", status: "reserved",
                        businessLine: "self_service",
                        serviceMode: "self_service",
                        clientType: "personal",
                        customer: { name: "林佳琪", phone: "0968-222-555", level: "金牌会员" },
                        vehicle: { group: "经济车组", model: "Toyota Yaris", plate: "未分配" },
                        schedule: { start: "2024-05-07 11:00", end: "2024-05-09 11:00" },
                        location: {
                            pickup: "新北总店",
                            pickupStation: "新北总店 P3 自助据点",
                            return: "新北总店",
                            returnStation: "新北总店 P3 自助据点",
                            returnStationId: "banqiao_p3"
                        },
                        locationStatus: { pickupStore: "normal", pickupStation: "normal", returnStore: "closed", returnStation: "closed" },
                        amount: 3200,
                        dispatchStatus: "pending", paymentStatus: "deposit_paid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405060004", createTime: "2024-05-06 07:40", status: "pickup_overdue",
                        customer: { name: "周怡君", phone: "0911-222-333", level: "银牌会员" },
                        vehicle: { group: "经济型", model: "Toyota Vios", plate: "RIMO-118" },
                        schedule: { start: "2024-05-06 08:30", end: "2024-05-08 08:30" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 1680,
                        dispatchStatus: "locked", paymentStatus: "deposit_paid", riskFlags: ["pickup_overdue_contact"]
                    },
                    // 2. 履行中
                    {
                        orderId: "ZT2405060003", createTime: "2024-05-06 08:50", status: "inspecting",
                        clientType: "corporate",
                        customer: { name: "李小花", phone: "0922-333-444", level: "普通会员", dept: "研发部" },
                        corporate: { id: "CORP_002", name: "TSMC 台积电", shortName: "TSMC" },
                        vehicle: { group: "豪华车组", model: "BMW 3 Series", plate: "RIMO-123" },
                        schedule: { start: "2024-05-06 09:00", end: "2024-05-08 09:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 4500,
                        dispatchStatus: "locked", paymentStatus: "partial_paid", riskFlags: ["license_issue"]
                    },
                    {
                        orderId: "ZT2405040003", createTime: "2024-05-04 14:20", status: "renting",
                        customer: { name: "李阿美", phone: "0922-123-456", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Toyota Corolla", plate: "RIMO-101" },
                        schedule: { start: "2024-05-04 15:00", end: "2024-05-07 10:00" },
                        location: { pickup: "台北车站店", return: "新北总店" }, amount: 850,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405060011", createTime: "2024-05-04 16:40", status: "renting",
                        clientType: "corporate",
                        billingMode: "monthly",
                        customer: { name: "陈怡安", phone: "0977-222-909", level: "企业员工", dept: "采购部" },
                        corporate: { id: "CORP_003", name: "Acer 宏碁", shortName: "Acer", billingType: "monthly" },
                        vehicle: { group: "SUV组", model: "Toyota RAV4", plate: "RIMO-721" },
                        schedule: { start: "2024-05-04 17:00", end: "2024-05-07 17:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 4200,
                        dispatchStatus: "locked", paymentStatus: "monthly_billing", riskFlags: []
                    },
                    {
                        orderId: "ZT2405040016", createTime: "2024-05-04 09:10", status: "renting",
                        businessLine: "self_service",
                        serviceMode: "self_service",
                        clientType: "personal",
                        customer: { name: "陈柏翰", phone: "0910-668-225", level: "白金会员" },
                        vehicle: { group: "SUV组", model: "Toyota RAV4", plate: "RIMO-515" },
                        schedule: { start: "2024-05-04 10:00", end: "2024-05-06 20:00" },
                        location: {
                            pickup: "新北总店",
                            pickupStation: "新北总店 P3 自助据点",
                            return: "台北车站店",
                            returnStation: "台北车站店 B2 自助还车点",
                            returnStationId: "taipei_b2"
                        },
                        locationStatus: { pickupStore: "normal", pickupStation: "normal", returnStore: "normal", returnStation: "normal" },
                        amount: 2480,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405020008", createTime: "2024-05-02 10:00", status: "renewing",
                        customer: { name: "赵强", phone: "0933-111-222", level: "白金会员" },
                        vehicle: { group: "商务车组", model: "Honda Odyssey", plate: "RIMO-777" },
                        schedule: { start: "2024-05-02 11:00", end: "2024-05-09 11:00" }, // Extended
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 5600,
                        dispatchStatus: "manual_reassigned", paymentStatus: "paid", riskFlags: []
                    },
                    // 3. 异常与风险
                    {
                        orderId: "ZT2404280005", createTime: "2024-04-28 09:00", status: "overdue",
                        customer: { name: "孙悟空", phone: "0987-654-321", level: "黑名单预警" },
                        vehicle: { group: "性能组", model: "Tesla Model 3", plate: "RIMO-911" },
                        schedule: { start: "2024-04-28 10:00", end: "2024-05-05 10:00" }, // Today is 05-06
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 8000,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: ["blacklist"]
                    },
                    {
                        orderId: "ZT2405030031", createTime: "2024-05-03 16:20", status: "accident_processing",
                        customer: { name: "高志豪", phone: "0988-222-111", level: "金牌会员" },
                        vehicle: { group: "SUV组", model: "Honda CR-V", plate: "RIMO-520" },
                        schedule: { start: "2024-05-03 18:00", end: "2024-05-07 18:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 3600,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: ["accident"]
                    },
                    {
                        orderId: "ZT2405050066", createTime: "2024-05-05 09:45", status: "no_show",
                        customer: { name: "许家豪", phone: "0922-777-888", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Honda Fit", plate: "未分配" },
                        schedule: { start: "2024-05-05 14:00", end: "2024-05-06 14:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 600,
                        dispatchStatus: "pending", paymentStatus: "deposit_paid", riskFlags: ["pickup_overdue_contact"]
                    },

                    // 4. 结算与支付
                    {
                        orderId: "ZT2405050012", createTime: "2024-05-05 08:00", status: "settlement_pending",
                        customer: { name: "吴杰克", phone: "0955-666-777", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Honda Fit", plate: "RIMO-202" },
                        schedule: { start: "2024-05-05 09:00", end: "2024-05-06 09:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 1500,
                        dispatchStatus: "locked", paymentStatus: "partial_paid", riskFlags: []
                    },
                    {
                        orderId: "ZT2405050013", createTime: "2024-05-05 09:20", status: "settlement_pending",
                        clientType: "corporate",
                        billingMode: "monthly",
                        customer: { name: "张育诚", phone: "0966-888-321", level: "企业员工", dept: "行政部" },
                        corporate: { id: "CORP_003", name: "Acer 宏碁", shortName: "Acer", billingType: "monthly" },
                        vehicle: { group: "商务车组", model: "Honda Odyssey", plate: "RIMO-771" },
                        schedule: { start: "2024-05-05 10:00", end: "2024-05-06 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 3650,
                        dispatchStatus: "locked", paymentStatus: "monthly_billing", riskFlags: []
                    },
                    {
                        orderId: "ZT2405010022", createTime: "2024-05-01 10:30", status: "payment_due",
                        customer: { name: "郑钱", phone: "0966-123-123", level: "普通会员" },
                        vehicle: { group: "豪华车组", model: "Benz C300", plate: "RIMO-300" },
                        schedule: { start: "2024-05-01 14:00", end: "2024-05-04 14:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 4800,
                        dispatchStatus: "locked", paymentStatus: "payment_due", riskFlags: []
                    },
                    {
                        orderId: "ZT2405020018", createTime: "2024-05-02 11:15", status: "refund_pending",
                        customer: { name: "冯宝宝", phone: "0977-444-555", level: "金牌会员" },
                        vehicle: { group: "SUV组", model: "Nissan X-Trail", plate: "RIMO-404" },
                        schedule: { start: "2024-05-02 12:00", end: "2024-05-04 12:00" }, // Early return
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 2800,
                        dispatchStatus: "locked", paymentStatus: "refund_pending", riskFlags: []
                    },
                    // 5. 终态
                    {
                        orderId: "ZT2404300001", createTime: "2024-04-30 09:00", status: "completed",
                        customer: { name: "陈大文", phone: "0933-987-654", level: "白金会员" },
                        vehicle: { group: "商务车组", model: "Honda Odyssey", plate: "RIMO-999" },
                        schedule: { start: "2024-04-30 10:00", end: "2024-05-02 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 3200,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: []
                    },
                    // 已完成但有追缴费用 (违章罚款待处理)
                    {
                        orderId: "ZT2404250018", createTime: "2024-04-25 10:00", status: "completed",
                        customer: { name: "黄志明", phone: "0912-888-666", level: "金牌会员" },
                        vehicle: { group: "SUV组", model: "Toyota RAV4", plate: "RIMO-666" },
                        schedule: { start: "2024-04-25 11:00", end: "2024-04-28 11:00" },
                        location: { pickup: "新北总店", return: "台北车站店" }, amount: 2800,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: ["violation_pending"],
                        postCharge: { count: 2, amount: 1885, status: "pending_notify" }
                    },
                    {
                        orderId: "ZT2404240021", createTime: "2024-04-24 15:40", status: "completed",
                        customer: { name: "蔡佩芸", phone: "0939-220-168", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Toyota Vios", plate: "RIMO-216" },
                        schedule: { start: "2024-04-24 16:00", end: "2024-04-26 16:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 1800,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: ["violation_pending"],
                        postCharge: { count: 1, amount: 680, status: "payment_due" }
                    },
                    {
                        orderId: "ZT2404240033", createTime: "2024-04-24 17:20", status: "completed",
                        customer: { name: "何欣怡", phone: "0918-330-220", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Honda Fit", plate: "RIMO-218" },
                        schedule: { start: "2024-04-24 18:00", end: "2024-04-25 18:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 1600,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: ["violation_pending"],
                        postCharge: { count: 1, amount: 420, status: "notified" }
                    },
                    {
                        orderId: "ZT2404230009", createTime: "2024-04-23 12:10", status: "completed",
                        customer: { name: "郭俊宏", phone: "0921-909-777", level: "金牌会员" },
                        vehicle: { group: "SUV组", model: "Honda CR-V", plate: "RIMO-620" },
                        schedule: { start: "2024-04-23 13:00", end: "2024-04-24 13:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 2300,
                        dispatchStatus: "locked", paymentStatus: "paid", riskFlags: [],
                        postCharge: { count: 1, amount: 360, status: "paid" }
                    },
                    {
                        orderId: "ZT2404300011", createTime: "2024-04-30 13:30", status: "completed",
                        clientType: "corporate",
                        billingMode: "monthly",
                        customer: { name: "林佳琪", phone: "0968-222-555", level: "企业员工", dept: "行政部" },
                        corporate: { id: "CORP_003", name: "Acer 宏碁", shortName: "Acer", billingType: "monthly" },
                        vehicle: { group: "经济车组", model: "Toyota Yaris", plate: "RIMO-118" },
                        schedule: { start: "2024-04-30 14:00", end: "2024-05-02 14:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 3200,
                        dispatchStatus: "locked", paymentStatus: "monthly_billing", riskFlags: ["violation_pending"],
                        postCharge: { count: 1, amount: 980, status: "monthly_billing" }
                    },
                    {
                        orderId: "ZT2405010005", createTime: "2024-05-01 08:30", status: "cancelled",
                        customer: { name: "林小佳", phone: "0955-555-123", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Honda Fit", plate: "" },
                        schedule: { start: "2024-05-02 10:00", end: "2024-05-03 10:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 0,
                        dispatchStatus: "pending", paymentStatus: "refunded", riskFlags: []
                    },
                    {
                        orderId: "ZT2405010012", createTime: "2024-05-01 10:20", status: "cancelled",
                        customer: { name: "苏明杰", phone: "0936-551-208", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Toyota Vios", plate: "" },
                        schedule: { start: "2024-05-03 09:00", end: "2024-05-05 09:00" },
                        location: { pickup: "台北车站店", return: "台北车站店" }, amount: 0,
                        dispatchStatus: "pending", paymentStatus: "refunded", riskFlags: ["violation_pending"],
                        postCharge: { count: 1, amount: 300, status: "pending_notify" }
                    },
                    {
                        orderId: "ZT2405060099", createTime: "2024-05-06 13:00", status: "rejected",
                        customer: { name: "黑煞", phone: "0900-000-000", level: "黑名单" },
                        vehicle: { group: "豪华车组", model: "Porsche Macan", plate: "" },
                        schedule: { start: "2024-05-07 10:00", end: "2024-05-08 10:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 0,
                        dispatchStatus: "pending", paymentStatus: "unpaid", riskFlags: ["blacklist"]
                    },
                    {
                        orderId: "ZT2405050072", createTime: "2024-05-05 17:30", status: "no_show",
                        customer: { name: "洪若庭", phone: "0916-661-909", level: "普通会员" },
                        vehicle: { group: "经济型", model: "Toyota Yaris", plate: "未分配" },
                        schedule: { start: "2024-05-05 13:00", end: "2024-05-07 13:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 900,
                        dispatchStatus: "pending", paymentStatus: "deposit_paid", riskFlags: [],
                        postCharge: { count: 1, amount: 200, status: "payment_due" }
                    },
                    {
                        orderId: "ZT2405060108", createTime: "2024-05-06 15:20", status: "closed",
                        customer: { name: "赖先生", phone: "0919-000-888", level: "白金会员" },
                        vehicle: { group: "商务车组", model: "Honda Odyssey", plate: "RIMO-313" },
                        schedule: { start: "2024-05-06 16:00", end: "2024-05-09 16:00" },
                        location: { pickup: "新北总店", return: "新北总店" }, amount: 0,
                        dispatchStatus: "manual_reassigned", paymentStatus: "refunded", riskFlags: []
                    }
                ]);

                // Tab state
                const activeTab = ref('store');

                // Order counts by business line
                const storeOrderCount = computed(() => orders.filter(o => (o.businessLine || 'store') === 'store').length);
                const selfServiceOrderCount = computed(() => orders.filter(o => o.businessLine === 'self_service').length);

                // Handle new order based on business line
                const handleNewOrder = (command) => {
                    const type = command || activeTab.value;
                    router.push(`/operation/new-order?type=${type}`);
                };

                // Filters
                const filters = reactive({
                    keyword: '',
                    clientType: '', // Added clientType filter
                    billingMode: '',
                    status: [],
                    postChargeStatus: '',
                    riskFlag: '',
                    dateRange: [],
                    pickupStore: '',
                    returnStore: '',
                    vehicleGroup: ''
                });
                const statsView = ref('task');
                const activeStatFilter = ref('');
                const mockToday = '2024-05-06';
                const mockNow = new Date('2024-05-06T09:00:00');

                // Status Configuration
                const statusMap = {
                    // Pre-Rental
                    pending_payment: { text: "待支付", type: "info", color: "" },
                    reserved: { text: "已预订", type: "primary", color: "" },
                    pickup_overdue: { text: "逾期未取", type: "warning", color: "#E67E22" },
                    // Fulfillment
                    inspecting: { text: "验车中", type: "warning", color: "" },
                    renting: { text: "用车中", type: "success", color: "" },
                    renewing: { text: "续租中", type: "success", color: "" },
                    overdue: { text: "逾期未还", type: "danger", color: "" },
                    accident_processing: { text: "出险处理中", type: "danger", color: "" },
                    no_show: { text: "爽约", type: "info", color: "" },

                    // Settlement
                    settlement_pending: { text: "待结算", type: "warning", color: "#8E44AD" }, // Purple
                    payment_due: { text: "待补缴", type: "warning", color: "#E67E22" },      // Orange
                    refund_pending: { text: "待退款", type: "warning", color: "#E67E22" },   // Orange
                    // Final
                    completed: { text: "已完成", type: "info", color: "" },
                    cancelled: { text: "已取消", type: "info", color: "" },
                    rejected: { text: "已拒绝", type: "danger", color: "" },
                    closed: { text: "已关闭", type: "danger", color: "#C0392B" }
                };

                const statusGroups = {
                    group_todo: ['pending_payment', 'reserved', 'pickup_overdue'],
                    group_active: ['inspecting', 'renting', 'renewing'],
                    group_risk: ['overdue', 'accident_processing'],
                    group_settlement: ['settlement_pending', 'payment_due', 'refund_pending'],
                    group_history: ['completed', 'cancelled', 'no_show', 'rejected', 'closed']
                };

                const dispatchStatusMap = {
                    pending: { text: "待派车", type: "warning", color: "" },
                    pre_assigned: { text: "已预分配", type: "primary", color: "" },
                    locked: { text: "已硬锁定", type: "success", color: "" },
                    manual_reassigned: { text: "人工改派", type: "warning", color: "#E67E22" },
                    upgraded: { text: "免费升等", type: "success", color: "#16A34A" }
                };

                const paymentStatusMap = {
                    unpaid: { text: "未支付", type: "warning", color: "" },
                    deposit_paid: { text: "已收预授权", type: "primary", color: "" },
                    monthly_billing: { text: "企业月结", type: "primary", color: "#7B1FA2" },
                    partial_paid: { text: "部分支付", type: "warning", color: "#E67E22" },
                    paid: { text: "已结清", type: "success", color: "" },
                    payment_due: { text: "待补缴", type: "danger", color: "" },
                    refund_pending: { text: "待退款", type: "warning", color: "#E67E22" },
                    refunded: { text: "已退款", type: "info", color: "" }
                };

                const postChargeStatusMap = {
                    pending_notify: { text: "追缴待通知", type: "warning", color: "" },
                    notified: { text: "追缴已通知", type: "warning", color: "" },
                    payment_due: { text: "追缴待支付", type: "danger", color: "" },
                    monthly_billing: { text: "企业月结追缴", type: "primary", color: "#7B1FA2" },
                    paid: { text: "追缴已结清", type: "success", color: "" }
                };

                const riskFlagMap = {
                    blacklist: { text: "黑名单", type: "danger", color: "" },
                    license_issue: { text: "证件异常", type: "warning", color: "" },
                    dispatch_manual_required: { text: "人工调度", type: "danger", color: "#DC2626" },
                    pickup_overdue_contact: { text: "需联系客户", type: "warning", color: "#E67E22" },
                    accident: { text: "事故上报", type: "danger", color: "" },
                    violation_pending: { text: "违章待处理", type: "warning", color: "#E67E22" }
                };

                // Pagination
                const searchPanelExpanded = ref(false);
                const currentPage = ref(1);
                const pageSize = ref(50); // Show all mock status samples by default.

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

                const pickupFocusStatuses = ['pending_payment', 'reserved', 'pickup_overdue'];
                const returnFocusStatuses = ['renting', 'renewing', 'overdue'];
                const settlementFocusStatuses = ['settlement_pending', 'payment_due', 'refund_pending'];

                const toDateTime = (value) => value ? new Date(value.replace(' ', 'T')) : null;
                const isToday = (value) => !!value && value.startsWith(mockToday);
                const isWithinNextHours = (value, hours) => {
                    const time = toDateTime(value);
                    if (!time) return false;
                    const diff = time.getTime() - mockNow.getTime();
                    return diff >= 0 && diff <= hours * 60 * 60 * 1000;
                };
                const isPickupToday = (order) => pickupFocusStatuses.includes(order.status) && isToday(order.schedule?.start);
                const isPickupSoon = (order) => pickupFocusStatuses.includes(order.status) && isWithinNextHours(order.schedule?.start, 2);
                const isPickupProcessing = (order) => order.status === 'inspecting';
                const isReturnToday = (order) => returnFocusStatuses.includes(order.status) && isToday(order.schedule?.end);
                const isReturnSoon = (order) => returnFocusStatuses.includes(order.status) && isWithinNextHours(order.schedule?.end, 2);
                const isPickupOverdueTask = (order) => order.status === 'pickup_overdue';
                const isReturnOverdueTask = (order) => order.status === 'overdue';
                const isSettlementTask = (order) => settlementFocusStatuses.includes(order.status);

                const filteredOrders = computed(() => {
                    return orders.filter(order => {
                        const matchBusinessLine = activeTab.value === 'store'
                            ? (order.businessLine || 'store') === 'store'
                            : order.businessLine === activeTab.value;
                        const matchKeyword = !filters.keyword ||
                            order.orderId.includes(filters.keyword) ||
                            order.customer.name.includes(filters.keyword) ||
                            order.customer.phone.includes(filters.keyword) ||
                            (order.corporate && order.corporate.name.includes(filters.keyword)) || // Support corporate name search
                            (order.vehicle.plate && order.vehicle.plate.toUpperCase().includes(filters.keyword.toUpperCase()));

                        // Client Type Filter
                        const matchClientType = !filters.clientType ||
                            (filters.clientType === 'corporate' ? order.clientType === 'corporate' : order.clientType !== 'corporate');
                        const matchBillingMode = !filters.billingMode ||
                            (filters.billingMode === 'monthly' ? isMonthlyBillingOrder(order) : !isMonthlyBillingOrder(order));

                        // Status Filter Logic (Supports multiple individual statuses and group keys)
                        let matchStatus = true;
                        const selectedStatuses = Array.isArray(filters.status)
                            ? filters.status.filter(Boolean)
                            : (filters.status ? [filters.status] : []);
                        if (selectedStatuses.length > 0) {
                            const expandedStatuses = new Set();
                            selectedStatuses.forEach(status => {
                                if (statusGroups[status]) {
                                    statusGroups[status].forEach(item => expandedStatuses.add(item));
                                } else {
                                    expandedStatuses.add(status);
                                }
                            });
                            matchStatus = expandedStatuses.has(order.status);
                        }

                        const matchPickupStore = !filters.pickupStore || order.location.pickup === filters.pickupStore;
                        const matchReturnStore = !filters.returnStore || order.location.return === filters.returnStore;
                        const matchPostCharge = !filters.postChargeStatus ||
                            (filters.postChargeStatus === 'any' ? !!order.postCharge : order.postCharge?.status === filters.postChargeStatus);
                        const matchRiskFlag = !filters.riskFlag || (order.riskFlags || []).includes(filters.riskFlag);
                        const matchStatFilter = !activeStatFilter.value ||
                            (activeStatFilter.value === 'todo' && ['pending_payment', 'reserved', 'pickup_overdue'].includes(order.status)) ||
                            (activeStatFilter.value === 'active' && ['inspecting', 'renting', 'renewing'].includes(order.status)) ||
                            (activeStatFilter.value === 'settlement' && ['settlement_pending', 'payment_due', 'refund_pending'].includes(order.status)) ||
                            (activeStatFilter.value === 'risk' && (['overdue', 'accident_processing'].includes(order.status) || (order.riskFlags || []).length > 0)) ||
                            (activeStatFilter.value === 'monthly' && isMonthlyBillingOrder(order)) ||
                            (activeStatFilter.value === 'post_charge' && !!order.postCharge) ||
                            (activeStatFilter.value === 'due' && (['payment_due', 'refund_pending'].includes(order.status) || ['payment_due', 'pending_notify', 'notified'].includes(order.postCharge?.status))) ||
                            (activeStatFilter.value === 'pickup_today' && isPickupToday(order)) ||
                            (activeStatFilter.value === 'pickup_2h' && isPickupSoon(order)) ||
                            (activeStatFilter.value === 'pickup_processing' && isPickupProcessing(order)) ||
                            (activeStatFilter.value === 'return_today' && isReturnToday(order)) ||
                            (activeStatFilter.value === 'return_2h' && isReturnSoon(order)) ||
                            (activeStatFilter.value === 'pickup_overdue_task' && isPickupOverdueTask(order)) ||
                            (activeStatFilter.value === 'return_overdue_task' && isReturnOverdueTask(order)) ||
                            (activeStatFilter.value === 'settlement_task' && isSettlementTask(order));

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

                        return matchBusinessLine && matchKeyword && matchStatus && matchPickupStore && matchReturnStore &&
                            matchVehicle && matchClientType && matchBillingMode && matchPostCharge && matchRiskFlag && matchStatFilter;
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
                    } else {
                        const taskSortField = ['pickup_today', 'pickup_2h', 'pickup_processing', 'pickup_overdue_task'].includes(activeStatFilter.value)
                            ? 'start'
                            : ['return_today', 'return_2h', 'return_overdue_task', 'settlement_task'].includes(activeStatFilter.value)
                                ? 'end'
                                : '';

                        if (taskSortField) {
                            data.sort((a, b) => {
                                const valA = taskSortField === 'start' ? a.schedule.start : a.schedule.end;
                                const valB = taskSortField === 'start' ? b.schedule.start : b.schedule.end;
                                if (valA === valB) return 0;
                                return valA > valB ? 1 : -1;
                            });
                        } else {
                            data.sort((a, b) => {
                                const valA = a.createTime || '';
                                const valB = b.createTime || '';
                                if (valA === valB) return 0;
                                return valA > valB ? -1 : 1;
                            });
                        }
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

                const getDispatchStatusConfig = (status) => {
                    return dispatchStatusMap[status] || { text: status, type: 'info', color: '' };
                };

                const hasAssignedVehicle = (row) => {
                    return !!row?.vehicle?.plate && row.vehicle.plate !== '未分配' && row.dispatchStatus !== 'pending';
                };

                const getDispatchIcon = (status) => {
                    const iconMap = {
                        pre_assigned: 'Clock',
                        locked: 'Lock',
                        manual_reassigned: 'Refresh',
                        upgraded: 'Star'
                    };
                    return iconMap[status] || 'InfoFilled';
                };

                const getDispatchIconClass = (status) => {
                    const classMap = {
                        pre_assigned: 'text-amber-500',
                        locked: 'text-emerald-600',
                        manual_reassigned: 'text-orange-500',
                        upgraded: 'text-indigo-500'
                    };
                    return classMap[status] || 'text-gray-400';
                };

                const shouldShowDispatchIcon = (row) => {
                    return hasAssignedVehicle(row) && ['pre_assigned', 'locked', 'manual_reassigned', 'upgraded'].includes(row.dispatchStatus);
                };

                const needsManualDispatch = (row) => {
                    return !hasAssignedVehicle(row) && (row.riskFlags || []).includes('dispatch_manual_required');
                };

                const getPaymentStatusConfig = (status) => {
                    return paymentStatusMap[status] || { text: status, type: 'info', color: '' };
                };

                const getPostChargeConfig = (status) => {
                    return postChargeStatusMap[status] || { text: status, type: 'warning', color: '' };
                };

                const shouldShowPaymentStatus = (row) => {
                    if (!row.paymentStatus) return false;
                    if (isMonthlyBillingOrder(row)) return true;
                    return !row.postCharge;
                };

                const shouldShowPostChargeStatus = (row) => {
                    return !!row.postCharge && !isMonthlyBillingOrder(row);
                };

                const getRiskFlagConfig = (flag) => {
                    return riskFlagMap[flag] || { text: flag, type: 'info', color: '' };
                };

                const getCustomerRiskFlags = (row) => {
                    return (row.riskFlags || []).filter(flag => ['blacklist', 'license_issue', 'pickup_overdue_contact'].includes(flag));
                };

                const isMonthlyBillingOrder = (row) => {
                    return row.billingMode === 'monthly' || row.paymentStatus === 'monthly_billing';
                };

                const getRowClassName = ({ row }) => {
                    return ['cancelled', 'no_show', 'rejected', 'closed'].includes(row.status)
                        ? 'opacity-60 bg-gray-50'
                        : '';
                };

                const countOrders = (predicate) => orders.filter(order => (order.businessLine || 'store') === activeTab.value && predicate(order)).length;

                const overviewStats = computed(() => ([
                    { key: 'all', label: '全部订单', count: countOrders(() => true), color: 'text-gray-900' },
                    { key: 'todo', label: '待处理', count: countOrders(order => ['pending_payment', 'reserved', 'pickup_overdue'].includes(order.status)), color: 'text-blue-600' },
                    { key: 'active', label: '履约中', count: countOrders(order => ['inspecting', 'renting', 'renewing'].includes(order.status)), color: 'text-green-600' },
                    { key: 'settlement', label: '结算处理', count: countOrders(order => ['settlement_pending', 'payment_due', 'refund_pending'].includes(order.status)), color: 'text-orange-600' },
                    { key: 'risk', label: '异常风险', count: countOrders(order => ['overdue', 'accident_processing'].includes(order.status) || (order.riskFlags || []).length > 0), color: 'text-red-600' },
                    { key: 'monthly', label: '企业月结', count: countOrders(order => isMonthlyBillingOrder(order)), color: 'text-purple-600' },
                    { key: 'post_charge', label: '完成后追缴', count: countOrders(order => !!order.postCharge), color: 'text-amber-600' },
                    { key: 'due', label: '待收/待退', count: countOrders(order => ['payment_due', 'refund_pending'].includes(order.status) || ['payment_due', 'pending_notify', 'notified'].includes(order.postCharge?.status)), color: 'text-rose-600' }
                ]));

                const taskStats = computed(() => ([
                    { key: 'pickup_today', label: '今日待交车', count: countOrders(order => isPickupToday(order)), color: 'text-blue-600' },
                    { key: 'pickup_2h', label: '2小时内交车', count: countOrders(order => isPickupSoon(order)), color: 'text-sky-600' },
                    { key: 'pickup_processing', label: '交车办理中', count: countOrders(order => isPickupProcessing(order)), color: 'text-amber-600' },
                    { key: 'return_today', label: '今日待还车', count: countOrders(order => isReturnToday(order)), color: 'text-emerald-600' },
                    { key: 'return_2h', label: '2小时内还车', count: countOrders(order => isReturnSoon(order)), color: 'text-teal-600' },
                    { key: 'pickup_overdue_task', label: '逾期未取', count: countOrders(order => isPickupOverdueTask(order)), color: 'text-orange-600' },
                    { key: 'return_overdue_task', label: '逾期未还', count: countOrders(order => isReturnOverdueTask(order)), color: 'text-red-600' },
                    { key: 'settlement_task', label: '已还待结算', count: countOrders(order => isSettlementTask(order)), color: 'text-purple-600' }
                ]));

                const currentStats = computed(() => statsView.value === 'task' ? taskStats.value : overviewStats.value);

                const switchStatsView = (view) => {
                    statsView.value = view;
                    activeStatFilter.value = '';
                };

                const applyStatFilter = (key) => {
                    resetFilters();
                    activeStatFilter.value = key === 'all' ? '' : key;
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
                    filters.clientType = '';
                    filters.billingMode = '';
                    filters.status = [];
                    filters.postChargeStatus = '';
                    filters.riskFlag = '';
                    filters.dateRange = [];
                    filters.pickupStore = '';
                    filters.returnStore = '';
                    filters.vehicleGroup = '';
                    activeStatFilter.value = '';
                    sortState.field = '';
                    sortState.order = '';
                    searchPanelExpanded.value = false;
                };

                const handleSizeChange = (val) => { pageSize.value = val; };
                const handleCurrentChange = (val) => { currentPage.value = val; };

                const storeStationSamples = {
                    "新北总店": ["新北总店 B1 交车区", "新北总店 P3 停放区", "新北总店后场整备区"],
                    "台北车站店": ["台北车站店 A 区停车场", "台北车站店 B2 交车区"]
                };
                const isSelfServiceRow = (row) => (row.businessLine === 'self_service') || row.serviceMode === 'self_service';

                const getVehicleCurrentStation = (row) => {
                    if (isSelfServiceRow(row)) {
                        return row.location?.pickupStation || row.location?.pickupStationName || '';
                    }
                    if (!row?.vehicle?.plate || row.vehicle.plate === '未分配' || row.dispatchStatus === 'pending') return '';
                    if (row.vehicle.currentStation) return row.vehicle.currentStation;
                    const stations = storeStationSamples[row.location?.pickup] || [`${row.location?.pickup || '取车门市'} 车辆所在据点`];
                    const seed = Array.from(row.orderId || '').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                    return stations[seed % stations.length];
                };

                const returnedStatuses = ['settlement_pending', 'payment_due', 'refund_pending', 'completed'];

                const getReturnCurrentStation = (row) => {
                    if (isSelfServiceRow(row)) {
                        return row.location?.returnStation || row.location?.returnStationName || '';
                    }
                    if (!returnedStatuses.includes(row.status)) return '';
                    if (row.location?.returnStation) return row.location.returnStation;
                    const stations = storeStationSamples[row.location?.return] || [];
                    if (!stations.length) return '';
                    const seed = Array.from(row.orderId || '').reduce((sum, char) => sum + char.charCodeAt(0), 1);
                    return stations[seed % stations.length];
                };

                const getStationShortName = (stationName, storeName) => {
                    if (!stationName) return '';
                    return stationName.replace(storeName, '').replace(/^[-\s]+/, '').trim() || stationName;
                };

                const getLocationWithStation = (row, type) => {
                    const storeName = row.location?.[type] || '-';
                    const stationName = type === 'pickup' ? getVehicleCurrentStation(row) : getReturnCurrentStation(row);
                    const shortStationName = getStationShortName(stationName, storeName);
                    return shortStationName ? `${storeName} - ${shortStationName}` : storeName;
                };

                const buildOrderDetailUrl = (row, action = '') => {
                    const params = new URLSearchParams({ id: row.orderId });
                    if (action) params.set('action', action);
                    if (row.serviceMode || row.businessLine === 'self_service') params.set('serviceMode', row.serviceMode || row.businessLine);
                    if (row.status) params.set('status', row.status);
                    if (row.paymentStatus) params.set('paymentStatus', row.paymentStatus);
                    if (row.billingMode) params.set('billing', row.billingMode);
                    if (row.clientType) params.set('clientType', row.clientType);
                    if (row.customer?.name) params.set('customerName', row.customer.name);
                    if (row.customer?.phone) params.set('customerPhone', row.customer.phone);
                    if (row.customer?.level) params.set('customerLevel', row.customer.level);
                    if (row.customer?.dept) params.set('department', row.customer.dept);
                    if (row.amount !== undefined) params.set('amount', row.amount);
                    if (row.corporate?.name) params.set('corporateName', row.corporate.name);
                    if (row.corporate?.shortName) params.set('corporateShortName', row.corporate.shortName);
                    if (row.vehicle?.model) params.set('vehicleModel', row.vehicle.model);
                    if (row.vehicle?.group) params.set('vehicleGroup', row.vehicle.group);
                    if (row.vehicle?.plate) params.set('vehiclePlate', row.vehicle.plate);
                    const vehicleStation = getVehicleCurrentStation(row);
                    if (vehicleStation) params.set('vehicleStation', vehicleStation);
                    if (row.dispatchStatus) params.set('dispatchStatusText', getDispatchStatusConfig(row.dispatchStatus).text);
                    if (row.schedule?.start) params.set('scheduleStart', row.schedule.start);
                    if (row.schedule?.end) params.set('scheduleEnd', row.schedule.end);
                    if (row.location?.pickup) params.set('pickupLocation', row.location.pickup);
                    if (row.location?.pickupStation || row.location?.pickupStationName) params.set('pickupStationName', row.location.pickupStation || row.location.pickupStationName);
                    if (row.location?.return) params.set('returnLocation', row.location.return);
                    if (row.location?.returnStation || row.location?.returnStationName) params.set('returnStationName', row.location.returnStation || row.location.returnStationName);
                    if (row.location?.returnStationId) params.set('returnStationId', row.location.returnStationId);
                    if (row.locationStatus?.pickupStore) params.set('pickupStoreStatus', row.locationStatus.pickupStore);
                    if (row.locationStatus?.pickupStation) params.set('pickupStationStatus', row.locationStatus.pickupStation);
                    if (row.locationStatus?.returnStore) params.set('returnStoreStatus', row.locationStatus.returnStore);
                    if (row.locationStatus?.returnStation) params.set('returnStationStatus', row.locationStatus.returnStation);
                    if (row.postCharge?.status) params.set('postChargeStatus', row.postCharge.status);
                    if (row.postCharge?.amount !== undefined) params.set('postChargeAmount', row.postCharge.amount);
                    if (row.postCharge?.count !== undefined) params.set('postChargeCount', row.postCharge.count);
                    return `/operation/order-detail?${params.toString()}`;
                };

                const viewOrder = (row) => {
                    router.push(buildOrderDetailUrl(row));
                };

                const goToNewOrder = () => {
                    router.push('/operation/new-order');
                }

                const quickAction = (row) => {
                    if (['reserved', 'pickup_overdue', 'inspecting'].includes(row.status)) {
                        router.push(buildOrderDetailUrl(row, 'pickup'));
                    } else if (row.status === 'renting') {
                        router.push(buildOrderDetailUrl(row, 'return'));
                    } else if (['renewing', 'overdue', 'accident_processing', 'settlement_pending', 'payment_due', 'refund_pending'].includes(row.status)) {
                        router.push(buildOrderDetailUrl(row, 'return'));
                    }
                };

                const openFeeAction = (row, action) => {
                    router.push(buildOrderDetailUrl(row, action));
                };

                const openExtendAction = (row) => {
                    router.push(buildOrderDetailUrl(row, 'extend'));
                };

                const openOrderAction = (row, action) => {
                    router.push(buildOrderDetailUrl(row, action));
                };
</script>

<style scoped>
        .store-orders-page {
            min-height: 100%;
        }

        .store-orders-page :deep(.el-table .warning-row) {
            --el-table-tr-bg-color: var(--el-color-warning-light-9);
        }

        .store-orders-page :deep(.el-table .success-row) {
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
