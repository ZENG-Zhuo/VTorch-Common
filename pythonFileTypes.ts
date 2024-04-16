import { Database } from "./objectStorage";
import { ClassInfo, FuncInfo, ImportInfo } from "./pythonObjectTypes";

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
export abstract class Node {
    id: NodeId;
    name: string;
    path: string;
    relativePath: string[];
    classes: ClassInfo[];
    functions: FuncInfo[];
    imports: ImportInfo[];
    __all__?: string[];
    importedModules: Map<string, [string, NodeId]> = new Map();
    importedClasses: Map<string, [string, NodeId]> = new Map();
    importedFunctions: Map<string, [string, NodeId]> = new Map();
    parsedImport: boolean = false;
    constructor(id: NodeId, path: string, relativePath: string[]) {
        this.id = id;
        this.path = path;
        this.name = getBasename(path);
        this.relativePath = relativePath;
        this.classes = [];
        this.functions = [];
        this.imports = [];
    }
    toJSON(): any {
        return {
            id: this.id,
            name: this.name,
            path: this.path,
            relativePath: this.relativePath,
            classes: this.classes.map((classInfo) => classInfo.toJSON()),
            functions: this.functions.map((funcInfo) => funcInfo.toJSON()),
            imports: this.imports.map((importInfo) => importInfo.toJSON()),
            __all__: this.__all__,
            importedModules: Array.from(this.importedModules.entries()),
            importedClasses: Array.from(this.importedClasses.entries()),
            importedFunctions: Array.from(this.importedFunctions.entries()),
            parsedImport: this.parsedImport,
        };
    }
    public getClass(name: string): ClassInfo | undefined {
        const classInfo = this.classes.find((c) => c.name === name);
        if (classInfo) {
            return classInfo;
        } else {
            const importedClassInfo = this.importedClasses.get(name);
            if (importedClassInfo) {
                const node = Database.getNode(importedClassInfo[1]);
                return node.getClass(importedClassInfo[0]);
            }
        }
    }
}

export class FileModuleNode extends Node {
    constructor(
        id: NodeId,
        path: string,
        relativePath: string[],
        classes: ClassInfo[],
        functions: FuncInfo[],
        imports: ImportInfo[],
        __all__?: string[]
    ) {
        super(id, path, relativePath);
        this.classes = classes;
        this.functions = functions;
        this.imports = imports;
        this.__all__ = __all__;
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

    public getSubModule(
        relativePath: string[],
        fromFile: boolean
    ): undefined | NodeId {
        let RP = relativePath;
        if (RP.length > 0 && RP[0] === this.name) {
            if (RP.length > 1) {
                if (!fromFile) {
                    const pair = this.importedModules.get(RP[1]);
                    return pair
                        ? Database.getNode(pair[1]).getSubModule(
                              relativePath.slice(1),
                              fromFile
                          )
                        : undefined;
                }
                return undefined;
            } else {
                return this.id;
            }
        }
        return;
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
        };
    }

    static fromJSON(json: any): FileModuleNode {
        const fileModuleNode = new FileModuleNode(
            json.id,
            json.path,
            json.relativePath,
            json.classes.map((classData: any) => ClassInfo.fromJSON(classData)),
            json.functions.map((funcData: any) => FuncInfo.fromJSON(funcData)),
            json.imports.map((funcData: any) => ImportInfo.fromJSON(funcData)),
            json.__all__
        );
        fileModuleNode.importedModules = new Map(json.importedModules);
        fileModuleNode.importedClasses = new Map(json.importedClasses);
        fileModuleNode.importedFunctions = new Map(json.importedFunctions);
        fileModuleNode.parsedImport = json.parsedImport;
        return fileModuleNode;
    }
}

export class FolderModuleNode extends Node {
    children: NodeId[];

    constructor(id: NodeId, filePath: string, relativePath: string[]) {
        super(id, filePath, relativePath);
        this.children = [];
    }

    toString(): string {
        return this.toStringRecursive("");
    }

    public toStringRecursive(indentation: string): string {
        let result = `${indentation}FolderModuleNode: ${this.name} (${this.path})\n`;
        indentation += "  ";
        for (const child of this.children) {
            result += Database.getNode(child).toStringRecursive(indentation);
        }
        return result;
    }

    public getSubModule(
        relativePath: string[],
        fromFile: boolean
    ): undefined | NodeId {
        let RP = relativePath;
        if (RP.length > 0 && RP[0] === this.name) {
            if (RP.length > 1) {
                if (!fromFile) {
                    const pair = this.importedModules.get(RP[1]);
                    if (pair)
                        return Database.getNode(pair[1]).getSubModule(
                            relativePath.slice(1),
                            fromFile
                        );
                }
                const nextId = this.children.find(
                    (v) => Database.getNode(v).name === RP[1]
                );
                if (nextId) {
                    return Database.getNode(nextId).getSubModule(
                        relativePath.slice(1),
                        fromFile
                    );
                }
            } else {
                return this.id;
            }
        }
        return;
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            children: this.children,
        };
    }

    static fromJSON(json: any): FolderModuleNode {
        const folderModuleNode = new FolderModuleNode(
            json.id,
            json.path,
            json.relativePath
        );
        folderModuleNode.name = json.name;
        folderModuleNode.children = json.children;
        folderModuleNode.classes = json.classes.map((classData: any) =>
            ClassInfo.fromJSON(classData)
        );
        folderModuleNode.functions = json.functions.map((funcData: any) =>
            FuncInfo.fromJSON(funcData)
        );
        folderModuleNode.imports = json.imports.map((funcData: any) =>
            ImportInfo.fromJSON(funcData)
        );
        folderModuleNode.importedModules = new Map(json.importedModules);
        folderModuleNode.importedClasses = new Map(json.importedClasses);
        folderModuleNode.importedFunctions = new Map(json.importedFunctions);
        folderModuleNode.parsedImport = json.parsedImport;
        folderModuleNode.__all__ = json.__all__;
        return folderModuleNode;
    }
}
