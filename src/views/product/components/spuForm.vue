<template>
  <!-- 这个组件写 添加和修改spu的界面 -->
  <div>
    <el-form ref="form" label-width="80px" :model="spuInfo">
      <el-form-item label="SPU名称">
        <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
      </el-form-item>

      <el-form-item label="品牌">
        <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
          <el-option
            :value="trademark.id"
            :label="trademark.tmName"
            v-for="( trademark, index) in trademarkList"
            :key="trademark.id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="SPU描述">
        <el-input type="textarea" placeholder="SPU描述" v-model="spuInfo.description"></el-input>
      </el-form-item>

      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :file-list="spuImageList"
          :on-success="handleUploadSuccess"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          :placeholder="unUsedBaseSaleAttrList.length >0 ? `还有${unUsedBaseSaleAttrList.length}个未使用`:`0个未使用`"
          v-model="unUsedBaseSaleAttrIdAndName"
        >
          <el-option
            :value="unUsedBaseSaleAttr.id + ':' + unUsedBaseSaleAttr.name"
            :label="unUsedBaseSaleAttr.name"
            v-for="(unUsedBaseSaleAttr, index) in unUsedBaseSaleAttrList"
            :key="unUsedBaseSaleAttr.id"
          ></el-option>
        </el-select>
        <el-button type="primary" icon="el-icon-plus" @click="addSaleAttr"  :disabled="!unUsedBaseSaleAttrIdAndName">添加销售属性</el-button>

        <el-table style="width: 100%;margin-top:20px" border stripe :data="spuInfo.spuSaleAttrList">
          <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
          <el-table-column prop="saleAttrName" label="属性名" width="150"></el-table-column>
          <el-table-column label="属性值名称列表" width="width">
            <template slot-scope="{row,$index}">
              <el-tag
                :key="spuSaleAttrValue.id"
                v-for="(spuSaleAttrValue, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="row.spuSaleAttrValueList.splice(index,1)"
              >{{spuSaleAttrValue.saleAttrValueName}}</el-tag>
              <el-input
                placeholder="请输入"
                v-if="row.isEdit"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              ></el-input>

              <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ 属性值</el-button>
              <!--  @click="showInput" -->
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <el-button
                type="primary"
                icon="el-icon-delete"
                size="mini"
                @click="spuInfo.spuSaleAttrList.splice($index,1)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <!--   -->
      <el-form-item>
        <el-button type="primary" @click="saveSpu">保存</el-button>
        <el-button @click="back">返回</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'spuForm',
  data() {
    return {
      category3Id: '',
      dialogImageUrl: '',
      dialogVisible: false,
      spuInfo: {
        spuName: '',
        tmId: '',
        description: '',
        spuSaleAttrList: [],
      },
      spuImageList: [],
      trademarkList: [],
      baseSaleAttrList: [],
      unUsedBaseSaleAttrIdAndName: '',
    }
  },
  computed: {
    // 计算未使用的基础销售属性
    unUsedBaseSaleAttrList() {
      return this.baseSaleAttrList.filter((baseSaleAttr) =>
        this.spuInfo.spuSaleAttrList.every(
          (spuSaleAttr) => spuSaleAttr.saleAttrName !== baseSaleAttr.name
        )
      )
    },
  },

  methods: {
    // 删除图片的回调
    handleRemove(file, fileList) {
      console.log(file, fileList) //file为被删除的图片   fileList为删除后剩下对的图片列表
      this.spuImageList = fileList
    },
    // 预览图片大图的回调
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    // 图片上传成功的回调
    handleUploadSuccess(response, file, fileList) {
      console.log(response, file, fileList) //response为上传成功的响应，file上传的图片，fileList上传成功后总的图片列表。只有新添加的图片有response
      this.spuImageList = fileList
    },
    // 点击 修改SPU   需要获取初始数据，发送4个请求
    async initUpdateSpuForm(spuId, category3Id) {
      this.category3Id = category3Id
      //  获取指定id的SPU信息
      const spuInfoResult = await this.$API.spu.get(spuId)
      if (spuInfoResult.code === 200) {
        this.spuInfo = spuInfoResult.data
      }

      //  获取指定SPU的id对应的图片列表
      const imageResult = await this.$API.sku.getSpuImageList(spuId)
      if (imageResult.code === 200) {
        // 获取图片列表的数据的时候 先整理完成添加name和url之后再赋值给this
        let spuImageList = imageResult.data
        spuImageList.forEach((item) => {
          item.name = item.imgName
          item.url = item.imgUrl
        })
        this.spuImageList = spuImageList
      }

      // 获取所有品牌列表数据
      const allTrademarkList = await this.$API.trademark.getAllTrademarkList()
      if (allTrademarkList.code === 200) {
        this.trademarkList = allTrademarkList.data
      }

      // 获取所有销售属性列表
      const allSaleList = await this.$API.spu.getSaleList()
      if (allSaleList.code === 200) {
        this.baseSaleAttrList = allSaleList.data
      }
    },
    // 点击 添加SPU  需要获取数据，发2个请求
    async initAddSpuForm(category3Id) {
      this.category3Id = category3Id
      // 获取所有品牌列表数据
      const allTrademarkList = await this.$API.trademark.getAllTrademarkList()
      if (allTrademarkList.code === 200) {
        this.trademarkList = allTrademarkList.data
        console.log( allTrademarkList.data)
      }

      // 获取所有销售属性列表
      const allSaleList = await this.$API.spu.getSaleList()
      if (allSaleList.code === 200) {
        this.baseSaleAttrList = allSaleList.data
      }
    },
    // 添加销售属性  添加到    spuSaleAttrList  收集的是 id 和 name
    addSaleAttr() {
      let [
        baseSaleAttrId,
        saleAttrName,
      ] = this.unUsedBaseSaleAttrIdAndName.split(':')
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: [],
      })
     this.unUsedBaseSaleAttrIdAndName =''
      console.log(saleAttrName)
    },
    // 点击添加属性值，
    showInput(row) {
      // 让input 切换编辑模式
      this.$set(row, 'isEdit', true)
      // 让input框自动获取焦点   v-if渲染需要时间  要确保页面更新完成后才获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus()
      })
    },
    // input框输入内容后，失去焦点或回车，把输入的属性值放入到列表中
    handleInputConfirm(row) {
      let { baseSaleAttrId, saleAttrValueName } = row
      // 如果输入的内容为空，这不放入列表中
      //  if (!saleAttrValueName) {
      //    this.$message.warning('请不要输入空信息')
      //    return
      //  }

      if (!saleAttrValueName.trim()) return
      // 判断输入的属性值是否已经存在
      let Repeat = row.spuSaleAttrValueList.some(
        (item) => item.saleAttrValueName.trim() === saleAttrValueName.trim()
      )
      if (Repeat) {
        this.$message.warning('该属性值已存在')
        return
      }
      // 接着构造一个空的属性值对象
      row.spuSaleAttrValueList.push({
        baseSaleAttrId,
        saleAttrValueName,
      })
      // 再接着切换为查看模式
      row.isEdit = false
      // 最后清空 input输入框
      row.saleAttrValueName = ''
    },
    // 点击保存
    async saveSpu() {
      // 获取参数数据
      let { spuInfo, category3Id, spuImageList } = this
      // 整合参数数据
      // 1、给里添 category3Id
      spuInfo.category3Id = category3Id
      // 2、图片的整合，如果是新添图图片，没有imgUrl 和 imgName  但是存在response , response.data 就是新添图片的Url
      spuImageList = spuImageList.map((item) => ({
        imgName: item.name,
        imgUrl: item.response ? item.response.data : item.imgUrl,
      }))
      spuInfo.spuImageList = spuImageList
      // 3、去除不需要传递的参数  （isEdit,saleAttrValueName）
      spuInfo.spuSaleAttrList.forEach((item) => {
        delete item.isEdit
        delete item.saleAttrValueName
      })

      // 整合完成之后去发请求
      const result = await this.$API.spu.addUpdate(spuInfo)
      if (result.code === 200) {
        this.$message.success('保存成功')
        this.$emit('update:visible', false) //关闭添加spu和修改spu界面
        // 需要判断是修改页面返回的，还是添加返回的   标识：是否有spuId
        console.log(result)
        this.$emit('saveSuccess') //触发父组件内部返回成功的回调。
      } else {
        this.$message.error('保存失败')
      }
    },

    // 重置数据的方法  清空所有
    resetData() {
      ;(this.category3Id = ''),
        (this.dialogImageUrl = ''),
        (this.dialogVisible = false),
        (this.spuInfo = {
          spuName: '',
          tmId: '',
          description: '',
          spuSaleAttrList: [],
        })
      this.spuImageList = []
      this.trademarkList = []
      this.baseSaleAttrList = []
    },
    back() {
      // 点击返回，关闭添加和修改的页面
      this.$emit('update:visible', false)
      // 点击返回，回到列表页面
      this.$emit('cancel') //触发父组件里的回调
    },
  },
}
</script>

<style lang="less" scoped>
</style>
