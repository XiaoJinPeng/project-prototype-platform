<template>
<main class="workbench-page relative">
<!-- Dashboard Content (Scrollable) -->
            <div class="space-y-6 custom-scroll">

                <!-- 模块 1：欢迎与动态数据头 -->
                <div
                    class="bg-white rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center card-shadow">
                    <div class="flex items-center gap-5 mb-6 lg:mb-0">
                        <el-avatar :size="72" class="border-2 border-blue-50">A</el-avatar>
                        <div>
                            <h2 class="text-2xl font-bold text-gray-800 tracking-tight">{{ greeting }}{{ userName }}
                            </h2>
                            <p class="text-sm text-gray-500 mt-2 flex items-center">
                                今日有 <span
                                    class="bg-blue-50 text-theme-primary font-bold px-2 py-0.5 rounded ml-1 mr-1">5</span>
                                台车辆需要交付，请关注待办事项。
                                <a href="#" class="text-theme-primary ml-3 hover:underline flex items-center text-xs">查看详情
                                    <el-icon class="ml-0.5">
                                        <ArrowRight />
                                    </el-icon></a>
                            </p>
                        </div>
                    </div>
                    <!-- 核心指标区 -->
                    <div class="flex gap-10">
                        <div class="text-center group cursor-pointer">
                            <div
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                今日待办事项
                                <span
                                    class="text-[10px] text-green-500 bg-green-50 px-1 rounded flex items-center"><el-icon>
                                        <Bottom />
                                    </el-icon>2项</span>
                            </div>
                            <div class="text-3xl font-bold text-red-500"><span
                                    class="text-sm font-normal mr-1 text-gray-400"></span>{{ todoDialogCounts.all }}
                            </div>
                        </div>
                        <div class="w-px bg-gray-100 hidden md:block"></div>
                        <div class="text-center group cursor-pointer">
                            <div
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                今日出租率
                                <span
                                    class="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><el-icon>
                                        <Top />
                                    </el-icon>3.5%</span>
                            </div>
                            <div class="text-3xl font-bold"
                                :class="metrics.rentalRate >= 80 ? 'text-green-600' : 'text-orange-500'">{{
                                metrics.rentalRate }}<span class="text-lg font-normal ml-0.5 text-gray-400">%</span>
                            </div>
                        </div>
                        <div class="w-px bg-gray-100 hidden md:block"></div>
                        <div class="text-center group cursor-pointer">
                            <div
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                在租/总车辆
                                <span
                                    class="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><el-icon>
                                        <Top />
                                    </el-icon>12台</span>
                            </div>
                            <div class="text-3xl font-bold text-theme-primary">{{ metrics.inRentCount }}<span
                                    class="text-lg font-normal text-gray-400">/{{ metrics.totalFleet }}</span></div>
                        </div>
                        <div class="w-px bg-gray-100 hidden md:block"></div>
                        <div class="text-center group cursor-pointer">
                            <div
                                class="text-sm text-gray-500 mb-1 group-hover:text-gray-800 transition-colors flex items-center justify-center gap-1">
                                本月营收
                                <span
                                    class="text-[10px] text-red-500 bg-red-50 px-1 rounded flex items-center"><el-icon>
                                        <Top />
                                    </el-icon>11.2%</span>
                            </div>
                            <div class="text-3xl font-bold text-gray-800"><span
                                    class="text-lg font-normal mr-1 text-gray-400">&yen;</span>{{ formattedRevenue }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 模块 1.5：深度业务 - 核心资产异常监控横幅 -->
                <div
                    class="bg-gradient-to-r from-red-50 via-orange-50 to-gray-50 rounded-xl p-0 flex items-center border border-red-100/50 card-shadow overflow-hidden">
                    <div class="bg-red-500 text-white px-4 py-3 text-sm font-bold flex items-center shrink-0">
                        <el-icon class="mr-1.5">
                            <Warning />
                        </el-icon>资产异常预警
                    </div>
                    <div class="flex-1 flex px-4 gap-8 overflow-x-auto whitespace-nowrap custom-scroll">
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-red-500 group-hover:animate-ping"></div>
                            <span class="text-sm text-gray-600 group-hover:text-red-600 transition-colors">事故定损：<strong
                                    class="text-red-600">{{ assetHealth.accident }}台</strong></span>
                        </div>
                        <div class="w-px bg-gray-200/50 h-4 my-auto"></div>
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-ping"></div>
                            <span
                                class="text-sm text-gray-600 group-hover:text-orange-600 transition-colors">维修中：<strong
                                    class="text-orange-600">{{ assetHealth.maintenance }}台</strong></span>
                        </div>
                        <div class="w-px bg-gray-200/50 h-4 my-auto"></div>
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-gray-400 group-hover:animate-ping"></div>
                            <span
                                class="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">GPS掉线：<strong
                                    class="text-gray-800">{{ assetHealth.offline }}台</strong></span>
                        </div>
                        <div class="w-px bg-gray-200/50 h-4 my-auto"></div>
                        <div class="flex items-center gap-2 cursor-pointer group">
                            <div class="w-2 h-2 rounded-full bg-yellow-500 group-hover:animate-ping"></div>
                            <span
                                class="text-sm text-gray-600 group-hover:text-yellow-600 transition-colors">闲置>5天：<strong
                                    class="text-yellow-600">{{ assetHealth.idle }}台</strong></span>
                        </div>
                    </div>
                    <div class="px-4 shrink-0">
                        <el-button link type="danger" size="small">立即处置 <el-icon class="ml-1">
                                <ArrowRight />
                            </el-icon></el-button>
                    </div>
                </div>

                <!-- 模块 2、3、4: 栅格主体 -->
                <div class="flex flex-col xl:flex-row gap-6">

                    <!-- 左侧栏 -->
                    <div class="xl:w-[22%] space-y-6 flex flex-col min-w-0">
                        <!-- 常用功能 -->
                        <div class="bg-white rounded-2xl p-5 card-shadow">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-theme-primary rounded-full mr-2"></span>
                                    常用功能
                                </h3>
                                <el-button link type="primary" size="small">编辑</el-button>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <div @click="router.push('/operation/new-order')"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div
                                        class="w-10 h-10 rounded-xl icon-blue flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <Ticket />
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">新建订单</span>
                                </div>
                                <div @click="router.push('/operation/dispatch')"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div
                                        class="w-10 h-10 rounded-xl icon-green flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <Van />
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">车辆排程</span>
                                </div>
                                <div @click="router.push('/operation/members')"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div
                                        class="w-10 h-10 rounded-xl icon-purple flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <User />
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">客户建档</span>
                                </div>
                                <div @click="router.push('/operation/dashboard')"
                                    class="flex flex-col items-center justify-center p-4 py-5 rounded-xl bg-gray-50/50 hover:bg-gray-100 border border-transparent hover:border-gray-200 cursor-pointer transition-all group">
                                    <div
                                        class="w-10 h-10 rounded-xl icon-orange flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                        <el-icon class="text-xl">
                                            <Odometer />
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-700 font-medium">运营大屏</span>
                                </div>
                            </div>
                        </div>

                        <!-- 最新公告 -->
                        <div class="latest-announcement-card card-shadow flex-1">
                            <div class="flex items-center justify-between mb-5">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-orange-400 rounded-full mr-2"></span>
                                    最新公告
                                </h3>
                                <a href="#" class="text-xs text-gray-400 hover:text-theme-primary"
                                    @click.prevent="openAnnouncementCenter">更多 ></a>
                            </div>
                            <div>
                                <div v-for="(item, idx) in featuredAnnouncements" :key="item.id"
                                    class="latest-announcement-item group" :class="{ 'is-primary': idx === 0 }"
                                    @click="openAnnouncementDetail(item)">
                                    <div class="latest-announcement-dot"></div>
                                    <div class="flex-1">
                                        <div class="latest-announcement-title group-hover:text-theme-primary line-clamp-1">
                                            {{ item.title }}
                                        </div>
                                        <div class="latest-announcement-summary line-clamp-2">{{ getAnnouncementPreview(item, 48) }}</div>
                                        <div class="latest-announcement-meta">
                                            <span v-if="idx === 0" class="latest-announcement-badge">置顶</span>
                                            <span>{{ item.date }} | {{ item.publisher }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 中间栏 核心工作流 -->
                    <div class="xl:w-[53%] space-y-6 flex flex-col min-w-0">
                        <!-- 待办事项 -->
                        <div class="bg-white rounded-2xl card-shadow overflow-hidden flex flex-col">
                            <div class="px-6 pt-5 pb-1 flex items-center justify-between">
                                <h3 class="font-bold text-gray-800 text-lg flex items-center">
                                    <el-icon class="mr-2 text-theme-primary">
                                        <List />
                                    </el-icon>
                                    待办事项
                                    <span
                                        class="ml-2 font-normal text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{{
                                        todoDialogCounts.all }}</span>
                                </h3>
                                <a href="#" class="text-xs text-gray-400 hover:text-theme-primary flex items-center"
                                    @click.prevent="todoDialogVisible = true; todoDialogTab = 'all'">全部
                                    <el-icon class="ml-1">
                                        <ArrowRight />
                                    </el-icon></a>
                            </div>
                            <div class="px-4 workbench-tabs">
                                <el-tabs v-model="todoTab">
                                    <el-tab-pane :label="`待处理 (${todoDialogCounts.pending})`"
                                        name="pending"></el-tab-pane>
                                    <el-tab-pane :label="`车况/车机异常 (${todoDialogCounts.exception})`"
                                        name="exception"></el-tab-pane>
                                    <el-tab-pane :label="`调度/整备 (${todoDialogCounts.dispatch})`"
                                        name="dispatch"></el-tab-pane>
                                    <el-tab-pane :label="`超期提醒 (${todoDialogCounts.overdue})`"
                                        name="overdue"></el-tab-pane>
                                </el-tabs>
                            </div>

                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'pending'">
                                <!-- 待办卡片 1 -->
                                <div
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="primary"
                                            effect="plain">新进</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-theme-primary">
                                            <el-icon class="text-xl">
                                                <UserFilled />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">企业资质审核 - 和运科技</div>
                                            <div class="text-xs text-gray-500 mt-0.5">申请人: 李经理 | 10分钟前</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        新注册企业客户请求开通企业月结白名单。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" size="small" class="flex-1">立即审核</el-button>
                                        <el-button plain size="small" class="flex-1">查看资料</el-button>
                                    </div>
                                </div>

                                <!-- 待办卡片 2 -->
                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">紧急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <WarningFilled />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">客户退款审核</div>
                                            <div class="text-xs text-gray-500 mt-0.5">订单: R-202611-0021 | 2小时前</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        因门店缺车导致取消订单，申请全额退款及补偿 100元。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-popconfirm title="确认全额退款及补偿 100元？" confirm-button-text="确定"
                                            cancel-button-text="取消" width="220" @confirm="$message.success('已确认退款')">
                                            <template #reference>
                                                <el-button type="danger" plain size="small"
                                                    class="flex-1">确认退款</el-button>
                                            </template>
                                        </el-popconfirm>
                                        <el-button plain size="small" class="flex-1">驳回</el-button>
                                    </div>
                                </div>

                                <!-- 待办卡片 3 -->
                                <div
                                    class="border border-green-100 bg-gradient-to-br from-green-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <el-icon class="text-xl">
                                                <Van />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">派车方案待审核</div>
                                            <div class="text-xs text-gray-500 mt-0.5">门店: 台北信义门店 | 3小时前</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs truncate">
                                        台北信义门店周末 GL8 订单集中，需要确认本店车辆派车优先级。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-popconfirm title="确认采用此派车方案？" confirm-button-text="确认派车"
                                            cancel-button-text="取消" width="220" @confirm="$message.success('派车方案已确认')">
                                            <template #reference>
                                                <el-button type="success" plain size="small"
                                                    class="flex-1">确认派车</el-button>
                                            </template>
                                        </el-popconfirm>
                                        <el-button plain size="small" class="flex-1">查看单据</el-button>
                                    </div>
                                </div>

                                <!-- 待办卡片 4 -->
                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">紧急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Document />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">紧急工单待处理</div>
                                            <div class="text-xs text-gray-500 mt-0.5">工单提醒 | 2024/05/05 11:11</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        [客服主管-张明] 刚刚提交了一笔 [紧急] 工单要求减免超时费，限时2小时内处理！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">立即处理</el-button>
                                        <el-button plain size="small" class="flex-1">查看工单</el-button>
                                    </div>
                                </div>
                            </div>

                            <!-- 车况/车机异常 Tab 数据 -->
                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'exception'">
                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">紧急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <WarningFilled />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">车辆事故上报</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车牌: 浙A·88888 | 2小时前</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        客户反馈沿途发生追尾事故，车辆无法受控，需安排救援拖车服务。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">安排救援</el-button>
                                        <el-button plain size="small" class="flex-1">联系保险</el-button>
                                    </div>
                                </div>
                                <div
                                    class="border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">车况异常</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                            <el-icon class="text-xl">
                                                <PictureRounded />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">车况异常反馈待审核</div>
                                            <div class="text-xs text-gray-500 mt-0.5">订单: ZT24050500003 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500003, [车况异常反馈] 客户在取车环节上传了车辆剐蹭照片，请人工审核定损单！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">审核定损</el-button>
                                        <el-button plain size="small" class="flex-1">查看照片</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-yellow-100 bg-gradient-to-br from-yellow-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">管控中</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                            <el-icon class="text-xl">
                                                <Lightning />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">车辆电压低自动管控</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 车辆电压较低，已自动管控3天(单号GC889)，管控内有5笔订单待处理！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">查看管控</el-button>
                                        <el-button plain size="small" class="flex-1">处理订单</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">掉线</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Connection />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">车机掉线自动管控</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 车辆车机掉线，已自动管控1天(单号GC890)，管控内有5笔订单待处理！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">查看管控</el-button>
                                        <el-button plain size="small" class="flex-1">联系维保</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="success"
                                            effect="plain">已恢复</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <el-icon class="text-xl">
                                                <CircleCheck />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">车机恢复在线</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 车机恢复在线，已自动解除管控(单号GC889)！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">解除复核</el-button>
                                        <el-button plain size="small" class="flex-1">查看记录</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">需寻车</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Location />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">定位长时间无上报</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 车辆已超过1小时无最新定位上报，请指派寻车！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">指派寻车</el-button>
                                        <el-button plain size="small" class="flex-1">查看轨迹</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">疑似故障</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <WarningFilled />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">车机异常断电</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 车机发生异常断电，疑似蓄电池故障，请指派维保！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">指派维保</el-button>
                                        <el-button plain size="small" class="flex-1">查看电池</el-button>
                                    </div>
                                </div>
                            </div>

                            <!-- 调度/整备 Tab 数据 -->
                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'dispatch'" style="display: none;">
                                <div
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <el-icon class="text-xl">
                                                <Van />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">人工调度确认</div>
                                            <div class="text-xs text-gray-500 mt-0.5">门店: 虹桥高铁站店 | 1小时前</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        虹桥高铁站店周末预订高峰，需要确认本店可交付车辆和人工派车方案。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-popconfirm title="确认采用此人工调度方案？" confirm-button-text="确认方案"
                                            cancel-button-text="取消" width="220" @confirm="$message.success('已确认调度方案')">
                                            <template #reference>
                                                <el-button type="primary" size="small" class="flex-1">确认方案</el-button>
                                            </template>
                                        </el-popconfirm>
                                        <el-button plain size="small" class="flex-1">查看库存</el-button>
                                    </div>
                                </div>
                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">紧急</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Brush />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">交车整备告警</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车牌: 沪A·12345 | 距离交车: 2小时</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        待交付车辆尚未录入洗车整备记录，即将超期，请催促整备专员完成作业。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">下发催办</el-button>
                                        <el-button plain size="small" class="flex-1">转交他人</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <el-icon class="text-xl">
                                                <Setting />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">保养里程达标</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 车辆已达到预设保养里程 (50,000km)，请安排进厂维保！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" size="small" class="flex-1">安排进厂</el-button>
                                        <el-button plain size="small" class="flex-1">查看档案</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <el-icon class="text-xl">
                                                <Calendar />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">年度保养到期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 车辆已达到预设年度保养时间，请安排进厂维保！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" plain size="small" class="flex-1">安排保养</el-button>
                                        <el-button plain size="small" class="flex-1">查看计划</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-purple-100 bg-gradient-to-br from-purple-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                            <el-icon class="text-xl">
                                                <Stamp />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">年检临期预警</div>
                                            <div class="text-xs text-gray-500 mt-0.5">剩余: 7天 | 共3台车</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        检测到有一批公牌营运车辆年检即将到期，请尽快发派代理公司办理全部年检手续。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" plain size="small" class="flex-1">查看车辆批次</el-button>
                                        <el-button plain size="small" class="flex-1">指派代办</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-green-100 bg-gradient-to-br from-green-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <el-icon class="text-xl">
                                                <Brush />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">深度清洁任务</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 累计租借达5次，已触发深度清洁任务指标，请安排！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">安排清洁</el-button>
                                        <el-button plain size="small" class="flex-1">查看记录</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <el-icon class="text-xl">
                                                <Brush />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">日常清洁触发</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 结束跨城长单，已触发日常小清洁指标，请安排！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">安排清洁</el-button>
                                        <el-button plain size="small" class="flex-1">查看订单</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-orange-100 bg-gradient-to-br from-orange-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">停车超时</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <el-icon class="text-xl">
                                                <Location />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">停车超时提醒</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车辆: RDC-1234 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        RDC-1234, 停靠在台北内湖VIP库已达6小时未动，请确认是否移库！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">确认移库</el-button>
                                        <el-button plain size="small" class="flex-1">查看位置</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">预警</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Warning />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">网点车位预警</div>
                                            <div class="text-xs text-gray-500 mt-0.5">网点: 重庆江北T3 | 2024/05/05 11:11
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        [预警] 重庆江北T3网点，已停入12辆车，剩余0车位，即将引发还车阻塞！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" plain size="small" class="flex-1">安排移库</el-button>
                                        <el-button plain size="small" class="flex-1">查看网点</el-button>
                                    </div>
                                </div>
                            </div>

                            <!-- 超期提醒 Tab 数据 -->
                            <div class="p-5 pt-2 grid grid-cols-2 gap-4 todo-panel custom-scroll"
                                v-show="todoTab === 'overdue'" style="display: none;">
                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">严重逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Timer />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">订单严重逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">订单: ZT24050500001 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500001, [严重逾期] 车辆已超过预计还车时间 2小时，多次联系客户未果，请调度介入！
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">指派调度</el-button>
                                        <el-button plain size="small" class="flex-1">查看订单</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="info"
                                            effect="plain">轻微逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                            <el-icon class="text-xl">
                                                <Timer />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">订单轻微逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">订单: ZT24050500001 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500001, [轻微逾期] 车辆已超过预计还车时间 15分钟，请注意跟进客户状态。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="primary" plain size="small" class="flex-1">提醒客户</el-button>
                                        <el-button plain size="small" class="flex-1">查看订单</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-orange-100 bg-gradient-to-br from-orange-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">中度逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <el-icon class="text-xl">
                                                <Timer />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">订单中度逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">订单: ZT24050500001 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500001, [中度逾期] 车辆已超过预计还车时间 1小时，已自动发送扣费提醒短信。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">跟进客户</el-button>
                                        <el-button plain size="small" class="flex-1">查看短信</el-button>
                                    </div>
                                </div>

                                <div
                                    class="border border-green-100 bg-gradient-to-br from-green-50/60 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="success"
                                            effect="plain">即将逾期</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                            <el-icon class="text-xl">
                                                <Timer />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">订单即将逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">订单: ZT24050500002 | 2024/05/05
                                                11:11</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        ZT24050500002, [即将逾期] 车辆距离预计还车时间仅剩 30分钟，系统已预触发还车节点。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="success" plain size="small" class="flex-1">提前提醒</el-button>
                                        <el-button plain size="small" class="flex-1">查看订单</el-button>
                                    </div>
                                </div>
                                <div
                                    class="border border-red-100 bg-gradient-to-br from-red-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="danger"
                                            effect="plain">超期2天</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                            <el-icon class="text-xl">
                                                <Timer />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">车辆超期未还</div>
                                            <div class="text-xs text-gray-500 mt-0.5">车牌: 苏A·66666 | 订单: R-0033</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        应还时间 6月3日 18:00，已超期联系不上客户，需立案启动风控寻车。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="danger" size="small" class="flex-1">启动寻车</el-button>
                                        <el-button plain size="small" class="flex-1">催收记录</el-button>
                                    </div>
                                </div>
                                <div
                                    class="border border-orange-100 bg-gradient-to-br from-orange-50/50 to-white rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                                    <div class="absolute right-3 top-3"><el-tag size="small" type="warning"
                                            effect="plain">逾期5天</el-tag></div>
                                    <div class="flex items-center gap-3 mb-3 mt-1">
                                        <div
                                            class="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                            <el-icon class="text-xl">
                                                <DocumentDelete />
                                            </el-icon>
                                        </div>
                                        <div class="flex-1">
                                            <div class="text-sm font-bold text-gray-800">企业账单逾期</div>
                                            <div class="text-xs text-gray-500 mt-0.5">客户: 特斯拉 | 账期: 5月</div>
                                        </div>
                                    </div>
                                    <div
                                        class="text-sm text-gray-600 mb-4 bg-white p-2 border border-gray-100 rounded text-xs">
                                        5月对账结算单 152,000元 逾期未支付，系统已暂停新单配额白名单。
                                    </div>
                                    <div class="flex gap-2">
                                        <el-button type="warning" plain size="small" class="flex-1">发送催缴单</el-button>
                                        <el-button plain size="small" class="flex-1">线下电联沟通</el-button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 日程安排 (车辆交还日历) -->
                        <div class="bg-white rounded-2xl p-5 card-shadow flex-1">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-purple-500 rounded-full mr-2"></span>
                                    今日排车日程 ({{ scheduleDate }} {{ weekDay }})
                                </h3>
                                <div class="flex gap-2">
                                    <el-button size="small" circle icon="ArrowLeft"></el-button>
                                    <el-button size="small" plain>今天</el-button>
                                    <el-button size="small" circle icon="ArrowRight"></el-button>
                                </div>
                            </div>
                            <!-- 简易日程轴展示 -->
                            <div class="grid grid-cols-4 gap-2 h-[180px]">
                                <!-- 栏目：早班 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">08:00 -
                                        12:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <div
                                            class="bg-blue-100/50 border-l-4 border-blue-500 p-2 rounded text-xs cursor-pointer hover:bg-blue-100">
                                            <div class="font-bold text-blue-700">交车 10台</div>
                                            <div class="text-gray-500 mt-1">2024年度商务用...</div>
                                            <div class="text-gray-400 mt-1">09:30 虹桥店</div>
                                        </div>
                                        <div
                                            class="bg-green-100/50 border-l-4 border-green-500 p-2 rounded text-xs cursor-pointer hover:bg-green-100">
                                            <div class="font-bold text-green-700">还车 3台</div>
                                            <div class="text-gray-500 mt-1">个人短租散单</div>
                                            <div class="text-gray-400 mt-1">11:00 市区店</div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 栏目：中午 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">12:00 -
                                        14:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <div
                                            class="bg-orange-100/50 border-l-4 border-orange-500 p-2 rounded text-xs cursor-pointer hover:bg-orange-100">
                                            <div class="font-bold text-orange-700">维保接车 2台</div>
                                            <div class="text-gray-500 mt-1">定期小保养</div>
                                            <div class="text-gray-400 mt-1">13:30 维修厂</div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 栏目：下午 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">14:00 -
                                        18:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <div
                                            class="bg-purple-100/50 border-l-4 border-purple-500 p-2 rounded text-xs cursor-pointer hover:bg-purple-100">
                                            <div class="font-bold text-purple-700">调派接车 5台</div>
                                            <div class="text-gray-500 mt-1">新购微型电车入库</div>
                                            <div class="text-gray-400 mt-1">15:00 总仓</div>
                                        </div>
                                        <div
                                            class="bg-red-100/50 border-l-4 border-red-500 p-2 rounded text-xs cursor-pointer hover:bg-red-100">
                                            <div class="font-bold text-red-700">事故定损 1台</div>
                                            <div class="text-gray-500 mt-1">保险公司现场核验</div>
                                            <div class="text-gray-400 mt-1">16:30 虹桥店</div>
                                        </div>
                                    </div>
                                </div>
                                <!-- 栏目：晚间 -->
                                <div class="bg-gray-50 rounded-lg p-2 flex flex-col">
                                    <div class="text-xs font-bold text-gray-400 text-center mb-2 pb-2 border-b">18:00 -
                                        24:00</div>
                                    <div class="space-y-2 overflow-y-auto custom-scroll flex-1 pr-1">
                                        <!-- 无数据 -->
                                        <div class="flex items-center justify-center h-full text-xs text-gray-300">
                                            暂无日程安排</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧栏 -->
                    <div class="xl:w-[25%] space-y-6 flex flex-col min-w-0">
                        <!-- 运营 Banner 轮播 -->
                        <el-carousel height="160px" :interval="5000" arrow="hover" indicator-position="none"
                            class="rounded-2xl overflow-hidden card-shadow">
                            <el-carousel-item v-for="(banner, idx) in banners" :key="idx">
                                <div :class="'bg-gradient-to-r ' + banner.gradient"
                                    class="rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full">
                                    <div class="relative z-10">
                                        <h3
                                            class="text-lg font-bold mb-2 break-all group-hover:-translate-y-1 transition-transform">
                                            {{ banner.title }}</h3>
                                        <p
                                            class="text-xs text-white/80 leading-relaxed mb-4 group-hover:-translate-y-1 transition-transform delay-75 line-clamp-2">
                                            {{ banner.desc }}</p>
                                        <el-button round size="small"
                                            class="bg-white/20 border-white/30 text-white hover:bg-white hover:text-gray-800 transition-colors">{{
                                            banner.btnText }}</el-button>
                                    </div>
                                    <div class="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl">
                                    </div>
                                    <div class="absolute -left-4 -top-4 w-24 h-24 rounded-full bg-white/20 blur-xl">
                                    </div>
                                    <div
                                        class="absolute right-2 top-4 text-7xl opacity-10 group-hover:scale-110 transition-transform group-hover:rotate-12 duration-500">
                                        <el-icon>
                                            <component :is="banner.icon" />
                                        </el-icon>
                                    </div>
                                </div>
                            </el-carousel-item>
                        </el-carousel>

                        <!-- 业务支撑应用导航 -->
                        <div class="bg-white rounded-2xl p-5 card-shadow flex-1">
                            <div class="flex items-center justify-between mb-5">
                                <h3 class="font-bold text-gray-800 flex items-center">
                                    <span class="w-1 h-4 bg-teal-500 rounded-full mr-2"></span>
                                    业务支撑模块
                                </h3>
                                <div class="flex gap-2">
                                    <el-button circle size="small" icon="Setting" @click="settingDialogVisible = true"
                                        title="自定义模块布局"></el-button>
                                    <a href="#" class="text-xs text-gray-400 hover:text-theme-primary leading-loose">更多应用
                                        ></a>
                                </div>
                            </div>

                            <!-- 九宫格应用市场样式 -->
                            <div class="grid grid-cols-3 gap-y-6 gap-x-2">
                                <RouterLink v-for="app in selectedApps" :key="app.id" :to="app.href"
                                    class="flex flex-col items-center cursor-pointer group"
                                    style="text-decoration: none;">
                                    <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center mb-2 group-hover:shadow-md group-hover:-translate-y-1 transition-all"
                                        :class="app.color">
                                        <el-icon class="text-2xl">
                                            <component :is="app.icon" />
                                        </el-icon>
                                    </div>
                                    <span class="text-xs text-gray-600 font-medium">{{ app.name }}</span>
                                </RouterLink>
                                <div v-if="selectedApps.length === 0"
                                    class="col-span-3 text-xs text-gray-400 text-center py-4">
                                    暂无模块，请点击右上角齿轮进行配置。
                                </div>
                            </div>

                            <div class="mt-8 border-t border-dashed border-gray-200 pt-4">
                                <div class="text-xs text-gray-400 mb-3 font-medium">最近访问</div>
                                <div class="flex gap-2 flex-wrap">
                                    <RouterLink v-for="page in recentPages" :key="page.href" :to="page.href"
                                        style="text-decoration: none;">
                                        <el-tag size="small" type="info" class="cursor-pointer hover:bg-gray-200">{{
                                            page.name }}</el-tag>
                                    </RouterLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 待办事项总览弹窗 -->
                <el-dialog v-model="todoDialogVisible" width="980px" class="todo-dialog" append-to-body>
                    <template #header>
                        <div class="flex items-center justify-between gap-3">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-10 h-10 rounded-xl bg-blue-50 text-theme-primary flex items-center justify-center">
                                    <el-icon class="text-xl">
                                        <List />
                                    </el-icon>
                                </div>
                                <div>
                                    <div class="text-base font-semibold text-gray-800">待办事项总览</div>
                                    <div class="text-xs text-gray-500">集中处理异常、调度与超期提醒</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <el-button size="small" plain @click="todoDialogTab = 'all'">重置筛选</el-button>
                                <el-button size="small" type="primary"
                                    @click="todoDialogVisible = false">标记已读</el-button>
                            </div>
                        </div>
                    </template>
                    <div class="px-2 -mx-2">
                        <el-tabs v-model="todoDialogTab" class="workbench-tabs">
                            <el-tab-pane :label="`全部 (${todoDialogCounts.all})`" name="all"></el-tab-pane>
                            <el-tab-pane :label="`待处理 (${todoDialogCounts.pending})`" name="pending"></el-tab-pane>
                            <el-tab-pane :label="`车况/车机异常 (${todoDialogCounts.exception})`"
                                name="exception"></el-tab-pane>
                            <el-tab-pane :label="`调度/整备 (${todoDialogCounts.dispatch})`" name="dispatch"></el-tab-pane>
                            <el-tab-pane :label="`超期提醒 (${todoDialogCounts.overdue})`" name="overdue"></el-tab-pane>
                        </el-tabs>
                    </div>
                    <div class="mt-3 max-h-[520px] overflow-y-auto custom-scroll pr-1">
                        <div class="grid grid-cols-2 gap-4">
                            <div v-for="item in filteredTodoDialogItems" :key="item.id"
                                class="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                                <div class="flex items-start justify-between gap-3 mb-2">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 flex-wrap">
                                            <span class="text-sm font-semibold text-gray-800">{{ item.title }}</span>
                                            <el-tag v-if="item.badge" size="small" :type="item.badgeType"
                                                effect="plain">{{ item.badge }}</el-tag>
                                        </div>
                                        <div class="text-xs text-gray-500 mt-1">{{ item.meta }}</div>
                                    </div>
                                </div>
                                <div class="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded p-2">
                                    {{ item.desc }}
                                </div>
                                <div class="mt-3 flex gap-2">
                                    <el-button size="small" :type="item.primaryType || 'primary'" class="flex-1"
                                        @click="handleDialogAction(item.primaryAction, item)">{{ item.primaryAction
                                        }}</el-button>
                                    <el-button size="small" plain class="flex-1"
                                        @click="handleDialogAction(item.secondaryAction, item)">{{ item.secondaryAction
                                        }}</el-button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="todoDialogVisible = false">关闭</el-button>
                            <el-button type="primary" @click="todoDialogVisible = false">完成处理</el-button>
                        </span>
                    </template>
                </el-dialog>

                <!-- 公告中心弹窗 -->
                <el-dialog v-model="announcementDialogVisible" width="760px" class="announcement-dialog" append-to-body>
                    <template #header>
                        <div class="announcement-dialog-header">
                            <div class="announcement-dialog-title">更多公告</div>
                            <div class="announcement-dialog-sub">共 {{ filteredAnnouncements.length }} 条公告</div>
                        </div>
                    </template>
                    <div class="announcement-search-wrap">
                        <el-input v-model="announcementKeyword" size="small" clearable
                            placeholder="搜索公告标题 / 内容 / 发布人" class="w-full">
                            <template #prefix>
                                <el-icon>
                                    <Search />
                                </el-icon>
                            </template>
                        </el-input>
                    </div>
                    <div class="announcement-list-wrap custom-scroll">
                        <div v-for="item in filteredAnnouncements" :key="item.id"
                            class="announcement-list-item"
                            @click="openAnnouncementDetail(item)">
                            <div class="announcement-list-title">{{ item.title }}</div>
                            <div class="announcement-list-summary line-clamp-2">{{ getAnnouncementPreview(item, 90) }}</div>
                            <div class="announcement-list-meta">{{ item.date }} | {{ item.publisher }}</div>
                        </div>
                        <div v-if="filteredAnnouncements.length === 0" class="announcement-empty">
                            暂无符合条件的公告
                        </div>
                    </div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="announcementDialogVisible = false">关闭</el-button>
                        </span>
                    </template>
                </el-dialog>

                <!-- 公告详情弹窗 -->
                <el-dialog v-model="announcementDetailVisible" width="760px" class="announcement-detail-dialog"
                    append-to-body>
                    <template #header>
                        <div class="announcement-dialog-header">
                            <div class="announcement-dialog-title">
                                {{ activeAnnouncement ? activeAnnouncement.title : '公告详情' }}
                            </div>
                            <div class="announcement-dialog-sub">公告详情</div>
                        </div>
                    </template>
                    <div v-if="activeAnnouncement" class="announcement-detail-content-box">
                        <div class="announcement-detail-meta">
                            发布时间 {{ activeAnnouncement.date }} | 发布人 {{ activeAnnouncement.publisher }}
                        </div>
                        <div class="announcement-detail-content">
                            {{ activeAnnouncement.content }}
                        </div>
                    </div>
                    <div v-else class="text-xs text-gray-400 py-4">暂无公告详情</div>
                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="announcementDetailVisible = false">关闭</el-button>
                        </span>
                    </template>
                </el-dialog>

                <!-- P1-14 自定义九宫格弹窗 -->
                <el-dialog v-model="settingDialogVisible" title="自定义主页应用模块" width="640px" append-to-body>
                    <div class="text-sm text-gray-500 mb-4">您可以从系统应用池中，拖拽或勾选最多 8 个功能模块到您的个人工作台。</div>

                    <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <div class="text-xs text-gray-500">已选模块 ({{ selectedApps.length }}/{{ maxSelectedApps }})
                            </div>
                            <el-button link size="small" type="primary" @click="resetAppSelection">恢复默认</el-button>
                        </div>
                        <div v-if="selectedApps.length" class="flex flex-wrap gap-2">
                            <div v-for="app in selectedApps" :key="app.id"
                                class="flex items-center gap-1.5 px-2 py-1.5 rounded-full border text-xs cursor-move transition"
                                :class="dragAppId === app.id ? 'border-theme-primary bg-blue-50' : 'border-gray-200 bg-white'"
                                draggable="true" @dragstart="handleDragStart(app.id)" @dragover.prevent
                                @drop="handleDrop(app.id)" @dragend="handleDragEnd">
                                <el-icon class="text-sm text-theme-primary">
                                    <component :is="app.icon" />
                                </el-icon>
                                <span class="text-gray-700">{{ app.name }}</span>
                                <el-icon class="text-sm text-gray-400 hover:text-red-500"
                                    @click.stop="removeApp(app.id)">
                                    <Close />
                                </el-icon>
                            </div>
                        </div>
                        <div v-else class="text-xs text-gray-400 py-2">尚未选择模块。</div>
                    </div>

                    <div>
                        <div class="text-xs text-gray-500 mb-3">系统应用池</div>
                        <div class="grid grid-cols-2 gap-3">
                            <div v-for="app in allApps" :key="app.id"
                                class="flex items-center justify-between p-3 rounded-lg border cursor-pointer transition"
                                :class="selectedAppIds.includes(app.id) ? 'border-theme-primary bg-blue-50/60' : 'border-gray-200 hover:border-gray-300'"
                                @click="toggleAppSelection(app.id)">
                                <div class="flex items-center gap-3">
                                    <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="app.color">
                                        <el-icon class="text-lg">
                                            <component :is="app.icon" />
                                        </el-icon>
                                    </div>
                                    <div>
                                        <div class="text-sm font-medium text-gray-700">{{ app.name }}</div>
                                        <div class="text-xs text-gray-400">{{ app.category }}</div>
                                    </div>
                                </div>
                                <el-checkbox :model-value="selectedAppIds.includes(app.id)" @click.stop
                                    @change="(val) => toggleAppSelection(app.id, val)"></el-checkbox>
                            </div>
                        </div>
                    </div>

                    <template #footer>
                        <span class="dialog-footer">
                            <el-button @click="settingDialogVisible = false">取消</el-button>
                            <el-button type="primary" @click="saveAppSelection">保存配置</el-button>
                        </span>
                    </template>
                </el-dialog>

            </div>
</main>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

export default {
            setup() {
                const router = useRouter();
                const todoTab = ref('pending');
                const todoDialogVisible = ref(false);
                const todoDialogTab = ref('all');
                const todoDialogItems = ref([
                    {
                        id: 'pending-1',
                        group: 'pending',
                        title: '企业资质审核 - 和运科技',
                        meta: '待处理 | 申请人: 李经理 | 10分钟前',
                        desc: '新注册企业客户请求开通企业月结白名单。',
                        badge: '待处理',
                        badgeType: 'info',
                        primaryAction: '立即审核',
                        secondaryAction: '查看资料',
                        primaryType: 'primary'
                    },
                    {
                        id: 'pending-2',
                        group: 'pending',
                        title: '客户退款审核',
                        meta: '待处理 | 订单: R-202611-0021 | 2小时前',
                        desc: '因门店缺车导致取消订单，申请全额退款及补偿 100元。',
                        badge: '紧急',
                        badgeType: 'danger',
                        primaryAction: '确认退款',
                        secondaryAction: '驳回',
                        primaryType: 'danger'
                    },
                    {
                        id: 'pending-3',
                        group: 'pending',
                        title: '派车方案待审核',
                        meta: '待处理 | 门店: 台北信义门店 | 3小时前',
                        desc: '台北信义门店周末 GL8 订单集中，需要确认本店车辆派车优先级。',
                        badge: '调度',
                        badgeType: 'success',
                        primaryAction: '确认派车',
                        secondaryAction: '查看库存',
                        primaryType: 'success'
                    },
                    {
                        id: 'pending-6',
                        group: 'pending',
                        title: '紧急工单待处理',
                        meta: '工单提醒 | 2024/05/05 11:11',
                        desc: '[客服主管-张明] 刚刚提交了一笔 [紧急] 工单要求减免超时费，限时2小时内处理！',
                        badge: '紧急',
                        badgeType: 'danger',
                        primaryAction: '立即处理',
                        secondaryAction: '查看工单',
                        primaryType: 'danger'
                    },

                    {
                        id: 'exception-2',
                        group: 'exception',
                        title: '车辆事故上报',
                        meta: '车况/车机异常 | 车牌: 浙A·88888 | 2小时前',
                        desc: '客户反馈沿途发生追尾事故，车辆无法受控，需安排救援拖车服务。',
                        badge: '紧急',
                        badgeType: 'danger',
                        primaryAction: '安排救援',
                        secondaryAction: '联系保险',
                        primaryType: 'danger'
                    },
                    {
                        id: 'exception-4',
                        group: 'exception',
                        title: '车况异常反馈待审核',
                        meta: '车况提醒 | 订单: ZT24050500003 | 2024/05/05 11:11',
                        desc: 'ZT24050500003, [车况异常反馈] 客户在取车环节上传了车辆剐蹭照片，请人工审核定损单！',
                        badge: '车况异常',
                        badgeType: 'warning',
                        primaryAction: '审核定损',
                        secondaryAction: '查看照片',
                        primaryType: 'warning'
                    },
                    {
                        id: 'exception-5',
                        group: 'exception',
                        title: '车辆电压低自动管控',
                        meta: '车况提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 车辆电压较低，已自动管控3天(单号GC889)，管控内有5笔订单待处理！',
                        badge: '管控中',
                        badgeType: 'warning',
                        primaryAction: '查看管控',
                        secondaryAction: '处理订单',
                        primaryType: 'warning'
                    },
                    {
                        id: 'exception-6',
                        group: 'exception',
                        title: '车机掉线自动管控',
                        meta: '车况提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 车辆车机掉线，已自动管控1天(单号GC890)，管控内有5笔订单待处理！',
                        badge: '掉线',
                        badgeType: 'danger',
                        primaryAction: '查看管控',
                        secondaryAction: '联系维保',
                        primaryType: 'danger'
                    },
                    {
                        id: 'exception-7',
                        group: 'exception',
                        title: '车机恢复在线',
                        meta: '车况提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 车机恢复在线，已自动解除管控(单号GC889)！',
                        badge: '已恢复',
                        badgeType: 'success',
                        primaryAction: '解除复核',
                        secondaryAction: '查看记录',
                        primaryType: 'success'
                    },
                    {
                        id: 'exception-8',
                        group: 'exception',
                        title: '定位长时间无上报',
                        meta: '车况提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 车辆已超过1小时无最新定位上报，请指派寻车！',
                        badge: '需寻车',
                        badgeType: 'danger',
                        primaryAction: '指派寻车',
                        secondaryAction: '查看轨迹',
                        primaryType: 'danger'
                    },
                    {
                        id: 'exception-9',
                        group: 'exception',
                        title: '车机异常断电',
                        meta: '车况提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 车机发生异常断电，疑似蓄电池故障，请指派维保！',
                        badge: '疑似故障',
                        badgeType: 'danger',
                        primaryAction: '指派维保',
                        secondaryAction: '查看电池',
                        primaryType: 'danger'
                    },

                    {
                        id: 'dispatch-1',
                        group: 'dispatch',
                        title: '人工调度确认',
                        meta: '调度/整备 | 门店: 虹桥高铁站店 | 1小时前',
                        desc: '虹桥高铁站店周末预订高峰，需要确认本店可交付车辆和人工派车方案。',
                        badge: '调度',
                        badgeType: 'primary',
                        primaryAction: '确认方案',
                        secondaryAction: '查看库存',
                        primaryType: 'primary'
                    },
                    {
                        id: 'dispatch-2',
                        group: 'dispatch',
                        title: '交车整备告警',
                        meta: '调度/整备 | 车牌: 沪A·12345 | 距离交车: 2小时',
                        desc: '待交付车辆尚未录入洗车整备记录，即将超期，请催促整备专员完成作业。',
                        badge: '紧急',
                        badgeType: 'danger',
                        primaryAction: '下发催办',
                        secondaryAction: '转交他人',
                        primaryType: 'danger'
                    },
                    {
                        id: 'dispatch-3',
                        group: 'dispatch',
                        title: '保养里程达标',
                        meta: '保养提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 车辆已达到预设保养里程 (50,000km)，请安排进厂维保！',
                        badge: '保养',
                        badgeType: 'primary',
                        primaryAction: '安排进厂',
                        secondaryAction: '查看档案',
                        primaryType: 'primary'
                    },
                    {
                        id: 'dispatch-4',
                        group: 'dispatch',
                        title: '年度保养到期',
                        meta: '保养提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 车辆已达到预设年度保养时间，请安排进厂维保！',
                        badge: '保养',
                        badgeType: 'primary',
                        primaryAction: '安排保养',
                        secondaryAction: '查看计划',
                        primaryType: 'primary'
                    },
                    {
                        id: 'dispatch-5',
                        group: 'dispatch',
                        title: '深度清洁任务',
                        meta: '清洁提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 累计租借达5次，已触发深度清洁任务指标，请安排！',
                        badge: '清洁',
                        badgeType: 'success',
                        primaryAction: '安排清洁',
                        secondaryAction: '查看记录',
                        primaryType: 'success'
                    },
                    {
                        id: 'dispatch-6',
                        group: 'dispatch',
                        title: '日常清洁触发',
                        meta: '清洁提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 结束跨城长单，已触发日常小清洁指标，请安排！',
                        badge: '清洁',
                        badgeType: 'success',
                        primaryAction: '安排清洁',
                        secondaryAction: '查看订单',
                        primaryType: 'success'
                    },
                    {
                        id: 'dispatch-7',
                        group: 'dispatch',
                        title: '停车超时提醒',
                        meta: '停车提醒 | 车辆: RDC-1234 | 2024/05/05 11:11',
                        desc: 'RDC-1234, 停靠在台北内湖VIP库已达6小时未动，请确认是否移库！',
                        badge: '停车',
                        badgeType: 'warning',
                        primaryAction: '确认移库',
                        secondaryAction: '查看位置',
                        primaryType: 'warning'
                    },
                    {
                        id: 'dispatch-8',
                        group: 'dispatch',
                        title: '网点车位预警',
                        meta: '停车提醒 | 网点: 重庆江北T3 | 2024/05/05 11:11',
                        desc: '[预警] 重庆江北T3网点，已停入12辆车，剩余0车位，即将引发还车阻塞！',
                        badge: '预警',
                        badgeType: 'danger',
                        primaryAction: '安排移库',
                        secondaryAction: '查看网点',
                        primaryType: 'danger'
                    },
                    {
                        id: 'dispatch-9',
                        group: 'dispatch',
                        title: '年检临期预警',
                        meta: '调度/整备 | 剩余: 7天 | 共3台车',
                        desc: '检测到有一批公牌营运车辆年检即将到期，请尽快发派代理公司办理全部年检手续。',
                        badge: '年检',
                        badgeType: 'info',
                        primaryAction: '查看车辆批次',
                        secondaryAction: '指派代办',
                        primaryType: 'primary'
                    },

                    {
                        id: 'overdue-1',
                        group: 'overdue',
                        title: '订单严重逾期',
                        meta: '订单提醒 | 订单: ZT24050500001 | 2024/05/05 11:11',
                        desc: 'ZT24050500001, [严重逾期] 车辆已超过预计还车时间 2小时，多次联系客户未果，请调度介入！',
                        badge: '严重逾期',
                        badgeType: 'danger',
                        primaryAction: '指派调度',
                        secondaryAction: '查看订单',
                        primaryType: 'danger'
                    },
                    {
                        id: 'overdue-2',
                        group: 'overdue',
                        title: '订单轻微逾期',
                        meta: '订单提醒 | 订单: ZT24050500001 | 2024/05/05 11:11',
                        desc: 'ZT24050500001, [轻微逾期] 车辆已超过预计还车时间 15分钟，请注意跟进客户状态。',
                        badge: '轻微逾期',
                        badgeType: 'info',
                        primaryAction: '提醒客户',
                        secondaryAction: '查看订单',
                        primaryType: 'primary'
                    },
                    {
                        id: 'overdue-3',
                        group: 'overdue',
                        title: '订单中度逾期',
                        meta: '订单提醒 | 订单: ZT24050500001 | 2024/05/05 11:11',
                        desc: 'ZT24050500001, [中度逾期] 车辆已超过预计还车时间 1小时，已自动发送扣费提醒短信。',
                        badge: '中度逾期',
                        badgeType: 'warning',
                        primaryAction: '跟进客户',
                        secondaryAction: '查看短信',
                        primaryType: 'warning'
                    },
                    {
                        id: 'overdue-4',
                        group: 'overdue',
                        title: '订单即将逾期',
                        meta: '订单提醒 | 订单: ZT24050500002 | 2024/05/05 11:11',
                        desc: 'ZT24050500002, [即将逾期] 车辆距离预计还车时间仅剩 30分钟，系统已预触发还车节点。',
                        badge: '即将逾期',
                        badgeType: 'success',
                        primaryAction: '提前提醒',
                        secondaryAction: '查看订单',
                        primaryType: 'success'
                    },
                    {
                        id: 'overdue-5',
                        group: 'overdue',
                        title: '车辆超期未还',
                        meta: '超期提醒 | 车牌: 苏A·66666 | 订单: R-0033',
                        desc: '应还时间 6月3日 18:00，已超期联系不上客户，需立案启动风控寻车。',
                        badge: '超期2天',
                        badgeType: 'danger',
                        primaryAction: '启动寻车',
                        secondaryAction: '催收记录',
                        primaryType: 'danger'
                    },
                    {
                        id: 'overdue-6',
                        group: 'overdue',
                        title: '企业账单逾期',
                        meta: '超期提醒 | 客户: 特斯拉 | 账期: 5月',
                        desc: '5月对账结算单 152,000元 逾期未支付，系统已暂停新单配额白名单。',
                        badge: '逾期5天',
                        badgeType: 'warning',
                        primaryAction: '发送催缴单',
                        secondaryAction: '线下电联沟通',
                        primaryType: 'warning'
                    },
                ]);
                const todoDialogCounts = computed(() => {
                    const all = todoDialogItems.value.length;
                    const pending = todoDialogItems.value.filter(item => item.group === 'pending').length;
                    const exception = todoDialogItems.value.filter(item => item.group === 'exception').length;
                    const dispatch = todoDialogItems.value.filter(item => item.group === 'dispatch').length;
                    const overdue = todoDialogItems.value.filter(item => item.group === 'overdue').length;
                    return { all, pending, exception, dispatch, overdue };
                });
                const filteredTodoDialogItems = computed(() => {
                    if (todoDialogTab.value === 'all') return todoDialogItems.value;
                    return todoDialogItems.value.filter(item => item.group === todoDialogTab.value);
                });

                // 统一的待办异常数据源 (从仪表板迁移并补充)
                const pendingItems = ref([
                    { id: 'E-1', type: '异常', title: '逾期未还：R-202611-0012', desc: '车辆定位显示未进入还车区域，多次联系未接听，已超期2H。', time: '10:30', tag: '车况/车机异常', customer: '李广' },
                    { id: 'E-2', type: '异常', title: '未准时取车：R-202611-0045', desc: '预订取车时间为14:00，目前仍未办理提车手续。', time: '14:45', tag: '车况/车机异常', customer: '王建' },
                    { id: 'E-3', type: '事故定损', title: '事故报备审核：R-202611-0089', desc: '客户在APP端上传了轻微追尾现场图及交警责任书，请审核并下发维修单。', time: '15:20', tag: '车况/车机异常', customer: '赵大川' },
                    { id: 'V-1', type: '待保养', title: '临近5万公里大保养', desc: '沪A·DF889（别克GL8）当前里程 49,850 km，请尽快排期进厂大保养。', time: '昨天', tag: '排车/整备', customer: '-' },
                    { id: 'V-2', type: '待清洁', title: '需要日常清洁', desc: '京A·R6677（大众帕萨特）刚结束跨城调拨，内饰传感器报警阈值触发，请安排洗车。', time: '09:00', tag: '排车/整备', customer: '-' },
                    { id: 'V-3', type: '低电量快充', title: '需要补能', desc: '粤B·E1234（特斯拉Model 3）电池SOC仅剩 15%，请调度至福田高铁站快充桩。', time: '08:15', tag: '排车/整备', customer: '-' },
                    { id: 'P-1', type: '催缴', title: '租金托欠催缴单', desc: '企业客户 [台北科技发展有限公司] 11月份月结账单逾期 3 天未支付。', time: '3天前', tag: '逾期催缴', customer: '财务部转单' },
                    { id: 'P-2', type: '催费验证', title: '超期超时费减免申请', desc: '[张明]客服主管提交了一笔紧急超时费减免审批，限时2小时内处理。', time: '16:05', tag: '逾期催缴', customer: '张明' }
                ]);

                const exceptionItems = computed(() => pendingItems.value.filter(item => item.tag === '车况/车机异常'));
                const dispatchItems = computed(() => pendingItems.value.filter(item => item.tag === '排车/整备'));
                const overdueItems = computed(() => pendingItems.value.filter(item => item.tag === '逾期催缴'));

                const getIconForType = (type) => {
                    const map = { '异常': 'WarningFilled', '事故定损': 'Van', '待保养': 'Setting', '待清洁': 'Brush', '低电量快充': 'Lightning', '催缴': 'DocumentDelete', '催费验证': 'Timer' };
                    return map[type] || 'Tickets';
                };
                const getColorForType = (type) => {
                    const map = { '异常': 'orange', '事故定损': 'red', '待保养': 'blue', '待清洁': 'green', '低电量快充': 'yellow', '催缴': 'orange', '催费验证': 'red' };
                    return map[type] || 'gray';
                };

                const handleAction = (item) => {
                    pendingItems.value = pendingItems.value.filter(i => i.id !== item.id);
                    ElMessage.success('已完成操作: ' + item.title);
                };
                const handleDialogAction = (action, item) => {
                    ElMessage.success(action + '：' + item.title);
                };

                // P0-1: Dynamic greeting based on time of day
                const currentHour = new Date().getHours();
                const greeting = computed(() => {
                    if (currentHour >= 5 && currentHour < 12) return 'Hi, 早上好！';
                    if (currentHour >= 12 && currentHour < 18) return 'Hi, 下午好！';
                    return 'Hi, 晚上好！';
                });
                const userName = ref('Admin');

                const handleUserCommand = (command) => {
                    if (command === 'logout') {
                        router.push('/operation/login');
                        return;
                    }
                };

                // P1-4: Core operational metrics
                const omniSearch = ref('');
                const assetHealth = reactive({
                    accident: 1,
                    maintenance: 3,
                    offline: 2,
                    idle: 4
                });

                // P1-14: Dialog state
                const settingDialogVisible = ref(false);
                const announcementDialogVisible = ref(false);
                const announcementDetailVisible = ref(false);
                const announcementKeyword = ref('');
                const activeAnnouncement = ref(null);
                const maxSelectedApps = 8;
                const allApps = ref([
                    { id: 'risk_review', name: '风控审核', icon: 'DocumentChecked', href: '/operation/member-review', color: 'icon-indigo', category: '风控/合规', default: true },
                    { id: 'vehicle_files', name: '维保档案', icon: 'Files', href: '/operation/vehicles', color: 'icon-orange', category: '车辆管理', default: true },
                    { id: 'finance', name: '财务结算', icon: 'Money', href: '/operation/dashboard', color: 'icon-green', category: '财务', default: true },
                    { id: 'marketing', name: '营销中心', icon: 'PictureRounded', href: '/operation/marketing', color: 'icon-rose', category: '营销', default: true },
                    { id: 'reports', name: '数据报表', icon: 'DataLine', href: '/operation/war-room', color: 'icon-teal', category: '分析', default: true },
                    { id: 'settings', name: '系统配置', icon: 'Setting', href: '/operation/settings', color: 'icon-purple', category: '系统', default: true },
                    { id: 'new_order', name: '新建订单', icon: 'Ticket', href: '/operation/new-order', color: 'icon-blue', category: '订单' },
                    { id: 'store_orders', name: '门市订单', icon: 'List', href: '/operation/store-orders', color: 'icon-blue', category: '订单' },
                    { id: 'members', name: '会员管理', icon: 'User', href: '/operation/members', color: 'icon-purple', category: '客户' },
                    { id: 'dispatch', name: '车辆排程', icon: 'Van', href: '/operation/dispatch', color: 'icon-green', category: '调度' }
                ]);
                const selectedAppIds = ref([]);
                const dragAppId = ref(null);
                const selectedApps = computed(() => selectedAppIds.value
                    .map(id => allApps.value.find(app => app.id === id))
                    .filter(Boolean));
                const getDefaultAppIds = () => {
                    const defaults = allApps.value.filter(app => app.default).map(app => app.id);
                    return defaults.length ? defaults : allApps.value.slice(0, 6).map(app => app.id);
                };
                selectedAppIds.value = getDefaultAppIds();
                const toggleAppSelection = (appId, checked) => {
                    const exists = selectedAppIds.value.includes(appId);
                    const shouldSelect = typeof checked === 'boolean' ? checked : !exists;
                    if (shouldSelect) {
                        if (exists) return;
                        if (selectedAppIds.value.length >= maxSelectedApps) {
                            ElMessage.warning(`最多选择 ${maxSelectedApps} 个模块`);
                            return;
                        }
                        selectedAppIds.value = [...selectedAppIds.value, appId];
                        return;
                    }
                    if (!exists) return;
                    selectedAppIds.value = selectedAppIds.value.filter(id => id !== appId);
                };
                const removeApp = (appId) => {
                    selectedAppIds.value = selectedAppIds.value.filter(id => id !== appId);
                };
                const handleDragStart = (appId) => {
                    dragAppId.value = appId;
                };
                const handleDragEnd = () => {
                    dragAppId.value = null;
                };
                const handleDrop = (targetId) => {
                    if (!dragAppId.value || dragAppId.value === targetId) return;
                    const next = [...selectedAppIds.value];
                    const fromIndex = next.indexOf(dragAppId.value);
                    const toIndex = next.indexOf(targetId);
                    if (fromIndex === -1 || toIndex === -1) return;
                    next.splice(fromIndex, 1);
                    next.splice(toIndex, 0, dragAppId.value);
                    selectedAppIds.value = next;
                    dragAppId.value = null;
                };
                const loadAppSelection = () => {
                    try {
                        const stored = localStorage.getItem('rimo_workbench_apps');
                        if (stored) {
                            const parsed = JSON.parse(stored);
                            const ids = Array.isArray(parsed)
                                ? parsed.filter(id => allApps.value.some(app => app.id === id))
                                : [];
                            if (ids.length) {
                                selectedAppIds.value = ids.slice(0, maxSelectedApps);
                                return;
                            }
                        }
                    } catch (e) {
                        // ignore storage errors
                    }
                    selectedAppIds.value = getDefaultAppIds();
                };
                const saveAppSelection = () => {
                    localStorage.setItem('rimo_workbench_apps', JSON.stringify(selectedAppIds.value));
                    ElMessage.success('已保存配置');
                    settingDialogVisible.value = false;
                };
                const resetAppSelection = () => {
                    selectedAppIds.value = getDefaultAppIds();
                };

                const metrics = reactive({
                    todayTodo: 26,
                    rentalRate: 78.5,
                    inRentCount: 126,
                    totalFleet: 160,
                    monthRevenue: 85468000
                });
                const formattedRevenue = computed(() => {
                    return (metrics.monthRevenue / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2 });
                });

                // P1-10: Announcements
                const announcements = ref([
                    {
                        id: 'announcement-20260310',
                        title: '端午节安全检查提醒',
                        content: `为保障端午节期间运营安全，请各门店在 3 月 15 日前完成以下检查：
1. 轮胎磨损、胎压及备胎完整性
2. 刹车系统、灯光、雨刷及油液状态
3. 车内应急工具（反光背心、三角牌、急救包）齐备

检查完成后请在系统中提交检查记录，未完成将影响节假日排班与车辆交付。`,
                        date: '2026-03-10',
                        publisher: '运营部',
                        ts: new Date('2026-03-10').getTime(),
                    },
                    {
                        id: 'announcement-20260308',
                        title: '端午期间订单调价及排班公告',
                        content: `端午期间订单将启用节假日阶梯价，同时门店排班需在 3 月 12 日前完成调整。
计费引擎将于本周五 02:00 ~ 04:00 升级，期间系统不影响下单但可能延迟同步。`,
                        date: '2026-03-08',
                        publisher: '技术部',
                        ts: new Date('2026-03-08').getTime(),
                    },
                    {
                        id: 'announcement-20260305',
                        title: '车辆出库标准更新',
                        content: `为提升交付体验，车辆出库标准更新如下：
1. 外观无明显污泥、划痕需记录
2. 内饰无异味，脚垫与中控区域清洁
3. 油量不低于 1/4，电车 SOC 不低于 50%`,
                        date: '2026-03-05',
                        publisher: '品控中心',
                        ts: new Date('2026-03-05').getTime(),
                    },
                    {
                        id: 'announcement-20260302',
                        title: '新客户风控策略升级',
                        content: `风控策略升级已上线：
1. 首单押金校验：未完成押金验证订单将被拦截
2. 证件一致性复核：证件信息与下单人信息不一致需人工复核
3. 高风险时间段订单将触发二次核验`,
                        date: '2026-03-02',
                        publisher: '风控中心',
                        ts: new Date('2026-03-02').getTime(),
                    },
                    {
                        id: 'announcement-20260227',
                        title: '计费引擎升级维护通知',
                        content: `计费引擎维护期间可能出现报表生成延迟，预计在 04:30 前恢复。
如遇异常，请联系技术支持。`,
                        date: '2026-02-27',
                        publisher: '技术部',
                        ts: new Date('2026-02-27').getTime(),
                    },
                    {
                        id: 'announcement-20260223',
                        title: '企业月结资格申请流程调整',
                        content: `企业月结资格申请新增风控评估，审批周期延长 1-2 个工作日。
门店需提前发起申请以避免影响签约。`,
                        date: '2026-02-23',
                        publisher: '财务部',
                        ts: new Date('2026-02-23').getTime(),
                    },
                    {
                        id: 'announcement-20260218',
                        title: '门店库存盘点指引',
                        content: `本月末将进行库存盘点，请各门店按指引完成车辆与物料核对。
盘点结果需在系统中提交，若有异常需附上说明。`,
                        date: '2026-02-18',
                        publisher: '运营部',
                        ts: new Date('2026-02-18').getTime(),
                    }
                ]);
                const filteredAnnouncements = computed(() => {
                    const keyword = announcementKeyword.value.trim().toLowerCase();
                    let list = announcements.value;
                    if (keyword) {
                        list = list.filter(item => {
                            const haystack = [item.title, item.content, item.publisher]
                                .filter(Boolean)
                                .join(' ')
                                .toLowerCase();
                            return haystack.includes(keyword);
                        });
                    }
                    return [...list].sort((a, b) => (b.ts || 0) - (a.ts || 0));
                });
                const featuredAnnouncements = computed(() => {
                    return [...announcements.value]
                        .sort((a, b) => (b.ts || 0) - (a.ts || 0))
                        .slice(0, 3);
                });
                const getAnnouncementPreview = (item, maxLength = 60) => {
                    const text = (item.content || '').replace(/\s+/g, ' ').trim();
                    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
                };
                const openAnnouncementCenter = () => {
                    announcementDialogVisible.value = true;
                };
                const openAnnouncementDetail = (item) => {
                    if (!item) return;
                    activeAnnouncement.value = item;
                    announcementDialogVisible.value = false;
                    announcementDetailVisible.value = true;
                };

                // P1-6: Dynamic schedule date
                const today = new Date();
                const scheduleDate = computed(() => {
                    return `${today.getMonth() + 1}月${today.getDate()}日`;
                });
                const weekDayNames = ['日', '一', '二', '三', '四', '五', '六'];
                const weekDay = computed(() => '周' + weekDayNames[today.getDay()]);

                // P2-7: Banner carousel data
                const banners = ref([
                    {
                        title: '✨ 端午节运营锦囊已下发',
                        desc: '从端午期间的营销策略、风控把控到违章处理，全方位提升门店营业额，查看"赚翻天"秘籍。',
                        btnText: '立即查看',
                        icon: 'Present',
                        gradient: 'from-theme-primary to-[#008AC5]'
                    },
                    {
                        title: '🚀 v2.8 系统升级通知',
                        desc: '新增智能调价引擎与车辆 IoT 健康监控功能，将于本周五 02:00~04:00 进行不停机升级。',
                        btnText: '了解详情',
                        icon: 'Monitor',
                        gradient: 'from-[#7c3aed] to-[#a855f7]'
                    },
                    {
                        title: '🏆 上月之星：虹桥高铁站店',
                        desc: '出租率 96.2%，客诉率 0.3%，创下全区门店最佳运营记录！点击查看其经验分享。',
                        btnText: '查看复盘',
                        icon: 'Trophy',
                        gradient: 'from-[#ea580c] to-[#f97316]'
                    }
                ]);

                // P2-9: Recent visits from localStorage
                const recentPages = ref([]);
                const loadRecentPages = () => {
                    try {
                        const stored = localStorage.getItem('rimo_recent_pages');
                        if (stored) {
                            recentPages.value = JSON.parse(stored).slice(0, 5);
                        } else {
                            recentPages.value = [
                                { href: '/operation/corporates', name: '企业客户管理' },
                                { href: '/operation/official-vehicle-contracts', name: '公务用车合约' },
                                { href: '/operation/store-orders', name: '门市租赁订单' }
                            ];
                        }
                    } catch (e) {
                        recentPages.value = [
                                { href: '/operation/corporates', name: '企业客户管理' },
                                { href: '/operation/store-orders', name: '门市租赁订单' }
                        ];
                    }
                };

                onMounted(() => {
                    loadRecentPages();
                    loadAppSelection();
                });

                return {
                    router,
                    todoTab, greeting, userName,
                    omniSearch, assetHealth, settingDialogVisible,
                    announcementDialogVisible, announcementDetailVisible, announcementKeyword,
                    announcements, filteredAnnouncements, featuredAnnouncements,
                    activeAnnouncement, getAnnouncementPreview, openAnnouncementCenter,
                    openAnnouncementDetail,
                    maxSelectedApps, allApps, selectedAppIds, selectedApps,
                    dragAppId, toggleAppSelection, removeApp, handleDragStart, handleDragEnd, handleDrop,
                    saveAppSelection, resetAppSelection,
                    todoDialogVisible, todoDialogTab, todoDialogCounts, filteredTodoDialogItems,
                    exceptionItems, dispatchItems, overdueItems, getIconForType, getColorForType, handleAction,
                    handleDialogAction,
                    metrics, formattedRevenue, pendingItems,
                    scheduleDate, weekDay,
                    banners, recentPages,
                    handleUserCommand
                };
            }
        };
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }

        .custom-scroll::-webkit-scrollbar-track {
            background: transparent;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
        }

        .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
        }
.card-shadow {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
            border: 1px solid rgba(0, 0, 0, 0.02);
        }

        /* Element Plus Tabs Reset */
        :deep(.workbench-tabs .el-tabs__item) {
            font-size: 14px;
            font-weight: 600;
            color: #64748b;
            padding: 0 16px;
        }

        :deep(.workbench-tabs .el-tabs__item.is-active) {
            color: var(--app-color-primary);
        }

        :deep(.workbench-tabs .el-tabs__active-bar) {
            background-color: var(--app-color-primary);
            height: 3px;
            border-radius: 2px;
        }

        :deep(.workbench-tabs .el-tabs__nav-wrap::after) {
            height: 1px;
            background-color: #e2e8f0;
        }

        .todo-panel {
            max-height: 420px;
            overflow-y: auto;
            padding-right: 4px;
        }

        /* App Icons Gradients */
        .icon-blue {
            background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
            color: #0284c7;
        }

        .icon-green {
            background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
            color: #16a34a;
        }

        .icon-purple {
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            color: #9333ea;
        }

        .icon-orange {
            background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
            color: #ea580c;
        }

        .icon-teal {
            background: linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%);
            color: #0d9488;
        }

        .icon-rose {
            background: linear-gradient(135deg, #ffe4e6 0%, #fecdd3 100%);
            color: #e11d48;
        }

        .icon-indigo {
            background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
            color: #4f46e5;
        }

        .latest-announcement-card {
            background: #ffffff;
            border-radius: 16px;
            padding: 20px 20px 18px;
        }

        .latest-announcement-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            cursor: pointer;
        }

        .latest-announcement-item+.latest-announcement-item {
            margin-top: 22px;
        }

        .latest-announcement-dot {
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #d1d5db;
            margin-top: 9px;
            flex-shrink: 0;
        }

        .latest-announcement-item.is-primary .latest-announcement-dot {
            background: #f16d6d;
            box-shadow: 0 0 0 4px rgba(241, 109, 109, 0.12);
        }

        .latest-announcement-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.5;
        }

        .latest-announcement-summary {
            margin-top: 6px;
            font-size: 12px;
            color: #8c97a8;
            line-height: 1.7;
        }

        .latest-announcement-meta {
            margin-top: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
            font-size: 12px;
            color: #97a3b4;
        }

        .latest-announcement-badge {
            display: inline-flex;
            align-items: center;
            padding: 2px 6px;
            border-radius: 6px;
            border: 1px solid #cfe4f3;
            background: #edf6fc;
            color: var(--app-color-primary);
            font-size: 12px;
            line-height: 1;
        }

        /* Announcement Dialog */
        :deep(.announcement-dialog .el-dialog),
        :deep(.announcement-detail-dialog .el-dialog) {
            border-radius: 16px;
            overflow: hidden;
        }

        :deep(.announcement-dialog .el-dialog__header),
        :deep(.announcement-detail-dialog .el-dialog__header) {
            padding: 0;
        }

        :deep(.announcement-dialog .el-dialog__body),
        :deep(.announcement-detail-dialog .el-dialog__body) {
            padding: 16px;
            background: #f8fafc;
        }

        .announcement-dialog-header {
            background: #ffffff;
            padding: 14px 18px;
            border-bottom: 1px solid #e5e7eb;
        }

        .announcement-dialog-title {
            font-size: 16px;
            font-weight: 700;
            color: #1f2937;
            line-height: 1.4;
        }

        .announcement-dialog-sub {
            margin-top: 4px;
            font-size: 12px;
            color: #6b7280;
        }

        .announcement-search-wrap {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 10px 12px;
            margin-bottom: 12px;
        }

        .announcement-list-wrap {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            max-height: 480px;
            overflow-y: auto;
            padding: 12px;
        }

        .announcement-list-item {
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            background: #ffffff;
            padding: 12px 14px;
            cursor: pointer;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .announcement-list-item+.announcement-list-item {
            margin-top: 10px;
        }

        .announcement-list-item:hover {
            border-color: #cfdce8;
            box-shadow: 0 6px 14px rgba(15, 23, 42, 0.06);
        }

        .announcement-list-title {
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.5;
        }

        .announcement-list-summary {
            margin-top: 6px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.7;
        }

        .announcement-list-meta {
            margin-top: 8px;
            font-size: 12px;
            color: #94a3b8;
        }

        .announcement-empty {
            min-height: 220px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            padding: 16px;
        }

        .announcement-detail-content-box {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
        }

        .announcement-detail-meta {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px dashed #dbe5ec;
        }

        .announcement-detail-content {
            font-size: 14px;
            color: #475569;
            line-height: 1.9;
            white-space: pre-line;
        }
</style>
