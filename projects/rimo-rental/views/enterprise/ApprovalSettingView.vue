<template>
    <main class="car-setting-page">
                        <PageHeader unstyled class="car-setting-page__header mb-6" title="预约用车审批" description="设置预约用车审批开关、超时流转及最终审批人。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1" /><el-form
                            ref="formRef"
                            :model="form"
                            label-position="top"
                            label-suffix="："
                            class="car-setting-page__form"
                        >
                            <div class="car-setting-page__content-card">
                                <div class="car-setting-page__hero-grid">
                                    <section class="car-setting-page__hero-card">
                                        <div class="car-setting-page__hero-head">
                                            <span class="car-setting-page__hero-icon">
                                                <el-icon><Connection /></el-icon>
                                            </span>
                                            <div>
                                                <div class="car-setting-page__hero-title">
                                                    预约用车审批
                                                </div>
                                                <div class="car-setting-page__hero-desc">
                                                    设置预约用车审批开关、超时流转及最终审批人。
                                                </div>
                                            </div>
                                        </div>
                                        <el-form-item prop="enableOrNot" class="car-setting-page__checkbox-item">
                                            <el-checkbox v-model="form.enableOrNot" size="large">
                                                启用
                                            </el-checkbox>
                                        </el-form-item>
                                    </section>
    
                                    <section class="car-setting-page__summary-card">
                                        <div class="car-setting-page__summary-label">
                                            高级设置
                                        </div>
                                        <div class="car-setting-page__summary-list">
                                            <div class="car-setting-page__summary-item">
                                                <span>限时审批</span>
                                                <strong>{{ form.timeLimitedApproval ? '开启' : '关闭' }}</strong>
                                            </div>
                                            <div class="car-setting-page__summary-item">
                                                <span>最终审批</span>
                                                <strong>{{ form.userIds.length }}</strong>
                                            </div>
                                        </div>
                                    </section>
                                </div>
    
                                <div class="car-setting-page__panel-grid">
                                    <section class="car-setting-page__panel">
                                        <div class="car-setting-page__panel-head">
                                            <span class="car-setting-page__panel-icon car-setting-page__panel-icon--accent">
                                                <el-icon><Timer /></el-icon>
                                            </span>
                                            <div>
                                                <div class="car-setting-page__panel-title">
                                                    限时审批
                                                </div>
                                                <div class="car-setting-page__panel-desc">
                                                    若审批时间超过将自动跳至由此处选择的人员进行审批
                                                </div>
                                            </div>
                                        </div>
                                        <el-form-item label="限时审批" prop="timeLimitedApproval" class="car-setting-page__form-item car-setting-page__switch-item">
                                            <el-switch
                                                v-model="form.timeLimitedApproval"
                                                inline-prompt
                                                active-text="开"
                                                inactive-text="关"
                                                style="--el-switch-on-color: var(--app-color-primary);"
                                            />
                                        </el-form-item>
                                    </section>
    
                                    <section class="car-setting-page__panel" :class="{ 'is-disabled': !form.timeLimitedApproval }">
                                        <div class="car-setting-page__panel-head">
                                            <span class="car-setting-page__panel-icon car-setting-page__panel-icon--soft">
                                                <el-icon><User /></el-icon>
                                            </span>
                                            <div>
                                                <div class="car-setting-page__panel-title">
                                                    高级设置
                                                </div>
                                                <div class="car-setting-page__panel-desc">
                                                    设置预约用车审批开关、超时流转及最终审批人。
                                                </div>
                                            </div>
                                        </div>
    
                                        <div class="car-setting-page__field-grid">
                                            <el-form-item label="审批时间" prop="limitedTime" class="car-setting-page__form-item">
                                                <el-input v-model="form.limitedTime" :disabled="!form.timeLimitedApproval">
                                                    <template #append>分</template>
                                                </el-input>
                                            </el-form-item>
    
                                            <el-form-item label="最终审批" prop="userIds" class="car-setting-page__form-item">
                                                <el-select
                                                    v-model="form.userIds"
                                                    multiple
                                                    filterable
                                                    collapse-tags
                                                    collapse-tags-tooltip
                                                    :disabled="!form.timeLimitedApproval"
                                                    placeholder="最终审批"
                                                >
                                                    <el-option v-for="item in approverOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                                </el-select>
                                            </el-form-item>
                                        </div>
                                    </section>
                                </div>
                            </div>
    
                            <div class="car-setting-page__footer">
                                <el-button
                                    type="primary"
                                    size="large"
                                    class="car-setting-page__submit-button"
                                    @click="submitSettings"
                                >
                                    提交
                                </el-button>
                            </div>
                        </el-form>
    </main>
</template>

<script setup>
import { reactive } from 'vue';
import { PageHeader } from '@/components/ui';
import { ElMessage } from 'element-plus';

const form = reactive({
                    enableOrNot: true,
                    timeLimitedApproval: true,
                    limitedTime: '30',
                    userIds: ['u001']
                });
                const approverOptions = [
                    { label: '王怡君', value: 'u001' },
                    { label: '陈建宏', value: 'u002' },
                    { label: '林雅婷', value: 'u003' }
                ];

                function submitSettings() {
                    ElMessage.success('审批设定已保存');
                }
</script>
<style scoped>
        .car-setting-page {
            min-height: 100%;
            background: transparent;
        }

        .car-setting-page__header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
        }

        .car-setting-page__content-card {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding: 24px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            box-shadow: 0 1px 2px rgb(15 23 42 / 5%);
        }

        .car-setting-page__hero-grid,
        .car-setting-page__panel-grid {
            display: grid;
            grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
            gap: 20px;
        }

        .car-setting-page__hero-card,
        .car-setting-page__summary-card,
        .car-setting-page__panel {
            min-width: 0;
            padding: 20px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
        }

        .car-setting-page__hero-card {
            display: flex;
            min-height: 164px;
            flex-direction: column;
            justify-content: space-between;
            background: linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%);
        }

        .car-setting-page__hero-head,
        .car-setting-page__panel-head {
            display: flex;
            align-items: flex-start;
            gap: 14px;
        }

        .car-setting-page__hero-icon,
        .car-setting-page__panel-icon {
            display: inline-flex;
            width: 40px;
            height: 40px;
            flex: 0 0 40px;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            border-radius: 10px;
        }

        .car-setting-page__hero-icon {
            color: var(--app-color-primary);
            background: rgb(var(--app-color-primary-rgb) / 10%);
        }

        .car-setting-page__panel-icon--accent {
            color: #0f766e;
            background: rgba(15, 118, 110, 0.1);
        }

        .car-setting-page__panel-icon--soft {
            color: #4f46e5;
            background: rgba(79, 70, 229, 0.1);
        }

        .car-setting-page__hero-title,
        .car-setting-page__panel-title {
            color: #111827;
            font-size: 16px;
            font-weight: 700;
            line-height: 22px;
        }

        .car-setting-page__hero-desc,
        .car-setting-page__panel-desc {
            margin-top: 4px;
            color: #6b7280;
            font-size: 13px;
            line-height: 20px;
        }

        .car-setting-page__checkbox-item {
            margin-bottom: 0;
            padding-top: 16px;
            border-top: 1px solid #eef2f7;
        }

        .car-setting-page__checkbox-item :deep(.el-form-item__content) {
            justify-content: flex-end;
        }

        .car-setting-page__checkbox-item :deep(.el-checkbox) {
            font-weight: 600;
        }

        .car-setting-page__summary-card {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 18px;
            background: #f9fafb;
        }

        .car-setting-page__summary-label {
            color: #6b7280;
            font-size: 12px;
            font-weight: 700;
            line-height: 16px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }

        .car-setting-page__summary-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .car-setting-page__summary-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            color: #6b7280;
            font-size: 14px;
            line-height: 20px;
        }

        .car-setting-page__summary-item strong {
            color: #111827;
            font-size: 18px;
            font-weight: 700;
            line-height: 24px;
            font-variant-numeric: tabular-nums;
        }

        .car-setting-page__panel {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .car-setting-page__panel.is-disabled {
            background: #f9fafb;
        }

        .car-setting-page__field-grid {
            display: grid;
            grid-template-columns: minmax(0, 180px) minmax(0, 1fr);
            gap: 18px;
        }

        .car-setting-page__form-item {
            margin-bottom: 0;
        }

        .car-setting-page__switch-item :deep(.el-form-item__content) {
            min-height: 40px;
        }

        .car-setting-page__form :deep(.el-form-item__label) {
            padding-bottom: 8px;
            color: #374151;
            font-size: 13px;
            font-weight: 600;
            line-height: 18px;
        }

        .car-setting-page__form :deep(.el-input__wrapper),
        .car-setting-page__form :deep(.el-select__wrapper) {
            min-height: 40px;
            border-radius: 8px;
        }

        .car-setting-page__form :deep(.el-select) {
            width: 100%;
        }

        .car-setting-page__footer {
            display: flex;
            justify-content: flex-end;
            margin-top: 16px;
        }

        .car-setting-page__submit-button {
            min-width: 160px;
            border-radius: 10px;
            box-shadow: 0 10px 18px rgb(var(--app-color-primary-rgb) / 16%);
        }

        @media (max-width: 1024px) {
            .car-setting-page__hero-grid,
            .car-setting-page__panel-grid,
            .car-setting-page__field-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 768px) {
            .car-setting-page__content-card {
                padding: 16px;
                gap: 16px;
            }

            .car-setting-page__hero-card,
            .car-setting-page__summary-card,
            .car-setting-page__panel {
                padding: 16px;
            }

            .car-setting-page__footer {
                justify-content: stretch;
            }

            .car-setting-page__submit-button {
                width: 100%;
            }
        }
</style>
