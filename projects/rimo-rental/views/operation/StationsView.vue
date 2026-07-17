<template>
<div class="stations-page">
            
            

            
            <main>
                
                <div class="flex justify-between items-end mb-6">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">服务据点管理</h1>
                        <p class="text-gray-500 text-sm mt-1">管理车行、门市及据点，配置各业务模式的服务能力。</p>
                    </div>
                    <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20"
                        @click="openStationDialog(null)">
                        <el-icon class="mr-1">
                            <Plus></Plus>
                        </el-icon> 新增据点
                    </el-button>
                </div>

                
                <div class="flex gap-6 h-[calc(100vh-200px)]">
                    
                    <div class="w-64 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div 
                            class="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex justify-between items-center">
                            <span class="font-bold text-gray-700">组织架构</span>
                            <div class="flex items-center gap-2">
                                <el-button size="small" :type="!currentNode ? 'primary' : 'default'"
                                    @click="setAllScope">全部</el-button>
                                <el-button link type="primary" size="small" @click="openHierarchyDialog">管理层级</el-button>
                            </div>
                        </div>
                        <div class="flex-1 overflow-y-auto p-2">
                            <el-tree ref="orgTreeRef" :data="orgData" :props="defaultProps" node-key="id"
                                default-expand-all highlight-current
                                @node-click="handleNodeClick">
                                <template #default="{ node, data }">
                                    <div class="flex items-center w-full">
                                        <el-icon class="mr-2 text-gray-400">
                                            <component :is="getIconByLevel(data.level)" ></component>
                                        </el-icon>
                                        <span class="flex-1 truncate text-sm"
                                            :class="{'font-bold': data.level === 'company'}">{{ node.label }}</span>
                                    </div>
                                </template>
                            </el-tree>
                        </div>
                    </div>

                    
                    <div 
                        class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        
                        <div class="h-full flex flex-col">
                            <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-3">
                                <div class="flex items-center gap-3 flex-wrap min-w-0">
                                    <div style="width: 240px">
                                        <el-input v-model="searchQuery" placeholder="搜索据点名称/地址..." prefix-icon="Search"
                                            clearable ></el-input>
                                    </div>
                                    <el-select v-model="serviceFilter" multiple collapse-tags collapse-tags-tooltip :max-collapse-tags="2"
                                        placeholder="服务能力" clearable style="width: 260px">
                                        <el-option v-for="item in stationServiceFilterOptions" :key="item.value"
                                            :label="item.label" :value="item.value" ></el-option>
                                    </el-select>
                                    <el-select v-model="serviceStatusFilter" placeholder="服务状态" clearable style="width: 140px">
                                        <el-option v-for="item in serviceStatusFilterOptions" :key="item.value"
                                            :label="item.label" :value="item.value" ></el-option>
                                    </el-select>
                                    <el-select v-model="statusFilter" placeholder="据点状态" clearable style="width: 140px">
                                        <el-option label="启用中" value="ACTIVE"></el-option>
                                        <el-option label="已停用" value="INACTIVE"></el-option>
                                    </el-select>
                                    <div class="flex items-center gap-1">
                                        <el-button type="success" plain @click="openStationImportDialog">
                                            <el-icon class="mr-1">
                                                <Upload></Upload>
                                            </el-icon>导入
                                        </el-button>
                                        <el-button type="primary" plain style="margin-left: 0;" @click="handleStationExport">
                                            <el-icon class="mr-1">
                                                <Download></Download>
                                            </el-icon>导出
                                        </el-button>
                                    </div>
                                    <el-dropdown @command="applyStationBatchStatus" trigger="click">
                                        <el-button type="warning" plain :disabled="selectedStationRows.length === 0">
                                            批量操作
                                            <svg class="ml-1.5 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                                <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ></path>
                                            </svg>
                                        </el-button>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item :command="true" class="text-emerald-600">
                                                    <el-icon>
                                                        <Check></Check>
                                                    </el-icon>批量启用
                                                </el-dropdown-item>
                                                <el-dropdown-item :command="false" class="text-red-500">
                                                    <el-icon>
                                                        <Close></Close>
                                                    </el-icon>批量停用
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                    <span v-if="selectedStationRows.length"
                                        class="text-xs text-blue-600 font-medium whitespace-nowrap bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                        已选 {{ selectedStationRows.length }} 项
                                    </span>
                                </div>
                                <div class="ml-auto text-sm text-gray-500 whitespace-nowrap">共 {{ visibleStations.length }} 个据点</div>
                            </div>

                            <el-table ref="stationTableRef" :data="pagedStations" row-key="id" style="width: 100%"
                                class="flex-1" @selection-change="handleStationSelectionChange">
                                <el-table-column type="selection" :reserve-selection="true" width="52" align="center"></el-table-column>
                                <el-table-column prop="name" label="据点名称" min-width="180">
                                    <template #default="{ row }">
                                        <div class="font-medium text-gray-900">{{ row.name }}</div>
                                        <div class="text-xs text-gray-400 truncate">{{ row.address }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="所属门市" min-width="160">
                                    <template #default="{ row }">
                                        <div class="text-sm text-gray-700">{{ getStoreName(row.parentId) }}</div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="据点类型" width="180">
                                    <template #default="{ row }">
                                        <div class="flex flex-col items-start gap-0.5">
                                            <el-tag size="small" type="info" effect="plain">
                                                {{ row.stationType || '未设置' }}
                                            </el-tag>
                                            <el-tag size="small" :type="getStationTypeEntryTagType(row.stationType)" effect="plain">
                                                {{ getStationTypeEntryText(row.stationType) }}
                                            </el-tag>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="服务能力" min-width="200">
                                    <template #default="{ row }">
                                        <div class="flex flex-col gap-1.5">
                                            <div v-for="g in groupServices(row.services)" :key="g.domain" class="flex flex-wrap gap-1">
                                                <template v-for="seg in g.segments" :key="seg.bizType">
                                                    <el-tag v-if="seg.bizType === 'DIFF_STATION'" size="small"
                                                        :type="seg.suspended ? 'info' : (getAvailableSpots(row) > 0 ? 'success' : 'danger')"
                                                        effect="plain">
                                                        {{ seg.text }}{{ getAvailableSpots(row) > 0 ? `·可还${getAvailableSpots(row)}` : '·已满' }}
                                                    </el-tag>
                                                    <el-tag v-else size="small"
                                                        :type="seg.suspended ? 'info' : 'success'"
                                                        effect="plain">
                                                        {{ seg.text }}
                                                    </el-tag>
                                                </template>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="车位概况" width="220">
                                    <template #default="{ row }">
                                        <div class="flex flex-col gap-1">
                                            <div class="flex justify-between text-xs">
                                                <span class="text-gray-500">总车位 {{ row.totalCapacity }}</span>
                                                <span :class="getAvailableSpots(row) > 0 ? 'text-emerald-600' : 'text-rose-500'">
                                                    {{ getAvailableSpots(row) > 0 ? `剩余空位 ${getAvailableSpots(row)}` : '已无空位' }}
                                                </span>
                                            </div>
                                            <el-progress :percentage="getParkingOccupancyPercentage(row)"
                                                :status="isParkingFull(row) ? 'exception' : ''"
                                                :show-text="false" :stroke-width="6"></el-progress>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="据点状态" width="100">
                                    <template #default="{ row }">
                                        <el-switch v-model="row.isActive" size="small"
                                            style="--el-switch-on-color: #10b981;"></el-switch>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" width="150" align="right" fixed="right">
                                    <template #default="{ row }">
                                        <div class="flex items-center justify-end gap-1">
                                            <el-button type="primary" link @click="openStationDialog(row)">编辑</el-button>
                                            <el-dropdown trigger="click" @command="(cmd) => handleStationRowCommand(cmd, row)">
                                                <el-button link type="info">更多<el-icon class="ml-0.5"><ArrowDown></ArrowDown></el-icon></el-button>
                                                <template #dropdown>
                                                    <el-dropdown-menu>
                                                        <el-dropdown-item command="delete" class="text-red-500">删除</el-dropdown-item>
                                                    </el-dropdown-menu>
                                                </template>
                                            </el-dropdown>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="flex justify-end items-center mt-2">
                                <el-pagination v-model:current-page="stationPage" v-model:page-size="stationPageSize" :page-sizes="[10, 20, 50, 100]" :total="visibleStations.length" layout="total, sizes, prev, pager, next, jumper" background small></el-pagination>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑据点' : '新增据点'" width="1280px" top="3vh" destroy-on-close
            append-to-body>
            <div class="flex gap-6" style="height: 78vh;">
                <div class="w-[56%] flex flex-col gap-4 overflow-y-auto pr-2 custom-scroll">
                    <div>
                        <h3 class="font-bold text-gray-800 border-l-4 border-theme-primary pl-3">基础资料</h3>
                        <p class="text-xs text-gray-500 mt-2">用于配置据点档案、坐标、电子围栏与现场联络资讯。</p>
                    </div>

                    <el-form :model="currentStation" label-position="top">
                        <div class="grid grid-cols-1 gap-4 mb-4">
                            <el-form-item label="据点类型" class="!mb-0">
                                <div class="flex items-center gap-3 w-full">
                                    <el-select v-model="currentStation.stationType" placeholder="请选择据点类型"
                                        class="flex-1">
                                        <el-option v-for="option in stationTypeOptions" :key="option.value"
                                            :label="option.label" :value="option.value">
                                            <div class="flex items-center justify-between gap-3 w-full">
                                                <span>{{ option.label }}</span>
                                                <el-tag size="small" :type="getStationTypeEntryTagType(option)" effect="plain">
                                                    {{ getStationTypeEntryText(option) }}
                                                </el-tag>
                                            </div>
                                        </el-option>
                                    </el-select>
                                    <el-button @click="stationTypeManagerVisible = true">选择项管理</el-button>
                                </div>
                                <div class="mt-1 text-xs text-gray-500">据点类型由选择项管理维护，可控制该类型是否开放一般预约。</div>
                            </el-form-item>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="所属门市" required>
                                <el-cascader v-model="currentStation.parentId" :options="stationParentOptions"
                                    :props="stationParentProps" filterable clearable class="w-full"
                                    placeholder="请先选择车行，再选择门市"></el-cascader>
                            </el-form-item>
                            <el-form-item label="据点名称" required>
                                <el-input v-model="currentStation.name" placeholder="例如：金门水头码头游客服务站"></el-input>
                            </el-form-item>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="停车场类型">
                                <el-select v-model="currentStation.parkingLotType" placeholder="请选择停车场类型"
                                    class="w-full">
                                    <el-option label="露天停车场" value="露天停车场" ></el-option>
                                    <el-option label="室内停车场" value="室内停车场" ></el-option>
                                    <el-option label="立体停车场" value="立体停车场" ></el-option>
                                    <el-option label="路侧停车区" value="路侧停车区" ></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="停车场公司">
                                <el-input v-model="currentStation.parkingCompany" placeholder="请输入停车场公司"></el-input>
                            </el-form-item>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="联络人">
                                <el-input v-model="currentStation.contactName" placeholder="请输入联络人"></el-input>
                            </el-form-item>
                            <el-form-item label="联络电话">
                                <el-input v-model="currentStation.contactPhone" placeholder="请输入联络电话"></el-input>
                            </el-form-item>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="Email">
                                <el-input v-model="currentStation.email" placeholder="例如：station@rimo.com"></el-input>
                            </el-form-item>
                            <el-form-item label="传真">
                                <el-input v-model="currentStation.fax" placeholder="请输入传真"></el-input>
                            </el-form-item>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="地址选择">
                                <el-cascader v-model="currentStation.addressRegion" :options="addressOptions" clearable
                                    filterable class="w-full" placeholder="请选择行政区"></el-cascader>
                                <div class="mt-2 text-xs text-gray-400">原型示意台湾模式；实际按租户地址模式渲染。</div>
                            </el-form-item>
                            <el-form-item label="详细地址">
                                <el-input v-model="currentStation.addressDetail"
                                    placeholder="请输入街道、楼层或停车场位置说明"></el-input>
                            </el-form-item>
                        </div>

                        <div 
                            class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px] gap-4 items-end">
                            <el-form-item label="据点经度" required>
                                <el-input v-model="currentStation.longitude" placeholder="118.318000"></el-input>
                            </el-form-item>
                            <el-form-item label="据点纬度" required>
                                <el-input v-model="currentStation.latitude" placeholder="24.432000"></el-input>
                            </el-form-item>
                            <el-form-item label="主电子围栏半径 (m)" required>
                                <el-input-number v-model="currentStation.fenceRadius" :min="0" :step="10"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label=" ">
                                <el-button class="w-full" @click="openMapPicker('station')">选点</el-button>
                            </el-form-item>
                        </div>
                    </el-form>

                    <div class="rounded-xl border border-gray-200 overflow-hidden bg-white">
                        <div class="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
                            <div>
                                <div class="font-medium text-gray-800">地图坐标同步</div>
                                <p class="text-xs text-gray-500 mt-1">点击地图可写入当前选中的定位对象，也可直接修改下方经纬度。</p>
                            </div>
                            <el-tag type="primary" effect="plain">{{ getCoordinateTargetLabel(activeCoordinateTarget)
                                }}</el-tag>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-3 gap-2 mb-3">
                                <el-button size="small"
                                    :type="activeCoordinateTarget === 'station' ? 'primary' : 'default'"
                                    @click="setActiveCoordinateTarget('station')">据点主坐标</el-button>
                                <el-button v-for="(fence, index) in currentStation.geofences" :key="fence.key"
                                    size="small"
                                    :type="activeCoordinateTarget === ('geofence-' + index) ? 'primary' : 'default'"
                                    @click="setActiveCoordinateTarget('geofence-' + index)">
                                    围栏 {{ index + 1 }}
                                </el-button>
                            </div>

                            <div class="relative h-64 rounded-xl border border-slate-200 overflow-hidden cursor-crosshair"
                                style="background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 40%, #eef7f2 100%);"
                                @click="handleMapClick">
                                <div class="absolute inset-0 opacity-60"
                                    style="background-image: linear-gradient(rgba(148,163,184,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.15) 1px, transparent 1px); background-size: 36px 36px;">
                                </div>
                                <div class="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                                    <div class="text-xs text-slate-500">地图示意区，点击即可定位 {{
                                        getCoordinateTargetLabel(activeCoordinateTarget) }}
                                    </div>
                                    <div 
                                        class="self-end rounded-lg border border-white/80 bg-white/90 px-3 py-2 shadow-sm text-xs text-slate-600">
                                        当前坐标：{{ formatCoordinateDisplay(activeCoordinateTarget) }}
                                    </div>
                                </div>

                                <div v-if="isValidCoordinate(currentStation.longitude, currentStation.latitude)"
                                    class="absolute -translate-x-1/2 -translate-y-1/2"
                                    :style="getMarkerStyle('station')">
                                    <div class="h-4 w-4 rounded-full bg-theme-primary border-2 border-white shadow-lg">
                                    </div>
                                </div>

                                <template v-for="(fence, index) in currentStation.geofences"
                                    :key="'marker-' + fence.key">
                                    <div v-if="fence && fence.enabled && isValidCoordinate(fence.longitude, fence.latitude)"
                                        class="absolute -translate-x-1/2 -translate-y-1/2"
                                        :style="getMarkerStyle('geofence-' + index)">
                                        <div class="h-3.5 w-3.5 rounded-full border-2 border-white shadow-md"
                                            :class="getFenceMarkerClass(index)"></div>
                                    </div>
                                </template>
                            </div>

                            <div class="grid grid-cols-2 gap-3 mt-3">
                                <div class="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                                    主坐标：{{ formatCoordinateDisplay('station') }}
                                </div>
                                <div class="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                                    主围栏半径：{{ currentStation.fenceRadius || 0 }} m
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <div class="font-bold text-gray-800 border-l-4 border-emerald-500 pl-3">电子围栏配置</div>
                            <p class="text-xs text-gray-500 mt-2">默认保留第 1 组，可按需新增至 4 组电子围栏。</p>
                        </div>
                        <el-button :disabled="currentStation.geofences.length >= 4"
                            @click="addGeofence">新增围栏</el-button>
                    </div>
                    <div class="space-y-3">
                        <div v-for="(fence, index) in currentStation.geofences" :key="fence.key"
                            class="rounded-xl border border-gray-200 bg-white p-3">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <div class="font-medium text-gray-800">围栏 {{ index + 1 }}</div>
                                    <el-icon v-if="index > 0" color="#dc2626" style="cursor:pointer;" size="16" @click="removeGeofence(index)"><Delete></Delete></el-icon>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-xs text-gray-500">{{ fence.enabled ? '已启用' : '未启用' }}</span>
                                    <el-switch v-model="fence.enabled" ></el-switch>
                                </div>
                            </div>
                            <div 
                                class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_180px_120px] gap-3 mt-3 items-end">
                                <el-form-item label="经度" required class="!mb-0">
                                    <el-input v-model="fence.longitude" placeholder="118.318000"></el-input>
                                </el-form-item>
                                <el-form-item label="纬度" required class="!mb-0">
                                    <el-input v-model="fence.latitude" placeholder="24.432000"></el-input>
                                </el-form-item>
                                <el-form-item label="半径 (m)" required class="!mb-0">
                                    <el-input-number v-model="fence.radius" :min="0" :step="10"
                                        class="w-full"></el-input-number>
                                </el-form-item>
                                <el-form-item label=" " class="!mb-0">
                                    <el-button class="w-full"
                                        @click="openMapPicker('geofence-' + index)">选点</el-button>
                                </el-form-item>
                            </div>
                        </div>
                    </div>

                    <el-form :model="currentStation" label-position="top">
                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="租赁押金">
                                <el-input-number v-model="currentStation.rentalDeposit" :min="0" :step="100"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="月租成本">
                                <el-input-number v-model="currentStation.monthlyRentCost" :min="0" :step="100"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="水电成本">
                                <el-input-number v-model="currentStation.utilityCost" :min="0" :step="100"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="人事成本">
                                <el-input-number v-model="currentStation.staffingCost" :min="0" :step="100"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                        </div>

                        <el-form-item label="进出方式">
                            <el-select v-model="currentStation.accessMethod" placeholder="请选择进出方式" class="w-full">
                                <el-option label="車牌辨識" value="車牌辨識"></el-option>
                                <el-option label="門禁卡" value="門禁卡"></el-option>
                                <el-option label="遙控器" value="遙控器"></el-option>
                                <el-option label="無門禁" value="無門禁"></el-option>
                            </el-select>
                        </el-form-item>

                        <div class="rounded-xl border border-gray-200 bg-white p-4">
                            <div class="flex items-center justify-between">
                                <div>
                                    <div class="font-medium text-gray-800">固定车位</div>
                                    <div class="text-xs text-gray-500 mt-1">开启后可维护多个固定车位号，供现场长期占用管理。</div>
                                </div>
                                <el-switch v-model="currentStation.isFixedParking" ></el-switch>
                            </div>
                            <div v-if="currentStation.isFixedParking" class="mt-4">
                                <el-input v-model="fixedParkingSlotsInput" type="textarea" :rows="4"
                                    placeholder="请输入多个车位号，支持换行或逗号分隔"></el-input>
                                <div class="flex flex-wrap gap-2 mt-3">
                                    <el-tag v-for="slot in getParsedParkingSlots()" :key="slot" type="info"
                                        effect="plain">
                                        {{ slot }}
                                    </el-tag>
                                </div>
                            </div>
                        </div>

                        <el-form-item label="据点照片" class="mt-4">
                            <el-upload list-type="picture-card" :auto-upload="false" :file-list="currentStation.photos"
                                :on-change="handleStationPhotoChange" :on-remove="removeStationPhoto" multiple>
                                <el-icon>
                                    <Plus></Plus>
                                </el-icon>
                            </el-upload>
                            <div class="text-xs text-gray-400 mt-2">支持多张图片上传预览，仅用于原型展示。</div>
                        </el-form-item>

                        <div class="grid grid-cols-2 gap-4">
                            <el-form-item label="总车位数">
                                <el-input-number v-model="currentStation.totalCapacity" :min="0"
                                    class="w-full"></el-input-number>
                            </el-form-item>
                            <el-form-item label="停车费规则">
                                <el-input v-model="currentStation.parkingFeeRule"
                                    placeholder="例如：前 30 分钟免费，之后每小时 20 元"></el-input>
                            </el-form-item>
                        </div>

                        <el-form-item label="据点说明">
                            <el-input v-model="currentStation.description" type="textarea" :rows="3"
                                placeholder="请输入据点使用说明、游客指引或现场注意事项"></el-input>
                        </el-form-item>

                        <el-form-item label="备注">
                            <el-input v-model="currentStation.remark" type="textarea" :rows="3"
                                placeholder="请输入据点备注"></el-input>
                        </el-form-item>
                    </el-form>
                </div>

                <div class="w-[44%] flex flex-col gap-4 border-l pl-6 overflow-y-auto custom-scroll">
                    <div>
                        <h3 class="font-bold text-gray-800 border-l-4 border-orange-500 pl-3">业务与营运配置</h3>
                        <p class="text-xs text-gray-500 mt-2">按业务线设置据点能力、签约对象、经营成本和现场说明。</p>
                    </div>

                    <div class="rounded-xl border border-gray-100 bg-gray-50 p-4"
                        :class="{'border-sky-200 bg-sky-50': getServiceGroupConfig('SHARING').enabled}">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="font-semibold text-gray-800">分时租赁</div>
                                <p class="text-xs text-gray-500 mt-1">统一配置分时租赁的服务时间，再按需启用同站租还与甲租乙还两种模式。</p>
                            </div>
                            <div class="flex items-center gap-3 shrink-0">
                                <span class="text-xs text-gray-500">{{ getServiceGroupConfig('SHARING').enabled ? '已启用' : '未启用' }}</span>
                                <el-switch v-model="getServiceGroupConfig('SHARING').enabled"
                                    @change="toggleServiceGroup('SHARING')" ></el-switch>
                            </div>
                        </div>
                        <div v-if="getServiceGroupConfig('SHARING').enabled" class="space-y-3 mt-4">
                            <div class="rounded-lg border border-white/80 bg-white/80 p-4">
                                <div class="text-sm font-medium text-gray-800">服务公共配置</div>
                                <div class="grid grid-cols-1 gap-3 mt-3">
                                    <el-form-item label="服务时间" class="!mb-0">
                                        <el-time-picker is-range v-model="getServiceGroupConfig('SHARING').serviceHours"
                                            class="w-full" range-separator="至" start-placeholder="开始时间"
                                            end-placeholder="结束时间" ></el-time-picker>
                                    </el-form-item>
                                </div>
                            </div>
                            <div class="rounded-lg border border-white/80 bg-white/80 p-4">
                                <div class="text-sm font-medium text-gray-800">子模式配置</div>
                                <div class="space-y-3 mt-3">
                                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-3">
                                        <div>
                                            <div class="min-w-0">
                                                <el-checkbox v-model="serviceChecks.SAME_STATION"
                                                    @change="toggleService('SAME_STATION')">
                                                    <span class="font-medium text-gray-800">同站租还</span>
                                                </el-checkbox>
                                            </div>
                                            <el-form-item v-if="hasService('SAME_STATION')" label="预留车位数"
                                                class="!mb-0 mt-3 pl-6 w-full">
                                                <el-input-number v-model="getServiceConfig('SAME_STATION').reservedSpots"
                                                    :min="0" :max="currentStation.totalCapacity"
                                                    class="w-full"></el-input-number>
                                            </el-form-item>
                                            <el-form-item v-if="hasService('SAME_STATION')" label="服务状态"
                                                class="!mb-0 mt-3 pl-6 w-full">
                                                <el-select v-model="getServiceConfig('SAME_STATION').status"
                                                    class="w-full">
                                                    <el-option v-for="item in serviceStatusOptions" :key="item.value"
                                                        :label="item.label" :value="item.value" ></el-option>
                                                </el-select>
                                            </el-form-item>
                                        </div>
                                    </div>
                                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-3">
                                        <div>
                                            <div class="min-w-0">
                                                <el-checkbox v-model="serviceChecks.DIFF_STATION"
                                                    @change="toggleService('DIFF_STATION')">
                                                    <span class="font-medium text-gray-800">甲租乙还</span>
                                                </el-checkbox>
                                            </div>
                                            <el-form-item v-if="hasService('DIFF_STATION')" label="预留车位数"
                                                class="!mb-0 mt-3 pl-6 w-full">
                                                <el-input-number v-model="getServiceConfig('DIFF_STATION').reservedSpots"
                                                    :min="0" :max="currentStation.totalCapacity"
                                                    class="w-full"></el-input-number>
                                            </el-form-item>
                                            <div v-if="hasService('DIFF_STATION')" class="mt-3 pl-6 space-y-3">
                                                <el-form-item label="服务状态" class="!mb-0 w-full">
                                                    <el-select v-model="getServiceConfig('DIFF_STATION').status"
                                                        class="w-full">
                                                        <el-option v-for="item in serviceStatusOptions" :key="item.value"
                                                            :label="item.label" :value="item.value" ></el-option>
                                                    </el-select>
                                                </el-form-item>
                                                <p class="text-xs text-gray-500 mt-1">甲租乙还默认支持取车与还车。</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-gray-100 bg-gray-50 p-4"
                        :class="{'border-orange-200 bg-orange-50': getServiceGroupConfig('STORE').enabled}">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="font-semibold text-gray-800">门市租赁</div>
                                <p class="text-xs text-gray-500 mt-1">统一配置门市租赁的服务时间，再分别启用门市租车与 24 小时自助两种子模式。</p>
                                <p class="text-xs text-orange-600 mt-1">门市租赁下，门市租车面向门市办理，24 小时自助面向具体据点取还。</p>
                            </div>
                            <div class="flex items-center gap-3 shrink-0">
                                <span class="text-xs text-gray-500">{{ getServiceGroupConfig('STORE').enabled ? '已启用' : '未启用' }}</span>
                                <el-switch v-model="getServiceGroupConfig('STORE').enabled"
                                    @change="toggleServiceGroup('STORE')" ></el-switch>
                            </div>
                        </div>
                        <div v-if="getServiceGroupConfig('STORE').enabled" class="space-y-3 mt-4">
                            <div class="rounded-lg border border-white/80 bg-white/80 p-4">
                                <div class="text-sm font-medium text-gray-800">服务公共配置</div>
                                <div class="grid grid-cols-1 gap-3 mt-3">
                                    <el-form-item label="服务时间" class="!mb-0">
                                        <el-time-picker is-range v-model="getServiceGroupConfig('STORE').serviceHours"
                                            class="w-full" range-separator="至" start-placeholder="开始时间"
                                            end-placeholder="结束时间" ></el-time-picker>
                                    </el-form-item>
                                </div>
                            </div>
                            <div class="rounded-lg border border-white/80 bg-white/80 p-4">
                                <div class="text-sm font-medium text-gray-800">子模式配置</div>
                                <div class="space-y-3 mt-3">
                                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-3">
                                        <div>
                                            <div class="min-w-0">
                                                <el-checkbox v-model="serviceChecks.STORE_RENTAL"
                                                    @change="toggleService('STORE_RENTAL')">
                                                    <span class="font-medium text-gray-800">门市租车</span>
                                                </el-checkbox>
                                            </div>
                                            <div v-if="hasService('STORE_RENTAL')" class="mt-3 pl-6 space-y-3">
                                                <el-form-item label="服务状态" class="!mb-0 w-full">
                                                    <el-select v-model="getServiceConfig('STORE_RENTAL').status"
                                                        class="w-full">
                                                        <el-option v-for="item in serviceStatusOptions" :key="item.value"
                                                            :label="item.label" :value="item.value" ></el-option>
                                                    </el-select>
                                                </el-form-item>
                                                <el-form-item label="柜台服务时间" class="!mb-0 w-full">
                                                    <el-time-picker is-range
                                                        v-model="getServiceConfig('STORE_RENTAL').config.counterServiceHours"
                                                        class="w-full" range-separator="至"
                                                        start-placeholder="开始时间" end-placeholder="结束时间" ></el-time-picker>
                                                </el-form-item>
                                                <div class="grid grid-cols-1 gap-3">
                                                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center justify-between">
                                                        <span class="text-sm text-gray-700">是否人工交车</span>
                                                        <el-switch v-model="getServiceConfig('STORE_RENTAL').config.manualHandover" ></el-switch>
                                                    </div>
                                                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center justify-between">
                                                        <span class="text-sm text-gray-700">是否人工验车</span>
                                                        <el-switch v-model="getServiceConfig('STORE_RENTAL').config.manualInspection" ></el-switch>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="rounded-lg border border-gray-200 bg-white px-3 py-3">
                                        <div>
                                            <div class="min-w-0">
                                                <el-checkbox v-model="serviceChecks.STORE_SELF_SERVICE"
                                                    @change="toggleService('STORE_SELF_SERVICE')">
                                                    <span class="font-medium text-gray-800">24小时自助</span>
                                                </el-checkbox>
                                            </div>
                                            <div v-if="hasService('STORE_SELF_SERVICE')" class="mt-3 pl-6 space-y-3">
                                                <el-form-item label="服务状态" class="!mb-0 w-full">
                                                    <el-select v-model="getServiceConfig('STORE_SELF_SERVICE').status"
                                                        class="w-full">
                                                        <el-option v-for="item in serviceStatusOptions" :key="item.value"
                                                            :label="item.label" :value="item.value" ></el-option>
                                                    </el-select>
                                                </el-form-item>
                                                <div class="rounded-lg border border-gray-200 bg-white px-3 py-2 flex items-center justify-between">
                                                    <span class="text-sm text-gray-700">夜间还车是否允许</span>
                                                    <el-switch v-model="getServiceConfig('STORE_SELF_SERVICE').config.allowNightReturn" ></el-switch>
                                                </div>
                                                <el-form-item label="自助取还方式" class="!mb-0 w-full">
                                                    <el-select v-model="getServiceConfig('STORE_SELF_SERVICE').config.pickupMethod"
                                                        placeholder="请选择自助取还方式" class="w-full">
                                                        <el-option v-for="item in selfServicePickupMethodOptions" :key="item.value"
                                                            :label="item.label" :value="item.value" ></el-option>
                                                    </el-select>
                                                </el-form-item>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rounded-xl border border-gray-100 bg-gray-50 p-4"
                        :class="{'border-violet-200 bg-violet-50': getServiceGroupConfig('GOV').enabled}">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <div class="font-semibold text-gray-800">公务用车</div>
                                <p class="text-xs text-gray-500 mt-1">面向签约企业客户的专属服务，可配置服务时间并绑定对应企业客户。</p>
                            </div>
                            <div class="flex items-center gap-3 shrink-0">
                                <span class="text-xs text-gray-500">{{ getServiceGroupConfig('GOV').enabled ? '已启用' : '未启用' }}</span>
                                <el-switch v-model="getServiceGroupConfig('GOV').enabled"
                                    @change="toggleServiceGroup('GOV')" ></el-switch>
                            </div>
                        </div>
                        <div v-if="getServiceGroupConfig('GOV').enabled" class="space-y-3 mt-4">
                            <div class="rounded-lg border border-white/80 bg-white/80 p-4">
                                <div class="text-sm font-medium text-gray-800">服务公共配置</div>
                                <div class="grid grid-cols-1 gap-3 mt-3">
                                    <el-form-item label="服务时间" class="!mb-0">
                                        <el-time-picker is-range v-model="getServiceGroupConfig('GOV').serviceHours"
                                            class="w-full" range-separator="至" start-placeholder="开始时间"
                                            end-placeholder="结束时间" ></el-time-picker>
                                    </el-form-item>
                                </div>
                            </div>
                            <div class="rounded-lg border border-white/80 bg-white/80 p-4">
                                <div class="text-sm font-medium text-gray-800">业务专属配置</div>
                                <el-form-item label="服务状态" class="!mb-0 mt-3">
                                    <el-select v-model="getServiceConfig('GOV').status" class="w-full">
                                        <el-option v-for="item in serviceStatusOptions" :key="item.value"
                                            :label="item.label" :value="item.value" ></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="签约企业客户" class="!mb-0 mt-3">
                                    <el-select v-model="govCorporateIds" multiple collapse-tags
                                        collapse-tags-tooltip placeholder="请选择签约企业客户" class="w-full">
                                        <el-option v-for="item in corporateOptions" :key="item.value" :label="item.label"
                                            :value="item.value" ></el-option>
                                    </el-select>
                                </el-form-item>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="flex items-center justify-between">
                    <div class="text-sm">
                        <span class="text-gray-500">已占用预留车位：</span>
                        <span 
                            :class="totalReservedSpots > currentStation.totalCapacity ? 'text-red-500 font-bold' : 'text-green-600 font-bold'">
                            {{ totalReservedSpots }} / {{ currentStation.totalCapacity }}
                        </span>
                        <span v-if="totalReservedSpots > currentStation.totalCapacity"
                            class="text-red-500 ml-2 text-xs">
                            预留车位数已超过据点总车位数
                        </span>
                    </div>
                    <div>
                        <el-button @click="dialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="saveStation">保存</el-button>
                    </div>
                </div>
            </template>
        </el-dialog>

        <el-dialog v-model="stationTypeManagerVisible" title="据点类型管理" width="760px" append-to-body destroy-on-close>
            <div class="mb-4 flex gap-2">
                <el-input v-model="newStationTypeInput" placeholder="请输入新的据点类型名称" @keyup.enter="addStationTypeOption"></el-input>
                <el-button type="primary" @click="addStationTypeOption">
                    <el-icon class="mr-1"><Plus></Plus></el-icon>新增
                </el-button>
            </div>
            <el-table :data="stationTypeOptions" border style="width: 100%" max-height="360">
                <el-table-column label="序号" width="60" align="center" type="index"></el-table-column>
                <el-table-column label="据点类型名称" min-width="200">
                    <template #default="{ row }">
                        <el-input v-model="row.label" size="small" @input="row.value = row.label"></el-input>
                    </template>
                </el-table-column>
                <el-table-column label="一般预约开放" width="150" align="center">
                    <template #default="{ row }">
                        <el-switch v-model="row.normalEntryVisible"></el-switch>
                        <div class="mt-1 text-xs" :class="row.normalEntryVisible === false ? 'text-amber-600' : 'text-emerald-600'">
                            {{ getStationTypeEntryText(row) }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="80" align="center">
                    <template #default="{ $index }">
                        <el-button type="danger" link size="small" @click="removeStationTypeOption($index)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="mt-3 text-xs text-gray-400">关闭后，该类型据点不会出现在一般同站租还 / 甲租乙还预约入口；仍可被租車券批次等指定业务选择。</div>
            <template #footer>
                <el-button @click="stationTypeManagerVisible = false">关闭</el-button>
            </template>
        </el-dialog>
        <el-dialog v-model="hierarchyDialogVisible" title="管理组织架构" width="1280px" top="3vh" destroy-on-close append-to-body>
            <div class="flex items-center justify-between mb-3 text-sm text-gray-600">
                <span>共 <b class="text-gray-800">{{ orgData.length }}</b> 个车行 · <b class="text-gray-800">{{ orgData.reduce((s, c) => s + (c.children ? c.children.length : 0), 0) }}</b> 个门店</span>
                <span v-if="hierarchyCurrentCompany" class="text-gray-500">当前车行：{{ hierarchyCurrentCompany.label }}（{{ hierarchyCurrentCompany.children?.length || 0 }} 个门店）</span>
            </div>
            <div class="flex border rounded border-gray-200" style="height: 78vh;">
                
                <div class="w-1/2 border-r border-gray-200 flex flex-col">
                    <div class="p-3 bg-gray-50 font-bold text-gray-700 flex justify-between items-center border-b">
                        <span>车行列表 (Company) · {{ orgData.length }}</span>
                        <el-button type="primary" size="small" link @click="addCompany">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon>新增
                        </el-button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2">
                        <div v-for="comp in orgData" :key="comp.id"
                            class="flex justify-between items-start p-3 hover:bg-gray-50 cursor-pointer rounded border border-transparent"
                            :class="{'bg-blue-50': hierarchyCurrentCompany?.id === comp.id}"
                            @click="hierarchyCurrentCompany = comp">
                            <div class="flex-1 min-w-0 pr-3">
                                <div class="flex items-center text-sm font-medium text-gray-800">
                                    <el-icon class="mr-2 text-gray-500">
                                        <OfficeBuilding></OfficeBuilding>
                                    </el-icon>
                                    <span class="truncate">{{ comp.label }}</span>
                                    <el-tag v-if="comp.providerType" size="small" type="info" effect="plain"
                                        class="ml-2">
                                        {{ comp.providerType }}
                                    </el-tag>
                                </div>
                                <div class="mt-2 text-xs text-gray-500 space-y-1">
                                    <div>联络人：{{ comp.contactName || '未填写' }}</div>
                                    <div>联络电话：{{ comp.contactPhone || '未填写' }}</div>
                                    <div>统一编号：{{ comp.taxId || '未填写' }}</div>
                                </div>
                            </div>
                            <div class="flex gap-2 shrink-0">
                                <el-button link type="primary" size="small"
                                    @click.stop="openCompanyDialog(comp)">编辑</el-button>
                                <el-button link type="danger" size="small"
                                    @click.stop="deleteCompany(comp)">删除</el-button>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="w-1/2 flex flex-col bg-gray-50">
                    <div class="p-3 bg-gray-100 font-bold text-gray-700 flex justify-between items-center border-b">
                        <span>门店列表 (Store) · {{ hierarchyCurrentCompany?.children?.length || 0 }}</span>
                        <el-button type="primary" size="small" link @click="addStore"
                            :disabled="!hierarchyCurrentCompany">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon>新增
                        </el-button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-2" v-if="hierarchyCurrentCompany">
                        <div v-for="store in hierarchyCurrentCompany.children" :key="store.id"
                            class="flex justify-between items-start p-3 hover:bg-white cursor-pointer rounded mb-1 bg-white border border-gray-100">
                            <div class="flex-1 min-w-0 pr-3">
                                <div class="flex items-center text-sm font-medium text-gray-800">
                                    <el-icon class="mr-2 text-gray-500">
                                        <Shop></Shop>
                                    </el-icon>
                                    <span class="truncate">{{ store.label }}</span>
                                </div>
                                <div class="mt-2 text-xs text-gray-500 space-y-1">
                                    <div>联络人：{{ store.contactName || '未填写' }}</div>
                                    <div>联络电话：{{ store.contactPhone || '未填写' }}</div>
                                    <div>Email：{{ store.email || '未填写' }}</div>
                                </div>
                            </div>
                            <div class="flex gap-2 shrink-0">
                                <el-button link type="primary" size="small"
                                    @click.stop="openStoreDialog(store)">编辑</el-button>
                                <el-button link type="danger" size="small"
                                    @click.stop="deleteStore(store)">删除</el-button>
                            </div>
                        </div>
                        <div v-if="!hierarchyCurrentCompany.children || hierarchyCurrentCompany.children.length === 0"
                            class="text-center text-gray-400 mt-10 text-xs">
                            暂无门店，请新增
                        </div>
                    </div>
                    <div class="flex-1 flex items-center justify-center text-gray-400 text-sm" v-else>
                        <p>请先选择左侧车行</p>
                    </div>
                </div>
            </div>
            <template #footer>
                <el-button @click="hierarchyDialogVisible = false">关闭</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="companyDialogVisible" :title="isCompanyEdit ? '编辑车行' : '新增车行'" width="620px"
            destroy-on-close>
            <el-form :model="companyForm" label-position="top">
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="车行名称" required>
                        <el-input v-model="companyForm.label" placeholder="请输入车行名称"></el-input>
                    </el-form-item>
                    <el-form-item label="类型">
                        <el-select v-model="companyForm.providerType" placeholder="请选择类型" class="w-full">
                            <el-option label="直营" value="直营"></el-option>
                            <el-option label="加盟" value="加盟"></el-option>
                            <el-option label="车厂" value="车厂"></el-option>
                            <el-option label="旅馆" value="旅馆"></el-option>
                        </el-select>
                    </el-form-item>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="联络人">
                        <el-input v-model="companyForm.contactName" placeholder="请输入联络人"></el-input>
                    </el-form-item>
                    <el-form-item label="联络电话">
                        <el-input v-model="companyForm.contactPhone" placeholder="请输入联络电话"></el-input>
                    </el-form-item>
                </div>
                <el-form-item label="统一编号">
                    <el-input v-model="companyForm.taxId" placeholder="请输入统一编号"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="companyForm.remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="companyDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveCompany">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="storeDialogVisible" :title="isStoreEdit ? '编辑门市' : '新增门市'" width="680px" destroy-on-close>
            <el-form :model="storeForm" label-position="top">
                <el-form-item label="门市名称" required>
                    <el-input v-model="storeForm.label" placeholder="请输入门市名称"></el-input>
                </el-form-item>
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="联络人">
                        <el-input v-model="storeForm.contactName" placeholder="请输入联络人"></el-input>
                    </el-form-item>
                    <el-form-item label="联络电话">
                        <el-input v-model="storeForm.contactPhone" placeholder="请输入联络电话"></el-input>
                    </el-form-item>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="Email">
                        <el-input v-model="storeForm.email" placeholder="请输入 Email"></el-input>
                    </el-form-item>
                    <el-form-item label="地址选择">
                        <el-cascader v-model="storeForm.addressRegion" :options="addressOptions"
                            :props="{ checkStrictly: false }" clearable class="w-full"
                            placeholder="请选择区域"></el-cascader>
                        <div class="mt-2 text-xs text-gray-400">原型示意台湾模式；实际按租户地址模式渲染。</div>
                    </el-form-item>
                </div>
                <el-form-item label="详细地址">
                    <el-input v-model="storeForm.addressDetail" placeholder="请输入详细地址"></el-input>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="storeForm.remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="storeDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveStore">保存</el-button>
            </template>
        </el-dialog>

        <el-dialog v-if="false" v-model="stationImportDialogVisible" title="站点导入" width="620px" destroy-on-close>
            <div class="space-y-4">
                <div class="rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-600">
                    当前导入范围：{{ getNodeScopeLabel(currentNode) }}
                </div>
                <el-form :model="stationImportForm" label-position="top">
                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="导入模式">
                            <el-select v-model="stationImportForm.mode" class="w-full">
                                <el-option label="新增站点" value="append"></el-option>
                                <el-option label="更新同名站点" value="merge"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="模板类型">
                            <el-select v-model="stationImportForm.templateType" class="w-full">
                                <el-option label="站点基础模板" value="station_basic"></el-option>
                                <el-option label="站点服务模板" value="station_service"></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <el-form-item label="导入文件">
                        <el-upload class="w-full" drag :auto-upload="false" :limit="1"
                            :file-list="stationImportFileList" accept=".xlsx,.xls,.csv"
                            :on-change="handleStationImportFileChange" :on-remove="handleStationImportFileRemove">
                            <el-icon class="el-icon--upload">
                                <UploadFilled></UploadFilled>
                            </el-icon>
                            <div class="el-upload__text">拖拽文件到此处，或 <em>点击选择文件</em></div>
                            <template #tip>
                                <div class="text-xs text-gray-400">支持 Excel / CSV，仅作原型导入演示。</div>
                            </template>
                        </el-upload>
                    </el-form-item>
                    <el-form-item label="导入说明" class="!mb-0">
                        <div class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-500 leading-6">
                            导入时将按当前所选范围写入站点数据；若选择“更新同名站点”，将按站点名称进行模拟覆盖。
                        </div>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="stationImportDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleStationImport">开始导入</el-button>
            </template>
        </el-dialog>

        <el-dialog v-if="false" v-model="stationExportDialogVisible" title="站点导出" width="620px" destroy-on-close>
            <div class="space-y-4">
                <div class="rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-slate-600">
                    当前可导出 {{ getStationList(currentNode).length }} 个站点，范围：{{ getNodeScopeLabel(currentNode) }}
                </div>
                <el-form :model="stationExportForm" label-position="top">
                    <div class="grid grid-cols-2 gap-4">
                        <el-form-item label="导出范围">
                            <el-select v-model="stationExportForm.scope" class="w-full">
                                <el-option label="当前筛选结果" value="filtered"></el-option>
                                <el-option label="当前节点全部站点" value="all"></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="导出格式">
                            <el-select v-model="stationExportForm.format" class="w-full">
                                <el-option label="Excel (.xlsx)" value="xlsx"></el-option>
                                <el-option label="CSV (.csv)" value="csv"></el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <el-form-item label="导出内容">
                        <el-checkbox-group v-model="stationExportForm.fields" class="grid grid-cols-2 gap-y-2">
                            <el-checkbox label="basic">基础资料</el-checkbox>
                            <el-checkbox label="service">服务能力</el-checkbox>
                            <el-checkbox label="capacity">车位概况</el-checkbox>
                            <el-checkbox label="status">状态信息</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="导出说明" class="!mb-0">
                        <div class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-500 leading-6">
                            导出会沿用当前查询条件；若选择“当前节点全部站点”，则忽略顶部服务能力、服务状态与据点状态筛选，仅导出当前车行或门市下全部站点。
                        </div>
                    </el-form-item>
                </el-form>
            </div>
            <template #footer>
                <el-button @click="stationExportDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleStationExport">确认导出</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="stationImportDialogVisible" title="导入据点数据" width="480px" destroy-on-close>
            <div class="mb-4 text-gray-600 text-sm">
                <p class="mb-2">1. 请先下载导入模板，按标准模板格式填写数据。</p>
                <el-button type="primary" plain size="small" @click="downloadStationTemplate">
                    <el-icon class="mr-1"><Download></Download></el-icon> 下载规范表模板
                </el-button>
            </div>
            <div class="border-t border-gray-100 pt-4 mt-4">
                <p class="mb-2 text-gray-600 text-sm">2. 上传填写好的数据表格（支持 .xls, .xlsx 格式，单次最大支持 1000 条）。</p>
                <el-upload class="upload-demo" drag action="#" :auto-upload="false"
                    :file-list="stationImportFile ? [stationImportFile] : []" :on-change="handleStationFileChange"
                    accept=".xls,.xlsx">
                    <el-icon class="el-icon--upload"><UploadFilled></UploadFilled></el-icon>
                    <div class="el-upload__text">
                        将文件拖拽至此处，或 <em>点击上传</em>
                    </div>
                </el-upload>
            </div>
            <template #footer>
                <el-button @click="stationImportDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleStationImport">开始导入</el-button>
            </template>
        </el-dialog>

        <el-dialog v-model="mapPickerVisible" title="地图选点" width="860px" append-to-body destroy-on-close>
            <div class="relative h-[460px] rounded-xl border border-slate-200 overflow-hidden cursor-crosshair"
                style="background: linear-gradient(135deg, #eef6ff 0%, #f8fbff 40%, #eef7f2 100%);"
                @click="handleMapClick">
                <div class="absolute inset-0 opacity-60"
                    style="background-image: linear-gradient(rgba(148,163,184,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.15) 1px, transparent 1px); background-size: 36px 36px;">
                </div>
                <div class="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                    <div class="text-xs text-slate-500">点击地图选择 {{ getCoordinateTargetLabel(mapPickerTarget) }} 坐标</div>
                    <div 
                        class="self-end rounded-lg border border-white/80 bg-white/90 px-3 py-2 shadow-sm text-xs text-slate-600">
                        当前坐标：{{ formatCoordinateDisplay(mapPickerTarget) }}
                    </div>
                </div>
                <div class="absolute -translate-x-1/2 -translate-y-1/2"
                    :style="getMarkerStyle(mapPickerTarget)">
                    <div class="h-4 w-4 rounded-full bg-theme-primary border-2 border-white shadow-lg"></div>
                </div>
            </div>
            <template #footer>
                <el-button @click="mapPickerVisible = false">取消</el-button>
                <el-button type="primary" @click="mapPickerVisible = false">确认选点</el-button>
            </template>
        </el-dialog>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

export default {
            setup() {
                // --- Mock Data ---
                const orgData = ref([
                    {
                        id: 'C1',
                        label: '台北 RIMO 直营营运中心',
                        level: 'company',
                        contactName: '王雅婷',
                        contactPhone: '02-2718-5200',
                        taxId: '24581267',
                        providerType: '直营',
                        remark: '北台湾直营站点',
                        children: [
                            {
                                id: 'S1',
                                label: '松山机场门市',
                                level: 'store',
                                contactName: '林冠宇',
                                contactPhone: '02-2718-5201',
                                email: 'songshan@rimo.tw',
                                addressRegion: ['台北市', '台北市', '松山区'],
                                addressDetail: '敦化北路 340-9 号旁停车区',
                                remark: '商务旅客快取门市',
                                children: []
                            },
                            {
                                id: 'S2',
                                label: '左营高铁门市',
                                level: 'store',
                                contactName: '陈怡君',
                                contactPhone: '07-350-6201',
                                email: 'zuoying@rimo.tw',
                                addressRegion: ['高雄市', '高雄市', '左营区'],
                                addressDetail: '高铁路 105 号 P1 停车区',
                                remark: '高铁转乘重点门市',
                                children: []
                            }
                        ]
                    },
                    {
                        id: 'C2',
                        label: '金门观光合作伙伴',
                        level: 'company',
                        contactName: '吴志豪',
                        contactPhone: '082-326-000',
                        taxId: '53017842',
                        providerType: '加盟',
                        remark: '金门旅游接驳合作站点',
                        children: [
                            {
                                id: 'S3',
                                label: '水头码头门市',
                                level: 'store',
                                contactName: '陈佩蓉',
                                contactPhone: '082-326-001',
                                email: 'shuitou@rimo.tw',
                                addressRegion: ['金门县', '金城镇', '西门里'],
                                addressDetail: '西海路一段水头港区游客服务中心旁',
                                remark: '游客取还车门市',
                                children: []
                            }
                        ]
                    },
                    {
                        id: 'C3',
                        label: '桃园机场直营营运中心',
                        level: 'company',
                        contactName: '刘建宏',
                        contactPhone: '03-399-8800',
                        taxId: '28914563',
                        providerType: '直营',
                        remark: '国际机场大型直营据点',
                        children: [
                            {
                                id: 'S4',
                                label: '桃园机场第一航厦门市',
                                level: 'store',
                                contactName: '郑宜芳',
                                contactPhone: '03-399-8801',
                                email: 'taoyuan-t1@rimo.tw',
                                addressRegion: ['桃园市', '大园区', '航翔路'],
                                addressDetail: '第一航厦一楼入境大厅 B 区',
                                remark: '入境旅客主柜台',
                                children: []
                            },
                            {
                                id: 'S5',
                                label: '桃园机场第二航厦门市',
                                level: 'store',
                                contactName: '许耀文',
                                contactPhone: '03-399-8802',
                                email: 'taoyuan-t2@rimo.tw',
                                addressRegion: ['桃园市', '大园区', '航翔路'],
                                addressDetail: '第二航厦一楼入境大厅 C 区',
                                remark: '入境旅客备用柜台',
                                children: []
                            },
                            {
                                id: 'S6',
                                label: '中坜服务区门市',
                                level: 'store',
                                contactName: '潘佳颖',
                                contactPhone: '03-452-3300',
                                email: 'jhongli@rimo.tw',
                                addressRegion: ['桃园市', '中坜区', '民族路'],
                                addressDetail: '民族路二段 88 号服务区',
                                remark: '国道转乘服务据点',
                                children: []
                            }
                        ]
                    },
                    {
                        id: 'C4',
                        label: '台中都会合作伙伴',
                        level: 'company',
                        contactName: '张淑芬',
                        contactPhone: '04-3701-6600',
                        taxId: '54712039',
                        providerType: '加盟',
                        remark: '中台湾都会区合作站点',
                        children: [
                            {
                                id: 'S7',
                                label: '台中高铁门市',
                                level: 'store',
                                contactName: '赖俊豪',
                                contactPhone: '04-3701-6601',
                                email: 'taichung-hsr@rimo.tw',
                                addressRegion: ['台中市', '乌日区', '高铁东路'],
                                addressDetail: '高铁台中站一楼东侧出口',
                                remark: '高铁转乘主力门市',
                                children: []
                            },
                            {
                                id: 'S8',
                                label: '朝马转运站门市',
                                level: 'store',
                                contactName: '郭姿婷',
                                contactPhone: '04-2316-7700',
                                email: 'chaoma@rimo.tw',
                                addressRegion: ['台中市', '西屯区', '朝马路'],
                                addressDetail: '朝马路二段 56 号转运站旁',
                                remark: '国道客运接驳门市',
                                children: []
                            }
                        ]
                    },
                    {
                        id: 'C5',
                        label: '高雄港观光合作伙伴',
                        level: 'company',
                        contactName: '黄俊豪',
                        contactPhone: '07-521-4400',
                        taxId: '59304781',
                        providerType: '加盟',
                        remark: '高雄港观光接驳合作站点',
                        children: [
                            {
                                id: 'S9',
                                label: '高雄港旅运中心门市',
                                level: 'store',
                                contactName: '吴佩玲',
                                contactPhone: '07-521-4401',
                                email: 'kaohsiung-port@rimo.tw',
                                addressRegion: ['高雄市', '苓雅区', '海边的路'],
                                addressDetail: '海边的路 18 号旅运中心一楼',
                                remark: '邮轮旅客接驳门市',
                                children: []
                            },
                            {
                                id: 'S10',
                                label: '左营海军站门市',
                                level: 'store',
                                contactName: '徐子轩',
                                contactPhone: '07-581-2200',
                                email: 'zuoying-navy@rimo.tw',
                                addressRegion: ['高雄市', '左营区', '海军路'],
                                addressDetail: '海军路 88 号眷村改建商场旁',
                                remark: '军港周边商务门市',
                                children: []
                            }
                        ]
                    },
                ]);

                const allStations = ref([
                    {
                        id: 1,
                        parentId: 'S1',
                        name: '台北松山机场快取站',
                        stationType: '机场快取站',
                        parkingLotType: '室内停车场',
                        parkingCompany: '松山机场停车管理中心',
                        contactName: '林冠宇',
                        contactPhone: '02-2718-5211',
                        email: 'songshan-station@rimo.tw',
                        fax: '02-2718-5299',
                        addressRegion: ['台北市', '台北市', '松山区'],
                        addressDetail: '敦化北路 340-9 号旁 P1 停车区',
                        address: '台北市 台北市 松山区 敦化北路 340-9 号旁 P1 停车区',
                        longitude: 121.5512,
                        latitude: 25.0694,
                        fenceRadius: 60,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 121.5513, latitude: 25.0695, radius: 60 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)],
                        rentalDeposit: 5000,
                        monthlyRentCost: 72000,
                        utilityCost: 6800,
                        staffingCost: 52000,
                        accessMethod: '車牌辨識',
                        isFixedParking: true,
                        fixedParkingSlots: ['A-018', 'A-019', 'A-020'],
                        photos: [],
                        totalCapacity: 20,
                        parkedCount: 12,
                        parkingFeeRule: '前 30 分钟免费，之后每小时 NT$60',
                        description: '主要服务松山机场商务旅客与短租旅客，可快速取还车。',
                        remark: '连续假期建议提前扩充排班',
                        isActive: true,
                        serviceGroups: {
                            SHARING: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)]
                            },
                            STORE: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 22, 0)]
                            },
                            GOV: {
                                enabled: false,
                                serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
                            }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 8, config: {} },
                            {
                                bizType: 'DIFF_STATION',
                                status: 'ACTIVE',
                                reservedSpots: 4,
                                config: { pickupEnabled: true, returnEnabled: true }
                            },
                            {
                                bizType: 'STORE_SELF_SERVICE',
                                status: 'SUSPENDED',
                                reservedSpots: 0,
                                config: { allowNightReturn: true, pickupMethod: 'APP_SCAN' }
                            }
                        ]
                    },
                    {
                        id: 2,
                        parentId: 'S2',
                        name: '高雄左营高铁企业服务站',
                        stationType: '高铁转乘站',
                        parkingLotType: '室内停车场',
                        parkingCompany: '高铁左营站停车中心',
                        contactName: '陈怡君',
                        contactPhone: '07-350-6211',
                        email: 'zuoying-station@rimo.tw',
                        fax: '07-350-6299',
                        addressRegion: ['高雄市', '高雄市', '左营区'],
                        addressDetail: '高铁路 105 号 P1 停车区',
                        address: '高雄市 高雄市 左营区 高铁路 105 号 P1 停车区',
                        longitude: 120.3075,
                        latitude: 22.6872,
                        fenceRadius: 80,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 120.3077, latitude: 22.6873, radius: 80 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 5, 30), new Date(2000, 0, 1, 23, 30)],
                        rentalDeposit: 8000,
                        monthlyRentCost: 54000,
                        utilityCost: 5200,
                        staffingCost: 36000,
                        accessMethod: '門禁卡',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 30,
                        parkedCount: 24,
                        parkingFeeRule: '高铁转乘 1 小时内免费，超时每小时 NT$40',
                        description: '服务高铁转乘旅客与签约企业客户，适合长短租混合取还。',
                        remark: '企业客户优先服务窗口',
                        isActive: true,
                        serviceGroups: {
                            SHARING: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 30)]
                            },
                            STORE: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 0)]
                            },
                            GOV: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 7, 30), new Date(2000, 0, 1, 20, 0)]
                            }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 10, config: {} },
                            {
                                bizType: 'STORE_RENTAL',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: {
                                    counterServiceHours: [new Date(2000, 0, 1, 8, 30), new Date(2000, 0, 1, 21, 0)],
                                    manualHandover: true,
                                    manualInspection: true
                                }
                            },
                            { bizType: 'GOV', status: 'ACTIVE', reservedSpots: 0, config: { corporateIds: ['CORP002'] } }
                        ]
                    },
                    {
                        id: 3,
                        parentId: 'S3',
                        name: '金门水头码头游客取还点',
                        stationType: '旅行社团体专用',
                        parkingLotType: '露天停车场',
                        parkingCompany: '金门港务停车场',
                        contactName: '陈佩蓉',
                        contactPhone: '082-326-021',
                        email: 'shuitou-station@rimo.tw',
                        fax: '082-326-099',
                        addressRegion: ['金门县', '金城镇', '西门里'],
                        addressDetail: '西海路一段水头港区游客服务中心旁',
                        address: '金门县 金城镇 西门里 西海路一段水头港区游客服务中心旁',
                        longitude: 118.3177,
                        latitude: 24.4316,
                        fenceRadius: 50,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 118.3178, latitude: 24.4317, radius: 50 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 30)],
                        rentalDeposit: 3000,
                        monthlyRentCost: 18000,
                        utilityCost: 2600,
                        staffingCost: 16000,
                        accessMethod: '無門禁',
                        isFixedParking: true,
                        fixedParkingSlots: ['K-101', 'K-102'],
                        photos: [],
                        totalCapacity: 15,
                        parkedCount: 15,
                        parkingFeeRule: '前 20 分钟免费，之后每小时 NT$30',
                        description: '面向金门旅游游客，支持码头到市区的跨站点还车。',
                        remark: '周末船班抵达时段需增加现场引导',
                        isActive: true,
                        serviceGroups: {
                            SHARING: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 30)]
                            },
                            STORE: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 8, 30), new Date(2000, 0, 1, 19, 30)]
                            },
                            GOV: {
                                enabled: false,
                                serviceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 18, 0)]
                            }
                        },
                        services: [
                            {
                                bizType: 'DIFF_STATION',
                                status: 'ACTIVE',
                                reservedSpots: 8,
                                config: { pickupEnabled: false, returnEnabled: true }
                            },
                            {
                                bizType: 'STORE_RENTAL',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: {
                                    counterServiceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 19, 30)],
                                    manualHandover: true,
                                    manualInspection: false
                                }
                            },
                            {
                                bizType: 'STORE_SELF_SERVICE',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: { allowNightReturn: false, pickupMethod: 'SELF_KIOSK' }
                            }
                        ]
                    },
                    {
                        id: 4,
                        parentId: 'S1',
                        name: '台北松山机场 P2 长租停车区',
                        stationType: '机场长租区',
                        parkingLotType: '室内停车场',
                        parkingCompany: '松山机场停车管理中心',
                        contactName: '林冠宇',
                        contactPhone: '02-2718-5218',
                        email: 'songshan-p2@rimo.tw',
                        fax: '02-2718-5298',
                        addressRegion: ['台北市', '台北市', '松山区'],
                        addressDetail: '敦化北路 340-9 号旁 P2 长租停车区',
                        address: '台北市 台北市 松山区 敦化北路 340-9 号旁 P2 长租停车区',
                        longitude: 121.5518,
                        latitude: 25.0689,
                        fenceRadius: 70,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 121.5519, latitude: 25.0690, radius: 70 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)],
                        rentalDeposit: 4000,
                        monthlyRentCost: 66000,
                        utilityCost: 5400,
                        staffingCost: 38000,
                        accessMethod: '車牌辨識',
                        isFixedParking: true,
                        fixedParkingSlots: ['P2-021', 'P2-022', 'P2-023', 'P2-024'],
                        photos: [],
                        totalCapacity: 36,
                        parkedCount: 9,
                        parkingFeeRule: '前 40 分钟免费，之后每小时 NT$50',
                        description: '以长租整备和门市备车为主，适合作为机场门市的后台停车区。',
                        remark: '夜间调车频率较高',
                        isActive: true,
                        serviceGroups: {
                            SHARING: {
                                enabled: false,
                                serviceHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)]
                            },
                            STORE: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 21, 30)]
                            },
                            GOV: {
                                enabled: false,
                                serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
                            }
                        },
                        services: [
                            {
                                bizType: 'STORE_RENTAL',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: {
                                    counterServiceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 30)],
                                    manualHandover: true,
                                    manualInspection: true
                                }
                            },
                            {
                                bizType: 'STORE_SELF_SERVICE',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: { allowNightReturn: true, pickupMethod: 'APP_SCAN' }
                            }
                        ]
                    },
                    {
                        id: 5,
                        parentId: 'S2',
                        name: '高雄左营站前自助还车点',
                        stationType: '商圈停车点',
                        parkingLotType: '露天停车场',
                        parkingCompany: '左营站前停车场',
                        contactName: '陈怡君',
                        contactPhone: '07-350-6218',
                        email: 'zuoying-self@rimo.tw',
                        fax: '07-350-6288',
                        addressRegion: ['高雄市', '高雄市', '左营区'],
                        addressDetail: '站前北路 88 号户外停车区',
                        address: '高雄市 高雄市 左营区 站前北路 88 号户外停车区',
                        longitude: 120.3061,
                        latitude: 22.6894,
                        fenceRadius: 55,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 120.3062, latitude: 22.6895, radius: 55 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 0, 0), new Date(2000, 0, 1, 23, 59)],
                        rentalDeposit: 2000,
                        monthlyRentCost: 22000,
                        utilityCost: 1800,
                        staffingCost: 9000,
                        accessMethod: '無門禁',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 18,
                        parkedCount: 17,
                        parkingFeeRule: '每小时 NT$35，夜间封顶 NT$180',
                        description: '作为高铁门市的站前自助还车据点，方便夜间和短停用户。',
                        remark: '晚间常接近满位',
                        isActive: true,
                        serviceGroups: {
                            SHARING: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)]
                            },
                            STORE: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 0, 0), new Date(2000, 0, 1, 23, 59)]
                            },
                            GOV: {
                                enabled: false,
                                serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)]
                            }
                        },
                        services: [
                            {
                                bizType: 'DIFF_STATION',
                                status: 'ACTIVE',
                                reservedSpots: 6,
                                config: { pickupEnabled: false, returnEnabled: true }
                            },
                            {
                                bizType: 'STORE_SELF_SERVICE',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: { allowNightReturn: true, pickupMethod: 'SELF_KIOSK' }
                            }
                        ]
                    },
                    {
                        id: 6,
                        parentId: 'S3',
                        name: '金门城区民权停车区',
                        stationType: '商圈停车点',
                        parkingLotType: '露天停车场',
                        parkingCompany: '民权停车场合作社',
                        contactName: '陈佩蓉',
                        contactPhone: '082-326-031',
                        email: 'jincheng-station@rimo.tw',
                        fax: '082-326-088',
                        addressRegion: ['金门县', '金城镇', '南门里'],
                        addressDetail: '民权路 218 号后方停车区',
                        address: '金门县 金城镇 南门里 民权路 218 号后方停车区',
                        longitude: 118.3214,
                        latitude: 24.4329,
                        fenceRadius: 45,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 118.3215, latitude: 24.4330, radius: 45 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 7, 30), new Date(2000, 0, 1, 21, 0)],
                        rentalDeposit: 2500,
                        monthlyRentCost: 16000,
                        utilityCost: 2100,
                        staffingCost: 12000,
                        accessMethod: '人工抬桿',
                        isFixedParking: true,
                        fixedParkingSlots: ['M-001', 'M-002', 'M-003'],
                        photos: [],
                        totalCapacity: 22,
                        parkedCount: 7,
                        parkingFeeRule: '前 15 分钟免费，之后每小时 NT$25',
                        description: '位于金城市区，适合旅宿周边短租备车与城区归还整备。',
                        remark: '平日白天空位较多',
                        isActive: true,
                        serviceGroups: {
                            SHARING: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)]
                            },
                            STORE: {
                                enabled: true,
                                serviceHours: [new Date(2000, 0, 1, 8, 30), new Date(2000, 0, 1, 20, 30)]
                            },
                            GOV: {
                                enabled: false,
                                serviceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 18, 0)]
                            }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 5, config: {} },
                            {
                                bizType: 'STORE_RENTAL',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: {
                                    counterServiceHours: [new Date(2000, 0, 1, 9, 0), new Date(2000, 0, 1, 20, 0)],
                                    manualHandover: true,
                                    manualInspection: true
                                }
                            }
                        ]
                    },
                    {
                        id: 7,
                        parentId: 'S4',
                        name: '桃园机场一航厦入境取还站',
                        stationType: '机场快取站',
                        parkingLotType: '室内停车场',
                        parkingCompany: '桃园机场停车管理处',
                        contactName: '郑宜芳',
                        contactPhone: '03-399-8811',
                        email: 'taoyuan-t1-station@rimo.tw',
                        fax: '03-399-8899',
                        addressRegion: ['桃园市', '大园区', '航翔路'],
                        addressDetail: '第一航厦一楼入境大厅 B 区',
                        address: '桃园市 大园区 航翔路 第一航厦一楼入境大厅 B 区',
                        longitude: 121.2328,
                        latitude: 25.0797,
                        fenceRadius: 100,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 121.2329, latitude: 25.0798, radius: 100 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)],
                        rentalDeposit: 10000,
                        monthlyRentCost: 88000,
                        utilityCost: 9200,
                        staffingCost: 64000,
                        accessMethod: '車牌辨識',
                        isFixedParking: true,
                        fixedParkingSlots: ['B-001', 'B-002', 'B-003'],
                        photos: [],
                        totalCapacity: 40,
                        parkedCount: 28,
                        parkingFeeRule: '出国旅客 2 小时内免费，逾时每小时 NT$50',
                        description: '桃园机场第一航厦入境旅客主柜台，提供国际旅客取还车服务。',
                        remark: '尖峰时段建议加派接驳车',
                        isActive: true,
                        serviceGroups: {
                            SHARING: { enabled: true, serviceHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)] },
                            STORE: { enabled: true, serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)] },
                            GOV: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 14, config: {} },
                            { bizType: 'DIFF_STATION', status: 'ACTIVE', reservedSpots: 6, config: { pickupEnabled: true, returnEnabled: true } },
                            { bizType: 'STORE_RENTAL', status: 'ACTIVE', reservedSpots: 0, config: { counterServiceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)], manualHandover: true, manualInspection: true } }
                        ]
                    },
                    {
                        id: 8,
                        parentId: 'S5',
                        name: '桃园机场二航厦出境服务站',
                        stationType: '机场快取站',
                        parkingLotType: '室内停车场',
                        parkingCompany: '桃园机场停车管理处',
                        contactName: '许耀文',
                        contactPhone: '03-399-8821',
                        email: 'taoyuan-t2-station@rimo.tw',
                        fax: '03-399-8829',
                        addressRegion: ['桃园市', '大园区', '航翔路'],
                        addressDetail: '第二航厦一楼入境大厅 C 区',
                        address: '桃园市 大园区 航翔路 第二航厦一楼入境大厅 C 区',
                        longitude: 121.2335,
                        latitude: 25.0781,
                        fenceRadius: 90,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 121.2336, latitude: 25.0782, radius: 90 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)],
                        rentalDeposit: 10000,
                        monthlyRentCost: 78000,
                        utilityCost: 7600,
                        staffingCost: 56000,
                        accessMethod: '車牌辨識',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 32,
                        parkedCount: 18,
                        parkingFeeRule: '出国旅客 2 小时内免费，逾时每小时 NT$45',
                        description: '桃园机场第二航厦出境旅客服务站，提供自助与人工取还。',
                        remark: '深夜航班加派值班人员',
                        isActive: true,
                        serviceGroups: {
                            SHARING: { enabled: true, serviceHours: [new Date(2000, 0, 1, 5, 0), new Date(2000, 0, 1, 23, 59)] },
                            STORE: { enabled: true, serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 30)] },
                            GOV: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 10, config: {} },
                            { bizType: 'STORE_SELF_SERVICE', status: 'ACTIVE', reservedSpots: 4, config: {} }
                        ]
                    },
                    {
                        id: 9,
                        parentId: 'S6',
                        name: '中坜民族服务区取还站',
                        stationType: '旅行社团体专用',
                        parkingLotType: '露天停车场',
                        parkingCompany: '中坜服务区停车管理',
                        contactName: '潘佳颖',
                        contactPhone: '03-452-3311',
                        email: 'jhongli-station@rimo.tw',
                        fax: '03-452-3399',
                        addressRegion: ['桃园市', '中坜区', '民族路'],
                        addressDetail: '民族路二段 88 号服务区',
                        address: '桃园市 中坜区 民族路 民族路二段 88 号服务区',
                        longitude: 121.2156,
                        latitude: 24.9653,
                        fenceRadius: 70,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 121.2157, latitude: 24.9654, radius: 70 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 0)],
                        rentalDeposit: 5000,
                        monthlyRentCost: 42000,
                        utilityCost: 4800,
                        staffingCost: 30000,
                        accessMethod: '人工管理',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 25,
                        parkedCount: 9,
                        parkingFeeRule: '服务区消费折抵 1 小时停车费，逾时每小时 NT$30',
                        description: '国道转乘与短途商务旅客服务据点。',
                        remark: '假日车流较大需加派人员',
                        isActive: true,
                        serviceGroups: {
                            SHARING: { enabled: true, serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 22, 0)] },
                            STORE: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] },
                            GOV: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 6, config: {} },
                            { bizType: 'DIFF_STATION', status: 'SUSPENDED', reservedSpots: 0, config: { pickupEnabled: false, returnEnabled: false } }
                        ]
                    },
                    {
                        id: 10,
                        parentId: 'S7',
                        name: '台中高铁乌日快取站',
                        stationType: '高铁转乘站',
                        parkingLotType: '室内停车场',
                        parkingCompany: '高铁台中站停车中心',
                        contactName: '赖俊豪',
                        contactPhone: '04-3701-6611',
                        email: 'taichung-hsr-station@rimo.tw',
                        fax: '04-3701-6699',
                        addressRegion: ['台中市', '乌日区', '高铁东路'],
                        addressDetail: '高铁台中站一楼东侧出口',
                        address: '台中市 乌日区 高铁东路 高铁台中站一楼东侧出口',
                        longitude: 120.5445,
                        latitude: 24.1123,
                        fenceRadius: 85,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 120.5446, latitude: 24.1124, radius: 85 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 5, 30), new Date(2000, 0, 1, 23, 30)],
                        rentalDeposit: 8000,
                        monthlyRentCost: 56000,
                        utilityCost: 5400,
                        staffingCost: 38000,
                        accessMethod: '門禁卡',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 30,
                        parkedCount: 21,
                        parkingFeeRule: '高铁转乘 1 小时内免费，逾时每小时 NT$40',
                        description: '高铁台中站主力转乘门市，服务长短租混合客户。',
                        remark: '连假建议预约制',
                        isActive: true,
                        serviceGroups: {
                            SHARING: { enabled: true, serviceHours: [new Date(2000, 0, 1, 6, 0), new Date(2000, 0, 1, 23, 0)] },
                            STORE: { enabled: true, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 0)] },
                            GOV: { enabled: true, serviceHours: [new Date(2000, 0, 1, 7, 30), new Date(2000, 0, 1, 20, 0)] }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 10, config: {} },
                            { bizType: 'STORE_RENTAL', status: 'ACTIVE', reservedSpots: 0, config: { counterServiceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 21, 0)], manualHandover: true, manualInspection: true } },
                            { bizType: 'GOV', status: 'ACTIVE', reservedSpots: 0, config: {} }
                        ]
                    },
                    {
                        id: 11,
                        parentId: 'S8',
                        name: '朝马转运站接驳取还点',
                        stationType: '转运站接驳点',
                        parkingLotType: '露天停车场',
                        parkingCompany: '朝马转运站停车管理',
                        contactName: '郭姿婷',
                        contactPhone: '04-2316-7711',
                        email: 'chaoma-station@rimo.tw',
                        fax: '04-2316-7799',
                        addressRegion: ['台中市', '西屯区', '朝马路'],
                        addressDetail: '朝马路二段 56 号转运站旁',
                        address: '台中市 西屯区 朝马路 朝马路二段 56 号转运站旁',
                        longitude: 120.6411,
                        latitude: 24.1659,
                        fenceRadius: 60,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 120.6412, latitude: 24.1660, radius: 60 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)],
                        rentalDeposit: 6000,
                        monthlyRentCost: 38000,
                        utilityCost: 4200,
                        staffingCost: 28000,
                        accessMethod: '人工管理',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 20,
                        parkedCount: 7,
                        parkingFeeRule: '转运旅客 30 分钟内免费，逾时每小时 NT$35',
                        description: '国道客运接驳与短租旅客服务据点。',
                        remark: '配合客运班次排班',
                        isActive: false,
                        serviceGroups: {
                            SHARING: { enabled: true, serviceHours: [new Date(2000, 0, 1, 6, 30), new Date(2000, 0, 1, 22, 30)] },
                            STORE: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] },
                            GOV: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'SUSPENDED', reservedSpots: 0, config: {} }
                        ]
                    },
                    {
                        id: 12,
                        parentId: 'S9',
                        name: '高雄港旅运中心邮轮取还站',
                        stationType: '码头游客取还点',
                        parkingLotType: '室内停车场',
                        parkingCompany: '高雄港旅运中心停车管理',
                        contactName: '吴佩玲',
                        contactPhone: '07-521-4411',
                        email: 'kaohsiung-port-station@rimo.tw',
                        fax: '07-521-4499',
                        addressRegion: ['高雄市', '苓雅区', '海边的路'],
                        addressDetail: '海边的路 18 号旅运中心一楼',
                        address: '高雄市 苓雅区 海边的路 海边的路 18 号旅运中心一楼',
                        longitude: 120.3028,
                        latitude: 22.6135,
                        fenceRadius: 75,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 120.3029, latitude: 22.6136, radius: 75 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 21, 0)],
                        rentalDeposit: 6000,
                        monthlyRentCost: 46000,
                        utilityCost: 5000,
                        staffingCost: 32000,
                        accessMethod: '車牌辨識',
                        isFixedParking: true,
                        fixedParkingSlots: ['P-101', 'P-102'],
                        photos: [],
                        totalCapacity: 22,
                        parkedCount: 13,
                        parkingFeeRule: '邮轮旅客 3 小时内免费，逾时每小时 NT$35',
                        description: '高雄港邮轮旅客接驳取还车服务据点。',
                        remark: '配合邮轮靠港班次排班',
                        isActive: true,
                        serviceGroups: {
                            SHARING: { enabled: true, serviceHours: [new Date(2000, 0, 1, 7, 0), new Date(2000, 0, 1, 21, 0)] },
                            STORE: { enabled: true, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)] },
                            GOV: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 8, config: {} },
                            { bizType: 'STORE_RENTAL', status: 'ACTIVE', reservedSpots: 0, config: { counterServiceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)], manualHandover: true, manualInspection: true } }
                        ]
                    },
                    {
                        id: 13,
                        parentId: 'S10',
                        name: '左营海军站商务取还点',
                        stationType: '商圈停车点',
                        parkingLotType: '露天停车场',
                        parkingCompany: '海军站合作停车场',
                        contactName: '徐子轩',
                        contactPhone: '07-581-2211',
                        email: 'zuoying-navy-station@rimo.tw',
                        fax: '07-581-2299',
                        addressRegion: ['高雄市', '左营区', '海军路'],
                        addressDetail: '海军路 88 号眷村改建商场旁',
                        address: '高雄市 左营区 海军路 海军路 88 号眷村改建商场旁',
                        longitude: 120.2945,
                        latitude: 22.7051,
                        fenceRadius: 50,
                        geofences: [
                            { key: 'F1', enabled: true, longitude: 120.2946, latitude: 22.7052, radius: 50 }
                        ],
                        operatingHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)],
                        rentalDeposit: 4000,
                        monthlyRentCost: 28000,
                        utilityCost: 3200,
                        staffingCost: 22000,
                        accessMethod: '人工管理',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 15,
                        parkedCount: 6,
                        parkingFeeRule: '商场消费折抵 2 小时，逾时每小时 NT$30',
                        description: '军港周边商务与眷村居民短租服务据点。',
                        remark: '配合商场营业时间',
                        isActive: true,
                        serviceGroups: {
                            SHARING: { enabled: true, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 20, 0)] },
                            STORE: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] },
                            GOV: { enabled: false, serviceHours: [new Date(2000, 0, 1, 8, 0), new Date(2000, 0, 1, 18, 0)] }
                        },
                        services: [
                            { bizType: 'SAME_STATION', status: 'ACTIVE', reservedSpots: 5, config: {} }
                        ]
                    }
                ]);
                // --- State ---
                const currentNode = ref(null); // Default: show all stations
                const stationTableRef = ref(null);
                const orgTreeRef = ref(null);
                const dialogVisible = ref(false);
                const isEdit = ref(false);
                const searchQuery = ref('');
                const serviceFilter = ref([]);
                const serviceStatusFilter = ref('');
                const statusFilter = ref('');
                const selectedStationRows = ref([]);
                const stationImportDialogVisible = ref(false);
                const stationExportDialogVisible = ref(false);
                const stationImportFileList = ref([]);
                const stationImportFile = ref(null);
                const stationServiceFilterOptions = ref([
                    { label: '同站租还', value: 'SAME_STATION' },
                    { label: '甲租乙还', value: 'DIFF_STATION' },
                    { label: '门市租车', value: 'STORE_RENTAL' },
                    { label: '24小时自助', value: 'STORE_SELF_SERVICE' },
                    { label: '公务用车', value: 'GOV' }
                ]);
                const serviceStatusFilterOptions = ref([
                    { label: '启用中', value: 'ACTIVE' },
                    { label: '已暂停', value: 'SUSPENDED' }
                ]);
                const serviceStatusOptions = ref([
                    { label: '启用', value: 'ACTIVE' },
                    { label: '暂停', value: 'SUSPENDED' }
                ]);
                const stationImportForm = reactive({
                    mode: 'append',
                    templateType: 'station_basic'
                });
                const stationExportForm = reactive({
                    scope: 'filtered',
                    format: 'xlsx',
                    fields: ['basic', 'service', 'capacity', 'status']
                });
                const currentStation = reactive({
                    services: [],
                    serviceGroups: {},
                    geofences: [],
                    photos: [],
                    addressRegion: [],
                    operatingHours: []
                });
                const serviceChecks = reactive({
                    SAME_STATION: false,
                    DIFF_STATION: false,
                    STORE_RENTAL: false,
                    STORE_SELF_SERVICE: false,
                    GOV: false
                });
                const stationTypeManagerVisible = ref(false);
                const newStationTypeInput = ref('');
                const fixedParkingSlotsInput = ref('');
                const activeCoordinateTarget = ref('station');
                const mapPickerVisible = ref(false);
                const mapPickerTarget = ref('station');

                // --- Hierarchy Management State ---
                const hierarchyDialogVisible = ref(false);
                const hierarchyCurrentCompany = ref(null);
                const companyDialogVisible = ref(false);
                const storeDialogVisible = ref(false);
                const isCompanyEdit = ref(false);
                const isStoreEdit = ref(false);
                const companyForm = reactive({});
                const storeForm = reactive({});
                const addressOptions = ref([
                    {
                        value: '台北市',
                        label: '台北市',
                        children: [
                            {
                                value: '台北市',
                                label: '台北市',
                                children: [
                                    { value: '松山区', label: '松山区' },
                                    { value: '中山区', label: '中山区' },
                                    { value: '信义区', label: '信义区' }
                                ]
                            }
                        ]
                    },
                    {
                        value: '高雄市',
                        label: '高雄市',
                        children: [
                            {
                                value: '高雄市',
                                label: '高雄市',
                                children: [
                                    { value: '左营区', label: '左营区' },
                                    { value: '前镇区', label: '前镇区' },
                                    { value: '小港区', label: '小港区' }
                                ]
                            }
                        ]
                    },
                    {
                        value: '金门县',
                        label: '金门县',
                        children: [
                            {
                                value: '金城镇',
                                label: '金城镇',
                                children: [
                                    { value: '西门里', label: '西门里' },
                                    { value: '南门里', label: '南门里' }
                                ]
                            },
                            {
                                value: '金沙镇',
                                label: '金沙镇',
                                children: [
                                    { value: '汶沙里', label: '汶沙里' },
                                    { value: '何斗里', label: '何斗里' }
                                ]
                            }
                        ]
                    }
                ]);

                // --- Methods ---
                const getIconByLevel = (level) => {
                    const map = { company: 'OfficeBuilding', store: 'Shop', station: 'Location' };
                    return map[level] || 'Location';
                };

                const handleNodeClick = (data) => {
                    currentNode.value = data;
                    stationPage.value = 1;
                    clearStationSelection();
                };

                const setAllScope = () => {
                    currentNode.value = null;
                    orgTreeRef.value?.setCurrentKey?.(null);
                    stationPage.value = 1;
                    clearStationSelection();
                };

                const isStoreNode = (nodeId) => {
                    return orgData.value.some(company => (company.children || []).some(store => store.id === nodeId));
                };

                const stationParentOptions = computed(() => {
                    return orgData.value.map(company => ({
                        value: company.id,
                        label: company.label,
                        children: (company.children || []).map(store => ({
                            value: store.id,
                            label: store.label
                        }))
                    })).filter(group => group.children.length > 0);
                });

                const stationParentProps = {
                    checkStrictly: false,
                    emitPath: false
                };

                const matchesServiceCapability = (service, filterValue) => {
                    if (!service) return false;
                    return service.bizType === filterValue;
                };

                const matchesServiceFilter = (station, filterValues) => {
                    const services = station.services || [];
                    const values = Array.isArray(filterValues) ? filterValues : [filterValues];
                    return services.some(service => values.some(value => matchesServiceCapability(service, value)));
                };

                const matchesServiceStatusFilter = (station, filterValue) => {
                    const services = station.services || [];
                    const targetServices = Array.isArray(serviceFilter.value) && serviceFilter.value.length > 0
                        ? services.filter(service => serviceFilter.value.some(value => matchesServiceCapability(service, value)))
                        : services;
                    return targetServices.some(service => service?.status === filterValue);
                };

                const getStationList = (node, options = {}) => {
                    let list = [];
                    if (!node) {
                        list = [...allStations.value];
                    } else if (node.level === 'store') {
                        list = allStations.value.filter(s => s.parentId === node.id);
                    } else if (node.level === 'company') {
                        // Recursively find all stations
                        const storeIds = node.children.map(child => child.id);
                        list = allStations.value.filter(s => storeIds.includes(s.parentId));
                    }

                    // Search Filter
                    if (!options.ignoreFilters) {
                        if (searchQuery.value) {
                            const q = searchQuery.value.toLowerCase();
                            list = list.filter(s =>
                                s.name.toLowerCase().includes(q) ||
                                (s.address || '').toLowerCase().includes(q)
                            );
                        }

                        if (Array.isArray(serviceFilter.value) && serviceFilter.value.length > 0) {
                            list = list.filter(s => matchesServiceFilter(s, serviceFilter.value));
                        }

                        if (serviceStatusFilter.value) {
                            list = list.filter(s => matchesServiceStatusFilter(s, serviceStatusFilter.value));
                        }

                        if (statusFilter.value === 'ACTIVE') {
                            list = list.filter(s => !!s.isActive);
                        } else if (statusFilter.value === 'INACTIVE') {
                            list = list.filter(s => !s.isActive);
                        }
                    }

                    return list;
                };

                const visibleStations = computed(() => getStationList(currentNode.value));
                const stationPage = ref(1);
                const stationPageSize = ref(10);
                const pagedStations = computed(() => {
                    const start = (stationPage.value - 1) * stationPageSize.value;
                    return visibleStations.value.slice(start, start + stationPageSize.value);
                });
                watch(visibleStations, () => {
                    const maxPage = Math.max(1, Math.ceil(visibleStations.value.length / stationPageSize.value));
                    if (stationPage.value > maxPage) stationPage.value = 1;
                });

                const getStoreName = (storeId) => {
                    for (const company of orgData.value) {
                        const store = (company.children || []).find(item => item.id === storeId);
                        if (store) return store.label;
                    }
                    return '-';
                };

                const getStationTypeConfig = (value) => {
                    return stationTypeOptions.value.find(item => item.value === value);
                };

                const getStationTypeEntryConfig = (valueOrOption) => {
                    if (valueOrOption && typeof valueOrOption === 'object') return valueOrOption;
                    return getStationTypeConfig(valueOrOption);
                };

                const getStationTypeEntryText = (valueOrOption) => {
                    const config = getStationTypeEntryConfig(valueOrOption);
                    if (!config) return '一般预约可用';
                    return config.normalEntryVisible === false ? '不开放一般预约' : '一般预约可用';
                };

                const getStationTypeEntryTagType = (valueOrOption) => {
                    const config = getStationTypeEntryConfig(valueOrOption);
                    return config?.normalEntryVisible === false ? 'warning' : 'success';
                };

                const getServiceTagType = (type) => {
                    const map = {
                        SHARING: 'success',
                        STORE: 'warning',
                        SAME_STATION: 'success',
                        DIFF_STATION: 'warning',
                        STORE_RENTAL: 'warning',
                        STORE_SELF_SERVICE: 'info',
                        GOV: 'info'
                    };
                    return map[type] || 'info';
                };

                const getServiceName = (type) => {
                    const map = {
                        SHARING: '同站租还',
                        STORE: '门市租赁',
                        SAME_STATION: '同站租还',
                        DIFF_STATION: '甲租乙还',
                        STORE_RENTAL: '门市租车',
                        STORE_SELF_SERVICE: '24小时自助',
                        GOV: '公务用车'
                    };
                    return map[type] || type;
                };

                const getServiceDisplayName = (service) => {
                    if (!service) return '';
                    const base = getServiceName(service.bizType);
                    if (service.bizType !== 'DIFF_STATION') return base;

                    const pickup = !!service.config?.pickupEnabled;
                    const returnable = !!service.config?.returnEnabled;
                    if (pickup && returnable) return `${base}（取/还）`;
                    if (pickup) return `${base}（取）`;
                    if (returnable) return `${base}（还）`;
                    return base;
                };

                // 服务能力列：按业务域归组渲染
                const DOMAIN_ORDER = ['SHARING', 'STORE', 'GOV'];
                const DOMAIN_META = {
                    SHARING: { dot: 'bg-indigo-500' },
                    STORE: { dot: 'bg-cyan-500' },
                    GOV: { dot: 'bg-slate-500' },
                };
                const bizDomain = (type) => type === 'GOV' ? 'GOV'
                    : (['STORE', 'STORE_RENTAL', 'STORE_SELF_SERVICE'].includes(type) ? 'STORE' : 'SHARING');
                const svcShortName = (svc) => {
                    const map = {
                        SAME_STATION: '同站租还',
                        DIFF_STATION: '甲租乙还',
                        STORE_RENTAL: '门市租车',
                        STORE_SELF_SERVICE: '24h自助',
                        GOV: '公务用车',
                    };
                    let base = map[svc.bizType] || svc.bizType;
                    return base;
                };
                const groupServices = (services) => {
                    const map = {};
                    (services || []).forEach(svc => {
                        const d = bizDomain(svc.bizType);
                        const seg = {
                            text: svcShortName(svc),
                            suspended: svc.status === 'SUSPENDED',
                            bizType: svc.bizType,
                            svc,
                        };
                        (map[d] = map[d] || { domain: d, segments: [] }).segments.push(seg);
                    });
                    return DOMAIN_ORDER.filter(d => map[d]).map(d => map[d]);
                };

                const getParkedCount = (row) => {
                    return Number(row?.parkedCount || 0);
                };

                const getAvailableSpots = (row) => {
                    const totalCapacity = Number(row?.totalCapacity || 0);
                    return Math.max(0, totalCapacity - getParkedCount(row));
                };

                const isParkingFull = (row) => {
                    const totalCapacity = Number(row?.totalCapacity || 0);
                    if (totalCapacity <= 0) return false;
                    return getParkedCount(row) >= totalCapacity;
                };

                const getParkingOccupancyPercentage = (row) => {
                    const totalCapacity = Number(row?.totalCapacity || 0);
                    if (totalCapacity <= 0) return 0;
                    return Math.min(100, (getParkedCount(row) / totalCapacity) * 100);
                };

                const hasDiffStationReturn = (row) => {
                    const svc = (row.services || []).find(s => s.bizType === 'DIFF_STATION');
                    return !!svc && svc.status === 'ACTIVE';
                };

                const getTotalReserved = (row) => {
                    if (!row.services) return 0;
                    return row.services.reduce((acc, cur) => {
                        if (!['SAME_STATION', 'DIFF_STATION'].includes(cur.bizType)) return acc;
                        return acc + (cur.reservedSpots || 0);
                    }, 0);
                };

                const getNodeScopeLabel = (node) => {
                    if (!node) return '全部据点';
                    if (node.level === 'company') return `车行：${node.label}`;
                    if (node.level === 'store') return `门市：${node.label}`;
                    return `据点：${node.label}`;
                };

                const initEmptyCompany = () => ({
                    id: 'C' + Date.now(),
                    label: '',
                    level: 'company',
                    contactName: '',
                    contactPhone: '',
                    taxId: '',
                    providerType: '',
                    remark: '',
                    children: []
                });

                const initEmptyStore = () => ({
                    id: 'S' + Date.now(),
                    label: '',
                    level: 'store',
                    contactName: '',
                    contactPhone: '',
                    email: '',
                    addressRegion: [],
                    addressDetail: '',
                    remark: '',
                    children: []
                });

                const stationTypeOptions = ref([
                    { label: '普通营运据点', value: '普通营运据点', normalEntryVisible: true },
                    { label: '旅行社团体专用', value: '旅行社团体专用', normalEntryVisible: false },
                    { label: '企业活动合作据点', value: '企业活动合作据点', normalEntryVisible: true },
                    { label: '码头游客取还点', value: '码头游客取还点', normalEntryVisible: true },
                    { label: '机场快取站', value: '机场快取站', normalEntryVisible: true },
                    { label: '景区停车点', value: '景区停车点', normalEntryVisible: true },
                    { label: '酒店联运点', value: '酒店联运点', normalEntryVisible: true },
                    { label: '商圈服务点', value: '商圈服务点', normalEntryVisible: true },
                    { label: '服务区停车点', value: '服务区停车点', normalEntryVisible: true }
                ]);
                const defaultProps = {
                    children: 'children',
                    label: 'label'
                };

                const corporateOptions = ref([
                    { label: '春晖文旅集团', value: 'CORP001' },
                    { label: '远星国际会展', value: 'CORP002' },
                    { label: '东岗高校后勤', value: 'CORP003' }
                ]);

                const selfServicePickupMethodOptions = ref([
                    { label: 'App 扫码取还', value: 'APP_SCAN' },
                    { label: '自助机取还', value: 'SELF_KIOSK' },
                    { label: '密码柜取钥匙', value: 'KEY_LOCKER' },
                    { label: '远程审核开通', value: 'REMOTE_APPROVAL' }
                ]);

                const serviceGroupTypes = {
                    SHARING: ['SAME_STATION', 'DIFF_STATION'],
                    STORE: ['STORE_RENTAL', 'STORE_SELF_SERVICE'],
                    GOV: ['GOV']
                };

                const serviceTypeGroupMap = Object.entries(serviceGroupTypes).reduce((acc, [group, types]) => {
                    types.forEach(type => {
                        acc[type] = group;
                    });
                    return acc;
                }, {});

                const reservableServiceTypes = new Set(['SAME_STATION', 'DIFF_STATION']);

                const createDefaultOperatingHours = () => [
                    new Date(2000, 0, 1, 8, 0),
                    new Date(2000, 0, 1, 22, 0)
                ];

                const cloneTimeRange = (hours, fallbackFactory) => {
                    if (!Array.isArray(hours) || hours.length !== 2) {
                        return fallbackFactory();
                    }
                    return hours.map(item => item ? new Date(item) : new Date(2000, 0, 1, 0, 0));
                };

                const cloneOperatingHours = (hours) => cloneTimeRange(hours, createDefaultOperatingHours);

                const createDefaultCounterServiceHours = () => [
                    new Date(2000, 0, 1, 9, 0),
                    new Date(2000, 0, 1, 20, 0)
                ];

                const getDefaultServiceGroupConfig = () => ({
                    enabled: false,
                    serviceHours: createDefaultOperatingHours()
                });

                const normalizeSingleServiceGroup = (group, config = {}, services = []) => {
                    const defaultConfig = getDefaultServiceGroupConfig(group);
                    const relatedTypes = serviceGroupTypes[group] || [];
                    const inferredEnabled = relatedTypes.some(type => services.some(service => service.bizType === type));
                    return {
                        ...defaultConfig,
                        ...config,
                        enabled: inferredEnabled || !!config?.enabled,
                        serviceHours: cloneOperatingHours(config?.serviceHours)
                    };
                };

                const normalizeServiceGroups = (serviceGroups = {}, services = []) => ({
                    SHARING: normalizeSingleServiceGroup('SHARING', serviceGroups?.SHARING, services),
                    STORE: normalizeSingleServiceGroup('STORE', serviceGroups?.STORE, services),
                    GOV: normalizeSingleServiceGroup('GOV', serviceGroups?.GOV, services)
                });

                const createDefaultServiceGroups = (services = []) => normalizeServiceGroups({}, services);

                const serializeServiceGroups = (serviceGroups = {}, services = []) => {
                    const normalizedGroups = normalizeServiceGroups(serviceGroups, services);
                    return {
                        SHARING: {
                            enabled: !!normalizedGroups.SHARING.enabled,
                            serviceHours: cloneOperatingHours(normalizedGroups.SHARING.serviceHours)
                        },
                        STORE: {
                            enabled: !!normalizedGroups.STORE.enabled,
                            serviceHours: cloneOperatingHours(normalizedGroups.STORE.serviceHours)
                        },
                        GOV: {
                            enabled: !!normalizedGroups.GOV.enabled,
                            serviceHours: cloneOperatingHours(normalizedGroups.GOV.serviceHours)
                        }
                    };
                };

                const getDefaultServiceConfig = (type) => {
                    if (type === 'DIFF_STATION') {
                        return {
                            pickupEnabled: true,
                            returnEnabled: true
                        };
                    }
                    if (type === 'GOV') {
                        return { corporateIds: Array.isArray(config?.corporateIds) ? [...config.corporateIds] : [] };
                    }
                    if (type === 'STORE_RENTAL') {
                        return {
                            counterServiceHours: createDefaultCounterServiceHours(),
                            manualHandover: true,
                            manualInspection: true
                        };
                    }
                    if (type === 'STORE_SELF_SERVICE') {
                        return {
                            allowNightReturn: true,
                            pickupMethod: 'APP_SCAN'
                        };
                    }
                    return {};
                };

                const normalizeServiceConfig = (type, config = {}) => {
                    const defaultConfig = getDefaultServiceConfig(type);
                    if (type === 'DIFF_STATION') {
                        return {
                            pickupEnabled: config?.pickupEnabled ?? defaultConfig.pickupEnabled,
                            returnEnabled: config?.returnEnabled ?? defaultConfig.returnEnabled
                        };
                    }
                    if (type === 'GOV') {
                        return { corporateIds: Array.isArray(config?.corporateIds) ? [...config.corporateIds] : [] };
                    }
                    if (type === 'STORE_RENTAL') {
                        return {
                            ...defaultConfig,
                            ...config,
                            counterServiceHours: cloneTimeRange(config?.counterServiceHours, createDefaultCounterServiceHours),
                            manualHandover: config?.manualHandover ?? defaultConfig.manualHandover,
                            manualInspection: config?.manualInspection ?? defaultConfig.manualInspection
                        };
                    }
                    if (type === 'STORE_SELF_SERVICE') {
                        return {
                            ...defaultConfig,
                            ...config,
                            allowNightReturn: config?.allowNightReturn ?? defaultConfig.allowNightReturn,
                            pickupMethod: config?.pickupMethod || defaultConfig.pickupMethod
                        };
                    }
                    return { ...(config || {}) };
                };

                const serializeServiceConfig = (type, config = {}) => {
                    if (type === 'DIFF_STATION') {
                        return {
                            pickupEnabled: config?.pickupEnabled ?? true,
                            returnEnabled: config?.returnEnabled ?? true
                        };
                    }
                    if (type === 'GOV') {
                        return { corporateIds: Array.isArray(config?.corporateIds) ? [...config.corporateIds] : [] };
                    }
                    if (type === 'STORE_RENTAL') {
                        return {
                            counterServiceHours: cloneTimeRange(config?.counterServiceHours, createDefaultCounterServiceHours),
                            manualHandover: !!config?.manualHandover,
                            manualInspection: !!config?.manualInspection
                        };
                    }
                    if (type === 'STORE_SELF_SERVICE') {
                        return {
                            allowNightReturn: !!config?.allowNightReturn,
                            pickupMethod: config?.pickupMethod || 'APP_SCAN'
                        };
                    }
                    return {};
                };

                const createGeofence = (index = 0) => ({
                    key: `F${index + 1}`,
                    enabled: index === 0,
                    longitude: '',
                    latitude: '',
                    radius: index === 0 ? 60 : 40
                });

                const normalizeGeofences = (geofences = []) => {
                    const source = Array.isArray(geofences) ? geofences.slice(0, 4) : [];
                    const normalized = source
                        .map((fence, index) => ({
                            ...createGeofence(index),
                            ...(fence || {}),
                            key: `F${index + 1}`,
                            radius: Number((fence || {}).radius ?? (index === 0 ? 60 : 40))
                        }));

                    if (!normalized.length) {
                        normalized.push(createGeofence(0));
                    }

                    return normalized;
                };

                const createDefaultGeofences = () => normalizeGeofences();

                const getParsedParkingSlots = () => {
                    if (!fixedParkingSlotsInput.value) return [];
                    return fixedParkingSlotsInput.value
                        .split(/[\n,，]/)
                        .map(item => item.trim())
                        .filter(Boolean);
                };

                const normalizeStation = (station = {}) => {
                    const typeMap = {
                        SHARING: 'SAME_STATION',
                        STORE: 'STORE_RENTAL',
                        SAME_STATION: 'SAME_STATION',
                        DIFF_STATION: 'DIFF_STATION',
                        STORE_RENTAL: 'STORE_RENTAL',
                        STORE_SELF_SERVICE: 'STORE_SELF_SERVICE',
                        GOV: 'GOV'
                    };

                    const base = {
                        id: station.id || Date.now(),
                        parentId: station.parentId || (currentNode.value?.level === 'store' ? currentNode.value.id : null),
                        name: '',
                        stationType: stationTypeOptions.value[0]?.value || '',
                        parkingLotType: '露天停车场',
                        parkingCompany: '',
                        contactName: '',
                        contactPhone: '',
                        email: '',
                        fax: '',
                        addressRegion: [],
                        addressDetail: '',
                        address: '',
                        longitude: '',
                        latitude: '',
                        fenceRadius: 50,
                        geofences: createDefaultGeofences(),
                        operatingHours: createDefaultOperatingHours(),
                        rentalDeposit: 0,
                        monthlyRentCost: 0,
                        utilityCost: 0,
                        staffingCost: 0,
                        accessMethod: '',
                        isFixedParking: false,
                        fixedParkingSlots: [],
                        photos: [],
                        totalCapacity: 10,
                        parkedCount: 0,
                        parkingFeeRule: '',
                        description: '',
                        remark: '',
                        isActive: true,
                        serviceGroups: createDefaultServiceGroups(),
                        services: []
                    };

                    const normalized = { ...base, ...station };
                    normalized.addressRegion = Array.isArray(station.addressRegion) ? [...station.addressRegion] : [];
                    normalized.fixedParkingSlots = Array.isArray(station.fixedParkingSlots)
                        ? station.fixedParkingSlots.filter(Boolean)
                        : [];
                    normalized.photos = Array.isArray(station.photos)
                        ? station.photos
                            .map((photo, index) => ({
                                name: photo.name || `据点照片${index + 1}`,
                                url: photo.url || photo.response?.url || ''
                            }))
                            .filter(photo => photo.url)
                        : [];
                    normalized.operatingHours = cloneOperatingHours(
                        station.operatingHours || station.services?.find(item => item.bizType === 'STORE')?.config?.operatingHours
                    );

                    normalized.geofences = normalizeGeofences(station.geofences);

                    const seen = new Set();
                    normalized.services = [];
                    (Array.isArray(station.services) ? station.services : []).forEach(service => {
                        const bizType = typeMap[service.bizType] || service.bizType;
                        if (seen.has(bizType)) return;
                        seen.add(bizType);
                        normalized.services.push({
                            bizType,
                            status: service.status || 'ACTIVE',
                            reservedSpots: reservableServiceTypes.has(bizType) ? Number(service.reservedSpots || 0) : 0,
                            config: normalizeServiceConfig(bizType, service.config)
                        });
                    });

                    normalized.serviceGroups = normalizeServiceGroups(station.serviceGroups, normalized.services);

                    if (!normalized.address) {
                        normalized.address = [...normalized.addressRegion, normalized.addressDetail].filter(Boolean).join(' ');
                    }

                    return normalized;
                };

                const getCoordinateTargetLabel = (target) => {
                    if (target === 'station') return '据点主坐标';
                    const match = String(target).match(/^geofence-(\d+)$/);
                    if (match) return `电子围栏 ${Number(match[1]) + 1}`;
                    return '据点主坐标';
                };

                const getCoordinateTargetValue = (target) => {
                    if (target === 'station') {
                        return {
                            longitude: currentStation.longitude,
                            latitude: currentStation.latitude
                        };
                    }
                    const match = String(target).match(/^geofence-(\d+)$/);
                    if (!match) return { longitude: '', latitude: '' };
                    return currentStation.geofences?.[Number(match[1])] || { longitude: '', latitude: '' };
                };

                const isValidCoordinate = (longitude, latitude) => {
                    const lng = Number(longitude);
                    const lat = Number(latitude);
                    return Number.isFinite(lng) && Number.isFinite(lat);
                };

                const formatCoordinateDisplay = (target) => {
                    const { longitude, latitude } = getCoordinateTargetValue(target);
                    if (!isValidCoordinate(longitude, latitude)) return '未设置';
                    return `${Number(longitude).toFixed(6)}, ${Number(latitude).toFixed(6)}`;
                };

                const setActiveCoordinateTarget = (target) => {
                    if (target === 'station') {
                        activeCoordinateTarget.value = target;
                        return;
                    }
                    const match = String(target).match(/^geofence-(\d+)$/);
                    if (!match || !currentStation.geofences?.[Number(match[1])]) {
                        activeCoordinateTarget.value = 'station';
                        return;
                    }
                    activeCoordinateTarget.value = target;
                };

                const addGeofence = () => {
                    if (!Array.isArray(currentStation.geofences)) {
                        currentStation.geofences = createDefaultGeofences();
                    }
                    if (currentStation.geofences.length >= 4) return;
                    const newFence = {
                        key: 'F' + Date.now(),
                        enabled: false,
                        longitude: '',
                        latitude: '',
                        radius: 40
                    };
                    currentStation.geofences = [...currentStation.geofences, newFence];
                };

                const removeGeofence = (index) => {
                    if (!Array.isArray(currentStation.geofences) || index <= 0 || currentStation.geofences.length <= 1) {
                        return;
                    }
                    currentStation.geofences.splice(index, 1);
                    if (String(activeCoordinateTarget.value).startsWith('geofence-')) {
                        activeCoordinateTarget.value = 'station';
                    }
                };

                const assignCoordinateTarget = (target, longitude, latitude) => {
                    const lng = Number(longitude).toFixed(6);
                    const lat = Number(latitude).toFixed(6);
                    if (target === 'station') {
                        currentStation.longitude = lng;
                        currentStation.latitude = lat;
                        return;
                    }
                    const match = String(target).match(/^geofence-(\d+)$/);
                    if (!match) return;
                    const index = Number(match[1]);
                    if (!currentStation.geofences[index]) return;
                    currentStation.geofences[index].longitude = lng;
                    currentStation.geofences[index].latitude = lat;
                    currentStation.geofences[index].enabled = true;
                };

                const handleMapClick = (event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    const ratioX = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
                    const ratioY = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
                    const longitude = 118 + (122.5 - 118) * ratioX;
                    const latitude = 25.6 - (25.6 - 21.8) * ratioY;
                    assignCoordinateTarget(activeCoordinateTarget.value, longitude, latitude);
                };

                const openMapPicker = (target) => {
                    mapPickerTarget.value = target;
                    setActiveCoordinateTarget(target);
                    mapPickerVisible.value = true;
                };

                const getMarkerStyle = (target) => {
                    const { longitude, latitude } = getCoordinateTargetValue(target);
                    if (!isValidCoordinate(longitude, latitude)) return { display: 'none' };
                    const left = ((Number(longitude) - 118) / (122.5 - 118)) * 100;
                    const top = ((25.6 - Number(latitude)) / (25.6 - 21.8)) * 100;
                    return {
                        left: `${Math.min(96, Math.max(4, left))}%`,
                        top: `${Math.min(96, Math.max(4, top))}%`
                    };
                };

                const getFenceMarkerClass = (index) => {
                    return ['bg-emerald-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500'][index] || 'bg-slate-500';
                };

                const handleStationPhotoChange = (uploadFile, uploadFiles) => {
                    currentStation.photos = uploadFiles.map((file, index) => ({
                        name: file.name || `据点照片${index + 1}`,
                        url: file.url || (file.raw ? URL.createObjectURL(file.raw) : '')
                    })).filter(file => file.url);
                };

                const removeStationPhoto = (uploadFile, uploadFiles) => {
                    currentStation.photos = uploadFiles.map((file, index) => ({
                        name: file.name || `据点照片${index + 1}`,
                        url: file.url || (file.raw ? URL.createObjectURL(file.raw) : '')
                    })).filter(file => file.url);
                };

                const addStationTypeOption = () => {
                    const value = newStationTypeInput.value.trim();
                    if (!value) {
                        ElMessage.warning('请输入据点类型');
                        return;
                    }
                    if (stationTypeOptions.value.some(option => option.value === value)) {
                        ElMessage.warning('该据点类型已存在');
                        return;
                    }
                    stationTypeOptions.value.push({ label: value, value, normalEntryVisible: true });
                    newStationTypeInput.value = '';
                };

                const removeStationTypeOption = (index) => {
                    const removed = stationTypeOptions.value[index];
                    stationTypeOptions.value.splice(index, 1);
                    if (removed && currentStation.stationType === removed.value) {
                        currentStation.stationType = stationTypeOptions.value[0]?.value || '';
                    }
                };

                const handleStationSelectionChange = (rows) => {
                    selectedStationRows.value = rows;
                };

                const clearStationSelection = () => {
                    selectedStationRows.value = [];
                    stationTableRef.value?.clearSelection?.();
                };

                const openStationImportDialog = () => {
                    stationImportForm.mode = 'append';
                    stationImportForm.templateType = 'station_basic';
                    stationImportFileList.value = [];
                    stationImportFile.value = null;
                    stationImportDialogVisible.value = true;
                };

                const downloadStationTemplate = () => {
                    ElMessage.success('模板开始下载');
                };

                const handleStationFileChange = (file) => {
                    stationImportFile.value = file;
                };

                const openStationExportDialog = () => {
                    stationExportForm.scope = 'filtered';
                    stationExportForm.format = 'xlsx';
                    stationExportForm.fields = ['basic', 'service', 'capacity', 'status'];
                    stationExportDialogVisible.value = true;
                };

                const handleStationImportFileChange = (file, files) => {
                    stationImportFileList.value = files.slice(-1);
                };

                const handleStationImportFileRemove = (file, files) => {
                    stationImportFileList.value = files;
                };

                const handleStationImport = () => {
                    if (!stationImportFile.value) {
                        ElMessage.warning('请先选择要导入的批量文件');
                        return;
                    }
                    stationImportDialogVisible.value = false;
                    stationImportFile.value = null;
                    stationImportFileList.value = [];
                    ElMessage.success('导入申请已提交，系统正在后台解析处理。');
                };

                const handleStationExport = () => {
                    ElMessage.success('据点数据导出任务已提交，系统稍后将自动下载文件。');
                };

                const applyStationBatchStatus = (nextStatus) => {
                    if (!selectedStationRows.value.length) {
                        ElMessage.warning('请先选择据点');
                        return;
                    }
                    selectedStationRows.value.forEach(row => {
                        row.isActive = nextStatus;
                        const target = allStations.value.find(item => item.id === row.id);
                        if (target) target.isActive = nextStatus;
                    });
                    const actionText = nextStatus ? '启用' : '停用';
                    const count = selectedStationRows.value.length;
                    clearStationSelection();
                    ElMessage.success(`已批量${actionText} ${count} 个据点`);
                };

                const ensureServiceGroups = () => {
                    currentStation.serviceGroups = normalizeServiceGroups(
                        currentStation.serviceGroups,
                        currentStation.services || []
                    );
                    return currentStation.serviceGroups;
                };

                const getServiceGroupConfig = (group) => {
                    return currentStation.serviceGroups?.[group] || getDefaultServiceGroupConfig(group);
                };

                const toggleServiceGroup = (group) => {
                    const groupConfig = getServiceGroupConfig(group);
                    const relatedTypes = serviceGroupTypes[group] || [];

                    if (!groupConfig.enabled) {
                        relatedTypes.forEach(type => {
                            serviceChecks[type] = false;
                            const index = currentStation.services.findIndex(item => item.bizType === type);
                            if (index !== -1) currentStation.services.splice(index, 1);
                        });
                        return;
                    }

                    if (group === 'GOV') {
                        serviceChecks.GOV = true;
                        if (!hasService('GOV')) {
                            currentStation.services.push({
                                bizType: 'GOV',
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: normalizeServiceConfig('GOV')
                            });
                        }
                    }
                };

                // --- Hierarchy Management Methods ---
                const openHierarchyDialog = () => {
                    hierarchyDialogVisible.value = true;
                    if (orgData.value.length > 0) {
                        hierarchyCurrentCompany.value = orgData.value[0];
                    }
                };

                const addCompany = () => {
                    isCompanyEdit.value = false;
                    Object.assign(companyForm, initEmptyCompany());
                    companyDialogVisible.value = true;
                };

                const openCompanyDialog = (comp) => {
                    isCompanyEdit.value = true;
                    Object.assign(companyForm, JSON.parse(JSON.stringify(comp)));
                    companyDialogVisible.value = true;
                };

                const saveCompany = () => {
                    if (!companyForm.label) {
                        ElMessage.warning('请填写车行名称');
                        return;
                    }

                    if (isCompanyEdit.value) {
                        const target = orgData.value.find(c => c.id === companyForm.id);
                        if (target) Object.assign(target, JSON.parse(JSON.stringify(companyForm)));
                        if (hierarchyCurrentCompany.value?.id === companyForm.id) {
                            hierarchyCurrentCompany.value = target || hierarchyCurrentCompany.value;
                        }
                    } else {
                        const newComp = JSON.parse(JSON.stringify(companyForm));
                        if (!newComp.children) newComp.children = [];
                        orgData.value.push(newComp);
                        hierarchyCurrentCompany.value = newComp;
                    }

                    companyDialogVisible.value = false;
                    ElMessage.success('车行已保存');
                };

                const deleteCompany = (comp) => {
                    if (comp.children && comp.children.length > 0) {
                        ElMessage.warning('该车行下还有门店，请先删除门店');
                        return;
                    }
                    ElMessageBox.confirm('确定要删除该车行吗?', '警告', { type: 'warning' }).then(() => {
                        const idx = orgData.value.findIndex(c => c.id === comp.id);
                        if (idx !== -1) {
                            orgData.value.splice(idx, 1);
                            if (hierarchyCurrentCompany.value?.id === comp.id) {
                                hierarchyCurrentCompany.value = orgData.value[0] || null;
                            }
                            ElMessage.success('车行已删除');
                        }
                    });
                };

                const addStore = () => {
                    if (!hierarchyCurrentCompany.value) return;
                    isStoreEdit.value = false;
                    Object.assign(storeForm, initEmptyStore());
                    storeDialogVisible.value = true;
                };

                const openStoreDialog = (store) => {
                    isStoreEdit.value = true;
                    Object.assign(storeForm, JSON.parse(JSON.stringify(store)));
                    if (!Array.isArray(storeForm.addressRegion)) storeForm.addressRegion = [];
                    storeDialogVisible.value = true;
                };

                const saveStore = () => {
                    if (!hierarchyCurrentCompany.value) return;
                    if (!storeForm.label) {
                        ElMessage.warning('请填写门市名称');
                        return;
                    }

                    if (!hierarchyCurrentCompany.value.children) hierarchyCurrentCompany.value.children = [];

                    if (isStoreEdit.value) {
                        const target = hierarchyCurrentCompany.value.children.find(s => s.id === storeForm.id);
                        if (target) Object.assign(target, JSON.parse(JSON.stringify(storeForm)));
                    } else {
                        hierarchyCurrentCompany.value.children.push(JSON.parse(JSON.stringify(storeForm)));
                    }

                    storeDialogVisible.value = false;
                    ElMessage.success('门市已保存');
                };

                const deleteStore = (store) => {
                    // Check if store has stations in allStations
                    const hasStations = allStations.value.some(s => s.parentId === store.id);
                    if (hasStations) {
                        ElMessage.warning('该门店下还有据点，请先删除据点');
                        return;
                    }

                    ElMessageBox.confirm('确定要删除该门店吗?', '警告', { type: 'warning' }).then(() => {
                        const children = hierarchyCurrentCompany.value.children;
                        const idx = children.findIndex(s => s.id === store.id);
                        if (idx !== -1) {
                            children.splice(idx, 1);
                            ElMessage.success('门店已删除');
                        }
                    });
                };


                // --- Dialog Logic ---
                const initEmptyStation = () => normalizeStation();

                const openStationDialog = (row) => {
                    const station = row ? normalizeStation(row) : initEmptyStation();
                    isEdit.value = !!row;
                    Object.assign(currentStation, station);
                    ensureServiceGroups();
                    fixedParkingSlotsInput.value = (station.fixedParkingSlots || []).join("\n");
                    activeCoordinateTarget.value = 'station';
                    serviceChecks.SAME_STATION = !!station.services.find(s => s.bizType === 'SAME_STATION');
                    serviceChecks.DIFF_STATION = !!station.services.find(s => s.bizType === 'DIFF_STATION');
                    serviceChecks.STORE_RENTAL = !!station.services.find(s => s.bizType === 'STORE_RENTAL');
                    serviceChecks.STORE_SELF_SERVICE = !!station.services.find(s => s.bizType === 'STORE_SELF_SERVICE');
                    serviceChecks.GOV = !!station.services.find(s => s.bizType === 'GOV');
                    dialogVisible.value = true;
                };

                const hasService = (type) => {
                    return !!(currentStation.services || []).find(s => s.bizType === type);
                };

                const getServiceConfig = (type) => {
                    const fallback = {
                        bizType: type,
                        status: 'ACTIVE',
                        reservedSpots: 0,
                        config: type === 'GOV' ? { corporateIds: [] } : getDefaultServiceConfig(type)
                    };
                    if (!Array.isArray(currentStation.services)) return fallback;
                    return currentStation.services.find(item => item.bizType === type) || fallback;
                };

                const toggleService = (type) => {
                    const checked = serviceChecks[type];
                    const group = serviceTypeGroupMap[type];
                    if (checked) {
                        if (group) getServiceGroupConfig(group).enabled = true;
                        if (!hasService(type)) {
                            currentStation.services.push({
                                bizType: type,
                                status: 'ACTIVE',
                                reservedSpots: 0,
                                config: normalizeServiceConfig(type)
                            });
                        }
                        return;
                    }
                    const index = currentStation.services.findIndex(item => item.bizType === type);
                    if (index !== -1) currentStation.services.splice(index, 1);
                    if (group === 'GOV') {
                        getServiceGroupConfig('GOV').enabled = false;
                    }
                };

                const totalReservedSpots = computed(() => {
                    return getTotalReserved(currentStation);
                });

                const govCorporateIds = computed({
                    get() {
                        const svc = (currentStation.services || []).find(s => s.bizType === 'GOV');
                        return svc && Array.isArray(svc.config?.corporateIds) ? svc.config.corporateIds : [];
                    },
                    set(val) {
                        let svc = (currentStation.services || []).find(s => s.bizType === 'GOV');
                        if (!svc) {
                            svc = { bizType: 'GOV', status: 'ACTIVE', reservedSpots: 0, config: { corporateIds: [] } };
                            currentStation.services.push(svc);
                        }
                        if (!svc.config) svc.config = {};
                        svc.config.corporateIds = Array.isArray(val) ? val : [];
                    }
                });

                const saveStation = () => {
                    if (!currentStation.name || !currentStation.parentId) {
                        ElMessage.warning('请先填写据点名称并选择所属门市');
                        return;
                    }

                    if (!isStoreNode(currentStation.parentId)) {
                        ElMessage.warning('所属门市必须选择到门市层级');
                        return;
                    }

                    if (totalReservedSpots.value > Number(currentStation.totalCapacity || 0)) {
                        ElMessage.warning('预留车位数不能超过据点总车位数');
                        return;
                    }

                    if (hasService('DIFF_STATION')) {
                    }

                    if (hasService('GOV') && !getServiceConfig('GOV').config.corporateIds?.length) {
                        ElMessage.warning('请选择公务用车业务对应的签约企业客户');
                        return;
                    }

                    const payload = normalizeStation({
                        ...currentStation,
                        address: [...(currentStation.addressRegion || []), currentStation.addressDetail].filter(Boolean).join(' '),
                        fixedParkingSlots: currentStation.isFixedParking ? getParsedParkingSlots() : [],
                        services: (currentStation.services || []).map(service => ({
                            bizType: service.bizType,
                            status: service.status || 'ACTIVE',
                            reservedSpots: reservableServiceTypes.has(service.bizType) ? Number(service.reservedSpots || 0) : 0,
                            config: serializeServiceConfig(service.bizType, service.config)
                        })),
                        serviceGroups: serializeServiceGroups(ensureServiceGroups(), currentStation.services),
                        geofences: normalizeGeofences(currentStation.geofences).map((fence, index) => ({
                            key: fence.key || `F${index + 1}`,
                            enabled: !!fence.enabled,
                            longitude: fence.longitude,
                            latitude: fence.latitude,
                            radius: Number(fence.radius || 0)
                        })),
                        photos: (currentStation.photos || []).map((photo, index) => ({
                            name: photo.name || `据点照片${index + 1}`,
                            url: photo.url || photo.response?.url || ''
                        })).filter(photo => photo.url)
                    });

                    if (isEdit.value) {
                        const index = allStations.value.findIndex(item => item.id === payload.id);
                        if (index !== -1) {
                            allStations.value[index] = payload;
                        }
                    } else {
                        allStations.value.push(payload);
                    }

                    dialogVisible.value = false;
                    ElMessage.success('据点已保存');
                };

                const handleStationRowCommand = (command, row) => {
                    if (command !== 'delete') return;
                    ElMessageBox.confirm(`确定删除据点“${row.name}”吗？`, '删除据点', {
                        type: 'warning',
                        confirmButtonText: '删除',
                        cancelButtonText: '取消'
                    }).then(() => {
                        const index = allStations.value.findIndex(item => item.id === row.id);
                        if (index !== -1) allStations.value.splice(index, 1);
                        selectedStationRows.value = selectedStationRows.value.filter(item => item.id !== row.id);
                        ElMessage.success('据点已删除');
                    }).catch(() => {});
                };

                return {
                    orgData,
                    defaultProps,
                    allStations,
                    currentNode,
                    stationTableRef,
                    orgTreeRef,
                    dialogVisible,
                    isEdit,
                    searchQuery,
                    serviceFilter,
                    serviceStatusFilter,
                    statusFilter,
                    selectedStationRows,
                    stationImportDialogVisible,
                    stationExportDialogVisible,
                    stationImportFileList,
                    stationImportFile,
                    stationServiceFilterOptions,
                    serviceStatusFilterOptions,
                    serviceStatusOptions,
                    stationImportForm,
                    stationExportForm,
                    currentStation,
                    serviceChecks,
                    stationTypeManagerVisible,
                    newStationTypeInput,
                    fixedParkingSlotsInput,
                    activeCoordinateTarget,
                    stationTypeOptions,
                    corporateOptions,
                    selfServicePickupMethodOptions,
                    getIconByLevel,
                    handleNodeClick,
                    setAllScope,
                    getStationList,
                    visibleStations,
                    pagedStations,
                    stationPage,
                    stationPageSize,
                    getNodeScopeLabel,
                    getStoreName,
                    getStationTypeEntryText,
                    getStationTypeEntryTagType,
                    getServiceTagType,
                    getServiceName,
                    getServiceDisplayName,
                    svcShortName,
                    groupServices,
                    DOMAIN_META,
                    getParkedCount,
                    getAvailableSpots,
                    isParkingFull,
                    getParkingOccupancyPercentage,
                    hasDiffStationReturn,
                    getTotalReserved,
                    handleStationSelectionChange,
                    handleStationRowCommand,
                    applyStationBatchStatus,
                    openStationImportDialog,
                    openStationExportDialog,
                    downloadStationTemplate,
                    handleStationFileChange,
                    handleStationImportFileChange,
                    handleStationImportFileRemove,
                    handleStationImport,
                    handleStationExport,
                    openStationDialog,
                    getServiceGroupConfig,
                    toggleServiceGroup,
                    hasService,
                    getServiceConfig,
                    toggleService,
                    totalReservedSpots,
                    govCorporateIds,
                    saveStation,
                    getCoordinateTargetLabel,
                    setActiveCoordinateTarget,
                    addGeofence,
                    removeGeofence,
                    handleMapClick,
                    formatCoordinateDisplay,
                    isValidCoordinate,
                    getMarkerStyle,
                    getFenceMarkerClass,
                    mapPickerVisible,
                    mapPickerTarget,
                    openMapPicker,
                    handleStationPhotoChange,
                    removeStationPhoto,
                    getParsedParkingSlots,
                    stationParentOptions,
                    stationParentProps,
                    addStationTypeOption,
                    removeStationTypeOption,
                    // Hierarchy
                    hierarchyDialogVisible,
                    hierarchyCurrentCompany,
                    companyDialogVisible,
                    storeDialogVisible,
                    isCompanyEdit,
                    isStoreEdit,
                    companyForm,
                    storeForm,
                    addressOptions,
                    openHierarchyDialog,
                    addCompany, openCompanyDialog, saveCompany, deleteCompany,
                    addStore, openStoreDialog, saveStore, deleteStore
                };
            }
        };
</script>

<style scoped>
        .custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }

        :deep(.el-tree-node__content) {
            height: 40px;
        }

        /* Map Placeholder Pattern */
        .map-pattern {
            background-color: #f0f9ff;
            background-image: radial-gradient(#bae6fd 1px, transparent 1px);
            background-size: 20px 20px;
        }
</style>
