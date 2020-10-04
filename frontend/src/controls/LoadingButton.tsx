import React, { CSSProperties } from "react";
import Button, { ButtonProps } from "@material-ui/core/Button";
import LinearProgress, { LinearProgressProps } from "@material-ui/core/LinearProgress";

interface LoadingButtonProps extends ButtonProps {
    label: string;
    labelStyle: CSSProperties;
    progress: number;
    progressType: LinearProgressProps["variant"];
}

export default class LoadingButton extends React.PureComponent<LoadingButtonProps> {
    static defaultProps = {
        progressType: "determinate",
        progress: 0,
        labelStyle: {},
    };

    render() {
        const { label, labelStyle, progress, progressType, ...buttonProps } = this.props;
        const btnLabel = label ? (
            <span style={{ display: "inline-block", ...labelStyle }} className="ellipse">
                {label}
            </span>
        ) : (
            ""
        );
        const progressStyle: CSSProperties = {
            position: "absolute",
            bottom: 0,
            width: "100%",
            backgroundColor: "transparent",
        };

        if (progress === 0) progressStyle.height = 0;

        return (
            <Button {...buttonProps}>
                {btnLabel}
                {this.props.children}
                <LinearProgress
                    color="secondary"
                    style={progressStyle}
                    variant={progressType}
                    value={progress}
                />
            </Button>
        );
    }
}
