const app = require('../app');
const request = require('supertest');
const models = require('../models');
const should = require('should');
const { User: UserModel, Article: ArticleModel, Follow: FollowModel } = require('../models');

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

// describe('POST /user/login은', () => {
//     const users = [{name: 'alice'}, {name: 'bek'}, {name: 'chris'}] // bulkCreate 에 들어갈 자료들
//     before(()=>models.sequelize.sync({force:true})) // 데이터 베이스 sync해서 테이블을 만든다.
//     // bulkCreate  샘플 데이터를 넣어준다.
//     before(() => models.User.bulkCreate(users))
//     describe('성공 시', () => {
//         it('유저 객체를 담은 배열로 응답한다', (done) => {
//             request(app)
//             .post('/user/login').send({
//                 userInfo : {
//                     userId: 'kimcoding',
//                     password: 'helloWorld',
//                 }
//             })
//             .expect(400, { name: "alice" }) // 4번
//             // .expect(res => {
//             //     console.log(res.status) // 200
//             //     console.log(res.body) // { name: "alice" }
//             // })
//             .end(done())
//         })
//         // it('최대 limit 갯수만큼 응답한다', (done) => {
//         //     request(app)
//         //     .get('/users?limit=2')
//         //     .end((err,res) => {
//         //         res.body.should.have.lengthOf(2)
//         //         done()
//         //     })
//         // })
//     })
//     // describe('실패 시', () => { // 성공할 경우의 테스트수트
//     //     it('limit이 숫자형이 아니면 400을 응답한다 ', (done) => {
//     //         request(app)
//     //         // db에 직접 접속하기 전에 테스트가 통과될 수 있다.
//     //         .get('/users?limit=two')
//     //         .expect(400)
//     //         .end(done)
//     //     })
//     // })
// } )

// describe('GET /users/:id는', () => {
//     const users = [{name: 'alice'}, {name: 'bek'}, {name: 'chris'}] // bulkCreate 에 들어갈 자료들
//     before(()=>models.sequelize.sync({force:true})) // 데이터 베이스 sync해서 테이블을 만든다.
//     // bulkCreate  샘플 데이터를 넣어준다.
//     before(() => models.User.bulkCreate(users))
//     describe('성공 시', () => {
//         it('id가 1인 유저의 객체를 반환한다', (done) => {
//             request(app)
//             .get('/users/1')
//             .end((err, res) => {
//                 res.body.should.have.property('id', 1)
//                 done()
//             })
//         })
//     })
//     describe('실패 시', () => {
//         it('id가 숫자가 아닐 경우 400을 응답한다', (done) => {
//             request(app)
//             .get('/users/one')
//             .expect(400)
//             .end(done)
//         })
//         it('id로 유저를 찾을 수 없을 경우 404로 응답한다', (done) => {
//             request(app)
//             .get('/users/999')
//             .expect(404)
//             .end(done)
//         })
//     })
// })

// describe(' DELETE /users/1는', () => {
//     const users = [{name: 'alice'}, {name: 'bek'}, {name: 'chris'}] // bulkCreate 에 들어갈 자료들
//     before(()=>models.sequelize.sync({force:true})) // 데이터 베이스 sync해서 테이블을 만든다.
//     // bulkCreate  샘플 데이터를 넣어준다.
//     before(() => models.User.bulkCreate(users))
//     describe('성공 시', ()=> {
//         it('204를 응답한다', (done) => {
//             request(app)
//             .delete('/users/1')
//             .expect(204)
//             .end(done)
//         })
//     })
//     describe('실패 시', () => {
//         it('id가 숫자가 아닐 경우 400으로 응답한다.', (done) => {
//             request(app)
//             .delete('/users/one')
//             .expect(400)
//             .end(done)
//         })
//     })
// })

// describe('POST /users', () => {
//     const users = [{name: 'alice'}, {name: 'bek'}, {name: 'chris'}] // bulkCreate 에 들어갈 자료들
//     before(()=>models.sequelize.sync({force:true})) // 데이터 베이스 sync해서 테이블을 만든다.
//     // bulkCreate  샘플 데이터를 넣어준다.
//     before(() => models.User.bulkCreate(users))
//     describe('성공 시', () => {
//         let name = 'daniel',
//         body;
//         before((done) => {
//             request(app)
//             .post('/users')
//             .send({name})
//             .expect(201)
//             .end((err, res) => {
//                 body = res.body;
//                 done()
//             })
//         })
//         it('생성된 유저 객체를 반환한다', () => {
//             body.should.have.property('id')
//         })
//         it('입력한 name을 반환한다.', () => {
//             body.should.have.property('name', name)
//         })
//     })
//     describe('실패 시', () => {
//         it('name 파라미터 누락 시 400을 반환한다', (done) => {
//             request(app)
//             .post('/users')
//             .send({})
//             .expect(400)
//             .end(done)
//         })
//         it('name이 중복일 경우 409를 반환한다.', (done) => {
//             request(app)
//             .post('/users')
//             .send({name: 'daniel'})
//             .expect(409)
//             .end(done)
//         })
//     })
// })

// describe('PUT /users/:id', () => {
//     const users = [{name: 'alice'}, {name: 'bek'}, {name: 'chris'}] // bulkCreate 에 들어갈 자료들
//     before(()=>models.sequelize.sync({force:true})) // 데이터 베이스 sync해서 테이블을 만든다.
//     // bulkCreate  샘플 데이터를 넣어준다.
//     before(() => models.User.bulkCreate(users))
//     describe('성공 시', ()=> {
//         it('변경된 name을 응답한다.', (done) => {
//             const name = 'sangkwon'
//             request(app)
//             .put('/users/2')
//             .send({name})
//             .end((err, res) => {
//                 res.body.should.have.property('name', name)
//                 done()
//             })
//         })
//     })
//     describe('실패 시', () => {
//         it('정수가 아닌 id일 경우 400 응답', (done) => {
//             request(app)
//             .put('/users/one')
//             .expect(400)
//             .end(done)
//         })
//         it('name이 없을 경우 400 응답', (done) => {
//             request(app)
//             .put('/users/1')
//             .send({})
//             .expect(400)
//             .end(done)
//         })
//         it('없는 유저일 경우 404를 응답', (done) => {
//             request(app)
//             .put('/users/999')
//             .send({name: 'foo'})
//             .expect(404)
//             .end(done)
//         })
//         it('이름이 중복일 경우 409를 응답', (done) => {
//             request(app)
//             .put('/users/3')
//             .send({name: 'sangkwon'})
//             .expect(409)
//             .end(done)
//         })
//     })
// })
