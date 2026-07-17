<template>
<div class="membership-plans-page">
            
            

            
            <main>
                
                <PageHeader unstyled class="flex justify-between items-end mb-6" title="客户等级方案" description="管理会员等级方案，设置付费/免费模式及会员权益配置。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                    <template #actions>
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20" @click="openDialog()">
                            <el-icon class="mr-1"><Plus></Plus></el-icon> 新增方案
                        </el-button>
                    </template>
                </PageHeader><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <div v-for="plan in sortedPlans" :key="plan.id"
                        class="plan-card border-2 rounded-2xl p-6 bg-white flex flex-col relative"
                        :class="{ 'is-recommended': plan.isRecommended, 'border-gray-200': !plan.isRecommended }">

                        
                        <div v-if="plan.isRecommended"
                            class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs px-4 py-1 rounded-full font-bold shadow-md">
                            ⭐ 推荐
                        </div>

                        
                        <div v-if="plan.isDefault"
                            class="absolute -top-3 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-md">
                            默认
                        </div>

                        
                        <div class="flex justify-between items-start mb-4">
                            <div class="tier-badge text-xs px-2 py-1 rounded-full">
                                Lv.{{ plan.tier }}
                            </div>
                            <el-tag v-if="!plan.showInApp" size="small" type="info" effect="plain">
                                APP隐藏
                            </el-tag>
                        </div>

                        
                        <h3 class="text-xl font-bold text-gray-800 mb-2">{{ plan.name }}</h3>

                        
                        <div class="mb-4">
                            <div v-if="plan.type === 'free'" class="text-2xl font-bold text-green-600">
                                免费
                            </div>
                            <div v-else>
                                <div class="text-2xl font-bold text-theme-primary">
                                    ¥{{ getLowestPrice(plan) }}<span class="text-sm font-normal text-gray-500">/{{
                                        getLowestPriceCycle(plan) }}</span>
                                </div>
                                <div class="text-xs text-gray-400 mt-1">
                                    {{ getEnabledCyclesText(plan) }}
                                </div>
                            </div>
                        </div>

                        
                        <div class="flex-1 mb-4">
                            <div class="text-xs text-gray-500 font-bold mb-2 uppercase">权益</div>
                            <ul class="space-y-1.5">
                                <li v-for="(benefit, idx) in plan.benefits.slice(0, 4)" :key="idx"
                                    class="flex items-center text-sm text-gray-600">
                                    <el-icon class="mr-2 text-green-500">
                                        <Check></Check>
                                    </el-icon>
                                    {{ benefit }}
                                </li>
                                <li v-if="plan.benefits.length > 4" class="text-xs text-gray-400">
                                    + {{ plan.benefits.length - 4 }} 项更多权益...
                                </li>
                            </ul>
                        </div>

                        
                        <div class="text-center py-3 bg-gray-50 rounded-lg mb-4">
                            <div class="text-2xl font-bold text-gray-800">{{ formatNumber(plan.memberCount) }}</div>
                            <div class="text-xs text-gray-500">当前会员数</div>
                        </div>

                        
                        <div class="flex gap-2 border-t border-gray-100 pt-4">
                            <el-button class="flex-1" type="primary" plain size="small"
                                @click="openEdit(plan)">编辑</el-button>
                            <el-button type="danger" plain size="small" icon="Delete" circle
                                :disabled="plan.memberCount > 0" @click="deletePlan(plan)"></el-button>
                        </div>
                    </div>

                    
                    <div v-if="plans.length === 0"
                        class="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
                        <el-icon class="text-5xl mb-3 opacity-20">
                            <Medal></Medal>
                        </el-icon>
                        <p>暂无会员方案，点击右上角新增</p>
                    </div>
                </div>
            </main>
        </div>

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑会员方案' : '新增会员方案'" width="700px">
            <el-form :model="currentPlan" label-position="top">
                <div class="grid grid-cols-2 gap-6">
                    
                    <el-form-item label="方案名称" required>
                        <el-input v-model="currentPlan.name" placeholder="例如: 金牌会员"></el-input>
                    </el-form-item>
                    <el-form-item label="等级层级" required>
                        <el-input-number v-model="currentPlan.tier" :min="1" :max="10" class="w-full"></el-input-number>
                        <div class="text-xs text-gray-400 mt-1">数字越大等级越高，用于排序</div>
                    </el-form-item>

                    
                    <el-form-item label="收费类型" class="col-span-2">
                        <el-radio-group v-model="currentPlan.type">
                            <el-radio-button value="free">免费方案</el-radio-button>
                            <el-radio-button value="paid">付费方案</el-radio-button>
                        </el-radio-group>
                    </el-form-item>

                    
                    <div v-if="currentPlan.type === 'paid'"
                        class="col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div class="font-bold text-gray-800 mb-4 flex items-center">
                            <el-icon class="mr-2 text-blue-600">
                                <Money></Money>
                            </el-icon>
                            缴费周期与价格
                        </div>
                        <div class="text-xs text-gray-500 mb-4">勾选启用的缴费周期，并设置对应价格</div>
                        <div class="grid grid-cols-2 gap-4">
                            <div v-for="cycle in pricingCycles" :key="cycle.key"
                                class="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                                <el-checkbox v-model="currentPlan.pricing[cycle.key + 'Enabled']">
                                    {{ cycle.label }}
                                </el-checkbox>
                                <el-input-number v-model="currentPlan.pricing[cycle.key]" :min="0" :step="10"
                                    :disabled="!currentPlan.pricing[cycle.key + 'Enabled']" size="small"
                                    class="flex-1"></el-input-number>
                                <span class="text-xs text-gray-400">元</span>
                            </div>
                        </div>
                    </div>

                    
                    <div class="col-span-2">
                        <el-form-item label="会员权益">
                            <div class="w-full">
                                <div class="flex gap-2 mb-3">
                                    <el-input v-model="newBenefit" placeholder="输入权益内容"
                                        @keyup.enter="addBenefit"></el-input>
                                    <el-button type="primary" @click="addBenefit">添加</el-button>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    <el-tag v-for="(benefit, idx) in currentPlan.benefits" :key="idx" closable
                                        @close="removeBenefit(idx)" size="large">
                                        {{ benefit }}
                                    </el-tag>
                                    <div v-if="currentPlan.benefits.length === 0" class="text-gray-400 text-sm">
                                        暂无权益，请添加
                                    </div>
                                </div>
                            </div>
                        </el-form-item>
                    </div>

                    
                    <el-form-item label="设为注册默认方案">
                        <el-switch v-model="currentPlan.isDefault"></el-switch>
                        <span class="text-xs text-gray-500 ml-2">新用户注册后自动成为该方案会员</span>
                    </el-form-item>
                    <el-form-item label="设为推荐方案">
                        <el-switch v-model="currentPlan.isRecommended"></el-switch>
                        <span class="text-xs text-gray-500 ml-2">在APP首页突出显示</span>
                    </el-form-item>
                    <el-form-item label="APP显示" class="col-span-2">
                        <el-switch v-model="currentPlan.showInApp"></el-switch>
                        <span class="text-xs text-gray-500 ml-2">关闭后该方案不会在APP中展示给用户</span>
                    </el-form-item>
                </div>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="savePlan">保存</el-button>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { PageHeader } from '@/components/ui';

// --- Mock Data ---
                const plans = ref([
                    {
                        id: 'MP001',
                        name: '普通会员',
                        tier: 1,
                        type: 'free',
                        isDefault: true,
                        isRecommended: false,
                        showInApp: true,
                        pricing: { monthly: 0, quarterly: 0, semiAnnual: 0, annual: 0, monthlyEnabled: false, quarterlyEnabled: false, semiAnnualEnabled: false, annualEnabled: false },
                        benefits: ['基础租车服务', '积分1倍累积'],
                        memberCount: 12580,
                        status: 'active'
                    },
                    {
                        id: 'MP002',
                        name: '银牌会员',
                        tier: 2,
                        type: 'paid',
                        isDefault: false,
                        isRecommended: false,
                        showInApp: true,
                        pricing: { monthly: 99, quarterly: 269, semiAnnual: 0, annual: 899, monthlyEnabled: true, quarterlyEnabled: true, semiAnnualEnabled: false, annualEnabled: true },
                        benefits: ['积分1.5倍累积', '专属客服', '生日特权'],
                        memberCount: 3200,
                        status: 'active'
                    },
                    {
                        id: 'MP003',
                        name: '金牌会员',
                        tier: 3,
                        type: 'paid',
                        isDefault: false,
                        isRecommended: true,
                        showInApp: true,
                        pricing: { monthly: 199, quarterly: 539, semiAnnual: 999, annual: 1799, monthlyEnabled: true, quarterlyEnabled: true, semiAnnualEnabled: true, annualEnabled: true },
                        benefits: ['积分2倍累积', '免费升级车型', '专属客服', 'VIP休息室', '生日双倍积分'],
                        memberCount: 1520,
                        status: 'active'
                    },
                    {
                        id: 'MP004',
                        name: '钻石会员',
                        tier: 4,
                        type: 'paid',
                        isDefault: false,
                        isRecommended: false,
                        showInApp: false,
                        pricing: { monthly: 399, quarterly: 0, semiAnnual: 0, annual: 3599, monthlyEnabled: true, quarterlyEnabled: false, semiAnnualEnabled: false, annualEnabled: true },
                        benefits: ['积分3倍累积', '优先预订', '机场接送', '专属车辆', 'VIP通道', '24小时管家服务'],
                        memberCount: 280,
                        status: 'active'
                    }
                ]);

                // Pricing cycle definitions
                const pricingCycles = [
                    { key: 'monthly', label: '月缴' },
                    { key: 'quarterly', label: '季缴' },
                    { key: 'semiAnnual', label: '半年缴' },
                    { key: 'annual', label: '年缴' }
                ];

                // --- State ---
                const dialogVisible = ref(false);
                const isEdit = ref(false);
                const newBenefit = ref('');

                // Form State
                const currentPlan = reactive({
                    id: '',
                    name: '',
                    tier: 1,
                    type: 'free',
                    isDefault: false,
                    isRecommended: false,
                    showInApp: true,
                    pricing: { monthly: 0, quarterly: 0, semiAnnual: 0, annual: 0, monthlyEnabled: false, quarterlyEnabled: false, semiAnnualEnabled: false, annualEnabled: false },
                    benefits: [],
                    memberCount: 0,
                    status: 'active'
                });

                // --- Computed ---
                // Auto-sort by tier (ascending)
                const sortedPlans = computed(() => {
                    return [...plans.value].sort((a, b) => a.tier - b.tier);
                });

                // --- Helpers ---
                const formatNumber = (num) => {
                    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
                    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
                    return num.toString();
                };

                const getLowestPrice = (plan) => {
                    const enabled = pricingCycles.filter(c => plan.pricing[c.key + 'Enabled'] && plan.pricing[c.key] > 0);
                    if (enabled.length === 0) return 0;
                    return Math.min(...enabled.map(c => plan.pricing[c.key]));
                };

                const getLowestPriceCycle = (plan) => {
                    const enabled = pricingCycles.filter(c => plan.pricing[c.key + 'Enabled'] && plan.pricing[c.key] > 0);
                    if (enabled.length === 0) return '月';
                    const lowest = enabled.reduce((a, b) => plan.pricing[a.key] < plan.pricing[b.key] ? a : b);
                    return lowest.label.replace('缴', '');
                };

                const getEnabledCyclesText = (plan) => {
                    const enabled = pricingCycles.filter(c => plan.pricing[c.key + 'Enabled'] && plan.pricing[c.key] > 0);
                    return enabled.map(c => `${c.label.replace('缴', '')}¥${plan.pricing[c.key]}`).join(' | ');
                };

                // --- Actions ---
                const openDialog = () => {
                    isEdit.value = false;
                    Object.assign(currentPlan, {
                        id: 'MP' + Date.now(),
                        name: '',
                        tier: plans.value.length + 1,
                        type: 'free',
                        isDefault: false,
                        isRecommended: false,
                        showInApp: true,
                        pricing: { monthly: 0, quarterly: 0, semiAnnual: 0, annual: 0, monthlyEnabled: false, quarterlyEnabled: false, semiAnnualEnabled: false, annualEnabled: false },
                        benefits: [],
                        memberCount: 0,
                        status: 'active'
                    });
                    newBenefit.value = '';
                    dialogVisible.value = true;
                };

                const openEdit = (plan) => {
                    isEdit.value = true;
                    Object.assign(currentPlan, JSON.parse(JSON.stringify(plan)));
                    newBenefit.value = '';
                    dialogVisible.value = true;
                };

                const addBenefit = () => {
                    if (newBenefit.value.trim()) {
                        currentPlan.benefits.push(newBenefit.value.trim());
                        newBenefit.value = '';
                    }
                };

                const removeBenefit = (index) => {
                    currentPlan.benefits.splice(index, 1);
                };

                const savePlan = () => {
                    if (!currentPlan.name) {
                        ElMessage.warning('请输入方案名称');
                        return;
                    }

                    // Validate paid plan has at least one enabled cycle with price
                    if (currentPlan.type === 'paid') {
                        const hasPrice = pricingCycles.some(c => currentPlan.pricing[c.key + 'Enabled'] && currentPlan.pricing[c.key] > 0);
                        if (!hasPrice) {
                            ElMessage.warning('付费方案请至少设置一个缴费周期价格');
                            return;
                        }
                    }

                    // Default uniqueness logic
                    if (currentPlan.isDefault) {
                        plans.value.forEach(p => {
                            if (p.id !== currentPlan.id) p.isDefault = false;
                        });
                    }

                    if (isEdit.value) {
                        const idx = plans.value.findIndex(p => p.id === currentPlan.id);
                        if (idx !== -1) plans.value[idx] = JSON.parse(JSON.stringify(currentPlan));
                    } else {
                        plans.value.push(JSON.parse(JSON.stringify(currentPlan)));
                    }

                    dialogVisible.value = false;
                    ElMessage.success('保存成功');
                };

                const deletePlan = (plan) => {
                    if (plan.memberCount > 0) {
                        ElMessage.warning('该方案下还有会员，请先迁移后再删除');
                        return;
                    }
                    ElMessageBox.confirm(`确定要删除方案 "${plan.name}" 吗?`, '警告', { type: 'warning' })
                        .then(() => {
                            const idx = plans.value.findIndex(p => p.id === plan.id);
                            if (idx !== -1) plans.value.splice(idx, 1);
                            ElMessage.success('删除成功');
                        });
                };
</script>

<style scoped>
        .membership-plans-page {
            min-height: 100%;
        }

        .plan-card {
            transition: all 0.2s ease;
        }

        .plan-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
        }

        .plan-card.is-recommended {
            border-color: #f59e0b;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
        }

        .tier-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: bold;
        }

</style>
