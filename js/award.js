// JavaScript Document

var turnplate = {
	restaraunts: [], //大转盘奖品名称
	colors: [], //大转盘奖品区块对应背景颜色
	//fontcolors:[],				//大转盘奖品区块对应文字颜色
	outsideRadius: 222, //大转盘外圆的半径
	textRadius: 165, //大转盘奖品位置距离圆心的距离
	insideRadius: 65, //大转盘内圆的半径
	startAngle: 0, //开始角度
	bRotate: false, //false:停止;ture:旋转
};

const appid = 'wx1f9c767629fabde5'; //appid
const redirect_uri = 'http://suxiaozhi.tunnel.qydev.com/index.html';
var ticket = '';

var host = '';
var count = 0;
var countMax = 1; //单人可玩次数
var gameState = 1; //0：活动暂未开放	1：活动正常开发
var activityStart = '2018-11-23'; //活动开始时间
var activityEnd = '2018-12-23'; //活动结束时间
var showPrizeInfo = {
	num: 0,
	data: [{
		userName: '张三',
		gift_coupon: '5元超市代金券'

	}, {
		userName: '李四',
		gift_coupon: '50元超市代金券'

	}, {
		userName: '王五',
		gift_coupon: '100元超市代金券'

	}]
};

var Mar = document.getElementById("Marquee");
var child_div = Mar.getElementsByTagName("div")
var picH = 35; //移动高度 
var scrollstep = 3; //移动步幅,越大越快 
var scrolltime = 50; //移动频度(毫秒)越大越慢 
var stoptime = 3000; //间断时间(毫秒) 
var tmpH = 0;
Mar.innerHTML += Mar.innerHTML;

function start() {
	if (showPrizeInfo.num > showPrizeInfo.data.length - 1) {
		showPrizeInfo.num = 0
	};
	if (tmpH < picH) {
		tmpH += scrollstep;
		if (tmpH > picH) {
			tmpH = picH;
		}
		Mar.scrollTop = tmpH;
		setTimeout(start, scrolltime);
	} else {
		$('#userName').text(showPrizeInfo.data[showPrizeInfo.num].userName);
		$('#gift_coupon').text(showPrizeInfo.data[showPrizeInfo.num].gift_coupon);
		showPrizeInfo.num++;
		tmpH = 0;
		Mar.appendChild(child_div[0]);
		Mar.scrollTop = 0;
		setTimeout(start, stoptime);
	}
}

$(document).ready(function () {

	var code = getQueryString('code');
	var openid = '';
	var nickname = '';
	var getAccess_token_URL =
		'https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx1f9c767629fabde5&secret=362855efacd523cedc6bc18805bb74b6&code=' +
		code + '&grant_type=authorization_code';
	// window.location.href
	yahooProxy('getAccess_token', getAccess_token_URL);

	// 雅虎ypl代理
	function yahooProxy(flag, target) {
		mui.showLoading("正在加载..", "div"); //加载文字和类型，plus环境中类型为div时强制以div方式显示
		$.ajax({
			// 雅虎代理url
			url: 'http://query.yahooapis.com/v1/public/yql',
			dataType: 'jsonp',
			data: {
				q: 'select * from json where url="' + target + '"',
				format: 'json' // 代理返回数据格式
			},
			success: function (data) {
				console.log(data)
				if (flag == 'getAccess_token') {
					var data = data.query.results.json; //获取带有access_token的数据
					var getUserInfoUrl =
						'https://api.weixin.qq.com/sns/userinfo?access_token=' + data.access_token +
						'&openid=' + data.openid + '&lang=zh_CN';
					yahooProxy('getUser_info', getUserInfoUrl);
				} else if (flag == 'getUser_info') {
					var data = data.query.results.json; //获取带有user_info的数据
					openid = data.openid;
					nickname = data.nickname;
					// 存入用户信息
					$.get(host + '/saveUserInfo', {
						data: data
					}, (res) => {
						console.log(res);
					});
				} else if (flag == 'fx') {
					console.log(data.query.results.json.access_token);
					var u = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=" + data.query.results.json.access_token + "&type=jsapi";
					yahooProxy('fx1', u);
				} else if (flag == 'fx1') {
					var ticket = data.query.results.json.ticket;
					console.log(ticket)
					var str = nonceStr();
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
						var shareData = {
							"imgUrl": 'http://suxiaozhi.tunnel.qydev.com/img/logo.ico', // 分享显示的缩略图地址
							"link": 'http://suxiaozhi.tunnel.qydev.com/weixin', // 分享地址
							"desc": '真正的程序员喜欢兼卖爆米花，他们利用CPU散发出的热量做爆米花，可以根据米花爆裂的速度听出正在运行什么程序。', // 分享描述
							"title": '陈恒志的Demo分享', // 分享标题
							success: function () {
								// 分享成功可以做相应的数据处理
							}
						}
						wx.onMenuShareTimeline(shareData);
						wx.onMenuShareAppMessage(shareData);
						wx.onMenuShareQQ(shareData);
						wx.onMenuShareWeibo(shareData);
					});
				}
			}
		})
	}

	var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appid + "&secret=362855efacd523cedc6bc18805bb74b6";
	yahooProxy('fx', url);

	function nonceStr() {
		var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var val = "";
		for (var i = 0; i < 16; i++) {
			val += str.substr(Math.round((Math.random() * 10)), 1);
		}
		return val;
	}

	function create_signature(nocestr, ticket, timestamp, url) {
		var signature = "";
		// 这里参数的顺序要按照 key 值 ASCII 码升序排序
		var s = "jsapi_ticket=" + ticket + "&noncestr=" + nocestr + "&timestamp=" + timestamp + "&url=" + url;
		console.log(s)
		return sha1(s);
	}




	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return unescape(r[2]);
		} else {
			return null;
		}
	}

	function aToAA(data) {
		return data < 10 ? '0' + data : data;
	}

	function dateFomart() {
		var date = new Date();
		var y = date.getFullYear();
		var m = date.getMonth() + 1;
		var d = date.getDate();
		var h = date.getHours();
		var f = date.getMinutes();
		var s = date.getSeconds();
		return y + '-' + aToAA(m) + '-' + aToAA(d) + ' ' + aToAA(h) + ':' + aToAA(f) + ':' + aToAA(s);
	}

	setTimeout(start, stoptime);

	var rotateTimeOut = function () {
		$('#wheelcanvas').rotate({
			angle: 0,
			animateTo: 2160,
			duration: 6000,
			callback: function () {
				alert('网络超时，请检查您的网络设置！');
			}
		});
	};


	//旋转转盘 item:奖品位置; txt：提示语;
	var rotateFn = function (item, data) {
		console.log(data)
		data.creat_time = dateFomart();
		data.openid = openid;
		data.nickname = nickname;
		delete data.id;
		delete data.award_bg_color;
		$.get(host + '/prizeProcess', {
			data
		}, (res) => {

		})
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
					save();
				} else {
					$("#zj-main").fadeIn();
					var resultTxt = data.award_name.replace(/[\r\n]/g, ""); //去掉回车换行
					$("#jiangpin").text(resultTxt);
					save();
				}
			}
		});
	};

	/********弹窗页面控制**********/

	$('.close_zj').click(function () {
		// window.location.reload();
		$('#zj-main').fadeOut();
		$('#tx-main').fadeIn(); //提醒框显示
		//判断用户是否确认放弃
		$(".do").click(function () { //点确认就默认放弃
			$('#tx-main').fadeOut();
			theEnd();
			save();
		});
		$(".not_do").click(function () { //点取消就回到提交页面
			$('#tx-main').fadeOut();
			$('#zj-main').fadeIn();
		});

		$('#ml-main').fadeIn();

	});

	$('.close_xxcy').click(function () {
		$('#xxcy-main').fadeOut();
		// window.location.reload();
		//		theEnd();
		//		save();
	});

	/********抽奖开始**********/
	$('#tupBtn').click(function () {
		if (turnplate.bRotate) return;

		if (gameState == 0) {
			$(".xxcy_text").html("活动时间：" + activityStart + " ~ " + activityEnd);
			$("#xxcy-main").fadeIn();
			return;
		}

		if (countMax <= count) {
			$(".xxcy_text").html("今日抽奖次数已用完<br>每天分享可以增加一次抽奖机会");
			$("#xxcy-main").fadeIn();
			return;
		}

		$.get(host + '/getUserAward', {
			openid: openid
		}, (res) => {
			if (res.result.length > 0) {
				$(".xxcy_text").html('您好：' + res.result[0].nickname + '，您于' + res.result[0].creat_time + '已参加本次活动，您本次活动的奖品为“' + res.result[0].award_name + '”，请尽快领取！');
				$("#xxcy-main").fadeIn();
			} else {
				count++;
				turnplate.bRotate = !turnplate.bRotate;
				var item = rnd(0, turnplate.restaraunts.length - 1);
				item == 0 ? turnplate.restaraunts.length : item;
				rotateFn(item + 1, turnplate.restaraunts[item]);
			}

		});

	})

});

function rnd(n, m) {
	var random = Math.floor(Math.random() * (m - n + 1) + n);
	return random;
}

//页面所有元素加载完毕后执行drawRouletteWheel()方法对转盘进行渲染
window.onload = function () {
	$.get(host + '/getAwards', {}, (res) => {
		mui.hideLoading(); //隐藏后的回调函数
		console.log(res)
		turnplate.restaraunts = res.result;
		drawRouletteWheel();

	});
};

function drawRouletteWheel() {
	var canvas = document.getElementById("wheelcanvas");
	if (canvas.getContext) {
		//根据奖品个数计算圆周角度
		var arc = Math.PI / (turnplate.restaraunts.length / 2);
		var ctx = canvas.getContext("2d");
		//在给定矩形内清空一个矩形
		ctx.clearRect(0, 0, 516, 516);
		//strokeStyle 属性设置或返回用于笔触的颜色、渐变或模式  
		ctx.strokeStyle = "#FFBE04";
		//font 属性设置或返回画布上文本内容的当前字体属性
		ctx.font = 'bold 22px Microsoft YaHei';
		for (var i = 0; i < turnplate.restaraunts.length; i++) {
			var angle = turnplate.startAngle + i * arc;
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
			var text = turnplate.restaraunts[i].award_name;
			var line_height = 30;
			//translate方法重新映射画布上的 (0,0) 位置
			ctx.translate(258 + Math.cos(angle + arc / 2) * turnplate.textRadius, 258 + Math.sin(angle + arc / 2) * turnplate.textRadius);

			//rotate方法旋转当前的绘图
			ctx.rotate(angle + arc / 2 + Math.PI / 2);
			/** 下面代码根据奖品类型、奖品名称长度渲染不同效果，如字体、颜色、图片效果。(具体根据实际情况改变) **/
			if (text.indexOf("\n") > 0) { //换行
				var texts = text.split("\n");
				for (var j = 0; j < texts.length; j++) {
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
				var texts = text.split("||");
				for (var j = 0; j < texts.length; j++) {
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
}

function showDialog(id) {
	document.getElementById(id).style.display = "-webkit-box";
}

function showID(id) {
	document.getElementById(id).style.display = "block";
}

function hideID(id) {
	document.getElementById(id).style.display = "none";
}

//缓存函数
function save() {
	localStorage.end = theEnd();
}

//提示抽奖结束
function theEnd() {
	// $('#tupBtn').unbind('click');//提交成功解除点击事件。
	turnplate.bRotate = !turnplate.bRotate;
	return 2;
}
