export const clientPageDefinitions = {
  admin: {
    basePath: '/admin',
    sections: [
      { id: 'workspace', title: '工作区' },
      { id: 'group-2', title: '新分组' },
    ],
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
        path: 'vehicle-console',
        name: 'admin-vehicle-console',
        title: '车辆控制台',
        view: 'admin/VehicleConsoleView.vue',
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
      {
        path: 'vehicle-console-2',
        name: 'admin-vehicle-console-2',
        title: '车辆控制台-2',
        view: 'admin/VehicleConsole2View.vue',
        section: 'workspace',
        icon: 'Van',
        source: 'html-template',
        prototype: {
          sourceFile: 'preview (2).html',
          templateVersion: 1,
          pageKey: 'vehicle-console-page',
          pageTitle: '车辆控制台',
          pageType: 'console',
          pageHeaderMode: 'standard',
        },
      },

      // <generator:admin-pages>
    ],
  },
  'client-2': {
    basePath: '/client-2',
    sections: [{ id: 'workspace', title: '工作区' }],
    pages: [
      // <generator:client-2-pages>
    ],
  },
  'client-3': {
    basePath: '/client-3',
    sections: [{ id: 'workspace', title: '工作区' }],
    pages: [
      // <generator:client-3-pages>
    ],
  },
};
