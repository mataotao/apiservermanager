<template>
    <div class="login-wrap">
        <div class="ms-title">后台管理系统</div>
        <div class="ms-login">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="用户名"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="密码" v-model="ruleForm.password"
                              @keyup.enter.native="submitForm('ruleForm')"></el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
                </div>
                <!--<p style="font-size:12px;line-height:30px;color:#999;">Tips : 用户名和密码随便填。</p>-->
            </el-form>
        </div>
    </div>
</template>

<script>
    import {setCookie} from "../../util/util";

    export default {
        data: function () {
            return {
                ruleForm: {
                    username: '',
                    password: ''
                },
                rules: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            submitForm(formName) {
                let _self = this;
                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        this.$axios.post(DOMAIN + '/login', this.ruleForm).then((res) => {
                            if (res.data.code == 0) {
                                setCookie('token', res.data.data.token, 20 * 60 * 1000);
                                let info = {
                                    is_root: res.data.data.is_root,
                                    username: res.data.data.username,
                                    head_img: res.data.data.head_img
                                };
                                setCookie('username', info.username, 20 * 60 * 1000);
                                setCookie('head_img', info.head_img, 20 * 60 * 1000);
                                setCookie('is_root', info.is_root, 20 * 60 * 1000);
                                _self.$message({
                                    duration: 3000,
                                    message: '登录成功',
                                    type: 'success'
                                });
                                // localStorage.setItem('ms_username', this.ruleForm.username);
                                this.$router.push('/');
                            } else {
                                _self.$message({
                                    duration: 6000,
                                    message: res.data.message,
                                    type: 'error'
                                });
                            }

                        })


                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .ms-title {
        position: absolute;
        top: 50%;
        width: 100%;
        margin-top: -230px;
        text-align: center;
        font-size: 30px;
        color: #fff;

    }

    .ms-login {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 300px;
        height: 160px;
        margin: -150px 0 0 -190px;
        padding: 40px;
        border-radius: 5px;
        background: #fff;
    }

    .login-btn {
        text-align: center;
    }

    .login-btn button {
        width: 100%;
        height: 36px;
    }
</style>
