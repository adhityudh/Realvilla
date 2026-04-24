const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');

// The block looks like this:
//                     <div class="video-box" data-mosaic="m-shape-1">
//                         <div class="video-inner">
//                             <div class="mask-layer">
//                                 <div class="morph-shape"></div>
//                                 <div class="letter-font"></div>
//                             </div>
//                         </div>
//                     </div> 

// We want to replace it with <!-- ... -->
// But be careful not to double-comment if it's already commented.
const regex = /(<div class="video-box" data-mosaic="m-shape-\d+">\s*<div class="video-inner">\s*<div class="mask-layer">\s*<div class="morph-shape"><\/div>\s*<div class="letter-font"><\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*)/g;

content = content.replace(regex, (match) => {
    return `<!-- ${match.trim()} -->\n                    `;
});

// Fix any double comments just in case
content = content.replace(/<!--\s*<!--/g, '<!--');
content = content.replace(/-->\s*-->/g, '-->');

fs.writeFileSync('index.html', content);
console.log('Fixed mosaic comments');
