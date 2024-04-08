import { Database } from "./objectStorage";
import { NodeId } from "./pythonFileTypes";

export type PackageId = string;
export class Package {
    isFile: boolean;
    status: "initiating" | "parsing" | "ready";
    filePath: string;
    name: string;
    version: string;
    root?: NodeId;
    constructor(
        isFile: boolean,
        filePath: string,
        name: string,
        version: string
    ) {
        this.isFile = isFile;
        this.status = "initiating";
        this.filePath = filePath;
        this.name = name;
        this.version = version;
    }
    getSubModule(
        relativePath: string[],
        fromFile: boolean
    ): undefined | NodeId {
        // console.log("getting submodule: ", relativePath)
        if (this.root)
            return Database.getNode(this.root).getSubModule(
                relativePath,
                fromFile
            );
        return;
    }

    toJSON(): any {
        return {
            isFile: this.isFile,
            status: this.status,
            filePath: this.filePath,
            name: this.name,
            version: this.version,
            root: this.root,
        };
    }

    static fromJSON(json: any): Package {
        console.log("creating new package from json id: ",json.name);
        const packageObj = new Package(
            json.isFile,
            json.filePath,
            json.name,
            json.version
        );
        packageObj.status = json.status;
        packageObj.root = json.root;
        return packageObj;
    }
}
