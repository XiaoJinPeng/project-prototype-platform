<template>
<div class="settings-page">
            

            <main class="relative">
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">租赁业务规则</h1>
                        <p class="text-gray-500 text-sm mt-1">配置门市租赁及分时租赁的核心业务规则、费率及风控策略。</p>
                    </div>
                </div>

                <div class="">
                    <el-tabs v-model="activeTab"
                        class="settings-main-tabs w-full bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                        <el-tab-pane v-if="canViewRentalRuleTab('store')" name="store" class="p-6">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Shop></Shop>
                                    </el-icon>
                                    <span>门市租赁</span>
                                </span>
                            </template>
                            <div class="w-full">
                                
                                <div class="mb-6">
                                    <h2 class="text-xl font-bold text-gray-800">门市租赁规则</h2>
                                    <p class="text-gray-500 text-sm mt-1">配置门店租车业务的各项规则，包括交易支付、车辆排程看板、异地还车及违约处理等。</p>
                                    <div 
                                        class="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                                        本期门市租车规则按全局配置生效，页面当前显示值即默认值和当前设定值。支付、预授权、尾款和退款配置仅适用于个人订单及非月结企业订单；企业月结订单不发起客户支付或预授权，最终费用进入企业账单。
                                    </div>
                                    <div class="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                            <div class="text-xs text-gray-400 mb-1">当前规则版本</div>
                                            <div class="flex items-center justify-between gap-2">
                                                <div class="font-mono font-bold text-gray-800 cursor-pointer underline decoration-dotted"
                                                    @click="openRentalRuleVersion(ruleVersionRecords[0])">RULE-STORE-20260418-002</div>
                                                <el-button size="small" type="primary" link @click="openRentalRuleVersion()">历史版本</el-button>
                                            </div>
                                        </div>
                                        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                            <div class="text-xs text-gray-400 mb-1">版本范围</div>
                                            <div class="text-sm font-medium text-gray-800">门市租车全局配置</div>
                                        </div>
                                        <div class="rounded-lg border border-gray-200 bg-white px-4 py-3">
                                            <div class="text-xs text-gray-400 mb-1">订单快照</div>
                                            <div class="text-sm font-medium text-gray-800">仅影响后续新建订单</div>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid gap-6" style="grid-template-columns: 200px minmax(0, 1fr);">
                                    <div class="store-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit">
                                        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">规则分类
                                        </div>
                                        <a v-for="item in visibleStoreRuleNav" :key="item.key" :href="'#' + item.anchor"
                                            class="rule-nav-link block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors"
                                            @click.prevent="scrollToRule(item.anchor)">
                                            {{ item.label }}
                                        </a>
                                        <div v-if="visibleStoreRuleNav.length === 0"
                                            class="rounded-lg bg-white px-3 py-4 text-xs text-gray-400">
                                            当前账号暂无可查看的门市租赁设置项
                                        </div>
                                    </div>
                                    <div class="space-y-6 min-w-0">
                                        
                                        <section v-if="canViewStoreRule('transaction')" id="store-transaction" class="store-rule-section">
                                            <div class="bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                                            <svg class="w-5 h-5 text-blue-600" viewBox="0 0 24 24"
                                                                fill="none" stroke="currentColor" stroke-width="2"
                                                                stroke-linecap="round" stroke-linejoin="round">
                                                                <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                                                                <path d="M3 10h18"></path>
                                                                <path d="M7 15h3"></path>
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">交易与授权</h3>
                                                            <p class="text-gray-400 text-sm">设定门市租赁的支付方式和预授权规则</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <el-button v-if="cardLocks.transaction" type="primary" plain
                                                            size="small" @click="unlockCard('transaction')">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('transaction')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('transaction')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="cardLocks.transaction" :model="settings"
                                                    label-width="140px" label-position="left">
                                                    <div 
                                                        class="mb-4 rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm text-gray-600">
                                                        当前配置仅控制客户自付订单。企业月结订单创建、取车、续租、还车均不读取客户支付和预授权规则。
                                                    </div>
                                                    <div 
                                                        class="mb-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
                                                        <el-row :gutter="24" class="items-center">
                                                            <el-col :span="8">
                                                                <el-form-item label="待支付资源保留">
                                                                    <el-switch 
                                                                        v-model="settings.pendingPaymentHoldEnabled"
                                                                        active-text="开启" inactive-text="关闭"></el-switch>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8" v-if="settings.pendingPaymentHoldEnabled">
                                                                <el-form-item label="保留时长">
                                                                    <el-input-number 
                                                                        v-model="settings.pendingPaymentHoldMinutes"
                                                                        :min="5" :max="240" :step="5"
                                                                        style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-500 text-sm">分钟</span>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8" v-if="settings.pendingPaymentHoldEnabled">
                                                                <div class="text-xs text-amber-700 leading-relaxed">
                                                                    待支付订单仅保留车组库存，超时未完成预授权时自动取消并释放库存。
                                                                </div>
                                                            </el-col>
                                                        </el-row>
                                                    </div>
                                                    
                                                    <div class="grid grid-cols-2 gap-4 mb-4">
                                                        
                                                        <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                                            <div class="flex items-center justify-between mb-3">
                                                                <div class="text-sm font-medium text-blue-700">线上交易
                                                                </div>
                                                                <el-switch v-model="settings.onlinePaymentEnabled"
                                                                    active-color="#3b82f6"></el-switch>
                                                            </div>
                                                            <div v-if="settings.onlinePaymentEnabled">
                                                                <el-checkbox-group 
                                                                    v-model="settings.onlinePaymentMethods">
                                                                    <el-checkbox label="linepay">LINE Pay</el-checkbox>
                                                                    <el-checkbox label="jkopay">街口支付</el-checkbox>
                                                                    <el-checkbox label="ecpay">绿界金流</el-checkbox>
                                                                </el-checkbox-group>
                                                            </div>
                                                            <div v-else class="text-xs text-gray-400">启用后可使用线上支付方式</div>
                                                        </div>

                                                        
                                                        <div class="bg-green-50 rounded-lg p-4 border border-green-100">
                                                            <div class="flex items-center justify-between mb-3">
                                                                <div class="text-sm font-medium text-green-700">线下交易
                                                                </div>
                                                                <el-switch v-model="settings.offlinePaymentEnabled"
                                                                    active-color="#10b981"></el-switch>
                                                            </div>
                                                            <div v-if="settings.offlinePaymentEnabled">
                                                                <el-checkbox-group 
                                                                    v-model="settings.offlinePaymentMethods">
                                                                    <el-checkbox label="cash">现金</el-checkbox>
                                                                    <el-checkbox label="card">刷卡（POS）</el-checkbox>
                                                                    <el-checkbox label="transfer">转账</el-checkbox>
                                                                </el-checkbox-group>
                                                            </div>
                                                            <div v-else class="text-xs text-gray-400">启用后可使用线下支付方式</div>
                                                        </div>
                                                    </div>

                                                    
                                                    <el-divider content-position="left">
                                                        <span class="text-sm text-gray-400">预授权设置</span>
                                                    </el-divider>
                                                    <div class="bg-gray-50 rounded-lg p-4 border">
                                                        <el-row :gutter="24">
                                                            <el-col :span="8">
                                                                <el-form-item label="授权额度模式" label-width="100px">
                                                                    <el-radio-group 
                                                                        v-model="settings.authorizationMode">
                                                                        <el-radio label="fixed">固定金额</el-radio>
                                                                        <el-radio label="percentage">租金比例</el-radio>
                                                                    </el-radio-group>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8"
                                                                v-if="settings.authorizationMode === 'fixed'">
                                                                <el-form-item label="固定额度" label-width="80px">
                                                                    <el-input-number 
                                                                        v-model="settings.authorizationAmount" :min="0"
                                                                        :step="100"
                                                                        style="width: 140px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">元</span>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8"
                                                                v-if="settings.authorizationMode === 'percentage'">
                                                                <el-form-item label="租金比例" label-width="80px">
                                                                    <el-input-number 
                                                                        v-model="settings.authorizationPercent" :min="0"
                                                                        :max="100" :step="10"
                                                                        style="width: 140px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">%</span>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>
                                                        <el-divider content-position="left">
                                                            <span class="text-sm text-gray-400">取车资金处理口径</span>
                                                        </el-divider>
                                                        <el-checkbox-group v-model="settings.authorizationHandlingModes"
                                                            class="grid grid-cols-2 gap-3">
                                                            <el-checkbox label="guarantee" border class="!h-auto !items-start p-3">
                                                                <div class="leading-relaxed">
                                                                    <div class="font-medium text-gray-800">履约担保</div>
                                                                    <div class="text-xs text-gray-500 mt-1">
                                                                        取车时补足租金尾款，确认发车后释放预授权押金。
                                                                    </div>
                                                                </div>
                                                            </el-checkbox>
                                                            <el-checkbox label="rent_transfer" border class="!h-auto !items-start p-3">
                                                                <div class="leading-relaxed">
                                                                    <div class="font-medium text-gray-800">预授权转租金</div>
                                                                    <div class="text-xs text-gray-500 mt-1">
                                                                        取车时将预授权扣款转为租金实收，并抵扣取车尾款。
                                                                    </div>
                                                                </div>
                                                            </el-checkbox>
                                                        </el-checkbox-group>
                                                        <div class="mt-3 text-xs text-gray-500">
                                                            至少启用一种口径；两种都启用时，取车办理页面按订单实际情况选择。
                                                        </div>
                                                    </div>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewStoreRule('crossCity')" id="store-cross-city" class="store-rule-section">
                                            <div class="bg-orange-50/50 rounded-xl p-6 border border-orange-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                                                            <el-icon class="text-orange-600 text-xl">
                                                                <Location></Location>
                                                            </el-icon>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">异地还车</h3>
                                                            <p class="text-gray-400 text-sm">设定异地还车费用</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <el-button v-if="cardLocks.crossCity" type="primary" plain
                                                            size="small" @click="unlockCard('crossCity')">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('crossCity')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('crossCity')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="cardLocks.crossCity" :model="settings"
                                                    label-width="140px" label-position="left">
                                                    <el-form-item label="异地还车费">
                                                        <el-input-number v-model="settings.crossCityFee" :min="0"
                                                            :step="50" style="width: 160px"></el-input-number>
                                                        <span class="ml-2 text-gray-400">元/次</span>
                                                    </el-form-item>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewStoreRule('dispatch')" id="store-dispatch" class="store-rule-section">
                                            <div class="bg-purple-50/50 rounded-xl p-6 border border-purple-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                                            <el-icon class="text-purple-600 text-xl">
                                                                <Van></Van>
                                                            </el-icon>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">调度与派车</h3>
                                                            <p class="text-gray-400 text-sm">车辆排程看板限制和智能派车权重配置</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <el-button v-if="cardLocks.dispatch" type="primary" plain
                                                            size="small" @click="unlockCard('dispatch')">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('dispatch')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('dispatch')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="cardLocks.dispatch" :model="settings"
                                                    label-width="180px" label-position="left">
                                                    <el-row :gutter="24">
                                                        <el-col :span="12">
                                                            <el-form-item label="车辆排程看板锁定时间">
                                                                <el-input-number v-model="settings.vehicleLockHours"
                                                                    :min="0" :max="72"
                                                                    style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">小时前锁定</span>
                                                            </el-form-item>
                                                        </el-col>
                                                        <el-col :span="12">
                                                            <el-form-item label="订单间隔时间">
                                                                <el-input-number v-model="settings.orderIntervalMinutes"
                                                                    :min="0" :max="480" :step="30"
                                                                    style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">分钟</span>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                    <el-row :gutter="24">
                                                        <el-col :span="12">
                                                            <el-form-item label="基准日均里程">
                                                                <el-input-number 
                                                                    v-model="settings.benchmarkDailyMileage" :min="0"
                                                                    :step="10" style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">km/天</span>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                    <el-divider content-position="left">
                                                        <span class="text-sm text-gray-400">智能派车权重配置</span>
                                                    </el-divider>
                                                    <div class="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                                        <p class="text-xs text-gray-500 mb-4">设置智能派车评分权重，系统按评分低者优先派遣；当前默认以营收权重为主
                                                        </p>
                                                        <div class="grid grid-cols-3 gap-6">
                                                            <div class="text-center">
                                                                <div class="text-sm text-gray-600 mb-2">里程权重</div>
                                                                <el-input-number 
                                                                    v-model="settings.dispatchWeightMileage" :min="0"
                                                                    :max="100" size="large"
                                                                    style="width: 100%"></el-input-number>
                                                                <div 
                                                                    class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div class="h-full bg-purple-500 transition-all"
                                                                        :style="{width: settings.dispatchWeightMileage + '%'}">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="text-center">
                                                                <div class="text-sm text-gray-600 mb-2">营收权重</div>
                                                                <el-input-number 
                                                                    v-model="settings.dispatchWeightRevenue" :min="0"
                                                                    :max="100" size="large"
                                                                    style="width: 100%"></el-input-number>
                                                                <div 
                                                                    class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div class="h-full bg-indigo-500 transition-all"
                                                                        :style="{width: settings.dispatchWeightRevenue + '%'}">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="text-center">
                                                                <div class="text-sm text-gray-600 mb-2">车龄权重</div>
                                                                <el-input-number v-model="settings.dispatchWeightAge"
                                                                    :min="0" :max="100" size="large"
                                                                    style="width: 100%"></el-input-number>
                                                                <div 
                                                                    class="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                    <div class="h-full bg-blue-500 transition-all"
                                                                        :style="{width: settings.dispatchWeightAge + '%'}">
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewStoreRule('hourlyDaily')" id="store-hourly-daily" class="store-rule-section">
                                            <div class="bg-green-50/50 rounded-xl p-6 border border-green-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                                            <el-icon class="text-green-600 text-xl">
                                                                <Clock></Clock>
                                                            </el-icon>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">时租与日租</h3>
                                                            <p class="text-gray-400 text-sm">时租转日租规则和不满日租定价</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <el-button v-if="cardLocks.hourlyDaily" type="primary" plain
                                                            size="small" @click="unlockCard('hourlyDaily')">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('hourlyDaily')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('hourlyDaily')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="cardLocks.hourlyDaily" :model="settings"
                                                    label-width="180px" label-position="left">
                                                    <el-row :gutter="24">
                                                        <el-col :span="12">
                                                            <el-form-item label="时租转日租时间">
                                                                <el-input-number 
                                                                    v-model="settings.hourlyToDailyThreshold" :min="1"
                                                                    :max="24" style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">小时</span>
                                                            </el-form-item>
                                                        </el-col>
                                                        <el-col :span="12">
                                                            <el-form-item label="不满日租时的时租价格">
                                                                <el-select v-model="settings.hourlyPriceMode"
                                                                    style="width: 200px">
                                                                    <el-option label="按小时计费" value="hourly"></el-option>
                                                                    <el-option label="按日租百分比"
                                                                        value="percentage"></el-option>
                                                                    <el-option label="固定金额" value="fixed"></el-option>
                                                                </el-select>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                    
                                                    <el-row :gutter="24"
                                                        v-if="settings.hourlyPriceMode === 'percentage'">
                                                        <el-col :span="12">
                                                            <el-form-item label="每小时按日租">
                                                                <el-input-number 
                                                                    v-model="settings.hourlyPricePercentage" :min="1"
                                                                    :max="100" style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">% 计费</span>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                    
                                                    <el-row :gutter="24" v-if="settings.hourlyPriceMode === 'hourly'">
                                                        <el-col :span="12">
                                                            <el-form-item label="时租单价">
                                                                <el-input-number v-model="settings.hourlyRatePrice"
                                                                    :min="0" style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">元/小时</span>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                    
                                                    <el-row :gutter="24" v-if="settings.hourlyPriceMode === 'fixed'">
                                                        <el-col :span="12">
                                                            <el-form-item label="固定金额">
                                                                <el-input-number v-model="settings.hourlyFixedPrice"
                                                                    :min="0" style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">元（不满日租统一收费）</span>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewStoreRule('pickupReturn')" id="store-pickup-return" class="store-rule-section">
                                            <div class="bg-red-50/50 rounded-xl p-6 border border-red-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                                                            <svg class="w-5 h-5 text-red-600" viewBox="0 0 24 24"
                                                                fill="none" stroke="currentColor" stroke-width="2"
                                                                stroke-linecap="round" stroke-linejoin="round">
                                                                <path d="M7 7h10l-3-3"></path>
                                                                <path d="M17 17H7l3 3"></path>
                                                                <path d="M14 4l3 3-3 3"></path>
                                                                <path d="M10 14l-3 3 3 3"></path>
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">取还车规则</h3>
                                                            <p class="text-gray-400 text-sm">提前取车、提前还车、未取车的处理规则</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <el-button v-if="cardLocks.pickupReturn" type="primary" plain
                                                            size="small" @click="unlockCard('pickupReturn')">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('pickupReturn')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('pickupReturn')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="cardLocks.pickupReturn" :model="settings"
                                                    label-width="180px" label-position="left">
                                                    <el-divider content-position="left"><span 
                                                            class="text-sm text-gray-400">提前取车</span></el-divider>
                                                    <el-row :gutter="24" class="items-start">
                                                        <el-col :span="8">
                                                            <el-form-item label="允许提前取车">
                                                                <el-switch 
                                                                    v-model="settings.allowEarlyPickup"></el-switch>
                                                            </el-form-item>
                                                        </el-col>
                                                        <el-col :span="16" v-if="settings.allowEarlyPickup">
                                                            <el-form-item label="免费宽限时间">
                                                                <div class="flex items-center">
                                                                    <el-input-number 
                                                                        v-model="settings.earlyPickupGraceMinutes"
                                                                        :min="0" :step="15" size="small"
                                                                        style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-500 text-sm">分钟</span>
                                                                </div>
                                                                <div 
                                                                    class="mt-2 text-xs text-gray-500 leading-relaxed bg-blue-50 p-2 rounded border border-blue-100 flex items-start gap-2">
                                                                    <el-icon class="text-blue-500 text-sm mt-0.5">
                                                                        <InfoFilled></InfoFilled>
                                                                    </el-icon>
                                                                    <div>
                                                                        <span 
                                                                            class="font-medium text-gray-700">规则说明：</span>
                                                                        宽限期内不计费；超过后自动更新订单时间并重算租金。
                                                                    </div>
                                                                </div>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>

                                                    <el-divider content-position="left"><span 
                                                            class="text-sm text-gray-400">履约操作锁</span></el-divider>
                                                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                                                        <p class="text-xs text-gray-500 mb-4">
                                                            点击取车或还车后创建操作锁；关闭取车窗口时固定保留验车中、取车草稿和操作锁，关闭还车窗口时按还车提交节点保留当前状态。
                                                        </p>
                                                        <el-row :gutter="24">
                                                            <el-col :span="12">
                                                                <el-form-item label="启用履约操作锁">
                                                                    <el-switch v-model="settings.pickupLockEnabled"></el-switch>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="12" v-if="settings.pickupLockEnabled">
                                                                <el-form-item label="锁有效期">
                                                                    <el-input-number 
                                                                        v-model="settings.pickupLockMinutes" :min="5"
                                                                        :max="240" :step="5"
                                                                        style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">分钟</span>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>
                                                        <div v-if="settings.pickupLockEnabled"
                                                            class="rounded-lg bg-white border border-gray-200 px-3 py-2 text-xs text-gray-600">
                                                            锁超时后，原操作人可继续办理；释放操作锁由角色权限配置控制，本页不选择角色。
                                                        </div>
                                                    </div>

                                                    <el-divider content-position="left"><span 
                                                            class="text-sm text-gray-400">提前还车</span></el-divider>
                                                    <el-row :gutter="24" class="items-start">
                                                        <el-col :span="8">
                                                            <el-form-item label="允许提前还车">
                                                                <el-switch 
                                                                    v-model="settings.allowEarlyReturn"></el-switch>
                                                            </el-form-item>
                                                        </el-col>
                                                        <el-col :span="16" v-if="settings.allowEarlyReturn">
                                                            <el-form-item label="退款计算规则">
                                                                <el-select v-model="settings.earlyReturnRefund"
                                                                    size="small" style="width: 180px">
                                                                    <el-option label="仅退还整天租金"
                                                                        value="full_days"></el-option>
                                                                    <el-option label="不退还任何费用" value="none"></el-option>
                                                                </el-select>
                                                                <div class="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200"
                                                                    v-if="settings.earlyReturnRefund === 'full_days'">
                                                                    <el-icon class="mr-1 relative top-0.5">
                                                                        <InfoFilled></InfoFilled>
                                                                    </el-icon>
                                                                    <span class="font-bold text-gray-700">说明：</span>
                                                                    提前24小时以上才退1天租金，不满1天及其以内的部分不退。
                                                                </div>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>

                                                    <el-divider content-position="left"><span 
                                                            class="text-sm text-gray-400">未取车(No-show)处理</span></el-divider>
                                                    <div class="bg-red-50 rounded-lg p-4 border border-red-100">
                                                        <p class="text-xs text-gray-500 mb-4">
                                                            超过保留时长仍未取车后，订单按配置进入爽约处理，并释放车辆和库存资源。
                                                        </p>
                                                        <el-row :gutter="24">
                                                            <el-col :span="8">
                                                                <el-form-item label="保留车辆时长">
                                                                    <el-input-number v-model="settings.noShowHoldHours"
                                                                        :min="0.5" :step="0.5" size="small"
                                                                        style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-500 text-sm">小时</span>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8">
                                                                <el-form-item label="自动释放资源">
                                                                    <el-switch v-model="settings.noShowAutoCancel"
                                                                        active-text="开启" inactive-text="关闭"></el-switch>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8">
                                                                <el-form-item label="处理后状态">
                                                                    <el-select v-model="settings.noShowTargetStatus"
                                                                        style="width: 140px">
                                                                        <el-option label="爽约" value="no_show"></el-option>
                                                                    </el-select>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>

                                                        <div class="bg-white rounded-lg p-4 border border-red-200">
                                                            <div class="flex items-center justify-between mb-3">
                                                                <div>
                                                                    <div class="text-sm font-medium text-gray-700">爽约违约金</div>
                                                                    <div class="text-xs text-gray-400 mt-1">客户自付订单按配置扣费，企业月结订单费用进入企业账单。</div>
                                                                </div>
                                                                <el-switch v-model="settings.noShowPenaltyEnabled"
                                                                    active-text="收取" inactive-text="不收"></el-switch>
                                                            </div>
                                                            <div v-if="settings.noShowPenaltyEnabled"
                                                                class="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                                                <div>
                                                                    <div class="text-xs text-gray-500 mb-2">扣款模式</div>
                                                                    <el-radio-group v-model="settings.noShowPenaltyType">
                                                                        <el-radio label="fixed">固定金额</el-radio>
                                                                        <el-radio label="auth_percent">预授权比例</el-radio>
                                                                    </el-radio-group>
                                                                </div>
                                                                <div>
                                                                    <div class="text-xs text-gray-500 mb-2">扣款数值</div>
                                                                    <div class="flex items-center gap-2"
                                                                        v-if="settings.noShowPenaltyType === 'fixed'">
                                                                        <el-input-number 
                                                                            v-model="settings.noShowPenaltyFixed"
                                                                            :min="0" :step="50"
                                                                            style="width: 140px"></el-input-number>
                                                                        <span class="text-gray-500">元</span>
                                                                    </div>
                                                                    <div class="flex items-center gap-2"
                                                                        v-if="settings.noShowPenaltyType === 'auth_percent'">
                                                                        <el-input-number 
                                                                            v-model="settings.noShowPenaltyPercent"
                                                                            :min="0" :max="100"
                                                                            style="width: 140px"></el-input-number>
                                                                        <span class="text-gray-500">%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewStoreRule('cancellation')" id="store-cancellation" class="store-rule-section">
                                            <div class="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                                                            <svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24"
                                                                fill="none" stroke="currentColor" stroke-width="2"
                                                                stroke-linecap="round" stroke-linejoin="round">
                                                                <path d="M12 3l9 16H3L12 3z"></path>
                                                                <path d="M12 9v4"></path>
                                                                <path d="M12 17h.01"></path>
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">取消与超时规则</h3>
                                                            <p class="text-gray-400 text-sm">设置免责取消、有责取消条件及超时还车费用</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <el-button v-if="cardLocks.cancellation" type="primary" plain
                                                            size="small" @click="unlockCard('cancellation')">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('cancellation')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('cancellation')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="cardLocks.cancellation" :model="settings"
                                                    label-width="180px" label-position="left">
                                                    
                                                    <el-divider content-position="left">
                                                        <span class="text-sm text-green-600 font-medium">免责取消条件</span>
                                                    </el-divider>
                                                    <div 
                                                        class="bg-green-50 rounded-lg p-4 mb-4 border border-green-100">
                                                        <p class="text-xs text-gray-500 mb-4">满足以下任一条件即可免责取消（可同时启用两种规则）
                                                        </p>

                                                        
                                                        <div 
                                                            class="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200">
                                                            <el-switch v-model="settings.freeCancelAfterOrderEnabled"
                                                                active-color="#10b981"></el-switch>
                                                            <div class="flex-1">
                                                                <div class="text-sm font-medium text-gray-700 mb-1">
                                                                    下单后限时取消
                                                                </div>
                                                                <div class="flex items-center gap-2"
                                                                    v-if="settings.freeCancelAfterOrderEnabled">
                                                                    <span class="text-sm text-gray-500">下单后</span>
                                                                    <el-input-number 
                                                                        v-model="settings.freeCancelAfterOrderMinutes"
                                                                        :min="1" :max="1440" size="small"
                                                                        style="width: 100px"></el-input-number>
                                                                    <el-select 
                                                                        v-model="settings.freeCancelAfterOrderUnit"
                                                                        size="small" style="width: 80px">
                                                                        <el-option label="分钟"
                                                                            value="minutes"></el-option>
                                                                        <el-option label="小时" value="hours"></el-option>
                                                                    </el-select>
                                                                    <span class="text-sm text-gray-500">内可免责取消</span>
                                                                </div>
                                                                <div v-else class="text-xs text-gray-400">
                                                                    启用后，用户在下单后一定时间内可无条件取消
                                                                </div>
                                                            </div>
                                                        </div>

                                                        
                                                        <div 
                                                            class="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200">
                                                            <el-switch v-model="settings.freeCancelBeforePickupEnabled"
                                                                active-color="#10b981"></el-switch>
                                                            <div class="flex-1">
                                                                <div class="text-sm font-medium text-gray-700 mb-1">
                                                                    取车前提前取消
                                                                </div>
                                                                <div class="flex items-center gap-2"
                                                                    v-if="settings.freeCancelBeforePickupEnabled">
                                                                    <span class="text-sm text-gray-500">取车前</span>
                                                                    <el-input-number 
                                                                        v-model="settings.freeCancelBeforePickupHours"
                                                                        :min="1" :max="168" size="small"
                                                                        style="width: 100px"></el-input-number>
                                                                    <span class="text-sm text-gray-500">小时以上可免责取消</span>
                                                                </div>
                                                                <div v-else class="text-xs text-gray-400">
                                                                    启用后，用户在取车前一定时间可无条件取消
                                                                </div>
                                                            </div>
                                                        </div>

                                                        
                                                        <div class="border-t border-green-200 pt-4 mt-2">
                                                            <el-row :gutter="24">
                                                                <el-col :span="12">
                                                                    <el-form-item label="免责取消退款方式" label-width="140px">
                                                                        <el-radio-group 
                                                                            v-model="settings.freeCancelRefund">
                                                                            <el-radio label="full">全额退款</el-radio>
                                                                            <el-radio label="partial">扣除手续费</el-radio>
                                                                        </el-radio-group>
                                                                    </el-form-item>
                                                                </el-col>
                                                                <el-col :span="12"
                                                                    v-if="settings.freeCancelRefund === 'partial'">
                                                                    <el-form-item label="手续费" label-width="80px">
                                                                        <el-input-number 
                                                                            v-model="settings.freeCancelFee" :min="0"
                                                                            style="width: 100px"></el-input-number>
                                                                        <span class="ml-2 text-gray-400">元</span>
                                                                    </el-form-item>
                                                                </el-col>
                                                            </el-row>
                                                        </div>
                                                    </div>

                                                    
                                                    <el-divider content-position="left">
                                                        <span class="text-sm text-red-600 font-medium">有责取消条件</span>
                                                    </el-divider>
                                                    <div class="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                                                        <p class="text-xs text-gray-500 mb-4">
                                                            <span v-if="settings.freeCancelBeforePickupEnabled">
                                                                取车前 <span class="font-bold text-red-600">{{
                                                                    settings.freeCancelBeforePickupHours }}</span>
                                                                小时内取消，
                                                            </span>
                                                            <span v-else>
                                                                不满足免责条件时，
                                                            </span>
                                                            视为有责取消
                                                        </p>
                                                        <el-row :gutter="24">
                                                            <el-col :span="8">
                                                                <el-form-item label="违约金计算方式">
                                                                    <el-select v-model="settings.penaltyCancelType"
                                                                        style="width: 160px">
                                                                        <el-option label="固定金额"
                                                                            value="fixed"></el-option>
                                                                        <el-option label="预授权比例"
                                                                            value="auth_percent"></el-option>
                                                                    </el-select>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8"
                                                                v-if="settings.penaltyCancelType === 'fixed'">
                                                                <el-form-item label="违约金">
                                                                    <el-input-number 
                                                                        v-model="settings.penaltyCancelFixed" :min="0"
                                                                        style="width: 100px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">元</span>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8"
                                                                v-if="settings.penaltyCancelType === 'auth_percent'">
                                                                <el-form-item label="预授权比例">
                                                                    <el-input-number 
                                                                        v-model="settings.penaltyCancelPercent" :min="0"
                                                                        :max="100"
                                                                        style="width: 100px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">%</span>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>
                                                        <el-row :gutter="24">
                                                            <el-col :span="12">
                                                                <el-form-item label="是否阶梯扣费">
                                                                    <el-switch v-model="settings.penaltyCancelTiered"
                                                                        active-text="是" inactive-text="否"></el-switch>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>
                                                        <div v-if="settings.penaltyCancelTiered"
                                                            class="mt-4 bg-white rounded-lg p-4 border border-red-200">
                                                            <div class="text-sm font-medium text-gray-700 mb-3">
                                                                阶梯扣费规则（取车前时间越近，扣费越高）
                                                            </div>
                                                            <div class="text-xs text-gray-400 mb-3">
                                                                阶梯数值跟随违约金计算方式：固定金额时填写元，预授权比例时填写百分比。
                                                            </div>
                                                            <table class="w-full text-sm">
                                                                <thead>
                                                                    <tr class="text-left text-gray-500 border-b">
                                                                        <th class="pb-2 w-12">#</th>
                                                                        <th class="pb-2">取车前时间</th>
                                                                        <th class="pb-2">{{ settings.penaltyCancelType === 'fixed' ? '扣除金额' : '预授权比例' }}</th>
                                                                        <th class="pb-2 w-16"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr v-for="(tier, idx) in settings.penaltyCancelTiers"
                                                                        :key="idx" class="border-b border-gray-100">
                                                                        <td class="py-2 text-gray-400">{{ idx + 1 }}
                                                                        </td>
                                                                        <td class="py-2">
                                                                            <div class="flex items-center gap-2">
                                                                                <span class="text-gray-500">≤</span>
                                                                                <el-input-number v-model="tier.hours"
                                                                                    :min="0" size="small"
                                                                                    style="width: 80px"></el-input-number>
                                                                                <span class="text-gray-500">小时</span>
                                                                            </div>
                                                                        </td>
                                                                        <td class="py-2">
                                                                            <div class="flex items-center gap-2">
                                                                                <el-input-number 
                                                                                    v-if="settings.penaltyCancelType === 'fixed'"
                                                                                    v-model="tier.amount" :min="0"
                                                                                    :step="50" size="small"
                                                                                    style="width: 90px"></el-input-number>
                                                                                <el-input-number v-else
                                                                                    v-model="tier.percent"
                                                                                    :min="0" :max="100" size="small"
                                                                                    style="width: 80px"></el-input-number>
                                                                                <span class="text-gray-500">{{ settings.penaltyCancelType === 'fixed' ? '元' : '%' }}</span>
                                                                            </div>
                                                                        </td>
                                                                        <td class="py-2">
                                                                            <el-button 
                                                                                v-if="settings.penaltyCancelTiers.length > 1"
                                                                                type="danger" link size="small"
                                                                                @click="settings.penaltyCancelTiers.splice(idx, 1)">
                                                                                <el-icon>
                                                                                    <Delete></Delete>
                                                                                </el-icon>
                                                                            </el-button>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                            <el-button type="primary" text size="small" class="mt-3"
                                                                @click="settings.penaltyCancelTiers.push({hours: 0, amount: settings.penaltyCancelFixed, percent: settings.penaltyCancelPercent})">
                                                                <el-icon class="mr-1">
                                                                    <Plus></Plus>
                                                                </el-icon> 添加阶梯
                                                            </el-button>
                                                        </div>
                                                    </div>

                                                    
                                                    <el-divider content-position="left">
                                                        <span class="text-sm text-orange-600 font-medium">超时还车规则</span>
                                                    </el-divider>
                                                    <div class="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                                        <p class="text-xs text-gray-500 mb-4">
                                                            超时还车按「时租与日租」规则计费：未满 <span 
                                                                class="font-bold text-orange-600">{{
                                                                settings.hourlyToDailyThreshold }}</span>
                                                            小时按日租比例计费，不足 1 小时按 1 小时计；达到阈值后按整天计算
                                                        </p>

                                                        
                                                        <div class="bg-white rounded-lg p-4 border border-orange-200">
                                                            <div class="text-sm font-medium text-gray-700 mb-2">超时免费宽限
                                                            </div>
                                                            <div class="text-xs text-gray-400 mb-3">宽限期内还车不收取超时费</div>
                                                            <div class="flex items-center gap-2">
                                                                <el-input-number v-model="settings.overtimeGracePeriod"
                                                                    :min="0" :max="120"
                                                                    style="width: 120px"></el-input-number>
                                                                <span class="text-gray-500">分钟</span>
                                                            </div>
                                                        </div>

                                                        
                                                        <div 
                                                            class="mt-4 bg-white rounded-lg p-4 border border-orange-200">
                                                            <div class="flex items-center justify-between">
                                                                <div>
                                                                    <div class="text-sm font-medium text-gray-700">超时罚款
                                                                    </div>
                                                                    <div class="text-xs text-gray-400 mt-1">
                                                                        在超时费基础上额外收取的罚款
                                                                    </div>
                                                                </div>
                                                                <div class="flex items-center gap-3">
                                                                    <el-switch 
                                                                        v-model="settings.overtimePenaltyEnabled"></el-switch>
                                                                </div>
                                                            </div>
                                                            <div v-if="settings.overtimePenaltyEnabled"
                                                                class="mt-4 pt-4 border-t border-gray-100">
                                                                <div class="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <div class="text-xs text-gray-500 mb-2">罚款类型
                                                                        </div>
                                                                        <el-radio-group 
                                                                            v-model="settings.overtimePenaltyType">
                                                                            <el-radio label="fixed">固定金额</el-radio>
                                                                            <el-radio 
                                                                                label="percentage">按超时费比例</el-radio>
                                                                        </el-radio-group>
                                                                    </div>
                                                                    <div>
                                                                        <div class="text-xs text-gray-500 mb-2">罚款数额
                                                                        </div>
                                                                        <div class="flex items-center gap-2">
                                                                            <el-input-number 
                                                                                v-model="settings.overtimePenaltyAmount"
                                                                                :min="0"
                                                                                style="width: 120px"></el-input-number>
                                                                            <span class="text-gray-500"
                                                                                v-if="settings.overtimePenaltyType === 'fixed'">元</span>
                                                                            <span class="text-gray-500" v-else>%</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        
                                                        <div 
                                                            class="mt-4 bg-white rounded-lg p-4 border border-orange-200">
                                                            <div class="flex items-center justify-between">
                                                                <div>
                                                                    <div class="text-sm font-medium text-gray-700">超时费封顶
                                                                    </div>
                                                                    <div class="text-xs text-gray-400 mt-1">
                                                                        限制单次超时的最高费用（不含罚款）
                                                                    </div>
                                                                </div>
                                                                <div class="flex items-center gap-3">
                                                                    <el-switch 
                                                                        v-model="settings.overtimeMaxEnabled"></el-switch>
                                                                    <div v-if="settings.overtimeMaxEnabled"
                                                                        class="flex items-center gap-2">
                                                                        <span class="text-gray-500">最高</span>
                                                                        <el-input-number 
                                                                            v-model="settings.overtimeMaxAmount"
                                                                            :min="0"
                                                                            style="width: 120px"></el-input-number>
                                                                        <span class="text-gray-500">元</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewStoreRule('extension')" id="store-extension" class="store-rule-section">
                                            <div class="bg-sky-50/50 rounded-xl p-6 border border-sky-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center mr-4">
                                                            <el-icon class="text-sky-600 text-xl">
                                                                <Clock></Clock>
                                                            </el-icon>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">续租规则</h3>
                                                            <p class="text-gray-400 text-sm">控制延长用车、逾期补办续租、库存冲突和费用处理</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <el-button v-if="cardLocks.extension" type="primary" plain
                                                            size="small" @click="unlockCard('extension')">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('extension')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('extension')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="cardLocks.extension" :model="settings"
                                                    label-width="180px" label-position="left">
                                                        <el-row :gutter="24">
                                                            <el-col :span="12">
                                                                <el-form-item label="允许延长用车">
                                                                    <el-switch v-model="settings.allowExtension"></el-switch>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="12">
                                                                <el-form-item label="允许逾期补办续租">
                                                                    <el-switch v-model="settings.allowOverdueExtension"></el-switch>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>
                                                        <div class="rounded-lg bg-white border border-sky-100 px-3 py-2 text-xs text-gray-600 mb-4">
                                                            本期不限制单次最大延长天数；只要没有后续订单冲突，且费用、风控和权限校验通过，即可确认延长。
                                                        </div>

                                                    <el-divider content-position="left">
                                                        <span class="text-sm text-gray-400">库存冲突处理</span>
                                                    </el-divider>
                                                    <div class="bg-white rounded-lg border border-sky-100 p-4 mb-4">
                                                        <el-form-item label="后续订单冲突">
                                                            <el-select v-model="settings.extensionConflictPolicy"
                                                                style="width: 260px">
                                                                <el-option label="先改派后续订单，否则拒绝续租"
                                                                    value="reassign_or_reject"></el-option>
                                                                <el-option label="仅提示冲突，人工确认"
                                                                    value="manual_confirm"></el-option>
                                                            </el-select>
                                                            <div class="text-xs text-gray-500 mt-2">
                                                                确认延长前必须检查当前车辆在新增租期内是否已被后续订单占用。
                                                            </div>
                                                        </el-form-item>
                                                    </div>

                                                    <el-divider content-position="left">
                                                        <span class="text-sm text-gray-400">客户自付结算</span>
                                                    </el-divider>
                                                    <div class="bg-white rounded-lg border border-sky-100 p-4">
                                                        <el-form-item label="可选结算方式">
                                                            <el-checkbox-group v-model="settings.extensionSettlementModes">
                                                                <el-checkbox label="immediate" border>立即收款</el-checkbox>
                                                                <el-checkbox label="return_settlement" border>还车时结算</el-checkbox>
                                                            </el-checkbox-group>
                                                        </el-form-item>
                                                        <el-row :gutter="24">
                                                            <el-col :span="8">
                                                                <el-form-item label="超过时长必须收款">
                                                                    <el-input-number 
                                                                        v-model="settings.extensionImmediateCollectHours"
                                                                        :min="1" :max="720" style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">小时</span>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8">
                                                                <el-form-item label="超过金额必须收款">
                                                                    <el-input-number 
                                                                        v-model="settings.extensionImmediateCollectAmount"
                                                                        :min="0" :step="100" style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">元</span>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="8">
                                                                <el-form-item label="风险客户必须收款">
                                                                    <el-switch 
                                                                        v-model="settings.extensionForceCollectRisk"></el-switch>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>
                                                        <div class="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-gray-600">
                                                            企业月结订单不展示立即收款和还车时结算选项，续租费用随还车最终应收统一进入企业账单。
                                                        </div>
                                                    </div>
                                                </el-form>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane v-if="canViewRentalRuleTab('sharing')" name="sharing" class="p-6">
                            <template #label>
                                <span class="flex items-center gap-2">
                                    <el-icon>
                                        <Clock></Clock>
                                    </el-icon>
                                    <span>分时租赁</span>
                                </span>
                            </template>
                            <div class="w-full">
                                <div class="mb-6">
                                    <h2 class="text-xl font-bold text-gray-800">分时租赁规则</h2>
                                    <p class="text-gray-500 text-sm mt-1">配置同站租还与甲租乙还的共用规则、订单限制、取还车与风控策略。</p>
                                </div>

                                <div class="grid gap-6" style="grid-template-columns: 220px minmax(0, 1fr);">
                                    <div 
                                        class="sharing-rule-nav rounded-xl border border-gray-100 bg-gray-50 p-3 h-fit">
                                        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">规则分类
                                        </div>
                                        <template v-for="group in visibleSharingRuleNavGroups" :key="group.label">
                                            <div v-if="group.label"
                                                class="mt-3 mb-1 px-3 text-xs font-semibold text-gray-400">
                                                {{ group.label }}
                                            </div>
                                            <a v-for="item in group.items" :key="item.key" :href="'#' + item.anchor"
                                                class="rule-nav-link block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors"
                                                @click.prevent="scrollToRule(item.anchor)">
                                                {{ item.label }}
                                            </a>
                                        </template>
                                        <div v-if="visibleSharingRuleNavGroups.length === 0"
                                            class="rounded-lg bg-white px-3 py-4 text-xs text-gray-400">
                                            当前账号暂无可查看的分时租赁设置项
                                        </div>
                                    </div>
                                    <div class="space-y-6 min-w-0">

                                        
                                        <section v-if="canViewSharingRule('global')" id="sharing-global" class="sharing-rule-section">
                                            <div class="bg-gray-50 rounded-xl p-6 border border-gray-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                                                            <el-icon class="text-indigo-600 text-xl">
                                                                <Operation></Operation>
                                                            </el-icon>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">分时共用规则</h3>
                                                            <p class="text-gray-400 text-sm">适用于同站租还及甲租乙还的基础规则</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <el-button v-if="sharingCardLocks.global" type="primary" plain
                                                            size="small" @click="sharingCardLocks.global = false">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="sharingCardLocks.global = true">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="sharingCardLocks.global = true; saveSettings()">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="sharingCardLocks.global" :model="sharingSettings"
                                                    label-width="180px" label-position="left">
                                                    <el-row :gutter="24">
                                                        <el-col :span="12">
                                                            <el-form-item label="预授权金额倍率">
                                                                <el-input-number 
                                                                    v-model="sharingSettings.preAuthMultiplier" :min="1"
                                                                    :step="0.5" style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">倍 (租金)</span>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                    <el-divider content-position="left"><span 
                                                            class="text-sm text-gray-400">低油量处理费</span></el-divider>
                                                    <el-row :gutter="24">
                                                        <el-col :span="12">
                                                            <el-form-item label="触发阈值 (低于)">
                                                                <el-input-number 
                                                                    v-model="sharingSettings.lowFuelThreshold" :min="0"
                                                                    :max="100" style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">%</span>
                                                            </el-form-item>
                                                        </el-col>
                                                        <el-col :span="12">
                                                            <el-form-item label="收取处理费">
                                                                <el-input-number v-model="sharingSettings.lowFuelFee"
                                                                    :min="0" :step="50"
                                                                    style="width: 120px"></el-input-number>
                                                                <span class="ml-2 text-gray-400">元</span>
                                                            </el-form-item>
                                                        </el-col>
                                                    </el-row>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewSharingRule('roundTrip')" id="sharing-roundtrip" class="sharing-rule-section">
                                            <div class="bg-teal-50/50 rounded-xl p-6 border border-teal-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                                                            <el-icon class="text-teal-600 text-xl">
                                                                <Refresh></Refresh>
                                                            </el-icon>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">同站租还规则</h3>
                                                            <p class="text-gray-400 text-sm">包含取消政策、取还车限制及订单逻辑</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <el-button v-if="sharingCardLocks.roundTrip" type="primary"
                                                            plain size="small"
                                                            @click="sharingCardLocks.roundTrip = false">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="sharingCardLocks.roundTrip = true">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="sharingCardLocks.roundTrip = true; saveSettings()">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <el-form :disabled="sharingCardLocks.roundTrip" :model="sharingSettings"
                                                    label-width="180px" label-position="left">

                                                    
                                                    <section v-if="canViewSharingRule('roundTripCancel')" id="sharing-roundtrip-cancel" class="sharing-rule-section">
                                                        <div class="text-sm font-bold text-gray-700 mb-2">1. 取消与违约</div>
                                                        <p class="text-xs text-gray-500 mb-4">配置同站租还订单的免责取消、有责取消、特殊取消和顾客自助取消规则。</p>
                                                        
                                                        <div>
                                                            
                                                            <el-divider content-position="left">
                                                                <span 
                                                                    class="text-sm text-green-600 font-medium">免责取消条件</span>
                                                            </el-divider>
                                                            <div 
                                                                class="bg-green-50 rounded-lg p-4 mb-4 border border-green-100">
                                                                <p class="text-xs text-gray-500 mb-4">
                                                                    满足以下任一条件即可免责取消（可同时启用两种规则）
                                                                </p>

                                                                
                                                                <div 
                                                                    class="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200">
                                                                    <el-switch 
                                                                        v-model="sharingSettings.freeCancelAfterOrderEnabled"
                                                                        active-color="#10b981"></el-switch>
                                                                    <div class="flex-1">
                                                                        <div 
                                                                            class="text-sm font-medium text-gray-700 mb-1">
                                                                            下单后限时取消
                                                                        </div>
                                                                        <div class="flex items-center gap-2"
                                                                            v-if="sharingSettings.freeCancelAfterOrderEnabled">
                                                                            <span 
                                                                                class="text-sm text-gray-500">下单后</span>
                                                                            <el-input-number 
                                                                                v-model="sharingSettings.freeCancelAfterOrderMinutes"
                                                                                :min="1" :max="1440" size="small"
                                                                                style="width: 100px"></el-input-number>
                                                                            <el-select 
                                                                                v-model="sharingSettings.freeCancelAfterOrderUnit"
                                                                                size="small" style="width: 80px">
                                                                                <el-option label="分钟"
                                                                                    value="minutes"></el-option>
                                                                                <el-option label="小时"
                                                                                    value="hours"></el-option>
                                                                            </el-select>
                                                                            <span 
                                                                                class="text-sm text-gray-500">内可免责取消</span>
                                                                        </div>
                                                                        <div v-else class="text-xs text-gray-400">
                                                                            启用后，用户在下单后一定时间内可无条件取消
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                
                                                                <div 
                                                                    class="flex items-center gap-4 mb-4 p-3 bg-white rounded-lg border border-green-200">
                                                                    <el-switch 
                                                                        v-model="sharingSettings.freeCancelBeforePickupEnabled"
                                                                        active-color="#10b981"></el-switch>
                                                                    <div class="flex-1">
                                                                        <div 
                                                                            class="text-sm font-medium text-gray-700 mb-1">
                                                                            取车前提前取消
                                                                        </div>
                                                                        <div class="flex items-center gap-2"
                                                                            v-if="sharingSettings.freeCancelBeforePickupEnabled">
                                                                            <span 
                                                                                class="text-sm text-gray-500">取车前</span>
                                                                            <el-input-number 
                                                                                v-model="sharingSettings.freeCancelBeforePickupHours"
                                                                                :min="1" :max="168" size="small"
                                                                                style="width: 100px"></el-input-number>
                                                                            <span 
                                                                                class="text-sm text-gray-500">小时以上可免责取消</span>
                                                                        </div>
                                                                        <div v-else class="text-xs text-gray-400">
                                                                            启用后，用户在取车前一定时间可无条件取消
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                
                                                                <div class="border-t border-green-200 pt-4 mt-2">
                                                                    <el-row :gutter="24">
                                                                        <el-col :span="24">
                                                                            <el-form-item label="免责取消退款方式"
                                                                                label-width="140px">
                                                                                <div class="flex items-center">
                                                                                    <el-tag type="success" size="small"
                                                                                        effect="dark"
                                                                                        class="mr-2">全额退款</el-tag>
                                                                                    <span 
                                                                                        class="text-xs text-gray-500">免责期内取消，系统将自动原路全额退还租金及押金</span>
                                                                                </div>
                                                                            </el-form-item>
                                                                        </el-col>
                                                                    </el-row>
                                                                </div>
                                                            </div>

                                                            
                                                            <el-divider content-position="left">
                                                                <span 
                                                                    class="text-sm text-red-600 font-medium">有责取消条件</span>
                                                            </el-divider>
                                                            <div 
                                                                class="bg-red-50 rounded-lg p-4 mb-4 border border-red-100">
                                                                <p class="text-xs text-gray-500 mb-4">
                                                                    <span 
                                                                        v-if="sharingSettings.freeCancelBeforePickupEnabled">
                                                                        取车前 <span class="font-bold text-red-600">{{
                                                                            sharingSettings.freeCancelBeforePickupHours
                                                                            }}</span> 小时内取消，
                                                                    </span>
                                                                    <span v-else>
                                                                        不满足免责条件时，
                                                                    </span>
                                                                    视为有责取消
                                                                </p>
                                                                <div 
                                                                    class="bg-white rounded-lg p-4 border border-red-200">
                                                                    <div class="text-sm font-medium text-gray-700 mb-3">
                                                                        阶梯扣费规则（取车前时间越近，扣费越高）</div>
                                                                    <table class="w-full text-sm">
                                                                        <thead>
                                                                            <tr 
                                                                                class="text-left text-gray-500 border-b">
                                                                                <th class="pb-2 w-12">#</th>
                                                                                <th class="pb-2">开始时间</th>
                                                                                <th class="pb-2">结束时间</th>
                                                                                <th class="pb-2">扣除比例</th>
                                                                                <th class="pb-2 w-16"></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr v-for="(tier, idx) in sharingSettings.penaltyCancelTiers"
                                                                                :key="idx"
                                                                                class="border-b border-gray-100">
                                                                                <td class="py-2 text-gray-400">{{ idx +
                                                                                    1 }}
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <span 
                                                                                        class="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                                                                                        {{ getTierStart(sharingSettings.penaltyCancelTiers, idx, 'hours') }} 小时
                                                                                    </span>
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <div 
                                                                                        class="flex items-center gap-2">
                                                                                        <span 
                                                                                            class="text-gray-500">至</span>
                                                                                        <el-input-number 
                                                                                            v-model="tier.hours"
                                                                                            :min="0" size="small"
                                                                                            style="width: 80px"></el-input-number>
                                                                                        <span 
                                                                                            class="text-gray-500">小时</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <div 
                                                                                        class="flex items-center gap-2">
                                                                                        <el-input-number 
                                                                                            v-model="tier.percent"
                                                                                            :min="0" :max="100"
                                                                                            size="small"
                                                                                            style="width: 80px"></el-input-number>
                                                                                        <span 
                                                                                            class="text-gray-500">%</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <el-button 
                                                                                        v-if="sharingSettings.penaltyCancelTiers.length > 1"
                                                                                        type="danger" link size="small"
                                                                                        @click="sharingSettings.penaltyCancelTiers.splice(idx, 1)">
                                                                                        <el-icon>
                                                                                            <Delete></Delete>
                                                                                        </el-icon>
                                                                                    </el-button>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <el-button type="primary" text size="small"
                                                                        class="mt-3"
                                                                        @click="sharingSettings.penaltyCancelTiers.push({hours: 0, percent: 0})">
                                                                        <el-icon class="mr-1">
                                                                            <Plus></Plus>
                                                                        </el-icon> 添加阶梯
                                                                    </el-button>
                                                                </div>

                                                                
                                                                <div class="mt-6 border-t border-red-200 pt-4">
                                                                    <div class="flex justify-between items-center mb-2">
                                                                        <span 
                                                                            class="text-sm font-bold text-gray-600">临时特殊取消规则
                                                                            (节假日)</span>
                                                                        <el-button link type="primary" size="small"
                                                                            @click="sharingSettings.tempCancelLadder.push({start: '', end: '', ratio: 100, remark: ''})">+
                                                                            添加特殊规则</el-button>
                                                                    </div>
                                                                    <p class="text-xs text-gray-400 mb-2">
                                                                        设定特定日期范围内的独立违约金比例</p>
                                                                    <el-table :data="sharingSettings.tempCancelLadder"
                                                                        size="small" border>
                                                                        <el-table-column label="开始日期" width="140">
                                                                            <template #default="{row}">
                                                                                <el-date-picker v-model="row.start"
                                                                                    type="date" placeholder="选择日期"
                                                                                    style="width: 100%"></el-date-picker>
                                                                            </template>
                                                                        </el-table-column>
                                                                        <el-table-column label="结束日期" width="140">
                                                                            <template #default="{row}">
                                                                                <el-date-picker v-model="row.end"
                                                                                    type="date" placeholder="选择日期"
                                                                                    style="width: 100%"></el-date-picker>
                                                                            </template>
                                                                        </el-table-column>
                                                                        <el-table-column label="扣除比例 (%)" width="100">
                                                                            <template #default="{row}">
                                                                                <el-input-number v-model="row.ratio"
                                                                                    :min="0" :max="100"
                                                                                    :controls="false"
                                                                                    style="width: 100%"></el-input-number>
                                                                            </template>
                                                                        </el-table-column>
                                                                        <el-table-column label="备注原因">
                                                                            <template #default="{row}">
                                                                                <el-input v-model="row.remark"
                                                                                    placeholder="如: 春节假期"></el-input>
                                                                            </template>
                                                                        </el-table-column>
                                                                        <el-table-column label="操作" width="60">
                                                                            <template #default="{$index}">
                                                                                <el-button link type="danger"
                                                                                    @click="sharingSettings.tempCancelLadder.splice($index, 1)"><el-icon>
                                                                                        <Delete></Delete>
                                                                                    </el-icon></el-button>
                                                                            </template>
                                                                        </el-table-column>
                                                                    </el-table>
                                                                </div>
                                                            </div>

                                                            
                                                            <div class="mt-4">
                                                                <el-divider content-position="left">
                                                                    <span 
                                                                        class="text-sm text-gray-600 font-medium">顾客自助取消</span>
                                                                </el-divider>
                                                                <el-form-item label="允许顾客自助取消">
                                                                    <el-switch 
                                                                        v-model="sharingSettings.allowCustomerCancel"></el-switch>
                                                                </el-form-item>
                                                                <div v-if="sharingSettings.allowCustomerCancel"
                                                                    class="bg-gray-50 p-4 rounded-lg border">
                                                                    <el-form-item label="取消截止时间">
                                                                        <span class="text-gray-500 mr-2">取车前</span>
                                                                        <el-input-number 
                                                                            v-model="sharingSettings.customerCancelLeadMinutes"
                                                                            :min="0"
                                                                            style="width: 120px"></el-input-number>
                                                                        <span 
                                                                            class="text-gray-500 ml-2">分钟内禁止自助取消</span>
                                                                    </el-form-item>
                                                                    <el-form-item label="取消需要审核">
                                                                        <el-switch 
                                                                            v-model="sharingSettings.customerCancelAudit"></el-switch>
                                                                        <span 
                                                                            class="text-xs text-gray-400 ml-2">开启后需人工确认才退款</span>
                                                                    </el-form-item>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    
                                                    <section v-if="canViewSharingRule('roundTripOvertime')" id="sharing-roundtrip-overtime"
                                                        class="sharing-rule-section">
                                                        <div 
                                                            class="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                                            <div class="text-sm font-bold text-gray-700 mb-2">2. 超时规则</div>
                                                            <p class="text-xs text-gray-500 mb-4">
                                                                同站租还的超时费用按免费宽限时间与超时罚款阶梯计算；宽限期内不收取超时费，超过宽限后按下方阶梯收取。
                                                            </p>

                                                            
                                                            <div 
                                                                class="bg-white rounded-lg p-4 border border-orange-200">
                                                                <div class="text-sm font-medium text-gray-700 mb-2">
                                                                    超时免费宽限
                                                                </div>
                                                                <div class="text-xs text-gray-400 mb-3">宽限期内还车不收取超时费
                                                                </div>
                                                                <div class="flex items-center gap-2">
                                                                    <el-input-number 
                                                                        v-model="sharingSettings.overtimeGracePeriod"
                                                                        :min="0" :max="120"
                                                                        style="width: 120px"></el-input-number>
                                                                    <span class="text-gray-500">分钟</span>
                                                                </div>
                                                            </div>

                                                            
                                                            <div 
                                                                class="mt-4 bg-white rounded-lg p-4 border border-orange-200">
                                                                <div class="flex items-center justify-between mb-4">
                                                                    <div>
                                                                        <div class="text-sm font-medium text-gray-700">
                                                                            超时罚款阶梯</div>
                                                                        <div class="text-xs text-gray-400 mt-1">
                                                                            根据超时时长设定罚款金额
                                                                        </div>
                                                                    </div>
                                                                    <el-switch 
                                                                        v-model="sharingSettings.overtimePenaltyEnabled"></el-switch>
                                                                </div>

                                                                <div v-if="sharingSettings.overtimePenaltyEnabled">
                                                                    <table class="w-full text-sm">
                                                                        <thead>
                                                                            <tr 
                                                                                class="text-left text-gray-500 border-b">
                                                                                <th class="pb-2 w-12">#</th>
                                                                                <th class="pb-2">开始时间</th>
                                                                                <th class="pb-2">结束时间</th>
                                                                                <th class="pb-2">罚款金额</th>
                                                                                <th class="pb-2 w-16"></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            <tr v-for="(tier, idx) in sharingSettings.overtimePenaltyTiers"
                                                                                :key="idx"
                                                                                class="border-b border-gray-100">
                                                                                <td class="py-2 text-gray-400">{{ idx +
                                                                                    1 }}
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <span 
                                                                                        class="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 border border-gray-100">
                                                                                        {{ getTierStart(sharingSettings.overtimePenaltyTiers, idx, 'minutes', sharingSettings.overtimeGracePeriod) }} 分钟
                                                                                    </span>
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <div 
                                                                                        class="flex items-center gap-2">
                                                                                        <span 
                                                                                            class="text-gray-500">至</span>
                                                                                        <el-input-number 
                                                                                            v-model="tier.minutes"
                                                                                            :min="1" :step="30"
                                                                                            size="small"
                                                                                            style="width: 100px"></el-input-number>
                                                                                        <span 
                                                                                            class="text-gray-500">分钟</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <div 
                                                                                        class="flex items-center gap-2">
                                                                                        <el-input-number 
                                                                                            v-model="tier.amount"
                                                                                            :min="0" :step="10"
                                                                                            size="small"
                                                                                            style="width: 100px"></el-input-number>
                                                                                        <span 
                                                                                            class="text-gray-500">元</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td class="py-2">
                                                                                    <el-button link type="danger"
                                                                                        size="small"
                                                                                        @click="sharingSettings.overtimePenaltyTiers.splice(idx, 1)">
                                                                                        <el-icon>
                                                                                            <Delete></Delete>
                                                                                        </el-icon>
                                                                                    </el-button>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <el-button type="primary" text size="small"
                                                                        class="mt-3"
                                                                        @click="sharingSettings.overtimePenaltyTiers.push({minutes: 30, amount: 50})">
                                                                        <el-icon class="mr-1">
                                                                            <Plus></Plus>
                                                                        </el-icon> 添加阶梯
                                                                    </el-button>
                                                                </div>
                                                            </div>

                                                            
                                                            <div 
                                                                class="mt-4 bg-white rounded-lg p-4 border border-orange-200">
                                                                <div class="flex items-center justify-between">
                                                                    <div>
                                                                        <div class="flex items-center gap-2">
                                                                            <span class="text-sm font-medium text-gray-700">超时费封顶</span>
                                                                            <el-tag size="small" type="info" effect="plain">开发中</el-tag>
                                                                        </div>
                                                                        <div class="text-xs text-gray-400 mt-1">
                                                                            功能开发中，暂不支持设置单次超时费用封顶。
                                                                        </div>
                                                                    </div>
                                                                    <div class="flex items-center gap-3">
                                                                        <el-switch 
                                                                            v-model="sharingSettings.overtimeMaxEnabled" disabled></el-switch>
                                                                        <div v-if="sharingSettings.overtimeMaxEnabled"
                                                                            class="flex items-center gap-2">
                                                                            <span class="text-gray-500">最高</span>
                                                                            <el-input-number 
                                                                                v-model="sharingSettings.overtimeMaxAmount"
                                                                                :min="0" disabled
                                                                                style="width: 120px"></el-input-number>
                                                                            <span class="text-gray-500">元</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>


                                                    </section>

                                                    
                                                    <section v-if="canViewSharingRule('roundTripPickup')" id="sharing-roundtrip-pickup" class="sharing-rule-section">
                                                        <div class="bg-red-50 rounded-lg p-4 border border-red-100">
                                                        <div class="text-sm font-bold text-gray-700 mb-2">3. 取还设置</div>
                                                        <p class="text-xs text-gray-500 mb-4">配置同站租还的提前取车、订单间隔、提前还车退款与退款返还渠道。</p>
                                                        <el-row :gutter="24">
                                                            <el-col :span="12">
                                                                <el-form-item label="允许提前取车时间">
                                                                    <el-input-number 
                                                                        v-model="sharingSettings.earlyPickupMinutes"
                                                                        :min="0" :step="5"
                                                                        style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">分钟</span>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="12">
                                                                <el-form-item label="订单间隔缓冲">
                                                                    <el-input-number 
                                                                        v-model="sharingSettings.orderIntervalBuffer"
                                                                        :min="0" :step="10"
                                                                        style="width: 120px"></el-input-number>
                                                                    <span class="ml-2 text-gray-400">分钟</span>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>

                                                        <el-form-item label="提前还车退款比例">
                                                            <el-input-number 
                                                                v-model="sharingSettings.earlyReturnRefundRatio"
                                                                :min="0" :max="100"
                                                                style="width: 120px"></el-input-number>
                                                            <span class="ml-2 text-gray-400">% (剩余租金)</span>
                                                        </el-form-item>

                                                        <el-form-item label="退款返还渠道">
                                                            <el-radio-group 
                                                                v-model="sharingSettings.earlyReturnRefundChannel">
                                                                <el-radio label="original" disabled>
                                                                    原路返回 (支付账户)
                                                                    <el-tag size="small" type="info" effect="plain"
                                                                        class="ml-2">开发中</el-tag>
                                                                </el-radio>
                                                                <el-radio label="points">会员积分/余额</el-radio>
                                                            </el-radio-group>
                                                        </el-form-item>
                                                        </div>

                                                    </section>
                                                </el-form>
                                            </div>
                                        </section>

                                        
                                        <section v-if="canViewSharingRule('oneWay')" id="sharing-oneway" class="sharing-rule-section">
                                            <div class="bg-purple-50/50 rounded-xl p-6 border border-purple-100">
                                                <div class="flex items-center justify-between mb-5">
                                                    <div class="flex items-center">
                                                        <div 
                                                            class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                                                            <el-icon class="text-purple-600 text-xl">
                                                                <Promotion></Promotion>
                                                            </el-icon>
                                                        </div>
                                                        <div>
                                                            <h3 class="font-bold text-gray-800 text-lg">甲租乙还规则</h3>
                                                            <p class="text-gray-400 text-sm">预约限制、异地还车及风控设置</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div>
                                                        <el-button v-if="sharingCardLocks.oneWay" type="primary" plain
                                                            size="small" @click="sharingCardLocks.oneWay = false">
                                                            <el-icon class="mr-1">
                                                                <Lock></Lock>
                                                            </el-icon> 解锁编辑
                                                        </el-button>
                                                        <div v-else class="flex gap-2">
                                                            <el-button size="small"
                                                                @click="cancelCard('oneWay')">取消</el-button>
                                                            <el-button type="primary" size="small"
                                                                @click="saveCard('oneWay')">
                                                                <el-icon class="mr-1">
                                                                    <Check></Check>
                                                                </el-icon> 保存
                                                            </el-button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <el-form label-width="140px" label-position="left"
                                                    :disabled="sharingCardLocks.oneWay">

                                                    
                                                    <section v-if="canViewSharingRule('oneWayPickup')" id="sharing-oneway-pickup"
                                                        class="sharing-rule-section bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
                                                        <div class="text-sm font-bold text-gray-700 mb-2">1. 预约保留时长
                                                            (超时未取自动取消)</div>
                                                        <p class="text-xs text-gray-500 mb-4">
                                                            设定预约后多久未取车将自动取消订单，可按会员等级设置差异化时长。</p>

                                                        <el-form-item label="默认保留时长">
                                                            <el-input-number 
                                                                v-model="sharingSettings.oneWayPickupDefaultMinutes"
                                                                :min="1" :step="10"
                                                                style="width: 120px"></el-input-number>
                                                            <span class="text-gray-500 ml-2">分钟</span>
                                                        </el-form-item>

                                                        <div 
                                                            class="bg-white rounded-lg p-4 border border-purple-200 mt-2">
                                                            <div class="flex justify-between items-center mb-2">
                                                                <span 
                                                                    class="text-xs font-medium text-gray-600">会员差异化设置</span>
                                                                <el-button link type="primary" size="small"
                                                                    @click="sharingSettings.oneWayPickupTiers.push({levels: [], minutes: 30})">+
                                                                    添加会员规则</el-button>
                                                            </div>
                                                            <el-table :data="sharingSettings.oneWayPickupTiers"
                                                                size="small" border>
                                                                <el-table-column label="会员方案 / 等级" min-width="180">
                                                                    <template #default="{row}">
                                                                        <el-select v-model="row.levels" multiple
                                                                            collapse-tags placeholder="选择会员方案"
                                                                            style="width: 100%">
                                                                            <el-option v-for="plan in membershipPlans"
                                                                                :key="plan.id" :label="plan.name"
                                                                                :value="plan.name"></el-option>
                                                                        </el-select>
                                                                    </template>
                                                                </el-table-column>
                                                                <el-table-column label="保留时长 (分钟)" width="120">
                                                                    <template #default="{row}">
                                                                        <el-input-number v-model="row.minutes" :min="1"
                                                                            :controls="false"
                                                                            style="width: 100%"></el-input-number>
                                                                    </template>
                                                                </el-table-column>
                                                                <el-table-column label="操作" width="60">
                                                                    <template #default="{$index}">
                                                                        <el-button link type="danger"
                                                                            @click="sharingSettings.oneWayPickupTiers.splice($index, 1)"><el-icon>
                                                                                <Delete></Delete>
                                                                            </el-icon></el-button>
                                                                    </template>
                                                                </el-table-column>
                                                            </el-table>
                                                        </div>
                                                    </section>

                                                    
                                                    <section v-if="canViewSharingRule('oneWayRestrict')" id="sharing-oneway-restrict"
                                                        class="sharing-rule-section bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
                                                        <div class="flex justify-between items-center mb-2">
                                                            <div class="text-sm font-bold text-gray-700">2. 爽约/取消限制规则
                                                            </div>
                                                            <el-switch 
                                                                v-model="sharingSettings.oneWayRestrictEnabled"></el-switch>
                                                        </div>
                                                        <p class="text-xs text-gray-500 mb-4">限制用户在短时间内频繁取消订单的行为。</p>

                                                        <div v-if="sharingSettings.oneWayRestrictEnabled">
                                                            <div class="grid grid-cols-3 gap-4 mb-4">
                                                                <div>
                                                                    <div class="text-xs text-gray-500 mb-1">统计周期</div>
                                                                    <el-input-number 
                                                                        v-model="sharingSettings.oneWayRestrictWindow"
                                                                        :min="1" size="small"
                                                                        style="width: 100px"></el-input-number>
                                                                    <span class="text-xs text-gray-500 ml-1">小时内</span>
                                                                </div>
                                                                <div>
                                                                    <div class="text-xs text-gray-500 mb-1">最大取消次数</div>
                                                                    <el-input-number 
                                                                        v-model="sharingSettings.oneWayRestrictMaxCancels"
                                                                        :min="1" size="small"
                                                                        style="width: 100px"></el-input-number>
                                                                    <span class="text-xs text-gray-500 ml-1">次</span>
                                                                </div>
                                                                <div>
                                                                    <div class="text-xs text-gray-500 mb-1">禁止预约时长</div>
                                                                    <el-input-number 
                                                                        v-model="sharingSettings.oneWayRestrictBanMinutes"
                                                                        :min="1" size="small"
                                                                        style="width: 100px"></el-input-number>
                                                                    <span class="text-xs text-gray-500 ml-1">分钟</span>
                                                                </div>
                                                            </div>

                                                            <div 
                                                                class="bg-white rounded-lg p-4 border border-purple-200">
                                                                <div class="flex justify-between items-center mb-2">
                                                                    <span 
                                                                        class="text-xs font-medium text-gray-600">会员差异化设置</span>
                                                                    <el-button link type="primary" size="small"
                                                                        @click="sharingSettings.oneWayRestrictTiers.push({levels: [], window: 24, maxCancels: 5, banMinutes: 60})">+
                                                                        添加会员规则</el-button>
                                                                </div>
                                                                <el-table :data="sharingSettings.oneWayRestrictTiers"
                                                                    size="small" border>
                                                                    <el-table-column label="会员方案" min-width="180">
                                                                        <template #default="{row}">
                                                                            <el-select v-model="row.levels" multiple
                                                                                collapse-tags placeholder="选择会员方案"
                                                                                style="width: 100%">
                                                                                <el-option 
                                                                                    v-for="plan in membershipPlans"
                                                                                    :key="plan.id" :label="plan.name"
                                                                                    :value="plan.name"></el-option>
                                                                            </el-select>
                                                                        </template>
                                                                    </el-table-column>
                                                                    <el-table-column label="统计周期 (时)">
                                                                        <template #default="{row}">
                                                                            <el-input-number v-model="row.window"
                                                                                :min="1" :controls="false"
                                                                                style="width: 100%"></el-input-number>
                                                                        </template>
                                                                    </el-table-column>
                                                                    <el-table-column label="允许取消 (次)">
                                                                        <template #default="{row}">
                                                                            <el-input-number v-model="row.maxCancels"
                                                                                :min="1" :controls="false"
                                                                                style="width: 100%"></el-input-number>
                                                                        </template>
                                                                    </el-table-column>
                                                                    <el-table-column label="禁封时长 (分)">
                                                                        <template #default="{row}">
                                                                            <el-input-number v-model="row.banMinutes"
                                                                                :min="1" :controls="false"
                                                                                style="width: 100%"></el-input-number>
                                                                        </template>
                                                                    </el-table-column>
                                                                    <el-table-column label="操作" width="60">
                                                                        <template #default="{$index}">
                                                                            <el-button link type="danger"
                                                                                @click="sharingSettings.oneWayRestrictTiers.splice($index, 1)"><el-icon>
                                                                                    <Delete></Delete>
                                                                                </el-icon></el-button>
                                                                        </template>
                                                                    </el-table-column>
                                                                </el-table>
                                                            </div>
                                                        </div>
                                                    </section>

                                                    
                                                    <section v-if="canViewSharingRule('oneWayPreauth')" id="sharing-oneway-preauth"
                                                        class="sharing-rule-section bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
                                                        <div class="text-sm font-bold text-gray-700 mb-2">3. 预授权规则</div>
                                                        <p class="text-xs text-gray-500 mb-4">设定用车期间的资金冻结策略。</p>

                                                        <el-row :gutter="24">
                                                            <el-col :span="12">
                                                                <el-form-item label="默认冻结金额">
                                                                    <div class="flex items-center">
                                                                        <el-input-number 
                                                                            v-model="sharingSettings.oneWayPreAuthRentHours"
                                                                            :min="0"
                                                                            style="width: 120px"></el-input-number>
                                                                        <span class="text-gray-500 ml-2">小时的租金</span>
                                                                    </div>
                                                                    <div class="text-xs text-gray-400 mt-1">
                                                                        下单时预先冻结相当于此市场的租金</div>
                                                                </el-form-item>
                                                            </el-col>
                                                            <el-col :span="12">
                                                                <el-form-item label="循环预授权间隔">
                                                                    <div class="flex items-center">
                                                                        <el-input-number 
                                                                            v-model="sharingSettings.oneWayPreAuthCycleMinutes"
                                                                            :min="0" :step="60"
                                                                            style="width: 120px"></el-input-number>
                                                                        <span class="text-gray-500 ml-2">分钟</span>
                                                                    </div>
                                                                    <div class="text-xs text-gray-400 mt-1">
                                                                        用车期间每隔多久再次执行预授权</div>
                                                                </el-form-item>
                                                            </el-col>
                                                        </el-row>
                                                    </section>
                                                </el-form>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </main>
        </div>

        <el-dialog v-model="rentalRuleVersionDialogVisible" title="门市租车规则历史版本" width="880px" destroy-on-close>
            <div class="grid grid-cols-3 gap-4" v-if="selectedRentalRuleVersion">
                <div class="col-span-1 border border-gray-100 rounded-lg overflow-hidden">
                    <div class="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">版本列表</div>
                    <div class="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                        <button v-for="version in ruleVersionRecords" :key="version.version"
                            class="w-full text-left px-3 py-3 hover:bg-indigo-50 transition-colors"
                            :class="selectedRentalRuleVersion.version === version.version ? 'bg-indigo-50' : 'bg-white'"
                            @click="selectedRentalRuleVersion = version">
                            <div class="font-mono text-xs text-indigo-600 font-bold">{{ version.version }}</div>
                            <div class="text-sm text-gray-800 mt-1">{{ version.title }}</div>
                            <div class="text-xs text-gray-400 mt-1">{{ version.savedAt }} · {{ version.savedBy }}</div>
                        </button>
                    </div>
                </div>
                <div class="col-span-2 space-y-4">
                    <div class="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                        <div class="font-mono font-bold text-gray-900">{{ selectedRentalRuleVersion.version }}</div>
                        <div class="text-sm text-gray-700 mt-1">{{ selectedRentalRuleVersion.title }}</div>
                        <div class="text-xs text-gray-500 mt-1">保存人：{{ selectedRentalRuleVersion.savedBy }} · {{ selectedRentalRuleVersion.savedAt }}</div>
                    </div>
                    <el-descriptions :column="2" border size="small">
                        <el-descriptions-item label="版本名称">{{ selectedRentalRuleVersion.title }}</el-descriptions-item>
                        <el-descriptions-item label="快照时间">{{ selectedRentalRuleVersion.savedAt }}</el-descriptions-item>
                        <el-descriptions-item label="生效范围">门市租车全局配置</el-descriptions-item>
                        <el-descriptions-item label="来源页面">租赁业务规则</el-descriptions-item>
                    </el-descriptions>
                    <el-table :data="getRentalRuleSectionRows(selectedRentalRuleVersion)" border size="small">
                        <el-table-column prop="section" label="分组" width="160" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="label" label="规则项" width="190" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="value" label="设定值" min-width="320" show-overflow-tooltip></el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="rentalRuleVersionDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';

export default {
            setup() {
                // Mock Membership Plans
                const membershipPlans = ref([
                    { id: 1, name: '普通会员' },
                    { id: 2, name: '白银会员' },
                    { id: 3, name: '黄金会员' },
                    { id: 4, name: '铂金会员' },
                    { id: 5, name: '钻石会员' },
                    { id: 6, name: '企业会员' }
                ]);

                const settings = reactive({
                    // 交易与授权 - 线上
                    onlinePaymentEnabled: true,
                    onlinePaymentMethods: ['linepay', 'jkopay'],
                    // 交易与授权 - 线下
                    offlinePaymentEnabled: true,
                    offlinePaymentMethods: ['cash', 'card'],
                    pendingPaymentHoldEnabled: true,
                    pendingPaymentHoldMinutes: 30,
                    // 预授权
                    authorizationMode: 'percentage',
                    authorizationAmount: 3000,
                    authorizationPercent: 30,
                    authorizationHandlingModes: ['guarantee', 'rent_transfer'],
                    // 异地还车
                    crossCityFee: 200,
                    // 调度与派车
                    vehicleLockHours: 2,
                    orderIntervalMinutes: 60,
                    benchmarkDailyMileage: 150,
                    dispatchWeightMileage: 0,
                    dispatchWeightRevenue: 100,
                    dispatchWeightAge: 0,
                    // 时租与日租
                    hourlyToDailyThreshold: 5,
                    hourlyPriceMode: 'percentage',
                    hourlyPricePercentage: 10,
                    hourlyRatePrice: 50,
                    hourlyFixedPrice: 200,
                    // 取还车规则
                    allowEarlyPickup: true,
                    earlyPickupGraceMinutes: 30,
                    pickupLockEnabled: true,
                    pickupLockMinutes: 30,
                    allowEarlyReturn: true,
                    earlyReturnRefund: 'full_days',
                    // 未取车(No-show) - 更新的逻辑
                    noShowHoldHours: 2,
                    noShowAutoCancel: true,
                    noShowTargetStatus: 'no_show',
                    noShowPenaltyEnabled: true,
                    noShowPenaltyType: 'fixed',
                    noShowPenaltyFixed: 200,
                    noShowPenaltyPercent: 50,
                    // 免责取消（下单后限时）
                    freeCancelAfterOrderEnabled: true,
                    freeCancelAfterOrderMinutes: 30,
                    freeCancelAfterOrderUnit: 'minutes',
                    // 免责取消（取车前提前）
                    freeCancelBeforePickupEnabled: true,
                    freeCancelBeforePickupHours: 24,
                    // 免责取消退款
                    freeCancelRefund: 'full',
                    freeCancelFee: 50,
                    // 有责取消
                    penaltyCancelType: 'auth_percent',
                    penaltyCancelFixed: 200,
                    penaltyCancelPercent: 30,
                    penaltyCancelTiered: true,
                    penaltyCancelTiers: [
                        { hours: 24, amount: 200, percent: 20 },
                        { hours: 12, amount: 300, percent: 50 },
                        { hours: 2, amount: 500, percent: 100 }
                    ],
                    // 超时还车
                    overtimeGracePeriod: 30,
                    overtimePenaltyEnabled: true,
                    overtimePenaltyType: 'fixed',
                    overtimePenaltyAmount: 100,
                    overtimeMaxEnabled: true,
                    overtimeMaxAmount: 500,
                    // 续租规则
                    allowExtension: true,
                    allowOverdueExtension: true,
                    extensionConflictPolicy: 'reassign_or_reject',
                    extensionSettlementModes: ['immediate', 'return_settlement'],
                    extensionImmediateCollectHours: 24,
                    extensionImmediateCollectAmount: 1000,
                    extensionForceCollectRisk: true
                });

                // 卡片锁定状态管理
                const cardLocks = reactive({
                    transaction: true,
                    crossCity: true,
                    dispatch: true,
                    hourlyDaily: true,
                    pickupReturn: true,
                    cancellation: true,
                    extension: true
                });

                // Sharing Rental Settings
                const activeTab = ref('store');
                // TODO(real-api): 当前账号在租赁业务规则页的业务 tab 可见权限，后续应由后端按角色/账号权限返回。
                const rentalRuleTabPermissions = reactive({
                    store: true,
                    sharing: true
                });
                const rentalRuleTabs = [
                    { key: 'store', label: '门市租赁' },
                    { key: 'sharing', label: '分时租赁' }
                ];
                const canViewRentalRuleTab = (key) => rentalRuleTabPermissions[key] !== false;
                const visibleRentalRuleTabs = computed(() => rentalRuleTabs.filter(tab => canViewRentalRuleTab(tab.key)));
                const ensureActiveRentalRuleTab = () => {
                    if (!canViewRentalRuleTab(activeTab.value)) {
                        activeTab.value = visibleRentalRuleTabs.value[0]?.key || '';
                    }
                };
                watch(visibleRentalRuleTabs, ensureActiveRentalRuleTab, { immediate: true });
                // TODO(real-api): 当前账号在规则设置页的可见权限，后续应由后端按角色/账号权限返回。
                const rulePermissions = reactive({
                    store: {
                        transaction: true,
                        crossCity: true,
                        dispatch: true,
                        hourlyDaily: true,
                        pickupReturn: true,
                        cancellation: true,
                        extension: true
                    },
                    sharing: {
                        global: true,
                        roundTrip: true,
                        roundTripCancel: true,
                        roundTripOvertime: true,
                        roundTripPickup: true,
                        oneWay: true,
                        oneWayPickup: true,
                        oneWayRestrict: true,
                        oneWayPreauth: true
                    }
                });
                const storeRuleNav = [
                    { key: 'transaction', anchor: 'store-transaction', label: '交易与授权' },
                    { key: 'crossCity', anchor: 'store-cross-city', label: '异地还车' },
                    { key: 'dispatch', anchor: 'store-dispatch', label: '调度与派车' },
                    { key: 'hourlyDaily', anchor: 'store-hourly-daily', label: '时租与日租' },
                    { key: 'pickupReturn', anchor: 'store-pickup-return', label: '取还车规则' },
                    { key: 'cancellation', anchor: 'store-cancellation', label: '取消与超时' },
                    { key: 'extension', anchor: 'store-extension', label: '续租规则' }
                ];
                const sharingRuleNavGroups = [
                    {
                        label: '',
                        items: [
                            { key: 'global', anchor: 'sharing-global', label: '分时共用规则' }
                        ]
                    },
                    {
                        label: '同站租还',
                        items: [
                            { key: 'roundTrip', anchor: 'sharing-roundtrip', label: '规则总览' },
                            { key: 'roundTripCancel', anchor: 'sharing-roundtrip-cancel', label: '取消与违约' },
                            { key: 'roundTripOvertime', anchor: 'sharing-roundtrip-overtime', label: '超时规则' },
                            { key: 'roundTripPickup', anchor: 'sharing-roundtrip-pickup', label: '取还设置' }
                        ]
                    },
                    {
                        label: '甲租乙还',
                        items: [
                            { key: 'oneWay', anchor: 'sharing-oneway', label: '规则总览' },
                            { key: 'oneWayPickup', anchor: 'sharing-oneway-pickup', label: '预约保留时长' },
                            { key: 'oneWayRestrict', anchor: 'sharing-oneway-restrict', label: '爽约/取消限制' },
                            { key: 'oneWayPreauth', anchor: 'sharing-oneway-preauth', label: '预授权规则' }
                        ]
                    }
                ];
                const sharingRuleParents = {
                    roundTripCancel: 'roundTrip',
                    roundTripOvertime: 'roundTrip',
                    roundTripPickup: 'roundTrip',
                    oneWayPickup: 'oneWay',
                    oneWayRestrict: 'oneWay',
                    oneWayPreauth: 'oneWay'
                };
                const canViewStoreRule = (key) => rulePermissions.store[key] !== false;
                const canViewSharingRule = (key) => {
                    const parentKey = sharingRuleParents[key];
                    return rulePermissions.sharing[key] !== false && (!parentKey || rulePermissions.sharing[parentKey] !== false);
                };
                const visibleStoreRuleNav = computed(() => storeRuleNav.filter(item => canViewStoreRule(item.key)));
                const visibleSharingRuleNavGroups = computed(() => sharingRuleNavGroups
                    .map(group => ({
                        ...group,
                        items: group.items.filter(item => canViewSharingRule(item.key))
                    }))
                    .filter(group => group.items.length > 0));
                const scrollToRule = (anchor) => {
                    document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                };
                const sharingSettings = reactive({
                    // Global
                    preAuthMultiplier: 2.0,
                    lowFuelThreshold: 20,
                    lowFuelFee: 100,

                    // Round-trip Rules
                    // Cancellation - Free Rules
                    freeCancelBeforePickupHours: 24,
                    freeCancelBeforePickupEnabled: true,
                    freeCancelAfterOrderEnabled: true,
                    freeCancelAfterOrderMinutes: 15,
                    freeCancelAfterOrderUnit: 'minutes',
                    // Refund (Fixed to Full as per previous step, but prop might be needed if I didn't remove v-model entirely. 
                    // Previous HTML replacement REMOVED v-model for refund type. So I don't need it here.)

                    // Cancellation - Penalty (Strictly Tiered)
                    penaltyCancelTiers: [
                        { hours: 24, percent: 20 },
                        { hours: 4, percent: 50 },
                        { hours: 1, percent: 100 }
                    ],

                    // Temp Cancellation Ladder
                    tempCancelLadder: [], // { id, start, end, ratio, remark }

                    // Overtime Rules
                    hourlyToDailyThreshold: 5,
                    overtimeGracePeriod: 30,
                    overtimePenaltyEnabled: true,
                    // Overtime - Tiered Penalty
                    overtimePenaltyTiers: [
                        { minutes: 60, amount: 50 },
                        { minutes: 120, amount: 100 }
                    ],
                    overtimeMaxEnabled: true,
                    overtimeMaxAmount: 600,

                    // Early Pickup
                    earlyPickupMinutes: 15,

                    // Early Return
                    earlyReturnRefundRatio: 100, // % of remaining rent
                    earlyReturnRefundChannel: 'points', // 'original' or 'points'

                    // Customer Self-Cancel
                    allowCustomerCancel: true,
                    customerCancelLeadMinutes: 60, // How long before pickup
                    customerCancelAudit: false, // Need audit?

                    // Order Interval
                    orderIntervalBuffer: 30, // minutes between orders

                    // One-Way Rules (甲租乙还)
                    // 1. Pickup Validity (预约保留时长)
                    oneWayPickupDefaultMinutes: 30,
                    oneWayPickupTiers: [
                        { levels: ['白银会员', '黄金会员'], minutes: 45 }
                    ],

                    // 2. Booking Restriction (爽约限制)
                    oneWayRestrictEnabled: true,
                    oneWayRestrictWindow: 24, // hours
                    oneWayRestrictMaxCancels: 3,
                    oneWayRestrictBanMinutes: 120, // minutes
                    oneWayRestrictTiers: [], // { levels, window, maxCancels, banMinutes }

                    // 3. Pre-auth Rules (预授权)
                    oneWayPreAuthRentHours: 48, // Default freeze amount = N hours of rent
                    oneWayPreAuthCycleMinutes: 1440 // Cycle interval in minutes
                });

                const sharingCardLocks = reactive({
                    global: true,
                    roundTrip: true,
                    oneWay: true
                });

                // 备份初始数据（用于取消编辑时恢复）
                let originalSnapshot = JSON.stringify(settings);
                const buildCurrentStoreRuleSections = () => ([
                    {
                        title: '交易与授权',
                        desc: '设定门市租赁的支付方式和预授权策略。',
                        items: [
                            { label: '待支付资源保留', value: '开启' },
                            { label: '保留时长', value: '30 分钟' },
                            { label: '超时处理', value: '取消订单并释放库存' },
                            { label: '派车限制', value: '待支付不参与派车' },
                            { label: '线上交易', value: '启用（LINE Pay / 街口支付 / 绿界金流）' },
                            { label: '线下交易', value: '启用（现金 / 刷卡 POS / 转账）' },
                            { label: '授权额度模式', value: '租金比例模式' },
                            { label: '固定额度', value: '-' },
                            { label: '租金比例', value: '30%' },
                            { label: '取车资金处理口径', value: '履约担保 / 预授权转租金' },
                            { label: '企业月结口径', value: '不发起客户支付或预授权，最终费用进入企业账单' }
                        ]
                    },
                    {
                        title: '异地还车',
                        desc: '设定异地还车费用。',
                        items: [
                            { label: '异地还车费', value: '¥200/次' }
                        ]
                    },
                    {
                        title: '调度与派车',
                        desc: '车辆排程看板限制和智能派车权重配置。',
                        items: [
                            { label: '车辆排程看板锁定时间', value: '2 小时前锁定' },
                            { label: '订单间隔时间', value: '60 分钟' },
                            { label: '基准日均里程', value: '150 km/天' },
                            { label: '里程权重', value: '0%' },
                            { label: '营收权重', value: '100%' },
                            { label: '车龄权重', value: '0%' }
                        ]
                    },
                    {
                        title: '时租与日租',
                        desc: '时租转日租规则和不满日租定价。',
                        items: [
                            { label: '起租规则', value: '起租 24 小时' },
                            { label: '最小计费单位', value: '不足 1 小时按 1 小时' },
                            { label: '时租转日租时间', value: '第 5 小时起算 1 天' },
                            { label: '不满日租时的时租价格', value: '按日租百分比' },
                            { label: '每小时按日租', value: '10%' },
                            { label: '时租单价', value: '-' },
                            { label: '固定金额', value: '-' }
                        ]
                    },
                    {
                        title: '取还车规则',
                        desc: '提前取车、提前还车、未取车的处理规则。',
                        items: [
                            { label: '允许提前取车', value: '是' },
                            { label: '免费宽限时间', value: '30 分钟' },
                            { label: '启用履约操作锁', value: '是' },
                            { label: '锁有效期', value: '30 分钟' },
                            { label: '允许提前还车', value: '是' },
                            { label: '退款计算规则', value: '仅退还整天租金' },
                            { label: '保留车辆时长', value: '2 小时' },
                            { label: '自动释放资源', value: '是' },
                            { label: '处理后状态', value: '爽约' },
                            { label: '爽约违约金', value: '收取' },
                            { label: '爽约违约金计算方式', value: '固定金额' },
                            { label: '爽约违约金固定金额', value: '¥200' },
                            { label: '爽约违约金预授权比例', value: '-' }
                        ]
                    },
                    {
                        title: '取消与超时规则',
                        desc: '免责取消、有责取消条件及超时还车费用。',
                        items: [
                            { label: '下单后限时取消', value: '开启' },
                            { label: '下单后免责时限', value: '30 分钟' },
                            { label: '取车前提前取消', value: '开启' },
                            { label: '取车前免责时限', value: '24 小时' },
                            { label: '免责取消退款方式', value: '全额退款' },
                            { label: '免责取消手续费', value: '-' },
                            { label: '有责取消违约金计算方式', value: '预授权比例' },
                            { label: '有责取消固定金额', value: '-' },
                            { label: '有责取消预授权比例', value: '30%' },
                            { label: '是否阶梯扣费', value: '是' },
                            { label: '阶梯规则 1', value: '取车前 ≤24 小时扣 20%' },
                            { label: '阶梯规则 2', value: '取车前 ≤12 小时扣 50%' },
                            { label: '阶梯规则 3', value: '取车前 ≤2 小时扣 100%' },
                            { label: '超时免费宽限', value: '30 分钟' },
                            { label: '超时罚款', value: '开启' },
                            { label: '超时罚款类型', value: '固定金额' },
                            { label: '超时罚款数额', value: '¥100' },
                            { label: '超时费封顶', value: '开启' },
                            { label: '超时费封顶金额', value: '¥500' }
                        ]
                    },
                    {
                        title: '续租规则',
                        desc: '延长用车、逾期补办续租、库存冲突和费用处理。',
                        items: [
                            { label: '允许延长用车', value: '是' },
                            { label: '允许逾期补办续租', value: '是' },
                            { label: '后续订单冲突', value: '先改派后续订单，否则拒绝续租' },
                            { label: '可选结算方式', value: '立即收款 / 还车时结算' },
                            { label: '超过时长必须收款', value: '24 小时' },
                            { label: '超过金额必须收款', value: '¥1000' },
                            { label: '风险客户必须收款', value: '是' },
                            { label: '企业月结口径', value: '费用统一进入企业账单' }
                        ]
                    }
                ]);
                const buildLegacyStoreRuleSections = () => ([
                    {
                        title: '交易与授权',
                        desc: '旧版客户自付订单支付与预授权策略。',
                        items: [
                            { label: '待支付资源保留', value: '开启' },
                            { label: '保留时长', value: '20 分钟' },
                            { label: '超时处理', value: '取消订单并释放库存' },
                            { label: '派车限制', value: '待支付不参与派车' },
                            { label: '线上交易', value: '启用（LINE Pay / 街口支付 / 绿界金流）' },
                            { label: '线下交易', value: '启用，需补凭证' },
                            { label: '授权额度模式', value: '租金比例模式' },
                            { label: '固定额度', value: '-' },
                            { label: '租金比例', value: '30%' },
                            { label: '取车资金处理口径', value: '履约担保 / 预授权转租金' },
                            { label: '企业月结口径', value: '不发起客户支付或预授权，最终费用进入企业账单' }
                        ]
                    },
                    {
                        title: '异地还车',
                        desc: '旧版异地还车费用。',
                        items: [
                            { label: '异地还车费', value: '¥200/次' }
                        ]
                    },
                    {
                        title: '调度与派车',
                        desc: '旧版车辆派车评分规则。',
                        items: [
                            { label: '车辆排程看板锁定时间', value: '2 小时前锁定' },
                            { label: '订单间隔时间', value: '60 分钟' },
                            { label: '基准日均里程', value: '150 km/天' },
                            { label: '里程权重', value: '0%' },
                            { label: '营收权重', value: '100%' },
                            { label: '车龄权重', value: '0%' }
                        ]
                    },
                    {
                        title: '时租与日租',
                        desc: '旧版不足整日租期计费规则。',
                        items: [
                            { label: '起租规则', value: '起租 24 小时' },
                            { label: '最小计费单位', value: '不足 1 小时按 1 小时' },
                            { label: '时租转日租时间', value: '第 5 小时起算 1 天' },
                            { label: '不满日租时的时租价格', value: '按日租百分比' },
                            { label: '每小时按日租', value: '10%' },
                            { label: '时租单价', value: '-' },
                            { label: '固定金额', value: '-' }
                        ]
                    },
                    {
                        title: '取还车规则',
                        desc: '旧版取还车与爽约处理规则。',
                        items: [
                            { label: '允许提前取车', value: '是' },
                            { label: '免费宽限时间', value: '30 分钟' },
                            { label: '启用履约操作锁', value: '是' },
                            { label: '锁有效期', value: '30 分钟' },
                            { label: '允许提前还车', value: '是' },
                            { label: '退款计算规则', value: '仅退还整天租金' },
                            { label: '保留车辆时长', value: '2 小时' },
                            { label: '自动释放资源', value: '是' },
                            { label: '处理后状态', value: '爽约' },
                            { label: '爽约违约金', value: '收取' },
                            { label: '爽约违约金计算方式', value: '固定金额' },
                            { label: '爽约违约金固定金额', value: '¥200' },
                            { label: '爽约违约金预授权比例', value: '-' }
                        ]
                    },
                    {
                        title: '取消与超时规则',
                        desc: '旧版取消与超时费用规则。',
                        items: [
                            { label: '下单后限时取消', value: '开启' },
                            { label: '下单后免责时限', value: '30 分钟' },
                            { label: '取车前提前取消', value: '开启' },
                            { label: '取车前免责时限', value: '24 小时' },
                            { label: '免责取消退款方式', value: '全额退款' },
                            { label: '免责取消手续费', value: '-' },
                            { label: '有责取消违约金计算方式', value: '固定金额' },
                            { label: '有责取消固定金额', value: '¥200' },
                            { label: '有责取消预授权比例', value: '-' },
                            { label: '是否阶梯扣费', value: '未启用' },
                            { label: '超时免费宽限', value: '30 分钟' },
                            { label: '超时罚款', value: '开启' },
                            { label: '超时罚款类型', value: '固定金额' },
                            { label: '超时罚款数额', value: '¥100' },
                            { label: '超时费封顶', value: '开启' },
                            { label: '超时费封顶金额', value: '¥500' }
                        ]
                    },
                    {
                        title: '续租规则',
                        desc: '旧版续租与结算口径。',
                        items: [
                            { label: '允许延长用车', value: '是' },
                            { label: '允许逾期补办续租', value: '是' },
                            { label: '后续订单冲突', value: '先改派后续订单，否则拒绝续租' },
                            { label: '可选结算方式', value: '立即收款 / 还车时结算' },
                            { label: '超过时长必须收款', value: '24 小时' },
                            { label: '超过金额必须收款', value: '¥1000' },
                            { label: '风险客户必须收款', value: '是' },
                            { label: '企业月结口径', value: '费用统一进入企业账单' }
                        ]
                    }
                ]);
                const ruleVersionRecords = ref([
                    {
                        version: 'RULE-STORE-20260418-002',
                        title: '当前门市租车全局规则',
                        savedBy: '运营管理员',
                        savedAt: '2026-04-18 12:10',
                        sections: buildCurrentStoreRuleSections()
                    },
                    {
                        version: 'RULE-STORE-20260401-001',
                        title: '4月门市租车默认规则',
                        savedBy: '运营主管',
                        savedAt: '2026-04-01 09:00',
                        sections: buildLegacyStoreRuleSections()
                    }
                ]);
                const rentalRuleVersionDialogVisible = ref(false);
                const selectedRentalRuleVersion = ref(null);
                const openRentalRuleVersion = (version) => {
                    selectedRentalRuleVersion.value = version || ruleVersionRecords.value[0];
                    rentalRuleVersionDialogVisible.value = true;
                };
                const getRentalRuleSectionRows = (version) => (version?.sections || []).flatMap(section =>
                    (section.items || []).map(item => ({
                        section: section.title,
                        label: item.label,
                        value: item.value
                    }))
                );

                // 解锁卡片
                const unlockCard = (key) => {
                    cardLocks[key] = false;
                };

                // 保存卡片设置
                const saveCard = (key) => {
                    cardLocks[key] = true;
                    originalSnapshot = JSON.stringify(settings); // 更新备份
                    ElMessage.success('设置已保存');
                };

                // 取消编辑
                const cancelCard = (key) => {
                    Object.assign(settings, JSON.parse(originalSnapshot)); // 恢复备份
                    cardLocks[key] = true;
                    ElMessage.info('已取消编辑，变更未保存');
                };

                const saveSettings = () => {
                    originalSnapshot = JSON.stringify(settings);
                    ElMessage.success('所有设置已保存');
                };

                const getTierStart = (tiers, index, key, firstStart = 0) => {
                    if (!Array.isArray(tiers) || index < 0 || !tiers[index]) return 0;

                    const firstValue = Number(tiers[0]?.[key] || 0);
                    const lastValue = Number(tiers[tiers.length - 1]?.[key] || 0);
                    const isDescending = firstValue > lastValue;

                    if (isDescending) {
                        return index < tiers.length - 1 ? Number(tiers[index + 1]?.[key] || 0) : 0;
                    }

                    return index > 0 ? Number(tiers[index - 1]?.[key] || 0) : Number(firstStart || 0);
                };

                return {
                    settings,
                    cardLocks,
                    unlockCard,
                    saveCard,
                    cancelCard,
                    saveSettings,
                    sharingSettings,
                    sharingCardLocks,
                    activeTab,
                    membershipPlans,
                    getTierStart,
                    rentalRuleTabPermissions,
                    ruleVersionRecords,
                    rentalRuleVersionDialogVisible,
                    selectedRentalRuleVersion,
                    openRentalRuleVersion,
                    getRentalRuleSectionRows,
                    visibleRentalRuleTabs,
                    canViewRentalRuleTab,
                    rulePermissions,
                    visibleStoreRuleNav,
                    visibleSharingRuleNavGroups,
                    canViewStoreRule,
                    canViewSharingRule,
                    scrollToRule
                };
            }
        };
</script>

<style scoped>
        .settings-page {
            min-height: 100%;
        }

        .settings-card {
            transition: all 0.2s;
        }

        .settings-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .store-rule-nav {
            position: sticky;
            top: 16px;
            z-index: 10;
            max-height: calc(100vh - 140px);
            overflow-y: auto;
        }

        .store-rule-section {
            scroll-margin-top: 24px;
        }

        .sharing-rule-nav {
            position: sticky;
            top: 16px;
            z-index: 10;
            max-height: calc(100vh - 140px);
            overflow-y: auto;
        }

        .sharing-rule-section {
            scroll-margin-top: 24px;
        }

        .rule-nav-link:hover,
        .rule-nav-link:focus {
            background: #eef8fc;
            color: var(--app-color-primary);
        }

        .settings-main-tabs > :deep(.el-tabs__content) {
            overflow: visible;
        }

        .settings-main-tabs > :deep(.el-tabs__header) {
            padding: 0 24px;
            margin: 0;
        }

        .settings-main-tabs > :deep(.el-tabs__header .el-tabs__nav-wrap::after) {
            height: 1px;
            background-color: #eef2f7;
        }

        .settings-main-tabs > :deep(.el-tabs__header .el-tabs__item) {
            padding: 0 18px;
            height: 44px;
            color: #6b7280;
            font-weight: 600;
        }

        .settings-main-tabs > :deep(.el-tabs__header .el-tabs__item:first-child) {
            padding-left: 0;
        }

        .settings-main-tabs > :deep(.el-tabs__header .el-tabs__item.is-active) {
            color: var(--app-color-primary);
        }

        .settings-main-tabs > :deep(.el-tabs__header .el-tabs__active-bar) {
            background-color: var(--app-color-primary);
            height: 3px;
            border-radius: 999px;
        }

        #sharing-roundtrip .bg-green-50,
        #sharing-roundtrip .bg-red-50,
        #sharing-roundtrip .bg-orange-50 {
            background: #f0fdfa !important;
        }

        #sharing-roundtrip .border-green-100,
        #sharing-roundtrip .border-green-200,
        #sharing-roundtrip .border-red-100,
        #sharing-roundtrip .border-red-200,
        #sharing-roundtrip .border-orange-100,
        #sharing-roundtrip .border-orange-200 {
            border-color: #99f6e4 !important;
        }
</style>
