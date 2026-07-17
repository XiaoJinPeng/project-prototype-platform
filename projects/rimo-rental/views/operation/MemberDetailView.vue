<template>
<div class="member-detail-page">

            
            
            

            <main>
                
                <div class="mb-4">
                    <el-button @click="goBack" :icon="ArrowLeft" plain>返回</el-button>
                </div>
                

                
                <div 
                    class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 detail-card relative overflow-hidden">
                    
                    <div class="absolute top-5 right-6 z-20 flex gap-2">
                        <el-button type="primary" @click="handleEdit"
                            class="shadow-md shadow-blue-500/20">
                            <el-icon class="mr-1">
                                <Edit></Edit>
                            </el-icon>编辑资料
                        </el-button>
                        <el-button type="danger" plain @click="handleFreeze" v-if="member.status !== 'frozen'">
                            <el-icon class="mr-1">
                                <Lock></Lock>
                            </el-icon>冻结
                        </el-button>
                        <el-button type="success" plain @click="handleUnfreeze" v-else>
                            <el-icon class="mr-1">
                                <Unlock></Unlock>
                            </el-icon>解冻
                        </el-button>
                    </div>
                    
                    <div class="flex items-start gap-6">
                        <el-avatar :size="80" class="text-2xl font-bold border-4 border-white shadow-lg flex-shrink-0"
                            :class="member.accountType === 'corporate' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'">
                            {{ member.name?.charAt(0) }}
                        </el-avatar>
                        <div class="flex-1 space-y-3 min-w-0">
                            
                            <div class="flex items-center gap-3">
                                <h1 class="text-2xl font-bold text-gray-900">{{ member.name }}</h1>
                                <el-tag :type="member.accountType === 'corporate' ? 'warning' : 'info'" effect="dark"
                                    class="rounded-full px-3" size="small">
                                    {{ member.accountType === 'corporate' ? '企业会员' : '个人会员' }}
                                </el-tag>
                                <el-tag :type="statusType" effect="light" class="rounded-full px-3" size="small">
                                    {{ statusText }}
                                </el-tag>
                            </div>
                            
                            <div class="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                                <span class="flex items-center gap-1.5">
                                    <el-icon class="text-gray-400">
                                        <Iphone></Iphone>
                                    </el-icon>
                                    {{ member.phone }}
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <el-icon class="text-gray-400">
                                        <Message></Message>
                                    </el-icon>
                                    {{ member.email }}
                                </span>
                                <span class="flex items-center gap-1.5">
                                    <el-icon class="text-gray-400">
                                        <User></User>
                                    </el-icon>
                                    <span class="text-gray-400">ID:</span>
                                    <span class="font-mono">{{ member.id }}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div class="grid grid-cols-4 gap-4 mt-4">
                    <div class="metric-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <el-icon class="text-blue-500" :size="20">
                                    <Document></Document>
                                </el-icon>
                            </div>
                            <div>
                                <div class="text-xs text-gray-400 mb-0.5">累计订单</div>
                                <div class="text-xl font-bold text-gray-900">{{ memberStats.totalOrders }}</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            本月 <span class="text-blue-500 font-medium">+{{ memberStats.monthOrders }}</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <el-icon class="text-green-500" :size="20">
                                    <Wallet></Wallet>
                                </el-icon>
                            </div>
                            <div>
                                <div class="text-xs text-gray-400 mb-0.5">累计消费</div>
                                <div class="text-xl font-bold text-gray-900">¥{{ memberStats.totalSpent.toLocaleString()
                                    }}</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            本月 <span class="text-green-500 font-medium">+¥{{ memberStats.monthSpent.toLocaleString()
                                }}</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                                <el-icon class="text-amber-500" :size="20">
                                    <Coin></Coin>
                                </el-icon>
                            </div>
                            <div>
                                <div class="text-xs text-gray-400 mb-0.5">当前积分</div>
                                <div class="text-xl font-bold text-gray-900">{{
                                    memberStats.currentPoints.toLocaleString() }}</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            本月 <span class="text-amber-500 font-medium">+{{ memberStats.monthPoints }}</span>
                        </div>
                    </div>
                    <div class="metric-card">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <el-icon class="text-purple-500" :size="20">
                                    <Medal></Medal>
                                </el-icon>
                            </div>
                            <div>
                                <div class="text-xs text-gray-400 mb-0.5">会员方案</div>
                                <div class="text-lg font-bold text-gray-900">{{ member.membership?.planName }}</div>
                            </div>
                        </div>
                        <div class="text-xs text-gray-400 mt-2 flex items-center gap-1">
                            到期 <span class="text-purple-500 font-medium">{{ member.membership?.expireDate || '永久'
                                }}</span>
                            <el-tag v-if="member.membership?.autoRenew" type="success" size="small"
                                class="ml-1">自动续费</el-tag>
                        </div>
                    </div>
                </div>


                
                <div 
                    class="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col overflow-hidden">
                    <el-tabs v-model="activeTab" class="custom-tabs flex-1" tab-position="top">

                        
                        <el-tab-pane name="profile">
                            <template #label>
                                <span>基本资料</span>
                            </template>
                            <div class="py-6 space-y-8">
                                
                                <div>
                                    <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                        <el-icon class="mr-2 text-gray-400">
                                            <User></User>
                                        </el-icon> 基础身份信息
                                    </h3>
                                    <div 
                                        class="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 info-desc-list">
                                        <div>
                                            <dt>姓名</dt>
                                            <dd>{{ member.surname }}{{ member.firstName }}</dd>
                                        </div>
                                        <div>
                                            <dt>性别</dt>
                                            <dd>{{ member.gender === 'male' ? '男' : '女' }}</dd>
                                        </div>
                                        <div>
                                            <dt>出生日期</dt>
                                            <dd class="font-mono">{{ member.dob }}</dd>
                                        </div>
                                        <div>
                                            <dt>身份证号</dt>
                                            <dd class="font-mono">{{ member.idNumber }}</dd>
                                        </div>
                                        <div>
                                            <dt>手机号</dt>
                                            <dd class="font-mono">{{ member.phone }}</dd>
                                        </div>
                                        <div>
                                            <dt>电子邮箱</dt>
                                            <dd class="font-mono">{{ member.email }}</dd>
                                        </div>
                                        <div>
                                            <dt>登录账号</dt>
                                            <dd class="font-mono">{{ member.account }}</dd>
                                        </div>
                                        <div v-if="member.corporate">
                                            <dt>归属企业</dt>
                                            <dd class="text-blue-600">{{ member.corporate?.companyName }}</dd>
                                        </div>
                                        <div>
                                            <dt>注册时间</dt>
                                            <dd class="font-mono">{{ member.createTime }}</dd>
                                        </div>
                                    </div>
                                </div>

                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                            <el-icon class="mr-2 text-gray-400">
                                                <Location></Location>
                                            </el-icon> 地址信息
                                        </h3>
                                        <div 
                                            class="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-4 info-desc-list">
                                            <div>
                                                <dt>户籍地址</dt>
                                                <dd>{{ member.householdAddress }}</dd>
                                            </div>
                                            <div>
                                                <dt>通讯地址</dt>
                                                <dd>{{ member.mailingAddress }}</dd>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                            <el-icon class="mr-2 text-gray-400">
                                                <PhoneFilled></PhoneFilled>
                                            </el-icon> 紧急联络人
                                        </h3>
                                        <div 
                                            class="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-4 info-desc-list">
                                            <div class="grid grid-cols-2 gap-4">
                                                <div>
                                                    <dt>姓名</dt>
                                                    <dd>{{ member.emergencyContact.name }}</dd>
                                                </div>
                                                <div>
                                                    <dt>关系</dt>
                                                    <dd>{{ member.emergencyContact.relationship }}</dd>
                                                </div>
                                            </div>
                                            <div>
                                                <dt>联系电话</dt>
                                                <dd class="font-mono">{{ member.emergencyContact.phone }}</dd>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div>
                                    <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                        <el-icon class="mr-2 text-gray-400">
                                            <Picture></Picture>
                                        </el-icon> 证件照片
                                    </h3>
                                    <div class="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <div v-for="(label, key) in photoLabels" :key="key"
                                                class="text-center group">
                                                <div 
                                                    class="relative w-full aspect-[4/3] bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center overflow-hidden hover:shadow-md transition-all">
                                                    <el-image v-if="member.photos[key]" :src="member.photos[key]"
                                                        :preview-src-list="[member.photos[key]]" fit="cover"
                                                        class="w-full h-full">
                                                        <template #error>
                                                            <div 
                                                                class="flex flex-col items-center justify-center text-gray-400 h-full w-full bg-gray-100">
                                                                <el-icon class="text-2xl mb-1">
                                                                    <Picture></Picture>
                                                                </el-icon>
                                                                <span class="text-xs">加载失败</span>
                                                            </div>
                                                        </template>
                                                    </el-image>
                                                    <div v-else
                                                        class="flex flex-col items-center justify-center text-gray-300 h-full w-full bg-gray-50">
                                                        <el-icon class="text-2xl mb-1">
                                                            <Picture></Picture>
                                                        </el-icon>
                                                        <span class="text-xs">未上传</span>
                                                    </div>
                                                </div>
                                                <div class="mt-2 text-xs font-medium text-gray-600">{{ label }}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                            <el-icon class="mr-2 text-gray-400">
                                                <Van></Van>
                                            </el-icon> 驾驶执照
                                        </h3>
                                        <div 
                                            class="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 gap-y-4 gap-x-6 info-desc-list">
                                            <div>
                                                <dt>驾照类型</dt>
                                                <dd>{{ member.driverLicense.type }}</dd>
                                            </div>
                                            <div>
                                                <dt>签发地</dt>
                                                <dd>{{ member.driverLicense.issuePlace }}</dd>
                                            </div>
                                            <div>
                                                <dt>驾照号码</dt>
                                                <dd class="font-mono">{{ member.driverLicense.number }}</dd>
                                            </div>
                                            <div>
                                                <dt>有效日期</dt>
                                                <dd class="font-mono">{{ member.driverLicense.expiryDate }}</dd>
                                            </div>
                                            <div class="col-span-2">
                                                <dt>可用载具类型</dt>
                                                <dd class="flex flex-wrap gap-1">
                                                    <el-tag v-for="type in member.availableVehicleTypes" :key="type"
                                                        :type="getVehicleTypeTagType(type)" size="small" effect="plain">
                                                        {{ getVehicleTypeLabel(type) }}
                                                    </el-tag>
                                                </dd>
                                                <div class="text-xs text-gray-400 mt-1">微电车默认不要求驾照。</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 class="text-base font-bold text-gray-900 mb-4 flex items-center">
                                            <el-icon class="mr-2 text-gray-400">
                                                <Timer></Timer>
                                            </el-icon> 租车统计与偏好
                                        </h3>
                                        <div 
                                            class="bg-gray-50 rounded-lg p-5 border border-gray-100 grid grid-cols-2 gap-y-4 gap-x-6 info-desc-list">
                                            <div>
                                                <dt>上次租借时间</dt>
                                                <dd class="font-mono">{{ member.lastRentalTime }}</dd>
                                            </div>
                                            <div>
                                                <dt>累计未租借时长</dt>
                                                <dd>{{ member.nonRentalDuration }}</dd>
                                            </div>
                                            <div 
                                                class="col-span-2 flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                                                <span class="text-sm text-gray-600">接收优惠活动讯息</span>
                                                <el-switch v-model="member.receivePromotions" active-text="接收"
                                                    inactive-text="拒收" inline-prompt ></el-switch>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                
                                <div>
                                    <div class="flex items-center justify-between mb-4">
                                        <h3 class="text-base font-bold text-gray-900 flex items-center">
                                            <el-icon class="mr-2 text-gray-400">
                                                <CreditCard></CreditCard>
                                            </el-icon> 绑定信用卡
                                        </h3>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div v-for="card in member.creditCards" :key="card.id"
                                            class="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow relative group">
                                            <div class="flex items-center justify-between mb-3">
                                                <span class="font-bold text-gray-800">{{ card.bank }}</span>
                                                <el-tag size="small" effect="plain" class="uppercase">{{ card.type
                                                    }}</el-tag>
                                            </div>
                                            <div class="text-lg font-mono text-gray-600 mb-2 tracking-wider">{{
                                                card.number }}</div>
                                            <div class="text-xs text-gray-400 flex justify-between">
                                                <span>有效期</span>
                                                <span class="font-mono">{{ card.expiry }}</span>
                                            </div>
                                            <el-button 
                                                class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                type="danger" text @click="handleDeleteCard(card.id)">
                                                <el-icon>
                                                    <Delete></Delete>
                                                </el-icon>
                                            </el-button>
                                        </div>
                                        <div 
                                            class="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all h-[120px]">
                                            <el-icon class="text-2xl mb-1">
                                                <Plus></Plus>
                                            </el-icon>
                                            <span class="text-sm">新增信用卡</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>

                        <el-tab-pane name="orders">
                            <template #label>
                                <span>订单记录 <el-badge :value="paginatedOrders.length" type="primary"
                                        class="ml-1" ></el-badge></span>
                            </template>
                            <div class="py-4">
                                <div class="flex justify-between mb-4">
                                    <el-select v-model="orderFilter.type" placeholder="所有订单类型" style="width: 180px">
                                        <el-option label="所有类型" value=""></el-option>
                                        <el-option label="同站租还" value="same_station"></el-option>
                                        <el-option label="甲租乙还" value="diff_station"></el-option>
                                        <el-option label="门市租车" value="store"></el-option>
                                        <el-option label="24h自助租车" value="kiosk"></el-option>
                                    </el-select>
                                    <el-button :icon="Download">导出订单</el-button>
                                </div>
                                <el-table :data="paginatedOrders" stripe style="width: 100%">
                                    <el-table-column prop="id" label="订单号" width="140">
                                        <template #default="{ row }">
                                            <span class="font-mono text-blue-600 cursor-pointer hover:underline">{{
                                                row.id
                                                }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="type" label="类型" width="120">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="getOrderTypeTag(row.type)">{{ row.typeText
                                                }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="vehicle" label="车辆信息" min-width="180"></el-table-column>
                                    <el-table-column prop="pickup" label="取车门店" width="140"
                                        show-overflow-tooltip></el-table-column>
                                    <el-table-column prop="returnLocation" label="还车门店" width="140"
                                        show-overflow-tooltip></el-table-column>
                                    <el-table-column prop="duration" label="租期" width="120"></el-table-column>
                                    <el-table-column prop="amount" label="金额" width="120">
                                        <template #default="{ row }">
                                            <span class="font-bold">¥{{ row.amount }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="status" label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="getOrderStatusTag(row.status)">{{ row.statusText
                                                }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column label="操作" width="80">
                                        <template #default>
                                            <el-button link type="primary" size="small">详情</el-button>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div class="mt-4 flex justify-end">
                                    <el-pagination background layout="prev, pager, next" :total="100"></el-pagination>
                                </div>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="transactions">
                            <template #label>
                                <span>交易记录 <el-badge :value="transactions.length" type="primary" class="ml-1" ></el-badge></span>
                            </template>
                            <div class="py-4">
                                <div class="flex justify-between mb-4">
                                    <el-select v-model="transactionFilter.type" placeholder="所有交易类型"
                                        style="width: 180px">
                                        <el-option label="所有类型" value=""></el-option>
                                        <el-option label="租金支付" value="rent"></el-option>
                                        <el-option label="押金冻结" value="deposit"></el-option>
                                        <el-option label="违章扣款" value="fee"></el-option>
                                        <el-option label="退款" value="refund"></el-option>
                                    </el-select>
                                </div>
                                <el-table :data="transactions" stripe style="width: 100%">
                                    <el-table-column prop="id" label="流水号" width="180">
                                        <template #default="{ row }">
                                            <span class="font-mono">{{ row.id }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="time" label="交易时间" width="180"></el-table-column>
                                    <el-table-column prop="type" label="类型" width="120">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="getTransactionTypeTag(row.type)">{{ row.typeText
                                                }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="amount" label="金额" width="120">
                                        <template #default="{ row }">
                                            <span :class="row.amount > 0 ? 'text-red-600' : 'text-green-600'"
                                                class="font-bold">
                                                {{ row.amount > 0 ? '-' : '+' }}¥{{ Math.abs(row.amount) }}
                                            </span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="method" label="支付方式" width="120"></el-table-column>
                                    <el-table-column prop="orderId" label="关联订单" width="140"></el-table-column>
                                    <el-table-column prop="status" label="状态"></el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="points">
                            <template #label>
                                <span>积分记录 <el-badge :value="points.length" type="primary" class="ml-1" ></el-badge></span>
                            </template>
                            <div class="py-4">
                                <div 
                                    class="flex items-center justify-between mb-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                                    <span class="text-orange-800 font-bold flex items-center">
                                        <el-icon class="mr-2">
                                            <Coin></Coin>
                                        </el-icon> 当前可用积分：2,450
                                    </span>
                                    <el-button size="small" type="primary" plain>手动调整积分</el-button>
                                </div>
                                <el-table :data="points" stripe style="width: 100%">
                                    <el-table-column prop="time" label="变动时间" width="180"></el-table-column>
                                    <el-table-column prop="type" label="类型" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="row.change > 0 ? 'success' : 'warning'">{{
                                                row.typeText }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="change" label="变动值" width="120">
                                        <template #default="{ row }">
                                            <span class="font-bold"
                                                :class="row.change > 0 ? 'text-green-600' : 'text-orange-600'">
                                                {{ row.change > 0 ? '+' : '' }}{{ row.change }}
                                            </span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="balance" label="变动后余额" width="120"></el-table-column>
                                    <el-table-column prop="reason" label="来源/原因"></el-table-column>
                                    <el-table-column prop="orderId" label="关联订单" width="140"></el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="invites">
                            <template #label>
                                <span>邀请记录 <el-badge :value="invites.length" type="primary" class="ml-1" ></el-badge></span>
                            </template>
                            <div class="py-4">
                                <div class="grid grid-cols-3 gap-4 mb-6">
                                    <div class="bg-gray-50 p-3 rounded text-center">
                                        <div class="text-xs text-gray-500">已邀请人数</div>
                                        <div class="text-xl font-bold text-gray-800">12</div>
                                    </div>
                                    <div class="bg-gray-50 p-3 rounded text-center">
                                        <div class="text-xs text-gray-500">成功注册</div>
                                        <div class="text-xl font-bold text-green-600">8</div>
                                    </div>
                                    <div class="bg-gray-50 p-3 rounded text-center">
                                        <div class="text-xs text-gray-500">累计获得奖励</div>
                                        <div class="text-xl font-bold text-orange-600">800 积分</div>
                                    </div>
                                </div>
                                <el-table :data="invites" stripe style="width: 100%">
                                    <el-table-column prop="time" label="邀请时间" width="180"></el-table-column>
                                    <el-table-column prop="invitee" label="被邀请人" width="120"></el-table-column>
                                    <el-table-column prop="phone" label="手机号" width="140"></el-table-column>
                                    <el-table-column prop="status" label="注册状态" width="120">
                                        <template #default="{ row }">
                                            <el-tag size="small"
                                                :type="row.status === 'registered' ? 'success' : 'info'">
                                                {{ row.status === 'registered' ? '已注册' : '未注册' }}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="reward" label="奖励"></el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane name="service">
                            <template #label>
                                <span>客服记录 <el-badge :value="serviceLogs.length" type="primary" class="ml-1" ></el-badge></span>
                            </template>
                            <div class="py-4">
                                <div class="flex justify-end mb-4">
                                    <el-button type="primary" size="small">新建客服工单</el-button>
                                </div>
                                <el-table :data="serviceLogs" stripe style="width: 100%">
                                    <el-table-column prop="time" label="联络时间" width="180"></el-table-column>
                                    <el-table-column prop="channel" label="渠道" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small" effect="plain">{{ row.channel }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="ticketId" label="工单号" width="140"></el-table-column>
                                    <el-table-column prop="subject" label="主题/摘要" min-width="200"></el-table-column>
                                    <el-table-column prop="status" label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small"
                                                :type="row.status === 'closed' ? 'success' : 'warning'">
                                                {{ row.status === 'closed' ? '已关闭' : '处理中' }}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="operator" label="处理人" width="120"></el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane label="方案变更" name="plan_history">
                            <div class="py-4">
                                <el-table :data="planHistory" stripe style="width: 100%">
                                    <el-table-column prop="time" label="变更时间" width="180"></el-table-column>
                                    <el-table-column prop="oldPlan" label="原方案" width="140"></el-table-column>
                                    <el-table-column prop="newPlan" label="新方案" width="140"></el-table-column>
                                    <el-table-column prop="type" label="变更类型" width="120">
                                        <template #default="{ row }">
                                            <el-tag size="small" :type="row.type === 'upgrade' ? 'success' : 'info'">{{
                                                row.typeText }}</el-tag>
                                        </template>
                                    </el-table-column>
                                    <el-table-column prop="reason" label="变更原因"></el-table-column>
                                    <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane label="登录日志" name="login_logs">
                            <div class="py-4">
                                <el-table :data="loginLogs" stripe style="width: 100%">
                                    <el-table-column prop="time" label="登录时间" width="180"></el-table-column>
                                    <el-table-column prop="method" label="登录方式" width="120"></el-table-column>
                                    <el-table-column prop="ip" label="IP地址" width="140"></el-table-column>
                                    <el-table-column prop="device" label="设备信息"></el-table-column>
                                    <el-table-column prop="status" label="状态" width="100">
                                        <template #default="{ row }">
                                            <el-tag size="small"
                                                :type="row.status === 'success' ? 'success' : 'danger'">
                                                {{ row.status === 'success' ? '成功' : '失败' }}
                                            </el-tag>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                        
                        <el-tab-pane label="账号日志" name="account_logs">
                            <div class="py-4">
                                <el-table :data="accountLogs" stripe style="width: 100%">
                                    <el-table-column prop="time" label="操作时间" width="180"></el-table-column>
                                    <el-table-column prop="action" label="操作类型" width="140"></el-table-column>
                                    <el-table-column prop="detail" label="详情"></el-table-column>
                                    <el-table-column prop="ip" label="IP地址" width="140"></el-table-column>
                                    <el-table-column prop="operator" label="操作人" width="120"></el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>

                    </el-tabs>
                </div>
            </main>
        </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { ElMessageBox } from "element-plus";
import { ArrowLeft, Download } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import documentPlaceholder from '../../assets/demo/document-placeholder.svg';
import profilePlaceholder from '../../assets/demo/profile-placeholder.svg';

const route = useRoute();
const router = useRouter();
const activeTab = ref('profile');
                const orderFilter = reactive({ type: '' });
                const transactionFilter = reactive({ type: '' });

                // Mock Member Data
                // Mock Member Data
                const member = reactive({
                    id: 'U1001',
                    account: '13800138000',
                    surname: '王',
                    firstName: '小明',
                    get name() { return this.surname + this.firstName; },
                    gender: 'male',
                    dob: '1990-05-20',
                    phone: '13800138000',
                    email: 'wang@example.com',
                    idNumber: 'A123456789',
                    accountType: 'personal',
                    status: 'active',
                    createTime: '2025-01-15',
                    lastLoginTime: '2026-02-09 14:30:00',
                    corporate: null,
                    membership: {
                        planId: 'MP002',
                        planName: '银牌会员',
                        expireDate: '2026-01-15',
                        autoRenew: true
                    },
                    // Extended Basic Info
                    householdAddress: '台北市大安区信义路三段100号',
                    mailingAddress: '同户籍地址',
                    emergencyContact: {
                        name: '王大明',
                        relationship: '父亲',
                        phone: '0912-345-678'
                    },
                    driverLicense: {
                        type: '小型车',
                        issuePlace: '台北市',
                        number: 'A123456789',
                        expiryDate: '2030-05-20'
                    },
                    availableVehicleTypes: ['car', 'microElectric'],
                    // Rental Stats & Preferences
                    lastRentalTime: '2026-01-20 14:00',
                    nonRentalDuration: '20天',
                    receivePromotions: true,
                    // Credit Cards
                    creditCards: [
                        { id: 'cc1', bank: '中国信托', number: '**** **** **** 1234', expiry: '12/28', type: 'visa' },
                        { id: 'cc2', bank: '玉山银行', number: '**** **** **** 5678', expiry: '06/29', type: 'mastercard' }
                    ],
                    // Photos (Mock URLs)
                    photos: {
                        idCardFront: documentPlaceholder,
                        idCardBack: documentPlaceholder,
                        licenseFront: documentPlaceholder,
                        licenseBack: documentPlaceholder,
                        selfie: profilePlaceholder
                    }
                });

                const photoLabels = {
                    idCardFront: '身份证正面',
                    idCardBack: '身份证反面',
                    licenseFront: '驾照正面',
                    licenseBack: '驾照反面',
                    selfie: '自拍照'
                };

                // Computed: Member Statistics
                const memberStats = computed(() => ({
                    totalOrders: 15,
                    monthOrders: 3,
                    totalSpent: 28500,
                    monthSpent: 5200,
                    currentPoints: 2450,
                    monthPoints: 350
                }));

                // Helper Functions
                const getMembershipColor = (planId) => {
                    const colors = { 'MP001': 'info', 'MP002': 'primary', 'MP003': 'warning', 'MP004': 'danger' };
                    return colors[planId] || 'info';
                };

                const statusText = computed(() => {
                    const map = { active: '正常', frozen: '已冻结', deleted: '已注销' };
                    return map[member.status] || '未知';
                });

                const statusType = computed(() => {
                    const map = { active: 'success', frozen: 'danger', deleted: 'info' };
                    return map[member.status] || 'info';
                });

                const getVehicleTypeLabel = (type) => {
                    const map = {
                        car: '汽车',
                        motorcycle: '摩托车',
                        microElectric: '微电车'
                    };
                    return map[type] || '-';
                };

                const getVehicleTypeTagType = (type) => {
                    const map = {
                        car: 'success',
                        motorcycle: 'warning',
                        microElectric: 'info'
                    };
                    return map[type] || 'info';
                };

                // Mock List Data Generators
                const generateOrders = () => {
                    return Array(10).fill(0).map((_, i) => ({
                        id: 'ORD' + (20260201 + i),
                        type: ['same_station', 'diff_station', 'store', 'kiosk'][i % 4],
                        typeText: ['同站租还', '甲租乙还', '门市租车', '24h自助'][i % 4],
                        vehicle: 'Toyota Altis (ABC-123' + i + ')',
                        pickup: '台北总店',
                        returnLocation: i % 4 === 1 ? '桃园机场店' : '台北总店',
                        duration: (i + 1) + '天',
                        amount: 1200 + i * 500,
                        status: ['completed', 'active', 'cancelled'][i % 3],
                        statusText: ['已完成', '进行中', '已取消'][i % 3]
                    }));
                };

                const generateTransactions = () => Array(5).fill(0).map((_, i) => ({
                    id: 'TRX' + (8000 + i),
                    time: '2026-02-0' + (i + 1) + ' 10:00',
                    type: ['rent', 'deposit', 'fee', 'refund'][i % 4],
                    typeText: ['租金支付', '押金冻结', '违章扣款', '退款'][i % 4],
                    amount: [1200, 3000, 200, -500][i % 4],
                    method: '信用卡 (********1234)',
                    orderId: 'ORD2026020' + i,
                    status: '成功'
                }));

                const generatePoints = () => Array(5).fill(0).map((_, i) => ({
                    time: '2026-02-0' + (i + 1) + ' 10:00',
                    type: i % 2 === 0 ? 'earn' : 'redeem',
                    typeText: i % 2 === 0 ? '获取' : '消费',
                    change: i % 2 === 0 ? 100 : -50,
                    balance: 2450 - (i * 10),
                    reason: i % 2 === 0 ? '租车奖励' : '兑换优惠券',
                    orderId: 'ORD2026020' + i
                }));

                // Data Refs
                const paginatedOrders = ref(generateOrders());
                const transactions = ref(generateTransactions());
                const points = ref(generatePoints());
                const invites = ref([
                    { time: '2026-01-20', invitee: '李小华', phone: '139****1234', status: 'registered', reward: '100 积分' },
                    { time: '2026-01-22', invitee: '张大伟', phone: '135****5678', status: 'pending', reward: '-' }
                ]);
                const serviceLogs = ref([
                    { time: '2026-02-01', channel: '电话', ticketId: 'TKT001', subject: '询问租车流程', status: 'closed', operator: '客服A' },
                    { time: '2026-02-05', channel: '在线', ticketId: 'TKT005', subject: '修改订单时间', status: 'processing', operator: '客服B' }
                ]);
                const planHistory = ref([
                    { time: '2026-01-15', oldPlan: '普通会员', newPlan: '银牌会员', type: 'upgrade', typeText: '升级', reason: '自动升级', operator: '系统' }
                ]);
                const loginLogs = ref([
                    { time: '2026-02-09 14:30', method: 'App', ip: '192.168.1.1', device: 'iPhone 13', status: 'success' },
                    { time: '2026-02-08 10:20', method: 'Web', ip: '192.168.1.1', device: 'Chrome / Mac', status: 'success' }
                ]);
                const accountLogs = ref([
                    { time: '2026-01-15', action: '修改密码', detail: '用户自行修改密码', ip: '192.168.1.1', operator: '用户' }
                ]);

                // Tags helpers
                const getOrderTypeTag = (type) => {
                    const map = { same_station: '', diff_station: 'warning', store: 'info', kiosk: 'success' };
                    return map[type] || '';
                };
                const getOrderStatusTag = (status) => {
                    const map = { completed: 'success', active: 'primary', cancelled: 'info' };
                    return map[status] || '';
                };
                const getTransactionTypeTag = (type) => {
                    const map = { rent: 'primary', deposit: 'warning', fee: 'danger', refund: 'success' };
                    return map[type] || 'info';
                };

                // Actions
                const goBack = () => {
                    router.push('/operation/members');
                };

                const handleEdit = () => {
                    ElMessage.success('跳转到编辑模式');
                };

                const handleFreeze = () => {
                    ElMessageBox.confirm('确定要冻结该账号吗？', '提示', { type: 'warning' })
                        .then(() => {
                            member.status = 'frozen';
                            ElMessage.success('账号已冻结');
                        });
                };

                const handleUnfreeze = () => {
                    member.status = 'active';
                    ElMessage.success('账号已解冻');
                };

                const handleDeleteCard = (cardId) => {
                    ElMessageBox.confirm('确定要解绑这张信用卡吗？', '提示', { type: 'warning' })
                        .then(() => {
                            const index = member.creditCards.findIndex(c => c.id === cardId);
                            if (index !== -1) {
                                member.creditCards.splice(index, 1);
                                ElMessage.success('信用卡已解绑');
                            }
                        });
                };

                const memberId = route.query.id;
                if (memberId) {
                    member.id = memberId;
                    // In real app, fetch member details by ID here
                }
</script>

<style scoped>
        .member-detail-page {
            min-height: 100%;
        }

        [v-cloak] {
            display: none;
        }

        .detail-card {
            transition: all 0.3s ease;
        }

        .detail-card:hover {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        /* Metrics Card */
        .metric-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #f3f4f6;
            padding: 20px;
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
        }

        .metric-card:nth-child(1)::before {
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
        }

        .metric-card:nth-child(2)::before {
            background: linear-gradient(90deg, #10b981, #34d399);
        }

        .metric-card:nth-child(3)::before {
            background: linear-gradient(90deg, #f59e0b, #fbbf24);
        }

        .metric-card:nth-child(4)::before {
            background: linear-gradient(90deg, #8b5cf6, #a78bfa);
        }

        .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /* Tabs Styling */
        .custom-tabs :deep(.el-tabs__header) {
            margin-bottom: 0 !important;
            padding: 0 20px;
            border-bottom: 1px solid #f3f4f6 !important;
            background: white;
        }

        .custom-tabs :deep(.el-tabs__nav-wrap::after) {
            height: 1px;
            background-color: transparent !important;
        }

        .custom-tabs :deep(.el-tabs__item) {
            font-size: 14px;
            font-weight: 500;
            color: #6b7280;
            padding: 0 18px !important;
            height: 48px;
            line-height: 48px;
        }

        .custom-tabs :deep(.el-tabs__item.is-active) {
            color: var(--app-color-primary);
            font-weight: 600;
        }

        .custom-tabs :deep(.el-tabs__active-bar) {
            background-color: var(--app-color-primary);
            height: 3px;
            border-radius: 3px 3px 0 0;
            bottom: 0;
        }

        .custom-tabs :deep(.el-tabs__content) {
            background: white;
            border: none;
            padding: 24px;
            min-height: 500px;
            margin-top: 0;
        }

        /* Description List for Basic Info tab */
        .info-desc-list dt {
            color: #9ca3af;
            font-size: 13px;
            margin-bottom: 2px;
        }

        .info-desc-list dd {
            color: #1f2937;
            font-size: 14px;
            font-weight: 500;
        }
</style>
