import request from '@/utils/request'

const api_name = '/admin/product'

// 默认暴露
export default {
  // 获取列表属性  GET /admin/product/attrInfoList/{category1Id}/{category2Id}/{category3Id}
  getAttrList (category1Id, category2Id, category3Id) {
    return request({
      url: `${api_name}/attrInfoList/${category1Id}/${category2Id}/${category3Id}`,
      method: 'get'
    })
  },
  // 增加或修改的请求  post   /admin/product/saveAttrInfo
  addOrUpdateAttr (attr) {
    return request({
      url: `${api_name}/saveAttrInfo`,
      method: 'post',
      data: attr
    })
  },

  //删除    delete  /admin/product/deleteAttr/{attrId}
  delete (attrId) {
    return request({
      url: `${api_name}/deleteAttr/${attrId}`,
      method: 'delete'
    })
  }
}

