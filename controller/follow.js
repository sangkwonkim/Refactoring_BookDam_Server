const { Follow: FollowModel } = require('../models');
const jwt = require('jsonwebtoken');
const { isAuthorized } = require('./tokenFunctions/index');

module.exports = {
  post: async (req, res) => {
    try {
      const id = parseInt(req.params.user_Id, 10);
      const follow_Id = parseInt(req.query.follow_Id, 10);
      if (Number.isNaN(id)) throw '요청이 잘 못 되었습니다.';
      if (Number.isNaN(follow_Id)) throw '요청이 잘 못 되었습니다.';
      if (id === follow_Id) throw '본인을 팔로우할 수 없습니다.';
      const cookie = req.cookies.jwt;
      if (!cookie) throw '로그인 유저가 아닙니다.';
      const decodedData = isAuthorized(cookie);
      if (id !== decodedData.id) throw '본인만 팔로우를 요청할 수 있습니다.';
      const followUser = await FollowModel.findOrCreate({
        where: {
          user_Id: id,
          follow_Id: follow_Id
        },
        defaults: {
          user_Id: id,
          follow_Id: follow_Id
        }
      });
      if (followUser[1]) {
        return res.status(200).json({ message: 'success' });
      } else {
        throw '이미 팔로우되어 있는 유저입니다.';
      }
    } catch (error) {
      if (error === '요청이 잘 못 되었습니다.' || error === '본인을 팔로우할 수 없습니다.' || error === '이미 팔로우되어 있는 유저입니다.') return res.status(400).json({ message: error });
      else if (error.name === 'TokenExpiredError' || error === '로그인 유저가 아닙니다.') return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
      else if (error === '본인만 팔로우를 요청할 수 있습니다.') return res.status(403).json({ message: '본인만 팔로우를 요청할 수 있습니다.' });
      else {
        return res.status(500).json({ message: '유저 팔로우에 실패했습니다.' });
      }
    }
  },
  delete: async (req, res) => {
    try {
      const id = parseInt(req.params.user_Id, 10);
      const follow_Id = parseInt(req.query.follow_Id, 10);
      if (Number.isNaN(id)) throw '요청이 잘 못 되었습니다.';
      if (Number.isNaN(follow_Id)) throw '요청이 잘 못 되었습니다.';
      if (id === follow_Id) throw '본인 팔로우를 취소할 수 없습니다.';
      const cookie = req.cookies.jwt;
      if (!cookie) throw '로그인 유저가 아닙니다.';
      const decodedData = isAuthorized(cookie);
      if (id !== decodedData.id) throw '본인만 팔로우를 취소할 수 있습니다.';
      const unfollowUser = await FollowModel.destroy({
        where: {
          user_Id: id,
          follow_Id: follow_Id
        }
      });
      if (unfollowUser === 1) {
        return res.status(200).json({ message: 'success' });
      } else {
        throw '팔로우되어 있는 유저가 아닙니다.';
      }
    } catch (error) {
      if (error === '요청이 잘 못 되었습니다.' || error === '본인 팔로우를 취소할 수 없습니다.' || error === '팔로우되어 있는 유저가 아닙니다.') return res.status(400).json({ message: error });
      else if (error.name === 'TokenExpiredError' || error === '로그인 유저가 아닙니다.') return res.status(401).json({ message: '로그인 유저가 아닙니다.' });
      else if (error === '본인만 팔로우를 취소할 수 있습니다.') return res.status(403).json({ message: '본인만 팔로우를 취소할 수 있습니다.' });
      else {
        return res.status(500).json({ message: '유저 언팔로우에 실패했습니다.' });
      }
    }
  }
};
