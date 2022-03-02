const app = require('../app');
const request = require('supertest');
const models = require('../models');
const should = require('should');
const { User: UserModel, Article: ArticleModel, Follow: FollowModel } = require('../models');
const jwt = require('jsonwebtoken');

describe('POST /user/login', () => {
  before(() => models.sequelize.sync({ force: true }));
  before(() => UserModel.queryInterface.bulkInsert('Users', [{
    userId: 'guest',
    password: '$2b$10$RJq0gXxBHhLsRhMtI8U3p./kk.KPvdohoMx179N3HvbUaDpPbMi1.',
    userNickName: 'sangkwon',
    userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png',
    createdAt: new Date(),
    updatedAt: new Date()
  }]));
  describe('성공 시', () => {
    it('응답 상태 코드는 200을 반환한다.', (done) => {
      request(app)
        .post('/user/login')
        .send({ userInfo: { userId: 'guest', password: '1234' } })
        .expect(200, done);
    });
    it('성공 메세지를 반환한다.', (done) => {
      request(app)
        .post('/user/login')
        .send({ userInfo: { userId: 'guest', password: '1234' } })
        .end((err, res) => {
          res.body.should.have.property('message', 'success');
          res.body.should.have.property('userInfo');
          done();
        });
    });
    it('응답에 쿠키를 담아 전송합니다.', (done) => {
      request(app)
        .post('/user/login')
        .send({ userInfo: { userId: 'guest', password: '1234' } })
        .end((err, res) => {
          res.headers['set-cookie'][0].split(';')[0].split('=')[0].should.equal('jwt');
          done();
        });
    });
  });
  describe('실패 시', () => {
    it('회원가입을 하지 않은 유저일 경우 404를 전송한다.', (done) => {
      request(app)
        .post('/user/login')
        .send({ userInfo: { userId: 'sangkwon', password: '1234' } })
        .expect(404, done);
    });
    it('유저 정보가 정확하지 않을 경우 400을 리턴한다.', (done) => {
      request(app)
        .post('/user/login')
        .send({ userInfo: { userId: 'guest'} })
        .expect(400, done);
    });
  });
});

describe('POST /user/logout', () => {
  before(() => models.sequelize.sync({ force: true }));
  before(() => UserModel.queryInterface.bulkInsert('Users', [{
    userId: 'guest',
    password: '$2b$10$RJq0gXxBHhLsRhMtI8U3p./kk.KPvdohoMx179N3HvbUaDpPbMi1.',
    userNickName: 'sangkwon',
    userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png',
    createdAt: new Date(),
    updatedAt: new Date()
  }]));
  let result;
  describe('성공 시', () => {
    const user = {
      id: 1,
      userId: 'guest'
    };
    const accessToken = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '1d' });
    it('응답 상태 코드는 200을 반환한다.', (done) => {
      request(app)
        .post('/user/logout')
        // .withCredentials()
        .set('Cookie', `jwt=${accessToken}`)
        .expect(200, done);
    });
    it('성공 메세지를 반환한다.', (done) => {
      request(app)
      .post('/user/logout')
      // .withCredentials()
      .set('Cookie', `jwt=${accessToken}`)
        .end((err, res) => {
          res.body.should.have.property('message', '로그아웃 되었습니다.');
          done();
        });
    });
  });
  describe('실패 시', () => {
    it('회원가입을 하지 않은 유저일 경우 404를 전송한다.', (done) => {
      request(app)
        .post('/user/login')
        .send({ userInfo: { userId: 'sangkwon', password: '1234' } })
        .expect(404, done);
    });
    it('유저 정보가 정확하지 않을 경우 400을 리턴한다.', (done) => {
      request(app)
        .post('/user/login')
        .send({ userInfo: { userId: 'guest'} })
        .expect(400, done);
    });
  });
  describe('실패 시', () => {
    it('요청 쿠키에 jwt가 없을 경우에 401을 반환한다.', (done) => {
      request(app)
        .post('/user/logout')
        .expect(401, done);
    });
  });
});
