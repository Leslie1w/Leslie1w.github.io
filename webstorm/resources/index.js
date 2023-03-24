 window.onload = function () {
    let register = document.getElementById('register'); //进入注册按钮
    let login = document.getElementsByClassName('login')[0]; //登录框
    let container = document.getElementsByClassName('container')[0]; //注册框
    let before = document.getElementById('before'); //进入登录按钮
    let loginBox = document.querySelector('.loginBox'); //大盒子

    /* 翻转 */
    register.onclick = function () {
        loginBox.style.transform = 'translateX(-50%) rotateY(180deg) ';
        login.style.display = 'none';
        container.style.display = 'block';
        clear();
    }
    before.onclick = function () {
        loginBox.style.transform = 'translateX(-50%) rotate(360deg) ';
        container.style.display = 'none';
        login.style.display = 'block';
        clear();
    }
    // 清空函数
    function clear() {
        let register_input = container.querySelectorAll('input'); //所有的注册信息
        let login_input = login.querySelectorAll('input');
        for (let i = 0; i < register_input.length; i++) {
            register_input[i].nextElementSibling.style.display = 'none';
            register_input[i].value = '';
        }
        for (let i = 0; i < login_input.length; i++) {
            login_input[i].value = '';
        }
    }
    /* 获取焦点弹出提示框 */
    let psd_input = container.querySelector('#psd_input');
    psd_input.addEventListener('focus', function () {
        this.nextElementSibling.style.display = 'block';
    })
    // 验证登录信息
    /* 获取相关元素 */
    let register_input = container.querySelectorAll('input'); //所有的注册信息
    let login_input = login.querySelectorAll('input');
    /* 正则表达式 */
    let telReg = /^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/; //电话号码的正则表达
    let psdReg = /\w{6,18}$/; //设置密码为6，18位，只能包含字母、数字和下划线
    let reg = [psdReg, psdReg, telReg]; //把正则表达式放到数组中，这样可以通过遍历实现
    for (let i = 0; i < register_input.length; i++) {
        register_input[i].onblur = function () {
            if (i >= 2) {
                if (!reg[i - 2].test(register_input[i].value)) { // 如果不符合正则表达，弹出提示信息
                    console.log(11);
                    this.nextElementSibling.style.display = 'block';
                } else {
                    this.nextElementSibling.style.display = 'none';
                }
            }
            if (i == 3) {
                if (this.value == register_input[2].value) { // 如果两次输入的密码不一致，弹出提示信息
                    this.nextElementSibling.style.display = 'none';
                } else {
                    this.nextElementSibling.style.display = 'block';
                }
            }
        }

    }

    /* 正则结束 */
    /* 登录 */
    let login_btn = document.querySelector('#login_btn');
    let register_btn = document.querySelector('#newBtn')
    let err = document.querySelector('#err');
    let login_name = document.querySelector('#login_name');
    let login_psd = document.querySelector('#login_psd');
    let ins = document.querySelector('#ins')
    console.log(err);
    login_btn.onclick = function () {
        if (login_name.value != '' && login_psd.value != '') {
            var name = login_name.value;
            var pwd = login_psd.value;
            if ((name=='double'&&pwd=='123456')||(name=='leslie'&&pwd=='123456')) {
                        // go(res);
                        window.location.href = '../double.html';
                    }

        } else {
            ins.style.display = 'block';
            setTimeout(() => {
                ins.style.display = 'none';
            }, 1000)
        }

    }
    let register_true = document.querySelector('.true');
    let tips = document.querySelector('#tips');
    let ret = document.querySelector('#ret')
    register_btn.onclick = () => {
        let judge = true;
        for (let i = 2; i < register_input.length; i++) {
            if (!reg[i - 2].test(register_input[i].value)) {
                judge = false;
            }
        }
        if (register_input[2].value != register_input[3].value) {
            judge = false;
            register_input[3].nextElementSibling.style.display = 'block';
        } else {
            register_input[3].nextElementSibling.style.display = 'none';
        }
        if (judge) {
            $.ajax({
                type: 'POST',
                url: 'http://www.rushmc.top/api/register',
                data: {
                    username: register_input[0].value,
                    password: register_input[2].value,
                    name: register_input[1].value,
                    phone: register_input[4].value
                },
                success: res => {
                    if (res.code == 200) {
                        console.log(res);
                        register_true.style.display = 'block';
                        setTimeout(() => {
                            register_true.style.display = 'none';
                            loginBox.style.transform = 'translateX(-50%) rotate(360deg) ';
                            container.style.display = 'none';
                            login.style.display = 'block';
                        }, 1000)
                        clear();
                    } else {
                        ret.style.display = 'block';
                        setTimeout(() => {
                            ret.style.display = 'none'
                        }, 2000)
                    }
                }
            })
        } else {
            tips.style.display = 'block';
            setTimeout(() => {
                tips.style.display = 'none'
            }, 2000)
        }
    }
    /* 成功的回调 */

    function go(res) {
        let results = document.querySelector('#results');
        let tog = document.querySelector('#tog');
        results.innerHTML = res.data.name + '你好，欢迎来到小A创客空间';
        tog.style.display = 'block';
        tog.onclick = function () {
            tog.style.display = 'none';
            loginBox.style.display = 'block';
        }
    }


}
