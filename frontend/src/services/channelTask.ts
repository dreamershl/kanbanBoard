import { getChannel, throwIfFail } from "./channel";

export interface Task {
    name: string;
    group: number;
    position: number;
}

export function submitLoadTasks(): Promise<Task[]> {
    return getChannel()
        .get("/task")
        .then((r) => {
            throwIfFail(r);
            return r.data.tasks;
        });
}

export function submitUpdateTask(task: Task) {
    return getChannel().post("/task", task).then(throwIfFail);
}

export function submitDeleteTask(taskName: string) {
    return getChannel()
        .delete("/task/" + taskName)
        .then(throwIfFail);
}
