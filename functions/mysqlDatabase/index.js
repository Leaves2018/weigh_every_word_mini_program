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
      database: "weigh_every_word",
      // user: "wechat_mp",
      // password: "ljC07GkR2s0)0nY!t(hyFO8Lwk46e_Dz"
      user: "ryan",
      password: "Leaves9091"
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
    // 添加用户信息，如登记用户学号、邮箱和OPENID
    case 'addUser': {
      return addUser(event)
    }
    // 向数据库插入文本
    case 'addText': {
      return addText(event)
    }
    // 查询语料库
    case 'searchCorpusByWord': {
      return searchCorpusByWord(event)
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

async function addText(event) {
  // 获取用户OPENID
  const { OPENID } = cloud.getWXContext();
  var { conn, textData} = event;
  try {
    var sql = `INSERT INTO text (_openid, title, body) VALUES(${conn.escape(OPENID)}, ${conn.escape(textData.title)}, ${conn.escape(textData.body)});`;
    console.log("In addText(): " + sql);
    var result = await conn.execute(sql);
    conn.end();
    return {data: result, sql};
  } catch (err) {
    console.error("添加文本记录失败")
    var result = err;
    conn.end();
    return {err, sql};
  }
}

async function searchCorpusByWord(event) {
  const {OPENID} = cloud.getWXContext();
  var { conn, word } = event;
  try {
    var sql = `SELECT * FROM text WHERE _openid=${conn.escape(OPENID)} and ${conn.escape(word)} IN body;`
    console.log("In searchCorpusByWord(): " + sql);
    var result = await conn.execute(sql);
    conn.end();
    return {data: result, sql};
  } catch (err) {
    console.error("查询语料库失败")
    var result = err;
    conn.end();
    return {err, sql};
  }
}