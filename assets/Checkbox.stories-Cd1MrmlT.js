import{w as s,b as n,a as i,e as m}from"./index-CHk9ml5q.js";import{f as p}from"./HubertProvider-BnbjTwn9.js";import"./jsx-runtime-BjG_zV1W.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./index-DZLKizrv.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const u={title:"Form/Checkbox",component:p,args:{children:"Yes, I accept all the evil I am forced to",isDisabled:!1}},e={args:{},play:async({canvasElement:r})=>{const a=s(r);n.click(a.getByRole("checkbox")),await i(()=>{m(a.getByRole("checkbox")).toBeChecked()})}};var t,o,c;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  args: {},
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    fireEvent.click(canvas.getByRole('checkbox'));
    await waitFor(() => {
      expect(canvas.getByRole('checkbox')).toBeChecked();
    });
  }
}`,...(c=(o=e.parameters)==null?void 0:o.docs)==null?void 0:c.source}}};const B=["Default"];export{e as Default,B as __namedExportsOrder,u as default};
