<template>
            <main class="channel-ticket-detail-page">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <el-button plain @click="goBack">
                                <el-icon class="mr-1"><Back></Back></el-icon> 返回列表
                            </el-button>
                        </div>
                        <div class="flex items-center gap-3">
                            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">{{ currentBatch.name }}</h1>
                            <el-tag :type="getBatchStatusType(currentBatch.status)" effect="plain">{{ currentBatch.status }}</el-tag>
                        </div>
                        <p class="text-gray-500 text-sm mt-1">{{ currentBatch.batchNo }} ｜ 企业端只读查看，不支持新增、编辑、启停、导入或作废。</p>
                    </div>
                </div>

                <div class="grid grid-cols-5 gap-4 mb-6">
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">租車券总数</span>
                        <span class="card-value text-gray-800">{{ currentBatch.totalCount }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">{{ currentBatch.issueMode === 'LIST' ? '已发放' : '已领取' }}</span>
                        <span class="card-value text-emerald-600">{{ currentBatch.issuedCount }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">{{ currentBatch.issueMode === 'LIST' ? '待发放' : '未领取' }}</span>
                        <span class="card-value text-amber-500">{{ currentBatch.pendingIssueCount }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">已使用</span>
                        <span class="card-value text-theme-primary">{{ currentBatch.usedCount }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">已过期 / 作废</span>
                        <span class="card-value text-slate-500">{{ currentBatch.expiredCount + currentBatch.voidCount }}</span>
                    </div>
                </div>

                <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-bold text-gray-800">批次基础信息</h2>
                        <el-tag type="info" effect="plain">费用归属：{{ currentBatch.enterprise }}</el-tag>
                    </div>
                    <div class="detail-grid">
                        <div class="detail-label">批次编号</div>
                        <div>{{ currentBatch.batchNo }}</div>
                        <div class="detail-label">发券方式</div>
                        <div>{{ getIssueModeLabel(currentBatch.issueMode) }}</div>

                        <div class="detail-label">所属合作企业</div>
                        <div>{{ currentBatch.enterprise }}</div>
                        <div class="detail-label">适用服务</div>
                        <div>分时租赁 / 同站租还</div>

                        <div class="detail-label">适用据点类型</div>
                        <div>{{ currentBatch.stationTypes.join('、') }}</div>
                        <div class="detail-label">适用据点</div>
                        <div>{{ currentBatch.stations.join('、') }}</div>

                        <div class="detail-label">时间规则</div>
                        <div>固定取还车时间</div>
                        <div class="detail-label">固定时长模式</div>
                        <div>预留，未开放</div>

                        <div class="detail-label">固定取车时间</div>
                        <div>{{ currentBatch.pickupAt }}</div>
                        <div class="detail-label">固定还车时间</div>
                        <div>{{ currentBatch.returnAt }}</div>

                        <div class="detail-label">可用开始时间</div>
                        <div>{{ currentBatch.availableStartAt }}</div>
                        <div class="detail-label">可用结束时间</div>
                        <div>{{ currentBatch.availableEndAt }}</div>

                        <div class="detail-label">发放统计</div>
                        <div>{{ formatIssueSummary(currentBatch) }} / 失败 {{ currentBatch.issueFailedCount || 0 }}</div>
                        <div class="detail-label">使用统计</div>
                        <div>未使用 {{ currentBatch.unusedCount }} / 已使用 {{ currentBatch.usedCount }} / 已过期 {{ currentBatch.expiredCount }} / 已作废 {{ currentBatch.voidCount || 0 }}</div>
                    </div>
                </section>

                <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 class="text-lg font-bold text-gray-800">租車券列表</h2>
                            <p class="text-xs text-gray-500 mt-1">证件号码完整展示；不展示证件影像、驾驶证影像和支付记录等其他敏感信息。</p>
                        </div>
                        <el-button type="primary" plain title="导出 Excel：租車券列表 + 订单完整数据" @click="exportBatch">
                            <el-icon class="mr-1"><Download></Download></el-icon>导出
                        </el-button>
                    </div>
                    <el-table :data="currentBatch.codes" style="width: 100%" empty-text="该批次尚未导入名单或生成租車券">
                        <el-table-column prop="code" label="租車券编号" width="160"></el-table-column>
                        <el-table-column label="用券人信息" min-width="170">
                            <template #default="{ row }">
                                <div class="font-medium text-gray-800">{{ row.visitorName }}</div>
                                <div class="text-xs text-gray-500">{{ row.documentNo }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="发放 / 领取状态" width="130">
                            <template #default="{ row }">
                                <el-tag :type="getIssueStatusType(row.issueStatus)" effect="plain">{{ row.issueStatus }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="使用状态" width="110">
                            <template #default="{ row }">
                                <el-tag :type="getTicketStatusType(row.status)" effect="plain">{{ row.status }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="member" label="使用会员" min-width="170"></el-table-column>
                        <el-table-column label="订单号 / 状态" min-width="180">
                            <template #default="{ row }">
                                <template v-if="row.orderNo">
                                    <div class="font-medium text-gray-800">{{ row.orderNo }}</div>
                                    <div class="text-xs text-gray-500">{{ row.orderStatus }}</div>
                                </template>
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
                                    <div class="text-sm font-medium text-red-600">
                                        {{ row.overdueMinutes ? `逾时 ${row.overdueMinutes} 分钟` : (row.abnormalFeeLabel || '有异常费用') }}
                                    </div>
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
                        <el-table-column prop="usedAt" label="使用时间" width="150"></el-table-column>
                        <el-table-column label="操作" width="120" align="right" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link :disabled="!row.orderNo" @click="openOrder(row)">查看订单</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </section>

                <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-bold text-gray-800">批次操作记录</h2>
                        <span class="text-xs text-gray-500">企业端仅只读查看与本企业批次相关的操作记录</span>
                    </div>
                    <el-table :data="currentBatch.operationLogs" style="width: 100%" empty-text="暂无操作记录">
                        <el-table-column prop="time" label="时间" width="170"></el-table-column>
                        <el-table-column prop="type" label="操作类型" width="150"></el-table-column>
                        <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
                        <el-table-column prop="content" label="操作内容" min-width="240"></el-table-column>
                        <el-table-column prop="reason" label="原因 / 备注" min-width="220"></el-table-column>
                    </el-table>
                </section>
            </main>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const batches = [
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
                        issuedCount: 9,
                        pendingIssueCount: 3,
                        usedCount: 4,
                        expiredCount: 0,
                        voidCount: 1,
                        status: '启用',
                        codes: [
                            { code: 'KM-A0501-001', visitorName: '王志明', documentNo: 'A123456789', issueStatus: '已发放', status: '已使用', member: '王志明 A123456789', orderNo: 'TS-KM-20260501-0001', orderStatus: '已完成', settlementStatus: 'SETTLED', overdueMinutes: 0, abnormalFeeTotal: 0, usedAt: '2026-04-25 10:16' },
                            { code: 'KM-A0501-002', visitorName: '林雅婷', documentNo: 'B223456789', issueStatus: '已发放', status: '已使用', member: '林雅婷 B223456789', orderNo: 'TS-KM-20260501-0002', orderStatus: '已完成', settlementStatus: 'SETTLED', overdueMinutes: 42, abnormalFeeTotal: 480, usedAt: '2026-04-25 10:21' },
                            { code: 'KM-A0501-003', visitorName: '许家豪', documentNo: '110101199001011234', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-A0501-004', visitorName: '吴佳颖', documentNo: '110101199202022345', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-A0501-007', visitorName: '刘冠廷', documentNo: 'H223456789', issueStatus: '已发放', status: '已作废', member: '刘冠廷 H223456789', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-A0501-005', visitorName: '陈柏翰', documentNo: 'C123456789', issueStatus: '已发放', status: '已使用', member: '陈柏翰 C123456789', orderNo: 'TS-KM-20260501-0008', orderStatus: '用车中', settlementStatus: 'OVERDUE_IN_PROGRESS', overdueMinutes: 35, abnormalFeeTotal: null, usedAt: '2026-04-25 11:03' }
                        ],
                        operationLogs: [
                            { time: '2026-04-25 13:05', type: '作废租車券', operator: '营运端 Admin', content: '作废租車券 KM-A0501-007', reason: '名单证件号码填写错误，已改由新增租車券补发' },
                            { time: '2026-04-25 12:30', type: '导出租車券', operator: '企业端', content: '导出本批次 Excel（租車券列表、订单完整数据）', reason: '企业核对活动名单' },
                            { time: '2026-04-20 09:15', type: '创建批次', operator: '营运端 Admin', content: '创建租車券批次，共 12 张', reason: '金门 5 月 A 团活动' }
                        ]
                    },
                    {
                        id: 2,
                        batchNo: 'GT-KM-20260503-002',
                        name: '风狮爷员工眷属体验券',
                        enterprise: '金门风狮爷旅行社',
                        issueMode: 'QUANTITY',
                        stationTypes: ['一般预约开放'],
                        stations: ['山外车站停车场'],
                        pickupAt: '2026-05-03 13:30',
                        returnAt: '2026-05-03 19:30',
                        availableStartAt: '2026-04-25 00:00',
                        availableEndAt: '2026-05-03 19:30',
                        totalCount: 20,
                        issuedCount: 6,
                        pendingIssueCount: 14,
                        usedCount: 2,
                        expiredCount: 0,
                        voidCount: 0,
                        status: '停用',
                        codes: [
                            { code: 'KM-D0503-001', visitorName: '-', documentNo: '-', issueStatus: '已领取', status: '已使用', member: '陈冠宇 I123456789', orderNo: 'TS-KM-20260503-0021', orderStatus: '已完成', usedAt: '2026-04-28 09:20' },
                            { code: 'KM-D0503-002', visitorName: '-', documentNo: '-', issueStatus: '已领取', status: '未使用', member: '黄怡君 J223456789', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-D0503-003', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' }
                        ],
                        operationLogs: [
                            { time: '2026-05-01 09:30', type: '停用批次', operator: '营运端 Admin', content: '批次状态：启用 -> 停用', reason: '活动日期调整，暂停兑换和使用' },
                            { time: '2026-04-25 08:50', type: '创建批次', operator: '营运端 Admin', content: '创建数量生成批次，共 20 张', reason: '员工眷属体验活动' }
                        ]
                    },
                    {
                        id: 4,
                        batchNo: 'GT-KM-20260508-004',
                        name: '金门环岛假期待导入名单批次',
                        enterprise: '金门风狮爷旅行社',
                        issueMode: 'LIST',
                        stationTypes: ['旅行社团体专用'],
                        stations: ['金湖机场停车场'],
                        pickupAt: '2026-05-08 10:00',
                        returnAt: '2026-05-08 18:00',
                        availableStartAt: '2026-05-01 00:00',
                        availableEndAt: '2026-05-08 18:00',
                        totalCount: 0,
                        issuedCount: 0,
                        pendingIssueCount: 0,
                        usedCount: 0,
                        expiredCount: 0,
                        voidCount: 0,
                        status: '待导入名单',
                        codes: [],
                        operationLogs: [
                            { time: '2026-05-01 09:10', type: '创建批次', operator: '营运端 Admin', content: '保存名单发放批次，尚未导入用券人名单', reason: '合作企业名单尚未确认' }
                        ]
                    }
                ];

                const currentBatch = computed(() => {
                    const currentId = Number(route.query.id) || 1;
                    return batches.find(item => item.id === currentId) || batches[0];
                });

                const getIssueModeLabel = (mode) => mode === 'QUANTITY' ? '数量生成' : '名单发放';
                const formatIssueSummary = (batch) => {
                    if (batch.issueMode === 'QUANTITY') return `已领取 ${batch.issuedCount} / 未领取 ${batch.pendingIssueCount}`;
                    return `已发放 ${batch.issuedCount} / 待发放 ${batch.pendingIssueCount}`;
                };
                const getBatchStatusType = (status) => {
                    if (status === '启用') return 'success';
                    if (status === '待导入名单') return 'warning';
                    return 'info';
                };
                const getIssueStatusType = (status) => {
                    if (status === '已发放' || status === '已领取') return 'success';
                    if (status === '未领取') return 'info';
                    return 'warning';
                };
                const getTicketStatusType = (status) => {
                    if (status === '已使用') return 'success';
                    if (status === '已作废' || status === '已过期') return 'info';
                    return 'warning';
                };
                const goBack = () => {
                    router.push('/enterprise/channel-ticket-batches');
                };
                const exportBatch = () => {
                    ElMessage.success(`原型示意：导出 ${currentBatch.value.batchNo} Excel，包含租車券列表和订单完整数据两个 Sheet`);
                };
                const openOrder = (row) => {
                    ElMessage.info(`原型示意：打开订单详情 ${row.orderNo}`);
                };
</script>

<style scoped>
        .channel-ticket-detail-page {
            min-height: 100%;
        }

        .card-value {
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
        }

        .detail-grid {
            display: grid;
            grid-template-columns: 130px minmax(0, 1fr) 130px minmax(0, 1fr);
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
        }

        .detail-grid > div {
            min-height: 42px;
            padding: 11px 12px;
            border-right: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
            line-height: 20px;
        }

        .detail-label {
            background: #f8fafc;
            color: #64748b;
            font-weight: 600;
        }
</style>
