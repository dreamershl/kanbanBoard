package com.xceder.kanbanboard.controller;

import com.xceder.kanbanboard.dto.ERROR;
import com.xceder.kanbanboard.dto.Response;
import com.xceder.kanbanboard.dto.RequestUpdateTask;
import com.xceder.kanbanboard.dto.ResponseLogin;
import com.xceder.kanbanboard.dto.ResponseTask;
import com.xceder.kanbanboard.dto.Task;
import com.xceder.kanbanboard.service.AccountStore;
import com.xceder.kanbanboard.service.TaskStore;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.websocket.server.PathParam;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class ControllerTask {
    private final AccountStore accountStore;
    private final TaskStore taskStore;

    @Autowired
    public ControllerTask(AccountStore accountStore, TaskStore taskStore) {
        this.accountStore = accountStore;
        this.taskStore = taskStore;
    }

    @RequestMapping(path = "/doc", method = RequestMethod.GET)
    public Map<String, String> getApiDoc() {
        Map<String, String> result = new HashMap<>();

        result.put("GET /api/doc", "get the api spec");
        result.put("GET /api/login?account=xxx&password=xxx", "login the system");
        result.put("POST /api/task", "update the task, need set the header token with the session");
        result.put("GET /api/task?task=xxx", "get the task, if the 'task' is blank, means return all tasks. need set the header token with the session");
        result.put("DELETE /api/task?task=xxx", "delete the task. need set the header token with the session");

        return result;
    }

    @RequestMapping(value = "/login", method = RequestMethod.GET)
    public Response login(@RequestParam(name = "account", defaultValue = "") String account, @RequestParam(name = "password", defaultValue = "") String password) {
        Pair<ERROR, String> pair = accountStore.login(account, password);
        return new ResponseLogin(pair.getLeft(), pair.getRight());
    }

    @RequestMapping(value = "/task", method = RequestMethod.POST)
    public Response updateTask(@RequestHeader(name = "token", defaultValue = "") String session, @RequestBody Task request) {
        ERROR error = ERROR.INVALID_PARAMS;
        if (request != null) {
            String account = accountStore.getAccount(session);

            taskStore.update(account, request);
            error = ERROR.SUCCESS;
        }

        return new Response(error);
    }

    @RequestMapping(value = "/task/{taskName}", method = RequestMethod.DELETE)
    public Response deleteTask(@RequestHeader(name = "token", defaultValue = "") String session, @PathVariable("taskName") String taskName) {
        ERROR error = ERROR.SUCCESS;
        if(taskName == null || taskName.isEmpty())
        {
            error = ERROR.INVALID_PARAMS;
        }
        else {
            String account = accountStore.getAccount(session);
            taskStore.delete(account, taskName);
        }

        return new Response(error);
    }

    @RequestMapping(value = "/task", method = RequestMethod.GET)
    public Response getTask(@RequestHeader(name = "token", defaultValue = "") String session, @RequestParam(name = "task", defaultValue = "") String taskName) {
        ERROR error = ERROR.SUCCESS;
        Collection<Task> taskList = Collections.emptyList();

        String account = accountStore.getAccount(session);

        if (taskName.isEmpty())
            taskList = taskStore.getAllTask(account);
        else {
            Task task = taskStore.getTask(account, taskName);

            if (task != null)
                taskList = Collections.singletonList(task);
            else
                error = ERROR.NOT_EXIST;
        }

        return new ResponseTask(error, taskList);
    }
}
