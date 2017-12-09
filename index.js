const serve = require('koa-static');
const cors = require('@koa/cors');
const Koa = require('koa');
const run = require('./hexo-gen');


async function runServer() {
    await run();

    const app = new Koa();

    app.use(cors());

    const PORT = 3000;

    // $ GET /package.json
    app.use(serve('./public',));

    await app.listen(PORT);

    console.log(`listening on port ${PORT}`);
}

runServer();
