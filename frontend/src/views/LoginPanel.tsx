import React, { ChangeEvent, CSSProperties } from "react";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import LoadingButton from "../controls/LoadingButton";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import Visibility from "@material-ui/icons/Visibility";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import { login, setSelfAccount } from "../model/accountStore";
import { loadTasks } from "../model/taskStore";
import { Card } from "@material-ui/core";

const submitBtnStyle: CSSProperties = {
    marginTop: "1em",
    marginBottom: "1em",
};

interface LoginPanelProps {}

interface LoginPanelState {
    isSubmitting: boolean;
    errorMsg: string;
    userID: string;
    password: string;
    showPassword: boolean;
}

export default class LoginPanel extends React.PureComponent<LoginPanelProps, LoginPanelState> {
    state: LoginPanelState = {
        errorMsg: "",
        isSubmitting: false,
        password: "demo",
        showPassword: false,
        userID: "demo",
    };

    onSubmit = () => {
        this.setState({ isSubmitting: true, errorMsg: "" }, () => {
            const { userID, password } = this.state;

            login(userID, password).then(
                () =>
                    loadTasks()
                        .then(() => {
                            setSelfAccount(userID);
                        })
                        .catch((result) => {
                            this.onError("fail to load tasks: " + result.toString());
                        }),
                (result) => {
                    this.onError("login fail:" + result.toString());
                }
            );
        });
    };

    private onError = (errorMsg: string) => {
        this.setState({ errorMsg, isSubmitting: false });
    };

    onUserIDChange(val: string) {
        this.setState({ userID: val });
    }

    render() {
        const { userID, password, isSubmitting, errorMsg, showPassword } = this.state;
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

        let passwordValue = password;

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
                        fullWidth={true}
                        onClick={this.onSubmit}
                    />
                </CardContent>
            </Card>
        );
    }
}
