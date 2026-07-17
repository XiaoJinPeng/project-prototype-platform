<template>
<div class="corporate-detail-page">
            
            

            
            <main>
                
                <div class="mb-4">
                    <el-button @click="goBack" :icon="ArrowLeft" plain>返回</el-button>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 detail-card">
                    <div class="flex items-start gap-6">
                        
                        <div 
                            class="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {{ corporate.companyName?.charAt(0) }}
                        </div>
                        
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h1 class="text-2xl font-bold text-gray-900">{{ corporate.companyName }}</h1>
                                <el-tag :type="corporate.planId === 'p2' ? 'warning' : 'info'" effect="dark"
                                    size="small" class="font-bold">{{ corporate.planName }}</el-tag>
                                <el-tag :type="statusType" size="small">{{ statusText }}</el-tag>
                            </div>
                            <div class="flex items-center gap-8 text-sm text-gray-500 mt-3">
                                <span class="flex items-center gap-1">
                                    <el-icon>
                                        <Postcard></Postcard>
                                    </el-icon> 统编: {{ corporate.taxId }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <el-icon>
                                        <User></User>
                                    </el-icon> {{ corporate.contactName }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <el-icon>
                                        <Iphone></Iphone>
                                    </el-icon> {{ corporate.contactPhone }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <el-icon>
                                        <Lock></Lock>
                                    </el-icon> 登入账号: {{ corporate.account }}
                                </span>
                            </div>
                        </div>
                        
                        <div class="flex gap-2">
                            <el-button type="primary" :icon="Edit" @click="handleEdit">编辑资料</el-button>
                            <el-button v-if="corporate.status === 'active'" type="warning" :icon="Lock"
                                @click="handleFreeze">暂停合作</el-button>
                            <el-button v-else type="success" :icon="Unlock" @click="handleUnfreeze">恢复合作</el-button>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-4 gap-4 mb-6">
                    
                    <div class="metric-card">
                        <div class="text-xs text-gray-400 mb-0.5">企业员工数</div>
                        <div class="text-2xl font-bold text-gray-900">{{ corporateStats.totalEmployees }}</div>
                    </div>
                    <div class="metric-card">
                        <div class="text-xs text-gray-400 mb-0.5">激活合约配额</div>
                        <div class="text-2xl font-bold text-gray-900">{{ corporateStats.activeQuotas }}</div>
                    </div>
                    <div class="metric-card">
                        <div class="text-xs text-gray-400 mb-0.5">累计订单</div>
                        <div class="text-2xl font-bold text-gray-900">{{ corporateStats.totalOrders }}</div>
                    </div>
                    <div class="metric-card">
                        <div class="text-xs text-gray-400 mb-0.5">累计消费金额</div>
                        <div class="text-2xl font-bold text-gray-900">NT$ {{ corporateStats.totalSpent.toLocaleString()
                            }}</div>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <el-tabs v-model="activeTab" class="custom-tabs">

                        
                        <el-tab-pane label="基本资料" name="profile">
                            <div class="py-4 space-y-8">
                                <div>
                                    <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                        <el-icon class="mr-2 text-gray-400">
                                            <OfficeBuilding></OfficeBuilding>
                                        </el-icon> 企业基本信息
                                    </h3>
                                    <div 
                                        class="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 info-desc-list">
                                        <div>
                                            <dt>企业编号</dt>
                                            <dd class="font-mono text-blue-600">{{ corporate.id }}</dd>
                                        </div>
                                        <div>
                                            <dt>企业名称</dt>
                                            <dd>{{ corporate.companyName }}</dd>
                                        </div>
                                        <div>
                                            <dt>统一编号</dt>
                                            <dd class="font-mono">{{ corporate.taxId }}</dd>
                                        </div>
                                        <div>
                                            <dt>公司类型</dt>
                                            <dd>{{ corporate.companyType }}</dd>
                                        </div>
                                        <div>
                                            <dt>联络人姓名</dt>
                                            <dd>{{ corporate.contactName }}</dd>
                                        </div>
                                        <div>
                                            <dt>联络电话</dt>
                                            <dd class="font-mono">{{ corporate.contactPhone }}</dd>
                                        </div>
                                        <div class="col-span-2">
                                            <dt>通讯地址</dt>
                                            <dd>{{ corporate.address }}</dd>
                                        </div>
                                        <div class="col-span-2">
                                            <dt>备注说明</dt>
                                            <dd>{{ corporate.remarks || '无' }}</dd>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                        <el-icon class="mr-2 text-gray-400">
                                            <List></List>
                                        </el-icon> 业务规则与方案
                                    </h3>
                                    <div 
                                        class="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 info-desc-list">
                                        <div class="col-span-2">
                                            <dt>签约服务类型</dt>
                                            <dd>
                                                <el-tag v-for="type in corporate.serviceTypes" :key="type" size="small"
                                                    class="mr-2" effect="plain" type="primary">{{ type }}</el-tag>
                                            </dd>
                                        </div>
                                        <div>
                                            <dt>用车时间限制</dt>
                                            <dd>{{ corporate.useTime }}</dd>
                                        </div>
                                        <div>
                                            <dt>是否月结</dt>
                                            <dd>
                                                <el-tag v-if="corporate.monthlySettlement" type="success"
                                                    size="small">允许</el-tag>
                                                <el-tag v-else type="info" size="small">不许</el-tag>
                                            </dd>
                                        </div>
                                        <div class="col-span-2">
                                            <dt>管理员账号</dt>
                                            <dd class="font-mono text-blue-600">{{ corporate.account }}</dd>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="quotas" lazy>
                            <template #label>
                                <span>合约配额</span>
                            </template>
                            <div class="py-6">
                                <div class="text-sm text-gray-500 mb-4 flex items-center justify-between">
                                    <span>目前激活的合约配额列表，主要用于公务用车与长租业务。</span>
                                    <el-button type="primary" size="small" icon="Plus" plain>新增配额与绑定</el-button>
                                </div>
                                <el-table :data="corporate.quotas" style="width: 100%" stripe
                                    header-cell-class-name="bg-gray-50 text-gray-700 font-bold"
                                    cell-class-name="align-top">
                                    <el-table-column label="合约编号与名称" min-width="200">
                                        <template #default="{ row }">
                                            <div class="font-mono text-gray-800 text-sm font-semibold">{{ row.contractNo
                                                }}</div>
                                            <div class="text-xs text-gray-500 mt-1 truncate" :title="row.name">{{
                                                row.name }}</div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="用车与结算方" min-width="180">
                                        <template #default="{ row }">
                                            <div class="text-sm text-gray-800">{{ row.tenant }}</div>
                                            <div v-if="row.tenant !== row.payer"
                                                class="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                <span 
                                                    class="bg-gray-100 text-gray-500 px-1 py-0.5 rounded text-[10px] ring-1 ring-inset ring-gray-200">[代付]</span>
                                                <span class="truncate" :title="row.payer">{{ row.payer }}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="属性" width="120">
                                        <template #default="{ row }">
                                            <div class="flex flex-col gap-1 items-start">
                                                <el-tag v-if="row.type === 'TRIAL'" type="info" size="small"
                                                    effect="plain"
                                                    class="border-blue-200 text-blue-600 bg-blue-50">试用</el-tag>
                                                <el-tag v-if="row.type === 'OFFICIAL'" type="success" size="small"
                                                    effect="light"
                                                    class="text-emerald-600 bg-emerald-50 border-emerald-200">正式</el-tag>
                                                <span class="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{
                                                    row.billing === 'ANNUALLY' ? '年缴' : row.billing === 'MONTHLY' ? '月缴'
                                                    : '一次性' }}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="配额数量 / 已绑" width="120" align="center">
                                        <template #default="{ row }">
                                            <div class="text-sm font-bold text-gray-800">{{ row.vehicleCount }} <span 
                                                    class="text-xs font-normal text-gray-500">台</span></div>
                                            <div class="text-xs text-blue-600 mt-1">已绑 {{ row.boundCount }}</div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="单台合约金额" width="130" align="right">
                                        <template #default="{ row }">
                                            <div class="text-sm font-semibold text-gray-800">￥{{
                                                row.totalAmount.toLocaleString() }}
                                            </div>
                                            <div class="text-xs text-gray-500 font-normal mt-1">/ {{ row.billing ===
                                                'ANNUALLY' ? '年' : (row.billing === 'MONTHLY' ? '月' : '次') }}</div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="有效期" min-width="170">
                                        <template #default="{ row }">
                                            <div 
                                                class="text-xs text-gray-600 font-mono tracking-tight flex flex-col gap-0.5">
                                                <span>{{ row.startDate }}</span>
                                                <span class="text-gray-400 font-sans">至</span>
                                                <span>{{ row.endDate }}</span>
                                            </div>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-tag v-if="row.status === 'ACTIVE'" type="success"
                                                size="small">生效中</el-tag>
                                            <el-tag v-else-if="row.status === 'EXPIRED'" type="info"
                                                size="small">已过期</el-tag>
                                            <el-tag v-else type="primary" size="small">{{ row.status }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="90" align="center" fixed="right">
                                        <template #default>
                                            <el-button link type="primary" size="small">查看明细</el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="employees" lazy>
                            <template #label>
                                <span>员工列表 <el-badge :value="corporate.employees.length" type="primary"
                                        class="ml-1" ></el-badge></span>
                            </template>
                            <div class="py-4">
                                <div class="flex justify-end mb-4">
                                    <el-button type="primary" size="small" icon="Plus">新增员工</el-button>
                                </div>
                                <el-table :data="corporate.employees" stripe style="width: 100%">
                                    <el-table-column prop="id" label="员工ID" width="120"></el-table-column>
                                    <el-table-column prop="name" label="姓名" min-width="120"></el-table-column>
                                    <el-table-column prop="phone" label="手机号" width="130"></el-table-column>
                                    <el-table-column prop="email" label="Email" min-width="160"></el-table-column>
                                    <el-table-column prop="idCard" label="身份证号" width="150"></el-table-column>
                                    <el-table-column prop="branch" label="分公司" width="120"></el-table-column>
                                    <el-table-column prop="department" label="部门" min-width="100"></el-table-column>
                                    <el-table-column prop="addedAt" label="加入日期" width="120"></el-table-column>
                                    <el-table-column prop="status" label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="row.status === 'active' ? 'success' : 'info'">
                                                {{ row.status === 'active' ? '在职' : '停用' }}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="140">
                                        <template #default>
                                            <el-button link type="primary" size="small">编辑</el-button>
                                            <el-button link type="danger" size="small">移除</el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane label="用车规则" name="rules" lazy>
                            <div class="py-4 space-y-6">
                                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <h4 class="font-bold text-blue-800 mb-2">当前用车政策</h4>
                                    <p class="text-sm text-blue-700">以下规则适用于该企业所有员工，用于约束分时租赁和公务用车行为。</p>
                                </div>
                                <div class="grid grid-cols-2 gap-6 info-desc-list">
                                    <div class="bg-gray-50 rounded-lg p-5 border">
                                        <dt>允许车型组</dt>
                                        <dd class="mt-1">经济型轿车、商务MPV</dd>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-5 border">
                                        <dt>单次租赁时长限制</dt>
                                        <dd class="mt-1">最长 72 小时</dd>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-5 border">
                                        <dt>允许预订时段</dt>
                                        <dd class="mt-1">{{ corporate.useTime }}</dd>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-5 border">
                                        <dt>月结资格状态</dt>
                                        <dd class="mt-1">已启用，不设额度</dd>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="orders" lazy>
                            <template #label>
                                <span>订单记录</span>
                            </template>
                            <div class="py-4">
                                <div class="flex items-center gap-4 mb-4">
                                    <el-select v-model="orderFilter.type" placeholder="订单类型" clearable size="small"
                                        style="width: 150px">
                                        <el-option label="同站租还" value="same_station" ></el-option>
                                        <el-option label="甲租乙还" value="diff_station" ></el-option>
                                        <el-option label="门市租车" value="store" ></el-option>
                                        <el-option label="24h自助" value="kiosk" ></el-option>
                                    </el-select>
                                </div>
                                <el-table :data="paginatedOrders" stripe style="width: 100%">
                                    <el-table-column prop="id" label="订单编号" width="140"></el-table-column>
                                    <el-table-column prop="typeText" label="类型" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="getOrderTypeTag(row.type)">{{ row.typeText
                                                }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="vehicle" label="车辆" min-width="200"></el-table-column>
                                    <el-table-column prop="pickup" label="取车站" min-width="120"></el-table-column>
                                    <el-table-column prop="duration" label="时长" width="80"></el-table-column>
                                    <el-table-column prop="amount" label="金额" width="100">
                                        <template #default="{ row }">
                                            <span class="font-bold text-gray-900">NT$ {{ row.amount.toLocaleString()
                                                }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="statusText" label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="getOrderStatusTag(row.status)">{{ row.statusText
                                                }}</el-tag>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="billing" lazy>
                            <template #label>
                                <span>账单记录</span>
                            </template>
                            <div class="py-4">
                                <div class="flex items-center gap-4 mb-4">
                                    <el-select v-model="billFilter.type" placeholder="账单类型" clearable size="small"
                                        style="width: 150px">
                                        <el-option label="月度结算账单" value="monthly" ></el-option>
                                        <el-option label="公务车合约账单" value="contract" ></el-option>
                                    </el-select>
                                    <el-select v-model="billFilter.status" placeholder="付款状态" clearable size="small"
                                        style="width: 150px">
                                        <el-option label="待付款" value="pending" ></el-option>
                                        <el-option label="已结清" value="paid" ></el-option>
                                        <el-option label="逾期" value="overdue" ></el-option>
                                    </el-select>
                                </div>
                                <el-table :data="filteredBills" stripe style="width: 100%">
                                    <el-table-column prop="billNo" label="账单编号" width="140"></el-table-column>
                                    <el-table-column prop="period" label="账单周期 / 生成时间"
                                        min-width="200"></el-table-column>
                                    <el-table-column prop="typeText" label="账单类型" width="140">
                                        <template #default="{ row }">
                                            <el-tag size="small"
                                                :type="row.type === 'monthly' ? 'primary' : 'warning'">{{ row.typeText
                                                }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="amount" label="账单总额" width="120">
                                        <template #default="{ row }">
                                            <span class="font-bold text-gray-900">NT$ {{ row.amount.toLocaleString()
                                                }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="dueDate" label="缴款期限" width="120"></el-table-column>
                                    <el-table-column prop="statusText" label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="getBillStatusTag(row.status)">{{ row.statusText
                                                }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="120" fixed="right">
                                        <template #default="{ row }">
                                            <el-button link type="primary" size="small"
                                                @click="viewBillDetail(row)">查看账单</el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                    </el-tabs>
                </div>

                
                <el-dialog v-model="billDetailVisible" :title="currentBill?.typeText + ' - ' + currentBill?.billNo"
                    width="800px">
                    <div v-if="currentBill">
                        <div 
                            class="flex justify-between items-center mb-6 bg-gray-50 p-5 rounded-lg border border-gray-100">
                            <div>
                                <div class="text-xs text-gray-500 mb-1">账单归属周期</div>
                                <div class="font-bold text-gray-800">{{ currentBill.period }}</div>
                            </div>
                            <div>
                                <div class="text-xs text-gray-500 mb-1">最晚缴款日</div>
                                <div class="font-bold text-red-600">{{ currentBill.dueDate }}</div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-gray-500 mb-1">应缴总额</div>
                                <div class="font-bold text-2xl text-blue-600">NT$ {{ currentBill.amount.toLocaleString()
                                    }}</div>
                            </div>
                        </div>

                        
                        <div v-if="currentBill.type === 'monthly'">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <el-icon class="mr-2 text-blue-500">
                                    <List></List>
                                </el-icon> 包含之员工短租订单明细
                            </h4>
                            <el-table :data="currentBill.items" size="small" stripe border style="width: 100%">
                                <el-table-column prop="orderId" label="订单编号" width="130"></el-table-column>
                                <el-table-column prop="employee" label="用车人" width="100"></el-table-column>
                                <el-table-column prop="date" label="用车日期" min-width="120"></el-table-column>
                                <el-table-column prop="type" label="订单类型" width="100"></el-table-column>
                                <el-table-column prop="amount" label="金额" width="100" align="right">
                                    <template #default="{ row }">NT$ {{ row.amount.toLocaleString() }}</template>
                                </el-table-column>
                            </el-table>
                            <p class="text-xs text-gray-400 mt-2">提示：以上订单均由授权员工选用企业方案产生，合并计入当月账单。</p>
                        </div>

                        
                        <div v-if="currentBill.type === 'contract'">
                            <h4 class="font-bold text-gray-800 mb-3 flex items-center">
                                <el-icon class="mr-2 text-warning">
                                    <Document></Document>
                                </el-icon> 合约计费款项
                            </h4>
                            <div class="bg-gray-50 p-4 rounded-lg text-sm space-y-3">
                                <div class="flex justify-between"><span class="text-gray-500">关联配额方案：</span> <span>经济型轿车
                                        / 10台</span></div>
                                <div class="flex justify-between"><span class="text-gray-500">计费模式：</span> <span>季结固定租金
                                        (依据长租优惠)</span></div>
                                <div class="flex justify-between"><span class="text-gray-500">单车单季费用：</span> <span>NT$
                                        15,000 / 台</span></div>
                                <el-divider class="my-2" ></el-divider>
                                <div class="flex justify-between font-bold text-gray-700"><span>总计：</span> <span>NT$
                                        150,000</span></div>
                            </div>
                            <p class="text-xs text-gray-400 mt-3">提示：公务车账单依据《企业长租框架协议》按期生成，不含日常散单。</p>
                        </div>
                    </div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="billDetailVisible = false">关闭</el-button>
                            <el-button type="primary" @click="handleOfflinePayment"
                                v-if="currentBill?.status !== 'paid' && currentBill?.status !== 'archived'">登记线下已收款</el-button>
                        </span>
                    </template>
                </el-dialog>

            </main>
        </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ArrowLeft, Edit, Lock, Unlock } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const activeTab = ref('profile');
                const orderFilter = reactive({ type: '' });
                const billFilter = reactive({ type: '', status: '' });
                const billDetailVisible = ref(false);
                const currentBill = ref(null);

                const corporate = reactive({
                    id: 'CORP2405001',
                    companyName: '台积电 TSMC',
                    companyType: '股份有限公司',
                    taxId: '87654321',
                    contactName: '张敏',
                    contactPhone: '0955-666-777',
                    address: '新竹科学园区',
                    planId: 'p2',
                    planName: '企业白金方案',
                    status: 'active',
                    account: 'admin@tsmc.com',
                    serviceTypes: ['公务用车', '分时租赁'],
                    useTime: '全天',
                    monthlySettlement: true,
                    remarks: '大客户，重点维护',
                    employees: [
                        { id: 'EMP001', name: '王大明', phone: '0912-345-678', email: 'daming.wang@tsmc.com', idCard: 'A123456789', branch: '新竹总部', department: 'IT部', status: 'active', addedAt: '2023-01-15' },
                        { id: 'EMP002', name: '李小华', phone: '0987-654-321', email: 'xiaohua.li@tsmc.com', idCard: 'B987654321', branch: '台中厂区', department: 'HR部', status: 'active', addedAt: '2023-02-20' },
                        { id: 'EMP003', name: '林志玲', phone: '0955-123-456', email: 'zhiling.lin@tsmc.com', idCard: 'C112233445', branch: '台南厂区', department: '行销部', status: 'inactive', addedAt: '2023-03-10' }
                    ],
                    quotas: [
                        { id: 'Q001', name: '台积电高管驻厂专车合约', contractNo: 'CT-2023-001', tenant: '台积电 TSMC', payer: '台积电 TSMC', type: 'OFFICIAL', billing: 'MONTHLY', vehicleCount: 10, boundCount: 8, totalAmount: 150000, startDate: '2023-01-01', endDate: '2024-12-31', status: 'ACTIVE' },
                        { id: 'Q002', name: '新竹厂区临时试用评测', contractNo: 'CT-2023-002', tenant: '台积电 TSMC', payer: '和运租车', type: 'TRIAL', billing: 'ONE_TIME', vehicleCount: 2, boundCount: 2, totalAmount: 15000, startDate: '2023-06-01', endDate: '2024-05-31', status: 'ACTIVE' },
                        { id: 'Q003', name: '高层差旅游览车年度合约', contractNo: 'CT-2022-015', tenant: '台积电 TSMC', payer: '台积电 TSMC', type: 'OFFICIAL', billing: 'ANNUALLY', vehicleCount: 1, boundCount: 1, totalAmount: 72000, startDate: '2022-01-01', endDate: '2022-12-31', status: 'EXPIRED' }
                    ]
                });

                const corporateStats = computed(() => ({
                    totalEmployees: corporate.employees.length,
                    activeQuotas: corporate.quotas.length,
                    totalOrders: 45,
                    totalSpent: 128500
                }));

                const statusText = computed(() => {
                    const map = { active: '合作中', suspended: '已暂停', archived: '已终止' };
                    return map[corporate.status] || '未知';
                });

                const statusType = computed(() => {
                    const map = { active: 'success', suspended: 'warning', archived: 'info' };
                    return map[corporate.status] || 'info';
                });

                const generateOrders = () => {
                    return Array(10).fill(0).map((_, i) => ({
                        id: 'ORD' + (20260201 + i),
                        type: ['same_station', 'diff_station', 'store', 'kiosk'][i % 4],
                        typeText: ['同站租还', '甲租乙还', '门市租车', '24h自助'][i % 4],
                        vehicle: 'Toyota Altis (ABC-123' + i + ')',
                        pickup: '台北总店',
                        returnLocation: i % 4 === 1 ? '桃园机场' : '台北总店',
                        duration: (i + 1) + '天',
                        amount: 1200 + i * 500,
                        status: ['completed', 'active', 'cancelled'][i % 3],
                        statusText: ['已完成', '进行中', '已取消'][i % 3]
                    }));
                };

                const generateBills = () => {
                    return [
                        {
                            billNo: 'BL-2026-001', period: '2026年01月 (01/01 - 01/31)', type: 'monthly', typeText: '月度结算账单', amount: 45000, dueDate: '2026-02-15', status: 'paid', statusText: '已结清', items: [
                                { orderId: 'ORD20260101', employee: '王大明', date: '2026-01-05', type: '同站租还', amount: 1500 },
                                { orderId: 'ORD20260105', employee: '李小华', date: '2026-01-12', type: '甲租乙还', amount: 2500 }
                            ]
                        },
                        {
                            billNo: 'BL-2026-002', period: '2026年02月 (02/01 - 02/28)', type: 'monthly', typeText: '月度结算账单', amount: 32000, dueDate: '2026-03-15', status: 'pending', statusText: '待付款', items: [
                                { orderId: 'ORD20260201', employee: '王大明', date: '2026-02-02', type: '门市租车', amount: 32000 }
                            ]
                        },
                        { billNo: 'CB-2026-001', period: 'CT-2023-001 第一季度期款', type: 'contract', typeText: '公务车合约账单', amount: 150000, dueDate: '2026-01-31', status: 'paid', statusText: '已结清', items: [] },
                        { billNo: 'CB-2026-002', period: 'CT-2023-002 第一季度期款', type: 'contract', typeText: '公务车合约账单', amount: 60000, dueDate: '2026-02-28', status: 'overdue', statusText: '逾期', items: [] }
                    ];
                };

                const paginatedOrders = ref(generateOrders());
                const bills = ref(generateBills());

                const filteredBills = computed(() => {
                    return bills.value.filter(b => {
                        const matchType = !billFilter.type || b.type === billFilter.type;
                        const matchStatus = !billFilter.status || b.status === billFilter.status;
                        return matchType && matchStatus;
                    });
                });

                const getOrderTypeTag = (type) => {
                    const map = { same_station: '', diff_station: 'warning', store: 'info', kiosk: 'success' };
                    return map[type] || '';
                };
                const getOrderStatusTag = (status) => {
                    const map = { completed: 'success', active: 'primary', cancelled: 'info' };
                    return map[status] || '';
                };
                const getBillStatusTag = (status) => {
                    const map = { paid: 'success', pending: 'primary', overdue: 'danger' };
                    return map[status] || 'info';
                };

                const goBack = () => {
                    router.push('/operation/corporates');
                };

                const handleEdit = () => {
                    ElMessage.success('跳转到编辑模式');
                };

                const handleFreeze = () => {
                    ElMessageBox.confirm('确定要暂停该企业合作吗？', '提示', { type: 'warning' })
                        .then(() => {
                            corporate.status = 'suspended';
                            ElMessage.success('企业已暂停合作');
                        });
                };

                const handleUnfreeze = () => {
                    corporate.status = 'active';
                    ElMessage.success('企业已恢复合作');
                };

                const viewBillDetail = (row) => {
                    currentBill.value = row;
                    billDetailVisible.value = true;
                };

                const handleOfflinePayment = () => {
                    ElMessage.success('已成功登记结清款项');
                    if (currentBill.value) {
                        currentBill.value.status = 'paid';
                        currentBill.value.statusText = '已结清';
                    }
                    billDetailVisible.value = false;
                };

                const corpId = route.query.id;
                if (corpId) {
                    corporate.id = corpId;
                }
</script>

<style scoped>
        .corporate-detail-page {
            min-height: 100%;
        }

        [v-cloak] {
            display: none;
        }

        .detail-card {
            transition: all 0.3s ease;
        }

        .detail-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .metric-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #f3f4f6;
            padding: 20px;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
        }

        .metric-card:nth-child(1)::before {
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
        }

        .metric-card:nth-child(2)::before {
            background: linear-gradient(90deg, #10b981, #34d399);
        }

        .metric-card:nth-child(3)::before {
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }

        .metric-card:nth-child(4)::before {
            background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .custom-tabs :deep(.el-tabs__header) {
            margin-bottom: 0 !important;
            padding: 0 20px;
            border-bottom: 1px solid #f3f4f6 !important;
            background: white;
        }

        .custom-tabs :deep(.el-tabs__nav-wrap::after) {
            height: 1px;
            background-color: transparent !important;
        }

        .custom-tabs :deep(.el-tabs__item) {
            font-size: 14px;
            font-weight: 500;
            color: #6b7280;
            padding: 0 18px !important;
            height: 48px;
            line-height: 48px;
        }

        .custom-tabs :deep(.el-tabs__item.is-active) {
            color: var(--app-color-primary);
            font-weight: 600;
        }

        .custom-tabs :deep(.el-tabs__active-bar) {
            background-color: var(--app-color-primary);
            height: 3px;
            border-radius: 3px 3px 0 0;
            bottom: 0;
        }

        .custom-tabs :deep(.el-tabs__content) {
            background: white;
            border: none;
            padding: 24px;
            min-height: 500px;
            margin-top: 0;
        }

        .info-desc-list dt {
            color: #9ca3af;
            font-size: 13px;
            margin-bottom: 2px;
        }

        .info-desc-list dd {
            color: #1f2937;
            font-size: 14px;
            font-weight: 500;
        }
</style>
