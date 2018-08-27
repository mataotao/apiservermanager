<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-tickets"></i> 管理员</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="search.name" placeholder="姓名" class="handle-input mr10"></el-input>
                <el-input v-model="search.username" placeholder="用户名" class="handle-input mr10"></el-input>
                <el-select v-model="search.status" clearable placeholder="状态">
                    <el-option
                        v-for="item in optionStatus"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key">
                    </el-option>
                </el-select>
                <el-select v-model="search.role" clearable placeholder="角色">
                    <el-option
                        v-for="item in optionRole"
                        :key="item.key"
                        :label="item.value"
                        :value="item.key">
                    </el-option>
                </el-select>
                <el-button type="primary" icon="search" @click="searchList">搜索</el-button>
                <el-button type="primary" @click="add" class="add-role">新增管理员</el-button>
            </div>
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column prop="username" label="用户名">
                </el-table-column>
                <el-table-column prop="name" label="姓名">
                </el-table-column>
                <el-table-column prop="mobile" label="手机号">
                </el-table-column>
                <el-table-column prop="head_img" label="头像">
                    <template slot-scope="scope">
                        <img :src="url(scope.row.head_img)" alt="" width="30%" height="30%">

                    </template>
                </el-table-column>
                <el-table-column prop="last_time" label="上次登录时间" width="150">
                </el-table-column>
                <el-table-column prop="last_ip" label="上次登录ip">
                </el-table-column>
                <el-table-column prop="status" label="状态">
                </el-table-column>
                <el-table-column prop="role_name" label="角色名称">
                </el-table-column>
                <el-table-column label="操作" width="250">
                    <template slot-scope="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button size="small" type="primary" v-if="scope.row.status===1"
                                   @click="freeze(scope.row.id,2)">冻结
                        </el-button>
                        <el-button size="small" type="warning" @click="freeze(scope.row.id,1)" v-else>解冻</el-button>
                        <el-button size="small" type="danger" @click="changePassword(scope.row.id)">修改密码
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination @current-change="handleCurrentChange" layout="prev, pager, next" :total="count">
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="formName" :visible.sync="editVisible" width="40%" :before-close="cancel">
            <el-form ref="form" :model="form" label-width="60px">
                <el-form-item label="账号">
                    <el-input v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item label="姓名">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="form.mobile"></el-input>
                </el-form-item>
                <el-form-item label="密码" v-if="type=='add'">
                    <el-input type="password" v-model="form.password"></el-input>
                </el-form-item>
                <el-form-item label="头像">
                    <el-upload
                        class="avatar-uploader"
                        :action="url('globals/uploads')"
                        :show-file-list="false"
                        :on-success="childHandleAvatarSuccess"
                        drag
                    >
                        <img v-if="form.head_img" :src="url(form.head_img)" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        <div class="el-upload__tip" slot="tip">将文件拖到此处，或<em>点击上传</em></div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="角色">
                    <el-checkbox-group v-model="form.roles">
                        <el-checkbox v-for="role in optionRole" :label="role.key" :key="role.key">{{role.value}}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                name: '',
                tableData: [],
                cur_page: 1,
                count: 1,
                editVisible: false,
                delVisible: false,
                type: 'add',
                formName: '新增管理员',
                form: {
                    name: '',
                    username: '',
                    mobile: '',
                    password: '',
                    head_img: '',
                    roles: []
                },
                id: 0,
                optionStatus: [],
                optionRole: [],
                search: {
                    name: '',
                    username: '',
                    role: '',
                    status: ''
                }
            }
        },
        created() {
            this.getData();
            this.getCondition();
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            getData() {
                let _self = this;
                this.$axios.get(DOMAIN + 'admin/manager/user?Page=' + this.cur_page + "&Name=" + this.search.name + "&Username=" + this.search.username + "&RoleId=" + this.search.role + "&Status=" + this.search.status).then((res) => {
                    if (res.data.code == 0) {
                        _self.tableData = res.data.data.list;
                        _self.count = res.data.data.count;
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
            },
            searchList() {
                this.cur_page = 1;
                this.getData();
            },
            handleEdit(index, row) {
                this.formName = '编辑管理员';
                this.editVisible = true;
                this.type = 'edit';
                this.getInfo(row.id)
            },
            // 保存编辑
            saveEdit() {
                let _self = this;
                this.form.roles.forEach((v, i) => {
                    this.form.roles[i] = parseInt(v)
                });
                this.form.mobile = parseInt(this.form.mobile);
                switch (this.type) {
                    case'add':
                        _self.addSave();
                        break;
                    case'edit':
                        _self.editSave();
                        break;

                }
            },
            addSave() {
                let _self = this;
                this.$axios.post(DOMAIN + 'admin/manager/user', this.form).then((res) => {
                    if (res.data.code == 0) {
                        _self.$message({
                            duration: 3000,
                            message: '新增成功',
                            type: 'success'
                        });
                        _self.searchList();
                        _self.initForm();
                        this.editVisible = false;
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
            },
            editSave() {
                let _self = this;
                this.$axios.put(DOMAIN + 'admin/manager/user/' + this.form.id, this.form).then((res) => {
                    if (res.data.code == 0) {
                        _self.$message({
                            duration: 3000,
                            message: '保存成功',
                            type: 'success'
                        });
                        _self.searchList();
                        _self.initForm();
                        this.editVisible = false;
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
            },
            add() {
                this.editVisible = true;
                this.formName = '新增管理员';
                this.type = 'add';
            },
            initForm() {
                this.form = {name: '', username: '', mobile: '', password: "", head_img: "", roles: []}
            },
            cancel() {
                this.initForm();
                this.editVisible = false;
            },
            getInfo(id) {
                let _self = this;
                this.$axios.get(DOMAIN + 'admin/manager/user/' + id).then(res => {
                    if (res.data.code == 0) {
                        _self.form = res.data.data;
                        let roles = [];
                        _self.form.roles.forEach((v, i) => {
                            roles[i] = v.toString()
                        });
                        _self.form.roles = roles
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
            },
            url(headImage) {
                return DOMAIN + headImage
            },
            childHandleAvatarSuccess(res, file) {
                if (res.code == 0) {
                    this.form.head_img = res.data[0];
                    this.$message({
                        type: 'success',
                        message: '上传成功'
                    });
                } else {
                    this.$message.error(res.message);
                }

            },
            getCondition() {
                let _self = this;
                this.$axios.get(DOMAIN + 'admin/condition?Role=list&User=status').then(res => {
                    if (res.data.code == 0) {
                        _self.optionRole = res.data.data.role.list;
                        _self.optionStatus = res.data.data.user.status
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
            },
            freeze(id, status) {
                let title = '是否冻结该用户？';
                if (status == 1) {
                    title = '是否解冻该用户？'
                }
                let _self = this;
                this.$confirm(title, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.$axios.put(DOMAIN + 'admin/manager/user-freeze/' + id, {status: status}).then(res => {
                        if (res.data.code == 0) {
                            _self.$message({
                                duration: 6000,
                                message: '操作成功',
                                type: 'success'
                            });
                            _self.searchList()
                        } else {
                            _self.$message({
                                duration: 6000,
                                message: res.data.message,
                                type: 'error'
                            });
                        }

                    })
                });
            },
            changePassword(id) {
                let _self =this;
                this.$prompt('请输入密码', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                }).then(({value}) => {
                    this.$axios.put(DOMAIN + 'admin/manager/user-pwd/' + id, {password: value}).then(res => {
                        if (res.data.code == 0) {
                            _self.$message({
                                duration: 6000,
                                message: '操作成功',
                                type: 'success'
                            });
                            _self.searchList()
                        } else {
                            _self.$message({
                                duration: 6000,
                                message: res.data.message,
                                type: 'error'
                            });
                        }

                    })
                });
            }
        }
    }

</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 200px;
        display: inline-block;
    }

    .del-dialog-cnt {
        font-size: 16px;
        text-align: center
    }

    .add-role {
        float: right;
    }
</style>
