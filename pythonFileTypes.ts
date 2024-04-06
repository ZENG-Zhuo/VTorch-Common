import { basename } from "path";
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
    importedModules: Map<string, NodeId> = new Map();
    importedClasses: Map<string, NodeId> = new Map();
    importedFunctions: Map<string, NodeId> = new Map();
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

    public getSubModule(relativePath: string[]): undefined | NodeId {
        let RP = relativePath;
        if (RP.length > 0 && RP[0] === this.name) {
            if (RP.length > 1) {
                return undefined;
            } else {
                // console.log("returning this!");
                return this.id;
            }
        }
        return;
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
            importedModules: Object.fromEntries(this.importedModules),
            importedClasses: Object.fromEntries(this.importedClasses),
            importedFunctions: Object.fromEntries(this.importedFunctions),
            parsedImport: this.parsedImport
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
        fileModuleNode.importedModules = new Map(Object.entries(json.importedModules));
        fileModuleNode.importedClasses = new Map(Object.entries(json.importedClasses));
        fileModuleNode.importedFunctions = new Map(Object.entries(json.importedFunctions));
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
    importedModules: Map<string, NodeId> = new Map();
    importedClasses: Map<string, NodeId> = new Map();
    importedFunctions: Map<string, NodeId> = new Map();
    parsedImport: boolean = false;

    constructor(id: NodeId, filePath: string, relativePath: string[]) {
        this.id = id;
        this.path = filePath;
        this.relativePath = relativePath;
        this.name = basename(filePath, ".py");
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

    public getSubModule(relativePath: string[]): undefined | NodeId {
        console.log("getting submodule in folder: ", relativePath, this.path);
        let RP = relativePath;
        if (RP.length > 0 && RP[0] === this.name) {
            if (RP.length > 1) {
                const nextId = this.children.find(
                    (v, i) => Database.getNode(v).name === RP[1]
                );
                if (nextId) {
                    return Database.getNode(nextId).getSubModule(
                        relativePath.slice(1)
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
            importedModules: Object.fromEntries(this.importedModules),
            importedClasses: Object.fromEntries(this.importedClasses),
            importedFunctions: Object.fromEntries(this.importedFunctions),
            parsedImport: this.parsedImport
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
        folderModuleNode.importedModules = new Map(Object.entries(json.importedModules));
        folderModuleNode.importedClasses = new Map(Object.entries(json.importedClasses));
        folderModuleNode.importedFunctions = new Map(Object.entries(json.importedFunctions));
        folderModuleNode.parsedImport = json.parsedImport;
        folderModuleNode.__all__ = json.__all__;
        return folderModuleNode;
    }
}
