const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const router = require('./router/index');
const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));
// app.use(
//   cors({
//     origin: [
//       'http://localhost:3000',
//       'https://bookdam.link',
//       'https://www.bookdam.link'
//     ],
//     credentials: true,
//     methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
//     maxAge: 3600
//   })
// );

app.use(helmet());
app.use('/', router);

app.listen(port, () => {
  console.log('북담 서버가 연결되었습니다.');
});
