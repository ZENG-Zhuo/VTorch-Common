import { FileModuleNode, FolderModuleNode, NodeId } from "./pythonFileTypes";
import { Package, PackageId } from "./pythonPackageType";

export function nodeFromJSON(json: any): FolderModuleNode | FileModuleNode {
    console.log("Creating new node from json id: ", json.id);
    if (!json.hasOwnProperty("children")) {
        return FileModuleNode.fromJSON(json);
    } else {
        return FolderModuleNode.fromJSON(json);
    }
}

export abstract class Database {
    static packages: Map<PackageId, Package> = new Map<PackageId, Package>();

    static nodes: Map<NodeId, FileModuleNode | FolderModuleNode> = new Map<
        NodeId,
        FileModuleNode | FolderModuleNode
    >();

    static findPackage(name: string, version: string): PackageId | undefined {
        for (const pack of this.packages.entries()) {
            if (pack[1].name === name && pack[1].version === version) {
                return pack[0];
            }
        }
    }

    static getNode(id: NodeId): FileModuleNode | FolderModuleNode {
        let result = this.nodes.get(id);
        if (result) return result;
        throw "Missing child" + id;
    }

    static setNode(
        id: NodeId,
        node: FileModuleNode | FolderModuleNode
    ): NodeId {
        this.nodes.set(id, node);
        return id;
    }

    static setPackage(id: PackageId, pack: Package): PackageId {
        this.packages.set(id, pack);
        return id;
    }
    static getPackage(id: PackageId): Package {
        let result = this.packages.get(id);
        if (result) return result;
        let e = new Error();
        throw "Missing package" + id + e.stack;
    }

    static clear() {
        this.packages.clear();
        this.nodes.clear();
    }

    static toJSON(): any {
        return {
            packages: Array.from(this.packages.entries()).map((v) => {
                return [v[0], v[1].toJSON()];
            }),
            nodes: Array.from(this.nodes.entries()).map((v) => {
                return [v[0], v[1].toJSON()];
            }),
        };
    }

    static fromJSON(json: any): void {
        const packages = json.packages;
        const nodes = json.nodes;
        packages.map((v: [PackageId, any]) => {
            this.packages.set(v[0], Package.fromJSON(v[1]));
        });

        nodes.map((v: [NodeId, any]) =>
            this.nodes.set(v[0], nodeFromJSON(v[1]))
        );
    }
}
