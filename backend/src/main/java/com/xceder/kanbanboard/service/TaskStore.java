package com.xceder.kanbanboard.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.RemovalNotification;
import com.xceder.kanbanboard.dto.ERROR;
import com.xceder.kanbanboard.dto.Task;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TaskStore {

    private final Cache<String, ConcurrentHashMap<String, Task>> cache = buildCache();

    private Cache<String, ConcurrentHashMap<String, Task>> buildCache() {
        //Todo: should load the record from the hard disk or database
        return CacheBuilder.newBuilder().removalListener(this::onRemoveCache).build();
    }

    private void onRemoveCache(RemovalNotification<String, ConcurrentHashMap<String, Task>> notification) {
        //Todo: should archive the expired records
    }

    private ConcurrentHashMap<String, Task> getOrCreateTaskMap(String account)
    {
        ConcurrentHashMap<String, Task> taskMap = cache.getIfPresent(account);
        if (taskMap == null) {
            taskMap = new ConcurrentHashMap<>();
            cache.put(account, taskMap);
        }

        return taskMap;
    }

    public void update(String account, Task task) {
        ConcurrentHashMap<String, Task> taskMap = getOrCreateTaskMap(account);
        taskMap.put(task.name, task);
    }

    public void delete(String account, String taskName) {
        ConcurrentHashMap<String, Task> taskMap = getOrCreateTaskMap(account);
        taskMap.remove(taskName);
    }

    public @Nullable
    Task getTask(String account, String taskName) {
        ConcurrentHashMap<String, Task> taskMap = getOrCreateTaskMap(account);

        return taskMap.get(taskName);
    }

    public Collection<Task> getAllTask(String account) {
        ConcurrentHashMap<String, Task> taskMap = getOrCreateTaskMap(account);
        return taskMap.values();
    }
}
