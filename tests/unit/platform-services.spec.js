import { describe, expect, it } from 'vitest';

import { getHtmlPrototypeUrl } from '../../src/services/html-prototypes';
import { normalizeDocumentPath, resolveDocumentReference } from '../../src/services/prd-documents';
import { extractPrdHeadings } from '../../src/services/prd-bindings';
import { getProjectAssetUrl } from '../../src/services/project-assets';

describe('platform service path handling', () => {
  it('keeps query strings and anchors when resolving document references', () => {
    expect(resolveDocumentReference('业务/当前文档.md', '../共享/规则.md?mode=review#审批')).toBe(
      '共享/规则.md?mode=review#审批',
    );
    expect(resolveDocumentReference('业务/当前文档.md', 'docs+preview://规则#审批')).toBe(
      'docs+preview://规则#审批',
    );
    expect(normalizeDocumentPath('../../共享/规则.md')).toBe('共享/规则.md');
  });

  it('ignores headings inside backtick and tilde code fences', () => {
    const headings = extractPrdHeadings(
      [
        '# 文档标题',
        '```md',
        '## 代码中的标题',
        '```',
        '~~~md',
        '## 另一段代码标题',
        '~~~',
        '````md',
        '```',
        '## 四反引号代码中的标题',
        '````',
        '## 正文标题',
      ].join('\n'),
    );

    expect(headings.map((heading) => heading.text)).toEqual(['文档标题', '正文标题']);
  });

  it('rejects parent-directory traversal in public resource URLs', () => {
    expect(getProjectAssetUrl('sample', '../platform-settings.json')).toBe('');
    expect(getHtmlPrototypeUrl('sample', 'admin', '../secret.html')).toBe('');
    expect(getProjectAssetUrl('sample', 'assets/logo.png')).toContain('path=assets%2Flogo.png');
    expect(getHtmlPrototypeUrl('sample', 'admin', '页面/详情.html')).toContain(
      '%E9%A1%B5%E9%9D%A2/%E8%AF%A6%E6%83%85.html',
    );
  });
});
