<template>
<div class="services-page">
            
            

            
            <main class="relative">
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">增值服务管理</h1>
                        <p class="text-gray-500 text-sm mt-1">管理门市租赁及分时租赁的增值服务、保险及设备。</p>
                    </div>
                </div>

                
                <el-tabs v-model="activeTab"
                    class="app-page-tabs bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px]">
                    
                    <el-tab-pane name="store">
                        <template #label>
                            <span class="flex items-center gap-2">
                                <el-icon>
                                    <Shop></Shop>
                                </el-icon>
                                <span>门市租赁</span>
                            </span>
                        </template>
                        <div class="p-6">
                            
                            <div class="flex justify-between items-center mb-6">
                                <div class="text-sm text-gray-500">
                                    <span class="font-bold text-gray-700">说明：</span> 管理门市业务下的实物设备库存及基础保险服务。
                                </div>
                                <div class="flex items-center gap-3">
                                    <el-button plain @click="openServiceVersion()">历史版本</el-button>
                                    <el-button type="primary" size="large" class="shadow-md shadow-theme-primary/20" @click="openServiceDialog(null)">
                                        <el-icon class="mr-1">
                                            <Plus></Plus>
                                        </el-icon> 新增门市服务
                                    </el-button>
                                </div>
                            </div>

                            
                            <el-table :data="filteredServiceList" style="width: 100%">
                                <el-table-column prop="name" label="服务名称" min-width="180">
                                    <template #default="{ row }">
                                        <div class="flex items-center">
                                            <div 
                                                class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                                                <el-icon class="text-indigo-600 text-lg">
                                                    <component :is="row.icon" ></component>
                                                </el-icon>
                                            </div>
                                            <div>
                                                <div class="font-medium text-gray-900">{{ row.name }}</div>
                                                <div class="text-xs text-gray-400">{{ row.code }}</div>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="类型" width="100">
                                    <template #default="{ row }">
                                        <el-tag 
                                            :type="row.category === 'insurance' ? 'danger' : (row.category === 'equipment' ? 'success' : 'info')"
                                            effect="plain" size="small">{{ getCategoryLabel(row.category) }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="适用会员" min-width="120">
                                    <template #default="{ row }">
                                        <div v-if="!row.membershipRestriction || row.membershipRestriction.length === 0"
                                            class="text-gray-400 text-xs">全部会员</div>
                                        <div v-else class="flex flex-wrap gap-1">
                                            <el-tag v-for="m in row.membershipRestriction" :key="m" size="small"
                                                type="info" effect="light">{{ m }}</el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="价格" width="140">
                                    <template #default="{ row }">
                                        <span class="font-bold text-orange-600">¥{{ row.price }}</span>
                                        <span class="text-xs text-gray-400">/{{ row.priceUnit === 'day' ? '天' :
                                            ((row.priceUnit === 'hour') ? '时' : '次') }}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="库存/数量" width="130" align="center">
                                    <template #default="{ row }">
                                        <div v-if="row.trackInventory"><el-tag type="warning" effect="plain"
                                                size="small">按门店</el-tag></div>
                                        <div v-else><span class="text-gray-400 text-xs">无限库存</span></div>
                                        <div class="text-xs text-gray-400 mt-1">限 {{ row.maxQuantity }} 件</div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="status" label="状态" width="100">
                                    <template #default="{ row }">
                                        <el-switch v-model="row.status" :active-value="true" :inactive-value="false"
                                            style="--el-switch-on-color: #10b981;"></el-switch>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="200" align="right">
                                    <template #default="{ row }">
                                        <el-button type="primary" link @click="openServiceDialog(row)">编辑</el-button>
                                        <el-button type="success" link @click="openInventoryDialog(row)"
                                            v-if="row.trackInventory">库存</el-button>
                                        <el-button type="danger" link @click="deleteService(row)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-tab-pane>

                    
                    <el-tab-pane name="sharing">
                        <template #label>
                            <span class="flex items-center gap-2">
                                <el-icon>
                                    <Clock></Clock>
                                </el-icon>
                                <span>分时租赁</span>
                            </span>
                        </template>
                        <div class="p-6">
                            
                            <div class="flex justify-between items-center mb-6">
                                <div class="text-sm text-gray-500">
                                    <span class="font-bold text-gray-700">说明：</span> 分时租车服务支持同站与异地差异化定价，且无实物库存概念。
                                </div>
                                <el-button type="primary" size="large" class="shadow-md shadow-theme-primary/20" @click="openServiceDialog(null)">
                                    <el-icon class="mr-1">
                                        <Plus></Plus>
                                    </el-icon> 新增分时服务
                                </el-button>
                            </div>

                            
                            <el-table :data="filteredServiceList" style="width: 100%">
                                <el-table-column prop="name" label="服务名称" min-width="180">
                                    <template #default="{ row }">
                                        <div class="flex items-center">
                                            <div 
                                                class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mr-3">
                                                <el-icon class="text-indigo-600 text-lg">
                                                    <component :is="row.icon" ></component>
                                                </el-icon>
                                            </div>
                                            <div>
                                                <div class="font-medium text-gray-900">{{ row.name }}</div>
                                                <div class="text-xs text-gray-400">{{ row.code }}</div>
                                                <div class="flex gap-1 mt-1">
                                                    <span v-if="row.scopes.includes('SHARING_ROUND')"
                                                        class="text-[10px] bg-purple-50 text-purple-600 px-1 rounded">分时-同站</span>
                                                    <span v-if="row.scopes.includes('SHARING_ONEWAY')"
                                                        class="text-[10px] bg-pink-50 text-pink-600 px-1 rounded">分时-异地</span>
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="类型" width="100">
                                    <template #default="{ row }">
                                        <el-tag 
                                            :type="row.category === 'insurance' ? 'danger' : (row.category === 'equipment' ? 'success' : 'info')"
                                            effect="plain" size="small">{{ getCategoryLabel(row.category) }}</el-tag>
                                    </template>
                                </el-table-column>
                                <el-table-column label="适用会员" min-width="120">
                                    <template #default="{ row }">
                                        <div v-if="!row.membershipRestriction || row.membershipRestriction.length === 0"
                                            class="text-gray-400 text-xs">全部会员</div>
                                        <div v-else class="flex flex-wrap gap-1">
                                            <el-tag v-for="m in row.membershipRestriction" :key="m" size="small"
                                                type="info" effect="light">{{ m }}</el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="价格机制" width="180">
                                    <template #default="{ row }">
                                        <div class="text-xs text-gray-500 italic">
                                            <div v-if="row.scopes.includes('SHARING_ROUND')">同站: 差异化定价</div>
                                            <div v-if="row.scopes.includes('SHARING_ONEWAY')">异地: 差异化定价</div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="限制" width="130" align="center">
                                    <template #default="{ row }">
                                        <div class="text-xs text-gray-400 mt-1">限 {{ row.maxQuantity }} 件</div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="status" label="状态" width="100">
                                    <template #default="{ row }">
                                        <el-switch v-model="row.status" :active-value="true" :inactive-value="false"
                                            style="--el-switch-on-color: #10b981;"></el-switch>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="200" align="right">
                                    <template #default="{ row }">
                                        <el-button type="primary" link @click="openServiceDialog(row)">编辑</el-button>
                                        <el-button type="danger" link @click="deleteService(row)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </main>
        </div>

        
        <el-dialog v-model="serviceDialogVisible"
            :title="isEditService ? '编辑增值服务' : (activeTab === 'store' ? '新增门市服务' : '新增分时服务')" width="800px" top="5vh">
            <el-form :model="currentService" label-width="100px" label-position="top">

                
                <div v-if="activeTab === 'sharing'" class="bg-indigo-50 p-4 rounded-lg mb-4 border border-indigo-100">
                    <el-form-item label="适用场景 (必选)" required class="mb-0">
                        <el-checkbox-group v-model="currentService.scopes" @change="initSharingPricingStructure">
                            <el-checkbox label="SHARING_ROUND">同站租还 (Round Trip)</el-checkbox>
                            <el-checkbox label="SHARING_ONEWAY">异地还车 (One-Way)</el-checkbox>
                        </el-checkbox-group>
                        <div class="text-xs text-indigo-400 mt-1">* 勾选不同场景将分别配置价格</div>
                    </el-form-item>
                </div>

                <el-row :gutter="24">
                    <el-col :span="12">
                        <el-form-item label="服务名称" required>
                            <el-input v-model="currentService.name" placeholder="例如：全车驾乘险" size="large"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item label="服务编码" required>
                            <el-input v-model="currentService.code" placeholder="例如：INSURANCE_FULL"
                                size="large"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row :gutter="24">
                    <el-col :span="8">
                        <el-form-item label="服务类型">
                            <el-select v-model="currentService.category" size="large" style="width: 100%">
                                <el-option label="保险类" value="insurance"></el-option>
                                <el-option label="设备类" value="equipment"></el-option>
                                <el-option label="服务类" value="service"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="图标">
                            <el-select v-model="currentService.icon" size="large" style="width: 100%">
                                <el-option label="保险盾牌" value="Shield"></el-option>
                                <el-option label="座椅" value="Seat"></el-option>
                                <el-option label="GPS定位" value="Location"></el-option>
                                <el-option label="WiFi" value="Connection"></el-option>
                                <el-option label="礼品" value="Present"></el-option>
                                <el-option label="其他" value="More"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="会员限制">
                            <el-select v-model="currentService.membershipRestriction" multiple collapse-tags
                                placeholder="不限" size="large" style="width: 100%">
                                <el-option v-for="plan in membershipPlans" :key="plan.id" :label="plan.name"
                                    :value="plan.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                
                <div v-if="isStoreScope">
                    <el-divider content-position="left">门市租赁定价</el-divider>
                    <el-row :gutter="24">
                        <el-col :span="8">
                            <el-form-item label="价格" required>
                                <el-input-number v-model="currentService.price" :min="0" :precision="2" size="large"
                                    style="width: 100%"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="计价单位">
                                <el-select v-model="currentService.priceUnit" size="large" style="width: 100%">
                                    <el-option label="按天" value="day"></el-option>
                                    <el-option label="按次" value="order"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8">
                            <el-form-item label="最大加购数量">
                                <el-input-number v-model="currentService.maxQuantity" :min="1" :max="10" size="large"
                                    style="width: 100%"></el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="24">
                        <el-col :span="12">
                            <el-form-item label="库存管理">
                                <el-switch v-model="currentService.trackInventory" active-text="按门店管理"
                                    inactive-text="无限供应"></el-switch>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="状态">
                                <el-switch v-model="currentService.status" active-text="启用"
                                    inactive-text="禁用"></el-switch>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>

                
                <div v-if="isSharingScope">

                    
                    <div v-if="currentService.scopes.includes('SHARING_ROUND')" class="mb-6">
                        <el-divider content-position="left"><span class="text-purple-600 font-bold">同站租还 -
                                差异化定价</span></el-divider>
                        <el-table :data="vehicleGroups" border size="small" style="width: 100%">
                            <el-table-column prop="name" label="适用车组" width="180"></el-table-column>
                            <el-table-column label="时服务费 (元/小时)">
                                <template #default="{ row }">
                                    <el-input-number v-if="currentService.sharingPricing['SHARING_ROUND'][row.id]"
                                        v-model="currentService.sharingPricing['SHARING_ROUND'][row.id].hourly" :min="0"
                                        :precision="2" size="small" controls-position="right" style="width: 100%">
                                    </el-input-number>
                                </template>
                            </el-table-column>
                            <el-table-column label="日封顶 (元/天)">
                                <template #default="{ row }">
                                    <el-input-number v-if="currentService.sharingPricing['SHARING_ROUND'][row.id]"
                                        v-model="currentService.sharingPricing['SHARING_ROUND'][row.id].cap" :min="0"
                                        :precision="2" size="small" controls-position="right" style="width: 100%">
                                    </el-input-number>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>

                    
                    <div v-if="currentService.scopes.includes('SHARING_ONEWAY')" class="mb-6">
                        <el-divider content-position="left"><span class="text-pink-600 font-bold">异地还车 -
                                差异化定价</span></el-divider>
                        <el-table :data="vehicleGroups" border size="small" style="width: 100%">
                            <el-table-column prop="name" label="适用车组" width="180"></el-table-column>
                            <el-table-column label="时服务费 (元/小时)">
                                <template #default="{ row }">
                                    <el-input-number v-if="currentService.sharingPricing['SHARING_ONEWAY'][row.id]"
                                        v-model="currentService.sharingPricing['SHARING_ONEWAY'][row.id].hourly"
                                        :min="0" :precision="2" size="small" controls-position="right"
                                        style="width: 100%">
                                    </el-input-number>
                                </template>
                            </el-table-column>
                            <el-table-column label="日封顶 (元/天)">
                                <template #default="{ row }">
                                    <el-input-number v-if="currentService.sharingPricing['SHARING_ONEWAY'][row.id]"
                                        v-model="currentService.sharingPricing['SHARING_ONEWAY'][row.id].cap" :min="0"
                                        :precision="2" size="small" controls-position="right" style="width: 100%">
                                    </el-input-number>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>

                <el-form-item label="服务说明">
                    <el-input v-model="currentService.description" type="textarea" :rows="3"
                        placeholder="描述服务内容和注意事项..."></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="serviceDialogVisible = false">取消</el-button>
                <el-button type="primary" color="#4f46e5" @click="saveService">保存</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="inventoryDialogVisible" :title="'门店库存管理'" width="720px" class="inventory-dialog">
            
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-5 mb-6 text-white">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <div class="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                            <el-icon class="text-2xl">
                                <component :is="inventoryService.icon || 'More'" ></component>
                            </el-icon>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg">{{ inventoryService.name }}</h3>
                            <p class="text-white/70 text-sm">{{ inventoryService.code }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold">{{ getTotalStock() }}</div>
                        <div class="text-white/70 text-sm">总库存</div>
                    </div>
                </div>
            </div>

            
            <div class="space-y-3 max-h-[400px] overflow-y-auto custom-scroll pr-2">
                <div v-for="store in storeInventory" :key="store.storeId"
                    class="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between">
                        
                        <div class="flex items-center">
                            <div 
                                class="w-10 h-10 bg-white rounded-lg border flex items-center justify-center mr-3 shadow-sm">
                                <el-icon class="text-gray-500">
                                    <OfficeBuilding></OfficeBuilding>
                                </el-icon>
                            </div>
                            <div>
                                <div class="font-medium text-gray-800">{{ store.storeName }}</div>
                                <div class="text-xs text-gray-400">ID: {{ store.storeId }}</div>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-6">
                            <div class="text-center">
                                <div class="text-xs text-gray-400 mb-1">库存</div>
                                <el-input-number v-model="store.stock" :min="0" size="small" style="width: 100px"
                                    controls-position="right"></el-input-number>
                            </div>
                            <div class="text-center w-14">
                                <div class="text-xs text-gray-400 mb-1">已占用</div>
                                <div class="text-orange-500 font-bold text-lg">{{ store.reserved }}</div>
                            </div>
                            <div class="text-center w-14">
                                <div class="text-xs text-gray-400 mb-1">可用</div>
                                <div class="font-bold text-lg"
                                    :class="store.stock - store.reserved > 0 ? 'text-green-600' : 'text-red-500'">
                                    {{ store.stock - store.reserved }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-400">提示：修改后请点击保存以生效</span>
                    <div>
                        <el-button @click="inventoryDialogVisible = false">取消</el-button>
                        <el-button type="primary" color="#4f46e5" @click="saveInventory">
                            <el-icon class="mr-1">
                                <Check></Check>
                            </el-icon> 保存库存
                        </el-button>
                    </div>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="serviceVersionDialogVisible" title="增值服务历史版本" width="880px" destroy-on-close>
            <div class="grid grid-cols-3 gap-4" v-if="selectedServiceVersion">
                <div class="col-span-1 border border-gray-100 rounded-lg overflow-hidden">
                    <div class="px-3 py-2 bg-gray-50 text-xs font-bold text-gray-500">版本列表</div>
                    <div class="divide-y divide-gray-100 max-h-[420px] overflow-y-auto">
                        <button v-for="version in filteredServiceVersionRecords" :key="version.version"
                            class="w-full text-left px-3 py-3 hover:bg-indigo-50 transition-colors"
                            :class="selectedServiceVersion.version === version.version ? 'bg-indigo-50' : 'bg-white'"
                            @click="selectedServiceVersion = version">
                            <div class="font-mono text-xs text-indigo-600 font-bold">{{ version.version }}</div>
                            <div class="text-sm text-gray-800 mt-1">{{ version.serviceName }}</div>
                            <div class="text-xs text-gray-400 mt-1">{{ version.savedAt }} · {{ version.status }}</div>
                        </button>
                    </div>
                </div>
                <div class="col-span-2 space-y-4">
                    <div class="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                        <div class="font-mono font-bold text-gray-900">{{ selectedServiceVersion.version }}</div>
                        <div class="text-sm text-gray-700 mt-1">{{ selectedServiceVersion.serviceName }}</div>
                        <div class="text-xs text-gray-500 mt-1">保存人：{{ selectedServiceVersion.savedBy }} · {{ selectedServiceVersion.savedAt }}</div>
                    </div>
                    <el-table :data="getServiceVersionBasicRows(selectedServiceVersion)" border size="small">
                        <el-table-column prop="label" label="配置项" width="170" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="value" label="内容" min-width="320" show-overflow-tooltip></el-table-column>
                    </el-table>
                    <div class="font-bold text-gray-800">价格与库存</div>
                    <el-table :data="selectedServiceVersion.pricingRows" border size="small">
                        <el-table-column prop="scope" label="适用范围" min-width="160" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="pricing" label="价格规则" min-width="180" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="limit" label="数量限制" width="120" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="inventory" label="库存口径" min-width="160" show-overflow-tooltip></el-table-column>
                        <el-table-column prop="remark" label="说明" min-width="220" show-overflow-tooltip></el-table-column>
                    </el-table>
                </div>
            </div>
            <template #footer>
                <el-button @click="serviceVersionDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";

// --- 全局状态 ---
                const activeTab = ref('store'); // store, sharing

                // --- 模拟数据 ---
                const vehicleGroups = [
                    { id: 101, name: '经济型 (分时)', type: 'SHARING' },
                    { id: 102, name: '舒适型 (分时)', type: 'SHARING' },
                    { id: 103, name: 'SUV组 (分时)', type: 'SHARING' },
                    { id: 104, name: '商务型 (分时)', type: 'SHARING' },
                    { id: 105, name: '电动车 (分时)', type: 'SHARING' }
                ];

                const membershipPlans = [
                    { id: 'SILVER', name: '白银会员' },
                    { id: 'GOLD', name: '黄金会员' },
                    { id: 'PLATINUM', name: '白金会员' },
                    { id: 'BLACK', name: '黑钻会员' }
                ];

                // --- 服务列表数据 (Mock Data) ---
                const serviceList = ref([
                    // --- 门市租赁服务 ---
                    {
                        id: 1,
                        name: '全车驾乘险',
                        code: 'INS_STORE_FULL',
                        category: 'insurance',
                        icon: 'Shield',
                        price: 88,
                        priceUnit: 'day',
                        maxQuantity: 1,
                        trackInventory: false,
                        status: true,
                        description: '保障车内所有乘客的人身意外伤害及医疗费用，最高保额50万。',
                        scopes: ['STORE'],
                        membershipRestriction: []
                    },
                    {
                        id: 2,
                        name: '儿童安全座椅',
                        code: 'EQ_CHILD_SEAT',
                        category: 'equipment',
                        icon: 'Seat',
                        price: 50,
                        priceUnit: 'day',
                        maxQuantity: 2,
                        trackInventory: true,
                        status: true,
                        description: '适合0-4岁儿童使用的安全座椅，符合欧盟ECE认证标准。',
                        scopes: ['STORE'],
                        membershipRestriction: []
                    },
                    {
                        id: 3,
                        name: '尊享送车上门',
                        code: 'SVC_DELIVERY',
                        category: 'service',
                        icon: 'Location',
                        price: 150,
                        priceUnit: 'order',
                        maxQuantity: 1,
                        trackInventory: false,
                        status: true,
                        description: '五星级管家送车上门，仅限同城20km范围内。',
                        scopes: ['STORE'],
                        membershipRestriction: ['GOLD', 'PLATINUM', 'BLACK'] // 仅限高级会员
                    },
                    {
                        id: 4,
                        name: '车载Wi-Fi热点',
                        code: 'EQ_WIFI',
                        category: 'equipment',
                        icon: 'Connection',
                        price: 30,
                        priceUnit: 'day',
                        maxQuantity: 1,
                        trackInventory: true,
                        status: false, // 暂时下架
                        description: '4G高速网络，无限流量，最多支持5台设备连接。',
                        scopes: ['STORE'],
                        membershipRestriction: []
                    },

                    // --- 分时租车服务 ---
                    {
                        id: 101,
                        name: '基础免赔服务 (同站)',
                        code: 'INS_SHARING_BASIC_ROUND',
                        category: 'insurance',
                        icon: 'Shield',
                        price: 0,
                        priceUnit: 'hour',
                        maxQuantity: 1,
                        trackInventory: false,
                        status: true,
                        description: '分时租车同站还车基础免赔，降低车辆损失赔付额度。',
                        scopes: ['SHARING_ROUND'],
                        membershipRestriction: [],
                        sharingPricing: {
                            'SHARING_ROUND': {
                                101: { hourly: 2, cap: 20 },
                                102: { hourly: 3, cap: 30 },
                                103: { hourly: 4, cap: 40 },
                                104: { hourly: 5, cap: 50 },
                                105: { hourly: 3, cap: 30 }
                            }
                        }
                    },
                    {
                        id: 102,
                        name: '尊享无忧险 (同站)',
                        code: 'INS_SHARING_PLUS_ROUND',
                        category: 'insurance',
                        icon: 'Shield',
                        price: 0,
                        priceUnit: 'hour',
                        maxQuantity: 1,
                        trackInventory: false,
                        status: true,
                        description: '分时租车同站还车尊享0免赔服务，全面保障用车安全。',
                        scopes: ['SHARING_ROUND'],
                        membershipRestriction: ['GOLD', 'PLATINUM', 'BLACK'],
                        sharingPricing: {
                            'SHARING_ROUND': {
                                101: { hourly: 5, cap: 50 },
                                102: { hourly: 8, cap: 80 },
                                103: { hourly: 10, cap: 100 },
                                104: { hourly: 15, cap: 150 },
                                105: { hourly: 8, cap: 80 }
                            }
                        }
                    },
                    {
                        id: 103,
                        name: '异地还车服务费',
                        code: 'SVC_ONEWAY_FEE',
                        category: 'service',
                        icon: 'Location',
                        price: 0,
                        priceUnit: 'hour',
                        maxQuantity: 1,
                        trackInventory: false,
                        status: true,
                        description: '异地还车车辆排程看板及管理费用。',
                        scopes: ['SHARING_ONEWAY'],
                        membershipRestriction: [],
                        sharingPricing: {
                            'SHARING_ONEWAY': {
                                101: { hourly: 10, cap: 100 },
                                102: { hourly: 15, cap: 150 },
                                103: { hourly: 20, cap: 200 },
                                104: { hourly: 25, cap: 250 },
                                105: { hourly: 15, cap: 150 }
                            }
                        }
                    },
                    {
                        id: 104,
                        name: '全能出行保障包',
                        code: 'PKG_ALL_IN_ONE',
                        category: 'insurance',
                        icon: 'Present',
                        price: 0,
                        priceUnit: 'hour',
                        maxQuantity: 1,
                        trackInventory: false,
                        status: true,
                        description: '包含尊享免赔及人身意外险，适用于所有分时场景。',
                        scopes: ['SHARING_ROUND', 'SHARING_ONEWAY'], // 同时适用两种场景
                        membershipRestriction: ['PLATINUM', 'BLACK'],
                        sharingPricing: {
                            'SHARING_ROUND': {
                                101: { hourly: 8, cap: 60 },
                                102: { hourly: 12, cap: 90 },
                                103: { hourly: 15, cap: 120 },
                                104: { hourly: 18, cap: 150 },
                                105: { hourly: 10, cap: 80 }
                            },
                            'SHARING_ONEWAY': {
                                101: { hourly: 10, cap: 80 },
                                102: { hourly: 15, cap: 120 },
                                103: { hourly: 18, cap: 150 },
                                104: { hourly: 22, cap: 180 },
                                105: { hourly: 12, cap: 100 }
                            }
                        }
                    }
                ]);

                // --- 计算属性: 列表过滤 ---
                const filteredServiceList = computed(() => {
                    if (activeTab.value === 'store') {
                        return serviceList.value.filter(s => !s.scopes || s.scopes.includes('STORE'));
                    } else {
                        return serviceList.value.filter(s => s.scopes && (s.scopes.includes('SHARING_ROUND') || s.scopes.includes('SHARING_ONEWAY')));
                    }
                });

                // --- 服务编辑 ---
                const serviceDialogVisible = ref(false);
                const isEditService = ref(false);

                // 默认空对象
                const defaultService = {
                    id: null,
                    name: '',
                    code: '',
                    category: 'insurance',
                    icon: 'Shield',
                    price: 0,
                    priceUnit: 'day',
                    maxQuantity: 1,
                    trackInventory: false,
                    status: true,
                    description: '',
                    scopes: ['STORE'], // 默认门市
                    membershipRestriction: [],
                    sharingPricing: {}
                };

                const currentService = reactive({ ...defaultService });

                const openServiceDialog = (row) => {
                    // 重置
                    Object.assign(currentService, JSON.parse(JSON.stringify(defaultService)));

                    // 如果是在分时TAB下新建，默认勾选分时同站
                    if (!row && activeTab.value === 'sharing') {
                        currentService.scopes = ['SHARING_ROUND'];
                        currentService.priceUnit = 'hour';
                    }

                    if (row) {
                        isEditService.value = true;
                        // 深度拷贝以防修改引用
                        const data = JSON.parse(JSON.stringify(row));
                        // 兼容旧数据
                        if (!data.scopes) data.scopes = ['STORE'];
                        if (!data.membershipRestriction) data.membershipRestriction = [];
                        if (!data.sharingPricing) data.sharingPricing = {};

                        Object.assign(currentService, data);
                    } else {
                        isEditService.value = false;
                        currentService.id = Date.now();
                    }

                    // 初始化分时定价结构 (如果为空)
                    initSharingPricingStructure();

                    serviceDialogVisible.value = true;
                };

                const initSharingPricingStructure = () => {
                    if (!currentService.sharingPricing) currentService.sharingPricing = {};

                    ['SHARING_ROUND', 'SHARING_ONEWAY'].forEach(scope => {
                        if (!currentService.sharingPricing[scope]) {
                            currentService.sharingPricing[scope] = {};
                        }
                        vehicleGroups.forEach(g => {
                            if (!currentService.sharingPricing[scope][g.id]) {
                                currentService.sharingPricing[scope][g.id] = { hourly: 0, cap: 0 };
                            }
                        });
                    });
                };

                const saveService = () => {
                    if (!currentService.name || !currentService.code) {
                        ElMessage.warning('请填写服务名称和编码');
                        return;
                    }

                    // 简单校验定价
                    if (isSharingScope.value) {
                        // 可以在这里加校验逻辑
                    }

                    const index = serviceList.value.findIndex(s => s.id === currentService.id);
                    if (index !== -1) {
                        serviceList.value[index] = JSON.parse(JSON.stringify(currentService));
                    } else {
                        serviceList.value.push(JSON.parse(JSON.stringify(currentService)));
                    }
                    serviceDialogVisible.value = false;
                    ElMessage.success('服务已保存');
                };

                const deleteService = (row) => {
                    const index = serviceList.value.findIndex(s => s.id === row.id);
                    if (index !== -1) {
                        serviceList.value.splice(index, 1);
                        ElMessage.success('服务已删除');
                    }
                };

                const getCategoryLabel = (category) => {
                    const map = { insurance: '保险', equipment: '设备', service: '服务' };
                    return map[category] || '其他';
                };

                // --- 辅助判断 ---
                const isStoreScope = computed(() => currentService.scopes.includes('STORE'));
                const isSharingScope = computed(() =>
                    currentService.scopes.includes('SHARING_ROUND') || currentService.scopes.includes('SHARING_ONEWAY')
                );

                // --- 库存管理 ---
                const inventoryDialogVisible = ref(false);
                const inventoryService = ref({});
                const storeInventory = ref([]);

                const openInventoryDialog = (row) => {
                    inventoryService.value = row;
                    // 模拟门店库存数据
                    storeInventory.value = [
                        { storeId: 1, storeName: '上海虹桥机场店', stock: 10, reserved: 3 },
                        { storeId: 2, storeName: '上海浦东机场店', stock: 8, reserved: 2 },
                        { storeId: 3, storeName: '杭州西湖店', stock: 5, reserved: 1 },
                        { storeId: 4, storeName: '南京南站店', stock: 6, reserved: 0 }
                    ];
                    inventoryDialogVisible.value = true;
                };

                const saveInventory = () => {
                    inventoryDialogVisible.value = false;
                    ElMessage.success('库存已更新');
                };

                const getTotalStock = () => {
                    return storeInventory.value.reduce((sum, s) => sum + s.stock, 0);
                };
                const serviceVersionRecords = ref([
                    {
                        version: 'SVC-STORE-20260418-001',
                        tab: 'store',
                        status: '当前生效',
                        serviceName: '全车驾乘险',
                        serviceCode: 'INS_STORE_FULL',
                        category: '保险',
                        scopeText: '门市租赁',
                        membershipText: '全部会员',
                        priceUnitText: '按天',
                        maxQuantityText: '限 1 件',
                        inventoryText: '无限供应',
                        serviceStatus: '启用',
                        description: '保障车内乘客的人身意外伤害及医疗费用。',
                        savedBy: '产品运营',
                        savedAt: '2026-04-18 15:20',
                        pricingRows: [
                            { scope: '门市租赁', pricing: '¥88/天', limit: '1 件', inventory: '无限供应', remark: '按订单租期天数计费' }
                        ]
                    },
                    {
                        version: 'SVC-STORE-20260412-001',
                        tab: 'store',
                        status: '历史版本',
                        serviceName: '儿童座椅',
                        serviceCode: 'EQP_CHILD_SEAT',
                        category: '设备',
                        scopeText: '门市租赁',
                        membershipText: '全部会员',
                        priceUnitText: '按天',
                        maxQuantityText: '限 2 件',
                        inventoryText: '按门店库存',
                        serviceStatus: '启用',
                        description: '门店按库存提供儿童安全座椅。',
                        savedBy: '产品运营',
                        savedAt: '2026-04-12 10:00',
                        pricingRows: [
                            { scope: '门市租赁', pricing: '¥30/天/件', limit: '2 件', inventory: '按门店库存', remark: '库存不足时不允许加购' }
                        ]
                    },
                    {
                        version: 'SVC-SHARE-20260418-001',
                        tab: 'sharing',
                        status: '当前生效',
                        serviceName: '无烟车保障',
                        serviceCode: 'SRV_SMOKE_FREE',
                        category: '服务',
                        scopeText: '同站租还、甲租乙还',
                        membershipText: '白银 / 黄金 / 白金 / 黑钻',
                        priceUnitText: '按小时/按天封顶',
                        maxQuantityText: '限 1 件',
                        inventoryText: '无库存概念',
                        serviceStatus: '启用',
                        description: '分时订单附加的无烟车清洁与保障服务。',
                        savedBy: '产品运营',
                        savedAt: '2026-04-18 16:05',
                        pricingRows: [
                            { scope: '同站租还', pricing: '经济型 ¥10/时，¥80/天封顶', limit: '1 件', inventory: '无库存概念', remark: '按车组差异化定价' },
                            { scope: '甲租乙还', pricing: '经济型 ¥12/时，¥100/天封顶', limit: '1 件', inventory: '无库存概念', remark: '按车组差异化定价' }
                        ]
                    }
                ]);
                const serviceVersionDialogVisible = ref(false);
                const selectedServiceVersion = ref(null);
                const filteredServiceVersionRecords = computed(() => serviceVersionRecords.value.filter(item => item.tab === activeTab.value));
                const openServiceVersion = () => {
                    selectedServiceVersion.value = filteredServiceVersionRecords.value[0] || serviceVersionRecords.value[0] || null;
                    serviceVersionDialogVisible.value = true;
                };
                const getServiceVersionBasicRows = (version) => {
                    if (!version) return [];
                    return [
                        { label: '服务名称', value: version.serviceName || '-' },
                        { label: '服务编码', value: version.serviceCode || '-' },
                        { label: '服务类型', value: version.category || '-' },
                        { label: '适用场景', value: version.scopeText || '-' },
                        { label: '适用会员', value: version.membershipText || '-' },
                        { label: '计价单位', value: version.priceUnitText || '-' },
                        { label: '最大加购数量', value: version.maxQuantityText || '-' },
                        { label: '库存管理', value: version.inventoryText || '-' },
                        { label: '状态', value: version.serviceStatus || '-' },
                        { label: '服务说明', value: version.description || '-' }
                    ];
                };
</script>

<style scoped>
        .services-page {
            min-height: 100%;
        }

.sidebar-item.active {
            background: linear-gradient(90deg, rgba(99, 102, 241, 0.15) 0%, transparent 100%);
            border-left: 3px solid #6366f1;
        }

        .custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
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
</style>
