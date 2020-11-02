<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" @click="showAddDialog">添加</el-button>
    <el-table :data="trademarkList" border stripe style="width: 100%;margin:20px 0">
      <el-table-column align="center" label="序号" type="index" width="80"></el-table-column>

      <el-table-column prop="tmName" label="品牌名称" width="width"></el-table-column>
      <el-table-column label="品牌LOGO" width="width">
        <!-- table的每一列都是暗含了遍历我们的trademarkList 
        默认情况下，你只需要给这个列指定要显示的，对象的对应属性，然后就会展示对应这个属性的属性值
        但是如果你要修改这个数据的结构，那么必须使用作用域插槽的用法
        -->
        <template slot-scope="{row,$index}">
          <img :src="row.logoUrl" style="height:80px;" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="width">
        <template slot-scope="{row,$index}">
          <el-button
            type="warning"
            icon="el-icon-edit"
            size="mini"
            @click="showUpdateDialog(row)"
          >修改</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteTrademark(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      style="text-align:center"
      background
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout=" prev, pager, next, jumper, ->,  sizes, total"
      :total="total"
      @current-change="getTrademarkList"
      @size-change="handleSizeChange"
    ></el-pagination>

    <!-- 添加和修改使用的dialog -->
    <!-- 解决当点击修改的时候 dialog框的做上角文字就变成修改 -->
    <el-dialog :title="`${form.id?'修改':'添加'}`" :visible.sync="isShowDialog">
      <el-form :model="form" style="width:80%" :rules="rules" ref="form">
        <el-form-item label="品牌名称" :label-width="formLabelWidth" prop="tmName">
          <el-input v-model="form.tmName" autocomplete="off" placeholder="请输入品牌名称"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" :label-width="formLabelWidth" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleLogoSuccess"
            :before-upload="beforeLogoUpload"
          >
            <!-- 上传图片的接口地址，需要通过转发去到真实的接口地址 -->

            <img v-if="form.logoUrl" :src="form.logoUrl" class="avatar" />
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div class="el-upload__tip" slot="tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="isShowDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateOrAddTrademarkList">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Trademark',
  data() {
    return {
      page: 1,
      limit: 3,
      trademarkList: [],
      total: 0,
      formLabelWidth: '100px',
      isShowDialog: false,
      form: {
        tmName: '',
        logoUrl: '', //上传成功收集返回的图片路径 并且在页面上进行展示
      },
      rules: {
        tmName: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          // { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' },
          // 自定义表单验证
          { validator: this.validateTmName, trigger: 'blur' },
        ],
        logoUrl: [
          {
            required: true,
            message: '请指定LOGO图片',
            trigger: 'change',
          },
        ],
      },
    }
  },
  mounted() {
    this.getTrademarkList()
  },
  methods: {
    // 自定义验证规则
    validateTmName(rule, value, callback) {
      if (value.length < 2 || value.length > 10) {
        // callback这个函数带了错误信息，代表不通过
        callback(new Error('请输入长度在 2到10 个字符'))
      } else {
        // callback这个函数不带任务错误信息，表示通过
        callback()
      }
    },
    async getTrademarkList(page = 1) {
      this.page = page
      const result = await this.$API.trademark.getPageList(
        this.page,
        this.limit
      )
      if (result.code === 200) {
        this.trademarkList = result.data.records
        this.total = result.data.total
      }
    },
    // 修改每页数量
    handleSizeChange(limit) {
      this.limit = limit
      this.getTrademarkList()
    },

    //点击添加按钮
    showAddDialog() {
      //每次点开dialog就去把form清空，保证每次弹出来都是新的form,否则就会显示上次上传的图片信息
      this.form = {
        tmName: '',
        logoUrl: '',
      }
      this.isShowDialog = true
    },
    //点击修改按钮
    showUpdateDialog(trademark) {
      // this.form = trademark //添加的时候弹出dialog需要form全局清空，保证是新的，但是修改的时候修改的是哪一条，form就是谁
      this.form = { ...trademark } //浅拷贝
      this.isShowDialog = true
    },

    //上传图片需要用的回调
    //上传成功调用
    handleLogoSuccess(res, file) {
      // this.form.logoUrl = URL.createObjectURL(file.raw);//其实本质还是拿的是本地的文件路径，我们不要这个
      this.form.logoUrl = res.data //这个存储的就是上传成功服务器返回的真实线上路径
      console.log(this.form.logoUrl)
    },

    //上传之前调用，一般都是在上传之前去对要上传的文件做限制用的
    beforeLogoUpload(file) {
      const TypeArr = ['image/jpeg', 'image/png']
      const isJPGOrPNG = TypeArr.indexOf(file.type) !== -1
      const isLt500K = file.size / 1024 < 500

      if (!isJPGOrPNG) {
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!')
      }
      if (!isLt500K) {
        this.$message.error('上传头像图片大小不能超过 500K')
      }
      return isJPGOrPNG && isLt500K //返回布尔值，如果为真则上传，如果为假则报错
    },

     // 点击确定，完成增加效果
    updateOrAddTrademarkList() {
      // 增加整体验证规则
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          // 找参数
          let trademark = this.form
          const result = await this.$API.trademark.addOrUpdataTrademark(
            trademark
          )
          if (result.code === 200) {
            this.$message.success(`${trademark.id ? '修改' : '添加'}品牌成功`)
            // 重新发请求拿数据，如果存在id,则为修改显示当前页，添加默认添加到最后，显示第一页
            this.getTrademarkList(trademark.id ? this.page : 1)
            // 关闭dialog
            this.isShowDialog = false
          } else {
            // 失败干啥
            this.$message.error(`${trademark.id ? '修改' : '添加'}品牌失败`)
          }
        } else {
          console.log('验证失败')
          return false
        }
      })
    },

    deleteTrademark(trademark) {
      this.$confirm(`你想删除${trademark.tmName}吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(async () => {
          //点击了确定按钮
          const result = await this.$API.trademark.deleteTrademark(trademark.id)
          if (result.code === 200) {
            this.$message.success('删除品牌成功')
            this.getTrademarkList(
              this.trademarkList.length > 1 ? this.page : this.page - 1
            )
          } else {
            this.$message.error('删除品牌失败')
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除',
          })
        })
    },
  },
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
