<template>
  <main class="not-found-page">
    <section class="not-found-panel">
      <span class="status-code">404</span>
      <h1>页面不存在</h1>
      <p>当前地址没有对应的原型页面，请返回项目首页重新选择入口。</p>
      <router-link class="home-link" to="/">返回项目首页</router-link>
    </section>
  </main>
</template>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background: #f6f8fa;
  color: #172033;
}
.not-found-panel {
  width: min(480px, 100%);
  padding: 40px;
  text-align: center;
  background: #fff;
  border: 1px solid #dfe5ec;
  border-radius: 8px;
  box-shadow: 0 12px 32px rgb(15 23 42 / 8%);
}
.status-code {
  display: block;
  margin-bottom: 8px;
  color: var(--app-color-primary);
  font-size: 48px;
  font-weight: 700;
}
h1 {
  margin: 0 0 12px;
  font-size: 24px;
}
p {
  margin: 0 0 24px;
  color: #667085;
  line-height: 1.7;
}
.home-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 18px;
  color: #fff;
  text-decoration: none;
  background: var(--app-color-primary);
  border-radius: 4px;
}
</style>
