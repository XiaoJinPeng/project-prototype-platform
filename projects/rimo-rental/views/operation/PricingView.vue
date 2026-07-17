<template>
<main class="pricing-page">
                <!-- Page Header -->
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">动态调价策略</h1>
                        <p class="text-gray-500 text-sm mt-1">设定各车组的标准租金，管理门市与分时业务的差异化定价策略。</p>
                    </div>
                </div>

                <!-- Tabs Container -->
                <el-tabs v-model="activeTab"
                    class="app-page-tabs bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">

                    <!-- TAB 1: 门市租赁 -->
                    <el-tab-pane name="STORE">
                        <template #label>
                            <span class="flex items-center gap-2">
                                <el-icon>
                                    <Shop />
                                </el-icon>
                                <span>门市租赁</span>
                            </span>
                        </template>
                        <div class="p-6">
                            <!-- Pricing Table Card -->
                            <div class="bg-white rounded-xl border p-6 pricing-card">
                                <div class="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
                                    <div class="flex items-center gap-4">
                                        <div>
                                            <h3 class="font-bold text-gray-800 text-lg">门市标准价</h3>
                                        </div>
                                        <el-tag v-if="isLocked" type="info" size="small" effect="plain"><el-icon
                                                class="mr-1">
                                                <Lock />
                                            </el-icon>已锁定</el-tag>
                                    </div>

                                    <div class="flex items-center gap-4">
                                        <!-- Lock Controls -->
                                        <div v-if="isLocked">
                                            <el-button type="primary" plain @click="unlockPricing">
                                                <el-icon class="mr-1">
                                                    <Lock />
                                                </el-icon> 解锁编辑
                                            </el-button>
                                        </div>
                                        <div v-else class="flex items-center gap-2">
                                            <el-button @click="cancelEdit">取消</el-button>
                                            <el-button type="primary" @click="savePricing">
                                                <el-icon class="mr-1">
                                                    <Check />
                                                </el-icon> 保存
                                            </el-button>
                                        </div>
                                    </div>
                                </div>

                                <div class="mb-5 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 flex items-center justify-between gap-4">
                                    <div>
                                        当前标准价版本：<span class="font-mono font-bold cursor-pointer underline decoration-dotted"
                                            @click="openPriceVersion(storePriceVersions[0])">PRICE-STORE-20260418-001</span>。新订单按当前版本写入订单计费快照，历史订单继续按下单时版本结算。
                                    </div>
                                    <el-button size="small" type="primary" link @click="openPriceVersion()">历史版本</el-button>
                                </div>

                                <!-- Store Pricing Table (Classic Style) -->
                                <el-table :data="vehicleGroups" stripe style="width: 100%">
                                    <el-table-column label="车组名称" min-width="200">
                                        <template #default="scope">
                                            <div>
                                                <div class="font-bold text-gray-800">{{ scope.row.name }}</div>
                                                <div class="text-xs text-gray-500 mt-1">{{ scope.row.models }}</div>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="价格版本" width="180" align="center">
                                        <template #default="scope">
                                            <el-tag size="small" type="primary" effect="plain" class="cursor-pointer"
                                                @click="openPriceVersion(storePriceVersions[0])">PRICE-STORE-20260418-001</el-tag>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="标准日租金 (元/天)" align="center">
                                        <template #default="scope">
                                            <div v-if="isLocked" class="font-bold text-gray-700 font-mono">
                                                ¥{{ scope.row.dailyPrice }}
                                            </div>
                                            <div v-else class="flex items-center justify-center gap-2">
                                                <el-input-number v-model="scope.row.dailyPrice" :min="0" :step="10"
                                                    size="default" style="width: 140px"
                                                    @change="handlePriceChange(scope.row)"></el-input-number>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="上次更新" width="180" align="center">
                                        <template #default="scope">
                                            <span class="text-gray-500 text-sm">{{ scope.row.lastUpdated }}</span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>

                            <!-- Scheduled Plans -->
                            <div class="mt-8">
                                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                    <h4 class="font-bold text-gray-800 text-sm mb-3">调价说明：</h4>
                                    <div class="flex items-start gap-3">
                                        <el-icon class="text-blue-500 text-lg mt-0.5">
                                            <InfoFilled />
                                        </el-icon>
                                        <div class="text-sm text-gray-600 space-y-2">
                                            <p><span class="font-bold text-gray-800">新订单执行：</span>
                                                调价计划生效后，所有新创建的订单将立即按照新设定的价格执行。</p>
                                            <p><span
                                                    class="font-bold text-gray-800">已预约订单：</span>在此之前已预约及用车中未结算的订单，<span
                                                    class="text-orange-600 font-medium">不受调价影响</span>，继续按原预约时的锁定价格结算。
                                            </p>
                                            <p><span class="font-bold text-gray-800">版本追溯：</span>
                                                手动保存或调价计划执行后生成新的标准价版本，订单详情可查看下单时命中的版本。</p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center mb-2">
                                    <h3 class="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                        <el-icon class="text-blue-600">
                                            <Clock />
                                        </el-icon> 定时调价计划 <el-tag type="info" size="small" effect="plain">自动化</el-tag>
                                    </h3>
                                    <el-button type="primary" plain @click="openScheduleDialog">
                                        <el-icon class="mr-1">
                                            <Plus />
                                        </el-icon> 新增计划
                                    </el-button>
                                </div>

                                <p class="text-xs text-gray-400 pl-1 mb-4 flex items-center gap-1">
                                    <el-icon>
                                        <WarningFilled />
                                    </el-icon> 提示：定时调价用于统一调整车组标准价，仅影响生效时间后的新建订单。
                                </p>
                                <div v-if="scheduledList.length === 0"
                                    class="text-center py-8 text-gray-400 border border-dashed rounded-lg bg-gray-50">
                                    暂无定时调价计划
                                </div>
                                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div v-for="(item, index) in scheduledList" :key="index"
                                        class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
                                        <div class="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                                        <div class="flex items-center justify-between pl-2">
                                            <div class="flex items-center gap-4">
                                                <div
                                                    class="flex flex-col items-center justify-center bg-blue-50 text-blue-600 rounded-lg w-14 h-14">
                                                    <el-icon class="text-xl mb-1">
                                                        <Calendar />
                                                    </el-icon>
                                                    <span class="text-xs font-bold">计划</span>
                                                </div>
                                                <div>
                                                    <div class="flex items-center gap-2 mb-1">
                                                        <span class="text-gray-900 font-bold text-lg">{{
                                                            item.effectiveTime }}</span>
                                                        <el-tag size="small" effect="dark"
                                                            :type="getStatusType(item.status)">{{ item.status
                                                            }}</el-tag>
                                                    </div>
                                                    <p class="text-gray-500 text-sm">{{ item.summary }}</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <el-button type="primary" link size="small"
                                                    @click="viewSchedule(item)">查看详情</el-button>
                                                <el-button v-if="item.status === '待执行'" type="danger" plain size="small"
                                                    @click="cancelSchedule(index)">取消计划</el-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>

                    <!-- TAB 2: 分时租车 -->
                    <el-tab-pane name="SHARING">
                        <template #label>
                            <span class="flex items-center gap-2">
                                <el-icon>
                                    <Clock />
                                </el-icon>
                                <span>分时租赁</span>
                            </span>
                        </template>
                        <div class="p-6">
                            <div class="bg-white rounded-xl border p-6 pricing-card">
                                <div class="flex items-center justify-between mb-5 border-b border-gray-100 pb-4">
                                    <div class="flex items-center gap-4">
                                        <div>
                                            <h3 class="font-bold text-gray-800 text-lg">分时标准价</h3>
                                        </div>
                                        <el-tag v-if="isSharingLocked" type="info" size="small" effect="plain"><el-icon
                                                class="mr-1">
                                                <Lock />
                                            </el-icon>已锁定</el-tag>
                                    </div>

                                    <div class="flex items-center gap-4">
                                        <!-- Lock Controls -->
                                        <div v-if="isSharingLocked">
                                            <el-button type="primary" plain @click="isSharingLocked = false">
                                                <el-icon class="mr-1">
                                                    <Lock />
                                                </el-icon> 解锁编辑
                                            </el-button>
                                        </div>
                                        <div v-else class="flex items-center gap-2">
                                            <el-button @click="cancelSharingEdit">取消</el-button>
                                            <el-button type="primary" @click="saveChanges">保存</el-button>
                                            <el-input-number v-model="sharingBatchMsg" size="small" style="width: 70px" :controls="false" placeholder="%"></el-input-number>
                                                    <span class="text-xs text-gray-400">%</span>
                                                    <el-button size="small" type="primary" plain
                                                        @click="applySharingBatch">
                                                        <el-icon class="mr-1">
                                                            <ArrowUp />
                                                        </el-icon> 应用
                                                    </el-button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Sharing Pricing Table (4 Columns) -->
                                <el-table :data="sharingGroups" stripe style="width: 100%">
                                    <el-table-column label="车组信息" min-width="180" fixed>
                                        <template #default="scope">
                                            <div class="py-2">
                                                <div class="font-bold text-gray-800">{{ scope.row.name }}</div>
                                                <div class="text-xs text-gray-400 mt-0.5">{{ scope.row.models }}
                                                </div>
                                            </div>
                                        </template>
                                    </el-table-column>

                                    <el-table-column label="同站租还 (元)" align="center"
                                        v-if="hasPermission('SHARING_ROUND')">
                                        <el-table-column label="时租金" width="130" align="center">
                                            <template #default="scope">
                                                <el-input-number v-model="scope.row.sameStationHourly" :min="0"
                                                    :step="1" :disabled="isSharingLocked" size="small"
                                                    style="width: 100px"
                                                    @change="markSharingModified"></el-input-number>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="日封顶" width="130" align="center">
                                            <template #default="scope">
                                                <el-input-number v-model="scope.row.sameStationDaily" :min="0"
                                                    :step="10" :disabled="isSharingLocked" size="small"
                                                    style="width: 100px"
                                                    @change="markSharingModified"></el-input-number>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="上次更新" width="120" align="center">
                                            <template #default="scope">
                                                <span class="text-gray-400 text-xs">{{
                                                    scope.row.lastUpdatedSameStation
                                                    }}</span>
                                            </template>
                                        </el-table-column>
                                    </el-table-column>

                                    <el-table-column label="甲租乙还 (异地) (元)" align="center"
                                        v-if="hasPermission('SHARING_ONEWAY')">
                                        <el-table-column label="时租金" width="130" align="center">
                                            <template #default="scope">
                                                <el-input-number v-model="scope.row.oneWayHourly" :min="0" :step="1"
                                                    :disabled="isSharingLocked" size="small" style="width: 100px"
                                                    @change="markSharingModified"></el-input-number>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="日封顶" width="130" align="center">
                                            <template #default="scope">
                                                <el-input-number v-model="scope.row.oneWayDaily" :min="0" :step="10"
                                                    :disabled="isSharingLocked" size="small" style="width: 100px"
                                                    @change="markSharingModified"></el-input-number>
                                            </template>
                                        </el-table-column>
                                        <el-table-column label="上次更新" width="120" align="center">
                                            <template #default="scope">
                                                <span class="text-gray-400 text-xs">{{ scope.row.lastUpdatedOneWay
                                                    }}</span>
                                            </template>
                                        </el-table-column>
                                    </el-table-column>


                                </el-table>
                            </div>

                            <!-- Sharing Schedule -->
                            <div class="mt-8">
                                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                                    <h4 class="font-bold text-gray-800 text-sm mb-3">调价说明：</h4>
                                    <div class="flex items-start gap-3">
                                        <el-icon class="text-blue-500 text-lg mt-0.5">
                                            <InfoFilled />
                                        </el-icon>
                                        <div class="text-sm text-gray-600 space-y-2">
                                            <p><span class="font-bold text-gray-800">新订单执行：</span>
                                                调价计划生效后，所有新创建的订单将立即按照新设定的价格执行。</p>
                                            <p><span
                                                    class="font-bold text-gray-800">已预约订单：</span>在此之前已预约及用车中未结算的订单，<span
                                                    class="text-orange-600 font-medium">不受调价影响</span>，继续按原预约时的锁定价格结算。
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center mb-2">
                                    <h3 class="font-bold text-gray-800 flex items-center gap-2 text-lg">
                                        <el-icon class="text-blue-600">
                                            <Clock />
                                        </el-icon> 定时调价计划 <el-tag type="info" size="small" effect="plain">自动化</el-tag>
                                    </h3>
                                    <el-button type="primary" plain @click="openSharingScheduleDialog">
                                        <el-icon class="mr-1">
                                            <Clock />
                                        </el-icon> 新增计划
                                    </el-button>
                                </div>

                                <p class="text-xs text-gray-400 pl-1 mb-4 flex items-center gap-1">
                                    <el-icon>
                                        <WarningFilled />
                                    </el-icon> 提示：定时调价用于统一调整车组标准价，仅影响生效时间后的新建订单。
                                </p>

                                <div v-if="sharingScheduledList.length === 0"
                                    class="flex flex-col items-center justify-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                                    <el-icon class="text-gray-300 text-4xl mb-3">
                                        <Calendar />
                                    </el-icon>
                                    <p class="text-gray-400 font-medium">暂无分时调价计划</p>
                                </div>
                                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div v-for="(item, idx) in sharingScheduledList" :key="idx"
                                        class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-green-300 transition-colors">
                                        <div class="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                                        <div class="flex items-center justify-between pl-2">
                                            <div class="flex items-center gap-4">
                                                <div
                                                    class="flex flex-col items-center justify-center bg-green-50 text-green-600 rounded-lg w-14 h-14">
                                                    <el-icon class="text-xl mb-1">
                                                        <Clock />
                                                    </el-icon>
                                                    <span class="text-xs font-bold">计划</span>
                                                </div>
                                                <div>
                                                    <div class="flex items-center gap-2 mb-1">
                                                        <span class="text-gray-900 font-bold text-lg">{{
                                                            item.effectiveTime }}</span>
                                                        <el-tag size="small" effect="dark"
                                                            :type="getStatusType(item.status)">{{ item.status
                                                            }}</el-tag>
                                                        <el-tag size="small" type="warning" effect="plain"
                                                            v-if="item.type === 'SAME_STATION'">同站调价</el-tag>
                                                        <el-tag size="small" type="danger" effect="plain"
                                                            v-if="item.type === 'ONE_WAY'">异地调价</el-tag>
                                                    </div>
                                                    <p class="text-gray-500 text-sm">{{ item.summary }}</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <el-button type="primary" link size="small"
                                                    @click="viewSharingSchedule(item)">查看详情</el-button>
                                                <el-button v-if="item.status === '待执行'" type="danger" plain size="small"
                                                    @click="cancelSharingSchedule(idx)">取消计划</el-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </main>


<el-dialog v-model="scheduleDialogVisible" title="新增门市调价计划" width="700px" destroy-on-close>
                <div class="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-start gap-2 mb-4">
                    <el-icon class="text-orange-500 mt-0.5">
                        <WarningFilled />
                    </el-icon>
                    <div class="text-xs text-orange-800 leading-relaxed">
                        到达设定的<b>生效时间</b>时，系统将自动更新价格。请确保时间准确。
                    </div>
                </div>
                <el-form label-position="top">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="生效时间" required>
                                <el-date-picker v-model="scheduleForm.effectiveTime" type="datetime"
                                    placeholder="请选择生效时间" format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm:ss"
                                    :disabled-date="disabledDate" style="width: 100%"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="计划摘要" required>
                                <el-input v-model="scheduleForm.summary" placeholder="例如：五一假期涨价"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <div class="mt-2">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-gray-700 text-sm">价格配置预览</span>
                        <el-button size="small" type="primary" link @click="batchSetNewPrice">
                            <el-icon class="mr-1">
                                <ArrowUp />
                            </el-icon> 批量上调 10%
                        </el-button>
                    </div>
                    <el-table :data="scheduleForm.prices" height="300" border size="small" stripe>
                        <el-table-column prop="name" label="车组名称" min-width="160"></el-table-column>
                        <el-table-column label="当前价格" width="100" align="right">
                            <template #default="scope"><span class="text-gray-500">{{ scope.row.currentPrice
                                    }}</span></template>
                        </el-table-column>
                        <el-table-column label="生效后新价格" width="160" align="center">
                            <template #default="scope">
                                <div class="flex items-center justify-center gap-2">
                                    <el-input-number v-model="scope.row.newPrice" :min="0" :step="10" size="small"
                                        style="width: 100px" controls-position="right"></el-input-number>
                                    <el-icon v-if="scope.row.newPrice !== scope.row.currentPrice"
                                        class="text-orange-500">
                                        <EditPen />
                                    </el-icon>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="scheduleDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="confirmSchedule"
                            :disabled="!scheduleForm.effectiveTime">确认创建</el-button>
                    </span>
                </template>
            </el-dialog>

<el-dialog v-model="viewDialogVisible" title="门市调价计划详情" width="600px">
                <div v-if="currentViewPlan" class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                        <div>
                            <div class="text-xs text-gray-400 mb-1">计划状态</div><el-tag
                                :type="getStatusType(currentViewPlan.status)">{{ currentViewPlan.status }}</el-tag>
                        </div>
                        <div>
                            <div class="text-xs text-gray-400 mb-1">生效时间</div>
                            <div class="font-bold text-gray-800">{{ currentViewPlan.effectiveTime }}</div>
                        </div>
                        <div class="col-span-2">
                            <div class="text-xs text-gray-400 mb-1">计划摘要</div>
                            <div class="text-sm text-gray-600">{{ currentViewPlan.summary }}</div>
                        </div>
                    </div>
                    <div>
                        <div class="font-bold text-gray-700 text-sm mb-2">价格调整明细</div>
                        <el-table :data="currentViewPlan.changes" height="300" border size="small" stripe>
                            <el-table-column prop="name" label="车组名称" min-width="160"></el-table-column>
                            <el-table-column label="原价格" width="100" align="right"><template #default="scope">{{
                                    scope.row.currentPrice }}</template></el-table-column>
                            <el-table-column label="新价格" width="120" align="center"><template #default="scope"><span
                                        class="font-bold text-orange-600">{{ scope.row.newPrice
                                        }}</span></template></el-table-column>
                            <el-table-column label="变动" width="100" align="center"><template #default="scope"><span
                                        :class="getDiffClass(scope.row)">{{ getDiffText(scope.row)
                                        }}</span></template></el-table-column>
                        </el-table>
                    </div>
                </div>
            </el-dialog>

<el-dialog v-model="priceVersionDialogVisible" title="门市标准价历史版本" width="860px" destroy-on-close>
                <div class="grid grid-cols-3 gap-4" v-if="selectedPriceVersion">
                    <div class="col-span-1 border border-gray-100 rounded-lg overflow-hidden">
                        <div class="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">版本列表</div>
                        <div class="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                            <button v-for="version in storePriceVersions" :key="version.version"
                                class="w-full text-left px-3 py-3 hover:bg-indigo-50 transition-colors"
                                :class="selectedPriceVersion.version === version.version ? 'bg-indigo-50' : 'bg-white'"
                                @click="selectedPriceVersion = version">
                                <div class="font-mono text-xs text-indigo-600 font-bold">{{ version.version }}</div>
                                <div class="text-sm text-gray-800 mt-1">{{ version.title }}</div>
                                <div class="text-xs text-gray-400 mt-1">{{ version.savedAt }} · {{ version.source }}</div>
                            </button>
                        </div>
                    </div>
                    <div class="col-span-2 space-y-4">
                        <div class="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                            <div class="font-mono font-bold text-gray-900">{{ selectedPriceVersion.version }}</div>
                            <div class="text-sm text-gray-700 mt-1">{{ selectedPriceVersion.title }}</div>
                            <div class="text-xs text-gray-500 mt-1">保存人：{{ selectedPriceVersion.savedBy }} · {{ selectedPriceVersion.savedAt }}</div>
                        </div>
                        <el-table :data="selectedPriceVersion.values" border size="small">
                            <el-table-column label="车组名称" min-width="170">
                                <template #default="scope">
                                    <div class="font-bold text-gray-800">{{ scope.row.group }}</div>
                                    <div class="text-xs text-gray-500 mt-1">{{ scope.row.models }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="dailyPrice" label="标准日租金 (元/天)" width="150" align="center"></el-table-column>
                            <el-table-column prop="mileage" label="里程规则" min-width="220"></el-table-column>
                            <el-table-column prop="lastUpdated" label="上次更新" width="110" align="center"></el-table-column>
                        </el-table>
                    </div>
                </div>
                <template #footer>
                    <el-button @click="priceVersionDialogVisible = false">关闭</el-button>
                </template>
            </el-dialog>

<el-dialog v-model="sharingScheduleDialogVisible"
                :title="'新增分时调价计划 - ' + (sharingScheduleForm.type === 'SAME_STATION' ? '同站租还' : '异地租还')" width="700px">
                <el-form label-position="top">
                    <el-form-item label="调价类型">
                        <el-radio-group v-model="sharingScheduleForm.type" @change="resetSharingSchedulePrices">
                            <el-radio-button label="SAME_STATION">同站租还</el-radio-button>
                            <el-radio-button label="ONE_WAY">异地租还 (甲租乙还)</el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="生效时间" required>
                                <el-date-picker v-model="sharingScheduleForm.effectiveTime" type="datetime"
                                    placeholder="选择时间" value-format="YYYY-MM-DD HH:mm:ss" :disabled-date="disabledDate"
                                    class="w-full"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="计划摘要" required>
                                <el-input v-model="sharingScheduleForm.summary" placeholder="例如：节日价格调整"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>

                <div class="mt-2">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-bold text-gray-700 text-sm">价格配置预览</span>
                        <el-button size="small" type="primary" link @click="batchSetSharingNewPrice">
                            <el-icon class="mr-1">
                                <ArrowUp />
                            </el-icon> 批量上调 10%
                        </el-button>
                    </div>

                    <el-table :data="sharingScheduleForm.items" size="small" border height="300" stripe>
                        <el-table-column prop="name" label="车组" min-width="140" fixed></el-table-column>

                        <!-- Dynamic Columns based on Type -->
                        <template v-if="sharingScheduleForm.type === 'SAME_STATION'">
                            <el-table-column label="现有价格 (时/日)" align="center" width="140">
                                <template #default="{row}">
                                    <span class="text-gray-400">{{ row.sameStationHourly }} / {{ row.sameStationDaily
                                        }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="新价格 (时/日)" align="center" width="220">
                                <template #default="{row}">
                                    <div class="flex gap-2 justify-center">
                                        <el-input-number v-model="row.newSameStationHourly" size="small"
                                            :controls="false" class="!w-[70px]" placeholder="时"></el-input-number>
                                        <el-input-number v-model="row.newSameStationDaily" size="small"
                                            :controls="false" class="!w-[70px]" placeholder="日"></el-input-number>
                                        <el-icon
                                            v-if="row.newSameStationHourly !== row.sameStationHourly || row.newSameStationDaily !== row.sameStationDaily"
                                            class="text-orange-500 mt-1">
                                            <EditPen />
                                        </el-icon>
                                    </div>
                                </template>
                            </el-table-column>
                        </template>

                        <template v-else>
                            <el-table-column label="现有价格 (时/日)" align="center" width="140">
                                <template #default="{row}">
                                    <span class="text-gray-400">{{ row.oneWayHourly }} / {{ row.oneWayDaily }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="新价格 (时/日)" align="center" width="220">
                                <template #default="{row}">
                                    <div class="flex gap-2 justify-center">
                                        <el-input-number v-model="row.newOneWayHourly" size="small" :controls="false"
                                            class="!w-[70px]" placeholder="时"></el-input-number>
                                        <el-input-number v-model="row.newOneWayDaily" size="small" :controls="false"
                                            class="!w-[70px]" placeholder="日"></el-input-number>
                                        <el-icon
                                            v-if="row.newOneWayHourly !== row.oneWayHourly || row.newOneWayDaily !== row.oneWayDaily"
                                            class="text-orange-500 mt-1">
                                            <EditPen />
                                        </el-icon>
                                    </div>
                                </template>
                            </el-table-column>
                        </template>
                    </el-table>
                </div>
                <template #footer>
                    <el-button @click="sharingScheduleDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="confirmSharingSchedule"
                        :disabled="!sharingScheduleForm.effectiveTime">创建计划</el-button>
                </template>
            </el-dialog>

<el-dialog v-model="sharingViewDialogVisible" title="分时调价计划详情" width="600px">
                <div v-if="currentSharingViewPlan" class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="font-bold text-lg text-gray-800">{{ currentSharingViewPlan.effectiveTime }}
                                </div>
                                <div class="text-sm text-gray-500 mt-1">{{ currentSharingViewPlan.summary }}</div>
                            </div>
                            <div class="flex flex-col items-end gap-2">
                                <el-tag :type="getStatusType(currentSharingViewPlan.status)">{{
                                    currentSharingViewPlan.status }}</el-tag>
                                <el-tag size="small" type="warning" effect="plain"
                                    v-if="currentSharingViewPlan.type === 'SAME_STATION'">同站</el-tag>
                                <el-tag size="small" type="danger" effect="plain" v-else>异地</el-tag>
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-t border-gray-100">
                            <div class="text-xs text-gray-400 mb-1">计划摘要</div>
                            <div class="text-sm text-gray-600">{{ currentSharingViewPlan.summary }}</div>
                        </div>
                    </div>
                </div>
                <el-table :data="currentSharingViewPlan.changes" border size="small" stripe height="300">
                    <el-table-column prop="name" label="车组" min-width="140"></el-table-column>
                    <template v-if="currentSharingViewPlan.type === 'SAME_STATION'">
                        <el-table-column label="原价 (时/日)" align="center"><template #default="{row}">{{
                                row.sameStationHourly }}/{{ row.sameStationDaily }}</template></el-table-column>
                        <el-table-column label="新价 (时/日)" align="center"><template #default="{row}"><span
                                    class="font-bold text-orange-600">{{ row.newSameStationHourly }}/{{
                                    row.newSameStationDaily }}</span></template></el-table-column>
                    </template>
                    <template v-else>
                        <el-table-column label="原价 (时/日)" align="center"><template #default="{row}">{{
                                row.oneWayHourly }}/{{ row.oneWayDaily }}</template></el-table-column>
                        <el-table-column label="新价 (时/日)" align="center"><template #default="{row}"><span
                                    class="font-bold text-orange-600">{{ row.newOneWayHourly }}/{{
                                    row.newOneWayDaily }}</span></template></el-table-column>
                    </template>
                </el-table>
</el-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
  name: 'PricingView',
  setup() {
                // Shared State
                const activeTab = ref('STORE');
                const isModified = ref(false);

                // --- Permissions Simulation ---
                const currentTenant = ref({
                    name: 'Full License (演示租户)',
                    permissions: ['STORE', 'SHARING', 'SHARING_ROUND', 'SHARING_ONEWAY']
                });
                const currentTenantName = computed(() => currentTenant.value.name);

                const hasPermission = (perm) => {
                    return currentTenant.value.permissions.includes(perm);
                };

                const switchTenant = (type) => {
                    if (type === 'full') {
                        currentTenant.value = {
                            name: 'Full License (演示租户)',
                            permissions: ['STORE', 'SHARING', 'SHARING_ROUND', 'SHARING_ONEWAY']
                        };
                    } else if (type === 'sharing_round_only') {
                        currentTenant.value = {
                            name: '仅同站租还',
                            permissions: ['STORE', 'SHARING', 'SHARING_ROUND']
                        };
                    } else if (type === 'sharing_oneway_only') {
                        currentTenant.value = {
                            name: '仅甲租乙还',
                            permissions: ['STORE', 'SHARING', 'SHARING_ONEWAY']
                        };
                    }
                };

                // --- Store Pricing State ---
                const vehicleGroups = reactive([
                    { id: 1, name: '经济型轿车', models: 'Toyota Corolla, Honda Civic 等', dailyPrice: 280, originalPrice: 280, lastUpdated: '2025-10-01' },
                    { id: 2, name: 'SUV组', models: 'Toyota RAV4, Honda CR-V 等', dailyPrice: 450, originalPrice: 450, lastUpdated: '2025-09-28' },
                    { id: 3, name: '商务车组', models: 'Buick GL8, Honda Odyssey 等', dailyPrice: 800, originalPrice: 800, lastUpdated: '2025-10-05' },
                    { id: 4, name: '豪华车组', models: 'BMW 5 Series, Mercedes E-Class 等', dailyPrice: 1200, originalPrice: 1200, lastUpdated: '2025-09-15' },
                    { id: 5, name: '新能源组', models: 'Tesla Model 3, BYD Han 等', dailyPrice: 350, originalPrice: 350, lastUpdated: '2025-10-10' }
                ]);
                const isLocked = ref(true);
                const batchAdjustment = ref(0);
                const scheduledList = reactive([
                    { effectiveTime: '2026-05-01 00:00:00', status: '已执行', summary: '五一假期旺季价格调整', changes: [] },
                    { effectiveTime: '2026-10-01 00:00:00', status: '待执行', summary: '国庆假期旺季价格调整', changes: [] }
                ]);
                const storePriceVersions = reactive([
                    {
                        version: 'PRICE-STORE-20260418-001',
                        title: '当前门市标准价',
                        source: '手动保存',
                        savedBy: '总部运营',
                        savedAt: '2026-04-18 10:20',
                        values: [
                            { group: '经济型轿车', models: 'Toyota Corolla, Honda Civic 等', dailyPrice: '¥280', mileage: '200km/天，超程 ¥2.0/km，不封顶', lastUpdated: '2026-04-18' },
                            { group: 'SUV组', models: 'Toyota RAV4, Honda CR-V 等', dailyPrice: '¥450', mileage: '200km/天，超程 ¥2.0/km，不封顶', lastUpdated: '2026-04-18' },
                            { group: '商务车组', models: 'Buick GL8, Honda Odyssey 等', dailyPrice: '¥800', mileage: '250km/天，超程 ¥3.0/km，不封顶', lastUpdated: '2026-04-18' },
                            { group: '豪华车组', models: 'BMW 5 Series, Mercedes E-Class 等', dailyPrice: '¥1,200', mileage: '200km/天，超程 ¥4.0/km，不封顶', lastUpdated: '2026-04-18' },
                            { group: '新能源组', models: 'Tesla Model 3, BYD Han 等', dailyPrice: '¥350', mileage: '200km/天，超程 ¥1.5/km，封顶 ¥300/天', lastUpdated: '2026-04-18' }
                        ]
                    },
                    {
                        version: 'PRICE-STORE-20260401-002',
                        title: '清明档标准价',
                        source: '定时调价计划',
                        savedBy: '系统执行',
                        savedAt: '2026-04-01 00:00',
                        values: [
                            { group: '经济型轿车', models: 'Toyota Corolla, Honda Civic 等', dailyPrice: '¥260', mileage: '200km/天，超程 ¥2.0/km，不封顶', lastUpdated: '2026-04-01' },
                            { group: 'SUV组', models: 'Toyota RAV4, Honda CR-V 等', dailyPrice: '¥430', mileage: '200km/天，超程 ¥2.0/km，不封顶', lastUpdated: '2026-04-01' },
                            { group: '商务车组', models: 'Buick GL8, Honda Odyssey 等', dailyPrice: '¥780', mileage: '250km/天，超程 ¥3.0/km，不封顶', lastUpdated: '2026-04-01' },
                            { group: '豪华车组', models: 'BMW 5 Series, Mercedes E-Class 等', dailyPrice: '¥1,150', mileage: '200km/天，超程 ¥4.0/km，不封顶', lastUpdated: '2026-04-01' },
                            { group: '新能源组', models: 'Tesla Model 3, BYD Han 等', dailyPrice: '¥330', mileage: '200km/天，超程 ¥1.5/km，封顶 ¥300/天', lastUpdated: '2026-04-01' }
                        ]
                    }
                ]);
                const priceVersionDialogVisible = ref(false);
                const selectedPriceVersion = ref(null);
                const openPriceVersion = (version) => {
                    selectedPriceVersion.value = version || storePriceVersions[0];
                    priceVersionDialogVisible.value = true;
                };

                // --- Sharing Pricing State ---
                const sharingGroups = reactive([
                    { id: 101, name: '经济型分时', models: 'BYD Dolphin, Leapmotor T03', sameStationHourly: 15, sameStationDaily: 120, oneWayHourly: 25, oneWayDaily: 180, lastUpdatedSameStation: '2025-10-01', lastUpdatedOneWay: '2025-09-20' },
                    { id: 102, name: '舒适型分时', models: 'Tesla Model 3, Xpeng P7', sameStationHourly: 25, sameStationDaily: 200, oneWayHourly: 40, oneWayDaily: 300, lastUpdatedSameStation: '2025-10-05', lastUpdatedOneWay: '2025-10-02' },
                ]);
                const isSharingLocked = ref(true);
                const sharingBatchMsg = ref(0);
                const sharingScheduledList = reactive([
                    { effectiveTime: '2026-05-01 00:00:00', status: '已执行', summary: '劳动节前上调', changes: [], type: 'SAME_STATION' }
                ]);
                let sharingSnapshot = JSON.stringify(sharingGroups);


                // --- Common Functions ---
                const saveAllChanges = () => {
                    const loading = ElMessage.loading({ message: '正在保存所有更改...', duration: 0 });
                    setTimeout(() => {
                        loading.close();
                        // Save Store
                        if (!isLocked.value) {
                            vehicleGroups.forEach(g => { g.originalPrice = g.dailyPrice; });
                            isLocked.value = true;
                        }
                        // Save Sharing
                        if (!isSharingLocked.value) {
                            sharingSnapshot = JSON.stringify(sharingGroups);
                            isSharingLocked.value = true;
                        }
                        isModified.value = false;
                        ElMessage.success('定价设置已更新成功');
                    }, 800);
                };

                const getStatusType = (status) => {
                    const map = { '待执行': 'primary', '已执行': 'success', '已取消': 'info', '执行失败': 'danger' };
                    return map[status] || 'info';
                };

                const disabledDate = (time) => time.getTime() < Date.now() - 86400000;

                // --- Store Functions ---
                const handlePriceChange = (row) => { isModified.value = true; };
                const unlockPricing = () => { isLocked.value = false; ElMessage.info('已解锁，请谨慎修改价格'); };
                const savePricing = () => { saveAllChanges(); }; // Alias
                const cancelEdit = () => {
                    vehicleGroups.forEach(g => { g.dailyPrice = g.originalPrice; });
                    isLocked.value = true;
                    isModified.value = false;
                    ElMessage.info('已取消编辑');
                };
                const applyBatchAdjustment = () => {
                    const rate = 1 + (batchAdjustment.value / 100);
                    vehicleGroups.forEach(g => { g.dailyPrice = Math.ceil(g.dailyPrice * rate / 10) * 10; });
                    isModified.value = true;
                    ElMessage.success(`已批量调整价格 (${batchAdjustment.value > 0 ? '+' : ''}${batchAdjustment.value}%)`);
                };

                // Store Schedule
                const scheduleDialogVisible = ref(false);
                const viewDialogVisible = ref(false);
                const currentViewPlan = ref(null);
                const scheduleForm = reactive({ effectiveTime: '', summary: '', prices: [] });

                const openScheduleDialog = () => {
                    scheduleForm.effectiveTime = '';
                    scheduleForm.summary = ''; // Reset summary
                    scheduleForm.prices = vehicleGroups.map(g => ({
                        id: g.id, name: g.name, currentPrice: g.dailyPrice, newPrice: g.dailyPrice
                    }));
                    scheduleDialogVisible.value = true;
                };
                const batchSetNewPrice = () => {
                    scheduleForm.prices.forEach(p => p.newPrice = Math.ceil(p.currentPrice * 1.1 / 10) * 10);
                };
                const confirmSchedule = () => {
                    const hasChange = scheduleForm.prices.some(p => p.newPrice !== p.currentPrice);
                    if (!hasChange) { ElMessage.warning('价格未发生变化'); return; }
                    if (!scheduleForm.summary) { ElMessage.warning('请输入计划摘要'); return; }

                    scheduledList.unshift({
                        effectiveTime: scheduleForm.effectiveTime,
                        status: '待执行',
                        summary: scheduleForm.summary,
                        changes: JSON.parse(JSON.stringify(scheduleForm.prices))
                    });
                    scheduleDialogVisible.value = false;
                    ElMessage.success('计划创建成功');
                };
                const viewSchedule = (item) => { currentViewPlan.value = item; viewDialogVisible.value = true; };
                const cancelSchedule = (idx) => { scheduledList[idx].status = '已取消'; ElMessage.info('计划已取消'); };
                const getDiffClass = (row) => row.newPrice > row.currentPrice ? 'text-red-500' : (row.newPrice < row.currentPrice ? 'text-green-500' : 'text-gray-300');
                const getDiffText = (row) => {
                    const diff = row.newPrice - row.currentPrice;
                    return diff > 0 ? `+${diff}` : (diff < 0 ? `${diff}` : '-');
                };

                // --- Sharing Functions ---
                const markSharingModified = () => { isModified.value = true; };
                const cancelSharingEdit = () => {
                    const originals = JSON.parse(sharingSnapshot);
                    sharingGroups.splice(0, sharingGroups.length, ...originals);
                    isSharingLocked.value = true;
                    isModified.value = false;
                    ElMessage.info('已取消分时定价编辑');
                };
                const applySharingBatch = () => {
                    ElMessageBox.confirm(
                        `确定要将所有分时车组价格上调 ${sharingBatchMsg.value}% 吗？`, '批量调整',
                        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
                    ).then(() => {
                        const rate = 1 + (sharingBatchMsg.value / 100);
                        sharingGroups.forEach(g => {
                            g.sameStationHourly = Math.ceil(g.sameStationHourly * rate);
                            g.sameStationDaily = Math.ceil(g.sameStationDaily * rate);
                            g.oneWayHourly = Math.ceil(g.oneWayHourly * rate);
                            g.oneWayDaily = Math.ceil(g.oneWayDaily * rate);
                        });
                        markSharingModified();
                        ElMessage.success('分时价格已按百分比批量上调');
                    });
                };
                const entryHasChanges = (row) => {
                    // Simplified check against snapshot would be better, but for UI feedback:
                    return isModified.value;
                };

                // Sharing Schedule
                const sharingScheduleDialogVisible = ref(false);
                const sharingViewDialogVisible = ref(false);
                const currentSharingViewPlan = ref(null);
                const sharingScheduleForm = reactive({ effectiveTime: '', summary: '', type: 'SAME_STATION', items: [] });

                const openSharingScheduleDialog = () => {
                    sharingScheduleForm.effectiveTime = '';
                    sharingScheduleForm.summary = '';
                    sharingScheduleForm.type = 'SAME_STATION';
                    initSharingScheduleItems();
                    sharingScheduleDialogVisible.value = true;
                };
                const initSharingScheduleItems = () => {
                    sharingScheduleForm.items = sharingGroups.map(g => ({
                        id: g.id, name: g.name,
                        sameStationHourly: g.sameStationHourly, sameStationDaily: g.sameStationDaily,
                        newSameStationHourly: g.sameStationHourly, newSameStationDaily: g.sameStationDaily,
                        oneWayHourly: g.oneWayHourly, oneWayDaily: g.oneWayDaily,
                        newOneWayHourly: g.oneWayHourly, newOneWayDaily: g.oneWayDaily
                    }));
                };
                const resetSharingSchedulePrices = () => {
                    sharingScheduleForm.items.forEach(item => {
                        item.newSameStationHourly = item.sameStationHourly;
                        item.newSameStationDaily = item.sameStationDaily;
                        item.newOneWayHourly = item.oneWayHourly;
                        item.newOneWayDaily = item.oneWayDaily;
                    });
                };
                const batchSetSharingNewPrice = () => {
                    const isSame = sharingScheduleForm.type === 'SAME_STATION';
                    sharingScheduleForm.items.forEach(item => {
                        if (isSame) {
                            item.newSameStationHourly = Math.ceil(item.sameStationHourly * 1.1);
                            item.newSameStationDaily = Math.ceil(item.sameStationDaily * 1.1);
                        } else {
                            item.newOneWayHourly = Math.ceil(item.oneWayHourly * 1.1);
                            item.newOneWayDaily = Math.ceil(item.oneWayDaily * 1.1);
                        }
                    });
                    ElMessage.success('批量预览上调 10%');
                };
                const confirmSharingSchedule = () => {
                    if (!sharingScheduleForm.effectiveTime) { ElMessage.warning('请选择时间'); return; }
                    if (!sharingScheduleForm.summary) { ElMessage.warning('请输入计划摘要'); return; }
                    let hasChange = false;
                    if (sharingScheduleForm.type === 'SAME_STATION') {
                        hasChange = sharingScheduleForm.items.some(i => i.newSameStationHourly !== i.sameStationHourly || i.newSameStationDaily !== i.sameStationDaily);
                    } else {
                        hasChange = sharingScheduleForm.items.some(i => i.newOneWayHourly !== i.oneWayHourly || i.newOneWayDaily !== i.oneWayDaily);
                    }
                    if (!hasChange) { ElMessage.warning('价格未发生变化'); return; }

                    sharingScheduledList.unshift({
                        effectiveTime: sharingScheduleForm.effectiveTime,
                        status: '待执行',
                        summary: sharingScheduleForm.summary,
                        changes: JSON.parse(JSON.stringify(sharingScheduleForm.items)),
                        type: sharingScheduleForm.type
                    });

                    sharingScheduleDialogVisible.value = false;
                    ElMessage.success('分时计划创建成功');
                };
                const viewSharingSchedule = (item) => { currentSharingViewPlan.value = item; sharingViewDialogVisible.value = true; };
                const cancelSharingSchedule = (idx) => { sharingScheduledList[idx].status = '已取消'; ElMessage.info('已取消'); };
                const sharingScheduleHasChange = (row) => {
                    return row.newSameStationHourly !== row.sameStationHourly || row.newSameStationDaily !== row.sameStationDaily ||
                        row.newOneWayHourly !== row.oneWayHourly || row.newOneWayDaily !== row.oneWayDaily;
                };

                return {
                    activeTab, isModified, saveChanges: saveAllChanges, getStatusType, disabledDate,
                    // Permissions
                    currentTenantName, switchTenant, hasPermission,
                    // Store
                    vehicleGroups, isLocked, handlePriceChange, unlockPricing, savePricing, cancelEdit,
                    batchAdjustment, applyBatchAdjustment,
                    storePriceVersions, priceVersionDialogVisible, selectedPriceVersion, openPriceVersion,
                    scheduledList, scheduleDialogVisible, scheduleForm, openScheduleDialog, batchSetNewPrice, confirmSchedule,
                    viewSchedule, cancelSchedule, viewDialogVisible, currentViewPlan, getDiffClass, getDiffText,
                    // Sharing
                    sharingGroups, isSharingLocked, markSharingModified, cancelSharingEdit,
                    sharingBatchMsg, applySharingBatch, entryHasChanges,
                    sharingScheduledList, sharingScheduleDialogVisible, sharingScheduleForm, openSharingScheduleDialog,
                    resetSharingSchedulePrices, batchSetSharingNewPrice, confirmSharingSchedule,
                    viewSharingSchedule, cancelSharingSchedule, sharingViewDialogVisible, currentSharingViewPlan, sharingScheduleHasChange
                };
            
  },
};
</script>

<style scoped>
        .pricing-page {
            min-height: 100%;
        }

        .pricing-card {
            transition: all 0.2s;
        }

        .pricing-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .app-page-tabs > :deep(.el-tabs__header) {
            padding: 0 24px;
            margin: 0;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__nav-wrap::after) {
            height: 1px;
            background-color: #eef2f7;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item) {
            padding: 0 18px;
            height: 44px;
            color: #6b7280;
            font-weight: 600;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item:first-child) {
            padding-left: 0;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item.is-active),
        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item:hover) {
            color: var(--app-color-primary);
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__active-bar) {
            background-color: var(--app-color-primary);
            height: 3px;
            border-radius: 999px;
        }
</style>
