<template>
  <!-- 由规范 HTML 原型导入；页面业务状态和模拟数据保留在本页面。 -->
  <section class="vehicle-console-page">
    <!--
                [AI-EDIT] PAGE_HEADER_OPTIONAL
                standard：保留标题、子标题和右侧页面主操作，主操作与标题区底部对齐。
              -->
    <div
      class="page-heading"
      data-page-header="standard"
      data-block-id="page-heading"
      data-block-name="页面标题"
    >
      <div>
        <h1>车辆控制台</h1>
        <p>实时监控与控制多辆车的车门、防盗状态，查看车机状态与位置信息。</p>
      </div>
      <el-button type="primary" size="large" :icon="Refresh" @click="refreshAll"
        >刷新状态</el-button
      >
    </div>

    <!--
                [AI-EDIT] BUSINESS_CONTENT_START
                车辆控制台自由业务区：车辆选择、状态概览、控制区、地图位置、操作日志。
              -->
    <div data-business-content>
      <!-- 车辆选择栏 -->
      <div
        class="vehicle-selector"
        data-block-id="vehicle-selector"
        data-block-name="车辆选择"
      >
        <span class="label">当前车辆</span>
        <el-select
          v-model="currentVehicleId"
          placeholder="请选择车辆"
          @change="onVehicleChange"
        >
          <el-option
            v-for="v in vehicles"
            :key="v.id"
            :label="v.plate + ' ' + v.model"
            :value="v.id"
          ></el-option>
        </el-select>
        <div class="vehicle-info" v-if="currentVehicle">
          <span class="model">{{ currentVehicle.model }}</span>
          <span class="plate">{{ currentVehicle.plate }}</span>
          <el-tag
            :type="currentVehicle.status === 'online' ? 'success' : 'info'"
            size="small"
          >
            {{ currentVehicle.status === "online" ? "在线" : "离线" }}
          </el-tag>
        </div>
        <div class="spacer"></div>
        <el-button
          class="detail-btn"
          type="primary"
          plain
          :icon="InfoFilled"
          :disabled="!currentVehicle"
          @click="openDetailDialog"
          >车辆详情</el-button
        >
      </div>

      <!-- 状态概览 -->
      <div
        class="status-grid"
        data-block-id="status-grid"
        data-block-name="状态概览"
      >
        <div class="status-card">
          <div
            class="icon-wrap"
            :class="
              currentVehicle
                ? currentVehicle.status === 'online'
                  ? 'online'
                  : 'offline'
                : ''
            "
          >
            <span v-if="currentVehicle && currentVehicle.status === 'online'"
              >📶</span
            >
            <span v-else>📴</span>
          </div>
          <div class="info">
            <div class="label">车机状态</div>
            <div class="value">
              <span
                class="dot"
                :class="
                  currentVehicle
                    ? currentVehicle.status === 'online'
                      ? 'green'
                      : 'red'
                    : ''
                "
              ></span>
              {{
                currentVehicle
                  ? currentVehicle.status === "online"
                    ? "在线"
                    : "离线"
                  : "—"
              }}
            </div>
          </div>
        </div>

        <div class="status-card">
          <div
            class="icon-wrap"
            :class="
              currentVehicle
                ? currentVehicle.vehicleStatus === 'driving'
                  ? 'driving'
                  : 'stopped'
                : ''
            "
          >
            <span
              v-if="
                currentVehicle && currentVehicle.vehicleStatus === 'driving'
              "
              >🚗</span
            >
            <span
              v-else-if="
                currentVehicle && currentVehicle.vehicleStatus === 'stopped'
              "
              >🅿️</span
            >
            <span v-else>🚘</span>
          </div>
          <div class="info">
            <div class="label">车辆状态</div>
            <div class="value">
              <span
                class="dot"
                :class="
                  currentVehicle
                    ? currentVehicle.vehicleStatus === 'driving'
                      ? 'blue'
                      : 'yellow'
                    : ''
                "
              ></span>
              {{
                currentVehicle
                  ? currentVehicle.vehicleStatus === "driving"
                    ? "行驶中"
                    : currentVehicle.vehicleStatus === "stopped"
                      ? "静止"
                      : "熄火"
                  : "—"
              }}
            </div>
          </div>
        </div>

        <div class="status-card">
          <div
            class="icon-wrap"
            :class="
              currentVehicle
                ? currentVehicle.doorStatus === 'locked'
                  ? 'locked'
                  : 'unlocked'
                : ''
            "
          >
            <span
              v-if="currentVehicle && currentVehicle.doorStatus === 'locked'"
              >🔒</span
            >
            <span v-else>🔓</span>
          </div>
          <div class="info">
            <div class="label">车门状态</div>
            <div class="value">
              <span
                class="dot"
                :class="
                  currentVehicle
                    ? currentVehicle.doorStatus === 'locked'
                      ? 'green'
                      : 'red'
                    : ''
                "
              ></span>
              {{
                currentVehicle
                  ? currentVehicle.doorStatus === "locked"
                    ? "已上锁"
                    : "已解锁"
                  : "—"
              }}
            </div>
          </div>
        </div>

        <div class="status-card">
          <div
            class="icon-wrap"
            :class="
              currentVehicle
                ? currentVehicle.antiTheftStatus === 'enabled'
                  ? 'enabled'
                  : 'disabled'
                : ''
            "
          >
            <span
              v-if="
                currentVehicle && currentVehicle.antiTheftStatus === 'enabled'
              "
              >🛡️</span
            >
            <span v-else>⚠️</span>
          </div>
          <div class="info">
            <div class="label">防盗状态</div>
            <div class="value">
              <span
                class="dot"
                :class="
                  currentVehicle
                    ? currentVehicle.antiTheftStatus === 'enabled'
                      ? 'green'
                      : 'red'
                    : ''
                "
              ></span>
              {{
                currentVehicle
                  ? currentVehicle.antiTheftStatus === "enabled"
                    ? "已开启"
                    : "已关闭"
                  : "—"
              }}
            </div>
          </div>
        </div>
      </div>

      <!-- 车辆控制 -->
      <div
        class="control-section"
        data-block-id="control-section"
        data-block-name="车辆控制"
      >
        <div class="section-title">车辆控制</div>
        <div class="control-grid">
          <button
            class="control-btn success"
            :disabled="
              !currentVehicle || currentVehicle.doorStatus === 'locked'
            "
            @click="executeControl('doorLock')"
          >
            <span class="icon">🔒</span>
            <span class="label">车门上锁</span>
          </button>
          <button
            class="control-btn danger"
            :disabled="
              !currentVehicle || currentVehicle.doorStatus === 'unlocked'
            "
            @click="executeControl('doorUnlock')"
          >
            <span class="icon">🔓</span>
            <span class="label">车门解锁</span>
          </button>
          <button
            class="control-btn primary"
            :disabled="
              !currentVehicle || currentVehicle.antiTheftStatus === 'enabled'
            "
            @click="executeControl('antiTheftEnable')"
          >
            <span class="icon">🛡️</span>
            <span class="label">防盗开启</span>
          </button>
          <button
            class="control-btn warning"
            :disabled="
              !currentVehicle || currentVehicle.antiTheftStatus === 'disabled'
            "
            @click="executeControl('antiTheftDisable')"
          >
            <span class="icon">🔓</span>
            <span class="label">防盗关闭</span>
          </button>
        </div>
      </div>

      <!-- 车辆位置 -->
      <div
        class="map-section"
        data-block-id="map-section"
        data-block-name="车辆位置"
      >
        <div class="section-title">车辆位置</div>
        <div class="map-container">
          <div class="map-grid"></div>
          <div class="map-marker">
            <span class="icon">📍</span>
            <span class="coords" v-if="currentVehicle">
              {{ currentVehicle.latitude }}°N, {{ currentVehicle.longitude }}°E
            </span>
            <span class="coords" v-else>—</span>
            <span class="address" v-if="currentVehicle">{{
              currentVehicle.address
            }}</span>
            <span class="address" v-else>请选择车辆</span>
          </div>
          <div class="map-coords-overlay" v-if="currentVehicle">
            最后更新：{{ currentVehicle.lastUpdate }}
          </div>
        </div>
      </div>

      <!-- 操作日志 -->
      <div
        class="log-section"
        data-block-id="log-section"
        data-block-name="操作日志"
      >
        <div class="log-header">
          <span class="section-title">操作日志</span>
          <span class="log-count">共 {{ logs.length }} 条记录</span>
        </div>
        <el-table
          :data="logs"
          row-key="id"
          stripe
          style="width: 100%"
          max-height="280"
        >
          <el-table-column
            prop="time"
            label="时间"
            width="170"
          ></el-table-column>
          <el-table-column
            prop="vehiclePlate"
            label="车辆"
            width="140"
          ></el-table-column>
          <el-table-column
            prop="operation"
            label="操作"
            min-width="120"
          ></el-table-column>
          <el-table-column label="结果" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.result === 'success' ? 'success' : 'danger'"
                size="small"
              >
                {{ scope.row.result === "success" ? "成功" : "失败" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="operator"
            label="操作人"
            width="120"
          ></el-table-column>
        </el-table>
      </div>
    </div>
    <!-- BUSINESS_CONTENT_END -->
  </section>
  <!-- 车辆详情弹窗 -->
  <el-dialog
    v-model="detailDialogVisible"
    class="vehicle-console-page vehicle-detail-dialog"
    title="车辆详情"
    width="640px"
    destroy-on-close
  >
    <div v-if="currentVehicle" class="detail-grid">
      <div class="detail-item">
        <span class="label">车牌号</span>
        <span class="value">{{ currentVehicle.plate }}</span>
      </div>
      <div class="detail-item">
        <span class="label">车型</span>
        <span class="value">{{ currentVehicle.model }}</span>
      </div>
      <div class="detail-item">
        <span class="label">颜色</span>
        <span class="value">{{ currentVehicle.color }}</span>
      </div>
      <div class="detail-item">
        <span class="label">车架号</span>
        <span class="value">{{ currentVehicle.vin }}</span>
      </div>
      <div class="detail-item">
        <span class="label">车机状态</span>
        <span class="value">
          <span
            class="dot"
            :class="currentVehicle.status === 'online' ? 'green' : 'red'"
          ></span>
          {{ currentVehicle.status === "online" ? "在线" : "离线" }}
        </span>
      </div>
      <div class="detail-item">
        <span class="label">车辆状态</span>
        <span class="value">
          <span
            class="dot"
            :class="
              currentVehicle.vehicleStatus === 'driving' ? 'blue' : 'yellow'
            "
          ></span>
          {{
            currentVehicle.vehicleStatus === "driving"
              ? "行驶中"
              : currentVehicle.vehicleStatus === "stopped"
                ? "静止"
                : "熄火"
          }}
        </span>
      </div>
      <div class="detail-item">
        <span class="label">车门状态</span>
        <span class="value">
          <span
            class="dot"
            :class="currentVehicle.doorStatus === 'locked' ? 'green' : 'red'"
          ></span>
          {{ currentVehicle.doorStatus === "locked" ? "已上锁" : "已解锁" }}
        </span>
      </div>
      <div class="detail-item">
        <span class="label">防盗状态</span>
        <span class="value">
          <span
            class="dot"
            :class="
              currentVehicle.antiTheftStatus === 'enabled' ? 'green' : 'red'
            "
          ></span>
          {{
            currentVehicle.antiTheftStatus === "enabled" ? "已开启" : "已关闭"
          }}
        </span>
      </div>
      <div class="detail-item" style="grid-column: 1 / -1">
        <span class="label">位置</span>
        <span class="value"
          >{{ currentVehicle.latitude }}°N,
          {{ currentVehicle.longitude }}°E</span
        >
      </div>
      <div class="detail-item" style="grid-column: 1 / -1">
        <span class="label">地址</span>
        <span class="value">{{ currentVehicle.address }}</span>
      </div>
      <div class="detail-item" style="grid-column: 1 / -1">
        <span class="label">最后更新</span>
        <span class="value">{{ currentVehicle.lastUpdate }}</span>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
// 来源模板：vehicle-console-page
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Refresh, InfoFilled } from "@element-plus/icons-vue";

function pageSetup() {
  // ---------- 模拟数据 ----------
  const vehicles = ref([
    {
      id: 1,
      plate: "京A12345",
      model: "特斯拉 Model 3",
      color: "珍珠白",
      vin: "LSVAA4BRXMN123456",
      status: "online", // online | offline
      vehicleStatus: "driving", // driving | stopped | parked
      doorStatus: "locked", // locked | unlocked
      antiTheftStatus: "enabled", // enabled | disabled
      latitude: 32.0602,
      longitude: 118.7831,
      address: "江苏省南京市玄武区中山路123号",
      lastUpdate: "2026-07-15 14:30:00",
    },
    {
      id: 2,
      plate: "京B67890",
      model: "比亚迪 汉",
      color: "时空灰",
      vin: "LC0CF4CD6N1234567",
      status: "online",
      vehicleStatus: "stopped",
      doorStatus: "unlocked",
      antiTheftStatus: "disabled",
      latitude: 32.0715,
      longitude: 118.7952,
      address: "江苏省南京市鼓楼区中央路56号",
      lastUpdate: "2026-07-15 14:25:00",
    },
    {
      id: 3,
      plate: "京C11111",
      model: "蔚来 ET5",
      color: "星灰",
      vin: "LJ1E6A2U4N2222222",
      status: "offline",
      vehicleStatus: "parked",
      doorStatus: "locked",
      antiTheftStatus: "enabled",
      latitude: 32.0489,
      longitude: 118.7674,
      address: "江苏省南京市秦淮区夫子庙大街88号",
      lastUpdate: "2026-07-15 13:50:00",
    },
    {
      id: 4,
      plate: "京D22222",
      model: "理想 L9",
      color: "金色",
      vin: "LW433B123N3333333",
      status: "online",
      vehicleStatus: "driving",
      doorStatus: "locked",
      antiTheftStatus: "enabled",
      latitude: 32.0556,
      longitude: 118.8017,
      address: "江苏省南京市建邺区江东中路128号",
      lastUpdate: "2026-07-15 14:32:00",
    },
  ]);

  const logs = ref([
    {
      id: 1,
      vehiclePlate: "京A12345",
      operation: "车门上锁",
      result: "success",
      operator: "系统",
      time: "2026-07-15 14:30:00",
    },
    {
      id: 2,
      vehiclePlate: "京A12345",
      operation: "防盗开启",
      result: "success",
      operator: "系统",
      time: "2026-07-15 14:28:00",
    },
    {
      id: 3,
      vehiclePlate: "京B67890",
      operation: "车门解锁",
      result: "success",
      operator: "系统",
      time: "2026-07-15 14:20:00",
    },
    {
      id: 4,
      vehiclePlate: "京A12345",
      operation: "车门解锁",
      result: "success",
      operator: "系统",
      time: "2026-07-15 14:10:00",
    },
    {
      id: 5,
      vehiclePlate: "京C11111",
      operation: "防盗关闭",
      result: "success",
      operator: "系统",
      time: "2026-07-15 13:55:00",
    },
    {
      id: 6,
      vehiclePlate: "京A12345",
      operation: "车辆启动",
      result: "success",
      operator: "系统",
      time: "2026-07-15 13:30:00",
    },
    {
      id: 7,
      vehiclePlate: "京D22222",
      operation: "车门上锁",
      result: "success",
      operator: "系统",
      time: "2026-07-15 13:15:00",
    },
    {
      id: 8,
      vehiclePlate: "京B67890",
      operation: "防盗开启",
      result: "success",
      operator: "系统",
      time: "2026-07-15 12:50:00",
    },
  ]);

  const currentVehicleId = ref(1);
  const detailDialogVisible = ref(false);
  let nextLogId = logs.value.length + 1;

  // ---------- 计算属性 ----------
  const currentVehicle = computed(() => {
    return vehicles.value.find((v) => v.id === currentVehicleId.value) || null;
  });

  // ---------- 方法 ----------
  function onVehicleChange() {
    // 切换车辆时无需额外操作，UI 自动更新
  }

  function getOperationText(type) {
    const map = {
      doorLock: "车门上锁",
      doorUnlock: "车门解锁",
      antiTheftEnable: "防盗开启",
      antiTheftDisable: "防盗关闭",
    };
    return map[type] || type;
  }

  function getStatusAfter(type, _vehicle) {
    const map = {
      doorLock: { doorStatus: "locked" },
      doorUnlock: { doorStatus: "unlocked" },
      antiTheftEnable: { antiTheftStatus: "enabled" },
      antiTheftDisable: { antiTheftStatus: "disabled" },
    };
    return map[type] || {};
  }

  function addLog(vehiclePlate, operation, result, operator) {
    const now = new Date();
    const time =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0") +
      ":" +
      String(now.getSeconds()).padStart(2, "0");
    logs.value.unshift({
      id: nextLogId++,
      vehiclePlate,
      operation,
      result,
      operator: operator || "系统",
      time,
    });
    // 保持日志数量不超过 100 条
    if (logs.value.length > 100) {
      logs.value = logs.value.slice(0, 100);
    }
  }

  async function executeControl(type) {
    const vehicle = currentVehicle.value;
    if (!vehicle) {
      ElMessage.warning("请先选择车辆");
      return;
    }

    const opText = getOperationText(type);
    const statusChanges = getStatusAfter(type, vehicle);

    // 检查状态是否已匹配
    let alreadyDone = false;
    if (type === "doorLock" && vehicle.doorStatus === "locked")
      alreadyDone = true;
    if (type === "doorUnlock" && vehicle.doorStatus === "unlocked")
      alreadyDone = true;
    if (type === "antiTheftEnable" && vehicle.antiTheftStatus === "enabled")
      alreadyDone = true;
    if (type === "antiTheftDisable" && vehicle.antiTheftStatus === "disabled")
      alreadyDone = true;

    if (alreadyDone) {
      ElMessage.info(`车辆已处于"${opText}"状态，无需重复操作`);
      return;
    }

    try {
      await ElMessageBox.confirm(
        `确认对 ${vehicle.plate} 执行「${opText}」操作吗？`,
        "操作确认",
        {
          type: "warning",
          confirmButtonText: "确认执行",
          cancelButtonText: "取消",
        },
      );

      // 模拟执行
      await new Promise((resolve) => setTimeout(resolve, 400));

      // 更新车辆状态
      Object.assign(vehicle, statusChanges);
      vehicle.lastUpdate = new Date()
        .toLocaleString("zh-CN", { hour12: false })
        .replace(/\//g, "-");

      // 记录日志
      addLog(vehicle.plate, opText, "success", "系统");

      ElMessage.success(`${opText} 成功`);
    } catch (err) {
      if (err !== "cancel" && err !== "close") {
        // 模拟失败情况（极少数）
        addLog(vehicle.plate, opText, "failed", "系统");
        ElMessage.error(`${opText} 失败，请重试`);
      }
    }
  }

  async function refreshAll() {
    ElMessage.info("正在刷新车辆状态...");
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 模拟刷新：随机微调位置和时间
    vehicles.value.forEach((v) => {
      v.latitude = +(v.latitude + (Math.random() - 0.5) * 0.001).toFixed(4);
      v.longitude = +(v.longitude + (Math.random() - 0.5) * 0.001).toFixed(4);
      v.lastUpdate = new Date()
        .toLocaleString("zh-CN", { hour12: false })
        .replace(/\//g, "-");
    });

    // 随机切换一个车辆状态（演示效果）
    const randomVehicle =
      vehicles.value[Math.floor(Math.random() * vehicles.value.length)];
    if (randomVehicle) {
      const statuses = ["online", "offline"];
      const currentIdx = statuses.indexOf(randomVehicle.status);
      randomVehicle.status = statuses[(currentIdx + 1) % statuses.length];
    }

    addLog("系统", "批量刷新状态", "success", "系统");
    ElMessage.success("所有车辆状态已刷新");
  }

  function openDetailDialog() {
    if (currentVehicle.value) {
      detailDialogVisible.value = true;
    } else {
      ElMessage.warning("请先选择车辆");
    }
  }

  // ---------- 图标映射 ----------
  return {
    // 图标
    Refresh: Refresh,
    InfoFilled: InfoFilled,

    // 数据
    vehicles,
    logs,
    currentVehicleId,
    detailDialogVisible,

    // 计算
    currentVehicle,

    // 方法
    onVehicleChange,
    executeControl,
    refreshAll,
    openDetailDialog,
  };
}

export default {
  setup: pageSetup,
};
</script>

<style scoped>
.vehicle-console-page {
  width: 100%;
  font-size: var(--app-font-size-base);
  line-height: 1.5;
}

.vehicle-console-page .section-title {
  margin: 0 0 16px 0;
  font-size: var(--app-font-size-md);
  font-weight: 700;
  line-height: 1.5;
  color: var(--app-color-text-primary);
}

.vehicle-console-page .page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.vehicle-console-page .page-heading h1 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  letter-spacing: 0;
}

.vehicle-console-page .page-heading p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.vehicle-console-page .page-heading .el-button--large {
  box-shadow: 0 4px 6px -1px rgb(0 104 158 / 18%);
}

/* 车辆选择栏 */
.vehicle-console-page .vehicle-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: var(--app-shadow-panel);
}

.vehicle-console-page .vehicle-selector .label {
  font-weight: 600;
  color: var(--app-color-text-secondary);
  white-space: nowrap;
}

.vehicle-console-page .vehicle-selector .el-select {
  width: 200px;
}

.vehicle-console-page .vehicle-selector .vehicle-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 8px;
  padding-left: 16px;
  border-left: 1px solid var(--app-color-border-light);
}

.vehicle-console-page .vehicle-selector .vehicle-info .model {
  font-weight: 600;
  font-size: var(--app-font-size-md);
  color: var(--app-color-text-primary);
}

.vehicle-console-page .vehicle-selector .vehicle-info .plate {
  color: var(--app-color-text-muted);
  font-size: var(--app-font-size-sm);
}

.vehicle-console-page .vehicle-selector .spacer {
  flex: 1;
}

.vehicle-console-page .vehicle-selector .detail-btn {
  margin-left: auto;
}

/* 状态概览卡片 */
.vehicle-console-page .status-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.vehicle-console-page .status-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: var(--app-shadow-panel);
  transition: border-color 0.2s;
}

.vehicle-console-page .status-card .icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 22px;
  flex-shrink: 0;
  background: var(--app-color-surface-subtle);
  color: var(--app-color-text-muted);
}

.vehicle-console-page .status-card .icon-wrap.online {
  background: #dff0e6;
  color: var(--app-color-success);
}

.vehicle-console-page .status-card .icon-wrap.offline {
  background: #fde8e8;
  color: var(--app-color-danger);
}

.vehicle-console-page .status-card .icon-wrap.driving {
  background: #e0edf9;
  color: var(--app-color-primary);
}

.vehicle-console-page .status-card .icon-wrap.stopped {
  background: #fef3e2;
  color: var(--app-color-warning);
}

.vehicle-console-page .status-card .icon-wrap.locked {
  background: #dff0e6;
  color: var(--app-color-success);
}

.vehicle-console-page .status-card .icon-wrap.unlocked {
  background: #fde8e8;
  color: var(--app-color-danger);
}

.vehicle-console-page .status-card .icon-wrap.enabled {
  background: #dff0e6;
  color: var(--app-color-success);
}

.vehicle-console-page .status-card .icon-wrap.disabled {
  background: #fde8e8;
  color: var(--app-color-danger);
}

.vehicle-console-page .status-card .info {
  flex: 1;
  min-width: 0;
}

.vehicle-console-page .status-card .info .label {
  font-size: var(--app-font-size-sm);
  color: var(--app-color-text-muted);
  line-height: 1.4;
}

.vehicle-console-page .status-card .info .value {
  font-size: var(--app-font-size-md);
  font-weight: 700;
  line-height: 1.5;
  color: var(--app-color-text-primary);
}

.vehicle-console-page .status-card .info .value .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  vertical-align: middle;
}

.vehicle-console-page .status-card .info .value .dot.green {
  background: var(--app-color-success);
}

.vehicle-console-page .status-card .info .value .dot.red {
  background: var(--app-color-danger);
}

.vehicle-console-page .status-card .info .value .dot.yellow {
  background: var(--app-color-warning);
}

.vehicle-console-page .status-card .info .value .dot.blue {
  background: var(--app-color-primary);
}

/* 控制区 */
.vehicle-console-page .control-section {
  padding: 16px 20px 20px;
  margin-bottom: 20px;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: var(--app-shadow-panel);
}

.vehicle-console-page .control-section .section-title {
  margin-bottom: 16px;
}

.vehicle-console-page .control-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.vehicle-console-page .control-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 12px;
  border: 1px solid var(--app-color-border-light);
  border-radius: var(--app-radius-panel);
  background: var(--app-color-surface-subtle);
  font-size: var(--app-font-size-base);
  font-weight: 600;
  color: var(--app-color-text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.vehicle-console-page .control-btn:hover {
  border-color: var(--app-color-primary);
  background: #eef6fc;
}

.vehicle-console-page .control-btn .icon {
  font-size: 28px;
  line-height: 1;
}

.vehicle-console-page .control-btn .label {
  font-size: var(--app-font-size-sm);
  font-weight: 500;
}

.vehicle-console-page .control-btn.primary {
  border-color: var(--app-color-primary);
  background: #eef6fc;
  color: var(--app-color-primary);
}

.vehicle-console-page .control-btn.primary:hover {
  background: #dceaf5;
}

.vehicle-console-page .control-btn.success {
  border-color: var(--app-color-success);
  background: #e7f5ed;
  color: var(--app-color-success);
}

.vehicle-console-page .control-btn.success:hover {
  background: #d4ede0;
}

.vehicle-console-page .control-btn.danger {
  border-color: var(--app-color-danger);
  background: #fde8e8;
  color: var(--app-color-danger);
}

.vehicle-console-page .control-btn.danger:hover {
  background: #fad5d5;
}

.vehicle-console-page .control-btn.warning {
  border-color: var(--app-color-warning);
  background: #fef3e2;
  color: var(--app-color-warning);
}

.vehicle-console-page .control-btn.warning:hover {
  background: #fce8c8;
}

.vehicle-console-page .control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 地图位置 */
.vehicle-console-page .map-section {
  padding: 16px 20px 20px;
  margin-bottom: 20px;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: var(--app-shadow-panel);
}

.vehicle-console-page .map-section .section-title {
  margin-bottom: 12px;
}

.vehicle-console-page .map-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  border-radius: var(--app-radius-panel);
  background: linear-gradient(135deg, #e8f0f8 0%, #d4e3f0 100%);
  overflow: hidden;
}

.vehicle-console-page .map-container .map-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
  background: rgb(255 255 255 / 92%);
  border-radius: var(--app-radius-panel);
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
  backdrop-filter: blur(4px);
}

.vehicle-console-page .map-container .map-marker .icon {
  font-size: 36px;
  line-height: 1;
}

.vehicle-console-page .map-container .map-marker .coords {
  font-size: var(--app-font-size-sm);
  font-weight: 600;
  color: var(--app-color-text-primary);
}

.vehicle-console-page .map-container .map-marker .address {
  font-size: var(--app-font-size-sm);
  color: var(--app-color-text-muted);
}

.vehicle-console-page .map-container .map-coords-overlay {
  position: absolute;
  right: 16px;
  bottom: 16px;
  padding: 6px 14px;
  font-size: var(--app-font-size-xs);
  color: var(--app-color-text-muted);
  background: rgb(255 255 255 / 80%);
  border-radius: var(--app-radius-control);
  backdrop-filter: blur(2px);
}

.vehicle-console-page .map-container .map-grid {
  position: absolute;
  inset: 0;
  opacity: 0.15;
  background-image:
    linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}

/* 日志表格 */
.vehicle-console-page .log-section {
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: var(--app-shadow-panel);
  overflow: hidden;
}

.vehicle-console-page .log-section .log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--app-color-border-light);
  background: var(--app-color-surface-muted);
}

.vehicle-console-page .log-section .log-header .section-title {
  margin: 0;
}

.vehicle-console-page .log-section .log-header .log-count {
  font-size: var(--app-font-size-sm);
  color: var(--app-color-text-muted);
}

.vehicle-console-page .log-section .el-table th.el-table__cell {
  color: #374151;
  font-weight: 700;
  background: var(--app-color-surface-muted);
}

.vehicle-console-page .log-section .el-table .cell {
  font-size: var(--app-font-size-base);
}

.vehicle-console-page .log-section .el-table .el-tag {
  font-size: var(--app-font-size-xs);
}

/* 车辆详情弹窗 */
.vehicle-console-page .vehicle-detail-dialog .el-dialog__body {
  padding-top: 8px;
  padding-bottom: 20px;
}

.vehicle-console-page .vehicle-detail-dialog .detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 32px;
  margin: 8px 0 4px;
}

.vehicle-console-page .vehicle-detail-dialog .detail-item {
  display: flex;
  align-items: baseline;
  padding: 6px 0;
  border-bottom: 1px solid var(--app-color-border-subtle);
}

.vehicle-console-page .vehicle-detail-dialog .detail-item .label {
  flex: 0 0 80px;
  font-size: var(--app-font-size-sm);
  color: var(--app-color-text-muted);
}

.vehicle-console-page .vehicle-detail-dialog .detail-item .value {
  flex: 1;
  font-size: var(--app-font-size-base);
  font-weight: 500;
  color: var(--app-color-text-primary);
}

.vehicle-console-page .vehicle-detail-dialog .detail-item .value .dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  vertical-align: middle;
}

.vehicle-console-page .vehicle-detail-dialog .detail-item .value .dot.green {
  background: var(--app-color-success);
}

.vehicle-console-page .vehicle-detail-dialog .detail-item .value .dot.red {
  background: var(--app-color-danger);
}

.vehicle-console-page .vehicle-detail-dialog .detail-item .value .dot.yellow {
  background: var(--app-color-warning);
}

.vehicle-console-page .vehicle-detail-dialog .detail-item .value .dot.blue {
  background: var(--app-color-primary);
}

.vehicle-console-page .vehicle-detail-dialog .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 响应式调整 */
@media (max-width: 1280px) {
  .vehicle-console-page .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .vehicle-console-page .control-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .vehicle-console-page .status-grid {
    grid-template-columns: 1fr 1fr;
  }

  .vehicle-console-page .control-grid {
    grid-template-columns: 1fr 1fr;
  }

  .vehicle-console-page .vehicle-selector {
    flex-wrap: wrap;
  }

  .vehicle-console-page .vehicle-selector .vehicle-info {
    border-left: 0;
    padding-left: 0;
    margin-left: 0;
    width: 100%;
  }
}
</style>
