import{j as r}from"./jsx-runtime-BjG_zV1W.js";import{f as m,u,w as g,e as s}from"./index-CHk9ml5q.js";import{Z as i,A as d}from"./HubertProvider-BnbjTwn9.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./index-DZLKizrv.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const A={title:"util/Deletable",component:i,argTypes:{}},e={render:t=>r.jsx(i,{...t,children:r.jsx(d,{src:"https://api.dicebear.com/7.x/avataaars/svg?seed=rosa-luxemburg",title:"Rosa Luxemburg"})}),args:{onDelete:m()},play:async({canvasElement:t,initialArgs:c})=>{const p=u.setup({delay:200}),a=g(t);s(a.getByRole("button")).toHaveStyle({opacity:0}),await p.click(a.getByRole("button")),s(c.onDelete).toHaveBeenCalled()}};var o,n,l;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <Deletable {...args}>
      <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=rosa-luxemburg" title="Rosa Luxemburg" />
    </Deletable>,
  args: {
    onDelete: fn()
  },
  play: async ({
    canvasElement,
    initialArgs
  }) => {
    const fireEvent = userEvent.setup({
      delay: 200
    });
    const screen = within(canvasElement);
    expect(screen.getByRole('button')).toHaveStyle({
      opacity: 0
    });
    await fireEvent.click(screen.getByRole('button'));
    expect(initialArgs.onDelete).toHaveBeenCalled();
  }
}`,...(l=(n=e.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};const j=["Default"];export{e as Default,j as __namedExportsOrder,A as default};
