import React from "react";
import "./banner.scss";

export const Banner: React.FC = ({ children }) => {
  return <div className={"banner"}>{children}</div>;
};
