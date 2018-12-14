$(() => {
    let getQueryString = name => {
        let reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
        let r = window.location.search.substr(1).match(reg);
        return r != null ? unescape(r[2]) : r;
    };

    let rnd = (n, m) => Math.floor(Math.random() * (m - n + 1) + n);

    let renderTable = (table, layer, form, openLayer) => {
        table.render({
            elem: '#prize_info',
            url: '/getAllPrize',
            cellMinWidth: 80, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
            cols: [
                [{
                        field: 'nickname',
                        title: '用户名',
                        templet: (d) =>
                            `<div><img class="user_icon" src=${d.headimgurl} />${decodeURI(d.nickname)}</div>`
                    } //width 支持：数字、百分比和不填写。你还可以通过 minWidth 参数局部定义当前单元格的最小宽度，layui 2.2.1 新增
                    , {
                        field: 'sex',
                        title: '性别',
                        align: 'center',
                        templet: (d) => !d.sex ? '---' : d.sex == 1 ? '男' : '女'
                    }, {
                        field: 'city',
                        title: '城市',
                        align: 'center',
                        templet: (d) => !d.city ? '---' : d
                            .city
                    }, {
                        field: 'award_name',
                        title: '奖品名称',
                        align: 'center'
                    }, {
                        field: 'award_id',
                        title: '奖品编码',
                        align: 'center'
                    } //单元格内容水平居中
                    , {
                        field: 'creat_time',
                        title: '中奖日期',
                        sort: true,
                        align: 'center'
                    } //单元格内容水平居中
                    , {
                        field: 'is_get',
                        title: '是否领取',
                        sort: true,
                        align: 'center',
                        templet: (d) =>
                            `<input type="checkbox" code="${d.openid}@${d.creat_time}" name="close" ${d.is_get == 0 ? 'checked' : 'disabled'} lay-filter="switchTest" lay-skin="switch" value="${d.is_get}" lay-text="NO|YES">`
                    }
                ]
            ],
            page: true
        });
        if(!$.cookie('flag')) {
            $.cookie('flag', '1', {
                expires: 0.5
            });
        }
        openLayer ? layer.close(openLayer) : null;
        layer.msg('欢迎使用后台管理系统！', {
            icon: 6,
            offset: '30%'
        });
        //监听指定开关
        form.on('switch(switchTest)', (data) => {
            $(data.elem).val() == '0' ? $(data.elem).val('1') :
                $(data.elem).val('0');
            $.get('/updataIsGet', {
                openid: $(data.elem).attr('code').split(
                    '@')[0],
                creat_time: $(data.elem).attr('code').split(
                    '@')[1],
                state: $(data.elem).val()
            }, (res) => {
                if (res.flag && res.flag == 1) {
                    $(data.elem).attr('disabled', true).siblings('div.layui-form-switch').addClass('layui-checkbox-disbaled layui-disabled').removeClass('layui-form-onswitch');
                    layer.msg('状态修改成功！', {
                        icon: 1,
                        offset: '30%'
                    });
                }else {
                    layer.msg('网络异常！', {
                        icon: 5,
                        offset: '30%'
                    });
                }
            });
        });
    };

    if ($.cookie('code') && getQueryString('username') && $.cookie('code') == hex_md5(getQueryString(
            'username'))) {
        $('#user_name').text(getQueryString('username'));
        layui.use(['layer', 'table', 'form'], () => {
            const layer = layui.layer;
            const table = layui.table;
            const form = layui.form;

            if($.cookie('flag')) {
                renderTable(table, layer, form);
            }else {
                //示范一个公告层
                let openLayer = layer.open({
                    type: 1,
                    title: false, //不显示标题栏
                    closeBtn: false,
                    // time: 5000,
                    anim: rnd(0, 6),
                    area: '300px;',
                    shade: 0.8,
                    id: 'LAY_layuipro', //设定一个id，防止重复弹出
                    btn: ['好的'],
                    btnAlign: 'c',
                    moveType: 1, //拖拽模式，0或者1
                    content: [
                        '<div style="padding: 50px; line-height: 22px; background-color: #393D49; color: #fff; font-weight: 300;">你知道吗？亲！',
                        '<br>',
                        '    <br>无论春夏秋冬，关心牵挂始终跟踪；无论白天黑夜，问候祝福永不松懈。亲爱的朋友，工作繁忙，注意休息，愿幸福快乐！',
                        '<br>',
                        '    <br>每天微笑多一点，每天快乐就多一点；遇到一件难事，微笑着去面对，会变得简单许多，这样也能起到有效的减压效果哦！亲爱的我们一起来为自己微笑吧！',
                        '<br>',
                        '    <br>我们此后的征途是星辰大海 ^_^',
                        '</div>'
                    ].join(""),
                    success: (layero) => {
                        // 弹窗DOM渲染完的回调
                    },
                    yes: () => {
                        renderTable(table, layer, form, openLayer);
                    }
                });
            }
            $('#logout').on('click', () => {
                layer.open({
                    title: '提示',
                    btn: ['确定', '取消'], //可以无限个按钮
                    content: '是否退出后台管理系统？',
                    closeBtn: 0,
                    yes: () => {
                        $.cookie('code', '', {
                            expires: -1
                        });
                        $(window).attr('location', `./../admin`);
                    }
                  });     
                    
            });
        });
    } else {
        $(window).attr('location', `./../admin`);
    }
});