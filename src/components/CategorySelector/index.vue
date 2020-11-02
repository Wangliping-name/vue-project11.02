<template>
  <el-form :inline="true" :model="cateForm" class="demo-form-inline" :disabled="!isShowList">
    <el-form-item label="一级类别">
      <el-select v-model="cateForm.category1Id" placeholder="选择一级类别" @change="handlerC1">
        <el-option
          v-for="(cate1, index) in category1List"
          :key="cate1.id"
          :label="cate1.name"
          :value="cate1.id"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="二级类别">
      <el-select v-model="cateForm.category2Id" placeholder="选择二级类别" @change="handlerC2">
        <el-option
          v-for="(cate2, index) in category2List"
          :key="cate2.id"
          :value="cate2.id"
          :label="cate2.name"
        ></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="三级类别">
      <el-select v-model="cateForm.category3Id" placeholder="选择三级类别" @change="handlerC3">
        <el-option
          v-for="(cate3, index) in category3List"
          :key="cate3.id"
          :value="cate3.id"
          :label="cate3.name"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: 'CategorySelector',
  props:['isShowList'],
  data() {
    return {
      // 为了收集选择的类别id
      cateForm: {
        category1Id: '',
        category2Id: '',
        category3Id: '',
      },
      // 存储请求回来后的数据
      category1List: [],
      category2List: [],
      category3List: [],
    }
  },
  mounted() {
    this.getCategorys1List()
  },
  methods: {
    // 发请求获得一级分类列表的数据
    async getCategorys1List() {
      const result = await this.$API.category.getCategorys1()
      if (result.code === 200) {
        this.category1List = result.data
        // console.log(category1List)
      }
    },
    // 选一级分类，触发二级分类列表,请求获取数据
    async handlerC1(category1Id) {
      // 再次选择一个分类，应该把二、三级的分类相关的清空
      this.cateForm.category2Id = ''
      this.cateForm.category3Id = ''
      this.category2List = []
      this.category3List = []
      // 向父元素传递选中的一级id
      this.$emit('handlerCategory', { categoryId: category1Id, level: 1 })
      const result = await this.$API.category.getCategorys2(category1Id)
      if (result.code === 200) {
        this.category2List = result.data
      }
    },
    // 选二级分类，触发三级分类列表，请求获取数据
    handlerC2(category2Id) {
      // 再次触发二级分类，应该清空三级分类相关的
      this.cateForm.category3Id = ''
      this.category3List = []
      // 向父元素传递选中的二级id
      this.$emit('handlerCategory', { categoryId: category2Id, level: 2 })
      this.$API.category
        .getCategorys3(category2Id)
        .then((req) => {
          if (req.code === 200) {
            this.category3List = req.data
          }
        })
        .catch((error) => {
          console.log(new Error('请求失败'))
        })
    },
    //点击三级分类，传给父组件，展示数据
    handlerC3(category3Id) {
      // 给 id 一个标识，让父通过level知道传的是哪一级的id
      this.$emit('handlerCategory', { categoryId: category3Id, level: 3 })
    },
  },
}
</script>

<style>
</style>