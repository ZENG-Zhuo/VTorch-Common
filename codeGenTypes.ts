import { OptimizerConfig } from "./optimizerTypes";

export type CodeGenInfo = {
    datasetName: string;
    modelName: string;
    lossName: string;
    optimizerConfig: OptimizerConfig;
    dataloaderParams: string[];
};
