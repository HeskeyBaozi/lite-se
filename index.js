const serve = require('koa-static');
const Koa = require('koa');
const run = require('./hexo-gen');


async function runServer() {
    await run();

    const app = new Koa();
    const PORT = 3000;

    // $ GET /package.json
    app.use(serve('./public',));

    await app.listen(PORT);

    console.log(`listening on port ${PORT}`);
}

runServer();
