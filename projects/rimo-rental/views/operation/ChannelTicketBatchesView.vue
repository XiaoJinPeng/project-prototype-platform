<template>
<div class="channel-ticket-batches-page">
            

            <main>
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">合作通路租车券</h1>
                        <p class="text-gray-500 text-sm mt-1">用于合作通路企业发放免支付租車券，用券人使用后预约租还车辆，费用归属到租車券所属企业。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20"
                            @click="openBatchDialog()">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新增批次
                        </el-button>
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-4 mb-5">
                    <button type="button" @click="toggleBatchCard('ALL')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeBatchCard === 'ALL' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">全部批次</div>
                        <div class="text-[28px] leading-tight font-bold text-gray-800 mt-1">{{ batchStats.total }}</div>
                    </button>
                    <button type="button" @click="toggleBatchCard('启用')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeBatchCard === '启用' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">启用</div>
                        <div class="text-[28px] leading-tight font-bold text-emerald-600 mt-1">{{ batchStats.enabled }}</div>
                    </button>
                    <button type="button" @click="toggleBatchCard('停用')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeBatchCard === '停用' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">停用</div>
                        <div class="text-[28px] leading-tight font-bold text-gray-600 mt-1">{{ batchStats.disabled }}</div>
                    </button>
                    <button type="button" @click="toggleBatchCard('待导入名单')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeBatchCard === '待导入名单' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">待导入名单</div>
                        <div class="text-[28px] leading-tight font-bold text-amber-500 mt-1">{{ batchStats.pendingImport }}</div>
                    </button>
                </div>

                <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-4 border-b border-gray-100 bg-gray-50">
                        <div class="flex flex-wrap items-center justify-between gap-3">
                            <div class="flex flex-wrap items-center gap-3">
                                <el-input v-model="filters.keyword" placeholder="批次名称 / 批次编号" clearable class="w-56"></el-input>
                                <el-select v-model="filters.enterprise" placeholder="合作通路企业" clearable class="w-52">
                                    <el-option label="金门风狮爷旅行社" value="金门风狮爷旅行社"></el-option>
                                    <el-option label="金门蓝湾旅行社" value="金门蓝湾旅行社"></el-option>
                                    <el-option label="海峡科技股份有限公司" value="海峡科技股份有限公司"></el-option>
                                    <el-option label="金门环岛假期" value="金门环岛假期"></el-option>
                                </el-select>
                                <el-select v-model="filters.status" placeholder="批次状态" clearable class="w-36"
                                    @change="syncBatchCard">
                                    <el-option label="待导入名单" value="待导入名单"></el-option>
                                    <el-option label="启用" value="启用"></el-option>
                                    <el-option label="停用" value="停用"></el-option>
                                </el-select>
                                <el-select v-model="filters.issueMode" placeholder="发券方式" clearable class="w-40">
                                    <el-option label="名单发放" value="LIST"></el-option>
                                    <el-option label="数量生成" value="QUANTITY"></el-option>
                                </el-select>
                                <el-button type="primary" plain class="official-more-filter-button" :icon="Filter"
                                    @click="moreFiltersVisible = !moreFiltersVisible">
                                    {{ moreFiltersVisible ? '收起筛选' : '更多筛选' }}{{ advancedFilterCount ? '（' + advancedFilterCount + '）' : '' }}
                                </el-button>
                                <el-tooltip content="重置筛选" placement="top">
                                    <el-button circle @click="resetFilters">
                                        <el-icon>
                                            <Refresh></Refresh>
                                        </el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>
                            <div class="text-sm text-gray-500">共 {{ filteredBatches.length }} 个批次</div>
                        </div>
                        <div v-show="moreFiltersVisible" class="mt-3 border-t border-gray-200 pt-3">
                            <div class="flex flex-wrap items-center gap-3">
                                <el-select v-model="filters.stationTypes" placeholder="适用据点类型" clearable filterable multiple collapse-tags collapse-tags-tooltip class="w-64" @change="handleFilterStationTypeChange">
                                    <el-option v-for="option in stationTypeOptions" :key="option.value" :label="option.label" :value="option.value">
                                        <div class="flex items-center justify-between gap-3 w-full">
                                            <span>{{ option.label }}</span>
                                            <el-tag size="small" :type="getStationTypeEntryTagType(option)" effect="plain">
                                                {{ getStationTypeEntryText(option) }}
                                            </el-tag>
                                        </div>
                                    </el-option>
                                </el-select>
                                <el-select v-model="filters.station" placeholder="适用据点" clearable filterable class="w-56">
                                    <el-option v-for="option in filterStationOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
                                </el-select>
                                <div class="ticket-filter-daterange-wrap">
                                    <el-date-picker v-model="filters.pickupRange" type="datetimerange" range-separator="至"
                                        start-placeholder="取车开始" end-placeholder="取车结束"
                                        value-format="YYYY-MM-DD HH:mm:ss" class="ticket-filter-daterange"></el-date-picker>
                                </div>
                            </div>
                        </div>
                    </div>
                    <el-table :data="filteredBatches" class="w-full" row-key="id">
                        <el-table-column prop="batchNo" label="批次编号" width="170"></el-table-column>
                        <el-table-column label="批次名称" min-width="180">
                            <template #default="{ row }">
                                <div class="font-semibold text-gray-900">{{ row.name }}</div>
                                <div class="text-xs text-gray-500">同站租还 / 租車券</div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="enterprise" label="所属合作企业" min-width="160"></el-table-column>
                        <el-table-column label="适用据点范围" min-width="160">
                            <template #default="{ row }">
                                <el-tooltip :content="formatStationRangeTooltip(row)" placement="top" effect="dark" popper-class="station-range-tooltip">
                                    <div>
                                        <div class="text-sm text-gray-900 truncate">{{ formatStationRangeSummary(row) }}</div>
                                        <div class="text-xs text-gray-500 truncate">{{ formatStationTypeRange(row) }}</div>
                                    </div>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column label="固定取还车时间" min-width="230">
                            <template #default="{ row }">
                                <div>{{ row.pickupAt }}</div>
                                <div class="text-xs text-gray-500">{{ row.returnAt }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="可用时间段" min-width="230">
                            <template #default="{ row }">
                                <div>{{ row.availableStartAt }}</div>
                                <div class="text-xs text-gray-500">{{ row.availableEndAt }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="发券方式" width="110">
                            <template #default="{ row }">
                                <el-tag type="info" effect="plain">{{ getIssueModeLabel(row.issueMode) }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="数量 / 发放使用统计" width="210">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-900">总数 {{ row.totalCount }}</div>
                                <div class="text-xs text-gray-500">{{ formatIssueUsageSummary(row) }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="row.status === '启用' ? 'success' : (row.status === '待导入名单' ? 'warning' : 'info')" effect="plain">{{ row.status }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="210" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="openDetailPage(row)">查看详情</el-button>
                                <el-button type="primary" link @click="openBatchDialog(row)">编辑</el-button>
                                <el-tooltip :content="row.status === '待导入名单' ? '进入详情页导入名单后再启用' : '进入详情页填写原因后处理'" placement="top">
                                    <el-button :type="row.status === '启用' ? 'danger' : 'primary'" link @click="openDetailPage(row)">{{ row.status === '待导入名单' ? '导入名单' : (row.status === '启用' ? '停用' : '启用') }}</el-button>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table>
                </section>
            </main>
        </div>

        <el-dialog v-model="detailVisible" title="批次详情" width="min(1320px, 92vw)">
            <div v-if="currentBatch" class="space-y-5">
                <table class="info-table">
                    <tbody>
                        <tr>
                            <th>批次编号</th>
                            <td>{{ currentBatch.batchNo }}</td>
                            <th>批次名称</th>
                            <td>{{ currentBatch.name }}</td>
                        </tr>
                        <tr>
                            <th>所属合作企业</th>
                            <td>{{ currentBatch.enterprise }}</td>
                            <th>适用服务</th>
                            <td>分时租赁 / 同站租还</td>
                        </tr>
                        <tr>
                            <th>适用据点类型</th>
                            <td>
                                <div>{{ formatStationTypeRange(currentBatch) }}</div>
                            </td>
                            <th>批次状态</th>
                            <td>
                                <el-tag :type="currentBatch.status === '启用' ? 'success' : (currentBatch.status === '待导入名单' ? 'warning' : 'info')" effect="plain">
                                    {{ currentBatch.status }}
                                </el-tag>
                            </td>
                        </tr>
                        <tr>
                            <th>适用据点</th>
                            <td>{{ formatStationRange(currentBatch) }}</td>
                            <th>发券方式</th>
                            <td>{{ getIssueModeLabel(currentBatch.issueMode) }}</td>
                        </tr>
                        <tr>
                            <th>时间规则</th>
                            <td>固定取还车时间</td>
                            <th>固定时长模式</th>
                            <td>预留，未开放</td>
                        </tr>
                        <tr>
                            <th>固定取车时间</th>
                            <td>{{ currentBatch.pickupAt }}</td>
                            <th>固定还车时间</th>
                            <td>{{ currentBatch.returnAt }}</td>
                        </tr>
                        <tr>
                            <th>票券可用开始</th>
                            <td>{{ currentBatch.availableStartAt }}</td>
                            <th>票券可用结束</th>
                            <td>{{ currentBatch.availableEndAt }}</td>
                        </tr>
                        <tr>
                            <th>租車券数量</th>
                            <td>{{ currentBatch.totalCount }}</td>
                            <th>发放统计</th>
                            <td>{{ formatIssueSummary(currentBatch) }} / 失败 {{ currentBatch.issueFailedCount }}</td>
                        </tr>
                        <tr>
                            <th>使用统计</th>
                            <td>未使用 {{ currentBatch.unusedCount }} / 已使用 {{ currentBatch.usedCount }} / 已过期 {{ currentBatch.expiredCount }}</td>
                            <th>库存口径</th>
                            <td>不保留车辆，按实时可用车辆查询</td>
                        </tr>
                    </tbody>
                </table>

                <div>
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="font-semibold text-gray-900">租車券列表</h3>
                        <div class="flex items-center gap-3">
                            <span class="text-xs text-gray-500">创建订单即已使用；订单取消后未过期前恢复未使用，可重新预约</span>
                            <el-button type="primary" plain size="small" @click="openAddTicketDialog">
                                <el-icon class="mr-1">
                                    <Plus></Plus>
                                </el-icon> 新增租車券
                            </el-button>
                            <el-button type="primary" plain size="small" title="导出 Excel：租車券列表 + 订单完整数据" @click="exportCodesMock">
                                <el-icon class="mr-1">
                                    <Download></Download>
                                </el-icon> 导出
                            </el-button>
                        </div>
                    </div>
                    <el-table :data="currentBatch.codes" border>
                        <el-table-column prop="code" label="租車券编号" min-width="150"></el-table-column>
                        <el-table-column label="用券人信息" min-width="145">
                            <template #default="{ row }">
                                <div v-if="row.visitorName" class="text-sm text-gray-900">{{ row.visitorName }}</div>
                                <div v-if="row.documentNo" class="text-xs text-gray-500">{{ row.documentNo }}</div>
                                <span v-if="!row.visitorName && !row.documentNo" class="text-gray-400">-</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="发放状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="getIssueStatusType(row.issueStatus)" effect="plain">
                                    {{ row.issueStatus }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="使用状态" width="100">
                            <template #default="{ row }">
                                <el-tag :type="getTicketStatusType(row.status)" effect="plain">
                                    {{ row.status }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="member" label="使用会员" min-width="135"></el-table-column>
                        <el-table-column prop="orderNo" label="订单号" min-width="145">
                            <template #default="{ row }">
                                <div v-if="row.orderNo" class="space-y-1">
                                    <div class="font-medium text-gray-900 break-all">{{ row.orderNo }}</div>
                                    <el-tag size="small" :type="getOrderStatusType(row.orderStatus)" effect="plain">
                                        {{ row.orderStatus || '订单已建立' }}
                                    </el-tag>
                                </div>
                                <span v-else class="text-gray-400">-</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="订单结算" min-width="165">
                            <template #default="{ row }">
                                <span v-if="!row.orderNo" class="text-gray-400">-</span>
                                <div v-else-if="row.settlementStatus === 'OVERDUE_IN_PROGRESS'" class="space-y-1">
                                    <el-tag type="warning" effect="plain" size="small">逾时中</el-tag>
                                    <div class="text-xs text-amber-700">已逾时 {{ row.overdueMinutes }} 分钟</div>
                                    <div class="text-xs text-gray-500">费用待结算</div>
                                </div>
                                <div v-else-if="Number(row.abnormalFeeTotal || 0) > 0" class="space-y-1">
                                    <div class="text-sm font-medium text-red-600">逾时 {{ row.overdueMinutes }} 分钟</div>
                                    <div class="text-xs text-gray-600">异常费用 NT$ {{ Number(row.abnormalFeeTotal).toLocaleString() }}</div>
                                </div>
                                <span v-else-if="row.orderStatus === '已取消'" class="text-gray-500">订单已取消</span>
                                <span v-else-if="row.orderStatus === '已完成'" class="text-green-600">正常结算</span>
                                <div v-else class="text-gray-500">
                                    <div>暂无异常费用</div>
                                    <div class="text-xs mt-1">待结算</div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="usedAt" label="使用时间" min-width="140"></el-table-column>
                        <el-table-column label="操作" width="120" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link :disabled="!row.orderNo" @click="openOrder(row)">查看订单</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-dialog>

        <el-dialog v-model="addTicketDialogVisible" title="新增租車券" width="560px">
            <div v-if="currentBatch" class="space-y-4">
                <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                    新增租車券将继承当前批次的合作企业、固定取还车时间、可用时间段和适用据点范围。
                </div>
                <el-form label-width="110px">
                    <el-form-item label="当前批次">
                        <div class="text-sm text-gray-900">{{ currentBatch.name }}</div>
                    </el-form-item>
                    <el-form-item label="发券方式">
                        <el-tag type="info" effect="plain">{{ getIssueModeLabel(currentBatch.issueMode) }}</el-tag>
                    </el-form-item>
                    <template v-if="currentBatch.issueMode === 'LIST'">
                        <el-form-item label="用券人姓名" required>
                            <el-input v-model="addTicketForm.visitorName" placeholder="请输入用券人姓名"></el-input>
                        </el-form-item>
                        <el-form-item label="证件号码" required>
                            <el-input v-model="addTicketForm.documentNo" placeholder="请输入证件号码"></el-input>
                            <div class="mt-1 text-xs text-gray-500">可填写身份证或入台证号码，不选择证件类型。匹配会员已认证资料时直接发放，未匹配时保持待发放。</div>
                        </el-form-item>
                    </template>
                    <template v-else>
                        <el-form-item label="新增数量" required>
                            <el-input-number v-model="addTicketForm.count" :min="1" :max="99" controls-position="right"></el-input-number>
                            <div class="mt-1 text-xs text-gray-500">保存后生成对应数量的租車券和兑换码，初始状态为未领取。</div>
                        </el-form-item>
                    </template>
                    <el-form-item label="新增原因" required>
                        <el-input v-model="addTicketForm.reason" type="textarea" :rows="3"
                            placeholder="例如：名单遗漏、活动临时加名额、现场补发"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="addTicketDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveAddTicketMock">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="batchDialogVisible" :title="editingBatch ? '编辑批次' : '新增批次'" width="960px">
            <el-form label-width="120px">
                <div class="grid grid-cols-2 gap-4" style="align-items: flex-start;">
                    <el-form-item label="批次名称" required>
                        <el-input v-model="batchForm.name" placeholder="例如：海峡科技员工活动租車券"></el-input>
                    </el-form-item>
                    <el-form-item label="所属合作企业" required>
                        <el-select v-model="batchForm.enterprise" placeholder="选择合作通路企业" filterable class="w-full">
                            <el-option label="金门风狮爷旅行社" value="金门风狮爷旅行社"></el-option>
                            <el-option label="金门蓝湾旅行社" value="金门蓝湾旅行社"></el-option>
                            <el-option label="金门环岛假期" value="金门环岛假期"></el-option>
                            <el-option label="海峡科技股份有限公司" value="海峡科技股份有限公司"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <el-form-item label="适用营运类型" required>
                    <el-radio-group v-model="batchForm.serviceMode">
                        <el-radio-button label="同站租还"></el-radio-button>
                        <el-radio-button label="甲租乙还" disabled></el-radio-button>
                    </el-radio-group>
                    <div class="mt-1 text-xs text-gray-500">本期仅支持同站租还。</div>
                </el-form-item>
                <el-form-item label="时间规则" required>
                    <el-radio-group v-model="batchForm.timeRuleType">
                        <el-radio-button label="FIXED_PERIOD">固定取还车时间</el-radio-button>
                        <el-radio-button label="FIXED_DURATION" disabled>固定租用时长（预留）</el-radio-button>
                    </el-radio-group>
                    <div class="mt-1 text-xs text-gray-500">固定租用时长用于金门后续迭代及台湾市场扩展，本期不可选择。</div>
                </el-form-item>
                <div class="grid grid-cols-2 gap-4" style="align-items: flex-start;">
                    <el-form-item label="适用据点类型" required>
                        <el-select v-model="batchForm.stationTypes" placeholder="请选择适用据点类型" filterable class="w-full"
                            multiple collapse-tags collapse-tags-tooltip @change="handleStationTypeChange">
                            <el-option v-for="option in stationTypeOptions" :key="option.value" :label="option.label" :value="option.value">
                                <div class="flex items-center justify-between gap-3 w-full">
                                    <span>{{ option.label }}</span>
                                    <el-tag size="small" :type="getStationTypeEntryTagType(option)" effect="plain">
                                        {{ getStationTypeEntryText(option) }}
                                    </el-tag>
                                </div>
                            </el-option>
                        </el-select>
                        <div class="mt-1 text-xs text-gray-500">普通企业活动可选择一般预约可用的据点类型；专用活动可选择不开放一般预约的据点类型。</div>
                    </el-form-item>
                    <el-form-item label="适用据点" required>
                        <el-select v-model="batchForm.stations" placeholder="请选择适用据点" filterable class="w-full"
                            multiple collapse-tags collapse-tags-tooltip>
                            <el-option v-for="option in availableStationOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
                        </el-select>
                        <div class="mt-1 text-xs text-gray-500">用券人只能在本批次选定的据点范围内查询车辆和预约订单。</div>
                    </el-form-item>
                </div>
                <div class="grid grid-cols-2 gap-4" style="align-items: flex-start;">
                    <el-form-item label="取车时间" required>
                        <el-date-picker v-model="batchForm.pickupAt" type="datetime" placeholder="选择取车时间"
                            class="w-full" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                    <el-form-item label="还车时间" required>
                        <el-date-picker v-model="batchForm.returnAt" type="datetime" placeholder="选择还车时间"
                            class="w-full" style="width: 100%;"></el-date-picker>
                    </el-form-item>
                </div>
                <div class="grid grid-cols-2 gap-4" style="align-items: flex-start;">
                    <el-form-item label="可用开始时间">
                        <el-date-picker v-model="batchForm.availableStartAt" type="datetime" placeholder="正式批次建立时自动生成"
                            class="w-full" style="width: 100%;" disabled></el-date-picker>
                        <div class="mt-1 text-xs text-gray-500">系统固定取正式批次建立成功时间，不提供人工选择。</div>
                    </el-form-item>
                    <el-form-item label="可用结束时间">
                        <el-date-picker v-model="batchForm.availableEndAt" type="datetime" placeholder="默认固定还车时间"
                            class="w-full" style="width: 100%;" disabled></el-date-picker>
                        <div class="mt-1 text-xs text-gray-500">系统固定等于固定还车时间，不提供人工选择。</div>
                    </el-form-item>
                </div>
                <el-form-item label="发券方式">
                    <el-radio-group v-model="batchForm.issueMode">
                        <el-radio-button label="LIST">名单发放</el-radio-button>
                        <el-radio-button label="QUANTITY">数量生成</el-radio-button>
                    </el-radio-group>
                    <div class="mt-1 text-xs text-gray-500">两种方式都固定取还车时间；数量生成后由合作企业对外发放兑换码，用户在 APP 主动兑换。</div>
                </el-form-item>
                <div class="grid grid-cols-2 gap-4" style="align-items: flex-start;">
                    <el-form-item label="租車券数量" v-if="batchForm.issueMode === 'QUANTITY'" required>
                        <el-input-number v-model="batchForm.totalCount" :min="0" :max="999" class="w-full"></el-input-number>
                        <div class="mt-1 text-xs text-gray-500">数量生成时由营运人员填写。</div>
                    </el-form-item>
                    <el-form-item label="批次状态">
                        <template v-if="batchForm.issueMode === 'LIST' && !batchForm.hasImportedVisitors">
                            <el-tag type="warning" effect="plain">待导入名单</el-tag>
                            <div class="mt-1 text-xs text-gray-500">名单发放可先保存批次基础信息；保存后不会生成租車券，也不会在 APP 展示。</div>
                        </template>
                        <el-radio-group v-else v-model="batchForm.status">
                            <el-radio-button label="启用"></el-radio-button>
                            <el-radio-button label="停用"></el-radio-button>
                        </el-radio-group>
                    </el-form-item>
                </div>
                <el-form-item v-if="batchForm.issueMode === 'LIST'" label="用券人名单">
                    <div class="w-full">
                        <div class="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <div class="text-sm font-semibold text-gray-900">名单发放</div>
                                    <div class="text-xs text-gray-500 mt-1">支持创建时导入，也可先保存批次后在详情页导入 / 追加名单；不支持覆盖原名单。</div>
                                </div>
                                <el-button type="primary" plain size="small" @click="openImportDialog">
                                    <el-icon class="mr-1">
                                        <Upload></Upload>
                                    </el-icon> 导入名单
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-form-item>
                <div class="ml-[120px] mb-4">
                    <div class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-2">
                        <div class="flex items-start gap-3">
                            <div class="w-[84px] shrink-0 pt-0.5 text-xs font-medium text-gray-700">
                                {{ batchForm.issueMode === 'LIST' ? '名单汇入结果' : '生成数量' }}
                            </div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <el-tag :type="batchForm.issueMode === 'LIST' ? (batchForm.hasImportedVisitors ? 'info' : 'warning') : (batchForm.totalCount > 0 ? 'success' : 'warning')" effect="plain" size="small">
                                        {{ batchForm.issueMode === 'LIST' ? (batchForm.hasImportedVisitors ? '已汇入' : '待汇入') : (batchForm.totalCount > 0 ? '已填写' : '待填写') }}
                                    </el-tag>
                                    <div class="text-xs leading-5"
                                        :class="batchForm.issueMode === 'LIST' ? (batchForm.hasImportedVisitors ? 'text-blue-700' : 'text-amber-700') : 'text-blue-700'">
                                        {{ batchForm.issueMode === 'LIST'
                                            ? (batchForm.hasImportedVisitors
                                                ? `名单 ${batchForm.totalCount} 行；已匹配会员 ${batchForm.matchedCount} 行；待匹配会员 ${batchForm.pendingMatchCount} 行。`
                                                : '尚未导入用券人名单；可先保存为待导入名单，后续在详情页导入 / 追加。')
                                            : `批次保存后生成 ${batchForm.totalCount || 0} 张租車券及兑换码。` }}
                                    </div>
                                </div>
                                <div class="text-xs mt-0.5 leading-5 text-gray-500">
                                    {{ batchForm.issueMode === 'LIST'
                                        ? (batchForm.hasImportedVisitors
                                            ? '同一批次证件号码不得重复；未匹配会员的租車券保留待发放。'
                                            : '支持字段：用券人姓名、证件号码；不设置证件类型；创建后只允许追加导入。')
                                        : '数量生成不预绑定证件号码；用户在 APP 兑换后，租車券绑定到当前会员账户。' }}
                                </div>
                            </div>
                        </div>
                        <div class="border-t border-slate-200"></div>
                        <div class="flex items-start gap-3">
                            <div class="w-[84px] shrink-0 pt-0.5 text-xs font-medium text-gray-700">车辆库存提醒</div>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2">
                                    <el-tag 
                                        :type="!capacityHint.visible ? 'info' : (capacityHint.currentDemandKnown ? (capacityHint.sufficient ? 'success' : 'warning') : 'info')"
                                        effect="plain" size="small">
                                        {{ !capacityHint.visible ? '待判断' : capacityHint.tag }}
                                    </el-tag>
                                    <div v-if="capacityHint.visible" class="text-xs leading-5"
                                        :class="capacityHint.currentDemandKnown ? (capacityHint.sufficient ? 'text-emerald-700' : 'text-amber-700') : 'text-blue-700'">
                                        {{ capacityHint.briefSummary }}
                                    </div>
                                    <div v-else class="text-xs leading-5 text-slate-600">
                                        选择适用据点并填写固定取还车时间后显示提醒。
                                    </div>
                                </div>
                                <div class="text-xs mt-0.5 leading-5 text-gray-500">
                                    {{ capacityHint.visible ? capacityHint.summary : '系统按适用据点和固定取还车时间判断重叠批次车辆需求。' }}
                                </div>
                                <div v-if="capacityHint.visible && capacityHint.overlapBatchText" class="text-xs mt-0.5 truncate text-gray-500">
                                    重叠批次号：{{ capacityHint.overlapBatchText }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-form>
            <template #footer>
                <el-button @click="batchDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveBatchMock">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="importDialogVisible" title="导入用券人名单" width="680px">
            <div class="space-y-4">
                <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div class="flex items-center justify-between gap-3">
                        <div>
                            <div class="text-sm font-semibold text-gray-900">名单模板</div>
                            <div class="text-xs text-gray-500 mt-1">模板字段：用券人姓名、证件号码，不包含证件类型。同一批次证件号码不得重复；后续只允许追加导入。</div>
                        </div>
                        <el-button plain size="small" @click="downloadTemplateMock">
                            <el-icon class="mr-1">
                                <Download></Download>
                            </el-icon> 下载模板
                        </el-button>
                    </div>
                </div>
                <div class="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center">
                    <el-icon class="text-2xl text-slate-400">
                        <UploadFilled></UploadFilled>
                    </el-icon>
                    <div class="text-sm text-gray-900 mt-2">选择名单文件</div>
                    <div class="text-xs text-gray-500 mt-1">原型示意为直接生成汇入结果</div>
                    <div class="mt-3 flex items-center justify-center gap-2">
                        <el-button type="primary" plain size="small" @click="previewImportMock(false)">模拟成功导入</el-button>
                        <el-button type="danger" plain size="small" @click="previewImportMock(true)">模拟格式异常</el-button>
                    </div>
                </div>
                <div v-if="importPreviewReady" class="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <el-alert 
                        :title="importSummary.status === 'success' ? '导入成功' : '导入异常'"
                        :type="importSummary.status === 'success' ? 'success' : 'error'"
                        show-icon
                        :closable="false"
                    >
                        <template #default>{{ importSummary.message }}</template>
                    </el-alert>
                    <div v-if="importSummary.status === 'success'" class="grid grid-cols-3 gap-3 mt-3 text-sm">
                        <div class="bg-white rounded-lg border border-blue-100 p-3">
                            <div class="text-gray-500 text-xs">名单行数</div>
                            <div class="font-semibold text-gray-900">{{ importSummary.total }} 行</div>
                        </div>
                        <div class="bg-white rounded-lg border border-blue-100 p-3">
                            <div class="text-gray-500 text-xs">已匹配会员</div>
                            <div class="font-semibold text-emerald-700">{{ importSummary.matched }} 行</div>
                        </div>
                        <div class="bg-white rounded-lg border border-blue-100 p-3">
                            <div class="text-gray-500 text-xs">待匹配会员</div>
                            <div class="font-semibold text-amber-700">{{ importSummary.pending }} 行</div>
                        </div>
                    </div>
                    <el-table v-else :data="importSummary.errors" size="small" class="mt-3" border>
                        <el-table-column prop="rowNo" label="行号" width="80"></el-table-column>
                        <el-table-column prop="documentNo" label="证件号码" width="160"></el-table-column>
                        <el-table-column prop="reason" label="异常原因" min-width="220"></el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="importDialogVisible = false">取消</el-button>
                <el-button type="primary" :disabled="!importPreviewReady || importSummary.status !== 'success'" @click="confirmImportVisitors">确认汇入</el-button>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Filter } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const filters = reactive({
                    keyword: '',
                    enterprise: '',
                    status: '',
                    issueMode: '',
                    stationTypes: [],
                    station: '',
                    pickupRange: []
                });
                const moreFiltersVisible = ref(false);
                const activeBatchCard = ref('');

                const batches = ref([
                    {
                        id: 1,
                        batchNo: 'GT-KM-20260501-001',
                        name: '金门 5 月 A 团租車券',
                        enterprise: '金门风狮爷旅行社',
                        issueMode: 'LIST',
                        stationTypes: ['旅行社团体专用'],
                        stations: ['金城民生停车场'],
                        pickupAt: '2026-05-01 09:00',
                        returnAt: '2026-05-01 17:00',
                        availableStartAt: '2026-04-20 00:00',
                        availableEndAt: '2026-05-01 17:00',
                        totalCount: 12,
                        unusedCount: 8,
                        usedCount: 4,
                        expiredCount: 0,
                        issuedCount: 9,
                        pendingIssueCount: 3,
                        issueFailedCount: 0,
                        availabilityStatus: '已过期',
                        status: '启用',
                        visitors: [
                            { name: '王志明', documentNo: 'A123456789', memberStatus: '已匹配会员', issueStatus: '已发放', issueRemark: '已发放到会员账户' },
                            { name: '林雅婷', documentNo: 'B223456789', memberStatus: '已匹配会员', issueStatus: '已发放', issueRemark: '已发放到会员账户' },
                            { name: '许家豪', documentNo: '110101199001011234', memberStatus: '待匹配会员', issueStatus: '待发放', issueRemark: '证件认证匹配后自动发放' },
                            { name: '吴佳颖', documentNo: '110101199202022345', memberStatus: '待匹配会员', issueStatus: '待发放', issueRemark: '证件认证匹配后自动发放' }
                        ],
                        codes: [
                            { code: 'KM-A0501-001', visitorName: '王志明', documentNo: 'A123456789', issueStatus: '已发放', status: '已使用', member: '王志明 A123456789', orderNo: 'TS-KM-20260501-0001', orderStatus: '已完成', settlementStatus: 'SETTLED', overdueMinutes: 0, abnormalFeeTotal: 0, usedAt: '2026-04-25 10:16' },
                            { code: 'KM-A0501-002', visitorName: '林雅婷', documentNo: 'B223456789', issueStatus: '已发放', status: '已使用', member: '林雅婷 B223456789', orderNo: 'TS-KM-20260501-0002', orderStatus: '已完成', settlementStatus: 'SETTLED', overdueMinutes: 42, abnormalFeeTotal: 480, usedAt: '2026-04-25 10:21' },
                            { code: 'KM-A0501-003', visitorName: '许家豪', documentNo: '110101199001011234', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', usedAt: '-' },
                            { code: 'KM-A0501-004', visitorName: '吴佳颖', documentNo: '110101199202022345', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', usedAt: '-' },
                            { code: 'KM-A0501-005', visitorName: '陈柏翰', documentNo: 'C123456789', issueStatus: '已发放', status: '已使用', member: '陈柏翰 C123456789', orderNo: 'TS-KM-20260501-0008', orderStatus: '用车中', settlementStatus: 'OVERDUE_IN_PROGRESS', overdueMinutes: 35, abnormalFeeTotal: null, usedAt: '2026-04-25 11:03' },
                            { code: 'KM-A0501-006', visitorName: '张怡君', documentNo: 'D223456789', issueStatus: '已发放', status: '已使用', member: '张怡君 D223456789', orderNo: 'TS-KM-20260501-0011', orderStatus: '已预约', usedAt: '2026-04-25 11:44' }
                        ]
                    },
                    {
                        id: 2,
                        batchNo: 'GT-KM-20260503-002',
                        name: '蓝湾旅行社机场接驳团',
                        enterprise: '金门蓝湾旅行社',
                        issueMode: 'LIST',
                        stationTypes: ['旅行社团体专用'],
                        stations: ['金湖机场停车场'],
                        pickupAt: '2026-05-03 13:30',
                        returnAt: '2026-05-03 19:30',
                        availableStartAt: '2026-04-25 00:00',
                        availableEndAt: '2026-05-03 19:30',
                        totalCount: 8,
                        unusedCount: 6,
                        usedCount: 2,
                        expiredCount: 0,
                        issuedCount: 5,
                        pendingIssueCount: 3,
                        issueFailedCount: 0,
                        availabilityStatus: '已过期',
                        status: '启用',
                        visitors: [
                            { name: '黄俊杰', documentNo: 'E123456789', memberStatus: '已匹配会员', issueStatus: '已发放', issueRemark: '已发放到会员账户' },
                            { name: '蔡佳玲', documentNo: 'F223456789', memberStatus: '已匹配会员', issueStatus: '已发放', issueRemark: '已发放到会员账户' },
                            { name: '周冠宇', documentNo: '110101198805053456', memberStatus: '待匹配会员', issueStatus: '待发放', issueRemark: '证件认证匹配后自动发放' }
                        ],
                        codes: [
                            { code: 'KM-B0503-001', visitorName: '黄俊杰', documentNo: 'E123456789', issueStatus: '已发放', status: '已使用', member: '黄俊杰 E123456789', orderNo: 'TS-KM-20260503-0003', orderStatus: '已完成', usedAt: '2026-04-25 12:12' },
                            { code: 'KM-B0503-002', visitorName: '蔡佳玲', documentNo: 'F223456789', issueStatus: '已发放', status: '已使用', member: '蔡佳玲 F223456789', orderNo: 'TS-KM-20260503-0006', orderStatus: '已取消', usedAt: '2026-04-25 12:18' },
                            { code: 'KM-B0503-003', visitorName: '周冠宇', documentNo: '110101198805053456', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', usedAt: '-' },
                            { code: 'KM-B0503-004', visitorName: '赵怡安', documentNo: 'G123456789', issueStatus: '已发放', status: '未使用', member: '赵怡安 G123456789', orderNo: '', usedAt: '-' }
                        ]
                    },
                    {
                        id: 4,
                        batchNo: 'GT-KM-20260508-004',
                        name: '金门环岛假期待导入名单批次',
                        enterprise: '金门环岛假期',
                        issueMode: 'LIST',
                        stationTypes: ['旅行社团体专用'],
                        stations: ['金湖机场停车场'],
                        pickupAt: '2026-05-08 10:00',
                        returnAt: '2026-05-08 18:00',
                        availableStartAt: '2026-05-01 00:00',
                        availableEndAt: '2026-05-08 18:00',
                        totalCount: 0,
                        unusedCount: 0,
                        usedCount: 0,
                        expiredCount: 0,
                        issuedCount: 0,
                        pendingIssueCount: 0,
                        issueFailedCount: 0,
                        availabilityStatus: '待导入名单',
                        status: '待导入名单',
                        visitors: [],
                        codes: []
                    },
                    {
                        id: 3,
                        batchNo: 'GT-KM-20260510-003',
                        name: '海峡科技员工活动租車券',
                        enterprise: '海峡科技股份有限公司',
                        issueMode: 'QUANTITY',
                        stationTypes: ['普通营运据点', '企业活动合作据点'],
                        stations: ['山外车站停车场', '台北信义企业停车场'],
                        pickupAt: '2026-05-10 08:30',
                        returnAt: '2026-05-10 16:30',
                        availableStartAt: '2026-05-01 00:00',
                        availableEndAt: '2026-05-10 16:30',
                        totalCount: 20,
                        unusedCount: 18,
                        usedCount: 0,
                        expiredCount: 2,
                        issuedCount: 0,
                        pendingIssueCount: 20,
                        issueFailedCount: 0,
                        availabilityStatus: '不可使用',
                        status: '停用',
                        visitors: [],
                        codes: [
                            { code: 'KM-C0510-001', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '未使用', member: '-', orderNo: '', usedAt: '-' },
                            { code: 'KM-C0510-002', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '未使用', member: '-', orderNo: '', usedAt: '-' },
                            { code: 'KM-C0510-003', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '已过期', member: '-', orderNo: '', usedAt: '-' },
                            { code: 'KM-C0510-004', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '已过期', member: '-', orderNo: '', usedAt: '-' }
                        ]
                    }
                ]);

                const detailVisible = ref(false);
                const batchDialogVisible = ref(false);
                const addTicketDialogVisible = ref(false);
                const importDialogVisible = ref(false);
                const importPreviewReady = ref(false);
                const currentBatch = ref(null);
                const editingBatch = ref(null);
                const addTicketForm = reactive({
                    visitorName: '',
                    documentNo: '',
                    count: 1,
                    reason: ''
                });
                const batchForm = reactive({
                    name: '',
                    enterprise: '',
                    serviceMode: '同站租还',
                    timeRuleType: 'FIXED_PERIOD',
                    issueMode: 'LIST',
                    stationTypes: [],
                    stations: [],
                    pickupAt: '',
                    returnAt: '',
                    availableStartAt: '',
                    availableEndAt: '',
                    totalCount: 0,
                    hasImportedVisitors: false,
                    matchedCount: 0,
                    pendingMatchCount: 0,
                    status: '启用'
                });

                watch(() => batchForm.returnAt, (val) => {
                    batchForm.availableEndAt = val || '';
                });
                const importSummary = reactive({
                    status: '',
                    message: '',
                    total: 0,
                    matched: 0,
                    pending: 0,
                    errors: []
                });

                const visitorImportRows = ref([
                    { name: '王志明', documentNo: 'A123456789', memberStatus: '已匹配会员', issueStatus: '已发放', issueRemark: '已发放到会员账户' },
                    { name: '陈佩君', documentNo: 'C123456789', memberStatus: '已匹配会员', issueStatus: '已发放', issueRemark: '已发放到会员账户' },
                    { name: '林雅婷', documentNo: 'B223456789', memberStatus: '已匹配会员', issueStatus: '已发放', issueRemark: '已发放到会员账户' },
                    { name: '吴佳颖', documentNo: '110101199202022345', memberStatus: '待匹配会员', issueStatus: '待发放', issueRemark: '证件认证匹配后自动发放' }
                ]);

                const visitorImportSummary = computed(() => ({
                    matched: visitorImportRows.value.filter(item => item.memberStatus === '已匹配会员').length,
                    pending: visitorImportRows.value.filter(item => item.issueStatus === '待发放').length
                }));

                const stationTypeOptions = ref([
                    { label: '普通营运据点', value: '普通营运据点', normalEntryVisible: true },
                    { label: '旅行社团体专用', value: '旅行社团体专用', normalEntryVisible: false },
                    { label: '企业活动合作据点', value: '企业活动合作据点', normalEntryVisible: true },
                    { label: '机场取还车点', value: '机场取还车点', normalEntryVisible: true },
                    { label: '码头取还车点', value: '码头取还车点', normalEntryVisible: true }
                ]);
                const batchStats = computed(() => batches.value.reduce((acc, item) => {
                    acc.total += 1;
                    if (item.status === '启用') acc.enabled += 1;
                    if (item.status === '停用') acc.disabled += 1;
                    if (item.status === '待导入名单') acc.pendingImport += 1;
                    return acc;
                }, { total: 0, enabled: 0, disabled: 0, pendingImport: 0 }));

                const stationOptions = ref([
                    { label: '金城民生停车场', value: '金城民生停车场', stationType: '旅行社团体专用' },
                    { label: '金湖机场停车场', value: '金湖机场停车场', stationType: '旅行社团体专用' },
                    { label: '山外车站停车场', value: '山外车站停车场', stationType: '普通营运据点' },
                    { label: '台北信义企业停车场', value: '台北信义企业停车场', stationType: '企业活动合作据点' },
                    { label: '水头码头取还点', value: '水头码头取还点', stationType: '码头取还车点' }
                ]);

                const availableStationOptions = computed(() => {
                    const selectedTypes = Array.isArray(batchForm.stationTypes) ? batchForm.stationTypes : [];
                    if (!selectedTypes.length) return stationOptions.value;
                    return stationOptions.value.filter(item => selectedTypes.includes(item.stationType));
                });

                const filterStationOptions = computed(() => {
                    const selectedTypes = Array.isArray(filters.stationTypes) ? filters.stationTypes : [];
                    if (!selectedTypes.length) return stationOptions.value;
                    return stationOptions.value.filter(item => selectedTypes.includes(item.stationType));
                });

                const advancedFilterCount = computed(() => {
                    let count = 0;
                    if (Array.isArray(filters.stationTypes) && filters.stationTypes.length) count += 1;
                    if (filters.station) count += 1;
                    if (Array.isArray(filters.pickupRange) && filters.pickupRange.length === 2) count += 1;
                    return count;
                });

                const stationVehicleCountMap = {
                    '金城民生停车场': 10,
                    '金湖机场停车场': 6,
                    '山外车站停车场': 12,
                    '台北信义企业停车场': 18,
                    '水头码头取还点': 8
                };

                const toTimestamp = (value) => {
                    if (!value) return null;
                    if (value instanceof Date) return value.getTime();
                    const normalized = String(value).replace(' ', 'T');
                    const time = new Date(normalized).getTime();
                    return Number.isNaN(time) ? null : time;
                };

                const getBatchStations = (batch) => {
                    if (Array.isArray(batch?.stations) && batch.stations.length) return batch.stations;
                    return batch?.station ? [batch.station] : [];
                };

                const capacityHint = computed(() => {
                    const pickupTs = toTimestamp(batchForm.pickupAt);
                    const returnTs = toTimestamp(batchForm.returnAt);
                    const selectedStations = Array.isArray(batchForm.stations) ? batchForm.stations : [];
                    if (!selectedStations.length || !pickupTs || !returnTs || pickupTs >= returnTs) {
                        return { visible: false };
                    }
                    const overlapBatches = batches.value.filter(item => {
                        if (item.status !== '启用') return false;
                        if (!getBatchStations(item).some(station => selectedStations.includes(station))) return false;
                        if (editingBatch.value && item.id === editingBatch.value.id) return false;
                        const itemPickupTs = toTimestamp(item.pickupAt);
                        const itemReturnTs = toTimestamp(item.returnAt);
                        if (!itemPickupTs || !itemReturnTs) return false;
                        return pickupTs < itemReturnTs && returnTs > itemPickupTs;
                    }).map(item => ({
                        id: item.id,
                        batchNo: item.batchNo,
                        name: item.name,
                        pickupAt: item.pickupAt,
                        returnAt: item.returnAt,
                        totalCount: item.totalCount
                    }));
                    const stationVehicleCount = selectedStations.reduce((sum, station) => sum + (stationVehicleCountMap[station] || 0), 0);
                    const overlapDemand = overlapBatches.reduce((sum, item) => sum + (Number(item.totalCount) || 0), 0);
                    const currentDemandKnown = batchForm.issueMode === 'LIST'
                        ? batchForm.hasImportedVisitors && Number(batchForm.totalCount) > 0
                        : Number(batchForm.totalCount) > 0;
                    const currentDemand = currentDemandKnown ? Number(batchForm.totalCount) : 0;
                    const combinedDemand = overlapDemand + currentDemand;
                    const sufficient = currentDemandKnown ? combinedDemand <= stationVehicleCount : null;
                    const shortage = currentDemandKnown ? Math.max(combinedDemand - stationVehicleCount, 0) : 0;
                    const overlapBatchText = overlapBatches.map(item => `${item.batchNo}（${item.totalCount}张）`).join('、');
                    return {
                        visible: true,
                        stationVehicleCount,
                        overlapBatches,
                        overlapBatchCount: overlapBatches.length,
                        overlapDemand,
                        currentDemandKnown,
                        currentDemandLabel: currentDemandKnown ? `${currentDemand} 张` : (batchForm.issueMode === 'LIST' ? '待汇入' : '待填写数量'),
                        combinedDemandLabel: currentDemandKnown ? `${combinedDemand} 张` : '待补齐后计算',
                        briefSummary: currentDemandKnown
                            ? `适用据点车辆 ${stationVehicleCount} 台；时间重复批次 ${overlapBatches.length} 批；已占用 ${overlapDemand} 台；本批次 ${currentDemand} 张；共需 ${combinedDemand} 台。`
                            : `适用据点车辆 ${stationVehicleCount} 台；时间重复批次 ${overlapBatches.length} 批；已占用 ${overlapDemand} 台；本批次待补齐数量。`,
                        sufficient,
                        overlapBatchText,
                        summary: currentDemandKnown
                            ? (sufficient
                                ? '当前批次加入后，车辆库存足够。'
                                : `当前批次加入后，预计不足 ${shortage} 台。`)
                            : '补齐名单或数量后再判断当前批次加入后的车辆库存是否足够。',
                        tag: currentDemandKnown ? (sufficient ? '库存足够' : '车辆可能不足') : (batchForm.issueMode === 'LIST' ? '待汇入名单' : '待填写数量')
                    };
                });

                const filteredBatches = computed(() => {
                    return batches.value.filter(item => {
                        const keywordMatch = !filters.keyword ||
                            item.name.includes(filters.keyword) ||
                            item.batchNo.includes(filters.keyword);
                        const enterpriseMatch = !filters.enterprise || item.enterprise === filters.enterprise;
                        const statusMatch = !filters.status || item.status === filters.status;
                        const issueModeMatch = !filters.issueMode || item.issueMode === filters.issueMode;
                        const stationTypeMatch = !filters.stationTypes.length || filters.stationTypes.some(type => (item.stationTypes || []).includes(type));
                        const stationMatch = !filters.station || getBatchStations(item).includes(filters.station);
                        const pickupRangeMatch = !Array.isArray(filters.pickupRange) || filters.pickupRange.length !== 2 || (() => {
                            const itemPickupTs = toTimestamp(item.pickupAt);
                            const startTs = toTimestamp(filters.pickupRange[0]);
                            const endTs = toTimestamp(filters.pickupRange[1]);
                            if (!itemPickupTs || !startTs || !endTs) return true;
                            return itemPickupTs >= startTs && itemPickupTs <= endTs;
                        })();
                        return keywordMatch && enterpriseMatch && statusMatch && issueModeMatch && stationTypeMatch && stationMatch && pickupRangeMatch;
                    });
                });

                const handleFilterStationTypeChange = () => {
                    const availableValues = filterStationOptions.value.map(item => item.value);
                    if (filters.station && !availableValues.includes(filters.station)) {
                        filters.station = '';
                    }
                };

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.enterprise = '';
                    filters.status = '';
                    filters.issueMode = '';
                    filters.stationTypes = [];
                    filters.station = '';
                    filters.pickupRange = [];
                    moreFiltersVisible.value = false;
                    activeBatchCard.value = '';
                };
                const toggleBatchCard = (key) => {
                    const nextKey = activeBatchCard.value === key ? '' : key;
                    activeBatchCard.value = nextKey;
                    filters.status = nextKey && nextKey !== 'ALL' ? nextKey : '';
                };
                const syncBatchCard = (status) => {
                    activeBatchCard.value = status || '';
                };

                const getIssueModeLabel = (mode) => {
                    return mode === 'QUANTITY' ? '数量生成' : '名单发放';
                };

                const formatIssueSummary = (batch) => {
                    if (batch?.issueMode === 'QUANTITY') {
                        return `已领取 ${batch.issuedCount} / 未领取 ${batch.pendingIssueCount}`;
                    }
                    return `已发放 ${batch.issuedCount} / 待发放 ${batch.pendingIssueCount}`;
                };

                const formatIssueUsageSummary = (batch) => {
                    const issueLabel = batch?.issueMode === 'QUANTITY' ? '已领取' : '已发放';
                    return `${issueLabel} ${batch.issuedCount}，已使用 ${batch.usedCount}`;
                };

                const formatStationTypeRange = (batch) => {
                    const values = Array.isArray(batch?.stationTypes) ? batch.stationTypes : [];
                    if (!values.length || values.length === stationTypeOptions.value.length) return '全部据点类型';
                    return values.join('、');
                };

                const formatStationRange = (batch) => {
                    const values = getBatchStations(batch);
                    if (!values.length || values.length === stationOptions.value.length) return '全部适用据点';
                    return values.join('、');
                };

                const formatStationRangeSummary = (batch) => {
                    const typeValues = Array.isArray(batch?.stationTypes) ? batch.stationTypes : [];
                    const stationValues = getBatchStations(batch);
                    const typeCount = (!typeValues.length || typeValues.length === stationTypeOptions.value.length) ? stationTypeOptions.value.length : typeValues.length;
                    const stationCount = (!stationValues.length || stationValues.length === stationOptions.value.length) ? stationOptions.value.length : stationValues.length;
                    return `${typeCount} 类据点 / ${stationCount} 个据点`;
                };

                const formatStationRangeTooltip = (batch) => {
                    return `据点类型：${formatStationTypeRange(batch)}；适用据点：${formatStationRange(batch)}`;
                };

                const getStationTypeEntryText = (option) => {
                    return option?.normalEntryVisible === false ? '不开放一般预约' : '一般预约可用';
                };

                const getStationTypeEntryTagType = (option) => {
                    return option?.normalEntryVisible === false ? 'warning' : 'success';
                };

                const handleStationTypeChange = () => {
                    const availableValues = availableStationOptions.value.map(item => item.value);
                    batchForm.stations = batchForm.stations.filter(station => availableValues.includes(station));
                };

                const openDetail = (row) => {
                    currentBatch.value = row;
                    detailVisible.value = true;
                };

                const openDetailPage = (row) => {
                    router.push(`/operation/channel-ticket-batch-detail?id=${row.id}`);
                };

                const openBatchDialog = (row) => {
                    editingBatch.value = row || null;
                    Object.assign(batchForm, row ? {
                        name: row.name,
                        enterprise: row.enterprise,
                        serviceMode: row.serviceMode || '同站租还',
                        timeRuleType: row.timeRuleType || 'FIXED_PERIOD',
                        issueMode: row.issueMode || 'LIST',
                        stationTypes: Array.isArray(row.stationTypes) ? [...row.stationTypes] : stationTypeOptions.value.map(item => item.value),
                        stations: getBatchStations(row),
                        pickupAt: row.pickupAt,
                        returnAt: row.returnAt,
                        availableStartAt: row.availableStartAt,
                        availableEndAt: row.availableEndAt,
                        totalCount: row.totalCount,
                        hasImportedVisitors: (row.issueMode || 'LIST') === 'LIST',
                        matchedCount: row.issuedCount,
                        pendingMatchCount: row.pendingIssueCount,
                        status: row.status
                    } : {
                        name: '',
                        enterprise: '',
                        serviceMode: '同站租还',
                        timeRuleType: 'FIXED_PERIOD',
                        issueMode: 'LIST',
                        stationTypes: [],
                        stations: [],
                        pickupAt: '',
                        returnAt: '',
                        availableStartAt: '',
                        availableEndAt: '',
                        totalCount: 0,
                        hasImportedVisitors: false,
                        matchedCount: 0,
                        pendingMatchCount: 0,
                        status: '启用'
                    });
                    batchDialogVisible.value = true;
                };

                const saveBatchMock = () => {
                    if (!batchForm.stationTypes.length || !batchForm.stations.length) {
                        ElMessage.warning('请选择适用据点类型和适用据点');
                        return;
                    }
                    if (batchForm.issueMode === 'QUANTITY' && !Number(batchForm.totalCount)) {
                        ElMessage.warning('请填写租車券数量');
                        return;
                    }
                    if (batchForm.issueMode === 'LIST' && !batchForm.hasImportedVisitors) {
                        batchForm.status = '待导入名单';
                        if (!editingBatch.value) {
                            const now = new Date();
                            const pad = (value) => String(value).padStart(2, '0');
                            batchForm.availableStartAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
                        }
                        batchForm.availableEndAt = batchForm.returnAt;
                        batchDialogVisible.value = false;
                        ElMessage.success('原型示意：批次已保存为待导入名单，后续可在详情页导入 / 追加名单');
                        return;
                    }
                    if (!editingBatch.value) {
                        const now = new Date();
                        const pad = (value) => String(value).padStart(2, '0');
                        batchForm.availableStartAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
                    }
                    batchForm.availableEndAt = batchForm.returnAt;
                    batchDialogVisible.value = false;
                    ElMessage.success('原型示意：批次资料已保存');
                };

                const openOrder = (row) => {
                    ElMessage.info(`打开订单详情：${row.orderNo}`);
                };

                const exportCodesMock = () => {
                    ElMessage.success('原型示意：已导出 Excel，包含租車券列表和订单完整数据两个 Sheet');
                };

                const buildAddedTicketCode = (batch) => {
                    const nextNo = (batch.codes?.length || 0) + 1;
                    return `ADD-${String(batch.id).padStart(2, '0')}-${String(nextNo).padStart(3, '0')}`;
                };

                const openAddTicketDialog = () => {
                    addTicketForm.visitorName = '';
                    addTicketForm.documentNo = '';
                    addTicketForm.count = 1;
                    addTicketForm.reason = '';
                    addTicketDialogVisible.value = true;
                };

                const saveAddTicketMock = () => {
                    const batch = currentBatch.value;
                    if (!batch) return;
                    if (!addTicketForm.reason.trim()) {
                        ElMessage.warning('请填写新增原因');
                        return;
                    }
                    if (batch.issueMode === 'LIST') {
                        if (!addTicketForm.visitorName.trim() || !addTicketForm.documentNo.trim()) {
                            ElMessage.warning('请填写用券人姓名和证件号码');
                            return;
                        }
                        const normalizedDocumentNo = addTicketForm.documentNo.trim().toUpperCase();
                        const duplicated = batch.codes.some(item =>
                            item.documentNo && item.documentNo !== '-' && item.documentNo.trim().toUpperCase() === normalizedDocumentNo
                        );
                        if (duplicated) {
                            ElMessage.warning('该证件号码已存在于当前批次，不允许重复新增');
                            return;
                        }
                        const issueStatus = /^[A-F]/.test(normalizedDocumentNo) ? '已发放' : '待发放';
                        const memberText = issueStatus === '已发放'
                            ? `${addTicketForm.visitorName} ${normalizedDocumentNo}`
                            : '-';
                        batch.codes.push({
                            code: buildAddedTicketCode(batch),
                            visitorName: addTicketForm.visitorName,
                            documentNo: normalizedDocumentNo,
                            issueStatus,
                            status: '未使用',
                            member: memberText,
                            orderNo: '',
                            orderStatus: '',
                            usedAt: '-'
                        });
                        batch.visitors.push({
                            name: addTicketForm.visitorName,
                            documentNo: normalizedDocumentNo,
                            memberStatus: issueStatus === '已发放' ? '已匹配会员' : '待匹配会员',
                            issueStatus,
                            issueRemark: issueStatus === '已发放' ? '已发放到会员账户' : '证件认证匹配后自动发放'
                        });
                        batch.totalCount += 1;
                        batch.unusedCount += 1;
                        if (issueStatus === '已发放') batch.issuedCount += 1;
                        else batch.pendingIssueCount += 1;
                    } else {
                        const count = Number(addTicketForm.count) || 0;
                        if (count <= 0) {
                            ElMessage.warning('请填写新增数量');
                            return;
                        }
                        for (let i = 0; i < count; i += 1) {
                            batch.codes.push({
                                code: buildAddedTicketCode(batch),
                                visitorName: '-',
                                documentNo: '-',
                                issueStatus: '未领取',
                                status: '未使用',
                                member: '-',
                                orderNo: '',
                                orderStatus: '',
                                usedAt: '-'
                            });
                        }
                        batch.totalCount += count;
                        batch.unusedCount += count;
                        batch.pendingIssueCount += count;
                    }
                    addTicketDialogVisible.value = false;
                    ElMessage.success('原型示意：已新增租車券');
                };

                const openImportDialog = () => {
                    importPreviewReady.value = false;
                    importSummary.status = '';
                    importSummary.message = '';
                    importSummary.total = 0;
                    importSummary.matched = 0;
                    importSummary.pending = 0;
                    importSummary.errors = [];
                    importDialogVisible.value = true;
                };

                const downloadTemplateMock = () => {
                    ElMessage.info('原型示意：下载用券人名单模板');
                };

                const previewImportMock = (hasError) => {
                    if (hasError) {
                        importSummary.status = 'error';
                        importSummary.message = '名单中存在证件号码格式错误、重复或必填字段缺失，无法确认导入。请修正后重新选择文件。';
                        importSummary.total = 0;
                        importSummary.matched = 0;
                        importSummary.pending = 0;
                        importSummary.errors = [
                            { rowNo: 4, documentNo: 'A12345678', reason: '证件号码格式错误' },
                            { rowNo: 6, documentNo: 'A123456789', reason: '与当前批次已有证件号码重复' },
                            { rowNo: 8, documentNo: '', reason: '缺少证件号码' }
                        ];
                        importPreviewReady.value = true;
                        ElMessage.error('导入异常：请修正格式、重复或缺失字段');
                        return;
                    }
                    importSummary.status = 'success';
                    importSummary.message = '名单校验通过，可以确认导入；同一批次证件号码均不重复。后续详情页只允许追加导入，不覆盖原名单。';
                    importSummary.total = visitorImportRows.value.length;
                    importSummary.matched = visitorImportSummary.value.matched;
                    importSummary.pending = visitorImportSummary.value.pending;
                    importSummary.errors = [];
                    importPreviewReady.value = true;
                    ElMessage.success('导入成功');
                };

                const confirmImportVisitors = () => {
                    if (importSummary.status !== 'success') {
                        ElMessage.warning('导入异常未处理，不能确认汇入');
                        return;
                    }
                    batchForm.totalCount = importSummary.total;
                    batchForm.hasImportedVisitors = true;
                    batchForm.matchedCount = importSummary.matched;
                    batchForm.pendingMatchCount = importSummary.pending;
                    importDialogVisible.value = false;
                    ElMessage.success('原型示意：已导入用券人名单并完成会员匹配');
                };

                const getIssueStatusType = (status) => {
                    if (status === '已发放') return 'success';
                    if (status === '发放失败') return 'danger';
                    if (status === '未领取') return 'info';
                    return 'warning';
                };

                const getTicketStatusType = (status) => {
                    if (status === '已使用') return 'success';
                    if (status === '已过期') return 'info';
                    return 'warning';
                };

                const getOrderStatusType = (status) => {
                    if (status === '已完成') return 'success';
                    if (status === '已取消') return 'info';
                    if (status === '用车中') return 'warning';
                    return 'info';
                };
</script>

<style scoped>
        .channel-ticket-batches-page {
            min-height: 100%;
        }

.custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        .table-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #fff;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .info-table th {
            width: 136px;
            background: #f8fafc;
            color: #64748b;
            font-weight: 500;
            text-align: left;
        }

        .info-table th,
        .info-table td {
            border: 1px solid #e5e7eb;
            padding: 10px 12px;
        }

        .channel-ticket-batches-page :deep(.el-table th.el-table__cell) {
            background: #f8fafc !important;
            color: #475569;
        }

        .official-more-filter-button {
            min-width: 116px;
        }

        .ticket-filter-daterange {
            width: 100% !important;
        }

        .ticket-filter-daterange-wrap {
            width: 360px;
            max-width: 100%;
            flex: 0 0 360px;
        }

        .ticket-filter-daterange-wrap :deep(.el-date-editor) {
            width: 100% !important;
        }

        .ticket-filter-daterange :deep(.el-range-input) {
            width: 88px;
            font-size: 12px;
        }

        .ticket-filter-daterange :deep(.el-range-separator) {
            width: 20px;
            padding: 0 4px;
        }

        .station-range-tooltip {
            max-width: 420px;
            white-space: normal;
            line-height: 1.5;
        }
</style>
