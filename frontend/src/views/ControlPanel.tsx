import React from "react";
import { Subscription } from "rxjs";
import { Button, Grid, TextField, Typography } from "@material-ui/core";
import {
    deleteTask,
    EVENT,
    getFocusTask,
    getTask,
    getTasks,
    taskEventStream,
    updateTask,
} from "../model/taskStore";
import { Task } from "../services/channelTask";
import { filter } from "rxjs/operators";

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
    pendingAction: ACTION;
    error: string;
    errorAction: ACTION;
    refresh: number;
}

export default class ControlPanel extends React.PureComponent<
    ControlPanelProps,
    ControlPanelState
> {
    state = {
        taskName: "",
        pendingAction: ACTION.IDLE,
        errorAction: ACTION.IDLE,
        error: "",
        refresh: 0,
    };
    eventSub: Subscription[] = [];

    updateTask(action: ACTION, task: Task) {
        this.setState({ pendingAction: action, error: "", errorAction: ACTION.IDLE }, () => {
            let promise;

            if (action === ACTION.DELETE) promise = deleteTask(task.name);
            else promise = updateTask(task);

            promise
                .catch((e) => {
                    this.setState({ error: e.toString(), errorAction: action });
                })
                .finally(() => {
                    this.setState({ pendingAction: ACTION.IDLE });
                });
        });
    }

    private getMaxPositionInGroup(group: number) {
        const taskList = getTasks(group);

        let position;

        if (taskList.length > 0) position = taskList[taskList.length - 1].position + 1;
        else position = getTasks(group).length;

        return position;
    }

    onCreateTask = () => {
        const { taskName } = this.state;

        if (!getTask(taskName)) {
            const position = getTasks(0).length;
            const task = { name: taskName, group: 0, position };

            this.updateTask(ACTION.CREATE, task);
        } else this.setState({ errorAction: ACTION.CREATE, error: "task name is duplciated" });
    };

    onMoveBack = () => {
        const task = getTask(getFocusTask());

        if (task) {
            const group = task.group - 1;
            if (group >= 0) {
                task.position = this.getMaxPositionInGroup(group);
                task.group = group;

                this.updateTask(ACTION.MOVE_BACK, task);
            }
        }
    };

    onMoveForward = () => {
        const task = getTask(getFocusTask());

        if (task) {
            const group = task.group + 1;
            if (group <= MAX_GROUP) {
                task.group = group;
                task.position = this.getMaxPositionInGroup(group);

                this.updateTask(ACTION.MOVE_FORWARD, task);
            }
        }
    };
    onDelete = () => {
        this.updateTask(ACTION.DELETE, { group: 0, name: getFocusTask(), position: 0 });
    };
    onNewTaskNameChange = (event: any) => {
        let errorAction = this.state.errorAction;

        if (errorAction === ACTION.CREATE) {
            errorAction = ACTION.IDLE;
        }

        this.setState({ errorAction, taskName: event.target.value });
    };

    componentDidMount() {
        this.eventSub.push(
            taskEventStream.pipe(filter((e) => e.type === EVENT.FOCUS)).subscribe(() => {
                this.setState({ refresh: this.state.refresh + 1 });
            })
        );
    }

    componentWillUnmount() {
        this.eventSub.forEach((e) => e.unsubscribe());
    }

    render() {
        const buttonStyle = {
            margin: "8px 4px",
        };

        const { pendingAction, taskName, error, errorAction } = this.state;

        const focusTask = getFocusTask();

        const isSubmitting = pendingAction !== ACTION.IDLE;

        const isUpdateError = errorAction !== ACTION.CREATE && errorAction !== ACTION.IDLE;

        const isReadyForUpdate = !isSubmitting && !Boolean(focusTask);
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
                            value={focusTask}
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
