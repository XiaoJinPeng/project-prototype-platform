<template>
<div class="channel-ticket-detail-page min-w-0">
            

            <main>
                <div class="mb-5 flex items-start justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-3">
                            <el-button plain @click="goBack">
                                <el-icon class="mr-1"><Back></Back></el-icon>返回列表
                            </el-button>
                        </div>
                        <div class="flex items-center gap-3 mt-4">
                            <h1 class="text-2xl font-bold text-gray-900">{{ currentBatch.name }}</h1>
                            <el-tag :type="currentBatch.status === '启用' ? 'success' : (currentBatch.status === '待导入名单' ? 'warning' : 'info')" effect="plain">{{ currentBatch.status }}</el-tag>
                            <el-tag type="info" effect="plain">{{ getIssueModeLabel(currentBatch.issueMode) }}</el-tag>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">{{ currentBatch.batchNo }}｜{{ currentBatch.enterprise }}｜分时租赁 / 同站租还</p>
                    </div>
                    <div class="flex flex-wrap justify-end gap-2">
                        <el-button plain @click="openStatusDialog">
                            {{ nextStatus }}批次
                        </el-button>
                        <el-button plain @click="editBatchMock">编辑批次</el-button>
                    </div>
                </div>

                <div class="grid grid-cols-5 gap-4 mb-5">
                    <div class="stat-card">
                        <div class="text-xs text-gray-500">租車券总数</div>
                        <div class="text-2xl font-bold text-gray-900 mt-2">{{ currentBatch.totalCount }}</div>
                    </div>
                    <div class="stat-card">
                        <div class="text-xs text-gray-500">{{ currentBatch.issueMode === 'QUANTITY' ? '已领取' : '已发放' }}</div>
                        <div class="text-2xl font-bold text-emerald-600 mt-2">{{ currentBatch.issuedCount }}</div>
                    </div>
                    <div class="stat-card">
                        <div class="text-xs text-gray-500">{{ currentBatch.issueMode === 'QUANTITY' ? '未领取' : '待发放' }}</div>
                        <div class="text-2xl font-bold text-amber-600 mt-2">{{ currentBatch.pendingIssueCount }}</div>
                    </div>
                    <div class="stat-card">
                        <div class="text-xs text-gray-500">已使用</div>
                        <div class="text-2xl font-bold text-theme-primary mt-2">{{ currentBatch.usedCount }}</div>
                    </div>
                    <div class="stat-card">
                        <div class="text-xs text-gray-500">已过期</div>
                        <div class="text-2xl font-bold text-gray-500 mt-2">{{ currentBatch.expiredCount }}</div>
                    </div>
                </div>

                <section class="section-card p-5 mb-5">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-bold text-gray-900">批次基础信息</h2>
                        <span class="text-xs text-gray-500">新增租車券会继承本批次固定条件</span>
                    </div>
                    <table class="info-table">
                        <tbody>
                            <tr>
                                <th>批次编号</th>
                                <td>{{ currentBatch.batchNo }}</td>
                                <th>发券方式</th>
                                <td>{{ getIssueModeLabel(currentBatch.issueMode) }}</td>
                            </tr>
                            <tr>
                                <th>所属合作企业</th>
                                <td>{{ currentBatch.enterprise }}</td>
                                <th>适用服务</th>
                                <td>分时租赁 / 同站租还</td>
                            </tr>
                            <tr>
                                <th>适用据点类型</th>
                                <td>{{ formatStationTypeRange(currentBatch) }}</td>
                                <th>适用据点</th>
                                <td>{{ formatStationRange(currentBatch) }}</td>
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
                                <th>发放统计</th>
                                <td>{{ formatIssueSummary(currentBatch) }} / 失败 {{ currentBatch.issueFailedCount }}</td>
                                <th>使用统计</th>
                                <td>未使用 {{ currentBatch.unusedCount }} / 已使用 {{ currentBatch.usedCount }} / 已过期 {{ currentBatch.expiredCount }} / 已作废 {{ currentBatch.voidCount || 0 }}</td>
                            </tr>
                        </tbody>
                    </table>
                </section>

                <section class="section-card p-5 mb-5">
                    <div class="flex items-center justify-between gap-4">
                        <div>
                            <h2 class="text-lg font-bold text-gray-900">车辆库存提醒</h2>
                            <p class="text-sm text-gray-500 mt-1">仅供建批和补发参考，不锁车、不阻止保存。</p>
                        </div>
                        <el-tag :type="capacityInfo.sufficient ? 'success' : 'warning'" effect="plain">{{ capacityInfo.sufficient ? '库存足够' : '车辆可能不足' }}</el-tag>
                    </div>
                    <div class="grid grid-cols-4 gap-4 mt-4">
                        <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <div class="text-xs text-gray-500">适用据点车辆</div>
                            <div class="text-xl font-bold text-gray-900 mt-1">{{ capacityInfo.vehicleCount }} 台</div>
                        </div>
                        <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <div class="text-xs text-gray-500">时间重复批次</div>
                            <div class="text-xl font-bold text-gray-900 mt-1">{{ capacityInfo.overlapCount }} 批</div>
                        </div>
                        <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <div class="text-xs text-gray-500">重复批次占用</div>
                            <div class="text-xl font-bold text-gray-900 mt-1">{{ capacityInfo.overlapDemand }} 名</div>
                        </div>
                        <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
                            <div class="text-xs text-gray-500">本批次加入后</div>
                            <div class="text-xl font-bold text-gray-900 mt-1">{{ capacityInfo.totalDemand }} 名</div>
                        </div>
                    </div>
                </section>

                <section class="section-card p-5 mb-5">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h2 class="text-lg font-bold text-gray-900">租車券列表</h2>
                            <p class="text-sm text-gray-500 mt-1">创建订单即已使用；订单取消后未过期前恢复未使用，可重新预约。作废为时间充裕时开发的可选能力。</p>
                        </div>
                        <div class="flex gap-2">
                            <el-button v-if="currentBatch.issueMode === 'LIST'" type="primary" plain @click="openAppendListDialog">
                                <el-icon class="mr-1"><Upload></Upload></el-icon>导入/追加名单
                            </el-button>
                            <el-button type="primary" plain @click="openAddTicketDialog">
                                <el-icon class="mr-1"><Plus></Plus></el-icon>新增租車券
                            </el-button>
                            <el-button type="primary" plain title="导出 Excel：租車券列表 + 订单完整数据" @click="exportCodesMock">
                                <el-icon class="mr-1"><Download></Download></el-icon>导出
                            </el-button>
                        </div>
                    </div>
                    <el-table :data="currentBatch.codes" border>
                        <el-table-column prop="code" label="租車券编号" min-width="150"></el-table-column>
                        <el-table-column label="用券人信息" min-width="150">
                            <template #default="{ row }">
                                <div v-if="row.visitorName && row.visitorName !== '-'" class="text-sm text-gray-900">{{ row.visitorName }}</div>
                                <div v-if="row.documentNo && row.documentNo !== '-'" class="text-xs text-gray-500">{{ row.documentNo }}</div>
                                <span v-if="!row.visitorName || row.visitorName === '-'" class="text-gray-400">-</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="发放状态" width="110">
                            <template #default="{ row }">
                                <el-tag :type="getIssueStatusType(row.issueStatus)" effect="plain">{{ row.issueStatus }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="使用状态" width="110">
                            <template #default="{ row }">
                                <el-tag :type="getTicketStatusType(row.status)" effect="plain">{{ row.status }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="member" label="使用会员" min-width="145"></el-table-column>
                        <el-table-column label="订单号 / 状态" min-width="170">
                            <template #default="{ row }">
                                <div v-if="row.orderNo" class="space-y-1">
                                    <div class="font-medium text-gray-900 break-all">{{ row.orderNo }}</div>
                                    <el-tag size="small" :type="getOrderStatusType(row.orderStatus)" effect="plain">{{ row.orderStatus || '订单已建立' }}</el-tag>
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
                        <el-table-column prop="usedAt" label="使用时间" min-width="140"></el-table-column>
                        <el-table-column label="操作" width="170" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link :disabled="!row.orderNo" @click="openOrder(row)">查看订单</el-button>
                                <el-tooltip :content="canVoidTicket(row) ? '作废后不可恢复，需要填写原因' : '仅未使用且无有效订单占用的租車券可作废'" placement="top">
                                    <el-button type="danger" link :disabled="!canVoidTicket(row)" @click="openVoidTicketDialog(row)">作废</el-button>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table>
                </section>

                <section class="section-card p-5">
                    <div class="flex items-center justify-between mb-4">
                        <h2 class="text-lg font-bold text-gray-900">操作记录</h2>
                        <span class="text-xs text-gray-500">启用、停用、新增租車券、作废、导出等关键操作都需要记录原因或备注。</span>
                    </div>
                    <el-table :data="currentBatch.operationLogs" border>
                        <el-table-column prop="time" label="操作时间" width="170"></el-table-column>
                        <el-table-column prop="type" label="操作类型" width="130"></el-table-column>
                        <el-table-column prop="operator" label="操作人" width="110"></el-table-column>
                        <el-table-column prop="content" label="操作内容" min-width="260"></el-table-column>
                        <el-table-column prop="reason" label="原因 / 备注" min-width="260"></el-table-column>
                    </el-table>
                </section>
            </main>
        </div>

        <el-dialog v-model="addTicketDialogVisible" title="新增租車券" width="560px">
            <div class="space-y-4">
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
                            <div class="mt-1 text-xs text-gray-500">可填写身份证或入台证号码，不选择证件类型。同一批次证件号码不得重复。</div>
                        </el-form-item>
                    </template>
                    <template v-else>
                        <el-form-item label="新增数量" required>
                            <el-input-number v-model="addTicketForm.count" :min="1" :max="99" controls-position="right"></el-input-number>
                            <div class="mt-1 text-xs text-gray-500">保存后生成对应数量的租車券和兑换码，初始状态为未领取。</div>
                        </el-form-item>
                    </template>
                    <el-form-item label="新增原因" required>
                        <el-input v-model="addTicketForm.reason" type="textarea" :rows="3" placeholder="例如：名单遗漏、活动临时加名额、现场补发"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="addTicketDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveAddTicketMock">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="appendListDialogVisible" title="导入 / 追加用券人名单" width="680px">
            <div class="space-y-4">
                <div class="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                    名单发放批次只支持追加导入，不覆盖原名单和已生成租車券。导入成功后按有效名单行新增租車券，并写入操作记录。
                </div>
                <el-form label-width="110px">
                    <el-form-item label="当前批次">
                        <div class="text-sm text-gray-900">{{ currentBatch.name }}</div>
                    </el-form-item>
                    <el-form-item label="导入原因" required>
                        <el-input v-model="appendListForm.reason" type="textarea" :rows="3" placeholder="例如：合作企业补名单、现场追加名额、首次导入名单"></el-input>
                    </el-form-item>
                    <el-form-item label="名单文件">
                        <div class="w-full rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <div class="text-sm font-semibold text-gray-900">用券人名单模板</div>
                                    <div class="text-xs text-gray-500 mt-1">字段：用券人姓名、证件号码，不包含证件类型。证件号码不得与本次文件或当前批次已有名单重复。</div>
                                </div>
                                <div class="flex gap-2">
                                    <el-button size="small" plain @click="downloadAppendTemplateMock">下载模板</el-button>
                                    <el-button size="small" type="primary" plain @click="previewAppendImportMock(false)">模拟成功导入</el-button>
                                    <el-button size="small" type="danger" plain @click="previewAppendImportMock(true)">模拟异常</el-button>
                                </div>
                            </div>
                        </div>
                    </el-form-item>
                </el-form>
                <div v-if="appendImportPreviewReady" class="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <el-alert                         :title="appendImportSummary.status === 'success' ? '导入成功' : '导入异常'"
                        :type="appendImportSummary.status === 'success' ? 'success' : 'error'"
                        :closable="false"
                        show-icon>
                        <template #default>{{ appendImportSummary.message }}</template>
                    </el-alert>
                    <div v-if="appendImportSummary.status === 'success'" class="grid grid-cols-3 gap-3 mt-3 text-sm">
                        <div class="rounded bg-white border border-blue-100 p-3">
                            <div class="text-xs text-gray-500">本次名单行数</div>
                            <div class="font-semibold text-gray-900">{{ appendImportSummary.total }} 行</div>
                        </div>
                        <div class="rounded bg-white border border-blue-100 p-3">
                            <div class="text-xs text-gray-500">已匹配会员</div>
                            <div class="font-semibold text-emerald-700">{{ appendImportSummary.matched }} 行</div>
                        </div>
                        <div class="rounded bg-white border border-blue-100 p-3">
                            <div class="text-xs text-gray-500">待匹配会员</div>
                            <div class="font-semibold text-amber-700">{{ appendImportSummary.pending }} 行</div>
                        </div>
                    </div>
                    <el-table v-else :data="appendImportSummary.errors" size="small" class="mt-3" border>
                        <el-table-column prop="rowNo" label="行号" width="80"></el-table-column>
                        <el-table-column prop="documentNo" label="证件号码" width="150"></el-table-column>
                        <el-table-column prop="reason" label="异常原因"></el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="appendListDialogVisible = false">取消</el-button>
                <el-button type="primary" :disabled="!appendImportPreviewReady || appendImportSummary.status !== 'success'" @click="confirmAppendImportMock">确认导入</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="voidTicketDialogVisible" title="作废租車券" width="560px">
            <div class="space-y-4">
                <div class="rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm text-amber-900">
                    作废为时间充裕时开发的可选能力；若本期排期不足，可不开放该入口。作废后租車券不可恢复，如需补发请使用新增租車券。
                </div>
                <el-form label-width="110px">
                    <el-form-item label="租車券编号">
                        <div class="text-sm text-gray-900">{{ selectedTicket?.code || '-' }}</div>
                    </el-form-item>
                    <el-form-item label="当前状态">
                        <div class="flex items-center gap-2">
                            <el-tag :type="getIssueStatusType(selectedTicket?.issueStatus)" effect="plain">{{ selectedTicket?.issueStatus || '-' }}</el-tag>
                            <el-tag :type="getTicketStatusType(selectedTicket?.status)" effect="plain">{{ selectedTicket?.status || '-' }}</el-tag>
                        </div>
                    </el-form-item>
                    <el-form-item label="作废原因" required>
                        <el-input v-model="voidTicketForm.reason" type="textarea" :rows="4" placeholder="例如：名单错误、兑换码外泄、活动名额调整"></el-input>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="voidTicketDialogVisible = false">取消</el-button>
                <el-button type="danger" @click="saveVoidTicketMock">确认作废</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="statusDialogVisible" :title="statusActionTitle" width="520px">
            <el-form label-width="100px">
                <el-form-item label="当前状态">
                    <el-tag :type="currentBatch.status === '启用' ? 'success' : (currentBatch.status === '待导入名单' ? 'warning' : 'info')" effect="plain">{{ currentBatch.status }}</el-tag>
                </el-form-item>
                <el-form-item label="操作后状态">
                    <el-tag :type="nextStatus === '启用' ? 'success' : 'info'" effect="plain">{{ nextStatus }}</el-tag>
                </el-form-item>
                <el-form-item label="原因 / 备注" required>
                    <el-input v-model="statusForm.reason" type="textarea" :rows="4" placeholder="请填写本次启用或停用原因"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="statusDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveStatusChangeMock">确认</el-button>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
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
                        unusedCount: 7,
                        usedCount: 4,
                        expiredCount: 0,
                        voidCount: 1,
                        issuedCount: 9,
                        pendingIssueCount: 3,
                        issueFailedCount: 0,
                        status: '启用',
                        codes: [
                            { code: 'KM-A0501-001', visitorName: '王志明', documentNo: 'A123456789', issueStatus: '已发放', status: '已使用', member: '王志明 A123456789', orderNo: 'TS-KM-20260501-0001', orderStatus: '已完成', settlementStatus: 'SETTLED', overdueMinutes: 0, abnormalFeeTotal: 0, usedAt: '2026-04-25 10:16' },
                            { code: 'KM-A0501-002', visitorName: '林雅婷', documentNo: 'B223456789', issueStatus: '已发放', status: '已使用', member: '林雅婷 B223456789', orderNo: 'TS-KM-20260501-0002', orderStatus: '已完成', settlementStatus: 'SETTLED', overdueMinutes: 42, abnormalFeeTotal: 480, usedAt: '2026-04-25 10:21' },
                            { code: 'KM-A0501-003', visitorName: '许家豪', documentNo: '110101199001011234', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-A0501-004', visitorName: '吴佳颖', documentNo: '110101199202022345', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-A0501-007', visitorName: '刘冠廷', documentNo: 'H223456789', issueStatus: '已发放', status: '已作废', member: '刘冠廷 H223456789', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-A0501-005', visitorName: '陈柏翰', documentNo: 'C123456789', issueStatus: '已发放', status: '已使用', member: '陈柏翰 C123456789', orderNo: 'TS-KM-20260501-0008', orderStatus: '用车中', settlementStatus: 'OVERDUE_IN_PROGRESS', overdueMinutes: 35, abnormalFeeTotal: null, usedAt: '2026-04-25 11:03' },
                            { code: 'KM-A0501-006', visitorName: '张怡君', documentNo: 'D223456789', issueStatus: '已发放', status: '已使用', member: '张怡君 D223456789', orderNo: 'TS-KM-20260501-0011', orderStatus: '已预约', usedAt: '2026-04-25 11:44' }
                        ],
                        operationLogs: [
                            { time: '2026-04-25 13:05', type: '作废租車券', operator: 'Admin', content: '作废租車券 KM-A0501-007', reason: '名单证件号码填写错误，已改由新增租車券补发' },
                            { time: '2026-04-25 12:30', type: '导出租車券', operator: 'Admin', content: '导出本批次 Excel（租車券列表、订单完整数据）', reason: '旅行社对账确认' },
                            { time: '2026-04-20 09:15', type: '创建批次', operator: 'Admin', content: '创建租車券批次，共 12 张', reason: '金门 5 月 A 团活动' }
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
                        voidCount: 0,
                        issuedCount: 5,
                        pendingIssueCount: 3,
                        issueFailedCount: 0,
                        status: '启用',
                        codes: [
                            { code: 'KM-B0503-001', visitorName: '黄俊杰', documentNo: 'E123456789', issueStatus: '已发放', status: '已使用', member: '黄俊杰 E123456789', orderNo: 'TS-KM-20260503-0003', orderStatus: '已完成', usedAt: '2026-04-25 12:12' },
                            { code: 'KM-B0503-002', visitorName: '蔡佳玲', documentNo: 'F223456789', issueStatus: '已发放', status: '已使用', member: '蔡佳玲 F223456789', orderNo: 'TS-KM-20260503-0006', orderStatus: '已取消', usedAt: '2026-04-25 12:18' },
                            { code: 'KM-B0503-003', visitorName: '周冠宇', documentNo: '110101198805053456', issueStatus: '待发放', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' }
                        ],
                        operationLogs: [
                            { time: '2026-04-25 10:20', type: '创建批次', operator: 'Admin', content: '创建租車券批次，共 8 张', reason: '机场接驳团活动' }
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
                        voidCount: 0,
                        issuedCount: 0,
                        pendingIssueCount: 0,
                        issueFailedCount: 0,
                        status: '待导入名单',
                        codes: [],
                        operationLogs: [
                            { time: '2026-05-01 09:10', type: '创建批次', operator: 'Admin', content: '保存名单发放批次，尚未导入用券人名单', reason: '合作企业名单尚未确认' }
                        ]
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
                        voidCount: 0,
                        issuedCount: 0,
                        pendingIssueCount: 20,
                        issueFailedCount: 0,
                        status: '停用',
                        codes: [
                            { code: 'KM-C0510-001', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-C0510-002', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '未使用', member: '-', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-C0510-003', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '已过期', member: '-', orderNo: '', orderStatus: '', usedAt: '-' },
                            { code: 'KM-C0510-004', visitorName: '-', documentNo: '-', issueStatus: '未领取', status: '已过期', member: '-', orderNo: '', orderStatus: '', usedAt: '-' }
                        ],
                        operationLogs: [
                            { time: '2026-05-01 09:30', type: '停用批次', operator: 'Admin', content: '批次状态：启用 -> 停用', reason: '企业活动日期调整，暂停售券使用' },
                            { time: '2026-05-01 08:50', type: '创建批次', operator: 'Admin', content: '创建数量生成批次，共 20 张', reason: '海峡科技员工活动' }
                        ]
                    }
                ]);

                const currentBatch = computed(() => {
                    const currentId = Number(route.query.id) || 1;
                    return batches.value.find(item => item.id === currentId) || batches.value[0];
                });

                const addTicketDialogVisible = ref(false);
                const appendListDialogVisible = ref(false);
                const appendImportPreviewReady = ref(false);
                const voidTicketDialogVisible = ref(false);
                const statusDialogVisible = ref(false);
                const selectedTicket = ref(null);
                const addTicketForm = reactive({ visitorName: '', documentNo: '', count: 1, reason: '' });
                const appendListForm = reactive({ reason: '' });
                const appendImportSummary = reactive({
                    status: '',
                    message: '',
                    total: 0,
                    matched: 0,
                    pending: 0,
                    errors: []
                });
                const voidTicketForm = reactive({ reason: '' });
                const statusForm = reactive({ reason: '' });

                const nowText = () => {
                    const d = new Date();
                    const pad = (n) => String(n).padStart(2, '0');
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                };

                const nextStatus = computed(() => currentBatch.value.status === '启用' || currentBatch.value.status === '待导入名单' ? '停用' : '启用');
                const statusActionTitle = computed(() => `${nextStatus.value}批次`);

                const capacityInfo = computed(() => {
                    const isShort = currentBatch.value.id === 1;
                    const vehicleCount = currentBatch.value.id === 3 ? 30 : (currentBatch.value.id === 2 ? 6 : 10);
                    const overlapDemand = currentBatch.value.id === 3 ? 8 : (currentBatch.value.id === 2 ? 4 : 12);
                    const totalDemand = overlapDemand + currentBatch.value.totalCount;
                    return {
                        vehicleCount,
                        overlapCount: currentBatch.value.id === 3 ? 1 : 1,
                        overlapDemand,
                        totalDemand,
                        sufficient: !isShort && totalDemand <= vehicleCount
                    };
                });

                const goBack = () => {
                    router.push('/operation/channel-ticket-batches');
                };

                const getIssueModeLabel = (mode) => mode === 'QUANTITY' ? '数量生成' : '名单发放';
                const formatStationTypeRange = (batch) => (batch.stationTypes || []).join('、') || '全部据点类型';
                const formatStationRange = (batch) => (batch.stations || []).join('、') || '全部适用据点';
                const formatIssueSummary = (batch) => {
                    if (batch.issueMode === 'QUANTITY') return `已领取 ${batch.issuedCount} / 未领取 ${batch.pendingIssueCount}`;
                    return `已发放 ${batch.issuedCount} / 待发放 ${batch.pendingIssueCount}`;
                };

                const getIssueStatusType = (status) => {
                    if (status === '已发放' || status === '已领取') return 'success';
                    if (status === '发放失败') return 'danger';
                    if (status === '未领取') return 'info';
                    return 'warning';
                };

                const getTicketStatusType = (status) => {
                    if (status === '已使用') return 'success';
                    if (status === '已作废') return 'danger';
                    if (status === '已过期') return 'info';
                    return 'warning';
                };

                const getOrderStatusType = (status) => {
                    if (status === '已完成') return 'success';
                    if (status === '已取消') return 'info';
                    if (status === '用车中') return 'warning';
                    return 'info';
                };

                const buildAddedTicketCode = (batch) => {
                    const nextNo = (batch.codes?.length || 0) + 1;
                    return `ADD-${String(batch.id).padStart(2, '0')}-${String(nextNo).padStart(3, '0')}`;
                };

                const appendImportRows = [
                    { name: '郭怡萱', documentNo: 'K123456789' },
                    { name: '赖柏宇', documentNo: 'L223456789' },
                    { name: '陈佩君', documentNo: '110101199303034567' }
                ];

                const openAppendListDialog = () => {
                    appendListForm.reason = '';
                    appendImportPreviewReady.value = false;
                    appendImportSummary.status = '';
                    appendImportSummary.message = '';
                    appendImportSummary.total = 0;
                    appendImportSummary.matched = 0;
                    appendImportSummary.pending = 0;
                    appendImportSummary.errors = [];
                    appendListDialogVisible.value = true;
                };

                const downloadAppendTemplateMock = () => {
                    ElMessage.info('原型示意：下载用券人名单模板');
                };

                const previewAppendImportMock = (hasError) => {
                    if (hasError) {
                        appendImportSummary.status = 'error';
                        appendImportSummary.message = '名单中存在证件号码格式错误、重复或必填字段缺失，无法确认导入。请修正后重新选择文件。';
                        appendImportSummary.total = 0;
                        appendImportSummary.matched = 0;
                        appendImportSummary.pending = 0;
                        appendImportSummary.errors = [
                            { rowNo: 3, documentNo: 'A12345678', reason: '证件号码格式错误' },
                            { rowNo: 4, documentNo: 'A123456789', reason: '与当前批次已有证件号码重复' },
                            { rowNo: 5, documentNo: '', reason: '缺少证件号码' }
                        ];
                        appendImportPreviewReady.value = true;
                        ElMessage.error('导入异常：请修正格式、重复或缺失字段');
                        return;
                    }
                    appendImportSummary.status = 'success';
                    appendImportSummary.message = '名单校验通过。本次导入会按追加处理，不覆盖原名单和已生成租車券。';
                    appendImportSummary.total = appendImportRows.length;
                    appendImportSummary.matched = 2;
                    appendImportSummary.pending = 1;
                    appendImportSummary.errors = [];
                    appendImportPreviewReady.value = true;
                    ElMessage.success('导入成功');
                };

                const confirmAppendImportMock = () => {
                    const batch = currentBatch.value;
                    if (appendImportSummary.status !== 'success') {
                        ElMessage.warning('导入异常未处理，不能确认导入');
                        return;
                    }
                    if (!appendListForm.reason.trim()) {
                        ElMessage.warning('请填写导入原因');
                        return;
                    }
                    const existingDocumentNos = new Set(
                        batch.codes
                            .filter(item => item.documentNo && item.documentNo !== '-')
                            .map(item => item.documentNo.trim().toUpperCase())
                    );
                    const importDocumentNos = new Set();
                    const duplicateRow = appendImportRows.find(item => {
                        const normalized = item.documentNo.trim().toUpperCase();
                        if (existingDocumentNos.has(normalized) || importDocumentNos.has(normalized)) return true;
                        importDocumentNos.add(normalized);
                        return false;
                    });
                    if (duplicateRow) {
                        ElMessage.warning(`证件号码 ${duplicateRow.documentNo} 已存在于当前批次，不允许重复导入`);
                        return;
                    }
                    appendImportRows.forEach((item) => {
                        const normalizedDocumentNo = item.documentNo.trim().toUpperCase();
                        const issueStatus = /^[A-Z]/.test(normalizedDocumentNo) ? '已发放' : '待发放';
                        batch.codes.push({
                            code: buildAddedTicketCode(batch),
                            visitorName: item.name,
                            documentNo: normalizedDocumentNo,
                            issueStatus,
                            status: '未使用',
                            member: issueStatus === '已发放' ? `${item.name} ${normalizedDocumentNo}` : '-',
                            orderNo: '',
                            orderStatus: '',
                            usedAt: '-'
                        });
                    });
                    batch.totalCount += appendImportSummary.total;
                    batch.unusedCount += appendImportSummary.total;
                    batch.issuedCount += appendImportSummary.matched;
                    batch.pendingIssueCount += appendImportSummary.pending;
                    if (batch.status === '待导入名单') {
                        batch.status = '停用';
                    }
                    batch.operationLogs.unshift({
                        time: nowText(),
                        type: '导入名单',
                        operator: 'Admin',
                        content: `追加导入 ${appendImportSummary.total} 行；已匹配会员 ${appendImportSummary.matched} 行，待匹配会员 ${appendImportSummary.pending} 行`,
                        reason: appendListForm.reason
                    });
                    appendListDialogVisible.value = false;
                    ElMessage.success('原型示意：已追加导入名单并生成租車券；待导入名单批次默认转为停用，确认后再启用');
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
                        const issueStatus = /^[A-Z]/.test(normalizedDocumentNo) ? '已发放' : '待发放';
                        batch.codes.push({
                            code: buildAddedTicketCode(batch),
                            visitorName: addTicketForm.visitorName,
                            documentNo: normalizedDocumentNo,
                            issueStatus,
                            status: '未使用',
                            member: issueStatus === '已发放' ? `${addTicketForm.visitorName} ${normalizedDocumentNo}` : '-',
                            orderNo: '',
                            orderStatus: '',
                            usedAt: '-'
                        });
                        batch.totalCount += 1;
                        batch.unusedCount += 1;
                        if (issueStatus === '已发放') batch.issuedCount += 1;
                        else batch.pendingIssueCount += 1;
                        batch.operationLogs.unshift({
                            time: nowText(),
                            type: '新增租車券',
                            operator: 'Admin',
                            content: `补发 1 张给 ${addTicketForm.visitorName} ${normalizedDocumentNo}`,
                            reason: addTicketForm.reason
                        });
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
                        batch.operationLogs.unshift({
                            time: nowText(),
                            type: '新增租車券',
                            operator: 'Admin',
                            content: `数量生成补发 ${count} 张租車券`,
                            reason: addTicketForm.reason
                        });
                    }
                    addTicketDialogVisible.value = false;
                    ElMessage.success('原型示意：已新增租車券');
                };

                const canVoidTicket = (row) => {
                    return row && row.status === '未使用' && !row.orderNo;
                };

                const openVoidTicketDialog = (row) => {
                    if (!canVoidTicket(row)) return;
                    selectedTicket.value = row;
                    voidTicketForm.reason = '';
                    voidTicketDialogVisible.value = true;
                };

                const saveVoidTicketMock = () => {
                    const ticket = selectedTicket.value;
                    const batch = currentBatch.value;
                    if (!ticket || !canVoidTicket(ticket)) {
                        ElMessage.warning('仅未使用且无有效订单占用的租車券可作废');
                        return;
                    }
                    if (!voidTicketForm.reason.trim()) {
                        ElMessage.warning('请填写作废原因');
                        return;
                    }
                    const oldStatus = ticket.status;
                    ticket.status = '已作废';
                    ticket.usedAt = '-';
                    if (batch.unusedCount > 0) batch.unusedCount -= 1;
                    batch.voidCount = (batch.voidCount || 0) + 1;
                    if ((ticket.issueStatus === '待发放' || ticket.issueStatus === '未领取') && batch.pendingIssueCount > 0) {
                        batch.pendingIssueCount -= 1;
                    }
                    batch.operationLogs.unshift({
                        time: nowText(),
                        type: '作废租車券',
                        operator: 'Admin',
                        content: `租車券 ${ticket.code}：${oldStatus} -> 已作废`,
                        reason: voidTicketForm.reason
                    });
                    voidTicketDialogVisible.value = false;
                    ElMessage.success('原型示意：已作废租車券');
                };

                const openStatusDialog = () => {
                    statusForm.reason = '';
                    statusDialogVisible.value = true;
                };

                const saveStatusChangeMock = () => {
                    if (!statusForm.reason.trim()) {
                        ElMessage.warning('请填写原因或备注');
                        return;
                    }
                    const oldStatus = currentBatch.value.status;
                    currentBatch.value.status = nextStatus.value;
                    currentBatch.value.operationLogs.unshift({
                        time: nowText(),
                        type: `${currentBatch.value.status}批次`,
                        operator: 'Admin',
                        content: `批次状态：${oldStatus} -> ${currentBatch.value.status}`,
                        reason: statusForm.reason
                    });
                    statusDialogVisible.value = false;
                    ElMessage.success('原型示意：批次状态已更新');
                };

                const exportCodesMock = () => {
                    currentBatch.value.operationLogs.unshift({
                        time: nowText(),
                        type: '导出租車券',
                        operator: 'Admin',
                        content: '导出本批次 Excel（租車券列表、订单完整数据）',
                        reason: '营运核对'
                    });
                    ElMessage.success('原型示意：已导出 Excel，包含租車券列表和订单完整数据两个 Sheet');
                };

                const editBatchMock = () => {
                    ElMessage.info('原型示意：打开批次编辑弹窗');
                };

                const openOrder = (row) => {
                    ElMessage.info(`打开订单详情：${row.orderNo}`);
                };
</script>

<style scoped>
        .channel-ticket-detail-page {
            min-height: 100%;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        .info-table th {
            width: 128px;
            background: #f8fafc;
            color: #64748b;
            font-weight: 600;
            text-align: left;
            padding: 12px 14px;
            border: 1px solid #e2e8f0;
        }

        .info-table td {
            color: #334155;
            padding: 12px 14px;
            border: 1px solid #e2e8f0;
        }

        .section-card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .stat-card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
        }
</style>
