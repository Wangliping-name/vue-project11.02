<template>
  <div>
    <el-card>
      <el-form label-width="80px">
        <el-form-item label="SPU名称">{{spu.spuName}}</el-form-item>

        <el-form-item label="SKU名称">
          <el-input placeholder="SKU名称" v-model="skuInfo.skuName"></el-input>
        </el-form-item>

        <el-form-item label="价格">
          <el-input placeholder="SKU价格" type="number" v-model="skuInfo.price"></el-input>
        </el-form-item>

        <el-form-item label="重量(千克)">
          <el-input placeholder="SKU重量" type="number" v-model="skuInfo.weight"></el-input>
        </el-form-item>

        <el-form-item label="规格描述">
          <el-input placeholder="SKU规格描述" type="textarea" v-model="skuInfo.skuDesc"></el-input>
        </el-form-item>

        <el-form-item label="平台属性">
          <el-form :inline="true" label-width="100px">
            <el-form-item
              v-for="(attrInfo, index) in attrInfoList"
              :key="attrInfo.id"
              :label="attrInfo.attrName"
            >
              <el-select v-model="attrInfo.attrIdValueId" placeholder="请选择">
                <el-option
                  :value="attrInfo.id + ':' + attrValue.id "
                  :label="attrValue.valueName"
                  v-for="(attrValue, index) in attrInfo.attrValueList"
                  :key="attrValue.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-form-item>

        <el-form-item label="销售属性">
          <el-form :inline="true" label-width="100px">
            <el-form-item
              :label="spuSaleAttr.saleAttrName"
              v-for="(spuSaleAttr, index) in spuSaleAttrList"
              :key="spuSaleAttr.id"
            >
              <el-select v-model="spuSaleAttr.saleAttrValueId" placeholder="请选择">
                <el-option
                  v-for="(spuSaleAttrValue, index) in spuSaleAttr.spuSaleAttrValueList"
                  :key="spuSaleAttrValue.id"
                  :label="spuSaleAttrValue.saleAttrValueName"
                  :value="spuSaleAttrValue.id"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-form-item>

        <el-form-item label="图片列表">
          <el-table :data="spuImageList" @selection-change="handleSelectionChange" border>
            <el-table-column type="selection"></el-table-column>
            <el-table-column label="图片">
              <template slot-scope="{row,$index}">
                <img :src="row.imgUrl" alt />
              </template>
            </el-table-column>
            <el-table-column prop="imgName" label="名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="{row,$index}">
                <el-tag v-if="row.isDefault ==='1' " type="success">默认</el-tag>
                <el-button v-else type="primary" size="mini" @click="setDefault(row)">设为默认值</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="saveSku">保存</el-button>
          <el-button @click="back">返回</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'skuForm',
  data() {
    return {
      spu: {},
      attrInfoList: [], //获取列表属性
      spuImageList: [], //获取指定SPU的id对应的图片列表
      spuSaleAttrList: [], //获取指定SPU的id对应的销售属性列表
      selectedImageList: [], //把选中的图片组成一个数组
      skuInfo: {
        category3Id: '',
        spuId: '',
        tmId: '',

        skuDesc: '',
        skuName: '',
        price: '',
        weight: '',

        skuDefaultImg: '',
        skuAttrValueList: [], //收集整理sku平台属性值列表
        skuSaleAttrValueList: [], //收集整理销售属性值列表
        skuImageList: [], //收集整理图片列表
      },
    }
  },
  methods: {
    // 点击返回
    back() {
      // 关闭 skuForm
      this.$emit('update:visible', false)
      // 清空 sku 数据
      this.resetData()
    },
    // 点击保存
    async saveSku() {
      // 获取参数数据
      let {
        spu,
        skuInfo,
        attrInfoList,
        spuSaleAttrList,
        selectedImageList,
      } = this
      // 整理数据
      // 1、整理父组件带过来的
      skuInfo.category3Id = spu.category3Id
      skuInfo.spuId = spu.id
      skuInfo.tmId = spu.tmId

      // 2、整理不能直接收集到的
      //整理sku平台属性值列表
      skuInfo.skuAttrValueList = attrInfoList.reduce((prev, item) => {
        if (item.attrIdValueId) {
          let [attrId, valueId] = item.attrIdValueId.split(':')
          prev.push({ attrId, valueId })
        }
        return prev
        // console.log(skuInfo.skuAttrValueList)
      }, [])                                        
      // 整理sku销售属性值列表
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((prev, item) => {
        if (item.saleAttrValueId) {
          prev.push({
            saleAttrValueId: item.saleAttrValueId
          })
        }
        return prev
      }, [])
      // spuSaleAttrList.forEach((spuSaleAttr) => {
      //   if (spuSaleAttr.saleAttrValueId) {
      //     skuInfo.skuSaleAttrValueList.push({
      //        saleAttrValueId: spuSaleAttr.saleAttrValueId
      //     })
      //   }
      // })
      // 3、整理图片
      skuInfo.skuImageList = selectedImageList.map((item) => ({
        imgName: item.imgName,
        imgUrl: item.imgUrl,
        spuImgId: item.id,
        isDefault: item.isDefault,
      }))
      // console.log(selectedImageList)
      // console.log( skuInfo.skuImageList)
      // 发请求
      const result = await this.$API.sku.addUpdate(skuInfo)
      if (result.code === 200) {
        // 关闭 skuForm
        this.$emit('update:visible', false)
        // 清空 sku 数据
        this.resetData()
      }
    },
    // 清空数据
    resetData() {
      this.spu = {}
      ;(this.attrInfoList = []), //获取列表属性
        (this.spuImageList = []), //获取指定SPU的id对应的图片列表
        (this.spuSaleAttrList = []), //获取指定SPU的id对应的销售属性列表
        (this.selectedImageList = []), //把选中的图片组成一个数组
        (this.skuInfo = {
          category3Id: '',
          spuId: '',
          tmId: '',
          skuName: '',
          price: '',
          weight: '',
          skuDesc: '',
          skuDefaultImg: '',
          skuAttrValueList: [], //收集整理sku平台属性值列表
          skuSaleAttrValueList: [], //收集整理销售属性值列表
          skuImageList: [], //收集整理图片列表
        })
    },

    // 点击默认图片，变成默认
    setDefault(row) {
      console.log(row.isDefault)
      // 排它思想
      // 将所有图片指定为非默认的
      this.spuImageList.forEach((item) => (item.isDefault = '0'))
      // 将当前指定的图片设置为默认的
      row.isDefault = '1'

      // 保存默认图片路径
      this.skuInfo.skuDefaultImg = row.imgUrl
    },

    // 把选中的图片组成一个数组
    handleSelectionChange(val) {
      this.selectedImageList = val
    },
    // 点击 添加Sku，发3个请求，获取初始数据
    async initAddSkuForm(spu, category1Id, category2Id) {
      // 保存spu
      this.spu = spu
      // console.log(spu)
      //  console.log(spu.id)
      //  console.log(spu.category3Id)
      // /admin/product/attrInfoList/2/13/61   获取列表属性
      let promise1 = this.$API.attr.getAttrList(
        category1Id,
        category2Id,
        spu.category3Id
      )
      // /admin/product/spuImageList/824  获取指定SPU的id对应的图片列表
      let promise2 = this.$API.sku.getSpuImageList(spu.id)
      // /admin/product/spuSaleAttrList/824  获取指定SPU的id对应的销售属性列表
      let promise3 = this.$API.sku.getSpuSaleAttrList(spu.id)
      const result = await Promise.all([promise1, promise2, promise3])
      this.attrInfoList = result[0].data
      let spuImageList = result[1].data
      spuImageList.forEach((item) => (item.isDefault = '0'))
      this.spuImageList = spuImageList
      this.spuSaleAttrList = result[2].data
    },
  },
}
</script>

<style lang="less" scoped>
</style>
