<template>
            <main class="vehicle-add-page">
                    <div class="vehicle-add-back-row">
                        <el-button plain @click="goBack">
                            <el-icon class="mr-1">
                                <ArrowLeft></ArrowLeft>
                            </el-icon>
                            返回
                        </el-button>
                    </div>

                    <section class="vehicle-section">
                        <div class="vehicle-section__header">
                            <el-icon>
                                <Van></Van>
                            </el-icon>
                            基本资料
                        </div>
                        <div class="vehicle-section__body">
                            <div class="vehicle-grid">
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>资产归属分公司</strong></div>
                                    <el-select v-model="form.assetBranch" placeholder="请选择资产归属分公司" @change="ensureTemplateScope">
                                        <el-option v-for="item in branchOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>所在据点</strong></div>
                                    <el-select v-model="form.siteId" placeholder="请选择所在据点">
                                        <el-option v-for="item in siteOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车牌号码</strong></div>
                                    <div class="inline-action-row">
                                        <div class="vehicle-field">
                                            <el-input v-model="form.plateNo" placeholder="请输入车牌号码"></el-input>
                                        </div>
                                        <el-button class="plate-sync-button" type="primary" plain @click="syncVehicleSeed">同步带入</el-button>
                                    </div>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车款</strong></div>
                                    <el-select v-model="form.modelId" placeholder="请选择车款" @change="handleModelChange">
                                        <el-option v-for="item in filteredModelOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>厂牌</strong></div>
                                    <el-select v-model="form.brandId" placeholder="请选择厂牌" @change="handleBrandChange">
                                        <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车辆类型</strong></div>
                                    <el-select v-model="form.vehicleType" placeholder="请选择车辆类型">
                                        <el-option v-for="item in vehicleTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车款年份</strong></div>
                                    <el-date-picker v-model="form.modelYear" type="year" placeholder="请选择年份" format="YYYY" value-format="YYYY"></el-date-picker>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>是否国产</strong></div>
                                    <el-select v-model="form.domesticFlag" placeholder="请选择">
                                        <el-option label="国产" value="domestic"></el-option>
                                        <el-option label="进口" value="imported"></el-option>
                                    </el-select>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>座位数</strong></div>
                                    <el-input-number v-model="form.seats" :min="1" :max="20"></el-input-number>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>排气量 (cc)</strong></div>
                                    <el-input v-model="form.displacement" placeholder="请输入排气量"></el-input>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>油箱容量 (L)</strong></div>
                                    <el-input v-model="form.tankCapacity" placeholder="请输入油箱容量"></el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>行李箱容量 (L)</strong></div>
                                    <el-input v-model="form.trunkCapacity" placeholder="请输入行李箱容量"></el-input>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车辆名称（昵称）</strong></div>
                                    <el-input v-model="form.nickname" placeholder="请输入车辆名称或内部识别名称"></el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车门数量</strong></div>
                                    <el-input-number v-model="form.doorCount" :min="1" :max="8"></el-input-number>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>变速箱类型</strong></div>
                                    <el-select v-model="form.gearboxType" placeholder="请选择变速箱类型">
                                        <el-option label="自排" value="auto"></el-option>
                                        <el-option label="手排" value="manual"></el-option>
                                        <el-option label="CVT" value="cvt"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车身颜色</strong></div>
                                    <el-select v-model="form.color" placeholder="请选择车身颜色">
                                        <el-option v-for="item in colorOptions" :key="item" :label="item" :value="item"></el-option>
                                    </el-select>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><strong>出厂日期</strong></div>
                                    <el-date-picker v-model="form.releaseDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD"></el-date-picker>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>上架里程</strong></div>
                                    <el-input v-model="form.listingMileage" placeholder="请输入上架里程">
                                        <template #append>km</template>
                                    </el-input>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><strong>VIN</strong></div>
                                    <el-input v-model="form.vin" placeholder="请输入 VIN"></el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>引擎编号</strong></div>
                                    <el-input v-model="form.engineNo" placeholder="请输入引擎编号"></el-input>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><strong>车主（车辆所有人）</strong></div>
                                    <el-input v-model="form.ownerName" placeholder="请输入车辆所有人"></el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>燃料类型</strong></div>
                                    <el-select v-model="form.fuelType" placeholder="请选择燃料类型">
                                        <el-option label="汽油" value="gasoline"></el-option>
                                        <el-option label="柴油" value="diesel"></el-option>
                                        <el-option label="油电" value="hybrid"></el-option>
                                        <el-option label="纯电" value="ev"></el-option>
                                    </el-select>
                                </div>

                                <div class="vehicle-field">
                                    <div class="field-label"><strong>车辆来源</strong></div>
                                    <el-select v-model="form.sourceType" placeholder="请选择车辆来源">
                                        <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>启用状态</strong></div>
                                    <div class="status-radio-group">
                                        <el-radio-group v-model="form.enableStatus">
                                            <el-radio label="inactive">未启用</el-radio>
                                            <el-radio label="active">启用</el-radio>
                                            <el-radio label="archived">封存</el-radio>
                                        </el-radio-group>
                                    </div>
                                </div>

                                <div class="vehicle-field span-2">
                                    <div class="field-label"><span class="field-required">*</span> <strong>车辆照片</strong></div>
                                    <div class="photo-block">
                                        <div class="photo-upload-box" @click="appendPhotoMock">
                                            <el-icon>
                                                <PictureFilled></PictureFilled>
                                            </el-icon>
                                            <div>点击补充车辆照片</div>
                                            <div class="text-[11px] text-slate-400">用于列表预览与车辆详情</div>
                                        </div>
                                        <div class="photo-list">
                                            <div v-for="(photo, index) in photoMocks" :key="photo.key" class="photo-item">
                                                <div class="photo-item__preview">{{ photo.title }}</div>
                                                <div class="photo-item__meta">
                                                    <div class="font-semibold text-gray-700">{{ photo.caption }}</div>
                                                    <div class="text-gray-400 mt-1">第 {{ index + 1 }} 张</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="vehicle-section">
                        <div class="vehicle-section__header">
                            <el-icon>
                                <CollectionTag></CollectionTag>
                            </el-icon>
                            车辆标签
                        </div>
                        <div class="vehicle-section__body">
                            <div class="vehicle-grid">
                                <div class="vehicle-field span-2">
                                    <div class="field-label">
                                        <strong>车辆标签</strong>
                                        <span class="tag-manage-link">标签管理</span>
                                    </div>
                                    <el-select v-model="form.tagIds" multiple collapse-tags collapse-tags-tooltip filterable placeholder="请选择车辆标签">
                                        <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="vehicle-section">
                        <div class="vehicle-section__header">
                            <el-icon>
                                <Tools></Tools>
                            </el-icon>
                            清洁保养资料
                        </div>
                        <div class="vehicle-section__body">
                            <div class="vehicle-grid">
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>保养母版</strong></div>
                                    <el-select v-model="form.maintenanceTemplateId" clearable filterable placeholder="请选择保养母版">
                                        <el-option v-for="item in availableMaintenanceTemplates" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>清洁母版</strong></div>
                                    <el-select v-model="form.cleaningTemplateId" clearable filterable placeholder="请选择清洁母版">
                                        <el-option v-for="item in availableCleaningTemplates" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>上次保养里程</strong></div>
                                    <el-input v-model="form.lastMaintenanceMileage" placeholder="请输入上次保养里程">
                                        <template #append>km</template>
                                    </el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>上次保养时间</strong></div>
                                    <el-date-picker v-model="form.lastMaintenanceDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD"></el-date-picker>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>上次清洁时间</strong></div>
                                    <el-date-picker v-model="form.lastCleaningDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD"></el-date-picker>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="vehicle-section">
                        <div class="vehicle-section__header">
                            <el-icon>
                                <Setting></Setting>
                            </el-icon>
                            其他资料
                        </div>
                        <div class="vehicle-section__body">
                            <div class="vehicle-grid">
                                <div class="vehicle-field">
                                    <div class="field-label"><span class="field-required">*</span> <strong>是否特殊车款</strong></div>
                                    <div class="status-radio-group">
                                        <el-radio-group v-model="form.specialVehicle">
                                            <el-radio :label="true">是</el-radio>
                                            <el-radio :label="false">否</el-radio>
                                        </el-radio-group>
                                    </div>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>车机编号</strong></div>
                                    <el-select v-model="form.deviceCode" placeholder="请选择车机编号">
                                        <el-option v-for="item in deviceOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>ETC 卡号</strong></div>
                                    <el-input v-model="form.etcCardNo" placeholder="请输入 ETC 卡号"></el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>iButton 编号</strong></div>
                                    <el-input v-model="form.iButtonCode" placeholder="请输入 iButton 编号"></el-input>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="vehicle-section">
                        <div class="vehicle-section__header">
                            <el-icon>
                                <Document></Document>
                            </el-icon>
                            保险资料
                        </div>
                        <div class="vehicle-section__body">
                            <div class="vehicle-grid">
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>保单号码</strong></div>
                                    <el-input v-model="form.policyNo" placeholder="请输入保单号码"></el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>投保日期</strong></div>
                                    <el-date-picker v-model="form.insuranceDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD"></el-date-picker>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>到期日期</strong></div>
                                    <el-date-picker v-model="form.insuranceExpireDate" type="date" placeholder="请选择日期" format="YYYY/MM/DD" value-format="YYYY/MM/DD"></el-date-picker>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>保险类型</strong></div>
                                    <el-select v-model="form.insuranceType" placeholder="请选择保险类型">
                                        <el-option label="甲式全险" value="full"></el-option>
                                        <el-option label="乙式车体险" value="car_body"></el-option>
                                        <el-option label="强制险" value="compulsory"></el-option>
                                    </el-select>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>保额</strong></div>
                                    <el-input v-model="form.coverageAmount" placeholder="请输入保额"></el-input>
                                </div>
                                <div class="vehicle-field">
                                    <div class="field-label"><strong>理赔金额</strong></div>
                                    <el-input v-model="form.claimAmount" placeholder="请输入理赔金额"></el-input>
                                </div>
                            </div>
                            <div class="hint-box">
                                新增车辆后，车辆可再到“合约配额管理”、“清洁保养提醒”和“车辆调度排程”继续绑定对应规则与业务配置。
                            </div>
                        </div>
                    </section>

                    <div class="page-actions">
                        <el-button size="large" @click="goBack">返回</el-button>
                        <el-button size="large" type="primary" @click="submitVehicle">提交</el-button>
                    </div>
            </main>
</template>

<script setup>
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();

const brandOptions = [
  { label: 'Toyota', value: 'toyota' },
  { label: 'Lexus', value: 'lexus' },
  { label: 'Mercedes-Benz', value: 'benz' },
  { label: 'Skoda', value: 'skoda' }
];

const modelOptions = [
  { label: 'Toyota Corolla Cross', value: 'corolla_cross', brandId: 'toyota', type: 'suv' },
  { label: 'Toyota Camry', value: 'camry', brandId: 'toyota', type: 'sedan' },
  { label: 'Lexus ES 250', value: 'es250', brandId: 'lexus', type: 'sedan' },
  { label: 'Mercedes-Benz E300', value: 'e300', brandId: 'benz', type: 'sedan' },
  { label: 'Skoda Superb', value: 'superb', brandId: 'skoda', type: 'sedan' }
];

const branchOptions = [
  { label: '台北分公司', value: 'taipei' },
  { label: '台中分公司', value: 'taichung' },
  { label: '高雄分公司', value: 'kaohsiung' },
  { label: '新竹分公司', value: 'hsinchu' }
];

const maintenanceTemplateOptions = [
  { label: '企业通用｜新车', value: 'MT-001', scopeType: 'enterprise', branch: '' },
  { label: '台北分公司｜老车', value: 'MT-002', scopeType: 'branch', branch: 'taipei' },
  { label: '高雄分公司｜常用接待车', value: 'MT-003', scopeType: 'branch', branch: 'kaohsiung' }
];

const cleaningTemplateOptions = [
  { label: '企业通用｜日常清洁', value: 'CT-001', scopeType: 'enterprise', branch: '' },
  { label: '高雄分公司｜高频用车', value: 'CT-002', scopeType: 'branch', branch: 'kaohsiung' },
  { label: '台北分公司｜主管车', value: 'CT-003', scopeType: 'branch', branch: 'taipei' }
];

const siteOptions = [
  { label: '台北总部分地下停车场', value: 'tpe_hq_b1' },
  { label: '台中分公司停车场', value: 'txg_branch_lot' },
  { label: '高雄分公司大楼停车场', value: 'khh_tower_lot' },
  { label: '新竹园区访客停车场', value: 'hsz_park_lot' }
];

const vehicleTypeOptions = [
  { label: '轿车', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: '商务车', value: 'mpv' },
  { label: '微电车', value: 'micro_ev' }
];

const sourceOptions = [
  { label: '自购（自有资产）', value: 'SELF_OWNED' },
  { label: '和运租车', value: 'HESUAN' },
  { label: '格上租车', value: 'GESHANG' },
  { label: '其他合作车源', value: 'OTHER' }
];

const tagOptions = [
  { label: '新车', value: 'new' },
  { label: '接待专用', value: 'vip' },
  { label: '长途优先', value: 'long_trip' },
  { label: '低里程', value: 'low_mileage' }
];

const deviceOptions = [
  { label: 'TBOX-001', value: 'tbox-001' },
  { label: 'TBOX-002', value: 'tbox-002' },
  { label: '未绑定', value: 'none' }
];

const colorOptions = ['白色', '黑色', '银色', '灰色', '深蓝色'];

const photoMocks = ref([
  { key: 'front', title: '车辆照片', caption: '右前 45°' },
  { key: 'rear', title: '车辆照片', caption: '车尾' }
]);

const form = reactive({
  assetBranch: 'taipei',
  siteId: 'tpe_hq_b1',
  plateNo: 'BXR-8899',
  brandId: 'lexus',
  modelId: 'es250',
  modelYear: '2024',
  vehicleType: 'sedan',
  domesticFlag: 'imported',
  seats: 5,
  displacement: '2487',
  tankCapacity: '60',
  trunkCapacity: '454',
  nickname: '台北接待车-01',
  doorCount: 4,
  gearboxType: 'auto',
  color: '黑色',
  releaseDate: '2024/01/18',
  listingMileage: '18200',
  vin: '',
  engineNo: '',
  ownerName: 'RIMO Rental',
  fuelType: 'gasoline',
  sourceType: 'SELF_OWNED',
  enableStatus: 'active',
  tagIds: ['vip'],
  maintenanceTemplateId: 'MT-001',
  cleaningTemplateId: 'CT-001',
  lastMaintenanceMileage: '15000',
  lastMaintenanceDate: '2026/05/12',
  lastCleaningDate: '2026/06/10',
  specialVehicle: false,
  deviceCode: 'tbox-001',
  etcCardNo: '',
  iButtonCode: '',
  policyNo: '',
  insuranceDate: '',
  insuranceExpireDate: '',
  insuranceType: '',
  coverageAmount: '',
  claimAmount: ''
});

const filteredModelOptions = computed(() => {
  if (!form.brandId) return modelOptions;
  return modelOptions.filter((item) => item.brandId === form.brandId);
});

const availableMaintenanceTemplates = computed(() => {
  return maintenanceTemplateOptions.filter((item) => item.scopeType === 'enterprise' || item.branch === form.assetBranch);
});

const availableCleaningTemplates = computed(() => {
  return cleaningTemplateOptions.filter((item) => item.scopeType === 'enterprise' || item.branch === form.assetBranch);
});

const ensureTemplateScope = () => {
  if (form.maintenanceTemplateId && !availableMaintenanceTemplates.value.some((item) => item.value === form.maintenanceTemplateId)) {
    form.maintenanceTemplateId = '';
  }
  if (form.cleaningTemplateId && !availableCleaningTemplates.value.some((item) => item.value === form.cleaningTemplateId)) {
    form.cleaningTemplateId = '';
  }
};

const appendPhotoMock = () => {
  photoMocks.value.push({
    key: `photo-${photoMocks.value.length + 1}`,
    title: '车辆照片',
    caption: `补充图 ${photoMocks.value.length + 1}`
  });
};

const handleBrandChange = () => {
  if (!filteredModelOptions.value.some((item) => item.value === form.modelId)) {
    form.modelId = '';
  }
};

const handleModelChange = (value) => {
  const matched = modelOptions.find((item) => item.value === value);
  if (matched?.type) {
    form.vehicleType = matched.type;
  }
};

const syncVehicleSeed = () => {
  form.brandId = 'toyota';
  form.modelId = 'camry';
  form.modelYear = '2025';
  form.vehicleType = 'sedan';
  form.domesticFlag = 'imported';
  form.seats = 5;
  form.displacement = '2487';
  form.tankCapacity = '60';
  form.trunkCapacity = '524';
  form.nickname = '台北公务车-待建';
  form.doorCount = 4;
  form.gearboxType = 'auto';
  form.color = '银色';
  form.releaseDate = '2025/02/01';
  form.listingMileage = '0';
  ElMessage.success('已同步带入车款基础资料');
};

const goBack = () => {
  router.push('/enterprise/official-vehicles');
};

const submitVehicle = () => {
  const requiredFields = [
    ['资产归属分公司', form.assetBranch],
    ['所在据点', form.siteId],
    ['车牌号码', form.plateNo],
    ['厂牌', form.brandId],
    ['车款', form.modelId],
    ['车款年份', form.modelYear],
    ['车辆类型', form.vehicleType],
    ['座位数', form.seats],
    ['排气量', form.displacement],
    ['油箱容量', form.tankCapacity],
    ['车辆名称（昵称）', form.nickname],
    ['车门数量', form.doorCount],
    ['变速箱类型', form.gearboxType],
    ['车身颜色', form.color],
    ['上架里程', form.listingMileage],
    ['启用状态', form.enableStatus]
  ];

  const missing = requiredFields
    .filter(([, value]) => value === null || value === undefined || String(value).trim() === '')
    .map(([label]) => label);

  if (!photoMocks.value.length) {
    missing.push('车辆照片');
  }

  if (missing.length) {
    ElMessage.warning(`请先完成：${missing.join('、')}`);
    return;
  }

  ElMessage.success('公务车辆已保存');
};
</script>

<style scoped>
.vehicle-add-page {
  min-height: 100%;
  background: transparent;
}

.vehicle-add-page :deep(.el-card__header) {
  padding: 0 !important;
  border-bottom: none !important;
}

.vehicle-add-back-row {
  margin-bottom: 16px;
}

.vehicle-section {
  margin-bottom: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.vehicle-section__header {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 45px;
  padding: 0 16px;
  background: rgba(249, 250, 251, 0.82);
  border-bottom: 1px solid #f1f5f9;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}

.vehicle-section__header .el-icon {
  color: #4f46e5;
  font-size: 18px;
}

.vehicle-section__body {
  padding: 16px;
}

.vehicle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.vehicle-field {
  min-width: 0;
}

.vehicle-field.span-2 {
  grid-column: span 2;
}

.field-label {
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 12px;
  line-height: 16px;
}

.field-label strong {
  color: #374151;
  font-weight: 700;
}

.field-required {
  color: #ef4444;
  font-weight: 700;
}

.vehicle-add-page :deep(.el-input__wrapper),
.vehicle-add-page :deep(.el-select__wrapper),
.vehicle-add-page :deep(.el-textarea__inner),
.vehicle-add-page :deep(.el-date-editor.el-input__wrapper) {
  min-height: 40px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #dbe1ea inset;
  font-size: 13px;
}

.vehicle-add-page :deep(.el-date-editor.el-input),
.vehicle-add-page :deep(.el-date-editor.el-input__wrapper),
.vehicle-add-page :deep(.el-input-number) {
  width: 100%;
}

.inline-action-row {
  display: flex;
  align-items: end;
  gap: 10px;
}

.inline-action-row .vehicle-field {
  flex: 1 1 auto;
}

.plate-sync-button {
  flex: 0 0 auto;
  min-width: 112px;
}

.photo-block {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.photo-upload-box {
  height: 124px;
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
}

.photo-upload-box .el-icon {
  font-size: 28px;
  color: #2563eb;
}

.photo-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.photo-item {
  min-height: 124px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.photo-item__preview {
  height: 84px;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 55%, #f8fafc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
}

.photo-item__meta {
  padding: 8px 10px;
  color: #4b5563;
  font-size: 12px;
  line-height: 16px;
}

.hint-box {
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  background: #f8fbff;
  color: #4b5563;
  font-size: 12px;
  line-height: 18px;
}

.tag-manage-link {
  margin-left: 12px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.status-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  min-height: 40px;
  align-items: center;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  margin-bottom: 12px;
}

@media (max-width: 1080px) {
  .vehicle-grid,
  .photo-block,
  .photo-list {
    grid-template-columns: 1fr;
  }

  .vehicle-field.span-2 {
    grid-column: span 1;
  }

  .inline-action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .plate-sync-button {
    width: 100%;
  }
}
</style>
