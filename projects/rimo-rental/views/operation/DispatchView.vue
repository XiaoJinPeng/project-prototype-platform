<template>
<div class="dispatch-page flex min-h-full flex-col relative">
            
            

            
            <main class="flex-1 flex flex-col relative">
                
                <div class="pb-2 flex justify-between items-end">
                    <div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">车辆排程看板</h1>
                        </div>
                        <p class="text-gray-500 text-sm mt-1">可视化管理车辆排班、调度与冲突处理。</p>
                    </div>

                    
                    <div class="flex items-center gap-3">
                        <el-button-group class="shadow-sm">
                            <el-button :type="viewMode === 'day' ? 'primary' : ''"
                                @click="viewMode = 'day'">日</el-button>
                            <el-button :type="viewMode === 'week' ? 'primary' : ''"
                                @click="viewMode = 'week'">周</el-button>
                            <el-button :type="viewMode === 'month' ? 'primary' : ''"
                                @click="viewMode = 'month'">月</el-button>
                        </el-button-group>

                        <el-date-picker v-if="viewMode === 'month'" v-model="currentDate" type="month" placeholder="选择月"
                            :clearable="false" format="YYYY年 MM月" style="width: 140px"></el-date-picker>
                        <el-date-picker v-else v-model="currentDate" type="week" placeholder="选择周" :clearable="false"
                            format="YYYY 第 ww 周" style="width: 160px"></el-date-picker>

                        <el-button type="primary" class="shadow-md shadow-indigo-500/20" color="#4f46e5"
                            @click="openStrategyConfig">
                            <el-icon class="mr-1">
                                <MagicStick></MagicStick>
                            </el-icon> 智能优化
                        </el-button>
                        <el-button color="#7c3aed" class="shadow-md shadow-purple-500/20"
                            :disabled="!aiModelConfigured" @click="openAiDispatchAnalysis">
                            <el-icon class="mr-1">
                                <Connection></Connection>
                            </el-icon> AI分析
                        </el-button>
                    </div>
                </div>
                
                <div class="pt-1 pb-1">
                    <div 
                        class="bg-white rounded-lg border border-gray-200 p-2 flex items-center justify-between shadow-sm">
                        <div class="flex items-center space-x-4 pl-2">
                            <span class="text-sm text-gray-500">筛选:</span>
                            <el-cascader v-model="filterLocation" :options="locationOptions" placeholder="选择车行/门店"
                                style="width: 220px" clearable :show-all-levels="false"></el-cascader>
                            <el-select v-model="filterGroup" placeholder="车型组" style="width: 140px">
                                <el-option label="全部车型" value="all"></el-option>
                                <el-option label="经济型 (Economy)" value="economy"></el-option>
                                <el-option label="商务型 (Business)" value="business"></el-option>
                                <el-option label="SUV (SUV)" value="suv"></el-option>
                            </el-select>
                            <el-select v-model="filterStatus" placeholder="状态" style="width: 120px">
                                <el-option label="全部状态" value="all"></el-option>
                                <el-option label="空闲" value="idle"></el-option>
                                <el-option label="在租" value="rented"></el-option>
                            </el-select>
                        <el-tooltip content="重置筛选" placement="top">
                                <el-button circle @click="resetFilters">
                                    <el-icon><Refresh></Refresh></el-icon>
                                </el-button>
                            </el-tooltip>
                        </div>
                        <div class="flex items-center space-x-4 text-xs text-gray-500 pr-2">
                            <div class="flex items-center"><span 
                                    class="w-3 h-3 bg-blue-100 border border-blue-300 mr-1"></span> 在租</div>
                            <div class="flex items-center"><span 
                                    class="w-3 h-3 bg-green-100 border border-green-300 mr-1"></span> 完好空闲</div>
                            <div class="flex items-center"><span 
                                    class="w-3 h-3 bg-gray-100 border border-gray-300 mr-1"></span> 维修中</div>
                            <div class="flex items-center"><span 
                                    class="w-3 h-3 bg-amber-50 border border-amber-300 mr-1"></span> 预分配</div>
                            <div class="flex items-center"><span 
                                    class="w-3 h-3 bg-emerald-50 border border-emerald-300 mr-1"></span> 已硬锁</div>
                        </div>
                    </div>
                </div>

                
                <div class="flex-1 flex flex-col overflow-hidden">
                    <div 
                        class="flex-1 overflow-auto custom-scroll bg-white rounded-lg border border-gray-200 shadow-sm w-full mt-2 relative">
                        
                        <div style="width: max-content; min-width: 100%;">
                            
                            <div class="gantt-grid bg-slate-50 sticky top-0 z-50" :style="gridStyle">
                                <div 
                                    class="gantt-cell gantt-header flex items-center justify-center border-b-2 sticky left-0 z-50 bg-slate-50">
                                    车辆资源
                                </div>
                                
                                <div v-for="(day, index) in gridDates" :key="index"
                                    class="gantt-cell gantt-header flex flex-col justify-center cursor-pointer hover:bg-blue-100 transition-colors"
                                    :class="{'bg-blue-50 text-blue-600': isToday(day)}" @click="openDatePanel(day)">
                                    <span>{{ day.format('MM/DD') }}</span>
                                    <span class="text-xs mt-1">{{ day.format('ddd') }}</span>
                                </div>
                            </div>

                            
                            <div class="gantt-grid" v-for="group in filteredGroups" :key="group.id" :style="gridStyle">
                                
                                
                                
                                <div class="bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 border-b border-gray-200 sticky left-0 z-40 border-r"
                                    :style="{ gridColumn: '1 / span 1' }">
                                    {{ group.name }} ({{ group.vehicles.length }}辆)
                                </div>
                                
                                <div class="bg-gray-100 border-b border-gray-200" :style="{ gridColumn: '2 / -1' }">
                                </div>

                                
                                <template v-for="vehicle in group.vehicles" :key="vehicle.id">
                                    
                                    <div class="gantt-cell bg-white hover:bg-gray-50 flex flex-col justify-center px-4 cursor-pointer border-r sticky left-0 z-40"
                                        @click="openVehicleDrawer(vehicle)">
                                        <div class="flex items-center justify-between">
                                            <span class="font-bold text-slate-800 text-sm">{{ vehicle.plate }}</span>
                                            <el-tag size="small" effect="light" :type="getStatusType(vehicle.status)"
                                                class="scale-90 origin-right border-0">{{ vehicle.statusText }}</el-tag>
                                        </div>
                                        <div class="text-xs text-gray-400 mt-0.5 truncate" :title="vehicle.model">{{
                                            vehicle.model }}</div>
                                    </div>

                                    
                                    <div v-for="(day, dIndex) in gridDates" :key="dIndex"
                                        class="gantt-cell flex flex-row gap-1 p-1 h-[64px] items-stretch"
                                        :class="{'bg-slate-50': [0, 6].includes(day.day())}"> 

                                        
                                        
                                        <div v-for="order in getOrdersForDay(vehicle, day)" :key="order.id"
                                            class="relative flex-1 rounded px-2 py-0.5 text-xs cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col justify-center"
                                            :class="getOrderClass(order, day)" @click.stop="openOrderDrawer(order)">

                                            <div class="flex items-center justify-between gap-1">
                                                <div class="font-bold truncate">{{ order.customer }}</div>
                                                <span class="shrink-0 rounded border px-1 py-[1px] text-[10px] leading-3 font-medium"
                                                    :class="getDispatchBadgeClass(order.dispatchStatus)"
                                                    :title="getDispatchStatusText(order.dispatchStatus)">
                                                    {{ viewMode === 'month' ? getDispatchStatusShortText(order.dispatchStatus) : getDispatchStatusText(order.dispatchStatus) }}
                                                </span>
                                            </div>
                                            <div class="scale-90 text-opacity-80 truncate"
                                                :class="isOrderEnd(order, day) ? 'origin-right' : 'origin-left'">
                                                {{ getOrderTimeText(order, day) }}
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div> 
                    </div> 
                </div> 
            </main>
        </div>

        
        <el-drawer v-model="drawerVisible" :title="selectedOrder ? '订单调度详情' : '详情'" size="400px">
            <template v-if="selectedOrder">
                <div class="space-y-6">
                    
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-lg font-bold text-blue-900">{{ selectedOrder.customer }}</span>
                            <el-tag type="warning">{{ selectedOrder.status }}</el-tag>
                        </div>
                        <div class="text-sm text-blue-700 space-y-1">
                            <div><el-icon class="mr-1">
                                    <Phone></Phone>
                                </el-icon> {{ selectedOrder.phone }}</div>
                            <div><el-icon class="mr-1">
                                    <Van></Van>
                                </el-icon> 当前车辆: <b>{{ selectedOrder.vehiclePlate }}</b></div>
                            <div><el-icon class="mr-1">
                                    <Operation></Operation>
                                </el-icon> 派车状态:
                                <el-tag size="small" effect="plain"
                                    :type="getDispatchTagType(selectedOrder.dispatchStatus)">
                                    {{ getDispatchStatusText(selectedOrder.dispatchStatus) }}
                                </el-tag>
                            </div>
                        </div>
                    </div>

                    
                    <div>
                        <h4 class="text-sm font-bold text-gray-500 mb-2 uppercase">租期信息</h4>
                        <el-timeline>
                            <el-timeline-item :timestamp="selectedOrder.startTime" type="primary" hube="dot">
                                <div class="font-medium">取车 (门店)</div>
                            </el-timeline-item>
                            <el-timeline-item :timestamp="selectedOrder.endTime" type="success" hube="dot">
                                <div class="font-medium">还车 (门店)</div>
                            </el-timeline-item>
                        </el-timeline>
                    </div>

                    
                    <div class="pt-4 border-t border-gray-100">
                        <h4 class="text-sm font-bold text-gray-500 mb-4 uppercase">调度操作</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <el-button type="primary" plain @click="showReassignDialog">
                                <el-icon class="mr-1">
                                    <Refresh></Refresh>
                                </el-icon> 改派车辆
                            </el-button>
                            <el-button type="warning" plain>
                                <el-icon class="mr-1">
                                    <Calendar></Calendar>
                                </el-icon> 修改租期
                            </el-button>
                            <el-button plain class="col-span-2" @click="goToDetail">
                                <el-icon class="mr-1">
                                    <Document></Document>
                                </el-icon> 查看完整订单详情
                            </el-button>
                        </div>
                    </div>
                </div>
            </template>
        </el-drawer>

        
        <el-dialog v-model="reassignVisible" title="改派车辆" width="560px">
            <div class="p-4 bg-blue-50 text-blue-700 rounded-md mb-4 text-sm flex items-start">
                <el-icon class="mr-2 mt-0.5 text-lg">
                    <InfoFilled></InfoFilled>
                </el-icon>
                调度页发起改派时，实际打开的改派窗口与订单详情页“订单改派 & 车辆升级”一致，包含车辆选择、可用时段校验、同车行限制、差价试算、改派原因、免费升等原因和操作记录。
            </div>

            <div class="space-y-4">
                <div>
                    <div class="text-xs text-gray-500 mb-1">当前车辆</div>
                    <div class="font-bold text-lg">{{ selectedOrder?.vehiclePlate }}</div>
                </div>
                <div class="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600 leading-6">
                    <div>本期不在调度页维护一套独立改派表单。</div>
                    <div>点击确认后进入订单改派流程，目标车辆池、原因枚举、费用差额和企业月结调增/调减口径均按订单详情页规则处理。</div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="reassignVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmReassign">进入订单改派</el-button>
                </span>
            </template>
        </el-dialog>

        
        <el-drawer v-model="vehicleDrawerVisible" title="车辆排程看板详情" size="450px">
            <template v-if="selectedVehicle">
                <div class="space-y-6">
                    
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-xl font-bold text-slate-800">{{ selectedVehicle.plate }}</span>
                            <el-tag :type="getStatusType(selectedVehicle.status)">{{ selectedVehicle.statusText
                                }}</el-tag>
                        </div>
                        <div class="text-sm text-gray-500 mb-2">{{ selectedVehicle.model }}</div>
                        <div class="flex items-center space-x-4 text-xs text-gray-400">
                            <span><el-icon>
                                    <Location></Location>
                                </el-icon> 中心门店</span>
                            <span><el-icon>
                                    <Odometer></Odometer>
                                </el-icon> 28,500 km</span>
                            <span><el-icon>
                                    <Lightning></Lightning>
                                </el-icon> 油量 85%</span>
                        </div>
                    </div>

                    
                    <div>
                        <h4 class="text-sm font-bold text-gray-500 mb-4 uppercase">排班时间轴 (Timeline)</h4>
                        <div class="pl-2">
                            <el-timeline>
                                <el-timeline-item timestamp="2026-02-01" placement="top" type="success">
                                    <div class="bg-green-50 p-2 rounded border border-green-100 mb-2">
                                        <div class="font-bold text-green-800">保养完成</div>
                                        <div class="text-xs text-green-600">4S店定期保养</div>
                                    </div>
                                </el-timeline-item>
                                <template v-for="order in getVehicleOrders(selectedVehicle.id)" :key="order.id">
                                    <el-timeline-item :timestamp="order.startTime" placement="top" color="#409eff">
                                        <div class="bg-blue-50 p-3 rounded border border-blue-100 hover:shadow-md transition-shadow cursor-pointer"
                                            @click="openOrderDrawer(order)">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="font-bold text-blue-900">订单: {{ order.customer }}</span>
                                                <el-tag size="small">用车</el-tag>
                                            </div>
                                            <div class="text-xs text-blue-700">
                                                <div>{{ dayjs(order.startTime).format('MM-DD HH:mm') }} 取车</div>
                                                <div>{{ dayjs(order.endTime).format('MM-DD HH:mm') }} 还车</div>
                                            </div>
                                        </div>
                                    </el-timeline-item>
                                </template>
                                <el-timeline-item placement="top" color="#e4e7ed">
                                    <div class="text-gray-400 text-xs text-center py-2">未来暂无更多排班</div>
                                </el-timeline-item>
                            </el-timeline>
                        </div>
                    </div>
                </div>
            </template>
        </el-drawer>

        
        <el-drawer v-model="dailyOpsVisible" direction="btt" size="60%">
            <template #header>
                <div class="flex items-center space-x-4">
                    <h3 class="text-xl font-bold">{{ selectedDate ? selectedDate.format('YYYY年MM月DD日 (dddd)') : '' }}
                        运营看板</h3>
                    <el-tag type="danger" effect="dark" round>今日冲突: 0</el-tag>
                    <el-tag type="primary" effect="plain" round>订单总量: {{ dailyOrders.pickup.length +
                        dailyOrders.return.length }}</el-tag>
                </div>
            </template>
            <div class="flex h-full space-x-6 pb-6">
                
                <div class="flex-1 bg-blue-50 rounded-xl p-4 flex flex-col">
                    <div class="flex justify-between items-center mb-4 pb-2 border-b border-blue-200">
                        <h4 class="font-bold text-blue-900 flex items-center"><el-icon class="mr-2">
                                <Key></Key>
                            </el-icon> 待取车 (Pickups)</h4>
                        <span class="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">{{
                            dailyOrders.pickup.length }}</span>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scroll space-y-3">
                        <div v-for="order in dailyOrders.pickup" :key="order.id"
                            class="bg-white p-3 rounded shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition-all"
                            @click="openOrderDrawer(order)">
                            <div class="flex justify-between">
                                <span class="font-bold text-gray-800">{{ order.customer }}</span>
                                <span class="font-mono text-blue-600 font-bold">{{
                                    dayjs(order.startTime).format('HH:mm') }}</span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>{{ getVehiclePlate(order.vehicleId) }}</span>
                                <span>{{ order.phone }}</span>
                            </div>
                        </div>
                        <div v-if="dailyOrders.pickup.length === 0" class="text-center text-gray-400 py-10">今日无取车任务
                        </div>
                    </div>
                </div>

                
                <div class="flex-1 bg-green-50 rounded-xl p-4 flex flex-col">
                    <div class="flex justify-between items-center mb-4 pb-2 border-b border-green-200">
                        <h4 class="font-bold text-green-900 flex items-center"><el-icon class="mr-2">
                                <SuccessFilled></SuccessFilled>
                            </el-icon> 待还车 (Returns)</h4>
                        <span class="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-bold">{{
                            dailyOrders.return.length }}</span>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scroll space-y-3">
                        <div v-for="order in dailyOrders.return" :key="order.id"
                            class="bg-white p-3 rounded shadow-sm border-l-4 border-green-500 cursor-pointer hover:shadow-md transition-all"
                            @click="openOrderDrawer(order)">
                            <div class="flex justify-between">
                                <span class="font-bold text-gray-800">{{ order.customer }}</span>
                                <span class="font-mono text-green-600 font-bold">{{ dayjs(order.endTime).format('HH:mm')
                                    }}</span>
                            </div>
                            <div class="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>{{ getVehiclePlate(order.vehicleId) }}</span>
                                <span>门店还车</span>
                            </div>
                        </div>
                        <div v-if="dailyOrders.return.length === 0" class="text-center text-gray-400 py-10">今日无还车任务
                        </div>
                    </div>
                </div>

                
                <div class="flex-1 bg-gray-50 rounded-xl p-4 flex flex-col">
                    <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
                        <h4 class="font-bold text-gray-700 flex items-center"><el-icon class="mr-2">
                                <Tools></Tools>
                            </el-icon> 待整备 (Maint)</h4>
                        <span class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-bold">0</span>
                    </div>
                    <div class="flex-1 overflow-y-auto custom-scroll">
                        <div class="text-center text-gray-400 py-10">今日无整备任务</div>
                    </div>
                </div>
            </div>
        </el-drawer>

        
        <el-dialog v-model="strategyConfigVisible" width="820px" top="8vh" :show-close="!isCalculating"
            :close-on-click-modal="!isCalculating" :close-on-press-escape="!isCalculating"
            :before-close="handleStrategyClose">
            <template #header>
                <div class="pr-8">
                    <div class="flex items-start gap-4">
                        <div 
                            class="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                            <el-icon size="20">
                                <Operation></Operation>
                            </el-icon>
                        </div>
                        <div>
                            <div class="text-[22px] font-bold text-gray-800 tracking-tight">智能优化排班</div>
                            <div class="text-sm text-gray-500 mt-1">对未硬锁定订单进行全局重排，生成更优的车辆预分配结果</div>
                        </div>
                    </div>
                </div>
            </template>

            <div v-if="!isCalculating" class="space-y-6">
                <section class="rounded-2xl border border-slate-200 bg-white p-5">
                    <div class="text-sm font-semibold text-gray-800">优化时间窗口</div>
                    <div class="mt-4 space-y-4">
                        <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <el-radio-group v-model="optimizationDays" size="default">
                                <el-radio-button :label="3">未来 3 天</el-radio-button>
                                <el-radio-button :label="7">未来 7 天</el-radio-button>
                                <el-radio-button :label="14">未来 14 天</el-radio-button>
                            </el-radio-group>
                        </div>
                        <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
                            <div v-for="rule in optimizationFixedRules" :key="rule.title"
                                class="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                <div class="text-sm font-semibold text-gray-800">{{ rule.title }}</div>
                                <div class="text-xs text-gray-500 mt-1 leading-5">{{ rule.desc }}</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div class="text-sm font-semibold text-gray-800">优化范围概览</div>
                        <el-tag type="info" effect="plain" round>预分配重排</el-tag>
                    </div>
                    <div class="grid grid-cols-3 gap-3">
                        <div v-for="card in optimizationOverviewCards" :key="card.label" class="rounded-xl border p-4"
                            :class="card.tone === 'muted' ? 'border-slate-200 bg-slate-100/80' : 'border-white bg-white shadow-sm'">
                            <div class="flex items-center justify-between">
                                <div class="text-xs text-gray-400 uppercase tracking-wider">{{ card.label }}</div>
                                <el-tag v-if="card.tag" size="small" effect="plain" :type="card.tagType || 'info'">{{
                                    card.tag }}</el-tag>
                            </div>
                            <div class="text-2xl font-bold text-gray-800 mt-3">{{ card.value }}</div>
                            <div class="text-xs text-gray-500 mt-2 leading-5">{{ card.hint }}</div>
                        </div>
                    </div>
                    <div 
                        class="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-center justify-between">
                        <div>
                            <div class="text-xs text-gray-400 uppercase tracking-wider">涉及门店 / 当前门店范围</div>
                            <div class="text-sm font-semibold text-gray-800 mt-1">{{ optimizationScope.storeScopeLabel
                                }}</div>
                            <div class="text-xs text-gray-500 mt-1">本期仅使用取车门店可交付车辆，不发起跨门店调拨。</div>
                        </div>
                        <el-tag effect="plain" type="info">{{ optimizationScope.storeCountText }}</el-tag>
                    </div>
                </section>
            </div>

            <div v-else class="py-8 px-2">
                <div class="flex flex-col items-center">
                    <div 
                        class="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                        <el-icon class="is-loading" size="26">
                            <Loading></Loading>
                        </el-icon>
                    </div>
                    <div class="text-lg font-semibold text-gray-800 mt-5">正在计算更优排版方案，请稍候…</div>
                    <div class="text-sm text-gray-500 mt-2">系统将自动分析订单、可用车辆与时间冲突，生成本次优化建议</div>
                </div>
                <div class="mt-8 px-8">
                    <el-steps :active="calculationStage" align-center finish-status="success">
                        <el-step title="分析订单" description="筛选未来时间窗内未硬锁定订单"></el-step>
                        <el-step title="计算可用车辆" description="校验库存、整备缓冲与时间冲突"></el-step>
                        <el-step title="生成优化方案" description="输出可预览、可确认的预分配建议"></el-step>
                    </el-steps>
                </div>
            </div>

            <template #footer>
                <div v-if="!isCalculating" class="w-full flex items-center justify-between">
                    <div class="text-sm">
                        <span v-if="!hasOptimizableOrders" class="text-amber-600">当前无可优化订单</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <el-button @click="closeStrategyConfig">取消</el-button>
                        <el-button type="primary" color="#2563eb" :disabled="!hasOptimizableOrders"
                            @click="runOptimization">
                            <el-icon class="mr-1">
                                <VideoPlay></VideoPlay>
                            </el-icon> 开始优化
                        </el-button>
                    </div>
                </div>
                <div v-else class="w-full text-left text-sm text-gray-500">正在计算更优排版方案，请稍候…</div>
            </template>
        </el-dialog>

        
        <el-dialog v-model="smartDispatchVisible" width="1180px" top="4vh">
            <template #header>
                <div class="pr-8 flex items-start justify-between gap-4">
                    <div>
                        <div class="text-[22px] font-bold text-gray-800 tracking-tight">智能优化结果</div>
                        <div class="text-sm text-gray-500 mt-1">已生成新的预分配方案，请确认是否应用</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <el-tag type="success" effect="dark" round>优化完成</el-tag>
                        <el-tag type="info" effect="plain" round>结果预览</el-tag>
                    </div>
                </div>
            </template>

            <div class="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                <section class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                    <div class="text-sm font-semibold text-gray-800 mb-4">结果总览</div>
                    <div class="grid grid-cols-3 gap-3">
                        <div v-for="card in optimizationResultCards" :key="card.label" class="rounded-xl border p-4"
                            :class="card.cardClass">
                            <div class="flex items-center justify-between">
                                <div class="text-xs uppercase tracking-wider text-gray-400">{{ card.label }}</div>
                                <span class="text-xs font-medium" :class="card.deltaClass">{{ card.delta }}</span>
                            </div>
                            <div class="text-[28px] font-bold mt-3" :class="card.valueClass">{{ card.value }}</div>
                            <div class="text-xs text-gray-500 mt-2">{{ card.hint }}</div>
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border border-slate-200 bg-white p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-sm font-semibold text-gray-800">订单变更明细</div>
                            <div class="text-xs text-gray-500 mt-1">按影响度排序，展示本次重点变更与未纳入优化的订单</div>
                        </div>
                        <el-tag type="success" effect="plain">{{ optimizationAdjustedCount }} 笔订单已优化</el-tag>
                    </div>
                    <el-table :data="optimizationChangeRows" border stripe height="320">
                        <el-table-column prop="orderNo" label="订单编号" width="150"></el-table-column>
                        <el-table-column label="取还车时间" min-width="180">
                            <template #default="scope">
                                <div class="text-sm text-gray-700">{{ scope.row.pickupTime }}</div>
                                <div class="text-xs text-gray-400 mt-1">{{ scope.row.returnTime }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="group" label="车型组" width="110"></el-table-column>
                        <el-table-column label="优化前车辆" width="120">
                            <template #default="scope">
                                <span class="font-medium text-gray-700">{{ scope.row.beforeVehicle }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="优化后车辆" width="120">
                            <template #default="scope">
                                <span class="font-medium"
                                    :class="scope.row.status === '已优化' ? 'text-emerald-600' : 'text-gray-500'">{{
                                    scope.row.afterVehicle }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="reason" label="变更原因" min-width="240"></el-table-column>
                        <el-table-column label="状态" width="140">
                            <template #default="scope">
                                <el-tag size="small" effect="plain"
                                    :type="getOptimizationStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="风险状态" width="100">
                            <template #default="scope">
                                <el-tag size="small" effect="plain" :type="getOptimizationRiskType(scope.row.risk)">{{
                                    scope.row.risk }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="临近锁定" width="110">
                            <template #default="scope">
                                <el-tag size="small" effect="plain"
                                    :type="scope.row.nearLock ? 'warning' : 'success'">{{ scope.row.nearLock ? '是' : '否'
                                    }}</el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </section>
            </div>

            <template #footer>
                <div class="w-full flex items-center justify-end gap-3">
                    <el-button @click="closeSmartDispatch">关闭</el-button>
                    <el-button type="primary" color="#2563eb" @click="applySmartDispatch">
                        <el-icon class="mr-1">
                            <Check></Check>
                        </el-icon> 确认应用优化结果
                    </el-button>
                </div>
            </template>
        </el-dialog>

        
        <el-dialog v-model="aiDispatchVisible" width="1180px" top="4vh">
            <template #header>
                <div class="pr-8 flex items-start justify-between gap-4">
                    <div>
                        <div class="text-[22px] font-bold text-gray-800 tracking-tight">AI调度分析</div>
                        <div class="text-sm text-gray-500 mt-1">基于租户模型配置、命中提示词和调度数据包生成风险诊断与推荐动作</div>
                    </div>
                    <div class="flex items-center gap-2">
                        <el-tag type="success" effect="plain" round>{{ aiModelInfo.provider }}</el-tag>
                        <el-tag type="warning" effect="plain" round>{{ aiModelInfo.promptSourceText }}</el-tag>
                        <el-tag type="info" effect="plain" round>{{ aiModelInfo.promptVersion }}</el-tag>
                    </div>
                </div>
            </template>

            <el-tabs v-model="aiDispatchActiveTab">
                <el-tab-pane label="分析结果" name="result">
                    <div class="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                <section class="rounded-2xl border border-slate-200 bg-white p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-sm font-semibold text-gray-800">模型接入状态</div>
                            <div class="text-xs text-gray-500 mt-1">API Key 由租户管理员在系统通用参数中维护，前端不回显明文。</div>
                        </div>
                        <el-tag type="success" effect="dark" round>已配置</el-tag>
                    </div>
                    <div class="grid grid-cols-5 gap-3">
                        <div v-for="item in aiModelSummaryCards" :key="item.label"
                            class="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <div class="text-xs uppercase tracking-wider text-gray-400">{{ item.label }}</div>
                            <div class="text-sm font-semibold text-gray-800 mt-2">{{ item.value }}</div>
                            <div class="text-xs text-gray-500 mt-2 leading-5">{{ item.hint }}</div>
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-sm font-semibold text-gray-800">分析范围与调用上限</div>
                            <div class="text-xs text-gray-500 mt-1">初版只允许在系统候选池过滤完成后发起模型分析，超出范围不调用模型。</div>
                        </div>
                        <el-tag type="info" effect="plain" round>当前窗口 {{ optimizationDays }} 天</el-tag>
                    </div>
                    <div class="grid grid-cols-4 gap-3">
                        <div v-for="item in aiScopeCards" :key="item.label"
                            class="rounded-xl border border-slate-200 bg-white p-4">
                            <div class="text-xs uppercase tracking-wider text-gray-400">{{ item.label }}</div>
                            <div class="text-sm font-semibold text-gray-800 mt-2">{{ item.value }}</div>
                            <div class="text-xs text-gray-500 mt-2 leading-5">{{ item.hint }}</div>
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                    <div class="text-sm font-semibold text-gray-800 mb-4">AI风险总览</div>
                    <div class="grid grid-cols-4 gap-3">
                        <div v-for="card in aiRiskCards" :key="card.label" class="rounded-xl border p-4"
                            :class="card.cardClass">
                            <div class="text-xs uppercase tracking-wider text-gray-400">{{ card.label }}</div>
                            <div class="text-[28px] font-bold mt-3" :class="card.valueClass">{{ card.value }}</div>
                            <div class="text-xs text-gray-500 mt-2">{{ card.hint }}</div>
                        </div>
                    </div>
                </section>

                <section class="rounded-2xl border border-slate-200 bg-white p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-sm font-semibold text-gray-800">风险诊断明细</div>
                            <div class="text-xs text-gray-500 mt-1">AI 仅输出分析，最终是否处理由调度员确认。</div>
                        </div>
                        <el-tag type="warning" effect="plain">需人工复核 {{ aiManualReviewCount }} 项</el-tag>
                    </div>
                    <el-table :data="aiRiskRows" border stripe height="220">
                        <el-table-column prop="riskType" label="风险类型" width="130">
                            <template #default="scope">
                                <el-tag size="small" effect="plain" :type="getAiRiskType(scope.row.severity)">{{
                                    scope.row.riskType }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="orderNo" label="订单编号" width="150"></el-table-column>
                        <el-table-column prop="description" label="风险说明" min-width="320"></el-table-column>
                        <el-table-column prop="suggestion" label="建议动作" min-width="240"></el-table-column>
                        <el-table-column prop="severity" label="等级" width="90">
                            <template #default="scope">
                                <el-tag size="small" :type="getAiRiskType(scope.row.severity)">{{ scope.row.severityText
                                    }}</el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </section>

                <section class="rounded-2xl border border-slate-200 bg-white p-5">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <div class="text-sm font-semibold text-gray-800">AI推荐动作</div>
                            <div class="text-xs text-gray-500 mt-1">通过系统校验的推荐才允许应用；未通过校验只展示原因。</div>
                        </div>
                        <el-tag type="success" effect="plain">{{ aiApplicableCount }} 项可应用</el-tag>
                    </div>
                    <el-table :data="aiRecommendationRows" border stripe height="280">
                        <el-table-column prop="orderNo" label="订单编号" width="150"></el-table-column>
                        <el-table-column prop="currentVehicle" label="当前车辆" width="120"></el-table-column>
                        <el-table-column prop="recommendedVehicle" label="推荐车辆" width="120">
                            <template #default="scope">
                                <span class="font-medium"
                                    :class="scope.row.validation === '通过' ? 'text-purple-600' : 'text-gray-500'">{{
                                    scope.row.recommendedVehicle }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column prop="reason" label="推荐原因" min-width="280"></el-table-column>
                        <el-table-column prop="confidence" label="信心等级" width="110">
                            <template #default="scope">
                                <el-tag size="small" effect="plain" :type="getAiConfidenceType(scope.row.confidence)">{{
                                    scope.row.confidenceText }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="validation" label="系统校验" width="110">
                            <template #default="scope">
                                <el-tag size="small" effect="plain"
                                    :type="scope.row.validation === '通过' ? 'success' : 'warning'">{{
                                    scope.row.validation }}</el-tag>
                            </template>
                        </el-table-column>
                    </el-table>
                </section>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="请求日志" name="requestLog">
                    <div class="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
                        <section class="rounded-2xl border border-slate-200 bg-white p-5">
                            <div class="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <div class="text-sm font-semibold text-gray-800">本次模型请求日志</div>
                                    <div class="text-xs text-gray-500 mt-1">展示本次实际提交给模型的提示词和调度数据包，不展示 API Key 和鉴权 Header。</div>
                                </div>
                                <el-tag type="success" effect="plain">已完成隐私过滤</el-tag>
                            </div>
                            <div class="grid grid-cols-4 gap-3">
                                <div v-for="item in aiRequestLogCards" :key="item.label"
                                    class="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                    <div class="text-xs uppercase tracking-wider text-gray-400">{{ item.label }}</div>
                                    <div class="text-sm font-semibold text-gray-800 mt-2">{{ item.value }}</div>
                                    <div class="text-xs text-gray-500 mt-2 leading-5">{{ item.hint }}</div>
                                </div>
                            </div>
                        </section>

                        <section class="grid grid-cols-2 gap-4">
                            <div class="rounded-2xl border border-slate-200 bg-white p-5">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="text-sm font-semibold text-gray-800">完整提示词正文</div>
                                    <el-button size="small" plain>复制提示词</el-button>
                                </div>
                                <pre class="h-[320px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{{ aiRequestPromptText }}</pre>
                            </div>
                            <div class="rounded-2xl border border-slate-200 bg-white p-5">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="text-sm font-semibold text-gray-800">完整请求数据包</div>
                                    <el-button size="small" plain>导出 JSON</el-button>
                                </div>
                                <pre class="h-[320px] overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{{ aiRequestPayload }}</pre>
                            </div>
                        </section>

                        <section class="rounded-2xl border border-slate-200 bg-white p-5">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <div class="text-sm font-semibold text-gray-800">隐私过滤与模型返回</div>
                                    <div class="text-xs text-gray-500 mt-1">用于让调度员确认本次请求未提交手机号、证件号、支付资料和 API Key。</div>
                                </div>
                                <el-tag type="info" effect="plain">{{ aiRequestLog.filteredFields.length }} 类资料已排除</el-tag>
                            </div>
                            <div class="grid grid-cols-3 gap-4">
                                <div class="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                    <div class="text-xs uppercase tracking-wider text-gray-400 mb-3">已排除资料</div>
                                    <div class="flex flex-wrap gap-2">
                                        <el-tag v-for="item in aiRequestLog.filteredFields" :key="item" size="small"
                                            type="info" effect="plain">{{ item }}</el-tag>
                                    </div>
                                </div>
                                <div class="col-span-2 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                                    <div class="text-xs uppercase tracking-wider text-gray-400 mb-3">模型原始返回摘要</div>
                                    <pre class="h-[160px] overflow-auto rounded-lg bg-white p-3 text-xs leading-5 text-gray-700 whitespace-pre-wrap">{{ aiResponsePayload }}</pre>
                                </div>
                            </div>
                        </section>
                    </div>
                </el-tab-pane>
            </el-tabs>

            <template #footer>
                <div class="w-full flex items-center justify-between gap-3">
                    <div class="text-xs text-gray-500">AI 推荐应用前仍执行订单状态、车辆状态、时间窗、人工保护和权限二次校验。</div>
                    <div class="flex items-center gap-3">
                        <el-button plain @click="aiDispatchActiveTab = 'requestLog'">查看请求日志</el-button>
                        <el-button @click="aiDispatchVisible = false">关闭</el-button>
                        <el-button type="primary" color="#7c3aed" @click="applyAiDispatchRecommendations">
                            <el-icon class="mr-1">
                                <Check></Check>
                            </el-icon> 应用可通过校验的推荐
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import { ElMessage } from "element-plus";
import dayjs from 'dayjs';
import { useRouter } from 'vue-router';

const router = useRouter();

const currentDate = ref(dayjs().startOf('week'));
                const viewMode = ref('week');
                const filterGroup = ref('all');
                const filterStatus = ref('all');
                const filterLocation = ref([]); // Store selected path [dealer_id, store_id]

                const resetFilters = () => {
                    filterGroup.value = 'all';
                    filterStatus.value = 'all';
                    filterLocation.value = [];
                };

                // Mock Location Data (Dealer -> Store -> Station)
                const locationOptions = [
                    {
                        value: 'dealer_1', label: 'RIMO (直营)', children: [
                            { value: 'store_1', label: '台北总店' },
                            { value: 'store_2', label: '桃园机场店' }
                        ]
                    },
                    {
                        value: 'dealer_2', label: '联通租车 (加盟)', children: [
                            { value: 'store_3', label: '台中高铁店' },
                            { value: 'store_4', label: '台南车站店' }
                        ]
                    }
                ];

                const drawerVisible = ref(false);
                const selectedOrder = ref(null);
                const reassignVisible = ref(false);
                const newVehicleId = ref('');

                const smartDispatchVisible = ref(false);
                const aiDispatchVisible = ref(false);
                const aiDispatchActiveTab = ref('result');
                const aiModelConfigured = ref(true);
                const aiModelInfo = {
                    provider: 'OpenAI Compatible',
                    model: 'gpt-xxx',
                    promptSourceText: '租户专属版',
                    promptConfigVersion: 'prompt-config-20260519.01',
                    promptVersion: 'rimo-store-dispatch-agent-v1',
                    promptHash: 'sha256:8c21...f09a',
                    dataVersion: 'dispatch-packet-v1'
                };

                // Interactions State
                const vehicleDrawerVisible = ref(false);
                const selectedVehicle = ref(null);
                const dailyOpsVisible = ref(false);
                const selectedDate = ref(null);
                const dailyOrders = ref({ pickup: [], return: [] });

                // Strategy Config State
                const strategyConfigVisible = ref(false);
                const optimizationDays = ref(7);
                const isCalculating = ref(false);
                const calculationStage = ref(1);
                let optimizationTimers = [];

                const optimizationFixedRules = [
                    { title: '默认先预览', desc: '开始优化后只生成结果，确认应用后才写入预分配。' },
                    { title: '保护人工结果', desc: '人工改派和免费升等订单固定不参与批量优化。' },
                    { title: '临近取车保护', desc: '进入硬锁定时间点前 2 小时的订单不参与批量优化。' },
                    { title: '硬锁自动分派', desc: '每笔订单到硬锁定时间点时自动复核预分配；无有效车辆时重新匹配，失败进入人工调度。' }
                ];

                const aiModelSummaryCards = [
                    { label: '模型提供商', value: aiModelInfo.provider, hint: '租户自有 API Key 接入' },
                    { label: '模型名称', value: aiModelInfo.model, hint: '由租户管理员配置' },
                    { label: '提示词来源', value: aiModelInfo.promptSourceText, hint: '优先使用租户专属版' },
                    { label: '提示词版本', value: aiModelInfo.promptVersion, hint: '配置文件版本 ' + aiModelInfo.promptConfigVersion },
                    { label: '数据包版本', value: aiModelInfo.dataVersion, hint: '仅提交调度必要数据' }
                ];

                const aiRequestLog = {
                    analysisId: 'AI-DISPATCH-20260519-0008',
                    requestTime: '2026-05-19 14:32',
                    operator: '王店长 / 门市店长',
                    promptSource: 'tenant_override',
                    promptSourceText: aiModelInfo.promptSourceText,
                    promptConfigVersion: aiModelInfo.promptConfigVersion,
                    promptVersion: aiModelInfo.promptVersion,
                    promptHash: aiModelInfo.promptHash,
                    filteredFields: ['手机号', '证件号', '支付资料', 'API Key', '未脱敏敏感备注']
                };

                const aiRequestLogCards = [
                    { label: '分析任务', value: aiRequestLog.analysisId, hint: aiRequestLog.requestTime },
                    { label: '发起人', value: aiRequestLog.operator, hint: '仅查看自己发起的本次请求' },
                    { label: '提示词来源', value: aiRequestLog.promptSourceText, hint: aiRequestLog.promptVersion },
                    { label: '隐私过滤', value: '5 类', hint: '不提交手机号、证件号、支付资料等' }
                ];

                const aiRequestPromptText = `你是 RIMO Rental 门市租赁 AI 调度分析 Agent。

你的职责是帮助营运平台调度员分析门市租赁车辆排程风险，并在系统已经完成硬约束过滤后的合法候选车辆范围内，生成可供调度员确认的预分配推荐。

你不是自动派车执行系统。你不能直接修改订单、车辆、排程、预分配、硬锁、改派、取消、支付、退款或账单。

必须遵守：不得跨车行调度、不得推荐不匹配车组的车辆、不得覆盖人工改派和已硬锁订单，推荐车辆必须来自 candidatesByOrder。`;

                const aiRequestPayload = JSON.stringify({
                    analysisContext: {
                        tenantId: 'tenant-rimo-tpe',
                        businessLine: 'store_rental',
                        windowDays: optimizationDays.value,
                        storeScope: ['台北总店', '桃园机场店'],
                        requestedBy: '王店长',
                        requestedAt: aiRequestLog.requestTime
                    },
                    dispatchRules: {
                        sameDealerOnly: true,
                        candidatePoolRequired: true,
                        hardLockProtection: true,
                        manualReassignProtection: true
                    },
                    orders: [
                        { orderNo: 'ORD-202605-0108', pickupAt: '2026-05-20 10:00', returnAt: '2026-05-22 10:00', vehicleGroup: 'A-SUV', expectedAmount: 7200, phone: '[excluded]' },
                        { orderNo: 'ORD-202605-0115', pickupAt: '2026-05-21 09:00', returnAt: '2026-05-21 18:00', vehicleGroup: 'B-Sedan', expectedAmount: 2600, phone: '[excluded]' }
                    ],
                    candidatesByOrder: {
                        'ORD-202605-0108': ['VH-TPE-2841', 'VH-TPE-6630'],
                        'ORD-202605-0115': ['VH-TPE-7716']
                    },
                    privacyFilter: aiRequestLog.filteredFields
                }, null, 2);

                const aiResponsePayload = JSON.stringify({
                    analysisId: aiRequestLog.analysisId,
                    summary: { riskLevel: 'medium', riskCount: 6, recommendedActionCount: 4, manualReviewCount: 2 },
                    parseStatus: 'JSON_SCHEMA_PASSED',
                    validationStatus: 'PARTIAL_PASSED'
                }, null, 2);

                const aiRiskCards = [
                    { label: '综合风险', value: '中', hint: '未来 7 天存在整备与接续风险', cardClass: 'border-amber-100 bg-amber-50/70', valueClass: 'text-amber-600' },
                    { label: '风险订单', value: '6 单', hint: '需要重点关注的订单数量', cardClass: 'border-white bg-white shadow-sm', valueClass: 'text-gray-800' },
                    { label: '推荐调整', value: '4 单', hint: 'AI 推荐可调整预分配', cardClass: 'border-purple-100 bg-purple-50/70', valueClass: 'text-purple-600' },
                    { label: '需人工确认', value: '2 项', hint: '无明确可派车辆或数据不足', cardClass: 'border-white bg-white shadow-sm', valueClass: 'text-gray-800' }
                ];

                const aiRiskRows = [
                    { riskType: '整备压力', orderNo: 'ORD-202605-0108', description: '当前预分配车辆前序还车后仅预留 45 分钟整备缓冲，低于门店高峰期实际平均整备耗时。', suggestion: '改派同车组车辆 TPE-2841，保留 120 分钟整备缓冲。', severity: 'medium', severityText: '中' },
                    { riskType: '未来冲突', orderNo: 'ORD-202605-0115', description: '基线方案会导致同一车辆连续三段短租接续，后续任一晚还都会影响隔日硬锁。', suggestion: '保留当前订单，调整后续低价值订单进入人工复核。', severity: 'high', severityText: '高' },
                    { riskType: '资料不足', orderNo: 'ORD-202605-0120', description: '候选车辆最近清洁状态缺少同步时间，无法判断是否满足自助取车交付标准。', suggestion: '人工确认车辆清洁状态后再应用推荐。', severity: 'medium', severityText: '中' }
                ];

                const aiRecommendationRows = [
                    { orderNo: 'ORD-202605-0108', currentVehicle: 'TPE-1932', recommendedVehicle: 'TPE-2841', reason: 'AI_RISK_AVOIDANCE：降低整备不足风险，同时保持同车行、同车组和时间窗无冲突。', confidence: 'high', confidenceText: '高', validation: '通过' },
                    { orderNo: 'ORD-202605-0112', currentVehicle: '未分配', recommendedVehicle: 'TPE-6630', reason: 'ASSIGN_PENDING：候选车辆满足可交付范围，且后续 24 小时无接续冲突。', confidence: 'medium', confidenceText: '中', validation: '通过' },
                    { orderNo: 'ORD-202605-0115', currentVehicle: 'TPE-7716', recommendedVehicle: '人工确认', reason: 'AI_MANUAL_REVIEW：连续接续风险较高，但候选车辆均存在整备或未来冲突风险。', confidence: 'medium', confidenceText: '中', validation: '需人工' },
                    { orderNo: 'ORD-202605-0120', currentVehicle: 'TPE-5208', recommendedVehicle: 'TPE-3920', reason: 'AI_DATA_INSUFFICIENT：目标车辆清洁同步时间缺失，当前推荐不得直接应用。', confidence: 'low', confidenceText: '低', validation: '未通过' }
                ];

                const aiManualReviewCount = computed(() => aiRiskRows.filter(row => row.severity !== 'low').length);
                const aiApplicableCount = computed(() => aiRecommendationRows.filter(row => row.validation === '通过').length);

                const optimizationSnapshots = {
                    3: { participating: 12, preassigned: 8, pending: 4, locked: 5, vehicles: 9 },
                    7: { participating: 27, preassigned: 19, pending: 8, locked: 11, vehicles: 16 },
                    14: { participating: 41, preassigned: 29, pending: 12, locked: 18, vehicles: 24 }
                };

                const optimizationResultBase = {
                    3: {
                        adjustedBase: 9,
                        manualProtected: 1,
                        changeReduction: 1,
                        idleReducedHours: 8,
                        idleTradeoff: 1,
                        utilizationLift: 3.2,
                        utilizationTradeoff: 0.4,
                        manualReduction: 2,
                        beforeAssignedRate: 66.7,
                        afterAssignedRate: 91.7,
                        beforeFragments: 6,
                        afterFragments: 3,
                        beforeHighValueMismatch: 2,
                        afterHighValueMismatch: 0,
                        beforeManualPending: 3,
                        afterManualPending: 1,
                        nearLock: 1,
                        unavailableVehicles: 1
                    },
                    7: {
                        adjustedBase: 21,
                        manualProtected: 2,
                        changeReduction: 1,
                        idleReducedHours: 24,
                        idleTradeoff: 2,
                        utilizationLift: 6.8,
                        utilizationTradeoff: 0.6,
                        manualReduction: 6,
                        beforeAssignedRate: 70.4,
                        afterAssignedRate: 92.6,
                        beforeFragments: 14,
                        afterFragments: 6,
                        beforeHighValueMismatch: 5,
                        afterHighValueMismatch: 1,
                        beforeManualPending: 8,
                        afterManualPending: 2,
                        nearLock: 3,
                        unavailableVehicles: 2
                    },
                    14: {
                        adjustedBase: 34,
                        manualProtected: 3,
                        changeReduction: 2,
                        idleReducedHours: 41,
                        idleTradeoff: 3,
                        utilizationLift: 9.4,
                        utilizationTradeoff: 0.8,
                        manualReduction: 11,
                        beforeAssignedRate: 70.7,
                        afterAssignedRate: 95.1,
                        beforeFragments: 21,
                        afterFragments: 9,
                        beforeHighValueMismatch: 8,
                        afterHighValueMismatch: 2,
                        beforeManualPending: 13,
                        afterManualPending: 4,
                        nearLock: 5,
                        unavailableVehicles: 3
                    }
                };

                const optimizationChangeBaseRows = [
                    {
                        orderNo: 'ST240325001',
                        pickupTime: '03-25 09:00 取',
                        returnTime: '03-27 10:00 还',
                        group: '经济型',
                        beforeVehicle: 'RAC-1235',
                        optimizedVehicle: 'RAF-5566',
                        reasonOptimized: '车辆评分更优',
                        reasonStable: '保持原车',
                        risk: '低',
                        nearLock: false,
                        category: 'candidate',
                        priority: 1
                    },
                    {
                        orderNo: 'ST240325008',
                        pickupTime: '03-25 14:00 取',
                        returnTime: '03-26 18:00 还',
                        group: '经济型',
                        beforeVehicle: 'RAB-6789',
                        optimizedVehicle: 'RAH-9900',
                        reasonOptimized: '避免车辆冲突',
                        reasonStable: '保持原车',
                        risk: '中',
                        nearLock: false,
                        category: 'candidate',
                        priority: 2
                    },
                    {
                        orderNo: 'ST240326014',
                        pickupTime: '03-26 08:30 取',
                        returnTime: '03-27 12:00 还',
                        group: '商务型',
                        beforeVehicle: 'RBB-8888',
                        optimizedVehicle: 'RBF-3333',
                        reasonOptimized: '车辆评分更优',
                        reasonStable: '保持原车',
                        risk: '低',
                        nearLock: false,
                        category: 'candidate',
                        priority: 3
                    },
                    {
                        orderNo: 'ST240326021',
                        pickupTime: '03-26 15:00 取',
                        returnTime: '03-28 10:00 还',
                        group: 'SUV',
                        beforeVehicle: 'RCC-1234',
                        optimizedVehicle: 'RCE-9012',
                        reasonOptimized: '车辆评分更优',
                        reasonStable: '保持原车',
                        risk: '低',
                        nearLock: false,
                        category: 'candidate',
                        priority: 4
                    },
                    {
                        orderNo: 'ST240327006',
                        pickupTime: '03-27 09:00 取',
                        returnTime: '03-28 09:30 还',
                        group: '经济型',
                        beforeVehicle: 'RAG-7788',
                        optimizedVehicle: 'RAE-3322',
                        reasonOptimized: '避免车辆冲突',
                        reasonStable: '保持原车',
                        risk: '中',
                        nearLock: false,
                        category: 'candidate',
                        priority: 5
                    },
                    {
                        orderNo: 'ST240327012',
                        pickupTime: '03-27 13:00 取',
                        returnTime: '03-29 11:00 还',
                        group: 'SUV',
                        beforeVehicle: 'RCD-5678',
                        optimizedVehicle: 'RCC-1234',
                        reasonOptimized: '车辆评分更优',
                        reasonStable: '保持原车',
                        risk: '低',
                        nearLock: false,
                        category: 'candidate',
                        priority: 6
                    },
                    {
                        orderNo: 'ST240327023',
                        pickupTime: '03-27 17:30 取',
                        returnTime: '03-28 09:00 还',
                        group: '商务型',
                        beforeVehicle: 'RBC-6666',
                        optimizedVehicle: 'RBC-6666',
                        reasonOptimized: '临近取车保护',
                        reasonStable: '临近取车保护',
                        risk: '中',
                        nearLock: true,
                        category: 'near_lock',
                        priority: 7
                    },
                    {
                        orderNo: 'ST240328004',
                        pickupTime: '03-28 10:00 取',
                        returnTime: '03-30 10:00 还',
                        group: '商务型',
                        beforeVehicle: 'RBF-3333',
                        optimizedVehicle: 'RBD-1111',
                        reasonOptimized: '人工结果保护',
                        reasonStable: '人工结果保护',
                        risk: '低',
                        nearLock: false,
                        category: 'manual',
                        priority: 8
                    },
                    {
                        orderNo: 'ST240328017',
                        pickupTime: '03-28 14:00 取',
                        returnTime: '03-29 18:00 还',
                        group: '经济型',
                        beforeVehicle: 'RAF-5566',
                        optimizedVehicle: 'RAF-5566',
                        reasonOptimized: '保持原车',
                        reasonStable: '保持原车',
                        risk: '低',
                        nearLock: false,
                        category: 'stable',
                        priority: 9
                    }
                ];

                // Mock Data - Expanded
                const vehicles = [
                    // Economy Group
                    { id: 'v1', plate: 'RAC-1235', model: 'Toyota Altis', group: 'economy', status: 'idle', statusText: '空闲' },
                    { id: 'v2', plate: 'RAB-6789', model: 'Toyota Altis', group: 'economy', status: 'rented', statusText: '在租' },
                    { id: 'v5', plate: 'RAE-3322', model: 'Toyota Corolla', group: 'economy', status: 'maintenance', statusText: '维修中' },
                    { id: 'v6', plate: 'RAF-5566', model: 'Toyota Corolla', group: 'economy', status: 'idle', statusText: '空闲' },
                    { id: 'v7', plate: 'RAG-7788', model: 'Nissan Sentra', group: 'economy', status: 'rented', statusText: '在租' },
                    { id: 'v8', plate: 'RAH-9900', model: 'Nissan Sentra', group: 'economy', status: 'idle', statusText: '空闲' },

                    // Business Group
                    { id: 'v3', plate: 'RBB-8888', model: 'Toyota Alphard', group: 'business', status: 'maintenance', statusText: '维修中' },
                    { id: 'v4', plate: 'RBC-6666', model: 'Benz E-Class', group: 'business', status: 'idle', statusText: '空闲' },
                    { id: 'v9', plate: 'RBD-1111', model: 'VW Passat', group: 'business', status: 'rented', statusText: '在租' },
                    { id: 'v10', plate: 'RBE-2222', model: 'VW Passat', group: 'business', status: 'rented', statusText: '在租' },
                    { id: 'v11', plate: 'RBF-3333', model: 'Benz E-Class', group: 'business', status: 'idle', statusText: '空闲' },

                    // SUV Group
                    { id: 'v12', plate: 'RCC-1234', model: 'Toyota RAV4', group: 'suv', status: 'idle', statusText: '空闲' },
                    { id: 'v13', plate: 'RCD-5678', model: 'Toyota RAV4', group: 'suv', status: 'rented', statusText: '在租' },
                    { id: 'v14', plate: 'RCE-9012', model: 'BMW X5', group: 'suv', status: 'idle', statusText: '空闲' },
                ];

                const monthTime = (day, hour) => dayjs().startOf('month').date(day).hour(hour).minute(0).second(0).format('YYYY-MM-DD HH:mm');

                const orders = ref([
                    { id: 'o1', vehicleId: 'v1', customer: '张三', phone: '13811111111', status: '待取车', dispatchStatus: 'pre_assigned', startTime: dayjs().day(1).hour(10).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(2).hour(10).format('YYYY-MM-DD HH:mm') },
                    // v2: Demonstate Side-by-Side (Split View)
                    { id: 'o2_1', vehicleId: 'v2', customer: '李四 (上午)', phone: '13922222222', status: '已还车', dispatchStatus: 'locked', startTime: dayjs().day(1).hour(8).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(1).hour(12).format('YYYY-MM-DD HH:mm') },
                    { id: 'o2_2', vehicleId: 'v2', customer: '王五 (下午)', phone: '13933333333', status: '用车中', dispatchStatus: 'locked', startTime: dayjs().day(1).hour(14).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(3).hour(18).format('YYYY-MM-DD HH:mm') },

                    { id: 'o3', vehicleId: 'v4', customer: '赵六', phone: '13733333333', status: '已预订', dispatchStatus: 'locked', startTime: dayjs().day(3).hour(14).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(5).hour(14).format('YYYY-MM-DD HH:mm') },
                    { id: 'o4', vehicleId: 'v7', customer: '孙七', phone: '13644444444', status: '用车中', dispatchStatus: 'locked', startTime: dayjs().day(0).hour(10).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(6).hour(10).format('YYYY-MM-DD HH:mm') },
                    { id: 'o5', vehicleId: 'v9', customer: '周八', phone: '13555555555', status: '用车中', dispatchStatus: 'locked', startTime: dayjs().day(1).hour(9).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(2).hour(18).format('YYYY-MM-DD HH:mm') },
                    { id: 'o6', vehicleId: 'v10', customer: '吴九', phone: '13466666666', status: '用车中', dispatchStatus: 'locked', startTime: dayjs().day(2).hour(12).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(4).hour(12).format('YYYY-MM-DD HH:mm') },
                    { id: 'o7', vehicleId: 'v13', customer: '郑十', phone: '13377777777', status: '用车中', dispatchStatus: 'locked', startTime: dayjs().day(3).hour(8).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(5).hour(20).format('YYYY-MM-DD HH:mm') },
                    { id: 'o8', vehicleId: 'v1', customer: '陈十一', phone: '13288888888', status: '已预订', dispatchStatus: 'pre_assigned', startTime: dayjs().day(4).hour(10).format('YYYY-MM-DD HH:mm'), endTime: dayjs().day(6).hour(10).format('YYYY-MM-DD HH:mm') },
                    { id: 'm1', vehicleId: 'v6', customer: '林小姐', phone: '13210000001', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(2, 9), endTime: monthTime(3, 10) },
                    { id: 'm2', vehicleId: 'v8', customer: '黄先生', phone: '13210000002', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(3, 13), endTime: monthTime(5, 11) },
                    { id: 'm3', vehicleId: 'v11', customer: '企业-Acer', phone: '13210000003', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(4, 10), endTime: monthTime(6, 18) },
                    { id: 'm4', vehicleId: 'v12', customer: '何先生', phone: '13210000004', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(5, 8), endTime: monthTime(7, 20) },
                    { id: 'm5', vehicleId: 'v14', customer: '企业-宏碁', phone: '13210000005', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(7, 9), endTime: monthTime(10, 9) },
                    { id: 'm6', vehicleId: 'v6', customer: '蔡先生', phone: '13210000006', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(8, 14), endTime: monthTime(9, 18) },
                    { id: 'm7', vehicleId: 'v4', customer: '企业-联华', phone: '13210000007', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(9, 10), endTime: monthTime(12, 12) },
                    { id: 'm8', vehicleId: 'v8', customer: '郭小姐', phone: '13210000008', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(11, 9), endTime: monthTime(12, 16) },
                    { id: 'm9', vehicleId: 'v12', customer: '许先生', phone: '13210000009', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(12, 11), endTime: monthTime(14, 18) },
                    { id: 'm10', vehicleId: 'v1', customer: '企业-台塑', phone: '13210000010', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(14, 9), endTime: monthTime(16, 9) },
                    { id: 'm11', vehicleId: 'v11', customer: '彭小姐', phone: '13210000011', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(15, 13), endTime: monthTime(17, 11) },
                    { id: 'm12', vehicleId: 'v14', customer: '曾先生', phone: '13210000012', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(17, 10), endTime: monthTime(19, 16) },
                    { id: 'm13', vehicleId: 'v6', customer: '企业-华硕', phone: '13210000013', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(18, 9), endTime: monthTime(21, 12) },
                    { id: 'm14', vehicleId: 'v8', customer: '邱先生', phone: '13210000014', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(20, 15), endTime: monthTime(22, 10) },
                    { id: 'm15', vehicleId: 'v4', customer: '企业-长荣', phone: '13210000015', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(22, 9), endTime: monthTime(24, 18) },
                    { id: 'm16', vehicleId: 'v12', customer: '赖小姐', phone: '13210000016', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(24, 11), endTime: monthTime(25, 20) },
                    { id: 'm17', vehicleId: 'v14', customer: '企业-鸿海', phone: '13210000017', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(25, 8), endTime: monthTime(27, 12) },
                    { id: 'm18', vehicleId: 'v1', customer: '苏先生', phone: '13210000018', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(27, 14), endTime: monthTime(28, 18) },
                    { id: 'm19', vehicleId: 'v11', customer: '企业-统一', phone: '13210000019', status: '待取车', dispatchStatus: 'locked', startTime: monthTime(28, 10), endTime: monthTime(30, 10) },
                    { id: 'm20', vehicleId: 'v8', customer: '洪小姐', phone: '13210000020', status: '已预订', dispatchStatus: 'pre_assigned', startTime: monthTime(29, 13), endTime: monthTime(30, 19) },
                ]);

                // Computed: Grid Dates (Week or Month)
                const gridDates = computed(() => {
                    const dates = [];
                    let start, daysCount;

                    if (viewMode.value === 'month') {
                        start = dayjs(currentDate.value).startOf('month');
                        daysCount = start.daysInMonth();
                    } else if (viewMode.value === 'day') {
                        start = dayjs(currentDate.value);
                        daysCount = 1;
                    } else { // default week
                        start = dayjs(currentDate.value).startOf('week');
                        daysCount = 7;
                    }

                    for (let i = 0; i < daysCount; i++) {
                        dates.push(start.add(i, 'day'));
                    }
                    return dates;
                });

                // Computed: Grid Style for Columns
                const gridStyle = computed(() => {
                    const colCount = gridDates.value.length;
                    // Min width for month view cells can be smaller (e.g. 40px) vs week view (140px)
                    const minWidth = viewMode.value === 'month' ? '40px' : '140px';
                    return {
                        display: 'grid',
                        gridTemplateColumns: `250px repeat(${colCount}, minmax(${minWidth}, 1fr))`,
                        borderTop: '1px solid #e5e7eb',
                        borderLeft: '1px solid #e5e7eb',
                        width: 'max-content',
                        minWidth: '100%'
                    };
                });

                // Computed: Filtered Groups
                const filteredGroups = computed(() => {
                    // Grouping Logic
                    const groups = [
                        { id: 'g_eco', name: '经济型 (Economy)', vehicles: [] },
                        { id: 'g_bus', name: '商务型 (Business)', vehicles: [] },
                        { id: 'g_suv', name: 'SUV / 越野 (SUV)', vehicles: [] }
                    ];

                    vehicles.forEach(v => {
                        if (filterGroup.value !== 'all' && v.group !== filterGroup.value) return;
                        if (filterStatus.value !== 'all' && v.status !== filterStatus.value) return;

                        if (v.group === 'economy') groups[0].vehicles.push(v);
                        if (v.group === 'business') groups[1].vehicles.push(v);
                        if (v.group === 'suv') groups[2].vehicles.push(v);
                    });

                    return groups.filter(g => g.vehicles.length > 0);
                });

                const getLocationLabelByPath = (options, path) => {
                    if (!path || !path.length) return 'Center Store（当前门店）';

                    let currentOptions = options;
                    const labels = [];
                    path.forEach(value => {
                        const matched = currentOptions.find(item => item.value === value);
                        if (matched) {
                            labels.push(matched.label);
                            currentOptions = matched.children || [];
                        }
                    });
                    return labels.length ? labels.join(' / ') : 'Center Store（当前门店）';
                };

                const optimizationScope = computed(() => {
                    const snapshot = optimizationSnapshots[optimizationDays.value] || optimizationSnapshots[7];
                    return {
                        ...snapshot,
                        storeScopeLabel: getLocationLabelByPath(locationOptions, filterLocation.value),
                        storeCountText: filterLocation.value.length ? '1 个门店' : '当前门店'
                    };
                });

                const aiScopeCards = computed(() => ([
                    {
                        label: '分析窗口',
                        value: `未来 ${optimizationDays.value} 天`,
                        hint: '只支持 3 / 7 / 14 天三个分析窗口'
                    },
                    {
                        label: '分析订单上限',
                        value: `${optimizationScope.value.participating} / 50`,
                        hint: '超过 50 笔订单时，页面提示缩小门店或时间范围'
                    },
                    {
                        label: '候选车辆上限',
                        value: `${optimizationScope.value.vehicles} / 120`,
                        hint: '超过 120 辆候选车时，系统按相关性裁剪后再发起分析'
                    },
                    {
                        label: '返回结构',
                        value: 'JSON Schema',
                        hint: '模型返回后仍执行结构校验、候选池校验与硬约束复核'
                    }
                ]));

                const optimizationOverviewCards = computed(() => ([
                    {
                        label: '优化时间范围',
                        value: `未来 ${optimizationDays.value} 天`,
                        hint: '按预计取车时间进入本次优化窗口'
                    },
                    {
                        label: '参与优化订单数',
                        value: optimizationScope.value.participating,
                        hint: '未硬锁定、可参与本次全局重排'
                    },
                    {
                        label: '已预分配订单数',
                        value: optimizationScope.value.preassigned,
                        hint: '已有预分配车辆，可参与重新编排'
                    },
                    {
                        label: '待分配订单数',
                        value: optimizationScope.value.pending,
                        hint: '尚未分配车辆，将一并进入本次优化'
                    },
                    {
                        label: '已硬锁定订单数',
                        value: optimizationScope.value.locked,
                        hint: '仅展示，不参与本次优化',
                        tone: 'muted',
                        tag: '不参与',
                        tagType: 'info'
                    },
                    {
                        label: '涉及车辆数',
                        value: optimizationScope.value.vehicles,
                        hint: '参与本次预分配重排的可用车辆池'
                    }
                ]));

                const hasOptimizableOrders = computed(() => optimizationScope.value.participating > 0);

                const optimizationResultMetrics = computed(() => {
                    const base = optimizationResultBase[optimizationDays.value] || optimizationResultBase[7];
                    const manualProtected = base.manualProtected;
                    const changeReduction = base.changeReduction;
                    const adjusted = Math.max(0, base.adjustedBase - manualProtected - changeReduction);
                    const unchanged = Math.max(0, optimizationScope.value.participating - adjusted);
                    const idleReducedHours = Math.max(1, base.idleReducedHours - base.idleTradeoff);
                    const utilizationLift = Math.max(0.5, base.utilizationLift - base.utilizationTradeoff);
                    const manualReduction = Math.max(0, base.manualReduction - 1);
                    const afterAssignedRate = Math.max(
                        base.beforeAssignedRate + 1,
                        base.afterAssignedRate - 1.0 - 0.8
                    );
                    const afterFragments = base.afterFragments + 1;
                    const afterHighValueMismatch = base.afterHighValueMismatch + 1;
                    const afterManualPending = base.afterManualPending + 1;
                    return {
                        adjusted,
                        unchanged,
                        involvedVehicles: optimizationScope.value.vehicles,
                        idleReducedHours,
                        utilizationLift,
                        manualReduction,
                        beforeAssignedRate: base.beforeAssignedRate,
                        afterAssignedRate,
                        beforeFragments: base.beforeFragments,
                        afterFragments,
                        beforeHighValueMismatch: base.beforeHighValueMismatch,
                        afterHighValueMismatch,
                        beforeManualPending: base.beforeManualPending,
                        afterManualPending,
                        nearLock: base.nearLock,
                        unavailableVehicles: base.unavailableVehicles,
                        manualProtected
                    };
                });

                const optimizationResultCards = computed(() => ([
                    {
                        label: '参与优化订单数',
                        value: optimizationScope.value.participating,
                        delta: `${optimizationDays.value} 天窗口`,
                        hint: '仅统计未硬锁定订单',
                        cardClass: 'border-white bg-white shadow-sm',
                        valueClass: 'text-gray-800',
                        deltaClass: 'text-gray-400'
                    },
                    {
                        label: '被调整订单数',
                        value: `${optimizationResultMetrics.value.adjusted} 单`,
                        delta: '重点优化',
                        hint: '预分配车辆发生替换或重排',
                        cardClass: 'border-emerald-100 bg-emerald-50/70',
                        valueClass: 'text-emerald-600',
                        deltaClass: 'text-emerald-600'
                    },
                    {
                        label: '保持不变订单数',
                        value: `${optimizationResultMetrics.value.unchanged} 单`,
                        delta: '无需改动',
                        hint: '当前方案已较优或不满足调整条件',
                        cardClass: 'border-white bg-white shadow-sm',
                        valueClass: 'text-gray-800',
                        deltaClass: 'text-gray-400'
                    },
                    {
                        label: '涉及车辆数',
                        value: `${optimizationResultMetrics.value.involvedVehicles} 辆`,
                        delta: '全局重排',
                        hint: '参与本次预分配优化的车辆池',
                        cardClass: 'border-white bg-white shadow-sm',
                        valueClass: 'text-gray-800',
                        deltaClass: 'text-gray-400'
                    },
                    {
                        label: '预计减少闲置时长',
                        value: `-${optimizationResultMetrics.value.idleReducedHours}h`,
                        delta: '闲置下降',
                        hint: '通过连续排布与错峰接续减少空档',
                        cardClass: 'border-blue-100 bg-blue-50/70',
                        valueClass: 'text-blue-600',
                        deltaClass: 'text-blue-600'
                    },
                    {
                        label: '预计提升车辆利用率',
                        value: `+${optimizationResultMetrics.value.utilizationLift.toFixed(1)}%`,
                        delta: '利用率提升',
                        hint: '兼顾高价值订单与全局利用效率',
                        cardClass: 'border-purple-100 bg-purple-50/70',
                        valueClass: 'text-purple-600',
                        deltaClass: 'text-purple-600'
                    }
                ]));

                const optimizationChangeRows = computed(() => {
                    const candidateKeepThreshold = 4;

                    return optimizationChangeBaseRows.map(row => {
                        if (row.category === 'candidate') {
                            const shouldKeep = row.priority > candidateKeepThreshold;
                            if (shouldKeep) {
                            return {
                                ...row,
                                afterVehicle: row.beforeVehicle,
                                reason: row.reasonStable,
                                status: '保持原车'
                            };
                            }
                            return {
                                ...row,
                                afterVehicle: row.optimizedVehicle,
                                reason: row.reasonOptimized,
                                status: '已优化'
                            };
                        }

                        if (row.category === 'manual') {
                            return {
                                ...row,
                                afterVehicle: row.beforeVehicle,
                                reason: row.reasonStable,
                                status: '未纳入'
                            };
                        }

                        if (row.category === 'near_lock') {
                            return {
                                ...row,
                                afterVehicle: row.beforeVehicle,
                                reason: row.reasonStable,
                                status: '未纳入'
                            };
                        }


                    });
                });

                const optimizationAdjustedCount = computed(() => optimizationResultMetrics.value.adjusted);

                // Helpers
                const isToday = (date) => date.isSame(dayjs(), 'day');

                const getStatusType = (status) => {
                    if (status === 'rented') return 'primary';
                    if (status === 'maintenance') return 'info';
                    return 'success';
                };

                const getDispatchStatusText = (status) => {
                    const map = {
                        pre_assigned: '预分配',
                        locked: '已硬锁',
                        manual_reassigned: '人工改派',
                        upgraded: '免费升等',
                        pending: '待派车'
                    };
                    return map[status] || '待派车';
                };

                const getDispatchStatusShortText = (status) => {
                    const map = {
                        pre_assigned: '预',
                        locked: '锁',
                        manual_reassigned: '改',
                        upgraded: '升',
                        pending: '待'
                    };
                    return map[status] || '待';
                };

                const getDispatchBadgeClass = (status) => {
                    const map = {
                        pre_assigned: 'bg-amber-50 text-amber-700 border-amber-300',
                        locked: 'bg-emerald-50 text-emerald-700 border-emerald-300',
                        manual_reassigned: 'bg-orange-50 text-orange-700 border-orange-300',
                        upgraded: 'bg-purple-50 text-purple-700 border-purple-300',
                        pending: 'bg-slate-50 text-slate-600 border-slate-300'
                    };
                    return map[status] || map.pending;
                };

                const getDispatchTagType = (status) => {
                    if (status === 'locked') return 'success';
                    if (status === 'pre_assigned') return 'warning';
                    if (status === 'manual_reassigned') return 'warning';
                    if (status === 'upgraded') return 'primary';
                    return 'info';
                };

                const getOrdersForDay = (vehicle, day) => {
                    return orders.value.filter(o => o.vehicleId === vehicle.id).filter(o => {
                        const start = dayjs(o.startTime);
                        const end = dayjs(o.endTime);
                        // Check overlap
                        return (start.isSame(day, 'day') || end.isSame(day, 'day')) ||
                            (start.isBefore(day, 'day') && end.isAfter(day, 'day'));
                    });
                };

                const isOrderEnd = (order, day) => {
                    return dayjs(order.endTime).isSame(day, 'day');
                };

                const getOrderClass = (order, day) => {
                    // Base styling
                    let classes = [];
                    const isStart = dayjs(order.startTime).isSame(day, 'day');
                    const isEnd = isOrderEnd(order, day);

                    // Status Colors
                    if (order.status === '用车中') {
                        classes.push('bg-green-100 text-green-800 border-green-500');
                    } else {
                        classes.push('bg-blue-100 text-blue-800 border-blue-500');
                    }

                    // Border Logic: Only show left colored border on start day
                    if (isStart) {
                        classes.push('border-l-4');
                    }
                    if (isEnd) {
                        classes.push('border-r-4 text-right');
                    }

                    return classes.join(' ');
                };

                const getOrderTimeText = (order, day) => {
                    const start = dayjs(order.startTime);
                    const end = dayjs(order.endTime);

                    // In month view, simplify text
                    if (viewMode.value === 'month') {
                        if (start.isSame(day, 'day')) return '取';
                        if (end.isSame(day, 'day')) return '还';
                        return '';
                    }

                    if (start.isSame(day, 'day')) return `${start.format('HH:mm')} 取`;
                    if (end.isSame(day, 'day')) return `${end.format('HH:mm')} 还`;
                    return '全天占用';
                };

                // Actions
                const openOrderDrawer = (order) => {
                    selectedOrder.value = { ...order, vehiclePlate: vehicles.find(v => v.id === order.vehicleId)?.plate };
                    drawerVisible.value = true;
                };

                const openVehicleDrawer = (vehicle) => {
                    selectedVehicle.value = vehicle;
                    vehicleDrawerVisible.value = true;
                };

                const getVehicleOrders = (vehicleId) => {
                    return orders.value.filter(o => o.vehicleId === vehicleId).sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
                };

                const getVehiclePlate = (vid) => {
                    return vehicles.find(v => v.id === vid)?.plate || '未知车辆';
                };

                const openDatePanel = (day) => {
                    selectedDate.value = day;
                    // Filter orders logic
                    const pickups = orders.value.filter(o => dayjs(o.startTime).isSame(day, 'day'));
                    const returns = orders.value.filter(o => dayjs(o.endTime).isSame(day, 'day'));
                    dailyOrders.value = { pickup: pickups, return: returns };

                    dailyOpsVisible.value = true;
                };

                const showReassignDialog = () => {
                    newVehicleId.value = '';
                    reassignVisible.value = true;
                };

                const confirmReassign = () => {
                    ElMessage.info('将打开与订单详情页一致的改派窗口');
                    reassignVisible.value = false;
                    drawerVisible.value = false;
                    goToDetail();
                };

                const goToDetail = () => {
                    router.push('/operation/order-detail');
                };

                const clearOptimizationTimers = () => {
                    optimizationTimers.forEach(timer => clearTimeout(timer));
                    optimizationTimers = [];
                    calculationStage.value = 1;
                };

                const handleStrategyClose = (done) => {
                    if (isCalculating.value) return;
                    clearOptimizationTimers();
                    done();
                };

                const closeStrategyConfig = () => {
                    if (isCalculating.value) return;
                    clearOptimizationTimers();
                    strategyConfigVisible.value = false;
                };

                const openStrategyConfig = () => {
                    clearOptimizationTimers();
                    isCalculating.value = false;
                    strategyConfigVisible.value = true;
                };

                const runOptimization = () => {
                    if (!hasOptimizableOrders.value) return;
                    isCalculating.value = true;
                    calculationStage.value = 1;
                    clearOptimizationTimers();
                    calculationStage.value = 1;

                    optimizationTimers = [
                        setTimeout(() => {
                            calculationStage.value = 2;
                        }, 700),
                        setTimeout(() => {
                            calculationStage.value = 3;
                        }, 1500),
                        setTimeout(() => {
                            isCalculating.value = false;
                            strategyConfigVisible.value = false;
                            smartDispatchVisible.value = true; // Open Result Modal
                            ElMessage.success('优化方案已生成，请确认后应用。');
                            clearOptimizationTimers();
                        }, 2300)
                    ];
                };

                const applySmartDispatch = () => {
                    ElMessage.success(`已应用通过校验的优化结果，更新 ${optimizationResultMetrics.value.adjusted} 笔订单预分配。`);
                    smartDispatchVisible.value = false;
                };

                const openAiDispatchAnalysis = () => {
                    if (!aiModelConfigured.value) {
                        ElMessage.warning('当前租户未完成 AI 模型配置');
                        return;
                    }
                    aiDispatchVisible.value = true;
                };

                const applyAiDispatchRecommendations = () => {
                    ElMessage.success(`已应用通过系统校验的 AI 推荐，更新 ${aiApplicableCount.value} 笔订单预分配。`);
                    aiDispatchVisible.value = false;
                };

                const closeSmartDispatch = () => {
                    smartDispatchVisible.value = false;
                };

                const getOptimizationStatusType = (status) => {
                    if (status === '已优化') return 'success';
                    if (status === '未纳入') return 'warning';
                    if (status === '保持原车') return 'info';
                    return '';
                };

                const getOptimizationRiskType = (risk) => {
                    if (risk === '高') return 'danger';
                    if (risk === '中') return 'warning';
                    return 'success';
                };

                const getAiRiskType = (risk) => {
                    if (risk === 'high') return 'danger';
                    if (risk === 'medium') return 'warning';
                    return 'success';
                };

                const getAiConfidenceType = (confidence) => {
                    if (confidence === 'high') return 'success';
                    if (confidence === 'medium') return 'warning';
                    return 'info';
                };

                onBeforeUnmount(() => {
                    clearOptimizationTimers();
                });
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
            border-radius: 3px;
        }

        .gantt-grid {
            display: grid;
            /* Fixed 1st col, 7 Days min 140px */
            grid-template-columns: 250px repeat(7, minmax(140px, 1fr));
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            width: max-content;
            /* Force grid to take required space, triggering parent scroll */
            min-width: 100%;
        }

        .gantt-cell {
            border-right: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            min-height: 50px;
            position: relative;
        }

        .gantt-header {
            background-color: #f8fafc;
            font-weight: 600;
            color: #64748b;
            text-align: center;
            padding: 8px;
            font-size: 0.875rem;
        }

        :deep([v-cloak]) {
            display: none;
        }
</style>
