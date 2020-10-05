import React from "react";
import "typeface-roboto";
import "normalize.css/normalize.css";
import "../styles/main.scss";
import sizeMe from "react-sizeme";
import ControlPanel from "./ControlPanel";
import BoardPanel from "./BoardPanel";
import { accountEventStream, isLogin } from "../model/accountStore";
import LoginPanel from "./LoginPanel";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core";
import { Subscription } from "rxjs";

interface MainPageProps {
    size: {
        height: number;
        width: number;
    };
}

interface MainPageState {
    refresh: number;
}

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
    eventSub: Subscription[] = [];

    state = { refresh: 0 };

    onSessionChange = () => {
        this.setState({ refresh: this.state.refresh + 1 });
    };

    componentDidMount() {
        this.eventSub.push(accountEventStream.subscribe(this.onSessionChange));
    }

    componentWillUnmount() {
        this.eventSub.forEach((e) => e.unsubscribe());
    }

    render() {
        const {
            size: { height, width },
        } = this.props;

        const style = {
            height,
            width,
            zIndex: 1,
        };

        let clientArea;

        if (isLogin()) {
            clientArea = (
                <React.Fragment>
                    <ControlPanel />
                    <BoardPanel height={height - 30} />
                </React.Fragment>
            );
        } else clientArea = <LoginPanel />;

        return (
            <MuiThemeProvider theme={darkMuiTheme}>
                <div
                    style={style}
                    onContextMenu={(e) => {
                        e.preventDefault();
                    }}
                >
                    {clientArea}
                </div>
            </MuiThemeProvider>
        );
    }
}

export default sizeMe({ monitorHeight: true, refreshRate: 100 })(MainPage);
