import React from "react";
import { Subscription } from "rxjs";
import { Grid, Typography } from "@material-ui/core";
import TaskGroup from "./TaskGroup";

interface BoardPanelProps {}

interface BoardPanelState {
    activeWindow: number;
    disableSelection: boolean;
    windowAction: boolean;
    refresh: number;
}

export default class BoardPanel extends React.PureComponent<BoardPanelProps, BoardPanelState> {
    state = {
        activeWindow: -1,
        disableSelection: false,
        selectedWindowList: [],
        windowAction: false,
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
        return (
            <Grid container>
                <Grid item xs={12}>
                    <Typography variant="h6" align="center">
                        Kanban board
                    </Typography>
                </Grid>
                <Grid item xs={3} spacing={2}>
                    <TaskGroup group={0} label={"Backlog"} />
                </Grid>

                <Grid item xs={3} spacing={2}>
                    <TaskGroup group={1} label={"To do"} />
                </Grid>

                <Grid item xs={3} spacing={2}>
                    <TaskGroup group={2} label={"Ongoing"} />
                </Grid>

                <Grid item xs={3} spacing={2}>
                    <TaskGroup group={3} label={"Done"} />
                </Grid>
            </Grid>
        );
    }
}
