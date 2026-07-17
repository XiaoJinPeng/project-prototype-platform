// @vitest-environment node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { importPage, inspectHtml } from '../../plugins/page-transfer-plugin.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const temporaryRoots = [];

async function createPlatformFixture() {
  const fixtureParent = path.join(projectRoot, '.test-page-transfer');
  await fs.mkdir(fixtureParent, { recursive: true });
  const root = await fs.mkdtemp(path.join(fixtureParent, 'fixture-'));
  temporaryRoots.push(root);
  const packageRoot = path.join(root, 'projects', 'sample-project');
  await fs.mkdir(packageRoot, { recursive: true });
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
    `export const clientPageDefinitions = {\n  admin: {\n    sections: [{ id: 'workspace', title: '工作区' }],\n    pages: [\n      // <generator:admin-pages>\n    ],\n  },\n};\n`,
    'utf8',
  );
  return { root, packageRoot };
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((root) => fs.rm(root, { recursive: true, force: true })));
  await fs.rm(path.join(projectRoot, '.test-page-transfer'), { recursive: true, force: true });
});

describe('page transfer', () => {
  it('imports a valid HTML template into the selected project package', async () => {
    const source = await fs.readFile(path.join(projectRoot, 'templates', 'html-prototype-page.html'), 'utf8');
    expect(inspectHtml(source).valid).toBe(true);
    const { root, packageRoot } = await createPlatformFixture();

    const result = await importPage({
      projectRoot: root,
      source,
      target: {
        projectId: 'sample-project',
        client: 'admin',
        routePath: 'imported-page',
        menuSection: 'workspace',
        menuTitle: '导入页面',
        sourceFile: 'prototype.html',
      },
    });

    expect(result.routePath).toBe('/p/sample-project/admin/imported-page');
    const generatedView = path.join(packageRoot, 'views', 'admin', 'ImportedPageView.vue');
    expect(await fs.readFile(generatedView, 'utf8')).toContain('<style scoped>');
    expect(await fs.readFile(path.join(packageRoot, 'page-definitions.js'), 'utf8')).toContain(
      '"path":"imported-page"',
    );
  });

  it('rejects a duplicate route in the same project client', async () => {
    const source = await fs.readFile(path.join(projectRoot, 'templates', 'html-prototype-page.html'), 'utf8');
    const { root } = await createPlatformFixture();
    const target = {
      projectId: 'sample-project',
      client: 'admin',
      routePath: 'imported-page',
      menuSection: 'workspace',
      menuTitle: '导入页面',
    };
    await importPage({ projectRoot: root, source, target });
    await expect(importPage({ projectRoot: root, source, target })).rejects.toThrow('目标页面已存在');
  });
});
