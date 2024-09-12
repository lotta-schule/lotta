import{j as p}from"./jsx-runtime-BjG_zV1W.js";import{f as m,s as H,w as R,b as C,e as n,a as t}from"./index-CHk9ml5q.js";import{L,K as d}from"./HubertProvider-BFTGI0HB.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./index-DZLKizrv.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const W={title:"Buttons/LoadingButton",component:L,args:{onAction:m(),onError:m(),onComplete:m()},argTypes:{},decorators:[(r,{args:a,parameters:o})=>(a.onAction&&H(a,"onAction").mockImplementationOnce(()=>new Promise((e,h)=>{setTimeout(()=>{if(o.fail){const q=typeof o.fail=="string"&&o.fail.length?o.fail:"I failed";h(new Error(q))}else e()},1500)})),p.jsx(r,{}))]},s={args:{state:"loading",label:"save",onAction:void 0}},i={args:{icon:p.jsx(d,{}),label:"save"}},c={args:{label:"let me succeed",icon:p.jsx(d,{})},play:async({canvasElement:r,args:{onAction:a,onComplete:o}})=>{const e=R(r);await C.click(await e.findByRole("button",{name:/let me succeed/i})),n(a).toHaveBeenCalled(),await t(()=>{n(e.queryByRole("progressbar"),"progressbar not visible").toBeVisible()}),await t(()=>{n(e.queryByRole("progressbar")).toBeNull()},{timeout:2e3}),n(o).toHaveBeenCalled(),await t(()=>{n(e.getByTestId("SuccessIcon")).toBeVisible()})}},l={args:{label:"let me fail",icon:p.jsx(d,{})},parameters:{fail:"I failed"},play:async({canvasElement:r,args:{onAction:a,onError:o}})=>{const e=R(r);C.click(await e.findByRole("button",{name:/let me fail/i})),n(a).toHaveBeenCalled(),await t(()=>{n(e.queryByRole("progressbar"),"progressbar should be visible").toBeVisible()}),await t(()=>{n(e.queryByRole("progressbar")).toBeNull()},{timeout:2e3}),n(o).toHaveBeenCalled(),await t(()=>{n(e.getByTestId("ErrorIcon")).toBeVisible()})}};var u,b,g;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    state: 'loading',
    label: 'save',
    onAction: undefined
  }
}`,...(g=(b=s.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var B,y,f;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    icon: <KeyboardArrowLeft />,
    label: 'save'
  }
}`,...(f=(y=i.parameters)==null?void 0:y.docs)==null?void 0:f.source}}};var w,v,x;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    label: 'let me succeed',
    icon: <KeyboardArrowLeft />
  },
  play: async ({
    canvasElement,
    args: {
      onAction,
      onComplete
    }
  }) => {
    const screen = within(canvasElement);
    await fireEvent.click(await screen.findByRole('button', {
      name: /let me succeed/i
    }));
    expect(onAction).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar'), 'progressbar not visible').toBeVisible();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, {
      timeout: 2000
    });
    expect(onComplete).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('SuccessIcon')).toBeVisible();
    });
  }
}`,...(x=(v=c.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var A,E,I;l.parameters={...l.parameters,docs:{...(A=l.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    label: 'let me fail',
    icon: <KeyboardArrowLeft />
  },
  parameters: {
    fail: 'I failed'
  },
  play: async ({
    canvasElement,
    args: {
      onAction,
      onError
    }
  }) => {
    const screen = within(canvasElement);
    fireEvent.click(await screen.findByRole('button', {
      name: /let me fail/i
    }));
    expect(onAction).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar'), 'progressbar should be visible').toBeVisible();
    });
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    }, {
      timeout: 2000
    });
    expect(onError).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('ErrorIcon')).toBeVisible();
    });
  }
}`,...(I=(E=l.parameters)==null?void 0:E.docs)==null?void 0:I.source}}};const P=["Default","WithIcon","SuccessAction","ErrorAction"];export{s as Default,l as ErrorAction,c as SuccessAction,i as WithIcon,P as __namedExportsOrder,W as default};
