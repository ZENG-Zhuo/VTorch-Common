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
export class FileModuleNode {
    id: NodeId;
    path: string;
    relativePath: string[];
    name: string;
    classes: ClassInfo[];
    functions: FuncInfo[];
    imports: ImportInfo[];
    __all__?: string[];
    importedModules: Map<string, [string, NodeId]> = new Map();
    importedClasses: Map<string, [string, NodeId]> = new Map();
    importedFunctions: Map<string, [string, NodeId]> = new Map();
    parsedImport: boolean = false;

    constructor(
        id: NodeId,
        path: string,
        relativePath: string[],
        name: string,
        classes: ClassInfo[],
        functions: FuncInfo[],
        imports: ImportInfo[],
        __all__?: string[]
    ) {
        this.id = id;
        this.path = path;
        this.relativePath = relativePath;
        this.name = name;
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

    toJSON(): any {
        return {
            id: this.id,
            path: this.path,
            relativePath: this.relativePath,
            name: this.name,
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

    static fromJSON(json: any): FileModuleNode {
        const fileModuleNode = new FileModuleNode(
            json.id,
            json.path,
            json.relativePath,
            json.name,
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

export class FolderModuleNode {
    id: NodeId;
    path: string;
    relativePath: string[];
    name: string;
    children: NodeId[];
    classes: ClassInfo[];
    functions: FuncInfo[];
    imports: ImportInfo[];
    __all__?: string[];
    importedModules: Map<string, [string, NodeId]> = new Map();
    importedClasses: Map<string, [string, NodeId]> = new Map();
    importedFunctions: Map<string, [string, NodeId]> = new Map();
    parsedImport: boolean = false;

    constructor(id: NodeId, filePath: string, relativePath: string[]) {
        this.id = id;
        this.path = filePath;
        this.relativePath = relativePath;
        this.name = getBasename(filePath);
        this.children = [];
        this.classes = [];
        this.functions = [];
        this.imports = [];
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

    public getClass(name: string): ClassInfo | undefined {
        console.log("Getting class: ", name)
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

    toJSON(): any {
        return {
            id: this.id,
            path: this.path,
            relativePath: this.relativePath,
            name: this.name,
            // children: this.children.map((child) => Database.getNode(child).toJSON()),
            children: this.children,
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
