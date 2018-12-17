$(function () {
    let turnplate = {
        restaraunts: [], //大转盘奖品名称
        colors: [], //大转盘奖品区块对应背景颜色
        outsideRadius: 222, //大转盘外圆的半径
        textRadius: 165, //大转盘奖品位置距离圆心的距离
        insideRadius: 65, //大转盘内圆的半径
        startAngle: 0, //开始角度
        bRotate: false, //false:停止;ture:旋转
    };
    let openid = '';
    let nickname = '';
    let count = 0;
    let SHARELINK = ''; //分享字段
    let setting = {};

    let getQueryString = name => {
        let reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
        let r = window.location.search.substr(1).match(reg);
        return r != null ? unescape(r[2]) : r;
    }

    let init = () => {
        mui.showLoading("正在加载..", "div"); //加载文字和类型，plus环境中类型为div时强制以div方式显示
        if (getQueryString('code')) {
            // 用户信息已获取
            // 用户再次刷新时判断localStorage是否用户信息已获取
            if (localStorage.getItem('openid')) {
                openid = localStorage.getItem('openid');
                nickname = localStorage.getItem('nickname');
            } else {
                $.get('./getUserInfo', {
                    code: getQueryString('code')
                }, (res) => {
                    openid = res.data.openid;
                    nickname = res.data.nickname;
                    localStorage.openid = openid; // 存储用户id
                    localStorage.nickname = nickname; // 存储用户名
                });
            }

            // 获取初始化分享功能数据
            let ticket = localStorage.getItem('ticket');
            let appid = localStorage.getItem('appid');
            let now_time = Date.parse(new Date()) / 1000;   //当前时间
            let ticket_time = Number(localStorage.getItem('create_time')) + Number(localStorage.getItem('expires_in')); // 签名过期时间
            let str = nonceStr();
            // 获取奖品信息以及设置
            $.get('./getAwardsAndSetting', {}, (res) => {
                turnplate.restaraunts = res.result;
                SHARELINK = res.shareLink;
                setting = res.setting[0];
                $('.rule_text').html(setting.game_rule);
                if (ticket && appid && localStorage.getItem('create_time') && localStorage.getItem('expires_in') && now_time < ticket_time) {
                    wxShare(appid, str, ticket);
                } else {
                    $.get('./getTrcket', {}, (res) => {
                        localStorage.ticket = res.ticket;
                        localStorage.appid = res.appid;
                        localStorage.create_time = Date.parse(new Date()) / 1000;    // 设置时间
                        localStorage.expires_in = res.expires_in;    // 过期时间
                        wxShare(res.appid, str, res.ticket);
                    });
                }
                drawRouletteWheel();
            });

            // 获取已中奖信息
            $.get('./getPrize', {}, (res) => {
                $.each(res.result, (index, item) => {
                    $('.swiper-wrapper').append(`<div class="swiper-slide">恭喜 <span style="color: #FBDB00;">${decodeURI(item.nickname)}</span> 抽到 <span style="color: #FBDB00;">${item.award_name}</span></div>`);
                });
                new Swiper ('.swiper-container', {
                    autoplay: true,//可选选项，自动滑动
                    speed: 700,
                    noSwiping : true,
                    height: 50,//你的slide高度
                    direction : 'vertical',
                    loop: true, // 循环模式选项
                });        
            });
        }
    }

    let wxShare = (appid, str, ticket) => {
        //配置微信信息
        wx.config({
            debug: false, // true:调试时候弹窗
            appId: appid, // 微信appid
            timestamp: new Date().getSeconds(), // 时间戳
            nonceStr: str, // 随机字符串
            signature: create_signature(str, ticket, new Date().getSeconds(), window.location.href), // 签名
            jsApiList: [
                // 所有要调用的 API 都要加到这个列表中
                'onMenuShareTimeline', // 分享到朋友圈接口
                'onMenuShareAppMessage', //  分享到朋友接口
                'onMenuShareQQ', // 分享到QQ接口
                'onMenuShareWeibo' // 分享到微博接口
            ]
        });

        wx.ready(function () {
            // 微信分享的数据
            let shareData = {
                "imgUrl": 'https://www.suxiaozhi.cn/chz/img/mn.gif', // 分享显示的缩略图地址
                "link": 'https://www.suxiaozhi.cn/chz/afk', // 分享地址
                "desc": '为API生，为框架死，为debug奋斗一辈子，吃符号的亏，上大小写的当，最后死在需求上。', // 分享描述
                "title": '码农的日常', // 分享标题
                success: function () {
                    // 分享成功可以做相应的数据处理
                }
            }
            wx.onMenuShareTimeline(shareData);
            wx.onMenuShareAppMessage(shareData);
            wx.onMenuShareQQ(shareData);
            wx.onMenuShareWeibo(shareData);
        });
    };

    let nonceStr = () => {
        let str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let val = "";
        for (let i = 0; i < 16; i++) {
            val += str.substr(Math.round((Math.random() * 10)), 1);
        }
        return val;
    }

    let create_signature = (nocestr, ticket, timestamp, url) => sha1(`jsapi_ticket=${ticket}&noncestr=${nocestr}&timestamp=${timestamp}&url=${url}`);

    let drawRouletteWheel = () => {
        let canvas = document.getElementById("wheelcanvas");
        if (canvas.getContext) {
            //根据奖品个数计算圆周角度
            let arc = Math.PI / (turnplate.restaraunts.length / 2);
            let ctx = canvas.getContext("2d");
            //在给定矩形内清空一个矩形
            ctx.clearRect(0, 0, 516, 516);
            //strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式  
            ctx.strokeStyle = "#FFBE04";
            //font 属性设置或返回画布上文本内容的当前字体属性
            ctx.font = 'bold 22px Microsoft YaHei';
            for (let i = 0; i < turnplate.restaraunts.length; i++) {
                let angle = turnplate.startAngle + i * arc;
                ctx.fillStyle = turnplate.restaraunts[i].award_bg_color;
                ctx.beginPath();
                //arc(x,y,r,起始角,结束角,绘制方向) 方法创建弧/曲线（用于创建圆或部分圆）    
                ctx.arc(258, 258, turnplate.outsideRadius, angle, angle + arc, false);
                ctx.arc(258, 258, turnplate.insideRadius, angle + arc, angle, true);
                ctx.stroke();
                ctx.fill();
                //锁画布(为了保存之前的画布状态)
                ctx.save();

                //----绘制奖品开始----
                ctx.fillStyle = "#E83800";
                //ctx.fillStyle = turnplate.fontcolors[i];
                let text = turnplate.restaraunts[i].award_name;
                let line_height = 30;
                //translate方法重新映射画布上的 (0,0) 位置
                ctx.translate(258 + Math.cos(angle + arc / 2) * turnplate.textRadius, 258 + Math.sin(angle + arc / 2) * turnplate.textRadius);

                //rotate方法旋转当前的绘图
                ctx.rotate(angle + arc / 2 + Math.PI / 2);
                /** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) **/
                if (text.indexOf("\n") > 0) { //换行
                    let texts = text.split("\n");
                    for (let j = 0; j < texts.length; j++) {
                        ctx.font = j == 0 ? '22px Microsoft YaHei' : '22px Microsoft YaHei';
                        //ctx.fillStyle = j == 0?'#FFFFFF':'#FFFFFF';
                        if (j == 0) {
                            //ctx.fillText(texts[j]+"M", -ctx.measureText(texts[j]+"M").width / 2, j * line_height);
                            ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                        } else {
                            ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                        }
                    }
                } else if (text.indexOf("\n") == -1 && text.length > 6) { //奖品名称长度超过一定范围 
                    text = text.substring(0, 6) + "||" + text.substring(6);
                    let texts = text.split("||");
                    for (let j = 0; j < texts.length; j++) {
                        ctx.fillText(texts[j], -ctx.measureText(texts[j]).width / 2, j * line_height);
                    }
                } else {
                    //在画布上绘制填色的文本。文本的默认颜色是黑色
                    //measureText()方法返回包含一个对象，该对象包含以像素计的指定字体宽度
                    ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
                }

                //把当前画布返回（调整）到上一个save()状态之前 
                ctx.restore();
                //----绘制奖品结束----
            }
        }
        mui.hideLoading(); //隐藏后的回调函数
    }

    let rnd = (n, m) => Math.floor(Math.random() * (m - n + 1) + n);

    let dateFomart = () => {
        const date = new Date();
        let y = date.getFullYear().toString();
        let m = (date.getMonth() + 1).toString();
        let d = date.getDate().toString();
        let h = date.getHours().toString();
        let f = date.getMinutes().toString();
        let s = date.getSeconds().toString();
        return `${y}-${m.padStart(2, 0)}-${d.padStart(2, 0)} ${h.padStart(2, 0)}:${f.padStart(2, 0)}:${s.padStart(2, 0)}`;
    }

    let rotateFn = (item, data) => {
        data.creat_time = dateFomart();
        data.openid = openid;
        data.nickname = encodeURI(nickname);
        delete data.id;
        delete data.award_bg_color;
        $.get('./prizeProcess', {
            data
        }, (res) => {});
        var angles = item * (360 / turnplate.restaraunts.length) - (360 / (turnplate.restaraunts.length * 2));
        if (angles < 270) {
            angles = 270 - angles;
        } else {
            angles = 360 - angles + 270;
        }
        $('#wheelcanvas').stopRotate();
        $('#wheelcanvas').rotate({
            angle: 0,
            animateTo: angles + 1800,
            duration: 6000,
            callback: function () {
                //中奖页面与谢谢参与页面弹窗
                if (data.award_name.indexOf("谢谢参与") >= 0) {
                    $(".xxcy_text").html(data.award_name);
                    $("#xxcy-main").fadeIn();
                    turnplate.bRotate = !turnplate.bRotate;
                } else {
                    $("#zj-main").fadeIn();
                    var resultTxt = data.award_name.replace(/[\r\n]/g, ""); //去掉回车换行
                    $("#jiangpin").text(resultTxt);
                    turnplate.bRotate = !turnplate.bRotate;
                }
            }
        });
    };

    init();

    $('#tupBtn').click(() => {
        if (turnplate.bRotate) return;

        if (setting.game_state == 0) {
            $(".xxcy_text").html(setting.game_info);
            $("#xxcy-main").fadeIn();
            return;
        }

        if (setting.game_max_order <= count) {
            $(".xxcy_text").html("抽奖次数已用完<br>分享可以增加一次抽奖机会！");
            $("#xxcy-main").fadeIn();
            return;
        }
        mui.showLoading("正在加载..", "div"); 
        $.get('./getUserAward', {
            openid: openid
        }, (res) => {
            mui.hideLoading();
            if (res.result.length > 0) {
                $(".xxcy_text").html('您好：' + decodeURI(res.result[0].nickname) + '，您于' + res.result[0].creat_time + '已参加本次活动，您本次活动的奖品为“' + res.result[0].award_name + '”，请尽快领取！');
                $("#xxcy-main").fadeIn();
            } else {
                count++;
                turnplate.bRotate = !turnplate.bRotate;
                let item = rnd(0, turnplate.restaraunts.length - 1);
                item == 0 ? turnplate.restaraunts.length : item;
                rotateFn(item + 1, turnplate.restaraunts[item]);
            }

        });

    });

    $('.close_zj').click(() => {
        $('#zj-main').fadeOut();
    });

    $('.close_xxcy').click(() => {
        $('#xxcy-main').fadeOut();
    });
})