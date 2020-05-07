console.log('publishing...');
require('shelljs/global');
var path = require('path');
var root = path.resolve(__dirname);
var branch = process.argv[2];
if (!branch) {
    console.log('输入后端分支： node publish.js dev');
    return;
}
/**  build **/
exec(`cd ${root} && npm run build`);
console.log('\nbuilded ok\n');
/**  build end**/
/** copy to backend **/
exec(`git clone -b ${branch} git@code.ops.focus.cn:system/fe-node.git`);

var src = './dist';
var vm = `./fe-node/code/public/`;
cp('-R', src, vm);
rm('-R', vm + 'tour');
cp('-R', vm + 'dist', vm + 'tour');
rm('-R', vm + 'dist');
/** copy to backend end**/
/** push to backend **/
exec(`cd fe-node && git add * && git pull origin ${branch} && git commit -m 'update: tour commit' && git push origin ${branch}`);
rm('-rf', './fe-node');
/** push to backend end**/
console.log('publish done...');
