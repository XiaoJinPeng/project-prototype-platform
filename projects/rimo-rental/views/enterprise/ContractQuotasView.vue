<template>
            <main class="contract-quotas-page">
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">合约配额管理</h1>
                        <p class="text-gray-500 text-sm mt-1">管理车辆底层合约与调度下发额度，严格控制资产绑定状态。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button v-if="currentUserRole === 'HEADQUARTERS'" type="primary" size="large"
                            class="shadow-md shadow-indigo-500/20">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 增加配额
                        </el-button>
                    </div>
                </div>

                
                
                <div v-if="currentUserRole === 'HEADQUARTERS'" class="grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'totalContracts' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('totalContracts')">
                        <span class="text-sm text-gray-500 font-medium mb-1">集团总合约数</span>
                        <span class="card-value text-gray-800">{{ statsHQ.totalContracts }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'totalQuota' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('totalQuota')">
                        <span class="text-sm text-gray-500 font-medium mb-1">集团总可用配额</span>
                        <div class="flex items-center gap-2">
                            <span class="card-value text-emerald-500">{{ statsHQ.totalQuota }}</span>
                            <el-tag type="info" size="small" effect="plain" round>台/辆</el-tag>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'allocatedQuota' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('allocatedQuota')">
                        <span class="text-sm text-gray-500 font-medium mb-1 text-[#38bdf8]">已下发配额</span>
                        <div class="flex items-center gap-2">
                            <span class="card-value text-[#38bdf8]">{{ statsHQ.allocatedQuota }}</span>
                        </div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'unallocatedQuota' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('unallocatedQuota')">
                        <span class="text-sm text-gray-500 font-medium mb-1 text-amber-500">待分配配额</span>
                        <div class="flex items-center gap-2">
                            <span class="card-value text-amber-500">{{ statsHQ.unallocatedQuota }}</span>
                            <el-icon class="text-amber-500 text-xl">
                                <Watercup></Watercup>
                            </el-icon>
                        </div>
                    </div>
                </div>

                
                <div v-else class="grid grid-cols-2 gap-4 mb-6">
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col items-center cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'branchContracts' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('branchContracts')">
                        <span class="text-sm text-gray-500 font-medium mb-1">本公司有效合约数</span>
                        <span class="card-value text-gray-800">{{ statsBranch.contracts }}</span>
                    </div>
                    <div 
                        class="bg-white rounded-xl shadow-sm border p-5 flex flex-col items-center cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'branchQuota' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('branchQuota')">
                        <span class="text-sm text-gray-500 font-medium mb-1">本公司当前可用总配额</span>
                        <div class="flex items-center gap-2">
                            <span class="card-value text-emerald-500 text-4xl">{{ statsBranch.quota }} <span 
                                    class="text-sm text-gray-400 font-normal">车辆</span></span>
                        </div>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">

                    
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
                        <el-input v-model="filters.query" placeholder="搜索合约编号 / 合约名称" prefix-icon="Search" clearable
                            style="width: 240px"></el-input>

                        <el-select v-model="filters.type" placeholder="合约类型" clearable style="width: 140px">
                            <el-option label="全部类型" value="ALL"></el-option>
                            <el-option label="试用 (Trial)" value="TRIAL"></el-option>
                            <el-option label="正式 (Official)" value="OFFICIAL"></el-option>
                        </el-select>

                        <el-select v-model="filters.billing" placeholder="缴费周期" clearable style="width: 140px">
                            <el-option label="全部周期" value="ALL"></el-option>
                            <el-option label="月缴 (Monthly)" value="MONTHLY"></el-option>
                            <el-option label="年缴 (Annually)" value="ANNUALLY"></el-option>
                        </el-select>

                        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px">
                            <el-option label="全部状态" value="ALL"></el-option>
                            <el-option label="生效中" value="ACTIVE"></el-option>
                            <el-option label="已终止" value="TERMINATED"></el-option>
                            <el-option label="即将过期" value="EXPIRING_SOON"></el-option>
                            <el-option label="付款确认中" value="PAYING"></el-option>
                            <el-option label="已过期" value="EXPIRED"></el-option>
                        </el-select>

                        
                        <el-select v-if="currentUserRole === 'HEADQUARTERS'" v-model="filters.allocation"
                            placeholder="分配状态" clearable style="width: 160px">
                            <el-option label="全部状态" value="ALL"></el-option>
                            <el-option label="已全部分配" value="FULL"></el-option>
                            <el-option label="部分分配" value="PARTIAL"></el-option>
                            <el-option label="未分配" value="UNASSIGNED"></el-option>
                        </el-select>

                        <div class="ml-auto text-sm text-gray-500">
                            共检索到 <span class="font-bold text-gray-800">{{ filteredData.length }}</span> 份合约
                        </div>
                    </div>

                    
                    <el-table :data="filteredData" style="width: 100%">

                        <el-table-column label="合约编号与名称" min-width="260">
                            <template #default="{ row }">
                                <div class="font-mono text-gray-800 text-sm font-semibold">{{ row.id }}</div>
                                <div class="text-xs text-gray-500 mt-1 truncate" :title="row.name">{{ row.name }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="合约类型" width="120">
                            <template #default="{ row }">
                                <el-tag v-if="row.type === 'TRIAL'" type="info" size="small" effect="plain"
                                    class="border-blue-200 text-blue-600 bg-blue-50">试用 (Trial)</el-tag>
                                <el-tag v-if="row.type === 'OFFICIAL'" type="success" size="small" effect="light"
                                    class="text-emerald-600 bg-emerald-50 border-emerald-200">正式 (Official)</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column v-if="currentUserRole === 'HEADQUARTERS'" label="结算方" prop="settlementParty"
                            min-width="150" align="center">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700">{{ row.settlementParty || '-' }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="缴费周期" width="100" align="center">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-600 bg-gray-100 rounded px-2 py-0.5 inline-block">
                                    {{ row.billing === 'MONTHLY' ? '月缴' : '年缴' }}
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="有效期" min-width="220">
                            <template #default="{ row }">
                                <div class="text-xs text-gray-600 font-mono tracking-tight flex items-center">
                                    {{ row.startDate }} <span class="mx-1 text-gray-400">至</span> {{ row.endDate }}
                                    
                                    <div v-if="getDaysRemaining(row.endDate) >= 0 && getDaysRemaining(row.endDate) < 15"
                                        class="ml-2 flex items-center text-amber-500 font-semibold bg-amber-50 px-1.5 py-0.5 rounded"
                                        title="距离过期不足15天">
                                        <el-icon class="mr-1 text-[14px]">
                                            <Warning></Warning>
                                        </el-icon>临近到期
                                    </div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="配额使用情况" min-width="240">
                            <template #default="{ row }">
                                
                                <div v-if="currentUserRole === 'HEADQUARTERS'">
                                    
                                    <div class="flex items-center justify-between gap-3 text-[11px] text-gray-500 mb-1 whitespace-nowrap">
                                        <span>
                                            总额度 <strong class="text-gray-700">{{ row.totalQuota }}</strong>
                                        </span>
                                        <span class="text-right">
                                            已下发 <strong class="text-[#38bdf8]">{{ row.allocatedQuota }}</strong>
                                            <span class="mx-1 text-gray-300">·</span>
                                            待分配 <strong class="text-amber-500">{{ row.totalQuota - row.allocatedQuota }}</strong>
                                        </span>
                                    </div>
                                    <el-progress :percentage="Math.round((row.allocatedQuota / row.totalQuota) * 100)"
                                        :stroke-width="8" :color="getProgressColor(row)" :show-text="false">
                                    </el-progress>
                                </div>
                                
                                <div v-else>
                                    
                                    <div class="flex items-center justify-between gap-3 text-[11px] text-gray-500 mb-1 whitespace-nowrap">
                                        <span>
                                            可用总额度 <strong class="text-gray-700">{{ getBranchQuota(row) }}</strong>
                                        </span>
                                        <span class="text-right">
                                            已绑定 <strong class="text-emerald-600">{{ getBranchUsedQuota(row) }}</strong>
                                            <span class="mx-1 text-gray-300">·</span>
                                            剩余可绑定 <strong class="text-amber-500">{{ getBranchQuota(row) - getBranchUsedQuota(row) }}</strong>
                                        </span>
                                    </div>
                                    <el-progress 
                                        :percentage="getBranchQuota(row) === 0 ? 0 : Math.round((getBranchUsedQuota(row) / getBranchQuota(row)) * 100)"
                                        :stroke-width="8" :color="getBranchProgressColor(row)" :show-text="false">
                                    </el-progress>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" width="120" align="center">
                            <template #default="{ row }">
                                <span class="flex items-center justify-center gap-1.5 text-sm"
                                    :class="getStatusColorClass(row)">
                                    <span class="w-2 h-2 rounded-full" :class="getStatusDotClass(row)"></span>
                                    {{ getStatusText(row) }}
                                </span>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="210" align="right" fixed="right">
                            <template #default="{ row }">
                                
                                <div v-if="currentUserRole === 'BRANCH'" class="flex justify-end gap-2">
                                    <el-button type="primary" plain size="small" @click="openVehiclesModal(row)">
                                        查看下挂车辆
                                    </el-button>
                                </div>
                                
                                <div v-else class="flex justify-end gap-2">
                                    <el-button type="primary" size="small"
                                        :disabled="getStatusProp(row) === 'PAYING' || getDaysRemaining(row.endDate) < 0 || row.allocatedQuota >= row.totalQuota"
                                        @click="openAllocateModal(row)">
                                        分配配额
                                    </el-button>
                                    <el-button plain size="small" @click="openDetailsModal(row)">查看分配明细</el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </main>

        
        
        <el-dialog v-model="modals.allocate" title="分配配额" width="480px" v-if="currentUserRole === 'HEADQUARTERS'">
            <div v-if="activeContract" class="mb-5 bg-gray-50 p-4 border rounded-lg border-gray-200">
                <div class="text-xs text-gray-500 mb-1">正在操作合约</div>
                <div class="font-mono text-gray-800 font-bold mb-3">{{ activeContract.id }} - {{ activeContract.name }}
                </div>

                <div class="flex items-center gap-2 text-sm text-gray-700 bg-indigo-50 text-indigo-800 p-2 rounded">
                    <el-icon>
                        <CopyDocument></CopyDocument>
                    </el-icon>
                    <span>当前该合约可分配余额：<strong class="text-xl ms-1">{{ activeContract.totalQuota -
                            activeContract.allocatedQuota }}</strong> 台</span>
                </div>
            </div>

            <el-form label-position="top">
                <el-form-item label="目标分公司" required>
                    <el-select v-model="allocateForm.branchId" class="w-full" filterable placeholder="选择分配给哪个分公司">
                        <el-option v-for="b in branchOptions" :key="b.id" :label="b.name" :value="b.id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="分配数量" required>
                    <el-input-number v-model="allocateForm.amount" :min="1"
                        :max="activeContract ? (activeContract.totalQuota - activeContract.allocatedQuota) : 1"
                        class="w-full" step-strictly></el-input-number>
                    <div class="text-xs text-gray-400 mt-2 leading-tight">配额下发后，目标分公司即可在车辆管理中上架对应数量的车辆。此操作会占用蓄水池配额。
                    </div>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="modals.allocate = false">取消</el-button>
                <el-button type="primary" @click="confirmAllocation"
                    :disabled="!allocateForm.branchId || !allocateForm.amount">确认下发</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="modals.details" title="合约分配明细" width="550px" v-if="currentUserRole === 'HEADQUARTERS'">
            <div v-if="activeContract" class="mb-4 text-sm text-gray-600">
                合约 <span class="font-mono font-bold text-gray-800">{{ activeContract.id }}</span> 的已核准分配记录：
            </div>

            <el-table :data="aggregatedAllocations" style="width: 100%" size="small" border stripe>
                <el-table-column label="分公司名称" min-width="150">
                    <template #default="{ row }">
                        <div class="font-medium text-gray-700">{{ getBranchName(row.branchId) }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="已分配总配额" width="120" align="center">
                    <template #default="{ row }">
                        <span class="font-bold text-indigo-600">{{ row.amount }} 台</span>
                    </template>
                </el-table-column>
                <el-table-column label="当前已绑定" width="110" align="center">
                    <template #default="{ row }">
                        <span class="font-medium text-emerald-600">{{ getBranchUsedQuotaById(activeContract,
                            row.branchId) }} 台</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="100" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" link size="small" @click="openAdjustModal(row)">调整</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div v-if="aggregatedAllocations.length === 0" class="text-center py-6 text-gray-400 text-sm">暂无分配记录</div>

            <template #footer>
                <el-button type="primary" plain @click="modals.details = false">关闭明细</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="modals.adjust" title="调整分配配额" width="400px" v-if="currentUserRole === 'HEADQUARTERS'">
            <div v-if="activeAllocation" class="mb-4 text-sm text-gray-700">
                正在调整 <strong>{{ getBranchName(activeAllocation.branchId) }}</strong> 的配额：
            </div>
            <el-form label-position="top">
                <el-form-item label="分配数量" required>
                    <el-input-number v-model="adjustForm.amount" :min="0" :max="adjustMaxAmount" class="w-full"
                        step-strictly></el-input-number>
                    <div class="text-xs text-gray-400 mt-2 leading-tight">
                        调大将占用蓄水池配额；调小将释放给蓄水池（设为0则取消分配）。<br>
                        当前该合约可再分配余额：<strong>{{ activeContract ? (activeContract.totalQuota -
                            activeContract.allocatedQuota) : 0 }}</strong> 台
                    </div>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="modals.adjust = false">取消</el-button>
                <el-button type="primary" @click="confirmAdjust">确认调整</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="modals.vehicles" title="已绑定该合约的车辆列表" width="600px" v-if="currentUserRole === 'BRANCH'">
            <div v-if="activeContract"
                class="mb-4 text-sm text-gray-700 bg-emerald-50 p-3 rounded border border-emerald-100 flex items-center justify-between">
                <div>
                    <span class="text-gray-500 mr-2">当前合约：</span>
                    <strong class="font-mono">{{ activeContract.id }}</strong>
                </div>
                <div>
                    <span class="text-gray-500 mr-2">配额使用率：</span>
                    <strong class="text-emerald-700">{{ activeContractMockVehicles.length }} / {{
                        getBranchQuota(activeContract) }}</strong> 台
                </div>
            </div>

            <el-table :data="activeContractMockVehicles" style="width: 100%" size="small" border stripe height="300">
                <el-table-column prop="license" label="车牌号" width="120">
                    <template #default="{ row }">
                        <span class="font-bold text-gray-800">{{ row.license }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="model" label="车型" min-width="150"></el-table-column>
                <el-table-column prop="bindDate" label="绑定时间" width="160" align="center"></el-table-column>
                <el-table-column prop="status" label="运营状态" width="100" align="center">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'" size="small" effect="plain">
                            {{ row.status === 'ACTIVE' ? '上架中' : '已下架' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="90" align="center">
                    <template #default="{ row }">
                        <el-button type="danger" link size="small"
                            @click="unbindVehicleFromContract(row)">解绑</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div v-if="activeContractMockVehicles.length === 0" class="text-center py-6 text-gray-400 text-sm">
                当前合约暂未绑定任何车辆
            </div>

            <template #footer>
                <el-button type="primary" plain @click="modals.vehicles = false">关闭</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="modals.prototypeLog" title="原型修改记录" width="520px">
            <div class="space-y-4">
                <div class="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <div class="flex items-center justify-between gap-3">
                        <div class="font-semibold text-gray-800">v1.1｜合约配额列展示调整</div>
                        <el-tag type="info" effect="plain">2026-06-30</el-tag>
                    </div>
                    <div class="text-sm text-gray-500 mt-1">页面：合约配额管理</div>
                </div>
                <div class="text-sm text-gray-700 leading-6">
                    <div class="font-semibold text-gray-800 mb-1">修改内容</div>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>配额使用情况列增加总公司视角的待分配配额显示。</li>
                        <li>分公司视角增加剩余可绑定配额显示。</li>
                        <li>总公司视角的已下发数字和进度条统一使用浅蓝色 <span class="font-mono text-sky-500">#38bdf8</span>。</li>
                        <li>原配额使用情况结构已在源码中保留注释备份，便于回退。</li>
                    </ul>
                </div>
                <div class="text-xs text-gray-400 border-t pt-3">
                    该记录用于原型评审和交付追踪，不代表真实系统功能入口。
                </div>
            </div>
            <template #footer>
                <el-button type="primary" @click="modals.prototypeLog = false">关闭</el-button>
            </template>
        </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// UI & Environment State
const currentUserRole = ref('HEADQUARTERS'); // 'HEADQUARTERS' or 'BRANCH'
const MY_BRANCH_ID = 'B03'; // When in Branch view, we simulate B03

const TODAY = new Date();
const getFutureDateStr = (days) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};
const getPastDateStr = (days) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
};

// Shared Reference Data
const branchOptions = ref([
    { id: 'B01', name: '华北一分公司' },
    { id: 'B02', name: '华北二分公司' },
    { id: 'B03', name: '华南一分公司 (开发)' },
    { id: 'B04', name: '华东区分公司' }
]);

// Mock Data for Contracts
const contractsData = ref([
    {
        id: 'C-2023-0801', name: '集团统采租赁计划A', type: 'OFFICIAL', billing: 'ANNUALLY', settlementParty: '格上租車',
        startDate: getPastDateStr(100), endDate: getFutureDateStr(300),
        totalQuota: 50, allocatedQuota: 30, allocations: [{ branchId: 'B01', amount: 10, date: '2023-08-01' }, { branchId: 'B03', amount: 20, date: '2023-08-15' }]
    },
    {
        id: 'C-2024-0012', name: '华北区分采补充审批单', type: 'OFFICIAL', billing: 'MONTHLY', settlementParty: '和運租車',
        startDate: getPastDateStr(20), endDate: getFutureDateStr(100),
        totalQuota: 120, allocatedQuota: 120, allocations: [{ branchId: 'B02', amount: 120, date: '2024-01-12' }]
    },
    {
        id: 'C-2024-0999', name: '临时调用保障', type: 'TRIAL', billing: 'MONTHLY', settlementParty: '中租租車',
        startDate: getPastDateStr(15), endDate: getFutureDateStr(10), // Expiring Soon (<15 days)
        totalQuota: 10, allocatedQuota: 5, allocations: [{ branchId: 'B03', amount: 5, date: '2024-02-01' }]
    },
    {
        id: 'C-2022-X773', name: '旧批次试运营采购', type: 'TRIAL', billing: 'MONTHLY', settlementParty: '本企业',
        startDate: getPastDateStr(400), endDate: getPastDateStr(35), // Expired
        totalQuota: 20, allocatedQuota: 20, allocations: [{ branchId: 'B04', amount: 20, date: '2022-05-10' }]
    },
    {
        id: 'C-2024-08X2', name: '集团储备车辆扩容包', type: 'OFFICIAL', billing: 'ANNUALLY', settlementParty: '艾維士租車',
        startDate: getPastDateStr(2), endDate: getFutureDateStr(360),
        totalQuota: 200, allocatedQuota: 0, allocations: []
    },
    {
        id: 'C-2024-09Y3', name: '华南区新签测试合同', type: 'OFFICIAL', billing: 'MONTHLY', settlementParty: '本企业',
        startDate: getFutureDateStr(1), endDate: getFutureDateStr(30), statusOverride: 'PAYING',
        totalQuota: 40, allocatedQuota: 0, allocations: []
    },
    {
        id: 'C-2025-F811', name: '快手同城地推车队', type: 'OFFICIAL', billing: 'ANNUALLY', settlementParty: '中租租車',
        startDate: getPastDateStr(200), endDate: getFutureDateStr(165), statusOverride: 'TERMINATED',
        totalQuota: 100, allocatedQuota: 0, allocations: []
    }
]);

// Filters
const filters = reactive({
    query: '',
    type: 'ALL',
    billing: 'ALL',
    status: 'ALL',
    allocation: 'ALL',
    quick: ''
});
const activeSummaryCard = ref('');

// Modal States
const modals = reactive({
    allocate: false,
    details: false,
    adjust: false,
    vehicles: false,
    prototypeLog: false
});

const activeContract = ref(null);
const activeAllocations = ref([]);
const activeAllocation = ref(null);
const activeContractMockVehicles = ref([]);
const allocateForm = reactive({ branchId: '', amount: 1 });
const adjustForm = reactive({ amount: 0 });

const adjustMaxAmount = computed(() => {
    if (!activeContract.value || !activeAllocation.value) return 0;
    return activeContract.value.totalQuota - activeContract.value.allocatedQuota + activeAllocation.value.amount;
});

// Computed Logic
const getDaysRemaining = (endStr) => {
    const diffTime = Math.abs(new Date(endStr) - TODAY);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return new Date(endStr) >= TODAY ? diffDays : -diffDays;
};

const getStatusProp = (row) => {
    if (row.statusOverride) return row.statusOverride;
    const days = getDaysRemaining(row.endDate);
    if (days < 0) return 'EXPIRED';
    if (days >= 0 && days < 15) return 'EXPIRING_SOON';
    return 'ACTIVE';
};

// The actual filtered data list based on role + selections
const filteredData = computed(() => {
    let baseData = contractsData.value;

    // Branch view logic
    if (currentUserRole.value === 'BRANCH') {
        // Only show contracts that have an allocation for MY_BRANCH_ID
        baseData = baseData.filter(v => v.allocations.some(a => a.branchId === MY_BRANCH_ID));
    }

    return baseData.filter(v => {
        const sStatus = getStatusProp(v);

        // Text Search
        if (filters.query && !v.id.includes(filters.query) && !v.name.includes(filters.query)) return false;

        // Dropdowns
        if (filters.type !== 'ALL' && v.type !== filters.type) return false;
        if (filters.billing !== 'ALL' && v.billing !== filters.billing) return false;
        if (filters.status !== 'ALL' && sStatus !== filters.status) return false;

        // Allocation Filter (HQ ONLY)
        if (currentUserRole.value === 'HEADQUARTERS' && filters.allocation !== 'ALL') {
            if (filters.allocation === 'FULL' && v.allocatedQuota < v.totalQuota) return false;
            if (filters.allocation === 'UNASSIGNED' && v.allocatedQuota > 0) return false;
            if (filters.allocation === 'PARTIAL' && (v.allocatedQuota === 0 || v.allocatedQuota === v.totalQuota)) return false;
        }
        if (filters.quick === 'ALLOCATED_QUOTA' && v.allocatedQuota === 0) return false;
        if (filters.quick === 'UNALLOCATED_QUOTA' && v.allocatedQuota >= v.totalQuota) {
            return false;
        }

        return true;
    });
});

// Dashboard stats
const statsHQ = computed(() => {
    let totalContracts = contractsData.value.length;
    let totalQuota = 0, allocatedQuota = 0;
    contractsData.value.forEach(v => {
        totalQuota += v.totalQuota;
        allocatedQuota += v.allocatedQuota;
    });
    return { totalContracts, totalQuota, allocatedQuota, unallocatedQuota: totalQuota - allocatedQuota };
});

const statsBranch = computed(() => {
    let contracts = 0;
    let quota = 0;
    contractsData.value.forEach(v => {
        const myAlloc = v.allocations.find(a => a.branchId === MY_BRANCH_ID);
        if (myAlloc) {
            contracts++;
            // only active quotas compute? For now compute all lifetime
            quota += myAlloc.amount;
        }
    });

});

// Helpers
const getBranchName = (id) => {
    const b = branchOptions.value.find(x => x.id === id);
    return b ? b.name : id;
};

const getBranchQuota = (row) => {
    const myAlloc = row.allocations.find(a => a.branchId === MY_BRANCH_ID);
    return myAlloc ? myAlloc.amount : 0;
};

const getBranchUsedQuotaById = (row, branchId) => {
    const myAlloc = row.allocations.find(a => a.branchId === branchId);
    const alloc = myAlloc ? myAlloc.amount : 0;
    if (alloc === 0) return 0;

    // Same mock rendering logic per branch length, keeping consistency
    if (row.id === 'C-2023-0801') return Math.min(alloc, 15);
    if (row.id === 'C-2024-0999') return Math.min(alloc, 2);
    return Math.min(alloc, 0);
};

const getBranchUsedQuota = (row) => {
    return getBranchUsedQuotaById(row, MY_BRANCH_ID);
};

const generateMockVehiclesForBranch = (row) => {
    const used = getBranchUsedQuota(row);
    let arr = [];
    for (let i = 0; i < used; i++) {
        arr.push({
            license: `粤B·D${row.id.substr(row.id.length - 2)}${100 + i}`,
            model: '吉利 雷达RD6 550km (皮卡)',
            bindDate: row.allocations.find(a => a.branchId === MY_BRANCH_ID).date,
            status: i % 2 === 0 ? 'ACTIVE' : 'INACTIVE'
        });
    }
    return arr;
};

const getStatusText = (row) => {
    const s = getStatusProp(row);
    if (s === 'PAYING') return '付款确认中';
    if (s === 'EXTIRED' || s === 'EXPIRED') return '已过期';
    if (s === 'EXPIRING_SOON') return '即将到期';
    if (s === 'TERMINATED') return '已终止';
    return '生效中';
};

const getStatusColorClass = (row) => {
    const s = getStatusProp(row);
    if (s === 'PAYING') return 'text-blue-600';
    if (s === 'EXPIRED') return 'text-red-600';
    if (s === 'EXPIRING_SOON') return 'text-amber-600';
    if (s === 'TERMINATED') return 'text-gray-700 decoration-gray-400 line-through';
    return 'text-emerald-600';
};

const getStatusDotClass = (row) => {
    const s = getStatusProp(row);
    if (s === 'PAYING') return 'bg-blue-500';
    if (s === 'EXPIRED') return 'bg-red-500';
    if (s === 'EXPIRING_SOON') return 'bg-amber-500';
    if (s === 'TERMINATED') return 'bg-gray-600';
    return 'bg-emerald-500';
};

const getProgressColor = (row) => {
    return '#38bdf8';
};

const getBranchProgressColor = (row) => {
    const total = getBranchQuota(row);
    if (total === 0) return '#cbd5e1';
    const percent = Math.round((getBranchUsedQuota(row) / total) * 100);
    if (percent >= 100) return '#ef4444'; // Red for max capacity reached
    if (percent > 80) return '#f59e0b'; // Amber warning
    return '#10b981'; // Emerald OK
};

// Actions
const handleRoleChange = () => {
    // Reset filters that apply to the other role
    filters.allocation = 'ALL';
    filters.quick = '';
    activeSummaryCard.value = '';
};

const clearContractFilters = () => {
    filters.query = '';
    filters.type = 'ALL';
    filters.billing = 'ALL';
    filters.status = 'ALL';
    filters.allocation = 'ALL';
    filters.quick = '';
};

const applySummaryFilter = (type) => {
    if (activeSummaryCard.value === type) {
        activeSummaryCard.value = '';
        clearContractFilters();
        return;
    }

    activeSummaryCard.value = type;
    clearContractFilters();

    if (type === 'allocatedQuota') {
        filters.quick = 'ALLOCATED_QUOTA';
        return;
    }
    if (type === 'unallocatedQuota') {
        filters.quick = 'UNALLOCATED_QUOTA';
    }
};

const openAllocateModal = (row) => {
    activeContract.value = row;
    allocateForm.branchId = '';
    allocateForm.amount = 1;
    modals.allocate = true;
};

const aggregatedAllocations = computed(() => {
    if (!activeContract.value) return [];
    const map = {};
    // Aggregate allocations per branch, summing amounts
    activeContract.value.allocations.forEach(a => {
        if (!map[a.branchId]) {
            map[a.branchId] = { branchId: a.branchId, amount: 0, originalRow: a };
        }
        map[a.branchId].amount += a.amount;
    });
    return Object.values(map);
});

const openDetailsModal = (row) => {
    activeContract.value = row;
    modals.details = true;
};

const openAdjustModal = (row) => {
    // For adjust, we use the aggregated view now. So we map changes back to all original allocations
    // Or realistically, replace logic with targeting the aggregated modal amounts
    activeAllocation.value = row;
    adjustForm.amount = row.amount;
    modals.adjust = true;
};

const confirmAdjust = () => {
    if (!activeContract.value || !activeAllocation.value) return;
    const diff = adjustForm.amount - activeAllocation.value.amount;

    // find all old allocations for this branch and wipe them
    const oldAllocations = activeContract.value.allocations.filter(a => a.branchId === activeAllocation.value.branchId);

    if (adjustForm.amount === 0) {
        // remove all matching
        activeContract.value.allocations = activeContract.value.allocations.filter(a => a.branchId !== activeAllocation.value.branchId);
    } else {
        // wipe and replace with single consolidated row
        activeContract.value.allocations = activeContract.value.allocations.filter(a => a.branchId !== activeAllocation.value.branchId);
        activeContract.value.allocations.push({
            branchId: activeAllocation.value.branchId,
            amount: adjustForm.amount,
            date: new Date().toISOString().split('T')[0]
        });
    }

    activeContract.value.allocatedQuota += diff;

    ElMessage.success(`配额调整成功`);
    modals.adjust = false;
};

const openVehiclesModal = (row) => {
    activeContract.value = row;
    activeContractMockVehicles.value = generateMockVehiclesForBranch(row);
    modals.vehicles = true;
};

const unbindVehicleFromContract = (vehicleRow) => {
    ElMessageBox.confirm(`确定要将车辆 ${vehicleRow.license} 从当前合约解绑吗？`, '解绑确认', {
        confirmButtonText: '确定解绑',
        cancelButtonText: '取消',
        type: 'warning'
    }).then(() => {
        const index = activeContractMockVehicles.value.findIndex(v => v.license === vehicleRow.license);
        if (index > -1) {
            activeContractMockVehicles.value.splice(index, 1);
            ElMessage.success(`车辆 ${vehicleRow.license} 已成功解绑`);
        }
    }).catch(() => { });
};

const confirmAllocation = () => {
    const row = activeContract.value;
    if (!row) return;

    const amountToAllocate = allocateForm.amount;
    row.allocatedQuota += amountToAllocate;

    // Append Allocation
    const todayStr = new Date().toISOString().split('T')[0];
    row.allocations.push({
        branchId: allocateForm.branchId,
        amount: amountToAllocate,
        date: todayStr
    });

    ElMessage.success(`成功向分公司下发 ${amountToAllocate} 台配额`);
    modals.allocate = false;
};
</script>

<style scoped>
.contract-quotas-page {
    min-height: 100%;
}

/* Value Highlight Custom UI */
.card-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
}

:deep(.el-table th.el-table__cell) {
    background: #f8fafc !important;
    color: #475569;
}
</style>
