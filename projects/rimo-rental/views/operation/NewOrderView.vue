<template>
<div class="new-order-page relative">
            
            

            
            <main class="relative z-0">
                <div class="w-full mx-auto">

                    
                    <div class="mb-4">
                        <el-button @click="goBack" :icon="ArrowLeft" plain>返回</el-button>
                    </div>

                    <div class="grid grid-cols-12 gap-5 items-start">

                        
                        <div class="col-span-9 space-y-4">

                            
                            <div class="grid grid-cols-2 gap-4">
                                <el-card shadow="never" class="!border-gray-200 !rounded-lg h-full flex flex-col"
                                    body-class="!p-4 flex-1">
                                    <template #header>
                                        <div 
                                            class="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50">
                                            <el-icon class="text-indigo-600">
                                                <User></User>
                                            </el-icon> 客户信息
                                        </div>
                                    </template>
                                    <div class="block">
                                        <el-form label-position="top" size="default">
                                            <el-select v-model="selectedCustomerId" placeholder="搜索客户 (姓名/手机)"
                                                filterable class="w-full mb-3" @change="handleCustomerSelect">
                                                <el-option v-for="c in customers" :key="c.id"
                                                    :label="c.name + ' (' + c.phone + ')'" :value="c.id">
                                                    <div class="flex justify-between items-center text-sm">
                                                        <span>{{ c.name }}</span>
                                                        <span class="text-gray-400 text-xs">{{ c.phone }}</span>
                                                    </div>
                                                </el-option>
                                            </el-select>

                                            <div v-if="currentCustomer" class="space-y-3">
                                                <div 
                                                    class="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                                                    <div>
                                                        <div class="font-bold text-gray-900 text-sm">{{
                                                            currentCustomer.name }}</div>
                                                        <div class="text-xs text-gray-500">{{ currentCustomer.phone }}
                                                        </div>
                                                    </div>
                                                    <div class="text-right">
                                                        <el-tag size="small" :type="currentCustomer.levelType"
                                                            effect="plain">{{ currentCustomer.levelName }}</el-tag>
                                                    </div>
                                                </div>


                                                
                                                <div 
                                                    class="bg-gray-100 p-1 rounded-lg grid grid-cols-2 gap-1 border border-gray-200">
                                                    <div @click="reservationType = 'personal'"
                                                        class="cursor-pointer text-center py-1.5 text-xs font-bold rounded-md transition-all duration-200"
                                                        :class="reservationType === 'personal' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'">
                                                        个人预订
                                                    </div>
                                                    <div @click="currentCustomer.enterprise && (reservationType = 'enterprise')"
                                                        class="cursor-pointer text-center py-1.5 text-xs font-bold rounded-md transition-all duration-200 relative select-none"
                                                        :class="[
                                                            reservationType === 'enterprise' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700',
                                                            !currentCustomer.enterprise ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                                                         ]">
                                                        企业预订
                                                    </div>
                                                </div>

                                                <div v-if="reservationType === 'enterprise' && currentCustomer.enterprise"
                                                    class="text-xs text-indigo-600 bg-indigo-50 p-2 rounded text-center flex items-center justify-center gap-1 border border-indigo-100">
                                                    <el-icon>
                                                        <OfficeBuilding></OfficeBuilding>
                                                    </el-icon> {{ currentCustomer.enterprise.name }}
                                                </div>
                                                <div v-if="reservationType === 'enterprise' && currentCustomer.enterprise"
                                                    class="text-[11px] leading-4 text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                                                    {{ collectionMode === 'monthly' ? '企业月结订单不发起支付或预授权，费用进入企业账单。' : '非月结企业预订使用企业资格行销方案，费用由客户本人支付，不支持优惠券和积分。' }}
                                                </div>
                                            </div>
                                            <div v-else
                                                class="text-xs text-gray-400 text-center py-4 border border-dashed rounded bg-gray-50">
                                                请先选择客户
                                            </div>
                                        </el-form>
                                    </div>
                                </el-card>

                                <el-card shadow="never" class="!border-gray-200 !rounded-lg h-full flex flex-col"
                                    body-class="!p-0 flex-1">
                                    <template #header>
                                        <div 
                                            class="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50">
                                            <el-icon class="text-indigo-600">
                                                <Calendar></Calendar>
                                            </el-icon> 用车信息
                                        </div>
                                    </template>
                                    <div class="p-4 space-y-3">
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1">取车门店</div>
                                                <el-select v-model="rentalData.pickupLocation" class="w-full"
                                                    size="default">
                                                    <el-option label="新北总店" value="store_main"></el-option>
                                                    <el-option label="台北车站店" value="store_station"></el-option>
                                                </el-select>
                                            </div>
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1">取车时间</div>
                                                <el-date-picker v-model="rentalData.pickupTime" type="datetime"
                                                    placeholder="选择时间" class="w-full" style="width: 100%"
                                                    size="default" @change="handlePickupTimeChange"></el-date-picker>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-2 gap-3">
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1">还车门店</div>
                                                <el-select v-model="rentalData.returnLocation" class="w-full"
                                                    size="default">
                                                    <el-option label="新北总店" value="store_main"></el-option>
                                                    <el-option label="台北车站店" value="store_station"></el-option>
                                                </el-select>
                                            </div>
                                            <div>
                                                <div class="text-xs text-gray-500 mb-1">还车时间</div>
                                                <el-date-picker v-model="rentalData.returnTime" type="datetime"
                                                    placeholder="选择时间" class="w-full" style="width: 100%"
                                                    size="default"></el-date-picker>
                                            </div>
                                        </div>
                                        <div class="text-xs bg-indigo-50 text-indigo-700 px-3 py-2 rounded border border-indigo-100">
                                            预计租期：<span class="font-bold">{{ rentalDurationLabel }}</span>，计费：<span 
                                                class="font-bold">{{ rentalBillingLabel }}</span>，按当前车组标准价试算。
                                        </div>
                                    </div>
                                </el-card>
                            </div>

                            
                            <el-card shadow="never" class="!border-gray-200 !rounded-lg" body-class="!p-0">
                                <template #header>
                                    <div 
                                        class="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50">
                                        <el-icon class="text-indigo-600">
                                            <Van></Van>
                                        </el-icon> 车组选择
                                    </div>
                                </template>
                                <div class="p-4">
                                    <div class="grid grid-cols-4 gap-3">
                                        <div v-for="group in vehicleGroups" :key="group.id"
                                            @click="selectVehicleGroup(group)"
                                            class="cursor-pointer border rounded-lg p-3 relative hover:shadow-md transition-all duration-200 group bg-white"
                                            :class="[
                                                selectedGroupId === group.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-gray-200 hover:border-indigo-300',
                                                group.available <= 0 ? 'opacity-50 cursor-not-allowed bg-gray-50 hover:shadow-none hover:border-gray-200' : ''
                                            ]">

                                            <div class="flex justify-between items-start mb-1">
                                                <div class="font-bold text-gray-800 text-sm truncate pr-2">{{ group.name
                                                    }}</div>
                                                <el-tag size="small" :type="group.available > 0 ? 'success' : 'danger'" effect="light"
                                                    class="!px-1 !h-5 !text-[10px]">
                                                    {{ group.available > 0 ? '剩' + group.available : '无库存' }}
                                                </el-tag>
                                            </div>
                                            <div class="text-xs text-gray-500 truncate mb-2" :title="group.desc">{{
                                                group.desc }}</div>

                                            <div class="flex items-end justify-between">
                                                <div class="text-indigo-600 font-bold">
                                                    <span class="text-sm"></span>{{ group.price }}<span 
                                                        class="text-xs font-normal text-gray-400">/天</span>
                                                </div>
                                                <div class="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center transition-colors"
                                                    :class="{'bg-indigo-600 border-indigo-600': selectedGroupId === group.id}">
                                                    <el-icon v-if="selectedGroupId === group.id"
                                                        class="text-white text-xs scale-75">
                                                        <Check></Check>
                                                    </el-icon>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-card>

                            
                            <el-card shadow="never" class="!border-gray-200 !rounded-lg" body-class="!p-0">
                                <template #header>
                                    <div 
                                        class="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-gray-100 bg-gray-50/50">
                                        <el-icon class="text-indigo-600">
                                            <Goods></Goods>
                                        </el-icon> 增值服务
                                    </div>
                                </template>
                                <div class="p-0">
                                    <div class="grid grid-cols-2 divide-x divide-gray-100">
                                        <div v-for="(service, index) in services" :key="service.id"
                                            class="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100"
                                            :class="{'bg-indigo-50/30': service.selected}">
                                            <div class="flex items-center gap-3">
                                                <el-checkbox v-model="service.selected" @change="calculateTotal"
                                                    size="default">
                                                    <span class="text-sm text-gray-700 font-medium">{{ service.name
                                                        }}</span>
                                                </el-checkbox>
                                            </div>
                                            <div class="flex items-center gap-3">
                                                <div class="text-gray-900 font-bold text-sm">{{ service.price }}</div>
                                                <el-input-number v-if="service.maxQuantity > 1"
                                                    v-model="service.quantity" :min="1" :max="service.maxQuantity"
                                                    size="small" controls-position="right" class="!w-20"
                                                    :disabled="!service.selected" @change="calculateTotal" ></el-input-number>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </el-card>

                        </div>

                        
                        <div class="col-span-3">
                            <div class="sticky-summary space-y-4">

                                
                                <el-card shadow="hover" class="!border-indigo-100 !rounded-lg" body-class="!p-0">
                                    <template #header>
                                        <div 
                                            class="font-bold text-gray-800 flex items-center gap-2 text-base px-4 h-[45px] border-b border-indigo-50 bg-indigo-50/20">
                                            <el-icon class="text-indigo-600">
                                                <Ticket></Ticket>
                                            </el-icon> 优惠与折扣
                                        </div>
                                    </template>
                                    <div class="p-4 space-y-4">
                                        
                                        <div class="space-y-1">
                                            <div class="text-xs font-bold text-gray-600">行销优惠方案</div>
                                            <el-select v-model="selectedMarketingPlanId" size="default" class="w-full"
                                                @change="calculateTotal" :disabled="!currentCustomer">
                                                <el-option label="不使用方案" value="none"></el-option>
                                                <el-option v-for="p in availableMarketingPlans" :key="p.id"
                                                    :label="formatMarketingPlanLabel(p)"
                                                    :value="p.id">
                                                    <div class="flex items-center justify-between gap-3">
                                                        <span>{{ formatMarketingPlanLabel(p) }}</span>
                                                        <el-tag v-if="p.manualVerification" size="small" type="warning"
                                                            effect="plain">取车核验</el-tag>
                                                    </div>
                                                </el-option>
                                            </el-select>
                                            <div class="text-[11px] text-gray-400 leading-4">
                                                {{ currentCustomer ? marketingPlanEligibilityLabel : '选择客户后展示可用方案' }}
                                            </div>
                                            <div v-if="selectedMarketingPlan && selectedMarketingPlan.manualVerification"
                                                class="text-[11px] text-amber-600 leading-4 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                                                该方案需取车时现场核验 {{ selectedMarketingPlan.qualificationName }}，未通过时门店会更换方案并重新计算费用。
                                            </div>
                                        </div>

                                        
                                        <div v-if="canUsePersonalBenefits" class="space-y-2">
                                            <div class="text-xs font-bold text-gray-600">优惠券</div>
                                            <div class="flex gap-2">
                                                <el-select v-model="selectedCouponId" placeholder="选择优惠券" size="default"
                                                    class="w-full" @change="calculateTotal" clearable
                                                    :disabled="!currentCustomer">
                                                    <el-option v-for="coupon in customerCoupons" :key="coupon.id"
                                                        :label="coupon.name" :value="coupon.id">
                                                        <span class="float-left text-sm">{{ coupon.name }}</span>
                                                        <span class="float-right text-gray-400 text-xs">{{ coupon.desc
                                                            }}</span>
                                                    </el-option>
                                                </el-select>

                                                
                                                <el-button :icon="showRedeemInput ? 'Minus' : 'Plus'" circle
                                                    size="default" @click="showRedeemInput = !showRedeemInput"
                                                    plain></el-button>
                                            </div>

                                            
                                            <div v-if="showRedeemInput" class="flex gap-2 animate-fade-in">
                                                <el-input v-model="redeemCode" placeholder="输入优惠码兑换" size="default"
                                                    class="flex-1"></el-input>
                                                <el-button @click="redeemCoupon" size="default" plain
                                                    class="!px-4">兑换</el-button>
                                            </div>
                                        </div>

                                        
                                        <div v-if="canUsePersonalBenefits" class="space-y-1">
                                            <div class="flex justify-between items-center">
                                                <div class="text-xs text-gray-600 font-bold">积分抵扣 <span 
                                                        class="font-normal text-gray-400">(余{{ currentCustomer ?
                                                        currentCustomer.points : 0 }})</span></div>


                                            </div>
                                            <div class="flex items-center gap-2">
                                                <el-input-number v-model="pointsUsed" :min="0"
                                                    :max="currentCustomer ? currentCustomer.points : 0" :step="100"
                                                    size="default" class="!w-full" :disabled="!currentCustomer"
                                                    controls-position="right" @change="calculateTotal">
                                                </el-input-number>
                                                <div 
                                                    class="text-orange-500 font-bold text-sm w-16 text-right whitespace-nowrap">
                                                    -{{ pointsAmount }}</div>
                                            </div>
                                        </div>
                                        <div v-else class="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-xs text-indigo-700 leading-5">
                                            企业身份订单只使用企业资格行销方案，不支持优惠券、兑换码和积分抵扣。
                                        </div>
                                    </div>
                                </el-card>

                                
                                <el-card shadow="hover" class="!border-indigo-100 !bg-slate-50/50 !rounded-lg"
                                    body-class="!p-0">
                                    <template #header>
                                        <div 
                                            class="font-bold text-gray-900 text-base px-4 h-[45px] flex items-center border-b border-indigo-100">
                                            费用明细</div>
                                    </template>
                                    <div class="p-4">
                                        <div class="space-y-2 text-sm">
                                            <div class="flex justify-between text-gray-600">
                                                <span>租金 ({{ rentalBillingLabel }})</span>
                                                <span class="font-medium">{{ baseRentalTotal }}</span>
                                            </div>

                                            
                                            <template v-if="services.some(s => s.selected)">
                                                <div class="text-xs font-bold text-gray-400 mt-2 mb-1">增值服务</div>
                                                <div v-for="service in services" :key="service.id">
                                                    <div v-if="service.selected"
                                                        class="flex justify-between text-gray-600 pl-2">
                                                        <span>
                                                            {{ service.name }}
                                                            <span v-if="service.quantity > 1"
                                                                class="text-xs text-gray-400">x{{ service.quantity
                                                                }}</span>
                                                        </span>
                                                        <span class="font-medium">{{ calculateServicePrice(service)
                                                            }}</span>
                                                    </div>
                                                </div>
                                            </template>
                                            <div v-if="discountAmount > 0 || couponAmount > 0 || pointsAmount > 0"
                                                class="border-t border-dashed border-gray-200 my-2 pt-2">
                                                <div class="flex justify-between text-green-600 text-xs"
                                                    v-if="discountAmount > 0">
                                                    <span>行销优惠方案</span>
                                                    <span>- {{ discountAmount }}</span>
                                                </div>
                                                <div class="flex justify-between text-green-600 text-xs"
                                                    v-if="couponAmount > 0">
                                                    <span>优惠券</span>
                                                    <span>- {{ couponAmount }}</span>
                                                </div>
                                                <div class="flex justify-between text-orange-500 text-xs"
                                                    v-if="pointsAmount > 0">
                                                    <span>积分</span>
                                                    <span>- {{ pointsAmount }}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="border-t border-gray-200 mt-4 pt-3">
                                            <div class="flex justify-between items-baseline">
                                                <span class="text-gray-600 text-sm">总计</span>
                                                <span class="text-2xl font-bold text-indigo-600">{{ finalTotal
                                                    }}</span>
                                            </div>
                                            
                                            <div 
                                                class="mt-2 flex items-center justify-between text-xs bg-blue-50 text-blue-700 px-2 py-1.5 rounded border border-blue-100">
                                                <span>车组押金标准</span>
                                                <span class="font-bold">{{ depositAmount }}</span>
                                            </div>
                                        </div>

                                        <el-button type="primary" size="large"
                                            class="w-full mt-4 !rounded-lg !h-10 !text-base !font-bold shadow-lg shadow-theme-primary/20"
                                            @click="submitOrder">
                                            创建订单
                                        </el-button>
                                    </div>
                                </el-card>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            
            <el-dialog v-model="paymentDialogVisible"
                :title="collectionMode === 'monthly' ? '创建企业月结订单' : (collectionMode === 'pending' ? '创建待支付订单' : '添加预授权押金')" width="500px" destroy-on-close top="15vh"
                class="rounded-xl overflow-hidden" :close-on-click-modal="false">
                <div class="p-1">
                    
                    <div class="mb-5">
                        <div class="text-sm font-medium text-gray-700 mb-2">收款模式</div>
                        <div class="grid grid-cols-3 gap-2">
                            <div class="p-3 rounded-lg border cursor-pointer text-center transition-all"
                                :class="collectionMode === 'deposit' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-orange-200'"
                                @click="setCollectionMode('deposit')">
                                <div class="font-bold text-sm">预授权押金</div>
                                <div class="text-xs mt-1">按规则配置</div>
                            </div>
                            <div class="p-3 rounded-lg border cursor-pointer text-center transition-all"
                                :class="collectionMode === 'pending' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-red-200'"
                                @click="setCollectionMode('pending')">
                                <div class="font-bold text-sm">暂不收款</div>
                                <div class="text-xs mt-1">生成待支付</div>
                            </div>
                            <div class="p-3 rounded-lg border text-center transition-all"
                                :class="[
                                    collectionMode === 'monthly' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600',
                                    reservationType !== 'enterprise' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-purple-200'
                                ]"
                                @click="setCollectionMode('monthly')">
                                <div class="font-bold text-sm">企业月结</div>
                                <div class="text-xs mt-1">本次不收款</div>
                            </div>
                        </div>
                    </div>

                    <template v-if="collectionMode === 'deposit'">
                        
                        <div class="rounded-lg border border-blue-100 bg-blue-50 text-blue-700 text-sm px-3 py-2 mb-5">
                            本期下单预授权押金仅支持线上预授权，不支持现金押金、线下押金或仅登记线下凭证。
                        </div>

                        
                        <div v-if="paymentDialogType === 'online'" class="space-y-4">
                            <div class="text-sm font-medium text-gray-700 mb-2">选择支付渠道</div>
                            <div class="grid grid-cols-2 gap-3">
                                
                                <div class="p-4 rounded-xl border-2 cursor-pointer transition-all relative"
                                    :class="newPayment.gateway === 'jiekou' ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                                    @click="newPayment.gateway = 'jiekou'">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <span class="text-orange-500 text-lg font-bold">街</span>
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-800">街口支付</div>
                                            <div class="text-xs text-gray-400">线上扫码</div>
                                        </div>
                                    </div>
                                    <div v-if="newPayment.gateway === 'jiekou'" class="absolute top-2 right-2">
                                        <el-icon class="text-orange-500">
                                            <CircleCheck></CircleCheck>
                                        </el-icon>
                                    </div>
                                </div>

                                
                                <div class="p-4 rounded-xl border-2 cursor-pointer transition-all relative"
                                    :class="newPayment.gateway === 'credit_card' ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                                    @click="newPayment.gateway = 'credit_card'">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                            <el-icon class="text-indigo-500 text-lg">
                                                <CreditCard></CreditCard>
                                            </el-icon>
                                        </div>
                                        <div>
                                            <div class="font-medium text-gray-800">信用卡</div>
                                            <div class="text-xs text-gray-400">用户绑定卡</div>
                                        </div>
                                    </div>
                                    <div v-if="newPayment.gateway === 'credit_card'" class="absolute top-2 right-2">
                                        <el-icon class="text-indigo-500">
                                            <CircleCheck></CircleCheck>
                                        </el-icon>
                                    </div>
                                </div>
                            </div>

                            
                            <div v-if="newPayment.gateway === 'credit_card'"
                                class="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div class="text-sm font-medium text-gray-700 mb-3">选择信用卡</div>
                                <div class="space-y-2">
                                    <div v-for="card in userCreditCards" :key="card.id"
                                        class="p-3 bg-white rounded-lg border-2 cursor-pointer transition-all flex justify-between items-center"
                                        :class="selectedCreditCard === card.id ? 'border-indigo-500 shadow-sm' : 'border-gray-100 hover:border-gray-300'"
                                        @click="selectedCreditCard = card.id">
                                        <div class="flex items-center gap-3">
                                            <div class="w-8 h-8 rounded flex items-center justify-center"
                                                :class="card.brand === 'Visa' ? 'bg-blue-100' : 'bg-orange-100'">
                                                <span class="text-xs font-bold"
                                                    :class="card.brand === 'Visa' ? 'text-blue-600' : 'text-orange-600'">
                                                    {{ card.brand.substring(0, 2) }}
                                                </span>
                                            </div>
                                            <div>
                                                <div class="font-mono text-gray-800">**** **** **** {{ card.last4 }}</div>
                                                <div class="text-xs text-gray-400">有效期: {{ card.expiry }}</div>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <el-tag v-if="card.isDefault" size="small" type="success"
                                                effect="plain">默认卡</el-tag>
                                            <el-icon v-if="selectedCreditCard === card.id" class="text-indigo-500">
                                                <CircleCheck></CircleCheck>
                                            </el-icon>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        
                        <div v-else-if="false" class="space-y-4">
                            <div class="text-sm font-medium text-gray-700 mb-2">选择收款方式</div>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="p-4 rounded-xl border-2 cursor-pointer transition-all text-center"
                                    :class="newPayment.gateway === 'cash' ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                                    @click="newPayment.gateway = 'cash'">
                                    <el-icon class="text-2xl mb-2"
                                        :class="newPayment.gateway === 'cash' ? 'text-green-500' : 'text-gray-400'">
                                        <Money></Money>
                                    </el-icon>
                                    <div class="text-sm font-medium"
                                        :class="newPayment.gateway === 'cash' ? 'text-green-700' : 'text-gray-600'">现金</div>
                                </div>
                                <div class="p-4 rounded-xl border-2 cursor-pointer transition-all text-center"
                                    :class="newPayment.gateway === 'transfer' ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'"
                                    @click="newPayment.gateway = 'transfer'">
                                    <el-icon class="text-2xl mb-2"
                                        :class="newPayment.gateway === 'transfer' ? 'text-purple-500' : 'text-gray-400'">
                                        <BankCard></BankCard>
                                    </el-icon>
                                    <div class="text-sm font-medium"
                                        :class="newPayment.gateway === 'transfer' ? 'text-purple-700' : 'text-gray-600'">转账
                                    </div>
                                </div>
                            </div>

                            
                            <div class="mt-4">
                                <div class="text-sm font-medium text-gray-700 mb-2">凭证单号 (可选)</div>
                                <el-input v-model="newPayment.refNo" placeholder="输入收款凭证号..." size="large"></el-input>
                            </div>
                        </div>

                        
                        <div 
                            class="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                            <div class="flex justify-between items-center mb-3">
                                <span class="text-sm font-medium text-gray-700">本次预授权金额</span>
                                <span class="text-xs text-gray-400">订单总额: {{ formatNumber(finalTotal) }}</span>
                            </div>
                            <el-input-number v-model="newPayment.amount" :min="0" :max="depositPayAmount" :controls="false"
                                class="w-full" size="large" :precision="0" disabled>
                                <template #prefix>
                                    <span class="text-gray-400 font-mono"></span>
                                </template>
                            </el-input-number>
                            <div class="text-xs text-indigo-500 mt-2">
                                {{ preAuthRuleText }}，剩余租金在取车时补足，还车只处理差额结算。
                            </div>
                        </div>
                    </template>

                    <div v-else-if="collectionMode === 'pending'" class="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
                        暂不收款模式下，本次创建订单不发起预授权。订单创建后状态为“待支付”，支付状态为“未支付”，车组库存保留30分钟；超时未完成预授权时自动取消并释放库存。
                    </div>

                    <div v-else class="p-4 bg-purple-50 border border-purple-100 rounded-xl text-sm text-purple-700">
                        企业月结模式下，本次创建订单不发起支付、不发起预授权。订单创建后状态为“已预订”，支付状态为“企业月结”，最终费用进入企业月结账单。
                    </div>

                    <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
                        <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <div class="text-gray-400 mb-1">订单总额</div>
                            <div class="font-bold text-gray-800">{{ formatNumber(finalTotal) }}</div>
                        </div>
                        <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
                            <div class="text-blue-500 mb-1">车组押金标准</div>
                            <div class="font-bold text-blue-700">{{ formatNumber(depositAmount) }}</div>
                        </div>
                    </div>
                </div>

                <template #footer>
                    <div class="flex gap-3">
                        <el-button @click="paymentDialogVisible = false" class="flex-1" size="large">取消</el-button>
                        <el-button type="primary" @click="confirmPayment" :loading="newPayment.processing"
                            class="flex-1" size="large">
                            {{ collectionMode === 'monthly' || collectionMode === 'pending' ? '确认创建' : '发起预授权' }}
                        </el-button>
                    </div>
                </template>
            </el-dialog>

            <el-dialog v-model="orderSuccessVisible" title="订单创建成功" width="520px" center destroy-on-close
                :close-on-click-modal="false">
                <div class="space-y-4">
                    <div class="text-center">
                        <div 
                            class="mx-auto w-14 h-14 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                            <el-icon class="text-3xl">
                                <CircleCheck></CircleCheck>
                            </el-icon>
                        </div>
                        <div class="font-bold text-gray-900 text-lg">{{ createdOrder.orderId }}</div>
                        <div class="text-xs text-gray-500 mt-1">
                            {{ createdOrder.mainStatus === 'pending_payment' ? '车组库存已临时保留30分钟，待支付完成后进入正常派车，并已保存订单快照版本。' : '车组库存已锁定，订单已写入门市租车订单列表，并保存订单计费快照和规则快照。' }}
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <div class="text-xs text-gray-400 mb-1">订单主状态</div>
                            <div class="font-bold text-gray-800">{{ createdOrder.mainStatusText }}</div>
                        </div>
                        <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <div class="text-xs text-gray-400 mb-1">支付状态</div>
                            <div class="font-bold text-gray-800">{{ createdOrder.paymentStatusText }}</div>
                        </div>
                        <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <div class="text-xs text-gray-400 mb-1">派车状态</div>
                            <div class="font-bold text-gray-800">{{ createdOrder.dispatchStatusText }}</div>
                        </div>
                        <div class="bg-gray-50 border border-gray-100 rounded-lg p-3">
                            <div class="text-xs text-gray-400 mb-1">{{ createdOrder.fundSummaryLabel }}</div>
                            <div class="font-bold text-gray-800">{{ createdOrder.fundSummaryText }}</div>
                        </div>
                    </div>
                    <div class="rounded-lg border border-indigo-100 bg-indigo-50 p-3">
                        <div class="text-xs text-indigo-500 mb-2">订单快照版本</div>
                        <div class="flex flex-wrap gap-2">
                            <el-tag size="small" effect="plain">{{ createdOrder.priceVersion }}</el-tag>
                            <el-tag size="small" effect="plain">{{ createdOrder.marketingVersion }}</el-tag>
                            <el-tag size="small" effect="plain">{{ createdOrder.ruleVersion }}</el-tag>
                        </div>
                    </div>
                </div>
                <template #footer>
                    <div class="flex gap-3">
                        <el-button class="flex-1" @click="goBack">返回订单列表</el-button>
                        <el-button type="primary" class="flex-1" @click="viewCreatedOrder">
                            查看订单详情
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { ArrowLeft } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
// Mock Data
                const reservationType = ref('personal'); // 'personal' or 'enterprise'

                const customers = ref([
                    {
                        id: 1, name: '王小明', phone: '0912-345-678', levelType: 'warning', levelName: '金牌会员', points: 3500,
                        enterprise: { id: 'ent_001', name: '谷歌信息技术有限公司' },
                        coupons: [
                            { id: 'c1', name: '新客优惠', desc: '立减50元', value: 50, type: 'amount' },
                            { id: 'c2', name: '生日礼券', desc: '88折', value: 0.88, type: 'rate' }
                        ]
                    },
                    {
                        id: 2, name: '李大壮', phone: '0988-111-222', levelType: 'info', levelName: '普通会员', points: 200, coupons: []
                    }, // No enterprise
                    {
                        id: 3, name: '张晓华', phone: '0933-444-555', levelType: 'danger', levelName: '黑钻会员', points: 12000,
                        enterprise: { id: 'ent_002', name: '微软中国' },
                        coupons: [
                            { id: 'c3', name: 'VIP专属券', desc: '立减200元', type: 'amount', value: 200 }
                        ]
                    },
                ]);

                const vehicleGroups = ref([
                    { id: 'sedan', name: '舒适轿车组', desc: 'Toyota Altis / Vios', price: 300, available: 5, deposit: 3000 },
                    { id: 'suv', name: '豪华SUV组', desc: 'Honda CR-V / Toyota RAV4', price: 500, available: 2, deposit: 5000 },
                    { id: 'mpv', name: '商务MPV组', desc: 'Honda Odyssey', price: 800, available: 1, deposit: 8000 },
                    { id: 'lux_sedan', name: '豪华轿车组', desc: 'BMW 5 Series / Benz E', price: 1200, available: 3, deposit: 10000 },
                    { id: 'sport', name: '性能跑车组', desc: 'Porsche 911 / AMG GT', price: 3500, available: 1, deposit: 50000 },
                    { id: 'electric', name: '纯电SUV组', desc: 'Tesla Model Y / Nio ES6', price: 600, available: 8, deposit: 6000 },
                    { id: 'van', name: '货运面包组', desc: 'Ford Transit', price: 400, available: 0, deposit: 4000 },
                ]);

                const services = ref([
                    { id: 1, name: '安心保障险 (50/天)', price: 250, selected: false, daily: true, unitPrice: 50, maxQuantity: 1, quantity: 1 },
                    { id: 2, name: '儿童安全座椅', price: 100, selected: false, daily: false, maxQuantity: 2, quantity: 1 },
                    { id: 3, name: 'GPS导航仪', price: 50, selected: false, daily: false, maxQuantity: 1, quantity: 1 },
                    { id: 4, name: '舒适靠垫', price: 30, selected: false, daily: false, maxQuantity: 4, quantity: 1 },
                    { id: 5, name: '露营装备包', price: 200, selected: false, daily: false, maxQuantity: 1, quantity: 1 },
                ]);

                const marketingPlans = ref([
                    { id: 'personal_student', name: '学生专案行销方案', scope: 'personal', weekdayRate: 0.85, holidayRate: 0.9, manualVerification: true, qualificationName: '学生身份', requiredDocText: '学生证、在学证明等可证明学生身份的文件', supportedModes: ['门市租车'] },
                    { id: 'personal_weekday', name: '个人会员平假日优惠', scope: 'personal', weekdayRate: 0.9, holidayRate: 0.95, manualVerification: false },
                    { id: 'personal_gold', name: '金牌会员专享折扣', scope: 'personal', weekdayRate: 0.85, holidayRate: 0.9, levels: ['金牌会员', '黑钻会员'] },
                    { id: 'enterprise_staff', name: '企业员工用车方案', scope: 'enterprise', weekdayRate: 0.82, holidayRate: 0.88 },
                    { id: 'enterprise_monthly', name: '企业月结协议方案', scope: 'enterprise', weekdayRate: 0.8, holidayRate: 0.86 },
                ]);

                // Form Data
                const selectedCustomerId = ref(null);
                const currentCustomer = computed(() => customers.value.find(c => c.id === selectedCustomerId.value));

                const getDefaultPickupTime = () => {
                    const date = new Date();
                    date.setDate(date.getDate() + 1);
                    date.setHours(9, 0, 0, 0);
                    return date;
                };

                const getDefaultReturnTime = () => {
                    const date = getDefaultPickupTime();
                    date.setDate(date.getDate() + 1);
                    return date;
                };

                const rentalData = reactive({
                    pickupLocation: 'store_main',
                    returnLocation: 'store_main',
                    pickupTime: getDefaultPickupTime(),
                    returnTime: getDefaultReturnTime(),
                });

                const selectedGroupId = ref(null);
                const selectedGroup = computed(() => vehicleGroups.value.find(g => g.id === selectedGroupId.value));

                const selectedMarketingPlanId = ref('none');
                const selectedCouponId = ref(null);
                const showRedeemInput = ref(false); // New state for redeem toggle
                const redeemCode = ref('');
                const pointsUsed = ref(0);
                const collectionMode = ref('deposit'); // deposit, pending, monthly

                const canUsePersonalBenefits = computed(() => {
                    return reservationType.value !== 'enterprise';
                });

                const currentCustomerCoupons = computed(() => {
                    return currentCustomer.value ? currentCustomer.value.coupons : [];
                });

                const customerCoupons = computed(() => {
                    return canUsePersonalBenefits.value ? currentCustomerCoupons.value : [];
                });

                const availableMarketingPlans = computed(() => {
                    if (!currentCustomer.value) return [];
                    const scope = reservationType.value === 'enterprise' && currentCustomer.value.enterprise ? 'enterprise' : 'personal';
                    return marketingPlans.value.filter(plan => {
                        if (plan.scope !== scope) return false;
                        if (plan.levels && !plan.levels.includes(currentCustomer.value.levelName)) return false;
                        return true;
                    });
                });

                const selectedMarketingPlan = computed(() => {
                    return availableMarketingPlans.value.find(plan => plan.id === selectedMarketingPlanId.value);
                });

                const marketingPlanEligibilityLabel = computed(() => {
                    return reservationType.value === 'enterprise' && currentCustomer.value?.enterprise
                        ? '当前展示企业资格可用方案'
                        : '当前展示个人资格可用方案';
                });

                // Computed Calculations
                const rentalDurationHours = computed(() => {
                    if (!rentalData.pickupTime || !rentalData.returnTime) return 0;
                    const diff = new Date(rentalData.returnTime).getTime() - new Date(rentalData.pickupTime).getTime();
                    return Math.max(0, diff / 1000 / 60 / 60);
                });

                const rentalDurationLabel = computed(() => {
                    if (rentalDurationHours.value <= 0) return '0小时';
                    const totalMinutes = Math.round(rentalDurationHours.value * 60);
                    const days = Math.floor(totalMinutes / 1440);
                    const hours = Math.floor((totalMinutes % 1440) / 60);
                    const minutes = totalMinutes % 60;
                    const parts = [];
                    if (days > 0) parts.push(`${days}天`);
                    if (hours > 0) parts.push(`${hours}小时`);
                    if (minutes > 0) parts.push(`${minutes}分钟`);
                    return parts.join('') || '0小时';
                });

                const rentalDays = computed(() => {
                    if (rentalDurationHours.value <= 0) return 1;
                    return Math.max(1, Math.ceil(rentalDurationHours.value / 24));
                });

                const getBillingDayType = (date) => {
                    const day = date.getDay();
                    return day >= 1 && day <= 4 ? 'weekday' : 'holiday';
                };

                const billingSegments = computed(() => {
                    if (!selectedGroup.value || !rentalData.pickupTime || !rentalData.returnTime || rentalDurationHours.value <= 0) {
                        return [];
                    }
                    const pickup = new Date(rentalData.pickupTime);
                    const standardPrice = selectedGroup.value.price;
                    const segments = [];

                    if (rentalDurationHours.value <= 24) {
                        segments.push({
                            label: '起租24小时',
                            amount: standardPrice,
                            dayType: getBillingDayType(pickup),
                            unit: 'day'
                        });
                        return segments;
                    }

                    const fullDays = Math.floor(rentalDurationHours.value / 24);
                    const remainderHours = rentalDurationHours.value - fullDays * 24;
                    for (let i = 0; i < fullDays; i++) {
                        const segmentStart = new Date(pickup);
                        segmentStart.setHours(segmentStart.getHours() + i * 24);
                        segments.push({
                            label: `第${i + 1}个24小时`,
                            amount: standardPrice,
                            dayType: getBillingDayType(segmentStart),
                            unit: 'day'
                        });
                    }

                    if (remainderHours > 0) {
                        const billedHours = Math.max(1, Math.ceil(remainderHours));
                        const segmentStart = new Date(pickup);
                        segmentStart.setHours(segmentStart.getHours() + fullDays * 24);
                        const chargeAsDay = billedHours >= 5;
                        segments.push({
                            label: chargeAsDay ? `超时${billedHours}小时按1天` : `超时${billedHours}小时`,
                            amount: chargeAsDay ? standardPrice : Math.round(standardPrice * 0.1 * billedHours),
                            dayType: getBillingDayType(segmentStart),
                            unit: chargeAsDay ? 'day' : 'hour',
                            billedHours
                        });
                    }

                    return segments;
                });

                const rentalBillingLabel = computed(() => {
                    if (billingSegments.value.length === 0) return '未选择车组';
                    const dayCount = billingSegments.value.filter(segment => segment.unit === 'day').length;
                    const hourSegment = billingSegments.value.find(segment => segment.unit === 'hour');
                    const parts = [];
                    if (dayCount > 0) parts.push(`${dayCount}天`);
                    if (hourSegment) parts.push(`${hourSegment.billedHours}小时`);
                    return parts.join('+') || '1天';
                });

                const baseRentalTotal = computed(() => {
                    return billingSegments.value.reduce((total, segment) => total + segment.amount, 0);
                });

                const servicesTotal = computed(() => {
                    let total = 0;
                    services.value.forEach(s => {
                        if (s.selected) {
                            const unitPrice = s.daily ? (s.unitPrice * rentalDays.value) : s.price;
                            total += unitPrice * (s.quantity || 1);
                        }
                    });
                    return total;
                });

                const discountAmount = computed(() => {
                    const plan = selectedMarketingPlan.value;
                    if (!plan) return 0;
                    return billingSegments.value.reduce((total, segment) => {
                        const rate = segment.dayType === 'weekday' ? plan.weekdayRate : plan.holidayRate;
                        return total + Math.round(segment.amount * (1 - rate));
                    }, 0);
                });

                const couponAmount = computed(() => {
                    if (!canUsePersonalBenefits.value) return 0;
                    const coupon = customerCoupons.value.find(c => c.id === selectedCouponId.value);
                    if (!coupon) return 0;

                    if (coupon.type === 'amount') return coupon.value;
                    if (coupon.type === 'rate') {
                        return Math.round(baseRentalTotal.value * (1 - coupon.value));
                    }
                    return 0;
                });

                const pointsAmount = computed(() => {
                    if (!canUsePersonalBenefits.value) return 0;
                    return Math.floor(pointsUsed.value / 10);
                });

                const finalTotal = computed(() => {
                    const total = baseRentalTotal.value + servicesTotal.value - discountAmount.value - couponAmount.value - pointsAmount.value;
                    return Math.max(0, total);
                });

                const depositAmount = computed(() => {
                    return selectedGroup.value ? selectedGroup.value.deposit : 0;
                });

                const preAuthRule = reactive({
                    mode: 'percentage',
                    fixedAmount: 3000,
                    percent: 30
                });

                const preAuthRuleText = computed(() => {
                    if (preAuthRule.mode === 'fixed') {
                        return `预授权押金按规则固定额度 ${formatNumber(preAuthRule.fixedAmount)} 试算`;
                    }
                    return `预授权押金按规则租金比例 ${preAuthRule.percent}% 试算`;
                });

                const depositPayAmount = computed(() => {
                    if (finalTotal.value <= 0) return 0;
                    if (preAuthRule.mode === 'fixed') return preAuthRule.fixedAmount;
                    const percent = Math.min(100, Math.max(0, preAuthRule.percent));
                    return Math.ceil(finalTotal.value * percent / 100);
                });

                // Payment Modal Data
                const paymentDialogVisible = ref(false);
                const paymentDialogType = ref('online'); // 'online' or 'offline'
                const newPayment = reactive({
                    gateway: 'jiekou', // jiekou, credit_card, cash, transfer
                    amount: 0,
                    refNo: '',
                    processing: false
                });

                const orderSuccessVisible = ref(false);
                const createdOrder = reactive({
                    orderId: '',
                    mainStatus: '',
                    mainStatusText: '',
                    paymentStatus: '',
                    paymentStatusText: '',
                    dispatchStatusText: '',
                    amount: 0,
                    paidAmount: 0,
                    billingMode: 'customer_pay',
                    fundSummaryLabel: '本次预授权',
                    fundSummaryText: '0',
                    priceVersion: 'PRICE-STORE-20260418-001',
                    marketingVersion: 'MKT-STORE-MEMBER-20260418-001',
                    ruleVersion: 'RULE-STORE-20260418-002'
                });

                const userCreditCards = ref([
                    { id: 1, brand: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
                    { id: 2, brand: 'Mastercard', last4: '8888', expiry: '09/24', isDefault: false }
                ]);
                const selectedCreditCard = ref(1);

                // Methods
                const goBack = () => {
                    router.push('/operation/store-orders');
                };

                const formatNumber = (num) => {
                    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                };

                const formatDiscountRate = (rate) => {
                    return `${Math.round(rate * 100) / 10}折`;
                };

                const formatMarketingPlanLabel = (plan) => {
                    return `${plan.name}（平日${formatDiscountRate(plan.weekdayRate)} / 假日${formatDiscountRate(plan.holidayRate)}）`;
                };

                const handleCustomerSelect = () => {
                    pointsUsed.value = 0; // Reset points
                    reservationType.value = 'personal'; // Reset reservation type
                    selectedCouponId.value = null; // Reset coupon
                    selectedMarketingPlanId.value = 'none';
                    if (collectionMode.value === 'monthly') {
                        setCollectionMode('deposit');
                    }
                };

                const selectVehicleGroup = (group) => {
                    if (group.available <= 0) {
                        ElMessage.warning('当前车组库存不足，无法选择');
                        return;
                    }
                    selectedGroupId.value = group.id;
                };

                const handlePickupTimeChange = () => {
                    if (!rentalData.pickupTime) return;
                    const pickup = new Date(rentalData.pickupTime);
                    const currentReturn = rentalData.returnTime ? new Date(rentalData.returnTime) : null;
                    if (!currentReturn || currentReturn <= pickup) {
                        const nextReturn = new Date(pickup);
                        nextReturn.setDate(nextReturn.getDate() + 1);
                        rentalData.returnTime = nextReturn;
                    }
                };

                const setCollectionMode = (mode) => {
                    if (mode === 'monthly' && reservationType.value !== 'enterprise') {
                        ElMessage.warning('企业月结仅支持企业预订');
                        return;
                    }
                    collectionMode.value = mode;
                    if (mode === 'deposit') {
                        paymentDialogType.value = 'online';
                        newPayment.gateway = 'jiekou';
                    }
                    syncPaymentAmount();
                };

                const syncPaymentAmount = () => {
                    if (collectionMode.value === 'monthly' || collectionMode.value === 'pending') {
                        newPayment.amount = 0;
                    } else {
                        newPayment.amount = depositPayAmount.value;
                    }
                };

                const redeemCoupon = () => {
                    if (!canUsePersonalBenefits.value) {
                        ElMessage.warning('企业身份订单不支持优惠券和积分');
                        return;
                    }
                    if (redeemCode.value === 'TEST50') {
                        if (currentCustomer.value) {
                            const newCoupon = { id: 'c_new_' + Date.now(), name: '测试兑换券', desc: '立减50元', value: 50, type: 'amount' };
                            currentCustomer.value.coupons.push(newCoupon);
                            selectedCouponId.value = newCoupon.id; // Auto select
                            redeemCode.value = ''; // Clear input
                            ElMessage.success('优惠码兑换成功并已自动应用！');
                        } else {
                            ElMessage.warning('请先选择客户');
                        }
                    } else {
                        ElMessage.error('无效的优惠码');
                    }
                };

                const calculateServicePrice = (service) => {
                    const unitPrice = service.daily ? (service.unitPrice * rentalDays.value) : service.price;
                    return unitPrice * (service.quantity || 1);
                };

                const calculateTotal = () => {
                    // Triggered by changes, but mostly handled by computed
                };

                const submitOrder = () => {
                    if (!selectedCustomerId.value) {
                        ElMessage.warning('请选择客户');
                        return;
                    }
                    if (!rentalData.pickupTime || !rentalData.returnTime) {
                        ElMessage.warning('请选择取还车时间');
                        return;
                    }
                    if (new Date(rentalData.returnTime) <= new Date(rentalData.pickupTime)) {
                        ElMessage.warning('还车时间必须晚于取车时间');
                        return;
                    }
                    if (!selectedGroupId.value) {
                        ElMessage.warning('请选择车组');
                        return;
                    }
                    if (selectedGroup.value && selectedGroup.value.available <= 0) {
                        ElMessage.warning('当前车组库存不足，无法创建订单');
                        return;
                    }

                    paymentDialogType.value = 'online';
                    newPayment.gateway = 'jiekou';
                    paymentDialogVisible.value = true;
                    syncPaymentAmount();
                };

                const confirmPayment = () => {
                    if (collectionMode.value === 'monthly' && reservationType.value !== 'enterprise') {
                        ElMessage.warning('企业月结仅支持企业预订');
                        return;
                    }
                    if (collectionMode.value !== 'monthly' && collectionMode.value !== 'pending' && newPayment.amount <= 0) {
                        ElMessage.warning('请输入本次预授权金额');
                        return;
                    }
                    if (collectionMode.value === 'deposit' && paymentDialogType.value !== 'online') {
                        ElMessage.warning('下单预授权押金仅支持线上预授权');
                        paymentDialogType.value = 'online';
                        newPayment.gateway = 'jiekou';
                        return;
                    }
                    newPayment.processing = true;
                    setTimeout(() => {
                        newPayment.processing = false;
                        paymentDialogVisible.value = false;
                        const isMonthly = collectionMode.value === 'monthly';
                        const mainStatus = collectionMode.value === 'pending' ? 'pending_payment' : 'reserved';
                        const paymentStatus = isMonthly ? 'monthly_billing' : (collectionMode.value === 'deposit' ? 'deposit_paid' : 'unpaid');
                        const fundSummaryAmount = isMonthly ? finalTotal.value : (collectionMode.value === 'pending' ? 0 : newPayment.amount);
                        Object.assign(createdOrder, {
                            orderId: `ZT${new Date().getFullYear().toString().slice(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}${String(Date.now()).slice(-4)}`,
                            mainStatus,
                            mainStatusText: collectionMode.value === 'pending' ? '待支付' : '已预订',
                            paymentStatus,
                            paymentStatusText: paymentStatus === 'monthly_billing' ? '企业月结' : (paymentStatus === 'paid' ? '已结清' : (paymentStatus === 'deposit_paid' ? '已收预授权押金' : '未支付')),
                            dispatchStatusText: '待派车',
                            amount: finalTotal.value,
                            paidAmount: collectionMode.value === 'monthly' || collectionMode.value === 'pending' ? 0 : newPayment.amount,
                            billingMode: isMonthly ? 'monthly' : 'customer_pay',
                            fundSummaryLabel: isMonthly ? '预计月结' : (collectionMode.value === 'pending' ? '本次收款' : '本次预授权'),
                            fundSummaryText: isMonthly ? formatNumber(fundSummaryAmount) : formatNumber(fundSummaryAmount),
                            priceVersion: 'PRICE-STORE-20260418-001',
                            marketingVersion: reservationType.value === 'enterprise' ? 'MKT-STORE-CORP-20260418-002' : 'MKT-STORE-MEMBER-20260418-001',
                            ruleVersion: 'RULE-STORE-20260418-002'
                        });
                        orderSuccessVisible.value = true;
                    }, collectionMode.value === 'monthly' || collectionMode.value === 'pending' ? 500 : 1500);
                };

                watch([finalTotal, collectionMode], () => {
                    if (paymentDialogVisible.value) {
                        syncPaymentAmount();
                    }
                });

                watch(reservationType, (value) => {
                    selectedMarketingPlanId.value = 'none';
                    if (value === 'enterprise') {
                        selectedCouponId.value = null;
                        pointsUsed.value = 0;
                        showRedeemInput.value = false;
                        redeemCode.value = '';
                    }
                    if (value !== 'enterprise' && collectionMode.value === 'monthly') {
                        setCollectionMode('deposit');
                    }
                });

                const viewCreatedOrder = () => {
                    const params = new URLSearchParams({ id: createdOrder.orderId });
                    if (createdOrder.mainStatus) params.set('status', createdOrder.mainStatus);
                    if (createdOrder.paymentStatus) params.set('paymentStatus', createdOrder.paymentStatus);
                    if (createdOrder.amount !== undefined) params.set('amount', createdOrder.amount);
                    if (createdOrder.billingMode === 'monthly') {
                        params.set('billing', 'monthly');
                    }
                    if (reservationType.value === 'enterprise' && currentCustomer.value?.enterprise) {
                        params.set('clientType', 'corporate');
                        params.set('customerName', currentCustomer.value.name);
                        params.set('customerPhone', currentCustomer.value.phone);
                        params.set('customerLevel', currentCustomer.value.levelName);
                        params.set('corporateName', currentCustomer.value.enterprise.name);
                        params.set('corporateShortName', currentCustomer.value.enterprise.name.slice(0, 8));
                    }
                    router.push(`/operation/order-detail?${params.toString()}`);
                };
</script>

<style scoped>
        .new-order-page {
            min-height: 100%;
        }

        .sticky-summary {
            position: sticky;
            top: 20px;
        }

        /* Aggressively reduce card header height by removing default padding */
        .new-order-page :deep(.el-card__header) {
            padding: 0 !important;
            min-height: 0 !important;
            border-bottom: none !important;
            /* Move border to inner div */
        }
</style>
