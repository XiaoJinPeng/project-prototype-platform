<template>
<main class="official-vehicle-contracts-page">
            
            

            
            <div class="space-y-6 custom-scroll">
                
                <div class="flex justify-between items-end mb-2">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">公务车辆合约管理</h1>
                        <p class="text-gray-500 text-sm mt-1">资产分配与财务核算，基于承租方建立合约结构，锁定底层车辆池资产。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20"
                            @click="openWizard">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新签合约
                        </el-button>
                    </div>
                </div>

                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div                         class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div                             class="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110">
                        </div>
                        <span class="text-sm text-gray-500 font-medium mb-1 relative z-10">生效中合约</span>
                        <div class="flex items-center gap-2 relative z-10">
                            <span class="card-value text-emerald-600">{{ dashboardStats.active }}</span>
                            <span class="text-xs text-gray-400">份</span>
                        </div>
                    </div>
                    
                    <div                         class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div                             class="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110">
                        </div>
                        <span class="text-sm text-gray-500 font-medium mb-1 relative z-10 text-gray-600">已终止合约</span>
                        <div class="flex items-center gap-2 relative z-10">
                            <span class="card-value text-gray-600">{{ dashboardStats.terminated }}</span>
                            <span class="text-xs text-gray-400">强制关停</span>
                        </div>
                    </div>
                    
                    <div                         class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow">
                        <div                             class="absolute right-0 top-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110">
                        </div>
                        <span                             class="text-sm text-gray-500 font-medium mb-1 relative z-10 text-amber-600">临近/已过期合约</span>
                        <div class="flex items-center gap-2 relative z-10">
                            <span class="card-value text-amber-500">{{ dashboardStats.expiringOrExpired }}</span>
                            <span class="text-xs text-gray-400">存在业务风险</span>
                        </div>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center">
                        <el-input v-model="filters.query" placeholder="搜索合约编号 / 合约名称" prefix-icon="Search" clearable
                            style="width: 240px"></el-input>

                        <el-select v-model="filters.tenant" placeholder="实际用车企业" clearable style="width: 160px">
                            <el-option v-for="t in tenantOptions" :key="t" :label="t" :value="t"></el-option>
                        </el-select>

                        <el-select v-model="filters.payer" placeholder="结算代付方" clearable style="width: 160px">
                            <el-option v-for="p in payerOptions" :key="p.name" :label="p.name"
                                :value="p.name"></el-option>
                        </el-select>

                        <el-select v-model="filters.type" placeholder="合约类型" clearable style="width: 130px">
                            <el-option label="试用" value="TRIAL"></el-option>
                            <el-option label="正式" value="OFFICIAL"></el-option>
                        </el-select>

                        <el-select v-model="filters.status" placeholder="状态" clearable style="width: 140px">
                            <el-option label="草稿" value="DRAFT"></el-option>
                            <el-option label="待客户支付" value="PENDING_PAYMENT"></el-option>
                            <el-option label="生效中" value="ACTIVE"></el-option>
                            <el-option label="即将到期" value="EXPIRING"></el-option>
                            <el-option label="已终止" value="TERMINATED"></el-option>
                            <el-option label="已过期" value="EXPIRED"></el-option>
                            <el-option label="已作废" value="VOID"></el-option>
                        </el-select>
                    </div>

                    
                    <el-table :data="filteredTableData" style="width: 100%" class="custom-table" v-loading="loading">
                        <el-table-column label="合约编号与名称" min-width="220">
                            <template #default="{ row }">
                                <div class="font-mono text-gray-800 text-sm font-semibold">{{ row.id }}</div>
                                <div class="text-xs text-gray-500 mt-1 truncate" :title="row.name">{{ row.name }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="用车与结算方" min-width="240">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-800">{{ row.tenant }}</div>
                                <div v-if="row.tenant !== row.payer"
                                    class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <span                                         class="bg-gray-100 text-gray-500 px-1 py-0.5 rounded text-[10px] ring-1 ring-inset ring-gray-200">[第三方代付]</span>
                                    <span class="truncate" :title="row.payer">{{ row.payer }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="属性" width="140">
                            <template #default="{ row }">
                                <div class="flex flex-col gap-1 items-start">
                                    <el-tag v-if="row.type === 'TRIAL'" type="info" size="small" effect="plain"
                                        class="border-blue-200 text-blue-600 bg-blue-50">试用</el-tag>
                                    <el-tag v-if="row.type === 'OFFICIAL'" type="success" size="small" effect="light"
                                        class="text-emerald-600 bg-emerald-50 border-emerald-200">正式</el-tag>
                                    <span class="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{
                                        renderBillingType(row.billing) }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="配额资产" width="100" align="center">
                            <template #default="{ row }">
                                <div class="text-lg font-bold text-gray-800">{{ row.vehicleCount }} <span                                         class="text-xs font-normal text-gray-500">台</span></div>
                            </template>
                        </el-table-column>

                        <el-table-column label="合约金额" width="140" align="right">
                            <template #default="{ row }">
                                <div class="text-sm font-semibold text-gray-800">{{ formatCurrency(row.totalAmount) }}
                                    <span class="text-xs text-gray-500 font-normal ml-0.5">/ {{ row.billing ===
                                        'ANNUALLY' ? '年' : (row.billing === 'MONTHLY' ? '月' : '次') }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="有效期" min-width="200">
                            <template #default="{ row }">
                                <div class="text-xs text-gray-600 font-mono tracking-tight flex flex-col gap-1">
                                    <span>{{ row.startDate }} <span class="text-gray-400 font-sans mx-0.5">至</span> {{
                                        row.endDate }}</span>
                                    <div v-if="(row.status === 'ACTIVE' || row.status === 'EXPIRING') && getDaysRemaining(row.endDate) >= 0 && getDaysRemaining(row.endDate) < 15"
                                        class="inline-block self-start text-amber-500 font-semibold bg-amber-50 px-1.5 py-0.5 rounded ring-1 ring-inset ring-amber-100 text-[10px]">
                                        临近到期</div>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" width="120">
                            <template #default="{ row }">
                                <div class="flex items-center gap-1.5">
                                    <div :class="getStatusDotClass(row.status)"></div>
                                    <span :class="getStatusTextClass(row.status)">{{ getStatusLabel(row.status)
                                        }}</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="180" fixed="right">
                            <template #default="{ row }">
                                <div class="flex items-center gap-2">
                                    <el-button link type="primary" size="small">查看</el-button>

                                    <el-button v-if="['ACTIVE', 'EXPIRING'].includes(row.status)" type="warning"
                                        size="small" @click="terminateContract(row)">
                                        中止合约
                                    </el-button>

                                    <el-button v-if="['DRAFT', 'PENDING_PAYMENT'].includes(row.status)" type="danger"
                                        link size="small" @click="revokeContract(row)">
                                        撤销释放
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </main>

        
        <el-dialog v-model="showWizardDrawer" title="新建公务车合约" width="700px" :destroy-on-close="true"
            :before-close="handleWizardClose">
            <div class="p-2">
                <el-form :model="wizardForm" :rules="wizardRules" ref="wizardFormRef" label-position="top">

                    <div class="bg-gray-50/50 p-5 rounded-xl border border-gray-100 mb-5 relative overflow-hidden">
                        <div class="absolute right-0 top-0 w-16 h-16 bg-blue-50/50 rounded-bl-full -mr-4 -mt-4"></div>
                        <h3 class="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                            <div class="w-1 h-3 bg-theme-primary rounded"></div> 基本信息
                        </h3>

                        <el-form-item label="合约名称" prop="name">
                            <el-input v-model="wizardForm.name" placeholder="请输入合约名称"></el-input>
                        </el-form-item>

                        <el-form-item label="实际用车企业 (Tenant)" prop="tenant">
                            <el-select v-model="wizardForm.tenant" placeholder="请选择实际用车企业" filterable class="w-full">
                                <el-option v-for="t in tenantOptions" :key="t" :label="t" :value="t"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="结算代付方 (Payer)" prop="payer">
                            <div class="flex items-center gap-2 w-full">
                                <el-select v-model="wizardForm.payer" placeholder="选择第三方代付企业" filterable class="flex-1"
                                    :disabled="wizardForm.sameAsTenant">
                                    <el-option v-for="p in payerOptions" :key="p.name" :label="p.name" :value="p.name">
                                        <div class="flex items-center justify-between w-full">
                                            <span>{{ p.name }}</span>
                                            <span class="text-xs text-gray-400">统编: {{ p.taxId }}</span>
                                        </div>
                                    </el-option>
                                </el-select>
                                <el-button type="primary" plain @click="openPayerManageDialog"
                                    :disabled="wizardForm.sameAsTenant">管理</el-button>
                            </div>
                            <div class="mt-2 text-sm text-gray-500 flex items-center gap-2">
                                <el-checkbox v-model="wizardForm.sameAsTenant" @change="handleSameAsTenantChange"
                                    label="同实际用车企业 (内部直拨归账)"></el-checkbox>
                            </div>
                        </el-form-item>
                    </div>

                    <div class="bg-gray-50/50 p-5 rounded-xl border border-gray-100 relative overflow-hidden">
                        <div class="absolute right-0 top-0 w-16 h-16 bg-emerald-50/50 rounded-bl-full -mr-4 -mt-4">
                        </div>
                        <h3 class="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 relative z-10">
                            <div class="w-1 h-3 bg-emerald-500 rounded"></div> 核心参数
                        </h3>

                        <el-form-item label="合约属性" prop="type">
                            <el-radio-group v-model="wizardForm.type" size="default">
                                <el-radio-button label="OFFICIAL">正式运营</el-radio-button>
                                <el-radio-button label="TRIAL">试用保障</el-radio-button>
                            </el-radio-group>
                        </el-form-item>

                        <el-form-item label="计费结算规模与方式">
                            <div class="flex gap-3 w-full items-center">
                                <el-input-number v-model="wizardForm.quota" :min="1" :step="1" placeholder="台数"
                                    class="flex-1" controls-position="right"></el-input-number>
                                <div class="text-xs text-gray-500 shrink-0 pl-1" style="width: 56px;">台</div>
                                <el-select v-model="wizardForm.billing" class="flex-1 w-full shrink-0">
                                    <el-option label="按月结付" value="MONTHLY"></el-option>
                                    <el-option label="年度统付" value="ANNUALLY"></el-option>
                                </el-select>
                            </div>
                        </el-form-item>

                        
                        <el-form-item label="合约期数与开始时间" class="mb-0">
                            <div class="flex gap-3 w-full items-center">
                                <el-input-number v-model="wizardForm.durationMonths" :min="1" :step="1"
                                    placeholder="期数" class="flex-1" controls-position="right"></el-input-number>
                                <div class="text-xs text-gray-500 shrink-0 pl-1" style="width: 56px;">期({{ wizardForm.billing === 'ANNUALLY' ? '年' : '月' }})</div>
                                <el-date-picker v-model="wizardForm.startDate" type="date" placeholder="选择生效日期"
                                    class="flex-1 w-full shrink-0" value-format="YYYY-MM-DD"></el-date-picker>
                            </div>
                        </el-form-item>
                    </div>

                    
                    <div                         class="mt-4 bg-orange-50/50 border border-orange-100 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <div class="text-xs text-orange-600 font-medium mb-1">系统测算参考价</div>
                        </div>
                        <div class="text-right">
                            <span class="text-2xl font-bold text-orange-600 font-mono">{{
                                calculatedReferencePrice.amount }}</span>
                            <span class="text-sm text-orange-500 ml-1">{{ calculatedReferencePrice.suffix }}</span>
                        </div>
                    </div>

                </el-form>
            </div>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showWizardDrawer = false">取消</el-button>
                    <el-button type="primary" @click="submitWizard" :loading="submitLoading">
                        确认建档
                    </el-button>
                </span>
            </template>
        </el-dialog>

        
        <el-dialog v-model="showPayerManageDialog" title="结算代付方管理" width="700px" append-to-body>
            <div class="px-2 pb-4">
                <div class="flex justify-between items-center mb-4">
                    <div class="text-sm text-gray-500">管理所有的系统结算代付企业档案</div>
                    <el-button type="primary" @click="openAddPayerDialog">
                        <el-icon class="mr-1">
                            <Plus></Plus>
                        </el-icon> 新增结算方
                    </el-button>
                </div>

                <el-table :data="payerOptions" style="width: 100%" border size="small" highlight-current-row>
                    <el-table-column prop="name" label="企业名称" min-width="150"></el-table-column>
                    <el-table-column prop="taxId" label="统编" width="100"></el-table-column>
                    <el-table-column prop="contact" label="企业联系人" width="100"></el-table-column>
                    <el-table-column prop="phone" label="联系方式" width="130"></el-table-column>
                    <el-table-column label="操作" width="120" fixed="right" align="center">
                        <template #default="{ row, $index }">
                            <el-button link type="primary" size="small"
                                @click="openEditPayerDialog(row, $index)">编辑</el-button>
                            <el-button link type="danger" size="small" @click="deletePayer($index)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>

        
        <el-dialog v-model="showPayerFormDialog" :title="payerFormMode === 'add' ? '新增结算代付企业' : '编辑结算代付企业'"
            width="450px" append-to-body>
            <div class="px-2">
                <el-form :model="payerForm" :rules="payerRules" ref="payerFormRef" label-position="top">
                    <el-form-item label="企业名称" prop="name">
                        <el-input v-model="payerForm.name" placeholder="请输入完整的企业名称"></el-input>
                    </el-form-item>
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="统一代码/统编" prop="taxId">
                                <el-input v-model="payerForm.taxId" placeholder="统编号码"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="企业联系人" prop="contact">
                                <el-input v-model="payerForm.contact" placeholder="联系人姓名"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="联系方式 (电话/邮箱)" prop="phone">
                        <el-input v-model="payerForm.phone" placeholder="请输入有效联系方式"></el-input>
                    </el-form-item>
                </el-form>
                <div v-if="payerFormMode === 'add'"
                    class="mt-4 bg-blue-50 text-blue-800 text-xs p-3 rounded flex items-start gap-2 border border-blue-100">
                    <el-icon class="mt-0.5 text-blue-600">
                        <InfoFilled></InfoFilled>
                    </el-icon>
                    <div>新增后的结算方信息将自动保存，并在表单可用。</div>
                </div>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showPayerFormDialog = false">取消</el-button>
                    <el-button type="primary" @click="submitPayerForm">
                        {{ payerFormMode === 'add' ? '确认添加' : '保存修改' }}
                    </el-button>
                </span>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";

const loading = ref(false);

// Mock Option Data
                const tenantOptions = ref(['腾讯科技', '字节跳动', '阿里巴巴', '美团点评', '快手科技', '网易公司']);
                const payerOptions = ref([
                    { name: '格上租車', taxId: '84042456', contact: '张三', phone: '0912-345-678' },
                    { name: '和運租車', taxId: '22345678', contact: '李四', phone: '0922-345-678' },
                    { name: '中租租車', taxId: '12345678', contact: '王五', phone: '0933-345-678' },
                    { name: '本企业', taxId: '98765432', contact: '内部调度', phone: '10086' },
                    { name: '艾維士租車', taxId: '87654321', contact: 'Avis专员', phone: '0988-345-678' }
                ]);

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

                // Generate Mock Available Vehicles for Transfer component
                const generateMockVehicles = () => {
                    const brands = ['奥迪A6L', '奔驰E300L', '宝马530Li', '丰田埃尔法', '别克GL8', '特斯拉 Model Y'];
                    const data = [];
                    for (let i = 1; i <= 25; i++) {
                        const brand = brands[Math.floor(Math.random() * brands.length)];
                        data.push({
                            key: `V-2026-${i.toString().padStart(4, '0')}`,
                            label: `京A·${(10000 + i).toString()} (${brand})`,
                            disabled: i % 10 === 0 // just mock some disabled ones
                        });
                    }
                    return data;
                };

                const availableVehicles = ref(generateMockVehicles());

                // Mock List Data
                const contractsData = ref([
                    {
                        id: 'OC-2026-0001', name: '腾讯高管用车保障包', tenant: '腾讯科技', payer: '腾讯科技', type: 'OFFICIAL', billing: 'ANNUALLY',
                        vehicleCount: 15, totalAmount: 1250000.00, startDate: getPastDateStr(30), endDate: getFutureDateStr(335), status: 'ACTIVE'
                    },
                    {
                        id: 'OC-2026-0005', name: '字节跳动临时活动保障车队', tenant: '字节跳动', payer: '和運租車', type: 'TRIAL', billing: 'MONTHLY',
                        vehicleCount: 5, totalAmount: 85000.00, startDate: getPastDateStr(5), endDate: getFutureDateStr(5), status: 'EXPIRING' // Expiring soon (<15d)
                    },
                    {
                        id: 'OC-2026-0012', name: '阿里大文娱外协剧组用车', tenant: '阿里巴巴', payer: '艾維士租車', type: 'OFFICIAL', billing: 'MONTHLY',
                        vehicleCount: 0, totalAmount: 650000.00, startDate: getFutureDateStr(2), endDate: getFutureDateStr(92), status: 'TERMINATED'
                    },
                    {
                        id: 'OC-2025-X092', name: '美团买菜城市拓展试点', tenant: '美团点评', payer: '美团点评', type: 'TRIAL', billing: 'MONTHLY',
                        vehicleCount: 2, totalAmount: 12000.00, startDate: getPastDateStr(100), endDate: getPastDateStr(10), status: 'EXPIRED'
                    },
                    {
                        id: 'OC-2025-F811', name: '快手同城地推车队', tenant: '快手科技', payer: '中租租車', type: 'OFFICIAL', billing: 'ANNUALLY',
                        vehicleCount: 0, totalAmount: 0.00, startDate: getPastDateStr(200), endDate: getFutureDateStr(165), status: 'TERMINATED'
                    }
                ]);

                // Filter logic
                const filters = reactive({
                    query: '',
                    tenant: '',
                    payer: '',
                    type: '',
                    status: ''
                });

                const filteredTableData = computed(() => {
                    return contractsData.value.filter(item => {
                        const matchQuery = !filters.query || item.id.includes(filters.query) || item.name.includes(filters.query);
                        const matchTenant = !filters.tenant || item.tenant === filters.tenant;
                        const matchPayer = !filters.payer || item.payer === filters.payer;
                        const matchType = !filters.type || item.type === filters.type;
                        const matchStatus = !filters.status || item.status === filters.status;
                        return matchQuery && matchTenant && matchPayer && matchType && matchStatus;
                    });
                });

                // Dashboard stats
                const dashboardStats = computed(() => {
                    return {
                        active: contractsData.value.filter(c => c.status === 'ACTIVE').length,
                        terminated: contractsData.value.filter(c => c.status === 'TERMINATED').length,
                        expiringOrExpired: contractsData.value.filter(c => {
                            if (c.status === 'EXPIRED' || c.status === 'EXPIRING') return true;
                            if (c.status !== 'ACTIVE') return false;
                            const d = getDaysRemaining(c.endDate);
                            return d >= 0 && d < 15;
                        }).length
                    };
                });

                // Wizard State
                const showWizardDrawer = ref(false);
                const wizardStep = ref(0);
                const submitLoading = ref(false);
                const wizardFormRef = ref(null);

                                const wizardForm = reactive({
                    tenant: '',
                    sameAsTenant: false,
                    payer: '',
                    name: '',
                    type: 'OFFICIAL',
                    quota: 1,
                    billing: 'MONTHLY',
                    durationMonths: 1,
                    startDate: '',
                    monthlyRate: '',
                    annualRate: '',
                    pickupLocation: '',
                    billingReminder: '',
                    billingContact: '',
                    billingEmail: '',
                });

                const wizardRules = {
                    name: [{ required: true, message: '请输入合约名称', trigger: 'blur' }],
                    tenant: [{ required: true, message: '承租方必须存在', trigger: 'blur' }],
                    payer: [{ required: true, message: '请选择或输入结算代付企业', trigger: 'change' }],
                    durationMonths: [{ required: true, message: '请输入合约期数', trigger: 'blur' }],
                    startDate: [{ required: true, message: '请选择开始时间', trigger: 'change' }]
                };

                // Payer Management Logic
                const handleSameAsTenantChange = (val) => {
                    if (val) {
                        wizardForm.payer = wizardForm.tenant;
                    } else if (wizardForm.payer === wizardForm.tenant) {
                        wizardForm.payer = ''; // Clear if they uncheck and it was still the tenant
                    }
                };

                const showPayerManageDialog = ref(false);
                const openPayerManageDialog = () => {
                    showPayerManageDialog.value = true;
                };

                const deletePayer = (index) => {
                    ElMessageBox.confirm('确定要删除此结算方吗？', '提示', { type: 'warning' }).then(() => {
                        const deleted = payerOptions.value.splice(index, 1)[0];
                        if (wizardForm.payer === deleted.name) {
                            wizardForm.payer = ''; // clear if selected is deleted
                        }
                        ElMessage.success('结算方已删除');
                    }).catch(() => { });
                };

                // Add/Edit Payer Form Logic
                const showPayerFormDialog = ref(false);
                const payerFormMode = ref('add');
                const editingPayerIndex = ref(-1);

                const payerFormRef = ref(null);
                const payerForm = reactive({ name: '', taxId: '', contact: '', phone: '' });
                const payerRules = {
                    name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
                    taxId: [{ required: true, message: '请输入统编号码', trigger: 'blur' }],
                    contact: [{ required: true, message: '请输入联系人', trigger: 'blur' }]
                };

                const openAddPayerDialog = () => {
                    payerFormMode.value = 'add';
                    payerForm.name = '';
                    payerForm.taxId = '';
                    payerForm.contact = '';
                    payerForm.phone = '';
                    if (payerFormRef.value) payerFormRef.value.clearValidate();
                    showPayerFormDialog.value = true;
                };

                const openEditPayerDialog = (row, index) => {
                    payerFormMode.value = 'edit';
                    editingPayerIndex.value = index;
                    payerForm.name = row.name;
                    payerForm.taxId = row.taxId;
                    payerForm.contact = row.contact;
                    payerForm.phone = row.phone;
                    if (payerFormRef.value) payerFormRef.value.clearValidate();
                    showPayerFormDialog.value = true;
                };

                const submitPayerForm = () => {
                    payerFormRef.value.validate().then(valid => {
                        if (valid) {
                            if (payerFormMode.value === 'add') {
                                payerOptions.value.unshift({ ...payerForm });
                                wizardForm.payer = payerForm.name; // auto select if created from wizard
                                ElMessage.success('结算方企业添加成功！');
                            } else {
                                const oldName = payerOptions.value[editingPayerIndex.value].name;
                                payerOptions.value[editingPayerIndex.value] = { ...payerForm };
                                if (wizardForm.payer === oldName) {
                                    wizardForm.payer = payerForm.name; // stay selected if name changed
                                }
                                ElMessage.success('结算方企业修改成功！');
                            }
                            showPayerFormDialog.value = false;
                        }
                    }).catch(() => { });
                };

                const calculatedReferencePrice = computed(() => {
                    const pricePerCarMonthly = 6500;
                    const pricePerCarYearly = 72000;

                    if (!wizardForm.startDate || !wizardForm.durationMonths) {
                        return { amount: '￥ 0.00', suffix: '(缺少日期参数)' };
                    }

                    let displayAmount = 0;
                    let displaySuffix = '';

                    if (wizardForm.billing === 'MONTHLY') {
                        displayAmount = wizardForm.quota * pricePerCarMonthly;
                        displaySuffix = '/ 月';
                    } else {
                        displayAmount = wizardForm.quota * pricePerCarYearly;
                        displaySuffix = '/ 年';
                    }


                });

                const openWizard = () => {
                    // Reset
                    wizardForm.tenant = 'RIMO 集团 (默认承租方)';
                    wizardForm.sameAsTenant = false;
                    wizardForm.payer = '';
                    wizardForm.name = '';
                    wizardForm.type = 'OFFICIAL';
                    wizardForm.quota = 1;
                    wizardForm.billing = 'MONTHLY';
                    wizardForm.durationMonths = 1;
                    wizardForm.startDate = '';
                    if (wizardFormRef.value) wizardFormRef.value.clearValidate();

                    showWizardDrawer.value = true;
                };

                const submitWizard = () => {
                    wizardFormRef.value.validate().then(valid => {
                        if (valid) {
                            submitLoading.value = true;
                            setTimeout(() => {
                                submitLoading.value = false;
                                showWizardDrawer.value = false;

                                // Generate mock row
                                const newRow = {
                                    id: 'OC-2026-NEW' + Math.floor(Math.random() * 100),
                                    name: wizardForm.name,
                                    tenant: wizardForm.tenant,
                                    payer: wizardForm.payer,
                                    type: wizardForm.type,
                                    billing: wizardForm.billing,
                                    vehicleCount: wizardForm.quota,
                                    totalAmount: wizardForm.quota * 15000,
                                    startDate: wizardForm.startDate,
                                    endDate: (() => {
                                        const d = new Date(wizardForm.startDate);
                                        if (wizardForm.billing === 'ANNUALLY') {
                                            d.setFullYear(d.getFullYear() + wizardForm.durationMonths);
                                        } else {
                                            d.setMonth(d.getMonth() + wizardForm.durationMonths);
                                        }
                                        return d.toISOString().split('T')[0];
                                    })(),
                                    status: 'PENDING_PAYMENT'
                                };
                                contractsData.value.unshift(newRow);
                                ElMessage.success('核算建档成功！新商务合约已锁定记录！');
                            }, 500);
                        }
                    }).catch(() => { });
                };

                const handleWizardClose = (done) => {
                    done();
                };

                // Table Actions
                const terminateContract = (row) => {
                    ElMessageBox.confirm(`即将强制提前终止此公务车合约，下挂的 ${row.vehicleCount} 台资产将即刻释放回公共资源池。此操作不可撤销，确认终止？`, '生命周期阻断', {
                        confirmButtonText: '确定终止释放',
                        cancelButtonText: '手滑了',
                        type: 'warning'
                    }).then(() => {
                        row.status = 'TERMINATED';
                        row.vehicleCount = 0; // Release cars conceptually
                        ElMessage.success('合约链路已被系统阻断，资源已回退池中！');
                    }).catch(() => { });
                };

                const revokeContract = (row) => {
                    ElMessageBox.confirm(`此操作将彻底解绑下挂的 ${row.vehicleCount} 台物理资产，合约作废归档，此步骤不可逆！确认执行断骨操作？`, '高危警告', {
                        confirmButtonText: '执行作废与释放',
                        cancelButtonText: '保留数据',
                        type: 'error'
                    }).then(() => {
                        row.status = 'VOID';
                        row.vehicleCount = 0; // Release cars
                        ElMessage.error(`合约已强制作废，关联的资产已释放入公共运力池`);
                    }).catch(() => { });
                };


                // Formatting Helpers
                const getDaysRemaining = (endDate) => {
                    const end = new Date(endDate);
                    const diffTime = end - TODAY;
                    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                };

                const formatCurrency = (val, symbol = true) => {
                    if (val == null) return '-';
                    const num = Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return symbol ? `￥ ${num}` : num;
                };

                const renderBillingType = (b) => {
                    const map = { MONTHLY: '月缴', ANNUALLY: '年缴', ONE_TIME: '一次性' };
                    return map[b] || b;
                };

                const getStatusLabel = (s) => {
                    const map = {
                        DRAFT: '草稿件', PENDING_PAYMENT: '待客户支付', TERMINATED: '已终止',
                        ACTIVE: '生效中', EXPIRED: '已过期', VOID: '已作废退回', EXPIRING: '即将到期'
                    };
                    return map[s] || s;
                };

                const getStatusDotClass = (s) => {
                    let c = 'w-2 h-2 rounded-full ';
                    if (s === 'ACTIVE') c += 'bg-emerald-500';
                    else if (s === 'TERMINATED') c += 'bg-gray-600';
                    else if (s === 'PENDING_PAYMENT') c += 'bg-amber-400';
                    else if (s === 'EXPIRED') c += 'bg-red-500';
                    else if (s === 'VOID') c += 'bg-gray-400';
                    else if (s === 'EXPIRING') c += 'bg-amber-500';
                    else c += 'bg-gray-300'; // DRAFT
                    return c;
                };

                const getStatusTextClass = (s) => {
                    let c = 'text-sm font-medium ';
                    if (s === 'ACTIVE') c += 'text-emerald-700';
                    else if (s === 'TERMINATED') c += 'text-gray-700 line-through decoration-gray-400';
                    else if (s === 'PENDING_PAYMENT') c += 'text-amber-600';
                    else if (s === 'EXPIRED') c += 'text-red-600';
                    else if (s === 'VOID') c += 'text-gray-500 line-through';
                    else if (s === 'EXPIRING') c += 'text-amber-500';
                    else c += 'text-gray-600';
                    return c;
                };
</script>

<style scoped>
        

        .custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        .card-value {
            font-size: 28px;
            font-weight: 700;
            line-height: 1.2;
        }

        .steps-container {
            padding: 20px;
        }

        /* Adjust Element Plus Transfer styling to span better inside Drawer */
        :deep(.el-transfer-panel) {
            width: 45%;
        }

        :deep(.el-transfer) {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
</style>
