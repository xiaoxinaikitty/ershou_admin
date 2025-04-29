# 商品模块接口文档

## 目录
- [添加发布商品位置](#添加发布商品位置)
- [分页查询商品列表](#分页查询商品列表)
- [用户发布商品列表](#用户发布商品列表)

## 添加发布商品位置

### 接口名称
添加发布商品位置

### 接口描述
添加发布商品时选择的位置信息(省市区)，插入到数据库中，并返回插入记录的ID

### 接口地址
`/product/location/add`

### 请求方法
POST

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名     | 类型   | 必填 | 说明     | 示例        |
|-----------|-------|------|----------|------------|
| province  | String | 是   | 省份名称  | 广东省      |
| city      | String | 是   | 城市名称  | 深圳市      |
| district  | String | 是   | 区/县名称 | 南山区      |

**请求示例**
```json
{
  "province": "广东省",
  "city": "深圳市",
  "district": "南山区"
}
```

### 响应参数

| 参数名            | 类型    | 说明                 |
|------------------|--------|---------------------|
| code             | int    | 状态码，0表示成功      |
| message          | String | 响应消息             |
| data             | Object | 返回数据对象          |
| data.id          | int    | 位置记录ID           |
| data.province    | String | 省份名称             |
| data.city        | String | 城市名称             |
| data.district    | String | 区/县名称            |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区"
  }
}
```

**失败响应示例**
```json
{
  "code": 40000,
  "message": "请求参数错误",
  "data": null
}
```

### 接口注意事项
- 需要用户登录后访问此接口
- 此接口适用于发布商品时添加商品所在位置信息
- 返回的位置记录ID可用于商品表的location字段

### 接口权限
- 需要用户登录

## 分页查询商品列表

### 接口名称
分页查询商品列表

### 接口描述
分页获取商品列表，支持多种筛选条件和排序方式

### 接口地址
`/product/list`

### 请求方法
GET

### 请求参数

| 参数名          | 类型    | 必填 | 说明                                          | 示例        |
|----------------|--------|------|----------------------------------------------|------------|
| pageNum        | int    | 否   | 当前页码，从1开始，默认1                        | 1          |
| pageSize       | int    | 否   | 每页数量，默认10，最大50                        | 10         |
| keyword        | String | 否   | 商品标题关键词搜索                              | iPhone     |
| categoryId     | int    | 否   | 商品分类ID筛选                                 | 2          |
| minPrice       | double | 否   | 价格下限筛选                                   | 1000       |
| maxPrice       | double | 否   | 价格上限筛选                                   | 5000       |
| sortField      | String | 否   | 排序字段(price-价格, time-时间, view-浏览量)，默认time | price |
| sortOrder      | String | 否   | 排序方式(asc-升序, desc-降序)，默认desc          | asc        |
| status         | int    | 否   | 商品状态筛选(0下架 1在售 2已售)，默认1            | 1          |
| minConditionLevel | int | 否   | 最低成色等级筛选(1-10)                          | 8          |
| location       | String | 否   | 地区筛选                                       | 广东省深圳市 |
| sellerId       | long   | 否   | 卖家用户ID筛选                                 | 123        |

**请求示例**
```
GET /product/list?pageNum=1&pageSize=10&categoryId=2&minPrice=1000&maxPrice=5000&sortField=price&sortOrder=asc
```

### 响应参数

| 参数名             | 类型    | 说明                 |
|-------------------|--------|---------------------|
| code              | int    | 状态码，0表示成功      |
| message           | String | 响应消息             |
| data              | Object | 分页结果数据对象      |
| data.pageNum      | int    | 当前页码             |
| data.pageSize     | int    | 每页大小             |
| data.total        | long   | 总记录数             |
| data.pages        | int    | 总页数               |
| data.list         | Array  | 当前页商品列表        |
| data.hasPrevious  | boolean| 是否有上一页          |
| data.hasNext      | boolean| 是否有下一页          |

**商品列表项字段说明**

| 字段名          | 类型      | 说明                 |
|----------------|----------|---------------------|
| productId      | long     | 商品ID               |
| title          | String   | 商品标题              |
| price          | decimal  | 商品价格              |
| originalPrice  | decimal  | 商品原价              |
| categoryId     | int      | 分类ID               |
| categoryName   | String   | 分类名称              |
| userId         | long     | 发布用户ID            |
| username       | String   | 发布用户名            |
| conditionLevel | int      | 物品成色(1-10级)      |
| location       | String   | 商品所在地            |
| viewCount      | int      | 浏览次数              |
| createdTime    | datetime | 发布时间              |
| mainImageUrl   | String   | 商品主图URL           |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "pageNum": 1,
    "pageSize": 10,
    "total": 150,
    "pages": 15,
    "list": [
      {
        "productId": 101,
        "title": "二手iPhone 12 Pro Max 256G",
        "price": 5800.00,
        "originalPrice": 9599.00,
        "categoryId": 2,
        "categoryName": "手机数码",
        "userId": 1001,
        "username": "zhangsan",
        "conditionLevel": 8,
        "location": "广东省深圳市南山区",
        "viewCount": 235,
        "createdTime": "2023-08-01T15:30:45.000+08:00",
        "mainImageUrl": "https://example.com/images/products/iphone12.jpg"
      },
      {
        "productId": 102,
        "title": "联想拯救者Y7000P 游戏本",
        "price": 6500.00,
        "originalPrice": 8999.00,
        "categoryId": 3,
        "categoryName": "电脑办公",
        "userId": 1002,
        "username": "lisi",
        "conditionLevel": 9,
        "location": "广东省深圳市南山区",
        "viewCount": 188,
        "createdTime": "2023-07-30T10:15:22.000+08:00",
        "mainImageUrl": "https://example.com/images/products/lenovo.jpg"
      }
    ],
    "hasPrevious": false,
    "hasNext": true
  }
}
```

**失败响应示例**
```json
{
  "code": 40000,
  "message": "请求参数错误",
  "data": null
}
```

### 接口注意事项
- 支持多种筛选条件组合查询
- 支持按价格、发布时间、浏览量进行排序
- 默认返回在售状态的商品

### 接口权限
- 无需权限，所有人可访问

## 用户发布商品列表

### 接口名称
用户发布商品列表

### 接口描述
查询当前登录用户发布的所有商品列表，支持分页和状态筛选

### 接口地址
`/product/my-list`

### 请求方法
GET

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名     | 类型    | 必填 | 说明                                        | 示例     |
|-----------|--------|------|-------------------------------------------|----------|
| pageNum   | int    | 否   | 当前页码，从1开始，默认1                      | 1        |
| pageSize  | int    | 否   | 每页数量，默认10，最大50                      | 10       |
| status    | int    | 否   | 商品状态筛选(0下架 1在售 2已售)，不传则查询全部状态 | 1       |
| keyword   | String | 否   | 商品标题关键词搜索                            | iPhone   |
| sortField | String | 否   | 排序字段(price-价格, time-时间, view-浏览量)，默认time | time |
| sortOrder | String | 否   | 排序方式(asc-升序, desc-降序)，默认desc        | desc     |

**请求示例**
```
GET /product/my-list?pageNum=1&pageSize=10&status=1&sortField=time&sortOrder=desc
```

### 响应参数

| 参数名             | 类型    | 说明                 |
|-------------------|--------|---------------------|
| code              | int    | 状态码，0表示成功      |
| message           | String | 响应消息             |
| data              | Object | 分页结果数据对象      |
| data.pageNum      | int    | 当前页码             |
| data.pageSize     | int    | 每页大小             |
| data.total        | long   | 总记录数             |
| data.pages        | int    | 总页数               |
| data.list         | Array  | 当前页商品列表        |
| data.hasPrevious  | boolean| 是否有上一页          |
| data.hasNext      | boolean| 是否有下一页          |

**商品列表项字段说明**

| 字段名          | 类型      | 说明                      |
|----------------|----------|--------------------------|
| productId      | long     | 商品ID                    |
| title          | String   | 商品标题                   |
| price          | decimal  | 商品价格                   |
| originalPrice  | decimal  | 商品原价                   |
| categoryId     | int      | 分类ID                    |
| categoryName   | String   | 分类名称                   |
| conditionLevel | int      | 物品成色(1-10级)           |
| location       | String   | 商品所在地                 |
| viewCount      | int      | 浏览次数                   |
| status         | int      |  (0下架 1在售 2已售)  |
| statusText     | String   | 商品状态文本描述            |
| createdTime    | datetime | 发布时间                   |
| mainImageUrl   | String   | 商品主图URL                |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "pageNum": 1,
    "pageSize": 10,
    "total": 25,
    "pages": 3,
    "list": [
      {
        "productId": 123,
        "title": "二手iPhone 12 Pro Max 256G",
        "price": 5800.00,
        "originalPrice": 9599.00,
        "categoryId": 2,
        "categoryName": "手机数码",
        "conditionLevel": 8,
        "location": "广东省深圳市南山区",
        "viewCount": 235,
        "status": 1,
        "statusText": "在售",
        "createdTime": "2023-08-01T15:30:45.000+08:00",
        "mainImageUrl": "https://example.com/images/products/iphone12.jpg"
      },
      {
        "productId": 124,
        "title": "联想拯救者Y7000P 游戏本",
        "price": 6500.00,
        "originalPrice": 8999.00,
        "categoryId": 3,
        "categoryName": "电脑办公",
        "conditionLevel": 9,
        "location": "广东省深圳市南山区",
        "viewCount": 188,
        "status": 1,
        "statusText": "在售",
        "createdTime": "2023-07-30T10:15:22.000+08:00",
        "mainImageUrl": "https://example.com/images/products/lenovo.jpg"
      }
    ],
    "hasPrevious": false,
    "hasNext": true
  }
}
```

**失败响应示例**
```json
{
  "code": 40100,
  "message": "用户未登录",
  "data": null
}
```

### 接口注意事项
- 需要用户登录后访问此接口
- 此接口仅返回当前登录用户发布的商品
- status参数不传时，返回所有状态的商品
- 分页查询结果按创建时间降序排列

### 接口权限
- 需要用户登录


# 举报商品接口
## 接口信息
- **接口名称**：举报商品
- **请求路径**：`/product/report/add`
- **请求方法**：POST
- **接口权限**：需要用户登录

## 请求头
Authorization: Bearer [token]

## 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | Long | 是 | 被举报的商品ID |
| reportType | Integer | 是 | 举报类型：1-虚假商品 2-违禁品 3-侵权 4-其他 |
| reportContent | String | 是 | 举报内容描述 |

## 请求示例
```json
{
    "productId": 123,
    "reportType": 1,
    "reportContent": "该商品描述与实物不符，存在虚假宣传"
}
```

## 响应示例
### 成功响应
```json
{
    "code": 0,
    "data": "举报成功，我们会尽快处理",
    "message": "success"
}
```

### 失败响应
```json
{
    "code": 40000,
    "message": "商品不存在",
    "data": null
}
```
或
```json
{
    "code": 40001,
    "message": "您已经举报过该商品",
    "data": null
}
```

## 接口注意事项
1. 需要用户登录后才能举报
2. 同一用户对同一商品只能举报一次
3. 举报内容不能为空
4. 举报类型必须是1-4之间的整数

# 查询举报信息接口

## 接口信息
- **接口名称**：查询举报信息
- **请求路径**：`/product/report/list/{productId}`
- **请求方法**：GET
- **接口权限**：需要管理员权限

## 请求头
Authorization: Bearer [token]

## 请求参数
### 路径参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| productId | Long | 是 | 商品ID |

### 查询参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| pageNum | Integer | 否 | 页码，默认1 |
| pageSize | Integer | 否 | 每页数量，默认10 |
| status | Integer | 否 | 处理状态：0-未处理 1-已处理，不传则查询全部 |
| reportType | Integer | 否 | 举报类型：1-虚假商品 2-违禁品 3-侵权 4-其他，不传则查询全部 |
| startTime | String | 否 | 开始时间，格式：yyyy-MM-dd HH:mm:ss |
| endTime | String | 否 | 结束时间，格式：yyyy-MM-dd HH:mm:ss |

## 请求示例
GET /product/report/list/123?pageNum=1&pageSize=10&status=0&reportType=1&startTime=2024-01-01 00:00:00&endTime=2024-12-31 23:59:59

## 响应示例
### 成功响应
```json
{
    "code": 0,
    "data": {
        "pageNum": 1,
        "pageSize": 10,
        "total": 100,
        "pages": 10,
        "list": [
            {
                "reportId": 1,
                "productId": 123,
                "productTitle": "二手iPhone 12",
                "userId": 456,
                "username": "张三",
                "reportType": 1,
                "reportTypeDesc": "虚假商品",
                "reportContent": "该商品描述与实物不符",
                "status": 0,
                "statusDesc": "未处理",
                "createdTime": "2024-01-01 12:00:00",
                "handleTime": null
            }
        ]
    },
    "message": "success"
}
```

### 失败响应
```json
{
    "code": 40000,
    "message": "参数错误",
    "data": null
}
```

## 接口注意事项
1. 需要管理员权限才能访问
2. 时间范围查询时，开始时间不能大于结束时间
3. 分页参数pageSize最大值为50
4. 返回的举报信息包含商品标题、举报人信息等关联数据


### 获取举报商品列表

**接口描述**：获取所有被举报的商品列表，支持分页和筛选

**请求路径**：`/product/report/all`

**请求方法**：`GET`

**请求头**：
```plaintext
Authorization: Bearer [token]
请求参数说明：

参数名	类型	必填	说明
pageNum	Integer	否	页码，默认1
pageSize	Integer	否	每页数量，默认10
status	Integer	否	处理状态：0-未处理 1-已处理，不传则查询全部
reportType	Integer	否	举报类型：1-虚假商品 2-违禁品 3-侵权 4-其他，不传则查询全部
startTime	String	否	开始时间，格式：yyyy-MM-dd HH:mm:ss
endTime	String	否	结束时间，格式：yyyy-MM-dd HH:mm:ss
请求示例：
GET /product/report/all?pageNum=1&pageSize=10&status=0&reportType=1&startTime=2024-01-01 00:00:00&endTime=2024-12-31 23:59:59

成功响应示例：
{
    "code": 0,
    "data": {
        "pageNum": 1,
        "pageSize": 10,
        "total": 100,
        "pages": 10,
        "list": [
            {
                "productId": 123,
                "productTitle": "二手iPhone 12",
                "reportCount": 5,
                "latestReportTime": "2024-01-01 12:00:00"
            }
        ],
        "hasPrevious": false,
        "hasNext": true
    },
    "message": "success"
}

失败响应示例：
{
    "code": 40000,
    "message": "参数错误",
    "data": null
}

\### 接口权限
- 需要用户登录

## 下架商品

### 接口名称
下架商品

### 接口描述
根据商品ID将商品状态设置为下架（状态码：0）。管理员可以下架所有用户的商品。

### 接口地址
`/product/delete/{productId}`

### 请求方法
DELETE

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名     | 类型   | 必填 | 说明     | 示例        |
|-----------|-------|------|----------|------------|
| productId | Long  | 是   | 商品ID   | 123        |

**请求示例**
```
DELETE /product/delete/123
```

### 响应参数

| 参数名            | 类型    | 说明                 |
|------------------|--------|---------------------|
| code             | int    | 状态码，0表示成功      |
| message          | String | 响应消息             |
| data             | Object | 返回数据对象，通常为null |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**失败响应示例**
```json
{
  "code": 40400,
  "message": "商品不存在",
  "data": null
}
```

### 接口注意事项
- 需要用户登录后访问此接口
- 仅允许商品的发布者或管理员下架商品
- 如果商品不存在或用户无权限操作，返回相应的错误信息

### 接口权限
- 需要用户登录