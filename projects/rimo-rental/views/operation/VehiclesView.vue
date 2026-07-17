<template>
<div class="vehicles-page">
            
            

            
            <main>
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">车辆档案库</h1>
                        <p class="text-gray-500 text-sm mt-1">管理所有车辆实例，监控状态、里程及服务能力。</p>
                    </div>
                    <div class="flex gap-3">
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20"
                            @click="openDialog(null)">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新增车辆
                        </el-button>
                    </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                        <div class="flex flex-wrap items-center justify-between gap-4">
                            <div class="flex items-center gap-4 flex-wrap">
                                <el-input v-model="searchQuery" placeholder="车牌号 / VIN" prefix-icon="Search"
                                    clearable style="width: 280px"></el-input>

                                <el-select v-model="filterAssetCompanyIds" multiple collapse-tags collapse-tags-tooltip
                                    clearable filterable placeholder="资产归属" style="width: 150px">
                                    <el-option v-for="company in companyOptions" :key="company.id" :label="company.label"
                                        :value="company.id"></el-option>
                                </el-select>

                                <el-cascader v-model="filterPositionIds" :options="orgData" :props="positionFilterProps"
                                    filterable clearable collapse-tags collapse-tags-tooltip
                                    placeholder="当前位置" style="width: 210px"></el-cascader>

                                <el-select v-model="filterStatus" multiple collapse-tags collapse-tags-tooltip clearable
                                    placeholder="营运状态" style="width: 150px">
                                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                                        :value="item.value"></el-option>
                                </el-select>

                                <el-button type="primary" icon="Filter" plain @click="searchPanelExpanded = !searchPanelExpanded">
                                    {{ searchPanelExpanded ? '收起筛选' : '更多筛选' }}
                                </el-button>
                                <el-button icon="Refresh" circle @click="resetVehicleFilters"></el-button>
                                <el-button type="success" plain icon="Upload" @click="handleImportCommand('import')">导入</el-button>
                                <el-button type="primary" plain icon="Download" @click="handleExport">导出</el-button>
                                <el-dropdown @command="applyVehicleBatchStatus" trigger="click">
                                    <el-button type="warning" plain :disabled="selectedVehicles.length === 0">
                                        批量操作
                                        <svg class="ml-1.5 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ></path>
                                        </svg>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item :command="true" class="text-emerald-600"><el-icon><Check></Check></el-icon>批量启用</el-dropdown-item>
                                            <el-dropdown-item :command="false" class="text-red-500"><el-icon><Close></Close></el-icon>批量停用</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-sm text-gray-500 whitespace-nowrap">共 {{ filteredVehicles.length }} 辆车</span>
                            </div>
                        </div>

                        <div v-show="searchPanelExpanded" class="pt-4 mt-4 border-t border-gray-100">
                            <div class="flex flex-wrap items-center justify-between gap-4">
                                <div class="flex items-center gap-4 flex-1 flex-wrap">
                                    <el-select v-model="filterEnabledStates" multiple collapse-tags collapse-tags-tooltip clearable
                                        placeholder="是否启用" style="width: 150px">
                                        <el-option v-for="item in enabledOptions" :key="item.value" :label="item.label"
                                            :value="item.value"></el-option>
                                    </el-select>

                                    <el-select v-model="filterVehicleTypes" multiple collapse-tags collapse-tags-tooltip clearable
                                        placeholder="载具类型" style="width: 150px">
                                        <el-option v-for="item in vehicleTypeOptions" :key="item.value" :label="item.label"
                                            :value="item.value"></el-option>
                                    </el-select>

                                    <el-select v-model="filterServiceTypes" multiple collapse-tags collapse-tags-tooltip clearable
                                        placeholder="服务类型" style="width: 180px">
                                        <el-option v-for="item in serviceOptions" :key="item.value" :label="item.label"
                                            :value="item.value"></el-option>
                                    </el-select>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span v-if="selectedVehicles.length > 0" class="text-xs text-blue-600 font-medium whitespace-nowrap bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                        已选 {{ selectedVehicles.length }} 项
                                    </span>
                                </div>
                            </div>
                        </div>
                </div>

                
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-264px)] overflow-hidden">
                    <el-table :data="filteredVehicles" style="width: 100%" height="100%" stripe
                        :header-cell-style="{ background: '#f9fafb', color: '#4b5563', fontWeight: '600' }"
                        @selection-change="handleSelectionChange">
                            <el-table-column type="selection" width="40"></el-table-column>
                            <el-table-column label="车辆信息" min-width="240">
                                <template #default="{ row }">
                                    <div class="flex items-center gap-3">
                                        <el-image :src="getVehiclePhoto(row)"
                                            class="w-20 h-14 rounded object-cover border bg-gray-100"
                                            :preview-src-list="[getVehiclePhoto(row)]" preview-teleported fit="cover">
                                            <template #error>
                                                <div 
                                                    class="flex items-center justify-center w-full h-full text-gray-300">
                                                    <el-icon>
                                                        <Picture></Picture>
                                                    </el-icon>
                                                </div>
                                            </template>
                                        </el-image>
                                        <div>
                                            <div class="flex items-center gap-2">
                                                <div class="font-bold text-gray-800 text-base">{{ row.licensePlate }}</div>
                                                <el-tag :type="getVehicleTypeTagType(row.vehicleType)"
                                                    size="small" effect="plain">
                                                    {{ getVehicleTypeLabel(row.vehicleType) }}
                                                </el-tag>
                                            </div>
                                            <div class="text-xs text-gray-500 mt-1">{{ getGroupName(row.vehicleGroupId)
                                                }}</div>
                                            <div class="text-xs text-gray-400 mt-0.5 font-mono">VIN: {{
                                                row.vin.substring(0, 6) }}...{{ row.vin.substring(row.vin.length-4) }}
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="资产归属" min-width="180">
                                <template #default="{ row }">
                                    <div class="text-sm font-medium text-gray-800">{{ getCompanyName(row.assetCompanyId) }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column label="当前位置" min-width="180">
                                <template #default="{ row }">
                                    <div class="text-sm">
                                        <div class="font-medium text-gray-800">{{ getStoreName(row.storeId) }}</div>
                                        <div class="text-xs text-gray-500 mt-1 flex items-center">
                                            <el-icon class="mr-1 text-gray-400">
                                                <Location></Location>
                                            </el-icon>
                                            {{ getStationName(row.stationId) }}
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="营运状态" width="110">
                                <template #default="{ row }">
                                    <div class="flex flex-col gap-1">
                                        <el-tag :type="getStatusType(row.operationStatus)" size="small">{{
                                            getStatusName(row.operationStatus) }}</el-tag>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="是否启用" width="90" align="center">
                                <template #default="{ row }">
                                    <div @click.stop class="flex justify-center">
                                        <el-switch v-model="row.enabled" size="small"
                                            style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
                                            @change="handleStatusToggle(row)"></el-switch>
                                    </div>
                                </template>
                            </el-table-column>

                            <el-table-column label="当前上架" width="150">
                                <template #default="{ row }">
                                    <el-tooltip :content="getServiceTooltip(row.serviceTypes)" placement="top" effect="light">
                                        <div class="flex flex-col gap-1 cursor-default">
                                            <div>
                                                <el-tag size="small" :type="getServiceTagType(row.currentServiceType)" effect="light">
                                                    {{ getServiceFullName(row.currentServiceType) }}
                                                </el-tag>
                                            </div>
                                            <div class="text-xs text-gray-500">
                                                可服务 {{ row.serviceTypes.length }} 项
                                            </div>
                                        </div>
                                    </el-tooltip>
                                </template>
                            </el-table-column>

                            <el-table-column label="里程" width="120" prop="mileage" sortable>
                                <template #default="{ row }">
                                    <span class="font-mono">{{ row.mileage.toLocaleString() }} km</span>
                                </template>
                            </el-table-column>

                            <el-table-column label="操作" width="220" align="right" fixed="right">
                                <template #default="{ row }">
                                    <div class="flex items-center justify-end gap-2">
                                        <el-button link type="primary" size="small" @click="openDetailDrawer(row)">
                                            <el-icon class="mr-1">
                                                <Document></Document>
                                            </el-icon>详情
                                        </el-button>
                                        <el-button link type="primary" size="small"
                                            @click="openDialog(row)">编辑</el-button>

                                        <el-dropdown trigger="click">
                                            <el-button link type="info" size="small" icon="More"></el-button>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item 
                                                        v-if="row.operationStatus !== 'MAINTENANCE' && row.operationStatus !== 'RENTED'"
                                                        @click="setMaintenance(row)">
                                                        <el-icon>
                                                            <Tools></Tools>
                                                        </el-icon> 发起维保
                                                    </el-dropdown-item>
                                                    <el-dropdown-item v-if="row.operationStatus === 'MAINTENANCE'"
                                                        @click="setIdle(row)">
                                                        <el-icon>
                                                            <CircleCheck></CircleCheck>
                                                        </el-icon> 结束维保
                                                    </el-dropdown-item>
                                                    <el-dropdown-item divided class="text-red-500"
                                                        :disabled="row.operationStatus === 'RENTED'"
                                                        @click="deleteVehicle(row)">
                                                        <el-icon>
                                                            <Delete></Delete>
                                                        </el-icon> 删除车辆
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
                </div>
            </main>
        </div>

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑车辆' : '新增车辆'" width="920px" top="4vh">
            <el-form :model="currentVehicle" label-position="top" :rules="rules" ref="formRef"
                class="h-[620px] overflow-hidden flex flex-col">
                <el-tabs v-model="activeDialogTab" class="flex-1 overflow-hidden">

                    <el-tab-pane label="基础资料" name="BASIC" class="h-full overflow-y-auto custom-scroll pr-2">
                        <el-divider content-position="left"><el-icon>
                                <Tickets></Tickets>
                            </el-icon> 车辆识别</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="车牌号" prop="licensePlate" required>
                                <el-input v-model="currentVehicle.licensePlate" placeholder="例如: RAA-1234"></el-input>
                            </el-form-item>
                            <el-form-item label="车架号 (VIN)" prop="vin">
                                <el-input v-model="currentVehicle.vin" placeholder="17位 VIN 码" maxlength="17"></el-input>
                            </el-form-item>
                            <el-form-item label="载具类型" required>
                                <el-radio-group v-model="currentVehicle.vehicleType" @change="handleVehicleTypeChange">
                                    <el-radio label="car">🚗 汽车</el-radio>
                                    <el-radio label="motorcycle">🏍️ 摩托车</el-radio>
                                    <el-radio label="microElectric">🔋 微电车</el-radio>
                                </el-radio-group>
                            </el-form-item>
                            <el-form-item label="所属车型组" prop="vehicleGroupId" required>
                                <el-select v-model="currentVehicle.vehicleGroupId" placeholder="请选择车型组" class="w-full">
                                    <el-option v-for="g in filteredGroupOptions" :key="g.id"
                                        :label="g.brand + ' ' + g.model + ' (' + g.year + ')'" :value="g.id">
                                        <span class="float-left">{{ g.brand }} {{ g.model }}</span>
                                        <span class="float-right text-gray-400 text-xs">{{ g.year }}</span>
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </div>

                        <el-divider content-position="left"><el-icon>
                                <OfficeBuilding></OfficeBuilding>
                            </el-icon> 资产归属与位置</el-divider>
                        <div class="grid grid-cols-3 gap-x-6 gap-y-2">
                            <el-form-item label="资产所属车行" prop="assetCompanyId" required>
                                <el-select v-model="currentVehicle.assetCompanyId" class="w-full" :disabled="isEdit"
                                    placeholder="请选择资产所属车行" @change="handleAssetCompanyChange">
                                    <el-option v-for="company in companyOptions" :key="company.id" :label="company.label"
                                        :value="company.id"></el-option>
                                </el-select>
                                <span v-if="isEdit" class="text-gray-400 text-xs">编辑时不在此处调整资产归属</span>
                            </el-form-item>
                            <el-form-item label="登记所有人">
                                <el-input v-model="currentVehicle.owner" placeholder="公司/个人"></el-input>
                            </el-form-item>
                            <el-form-item label="资产来源">
                                <el-select v-model="currentVehicle.source" class="w-full">
                                    <el-option label="自购" value="PURCHASE"></el-option>
                                    <el-option label="租赁" value="LEASE"></el-option>
                                    <el-option label="挂靠" value="AFFILIATE"></el-option>
                                    <el-option label="托管" value="TRUST"></el-option>
                                </el-select>
                            </el-form-item>
                        </div>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="当前门市" prop="storeId" required>
                                <el-select v-model="currentVehicle.storeId" class="w-full" :disabled="isEdit"
                                    placeholder="请选择当前门市" @change="handleStoreChange">
                                    <el-option v-for="store in filteredStoreOptions" :key="store.id" :label="store.label"
                                        :value="store.id"></el-option>
                                </el-select>
                                <span v-if="isEdit" class="text-gray-400 text-xs">编辑时通过调度或调拨调整位置</span>
                            </el-form-item>
                            <el-form-item label="当前据点" prop="stationId" required>
                                <el-select v-model="currentVehicle.stationId" class="w-full" :disabled="isEdit"
                                    placeholder="请选择当前据点">
                                    <el-option v-for="station in filteredStationOptions" :key="station.id"
                                        :label="station.label" :value="station.id"></el-option>
                                </el-select>
                                <span v-if="isEdit" class="text-gray-400 text-xs">编辑时通过调度或调拨调整位置</span>
                            </el-form-item>
                        </div>

                        <el-divider content-position="left"><el-icon>
                                <InfoFilled></InfoFilled>
                            </el-icon> 基础属性</el-divider>
                        <div class="grid grid-cols-3 gap-x-6 gap-y-2">
                            <el-form-item label="颜色">
                                <el-input v-model="currentVehicle.color" placeholder="例如: 白色"></el-input>
                            </el-form-item>
                            <el-form-item label="出厂年份">
                                <el-date-picker v-model="currentVehicle.year" type="year" placeholder="选择年份"
                                    value-format="YYYY" style="width: 100%"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="当前里程 (km)">
                                <el-input-number v-model="currentVehicle.mileage" :min="0" :step="100"
                                    style="width: 100%"></el-input-number>
                            </el-form-item>
                            <el-form-item label="车辆昵称">
                                <el-input v-model="currentVehicle.nickname" placeholder="给车辆起个好记的名字"></el-input>
                            </el-form-item>
                            <el-form-item label="车辆实拍图 (可选)" class="col-span-2">
                                <el-input v-model="currentVehicle.customPhotoUrl" placeholder="输入 URL，留空则使用车型组默认图">
                                    <template #prefix><el-icon>
                                            <Picture></Picture>
                                        </el-icon></template>
                                </el-input>
                            </el-form-item>
                        </div>

                        <el-divider content-position="left"><el-icon>
                                <Setting></Setting>
                            </el-icon> 技术参数</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="座位数">
                                <el-input-number v-model="currentVehicle.seats" :min="1" :max="60"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="车门数">
                                <el-input-number v-model="currentVehicle.doors" :min="0" :max="6"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="燃料类型">
                                <el-select v-model="currentVehicle.fuelType" class="w-full">
                                    <el-option label="汽油" value="GASOLINE"></el-option>
                                    <el-option label="纯电" value="ELECTRIC"></el-option>
                                    <el-option label="混合动力" value="HYBRID"></el-option>
                                    <el-option label="柴油" value="DIESEL"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="变速箱">
                                <el-select v-model="currentVehicle.transmission" class="w-full">
                                    <el-option label="自动挡 (AT)" value="AT"></el-option>
                                    <el-option label="手动挡 (MT)" value="MT"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="排量/续航">
                                <el-input v-model="currentVehicle.displacement"
                                    placeholder="如: 2.0T 或 500km"></el-input>
                            </el-form-item>
                            <el-form-item label="油箱/电池容量">
                                <el-input v-model="currentVehicle.tankCapacity" placeholder="如: 60L 或 75kWh"></el-input>
                            </el-form-item>
                            <el-form-item label="是否国产">
                                <el-switch v-model="currentVehicle.isDomestic" active-text="国产"
                                    inactive-text="进口/合资"></el-switch>
                            </el-form-item>
                            <el-form-item label="大件行李数 (24寸+)">
                                <el-input-number v-model="currentVehicle.luggageLarge" :min="0"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="小件行李数 (20寸-)">
                                <el-input-number v-model="currentVehicle.luggageSmall" :min="0"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                        </div>
                    </el-tab-pane>

                    <el-tab-pane label="运营配置" name="OPS" class="h-full overflow-y-auto custom-scroll pr-2">
                        <div class="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 text-sm text-gray-600">
                            位置调整通过调度或调拨处理，当前页主要维护上架状态、可服务范围和设备标签。
                        </div>

                        <el-divider content-position="left"><el-icon>
                                <Operation></Operation>
                            </el-icon> 上架与状态</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="运营状态">
                                <template v-if="isEdit">
                                    <el-tag :type="getOperationStatusType(currentVehicle.operationStatus)" size="large"
                                        effect="dark">
                                        {{ getOperationStatusName(currentVehicle.operationStatus) }}
                                    </el-tag>
                                    <span class="text-gray-400 text-xs ml-2">状态由系统流程维护</span>
                                </template>
                                <template v-else>
                                    <el-tag type="success" size="large" effect="dark">空闲</el-tag>
                                    <span class="text-gray-400 text-xs ml-2">新车默认空闲</span>
                                </template>
                            </el-form-item>
                            <el-form-item label="当前服务类型" required>
                                <el-select v-model="currentVehicle.currentServiceType" class="w-full" :disabled="isEdit"
                                    placeholder="选择当前上架的业务线">
                                    <el-option label="同站租还" value="SHARING_SAME"></el-option>
                                    <el-option label="甲租乙还" value="SHARING_ONE_WAY"></el-option>
                                    <el-option label="门市租赁" value="STORE_STANDARD"></el-option>
                                    <el-option label="24H门市" value="STORE_24H"></el-option>
                                    <el-option label="公务用车" value="GOV"></el-option>
                                </el-select>
                                <span v-if="isEdit" class="text-gray-400 text-xs">编辑时不直接修改当前上架业务线</span>
                            </el-form-item>
                            <el-form-item label="启用状态">
                                <div class="flex items-center gap-3">
                                    <el-switch v-model="currentVehicle.enabled" active-text="已启用" inactive-text="已停用" inactive-color="#dcdfe6">
                                    </el-switch>
                                    <span class="text-gray-400 text-xs">{{ currentVehicle.enabled ? '对外接受新订单' :
                                        '暂停接单，不影响进行中业务' }}</span>
                                </div>
                            </el-form-item>
                        </div>
                        <el-form-item label="可服务类型">
                            <el-checkbox-group v-model="currentVehicle.serviceTypes">
                                <el-checkbox label="SHARING_SAME">同站租还</el-checkbox>
                                <el-checkbox label="SHARING_ONE_WAY">甲租乙还</el-checkbox>
                                <el-checkbox label="STORE_STANDARD">门市租赁</el-checkbox>
                                <el-checkbox label="STORE_24H">24H门市</el-checkbox>
                                <el-checkbox label="GOV">公务用车</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>

                        <el-divider content-position="left"><el-icon>
                                <PriceTag></PriceTag>
                            </el-icon> 标签与设备</el-divider>
                        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
                            <el-form-item label="车辆标签">
                                <el-select v-model="currentVehicle.tags" multiple filterable allow-create
                                    default-first-option placeholder="输入标签按回车" class="w-full">
                                    <el-option label="新车" value="New"></el-option>
                                    <el-option label="无烟车" value="NoSmoke"></el-option>
                                    <el-option label="GPS" value="GPS"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="车机设备CID">
                                <el-input v-model="currentVehicle.cid" placeholder="T-Box ID / Device ID"></el-input>
                            </el-form-item>
                        </div>

                        <el-divider content-position="left"><el-icon>
                                <WarningFilled></WarningFilled>
                            </el-icon> 特殊车辆限制</el-divider>
                        <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-100 w-full">
                            <el-checkbox v-model="currentVehicle.isSpecial">标记为特殊车辆</el-checkbox>
                            <div class="text-xs text-yellow-700 mt-1">仅影响会员可见性和可预约资格，不改变车辆资产归属。</div>
                            <div v-if="currentVehicle.isSpecial" class="mt-3 animate-fade-in">
                                <el-form-item label="限制会员类型" class="!mb-0">
                                    <el-select v-model="currentVehicle.specialMembershipRequired"
                                        placeholder="选择允许租赁的会员等级" class="w-60">
                                        <el-option label="白银会员及以上" value="SILVER"></el-option>
                                        <el-option label="黄金会员及以上" value="GOLD"></el-option>
                                        <el-option label="黑钻会员及以上" value="DIAMOND"></el-option>
                                    </el-select>
                                </el-form-item>
                            </div>
                        </div>
                    </el-tab-pane>

                </el-tabs>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false"><el-icon class="mr-1">
                        <Close></Close>
                    </el-icon>取消</el-button>
                <el-button type="primary" @click="saveVehicle"><el-icon class="mr-1">
                        <Check></Check>
                    </el-icon>保存</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="importDialogVisible" title="导入车辆数据" width="480px" destroy-on-close>
            <div class="mb-4 text-gray-600 text-sm">
                <p class="mb-2">1. 请先下载导入模板，按标准模板格式填写数据。</p>
                <el-button type="primary" plain size="small" @click="downloadTemplate">
                    <el-icon class="mr-1"><Download></Download></el-icon> 下载规范表模板
                </el-button>
            </div>
            <div class="border-t border-gray-100 pt-4 mt-4">
                <p class="mb-2 text-gray-600 text-sm">2. 上传填写好的数据表格（支持 .xls, .xlsx 格式，单次最大支持 1000 条）。</p>
                <el-upload class="upload-demo" drag action="#" :auto-upload="false" :on-change="handleFileChange"
                    accept=".xls,.xlsx">
                    <el-icon class="el-icon--upload"><UploadFilled></UploadFilled></el-icon>
                    <div class="el-upload__text">
                        将文件拖拽至此处，或 <em>点击上传</em>
                    </div>
                </el-upload>
            </div>
            <template #footer>
                <el-button @click="importDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmImport">开始导入</el-button>
            </template>
        </el-dialog>

        
        <el-drawer v-model="detailDrawerVisible" :size="'80%'" :with-header="false" destroy-on-close
            class="custom-drawer">
            <div class="h-full flex flex-col bg-gray-50 relative">
                
                <button @click="detailDrawerVisible = false"
                    class="absolute top-4 right-6 z-50 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <el-icon class="text-2xl">
                        <Close></Close>
                    </el-icon>
                </button>

                
                <div 
                    class="bg-white shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-start z-10 flex-shrink-0 gap-8">
                    <div class="flex items-start gap-8 min-w-0">
                        
                        <div>
                            <div class="flex items-center gap-4">
                                <h1 class="text-3xl font-mono font-bold text-gray-900 tracking-tight">
                                    {{ currentDetailVehicle.licensePlate }}
                                </h1>
                                <el-tag :type="getStatusType(currentDetailVehicle.operationStatus)" effect="light" round
                                    size="large" class="!px-4 !text-sm !font-bold">
                                    {{ getStatusName(currentDetailVehicle.operationStatus) }}
                                </el-tag>
                            </div>
                            <div class="text-sm text-gray-500 mt-2 flex items-center gap-3">
                                <span class="font-medium text-gray-700">{{
                                    getGroupName(currentDetailVehicle.vehicleGroupId) }}</span>
                                <span class="h-3 w-[1px] bg-gray-300"></span>
                                <span class="font-mono text-gray-400">VIN: {{ currentDetailVehicle.vin }}</span>
                            </div>
                        </div>

                        
                        <div class="grid grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-3 border-l border-gray-100 pl-10 min-w-[520px]">
                            <div>
                                <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">资产归属
                                </div>
                                <div class="font-semibold text-gray-800 text-sm">
                                    {{ getCompanyName(currentDetailVehicle.assetCompanyId) }}
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">当前位置
                                </div>
                                <div class="font-semibold text-gray-800 flex items-center gap-1.5 text-sm">
                                    <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                                    {{ getLocationName(currentDetailVehicle) }}
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">当前服务
                                </div>
                                <div class="font-semibold text-gray-800 text-sm">
                                    {{ getServiceFullName(currentDetailVehicle.currentServiceType) }}
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">当前里程
                                </div>
                                <div class="font-bold text-gray-800 font-mono text-xl leading-none">
                                    {{ currentDetailVehicle.mileage ? currentDetailVehicle.mileage.toLocaleString() : 0
                                    }}
                                    <span class="text-xs font-normal text-gray-400 ml-0.5">km</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div class="flex gap-3 pr-12 shrink-0">
                        <el-button @click="openDialog(currentDetailVehicle)" icon="Edit" plain>编辑资料</el-button>
                        <el-button type="warning" plain icon="Tools"
                            v-if="currentDetailVehicle.operationStatus !== 'MAINTENANCE'"
                            @click="setMaintenance(currentDetailVehicle)">发起维保</el-button>
                        <el-button type="primary" icon="Van">新增调度</el-button>
                    </div>
                </div>

                <div class="flex-1 overflow-hidden flex flex-col relative w-full">
                    
                    <el-tabs v-model="activeDetailTab" class="h-full flex flex-col vehicle-detail-tabs w-full"
                        type="border-card">

                        
                        <el-tab-pane label="车辆概况" name="OVERVIEW"
                            class="h-full overflow-y-auto custom-scroll p-6 w-full">
                            <div class="max-w-7xl mx-auto space-y-6 w-full p-2">
                                <div class="bg-white rounded-lg border border-gray-200 px-5 py-4">
                                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div>
                                            <div class="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">当前上架</div>
                                            <div class="flex items-center gap-2 flex-wrap">
                                                <el-tag size="small" :type="getServiceTagType(currentDetailVehicle.currentServiceType)" effect="light">
                                                    {{ getServiceFullName(currentDetailVehicle.currentServiceType) }}
                                                </el-tag>
                                                <span class="text-sm text-gray-500">可服务 {{ (currentDetailVehicle.serviceTypes || []).length }} 项</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">启用状态</div>
                                            <div class="flex items-center gap-2">
                                                <span class="inline-flex items-center gap-1 text-sm"
                                                    :class="currentDetailVehicle.enabled ? 'text-emerald-600' : 'text-red-500'">
                                                    <span class="w-2 h-2 rounded-full"
                                                        :class="currentDetailVehicle.enabled ? 'bg-emerald-500' : 'bg-red-500'"></span>
                                                    {{ currentDetailVehicle.enabled ? '已启用，对外接受新订单' : '已停用，暂停接单' }}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">资产说明</div>
                                            <div class="text-sm text-gray-700">{{ currentDetailVehicle.owner || '未登记所有人' }} · {{ getSourceName(currentDetailVehicle.source) }}</div>
                                        </div>
                                    </div>
                                </div>

                                <el-descriptions title="车辆基础档案" :column="4" border
                                    class="bg-white shadow-sm rounded-lg overflow-hidden">
                                    <el-descriptions-item label="颜色">
                                        <div class="flex items-center gap-2">
                                            <div class="w-3 h-3 rounded-full border border-gray-200 shadow-sm"
                                                :style="{backgroundColor: currentDetailVehicle.color === '白色' ? '#fff' : currentDetailVehicle.color === '黑色' ? '#000' : '#888'}">
                                            </div>
                                            {{ currentDetailVehicle.color }}
                                        </div>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="车座">{{ currentDetailVehicle.seats
                                        }}座</el-descriptions-item>
                                    <el-descriptions-item label="燃料">
                                        <el-tag size="small"
                                            :type="currentDetailVehicle.fuelType === 'ELECTRIC' ? 'success' : 'warning'"
                                            effect="plain">{{ currentDetailVehicle.fuelType }}</el-tag>
                                    </el-descriptions-item>
                                    <el-descriptions-item label="车门">{{ currentDetailVehicle.doors
                                        }}门</el-descriptions-item>
                                    <el-descriptions-item label="资产所属车行">{{ getCompanyName(currentDetailVehicle.assetCompanyId)
                                        }}</el-descriptions-item>
                                    <el-descriptions-item label="资产来源">{{ getSourceName(currentDetailVehicle.source)
                                        }}</el-descriptions-item>
                                    <el-descriptions-item label="登记所有人">{{ currentDetailVehicle.owner
                                        }}</el-descriptions-item>
                                    <el-descriptions-item label="当前位置" :span="2">{{ getLocationName(currentDetailVehicle)
                                        }}</el-descriptions-item>
                                    <el-descriptions-item label="出厂年份">{{ currentDetailVehicle.year
                                        }}</el-descriptions-item>
                                    <el-descriptions-item label="上牌日期">2023-05-20</el-descriptions-item>
                                    <el-descriptions-item label="车架号 (VIN)" :span="2">{{ currentDetailVehicle.vin
                                        }}</el-descriptions-item>
                                    <el-descriptions-item label="设备CID" :span="2">{{ currentDetailVehicle.cid || '未绑定'
                                        }}</el-descriptions-item>
                                </el-descriptions>

                                <div class="bg-white rounded-lg border border-gray-200 p-4">
                                    <div class="flex items-center justify-between mb-3 text-sm">
                                        <div class="flex items-center gap-2">
                                            <div class="w-1 h-4 bg-blue-600 rounded-full"></div>
                                            <h3 class="font-bold text-gray-800">最新车况照片</h3>
                                            <el-tag size="small" type="info" effect="plain"
                                                class="border-gray-200 text-gray-500">2024-05-01 验车</el-tag>
                                        </div>
                                        <el-button link type="primary" size="small"
                                            @click="photoHistoryVisible = true">查看历史照片</el-button>
                                    </div>

                                    <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-3">
                                        <div 
                                            class="h-52 rounded-xl overflow-hidden relative group bg-gray-100 border border-gray-200">
                                            <img :src="getVehiclePhoto(currentDetailVehicle)"
                                                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                                            <div 
                                                class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3">
                                                <div class="flex items-center gap-2">
                                                    <el-tag size="small" type="primary" effect="dark"
                                                        class="border-none !bg-blue-600/90 shadow-sm">主视图</el-tag>
                                                    <span class="text-white/80 text-xs">最近一次验车主图</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="grid grid-cols-2 gap-3">
                                            <div v-for="(img, idx) in ['正前', '右前 45°', '中控仪表', '后排座椅']"
                                                :key="'compact'+idx"
                                                class="h-[102px] rounded-lg overflow-hidden relative group cursor-pointer bg-gray-100 border border-gray-200">
                                                <img :src="vehiclePlaceholder"
                                                    class="w-full h-full object-cover opacity-90 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105">
                                                <div 
                                                    class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex justify-center">
                                                    <span class="text-[10px] text-white/90 font-medium tracking-wide">{{
                                                        img }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane label="订单记录" name="ORDERS"
                            class="h-full overflow-y-auto custom-scroll p-6 w-full bg-gray-50/50">
                            <div class="max-w-7xl mx-auto space-y-4">
                                
                                <div class="flex justify-between items-end border-b border-gray-200 pb-2">
                                    <el-tabs v-model="activeOrderTab" class="!mb-0"
                                        style="--el-tabs-header-height: 40px;">
                                        <el-tab-pane label="同站租还" name="same_station"></el-tab-pane>
                                        <el-tab-pane label="甲租乙还" name="one_way"></el-tab-pane>
                                        <el-tab-pane label="公务车" name="official"></el-tab-pane>
                                    </el-tabs>
                                    <div class="flex items-center gap-3 pb-1">
                                        <el-radio-group v-model="radioTime" size="small">
                                            <el-radio-button label="近半年" ></el-radio-button>
                                            <el-radio-button label="全部" ></el-radio-button>
                                        </el-radio-group>
                                        <el-input prefix-icon="Search" placeholder="搜索订单号/手机号" size="small"
                                            style="width: 200px" ></el-input>
                                    </div>
                                </div>

                                
                                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    <el-table :data="filteredOrderRecords" style="width: 100%" stripe
                                        :header-cell-style="{ background: '#f9fafb', color: '#4b5563', fontWeight: '600' }">
                                        <el-table-column label="订单信息" min-width="160">
                                            <template #default="scope">
                                                <div class="flex flex-col">
                                                    <router-link :to="{ path: '/operation/order-detail', query: { id: scope.row.orderId } }"
                                                        class="text-theme-primary font-bold hover:underline mb-0.5 font-mono text-sm">
                                                        {{ scope.row.orderId }}
                                                    </router-link>
                                                    <div class="text-xs text-gray-400">{{ scope.row.createTime }}</div>
                                                </div>
                                            </template>
                                        </el-table-column>

                                        <el-table-column label="客户" min-width="160">
                                            <template #default="scope">
                                                <div class="flex items-center gap-2">
                                                    <div class="font-medium text-gray-800">{{ scope.row.customer.name }}
                                                    </div>
                                                    <el-tag v-if="scope.row.clientType === 'corporate'" size="small"
                                                        color="#F3E5F5" style="color: #7B1FA2; border-color: #E1BEE7;"
                                                        effect="light">
                                                        {{ scope.row.corporate?.shortName }}
                                                    </el-tag>
                                                </div>
                                                <div class="text-xs text-gray-500 mt-0.5">{{ scope.row.customer.phone }}
                                                </div>
                                                <el-tag v-if="scope.row.customer.level" size="small" effect="plain"
                                                    class="mt-1 scale-90 origin-left">{{ scope.row.customer.level
                                                    }}</el-tag>
                                            </template>
                                        </el-table-column>

                                        <el-table-column label="行程时间" min-width="180">
                                            <template #default="scope">
                                                <div class="text-sm">
                                                    <div class="flex items-center gap-1 mb-1">
                                                        <span class="text-gray-400 w-8 text-xs">取车</span>
                                                        <span class="font-medium text-gray-700">{{
                                                            scope.row.schedule.start }}</span>
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <span class="text-gray-400 w-8 text-xs">还车</span>
                                                        <span class="font-medium"
                                                            :class="{'text-red-500 font-bold': scope.row.status === 'overdue', 'text-gray-700': scope.row.status !== 'overdue'}">
                                                            {{ scope.row.schedule.end }}
                                                        </span>
                                                        <el-icon v-if="scope.row.status === 'overdue'"
                                                            class="text-red-500 ml-1">
                                                            <Warning></Warning>
                                                        </el-icon>
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>

                                        <el-table-column label="取还门店" min-width="140">
                                            <template #default="scope">
                                                <div class="text-sm">
                                                    <div v-if="scope.row.location.pickup !== scope.row.location.return"
                                                        class="flex flex-col gap-1">
                                                        <div class="flex items-center gap-1">
                                                            <el-tag size="small" type="warning" effect="dark"
                                                                class="scale-90 origin-left w-10 text-center px-0">取</el-tag>
                                                            <span class="text-yellow-700 font-bold text-xs">{{
                                                                scope.row.location.pickup }}</span>
                                                        </div>
                                                        <div class="flex items-center gap-1">
                                                            <el-tag size="small" type="warning" effect="dark"
                                                                class="scale-90 origin-left w-10 text-center px-0">还</el-tag>
                                                            <span class="text-yellow-700 font-bold text-xs">{{
                                                                scope.row.location.return }}</span>
                                                        </div>
                                                    </div>
                                                    <div v-else>
                                                        <div class="flex items-center gap-1 mb-1">
                                                            <el-tag size="small" type="info" effect="plain"
                                                                class="scale-90 origin-left w-10 text-center px-0">取</el-tag>
                                                            <span class="text-gray-700 text-xs">{{
                                                                scope.row.location.pickup }}</span>
                                                        </div>
                                                        <div class="flex items-center gap-1">
                                                            <el-tag size="small" type="info" effect="plain"
                                                                class="scale-90 origin-left w-10 text-center px-0">还</el-tag>
                                                            <span class="text-gray-700 text-xs">{{
                                                                scope.row.location.return }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </el-table-column>

                                        <el-table-column label="金额" min-width="100" align="right">
                                            <template #default="scope">
                                                <div class="font-bold text-gray-800 font-mono">¥{{
                                                    scope.row.amount.toLocaleString() }}</div>
                                                <div class="text-xs text-orange-400"
                                                    v-if="scope.row.status === 'reserved' || scope.row.status === 'pending_payment'">
                                                    待支付</div>
                                            </template>
                                        </el-table-column>

                                        <el-table-column label="状态" min-width="100" align="center">
                                            <template #default="{ row }">
                                                <el-tag :type="tableStatusConfig(row.status).type"
                                                    :color="tableStatusConfig(row.status).color"
                                                    :style="tableStatusConfig(row.status).color ? { color: '#fff', borderColor: tableStatusConfig(row.status).color } : {}"
                                                    effect="light" round size="small">
                                                    {{ tableStatusConfig(row.status).text }}
                                                </el-tag>
                                            </template>
                                        </el-table-column>

                                        <el-table-column label="操作" min-width="80" align="center" fixed="right">
                                            <template #default="scope">
                                                <el-button link type="primary" size="small">详情</el-button>
                                            </template>
                                        </el-table-column>

                                        <template #empty>
                                            <el-empty description="该分类下暂无订单记录" :image-size="80"></el-empty>
                                        </template>
                                    </el-table>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        
                        <el-tab-pane label="营运轨迹" name="OPERATIONS"
                            class="h-full overflow-y-auto custom-scroll p-6 w-full">
                            <div class="max-w-7xl mx-auto space-y-4">
                                <div 
                                    class="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div class="flex items-center gap-4">
                                        <h3 class="font-bold text-gray-800 text-base">出入站流水记录</h3>
                                        <el-radio-group v-model="radioTime" size="small">
                                            <el-radio-button label="近7天" ></el-radio-button>
                                            <el-radio-button label="近30天" ></el-radio-button>
                                            <el-radio-button label="全部" ></el-radio-button>
                                        </el-radio-group>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <el-input prefix-icon="Search" placeholder="搜索单号/门店" size="small"
                                            style="width: 200px" ></el-input>
                                        <el-button icon="Download" size="small" plain>导出</el-button>
                                    </div>
                                </div>

                                <div class="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                    <el-table :data="[
                                        { time: '2024-05-03 14:00', type: 'IN', station: '新北板桥车站 B1 停车区', reason: '租赁还车', orderNo: '#ORD-20240501-A2', mileage: '12,850 km', operator: '王怡君' },
                                        { time: '2024-05-01 10:00', type: 'OUT', station: '台北松山机场第一停车场', reason: '租赁出车', orderNo: '#ORD-20240501-A2', mileage: '12,630 km', operator: '陈柏翰' },
                                        { time: '2024-04-28 09:30', type: 'IN', station: '台中高铁 P1 停车区', reason: '内部调度', orderNo: '#DSP-009', mileage: '12,580 km', operator: '林家豪' },
                                        { time: '2024-04-28 08:00', type: 'OUT', station: 'RIMO 新北板桥旗舰店', reason: '内部调度', orderNo: '#DSP-009', mileage: '12,540 km', operator: '林家豪' },
                                    ]" stripe size="default" style="width: 100%">
                                        <el-table-column prop="time" label="时间" width="160" sortable>
                                            <template #default="{row}"><span class="font-mono text-gray-600">{{ row.time
                                                    }}</span></template>
                                        </el-table-column>
                                        <el-table-column prop="type" label="类型" width="100">
                                            <template #default="{row}">
                                                <el-tag :type="row.type === 'IN' ? 'success' : 'primary'" effect="plain"
                                                    size="small" class="w-16 text-center">
                                                    {{ row.type === 'IN' ? '入站' : '出站' }}
                                                </el-tag>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="station" label="站点/停车场" min-width="180">
                                            <template #default="{row}"><span class="font-bold text-gray-700">{{
                                                    row.station }}</span></template>
                                        </el-table-column>
                                        <el-table-column prop="reason" label="业务类型" width="120"></el-table-column>
                                        <el-table-column prop="orderNo" label="关联单号" width="160">
                                            <template #default="{row}"><el-link type="primary" :underline="false">{{
                                                    row.orderNo }}</el-link></template>
                                        </el-table-column>
                                        <el-table-column prop="mileage" label="里程" width="120" align="right">
                                            <template #default="{row}"><span class="font-mono">{{ row.mileage
                                                    }}</span></template>
                                        </el-table-column>
                                        <el-table-column prop="operator" label="操作人" width="100"></el-table-column>
                                    </el-table>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane label="健康档案" name="HEALTH" class="h-full overflow-y-auto custom-scroll p-6 w-full">
                            <div class="space-y-6 max-w-7xl mx-auto">
                                
                                <el-card shadow="never" class="!border-gray-200">
                                    <template #header>
                                        <div class="flex justify-between items-center">
                                            <span class="font-bold flex items-center gap-2"><el-icon 
                                                    class="text-orange-500">
                                                    <Tools></Tools>
                                                </el-icon> 维保记录</span>
                                            <el-button type="primary" link icon="Plus">新增记录</el-button>
                                        </div>
                                    </template>
                                    <el-table :data="mockMaintenanceData" empty-text="暂无维保记录" border stripe
                                        size="small">
                                        <el-table-column prop="date" label="维保日期" width="120"></el-table-column>
                                        <el-table-column prop="type" label="维保类型" width="100">
                                            <template #default="{row}"><el-tag 
                                                    size="small">{{row.type}}</el-tag></template>
                                        </el-table-column>
                                        <el-table-column prop="items" label="项目内容"></el-table-column>
                                        <el-table-column prop="cost" label="金额" width="100">
                                            <template #default="{row}">N/A</template>
                                        </el-table-column>
                                        <el-table-column prop="garage" label="维修厂"></el-table-column>
                                        <el-table-column prop="operator" label="经办人" width="100"></el-table-column>
                                    </el-table>
                                </el-card>

                                
                                <el-card shadow="never" class="!border-red-100 bg-red-50/10">
                                    <template #header>
                                        <div class="flex justify-between items-center border-red-50">
                                            <span class="font-bold text-red-600 flex items-center gap-2"><el-icon>
                                                    <WarningFilled></WarningFilled>
                                                </el-icon> 事故/出险记录</span>
                                        </div>
                                    </template>
                                    <el-table :data="mockAccidentData" empty-text="暂无事故记录" border stripe size="small">
                                        <el-table-column prop="date" label="出险日期" width="120"></el-table-column>
                                        <el-table-column prop="desc" label="事故描述"></el-table-column>
                                        <el-table-column prop="status" label="理赔状态" width="100">
                                            <template #default="{row}">
                                                <el-tag :type="row.status === '已结案' ? 'success' : 'warning'"
                                                    size="small">{{row.status}}</el-tag>
                                            </template>
                                        </el-table-column>
                                        <el-table-column prop="cost" label="定损金额" width="100"></el-table-column>
                                    </el-table>
                                </el-card>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane label="系统日志" name="LOGS" class="h-full overflow-y-auto custom-scroll p-6 w-full">
                            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <el-table :data="mockSystemLogs" empty-text="加载中..." stripe size="small"
                                    style="width: 100%">
                                    <el-table-column prop="time" label="时间" width="180"></el-table-column>
                                    <el-table-column prop="user" label="操作人" width="120"></el-table-column>
                                    <el-table-column prop="action" label="操作内容"></el-table-column>
                                    <el-table-column prop="ip" label="IP地址"></el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                    </el-tabs>
                </div>
            </div>
        </el-drawer>

        
        <el-dialog v-model="photoHistoryVisible" title="历史车况照片" width="700px" append-to-body destroy-on-close>
            <div class="h-[600px] overflow-y-auto px-4 custom-scroll">
                <el-timeline>
                    <el-timeline-item v-for="(item, idx) in mockPhotoHistory" :key="idx" :timestamp="item.date"
                        placement="top" :type="idx===0 ? 'primary' : ''" :size="idx===0 ? 'large' : 'normal'">
                        <div 
                            class="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4 transition-all hover:shadow-sm">
                            
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <div class="font-bold text-gray-800 flex items-center gap-2">
                                        {{ item.type }}
                                        <el-tag v-if="idx===0" size="small" type="primary"
                                            effect="light">Current</el-tag>
                                    </div>
                                    <div class="text-xs text-gray-500 mt-1">验车人: {{ item.operator }}</div>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-4 gap-2 mb-2">
                                <el-image v-for="(url, pIdx) in item.photos" :key="pIdx" :src="url"
                                    :preview-src-list="item.photos" :initial-index="pIdx" fit="cover"
                                    class="w-full aspect-video rounded border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                                </el-image>
                            </div>
                            
                            <div 
                                class="text-xs text-gray-500 bg-white p-2 rounded border border-gray-100 flex items-start gap-1">
                                <el-icon class="mt-0.5">
                                    <InfoFilled></InfoFilled>
                                </el-icon>
                                <span>备注: {{ item.remark }}</span>
                            </div>
                        </div>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import sedanPhoto from "../../assets/demo/vehicle-sedan.jpg";
import electricPhoto from "../../assets/demo/vehicle-electric.jpg";
import vehiclePlaceholder from "../../assets/demo/vehicle-placeholder.svg";

// --- Mock Data (Synced with other pages conceptually) ---
                const orgData = ref([
                    {
                        id: 'C1', label: 'RIMO 台湾直营车行', value: 'C1',
                        children: [
                            {
                                id: 'S1', label: '台北松山机场旗舰店', value: 'S1', children: [
                                    { id: '1', label: '台北松山机场第一停车场', value: '1' },
                                    { id: '2', label: '民生敦北自助取还区', value: '2' }
                                ]
                            },
                            {
                                id: 'S2', label: '新北板桥旗舰店', value: 'S2', children: [
                                    { id: '3', label: '板桥车站 B1 停车区', value: '3' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'C2', label: '晨峰租车合作车行', value: 'C2',
                        children: [
                            {
                                id: 'S3', label: '台中高铁站门市', value: 'S3', children: [
                                    { id: '4', label: '台中高铁 P1 停车区', value: '4' }
                                ]
                            },
                            {
                                id: 'S4', label: '高雄左营高铁门市', value: 'S4', children: [
                                    { id: '5', label: '左营高铁彩虹市集停车区', value: '5' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'C3', label: '海岳租车合作车行', value: 'C3',
                        children: [
                            {
                                id: 'S5', label: '桃园青埔门市', value: 'S5', children: [
                                    { id: '6', label: '桃园高铁站前停车区', value: '6' }
                                ]
                            }
                        ]
                    }
                ]);

                const groupsData = ref([
                    { id: 'G1', vehicleType: 'car', brand: 'Toyota', model: 'Corolla Cross', year: '2024', defaultPhotoUrl: sedanPhoto },
                    { id: 'G2', vehicleType: 'car', brand: 'Lexus', model: 'UX 300e', year: '2024', defaultPhotoUrl: electricPhoto }
                    ,
                    { id: 'G3', vehicleType: 'motorcycle', brand: 'Yamaha', model: 'XMAX 300', year: '2023', defaultPhotoUrl: vehiclePlaceholder },
                    { id: 'G4', vehicleType: 'motorcycle', brand: 'Gogoro', model: 'SuperSport', year: '2024', defaultPhotoUrl: vehiclePlaceholder },
                    { id: 'G5', vehicleType: 'microElectric', brand: 'RIMO', model: 'Mini EV', year: '2024', defaultPhotoUrl: vehiclePlaceholder }]);

                const vehicles = ref([
                    {
                        id: 'V1', licensePlate: 'BKA-1023', vin: 'AHTLB3JE0R0001234', vehicleGroupId: 'G1', color: '珍珠白', year: '2024', mileage: 12850, operationStatus: 'IDLE', enabled: true, assetCompanyId: 'C1', storeId: 'S1', stationId: '1', serviceTypes: ['SHARING_SAME', 'STORE_STANDARD'], currentServiceType: 'STORE_STANDARD', customPhotoUrl: '',
                        seats: 5, doors: 5, fuelType: 'GASOLINE', transmission: 'AT', luggageLarge: 2, luggageSmall: 2, isDomestic: true, source: 'PURCHASE', owner: 'RIMO 台湾直营车队', vehicleType: 'car'
                    },
                    {
                        id: 'V2', licensePlate: 'BQT-5816', vin: 'JTHC65BH0R2005678', vehicleGroupId: 'G2', color: '曜石黑', year: '2024', mileage: 5300, operationStatus: 'RENTED', enabled: true, assetCompanyId: 'C1', storeId: 'S2', stationId: '3', serviceTypes: ['STORE_STANDARD', 'STORE_24H'], currentServiceType: 'STORE_STANDARD', customPhotoUrl: '',
                        seats: 5, doors: 5, fuelType: 'ELECTRIC', transmission: 'AT', luggageLarge: 2, luggageSmall: 1, isDomestic: false, source: 'PURCHASE', owner: 'RIMO 台湾直营车队', vehicleType: 'car'
                    },
                    {
                        id: 'V3', licensePlate: 'BCP-7315', vin: 'JTMBW3FV0R1009012', vehicleGroupId: 'G1', color: '云河灰', year: '2024', mileage: 26800, operationStatus: 'MAINTENANCE', enabled: true, assetCompanyId: 'C2', storeId: 'S3', stationId: '4', serviceTypes: ['SHARING_ONE_WAY', 'STORE_STANDARD'], currentServiceType: 'STORE_STANDARD', customPhotoUrl: '',
                        seats: 5, doors: 5, fuelType: 'GASOLINE', transmission: 'AT', luggageLarge: 1, luggageSmall: 2, isDomestic: true, source: 'LEASE', owner: '晨峰租车', vehicleType: 'car'
                    },
                    {
                        id: 'V4', licensePlate: 'NWM-2288', vin: 'RKRSG4220PA001122', vehicleGroupId: 'G3', color: '消光蓝', year: '2023', mileage: 4200, operationStatus: 'IDLE', enabled: true, assetCompanyId: 'C2', storeId: 'S4', stationId: '5', serviceTypes: ['STORE_STANDARD', 'SHARING_SAME'], currentServiceType: 'STORE_STANDARD', customPhotoUrl: '',
                        seats: 2, doors: 0, fuelType: 'GASOLINE', transmission: 'AT', luggageLarge: 0, luggageSmall: 1, isDomestic: false, source: 'AFFILIATE', owner: '晨峰租车', vehicleType: 'motorcycle'
                    },
                    {
                        id: 'V5', licensePlate: 'PJF-9091', vin: 'GGRSS0010RA003344', vehicleGroupId: 'G4', color: '星宇灰', year: '2024', mileage: 3500, operationStatus: 'RENTED', enabled: false, assetCompanyId: 'C3', storeId: 'S5', stationId: '6', serviceTypes: ['STORE_STANDARD'], currentServiceType: 'STORE_STANDARD', customPhotoUrl: '',
                        seats: 1, doors: 0, fuelType: 'ELECTRIC', transmission: 'AT', luggageLarge: 0, luggageSmall: 0, isDomestic: true, source: 'TRUST', owner: '海岳租车', vehicleType: 'motorcycle'
                    },
                    {
                        id: 'V6', licensePlate: 'BER-6024', vin: 'AHTLB3JE0R0007788', vehicleGroupId: 'G1', color: '钛银', year: '2024', mileage: 8900, operationStatus: 'IDLE', enabled: true, assetCompanyId: 'C1', storeId: 'S1', stationId: '2', serviceTypes: ['STORE_STANDARD', 'STORE_24H'], currentServiceType: 'STORE_24H', customPhotoUrl: '',
                        seats: 5, doors: 5, fuelType: 'GASOLINE', transmission: 'AT', luggageLarge: 2, luggageSmall: 2, isDomestic: true, source: 'PURCHASE', owner: 'RIMO 台湾直营车队', vehicleType: 'car'
                    },
                    {
                        id: 'V7', licensePlate: 'MEV-0528', vin: 'MEV202405280001', vehicleGroupId: 'G5', color: '海湾蓝', year: '2024', mileage: 760, operationStatus: 'IDLE', enabled: true, assetCompanyId: 'C1', storeId: 'S1', stationId: '1', serviceTypes: ['SHARING_SAME'], currentServiceType: 'SHARING_SAME', customPhotoUrl: '',
                        seats: 2, doors: 2, fuelType: 'ELECTRIC', transmission: 'AT', luggageLarge: 0, luggageSmall: 1, isDomestic: true, source: 'PURCHASE', owner: 'RIMO 台湾直营车队', vehicleType: 'microElectric'
                    }
                ]);

                // --- Filter State ---
                const filterAssetCompanyIds = ref([]);
                const filterPositionIds = ref([]);
                const filterStatus = ref(['IDLE', 'RENTED', 'MAINTENANCE']);
                const filterEnabledStates = ref(['enabled', 'disabled']);
                const filterServiceTypes = ref(['SHARING_SAME', 'SHARING_ONE_WAY', 'STORE_STANDARD', 'STORE_24H', 'GOV']);
                const filterVehicleTypes = ref(['car', 'motorcycle', 'microElectric']);
                const searchQuery = ref('');
                const searchPanelExpanded = ref(false);
                const positionFilterProps = {
                    multiple: true,
                    checkStrictly: true,
                    emitPath: false
                };

                const statusOptions = [
                    { value: 'IDLE', label: '空闲', tagText: 'IDLE', tagType: 'success' },
                    { value: 'RENTED', label: '租赁中', tagText: 'RENT', tagType: 'primary' },
                    { value: 'MAINTENANCE', label: '维保中', tagText: 'MAIN', tagType: 'warning' }
                ];

                const enabledOptions = [
                    { value: 'enabled', label: '已启用', tagText: 'ON', tagType: 'success' },
                    { value: 'disabled', label: '已停用', tagText: 'OFF', tagType: 'danger' }
                ];

                const serviceOptions = [
                    { value: 'SHARING_SAME', label: '同站租还', tagText: '同', tagType: 'success' },
                    { value: 'SHARING_ONE_WAY', label: '甲租乙还', tagText: '异', tagType: 'success' },
                    { value: 'STORE_STANDARD', label: '门市租赁', tagText: '店', tagType: 'warning' },
                    { value: 'STORE_24H', label: '24H门市', tagText: '24', tagType: 'warning' },
                    { value: 'GOV', label: '公务用', tagText: '政', tagType: 'info' }
                ];

                const vehicleTypeOptions = [
                    { value: 'car', label: '汽车' },
                    { value: 'motorcycle', label: '摩托车' },
                    { value: 'microElectric', label: '微电车' }
                ];





                // --- Dialog State ---
                const dialogVisible = ref(false);
                const activeDialogTab = ref('BASIC');
                const isEdit = ref(false);
                const currentVehicle = reactive({});
                const formRef = ref(null);

                const importDialogVisible = ref(false);
                const importFile = ref(null);

                const rules = {
                    licensePlate: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
                    vehicleGroupId: [{ required: true, message: '请选择所属车型组', trigger: 'change' }],
                    assetCompanyId: [{ required: true, message: '请选择资产所属车行', trigger: 'change' }],
                    storeId: [{ required: true, message: '请选择当前门市', trigger: 'change' }],
                    stationId: [{ required: true, message: '请选择当前据点', trigger: 'change' }],
                    vin: [{ min: 17, max: 17, message: 'VIN长度应为17位', trigger: 'blur' }]
                };

                // --- Computed ---
                const companyOptions = computed(() => orgData.value.map(company => ({
                    id: company.id,
                    label: company.label
                })));

                const filteredStoreOptions = computed(() => {
                    const company = orgData.value.find(item => item.id === currentVehicle.assetCompanyId);
                    return company ? company.children || [] : [];
                });

                const filteredStationOptions = computed(() => {
                    const store = filteredStoreOptions.value.find(item => item.id === currentVehicle.storeId);
                    return store ? store.children || [] : [];
                });

                const filteredGroupOptions = computed(() => {
                    return groupsData.value.filter(g => g.vehicleType === currentVehicle.vehicleType);
                });

                const getVehicleTypeLabel = (type) => {
                    return vehicleTypeOptions.find(item => item.value === type)?.label || '-';
                };

                const getVehicleTypeTagType = (type) => {
                    const map = {
                        car: 'success',
                        motorcycle: 'warning',
                        microElectric: 'info'
                    };
                    return map[type] || 'info';
                };

                const handleVehicleTypeChange = () => {
                    currentVehicle.vehicleGroupId = ''; // Reset selection when type changes
                };

                const handleAssetCompanyChange = () => {
                    if (!filteredStoreOptions.value.some(store => store.id === currentVehicle.storeId)) {
                        currentVehicle.storeId = '';
                        currentVehicle.stationId = '';
                    }
                };

                const handleStoreChange = () => {
                    if (!filteredStationOptions.value.some(station => station.id === currentVehicle.stationId)) {
                        currentVehicle.stationId = '';
                    }
                };

                const resetVehicleFilters = () => {
                    filterAssetCompanyIds.value = [];
                    filterPositionIds.value = [];
                    filterStatus.value = ['IDLE', 'RENTED', 'MAINTENANCE'];
                    filterEnabledStates.value = ['enabled', 'disabled'];
                    filterServiceTypes.value = ['SHARING_SAME', 'SHARING_ONE_WAY', 'STORE_STANDARD', 'STORE_24H', 'GOV'];
                    filterVehicleTypes.value = ['car', 'motorcycle', 'microElectric'];
                    searchQuery.value = '';
                    searchPanelExpanded.value = false;
                };

                const filteredVehicles = computed(() => {
                    return vehicles.value.filter(v => {
                        // 1. Asset company
                        if (filterAssetCompanyIds.value.length > 0 && !filterAssetCompanyIds.value.includes(v.assetCompanyId)) {
                            return false;
                        }
                        // 2. Position
                        if (filterPositionIds.value.length > 0) {
                            const scopeStationIds = getMergedStationIds(filterPositionIds.value);
                            if (scopeStationIds.length === 0 || !scopeStationIds.includes(v.stationId)) return false;
                        }
                        // 3. Status
                        if (filterStatus.value.length > 0 && !filterStatus.value.includes(v.operationStatus)) return false;
                        // 4. Enabled state
                        const enabledState = v.enabled ? 'enabled' : 'disabled';
                        if (filterEnabledStates.value.length > 0 && !filterEnabledStates.value.includes(enabledState)) return false;
                        // 5. Service Type
                        if (filterVehicleTypes.value.length > 0 && !filterVehicleTypes.value.includes(v.vehicleType)) return false;
                        if (filterServiceTypes.value.length > 0) {
                            const hasType = v.serviceTypes.some(t => filterServiceTypes.value.includes(t));
                            if (!hasType) return false;
                        }
                        // 6. Search
                        if (searchQuery.value) {
                            const q = searchQuery.value.toLowerCase();
                            return v.licensePlate.toLowerCase().includes(q) || v.vin.toLowerCase().includes(q);
                        }
                        return true;
                    });
                });

                // --- Helpers ---
                const getGroupName = (gid) => {
                    const g = groupsData.value.find(x => x.id === gid);
                    return g ? `${g.brand} ${g.model}` : '未知车型';
                };

                const getStoreMeta = (storeId) => {
                    for (const company of orgData.value) {
                        for (const store of company.children || []) {
                            if (store.id === storeId) return { company, store };
                        }
                    }
                    return null;
                };

                const getStationMeta = (stationId) => {
                    for (const company of orgData.value) {
                        for (const store of company.children || []) {
                            for (const station of store.children || []) {
                                if (station.id === stationId) return { company, store, station };
                            }
                        }
                    }
                    return null;
                };

                const getStationIdsInScope = (nodeId) => {
                    if (!nodeId) return [];
                    const stationMeta = getStationMeta(nodeId);
                    if (stationMeta) return [stationMeta.station.id];

                    const storeMeta = getStoreMeta(nodeId);
                    if (storeMeta) return (storeMeta.store.children || []).map(item => item.id);

                    const company = orgData.value.find(item => item.id === nodeId);
                    if (company) {
                        return (company.children || []).flatMap(store => (store.children || []).map(item => item.id));
                    }
                    return [];
                };

                const getMergedStationIds = (nodeIds) => {
                    return [...new Set((nodeIds || []).flatMap(id => getStationIdsInScope(id)))];
                };

                const getCompanyName = (companyId) => {
                    const company = orgData.value.find(item => item.id === companyId);
                    return company ? company.label : companyId || '-';
                };

                const getStoreName = (storeId) => {
                    const meta = getStoreMeta(storeId);
                    return meta ? meta.store.label : storeId || '-';
                };

                const getStationName = (sid) => {
                    const meta = getStationMeta(sid);
                    return meta ? meta.station.label : sid || '-';
                };

                const getLocationName = (vehicle) => {
                    const storeName = getStoreName(vehicle.storeId);
                    const stationName = getStationName(vehicle.stationId);
                    if (storeName === '-' && stationName === '-') return '-';
                    if (storeName === '-') return stationName;
                    if (stationName === '-') return storeName;
                    return `${storeName} - ${stationName}`;
                };

                const getStatusName = (s) => ({ IDLE: '空闲', RENTED: '租赁中', MAINTENANCE: '维保中' }[s] || s);
                const getStatusType = (s) => ({ IDLE: 'success', RENTED: 'primary', MAINTENANCE: 'warning' }[s] || 'info');
                const getOperationStatusName = getStatusName;
                const getOperationStatusType = getStatusType;
                const getSourceName = (source) => ({
                    PURCHASE: '自购',
                    LEASE: '租赁',
                    AFFILIATE: '挂靠',
                    TRUST: '托管'
                }[source] || source || '-');
                const getServiceName = (t) => ({
                    SHARING_SAME: '同站',
                    SHARING_ONE_WAY: '异地',
                    STORE_STANDARD: '门市',
                    STORE_24H: '24H',
                    GOV: '公务'
                }[t] || t);
                const getServiceFullName = (t) => ({
                    SHARING_SAME: '同站租还',
                    SHARING_ONE_WAY: '甲租乙还',
                    STORE_STANDARD: '门市租赁',
                    STORE_24H: '24H门市',
                    GOV: '公务用车'
                }[t] || t || '-');
                const getServiceTooltip = (serviceTypes) => {
                    const list = (serviceTypes || []).map(getServiceFullName).filter(Boolean);
                    return list.length > 0 ? list.join('、') : '未配置服务项目';
                };
                const getServiceTagType = (t) => ({
                    SHARING_SAME: 'success',
                    SHARING_ONE_WAY: 'success',
                    STORE_STANDARD: 'warning',
                    STORE_24H: 'warning',
                    GOV: 'info'
                }[t] || 'info');

                const getVehiclePhoto = (row) => {
                    if (row.customPhotoUrl) return row.customPhotoUrl;
                    const g = groupsData.value.find(x => x.id === row.vehicleGroupId);
                    return g ? g.defaultPhotoUrl : '';
                };

                // --- Actions ---
                const openDialog = (row) => {
                    activeDialogTab.value = 'BASIC'; // Reset tab
                    if (row) {
                        isEdit.value = true;
                        Object.assign(currentVehicle, JSON.parse(JSON.stringify(row)));
                        currentVehicle.serviceTypes = row.serviceTypes || []; // Ensure array
                    } else {
                        isEdit.value = false;
                        Object.assign(currentVehicle, {
                            id: 'V' + Date.now(),
                            licensePlate: '',
                            vin: '',
                            vehicleGroupId: '',
                            color: '',
                            year: new Date().getFullYear().toString(),
                            vehicleType: 'car',
                            mileage: 0,
                            operationStatus: 'IDLE',
                            enabled: true,
                            assetCompanyId: '',
                            storeId: '',
                            stationId: '',
                            serviceTypes: [],
                            currentServiceType: 'STORE_STANDARD',
                            customPhotoUrl: '',
                            nickname: '', seats: 5, doors: 4, fuelType: 'GASOLINE', transmission: 'AT',
                            tankCapacity: '', displacement: '', isDomestic: true,
                            luggageLarge: 0, luggageSmall: 0,
                            owner: '', source: 'PURCHASE', tags: [],
                            isSpecial: false, specialMembershipRequired: '', cid: ''
                        });
                    }
                    dialogVisible.value = true;
                };

                const saveVehicle = () => {
                    formRef.value.validate((valid) => {
                        if (valid) {
                            if (isEdit.value) {
                                const idx = vehicles.value.findIndex(v => v.id === currentVehicle.id); // Changed vehiclesData to vehicles
                                if (idx !== -1) vehicles.value[idx] = { ...currentVehicle }; // Changed vehiclesData to vehicles
                            } else {
                                vehicles.value.push({ ...currentVehicle }); // Changed vehiclesData to vehicles
                            }
                            dialogVisible.value = false;
                            ElMessage.success('保存成功');
                        }
                    });
                };

                const setMaintenance = (row) => {
                    row.operationStatus = 'MAINTENANCE';
                    ElMessage.warning(`车辆 ${row.licensePlate} 已切换至维保状态`);
                };

                const setIdle = (row) => {
                    row.operationStatus = 'IDLE';
                    ElMessage.success(`车辆 ${row.licensePlate} 维保结束，已上线`);
                };

                const handleStatusToggle = (row) => {
                    const originalState = !row.enabled; // State before toggle (since v-model already updated it)
                    // If turning ON, allow immediately
                    if (row.enabled) {
                        ElMessage.success(`车辆 ${row.licensePlate} 已启用`);
                        return;
                    }

                    // If turning OFF, check operation status
                    if (row.operationStatus === 'IDLE') {
                        ElMessage.success(`车辆 ${row.licensePlate} 已停用`);
                    } else {
                        // Vehicle is busy (RENTED or MAINTENANCE), ask for confirmation
                        ElMessageBox.confirm(
                            `该车辆当前处于 ${getStatusName(row.operationStatus)} 状态，停用后将不再接受新订单/任务，确认停用吗？`,
                            '确认停用',
                            {
                                confirmButtonText: '确认停用',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }
                        ).then(() => {
                            ElMessage.success(`车辆 ${row.licensePlate} 已停用`);
                        }).catch(() => {
                            row.enabled = true; // Revert switch
                        });
                    }
                };

                // --- Batch Operations ---
                const selectedVehicles = ref([]);

                const handleSelectionChange = (val) => {
                    selectedVehicles.value = val;
                };

                const handleBatchEnable = () => {
                    const toEnable = selectedVehicles.value.filter(v => !v.enabled);
                    if (toEnable.length === 0) {
                        return ElMessage.info('选中的车辆已全部启用');
                    }
                    toEnable.forEach(v => v.enabled = true);
                    ElMessage.success(`已批量启用 ${toEnable.length} 辆车`);
                    // Clear selection not strictly needed but good UX? Element UI table keeps selection unless manually cleared.
                    // Let's keep selection for now.
                };

                const handleBatchDisable = () => {
                    const toDisable = selectedVehicles.value.filter(v => v.enabled);
                    if (toDisable.length === 0) {
                        return ElMessage.info('选中的车辆已全部停用');
                    }

                    // Check for active vehicles
                    const activeVehicles = toDisable.filter(v => ['RENTED', 'MAINTENANCE'].includes(v.operationStatus));

                    if (activeVehicles.length > 0) {
                        ElMessageBox.confirm(
                            `选中的 ${toDisable.length} 辆车中，有 ${activeVehicles.length} 辆处于租赁或维保状态。停用后它们将不再接受新订单/任务，确认停用吗？`,
                            '批量停用确认',
                            {
                                confirmButtonText: '确认停用',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }
                        ).then(() => {
                            toDisable.forEach(v => v.enabled = false);
                            ElMessage.success(`已批量停用 ${toDisable.length} 辆车`);
                        }).catch(() => { });
                    } else {
                        ElMessageBox.confirm(
                            `确认批量停用选中的 ${toDisable.length} 辆车吗？`,
                            '批量停用确认',
                            { confirmButtonText: '确认', cancelButtonText: '取消' }
                        ).then(() => {
                            toDisable.forEach(v => v.enabled = false);
                            ElMessage.success(`已批量停用 ${toDisable.length} 辆车`);
                        }).catch(() => { });
                    }
                };

                const applyVehicleBatchStatus = (nextStatus) => {
                    if (nextStatus) {
                        handleBatchEnable();
                        return;
                    }
                    handleBatchDisable();
                };

                const deleteVehicle = (row) => {
                    const idx = vehicles.value.findIndex(v => v.id === row.id);
                    if (idx !== -1) {
                        vehicles.value.splice(idx, 1);
                        ElMessage.success('删除成功');
                    }
                };

                // --- Drawer Logic ---
                const detailDrawerVisible = ref(false);
                const currentDetailVehicle = ref({});
                const activeDetailTab = ref('OVERVIEW');

                const openDetailDrawer = (vehicle) => {
                    currentDetailVehicle.value = { ...vehicle }; // Clone
                    activeDetailTab.value = 'OVERVIEW';
                    detailDrawerVisible.value = true;
                };

                // Helper to get Photo (re-use logic)
                const getVehiclePhoto_Drawer = (vehicle) => {
                    if (!vehicle) return '';
                    if (vehicle.customPhotoUrl) return vehicle.customPhotoUrl;
                    const group = groupsData.value.find(g => g.id === vehicle.vehicleGroupId);
                    return group ? group.defaultPhotoUrl : vehiclePlaceholder;
                };

                // --- Drawer Mock Data ---
                const radioTime = ref('近30天');
                const activeOrderTab = ref('same_station');
                const mockOrderRecords = ref([
                    {
                        orderId: 'ZT2405060001', type: 'same_station', createTime: '2024-05-06 09:15', status: 'completed',
                        customer: { name: '张伟', phone: '0912-345-001', level: '新用户' },
                        schedule: { start: '2024-05-07 10:00', end: '2024-05-08 10:00' },
                        location: { pickup: '新北总店', return: '新北总店' }, amount: 1200
                    },
                    {
                        orderId: 'ZT2405060002', type: 'same_station', createTime: '2024-05-05 14:30', status: 'reserved',
                        customer: { name: '王小明', phone: '0912-345-678', level: '金牌会员' },
                        schedule: { start: '2024-05-07 09:30', end: '2024-05-10 18:00' },
                        location: { pickup: '新北总店', return: '新北总店' }, amount: 1920
                    },
                    {
                        orderId: 'ZT2405040003', type: 'one_way', createTime: '2024-05-04 14:20', status: 'completed',
                        customer: { name: '李阿美', phone: '0922-123-456', level: '普通会员' },
                        schedule: { start: '2024-05-04 15:00', end: '2024-05-07 10:00' },
                        location: { pickup: '台北车站店', return: '新北总店' }, amount: 850
                    },
                    {
                        orderId: 'GOV2405020008', type: 'official', createTime: '2024-05-02 10:00', status: 'renewing',
                        clientType: 'corporate', corporate: { shortName: '台积电' },
                        customer: { name: '赵强', phone: '0933-111-222', level: '白金会员', dept: '研发部' },
                        schedule: { start: '2024-05-02 11:00', end: '2024-05-09 11:00' },
                        location: { pickup: '新北总店', return: '新北总店' }, amount: 5600
                    }
                ]);

                // Filter logic for order tabs
                const filteredOrderRecords = computed(() => {
                    return mockOrderRecords.value.filter(o => o.type === activeOrderTab.value);
                });

                const tableStatusConfig = (status) => {
                    const map = {
                        pending_payment: { text: "待支付", type: "info", color: "" },
                        reserved: { text: "已预订", type: "primary", color: "" },
                        inspecting: { text: "验车中", type: "warning", color: "" },
                        renting: { text: "用车中", type: "success", color: "" },
                        renewing: { text: "续租中", type: "success", color: "" },
                        overdue: { text: "逾期未还", type: "danger", color: "" },
                        settlement_pending: { text: "待结算", type: "warning", color: "#8E44AD" },
                        payment_due: { text: "待补缴", type: "warning", color: "#E67E22" },
                        refund_pending: { text: "待退款", type: "warning", color: "#E67E22" },
                        completed: { text: "已完成", type: "info", color: "" },
                        cancelled: { text: "已取消", type: "info", color: "" },
                        rejected: { text: "已拒绝", type: "danger", color: "" }
                    };
                    return map[status] || { text: status, type: "info", color: "" };
                };
                const mockMaintenanceData = ref([
                    { date: '2024-02-15', type: '常规保养', items: '更换机油、机油滤芯、轮胎对调', cost: 'NT$3,200', garage: '和泰汽车北投厂', operator: '陈柏翰' },
                    { date: '2023-12-20', type: '维修', items: '右后轮胎补胎与胎压校正', cost: 'NT$800', garage: 'RIMO 新北板桥整备中心', operator: '林家豪' }
                ]);
                const mockAccidentData = ref([
                    { date: '2024-01-12', desc: '右前保杆擦伤（台北市区路边停车时发生）', status: '理赔中', cost: 'NT$18,000', reportId: 'RP-20240112-03' }
                ]);
                const mockSystemLogs = ref([
                    { time: '2024-05-03 14:05:22', user: '王怡君', action: '修改车辆状态 [租赁中] -> [空闲]', ip: '10.21.8.15' },
                    { time: '2024-05-01 10:00:15', user: '陈柏翰', action: '修改车辆状态 [空闲] -> [租赁中]', ip: '10.21.8.32' },
                    { time: '2024-04-28 09:30:00', user: '系统', action: '自动同步车辆位置（GPS）', ip: '10.21.0.5' }
                ]);

                // --- Photo History Data ---
                const photoHistoryVisible = ref(false);
                const mockPhotoHistory = ref([
                    {
                        date: '2024-05-01 10:05',
                        type: '租赁出车验车',
                        operator: '张三',
                        remark: '车辆外观无新增划痕，内饰清洁。',
                        photos: [
                            vehiclePlaceholder,
                            vehiclePlaceholder,
                            vehiclePlaceholder
                        ]
                    },
                    {
                        date: '2024-04-28 09:30',
                        type: '入库验车',
                        operator: '李四',
                        remark: '右后轮毂有轻微擦伤，已记录。',
                        photos: [
                            vehiclePlaceholder,
                            vehiclePlaceholder,
                            vehiclePlaceholder,
                            vehiclePlaceholder
                        ]
                    }
                ]);

                const handleImportCommand = (cmd) => {
                    if (cmd === 'import') {
                        importDialogVisible.value = true;
                        importFile.value = null;
                    }
                };

                const handleExport = () => {
                    ElMessage.success('车辆数据导出任务已提交，系统稍后将自动下载文件。');
                };

                const downloadTemplate = () => {
                    ElMessage.success('模板开始下载');
                };

                const handleFileChange = (file) => {
                    importFile.value = file;
                };

                const confirmImport = () => {
                    if (!importFile.value) {
                        ElMessage.warning('请先选择要导入的批量文件');
                        return;
                    }
                    ElMessage.success('导入申请已提交，系统正在后台解析处理。');
                    importDialogVisible.value = false;
                    importFile.value = null;
                };
</script>

<style scoped>
:deep(.custom-drawer .el-drawer__body) {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  overflow: hidden;
}

.custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        :deep(.el-tree-node__content) {
            height: 32px;
        }

        /* Fix for Element Plus Checkbox layout in Sidebar */
        :deep(.sidebar-filters .el-checkbox) {
            display: flex !important;
            margin-right: 0 !important;
            width: 100% !important;
            height: auto !important;
            padding: 8px 0 !important;
        }

        :deep(.sidebar-filters .el-checkbox__label) {
            display: flex !important;
            flex: 1 !important;
            width: 100% !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding-left: 10px !important;
        }

        /* Fixed Tabs Layout */
        .vehicle-detail-tabs {
            display: flex;
            flex-direction: column;
            height: 100%;
        }

        :deep(.vehicle-detail-tabs>.el-tabs__header) {
            flex-shrink: 0;
            margin-bottom: 0 !important;
            background-color: #fff;
            border-bottom: 1px solid #e4e7ed;
        }

        :deep(.vehicle-detail-tabs>.el-tabs__content) {
            flex-grow: 1;
            overflow: hidden;
            padding: 0 !important;
        }

        :deep(.vehicle-detail-tabs .el-tab-pane) {
            height: 100%;
            overflow-y: auto;
        }

        /* Custom Scrollbar */
        .custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        .custom-scroll::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 3px;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #aaa;
        }

        /* Tabs Optimization */
        :deep(.vehicle-detail-tabs .el-tabs__content) {
            padding: 0 !important;
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        :deep(.vehicle-detail-tabs .el-tab-pane) {
            height: 100%;
        }

        :deep(.vehicle-detail-tabs.el-tabs--border-card) {
            border: none;
            box-shadow: none;
        }

        :deep(.vehicle-detail-tabs .el-tabs__header) {
            background-color: #fff;
            border-bottom: 1px solid #e4e7ed;
            padding-left: 16px;
        }
</style>
