import{j as r}from"./jsx-runtime-BjG_zV1W.js";import{r as d}from"./index-CbIUIaG1.js";import{u as p}from"./HubertProvider-BnbjTwn9.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./_commonjsHelpers-BosuxZz1.js";import"./index-D3ylJrlI.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const E={title:"Layout/Stepper",component:p,argTypes:{}},u=({args:m})=>{const n=c=>`https://api.dicebear.com/7.x/avataaars/svg?seed=${c}`,[e,i]=d.useState(2);return r.jsxs("div",{children:[r.jsx(p,{currentStep:e,onStep:i,...m}),r.jsx("img",{src:n(e),alt:`Image Step ${e}`,style:{width:300}})]})},t={render:u,args:{args:{maxSteps:4}}};var s,a,o;t.parameters={...t.parameters,docs:{...(s=t.parameters)==null?void 0:s.docs,source:{originalSource:`{
  render: Template,
  args: {
    args: {
      maxSteps: 4
    }
  }
}`,...(o=(a=t.parameters)==null?void 0:a.docs)==null?void 0:o.source}}};const T=["Default"];export{t as Default,T as __namedExportsOrder,E as default};
