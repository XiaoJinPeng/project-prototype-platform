<template>
  <!-- 由规范 HTML 原型导入；页面业务状态和模拟数据保留在本页面。 -->
  <section class="standard-list-page">
    <!-- PAGE_HEADER: standard 模式 -->
    <div
      class="page-heading"
      data-page-header="standard"
      data-block-id="page-heading"
      data-block-name="页面标题"
    >
      <div>
        <h1>排版管理系统</h1>
        <p>
          统一管理政府公文、通知、报告等文件的排版任务与审核流程，保障文件规范与时效。
        </p>
      </div>
      <el-button
        type="primary"
        size="large"
        :icon="Plus"
        @click="openCreateDialog"
      >
        新建排版任务
      </el-button>
    </div>

    <!-- BUSINESS_CONTENT: 自由业务区 -->
    <div data-business-content>
      <!-- 统计卡片行 -->
      <div
        class="stats-row"
        data-block-id="stats-row"
        data-block-name="统计概览"
      >
        <div class="stat-card pending">
          <div class="stat-label">待排版</div>
          <div class="stat-number">
            {{ stats.pending }}<span class="unit">件</span>
          </div>
          <div class="stat-tag">等待排版处理</div>
        </div>
        <div class="stat-card processing">
          <div class="stat-label">排版中</div>
          <div class="stat-number">
            {{ stats.processing }}<span class="unit">件</span>
          </div>
          <div class="stat-tag">正在排版制作</div>
        </div>
        <div class="stat-card reviewing">
          <div class="stat-label">审核中</div>
          <div class="stat-number">
            {{ stats.reviewing }}<span class="unit">件</span>
          </div>
          <div class="stat-tag">等待审核确认</div>
        </div>
        <div class="stat-card published">
          <div class="stat-label">已发布</div>
          <div class="stat-number">
            {{ stats.published }}<span class="unit">件</span>
          </div>
          <div class="stat-tag">已正式发布</div>
        </div>
        <div class="stat-card rejected">
          <div class="stat-label">已退回</div>
          <div class="stat-number">
            {{ stats.rejected }}<span class="unit">件</span>
          </div>
          <div class="stat-tag">需重新排版</div>
        </div>
      </div>

      <!-- 列表面板 -->
      <section
        class="content-panel"
        data-block-id="list-panel"
        data-block-name="排版任务列表"
      >
        <div class="filter-bar">
          <div class="filter-fields">
            <el-input
              v-model="filters.keyword"
              :prefix-icon="Search"
              clearable
              placeholder="搜索任务编号或文件名称"
            ></el-input>
            <el-select v-model="filters.type" clearable placeholder="全部类型">
              <el-option label="政府公文" value="政府公文"></el-option>
              <el-option label="工作报告" value="工作报告"></el-option>
              <el-option label="通知公告" value="通知公告"></el-option>
              <el-option label="政策文件" value="政策文件"></el-option>
              <el-option label="会议纪要" value="会议纪要"></el-option>
              <el-option label="其他" value="其他"></el-option>
            </el-select>
            <el-select
              v-model="filters.status"
              clearable
              placeholder="全部状态"
            >
              <el-option label="待排版" value="pending"></el-option>
              <el-option label="排版中" value="processing"></el-option>
              <el-option label="审核中" value="reviewing"></el-option>
              <el-option label="已发布" value="published"></el-option>
              <el-option label="已退回" value="rejected"></el-option>
            </el-select>
            <el-tooltip content="重置筛选" placement="top">
              <el-button
                circle
                :icon="Refresh"
                aria-label="重置筛选"
                @click="resetFilters"
              ></el-button>
            </el-tooltip>
            <el-button
              type="primary"
              plain
              :icon="Download"
              @click="exportRows"
            >
              导出
            </el-button>
          </div>
          <div class="filter-summary">共 {{ filteredRows.length }} 个任务</div>
        </div>

        <div class="table-wrap">
          <el-table :data="pagedRows" row-key="id" stripe style="width: 100%">
            <el-table-column prop="taskCode" label="任务编号" width="150">
            </el-table-column>
            <el-table-column label="文件名称" min-width="200">
              <template #default="scope">
                <div class="name-cell">
                  <strong>{{ scope.row.fileName }}</strong>
                  <span>{{ scope.row.description || "无说明" }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="type" label="排版类型" width="130">
            </el-table-column>
            <el-table-column prop="submitter" label="提交人" width="100">
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template #default="scope">
                <el-tag
                  :type="statusTagType(scope.row.status)"
                  :class="statusTagClass(scope.row.status)"
                  size="default"
                >
                  {{ statusLabel(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="创建时间" width="170">
            </el-table-column>
            <el-table-column label="操作" width="210" align="right">
              <template #default="scope">
                <div class="action-group">
                  <el-button
                    link
                    type="primary"
                    @click="openEditDialog(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    link
                    :type="reviewButtonType(scope.row.status)"
                    @click="handleReview(scope.row)"
                    :disabled="reviewDisabled(scope.row.status)"
                  >
                    {{ reviewButtonLabel(scope.row.status) }}
                  </el-button>
                  <el-button link type="danger" @click="removeRow(scope.row)">
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="pagination-bar">
          <span></span>
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50]"
            :total="filteredRows.length"
            layout="total, sizes, prev, pager, next, jumper"
          ></el-pagination>
        </div>
      </section>
    </div>
    <!-- BUSINESS_CONTENT_END -->
  </section>
  <!-- 新建/编辑弹窗 -->
  <el-dialog
    v-model="dialogVisible"
    class="standard-list-dialog"
    :title="dialogMode === 'create' ? '新建排版任务' : '编辑排版任务'"
    width="620px"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="文件名称" prop="fileName">
        <el-input
          v-model="form.fileName"
          maxlength="50"
          show-word-limit
          placeholder="请输入文件名称"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="排版类型" prop="type">
        <el-select
          v-model="form.type"
          placeholder="请选择排版类型"
          style="width: 100%"
        >
          <el-option label="政府公文" value="政府公文"></el-option>
          <el-option label="工作报告" value="工作报告"></el-option>
          <el-option label="通知公告" value="通知公告"></el-option>
          <el-option label="政策文件" value="政策文件"></el-option>
          <el-option label="会议纪要" value="会议纪要"></el-option>
          <el-option label="其他" value="其他"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="提交人" prop="submitter">
        <el-input
          v-model="form.submitter"
          maxlength="20"
          placeholder="请输入提交人姓名"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="任务状态" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          style="width: 100%"
        >
          <el-option label="待排版" value="pending"></el-option>
          <el-option label="排版中" value="processing"></el-option>
          <el-option label="审核中" value="reviewing"></el-option>
          <el-option label="已发布" value="published"></el-option>
          <el-option label="已退回" value="rejected"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="文件说明">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="可填写文件简要说明或备注"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm"
          >保存</el-button
        >
      </div>
    </template>
  </el-dialog>

  <!-- 审核确认弹窗（用 ElMessageBox 实现，无需额外 dialog） -->
</template>

<script>
// 来源模板：standard-list-page
import { ref, reactive, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Plus, Download } from "@element-plus/icons-vue";

function pageSetup() {
  // --- 筛选与分页 ---
  const filters = reactive({ keyword: "", type: "", status: "" });
  const pagination = reactive({ page: 1, pageSize: 10 });

  // --- 弹窗状态 ---
  const dialogVisible = ref(false);
  const dialogMode = ref("create"); // 'create' | 'edit'
  const editingId = ref(null);
  const submitting = ref(false);
  const formRef = ref();

  // --- 表单数据 ---
  const form = reactive({
    fileName: "",
    type: "",
    submitter: "",
    status: "pending",
    description: "",
  });

  // --- 模拟数据 ---
  const rows = ref([
    {
      id: 1,
      taskCode: "PS-2026-001",
      fileName: "关于推进政务公开工作的实施意见",
      type: "政府公文",
      submitter: "李处长",
      status: "pending",
      description: "需按最新公文格式排版，含附件3份",
      createdAt: "2026-07-14 09:30",
    },
    {
      id: 2,
      taskCode: "PS-2026-002",
      fileName: "2026年上半年经济运行分析报告",
      type: "工作报告",
      submitter: "王主任",
      status: "processing",
      description: "数据图表较多，需精细排版",
      createdAt: "2026-07-13 14:20",
    },
    {
      id: 3,
      taskCode: "PS-2026-003",
      fileName: "关于调整住房公积金政策的通知",
      type: "通知公告",
      submitter: "张科长",
      status: "reviewing",
      description: "需经法务审核后发布",
      createdAt: "2026-07-12 11:10",
    },
    {
      id: 4,
      taskCode: "PS-2026-004",
      fileName: "数字政府建设三年行动计划（2026-2028）",
      type: "政策文件",
      submitter: "赵副局长",
      status: "published",
      description: "已正式印发，需同步制作解读材料",
      createdAt: "2026-07-10 16:50",
    },
    {
      id: 5,
      taskCode: "PS-2026-005",
      fileName: "全市防汛抗旱工作会议纪要",
      type: "会议纪要",
      submitter: "刘秘书",
      status: "rejected",
      description: "格式不符合规范，退回重排",
      createdAt: "2026-07-09 08:40",
    },
    {
      id: 6,
      taskCode: "PS-2026-006",
      fileName: "营商环境优化提升行动方案",
      type: "政府公文",
      submitter: "陈主任",
      status: "pending",
      description: "需按紧急程度优先排版",
      createdAt: "2026-07-14 07:20",
    },
    {
      id: 7,
      taskCode: "PS-2026-007",
      fileName: "2026年第三季度重点工作安排",
      type: "工作报告",
      submitter: "孙处长",
      status: "processing",
      description: "含多个附表，需统一格式",
      createdAt: "2026-07-13 10:00",
    },
    {
      id: 8,
      taskCode: "PS-2026-008",
      fileName: "关于表彰先进集体的决定",
      type: "通知公告",
      submitter: "周科长",
      status: "reviewing",
      description: "需核对名单后发布",
      createdAt: "2026-07-12 15:30",
    },
  ]);

  // --- 统计 ---
  const stats = computed(() => {
    const list = rows.value;
    return {
      pending: list.filter((r) => r.status === "pending").length,
      processing: list.filter((r) => r.status === "processing").length,
      reviewing: list.filter((r) => r.status === "reviewing").length,
      published: list.filter((r) => r.status === "published").length,
      rejected: list.filter((r) => r.status === "rejected").length,
    };
  });

  // --- 过滤与分页 ---
  const filteredRows = computed(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return rows.value.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.taskCode.toLowerCase().includes(keyword) ||
        item.fileName.toLowerCase().includes(keyword);
      const matchType = !filters.type || item.type === filters.type;
      const matchStatus = !filters.status || item.status === filters.status;
      return matchKeyword && matchType && matchStatus;
    });
  });

  const pagedRows = computed(() => {
    const start = (pagination.page - 1) * pagination.pageSize;
    return filteredRows.value.slice(start, start + pagination.pageSize);
  });

  // --- 状态辅助函数 ---
  const statusMap = {
    pending: "待排版",
    processing: "排版中",
    reviewing: "审核中",
    published: "已发布",
    rejected: "已退回",
  };

  function statusLabel(status) {
    return statusMap[status] || status;
  }

  function statusTagType(status) {
    const map = {
      pending: "warning",
      processing: "primary",
      reviewing: "info",
      published: "success",
      rejected: "danger",
    };
    return map[status] || "";
  }

  function statusTagClass(status) {
    return `status-tag-${status}`;
  }

  function reviewButtonLabel(status) {
    const map = {
      pending: "开始排版",
      processing: "提交审核",
      reviewing: "审核",
      published: "已发布",
      rejected: "重新提交",
    };
    return map[status] || "审核";
  }

  function reviewButtonType(status) {
    if (status === "published") return "info";
    if (status === "rejected") return "warning";
    return "primary";
  }

  function reviewDisabled(status) {
    return status === "published";
  }

  // --- 表单验证规则 ---
  const formRules = {
    fileName: [{ required: true, message: "请输入文件名称", trigger: "blur" }],
    type: [{ required: true, message: "请选择排版类型", trigger: "change" }],
    submitter: [
      { required: true, message: "请输入提交人姓名", trigger: "blur" },
    ],
    status: [{ required: true, message: "请选择任务状态", trigger: "change" }],
  };

  // --- 方法 ---
  function resetFilters() {
    filters.keyword = "";
    filters.type = "";
    filters.status = "";
    pagination.page = 1;
  }

  function resetForm() {
    form.fileName = "";
    form.type = "";
    form.submitter = "";
    form.status = "pending";
    form.description = "";
  }

  function openCreateDialog() {
    dialogMode.value = "create";
    editingId.value = null;
    resetForm();
    dialogVisible.value = true;
  }

  function openEditDialog(row) {
    dialogMode.value = "edit";
    editingId.value = row.id;
    form.fileName = row.fileName;
    form.type = row.type;
    form.submitter = row.submitter;
    form.status = row.status;
    form.description = row.description || "";
    dialogVisible.value = true;
  }

  async function submitForm() {
    if (!formRef.value) return;
    const valid = await formRef.value.validate().catch(() => false);
    if (!valid) return;

    submitting.value = true;
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (dialogMode.value === "create") {
      const maxId = rows.value.reduce((max, r) => Math.max(max, r.id), 0);
      const newId = maxId + 1;
      const codeNum = String(rows.value.length + 1).padStart(3, "0");
      rows.value.unshift({
        id: newId,
        taskCode: `PS-2026-${codeNum}`,
        fileName: form.fileName,
        type: form.type,
        submitter: form.submitter,
        status: form.status,
        description: form.description || "无说明",
        createdAt: new Date()
          .toLocaleString("zh-CN", { hour12: false })
          .replace(/\//g, "-"),
      });
      ElMessage.success("新建任务成功");
    } else {
      const target = rows.value.find((item) => item.id === editingId.value);
      if (target) {
        target.fileName = form.fileName;
        target.type = form.type;
        target.submitter = form.submitter;
        target.status = form.status;
        target.description = form.description || "无说明";
        ElMessage.success("任务已更新");
      }
    }

    submitting.value = false;
    dialogVisible.value = false;
  }

  // --- 审核操作 ---
  async function handleReview(row) {
    const status = row.status;

    if (status === "pending") {
      // 待排版 → 排版中
      const confirm = await ElMessageBox.confirm(
        `确认开始对「${row.fileName}」进行排版吗？`,
        "开始排版",
        {
          type: "info",
          confirmButtonText: "确认开始",
          cancelButtonText: "取消",
        },
      ).catch(() => false);
      if (confirm) {
        row.status = "processing";
        ElMessage.success("已开始排版");
      }
      return;
    }

    if (status === "processing") {
      // 排版中 → 审核中
      const confirm = await ElMessageBox.confirm(
        `确认将「${row.fileName}」提交审核吗？`,
        "提交审核",
        {
          type: "info",
          confirmButtonText: "确认提交",
          cancelButtonText: "取消",
        },
      ).catch(() => false);
      if (confirm) {
        row.status = "reviewing";
        ElMessage.success("已提交审核");
      }
      return;
    }

    if (status === "reviewing") {
      // 审核中 → 通过(已发布) 或 退回(已退回)
      const action = await ElMessageBox.confirm(
        `请对「${row.fileName}」的排版结果进行审核：`,
        "审核确认",
        {
          type: "warning",
          distinguishCancelAndClose: true,
          confirmButtonText: "审核通过",
          cancelButtonText: "审核退回",
        },
      )
        .then(() => "pass")
        .catch((err) => {
          if (err === "cancel") return "reject";
          return false;
        });

      if (action === "pass") {
        row.status = "published";
        ElMessage.success("审核通过，已发布");
      } else if (action === "reject") {
        row.status = "rejected";
        ElMessage.warning("已退回，需重新排版");
      }
      return;
    }

    if (status === "rejected") {
      // 已退回 → 待排版
      const confirm = await ElMessageBox.confirm(
        `确认将「${row.fileName}」重新提交排版吗？`,
        "重新提交",
        {
          type: "info",
          confirmButtonText: "确认重新提交",
          cancelButtonText: "取消",
        },
      ).catch(() => false);
      if (confirm) {
        row.status = "pending";
        ElMessage.info("已重新提交，等待排版");
      }
      return;
    }

    // published 状态不会触发，因为按钮已禁用
  }

  // --- 删除 ---
  async function removeRow(row) {
    await ElMessageBox.confirm(
      `确认删除「${row.fileName}」吗？删除后不可恢复。`,
      "删除确认",
      {
        type: "warning",
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
      },
    );
    rows.value = rows.value.filter((item) => item.id !== row.id);
    ElMessage.success("任务已删除");
  }

  // --- 导出 ---
  function exportRows() {
    const count = filteredRows.value.length;
    ElMessage.success(`已导出 ${count} 条排版任务记录（演示）`);
  }

  // --- 返回所有响应式数据 ---
  return {
    // 图标
    Search: Search,
    Refresh: Refresh,
    Plus: Plus,
    Download: Download,
    // 状态
    filters,
    pagination,
    dialogVisible,
    dialogMode,
    submitting,
    formRef,
    form,
    formRules,
    rows,
    stats,
    filteredRows,
    pagedRows,
    // 辅助函数
    statusLabel,
    statusTagType,
    statusTagClass,
    reviewButtonLabel,
    reviewButtonType,
    reviewDisabled,
    // 方法
    resetFilters,
    openCreateDialog,
    openEditDialog,
    submitForm,
    handleReview,
    removeRow,
    exportRows,
  };
}

export default {
  setup: pageSetup,
};
</script>

<style scoped>
.standard-list-page {
  width: 100%;
  font-size: var(--app-font-size-base);
  line-height: 1.5;
}

.standard-list-page .section-title {
  margin: 0;
  font-size: var(--app-font-size-md);
  font-weight: 700;
  line-height: 1.5;
}

/* 页面头部 */
.standard-list-page .page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
}

.standard-list-page .page-heading h1 {
  margin: 0;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
  letter-spacing: 0;
}

.standard-list-page .page-heading p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.standard-list-page .page-heading .el-button--large {
  box-shadow: 0 4px 6px -1px rgb(0 104 158 / 18%);
}

/* 统计卡片行 */
.standard-list-page .stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.standard-list-page .stat-card {
  flex: 1;
  min-width: 0;
  padding: 16px 20px;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: var(--app-shadow-panel);
  transition: box-shadow 0.2s;
}

.standard-list-page .stat-card:hover {
  box-shadow: 0 4px 12px rgb(15 23 42 / 12%);
}

.standard-list-page .stat-card .stat-label {
  font-size: var(--app-font-size-sm);
  color: var(--app-color-text-muted);
}

.standard-list-page .stat-card .stat-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--app-color-text-primary);
}

.standard-list-page .stat-card .stat-number .unit {
  margin-left: 4px;
  font-size: var(--app-font-size-base);
  font-weight: 400;
  color: var(--app-color-text-muted);
}

.standard-list-page .stat-card .stat-tag {
  display: inline-block;
  margin-top: 6px;
  font-size: var(--app-font-size-xs);
  color: var(--app-color-text-muted);
}

/* 面板 */
.standard-list-page .content-panel {
  overflow: hidden;
  background: var(--app-color-surface);
  border: 1px solid var(--app-color-border-subtle);
  border-radius: var(--app-radius-list-panel);
  box-shadow: 0 1px 3px rgb(15 23 42 / 8%);
}

.standard-list-page .filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  min-height: 60px;
  border-bottom: 1px solid var(--app-color-border-light);
  background: var(--app-color-surface-muted);
  flex-wrap: wrap;
  gap: 8px;
}

.standard-list-page .filter-fields {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.standard-list-page .filter-fields .el-input {
  width: 260px;
}

.standard-list-page .filter-fields .el-select {
  width: 150px;
}

.standard-list-page .filter-summary {
  flex: 0 0 auto;
  margin-left: 16px;
  font-size: 14px;
  color: #6b7280;
  white-space: nowrap;
}

.standard-list-page .table-wrap {
  padding: 0;
  overflow-x: auto;
}

.standard-list-page .el-table th.el-table__cell {
  color: #374151;
  font-weight: 700;
  background: var(--app-color-surface-muted);
}

.standard-list-page .pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid var(--app-color-border-light);
  background: var(--app-color-surface-muted);
}

.standard-list-page .name-cell strong {
  display: block;
  font-size: 14px;
}

.standard-list-page .name-cell span {
  display: block;
  margin-top: 2px;
  font-size: 12px;
  color: var(--app-color-text-muted);
}

/* 弹窗样式 */
.standard-list-dialog .el-dialog__body {
  padding-top: 10px;
}

.standard-list-dialog .dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 状态标签自定义色彩辅助 */
.standard-list-page .status-tag-pending {
  background-color: #fef3c7;
  border-color: #f59e0b;
  color: #b45309;
}

.standard-list-page .status-tag-processing {
  background-color: #dbeafe;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.standard-list-page .status-tag-reviewing {
  background-color: #e0e7ff;
  border-color: #6366f1;
  color: #4338ca;
}

.standard-list-page .status-tag-published {
  background-color: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.standard-list-page .status-tag-rejected {
  background-color: #fee2e2;
  border-color: #ef4444;
  color: #991b1b;
}

/* 统计卡片颜色点缀 */
.standard-list-page .stat-card.pending .stat-number {
  color: #d97706;
}
.standard-list-page .stat-card.processing .stat-number {
  color: #2563eb;
}
.standard-list-page .stat-card.reviewing .stat-number {
  color: #6366f1;
}
.standard-list-page .stat-card.published .stat-number {
  color: #059669;
}
.standard-list-page .stat-card.rejected .stat-number {
  color: #dc2626;
}

/* 操作按钮组间距 */
.standard-list-page .action-group .el-button + .el-button {
  margin-left: 4px;
}
</style>
