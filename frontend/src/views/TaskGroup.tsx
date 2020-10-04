import React from "react";
import { FixedSizeList as ListScroll, ListProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { getTasks, taskEventStream } from "../model/taskStore";
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

    renderTaskRow: ListProps["children"] = ({ index, style }) => {
        const { group } = this.props;
        const tasks = getTasks(group);
        return (
            <Button style={style}>
                Task {index} {tasks[index].name};
            </Button>
        );
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
                                className="List"
                                height={height}
                                itemCount={tasks.length}
                                itemSize={35}
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
