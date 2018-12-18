$(() => {
    let getQueryString = name => {
        let reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`);
        let r = window.location.search.substr(1).match(reg);
        return r != null ? unescape(r[2]) : r;
    };

    let rnd = (n, m) => Math.floor(Math.random() * (m - n + 1) + n);

    let renderPrizeInfo = (table, layer, form, first) => {
        let loading = layer.load(2, {
            shade: [0.45, '#000'] //0.1透明度的白色背景
        });
        table.render({
            elem: '#prize_info',
            url: './../getAllPrize',
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
            page: true,
            limit: 20,
            done: (res, curr, count) => {
                layer.close(loading);
                first ? layer.msg('欢迎使用后台管理系统！', {
                    icon: 6,
                    offset: '30%'
                }) : null;
            }
        });
        if (!$.cookie('flag')) {
            $.cookie('flag', '1', {
                expires: 1 / 24
            });
        }

        //监听指定开关
        form.on('switch(switchTest)', (data) => {
            let loading = layer.load(2, {
                shade: [0.45, '#000'] //0.1透明度的白色背景
            });
            $(data.elem).val() == '0' ? $(data.elem).val('1') :
                $(data.elem).val('0');
            $.get('./../updataIsGet', {
                openid: $(data.elem).attr('code').split(
                    '@')[0],
                creat_time: $(data.elem).attr('code').split(
                    '@')[1],
                state: $(data.elem).val()
            }, (res) => {
                layer.close(loading);
                if (res.flag && res.flag == 1) {
                    $(data.elem).attr('disabled', true).siblings('div.layui-form-switch').addClass('layui-checkbox-disbaled layui-disabled').removeClass('layui-form-onswitch');
                    layer.msg('状态修改成功！', {
                        icon: 1,
                        offset: '30%'
                    });
                } else {
                    layer.msg('网络异常！', {
                        icon: 5,
                        offset: '30%'
                    });
                }
            });
        });
    };

    let renderAwardInfo = (table, layer, form, colorpicker) => {
        let loading = layer.load(2, {
            shade: [0.45, '#000'] //0.1透明度的白色背景
        });
        table.render({
            elem: '#award_info',
            url: './../getAllAward',
            // toolbar: '#toolbarDemo',
            cellMinWidth: 80, //全局定义常规单元格的最小宽度，layui 2.2.1 新增
            cols: [
                [{
                        field: 'index',
                        title: '#',
                        align: 'center',
                        width: 80,
                        templet: (d) => d.LAY_INDEX
                    }, {
                        field: 'award_name',
                        title: '奖品名称'
                    } //width 支持：数字、百分比和不填写。你还可以通过 minWidth 参数局部定义当前单元格的最小宽度，layui 2.2.1 新增
                    , {
                        field: 'award_id',
                        title: '奖品id',
                        align: 'center'
                    }, {
                        field: 'award_bg_color',
                        title: '奖品背景颜色',
                        align: 'center'
                    },
                    {
                        fixed: 'right',
                        title: '操作',
                        toolbar: '#toolbar',
                        width: 200
                    }
                ]
            ],
            limit: 100,
            done: (res, curr, count) => {
                layer.close(loading);
            }
        });
        //监听行工具事件
        table.on('tool(award_info)', (obj) => {
            let data = obj.data;
            //console.log(obj)
            if (obj.event === 'del') {
                layer.confirm('真的删除行么', (index) => {
                    obj.del();
                    console.log(index)
                    layer.close(index);
                });
            } else if (obj.event === 'edit') {
                // layer.prompt({
                //     formType: 2,
                //     value: data.award_name,
                // }, (value, index) => {
                //     console.log(obj)
                //     obj.update({
                //         award_name: value
                //     });
                //     layer.close(index);
                // });
                layer.open({
                    type: 1,
                    title: '编辑',
                    closeBtn: 1, //不显示关闭按钮
                    anim: 2,
                    area: '400px',
                    move: false,
                    btn: ['确定', '取消'], //可以无限个按钮
                    content: `<form class="layui-form" id="edit" action="" lay-filter="edit">
                                <div class="layui-form-item">
                                    <label class="layui-form-label">奖品名称</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="game_max_order" required lay-verify="required" placeholder="请输入奖品名称"
                                            autocomplete="off" class="layui-input" value="${data.award_name}">
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label">奖品id</label>
                                    <div class="layui-input-inline">
                                        <input type="text" name="game_max_order" required lay-verify="required" placeholder="请输入奖品id"
                                            autocomplete="off" class="layui-input" value="${data.award_id}">
                                    </div>
                                </div>
                                <div class="layui-form-item">
                                    <label class="layui-form-label">奖品背景色</label>
                                    <div class="layui-input-inline" style="width: 120px;">
                                        <input type="text" value="" placeholder="请选择颜色" class="layui-input" id="test-form-input">
                                    </div>
                                    <div class="layui-inline" style="left: -11px;">
                                        <div id="test-form"></div>
                                    </div>
                                </div>
                            </form>`,
                            success: () => {
                                $('#test-form-input').val(data.award_bg_color).parent().css('width', '222px');
                                //表单赋值
                                colorpicker.render({
                                    elem: '#test-form',
                                    color: data.award_bg_color,
                                    done: function(color){
                                        $('#test-form-input').val(color);
                                    }
                                });
                            }
                });

                
            }
        });
    };

    let renderSetting = (form, layer) => {
        getSetting = () => {
            let loading = layer.load(2, {
                shade: [0.45, '#000'] //0.1透明度的白色背景
            });
            $.get('./../getSetting', {}, (res) => {
                let setting = res.result[0];
                form.val('content2', setting);
                setting.game_state == 1 ? $('#game_info_div').slideUp() : $('#game_info_div').slideDown();
                layer.close(loading);
            });
        }
        this.getSetting();

        //监听指定开关
        form.on('switch(game_state)', function (data) {
            this.checked ? $('#game_info_div').slideUp() : $('#game_info_div').slideDown()
        });

        //监听提交
        form.on('submit(content2)', (data) => {
            data.field.game_state = data.field.game_state ? 1 : 0;
            layer.open({
                title: '提示',
                btn: ['确定', '取消'], //可以无限个按钮
                content: '提交后将立即生效，确认提交？',
                closeBtn: 0,
                yes: () => {
                    let loading = layer.load(2, {
                        shade: [0.45, '#000'] //0.1透明度的白色背景
                    });
                    $.get('./../updataSetting', {
                        data: data.field
                    }, (res) => {
                        layer.close(loading);
                        if (res.flag && res.flag == 1) {
                            // updataLayer.close();
                            layer.msg('系统设置修改成功！', {
                                icon: 1,
                                offset: '30%'
                            });
                            this.getSetting();
                        } else {
                            layer.msg('网络异常，请联系管理员！', {
                                icon: 5,
                                offset: '30%'
                            });
                            this.getSetting();
                        }
                    });
                }
            });
            return false;
        });
    };

    if ($.cookie('code') && getQueryString('username') && $.cookie('code') == hex_md5(getQueryString(
            'username'))) {
        $('#user_name').text(getQueryString('username'));
        layui.use(['layer', 'table', 'form', 'colorpicker'], () => {
            const layer = layui.layer;
            const table = layui.table;
            const form = layui.form;
            const colorpicker = layui.colorpicker;

            if ($.cookie('flag')) {
                renderPrizeInfo(table, layer, form);
                renderAwardInfo(table, layer, form, colorpicker);
            } else {
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
                        openLayer ? layer.close(openLayer) : null;
                        renderPrizeInfo(table, layer, form, '1');
                    }
                });
            }

            //切换菜单
            $('.nav').on('click', function () {
                $(this).addClass('layui-this').siblings().removeClass('layui-this');
                $('.content').eq($(this).index()).show().siblings().hide();
                switch ($(this).index()) {
                    case 0:
                        renderPrizeInfo(table, layer, form);
                        break;
                    case 1:
                        renderAwardInfo(table, layer, form, colorpicker);
                        break;
                    case 2:
                        renderSetting(form, layer);
                        break;
                    default:
                        break;
                }
            });

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
                        $(window).attr('location', `./index.html`);
                    }
                });
            });
        });
    } else {
        $(window).attr('location', `./index.html`);
    }
});