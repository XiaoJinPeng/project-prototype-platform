export const clientPageDefinitions = {
  admin: {
    basePath: '/admin',
    sections: [{ id: 'workspace', title: '工作区' }],
    pages: [
      {
        path: 'home',
        name: 'admin-home',
        title: '项目首页',
        view: 'admin/HomeView.vue',
        section: 'workspace',
        icon: 'House',
      },
      // <generator:admin-pages>
    ],
  },
};
