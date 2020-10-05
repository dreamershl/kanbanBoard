import React from "react";
import { FixedSizeList as ListScroll, ListProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { getFocusTask, getTasks, setFocusTask, taskEventStream } from "../model/taskStore";
import { Button, Typography } from "@material-ui/core";
import { Subscription } from "rxjs";

interface TaskGroupProps {
    group: number;
    label: string;
}

interface TaskGroupState {
    refresh: number;
}

export default class TaskGroup extends React.PureComponent<TaskGroupProps, TaskGroupState> {
    subscription!: Subscription;

    listRef = React.createRef<ListScroll>();

    state = { refresh: 0 };

    renderTaskRow: ListProps["children"] = ({ index, style }) => {
        const { group } = this.props;
        const tasks = getTasks(group);
        const buttonStyle = { ...style, margin: 10, width: "90%" };
        const taskName = tasks[index].name;
        const color = taskName === getFocusTask() ? "primary" : "default";
        return (
            <Button
                data-name={taskName}
                style={buttonStyle}
                variant="outlined"
                color={color}
                onClick={this.onClickTask}
            >
                Task {index} {taskName}
            </Button>
        );
    };

    onClickTask = (event: React.MouseEvent<HTMLButtonElement>) => {
        setFocusTask(event.currentTarget.dataset.name || "");
        this.listRef.current?.forceUpdate();
    };

    componentDidMount() {
        this.subscription = taskEventStream.subscribe(() => {
            this.setState({ refresh: this.state.refresh + 1 });
        });
    }

    componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    render() {
        const { group, label } = this.props;
        const tasks = getTasks(group);

        return (
            <React.Fragment>
                <Typography variant="subtitle2">{label}</Typography>
                <AutoSizer>
                    {(param) => {
                        const { height, width } = param;
                        return (
                            <ListScroll
                                ref={this.listRef}
                                className="List"
                                height={height}
                                itemCount={tasks.length}
                                itemSize={60}
                                width={width}
                            >
                                {this.renderTaskRow}
                            </ListScroll>
                        );
                    }}
                </AutoSizer>
            </React.Fragment>
        );
    }
}
