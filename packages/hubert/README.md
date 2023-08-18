# Hubert

Hubert is a slim component library we use for the
[lotta project](https://lotta.schule), a modern, easy-to use open source
solution for the educational sector which wants to get privacy and security right.

[See available components on our storybook](https://lotta-schule.github.io/hubert)

## Install

npm install @lotta-schule/hubert

## Usage

### Provider and Styles

You will need to add the provider, as well as the <GlobalStyles /> component.

The <GlobalStyles /> component is meant to be rendered only once per web page.
It is save to be rendered in a React Server Component.

The provider is a React ContextProvider, and is needed only for [@react-aria](https://react-spectrum.adobe.com/react-aria/index.html)'s
OverlayProvider.
As we want to use as much RSC as possible, we're seeing if we can get rid of
this last one, too.

```TSX
import { GlobalStyles, HubertProvider } from '@lotta-schule/hubert';
import { DefaultThemes } from '@lotta-schule/theme';

export const App = () => {
  const theme = DefaultThemes.default;
  return (
    <HubertProvider>
      <GlobalStyles
        theme={theme}
        fonts={[
          { name: 'Roboto Slab', url: '/roboto-slab.css', },
        ]}
      />
    </HubertProvider>
  );
}
```
