<template>
<div class="system-rules-page">
            

            <main class="relative">
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">系统通用参数</h1>
                        <p class="text-gray-500 text-sm mt-1">配置全局系统规则，包括会员策略、运维规则、日历设定和推送通知</p>
                    </div>
                </div>

                <div class="">
                    <el-tabs v-model="activeTab"
                        class="app-page-tabs w-full bg-white rounded-xl shadow-sm border border-gray-100 min-h-[600px]">

                        
                        <el-tab-pane v-if="canViewSystemTab('MEMBER')" name="MEMBER">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon><User></User></el-icon>
                                    <span>会员策略</span>
                                </span>
                            </template>
                            <div class="grid gap-6 p-6" style="grid-template-columns: 200px minmax(0, 1fr);">
                                <div class="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit">
                                    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">设置项</div>
                                    <a href="#member-register"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">注册与审核</a>
                                    <a href="#member-points"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">积分奖励</a>
                                </div>
                                <div class="space-y-6 min-w-0">
                                
                                <div id="member-register" class="system-rule-section">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                            <el-icon class="mr-2 text-blue-600">
                                                <User></User>
                                            </el-icon> 注册设置
                                        </h3>
                                        <div>
                                            <el-button v-if="ruleLocks.memberRegister" type="primary" plain size="small"
                                                @click="unlockRule('memberRegister')">
                                                <el-icon class="mr-1">
                                                    <Lock></Lock>
                                                </el-icon> 解锁编辑
                                            </el-button>
                                            <div v-else class="flex gap-2">
                                                <el-button size="small"
                                                    @click="cancelRule('memberRegister')">取消</el-button>
                                                <el-button type="primary" size="small"
                                                    @click="saveRule('memberRegister')">
                                                    <el-icon class="mr-1">
                                                        <Check></Check>
                                                    </el-icon> 保存
                                                </el-button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                        <el-form label-width="140px" label-position="left"
                                            :disabled="ruleLocks.memberRegister">
                                            <el-form-item label="预设账号类型">
                                                <el-radio-group v-model="systemConfig.member.accountType">
                                                    <el-radio label="MOBILE">手机号</el-radio>
                                                    <el-radio label="ID_CARD">身份证号</el-radio>
                                                </el-radio-group>
                                                <div class="text-xs text-gray-400 mt-1">新会员注册时默认使用的唯一标识</div>
                                            </el-form-item>
                                            <el-form-item label="注册后审核">
                                                <el-switch v-model="systemConfig.member.auditRequired" active-text="开启"
                                                    inactive-text="关闭"></el-switch>
                                                <div class="text-xs text-gray-400 mt-1">开启后，新会员注册后需管理员审核通过方可使用</div>
                                            </el-form-item>
                                        </el-form>
                                    </div>
                                </div>

                                
                                <div id="member-points" class="system-rule-section">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                            <el-icon class="mr-2 text-orange-600">
                                                <Star></Star>
                                            </el-icon> 积分奖励策略
                                        </h3>
                                        <div>
                                            <el-button v-if="ruleLocks.memberPoints" type="primary" plain size="small"
                                                @click="unlockRule('memberPoints')">
                                                <el-icon class="mr-1">
                                                    <Lock></Lock>
                                                </el-icon> 解锁编辑
                                            </el-button>
                                            <div v-else class="flex gap-2">
                                                <el-button size="small"
                                                    @click="cancelRule('memberPoints')">取消</el-button>
                                                <el-button type="primary" size="small"
                                                    @click="saveRule('memberPoints')">
                                                    <el-icon class="mr-1">
                                                        <Check></Check>
                                                    </el-icon> 保存
                                                </el-button>
                                            </div>
                                        </div>
                                    </div>
                                    <div 
                                        class="bg-orange-50 rounded-lg p-5 border border-orange-200 space-y-6 relative">
                                        
                                        <div v-if="ruleLocks.memberPoints"
                                            class="absolute inset-0 bg-white/10 z-10 cursor-not-allowed"></div>
                                        
                                        <div class="flex items-start gap-4">
                                            <el-switch v-model="systemConfig.member.welcomeGift.enabled"
                                                active-color="#f97316"></el-switch>
                                            <div class="flex-1">
                                                <div class="font-medium text-gray-800 mb-2">新人礼 (Welcome Gift)</div>
                                                <div v-if="systemConfig.member.welcomeGift.enabled"
                                                    class="flex flex-wrap gap-4 items-center">
                                                    <span class="text-sm text-gray-600">当会员</span>
                                                    <el-select v-model="systemConfig.member.welcomeGift.trigger"
                                                        size="small" style="width: 140px">
                                                        <el-option label="注册成功后" value="REGISTER"></el-option>
                                                        <el-option label="审核通过后" value="AUDIT_PASS"></el-option>
                                                    </el-select>
                                                    <span class="text-sm text-gray-600">赠送</span>
                                                    <el-input-number v-model="systemConfig.member.welcomeGift.amount"
                                                        :min="0" size="small" style="width: 100px"></el-input-number>
                                                    <span class="text-sm text-gray-600">积分，有效期</span>
                                                    <el-input-number v-model="systemConfig.member.welcomeGift.validity"
                                                        :min="1" size="small" style="width: 80px"></el-input-number>
                                                    <span class="text-sm text-gray-600">天</span>
                                                </div>
                                                <div v-else class="text-xs text-gray-400">开启后可配置新用户获赠积分规则</div>
                                            </div>
                                        </div>

                                        <el-divider class="!my-2"></el-divider>

                                        
                                        <div class="flex items-start gap-4">
                                            <el-switch v-model="systemConfig.member.referralGift.enabled"
                                                active-color="#f97316"></el-switch>
                                            <div class="flex-1">
                                                <div class="font-medium text-gray-800 mb-2">邀请礼 (Referral Gift)</div>
                                                <div v-if="systemConfig.member.referralGift.enabled"
                                                    class="flex flex-wrap gap-4 items-center">
                                                    <span class="text-sm text-gray-600">当被邀请人</span>
                                                    <el-select v-model="systemConfig.member.referralGift.trigger"
                                                        size="small" style="width: 140px">
                                                        <el-option label="注册成功后" value="INVITEE_REGISTER"></el-option>
                                                        <el-option label="审核通过后" value="INVITEE_AUDIT_PASS"></el-option>
                                                    </el-select>
                                                    <span class="text-sm text-gray-600">邀请人获得</span>
                                                    <el-input-number v-model="systemConfig.member.referralGift.amount"
                                                        :min="0" size="small" style="width: 100px"></el-input-number>
                                                    <span class="text-sm text-gray-600">积分，有效期</span>
                                                    <el-input-number v-model="systemConfig.member.referralGift.validity"
                                                        :min="1" size="small" style="width: 80px"></el-input-number>
                                                    <span class="text-sm text-gray-600">天</span>
                                                </div>
                                                <div v-else class="text-xs text-gray-400">开启后可配置邀请返利规则</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane v-if="canViewSystemTab('FLEET')" name="FLEET">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon><Van></Van></el-icon>
                                    <span>运维规则</span>
                                </span>
                            </template>
                            <div class="grid gap-6 p-6" style="grid-template-columns: 200px minmax(0, 1fr);">
                                <div class="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit">
                                    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">设置项</div>
                                    <a href="#fleet-maintenance"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">保养提醒</a>
                                    <a href="#fleet-cleaning"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">清洁提醒</a>
                                </div>
                                <div class="space-y-6 min-w-0">
                                    
                                    <div id="fleet-maintenance" class="system-rule-section">
                                        <div class="flex justify-between items-center mb-4">
                                            <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                                <el-icon class="mr-2 text-blue-600">
                                                    <Tools></Tools>
                                                </el-icon> 保养提醒规则
                                            </h3>
                                            <div>
                                                <el-button v-if="ruleLocks.fleetMaintenance" type="primary" plain
                                                    size="small" @click="unlockRule('fleetMaintenance')">
                                                    <el-icon class="mr-1">
                                                        <Lock></Lock>
                                                    </el-icon> 解锁编辑
                                                </el-button>
                                                <div v-else class="flex gap-2">
                                                    <el-button size="small"
                                                        @click="cancelRule('fleetMaintenance')">取消</el-button>
                                                    <el-button type="primary" size="small"
                                                        @click="saveRule('fleetMaintenance')">
                                                        <el-icon class="mr-1">
                                                            <Check></Check>
                                                        </el-icon> 保存
                                                    </el-button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="bg-blue-50 rounded-lg p-5 border border-blue-200 h-full">
                                            <el-form label-position="top" :disabled="ruleLocks.fleetMaintenance">
                                                <div 
                                                    class="font-medium text-blue-800 mb-3 border-b border-blue-200 pb-2">
                                                    触发条件 (满足任一)</div>
                                                <el-row :gutter="16" style="max-width: 560px">
                                                    <el-col :span="12">
                                                        <el-form-item label="行驶里程 (Km)">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.maintenance.thresholdMileage"
                                                                :min="0" :step="1000"
                                                                style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                    <el-col :span="12">
                                                        <el-form-item label="时间间隔 (月)">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.maintenance.thresholdMonths"
                                                                :min="1" style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>

                                                <div 
                                                    class="font-medium text-blue-800 mb-3 border-b border-blue-200 pb-2 mt-4">
                                                    提前预警</div>
                                                <el-row :gutter="16" style="max-width: 560px">
                                                    <el-col :span="12">
                                                        <el-form-item label="提前里程 (Km)">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.maintenance.advanceKm"
                                                                :min="0" :step="100"
                                                                style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                    <el-col :span="12">
                                                        <el-form-item label="提前天数">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.maintenance.advanceDays"
                                                                :min="1" style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                            </el-form>
                                        </div>
                                    </div>

                                    
                                    <div id="fleet-cleaning" class="system-rule-section">
                                        <div class="flex justify-between items-center mb-4">
                                            <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                                <el-icon class="mr-2 text-cyan-600">
                                                    <Brush></Brush>
                                                </el-icon> 清洁提醒规则
                                            </h3>
                                            <div>
                                                <el-button v-if="ruleLocks.fleetCleaning" type="primary" plain
                                                    size="small" @click="unlockRule('fleetCleaning')">
                                                    <el-icon class="mr-1">
                                                        <Lock></Lock>
                                                    </el-icon> 解锁编辑
                                                </el-button>
                                                <div v-else class="flex gap-2">
                                                    <el-button size="small"
                                                        @click="cancelRule('fleetCleaning')">取消</el-button>
                                                    <el-button type="primary" size="small"
                                                        @click="saveRule('fleetCleaning')">
                                                        <el-icon class="mr-1">
                                                            <Check></Check>
                                                        </el-icon> 保存
                                                    </el-button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="bg-cyan-50 rounded-lg p-5 border border-cyan-200 h-full">
                                            <el-form label-position="top" :disabled="ruleLocks.fleetCleaning">
                                                <div 
                                                    class="font-medium text-cyan-800 mb-3 border-b border-cyan-200 pb-2">
                                                    触发条件 (满足任一)</div>
                                                <el-row :gutter="16" style="max-width: 560px">
                                                    <el-col :span="12">
                                                        <el-form-item label="租用次数">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.cleaning.thresholdCount"
                                                                :min="1" style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                    <el-col :span="12">
                                                        <el-form-item label="时间间隔 (天)">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.cleaning.thresholdDays"
                                                                :min="1" style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>

                                                <div 
                                                    class="font-medium text-cyan-800 mb-3 border-b border-cyan-200 pb-2 mt-4">
                                                    提前预警</div>
                                                <el-row :gutter="16" style="max-width: 560px">
                                                    <el-col :span="12">
                                                        <el-form-item label="提前剩余次数">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.cleaning.advanceCount"
                                                                :min="0" style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                    <el-col :span="12">
                                                        <el-form-item label="提前天数">
                                                            <el-input-number 
                                                                v-model="systemConfig.fleet.cleaning.advanceDays"
                                                                :min="1" style="width: 160px"></el-input-number>
                                                        </el-form-item>
                                                    </el-col>
                                                </el-row>
                                            </el-form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane v-if="canViewSystemTab('CALENDAR')" name="CALENDAR">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon><Calendar></Calendar></el-icon>
                                    <span>日历与假日</span>
                                </span>
                            </template>
                            <div class="grid gap-6 p-6" style="grid-template-columns: 200px minmax(0, 1fr);">
                                <div class="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit">
                                    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">设置项</div>
                                    <a href="#calendar-weekly"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">固定假日</a>
                                    <a href="#calendar-special"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">特殊日期</a>
                                </div>
                                <div class="space-y-6 min-w-0">
                                
                                <div id="calendar-weekly" class="system-rule-section">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                            <el-icon class="mr-2 text-indigo-600">
                                                <Calendar></Calendar>
                                            </el-icon> 固定假日设定
                                        </h3>
                                        <div>
                                            <el-button v-if="ruleLocks.calendarFixed" type="primary" plain size="small"
                                                @click="unlockRule('calendarFixed')">
                                                <el-icon class="mr-1">
                                                    <Lock></Lock>
                                                </el-icon> 解锁编辑
                                            </el-button>
                                            <div v-else class="flex gap-2">
                                                <el-button size="small"
                                                    @click="cancelRule('calendarFixed')">取消</el-button>
                                                <el-button type="primary" size="small"
                                                    @click="saveRule('calendarFixed')">
                                                    <el-icon class="mr-1">
                                                        <Check></Check>
                                                    </el-icon> 保存
                                                </el-button>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                                        
                                        <div v-if="ruleLocks.calendarFixed"
                                            class="absolute inset-0 bg-white/10 z-10 cursor-not-allowed"></div>
                                        <table class="w-full text-sm text-left">
                                            <thead class="bg-gray-50 text-gray-600 border-b">
                                                <tr>
                                                    <th class="px-4 py-3 w-24">星期</th>
                                                    <th class="px-4 py-3 w-32">是否假日</th>
                                                    <th class="px-4 py-3">具体规则 (默认全天，可指定时段)</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-gray-100">
                                                <tr v-for="day in systemConfig.calendar.weekly" :key="day.id"
                                                    class="hover:bg-gray-50">
                                                    <td class="px-4 py-3 font-medium">{{ day.name }}</td>
                                                    <td class="px-4 py-3">
                                                        <el-checkbox v-model="day.isHoliday">是假日</el-checkbox>
                                                    </td>
                                                    <td class="px-4 py-3">
                                                        <div v-if="day.isHoliday" class="flex items-center gap-2">
                                                            <el-switch v-model="day.isFullDay" active-text="全天"
                                                                inactive-text="非整天" size="small"></el-switch>
                                                            <div v-if="!day.isFullDay"
                                                                class="flex items-center gap-2 ml-4">
                                                                <span class="text-gray-500">从</span>
                                                                <el-time-select v-model="day.startTime" start="00:00"
                                                                    step="00:30" end="23:30" placeholder="开始时间"
                                                                    size="small" style="width: 120px"></el-time-select>
                                                                <span class="text-gray-500">以后算作假日</span>
                                                            </div>
                                                        </div>
                                                        <span v-else class="text-gray-400 text-xs">平日 (工作日)</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                
                                <div id="calendar-special" class="system-rule-section">
                                    <div class="flex justify-between items-center mb-4">
                                        <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                            <el-icon class="mr-2 text-purple-600">
                                                <Timer></Timer>
                                            </el-icon> 特殊日期 (调休/节假日)
                                        </h3>
                                        <el-button type="primary" size="small" plain icon="Plus"
                                            @click="openSpecialDateDialog">新增特殊规则</el-button>
                                    </div>
                                    <div class="bg-purple-50 rounded-lg p-5 border border-purple-200">
                                        
                                        <div class="space-y-2">
                                            <div v-for="(item, index) in systemConfig.calendar.specialDates"
                                                :key="index"
                                                class="flex items-center justify-between bg-white p-3 rounded border border-purple-100 shadow-sm">
                                                <div class="flex items-center gap-3">
                                                    <el-tag :type="item.type === 'HOLIDAY' ? 'danger' : 'success'"
                                                        size="small">
                                                        {{ item.type === 'HOLIDAY' ? '假日' : '平日' }}
                                                    </el-tag>
                                                    <span class="font-mono text-gray-700 font-medium">{{ item.range[0]
                                                        }} ~ {{ item.range[1] }}</span>
                                                    <span class="text-gray-500 text-sm ml-2">({{ item.name }})</span>
                                                </div>
                                                <el-button link type="danger" icon="Delete"
                                                    @click="removeSpecialDate(index)"></el-button>
                                            </div>
                                            <div v-if="systemConfig.calendar.specialDates.length === 0"
                                                class="text-center text-gray-400 py-4 text-sm">暂无特殊日期规则</div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane v-if="canViewSystemTab('PUSH')" name="PUSH">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon><Bell></Bell></el-icon>
                                    <span>推送通知</span>
                                </span>
                            </template>
                            <div class="p-6 space-y-4">
                                <div 
                                    class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div>
                                        <div class="text-sm font-semibold text-gray-800">推送规则列表</div>
                                        <div class="text-xs text-gray-500 mt-1">管理系统自动推送给用户的消息内容、触发时机和推送渠道</div>
                                    </div>
                                </div>

                                <div class="rounded-xl border border-gray-100 overflow-hidden">
                                <el-table :data="systemConfig.push.list" style="width: 100%" stripe>
                                    <el-table-column prop="category" label="分类" width="100">
                                        <template #default="{ row }">
                                            <el-tag :type="getPushCategoryTag(row.category)">{{ row.category }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="title" label="标题" width="200"></el-table-column>
                                    <el-table-column prop="content" label="内容模板" min-width="300">
                                        <template #default="{ row }">
                                            <div class="line-clamp-2 text-sm text-gray-600">{{ row.content }}</div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="trigger" label="触发时机" width="150"></el-table-column>
                                    <el-table-column label="推送渠道" width="180">
                                        <template #default="{ row }">
                                            <div class="flex gap-1">
                                                <el-tag v-if="row.channels.includes('APP')" size="small"
                                                    type="info">APP</el-tag>
                                                <el-tag v-if="row.channels.includes('SMS')" size="small"
                                                    type="success">短信</el-tag>
                                                <el-tag v-if="row.channels.includes('EMAIL')" size="small"
                                                    type="warning">邮件</el-tag>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-switch v-model="row.enabled" size="small"></el-switch>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="100" fixed="right">
                                        <template #default="{ row, $index }">
                                            <el-button link type="primary" size="small"
                                                @click="openPushDialog(row, $index)">编辑</el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane v-if="canViewSystemTab('AI')" name="AI">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon><Connection></Connection></el-icon>
                                    <span>AI模型接入</span>
                                </span>
                            </template>
                            <div class="grid gap-6 p-6" style="grid-template-columns: 200px minmax(0, 1fr);">
                                <div class="system-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit">
                                    <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">设置项</div>
                                    <a href="#ai-dispatch"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">调度分析模型</a>
                                    <a href="#ai-security"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">安全与提示词</a>
                                    <a href="#ai-logs"
                                        class="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors">调用日志</a>
                                </div>
                                <div class="space-y-6 min-w-0">
                                    <div id="ai-dispatch" class="system-rule-section">
                                        <div class="flex justify-between items-center mb-4">
                                            <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                                <el-icon class="mr-2 text-purple-600">
                                                    <Connection></Connection>
                                                </el-icon> AI调度分析模型
                                            </h3>
                                            <div>
                                                <el-button v-if="ruleLocks.aiModel" type="primary" plain size="small"
                                                    @click="unlockRule('aiModel')">
                                                    <el-icon class="mr-1">
                                                        <Lock></Lock>
                                                    </el-icon> 解锁编辑
                                                </el-button>
                                                <div v-else class="flex gap-2">
                                                    <el-button size="small" @click="cancelRule('aiModel')">取消</el-button>
                                                    <el-button type="primary" size="small" @click="saveRule('aiModel')">
                                                        <el-icon class="mr-1">
                                                            <Check></Check>
                                                        </el-icon> 保存
                                                    </el-button>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="bg-purple-50 rounded-lg p-5 border border-purple-200">
                                            <el-form label-width="140px" label-position="left"
                                                :disabled="ruleLocks.aiModel">
                                                <el-form-item label="启用状态">
                                                    <el-switch v-model="systemConfig.aiModel.enabled" active-text="启用"
                                                        inactive-text="停用" active-color="#7c3aed"></el-switch>
                                                    <div class="text-xs text-gray-400 mt-1">启用后，车辆排程看板可发起 AI 调度分析。</div>
                                                </el-form-item>
                                                <el-form-item label="模型提供商">
                                                    <el-select v-model="systemConfig.aiModel.provider"
                                                        style="width: 240px">
                                                        <el-option label="OpenAI" value="OPENAI"></el-option>
                                                        <el-option label="Gemini" value="GEMINI"></el-option>
                                                        <el-option label="OpenAI Compatible"
                                                            value="OPENAI_COMPATIBLE"></el-option>
                                                    </el-select>
                                                </el-form-item>
                                                <el-form-item label="Base URL"
                                                    v-if="systemConfig.aiModel.provider === 'OPENAI_COMPATIBLE'">
                                                    <el-input v-model="systemConfig.aiModel.baseUrl"
                                                        placeholder="https://api.example.com/v1"
                                                        style="max-width: 420px"></el-input>
                                                    <div class="text-xs text-gray-400 mt-1">兼容 OpenAI 协议的模型服务必填。</div>
                                                </el-form-item>
                                                <el-form-item label="模型名称">
                                                    <el-input v-model="systemConfig.aiModel.modelName"
                                                        placeholder="例如 gpt-xxx / gemini-xxx"
                                                        style="max-width: 320px"></el-input>
                                                </el-form-item>
                                                <el-form-item label="API Key">
                                                    <el-input v-model="systemConfig.aiModel.apiKeyMasked"
                                                        placeholder="保存后仅显示掩码" show-password
                                                        style="max-width: 420px"></el-input>
                                                    <div class="text-xs text-gray-400 mt-1">API Key 服务端加密保存，前端不读取明文。</div>
                                                </el-form-item>
                                                <el-form-item label="用途范围">
                                                    <el-tag type="info" effect="plain">门市租赁 AI 调度分析</el-tag>
                                                </el-form-item>
                                                <el-form-item label="提示词来源">
                                                    <div class="flex items-center gap-3">
                                                        <el-tag type="warning" effect="plain">{{
                                                            systemConfig.aiModel.promptSourceText }}</el-tag>
                                                        <span class="text-xs text-gray-500">{{
                                                            systemConfig.aiModel.promptConfigVersion }}</span>
                                                    </div>
                                                    <div class="text-xs text-gray-400 mt-1">优先使用租户专属提示词；未配置时使用全租户默认提示词。</div>
                                                </el-form-item>
                                                <el-form-item label="连接测试">
                                                    <div class="flex items-center gap-3">
                                                        <el-button type="primary" plain size="small"
                                                            @click="testAIConnection">测试连接</el-button>
                                                        <el-tag :type="systemConfig.aiModel.lastTestStatus === '成功' ? 'success' : 'warning'"
                                                            effect="plain">{{ systemConfig.aiModel.lastTestStatus }}</el-tag>
                                                        <span class="text-xs text-gray-500">{{
                                                            systemConfig.aiModel.lastTestTime }}</span>
                                                    </div>
                                                </el-form-item>
                                            </el-form>
                                        </div>
                                    </div>

                                    <div id="ai-security" class="system-rule-section">
                                        <h3 class="text-lg font-bold text-gray-800 flex items-center mb-4">
                                            <el-icon class="mr-2 text-slate-600">
                                                <DocumentChecked></DocumentChecked>
                                            </el-icon> 安全与提示词
                                        </h3>
                                        <div class="bg-slate-50 rounded-lg p-5 border border-slate-200">
                                            <div class="grid grid-cols-3 gap-4">
                                                <div v-for="item in systemConfig.aiModel.guardrails" :key="item.title"
                                                    class="bg-white rounded-lg border border-slate-200 p-4">
                                                    <div class="text-sm font-semibold text-gray-800">{{ item.title }}</div>
                                                    <div class="text-xs text-gray-500 mt-2 leading-5">{{ item.desc }}</div>
                                                </div>
                                            </div>
                                            <div class="mt-4 rounded-lg border border-purple-100 bg-white p-4">
                                                <div class="text-xs text-gray-400 uppercase tracking-wider">当前提示词版本</div>
                                                <div class="text-sm font-semibold text-gray-800 mt-2">{{
                                                    systemConfig.aiModel.promptVersion }}</div>
                                                <div class="text-xs text-gray-500 mt-2">提示词由独立配置文件维护，可使用全租户默认版或租户专属版；营运平台不开放租户直接编辑提示词正文。</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div id="ai-logs" class="system-rule-section">
                                        <div class="flex justify-between items-center mb-4">
                                            <h3 class="text-lg font-bold text-gray-800 flex items-center">
                                                <el-icon class="mr-2 text-indigo-600">
                                                    <Tickets></Tickets>
                                                </el-icon> AI调用日志
                                            </h3>
                                            <el-tag type="info" effect="plain">保留实际请求内容</el-tag>
                                        </div>
                                        <div class="bg-white rounded-lg p-5 border border-slate-200">
                                            <div class="text-xs text-gray-500 mb-4">用于查看历史 AI 调度分析实际提交给模型的提示词、请求数据包、模型返回和系统校验结果。</div>
                                            <el-table :data="systemConfig.aiModel.logs" border stripe>
                                                <el-table-column prop="time" label="发起时间" width="160"></el-table-column>
                                                <el-table-column prop="analysisId" label="任务ID" width="190"></el-table-column>
                                                <el-table-column prop="operator" label="发起人" width="120"></el-table-column>
                                                <el-table-column prop="model" label="模型" width="150"></el-table-column>
                                                <el-table-column label="提示词" min-width="220">
                                                    <template #default="{ row }">
                                                        <div class="text-sm font-medium text-gray-800">{{ row.promptVersion }}</div>
                                                        <div class="text-xs text-gray-500">{{ row.promptSourceText }} · {{ row.promptHash }}</div>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="隐私过滤" width="110">
                                                    <template #default="{ row }">
                                                        <el-tag size="small" type="success" effect="plain">{{ row.filteredCount }} 类</el-tag>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column prop="status" label="状态" width="110">
                                                    <template #default="{ row }">
                                                        <el-tag size="small" :type="row.status === '成功' ? 'success' : 'warning'"
                                                            effect="plain">{{ row.status }}</el-tag>
                                                    </template>
                                                </el-table-column>
                                                <el-table-column label="操作" width="120" fixed="right">
                                                    <template #default="{ row }">
                                                        <el-button link type="primary" size="small"
                                                            @click="openAiLogDetail(row)">查看日志</el-button>
                                                    </template>
                                                </el-table-column>
                                            </el-table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                    </el-tabs>
                </div>
            </main>

            
            <el-dialog v-model="specialDateDialogVisible" title="新增特殊日期规则" width="500px" destroy-on-close>
                <el-form label-position="top">
                    
                    <el-form-item label="规则类型">
                        <div class="grid grid-cols-2 gap-4 w-full">
                            <div @click="newSpecialDate.type = 'HOLIDAY'"
                                class="cursor-pointer border-2 rounded-lg p-4 text-center transition-all"
                                :class="newSpecialDate.type === 'HOLIDAY' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-200'">
                                <div class="font-bold"
                                    :class="newSpecialDate.type === 'HOLIDAY' ? 'text-red-600' : 'text-gray-600'">
                                    设为假日
                                </div>
                                <div class="text-xs text-gray-400 mt-1">工作日放假/调休</div>
                            </div>
                            <div @click="newSpecialDate.type = 'WORKDAY'"
                                class="cursor-pointer border-2 rounded-lg p-4 text-center transition-all"
                                :class="newSpecialDate.type === 'WORKDAY' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-200'">
                                <div class="font-bold"
                                    :class="newSpecialDate.type === 'WORKDAY' ? 'text-green-600' : 'text-gray-600'">
                                    设为平日
                                </div>
                                <div class="text-xs text-gray-400 mt-1">周末补班</div>
                            </div>
                        </div>
                    </el-form-item>

                    
                    <el-form-item label="日期范围">
                        <el-date-picker v-model="newSpecialDate.range" type="daterange" range-separator="至"
                            start-placeholder="开始日期" end-placeholder="结束日期" size="large" value-format="YYYY-MM-DD"
                            style="width: 100%" ></el-date-picker>
                    </el-form-item>

                    
                    <el-form-item label="备注说明">
                        <el-input v-model="newSpecialDate.name" placeholder="例如：五一劳动节调休" size="large"></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="specialDateDialogVisible = false">取消</el-button>
                    <el-button type="primary" :disabled="!isSpecDateValid" @click="addSpecialDate">保存规则</el-button>
                </template>
            </el-dialog>

            
            <el-dialog v-model="pushDialogVisible" title="编辑推送规则" width="600px" destroy-on-close>
                <el-form :model="pushForm" label-width="100px">
                    <el-form-item label="消息分类">
                        <el-select v-model="pushForm.category" style="width: 100%">
                            <el-option label="系统通知" value="系统"></el-option>
                            <el-option label="订单相关" value="订单"></el-option>
                            <el-option label="营销推广" value="营销"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="消息标题">
                        <el-input v-model="pushForm.title"></el-input>
                    </el-form-item>
                    <el-form-item label="触发时机">
                        <el-input v-model="pushForm.trigger" placeholder="例如：订单创建后、审核通过时"></el-input>
                    </el-form-item>
                    <el-form-item label="内容模板">
                        <el-input v-model="pushForm.content" type="textarea" :rows="4"
                            placeholder="可用变量: {用户}, {订单号}"></el-input>
                    </el-form-item>
                    <el-form-item label="推送渠道">
                        <el-checkbox-group v-model="pushForm.channels">
                            <el-checkbox label="APP">APP推送</el-checkbox>
                            <el-checkbox label="SMS">短信</el-checkbox>
                            <el-checkbox label="EMAIL">邮件</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-switch v-model="pushForm.enabled" active-text="启用" inactive-text="停用"></el-switch>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="pushDialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="savePushRule">保存</el-button>
                </template>
            </el-dialog>

            <el-dialog v-model="aiLogDialogVisible" title="AI调用请求日志" width="960px" destroy-on-close>
                <div v-if="selectedAiLog" class="space-y-4">
                    <div class="grid grid-cols-4 gap-3">
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div class="text-xs text-gray-400">任务ID</div>
                            <div class="text-sm font-semibold text-gray-800 mt-1">{{ selectedAiLog.analysisId }}</div>
                        </div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div class="text-xs text-gray-400">模型</div>
                            <div class="text-sm font-semibold text-gray-800 mt-1">{{ selectedAiLog.model }}</div>
                        </div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div class="text-xs text-gray-400">提示词来源</div>
                            <div class="text-sm font-semibold text-gray-800 mt-1">{{ selectedAiLog.promptSourceText }}</div>
                        </div>
                        <div class="rounded-lg border border-slate-200 bg-slate-50 p-3">
                            <div class="text-xs text-gray-400">隐私过滤</div>
                            <div class="text-sm font-semibold text-gray-800 mt-1">{{ selectedAiLog.filteredCount }} 类资料</div>
                        </div>
                    </div>
                    <el-tabs>
                        <el-tab-pane label="完整提示词">
                            <pre class="h-[260px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{{ selectedAiLog.promptText }}</pre>
                        </el-tab-pane>
                        <el-tab-pane label="请求数据包">
                            <pre class="h-[260px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{{ selectedAiLog.requestPayload }}</pre>
                        </el-tab-pane>
                        <el-tab-pane label="模型返回">
                            <pre class="h-[260px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-5 text-slate-100 whitespace-pre-wrap">{{ selectedAiLog.responsePayload }}</pre>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <template #footer>
                    <el-button @click="aiLogDialogVisible = false">关闭</el-button>
                    <el-button type="primary" plain>导出 JSON</el-button>
                </template>
            </el-dialog>

        </div>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

export default {
            setup() {
                const activeTab = ref('MEMBER');
                // TODO(real-api): 当前账号在系统通用参数页的 tab 可见权限，后续应由后端按角色/账号权限返回。
                const systemTabPermissions = reactive({
                    MEMBER: true,
                    FLEET: true,
                    CALENDAR: true,
                    PUSH: true,
                    AI: true
                });
                const systemTabs = [
                    { key: 'MEMBER', label: '会员策略' },
                    { key: 'FLEET', label: '运维规则' },
                    { key: 'CALENDAR', label: '日历与假日' },
                    { key: 'PUSH', label: '推送通知' },
                    { key: 'AI', label: 'AI模型接入' }
                ];
                const canViewSystemTab = (key) => systemTabPermissions[key] !== false;
                const visibleSystemTabs = computed(() => systemTabs.filter(tab => canViewSystemTab(tab.key)));
                const ensureActiveSystemTab = () => {
                    if (!canViewSystemTab(activeTab.value)) {
                        activeTab.value = visibleSystemTabs.value[0]?.key || '';
                    }
                };
                watch(visibleSystemTabs, ensureActiveSystemTab, { immediate: true });

                // System Config Data
                const systemConfig = reactive({
                    member: {
                        accountType: 'MOBILE',
                        auditRequired: true,
                        welcomeGift: { enabled: true, trigger: 'AUDIT_PASS', amount: 100, validity: 365 },
                        referralGift: { enabled: true, trigger: 'INVITEE_AUDIT_PASS', amount: 50, validity: 365 }
                    },
                    fleet: {
                        maintenance: {
                            thresholdMileage: 5000,
                            thresholdMonths: 6,
                            advanceKm: 500,
                            advanceDays: 15
                        },
                        cleaning: {
                            thresholdCount: 5,
                            advanceCount: 1,
                            thresholdDays: 7,
                            advanceDays: 1
                        }
                    },
                    calendar: {
                        weekly: [
                            { id: 1, name: '周一', isHoliday: false, isFullDay: true, startTime: '' },
                            { id: 2, name: '周二', isHoliday: false, isFullDay: true, startTime: '' },
                            { id: 3, name: '周三', isHoliday: false, isFullDay: true, startTime: '' },
                            { id: 4, name: '周四', isHoliday: false, isFullDay: true, startTime: '' },
                            { id: 5, name: '周五', isHoliday: false, isFullDay: true, startTime: '' },
                            { id: 6, name: '周六', isHoliday: true, isFullDay: true, startTime: '' },
                            { id: 0, name: '周日', isHoliday: true, isFullDay: true, startTime: '' },
                        ],
                        specialDates: [
                            { range: ['2026-05-01', '2026-05-05'], type: 'HOLIDAY', name: '劳动节' },
                            { range: ['2026-05-09', '2026-05-09'], type: 'WORKDAY', name: '五一补班' }
                        ]
                    },
                    push: {
                        list: [
                            { category: '订单', title: '订单已确认', content: '尊敬的{用户}，您的订单{订单号}已经确认，请准时取车。', trigger: '订单支付成功', channels: ['APP', 'SMS'], enabled: true },
                            { category: '系统', title: '审核通过通知', content: '您的账号已通过审核，现在可以开始用车了。', trigger: '会员审核通过', channels: ['APP', 'SMS'], enabled: true },
                            { category: '营销', title: '生日祝福', content: '祝您生日快乐！一张租车券已放入您的账户。', trigger: '用户生日当天', channels: ['APP', 'SMS', 'EMAIL'], enabled: true }
                        ]
                    },
                    aiModel: {
                        enabled: true,
                        provider: 'OPENAI_COMPATIBLE',
                        baseUrl: 'https://api.example.com/v1',
                        modelName: 'gpt-xxx',
                        apiKeyMasked: 'sk-****8F3A',
                        promptSourceText: '租户专属版',
                        promptConfigVersion: 'prompt-config-20260519.01',
                        promptVersion: 'rimo-store-dispatch-agent-v1',
                        promptHash: 'sha256:8c21...f09a',
                        lastTestStatus: '成功',
                        lastTestTime: '2026-05-05 10:30',
                        guardrails: [
                            { title: '提示词配置文件', desc: '按租户命中专属提示词；未命中时使用全租户默认提示词。' },
                            { title: '硬约束不可突破', desc: '同车行、车组、状态、时间窗、硬锁和人工保护仍由系统校验。' },
                            { title: '数据最小化', desc: '不提交手机号、证件号、支付资料、API Key 或无关敏感备注。' }
                        ],
                        logs: [
                            {
                                time: '2026-05-19 14:32',
                                analysisId: 'AI-DISPATCH-20260519-0008',
                                operator: '王店长',
                                model: 'gpt-xxx',
                                promptSourceText: '租户专属版',
                                promptVersion: 'rimo-store-dispatch-agent-v1',
                                promptHash: 'sha256:8c21...f09a',
                                filteredCount: 5,
                                status: '成功',
                                promptText: '你是 RIMO Rental 门市租赁 AI 调度分析 Agent。\\n你的职责是帮助调度员分析车辆排程风险，并在系统合法候选车辆范围内生成推荐。',
                                requestPayload: JSON.stringify({
                                    analysisContext: { tenantId: 'tenant-rimo-tpe', windowDays: 7, storeScope: ['台北总店', '桃园机场店'] },
                                    orders: [{ orderNo: 'ORD-202605-0108', phone: '[excluded]' }],
                                    candidatesByOrder: { 'ORD-202605-0108': ['VH-TPE-2841', 'VH-TPE-6630'] },
                                    privacyFilter: ['手机号', '证件号', '支付资料', 'API Key', '未脱敏敏感备注']
                                }, null, 2),
                                responsePayload: JSON.stringify({ analysisId: 'AI-DISPATCH-20260519-0008', parseStatus: 'JSON_SCHEMA_PASSED', validationStatus: 'PARTIAL_PASSED' }, null, 2)
                            },
                            {
                                time: '2026-05-18 09:15',
                                analysisId: 'AI-DISPATCH-20260518-0014',
                                operator: '陈调度',
                                model: 'gpt-xxx',
                                promptSourceText: '默认版',
                                promptVersion: 'rimo-store-dispatch-agent-v1',
                                promptHash: 'sha256:7f18...a921',
                                filteredCount: 5,
                                status: '成功',
                                promptText: '你是 RIMO Rental 门市租赁 AI 调度分析 Agent。\\n必须遵守系统硬约束，不得直接修改订单、车辆或排程。',
                                requestPayload: JSON.stringify({
                                    analysisContext: { tenantId: 'tenant-rimo-tpe', windowDays: 3, storeScope: ['台北总店'] },
                                    orders: [{ orderNo: 'ORD-202605-0062', phone: '[excluded]' }],
                                    privacyFilter: ['手机号', '证件号', '支付资料', 'API Key', '未脱敏敏感备注']
                                }, null, 2),
                                responsePayload: JSON.stringify({ analysisId: 'AI-DISPATCH-20260518-0014', parseStatus: 'JSON_SCHEMA_PASSED', validationStatus: 'PASSED' }, null, 2)
                            }
                        ]
                    }
                });

                // Rule Locks
                const ruleLocks = reactive({
                    memberRegister: true,
                    memberPoints: true,
                    fleetMaintenance: true,
                    fleetCleaning: true,
                    calendarFixed: true,
                    aiModel: true
                });

                const unlockRule = (key) => {
                    ruleLocks[key] = false;
                };

                const cancelRule = (key) => {
                    // In a real app, you would revert changes here
                    ruleLocks[key] = true;
                    ElMessage.info('已取消编辑');
                };

                const saveRule = (key) => {
                    ruleLocks[key] = true;
                    ElMessage.success('设置已保存');
                };

                const testAIConnection = () => {
                    systemConfig.aiModel.lastTestStatus = '成功';
                    systemConfig.aiModel.lastTestTime = '2026-05-05 10:30';
                    ElMessage.success('AI 模型连接测试成功');
                };

                const aiLogDialogVisible = ref(false);
                const selectedAiLog = ref(null);

                const openAiLogDetail = (row) => {
                    selectedAiLog.value = row;
                    aiLogDialogVisible.value = true;
                };

                // Special Date Logic
                const newSpecialDate = reactive({ range: [], type: 'HOLIDAY', name: '' });
                const specialDateDialogVisible = ref(false);

                const isSpecDateValid = computed(() => {
                    return newSpecialDate.range &&
                        newSpecialDate.range.length === 2 &&
                        newSpecialDate.name &&
                        newSpecialDate.name.trim() !== '';
                });

                const openSpecialDateDialog = () => {
                    newSpecialDate.range = [];
                    newSpecialDate.type = 'HOLIDAY';
                    newSpecialDate.name = '';
                    specialDateDialogVisible.value = true;
                };

                const addSpecialDate = () => {
                    if (isSpecDateValid.value) {
                        systemConfig.calendar.specialDates.push({
                            range: [...newSpecialDate.range],
                            type: newSpecialDate.type,
                            name: newSpecialDate.name
                        });
                        specialDateDialogVisible.value = false;
                        ElMessage.success('特殊日期规则已添加');
                    }
                };

                const removeSpecialDate = (index) => {
                    systemConfig.calendar.specialDates.splice(index, 1);
                };

                // Push Dialog Logic
                const pushDialogVisible = ref(false);
                const editingPushIndex = ref(-1);
                const pushForm = reactive({
                    category: '系统', title: '', content: '', trigger: '', channels: [], enabled: true
                });

                const openPushDialog = (item, index) => {
                    editingPushIndex.value = index !== undefined ? index : -1;
                    if (item) {
                        Object.assign(pushForm, item);
                    } else {
                        // Reset defaults
                        Object.assign(pushForm, { category: '系统', title: '', content: '', trigger: '', channels: [], enabled: true });
                    }
                    pushDialogVisible.value = true;
                };

                const savePushRule = () => {
                    const data = { ...pushForm };
                    if (editingPushIndex.value >= 0) {
                        systemConfig.push.list[editingPushIndex.value] = data;
                    } else {
                        systemConfig.push.list.push(data);
                    }
                    pushDialogVisible.value = false;
                    ElMessage.success('推送规则已保存');
                };

                const getPushCategoryTag = (cat) => {
                    const map = { '系统': 'info', '订单': 'primary', '营销': 'warning' };
                    return map[cat] || 'info';
                };

                const saveSystemConfig = () => {
                    ElMessage.success('系统规则配置已全部保存');
                };

                return {
                    activeTab,
                    systemConfig,
                    ruleLocks,
                    unlockRule,
                    cancelRule,
                    saveRule,
                    newSpecialDate,
                    specialDateDialogVisible,
                    isSpecDateValid,
                    openSpecialDateDialog,
                    addSpecialDate,
                    removeSpecialDate,
                    pushDialogVisible,
                    pushForm,
                    openPushDialog,
                    savePushRule,
                    getPushCategoryTag,
                    saveSystemConfig,
                    testAIConnection,
                    aiLogDialogVisible,
                    selectedAiLog,
                    openAiLogDetail,
                    systemTabPermissions,
                    visibleSystemTabs,
                    canViewSystemTab
                };
            }
        };
</script>

<style scoped>
        .system-rules-page {
            min-height: 100%;
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

        .system-rule-nav {
            position: sticky;
            top: 16px;
            z-index: 10;
            max-height: calc(100vh - 140px);
            overflow-y: auto;
        }

        .system-rule-section {
            scroll-margin-top: 24px;
        }

        .system-rule-nav a:hover,
        .system-rule-nav a:focus {
            background: #eef8fc;
            color: var(--app-color-primary);
        }
</style>
