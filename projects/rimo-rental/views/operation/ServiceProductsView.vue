<template>
<div class="service-products-page">
            
            

            
            <main>
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">基础产品定价</h1>
                        <p class="text-gray-500 text-sm mt-1">定义不同服务类型下的车辆产品组，设置定价策略和里程费规则。</p>
                    </div>
                </div>

                
                <el-tabs v-model="activeTab" class="service-product-tabs app-page-tabs bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">

                    
                    <el-tab-pane name="SHARING">
                        <template #label>
                            <span class="flex items-center gap-2">
                                <el-icon><Clock></Clock></el-icon>
                                <span>分时租车</span>
                            </span>
                        </template>
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <div class="text-sm text-gray-500">
                                    <span class="font-bold text-gray-700">说明：</span> 分时租车模式下，支持独立配置<span 
                                        class="text-blue-600 font-bold">同站/异站</span>业务与定价；里程费支持<span 
                                        class="text-blue-600 font-bold">统一策略或按款型独立设定</span>。
                                </div>
                                <div class="flex items-center gap-3">
                                    <div class="flex items-center gap-2 text-sm text-gray-500">
                                        <span>授权模拟</span>
                                        <el-select v-model="sharingAuthMode" size="large" class="w-44">
                                            <el-option label="全部业务线" value="BOTH"></el-option>
                                            <el-option label="仅同站租还" value="SAME"></el-option>
                                            <el-option label="仅甲租乙还" value="DIFF"></el-option>
                                            <el-option label="未授权" value="NONE"></el-option>
                                        </el-select>
                                    </div>
                                    <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20" @click="openDialog('SHARING')">
                                        <el-icon class="mr-1">
                                            <Plus></Plus>
                                        </el-icon> 新增产品组
                                    </el-button>
                                </div>
                            </div>

                            
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div v-for="group in sharingGroups" :key="group.id"
                                    class="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col h-full relative group">

                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 class="font-bold text-lg text-gray-800">
                                                {{ group.name }}
                                                <span v-if="group.aliasName"
                                                    class="ml-2 text-sm text-gray-400 font-normal tracking-wide">{{
                                                    group.aliasName }}</span>
                                            </h3>
                                            <div class="text-xs text-gray-400 mt-1">ID: {{ group.id }}</div>
                                        </div>
                                        <div class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">分时
                                        </div>
                                    </div>

                                    <div class="flex-1 space-y-4">
                                        
                                        <div class="pb-3 border-b border-gray-50">
                                            <div v-if="hasSameStationAuth || hasDiffStationAuth"
                                                class="bg-slate-50/50 px-2.5 py-2 rounded-lg border border-slate-100/50 text-xs">
                                                <div class="grid grid-cols-[36px_1fr] gap-x-2 gap-y-1">
                                                    <div></div>
                                                    <div class="grid gap-2"
                                                        :class="hasSameStationAuth && hasDiffStationAuth ? 'grid-cols-2' : 'grid-cols-1 justify-items-end text-right'">
                                                        <div v-if="hasSameStationAuth"
                                                            class="text-slate-700 font-semibold flex items-center">
                                                            <span class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>同站租还
                                                        </div>
                                                        <div v-if="hasDiffStationAuth"
                                                            class="text-slate-700 font-semibold flex items-center">
                                                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>甲租乙还
                                                        </div>
                                                    </div>
                                                    <div class="text-gray-400 leading-5">平日</div>
                                                    <div class="grid gap-2"
                                                        :class="hasSameStationAuth && hasDiffStationAuth ? 'grid-cols-2' : 'grid-cols-1 justify-items-end text-right'">
                                                        <div v-if="hasSameStationAuth" class="text-slate-700">
                                                            <span class="font-semibold text-slate-800">¥{{ group.sameStationHourlyPrice || '-' }}</span>/时
                                                            <span class="text-slate-300 mx-1">|</span>
                                                            <span class="font-semibold text-slate-800">¥{{ group.sameStationDailyPrice || '-' }}</span>/天
                                                        </div>
                                                        <div v-if="hasDiffStationAuth" class="text-slate-700">
                                                            <span class="font-semibold text-slate-800">¥{{ group.diffStationHourlyPrice || '-' }}</span>/时
                                                            <span class="text-slate-300 mx-1">|</span>
                                                            <span class="font-semibold text-slate-800">¥{{ group.diffStationDailyPrice || '-' }}</span>/天
                                                        </div>
                                                    </div>
                                                    <div class="text-gray-400 leading-5">假日</div>
                                                    <div class="grid gap-2"
                                                        :class="hasSameStationAuth && hasDiffStationAuth ? 'grid-cols-2' : 'grid-cols-1 justify-items-end text-right'">
                                                        <div v-if="hasSameStationAuth" class="text-slate-700">
                                                            <span class="font-semibold text-slate-800">¥{{ group.sameStationHolidayHourlyPrice || group.sameStationHourlyPrice || '-' }}</span>/时
                                                            <span class="text-slate-300 mx-1">|</span>
                                                            <span class="font-semibold text-slate-800">¥{{ group.sameStationHolidayDailyPrice || group.sameStationDailyPrice || '-' }}</span>/天
                                                        </div>
                                                        <div v-if="hasDiffStationAuth" class="text-slate-700">
                                                            <span class="font-semibold text-slate-800">¥{{ group.diffStationHolidayHourlyPrice || group.diffStationHourlyPrice || '-' }}</span>/时
                                                            <span class="text-slate-300 mx-1">|</span>
                                                            <span class="font-semibold text-slate-800">¥{{ group.diffStationHolidayDailyPrice || group.diffStationDailyPrice || '-' }}</span>/天
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div v-else
                                                class="text-center py-3 text-xs text-slate-400 bg-slate-50 rounded border border-slate-100">
                                                当前授权状态下暂无可配置的分时业务线
                                            </div>
                                        </div>

                                        
                                        <div v-if="group.isUnifiedMileage"
                                            class="bg-slate-50/80 rounded-lg px-3 py-2 border border-slate-100">
                                            <div 
                                                class="text-xs font-bold text-slate-600 mb-1.5 uppercase flex items-center">
                                                <el-icon class="mr-1">
                                                    <Odometer></Odometer>
                                                </el-icon> 统一里程费规则
                                            </div>
                                            <div class="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <div class="text-slate-400">免费里程</div>
                                                    <div class="font-mono font-medium text-slate-700">{{
                                                        group.mileageRule.freeKm }} km</div>
                                                </div>
                                                <div>
                                                    <div class="text-slate-400">超程单价</div>
                                                    <div class="font-mono font-medium text-slate-700">¥{{
                                                        group.mileageRule.pricePerKm }}/km</div>
                                                </div>
                                                <div>
                                                    <div class="text-slate-400">封顶</div>
                                                    <div class="font-mono font-medium text-slate-700">{{
                                                        group.mileageRule.dailyCap > 0 ? '¥' +
                                                        group.mileageRule.dailyCap : '不限' }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div v-else class="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
                                            <div 
                                                class="text-xs font-bold text-slate-600 mb-2 uppercase flex items-center">
                                                <el-icon class="mr-1">
                                                    <Odometer></Odometer>
                                                </el-icon> 个性化里程费
                                            </div>
                                            <div class="text-xs text-slate-500">
                                                已为 {{ group.models.length }} 款车型单独配置
                                            </div>
                                        </div>

                                        
                                        <div class="text-xs text-gray-500">
                                            <span class="font-bold">包含 {{ group.models.length }} 款车型: </span>
                                            <span class="truncate block mt-1">{{ group.models.map(m =>
                                                getModelName(m.modelId)).join(', ') || '暂无车型' }}</span>
                                        </div>
                                    </div>

                                    <div class="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                                        <el-button class="flex-1" type="primary" plain size="small"
                                            @click="openEdit(group)">配置详情</el-button>
                                        <el-button type="danger" plain size="small" icon="Delete" circle
                                            @click="deleteGroup(group)"></el-button>
                                    </div>
                                </div>
                            </div>

                            
                            <div v-if="sharingGroups.length === 0"
                                class="flex flex-col items-center justify-center py-20 text-gray-400">
                                <el-icon class="text-4xl mb-3 opacity-20">
                                    <Grid></Grid>
                                </el-icon>
                                <p>暂无分时租车产品组</p>
                            </div>
                        </div>
                    </el-tab-pane>

                    
                    <el-tab-pane name="STORE">
                        <template #label>
                            <span class="flex items-center gap-2">
                                <el-icon><Shop></Shop></el-icon>
                                <span>门市租赁</span>
                            </span>
                        </template>
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-6">
                                <div class="text-sm text-gray-500">
                                    <span class="font-bold text-gray-700">说明：</span> 门市租赁模式下，车组统一标准价基于<span 
                                        class="text-blue-600 font-bold">产品组层级</span>设定且不区分平假日；里程费支持<span 
                                        class="text-blue-600 font-bold">统一策略或按款型独立设定</span>。
                                </div>
                                <div class="flex items-center gap-2">
                                    <el-button plain @click="openProductVersion()">历史版本</el-button>
                                    <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20" @click="openDialog('STORE')">
                                        <el-icon class="mr-1">
                                            <Plus></Plus>
                                        </el-icon> 新增产品组
                                    </el-button>
                                </div>
                            </div>

                            
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div v-for="group in storeGroups" :key="group.id"
                                    class="border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col h-full group">

                                    <div class="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 class="font-bold text-lg text-gray-800">
                                                {{ group.name }}
                                                <span v-if="group.aliasName"
                                                    class="ml-2 text-sm text-gray-400 font-normal tracking-wide">{{
                                                    group.aliasName }}</span>
                                            </h3>
                                            <div class="text-xs text-gray-400 mt-1">ID: {{ group.id }}</div>
                                            <div class="text-xs text-indigo-500 mt-1 cursor-pointer underline decoration-dotted"
                                                @click="openProductVersion(group)">标准价版本：PRICE-{{ group.id }}-20260418</div>
                                        </div>
                                        <div class="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded font-medium">
                                            门市</div>
                                    </div>

                                    <div class="flex-1 space-y-4">
                                        
                                        <div class="flex justify-between items-center py-2 border-b border-gray-50">
                                            <span class="text-gray-500 text-sm">统一标准价</span>
                                            <span class="font-bold text-slate-800">¥{{ group.dailyPrice }}<span 
                                                    class="text-xs text-gray-400 font-normal">/天</span></span>
                                        </div>

                                        
                                        <div v-if="group.isUnifiedMileage"
                                            class="bg-slate-50/80 rounded-lg px-3 py-2 border border-slate-100">
                                            <div 
                                                class="text-xs font-bold text-slate-600 mb-1.5 uppercase flex items-center">
                                                <el-icon class="mr-1">
                                                    <Odometer></Odometer>
                                                </el-icon> 统一里程费规则
                                            </div>
                                            <div class="grid grid-cols-3 gap-2 text-xs">
                                                <div>
                                                    <div class="text-slate-400">免费里程</div>
                                                    <div class="font-mono font-medium text-gray-700">{{
                                                        group.mileageRule.freeKm }} km</div>
                                                </div>
                                                <div>
                                                    <div class="text-slate-400">超程单价</div>
                                                    <div class="font-mono font-medium text-gray-700">¥{{
                                                        group.mileageRule.pricePerKm }}/km</div>
                                                </div>
                                                <div>
                                                    <div class="text-slate-400">封顶</div>
                                                    <div class="font-mono font-medium text-gray-700">{{
                                                        group.mileageRule.dailyCap > 0 ? '¥' +
                                                        group.mileageRule.dailyCap : '不限' }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-else class="bg-slate-50/80 rounded-lg p-3 border border-slate-100">
                                            <div 
                                                class="text-xs font-bold text-slate-600 mb-2 uppercase flex items-center">
                                                <el-icon class="mr-1">
                                                    <Odometer></Odometer>
                                                </el-icon> 个性化里程费
                                            </div>
                                            <div class="text-xs text-gray-500">
                                                已为 {{ group.models.length }} 款车型单独配置
                                            </div>
                                        </div>

                                        
                                        <div class="text-xs text-gray-500">
                                            <span class="font-bold">包含 {{ group.models.length }} 款车型: </span>
                                            <span class="truncate block mt-1">{{ group.models.map(m =>
                                                getModelName(m.modelId)).join(', ') || '暂无车型' }}</span>
                                        </div>
                                    </div>

                                    <div class="mt-5 flex gap-2 border-t border-gray-100 pt-4">
                                        <el-button class="flex-1" type="primary" plain size="small"
                                            @click="openEdit(group)">配置详情</el-button>
                                        <el-button type="danger" plain size="small" icon="Delete" circle
                                            @click="deleteGroup(group)"></el-button>
                                    </div>
                                </div>
                            </div>

                            
                            <div v-if="storeGroups.length === 0"
                                class="flex flex-col items-center justify-center py-20 text-gray-400">
                                <el-icon class="text-4xl mb-3 opacity-20">
                                    <Grid></Grid>
                                </el-icon>
                                <p>暂无门市租赁产品组</p>
                            </div>
                        </div>
                    </el-tab-pane>

                </el-tabs>
            </main>
        </div>

        
        <el-dialog v-model="dialogVisible"
            :title="(isEdit ? '编辑' : '新增') + (currentType === 'SHARING' ? '分时租车' : '门市租赁') + '产品组'" width="960px">
            <el-form :model="currentGroup" label-position="top">
                <div class="grid grid-cols-2 gap-6">
                    
                    <div class="col-span-2 md:col-span-1">
                        <el-form-item label="产品组名称" required>
                            <el-input v-model="currentGroup.name" placeholder="例如: 经济型, 豪华型"></el-input>
                        </el-form-item>
                    </div>
                    <div class="col-span-2 md:col-span-1">
                        <el-form-item label="产品组别名 (如英文名)">
                            <el-input v-model="currentGroup.aliasName" placeholder="例如: Economy, Luxury"></el-input>
                        </el-form-item>
                    </div>
                    
                    <div v-if="currentType === 'STORE'" class="col-span-2 md:col-span-1">
                        <el-form-item label="车组标准价 (元/天)" required>
                            <el-input-number v-model="currentGroup.dailyPrice" :min="0" :step="10"
                                class="w-full"></el-input-number>
                        </el-form-item>
                    </div>

                    
                    <div v-if="currentType === 'SHARING'"
                        class="col-span-2 rounded-lg border border-slate-200 bg-slate-50/40 p-4">
                        <div class="font-bold text-slate-800 flex items-center justify-between text-sm mb-4">
                            <span class="flex items-center">
                                <el-icon class="mr-2 text-slate-500">
                                    <Money></Money>
                                </el-icon> 基准租金费率
                            </span>
                            <span class="text-xs font-normal text-slate-400">{{ sharingAuthLabel }}</span>
                        </div>

                        <div class="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
                            <div v-if="hasSameStationAuth" class="p-3">
                                <div class="grid grid-cols-12 gap-3 items-end">
                                    <div class="col-span-12 md:col-span-2 flex items-center justify-between md:block">
                                        <div class="text-sm font-semibold text-slate-800">
                                            同站租还
                                        </div>
                                    </div>
                                    <el-form-item label="平日时租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.sameStationHourlyPrice" :min="0"
                                            :step="1" class="w-full" controls-position="right"></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="平日日租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.sameStationDailyPrice" :min="0"
                                            :step="10" class="w-full" controls-position="right"></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="假日时租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.sameStationHolidayHourlyPrice"
                                            :min="0" :step="1" class="w-full"
                                            controls-position="right"></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="假日日租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.sameStationHolidayDailyPrice"
                                            :min="0" :step="10" class="w-full"
                                            controls-position="right"></el-input-number>
                                    </el-form-item>
                                </div>
                            </div>

                            <div v-if="hasDiffStationAuth" class="p-3">
                                <div class="grid grid-cols-12 gap-3 items-end">
                                    <div class="col-span-12 md:col-span-2 flex items-center justify-between md:block">
                                        <div class="text-sm font-semibold text-slate-800">
                                            甲租乙还
                                        </div>
                                    </div>
                                    <el-form-item label="平日时租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.diffStationHourlyPrice" :min="0"
                                            :step="1" class="w-full" controls-position="right"></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="平日日租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.diffStationDailyPrice" :min="0"
                                            :step="10" class="w-full" controls-position="right"></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="假日时租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.diffStationHolidayHourlyPrice"
                                            :min="0" :step="1" class="w-full"
                                            controls-position="right"></el-input-number>
                                    </el-form-item>
                                    <el-form-item label="假日日租" class="col-span-6 md:col-span-2 mb-0">
                                        <el-input-number v-model="currentGroup.diffStationHolidayDailyPrice"
                                            :min="0" :step="10" class="w-full"
                                            controls-position="right"></el-input-number>
                                    </el-form-item>
                                </div>
                            </div>
                            <div v-if="!hasSameStationAuth && !hasDiffStationAuth"
                                class="p-4 text-sm text-slate-400">
                                当前授权状态下暂无可配置的分时业务线，请先切换授权模拟。
                            </div>
                        </div>
                    </div>

                </div>

                
                <div class="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <div class="font-bold text-gray-800 flex items-center">
                            <el-icon class="mr-1">
                                <Odometer></Odometer>
                            </el-icon> 里程费规则
                        </div>
                        <el-switch v-model="currentGroup.isUnifiedMileage" @change="normalizeMileageLockFields"
                            active-text="统一配置 (所有车型使用相同规则)" inactive-text="单独配置 (按车型分别设置)">
                        </el-switch>
                    </div>

                    
                    <div v-if="currentGroup.isUnifiedMileage" class="grid grid-cols-3 gap-4 animate-fade-in">
                        <el-form-item label="每日免费里程 (km)">
                            <el-input-number v-model="currentGroup.mileageRule.freeKm" :min="0" :step="100"
                                :disabled="currentType === 'SHARING'" class="w-full"></el-input-number>
                        </el-form-item>
                        <el-form-item label="超程单价 (元/km)">
                            <el-input-number v-model="currentGroup.mileageRule.pricePerKm" :min="0" :step="0.5"
                                :precision="1" class="w-full"></el-input-number>
                        </el-form-item>
                        <el-form-item label="每日封顶金额 (元)">
                            <el-input-number v-model="currentGroup.mileageRule.dailyCap" :min="0" :step="10"
                                :disabled="currentType === 'SHARING'" placeholder="0为不限" class="w-full"></el-input-number>
                            <div class="text-xs text-gray-400 mt-1">设为 0 表示不封顶</div>
                        </el-form-item>
                    </div>
                    <div v-else class="text-sm text-gray-500 italic">
                        请在下方关联车型列表中，为每个车型单独设置里程费规则。
                    </div>
                </div>

                
                <div class="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <div class="font-bold text-gray-800 mb-3 flex items-center">
                        <el-icon class="mr-1 text-yellow-600">
                            <Lock></Lock>
                        </el-icon> 特殊车辆管控
                        <el-tag v-if="!isEdit" size="small" type="warning" effect="plain" class="ml-2">开发中</el-tag>
                    </div>
                    <div class="flex items-center">
                        <el-checkbox v-model="currentGroup.isSpecial" class="mr-4"
                            :disabled="!isEdit">标记为特殊产品组</el-checkbox>
                        <div v-if="currentGroup.isSpecial" class="flex items-center animate-fade-in">
                            <span class="text-sm text-gray-600 mr-2">限制会员等级:</span>
                            <el-select v-model="currentGroup.specialMembershipRequired" placeholder="请选择最低会员等级"
                                :disabled="!isEdit" size="small" class="w-48">
                                <el-option label="白银会员及以上" value="SILVER"></el-option>
                                <el-option label="黄金会员及以上" value="GOLD"></el-option>
                                <el-option label="黑钻会员及以上" value="DIAMOND"></el-option>
                            </el-select>
                        </div>
                    </div>
                    <div v-if="!isEdit"
                        class="mt-3 flex items-center text-sm text-amber-700 bg-amber-100/70 border border-amber-200 rounded-lg px-3 py-2">
                        <el-icon class="mr-2">
                            <WarningFilled></WarningFilled>
                        </el-icon>
                        功能开发中，暂不支持在新增产品时配置特殊车辆管控。
                    </div>
                    <div class="text-xs text-gray-500 mt-2">
                        开启后，该产品组下的所有车辆将被视为特殊车辆，仅允许满足条件的会员预订。
                    </div>
                </div>

                
                <div class="mt-6">
                    <div class="flex justify-between items-center mb-2">
                        <div class="font-bold text-gray-700">关联车型款型</div>
                        <el-button type="primary" link icon="Plus" @click="showModelSelector = true">添加车型</el-button>
                    </div>

                    <div class="border border-gray-200 rounded-lg overflow-hidden">
                        <el-table :data="currentGroup.models" style="width: 100%" max-height="300">
                            
                            <el-table-column label="车型款型" min-width="180">
                                <template #default="{ row }">
                                    <div class="font-bold text-sm">{{ getModelName(row.modelId) }}</div>
                                </template>
                            </el-table-column>

                            
                            <el-table-column v-if="!currentGroup.isUnifiedMileage" label="里程费配置 (特定款型)" min-width="350">
                                <template #default="{ row }">
                                    <div class="flex gap-2 items-center">
                                        <div class="flex flex-col flex-1">
                                            <span class="text-[10px] text-gray-400">免费里程</span>
                                            <el-input-number v-model="row.mileageRule.freeKm" :min="0" size="small"
                                                :controls="false" :disabled="currentType === 'SHARING'" class="!w-full"></el-input-number>
                                        </div>
                                        <div class="flex flex-col flex-1">
                                            <span class="text-[10px] text-gray-400">单价(元/km)</span>
                                            <el-input-number v-model="row.mileageRule.pricePerKm" :min="0" :step="0.1"
                                                :precision="1" size="small" :controls="false"
                                                class="!w-full"></el-input-number>
                                        </div>
                                        <div class="flex flex-col flex-1">
                                            <span class="text-[10px] text-gray-400">封顶(元)</span>
                                            <el-input-number v-model="row.mileageRule.dailyCap" :min="0" size="small"
                                                :controls="false" :disabled="currentType === 'SHARING'" class="!w-full"></el-input-number>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="操作" width="60" align="center">
                                <template #default="{ $index }">
                                    <el-button type="danger" link icon="Close" @click="removeModel($index)"></el-button>
                                </template>
                            </el-table-column>
                        </el-table>

                        <div v-if="currentGroup.models.length === 0"
                            class="py-8 text-center text-gray-400 text-sm bg-gray-50">
                            暂未关联任何车型，点击右上角添加
                        </div>
                    </div>
                </div>

            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary"
                    @click="saveGroup">保存配置</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="showModelSelector" title="选择车型款型" width="500px">
            <el-input v-model="modelSearch" placeholder="搜索品牌或型号..." prefix-icon="Search" class="mb-4"></el-input>
            <div class="max-h-[400px] overflow-y-auto border border-gray-100 rounded-lg">
                <div v-for="model in filteredAvailableModels" :key="model.id"
                    class="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 cursor-pointer"
                    @click="addModelToGroup(model)">
                    <div class="flex items-center">
                        <img :src="model.defaultPhotoUrl" class="w-12 h-9 rounded object-cover border bg-gray-100 mr-3">
                        <div>
                            <div class="font-bold text-gray-800">{{ model.brand }} {{ model.model }}</div>
                            <div class="text-xs text-gray-500">{{ model.year }}款</div>
                        </div>
                    </div>
                    <el-icon class="text-gray-300">
                        <Plus></Plus>
                    </el-icon>
                </div>
            </div>
        </el-dialog>

        <el-dialog v-model="productVersionDialogVisible" title="产品组历史版本" width="860px" destroy-on-close>
            <div class="grid grid-cols-3 gap-4" v-if="selectedProductVersion">
                <div class="col-span-1 border border-gray-100 rounded-lg overflow-hidden">
                    <div class="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">版本列表</div>
                    <div class="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                        <button v-for="version in productVersionRecords" :key="version.version"
                            class="w-full text-left px-3 py-3 hover:bg-indigo-50 transition-colors"
                            :class="selectedProductVersion.version === version.version ? 'bg-indigo-50' : 'bg-white'"
                            @click="selectedProductVersion = version">
                            <div class="font-mono text-xs text-indigo-600 font-bold">{{ version.version }}</div>
                            <div class="text-sm text-gray-800 mt-1">{{ version.groupName }}</div>
                            <div class="text-xs text-gray-400 mt-1">{{ version.savedAt }} · {{ version.savedBy }}</div>
                        </button>
                    </div>
                </div>
                <div class="col-span-2 space-y-4">
                    <div class="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                        <div class="font-mono font-bold text-gray-900">{{ selectedProductVersion.version }}</div>
                        <div class="text-sm text-gray-700 mt-1">{{ selectedProductVersion.groupName }}</div>
                        <div class="text-xs text-gray-500 mt-1">保存人：{{ selectedProductVersion.savedBy }} · {{
                            selectedProductVersion.savedAt }}</div>
                    </div>
                    <el-descriptions :column="2" border size="small">
                        <el-descriptions-item label="标准价">{{ selectedProductVersion.dailyPrice }}</el-descriptions-item>
                        <el-descriptions-item label="车型绑定">{{ selectedProductVersion.models }}</el-descriptions-item>
                        <el-descriptions-item label="里程模式">{{ selectedProductVersion.mileageMode }}</el-descriptions-item>
                        <el-descriptions-item label="特殊管控">{{ selectedProductVersion.specialRule }}</el-descriptions-item>
                    </el-descriptions>
                    <div>
                        <div class="font-bold text-gray-800 mb-2">里程费规则</div>
                        <el-table :data="selectedProductVersion.mileageValues" border size="small">
                            <el-table-column prop="scope" label="适用范围" min-width="160"></el-table-column>
                            <el-table-column prop="freeKm" label="每日免费里程" width="130" align="center"></el-table-column>
                            <el-table-column prop="pricePerKm" label="超程单价" width="120" align="center"></el-table-column>
                            <el-table-column prop="dailyCap" label="每日封顶金额" width="130" align="center"></el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button @click="productVersionDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import sedanPhoto from '../../assets/demo/vehicle-sedan.jpg';
import electricPhoto from '../../assets/demo/vehicle-electric.jpg';
import vehiclePlaceholder from '../../assets/demo/vehicle-placeholder.svg';

export default {
  name: 'ServiceProductsView',
  setup() {
                // --- Mock Data: Vehicle Models (From vehicle_groups.html) ---
                const allVehicleModels = ref([
                    { id: 'G1', brand: 'Tesla', model: 'Model 3', year: '2023', defaultPhotoUrl: electricPhoto },
                    { id: 'G2', brand: 'BYD', model: 'Han EV', year: '2024', defaultPhotoUrl: sedanPhoto },
                    { id: 'G3', brand: 'BMW', model: '3 Series', year: '2023', defaultPhotoUrl: vehiclePlaceholder }
                ]);

                // --- Mock Data: Product Groups ---
                const productGroups = ref([
                    // Sharing Examples
                    {
                        id: 'SG1', type: 'SHARING', name: '经济型 (分时)', aliasName: 'Economy', dailyPrice: 200, hourlyPrice: 30,
                        enableSameStation: true, sameStationHourlyPrice: 25, sameStationDailyPrice: 160,
                        enableDiffStation: true, diffStationHourlyPrice: 35, diffStationDailyPrice: 220,
                        isUnifiedMileage: false, // 个性化
                        mileageRule: { freeKm: 100, pricePerKm: 1.5, dailyCap: 0 }, // fallback
                        models: [
                            { modelId: 'G2', mileageRule: { freeKm: 100, pricePerKm: 1.5, dailyCap: 0 } }
                        ]
                    },
                    {
                        id: 'SG2', type: 'SHARING', name: '舒适型 (分时)', aliasName: 'Comfort', dailyPrice: 300, hourlyPrice: 50,
                        enableSameStation: true, sameStationHourlyPrice: 45, sameStationDailyPrice: 280,
                        enableDiffStation: true, diffStationHourlyPrice: 55, diffStationDailyPrice: 350,
                        isUnifiedMileage: false,
                        mileageRule: { freeKm: 100, pricePerKm: 2.0, dailyCap: 300 },
                        models: [
                            { modelId: 'G1', mileageRule: { freeKm: 100, pricePerKm: 2.0, dailyCap: 300 } }
                        ]
                    },
                    {
                        id: 'SG3', type: 'SHARING', name: '商务型 (分时)', aliasName: 'Business', dailyPrice: 400, hourlyPrice: 70,
                        enableSameStation: true, sameStationHourlyPrice: 60, sameStationDailyPrice: 380,
                        enableDiffStation: true, diffStationHourlyPrice: 80, diffStationDailyPrice: 450,
                        isUnifiedMileage: true, // 统一
                        mileageRule: { freeKm: 150, pricePerKm: 2.5, dailyCap: 500 },
                        models: [
                            { modelId: 'G3', mileageRule: { freeKm: 150, pricePerKm: 2.5, dailyCap: 500 } }
                        ]
                    },
                    {
                        id: 'SG4', type: 'SHARING', name: '尊享型 (分时)', aliasName: 'Premium', dailyPrice: 600, hourlyPrice: 100,
                        enableSameStation: true, sameStationHourlyPrice: 90, sameStationDailyPrice: 550,
                        enableDiffStation: true, diffStationHourlyPrice: 120, diffStationDailyPrice: 650,
                        isUnifiedMileage: false, // 个性化
                        mileageRule: { freeKm: 100, pricePerKm: 3.0, dailyCap: 0 },
                        models: [] // 无车型测试边界状态
                    },
                    {
                        id: 'SG5', type: 'SHARING', name: '新能源专享 (分时)', aliasName: 'EV Exclusive', dailyPrice: 150, hourlyPrice: 20,
                        enableSameStation: true, sameStationHourlyPrice: 15, sameStationDailyPrice: 120,
                        enableDiffStation: true, diffStationHourlyPrice: 25, diffStationDailyPrice: 180,
                        isUnifiedMileage: true, // 统一
                        mileageRule: { freeKm: 200, pricePerKm: 1.0, dailyCap: 150 },
                        models: [
                            { modelId: 'G1', mileageRule: { freeKm: 200, pricePerKm: 1.0, dailyCap: 150 } },
                            { modelId: 'G2', mileageRule: { freeKm: 200, pricePerKm: 1.0, dailyCap: 150 } }
                        ]
                    },
                    {
                        id: 'SG6', type: 'SHARING', name: '轻量测试组 (分时)', aliasName: 'Basic Group', dailyPrice: 200, hourlyPrice: 30,
                        enableSameStation: true, sameStationHourlyPrice: 20, sameStationDailyPrice: 180,
                        enableDiffStation: true, diffStationHourlyPrice: 40, diffStationDailyPrice: 250,
                        isUnifiedMileage: true, // 统一
                        mileageRule: { freeKm: 50, pricePerKm: 2.0, dailyCap: 0 },
                        models: [{ modelId: 'G3', mileageRule: { freeKm: 50, pricePerKm: 2.0, dailyCap: 0 } }]
                    },
                    // Store Examples
                    {
                        id: 'ST1', type: 'STORE', name: '经济型 (门市)', aliasName: 'Economy', dailyPrice: 180,
                        isUnifiedMileage: true, // 统一
                        mileageRule: { freeKm: 200, pricePerKm: 2.0, dailyCap: 0 },
                        models: [{ modelId: 'G2', mileageRule: { freeKm: 200, pricePerKm: 2.0, dailyCap: 0 } }]
                    },
                    {
                        id: 'ST2', type: 'STORE', name: '舒适型 (门市)', aliasName: 'Comfort', dailyPrice: 280,
                        isUnifiedMileage: false, // 个性化
                        mileageRule: { freeKm: 150, pricePerKm: 2.5, dailyCap: 400 },
                        models: [
                            { modelId: 'G1', mileageRule: { freeKm: 150, pricePerKm: 2.0, dailyCap: 300 } },
                            { modelId: 'G3', mileageRule: { freeKm: 200, pricePerKm: 3.0, dailyCap: 500 } }
                        ]
                    },
                    {
                        id: 'ST3', type: 'STORE', name: '商务型 (门市)', aliasName: 'Business', dailyPrice: 380,
                        isUnifiedMileage: true, // 统一
                        mileageRule: { freeKm: 250, pricePerKm: 3.0, dailyCap: 0 },
                        models: [{ modelId: 'G3', mileageRule: { freeKm: 250, pricePerKm: 3.0, dailyCap: 0 } }]
                    },
                    {
                        id: 'ST4', type: 'STORE', name: 'SUV越野型 (门市)', aliasName: 'SUV Off-road', dailyPrice: 450,
                        isUnifiedMileage: true, // 统一
                        mileageRule: { freeKm: 300, pricePerKm: 4.0, dailyCap: 800 },
                        models: [{ modelId: 'G2', mileageRule: { freeKm: 300, pricePerKm: 4.0, dailyCap: 800 } }] // 此处用BYD模拟一下
                    },
                    {
                        id: 'ST5', type: 'STORE', name: '特惠长租版 (门市)', aliasName: 'Long-term Promo', dailyPrice: 120,
                        isUnifiedMileage: true, // 统一
                        mileageRule: { freeKm: 100, pricePerKm: 1.5, dailyCap: 200 },
                        models: [{ modelId: 'G1', mileageRule: { freeKm: 100, pricePerKm: 1.5, dailyCap: 200 } }]
                    }
                ]);

                // --- State ---
                const activeTab = ref('STORE');
                const sharingAuthMode = ref('BOTH');
                const dialogVisible = ref(false);
                const isEdit = ref(false);
                const showModelSelector = ref(false);
                const modelSearch = ref('');

                // Form State
                const currentType = ref('SHARING');
                const currentGroup = reactive({
                    id: '', name: '', aliasName: '', dailyPrice: 0, hourlyPrice: 0,
                    enableSameStation: true, sameStationHourlyPrice: 0, sameStationDailyPrice: 0,
                    sameStationHolidayHourlyPrice: 0, sameStationHolidayDailyPrice: 0,
                    enableDiffStation: true, diffStationHourlyPrice: 0, diffStationDailyPrice: 0,
                    diffStationHolidayHourlyPrice: 0, diffStationHolidayDailyPrice: 0,
                    isUnifiedMileage: true, // New field default true
                    models: [], mileageRule: { freeKm: 0, pricePerKm: 0, dailyCap: 0 },
                    isSpecial: false, specialMembershipRequired: '' // New Special Control
                });

                // --- Computed ---
                const sharingGroups = computed(() => productGroups.value.filter(g => g.type === 'SHARING'));
                const storeGroups = computed(() => productGroups.value.filter(g => g.type === 'STORE'));
                const hasSameStationAuth = computed(() => ['BOTH', 'SAME'].includes(sharingAuthMode.value));
                const hasDiffStationAuth = computed(() => ['BOTH', 'DIFF'].includes(sharingAuthMode.value));
                const productVersionRecords = ref([
                    {
                        version: 'PRICE-ST1-20260418',
                        groupId: 'ST1',
                        groupName: '经济型 (门市)',
                        dailyPrice: '¥180/天',
                        models: 'Nissan Sentra',
                        mileageMode: '统一里程规则',
                        specialRule: '无特殊管控',
                        savedBy: '产品运营',
                        savedAt: '2026-04-18 10:15',
                        mileageValues: [
                            { scope: '全组统一', freeKm: '200 km', pricePerKm: '¥2.0/km', dailyCap: '不封顶' }
                        ]
                    },
                    {
                        version: 'PRICE-ST2-20260418',
                        groupId: 'ST2',
                        groupName: '舒适型 (门市)',
                        dailyPrice: '¥280/天',
                        models: 'Toyota Corolla、Ford Focus',
                        mileageMode: '按车型独立里程规则',
                        specialRule: '无特殊管控',
                        savedBy: '产品运营',
                        savedAt: '2026-04-18 10:18',
                        mileageValues: [
                            { scope: 'Toyota Corolla', freeKm: '150 km', pricePerKm: '¥2.0/km', dailyCap: '¥300/天' },
                            { scope: 'Ford Focus', freeKm: '200 km', pricePerKm: '¥3.0/km', dailyCap: '¥500/天' }
                        ]
                    },
                    {
                        version: 'PRICE-ST1-20260401',
                        groupId: 'ST1',
                        groupName: '经济型 (门市)',
                        dailyPrice: '¥160/天',
                        models: 'Nissan Sentra',
                        mileageMode: '统一里程规则',
                        specialRule: '无特殊管控',
                        savedBy: '产品运营',
                        savedAt: '2026-04-01 09:30',
                        mileageValues: [
                            { scope: '全组统一', freeKm: '150 km', pricePerKm: '¥2.0/km', dailyCap: '不封顶' }
                        ]
                    }
                ]);
                const productVersionDialogVisible = ref(false);
                const selectedProductVersion = ref(null);
                const openProductVersion = (group) => {
                    selectedProductVersion.value = productVersionRecords.value.find(version => version.groupId === group?.id)
                        || productVersionRecords.value[0];
                    productVersionDialogVisible.value = true;
                };
                const sharingAuthLabel = computed(() => {
                    const labelMap = {
                        BOTH: '当前展示：同站租还 + 甲租乙还',
                        SAME: '当前展示：同站租还',
                        DIFF: '当前展示：甲租乙还',
                        NONE: '当前展示：未授权'
                    };
                    return labelMap[sharingAuthMode.value] || labelMap.BOTH;
                });

                const filteredAvailableModels = computed(() => {
                    const q = modelSearch.value.toLowerCase();
                    // In a real app, you would filter out models already used in other groups of the SAME type
                    // For now, we just list all for simulation, or filtered by search
                    return allVehicleModels.value.filter(m =>
                        m.brand.toLowerCase().includes(q) || m.model.toLowerCase().includes(q)
                    );
                });

                // --- Helpers ---
                const getModelName = (id) => {
                    const m = allVehicleModels.value.find(x => x.id === id);
                    return m ? `${m.brand} ${m.model}` : '未知车型';
                };

                const formatMileageRuleSimple = (rule) => {
                    if (!rule) return '无';
                    return `含${rule.freeKm}km · ¥${rule.pricePerKm}/km`;
                };

                const normalizeMileageLockFields = () => {
                    if (!currentGroup.mileageRule) {
                        currentGroup.mileageRule = { freeKm: 0, pricePerKm: 1.5, dailyCap: 0 };
                    }

                    if (currentType.value === 'SHARING') {
                        currentGroup.mileageRule.freeKm = 0;
                        currentGroup.mileageRule.dailyCap = 0;
                    }

                    currentGroup.models.forEach(model => {
                        if (!model.mileageRule) {
                            model.mileageRule = { freeKm: 0, pricePerKm: currentGroup.mileageRule.pricePerKm || 1.5, dailyCap: 0 };
                        }

                        if (currentType.value === 'SHARING') {
                            model.mileageRule.freeKm = 0;
                            model.mileageRule.dailyCap = 0;
                        }
                    });
                };

                const ensureSharingPriceFields = () => {
                    if (currentType.value !== 'SHARING') return;

                    currentGroup.enableSameStation = true;
                    currentGroup.enableDiffStation = true;

                    if (currentGroup.sameStationHolidayHourlyPrice === undefined) {
                        currentGroup.sameStationHolidayHourlyPrice = currentGroup.sameStationHourlyPrice || 0;
                    }
                    if (currentGroup.sameStationHolidayDailyPrice === undefined) {
                        currentGroup.sameStationHolidayDailyPrice = currentGroup.sameStationDailyPrice || 0;
                    }
                    if (currentGroup.diffStationHolidayHourlyPrice === undefined) {
                        currentGroup.diffStationHolidayHourlyPrice = currentGroup.diffStationHourlyPrice || 0;
                    }
                    if (currentGroup.diffStationHolidayDailyPrice === undefined) {
                        currentGroup.diffStationHolidayDailyPrice = currentGroup.diffStationDailyPrice || 0;
                    }
                };

                // --- Actions ---
                const openDialog = (type) => {
                    isEdit.value = false;
                    currentType.value = type;
                    Object.assign(currentGroup, {
                        id: Date.now().toString(),
                        name: '',
                        aliasName: '',
                        type: type,
                        dailyPrice: type === 'SHARING' ? 199 : 299,
                        hourlyPrice: type === 'SHARING' ? 29 : 0,
                        enableSameStation: true,
                        sameStationHourlyPrice: type === 'SHARING' ? 25 : 0,
                        sameStationDailyPrice: type === 'SHARING' ? 150 : 0,
                        sameStationHolidayHourlyPrice: type === 'SHARING' ? 35 : 0,
                        sameStationHolidayDailyPrice: type === 'SHARING' ? 180 : 0,
                        enableDiffStation: true,
                        diffStationHourlyPrice: type === 'SHARING' ? 35 : 0,
                        diffStationDailyPrice: type === 'SHARING' ? 220 : 0,
                        diffStationHolidayHourlyPrice: type === 'SHARING' ? 45 : 0,
                        diffStationHolidayDailyPrice: type === 'SHARING' ? 260 : 0,
                        isUnifiedMileage: type === 'STORE', // Default Sharing to individual, Store to unified (preference)
                        mileageRule: { freeKm: 0, pricePerKm: 1.5, dailyCap: 0 },
                        models: [],
                        isSpecial: false, specialMembershipRequired: ''
                    });
                    ensureSharingPriceFields();
                    normalizeMileageLockFields();
                    dialogVisible.value = true;
                };

                const openEdit = (group) => {
                    isEdit.value = true;
                    currentType.value = group.type;
                    // Deep copy to avoid modifying original during edit cancel
                    Object.assign(currentGroup, JSON.parse(JSON.stringify(group)));
                    // Ensure mileageRule exists even if old data missing
                    if (!currentGroup.mileageRule) {
                        currentGroup.mileageRule = { freeKm: 0, pricePerKm: 1.5, dailyCap: 0 };
                    }
                    if (currentGroup.isUnifiedMileage === undefined) {
                        currentGroup.isUnifiedMileage = currentType.value === 'STORE';
                    }
                    if (currentType.value === 'SHARING') {
                        currentGroup.enableSameStation = group.enableSameStation !== undefined ? group.enableSameStation : true;
                        currentGroup.enableDiffStation = group.enableDiffStation !== undefined ? group.enableDiffStation : true;
                        currentGroup.sameStationHolidayHourlyPrice = group.sameStationHolidayHourlyPrice !== undefined
                            ? group.sameStationHolidayHourlyPrice
                            : (group.sameStationHourlyPrice || 0);
                        currentGroup.sameStationHolidayDailyPrice = group.sameStationHolidayDailyPrice !== undefined
                            ? group.sameStationHolidayDailyPrice
                            : (group.sameStationDailyPrice || 0);
                        currentGroup.diffStationHolidayHourlyPrice = group.diffStationHolidayHourlyPrice !== undefined
                            ? group.diffStationHolidayHourlyPrice
                            : (group.diffStationHourlyPrice || 0);
                        currentGroup.diffStationHolidayDailyPrice = group.diffStationHolidayDailyPrice !== undefined
                            ? group.diffStationHolidayDailyPrice
                            : (group.diffStationDailyPrice || 0);
                    }
                    ensureSharingPriceFields();
                    normalizeMileageLockFields();
                    dialogVisible.value = true;
                };

                const saveGroup = () => {
                    if (!currentGroup.name) {
                        ElMessage.warning('请输入产品组名称');
                        return;
                    }
                    if (currentGroup.models.length === 0) {
                        ElMessage.warning('请至少关联一款车型');
                        return;
                    }

                    ensureSharingPriceFields();
                    normalizeMileageLockFields();

                    if (isEdit.value) {
                        const idx = productGroups.value.findIndex(g => g.id === currentGroup.id);
                        if (idx !== -1) productGroups.value[idx] = JSON.parse(JSON.stringify(currentGroup));
                    } else {
                        productGroups.value.push(JSON.parse(JSON.stringify(currentGroup)));
                    }
                    dialogVisible.value = false;
                    ElMessage.success('保存成功');
                };

                const deleteGroup = (group) => {
                    ElMessageBox.confirm(`确定要删除产品组 "${group.name}" 吗?`, '警告', { type: 'warning' })
                        .then(() => {
                            const idx = productGroups.value.findIndex(g => g.id === group.id);
                            if (idx !== -1) productGroups.value.splice(idx, 1);
                            ElMessage.success('删除成功');
                        });
                };

                // Model Selector Actions
                const addModelToGroup = (model) => {
                    // Check if already added
                    if (currentGroup.models.find(m => m.modelId === model.id)) {
                        ElMessage.warning('该车型已添加');
                        return;
                    }

                    const newModelEntry = {
                        modelId: model.id,
                        // Initialize rule based on current Group setting if unified, or default
                        mileageRule: currentGroup.isUnifiedMileage ? JSON.parse(JSON.stringify(currentGroup.mileageRule)) : { freeKm: 0, pricePerKm: 1.5, dailyCap: 0 }
                    };

                    currentGroup.models.push(newModelEntry);
                    normalizeMileageLockFields();
                    showModelSelector.value = false;
                };

                const removeModel = (index) => {
                    currentGroup.models.splice(index, 1);
                };

                return {
                    activeTab, sharingAuthMode, hasSameStationAuth, hasDiffStationAuth, sharingAuthLabel,
                    sharingGroups, storeGroups,
                    productVersionRecords, productVersionDialogVisible, selectedProductVersion, openProductVersion,
                    getModelName, formatMileageRuleSimple, normalizeMileageLockFields,
                    dialogVisible, isEdit, currentType, currentGroup,
                    openDialog, openEdit, saveGroup, deleteGroup,
                    // Model Selector
                    showModelSelector, modelSearch, filteredAvailableModels,
                    addModelToGroup, removeModel
                };
            
  },
};
</script>

<style scoped>
        .service-products-page {
            min-height: 100%;
        }

        .app-page-tabs > :deep(.el-tabs__header) {
            padding: 0 24px;
            margin: 0;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__nav-wrap::after) {
            height: 1px;
            background-color: #eef2f7;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item) {
            padding: 0 18px;
            height: 44px;
            color: #6b7280;
            font-size: 14px;
            font-weight: 600;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item:first-child) {
            padding-left: 0;
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item.is-active),
        .app-page-tabs > :deep(.el-tabs__header .el-tabs__item:hover) {
            color: var(--app-color-primary);
        }

        .app-page-tabs > :deep(.el-tabs__header .el-tabs__active-bar) {
            background-color: var(--app-color-primary);
            height: 3px;
            border-radius: 999px;
        }

        .service-product-tabs > :deep(.el-tabs__header .el-tabs__nav) {
            display: flex;
        }

        .service-product-tabs > :deep(.el-tabs__header #tab-STORE) {
            order: 1;
            padding-left: 0;
        }

        .service-product-tabs > :deep(.el-tabs__header #tab-SHARING) {
            order: 2;
            padding-left: 18px;
        }
</style>
