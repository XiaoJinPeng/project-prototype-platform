<template>
  <PageLayout>
    <PageHeader title="项目首页" description="根据项目业务补充首页内容。" />
    <ContentPanel title="内容区">
      <EmptyState title="项目包已接入" description="可通过页面生成器或 HTML 导入工具继续增加页面。" />
    </ContentPanel>
  </PageLayout>
</template>

<script setup>
import { ContentPanel, EmptyState, PageHeader, PageLayout } from '@/components/ui';
</script>

<style scoped></style>
