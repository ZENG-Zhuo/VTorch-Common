export type TransformInstance = {
    name: string;
    parameters: (string | TransformInstance[] | undefined)[];
};

export class DatasetInfo {
    name: string;
    constructor(name: string) {
        this.name = name;
    }
    toJSON(): any {
        return {
            name: this.name,
        };
    }

    static fromJSON(json: any): DatasetInfo {
        return new DatasetInfo(json.name);
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
