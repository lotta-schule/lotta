import{j as n}from"./jsx-runtime-BjG_zV1W.js";import{f as h,w as g,e as r,b as c,a as l}from"./index-CHk9ml5q.js";import{a2 as x,b as d}from"./HubertProvider-DS0B-nqQ.js";import"./index-CbIUIaG1.js";import"./index-DsJRWNrc.js";import"./isObjectLike-DExiV3nx.js";import"./index-DZLKizrv.js";import"./index-D3ylJrlI.js";import"./_commonjsHelpers-BosuxZz1.js";import"./debounce-DSapFuzV.js";import"./isSymbol-Ba4JPt5E.js";const{useArgs:v}=__STORYBOOK_MODULE_PREVIEW_API__,k={title:"util/SwipeableViews",component:x,argTypes:{selectedIndex:{control:{type:"number",min:0,max:5}},onChange:h()}},a={render:({selectedIndex:t})=>{const[s,i]=v(),o=["https://picsum.photos/id/3/1000/600","https://picsum.photos/id/6/1000/600","https://picsum.photos/id/9/1000/600","https://picsum.photos/id/12/1000/600","https://picsum.photos/id/15/1000/600","https://picsum.photos/id/18/1000/600"];return n.jsxs("div",{children:[n.jsxs("nav",{style:{display:"flex",width:"100%",justifyContent:"space-between",padding:"var(--lotta-spacing) 0"},children:[n.jsx(d,{onClick:()=>i({selectedIndex:t-1}),disabled:t<=0,children:"previous"}),n.jsx(d,{onClick:()=>i({selectedIndex:t+1}),disabled:t>=o.length,children:"next"})]}),n.jsx(x,{...s,onChange:e=>i({selectedIndex:e}),children:o.map((e,p)=>n.jsx("img",{alt:"Have fun and swipe!",src:e,style:{width:"100%"}},p))})]})},args:{selectedIndex:0,onChange:h()},play:async({canvasElement:t})=>{const s=g(t),i=s.getByRole("button",{name:"next"}),o=s.getByRole("button",{name:"previous"}),e=s.getByTestId("movingStrip");r(e).toHaveStyle("left: 0px"),c.click(i),await l(()=>{r(e).not.toHaveStyle("left: 0px")}),await new Promise(p=>setTimeout(p,500)),c.click(o),await l(()=>{r(e).toHaveStyle("left: 0px")})}};var m,u,w;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: ({
    selectedIndex
  }) => {
    const [args, updateArgs] = useArgs<SwipeableViewsProps>();
    const images = ['https://picsum.photos/id/3/1000/600', 'https://picsum.photos/id/6/1000/600', 'https://picsum.photos/id/9/1000/600', 'https://picsum.photos/id/12/1000/600', 'https://picsum.photos/id/15/1000/600', 'https://picsum.photos/id/18/1000/600'];
    return <div>
        <nav style={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        padding: 'var(--lotta-spacing) 0'
      }}>
          <Button onClick={() => updateArgs({
          selectedIndex: selectedIndex - 1
        })} disabled={selectedIndex <= 0}>
            previous
          </Button>
          <Button onClick={() => updateArgs({
          selectedIndex: selectedIndex + 1
        })} disabled={selectedIndex >= images.length}>
            next
          </Button>
        </nav>
        <SwipeableViews {...args} onChange={selectedIndex => updateArgs({
        selectedIndex
      })}>
          {images.map((image, i) => <img alt={'Have fun and swipe!'} key={i} src={image} style={{
          width: '100%'
        }} />)}
        </SwipeableViews>
      </div>;
  },
  args: {
    selectedIndex: 0,
    onChange: fn()
  },
  play: async ({
    canvasElement
  }) => {
    const screen = within(canvasElement);
    const nextButton = screen.getByRole('button', {
      name: 'next'
    });
    const previousButton = screen.getByRole('button', {
      name: 'previous'
    });
    const swipeableViews = screen.getByTestId('movingStrip');
    expect(swipeableViews).toHaveStyle('left: 0px');
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(swipeableViews).not.toHaveStyle('left: 0px');
    });
    await new Promise(reslve => setTimeout(reslve, 500));
    fireEvent.click(previousButton);
    await waitFor(() => {
      expect(swipeableViews).toHaveStyle('left: 0px');
    });
  }
}`,...(w=(u=a.parameters)==null?void 0:u.docs)==null?void 0:w.source}}};const A=["Default"];export{a as Default,A as __namedExportsOrder,k as default};
