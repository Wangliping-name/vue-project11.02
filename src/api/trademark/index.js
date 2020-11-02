import request from '@/utils/request'

const api_name = '/admin/product'

// 默认暴露
export default {
  // 获取品牌分页列表  /admin/product/baseTrademark/{page}/{limit}
  getPageList (page, limit) {
    return request({
      url: `${api_name}/baseTrademark/${page}/${limit}`,
      method: 'get',
    })
  },

  // 获取增加或修改品牌  
  //  修改：put请求   / admin / product /baseTrademark/update  有id
  // 增加：post请求   /admin/product/baseTrademark/save           没有id
  addOrUpdataTrademark (trademark) {
    // 判断是否存在id
    if (trademark.id) {
      // 修改  put 请求
      return request({
        url: `${api_name}/baseTrademark/update`,
        method: 'put',
        data: trademark
      })
    } else {
      // 增加  post请求
      return request({
        url: `${api_name}/baseTrademark/save `,
        method: 'post',
        data: trademark
      })
    }
  },

  // 删除 /admin/product/baseTrademark/remove/{id}
  deleteTrademark (id) {
    return request({
      url: `${api_name}/baseTrademark/remove/${id}`,
      method: 'delete',
    })
  },

  // 获取所有品牌列表数据   /admin/product/baseTrademark/getTrademarkList
  getAllTrademarkList () {
    return request({
      url: `${api_name}/baseTrademark/getTrademarkList`,
      method:'get'

    })
  }



}
