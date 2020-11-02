<template>
  <div>
    <el-card class="sku-list">
      <el-table :data="skuList" style="width: 100%" border stripe>
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="skuName" label="名称" width="width"></el-table-column>
        <el-table-column prop="skuDesc" label="描述" width="width"></el-table-column>
        <el-table-column prop="prop" label="默认图片" width="width">
          <template slot-scope="{row,$index}">
            <img :src="row.skuDefaultImg" alt style="width:80px" />
          </template>
        </el-table-column>
        <el-table-column prop="weight" label="重量(KG)" type="Number" width="width"></el-table-column>
        <el-table-column prop="price" label="价格(元)" type="Number" width="80"></el-table-column>
        <el-table-column prop="prop" label="操作" width="250" align="center">
          <template slot-scope="{row,$index}">
            <HintButton
              v-if="row.isSale == 0"
              title="上架"
              type="info"
              icon="el-icon-top"
              size="mini"
              @click="onSale(row.id)"
            ></HintButton>
            <HintButton
              v-if="row.isSale == 1"
              title="下架"
              type="success"
              icon="el-icon-bottom"
              size="mini"
              @click="cancelSale(row.id)"
            ></HintButton>
            <HintButton
              title="修改"
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="updateSku(row.id)"
            ></HintButton>
            <HintButton
              title="查看详情"
              type="primary"
              icon="el-icon-info"
              size="mini"
              @click="getSkuById(row.id)"
            ></HintButton>

            <el-popconfirm :title="`确定删除${row.skuName}吗？`" @onConfirm="deleteSku(row.id)">
              <HintButton
                slot="reference"
                title="删除"
                type="danger"
                icon="el-icon-delete"
                size="mini"
              ></HintButton>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        @current-change="getSkuList"
        @size-change="handleSizeChange"
        style="margin-top:20px"
        align="center"
        :current-page="page"
        :page-sizes="[5, 7, 9]"
        :page-size="limit"
        layout=" prev, pager, next, jumper,->,sizes,total"
        :total="total"
      ></el-pagination>

      <el-drawer :visible.sync="isShowSku" size="50%" :with-header="false">
        <el-row>
          <el-col :span="5">名称</el-col>
          <el-col :span="18">{{skuInfo.skuName}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="5">描述</el-col>
          <el-col :span="16">{{skuInfo.skuDesc}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="5">价格</el-col>
          <el-col :span="16">{{skuInfo.price}}</el-col>
        </el-row>

        <el-row>
          <el-col :span="5">平台属性</el-col>
          <el-col :span="16">
            <el-tag
              type="success"
              v-for="(skuAttrValue, index) in skuInfo.skuAttrValueList"
              :key="skuAttrValue.id"
            >{{skuAttrValue.attrId + '-' + skuAttrValue.valueId}}</el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">销售属性</el-col>
          <el-col :span="16">
            <el-tag
              type="success"
              v-for="(skuSaleAttrValue, index) in skuInfo.skuSaleAttrValueList"
              :key="skuSaleAttrValue.id"
            >{{skuSaleAttrValue.id + '-' + skuSaleAttrValue.saleAttrValueId}}</el-tag>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="5">商品图片</el-col>
          <el-col :span="16">
            <el-carousel class="img-carousel" height="400px" trigger="click">
              <el-carousel-item v-for="skuImage in skuInfo.skuImageList" :key="skuImage.id">
                <img :src="skuImage.imgUrl" alt />
              </el-carousel-item>
            </el-carousel>
          </el-col>
        </el-row>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SkuList',
  data() {
    return {
      skuList: [],
      page: 1,
      limit: 10,
      total: 0,
      skuInfo: {},
      isShowSku: false,
    }
  },
  mounted() {
    this.getSkuList()
  },
  methods: {
    // 改变每页的数量时调用
    handleSizeChange(limit) {
      this.limit = limit
      this.getSkuList()
    },

    // 根据SKU的id查询SKU的详细信息 {}
    async getSkuById(id) {
      this.isShowSku = true
      const result = await this.$API.sku.get(id)
      if (result.code === 200) {
        this.skuInfo = result.data
      }
    },
    //  获取SKU的分页列表 []
    async getSkuList(page = 1) {
      this.page = page
      const result = await this.$API.sku.getList(this.page, this.limit)
      if (result.code === 200) {
        this.skuList = result.data.records
        this.total = result.data.total
      }
    },

    // 下架SKU
    async cancelSale(skuId) {
      const result = await this.$API.sku.cancelSale(skuId)
      if (result.code === 200) {
        this.$message.success('下架成功')
      }
      this.getSkuList(this.page)
    },
    // 上架SKU
    onSale(skuId) {
      this.$API.sku
        .onSale(skuId)
        .then((result) => this.$message.success('下架成功'))
      this.getSkuList(this.page)
    },
    // 删除指定id的sku
    deleteSku(skuId) {
      this.$API.sku.remove(skuId).then((result) => {
        if (result.code === 200) {
          this.$message.success('删除SKU成功')
          this.getSkuList()
        } else {
          this.$message.error('删除SKU失败')
        }
      })
    },
    // 修改SKU
    updateSku(skuId) {
      this.$message.warning('待完成')
    },
  },
}
</script>

<style lang="scss" scoped>
.sku-list {
  .el-row {
    line-height: 40px;
    height: 40px;
    .el-col-5 {
      font-size: 20px;
      font-weight: bold;
      // 右对齐
      text-align: right;
      margin-right: 20px;
    }
  }
  /deep/ .img-carousel {
    // 轮播图片  高度可以直接在标签上修改
    width: 400px;
    border: 1px solid #ccc;
    img {
      width: 100%;
      height: 100%;
    }
    .el-carousel__indicator {
      button {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        display: inline-block;
        background: red;
      }
     
    }
  }
}
</style>
