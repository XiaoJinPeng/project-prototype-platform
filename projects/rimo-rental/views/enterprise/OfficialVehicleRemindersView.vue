<template>
            <main class="official-vehicle-reminders-page">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">清洁保养提醒</h1>
                        <p class="text-gray-500 text-sm mt-1">按企业通用或分公司专用母版持续判断提醒，不自动生成工单、不自动改变车辆状态。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button v-if="isHeadquartersAdmin" plain @click="notificationDialogVisible = true">
                            <el-icon class="mr-1">
                                <Message></Message>
                            </el-icon> 通知设定
                        </el-button>
                        <el-button type="primary" @click="openSettingsDialog()">
                            <el-icon class="mr-1">
                                <Setting></Setting>
                            </el-icon> 设定
                        </el-button>
                    </div>
                </div>

                <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'pendingMaintenance' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('pendingMaintenance')">
                        <span class="text-sm text-gray-500 font-medium mb-1">待保养车辆</span>
                        <span class="card-value text-amber-500">{{ stats.pendingMaintenanceVehicles }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'pendingCleaning' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('pendingCleaning')">
                        <span class="text-sm text-gray-500 font-medium mb-1">待清洁车辆</span>
                        <span class="card-value text-cyan-600">{{ stats.pendingCleaningVehicles }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'newToday' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('newToday')">
                        <span class="text-sm text-gray-500 font-medium mb-1">今日新增待处理</span>
                        <span class="card-value text-gray-800">{{ stats.newToday }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'incompleteVehicles' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('incompleteVehicles')">
                        <span class="text-sm text-gray-500 font-medium mb-1">未配置母版 / 资料待补</span>
                        <span class="card-value text-rose-500">{{ stats.incompleteVehicles }}</span>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
                        <el-input v-model="filters.query" placeholder="搜索车牌号 / 车型" prefix-icon="Search" clearable style="width: 220px"></el-input>
                        <el-select v-model="filters.type" placeholder="提醒类型" clearable style="width: 140px">
                            <el-option label="保养提醒" value="maintenance"></el-option>
                            <el-option label="清洁提醒" value="cleaning"></el-option>
                        </el-select>
                        <el-select v-model="filters.status" placeholder="提醒状态" clearable style="width: 140px">
                            <el-option label="待处理" value="pending"></el-option>
                            <el-option label="已完成" value="completed"></el-option>
                            <el-option label="已忽略" value="ignored"></el-option>
                            <el-option label="已失效" value="invalidated"></el-option>
                        </el-select>
                        <el-select v-model="filters.branch" placeholder="分公司" clearable style="width: 180px">
                            <el-option v-for="item in branchOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                        <el-select v-model="filters.scope" placeholder="母版范围" clearable style="width: 150px">
                            <el-option label="企业通用" value="enterprise"></el-option>
                            <el-option label="分公司专用" value="branch"></el-option>
                        </el-select>
                        <el-select v-model="filters.templateKey" placeholder="套用母版" clearable style="width: 240px">
                            <el-option v-for="item in templateFilterOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </div>

                    
                    <el-table :data="pagedReminders" style="width: 100%">
                        <el-table-column label="车辆" min-width="210">
                            <template #default="{ row }">
                                <div class="font-bold text-gray-800">{{ getVehicle(row.vehicleId)?.licensePlate }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ getVehicle(row.vehicleId)?.model }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="分公司 / 据点" min-width="180">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700">{{ getBranchName(getVehicle(row.vehicleId)?.branch) }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ getVehicle(row.vehicleId)?.stationName || '未分配据点' }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="提醒类型" width="120" align="center">
                            <template #default="{ row }">
                                <el-tag :type="row.type === 'maintenance' ? 'warning' : 'success'" effect="plain">
                                    {{ row.type === 'maintenance' ? '保养提醒' : '清洁提醒' }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="当前套用母版" min-width="200">
                            <template #default="{ row }">
                                <div class="text-sm font-medium text-gray-700">{{ getTemplateDisplayName(row.type, row.templateId) }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ row.threshold }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="当前值" min-width="220">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700">{{ row.currentSummary }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ row.currentBase }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="触发时间" width="160">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700">{{ row.triggeredAt }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" width="120" align="center">
                            <template #default="{ row }">
                                <el-tag v-if="row.status === 'pending' && row.dueLevel === 'overdue'" type="danger">已到期</el-tag>
                                <el-tag v-else-if="row.status === 'pending'" type="warning">即将到期</el-tag>
                                <el-tag v-else-if="row.status === 'completed'" type="success">已完成</el-tag>
                                <el-tag v-else-if="row.status === 'ignored'" type="info">已忽略</el-tag>
                                <el-tag v-else type="info" effect="plain">已失效</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="250" align="right" fixed="right">
                            <template #default="{ row }">
                                <div class="flex justify-end gap-2">
                                    <template v-if="row.status === 'pending'">
                                        <el-button type="primary" link size="small" @click="openCompletionDialog(row)">
                                            {{ row.type === 'maintenance' ? '登记已保养' : '登记已清洁' }}
                                        </el-button>
                                        <el-button v-if="row.status === 'pending'" type="warning" link size="small" @click="ignoreReminder(row)">忽略本次</el-button>
                                    </template>
                                    <el-button v-if="row.status === 'completed'" type="primary" link size="small" @click="openCompletionRecordDialog(row)">查看登记内容</el-button>
                                    <el-button type="primary" link size="small" @click="goVehicleDetail(row.vehicleId)">查看车辆</el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="flex justify-between items-center p-4 border-t border-gray-100">
                        <div class="flex items-center gap-2 text-sm text-gray-500">
                            <span>共 {{ filteredReminders.length }} 条提醒，每页</span>
                            <el-select v-model="reminderPagination.pageSize" style="width: 90px" @change="reminderPagination.currentPage = 1">
                                <el-option label="10 条" :value="10"></el-option>
                                <el-option label="20 条" :value="20"></el-option>
                                <el-option label="50 条" :value="50"></el-option>
                            </el-select>
                        </div>
                        <el-pagination 
                            v-model:current-page="reminderPagination.currentPage"
                            :page-size="reminderPagination.pageSize"
                            layout="prev, pager, next"
                            :total="filteredReminders.length">
                        </el-pagination>
                    </div>
                </div>

                
                <el-dialog v-model="notificationDialogVisible" title="通知设定" width="90%" class="reminder-notification-dialog" destroy-on-close>
                    <el-tabs v-model="notificationActiveTab">
                        <el-tab-pane label="通知人设定" name="settings">
                    <div class="flex justify-between items-center mb-4">
                        <div class="text-sm text-gray-500">通知人可手动填写，不要求是系统账号；外部 Email 只做提醒触达，不授予系统权限。</div>
                        <el-button type="primary" @click="addNotificationSetting">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新增通知人
                        </el-button>
                    </div>
                    <el-table :data="notificationSettings" style="width: 100%">
                        <el-table-column label="通知人" min-width="150">
                            <template #default="{ row }">
                                <el-input v-model="row.receiverName" placeholder="姓名"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="Email" min-width="240">
                            <template #default="{ row }">
                                <el-input v-model="row.receiverEmail" placeholder="name@example.com"></el-input>
                            </template>
                        </el-table-column>
                        <el-table-column label="通知范围" min-width="220">
                            <template #default="{ row }">
                                <el-checkbox-group v-model="row.noticeScopes">
                                    <el-checkbox label="maintenance">保养提醒</el-checkbox>
                                    <el-checkbox label="cleaning">清洁提醒</el-checkbox>
                                </el-checkbox-group>
                            </template>
                        </el-table-column>
                        <el-table-column label="车辆范围" min-width="340">
                            <template #default="{ row }">
                                <div class="flex flex-col gap-2">
                                    <el-radio-group v-model="row.vehicleScope" @change="handleNotificationVehicleScopeChange(row)">
                                        <el-radio-button label="all">全部车辆</el-radio-button>
                                        <el-radio-button label="condition">按条件匹配</el-radio-button>
                                    </el-radio-group>
                                    <template v-if="row.vehicleScope === 'condition'">
                                        <div class="flex gap-2">
                                            <el-select v-model="row.vehicleConditionType" placeholder="匹配条件" style="width: 120px" @change="handleNotificationConditionTypeChange(row)">
                                                <el-option v-for="item in notificationVehicleConditionTypes" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                            </el-select>
                                            <el-select 
                                                v-model="row.vehicleConditionValues"
                                                multiple
                                                filterable
                                                collapse-tags
                                                collapse-tags-tooltip
                                                :disabled="!row.vehicleConditionType"
                                                :placeholder="getNotificationConditionValuePlaceholder(row)"
                                                style="flex: 1; min-width: 0">
                                                <el-option v-for="item in getNotificationConditionValueOptions(row)" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                            </el-select>
                                        </div>
                                        <div class="text-xs text-gray-500">
                                            当前条件匹配 {{ getNotificationMatchedVehicles(row).length }} 台车辆；后续新增车辆符合条件时自动纳入通知范围。
                                        </div>
                                    </template>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="120" align="center">
                            <template #default="{ row }">
                                <el-switch 
                                    :model-value="row.status === 'enabled'"
                                    inline-prompt
                                    active-text="启用"
                                    inactive-text="停用"
                                    @change="(value) => row.status = value ? 'enabled' : 'disabled'"
                                ></el-switch>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="90" align="right" fixed="right">
                            <template #default="{ row }">
                                <el-button type="danger" link size="small" @click="removeNotificationSetting(row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                        </el-tab-pane>
                        <el-tab-pane label="发送记录" name="logs">
                            
                            <div class="flex flex-wrap gap-3 mb-4">
                                <el-select v-model="notificationLogFilters.type" placeholder="通知类型" clearable style="width: 150px">
                                    <el-option label="保养提醒" value="maintenance"></el-option>
                                    <el-option label="清洁提醒" value="cleaning"></el-option>
                                </el-select>
                                <el-select v-model="notificationLogFilters.status" placeholder="发送状态" clearable style="width: 150px">
                                    <el-option label="成功" value="success"></el-option>
                                    <el-option label="部分失败" value="partial_failed"></el-option>
                                    <el-option label="失败" value="failed"></el-option>
                                </el-select>
                                <el-input v-model="notificationLogFilters.keyword" placeholder="搜索车牌号 / 接收人 / Email" clearable style="width: 280px"></el-input>
                                <el-date-picker v-model="notificationLogFilters.dateRange" type="daterange" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 260px"></el-date-picker>
                            </div>
                            <el-table :data="filteredNotificationSendLogs" style="width: 100%" height="420">
                                <el-table-column type="expand" width="48">
                                    <template #default="{ row }">
                                        <div class="px-8 py-3 bg-gray-50">
                                            <div class="text-sm font-medium text-gray-700 mb-3">发送明细</div>
                                            <el-table :data="row.recipients" size="small" style="width: 100%">
                                                <el-table-column prop="receiverName" label="接收人" min-width="160"></el-table-column>
                                                <el-table-column prop="receiverEmail" label="Email" min-width="240"></el-table-column>
                                                <el-table-column label="发送状态" width="120" align="center">
                                                    <template #default="{ row: detail }">
                                                        <el-tag :type="detail.status === 'success' ? 'success' : 'danger'" effect="plain">{{ detail.status === 'success' ? '成功' : '失败' }}</el-tag>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="失败原因" min-width="220" show-overflow-tooltip>
                                                    <template #default="{ row: detail }">{{ detail.failureReason || '-' }}</template>
                                                </el-table-column>
                                            </el-table>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="sentAt" label="发送时间" width="170"></el-table-column>
                                <el-table-column label="通知内容" min-width="220">
                                    <template #default="{ row }">
                                        <div class="font-medium text-gray-800">{{ getNotificationTypeText(row.type) }}｜{{ row.stage === 'advance' ? '即将到期' : '已到期' }}</div>
                                        <div class="text-xs text-gray-500">{{ getVehicleLabel(row.vehicleId) }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="recipientCount" label="收件人数" width="100" align="center"></el-table-column>
                                <el-table-column prop="successCount" label="成功" width="90" align="center"></el-table-column>
                                <el-table-column prop="failedCount" label="失败" width="90" align="center"></el-table-column>
                                <el-table-column label="发送状态" width="120" align="center">
                                    <template #default="{ row }">
                                        <el-tag :type="getNotificationBatchStatusTag(row.status)" effect="plain">{{ getNotificationBatchStatusText(row.status) }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="关联提醒状态" width="130" align="center">
                                    <template #default="{ row }">
                                        <el-tag type="info" effect="plain">{{ getReminderStatusText(row.reminderStatus) }}</el-tag>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                    <template #footer>
                        <el-button @click="notificationDialogVisible = false">取消</el-button>
                        <el-button v-if="notificationActiveTab === 'settings'" type="primary" @click="saveNotificationSettings">保存</el-button>
                    </template>
                </el-dialog>

                
                <el-dialog v-model="settingsDialogVisible" width="1560px" top="3vh" class="reminder-settings-dialog" destroy-on-close>
                    <template #header>
                        <div class="flex items-center justify-between pr-8">
                            <div class="text-base font-semibold text-gray-800">清洁保养提醒设定</div>
                            <div v-if="isHeadquartersAdmin" class="flex items-center gap-2 text-sm text-gray-500">
                                <span>是否启用分公司专用</span>
                                <el-switch v-model="branchTemplateFeatureEnabled"></el-switch>
                            </div>
                        </div>
                    </template>
                    <el-tabs v-model="settingsTab">
                        <el-tab-pane label="保养母版" name="maintenance">
                            <div class="flex justify-between items-center mb-4">
                                <div class="text-sm text-gray-500">支持企业通用母版和分公司专用母版；分公司专用母版只适用于对应分公司车辆。</div>
                                <el-button v-if="canCreateTemplates" type="primary" @click="openTemplateDialog('maintenance')">
                                    <el-icon class="mr-1">
                                        <Plus></Plus>
                                    </el-icon> 新增保养母版
                                </el-button>
                            </div>
                            <el-table :data="maintenanceTemplates" style="width: 100%">
                                <el-table-column prop="name" label="母版名称" min-width="220"></el-table-column>
                                <el-table-column label="适用范围" min-width="180">
                                    <template #default="{ row }">
                                        <div class="text-sm text-gray-700">{{ getTemplateScopeText(row) }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="保养规则" min-width="260">
                                    <template #default="{ row }">
                                        <div class="text-sm text-gray-700">到期：{{ row.thresholdMileageKm.toLocaleString() }} km / {{ row.thresholdMonths }} 个月</div>
                                        <div class="text-xs text-gray-500 mt-1">提前：{{ row.advanceMileageKm.toLocaleString() }} km / {{ row.advanceDays }} 天提醒</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="已套用车辆数" width="140" align="center">
                                    <template #default="{ row }">{{ getAppliedCount('maintenance', row.id) }}</template>
                                </el-table-column>
                                <el-table-column label="状态" width="120" align="center">
                                    <template #default="{ row }">
                                        <el-switch 
                                            :model-value="row.status === 'enabled'"
                                            :disabled="!canManageTemplate(row)"
                                            inline-prompt
                                            active-text="启用"
                                            inactive-text="停用"
                                            @change="(value) => toggleTemplateStatus('maintenance', row, value)"
                                        ></el-switch>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="150" align="right" fixed="right">
                                    <template #default="{ row }">
                                        <template v-if="canManageTemplate(row)">
                                            <el-button type="primary" link size="small" @click="openTemplateDialog('maintenance', row)">编辑</el-button>
                                            <el-button type="danger" link size="small" @click="removeTemplate('maintenance', row)">删除</el-button>
                                        </template>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>

                        <el-tab-pane label="清洁母版" name="cleaning">
                            <div class="flex justify-between items-center mb-4">
                                <div class="text-sm text-gray-500">支持企业通用母版和分公司专用母版；分公司专用母版只适用于对应分公司车辆。</div>
                                <el-button v-if="canCreateTemplates" type="primary" @click="openTemplateDialog('cleaning')">
                                    <el-icon class="mr-1">
                                        <Plus></Plus>
                                    </el-icon> 新增清洁母版
                                </el-button>
                            </div>
                            <el-table :data="cleaningTemplates" style="width: 100%">
                                <el-table-column prop="name" label="母版名称" min-width="220"></el-table-column>
                                <el-table-column label="适用范围" min-width="180">
                                    <template #default="{ row }">
                                        <div class="text-sm text-gray-700">{{ getTemplateScopeText(row) }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="清洁规则" min-width="260">
                                    <template #default="{ row }">
                                        <div class="text-sm text-gray-700">到期：{{ row.thresholdUseCount }} 次 / {{ row.thresholdDays }} 天</div>
                                        <div class="text-xs text-gray-500 mt-1">提前：{{ row.advanceUseCount }} 次 / {{ row.advanceDays }} 天提醒</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="已套用车辆数" width="140" align="center">
                                    <template #default="{ row }">{{ getAppliedCount('cleaning', row.id) }}</template>
                                </el-table-column>
                                <el-table-column label="状态" width="120" align="center">
                                    <template #default="{ row }">
                                        <el-switch 
                                            :model-value="row.status === 'enabled'"
                                            :disabled="!canManageTemplate(row)"
                                            inline-prompt
                                            active-text="启用"
                                            inactive-text="停用"
                                            @change="(value) => toggleTemplateStatus('cleaning', row, value)"
                                        ></el-switch>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="150" align="right" fixed="right">
                                    <template #default="{ row }">
                                        <template v-if="canManageTemplate(row)">
                                            <el-button type="primary" link size="small" @click="openTemplateDialog('cleaning', row)">编辑</el-button>
                                            <el-button type="danger" link size="small" @click="removeTemplate('cleaning', row)">删除</el-button>
                                        </template>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>

                        <el-tab-pane label="车辆套用" name="binding">
                            <div class="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 text-sm text-amber-800 mb-4">
                                保养和清洁分开判断。只补齐保养母版和保养基线时，系统可正常计算保养提醒；清洁资料未补齐只影响清洁提醒，不影响保养提醒。
                            </div>
                            <div class="flex flex-wrap items-center gap-3 mb-3">
                                <el-input v-model="vehicleBindingFilters.keyword" clearable placeholder="搜索车牌 / 车型 / 据点" style="width: 260px" @input="vehicleBindingPagination.currentPage = 1">
                                    <template #prefix>
                                        <el-icon><Search></Search></el-icon>
                                    </template>
                                </el-input>
                                <el-select v-model="vehicleBindingFilters.branch" clearable placeholder="分公司" style="width: 180px" @change="vehicleBindingPagination.currentPage = 1">
                                    <el-option v-for="item in branchOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                                <el-select v-model="vehicleBindingFilters.status" clearable placeholder="资料状态" style="width: 190px" @change="vehicleBindingPagination.currentPage = 1">
                                    <el-option label="资料待补" value="incomplete"></el-option>
                                    <el-option label="保养待补" value="maintenanceIncomplete"></el-option>
                                    <el-option label="清洁待补" value="cleaningIncomplete"></el-option>
                                    <el-option label="已可计算" value="complete"></el-option>
                                </el-select>
                                <el-button plain @click="resetVehicleBindingFilters">重置</el-button>
                                <div class="flex-1"></div>
                                <span class="text-sm text-gray-500">已选 {{ selectedBindingVehicleCount }} 台</span>
                                <el-button type="primary" :disabled="selectedBindingVehicleCount === 0" @click="openBatchBindingDialog">
                                    <el-icon class="mr-1"><Connection></Connection></el-icon> 批量套用母版
                                </el-button>
                            </div>
                            
                            <el-table ref="vehicleBindingTableRef" :data="pagedVehicles" row-key="id" height="520" style="width: 100%" @selection-change="handleVehicleBindingSelectionChange">
                                <el-table-column type="selection" width="48" :selectable="canSelectVehicleForBatch" reserve-selection></el-table-column>
                                <el-table-column label="车辆" min-width="180">
                                    <template #default="{ row }">
                                        <div class="font-bold text-gray-800">{{ row.licensePlate }}</div>
                                        <div class="text-xs text-gray-500 mt-1">{{ row.model }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="分公司" width="140">
                                    <template #default="{ row }">{{ getBranchName(row.branch) }}</template>
                                </el-table-column>
                                <el-table-column label="当前里程" width="140">
                                    <template #default="{ row }">
                                        <el-input-number v-model="row.currentMileage" :min="0" :step="100" controls-position="right" style="width: 120px"></el-input-number>
                                    </template>
                                </el-table-column>
                                <el-table-column label="保养母版" min-width="200">
                                    <template #default="{ row }">
                                        <el-select :model-value="getTemplateById('maintenance', row.maintenanceTemplateId)" value-key="id" placeholder="选择保养母版" clearable style="width: 180px" @change="value => row.maintenanceTemplateId = value ? value.id : ''" @clear="row.maintenanceTemplateId = ''">
                                            <el-option v-for="item in getAvailableTemplates('maintenance', row.branch, row.maintenanceTemplateId)" :key="item.id" :label="item.name" :value="item" :disabled="!isTemplateSelectableForBranch('maintenance', item, row.branch)"></el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="清洁母版" min-width="200">
                                    <template #default="{ row }">
                                        <el-select :model-value="getTemplateById('cleaning', row.cleaningTemplateId)" value-key="id" placeholder="选择清洁母版" clearable style="width: 180px" @change="value => row.cleaningTemplateId = value ? value.id : ''" @clear="row.cleaningTemplateId = ''">
                                            <el-option v-for="item in getAvailableTemplates('cleaning', row.branch, row.cleaningTemplateId)" :key="item.id" :label="item.name" :value="item" :disabled="!isTemplateSelectableForBranch('cleaning', item, row.branch)"></el-option>
                                        </el-select>
                                    </template>
                                </el-table-column>
                                <el-table-column label="上次保养日期" width="170">
                                    <template #default="{ row }">
                                        <el-date-picker v-model="row.lastMaintenanceAt" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 150px"></el-date-picker>
                                    </template>
                                </el-table-column>
                                <el-table-column label="上次保养里程" width="150">
                                    <template #default="{ row }">
                                        <el-input-number v-model="row.lastMaintenanceMileage" :min="0" :step="100" controls-position="right" style="width: 130px"></el-input-number>
                                    </template>
                                </el-table-column>
                                <el-table-column label="上次清洁日期" width="170">
                                    <template #default="{ row }">
                                        <el-date-picker v-model="row.lastCleaningAt" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 150px"></el-date-picker>
                                    </template>
                                </el-table-column>
                                <el-table-column label="状态" width="190" align="center">
                                    <template #default="{ row }">
                                        <div class="flex flex-col items-center gap-1">
                                            <el-tag :type="isMaintenanceConfigIncomplete(row) ? 'danger' : 'success'" effect="plain">
                                                {{ isMaintenanceConfigIncomplete(row) ? '保养待补' : '保养可计算' }}
                                            </el-tag>
                                            <el-tag :type="isCleaningConfigIncomplete(row) ? 'danger' : 'success'" effect="plain">
                                                {{ isCleaningConfigIncomplete(row) ? '清洁待补' : '清洁可计算' }}
                                            </el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="120" align="right" fixed="right">
                                    <template #default="{ row }">
                                        <el-button type="primary" link size="small" @click="saveVehicleBinding(row)">保存</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="flex justify-between items-center mt-4">
                                <div class="flex items-center gap-2 text-sm text-gray-500">
                                    <span>共 {{ filteredBindingVehicles.length }} 台车辆，每页</span>
                                    <el-select v-model="vehicleBindingPagination.pageSize" style="width: 90px" @change="vehicleBindingPagination.currentPage = 1">
                                        <el-option label="10 台" :value="10"></el-option>
                                        <el-option label="20 台" :value="20"></el-option>
                                        <el-option label="50 台" :value="50"></el-option>
                                    </el-select>
                                </div>
                                <el-pagination 
                                    v-model:current-page="vehicleBindingPagination.currentPage"
                                    :page-size="vehicleBindingPagination.pageSize"
                                    layout="prev, pager, next"
                                    :total="filteredBindingVehicles.length">
                                </el-pagination>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-dialog>

                <el-dialog v-model="batchBindingDialogVisible" title="批量套用母版" width="560px" destroy-on-close>
                    <div class="text-sm text-gray-500 mb-4">
                        已选择 {{ selectedBindingVehicleCount }} 台车辆。批量操作只更新所选母版，不修改上次保养日期、上次保养里程或上次清洁日期。
                    </div>
                    <el-form label-position="top">
                        <el-form-item label="保养母版">
                            <el-select v-model="batchBindingForm.maintenanceTemplateId" clearable placeholder="不调整保养母版" style="width: 100%">
                                <el-option v-for="item in batchMaintenanceTemplateOptions" :key="item.id" :label="`${item.name}（${getTemplateScopeText(item)}）`" :value="item.id" :disabled="item.status === 'disabled'"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="清洁母版">
                            <el-select v-model="batchBindingForm.cleaningTemplateId" clearable placeholder="不调整清洁母版" style="width: 100%">
                                <el-option v-for="item in batchCleaningTemplateOptions" :key="item.id" :label="`${item.name}（${getTemplateScopeText(item)}）`" :value="item.id" :disabled="item.status === 'disabled'"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <el-button @click="batchBindingDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="saveBatchVehicleBinding">确认套用</el-button>
                    </template>
                </el-dialog>

                <el-dialog v-model="templateDialogVisible" :title="templateDialogTitle" width="560px" destroy-on-close>
                    <el-form label-position="top">
                        <el-form-item label="母版名称" required>
                            <el-input v-model="templateForm.name" placeholder="例如：新车 / 老车 / 常用接待车"></el-input>
                        </el-form-item>
                        <template v-if="templateForm.type === 'maintenance'">
                            <div class="grid grid-cols-2 gap-4">
                                <el-form-item label="保养里程阈值 (km)" required>
                                    <el-input-number v-model="templateForm.thresholdMileageKm" :min="1" :step="100" style="width: 100%"></el-input-number>
                                </el-form-item>
                                <el-form-item label="提前提醒公里数 (km)" required>
                                    <el-input-number v-model="templateForm.advanceMileageKm" :min="0" :step="100" style="width: 100%"></el-input-number>
                                </el-form-item>
                                <el-form-item label="保养间隔（月）" required>
                                    <el-input-number v-model="templateForm.thresholdMonths" :min="1" style="width: 100%"></el-input-number>
                                </el-form-item>
                                <el-form-item label="提前提醒天数" required>
                                    <el-input-number v-model="templateForm.advanceDays" :min="0" style="width: 100%"></el-input-number>
                                </el-form-item>
                            </div>
                        </template>
                        <template v-else>
                            <div class="grid grid-cols-2 gap-4">
                                <el-form-item label="清洁用车次数阈值" required>
                                    <el-input-number v-model="templateForm.thresholdUseCount" :min="1" style="width: 100%"></el-input-number>
                                </el-form-item>
                                <el-form-item label="提前提醒次数" required>
                                    <el-input-number v-model="templateForm.advanceUseCount" :min="0" style="width: 100%"></el-input-number>
                                </el-form-item>
                                <el-form-item label="清洁间隔（天）" required>
                                    <el-input-number v-model="templateForm.thresholdDays" :min="1" style="width: 100%"></el-input-number>
                                </el-form-item>
                                <el-form-item label="提前提醒天数" required>
                                    <el-input-number v-model="templateForm.advanceDays" :min="0" style="width: 100%"></el-input-number>
                                </el-form-item>
                            </div>
                        </template>
                        <el-form-item label="备注">
                            <el-input v-model="templateForm.remark" type="textarea" :rows="3" placeholder="补充该母版适用车辆范围"></el-input>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <el-button @click="templateDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="saveTemplate">保存</el-button>
                    </template>
                </el-dialog>

                <el-dialog v-model="completionDialogVisible" :title="completionDialogTitle" width="480px" destroy-on-close>
                    <div class="bg-gray-50 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-600 mb-4">
                        当前车辆：<span class="font-bold text-gray-800">{{ activeReminderVehicle?.licensePlate }}</span>
                        <span class="mx-2">|</span>
                        <span>{{ activeReminderVehicle?.model }}</span>
                    </div>
                    <el-form label-position="top">
                        <el-form-item label="完成日期" required>
                            <el-date-picker v-model="completionForm.completedAt" type="date" value-format="YYYY-MM-DD" placeholder="选择完成日期" style="width: 100%"></el-date-picker>
                        </el-form-item>
                        <el-form-item v-if="activeReminder && activeReminder.type === 'maintenance'" label="完成里程" required>
                            <el-input-number v-model="completionForm.completedMileage" :min="0" :step="100" style="width: 180px"></el-input-number>
                        </el-form-item>
                        <el-form-item label="备注">
                            <el-input v-model="completionForm.remark" type="textarea" :rows="3" placeholder="补充本次保养或清洁说明"></el-input>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <el-button @click="completionDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="submitCompletion">确认登记</el-button>
                    </template>
                </el-dialog>

                <el-dialog v-model="completionRecordDialogVisible" title="登记内容" width="520px" destroy-on-close>
                    <div class="bg-gray-50 rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-600 mb-4">
                        当前车辆：<span class="font-bold text-gray-800">{{ activeReminderVehicle?.licensePlate }}</span>
                        <span class="mx-2">|</span>
                        <span>{{ activeReminderVehicle?.model }}</span>
                    </div>
                    <el-descriptions :column="1" border>
                        <el-descriptions-item label="提醒类型">{{ activeReminder?.type === 'maintenance' ? '保养提醒' : '清洁提醒' }}</el-descriptions-item>
                        <el-descriptions-item label="登记完成日期">{{ activeReminder?.completionRecord?.completedAt || '-' }}</el-descriptions-item>
                        <el-descriptions-item v-if="activeReminder && activeReminder.type === 'maintenance'" label="登记完成里程">{{ activeReminder?.completionRecord?.completedMileage ? `${activeReminder.completionRecord.completedMileage.toLocaleString()} km` : '-' }}</el-descriptions-item>
                        <el-descriptions-item label="登记备注">{{ activeReminder?.completionRecord?.remark || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="登记人">{{ activeReminder?.completionRecord?.operatorName || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="登记时间">{{ activeReminder?.completionRecord?.operatedAt || '-' }}</el-descriptions-item>
                        <el-descriptions-item label="登记后基线">{{ activeReminder?.completionRecord?.baselineText || '-' }}</el-descriptions-item>
                    </el-descriptions>
                    <template #footer>
                        <el-button type="primary" @click="completionRecordDialogVisible = false">关闭</el-button>
                    </template>
                </el-dialog>

                <el-dialog v-model="prototypeLogDialogVisible" title="原型修改记录" width="560px">
                    <div class="space-y-4">
                        <div class="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                            <div class="flex items-center justify-between gap-3">
                                <div class="font-semibold text-gray-800">清洁保养提醒｜PRD 同步记录</div>
                                <el-tag type="info" effect="plain">2026-06-29</el-tag>
                            </div>
                            <div class="text-sm text-gray-500 mt-1">页面：清洁保养提醒</div>
                        </div>
                        <div class="space-y-3 text-sm text-gray-700 leading-6">
                            <div class="border rounded-lg px-4 py-3">
                                <div class="font-semibold text-gray-800 mb-1">v1.2｜补充已完成提醒登记内容查看</div>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li>已完成记录可查看登记完成时保存的日期、里程、备注、操作人和操作时间。</li>
                                    <li>提醒列表已完成状态增加“查看登记内容”入口。</li>
                                    <li>登记内容弹窗为只读展示，不允许修改登记内容。</li>
                                </ul>
                            </div>
                            <div class="border rounded-lg px-4 py-3">
                                <div class="font-semibold text-gray-800 mb-1">v1.1｜还原前次丢失内容</div>
                                <ul class="list-disc pl-5 space-y-1">
                                    <li>恢复已失效状态、车辆套用批量操作、母版删除、通知发送记录和顶部统计卡待处理口径。</li>
                                    <li>统一已忽略提醒仅保留历史、只可查看车辆，不允许登记完成。</li>
                                    <li>车辆提醒母版和基线资料统一通过右上角“设定”弹窗中的“车辆套用”页签维护。</li>
                                </ul>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 border-t pt-3">
                            该记录用于原型评审和交付追踪，对应 PRD：18_清洁保养提醒.md。
                        </div>
                    </div>
                    <template #footer>
                        <el-button type="primary" @click="prototypeLogDialogVisible = false">关闭</el-button>
                    </template>
                </el-dialog>
            </main>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

export default {
            setup() {
                const router = useRouter();
                const branchOptions = ref([
                    { id: 'B01', name: '台北分公司' },
                    { id: 'B02', name: '新竹分公司' },
                    { id: 'B03', name: '台中分公司' },
                    { id: 'B04', name: '高雄分公司' }
                ]);

                // API 接入：保养母版列表。页面初始化或打开“设定”弹窗时查询。
                // 建议接口：GET /enterprise/official-vehicle/reminder-templates?type=maintenance
                // 返回字段需包含：id、name、scopeType、scopeBranchId、thresholdMileageKm、advanceMileageKm、thresholdMonths、advanceDays、status、remark。
                const maintenanceTemplates = ref([
                    { id: 'MT-001', name: '新车', scopeType: 'enterprise', scopeBranchId: '', thresholdMileageKm: 5000, advanceMileageKm: 500, thresholdMonths: 6, advanceDays: 15, status: 'enabled', remark: '适用于常规行政轿车' },
                    { id: 'MT-002', name: '老车', scopeType: 'branch', scopeBranchId: 'B01', thresholdMileageKm: 3000, advanceMileageKm: 300, thresholdMonths: 3, advanceDays: 10, status: 'enabled', remark: '适用于台北分公司高里程旧车' },
                    { id: 'MT-003', name: '常用接待车', scopeType: 'branch', scopeBranchId: 'B04', thresholdMileageKm: 4000, advanceMileageKm: 400, thresholdMonths: 4, advanceDays: 10, status: 'enabled', remark: '适用于高雄高频商务接待车' }
                ]);

                // API 接入：清洁母版列表。页面初始化或打开“设定”弹窗时查询。
                // 建议接口：GET /enterprise/official-vehicle/reminder-templates?type=cleaning
                // 返回字段需包含：id、name、scopeType、scopeBranchId、thresholdUseCount、advanceUseCount、thresholdDays、advanceDays、status、remark。
                const cleaningTemplates = ref([
                    { id: 'CT-001', name: '日常清洁', scopeType: 'enterprise', scopeBranchId: '', thresholdUseCount: 10, advanceUseCount: 2, thresholdDays: 15, advanceDays: 3, status: 'enabled', remark: '适用于常规日常清洁' },
                    { id: 'CT-002', name: '高频用车', scopeType: 'branch', scopeBranchId: 'B04', thresholdUseCount: 6, advanceUseCount: 1, thresholdDays: 7, advanceDays: 2, status: 'enabled', remark: '适用于高雄高频派车车辆' },
                    { id: 'CT-003', name: '主管车', scopeType: 'branch', scopeBranchId: 'B01', thresholdUseCount: 4, advanceUseCount: 1, thresholdDays: 10, advanceDays: 2, status: 'disabled', remark: '适用于台北主管车深度清洁' }
                ]);

                // API 接入：车辆套用列表。用于“车辆套用”页签和提醒列表车辆快照展示。
                // 建议接口：GET /enterprise/official-vehicle/reminder-bindings
                // 支持服务端筛选：keyword、branchId、configStatus、page、pageSize。
                // 返回字段需包含：vehicleId、licensePlate、model、source、branchId、stationName、contractId、currentMileage、maintenanceTemplateId、cleaningTemplateId、lastMaintenanceAt、lastMaintenanceMileage、lastCleaningAt。
                const vehicles = ref([
                    {
                        id: 'V1',
                        licensePlate: 'BXR-8899',
                        model: 'Lexus ES 250 2023款',
                        source: 'SELF_OWNED',
                        branch: 'B01',
                        stationName: '台北总部地下停车场',
                        contractId: 'CT-A01',
                        currentMileage: 25700,
                        maintenanceTemplateId: 'MT-002',
                        cleaningTemplateId: 'CT-001',
                        lastMaintenanceAt: '2026-01-12',
                        lastMaintenanceMileage: 20550,
                        lastCleaningAt: '2026-05-03',
                        completedUseCountSinceCleaning: 12
                    },
                    {
                        id: 'V2',
                        licensePlate: 'KLA-2108',
                        model: 'Toyota Alphard 2023款',
                        source: 'HESUAN',
                        branch: 'B04',
                        stationName: '高雄软件园区 B2 停车场',
                        contractId: 'CT-K01',
                        currentMileage: 41280,
                        maintenanceTemplateId: 'MT-003',
                        cleaningTemplateId: 'CT-002',
                        lastMaintenanceAt: '2026-02-01',
                        lastMaintenanceMileage: 37880,
                        lastCleaningAt: '2026-05-08',
                        completedUseCountSinceCleaning: 8
                    },
                    {
                        id: 'V3',
                        licensePlate: 'TFD-5326',
                        model: 'Toyota Camry 2022款',
                        source: 'GESHANG',
                        branch: 'B03',
                        stationName: '台中工业区访客停车场',
                        contractId: 'CT-C01',
                        currentMileage: 33220,
                        maintenanceTemplateId: 'MT-001',
                        cleaningTemplateId: 'CT-001',
                        lastMaintenanceAt: '2026-05-01',
                        lastMaintenanceMileage: 30150,
                        lastCleaningAt: '2026-05-20',
                        completedUseCountSinceCleaning: 1
                    },
                    {
                        id: 'V4',
                        licensePlate: 'APL-6621',
                        model: 'Mercedes-Benz E300 2024款',
                        source: 'SELF_OWNED',
                        branch: 'B02',
                        stationName: '新竹竹北办公大楼停车场',
                        contractId: 'CT-H01',
                        currentMileage: 18600,
                        maintenanceTemplateId: '',
                        cleaningTemplateId: 'CT-001',
                        lastMaintenanceAt: '',
                        lastMaintenanceMileage: null,
                        lastCleaningAt: '2026-05-12',
                        completedUseCountSinceCleaning: 8
                    },
                    {
                        id: 'V5',
                        licensePlate: 'RCM-7358',
                        model: 'Skoda Superb 2021款',
                        source: '中租',
                        branch: 'B01',
                        stationName: '台北内湖科技园区停车场',
                        contractId: 'CT-A01',
                        currentMileage: null,
                        maintenanceTemplateId: 'MT-002',
                        cleaningTemplateId: '',
                        lastMaintenanceAt: '2026-02-18',
                        lastMaintenanceMileage: 50210,
                        lastCleaningAt: '',
                        completedUseCountSinceCleaning: 0
                    }
                ]);

                // API 接入：清洁保养提醒列表。当前为原型模拟数据，开发时应改为后端分页查询。
                // 建议接口：GET /enterprise/official-vehicle/reminders
                // 支持筛选：type、status、branchId、scopeType、templateId、quick、page、pageSize。
                // 返回字段需包含：reminderId、vehicleId、type、templateId、currentSummary、currentBase、currentValue、triggeredAt、status、dueLevel、triggerReason。
                const reminders = ref([
                    {
                        id: 'R-001',
                        vehicleId: 'V1',
                        type: 'maintenance',
                        templateId: 'MT-002',
                        status: 'pending',
                        dueLevel: 'overdue',
                        triggeredAt: '2026-05-25 09:20',
                        currentSummary: '当前 25,700 km｜已行驶 5,150 km',
                        currentBase: '上次保养：20,550 km / 2026-01-12',
                        currentValue: '当前里程 25,700 km；距上次保养已行驶 5,150 km',
                        threshold: '3,000 km / 3 个月',
                        triggerReason: '已到期：里程已超过保养阈值'
                    },
                    {
                        id: 'R-002',
                        vehicleId: 'V2',
                        type: 'cleaning',
                        templateId: 'CT-002',
                        status: 'pending',
                        dueLevel: 'overdue',
                        triggeredAt: '2026-05-25 08:45',
                        currentSummary: '已用车 8 次｜距上次清洁 17 天',
                        currentBase: '上次清洁：2026-05-08',
                        currentValue: '上次清洁后已完成 8 次公务车预约；距上次清洁 17 天',
                        threshold: '6 次 / 7 天',
                        triggerReason: '已到期：用车次数和天数均已超过清洁阈值'
                    },
                    {
                        id: 'R-003',
                        vehicleId: 'V3',
                        type: 'maintenance',
                        templateId: 'MT-001',
                        status: 'completed',
                        dueLevel: 'upcoming',
                        triggeredAt: '2026-05-18 11:10',
                        currentSummary: '当前 33,220 km｜已行驶 3,070 km',
                        currentBase: '上次保养：30,150 km / 2026-05-01',
                        currentValue: '当前里程 33,220 km；距上次保养已行驶 3,070 km',
                        threshold: '5,000 km / 6 个月',
                        triggerReason: '手动登记完成后已关闭',
                        completionRecord: {
                            completedAt: '2026-05-22',
                            completedMileage: 33220,
                            remark: '例行保养完成，已更换机油并检查轮胎。',
                            operatorName: '王怡君',
                            operatedAt: '2026-05-22 16:30',
                            baselineText: '上次保养更新为 33,220 km / 2026-05-22'
                        }
                    },
                    {
                        id: 'R-004',
                        vehicleId: 'V1',
                        type: 'cleaning',
                        templateId: 'CT-001',
                        status: 'ignored',
                        dueLevel: 'overdue',
                        triggeredAt: '2026-05-19 14:00',
                        currentSummary: '已用车 12 次｜距上次清洁 22 天',
                        currentBase: '上次清洁：2026-05-03',
                        currentValue: '上次清洁后已完成 12 次公务车预约；距上次清洁 22 天',
                        threshold: '10 次 / 15 天',
                        triggerReason: '已由管理员忽略本次提醒'
                    },
                    {
                        id: 'R-005',
                        vehicleId: 'V4',
                        type: 'cleaning',
                        templateId: 'CT-001',
                        status: 'pending',
                        dueLevel: 'upcoming',
                        triggeredAt: '2026-05-25 10:30',
                        currentSummary: '已用车 8 次｜距上次清洁 13 天',
                        currentBase: '上次清洁：2026-05-12',
                        currentValue: '上次清洁后已完成 8 次公务车预约；距上次清洁 13 天',
                        threshold: '10 次 / 15 天',
                        triggerReason: '即将到期：已达到提前清洁提醒点'
                    },
                    {
                        id: 'R-006',
                        vehicleId: 'V2',
                        type: 'maintenance',
                        templateId: 'MT-003',
                        status: 'invalidated',
                        dueLevel: 'overdue',
                        triggeredAt: '2026-05-20 16:10',
                        currentSummary: '当前 41,280 km｜已行驶 4,880 km',
                        currentBase: '原分公司母版已清空',
                        currentValue: '车辆资产归属分公司调整后，原高雄分公司专用保养提醒已失效',
                        threshold: '4,000 km / 4 个月',
                        triggerReason: '已失效：车辆资产归属分公司变更，原分公司专用母版不再适用'
                    }
                ]);

                const filters = reactive({
                    query: '',
                    type: '',
                    status: '',
                    branch: '',
                    scope: '',
                    templateKey: '',
                    quick: ''
                });

                const reminderPagination = reactive({
                    currentPage: 1,
                    pageSize: 10
                });

                const vehicleBindingPagination = reactive({
                    currentPage: 1,
                    pageSize: 10
                });

                const vehicleBindingFilters = reactive({
                    keyword: '',
                    branch: '',
                    status: ''
                });

                const vehicleBindingTableRef = ref(null);
                const selectedBindingVehicles = ref([]);
                const batchBindingDialogVisible = ref(false);
                const batchBindingForm = reactive({
                    maintenanceTemplateId: '',
                    cleaningTemplateId: ''
                });

                const currentUser = reactive({
                    role: 'headquarters_admin',
                    branchId: 'B01'
                });

                const settingsDialogVisible = ref(false);
                const settingsTab = ref('maintenance');
                const branchTemplateFeatureEnabled = ref(true);
                const notificationDialogVisible = ref(false);
                const notificationActiveTab = ref('settings');
                const activeSummaryCard = ref('');
                const vehicleBindingQuickFilter = ref('');

                // API 接入：外部 Email 通知人设定。
                // 建议接口：GET /enterprise/official-vehicle/reminder-notification-settings
                // 保存接口：PUT /enterprise/official-vehicle/reminder-notification-settings
                const notificationSettings = ref([
                    { id: 'NS-001', receiverName: '王怡君', receiverEmail: 'yijun.wang@example.com', noticeScopes: ['maintenance', 'cleaning'], vehicleScope: 'all', vehicleConditionType: '', vehicleConditionValues: [], status: 'enabled' },
                    { id: 'NS-002', receiverName: '陈建宏', receiverEmail: 'service.admin@example.com', noticeScopes: ['maintenance'], vehicleScope: 'condition', vehicleConditionType: 'source', vehicleConditionValues: ['SELF_OWNED'], status: 'enabled' },
                    { id: 'NS-003', receiverName: '高雄车务组', receiverEmail: 'kh-fleet@example.com', noticeScopes: ['cleaning'], vehicleScope: 'all', vehicleConditionType: '', vehicleConditionValues: [], status: 'disabled' }
                ]);

                const notificationLogFilters = reactive({
                    type: '',
                    status: '',
                    keyword: '',
                    dateRange: []
                });

                // API 接入：外部 Email 发送记录。
                // 建议接口：GET /enterprise/official-vehicle/reminder-notification-logs
                // 支持筛选：type、status、keyword、dateRange、page、pageSize。
                // 主表按“车辆 + 通知类型 + 提醒阶段 + 触发发送时间”聚合，recipients 为展开明细。
                const notificationSendLogs = ref([
                    {
                        id: 'NL-001',
                        sentAt: '2026-05-25 09:10',
                        type: 'maintenance',
                        stage: 'due',
                        vehicleId: 'V1',
                        reminderStatus: 'pending',
                        recipients: [
                            { receiverName: '王怡君', receiverEmail: 'yijun.wang@example.com', status: 'success', failureReason: '' },
                            { receiverName: '陈建宏', receiverEmail: 'service.admin@example.com', status: 'success', failureReason: '' },
                            { receiverName: '高雄车务组', receiverEmail: 'kh-fleet@example.com', status: 'failed', failureReason: 'SMTP 连接超时' }
                        ]
                    },
                    {
                        id: 'NL-002',
                        sentAt: '2026-05-25 09:12',
                        type: 'cleaning',
                        stage: 'advance',
                        vehicleId: 'V3',
                        reminderStatus: 'ignored',
                        recipients: [
                            { receiverName: '王怡君', receiverEmail: 'yijun.wang@example.com', status: 'success', failureReason: '' },
                            { receiverName: '高雄车务组', receiverEmail: 'kh-fleet@example.com', status: 'success', failureReason: '' }
                        ]
                    },
                    {
                        id: 'NL-003',
                        sentAt: '2026-05-25 09:13',
                        type: 'maintenance',
                        stage: 'advance',
                        vehicleId: 'V2',
                        reminderStatus: 'pending',
                        recipients: [
                            { receiverName: '陈建宏', receiverEmail: 'service.admin@example.com', status: 'failed', failureReason: 'SMTP 连接超时' },
                            { receiverName: '王怡君', receiverEmail: 'yijun.wang@example.com', status: 'failed', failureReason: '收件服务器拒收' }
                        ]
                    },
                    {
                        id: 'NL-004',
                        sentAt: '2026-05-24 17:20',
                        type: 'cleaning',
                        stage: 'due',
                        vehicleId: 'V4',
                        reminderStatus: 'completed',
                        recipients: [
                            { receiverName: '高雄车务组', receiverEmail: 'kh-fleet@example.com', status: 'failed', failureReason: '收件人 Email 被退信' }
                        ]
                    }
                ]);

                const templateDialogVisible = ref(false);
                const templateForm = reactive({
                    type: 'maintenance',
                    id: '',
                    name: '',
                    scopeType: 'enterprise',
                    scopeBranchId: '',
                    thresholdMileageKm: 5000,
                    advanceMileageKm: 500,
                    thresholdMonths: 6,
                    thresholdUseCount: 10,
                    advanceUseCount: 2,
                    thresholdDays: 15,
                    advanceDays: 3,
                    remark: ''
                });

                const completionDialogVisible = ref(false);
                const completionRecordDialogVisible = ref(false);
                const prototypeLogDialogVisible = ref(false);
                const activeReminder = ref(null);
                const completionForm = reactive({
                    completedAt: '',
                    completedMileage: 0,
                    remark: ''
                });

                const getVehicle = (vehicleId) => vehicles.value.find(item => item.id === vehicleId);

                const getVehicleLabel = (vehicleId) => {
                    const vehicle = getVehicle(vehicleId);
                    return vehicle ? `${vehicle.licensePlate}｜${vehicle.model}` : '-';
                };

                const getNotificationTypeText = (type) => {
                    return type === 'maintenance' ? '保养提醒' : '清洁提醒';
                };

                const getNotificationBatchStats = (log) => {
                    const recipients = log.recipients || [];
                    const recipientCount = recipients.length;
                    const successCount = recipients.filter(item => item.status === 'success').length;
                    const failedCount = recipients.filter(item => item.status === 'failed').length;
                    let status = 'success';
                    if (failedCount === recipientCount && recipientCount > 0) {
                        status = 'failed';
                    } else if (failedCount > 0) {
                        status = 'partial_failed';
                    }
                    return { recipientCount, successCount, failedCount, status };
                };

                const getNotificationBatchStatusText = (status) => {
                    const statusMap = {
                        success: '成功',
                        partial_failed: '部分失败',
                        failed: '失败'
                    };
                    return statusMap[status] || '-';
                };

                const getNotificationBatchStatusTag = (status) => {
                    if (status === 'success') return 'success';
                    if (status === 'partial_failed') return 'warning';
                    return 'danger';
                };

                const getReminderStatusText = (status) => {
                    const statusMap = {
                        pending: '待处理',
                        ignored: '已忽略',
                        completed: '已完成',
                        invalidated: '已失效'
                    };
                    return statusMap[status] || '-';
                };

                const getBranchName = (branchId) => {
                    const branch = branchOptions.value.find(item => item.id === branchId);
                    return branch ? branch.name : '集团总池';
                };

                const notificationVehicleSourceOptions = [
                    { value: 'SELF_OWNED', label: '自购（自有资产）' },
                    { value: 'HESUAN', label: '和運租車' },
                    { value: 'GESHANG', label: '格上租車' },
                    { value: '中租', label: '中租租車' },
                    { value: 'OTHER', label: '其他' }
                ];

                const notificationContractOptions = [
                    { value: 'CT-A01', label: '台北公务车合约' },
                    { value: 'CT-H01', label: '新竹公务车合约' },
                    { value: 'CT-C01', label: '台中公务车合约' },
                    { value: 'CT-K01', label: '高雄公务车合约' }
                ];

                const notificationVehicleConditionTypes = [
                    { value: 'source', label: '车辆来源' },
                    { value: 'branch', label: '资产归属分公司' },
                    { value: 'station', label: '所属据点' },
                    { value: 'contract', label: '绑定合约' }
                ];

                const getVehicleSourceText = (source) => {
                    const matched = notificationVehicleSourceOptions.find(item => item.value === source);
                    return matched ? matched.label : '其他';
                };

                const notificationStationOptions = computed(() => {
                    const stationNames = Array.from(new Set(vehicles.value.map(item => item.stationName).filter(Boolean)));
                    return stationNames.map(name => ({ value: name, label: name }));
                });

                const hasNotificationVehicleCondition = (row) => {
                    return Boolean(row.vehicleConditionType && (row.vehicleConditionValues || []).length);
                };

                const getNotificationConditionValueOptions = (row) => {
                    if (row.vehicleConditionType === 'source') return notificationVehicleSourceOptions;
                    if (row.vehicleConditionType === 'branch') {
                        return branchOptions.value.map(item => ({ value: item.id, label: item.name }));
                    }
                    if (row.vehicleConditionType === 'station') return notificationStationOptions.value;
                    if (row.vehicleConditionType === 'contract') return notificationContractOptions;
                    return [];
                };

                const getNotificationConditionValuePlaceholder = (row) => {
                    if (row.vehicleConditionType === 'source') return '选择车辆来源';
                    if (row.vehicleConditionType === 'branch') return '选择资产归属分公司';
                    if (row.vehicleConditionType === 'station') return '选择所属据点';
                    if (row.vehicleConditionType === 'contract') return '选择绑定合约';
                    return '请先选择匹配条件';
                };

                const getNotificationMatchedVehicles = (row) => {
                    if ((row.vehicleScope || 'all') === 'all') return vehicles.value;
                    if (!hasNotificationVehicleCondition(row)) return [];
                    const values = row.vehicleConditionValues || [];
                    return vehicles.value.filter(item => {
                        if (row.vehicleConditionType === 'source') return values.includes(item.source);
                        if (row.vehicleConditionType === 'branch') return values.includes(item.branch);
                        if (row.vehicleConditionType === 'station') return values.includes(item.stationName);
                        if (row.vehicleConditionType === 'contract') return values.includes(item.contractId);
                        return false;
                    });
                };

                const getTemplateList = (type) => type === 'maintenance' ? maintenanceTemplates.value : cleaningTemplates.value;

                const getTemplateById = (type, templateId) => {
                    const list = getTemplateList(type);
                    return list.find(item => item.id === templateId);
                };

                const getTemplateScopeText = (template) => {
                    if (!template) return '未绑定母版';
                    if (template.scopeType === 'enterprise') {
                        return '企业通用';
                    }
                    return `${getBranchName(template.scopeBranchId)}专用`;
                };

                const getTemplateDisplayName = (type, templateId) => {
                    const template = getTemplateById(type, templateId);
                    return template ? `${getTemplateScopeText(template)}｜${template.name}` : '未绑定母版';
                };

                const isBranchTemplateFeatureEnabled = () => {
                    return branchTemplateFeatureEnabled.value;
                };

                const isTemplateSelectableForBranch = (type, template, branchId) => {
                    if (template.status !== 'enabled') return false;
                    if (template.scopeType === 'enterprise') return true;
                    return template.scopeBranchId === branchId;
                };

                const getAvailableTemplates = (type, branchId, selectedTemplateId = '') => {
                    const availableTemplates = getTemplateList(type).filter(item => {
                        if (item.status !== 'enabled') return false;
                        if (item.scopeType === 'enterprise') return true;
                        return isBranchTemplateFeatureEnabled(type) && item.scopeBranchId === branchId;
                    });
                    if (selectedTemplateId && !availableTemplates.some(item => item.id === selectedTemplateId)) {
                        const selectedTemplate = getTemplateById(type, selectedTemplateId);
                        if (selectedTemplate) {
                            availableTemplates.push(selectedTemplate);
                        }
                    }
                    return availableTemplates;
                };

                const getAppliedCount = (type, templateId) => {
                    return vehicles.value.filter(item => {
                        return type === 'maintenance'
                            ? item.maintenanceTemplateId === templateId
                            : item.cleaningTemplateId === templateId;
                    }).length;
                };

                const hasMileageBasis = (vehicle) => {
                    return vehicle.currentMileage !== null
                        && vehicle.currentMileage !== undefined
                        && vehicle.lastMaintenanceMileage !== null
                        && vehicle.lastMaintenanceMileage !== undefined;
                };

                const isMaintenanceConfigIncomplete = (vehicle) => {
                    if (!vehicle.maintenanceTemplateId) return true;
                    return !vehicle.lastMaintenanceAt && !hasMileageBasis(vehicle);
                };

                const isCleaningConfigIncomplete = (vehicle) => {
                    return !vehicle.cleaningTemplateId || !vehicle.lastCleaningAt;
                };

                const isVehicleConfigIncomplete = (vehicle) => {
                    return isMaintenanceConfigIncomplete(vehicle) || isCleaningConfigIncomplete(vehicle);
                };

                const templateFilterOptions = computed(() => {
                    const maintenance = maintenanceTemplates.value.map(item => ({
                        value: `maintenance:${item.id}`,
                        label: `保养｜${getTemplateScopeText(item)}｜${item.name}`
                    }));
                    const cleaning = cleaningTemplates.value.map(item => ({
                        value: `cleaning:${item.id}`,
                        label: `清洁｜${getTemplateScopeText(item)}｜${item.name}`
                    }));
                    return maintenance.concat(cleaning);
                });

                const filteredReminders = computed(() => {
                    // API 接入：正式开发建议由后端完成提醒列表筛选、排序和分页。
                    // 前端传 filters + reminderPagination，后端返回 records + total；当前 computed 仅用于静态原型演示。
                    return reminders.value.filter(item => {
                        const vehicle = getVehicle(item.vehicleId);
                        if (!vehicle) return false;
                        if (filters.query) {
                            const keyword = filters.query.toLowerCase();
                            const matchedVehicle = `${vehicle.licensePlate} ${vehicle.model}`.toLowerCase();
                            if (!matchedVehicle.includes(keyword)) return false;
                        }
                        if (filters.type && item.type !== filters.type) return false;
                        if (filters.status && item.status !== filters.status) return false;
                        if (filters.quick === 'today' && !(item.status === 'pending' && item.triggeredAt.startsWith('2026-05-25'))) return false;
                        if (filters.quick === 'incomplete' && !isVehicleConfigIncomplete(vehicle)) return false;
                        if (filters.branch && vehicle.branch !== filters.branch) return false;
                        if (filters.scope) {
                            const template = getTemplateById(item.type, item.templateId);
                            if (!template || template.scopeType !== filters.scope) return false;
                        }
                        if (filters.templateKey) {
                            const currentKey = `${item.type}:${item.templateId}`;
                            if (currentKey !== filters.templateKey) return false;
                        }
                        return true;
                    });
                });

                const pagedReminders = computed(() => {
                    const startIndex = (reminderPagination.currentPage - 1) * reminderPagination.pageSize;
                    return filteredReminders.value.slice(startIndex, startIndex + reminderPagination.pageSize);
                });

                const filteredNotificationSendLogs = computed(() => {
                    // API 接入：正式开发建议由后端完成发送记录筛选和分页。
                    // 前端传 notificationLogFilters，后端返回聚合后的发送批次和 recipients 明细；当前 computed 仅用于静态原型演示。
                    return notificationSendLogs.value.map(item => {
                        return { ...item, ...getNotificationBatchStats(item) };
                    }).filter(item => {
                        if (notificationLogFilters.type && item.type !== notificationLogFilters.type) return false;
                        if (notificationLogFilters.status && item.status !== notificationLogFilters.status) return false;
                        if (notificationLogFilters.keyword) {
                            const keyword = notificationLogFilters.keyword.toLowerCase();
                            const vehicleLabel = getVehicleLabel(item.vehicleId).toLowerCase();
                            const recipientText = (item.recipients || []).map(recipient => `${recipient.receiverName} ${recipient.receiverEmail}`).join(' ');
                            const targetText = `${recipientText} ${vehicleLabel}`.toLowerCase();
                            if (!targetText.includes(keyword)) return false;
                        }
                        if (notificationLogFilters.dateRange && notificationLogFilters.dateRange.length === 2) {
                            const logDate = item.sentAt.slice(0, 10);
                            if (logDate < notificationLogFilters.dateRange[0] || logDate > notificationLogFilters.dateRange[1]) return false;
                        }
                        return true;
                    });
                });

                const filteredBindingVehicles = computed(() => {
                    // API 接入：正式开发建议由后端完成车辆套用列表筛选和分页，避免车辆数量较多时前端一次性加载。
                    // 前端传 keyword、branchId、configStatus、page、pageSize；当前 computed 仅用于静态原型演示。
                    return vehicles.value.filter(item => {
                        if (!isHeadquartersAdmin.value && item.branch !== currentUser.branchId) {
                            return false;
                        }
                        if (vehicleBindingQuickFilter.value === 'incomplete' && !isVehicleConfigIncomplete(item)) {
                            return false;
                        }
                        if (vehicleBindingFilters.keyword) {
                            const keyword = vehicleBindingFilters.keyword.toLowerCase();
                            const target = `${item.licensePlate} ${item.model} ${item.stationName}`.toLowerCase();
                            if (!target.includes(keyword)) return false;
                        }
                        if (vehicleBindingFilters.branch && item.branch !== vehicleBindingFilters.branch) {
                            return false;
                        }
                        if (vehicleBindingFilters.status === 'incomplete' && !isVehicleConfigIncomplete(item)) {
                            return false;
                        }
                        if (vehicleBindingFilters.status === 'maintenanceIncomplete' && !isMaintenanceConfigIncomplete(item)) {
                            return false;
                        }
                        if (vehicleBindingFilters.status === 'cleaningIncomplete' && !isCleaningConfigIncomplete(item)) {
                            return false;
                        }
                        if (vehicleBindingFilters.status === 'complete' && isVehicleConfigIncomplete(item)) {
                            return false;
                        }
                        return true;
                    });
                });

                const pagedVehicles = computed(() => {
                    const startIndex = (vehicleBindingPagination.currentPage - 1) * vehicleBindingPagination.pageSize;
                    return filteredBindingVehicles.value.slice(startIndex, startIndex + vehicleBindingPagination.pageSize);
                });

                const stats = computed(() => {
                    const pendingMaintenanceVehicles = new Set(reminders.value.filter(item => item.status === 'pending' && item.type === 'maintenance').map(item => item.vehicleId)).size;
                    const pendingCleaningVehicles = new Set(reminders.value.filter(item => item.status === 'pending' && item.type === 'cleaning').map(item => item.vehicleId)).size;
                    const newToday = reminders.value.filter(item => item.status === 'pending' && item.triggeredAt.startsWith('2026-05-25')).length;
                    const incompleteVehicles = vehicles.value.filter(item => isVehicleConfigIncomplete(item)).length;
                    return { pendingMaintenanceVehicles, pendingCleaningVehicles, newToday, incompleteVehicles };
                });

                const templateDialogTitle = computed(() => {
                    const prefix = templateForm.id ? '编辑' : '新增';
                    return `${prefix}${templateForm.type === 'maintenance' ? '保养母版' : '清洁母版'}`;
                });

                const isHeadquartersAdmin = computed(() => currentUser.role === 'headquarters_admin');
                const canCreateTemplates = computed(() => isHeadquartersAdmin.value || branchTemplateFeatureEnabled.value);

                const selectedBindingVehicleCount = computed(() => selectedBindingVehicles.value.length);
                const batchMaintenanceTemplateOptions = computed(() => getBatchTemplateOptions('maintenance'));
                const batchCleaningTemplateOptions = computed(() => getBatchTemplateOptions('cleaning'));

                const activeReminderVehicle = computed(() => activeReminder.value ? getVehicle(activeReminder.value.vehicleId) : null);
                const completionDialogTitle = computed(() => {
                    if (!activeReminder.value) return '登记完成';
                    return activeReminder.value.type === 'maintenance' ? '登记已保养' : '登记已清洁';
                });

                const clearReminderFilters = () => {
                    filters.query = '';
                    filters.type = '';
                    filters.status = '';
                    filters.branch = '';
                    filters.scope = '';
                    filters.templateKey = '';
                    filters.quick = '';
                    reminderPagination.currentPage = 1;
                };

                const applySummaryFilter = (type) => {
                    if (activeSummaryCard.value === type) {
                        activeSummaryCard.value = '';
                        clearReminderFilters();
                        vehicleBindingQuickFilter.value = '';
                        return;
                    }
                    activeSummaryCard.value = type;
                    clearReminderFilters();
                    vehicleBindingQuickFilter.value = '';
                    if (type === 'pendingMaintenance') {
                        filters.type = 'maintenance';
                        filters.status = 'pending';
                        return;
                    }
                    if (type === 'pendingCleaning') {
                        filters.type = 'cleaning';
                        filters.status = 'pending';
                        return;
                    }
                    if (type === 'newToday') {
                        filters.status = 'pending';
                        filters.quick = 'today';
                        return;
                    }
                    if (type === 'incompleteVehicles') {
                        vehicleBindingQuickFilter.value = 'incomplete';
                        vehicleBindingPagination.currentPage = 1;
                        settingsTab.value = 'binding';
                        settingsDialogVisible.value = true;
                    }
                };

                const openSettingsDialog = () => {
                    vehicleBindingQuickFilter.value = '';
                    settingsTab.value = 'maintenance';
                    settingsDialogVisible.value = true;
                };

                const resetVehicleBindingFilters = () => {
                    vehicleBindingFilters.keyword = '';
                    vehicleBindingFilters.branch = '';
                    vehicleBindingFilters.status = '';
                    vehicleBindingQuickFilter.value = '';
                    vehicleBindingPagination.currentPage = 1;
                    selectedBindingVehicles.value = [];
                    vehicleBindingTableRef.value?.clearSelection();
                };

                const getBatchTemplateOptions = (type) => {
                    return getTemplateList(type).filter(item => {
                        if (item.status !== 'enabled') return false;
                        if (isHeadquartersAdmin.value) {
                            return item.scopeType === 'enterprise';
                        }
                        if (item.scopeType === 'enterprise') return true;
                        return branchTemplateFeatureEnabled.value && item.scopeBranchId === currentUser.branchId;
                    });
                };

                const canSelectVehicleForBatch = (row) => {
                    if (isHeadquartersAdmin.value) return true;
                    return row.branch === currentUser.branchId;
                };

                const handleVehicleBindingSelectionChange = (selection) => {
                    selectedBindingVehicles.value = selection.filter(item => canSelectVehicleForBatch(item));
                };

                const openBatchBindingDialog = () => {
                    if (!selectedBindingVehicles.value.length) {
                        ElMessage.warning('请先选择需要批量套用母版的车辆');
                        return;
                    }
                    batchBindingForm.maintenanceTemplateId = '';
                    batchBindingForm.cleaningTemplateId = '';
                    batchBindingDialogVisible.value = true;
                };

                const saveBatchVehicleBinding = () => {
                    // API 接入：批量套用清洁保养母版。
                    // 建议接口：PUT /enterprise/official-vehicle/reminder-bindings/batch
                    // 提交内容：vehicleIds、maintenanceTemplateId、cleaningTemplateId。
                    // 后端规则：批量只更新母版，不更新上次保养日期、上次保养里程、上次清洁日期。
                    // 权限规则：企业总管理员批量仅允许企业通用母版；分公司管理员仅可操作本分公司车辆，可套用企业通用母版或本分公司专用母版。
                    // 保存规则：逐车校验权限和母版可选范围，任一车辆不符合时整批不保存。
                    if (!selectedBindingVehicles.value.length) {
                        ElMessage.warning('请先选择车辆');
                        return;
                    }
                    if (!batchBindingForm.maintenanceTemplateId && !batchBindingForm.cleaningTemplateId) {
                        ElMessage.warning('请至少选择一个要批量套用的母版');
                        return;
                    }

                    const maintenanceTemplate = batchBindingForm.maintenanceTemplateId
                        ? getTemplateById('maintenance', batchBindingForm.maintenanceTemplateId)
                        : null;
                    const cleaningTemplate = batchBindingForm.cleaningTemplateId
                        ? getTemplateById('cleaning', batchBindingForm.cleaningTemplateId)
                        : null;

                    const invalidVehicle = selectedBindingVehicles.value.find(vehicle => {
                        if (!canSelectVehicleForBatch(vehicle)) return true;
                        if (maintenanceTemplate && !isTemplateSelectableForBranch('maintenance', maintenanceTemplate, vehicle.branch)) return true;
                        if (cleaningTemplate && !isTemplateSelectableForBranch('cleaning', cleaningTemplate, vehicle.branch)) return true;
                        return false;
                    });

                    if (invalidVehicle) {
                        ElMessage.warning(`车辆 ${invalidVehicle.licensePlate} 不符合当前批量套用权限或母版范围，整批未保存`);
                        return;
                    }

                    selectedBindingVehicles.value.forEach(vehicle => {
                        if (maintenanceTemplate) {
                            vehicle.maintenanceTemplateId = maintenanceTemplate.id;
                        }
                        if (cleaningTemplate) {
                            vehicle.cleaningTemplateId = cleaningTemplate.id;
                        }
                    });

                    batchBindingDialogVisible.value = false;
                    vehicleBindingTableRef.value?.clearSelection();
                    selectedBindingVehicles.value = [];
                    ElMessage.success('已批量套用母版，系统将重新计算所选车辆提醒');
                };

                const addNotificationSetting = () => {
                    notificationSettings.value.push({
                        id: `NS-${String(Date.now()).slice(-4)}`,
                        receiverName: '',
                        receiverEmail: '',
                        noticeScopes: ['maintenance'],
                        vehicleScope: 'all',
                        vehicleConditionType: '',
                        vehicleConditionValues: [],
                        status: 'enabled'
                    });
                };

                const handleNotificationVehicleScopeChange = (row) => {
                    if (row.vehicleScope === 'all') {
                        row.vehicleConditionType = '';
                        row.vehicleConditionValues = [];
                    }
                };

                const handleNotificationConditionTypeChange = (row) => {
                    row.vehicleConditionValues = [];
                };

                const removeNotificationSetting = (row) => {
                    notificationSettings.value = notificationSettings.value.filter(item => item.id !== row.id);
                };

                const saveNotificationSettings = () => {
                    // API 接入：保存外部 Email 通知人设定。
                    // 建议接口：PUT /enterprise/official-vehicle/reminder-notification-settings
                    // 提交内容：通知人姓名、Email、通知范围、车辆范围、条件类型、条件值、启用状态。
                    // 后端校验：仅企业总管理员可操作；Email 格式正确；通知范围非空；按条件匹配时条件类型和值必填。
                    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const invalid = notificationSettings.value.find(item => {
                        return !item.receiverName.trim()
                            || !item.receiverEmail.trim()
                            || !emailPattern.test(item.receiverEmail)
                            || !item.noticeScopes.length
                            || ((item.vehicleScope || 'all') === 'condition' && !hasNotificationVehicleCondition(item));
                    });
                    if (invalid) {
                        ElMessage.warning('请补齐通知人、正确 Email、通知范围和车辆条件');
                        return;
                    }
                    notificationDialogVisible.value = false;
                    ElMessage.success('通知设定已保存');
                };

                const openTemplateDialog = (type, row = null) => {
                    templateForm.type = type;
                    templateForm.id = row ? row.id : '';
                    templateForm.name = row ? row.name : '';
                    templateForm.scopeType = row ? row.scopeType : (isHeadquartersAdmin.value ? 'enterprise' : 'branch');
                    templateForm.scopeBranchId = row ? row.scopeBranchId || '' : (isHeadquartersAdmin.value ? '' : currentUser.branchId);
                    templateForm.thresholdMileageKm = row && type === 'maintenance' ? row.thresholdMileageKm : 5000;
                    templateForm.advanceMileageKm = row && type === 'maintenance' ? row.advanceMileageKm : 500;
                    templateForm.thresholdMonths = row && type === 'maintenance' ? row.thresholdMonths : 6;
                    templateForm.thresholdUseCount = row && type === 'cleaning' ? row.thresholdUseCount : 10;
                    templateForm.advanceUseCount = row && type === 'cleaning' ? row.advanceUseCount : 2;
                    templateForm.thresholdDays = row && type === 'cleaning' ? row.thresholdDays : 15;
                    templateForm.advanceDays = row ? row.advanceDays || 0 : (type === 'maintenance' ? 15 : 3);
                    templateForm.remark = row ? row.remark || '' : '';
                    templateDialogVisible.value = true;
                };

                const canManageTemplate = (row) => {
                    if (isHeadquartersAdmin.value) return true;
                    if (!branchTemplateFeatureEnabled.value) return false;
                    return row.scopeType === 'branch' && row.scopeBranchId === currentUser.branchId;
                };

                const saveTemplate = () => {
                    // API 接入：新增 / 编辑清洁保养提醒母版。
                    // 建议接口：POST /enterprise/official-vehicle/reminder-templates 或 PUT /enterprise/official-vehicle/reminder-templates/{id}
                    // 后端校验：母版名称唯一、分公司专用权限、阈值合法、提前提醒值小于最终阈值。
                    // 保存成功后重新查询母版列表，并刷新车辆套用统计。
                    if (!templateForm.name.trim()) {
                        ElMessage.warning('请填写母版名称');
                        return;
                    }

                    if (!isHeadquartersAdmin.value && !branchTemplateFeatureEnabled.value) {
                        ElMessage.warning('当前未启用分公司专用，分公司不可新增或修改母版');
                        return;
                    }

                    const list = templateForm.type === 'maintenance' ? maintenanceTemplates.value : cleaningTemplates.value;
                    const duplicate = list.find(item => {
                        if (item.id === templateForm.id) return false;
                        if (item.name !== templateForm.name) return false;
                        if (templateForm.scopeType === 'enterprise') {
                            return item.scopeType === 'enterprise';
                        }
                        return item.scopeType === 'branch' && item.scopeBranchId === templateForm.scopeBranchId;
                    });
                    if (duplicate) {
                        ElMessage.warning(templateForm.scopeType === 'enterprise' ? '企业通用母版名称不可重复' : '同一分公司下专用母版名称不可重复');
                        return;
                    }

                    if (templateForm.type === 'maintenance') {
                        if (!templateForm.thresholdMileageKm || !templateForm.thresholdMonths || templateForm.advanceMileageKm === null || templateForm.advanceDays === null) {
                            ElMessage.warning('请补齐保养阈值和提前提醒设置');
                            return;
                        }
                        if (templateForm.advanceMileageKm >= templateForm.thresholdMileageKm) {
                            ElMessage.warning('提前提醒公里数必须小于保养里程阈值');
                            return;
                        }
                    } else {
                        if (!templateForm.thresholdUseCount || !templateForm.thresholdDays || templateForm.advanceUseCount === null || templateForm.advanceDays === null) {
                            ElMessage.warning('请补齐清洁阈值和提前提醒设置');
                            return;
                        }
                        if (templateForm.advanceUseCount >= templateForm.thresholdUseCount) {
                            ElMessage.warning('提前提醒次数必须小于清洁用车次数阈值');
                            return;
                        }
                        if (templateForm.advanceDays >= templateForm.thresholdDays) {
                            ElMessage.warning('提前提醒天数必须小于清洁间隔天数');
                            return;
                        }
                    }

                    if (templateForm.id) {
                        const current = list.find(item => item.id === templateForm.id);
                        if (current) {
                            current.name = templateForm.name;
                            current.scopeType = templateForm.scopeType;
                            current.scopeBranchId = templateForm.scopeType === 'branch' ? templateForm.scopeBranchId : '';
                            current.remark = templateForm.remark;
                            if (templateForm.type === 'maintenance') {
                                current.thresholdMileageKm = templateForm.thresholdMileageKm;
                                current.advanceMileageKm = templateForm.advanceMileageKm;
                                current.thresholdMonths = templateForm.thresholdMonths;
                                current.advanceDays = templateForm.advanceDays;
                            } else {
                                current.thresholdUseCount = templateForm.thresholdUseCount;
                                current.advanceUseCount = templateForm.advanceUseCount;
                                current.thresholdDays = templateForm.thresholdDays;
                                current.advanceDays = templateForm.advanceDays;
                            }
                        }
                    } else {
                        const nextId = `${templateForm.type === 'maintenance' ? 'MT' : 'CT'}-${String(Date.now()).slice(-4)}`;
                        if (templateForm.type === 'maintenance') {
                            maintenanceTemplates.value.unshift({
                                id: nextId,
                                name: templateForm.name,
                                scopeType: templateForm.scopeType,
                                scopeBranchId: templateForm.scopeType === 'branch' ? templateForm.scopeBranchId : '',
                                thresholdMileageKm: templateForm.thresholdMileageKm,
                                advanceMileageKm: templateForm.advanceMileageKm,
                                thresholdMonths: templateForm.thresholdMonths,
                                advanceDays: templateForm.advanceDays,
                                status: 'enabled',
                                remark: templateForm.remark
                            });
                        } else {
                            cleaningTemplates.value.unshift({
                                id: nextId,
                                name: templateForm.name,
                                scopeType: templateForm.scopeType,
                                scopeBranchId: templateForm.scopeType === 'branch' ? templateForm.scopeBranchId : '',
                                thresholdUseCount: templateForm.thresholdUseCount,
                                advanceUseCount: templateForm.advanceUseCount,
                                thresholdDays: templateForm.thresholdDays,
                                advanceDays: templateForm.advanceDays,
                                status: 'enabled',
                                remark: templateForm.remark
                            });
                        }
                    }

                    templateDialogVisible.value = false;
                    ElMessage.success('母版已保存');
                };

                const toggleTemplateStatus = (type, row, enabled) => {
                    // API 接入：启用 / 停用提醒母版。
                    // 建议接口：PATCH /enterprise/official-vehicle/reminder-templates/{id}/status
                    // 后端规则：停用后不允许新绑定；已绑定车辆保留当前绑定并继续计算。
                    row.status = enabled ? 'enabled' : 'disabled';
                    ElMessage.success(`已${enabled ? '启用' : '停用'}母版；已绑定车辆保留当前绑定，仅禁止新的套用`);
                };

                const removeTemplate = (type, row) => {
                    // API 接入：删除清洁保养提醒母版。
                    // 建议接口：DELETE /enterprise/official-vehicle/reminder-templates/{id}
                    // 后端规则：企业总管理员可删除企业通用母版和任一分公司专用母版；分公司管理员仅可删除本分公司创建的专用母版。
                    // 删除前必须校验已套用车辆数，已被车辆套用的母版不允许删除。
                    if (!canManageTemplate(row)) {
                        ElMessage.warning('当前账号无权删除该母版');
                        return;
                    }
                    const appliedCount = getAppliedCount(type, row.id);
                    if (appliedCount > 0) {
                        ElMessage.warning(`该母版已有 ${appliedCount} 台车辆套用，不能删除；请先改绑或清空车辆母版`);
                        return;
                    }

                    ElMessageBox.confirm(
                        `确认删除“${row.name}”吗？删除后不可恢复。`,
                        '删除母版',
                        {
                            confirmButtonText: '删除',
                            cancelButtonText: '取消',
                            type: 'warning',
                            confirmButtonClass: 'el-button--danger'
                        }
                    ).then(() => {
                        const list = type === 'maintenance' ? maintenanceTemplates.value : cleaningTemplates.value;
                        const index = list.findIndex(item => item.id === row.id);
                        if (index >= 0) {
                            list.splice(index, 1);
                        }
                        ElMessage.success('母版已删除');
                    }).catch(() => {});
                };

                const saveVehicleBinding = (row) => {
                    // API 接入：保存单台车辆的清洁保养母版和基线资料。
                    // 建议接口：PUT /enterprise/official-vehicle/reminder-bindings/{vehicleId}
                    // 提交内容：maintenanceTemplateId、cleaningTemplateId、lastMaintenanceAt、lastMaintenanceMileage、lastCleaningAt。
                    // 后端校验：母版只能为企业通用或车辆资产归属分公司的专用母版；保存后触发该车辆提醒重算。
                    const maintenanceTemplate = row.maintenanceTemplateId ? getTemplateById('maintenance', row.maintenanceTemplateId) : null;
                    const cleaningTemplate = row.cleaningTemplateId ? getTemplateById('cleaning', row.cleaningTemplateId) : null;
                    if (maintenanceTemplate && !isTemplateSelectableForBranch('maintenance', maintenanceTemplate, row.branch)) {
                        ElMessage.warning('当前车辆不可绑定其他分公司的保养母版');
                        return;
                    }
                    if (cleaningTemplate && !isTemplateSelectableForBranch('cleaning', cleaningTemplate, row.branch)) {
                        ElMessage.warning('当前车辆不可绑定其他分公司的清洁母版');
                        return;
                    }
                    ElMessage.success(`已保存车辆 ${row.licensePlate} 的提醒配置`);
                };

                const openCompletionDialog = (row) => {
                    activeReminder.value = row;
                    completionForm.completedAt = '2026-05-25';
                    completionForm.completedMileage = getVehicle(row.vehicleId)?.currentMileage || 0;
                    completionForm.remark = '';
                    completionDialogVisible.value = true;
                };

                const openCompletionRecordDialog = (row) => {
                    activeReminder.value = row;
                    completionRecordDialogVisible.value = true;
                };

                const submitCompletion = () => {
                    // API 接入：登记已保养 / 已清洁。
                    // 建议接口：POST /enterprise/official-vehicle/reminders/{reminderId}/complete
                    // 保养提交：completedAt、completedMileage、remark；清洁提交：completedAt、remark。
                    // 后端处理：提醒改为已完成，回写车辆基线，重算该车辆下一轮提醒，并写入操作记录。
                    if (!activeReminder.value) return;
                    if (!completionForm.completedAt) {
                        ElMessage.warning('请选择完成日期');
                        return;
                    }

                    const vehicle = getVehicle(activeReminder.value.vehicleId);
                    if (!vehicle) return;

                    if (activeReminder.value.type === 'maintenance') {
                        vehicle.lastMaintenanceAt = completionForm.completedAt;
                        vehicle.lastMaintenanceMileage = completionForm.completedMileage;
                    } else {
                        vehicle.lastCleaningAt = completionForm.completedAt;
                        vehicle.completedUseCountSinceCleaning = 0;
                    }

                    activeReminder.value.status = 'completed';
                    activeReminder.value.currentSummary = activeReminder.value.type === 'maintenance'
                        ? `登记里程 ${completionForm.completedMileage.toLocaleString()} km`
                        : '已登记清洁';
                    activeReminder.value.currentBase = activeReminder.value.type === 'maintenance'
                        ? `完成日期：${completionForm.completedAt}`
                        : `完成日期：${completionForm.completedAt}`;
                    activeReminder.value.currentValue = activeReminder.value.type === 'maintenance'
                        ? `已登记保养完成，基线里程更新为 ${completionForm.completedMileage.toLocaleString()} km`
                        : '已登记清洁完成，清洁后累计用车次数已重置为 0';
                    activeReminder.value.triggerReason = completionForm.remark || '已由企业管理员登记完成';
                    activeReminder.value.completionRecord = {
                        completedAt: completionForm.completedAt,
                        completedMileage: activeReminder.value.type === 'maintenance' ? completionForm.completedMileage : null,
                        remark: completionForm.remark,
                        operatorName: '王怡君',
                        operatedAt: '2026-05-25 15:20',
                        baselineText: activeReminder.value.type === 'maintenance'
                            ? `上次保养更新为 ${completionForm.completedMileage.toLocaleString()} km / ${completionForm.completedAt}`
                            : `上次清洁更新为 ${completionForm.completedAt}；清洁后累计用车次数重置为 0`
                    };
                    completionDialogVisible.value = false;
                    ElMessage.success('提醒已登记完成');
                };

                const ignoreReminder = (row) => {
                    // API 接入：忽略本次提醒。
                    // 建议接口：POST /enterprise/official-vehicle/reminders/{reminderId}/ignore
                    // 后端处理：提醒改为已忽略，不回写车辆基线，不重置清洁后用车次数，并写入操作记录。
                    // 注意：忽略“即将到期”后，同一周期达到最终阈值时仍需重新生成 1 条“已到期”提醒。
                    row.status = 'ignored';
                    row.triggerReason = '已由企业管理员忽略本次提醒';
                    ElMessage.success('已忽略本次提醒');
                };

                const goVehicleDetail = () => {
                    router.push('/enterprise/official-vehicles');
                };

                return {
                    branchOptions,
                    maintenanceTemplates,
                    cleaningTemplates,
                    vehicles,
                    reminders,
                    filters,
                    reminderPagination,
                    vehicleBindingPagination,
                    vehicleBindingFilters,
                    vehicleBindingTableRef,
                    selectedBindingVehicles,
                    selectedBindingVehicleCount,
                    batchBindingDialogVisible,
                    batchBindingForm,
                    batchMaintenanceTemplateOptions,
                    batchCleaningTemplateOptions,
                    stats,
                    filteredReminders,
                    pagedReminders,
                    filteredBindingVehicles,
                    pagedVehicles,
                    settingsDialogVisible,
                    settingsTab,
                    branchTemplateFeatureEnabled,
                    notificationDialogVisible,
                    notificationActiveTab,
                    notificationSettings,
                    notificationLogFilters,
                    notificationSendLogs,
                    filteredNotificationSendLogs,
                    notificationVehicleConditionTypes,
                    notificationVehicleSourceOptions,
                    notificationStationOptions,
                    notificationContractOptions,
                    activeSummaryCard,
                    templateDialogVisible,
                    templateForm,
                    templateDialogTitle,
                    isHeadquartersAdmin,
                    canCreateTemplates,
                    completionDialogVisible,
                    completionRecordDialogVisible,
                    prototypeLogDialogVisible,
                    activeReminder,
                    activeReminderVehicle,
                    completionForm,
                    completionDialogTitle,
                    templateFilterOptions,
                    getVehicle,
                    getVehicleLabel,
                    getNotificationTypeText,
                    getNotificationBatchStatusText,
                    getNotificationBatchStatusTag,
                    getReminderStatusText,
                    getBranchName,
                    getVehicleSourceText,
                    hasNotificationVehicleCondition,
                    getNotificationConditionValueOptions,
                    getNotificationConditionValuePlaceholder,
                    getNotificationMatchedVehicles,
                    getTemplateById,
                    getTemplateDisplayName,
                    getTemplateScopeText,
                    getAvailableTemplates,
                    isTemplateSelectableForBranch,
                    getAppliedCount,
                    isMaintenanceConfigIncomplete,
                    isCleaningConfigIncomplete,
                    isVehicleConfigIncomplete,
                    applySummaryFilter,
                    addNotificationSetting,
                    handleNotificationVehicleScopeChange,
                    handleNotificationConditionTypeChange,
                    removeNotificationSetting,
                    saveNotificationSettings,
                    openTemplateDialog,
                    canManageTemplate,
                    saveTemplate,
                    toggleTemplateStatus,
                    removeTemplate,
                    saveVehicleBinding,
                    saveBatchVehicleBinding,
                    canSelectVehicleForBatch,
                    handleVehicleBindingSelectionChange,
                    openBatchBindingDialog,
                    openSettingsDialog,
                    resetVehicleBindingFilters,
                    openCompletionDialog,
                    openCompletionRecordDialog,
                    submitCompletion,
                    ignoreReminder,
                    goVehicleDetail
                };
            }
        };
</script>

<style scoped>
.official-vehicle-reminders-page {
    min-height: 100%;
}

.card-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
}

.reminder-settings-dialog {
    max-width: calc(100vw - 48px);
}

.reminder-settings-dialog :deep(.el-dialog__body) {
    max-height: calc(100vh - 140px);
    overflow: hidden;
}

.reminder-notification-dialog {
    max-width: 1280px;
}

.reminder-notification-dialog :deep(.el-dialog__body) {
    max-height: calc(100vh - 140px);
    overflow: hidden;
}

</style>
