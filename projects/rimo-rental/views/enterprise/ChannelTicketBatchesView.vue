<template>
            <main class="channel-ticket-batches-page">
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">合作通路租車券</h1>
                        <p class="text-gray-500 text-sm mt-1">统一查看本企业的批次申报与正式批次，也可在线提交新的租車券批次申报。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button type="primary" size="large" @click="openApplicationDialog()">
                            <el-icon class="mr-1"><Plus></Plus></el-icon> 申请批次
                        </el-button>
                    </div>
                </div>

                <div class="grid grid-cols-5 gap-4 mb-6">
                    <button type="button" @click="toggleStatFilter('FORMAL')"
                        class="text-left bg-white rounded-xl shadow-sm border p-5 transition-all"
                        :class="activeStatFilter === 'FORMAL' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-100 hover:border-theme-primary/40'">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">正式批次</span>
                        <span class="card-value text-gray-800">{{ stats.formalBatchCount }}</span>
                    </button>
                    <button type="button" @click="toggleStatFilter('PENDING_APPROVAL')"
                        class="text-left bg-white rounded-xl shadow-sm border p-5 transition-all"
                        :class="activeStatFilter === 'PENDING_APPROVAL' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-100 hover:border-theme-primary/40'">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">待审批申报</span>
                        <span class="card-value text-amber-500">{{ stats.pendingApproval }}</span>
                    </button>
                    <button type="button" @click="toggleStatFilter('HAS_TICKETS')"
                        class="text-left bg-white rounded-xl shadow-sm border p-5 transition-all"
                        :class="activeStatFilter === 'HAS_TICKETS' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-100 hover:border-theme-primary/40'">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">租車券总数</span>
                        <span class="card-value text-gray-800">{{ stats.total }}</span>
                    </button>
                    <button type="button" @click="toggleStatFilter('ISSUED')"
                        class="text-left bg-white rounded-xl shadow-sm border p-5 transition-all"
                        :class="activeStatFilter === 'ISSUED' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-100 hover:border-theme-primary/40'">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">已发放 / 已领取</span>
                        <span class="card-value text-emerald-600">{{ stats.issued }}</span>
                    </button>
                    <button type="button" @click="toggleStatFilter('USED')"
                        class="text-left bg-white rounded-xl shadow-sm border p-5 transition-all"
                        :class="activeStatFilter === 'USED' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-100 hover:border-theme-primary/40'">
                        <span class="text-sm text-gray-500 font-medium mb-1 block">已使用</span>
                        <span class="card-value text-theme-primary">{{ stats.used }}</span>
                    </button>
                </div>

                <section class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="p-4 border-b border-gray-100 bg-gray-50">
                        <div class="flex flex-wrap gap-3 items-center justify-between">
                            <div class="flex flex-wrap gap-3 items-center">
                                <el-input v-model="filters.keyword" placeholder="名称 / 申报单号 / 批次编号" clearable prefix-icon="Search" style="width: 250px"></el-input>
                                <el-select v-model="filters.recordType" placeholder="记录类型" clearable style="width: 140px"
                                    @change="syncCardFromFilters">
                                    <el-option label="正式批次" value="BATCH"></el-option>
                                    <el-option label="批次申报" value="APPLICATION"></el-option>
                                </el-select>
                                <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px"
                                    @change="syncCardFromFilters">
                                    <el-option label="草稿" value="草稿"></el-option>
                                    <el-option label="待审批" value="待审批"></el-option>
                                    <el-option label="已驳回" value="已驳回"></el-option>
                                    <el-option label="待导入名单" value="待导入名单"></el-option>
                                    <el-option label="启用" value="启用"></el-option>
                                    <el-option label="停用" value="停用"></el-option>
                                </el-select>
                                <el-select v-model="filters.metricScope" placeholder="数据范围" clearable style="width: 160px"
                                    @change="syncCardFromFilters">
                                    <el-option label="有租車券" value="HAS_TICKETS"></el-option>
                                    <el-option label="已有发放 / 领取" value="ISSUED"></el-option>
                                    <el-option label="已有使用" value="USED"></el-option>
                                </el-select>
                                <el-select v-model="filters.issueMode" placeholder="发券方式" clearable style="width: 150px">
                                    <el-option label="名单发放" value="LIST"></el-option>
                                    <el-option label="数量生成" value="QUANTITY"></el-option>
                                </el-select>
                                <el-button type="primary" plain @click="moreFiltersVisible = !moreFiltersVisible">
                                    <el-icon class="mr-1"><Filter></Filter></el-icon>
                                    {{ moreFiltersVisible ? '收起筛选' : '更多筛选' }}{{ advancedFilterCount ? '（' + advancedFilterCount + '）' : '' }}
                                </el-button>
                                <el-tooltip content="重置筛选" placement="top">
                                    <el-button circle @click="resetFilters">
                                        <el-icon><Refresh></Refresh></el-icon>
                                    </el-button>
                                </el-tooltip>
                            </div>
                            <span class="text-sm text-gray-500">共 {{ filteredBatches.length }} 笔记录</span>
                        </div>
                        <div v-if="moreFiltersVisible" class="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-3 items-center">
                            <el-select v-model="filters.station" placeholder="适用据点" clearable filterable style="width: 190px">
                                <el-option v-for="station in stationOptions" :key="station" :label="station" :value="station"></el-option>
                            </el-select>
                            <el-date-picker v-model="filters.pickupRange" type="datetimerange" range-separator="至"
                                start-placeholder="取车开始" end-placeholder="取车结束" style="width: 360px"></el-date-picker>
                        </div>
                    </div>

                    <el-table :data="pagedBatches" style="width: 100%">
                        <el-table-column label="编号" width="190">
                            <template #default="{ row }">
                                <div class="font-medium text-gray-800">{{ row.recordNo }}</div>
                                <div class="text-xs text-gray-500">{{ row.recordType === 'APPLICATION' ? '批次申报单' : '正式批次' }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="批次名称" min-width="210">
                            <template #default="{ row }">
                                <div class="font-semibold text-gray-900">{{ row.name }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ row.sourceLabel }} / {{ getIssueModeLabel(row.issueMode) }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="适用据点范围" min-width="180">
                            <template #default="{ row }">
                                <template v-if="row.recordType === 'BATCH'">
                                    <div class="text-sm text-gray-800">{{ row.stationTypes.length }} 类据点 / {{ row.stations.length }} 个据点</div>
                                    <el-tooltip :content="row.stations.join('、')" placement="top">
                                        <div class="text-xs text-gray-500 mt-1 truncate max-w-[180px]">{{ row.stations.join('、') }}</div>
                                    </el-tooltip>
                                </template>
                                <template v-else>
                                    <div class="text-sm text-gray-500">营运审批时配置</div>
                                    <div class="text-xs text-gray-400 mt-1">申报阶段不展示据点资源</div>
                                </template>
                            </template>
                        </el-table-column>
                        <el-table-column label="固定取还车时间" width="180">
                            <template #default="{ row }">
                                <div>{{ row.pickupAt }}</div>
                                <div class="text-xs text-gray-500">{{ row.returnAt }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="数量 / 发放使用统计" width="210">
                            <template #default="{ row }">
                                <template v-if="row.recordType === 'BATCH'">
                                    <div class="text-sm text-gray-900">总数 {{ row.totalCount }}</div>
                                    <div class="text-xs text-gray-500">{{ formatIssueUsageSummary(row) }}</div>
                                </template>
                                <template v-else>
                                    <div class="text-sm text-gray-900">申报 {{ row.totalCount || 0 }} 张</div>
                                    <div class="text-xs text-gray-500">{{ row.issueMode === 'LIST' ? row.listSummary : '数量生成' }}</div>
                                </template>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="110" align="center">
                            <template #default="{ row }">
                                <el-tag :type="getBatchStatusType(row.status)" effect="plain">{{ row.status }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="210" align="right" fixed="right">
                            <template #default="{ row }">
                                <template v-if="row.recordType === 'BATCH'">
                                    <el-button type="primary" link @click="openDetail(row)">查看详情</el-button>
                                    <el-button type="primary" link @click="exportBatch(row)">导出</el-button>
                                </template>
                                <template v-else-if="row.status === '待审批'">
                                    <el-button type="primary" link @click="openApplicationDetail(row)">查看</el-button>
                                    <el-button type="warning" link @click="withdrawApplication(row)">撤回</el-button>
                                </template>
                                <template v-else>
                                    <el-button type="primary" link @click="openApplicationDetail(row)">查看</el-button>
                                    <el-button type="primary" link @click="openApplicationDialog(row)">{{ row.status === '已驳回' ? '修改重提' : '编辑' }}</el-button>
                                </template>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
                        <el-pagination                             v-model:current-page="pagination.page"
                            v-model:page-size="pagination.pageSize"
                            :page-sizes="[10, 20, 50]"
                            layout="total, sizes, prev, pager, next"
                            :total="filteredBatches.length">
                        </el-pagination>
                    </div>
                </section>

                <el-dialog v-model="applicationDialogVisible" :title="editingApplication ? '编辑批次申报' : '申请租車券批次'" width="920px" top="4vh">
                    <el-alert title="企业提交的是批次申报，营运端审批通过后才会生成正式批次和租車券。" type="info" :closable="false" class="mb-5"></el-alert>
                    <el-form label-width="118px">
                        <div class="grid grid-cols-2 gap-x-8">
                            <el-form-item label="申报企业">
                                <el-input v-model="applicationForm.enterprise" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="适用服务">
                                <el-input model-value="分时租赁 / 同站租还" disabled></el-input>
                            </el-form-item>
                            <el-form-item label="批次名称" required>
                                <el-input v-model="applicationForm.name" placeholder="请输入活动或批次名称"></el-input>
                            </el-form-item>
                            <el-form-item label="时间规则" class="col-span-2">
                                <el-radio-group v-model="applicationForm.timeRuleType">
                                    <el-radio-button label="FIXED_PERIOD">固定取还车时间</el-radio-button>
                                    <el-radio-button label="FIXED_DURATION" disabled>固定租用时长（预留）</el-radio-button>
                                </el-radio-group>
                                <div class="w-full text-xs text-gray-500 mt-1">固定租用时长用于金门后续迭代及台湾市场扩展，本期不可选择。</div>
                            </el-form-item>
                            <el-form-item label="发券方式" required>
                                <el-radio-group v-model="applicationForm.issueMode">
                                    <el-radio-button label="LIST">名单发放</el-radio-button>
                                    <el-radio-button label="QUANTITY">数量生成</el-radio-button>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="固定取车时间" required>
                                <el-date-picker v-model="applicationForm.pickupAt" type="datetime" value-format="YYYY-MM-DD HH:mm" placeholder="选择取车时间" style="width:100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="固定还车时间" required>
                                <el-date-picker v-model="applicationForm.returnAt" type="datetime" value-format="YYYY-MM-DD HH:mm" placeholder="选择还车时间" style="width:100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="可用开始时间">
                                <div class="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                    <div class="text-sm text-gray-800">正式批次建立时间</div>
                                    <div class="text-xs text-gray-500 mt-1">营运审批通过并建立正式批次后立即开始可用。</div>
                                </div>
                            </el-form-item>
                            <el-form-item label="可用结束时间">
                                <div class="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                                    <div class="text-sm text-gray-800">{{ applicationForm.returnAt || '固定还车时间' }}</div>
                                    <div class="text-xs text-gray-500 mt-1">系统默认等于本次申报的固定还车时间。</div>
                                </div>
                            </el-form-item>
                        </div>

                        <div class="border rounded-lg bg-gray-50 px-4 py-4 mb-4">
                            <div v-if="applicationForm.issueMode === 'LIST'" class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-gray-800">用券人名单</div>
                                    <div class="text-sm text-gray-500 mt-1" v-if="applicationForm.hasImportedList">
                                        已导入 {{ applicationForm.totalCount }} 人，已匹配会员 {{ applicationForm.matchedCount }} 人，待匹配会员 {{ applicationForm.pendingMatchCount }} 人
                                    </div>
                                    <div class="text-sm text-amber-600 mt-1" v-else>提交审批前必须完成名单导入和校验。</div>
                                </div>
                                <el-button type="primary" plain @click="openImportDialog">导入名单</el-button>
                            </div>
                            <div v-else class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-gray-800">租車券数量</div>
                                    <div class="text-sm text-gray-500 mt-1">审批通过后按申报数量生成租車券和兑换码。</div>
                                </div>
                                <el-input-number v-model="applicationForm.totalCount" :min="1" :max="9999"></el-input-number>
                            </div>
                        </div>

                        <el-form-item label="申报说明">
                            <el-input v-model="applicationForm.remark" type="textarea" :rows="3" placeholder="填写活动背景、预计使用方式或需营运人员关注的事项"></el-input>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <el-button @click="applicationDialogVisible = false">取消</el-button>
                        <el-button @click="saveApplicationDraft">保存草稿</el-button>
                        <el-button type="primary" @click="submitApplication">提交审批</el-button>
                    </template>
                </el-dialog>

                <el-dialog v-model="importDialogVisible" title="导入用券人名单" width="720px">
                    <div class="border border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <el-icon class="text-3xl text-gray-400"><UploadFilled></UploadFilled></el-icon>
                        <div class="font-medium text-gray-700 mt-2">选择名单文件进行校验</div>
                        <div class="text-sm text-gray-500 mt-1">模板字段：姓名、证件号码，不包含证件类型；同一批次证件号码不得重复。</div>
                        <div class="mt-4 flex justify-center gap-3">
                            <el-button>下载模板</el-button>
                            <el-button type="primary" plain @click="simulateImport(false)">模拟成功导入</el-button>
                            <el-button type="danger" plain @click="simulateImport(true)">模拟异常</el-button>
                        </div>
                    </div>
                    <el-alert v-if="importPreviewReady"
                        :title="importHasError ? '导入异常：存在证件号码重复或格式错误。' : '导入成功：12 人，已匹配会员 9 人，待匹配会员 3 人。'"
                        :type="importHasError ? 'error' : 'success'" :closable="false" class="mt-4"></el-alert>
                    <el-table v-if="importPreviewReady && importHasError" :data="importErrors" size="small" border class="mt-3">
                        <el-table-column prop="rowNo" label="行号" width="80"></el-table-column>
                        <el-table-column prop="documentNo" label="证件号码" width="180"></el-table-column>
                        <el-table-column prop="reason" label="异常原因"></el-table-column>
                    </el-table>
                    <template #footer>
                        <el-button @click="importDialogVisible = false">取消</el-button>
                        <el-button type="primary" :disabled="!importPreviewReady || importHasError" @click="confirmImport">确认导入</el-button>
                    </template>
                </el-dialog>

                <el-dialog v-model="applicationDetailVisible" title="批次申报详情" width="860px">
                    <el-descriptions v-if="currentApplication" :column="2" border>
                        <el-descriptions-item label="申报单编号">{{ currentApplication.recordNo }}</el-descriptions-item>
                        <el-descriptions-item label="申报状态"><el-tag :type="getBatchStatusType(currentApplication.status)">{{ currentApplication.status }}</el-tag></el-descriptions-item>
                        <el-descriptions-item label="批次名称">{{ currentApplication.name }}</el-descriptions-item>
                        <el-descriptions-item label="发券方式">{{ getIssueModeLabel(currentApplication.issueMode) }}</el-descriptions-item>
                        <el-descriptions-item label="时间规则">固定取还车时间</el-descriptions-item>
                        <el-descriptions-item label="固定时长模式">预留，未开放</el-descriptions-item>
                        <el-descriptions-item label="固定取车时间">{{ currentApplication.pickupAt }}</el-descriptions-item>
                        <el-descriptions-item label="固定还车时间">{{ currentApplication.returnAt }}</el-descriptions-item>
                        <el-descriptions-item label="申报数量">{{ currentApplication.totalCount }} 张</el-descriptions-item>
                        <el-descriptions-item label="申报版本">V{{ currentApplication.applicationVersion || 1 }}</el-descriptions-item>
                        <el-descriptions-item label="申报说明" :span="2">{{ currentApplication.remark || '-' }}</el-descriptions-item>
                        <el-descriptions-item v-if="currentApplication.status === '已驳回'" label="驳回原因" :span="2">
                            <span class="text-red-600">{{ currentApplication.rejectReason }}</span>
                        </el-descriptions-item>
                    </el-descriptions>
                    <template #footer>
                        <el-button @click="applicationDetailVisible = false">关闭</el-button>
                    </template>
                </el-dialog>
            </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const router = useRouter();
const filters = reactive({
                    keyword: '',
                    recordType: '',
                    status: '',
                    metricScope: '',
                    issueMode: '',
                    station: '',
                    pickupRange: []
                });

                const pagination = reactive({ page: 1, pageSize: 10 });
                const activeStatFilter = ref('');
                const moreFiltersVisible = ref(false);
                const advancedFilterCount = computed(() => {
                    return (filters.station ? 1 : 0) + (filters.pickupRange?.length ? 1 : 0);
                });
                const applicationDialogVisible = ref(false);
                const applicationDetailVisible = ref(false);
                const importDialogVisible = ref(false);
                const importPreviewReady = ref(false);
                const importHasError = ref(false);
                const importErrors = ref([]);
                const editingApplication = ref(null);
                const currentApplication = ref(null);
                const applicationForm = reactive({
                    enterprise: '金门风狮爷旅行社',
                    name: '',
                    timeRuleType: 'FIXED_PERIOD',
                    issueMode: 'LIST',
                    pickupAt: '',
                    returnAt: '',
                    totalCount: 0,
                    hasImportedList: false,
                    matchedCount: 0,
                    pendingMatchCount: 0,
                    remark: ''
                });

                const batches = reactive([
                    {
                        id: 1,
                        recordType: 'BATCH',
                        recordNo: 'GT-KM-20260501-001',
                        batchNo: 'GT-KM-20260501-001',
                        name: '金门 5 月 A 团租車券',
                        enterprise: '金门风狮爷旅行社',
                        sourceLabel: '营运端代建',
                        issueMode: 'LIST',
                        stationTypes: ['旅行社团体专用'],
                        stations: ['金城民生停车场'],
                        pickupAt: '2026-05-01 09:00',
                        returnAt: '2026-05-01 17:00',
                        totalCount: 12,
                        issuedCount: 9,
                        pendingIssueCount: 3,
                        usedCount: 4,
                        status: '启用'
                    },
                    {
                        id: 2,
                        recordType: 'BATCH',
                        recordNo: 'GT-KM-20260503-002',
                        batchNo: 'GT-KM-20260503-002',
                        name: '风狮爷员工眷属体验券',
                        enterprise: '金门风狮爷旅行社',
                        sourceLabel: '企业线上申报',
                        issueMode: 'QUANTITY',
                        stationTypes: ['一般预约开放'],
                        stations: ['山外车站停车场'],
                        pickupAt: '2026-05-03 13:30',
                        returnAt: '2026-05-03 19:30',
                        totalCount: 20,
                        issuedCount: 6,
                        pendingIssueCount: 14,
                        usedCount: 2,
                        status: '停用'
                    },
                    {
                        id: 4,
                        recordType: 'BATCH',
                        recordNo: 'GT-KM-20260508-004',
                        batchNo: 'GT-KM-20260508-004',
                        name: '金门环岛假期待导入名单批次',
                        enterprise: '金门风狮爷旅行社',
                        sourceLabel: '营运端代建',
                        issueMode: 'LIST',
                        stationTypes: ['旅行社团体专用'],
                        stations: ['金湖机场停车场'],
                        pickupAt: '2026-05-08 10:00',
                        returnAt: '2026-05-08 18:00',
                        totalCount: 0,
                        issuedCount: 0,
                        pendingIssueCount: 0,
                        usedCount: 0,
                        status: '待导入名单'
                    },
                    {
                        id: 101,
                        recordType: 'APPLICATION',
                        recordNo: 'AP-KM-20260709-001',
                        name: '金门夏季企业体验活动租車券',
                        enterprise: '金门风狮爷旅行社',
                        sourceLabel: '企业线上申报',
                        issueMode: 'QUANTITY',
                        stationTypes: [],
                        stations: [],
                        pickupAt: '2026-07-25 09:00',
                        returnAt: '2026-07-25 18:00',
                        totalCount: 20,
                        issuedCount: 0,
                        pendingIssueCount: 0,
                        usedCount: 0,
                        status: '待审批',
                        listSummary: '-',
                        applicationVersion: 1,
                        remark: '企业暑期会员体验活动，预计统一于活动日使用。'
                    },
                    {
                        id: 102,
                        recordType: 'APPLICATION',
                        recordNo: 'AP-KM-20260708-002',
                        name: '合作伙伴交流活动租車券',
                        enterprise: '金门风狮爷旅行社',
                        sourceLabel: '企业线上申报',
                        issueMode: 'LIST',
                        stationTypes: [],
                        stations: [],
                        pickupAt: '2026-07-30 10:00',
                        returnAt: '2026-07-30 17:00',
                        totalCount: 12,
                        issuedCount: 0,
                        pendingIssueCount: 0,
                        usedCount: 0,
                        status: '已驳回',
                        listSummary: '名单 12 人',
                        applicationVersion: 1,
                        remark: '合作伙伴交流活动。',
                        rejectReason: '当前申报时段暂无可配置车辆资源，请调整活动时间后重新提交。'
                    },
                    {
                        id: 103,
                        recordType: 'APPLICATION',
                        recordNo: '草稿',
                        name: '八月合作企业参访租車券',
                        enterprise: '金门风狮爷旅行社',
                        sourceLabel: '企业线上申报',
                        issueMode: 'LIST',
                        stationTypes: [],
                        stations: [],
                        pickupAt: '2026-08-08 09:30',
                        returnAt: '2026-08-08 17:30',
                        totalCount: 12,
                        issuedCount: 0,
                        pendingIssueCount: 0,
                        usedCount: 0,
                        status: '草稿',
                        listSummary: '名单 12 人',
                        applicationVersion: 1,
                        remark: '资料尚未确认。'
                    }
                ]);

                const stationOptions = computed(() => Array.from(new Set(batches.flatMap(item => item.stations))));

                const filteredBatches = computed(() => {
                    const keyword = filters.keyword.trim().toLowerCase();
                    return batches.filter(item => {
                        const keywordMatch = !keyword || `${item.recordNo} ${item.name}`.toLowerCase().includes(keyword);
                        const recordTypeMatch = !filters.recordType || item.recordType === filters.recordType;
                        const statusMatch = !filters.status || item.status === filters.status;
                        const issueModeMatch = !filters.issueMode || item.issueMode === filters.issueMode;
                        const stationMatch = !filters.station || item.stations.includes(filters.station);
                        const pickupRangeMatch = (() => {
                            if (!filters.pickupRange?.length) return true;
                            const itemTs = new Date(item.pickupAt.replace(' ', 'T')).getTime();
                            const startTs = new Date(filters.pickupRange[0]).getTime();
                            const endTs = new Date(filters.pickupRange[1]).getTime();
                            return itemTs >= startTs && itemTs <= endTs;
                        })();
                        const metricMatch = (() => {
                            if (!filters.metricScope) return true;
                            if (filters.metricScope === 'HAS_TICKETS') return item.recordType === 'BATCH' && item.totalCount > 0;
                            if (filters.metricScope === 'ISSUED') return item.recordType === 'BATCH' && item.issuedCount > 0;
                            if (filters.metricScope === 'USED') return item.recordType === 'BATCH' && item.usedCount > 0;
                            return true;
                        })();
                        return keywordMatch && recordTypeMatch && statusMatch && metricMatch && issueModeMatch && stationMatch && pickupRangeMatch;
                    });
                });

                const pagedBatches = computed(() => {
                    const start = (pagination.page - 1) * pagination.pageSize;
                    return filteredBatches.value.slice(start, start + pagination.pageSize);
                });

                const stats = computed(() => batches.reduce((acc, item) => {
                    if (item.recordType === 'APPLICATION') {
                        if (item.status === '待审批') acc.pendingApproval += 1;
                        return acc;
                    }
                    acc.formalBatchCount += 1;
                    acc.total += item.totalCount || 0;
                    acc.issued += item.issuedCount || 0;
                    acc.used += item.usedCount || 0;
                    return acc;
                }, { formalBatchCount: 0, pendingApproval: 0, total: 0, issued: 0, used: 0 }));

                const getIssueModeLabel = (mode) => mode === 'QUANTITY' ? '数量生成' : '名单发放';
                const formatIssueUsageSummary = (batch) => {
                    const issueLabel = batch?.issueMode === 'QUANTITY' ? '已领取' : '已发放';
                    return `${issueLabel} ${batch.issuedCount}，已使用 ${batch.usedCount}`;
                };
                const getBatchStatusType = (status) => {
                    if (status === '启用') return 'success';
                    if (status === '待审批') return 'warning';
                    if (status === '已驳回') return 'danger';
                    if (status === '待导入名单') return 'warning';
                    return 'info';
                };

                const openDetail = (row) => {
                    router.push(`/enterprise/channel-ticket-batch-detail?id=${row.id}`);
                };

                const exportBatch = (row) => {
                    ElMessage.success(`原型示意：导出 ${row.batchNo} 租車券列表`);
                };

                const exportCurrentEnterprise = () => {
                    ElMessage.success('原型示意：导出当前企业正式批次');
                };

                const resetApplicationForm = () => {
                    Object.assign(applicationForm, {
                        enterprise: '金门风狮爷旅行社',
                        name: '',
                        timeRuleType: 'FIXED_PERIOD',
                        issueMode: 'LIST',
                        pickupAt: '',
                        returnAt: '',
                        totalCount: 0,
                        hasImportedList: false,
                        matchedCount: 0,
                        pendingMatchCount: 0,
                        remark: ''
                    });
                };

                const openApplicationDialog = (row) => {
                    editingApplication.value = row?.recordType === 'APPLICATION' ? row : null;
                    if (!editingApplication.value) {
                        resetApplicationForm();
                    } else {
                        Object.assign(applicationForm, {
                            enterprise: row.enterprise,
                            name: row.name,
                            timeRuleType: row.timeRuleType || 'FIXED_PERIOD',
                            issueMode: row.issueMode,
                            pickupAt: row.pickupAt,
                            returnAt: row.returnAt,
                            totalCount: row.totalCount,
                            hasImportedList: row.issueMode === 'LIST' && row.totalCount > 0,
                            matchedCount: row.issueMode === 'LIST' ? 9 : 0,
                            pendingMatchCount: row.issueMode === 'LIST' ? Math.max(0, row.totalCount - 9) : 0,
                            remark: row.remark || ''
                        });
                    }
                    applicationDialogVisible.value = true;
                };

                const validateApplication = (forSubmit) => {
                    if (!applicationForm.name.trim()) {
                        ElMessage.warning('请填写批次名称');
                        return false;
                    }
                    if (!applicationForm.pickupAt || !applicationForm.returnAt) {
                        ElMessage.warning('请完整填写固定取车时间和固定还车时间');
                        return false;
                    }
                    if (applicationForm.pickupAt >= applicationForm.returnAt) {
                        ElMessage.warning('固定取车时间必须早于固定还车时间');
                        return false;
                    }
                    if (forSubmit && applicationForm.issueMode === 'LIST' && !applicationForm.hasImportedList) {
                        ElMessage.warning('名单发放申报提交前必须完成名单导入');
                        return false;
                    }
                    if (forSubmit && applicationForm.issueMode === 'QUANTITY' && Number(applicationForm.totalCount) < 1) {
                        ElMessage.warning('请填写有效的租車券数量');
                        return false;
                    }
                    return true;
                };

                const buildApplicationRecord = (status) => ({
                    id: editingApplication.value?.id || Date.now(),
                    recordType: 'APPLICATION',
                    recordNo: status === '草稿'
                        ? (editingApplication.value?.recordNo || '草稿')
                        : (editingApplication.value?.recordNo?.startsWith('AP-') ? editingApplication.value.recordNo : `AP-KM-20260709-${String(batches.length + 1).padStart(3, '0')}`),
                    name: applicationForm.name.trim() || '未命名批次申报',
                    enterprise: applicationForm.enterprise,
                    sourceLabel: '企业线上申报',
                    timeRuleType: applicationForm.timeRuleType,
                    issueMode: applicationForm.issueMode,
                    stationTypes: [],
                    stations: [],
                    pickupAt: applicationForm.pickupAt,
                    returnAt: applicationForm.returnAt,
                    totalCount: Number(applicationForm.totalCount || 0),
                    issuedCount: 0,
                    pendingIssueCount: 0,
                    usedCount: 0,
                    status,
                    listSummary: applicationForm.issueMode === 'LIST' ? `名单 ${applicationForm.totalCount} 人` : '-',
                    applicationVersion: (editingApplication.value?.applicationVersion || 0) + (status === '待审批' ? 1 : 0),
                    remark: applicationForm.remark,
                    rejectReason: ''
                });

                const upsertApplication = (status) => {
                    const record = buildApplicationRecord(status);
                    const existingIndex = batches.findIndex(item => item.id === record.id);
                    if (existingIndex >= 0) batches.splice(existingIndex, 1, record);
                    else batches.unshift(record);
                    applicationDialogVisible.value = false;
                    pagination.page = 1;
                };

                const saveApplicationDraft = () => {
                    upsertApplication('草稿');
                    ElMessage.success('申报草稿已保存');
                };

                const submitApplication = () => {
                    if (!validateApplication(true)) return;
                    ElMessageBox.confirm('提交后申报将进入营运审批，审批前如需修改必须先撤回。', '确认提交审批', {
                        confirmButtonText: '提交审批',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        upsertApplication('待审批');
                        ElMessage.success('批次申报已提交，等待营运端审批');
                    }).catch(() => {});
                };

                const openImportDialog = () => {
                    importPreviewReady.value = false;
                    importHasError.value = false;
                    importErrors.value = [];
                    importDialogVisible.value = true;
                };

                const simulateImport = (hasError) => {
                    importPreviewReady.value = true;
                    importHasError.value = hasError;
                    importErrors.value = hasError
                        ? [
                            { rowNo: 4, documentNo: 'A123456789', reason: '与本次名单其他行重复' },
                            { rowNo: 7, documentNo: 'A12345678', reason: '证件号码格式错误' }
                        ]
                        : [];
                    if (hasError) ElMessage.error('名单校验失败，请修正证件号码后重新导入');
                    else ElMessage.success('名单校验通过');
                };

                const confirmImport = () => {
                    applicationForm.totalCount = 12;
                    applicationForm.hasImportedList = true;
                    applicationForm.matchedCount = 9;
                    applicationForm.pendingMatchCount = 3;
                    importDialogVisible.value = false;
                };

                const openApplicationDetail = (row) => {
                    currentApplication.value = row;
                    applicationDetailVisible.value = true;
                };

                const withdrawApplication = (row) => {
                    ElMessageBox.confirm('撤回后申报将恢复为草稿，可继续修改后重新提交。', '确认撤回申报', {
                        confirmButtonText: '确认撤回',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        row.status = '草稿';
                        ElMessage.success('申报已撤回并恢复为草稿');
                    }).catch(() => {});
                };
                const toggleStatFilter = (key) => {
                    const nextKey = activeStatFilter.value === key ? '' : key;
                    activeStatFilter.value = nextKey;
                    filters.recordType = '';
                    filters.status = '';
                    filters.metricScope = '';
                    if (nextKey === 'FORMAL') filters.recordType = 'BATCH';
                    if (nextKey === 'PENDING_APPROVAL') {
                        filters.recordType = 'APPLICATION';
                        filters.status = '待审批';
                    }
                    if (['HAS_TICKETS', 'ISSUED', 'USED'].includes(nextKey)) {
                        filters.recordType = 'BATCH';
                        filters.metricScope = nextKey;
                    }
                    pagination.page = 1;
                };
                const syncCardFromFilters = () => {
                    if (filters.recordType === 'BATCH' && !filters.status && !filters.metricScope) {
                        activeStatFilter.value = 'FORMAL';
                    } else if (filters.recordType === 'APPLICATION' && filters.status === '待审批' && !filters.metricScope) {
                        activeStatFilter.value = 'PENDING_APPROVAL';
                    } else if (filters.recordType === 'BATCH' && !filters.status && ['HAS_TICKETS', 'ISSUED', 'USED'].includes(filters.metricScope)) {
                        activeStatFilter.value = filters.metricScope;
                    } else {
                        activeStatFilter.value = '';
                    }
                    pagination.page = 1;
                };

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.recordType = '';
                    filters.status = '';
                    filters.metricScope = '';
                    filters.issueMode = '';
                    filters.station = '';
                    filters.pickupRange = [];
                    activeStatFilter.value = '';
                    moreFiltersVisible.value = false;
                    pagination.page = 1;
                };
</script>

<style scoped>
        .channel-ticket-batches-page {
            min-height: 100%;
        }

        .card-value {
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
        }

        .channel-ticket-batches-page :deep(.el-table th.el-table__cell) {
            background: #f8fafc !important;
            color: #475569;
        }
</style>
