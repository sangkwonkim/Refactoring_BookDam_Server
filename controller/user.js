const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
// const saltRounds = 10;
const { User: UserModel, Article: ArticleModel, Follow: FollowModel } = require('../models');
const { isAuthorized } = require('./tokenFunctions/index');

module.exports = {
  login: async (req, res) => {
    try {
      const userId = req.body.userInfo.userId;
      const password = req.body.userInfo.password;
      if (!userId || !password) throw '유저의 정보를 정확하게 입력해주세요.';
      const userData = await UserModel.findOne({
        where: {
          userId: userId
        },
        attributes: { exclude: ['updatedAt', 'createdAt'] }
      });
      if (!userData) throw '회원가입한 유저가 아닙니다.';
      const userPassword = userData.password;
      const user = {
        id: userData.id,
        userId: userData.userId
      };
      const same = bcrypt.compareSync(password, userPassword);
      if (!same) {
        throw '비밀번호가 틀렸습니다.';
      }
      delete userData.dataValues.password;
      const accessToken = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '1d' });
      res.cookie('jwt', accessToken, {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'strict',
        domain: '.bookdam.link',
        httpOnly: true,
        secure: true
      }).status(200).json({ message: 'success', userInfo: userData });
    } catch (error) {
      if (error === '회원가입한 유저가 아닙니다.' || error === '비밀번호가 틀렸습니다.' || error === '유저의 정보를 정확하게 입력해주세요.') {
        return res.status(400).json({ message: error });
      } else {
        return res.status(500).json({ message: '로그인에 실패했습니다.' });
      }
    }
  },
  logout: async (req, res) => {
    try {
      const cookie = req.cookies.jwt;
      if (!cookie) throw '로그인 유저가 아닙니다.';
      const decodedData = isAuthorized(cookie);
      const findUser = await UserModel.findOne({
        where: { id: decodedData.id, userId: decodedData.userId }
      });
      if (!findUser) throw error;
      // 쿠키 상으로 로그인은 되어있지만, db에서 유저의 정보가 없을 때의 처리
      // null일 경우 catch가 아닌 다음 코드로 진행되는 에러가 발생함 => 서버 에러

      res.clearCookie('jwt').status(200).json({ message: '로그아웃 되었습니다.' });
    } catch (error) {
      if (error.name === 'TokenExpiredError' || error === '로그인 유저가 아닙니다.') return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
      else {
        return res.status(500).json({ message: '로그아웃에 실패했습니다.' });
      }
    }
  },
  signup: async (req, res) => {
    try {
      const userInfo = req.body.userInfo;
      const userId = userInfo.userId;
      const userNickName = userInfo.userNickName;
      const password = userInfo.password;
      if (!userId || !password || !userNickName) throw '회원가입 정보를 정확하게 입력해주세요.';
      const encryptedPassowrd = bcrypt.hashSync(password, 10);
      const duplication = await UserModel.findOrCreate({
        where: {
          userId: userId
        },
        defaults: {
          userId: userId,
          userNickName: userNickName,
          password: encryptedPassowrd,
          userImage: 'https://img.icons8.com/flat-round/512/000000/bird--v1.png'
        }
      });
      if (!duplication[1]) throw '중복된 아이디입니다.';
      const userDate = duplication[0];
      delete userDate.dataValues.password;
      delete userDate.dataValues.createdAt;
      delete userDate.dataValues.updatedAt;
      const followBookdam = await FollowModel.create({ // 북담계정 만들어서 회원가입 시 북담계정 follow 하는 기능
        user_Id: userDate.dataValues.id,
        follow_Id: 2
      });
      res.status(201).json({ message: 'success', userInfo: userDate });
    } catch (error) {
      if (error === '회원가입 정보를 정확하게 입력해주세요.' || error === '중복된 아이디입니다.') {
        return res.status(400).json({ message: error });
      } else {
        return res.status(500).json({ message: '회원가입에 실패했습니다.' });
      }
    }
  },
  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.user_Id, 10);
      if (Number.isNaN(id)) throw '요청이 잘 못 되었습니다.';
      const cookie = req.cookies.jwt;
      if (!cookie) throw '로그인 유저가 아닙니다.';
      const decodedData = isAuthorized(cookie);
      if (id !== decodedData.id) throw '본인만 탈퇴를 요청할 수 있습니다.';
      const findUser = await UserModel.findOne({
        where: { id: decodedData.id, userId: decodedData.userId }
      });
      if (!findUser) throw error;
      const deleteArticle = await ArticleModel.destroy({ where: { user_id: id } });
      const deleteFollow = await FollowModel.destroy({ where: { [Op.or]: [{ user_Id: id }, { follow_Id: id }] } });
      const deleteUser = await UserModel.destroy({ where: { id: id } });
      res.clearCookie('jwt').status(200).json({ message: '유저가 탈퇴되었습니다.' });
    } catch (error) {
      if (error === '요청이 잘 못 되었습니다.') return res.status(400).json({ message: error });
      else if (error.name === 'TokenExpiredError' || error === '로그인 유저가 아닙니다.') return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
      else if (error === '본인만 탈퇴를 요청할 수 있습니다.') return res.status(403).json({ message: '본인만 탈퇴를 요청할 수 있습니다.' });
      else {
        return res.status(500).json({ message: '회원탈퇴에 실패했습니다.' });
      }
    }
  },
  get: async (req, res) => {
    try {
      const id = parseInt(req.params.user_Id, 10);
      const page = parseInt(req.query.page, 10);
      if (Number.isNaN(id)) throw '요청이 잘 못 되었습니다.';
      if (Number.isNaN(page)) throw '요청이 잘 못 되었습니다.';

      const cookie = req.cookies.jwt;
      if (!cookie) return res.status(401).json({ message: '로그인 유저가 아닙니다.' });

      const decodedData = isAuthorized(cookie);
      
      const findUser = await UserModel.findOne({
        where: { id: id }
      });
      if (!findUser) return res.status(401).json({ message: 'failure' });

      const isfollow = await FollowModel.findAndCountAll({ where: { user_Id: decodedData.id, follow_Id: id } });
      const findFollowing = await FollowModel.findAndCountAll({ where: { user_Id: id } });
      const findFollower = await FollowModel.findAndCountAll({ where: { follow_Id: id } });

    } catch (error) {
      if (error === '요청이 잘 못 되었습니다.') return res.status(400).json({ message: error });
      else if (error.name === 'TokenExpiredError' || error === '로그인 유저가 아닙니다.') return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
      else if (error === '본인만 탈퇴를 요청할 수 있습니다.') return res.status(403).json({ message: '본인만 탈퇴를 요청할 수 있습니다.' });
      else {
        return res.status(500).json({ message: '회원탈퇴에 실패했습니다.' });
      }
    }

    if (Number.isNaN(findFollowing) || Number.isNaN(findFollower)) return res.status(400).json({ message: 'failure' });
    const follow = { following: findFollowing.count, follower: findFollower.count };
    const findArtilces = await ArticleModel.findAndCountAll({
      attributes: { exclude: ['updatedAt'] },
      order: [['id', 'DESC']],
      raw: true,
      limit: 8,
      offset: page * 8,
      include: [{
        model: UserModel,
        attributes: { exclude: ['id', 'updatedAt', 'createdAt', 'password'] },
        where: { id: id }
      }]
    });
    if (Number.isNaN(findArtilces.count)) return res.status(400).json({ message: 'failure' });
    // res.location('/') mypage or userpage/:username 이 들어가는데... 구분하는 방법에 대해서 고민해보기

    if (id === decodedData.id) {
      res.status(200).json({ message: 'success', userInfo: findUser, follow, articleData: findArtilces });
    } else {
      res.status(200).json({ message: 'success', userInfo: findUser, follow, articleData: findArtilces, isfollow: isfollow.count });
    }
  },
  patch: (req, res) => { // test done
    const id = parseInt(req.params.user_Id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: 'failure' });
    const cookie = req.cookies.jwt;
    if (!cookie) return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
    let decodedData;
    jwt.verify(cookie, process.env.ACCESS_SECRET, function (error, decoded) {
      if (error) return res.status(401).json({ message: '토큰 만료로 로그인이 필요합니다.' });
      else {
        decodedData = decoded;
      }
    });
    if (id !== decodedData.id) return res.status(401).json({ message: 'failure' });
    const userInfo = req.body.userInfo;
    if (!userInfo) return res.status(400).json({ message: 'failure' });
    // if (userInfo.password) {
    //   bcrypt.genSalt(saltRounds, function (err, salt) {
    //     if (err) return res.status(400).json({ message: 'GenSalt error', error: err });
    //     bcrypt.hash(userInfo.password, salt, function (err, hash) {
    //       if (err) return res.status(400).json({ message: 'Password hash error', error: err });
    //       userInfo.password = hash;
    //       UserModel.update(
    //         userInfo, { where: { id: id } })
    //         .then(() => {
    //           UserModel.findOne({
    //             attributes: { exclude: ['updatedAt', 'createdAt', 'password'] },
    //             where: { id: id }
    //           })
    //             .then((result) => {
    //               res.status(201).json({ message: 'success', userInfo: result });
    //             })
    //             .catch((error) => {
    //               res.status(400).json({ message: 'failure', error: error });
    //             });
    //         })
    //         .catch((error) => {
    //           res.status(400).json({ message: 'failure', error: error });
    //         });
    //     });
    //   });
    // } else {
    //   UserModel.update(
    //     userInfo, { where: { id: id } })
    //     .then(() => {
    //       UserModel.findOne({
    //         attributes: { exclude: ['updatedAt', 'createdAt', 'password'] },
    //         where: { id: id }
    //       })
    //         .then((result) => {
    //           res.status(201).json({ message: 'success', userInfo: result });
    //         })
    //         .catch((error) => {
    //           res.status(400).json({ message: 'failure', error: error });
    //         });
    //     })
    //     .catch((error) => {
    //       res.status(400).json({ message: 'failure', error: error });
    //     });
    // }
    // bcrypt 동기적, 비동기적인 처리 차이를 실제로 보고 처리를 해볼 예정입니다.
    if (userInfo.password) userInfo.password = bcrypt.hashSync(userInfo.password, 10);
    UserModel.update(
      userInfo, { where: { id: id } })
      .then(() => {
        UserModel.findOne({
          attributes: { exclude: ['updatedAt', 'createdAt', 'password'] },
          where: { id: id }
        })
          .then((result) => {
            // res.location('/mypage')
            res.status(201).json({ message: 'success', userInfo: result });
          })
          .catch((error) => {
            res.status(400).json({ message: 'failure', error: error });
          });
      })
      .catch((error) => {
        res.status(400).json({ message: 'failure', error: error });
      });
  },
  search: async (req, res) => { // test done
    const name = req.query.name;
    if (!name) return res.status(400).json({ message: 'failure' });
    const cookie = req.cookies.jwt;
    if (!cookie) return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
    jwt.verify(cookie, process.env.ACCESS_SECRET, function (error, decoded) {
      if (error) return res.status(401).json({ message: '토큰 만료로 로그인이 필요합니다.' });
    });
    const searchInfo = await UserModel.findAll({
      attributes: { exclude: ['updatedAt', 'createdAt', 'password'] },
      where: {
        [Op.or]: [
          { userId: { [Op.like]: `%${name}%` } },
          { userNickName: { [Op.like]: `%${name}%` } }
        ]
      }
    });
    if (!searchInfo) return res.status(404).json({ message: '정확한 유저의 정보를 입력해주세요.' });
    res.status(200).json({ message: 'success', searchInfo: searchInfo });
  },
  validation: async (req, res) => {
    const id = parseInt(req.params.user_Id, 10);
    const password = req.body.userInfo.password;
    if (!password) return res.status(400).json({ message: 'failure' });
    if (Number.isNaN(id)) return res.status(400).json({ message: 'failure' });
    const cookie = req.cookies.jwt;
    if (!cookie) return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
    let decodedData;
    jwt.verify(cookie, process.env.ACCESS_SECRET, function (error, decoded) {
      if (error) return res.status(401).json({ message: '토큰 만료로 로그인이 필요합니다.' });
      else {
        decodedData = decoded;
      }
    });
    const findUser = await UserModel.findOne({
      where: { id: decodedData.id, userId: decodedData.userId }
    });
    if (!findUser) return res.status(401).json({ message: 'failure' });
    const userPassword = findUser.password;
    const same = bcrypt.compareSync(password, userPassword);
    if (!same) {
      return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
    }
    res.status(200).json({ message: '비밀번호가 맞습니다.' });
  }
};
