import{j as f}from"./jsx-runtime-BjG_zV1W.js";import{u as w,w as E,e as i,a as h}from"./index-CHk9ml5q.js";import{I as l}from"./HubertProvider-BFTGI0HB.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./index-DZLKizrv.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const{useArgs:b}=__STORYBOOK_MODULE_PREVIEW_API__,j={title:"Form/Input",component:l,render:n=>{const[,e]=b(),t=s=>{e({value:s.currentTarget.value})};return f.jsx(l,{...n,onChange:t})},argTypes:{},args:{value:""}},a={args:{placeholder:"Please type something interesting ..."},play:async({canvasElement:n})=>{const e=w.setup({delay:100}),t=E(n);await e.click(t.getByRole("textbox")),await e.keyboard("sample text"),i(t.getByRole("textbox")).toHaveValue("sample text")}},r={args:{...a.args,inline:!0}},o={args:{...a.args,multiline:!0},play:async({canvasElement:n})=>{const e=w.setup({delay:100}),t=E(n);await e.click(t.getByRole("textbox")),await e.keyboard(`sample text
with newline`);const s=t.getByRole("textbox");i(s).toHaveValue(`sample text
with newline`),await h(()=>{i(s.scrollHeight).toEqual(s.clientHeight)})}};var c,p,u;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    placeholder: 'Please type something interesting ...'
  },
  play: async ({
    canvasElement
  }) => {
    const fireEvent = userEvent.setup({
      delay: 100
    });
    const canvas = within(canvasElement);
    await fireEvent.click(canvas.getByRole('textbox'));
    await fireEvent.keyboard('sample text');
    expect(canvas.getByRole('textbox')).toHaveValue('sample text');
  }
}`,...(u=(p=a.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var m,x,g;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    inline: true
  }
}`,...(g=(x=r.parameters)==null?void 0:x.docs)==null?void 0:g.source}}};var v,y,d;o.parameters={...o.parameters,docs:{...(v=o.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: ({
    ...Default.args,
    multiline: true
  } as any),
  play: async ({
    canvasElement
  }) => {
    const fireEvent = userEvent.setup({
      delay: 100
    });
    const canvas = within(canvasElement);
    await fireEvent.click(canvas.getByRole('textbox'));
    await fireEvent.keyboard('sample text\\nwith newline');
    const textarea = canvas.getByRole('textbox');
    expect(textarea).toHaveValue('sample text\\nwith newline');
    await waitFor(() => {
      expect(textarea.scrollHeight).toEqual(textarea.clientHeight);
    });
  }
}`,...(d=(y=o.parameters)==null?void 0:y.docs)==null?void 0:d.source}}};const A=["Default","Inline","Multiline"];export{a as Default,r as Inline,o as Multiline,A as __namedExportsOrder,j as default};
