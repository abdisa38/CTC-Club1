import fs from 'fs';

let code = fs.readFileSync('c:/Users/SPARK COMPUTERS MART/Videos/CTC Club1/CTC-Club1/src/app/pages/Home.tsx', 'utf-8');

code = code.replace(/https:\/\/images\.unsplash\.com\/photo-1753613648137-602c669cbe07\?w=700\&h=500\&fit=crop/g, 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&h=500&fit=crop');

code = code.replace(/bg-white dark:bg-\[#0c0f1a\]/g, 'bg-transparent');
code = code.replace(/bg-slate-50\/50 dark:bg-\[#0a0d17\]/g, 'bg-transparent');
code = code.replace(/bg-white dark:bg-\[\#0c0f1a\]/g, 'bg-transparent');
code = code.replace(/bg-slate-50\/50 dark:bg-\[\#0a0d17\]/g, 'bg-transparent');
code = code.replace(/bg-transparent border-y/g, 'bg-transparent border-y'); 

code = code.replace(/text-slate-900 dark:text-white/g, 'text-white');
code = code.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-300');
code = code.replace(/text-slate-600 dark:text-slate-400/g, 'text-slate-400');
code = code.replace(/text-slate-500/g, 'text-slate-300');
code = code.replace(/text-slate-600/g, 'text-slate-300');

code = code.replace('Start Your Journey Today<br />with CTC Club', 'Start Your Tech Journey Today');

fs.writeFileSync('c:/Users/SPARK COMPUTERS MART/Videos/CTC Club1/CTC-Club1/src/app/pages/Home.tsx', code);
