export type TransformInstance = {
    name: string;
    parameters: (string | TransformInstance[] | undefined)[];
};

export class DatasetInfo {
    name: string;
    type: string;
    constructor(name: string) {
        this.name = name;
        this.type = "None";
    }
    toJSON(): any {
        return {
            name: this.name,
            type: this.type
        };
    }

    static fromJSON(json: any): DatasetInfo {
        switch (json.type) {
            case "TorchvisionDatasetInfo":
                return TorchvisionDatasetInfo.fromJSON(json);
            case "TabularDatasetInfo":
                return TabularDatasetInfo.fromJSON(json);
            default:
                throw new Error("Invalid dataset type");
        }
    }
}

export class TorchvisionDatasetInfo extends DatasetInfo {
    torchvisionDatasetName: string;
    initFuncParams: (string | TransformInstance[] | undefined)[];
    constructor(
        name: string,
        torchvisionDatasetName: string,
        initFuncParams: (string | TransformInstance[] | undefined)[]
    ) {
        super(name);
        this.torchvisionDatasetName = torchvisionDatasetName;
        this.initFuncParams = initFuncParams;
        this.type = "TorchvisionDatasetInfo";
    }
    toJSON(): any {
        return {
            ...super.toJSON(),
            torchvisionDatasetName: this.torchvisionDatasetName,
            initFuncParams: this.initFuncParams,
        };
    }

    static fromJSON(json: any): TorchvisionDatasetInfo {
        return new TorchvisionDatasetInfo(
            json.name,
            json.torchvisionDatasetName,
            json.initFuncParams
        );
    }
}

export type TabularDatasetSetting = {
    filePath: string;
    targetColumn: string | undefined;
    delimiter: string | undefined;
    isNPY: boolean;
};

export const TabularSettingDefault = {
    filePath: "",
    targetColumn: "None",
    delimiter: "','",
    isNPY: false,
};

export class TabularDatasetInfo extends DatasetInfo {
    config: TabularDatasetSetting;
    constructor(name: string, config: TabularDatasetSetting) {
        super(name);
        this.config = config;
        this.type = "TabularDatasetInfo";
    }

    toJSON(): any {
        return {
            ...super.toJSON(),
            config: this.config,
        };
    }

    static fromJSON(json: any): TabularDatasetInfo {
        return new TabularDatasetInfo(json.name, json.config);
    }
}
