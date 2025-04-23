# 订单管理模块API文档

## 目录
- [订单基础模块](#订单基础模块)

## 订单基础模块

### 1. 创建订单

**接口名称:** 创建订单

**接口地址:** `/order/create`

**接口方法:** POST

**接口权限:** 需要用户登录

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |
| sellerId | Integer | 是 | 卖家用户ID |
| paymentType | Integer | 是 | 支付方式(1-在线支付,2-货到付款) |
| deliveryType | Integer | 是 | 配送方式(1-自提,2-快递) |
| orderAmount | Double | 是 | 订单金额 |
| paymentAmount | Double | 是 | 实付金额 |
| deliveryFee | Double | 否 | 运费 |
| remark | String | 否 | 订单备注 |
| address | Object | 是 | 收货地址信息 |
| address.receiverName | String | 是 | 收货人姓名 |
| address.receiverPhone | String | 是 | 收货人电话 |
| address.province | String | 是 | 省份 |
| address.city | String | 是 | 城市 |
| address.district | String | 是 | 区/县 |
| address.detailAddress | String | 是 | 详细地址 |

**请求示例:**

```json
{
    "productId": 3,
    "sellerId": 2,
    "paymentType": 1,
    "deliveryType": 2,
    "orderAmount": 3999.00,
    "paymentAmount": 3999.00,
    "deliveryFee": 15.00,
    "remark": "希望尽快发货",
    "address": {
        "receiverName": "张三",
        "receiverPhone": "13800138000",
        "province": "北京市",
        "city": "北京市",
        "district": "海淀区",
        "detailAddress": "中关村大街1号"
    }
}
```

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": {
        "orderId": 1,
        "orderNo": "202504141528120123456",
        "userId": 1,
        "sellerId": 2,
        "productId": 3,
        "productTitle": "iPhone 12",
        "orderAmount": 3999.00,
        "paymentAmount": 3999.00,
        "orderStatus": 0,
        "paymentType": 1,
        "deliveryType": 2,
        "deliveryFee": 15.00,
        "remark": "希望尽快发货",
        "createdTime": "2025-04-14 15:28:12",
        "address": {
            "receiverName": "张三",
            "receiverPhone": "13800138000",
            "province": "北京市",
            "city": "北京市",
            "district": "海淀区",
            "detailAddress": "中关村大街1号"
        }
    },
    "message": "success"
}
```

**失败响应:**

```json
{
    "code": 40100,
    "data": null,
    "message": "用户未登录"
}
```

```json
{
    "code": 40001,
    "data": null,
    "message": "参数不完整"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "商品不存在或已下架"
}
```

```json
{
    "code": 40000,
    "data": null,
    "message": "无法购买自己发布的商品"
}
```

**注意事项:**
- 需要用户登录
- 不能购买自己发布的商品
- 创建订单成功后，订单状态为待付款(orderStatus=0)
- 创建订单会自动生成订单编号(orderNo)
- 订单创建后，需要在一定时间内完成支付，否则订单会自动取消

### 2. 获取订单列表

**接口名称:** 获取订单列表

**接口地址:** `/order/list`

**接口方法:** GET

**接口权限:** 需要用户登录

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| status | Integer | 否 | 订单状态(0-待付款,1-待发货,2-待收货,3-已完成,4-已取消,5-售后中) |
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": [
        {
            "orderId": 1,
            "orderNo": "202504141528120123456",
            "userId": 1,
            "sellerId": 2,
            "productId": 3,
            "productTitle": "iPhone 12",
            "orderAmount": 3999.00,
            "paymentAmount": 3999.00,
            "orderStatus": 0,
            "paymentType": 1,
            "deliveryType": 2,
            "deliveryFee": 15.00,
            "remark": "希望尽快发货",
            "createdTime": "2025-04-14 15:28:12",
            "address": {
                "receiverName": "张三",
                "receiverPhone": "13800138000",
                "province": "北京市",
                "city": "北京市",
                "district": "海淀区",
                "detailAddress": "中关村大街1号"
            }
        }
        // 更多订单...
    ],
    "message": "success",
    "total": 15,
    "pageNum": 1,
    "pageSize": 10
}
```

**失败响应:**

```json
{
    "code": 40100,
    "data": null,
    "message": "用户未登录"
}
```

**注意事项:**
- 需要用户登录
- 默认返回所有状态的订单
- 如果指定了status参数，则只返回特定状态的订单
- 返回的订单按照创建时间倒序排列
- 分页参数可选，默认每页10条数据

### 3. 取消订单

**接口名称:** 取消订单

**接口地址:** `/order/cancel/{orderId}`

**接口方法:** POST

**接口权限:** 需要用户登录，且只能取消自己的订单

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| orderId | Integer | 是 | 订单ID |

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": "订单取消成功",
    "message": "success"
}
```

**失败响应:**

```json
{
    "code": 40100,
    "data": null,
    "message": "用户未登录"
}
```

```json
{
    "code": 40300,
    "data": null,
    "message": "您无权取消此订单"
}
```

```json
{
    "code": 40000,
    "data": null,
    "message": "只能取消待付款的订单"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "订单不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能取消自己的订单
- 只能取消待付款(status=0)状态的订单
- 订单取消后状态变为已取消(status=4)
- 订单取消后，相关商品库存会自动恢复

### 4. 订单支付

**接口名称:** 订单支付

**接口地址:** `/order/pay/{orderId}`

**接口方法:** POST

**接口权限:** 需要用户登录，且只能支付自己的订单

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| orderId | Integer | 是 | 订单ID |

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| payMethod | Integer | 是 | 支付方式(1-支付宝,2-微信,3-银行卡) |
| payAccount | String | 否 | 支付账号，银行卡支付时必填 |

**请求示例:**

```json
{
    "payMethod": 2
}
```

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": {
        "paymentId": 1,
        "orderId": 1,
        "paymentAmount": 3999.00,
        "paymentMethod": 2,
        "paymentStatus": 1,
        "paymentTime": "2025-04-14 15:35:22"
    },
    "message": "支付成功"
}
```

**失败响应:**

```json
{
    "code": 40100,
    "data": null,
    "message": "用户未登录"
}
```

```json
{
    "code": 40300,
    "data": null,
    "message": "您无权支付此订单"
}
```

```json
{
    "code": 40000,
    "data": null,
    "message": "只能支付待付款状态的订单"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "订单不存在"
}
```

```json
{
    "code": 50000,
    "data": null,
    "message": "支付失败，请稍后重试"
}
```

**注意事项:**
- 需要用户登录
- 只能支付自己的订单
- 只能支付待付款(status=0)状态的订单
- 支付成功后，订单状态变为待发货(status=1)
- 实际项目中，通常会对接第三方支付平台

### 5. 确认收货

**接口名称:** 确认收货

**接口地址:** `/order/confirm/{orderId}`

**接口方法:** POST

**接口权限:** 需要用户登录，且只能确认自己的订单

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| orderId | Integer | 是 | 订单ID |

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": "确认收货成功",
    "message": "success"
}
```

**失败响应:**

```json
{
    "code": 40100,
    "data": null,
    "message": "用户未登录"
}
```

```json
{
    "code": 40300,
    "data": null,
    "message": "您无权操作此订单"
}
```

```json
{
    "code": 40000,
    "data": null,
    "message": "只能确认待收货状态的订单"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "订单不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能确认自己的订单
- 只能确认待收货(status=2)状态的订单
- 确认收货后，订单状态变为已完成(status=3)
- 确认收货后，卖家账户会收到相应货款

### 6. 获取订单详情

**接口名称:** 获取订单详情

**接口地址:** `/order/detail/{orderId}`

**接口方法:** GET

**接口权限:** 需要用户登录，且只能查看自己的订单或作为卖家的订单

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| orderId | Integer | 是 | 订单ID |

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": {
        "orderId": 1,
        "orderNo": "202504141528120123456",
        "userId": 1,
        "sellerId": 2,
        "sellerName": "李四",
        "productId": 3,
        "productTitle": "iPhone 12",
        "productImage": "http://example.com/images/iphone12.jpg",
        "orderAmount": 3999.00,
        "paymentAmount": 3999.00,
        "orderStatus": 2,
        "paymentType": 1,
        "deliveryType": 2,
        "deliveryFee": 15.00,
        "deliveryInfo": {
            "expressCompany": "顺丰速运",
            "expressNo": "SF1234567890",
            "deliveryTime": "2025-04-15 10:30:00"
        },
        "paymentInfo": {
            "paymentId": 1,
            "paymentMethod": 2,
            "paymentTime": "2025-04-14 15:35:22"
        },
        "remark": "希望尽快发货",
        "createdTime": "2025-04-14 15:28:12",
        "updateTime": "2025-04-15 10:30:00",
        "address": {
            "receiverName": "张三",
            "receiverPhone": "13800138000",
            "province": "北京市",
            "city": "北京市",
            "district": "海淀区",
            "detailAddress": "中关村大街1号"
        }
    },
    "message": "success"
}
```

**失败响应:**

```json
{
    "code": 40100,
    "data": null,
    "message": "用户未登录"
}
```

```json
{
    "code": 40300,
    "data": null,
    "message": "您无权查看此订单"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "订单不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能查看自己下的订单或自己作为卖家的订单
- 订单详情包含完整的订单信息，包括商品、支付、物流、地址等详细信息

### 7. 发货

**接口名称:** 发货

**接口地址:** `/order/ship/{orderId}`

**接口方法:** POST

**接口权限:** 需要用户登录，且只能为自己作为卖家的订单发货

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| orderId | Integer | 是 | 订单ID |

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| expressCompany | String | 是 | 快递公司名称 |
| expressNo | String | 是 | 快递单号 |

**请求示例:**

```json
{
    "expressCompany": "顺丰速运",
    "expressNo": "SF1234567890"
}
```

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": {
        "orderId": 1,
        "orderStatus": 2,
        "deliveryInfo": {
            "expressCompany": "顺丰速运",
            "expressNo": "SF1234567890",
            "deliveryTime": "2025-04-15 10:30:00"
        }
    },
    "message": "发货成功"
}
```

**失败响应:**

```json
{
    "code": 40100,
    "data": null,
    "message": "用户未登录"
}
```

```json
{
    "code": 40300,
    "data": null,
    "message": "您无权操作此订单"
}
```

```json
{
    "code": 40000,
    "data": null,
    "message": "只能为待发货状态的订单发货"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "订单不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能为自己作为卖家的订单发货
- 只能为待发货(status=1)状态的订单发货
- 发货后，订单状态变为待收货(status=2)
- 发货信息会通知到买家 