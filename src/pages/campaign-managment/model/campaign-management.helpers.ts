export const getNextActiveOptionAfterDelete = ({
                                            activeOption,
                                            deletedOption,
                                            optionsCount,
                                        }: {
    activeOption: number;
    deletedOption: number;
    optionsCount: number;
}) => {
    const nextOptionsCount = Math.max(0, optionsCount - 1);
    const lastIndexAfterDelete = Math.max(0, nextOptionsCount - 1);

    if (nextOptionsCount === 0) {
        return 0;
    }

    if (activeOption === deletedOption) {
        return Math.min(Math.max(0, deletedOption - 1), lastIndexAfterDelete);
    }

    if (activeOption > deletedOption) {
        return Math.min(activeOption - 1, lastIndexAfterDelete);
    }

    return Math.min(activeOption, lastIndexAfterDelete);
};