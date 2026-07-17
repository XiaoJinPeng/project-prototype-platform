<template>
    <main class="official-order-page">
        <PageHeader unstyled class="official-page-header" title="公务订单管理" description="管理公务车预约单，支持订单查询、状态跟踪及预约用车处理。" title-class="official-page-title" description-class="official-page-note">
            <template #actions><a href="javascript:void(0)" class="official-action-button" @click.prevent="goAddOrder">
                <el-icon>
                    <Plus />
                </el-icon>
                <span>新增订单</span>
            </a></template>
        </PageHeader>

        <div class="official-summary-panel">
            <div class="official-summary-head">
                <div class="official-summary-title">状态</div>
            </div>
            <div class="official-summary-grid">
                <button v-for="(item, index) in statusCards" :key="item.label" type="button"
                    class="official-summary-card" :class="{ 'is-active': statusActive === index }"
                    @click="statusActive = index">
                    <div class="official-summary-label">{{ item.label }}</div>
                    <div class="official-summary-count">{{ item.count }}</div>
                </button>
            </div>
        </div>

        <div class="official-filter-panel">
            <div class="official-filter-bar">
                <div class="official-filter-row">
                    <div class="official-filter-field official-filter-field--sm">
                        <el-input v-model="filters.orderNumber" clearable placeholder="订单号"></el-input>
                    </div>
                    <div class="official-filter-field official-filter-field--wide">
                        <el-input v-model="filters.keyword" clearable :prefix-icon="Search"
                            placeholder="姓名/Email/手机/身份" />
                    </div>
                    <div class="official-filter-field official-filter-field--compact">
                        <el-input v-model="filters.numberPlate" clearable placeholder="车牌号码"></el-input>
                    </div>
                    <div class="official-filter-field official-filter-field--status">
                        <el-select v-model="filters.orderProgress" clearable placeholder="状态">
                            <el-option v-for="item in orderProgressOptions" :key="item" :label="item"
                                :value="item"></el-option>
                        </el-select>
                    </div>
                    <div class="official-filter-field official-filter-field--date">
                        <el-date-picker v-model="filters.orderTime" type="datetimerange"
                            start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY/MM/DD HH:mm"
                            value-format="YYYY/MM/DD HH:mm:ss" />
                    </div>
                    <div class="official-filter-actions">
                        <el-button type="primary" plain class="official-more-filter-button" :icon="Filter"
                            @click="searchPanelExpanded = !searchPanelExpanded">
                            {{ searchPanelExpanded ? '收起筛选' : '更多筛选' }}
                        </el-button>
                        <el-button circle class="official-reset-button" :icon="Refresh"></el-button>
                        <el-button type="primary" plain class="official-export-button" :icon="Download">
                            汇出资料
                        </el-button>
                        <el-button circle class="official-column-button" :icon="Setting"></el-button>
                    </div>
                </div>
                <div v-show="searchPanelExpanded" class="official-advanced-panel">
                    <div class="official-advanced-grid">
                        <div class="official-advanced-control official-advanced-control--md">
                            <el-select v-model="filters.memberPlan" multiple collapse-tags
                                collapse-tags-tooltip placeholder="会员方案">
                                <el-option label="企业员工方案" value="enterprise"></el-option>
                                <el-option label="主管用车方案" value="manager"></el-option>
                            </el-select>
                        </div>
                        <div class="official-advanced-control official-advanced-control--date">
                            <el-date-picker v-model="filters.pickupTime" type="datetimerange"
                                start-placeholder="预约取车" end-placeholder="预约还车" />
                        </div>
                        <div class="official-advanced-control official-advanced-control--date">
                            <el-date-picker v-model="filters.actualPickupTime" type="datetimerange"
                                start-placeholder="实际取车" end-placeholder="实际取车" />
                        </div>
                        <div class="official-advanced-control official-advanced-control--date">
                            <el-date-picker v-model="filters.returnTime" type="datetimerange"
                                start-placeholder="预约还车" end-placeholder="预约还车" />
                        </div>
                        <div class="official-advanced-control official-advanced-control--date">
                            <el-date-picker v-model="filters.actualReturnTime" type="datetimerange"
                                start-placeholder="实际还车" end-placeholder="实际还车" />
                        </div>
                        <div class="official-advanced-control official-advanced-control--md">
                            <el-select v-model="filters.pickupSite" filterable clearable placeholder="取车据点">
                                <el-option label="八轮测试-宝龙用车点" value="baolong"></el-option>
                                <el-option label="八轮测试-启迪用车点" value="qidi"></el-option>
                            </el-select>
                        </div>
                        <div class="official-advanced-control official-advanced-control--md">
                            <el-select v-model="filters.actualPickupSite" filterable clearable
                                placeholder="实际取车点">
                                <el-option label="八轮测试-宝龙用车点" value="baolong"></el-option>
                                <el-option label="八轮测试-人工智能用车点" value="ai"></el-option>
                            </el-select>
                        </div>
                        <div class="official-advanced-control official-advanced-control--md">
                            <el-select v-model="filters.returnSite" filterable clearable placeholder="还车据点">
                                <el-option label="八轮测试-宝龙用车点" value="baolong"></el-option>
                                <el-option label="八轮测试-启迪用车点" value="qidi"></el-option>
                            </el-select>
                        </div>
                        <div class="official-advanced-control official-advanced-control--md">
                            <el-select v-model="filters.actualReturnSite" filterable clearable
                                placeholder="实际还车点">
                                <el-option label="八轮测试-宝龙用车点" value="baolong"></el-option>
                                <el-option label="八轮测试-人工智能用车点" value="ai"></el-option>
                            </el-select>
                        </div>
                        <div class="official-advanced-control official-advanced-control--xl">
                            <el-select v-model="filters.model" multiple collapse-tags clearable
                                placeholder="车型">
                                <el-option label="Toyota Corolla Cross" value="cross"></el-option>
                                <el-option label="Lexus ES 250" value="es250"></el-option>
                            </el-select>
                        </div>
                        <div class="official-advanced-control official-advanced-control--md">
                            <el-select v-model="filters.vehicleType" multiple collapse-tags clearable
                                placeholder="车辆类型">
                                <el-option label="轿车" value="sedan"></el-option>
                                <el-option label="SUV" value="suv"></el-option>
                            </el-select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="official-table-panel">
            <div class="table-scroll">
                <table class="official-order-table">
                    <thead>
                        <tr>
                            <th style="width: 190px;">订单号</th>
                            <th style="width: 160px;">用车人</th>
                            <th style="width: 180px;">车辆信息</th>
                            <th style="width: 190px;">预约取还车时间</th>
                            <th style="width: 190px;">实际取还车时间</th>
                            <th style="width: 210px;">预约取还车地点</th>
                            <th class="is-center" style="width: 110px;">状态</th>
                            <th style="width: 140px;">目的地</th>
                            <th class="is-center" style="width: 140px;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="row in orderRows" :key="row.orderNumber">
                            <td>
                                <div class="official-info-cell">
                                    <div class="official-info-primary official-info-link">
                                        {{ row.orderNumber }}
                                    </div>
                                    <div class="official-meta-value official-mono">{{ row.orderTime }}</div>
                                </div>
                            </td>
                            <td>
                                <div class="official-info-cell">
                                    <div class="official-info-primary">{{ row.userName }}</div>
                                    <div class="official-meta-value">{{ row.phone }}</div>
                                </div>
                            </td>
                            <td>
                                <div class="official-info-cell">
                                    <div class="official-info-primary">{{ row.carModel }}</div>
                                    <div class="official-mono">{{ row.numberPlate }}</div>
                                </div>
                            </td>
                            <td>
                                <div class="official-info-cell">
                                    <div class="official-meta-value official-mono">{{ row.pickupTime }}</div>
                                    <div class="official-meta-value official-mono">{{ row.returnTime }}</div>
                                </div>
                            </td>
                            <td>
                                <div class="official-info-cell">
                                    <div class="official-meta-value official-mono">{{ row.actualPickupTime }}</div>
                                    <div class="official-meta-value official-mono">{{ row.actualReturnTime }}</div>
                                </div>
                            </td>
                            <td>
                                <div class="official-info-cell">
                                    <div class="official-meta-value">{{ row.pickupSite }}</div>
                                    <div class="official-meta-value">{{ row.returnStation }}</div>
                                </div>
                            </td>
                            <td class="is-center">
                                <span class="tag" :class="row.statusType">{{ row.status }}</span>
                            </td>
                            <td>
                                <span class="official-meta-value">{{ row.customer }}</span>
                            </td>
                            <td class="is-center">
                                <div class="official-table-actions">
                                    <el-button type="primary" link size="small">详情</el-button>
                                    <el-button v-if="row.canEdit" type="primary" plain size="small">编辑</el-button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="official-table-bottom">
                <div class="official-table-bottom-text">共 18 条，每页 10 条</div>
                <el-pagination layout="prev, pager, next" :page-size="10" :total="18"
                    :current-page="1" />
            </div>
            </div>
    </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Search, Filter, Refresh, Download, Setting } from '@element-plus/icons-vue'
import { PageHeader } from '@/components/ui'

const router = useRouter();
const statusActive = ref(0);
const searchPanelExpanded = ref(false);
const filters = ref({
    orderNumber: '',
    keyword: '',
    numberPlate: '',
    orderProgress: '',
    orderTime: [],
    memberPlan: [],
    pickupTime: [],
    actualPickupTime: [],
    returnTime: [],
    actualReturnTime: [],
    pickupSite: '',
    actualPickupSite: '',
    returnSite: '',
    actualReturnSite: '',
    model: [],
    vehicleType: []
});

const statusCards = [
    { label: '全部', count: 18 },
    { label: '预约中', count: 5 },
    { label: '出租中', count: 3 },
    { label: '已完成', count: 7 },
    { label: '取消', count: 1 },
    { label: '预约被拒', count: 1 },
    { label: '待审批', count: 1 }
];

const orderProgressOptions = [
    '预约中', '取消申请中', '延时取车', '已取车', '逾时',
    '延时', '已完成', '未取车', '已取消', '预约被拒'
];

const orderRows = [
    {
        orderNumber: 'OFF-20260612001',
        orderTime: '2026/06/12 09:12',
        userName: '王怡君',
        phone: '0912-345-678',
        carModel: 'Toyota Corolla Cross',
        numberPlate: 'XLY-8008',
        pickupTime: '2026/06/13 09:00',
        returnTime: '2026/06/13 18:00',
        actualPickupTime: '-',
        actualReturnTime: '-',
        pickupSite: '八轮测试-宝龙用车点',
        returnStation: '八轮测试-宝龙用车点',
        status: '预约中',
        statusType: 'tag-warning',
        customer: '客户拜访',
        canEdit: true
    },
    {
        orderNumber: 'OFF-20260611018',
        orderTime: '2026/06/11 16:35',
        userName: '陈建宏',
        phone: '0988-120-776',
        carModel: 'Lexus ES 250',
        numberPlate: 'XLY-8001',
        pickupTime: '2026/06/12 08:30',
        returnTime: '2026/06/12 20:00',
        actualPickupTime: '2026/06/12 08:41',
        actualReturnTime: '-',
        pickupSite: '八轮测试-宝龙用车点',
        returnStation: '八轮测试-启迪用车点',
        status: '已取车',
        statusType: 'tag-primary',
        customer: '跨区会议',
        canEdit: true
    },
    {
        orderNumber: 'OFF-20260610009',
        orderTime: '2026/06/10 10:08',
        userName: '林雅婷',
        phone: '0922-886-301',
        carModel: 'Toyota Camry',
        numberPlate: 'XLY-8004',
        pickupTime: '2026/06/10 13:00',
        returnTime: '2026/06/10 17:00',
        actualPickupTime: '2026/06/10 12:56',
        actualReturnTime: '2026/06/10 16:48',
        pickupSite: '八轮测试-启迪用车点',
        returnStation: '八轮测试-启迪用车点',
        status: '已完成',
        statusType: 'tag-success',
        customer: '行政事务',
        canEdit: false
    },
    {
        orderNumber: 'OFF-20260609027',
        orderTime: '2026/06/09 14:44',
        userName: '张志明',
        phone: '0935-768-220',
        carModel: 'Nissan X-Trail',
        numberPlate: 'XLY-8007',
        pickupTime: '2026/06/10 09:30',
        returnTime: '2026/06/10 18:30',
        actualPickupTime: '-',
        actualReturnTime: '-',
        pickupSite: '八轮测试-人工智能用车点',
        returnStation: '八轮测试-人工智能用车点',
        status: '预约被拒',
        statusType: 'tag-danger',
        customer: '外勤支援',
        canEdit: false
    },
    {
        orderNumber: 'OFF-20260608014',
        orderTime: '2026/06/08 11:20',
        userName: '黄柏翰',
        phone: '0900-668-321',
        carModel: 'Honda CR-V',
        numberPlate: 'XLY-8010',
        pickupTime: '2026/06/09 10:00',
        returnTime: '2026/06/09 15:00',
        actualPickupTime: '-',
        actualReturnTime: '-',
        pickupSite: '八轮测试-启迪用车点',
        returnStation: '八轮测试-宝龙用车点',
        status: '待审批',
        statusType: 'tag-info',
        customer: '主管审批',
        canEdit: true
    }
];

const goAddOrder = () => {
    router.push('/enterprise/official-order-add');
};
</script>

<style scoped>
.official-order-page {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    background: transparent;
}

.official-page-header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
}

.official-page-title {
    margin: 0;
    color: #1f2937;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
    letter-spacing: 0;
}

.official-page-note {
    margin: 4px 0 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 20px;
}

.official-action-button {
    display: inline-flex;
    height: 40px;
    padding: 0 16px;
    align-items: center;
    gap: 6px;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    background: var(--app-color-primary);
    border: 1px solid var(--app-color-primary);
    border-radius: 6px;
    box-shadow: 0 8px 16px rgb(var(--app-color-primary-rgb) / 16%);
    cursor: pointer;
    text-decoration: none;
    transition: border-color 0.18s ease, background-color 0.18s ease;
}

.official-action-button:hover {
    background: var(--app-color-primary-hover);
    border-color: var(--app-color-primary-hover);
}

.official-summary-panel {
    padding: 12px;
    flex-shrink: 0;
    margin-bottom: 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.official-summary-head {
    display: flex;
    margin-bottom: 12px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.official-summary-title {
    color: #374151;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
}

.official-summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(128px, 1fr));
    gap: 8px;
}

.official-summary-card {
    display: flex;
    min-width: 0;
    height: 62px;
    padding: 8px 12px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    text-align: left;
    background: #fff;
    border: 1px solid #f3f4f6;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.16s ease, border-color 0.16s ease;
}

.official-summary-card:hover,
.official-summary-card.is-active {
    background: #f0f9ff;
    border-color: var(--app-color-primary);
}

.official-summary-label {
    overflow: hidden;
    width: 100%;
    color: #6b7280;
    font-size: 12px;
    line-height: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.official-summary-count {
    margin-top: 4px;
    color: #111827;
    font-size: 20px;
    font-weight: 700;
    line-height: 24px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.official-summary-card.is-active .official-summary-count {
    color: var(--app-color-primary);
}

.official-filter-panel {
    --el-component-size: 32px;
    --el-component-size-large: 32px;
    --el-border-radius-base: 4px;
    --el-border-radius-small: 4px;
    margin-bottom: 16px;
    flex-shrink: 0;
}

.official-filter-bar {
    padding: 16px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
}

.official-filter-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
}

.official-filter-field {
    display: flex;
    width: 220px;
    min-width: 220px;
    align-items: center;
}

.official-filter-field--wide {
    width: 280px;
    min-width: 280px;
}

.official-filter-field--compact {
    width: 140px;
    min-width: 140px;
}

.official-filter-field--sm {
    width: 160px;
    min-width: 160px;
}

.official-filter-field--status {
    width: 180px;
    min-width: 180px;
}

.official-filter-field--date,
.official-advanced-control--date {
    width: 260px;
    min-width: 260px;
}

.official-filter-actions {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: nowrap;
    gap: 10px;
    align-items: center;
    justify-content: flex-end;
    margin-left: auto;
    white-space: nowrap;
}

.official-filter-actions :deep(.el-button) {
    margin-left: 0;
}

.official-filter-row :deep(.el-button) {
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    line-height: 1;
}

.official-filter-row :deep(.el-button.is-circle) {
    width: 32px;
    height: 32px;
    padding: 0;
}

.official-more-filter-button,
.official-export-button {
    min-width: 96px;
}

.official-advanced-panel {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #f3f4f6;
}

.official-advanced-grid {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 16px;
}

.official-advanced-control {
    flex: 0 0 auto;
}

.official-advanced-control--md {
    width: 140px;
}

.official-advanced-control--xl {
    width: 160px;
}

.official-filter-panel :deep(.el-input__wrapper),
.official-filter-panel :deep(.el-select__wrapper),
.official-filter-panel :deep(.el-date-editor.el-input__wrapper) {
    min-height: 32px;
    border-radius: 4px;
}

.official-filter-panel :deep(.el-select),
.official-filter-panel :deep(.el-date-editor) {
    width: 100%;
}

.official-filter-panel :deep(.el-input__inner),
.official-filter-panel :deep(.el-select__selected-item),
.official-filter-panel :deep(.el-select__placeholder),
.official-filter-panel :deep(.el-range-input) {
    color: #111827;
    font-size: 14px;
}

.official-table-panel {
    display: flex;
    flex-direction: column;
    min-height: 200px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
    overflow: hidden;
}

.official-order-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    color: #111827;
    font-size: 13px;
}

.official-order-table th {
    height: 44px;
    padding: 0 12px;
    color: #4b5563;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    text-align: left;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
}

.official-order-table td {
    padding: 10px 12px;
    vertical-align: top;
    border-bottom: 1px solid #eef2f7;
    background: #fff;
}

.official-order-table tr:nth-child(even) td {
    background: #fcfcfd;
}

.official-order-table tr:hover td {
    background: #f8fafc;
}

.official-order-table .is-center {
    text-align: center;
}

.official-info-cell {
    display: flex;
    min-width: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 3px;
    color: #374151;
    font-size: 13px;
    line-height: 17px;
    text-align: left;
}

.official-info-primary {
    max-width: 100%;
    overflow-wrap: anywhere;
    color: #1f2937;
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
}

.official-info-link {
    color: var(--app-color-primary);
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

.official-meta-value {
    min-width: 0;
    color: #374151;
    font-size: 13px;
    line-height: 17px;
    overflow-wrap: anywhere;
}

.official-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
    font-variant-numeric: tabular-nums;
}

.official-table-actions {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    gap: 4px;
}

.official-table-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    min-height: 56px;
    padding: 16px;
    border-top: 1px solid #f3f4f6;
}

.official-table-bottom-text {
    color: #6b7280;
    font-size: 13px;
}

.table-scroll {
    overflow-x: auto;
}

.tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 58px;
    height: 24px;
    padding: 0 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid transparent;
}

.tag-warning {
    color: #b45309;
    background: #fffbeb;
    border-color: #fde68a;
}

.tag-primary {
    color: #0369a1;
    background: #eff6ff;
    border-color: #bfdbfe;
}

.tag-success {
    color: #047857;
    background: #ecfdf5;
    border-color: #a7f3d0;
}

.tag-danger {
    color: #be123c;
    background: #fff1f2;
    border-color: #fecdd3;
}

.tag-info {
    color: #475569;
    background: #f8fafc;
    border-color: #e2e8f0;
}

@media (max-width: 1280px) {
    .official-filter-actions {
        width: 100%;
        justify-content: flex-start;
        margin-left: 0;
    }
}

@media (max-width: 768px) {
    .official-page-header {
        flex-direction: column;
        align-items: flex-start;
    }

    .official-filter-field,
    .official-filter-field--sm,
    .official-filter-field--wide,
    .official-filter-field--compact,
    .official-filter-field--status,
    .official-filter-field--date,
    .official-advanced-control,
    .official-advanced-control--md,
    .official-advanced-control--xl,
    .official-advanced-control--date {
        width: 100%;
        min-width: 100%;
    }

    .official-filter-actions {
        width: 100%;
    }
}
</style>
