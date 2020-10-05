package com.xceder.kanbanboard.dto;

import java.util.Collection;

public class ResponseTask extends Response {
    public final Collection<Task> tasks;

    public ResponseTask(ERROR error, Collection<Task> taskList) {
        super(error);
        this.tasks = taskList;
    }
}
