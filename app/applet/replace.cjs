const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Remove overflowX: 'auto'
content = content.replace(/<div style=\{\{ overflowX: 'auto' \}\}>/g, '<div>');

// 2. Make inline add buttons visible on mobile
content = content.replace(
  /<td className="hidden sm:table-cell px-5 py-3\.5 whitespace-nowrap text-right">(\s*<div className="flex items-center justify-end gap-2">\s*<button\s*onClick=\{\(\) => \{ handleAddTransaction\(\);)/g,
  '<td className="px-2 sm:px-5 py-3.5 whitespace-nowrap text-right">$1'
);

// 3. Replace px-5 with px-2 sm:px-5 in <th> and <td>
content = content.replace(/<(th|td)([^>]*)className="([^"]*)\bpx-5\b([^"]*)"/g, function(match, tag, beforeClass, classBeforePx, classAfterPx) {
  if (classBeforePx.includes('sm:px-5') || classBeforePx.includes('px-2 ')) {
    return match;
  }
  return `<${tag}${beforeClass}className="${classBeforePx}px-2 sm:px-5${classAfterPx}"`;
});

// 4. Replace px-6 with px-2 sm:px-6 in <th> and <td>
content = content.replace(/<(th|td)([^>]*)className="([^"]*)\bpx-6\b([^"]*)"/g, function(match, tag, beforeClass, classBeforePx, classAfterPx) {
  if (classBeforePx.includes('sm:px-6') || classBeforePx.includes('px-2 ')) {
    return match;
  }
  return `<${tag}${beforeClass}className="${classBeforePx}px-2 sm:px-6${classAfterPx}"`;
});

fs.writeFileSync('src/pages/Dashboard.tsx', content);
console.log('Done');
