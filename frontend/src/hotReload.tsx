import { hot } from "react-hot-loader/root";
import React from "react";
import { render } from "react-dom";
import MainPage from "./views/MainPage";

const ReloadPage = hot(MainPage);
render(<ReloadPage />, document.getElementById("app"));
