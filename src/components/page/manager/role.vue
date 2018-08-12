<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-tickets"></i> 角色管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="name" placeholder="筛选角色名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
                <el-button type="primary" @click="add" class="add-role">新增角色</el-button>
            </div>
            <el-table :data="tableData" border style="width: 100%">
                <el-table-column prop="name" label="名称" width="150">
                </el-table-column>
                <el-table-column prop="description" label="简介">
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">删除
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
                <el-form-item label="角色名">
                    <el-input v-model="form.Name"></el-input>
                </el-form-item>
                <el-form-item label="简介">
                    <el-input v-model="form.Description"></el-input>
                </el-form-item>
                <el-form-item label="权限点">
                    <el-tree
                        :data="menu"
                        node-key="id"
                        default-expand-all
                        :expand-on-click-node="false"
                        show-checkbox
                        ref="tree"
                        :check-strictly="true"
                    >

                    </el-tree>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancel">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 删除提示框 -->
        <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
            <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="delVisible = false">取 消</el-button>
                <el-button type="primary" @click="deleteRow">确 定</el-button>
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
                formName: '新增角色',
                form: {
                    Name: '',
                    Description: '',
                    Permission: ''
                },
                menu: '',
                id:0
            }
        },
        created() {
            this.getData();
            this.menuList();
        },
        methods: {
            // 分页导航
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            getData() {
                let _self = this;
                this.$axios.get(DOMAIN + 'admin/manager/role?Page=' + this.cur_page + "&Name=" + this.name).then((res) => {
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
            search() {
                this.cur_page = 1;
                this.getData();
            },
            handleEdit(index, row) {
                this.formName = '编辑角色';
                this.editVisible = true;
                this.type = 'edit';
                this.getInfo(row.id)
            },
            handleDelete(index, row) {
                this.id=row.id
                this.delVisible = true;
            },
            // 保存编辑
            saveEdit() {
                let keys = this.$refs.tree.getCheckedKeys();
                let halfKeys = this.$refs.tree.getHalfCheckedKeys();
                this.form.Permission = keys.concat(halfKeys);
                let _self = this;
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
                this.$axios.post(DOMAIN + 'admin/manager/role', this.form).then((res) => {
                    if (res.data.code == 0) {
                        _self.$message({
                            duration: 3000,
                            message: '新增成功',
                            type: 'success'
                        });
                        _self.search();
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
                this.$axios.put(DOMAIN + 'admin/manager/role/'+this.form.Id, this.form).then((res) => {
                    if (res.data.code == 0) {
                        _self.$message({
                            duration: 3000,
                            message: '保存成功',
                            type: 'success'
                        });
                        _self.search();
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
            // 确定删除
            deleteRow() {
                let _self=this;
                this.$axios.delete(DOMAIN + 'admin/manager/role/'+this.id).then(res=>{
                    if (res.data.code == 0) {
                        _self.$message({
                            duration: 6000,
                            message: '刪除成功',
                            type: 'success'
                        });
                        _self.search()
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }
                });
                this.delVisible = false;
            },
            add() {
                this.editVisible = true;
                this.formName = '新增角色';
                this.type = 'add';
            },
            menuList() {
                let _self = this;
                this.$axios.get(DOMAIN + 'admin/manager/permission').then(res => {
                    if (res.data.code == 0) {
                        _self.menu = res.data.data
                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
            },
            initForm() {
                this.$refs.tree.setCheckedKeys([]);
                this.form = {Name: '', Description: '', Permission: ''}
            },
            cancel() {
                this.initForm();
                this.editVisible = false;
            },
            getInfo(id) {
                let _self = this;
                this.$axios.get(DOMAIN + 'admin/manager/role/' + id).then(res => {
                    if (res.data.code == 0) {
                        _self.form.Name = res.data.data.name;
                        _self.form.Description = res.data.data.description;
                        _self.form.Permission = res.data.data.permission;
                        _self.form.Id = res.data.data.id;
                        console.log(_self.form.Permission);
                        this.$refs.tree.setCheckedKeys(_self.form.Permission);

                    } else {
                        _self.$message({
                            duration: 6000,
                            message: res.data.message,
                            type: 'error'
                        });
                    }

                })
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
