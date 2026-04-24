const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Uncomment mosaic HTML
content = content.replace(/<!--\s*(<div class="video-box"[\s\S]*?)-->/g, '$1');

// 2. Uncomment Mosaic Layout Setup in JS
content = content.replace(/\/\*\s*Mosaic Layout Setup Commented Out\s*([\s\S]*?)\s*\*\//g, '$1');

// 3. Uncomment Mosaic Animation in JS and shift times by +2.2s
content = content.replace(/\/\*\s*Mosaic Animation Commented Out\s*([\s\S]*?)\s*\*\//g, (match, code) => {
    let newCode = code;
    newCode = newCode.replace(/}, 0\);/g, '}, 2.2);');
    newCode = newCode.replace(/}, 0\.5\);/g, '}, 2.7);');
    newCode = newCode.replace(/}, 0\.6\);/g, '}, 2.8);');
    newCode = newCode.replace(/}, 1\.2\);/g, '}, 3.4);');
    newCode = newCode.replace(/}, 1\.5\);/g, '}, 3.7);');
    newCode = newCode.replace(/}, 1\.8\);/g, '}, 4.0);');
    return newCode;
});

fs.writeFileSync('index.html', content);
console.log('Uncommented and shifted timeline');
