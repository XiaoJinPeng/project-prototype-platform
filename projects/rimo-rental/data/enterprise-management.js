const cloneRecords = (records) => records.map((record) => ({ ...record }));

const employeeReviewRecords = [
  { name: '张志明', idNumber: 'D456789012', email: 'ming.zhang@rimo.demo', phone: '0935-768-220', companyName: '宝龙分公司', departmentName: '业务部', rank: '一般员工', applyTime: '2026-06-20 14:30' },
  { name: '黄柏翰', idNumber: 'E567890123', email: 'bohan.huang@rimo.demo', phone: '0900-668-321', companyName: '启迪分公司', departmentName: '行政部', rank: '主管', applyTime: '2026-06-21 09:15' },
  { name: '刘佳玲', idNumber: 'F667890123', email: 'jialing.liu@rimo.demo', phone: '0921-002-118', companyName: '人工智能分公司', departmentName: '研发部', rank: '一般员工', applyTime: '2026-06-21 16:45' },
];

const departmentRecords = [
  { companyName: '宝龙分公司', departmentName: '行政部', userCount: 18, vehicles: 2, status: '启用' },
  { companyName: '宝龙分公司', departmentName: '业务部', userCount: 24, vehicles: 3, status: '启用' },
  { companyName: '启迪分公司', departmentName: '运营部', userCount: 9, vehicles: 1, status: '停用' },
];

const branchCompanyRecords = [
  { companyName: '宝龙分公司', departmentCount: 5, userCount: 42, parkingName: '八轮测试-宝龙用车点', sysUserName: '王怡君', account: 'baolong_admin', state: '启用' },
  { companyName: '启迪分公司', departmentCount: 3, userCount: 23, parkingName: '八轮测试-启迪用车点', sysUserName: '陈建宏', account: 'qidi_admin', state: '启用' },
  { companyName: '人工智能分公司', departmentCount: 2, userCount: 11, parkingName: '八轮测试-人工智能用车点', sysUserName: '林雅婷', account: 'ai_admin', state: '停用' },
];

const officialCarBillRecords = [
  { billDate: '2026/06/01', contractNo: 'CT-2026-0601', type: '续费', contractCars: 8, period: '2026/06/01 - 2026/06/30', total: '128,000', status: '待确认', paidCars: 0, paidAmount: '0', actions: ['确认'] },
  { billDate: '2026/05/01', contractNo: 'CT-2026-0501', type: '新增', contractCars: 6, period: '2026/05/01 - 2026/05/31', total: '96,000', status: '待汇款', paidCars: 0, paidAmount: '0', actions: ['详情', '汇款'] },
  { billDate: '2026/04/01', contractNo: 'CT-2026-0401', type: '续费', contractCars: 6, period: '2026/04/01 - 2026/04/30', total: '96,000', status: '已缴费', paidCars: 6, paidAmount: '96,000', actions: ['详情', '汇款明细'] },
  { billDate: '2026/03/01', contractNo: 'CT-2026-0301', type: '续费', contractCars: 5, period: '2026/03/01 - 2026/03/31', total: '80,000', status: '已过期', paidCars: 5, paidAmount: '80,000', actions: ['详情'] },
];

export const enterpriseCompanyOptions = ['宝龙分公司', '启迪分公司', '人工智能分公司'];

export const enterpriseStationOptions = [
  { label: '八轮测试-宝龙用车点', value: 'baolong' },
  { label: '八轮测试-启迪用车点', value: 'qidi' },
  { label: '八轮测试-人工智能用车点', value: 'ai' },
  { label: '八轮测试-总部地下停车场', value: 'hq_b1' },
];

export const createEmployeeReviewRecords = () => cloneRecords(employeeReviewRecords);
export const createDepartmentRecords = () => cloneRecords(departmentRecords);
export const createBranchCompanyRecords = () => cloneRecords(branchCompanyRecords);
export const createOfficialCarBillRecords = () => cloneRecords(officialCarBillRecords);