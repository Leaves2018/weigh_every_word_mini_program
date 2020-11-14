// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 引入mysql操作模块
const mysql = require('mysql2/promise')

// mysql云函数入口函数
exports.main = async (event, context) => {
  console.log('mysql云函数调用开始');
  // 可以认为每一次调用都必须连接数据库，则一开始就先连接
  try {
    const conn = await mysql.createConnection({
      host: "rm-bp1z1q66g7pyyc32klo.mysql.rds.aliyuncs.com",
      database: "reserve_my_time",
      user: "wechat_mp",
      password: "ljC07GkR2s0)0nY!t(hyFO8Lwk46e_Dz"
    });
    // 注入event对象，供后续处理函数调用
    event['conn'] = conn;
  } catch (err) {
    // 连接失败，直接返回
    // await conn.end(); // 是否需要关闭？
    console.error(err)
    return { err: "mysql云函数调用失败：MySQL数据库连接失败" }
  }

  switch (event.action) {
    case 'execute': {
      return execute(event)
    }
    case 'addUser': {
      return addUser(event)
    }
    case 'updateUser': {
      return updateUser(event)
    }
    case 'addEventAndReservationForm': {
      return addEventAndReservationForm(event)
    }
    case 'addReservationRecord': {
      return addReservationRecord(event)
    }
    case 'getMyEvents': {
      return getMyEvents(event)
    }
    case 'updateNotificationSwitch': {
      return updateNotificationSwitch(event)
    }
    case 'getReservationForm': {
      return getReservationForm(event)
    }
    case 'getEvent': {
      return getEvent(event)
    }
    case 'setSignIn': {
      return setsignin(event)
    }
    case 'getReserveeSchedule': {
      return getReserveeSchedule(event)
    }
    case 'getUserSchedule': {
      return getUserSchedule(event)
    }
    case 'getDoneSchedule': {
      return getDoneSchedule(event)
    }
    case 'getUser': {
      return getUser(event)
    }
    case 'selectReserveeFromAgreeUnionTodo': {
      return selectReserveeFromAgreeUnionTodo(event)
    }
    case 'selectReserveeFromAgreeUnionDone': {
      return selectReserveeFromAgreeUnionDone(event)
    }
    default: {
      // 没有匹配的记录，直接关闭连接并返回
      await conn.end();
      console.warn("mysql云函数调用失败：指定的action参数没有对应的处理函数");
      return { err: "mysql云函数调用失败：指定的action参数没有对应的处理函数" };
    }
  }
};

// 直接执行给定的SQL语句（等于作转发处理）：仅用于开发测试使用，上线前应全部换成封装函数PreparedStatement形式（避免SQL注入攻击）
async function execute(event) {
  const { conn, sql } = event;
  let results = [];
  try {
    if (!Array.isArray(sql)) {
      sql = [sql];
    }
    for (let i = 0, len = sql.length; i < len; i++) {
      const executeResult = await conn.execute(sql[i]);
      console.log(executeResult);
      results.push(executeResult);
    }
    await conn.end();
    return { data: results };
  } catch (err) {
    console.error(err);
    await conn.end();
    return { err: `执行'${sql}'失败` }
  }
}

// 添加用户时仅添加openid、credit、nickname三项属性（预约所必须）
// wechatid和email字段仅用于被预约时，填写消息设置表单后通过updateUser方法更新
async function addUser(event) {
  const { OPENID } = cloud.getWXContext();  // 获取用户openid
  var { conn, userData } = event;
  try {
    // 将给定data按顺序插入（Object.keys和Object.values的遍历顺序是一样的吗？）
    let keys = ["openid", "credit", "nickname", "avatarUrl"]; // 指定插入列
    let values = keys.map(x => conn.escape(userData[x])); // 取对应值并进行转义
    let updateClauseArray = [];
    for (let i = 1, len = keys.length; i < len; i++) {  // 跳过openid
      updateClauseArray.push(`${keys[i]}=VALUES(${keys[i]})`);
    }
    var sql = `INSERT INTO user (${keys.join(",")}) VALUES(${values.join(",")}) ON DUPLICATE KEY UPDATE ${updateClauseArray.join(',')};`; // 有重复主键时更新其他数据
    console.log(sql);
    const res = await conn.execute(sql);
    await conn.end(); // 关闭连接（需要等待吗？）
    return { res, sql };
  } catch (err) {
    console.error(err);
    await conn.end();
    return { err, sql }
  }
}

// 更新用户账户信息
async function updateUser(event) {
  const { OPENID } = cloud.getWXContext();  // 获取用户openid
  const { conn, userData } = event;
  try {
    const userTableColumnNames = ['nickname', 'email', 'rules', 'searchMe', 'emailSwitch'];
    let keys = Object.keys(userData).filter(x => userTableColumnNames.indexOf(x) >= 0);  // 只有指定的数据可以被更新
    let values = keys.map(x => conn.escape(userData[x])); // 获取需要更新的值，并转义
    // 组装SQL的SET子句
    let setClauseArray = [];
    for (let i = 0, len = keys.length; i < len; i++) {
      setClauseArray.push(`${keys[i]}=${values[i]}`)
    }
    // 完整拼装SQL语句
    var sql = `UPDATE user SET ${setClauseArray.join(',')} WHERE openid=${conn.escape(OPENID)}`;
    console.log(sql);
    const res = await conn.execute(sql);
    await conn.end();
    return { res, sql };
  } catch (err) {
    console.error(err);
    await conn.end();
    return { err, sql }
  }
}

async function addText(event) {
  const { OPENID } = cloud.getWXContext();  // 获取用户openid
  const { conn, title, body } = event;
  try {
    var sql = `INSERT INTO text (_openid, title, body) VALUES(${conn.escape(OPENID)}, ${conn.escape(title)}, ${conn.escape(body)});`;
    console.log('In addText(): ' + sql);
    var result = await conn.execute(sql);
    conn.end();
    return { data: result, sql };
  } catch (err) {
    console.error('添加文本失败')
    var result = err;
    conn.end();
    return { err, sql };
  }
}

async function searchCorpusByWord(event) {
  const { OPENID } = cloud.getWXContext();  // 获取用户openid
  const { conn, word } = event;
  try {
    var sql = `SELECT * FROM text WHERE _openid=${conn.escape(OPENID)} AND ${conn.escape(word)} IN body`;
    console.log('In searchCorpusByWord(): ' + sql);
    var result = await conn.execute(sql);
    conn.end();
    return { data: result, sql };
  } catch (err) {
    console.error('查询语料库失败')
    var result = err;
    conn.end();
    return { err, sql };
  }
}