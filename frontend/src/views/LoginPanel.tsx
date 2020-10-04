import React, { ChangeEvent, CSSProperties } from "react";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import LoadingButton from "../controls/loadingButton";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Visibility from "@material-ui/icons/Visibility";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import { login } from "../model/accountStore";
import { loadTasks } from "../model/taskStore";
import { Card } from "@material-ui/core";

const LOADING_COUNT = 2;
const submitBtnStyle: CSSProperties = {
    marginTop: "1em",
    marginBottom: "1em",
};

interface LoginPanelProps {}

interface LoginPanelState {
    isSubmitting: boolean;
    errorMsg: string;
    isUserInput: boolean;
    userID: string;
    password: string;
    lastLoginPassword: string;
    keepLoginInfo: boolean;
    showPassword: boolean;
    loadingStep: number;
    loginProgress: number;
}

export default class LoginPanel extends React.PureComponent<LoginPanelProps, LoginPanelState> {
    state: LoginPanelState = {
        errorMsg: "",
        isSubmitting: false,
        isUserInput: false,
        keepLoginInfo: false,
        lastLoginPassword: "",
        loadingStep: 0,
        loginProgress: 0,
        password: "",
        showPassword: false,
        userID: "",
    };

    onSubmit = () => {
        this.setState(
            { isSubmitting: true, errorMsg: "", loginProgress: 0, loadingStep: 0 },
            () => {
                const { userID, password } = this.state;

                if (password !== this.state.lastLoginPassword) {
                    login(userID, password)
                        .then(
                            () => this.loadTasks(),
                            (result) => {
                                this.onError("login fail:" + result.toString());
                            }
                        )
                        .finally(() => {
                            this.setState({
                                isSubmitting: false,
                                loginProgress: 0,
                                loadingStep: 0,
                            });
                        });
                }
            }
        );
    };

    private onError = (errorMsg: string) => {
        this.setState({ errorMsg });
    };

    private loadTasks() {
        return loadTasks().then(
            () => {
                this.setLoadingProgress();
            },
            (result) => {
                this.onError("fail to load tasks: " + result.toString());
            }
        );
    }

    setLoadingProgress = () => {
        const loadingStep = this.state.loadingStep + 1;

        this.setState({
            loadingStep,
            loginProgress: Math.floor(loadingStep / LOADING_COUNT),
        });
    };

    onLoginProgress = (countDown: number) => {
        this.setState({ loginProgress: Math.floor(countDown * 0.6) });
    };

    onUserIDChange(val: string) {
        this.setState({ userID: val, isUserInput: true });
    }

    onUserInput() {
        if (!this.state.isUserInput) this.setState({ isUserInput: true });
    }

    updateCheck = (event: ChangeEvent<HTMLInputElement>, value: boolean) => {
        this.setState({ keepLoginInfo: value });
    };

    render() {
        const {
            userID,
            password,
            isSubmitting,
            errorMsg,
            showPassword,
            lastLoginPassword,
            loginProgress,
        } = this.state;
        const canSubmit = Boolean(userID) && Boolean(password);

        const rootStyle: CSSProperties = {
            width: 360,
            margin: "auto",
            zIndex: 1,
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
        };

        const togglePWDShow = {
            endAdornment: (
                <InputAdornment position="end">
                    <IconButton
                        onClick={() => {
                            this.setState({ showPassword: !showPassword });
                        }}
                    >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                </InputAdornment>
            ),
        };

        let passwordValue;

        if (showPassword) passwordValue = password === lastLoginPassword ? "" : password;
        else passwordValue = password;

        return (
            <Card style={rootStyle}>
                <CardContent>
                    <TextField
                        name="userID"
                        fullWidth={true}
                        value={userID}
                        disabled={isSubmitting}
                        placeholder="Login ID"
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            this.onUserIDChange(event.target.value);
                        }}
                        required
                    />

                    <TextField
                        name="password"
                        type={showPassword ? "text" : "password"}
                        fullWidth={true}
                        disabled={isSubmitting}
                        placeholder="Password"
                        value={passwordValue}
                        onFocus={() => {
                            if (lastLoginPassword)
                                this.setState({ password: "", lastLoginPassword: "" });
                        }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                            this.setState({ password: event.target.value });
                        }}
                        InputProps={togglePWDShow}
                        required
                    />

                    <Typography color="error">{errorMsg}</Typography>

                    <LoadingButton
                        style={submitBtnStyle}
                        size="large"
                        type="submit"
                        variant="contained"
                        color="primary"
                        label="LOGIN"
                        disabled={isSubmitting || !canSubmit}
                        progress={isSubmitting ? loginProgress : 0}
                        fullWidth={true}
                        onClick={this.onSubmit}
                    />
                </CardContent>
            </Card>
        );
    }
}
