import Loki from "lokijs";
import LokiIndexedAdapter from "lokijs/src/loki-indexed-adapter";
import configure from "../configure";

import errorLog from "../errorLog";

let adapter,
    isDBLoaded = false;

if (LokiIndexedAdapter.prototype.checkAvailability()) adapter = new LokiIndexedAdapter("xcederDB");
else adapter = new Loki.LokiLocalStorageAdapter();

const dbOptions = { autosave: true, autosaveInterval: 10000, adapter: adapter },
    dbReadyPromiseAry = [],
    xcederDB = new Loki("xcederApp.db", dbOptions);

export const memoryDB = new Loki("xcederMemoryDB", { persistenceMethod: "memory" });

export function clearMemoryDB() {
    memoryDB.listCollections().forEach((t) => memoryDB.removeCollection(t.name));
}

export default xcederDB;

export function isLoaded() {
    return isDBLoaded;
}

export function waitDBReady() {
    let promise;

    if (!isLoaded()) {
        promise = new Promise(function (resolve) {
            dbReadyPromiseAry.push(resolve);
        });
    } else promise = Promise.resolve();

    return promise;
}

//LokiPartitioningAdapter doesn't support the delete database
function clearDB() {
    xcederDB.listCollections().forEach((t) => xcederDB.removeCollection(t.name));

    getVersionRecord();
    setDBLoadedFlag(true);
}

function setDBLoadedFlag(flag) {
    isDBLoaded = flag;

    if (isDBLoaded) while (dbReadyPromiseAry.length > 0) dbReadyPromiseAry.pop()();
}

function getVersionRecord() {
    let tableName = "version",
        table = xcederDB.getCollection(tableName);

    if (!table) table = xcederDB.addCollection(tableName, { unique: ["app"] });

    let record = table.by("app", "xceder");

    if (!record) record = table.insertOne({ app: "xceder", version: configure.version }) || {};

    return record;
}

//check the version
function isExpiredDB() {
    const record = getVersionRecord();

    return record.version !== configure.version;
}

export function initLocalCacheDB() {
    if (!xcederDB._origLoadJSONObject) {
        xcederDB._origLoadJSONObject = xcederDB.loadJSONObject;

        xcederDB.loadJSONObject = function () {
            try {
                this._origLoadJSONObject.apply(this, arguments);
            } catch (exception) {
                let msg = exception.toString();

                if (exception instanceof Error) msg += "\n" + exception.stack;

                errorLog("fail to load database:" + msg);
                clearDB();
            }
        };

        xcederDB.loadDatabase({}, function (error) {
            let flag = true;

            if (error) errorLog("fail to load database:" + error);
            else if (isExpiredDB()) {
                flag = false;

                errorLog("local cache is expired");

                clearDB();
            }

            if (flag) setDBLoadedFlag(flag);

            console.info("finish load lokijs database:", flag);
        });
    }
}
