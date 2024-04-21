export type OptimizerConfig = {
    name: string;
    parameters: (string | undefined)[];
};

export const DefaultOptimizerConfig = {
    name: "",
    parameters: [],
};
