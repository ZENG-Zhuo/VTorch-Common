import { Database } from "./objectStorage";
import { ClassInfo, FuncInfo } from "./pythonObjectTypes";

export function getBasename(filePath: string): string {
    const pathSegments = filePath.split("/");
    const filename = pathSegments[pathSegments.length - 1];
    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex !== -1) {
        return filename.substring(0, dotIndex);
    }
    return filename;
}

export type NodeId = string;
export class FileModuleNode {
    path: string;
    name: string;
    classes: ClassInfo[];
    functions: FuncInfo[];

    constructor(
        path: string,
        name: string,
        classes: ClassInfo[],
        functions: FuncInfo[]
    ) {
        this.path = path;
        this.name = name;
        this.classes = classes;
        this.functions = functions;
    }

    toString(): string {
        return this.toStringRecursive("");
    }

    public toStringRecursive(indentation: string): string {
        let result = `${indentation}FileModuleNode: ${this.name} (${this.path})\n`;
        indentation += "  ";
        for (const className of this.classes) {
            result += `${indentation}Class: ${className.toString()}\n`;
        }
        for (const functionName of this.functions) {
            result += `${indentation}Function: ${functionName.toString()}\n`;
        }
        return result;
    }

    toJSON(): any {
        return {
            path: this.path,
            name: this.name,
            classes: this.classes.map((classInfo) => classInfo.toJSON()),
            functions: this.functions.map((funcInfo) => funcInfo.toJSON()),
        };
    }

    static fromJSON(json: any): FileModuleNode {
        const fileModuleNode = new FileModuleNode(
            json.path,
            json.name,
            json.classes.map((classData: any) => ClassInfo.fromJSON(classData)),
            json.functions.map((funcData: any) => FuncInfo.fromJSON(funcData))
        );
        return fileModuleNode;
    }
}

export class FolderModuleNode {
    path: string;
    name: string;
    children: NodeId[];

    constructor(filePath: string) {
        this.path = filePath;
        this.name = getBasename(filePath);
        this.children = [];
    }

    toString(): string {
        return this.toStringRecursive("");
    }

    public toStringRecursive(indentation: string): string {
        let result = `${indentation}FolderModuleNode: ${this.name} (${this.path})\n`;
        indentation += "  ";
        for (const child of this.children) {
            // result += child.toStringRecursive(indentation);
            result += Database.getNode(child).toStringRecursive(indentation);
        }
        return result;
    }

    toJSON(): any {
        return {
            path: this.path,
            name: this.name,
            // children: this.children.map((child) => Database.getNode(child).toJSON()),
            children: this.children//.map((child) => Database.getNode(child).toJSON()),
        };
    }

    static fromJSON(json: any): FolderModuleNode {
        const folderModuleNode = new FolderModuleNode(json.path);
        folderModuleNode.name = json.name;
        folderModuleNode.children = json.children;
        return folderModuleNode;
    }
}
