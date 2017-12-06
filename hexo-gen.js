const Hexo = require('hexo');
const path = require('path');

async function run() {
    const hexo = new Hexo(path.resolve(__dirname), { debug: false });
    await hexo.init();
    await hexo.call('clean');
    await hexo.load();
    await hexo.call('generate');
    await hexo.exit();

}

module.exports = run;