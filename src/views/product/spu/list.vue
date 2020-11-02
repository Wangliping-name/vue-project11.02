<template>
  <div>
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowList="isShowList"></CategorySelector>
    </el-card>
    <el-card style="margin-top:20px">
      <!-- 列表页 -->
      <div v-show="!isShowSkuForm && ! isShowSpuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!category3Id"
          @click="showAddSpuForm"
        >添加SPU</el-button>
        <el-table :data="spuList" border style="margin:20px 0">
          <el-table-column align="center" label="序号" type="index" width="80"></el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width"></el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width"></el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{row,$index}">
              <HintButton
                type="primary"
                title="添加SKU"
                size="mini"
                icon="el-icon-plus"
                @click="showAddSkuForm(row)"
              ></HintButton>
              <HintButton
                type="primary"
                title="修改SPU"
                size="mini"
                icon="el-icon-edit"
                @click="showUpdateSpuForm(row.id)"
              ></HintButton>
              <HintButton
                type="info"
                title="查看所有SPU"
                size="mini"
                icon="el-icon-info"
                @click="showSkuList(row)"
              ></HintButton>
              <el-popconfirm :title="`你确定要删除${row.spuName}吗？`" @onConfirm="deleteSpu(row)">
                <HintButton
                  slot="reference"
                  type="danger"
                  title="删除SPU"
                  size="mini"
                  icon="el-icon-delete"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          background
          align="center"
          @current-change="getSpuList"
          :current-page="page"
          :page-sizes="[3, 5, 7]"
          :page-size="limit"
          layout="prev, pager, next, jumper, ->, sizes,total"
          :total="total"
        ></el-pagination>

        <!-- 点击 查看所有的SKU 出现dialog -->
        <el-dialog
          title="收货地址"
          :visible.sync="dialogTableVisible"
          :before-close="handlebeforeclose"
        >
          <el-table :data="skuList">
            <el-table-column property="skuName" label="名称" width="150"></el-table-column>
            <el-table-column property="price" label="价格(元)" width="200"></el-table-column>
            <el-table-column property="weight" label="重量(KG)"></el-table-column>
            <el-table-column label="默认图片">
              <template slot-scope="{row,$index}">
                <img :src="row.skuDefaultImg" alt style="width:100px" />
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
      </div>
      <spuForm
        v-show="isShowSpuForm"
        :visible.sync="isShowSpuForm"
        ref="spu"
        @saveSuccess="saveSuccess"
        @cancel="cancel"
      ></spuForm>
      <skuForm v-show="isShowSkuForm" :visible.sync="isShowSkuForm" ref="sku"></skuForm>
    </el-card>
  </div>
</template>

<script>
import spuForm from '@/views/product/components/spuForm'
import skuForm from '@/views/product/components/skuForm'
export default {
  name: 'SpuList',
  data() {
    return {
      skuList: [],
      dialogTableVisible: false,
      category1Id: '',
      category2Id: '',
      category3Id: '',
      isShowList: true,
      page: 1,
      limit: 3,
      total: 0,
      spuList: [],
      isShowSpuForm: false,
      isShowSkuForm: false,
    }
  },
  components: {
    spuForm,
    skuForm,
  },
  methods: {
    // 点击  添加sku
    showAddSkuForm(spu) {
      console.log(spu)
      this.isShowSkuForm = true
      // 把 spu 带过去，通过spu的id获取相应的sku
      this.$refs.sku.initAddSkuForm(spu, this.category1Id, this.category2Id)
    },

    // 点击  删除Spu
    async deleteSpu(row) {
      const result = await this.$API.spu.remove(row.id)
      if (result.code === 200) {
        this.$message.success('SPU删除成功')
        this.getSpuList(this.spuList.length > 1 ? this.page : this.page - 1)
      }
    },
    // 关闭 dialog 之前的回调
    handlebeforeclose() {
      this.skuList = [] //清空数据
      this.dialogTableVisible = false //关闭dialog
    },
    // 点击 查看所有的SKU
    async showSkuList(row) {
      this.dialogTableVisible = true
      const result = await this.$API.sku.getListBySpuId(row.id)
      if (result.code === 200) {
        this.skuList = result.data
      }
    },
    // 点击返回按钮，返回列表
    cancel() {
      // 清空数据
      this.$refs.spu.resetData()
      this.spuId = null
    },
    // 保存成功的回调
    saveSuccess() {
      // 判断是怎么返回的（添加或者修改）
      if (this.spuId) {
        // console.log(111)
        // 修改返回的
        this.getSpuList(this.page)
      } else {
        // console.log(222)
        // 添加返回的
        this.getSpuList() //添加返回的,在第一页
      }
      // 清空当前的spu组件中的所有数据
      this.$refs.spu.resetData()
      this.spuId = null
    },

    // 点击添加SPU属性  显示spuForm
    showAddSpuForm() {
      this.isShowSpuForm = true
      this.$refs.spu.initAddSpuForm(this.category3Id)
    },
    // 点击修改SPU, 显示spuFrom
    showUpdateSpuForm(spuId) {
      this.spuId = spuId //需要把spuId保存起来，作为标识  修改有spuId， 但是添加没有
      this.isShowSpuForm = true
      this.$refs.spu.initUpdateSpuForm(spuId, this.category3Id)
    },
    // 接收 2 个数据使用 { }括起来，解构
    handlerCategory({ categoryId, level }) {
      // console.log(categoryId, level)
      if (level === 1) {
        // 清空二、三级id及之前请求的attrList
        this.category2Id = ''
        this.category3Id = ''
        this.spuList = []
        this.category1Id = categoryId
      } else if (level === 2) {
        // 清空三级id及之前请求的attrList
        this.category3Id = ''
        this.spuList = []
        this.category2Id = categoryId
      } else {
        this.category3Id = categoryId
        this.getSpuList()
        // console.log(this)
      }
    },
    // 请求列表数据
    async getSpuList(page = 1) {
      this.page = page
      const result = await this.$API.spu.getList(
        this.page,
        this.limit,
        this.category3Id
      )
      if (result.code === 200) {
        //this.spuList = result.data.records
        // this.total = result.data.total
        let { total, records } = result.data
        this.spuList = records
        this.total = total
      }
    },
  },
}
</script>
