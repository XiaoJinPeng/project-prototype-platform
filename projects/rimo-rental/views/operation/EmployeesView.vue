<template>
<div class="employees-page">
            
            

            
            <main>
                
                <PageHeader unstyled class="flex justify-between items-end mb-6" title="平台账户管理" description="管理公司内部员工账号、所属部门及系统角色权限。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                    <template #actions>
                        <el-button size="large" @click="goToRoles">
                            <el-icon class="mr-1">
                                <Key></Key>
                            </el-icon>角色管理
                        </el-button>
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20"
                            @click="openCreateDialog">
                            <el-icon class="mr-1">
                                <Plus></Plus>
                            </el-icon> 新增员工
                        </el-button>
                    </template>
                </PageHeader>

                
                <div class="flex gap-6 layout-container">

                    
                    <div v-if="false" class="w-72 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        
                        <div class="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                            <div class="flex p-1 bg-gray-200/50 rounded-lg">
                                <div class="flex-1 text-center py-1.5 rounded-md cursor-pointer text-sm font-medium transition-all select-none"
                                    :class="sidebarTab === 'HEADQUARTERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                                    @click="switchSidebarTab('HEADQUARTERS')">
                                    营运账户
                                </div>
                                <div class="flex-1 text-center py-1.5 rounded-md cursor-pointer text-sm font-medium transition-all select-none"
                                    :class="sidebarTab === 'PROVIDERS' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
                                    @click="switchSidebarTab('PROVIDERS')">
                                    车行账户
                                </div>
                            </div>
                        </div>

                        <div class="flex-1 overflow-y-auto p-2 custom-scroll">
                            <div class="space-y-4">
                                
                                <div class="px-2 pt-2">
                                    <div class="group flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                                        :class="!filterOrgId ? 'bg-theme-primary text-white shadow-md shadow-theme-primary/30' : 'hover:bg-gray-50 text-gray-700'"
                                        @click="selectOrg('', '')">
                                        <el-icon class="mr-2 text-lg shrink-0">
                                            <UserFilled></UserFilled>
                                        </el-icon>
                                        <span class="font-medium text-sm">全部</span>
                                    </div>
                                </div>

                                
                                <div v-show="sidebarTab === 'HEADQUARTERS'">
                                    <div class="px-3 pb-1 mt-2 flex justify-between items-center">
                                        <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            部门列表</div>
                                        <el-button link type="primary" size="small"
                                            @click="openDeptDialog(null)">新增</el-button>
                                    </div>
                                    <div class="space-y-0.5">
                                        <div v-for="dept in sortedDepartments" :key="dept.id"
                                            class="group flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors relative"
                                            :class="(filterOrgType === 'HEADQUARTERS' && filterOrgId === dept.id) ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-600'"
                                            @click="selectOrg('HEADQUARTERS', dept.id)">
                                            <el-icon class="mr-2 text-lg shrink-0"
                                                :class="(filterOrgType === 'HEADQUARTERS' && filterOrgId === dept.id) ? 'text-blue-500' : 'text-gray-400'">
                                                <OfficeBuilding></OfficeBuilding>
                                            </el-icon>
                                            <span class="truncate font-medium text-sm flex-1">{{ dept.name }}</span>

                                            
                                            <div 
                                                class="hidden group-hover:flex items-center absolute right-2 bg-inherit">
                                                <el-button link type="primary" size="small" class="!px-1"
                                                    @click.stop="openDeptDialog(dept)">
                                                    <el-icon>
                                                        <Edit></Edit>
                                                    </el-icon>
                                                </el-button>
                                                <el-button link type="danger" size="small" class="!px-1 ml-1"
                                                    @click.stop="deleteDepartment(dept)">
                                                    <el-icon>
                                                        <Delete></Delete>
                                                    </el-icon>
                                                </el-button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div v-show="sidebarTab === 'PROVIDERS'" class="mt-2">
                                    <el-tree :data="providerTreeData" :default-expanded-keys="expandedProviderIds"
                                        node-key="id" highlight-current :expand-on-click-node="false"
                                        @node-click="handleProviderNodeClick">
                                        <template #default="{ node, data }">
                                            <div class="flex items-center w-full">
                                                <el-icon class="mr-2 text-gray-400">
                                                    <component :is="getIconByLevel(data.level)" ></component>
                                                </el-icon>
                                                <span class="flex-1 truncate text-sm" :title="node.label"
                                                    :class="{'font-bold': data.level === 'company'}">
                                                    {{ node.label }}
                                                </span>
                                            </div>
                                        </template>
                                    </el-tree>
                                </div>

                            </div>
                        </div>
                    </div>

                    
                    <div 
                        class="w-72 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-4 overflow-y-auto custom-scroll">
                        <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">账号类型</div>
                        <div class="space-y-2 mb-6">
                            <div class="group flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                                :class="sidebarTab === 'ALL' && !filterOrgType ? 'employee-filter-active' : 'employee-filter-idle text-gray-700'"
                                @click="switchSidebarTab('ALL')">
                                <span class="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                                    :class="sidebarTab === 'ALL' && !filterOrgType ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400'">
                                    <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" stroke-width="1.8"
                                            stroke-linecap="round" ></path>
                                    </svg>
                                </span>
                                <span class="font-medium text-sm">全部账户</span>
                            </div>
                            <div class="group flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                                :class="sidebarTab === 'HEADQUARTERS' && filterOrgType === 'HEADQUARTERS' ? 'employee-filter-active' : 'employee-filter-idle text-gray-700'"
                                @click="switchSidebarTab('HEADQUARTERS')">
                                <span class="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                                    :class="sidebarTab === 'HEADQUARTERS' && filterOrgType === 'HEADQUARTERS' ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400'">
                                    <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M4 12.5V5.8L8 3.5l4 2.3v6.7M3 12.5h10M6.2 12.5V8.7h3.6v3.8"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round" ></path>
                                    </svg>
                                </span>
                                <span class="font-medium text-sm">营运账户</span>
                            </div>
                            <div class="group flex items-center px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                                :class="sidebarTab === 'PROVIDERS' && (filterOrgType === 'STORE' || filterOrgType === 'STATION') ? 'employee-filter-active' : 'employee-filter-idle text-gray-700'"
                                @click="switchSidebarTab('PROVIDERS')">
                                <span class="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                                    :class="sidebarTab === 'PROVIDERS' && (filterOrgType === 'STORE' || filterOrgType === 'STATION') ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400'">
                                    <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                        <path d="M3.3 7.1h9.4l-.8-3.6H4.1l-.8 3.6ZM4 7.1v5.4h8V7.1M6.3 12.5V9.2h3.4v3.3"
                                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                            stroke-linejoin="round" ></path>
                                    </svg>
                                </span>
                                <span class="font-medium text-sm">车行账户</span>
                            </div>
                        </div>

                        <template v-if="sidebarTab === 'HEADQUARTERS'">
                            <div class="flex items-center justify-between mb-2">
                                <div class="text-xs font-bold text-gray-400 uppercase tracking-wider">部门列表</div>
                                <el-button link type="primary" size="small" @click="openDeptDialog(null)">新增</el-button>
                            </div>
                            <div class="space-y-1">
                                <div v-for="dept in sortedDepartments" :key="dept.id"
                                    class="group flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors relative"
                                    :class="(filterOrgType === 'HEADQUARTERS' && filterOrgId === dept.id) ? 'employee-filter-active' : 'employee-filter-idle text-gray-600'"
                                    @click="selectOrg('HEADQUARTERS', dept.id)">
                                    <span class="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
                                        :class="(filterOrgType === 'HEADQUARTERS' && filterOrgId === dept.id) ? 'employee-filter-icon-active' : 'bg-gray-100 text-gray-400'">
                                        <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path d="M4 12.5V5.8L8 3.5l4 2.3v6.7M3 12.5h10M6.2 12.5V8.7h3.6v3.8"
                                                stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                                stroke-linejoin="round" ></path>
                                        </svg>
                                    </span>
                                    <span class="truncate font-medium text-sm flex-1">{{ dept.name }}</span>
                                    <div class="hidden group-hover:flex items-center absolute right-2 bg-inherit">
                                        <el-button link type="primary" size="small" class="!px-1"
                                            @click.stop="openDeptDialog(dept)">
                                            <el-icon>
                                                <Edit></Edit>
                                            </el-icon>
                                        </el-button>
                                        <el-button link type="danger" size="small" class="!px-1 ml-1"
                                            @click.stop="deleteDepartment(dept)">
                                            <el-icon>
                                                <Delete></Delete>
                                            </el-icon>
                                        </el-button>
                                    </div>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="sidebarTab === 'PROVIDERS'">
                            <div class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">车行结构</div>
                            <div class="rounded-xl border border-gray-100 bg-gray-50/70 p-2">
                                <el-tree ref="providerTreeRef" :data="providerTreeData" class="employee-org-tree"
                                    :default-expanded-keys="expandedProviderIds" node-key="id" highlight-current
                                    :expand-on-click-node="false" @node-click="handleProviderNodeClick">
                                    <template #default="{ node, data }">
                                        <div class="flex items-center w-full py-1">
                                            <el-icon class="employee-tree-icon mr-2 text-gray-400">
                                                <component :is="getIconByLevel(data.level)" ></component>
                                            </el-icon>
                                            <span class="flex-1 truncate text-sm" :title="node.label"
                                                :class="{'font-bold': data.level === 'company'}">
                                                {{ node.label }}
                                            </span>
                                        </div>
                                    </template>
                                </el-tree>
                            </div>
                        </template>
                    </div>

                    <div 
                        class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        
                        <div class="p-4 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-3">
                            <div class="search-filter-group flex items-center gap-3 min-w-0" style="flex-wrap: nowrap;">
                                <el-input v-model="searchKeyword" placeholder="搜索姓名/电话/账号" clearable
                                    style="width: 240px" prefix-icon="Search"></el-input>
                                <el-select v-model="filterRole" placeholder="搜索角色" filterable clearable
                                    style="width: 160px">
                                    <el-option v-for="role in roles" :key="role.id" :label="role.name"
                                        :value="role.id"></el-option>
                                </el-select>
                                <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
                                    <el-option label="启用" :value="true"></el-option>
                                    <el-option label="禁用" :value="false"></el-option>
                                </el-select>
                            </div>
                            <div class="search-action-group flex items-center gap-3 flex-wrap">
                                <div class="flex items-center gap-1">
                                    <el-button type="success" plain @click="handleImportCommand('import')">
                                        <el-icon class="mr-1">
                                            <Upload></Upload>
                                        </el-icon>导入
                                    </el-button>
                                    <el-button type="primary" plain style="margin-left: 0;" @click="handleExport">
                                        <el-icon class="mr-1">
                                            <Download></Download>
                                        </el-icon>导出
                                    </el-button>
                                </div>

                                <el-dropdown @command="batchSetStatus" trigger="click">
                                    <el-button type="warning" plain :disabled="selectedEmployees.length === 0">
                                        批量设置
                                        <svg class="ml-1.5 h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                            <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8"
                                                stroke-linecap="round" stroke-linejoin="round" ></path>
                                        </svg>
                                    </el-button>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item command="enable" class="text-emerald-600"><el-icon>
                                                    <Check></Check>
                                                </el-icon>批量启用</el-dropdown-item>
                                            <el-dropdown-item command="disable" class="text-red-500"><el-icon>
                                                    <Close></Close>
                                                </el-icon>批量禁用</el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>

                                <span v-if="selectedEmployees.length > 0"
                                    class="text-xs text-blue-600 font-medium whitespace-nowrap bg-blue-50 px-2 py-1 rounded border border-blue-100">
                                    已选 {{ selectedEmployees.length }} 项
                                </span>
                            </div>
                            <div class="search-result-summary text-sm text-gray-500 whitespace-nowrap">共 {{
                                filteredEmployees.length }} 人员</div>
                        </div>

                        
                        <el-table :data="filteredEmployees" stripe style="width: 100%" class="flex-1"
                            @selection-change="handleSelectionChange"
                            :header-cell-style="{ backgroundColor: '#f9fafb', color: '#374151', fontWeight: 'bold' }">
                            <el-table-column type="selection" width="55" align="center"></el-table-column>
                            <el-table-column prop="name" label="姓名" width="300">
                                <template #default="{ row }">
                                    <div class="flex items-center min-w-0">
                                        <el-avatar :size="32"
                                            class="bg-blue-100 text-blue-600 mr-3 border border-blue-200 shrink-0">
                                            {{ row.name.charAt(0) }}
                                        </el-avatar>
                                        <div class="min-w-0">
                                            <div class="font-medium text-gray-900">{{ row.name }}</div>
                                            <div class="text-xs text-gray-400 whitespace-nowrap" :title="row.account">{{
                                                row.account }}</div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column label="归属组织" min-width="160">
                                <template #default="{ row }">
                                    <div v-if="row.orgType === 'HEADQUARTERS'" class="flex items-center">
                                        <el-tag size="small" type="info" class="mr-1">营运</el-tag>
                                        <span class="text-sm">{{ getDepartmentName(row.departmentId) }}</span>
                                    </div>
                                    <div v-else-if="row.orgType === 'STORE'">
                                        <div class="flex items-center mb-1">
                                            <el-tag size="small" type="warning" class="mr-1">门店</el-tag>
                                            <span class="text-sm font-medium">{{ getStoreName(row.storeId) }}</span>
                                        </div>
                                        <div v-if="row.stationIds && row.stationIds.length > 0"
                                            class="flex flex-wrap gap-1 pl-1">
                                            <el-tag v-for="sid in row.stationIds" :key="sid" size="small" type="info"
                                                effect="plain" class="scale-90 origin-left">
                                                {{ getStationName(sid) }}
                                            </el-tag>
                                        </div>
                                    </div>
                                    <div v-else class="text-gray-400">-</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="roleId" label="角色" width="120">
                                <template #default="{ row }">
                                    <el-tag size="small" type="info" effect="plain">{{ getRoleName(row.roleId)
                                        }}</el-tag>
                                </template>
                            </el-table-column>
                            <el-table-column prop="phone" label="联系方式" min-width="180">
                                <template #default="{ row }">
                                    <div class="text-sm text-gray-900">{{ row.phone }}</div>
                                    <div class="text-xs text-gray-400">{{ row.email }}</div>
                                </template>
                            </el-table-column>
                            <el-table-column prop="lastLogin" label="最后登录" width="160" sortable>
                                <template #default="{ row }">
                                    <span class="text-gray-500 text-sm">{{ row.lastLogin || '-' }}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="status" label="状态" width="100">
                                <template #default="{ row }">
                                    <el-switch v-model="row.status" @change="handleStatusChange(row)" size="small"
                                        style="--el-switch-on-color: #10b981;" ></el-switch>
                                </template>
                            </el-table-column>
                            <el-table-column label="操作" width="160" align="right" fixed="right">
                                <template #default="{ row }">
                                    <div class="flex justify-end gap-2">
                                        <el-button type="primary" link size="small"
                                            @click="openEditDialog(row)">编辑</el-button>
                                        <el-dropdown trigger="click" @command="(cmd) => handleMoreCommand(cmd, row)">
                                            <el-button type="info" link size="small">
                                                更多<el-icon class="el-icon--right">
                                                    <ArrowDown></ArrowDown>
                                                </el-icon>
                                            </el-button>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item command="resetPwd">重置密码</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>

                        
                        <div class="p-3 border-t border-gray-100 flex justify-end bg-gray-50">
                            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                                :page-sizes="[10, 20, 50]" :total="filteredEmployees.length" small background
                                layout="total, prev, pager, next"></el-pagination>
                        </div>
                    </div>
                </div>
            </main>
        </div>

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑员工' : '新增员工'" width="560px" destroy-on-close>
            <el-form :model="employeeForm" :rules="formRules" ref="formRef" label-position="top">
                
                <el-form-item label="归属组织" prop="orgType" class="mb-6">
                    <el-radio-group v-model="employeeForm.orgType" class="full-width-radio">
                        <el-radio-button label="HEADQUARTERS">营运账户</el-radio-button>
                        <el-radio-button label="STORE">车行账户</el-radio-button>
                    </el-radio-group>
                </el-form-item>

                
                <div class="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">基本信息</div>
                <div class="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="姓名" prop="name">
                                <el-input v-model="employeeForm.name" placeholder="请输入姓名" ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item label="电话" prop="phone">
                                <el-input v-model="employeeForm.phone" placeholder="请输入电话" ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="Email" prop="email" class="mb-0">
                                <el-input v-model="employeeForm.email" placeholder="请输入邮箱地址" ></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>

                
                <div class="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">职位与权限</div>
                <div class="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-100">
                    <el-row :gutter="20" v-if="employeeForm.orgType === 'HEADQUARTERS'">
                        <el-col :span="24">
                            <el-form-item label="所属部门" prop="departmentId">
                                <el-select v-model="employeeForm.departmentId" placeholder="请选择部门" style="width: 100%">
                                    <el-option v-for="dept in sortedDepartments" :key="dept.id" :label="dept.name"
                                        :value="dept.id" ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="角色" prop="roleId" class="mb-0">
                                <el-select v-model="employeeForm.roleId" placeholder="请选择角色" style="width: 100%">
                                    <el-option v-for="role in roles" :key="role.id" :label="role.name"
                                        :value="role.id" ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row :gutter="20" v-if="employeeForm.orgType === 'STORE'">
                        <el-col :span="24">
                            <el-form-item label="角色" prop="roleId">
                                <el-select v-model="employeeForm.roleId" placeholder="请选择角色" style="width: 100%">
                                    <el-option v-for="role in roles" :key="role.id" :label="role.name"
                                        :value="role.id" ></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="车行/门店/站点" prop="orgCascaderValue" class="mb-0">
                                <el-cascader v-model="employeeForm.orgCascaderValue" :options="providerTreeData"
                                    :props="{ value: 'id', label: 'label', children: 'children', checkStrictly: true }"
                                    placeholder="请选择隶属车行/门店/站点" clearable style="width: 100%" ></el-cascader>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>

                
                <div class="mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">账号安全</div>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <el-row :gutter="20">
                        <el-col :span="12">
                            <el-form-item label="账号" prop="account">
                                <el-input v-model="employeeForm.account" placeholder="登录账号" :disabled="isEdit" ></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item v-if="!isEdit" label="密码" prop="password">
                                <el-input v-model="employeeForm.password" type="password" placeholder="设置密码"
                                    show-password ></el-input>
                            </el-form-item>
                            <el-form-item v-else label="密码" class="mb-0">
                                <el-button size="small" link type="primary" disabled>如需修改请点击列表[重置密码]</el-button>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24">
                            <el-form-item label="激活状态" prop="status" class="mb-0">
                                <div class="flex items-center justify-between w-full">
                                    <span class="text-xs text-gray-400">关闭后员工将无法登录系统</span>
                                    <el-switch v-model="employeeForm.status" active-text="启用" inactive-text="禁用" ></el-switch>
                                </div>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitForm">确认</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="resetPwdDialogVisible" title="重置密码" width="400px">
            <el-form :model="resetPwdForm" :rules="resetPwdRules" ref="resetPwdFormRef" label-width="80px">
                <el-form-item label="新密码" prop="password">
                    <el-input v-model="resetPwdForm.password" type="password" placeholder="请输入新密码 (至少8位，含字母和数字)"
                        show-password ></el-input>
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input v-model="resetPwdForm.confirmPassword" type="password" placeholder="请再次输入新密码"
                        show-password ></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="resetPwdDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmResetPassword">确认重置</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="importDialogVisible" :title="importDialogTitle" width="480px" destroy-on-close>
            <div class="mb-4 text-gray-600 text-sm">
                <p class="mb-2">1. 请先下载导入模板，按标准模板格式填写数据。</p>
                <div class="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700">
                    <div>当前导入账户类型：<span class="font-bold">{{ importAccountTypeConfig?.label || '-' }}</span></div>
                    <div class="text-xs mt-1">将调用 {{ importAccountTypeConfig?.importApiName || '-' }}。</div>
                </div>
                <el-button type="primary" plain size="small" @click="downloadTemplate">
                    <el-icon class="mr-1">
                        <Download></Download>
                    </el-icon> 下载{{ importAccountTypeConfig?.templateName || '规范表模板' }}
                </el-button>
            </div>
            <div class="border-t border-gray-100 pt-4 mt-4">
                <p class="mb-2 text-gray-600 text-sm">2. 上传填写好的数据表格（支持 .xls, .xlsx 格式，单次最大支持 1000 条）。</p>
                <el-upload class="upload-demo" drag action="#" :auto-upload="false" :on-change="handleFileChange"
                    accept=".xls,.xlsx">
                    <el-icon class="el-icon--upload">
                        <UploadFilled></UploadFilled>
                    </el-icon>
                    <div class="el-upload__text">
                        将文件推拽至此处，或 <em>点击上传</em>
                    </div>
                </el-upload>
            </div>
            <template #footer>
                <el-button @click="importDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmImport">开始导入</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="deptDialogVisible" :title="editingDept ? '编辑部门' : '新增部门'" width="360px">
            <el-form :model="deptForm" label-width="80px">
                <el-form-item label="部门名称" required>
                    <el-input v-model="deptForm.name" placeholder="请输入部门名称" ></el-input>
                </el-form-item>
                <el-form-item label="排序">
                    <el-input-number v-model="deptForm.sort" :min="0" :max="999" ></el-input-number>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="deptDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveDepartment">确认</el-button>
            </template>
        </el-dialog>
</template>

<script>
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import { PageHeader } from '@/components/ui';

export default {
            components: { PageHeader },
            setup() {
                const router = useRouter();
                // ============ 部门数据 ============
                const departments = ref([
                    { id: 'dept_1', name: '营运部', sort: 1 },
                    { id: 'dept_2', name: '客服部', sort: 2 },
                    { id: 'dept_3', name: '财务部', sort: 3 },
                    { id: 'dept_4', name: '技术部', sort: 4 },
                    { id: 'dept_5', name: '行政部', sort: 5 }
                ]);

                const sortedDepartments = computed(() => {
                    return [...departments.value].sort((a, b) => a.sort - b.sort);
                });

                // ============ 门店数据 (Mock) ============
                const providers = ref([
                    { id: 'provider_1', name: '台北 RIMO 直营车行' },
                    { id: 'provider_2', name: '港都观光租车' },
                    { id: 'provider_3', name: '北区观光租赁' }
                ]);

                const stores = ref([
                    { id: 'store_1', name: '台北车站门市', providerId: 'provider_1' },
                    { id: 'store_2', name: '台北松山机场门市', providerId: 'provider_1' },
                    { id: 'store_3', name: '高雄左营高铁门市', providerId: 'provider_2' },
                    { id: 'store_4', name: '高雄小港机场门市', providerId: 'provider_2' },
                    { id: 'store_5', name: '台北南港车站门市', providerId: 'provider_1' }
                ]);

                // ============ 站点数据 (Mock) ============
                const allStations = ref([
                    { id: 'st_1', name: '松山机场第一航厦取还点', storeId: 'store_2' },
                    { id: 'st_2', name: '松山机场停车场自助点', storeId: 'store_2' },
                    { id: 'st_3', name: '台北车站东三门交接点', storeId: 'store_1' },
                    { id: 'st_4', name: '左营高铁 P2 停车场', storeId: 'store_3' },
                    { id: 'st_5', name: '南港车站东侧停车场', storeId: 'store_5' }
                ]);

                // ============ 角色数据 ============
                const roles = ref([
                    { id: 'role_admin', name: '超级管理员' },
                    { id: 'role_manager', name: '门市店长' },
                    { id: 'role_ops', name: '运营专员' },
                    { id: 'role_cs', name: '客服专员' },
                    { id: 'role_finance', name: '财务专员' }
                ]);

                // ============ 员工数据 ============
                if (!roles.value.some(role => role.id === 'role_staff')) {
                    roles.value.push({ id: 'role_staff', name: '门店员工' });
                }

                const employees = ref([
                    { id: 'emp_1', name: '林冠宇', phone: '0912-345-001', email: 'kuanyu.lin@rimo.tw', departmentId: 'dept_1', roleId: 'role_admin', account: 'kuanyu.lin@rimo.tw', status: true, lastLogin: '2026-03-25 09:30', orgType: 'HEADQUARTERS' },
                    { id: 'emp_2', name: '陈怡君', phone: '0912-345-002', email: 'yijun.chen@rimo.tw', departmentId: 'dept_2', roleId: 'role_cs', account: 'yijun.chen@rimo.tw', status: true, lastLogin: '2026-03-25 08:45', orgType: 'HEADQUARTERS' },
                    { id: 'emp_3', name: '王志豪', phone: '0912-345-003', email: 'chihhao.wang@rimo.tw', departmentId: 'dept_1', roleId: 'role_ops', account: 'chihhao.wang@rimo.tw', status: false, lastLogin: '2026-03-20 18:20', orgType: 'HEADQUARTERS' },
                    { id: 'emp_4', name: '黄雅婷', phone: '0912-345-004', email: 'yating.huang@rimo.tw', departmentId: 'dept_3', roleId: 'role_finance', account: 'yating.huang@rimo.tw', status: true, lastLogin: '2026-03-24 14:10', orgType: 'HEADQUARTERS' },
                    { id: 'emp_5', name: '张哲维', phone: '0912-345-005', email: 'chewei.chang@rimo.tw', departmentId: 'dept_1', roleId: 'role_manager', account: 'chewei.chang@rimo.tw', status: true, lastLogin: '', orgType: 'HEADQUARTERS' },
                    { id: 'emp_7', name: '吴宗翰', phone: '0928-110-101', email: 'tsunghan.wu@rimo.tw', departmentId: 'dept_4', roleId: 'role_admin', account: 'tsunghan.wu@rimo.tw', status: true, lastLogin: '2026-03-26 11:00', orgType: 'HEADQUARTERS' },
                    { id: 'emp_8', name: '蔡佳颖', phone: '0928-110-102', email: 'chiaying.tsai@rimo.tw', departmentId: 'dept_5', roleId: 'role_cs', account: 'chiaying.tsai@rimo.tw', status: true, lastLogin: '2026-03-26 10:30', orgType: 'HEADQUARTERS' },
                    { id: 'emp_9', name: '郭家豪', phone: '0928-110-103', email: 'chiahao.kuo@rimo.tw', departmentId: 'dept_4', roleId: 'role_ops', account: 'chiahao.kuo@rimo.tw', status: false, lastLogin: '2026-03-25 15:20', orgType: 'HEADQUARTERS' },
                    { id: 'emp_6', name: '李承恩', phone: '0936-220-301', email: 'chengen.lee@rimo.tw', storeId: 'store_5', stationIds: ['st_5'], roleId: 'role_staff', account: 'chengen.lee@rimo.tw', status: true, lastLogin: '2026-03-26 10:00', orgType: 'STORE' }
                ]);

                const providersWithStores = computed(() => {
                    return providers.value.map(provider => {
                        return {
                            provider,
                            stores: stores.value.filter(s => s.providerId === provider.id)
                        };
                    });
                });

                // ============ 筛选条件 ============
                const switchSidebarTab = (tab) => {
                    sidebarTab.value = tab;
                    if (tab === 'ALL') {
                        filterOrgType.value = '';
                    } else {
                        filterOrgType.value = tab === 'HEADQUARTERS' ? 'HEADQUARTERS' : 'STORE';
                    }
                    filterOrgId.value = '';
                    providerTreeRef.value?.setCurrentKey?.(null);
                };

                const searchKeyword = ref('');
                const filterOrgType = ref(''); // '', 'HEADQUARTERS', 'STORE'
                const filterOrgId = ref('');   // departmentId or storeId
                const filterRole = ref('');
                const filterStatus = ref('');
                const currentPage = ref(1);
                const pageSize = ref(10);
                const providerTreeRef = ref(null);

                // Add Import Export logic
                const selectedEmployees = ref([]);
                const importDialogVisible = ref(false);
                const importFile = ref(null);
                const currentImportAccountType = ref('');
                const accountTypeApiMap = {
                    HEADQUARTERS: {
                        label: '营运账户',
                        importApiName: '营运账户导入接口',
                        exportApiName: '营运账户导出接口',
                        templateName: '营运账户导入模板'
                    },
                    STORE: {
                        label: '车行账户',
                        importApiName: '车行账户导入接口',
                        exportApiName: '车行账户导出接口',
                        templateName: '车行账户导入模板'
                    }
                };

                const getSelectedAccountTypeConfig = () => {
                    if (sidebarTab.value === 'HEADQUARTERS') return accountTypeApiMap.HEADQUARTERS;
                    if (sidebarTab.value === 'PROVIDERS') return accountTypeApiMap.STORE;
                    return null;
                };

                const importAccountTypeConfig = computed(() => accountTypeApiMap[currentImportAccountType.value] || null);
                const importDialogTitle = computed(() => importAccountTypeConfig.value ? `导入${importAccountTypeConfig.value.label}` : '导入员工数据');

                const handleSelectionChange = (selection) => {
                    selectedEmployees.value = selection;
                };

                const batchSetStatus = (command) => {
                    if (selectedEmployees.value.length === 0) return;
                    const status = command === 'enable';
                    selectedEmployees.value.forEach(emp => {
                        emp.status = status;
                    });
                    ElMessage.success(`成功将 ${selectedEmployees.value.length} 个账号设为${status ? '启用' : '禁用'}状态`);
                };

                const handleExport = () => {
                    const accountTypeConfig = getSelectedAccountTypeConfig();
                    if (!accountTypeConfig) {
                        ElMessage.warning('请先选择导出的账户类型');
                        return;
                    }
                    ElMessage.success(`${accountTypeConfig.label}导出任务已提交，将调用${accountTypeConfig.exportApiName}。`);
                };

                const handleImportCommand = (cmd) => {
                    if (cmd === 'import') {
                        const accountTypeConfig = getSelectedAccountTypeConfig();
                        if (!accountTypeConfig) {
                            ElMessage.warning('请先选择导入的账户类型');
                            return;
                        }
                        currentImportAccountType.value = accountTypeConfig === accountTypeApiMap.HEADQUARTERS ? 'HEADQUARTERS' : 'STORE';
                        importFile.value = null;
                        importDialogVisible.value = true;
                    }
                };

                const downloadTemplate = () => {
                    const accountTypeConfig = importAccountTypeConfig.value || getSelectedAccountTypeConfig();
                    if (!accountTypeConfig) {
                        ElMessage.warning('请先选择导入的账户类型');
                        return;
                    }
                    ElMessage.success(`${accountTypeConfig.templateName}开始下载`);
                };

                const handleFileChange = (file) => {
                    importFile.value = file;
                };

                const confirmImport = () => {
                    const accountTypeConfig = importAccountTypeConfig.value;
                    if (!accountTypeConfig) {
                        ElMessage.warning('请先选择导入的账户类型');
                        return;
                    }
                    if (!importFile.value) {
                        ElMessage.warning('请先选择要导入的批量文件');
                        return;
                    }
                    ElMessage.success(`${accountTypeConfig.label}导入申请已提交，将调用${accountTypeConfig.importApiName}。`);
                    importDialogVisible.value = false;
                    currentImportAccountType.value = '';
                    importFile.value = null;
                };

                const filteredEmployees = computed(() => {
                    return employees.value.filter(emp => {
                        const matchKeyword = !searchKeyword.value ||
                            emp.name.includes(searchKeyword.value) ||
                            emp.phone.includes(searchKeyword.value) ||
                            emp.account.includes(searchKeyword.value);

                        let matchOrg = true;
                        if (filterOrgType.value === 'HEADQUARTERS') {
                            matchOrg = emp.orgType === 'HEADQUARTERS' && (!filterOrgId.value || emp.departmentId === filterOrgId.value);
                        } else if (filterOrgType.value === 'STORE') {
                            matchOrg = emp.orgType === 'STORE' && (!filterOrgId.value || emp.storeId === filterOrgId.value);
                        } else if (filterOrgType.value === 'STATION') {
                            matchOrg = emp.orgType === 'STORE' && emp.stationIds && emp.stationIds.includes(filterOrgId.value);
                        }

                        const matchRole = !filterRole.value || emp.roleId === filterRole.value;
                        const normalizedStatus = filterStatus.value === 'true' ? true : filterStatus.value === 'false' ? false : filterStatus.value;
                        const matchStatus = normalizedStatus === '' || emp.status === normalizedStatus;

                        return matchKeyword && matchOrg && matchRole && matchStatus;
                    });
                });

                // ============ 辅助函数 ============
                const getDepartmentName = (id) => departments.value.find(d => d.id === id)?.name || '-';
                const getStoreName = (id) => stores.value.find(s => s.id === id)?.name || '-';
                const getStationName = (id) => allStations.value.find(s => s.id === id)?.name || id;
                const getRoleName = (id) => roles.value.find(r => r.id === id)?.name || '-';

                const selectOrg = (type, id) => {
                    filterOrgType.value = type;
                    filterOrgId.value = id;
                    if (type !== 'STORE' && type !== 'STATION') {
                        providerTreeRef.value?.setCurrentKey?.(null);
                    }
                };

                // ============ 树形数据 ============
                const providerTreeData = computed(() => {
                    return providers.value.map(provider => {
                        const children = stores.value
                            .filter(s => s.providerId === provider.id)
                            .map(store => {
                                // Find stations for this store
                                const stations = allStations.value.filter(st => st.storeId === store.id)
                                    .map(station => ({
                                        id: station.id,
                                        label: station.name,
                                        level: 'station'
                                    }));

                                return {
                                    id: store.id,
                                    label: store.name,
                                    level: 'store',
                                    children: stations // Add stations as children
                                };
                            });

                        return {
                            id: provider.id,
                            label: provider.name,
                            level: 'company',
                            children: children
                        };
                    });
                });

                const getIconByLevel = (level) => {
                    const map = { company: 'OfficeBuilding', store: 'Shop', station: 'Location' };
                    return map[level] || 'Location';
                };

                const expandedProviderIds = computed(() => {
                    return providers.value.map(p => p.id);
                });

                const handleProviderNodeClick = (data) => {
                    if (data.level === 'store') {
                        selectOrg('STORE', data.id);
                    } else if (data.level === 'station') {
                        selectOrg('STATION', data.id);
                    }
                };

                const sidebarTab = ref('ALL'); // 'ALL' | 'HEADQUARTERS' | 'PROVIDERS'

                // ============ 员工弹窗逻辑 ============
                const dialogVisible = ref(false);
                const isEdit = ref(false);
                const formRef = ref(null);
                const employeeForm = reactive({
                    id: '',
                    name: '',
                    phone: '',
                    email: '',
                    departmentId: '',
                    storeId: '',
                    stationIds: [],
                    orgType: 'HEADQUARTERS',
                    orgCascaderValue: [], // [providerId, storeId, stationId]
                    roleId: '',
                    account: '',
                    password: '',
                    status: true
                });

                const availableStations = computed(() => {
                    return []; // Deprecated by Cascader
                });

                watch(() => employeeForm.orgType, (newVal) => {
                    if (newVal === 'HEADQUARTERS') {
                        employeeForm.storeId = '';
                        employeeForm.stationIds = [];
                        employeeForm.orgCascaderValue = [];
                    } else {
                        employeeForm.departmentId = '';
                    }
                });

                const passwordValidator = (rule, value, callback) => {
                    if (!value) {
                        callback(new Error('请输入密码'));
                    } else if (value.length < 8) {
                        callback(new Error('密码长度至少8位'));
                    } else if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
                        callback(new Error('密码必须包含字母和数字'));
                    } else {
                        callback();
                    }
                };

                // ... Keep validators ...
                const departmentValidator = (rule, value, callback) => {
                    if (employeeForm.orgType === 'HEADQUARTERS' && !value) {
                        callback(new Error('请选择部门'));
                    } else {
                        callback();
                    }
                };

                const storeValidator = (rule, value, callback) => {
                    if (employeeForm.orgType === 'STORE' && (!employeeForm.orgCascaderValue || employeeForm.orgCascaderValue.length < 2)) {
                        callback(new Error('请选择门店或站点'));
                    } else {
                        callback();
                    }
                };

                const formRules = {
                    name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
                    phone: [{ required: false, message: '请输入电话', trigger: 'blur' }],
                    email: [
                        { required: false, message: '请输入邮箱', trigger: 'blur' },
                        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
                    ],
                    roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
                    account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
                    password: [{ required: true, validator: passwordValidator, trigger: 'blur' }],
                    departmentId: [{ required: true, validator: departmentValidator, trigger: 'change' }],
                    orgCascaderValue: [{ required: true, validator: storeValidator, trigger: 'change' }] // Use custom validator for cascader
                };

                // Helper to find provider ID for a store
                const getProviderIdByStoreId = (storeId) => {
                    const store = stores.value.find(s => s.id === storeId);
                    return store ? store.providerId : '';
                };

                const openCreateDialog = () => {
                    isEdit.value = false;

                    // Reset Form
                    Object.assign(employeeForm, {
                        id: '', name: '', phone: '', email: '',
                        departmentId: '', storeId: '', stationIds: [],
                        orgType: 'HEADQUARTERS', orgCascaderValue: [],
                        roleId: '', account: '', password: '', status: true
                    });

                    // Smart Pre-fill logic
                    if (filterOrgType.value === 'HEADQUARTERS') {
                        employeeForm.orgType = 'HEADQUARTERS';
                        if (filterOrgId.value) employeeForm.departmentId = filterOrgId.value;
                    } else if (filterOrgType.value === 'STORE') {
                        employeeForm.orgType = 'STORE';
                        if (filterOrgId.value) {
                            const pId = getProviderIdByStoreId(filterOrgId.value);
                            if (pId) employeeForm.orgCascaderValue = [pId, filterOrgId.value];
                        }
                    } else if (filterOrgType.value === 'STATION') {
                        employeeForm.orgType = 'STORE';
                        // Need to find storeId from stationId (filterOrgId.value)
                        const station = allStations.value.find(s => s.id === filterOrgId.value);
                        if (station) {
                            const pId = getProviderIdByStoreId(station.storeId);
                            if (pId) employeeForm.orgCascaderValue = [pId, station.storeId, station.id];
                        }
                    }

                    dialogVisible.value = true;
                };

                const openEditDialog = (row) => {
                    isEdit.value = true;
                    // Copy basic fields
                    Object.assign(employeeForm, { ...row, password: '', orgCascaderValue: [] });

                    // Handle Org Type and Cascader Value
                    if (row.orgType === 'STORE') {
                        const pId = getProviderIdByStoreId(row.storeId);
                        if (pId && row.storeId) {
                            if (row.stationIds && row.stationIds.length > 0) {
                                // If has station, select the first one (Cascader limitation for single path)
                                employeeForm.orgCascaderValue = [pId, row.storeId, row.stationIds[0]];
                            } else {
                                employeeForm.orgCascaderValue = [pId, row.storeId];
                            }
                        }
                    }

                    dialogVisible.value = true;
                };

                const submitForm = async () => {
                    if (!formRef.value) return;
                    const valid = await formRef.value.validate().catch(() => false);
                    if (!valid) return;

                    // Parse Cascader data before saving
                    if (employeeForm.orgType === 'STORE' && employeeForm.orgCascaderValue) {
                        // [providerId, storeId, stationId?]
                        const path = employeeForm.orgCascaderValue;
                        if (path.length >= 2) {
                            employeeForm.storeId = path[1];
                            // If length 3, it's a station
                            if (path.length === 3) {
                                employeeForm.stationIds = [path[2]];
                            } else {
                                employeeForm.stationIds = [];
                            }
                        }
                    } else if (employeeForm.orgType === 'HEADQUARTERS') {
                        employeeForm.storeId = '';
                        employeeForm.stationIds = [];
                    }

                    const formData = { ...employeeForm };
                    delete formData.orgCascaderValue; // Don't save the temp value to mock DB

                    if (isEdit.value) {
                        const index = employees.value.findIndex(e => e.id === employeeForm.id);
                        if (index !== -1) {
                            employees.value[index] = { ...employees.value[index], ...formData };
                        }
                        ElMessage.success('员工信息已更新');
                    } else {
                        employees.value.push({
                            ...formData,
                            id: `emp_${Date.now()}`, // Simple ID generation
                            lastLogin: ''
                        });
                        ElMessage.success('员工创建成功');
                    }
                    dialogVisible.value = false;
                };


                // ============ 下拉菜单逻辑 (重置密码/删除) ============
                const handleMoreCommand = (command, row) => {
                    if (command === 'resetPwd') {
                        resetPassword(row);
                    } else if (command === 'delete') {
                        ElMessageBox.confirm(
                            `确定要删除员工 ${row.name} 吗？`,
                            '警告',
                            { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
                        ).then(() => {
                            deleteEmployee(row);
                        }).catch(() => { });
                    }
                };

                const deleteEmployee = (row) => {
                    employees.value = employees.value.filter(e => e.id !== row.id);
                    ElMessage.success('员工已删除');
                };

                const handleStatusChange = (row) => {
                    ElMessage.success(`员工 ${row.name} 已${row.status ? '启用' : '禁用'}`);
                };

                // ============ 重置密码逻辑 ============
                const resetPwdDialogVisible = ref(false);
                const resetPwdFormRef = ref(null);
                const resetPwdForm = reactive({ password: '', confirmPassword: '', employeeId: '' });

                const confirmPasswordValidator = (rule, value, callback) => {
                    if (!value) {
                        callback(new Error('请确认密码'));
                    } else if (value !== resetPwdForm.password) {
                        callback(new Error('两次密码不一致'));
                    } else {
                        callback();
                    }
                };

                const resetPwdRules = {
                    password: [{ required: true, validator: passwordValidator, trigger: 'blur' }],
                    confirmPassword: [{ required: true, validator: confirmPasswordValidator, trigger: 'blur' }]
                };

                const resetPassword = (row) => {
                    resetPwdForm.employeeId = row.id;
                    resetPwdForm.password = '';
                    resetPwdForm.confirmPassword = '';
                    resetPwdDialogVisible.value = true;
                };

                const confirmResetPassword = async () => {
                    if (!resetPwdFormRef.value) return;
                    const valid = await resetPwdFormRef.value.validate().catch(() => false);
                    if (!valid) return;
                    ElMessage.success('密码已重置');
                    resetPwdDialogVisible.value = false;
                };

                // ============ 部门管理逻辑 ============
                const deptDialogVisible = ref(false);
                const editingDept = ref(null);
                const deptForm = reactive({ name: '', sort: 0 });

                const openDeptDialog = (dept) => {
                    editingDept.value = dept;
                    if (dept) {
                        deptForm.name = dept.name;
                        deptForm.sort = dept.sort;
                    } else {
                        deptForm.name = '';
                        deptForm.sort = departments.value.length + 1;
                    }
                    deptDialogVisible.value = true;
                };

                const saveDepartment = () => {
                    if (!deptForm.name.trim()) {
                        ElMessage.warning('请输入部门名称');
                        return;
                    }
                    if (editingDept.value) {
                        editingDept.value.name = deptForm.name;
                        editingDept.value.sort = deptForm.sort;
                        ElMessage.success('部门已更新');
                    } else {
                        departments.value.push({
                            id: 'dept_' + Date.now(),
                            name: deptForm.name,
                            sort: deptForm.sort
                        });
                        ElMessage.success('部门已创建');
                    }
                    deptDialogVisible.value = false;
                };

                const deleteDepartment = (dept) => {
                    const hasEmployee = employees.value.some(e => e.departmentId === dept.id);
                    if (hasEmployee) {
                        ElMessage.error('该部门下存在员工，无法删除');
                        return;
                    }
                    ElMessageBox.confirm(
                        `确定要删除部门 ${dept.name} 吗？`,
                        '提示',
                        { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }
                    ).then(() => {
                        departments.value = departments.value.filter(d => d.id !== dept.id);
                        ElMessage.success('部门已删除');
                        if (filterOrgType.value === 'HEADQUARTERS' && filterOrgId.value === dept.id) {
                            filterOrgId.value = ''; // 清除筛选
                            filterOrgType.value = '';
                        }
                    }).catch(() => { });
                };

                const handleDeptCommand = (command, dept) => {
                    if (command === 'edit') {
                        openDeptDialog(dept);
                    } else if (command === 'delete') {
                        deleteDepartment(dept);
                    }
                };

                // ============ 角色管理跳转 ============
                const goToRoles = () => {
                    router.push('/operation/permissions');
                };

                return {
                    departments,
                    sortedDepartments,
                    roles,
                    employees,
                    providers,
                    stores,
                    providersWithStores,
                    expandedProviderIds,
                    allStations,
                    availableStations,
                    searchKeyword,
                    providerTreeRef,
                    filterOrgType,
                    filterOrgId,
                    filterRole,
                    filterStatus,
                    currentPage,
                    pageSize,
                    filteredEmployees,
                    getDepartmentName,
                    getStoreName,
                    getStationName,
                    getRoleName,
                    selectOrg,
                    providerTreeData,
                    getIconByLevel,
                    handleProviderNodeClick,
                    sidebarTab,
                    dialogVisible,
                    isEdit,
                    formRef,
                    employeeForm,
                    formRules,
                    openCreateDialog,
                    openEditDialog,
                    submitForm,
                    handleMoreCommand,
                    handleStatusChange,
                    resetPwdDialogVisible,
                    resetPwdFormRef,
                    resetPwdForm,
                    resetPwdRules,
                    resetPassword,
                    confirmResetPassword,
                    deptDialogVisible,
                    editingDept,
                    deptForm,
                    openDeptDialog,
                    saveDepartment,
                    deleteDepartment,
                    handleDeptCommand,
                    goToRoles,
                    switchSidebarTab,
                    selectedEmployees,
                    importDialogVisible,
                    importAccountTypeConfig,
                    importDialogTitle,
                    handleSelectionChange,
                    batchSetStatus,
                    handleExport,
                    handleImportCommand,
                    downloadTemplate,
                    handleFileChange,
                    confirmImport
                };
            }
        };
</script>

<style scoped>
        .employees-page {
            min-height: 100%;
        }

        /* 统一页面布局高度 */
        .layout-container {
            height: calc(100vh - 200px);
        }

        .employees-page :deep(.el-tree-node__content) {
            height: 40px;
        }

        /* Custom Full Width Radio */
        .employees-page :deep(.el-radio-group.full-width-radio) {
            display: flex;
            width: 100%;
        }

        .employees-page :deep(.el-radio-group.full-width-radio .el-radio-button) {
            flex: 1;
            text-align: center;
        }

        .employees-page :deep(.el-radio-group.full-width-radio .el-radio-button__inner) {
            width: 100%;
            padding: 12px 0;
            display: block;
        }

        .search-filter-group {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            min-width: 0;
        }

        .search-action-group {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .search-result-summary {
            margin-left: auto;
        }

        .employee-filter-active {
            background: #E6F3F8;
            color: var(--app-color-primary);
            box-shadow: inset 0 0 0 1px #B8DDEA;
        }

        .employee-filter-idle:hover {
            background: #F0F7FB;
        }

        .employee-filter-icon-active {
            background: #D6ECF5;
            color: var(--app-color-primary);
        }

        .employee-theme-text {
            color: var(--app-color-primary);
        }

        .employee-org-tree :deep(.el-tree-node__content) {
            border-radius: 8px;
            transition: all 0.2s;
        }

        .employee-org-tree :deep(.el-tree-node__content:hover) {
            background: #f0f7fb;
            color: var(--app-color-primary);
        }

        .employee-org-tree :deep(.el-tree-node__content:hover .employee-tree-icon) {
            color: var(--app-color-primary);
        }

        .employee-org-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
            background: #E6F3F8;
            color: var(--app-color-primary);
            font-weight: 600;
        }

        .employee-org-tree :deep(.el-tree-node.is-current > .el-tree-node__content .employee-tree-icon) {
            color: var(--app-color-primary);
        }
    
</style>
