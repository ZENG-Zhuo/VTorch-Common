import path, { basename } from "path";
import { FileModuleNode, FolderModuleNode, NodeId } from "./pythonFileTypes";
import { Package, PackageId } from "./pythonPackageType";
import {
    existsSync,
    mkdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from "fs";
import { globSync } from "glob";
const storagePath = "/home/zeng-zhuo/FYP/storage";
type Node = FileModuleNode | FolderModuleNode;
export function loadPackages(): Map<PackageId, Package> {
    let packages = new Map<PackageId, Package>();
    const packagesPath = path.join(storagePath, "packages");
    if (statSync(packagesPath).isDirectory()) {
        let files = globSync(path.join(packagesPath, "*"));
        for (const fileName of files) {
            let content = readFileSync(fileName, "utf8");
            let pack = Package.fromJSON(JSON.parse(content));
            packages.set(basename(fileName), pack);
        }
    }
    return packages;
}

export function nodeFromJSON(json: any): FolderModuleNode | FileModuleNode {
    console.log("Creating new node from json id: ", json.id);
    if (!json.hasOwnProperty("children")) {
        return FileModuleNode.fromJSON(json);
    } else {
        return FolderModuleNode.fromJSON(json);
    }
}

export function loadNodes(): Map<NodeId, Node> {
    let nodes = new Map<NodeId, Node>();
    const nodesPath = path.join(storagePath, "nodes");

    if (statSync(nodesPath).isDirectory()) {
        let files = globSync(path.join(nodesPath, "*"));

        for (const fileName of files) {
            const content = readFileSync(fileName, "utf8");
            const json = JSON.parse(content);
            const node = nodeFromJSON(json);
            nodes.set(basename(fileName), node);
        }
    }

    return nodes;
}

export abstract class Database {
    static packages: Map<PackageId, Package> = new Map<PackageId, Package>();

    static nodes: Map<NodeId, FileModuleNode | FolderModuleNode> = new Map<
        NodeId,
        FileModuleNode | FolderModuleNode
    >();

    static async save() {
        const packagesPath = path.join(storagePath, "packages");
        if (!existsSync(packagesPath)) mkdirSync(packagesPath);
        for (const entry of this.packages.entries()) {
            writeFileSync(
                path.join(packagesPath, entry[0]),
                JSON.stringify(entry[1].toJSON())
            );
        }

        const nodesPath = path.join(storagePath, "nodes");
        if (!existsSync(nodesPath)) mkdirSync(nodesPath);
        for (const entry of this.nodes.entries()) {
            writeFileSync(
                path.join(nodesPath, entry[0]),
                JSON.stringify(entry[1].toJSON())
            );
        }
    }

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

    static load() {
        this.packages.clear();
        this.nodes.clear();
        this.packages = loadPackages();
        this.nodes = loadNodes();
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
