<template>
            <main class="car-control-page">
                    <PageHeader unstyled class="car-control-page__header" title="排程表" description="可视化管理车辆排班、调度与冲突处理。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                        <template #actions>
                            <el-button-group class="shadow-sm">
                                <el-button :type="viewMode === 'day' ? 'primary' : 'default'" @click="viewMode = 'day'">日</el-button>
                                <el-button :type="viewMode === 'week' ? 'primary' : 'default'" @click="viewMode = 'week'">周</el-button>
                                <el-button :type="viewMode === 'month' ? 'primary' : 'default'" @click="viewMode = 'month'">月</el-button>
                            </el-button-group>
                            <el-date-picker v-model="selectedWeek" type="week" format="YYYY 第 ww 周" placeholder="选择周" style="width: 170px"></el-date-picker>
                        </template>
                    </PageHeader><div class="car-control-page__filter-wrap">
                        <div class="car-control-page__filter-bar">
                            <div class="car-control-page__filter-left">
                                <span class="car-control-page__filter-label">筛选:</span>
                                <div class="car-control-page__filter-field car-control-page__filter-field--lg">
                                    <el-select v-model="filters.station" clearable placeholder="据点">
                                        <el-option label="八轮测试-宝龙用车点" value="baolong"></el-option>
                                        <el-option label="八轮测试-启迪用车点" value="qidi"></el-option>
                                        <el-option label="八轮测试-人工智能用车点" value="ai"></el-option>
                                    </el-select>
                                </div>
                                <div class="car-control-page__filter-field car-control-page__filter-field--sm">
                                    <el-select v-model="filters.model" clearable placeholder="车型">
                                        <el-option label="Toyota" value="toyota"></el-option>
                                        <el-option label="Lexus" value="lexus"></el-option>
                                        <el-option label="Honda" value="honda"></el-option>
                                    </el-select>
                                </div>
                                <div class="car-control-page__filter-field car-control-page__filter-field--sm">
                                    <el-select v-model="filters.type" clearable placeholder="车辆类型">
                                        <el-option label="公务车" value="official"></el-option>
                                        <el-option label="商务车" value="business"></el-option>
                                    </el-select>
                                </div>
                                <div class="car-control-page__filter-field car-control-page__filter-field--sm">
                                    <el-input v-model="filters.plate" clearable placeholder="车牌号"></el-input>
                                </div>
                                <el-tooltip content="重置" placement="top">
                                    <el-button circle @click="refreshHandel">
                                        <el-icon><Refresh></Refresh></el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>

                            <div class="car-control-page__legend">
                                <span v-for="item in legends" :key="item.name" class="inline-flex items-center">
                                    <i class="legend-dot" :style="{ background: item.color }"></i>{{ item.name }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="car-control-page__board-wrap">
                        <div class="car-control-page__board custom-scroll">
                            <div class="car-control-page__board-inner">
                                <div class="gantt-grid">
                                    <div class="gantt-cell gantt-header">车辆</div>
                                    <div v-for="date in gridDates" :key="date.day" class="gantt-cell gantt-header">
                                        <div class="text-center">
                                            <div>{{ date.day }}</div>
                                            <div class="mt-0.5 text-[11px] font-medium text-gray-400">{{ date.week }}</div>
                                        </div>
                                    </div>

                                    <template v-for="row in dispatchRows" :key="row.plate">
                                        <div class="gantt-cell resource-cell">
                                            <div class="resource-name">{{ row.plate }}</div>
                                            <div class="resource-meta">{{ row.model }}</div>
                                            <div class="resource-meta">{{ row.station }}</div>
                                        </div>
                                        <div v-for="(cell, index) in row.cells" :key="row.plate + '-' + index" class="gantt-cell schedule-cell">
                                            <div v-if="cell" class="gantt-bar" :style="{ background: cell.bg, borderColor: cell.border }">
                                                <div class="gantt-bar__title">{{ cell.title }}</div>
                                                <div class="gantt-bar__meta">{{ cell.time }}</div>
                                            </div>
                                            <div v-else class="empty-slot"></div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
            </main>
</template>

<script setup>
import { ref, reactive } from "vue";
import { PageHeader } from '@/components/ui';

const currentUserRole = ref('HEADQUARTERS');
                const viewMode = ref('week');
                const selectedWeek = ref('');
                const filters = reactive({
                    station: '',
                    model: '',
                    type: '',
                    plate: ''
                });
                const legends = [
                    { name: '全部', color: '#cbd5e1' },
                    { name: '预约中', color: '#dbeafe' },
                    { name: '用车中', color: '#fef3c7' },
                    { name: '已还车', color: '#dcfce7' },
                    { name: '调度', color: '#e0f2fe' }
                ];
                const gridDates = [
                    { day: '06/10', week: '周三' },
                    { day: '06/11', week: '周四' },
                    { day: '06/12', week: '周五' },
                    { day: '06/13', week: '周六' },
                    { day: '06/14', week: '周日' },
                    { day: '06/15', week: '周一' },
                    { day: '06/16', week: '周二' }
                ];
                const dispatchRows = [
                    {
                        plate: 'XLY-8008',
                        model: 'Toyota Corolla Cross',
                        station: '八轮测试-宝龙用车点',
                        cells: [
                            { title: '王怡君', time: '09:00 - 18:00', bg: '#DBEAFE', border: '#60A5FA' },
                            null,
                            { title: '客户拜访', time: '10:00 - 15:30', bg: '#FEF3C7', border: '#F59E0B' },
                            null,
                            null,
                            { title: '跨区调度', time: '14:00 - 18:00', bg: '#E0F2FE', border: '#38BDF8' },
                            null
                        ]
                    },
                    {
                        plate: 'XLY-8001',
                        model: 'Lexus ES 250',
                        station: '八轮测试-启迪用车点',
                        cells: [
                            null,
                            { title: '陈建宏', time: '08:30 - 20:00', bg: '#FEF3C7', border: '#F59E0B' },
                            null,
                            { title: '会议接送', time: '13:00 - 17:00', bg: '#DCFCE7', border: '#22C55E' },
                            null,
                            null,
                            null
                        ]
                    },
                    {
                        plate: 'XLY-8004',
                        model: 'Toyota Camry',
                        station: '八轮测试-宝龙用车点',
                        cells: [
                            null,
                            null,
                            { title: '林雅婷', time: '13:00 - 17:00', bg: '#DBEAFE', border: '#60A5FA' },
                            null,
                            { title: '主管审批', time: '10:00 - 15:00', bg: '#E0F2FE', border: '#38BDF8' },
                            null,
                            null
                        ]
                    },
                    {
                        plate: 'XLY-8010',
                        model: 'Honda CR-V',
                        station: '八轮测试-人工智能用车点',
                        cells: [
                            null,
                            { title: '黄柏翰', time: '10:00 - 15:00', bg: '#DBEAFE', border: '#60A5FA' },
                            null,
                            null,
                            { title: '跨区调度', time: '14:00 - 18:00', bg: '#E0F2FE', border: '#38BDF8' },
                            null,
                            null
                        ]
                    }
                ];
                const refreshHandel = () => {
                    filters.station = '';
                    filters.model = '';
                    filters.type = '';
                    filters.plate = '';
                };
</script>

<style scoped>
        .car-control-page {
            min-height: 100%;
            background: transparent;
        }

        .car-control-page__header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 16px;
            padding-bottom: 8px;
        }

        .car-control-page__filter-wrap {
            padding-top: 4px;
            padding-bottom: 4px;
        }

        .car-control-page__filter-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 16px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
        }

        .car-control-page__filter-left {
            display: flex;
            align-items: center;
            gap: 16px;
            min-width: 0;
            padding-left: 8px;
        }

        .car-control-page__filter-label {
            color: #6b7280;
            font-size: 14px;
            line-height: 20px;
            white-space: nowrap;
        }

        .car-control-page__filter-field {
            flex: 0 0 auto;
        }

        .car-control-page__filter-field--lg {
            width: 220px;
        }

        .car-control-page__filter-field--sm {
            width: 140px;
        }

        .car-control-page__legend {
            display: flex;
            align-items: center;
            gap: 16px;
            padding-right: 8px;
            color: #6b7280;
            font-size: 13px;
            line-height: 16px;
            white-space: nowrap;
        }

        .legend-dot {
            width: 10px;
            height: 10px;
            border-radius: 9999px;
            display: inline-block;
            margin-right: 6px;
            box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
        }

        .car-control-page__board-wrap {
            display: flex;
            flex: 1;
            min-height: 0;
            flex-direction: column;
            padding-bottom: 24px;
        }

        .car-control-page__board {
            flex: 1;
            overflow: auto;
            width: 100%;
            margin-top: 8px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
        }

        .car-control-page__board-inner {
            width: max-content;
            min-width: 100%;
        }

        .gantt-grid {
            display: grid;
            width: max-content;
            min-width: 100%;
            grid-template-columns: 220px repeat(7, minmax(150px, 1fr));
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
        }

        .gantt-cell {
            min-height: 50px;
            border-right: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
        }

        .gantt-header {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 50px;
            background: #f9fafb;
            color: #374151;
            font-size: 13px;
            font-weight: 700;
        }

        .resource-cell {
            min-height: 66px;
            padding: 10px 14px;
            background: #fff;
        }

        .resource-name {
            color: #111827;
            font-size: 13px;
            font-weight: 700;
            line-height: 18px;
        }

        .resource-meta {
            margin-top: 3px;
            color: #6b7280;
            font-size: 12px;
            line-height: 16px;
        }

        .schedule-cell {
            position: relative;
            min-height: 66px;
            padding: 8px;
            background-image: linear-gradient(90deg, transparent calc(50% - 0.5px), #eef2f7 calc(50% - 0.5px), #eef2f7 calc(50% + 0.5px), transparent calc(50% + 0.5px));
        }

        .gantt-bar {
            min-height: 44px;
            padding: 7px 10px;
            border-left: 3px solid;
            border-radius: 6px;
            box-shadow: 0 1px 2px rgb(15 23 42 / 7%);
        }

        .gantt-bar__title {
            color: #111827;
            font-size: 13px;
            font-weight: 700;
            line-height: 16px;
        }

        .gantt-bar__meta {
            margin-top: 3px;
            color: #4b5563;
            font-size: 12px;
            line-height: 15px;
        }

        .empty-slot {
            min-height: 44px;
            border-radius: 6px;
            background: repeating-linear-gradient(135deg, #f8fafc, #f8fafc 6px, #f1f5f9 6px, #f1f5f9 12px);
            opacity: 0.45;
        }

        .car-control-page :deep(.el-input__wrapper),
        .car-control-page :deep(.el-select__wrapper) {
            min-height: 32px;
            border-radius: 6px;
        }

        .car-control-page :deep(.el-button.is-circle) {
            width: 32px;
            height: 32px;
        }

        .car-control-page :deep(.el-button-group .el-button) {
            height: 32px;
            padding: 0 14px;
            font-size: 13px;
        }

        @media (max-width: 1280px) {
            .car-control-page__header,
            .car-control-page__filter-bar {
                flex-direction: column;
                align-items: stretch;
            }

            .car-control-page__filter-left,
            .car-control-page__legend {
                flex-wrap: wrap;
                padding-right: 0;
                padding-left: 0;
            }
        }

        @media (max-width: 768px) {
            .car-control-page__filter-field--lg,
            .car-control-page__filter-field--sm {
                width: 100%;
            }

            .car-control-page__filter-left {
                gap: 12px;
            }
        }
</style>
