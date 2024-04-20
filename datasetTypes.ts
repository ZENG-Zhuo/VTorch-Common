export type TransformInstance = {
    name: string;
    parameters: (string | TransformInstance[] | undefined)[];
};

export class DatasetInfo {
    name: string;
    constructor(name: string) {
        this.name = name;
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
    delimiter: "\',\'",
    isNPY: false,
};

export class TabularDatasetInfo extends DatasetInfo {
    config: TabularDatasetSetting;
    constructor(name: string, config: TabularDatasetSetting) {
        super(name);
        this.config = config;
    }
}
