import { copyFileSync, readFileSync, writeFileSync } from 'fs';

const dir = 'dist';

const pkg = JSON.parse(readFileSync('./package.json', { encoding: 'utf-8' }));

writeFileSync(`${dir}/package.json`, JSON.stringify(pkg, null, 2));
copyFileSync('LICENSE', `${dir}/LICENSE`);
