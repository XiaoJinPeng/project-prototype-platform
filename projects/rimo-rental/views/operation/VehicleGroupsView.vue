<template>
<div class="vehicle-groups-page">
            
            

            
            <main>
                
                <PageHeader unstyled class="flex justify-between items-end mb-6" title="车型组管理" description="定义车型级别、基础信息及默认展示图片。" title-class="text-2xl font-bold text-gray-800 tracking-tight" description-class="text-gray-500 text-sm mt-1">
                    <template #actions>
                        <el-button plain size="large" @click="openBrandManager">
                            <el-icon class="mr-1"><Setting></Setting></el-icon> 管理品牌库
                        </el-button>
                        <el-button type="primary" size="large" class="shadow-md shadow-indigo-500/20" @click="openDialog(null)">
                            <el-icon class="mr-1"><Plus></Plus></el-icon> 新增车型组
                        </el-button>
                    </template>
                </PageHeader><div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    
                    <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <div class="flex gap-3 items-center flex-wrap">
                            <el-input v-model="searchQuery" placeholder="搜索品牌或型号..." clearable style="width: 280px"
                                prefix-icon="Search"></el-input>
                        </div>
                        <div class="text-sm text-gray-500">共 {{ filteredGroups.length }} 个车型组</div>
                    </div>
                    <el-table :data="filteredGroups" style="width: 100%">
                        <el-table-column label="车型图片" width="120">
                            <template #default="{ row }">
                                <el-image :src="row.defaultPhotoUrl" class="w-16 h-12 rounded object-cover border"
                                    :preview-src-list="[row.defaultPhotoUrl]" preview-teleported>
                                    <template #error>
                                        <div 
                                            class="w-16 h-12 bg-gray-100 flex items-center justify-center text-gray-400">
                                            <el-icon>
                                                <Picture></Picture>
                                            </el-icon>
                                        </div>
                                    </template>
                                </el-image>
                            </template>
                        </el-table-column>
                        <el-table-column label="品牌 / 型号" min-width="180">
                            <template #default="{ row }">
                                <div class="font-bold text-gray-800">{{ row.brand }} {{ row.model }}</div>
                                <div class="text-xs text-gray-500">{{ row.year }}款</div>
                            </template>
                        </el-table-column>
                        <el-table-column label="载具类型" width="100">
                            <template #default="{ row }">
                                <el-tag :type="getVehicleTypeTagType(row.vehicleType)" size="small"
                                    effect="plain">
                                    {{ getVehicleTypeLabel(row.vehicleType) }}
                                </el-tag>
                            </template>
                        </el-table-column>

                        <el-table-column label="特性标签" min-width="250">
                            <template #default="{ row }">
                                <div class="flex gap-1 flex-wrap">
                                    <el-tag v-for="tag in row.features" :key="tag" size="small" type="info"
                                        effect="plain">{{ tag }}</el-tag>
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="180" align="right">
                            <template #default="{ row }">
                                <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
                                <el-button type="danger" link @click="deleteGroup(row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </main>
        </div>

        
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑车型组' : '新增车型组'" width="860px">
            <el-form :model="currentGroup" label-position="top">
                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="载具类型" required>
                        <el-select v-model="currentGroup.vehicleType" placeholder="请选择载具类型" class="w-full"
                            @change="handleVehicleTypeChange">
                            <el-option label="汽车" value="car"></el-option>
                            <el-option label="摩托车" value="motorcycle"></el-option>
                            <el-option label="微电车" value="microElectric"></el-option>
                        </el-select>
                        <div class="text-xs text-gray-400 mt-1">先选择载具类型，再选择对应可用的厂牌。</div>
                    </el-form-item>
                    <el-form-item label="品牌" required>
                        <el-select v-model="currentGroup.brand" placeholder="请选择品牌" filterable allow-create clearable
                            default-first-option class="w-full" :disabled="!currentGroup.vehicleType">
                            <el-option v-for="item in availableBrands" :key="item.name" :label="item.name"
                                :value="item.name">
                                <div class="flex justify-between items-center w-full">
                                    <span>{{ item.name }}</span>
                                    <div class="flex flex-nowrap gap-1">
                                        <el-tag v-if="item.types && item.types.includes('car')" type="success"
                                            size="small" effect="plain" class="scale-90 origin-right ml-1">汽车</el-tag>
                                        <el-tag v-if="item.types && item.types.includes('motorcycle')" type="warning"
                                            size="small" effect="plain" class="scale-90 origin-right ml-1">摩托车</el-tag>
                                        <el-tag v-if="item.types && item.types.includes('microElectric')" type="info"
                                            size="small" effect="plain" class="scale-90 origin-right ml-1">微电车</el-tag>
                                    </div>
                                </div>
                            </el-option>
                        </el-select>
                        <div class="text-xs text-gray-400 mt-1">注: 下拉列表仅显示支持当前所选载具类型的品牌</div>
                    </el-form-item>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="型号" required>
                        <el-input v-model="currentGroup.model" placeholder="例如: Model 3"></el-input>
                    </el-form-item>
                    <el-form-item label="年款">
                        <el-input v-model="currentGroup.year" placeholder="例如: 2023"></el-input>
                    </el-form-item>
                </div>

                <div class="grid grid-cols-3 gap-4">
                    <el-form-item label="所属类型">
                        <el-select v-model="currentGroup.originType" placeholder="请选择" class="w-full">
                            <el-option label="国产" value="domestic"></el-option>
                            <el-option label="进口" value="imported"></el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="座位数">
                        <el-input-number v-model="currentGroup.seatCount" :min="1" :step="1"
                            class="w-full"></el-input-number>
                    </el-form-item>
                    <el-form-item label="排量">
                        <el-input v-model="currentGroup.displacement" placeholder="例如: 2.0L / 1250cc / 纯电"></el-input>
                    </el-form-item>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <el-form-item label="油箱容量 (L)">
                        <el-input-number v-model="currentGroup.fuelTankCapacity" :min="0" :step="1"
                            class="w-full"></el-input-number>
                    </el-form-item>
                    <el-form-item label="行李箱容量 (L)">
                        <el-input-number v-model="currentGroup.trunkCapacity" :min="0" :step="10"
                            class="w-full"></el-input-number>
                    </el-form-item>
                </div>

                <el-form-item label="上传车型照片">
                    <div class="w-full space-y-4">
                        <el-upload :show-file-list="false" :auto-upload="false" accept="image/*" multiple
                            :on-change="handlePhotoChange">
                            <el-button type="primary" plain>
                                <el-icon class="mr-1">
                                    <Upload></Upload>
                                </el-icon>
                                上传图片
                            </el-button>
                        </el-upload>
                        <div class="text-xs text-gray-500 leading-6">
                            <div>支持上传 JPG、PNG、WebP，可上传多张；默认首张会作为列表缩略图。</div>
                            <el-button v-if="currentGroup.photoList && currentGroup.photoList.length" link type="danger"
                                class="!px-0" @click="clearPhoto">移除全部照片</el-button>
                        </div>
                        <div v-if="currentGroup.photoList && currentGroup.photoList.length"
                            class="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                            <div class="text-sm font-medium text-gray-700 mb-3">照片地址链接</div>
                            <div v-for="(photo, index) in currentGroup.photoList" :key="photo.url || index"
                                class="py-3 border-t border-gray-200 first:border-t-0">
                                <div class="text-xs text-gray-400 mb-2">图片 {{ index + 1 }}</div>
                                <div class="flex items-center gap-3">
                                    <img :src="photo.url"
                                        class="w-20 h-16 rounded-lg object-cover border border-gray-200 bg-white">
                                    <el-input :model-value="photo.url" readonly class="flex-1">
                                        <template #append>
                                            <el-button type="danger" link
                                                @click="removePhotoByIndex(index)">删除</el-button>
                                        </template>
                                    </el-input>
                                </div>
                            </div>
                        </div>
                    </div>
                </el-form-item>



                <el-form-item label="特性标签 (逗号分隔)">
                    <el-input v-model="featureInput" placeholder="例如: 自动挡,倒车影像,全景天窗" @blur="parseFeatures"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="saveGroup">保存</el-button>
            </template>
        </el-dialog>

        
        <el-dialog v-model="brandManagerVisible" title="管理品牌库" width="600px">
            <div class="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div class="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2"><el-icon>
                        <Plus></Plus>
                    </el-icon>添加新品牌</div>
                <div class="flex gap-2 items-start">
                    <el-input v-model="newBrandInput" placeholder="输入新品牌名称 (如: BMW)" class="w-64"
                        @keyup.enter="addBrand"></el-input>
                    <el-checkbox-group v-model="newBrandTypes"
                        class="flex items-center pt-1 px-3 border border-gray-200 rounded bg-white">
                        <el-checkbox value="car" size="small">汽车</el-checkbox>
                        <el-checkbox value="motorcycle" size="small">摩托车</el-checkbox>
                        <el-checkbox value="microElectric" size="small">微电车</el-checkbox>
                    </el-checkbox-group>
                    <el-button type="primary" @click="addBrand"
                        :disabled="!newBrandInput || newBrandTypes.length === 0">添加</el-button>
                </div>
            </div>
            <div class="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                <el-table :data="brandOptions" style="width: 100%" size="small">
                    <el-table-column prop="name" label="品牌名称" min-width="150">
                        <template #default="{ row }">
                            <span class="font-medium text-gray-700">{{ row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="支持载具类型" width="200">
                        <template #default="{ row }">
                            <div class="flex gap-1">
                                <el-tag v-if="row.types && row.types.includes('car')" type="success" size="small"
                                    effect="plain">汽车</el-tag>
                                <el-tag v-if="row.types && row.types.includes('motorcycle')" type="warning" size="small"
                                    effect="plain">摩托车</el-tag>
                                <el-tag v-if="row.types && row.types.includes('microElectric')" type="info" size="small"
                                    effect="plain">微电车</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center">
                        <template #default="{ $index }">
                            <el-button type="danger" link size="small" @click="removeBrand($index)">
                                <el-icon>
                                    <Delete></Delete>
                                </el-icon>删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div v-if="brandOptions.length === 0" class="p-8 text-center text-gray-400 text-sm">
                    暂无品牌数据
                </div>
            </div>
        </el-dialog>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { PageHeader } from '@/components/ui';
import sedanPhoto from '../../assets/demo/vehicle-sedan.jpg';
import electricPhoto from '../../assets/demo/vehicle-electric.jpg';
import vehiclePlaceholder from '../../assets/demo/vehicle-placeholder.svg';

// Mock Data
                const groupsData = ref([
                    {
                        id: 'G1',
                        brand: 'Tesla',
                        model: 'Model 3',
                        year: '2023',
                        vehicleType: 'car',
                        originType: 'imported',
                        seatCount: 5,
                        displacement: '纯电',
                        fuelTankCapacity: 0,
                        trunkCapacity: 425,
                        defaultPhotoUrl: electricPhoto,
                        features: ['自动驾驶', '全景天窗', '超充支持']
                    },
                    {
                        id: 'G2',
                        brand: 'Hyundai',
                        model: 'IONIQ 5',
                        year: '2024',
                        vehicleType: 'car',
                        originType: 'imported',
                        seatCount: 5,
                        displacement: '纯电',
                        fuelTankCapacity: 0,
                        trunkCapacity: 527,
                        defaultPhotoUrl: sedanPhoto,
                        features: ['800V快充', 'V2L外放', '双12.3寸屏']
                    },
                    {
                        id: 'G3',
                        brand: 'BMW',
                        model: 'R 1250 GS',
                        year: '2023',
                        vehicleType: 'motorcycle',
                        originType: 'imported',
                        seatCount: 2,
                        displacement: '1254cc',
                        fuelTankCapacity: 20,
                        trunkCapacity: 0,
                        defaultPhotoUrl: vehiclePlaceholder,
                        features: ['ABS', '加热把手', '电子悬挂']
                    },
                    {
                        id: 'G4',
                        brand: 'Honda',
                        model: 'Rebel 500',
                        year: '2022',
                        vehicleType: 'motorcycle',
                        originType: 'imported',
                        seatCount: 2,
                        displacement: '471cc',
                        fuelTankCapacity: 11,
                        trunkCapacity: 0,
                        defaultPhotoUrl: vehiclePlaceholder,
                        features: ['低座高', '复古风格']
                    },
                    {
                        id: 'G5',
                        brand: 'RIMO',
                        model: 'Mini EV',
                        year: '2024',
                        vehicleType: 'microElectric',
                        originType: 'domestic',
                        seatCount: 2,
                        displacement: '纯电',
                        fuelTankCapacity: 0,
                        trunkCapacity: 80,
                        defaultPhotoUrl: vehiclePlaceholder,
                        features: ['免驾照', '低速代步', '团体票券']
                    }
                ]);

                // State
                const dialogVisible = ref(false);
                const isEdit = ref(false);
                const currentGroup = reactive({});
                const featureInput = ref('');

                // Brand Management State
                const brandManagerVisible = ref(false);
                const newBrandInput = ref('');
                const newBrandTypes = ref(['car']);

                // Reactive Brand Options
                const brandOptions = ref([
                    { name: 'Toyota (丰田)', types: ['car'] },
                    { name: 'Honda (本田)', types: ['car', 'motorcycle'] },
                    { name: 'Nissan (日产)', types: ['car'] },
                    { name: 'Ford (福特)', types: ['car'] },
                    { name: 'Hyundai (现代)', types: ['car'] },
                    { name: 'Benz (奔驰)', types: ['car'] },
                    { name: 'BMW (宝马)', types: ['car', 'motorcycle'] },
                    { name: 'Audi (奥迪)', types: ['car'] },
                    { name: 'Lexus (雷克萨斯)', types: ['car'] },
                    { name: 'Tesla (特斯拉)', types: ['car'] },
                    { name: 'Volvo (沃尔沃)', types: ['car'] },
                    { name: 'Porsche (保时捷)', types: ['car'] },
                    { name: 'Mazda (马自达)', types: ['car'] },
                    { name: 'Volkswagen (大众)', types: ['car'] },
                    { name: 'Suzuki (铃木)', types: ['car', 'motorcycle'] },
                    { name: 'MG (名爵)', types: ['car'] },
                    { name: 'BYD (比亚迪)', types: ['car'] },
                    { name: 'RIMO', types: ['microElectric'] },
                    { name: 'Micro Mobility', types: ['microElectric'] },
                    { name: 'Yamaha (雅马哈)', types: ['motorcycle'] },
                    { name: 'Kawasaki (川崎)', types: ['motorcycle'] },
                    { name: 'Ducati (杜卡迪)', types: ['motorcycle'] }
                ]);

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

                // Compute available brands based on selected vehicle type
                const availableBrands = computed(() => {
                    if (!currentGroup.vehicleType) return [];
                    return brandOptions.value.filter(b => b.types && b.types.includes(currentGroup.vehicleType));
                });

                // Brand Management Methods
                const openBrandManager = () => {
                    brandManagerVisible.value = true;
                    newBrandInput.value = '';
                    newBrandTypes.value = ['car'];
                };

                const addBrand = () => {
                    const val = newBrandInput.value.trim();
                    if (!val || newBrandTypes.value.length === 0) return;
                    if (brandOptions.value.some(b => b.name === val)) {
                        ElMessage.warning('该品牌已存在');
                        return;
                    }
                    brandOptions.value.unshift({ name: val, types: [...newBrandTypes.value] }); // Add to top
                    newBrandInput.value = '';
                    newBrandTypes.value = ['car']; // reset
                    ElMessage.success('添加成功');
                };

                const removeBrand = (index) => {
                    brandOptions.value.splice(index, 1);
                    ElMessage.success('已移除');
                };

                // Methods
                const normalizePhotoList = (group) => {
                    const photos = Array.isArray(group.photoList) && group.photoList.length
                        ? group.photoList
                        : (group.defaultPhotoUrl ? [{ name: '车型照片1', url: group.defaultPhotoUrl }] : []);

                    group.photoList = photos.map((photo, index) => ({
                        name: photo.name || `车型照片${index + 1}`,
                        url: photo.url || photo.response?.url || ''
                    })).filter(photo => photo.url);

                    group.defaultPhotoUrl = group.photoList[0]?.url || '';
                };

                const normalizeGroupFields = (group) => {
                    Object.assign(group, {
                        originType: group.originType || '',
                        seatCount: group.seatCount ?? (group.vehicleType === 'car' ? 5 : 2),
                        displacement: group.displacement || '',
                        fuelTankCapacity: group.fuelTankCapacity ?? 0,
                        trunkCapacity: group.trunkCapacity ?? 0,
                        defaultPhotoUrl: group.defaultPhotoUrl || '',
                        features: Array.isArray(group.features) ? group.features : []
                    });
                    normalizePhotoList(group);
                };

                const handleVehicleTypeChange = (vehicleType) => {
                    if (currentGroup.brand && !availableBrands.value.some(item => item.name === currentGroup.brand)) {
                        currentGroup.brand = '';
                    }

                    if (!isEdit.value) {
                        currentGroup.seatCount = vehicleType === 'car' ? 5 : 2;
                    }
                };

                const handlePhotoChange = (uploadFile) => {
                    if (!uploadFile || !uploadFile.raw) return;
                    if (!Array.isArray(currentGroup.photoList)) currentGroup.photoList = [];

                    currentGroup.photoList.push({
                        name: uploadFile.name || `车型照片${currentGroup.photoList.length + 1}`,
                        url: uploadFile.url || URL.createObjectURL(uploadFile.raw)
                    });
                    currentGroup.defaultPhotoUrl = currentGroup.photoList[0]?.url || '';
                };

                const removePhotoByIndex = (index) => {
                    if (!Array.isArray(currentGroup.photoList)) return;
                    currentGroup.photoList.splice(index, 1);
                    currentGroup.defaultPhotoUrl = currentGroup.photoList[0]?.url || '';
                };

                const clearPhoto = () => {
                    currentGroup.photoList = [];
                    currentGroup.defaultPhotoUrl = '';
                };

                const openDialog = (row) => {
                    if (row) {
                        isEdit.value = true;
                        Object.assign(currentGroup, JSON.parse(JSON.stringify(row)));
                        normalizeGroupFields(currentGroup);
                        featureInput.value = currentGroup.features ? currentGroup.features.join(',') : '';
                    } else {
                        isEdit.value = false;
                        Object.assign(currentGroup, {
                            id: Date.now(),
                            vehicleType: '',
                            brand: '',
                            model: '',
                            year: new Date().getFullYear().toString(),
                            originType: '',
                            seatCount: 5,
                            displacement: '',
                            fuelTankCapacity: 0,
                            trunkCapacity: 0,
                            defaultPhotoUrl: '',
                            photoList: [],
                            features: []
                        });
                        normalizeGroupFields(currentGroup);
                        featureInput.value = '';
                    }
                    dialogVisible.value = true;
                };

                const parseFeatures = () => {
                    if (!featureInput.value) {
                        currentGroup.features = [];
                        return;
                    }
                    currentGroup.features = featureInput.value.split(/[,，]/).map(s => s.trim()).filter(s => s);
                };

                const saveGroup = () => {
                    parseFeatures();
                    normalizeGroupFields(currentGroup);
                    if (!currentGroup.vehicleType || !currentGroup.brand || !currentGroup.model) {
                        ElMessage.warning('请先选择载具类型，并填写厂牌和型号');
                        return;
                    }

                    if (isEdit.value) {
                        const idx = groupsData.value.findIndex(g => g.id === currentGroup.id);
                        if (idx !== -1) groupsData.value[idx] = { ...currentGroup };
                    } else {
                        groupsData.value.push({ ...currentGroup });
                    }
                    dialogVisible.value = false;
                    ElMessage.success('保存成功');
                };

                const deleteGroup = (row) => {
                    ElMessageBox.confirm('确定要删除该车型组吗?', '警告', { type: 'warning' }).then(() => {
                        const idx = groupsData.value.findIndex(g => g.id === row.id);
                        if (idx !== -1) {
                            groupsData.value.splice(idx, 1);
                            ElMessage.success('删除成功');
                        }
                    });
                };

                // Search Logic
                const searchQuery = ref('');
                const filteredGroups = computed(() => {
                    if (!searchQuery.value) return groupsData.value;
                    const q = searchQuery.value.toLowerCase();
                    return groupsData.value.filter(g =>
                        g.brand.toLowerCase().includes(q) ||
                        g.model.toLowerCase().includes(q)
                    );
                });
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
            width: 6px;
        }

        .custom-scroll::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }
</style>
