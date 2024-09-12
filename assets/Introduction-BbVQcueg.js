import{j as t}from"./jsx-runtime-BjG_zV1W.js";import{useMDXComponents as r}from"./index-DoMPt_pv.js";import{ae as s}from"./index-CRpHN7gj.js";import"./index-CbIUIaG1.js";import"./_commonjsHelpers-BosuxZz1.js";import"./iframe-BOHzy0yO.js";import"../sb-preview/runtime.js";import"./index-DsJRWNrc.js";import"./index-D-8MO0q_.js";import"./index-C0B9YxHH.js";import"./isObjectLike-DExiV3nx.js";import"./isSymbol-Ba4JPt5E.js";import"./index-DrFu-skq.js";function o(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",p:"p",pre:"pre",...r(),...e.components};return t.jsxs(t.Fragment,{children:[t.jsx(s,{title:"Intro"}),`
`,t.jsx(n.h1,{id:"hi--this-is-hubert-a-slim-component-library-built-for-lotta",children:"Hi 👋. This is Hubert. A slim component library built for lotta"}),`
`,t.jsxs(n.p,{children:[`Hubert is a slim component library we use for the
`,t.jsx(n.a,{href:"https://lotta.schule",rel:"nofollow",children:"lotta project"}),`, a modern, easy-to use open source
solution for the educational sector which wants to get privacy and security right.`]}),`
`,t.jsx(n.h2,{id:"install",children:"Install"}),`
`,t.jsx(n.p,{children:"Install the package via npm"}),`
`,t.jsx(n.pre,{children:t.jsx(n.code,{className:"language-bash",children:`npm install @lotta-schule/hubert
`})}),`
`,t.jsx(n.p,{children:"At the top of your react tree, add the Provider, which loads some basic styling:"}),`
`,t.jsx(n.pre,{children:t.jsx(n.code,{className:"language-tsx",children:`import { HubertProvider } from '@lotta-schule/hubert';

export const MyTopComponent = () => (
  <HubertProvider>
    <MyMainComponent />
  </HubertProvider>
);
`})}),`
`,t.jsx(n.p,{children:"You can also pass an object with supported fonts to the provider:"}),`
`,t.jsx(n.pre,{children:t.jsx(n.code,{className:"language-tsx",children:`import { HubertProvider } from '@lotta-schule/hubert';

export const MyTopComponent = () => (
  <HubertProvider
    supportedFonts={[
      {
        name: 'Quicksand',
        url: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300&display=swap',
      },
    ]}
  >
    <MyMainComponent />
  </HubertProvider>
);
`})})]})}function y(e={}){const{wrapper:n}={...r(),...e.components};return n?t.jsx(n,{...e,children:t.jsx(o,{...e})}):o(e)}export{y as default};
