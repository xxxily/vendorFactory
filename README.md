# vendorFactory

> 脚本组装打包工厂，用于打包生成自己所需的各种脚本库

## 使用方式

``` bash
# 安装依赖
yarn

# 运行项目的开发环境
npm run projectName:dev
# 运行项目的打包环境
npm run projectName:prod
```   

## 新增打包脚本库

通过编写 config/rollup.tree.config.js 文件，可以实现增加或修改相关脚本打包库。    

confTree 下的键名表示项目名称（projectName），其对应的对象则为具体rollup配置，默认其它配置项均已统一配置妥当，只需配置input和output两个选项即可，如果你也配置了其它的rollup选项，最终将以你当前的配置项为准  

另外增加了version和description两个必选的配置项，以便统一管理版本信息和描述信息  

配置完 config/rollup.tree.config.js 后，为了方便调用，请在package.json文件下增加对应的scripts项目，方法直接运行对应项目的开发或发布命名  
例如: 

```javascript
...
"scripts": {
  ...
  "utils:dev": "npm run rollup --mode-dev --proj-utils",
  "utils:prod": "npm run rollup --mode-prod --proj-utils",
  ...
},
...
```




