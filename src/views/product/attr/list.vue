<template>
  <div>
    <!-- <el-card> 阴影浮浅效果 -->
    <el-card>
      <CategorySelector @handlerCategory="handlerCategory" :isShowList="isShowList"></CategorySelector>
    </el-card>

    <!-- 列表分页 -->
    <el-card>
      <div v-show="isShowList">
        <!-- 按钮 -->
        <el-button type="primary" icon="el-icon-plus" @click="showAddAttr">添加属性</el-button>
        <!-- 表格 -->
        <el-table border stripe :data="attrList" style="width: 100% ; margin-top:20px">
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150"></el-table-column>
          <el-table-column label="属性值列表" width="width">
            <template slot-scope="{row,$index}">
              <el-tag
                style="margin: 2px"
                type="danger"
                v-for="(attrValue, index) in row.attrValueList"
                :key="attrValue.id"
              >{{attrValue.valueName}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{row,$index}">
              <HintButton
                type="primary"
                icon="el-icon-edit"
                size="mini"
                title="修改"
                @click="showUpdate(row)"
              ></HintButton>
              <HintButton
                type="danger"
                icon="el-icon-delete"
                size="mini"
                title="删除"
                @click="deleteAttr(row)"
              ></HintButton>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 增加和修改的页面 -->
    <el-card>
      <div v-show="!isShowList">
        <el-form :inline="true" :model="attrForm" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input v-model="attrForm.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attrForm.attrName"
          @click="addAttrValue"
        >添加属性值</el-button>
        <el-button @click="isShowList=true">取消</el-button>
        <!-- table -->

        <el-table
          :data=" attrForm.attrValueList"
          style="width: 100% ; margin-top:20px"
          border
          stripe
        >
          <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
          <el-table-column label="属性值名称" width="width">
            <template slot-scope="{row,$index}">
              <el-input
                v-model="row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
                v-if="row.isEdit"
                @blur="toLook(row)"
                @keyup.enter.native="toLook(row)"
                :ref="$index"
              ></el-input>
              <span
                v-else
                @click="toEdit(row,$index)"
                style="display:inline-block;width:100%;height:100%"
              >{{row.valueName}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template slot-scope="{row,$index}">
              <el-popconfirm
                :title="`你确认要删除${row.valueName}吗？`"
                @onConfirm="attrForm.attrValueList.splice($index,1)"
              >
                <HintButton
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="margin-top:20px">
        <el-button type="primary" @click="saveAttrList">保存</el-button>
        <el-button @click="isShowList=true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'AttrList',
  data() {
    return {
      category1Id: '',
      category2Id: '',
      category3Id: '',
      attrList: [],
      isShowList: true,
      //为true表示可编辑，显示输入框

      attrForm: {
        attrName: '',
        attrValueList: [],
        categoryId: '',
        categoryLevel: 3,
      },
    }
  },
  methods: {
    // 删除 属性  需要发请求
    deleteAttr(attr) {
      // console.log(attr)
      // console.log(attr.id)
      this.$API.attr
        .delete(attr.id)
        .then((result) => {
          if (result.code === 200) {
            this.$message.success('属性删除成功')
            // 删除成功后再次发送请求获取列表数据
            this.getAttrListInfo()
          } else {
            this.$message.danger('属性删除失败')
          }
        })
        .catch((error) => {
          this.$message.error('请求失败')
        })
    },

    // 失去焦点或按下回车，变成查看模式
    toLook(attrValue) {
      // 看输入的值有没有，没有不能变为查看模式  some() 返回值时候一个布尔值
      if (!attrValue.valueName) return
      let isRepeat = this.attrForm.attrValueList.some((item) => {
        // 除去自身
        if (item !== attrValue) {
          return item.valueName === attrValue.valueName
        }
      })

      if (isRepeat) {
        this.$message.warning('已经存在改属性值')
        attrValue.valueName = ''
        return
      }
      // 如果符合上面所有条件，更改为查看模式
      attrValue.isEdit = false
    },
    // 点击span，出现属性值的input框（可编辑模式）
    toEdit(attrValue, index) {
      attrValue.isEdit = true

      // 让对应的input框自动获取焦点，必须用 this.$nextTick()
      this.$nextTick(() => {
        this.$refs[index].focus() //index是个变量，用[]语法
      })
    },
    // 点击修改按钮  弹出修改、增加页面。则列表页隐藏
    showUpdate(attr) {
      // this.attrForm = attr
      // this.attrForm = {... attr} 浅拷贝没用，因为attrForm中有个数组attrValueList,拷贝的是地址，还是原来的数组
      // 用深拷贝
      this.attrForm = cloneDeep(attr)
      // 切换到修改和增加的界面
      this.isShowList = false
      // 点击修改，一开始出现的输入框的界面是不显示输入框的（查看模式）
      this.attrForm.attrValueList.forEach((item) => {
        // item.isEdit = false // 有问题，因为后面添的isEdit 不是响应式数据
        // 用 this.$set   this.$delete
        this.$set(item, 'isEdit', false)
      })
    },
    // 点击保存
    async saveAttrList() {
      // 拿到参数
      let attr = this.attrForm
      // 整理数据  三点：是否存在属性值，属性值是否存在空串，参数值是否有多余参数
      attr.attrValueList = attr.attrValueList.filter((item) => {
        if (item.valueName.trim() !== '') {
          delete item.isEdit
          return true
        }
      })
      
      if (attr.attrValueList.length === 0) {
        this.$message.warning('至少指定一个属性值名称')
        return
      }
      const result = await this.$API.attr.addOrUpdateAttr(attr)
      if (result.code === 200) {
        this.$message.success('保存属性成功')
        this.isShowList = true
        this.getAttrListInfo()
      } else {
        this.$message.error('保存属性失败')
      }
    },
    // 点击   添加属性
    showAddAttr() {
      // 把上次添加但取消的信息清理掉
      this.attrForm = {
        attrName: '',
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3,
      }
      this.isShowList = false
    },
    // 点击  添加属性值  按钮，给 attrForm的attrValueList增加一条数据,一个属性是一个对象
    addAttrValue() {
      this.attrForm.attrValueList.push({
        // id: '',
        attrId: this.attrForm.id,
        valueName: '',
        // 点击添加属性值  出现input框，既可编辑模式
        isEdit: true,
      })
      // 点击添加属性值，input框应自动获取焦点
      this.$nextTick(() => {
        // 新增加的属性值默认放在最后
        this.$refs[this.attrForm.attrValueList.length - 1].focus()
      })
    },
    // 接收 2 个数据使用 { }括起来，解构
    handlerCategory({ categoryId, level }) {
      // console.log(categoryId, level)
      if (level === 1) {
        // 清空二、三级id及之前请求的attrList
        this.category2Id = ''
        this.category3Id = ''
        this.attrList = []
        this.category1Id = categoryId
      } else if (level === 2) {
        // 清空三级id及之前请求的attrList
        this.category3Id = ''
        this.attrList = []
        this.category2Id = categoryId
      } else {
        this.category3Id = categoryId
        this.getAttrListInfo()
        // console.log(this)
      }
    },
    // 请求列表数据
    async getAttrListInfo() {
      let { category1Id, category2Id, category3Id } = this
      // console.log(category1Id, category2Id, category3Id)
      const result = await this.$API.attr.getAttrList(
        category1Id,
        category2Id,
        category3Id
      )
      if (result.code === 200) {
        this.attrList = result.data
        // console.log(result.data)
      }
    },
  },
}
</script>
