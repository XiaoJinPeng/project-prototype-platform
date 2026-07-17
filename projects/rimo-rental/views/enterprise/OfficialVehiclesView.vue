<template>
            <main class="official-vehicles-page">
                
                <PageHeader unstyled class="flex justify-between items-end mb-6" title="公务车辆管理" description="管理各分公司公务车辆调度、合约绑定及可视营运状态。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                    <template #actions>
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20" @click="openAddVehicleModal">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新增车辆
                        </el-button>
                    </template>
                </PageHeader>

                
                <div class="grid grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'total' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('total')">
                        <span class="text-sm text-gray-500 font-medium mb-1">总车辆数</span>
                        <span class="card-value text-gray-800">{{ stats.total }}</span>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'active' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('active')">
                        <span class="text-sm text-gray-500 font-medium mb-1">上架中</span>
                        <div class="flex items-center gap-2"><span class="card-value text-emerald-500">{{ stats.active }}</span><el-tag type="success" size="small" effect="plain" round>在线可见</el-tag></div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'expiringSoon' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('expiringSoon')">
                        <span class="text-sm text-gray-500 font-medium mb-1">合约即将到期 (&lt;15天)</span>
                        <div class="flex items-center gap-2"><span class="card-value text-amber-500">{{ stats.expiringSoon }}</span><el-icon class="text-amber-500 text-xl"><Warning></Warning></el-icon></div>
                    </div>
                    <div class="bg-white rounded-xl shadow-sm border p-5 flex flex-col cursor-pointer hover:border-theme-primary transition-colors" :class="activeSummaryCard === 'frozen' ? 'border-theme-primary ring-1 ring-theme-primary' : 'border-gray-100'" @click="applySummaryFilter('frozen')">
                        <span class="text-sm text-gray-500 font-medium mb-1 border-b border-transparent">已冻结车辆</span>
                        <div class="flex items-center gap-2"><span class="card-value text-red-500">{{ stats.frozen }}</span><el-tag type="danger" size="small" effect="dark" round>强制下架</el-tag></div>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">

                    
                    <div 
                        class="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
                        <div class="flex gap-4 flex-wrap flex-1">
                            <el-input v-model="filters.licensePlate" placeholder="搜索车牌号" prefix-icon="Search" clearable style="width: 140px"></el-input>
                            <el-select v-model="filters.model" placeholder="选择车型" clearable filterable style="width: 140px">
                                <el-option v-for="m in modelOptions" :key="m" :label="m" :value="m"></el-option>
                            </el-select>

                            <el-select v-model="filters.contractId" placeholder="绑定合约编号" clearable style="width: 200px">
                                <el-option label="[C-2023-0801] 集团统采租赁" value="C-2023-0801"></el-option>
                                <el-option label="[C-2024-0012] 华北区分采补充" value="C-2024-0012"></el-option>
                                <el-option label="[C-2022-X773] 旧采购单 (已过期)" value="C-2022-X773"></el-option>
                            </el-select>

                            <el-select v-model="filters.branch" placeholder="可用分公司" clearable style="width: 200px">
                                <el-option label="(未分配) 集团总池" value="UNASSIGNED"></el-option>
                                <el-option v-for="b in branchOptions" :key="b.id" :label="b.name"
                                    :value="b.id"></el-option>
                            </el-select>

                            <el-radio-group v-model="filters.status" class="ml-4">
                                <el-radio-button label="ALL">全部</el-radio-button>
                                <el-radio-button label="ACTIVE">上架中</el-radio-button>
                                <el-radio-button label="INACTIVE">已下架</el-radio-button>
                                <el-radio-button label="FROZEN">已冻结</el-radio-button>
                            </el-radio-group>
                        </div>

                        
                        <div class="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div class="text-sm text-gray-500 font-medium" v-if="selectedRows.length > 0">已选 {{
                                selectedRows.length }} 项</div>
                            <el-button plain v-show="false" :disabled="selectedRows.length === 0"
                                @click="openTransferModal">
                                调拨至分公司
                            </el-button>
                            <el-button type="primary" :disabled="selectedRows.length === 0"
                                @click="openContractModal">
                                批量换绑合约
                            </el-button>
                        </div>
                    </div>

                    
                    <el-table :data="filteredData" style="width: 100%" @selection-change="handleSelectionChange"
                        :row-class-name="tableRowClassName">
                        <el-table-column type="selection" width="50"></el-table-column>

                        <el-table-column label="车牌 / 车型" min-width="180">
                            <template #default="{ row }">
                                <div class="font-bold text-gray-800 text-base">{{ row.licensePlate }}</div>
                                <div class="text-xs text-gray-500 mt-1">{{ row.model }}</div>
                            </template>
                        </el-table-column>

                        <el-table-column label="里程数" width="120" align="right">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700 font-mono">{{ (row.mileage || 0).toLocaleString() }}
                                    <span class="text-xs text-gray-400 font-sans">km</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="累计用车里程" width="150" align="right">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700 font-mono">{{ getCumulativeUsageMileage(row).toLocaleString() }}
                                    <span class="text-xs text-gray-400 font-sans">km</span>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="车辆来源" width="140" align="center">
                            <template #default="{ row }">
                                <el-tag v-if="row.source === 'SELF_OWNED'" type="success" size="small" effect="plain"
                                    class="border-green-200 text-green-600 bg-green-50">自购 (自有资产)</el-tag>
                                <el-tag v-else-if="row.source === 'HESUAN'" type="warning" size="small" effect="plain"
                                    class="border-orange-200 text-orange-600 bg-orange-50">和運租車</el-tag>
                                <el-tag v-else-if="row.source === 'GESHANG'" type="warning" size="small" effect="plain"
                                    class="border-blue-200 text-blue-600 bg-blue-50">格上租車</el-tag>
                                <el-tag v-else-if="row.source === '中租'" type="warning" size="small" effect="plain"
                                    class="border-purple-200 text-purple-600 bg-purple-50">中租租車</el-tag>
                                <el-tag v-else type="info" size="small" effect="plain">其他</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="绑定合约" min-width="240">
                            <template #default="{ row }">
                                <template v-if="row.contract">
                                    <div class="text-sm text-gray-800 font-medium">{{ row.contract.id }}</div>
                                    <div class="text-xs text-gray-500 flex items-center mt-1">
                                        截止: {{ row.contract.endDate }}
                                        
                                        <el-tag 
                                            v-if="getDaysRemaining(row.contract.endDate) >= 0 && getDaysRemaining(row.contract.endDate) < 15"
                                            type="warning" size="small" effect="light" class="ml-2 scale-90">
                                            ⏳ 即将到期
                                        </el-tag>
                                    </div>
                                </template>
                                <template v-else>
                                    <el-tag type="info" size="small" effect="plain"
                                        class="text-gray-500 bg-gray-50 border-gray-200">未绑定</el-tag>
                                </template>
                            </template>
                        </el-table-column>

                        <el-table-column label="可用分公司" min-width="140">
                            <template #default="{ row }">
                                <div v-if="row.branch" class="text-sm text-gray-700">
                                    <el-icon class="mr-1">
                                        <OfficeBuilding></OfficeBuilding>
                                    </el-icon>{{ getBranchName(row.branch) }}
                                </div>
                                <el-tag v-else type="info" size="small" effect="plain"
                                    class="text-gray-500">集团总池</el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="所属站点" min-width="160">
                            <template #default="{ row }">
                                <div class="text-sm text-gray-700">
                                    <el-icon class="mr-1 text-gray-400">
                                        <Location></Location>
                                    </el-icon>
                                    {{ row.stationName || '未分配站点' }}
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="业务状态" width="200" align="center">
                            <template #default="{ row }">
                                
                                <div v-if="!row.contract">
                                    <div class="text-sm font-bold text-gray-400 flex items-center justify-center gap-1">
                                        <el-icon>
                                            <Minus></Minus>
                                        </el-icon> 无效
                                    </div>
                                    <div class="text-[10px] text-gray-400 mt-0.5">(需先绑定合约)</div>
                                </div>
                                
                                <div v-else-if="getDaysRemaining(row.contract.endDate) < 0">
                                    <div class="text-sm font-bold text-red-500 flex items-center justify-center gap-1">
                                        <el-icon>
                                            <Lock></Lock>
                                        </el-icon> 已冻结
                                    </div>
                                    <div class="text-[10px] text-red-400 mt-0.5">(合约过期禁止上架)</div>
                                </div>
                                <div v-else class="flex flex-col items-center">
                                    <el-switch v-model="row.isActive" inline-prompt active-text="上架" inactive-text="下架"
                                        style="--el-switch-on-color: #10b981; --el-switch-off-color: #9ca3af"></el-switch>
                                </div>
                            </template>
                        </el-table-column>

                        <el-table-column label="操作" width="200" align="right" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link size="small">详情</el-button>
                                <el-button type="primary" link size="small">编辑车辆</el-button>
                                <el-button type="primary" link size="small"
                                    @click="openContractModalSingle(row)">换绑合约</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </main>

        
        <el-dialog v-model="modals.addVehicle" title="新增公务车辆" width="920px" top="4vh" destroy-on-close>
            <el-form :model="addVehicleForm" label-position="top" class="h-[620px] overflow-hidden flex flex-col">
                <el-tabs v-model="activeAddVehicleTab" class="flex-1 overflow-hidden">
                    <el-tab-pane label="基础资料" name="BASIC" class="h-full overflow-y-auto custom-scroll pr-2">
                        <el-divider content-position="left"><el-icon><Tickets></Tickets></el-icon> 车辆识别</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="车牌号码" required>
                                <div class="flex items-end gap-2">
                                    <el-input v-model="addVehicleForm.plateNo" placeholder="请输入车牌号码" class="flex-1"></el-input>
                                    <el-button type="primary" plain @click="syncAddVehicleSeed">同步带入</el-button>
                                </div>
                            </el-form-item>
                            <el-form-item label="车辆名称（昵称）" required>
                                <el-input v-model="addVehicleForm.nickname" placeholder="例如：公务接待车" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="厂牌" required>
                                <el-select v-model="addVehicleForm.brandId" placeholder="请选择厂牌" class="w-full" @change="handleAddVehicleBrandChange">
                                    <el-option v-for="item in addVehicleBrandOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车款" required>
                                <el-select v-model="addVehicleForm.modelId" placeholder="请选择车款" class="w-full" @change="handleAddVehicleModelChange">
                                    <el-option v-for="item in filteredAddVehicleModelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车辆类型" required>
                                <el-select v-model="addVehicleForm.vehicleType" placeholder="请选择车辆类型" class="w-full">
                                    <el-option v-for="item in addVehicleTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车款年份" required>
                                <el-date-picker v-model="addVehicleForm.modelYear" type="year" placeholder="请选择年份" format="YYYY" value-format="YYYY" style="width: 100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="VIN">
                                <el-input v-model="addVehicleForm.vin" placeholder="请输入 VIN" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="引擎编号">
                                <el-input v-model="addVehicleForm.engineNo" placeholder="请输入引擎编号" class="w-full"></el-input>
                            </el-form-item>
                        </div>

                        <el-divider content-position="left"><el-icon><OfficeBuilding></OfficeBuilding></el-icon> 资产归属与位置</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="资产归属分公司" required>
                                <el-select v-model="addVehicleForm.assetBranch" placeholder="请选择资产归属分公司" class="w-full" @change="handleAddVehicleBranchChange">
                                    <el-option v-for="item in addVehicleBranchOptions" :key="item.id" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="所在据点" required>
                                <el-select v-model="addVehicleForm.siteId" placeholder="请选择所在据点" class="w-full">
                                    <el-option v-for="item in filteredAddVehicleSiteOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车辆来源">
                                <el-select v-model="addVehicleForm.sourceType" placeholder="请选择车辆来源" class="w-full">
                                    <el-option v-for="item in addVehicleSourceOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车主（车辆所有人）">
                                <el-input v-model="addVehicleForm.ownerName" placeholder="请输入车辆所有人" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="上架里程" required>
                                <el-input v-model="addVehicleForm.listingMileage" placeholder="请输入上架里程" class="w-full">
                                    <template #append>km</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="启用状态" required>
                                <el-radio-group v-model="addVehicleForm.enableStatus">
                                    <el-radio label="inactive">未启用</el-radio>
                                    <el-radio label="active">启用</el-radio>
                                    <el-radio label="archived">封存</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="规格资料" name="SPEC" class="h-full overflow-y-auto custom-scroll pr-2">
                        <el-divider content-position="left"><el-icon><Van></Van></el-icon> 车辆规格</el-divider>
                        <div class="grid grid-cols-3 gap-x-6 gap-y-2">
                            <el-form-item label="是否国产">
                                <el-select v-model="addVehicleForm.domesticFlag" placeholder="请选择" class="w-full">
                                    <el-option label="国产" value="domestic"></el-option>
                                    <el-option label="进口" value="imported"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="燃料类型">
                                <el-select v-model="addVehicleForm.fuelType" placeholder="请选择燃料类型" class="w-full">
                                    <el-option label="汽油" value="gasoline"></el-option>
                                    <el-option label="柴油" value="diesel"></el-option>
                                    <el-option label="油电" value="hybrid"></el-option>
                                    <el-option label="纯电" value="ev"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="出厂日期">
                                <el-date-picker v-model="addVehicleForm.releaseDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD" style="width: 100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="座位数" required>
                                <el-input-number v-model="addVehicleForm.seats" :min="1" :max="20" class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="车门数量" required>
                                <el-input-number v-model="addVehicleForm.doorCount" :min="1" :max="8" class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="变速箱类型" required>
                                <el-select v-model="addVehicleForm.gearboxType" placeholder="请选择变速箱类型" class="w-full">
                                    <el-option label="自排" value="auto"></el-option>
                                    <el-option label="手排" value="manual"></el-option>
                                    <el-option label="CVT" value="cvt"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车身颜色" required>
                                <el-select v-model="addVehicleForm.color" placeholder="请选择车身颜色" class="w-full">
                                    <el-option v-for="item in addVehicleColorOptions" :key="item" :label="item" :value="item"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="排气量 (cc)" required>
                                <el-input v-model="addVehicleForm.displacement" placeholder="请输入排气量" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="油箱容量 (L)" required>
                                <el-input v-model="addVehicleForm.tankCapacity" placeholder="请输入油箱容量" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="行李箱容量 (L)">
                                <el-input v-model="addVehicleForm.trunkCapacity" placeholder="请输入行李箱容量" class="w-full"></el-input>
                            </el-form-item>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="运营配置" name="OPS" class="h-full overflow-y-auto custom-scroll pr-2">
                        <el-divider content-position="left"><el-icon><PriceTag></PriceTag></el-icon> 标签与设备</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="车辆标签">
                                <el-select v-model="addVehicleForm.tagIds" multiple collapse-tags collapse-tags-tooltip filterable placeholder="请选择车辆标签" class="w-full">
                                    <el-option v-for="item in addVehicleTagOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车机编号">
                                <el-select v-model="addVehicleForm.deviceCode" placeholder="请选择车机编号" class="w-full">
                                    <el-option v-for="item in addVehicleDeviceOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="ETC 卡号">
                                <el-input v-model="addVehicleForm.etcCardNo" placeholder="请输入 ETC 卡号" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="iButton 编号">
                                <el-input v-model="addVehicleForm.iButtonCode" placeholder="请输入 iButton 编号" class="w-full"></el-input>
                            </el-form-item>
                        </div>

                        <el-divider content-position="left"><el-icon><WarningFilled></WarningFilled></el-icon> 特殊车辆</el-divider>
                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4">
                            <el-checkbox v-model="addVehicleForm.specialVehicle">标记为特殊车款</el-checkbox>
                            <div class="text-xs text-yellow-700 mt-1">仅影响企业内部可见性和预约资格，不改变车辆资产归属。</div>
                        </div>

                        <el-divider content-position="left"><el-icon><PictureFilled></PictureFilled></el-icon> 车辆照片</el-divider>
                        <div class="vehicle-create-photo">
                            <div class="vehicle-create-photo-box" @click="appendAddVehiclePhotoMock">
                                <el-icon><PictureFilled></PictureFilled></el-icon>
                                <div>点击补充车辆照片</div>
                                <div class="text-[11px] text-slate-400">用于列表预览与车辆详情</div>
                            </div>
                            <div class="vehicle-create-photo-list">
                                <div v-for="(photo, index) in addVehiclePhotoMocks" :key="photo.key" class="vehicle-create-photo-item">
                                    <div class="vehicle-create-photo-item__preview">{{ photo.title }}</div>
                                    <div class="vehicle-create-photo-item__meta">
                                        <div class="font-semibold text-gray-700">{{ photo.caption }}</div>
                                        <div class="text-gray-400 mt-1">第 {{ index + 1 }} 张</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="维保保险" name="HEALTH" class="h-full overflow-y-auto custom-scroll pr-2">
                        <el-divider content-position="left"><el-icon><Tools></Tools></el-icon> 维保资料</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="上次保养里程">
                                <el-input v-model="addVehicleForm.lastMaintenanceMileage" placeholder="请输入上次保养里程" class="w-full">
                                    <template #append>km</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="上次保养时间">
                                <el-date-picker v-model="addVehicleForm.lastMaintenanceDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD" style="width: 100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="上次清洁时间">
                                <el-date-picker v-model="addVehicleForm.lastCleaningDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD" style="width: 100%"></el-date-picker>
                            </el-form-item>
                        </div>

                        <el-divider content-position="left"><el-icon><Document></Document></el-icon> 保险资料</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="保单号码">
                                <el-input v-model="addVehicleForm.policyNo" placeholder="请输入保单号码" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="保险类型">
                                <el-select v-model="addVehicleForm.insuranceType" placeholder="请选择保险类型" class="w-full">
                                    <el-option label="甲式全险" value="full"></el-option>
                                    <el-option label="乙式车体险" value="car_body"></el-option>
                                    <el-option label="强制险" value="compulsory"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="投保日期">
                                <el-date-picker v-model="addVehicleForm.insuranceDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD" style="width: 100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="到期日期">
                                <el-date-picker v-model="addVehicleForm.insuranceExpireDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD" style="width: 100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="保额">
                                <el-input v-model="addVehicleForm.coverageAmount" placeholder="请输入保额" class="w-full"></el-input>
                            </el-form-item>
                            <el-form-item label="理赔金额">
                                <el-input v-model="addVehicleForm.claimAmount" placeholder="请输入理赔金额" class="w-full"></el-input>
                            </el-form-item>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </el-form>

            <template #footer>
                <el-button @click="modals.addVehicle = false">取消</el-button>
                <el-button type="primary" @click="submitAddVehicle">保存</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="modals.transfer" title="批量调拨车辆" width="480px">
            <div class="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-4 border border-blue-100 flex gap-2">
                <el-icon class="mt-0.5">
                    <InfoFilled></InfoFilled>
                </el-icon>
                <span>已选中 <strong class="text-blue-600">{{ selectedRows.length }}</strong>
                    辆车，确认调拨后将转移至目标分公司的管理资产中，原组织人员将无法调度上述车辆。</span>
            </div>

            <el-form label-position="top">
                <el-form-item label="选择目标分公司" required>
                    <el-select v-model="transferTargetBranch" class="w-full" filterable placeholder="选择要调拨到的分公司">
                        <el-option label="[撤回] 退至集团总池" value="UNASSIGNED"></el-option>
                        <el-option v-for="b in branchOptions" :key="b.id" :label="b.name" :value="b.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="modals.transfer = false">取消</el-button>
                <el-button type="primary" @click="confirmTransfer"
                    :disabled="!transferTargetBranch">确认调拨</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="modals.contract" title="更换绑定合约" width="500px">
            <div class="bg-amber-50 text-amber-800 p-3 rounded text-sm mb-4 border border-amber-100 flex gap-2">
                <el-icon class="mt-0.5">
                    <Warning></Warning>
                </el-icon>
                <span>将选中的 <strong class="text-amber-600">{{ selectedRows.length }}</strong>
                    辆车转移至新合约。更换后，因原合约过期导致的冻结状态将立即解除。</span>
            </div>

            <el-form label-position="top">
                <div class="flex gap-3">
                    <el-form-item label="选择分公司" required class="flex-1">
                        <el-select v-model="contractBranchFilter" class="w-full" filterable placeholder="先选择分公司">
                            <el-option label="全部分公司" value="ALL"></el-option>
                            <el-option label="(未分配) 集团总池" value="UNASSIGNED"></el-option>
                            <el-option v-for="b in branchOptions" :key="b.id" :label="b.name" :value="b.id"></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="选择有效合约" required class="flex-[1.2]">
                        <el-select v-model="transferTargetContract" class="w-full" filterable
                            :disabled="!contractBranchFilter" placeholder="正在执行中的合约">
                            <el-option v-for="c in availableContractsForBranch" :key="c.id" :label="c.label"
                                :value="c.id"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
            </el-form>

            <template #footer>
                <div class="flex justify-between items-center w-full">
                    <el-button v-if="hasBoundContractsInSelection" type="danger" plain
                        @click="unbindContract">解绑当前合约</el-button>
                    <div :class="{'ml-auto': !hasBoundContractsInSelection}">
                        <el-button @click="modals.contract = false">取消</el-button>
                        <el-button type="primary" @click="confirmContract"
                            :disabled="!transferTargetContract">确认换绑</el-button>
                    </div>
                </div>
            </template>
        </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { PageHeader } from '@/components/ui';

// Constants
const TODAY = new Date();

// Mock Data
const branchOptions = ref([
  { id: 'B01', name: '华北一分公司' },
  { id: 'B02', name: '华北二分公司' },
  { id: 'B03', name: '华南一分公司' },
  { id: 'B04', name: '华东区分公司' }
]);

const getFutureDateStr = (days) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const getPastDateStr = (days) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const vehicleData = ref([
  { id: 'V1', licensePlate: '京A·88888', model: '奥迪 A6L 2023款', branch: 'B01', stationName: '北京首都机场店', mileage: 36880, listingMileage: 18000, isActive: true, contract: { id: 'C-2023-0801', endDate: getFutureDateStr(300) } },
  { id: 'V2', licensePlate: '京A·66666', model: '奔驰 E300L 2024款', branch: null, stationName: '', mileage: 12640, listingMileage: 9200, isActive: false, contract: { id: 'C-2024-0012', endDate: getFutureDateStr(100) } },
  { id: 'V3', licensePlate: '粤B·12345', model: '丰田 Camry 2022款', branch: 'B03', stationName: '深圳宝安机场店', mileage: 58210, listingMileage: 44200, isActive: true, contract: { id: 'C-2023-0801', endDate: getFutureDateStr(10) } }, // Expiring
  { id: 'V4', licensePlate: '粤B·98765', model: '大众 Passat 2021款', branch: 'B03', stationName: '深圳北站店', mileage: 76300, listingMileage: 60800, isActive: false, contract: { id: 'C-2022-X773', endDate: getPastDateStr(5) } }, // Expired
  { id: 'V5', licensePlate: '沪C·00001', model: '别克 GL8 2023款', branch: 'B04', stationName: '上海虹桥枢纽店', mileage: 21560, listingMileage: 12200, isActive: true, contract: { id: 'C-2024-0012', endDate: getFutureDateStr(45) } },
  { id: 'V6', licensePlate: '川A·00000', model: '极氪 001', branch: null, stationName: '', mileage: 8200, listingMileage: 8200, isActive: false, contract: null } // 未绑定
]);

const contractOptions = ref([
  { id: 'C-2023-0801', label: '[C-2023-0801] 集团统采租赁 (2025-12-31 到期)', endDate: '2025-12-31', branches: ['ALL'] },
  { id: 'C-2024-0012', label: '[C-2024-0012] 华北区分采补充 (2026-06-30 到期)', endDate: '2026-06-30', branches: ['B01', 'B02'] },
  { id: 'C-2024-0999', label: '[C-2024-0999] 临时调用保障 (2024-08-15 到期)', endDate: '2024-08-15', branches: ['B03', 'B04'] }
]);

// State
const filters = reactive({
  licensePlate: '',
  model: '',
  contractId: '',
  branch: '',
  status: 'ALL',
  quick: ''
});
const activeSummaryCard = ref('');

const modals = reactive({
  addVehicle: false,
  transfer: false,
  contract: false
});

const selectedRows = ref([]);
const transferTargetBranch = ref('');
const transferTargetContract = ref('');
const contractBranchFilter = ref('');
const activeAddVehicleTab = ref('BASIC');
const addVehiclePhotoMocks = ref([]);

const addVehicleBranchOptions = computed(() => branchOptions.value || []);
const addVehicleBrandOptions = ref([
  { label: 'Toyota', value: 'toyota' },
  { label: 'Lexus', value: 'lexus' },
  { label: 'Mercedes-Benz', value: 'benz' },
  { label: 'Skoda', value: 'skoda' },
  { label: 'Audi', value: 'audi' }
]);
const addVehicleModelCatalog = ref([
  { label: 'Toyota Corolla Cross', value: 'corolla_cross', brandId: 'toyota', type: 'suv' },
  { label: 'Toyota Camry', value: 'camry', brandId: 'toyota', type: 'sedan' },
  { label: 'Lexus ES 250', value: 'es250', brandId: 'lexus', type: 'sedan' },
  { label: 'Mercedes-Benz E300', value: 'e300', brandId: 'benz', type: 'sedan' },
  { label: 'Skoda Superb', value: 'superb', brandId: 'skoda', type: 'sedan' },
  { label: 'Audi A6L', value: 'a6l', brandId: 'audi', type: 'sedan' }
]);
const addVehicleSiteCatalog = ref([
  { branchId: 'B01', label: '北京首都机场店', value: 'beijing_airport' },
  { branchId: 'B02', label: '北京国贸中心店', value: 'beijing_guomao' },
  { branchId: 'B03', label: '深圳宝安机场店', value: 'sz_airport' },
  { branchId: 'B03', label: '深圳北站店', value: 'sz_north' },
  { branchId: 'B04', label: '上海虹桥枢纽店', value: 'sh_hongqiao' }
]);
const addVehicleTypeOptions = ref([
  { label: '轿车', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: '商务车', value: 'mpv' },
  { label: '微电车', value: 'micro_ev' }
]);
const addVehicleColorOptions = ref(['白色', '黑色', '银色', '灰色', '深蓝色']);
const addVehicleSourceOptions = ref([
  { label: '自购（自有资产）', value: 'SELF_OWNED' },
  { label: '和運租車', value: 'HESUAN' },
  { label: '格上租車', value: 'GESHANG' },
  { label: '中租租車', value: '中租' },
  { label: '其他合作车源', value: 'OTHER' }
]);
const addVehicleTagOptions = ref([
  { label: '新车', value: 'new' },
  { label: '接待专用', value: 'vip' },
  { label: '长途优先', value: 'long_trip' },
  { label: '低里程', value: 'low_mileage' }
]);
const addVehicleDeviceOptions = ref([
  { label: 'TBOX-001', value: 'tbox-001' },
  { label: 'TBOX-002', value: 'tbox-002' },
  { label: '未绑定', value: 'none' }
]);
const addVehicleForm = reactive({
  assetBranch: 'B01',
  siteId: 'beijing_airport',
  plateNo: '',
  brandId: '',
  modelId: '',
  modelYear: '',
  vehicleType: '',
  domesticFlag: '',
  seats: 5,
  displacement: '',
  tankCapacity: '',
  trunkCapacity: '',
  nickname: '',
  doorCount: 4,
  gearboxType: '',
  color: '',
  releaseDate: '',
  listingMileage: '',
  vin: '',
  engineNo: '',
  ownerName: 'RIMO Rental',
  fuelType: '',
  sourceType: 'SELF_OWNED',
  enableStatus: 'inactive',
  tagIds: [],
  lastMaintenanceMileage: '',
  lastMaintenanceDate: '',
  lastCleaningDate: '',
  specialVehicle: false,
  deviceCode: '',
  etcCardNo: '',
  iButtonCode: '',
  policyNo: '',
  insuranceDate: '',
  insuranceExpireDate: '',
  insuranceType: '',
  coverageAmount: '',
  claimAmount: ''
});

const filteredAddVehicleModelOptions = computed(() => {
  if (!addVehicleForm.brandId) return addVehicleModelCatalog.value;
  return addVehicleModelCatalog.value.filter(item => item.brandId === addVehicleForm.brandId);
});

const filteredAddVehicleSiteOptions = computed(() => {
  if (!addVehicleForm.assetBranch) return [];
  return addVehicleSiteCatalog.value.filter(item => item.branchId === addVehicleForm.assetBranch);
});

// Computed Logic
const getDaysRemaining = (dateStr) => {
  const diffTime = Math.abs(new Date(dateStr) - TODAY);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return new Date(dateStr) >= TODAY ? diffDays : -diffDays;
};

const selectedRowsCommonBranch = computed(() => {
  if (!selectedRows.value.length) return '';
  const first = selectedRows.value[0]?.branch ?? null;
  const allSame = selectedRows.value.every(r => (r?.branch ?? null) === first);
  if (!allSame) return '';
  return first === null ? 'UNASSIGNED' : first;
});

const availableContractsForBranch = computed(() => {
  const branch = contractBranchFilter.value;
  if (!branch) return [];
  if (branch === 'ALL') return contractOptions.value;
  return contractOptions.value.filter(c => (c.branches || []).includes('ALL') || (c.branches || []).includes(branch));
});

watch(contractBranchFilter, () => {
  const allowed = new Set(availableContractsForBranch.value.map(c => c.id));
  if (!transferTargetContract.value) return;
  if (!allowed.has(transferTargetContract.value)) transferTargetContract.value = '';
});

const filteredData = computed(() => {
  return vehicleData.value.filter(v => {
    const isFrozen = v.contract ? getDaysRemaining(v.contract.endDate) < 0 : true;

    // Filters
    if (filters.licensePlate && !v.licensePlate.includes(filters.licensePlate)) return false;
    if (filters.model && v.model !== filters.model) return false;
    if (filters.contractId) {
      if (!v.contract || v.contract.id !== filters.contractId) return false;
    }
    if (filters.branch) {
      if (filters.branch === 'UNASSIGNED' && v.branch !== null) return false;
      if (filters.branch !== 'UNASSIGNED' && v.branch !== filters.branch) return false;
    }
    if (filters.status !== 'ALL') {
      if (filters.status === 'FROZEN' && !isFrozen) return false;
      if (filters.status === 'ACTIVE' && (isFrozen || !v.isActive)) return false;
      if (filters.status === 'INACTIVE' && (isFrozen || v.isActive)) return false;
    }
    if (filters.quick === 'EXPIRING_SOON') {
      if (!v.contract) return false;
      const daysRemain = getDaysRemaining(v.contract.endDate);
      if (daysRemain < 0 || daysRemain >= 15) return false;
    }

    // Prevent active status for frozen or unbound
    if (isFrozen) v.isActive = false;

    return true;
  });
});

const modelOptions = computed(() => {
  const models = new Set(vehicleData.value.map(v => v.model));
  return Array.from(models).sort();
});

const stats = computed(() => {
  let active = 0, expiringSoon = 0, frozen = 0;
  vehicleData.value.forEach(v => {
    if (!v.contract) {
      frozen++;
    } else {
      const daysRemain = getDaysRemaining(v.contract.endDate);
      if (daysRemain < 0) frozen++;
      else {
        if (v.isActive) active++;
        if (daysRemain < 15) expiringSoon++;
      }
    }
  });
  return { total: vehicleData.value.length, active, expiringSoon, frozen };
});

// Helpers
const getBranchName = (id) => {
  const b = branchOptions.value.find(x => x.id === id);
  return b ? b.name : id;
};

const getCumulativeUsageMileage = (row) => {
  const mileage = Number(row.mileage || 0);
  const listingMileage = Number(row.listingMileage || 0);
  return Math.max(mileage - listingMileage, 0);
};

const tableRowClassName = ({ row }) => {
  if (!row.contract) return 'bg-gray-50/50';
  const daysRemain = getDaysRemaining(row.contract.endDate);
  if (daysRemain >= 0 && daysRemain < 15) return 'bg-amber-50/50';
  return '';
};

// Actions
const clearVehicleFilters = () => {
  filters.licensePlate = '';
  filters.model = '';
  filters.contractId = '';
  filters.branch = '';
  filters.status = 'ALL';
  filters.quick = '';
};

const applySummaryFilter = (type) => {
  if (activeSummaryCard.value === type) {
    activeSummaryCard.value = '';
    clearVehicleFilters();
    return;
  }

  activeSummaryCard.value = type;
  clearVehicleFilters();

  if (type === 'active') {
    filters.status = 'ACTIVE';
    return;
  }
  if (type === 'frozen') {
    filters.status = 'FROZEN';
    return;
  }
  if (type === 'expiringSoon') {
    filters.quick = 'EXPIRING_SOON';
  }
};

const handleSelectionChange = (val) => {
  selectedRows.value = val;
};

const resetAddVehicleForm = () => {
  addVehicleForm.assetBranch = 'B01';
  addVehicleForm.siteId = 'beijing_airport';
  addVehicleForm.plateNo = '';
  addVehicleForm.brandId = '';
  addVehicleForm.modelId = '';
  addVehicleForm.modelYear = '';
  addVehicleForm.vehicleType = '';
  addVehicleForm.domesticFlag = '';
  addVehicleForm.seats = 5;
  addVehicleForm.displacement = '';
  addVehicleForm.tankCapacity = '';
  addVehicleForm.trunkCapacity = '';
  addVehicleForm.nickname = '';
  addVehicleForm.doorCount = 4;
  addVehicleForm.gearboxType = '';
  addVehicleForm.color = '';
  addVehicleForm.releaseDate = '';
  addVehicleForm.listingMileage = '';
  addVehicleForm.vin = '';
  addVehicleForm.engineNo = '';
  addVehicleForm.ownerName = 'RIMO Rental';
  addVehicleForm.fuelType = '';
  addVehicleForm.sourceType = 'SELF_OWNED';
  addVehicleForm.enableStatus = 'inactive';
  addVehicleForm.tagIds = [];
  addVehicleForm.lastMaintenanceMileage = '';
  addVehicleForm.lastMaintenanceDate = '';
  addVehicleForm.lastCleaningDate = '';
  addVehicleForm.specialVehicle = false;
  addVehicleForm.deviceCode = '';
  addVehicleForm.etcCardNo = '';
  addVehicleForm.iButtonCode = '';
  addVehicleForm.policyNo = '';
  addVehicleForm.insuranceDate = '';
  addVehicleForm.insuranceExpireDate = '';
  addVehicleForm.insuranceType = '';
  addVehicleForm.coverageAmount = '';
  addVehicleForm.claimAmount = '';
  addVehiclePhotoMocks.value = [
    { key: 'front', title: '车辆照片', caption: '右前 45°' },
    { key: 'rear', title: '车辆照片', caption: '车尾' }
  ];
};

const openAddVehicleModal = () => {
  resetAddVehicleForm();
  activeAddVehicleTab.value = 'BASIC';
  modals.addVehicle = true;
};

const handleAddVehicleBranchChange = () => {
  const firstSite = filteredAddVehicleSiteOptions.value[0];
  addVehicleForm.siteId = firstSite ? firstSite.value : '';
};

const handleAddVehicleBrandChange = () => {
  if (!filteredAddVehicleModelOptions.value.some(item => item.value === addVehicleForm.modelId)) {
    addVehicleForm.modelId = '';
  }
};

const handleAddVehicleModelChange = (value) => {
  const matched = addVehicleModelCatalog.value.find(item => item.value === value);
  if (matched?.type) {
    addVehicleForm.vehicleType = matched.type;
  }
};

const syncAddVehicleSeed = () => {
  addVehicleForm.brandId = 'toyota';
  addVehicleForm.modelId = 'camry';
  addVehicleForm.modelYear = '2025';
  addVehicleForm.vehicleType = 'sedan';
  addVehicleForm.domesticFlag = 'imported';
  addVehicleForm.seats = 5;
  addVehicleForm.displacement = '2487';
  addVehicleForm.tankCapacity = '60';
  addVehicleForm.trunkCapacity = '524';
  addVehicleForm.nickname = '公务接待车';
  addVehicleForm.doorCount = 4;
  addVehicleForm.gearboxType = 'auto';
  addVehicleForm.color = '黑色';
  addVehicleForm.releaseDate = '2025/02/01';
  addVehicleForm.listingMileage = '0';
  addVehicleForm.fuelType = 'gasoline';
  ElMessage.success('已同步带入车款基础资料');
};

const appendAddVehiclePhotoMock = () => {
  addVehiclePhotoMocks.value.push({
    key: `photo-${addVehiclePhotoMocks.value.length + 1}`,
    title: '车辆照片',
    caption: `补充图 ${addVehiclePhotoMocks.value.length + 1}`
  });
};

const submitAddVehicle = () => {
  const requiredFields = [
    ['资产归属分公司', addVehicleForm.assetBranch],
    ['所在据点', addVehicleForm.siteId],
    ['车牌号码', addVehicleForm.plateNo],
    ['厂牌', addVehicleForm.brandId],
    ['车款', addVehicleForm.modelId],
    ['车款年份', addVehicleForm.modelYear],
    ['车辆类型', addVehicleForm.vehicleType],
    ['座位数', addVehicleForm.seats],
    ['排气量', addVehicleForm.displacement],
    ['油箱容量', addVehicleForm.tankCapacity],
    ['车辆名称（昵称）', addVehicleForm.nickname],
    ['车门数量', addVehicleForm.doorCount],
    ['变速箱类型', addVehicleForm.gearboxType],
    ['车身颜色', addVehicleForm.color],
    ['上架里程', addVehicleForm.listingMileage],
    ['启用状态', addVehicleForm.enableStatus]
  ];
  const missing = requiredFields
    .filter(([, value]) => value === null || value === undefined || String(value).trim() === '')
    .map(([label]) => label);
  if (!addVehiclePhotoMocks.value.length) {
    missing.push('车辆照片');
  }
  if (missing.length) {
    ElMessage.warning(`请先完成：${missing.join('、')}`);
    return;
  }

  const branchName = getBranchName(addVehicleForm.assetBranch);
  const siteName = filteredAddVehicleSiteOptions.value.find(item => item.value === addVehicleForm.siteId)?.label || '';
  const modelName = addVehicleModelCatalog.value.find(item => item.value === addVehicleForm.modelId)?.label || '';
  vehicleData.value.unshift({
    id: `V${Date.now()}`,
    licensePlate: addVehicleForm.plateNo.trim(),
    model: `${modelName} ${addVehicleForm.modelYear || ''}`.trim(),
    branch: addVehicleForm.assetBranch,
    stationName: siteName,
    mileage: Number(addVehicleForm.listingMileage || 0),
    listingMileage: Number(addVehicleForm.listingMileage || 0),
    isActive: addVehicleForm.enableStatus === 'active',
    source: addVehicleForm.sourceType || 'OTHER',
    contract: null
  });
  modals.addVehicle = false;
  ElMessage.success(`车辆已新增至 ${branchName}；未绑定合约前仍不可上架`);
};

const hasBoundContractsInSelection = computed(() => {
  return selectedRows.value.some(r => {
    const v = vehicleData.value.find(veh => veh.id === r.id);
    return v && v.contract;
  });
});

const openTransferModal = () => {
  transferTargetBranch.value = '';
  modals.transfer = true;
};

const openContractModal = () => {
  transferTargetContract.value = '';
  contractBranchFilter.value = selectedRowsCommonBranch.value || '';
  modals.contract = true;
};

const openContractModalSingle = (row) => {
  // Force select only this row
  selectedRows.value = [row];
  openContractModal();
};

const confirmTransfer = () => {
  const target = transferTargetBranch.value === 'UNASSIGNED' ? null : transferTargetBranch.value;
  selectedRows.value.forEach(r => {
    const row = vehicleData.value.find(v => v.id === r.id);
    if (row) row.branch = target;
  });
  ElMessage.success(`成功将 ${selectedRows.value.length} 辆车调拨`);
  modals.transfer = false;
};

const confirmContract = () => {
  const newId = transferTargetContract.value;
  const matched = contractOptions.value.find(c => c.id === newId);
  const newDate = matched?.endDate || getFutureDateStr(365);

  selectedRows.value.forEach(r => {
    const row = vehicleData.value.find(v => v.id === r.id);
    if (row) {
      if (!row.contract) row.contract = {};
      row.contract.id = newId;
      row.contract.endDate = newDate;
    }
  });
  ElMessage.success(`成功更换了 ${selectedRows.value.length} 辆车的合约。已解除冻结状态（如受限）。`);
  modals.contract = false;
};

const unbindContract = () => {
  ElMessageBox.confirm(`确定要解绑这 ${selectedRows.value.length} 辆车的所有合约吗？车辆将被下架并取消业务联系。`, '确认解绑', {
    confirmButtonText: '确定解绑',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRows.value.forEach(r => {
      const row = vehicleData.value.find(v => v.id === r.id);
      if (row) {
        row.contract = null;
        row.isActive = false; // automatically disable them
      }
    });
    ElMessage.success(`已解绑选中车辆的所有相关合约。`);
    modals.contract = false;
  }).catch(() => { });
};
</script>

<style scoped>
.official-vehicles-page {
  min-height: 100%;
}

.card-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
}

.vehicle-create-photo {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 12px;
}

.vehicle-create-photo-box {
  min-height: 126px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  text-align: center;
  padding: 10px;
  cursor: pointer;
}

.vehicle-create-photo-box .el-icon {
  font-size: 28px;
  color: #2563eb;
}

.vehicle-create-photo-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.vehicle-create-photo-item {
  min-height: 126px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.vehicle-create-photo-item__preview {
  height: 84px;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.vehicle-create-photo-item__meta {
  padding: 8px 10px;
  color: #4b5563;
  font-size: 12px;
  line-height: 16px;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

:deep(.el-table th.el-table__cell) {
  background: #f8fafc !important;
  color: #475569;
}

@media (max-width: 1080px) {
  .vehicle-create-photo,
  .vehicle-create-photo-list {
    grid-template-columns: 1fr;
  }
}
</style>
