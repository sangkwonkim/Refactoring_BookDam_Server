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
  describe('성공 시', () => {
    const user = {
      id: 1,
      userId: 'guest'
    };
    const accessToken = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '1d' });
    it('응답 상태 코드는 200을 반환한다.', (done) => {
      request(app)
        .post('/user/logout')
        .set('Cookie', `jwt=${accessToken}`)
        .expect(200, done);
    });
    it('성공 메세지를 반환한다.', (done) => {
      request(app)
      .post('/user/logout')
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

describe('POST /user/signup', () => {
  before(() => models.sequelize.sync({ force: true }));
  before(() => UserModel.queryInterface.bulkInsert('Users', [{
    id : 2,
    userId: 'Bookdam',
    password: '$2b$10$RJq0gXxBHhLsRhMtI8U3p./kk.KPvdohoMx179N3HvbUaDpPbMi1.',
    userNickName: 'Bookdam',
    userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png',
    createdAt: new Date(),
    updatedAt: new Date()
  }]));
  describe('성공 시', () => {
    it('응답 상태 코드는 201을 반환한다.', (done) => {
      request(app)
        .post('/user/signup')
        .send({ userInfo : {
          userId: 'guest',
          password: '1234',
          userNickName: 'guest',
        }})
        .expect(201, done);
    });
    it('성공 메세지와 유저의 정보를 반환한다.', (done) => {
      request(app)
      .post('/user/signup')
      .send({ userInfo : {
        userId: 'sangkwon',
        password: '1234',
        userNickName: 'sangkwon',
      }})
      .end((err, res) => {
        res.body.should.have.property('message', 'success');
        res.body.should.have.property('userInfo');
        res.body.userInfo.should.have.property('userId');
        res.body.userInfo.should.have.property('userNickName');
        res.body.userInfo.should.have.property('userImage');
        done()
      })
    });
  });
  describe('실패 시', () => {
      let body;
      it('회원정보가 부족하면 400을 리턴한다.', (done) => {
        request(app)
        .post('/user/signup')
        .send({ userInfo : {
          userId: 'David',
          userNickName: 'Daniel',
        }})
        .expect(400, done);
      });
      it('중복된 아이디일 경우 400을 리턴한다.', (done) => {
        request(app)
          .post('/user/signup')
          .send({ userInfo : {
            userId: 'sangkwon',
            password: '1234',
            userNickName: 'sangkwon',
          }})
          .expect(400, done)
      })
  });
});

describe('DELETE /user/:id', () => {
  before(() => models.sequelize.sync({ force: true }));
  before(() => UserModel.queryInterface.bulkInsert('Users', [{
    id : 1,
    userId: 'guest',
    password: '$2b$10$RJq0gXxBHhLsRhMtI8U3p./kk.KPvdohoMx179N3HvbUaDpPbMi1.',
    userNickName: 'guest',
    userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png',
    createdAt: new Date(),
    updatedAt: new Date()
  }, {
    id : 2,
    userId: 'sangkwon',
    password: '$2b$10$RJq0gXxBHhLsRhMtI8U3p./kk.KPvdohoMx179N3HvbUaDpPbMi1.',
    userNickName: 'sangkwon',
    userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png',
    createdAt: new Date(),
    updatedAt: new Date()
  }]));
  describe('성공 시', () => {
    it('응답 상태 코드는 200을 반환한다.', (done) => {
      const user = {
        id: 1,
        userId: 'guest'
      };
      const accessToken = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '1d' });
      request(app)
        .delete('/user/1')
        .set('Cookie', `jwt=${accessToken}`)
        .expect(200, done)
    });
    it('응답 메세지를 반환한다.', (done) => {
      const user = {
        id: 2,
        userId: 'sangkwon'
      };
      const accessToken = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '1d' });
      request(app)
        .delete('/user/2')
        .set('Cookie', `jwt=${accessToken}`)
        .end((err, res) => {
          res.body.should.have.property('message', '유저가 탈퇴되었습니다.');
          done()
        })
    });
  });
  describe('실패 시', () => {
    before(() => UserModel.queryInterface.bulkInsert('Users', [{
      id : 1,
      userId: 'guest',
      password: '$2b$10$RJq0gXxBHhLsRhMtI8U3p./kk.KPvdohoMx179N3HvbUaDpPbMi1.',
      userNickName: 'guest',
      userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      id : 2,
      userId: 'sangkwon',
      password: '$2b$10$RJq0gXxBHhLsRhMtI8U3p./kk.KPvdohoMx179N3HvbUaDpPbMi1.',
      userNickName: 'sangkwon',
      userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png',
      createdAt: new Date(),
      updatedAt: new Date()
    }]));
    it('정수가 아닌 id를 입력할 경우 400을 반환한다.', (done) => {
      request(app)
        .delete('/user/one')
        .expect(400, done)
    });
    it('요청에 쿠키가 없을 경우 401을 반환한다.', (done) => {
      request(app)
        .delete('/user/1')
        .expect(401, done)
    });
    it('입력된 id와 쿠키의 id가 다를 경우 403을 반환한다.', (done) => {
      const user = {
        id: 1,
        userId: 'guest'
      };
      const accessToken = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '1d' });
      request(app)
        .delete('/user/3')
        .set('Cookie', `jwt=${accessToken}`)
        .expect(403)
        .end((err, res) => {
          res.body.should.have.property('message', '본인만 탈퇴를 요청할 수 있습니다.');
          done()
        })
    });
  });
});