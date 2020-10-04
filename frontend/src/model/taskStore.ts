import { Subject } from "rxjs";
import { memoryDB } from "../services/lokiStore";
import { Task, submitUpdateTask, submitDeleteTask, submitLoadTasks } from "../services/channelTask";

const PROP_NAME = "name";
const PROP_GROUP = "group";
const PROP_POSITION = "position";

export enum EVENT {
    CHANGE,
    DELETE,
}

export interface TaskEvent {
    type: EVENT;
    task: Task | string;
}

export const taskEventStream = new Subject<TaskEvent>();

function getTaskTable() {
    const tableName = "tasks";

    let table = memoryDB.getCollection(tableName);

    if (!table) {
        table = memoryDB.addCollection(tableName, {
            unique: [PROP_NAME],
            indices: [PROP_GROUP],
        });
    }

    return table;
}

function registerTask(task: Task) {
    const table = getTaskTable();

    let result = table.by(PROP_NAME, task.name);

    if (result) {
        Object.keys(task).forEach((key) => {
            (result as any)[key] = (task as any)[key];
        });

        table.update(result);
    } else {
        result = table.insertOne(task);
    }

    return result;
}

export function loadTasks() {
    return submitLoadTasks().then((r) => {
        r.forEach((t) => registerTask(t));
    });
}

export function getTask(taskName: string) {
    const table = getTaskTable();

    return table.by(PROP_NAME, taskName);
}

export function getTasks(group: number) {
    const table = getTaskTable();
    const viewName = "taskGroup" + group;

    let view = table.getDynamicView(viewName);

    if (!view) {
        view = table
            .addDynamicView(viewName, { persistent: true })
            .applyFind({ [PROP_GROUP]: { $eq: group } })
            .applySimpleSort(PROP_POSITION);
    }

    return view.data();
}

export function updateTask(task: Task) {
    return submitUpdateTask(task).then(() => {
        const result = registerTask(task);

        taskEventStream.next({ type: EVENT.CHANGE, task: result });

        return result;
    });
}

export function deleteTask(taskName: string) {
    return submitDeleteTask(taskName).then(() => {
        const table = getTaskTable();
        const result = table.by(PROP_NAME, taskName);

        if (result) {
            table.remove(result);
        }

        taskEventStream.next({ type: EVENT.DELETE, task: taskName });

        return result;
    });
}
