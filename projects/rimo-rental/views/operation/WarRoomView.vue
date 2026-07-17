<template>
<main class="war-room-page relative">
            
            

            
            <div class="space-y-6 custom-scroll">


                
                <div 
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <span class="text-sm font-bold text-gray-700">业务线过滤</span>
                        <el-cascader v-model="businessLine" :options="businessLineOptions"
                            :props="{ checkStrictly: true, expandTrigger: 'hover' }" size="small" placeholder="业务线过滤"
                            clearable></el-cascader>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm text-gray-500">统计区间</span>
                        <el-select v-model="dateRange" size="small" style="width: 140px;">
                            <el-option label="本周" value="week"></el-option>
                            <el-option label="本月" value="month"></el-option>
                            <el-option label="近30天" value="30d"></el-option>
                        </el-select>
                    </div>
                </div>

                
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                    <div v-for="kpi in kpis" :key="kpi.label"
                        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md transition-all">
                        <div class="absolute right-0 top-0 w-20 h-20 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110"
                            :style="{background: kpi.bgColor}"></div>
                        <div class="relative z-10">
                            <div class="text-xs font-medium text-gray-500 mb-1">{{ kpi.label }}</div>
                            <div class="text-2xl font-bold text-gray-800">{{ kpi.value }}</div>
                            <div class="mt-1 text-xs" :class="kpi.trend > 0 ? 'text-green-600' : 'text-red-500'">
                                {{ kpi.trend > 0 ? '↑' : '↓' }} {{ Math.abs(kpi.trend) }}% 较上周
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-3">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">热门时段统计 (周一~周日 × 24H)</h2>
                        </div>
                        <div class="p-4">
                            <div id="heatmapChart" class="chart-box-heatmap"></div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">每周营收分析</h2>
                        </div>
                        <div class="p-4">
                            <div id="weeklyRevenueChart" class="chart-box-heatmap"></div>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">当下车况分布</h2>
                        </div>
                        <div class="p-4">
                            <div id="vehicleStatusChart" class="chart-box"></div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">近7日出租率趋势</h2>
                        </div>
                        <div class="p-4">
                            <div id="utilizationChart" class="chart-box"></div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">营收情况</h2>
                        </div>
                        <div class="p-4">
                            <div id="revenueChart" class="chart-box"></div>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">热门车款租用次数排行</h2>
                        </div>
                        <div class="p-4">
                            <div id="topModelsChart" class="chart-box-lg"></div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">各车行公司车辆状况统计</h2>
                        </div>
                        <div class="p-4">
                            <div id="branchStatusChart" class="chart-box-lg"></div>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">订单状况统计</h2>
                        </div>
                        <div class="p-4">
                            <div id="orderStatusChart" class="chart-box-lg"></div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">热门站点排行</h2>
                        </div>
                        <div class="p-4 px-5">
                            <div v-for="(s, i) in topStations" :key="s.name" class="rank-item">
                                <div :class="['rank-badge', i < 3 ? 'rank-' + (i+1) : 'rank-default']">{{ i + 1 }}</div>
                                <div class="flex-1 min-w-0">
                                    <div class="text-sm text-gray-800 font-medium truncate">{{ s.name }}</div>
                                    <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                                        <div class="h-1.5 rounded-full transition-all"
                                            :style="{width: s.pct + '%', background: i === 0 ? '#3b82f6' : i === 1 ? '#6366f1' : i === 2 ? '#8b5cf6' : '#d1d5db'}">
                                        </div>
                                    </div>
                                </div>
                                <div class="text-sm font-bold ml-3 flex-shrink-0"
                                    :class="i < 3 ? 'text-blue-600' : 'text-gray-400'">{{ s.orders }} 单</div>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 class="font-bold text-gray-800 text-base">渠道进件占比</h2>
                            <span class="text-xs text-gray-400">订单来源分析</span>
                        </div>
                        <div class="p-4">
                            <div id="channelChart" class="chart-box"></div>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
                            <h2 class="font-bold text-gray-800 text-base">风险与异常单趋势</h2>
                            <span class="text-xs text-gray-400">近14天</span>
                        </div>
                        <div class="p-4">
                            <div id="riskTrendChart" class="chart-box"></div>
                        </div>
                    </div>
                </div>

            </div>
        </main>
</template>

<script setup>

import { nextTick, onMounted, ref } from "vue";
import * as echarts from "echarts";
import { useChartRegistry } from "@/composables/useChartRegistry";
import { getThemeColor, getThemeColorRgb } from "@/config/theme";

const { registerChart } = useChartRegistry();

const dateRange = ref('week');
                const businessLine = ref('all');

                const businessLineOptions = ref([
                    { value: 'all', label: '全部业务' },
                    {
                        value: 'timeshare',
                        label: '分时租赁',
                        children: [
                            { value: 'station', label: '同站租还' },
                            { value: 'oneway', label: '甲租乙还' }
                        ]
                    },
                    {
                        value: 'store_group',
                        label: '门市长短租',
                        children: [
                            { value: 'store', label: '门市租车' },
                            { value: 'self24h', label: '24h自助门市' }
                        ]
                    }
                ]);

                const kpis = ref([
                    { label: '本周总营收', value: '¥86.5万', trend: 12.3, bgColor: '#dbeafe' },
                    { label: '本周订单量', value: '2,340', trend: 8.7, bgColor: '#dcfce7' },
                    { label: '车队出租率', value: '87.3%', trend: 3.2, bgColor: '#fef3c7' },
                    { label: '车辆总数', value: '1,560', trend: 1.1, bgColor: '#e0e7ff' },
                    { label: '活跃会员', value: '9,120', trend: 5.6, bgColor: '#ede9fe' },
                    { label: '异常工单', value: '23', trend: -15.4, bgColor: '#fee2e2' }
                ]);

                const topStations = ref([
                    { name: '上海虹桥机场 T2 网点', orders: 892, pct: 100 },
                    { name: '北京首都机场 T3 网点', orders: 756, pct: 85 },
                    { name: '深圳宝安机场网点', orders: 634, pct: 71 },
                    { name: '杭州萧山机场网点', orders: 521, pct: 58 },
                    { name: '广州白云机场网点', orders: 489, pct: 55 },
                    { name: '成都天府机场网点', orders: 412, pct: 46 },
                    { name: '重庆江北机场网点', orders: 387, pct: 43 },
                    { name: '南京禄口机场网点', orders: 345, pct: 39 }
                ]);

                // ===== ECharts 初始化 (全部使用默认 light 主题) =====

                // 1. 热门时段热力图
                const initHeatmap = () => {
                    const dom = document.getElementById('heatmapChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    const hours = Array.from({ length: 24 }, (_, i) => i + ':00');
                    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
                    const data = [];
                    for (let d = 0; d < 7; d++) {
                        for (let h = 0; h < 24; h++) {
                            const base = (h >= 8 && h <= 20) ? 40 : 10;
                            const weekend = (d >= 5) ? 20 : 0;
                            const peak = (h >= 9 && h <= 11) || (h >= 17 && h <= 19) ? 30 : 0;
                            data.push([h, d, Math.min(100, base + weekend + peak + Math.floor(Math.random() * 25))]);
                        }
                    }
                    chart.setOption({
                        tooltip: { position: 'top', formatter: p => `${days[p.value[1]]} ${hours[p.value[0]]}<br/>订单量: <b>${p.value[2]}</b>` },
                        grid: { top: 10, bottom: 30, left: 50, right: 20 },
                        xAxis: { type: 'category', data: hours, axisLabel: { color: '#6b7280', fontSize: 10 }, splitArea: { show: true } },
                        yAxis: { type: 'category', data: days, axisLabel: { color: '#374151' } },
                        visualMap: { min: 0, max: 100, calculable: true, orient: 'horizontal', left: 'center', bottom: 0, show: false, inRange: { color: ['#e0f2fe', '#7dd3fc', '#38bdf8', '#0284c7', '#075985'] } },
                        series: [{ type: 'heatmap', data: data, label: { show: false }, emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.15)' } } }]
                    });
                };

                // 2. 每周营收分析
                const initWeeklyRevenue = () => {
                    const dom = document.getElementById('weeklyRevenueChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    chart.setOption({
                        tooltip: { trigger: 'axis' },
                        legend: { data: ['租金收入', '增值服务', '环比增长率'], top: 0, right: 0, textStyle: { color: '#6b7280', fontSize: 11 } },
                        grid: { top: 35, left: 10, right: 40, bottom: 10, containLabel: true },
                        xAxis: { type: 'category', data: ['W1', 'W2', 'W3', 'W4'], axisLabel: { color: '#6b7280' } },
                        yAxis: [
                            { type: 'value', axisLabel: { color: '#6b7280', formatter: '¥{value}k' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
                            { type: 'value', axisLabel: { color: '#6b7280', formatter: '{value}%' }, splitLine: { show: false } }
                        ],
                        series: [
                            { name: '租金收入', type: 'bar', barWidth: '30%', itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] }, data: [180, 210, 195, 240] },
                            { name: '增值服务', type: 'bar', barWidth: '30%', itemStyle: { color: '#a78bfa', borderRadius: [4, 4, 0, 0] }, data: [30, 35, 28, 42] },
                            { name: '环比增长率', type: 'line', yAxisIndex: 1, smooth: true, itemStyle: { color: '#10b981' }, data: [null, 16.7, -7.1, 23.1] }
                        ]
                    });
                };

                // 3. 当下车况分布 (环形图)
                const initVehicleStatus = () => {
                    const dom = document.getElementById('vehicleStatusChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    chart.setOption({
                        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                        legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#374151', fontSize: 12 } },
                        series: [{
                            type: 'pie', radius: ['45%', '72%'], center: ['35%', '50%'],
                            avoidLabelOverlap: false,
                            label: {
                                position: 'center', show: true, formatter: '总计\n{total|1,560}',
                                rich: { total: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', lineHeight: 30 } }
                            },
                            emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
                            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
                            data: [
                                { value: 980, name: '在租中', itemStyle: { color: '#3b82f6' } },
                                { value: 395, name: '可租用', itemStyle: { color: '#10b981' } },
                                { value: 85, name: '维保中', itemStyle: { color: '#f59e0b' } },
                                { value: 60, name: '待清洁', itemStyle: { color: '#a78bfa' } },
                                { value: 40, name: '故障封控', itemStyle: { color: '#ef4444' } }
                            ]
                        }]
                    });
                };

                // 4. 近7日出租率
                const initUtilization = () => {
                    const dom = document.getElementById('utilizationChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    chart.setOption({
                        tooltip: { trigger: 'axis', formatter: '{b}<br/>出租率: {c}%' },
                        grid: { top: 20, left: 10, right: 20, bottom: 10, containLabel: true },
                        xAxis: { type: 'category', boundaryGap: false, data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLabel: { color: '#6b7280' } },
                        yAxis: { type: 'value', min: 50, max: 100, axisLabel: { formatter: '{value}%', color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
                        series: [{
                            type: 'line', smooth: true, data: [78, 80, 82, 79, 88, 95, 93],
                            itemStyle: { color: getThemeColor() },
                            lineStyle: { width: 3, shadowColor: getThemeColorRgb(0.2), shadowBlur: 8, shadowOffsetY: 4 },
                            areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: getThemeColorRgb(0.3) }, { offset: 1, color: getThemeColorRgb(0) }]) }
                        }]
                    });
                };

                // 5. 营收情况
                const initRevenue = () => {
                    const dom = document.getElementById('revenueChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    chart.setOption({
                        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                        grid: { top: 20, left: 10, right: 10, bottom: 10, containLabel: true },
                        xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'], axisLabel: { color: '#6b7280' } },
                        yAxis: { type: 'value', axisLabel: { formatter: '¥{value}k', color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
                        series: [{
                            name: '日营收', type: 'bar', barWidth: '50%',
                            itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: '#3b82f6' }, { offset: 1, color: '#93c5fd' }]), borderRadius: [6, 6, 0, 0] },
                            data: [120, 132, 101, 134, 190, 230, 210]
                        }]
                    });
                };

                // 6. 热门车款排行 (横向条形图)
                const initTopModels = () => {
                    const dom = document.getElementById('topModelsChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    const models = ['Tesla Model 3', 'Toyota Camry', 'BMW 3 Series', 'Mercedes C-Class', 'Honda CR-V', 'Audi A4', 'Volvo XC60', 'Lexus ES'];
                    const counts = [456, 389, 312, 287, 265, 231, 198, 176];
                    chart.setOption({
                        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                        grid: { top: 10, left: 10, right: 40, bottom: 10, containLabel: true },
                        xAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
                        yAxis: { type: 'category', data: models.reverse(), axisLabel: { color: '#374151', fontSize: 11 } },
                        series: [{
                            type: 'bar', barWidth: '55%',
                            data: counts.reverse().map((v, i) => ({
                                value: v,
                                itemStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                        { offset: 0, color: i >= counts.length - 3 ? '#3b82f6' : '#d1d5db' },
                                        { offset: 1, color: i >= counts.length - 3 ? '#60a5fa' : '#e5e7eb' }
                                    ]), borderRadius: [0, 4, 4, 0]
                                }
                            })),
                            label: { show: true, position: 'right', color: '#374151', fontSize: 11 }
                        }]
                    });
                };

                // 7. 各车行公司车辆状况统计 (堆叠柱状图)
                const initBranchStatus = () => {
                    const dom = document.getElementById('branchStatusChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    const branches = ['RIMO上海', 'RIMO北京', 'RIMO深圳', 'RIMO杭州', '合作方A', '合作方B'];
                    chart.setOption({
                        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                        legend: { data: ['在租', '空闲', '维保', '故障'], top: 0, right: 0, textStyle: { color: '#6b7280', fontSize: 11 } },
                        grid: { top: 35, left: 10, right: 10, bottom: 10, containLabel: true },
                        xAxis: { type: 'category', data: branches, axisLabel: { color: '#374151', fontSize: 11 } },
                        yAxis: { type: 'value', axisLabel: { color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
                        series: [
                            { name: '在租', type: 'bar', stack: 'total', barWidth: '45%', itemStyle: { color: '#3b82f6' }, data: [280, 210, 170, 120, 98, 65] },
                            { name: '空闲', type: 'bar', stack: 'total', itemStyle: { color: '#10b981' }, data: [80, 65, 55, 40, 30, 22] },
                            { name: '维保', type: 'bar', stack: 'total', itemStyle: { color: '#f59e0b' }, data: [20, 18, 12, 8, 6, 4] },
                            { name: '故障', type: 'bar', stack: 'total', itemStyle: { color: '#ef4444', borderRadius: [4, 4, 0, 0] }, data: [8, 5, 4, 3, 2, 1] }
                        ]
                    });
                };

                // 8. 订单状况统计 (漏斗图)
                const initOrderStatus = () => {
                    const dom = document.getElementById('orderStatusChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    chart.setOption({
                        tooltip: { trigger: 'item', formatter: '{b}: {c}' },
                        legend: { top: 0, textStyle: { color: '#6b7280' } },
                        series: [{
                            type: 'funnel', left: '10%', top: 40, bottom: 10, width: '80%',
                            sort: 'descending', gap: 3,
                            label: { show: true, position: 'inside', color: '#fff', fontSize: 12 },
                            itemStyle: { borderColor: '#fff', borderWidth: 2 },
                            data: [
                                { value: 2340, name: '总预订量', itemStyle: { color: '#3b82f6' } },
                                { value: 2100, name: '已取车', itemStyle: { color: '#0ea5e9' } },
                                { value: 1850, name: '租赁中', itemStyle: { color: '#10b981' } },
                                { value: 1680, name: '正常完结', itemStyle: { color: '#22c55e' } },
                                { value: 120, name: '逾期/违约', itemStyle: { color: '#ef4444' } }
                            ]
                        }]
                    });
                };

                // 9. 渠道进件占比
                const initChannel = () => {
                    const dom = document.getElementById('channelChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    chart.setOption({
                        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                        legend: { orient: 'vertical', right: 10, top: 'center', textStyle: { color: '#374151' } },
                        series: [{
                            type: 'pie', radius: ['40%', '68%'], center: ['35%', '50%'],
                            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
                            label: { show: false },
                            emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
                            data: [
                                { value: 780, name: '微信小程序', itemStyle: { color: '#22c55e' } },
                                { value: 620, name: 'APP 自营', itemStyle: { color: '#3b82f6' } },
                                { value: 480, name: '企业大客户', itemStyle: { color: '#f59e0b' } },
                                { value: 320, name: 'OTA平台', itemStyle: { color: '#a78bfa' } },
                                { value: 140, name: '门店柜台', itemStyle: { color: '#9ca3af' } }
                            ]
                        }]
                    });
                };

                // 10. 风险趋势
                const initRiskTrend = () => {
                    const dom = document.getElementById('riskTrendChart');
                    if (!dom) return;
                    const chart = registerChart(echarts.init(dom));
                    const days14 = Array.from({ length: 14 }, (_, i) => `${i + 1}日`);
                    chart.setOption({
                        tooltip: { trigger: 'axis' },
                        legend: { data: ['事故率', '严重逾期率'], top: 0, right: 0, textStyle: { color: '#6b7280' } },
                        grid: { top: 35, left: 10, right: 10, bottom: 10, containLabel: true },
                        xAxis: { type: 'category', data: days14, axisLabel: { color: '#6b7280', fontSize: 10 } },
                        yAxis: { type: 'value', axisLabel: { formatter: '{value}%', color: '#6b7280' }, splitLine: { lineStyle: { color: '#f3f4f6' } } },
                        series: [
                            { name: '事故率', type: 'line', smooth: true, itemStyle: { color: '#ef4444' }, data: [1.2, 0.8, 1.5, 0.6, 1.1, 0.9, 1.8, 1.3, 0.7, 1.0, 0.5, 1.4, 0.9, 1.1] },
                            { name: '严重逾期率', type: 'line', smooth: true, itemStyle: { color: '#f59e0b' }, data: [2.1, 1.9, 2.5, 1.8, 2.3, 2.0, 3.1, 2.6, 1.5, 2.2, 1.7, 2.8, 2.0, 2.3] }
                        ]
                    });
                };

                onMounted(() => {
                    nextTick(() => {
                        initHeatmap();
                        initWeeklyRevenue();
                        initVehicleStatus();
                        initUtilization();
                        initRevenue();
                        initTopModels();
                        initBranchStatus();
                        initOrderStatus();
                        initChannel();
                        initRiskTrend();
                    });
                });

</script>

<style scoped>
/* Custom Scrollbar */
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

        :deep([v-cloak]) {
            display: none;
        }

        .chart-box {
            width: 100%;
            height: 280px;
        }

        .chart-box-lg {
            width: 100%;
            height: 340px;
        }

        .chart-box-heatmap {
            width: 100%;
            height: 320px;
        }

        /* 排行榜 */
        .rank-item {
            display: flex;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .rank-item:last-child {
            border-bottom: none;
        }

        .rank-badge {
            width: 22px;
            height: 22px;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
            color: white;
            margin-right: 10px;
            flex-shrink: 0;
        }

        .rank-1 {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .rank-2 {
            background: linear-gradient(135deg, #9ca3af, #6b7280);
        }

        .rank-3 {
            background: linear-gradient(135deg, #b45309, #92400e);
        }

        .rank-default {
            background: #d1d5db;
            color: #6b7280;
        }
</style>
