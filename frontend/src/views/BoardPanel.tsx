import React from "react";
import { Subscription } from "rxjs";
import { Grid, Typography } from "@material-ui/core";
import TaskGroup from "./TaskGroup";

interface BoardPanelProps {
    height: number;
}

interface BoardPanelState {
    refresh: number;
}

export default class BoardPanel extends React.PureComponent<BoardPanelProps, BoardPanelState> {
    state = {
        refresh: 0,
    };
    eventSub: Subscription[] = [];

    subscribeEvents() {}

    unsubscribeEvents() {
        this.eventSub.forEach((e) => e.unsubscribe());
        this.eventSub.splice(0, this.eventSub.length);
    }

    componentDidMount() {
        this.subscribeEvents();
    }

    componentWillUnmount() {
        this.unsubscribeEvents();
    }

    render() {
        const { height } = this.props;

        const titleStyle = { margin: "auto", height: 30 };

        const rootStyle = { height: height - titleStyle.height };

        return (
            <React.Fragment>
                <Typography variant="h6" align="center" style={titleStyle}>
                    Kanban board
                </Typography>

                <Grid container style={rootStyle}>
                    <Grid item xs={3}>
                        <TaskGroup group={0} label={"Backlog"} />
                    </Grid>
                    <Grid item xs={3}>
                        <TaskGroup group={1} label={"To do"} />
                    </Grid>

                    <Grid item xs={3}>
                        <TaskGroup group={2} label={"Ongoing"} />
                    </Grid>

                    <Grid item xs={3}>
                        <TaskGroup group={3} label={"Done"} />
                    </Grid>
                </Grid>
            </React.Fragment>
        );
    }
}
