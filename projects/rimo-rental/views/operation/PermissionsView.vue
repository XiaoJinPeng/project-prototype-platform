<template>
<div class="permissions-page">
            

            <main class="flex flex-col">
                
                <div class="mb-4 shrink-0">
                    <el-button @click="goBack" plain>
                        <svg class="mr-1 w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" stroke-width="1.8"
                                stroke-linecap="round" stroke-linejoin="round" ></path>
                        </svg>返回
                    </el-button>
                </div>

                <div class="flex-1 flex min-h-0 gap-6">

                    
                    <div class="w-72 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div 
                            class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <span class="font-bold text-gray-700">角色列表</span>
                            <el-button type="primary" link icon="Plus" @click="openAddRoleDialog">新增</el-button>
                        </div>
                        <div class="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
                            <div v-for="role in roles" :key="role.id"
                                class="role-item p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                :class="{ 'active': currentRole.id === role.id }" @click="selectRole(role)">
                                <div class="flex justify-between items-start">
                                    <div>
                                        <div class="font-medium text-gray-800">{{ role.name }}</div>
                                        <div class="text-xs text-gray-400 mt-1 line-clamp-2">{{ role.description }}
                                        </div>
                                    </div>
                                    <div class="flex gap-1 ml-2 shrink-0">
                                        <el-tag v-if="role.isSystem" size="small" type="info">预设</el-tag>
                                        <el-tag v-if="role.type" size="small"
                                            :type="role.type === 'HEADQUARTERS' ? 'danger' : (role.type === 'STORE' ? 'warning' : 'success')"
                                            effect="plain">
                                            {{ getRoleTypeLabel(role.type) }}
                                        </el-tag>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    
                    <div 
                        class="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        
                        <div class="p-6 border-b border-gray-100">
                            <div class="flex justify-between items-start mb-4">
                                <div>
                                    <h2 class="text-xl font-bold text-gray-800 flex items-center">
                                        <el-icon class="mr-2 text-white">
                                            <UserFilled></UserFilled>
                                        </el-icon>
                                        {{ currentRole.name }}
                                        <el-tag v-if="currentRole.code" class="ml-2" type="info">{{ currentRole.code
                                            }}</el-tag>
                                    </h2>
                                    <p class="text-gray-500 text-sm mt-1">{{ currentRole.description }}</p>
                                </div>
                                <div class="space-x-3 flex items-center">
                                    
                                    <template v-if="!currentRole.isSystem">
                                        <el-tooltip content="编辑角色信息" placement="top">
                                            <el-button circle icon="Edit" @click="openEditRoleDialog"></el-button>
                                        </el-tooltip>
                                        <el-tooltip content="删除角色" placement="top">
                                            <el-button circle type="danger" plain icon="Delete"
                                                @click="deleteRole"></el-button>
                                        </el-tooltip>
                                        <el-divider direction="vertical"></el-divider>
                                    </template>

                                    <el-button @click="resetPermissions">重置</el-button>
                                    <el-button type="primary" @click="savePermissions">
                                        <el-icon class="mr-1">
                                            <Check></Check>
                                        </el-icon> 保存配置
                                    </el-button>
                                </div>
                            </div>

                            
                            <div class="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div class="text-sm font-bold text-blue-800 mb-3 flex items-center">
                                    <el-icon class="mr-1">
                                        <Key></Key>
                                    </el-icon> 业务线授权 (Business Scope Authorization)
                                </div>
                                <el-checkbox-group v-model="currentRole.scopes">
                                    <el-checkbox label="SHARING_ROUND">同站租还</el-checkbox>
                                    <el-checkbox label="SHARING_ONEWAY">甲租乙还</el-checkbox>
                                    <el-checkbox label="STORE_STANDARD">门市租车</el-checkbox>
                                    <el-checkbox label="STORE_24H">24h门市租车</el-checkbox>
                                    <el-checkbox label="GOV_FLEET">公务车</el-checkbox>
                                    <el-checkbox label="SYSTEM_GLOBAL">系统配置</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </div>

                        
                        <div class="flex-1 overflow-hidden flex flex-col">
                            <el-tabs v-model="activeTab" class="h-full flex flex-col custom-tabs" type="border-card">

                                <el-tab-pane label="分时-同站" name="SHARING_ROUND"
                                    :disabled="!currentRole.scopes.includes('SHARING_ROUND')">
                                    <div class="p-4 h-full overflow-y-auto custom-scroll">
                                        <permission-group title="订单管理" :permissions="permissions.SHARING_ROUND.ORDER"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="车辆与网点" :permissions="permissions.SHARING_ROUND.VEHICLE"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="定价策略" :permissions="permissions.SHARING_ROUND.PRICING"
                                            v-model="currentRole.permissions"></permission-group>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="分时-异地" name="SHARING_ONEWAY"
                                    :disabled="!currentRole.scopes.includes('SHARING_ONEWAY')">
                                    <div class="p-4 h-full overflow-y-auto custom-scroll">
                                        <permission-group title="调度管理"
                                            :permissions="permissions.SHARING_ONEWAY.DISPATCH"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="网点管理" :permissions="permissions.SHARING_ONEWAY.STATION"
                                            v-model="currentRole.permissions"></permission-group>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="门店-标准" name="STORE_STANDARD"
                                    :disabled="!currentRole.scopes.includes('STORE_STANDARD')">
                                    <div class="p-4 h-full overflow-y-auto custom-scroll">
                                        <permission-group title="订单业务" :permissions="permissions.STORE_STANDARD.ORDER"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="车辆整备" :permissions="permissions.STORE_STANDARD.VEHICLE"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="POS结算"
                                            :permissions="permissions.STORE_STANDARD.FINANCIAL"
                                            v-model="currentRole.permissions"></permission-group>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="门店-24H" name="STORE_24H"
                                    :disabled="!currentRole.scopes.includes('STORE_24H')">
                                    <div class="p-4 h-full overflow-y-auto custom-scroll">
                                        <permission-group title="自助设备监控" :permissions="permissions.STORE_24H.DEVICE"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="异常订单介入" :permissions="permissions.STORE_24H.ORDER"
                                            v-model="currentRole.permissions"></permission-group>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="公务车" name="GOV_FLEET"
                                    :disabled="!currentRole.scopes.includes('GOV_FLEET')">
                                    <div class="p-4 h-full overflow-y-auto custom-scroll">
                                        <permission-group title="审批流程" :permissions="permissions.GOV_FLEET.APPROVAL"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="月结账单" :permissions="permissions.GOV_FLEET.FINANCIAL"
                                            v-model="currentRole.permissions"></permission-group>
                                    </div>
                                </el-tab-pane>

                                <el-tab-pane label="系统配置" name="SYSTEM_GLOBAL"
                                    :disabled="!currentRole.scopes.includes('SYSTEM_GLOBAL')">
                                    <div class="p-4 h-full overflow-y-auto custom-scroll">
                                        <permission-group title="组织架构" :permissions="permissions.SYSTEM_GLOBAL.ORG"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="系统设置" :permissions="permissions.SYSTEM_GLOBAL.SETTINGS"
                                            v-model="currentRole.permissions"></permission-group>
                                        <permission-group title="安全与日志"
                                            :permissions="permissions.SYSTEM_GLOBAL.SECURITY"
                                            v-model="currentRole.permissions"></permission-group>
                                    </div>
                                </el-tab-pane>

                            </el-tabs>
                        </div>
                    </div>
                </div>
            </main>
            
            <el-dialog v-model="addRoleDialogVisible" :title="isEditRole ? '编辑角色' : '新增角色'" width="500px"
                destroy-on-close>
                <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-position="top">
                    
                    <el-form-item label="角色名称" prop="name">
                        <el-input v-model="roleForm.name" placeholder="例如：财务助理"></el-input>
                    </el-form-item>

                    
                    <el-form-item label="角色类型" prop="type">
                        <el-select v-model="roleForm.type" placeholder="请选择角色所属层级" style="width: 100%">
                            <el-option v-for="type in roleTypes" :key="type.value" :label="type.label"
                                :value="type.value">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    
                    <el-form-item label="角色描述" prop="description">
                        <el-input v-model="roleForm.description" type="textarea" :rows="3"
                            placeholder="简要描述该角色的职责范围..."></el-input>
                    </el-form-item>
                </el-form>
                <template #footer>
                    <div class="dialog-footer">
                        <el-button @click="addRoleDialogVisible = false">取消</el-button>
                        <el-button type="primary" @click="confirmRoleDialog">
                            {{ isEditRole ? '保存修改' : '确认创建' }}
                        </el-button>
                    </div>
                </template>
            </el-dialog>
        </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

// 权限组组件
        const PermissionGroup = {
            props: ['title', 'permissions', 'modelValue'],
            emits: ['update:modelValue'],
            template: `
                <div class="mb-6">
                    <h3 class="font-bold text-gray-700 mb-3 border-l-4 border-indigo-500 pl-3 leading-none">{{ title }}</h3>
                    <div class="grid grid-cols-3 gap-4">
                        <label v-for="perm in permissions" :key="perm.id" 
                            class="flex items-start p-3 rounded border border-gray-200 hover:border-indigo-300 hover:bg-gray-50 cursor-pointer transition-all">
                            <input type="checkbox" :value="perm.id" 
                                :checked="modelValue.includes(perm.id)"
                                @change="togglePermission(perm.id)"
                                class="mt-1 mr-2 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500">
                            <div>
                                <div class="font-medium text-gray-800 text-sm">{{ perm.name }}</div>
                                <div class="text-xs text-gray-400 mt-0.5">{{ perm.desc }}</div>
                            </div>
                        </label>
                    </div>
                </div>
            `,
            setup(props, { emit }) {
                const togglePermission = (id) => {
                    const newValue = [...props.modelValue];
                    const index = newValue.indexOf(id);
                    if (index > -1) {
                        newValue.splice(index, 1);
                    } else {
                        newValue.push(id);
                    }
                    emit('update:modelValue', newValue);
                };
                return { togglePermission };
            }
        };

export default {
            components: {
                PermissionGroup
            },
            setup() {
                const router = useRouter();
                // 图标注册
                const icons = [
                    'Van', 'Ticket', 'DocumentAdd', 'List', 'Document', 'PriceTag',
                    'Grid', 'ShoppingCart', 'Setting', 'Location', 'Briefcase',
                    'HomeFilled', 'Check', 'UserFilled', 'Lock', 'Key', 'Plus'
                ];

                // 模拟角色数据
                const roles = ref([
                    { id: 2, code: 'SYS_ADMIN', name: '系统管理员', description: '负责用户管理、系统参数配置及日志审计', isSystem: true, scopes: ['SYSTEM_GLOBAL'], permissions: ['sys.user.manage', 'sys.role.manage', 'sys.log.view'] },
                    { id: 3, code: 'STORE_MGR', name: '门市店长', description: '负责门店日常运营、车辆排程看板及订单处理', isSystem: false, type: 'STORE', scopes: ['STORE_STANDARD', 'STORE_24H'], permissions: ['store.order.view', 'store.order.create', 'store.order.edit'] },
                    { id: 4, code: 'SHARING_OPS', name: '分时运营经理', description: '负责分时租赁业务的运力调度及网点管理', isSystem: false, type: 'STATION', scopes: ['SHARING_ROUND', 'SHARING_ONEWAY'], permissions: ['sharing.monitor', 'sharing.remote'] },
                    { id: 5, code: 'FINANCE', name: '财务专员', description: '负责全业务线的营收核对与报表导出', isSystem: false, type: 'HEADQUARTERS', scopes: ['SHARING_ROUND', 'SHARING_ONEWAY', 'STORE_STANDARD', 'STORE_24H', 'GOV_FLEET'], permissions: ['store.financial.view', 'gov.financial.view'] }
                ]);

                // 模拟权限定义 (Permissions Definition)
                const permissions = reactive({
                    SHARING_ROUND: {
                        ORDER: [
                            { id: 'sharing.round.order.view', name: '查看订单', desc: '查看同站分时订单列表及详情' },
                            { id: 'sharing.round.order.finish', name: '强制还车', desc: '处理异常订单，强制结束计费' }
                        ],
                        VEHICLE: [
                            { id: 'sharing.round.vehicle.monitor', name: '状态监控', desc: '查看车辆位置、电量及状态' },
                            { id: 'sharing.round.vehicle.remote', name: '远程控车', desc: '远程开锁、关锁、鸣笛寻车' }
                        ],
                        PRICING: [
                            { id: 'sharing.round.pricing.view', name: '查看价格', desc: '查看分时计费规则' },
                            { id: 'sharing.round.pricing.edit', name: '修改费率', desc: '调整分时租赁价格表' }
                        ]
                    },
                    SHARING_ONEWAY: {
                        DISPATCH: [
                            { id: 'sharing.oneway.dispatch.view', name: '查看调度单', desc: '查看异地还车调度任务' },
                            { id: 'sharing.oneway.dispatch.create', name: '创建调度', desc: '手动创建车辆排程看板工单' }
                        ],
                        STATION: [
                            { id: 'sharing.oneway.station.manage', name: '网点管理', desc: '新增或调整还车网点围栏' }
                        ]
                    },
                    STORE_STANDARD: {
                        ORDER: [
                            { id: 'store.std.order.view', name: '查看订单', desc: '查看门市订单列表' },
                            { id: 'store.std.order.create', name: '新建订单', desc: '录入新的门市租赁订单' },
                            { id: 'store.std.order.edit', name: '编辑订单', desc: '修改订单信息、延期等' },
                            { id: 'store.std.order.delete', name: '删除订单', desc: '删除无效或测试订单' }
                        ],
                        VEHICLE: [
                            { id: 'store.std.vehicle.inspec', name: '整备检查', desc: '录入车辆整备、清洗记录' }
                        ],
                        FINANCIAL: [
                            { id: 'store.std.financial.pos', name: 'POS结算', desc: '处理线下POS机刷卡收款' },
                            { id: 'store.std.financial.auth', name: '预授权管理', desc: '发起或撤销信用卡预授权' }
                        ]
                    },
                    STORE_24H: {
                        DEVICE: [
                            { id: 'store.24h.device.monitor', name: '设备监控', desc: '监控自助钥匙柜及车辆状态' }
                        ],
                        ORDER: [
                            { id: 'store.24h.order.intervention', name: '人工介入', desc: '处理自助取还车过程中的异常' }
                        ]
                    },
                    GOV_FLEET: {
                        APPROVAL: [
                            { id: 'gov.approval.view', name: '查看审批', desc: '查看公务用车审批进度' },
                            { id: 'gov.approval.audit', name: '审批订单', desc: '审核公务用车申请' }
                        ],
                        FINANCIAL: [
                            { id: 'gov.financial.bill', name: '月结账单', desc: '生成企业客户月结对账单' }
                        ]
                    },
                    SYSTEM_GLOBAL: {
                        ORG: [
                            { id: 'sys.user.manage', name: '用户管理', desc: '新增、编辑、禁用后台账号' },
                            { id: 'sys.role.manage', name: '角色权限', desc: '配置角色及分配权限' }
                        ],
                        SETTINGS: [
                            { id: 'sys.setting.rule', name: '规则配置', desc: '修改全局租车规则及参数' }
                        ],
                        SECURITY: [
                            { id: 'sys.log.view', name: '日志审计', desc: '查看系统操作日志及安全审计' }
                        ]
                    }
                });

                const currentRole = ref(roles.value[0]);
                const activeTab = ref('SHARING_ROUND');

                const selectRole = (role) => {
                    // 深拷贝以模拟独立编辑状态
                    currentRole.value = JSON.parse(JSON.stringify(role));
                    // 自动切换到第一个有权限的Tab
                    if (role.scopes.length > 0) {
                        activeTab.value = role.scopes[0];
                    }
                };

                const createNewRole = () => {
                    const newRole = {
                        id: Date.now(),
                        name: '新角色',
                        description: '请设置角色描述',
                        isSystem: false,
                        scopes: [],
                        permissions: []
                    };
                    roles.value.push(newRole);
                    selectRole(newRole);
                };

                const savePermissions = () => {
                    // 模拟保存
                    const index = roles.value.findIndex(r => r.id === currentRole.value.id);
                    if (index !== -1) {
                        roles.value[index] = JSON.parse(JSON.stringify(currentRole.value));
                    }
                    ElMessage.success('权限配置已保存');
                };

                const resetPermissions = () => {
                    const original = roles.value.find(r => r.id === currentRole.value.id);
                    if (original) {
                        currentRole.value = JSON.parse(JSON.stringify(original));
                        ElMessage.info('已重置为保存状态');
                    }
                };

                // Add/Edit Role Dialog State
                const addRoleDialogVisible = ref(false);
                const isEditRole = ref(false); // Track mode
                const roleFormRef = ref(null);
                const roleForm = reactive({
                    name: '',
                    type: '',
                    description: ''
                });

                const roleTypes = [
                    { label: '营运 (Headquarters)', value: 'HEADQUARTERS' },
                    { label: '车行 (Provider)', value: 'PROVIDER' },
                    { label: '门市 (Store)', value: 'STORE' },
                    { label: '站点 (Station)', value: 'STATION' }
                ];

                const roleRules = {
                    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
                    type: [{ required: true, message: '请选择角色类型', trigger: 'change' }]
                };

                const getRoleTypeLabel = (type) => {
                    let label = '';
                    const typeObj = roleTypes.find(t => t.value === type);
                    return typeObj ? typeObj.label.split(' ')[0] : type;
                };

                const openAddRoleDialog = () => {
                    isEditRole.value = false;
                    roleForm.name = '';
                    roleForm.type = '';
                    roleForm.description = '';
                    addRoleDialogVisible.value = true;
                };

                const openEditRoleDialog = () => {
                    if (currentRole.value.isSystem) return;
                    isEditRole.value = true;
                    // Populate form with current role data
                    roleForm.name = currentRole.value.name;
                    roleForm.type = currentRole.value.type;
                    roleForm.description = currentRole.value.description;
                    addRoleDialogVisible.value = true;
                };

                const deleteRole = () => {
                    if (currentRole.value.isSystem) return;
                    ElMessageBox.confirm(
                        `确定要删除角色 "${currentRole.value.name}" 吗？此操作无法撤销。`,
                        '删除确认',
                        {
                            confirmButtonText: '确定删除',
                            cancelButtonText: '取消',
                            type: 'warning',
                        }
                    )
                        .then(() => {
                            const index = roles.value.findIndex(r => r.id === currentRole.value.id);
                            if (index !== -1) {
                                roles.value.splice(index, 1);
                                ElMessage.success('角色已删除');
                                // Switch to first available role
                                if (roles.value.length > 0) {
                                    selectRole(roles.value[0]);
                                }
                            }
                        })
                        .catch(() => { });
                };

                const confirmRoleDialog = async () => {
                    if (!roleFormRef.value) return;
                    await roleFormRef.value.validate((valid) => {
                        if (valid) {
                            if (isEditRole.value) {
                                // Update existing role
                                const targetRole = roles.value.find(r => r.id === currentRole.value.id);
                                if (targetRole) {
                                    targetRole.name = roleForm.name;
                                    targetRole.type = roleForm.type;
                                    targetRole.description = roleForm.description;

                                    // Also update current view
                                    currentRole.value.name = roleForm.name;
                                    currentRole.value.type = roleForm.type;
                                    currentRole.value.description = roleForm.description;

                                    // Optional: If type changed, maybe we should warn about scope reset? 
                                    // For now, let's keep scopes as is unless logic demands reset.
                                }
                                ElMessage.success('角色信息已更新');
                            } else {
                                // Create new role
                                const newRole = {
                                    id: Date.now(),
                                    name: roleForm.name,
                                    type: roleForm.type,
                                    description: roleForm.description || '暂无描述',
                                    isSystem: false,
                                    scopes: [],
                                    permissions: []
                                };

                                // Initialize default scopes based on type
                                if (newRole.type === 'HEADQUARTERS') newRole.scopes = ['SYSTEM_GLOBAL'];
                                if (newRole.type === 'STORE') newRole.scopes = ['STORE_STANDARD'];
                                if (newRole.type === 'STATION') newRole.scopes = ['SHARING_ROUND'];

                                roles.value.push(newRole);
                                selectRole(newRole);
                                ElMessage.success('角色创建成功');
                            }
                            addRoleDialogVisible.value = false;
                        }
                    });
                };

                const goBack = () => {
                    router.push('/operation/employees');
                };

                return {
                    roles,
                    currentRole,
                    activeTab,
                    permissions,
                    icons,
                    selectRole,
                    createNewRole,
                    savePermissions,
                    resetPermissions,
                    // New additions
                    addRoleDialogVisible,
                    isEditRole,
                    roleForm,
                    roleFormRef,
                    roleTypes,
                    roleRules,
                    getRoleTypeLabel,
                    openAddRoleDialog,
                    openEditRoleDialog,
                    deleteRole,
                    confirmRoleDialog,
                    goBack
                };
            }
        };
</script>

<style scoped>
        .permissions-page {
            min-height: 100%;
        }

        /* 角色列表选中态 */
        .role-item.active {
            background-color: #f0f9ff;
            border-left: 4px solid var(--app-color-primary);
        }

        .role-item {
            border-left: 4px solid transparent;
        }
    
</style>
