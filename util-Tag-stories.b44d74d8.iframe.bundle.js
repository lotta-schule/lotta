"use strict";(self.webpackChunk_lotta_schule_storybook_hubert=self.webpackChunk_lotta_schule_storybook_hubert||[]).push([[391],{"./src/util/Tag.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,Deletable:()=>Deletable,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});var _storybook_addon_actions__WEBPACK_IMPORTED_MODULE_0__=__webpack_require__("../../node_modules/@storybook/addon-actions/dist/index.mjs"),_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../hubert/dist/index.js");function cov_1quawts8dl(){var path="/home/runner/work/web/web/packages/storybook-hubert/src/util/Tag.stories.tsx",global=new Function("return this")(),gcv="__coverage__",coverageData={path:"/home/runner/work/web/web/packages/storybook-hubert/src/util/Tag.stories.tsx",statementMap:{0:{start:{line:18,column:23},end:{line:23,column:1}},1:{start:{line:24,column:25},end:{line:29,column:1}},2:{start:{line:30,column:0},end:{line:39,column:2}},3:{start:{line:40,column:0},end:{line:49,column:2}},4:{start:{line:50,column:35},end:{line:50,column:59}}},fnMap:{},branchMap:{},s:{0:0,1:0,2:0,3:0,4:0},f:{},b:{},inputSourceMap:{version:3,file:void 0,names:[],sourceRoot:void 0,sources:[],sourcesContent:["import { Meta } from '@storybook/react';\nimport { actions } from '@storybook/addon-actions';\nimport { Tag } from '@lotta-schule/hubert';\nexport default ({\n  title: 'util/Tag',\n  component: Tag,\n  argTypes: {\n    children: {\n      name: 'children',\n      type: {\n        name: 'string',\n        required: true\n      },\n      defaultValue: 'Hallo',\n      description: 'The content of the tag'\n    }\n  }\n} as Meta);\nexport const Default = {\n  args: {\n    children: 'Hallo',\n    onDelete: undefined\n  }\n};\nexport const Deletable = {\n  args: {\n    children: 'Hallo',\n    ...actions('onDelete')\n  }\n};\nDefault.parameters = {\n  ...Default.parameters,\n  docs: {\n    ...Default.parameters?.docs,\n    source: {\n      originalSource: \"{\\n  args: {\\n    children: 'Hallo',\\n    onDelete: undefined\\n  }\\n}\",\n      ...Default.parameters?.docs?.source\n    }\n  }\n};\nDeletable.parameters = {\n  ...Deletable.parameters,\n  docs: {\n    ...Deletable.parameters?.docs,\n    source: {\n      originalSource: \"{\\n  args: {\\n    children: 'Hallo',\\n    ...actions('onDelete')\\n  }\\n}\",\n      ...Deletable.parameters?.docs?.source\n    }\n  }\n};"],mappings:""},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"3370043572ef1a428b1a45262f2c4a1536be1a2c"},coverage=global[gcv]||(global[gcv]={});coverage[path]&&"3370043572ef1a428b1a45262f2c4a1536be1a2c"===coverage[path].hash||(coverage[path]=coverageData);var actualCoverage=coverage[path];return cov_1quawts8dl=function(){return actualCoverage},actualCoverage}cov_1quawts8dl();const __WEBPACK_DEFAULT_EXPORT__={title:"util/Tag",component:_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.Vp,argTypes:{children:{name:"children",type:{name:"string",required:!0},defaultValue:"Hallo",description:"The content of the tag"}}},Default=(cov_1quawts8dl().s[0]++,{args:{children:"Hallo",onDelete:void 0}}),Deletable=(cov_1quawts8dl().s[1]++,{args:{children:"Hallo",...(0,_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_0__.Nw)("onDelete")}});cov_1quawts8dl().s[2]++,Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{\n  args: {\n    children: 'Hallo',\n    onDelete: undefined\n  }\n}",...Default.parameters?.docs?.source}}},cov_1quawts8dl().s[3]++,Deletable.parameters={...Deletable.parameters,docs:{...Deletable.parameters?.docs,source:{originalSource:"{\n  args: {\n    children: 'Hallo',\n    ...actions('onDelete')\n  }\n}",...Deletable.parameters?.docs?.source}}};const __namedExportsOrder=(cov_1quawts8dl().s[4]++,["Default","Deletable"])},"../../node_modules/@storybook/addon-actions/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{aD:()=>chunk_AY7I2SME.aD,Nw:()=>actions});var chunk_AY7I2SME=__webpack_require__("../../node_modules/@storybook/addon-actions/dist/chunk-AY7I2SME.mjs"),actions=(...args)=>{let options=chunk_AY7I2SME.vc,names=args;1===names.length&&Array.isArray(names[0])&&([names]=names),1!==names.length&&"string"!=typeof names[names.length-1]&&(options={...chunk_AY7I2SME.vc,...names.pop()});let namesObject=names[0];(1!==names.length||"string"==typeof namesObject)&&(namesObject={},names.forEach((name=>{namesObject[name]=name})));let actionsObject={};return Object.keys(namesObject).forEach((name=>{actionsObject[name]=(0,chunk_AY7I2SME.aD)(namesObject[name],options)})),actionsObject}}}]);