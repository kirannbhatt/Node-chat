### Technology Used

Front-End : React+Redux+React-router+axios+scss；
Back-end: node(koa2)+mysql+JWT(Json web token);
use socket.io to send messages with each other.

### Development

1. clone project code

```
git clone git@github.com:kirannbhatt/Node-chat.git
```

2.  create an empty file that names 'secret.js' in the root directory of this project.

```
module.exports = {
  client_secret: '', // client_secret of github authorization:  github-> settings ->  Developer settings to get
  db: {
    host: '',
    port: ,
    database: '',
    user: '',
    password: '',
  },
  secretValue: '', // secret of json web token
};
```

3. download npm module for front end

```
cd Node-chat
```

```
npm install
```

4. download npm module for the back end

```
cd cd Node-chat/server
```

```
npm install
```

5. init DB

```
DB configuration follows 'react-chat/server/config.js'

npm run init_sql
```

6. run front end and back end code

```
npm run start
```

```
cd ..
```

```
npm run start
```

Testing github
