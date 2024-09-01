import{j as t}from"./jsx-runtime-BjG_zV1W.js";import{m as r,n as e,o as C,p as n,A as f,b as i,C as o}from"./HubertProvider-22Y4FWNu.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const R={title:"layout/List",component:r,subcomponents:{ListItem:e,DraggableListItem:C}},v=s=>`https://api.dicebear.com/7.x/avataaars/svg?seed=${s}`,a={render:s=>t.jsxs(r,{...s,children:[t.jsx(e,{children:"Test"}),t.jsx(e,{children:"Test"}),t.jsx(e,{children:"Test"}),t.jsx(e,{children:"Test"})]})},c={render:s=>t.jsxs(r,{...s,children:[t.jsxs(e,{children:["Test",t.jsx(n,{children:"Secondary Text"})]}),t.jsxs(e,{children:["Test",t.jsx(n,{children:"Secondary Text"})]}),t.jsxs(e,{children:["Test",t.jsx(n,{children:"Secondary Text"})]}),t.jsxs(e,{children:["Test",t.jsx(n,{children:"Secondary Text"})]})]})},m={render:s=>t.jsx(r,{...s,children:Array.from({length:10}).map((B,L)=>t.jsx(e,{leftSection:t.jsx(f,{src:v(L)}),children:"Test"},L))})},d={render:s=>t.jsxs(r,{...s,children:[t.jsx(e,{leftSection:t.jsx(f,{src:v(999)}),rightSection:t.jsx(i,{icon:t.jsx(o,{})}),children:"Test"}),t.jsx(e,{rightSection:t.jsx(i,{icon:t.jsx(o,{})}),children:"Test"}),t.jsx(e,{rightSection:t.jsx(i,{icon:t.jsx(o,{})}),children:"Test"}),t.jsx(e,{rightSection:t.jsx(i,{icon:t.jsx(o,{})}),children:"Test"})]})};var x,l,T;a.parameters={...a.parameters,docs:{...(x=a.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: (args: ListProps) => <List {...args}>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
      <ListItem>Test</ListItem>
    </List>
}`,...(T=(l=a.parameters)==null?void 0:l.docs)==null?void 0:T.source}}};var p,I,S;c.parameters={...c.parameters,docs:{...(p=c.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: (args: ListProps) => <List {...args}>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
      <ListItem>
        Test
        <ListItemSecondaryText>Secondary Text</ListItemSecondaryText>
      </ListItem>
    </List>
}`,...(S=(I=c.parameters)==null?void 0:I.docs)==null?void 0:S.source}}};var h,j,g;m.parameters={...m.parameters,docs:{...(h=m.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: (args: ListProps) => <List {...args}>
      {Array.from({
      length: 10
    }).map((_, i) => <ListItem key={i} leftSection={<Avatar src={getAvatarUrl(i)} />}>
          Test
        </ListItem>)}
    </List>
}`,...(g=(j=m.parameters)==null?void 0:j.docs)==null?void 0:g.source}}};var u,y,A;d.parameters={...d.parameters,docs:{...(u=d.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: (args: ListProps) => <List {...args}>
      <ListItem leftSection={<Avatar src={getAvatarUrl(999)} />} rightSection={<Button icon={<Close />} />}>
        Test
      </ListItem>
      <ListItem rightSection={<Button icon={<Close />} />}>Test</ListItem>
      <ListItem rightSection={<Button icon={<Close />} />}>Test</ListItem>
      <ListItem rightSection={<Button icon={<Close />} />}>Test</ListItem>
    </List>
}`,...(A=(y=d.parameters)==null?void 0:y.docs)==null?void 0:A.source}}};const $=["Default","WithSecondaryText","AvatarList","ActionList"];export{d as ActionList,m as AvatarList,a as Default,c as WithSecondaryText,$ as __namedExportsOrder,R as default};
