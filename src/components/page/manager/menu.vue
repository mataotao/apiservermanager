<template>
    <div>
        <div class="container" v-loading="currentLoading">
            <h1>权限管理</h1>
            <el-tree
                :data="menu"
                node-key="id"
                default-expand-all
                :expand-on-click-node="false">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>
          <el-button
              type="text"
              size="mini"
              @click="() => append(data)">
            新增子节点
          </el-button>
          <el-button
              type="text"
              size="mini"
              @click="() => edit(data)" v-if="data.id!=0">
            编辑
          </el-button>
               <el-button
                   type="text"
                   size="mini"
                   @click="() => remove(node, data)" v-if="data.id!=0">
            删除
          </el-button>
        </span>
      </span>
            </el-tree>
        </div>

        <div>
            <el-dialog :title="title" :visible.sync="dialogVisible" :append-to-body="true" width="30%"
                       :before-close="handleClose" v-loading.sync="loading">
                <el-form :model="form">
                    <el-form-item label="菜单名称">
                        <el-input v-model="form.Label" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="是否是包含类型的菜单">
                        <el-switch
                            v-model="form.IsContainMenu"
                            :active-value="IsContainMenu.activeValue"
                            :inactive-value="IsContainMenu.inactiveValue"
                            active-text="是"
                            inactive-text="否" auto-complete="off">
                        </el-switch>
                    </el-form-item>

                    <el-form-item label="URL">
                        <el-input v-model="form.Url" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="排序值">
                        <el-input v-model="form.Sort" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="条件">
                        <el-input v-model="form.Cond" auto-complete="off"></el-input>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="handleClose">取 消</el-button>
                    <el-button type="primary" @click="sc">确 定</el-button>
                </div>
            </el-dialog>
        </div>

    </div>

</template>

<script>
    export default {
        data() {
            return {
                loading: false,
                title: '',
                menu: [{
                    id: 0,
                    label: "顶级菜单",
                    children: [],
                    level: 0
                }],
                dialogVisible: false,
                form: {
                    Label: '',
                    IsContainMenu: 1,
                    Url: '',
                    Sort: 500,
                    Level: 0,
                    Pid: 0,
                    Cond: '',
                },
                IsContainMenu: {
                    activeValue: 1,
                    inactiveValue: 2,
                },
                currentLoading: false,
                method: ''
            }
        },
        methods: {
            list() {
                let _self = this;
                this.currentLoading = true;
                this.$axios.get(DOMAIN + 'admin/manager/permission').then(res => {
                    if (res.data.code == 0) {
                        _self.menu[0]['children'] = res.data.data
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }
                    _self.currentLoading = false;

                })
            },
            getInfo(id) {
                let _self = this;
                this.currentLoading = true;
                this.$axios.get(DOMAIN + 'admin/manager/permission/' + id).then(res => {
                    if (res.data.code == 0) {
                        _self.setForm(res.data.data, id)
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }
                    _self.currentLoading = false;
                })
            },
            setForm(data, id) {
                this.form.Label = data.label;
                this.form.IsContainMenu = data.is_contain_menu;
                this.form.Url = data.url;
                this.form.Sort = data.sort;
                this.form.Level = data.level;
                this.form.Pid = data.pid;
                this.form.Cond = data.cond;
                this.form.Id = id;
            },
            sc() {
                switch (this.method) {
                    case 'add':
                        this.sub();
                        break;
                    case 'edit':
                        this.update();
                        break;
                }
            },
            update() {
                let _self = this;
                this.loading = true;
                this.form.Sort = parseInt(this.form.Sort);
                this.$axios.put(DOMAIN + 'admin/manager/permission/' + this.form.Id, this.form).then(res => {
                    _self.loading = false;
                    if (res.data.code == 0) {
                        this.dialogVisible = false;
                        _self.$message({
                            duration: 6000,
                            message: '修改成功',
                            type: 'success'
                        });
                        _self.init();
                        _self.list();
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }


                })
            },
            sub() {
                let _self = this;
                this.loading = true;
                this.$axios.post(DOMAIN + 'admin/manager/permission', this.form).then(res => {
                    _self.loading = false;
                    if (res.data.code == 0) {
                        this.dialogVisible = false;
                        _self.$message({
                            duration: 6000,
                            message: '新增成功',
                            type: 'success'
                        });
                        _self.init();
                        _self.list();
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
            },
            append(data) {
                this.form.Pid = data.id;
                this.form.Level = data.level + 1;
                this.title = '添加菜单';
                this.dialogVisible = true;
                this.loading = false;
                this.method = 'add'
            },
            edit(data) {
                this.title = '修改菜单';
                let id = data.id;
                this.dialogVisible = true;
                this.loading = false;
                this.method = 'edit'
                this.getInfo(id);
            },
            remove(node, data) {
                this.$confirm('此操作将永久删除该菜单, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    let id = data.id;
                    this.currentLoading = true;
                    let _self = this;
                    this.$axios.delete(DOMAIN + 'admin/manager/permission/' + id).then(res => {
                        if (res.data.code == 0) {
                            this.$message({
                                type: 'success',
                                message: '删除成功'
                            });
                            _self.list()
                        } else {
                            _self.$message.error(res.data.msg);
                        }
                        _self.currentLoading = false;
                    })
                })
            },
            handleClose() {
                this.dialogVisible = false;
                this.loading = false;
                this.init()
            },
            init() {
                this.form.Label = '';
                this.form.IsContainMenu = 1;
                this.form.Url = '';
                this.form.Sort = 500;
                this.form.Level = 0;
                this.form.Pid = 0;
                this.form.Cond = '';
            }
        },
        mounted: function () {
            this.list()
        },
    }
</script>

<style scoped>
    h1 {
        text-align: center;
        margin: 30px 0;
    }

    p {
        line-height: 30px;
        margin-bottom: 10px;
        text-indent: 2em;
    }

    .logout {
        color: #409EFF;
    }
</style>
