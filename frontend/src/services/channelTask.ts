import { getChannel } from "./channel";

export interface Task {
    name: string;
    group: number;
    position: number;
}

export function submitLoadTasks(): Promise<Task[]> {
    return getChannel()
        .get("/task")
        .then((r) => {
            const { error, tasks } = r.data;

            if (error < 0) throw error;

            return tasks;
        });
}

export function submitUpdateTask(task: Task) {
    return getChannel().post("/task", task);
}

export function submitDeleteTask(taskName: string) {
    return getChannel().delete("/task/" + taskName);
}
