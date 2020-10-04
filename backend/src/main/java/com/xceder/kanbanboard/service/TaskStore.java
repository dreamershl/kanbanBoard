package com.xceder.kanbanboard.service;

import com.xceder.kanbanboard.dto.ERROR;
import com.xceder.kanbanboard.dto.Task;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class TaskStore {
    public ERROR login(String account, String password) {
        return ERROR.FAIL;
    }

    public ERROR update(String account, Task task) {
        return ERROR.FAIL;
    }

    public ERROR delete(String account, String taskName) {
        return ERROR.FAIL;
    }

    public @Nullable Task getTask(String account, String taskName) {
        return null;
    }

    public List<Task> getAllTask(String account) {
        return Collections.emptyList();
    }
}
