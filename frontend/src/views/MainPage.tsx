import React from "react";
import "typeface-roboto";
import "normalize.css/normalize.css";
import "../styles/main.scss";
import sizeMe from "react-sizeme";
import ControlPanel from "./ControlPanel";
import BoardPanel from "./BoardPanel";
import { isLogin } from "../model/accountStore";
import LoginPanel from "./LoginPanel";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";

interface MainPageProps {
    size: {
        height: number;
        width: number;
    };
}

interface MainPageState {}

const darkMuiTheme = createMuiTheme(
    {
        typography: {
            fontFamily: "Roboto, sans-serif",
            htmlFontSize: 10,
            fontSize: 12,
        },
    },
    {}
);

class MainPage extends React.PureComponent<MainPageProps, MainPageState> {
    render() {
        const {
            size: { height, width },
        } = this.props;

        const style = {
            height,
            width,
            zIndex: 1,
        };

        const loginPrompt = isLogin() ? "" : <LoginPanel />;

        return (
            <MuiThemeProvider theme={darkMuiTheme}>
                <div
                    style={style}
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                >
                    {loginPrompt}
                    <ControlPanel />
                    <BoardPanel />
                </div>
            </MuiThemeProvider>
        );
    }
}

export default sizeMe({ monitorHeight: true, refreshRate: 100 })(MainPage);
