import React from "react";
import { addons, types } from "@storybook/addons";
import { AddonPanel, ColorControl, TableWrapper } from "@storybook/components";
import { initialState } from "./setThemeDecorator";

const ADDON_ID = "storybook-css-variables-theming";
const PANEL_ID = `${ADDON_ID}/panel`;

const colorRegex = /rgba?\((?<r>\d+),\s?(?<g>\d+)\s?,(?<b>\d+)\s?,(?:(?<alpha>\d+)\s?)\)/;

const Panel = () => {
  const [state, setState] = React.useState(initialState);

  React.useEffect(() => {
    document
      .querySelector("#storybook-preview-iframe")
      .contentWindow.postMessage(
        "Lotta-Storybook-CSS-Theming-Addon:" + JSON.stringify(state)
      );

    localStorage.setItem("lotta-theme", JSON.stringify(state));
  }, [state]);

  return (
    <TableWrapper>
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(state).map(([key, val]) => (
          <tr>
            <td>{key}</td>
            <td>
              <ColorControl
                name={key}
                value={`rgba(${[...val, 1].join(",")})`}
                onChange={(v) => {
                  if (v.match(colorRegex)?.groups) {
                    const { r, g, b } = v.match(colorRegex).groups;
                    setState({
                      ...state,
                      [key]: [r, g, b].map((i) => parseInt(i, 10)),
                    });
                  }
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrapper>
  );
};

addons.register(ADDON_ID, (api) => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: "Lotta Theme",
    render: ({ active, key }) => (
      <AddonPanel active={active} key={key}>
        <Panel />
      </AddonPanel>
    ),
  });
});
