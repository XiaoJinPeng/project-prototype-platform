<template>
<div class="members-page">
            
            

            
            <main>
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">个人会员管理</h1>
                        <p class="text-gray-500 text-sm mt-1">管理所有会员用户信息，支持筛选、导出及状态变更。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20"
                            @click="openCreateDialog">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新增会员
                        </el-button>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    

                    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div class="flex gap-3 items-center flex-wrap">
                            <el-input v-model="filters.keyword" placeholder="搜索账号/姓名/手机号/Email/身份证" clearable
                                style="width: 280px" prefix-icon="Search"></el-input>
                            <el-select v-model="filters.corporateQualification" placeholder="企业资格" clearable style="width: 140px">
                                <el-option label="未加入企业" value="personal_only"></el-option>
                                <el-option label="已加入企业" value="corporate_qualified"></el-option>
                            </el-select>
                            <el-select v-model="filters.planId" placeholder="会员方案" clearable style="width: 140px">
                                <el-option v-for="plan in membershipPlans" :key="plan.id" :label="plan.name"
                                    :value="plan.id"></el-option>
                            </el-select>
                            <el-select v-model="filters.status" placeholder="账号状态" clearable style="width: 120px">
                                <el-option label="正常" value="active"></el-option>
                                <el-option label="停权" value="suspended"></el-option>
                                <el-option label="黑名单" value="blacklisted"></el-option>
                                <el-option label="封存" value="archived"></el-option>
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
                        <div class="text-sm text-gray-500">共 {{ filteredMembers.length }} 位会员</div>
                    </div>

                    
                    <el-table :data="paginatedMembers" stripe style="width: 100%"
                        :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }">
                        <el-table-column prop="id" label="用户ID" width="100">
                            <template #default="{ row }">
                                <span class="font-mono text-xs text-gray-500">{{ row.id }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="账号" min-width="150">
                            <template #default="{ row }">
                                <div class="flex items-center">
                                    <el-avatar :size="32" class="mr-3 border bg-blue-100 text-blue-600 border-blue-200">
                                        {{ row.name.charAt(0) }}
                                    </el-avatar>
                                    <div>
                                        <div class="font-medium text-gray-900">{{ row.account }}</div>
                                        <div class="mt-1 flex flex-wrap gap-1">
                                            <el-tag type="info" size="small" effect="plain">个人</el-tag>
                                            <el-tag v-if="row.corporate" type="warning" size="small" effect="plain">企业资格</el-tag>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="name" label="姓名" width="100"></el-table-column>
                        <el-table-column label="联系方式" min-width="180">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-900">{{ row.phone }}</div>
                                <div class="text-xs text-gray-400">{{ row.email }}</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="身份证号" width="140">
                            <template #default="{ row }">
                                <span class="font-mono text-sm text-gray-600">{{ row.idNumber }}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="会员方案" min-width="160">
                            <template #default="{ row }">
                                <div class="flex items-center">
                                    <el-tag :type="getMembershipColor(row.membership.planId)" size="small" class="mr-2">
                                        {{ row.membership.planName }}
                                    </el-tag>
                                    <el-icon v-if="row.membership.autoRenew" class="text-green-500" title="自动续费">
                                        <RefreshRight></RefreshRight>
                                    </el-icon>
                                </div>
                                <div class="text-xs text-gray-400 mt-1">
                                    到期: {{ row.membership.expireDate || '永久' }}
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="企业资格" width="180">
                            <template #default="{ row }">
                                <div v-if="row.corporate">
                                    <div class="text-sm text-gray-900">{{ row.corporate.companyName }}</div>
                                    <div class="text-xs text-orange-500 mt-1">已加入企业</div>
                                </div>
                                <span v-else class="text-gray-400">未加入企业</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="状态" width="100">
                            <template #default="{ row }">
                                <el-tag v-if="row.reviewStatus === 'pending'" type="warning" size="small"
                                    effect="dark">待审核</el-tag>
                                <el-tag v-else-if="row.reviewStatus === 'rejected'" type="danger" size="small"
                                    effect="dark">已拒绝</el-tag>
                                <template v-else>
                                    <el-tag v-if="row.status === 'active'" type="success" size="small"
                                        effect="light">正常</el-tag>
                                    <el-tag v-else-if="row.status === 'suspended'" type="warning" size="small"
                                        effect="light">停权</el-tag>
                                    <el-tag v-else-if="row.status === 'blacklisted'" type="danger" size="small"
                                        effect="dark">黑名单</el-tag>
                                    <el-tag v-else-if="row.status === 'archived'" type="info" size="small"
                                        effect="plain">封存</el-tag>
                                </template>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="160" align="right" fixed="right">
                            <template #default="{ row }">
                                <div class="flex justify-end gap-2">
                                    <el-button type="primary" link size="small"
                                        @click="openDetailDialog(row)">详情</el-button>
                                    <el-button v-if="row.status !== 'archived'" type="primary" link size="small"
                                        @click="openEditDialog(row)">编辑</el-button>
                                    <el-dropdown v-if="row.status !== 'archived'" trigger="click"
                                        @command="(cmd) => handleCommand(cmd, row)">
                                        <el-button type="info" link size="small">
                                            更多<el-icon class="el-icon--right"><arrow-down></arrow-down></el-icon>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                
                                                <template v-if="row.status === 'active'">
                                                    <el-dropdown-item command="suspend">停权</el-dropdown-item>
                                                    <el-dropdown-item command="archive">封存</el-dropdown-item>
                                                    <el-dropdown-item command="blacklist" divided><span 
                                                            class="text-red-500">加入黑名单</span></el-dropdown-item>
                                                </template>

                                                
                                                <template v-if="row.status === 'suspended'">
                                                    <el-dropdown-item command="activate">恢复正常</el-dropdown-item>
                                                    <el-dropdown-item command="archive">封存</el-dropdown-item>
                                                    <el-dropdown-item command="blacklist" divided><span 
                                                            class="text-red-500">加入黑名单</span></el-dropdown-item>
                                                </template>

                                                
                                                <template v-if="row.status === 'archived'">
                                                    <el-dropdown-item command="activate">恢复正常</el-dropdown-item>
                                                </template>

                                                
                                                <template v-if="row.status === 'blacklisted'">
                                                    <el-dropdown-item command="activate">移出黑名单</el-dropdown-item>
                                                </template>

                                                <el-dropdown-item command="managePlan" divided
                                                    :disabled="row.status === 'archived'">
                                                    <span class="text-blue-600">方案管理</span>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
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

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员' : '新增会员'" width="900px" top="3vh" destroy-on-close
            class="member-dialog">
            <el-form :model="memberForm" label-position="top" class="custom-scroll max-h-[70vh] overflow-y-auto px-2">

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-white">
                            <UserFilled></UserFilled>
                        </el-icon>
                        基本资料
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="6">
                                <el-form-item label="姓" required>
                                    <el-input v-model="memberForm.surname" placeholder="张" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="名" required>
                                    <el-input v-model="memberForm.firstName" placeholder="三" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="性别">
                                    <el-select v-model="memberForm.gender" class="w-full">
                                        <el-option label="男" value="male" ></el-option>
                                        <el-option label="女" value="female" ></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="出生日期">
                                    <el-date-picker v-model="memberForm.dob" type="date" placeholder="选择" class="w-full"
                                        value-format="YYYY-MM-DD" ></el-date-picker>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="手机号" required>
                                    <el-input v-model="memberForm.phone" placeholder="0912-345-678"
                                        prefix-icon="Phone" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="Email">
                                    <el-input v-model="memberForm.email" placeholder="email@example.com"
                                        prefix-icon="Message" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="身份证号" required>
                                    <el-input v-model="memberForm.idNumber" placeholder="A123456789"
                                        prefix-icon="Postcard" ></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-white">
                            <Location></Location>
                        </el-icon>
                        地址信息
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-form-item label="户籍地址">
                                    <el-input v-model="memberForm.householdAddress" placeholder="输入户籍地址"
                                        prefix-icon="House" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="通讯地址">
                                    <el-input v-model="memberForm.mailingAddress" placeholder="输入通讯地址"
                                        prefix-icon="Position" ></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-white">
                            <PhoneFilled></PhoneFilled>
                        </el-icon>
                        紧急联络人
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="8">
                                <el-form-item label="姓名">
                                    <el-input v-model="memberForm.emergencyContact.name" placeholder="联络人姓名" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="关系">
                                    <el-select v-model="memberForm.emergencyContact.relationship" placeholder="选择关系"
                                        class="w-full" allow-create filterable>
                                        <el-option label="配偶" value="配偶" ></el-option>
                                        <el-option label="父母" value="父母" ></el-option>
                                        <el-option label="子女" value="子女" ></el-option>
                                        <el-option label="兄弟姐妹" value="兄弟姐妹" ></el-option>
                                        <el-option label="朋友" value="朋友" ></el-option>
                                        <el-option label="同事" value="同事" ></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item label="手机号">
                                    <el-input v-model="memberForm.emergencyContact.phone" placeholder="联络人电话"
                                        prefix-icon="Phone" ></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
                        <div class="flex items-center">
                            <el-icon class="mr-2 text-white">
                                <Van></Van>
                            </el-icon>
                            驾驶执照
                        </div>
                        <el-button size="small" plain type="primary" @click="openLicenseTypeDialog">
                            <el-icon class="mr-1">
                                <Setting></Setting>
                            </el-icon>管理类型
                        </el-button>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="6">
                                <el-form-item label="驾照类型">
                                    <el-select v-model="memberForm.driverLicense.type" placeholder="选择类型"
                                        class="w-full">
                                        <el-option v-for="type in licenseTypes" :key="type.id" :label="type.name"
                                            :value="type.id" ></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="签发地">
                                    <el-input v-model="memberForm.driverLicense.issuePlace" placeholder="例如: 台北市" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="驾照号码">
                                    <el-input v-model="memberForm.driverLicense.number" placeholder="驾照号码" ></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="到期时间">
                                    <el-date-picker v-model="memberForm.driverLicense.expiryDate" type="date"
                                        placeholder="选择日期" class="w-full" value-format="YYYY-MM-DD" ></el-date-picker>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row :gutter="16">
                            <el-col :span="24">
                                <el-form-item label="可用载具类型">
                                    <el-checkbox-group v-model="memberForm.availableVehicleTypes">
                                        <el-checkbox v-for="item in vehicleTypeOptions" :key="item.value"
                                            :label="item.value">
                                            {{ item.label }}
                                        </el-checkbox>
                                    </el-checkbox-group>
                                    <div class="text-xs text-gray-400 mt-1">预约时按所选车辆载具类型校验；微电车默认不要求驾照。</div>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-white">
                            <Picture></Picture>
                        </el-icon>
                        证件照片
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div v-for="photo in photoFields" :key="photo.key" class="text-center group">
                                <div 
                                    class="relative w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-theme-primary hover:bg-blue-50 transition-all group-hover:scale-[1.02]">
                                    <el-icon class="text-2xl text-gray-400 group-hover:text-theme-primary mb-1">
                                        <Plus></Plus>
                                    </el-icon>
                                    <span class="text-xs text-gray-400 group-hover:text-theme-primary">上传</span>
                                </div>
                                <div class="mt-2 text-xs text-gray-500">{{ photo.label }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="mb-5">
                    <div class="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <el-icon class="mr-2 text-theme-primary">
                            <Medal></Medal>
                        </el-icon>
                        会员方案
                    </div>
                    <div 
                        class="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-form-item label="选择方案">
                                    <el-select v-model="memberForm.planId" placeholder="选择方案" class="w-full">
                                        <el-option v-for="plan in membershipPlans" :key="plan.id" :label="plan.name"
                                            :value="plan.id" ></el-option>
                                    </el-select>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="自动续费">
                                    <el-switch v-model="memberForm.autoRenew" active-text="开启" inactive-text="关闭"
                                        style="--el-switch-on-color: var(--app-color-primary)" ></el-switch>
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
                        账号信息
                        <span class="ml-2 text-xs text-gray-400 font-normal">（默认使用手机号作为登录账号）</span>
                    </div>
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <el-row :gutter="16">
                            <el-col :span="12">
                                <el-form-item label="登录账号" required>
                                    <el-input v-model="memberForm.account" placeholder="默认为手机号" :disabled="isEdit"
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
                const membershipPlans = ref([
                    { id: 'MP001', name: '普通会员' },
                    { id: 'MP002', name: '银牌会员' },
                    { id: 'MP003', name: '金牌会员' },
                    { id: 'MP004', name: '钻石会员' }
                ]);

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

                const vehicleTypeOptions = ref([
                    { value: 'car', label: '汽车' },
                    { value: 'motorcycle', label: '摩托车' },
                    { value: 'microElectric', label: '微电车' }
                ]);

                const inferAvailableVehicleTypes = (driverLicense = {}) => {
                    const result = ['microElectric'];
                    if (driverLicense.type === 'LT01' || driverLicense.type === 'LT04') result.unshift('car');
                    if (driverLicense.type === 'LT02' || driverLicense.type === 'LT03') result.unshift('motorcycle');
                    return [...new Set(result)];
                };

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
                        id: 'U10001', accountType: 'personal',
                        account: '0912345678', name: '张三', surname: '张', firstName: '三',
                        gender: 'male', dob: '1990-01-01', phone: '0912-345-678', email: 'zhangsan@example.com', idNumber: 'A123456789',
                        householdAddress: '台北市信义区信义路五段7号', mailingAddress: '台北市信义区信义路五段7号',
                        emergencyContact: { name: '李四', relationship: '配偶', phone: '0987-654-321' },
                        driverLicense: { type: 'LT01', issuePlace: '台北市', number: 'DL123456', expiryDate: '2030-01-01' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        membership: { planId: 'MP003', planName: '金牌会员', expireDate: '2025-06-30', autoRenew: true },
                        corporate: null,
                        status: 'active',
                        reviewStatus: 'approved',
                        registrationChannel: 'official_web',
                        createTime: '2024-01-15 10:30', lastLoginTime: '2024-05-06 14:20',
                        orderHistory: [
                            { orderId: 'ZT2405010001', createTime: '2024-05-01 10:00', vehicle: 'Toyota RAV4', amount: 1920, status: 'completed', statusText: '已完成' },
                        ]
                    },
                    {
                        id: 'U10002', accountType: 'personal',
                        account: '0922333444', name: '李四', surname: '李', firstName: '四',
                        gender: 'male', dob: '1992-02-02', phone: '0922-333-444', email: 'lisi@example.com', idNumber: 'B123456789',
                        householdAddress: '', mailingAddress: '',
                        emergencyContact: {}, driverLicense: {},
                        availableVehicleTypes: ['microElectric'],
                        membership: { planId: 'MP001', planName: '普通会员', expireDate: null, autoRenew: false },
                        corporate: null,
                        status: 'suspended',
                        reviewStatus: 'approved',
                        registrationChannel: 'ios',
                        createTime: '2024-02-15 10:30', lastLoginTime: '2024-03-01 14:20',
                        orderHistory: []
                    },
                    {
                        id: 'U10003', accountType: 'personal',
                        account: '0933444555', name: '王五', surname: '王', firstName: '五',
                        gender: 'male', dob: '1988-08-08', phone: '0933-444-555', email: 'wangwu@example.com', idNumber: 'C123456789',
                        householdAddress: '', mailingAddress: '',
                        emergencyContact: {}, driverLicense: {},
                        availableVehicleTypes: ['microElectric'],
                        membership: { planId: 'MP001', planName: '普通会员', expireDate: null, autoRenew: false },
                        corporate: null,
                        status: 'blacklisted',
                        reviewStatus: 'approved',
                        registrationChannel: 'android',
                        createTime: '2023-11-15 10:30', lastLoginTime: '2023-12-01 14:20',
                        orderHistory: []
                    },
                    {
                        id: 'U10004', accountType: 'personal',
                        account: '0944555666', name: '赵六', surname: '赵', firstName: '六',
                        gender: 'female', dob: '1995-05-05', phone: '0944-555-666', email: 'zhaoliu@example.com', idNumber: 'D123456789',
                        householdAddress: '', mailingAddress: '',
                        emergencyContact: {}, driverLicense: {},
                        availableVehicleTypes: ['microElectric'],
                        membership: { planId: 'MP001', planName: '普通会员', expireDate: null, autoRenew: false },
                        corporate: null,
                        status: 'archived',
                        reviewStatus: 'approved',
                        registrationChannel: 'official_web',
                        createTime: '2022-01-01 10:30', lastLoginTime: '2022-06-01 14:20',
                        orderHistory: []
                    },
                    {
                        id: 'U10005', accountType: 'personal',
                        account: '0911222333', name: '林志明', surname: '林', firstName: '志明',
                        gender: 'male', dob: '1985-05-05', phone: '0911-222-333', email: 'chihming.lin@example.com', idNumber: 'G123456789',
                        householdAddress: '台北市信义区', mailingAddress: '台北市信义区',
                        emergencyContact: { name: '', relationship: '', phone: '' },
                        driverLicense: { type: '', issuePlace: '', number: '', expiryDate: '' },
                        availableVehicleTypes: ['microElectric'],
                        membership: { planId: 'MP004', planName: '钻石会员', expireDate: '2030-12-31', autoRenew: true },
                        corporate: { companyId: 'CORP001', companyName: 'Google Taiwan', taxId: '12345678' },
                        status: 'active',
                        reviewStatus: 'approved',
                        registrationChannel: 'official_web',
                        createTime: '2023-01-01 09:00', lastLoginTime: '2024-05-10 09:00',
                        orderHistory: []
                    },
                    {
                        id: 'U10006', accountType: 'personal',
                        account: '0955666777', name: '陈怡君', surname: '陈', firstName: '怡君',
                        gender: 'female', dob: '1990-10-10', phone: '0955-666-777', email: 'yijun.chen@example.com', idNumber: 'T123456789',
                        householdAddress: '新竹科学园区', mailingAddress: '新竹科学园区',
                        emergencyContact: { name: '', relationship: '', phone: '' },
                        driverLicense: { type: '', issuePlace: '', number: '', expiryDate: '' },
                        availableVehicleTypes: ['microElectric'],
                        membership: { planId: 'MP003', planName: '金牌会员', expireDate: '2025-12-31', autoRenew: true },
                        corporate: { companyId: 'CORP002', companyName: 'TSMC 台积电', taxId: '87654321' },
                        status: 'active',
                        reviewStatus: 'approved',
                        registrationChannel: 'official_web',
                        createTime: '2024-02-01 10:00', lastLoginTime: '2024-05-09 14:00',
                        orderHistory: []
                    },
                    {
                        id: 'U10007', accountType: 'personal',
                        account: '0988000111', name: '王小敏', surname: '王', firstName: '小敏',
                        gender: 'female', dob: '2000-01-01', phone: '0988-000-111', email: 'xiaomin@example.com', idNumber: 'E123456789',
                        householdAddress: '台中市', mailingAddress: '',
                        emergencyContact: { name: '张伟', relationship: '朋友', phone: '0911-000-111' },
                        driverLicense: { type: 'LT01', issuePlace: '台中市', number: 'DL888999', expiryDate: '2032-01-01' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        membership: { planId: 'MP001', planName: '普通会员', expireDate: null, autoRenew: false },
                        corporate: null,
                        status: 'active',
                        reviewStatus: 'pending',
                        registrationChannel: 'android',
                        createTime: '2024-05-10 08:00', lastLoginTime: '',
                        orderHistory: []
                    },
                    {
                        id: 'U10008', accountType: 'personal',
                        account: '0988000222', name: '陈志强', surname: '陈', firstName: '志强',
                        gender: 'male', dob: '1995-05-05', phone: '0988-000-222', email: 'zhiqiang@example.com', idNumber: 'F123456789',
                        householdAddress: '高雄市', mailingAddress: '',
                        emergencyContact: {}, driverLicense: { type: 'LT01', issuePlace: '高雄市', number: 'DL777666', expiryDate: '2028-05-05' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        membership: { planId: 'MP001', planName: '普通会员', expireDate: null, autoRenew: false },
                        corporate: null,
                        status: 'active',
                        reviewStatus: 'pending',
                        registrationChannel: 'ios',
                        createTime: '2024-05-10 09:30', lastLoginTime: '',
                        orderHistory: []
                    }
                ];

                // Data Persistence Logic
                // Data Persistence Logic (Restored to Simple Mode)
                const storedMembersRaw = localStorage.getItem('rimo_members');
                let initialMembers = storedMembersRaw ? JSON.parse(storedMembersRaw) : defaultMembers;

                // Reset to default if data set is too large (from previous bulk generation)
                if (initialMembers.length > 20) {
                    initialMembers = defaultMembers;
                    localStorage.setItem('rimo_members', JSON.stringify(initialMembers));
                }

                const members = ref(initialMembers);

                // Initialize default logic for existing mock data if missing new fields
                members.value.forEach(m => {
                    m.accountType = 'personal';
                    if (!m.reviewStatus) m.reviewStatus = 'approved';
                    if (!m.registrationChannel) m.registrationChannel = 'official_web';
                    if (!Object.prototype.hasOwnProperty.call(m, 'corporate')) m.corporate = null;
                    if (!Array.isArray(m.availableVehicleTypes)) m.availableVehicleTypes = inferAvailableVehicleTypes(m.driverLicense);
                    if (m.id === 'U10005') {
                        m.name = '林志明';
                        m.surname = '林';
                        m.firstName = '志明';
                        m.email = 'chihming.lin@example.com';
                    }
                    if (m.id === 'U10006') {
                        m.name = '陈怡君';
                        m.surname = '陈';
                        m.firstName = '怡君';
                        m.email = 'yijun.chen@example.com';
                        if (m.corporate) m.corporate.companyName = 'TSMC 台积电';
                    }
                });

                watch(members, (newVal) => {
                    localStorage.setItem('rimo_members', JSON.stringify(newVal));
                }, { deep: true });

                // === Filters ===
                const filters = reactive({
                    keyword: '',
                    corporateQualification: '',
                    planId: '',
                    status: ''
                });

                const currentPage = ref(1);
                const pageSize = ref(20);

                const filteredMembers = computed(() => {
                    return members.value.filter(m => {
                        const matchKeyword = !filters.keyword ||
                            m.account.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                            m.name.includes(filters.keyword) ||
                            m.phone.includes(filters.keyword) ||
                            m.email.toLowerCase().includes(filters.keyword.toLowerCase()) ||
                            m.idNumber.includes(filters.keyword);
                        const matchQualification = !filters.corporateQualification ||
                            (filters.corporateQualification === 'personal_only' && !m.corporate) ||
                            (filters.corporateQualification === 'corporate_qualified' && !!m.corporate);
                        const matchPlan = !filters.planId || m.membership.planId === filters.planId;
                        const matchStatus = !filters.status || m.status === filters.status;

                        return matchKeyword && matchQualification && matchPlan && matchStatus;
                    });
                });

                const paginatedMembers = computed(() => {
                    const start = (currentPage.value - 1) * pageSize.value;
                    return filteredMembers.value.slice(start, start + pageSize.value);
                });

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.corporateQualification = '';
                    filters.planId = '';
                    filters.status = '';
                };

                // === Helpers ===
                const getMembershipColor = (planId) => {
                    const colors = { 'MP001': 'info', 'MP002': '', 'MP003': 'warning', 'MP004': 'danger' };
                    return colors[planId] || 'info';
                };

                // === Dialog State ===
                const dialogVisible = ref(false);
                const isEdit = ref(false);

                // 驾照类型管理 Dialog
                const licenseTypeDialogVisible = ref(false);
                const newLicenseType = ref('');

                const memberForm = reactive({
                    id: '',
                    account: '', password: '',
                    surname: '', firstName: '', gender: 'male', dob: '',
                    phone: '', email: '', idNumber: '',
                    householdAddress: '', mailingAddress: '',
                    emergencyContact: { name: '', relationship: '', phone: '' },
                    driverLicense: { type: '', issuePlace: '', number: '', expiryDate: '' },
                    availableVehicleTypes: ['microElectric'],
                    planId: 'MP001', expireDate: '', autoRenew: false,
                    companyId: '' // 保留字段，虽然不再从弹窗选择
                });

                // 自动将手机号同步到账号字段（仅新增时生效）
                watch(() => memberForm.phone, (newPhone) => {
                    if (!isEdit.value && newPhone) {
                        memberForm.account = newPhone;
                    }
                });

                const openCreateDialog = () => {
                    isEdit.value = false;
                    Object.assign(memberForm, {
                        id: 'U' + Date.now(),
                        account: '', password: '',
                        surname: '', firstName: '', gender: 'male', dob: '',
                        phone: '', email: '', idNumber: '',
                        householdAddress: '', mailingAddress: '',
                        emergencyContact: { name: '', relationship: '', phone: '' },
                        driverLicense: { type: '', issuePlace: '', number: '', expiryDate: '' },
                        availableVehicleTypes: ['microElectric'],
                        planId: 'MP001', expireDate: '', autoRenew: false,
                        companyId: ''
                    });
                    currentStep.value = 0;
                    dialogVisible.value = true;
                };

                const openEditDialog = (member) => {
                    isEdit.value = true;
                    Object.assign(memberForm, {
                        id: member.id,
                        account: member.account,
                        password: '', // 编辑时不回显密码
                        surname: member.surname || member.name.charAt(0), // 简单回退策略
                        firstName: member.firstName || member.name.slice(1),
                        gender: member.gender || 'male',
                        dob: member.dob || '',
                        phone: member.phone,
                        email: member.email,
                        idNumber: member.idNumber,
                        householdAddress: member.householdAddress || '',
                        mailingAddress: member.mailingAddress || '',
                        // Deep copy objects to avoid reference modification
                        emergencyContact: { ...member.emergencyContact } || { name: '', relationship: '', phone: '' },
                        driverLicense: { ...member.driverLicense } || { type: '', issuePlace: '', number: '', expiryDate: '' },
                        availableVehicleTypes: Array.isArray(member.availableVehicleTypes) ? [...member.availableVehicleTypes] : inferAvailableVehicleTypes(member.driverLicense),

                        planId: member.membership.planId,
                        expireDate: member.membership.expireDate,
                        autoRenew: member.membership.autoRenew,
                        companyId: member.corporate?.companyId || ''
                    });
                    currentStep.value = 0;
                    dialogVisible.value = true;
                };

                const openDetailDialog = (member) => {
                    router.push(`/operation/member-detail?id=${member.id}`);
                };

                const saveMember = () => {
                    if (!memberForm.account || !memberForm.surname || !memberForm.firstName || !memberForm.phone || !memberForm.idNumber) {
                        ElMessage.warning('请填写必填项 (账号、姓名、手机、身份证)');
                        return;
                    }
                    if (!isEdit.value && !memberForm.password) {
                        ElMessage.warning('新增用户请设置密码');
                        return;
                    }

                    const plan = membershipPlans.value.find(p => p.id === memberForm.planId);

                    const fullName = memberForm.surname + memberForm.firstName;

                    const memberData = {
                        id: memberForm.id,
                        accountType: 'personal', // 默认为个人
                        account: memberForm.account,
                        name: fullName,
                        surname: memberForm.surname,
                        firstName: memberForm.firstName,
                        gender: memberForm.gender,
                        dob: memberForm.dob,
                        phone: memberForm.phone,
                        email: memberForm.email,
                        idNumber: memberForm.idNumber,
                        householdAddress: memberForm.householdAddress,
                        mailingAddress: memberForm.mailingAddress,
                        emergencyContact: { ...memberForm.emergencyContact },
                        driverLicense: { ...memberForm.driverLicense },
                        availableVehicleTypes: [...memberForm.availableVehicleTypes],

                        membership: {
                            planId: memberForm.planId,
                            planName: plan?.name || '普通会员',
                            expireDate: memberForm.expireDate,
                            autoRenew: memberForm.autoRenew
                        },
                        corporate: null, // 暂时不关联企业
                        status: 'active',
                        createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
                        lastLoginTime: '',
                        orderHistory: []
                    };

                    if (isEdit.value) {
                        const idx = members.value.findIndex(m => m.id === memberForm.id);
                        if (idx !== -1) {
                            // 保留原有状态字段
                            memberData.status = members.value[idx].status;
                            memberData.createTime = members.value[idx].createTime;
                            memberData.lastLoginTime = members.value[idx].lastLoginTime;
                            memberData.orderHistory = members.value[idx].orderHistory;
                            memberData.corporate = members.value[idx].corporate; // 只是编辑保留企业关联
                            memberData.accountType = 'personal';

                            members.value[idx] = memberData;
                        }
                    } else {
                        members.value.unshift(memberData);
                    }

                    dialogVisible.value = false;
                    ElMessage.success('保存成功');
                };

                // === 驾照类型管理 ===
                const openLicenseTypeDialog = () => {
                    licenseTypeDialogVisible.value = true;
                };

                const addLicenseType = () => {
                    if (!newLicenseType.value) return;
                    licenseTypes.value.push({
                        id: 'LT' + Date.now(),
                        name: newLicenseType.value
                    });
                    newLicenseType.value = '';
                };

                const deleteLicenseType = (index) => {
                    licenseTypes.value.splice(index, 1);
                };



                // --- Plan Management Logic ---
                const planDrawerVisible = ref(false);
                const changePlanDialogVisible = ref(false);
                const renewalDialogVisible = ref(false);
                const currentMember = ref(null);
                const planHistory = ref([]);

                const changePlanForm = reactive({
                    planId: '',
                    pricingCycle: 'monthly',
                    effectiveType: 'immediate',
                    reason: ''
                });

                const renewalForm = reactive({
                    cycle: '1_month',
                    paymentMethod: 'cash',
                    note: ''
                });

                const selectedPlan = computed(() => {
                    return membershipPlans.value.find(p => p.id === changePlanForm.planId);
                });

                const getPlanTier = (planId) => {
                    // Mock tiers
                    const map = { 'MP001': 1, 'MP002': 2, 'MP003': 3, 'MP004': 4 };
                    return map[planId] || 1;
                };

                const getPlanBenefits = (planId) => {
                    // Mock benefits
                    const map = {
                        'MP001': ['基础租车', '积分累积'],
                        'MP002': ['积分1.5倍', '专属客服', '生日礼'],
                        'MP003': ['积分2倍', '免费升级车型', 'VIP休息室'],
                        'MP004': ['积分3倍', '优先预订', '机场接送', '管家服务']
                    };
                    return map[planId] || ['基础服务'];
                };

                const handleCommand = (command, row) => {
                    if (command === 'managePlan') {
                        currentMember.value = row;
                        // Mock History
                        planHistory.value = [
                            { content: '自动续费成功 (月缴)', timestamp: '2026-01-15', type: 'success', operator: '系统' },
                            { content: '升级为银牌会员', timestamp: '2025-12-15', type: 'primary', operator: '管理员' },
                            { content: '注册成为普通会员', timestamp: '2025-11-01', operator: '用户' }
                        ];
                        planDrawerVisible.value = true;
                    } else if (command === 'suspend') {
                        ElMessageBox.confirm(`确定要停权会员 "${row.name}" 吗？停权后该用户将无法下单。`, '停权操作', { type: 'warning' })
                            .then(() => {
                                row.status = 'suspended';
                                ElMessage.warning('账号已停权');
                            });
                    } else if (command === 'archive') {
                        ElMessageBox.confirm(`确定要封存会员 "${row.name}" 吗？`, '封存操作', { type: 'info' })
                            .then(() => {
                                row.status = 'archived';
                                ElMessage.info('账号已封存');
                            });
                    } else if (command === 'blacklist') {
                        ElMessageBox.prompt('请输入加入黑名单的原因', '加入黑名单', {
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            inputPattern: /.+/,
                            inputErrorMessage: '原因不能为空'
                        }).then(({ value }) => {
                            row.status = 'blacklisted';
                            ElMessage.error(`账号已加入黑名单: ${value}`);
                        });
                    } else if (command === 'activate') {
                        ElMessageBox.confirm(`确定要恢复会员 "${row.name}" 为正常状态吗？`, '恢复操作', { type: 'success' })
                            .then(() => {
                                row.status = 'active';
                                ElMessage.success('账号已恢复正常');
                            });
                    }
                };

                const openChangePlanDialog = () => {
                    changePlanForm.planId = '';
                    changePlanForm.pricingCycle = 'monthly';
                    changePlanForm.effectiveType = 'immediate';
                    changePlanForm.reason = '';
                    changePlanDialogVisible.value = true;
                };

                const confirmChangePlan = () => {
                    if (!changePlanForm.planId) {
                        ElMessage.warning('请选择目标方案');
                        return;
                    }
                    const newPlan = membershipPlans.value.find(p => p.id === changePlanForm.planId);
                    currentMember.value.membership.planId = newPlan.id;
                    currentMember.value.membership.planName = newPlan.name;

                    planHistory.value.unshift({
                        content: `变更为 ${newPlan.name}`,
                        timestamp: new Date().toISOString().split('T')[0],
                        type: 'warning',
                        operator: '管理员'
                    });

                    ElMessage.success('会员方案变更成功');
                    changePlanDialogVisible.value = false;
                };

                const handleTerminatePlan = () => {
                    ElMessageBox.confirm('确定要解约当前方案吗？解约后将降级为免费普通会员。', '警告', { type: 'error' })
                        .then(() => {
                            currentMember.value.membership.planId = 'MP001';
                            currentMember.value.membership.planName = '普通会员';
                            currentMember.value.membership.expireDate = null;
                            currentMember.value.membership.autoRenew = false;

                            planHistory.value.unshift({
                                content: `解约当前方案，降级为普通会员`,
                                timestamp: new Date().toISOString().split('T')[0],
                                type: 'danger',
                                operator: '管理员'
                            });
                            ElMessage.success('已解约，恢复为普通会员');
                        });
                };

                const openRenewalDialog = () => {
                    renewalForm.cycle = '1_month';
                    renewalForm.note = '';
                    renewalDialogVisible.value = true;
                };

                const confirmRenewal = () => {
                    // Mock extending date
                    currentMember.value.membership.expireDate = '2026-02-15'; // Mock updated date
                    planHistory.value.unshift({
                        content: `手动续约成功`,
                        timestamp: new Date().toISOString().split('T')[0],
                        type: 'success',
                        operator: '管理员'
                    });
                    ElMessage.success('续约成功');
                    renewalDialogVisible.value = false;
                };

                const exportData = () => {
                    ElMessage.info('导出功能开发中');
                };
</script>

<style scoped>
        .members-page {
            min-height: 100%;
        }

        /* Fix: 强制表头行高一致，防止 fixed 列导致表头错位 */
        .members-page :deep(.el-table__header th.el-table__cell) {
            height: 44px;
            line-height: 44px;
            padding: 0 12px;
        }
</style>
