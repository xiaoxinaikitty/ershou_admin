# 用户模块接口文档

## 目录
- [用户注册](#用户注册)
- [用户登录](#用户登录)
- [管理员登录](#管理员登录)
- [添加用户地址](#添加用户地址)
- [获取用户信息](#获取用户信息)
- [修改用户信息](#修改用户信息)
- [修改用户密码](#修改用户密码)
- [获取用户角色信息](#获取用户角色信息)
- [修改用户角色](#修改用户角色)
- [封禁用户](#封禁用户)
- [解封用户](#解封用户)
- [用户查询列表](#用户查询列表)
- [获取用户总数](#获取用户总数)

## 用户注册

### 接口名称
用户注册

### 接口地址
`/user/register`

### 请求方法
POST

### 请求参数

| 参数名     | 类型   | 必填 | 说明     | 示例        |
|-----------|-------|------|----------|------------|
| username  | String | 是   | 用户名    | zhangsan   |
| password  | String | 是   | 密码      | password123|

**请求示例**
```json
{
  "username": "zhangsan",
  "password": "password123"
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | String | 返回数据，成功提示信息 |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": "注册成功"
}
```

**失败响应示例**
```json
{
  "code": 40002,
  "message": "用户已存在",
  "data": null
}
```

### 接口注意事项
- 用户名不能重复
- 密码应该有一定的强度要求

### 接口权限
- 无需权限，所有人可访问

## 用户登录

### 接口名称
用户登录

### 接口地址
`/user/login`

### 请求方法
POST

### 请求参数

| 参数名     | 类型   | 必填 | 说明     | 示例        |
|-----------|-------|------|----------|------------|
| username  | String | 是   | 用户名    | zhangsan   |
| password  | String | 是   | 密码      | password123|

**请求示例**
```json
{
  "username": "zhangsan",
  "password": "password123"
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | String | 返回数据，JWT Token   |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiemhhbmdzYW4iLCJleHAiOjE2NDE4MTYwMDB9.3Hk6-Vl0_2F2F4Z"
}
```

**失败响应示例**
```json
{
  "code": 40003,
  "message": "用户不存在",
  "data": null
}
```

### 接口注意事项
- 用户名或密码错误时，返回相同的错误提示，不区分是用户名错误还是密码错误
- 返回的Token需要在后续请求中通过Authorization头传递

### 接口权限
- 无需权限，所有人可访问

## 管理员登录

### 接口名称
管理员登录

### 接口地址
`/user/admin`

### 请求方法
POST

### 请求参数

| 参数名     | 类型   | 必填 | 说明     | 示例        |
|-----------|-------|------|----------|------------|
| username  | String | 是   | 管理员用户名| admin      |
| password  | String | 是   | 密码      | admin123   |

**请求示例**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | Object | 返回数据对象          |
| data.token | String | JWT Token         |
| data.message | String | 成功提示信息      |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJleHAiOjE2NDE4MTYwMDB9.3Hk6-Vl0_2F2F4Z",
    "message": "管理员登录成功"
  }
}
```

**失败响应示例**
```json
{
  "code": 40003,
  "message": "用户不存在",
  "data": null
}
```

### 接口注意事项
- 只有管理员角色才能登录成功
- 返回的Token需要在后续请求中通过Authorization头传递

### 接口权限
- 无需权限，但只有管理员用户才能登录成功

## 添加用户地址

### 接口名称
添加用户地址

### 接口地址
`/user/address`

### 请求方法
POST

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名        | 类型    | 必填 | 说明         | 示例           |
|--------------|--------|------|-------------|----------------|
| consignee    | String | 是   | 收货人姓名   | 张三           |
| region       | String | 是   | 所在地区     | 北京市海淀区    |
| detail       | String | 是   | 详细地址     | 中关村科技园A座 |
| contactPhone | String | 是   | 联系电话     | 13812345678    |
| isDefault    | Boolean| 是   | 是否默认地址 | true           |

**请求示例**
```json
{
  "consignee": "张三",
  "region": "北京市海淀区",
  "detail": "中关村科技园A座",
  "contactPhone": "13812345678",
  "isDefault": true
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | String | 返回数据，成功提示信息 |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": "地址添加成功"
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
- 必须在登录状态下才能添加地址
- 如果设置为默认地址，可能会将用户之前的默认地址取消

### 接口权限
- 需要用户登录

## 获取用户信息

### 接口名称
获取当前登录用户信息

### 接口地址
`/user/info`

### 请求方法
GET

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数
无

### 响应参数

| 参数名    | 类型   | 说明                |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功     |
| message  | String | 响应消息            |
| data     | Object | 用户信息对象         |
| data.userId | Long | 用户ID            |
| data.username | String | 用户名         |
| data.phone | String | 手机号，可能为null  |
| data.email | String | 邮箱，可能为null    |
| data.avatar | String | 头像URL，可能为null |
| data.role | String | 用户角色            |
| data.balance | BigDecimal | 账户余额     |
| data.isLocked | Boolean | 是否被锁定     |
| data.createTime | String | 创建时间      |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": 1,
    "username": "zhangsan",
    "phone": "13812345678",
    "email": "zhangsan@example.com",
    "avatar": "http://192.168.200.30:8080/images/avatar.jpg",
    "role": "普通用户",
    "balance": 100.00,
    "isLocked": false,
    "createTime": "2023-01-01T12:00:00"
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
- 返回的用户信息不包含敏感字段如密码
- 必须在登录状态下才能获取用户信息

### 接口权限
- 需要用户登录

## 修改用户信息

### 接口名称
修改当前登录用户信息

### 接口地址
`/user/info`

### 请求方法
PUT

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名     | 类型   | 必填 | 说明     | 示例                   |
|-----------|-------|------|----------|------------------------|
| phone     | String | 否   | 手机号    | 13812345678           |
| email     | String | 否   | 邮箱      | zhangsan@example.com  |
| avatar    | String | 否   | 头像URL   | http://example.com/avatar.jpg |

**请求示例**
```json
{
  "phone": "13812345678",
  "email": "zhangsan@example.com",
  "avatar": "http://192.168.200.30:8080/images/avatar.jpg"
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | Object | 更新后的用户信息对象   |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": 1,
    "username": "zhangsan",
    "phone": "13812345678",
    "email": "zhangsan@example.com",
    "avatar": "http://192.168.200.30:8080/images/avatar.jpg",
    "role": "普通用户",
    "balance": 100.00,
    "isLocked": false,
    "createTime": "2023-01-01T12:00:00"
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
- 只提供需要修改的字段，不需要修改的字段不要提交
- 手机号和邮箱有格式校验要求

### 接口权限
- 需要用户登录

## 修改用户密码

### 接口名称
修改当前登录用户密码

### 接口地址
`/user/password`

### 请求方法
PUT

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名          | 类型   | 必填 | 说明      | 示例          |
|----------------|-------|------|----------|---------------|
| oldPassword    | String | 是   | 旧密码    | oldpass123    |
| newPassword    | String | 是   | 新密码    | newpass456    |
| confirmPassword| String | 是   | 确认新密码 | newpass456    |

**请求示例**
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass456",
  "confirmPassword": "newpass456"
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | String | 返回数据，成功提示信息 |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": "密码修改成功"
}
```

**失败响应示例**
```json
{
  "code": 40000,
  "message": "旧密码不正确",
  "data": null
}
```

### 接口注意事项
- 新密码需要进行二次确认，且两次输入必须一致
- 新密码长度必须在6-20个字符之间
- 旧密码必须验证正确才能修改

### 接口权限
- 需要用户登录

## 获取用户角色信息

### 接口名称
获取当前登录用户角色信息

### 接口地址
`/user/role`

### 请求方法
GET

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数
无

### 响应参数

| 参数名    | 类型    | 说明                 |
|----------|--------|---------------------|
| code     | int    | 状态码，0表示成功     |
| message  | String | 响应消息             |
| data     | Object | 用户角色信息对象      |
| data.userId | Long | 用户ID             |
| data.username | String | 用户名          |
| data.role | String | 角色名称            |
| data.isAdmin | Boolean | 是否为管理员      |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "userId": 1,
    "username": "zhangsan",
    "role": "普通用户",
    "isAdmin": false
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
- 必须在登录状态下才能获取用户角色信息

### 接口权限
- 需要用户登录

## 修改用户角色

### 接口名称
修改用户角色（仅管理员可用）

### 接口地址
`/admin/user/role`

### 请求方法
PUT

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名       | 类型   | 必填 | 说明                 | 示例           |
|-------------|-------|------|---------------------|----------------|
| targetUserId| Long  | 是   | 目标用户ID           | 2              |
| role        | String | 是   | 角色名称（系统管理员/普通用户）| 普通用户        |

**请求示例**
```json
{
  "targetUserId": 2,
  "role": "普通用户"
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | String | 返回数据，成功提示信息 |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": "用户角色修改成功"
}
```

**失败响应示例**
```json
{
  "code": 40300,
  "message": "权限不足，仅系统管理员可执行此操作",
  "data": null
}
```

### 接口注意事项
- 只有管理员才能修改用户角色
- 角色名称必须是"系统管理员"或"普通用户"

### 接口权限
- 需要管理员权限

## 封禁用户

### 接口名称
封禁用户（仅管理员可用）

### 接口地址
`/admin/user/ban`

### 请求方法
PUT

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名       | 类型   | 必填 | 说明       | 示例           |
|-------------|-------|------|-----------|----------------|
| targetUserId| Long  | 是   | 目标用户ID  | 2              |
| banReason   | String | 否   | 封禁原因    | 违反平台规则     |

**请求示例**
```json
{
  "targetUserId": 2,
  "banReason": "违反平台规则"
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | String | 返回数据，成功提示信息 |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": "用户封禁成功"
}
```

**失败响应示例**
```json
{
  "code": 40300,
  "message": "权限不足，仅系统管理员可执行此操作",
  "data": null
}
```

### 接口注意事项
- 只有管理员才能封禁用户
- 不能封禁管理员账户
- 封禁后用户无法登录系统

### 接口权限
- 需要管理员权限

## 解封用户

### 接口名称
解封用户（仅管理员可用）

### 接口地址
`/admin/user/unban`

### 请求方法
PUT

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名       | 类型  | 必填 | 说明       | 示例 |
|-------------|------|------|-----------|------|
| targetUserId| Long | 是   | 目标用户ID  | 2    |

**请求示例**
```json
{
  "targetUserId": 2
}
```

### 响应参数

| 参数名    | 类型   | 说明                 |
|----------|-------|---------------------|
| code     | int   | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | String | 返回数据，成功提示信息 |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": "用户解封成功"
}
```

**失败响应示例**
```json
{
  "code": 40300,
  "message": "权限不足，仅系统管理员可执行此操作",
  "data": null
}
```

### 接口注意事项
- 只有管理员才能解封用户
- 用户解封后即可正常登录系统

### 接口权限
- 需要管理员权限

## 用户查询列表

### 接口名称
查询用户列表（仅管理员可用）

### 接口地址
`/admin/user/list`

### 请求方法
GET

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数

| 参数名       | 类型   | 必填 | 说明                 | 示例           |
|-------------|-------|------|---------------------|----------------|
| username    | String | 否   | 用户名(模糊查询)      | zhang          |
| role        | String | 否   | 用户角色             | 普通用户        |
| isLocked    | Boolean| 否   | 是否被封禁           | false          |
| pageNum     | Integer| 否   | 页码，默认为1        | 1              |
| pageSize    | Integer| 否   | 每页条数，默认为10    | 10             |

**请求示例**
```
/admin/user/list?username=zhang&role=普通用户&isLocked=false&pageNum=1&pageSize=10
```

### 响应参数

| 参数名           | 类型    | 说明                 |
|-----------------|--------|---------------------|
| code            | int    | 状态码，0表示成功      |
| message         | String | 响应消息             |
| data            | Object | 返回数据对象          |
| data.total      | Integer| 总记录数             |
| data.pages      | Integer| 总页数               |
| data.pageNum    | Integer| 当前页码             |
| data.pageSize   | Integer| 每页记录数            |
| data.list       | Array  | 用户列表数组          |
| data.list[].userId | Long   | 用户ID           |
| data.list[].username | String | 用户名          |
| data.list[].phone    | String | 手机号           |
| data.list[].email    | String | 邮箱             |
| data.list[].role     | String | 用户角色         |
| data.list[].isLocked | Boolean| 是否被封禁       |
| data.list[].createTime | String | 创建时间       |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "pages": 10,
    "pageNum": 1,
    "pageSize": 10,
    "list": [
      {
        "userId": 1,
        "username": "zhangsan",
        "phone": "13812345678",
        "email": "zhangsan@example.com",
        "role": "普通用户",
        "isLocked": false,
        "createTime": "2023-01-01T12:00:00"
      },
      {
        "userId": 2,
        "username": "lisi",
        "phone": "13987654321",
        "email": "lisi@example.com",
        "role": "普通用户",
        "isLocked": true,
        "createTime": "2023-01-02T10:30:00"
      }
      // 更多用户数据...
    ]
  }
}
```

**失败响应示例**
```json
{
  "code": 40300,
  "message": "权限不足，仅系统管理员可执行此操作",
  "data": null
}
```

### 接口注意事项
- 只有管理员才能查询用户列表
- 支持按用户名模糊查询、角色筛选和封禁状态筛选
- 查询结果分页返回

### 接口权限
- 需要管理员权限

## 获取用户总数

### 接口名称
获取用户总数（仅管理员可用）

### 接口地址
`/admin/user/count`

### 请求方法
GET

### 请求头
| 参数名        | 必填 | 说明                             | 示例                         |
|--------------|------|----------------------------------|------------------------------|
| Authorization | 是   | Bearer Token，用于认证            | Bearer [token]               |

### 请求参数
无

### 响应参数

| 参数名    | 类型    | 说明                 |
|----------|--------|---------------------|
| code     | int    | 状态码，0表示成功      |
| message  | String | 响应消息             |
| data     | Integer| 返回数据，用户总数     |

**成功响应示例**
```json
{
  "code": 0,
  "message": "success",
  "data": 1024
}
```

**失败响应示例**
```json
{
  "code": 40300,
  "message": "权限不足，仅系统管理员可执行此操作",
  "data": null
}
```

### 接口注意事项
- 只有管理员才能获取用户总数
- 统计的是系统中所有注册用户，不论是否被封禁

### 接口权限
- 需要管理员权限