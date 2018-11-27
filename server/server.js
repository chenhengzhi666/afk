const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const hostName = '192.168.1.103'; // 设置主机名
const port = 8080; // 设置端口号
const appid = 'wx1f9c767629fabde5'; //appid
const redirect_uri = 'http://192.168.1.103:5500/index.html';
const connection = mysql.createConnection({
    host: '114.115.234.194',
    user: 'root',
    password: '??8Hyq78q',
    port: '3306',
    database: 'lottery'
});
connection.connect();

let app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));

app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 保存用户信息
app.get('/saveUserInfo', (req, res) => {
    let userData = req.query.data;
    console.log(userData)
    let searchUserSql = `select * from user_info where openid = '${userData.openid}'`;
    connection.query(searchUserSql, (err, result) => {
        if (err) throw err;
        if (result.length == 0) {
            // user_info表中无此用户
            let addUserInfoSql = 'insert into user_info set ?';
            connection.query(addUserInfoSql, userData, (addErr, addResult) => {
                if (addErr) throw addErr;
                console.log('数据保存成功！');
                res.send({
                    flag: 1,
                    desc: 'success！'
                });
            });
        } else {
            // user_info表中存在该用户
            console.log('用户已存在！');
            res.send({
                flag: 0,
                desc: '用户已存在！'
            });
        }
    });
    // connection.end();
});

// 获取奖品数据信息
app.get('/getAwards', (req, res) => {
    let searchAwardsSql = 'select * from award_info';
    let flag;
    connection.query(searchAwardsSql, (err, result) => {
        if (err) throw err;
        flag = result.length > 0 ? 1 : 0;
        res.send({
            flag: flag,
            result: result
        });
    });
});

//查询用户历史中奖奖品
app.get('/getUserAward', (req, res) => {
    let searchUserPrizeInfoSql = `select nickname, award_name, creat_time from prize_info where openid = '${req.query.openid}' and is_get = '0'`;
    connection.query(searchUserPrizeInfoSql, (prizeErr, prizeAddResult) => {
        if (prizeErr) throw prizeErr;
        console.log(prizeAddResult);
        res.send({
            flag: 1,
            desc: 'success!',
            result: prizeAddResult
        });
    });
});

// 中奖数据入库
app.get('/prizeProcess', (req, res) => {
    console.log(req.query.data)
    req.query.data.is_get = '0';
    let prizeProcessSql = 'insert into prize_info set ?';
    let flag;
    connection.query(prizeProcessSql, req.query.data, (err, result) => {
        if (err) throw err;
        console.log(result)
        flag = result.length > 0 ? 1 : 0;
        res.send({
            flag: flag,
            result: result
        });
    });
});

// 访问微信获取获取用户信息
app.get('/weixin', (req, res) => {
    res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${unescape(redirect_uri)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`);
});


app.post("/post", (req, res) => {
    console.log("请求参数：", req.body);
    var result = {
        code: 200,
        msg: "post请求成功"
    };
    res.send(result);
});

app.listen(port, hostName, () => {
    console.log(`服务器运行在http://${hostName}:${port}`);
});