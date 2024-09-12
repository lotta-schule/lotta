import{j as v}from"./jsx-runtime-BjG_zV1W.js";import{a}from"./chunk-454WOBUV-GZs1KFdJ.js";import{B as b,N as x}from"./HubertProvider-BFTGI0HB.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import{u as c,w as p,a as l,e as s}from"./index-CHk9ml5q.js";import"./v4-CQkTLCs1.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";import"./index-DZLKizrv.js";const m=n=>{const e=(n==null?void 0:n.id)??null;return j.filter(t=>t.parent===e)},_={title:"browser/Default",component:b,args:{createDirectory:(n,e)=>new Promise(t=>{a("create-directory")(n,e),setTimeout(t,500)}),moveNode:(n,e)=>new Promise(t=>{a("moveNode")(n,e),setTimeout(t,500)}),deleteNode:n=>new Promise(e=>{a("deleteNode")(n),setTimeout(e,500)}),renameNode:(n,e)=>new Promise(t=>{a("renameNode")(n,e),setTimeout(t,500)}),getDownloadUrl:n=>n.type==="file"?`https://picsum.photos/id/${n.id}/600/400`:null,onRequestChildNodes:async n=>(a("onRequestChildNodes")(n),m(n)),renderNodeList:({path:n})=>{const e=n.at(-1)??null,t=m(e);return v.jsx(x,{path:n,nodes:t})}}},i={play:async({canvasElement:n})=>{const e=c.setup({delay:25}),t=p(n);e.click(await t.findByRole("option",{name:"folder 1"})),e.click(await t.findByRole("option",{name:"folder 8"})),e.click(await t.findByRole("option",{name:"ich.jpg"})),await l(()=>{s(t.getByRole("option",{name:"ich.jpg"})).toHaveAttribute("aria-selected","true")}),await e.keyboard("{ArrowDown}"),await e.keyboard("{Shift>}"),await e.click(await t.findByRole("option",{name:"avatar-anime.png"})),await e.keyboard("{/Shift}"),s(t.getAllByRole("option",{selected:!0})).toHaveLength(3),await e.keyboard("{Control>}a{/Control}"),await new Promise(R=>setTimeout(R,500)),await e.pointer({keys:"[MouseRight>]",target:t.getByRole("option",{name:/ich\.jpg/i})})}},o={args:{mode:"select"},play:async({canvasElement:n})=>{const e=c.setup({delay:25}),t=p(n);e.click(await t.findByRole("option",{name:"folder 1"})),e.click(await t.findByRole("option",{name:"folder 8"})),e.click(await t.findByRole("option",{name:"ich.jpg"})),await l(()=>{s(t.getByRole("option",{name:"ich.jpg"})).toHaveAttribute("aria-selected","true")}),await e.keyboard("{ArrowDown}")}},r={args:{mode:"select-multiple"},play:async({canvasElement:n})=>{const e=c.setup({delay:25}),t=p(n);e.click(await t.findByRole("option",{name:"folder 1"})),e.click(await t.findByRole("option",{name:"folder 8"})),e.click(await t.findByLabelText(/ich\.jpg/i)),await l(()=>{s(t.getByRole("checkbox",{name:/ich\.jpg/i})).toBeChecked()})}};var j=[{id:"1",name:"folder 1",type:"directory",parent:null,meta:{}},{id:"2",name:"folder 2",type:"directory",parent:null,meta:{}},{id:"3",name:"folder 3",type:"directory",parent:null,meta:{}},{id:"4",name:"folder 4",type:"directory",parent:null,meta:{}},{id:"5",name:"folder 5",type:"directory",parent:"1",meta:{}},{id:"6",name:"folder 6",type:"directory",parent:"1",meta:{}},{id:"7",name:"folder 7",type:"directory",parent:"1",meta:{}},{id:"8",name:"folder 8",type:"directory",parent:"1",meta:{}},{id:"9",name:"folder 9",type:"directory",parent:"1",meta:{}},{id:"10",name:"folder 10",type:"directory",parent:"1",meta:{}},{id:"11",name:"folder 11",type:"directory",parent:"8",meta:{}},{id:"12",name:"folder 12",type:"directory",parent:"8",meta:{}},{id:"13",name:"math",type:"directory",parent:"8",meta:{}},{id:"14",name:"folder 14",type:"directory",parent:"8",meta:{}},{id:"15",name:"ich.jpg",type:"file",parent:"8",meta:{mimeType:"image/jpg",size:1234}},{id:"16",name:"ich-bgblau.jpg",type:"file",parent:"8",meta:{mimeType:"image/jpg",size:2134}},{id:"17",name:"avatar-ernst.webp",type:"file",parent:"8",meta:{mimeType:"image/webp",size:512}},{id:"18",name:"avatar-anime.png",type:"file",parent:"8",meta:{mimeType:"image/png",size:8539}},{id:"19",name:"presentation.ppt",type:"file",parent:"13",meta:{size:1024,mimeType:"application/vnd.openxmlformats-officedocument.presentationml.presentation"}},{id:"20",name:"graph-one.xlsx",type:"file",parent:"13",meta:{size:1311234,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}},{id:"21",name:"graph-two.xlsx",type:"file",parent:"13",meta:{size:828574,mimeType:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}},{id:"22",name:"notes.txt",type:"file",parent:"13",meta:{size:87,mimeType:"text/plain"}}],d,y,u;i.parameters={...i.parameters,docs:{...(d=i.parameters)==null?void 0:d.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup({
      delay: 25
    });
    const screen = within(canvasElement);
    user.click(await screen.findByRole('option', {
      name: 'folder 1'
    }));
    user.click(await screen.findByRole('option', {
      name: 'folder 8'
    }));
    user.click(await screen.findByRole('option', {
      name: 'ich.jpg'
    }));
    await waitFor(() => {
      expect(screen.getByRole('option', {
        name: 'ich.jpg'
      })).toHaveAttribute('aria-selected', 'true');
    });
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{Shift>}');
    await user.click(await screen.findByRole('option', {
      name: 'avatar-anime.png'
    }));
    await user.keyboard('{/Shift}');
    expect(screen.getAllByRole('option', {
      selected: true
    })).toHaveLength(3);
    await user.keyboard('{Control>}a{/Control}');
    await new Promise(resolve => setTimeout(resolve, 500));
    await user.pointer({
      keys: '[MouseRight>]',
      target: screen.getByRole('option', {
        name: /ich\\.jpg/i
      })
    });
  }
}`,...(u=(y=i.parameters)==null?void 0:y.docs)==null?void 0:u.source}}};var f,w,g;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    mode: 'select'
  },
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup({
      delay: 25
    });
    const screen = within(canvasElement);
    user.click(await screen.findByRole('option', {
      name: 'folder 1'
    }));
    user.click(await screen.findByRole('option', {
      name: 'folder 8'
    }));
    user.click(await screen.findByRole('option', {
      name: 'ich.jpg'
    }));
    await waitFor(() => {
      expect(screen.getByRole('option', {
        name: 'ich.jpg'
      })).toHaveAttribute('aria-selected', 'true');
    });
    await user.keyboard('{ArrowDown}');
  }
}`,...(g=(w=o.parameters)==null?void 0:w.docs)==null?void 0:g.source}}};var h,k,B;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    mode: 'select-multiple'
  },
  play: async ({
    canvasElement
  }) => {
    const user = userEvent.setup({
      delay: 25
    });
    const screen = within(canvasElement);
    user.click(await screen.findByRole('option', {
      name: 'folder 1'
    }));
    user.click(await screen.findByRole('option', {
      name: 'folder 8'
    }));
    user.click(await screen.findByLabelText(/ich\\.jpg/i));
    await waitFor(() => {
      expect(screen.getByRole('checkbox', {
        name: /ich\\.jpg/i
      })).toBeChecked();
    });
  }
}`,...(B=(k=r.parameters)==null?void 0:k.docs)==null?void 0:B.source}}};const q=["Default","Select","SelectMultiple"];export{i as Default,o as Select,r as SelectMultiple,q as __namedExportsOrder,_ as default};
