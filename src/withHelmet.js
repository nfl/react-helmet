/* eslint react/display-name: 0 */
import React from "react";
import createElement from "recompose/createElement";
import createHelper from "recompose/createHelper";
import Helmet from "./Helmet.js";

const withHelmet = (propsMapper, BaseComponent) => props => (
  <div>
    <Helmet {...propsMapper(props)} />
    {createElement(BaseComponent, props)}
  </div>
);

export default createHelper(withHelmet, "withHelmet");
