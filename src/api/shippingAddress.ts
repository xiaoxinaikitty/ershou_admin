import request from '@/utils/request'

/**
 * 删除发货地址
 * @param addressId 地址ID
 */
export function deleteShippingAddress(addressId: number) {
  return request({
    url: `/shipping/address/delete/${addressId}`,
    method: 'delete'
  })
} 