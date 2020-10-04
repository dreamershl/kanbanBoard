package com.xceder.kanbanboard.dto;

import java.util.List;

public class ResponseTask extends Response {
    public final List<Task> taskList;

    public ResponseTask(ERROR error, List<Task> taskList) {
        super(error);
        this.taskList = taskList;
    }
}
