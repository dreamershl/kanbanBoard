import React from "react";
import { Subscription } from "rxjs";
import { Button, Grid, TextField, Typography } from "@material-ui/core";
import { deleteTask, getTask, getTasks, updateTask } from "../model/taskStore";
import { Task } from "../services/channelTask";

enum ACTION {
    IDLE,
    CREATE,
    MOVE_BACK,
    MOVE_FORWARD,
    DELETE,
}

const MAX_GROUP = 3;

interface ControlPanelProps {}

interface ControlPanelState {
    taskName: string;
    chosenTask: string;
    pendingAction: ACTION;
    error: string;
    errorAction: ACTION;
}

export default class ControlPanel extends React.PureComponent<
    ControlPanelProps,
    ControlPanelState
> {
    state = {
        taskName: "",
        chosenTask: "",
        pendingAction: ACTION.IDLE,
        errorAction: ACTION.IDLE,
        error: "",
    };
    eventSub: Subscription[] = [];

    updateTask(action: ACTION, task: Task) {
        this.setState({ pendingAction: action, error: "", errorAction: ACTION.IDLE }, () => {
            let promise;

            if (action === ACTION.DELETE) promise = deleteTask(task.name);
            else promise = updateTask(task);

            promise
                .then(() => {})
                .catch((e) => {
                    this.setState({ error: e.toString(), errorAction: action });
                })
                .finally(() => {
                    this.setState({ pendingAction: ACTION.IDLE });
                });
        });
    }

    onCreateTask = () => {
        const { taskName } = this.state;
        const position = getTasks(0).length;
        const task = { name: taskName, group: 0, position };

        this.updateTask(ACTION.CREATE, task);
    };

    onMoveBack = () => {
        const { chosenTask } = this.state;
        const task = getTask(chosenTask);

        if (task) {
            const group = task.group - 1;
            if (group >= 0) {
                task.group = group;
                task.position = getTasks(group).length;

                this.updateTask(ACTION.MOVE_BACK, task);
            }
        }
    };

    onMoveForward = () => {
        const { chosenTask } = this.state;
        const task = getTask(chosenTask);

        if (task) {
            const group = task.group + 1;
            if (group <= MAX_GROUP) {
                task.group = group;
                task.position = getTasks(group).length;

                this.updateTask(ACTION.MOVE_FORWARD, task);
            }
        }
    };
    onDelete = () => {
        const { chosenTask } = this.state;
        this.updateTask(ACTION.DELETE, { group: 0, name: chosenTask, position: 0 });
    };
    onNewTaskNameChange = (event: any) => {
        this.setState({ taskName: event.target.value });
    };

    unsubscribeEvents() {
        this.eventSub.forEach((e) => e.unsubscribe());
        this.eventSub.splice(0, this.eventSub.length);
    }

    componentWillUnmount() {
        this.unsubscribeEvents();
    }

    render() {
        const buttonStyle = {
            margin: "8px 4px",
        };

        const { pendingAction, taskName, chosenTask, error, errorAction } = this.state;

        const isSubmitting = pendingAction !== ACTION.IDLE;

        const isUpdateError = errorAction !== ACTION.CREATE && errorAction !== ACTION.IDLE;

        const isReadyForUpdate = !isSubmitting && !Boolean(chosenTask);
        return (
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h6" align="center">
                        Controls
                    </Typography>
                </Grid>
                <Grid container item xs={12} spacing={2}>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="new task name"
                            value={taskName}
                            disabled={isSubmitting}
                            error={errorAction === ACTION.CREATE}
                            helperText={errorAction === ACTION.CREATE ? error : ""}
                            onChange={this.onNewTaskNameChange}
                        />
                    </Grid>
                    <Grid item xs={8}>
                        <Button
                            style={buttonStyle}
                            variant="contained"
                            onClick={this.onCreateTask}
                            disabled={!Boolean(taskName) || isSubmitting}
                        >
                            Create
                        </Button>
                    </Grid>
                </Grid>

                <Grid container item xs={12} spacing={2}>
                    <Grid item xs={4}>
                        <TextField
                            disabled
                            fullWidth
                            variant="outlined"
                            error={isUpdateError}
                            helperText={isUpdateError ? error : ""}
                            placeholder="Click on existing task"
                        />
                    </Grid>
                    <Grid item xs={8}>
                        <Button
                            style={buttonStyle}
                            variant="contained"
                            onClick={this.onMoveBack}
                            disabled={isReadyForUpdate}
                        >
                            Move Back
                        </Button>
                        <Button
                            style={buttonStyle}
                            variant="contained"
                            onClick={this.onMoveForward}
                            disabled={isReadyForUpdate}
                        >
                            Move Forward
                        </Button>
                        <Button
                            style={buttonStyle}
                            variant="contained"
                            onClick={this.onDelete}
                            disabled={isReadyForUpdate}
                        >
                            Delete
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}
