'use strict';
let uniID = require('uni-id')

exports.main = async (event, context) => {
  uniID = uniID.createInstance({
    context
  })
  //event为客户端上传的参数
  console.log('event : ' + event)

  let params = event.params
  let res = {}

  let payload = {}

  switch (event.action) {
    case 'register':
      res = await uniID.register(event.params);
      break;
    case 'login':
      res = await uniID.login({
        ...event.params,
        // 不指定queryField的情况下只会查询username
        queryField: ['username', 'email', 'mobile']
      });
      break;
    case 'logout':
      res = await uniID.logout(event.uniIdToken);
      break;
    case 'loginByWeixin':
      res = await uniID.loginByWeixin(params.code);
      break;
    case 'loginByAlipay':
      res = await uniID.loginByAlipay(params.code);
      break;
    default:
      res = {
        code: 403,
        msg: '非法访问'
      }
      break;
  }

  //返回数据给客户端
  return res
};
