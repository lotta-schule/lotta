import{j as e}from"./jsx-runtime-BjG_zV1W.js";import{I as B}from"./index-CeThVdo_.js";import{a as d}from"./chunk-454WOBUV-GZs1KFdJ.js";import{q as x,r as h,T as r,s as l,C as b,m as y,n as V,t as g,E as j}from"./HubertProvider-22Y4FWNu.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import{w as S,e as i,b as c,a as p}from"./index-CHk9ml5q.js";import"./v4-CQkTLCs1.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";import"./index-DZLKizrv.js";const M={title:"Layout/SplitView",component:x,argTypes:{},parameters:{viewport:{viewports:B,defaultViewport:"iphone14"},chromatic:{delay:500,viewports:[500]}}},n={args:{children:({close:s})=>e.jsxs(e.Fragment,{children:[e.jsxs(h,{children:[e.jsx(r,{style:{justifyContent:"flex-end"},children:e.jsx(l,{action:"close",icon:e.jsx(b,{})})}),e.jsx(y,{children:Array.from({length:5},(o,t)=>e.jsxs(V,{onClick:()=>{d(`Item ${t} clicked`),s()},children:["Item ",t]},t))})]}),e.jsxs(g,{children:[e.jsx(r,{children:e.jsx(l,{action:"open",icon:e.jsx(j,{})})}),e.jsx("img",{src:"https://picsum.photos/id/3/300/200",alt:""})]})]})},play:async({canvasElement:s})=>{const o=S(s);await new Promise(f=>setTimeout(f,500));const t=o.getByRole("button",{name:/schließen/});i(t).toBeVisible(),c.click(t),await p(()=>{i(o.getByRole("button",{name:/öffnen/})).toBeVisible()});const a=o.getByRole("button",{name:/öffnen/});c.click(a),await p(()=>{i(a).not.toBeVisible(),i(o.getByRole("button",{name:/schließen/})).toBeVisible()})}};var m,u,w;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    children: ({
      close
    }) => <>
        <SplitViewNavigation>
          <Toolbar style={{
          justifyContent: 'flex-end'
        }}>
            <SplitViewButton action="close" icon={<Close />} />
          </Toolbar>
          <List>
            {Array.from({
            length: 5
          }, (_, i) => <ListItem key={i} onClick={() => {
            action(\`Item \${i} clicked\`);
            close();
          }}>
                Item {i}
              </ListItem>)}
          </List>
        </SplitViewNavigation>
        <SplitViewContent>
          <Toolbar>
            <SplitViewButton action="open" icon={<ExpandMore />} />
          </Toolbar>
          <img src="https://picsum.photos/id/3/300/200" alt="" />
        </SplitViewContent>
      </>
  },
  play: async ({
    canvasElement
  }) => {
    const screen = within(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 500)); // wait for useEffect to run

    const closeButton = screen.getByRole('button', {
      name: /schließen/
    });
    expect(closeButton).toBeVisible();
    fireEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.getByRole('button', {
        name: /öffnen/
      })).toBeVisible();
    });
    const openButton = screen.getByRole('button', {
      name: /öffnen/
    });
    fireEvent.click(openButton);
    await waitFor(() => {
      expect(openButton).not.toBeVisible();
      expect(screen.getByRole('button', {
        name: /schließen/
      })).toBeVisible();
    });
  }
}`,...(w=(u=n.parameters)==null?void 0:u.docs)==null?void 0:w.source}}};const O=["Default"];export{n as Default,O as __namedExportsOrder,M as default};
