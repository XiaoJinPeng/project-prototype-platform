<template>
            <main class="official-add-page">
                    <div class="official-back-row">
                        <el-button plain @click="goBack">
                            <el-icon class="mr-1">
                                <ArrowLeft></ArrowLeft>
                            </el-icon>
                            返回
                        </el-button>
                    </div>

                    <div class="official-grid">
                        <div class="official-top-cards">
                            <el-card shadow="never" class="!border-gray-200 !rounded-lg h-full flex flex-col" body-class="!p-0 flex-1">
                                <template #header>
                                    <div class="card-header">
                                        <el-icon>
                                            <User></User>
                                        </el-icon>
                                        员工资料
                                    </div>
                                </template>
                                <div class="card-body">
                                        <div class="member-select-row">
                                            <div>
                                                <div class="section-mini-label"><span class="official-required">*</span> <strong>用车员工</strong></div>
                                                <div class="text-[11px] leading-4 text-gray-400">选择员工后自动带出联络方式和组织归属。</div>
                                            </div>
                                            <el-button type="primary" @click="memberVisible = true">选择员工</el-button>
                                        </div>

                                    <div v-if="memberInfo.name" class="member-preview">
                                        <div class="flex min-w-0 gap-3">
                                            <div class="member-avatar">{{ memberInitial }}</div>
                                            <div class="min-w-0">
                                                <div class="member-preview-name">{{ memberInfo.name }}</div>
                                                <div class="member-preview-meta">{{ memberInfo.employeeNo }} · {{ memberInfo.phone }}</div>
                                                <div class="member-preview-meta">{{ memberInfo.branch }} / {{ memberInfo.department }}</div>
                                            </div>
                                        </div>
                                        <el-tag type="info" effect="plain" round>{{ memberInfo.supervisor }}</el-tag>
                                    </div>
                                    <div v-else class="member-empty">
                                        请先选择用车员工。
                                    </div>
                                </div>
                            </el-card>

                            <el-card shadow="never" class="!border-gray-200 !rounded-lg h-full flex flex-col" body-class="!p-0 flex-1">
                                <template #header>
                                    <div class="card-header">
                                        <el-icon>
                                            <Calendar></Calendar>
                                        </el-icon>
                                        用车资料
                                    </div>
                                </template>
                                    <div class="card-body">
                                        <div class="official-form-grid">
                                            <div class="form-field">
                                                <div class="section-mini-label"><span class="official-required">*</span> <strong>取车据点</strong></div>
                                                <el-select v-model="postForm.pickupSiteId" filterable placeholder="选择取车据点" class="w-full" @change="handlePickupSiteChange">
                                                    <el-option v-for="site in siteOptions" :key="site.value" :label="site.label" :value="site.value"></el-option>
                                            </el-select>
                                        </div>
                                        <div class="form-field">
                                            <div class="section-mini-label"><span class="official-required">*</span> <strong>还车据点</strong></div>
                                            <el-select v-model="postForm.returnStationId" disabled placeholder="自动回显" class="w-full">
                                                <el-option v-for="site in siteOptions" :key="site.value" :label="site.label" :value="site.value"></el-option>
                                            </el-select>
                                        </div>
                                        <div class="form-field">
                                            <div class="section-mini-label"><span class="official-required">*</span> <strong>预定车款</strong></div>
                                            <el-select v-model="postForm.carModelId" filterable placeholder="选择预定车款" class="w-full" @change="handleModelChange">
                                                <el-option v-for="model in modelOptions" :key="model.value" :label="model.label" :value="model.value"></el-option>
                                            </el-select>
                                        </div>
                                        <div class="form-field">
                                            <div class="section-mini-label"><span class="official-required">*</span> <strong>车牌号</strong></div>
                                            <el-select v-model="postForm.vehicleId" filterable placeholder="选择车牌号" class="w-full" @change="handleVehicleChange">
                                                <el-option v-for="vehicle in filteredVehicleOptions" :key="vehicle.value" :label="vehicle.label" :value="vehicle.value" :disabled="vehicle.status !== '可预约'">
                                                    <div class="flex justify-between items-center gap-3">
                                                        <span>{{ vehicle.label }}</span>
                                                        <span class="text-xs" :class="vehicle.status === '可预约' ? 'text-green-600' : 'text-amber-600'">{{ vehicle.status }}</span>
                                                    </div>
                                                </el-option>
                                            </el-select>
                                        </div>
                                        <div class="form-field">
                                            <div class="section-mini-label"><span class="official-required">*</span> <strong>预定日期(起)</strong></div>
                                            <el-date-picker v-model="postForm.pickupTime" type="datetime" placeholder="选择取车时间" format="YYYY/MM/DD HH:mm" value-format="YYYY/MM/DD HH:mm:ss" class="w-full" @change="handlePickupTimeChange"></el-date-picker>
                                        </div>
                                            <div class="form-field">
                                                <div class="section-mini-label"><span class="official-required">*</span> <strong>预定日期(止)</strong></div>
                                                <el-date-picker v-model="postForm.returnTime" type="datetime" placeholder="选择还车时间" format="YYYY/MM/DD HH:mm" value-format="YYYY/MM/DD HH:mm:ss" class="w-full"></el-date-picker>
                                            </div>
                                            <div class="form-field">
                                                <div class="section-mini-label"><strong>同行人数</strong></div>
                                                <el-input-number v-model="postForm.passengerCount" :min="1" :max="8" class="w-full"></el-input-number>
                                            </div>
                                            <div class="form-field">
                                                <div class="section-mini-label"><span class="official-required">*</span> <strong>目的地</strong></div>
                                                <el-input v-model="postForm.destination" placeholder="例如：台北客户办公室 / 桃园厂区"></el-input>
                                            </div>
                                            <div class="form-field span-2">
                                                <div class="section-mini-label"><span class="official-required">*</span> <strong>用车事由</strong></div>
                                                <el-input v-model="postForm.purpose" type="textarea" :rows="3" maxlength="80" show-word-limit placeholder="例如：外部拜访、跨厂区会议、接待用车"></el-input>
                                            </div>
                                        </div>

                                        <div class="lease-banner">
                                        预计租期：<span class="font-bold">{{ leaseTermResult || '自动回显' }}</span>。提交后会依企业审批设定决定是否进入主管或管理员审核。
                                        </div>
                                    </div>
                                </el-card>
                        </div>

                        <div class="action-buttons">
                            <el-button size="large" @click="goBack">返回</el-button>
                            <el-button type="primary" size="large" @click="submitOrder">建立公务车订单</el-button>
                        </div>
                    </div>
            </main>

        <el-dialog v-model="memberVisible" title="选择员工" width="640px" destroy-on-close>
            <div class="employee-dialog-note">可先筛选分公司、部门，再搜索具体员工。</div>
            <div class="employee-filter-bar">
                <el-select v-model="employeeFilterBranch" clearable placeholder="全部分公司">
                    <el-option v-for="branch in branchOptions" :key="branch" :label="branch" :value="branch"></el-option>
                </el-select>
                <el-select v-model="employeeFilterDepartment" clearable placeholder="全部部门">
                    <el-option v-for="department in departmentOptions" :key="department" :label="department" :value="department"></el-option>
                </el-select>
                <el-input v-model="memberKeyword" :prefix-icon="Search" clearable placeholder="搜索姓名 / 员工编号 / 手机号 / Email"></el-input>
            </div>
            <el-table :data="filteredMembers" border height="360" class="w-full">
                <el-table-column prop="employeeNo" label="员工编号" width="120"></el-table-column>
                <el-table-column prop="name" label="姓名" width="120"></el-table-column>
                <el-table-column prop="branch" label="分公司" width="140"></el-table-column>
                <el-table-column prop="department" label="部门" width="140"></el-table-column>
                <el-table-column prop="phone" label="手机号码" min-width="140"></el-table-column>
                <el-table-column prop="email" label="Email" min-width="180"></el-table-column>
                <el-table-column label="操作" width="90" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="selectMember(row)">选择</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog v-model="orderSuccessVisible" title="公务车订单已建立" width="520px" center destroy-on-close>
            <div class="space-y-4">
                <div class="text-center">
                    <div class="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                        <el-icon class="text-3xl"><CircleCheck></CircleCheck></el-icon>
                    </div>
                    <div class="font-bold text-gray-900 text-lg">{{ createdOrder.orderNo }}</div>
                    <div class="text-xs text-gray-500 mt-1">订单已写入公务车订单列表，并保留用车人、合约、车辆、据点与预定时间快照。</div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div class="text-xs text-gray-400 mb-1">订单状态</div>
                        <div class="font-bold text-gray-800">{{ createdOrder.statusText }}</div>
                    </div>
                    <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div class="text-xs text-gray-400 mb-1">审核状态</div>
                        <div class="font-bold text-gray-800">{{ createdOrder.approvalText }}</div>
                    </div>
                    <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div class="text-xs text-gray-400 mb-1">车辆</div>
                        <div class="font-bold text-gray-800">{{ createdOrder.vehicle }}</div>
                    </div>
                    <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                        <div class="text-xs text-gray-400 mb-1">租期</div>
                        <div class="font-bold text-gray-800">{{ createdOrder.leaseTerm }}</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex gap-3">
                    <el-button class="flex-1" @click="orderSuccessVisible = false">继续建立</el-button>
                    <el-button type="primary" class="flex-1" @click="goBack">返回订单列表</el-button>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>

import { ref, reactive, computed } from "vue";
import { useRouter } from 'vue-router';
import { ElMessage } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const memberVisible = ref(false);
const router = useRouter();
                const memberKeyword = ref('');
                const employeeFilterBranch = ref('');
                const employeeFilterDepartment = ref('');
                const memberInfo = reactive({
                    userId: null,
                    employeeNo: '',
                    name: '',
                    email: '',
                    phone: '',
                    branch: '',
                    department: '',
                    supervisor: ''
                });
                const postForm = reactive({
                    userId: null,
                    accountType: 1,
                    pickupSiteId: '',
                    returnStationId: '',
                    carModelId: '',
                    vehicleId: '',
                    pickupTime: '',
                    returnTime: '',
                    vehicleTypeId: '',
                    carModel: '',
                    passengerCount: 1,
                    destination: '',
                    purpose: ''
                });

                const members = [
                    { userId: 1, employeeNo: 'EMP-TPE-001', name: '王怡君', email: 'yijun.wang@rimo.demo', phone: '0912-345-678', branch: '台北分公司', department: '业务部', supervisor: '陈经理' },
                    { userId: 2, employeeNo: 'EMP-TXG-014', name: '陈建宏', email: 'jason.chen@rimo.demo', phone: '0988-120-776', branch: '台中分公司', department: '行政管理部', supervisor: '林处长' },
                    { userId: 3, employeeNo: 'EMP-KHH-023', name: '林雅婷', email: 'yating.lin@rimo.demo', phone: '0922-886-301', branch: '高雄分公司', department: '财务部', supervisor: '王主任' }
                ];

                const siteOptions = [
                    { label: '八轮测试-宝龙用车点', value: 'baolong' },
                    { label: '八轮测试-启迪用车点', value: 'qidi' },
                    { label: '八轮测试-人工智能用车点', value: 'ai' }
                ];

                const modelOptions = [
                    { label: 'Toyota Corolla Cross', value: 'cross', brandId: 'toyota', vehicleTypeId: 'suv' },
                    { label: 'Lexus ES 250', value: 'es250', brandId: 'lexus', vehicleTypeId: 'sedan' },
                    { label: 'Toyota Camry', value: 'camry', brandId: 'toyota', vehicleTypeId: 'sedan' }
                ];

                const vehicleOptions = [
                    { label: 'XLY-8008', value: 'car-8008', modelId: 'cross', vehicleTypeId: 'suv', siteId: 'baolong', status: '可预约' },
                    { label: 'XLY-8001', value: 'car-8001', modelId: 'es250', vehicleTypeId: 'sedan', siteId: 'baolong', status: '可预约' },
                    { label: 'XLY-8004', value: 'car-8004', modelId: 'camry', vehicleTypeId: 'sedan', siteId: 'qidi', status: '可预约' },
                    { label: 'XLY-8010', value: 'car-8010', modelId: 'cross', vehicleTypeId: 'suv', siteId: 'ai', status: '预约中' }
                ];

                const orderSuccessVisible = ref(false);
                const createdOrder = reactive({
                    orderNo: '',
                    statusText: '',
                    approvalText: '',
                    vehicle: '',
                    leaseTerm: ''
                });

                const branchOptions = computed(() => {
                    return [...new Set(members.map((item) => item.branch))];
                });

                const departmentOptions = computed(() => {
                    const scopedMembers = employeeFilterBranch.value
                        ? members.filter((item) => item.branch === employeeFilterBranch.value)
                        : members;
                    return [...new Set(scopedMembers.map((item) => item.department))];
                });

                const filteredMembers = computed(() => {
                    const keyword = memberKeyword.value.trim().toLowerCase();
                    return members.filter((item) => {
                        if (employeeFilterBranch.value && item.branch !== employeeFilterBranch.value) return false;
                        if (employeeFilterDepartment.value && item.department !== employeeFilterDepartment.value) return false;
                        if (!keyword) return true;
                        return [item.name, item.email, item.phone, item.branch, item.department, item.employeeNo].some((value) => value.toLowerCase().includes(keyword));
                    });
                });

                const filteredVehicleOptions = computed(() => {
                    return vehicleOptions.filter((item) => {
                        if (postForm.pickupSiteId && item.siteId !== postForm.pickupSiteId) return false;
                        if (postForm.carModelId && item.modelId !== postForm.carModelId) return false;
                        return true;
                    });
                });

                const selectedVehicleLabel = computed(() => {
                    return vehicleOptions.find((item) => item.value === postForm.vehicleId)?.label || '';
                });

                const memberInitial = computed(() => {
                    return memberInfo.name ? memberInfo.name.slice(0, 1) : '员';
                });

                const leaseTermResult = computed(() => {
                    if (!postForm.pickupTime || !postForm.returnTime) return '';
                    const start = new Date(postForm.pickupTime.replaceAll('/', '-'));
                    const end = new Date(postForm.returnTime.replaceAll('/', '-'));
                    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return '';
                    const minutes = Math.floor((end - start) / 60000);
                    const days = Math.floor(minutes / 1440);
                    const hours = Math.floor((minutes % 1440) / 60);
                    const mins = minutes % 60;
                    return `${days} d ${hours} h ${mins} min`;
                });

                const requiredChecklist = computed(() => [
                    { label: '用车人', done: Boolean(postForm.userId) },
                    { label: '取车据点', done: Boolean(postForm.pickupSiteId) },
                    { label: '还车据点', done: Boolean(postForm.returnStationId) },
                    { label: '预定车款', done: Boolean(postForm.carModelId) },
                    { label: '车牌号', done: Boolean(postForm.vehicleId) },
                    { label: '预定日期(起)', done: Boolean(postForm.pickupTime) },
                    { label: '预定日期(止)', done: Boolean(postForm.returnTime) },
                    { label: '目的地', done: Boolean(postForm.destination.trim()) },
                    { label: '用车事由', done: Boolean(postForm.purpose.trim()) }
                ]);

                const selectMember = (member) => {
                    Object.assign(memberInfo, member);
                    postForm.userId = member.userId;
                    postForm.pickupSiteId = '';
                    postForm.returnStationId = '';
                    postForm.carModelId = '';
                    postForm.vehicleId = '';
                    postForm.carModel = '';
                    postForm.destination = '';
                    postForm.purpose = '';
                    memberVisible.value = false;
                };

                const handlePickupSiteChange = (value) => {
                    postForm.returnStationId = value;
                    postForm.carModelId = '';
                    postForm.vehicleId = '';
                    postForm.carModel = '';
                };

                const handleModelChange = (value) => {
                    const selected = modelOptions.find((item) => item.value === value);
                    postForm.vehicleId = '';
                    postForm.vehicleTypeId = selected?.vehicleTypeId || '';
                    postForm.carModel = selected?.label || '';
                };

                const handleVehicleChange = (value) => {
                    const selected = vehicleOptions.find((item) => item.value === value);
                    postForm.vehicleTypeId = selected?.vehicleTypeId || postForm.vehicleTypeId;
                };

                const handlePickupTimeChange = () => {
                    postForm.returnTime = '';
                };

                const goBack = () => {
                    router.push('/enterprise/official-order');
                };

                const submitOrder = () => {
                    const missing = requiredChecklist.value.filter((item) => !item.done).map((item) => item.label);
                    if (missing.length) {
                        ElMessage.warning(`请先完成：${missing.join('、')}`);
                        return;
                    }
                    const start = new Date(postForm.pickupTime.replaceAll('/', '-'));
                    const end = new Date(postForm.returnTime.replaceAll('/', '-'));
                    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
                        ElMessage.warning('预定日期(止)必须晚于预定日期(起)');
                        return;
                    }
                    const selectedVehicle = vehicleOptions.find((item) => item.value === postForm.vehicleId);
                    if (selectedVehicle?.status !== '可预约') {
                        ElMessage.warning('当前车辆不可预约，请重新选择车牌号');
                        return;
                    }
                    Object.assign(createdOrder, {
                        orderNo: `OC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`,
                        statusText: '已预约',
                        approvalText: '按企业设定判断',
                        vehicle: selectedVehicleLabel.value,
                        leaseTerm: leaseTermResult.value
                    });
                    orderSuccessVisible.value = true;
                };

</script>

<style scoped>
.card-body {
  padding: 16px;
}


        .official-add-page {
            min-height: 100%;
            background: transparent;
        }

        .official-back-row {
            margin-bottom: 16px;
        }

        .official-grid {
            display: block;
        }

        .official-top-cards {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
        }

        .official-add-page :deep(.el-card__header) {
            padding: 0 !important;
            border-bottom: none !important;
        }

        .card-header {
            display: flex;
            align-items: center;
            gap: 8px;
            height: 45px;
            padding: 0 16px;
            background: rgb(249 250 251 / 80%);
            border-bottom: 1px solid #f1f5f9;
            color: #1f2937;
            font-size: 16px;
            font-weight: 700;
        }

        .card-header .el-icon {
            color: #4f46e5;
            font-size: 18px;
        }

        .section-mini-label {
            margin-bottom: 6px;
            color: #6b7280;
            font-size: 12px;
            line-height: 16px;
        }

        .section-mini-label strong {
            color: #374151;
            font-weight: 700;
        }

        .official-required {
            color: #ef4444;
            font-weight: 700;
        }

        .member-select-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 10px;
        }

        .member-preview {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 10px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #f9fafb;
            min-height: 64px;
        }

        .member-avatar {
            width: 40px;
            height: 40px;
            border-radius: 999px;
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            color: #2563eb;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 15px;
            font-weight: 700;
            flex: 0 0 auto;
        }

        .member-preview-name {
            color: #111827;
            font-size: 14px;
            font-weight: 700;
            line-height: 20px;
        }

        .member-preview-meta {
            margin-top: 2px;
            color: #6b7280;
            font-size: 11px;
            line-height: 16px;
        }

        .member-empty {
            min-height: 64px;
            border: 1px dashed #d1d5db;
            border-radius: 10px;
            background: #f9fafb;
            color: #9ca3af;
            font-size: 11px;
            line-height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 12px;
        }

        .is-placeholder {
            color: #9ca3af;
            font-weight: 500;
        }

        .official-form-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
        }

        .form-field {
            min-width: 0;
        }

        .form-field.span-2 {
            grid-column: span 2;
        }

        .official-add-page :deep(.el-input__wrapper),
        .official-add-page :deep(.el-select__wrapper),
        .official-add-page :deep(.el-textarea__inner) {
            min-height: 40px;
            border-radius: 10px;
            box-shadow: 0 0 0 1px #dbe1ea inset;
            font-size: 13px;
        }

        .official-add-page :deep(.el-date-editor.el-input),
        .official-add-page :deep(.el-date-editor.el-input__wrapper) {
            width: 100%;
        }

        .official-add-page :deep(.el-input-number) {
            width: 100%;
        }

        .lease-banner {
            margin-top: 12px;
            padding: 10px 12px;
            border: 1px solid #e0e7ff;
            border-radius: 10px;
            background: #eef2ff;
            color: #4338ca;
            font-size: 12px;
            line-height: 18px;
        }

        .action-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 20px;
        }

        .inline-note {
            margin-top: 14px;
            padding: 10px 12px;
            border: 1px solid #dbeafe;
            border-radius: 10px;
            background: #f8fbff;
            color: #4b5563;
            font-size: 12px;
            line-height: 18px;
        }

        .member-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 12px 0;
            border-bottom: 1px solid #f3f4f6;
        }

        .member-option:last-child {
            border-bottom: none;
        }

        .member-name {
            color: #111827;
            font-size: 14px;
            font-weight: 700;
            line-height: 20px;
        }

        .member-meta {
            margin-top: 2px;
            color: #6b7280;
            font-size: 12px;
            line-height: 18px;
        }

        .employee-filter-bar {
            display: grid;
            grid-template-columns: 180px 180px minmax(0, 1fr);
            gap: 12px;
            margin-bottom: 14px;
        }

        .employee-dialog-note {
            margin-bottom: 12px;
            color: #6b7280;
            font-size: 12px;
            line-height: 18px;
        }

        @media (max-width: 980px) {
            .official-top-cards,
            .official-form-grid {
                grid-template-columns: 1fr;
            }

            .form-field.span-2 {
                grid-column: span 1;
            }

            .member-select-row {
                align-items: stretch;
                flex-direction: column;
            }

            .action-buttons {
                flex-direction: column;
            }

            .employee-filter-bar {
                grid-template-columns: 1fr;
            }
        }

</style>
