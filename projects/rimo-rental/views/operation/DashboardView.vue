<template>
<main class="operation-dashboard-page relative">
            
            

            
            <div class="space-y-6 custom-scroll">

                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    <div 
                        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div 
                            class="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110">
                        </div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 mb-1">会员总规模</h3>
                                <div class="text-3xl font-bold text-gray-800">{{ stats.memberTotal.toLocaleString() }}
                                </div>
                            </div>
                            <div class="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <el-icon class="text-xl">
                                    <UserFilled></UserFilled>
                                </el-icon>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center gap-4 text-sm relative z-10">
                            <div class="flex items-center text-emerald-600 font-medium">
                                <el-icon class="mr-1">
                                    <TopRight></TopRight>
                                </el-icon>
                                <span>+124 本周</span>
                            </div>
                            <div class="text-gray-500">
                                企业客户: <span class="font-bold text-gray-700">{{ stats.corporateTotal }}</span>
                            </div>
                        </div>
                    </div>

                    
                    <div 
                        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div 
                            class="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110">
                        </div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 mb-1">运力及车辆状态</h3>
                                <div class="text-3xl font-bold text-gray-800">{{ stats.vehicleTotal.toLocaleString() }}
                                </div>
                            </div>
                            <div class="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                <el-icon class="text-xl">
                                    <Van></Van>
                                </el-icon>
                            </div>
                        </div>
                        <div class="mt-4 flex gap-4 text-sm relative z-10">
                            <div class="flex flex-col text-gray-500">
                                <span class="text-emerald-600 font-bold">{{ stats.vehicleRented }}</span>
                                <span class="text-xs">使用中</span>
                            </div>
                            <div class="w-px bg-gray-200"></div>
                            <div class="flex flex-col text-gray-500">
                                <span class="text-blue-600 font-bold">{{ stats.vehicleAvailable }}</span>
                                <span class="text-xs">待租中</span>
                            </div>
                            <div class="w-px bg-gray-200"></div>
                            <div class="flex flex-col text-gray-500">
                                <span class="text-amber-500 font-bold">{{ stats.vehicleMaintenance }}</span>
                                <span class="text-xs">维保中</span>
                            </div>
                        </div>
                    </div>

                    
                    <div 
                        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div 
                            class="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110">
                        </div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 mb-1">今日新增订单</h3>
                                <div class="text-3xl font-bold text-gray-800">{{ stats.todayOrders }}</div>
                            </div>
                            <div class="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <el-icon class="text-xl">
                                    <List></List>
                                </el-icon>
                            </div>
                        </div>
                        <div class="mt-4 flex flex-col gap-1 text-sm relative z-10">
                            <div class="flex justify-between">
                                <span class="text-gray-500">门市租赁</span>
                                <span class="font-bold text-gray-700">{{ stats.ordersStore }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">分时租赁</span>
                                <span class="font-bold text-gray-700">{{ stats.ordersTimeShare }}</span>
                            </div>
                        </div>
                    </div>

                    
                    <div 
                        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                        <div 
                            class="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110">
                        </div>
                        <div class="flex justify-between items-start relative z-10">
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 mb-1">今日预估营收</h3>
                                <div class="text-3xl font-bold text-gray-800 tracking-tight">
                                    <span class="text-xl font-medium">￥</span>{{ (stats.todayRevenue / 1000).toFixed(1)
                                    }}k
                                </div>
                            </div>
                            <div class="p-2 bg-orange-100 rounded-lg text-orange-600">
                                <el-icon class="text-xl">
                                    <Money></Money>
                                </el-icon>
                            </div>
                        </div>
                        <div class="mt-4 flex items-center text-sm relative z-10">
                            <div class="flex items-center text-emerald-600 font-medium">
                                <el-icon class="mr-1">
                                    <TopRight></TopRight>
                                </el-icon>
                                <span>+5.2% 较昨日</span>
                            </div>
                            <div class="ml-auto text-xs text-gray-400">更新时间: 10分钟前</div>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    
                    <div 
                        class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 class="font-bold text-gray-800 text-lg flex items-center">
                                <el-icon class="text-theme-primary mr-2">
                                    <Location></Location>
                                </el-icon>
                                门店及车辆分布监控
                            </h2>
                            <el-radio-group v-model="mapView" size="small">
                                <el-radio-button label="heat">热力模式</el-radio-button>
                                <el-radio-button label="scatter">站点分布</el-radio-button>
                            </el-radio-group>
                        </div>
                        <div class="p-4 flex-1">
                            
                            <div id="mapChart" class="map-container rounded-lg bg-gray-50/50"></div>
                        </div>
                    </div>

                </div>

                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                    
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">近7天车队出租率趋势 (Fleet Utilization)</h2>
                        </div>
                        <div class="p-4">
                            <div id="utilizationChart" class="chart-container"></div>
                        </div>
                    </div>

                    
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div class="p-5 border-b border-gray-100">
                            <h2 class="font-bold text-gray-800 text-base">近7天营收与订单量趋势 (Revenue & Orders)</h2>
                        </div>
                        <div class="p-4">
                            <div id="revenueChart" class="chart-container"></div>
                        </div>
                    </div>
                </div>

            </div>
        </main>

        
        <el-dialog v-model="notificationDrawerVisible" title="系统提醒中心" width="800px" center top="10vh" :show-close="true"
            custom-class="shadow-2xl rounded-xl">
            
            <template #header>
                <div class="flex items-center text-gray-800 font-bold text-lg">
                    <span class="w-2 h-6 bg-red-500 rounded mr-3"></span>
                    实时预警与通知中心
                    <el-badge :value="filteredNotifications.length" type="danger" class="ml-3"></el-badge>
                </div>
            </template>

            <div class="flex items-center justify-between mb-4">
                <el-radio-group v-model="activeNotificationTab" size="default">
                    <el-radio-button label="all">全部提醒</el-radio-button>
                    <el-radio-button label="订单提醒">订单提醒</el-radio-button>
                    <el-radio-button label="车况提醒">车况提醒</el-radio-button>
                    <el-radio-button label="保养提醒">保养提醒</el-radio-button>
                    <el-radio-button label="系统通知">其他通知</el-radio-button>
                </el-radio-group>
                <el-button type="primary" plain size="small">全部标为已读</el-button>
            </div>

            <el-table :data="filteredNotifications" style="width: 100%" height="600px" size="large"
                :header-cell-style="{background:'#f9fafb', color:'#374151', fontSize: '13px'}">
                <el-table-column prop="type" label="提醒类型" width="100">
                    <template #default="{ row }">
                        <el-tag size="small" :type="getNotificationTypeTag(row.type)" effect="dark">{{ row.type
                            }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="time" label="提醒时间" width="150">
                    <template #default="{ row }">
                        <span class="text-xs text-gray-500 font-mono">{{ row.time }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="title" label="提醒标题" min-width="320">
                    <template #default="{ row }">
                        <span class="text-sm font-medium text-gray-800" v-html="highlightKeyword(row.title)"></span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="90" align="center" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" size="small" v-if="row.action" class="font-bold">{{ row.action
                            }}</el-button>
                        <el-button link type="primary" size="small" v-else>立即处理</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <template #footer>
                <div class="flex items-center justify-between">
                    <el-checkbox v-model="snoozeToday" @change="handleSnoozeChange">今日不再自动弹出</el-checkbox>
                    <el-button @click="notificationDrawerVisible = false">关闭</el-button>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import * as echarts from "echarts";
import { useChartRegistry } from "@/composables/useChartRegistry";
import { getThemeColor, getThemeColorRgb } from "@/config/theme";

const { registerChart } = useChartRegistry();

// Register Element Plus Icons
                const mapView = ref('scatter');

                // 核心指标数据
                const stats = reactive({
                    memberTotal: 12450,
                    corporateTotal: 342,
                    vehicleTotal: 1560,
                    vehicleRented: 980,
                    vehicleAvailable: 495,
                    vehicleMaintenance: 85,
                    todayOrders: 345,
                    ordersStore: 125,
                    ordersTimeShare: 220,
                    todayRevenue: 128500
                });

                // 异常监控数据
                const orderExceptions = ref([
                    { id: 'OE-1', type: '逾期未还', orderNo: 'R-202611-0012', timeStr: '超期 2H', desc: '车辆定位显示未进入还车区域，多次联系未接听。', customer: '李强', phone: '138****0011' },
                    { id: 'OE-2', type: '未准时取车', orderNo: 'R-202611-0045', timeStr: '超期 1.5H', desc: '预订时间为14:00，目前仍未办理提车手续。', customer: '张三', phone: '139****1234' },
                    { id: 'OE-3', type: '事故工单', orderNo: 'R-202611-0089', timeStr: '处理中', desc: '客户反馈轻微追尾，已联系交警与保险公司。', customer: '王五', phone: '137****5678' }
                ]);

                const vehicleExceptions = ref([
                    { id: 'VE-1', type: '需保养', plateNo: '沪A·DF889', desc: '当前里程 49,850 km，临近 50,000 km 大保养周期。', location: '虹桥机场店' },
                    { id: 'VE-2', type: '待清洁', plateNo: '京A·R6677', desc: '刚结束跨城调度，传感器上报内饰脏污预警。', location: '北京南站店' },
                    { id: 'VE-3', type: '低电量', plateNo: '粤B·E1234', desc: 'SOC低于15%，需立即接入快充桩补能。', location: '福田高铁站' }
                ]);

                const totalExceptions = computed(() => orderExceptions.value.length + vehicleExceptions.value.length);

                const notificationDrawerVisible = ref(false);
                const activeNotificationTab = ref('all');

                const notifications = ref([
                    { id: 1, type: '订单提醒', time: '10分钟前', title: '🔴 [高危风控] 会员李*(138****0011) 触碰边界电子围栏，存在拆除GPS/骗租极高风险！', action: '立即冻结' },
                    { id: 2, type: '停车提醒', time: '15分钟前', title: '🔴 [网点阻断] 上海新客站店车位剩余0，但未来 2 小时仍有 12 台预定还车，面临大规模阻塞！', action: '指派疏解' },
                    { id: 3, type: '车况提醒', time: '2小时前', title: '🔴 [经营异动] 今日核心车型 GL8 出租率暴跌至 45%，且均价即将跌破警戒盈亏线。', action: '查看对策' }
                ]);

                const filteredNotifications = computed(() => {
                    if (activeNotificationTab.value === 'all') return notifications.value;
                    if (activeNotificationTab.value === '系统通知') return notifications.value.filter(n => ['公告通知', '工单提醒'].includes(n.type));
                    return notifications.value.filter(n => n.type === activeNotificationTab.value);
                });

                const getNotificationTypeTag = (type) => {
                    const map = {
                        '订单提醒': 'danger',
                        '车况提醒': 'warning',
                        '保养提醒': 'info',
                        '清洁提醒': 'success',
                        '停车提醒': 'primary',
                        '公告通知': '',
                        '工单提醒': 'danger'
                    };
                    return map[type] || 'info';
                };

                const highlightKeyword = (text) => {
                    return text.replace(/(ZT[0-9]+|RDC-[A-Z0-9]+)/g, '<span class="text-blue-600 font-bold underline cursor-pointer hover:text-blue-800">$1</span>');
                };

                // 今日不再提醒逻辑
                const snoozeToday = ref(false);

                const checkSnoozeStatus = () => {
                    const snoozeDate = localStorage.getItem('rimo_notification_snooze_date');
                    const today = new Date().toISOString().split('T')[0];
                    if (snoozeDate === today) {
                        snoozeToday.value = true;
                        notificationDrawerVisible.value = false;
                    } else {
                        // 如果没有勾选或者过期了，自动弹出
                        snoozeToday.value = false;
                        localStorage.removeItem('rimo_notification_snooze_date');
                        setTimeout(() => {
                            notificationDrawerVisible.value = true;
                        }, 1000); // 延迟 1s 弹出增强体验
                    }
                };

                const handleSnoozeChange = (val) => {
                    if (val) {
                        const today = new Date().toISOString().split('T')[0];
                        localStorage.setItem('rimo_notification_snooze_date', today);
                        ElMessage.success('设置成功，今日不再自动弹出预警中心。');
                    } else {
                        localStorage.removeItem('rimo_notification_snooze_date');
                    }
                };

                // ECharts 初始化方法
                const initMapChart = () => {
                    const chartDom = document.getElementById('mapChart');
                    if (!chartDom) return;
                    const myChart = registerChart(echarts.init(chartDom));

                    // 模拟简单散点数据
                    const data = [
                        [121.32, 31.19, 85, '上海虹桥点'],
                        [121.47, 31.23, 120, '上海市区'],
                        [116.40, 39.90, 60, '北京门店'],
                        [114.05, 22.54, 95, '深圳门店'],
                        [120.15, 30.28, 45, '杭州门店']
                    ];

                    const option = {
                        backgroundColor: 'transparent',
                        tooltip: {
                            trigger: 'item',
                            formatter: function (params) {
                                return `${params.data[3]}<br/>可用车辆: ${params.data[2]} 台`;
                            }
                        },
                        geo: {
                            map: 'china', // 这里为了演示，如果是实际项目需要引入百度地图或geojson
                            roam: true,
                            label: { emphasis: { show: false } },
                            itemStyle: {
                                normal: { areaColor: '#e0e7ff', borderColor: '#c7d2fe' },
                                emphasis: { areaColor: '#c7d2fe' }
                            },
                            center: [116.46, 39.92],
                            zoom: 1.5
                        },
                        series: [
                            {
                                name: '可用站点分布',
                                type: 'scatter',
                                coordinateSystem: 'geo',
                                data: data,
                                symbolSize: function (val) { return val[2] / 4; },
                                label: {
                                    formatter: '{b}',
                                    position: 'right',
                                    show: false
                                },
                                itemStyle: { color: '#4f46e5' },
                                emphasis: {
                                    label: { show: true }
                                }
                            },
                            {
                                name: '重点服务网点',
                                type: 'effectScatter',
                                coordinateSystem: 'geo',
                                data: data.sort(function (a, b) { return b[2] - a[2]; }).slice(0, 3),
                                symbolSize: function (val) { return val[2] / 5; },
                                showEffectOn: 'render',
                                rippleEffect: { brushType: 'stroke' },
                                itemStyle: { color: getThemeColor(), shadowBlur: 10, shadowColor: getThemeColor() },
                                zlevel: 1
                            }
                        ]
                    };

                    // 注意：因为没有加载 china.js，这里的 geo 会报错或不显示地图。
                    // 作为一个 UI 面板展示，我们可以用一个美观的自定义笛卡尔坐标模拟数据。
                    const mockOption = {
                        tooltip: { trigger: 'axis' },
                        grid: { top: 20, right: 20, bottom: 20, left: 20 },
                        xAxis: { type: 'value', show: false },
                        yAxis: { type: 'value', show: false },
                        series: [{
                            type: 'effectScatter',
                            symbolSize: 20,
                            data: [
                                [10, 20], [20, 30], [50, 40], [30, 80], [70, 60]
                            ],
                            itemStyle: { color: getThemeColor() },
                            label: { show: true, formatter: '活跃站点', position: 'top', color: '#666' }
                        }, {
                            type: 'scatter',
                            symbolSize: 10,
                            data: [
                                [15, 25], [25, 35], [55, 45], [35, 85], [75, 65],
                                [40, 20], [80, 10], [10, 80], [60, 90], [90, 50]
                            ],
                            itemStyle: { color: '#93c5fd' }
                        }]
                    };

                    myChart.setOption(mockOption);
                };

                const initUtilizationChart = () => {
                    const chartDom = document.getElementById('utilizationChart');
                    if (!chartDom) return;
                    const myChart = registerChart(echarts.init(chartDom));
                    const option = {
                        tooltip: { trigger: 'axis', formatter: '{b}日<br/>出租率：{c}%' },
                        grid: { top: '10%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
                        xAxis: {
                            type: 'category',
                            boundaryGap: false,
                            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                            axisLine: { lineStyle: { color: '#cbd5e1' } },
                            axisLabel: { color: '#64748b' }
                        },
                        yAxis: {
                            type: 'value',
                            min: 50,
                            max: 100,
                            axisLabel: { formatter: '{value} %', color: '#64748b' },
                            splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }
                        },
                        series: [
                            {
                                name: '出租率',
                                type: 'line',
                                smooth: true,
                                data: [78, 80, 82, 79, 88, 95, 93],
                                itemStyle: { color: getThemeColor() },
                                lineStyle: { width: 3, shadowColor: getThemeColorRgb(0.3), shadowBlur: 10, shadowOffsetY: 5 },
                                areaStyle: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                        { offset: 0, color: getThemeColorRgb(0.4) },
                                        { offset: 1, color: getThemeColorRgb(0) }
                                    ])
                                }
                            }
                        ]
                    };
                    myChart.setOption(option);
                };

                const initRevenueChart = () => {
                    const chartDom = document.getElementById('revenueChart');
                    if (!chartDom) return;
                    const myChart = registerChart(echarts.init(chartDom));
                    const option = {
                        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                        legend: { data: ['租金收入', '增值服务'], top: 0, right: 0 },
                        grid: { top: '15%', left: '3%', right: '4%', bottom: '3%', containLabel: true },
                        xAxis: {
                            type: 'category',
                            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
                            axisLine: { lineStyle: { color: '#cbd5e1' } },
                            axisLabel: { color: '#64748b' }
                        },
                        yAxis: {
                            type: 'value',
                            axisLabel: { formatter: '￥{value}k', color: '#64748b' },
                            splitLine: { lineStyle: { type: 'dashed', color: '#e2e8f0' } }
                        },
                        series: [
                            {
                                name: '租金收入',
                                type: 'bar',
                                stack: 'total',
                                barWidth: '40%',
                                itemStyle: { color: '#4f46e5', borderRadius: [0, 0, 2, 2] },
                                data: [120, 132, 101, 134, 190, 230, 210]
                            },
                            {
                                name: '增值服务',
                                type: 'bar',
                                stack: 'total',
                                itemStyle: { color: '#a78bfa', borderRadius: [2, 2, 0, 0] },
                                data: [20, 25, 18, 22, 35, 45, 40]
                            }
                        ]
                    };
                    myChart.setOption(option);
                };

                onMounted(() => {
                    checkSnoozeStatus();
                    nextTick(() => {
                        initMapChart();
                        initUtilizationChart();
                        initRevenueChart();
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

        .chart-container {
            width: 100%;
            height: 300px;
        }

        .map-container {
            width: 100%;
            height: 400px;
        }
</style>
