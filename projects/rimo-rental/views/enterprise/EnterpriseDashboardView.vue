<template>
<main class="dashboard-page">
                    <section class="dashboard-toolbar">
                        <div>
                            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Dashboard</h1>
                            <p class="text-gray-500 text-sm mt-1">查看企業公務車整體用車概況、車輛與部門排行及月度趨勢。</p>
                        </div>
                        <div class="toolbar-filter-shell">
                            <div class="toolbar-filter">
                                <div class="toolbar-filter-caption">查看範圍</div>
                                <el-tree-select v-model="selectedCompany" :data="companyTreeList" node-key="value"
                                    check-strictly default-expand-all filterable :render-after-expand="false"
                                    placeholder="請選擇公司或據點" />
                            </div>
                        </div>
                    </section>

                    <section class="metrics-panel">
                        <div class="metrics-grid">
                            <article class="metrics-card">
                                <el-tooltip placement="top" :show-after="250" popper-class="metrics-help-popper">
                                    <template #content>
                                        <div>员工数：当前查看范围内所有在职员工数量，不受用车资格状态影响。</div>
                                        <div>可用车员工数：当前查看范围内在职且用车资格为“启用”的员工数量。</div>
                                    </template>
                                    <el-icon class="metrics-help" aria-label="查看员工数计算说明"><QuestionFilled /></el-icon>
                                </el-tooltip>
                                <div class="metrics-icon metrics-icon-coral">
                                    <el-icon class="metrics-card-icon"><User /></el-icon>
                                </div>
                                <div class="metrics-copy">
                                    <div class="metrics-value">{{ topMetrics.employeeTotal }}</div>
                                    <div class="metrics-label">員工數</div>
                                    <div class="metrics-sub">可用車員工數 <strong>{{ topMetrics.availableEmployees }}</strong></div>
                                    <div class="metrics-progress">
                                        <span :style="{ width: topMetrics.availableEmployeeRate + '%' }"></span>
                                    </div>
                                </div>
                            </article>

                            <article class="metrics-card">
                                <el-tooltip placement="top" :show-after="250" popper-class="metrics-help-popper">
                                    <template #content>
                                        <div>公务车数：当前查看范围内所有公务车数量，不受合约与上架状态影响。</div>
                                        <div>可用车数：当前查看范围内已绑定有效合约且处于上架状态的公务车数量。</div>
                                    </template>
                                    <el-icon class="metrics-help" aria-label="查看公务车数计算说明"><QuestionFilled /></el-icon>
                                </el-tooltip>
                                <div class="metrics-icon metrics-icon-blue">
                                    <el-icon class="metrics-card-icon"><Van /></el-icon>
                                </div>
                                <div class="metrics-copy">
                                    <div class="metrics-value">{{ topMetrics.vehicleTotal }}</div>
                                    <div class="metrics-label">公務車數</div>
                                    <div class="metrics-sub">可用車數 <strong>{{ topMetrics.availableVehicles }}</strong></div>
                                    <div class="metrics-progress">
                                        <span :style="{ width: topMetrics.availableVehicleRate + '%' }"></span>
                                    </div>
                                </div>
                            </article>

                            <article class="metrics-card">
                                <el-tooltip placement="top" :show-after="250" popper-class="metrics-help-popper">
                                    <template #content>
                                        <div>总计公务用车次数：当前查看范围内累计产生的公务用车次数。</div>
                                        <div>统计周期：自企业启用公务车业务起，累计至当前时间。</div>
                                    </template>
                                    <el-icon class="metrics-help" aria-label="查看总计公务用车次数计算说明"><QuestionFilled /></el-icon>
                                </el-tooltip>
                                <div class="metrics-icon metrics-icon-cyan">
                                    <el-icon class="metrics-card-icon"><Odometer /></el-icon>
                                </div>
                                <div class="metrics-copy">
                                    <div class="metrics-value">{{ topMetrics.totalUsageTimes }}</div>
                                    <div class="metrics-label">總計公務用車次數</div>
                                    <div class="metrics-trend-row">
                                        <div class="metrics-trend is-flat">累计至今日</div>
                                        <svg class="metrics-sparkline is-up" viewBox="0 0 64 24" aria-hidden="true">
                                            <path d="M2 20 C12 17, 16 10, 25 13 S41 17, 48 8 S57 5, 62 4" />
                                        </svg>
                                    </div>
                                </div>
                            </article>

                            <article class="metrics-card">
                                <el-tooltip placement="top" :show-after="250" popper-class="metrics-help-popper">
                                    <template #content>
                                        <div>本月平均使用率 = 当前查看范围内本月实际用车分钟数 ÷ 本月车辆理论可用分钟数 × 100%。</div>
                                        <div>较上月 =（本月平均使用率 - 上月同期平均使用率）÷ 上月同期平均使用率 × 100%。</div>
                                    </template>
                                    <el-icon class="metrics-help" aria-label="查看本月平均使用率计算说明"><QuestionFilled /></el-icon>
                                </el-tooltip>
                                <div class="metrics-icon metrics-icon-rose">
                                    <el-icon class="metrics-card-icon"><TrendCharts /></el-icon>
                                </div>
                                <div class="metrics-copy">
                                    <div class="metrics-value">{{ topMetrics.monthAvgUsageRate }}<span class="metrics-unit">%</span></div>
                                    <div class="metrics-label">本月平均使用率</div>
                                    <div class="metrics-trend-row">
                                        <div class="metrics-trend" :class="topMetrics.monthAvgUsageRateTrendType">较上月 {{ topMetrics.monthAvgUsageRateTrend }}</div>
                                        <svg class="metrics-sparkline is-flat" viewBox="0 0 64 24" aria-hidden="true">
                                            <path d="M2 13 C12 12, 18 13, 25 12 S39 11, 47 12 S56 13, 62 12" />
                                        </svg>
                                    </div>
                                </div>
                            </article>

                            <article class="metrics-card">
                                <el-tooltip placement="top" :show-after="250" popper-class="metrics-help-popper">
                                    <template #content>
                                        <div>本月用车次数：当前查看范围内本月创建或用车时间发生在本月的公务车订单数量。</div>
                                        <div>较上月 =（本月用车次数 - 上月同期用车次数）÷ 上月同期用车次数 × 100%。</div>
                                    </template>
                                    <el-icon class="metrics-help" aria-label="查看本月用车次数计算说明"><QuestionFilled /></el-icon>
                                </el-tooltip>
                                <div class="metrics-icon metrics-icon-green">
                                    <el-icon class="metrics-card-icon"><DataLine /></el-icon>
                                </div>
                                <div class="metrics-copy">
                                    <div class="metrics-value">{{ topMetrics.monthUsageTimes }}</div>
                                    <div class="metrics-label">本月用車次數</div>
                                    <div class="metrics-trend-row">
                                        <div class="metrics-trend" :class="topMetrics.monthUsageTrendType">较上月 {{ topMetrics.monthUsageTrend }}</div>
                                        <svg class="metrics-sparkline is-down" viewBox="0 0 64 24" aria-hidden="true">
                                            <path d="M2 5 C12 7, 17 8, 24 7 S38 10, 45 14 S55 19, 62 20" />
                                        </svg>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <div class="dashboard-main">
                        <div class="dashboard-cell dashboard-brief">
                            <section class="dashboard-panel">
                                <header class="panel-header">
                                    <div class="panel-title">{{ briefingTitle }}</div>
                                    <el-button class="field-help-button" size="small" text bg @click="briefingHelpVisible = true">
                                        <el-icon><QuestionFilled /></el-icon>
                                        欄位說明
                                    </el-button>
                                </header>

                                <div class="briefing-table-wrap">
                                    <div class="briefing-table-scroll">
                                        <table class="briefing-table">
                                            <thead>
                                                <tr>
                                                    <th style="width: 17%;">{{ briefingNameLabel }}</th>
                                                    <th style="width: 16%;">{{ briefingStatusLabel }}</th>
                                                    <th style="width: 12%;">本月已完成</th>
                                                    <th style="width: 15%;">本月用車時長 (hr)</th>
                                                    <th style="width: 12%;">使用率</th>
                                                    <th style="width: 10%;">較上月</th>
                                                    <th style="width: 9%;">未完成訂單</th>
                                                    <th style="width: 9%;">平均每次時長</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="row in briefingRows" :key="row.id">
                                                    <td>
                                                        <div class="briefing-name">
                                                            <el-icon class="briefing-name-icon">
                                                                <Location v-if="isHeadquartersScope" />
                                                                <Van v-else />
                                                            </el-icon>
                                                            <div class="min-w-0">
                                                                <div class="briefing-name-main">{{ row.name }}</div>
                                                                <div v-if="row.subName" class="briefing-name-sub">{{ row.subName }}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <template v-if="isHeadquartersScope">
                                                            <div class="briefing-metric">
                                                                <span class="briefing-metric-value">{{ row.available }} / {{ row.total }}</span>
                                                                <span class="briefing-bar">
                                                                    <span :style="{ width: row.availableRate + '%' }"></span>
                                                                </span>
                                                            </div>
                                                        </template>
                                                        <template v-else>
                                                            <span class="briefing-status" :class="row.statusType">{{ row.statusText }}</span>
                                                        </template>
                                                    </td>
                                                    <td>{{ row.completed }}</td>
                                                    <td>
                                                        <div class="briefing-metric">
                                                            <span class="briefing-metric-value">{{ formatNumber(row.duration) }}</span>
                                                            <span class="briefing-bar briefing-bar-blue">
                                                                <span :style="{ width: row.durationRate + '%' }"></span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div class="briefing-metric">
                                                            <span class="briefing-metric-value">{{ row.usageRate }}%</span>
                                                            <span class="briefing-bar briefing-bar-orange">
                                                                <span :style="{ width: row.usageRate + '%' }"></span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span class="briefing-trend" :class="getBriefingTrendClass(row.compare)">
                                                            {{ row.compare > 0 ? '▲' : row.compare < 0 ? '▼' : '—' }}
                                                            {{ formatCompare(row.compare) }}
                                                        </span>
                                                    </td>
                                                    <td>{{ row.pending }}</td>
                                                    <td>{{ row.avgDuration }}</td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr>
                                                    <td>總計</td>
                                                    <td>{{ briefingTotal.status }}</td>
                                                    <td>{{ briefingTotal.completed }}</td>
                                                    <td>{{ formatNumber(briefingTotal.duration) }}</td>
                                                    <td>{{ briefingTotal.usageRate }}%</td>
                                                    <td>
                                                        <span class="briefing-trend" :class="getBriefingTrendClass(briefingTotal.compare)">
                                                            {{ briefingTotal.compare > 0 ? '▲' : briefingTotal.compare < 0 ? '▼' : '—' }}
                                                            {{ formatCompare(briefingTotal.compare) }}
                                                        </span>
                                                    </td>
                                                    <td>{{ briefingTotal.pending }}</td>
                                                    <td>{{ briefingTotal.avgDuration }}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div class="dashboard-cell dashboard-employee">
                            <section class="dashboard-panel table-panel">
                                <header class="panel-header">
                                    <div class="panel-header-main">
                                        <div class="panel-title">員工用車排名</div>
                                        <el-radio-group v-model="employeeSort" size="small" class="panel-switch">
                                            <el-radio-button label="times">次數</el-radio-button>
                                            <el-radio-button label="duration">時長</el-radio-button>
                                        </el-radio-group>
                                    </div>
                                    <div class="panel-link">全部</div>
                                </header>

                                <div class="rank-table-wrap">
                                    <table class="rank-table">
                                        <thead>
                                            <tr>
                                                <th class="text-center" style="width: 62px;">排名</th>
                                                <th style="width: 22%;">姓名</th>
                                                <th>部門</th>
                                                <th class="text-right" style="width: 78px;">用車次數</th>
                                                <th class="text-right" style="width: 78px;">用車時數</th>
                                            </tr>
                                        </thead>
                                        <tbody v-if="employeeRows.length">
                                            <tr v-for="(row, index) in employeeRows" :key="row.id">
                                                <td class="text-center">
                                                    <span class="rank-badge" :class="index < 3 ? 'rank-badge-top' : 'rank-badge-normal'">{{ index + 1 }}</span>
                                                </td>
                                                <td class="rank-table-ellipsis" :title="row.name">{{ row.name }}</td>
                                                <td class="rank-table-ellipsis" :title="row.department">{{ row.department }}</td>
                                                <td class="text-right">{{ row.times }}</td>
                                                <td class="text-right">{{ row.duration }}</td>
                                            </tr>
                                        </tbody>
                                        <tbody v-else>
                                            <tr>
                                                <td class="rank-table-empty" colspan="5">暫無資料</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                        <div class="dashboard-cell dashboard-overall">
                            <section class="dashboard-panel">
                                <header class="panel-header">
                                    <div class="panel-title">總體用車率</div>
                                    <el-radio-group v-model="overallMode" size="small" class="panel-switch">
                                        <el-radio-button label="month">月</el-radio-button>
                                        <el-radio-button label="year">年</el-radio-button>
                                    </el-radio-group>
                                </header>
                                <div ref="overallChartRef" class="chart-surface chart-tall"></div>
                            </section>
                        </div>

                        <div class="dashboard-cell dashboard-vehicle">
                            <section class="dashboard-panel table-panel">
                                <header class="panel-header">
                                    <div class="panel-header-main">
                                        <div class="panel-title">車輛用車排名</div>
                                        <el-radio-group v-model="vehicleSort" size="small" class="panel-switch">
                                            <el-radio-button label="times">次數</el-radio-button>
                                            <el-radio-button label="duration">時長</el-radio-button>
                                        </el-radio-group>
                                    </div>
                                    <div class="panel-link">全部</div>
                                </header>

                                <div class="rank-table-wrap">
                                    <table class="rank-table">
                                        <thead>
                                            <tr>
                                                <th class="text-center" style="width: 62px;">排名</th>
                                                <th style="width: 24%;">車牌號碼</th>
                                                <th>據點</th>
                                                <th class="text-right" style="width: 78px;">用車次數</th>
                                                <th class="text-right" style="width: 78px;">用車時數</th>
                                            </tr>
                                        </thead>
                                        <tbody v-if="vehicleRows.length">
                                            <tr v-for="(row, index) in vehicleRows" :key="row.plate">
                                                <td class="text-center">
                                                    <span class="rank-badge" :class="index < 3 ? 'rank-badge-top' : 'rank-badge-normal'">{{ index + 1 }}</span>
                                                </td>
                                                <td class="rank-table-ellipsis" :title="row.plate">{{ row.plate }}</td>
                                                <td class="rank-table-ellipsis" :title="row.station">{{ row.station }}</td>
                                                <td class="text-right">{{ row.times }}</td>
                                                <td class="text-right">{{ row.duration }}</td>
                                            </tr>
                                        </tbody>
                                        <tbody v-else>
                                            <tr>
                                                <td class="rank-table-empty" colspan="5">暫無資料</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                        <div class="dashboard-cell dashboard-department">
                            <section class="dashboard-panel">
                                <header class="panel-header">
                                    <div class="panel-header-main">
                                        <div class="panel-title">部門用車統計</div>
                                        <el-radio-group v-model="departmentMetric" size="small" class="panel-switch">
                                            <el-radio-button label="duration">時長</el-radio-button>
                                            <el-radio-button label="times">次數</el-radio-button>
                                        </el-radio-group>
                                    </div>
                                    <el-radio-group v-model="departmentMode" size="small" class="panel-switch">
                                        <el-radio-button label="month">本月</el-radio-button>
                                        <el-radio-button label="year">今年</el-radio-button>
                                    </el-radio-group>
                                </header>
                                <div class="department-chart-card">
                                    <div class="department-chart-list">
                                        <div class="department-chart-row" v-for="(row, index) in departmentChartRows" :key="row.name">
                                            <div class="department-chart-name">
                                                <span class="department-chart-rank">{{ index + 1 }}</span>
                                                <span class="department-chart-label" :title="row.name">{{ row.name }}</span>
                                            </div>
                                            <div class="department-bar-track">
                                                <span class="department-bar-fill" :style="{ width: departmentBarWidth(row.value) }"></span>
                                            </div>
                                            <div class="department-chart-value">{{ formatNumber(row.value) }} {{ departmentMetricUnit }}</div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
            </main>

<el-dialog
                v-model="briefingHelpVisible"
                :title="`${briefingTitle}欄位說明`"
                width="640px"
            >
                <div class="field-help-list">
                    <div class="field-help-item" v-for="item in briefingHelpFields" :key="item.name">
                        <div class="field-help-name">{{ item.name }}</div>
                        <div class="field-help-desc">{{ item.desc }}</div>
                    </div>
                </div>
            </el-dialog>
</template>

<script>
import { nextTick } from "vue";
import * as echarts from "echarts";
import { getThemeColor, getThemeColorRgb } from "@/config/theme";

export default {
            data() {
                return {
                    selectedCompany: 1,
                    employeeSort: "times",
                    overallMode: "month",
                    vehicleSort: "times",
                    departmentMetric: "duration",
                    departmentMode: "month",
                    briefingHelpVisible: false,
                    companyTreeList: [
                        {
                            value: 1,
                            label: "RIMO 總公司",
                            children: [
                                { value: 11, label: "台北分公司" },
                                { value: 12, label: "台中分公司" },
                                { value: 13, label: "板橋分公司" },
                                { value: 14, label: "永和分公司" },
                                { value: 15, label: "新店分公司" },
                                { value: 16, label: "土城分公司" }
                            ]
                        }
                    ],
                    topMetrics: {
                        employeeTotal: 0,
                        availableEmployees: 0,
                        availableEmployeeRate: 0,
                        vehicleTotal: 2,
                        availableVehicles: 2,
                        availableVehicleRate: 100,
                        totalUsageTimes: 1,
                        monthAvgUsageRate: "0.0",
                        monthAvgUsageRateTrend: "0.0%",
                        monthAvgUsageRateTrendType: "is-flat",
                        monthUsageTimes: 0,
                        monthUsageTrend: "-100%",
                        monthUsageTrendType: "is-down"
                    },
                    branchBriefRows: [
                        { id: "B01", name: "台北分公司", available: 38, total: 45, availableRate: 84, completed: 82, duration: 1352, durationRate: 100, usageRate: 85, compare: 12.6, pending: 12, avgDuration: "16.5 hr" },
                        { id: "B02", name: "台中分公司", available: 22, total: 28, availableRate: 79, completed: 64, duration: 1127, durationRate: 83, usageRate: 78, compare: 8.9, pending: 9, avgDuration: "17.6 hr" },
                        { id: "B03", name: "板橋分公司", available: 20, total: 26, availableRate: 77, completed: 54, duration: 1008, durationRate: 75, usageRate: 76, compare: 6.7, pending: 7, avgDuration: "18.7 hr" },
                        { id: "B04", name: "永和分公司", available: 18, total: 24, availableRate: 75, completed: 46, duration: 754, durationRate: 56, usageRate: 72, compare: 5.1, pending: 6, avgDuration: "16.4 hr" },
                        { id: "B05", name: "新店分公司", available: 15, total: 20, availableRate: 75, completed: 28, duration: 598, durationRate: 44, usageRate: 65, compare: 2.3, pending: 5, avgDuration: "21.4 hr" },
                        { id: "B06", name: "土城分公司", available: 13, total: 19, availableRate: 68, completed: 12, duration: 385, durationRate: 28, usageRate: 58, compare: -1.2, pending: 3, avgDuration: "32.1 hr" }
                    ],
                    vehicleBriefMap: {
                        11: [
                            { id: "V1101", name: "BXR-8899", subName: "Lexus ES 250 2023款", statusText: "可用", statusType: "available", completed: 18, duration: 286, durationRate: 100, usageRate: 82, compare: 10.8, pending: 3, avgDuration: "15.9 hr" },
                            { id: "V1102", name: "KLA-2108", subName: "Toyota Alphard 2023款", statusText: "使用中", statusType: "in-use", completed: 16, duration: 244, durationRate: 85, usageRate: 79, compare: 6.4, pending: 2, avgDuration: "15.3 hr" },
                            { id: "V1103", name: "TFD-5326", subName: "Toyota Camry 2022款", statusText: "可用", statusType: "available", completed: 14, duration: 218, durationRate: 76, usageRate: 74, compare: 4.2, pending: 2, avgDuration: "15.6 hr" },
                            { id: "V1104", name: "APL-6621", subName: "Mercedes-Benz E300 2024款", statusText: "可用", statusType: "available", completed: 12, duration: 198, durationRate: 69, usageRate: 68, compare: 1.5, pending: 2, avgDuration: "16.5 hr" },
                            { id: "V1105", name: "RCM-7358", subName: "Skoda Superb 2021款", statusText: "管控中", statusType: "controlled", completed: 9, duration: 151, durationRate: 53, usageRate: 55, compare: -2.1, pending: 1, avgDuration: "16.8 hr" }
                        ],
                        12: [
                            { id: "V1201", name: "TCB-7186", subName: "Toyota Corolla Cross 2023款", statusText: "可用", statusType: "available", completed: 15, duration: 263, durationRate: 100, usageRate: 78, compare: 8.1, pending: 2, avgDuration: "17.5 hr" },
                            { id: "V1202", name: "KDF-3205", subName: "Honda CR-V 2022款", statusText: "使用中", statusType: "in-use", completed: 14, duration: 241, durationRate: 92, usageRate: 75, compare: 5.2, pending: 2, avgDuration: "17.2 hr" },
                            { id: "V1203", name: "RGE-6620", subName: "Toyota Altis 2021款", statusText: "可用", statusType: "available", completed: 11, duration: 186, durationRate: 71, usageRate: 66, compare: 1.7, pending: 1, avgDuration: "16.9 hr" }
                        ],
                        13: [
                            { id: "V1301", name: "BQA-5092", subName: "Nissan X-Trail 2023款", statusText: "可用", statusType: "available", completed: 13, duration: 247, durationRate: 100, usageRate: 76, compare: 6.7, pending: 2, avgDuration: "19.0 hr" },
                            { id: "V1302", name: "MDE-8177", subName: "Toyota Camry 2021款", statusText: "可用", statusType: "available", completed: 12, duration: 222, durationRate: 90, usageRate: 72, compare: 3.9, pending: 1, avgDuration: "18.5 hr" },
                            { id: "V1303", name: "VHL-2606", subName: "Lexus NX 2022款", statusText: "使用中", statusType: "in-use", completed: 10, duration: 190, durationRate: 77, usageRate: 68, compare: 2.2, pending: 1, avgDuration: "19.0 hr" }
                        ],
                        14: [
                            { id: "V1401", name: "YHA-6318", subName: "Toyota RAV4 2022款", statusText: "可用", statusType: "available", completed: 12, duration: 197, durationRate: 100, usageRate: 72, compare: 5.1, pending: 2, avgDuration: "16.4 hr" },
                            { id: "V1402", name: "NQX-5520", subName: "Mazda CX-5 2021款", statusText: "可用", statusType: "available", completed: 10, duration: 164, durationRate: 83, usageRate: 66, compare: 1.8, pending: 1, avgDuration: "16.4 hr" }
                        ],
                        15: [
                            { id: "V1501", name: "AKB-9812", subName: "Hyundai Tucson 2023款", statusText: "使用中", statusType: "in-use", completed: 8, duration: 178, durationRate: 100, usageRate: 65, compare: 2.3, pending: 1, avgDuration: "22.3 hr" },
                            { id: "V1502", name: "QRF-3009", subName: "Toyota Sienta 2022款", statusText: "可用", statusType: "available", completed: 7, duration: 143, durationRate: 80, usageRate: 60, compare: 0.8, pending: 1, avgDuration: "20.4 hr" }
                        ],
                        16: [
                            { id: "V1601", name: "TBE-7710", subName: "Toyota Camry 2020款", statusText: "可用", statusType: "available", completed: 7, duration: 232, durationRate: 100, usageRate: 58, compare: -1.2, pending: 2, avgDuration: "33.1 hr" },
                            { id: "V1602", name: "WMD-4589", subName: "Nissan Sentra 2021款", statusText: "管控中", statusType: "controlled", completed: 5, duration: 153, durationRate: 66, usageRate: 48, compare: -3.6, pending: 1, avgDuration: "30.6 hr" }
                        ]
                    },
                    employeeSource: [
                        { id: "E01", name: "王怡君", department: "行政管理部", times: 26, durationSeconds: 15 * 3600 + 20 * 60 },
                        { id: "E02", name: "陳建宏", department: "業務部", times: 22, durationSeconds: 18 * 3600 + 45 * 60 },
                        { id: "E03", name: "林雅婷", department: "財務部", times: 18, durationSeconds: 12 * 3600 + 10 * 60 },
                        { id: "E04", name: "張志明", department: "工務部", times: 16, durationSeconds: 21 * 3600 + 30 * 60 },
                        { id: "E05", name: "黃柏翰", department: "資訊部", times: 13, durationSeconds: 9 * 3600 + 40 * 60 }
                    ],
                    departmentStats: {
                        total: [
                            { name: "台北分公司 - 業務部", durationMonth: 135, durationYear: 1420, timesMonth: 28, timesYear: 328 },
                            { name: "台中分公司 - 財務部", durationMonth: 118, durationYear: 1280, timesMonth: 24, timesYear: 286 },
                            { name: "板橋分公司 - 業務部", durationMonth: 105, durationYear: 1168, timesMonth: 21, timesYear: 251 },
                            { name: "永和分公司 - 行政部", durationMonth: 94, durationYear: 1046, timesMonth: 18, timesYear: 214 },
                            { name: "新店分公司 - 業務部", durationMonth: 76, durationYear: 912, timesMonth: 15, timesYear: 188 },
                            { name: "土城分公司 - 財務部", durationMonth: 58, durationYear: 780, timesMonth: 12, timesYear: 142 },
                            { name: "台北分公司 - 行政部", durationMonth: 52, durationYear: 642, timesMonth: 11, timesYear: 126 },
                            { name: "台中分公司 - 業務部", durationMonth: 47, durationYear: 588, timesMonth: 10, timesYear: 118 },
                            { name: "板橋分公司 - 工務部", durationMonth: 42, durationYear: 510, timesMonth: 9, timesYear: 104 },
                            { name: "永和分公司 - 財務部", durationMonth: 36, durationYear: 468, timesMonth: 8, timesYear: 92 },
                            { name: "新店分公司 - 行政部", durationMonth: 31, durationYear: 392, timesMonth: 7, timesYear: 84 },
                            { name: "土城分公司 - 工務部", durationMonth: 26, durationYear: 336, timesMonth: 6, timesYear: 72 }
                        ],
                        11: [
                            { name: "業務部", durationMonth: 135, durationYear: 1420, timesMonth: 28, timesYear: 328 },
                            { name: "財務部", durationMonth: 84, durationYear: 942, timesMonth: 16, timesYear: 188 },
                            { name: "工務部", durationMonth: 45, durationYear: 486, timesMonth: 9, timesYear: 96 }
                        ],
                        12: [
                            { name: "業務部", durationMonth: 118, durationYear: 1280, timesMonth: 24, timesYear: 286 },
                            { name: "財務部", durationMonth: 76, durationYear: 876, timesMonth: 15, timesYear: 172 },
                            { name: "工務部", durationMonth: 52, durationYear: 512, timesMonth: 10, timesYear: 108 }
                        ],
                        13: [
                            { name: "業務部", durationMonth: 105, durationYear: 1168, timesMonth: 21, timesYear: 251 },
                            { name: "財務部", durationMonth: 64, durationYear: 742, timesMonth: 13, timesYear: 146 },
                            { name: "工務部", durationMonth: 38, durationYear: 438, timesMonth: 8, timesYear: 88 }
                        ],
                        14: [
                            { name: "業務部", durationMonth: 94, durationYear: 1046, timesMonth: 18, timesYear: 214 },
                            { name: "財務部", durationMonth: 59, durationYear: 668, timesMonth: 12, timesYear: 128 },
                            { name: "工務部", durationMonth: 34, durationYear: 396, timesMonth: 7, timesYear: 76 }
                        ],
                        15: [
                            { name: "業務部", durationMonth: 76, durationYear: 912, timesMonth: 15, timesYear: 188 },
                            { name: "財務部", durationMonth: 49, durationYear: 586, timesMonth: 10, timesYear: 112 },
                            { name: "工務部", durationMonth: 28, durationYear: 328, timesMonth: 6, timesYear: 64 }
                        ],
                        16: [
                            { name: "業務部", durationMonth: 132, durationYear: 1365, timesMonth: 26, timesYear: 308 },
                            { name: "財務部", durationMonth: 58, durationYear: 780, timesMonth: 12, timesYear: 142 },
                            { name: "工務部", durationMonth: 22, durationYear: 276, timesMonth: 5, timesYear: 52 }
                        ]
                    },
                    vehicleSource: [
                        { plate: "XLY-8008", station: "八輪測試-寶龍用車點", times: 1, durationSeconds: 36 },
                        { plate: "XLY-8001", station: "八輪測試-寶龍用車點", times: 0, durationSeconds: 0 },
                        { plate: "XLY-8004", station: "八輪測試-寶龍用車點", times: 0, durationSeconds: 0 },
                        { plate: "XLY-8007", station: "八輪測試-人工智能用車點", times: 0, durationSeconds: 0 },
                        { plate: "XLY-8003", station: "八輪測試-寶龍用車點", times: 0, durationSeconds: 0 },
                        { plate: "XLY-8010", station: "八輪測試-啟迪用車點", times: 0, durationSeconds: 0 },
                        { plate: "XLY-8006", station: "八輪測試-人工智能用車點", times: 0, durationSeconds: 0 }
                    ],
                    overallChart: null
                };
            },
            computed: {
                isHeadquartersScope() {
                    return this.selectedCompany === 1;
                },
                currentScopeLabel() {
                    return this.findCompanyLabel(this.companyTreeList, this.selectedCompany) || "RIMO 總公司";
                },
                briefingTitle() {
                    return this.isHeadquartersScope
                        ? "各分公司使用狀況總覽"
                        : `${this.currentScopeLabel}車輛使用狀況總覽`;
                },
                briefingNameLabel() {
                    return this.isHeadquartersScope ? "分公司" : "車輛";
                },
                briefingStatusLabel() {
                    return this.isHeadquartersScope ? "可用車輛 / 總車輛" : "車輛狀態";
                },
                briefingHelpFields() {
                    return [
                        {
                            name: this.briefingNameLabel,
                            desc: this.isHeadquartersScope
                                ? "總公司視角顯示各分公司名稱，用於比較不同分公司的公務車使用狀況。"
                                : "分公司視角顯示本分公司可查看的公務車車牌與車型。"
                        },
                        {
                            name: this.briefingStatusLabel,
                            desc: this.isHeadquartersScope
                                ? "顯示目前可用公務車數量 / 分公司公務車總數，進度條代表可用率。"
                                : "顯示車輛目前狀態，例如可用、使用中或管控中。"
                        },
                        {
                            name: "本月已完成",
                            desc: "本月已完成的公務車用車訂單數量，不包含取消、未開始、使用中或仍待完成的訂單。"
                        },
                        {
                            name: "本月用車時長 (hr)",
                            desc: "本月已完成訂單累計用車時長，單位為小時，用於觀察實際占用車輛資源的總量。"
                        },
                        {
                            name: "使用率",
                            desc: "本月車輛使用強度指標，用於快速判斷分公司或車輛的使用活躍程度；正式開發時需以後端統一公式計算。"
                        },
                        {
                            name: "較上月",
                            desc: "本月使用率與上月相比的變化幅度，正數代表提高，負數代表下降。"
                        },
                        {
                            name: "未完成訂單",
                            desc: "目前尚未完成的訂單數量，包含已預約尚未完成取還車流程的訂單，以及正在用車中的訂單。"
                        },
                        {
                            name: "平均每次時長",
                            desc: "本月已完成訂單的平均用車時長，計算方式為本月用車時長除以本月已完成次數。"
                        }
                    ];
                },
                briefingRows() {
                    if (this.isHeadquartersScope) return this.branchBriefRows;
                    return this.vehicleBriefMap[this.selectedCompany] || this.vehicleBriefMap[11] || [];
                },
                briefingTotal() {
                    const rows = this.briefingRows;
                    const completed = rows.reduce((sum, row) => sum + row.completed, 0);
                    const duration = rows.reduce((sum, row) => sum + row.duration, 0);
                    const pending = rows.reduce((sum, row) => sum + row.pending, 0);
                    const available = this.isHeadquartersScope
                        ? rows.reduce((sum, row) => sum + row.available, 0)
                        : rows.filter((row) => row.statusType === "available").length;
                    const total = this.isHeadquartersScope
                        ? rows.reduce((sum, row) => sum + row.total, 0)
                        : rows.length;
                    const usageRate = rows.length
                        ? Math.round(rows.reduce((sum, row) => sum + row.usageRate, 0) / rows.length)
                        : 0;
                    const compare = rows.length
                        ? Number((rows.reduce((sum, row) => sum + row.compare, 0) / rows.length).toFixed(1))
                        : 0;
                    const avgDuration = completed ? `${(duration / completed).toFixed(1)} hr` : "0 hr";
                    return {
                        status: `${available} / ${total}`,
                        completed,
                        duration,
                        usageRate,
                        compare,
                        pending,
                        avgDuration
                    };
                },
                employeeRows() {
                    const rows = [...this.employeeSource].sort((a, b) => {
                        return this.employeeSort === "times"
                            ? b.times - a.times
                            : b.durationSeconds - a.durationSeconds;
                    });
                    return rows.map((item) => ({
                        ...item,
                        duration: this.formatSeconds(item.durationSeconds)
                    }));
                },
                vehicleRows() {
                    const rows = [...this.vehicleSource].sort((a, b) => {
                        return this.vehicleSort === "times"
                            ? b.times - a.times
                            : b.durationSeconds - a.durationSeconds;
                    });
                    return rows.map((item) => ({
                        ...item,
                        duration: this.formatSeconds(item.durationSeconds)
                    }));
                },
                departmentMetricLabel() {
                    return this.departmentMetric === "duration" ? "用車時間" : "用車次數";
                },
                departmentMetricUnit() {
                    return this.departmentMetric === "duration" ? "hr" : "次";
                },
                departmentChartScopeText() {
                    return this.isHeadquartersScope ? "總公司 / 分公司部門" : `${this.currentScopeLabel} / 部門`;
                },
                departmentChartTitle() {
                    const period = this.departmentMode === "month" ? "本月" : "今年";
                    return `${period}${this.departmentMetricLabel}排行`;
                },
                departmentChartRows() {
                    const source = this.departmentStats[this.isHeadquartersScope ? "total" : this.selectedCompany]
                        || this.departmentStats[11]
                        || [];
                    const key = `${this.departmentMetric}${this.departmentMode === "month" ? "Month" : "Year"}`;
                    return source
                        .map((item) => ({
                            name: item.name,
                            value: item[key] || 0
                        }))
                        .sort((a, b) => b.value - a.value);
                },
                departmentMaxValue() {
                    return Math.max(...this.departmentChartRows.map((item) => item.value), 1);
                }
            },
            watch: {
                overallMode() {
                    this.renderOverallChart();
                }
            },
            mounted() {
                nextTick(() => {
                    this.overallChart = echarts.init(this.$refs.overallChartRef);
                    this.renderOverallChart();
                    window.addEventListener("resize", this.handleResize);
                });
            },
            beforeUnmount() {
                window.removeEventListener("resize", this.handleResize);
                if (this.overallChart) this.overallChart.dispose();
            },
            methods: {
                findCompanyLabel(nodes, value) {
                    for (const node of nodes) {
                        if (node.value === value) return node.label;
                        if (node.children) {
                            const childLabel = this.findCompanyLabel(node.children, value);
                            if (childLabel) return childLabel;
                        }
                    }
                    return "";
                },
                formatNumber(value) {
                    return Number(value || 0).toLocaleString();
                },
                formatCompare(value) {
                    const numericValue = Number(value || 0);
                    if (numericValue === 0) return "0%";
                    return `${Math.abs(numericValue).toFixed(1)}%`;
                },
                getBriefingTrendClass(value) {
                    const numericValue = Number(value || 0);
                    if (numericValue > 0) return "is-up";
                    if (numericValue < 0) return "is-down";
                    return "is-flat";
                },
                departmentBarWidth(value) {
                    const percent = Math.round((Number(value || 0) / this.departmentMaxValue) * 100);
                    return `${Math.max(percent, 6)}%`;
                },
                handleResize() {
                    if (this.overallChart) this.overallChart.resize();
                },
                formatSeconds(totalSeconds) {
                    if (!totalSeconds) return "0m";
                    const h = Math.floor(totalSeconds / 3600);
                    const m = Math.floor((totalSeconds % 3600) / 60);
                    if (h > 0) return `${h}h ${m}m`;
                    return `${m}m`;
                },
                renderOverallChart() {
                    if (!this.overallChart) return;
                    const source = this.overallMode === "month"
                        ? {
                            x: ["1", "5", "10", "15", "20", "25", "30"],
                            currentName: "本月",
                            previousName: "上月",
                            current: [0, 0, 0, 0, 0, 0, 0],
                            previous: [0, 0, 0, 0, 0, 0, 0]
                        }
                        : {
                            x: ["1月", "2月", "3月", "4月", "5月", "6月"],
                            currentName: "今年",
                            previousName: "去年",
                            current: [0, 0.1, 0.2, 0.15, 0.25, 0.3],
                            previous: [0, 0, 0.05, 0.08, 0.1, 0.12]
                        };

                    this.overallChart.setOption({
                        color: ["#0f9b8e", "#4f7cff"],
                        tooltip: {
                            trigger: "axis",
                            backgroundColor: "rgba(255,255,255,0.98)",
                            borderColor: "#d7dde6",
                            borderWidth: 1,
                            textStyle: { color: "#1f2937" },
                            extraCssText: "box-shadow: 0 8px 24px rgba(15,23,42,0.1); border-radius: 8px;",
                            axisPointer: {
                                type: "line",
                                lineStyle: {
                                    color: "#cfd8e3",
                                    type: "dashed"
                                }
                            }
                        },
                        legend: {
                            data: [source.currentName, source.previousName],
                            type: "scroll",
                            right: 0,
                            top: 0,
                            itemGap: 14,
                            itemWidth: 10,
                            itemHeight: 10,
                            textStyle: {
                                color: "#6b7280",
                                fontSize: 12
                            }
                        },
                        grid: {
                            left: 10,
                            right: 10,
                            top: 38,
                            bottom: 10,
                            containLabel: true
                        },
                        xAxis: [
                            {
                                type: "category",
                                boundaryGap: false,
                                data: source.x,
                                axisLine: { lineStyle: { color: "#d9dee7" } },
                                axisTick: { show: false },
                                axisLabel: { color: "#6b7280", fontSize: 11 }
                            }
                        ],
                        yAxis: [
                            {
                                type: "value",
                                axisLine: { show: false },
                                axisTick: { show: false },
                                splitLine: { lineStyle: { color: "#edf1f5", type: "dashed" } },
                                axisLabel: {
                                    color: "#6b7280",
                                    fontSize: 11,
                                    formatter: "{value}%"
                                }
                            }
                        ],
                        series: [
                            {
                                name: source.currentName,
                                smooth: true,
                                type: "line",
                                showSymbol: false,
                                lineStyle: { width: 2 },
                                areaStyle: {
                                    opacity: 0.08,
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: "rgba(15, 155, 142, 0.18)" },
                                        { offset: 1, color: "rgba(15, 155, 142, 0.02)" }
                                    ])
                                },
                                data: source.current
                            },
                            {
                                name: source.previousName,
                                smooth: true,
                                type: "line",
                                showSymbol: false,
                                lineStyle: { width: 2 },
                                areaStyle: {
                                    opacity: 0.06,
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: "rgba(79, 124, 255, 0.16)" },
                                        { offset: 1, color: "rgba(79, 124, 255, 0.02)" }
                                    ])
                                },
                                data: source.previous
                            }
                        ]
                    });
                },
                renderDepartmentChart() {
                    if (!this.departmentChart) return;
                    const sourceMap = {
                        duration: {
                            month: {
                                total: [
                                    { name: "台北分公司 - 工務部", value: 136 },
                                    { name: "台中分公司 - 財務部", value: 118 },
                                    { name: "板橋分公司 - 業務部", value: 105 },
                                    { name: "永和分公司 - 行政部", value: 94 },
                                    { name: "新店分公司 - 業務部", value: 76 },
                                    { name: "土城分公司 - 財務部", value: 58 }
                                ],
                                11: [
                                    { name: "工務部", value: 45 },
                                    { name: "財務部", value: 84 },
                                    { name: "業務部", value: 135 }
                                ],
                                12: [
                                    { name: "工務部", value: 52 },
                                    { name: "財務部", value: 76 },
                                    { name: "業務部", value: 118 }
                                ],
                                13: [
                                    { name: "工務部", value: 38 },
                                    { name: "財務部", value: 64 },
                                    { name: "業務部", value: 105 }
                                ],
                                14: [
                                    { name: "工務部", value: 34 },
                                    { name: "財務部", value: 59 },
                                    { name: "業務部", value: 94 }
                                ],
                                15: [
                                    { name: "工務部", value: 28 },
                                    { name: "財務部", value: 49 },
                                    { name: "業務部", value: 76 }
                                ],
                                16: [
                                    { name: "工務部", value: 22 },
                                    { name: "財務部", value: 58 },
                                    { name: "業務部", value: 132 }
                                ]
                            },
                            year: {
                                total: [
                                    { name: "台北分公司 - 工務部", value: 1420 },
                                    { name: "台中分公司 - 財務部", value: 1280 },
                                    { name: "板橋分公司 - 業務部", value: 1168 },
                                    { name: "永和分公司 - 行政部", value: 1046 },
                                    { name: "新店分公司 - 業務部", value: 912 },
                                    { name: "土城分公司 - 財務部", value: 780 }
                                ],
                                11: [
                                    { name: "工務部", value: 486 },
                                    { name: "財務部", value: 942 },
                                    { name: "業務部", value: 1420 }
                                ],
                                12: [
                                    { name: "工務部", value: 512 },
                                    { name: "財務部", value: 876 },
                                    { name: "業務部", value: 1280 }
                                ],
                                13: [
                                    { name: "工務部", value: 438 },
                                    { name: "財務部", value: 742 },
                                    { name: "業務部", value: 1168 }
                                ],
                                14: [
                                    { name: "工務部", value: 396 },
                                    { name: "財務部", value: 668 },
                                    { name: "業務部", value: 1046 }
                                ],
                                15: [
                                    { name: "工務部", value: 328 },
                                    { name: "財務部", value: 586 },
                                    { name: "業務部", value: 912 }
                                ],
                                16: [
                                    { name: "工務部", value: 276 },
                                    { name: "財務部", value: 780 },
                                    { name: "業務部", value: 1365 }
                                ]
                            }
                        },
                        times: {
                            month: {
                                total: [
                                    { name: "台北分公司 - 工務部", value: 28 },
                                    { name: "台中分公司 - 財務部", value: 24 },
                                    { name: "板橋分公司 - 業務部", value: 21 },
                                    { name: "永和分公司 - 行政部", value: 18 },
                                    { name: "新店分公司 - 業務部", value: 15 },
                                    { name: "土城分公司 - 財務部", value: 12 }
                                ],
                                11: [
                                    { name: "工務部", value: 9 },
                                    { name: "財務部", value: 16 },
                                    { name: "業務部", value: 28 }
                                ],
                                12: [
                                    { name: "工務部", value: 10 },
                                    { name: "財務部", value: 15 },
                                    { name: "業務部", value: 24 }
                                ],
                                13: [
                                    { name: "工務部", value: 8 },
                                    { name: "財務部", value: 13 },
                                    { name: "業務部", value: 21 }
                                ],
                                14: [
                                    { name: "工務部", value: 7 },
                                    { name: "財務部", value: 12 },
                                    { name: "業務部", value: 18 }
                                ],
                                15: [
                                    { name: "工務部", value: 6 },
                                    { name: "財務部", value: 10 },
                                    { name: "業務部", value: 15 }
                                ],
                                16: [
                                    { name: "工務部", value: 5 },
                                    { name: "財務部", value: 12 },
                                    { name: "業務部", value: 26 }
                                ]
                            },
                            year: {
                                total: [
                                    { name: "台北分公司 - 工務部", value: 328 },
                                    { name: "台中分公司 - 財務部", value: 286 },
                                    { name: "板橋分公司 - 業務部", value: 251 },
                                    { name: "永和分公司 - 行政部", value: 214 },
                                    { name: "新店分公司 - 業務部", value: 188 },
                                    { name: "土城分公司 - 財務部", value: 142 }
                                ],
                                11: [
                                    { name: "工務部", value: 96 },
                                    { name: "財務部", value: 188 },
                                    { name: "業務部", value: 328 }
                                ],
                                12: [
                                    { name: "工務部", value: 108 },
                                    { name: "財務部", value: 172 },
                                    { name: "業務部", value: 286 }
                                ],
                                13: [
                                    { name: "工務部", value: 88 },
                                    { name: "財務部", value: 146 },
                                    { name: "業務部", value: 251 }
                                ],
                                14: [
                                    { name: "工務部", value: 76 },
                                    { name: "財務部", value: 128 },
                                    { name: "業務部", value: 214 }
                                ],
                                15: [
                                    { name: "工務部", value: 64 },
                                    { name: "財務部", value: 112 },
                                    { name: "業務部", value: 188 }
                                ],
                                16: [
                                    { name: "工務部", value: 52 },
                                    { name: "財務部", value: 142 },
                                    { name: "業務部", value: 308 }
                                ]
                            }
                        }
                    };
                    const metricLabel = this.departmentMetric === "duration" ? "用車時間" : "用車次數";
                    const suffix = this.departmentMetric === "duration" ? "hr" : "次";
                    const scopeKey = this.isHeadquartersScope ? "total" : this.selectedCompany;
                    const source = [
                        ...(sourceMap[this.departmentMetric][this.departmentMode][scopeKey]
                            || sourceMap[this.departmentMetric][this.departmentMode][11])
                    ].sort((a, b) => a.value - b.value);
                    const categories = source.map((item) => item.name);
                    const values = source.map((item) => item.value);
                    const maxValue = Math.max(...values, 0);
                    const axisMax = maxValue <= 0 ? 10 : Math.ceil(maxValue * 1.15 / 10) * 10;

                    this.departmentChart.setOption({
                        color: [getThemeColor()],
                        title: { show: false },
                        tooltip: {
                            trigger: "axis",
                            backgroundColor: "rgba(255,255,255,0.98)",
                            borderColor: "#d7dde6",
                            borderWidth: 1,
                            textStyle: { color: "#1f2937" },
                            extraCssText: "box-shadow: 0 8px 24px rgba(15,23,42,0.1); border-radius: 8px;",
                            axisPointer: {
                                type: "shadow",
                                shadowStyle: { color: getThemeColorRgb(0.06) }
                            },
                            formatter(params) {
                                const item = params && params[0];
                                if (!item) return "";
                                return `${item.name}<br/>${item.marker}${metricLabel}: ${item.value}${suffix}`;
                            }
                        },
                        legend: {
                            show: false
                        },
                        grid: {
                            left: this.isHeadquartersScope ? 128 : 70,
                            right: 58,
                            top: 26,
                            bottom: 28,
                            containLabel: true
                        },
                        xAxis: {
                            type: "value",
                            min: 0,
                            max: axisMax,
                            splitNumber: 6,
                            axisLine: { show: false },
                            axisTick: { show: false },
                            axisLabel: {
                                show: true,
                                fontSize: 12,
                                color: "#94a3b8",
                                formatter(value) {
                                    return value;
                                }
                            },
                            splitLine: {
                                show: true,
                                lineStyle: { color: "#edf2f7", type: "solid" }
                            }
                        },
                        yAxis: {
                            type: "category",
                            data: categories,
                            inverse: true,
                            axisTick: { show: false },
                            axisLine: { show: false },
                            axisLabel: {
                                show: true,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "#475569",
                                margin: 14,
                                width: this.isHeadquartersScope ? 112 : 58,
                                overflow: "truncate"
                            }
                        },
                        series: [
                            {
                                name: metricLabel,
                                data: values,
                                type: "bar",
                                barWidth: 20,
                                showBackground: true,
                                backgroundStyle: {
                                    color: "#f1f5f9",
                                    borderRadius: [0, 999, 999, 0]
                                },
                                label: {
                                    show: true,
                                    position: "right",
                                    formatter: `{c}${suffix}`,
                                    color: "#64748b",
                                    fontSize: 12,
                                    fontWeight: 600
                                },
                                itemStyle: {
                                    borderRadius: [0, 999, 999, 0],
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                        { offset: 0, color: getThemeColor() },
                                        { offset: 1, color: "#38A9C8" }
                                    ])
                                },
                                emphasis: {
                                    itemStyle: {
                                        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                            { offset: 0, color: "#00567f" },
                                            { offset: 1, color: "#2497b8" }
                                        ])
                                    }
                                },
                                animationDuration: 500
                            }
                        ]
                    }, true);
                }
            }
        };
</script>

<style scoped>
        .dashboard-page {
            min-height: 100%;
            padding-top: 0;
        }

        .dashboard-toolbar {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 14px;
            padding: 0;
        }

        .toolbar-filter-shell {
            width: min(320px, 100%);
        }

        .toolbar-filter {
            width: 100%;
        }

        .toolbar-filter-caption {
            margin-bottom: 6px;
            font-size: 14px;
            font-weight: 600;
            color: #475569;
        }

        .toolbar-filter .el-tree-select {
            width: 100%;
        }

        .toolbar-filter .el-select {
            width: 100%;
        }

        .toolbar-filter :deep(.el-input__wrapper) {
            min-height: 42px;
            background: #fff;
            border: 1px solid #d9dee7;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgb(15 23 42 / 4%);
            transition: border-color .18s ease, box-shadow .18s ease, background-color .18s ease;
        }

        .toolbar-filter :deep(.el-select__wrapper) {
            min-height: 42px;
            background: #fff;
            border-radius: 10px;
            box-shadow: inset 0 0 0 1px #d9dee7, 0 2px 8px rgb(15 23 42 / 4%);
            transition: box-shadow .18s ease, background-color .18s ease;
        }

        .toolbar-filter :deep(.el-input__wrapper:hover) {
            border-color: #c5d0dc;
        }

        .toolbar-filter :deep(.el-select__wrapper:hover) {
            box-shadow: inset 0 0 0 1px #c5d0dc, 0 2px 8px rgb(15 23 42 / 4%);
        }

        .toolbar-filter :deep(.el-input__wrapper.is-focus) {
            border-color: var(--app-color-primary);
            box-shadow: 0 0 0 3px rgb(var(--app-color-primary-rgb) / 8%);
        }

        .toolbar-filter :deep(.el-select__wrapper.is-focused) {
            box-shadow: inset 0 0 0 1px var(--app-color-primary), 0 0 0 3px rgb(var(--app-color-primary-rgb) / 8%), 0 2px 8px rgb(15 23 42 / 4%);
        }

        .toolbar-filter :deep(.el-input__inner) {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
        }

        .toolbar-filter :deep(.el-select__selected-item),
        .toolbar-filter :deep(.el-select__placeholder) {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
        }

        .metrics-panel {
            margin-bottom: 12px;
            padding: 0;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
        }

        .metrics-card {
            position: relative;
            display: flex;
            align-items: center;
            gap: 10px;
            min-height: 82px;
            padding: 12px 16px;
            background: #fff;
            border: 1px solid #e3e8ef;
            border-top: 3px solid transparent;
            border-radius: 10px;
            box-shadow: 0 6px 18px rgb(15 23 42 / 4%);
        }


        .metrics-help {
            position: absolute;
            top: 8px;
            right: 9px;
            z-index: 1;
            font-size: 13px;
            color: #a8b1bf;
            cursor: help;
            transition: color 0.15s ease;
        }

        :global(.el-popper.metrics-help-popper) {
            width: 260px;
            max-width: calc(100vw - 32px);
            line-height: 1.6;
            white-space: normal;
            word-break: break-word;
        }
        .metrics-help:hover {
            color: #64748b;
        }
        .metrics-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 42px;
            height: 42px;
            border-radius: 10px;
        }

        .metrics-icon-coral {
            background: rgb(255 99 99 / 7%);
        }

        .metrics-card:nth-child(1) {
            border-top-color: #ef6c63;
        }

        .metrics-icon-blue {
            background: rgb(101 134 255 / 8%);
        }

        .metrics-card:nth-child(2) {
            border-top-color: #4b74e0;
        }

        .metrics-icon-cyan {
            background: rgb(87 189 243 / 8%);
        }

        .metrics-card:nth-child(3) {
            border-top-color: #32a8d8;
        }

        .metrics-icon-rose {
            background: rgb(255 112 142 / 8%);
        }

        .metrics-card:nth-child(4) {
            border-top-color: #f06a85;
        }

        .metrics-icon-green {
            background: rgb(86 214 88 / 8%);
        }

        .metrics-card:nth-child(5) {
            border-top-color: #45b36b;
        }

        .metrics-card-icon {
            font-size: 24px;
            color: var(--app-color-primary);
        }

        .metrics-icon-coral .metrics-card-icon {
            color: #ef6c63;
        }

        .metrics-icon-blue .metrics-card-icon {
            color: #4b74e0;
        }

        .metrics-icon-cyan .metrics-card-icon {
            color: #32a8d8;
        }

        .metrics-icon-rose .metrics-card-icon {
            color: #f06a85;
        }

        .metrics-icon-green .metrics-card-icon {
            color: #45b36b;
        }

        .metrics-copy {
            min-width: 0;
            flex: 1;
        }

        .metrics-value {
            margin-bottom: 4px;
            font-size: 24px;
            font-weight: 700;
            line-height: 1.1;
            color: #1f2937;
        }

        .metrics-unit {
            margin-left: 2px;
            font-size: 14px;
            font-weight: 600;
        }

        .metrics-label {
            font-size: 13px;
            line-height: 1.5;
            color: #6b7280;
        }

        .metrics-sub {
            margin-top: 5px;
            font-size: 12px;
            line-height: 1.4;
            color: #64748b;
            white-space: nowrap;
        }

        .metrics-sub strong {
            margin-left: 4px;
            color: #1f2937;
            font-size: 13px;
        }

        .metrics-trend {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-top: 5px;
            padding: 2px 7px;
            border-radius: 999px;
            font-size: 13px;
            line-height: 1.35;
            background: #f8fafc;
            color: #64748b;
            white-space: nowrap;
        }

        .metrics-trend.is-up {
            background: #ecfdf3;
            color: #15803d;
        }

        .metrics-trend.is-down {
            background: #fff1f2;
            color: #be123c;
        }

        .metrics-trend.is-flat {
            background: #f1f5f9;
            color: #475569;
        }

        .metrics-progress {
            position: relative;
            width: 100%;
            height: 5px;
            margin-top: 8px;
            overflow: hidden;
            border-radius: 999px;
            background: #edf2f7;
        }

        .metrics-progress span {
            display: block;
            height: 100%;
            border-radius: inherit;
            background: linear-gradient(90deg, var(--app-color-primary), #35B6D6);
        }

        .metrics-trend-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 5px;
        }

        .metrics-trend-row .metrics-trend {
            margin-top: 0;
        }

        .metrics-sparkline {
            flex: 0 0 auto;
            width: 64px;
            height: 24px;
            overflow: visible;
        }

        .metrics-sparkline path {
            fill: none;
            stroke-width: 2.4;
            stroke-linecap: round;
            stroke-linejoin: round;
        }

        .metrics-sparkline.is-up path {
            stroke: #16a34a;
        }

        .metrics-sparkline.is-down path {
            stroke: #e11d48;
        }

        .metrics-sparkline.is-flat path {
            stroke: #64748b;
        }

        .dashboard-main {
            display: grid;
            grid-template-columns: minmax(0, 1.42fr) minmax(460px, 1.08fr);
            gap: 14px;
            align-items: stretch;
        }

        .dashboard-cell {
            min-width: 0;
            min-height: 0;
        }

        .dashboard-brief {
            grid-column: 1 / -1;
            grid-row: 1;
        }

        .dashboard-employee {
            grid-column: 2;
            grid-row: 2;
            height: 420px;
            min-height: 0;
            overflow: hidden;
        }

        .dashboard-overall {
            grid-column: 1;
            grid-row: 2;
            height: 420px;
            min-height: 0;
        }

        .dashboard-vehicle {
            grid-column: 2;
            grid-row: 3;
            height: 420px;
            min-height: 0;
            overflow: hidden;
        }

        .dashboard-department {
            grid-column: 1;
            grid-row: 3;
            height: 420px;
        }

        .dashboard-panel {
            padding: 12px 16px 14px;
            background: #fff;
            border: 1px solid #e3e8ef;
            border-radius: 10px;
            box-shadow: 0 6px 18px rgb(15 23 42 / 4%);
        }

        .dashboard-employee .dashboard-panel,
        .dashboard-overall .dashboard-panel,
        .dashboard-vehicle .dashboard-panel,
        .dashboard-department .dashboard-panel {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
            overflow: hidden;
        }

        .table-panel {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-height: 0;
        }

        .panel-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #edf1f5;
        }

        .panel-header-main {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .panel-title {
            position: relative;
            padding-left: 10px;
            font-size: 17px;
            font-weight: 700;
            line-height: 1.25;
            color: #1f2937;
        }

        .panel-title::before {
            position: absolute;
            top: 2px;
            left: 0;
            width: 3px;
            height: 16px;
            background: #3b82f6;
            border-radius: 2px;
            content: "";
        }

        .panel-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 28px;
            padding: 0 10px;
            font-size: 13px;
            font-weight: 600;
            color: #2563eb;
            border-radius: 4px;
            cursor: pointer;
        }

        .panel-link:hover {
            background: #eff6ff;
        }

        .field-help-button.el-button {
            flex: 0 0 auto;
            color: #2563eb;
            font-weight: 600;
        }

        .field-help-list {
            display: grid;
            gap: 12px;
        }

        .field-help-item {
            padding: 12px 14px;
            border: 1px solid #e5edf5;
            border-radius: 8px;
            background: #f8fafc;
        }

        .field-help-name {
            margin-bottom: 5px;
            color: #111827;
            font-size: 14px;
            font-weight: 700;
        }

        .field-help-desc {
            color: #4b5563;
            font-size: 13px;
            line-height: 1.7;
        }

        .panel-switch.el-radio-group {
            display: inline-flex;
            align-items: center;
            padding: 2px;
            background: #f3f6fa;
            border: 1px solid #d8e0ea;
            border-radius: 6px;
        }

        .panel-switch :deep(.el-radio-button__inner) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 50px;
            height: 26px;
            padding: 0 12px;
            font-size: 13px;
            font-weight: 500;
            line-height: 1;
            color: #475569;
            background: transparent;
            border: 0 !important;
            border-radius: 4px !important;
            box-shadow: none !important;
        }

        .panel-switch :deep(.el-radio-button__inner:hover) {
            color: #0369a1;
        }

        .panel-switch :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
            color: #fff;
            background: #0369a1;
            box-shadow: none !important;
        }

        .briefing-table-wrap {
            margin-top: 10px;
            overflow: hidden;
            background: #fff;
            border: 1px solid #e7edf3;
            border-radius: 8px;
        }

        .briefing-table-scroll {
            max-height: 372px;
            overflow-x: auto;
            overflow-y: auto;
        }

        .briefing-table {
            width: 100%;
            min-width: 840px;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .briefing-table th,
        .briefing-table td {
            height: 38px;
            padding: 0 10px;
            font-size: 13px;
            line-height: 1.35;
            text-align: left;
            border-bottom: 1px solid #edf1f5;
            white-space: nowrap;
        }

        .briefing-table th {
            position: sticky;
            top: 0;
            z-index: 2;
            font-weight: 600;
            color: #6b7280;
            background: #f8fafc;
        }

        .briefing-table td {
            color: #1f2937;
            background: #fff;
        }

        .briefing-table tfoot td {
            height: 40px;
            font-weight: 700;
            background: #f8fafc;
            border-bottom: 0;
        }

        .briefing-name {
            display: flex;
            align-items: center;
            gap: 6px;
            min-width: 0;
            font-weight: 600;
            color: #334155;
        }

        .briefing-name-icon {
            flex: 0 0 auto;
            font-size: 14px;
            color: #3b82f6;
        }

        .briefing-name-main {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .briefing-name-sub {
            margin-top: 2px;
            overflow: hidden;
            font-size: 12px;
            font-weight: 400;
            color: #94a3b8;
            text-overflow: ellipsis;
        }

        .briefing-metric {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .briefing-metric-value {
            flex: 0 0 52px;
            font-weight: 600;
            color: #334155;
        }

        .briefing-bar {
            position: relative;
            flex: 1;
            height: 4px;
            overflow: hidden;
            background: #e8eef5;
            border-radius: 99px;
        }

        .briefing-bar span {
            display: block;
            height: 100%;
            background: #14b8a6;
            border-radius: inherit;
        }

        .briefing-bar-blue span {
            background: #4f7cff;
        }

        .briefing-bar-orange span {
            background: #f59e0b;
        }

        .briefing-trend {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            font-weight: 700;
        }

        .briefing-trend.is-up {
            color: #ef4444;
        }

        .briefing-trend.is-down {
            color: #0f9b8e;
        }

        .briefing-trend.is-flat {
            color: #64748b;
        }

        .briefing-status {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            height: 22px;
            padding: 0 8px;
            font-size: 13px;
            font-weight: 600;
            border-radius: 999px;
        }

        .briefing-status.available {
            color: #047857;
            background: #ecfdf5;
        }

        .briefing-status.in-use {
            color: #0369a1;
            background: #eff6ff;
        }

        .briefing-status.controlled {
            color: #b45309;
            background: #fffbeb;
        }

        .table-shell {
            margin-top: 10px;
            padding: 0;
            background: #fff;
            border: 1px solid #e7edf3;
            border-radius: 8px;
            overflow: hidden;
        }

        .rank-cell {
            display: flex;
            justify-content: center;
        }

        .rank-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 22px;
            height: 22px;
            font-size: 13px;
            font-weight: 700;
            border-radius: 6px;
        }

        .rank-badge-top {
            color: #fff;
            background: linear-gradient(180deg, #f59e0b 0%, #ea580c 100%);
        }

        .rank-badge-normal {
            color: #6b7280;
            background: #e5e7eb;
        }

        .rank-table-wrap {
            flex: 1;
            height: 100%;
            min-height: 0;
            margin-top: 10px;
            overflow-y: auto;
            overflow-x: hidden;
            background: #fff;
            border: 1px solid #e7edf3;
            border-radius: 8px;
        }

        .rank-table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .rank-table th,
        .rank-table td {
            height: 38px;
            padding: 0 10px;
            font-size: 13px;
            line-height: 1.35;
            color: #1f2937;
            border-bottom: 1px solid #edf1f5;
            white-space: nowrap;
        }

        .rank-table th {
            font-weight: 600;
            color: #64748b;
            text-align: left;
            background: #f8fafc;
        }

        .rank-table tbody tr:hover td {
            background: #f8fafc;
        }

        .rank-table td {
            font-size: 14px;
        }

        .rank-table .text-right {
            text-align: right;
        }

        .rank-table .text-center {
            text-align: center;
        }

        .rank-table-ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .rank-table-empty {
            height: 190px;
            font-size: 13px;
            color: #94a3b8;
            text-align: center;
        }

        .table-shell :deep(.el-table) {
            color: #1f2937;
            background: #fff;
        }

        .table-shell :deep(.el-table th.el-table__cell) {
            height: 42px;
        }

        .table-shell :deep(.el-table td.el-table__cell) {
            height: 46px;
        }

        .table-shell :deep(.el-table th.el-table__cell),
        .table-shell :deep(.el-table td.el-table__cell) {
            padding: 0 10px;
            border-bottom-color: #edf1f5;
        }

        .table-shell .primary-header-row {
            background: #f8fafc !important;
        }

        .table-shell .primary-header-row .cell {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
        }

        .table-shell :deep(.el-table .cell) {
            line-height: 1.45;
        }

        .table-shell :deep(.el-table__empty-block) {
            min-height: 100%;
        }

        .table-shell :deep(.el-table__row:hover > td.el-table__cell) {
            background: #f8fafc !important;
        }

        .table-shell :deep(.el-table__inner-wrapper::before) {
            display: none;
        }

        .chart-surface {
            flex: 1 1 auto;
            height: auto;
            min-height: 0;
            margin-top: 10px;
            overflow: hidden;
            background: #fff;
            border: 1px solid #e7edf3;
            border-radius: 8px;
        }

        .chart-tall {
            min-height: 0;
        }

        .chart-dept {
            min-height: 0;
            height: auto;
        }

        .department-chart-card {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            margin-top: 10px;
            padding: 2px 0 0;
            background: transparent;
            border: 0;
            border-radius: 0;
        }

        .department-chart-list {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 0;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 0 6px 4px 0;
        }

        .department-chart-row {
            display: grid;
            grid-template-columns: minmax(142px, 190px) minmax(0, 1fr) 76px;
            gap: 14px;
            align-items: center;
            min-height: 34px;
            flex: 0 0 auto;
        }

        .department-chart-name {
            display: flex;
            align-items: center;
            min-width: 0;
            gap: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #334155;
        }

        .department-chart-rank {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex: 0 0 auto;
            width: 22px;
            height: 22px;
            font-size: 13px;
            font-weight: 700;
            color: #075985;
            background: #e0f2fe;
            border-radius: 999px;
        }

        .department-chart-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .department-bar-track {
            height: 12px;
            overflow: hidden;
            background: #e8eef5;
            border-radius: 999px;
        }

        .department-bar-fill {
            display: block;
            height: 100%;
            min-width: 8px;
            background: #4f7cff;
            border-radius: inherit;
            box-shadow: 0 4px 10px rgba(79, 124, 255, 0.14);
        }

        .department-chart-value {
            font-size: 14px;
            font-weight: 700;
            color: #1f2937;
            text-align: right;
            white-space: nowrap;
        }

        @media (max-width: 1440px) {
            .metrics-grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
            }

            .metrics-card {
                border-top-width: 2px;
            }
        }

        @media (max-width: 1200px) {
            .dashboard-main {
                grid-template-columns: 1fr;
            }

            .dashboard-brief,
            .dashboard-employee,
            .dashboard-overall,
            .dashboard-vehicle,
            .dashboard-department {
                grid-column: 1;
                grid-row: auto;
                height: auto;
                min-height: 420px;
            }
        }

        @media (max-width: 900px) {
            .metrics-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 768px) {
            .dashboard-page {
                padding-top: 0;
            }

            .dashboard-toolbar {
                flex-direction: column;
                align-items: stretch;
            }

            .toolbar-filter-shell {
                width: 100%;
            }

            .dashboard-panel {
                padding: 16px;
            }

            .panel-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }

        @media (max-width: 640px) {
            .metrics-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }

            .metrics-card {
                min-height: auto;
                padding: 14px 16px;
            }
        }
</style>
