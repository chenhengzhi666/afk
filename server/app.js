const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const request = require('request');
const CONFIG = require('./config');


const SERVER = CONFIG.SERVER; // 设置服务器
const WX = CONFIG.WX;   // 微信配置
const MYSQL = CONFIG.MYSQL;

// 数据库初始化、连接
const connection = mysql.createConnection(MYSQL);
connection.connect();

let app = express();
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static("./../")); //调用服务器文件夹下文件路径


app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// 访问微信获取获取用户信息
app.get('/afk', (req, res) => {
    res.redirect(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${WX.appid}&redirect_uri=${unescape(WX.redirect_uri)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`);
});

// 跳转到主页面
app.get('/afk1', (req, res) => {
    let code = getQueryString(req._parsedUrl.search, 'code'); // 获取code
    console.log(`code = ${code}`)

    // console.log(code)
    // res.redirect(`/index.html${req._parsedUrl.search}`);
});

app.get('/getUserInfo', (req, res) => {
    let code = req.query.code;

    // code 换取 access_token 和 openid
    request(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WX.appid}&secret=${WX.secret}&code=${code}&grant_type=authorization_code`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            let access_token = JSON.parse(body).access_token;
            let openid = JSON.parse(body).openid;
            console.log(`access_token = ${access_token}`)
            console.log(`openid = ${openid}`)

            // access_token 和 openid 换取用户信息
            request(`https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`, function (error1, response1, body1) {
                if (!error1 && response1.statusCode == 200) {
                    let userData = JSON.parse(body1);
                    console.log(userData) // Show the HTML for the baidu homepage.
                    res.send({
                        data: {
                            nickname: userData.nickname,
                            openid: userData.openid
                        }
                    });

                    let searchUserSql = `select * from user_info where openid = '${openid}'`;
                    connection.query(searchUserSql, (err, result) => {
                        if (err) throw err;
                        if (result.length == 0) {
                            // user_info表中无此用户
                            let addUserInfoSql = 'insert into user_info(openid, nickname, headimgurl, country, province, city, language, sex) value(?, ?, ?, ?, ?, ?, ?, ?)';
                            let inserData = [userData.openid, encodeURI(userData.nickname), userData.headimgurl, userData.country, userData.province, userData.city, userData.language, userData.sex];
                            connection.query(addUserInfoSql, inserData, (addErr, addResult) => {
                                if (addErr) throw addErr;
                                console.log('用户保存成功！');
                            });
                        } else {
                            // user_info表中存在该用户
                            console.log('用户已存在！');
                        }
                    });
                }
            })
        }
    })
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

// 查询用户历史中奖奖品
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


// 获取初始化分享字段
app.get('/getTrcket', (req, res) => {
    request(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WX.appid}&secret=362855efacd523cedc6bc18805bb74b6`, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            request(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${JSON.parse(body).access_token}&type=jsapi`, function (error1, response1, body1) {
                if (!error1 && response1.statusCode == 200) {
                    console.log(JSON.parse(body1))
                    res.send({
                        ticket: JSON.parse(body1).ticket,
                        appid: WX.appid,
                        expires_in: JSON.parse(body1).expires_in
                    });
                }
            });
        }
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

// 获取已中奖用户信息
app.get('/getPrize', (req, res) => {
    let getPrizeSql = `select nickname, award_name from prize_info where award_id != '00000' limit 10`;
    connection.query(getPrizeSql, (err, result) => {
        if (err) throw err;
        res.send({
            result: result
        })
    });
});

// 后台管理登录
app.post("/loginVerify", (req, res) => {
    console.log("请求参数：", req.body);
    // res.send(result);
    connection.query(`select * from admin where user_name = '${req.body.userName}'`, (err, result) => {
        if (err) throw err;
        if(result.length > 0) {
            connection.query(`select * from admin where user_name = '${req.body.userName}' and user_password = '${req.body.password}'`, (err1, result1) => {
                if (err1) throw err1;
                if(result1.length > 0) {
                    res.send({
                        flag: 1,
                        desc: '登录成功！'
                    });
                }else {
                    res.send({
                        flag: 0,
                        desc: '密码错误！'
                    });
                }
            });
        }else {
            res.send({
                flag: 0,
                desc: '用户不存在！'
            });
        }
    });
});

// 查询所有奖品信息
app.get('/getAllPrize', (req, res) => {
    connection.query(`select * from prize_info, user_info where prize_info.openid = user_info.openid order by creat_time limit ${(req.query.page - 1) * req.query.limit}, ${req.query.limit}`, (err, result) => {
        if (err) throw err;
        connection.query(`select * from prize_info`, (err1, result1) => {
            if (err1) throw err1;
            res.send({
                code: 0,
                count: result1.length,
                data: result
            });
        });
    });
}); 

// 更新是否领取字段状态值
app.get('/updataIsGet', (req, res) => {
    connection.query(`update prize_info set is_get = '${req.query.state}' where openid = '${req.query.openid}' and creat_time = '${req.query.creat_time}'`, (err, result) => {
        if (err) throw err;
        res.send({
            flag: 1,
            desc: 'success'
        });
    });
});

app.listen(SERVER.port, SERVER.hostName, () => {
    console.log(`服务器运行在http://${SERVER.hostName}:${SERVER.port}`);
});

