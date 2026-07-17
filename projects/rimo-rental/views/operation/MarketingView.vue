<template>
<main class="marketing-page relative">

                <!-- 顶部统计/工具栏 -->
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">行销优惠中心</h1>
                        <p class="text-gray-500 text-sm mt-1">统一管理门市与分时业务的行销优惠方案，支持精细化场景配置。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-radio-group v-model="viewMode" size="large" class="marketing-view-switch"
                            style="--el-color-primary: var(--app-color-primary); --el-radio-button-checked-bg-color: var(--app-color-primary); --el-radio-button-checked-border-color: var(--app-color-primary); --el-radio-button-checked-text-color: #fff;">
                            <el-radio-button label="list"><el-icon class="mr-1">
                                    <List />
                                </el-icon>方案列表</el-radio-button>
                            <el-radio-button label="dashboard"><el-icon class="mr-1">
                                    <Calendar />
                                </el-icon>行销日历</el-radio-button>
                        </el-radio-group>
                    </div>
                </div>

                <!-- 视图 A: 行销日历 (Dashboard) -->
                <div v-if="viewMode === 'dashboard'"
                    class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <!-- Top Level Tabs -->
                    <el-tabs v-model="activeBusinessTab" class="app-page-tabs">
                        <el-tab-pane name="STORE">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Shop />
                                    </el-icon>
                                    <span>门市租赁</span>
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="SHARING">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    <span>分时租赁</span>
                                </span>
                            </template>
                        </el-tab-pane>
                    </el-tabs>

                    <div class="px-6 py-3">
                        <div class="flex justify-between items-center mb-3">
                            <!-- Date Picker -->
                            <el-date-picker v-model="currentMonth" type="month" format="YYYY年 M月" :clearable="false"
                                class="!w-40 font-bold border-none shadow-none" size="large">
                            </el-date-picker>

                            <!-- Filters & Legends -->
                            <!-- Filters & Legends -->
                            <div class="flex items-center gap-4">
                                <!-- Color Legends (New Design) -->
                                <div
                                    class="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <template v-if="activeBusinessTab === 'STORE'">
                                        <!-- Universal (Static) -->
                                        <div class="flex items-center select-none" title="同时适用标准门市和自助">
                                            <span class="w-2.5 h-2.5 rounded-full mr-1.5 bg-purple-500"></span>
                                            <span class="font-bold text-gray-800">通用</span>
                                        </div>
                                        <!-- Standard (Filter) -->
                                        <div class="flex items-center cursor-pointer select-none transition-opacity"
                                            :class="storeFilters.scopes['store_standard'] ? 'opacity-100' : 'opacity-40 grayscale'"
                                            @click="storeFilters.scopes['store_standard'] = !storeFilters.scopes['store_standard']">
                                            <span class="w-2.5 h-2.5 rounded-full mr-1.5 bg-orange-500"></span>
                                            标准门市
                                        </div>
                                        <!-- Self (Filter) -->
                                        <div class="flex items-center cursor-pointer select-none transition-opacity"
                                            :class="storeFilters.scopes['store_self'] ? 'opacity-100' : 'opacity-40 grayscale'"
                                            @click="storeFilters.scopes['store_self'] = !storeFilters.scopes['store_self']">
                                            <span class="w-2.5 h-2.5 rounded-full mr-1.5 bg-teal-500"></span>
                                            24h自助
                                        </div>
                                    </template>

                                    <template v-if="activeBusinessTab === 'SHARING'">
                                        <!-- Universal (Static) -->
                                        <div class="flex items-center select-none" title="同时适用同站和异地">
                                            <span class="w-2.5 h-2.5 rounded-full mr-1.5 bg-theme-primary"></span>
                                            <span class="font-bold text-gray-800">通用</span>
                                        </div>
                                        <!-- Round (Filter) -->
                                        <div class="flex items-center cursor-pointer select-none transition-opacity"
                                            :class="sharingFilters.scopes['sharing_round'] ? 'opacity-100' : 'opacity-40 grayscale'"
                                            @click="sharingFilters.scopes['sharing_round'] = !sharingFilters.scopes['sharing_round']">
                                            <span class="w-2.5 h-2.5 rounded-full mr-1.5 bg-cyan-500"></span>
                                            同站
                                        </div>
                                        <!-- OneWay (Filter) -->
                                        <div class="flex items-center cursor-pointer select-none transition-opacity"
                                            :class="sharingFilters.scopes['sharing_oneway'] ? 'opacity-100' : 'opacity-40 grayscale'"
                                            @click="sharingFilters.scopes['sharing_oneway'] = !sharingFilters.scopes['sharing_oneway']">
                                            <span class="w-2.5 h-2.5 rounded-full mr-1.5 bg-rose-500"></span>
                                            异地
                                        </div>
                                    </template>
                                </div>

                                <!-- Filter Models (Group Filter) - Replaced with Select -->
                                <template v-if="activeBusinessTab === 'STORE'">
                                    <el-select v-model="storeFilters.carGroups" multiple collapse-tags
                                        placeholder="筛选车型组" style="width: 160px" size="default" clearable>
                                        <el-option v-for="g in storeCarGroups" :key="g.id" :label="g.name"
                                            :value="g.id"></el-option>
                                    </el-select>
                                </template>
                                <template v-if="activeBusinessTab === 'SHARING'">
                                    <el-select v-model="sharingFilters.carGroups" multiple collapse-tags
                                        placeholder="筛选车型组" style="width: 160px" size="default" clearable>
                                        <el-option v-for="g in sharingCarGroups" :key="g.id" :label="g.name"
                                            :value="g.id"></el-option>
                                    </el-select>
                                </template>

                                <!-- Create Button - MOVED TO END -->
                                <template v-if="activeBusinessTab === 'STORE'">
                                    <el-button type="primary" size="large" class="ml-4 shadow-md shadow-theme-primary/20" @click="startCreateCampaign('STORE')">
                                        <el-icon class="mr-1">
                                            <Plus />
                                        </el-icon> 新建门市方案
                                    </el-button>
                                </template>
                                <template v-if="activeBusinessTab === 'SHARING'">
                                    <el-button type="primary" size="large" class="ml-4 shadow-md shadow-theme-primary/20" @click="startCreateCampaign('SHARING')">
                                        <el-icon class="mr-1">
                                            <Plus />
                                        </el-icon> 新建分时方案
                                    </el-button>
                                </template>
                            </div>
                        </div>
                    </div> <!-- End of px-6 wrapper -->

                    <!-- Calendar Mock -->
                    <div class="border rounded-lg overflow-hidden">
                        <!-- Header -->
                        <div
                            class="grid grid-cols-7 gap-1 bg-gray-50 border-b p-2 text-center text-sm font-bold text-gray-600">
                            <div>周日</div>
                            <div>周一</div>
                            <div>周二</div>
                            <div>周三</div>
                            <div>周四</div>
                            <div>周五</div>
                            <div>周六</div>
                        </div>
                        <!-- Grid -->
                        <div class="calendar-grid">
                            <div v-for="day in 35" :key="day"
                                class="calendar-cell relative hover:bg-gray-50 transition-colors">
                                <div class="text-right text-xs text-gray-400 mb-1">{{ day > 31 ? day - 31 : day }}
                                </div>
                                <!-- Dynamic Events -->
                                <!-- Dynamic Events -->
                                <div class="space-y-1">
                                    <div v-for="evt in getEventsForDay(day).slice(0, 3)" :key="evt.day + evt.title"
                                        class="calendar-event truncate border-l-2 pl-1.5 flex items-center gap-1.5"
                                        :class="[
                                            getBusinessStyle(evt).bg, 
                                            getBusinessStyle(evt).text,
                                            getBusinessStyle(evt).border
                                         ]">
                                        <!-- Removed Tags as requested, using color coding instead -->
                                        <span class="truncate font-medium text-[11px]">{{ evt.title }}</span>
                                    </div>

                                    <!-- Show More Popover -->
                                    <el-popover v-if="getEventsForDay(day).length > 3" placement="right" title="当日更多方案"
                                        :width="260" trigger="hover">
                                        <template #reference>
                                            <div
                                                class="text-xs text-gray-400 cursor-pointer pl-1 hover:text-indigo-600 transition-colors font-medium">
                                                +{{ getEventsForDay(day).length - 3 }} 更多...
                                            </div>
                                        </template>
                                        <div class="space-y-2">
                                            <div v-for="evt in getEventsForDay(day)" :key="evt.title"
                                                class="text-xs p-2 rounded bg-gray-50 border border-gray-100">
                                                <div class="flex items-center mb-1">
                                                    <span class="inline-block w-2 h-2 rounded-full mr-1.5"
                                                        :class="getBusinessStyle(evt).dot"></span>
                                                    <span class="font-bold text-gray-700">{{ evt.title }}</span>
                                                </div>
                                                <!-- Scope Tags -->
                                                <div class="flex flex-wrap gap-1 pl-3.5">
                                                    <span v-for="scope in evt.scopes" :key="scope"
                                                        class="bg-white border px-1 rounded text-[10px] text-gray-500 scale-90 origin-left">
                                                        {{ getScopeName(scope) }}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </el-popover>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 视图 B: 方案列表 (List) -->
                <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <el-tabs v-model="listFilter" class="app-page-tabs">
                        <el-tab-pane name="store">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Shop />
                                    </el-icon>
                                    <span>门市租赁</span>
                                </span>
                            </template>
                        </el-tab-pane>
                        <el-tab-pane name="sharing">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Clock />
                                    </el-icon>
                                    <span>分时租赁</span>
                                </span>
                            </template>
                        </el-tab-pane>
                    </el-tabs>

                    <!-- List View Filters -->
                    <div class="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
                        <!-- Left: Filters Group (Clean, No Box) -->
                        <div class="flex items-center gap-3">
                            <!-- 1. Search -->
                            <div class="relative">
                                <el-input placeholder="搜索方案名称" prefix-icon="Search" clearable style="width: 240px"
                                    size="default"></el-input>
                            </div>

                            <div class="w-[1px] h-4 bg-gray-200 mx-2"></div>

                            <!-- 2. Scenario Filter -->
                            <template v-if="listFilter === 'store'">
                                <el-select v-model="listScopeFilters.store" multiple collapse-tags placeholder="全部适用场景"
                                    style="width: 200px" size="default" clearable>
                                    <el-option v-for="opt in scopeOptions.STORE" :key="opt.id" :label="opt.name"
                                        :value="opt.id"></el-option>
                                </el-select>
                            </template>
                            <template v-else-if="listFilter === 'sharing'">
                                <el-select v-model="listScopeFilters.sharing" multiple collapse-tags
                                    placeholder="全部适用场景" style="width: 200px" size="default" clearable>
                                    <el-option v-for="opt in scopeOptions.SHARING" :key="opt.id" :label="opt.name"
                                        :value="opt.id"></el-option>
                                </el-select>
                            </template>

                            <!-- 3. Car Group Filter -->
                            <template v-if="listFilter === 'store'">
                                <el-select v-model="listScopeFilters.storeCarGroups" multiple collapse-tags
                                    placeholder="全部车型组" style="width: 200px" size="default" clearable>
                                    <el-option v-for="g in storeCarGroups" :key="g.id" :label="g.name"
                                        :value="g.id"></el-option>
                                </el-select>
                            </template>
                            <template v-else-if="listFilter === 'sharing'">
                                <el-select v-model="listScopeFilters.sharingCarGroups" multiple collapse-tags
                                    placeholder="全部车型组" style="width: 200px" size="default" clearable>
                                    <el-option v-for="g in sharingCarGroups" :key="g.id" :label="g.name"
                                        :value="g.id"></el-option>
                                </el-select>
                            </template>
                        </div>

                        <!-- Right: Action -->
                        <template v-if="listFilter === 'store'">
                            <div class="flex items-center gap-2">
                                <el-button plain @click="openMarketingVersion()">历史版本</el-button>
                                <el-button type="primary" size="large" class="shadow-md shadow-theme-primary/20"
                                    @click="startCreateCampaign('STORE')">
                                    <el-icon class="mr-1">
                                        <Plus />
                                    </el-icon> 新建门市方案
                                </el-button>
                            </div>
                        </template>
                        <template v-else-if="listFilter === 'sharing'">
                            <el-button type="primary" size="large" class="shadow-md shadow-theme-primary/20"
                                @click="startCreateCampaign('SHARING')">
                                <el-icon class="mr-1">
                                    <Plus />
                                </el-icon> 新建分时方案
                            </el-button>
                        </template>
                    </div>

                    <!-- Table A: Store Business (Exact copy from index.html) -->


                    <!-- Unified Scheme List -->
                    <div>
                        <el-table :data="filteredCampaigns" style="width: 100%" size="large">
                            <el-table-column prop="name" label="方案名称" min-width="200">
                                <template #default="{ row }">
                                    <div class="font-bold text-gray-800">{{ row.name }}</div>
                                    <div class="text-xs text-gray-400 mt-1">{{ row.description }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column label="方案版本" width="190">
                                <template #default="{ row }">
                                    <el-tag size="small" type="primary" effect="plain" class="cursor-pointer"
                                        @click="openMarketingVersion(row)">
                                        {{ row.versionId || (row.businessLine === 'STORE' ? 'MKT-STORE-20260418-001' : 'MKT-SHARE-20260418-001') }}
                                    </el-tag>
                                    <div class="text-xs text-gray-400 mt-1">订单快照按版本追溯</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="scope" label="适用场景" width="140">
                                <template #default="{ row }">
                                    <el-tag v-if="row.businessLine === 'STORE'" type="primary" effect="plain"
                                        size="small">门市租赁</el-tag>
                                    <el-tag v-if="row.businessLine === 'SHARING'" type="warning" effect="plain"
                                        size="small">分时租车</el-tag>
                                    <div class="text-xs text-gray-400 mt-1 scale-90 origin-left">{{
                                        getScopeLabel(row)
                                        }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="date" label="有效期" width="220">
                                <template #default="{ row }">
                                    <div class="flex items-center text-gray-600">
                                        <el-icon class="mr-1">
                                            <Calendar />
                                        </el-icon>
                                        {{ row.startDate }} ~ {{ row.endDate }}
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="包含规则" align="center" width="120">
                                <template #default="{ row }">
                                    <span
                                        class="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold border border-gray-200">
                                        {{ row.rules ? row.rules.length : 0 }} Rules
                                    </span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="状态" width="100">
                                <template #default="{ row }">
                                    <el-tag :type="row.status === 'Running' ? 'success' : 'info'" size="small"
                                        effect="dark">{{ row.status === 'Running' ? '进行中' : '已结束' }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="150" align="right">
                                <template #default="{ row }">
                                    <el-button link type="primary" size="small"
                                        @click="openStoreDetail(row)">编辑</el-button>
                                    <el-button link type="danger" size="small">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </main>

<el-drawer v-model="detailVisible" :title="wizardMode === 'STORE' ? '配置门市优惠方案' : '配置分时优惠方案'" size="60%">
            <div class="px-6 pt-0 pb-6 -mt-5">
                <!-- STORE & SHARING MODE FORM -->
                <div v-if="wizardMode === 'STORE' || wizardMode === 'SHARING'">
                    <!-- 方案基础信息卡片 -->
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <div class="flex items-center gap-2 mb-3 pb-3 border-b">
                            <div class="w-1 h-5 bg-indigo-500 rounded"></div>
                            <h2 class="text-base font-bold text-gray-800">基本信息</h2>
                        </div>
                        <el-form :model="currentScheme" label-position="top">
                            <!-- Row 1 -->
                            <el-row :gutter="24">
                                <el-col :span="12">
                                    <el-form-item label="方案名称">
                                        <el-input v-model="currentScheme.name" placeholder="例如：2026年Q3旺季大促"
                                            size="large"></el-input>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="对外展示名称">
                                        <el-input v-model="currentScheme.displayName" placeholder="例如：暑期特惠"
                                            size="large"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <!-- Row 2 -->
                            <el-row :gutter="24">
                                <el-col :span="6">
                                    <el-form-item label="方案等级 (排序权重)">
                                        <el-input-number v-model="currentScheme.level" :min="0" :step="1"
                                            controls-position="right" style="width: 100%" size="large"
                                            placeholder="数值越大排序越前"></el-input-number>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="6">
                                    <el-form-item label="状态">
                                        <el-select v-model="currentScheme.status" placeholder="请选择" style="width: 100%"
                                            size="large">
                                            <el-option label="启用" :value="true"></el-option>
                                            <el-option label="禁用" :value="false"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="方案有效期">
                                        <el-date-picker v-model="currentScheme.dateRange" type="daterange"
                                            range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                                            format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width: 100%"
                                            size="large"></el-date-picker>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <!-- Row 3 -->
                            <el-row :gutter="24">
                                <el-col :span="12">
                                    <el-form-item label="适用国籍">
                                        <el-select v-model="currentScheme.nationalities" multiple collapse-tags
                                            placeholder="全部国籍" style="width: 100%" size="large">
                                            <el-option label="中国大陆" value="CN"></el-option>
                                            <el-option label="中国香港" value="HK"></el-option>
                                            <el-option label="中国台湾" value="TW"></el-option>
                                            <el-option label="日本" value="JP"></el-option>
                                            <el-option label="韩国" value="KR"></el-option>
                                            <el-option label="美国" value="US"></el-option>
                                            <el-option label="其他" value="OTHER"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="适用卡种">
                                        <el-select v-model="currentScheme.cardTypes" multiple collapse-tags
                                            placeholder="全部卡种" style="width: 100%" size="large">
                                            <el-option label="Visa" value="visa"></el-option>
                                            <el-option label="Mastercard" value="mastercard"></el-option>
                                            <el-option label="American Express" value="amex"></el-option>
                                            <el-option label="银联 (UnionPay)" value="unionpay"></el-option>
                                            <el-option label="JCB" value="jcb"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <!-- Row 4 -->
                            <el-row>
                                <el-col :span="24">
                                    <el-form-item label="方案说明" class="mb-0">
                                        <el-input v-model="currentScheme.description" type="textarea" :rows="3"
                                            placeholder="请输入方案的内部备注说明..."></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <!-- Row 3: Tags -->
                            <el-row :gutter="24">
                                <el-col :span="24">
                                    <el-form-item label="适用场景 (必选)">
                                        <el-checkbox-group v-model="currentScheme.tags">
                                            <template v-if="wizardMode === 'STORE'">
                                                <el-checkbox label="store_standard">标准门市</el-checkbox>
                                                <el-checkbox label="store_self">24h自助</el-checkbox>
                                            </template>
                                            <template v-else>
                                                <el-checkbox label="sharing_round">同站租还</el-checkbox>
                                                <el-checkbox label="sharing_oneway">甲租乙还</el-checkbox>
                                            </template>
                                        </el-checkbox-group>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <el-row v-if="wizardMode === 'STORE'" :gutter="24" class="mt-1">
                                <el-col :span="8">
                                    <el-form-item label="是否需要到店核验">
                                        <div class="h-10 flex items-center">
                                            <el-switch v-model="currentScheme.manualVerification"
                                                active-text="需要" inactive-text="不需要"></el-switch>
                                        </div>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="资格名称">
                                        <el-select v-model="currentScheme.qualificationName" placeholder="选择资格"
                                            style="width: 100%" :disabled="!currentScheme.manualVerification">
                                            <el-option label="学生身份" value="学生身份"></el-option>
                                            <el-option label="教师身份" value="教师身份"></el-option>
                                            <el-option label="军警身份" value="军警身份"></el-option>
                                            <el-option label="医护身份" value="医护身份"></el-option>
                                            <el-option label="长者身份" value="长者身份"></el-option>
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="8">
                                    <el-form-item label="证明文件说明">
                                        <el-input v-model="currentScheme.requiredDocText"
                                            placeholder="例如：学生证、在学证明等"
                                            :disabled="!currentScheme.manualVerification"></el-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                            <div v-if="wizardMode === 'STORE'" class="text-xs rounded border px-3 py-2"
                                :class="currentScheme.manualVerification ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-gray-50 border-gray-100 text-gray-600'">
                                {{ currentScheme.manualVerification
                                    ? '本方案在基础适用条件命中后，还要求门店取车时核验证明文件；24h 自助租车不开放选择该方案。'
                                    : '本方案只按上方基础条件和规则明细匹配，不要求门店额外上传证明文件。' }}
                            </div>
                        </el-form>
                    </div>

                    <!-- 规则列表卡片 -->
                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div class="flex justify-between items-center mb-5 pb-4 border-b">
                            <div class="flex items-center gap-2">
                                <div class="w-1 h-5 bg-orange-500 rounded"></div>
                                <h2 class="text-base font-bold text-gray-800">规则明细 ({{ currentScheme.rules.length }})
                                </h2>
                            </div>
                            <el-button type="primary" @click="openRuleDialog(null)">
                                <el-icon class="mr-1">
                                    <Plus />
                                </el-icon> 添加子规则
                            </el-button>
                        </div>

                        <el-table :data="currentScheme.rules" style="width: 100%" stripe
                            :header-cell-style="{background:'#f9fafb'}">
                            <el-table-column prop="name" label="规则名称" width="180" show-overflow-tooltip>
                                <template #default="{ row }">
                                    <span class="font-medium text-gray-900">{{ row.name }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column label="生效条件" min-width="220">
                                <template #default="{ row }">
                                    <div class="space-y-1">
                                        <div class="flex items-center text-xs text-gray-500">
                                            <el-icon class="mr-1">
                                                <Calendar />
                                            </el-icon>
                                            <span v-if="row.dateRange && row.dateRange.length">{{
                                                formatDate(row.dateRange[0]) }} - {{ formatDate(row.dateRange[1])
                                                }}</span>
                                            <span v-else>无日期限制</span>
                                        </div>
                                        <div class="flex items-center gap-1 flex-wrap">
                                            <el-tag size="small" type="info" effect="plain">{{ row.carModels === 'all' ?
                                                '全系' : '指定车组' }}</el-tag>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="动作预览" width="200">
                                <template #default="{row}">
                                    <div class="text-xs space-y-1">
                                        <div class="flex items-center">
                                            <span class="w-12 text-gray-400">价格:</span>
                                            <div v-if="row.priceMode === 'uniform'">
                                                <span class="font-bold text-indigo-600"
                                                    v-if="row.type==='discount'">{{row.value}}折</span>
                                                <span class="font-bold text-red-500"
                                                    v-else-if="row.type==='minus'">-{{row.value}}元</span>
                                                <span class="font-bold text-gray-700" v-else>{{row.value}}元</span>
                                            </div>
                                            <div v-else class="flex flex-col gap-1">
                                                <span class="text-xs text-gray-500">配置内容:</span>
                                                <div v-if="row.sharingPrices" class="flex flex-wrap gap-1">
                                                    <template v-for="(cfg, scope) in row.sharingPrices" :key="scope">
                                                        <template v-for="(price, cid) in cfg" :key="cid">
                                                            <el-tag v-if="price.active" size="small" effect="plain"
                                                                class="mr-1 mb-1">
                                                                {{ getCarGroupName(cid) }}:
                                                                ¥{{price.hourly}}/h
                                                            </el-tag>
                                                        </template>
                                                    </template>
                                                </div>
                                                <span v-else class="text-gray-400">未配置</span>
                                            </div>
                                        </div>
                                                                    </div>
</template>
                            </el-table-column>

                            <el-table-column label="操作" width="140" fixed="right">
                                <template #default="{ row, $index }">
                                    <el-button link type="primary" size="small"
                                        @click="openRuleDialog(row, $index)">编辑</el-button>
                                    <el-button link type="danger" size="small"
                                        @click="removeRule($index)">移除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <el-button @click="detailVisible = false">取消</el-button>
                    <el-button type="primary" size="large" @click="submitCampaign">提交方案</el-button>
                </div>
            </template>
        </el-drawer>

<el-dialog v-model="ruleDialogVisible" :title="isEditRule ? '编辑优惠规则' : '添加优惠规则'" width="1100px" append-to-body
            class="rule-dialog">
            <el-form :model="currentRule" label-width="90px" class="rule-form">
                <!-- 核心信息 -->
                <div class="mb-6">
                    <el-form-item label="规则名称" required>
                        <el-input v-model="currentRule.name" placeholder="例如：7月早鸟价" class="font-bold" size="large">
                            <template #prefix><el-icon>
                                    <Ticket />
                                </el-icon></template>
                        </el-input>
                    </el-form-item>
                </div>

                <div class="flex gap-6 h-[580px]">
                    <!-- 左侧：条件设置 (Conditions) -->
                    <div class="flex-1 overflow-y-auto pr-2 custom-scroll">
                        <div class="text-sm font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                            <div class="w-1 h-4 bg-indigo-500 rounded mr-2"></div> 触发条件
                        </div>

                        <!-- 1. 时间条件 -->
                        <div class="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
                            <div class="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">时间限制</div>
                            <el-form-item label="下单时间" class="mb-3">
                                <el-date-picker v-model="currentRule.salesDateRange" type="daterange"
                                    range-separator="-" start-placeholder="不限" end-placeholder="不限" format="MM-DD"
                                    value-format="YYYY-MM-DD" style="width: 100%" size="default"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="用车时间" class="mb-3">
                                <el-date-picker v-model="currentRule.dateRange" type="daterange" range-separator="-"
                                    start-placeholder="开始" end-placeholder="结束" format="MM-DD" value-format="YYYY-MM-DD"
                                    style="width: 100%" size="default"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="提前预订" class="mb-0">
                                <el-input-number v-model="currentRule.advanceDays" :min="0" controls-position="right"
                                    size="default" style="width: 100px">
                                </el-input-number>
                                <span class="text-xs text-gray-400 ml-2">天以上</span>
                            </el-form-item>
                        </div>

                        <!-- 2. 范围条件 -->
                        <div class="bg-white rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
                            <div class="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">适用范围</div>
                            <el-form-item label="适用车组" class="mb-3" v-if="wizardMode === 'STORE'">
                                <el-select v-model="currentRule.carModels" placeholder="全部" size="default">
                                    <el-option label="全部车型" value="all"></el-option>
                                    <el-option label="经济型组" value="economy"></el-option>
                                    <el-option label="SUV组" value="suv"></el-option>
                                    <el-option label="商务车组" value="mpv"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="会员方案" class="mb-3">
                                <el-select v-model="currentRule.membership" multiple collapse-tags placeholder="不限"
                                    size="default">
                                    <el-option label="普通会员" value="normal"></el-option>
                                    <el-option label="银卡会员" value="silver"></el-option>
                                    <el-option label="金卡会员" value="gold"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="租期限制" class="mb-0">
                                <div class="flex items-center">
                                    <el-input-number v-model="currentRule.minDays" :min="1" controls-position="right"
                                        size="default" style="width: 100px" :placeholder="'不限'"></el-input-number>
                                    <span class="mx-2 text-gray-400">-</span>
                                    <el-input-number v-model="currentRule.maxDays" :min="1" controls-position="right"
                                        size="default" style="width: 100px" :placeholder="'不限'"></el-input-number>
                                    <span class="ml-2 text-xs text-gray-400">天</span>
                                </div>
                            </el-form-item>
                        </div>

                        <!-- 3. 地理条件 -->
                        <div class="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <div class="text-xs text-gray-400 font-bold mb-3 uppercase tracking-wide">地理位置</div>
                            <el-form-item label="适用地区" class="mb-3">
                                <el-select v-model="currentRule.regions" multiple collapse-tags placeholder="全部"
                                    size="default">
                                    <el-option label="华东区" value="east"></el-option>
                                    <el-option label="华南区" value="south"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="适用门店" class="mb-0">
                                <el-select v-model="currentRule.stores" multiple collapse-tags placeholder="全部"
                                    size="default">
                                    <el-option label="上海虹桥店" value="sh_hq"></el-option>
                                    <el-option label="杭州西湖店" value="hz_xh"></el-option>
                                    <el-option label="南京南站店" value="nj_nz"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                    </div>

                    <!-- 右侧：优惠动作 (Actions) -->
                    <div class="flex-1 overflow-y-auto pr-1 custom-scroll">
                        <div class="text-sm font-bold text-gray-800 mb-3 flex items-center border-b pb-2">
                            <div class="w-1 h-4 bg-orange-500 rounded mr-2"></div> 优惠动作
                        </div>

                        <!-- 1. 价格策略 -->
                        <div class="bg-orange-50 rounded-lg p-5 mb-5 border border-orange-100 relative overflow-hidden">
                            <div
                                class="absolute top-0 right-0 p-1 bg-orange-100 rounded-bl text-xs text-orange-600 font-bold px-2">
                                必选</div>
                            <div class="font-bold text-gray-800 mb-4 flex items-center">
                                <el-icon class="mr-1 text-orange-500 text-lg">
                                    <Money />
                                </el-icon> 价格折让
                            </div>

                            <div class="mb-4" v-if="wizardMode === 'STORE'">
                                <el-radio-group v-model="currentRule.priceMode" size="default" fill="#f97316">
                                    <el-radio-button label="uniform">统一价模式</el-radio-button>
                                    <el-radio-button label="split">平假分开模式</el-radio-button>
                                </el-radio-group>
                            </div>
                            <div class="mb-4" v-else>
                                <div class="text-xs text-gray-500 mb-2">请直接配置该车组的分时租赁定价：</div>
                            </div>

                            <!-- 统一设置 (Store) -->
                            <div v-if="wizardMode === 'STORE' && currentRule.priceMode === 'uniform'"
                                class="bg-white p-4 rounded-md border border-orange-200 shadow-sm">
                                <el-radio-group v-model="currentRule.type" size="small" class="mb-3">
                                    <el-radio label="discount">折扣比率</el-radio>
                                    <el-radio label="minus">固定立减</el-radio>
                                    <el-radio label="fixed">一口价</el-radio>
                                </el-radio-group>
                                <div class="flex items-center">
                                    <el-input-number v-model="currentRule.value" :min="0"
                                        :precision="currentRule.type === 'discount' ? 1 : 0" size="large"
                                        style="width: 160px"></el-input-number>
                                    <span class="ml-2 font-bold text-orange-600 text-lg">{{ currentRule.type ===
                                        'discount' ? '折' : '元' }}</span>
                                </div>
                            </div>
                            <!-- 平假区分（四档模式） (Store) -->
                            <div v-if="wizardMode === 'STORE' && currentRule.priceMode === 'split'"
                                class="grid grid-cols-2 gap-3">
                                <!-- 常规平日 -->
                                <div class="bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                                    <div class="text-xs text-gray-500 font-bold mb-2">常规平日</div>
                                    <div class="flex items-center gap-2">
                                        <el-select v-model="currentRule.type" size="small" style="width: 80px">
                                            <el-option label="折扣" value="discount"></el-option>
                                            <el-option label="立减" value="minus"></el-option>
                                            <el-option label="一口价" value="fixed"></el-option>
                                        </el-select>
                                        <el-input-number v-model="currentRule.value" :min="0" size="small"
                                            style="width: 90px" :controls="false"></el-input-number>
                                        <span class="text-xs font-medium">{{ currentRule.type === 'discount' ? '折' : '元'
                                            }}</span>
                                    </div>
                                </div>
                                <!-- 常规假日 -->
                                <div class="bg-white p-3 rounded-md border border-orange-200 shadow-sm">
                                    <div class="text-xs text-orange-500 font-bold mb-2">常规假日</div>
                                    <div class="flex items-center gap-2">
                                        <el-select v-model="currentRule.weekendType" size="small" style="width: 80px">
                                            <el-option label="折扣" value="discount"></el-option>
                                            <el-option label="立减" value="minus"></el-option>
                                            <el-option label="一口价" value="fixed"></el-option>
                                        </el-select>
                                        <el-input-number v-model="currentRule.weekendValue" :min="0" size="small"
                                            style="width: 90px" :controls="false"></el-input-number>
                                        <span class="text-xs font-medium">{{ currentRule.weekendType === 'discount' ?
                                            '折' : '元' }}</span>
                                    </div>
                                </div>
                                <!-- 调休平日 -->
                                <div class="bg-white p-3 rounded-md border border-blue-200 shadow-sm">
                                    <div class="text-xs text-blue-500 font-bold mb-2">调休平日</div>
                                    <div class="flex items-center gap-2">
                                        <el-select v-model="currentRule.adjustedWeekdayType" size="small"
                                            style="width: 80px">
                                            <el-option label="折扣" value="discount"></el-option>
                                            <el-option label="立减" value="minus"></el-option>
                                            <el-option label="一口价" value="fixed"></el-option>
                                        </el-select>
                                        <el-input-number v-model="currentRule.adjustedWeekdayValue" :min="0"
                                            size="small" style="width: 90px" :controls="false"></el-input-number>
                                        <span class="text-xs font-medium">{{ currentRule.adjustedWeekdayType ===
                                            'discount' ? '折' : '元' }}</span>
                                    </div>
                                </div>
                                <!-- 法定假日 -->
                                <div class="bg-white p-3 rounded-md border border-red-200 shadow-sm">
                                    <div class="text-xs text-red-500 font-bold mb-2">法定假日</div>
                                    <div class="flex items-center gap-2">
                                        <el-select v-model="currentRule.legalHolidayType" size="small"
                                            style="width: 80px">
                                            <el-option label="折扣" value="discount"></el-option>
                                            <el-option label="立减" value="minus"></el-option>
                                            <el-option label="一口价" value="fixed"></el-option>
                                        </el-select>
                                        <el-input-number v-model="currentRule.legalHolidayValue" :min="0" size="small"
                                            style="width: 90px" :controls="false"></el-input-number>
                                        <span class="text-xs font-medium">{{ currentRule.legalHolidayType === 'discount'
                                            ? '折' : '元' }}</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 分时租赁定价 (Sharing Price Matrix) -->
                            <div v-if="wizardMode === 'SHARING'" class="space-y-6">
                                <template v-for="scope in ['sharing_round', 'sharing_oneway']" :key="scope">
                                    <div v-if="currentScheme.tags && currentScheme.tags.includes(scope)"
                                        class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div class="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center">
                                            <el-tag :type="scope === 'sharing_round' ? 'warning' : 'danger'"
                                                effect="dark" size="small" class="mr-2">
                                                {{ scope === 'sharing_round' ? '同站' : '异地' }}
                                            </el-tag>
                                            <span class="text-sm font-bold text-gray-700">{{ scope === 'sharing_round' ?
                                                '同站租还定价' : '甲租乙还定价' }}</span>
                                        </div>
                                        <div class="p-0">
                                            <table class="w-full text-sm text-left">
                                                <thead
                                                    class="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                                    <tr>
                                                        <th class="py-2 px-4 w-1/3">适用车组</th>
                                                        <th class="py-2 px-4 w-1/3">时租定价 (元/h)</th>
                                                        <th class="py-2 px-4 w-1/3">日租封顶 (元/天)</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="divide-y divide-gray-50">
                                                    <tr v-for="car in sharingCarGroups" :key="car.id"
                                                        class="hover:bg-indigo-50/30 transition-colors"
                                                        :class="{'opacity-50 grayscale': !currentRule.sharingPrices[scope][car.id].active}">
                                                        <td class="py-2 px-4">
                                                            <el-checkbox
                                                                v-model="currentRule.sharingPrices[scope][car.id].active">
                                                                <span class="font-medium text-gray-700 ml-1">{{ car.name
                                                                    }}</span>
                                                            </el-checkbox>
                                                        </td>
                                                        <td class="py-2 px-4">
                                                            <el-input-number
                                                                v-model="currentRule.sharingPrices[scope][car.id].hourly"
                                                                :min="0" :precision="1" :step="0.5" size="small"
                                                                style="width: 100%"
                                                                :disabled="!currentRule.sharingPrices[scope][car.id].active"
                                                                :controls="false">
                                                            </el-input-number>
                                                        </td>
                                                        <td class="py-2 px-4">
                                                            <el-input-number
                                                                v-model="currentRule.sharingPrices[scope][car.id].daily"
                                                                :min="0" :precision="0" :step="1" size="small"
                                                                style="width: 100%"
                                                                :disabled="!currentRule.sharingPrices[scope][car.id].active"
                                                                :controls="false">
                                                            </el-input-number>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- 2. 租几送几 -->
                        <div class="bg-purple-50 rounded-lg p-5 border border-purple-100 transition-all"
                            :class="{'opacity-60 grayscale': !currentRule.enableGift}">
                            <div class="flex justify-between items-center mb-4">
                                <div class="font-bold text-purple-800 flex items-center">
                                    <el-icon class="mr-2 text-lg">
                                        <Present />
                                    </el-icon> 连租赠送 (可选)
                                </div>
                                <el-switch v-model="currentRule.enableGift" size="default"
                                    style="--el-switch-on-color: #9333ea;"></el-switch>
                            </div>

                            <div v-show="currentRule.enableGift"
                                class="bg-white p-4 rounded-md border border-purple-200 shadow-sm">
                                <div class="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
                                    <span class="text-gray-600">租用天数</span>
                                    <div class="flex items-center">
                                        <el-input-number v-model="currentRule.giftBuy" :min="1" size="default"
                                            style="width: 100px"></el-input-number>
                                        <span class="ml-2 font-bold text-gray-800">天</span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-gray-600">赠送天数</span>
                                    <div class="flex items-center">
                                        <el-input-number v-model="currentRule.giftOne" :min="1" size="default"
                                            style="width: 100px"></el-input-number>
                                        <span class="ml-2 font-bold text-purple-600">天</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </el-form>

            <template #footer>
                <div class="flex justify-between items-center">
                    <div class="text-xs text-gray-400">
                        <el-icon class="mr-1 relative top-0.5">
                            <InfoFilled />
                        </el-icon>所有修改仅在点击保存后生效
                    </div>
                    <div>
                        <el-button @click="ruleDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="saveRule" color="#4f46e5" size="large">保存规则</el-button>
                    </div>
                </div>
            </template>
        </el-dialog>

<el-dialog v-model="marketingVersionDialogVisible" title="行销方案历史版本" width="880px" destroy-on-close>
            <div class="grid grid-cols-3 gap-4" v-if="selectedMarketingVersion">
                <div class="col-span-1 border border-gray-100 rounded-lg overflow-hidden">
                    <div class="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">版本列表</div>
                    <div class="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                        <button v-for="version in marketingVersionRecords" :key="version.version"
                            class="w-full text-left px-3 py-3 hover:bg-indigo-50 transition-colors"
                            :class="selectedMarketingVersion.version === version.version ? 'bg-indigo-50' : 'bg-white'"
                            @click="selectedMarketingVersion = version">
                            <div class="font-mono text-xs text-indigo-600 font-bold">{{ version.version }}</div>
                            <div class="text-sm text-gray-800 mt-1">{{ version.name }}</div>
                            <div class="text-xs text-gray-400 mt-1">{{ version.savedAt }} · {{ version.status }}</div>
                        </button>
                    </div>
                </div>
                <div class="col-span-2 space-y-4">
                    <div class="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                        <div class="font-mono font-bold text-gray-900">{{ selectedMarketingVersion.version }}</div>
                        <div class="text-sm text-gray-700 mt-1">{{ selectedMarketingVersion.name }}</div>
                        <div class="text-xs text-gray-500 mt-1">保存人：{{ selectedMarketingVersion.savedBy }} · {{
                            selectedMarketingVersion.savedAt }}</div>
                    </div>
                    <el-table :data="getMarketingVersionBasicRows(selectedMarketingVersion)" border size="small">
                        <el-table-column prop="label" label="配置项" width="170" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="value" label="内容" min-width="320" show-overflow-tooltip></el-table-column>
                    </el-table>
                    <div class="font-bold text-gray-800">规则详情</div>
                    <el-table :data="getMarketingVersionRuleRows(selectedMarketingVersion)" border size="small">
                        <el-table-column prop="name" label="规则名称" width="150" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="salesWindow" label="下单时间" min-width="140" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="useWindow" label="用车时间" min-width="170" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="advanceBooking" label="提前预订" width="110" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="carGroup" label="适用车组" min-width="140" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="membership" label="会员方案" min-width="150" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="rentalTerm" label="租期限制" width="110" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="locationScope" label="适用地区/门店" min-width="170" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="action" label="优惠动作" min-width="220" show-overflow-tooltip></el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="marketingVersionDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';

export default {
  name: 'MarketingView',
  setup() {
                // --- SaaS Logic ---
                const currentTenant = ref('full'); // full, store_only, sharing_same
                const currentTenantName = computed(() => {
                    const map = {
                        'full': 'Full License (演示租户)',
                        'store_only': 'Store Only (仅门市)',
                        'sharing_same': 'Sharing (仅同站)'
                    };
                    return map[currentTenant.value];
                });

                const hasPermission = (code) => {
                    if (currentTenant.value === 'full') return true;

                    if (currentTenant.value === 'store_only') {
                        return code === 'STORE';
                    }
                    if (currentTenant.value === 'sharing_same') {
                        if (code === 'STORE') return false;
                        if (code === 'SHARING') return true;
                        if (code === 'SHARING_ROUND') return true;
                        if (code === 'SHARING_ONEWAY') return false;
                    }
                    return false;
                };

                const switchTenant = (type) => {
                    currentTenant.value = type;
                    ElMessage.success(`模拟切换租户: ${currentTenantName.value}`);
                };

                // --- UI State ---
                const viewMode = ref('list');
                const listFilter = ref('store');
                const listScopeFilters = reactive({
                    store: ['store_standard', 'store_self'],
                    storeCarGroups: [],
                    sharing: ['sharing_round', 'sharing_oneway'],
                    sharingCarGroups: []
                });
                const detailVisible = ref(false);
                const wizardMode = ref(''); // STORE or SHARING used for next step

                // --- Data ---
                const activeBusinessTab = ref('STORE');

                // Car Groups Definition (Separated)
                const storeCarGroups = [
                    { id: 'store_economy', name: '经济型' },
                    { id: 'store_suv', name: 'SUV' },
                    { id: 'store_business', name: '商务型' },
                    { id: 'store_luxury', name: '豪华型' },
                    { id: 'store_mpv', name: 'MPV' }
                ];

                const sharingCarGroups = [
                    { id: 'sharing_economy', name: '经济型(K-Car)' },
                    { id: 'sharing_comfort', name: '舒适型' },
                    { id: 'sharing_suv', name: 'SUV' },
                    { id: 'sharing_ev', name: '纯电' }
                ];

                // Calendar Logic - Filters
                const storeFilters = reactive({
                    showScopes: true,
                    scopes: {
                        store_standard: true,
                        store_self: true
                    },
                    carGroups: [] // Empty = All, otherwise list of IDs
                });

                const sharingFilters = reactive({
                    showScopes: true,
                    scopes: {
                        sharing_round: true,
                        sharing_oneway: true
                    },
                    carGroups: []
                });

                // Dynamic Scope Options based on Permission
                const scopeOptions = computed(() => {
                    const s = [];
                    // Universal Option (Requires both permissions)
                    if (hasPermission('STORE_STANDARD') && hasPermission('STORE_SELF')) {
                        s.push({ id: 'store_universal', name: '通用(标准+自助)' });
                    }
                    if (hasPermission('STORE_STANDARD')) s.push({ id: 'store_standard', name: '标准门市' });
                    if (hasPermission('STORE_SELF')) s.push({ id: 'store_self', name: '24h自助' });

                    const sh = [];
                    if (hasPermission('SHARING_ROUND') && hasPermission('SHARING_ONEWAY')) {
                        sh.push({ id: 'sharing_universal', name: '通用(同站+异地)' });
                    }
                    if (hasPermission('SHARING_ROUND')) sh.push({ id: 'sharing_round', name: '同站租还' });
                    if (hasPermission('SHARING_ONEWAY')) sh.push({ id: 'sharing_oneway', name: '甲租乙还' });

                    return {
                        STORE: s,
                        SHARING: sh
                    };
                });

                const calendarEvents = ref([
                    // Week 1: Holiday
                    { day: 1, title: '五一黄金周大促', businessLine: 'STORE', scopes: ['store_standard', 'store_self'], carGroups: ['store_economy', 'store_suv', 'store_business', 'store_luxury', 'store_mpv'] },
                    { day: 2, title: '五一黄金周大促', businessLine: 'STORE', scopes: ['store_standard', 'store_self'], carGroups: ['store_economy', 'store_suv', 'store_business', 'store_luxury', 'store_mpv'] },
                    { day: 3, title: '五一黄金周大促', businessLine: 'STORE', scopes: ['store_standard', 'store_self'], carGroups: ['store_economy', 'store_suv', 'store_business', 'store_luxury', 'store_mpv'] },

                    // Mid Month: The Busy Day (Test Popover)
                    { day: 15, title: '年中大促预热', businessLine: 'STORE', scopes: ['store_standard'], carGroups: ['store_economy', 'store_suv'] },
                    { day: 15, title: '异地还车0手续费', businessLine: 'SHARING', scopes: ['sharing_oneway'], carGroups: ['sharing_economy', 'sharing_comfort', 'sharing_suv', 'sharing_ev'] },
                    { day: 15, title: '大学生认证半价', businessLine: 'SHARING', scopes: ['sharing_round'], carGroups: ['sharing_economy', 'sharing_ev'] },
                    { day: 15, title: '限时免押金额度', businessLine: 'STORE', scopes: ['store_self'], carGroups: ['store_economy', 'store_suv'] },

                    // Late Month
                    { day: 20, title: '520情侣自驾套餐', businessLine: 'STORE', scopes: ['store_standard'], carGroups: ['store_luxury', 'store_suv'] },
                    { day: 28, title: '月末通勤福利', businessLine: 'SHARING', scopes: ['sharing_oneway'], carGroups: ['sharing_economy'] }
                ]);

                const currentMonth = ref(new Date('2026-05-01'));

                const getEventsForDay = (day) => {
                    if (day > 35) return [];
                    return calendarEvents.value.filter(evt => {
                        // 1. Business Line Check
                        if (evt.businessLine !== activeBusinessTab.value) return false;

                        // 2. Scope Filter
                        // NOTE: Calendar implementation uses 'storeFilters.scopes[id] = boolean' toggle model.
                        // We must interpret this relative to our new color model.
                        // 'store_standard' toggle means "Show campaigns that HAVE standard scope".
                        // 'store_self' toggle means "Show campaigns that HAVE self scope".
                        // 'Universal' isn't a toggle here, it's a derived state.
                        // E.g. A Universal event has BOTH. So if EITHER toggle is ON, does it show?
                        // Or must both be ON? 
                        // Usually: if "Standard" is ON, show anything with Standard (including Universal).
                        // If "Self" is ON, show anything with Self (including Universal).
                        // So Universal events show if EITHER is on.

                        const currentFilters = activeBusinessTab.value === 'STORE' ? storeFilters : sharingFilters;
                        const scopeMatch = evt.scopes.some(scope => currentFilters.scopes[scope]);

                        // 3. Car Group Filter
                        const carGroupFilter = currentFilters.carGroups;
                        const carGroupMatch = carGroupFilter.length === 0 ||
                            (evt.carGroups && evt.carGroups.some(g => carGroupFilter.includes(g)));

                        return evt.day === day && scopeMatch && carGroupMatch;
                    });
                };



                const campaigns = ref([
                    {
                        id: 1,
                        name: '2026年Q3旺季大促',
                        versionId: 'MKT-STORE-20260418-001',
                        displayName: '暑期特惠',
                        description: '针对暑期旅游旺季的全面促销，覆盖全车型',
                        businessLine: 'STORE',
                        scope: ['store_standard', 'store_self'],
                        startDate: '2026-07-01',
                        endDate: '2026-10-31',
                        status: 'Running',
                        level: 10,
                        isActive: true,
                        rules: [{ name: '7月早鸟价' }, { name: '8月高峰价' }]
                    },
                    {
                        id: 7,
                        name: '学生专案行销方案',
                        versionId: 'MKT-STORE-STUDENT-20260420-001',
                        displayName: '学生租车优惠',
                        description: '学生身份到店核验后享受门市租车优惠',
                        businessLine: 'STORE',
                        scope: ['store_standard'],
                        startDate: '2026-05-01',
                        endDate: '2026-12-31',
                        status: 'Running',
                        level: 7,
                        isActive: true,
                        manualVerification: true,
                        qualificationName: '学生身份',
                        requiredDocText: '学生证、在学证明等可证明学生身份的文件',
                        rules: [{ name: '资格核验后85折' }]
                    },
                    {
                        id: 2,
                        name: '同站自助夜间卡',
                        displayName: '夜猫子卡',
                        description: '鼓励夜间错峰用车，提升车辆周转率',
                        businessLine: 'SHARING',
                        scope: ['sharing_round'],
                        startDate: '2026-01-01',
                        endDate: '2026-12-31',
                        status: 'Running',
                        level: 3,
                        isActive: true,
                        rules: [{ name: '夜间时租优惠' }]
                    },
                    {
                        id: 3,
                        name: '长三角互通立减',
                        displayName: '异地减免',
                        description: '异地还车减免50元，促进车辆区域流动',
                        businessLine: 'SHARING',
                        scope: ['sharing_oneway'],
                        startDate: '2026-05-01',
                        endDate: '2026-05-31',
                        status: 'Running',
                        level: 5,
                        isActive: true,
                        rules: []
                    },
                    {
                        id: 4,
                        name: '新用户首单立减',
                        versionId: 'MKT-STORE-20260410-002',
                        displayName: '新人礼',
                        description: '吸引新注册用户完成首次下单转化',
                        businessLine: 'STORE',
                        scope: ['store_standard'],
                        startDate: '2026-06-01',
                        endDate: '2026-08-31',
                        status: 'Planned',
                        level: 8,
                        isActive: false,
                        rules: [{ name: '首单减100' }]
                    },
                    {
                        id: 5,
                        name: '春节不打烊大促',
                        versionId: 'MKT-STORE-20260328-001',
                        displayName: '春节特惠',
                        description: '春节期间租车一口价，提前锁客',
                        businessLine: 'STORE',
                        scope: ['store_standard', 'store_self'],
                        startDate: '2027-01-20',
                        endDate: '2027-02-15',
                        status: 'Planned',
                        level: 3,
                        isActive: false,
                        rules: [{ name: '除夕一口价' }, { name: '初一至初七一口价' }]
                    },
                    {
                        id: 6,
                        name: '周末郊游季',
                        displayName: '周末畅行',
                        description: '针对周末用车高峰的定向优惠',
                        businessLine: 'SHARING',
                        scope: ['sharing_round'],
                        startDate: '2026-04-01',
                        endDate: '2026-06-30',
                        status: 'Ended',
                        level: 2,
                        isActive: false,
                        rules: [{ name: '周末8折' }]
                    }
                ]);
                const marketingVersionRecords = ref([
                    {
                        version: 'MKT-STORE-20260418-001',
                        name: '2026年Q3旺季大促',
                        status: '当前生效',
                        savedBy: '行销运营',
                        savedAt: '2026-04-18 11:30',
                        displayName: '暑期特惠',
                        scopeText: '标准门市、自助',
                        description: '针对暑期旅游旺季的全面促销，覆盖全车型',
                        eligibility: '个人会员、企业资格客户',
                        carGroups: '全部门市车组',
                        period: '2026-07-01 ~ 2026-10-31',
                        level: '10',
                        rules: [
                            { name: '7月早鸟价', condition: '提前 7 天下单，门市全车组可用', action: '平日 85 折，假日 9 折' },
                            { name: '8月高峰价', condition: '用车时间落在 2026-08-01 ~ 2026-08-31', action: '平日 88 折，假日 92 折' },
                            { name: '互斥规则', condition: '命中多个行销方案时', action: '取优先级最高方案，不叠加' }
                        ]
                    },
                    {
                        version: 'MKT-STORE-20260410-002',
                        name: '新用户首单立减',
                        status: '待生效',
                        savedBy: '行销运营',
                        savedAt: '2026-04-10 15:00',
                        displayName: '新人礼',
                        scopeText: '标准门市',
                        description: '吸引新注册用户完成首次下单转化',
                        eligibility: '新注册个人会员',
                        carGroups: '经济型、舒适型',
                        period: '2026-06-01 ~ 2026-08-31',
                        level: '8',
                        rules: [
                            { name: '首单减100', condition: '新注册个人会员首个门市订单，最低租期 1 天', action: '订单租金立减 ¥100' },
                            { name: '适用渠道', condition: '门市柜台、App 下单', action: '按同一优惠动作执行' },
                            { name: '互斥规则', condition: '命中其他行销方案时', action: '不叠加，按优先级取最优' }
                        ]
                    },
                    {
                        version: 'MKT-STORE-STUDENT-20260420-001',
                        name: '学生专案行销方案',
                        status: '当前生效',
                        savedBy: '行销运营',
                        savedAt: '2026-04-20 14:20',
                        displayName: '学生租车优惠',
                        scopeText: '标准门市',
                        description: '学生身份到店核验后享受门市租车优惠',
                        eligibility: '个人会员',
                        manualVerification: true,
                        requiredDocText: '学生证、在学证明等可证明学生身份的文件',
                        carGroups: '全部门市车组',
                        period: '2026-05-01 ~ 2026-12-31',
                        level: '7',
                        rules: [
                            { name: '资格核验后85折', condition: '客户取车时提供有效学生证明文件', action: '平日 85 折，假日 9 折' },
                            { name: '自助限制', condition: '24h 自助租车', action: '不开放选择该方案' },
                            { name: '核验不通过', condition: '无法提供有效学生证明', action: '门店更换行销方案并重算尾款' }
                        ]
                    },
                    {
                        version: 'MKT-STORE-20260328-001',
                        name: '春节不打烊大促',
                        status: '历史版本',
                        savedBy: '行销主管',
                        savedAt: '2026-03-28 09:40',
                        displayName: '春节特惠',
                        scopeText: '标准门市、自助',
                        description: '春节期间租车一口价，提前锁客',
                        eligibility: '个人会员、企业资格客户',
                        carGroups: '全部门市车组',
                        period: '2027-01-20 ~ 2027-02-15',
                        level: '3',
                        rules: [
                            { name: '除夕一口价', condition: '用车日为除夕，门市全车组', action: '¥399/天' },
                            { name: '初一至初七一口价', condition: '用车日为初一至初七，门市全车组', action: '¥499/天' },
                            { name: '互斥规则', condition: '命中优惠券或积分抵扣时', action: '不与优惠券叠加' }
                        ]
                    },
                    {
                        version: 'MKT-SHARE-20260418-001',
                        name: '同站自助夜间卡',
                        status: '当前生效',
                        savedBy: '行销运营',
                        savedAt: '2026-04-18 10:30',
                        displayName: '夜猫子卡',
                        scopeText: '同站租还',
                        description: '鼓励夜间错峰用车，提升车辆周转率',
                        eligibility: '个人会员',
                        carGroups: '分时舒适型',
                        period: '2026-01-01 ~ 2026-12-31',
                        level: '3',
                        rules: [
                            { name: '夜间时租优惠', condition: '每日 22:00-06:00，同站租还', action: '夜间时租 8 折' },
                            { name: '互斥规则', condition: '命中其他分时行销方案时', action: '不与其他行销方案叠加' }
                        ]
                    }
                ]);
                const marketingVersionDialogVisible = ref(false);
                const selectedMarketingVersion = ref(null);
                const openMarketingVersion = (row) => {
                    const version = row?.versionId || (row?.businessLine === 'STORE' ? 'MKT-STORE-20260418-001' : 'MKT-SHARE-20260418-001');
                    selectedMarketingVersion.value = marketingVersionRecords.value.find(item => item.version === version)
                        || marketingVersionRecords.value.find(item => item.name === row?.name)
                        || marketingVersionRecords.value[0];
                    marketingVersionDialogVisible.value = true;
                };
                const getMarketingVersionBasicRows = (version) => {
                    if (!version) return [];
                    return [
                        { label: '方案名称', value: version.name || '-' },
                        { label: '展示名称', value: version.displayName || '-' },
                        { label: '方案等级 (排序权重)', value: version.level || '-' },
                        { label: '状态', value: version.status || '-' },
                        { label: '方案有效期', value: version.period || '-' },
                        { label: '适用场景', value: version.scopeText || '-' },
                        { label: '客户群体', value: version.eligibility || '-' },
                        { label: '适用国籍', value: version.nationalities || '全部国籍' },
                        { label: '适用卡种', value: version.cardTypes || 'Visa / Mastercard / American Express / 银联 / JCB' },
                        { label: '到店核验', value: version.manualVerification ? '需到店核验' : '无需到店核验' },
                        { label: '资格名称', value: version.qualificationName || '-' },
                        { label: '证明文件说明', value: version.requiredDocText || '无额外上传要求' },
                        { label: '适用车组', value: version.carGroups || '-' },
                        { label: '方案说明', value: version.description || '-' }
                    ];
                };
                const getMarketingVersionRuleRows = (version) => {
                    if (!version?.rules?.length) return [];
                    return version.rules.map(rule => ({
                        name: rule.name,
                        salesWindow: rule.salesWindow || '不限',
                        useWindow: rule.useWindow || version.period || '不限',
                        advanceBooking: rule.advanceBooking || (rule.name.includes('早鸟') ? '7 天' : '0 天'),
                        carGroup: rule.carGroup || version.carGroups || '全部门市车组',
                        membership: rule.membership || version.eligibility || '不限',
                        rentalTerm: rule.rentalTerm || (rule.name.includes('首单') ? '1 天起' : '不限'),
                        locationScope: rule.locationScope || '全部地区 / 全部门市',
                        action: rule.action || '-'
                    }));
                };

                // Open detail for editing
                // Open detail for editing
                const openStoreDetail = (row) => {
                    // Decide mode based on business line
                    if (row) {
                        wizardMode.value = row.businessLine || 'STORE';
                    } else {
                        // Keep existing wizardMode if creating new, or default
                        if (!wizardMode.value) wizardMode.value = 'STORE';
                    }

                    if (wizardMode.value === 'STORE') {
                        if (row) {
                            // Deep copy to currentScheme to populate the form
                            const data = JSON.parse(JSON.stringify(row));
                            // Default fields ensuring existence
                            if (data.level === undefined) data.level = 0;
                            if (!data.rules) data.rules = [];
                            if (!data.tags) data.tags = data.scope || [];
                            if (!data.nationalities) data.nationalities = [];
                            if (!data.cardTypes) data.cardTypes = [];
                            if (!data.description) data.description = '';
                            data.manualVerification = !!data.manualVerification;
                            if (!data.qualificationName) data.qualificationName = '';
                            if (!data.requiredDocText) data.requiredDocText = '';

                            // Ensure dateRange exists
                            if (!data.dateRange && data.startDate && data.endDate) {
                                data.dateRange = [data.startDate, data.endDate];
                            }
                            Object.assign(currentScheme, data);
                        } else {
                            // Reset scheme for new creation
                            Object.assign(currentScheme, {
                                id: Date.now(),
                                name: '',
                                displayName: '',
                                level: 0,
                                businessLine: 'STORE',
                                status: true,
                                dateRange: [],
                                tags: ['store_standard'], // Default scope for store
                                rules: [],
                                nationalities: [],
                                cardTypes: [],
                                description: '',
                                manualVerification: false,
                                qualificationName: '',
                                requiredDocText: ''
                            });
                        }
                    }

                    detailVisible.value = true;
                };

                const filteredCampaigns = computed(() => {
                    let result = [];
                    if (listFilter.value === 'store') {
                        result = campaigns.value.filter(c => c.businessLine === 'STORE');
                        const selected = listScopeFilters.store;

                        if (selected.length > 0) {
                            result = result.filter(c => {
                                // Check intersection
                                const matchSpecific = c.scope.some(s => selected.includes(s));
                                // Check universal
                                const wantsUniversal = selected.includes('store_universal');
                                const isUniversal = c.scope.includes('store_standard') && c.scope.includes('store_self');

                                return matchSpecific || (wantsUniversal && isUniversal);
                            });
                        } else {
                            result = [];
                        }
                        // Car Group Filter
                        // Since campaigns don't explicitly list car groups (they apply to all in scope usually, or defined in rules?)
                        // Wait, check campaign data. Line 1214: scope: [...], rules: [...]. No `carGroups` field on campaign object basically.
                        // The Calendar events mock data HAD carGroups. The Campaign objects DO NOT.
                        // Therefore, filtering campaigns by Car Group might be tricky if data doesn't exist.
                        // If I implement filtering, I assume a campaign applies to ALL car groups in its scope UNLESS restricted.
                        // But I don't have vehicle restriction data in campaign object.
                        // So for now, I will NOT filter by Car Group in List View (as logically it might not map 1:1 without more data), 
                        // OR I assume if a campaign has NO car group restrictions, it passes.
                        // "Make it the same" usually means Visuals primarily.
                        // Actually, let's look at `getEventsForDay` logic. It checks `evt.carGroups`.
                        // `calendarEvents` (line 1166) has `carGroups` array explicitly.
                        // `campaigns` (line 1207) DOES NOT have `carGroups`. 
                        // It seems `calendarEvents` are derived instances? Or just mock data?
                        // It's mock data.
                        // So Campaign List filtering by Car Group is impossible without adding `carGroups` to campaign objects.
                        // I will skip adding logic to `filteredCampaigns` to avoid breaking it with undefined properties,
                        // effectively making the filter UI "Visual Only" for now in List View.
                    } else if (listFilter.value === 'sharing') {
                        result = campaigns.value.filter(c => c.businessLine === 'SHARING');
                        const selected = listScopeFilters.sharing;

                        if (selected.length > 0) {
                            result = result.filter(c => {
                                const matchSpecific = c.scope.some(s => selected.includes(s));
                                const wantsUniversal = selected.includes('sharing_universal');
                                const isUniversal = c.scope.includes('sharing_round') && c.scope.includes('sharing_oneway');

                                return matchSpecific || (wantsUniversal && isUniversal);
                            });
                        } else {
                            result = [];
                        }
                    } else {
                        // Fallback
                        result = campaigns.value;
                    }
                    return result;
                });

                const getScopeLabel = (row) => {
                    let labels = [];
                    if (row.scope.includes('store_standard')) labels.push('标准门市');
                    if (row.scope.includes('store_self')) labels.push('自助');
                    if (row.scope.includes('sharing_round')) labels.push('同站');
                    if (row.scope.includes('sharing_oneway')) labels.push('异地');
                    return labels.join(', ');
                };

                const getScopeMiniLabel = (scopeId) => {
                    const map = {
                        'store_standard': '标',
                        'store_self': '自',
                        'sharing_round': '同',
                        'sharing_oneway': '异'
                    };
                    return map[scopeId] || substr(0, 1);
                };

                const toggleListFilter = (type, id) => {
                    const target = type === 'store' ? listScopeFilters.store : listScopeFilters.sharing;
                    const idx = target.indexOf(id);
                    if (idx > -1) {
                        target.splice(idx, 1);
                    } else {
                        target.push(id);
                    }
                };

                // --- Actions ---
                const startCreateCampaign = (type) => {
                    wizardMode.value = type;

                    if (type === 'STORE') {
                        openStoreDetail(null);
                        // Default select ALL scopes for convenience
                        currentScheme.tags = ['store_standard', 'store_self'];
                    } else {
                        // Init new sharing campaign
                        Object.assign(currentScheme, {
                            id: Date.now(),
                            name: '',
                            displayName: '',
                            level: 0,
                            businessLine: 'SHARING',
                            status: true,
                            dateRange: [],
                            tags: ['sharing_round', 'sharing_oneway'], // Default select ALL
                            description: '',
                            rules: [],
                            nationalities: [],
                            cardTypes: [],
                            manualVerification: false,
                            qualificationName: '',
                            requiredDocText: ''
                        });
                    }
                    detailVisible.value = true;
                };

                // --- Ported Store Logic (Scheme + Rules) ---
                const currentScheme = reactive({
                    id: null,
                    name: '',
                    displayName: '',
                    status: true,
                    dateRange: [],
                    tags: [],
                    description: '',
                    manualVerification: false,
                    qualificationName: '',
                    requiredDocText: '',
                    rules: [] // Container for rules
                });

                const ruleDialogVisible = ref(false);
                const isEditRule = ref(false);
                let editingRuleIndex = -1;

                const currentRule = reactive({
                    name: '',
                    dateRange: [],
                    salesDateRange: [],
                    membership: [],
                    carModels: 'all',
                    advanceDays: 0,
                    minDays: 1, maxDays: null,
                    regions: [], stores: [],
                    priceMode: 'uniform',
                    type: 'discount',
                    value: 9.5,
                    weekendType: 'discount',
                    weekendValue: 9.5,
                    adjustedWeekdayType: 'discount',
                    adjustedWeekdayValue: 9.5,
                    legalHolidayType: 'discount',
                    legalHolidayValue: 9.5,
                    sharingPrices: null, // Will be init in openRuleDialog
                    enableGift: false,
                    giftBuy: 3,
                    giftOne: 1
                });

                const openRuleDialog = (row, index) => {
                    ruleDialogVisible.value = true;
                    if (row) {
                        isEditRule.value = true;
                        editingRuleIndex = index;
                        const data = JSON.parse(JSON.stringify(row));
                        // Data migration/init if missing fields
                        if (!data.priceMode) data.priceMode = 'uniform';
                        if (data.weekendValue === undefined) data.weekendValue = data.value;
                        // Defaults for 4-tier
                        if (!data.weekendType) data.weekendType = data.type || 'discount';
                        if (!data.adjustedWeekdayType) data.adjustedWeekdayType = data.type || 'discount';
                        if (data.adjustedWeekdayValue === undefined) data.adjustedWeekdayValue = data.value || 0;
                        if (!data.legalHolidayType) data.legalHolidayType = data.weekendType || 'discount';
                        if (data.legalHolidayValue === undefined) data.legalHolidayValue = data.weekendValue || 0;

                        // Initialize sharingPrices map if not exists
                        // Structure: { 'sharing_round': { 'economy': { hourly: 0, daily: 0, active: false } } }
                        if (!data.sharingPrices) {
                            data.sharingPrices = {
                                sharing_round: {},
                                sharing_oneway: {}
                            };
                            // Pre-populate
                            ['sharing_round', 'sharing_oneway'].forEach(sc => {
                                sharingCarGroups.forEach(cg => {
                                    data.sharingPrices[sc][cg.id] = { hourly: 15, daily: 99, active: false };
                                });
                            });
                        }

                        if (data.enableGift === undefined) data.enableGift = false;
                        if (!data.membership) data.membership = [];
                        if (!data.salesDateRange) data.salesDateRange = [];
                        Object.assign(currentRule, data);
                    } else {
                        isEditRule.value = false;
                        editingRuleIndex = -1;
                        // Reset rule form
                        Object.assign(currentRule, {
                            name: '',
                            dateRange: [],
                            salesDateRange: [],
                            membership: [],
                            carModels: 'all',
                            advanceDays: 0,
                            minDays: 1, maxDays: null,
                            regions: [], stores: [],
                            priceMode: 'uniform',
                            type: 'discount',
                            value: 9.5,
                            weekendType: 'discount',
                            weekendValue: 9.5,
                            adjustedWeekdayType: 'discount',
                            adjustedWeekdayValue: 9.5,
                            legalHolidayType: 'discount',
                            legalHolidayValue: 9.5,
                            sharingPrices: null, // Will be init in openRuleDialog
                            enableGift: false,
                            giftBuy: 3,
                            giftOne: 1
                        });
                        // Manually trigger sharingPrices initialization for new rules
                        if (wizardMode.value === 'SHARING' && !currentRule.sharingPrices) {
                            currentRule.sharingPrices = {
                                sharing_round: {},
                                sharing_oneway: {}
                            };
                            ['sharing_round', 'sharing_oneway'].forEach(sc => {
                                sharingCarGroups.forEach(cg => {
                                    currentRule.sharingPrices[sc][cg.id] = { hourly: 15, daily: 99, active: false };
                                });
                            });
                        }
                    }
                };

                const saveRule = () => {
                    if (!currentRule.name) {
                        ElMessage.warning('请输入规则名称');
                        return;
                    }
                    const ruleData = JSON.parse(JSON.stringify(currentRule));
                    if (ruleData.priceMode === 'uniform') {
                        ruleData.weekendValue = ruleData.value;
                        ruleData.weekendType = ruleData.type;
                    }

                    if (isEditRule.value && editingRuleIndex !== -1) {
                        currentScheme.rules[editingRuleIndex] = ruleData;
                    } else {
                        currentScheme.rules.push(ruleData);
                    }
                    ruleDialogVisible.value = false;
                };

                const removeRule = (index) => {
                    currentScheme.rules.splice(index, 1);
                };

                const submitCampaign = () => {
                    if (!currentScheme.name) {
                        ElMessage.warning('请输入方案名称');
                        return;
                    }
                    // Format for campaign list
                    const campaignData = {
                        id: Date.now(),
                        name: currentScheme.name,
                        description: currentScheme.description || currentScheme.displayName,
                        businessLine: wizardMode.value, // STORE or SHARING
                        scope: [...currentScheme.tags],
                        startDate: currentScheme.dateRange?.[0] || '',
                        endDate: currentScheme.dateRange?.[1] || '',
                        status: currentScheme.status ? 'Running' : 'Stopped'
                    };

                    campaigns.value.unshift(campaignData);
                    detailVisible.value = false;
                    ElMessage.success('方案创建成功');
                };

                const formatDate = (dateStr) => {
                    if (!dateStr) return '-';
                    const d = new Date(dateStr);
                    return `${d.getMonth() + 1}月${d.getDate()}日`;
                };

                const getCarGroupName = (id) => {
                    if (!storeCarGroups || !sharingCarGroups) return id;
                    const g = storeCarGroups.find(c => c.id === id) || sharingCarGroups.find(c => c.id === id);
                    return g ? g.name : id;
                };

                const getScopeName = (scopeId) => {
                    const storeOpt = scopeOptions.STORE.find(o => o.id === scopeId);
                    if (storeOpt) return storeOpt.name;
                    const sharingOpt = scopeOptions.SHARING.find(o => o.id === scopeId);
                    if (sharingOpt) return sharingOpt.name;
                    return scopeId;
                };

                const getBusinessStyle = (evtOrLine) => {
                    // Handle both event object and simple string (legacy/fallback)
                    let businessLine = evtOrLine;
                    let scopes = [];

                    if (typeof evtOrLine === 'object') {
                        businessLine = evtOrLine.businessLine;
                        scopes = evtOrLine.scopes || [];
                    }

                    if (businessLine === 'STORE') {
                        const hasStandard = scopes.includes('store_standard');
                        const hasSelf = scopes.includes('store_self');

                        if (hasStandard && hasSelf) return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-500', dot: 'bg-purple-500' };
                        if (hasSelf) return { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-500', dot: 'bg-teal-500' };
                        return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', dot: 'bg-orange-500' }; // Standard/Default
                    }
                    if (businessLine === 'SHARING') {
                        const hasRound = scopes.includes('sharing_round');
                        const hasOneWay = scopes.includes('sharing_oneway'); // Assuming 'sharing_oneway' is the key

                        if (hasRound && hasOneWay) return { bg: 'bg-[#e0f2fe]', text: 'text-theme-primary', border: 'border-theme-primary', dot: 'bg-theme-primary' }; // Both
                        if (hasOneWay) return { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-500', dot: 'bg-rose-500' }; // Alert/Diff
                        return { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-500', dot: 'bg-cyan-500' }; // Standard Round
                    }
                    return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-500', dot: 'bg-gray-500' };
                };

                return {
                    currentTenant, currentTenantName, switchTenant, hasPermission,
                    viewMode, listFilter, listScopeFilters,
                    detailVisible, wizardMode,
                    campaigns, filteredCampaigns, toggleListFilter,
                    marketingVersionRecords, marketingVersionDialogVisible, selectedMarketingVersion, openMarketingVersion,
                    getMarketingVersionBasicRows, getMarketingVersionRuleRows,
                    startCreateCampaign, getScopeLabel, getScopeMiniLabel, openStoreDetail,
                    // Store Logic
                    currentScheme, currentRule, ruleDialogVisible, isEditRule,
                    openRuleDialog, saveRule, removeRule, submitCampaign, formatDate, getCarGroupName, getScopeName, getBusinessStyle,
                    calendarEvents, currentMonth, getEventsForDay, scopeOptions,
                    activeBusinessTab, storeCarGroups, sharingCarGroups, storeFilters, sharingFilters
                };
            
  },
};
</script>

<style scoped>
        .marketing-page {
            min-height: 100%;
        }

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

        /* Calendar Styles */
        .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background-color: #e5e7eb;
        }

        .calendar-cell {
            background-color: white;
            min-height: 100px;
            padding: 8px;
        }

        .calendar-event {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
            margin-bottom: 2px;
            cursor: pointer;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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

        .marketing-view-switch :deep(.el-radio-button__inner) {
            color: #475569;
            border-color: #d8e3ea;
            background: #fff;
            font-weight: 600;
        }

        .marketing-view-switch :deep(.el-radio-button__inner:hover) {
            color: var(--app-color-primary);
        }

        .marketing-view-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
            color: #fff !important;
            background-color: var(--app-color-primary) !important;
            border-color: var(--app-color-primary) !important;
            box-shadow: -1px 0 0 0 var(--app-color-primary) !important;
        }

        .marketing-view-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner:hover) {
            color: #fff !important;
            background-color: var(--app-color-primary-hover) !important;
            border-color: var(--app-color-primary-hover) !important;
        }
</style>
