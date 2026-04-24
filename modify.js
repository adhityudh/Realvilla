const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');

// 1. Comment out all .video-box elements in HTML
content = content.replace(/<div class="video-box" data-mosaic="m-shape-\d+">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>/g, (match) => {
    return `<!-- ${match} -->`;
});

// 2. Change opacity of .solid-text in CSS
content = content.replace(/\.solid-text\s*\{\s*position: absolute;\s*inset: 0;\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*opacity: 0;/g, 
    '.solid-text {\n            position: absolute;\n            inset: 0;\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            opacity: 1;');

// 3. Comment out the mosaic layout setup in JS
content = content.replace(/wrappers\.forEach\(\(wrapper, i\) => \{\s*const box = wrapper\.querySelector\('\.video-box'\);[\s\S]*?gsap\.set\(morphShape, \{ xPercent: -50, yPercent: -50, scale: 2 \}\);\s*\}\);/g, 
    '/* Mosaic Layout Setup Commented Out\n$& \n*/');

// 4. Comment out the mosaic animation in JS timeline
content = content.replace(/wrappers\.forEach\(\(wrapper, i\) => \{\s*const box = wrapper\.querySelector\('\.video-box'\);[\s\S]*?tl\.to\(box, \{ opacity: 0, duration: 0\.1 \}, 1\.8\);\s*\}\);/g, 
    '/* Mosaic Animation Commented Out\n$& \n*/');

fs.writeFileSync('index.html', content);
console.log('Modified index.html');
