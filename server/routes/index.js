const fs = require('fs');
const path = require('path');
const router = require('koa-router')();
const statics = require('koa-static');
const { staticDirPath } = require('../config');
const register = require('../controllers/register');
const login = require('../controllers/login');
const githubOAuth = require('../controllers/githubOAuth');

const apiRoutes = router
  .post('/register', register)
  .post('/login', login) 
  .post('/github_oauth', githubOAuth);


router
  .use(
    '/api/v1',
    apiRoutes.routes(),
    apiRoutes.allowedMethods()
  )
  .get('*.*', statics(staticDirPath))
  .get('/*', (ctx, next) => {
    ctx.type = 'html';
    ctx.body = fs.createReadStream(path.join(staticDirPath, '/index.html'));
    next();
  });

module.exports = router;
