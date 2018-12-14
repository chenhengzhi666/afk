let u = $("input[name=username]");
let p = $("input[name=password]");
window.onload = () => {
    layui.use('layer', () => {
        const layer = layui.layer;
        $(".connect p").eq(0).animate({
            "left": "0%"
        }, 600);
        $(".connect p").eq(1).animate({
            "left": "0%"
        }, 400);
        $('.password').keydown((e) => {
            if (e.keyCode == '13') $('#submit').click();
        });
        $('#submit').on('click', () => {
            let userName = $.trim($('.username').val());
            let password = $.trim($('.password').val());
            if (!userName) {
                $('.username').animateCss('shake');
            } else if (!password) {
                $('.password').animateCss('shake');
            } else {
                $.post('/loginVerify', {
                    userName: userName,
                    password: hex_md5(password)
                }, (res) => {
                    if (res.flag == 1) {
                        $.cookie('code', hex_md5(userName), {
                            expires: 1
                        }); // expires设置过期时间（天）
                        $.cookie('flag', '', {
                            expires: -1
                        });
                        $(window).attr('location', `./admin.html?username=${userName}`);
                    } else {
                        layer.msg(res.desc, {
                            icon: 5,
                            offset: '30%'
                        });
                    }
                });
            }
        })
    });
}