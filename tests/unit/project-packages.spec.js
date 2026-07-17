import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { scanProjectPackages } from '../../plugins/project-packages-plugin.js';

const temporaryRoots = [];
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function createProjectFixture() {
  const fixtureParent = path.join(projectRoot, '.test-project-packages');
  await fs.mkdir(fixtureParent, { recursive: true });
  const root = await fs.mkdtemp(path.join(fixtureParent, 'fixture-'));
  temporaryRoots.push(root);
  await fs.writeFile(path.join(root, 'package.json'), '{"type":"module"}', 'utf8');
  const projectsRoot = path.join(root, 'projects');
  const packageRoot = path.join(projectsRoot, 'sample-project');
  await fs.mkdir(path.join(packageRoot, 'views', 'admin'), { recursive: true });
  await fs.writeFile(
    path.join(packageRoot, 'project.json'),
    JSON.stringify({
      schemaVersion: 1,
      id: 'sample-project',
      name: '示例项目',
      pageDefinitions: 'page-definitions.js',
      clients: [{ id: 'admin', name: '管理端', defaultPage: 'home' }],
      entries: [{ id: 'admin', kind: 'client', clientId: 'admin', name: '管理端' }],
      features: { pageTransfer: true },
    }),
    'utf8',
  );
  await fs.writeFile(
    path.join(packageRoot, 'page-definitions.js'),
    `export const clientPageDefinitions = { admin: { sections: [{ id: 'workspace', title: '工作区' }], pages: [{ path: 'home', name: 'admin-home', title: '首页', view: 'admin/HomeView.vue', section: 'workspace', icon: 'House' }] } };\n// <generator:admin-pages>\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(packageRoot, 'views', 'admin', 'HomeView.vue'),
    '<template><main>首页</main></template>',
    'utf8',
  );
  return { projectsRoot, packageRoot };
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
  await fs.rm(path.join(projectRoot, '.test-project-packages'), { recursive: true, force: true });
});

describe('project package scanner', () => {
  it('discovers a complete project package', async () => {
    const { projectsRoot } = await createProjectFixture();
    const result = await scanProjectPackages(projectsRoot);
    expect(result.invalidProjects).toEqual([]);
    expect(result.projects.map((project) => project.id)).toEqual(['sample-project']);
  });

  it('rejects a package with a missing registered view', async () => {
    const { projectsRoot, packageRoot } = await createProjectFixture();
    await fs.rm(path.join(packageRoot, 'views', 'admin', 'HomeView.vue'));
    const result = await scanProjectPackages(projectsRoot);
    expect(result.projects).toEqual([]);
    expect(result.invalidProjects[0].errors).toContain('页面文件不存在：admin/HomeView.vue。');
  });
});
