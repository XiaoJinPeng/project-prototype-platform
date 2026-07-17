<template>
<div class="corporates-page">
            
            

            
            <main>
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">企业客户管理</h1>
                        <p class="text-gray-500 text-sm mt-1">管理所有企业客户资料、统编、开通服务及合作方案。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20"
                            @click="openCreateDialog">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新增企业
                        </el-button>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    

                    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div class="flex gap-3 items-center flex-wrap">
                            <el-input v-model="filters.keyword" placeholder="搜索企业编号/企业名称/联络人/统编" clearable
                                style="width: 280px" prefix-icon="Search"></el-input>
                            <el-select v-model="filters.serviceType" placeholder="合作服务类型" clearable
                                style="width: 150px">
                                <el-option label="分时租赁" value="timeshare"></el-option>
                                <el-option label="门市租赁" value="store"></el-option>
                                <el-option label="公务用车" value="official"></el-option>
                            </el-select>
                            <el-select v-model="filters.planId" placeholder="企业方案" clearable style="width: 140px">
                                <el-option v-for="plan in membershipPlans" :key="plan.id" :label="plan.name"
                                    :value="plan.id"></el-option>
                            </el-select>
                            <el-select v-model="filters.status" placeholder="合作状态" clearable style="width: 120px">
                                <el-option label="正常" value="active"></el-option>
                                <el-option label="停权" value="suspended"></el-option>
                            </el-select>
                            <el-tooltip content="重置筛选" placement="top">
                                <el-button circle @click="resetFilters">
                                    <el-icon>
                                        <Refresh></Refresh>
                                    </el-icon>
                                </el-button>
                            </el-tooltip>
                            <el-button type="primary" plain icon="Download" @click="exportData">导出</el-button>
                        </div>
                        <div class="text-sm text-gray-500">共 {{ filteredMembers.length }} 家企业</div>
                    </div>

                    
                    <el-table :data="paginatedMembers" stripe style="width: 100%"
                        :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }">
                        <el-table-column prop="id" label="企业编号" width="120">
                            <template #default="{ row }">
                                <span class="font-mono text-xs text-gray-500">{{ row.id }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="企业信息" min-width="220">
                            <template #default="{ row }">
                                <div class="flex items-center">
                                    <el-avatar v-if="row.logo" :src="row.logo" :size="36"
                                        class="mr-3 border"></el-avatar>
                                    <el-avatar v-else :size="36"
                                        class="mr-3 border bg-blue-100 text-blue-600 border-blue-200">
                                        {{ row.companyName ? row.companyName.charAt(0) : '企' }}
                                    </el-avatar>
                                    <div>
                                        <div class="font-bold text-gray-900">{{ row.companyName }}</div>
                                        <div class="text-xs text-gray-500 font-mono mt-0.5" title="统编">
                                            统编: {{ row.taxId }}
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="联络人与电话" min-width="160">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-900 font-medium">{{ row.contactName }}</div>
                                <div class="text-xs text-gray-500 font-mono mt-0.5 flex items-center gap-1">
                                    <el-icon>
                                        <Phone></Phone>
                                    </el-icon>{{ row.contactPhone }}
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="开通服务" min-width="200">
                            <template #default="{ row }">
                                <div class="flex flex-wrap gap-1">
                                    <el-tag v-for="srv in row.serviceTypes" :key="srv" size="small"
                                        :type="srv === '公务用车' ? 'success' : 'primary'" effect="plain">
                                        {{ srv }}
                                    </el-tag>
                                </div>
                                <div v-if="row.monthlySettlement"
                                    class="text-xs text-orange-500 mt-1 flex items-center">
                                    <el-icon class="mr-1">
                                        <Calendar></Calendar>
                                    </el-icon>月结客户
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="企业方案" min-width="140">
                            <template #default="{ row }">
                                <el-tag :type="row.planId === 'p2' ? 'warning' : 'info'" size="small" class="mr-2"
                                    effect="dark">
                                    {{ row.planName }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="合作状态" width="120">
                            <template #default="{ row }">
                                <el-switch v-model="row.status" active-value="active" inactive-value="suspended"
                                    inline-prompt active-text="正常" inactive-text="停权"
                                    @change="(val) => handleStatusChange(row, val)" ></el-switch>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120" align="right" fixed="right">
                            <template #default="{ row }">
                                <div class="flex justify-end gap-2">
                                    <el-button type="primary" link size="small" @click="goToDetail(row)">查看</el-button>
                                    <el-button type="primary" link size="small"
                                        @click="openEditDialog(row)">编辑</el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>

                    
                    <div class="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
                        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                            :page-sizes="[10, 20, 50, 100]" :total="filteredMembers.length" background
                            layout="total, sizes, prev, pager, next, jumper" ></el-pagination>
                    </div>
                </div>
            </main>
        </div>

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑企业资料' : '新增企业'" width="900px" top="3vh" destroy-on-close
            class="member-dialog">
            <el-form :model="memberForm" label-position="top" class="custom-scroll max-h-[70vh] overflow-y-auto px-2">

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-theme-primary">
                            <OfficeBuilding></OfficeBuilding>
                        </el-icon>
                        企业基本信息
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-form-item label="企业编号" required>
                                    <el-input v-model="memberForm.id" placeholder="输入企业编号" :disabled="isEdit" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="企业名称" required>
                                    <el-input v-model="memberForm.companyName" placeholder="输入企业名称" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="统编" required>
                                    <el-input v-model="memberForm.taxId" placeholder="8位企业统编" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="联络人姓名" required>
                                    <el-input v-model="memberForm.contactName" placeholder="输入姓名" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="联络电话" required>
                                    <el-input v-model="memberForm.contactPhone" placeholder="0912-345-678"
                                        prefix-icon="Phone" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="公司类型">
                                    <el-select v-model="memberForm.companyType" class="w-full" placeholder="选择公司类型">
                                        <el-option label="股份有限公司" value="股份有限公司" ></el-option>
                                        <el-option label="有限公司" value="有限公司" ></el-option>
                                        <el-option label="外商投资" value="外商投资" ></el-option>
                                        <el-option label="合伙企业" value="合伙企业" ></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="通讯地址">
                                    <el-input v-model="memberForm.address" placeholder="输入地址" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="备注">
                                    <el-input v-model="memberForm.remarks" type="textarea" :rows="2"
                                        placeholder="其他说明" ></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-theme-primary">
                            <List></List>
                        </el-icon>
                        业务规则与服务方案
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-form-item label="签约服务类型" required>
                                    <el-checkbox-group v-model="memberForm.serviceTypes">
                                        <el-checkbox label="分时租赁">分时租赁</el-checkbox>
                                        <el-checkbox label="门市租赁">门市租赁</el-checkbox>
                                        <el-checkbox label="公务用车">公务用车</el-checkbox>
                                    </el-checkbox-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="用车时间" required>
                                    <el-radio-group v-model="memberForm.useTime">
                                        <el-radio label="上班时间">仅上班时间</el-radio>
                                        <el-radio label="全天">24小时不限</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>


                
                <div class="mb-5" v-if="memberForm.serviceTypes.includes('公务用车')">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-theme-primary">
                            <Briefcase></Briefcase>
                        </el-icon>
                        公务用车专属参数
                    </div>
                    <div 
                        class="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                        <div class="absolute right-0 top-0 w-16 h-16 bg-emerald-100/50 rounded-bl-full -mr-4 -mt-4">
                        </div>
                        <el-row :gutter="16" class="relative z-10">
                            <el-col :span="24">
                                <el-form-item label="配额费率" required>
                                    <div class="flex gap-4 w-full">
                                        <el-input v-model="memberForm.monthlyRate" placeholder="单车月费" class="flex-1">
                                            <template #append>元/月</template>
                                        </el-input>
                                        <el-input v-model="memberForm.annualRate" placeholder="单车年费" class="flex-1">
                                            <template #append>元/年</template>
                                        </el-input>
                                    </div>
                                </el-form-item>
                            </el-col>
                            <el-col :span="24">
                                <el-form-item label="签约用车点" required>
                                    <el-input v-model="memberForm.pickupLocation"
                                        placeholder="请输入签约用车点地址或者名称"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="账单提醒时间" required>
                                    <el-select v-model="memberForm.billingReminder" placeholder="请选择" class="w-full">
                                        <el-option label="出账日当天" value="0"></el-option>
                                        <el-option label="提前 3 天" value="3"></el-option>
                                        <el-option label="提前 7 天" value="7"></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="账单通知联络人" required>
                                    <el-input v-model="memberForm.billingContact" placeholder="联络人姓名"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="账单通知邮箱" required>
                                    <el-input v-model="memberForm.billingEmail"
                                        placeholder="email@example.com"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-theme-primary">
                            <Medal></Medal>
                        </el-icon>
                        企业方案设定
                    </div>
                    <div 
                        class="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-form-item label="企业方案">
                                    <el-select v-model="memberForm.planId" placeholder="选择方案" class="w-full">
                                        <el-option v-for="plan in membershipPlans" :key="plan.id" :label="plan.name"
                                            :value="plan.id" ></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="是否月结">
                                    <el-switch v-model="memberForm.monthlySettlement" active-text="允许"
                                        inactive-text="不许" style="--el-switch-on-color: var(--app-color-primary)" ></el-switch>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-theme-primary">
                            <Key></Key>
                        </el-icon>
                        企业系统账号
                        <span class="ml-2 text-xs text-gray-400 font-normal">（发放给企业管理员使用的后台登录账号）</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-form-item label="登录账号 (Email 或手机)" required>
                                    <el-input v-model="memberForm.account" placeholder="管理员登录账号" :disabled="isEdit"
                                        prefix-icon="User" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item v-if="!isEdit" label="登录密码" required>
                                    <el-input v-model="memberForm.password" type="password" placeholder="设置登录密码"
                                        show-password prefix-icon="Lock" ></el-input>
                                </el-form-item>
                                <el-form-item v-else label="登录密码">
                                    <el-button link type="primary" disabled>如需修改请使用重置密码功能</el-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

            </el-form>

            <template #footer>
                <div class="flex justify-end gap-3">
                    <el-button @click="dialogVisible = false">取消</el-button>
                    <el-button type="primary" @click="saveMember">
                        <el-icon class="mr-1">
                            <Check></Check>
                        </el-icon>保存
                    </el-button>
                </div>
            </template>
        </el-dialog>

        
        <el-dialog v-model="licenseTypeDialogVisible" title="管理驾照类型" width="420px" destroy-on-close>
            <div class="flex gap-2 mb-4">
                <el-input v-model="newLicenseType" placeholder="输入新类型名称" @keyup.enter="addLicenseType" ></el-input>
                <el-button type="primary" @click="addLicenseType">
                    <el-icon class="mr-1">
                        <Plus></Plus>
                    </el-icon>添加
                </el-button>
            </div>
            <div class="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <el-table :data="licenseTypes" :show-header="false" size="small">
                    <el-table-column prop="name">
                        <template #default="{ row }">
                            <div class="flex items-center">
                                <el-icon class="mr-2 text-gray-400">
                                    <Van></Van>
                                </el-icon>
                                {{ row.name }}
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column width="60" align="right">
                        <template #default="{ row, $index }">
                            <el-button type="danger" link @click="deleteLicenseType($index)">
                                <el-icon>
                                    <Delete></Delete>
                                </el-icon>
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <template #footer>
                <el-button @click="licenseTypeDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>

        
        <el-drawer v-model="planDrawerVisible" title="客户等级方案" size="500px" destroy-on-close>
            <template #header>
                <div class="text-lg font-bold text-gray-800 flex items-center">
                    <el-icon class="mr-2 text-theme-primary">
                        <Medal></Medal>
                    </el-icon>
                    客户等级方案 - {{ currentMember?.name }}
                </div>
            </template>

            <div class="space-y-6" v-if="currentMember">
                
                <div 
                    class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-2 opacity-10">
                        <el-icon :size="100">
                            <Medal></Medal>
                        </el-icon>
                    </div>
                    <div class="relative z-10">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <div class="text-sm text-blue-600 font-bold mb-1">当前方案</div>
                                <h2 class="text-2xl font-bold text-gray-900">{{ currentMember.membership?.planName }}
                                </h2>
                            </div>
                            <el-tag effect="dark" :type="getMembershipColor(currentMember.membership?.planId)">
                                Lv.{{ getPlanTier(currentMember.membership?.planId) }}
                            </el-tag>
                        </div>

                        <div class="bg-white/60 rounded-lg p-3 backdrop-blur-sm space-y-2 text-sm mb-4">
                            <div class="flex justify-between">
                                <span class="text-gray-500">缴费周期</span>
                                <span class="font-medium text-gray-900">月缴 ¥99</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">到期日期</span>
                                <span class="font-medium text-gray-900 font-mono">{{
                                    currentMember.membership?.expireDate || '永久' }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-gray-500">自动续费</span>
                                <el-switch v-model="currentMember.membership.autoRenew" size="small" active-text="开启"
                                    inactive-text="关闭" ></el-switch>
                            </div>
                        </div>

                        <div class="flex gap-2">
                            <el-button type="primary" class="flex-1 shadow-sm" icon="Refresh"
                                @click="openChangePlanDialog">变更方案</el-button>
                            <el-button type="success" class="flex-1 shadow-sm" icon="Money"
                                @click="openRenewalDialog">手动续约</el-button>
                        </div>
                    </div>
                </div>

                
                <div>
                    <h3 class="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        <el-icon class="mr-1 text-gray-500">
                            <Star></Star>
                        </el-icon> 当前权益
                    </h3>
                    <div class="grid grid-cols-2 gap-2">
                        <div v-for="benefit in getPlanBenefits(currentMember.membership?.planId)" :key="benefit"
                            class="bg-gray-50 rounded px-3 py-2 text-xs text-gray-600 flex items-center">
                            <el-icon class="mr-1 text-green-500">
                                <Check></Check>
                            </el-icon> {{ benefit }}
                        </div>
                    </div>
                </div>

                
                <div class="border-t border-gray-100 pt-6">
                    <h3 class="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        <el-icon class="mr-1 text-gray-500">
                            <Warning></Warning>
                        </el-icon> 危险操作
                    </h3>
                    <div class="bg-red-50 rounded-lg p-4 border border-red-100 flex items-center justify-between">
                        <div>
                            <div class="text-sm font-bold text-red-800">解约方案</div>
                            <div class="text-xs text-red-500 mt-1">退回到免费普通会员，立即失效</div>
                        </div>
                        <el-button type="danger" plain size="small" @click="handleTerminatePlan">解约</el-button>
                    </div>
                </div>

                
                <div class="border-t border-gray-100 pt-6">
                    <h3 class="text-sm font-bold text-gray-800 mb-3 flex items-center">
                        <el-icon class="mr-1 text-gray-500">
                            <Clock></Clock>
                        </el-icon> 变更记录
                    </h3>
                    <el-timeline>
                        <el-timeline-item v-for="(activity, index) in planHistory" :key="index" :type="activity.type"
                            :timestamp="activity.timestamp" size="small">
                            {{ activity.content }} <span class="text-xs text-gray-400 ml-2">by {{ activity.operator
                                }}</span>
                        </el-timeline-item>
                    </el-timeline>
                </div>
            </div>
        </el-drawer>

        
        <el-dialog v-model="changePlanDialogVisible" title="变更会员方案" width="500px" append-to-body destroy-on-close>
            <el-form :model="changePlanForm" label-position="top">
                <el-form-item label="目标方案">
                    <el-select v-model="changePlanForm.planId" class="w-full" placeholder="请选择方案">
                        <el-option 
                            v-for="plan in membershipPlans.filter(p => p.id !== currentMember?.membership?.planId)"
                            :key="plan.id" :label="plan.name" :value="plan.id">
                            <span class="float-left">{{ plan.name }}</span>
                            <span class="float-right text-gray-400 text-xs mt-1">Lv.{{ plan.tier || 1 }}</span>
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="缴费周期" v-if="selectedPlan?.type !== 'free'">
                    <el-select v-model="changePlanForm.pricingCycle" class="w-full">
                        <el-option label="月缴 (¥99)" value="monthly" ></el-option>
                        <el-option label="季缴 (¥269)" value="quarterly" ></el-option>
                        <el-option label="年缴 (¥899)" value="annual" ></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="生效方式">
                    <el-radio-group v-model="changePlanForm.effectiveType">
                        <el-radio label="immediate">立即生效 (补差价/退款)</el-radio>
                        <el-radio label="next_cycle">当前周期结束后生效</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-alert v-if="changePlanForm.effectiveType === 'immediate'" title="差价说明: 升级需补缴 ¥100" type="warning"
                    :closable="false" show-icon class="mb-4" ></el-alert>
                <el-form-item label="变更原因">
                    <el-input v-model="changePlanForm.reason" type="textarea" placeholder="请输入变更原因" ></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="changePlanDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmChangePlan">确认变更</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="renewalDialogVisible" title="手动续约" width="450px" append-to-body destroy-on-close>
            <div class="bg-blue-50 p-3 rounded mb-4 text-sm text-blue-800">
                当前到期日: <span class="font-bold">{{ currentMember?.membership?.expireDate }}</span>
            </div>
            <el-form :model="renewalForm" label-position="top">
                <el-form-item label="续约周期">
                    <el-select v-model="renewalForm.cycle" class="w-full">
                        <el-option label="续费 1 个月 (¥99)" value="1_month" ></el-option>
                        <el-option label="续费 3 个月 (¥269)" value="3_month" ></el-option>
                        <el-option label="续费 1 年 (¥899)" value="1_year" ></el-option>
                    </el-select>
                </el-form-item>
                <div class="text-right text-sm text-gray-500 mb-4">
                    续约后到期日: <span class="text-theme-primary font-bold">2026-02-15</span>
                </div>
                <el-form-item label="支付方式">
                    <el-radio-group v-model="renewalForm.paymentMethod">
                        <el-radio label="cash">现金支付</el-radio>
                        <el-radio label="transfer">线下转账</el-radio>
                        <el-radio label="pos">POS机刷卡</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="renewalForm.note" placeholder="选填" ></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="renewalDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmRenewal">确认续约</el-button>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import router from '@/router';

// === Mock Data ===


                const corporateList = ref([
                    { id: 'CORP001', name: 'Google Taiwan' },
                    { id: 'CORP002', name: 'TSMC 台积电' },
                    { id: 'CORP003', name: 'Microsoft Taiwan' },
                    { id: 'CORP004', name: 'Apple Taiwan' }
                ]);

                const licenseTypes = ref([
                    { id: 'LT01', name: '普通小型车' },
                    { id: 'LT02', name: '普通重型机车' },
                    { id: 'LT03', name: '大型重型机车' },
                    { id: 'LT04', name: '大客车' }
                ]);

                // 步骤导航配置
                const currentStep = ref(0);
                const formSteps = ref([
                    { title: '账号资料', icon: 'UserFilled' },
                    { title: '地址联络', icon: 'Location' },
                    { title: '驾照证件', icon: 'Van' },
                    { title: '会员方案', icon: 'Medal' }
                ]);

                // 照片字段配置
                const photoFields = ref([
                    { key: 'idCardFront', label: '身份证正面' },
                    { key: 'idCardBack', label: '身份证反面' },
                    { key: 'licenseFront', label: '驾照正面' },
                    { key: 'licenseBack', label: '驾照反面' },
                    { key: 'selfie', label: '自拍照' }
                ]);

                const defaultMembers = [
                    {
                        id: 'CORP2405001',
                        companyName: '台积电 TSMC',
                        taxId: '87654321',
                        contactName: '张敏',
                        contactPhone: '0955-666-777',
                        companyType: '股份有限公司',
                        address: '新竹科学园区',
                        remarks: '大客户，重点维护',
                        serviceTypes: ['公务用车', '分时租赁'],
                        useTime: '全天',
                        planId: 'p2',
                        planName: '企业白金方案',
                        monthlySettlement: true,
                        account: 'admin@tsmc.com',
                        logo: '',
                        status: 'active'
                    },
                    {
                        id: 'CORP2405002',
                        companyName: '联发科 MediaTek',
                        taxId: '12345678',
                        contactName: '李强',
                        contactPhone: '0911-222-333',
                        companyType: '股份有限公司',
                        address: '新竹科学园区笃行一路1号',
                        remarks: '',
                        serviceTypes: ['门市租赁'],
                        useTime: '上班时间',
                        planId: 'p1',
                        planName: '企业标准方案',
                        monthlySettlement: false,
                        account: 'hr@mediatek.com',
                        logo: '',
                        status: 'active'
                    },
                    {
                        id: 'CORP2405003',
                        companyName: '新创网络科技有限公司',
                        taxId: '88990011',
                        contactName: '王大锤',
                        contactPhone: '0988-111-222',
                        companyType: '有限公司',
                        address: '新北市板桥区',
                        remarks: '近期有扩大用车需求',
                        serviceTypes: ['分时租赁'],
                        useTime: '全天',
                        planId: 'p1',
                        planName: '企业标准方案',
                        monthlySettlement: false,
                        account: 'wang@startup.tw',
                        logo: '',
                        status: 'suspended'
                    }
                ];

                const membershipPlans = ref([
                    { id: 'p1', name: '企业标准方案', tier: 1 },
                    { id: 'p2', name: '企业白金方案', tier: 2 },
                ]);

                // Data Persistence Logic
                // Data Persistence Logic (Restored to Simple Mode)
                const storedMembersRaw = localStorage.getItem('rimo_corporates');
                let initialMembers = storedMembersRaw ? JSON.parse(storedMembersRaw) : defaultMembers;

                // Reset to default if data set is too large (from previous bulk generation)
                if (initialMembers.length > 20) {
                    initialMembers = defaultMembers;
                    localStorage.setItem('rimo_corporates', JSON.stringify(initialMembers));
                }

                const members = ref(initialMembers);

                // Initialize default logic for existing mock data if missing new fields
                members.value.forEach(m => {
                    if (!m.reviewStatus) m.reviewStatus = 'approved';
                    if (!m.registrationChannel) m.registrationChannel = 'official_web';
                });

                watch(members, (newVal) => {
                    localStorage.setItem('rimo_corporates', JSON.stringify(newVal));
                }, { deep: true });

                // === Filters ===
                const filters = reactive({
                    keyword: '',
                    serviceType: '',
                    planId: '',
                    status: ''
                });

                const currentPage = ref(1);
                const pageSize = ref(20);

                const filteredMembers = computed(() => {
                    return members.value.filter(m => {
                        const matchKeyword = !filters.keyword ||
                            m.id.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                            m.companyName.includes(filters.keyword) ||
                            m.contactName.includes(filters.keyword) ||
                            m.taxId.includes(filters.keyword);

                        const matchSrv = !filters.serviceType || m.serviceTypes.includes(
                            filters.serviceType === 'timeshare' ? '分时租赁' :
                                filters.serviceType === 'store' ? '门市租赁' : '公务用车'
                        );

                        const matchPlan = !filters.planId || m.planId === filters.planId;
                        const matchStatus = !filters.status || m.status === filters.status;

                        return matchKeyword && matchSrv && matchPlan && matchStatus;
                    });
                });

                const paginatedMembers = computed(() => {
                    const start = (currentPage.value - 1) * pageSize.value;
                    return filteredMembers.value.slice(start, start + pageSize.value);
                });

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.serviceType = '';
                    filters.planId = '';
                    filters.status = '';
                };

                // === Helpers ===
                const getMembershipColor = (planId) => {
                    const colors = { 'MP001': 'info', 'MP002': '', 'MP003': 'warning', 'MP004': 'danger' };
                    return colors[planId] || 'info';
                };

                // === Dialog State ===
                const planDrawerVisible = ref(false);
                const changePlanDialogVisible = ref(false);
                const renewalDialogVisible = ref(false);
                const currentMember = ref({});

                const dialogVisible = ref(false);
                const isEdit = ref(false);

                // 驾照类型管理 Dialog
                const licenseTypeDialogVisible = ref(false);
                const newLicenseType = ref('');

                // === Plan Drawer / Change / Renewal State ===
                const changePlanForm = reactive({ planId: '', pricingCycle: 'monthly', effectiveType: 'immediate', reason: '' });
                const renewalForm = reactive({ cycle: '1_month', paymentMethod: 'cash', note: '' });
                const selectedPlan = computed(() => membershipPlans.value.find(p => p.id === changePlanForm.planId));
                const planHistory = ref([
                    { content: '开通企业白金方案', type: 'primary', timestamp: '2024-12-01', operator: '系统' },
                    { content: '企业注册', type: 'success', timestamp: '2024-11-15', operator: '管理员' }
                ]);
                const getPlanTier = (planId) => { const p = membershipPlans.value.find(x => x.id === planId); return p ? p.tier : 1; };
                const getPlanBenefits = (planId) => planId === 'p2' ? ['优先派车', '独享VIP客服', '免费延长用车', '月结30天账期'] : ['标准派车', '在线客服', '基本用车保障'];
                const openChangePlanDialog = () => { changePlanDialogVisible.value = true; };
                const openRenewalDialog = () => { renewalDialogVisible.value = true; };
                const confirmChangePlan = () => { changePlanDialogVisible.value = false; ElMessage.success('方案变更成功'); };
                const confirmRenewal = () => { renewalDialogVisible.value = false; ElMessage.success('续约成功'); };
                const handleTerminatePlan = () => { ElMessageBox.confirm('确定解约当前方案吗？', '警告', { type: 'warning' }).then(() => ElMessage.success('已解约')).catch(() => { }); };
                const addLicenseType = () => { if (newLicenseType.value.trim()) { licenseTypes.value.push({ id: 'LT' + Date.now(), name: newLicenseType.value.trim() }); newLicenseType.value = ''; } };
                const deleteLicenseType = (index) => { licenseTypes.value.splice(index, 1); };


                const memberForm = reactive({
                    id: '',
                    companyName: '',
                    taxId: '',
                    contactName: '',
                    contactPhone: '',
                    companyType: '',
                    address: '',
                    remarks: '',
                    serviceTypes: [],
                    useTime: '上班时间',
                    planId: '',
                    monthlySettlement: false,
                    account: '',
                    password: '',
                    // 公务用车专属参数
                    monthlyRate: '',
                    annualRate: '',
                    pickupLocation: '',
                    billingReminder: '',
                    billingContact: '',
                    billingEmail: ''
                });

                const openCreateDialog = () => {
                    isEdit.value = false;
                    Object.assign(memberForm, {
                        id: '',
                        companyName: '',
                        taxId: '',
                        contactName: '',
                        contactPhone: '',
                        companyType: '',
                        address: '',
                        remarks: '',
                        serviceTypes: [],
                        useTime: '上班时间',
                        planId: '',
                        monthlySettlement: false,
                        account: '',
                        password: '',
                        // 公务用车专属参数
                        monthlyRate: '',
                        annualRate: '',
                        pickupLocation: '',
                        billingReminder: '',
                        billingContact: '',
                        billingEmail: ''
                    });
                    dialogVisible.value = true;
                };

                const openEditDialog = (member) => {
                    isEdit.value = true;
                    Object.assign(memberForm, {
                        ...member,
                        password: '' // 编辑时不回显密码
                    });
                    dialogVisible.value = true;
                };

                const goToDetail = (member) => {
                    router.push(`/operation/corporate-detail?id=${member.id}`);
                };

                const saveMember = () => {
                    if (!memberForm.id || !memberForm.companyName || !memberForm.taxId || !memberForm.account) {
                        ElMessage.warning('请填写企业编号、企业名称、统编和登录账号');
                        return;
                    }
                    // prevent old warning from running
                    if (false) {
                        ElMessage.warning('请填写企业名称、统编和登录账号');
                        return;
                    }
                    if (!isEdit.value && !memberForm.password) {
                        ElMessage.warning('新增企业需设置管理员登录密码');
                        return;
                    }

                    const plan = membershipPlans.value.find(p => p.id === memberForm.planId);

                    const memberData = {
                        ...memberForm,
                        planName: plan ? plan.name : '',
                        status: isEdit.value ? members.value.find(m => m.id === memberForm.id).status : 'active'
                    };

                    if (isEdit.value) {
                        const idx = members.value.findIndex(m => m.id === memberForm.id);
                        if (idx !== -1) {
                            members.value[idx] = Object.assign(members.value[idx], memberData);
                        }
                    } else {
                        members.value.unshift(memberData);
                    }

                    dialogVisible.value = false;
                    ElMessage.success('保存成功');
                };

                const handleStatusChange = (row, val) => {
                    const text = val === 'active' ? '正常' : '停权';
                    ElMessage.success(`状态已更改为: ${text}`);
                };

                const exportData = () => {
                    ElMessage.info('导出功能开发中');
                };
</script>

<style scoped>
        .corporates-page {
            min-height: 100%;
        }

        /* Fix: 强制表头行高一致，防止 fixed 列导致表头错位 */
        .corporates-page :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            line-height: 44px;
            padding: 0 12px;
        }
</style>
