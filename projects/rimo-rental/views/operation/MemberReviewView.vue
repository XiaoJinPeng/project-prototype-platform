<template>
<div class="member-review-page">

            
            

            <main>
                
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">资质认证审核</h1>
                        <p class="text-sm text-gray-500 mt-1">审核会员注册申请，管理审核流程</p>
                    </div>
                </div>


                
                <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm stat-card">
                        <div class="text-gray-500 text-xs font-medium mb-1">待审核</div>
                        <div class="text-2xl font-bold text-orange-500">{{ stats.pending }}</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm stat-card">
                        <div class="text-gray-500 text-xs font-medium mb-1">今日新增</div>
                        <div class="text-2xl font-bold text-blue-600">{{ stats.todayNew }}</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm stat-card">
                        <div class="text-gray-500 text-xs font-medium mb-1">今日通过</div>
                        <div class="text-2xl font-bold text-green-600">{{ stats.todayApproved }}</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 border border-gray-100 shadow-sm stat-card">
                        <div class="text-gray-500 text-xs font-medium mb-1">今日驳回</div>
                        <div class="text-2xl font-bold text-red-500">{{ stats.todayRejected }}</div>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col min-h-[600px]">
                    
                    <div class="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
                        <div class="flex items-center gap-3">
                            <el-input v-model="filters.keyword" placeholder="搜索姓名或手机号" prefix-icon="Search"
                                style="width: 200px"></el-input>
                            <el-select v-model="filters.status" placeholder="审核状态" style="width: 120px" size="default">
                                <el-option label="全部状态" value=""></el-option>
                                <el-option label="待审核" value="pending"></el-option>
                                <el-option label="已驳回" value="rejected"></el-option>
                            </el-select>
                            <el-select v-model="filters.channel" placeholder="注册渠道" style="width: 120px" size="default">
                                <el-option label="全部渠道" value=""></el-option>
                                <el-option label="iOS APP" value="ios"></el-option>
                                <el-option label="Android APP" value="android"></el-option>
                                <el-option label="Web 官网" value="web"></el-option>
                            </el-select>
                            <el-date-picker v-model="filters.dateRange" type="daterange" range-separator="-"
                                start-placeholder="提交起始" end-placeholder="提交结束" size="default"
                                style="width: 240px"></el-date-picker>
                            <el-button circle @click="resetFilters" icon="RefreshRight" title="重置筛选"></el-button>
                        </div>
                        <div class="flex items-center gap-2">
                            <el-button type="primary" :disabled="selectedRows.length === 0" @click="handleBatchApprove">
                                <el-icon class="mr-1">
                                    <Check></Check>
                                </el-icon> 批量审核
                            </el-button>
                        </div>
                    </div>

                    
                    <el-table :data="filteredList" stripe style="width: 100%" class="flex-1"
                        @selection-change="handleSelectionChange"
                        :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }">
                        <el-table-column type="selection" width="55"
                            :selectable="row => row.status === 'pending' || row.status === 'rejected'"></el-table-column>
                        <el-table-column prop="id" label="用户ID" width="100" show-overflow-tooltip></el-table-column>
                        <el-table-column label="姓名" width="120">
                            <template #default="{ row }">
                                <div class="flex items-center">
                                    <el-avatar :size="24" class="mr-2" :src="row.avatar">{{ row.name.charAt(0)
                                        }}</el-avatar>
                                    <span class="font-medium">{{ row.name }}</span>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="phone" label="手机号" width="120"></el-table-column>
                        <el-table-column label="渠道" width="100">
                            <template #default="{ row }">
                                <div class="flex items-center" v-if="row.channel === 'ios'">
                                    <el-icon class="text-gray-500 mr-1">
                                        <Iphone></Iphone>
                                    </el-icon> iOS
                                </div>
                                <div class="flex items-center" v-else-if="row.channel === 'android'">
                                    <el-icon class="text-green-600 mr-1">
                                        <Iphone></Iphone>
                                    </el-icon> Android
                                </div>
                                <div class="flex items-center" v-else>
                                    <el-icon class="text-blue-500 mr-1">
                                        <Monitor></Monitor>
                                    </el-icon> Web
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column prop="submitTime" label="提交时间" min-width="160"></el-table-column>
                        <el-table-column label="等待时长" width="150">
                            <template #default="{ row }">
                                <el-tag :type="getWaitTimeType(row.submitTime)" effect="plain" size="small">
                                    {{ getWaitTime(row.submitTime) }}
                                </el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="状态" width="100">
                            <template #default="{ row }">
                                <el-tag v-if="row.status === 'pending'" type="warning" effect="light">待审核</el-tag>
                                <el-tag v-else-if="row.status === 'rejected'" type="danger" effect="light">已驳回</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="100" fixed="right">
                            <template #default="{ row }">
                                <el-button link type="primary" @click="openReviewDrawer(row)">
                                    审核
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>

                    
                    <div class="p-4 border-t border-gray-100 flex justify-end">
                        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                            :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                            :total="totalCount" background ></el-pagination>
                    </div>
                </div>
            </main>


            
            <el-drawer v-model="drawerVisible" size="760px" :show-close="false" custom-class="review-drawer">
                <template #header="{ close, titleId, titleClass }">
                    <div class="flex items-center justify-between w-full">
                        <div class="flex items-center gap-3">
                            <h4 class="text-lg font-bold text-gray-900">审核详情</h4>
                            <el-tag v-if="currentMember?.status === 'pending'" type="warning" effect="dark"
                                size="small">待审核</el-tag>
                            <el-tag v-else-if="currentMember?.status === 'rejected'" type="danger" effect="dark"
                                size="small">已驳回</el-tag>
                        </div>
                        <el-button link @click="close">
                            <el-icon class="text-xl text-gray-400 hover:text-gray-600">
                                <Close></Close>
                            </el-icon>
                        </el-button>
                    </div>
                </template>

                <div class="px-6 pt-4 pb-28 space-y-5" v-if="currentMember"
                    style="background:#f8f9fb; min-height:100%;">

                    
                    <div class="drawer-member-card rounded-xl p-4 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <el-avatar :size="48"
                                style="background:linear-gradient(135deg,#3b82f6,#6366f1); color:#fff; font-size:18px; font-weight:700;">
                                {{ currentMember.name?.charAt(0) }}
                            </el-avatar>
                            <div>
                                <div class="font-bold text-gray-900 text-base">{{ currentMember.name }}
                                    <el-tag size="small" effect="plain" class="ml-2" type="info">{{
                                        currentMember.id }}</el-tag>
                                </div>
                                <div class="text-sm text-gray-500 mt-1 flex items-center gap-3">
                                    <span class="flex items-center gap-1">
                                        <el-icon v-if="currentMember.channel === 'ios'" class="text-gray-500">
                                            <Iphone></Iphone>
                                        </el-icon>
                                        <el-icon v-else-if="currentMember.channel === 'android'" class="text-green-500">
                                            <Iphone></Iphone>
                                        </el-icon>
                                        <el-icon v-else class="text-blue-500">
                                            <Monitor></Monitor>
                                        </el-icon>
                                        {{ currentMember.channel === 'ios' ? 'iOS APP' :
                                        currentMember.channel === 'android' ? 'Android APP' : 'Web 官网' }}
                                    </span>
                                    <span class="text-gray-300">|</span>
                                    <span>提交于 {{ currentMember.submitTime }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-xs text-gray-400 mb-1">等待时长</div>
                            <div class="text-sm font-bold" :class="getWaitTimeColor(currentMember.submitTime)">
                                {{ getWaitTime(currentMember.submitTime) }}
                            </div>
                        </div>
                    </div>

                    
                    <div class="review-section rounded-xl p-5 relative">
                        <div class="flex items-center justify-between mb-5">
                            <div class="flex items-center gap-3">
                                <div class="drawer-step-badge bg-blue-50 text-blue-600">1</div>
                                <h5 class="font-bold text-gray-800 text-sm">基本资料</h5>
                            </div>
                            <div class="text-xs text-gray-400">提交审核时确认</div>
                        </div>

                        
                        <div class="drawer-section-divider mb-3">身份信息</div>
                        <div class="grid grid-cols-3 gap-3 mb-5">
                            <div class="drawer-info-item">
                                <dt>姓名</dt>
                                <dd>{{ currentMember.name }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>性别</dt>
                                <dd>{{ currentMember.gender === 'male' ? '男' : '女' }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>出生日期</dt>
                                <dd class="font-mono">{{ currentMember.dob }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>手机号</dt>
                                <dd class="font-mono">{{ currentMember.phone }}</dd>
                            </div>
                            <div class="drawer-info-item col-span-2">
                                <dt>电子邮箱</dt>
                                <dd class="font-mono">{{ currentMember.email }}</dd>
                            </div>
                        </div>

                        
                        <div class="drawer-section-divider mb-3">地址信息</div>
                        <div class="grid grid-cols-1 gap-3 mb-5">
                            <div class="drawer-info-item">
                                <dt>户籍地址</dt>
                                <dd>{{ currentMember.householdAddress }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>通讯地址</dt>
                                <dd>{{ currentMember.mailingAddress }}</dd>
                            </div>
                        </div>

                        
                        <div class="drawer-section-divider mb-3">紧急联络人</div>
                        <div class="grid grid-cols-3 gap-3">
                            <div class="drawer-info-item">
                                <dt>姓名</dt>
                                <dd>{{ currentMember.emergencyContact?.name }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>关系</dt>
                                <dd>{{ currentMember.emergencyContact?.relationship }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>联系电话</dt>
                                <dd class="font-mono">{{ currentMember.emergencyContact?.phone }}</dd>
                            </div>
                        </div>

                    </div>

                    
                    <div class="review-section rounded-xl p-5 relative">
                        <div class="flex items-center justify-between mb-5">
                            <div class="flex items-center gap-3">
                                <div class="drawer-step-badge bg-green-50 text-green-600">2</div>
                                <h5 class="font-bold text-gray-800 text-sm">身份证</h5>
                            </div>
                            <div class="text-xs text-gray-400">提交审核时确认</div>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="drawer-photo-card">
                                <div class="photo-label">身份证正面</div>
                                <el-image :src="currentMember.idCardFront"
                                    :preview-src-list="[currentMember.idCardFront]" fit="cover"
                                    class="w-full h-36 rounded-lg cursor-zoom-in"></el-image>
                            </div>
                            <div class="drawer-photo-card">
                                <div class="photo-label">身份证反面</div>
                                <el-image :src="currentMember.idCardBack" :preview-src-list="[currentMember.idCardBack]"
                                    fit="cover" class="w-full h-36 rounded-lg cursor-zoom-in"></el-image>
                            </div>
                        </div>
                    </div>

                    
                    <div class="review-section rounded-xl p-5 relative">
                        <div class="flex items-center justify-between mb-5">
                            <div class="flex items-center gap-3">
                                <div class="drawer-step-badge bg-amber-50 text-amber-600">3</div>
                                <h5 class="font-bold text-gray-800 text-sm">驾驶执照</h5>
                            </div>
                            <div class="text-xs text-gray-400">提交审核时确认</div>
                        </div>

                        
                        <div class="grid grid-cols-4 gap-3 mb-4">
                            <div class="drawer-info-item">
                                <dt>驾照类型</dt>
                                <dd>{{ currentMember.driverLicense?.type || '-' }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>签发地</dt>
                                <dd>{{ currentMember.driverLicense?.issuePlace || '-' }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>驾照号码</dt>
                                <dd class="font-mono">{{ currentMember.driverLicense?.number || '-' }}</dd>
                            </div>
                            <div class="drawer-info-item">
                                <dt>有效日期</dt>
                                <dd class="font-mono">{{ currentMember.driverLicense?.expiryDate || '-' }}</dd>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="drawer-photo-card">
                                <div class="photo-label">驾照正面</div>
                                <el-image :src="currentMember.dlFront" :preview-src-list="[currentMember.dlFront]"
                                    fit="cover" class="w-full h-36 rounded-lg cursor-zoom-in"></el-image>
                            </div>
                            <div class="drawer-photo-card">
                                <div class="photo-label">驾照反面</div>
                                <el-image :src="currentMember.dlBack" :preview-src-list="[currentMember.dlBack]"
                                    fit="cover" class="w-full h-36 rounded-lg cursor-zoom-in"></el-image>
                            </div>
                        </div>
                    </div>

                    
                    <div class="review-section rounded-xl p-5 relative">
                        <div class="flex items-center justify-between mb-5">
                            <div class="flex items-center gap-3">
                                <div class="drawer-step-badge bg-purple-50 text-purple-600">4</div>
                                <h5 class="font-bold text-gray-800 text-sm">手持证件自拍</h5>
                            </div>
                            <div class="text-xs text-gray-400">提交审核时确认</div>
                        </div>
                        <div class="flex justify-center">
                            <div class="drawer-photo-card" style="width: 280px;">
                                <div class="photo-label">手持身份证自拍</div>
                                <el-image :src="currentMember.selfie" :preview-src-list="[currentMember.selfie]"
                                    fit="cover" class="w-full h-52 rounded-lg cursor-zoom-in"></el-image>
                            </div>
                        </div>
                    </div>

                    
                    <div class="history-card">
                        <h5 class="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                            <el-icon class="text-gray-400">
                                <Clock></Clock>
                            </el-icon>
                            审核历史
                        </h5>
                        <el-timeline>
                            <el-timeline-item v-for="(activity, index) in currentMember.history" :key="index"
                                :type="activity.type" :color="activity.color" :timestamp="activity.time"
                                placement="top">
                                <div class="text-sm text-gray-700">{{ activity.content }}</div>
                            </el-timeline-item>
                        </el-timeline>
                    </div>

                </div>

                
                <div 
                    class="absolute bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-4 flex justify-between items-center z-50">
                    <div class="flex items-center gap-4">
                        <div class="text-sm text-gray-500">点击提交审核后，统一确认四项资料审核结果。</div>
                    </div>
                    <div class="flex gap-3">
                        <el-button @click="drawerVisible = false">关闭</el-button>
                        <el-button type="primary" @click="openSubmitReviewDialog('single')" :loading="submitting">
                            <el-icon class="mr-1" v-if="!submitting">
                                <Check></Check>
                            </el-icon>
                            提交审核
                        </el-button>
                    </div>
                </div>
            </el-drawer>

            
            <el-dialog v-model="submitReviewDialogVisible"
                :title="reviewSubmitMode === 'batch' ? '批量提交审核' : '提交审核'" width="760px">
                <div class="space-y-4">
                    <div class="rounded-xl border border-gray-200 p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <div class="text-sm font-bold text-gray-800">资料审核结果</div>
                                <div class="text-xs text-gray-500 mt-1">逐项确认通过或不通过；不通过时必须选择驳回原因。</div>
                            </div>
                            <el-tag v-if="reviewSubmitMode === 'batch'" type="warning" effect="plain">
                                已选 {{ selectedRows.length }} 名会员
                            </el-tag>
                        </div>
                        <div class="space-y-3">
                            <div v-for="item in reviewItems" :key="item.key"
                                class="flex items-center gap-3 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2">
                                <div class="w-28 text-sm font-semibold text-gray-700">{{ item.label }}</div>
                                <el-radio-group v-model="reviewSubmitForm[item.key].status" size="small">
                                    <el-radio-button label="approved">通过</el-radio-button>
                                    <el-radio-button label="rejected">不通过</el-radio-button>
                                </el-radio-group>
                                <el-select v-if="reviewSubmitForm[item.key].status === 'rejected'"
                                    v-model="reviewSubmitForm[item.key].reason" placeholder="选择驳回原因" size="small"
                                    class="flex-1">
                                    <el-option v-for="reason in rejectOptions[item.key]" :key="reason" :label="reason"
                                        :value="reason"></el-option>
                                </el-select>
                            </div>
                        </div>
                        <div v-if="submitRejectReasonText"
                            class="mt-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                            驳回内容：{{ submitRejectReasonText }}
                        </div>
                    </div>

                    <div class="rounded-xl border border-gray-200 p-4">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="text-sm font-bold text-gray-800">用户可用载具类型</div>
                                <div class="text-xs text-gray-500 mt-1">
                                    审核通过后写入会员资料；批量审核时同一选择会套用到本次选中的会员。
                                </div>
                            </div>
                            <el-checkbox-group v-model="selectedAvailableVehicleTypes"
                                class="flex flex-wrap justify-end gap-x-4 gap-y-1">
                                <el-checkbox v-for="item in vehicleTypeOptions" :key="item.value" :label="item.value">
                                    {{ item.label }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </div>
                        <div class="text-xs text-gray-500 mt-2">微电车默认不要求驾照；汽车、摩托车仍按现有驾照资料与审核结果判断。</div>
                    </div>

                    <el-alert :title="submitReviewSummary" type="info" show-icon :closable="false"></el-alert>
                </div>
                <template #footer>
                    <span class="dialog-footer">
                        <el-button @click="submitReviewDialogVisible = false">取消</el-button>
                        <el-button type="primary" :loading="submitting" @click="confirmSubmitReview">确认提交</el-button>
                    </span>
                </template>
            </el-dialog>

        </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import documentPlaceholder from '../../assets/demo/document-placeholder.svg';
import profilePlaceholder from '../../assets/demo/profile-placeholder.svg';

// State
                const drawerVisible = ref(false);
                const submitReviewDialogVisible = ref(false);
                const reviewSubmitMode = ref('single');
                const currentMember = ref(null);
                const submitting = ref(false);
                const selectedRows = ref([]);
                const selectedAvailableVehicleTypes = ref([]);

                const reviewItems = [
                    { key: 'basicInfo', label: '基本资料' },
                    { key: 'idCard', label: '身份证' },
                    { key: 'driverLicense', label: '驾驶执照' },
                    { key: 'selfie', label: '手持证件自拍' }
                ];

                const rejectOptions = {
                    basicInfo: ['信息填写不完整', '紧急联络人资料不完整', '手机号无法验证'],
                    idCard: ['照片模糊，请重新拍摄', '信息与证件不符', '证件已过期', '疑似伪造证件'],
                    driverLicense: ['照片模糊，请重新拍摄', '驾照已过期', '驾照类型不符', '疑似伪造驾照'],
                    selfie: ['照片模糊，请重新拍摄', '人脸与证件不符', '未手持证件', '未露脸', '非本人照片']
                };

                const reviewSubmitForm = reactive({
                    basicInfo: { status: 'approved', reason: '' },
                    idCard: { status: 'approved', reason: '' },
                    driverLicense: { status: 'approved', reason: '' },
                    selfie: { status: 'approved', reason: '' }
                });

                const vehicleTypeOptions = [
                    { value: 'car', label: '汽车' },
                    { value: 'motorcycle', label: '摩托车' },
                    { value: 'microElectric', label: '微电车' }
                ];

                const inferAvailableVehicleTypes = (driverLicense = {}) => {
                    const result = ['microElectric'];
                    if (driverLicense.type === 'LT01' || driverLicense.type === 'LT04') result.unshift('car');
                    if (driverLicense.type === 'LT02' || driverLicense.type === 'LT03') result.unshift('motorcycle');
                    return [...new Set(result)];
                };

                // Data Loading (Static Mock Data for Demo - Decoupled & Enhanced)
                const allMembers = ref([
                    {
                        id: 'M_Review_001', name: '王小敏', phone: '0988000111', email: 'xiaomin@example.com',
                        channel: 'ios', submitTime: '2026-02-10 13:00', status: 'pending', reviewStatus: 'pending',
                        gender: 'female', dob: '2000-01-01', idNumber: 'E223456789',
                        householdAddress: '台中市西屯区台湾大道三段99号', mailingAddress: '台中市西屯区',
                        emergencyContact: { name: '张伟', relationship: '朋友', phone: '0911-000-111' },
                        driverLicense: { type: 'LT01', issuePlace: '台中市', number: 'DL888999', expiryDate: '2032-01-01' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        idCardFront: documentPlaceholder,
                        idCardBack: documentPlaceholder,
                        dlFront: documentPlaceholder,
                        dlBack: documentPlaceholder,
                        selfie: profilePlaceholder,
                        history: [
                            { time: '2026-02-10 13:00', content: '提交申请', type: 'info' },
                            { time: '2026-02-10 13:01', content: '完成手机验证', type: 'success' },
                            { time: '2026-02-10 13:05', content: '系统初审通过', type: 'success' }
                        ]
                    },
                    {
                        id: 'M_Review_002', name: '陈志强', phone: '0988000222', email: 'zhiqiang@example.com',
                        channel: 'android', submitTime: '2026-02-10 14:30', status: 'pending', reviewStatus: 'pending',
                        gender: 'male', dob: '1995-05-05', idNumber: 'F123456789',
                        householdAddress: '高雄市左营区博爱二路777号', mailingAddress: '高雄市左营区',
                        emergencyContact: { name: '林美华', relationship: '配偶', phone: '0922-333-444' },
                        driverLicense: { type: 'LT01', issuePlace: '高雄市', number: 'DL777666', expiryDate: '2028-05-05' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        idCardFront: documentPlaceholder,
                        idCardBack: documentPlaceholder,
                        history: [
                            { time: '2026-02-10 14:30', content: '提交申请', type: 'info' },
                            { time: '2026-02-10 14:32', content: '完成实名认证', type: 'success' }
                        ]
                    },
                    {
                        id: 'M_Review_003', name: '林美玲', phone: '0988000333', email: 'meiling@example.com',
                        channel: 'web', submitTime: '2026-02-10 10:15', status: 'pending', reviewStatus: 'pending',
                        gender: 'female', dob: '1998-08-08', idNumber: 'G223456789',
                        householdAddress: '台北市信义区松仁路100号', mailingAddress: '台北市信义区',
                        emergencyContact: { name: '王大明', relationship: '父亲', phone: '0933-444-555' },
                        driverLicense: { type: 'LT01', issuePlace: '台北市', number: 'DL555444', expiryDate: '2030-08-08' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        idCardFront: documentPlaceholder,
                        history: [{ time: '2026-02-10 10:15', content: '提交申请', type: 'info' }]
                    },
                    {
                        id: 'M_Review_004', name: '黄大伟', phone: '0988000444', email: 'dawei@example.com',
                        channel: 'ios', submitTime: '2026-02-09 16:20', status: 'pending', reviewStatus: 'pending',
                        gender: 'male', dob: '1992-12-12', idNumber: 'H123456789',
                        householdAddress: '桃园市中坜区中正路1号', mailingAddress: '桃园市中坜区',
                        emergencyContact: { name: '李晓梅', relationship: '母亲', phone: '0944-555-666' },
                        driverLicense: { type: 'LT01', issuePlace: '桃园市', number: 'DL333222', expiryDate: '2029-12-12' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        idCardFront: documentPlaceholder,
                        history: [
                            { time: '2026-02-08 10:00', content: '提交申请', type: 'info' },
                            { time: '2026-02-09 09:30', content: '审核驳回: 照片不清晰', type: 'danger' },
                            { time: '2026-02-09 10:00', content: '用户重新提交资料', type: 'warning' }
                        ]
                    },
                    {
                        id: 'M_Review_005', name: '李驳回', phone: '0988000555', email: 'rejected@example.com',
                        channel: 'web', submitTime: '2026-02-09 09:00', status: 'rejected', reviewStatus: 'rejected',
                        gender: 'male', dob: '1990-03-03', idNumber: 'J123456789',
                        householdAddress: '新竹市东区光复路二段101号', mailingAddress: '新竹市东区',
                        emergencyContact: { name: '陈小红', relationship: '同事', phone: '0955-666-777' },
                        driverLicense: { type: 'LT01', issuePlace: '新竹市', number: 'DL111000', expiryDate: '2027-03-03' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        idCardFront: documentPlaceholder,
                        history: [
                            { time: '2026-02-09 09:00', content: '提交申请', type: 'info' },
                            { time: '2026-02-09 09:05', content: '系统初审通过', type: 'success' },
                            { time: '2026-02-10 09:00', content: '审核驳回: 证件模糊', type: 'danger' }
                        ]
                    },
                    {
                        id: 'M_Review_006', name: '张建国', phone: '0988000666', email: 'jianguo@example.com',
                        channel: 'android', submitTime: '2026-02-08 11:30', status: 'rejected', reviewStatus: 'rejected',
                        gender: 'male', dob: '1985-06-06', idNumber: 'K123456789',
                        householdAddress: '嘉义市西区中山路300号', mailingAddress: '嘉义市西区',
                        emergencyContact: { name: '刘美芳', relationship: '妻子', phone: '0966-777-888' },
                        driverLicense: { type: 'LT01', issuePlace: '嘉义市', number: 'DL999888', expiryDate: '2025-06-06' },
                        availableVehicleTypes: ['car', 'microElectric'],
                        idCardFront: documentPlaceholder,
                        history: [
                            { time: '2026-02-08 11:30', content: '提交申请', type: 'info' },
                            { time: '2026-02-09 14:00', content: '审核驳回: 身份证过期', type: 'danger' }
                        ]
                    }
                ]);

                // localStorage logic removed to decouple

                // Simplify Stats calculation based on allMembers
                // This is a rough approximation for demo
                const stats = reactive({
                    pending: computed(() => allMembers.value.filter(m => m.reviewStatus === 'pending').length),
                    todayNew: 2,
                    todayApproved: computed(() => allMembers.value.filter(m => m.reviewStatus === 'approved').length),
                    todayRejected: computed(() => allMembers.value.filter(m => m.reviewStatus === 'rejected').length)
                });

                const filters = reactive({
                    keyword: '',
                    status: 'pending',
                    channel: '',
                    dateRange: []
                });

                // Computed Review List
                const reviewList = computed(() => {
                    return allMembers.value.map(m => ({
                        ...m,
                        submitTime: m.createTime || '2024-05-10 10:00',
                        status: m.reviewStatus || 'approved', // Map reviewStatus to local status for compatibility
                        channel: m.channel || 'web',
                        idCardFront: m.idCardFront || documentPlaceholder,
                        idCardBack: m.idCardBack || documentPlaceholder,
                        dlFront: m.dlFront || documentPlaceholder,
                        dlBack: m.dlBack || documentPlaceholder,
                        selfie: m.selfie || profilePlaceholder,
                        history: m.history || []
                    }));
                });

                // Computed
                const filteredList = computed(() => {
                    return reviewList.value.filter(item => {
                        const matchStatus = !filters.status || item.status === filters.status;
                        const matchChannel = !filters.channel || item.channel === filters.channel;
                        const matchKeyword = !filters.keyword || item.name.includes(filters.keyword) || item.phone.includes(filters.keyword);
                        return matchStatus && matchChannel && matchKeyword;
                    });
                });

                const currentPage = ref(1);
                const pageSize = ref(10);
                const totalCount = computed(() => filteredList.value.length);

                const submitReviewSummary = computed(() => {
                    const rejectedItems = reviewItems.filter(item => reviewSubmitForm[item.key].status === 'rejected');
                    const targetText = reviewSubmitMode.value === 'batch'
                        ? `本次批量审核 ${selectedRows.value.length} 名会员`
                        : `本次审核 ${currentMember.value?.name || '当前会员'}`;
                    if (rejectedItems.length === 0) {
                        return `${targetText}，四项资料均通过，提交后写入用户可用载具类型。`;
                    }
                    const rejectedLabels = rejectedItems.map(item => item.label).join('、');
                    return `${targetText}，${rejectedLabels}不通过，提交后本次审核驳回。`;
                });

                const submitRejectReasonText = computed(() => {
                    return reviewItems
                        .filter(item => reviewSubmitForm[item.key].status === 'rejected' && reviewSubmitForm[item.key].reason)
                        .map(item => `${item.label}：${reviewSubmitForm[item.key].reason}`)
                        .join('；');
                });

                // Methods
                const getWaitTime = (time) => {
                    const diff = new Date() - new Date(time);
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours}小时 ${minutes}分`;
                };

                const getWaitTimeColor = (time) => {
                    const diff = new Date() - new Date(time);
                    const hours = diff / (1000 * 60 * 60);
                    if (hours < 4) return 'text-green-600';
                    if (hours < 12) return 'text-amber-500';
                    return 'text-red-500';
                };

                const getWaitTimeType = (time) => {
                    const diff = new Date() - new Date(time);
                    const hours = diff / (1000 * 60 * 60);
                    if (hours < 4) return 'success';
                    if (hours < 12) return 'warning';
                    return 'danger';
                };

                const openReviewDrawer = (row) => {
                    currentMember.value = row;
                    drawerVisible.value = true;
                };

                const saveToStorage = () => {
                    // console.log('Mock save disabled for decoupled mode');
                };

                const resetReviewSubmitForm = () => {
                    reviewItems.forEach(item => {
                        reviewSubmitForm[item.key].status = 'approved';
                        reviewSubmitForm[item.key].reason = '';
                    });
                };

                const openSubmitReviewDialog = (mode = 'single') => {
                    if (mode === 'single' && !currentMember.value) return;
                    if (mode === 'batch' && selectedRows.value.length === 0) {
                        ElMessage.warning('请选择需要审核的会员');
                        return;
                    }

                    reviewSubmitMode.value = mode;
                    resetReviewSubmitForm();

                    if (mode === 'single') {
                        selectedAvailableVehicleTypes.value = Array.isArray(currentMember.value.availableVehicleTypes)
                            ? [...currentMember.value.availableVehicleTypes]
                            : inferAvailableVehicleTypes(currentMember.value.driverLicense);
                    } else {
                        selectedAvailableVehicleTypes.value = [];
                    }

                    submitReviewDialogVisible.value = true;
                };

                const validateReviewSubmit = () => {
                    for (const item of reviewItems) {
                        const result = reviewSubmitForm[item.key];
                        if (!result.status) {
                            ElMessage.warning(`请选择${item.label}审核结果`);
                            return null;
                        }
                        if (result.status === 'rejected' && !result.reason) {
                            ElMessage.warning(`请选择${item.label}驳回原因`);
                            return null;
                        }
                    }

                    const rejectedItems = reviewItems.filter(item => reviewSubmitForm[item.key].status === 'rejected');
                    if (rejectedItems.length === 0 && selectedAvailableVehicleTypes.value.length === 0) {
                        ElMessage.warning('请至少选择一个用户可用载具类型');
                        return null;
                    }

                    const reasonText = rejectedItems
                        .map(item => `${item.label}：${reviewSubmitForm[item.key].reason}`)
                        .join('；');


                };

                const applyReviewResult = (target, reviewResult) => {
                    if (!target) return;
                    if (!target.history) target.history = [];

                    if (reviewResult.isRejected) {
                        target.reviewStatus = 'rejected';
                        target.status = 'active';
                        target.history.push({
                            time: new Date().toLocaleString(),
                            content: `审核驳回: ${reviewResult.reasonText}`,
                            type: 'danger',
                            color: '#f56c6c'
                        });
                    } else {
                        target.reviewStatus = 'approved';
                        target.status = 'active';
                        target.availableVehicleTypes = [...selectedAvailableVehicleTypes.value];
                        target.history.push({
                            time: new Date().toLocaleString(),
                            content: '审核通过: 会员已激活，并更新可用载具类型',
                            type: 'success',
                            color: '#67c23a'
                        });
                    }
                };

                const confirmSubmitReview = () => {
                    const reviewResult = validateReviewSubmit();
                    if (!reviewResult) return;

                    submitting.value = true;
                    setTimeout(() => {
                        const targets = reviewSubmitMode.value === 'batch'
                            ? allMembers.value.filter(member => selectedRows.value.some(row => row.id === member.id))
                            : allMembers.value.filter(member => member.id === currentMember.value.id);

                        targets.forEach(target => applyReviewResult(target, reviewResult));
                        saveToStorage();

                        if (reviewSubmitMode.value === 'batch') {
                            ElMessage[reviewResult.isRejected ? 'warning' : 'success'](`已批量提交 ${targets.length} 名会员审核`);
                            selectedRows.value = [];
                        } else {
                            ElMessage[reviewResult.isRejected ? 'warning' : 'success'](reviewResult.isRejected ? '已驳回该会员申请' : '会员审核已通过');
                            drawerVisible.value = false;
                        }

                        submitting.value = false;
                        submitReviewDialogVisible.value = false;
                    }, 1000);
                };

                const handleSelectionChange = (val) => {
                    selectedRows.value = val;
                };

                const handleBatchApprove = () => {
                    openSubmitReviewDialog('batch');
                };

                const resetFilters = () => {
                    filters.keyword = '';
                    filters.status = 'pending';
                    filters.channel = '';
                    filters.dateRange = [];
                };
</script>

<style scoped>
        .member-review-page {
            min-height: 100%;
        }

        .stat-card {
            transition: all 0.3s ease;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .review-section {
            border: 1px solid #e5e7eb;
            transition: all 0.25s ease;
            background: #fff;
        }

        .review-section:hover {
            border-color: #d1d5db;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .drawer-member-card {
            background: linear-gradient(135deg, #f0f7ff 0%, #f5f3ff 100%);
            border: 1px solid #e0e7ff;
        }

        .drawer-step-badge {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 700;
            flex-shrink: 0;
        }

        .drawer-info-item {
            padding: 8px 12px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #f3f4f6;
        }

        .drawer-info-item dt {
            font-size: 11px;
            color: #9ca3af;
            margin-bottom: 4px;
            font-weight: 500;
            letter-spacing: 0.02em;
        }

        .drawer-info-item dd {
            font-size: 13px;
            color: #1f2937;
            font-weight: 500;
        }

        .drawer-photo-card {
            background: #fafbfc;
            border: 1px dashed #e5e7eb;
            border-radius: 10px;
            padding: 10px;
            text-align: center;
            transition: all 0.2s;
        }

        .drawer-photo-card:hover {
            border-color: #93c5fd;
            background: #f0f7ff;
        }

        .drawer-photo-card .photo-label {
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
            margin-bottom: 6px;
        }

        .drawer-section-divider {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #9ca3af;
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .drawer-section-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: #e5e7eb;
        }

        .history-card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
        }
</style>
