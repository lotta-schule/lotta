"use strict";(self.webpackChunk_lotta_schule_storybook_hubert=self.webpackChunk_lotta_schule_storybook_hubert||[]).push([[8404],{"./src/menus/MenuButton.stories.tsx":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.r(__webpack_exports__),__webpack_require__.d(__webpack_exports__,{Default:()=>Default,__namedExportsOrder:()=>__namedExportsOrder,default:()=>__WEBPACK_DEFAULT_EXPORT__});__webpack_require__("../../node_modules/react/index.js");var _lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__=__webpack_require__("../hubert/dist/index.js"),_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_2__=__webpack_require__("../../node_modules/@storybook/addon-actions/dist/index.mjs"),react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__=__webpack_require__("../../node_modules/react/jsx-runtime.js");function cov_2d9328ph5e(){var path="/home/runner/work/web/web/packages/storybook-hubert/src/menus/MenuButton.stories.tsx",global=new Function("return this")(),gcv="__coverage__",coverageData={path:"/home/runner/work/web/web/packages/storybook-hubert/src/menus/MenuButton.stories.tsx",statementMap:{0:{start:{line:13,column:17},end:{line:35,column:2}},1:{start:{line:13,column:38},end:{line:35,column:2}},2:{start:{line:36,column:0},end:{line:36,column:34}},3:{start:{line:37,column:23},end:{line:48,column:1}},4:{start:{line:49,column:0},end:{line:58,column:2}},5:{start:{line:59,column:35},end:{line:59,column:46}}},fnMap:{0:{name:"(anonymous_0)",decl:{start:{line:13,column:17},end:{line:13,column:18}},loc:{start:{line:13,column:38},end:{line:35,column:2}},line:13}},branchMap:{},s:{0:0,1:0,2:0,3:0,4:0,5:0},f:{0:0},b:{},inputSourceMap:{version:3,file:void 0,names:[],sourceRoot:void 0,sources:[],sourcesContent:["import * as React from 'react';\nimport { StoryFn, Meta } from '@storybook/react';\nimport { Close, ChevronRight, MenuButton, Item } from '@lotta-schule/hubert';\nimport { action } from '@storybook/addon-actions';\nexport default ({\n  title: 'menus/MenuButton',\n  component: MenuButton,\n  subcomponents: {\n    Item\n  }\n} as Meta);\nconst Template: StoryFn = (args: any) => <div style={{\n  width: '100vw',\n  height: '100vh',\n  display: 'flex',\n  alignItems: 'center',\n  justifyContent: 'center'\n}}>\n    <MenuButton {...args}>\n      <Item key={'Menuitem 1'}>\n        <Close /> MenuItem 1\n      </Item>\n      <Item key={'Menuitem 2'}>\n        <ChevronRight />\n        MenuItem 1\n      </Item>\n      <Item key={'Menuitem 3'}>MenuItem 3</Item>\n      <Item key={'Menuitem 4'}>MenuItem 4</Item>\n      <Item key={'Menuitem 5'}>MenuItem 5</Item>\n    </MenuButton>\n  </div>;\nexport const Default = {\n  render: Template,\n  args: {\n    buttonProps: {\n      label: 'Open the menu'\n    },\n    title: 'Chose a MenuItem number',\n    onAction: action('onAction'),\n    onClose: action('onClose'),\n    onOpenChange: action('onOpenChange')\n  }\n};\nDefault.parameters = {\n  ...Default.parameters,\n  docs: {\n    ...Default.parameters?.docs,\n    source: {\n      originalSource: \"{\\n  render: Template,\\n  args: {\\n    buttonProps: {\\n      label: 'Open the menu'\\n    },\\n    title: 'Chose a MenuItem number',\\n    onAction: action('onAction'),\\n    onClose: action('onClose'),\\n    onOpenChange: action('onOpenChange')\\n  }\\n}\",\n      ...Default.parameters?.docs?.source\n    }\n  }\n};"],mappings:""},_coverageSchema:"1a1c01bbd47fc00a2c39e90264f33305004495a9",hash:"cd6c9caf0b8e7e6a6299c9daf318e9d9cb4ace90"},coverage=global[gcv]||(global[gcv]={});coverage[path]&&"cd6c9caf0b8e7e6a6299c9daf318e9d9cb4ace90"===coverage[path].hash||(coverage[path]=coverageData);var actualCoverage=coverage[path];return cov_2d9328ph5e=function(){return actualCoverage},actualCoverage}cov_2d9328ph5e();const __WEBPACK_DEFAULT_EXPORT__={title:"menus/MenuButton",component:_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.j2,subcomponents:{Item:_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.ck}};cov_2d9328ph5e().s[0]++;const Template=args=>(cov_2d9328ph5e().f[0]++,cov_2d9328ph5e().s[1]++,(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)("div",{style:{width:"100vw",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.j2,{...args,children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.ck,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.x8,{})," MenuItem 1"]},"Menuitem 1"),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsxs)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.ck,{children:[(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__._Q,{}),"MenuItem 1"]},"Menuitem 2"),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.ck,{children:"MenuItem 3"},"Menuitem 3"),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.ck,{children:"MenuItem 4"},"Menuitem 4"),(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_3__.jsx)(_lotta_schule_hubert__WEBPACK_IMPORTED_MODULE_1__.ck,{children:"MenuItem 5"},"Menuitem 5")]})}));cov_2d9328ph5e().s[2]++,Template.displayName="Template";const Default=(cov_2d9328ph5e().s[3]++,{render:Template,args:{buttonProps:{label:"Open the menu"},title:"Chose a MenuItem number",onAction:(0,_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_2__.aD)("onAction"),onClose:(0,_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_2__.aD)("onClose"),onOpenChange:(0,_storybook_addon_actions__WEBPACK_IMPORTED_MODULE_2__.aD)("onOpenChange")}});cov_2d9328ph5e().s[4]++,Default.parameters={...Default.parameters,docs:{...Default.parameters?.docs,source:{originalSource:"{\n  render: Template,\n  args: {\n    buttonProps: {\n      label: 'Open the menu'\n    },\n    title: 'Chose a MenuItem number',\n    onAction: action('onAction'),\n    onClose: action('onClose'),\n    onOpenChange: action('onOpenChange')\n  }\n}",...Default.parameters?.docs?.source}}};const __namedExportsOrder=(cov_2d9328ph5e().s[5]++,["Default"])},"../../node_modules/@storybook/addon-actions/dist/index.mjs":(__unused_webpack_module,__webpack_exports__,__webpack_require__)=>{__webpack_require__.d(__webpack_exports__,{aD:()=>chunk_AY7I2SME.aD,Nw:()=>actions});var chunk_AY7I2SME=__webpack_require__("../../node_modules/@storybook/addon-actions/dist/chunk-AY7I2SME.mjs"),actions=(...args)=>{let options=chunk_AY7I2SME.vc,names=args;1===names.length&&Array.isArray(names[0])&&([names]=names),1!==names.length&&"string"!=typeof names[names.length-1]&&(options={...chunk_AY7I2SME.vc,...names.pop()});let namesObject=names[0];(1!==names.length||"string"==typeof namesObject)&&(namesObject={},names.forEach((name=>{namesObject[name]=name})));let actionsObject={};return Object.keys(namesObject).forEach((name=>{actionsObject[name]=(0,chunk_AY7I2SME.aD)(namesObject[name],options)})),actionsObject}}}]);