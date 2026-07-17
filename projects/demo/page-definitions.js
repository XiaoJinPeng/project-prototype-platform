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
      {
        path: 'vehicle-console-1',
        name: 'admin-vehicle-console-1',
        title: '车辆控制台',
        view: 'admin/VehicleConsole1View.vue',
        section: 'workspace',
        icon: 'Van',
        source: 'html-template',
        prototype: {
          sourceFile: 'deepseek_html_20260715_a05d9f.html',
          templateVersion: 1,
          pageKey: 'vehicle-console-page',
          pageTitle: '车辆控制台',
          pageType: 'dashboard',
          pageHeaderMode: 'standard',
        },
      },
      // <generator:admin-pages>
    ],
  },
};
