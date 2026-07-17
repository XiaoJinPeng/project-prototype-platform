<template>
<div class="channel-ticket-applications-page">
            

            <main>
                <div class="mb-5">
                    <h1 class="text-2xl font-bold text-gray-900">租車券申报审批</h1>
                    <p class="text-sm text-gray-500 mt-1">审核合作通路企业线上提交的批次申报；审批通过后系统生成正式租車券批次。</p>
                </div>

                <div class="grid grid-cols-4 gap-4 mb-5">
                    <button type="button" @click="toggleStatusCard('待审批')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeStatusCard === '待审批' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">待审批</div>
                        <div class="card-value text-amber-500 mt-1">{{ stats.pending }}</div>
                    </button>
                    <button type="button" @click="toggleStatusCard('已通过')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeStatusCard === '已通过' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">已通过</div>
                        <div class="card-value text-emerald-600 mt-1">{{ stats.approved }}</div>
                    </button>
                    <button type="button" @click="toggleStatusCard('已驳回')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeStatusCard === '已驳回' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">已驳回</div>
                        <div class="card-value text-red-500 mt-1">{{ stats.rejected }}</div>
                    </button>
                    <button type="button" @click="toggleStatusCard('已撤回')"
                        class="text-left bg-white rounded-lg border p-5 transition-all"
                        :class="activeStatusCard === '已撤回' ? 'border-theme-primary ring-2 ring-theme-primary/20' : 'border-gray-200 hover:border-theme-primary/40'">
                        <div class="text-sm text-gray-500">已撤回</div>
                        <div class="card-value text-gray-600 mt-1">{{ stats.withdrawn }}</div>
                    </button>
                </div>

                <section class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex flex-wrap gap-3">
                            <el-input v-model="filters.keyword" clearable prefix-icon="Search"
                                placeholder="申报单号 / 批次名称" style="width: 230px"></el-input>
                            <el-select v-model="filters.enterprise" clearable filterable placeholder="申报企业"
                                style="width: 210px">
                                <el-option v-for="item in enterpriseOptions" :key="item" :label="item"
                                    :value="item"></el-option>
                            </el-select>
                            <el-select v-model="filters.status" clearable placeholder="申报状态" style="width: 140px"
                                @change="syncStatusCard">
                                <el-option label="待审批" value="待审批"></el-option>
                                <el-option label="已通过" value="已通过"></el-option>
                                <el-option label="已驳回" value="已驳回"></el-option>
                                <el-option label="已撤回" value="已撤回"></el-option>
                            </el-select>
                            <el-select v-model="filters.issueMode" clearable placeholder="发券方式" style="width: 150px">
                                <el-option label="名单发放" value="LIST"></el-option>
                                <el-option label="数量生成" value="QUANTITY"></el-option>
                            </el-select>
                            <el-tooltip content="重置筛选" placement="top">
                                <el-button circle @click="resetFilters">
                                    <el-icon><Refresh></Refresh></el-icon>
                                </el-button>
                            </el-tooltip>
                        </div>
                        <span class="text-sm text-gray-500">共 {{ filteredApplications.length }} 笔申报</span>
                    </div>

                    <el-table :data="pagedApplications" style="width:100%">
                        <el-table-column label="申报单编号" width="190">
                            <template #default="{ row }">
                                <div class="font-medium text-gray-800">{{ row.applicationNo }}</div>
                                <div class="text-xs text-gray-500">申报版本 V{{ row.version }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="批次名称 / 企业" min-width="220">
                            <template #default="{ row }">
                                <div class="font-semibold text-gray-900">{{ row.name }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ row.enterprise }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="发券方式 / 数量" width="150">
                            <template #default="{ row }">
                                <div>{{ getIssueModeLabel(row.issueMode) }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ row.totalCount }} 张</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="据点配置" min-width="190">
                            <template #default="{ row }">
                                <template v-if="row.stations.length">
                                    <div>{{ row.stationTypes.length }} 类据点 / {{ row.stations.length }} 个据点</div>
                                    <el-tooltip :content="row.stations.join('、')" placement="top">
                                        <div class="text-xs text-gray-500 mt-1 truncate max-w-[220px]">{{ row.stations.join('、') }}</div>
                                    </el-tooltip>
                                </template>
                                <template v-else>
                                    <div class="text-amber-600">待审批配置</div>
                                    <div class="text-xs text-gray-500 mt-1">企业申报不含据点范围</div>
                                </template>
                            </template>
                        </el-table-column>
                        <el-table-column label="固定取还车时间" width="180">
                            <template #default="{ row }">
                                <div>{{ row.pickupAt }}</div>
                                <div class="text-xs text-gray-500">{{ row.returnAt }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="提交时间 / 申报人" width="170">
                            <template #default="{ row }">
                                <div>{{ row.submittedAt }}</div>
                                <div class="text-xs text-gray-500">{{ row.applicant }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="100" align="center">
                            <template #default="{ row }">
                                <el-tag :type="getStatusType(row.status)" effect="plain">{{ row.status }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="145" align="right" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="openDetail(row)">查看</el-button>
                                <el-button v-if="row.status === '待审批'" type="primary" link
                                    @click="openReview(row)">审批</el-button>
                                <el-button v-else-if="row.generatedBatchNo" type="primary" link
                                    @click="openBatch(row)">查看批次</el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="px-4 py-3 border-t border-gray-100 flex justify-end">
                        <el-pagination v-model:current-page="pagination.page"
                            v-model:page-size="pagination.pageSize" :page-sizes="[10, 20, 50]"
                            layout="total, sizes, prev, pager, next" :total="filteredApplications.length">
                        </el-pagination>
                    </div>
                </section>

                <el-dialog v-model="detailVisible" title="批次申报详情" width="1040px" top="4vh">
                    <div v-if="currentApplication">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <div class="text-lg font-semibold text-gray-900">{{ currentApplication.name }}</div>
                                <div class="text-sm text-gray-500 mt-1">{{ currentApplication.applicationNo }} · 申报版本 V{{ currentApplication.version }}</div>
                            </div>
                            <el-tag :type="getStatusType(currentApplication.status)" size="large">{{ currentApplication.status }}</el-tag>
                        </div>

                        <el-descriptions :column="3" border>
                            <el-descriptions-item label="申报企业">{{ currentApplication.enterprise }}</el-descriptions-item>
                            <el-descriptions-item label="申报人">{{ currentApplication.applicant }}</el-descriptions-item>
                            <el-descriptions-item label="提交时间">{{ currentApplication.submittedAt }}</el-descriptions-item>
                            <el-descriptions-item label="适用服务">分时租赁 / 同站租还</el-descriptions-item>
                            <el-descriptions-item label="发券方式">{{ getIssueModeLabel(currentApplication.issueMode) }}</el-descriptions-item>
                            <el-descriptions-item label="申报数量">{{ currentApplication.totalCount }} 张</el-descriptions-item>
                            <el-descriptions-item label="时间规则">固定取还车时间</el-descriptions-item>
                            <el-descriptions-item label="固定时长模式">预留，未开放</el-descriptions-item>
                            <el-descriptions-item label="固定取车时间">{{ currentApplication.pickupAt }}</el-descriptions-item>
                            <el-descriptions-item label="固定还车时间">{{ currentApplication.returnAt }}</el-descriptions-item>
                            <el-descriptions-item label="可用时间">
                                <span v-if="currentApplication.generatedBatchNo">
                                    {{ currentApplication.availableStartAt }} 至 {{ currentApplication.availableEndAt }}
                                </span>
                                <span v-else class="text-gray-500">审批通过后自动生成：正式批次建立时间至固定还车时间</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="营运据点配置" :span="3">
                                <span v-if="currentApplication.stations.length">
                                    {{ currentApplication.stationTypes.join('、') }} / {{ currentApplication.stations.join('、') }}
                                </span>
                                <span v-else class="text-amber-600">待审批时配置</span>
                            </el-descriptions-item>
                            <el-descriptions-item label="申报说明" :span="3">{{ currentApplication.remark || '-' }}</el-descriptions-item>
                            <el-descriptions-item v-if="currentApplication.issueMode === 'LIST'" label="名单校验" :span="3">
                                <div>导入 {{ currentApplication.totalCount }} 人，已匹配会员 {{ currentApplication.matchedCount }} 人，待匹配会员 {{ currentApplication.pendingMatchCount }} 人，无异常</div>
                                <div class="mt-1 text-xs text-gray-500">名单字段为姓名、证件号码，不包含证件类型；同一批次证件号码已完成唯一性校验。</div>
                            </el-descriptions-item>
                            <el-descriptions-item v-if="currentApplication.rejectReason" label="驳回原因" :span="3">
                                <span class="text-red-600">{{ currentApplication.rejectReason }}</span>
                            </el-descriptions-item>
                            <el-descriptions-item v-if="currentApplication.generatedBatchNo" label="生成批次" :span="3">
                                <el-link type="primary" @click="openBatch(currentApplication)">{{ currentApplication.generatedBatchNo }}</el-link>
                            </el-descriptions-item>
                        </el-descriptions>

                        <div v-if="currentApplication.stations.length" class="mt-5 border border-amber-200 bg-amber-50 rounded-lg px-4 py-3">
                            <div class="font-medium text-amber-800">车辆库存提醒</div>
                            <div class="text-sm text-amber-700 mt-1">
                                审批时已重新计算：适用据点共 {{ getApplicationCapacityHint(currentApplication).vehicleCount }} 台车，
                                相同取还车时段其他启用批次占用 {{ getApplicationCapacityHint(currentApplication).overlapCount }} 个名额，
                                本次申报 {{ currentApplication.totalCount }} 张，{{ getApplicationCapacityHint(currentApplication).resultText }}。
                                提醒仅供审批参考，不锁车。
                            </div>
                        </div>

                        <div v-if="currentApplication.reviewedAt" class="mt-5">
                            <div class="font-semibold text-gray-800 mb-2">审批记录</div>
                            <el-table :data="[currentApplication]" size="small">
                                <el-table-column prop="reviewedAt" label="审批时间" width="170"></el-table-column>
                                <el-table-column prop="reviewer" label="审批人" width="120"></el-table-column>
                                <el-table-column prop="status" label="审批结果" width="110"></el-table-column>
                                <el-table-column prop="reviewComment" label="审批意见"></el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <template #footer>
                        <el-button @click="detailVisible = false">关闭</el-button>
                        <el-button v-if="currentApplication?.status === '待审批'" type="primary" @click="openReview(currentApplication)">进入审批</el-button>
                    </template>
                </el-dialog>

                <el-dialog v-model="reviewVisible" title="审批批次申报" width="780px">
                    <el-alert title="营运端不能直接修改企业申报内容。资料有误时请驳回，由企业修改后重新提交。" type="info"
                        :closable="false" class="mb-5"></el-alert>
                    <el-form label-width="126px">
                        <el-form-item label="申报单编号">
                            <span>{{ currentApplication?.applicationNo }}</span>
                        </el-form-item>
                        <el-form-item label="审批结果">
                            <el-radio-group v-model="reviewForm.result">
                                <el-radio-button label="APPROVE">审批通过</el-radio-button>
                                <el-radio-button label="REJECT">审批驳回</el-radio-button>
                            </el-radio-group>
                        </el-form-item>
                        <template v-if="reviewForm.result === 'APPROVE'">
                            <el-form-item label="适用据点类型" required>
                                <el-select v-model="reviewForm.stationTypes" multiple collapse-tags
                                    placeholder="请选择据点类型" style="width:100%" @change="handleReviewStationTypeChange">
                                    <el-option v-for="option in stationTypeOptions" :key="option.value"
                                        :label="option.label" :value="option.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="适用据点" required>
                                <el-select v-model="reviewForm.stations" multiple collapse-tags filterable
                                    placeholder="请选择该批次可使用的据点" style="width:100%">
                                    <el-option v-for="option in reviewStationOptions" :key="option.value"
                                        :label="option.label" :value="option.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <div v-if="reviewForm.stations.length"
                                class="ml-[126px] mb-5 border border-amber-200 bg-amber-50 rounded-lg px-4 py-3">
                                <div class="font-medium text-amber-800">车辆库存提醒</div>
                                <div class="text-sm text-amber-700 mt-1">
                                    已选据点车辆 {{ capacityHint.vehicleCount }} 台；相同取还车时段其他批次占用
                                    {{ capacityHint.overlapCount }} 个名额；本批次 {{ currentApplication?.totalCount || 0 }} 张；
                                    {{ capacityHint.resultText }}。仅供审批参考，不锁车。
                                </div>
                            </div>
                        </template>
                        <el-form-item v-if="reviewForm.result === 'APPROVE'" label="批次初始状态">
                            <el-radio-group v-model="reviewForm.initialBatchStatus">
                                <el-radio label="停用">停用（默认）</el-radio>
                                <el-radio label="启用">启用</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item :label="reviewForm.result === 'REJECT' ? '驳回原因' : '审批意见'"
                            :required="reviewForm.result === 'REJECT'">
                            <el-input v-model="reviewForm.comment" type="textarea" :rows="4"
                                :placeholder="reviewForm.result === 'REJECT' ? '请填写明确的驳回原因' : '可填写审批备注'"></el-input>
                        </el-form-item>
                    </el-form>
                    <template #footer>
                        <el-button @click="reviewVisible = false">取消</el-button>
                        <el-button :type="reviewForm.result === 'REJECT' ? 'danger' : 'primary'"
                            @click="submitReview">确认{{ reviewForm.result === 'REJECT' ? '驳回' : '通过' }}</el-button>
                    </template>
                </el-dialog>
            </main>
        </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from 'vue-router';

const router = useRouter();
const filters = reactive({ keyword: '', enterprise: '', status: '', issueMode: '' });
                const pagination = reactive({ page: 1, pageSize: 10 });
                const activeStatusCard = ref('');
                const detailVisible = ref(false);
                const reviewVisible = ref(false);
                const currentApplication = ref(null);
                const reviewForm = reactive({
                    result: 'APPROVE',
                    stationTypes: [],
                    stations: [],
                    initialBatchStatus: '停用',
                    comment: ''
                });
                const stationTypeOptions = [
                    { label: '一般预约开放', value: '一般预约开放' },
                    { label: '旅行社团体专用', value: '旅行社团体专用' },
                    { label: '企业活动合作据点', value: '企业活动合作据点' }
                ];
                const stationCatalog = [
                    { label: '金城民生停车场', value: '金城民生停车场', type: '旅行社团体专用', vehicleCount: 10 },
                    { label: '金湖机场停车场', value: '金湖机场停车场', type: '旅行社团体专用', vehicleCount: 8 },
                    { label: '山外车站停车场', value: '山外车站停车场', type: '一般预约开放', vehicleCount: 12 },
                    { label: '金门大学停车场', value: '金门大学停车场', type: '一般预约开放', vehicleCount: 6 },
                    { label: '台北信义企业停车场', value: '台北信义企业停车场', type: '企业活动合作据点', vehicleCount: 9 }
                ];

                const applications = reactive([
                    {
                        id: 1,
                        applicationNo: 'AP-KM-20260709-001',
                        version: 1,
                        name: '金门夏季企业体验活动租車券',
                        enterprise: '金门风狮爷旅行社',
                        applicant: '王雅婷',
                        issueMode: 'QUANTITY',
                        totalCount: 20,
                        matchedCount: 0,
                        pendingMatchCount: 0,
                        stationTypes: [],
                        stations: [],
                        pickupAt: '2026-07-25 09:00',
                        returnAt: '2026-07-25 18:00',
                        availableStartAt: '2026-07-10 00:00',
                        availableEndAt: '2026-07-25 17:00',
                        submittedAt: '2026-07-09 10:18',
                        status: '待审批',
                        remark: '企业暑期会员体验活动，预计统一于活动日使用。'
                    },
                    {
                        id: 2,
                        applicationNo: 'AP-KM-20260709-002',
                        version: 2,
                        name: '海峡科技员工家庭日租車券',
                        enterprise: '海峡科技股份有限公司',
                        applicant: '陈冠宇',
                        issueMode: 'LIST',
                        totalCount: 16,
                        matchedCount: 11,
                        pendingMatchCount: 5,
                        stationTypes: [],
                        stations: [],
                        pickupAt: '2026-07-28 08:30',
                        returnAt: '2026-07-28 17:30',
                        availableStartAt: '2026-07-12 00:00',
                        availableEndAt: '2026-07-28 16:30',
                        submittedAt: '2026-07-09 09:42',
                        status: '待审批',
                        remark: '员工家庭日活动，由企业统一通知参与人员。'
                    },
                    {
                        id: 3,
                        applicationNo: 'AP-KM-20260708-003',
                        version: 1,
                        name: '蓝湾旅行社机场接驳团租車券',
                        enterprise: '金门蓝湾旅行社',
                        applicant: '林淑芬',
                        issueMode: 'LIST',
                        totalCount: 12,
                        matchedCount: 8,
                        pendingMatchCount: 4,
                        stationTypes: ['旅行社团体专用'],
                        stations: ['金湖机场停车场'],
                        pickupAt: '2026-07-20 09:00',
                        returnAt: '2026-07-20 18:00',
                        availableStartAt: '2026-07-09 08:50',
                        availableEndAt: '2026-07-20 18:00',
                        submittedAt: '2026-07-08 14:05',
                        status: '已通过',
                        remark: '机场接驳团体使用。',
                        reviewedAt: '2026-07-09 08:50',
                        reviewer: '营运管理员',
                        reviewComment: '资料确认无误，批次初始状态为停用。',
                        generatedBatchNo: 'GT-KM-20260503-002',
                        generatedBatchId: 2
                    },
                    {
                        id: 4,
                        applicationNo: 'AP-KM-20260708-002',
                        version: 1,
                        name: '合作伙伴交流活动租車券',
                        enterprise: '金门风狮爷旅行社',
                        applicant: '王雅婷',
                        issueMode: 'LIST',
                        totalCount: 12,
                        matchedCount: 9,
                        pendingMatchCount: 3,
                        stationTypes: [],
                        stations: [],
                        pickupAt: '2026-07-30 10:00',
                        returnAt: '2026-07-30 17:00',
                        availableStartAt: '2026-07-15 00:00',
                        availableEndAt: '2026-07-30 16:00',
                        submittedAt: '2026-07-08 11:26',
                        status: '已驳回',
                        remark: '合作伙伴交流活动。',
                        reviewedAt: '2026-07-08 16:30',
                        reviewer: '营运管理员',
                        rejectReason: '所选据点未开放企业活动合作据点类型，请调整后重新提交。',
                        reviewComment: '所选据点未开放企业活动合作据点类型，请调整后重新提交。'
                    },
                    {
                        id: 5,
                        applicationNo: 'AP-KM-20260707-006',
                        version: 1,
                        name: '七月企业客户体验租車券',
                        enterprise: '浯江商务服务有限公司',
                        applicant: '李佩珊',
                        issueMode: 'QUANTITY',
                        totalCount: 10,
                        matchedCount: 0,
                        pendingMatchCount: 0,
                        stationTypes: [],
                        stations: [],
                        pickupAt: '2026-07-18 09:00',
                        returnAt: '2026-07-18 17:00',
                        availableStartAt: '2026-07-08 00:00',
                        availableEndAt: '2026-07-18 16:00',
                        submittedAt: '2026-07-07 15:20',
                        status: '已撤回',
                        remark: '企业已撤回调整活动日期。'
                    }
                ]);

                const enterpriseOptions = computed(() => Array.from(new Set(applications.map(item => item.enterprise))));
                const reviewStationOptions = computed(() => {
                    if (!reviewForm.stationTypes.length) return [];
                    return stationCatalog.filter(item => reviewForm.stationTypes.includes(item.type));
                });
                const capacityHint = computed(() => {
                    const vehicleCount = stationCatalog
                        .filter(item => reviewForm.stations.includes(item.value))
                        .reduce((sum, item) => sum + item.vehicleCount, 0);
                    const overlapCount = 8;
                    const currentCount = Number(currentApplication.value?.totalCount || 0);
                    const balance = vehicleCount - overlapCount - currentCount;
                    return {
                        vehicleCount,
                        overlapCount,
                        resultText: balance >= 0 ? `预计剩余 ${balance} 台` : `预计不足 ${Math.abs(balance)} 台`
                    };
                });
                const filteredApplications = computed(() => {
                    const keyword = filters.keyword.trim().toLowerCase();
                    return applications.filter(item => {
                        const keywordMatch = !keyword || `${item.applicationNo} ${item.name}`.toLowerCase().includes(keyword);
                        const enterpriseMatch = !filters.enterprise || item.enterprise === filters.enterprise;
                        const statusMatch = !filters.status || item.status === filters.status;
                        const issueModeMatch = !filters.issueMode || item.issueMode === filters.issueMode;
                        return keywordMatch && enterpriseMatch && statusMatch && issueModeMatch;
                    });
                });
                const pagedApplications = computed(() => {
                    const start = (pagination.page - 1) * pagination.pageSize;
                    return filteredApplications.value.slice(start, start + pagination.pageSize);
                });
                const stats = computed(() => applications.reduce((acc, item) => {
                    if (item.status === '待审批') acc.pending += 1;
                    if (item.status === '已通过') acc.approved += 1;
                    if (item.status === '已驳回') acc.rejected += 1;
                    if (item.status === '已撤回') acc.withdrawn += 1;
                    return acc;
                }, { pending: 0, approved: 0, rejected: 0, withdrawn: 0 }));

                const getIssueModeLabel = (mode) => mode === 'QUANTITY' ? '数量生成' : '名单发放';
                const getStatusType = (status) => {
                    if (status === '已通过') return 'success';
                    if (status === '已驳回') return 'danger';
                    if (status === '待审批') return 'warning';
                    return 'info';
                };
                const getApplicationCapacityHint = (row) => {
                    const vehicleCount = stationCatalog
                        .filter(item => row?.stations?.includes(item.value))
                        .reduce((sum, item) => sum + item.vehicleCount, 0);
                    const overlapCount = 8;
                    const balance = vehicleCount - overlapCount - Number(row?.totalCount || 0);
                    return {
                        vehicleCount,
                        overlapCount,
                        resultText: balance >= 0 ? `预计剩余 ${balance} 台` : `预计不足 ${Math.abs(balance)} 台`
                    };
                };
                const resetFilters = () => {
                    filters.keyword = '';
                    filters.enterprise = '';
                    filters.status = '';
                    filters.issueMode = '';
                    activeStatusCard.value = '';
                    pagination.page = 1;
                };
                const toggleStatusCard = (status) => {
                    const nextStatus = activeStatusCard.value === status ? '' : status;
                    activeStatusCard.value = nextStatus;
                    filters.status = nextStatus;
                    pagination.page = 1;
                };
                const syncStatusCard = (status) => {
                    activeStatusCard.value = status || '';
                    pagination.page = 1;
                };
                const openDetail = (row) => {
                    currentApplication.value = row;
                    detailVisible.value = true;
                };
                const openReview = (row) => {
                    currentApplication.value = row;
                    reviewForm.result = 'APPROVE';
                    reviewForm.stationTypes = [];
                    reviewForm.stations = [];
                    reviewForm.initialBatchStatus = '停用';
                    reviewForm.comment = '';
                    detailVisible.value = false;
                    reviewVisible.value = true;
                };
                const submitReview = () => {
                    if (!currentApplication.value || currentApplication.value.status !== '待审批') return;
                    if (reviewForm.result === 'APPROVE' && (!reviewForm.stationTypes.length || !reviewForm.stations.length)) {
                        ElMessage.warning('审批通过前必须选择适用据点类型和适用据点');
                        return;
                    }
                    if (reviewForm.result === 'REJECT' && !reviewForm.comment.trim()) {
                        ElMessage.warning('请填写驳回原因');
                        return;
                    }
                    const row = currentApplication.value;
                    if (reviewForm.result === 'REJECT') {
                        row.status = '已驳回';
                        row.rejectReason = reviewForm.comment;
                        row.reviewComment = reviewForm.comment;
                        row.reviewedAt = '2026-07-09 11:30';
                        row.reviewer = '营运管理员';
                        reviewVisible.value = false;
                        ElMessage.success('申报已驳回，企业可修改后重新提交');
                        return;
                    }
                    ElMessageBox.confirm(
                        `审批通过后将生成正式批次，初始状态为“${reviewForm.initialBatchStatus}”。`,
                        '确认审批通过',
                        { confirmButtonText: '确认通过', cancelButtonText: '取消', type: 'warning' }
                    ).then(() => {
                        row.status = '已通过';
                        row.reviewComment = reviewForm.comment || `审批通过，批次初始状态为${reviewForm.initialBatchStatus}。`;
                        row.reviewedAt = '2026-07-09 11:30';
                        row.reviewer = '营运管理员';
                        row.stationTypes = [...reviewForm.stationTypes];
                        row.stations = [...reviewForm.stations];
                        row.availableStartAt = '2026-07-09 11:30';
                        row.availableEndAt = row.returnAt;
                        row.generatedBatchNo = `GT-KM-20260709-${String(row.id + 10).padStart(3, '0')}`;
                        reviewVisible.value = false;
                        ElMessage.success(`审批通过，已生成正式批次 ${row.generatedBatchNo}`);
                    }).catch(() => {});
                };
                const openBatch = (row) => {
                    router.push(`/operation/channel-ticket-batch-detail?id=${row.generatedBatchId || row.id}`);
                };
                const handleReviewStationTypeChange = () => {
                    const availableValues = reviewStationOptions.value.map(item => item.value);
                    reviewForm.stations = reviewForm.stations.filter(item => availableValues.includes(item));
                };
</script>

<style scoped>
        .channel-ticket-applications-page {
            min-height: 100%;
        }

        .channel-ticket-applications-page :deep(.el-table th.el-table__cell) {
            background: #f8fafc !important;
            color: #475569;
        }

        .card-value {
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
        }
</style>
