'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');

var hostName = '0.0.0.0'; // 设置主机名
var port = 8090; // 设置端口号
var appid = 'wx1f9c767629fabde5'; //appid
var redirect_uri = 'http://47.110.73.210:8090/index.html';
var connection = mysql.createConnection({
    host: '114.115.234.194',
    user: 'root',
    password: '??8Hyq78q',
    port: '3306',
    database: 'lottery'
});
connection.connect();

var app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("./../"));

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 保存用户信息
app.get('/saveUserInfo', function (req, res) {
    var userData = req.query.data;
    console.log(userData);
    var searchUserSql = 'select * from user_info where openid = \'' + userData.openid + '\'';
    connection.query(searchUserSql, function (err, result) {
        if (err) throw err;
        if (result.length == 0) {
            // user_info表中无此用户
            var addUserInfoSql = 'insert into user_info set ?';
            connection.query(addUserInfoSql, userData, function (addErr, addResult) {
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
app.get('/getAwards', function (req, res) {
    var searchAwardsSql = 'select * from award_info';
    var flag = void 0;
    connection.query(searchAwardsSql, function (err, result) {
        if (err) throw err;
        flag = result.length > 0 ? 1 : 0;
        res.send({
            flag: flag,
            result: result
        });
    });
});

//查询用户历史中奖奖品
app.get('/getUserAward', function (req, res) {
    var searchUserPrizeInfoSql = 'select nickname, award_name, creat_time from prize_info where openid = \'' + req.query.openid + '\' and is_get = \'0\'';
    connection.query(searchUserPrizeInfoSql, function (prizeErr, prizeAddResult) {
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
app.get('/prizeProcess', function (req, res) {
    console.log(req.query.data);
    req.query.data.is_get = '0';
    var prizeProcessSql = 'insert into prize_info set ?';
    var flag = void 0;
    connection.query(prizeProcessSql, req.query.data, function (err, result) {
        if (err) throw err;
        console.log(result);
        flag = result.length > 0 ? 1 : 0;
        res.send({
            flag: flag,
            result: result
        });
    });
});

// 访问微信获取获取用户信息
app.get('/weixin', function (req, res) {
    res.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + appid + '&redirect_uri=' + unescape(redirect_uri) + '&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect');
});

app.post("/post", function (req, res) {
    console.log("请求参数：", req.body);
    var result = {
        code: 200,
        msg: "post请求成功"
    };
    res.send(result);
});

app.listen(port, hostName, function () {
    console.log('\u670D\u52A1\u5668\u8FD0\u884C\u5728http://' + hostName + ':' + port);
});
