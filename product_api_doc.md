# 商品管理模块API文档

## 目录
- [商品基础模块](#商品基础模块)
- [商品收藏模块](#商品收藏模块)
- [商品图片模块](#商品图片模块)
- [商品举报模块](#商品举报模块)
- [商品交易方式模块](#商品交易方式模块)

## 商品基础模块

### 1. 添加商品

**接口名称:** 添加商品

**接口地址:** `/product/add`

**接口方法:** POST

**接口权限:** 需要用户登录

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| title | String | 是 | 商品标题 |
| description | String | 是 | 商品描述 |
| price | Double | 是 | 商品售价 |
| originalPrice | Double | 是 | 商品原价 |
| categoryId | Integer | 是 | 商品分类ID |
| conditionLevel | Integer | 是 | 商品新旧程度(1-10) |
| location | String | 是 | 商品所在地 |

**请求示例:**

```json
{
    "title": "iPhone 12",
    "description": "95新iPhone12",
    "price": 3999.00,
    "originalPrice": 5999.00,
    "categoryId": 1,
    "conditionLevel": 9,
    "location": "北京市"
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
        "productId": 1,
        "title": "iPhone 12",
        "description": "95新iPhone12",
        "price": 3999.00,
        "originalPrice": 5999.00,
        "categoryId": 1,
        "conditionLevel": 9,
        "status": 1,
        "location": "北京市"
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

**注意事项:**
- 需要用户登录后才能添加商品
- 商品新旧程度的范围为1-10，10表示全新
- 添加商品成功后会返回商品的ID和详细信息

### 2. 获取商品详情

**接口名称:** 获取商品详情

**接口地址:** `/product/detail/{productId}`

**接口方法:** GET

**接口权限:** 无需登录

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |

**成功响应:**

```json
{
    "code": 0,
    "data": {
        "productId": 1,
        "title": "iPhone 12",
        "description": "95新iPhone12",
        "price": 3999.00,
        "originalPrice": 5999.00,
        "categoryId": 1,
        "conditionLevel": 9,
        "status": 1,
        "location": "北京市",
        "viewCount": 100,
        "createdTime": "2025-04-14 10:00:00"
    },
    "message": "success"
}
```

**失败响应:**

```json
{
    "code": 40400,
    "data": null,
    "message": "商品不存在"
}
```

**注意事项:**
- 该接口不需要用户登录即可访问
- 每次访问商品详情，商品的浏览量会增加

### 3. 更新商品信息

**接口名称:** 更新商品信息

**接口地址:** `/product/update`

**接口方法:** PUT

**接口权限:** 需要用户登录，且只能更新自己发布的商品

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |
| title | String | 否 | 商品标题 |
| description | String | 否 | 商品描述 |
| price | Double | 否 | 商品售价 |
| originalPrice | Double | 否 | 商品原价 |
| categoryId | Integer | 否 | 商品分类ID |
| conditionLevel | Integer | 否 | 商品新旧程度(1-10) |
| location | String | 否 | 商品所在地 |

**请求示例:**

```json
{
    "productId": 1,
    "title": "iPhone 12 Pro",
    "price": 4999.00
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
        "productId": 1,
        "title": "iPhone 12 Pro",
        "price": 4999.00,
        "status": 1
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
    "message": "无权操作此商品"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "商品不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能更新自己发布的商品
- 可以只更新部分字段，不需要传递所有字段
- 商品状态无法通过此接口修改

### 4. 删除商品

**接口名称:** 删除商品

**接口地址:** `/product/delete/{productId}`

**接口方法:** DELETE

**接口权限:** 需要用户登录，且只能删除自己发布的商品

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": "商品删除成功",
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
    "message": "无权删除此商品"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "商品不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能删除自己发布的商品
- 删除商品后无法恢复
- 如果商品已有订单，可能无法直接删除

## 商品收藏模块

### 1. 收藏商品

**接口名称:** 收藏商品

**接口地址:** `/product/favorite/add`

**接口方法:** POST

**接口权限:** 需要用户登录

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |

**请求示例:**

```json
{
    "productId": 1
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
        "favoriteId": 1,
        "productId": 1,
        "userId": 1,
        "createdTime": "2025-04-14 10:00:00"
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
    "code": 40400,
    "data": null,
    "message": "商品不存在"
}
```

```json
{
    "code": 40001,
    "data": null,
    "message": "已收藏过该商品"
}
```

**注意事项:**
- 需要用户登录
- 同一用户不能重复收藏同一商品
- 用户不能收藏自己发布的商品

### 2. 取消收藏商品

**接口名称:** 取消收藏商品

**接口地址:** `/product/favorite/{productId}`

**接口方法:** DELETE

**接口权限:** 需要用户登录

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": "取消收藏成功",
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
    "code": 40400,
    "data": null,
    "message": "收藏记录不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能取消自己的收藏记录

### 3. 获取收藏列表

**接口名称:** 获取收藏列表

**接口地址:** `/product/favorite/list`

**接口方法:** GET

**接口权限:** 需要用户登录

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
            "favoriteId": 1,
            "productId": 1,
            "productTitle": "iPhone 12",
            "productPrice": 3999.00,
            "createdTime": "2025-04-14 10:00:00"
        }
    ],
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

**注意事项:**
- 需要用户登录
- 返回的是当前登录用户的收藏列表
- 返回结果按照收藏时间倒序排列

## 商品图片模块

### 1. 添加商品图片

**接口名称:** 添加商品图片

**接口地址:** `/product/image/add`

**接口方法:** POST

**接口权限:** 需要用户登录，且只能为自己的商品添加图片

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |
| imageUrl | String | 是 | 图片URL地址 |
| isMain | Integer | 是 | 是否为主图(1-是，0-否) |
| sortOrder | Integer | 否 | 排序序号(数字越小越靠前) |

**请求示例:**

```json
{
    "productId": 1,
    "imageUrl": "http://example.com/images/1.jpg",
    "isMain": 1,
    "sortOrder": 0
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
        "imageId": 1,
        "productId": 1,
        "imageUrl": "http://example.com/images/1.jpg",
        "isMain": 1,
        "sortOrder": 0
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
    "message": "无权为此商品添加图片"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "商品不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能为自己发布的商品添加图片
- 若设置为主图，原有主图会自动变为非主图
- 图片URL需要先上传到图片服务器获取，此接口只保存URL

### 2. 删除商品图片

**接口名称:** 删除商品图片

**接口地址:** `/product/image/{productId}/{imageId}`

**接口方法:** DELETE

**接口权限:** 需要用户登录，且只能删除自己商品的图片

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |
| imageId | Integer | 是 | 图片ID |

**请求头:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**成功响应:**

```json
{
    "code": 0,
    "data": "图片删除成功",
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
    "message": "无权删除此图片"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "图片不存在"
}
```

**注意事项:**
- 需要用户登录
- 只能删除自己商品的图片
- 删除主图后，系统会自动将排序最靠前的图片设为主图
- 商品至少需要保留一张图片，不能删除全部图片

## 商品举报模块

### 1. 举报商品

**接口名称:** 举报商品

**接口地址:** `/product/report/add`

**接口方法:** POST

**接口权限:** 需要用户登录

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |
| reportType | Integer | 是 | 举报类型(1-虚假宣传,2-违禁品,3-诈骗,4-其他) |
| reportContent | String | 是 | 举报内容 |

**请求示例:**

```json
{
    "productId": 1,
    "reportType": 1,
    "reportContent": "商品涉嫌虚假宣传"
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
        "reportId": 1,
        "productId": 1,
        "reportType": 1,
        "reportContent": "商品涉嫌虚假宣传",
        "status": 0,
        "createdTime": "2025-04-14 10:00:00"
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
    "code": 40400,
    "data": null,
    "message": "商品不存在"
}
```

```json
{
    "code": 40001,
    "data": null,
    "message": "不能举报自己的商品"
}
```

**注意事项:**
- 需要用户登录
- 用户不能举报自己的商品
- 举报提交后状态为待处理(status=0)
- 同一用户对同一商品在短时间内多次举报可能会被限制

### 2. 获取商品举报列表

**接口名称:** 获取商品举报列表

**接口地址:** `/product/report/list/{productId}`

**接口方法:** GET

**接口权限:** 需要管理员权限

**路径参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| productId | Integer | 是 | 商品ID |

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
            "reportId": 1,
            "productId": 1,
            "reportType": 1,
            "reportContent": "商品涉嫌虚假宣传",
            "status": 0,
            "createdTime": "2025-04-14 10:00:00"
        }
    ],
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
    "message": "无权访问"
}
```

```json
{
    "code": 40400,
    "data": null,
    "message": "商品不存在"
}
```

**注意事项:**
- 需要管理员权限
- 返回指定商品的所有举报记录
- 举报状态：0-待处理，1-已处理，2-已驳回

## 商品交易方式模块

### 1. 添加交易方式

**接口名称:** 添加交易方式

**接口地址:** `/product/trade/method/add`

**接口方法:** POST

**接口权限:** 需要管理员权限

**请求参数:**

| 参数名 | 类型 | 是否必须 | 说明 |
| ------ | ---- | -------- | ---- |
| methodName | String | 是 | 交易方式名称 |
| methodDesc | String | 是 | 交易方式描述 |

**请求示例:**

```json
{
    "methodName": "上门回收",
    "methodDesc": "由回收人员上门进行商品回收交易"
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
        "methodId": 1,
        "methodName": "上门回收",
        "methodDesc": "由回收人员上门进行商品回收交易"
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
    "message": "无权添加交易方式"
}
```

```json
{
    "code": 40001,
    "data": null,
    "message": "交易方式已存在"
}
```

**注意事项:**
- 需要管理员权限
- 交易方式名称不能重复
- 添加后的交易方式对所有商品有效 