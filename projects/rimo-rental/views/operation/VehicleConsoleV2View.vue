<template>
  <!-- 由规范 HTML 原型导入；页面业务状态和模拟数据保留在本页面。 -->
  <section class="vehicle-console-page">
    <!--
                [AI-EDIT] PAGE_HEADER_OPTIONAL
                standard：保留标题、子标题和右侧页面主操作，主操作与标题区底部对齐；
                back-only：改为返回按钮或对象摘要，不强制显示 H1；
                none：二级详情等页面可删除整个 data-page-header，并将 manifest.pageHeaderMode 改为 none。
              -->
    <div
      class="page-heading"
      data-page-header="standard"
      data-block-id="page-heading"
      data-block-name="页面标题"
    >
      <div>
        <h1>车辆控制台</h1>
        <p>集中查看车辆与车机状态，并远程执行车门、防盗及寻车控制。</p>
      </div>
      <div class="heading-actions">
        <el-tooltip content="刷新全部车辆状态" placement="top">
          <el-button
            circle
            size="large"
            :icon="Refresh"
            aria-label="刷新全部车辆状态"
            @click="refreshVehicleData"
          ></el-button>
        </el-tooltip>
        <el-button
          type="primary"
          size="large"
          :icon="Lock"
          @click="requestCommand('BULK_LOCK')"
          >批量锁车</el-button
        >
      </div>
    </div>

    <!--
                [AI-EDIT] BUSINESS_CONTENT_START
                本页面使用 console 布局：车辆列表、车辆状态、地图、远程控制和操作日志。
              -->
    <div data-business-content>
      <section
        class="summary-grid"
        data-block-id="fleet-summary"
        data-block-name="车队概况"
      >
        <article class="summary-card">
          <div class="summary-icon">
            <el-icon size="20"><component :is="Van"></component></el-icon>
          </div>
          <div>
            <div class="summary-label">车辆总数</div>
            <div class="summary-value">{{ vehicles.length }}</div>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon is-success">
            <el-icon size="20"
              ><component :is="Connection"></component
            ></el-icon>
          </div>
          <div>
            <div class="summary-label">当前在线</div>
            <div class="summary-value">{{ onlineVehicleCount }}</div>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon is-warning">
            <el-icon size="20"><component :is="Unlock"></component></el-icon>
          </div>
          <div>
            <div class="summary-label">未上锁车辆</div>
            <div class="summary-value">{{ unlockedVehicleCount }}</div>
          </div>
        </article>
        <article class="summary-card">
          <div class="summary-icon is-danger">
            <el-icon size="20"><component :is="Warning"></component></el-icon>
          </div>
          <div>
            <div class="summary-label">异常告警</div>
            <div class="summary-value">{{ alarmVehicleCount }}</div>
          </div>
        </article>
      </section>

      <div class="console-grid">
        <section
          class="panel"
          data-block-id="vehicle-list"
          data-block-name="车辆列表"
        >
          <div class="panel-header">
            <div>
              <h2 class="section-title">车辆列表</h2>
              <p class="section-subtitle">选择车辆后查看并执行远程控制</p>
            </div>
            <el-tag type="info">{{ filteredVehicles.length }} 辆</el-tag>
          </div>
          <div class="vehicle-filter">
            <el-input
              v-model="vehicleFilters.keyword"
              :prefix-icon="Search"
              clearable
              placeholder="车牌或车型"
            ></el-input>
            <el-select
              v-model="vehicleFilters.status"
              clearable
              placeholder="状态"
            >
              <el-option label="在线" value="online"></el-option>
              <el-option label="离线" value="offline"></el-option>
              <el-option label="告警" value="alarm"></el-option>
            </el-select>
            <el-tooltip content="重置筛选" placement="top">
              <el-button
                circle
                :icon="RefreshLeft"
                aria-label="重置车辆筛选"
                @click="resetVehicleFilters"
              ></el-button>
            </el-tooltip>
          </div>
          <div v-if="filteredVehicles.length" class="vehicle-list">
            <button
              v-for="vehicle in filteredVehicles"
              :key="vehicle.id"
              type="button"
              class="vehicle-card"
              :class="{ 'is-active': vehicle.id === selectedVehicleId }"
              @click="selectVehicle(vehicle)"
            >
              <div class="vehicle-card-top">
                <strong>{{ vehicle.plate }}</strong>
                <el-tag v-if="vehicle.alarm" size="small" type="danger"
                  >告警</el-tag
                >
                <el-tag v-else-if="vehicle.online" size="small" type="success"
                  >在线</el-tag
                >
                <el-tag v-else size="small" type="info">离线</el-tag>
              </div>
              <div class="vehicle-model">
                {{ vehicle.model }} · {{ vehicle.fleet }}
              </div>
              <div class="vehicle-card-bottom">
                <span
                  ><i
                    class="online-dot"
                    :class="{ 'is-online': vehicle.online }"
                  ></i
                  >{{ vehicle.drivingStatus }}</span
                >
                <span>{{ vehicle.lastSeen }}</span>
              </div>
            </button>
          </div>
          <div v-else class="empty-vehicles">没有符合筛选条件的车辆</div>
        </section>

        <div class="workspace-stack">
          <section
            class="panel vehicle-overview"
            data-block-id="vehicle-overview"
            data-block-name="当前车辆状态"
          >
            <div class="overview-top">
              <div>
                <div class="vehicle-title-row">
                  <h2>{{ currentVehicle.plate }}</h2>
                  <el-tag :type="currentVehicle.online ? 'success' : 'info'">
                    {{ currentVehicle.online ? "车辆在线" : "车辆离线" }}
                  </el-tag>
                  <el-tag v-if="currentVehicle.alarm" type="danger"
                    >存在告警</el-tag
                  >
                </div>
                <div class="vehicle-meta">
                  {{ currentVehicle.model }} · VIN 尾号
                  {{ currentVehicle.vinSuffix }} · {{ currentVehicle.fleet }}
                </div>
              </div>
              <div class="last-sync">
                最后同步：{{ currentVehicle.lastSeen }}
              </div>
            </div>

            <div class="status-grid">
              <div class="status-item">
                <div class="status-label">点火状态</div>
                <div
                  class="status-value"
                  :class="currentVehicle.ignition ? 'is-success' : ''"
                >
                  {{ currentVehicle.ignition ? "已点火" : "已熄火" }}
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">车门状态</div>
                <div
                  class="status-value"
                  :class="
                    currentVehicle.doorsLocked ? 'is-success' : 'is-warning'
                  "
                >
                  {{ currentVehicle.doorsLocked ? "已上锁" : "未上锁" }}
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">防盗状态</div>
                <div
                  class="status-value"
                  :class="
                    currentVehicle.antiTheftArmed ? 'is-success' : 'is-warning'
                  "
                >
                  {{ currentVehicle.antiTheftArmed ? "已设防" : "已撤防" }}
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">车机状态</div>
                <div
                  class="status-value"
                  :class="
                    currentVehicle.headUnitOnline ? 'is-success' : 'is-danger'
                  "
                >
                  {{ currentVehicle.headUnitOnline ? "在线" : "离线" }}
                </div>
                <div class="status-detail">
                  {{ currentVehicle.headUnitVersion }}
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">12V 电压</div>
                <div
                  class="status-value"
                  :class="currentVehicle.battery12v < 12 ? 'is-danger' : ''"
                >
                  {{ currentVehicle.battery12v }} V
                </div>
              </div>
              <div class="status-item">
                <div class="status-label">剩余油量</div>
                <div class="status-value">{{ currentVehicle.fuel }}%</div>
              </div>
            </div>
          </section>

          <div class="main-grid">
            <section
              class="panel"
              data-block-id="vehicle-map"
              data-block-name="车辆位置"
            >
              <div class="panel-header">
                <div>
                  <h2 class="section-title">当前车辆位置</h2>
                  <p class="section-subtitle">
                    定位更新时间 {{ currentVehicle.positionUpdatedAt }}
                  </p>
                </div>
                <el-tooltip content="回到车辆位置" placement="top">
                  <el-button
                    circle
                    :icon="Aim"
                    aria-label="回到车辆位置"
                    @click="recenterMap"
                  ></el-button>
                </el-tooltip>
              </div>
              <div class="map-body">
                <div class="map-canvas">
                  <span class="map-block block-a"></span>
                  <span class="map-block block-b"></span>
                  <span class="map-block block-c"></span>
                  <span class="map-block block-d"></span>
                  <span class="map-road road-horizontal"></span>
                  <span class="map-road road-vertical"></span>
                  <span class="map-road road-small"></span>
                  <span class="map-label label-a">市民大道</span>
                  <span class="map-label label-b">南京东路</span>
                  <span
                    class="marker-pulse"
                    :style="{
                      left: currentVehicle.mapX + '%',
                      top: currentVehicle.mapY + '%',
                    }"
                  ></span>
                  <span
                    class="vehicle-marker"
                    :style="{
                      left: currentVehicle.mapX + '%',
                      top: currentVehicle.mapY + '%',
                    }"
                  >
                    <el-icon size="18"
                      ><component :is="Van"></component
                    ></el-icon>
                  </span>
                </div>
                <div class="map-info">
                  <div>
                    <div class="map-address">{{ currentVehicle.location }}</div>
                    <div class="map-coordinates">
                      {{ currentVehicle.latitude }}，{{
                        currentVehicle.longitude
                      }}
                      · 精度约 {{ currentVehicle.accuracy }} 米
                    </div>
                  </div>
                  <el-tag :type="currentVehicle.speed > 0 ? 'success' : 'info'">
                    {{
                      currentVehicle.speed > 0
                        ? currentVehicle.speed + " km/h"
                        : "车辆静止"
                    }}
                  </el-tag>
                </div>
              </div>
            </section>

            <section
              class="panel"
              data-block-id="remote-control"
              data-block-name="远程控制"
            >
              <div class="panel-header">
                <div>
                  <h2 class="section-title">远程控制</h2>
                  <p class="section-subtitle">指令仅发送至当前选中车辆</p>
                </div>
                <el-tag :type="currentVehicle.online ? 'success' : 'info'">
                  {{ currentVehicle.online ? "可控制" : "不可控制" }}
                </el-tag>
              </div>
              <div class="control-body">
                <div class="control-section">
                  <div class="control-section-title">
                    <span>车门与防盗</span>
                    <span>{{
                      currentVehicle.doorsLocked ? "已锁车" : "未锁车"
                    }}</span>
                  </div>
                  <div class="action-grid">
                    <el-button
                      type="primary"
                      :icon="Lock"
                      :disabled="!currentVehicle.online"
                      @click="requestCommand('LOCK_DOORS')"
                      >车门上锁</el-button
                    >
                    <el-button
                      :icon="Unlock"
                      :disabled="!currentVehicle.online"
                      @click="requestCommand('UNLOCK_DOORS')"
                      >车门解锁</el-button
                    >
                    <el-button
                      type="success"
                      plain
                      :icon="CircleCheck"
                      :disabled="!currentVehicle.online"
                      @click="requestCommand('ARM_ANTITHEFT')"
                      >开启防盗</el-button
                    >
                    <el-button
                      type="warning"
                      plain
                      :icon="RemoveFilled"
                      :disabled="!currentVehicle.online"
                      @click="requestCommand('DISARM_ANTITHEFT')"
                      >关闭防盗</el-button
                    >
                  </div>
                </div>

                <div class="control-section">
                  <div class="control-section-title"><span>其他控制</span></div>
                  <div class="action-grid">
                    <el-button
                      :icon="Bell"
                      :disabled="!currentVehicle.online"
                      @click="requestCommand('HORN_LIGHTS')"
                      >鸣笛闪灯</el-button
                    >
                    <el-button
                      :icon="Box"
                      :disabled="!currentVehicle.online"
                      @click="requestCommand('OPEN_TRUNK')"
                      >开启后备箱</el-button
                    >
                  </div>
                </div>

                <div class="control-section">
                  <div class="control-section-title"><span>门体状态</span></div>
                  <div class="door-grid">
                    <div
                      v-for="door in currentDoorStates"
                      :key="door.key"
                      class="door-item"
                    >
                      <span>{{ door.label }}</span>
                      <span
                        class="door-state"
                        :class="{ 'is-open': door.open }"
                      >
                        {{ door.open ? "开启" : "关闭" }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="command-note">
                  远程指令会记录操作人、车辆、结果与时间。车辆离线时不可发送控制指令。
                </div>
              </div>
            </section>
          </div>

          <section
            class="panel"
            data-block-id="operation-log"
            data-block-name="操作日志"
          >
            <div class="panel-header">
              <div>
                <h2 class="section-title">操作日志</h2>
                <p class="section-subtitle">最近的车辆远程控制和状态刷新记录</p>
              </div>
              <div class="log-filter">
                <el-input
                  v-model="logKeyword"
                  :prefix-icon="Search"
                  clearable
                  placeholder="搜索车辆或操作"
                ></el-input>
                <el-tooltip content="刷新日志" placement="top">
                  <el-button
                    circle
                    :icon="Refresh"
                    aria-label="刷新操作日志"
                    @click="refreshLogs"
                  ></el-button>
                </el-tooltip>
              </div>
            </div>
            <el-table
              :data="filteredLogs"
              row-key="id"
              stripe
              style="width: 100%"
            >
              <el-table-column
                prop="time"
                label="操作时间"
                width="168"
              ></el-table-column>
              <el-table-column
                prop="plate"
                label="车辆"
                width="116"
              ></el-table-column>
              <el-table-column
                prop="operation"
                label="操作内容"
                min-width="150"
              ></el-table-column>
              <el-table-column
                prop="operator"
                label="操作人"
                width="110"
              ></el-table-column>
              <el-table-column
                prop="source"
                label="来源"
                width="110"
              ></el-table-column>
              <el-table-column label="结果" width="100">
                <template #default="scope">
                  <span
                    class="result-text"
                    :class="{ 'is-failed': scope.row.result !== '成功' }"
                  >
                    {{ scope.row.result }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                prop="detail"
                label="说明"
                min-width="190"
              ></el-table-column>
            </el-table>
          </section>
        </div>
      </div>
    </div>
    <!-- BUSINESS_CONTENT_END -->
  </section>
  <el-dialog
    v-model="commandDialogVisible"
    class="vehicle-console-page command-dialog"
    :title="pendingCommand.title"
    width="520px"
    destroy-on-close
  >
    <el-alert
      :title="pendingCommand.warning"
      :type="pendingCommand.danger ? 'warning' : 'info'"
      :closable="false"
      show-icon
    ></el-alert>
    <div class="command-target">
      <strong>{{ pendingCommand.target }}</strong>
      <span>{{ pendingCommand.description }}</span>
    </div>
    <el-checkbox v-if="pendingCommand.requireCheck" v-model="riskConfirmed">
      我已确认车辆周边环境安全，并知悉该操作会立即生效
    </el-checkbox>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="commandDialogVisible = false">取消</el-button>
        <el-button
          :type="pendingCommand.danger ? 'warning' : 'primary'"
          :loading="commandSubmitting"
          :disabled="pendingCommand.requireCheck && !riskConfirmed"
          @click="executeCommand"
          >{{ pendingCommand.confirmText }}</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
// 来源模板：vehicle-console-page
import { ref, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import {
  Search,
  Refresh,
  RefreshLeft,
  Lock,
  Unlock,
  Aim,
  CircleCheck,
  RemoveFilled,
  Bell,
  Box,
  Van,
  Connection,
  Warning,
} from "@element-plus/icons-vue";

function pageSetup() {
  const vehicleFilters = reactive({ keyword: "", status: "" });
  const selectedVehicleId = ref(1);
  const logKeyword = ref("");
  const commandDialogVisible = ref(false);
  const commandSubmitting = ref(false);
  const riskConfirmed = ref(false);
  const pendingCommand = reactive({
    type: "",
    title: "",
    target: "",
    description: "",
    warning: "",
    confirmText: "确认执行",
    danger: false,
    requireCheck: false,
  });

  const vehicles = ref([
    {
      id: 1,
      plate: "台北 ABC-1688",
      model: "Toyota Corolla Cross",
      vinSuffix: "6821",
      fleet: "总部公务车队",
      online: true,
      alarm: false,
      drivingStatus: "静止 · 已熄火",
      lastSeen: "刚刚",
      positionUpdatedAt: "2026-07-15 16:18:22",
      location: "台北市松山区南京东路四段 2 号附近",
      latitude: "25.0518° N",
      longitude: "121.5512° E",
      accuracy: 8,
      mapX: 57,
      mapY: 47,
      speed: 0,
      doorsLocked: true,
      antiTheftArmed: true,
      ignition: false,
      headUnitOnline: true,
      headUnitVersion: "TCU 4.8.2",
      battery12v: 12.6,
      fuel: 68,
      mileage: 18642,
      signal: 4,
      doors: {
        frontLeft: false,
        frontRight: false,
        rearLeft: false,
        rearRight: false,
        trunk: false,
      },
    },
    {
      id: 2,
      plate: "台北 BCD-5208",
      model: "Tesla Model 3",
      vinSuffix: "0946",
      fleet: "总部公务车队",
      online: true,
      alarm: false,
      drivingStatus: "行驶中 · 42 km/h",
      lastSeen: "10 秒前",
      positionUpdatedAt: "2026-07-15 16:18:10",
      location: "台北市中山区建国北路一段附近",
      latitude: "25.0469° N",
      longitude: "121.5365° E",
      accuracy: 6,
      mapX: 68,
      mapY: 38,
      speed: 42,
      doorsLocked: true,
      antiTheftArmed: false,
      ignition: true,
      headUnitOnline: true,
      headUnitVersion: "TCU 5.1.0",
      battery12v: 13.1,
      fuel: 82,
      mileage: 24580,
      signal: 5,
      doors: {
        frontLeft: false,
        frontRight: false,
        rearLeft: false,
        rearRight: false,
        trunk: false,
      },
    },
    {
      id: 3,
      plate: "新北 CEF-7780",
      model: "Ford Tourneo Connect",
      vinSuffix: "3372",
      fleet: "北区服务车队",
      online: true,
      alarm: true,
      drivingStatus: "静止 · 左前门开启",
      lastSeen: "25 秒前",
      positionUpdatedAt: "2026-07-15 16:17:55",
      location: "新北市板桥区县民大道二段附近",
      latitude: "25.0124° N",
      longitude: "121.4638° E",
      accuracy: 11,
      mapX: 44,
      mapY: 61,
      speed: 0,
      doorsLocked: false,
      antiTheftArmed: false,
      ignition: false,
      headUnitOnline: true,
      headUnitVersion: "TCU 4.6.9",
      battery12v: 11.8,
      fuel: 36,
      mileage: 52710,
      signal: 3,
      doors: {
        frontLeft: true,
        frontRight: false,
        rearLeft: false,
        rearRight: false,
        trunk: false,
      },
    },
    {
      id: 4,
      plate: "桃园 DGH-1066",
      model: "Volkswagen Caddy",
      vinSuffix: "8145",
      fleet: "桃园营运车队",
      online: false,
      alarm: false,
      drivingStatus: "离线 · 状态未知",
      lastSeen: "2 小时前",
      positionUpdatedAt: "2026-07-15 14:06:31",
      location: "桃园市桃园区中正路附近",
      latitude: "24.9937° N",
      longitude: "121.3010° E",
      accuracy: 36,
      mapX: 35,
      mapY: 49,
      speed: 0,
      doorsLocked: true,
      antiTheftArmed: true,
      ignition: false,
      headUnitOnline: false,
      headUnitVersion: "TCU 4.5.4",
      battery12v: 12.1,
      fuel: 51,
      mileage: 41820,
      signal: 0,
      doors: {
        frontLeft: false,
        frontRight: false,
        rearLeft: false,
        rearRight: false,
        trunk: false,
      },
    },
    {
      id: 5,
      plate: "台中 EJK-8899",
      model: "Toyota RAV4",
      vinSuffix: "2207",
      fleet: "中区业务车队",
      online: true,
      alarm: false,
      drivingStatus: "静止 · 已熄火",
      lastSeen: "1 分钟前",
      positionUpdatedAt: "2026-07-15 16:17:02",
      location: "台中市西屯区台湾大道三段附近",
      latitude: "24.1656° N",
      longitude: "120.6454° E",
      accuracy: 9,
      mapX: 62,
      mapY: 58,
      speed: 0,
      doorsLocked: false,
      antiTheftArmed: false,
      ignition: false,
      headUnitOnline: true,
      headUnitVersion: "TCU 4.8.2",
      battery12v: 12.4,
      fuel: 73,
      mileage: 33219,
      signal: 4,
      doors: {
        frontLeft: false,
        frontRight: false,
        rearLeft: false,
        rearRight: false,
        trunk: false,
      },
    },
    {
      id: 6,
      plate: "高雄 FKL-3015",
      model: "Hyundai Staria",
      vinSuffix: "7610",
      fleet: "南区服务车队",
      online: true,
      alarm: false,
      drivingStatus: "怠速 · 已点火",
      lastSeen: "18 秒前",
      positionUpdatedAt: "2026-07-15 16:18:02",
      location: "高雄市前镇区中山二路附近",
      latitude: "22.6137° N",
      longitude: "120.3052° E",
      accuracy: 7,
      mapX: 52,
      mapY: 42,
      speed: 0,
      doorsLocked: true,
      antiTheftArmed: false,
      ignition: true,
      headUnitOnline: true,
      headUnitVersion: "TCU 5.0.6",
      battery12v: 13.4,
      fuel: 58,
      mileage: 29364,
      signal: 5,
      doors: {
        frontLeft: false,
        frontRight: false,
        rearLeft: false,
        rearRight: false,
        trunk: false,
      },
    },
  ]);

  const logs = ref([
    {
      id: 1,
      time: "2026-07-15 16:12:35",
      plate: "台北 ABC-1688",
      operation: "车门上锁",
      operator: "Admin",
      source: "营运端",
      result: "成功",
      detail: "四门与后备箱锁定完成",
    },
    {
      id: 2,
      time: "2026-07-15 15:48:09",
      plate: "新北 CEF-7780",
      operation: "开启防盗",
      operator: "王小明",
      source: "营运端",
      result: "失败",
      detail: "检测到左前门未关闭",
    },
    {
      id: 3,
      time: "2026-07-15 15:32:16",
      plate: "台中 EJK-8899",
      operation: "车门解锁",
      operator: "林怡君",
      source: "行动端",
      result: "成功",
      detail: "远程解锁指令执行完成",
    },
    {
      id: 4,
      time: "2026-07-15 14:06:40",
      plate: "桃园 DGH-1066",
      operation: "状态刷新",
      operator: "系统",
      source: "自动任务",
      result: "失败",
      detail: "车辆通讯超时，已标记离线",
    },
    {
      id: 5,
      time: "2026-07-15 13:45:22",
      plate: "高雄 FKL-3015",
      operation: "鸣笛闪灯",
      operator: "陈志豪",
      source: "营运端",
      result: "成功",
      detail: "寻车指令持续 5 秒",
    },
  ]);

  const filteredVehicles = computed(() => {
    const keyword = vehicleFilters.keyword.trim().toLowerCase();
    return vehicles.value.filter((vehicle) => {
      const matchesKeyword =
        !keyword ||
        vehicle.plate.toLowerCase().includes(keyword) ||
        vehicle.model.toLowerCase().includes(keyword) ||
        vehicle.fleet.toLowerCase().includes(keyword);
      const matchesStatus =
        !vehicleFilters.status ||
        (vehicleFilters.status === "online" &&
          vehicle.online &&
          !vehicle.alarm) ||
        (vehicleFilters.status === "offline" && !vehicle.online) ||
        (vehicleFilters.status === "alarm" && vehicle.alarm);
      return matchesKeyword && matchesStatus;
    });
  });

  const currentVehicle = computed(() => {
    return (
      vehicles.value.find(
        (vehicle) => vehicle.id === selectedVehicleId.value,
      ) || vehicles.value[0]
    );
  });

  const onlineVehicleCount = computed(
    () => vehicles.value.filter((vehicle) => vehicle.online).length,
  );
  const unlockedVehicleCount = computed(
    () => vehicles.value.filter((vehicle) => !vehicle.doorsLocked).length,
  );
  const alarmVehicleCount = computed(
    () => vehicles.value.filter((vehicle) => vehicle.alarm).length,
  );

  const currentDoorStates = computed(() => {
    const doors = currentVehicle.value.doors;
    return [
      { key: "frontLeft", label: "左前门", open: doors.frontLeft },
      { key: "frontRight", label: "右前门", open: doors.frontRight },
      { key: "rearLeft", label: "左后门", open: doors.rearLeft },
      { key: "rearRight", label: "右后门", open: doors.rearRight },
      { key: "trunk", label: "后备箱", open: doors.trunk },
      { key: "hood", label: "引擎盖", open: false },
    ];
  });

  const filteredLogs = computed(() => {
    const keyword = logKeyword.value.trim().toLowerCase();
    if (!keyword) return logs.value;
    return logs.value.filter((log) => {
      return [log.plate, log.operation, log.operator, log.detail]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  });

  function resetVehicleFilters() {
    vehicleFilters.keyword = "";
    vehicleFilters.status = "";
  }

  function selectVehicle(vehicle) {
    selectedVehicleId.value = vehicle.id;
  }

  function refreshVehicleData() {
    currentVehicle.value.lastSeen = "刚刚";
    currentVehicle.value.positionUpdatedAt = formatNow();
    addLog(
      currentVehicle.value.plate,
      "状态刷新",
      "成功",
      "车辆与车机状态已更新",
    );
    ElMessage.success("车辆状态已刷新");
  }

  function refreshLogs() {
    ElMessage.success("操作日志已刷新");
  }

  function recenterMap() {
    ElMessage.success(`已回到 ${currentVehicle.value.plate} 的最新位置`);
  }

  function requestCommand(type) {
    const configs = {
      LOCK_DOORS: {
        title: "确认车门上锁",
        description: "将锁定四个车门及后备箱，并更新车辆锁止状态。",
        warning: "请先确认车内没有人员、儿童或宠物。",
        confirmText: "确认上锁",
        danger: false,
        requireCheck: false,
      },
      UNLOCK_DOORS: {
        title: "确认车门解锁",
        description: "车辆收到指令后将立即解除车门锁止。",
        warning: "解锁属于安全敏感操作，请确认车辆周边环境安全。",
        confirmText: "确认解锁",
        danger: true,
        requireCheck: true,
      },
      ARM_ANTITHEFT: {
        title: "确认开启防盗",
        description: "车辆将在车门全部关闭后进入设防状态。",
        warning: "若检测到任一车门开启，指令可能执行失败。",
        confirmText: "开启防盗",
        danger: false,
        requireCheck: false,
      },
      DISARM_ANTITHEFT: {
        title: "确认关闭防盗",
        description: "车辆将退出防盗设防状态，但不会自动解锁车门。",
        warning: "关闭防盗会降低车辆安全防护，请谨慎操作。",
        confirmText: "关闭防盗",
        danger: true,
        requireCheck: true,
      },
      HORN_LIGHTS: {
        title: "确认鸣笛闪灯",
        description: "车辆将鸣笛并闪灯 5 秒，用于停车场寻车。",
        warning: "请避免在禁止鸣笛或安静区域频繁使用。",
        confirmText: "执行寻车",
        danger: false,
        requireCheck: false,
      },
      OPEN_TRUNK: {
        title: "确认开启后备箱",
        description: "车辆收到指令后将立即解锁并弹开后备箱。",
        warning: "请确认车辆停稳且后方有足够开启空间。",
        confirmText: "开启后备箱",
        danger: true,
        requireCheck: true,
      },
      BULK_LOCK: {
        title: "确认批量锁车",
        description: `将向 ${onlineVehicleCount.value} 辆在线车辆发送车门上锁指令，离线车辆不会执行。`,
        warning: "批量操作会影响多辆车辆，请确认当前没有现场用车需求。",
        confirmText: "确认批量上锁",
        danger: true,
        requireCheck: true,
      },
    };

    const config = configs[type];
    if (!config) return;
    if (type !== "BULK_LOCK" && !currentVehicle.value.online) {
      ElMessage.warning("当前车辆离线，无法发送远程指令");
      return;
    }

    pendingCommand.type = type;
    pendingCommand.title = config.title;
    pendingCommand.target =
      type === "BULK_LOCK"
        ? "目标：全部在线车辆"
        : `目标：${currentVehicle.value.plate}`;
    pendingCommand.description = config.description;
    pendingCommand.warning = config.warning;
    pendingCommand.confirmText = config.confirmText;
    pendingCommand.danger = config.danger;
    pendingCommand.requireCheck = config.requireCheck;
    riskConfirmed.value = false;
    commandDialogVisible.value = true;
  }

  async function executeCommand() {
    commandSubmitting.value = true;
    await new Promise((resolve) => setTimeout(resolve, 650));

    if (pendingCommand.type === "BULK_LOCK") {
      vehicles.value.forEach((vehicle) => {
        if (vehicle.online) {
          vehicle.doorsLocked = true;
          Object.keys(vehicle.doors).forEach((key) => {
            vehicle.doors[key] = false;
          });
        }
      });
      addLog(
        "全部在线车辆",
        "批量车门上锁",
        "成功",
        `已向 ${onlineVehicleCount.value} 辆在线车辆发送指令`,
      );
    } else {
      const vehicle = currentVehicle.value;
      let operation = "";
      let detail = "";

      if (pendingCommand.type === "LOCK_DOORS") {
        vehicle.doorsLocked = true;
        Object.keys(vehicle.doors).forEach((key) => {
          vehicle.doors[key] = false;
        });
        operation = "车门上锁";
        detail = "四门与后备箱锁定完成";
      }
      if (pendingCommand.type === "UNLOCK_DOORS") {
        vehicle.doorsLocked = false;
        operation = "车门解锁";
        detail = "远程解锁指令执行完成";
      }
      if (pendingCommand.type === "ARM_ANTITHEFT") {
        const hasOpenDoor = Object.values(vehicle.doors).some(Boolean);
        if (hasOpenDoor) {
          commandSubmitting.value = false;
          commandDialogVisible.value = false;
          addLog(vehicle.plate, "开启防盗", "失败", "检测到车门或后备箱未关闭");
          ElMessage.error("防盗开启失败：请先关闭全部车门");
          return;
        }
        vehicle.antiTheftArmed = true;
        operation = "开启防盗";
        detail = "车辆已进入设防状态";
      }
      if (pendingCommand.type === "DISARM_ANTITHEFT") {
        vehicle.antiTheftArmed = false;
        operation = "关闭防盗";
        detail = "车辆已退出设防状态";
      }
      if (pendingCommand.type === "HORN_LIGHTS") {
        operation = "鸣笛闪灯";
        detail = "寻车指令持续 5 秒";
      }
      if (pendingCommand.type === "OPEN_TRUNK") {
        vehicle.doors.trunk = true;
        operation = "开启后备箱";
        detail = "后备箱已解锁并开启";
      }

      addLog(vehicle.plate, operation, "成功", detail);
    }

    commandSubmitting.value = false;
    commandDialogVisible.value = false;
    ElMessage.success("远程指令执行成功");
  }

  function addLog(plate, operation, result, detail) {
    logs.value.unshift({
      id: Date.now() + Math.random(),
      time: formatNow(),
      plate,
      operation,
      operator: "Admin",
      source: "营运端",
      result,
      detail,
    });
  }

  function formatNow() {
    const date = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
      date.getHours(),
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  return {
    Search: Search,
    Refresh: Refresh,
    RefreshLeft: RefreshLeft,
    Lock: Lock,
    Unlock: Unlock,
    Aim: Aim,
    CircleCheck: CircleCheck,
    RemoveFilled: RemoveFilled,
    Bell: Bell,
    Box: Box,
    Van: Van,
    Connection: Connection,
    Warning: Warning,
    vehicleFilters,
    selectedVehicleId,
    logKeyword,
    commandDialogVisible,
    commandSubmitting,
    riskConfirmed,
    pendingCommand,
    vehicles,
    filteredVehicles,
    currentVehicle,
    onlineVehicleCount,
    unlockedVehicleCount,
    alarmVehicleCount,
    currentDoorStates,
    filteredLogs,
    resetVehicleFilters,
    selectVehicle,
    refreshVehicleData,
    refreshLogs,
    recenterMap,
    requestCommand,
    executeCommand,
  };
}

export default {
  setup() {
    return pageSetup();
  },
};
</script>

<style scoped>
.vehicle-console-page {
  width: 100%;
  font-size: var(--app-font-size-base);
  line-height: 1.5;
}

.vehicle-console-page .page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
}

.vehicle-console-page .page-heading h1 {
  margin: 0;
  color: #1f2937;
  font-size: var(--app-font-size-page-title);
  font-weight: 700;
  line-height: 32px;
}

.vehicle-console-page .page-heading p {
  margin: 4px 0 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-base);
}

.vehicle-console-page .heading-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.vehicle-console-page .section-title {
  margin: 0;
  color: var(--app-color-text-primary);
  font-size: var(--app-font-size-md);
  font-weight: 700;
  line-height: 24px;
}

.vehicle-console-page .section-subtitle {
  margin: 2px 0 0;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}

.vehicle-console-page .summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.vehicle-console-page .summary-card {
  display: flex;
  align-items: center;
  min-height: 88px;
  padding: 16px;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-panel);
  box-shadow: var(--app-shadow-panel);
}

.vehicle-console-page .summary-icon {
  display: grid;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  margin-right: 12px;
  color: var(--app-color-primary);
  background: #e8f4fa;
  border-radius: 8px;
  place-items: center;
}

.vehicle-console-page .summary-icon.is-warning {
  color: var(--app-color-warning);
  background: #fff7e6;
}

.vehicle-console-page .summary-icon.is-danger {
  color: var(--app-color-danger);
  background: #fef2f2;
}

.vehicle-console-page .summary-icon.is-success {
  color: var(--app-color-success);
  background: #ecfdf3;
}

.vehicle-console-page .summary-label {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

.vehicle-console-page .summary-value {
  margin-top: 2px;
  color: var(--app-color-text-primary);
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
}

.vehicle-console-page .console-grid {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.vehicle-console-page .panel {
  overflow: hidden;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: var(--app-shadow-panel);
}

.vehicle-console-page .panel-header {
  display: flex;
  min-height: var(--app-panel-header-height);
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--app-color-border-light);
}

.vehicle-console-page .panel-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vehicle-console-page .vehicle-filter {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px 32px;
  gap: 8px;
  padding: 12px;
  background: var(--app-color-surface-muted);
  border-bottom: 1px solid var(--app-color-border-light);
}

.vehicle-console-page .vehicle-list {
  max-height: 706px;
  padding: 8px;
  overflow-y: auto;
}

.vehicle-console-page .vehicle-card {
  display: block;
  width: 100%;
  padding: 12px;
  margin: 0 0 6px;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
}

.vehicle-console-page .vehicle-card:hover {
  background: var(--app-color-surface-subtle);
}

.vehicle-console-page .vehicle-card.is-active {
  background: #eff8fc;
  border-color: #9bcde4;
}

.vehicle-console-page .vehicle-card-top,
.vehicle-console-page .vehicle-card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.vehicle-console-page .vehicle-card-top strong {
  color: var(--app-color-text-primary);
  font-size: var(--app-font-size-base);
}

.vehicle-console-page .vehicle-model {
  margin-top: 3px;
  color: var(--app-color-text-secondary);
  font-size: var(--app-font-size-xs);
}

.vehicle-console-page .vehicle-card-bottom {
  margin-top: 9px;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}

.vehicle-console-page .online-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  background: #94a3b8;
  border-radius: 50%;
  vertical-align: 1px;
}

.vehicle-console-page .online-dot.is-online {
  background: var(--app-color-success);
}

.vehicle-console-page .workspace-stack {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 16px;
}

.vehicle-console-page .vehicle-overview {
  padding: 16px;
}

.vehicle-console-page .overview-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
}

.vehicle-console-page .vehicle-title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.vehicle-console-page .vehicle-title-row h2 {
  margin: 0;
  color: var(--app-color-text-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 28px;
}

.vehicle-console-page .vehicle-meta {
  margin-top: 4px;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

.vehicle-console-page .last-sync {
  flex: 0 0 auto;
  padding-top: 3px;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}

.vehicle-console-page .status-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  border: 1px solid var(--app-color-border-light);
  border-radius: 8px;
  overflow: hidden;
}

.vehicle-console-page .status-item {
  min-width: 0;
  padding: 12px;
  border-right: 1px solid var(--app-color-border-light);
  background: var(--app-color-surface-muted);
}

.vehicle-console-page .status-item:last-child {
  border-right: 0;
}

.vehicle-console-page .status-label {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}

.vehicle-console-page .status-value {
  margin-top: 4px;
  overflow: hidden;
  color: var(--app-color-text-primary);
  font-size: var(--app-font-size-base);
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vehicle-console-page .status-value.is-success {
  color: var(--app-color-success);
}

.vehicle-console-page .status-value.is-danger {
  color: var(--app-color-danger);
}

.vehicle-console-page .status-value.is-warning {
  color: #b45309;
}

.vehicle-console-page .status-detail {
  margin-top: 2px;
  overflow: hidden;
  color: var(--app-color-text-muted);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vehicle-console-page .main-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 340px;
  gap: 16px;
  align-items: start;
}

.vehicle-console-page .map-body {
  padding: 14px;
}

.vehicle-console-page .map-canvas {
  position: relative;
  height: 332px;
  overflow: hidden;
  background-color: #eef3f5;
  background-image:
    linear-gradient(rgb(255 255 255 / 75%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 75%) 1px, transparent 1px);
  background-size: 36px 36px;
  border: 1px solid var(--app-color-border-light);
  border-radius: 8px;
}

.vehicle-console-page .map-block {
  position: absolute;
  background: #dfe9df;
  border: 1px solid #d3dfd3;
  border-radius: 6px;
}

.vehicle-console-page .map-block.block-a {
  top: 18px;
  left: 22px;
  width: 30%;
  height: 82px;
}

.vehicle-console-page .map-block.block-b {
  top: 168px;
  left: 50px;
  width: 24%;
  height: 104px;
}

.vehicle-console-page .map-block.block-c {
  top: 34px;
  right: 34px;
  width: 25%;
  height: 94px;
}

.vehicle-console-page .map-block.block-d {
  right: 54px;
  bottom: 22px;
  width: 30%;
  height: 86px;
}

.vehicle-console-page .map-road {
  position: absolute;
  background: #fff;
  box-shadow: 0 0 0 1px #dfe5e9;
}

.vehicle-console-page .map-road.road-horizontal {
  top: 134px;
  left: -10px;
  width: calc(100% + 20px);
  height: 28px;
  transform: rotate(-4deg);
}

.vehicle-console-page .map-road.road-vertical {
  top: -10px;
  left: 48%;
  width: 28px;
  height: calc(100% + 20px);
  transform: rotate(7deg);
}

.vehicle-console-page .map-road.road-small {
  right: 16%;
  bottom: 74px;
  width: 42%;
  height: 18px;
  transform: rotate(18deg);
}

.vehicle-console-page .map-label {
  position: absolute;
  z-index: 2;
  padding: 2px 5px;
  color: #64748b;
  background: rgb(255 255 255 / 74%);
  border-radius: 3px;
  font-size: 11px;
}

.vehicle-console-page .map-label.label-a {
  top: 106px;
  left: 18px;
}

.vehicle-console-page .map-label.label-b {
  right: 18px;
  bottom: 102px;
}

.vehicle-console-page .vehicle-marker {
  position: absolute;
  z-index: 4;
  display: grid;
  width: 42px;
  height: 42px;
  color: #fff;
  background: var(--app-color-primary);
  border: 4px solid #fff;
  border-radius: 50% 50% 50% 8px;
  box-shadow: 0 5px 14px rgb(15 23 42 / 24%);
  transform: translate(-50%, -50%) rotate(-45deg);
  place-items: center;
}

.vehicle-console-page .vehicle-marker .el-icon {
  transform: rotate(45deg);
}

.vehicle-console-page .marker-pulse {
  position: absolute;
  z-index: 3;
  width: 76px;
  height: 76px;
  background: rgb(var(--app-color-primary-rgb) / 12%);
  border: 1px solid rgb(var(--app-color-primary-rgb) / 28%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.vehicle-console-page .map-info {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-top: 12px;
}

.vehicle-console-page .map-address {
  color: var(--app-color-text-primary);
  font-size: var(--app-font-size-base);
  font-weight: 600;
}

.vehicle-console-page .map-coordinates {
  margin-top: 3px;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
}

.vehicle-console-page .control-body {
  padding: 14px;
}

.vehicle-console-page .control-section + .control-section {
  padding-top: 14px;
  margin-top: 14px;
  border-top: 1px solid var(--app-color-border-light);
}

.vehicle-console-page .control-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--app-color-text-secondary);
  font-size: var(--app-font-size-sm);
  font-weight: 700;
}

.vehicle-console-page .action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.vehicle-console-page .action-grid .el-button {
  width: 100%;
  min-height: 38px;
  margin: 0;
}

.vehicle-console-page .door-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.vehicle-console-page .door-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 34px;
  padding: 7px 9px;
  background: var(--app-color-surface-muted);
  border: 1px solid var(--app-color-border-light);
  border-radius: 6px;
  font-size: var(--app-font-size-xs);
}

.vehicle-console-page .door-state {
  color: var(--app-color-success);
  font-weight: 700;
}

.vehicle-console-page .door-state.is-open {
  color: var(--app-color-danger);
}

.vehicle-console-page .command-note {
  margin-top: 10px;
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-xs);
  line-height: 1.6;
}

.vehicle-console-page .log-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vehicle-console-page .log-filter .el-input {
  width: 210px;
}

.vehicle-console-page .el-table th.el-table__cell {
  color: #374151;
  font-weight: 700;
  background: var(--app-color-surface-muted);
}

.vehicle-console-page .result-text {
  color: var(--app-color-success);
  font-weight: 600;
}

.vehicle-console-page .result-text.is-failed {
  color: var(--app-color-danger);
}

.vehicle-console-page .empty-vehicles {
  padding: 40px 16px;
  color: var(--app-color-text-muted);
  text-align: center;
  font-size: var(--app-font-size-sm);
}

.vehicle-console-page.command-dialog .command-target {
  padding: 12px 14px;
  margin: 12px 0;
  background: var(--app-color-surface-muted);
  border: 1px solid var(--app-color-border-light);
  border-radius: 8px;
}

.vehicle-console-page.command-dialog .command-target strong {
  display: block;
  margin-bottom: 4px;
  color: var(--app-color-text-primary);
  font-size: var(--app-font-size-base);
}

.vehicle-console-page.command-dialog .command-target span {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

.vehicle-console-page.command-dialog .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 1420px) {
  .vehicle-console-page .main-grid {
    grid-template-columns: 1fr;
  }

  .vehicle-console-page .map-canvas {
    height: 300px;
  }
}

@media (max-width: 1240px) {
  .vehicle-console-page .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .vehicle-console-page .console-grid {
    grid-template-columns: 280px minmax(0, 1fr);
  }

  .vehicle-console-page .status-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .vehicle-console-page .status-item:nth-child(3) {
    border-right: 0;
  }

  .vehicle-console-page .status-item:nth-child(-n + 3) {
    border-bottom: 1px solid var(--app-color-border-light);
  }
}
</style>
