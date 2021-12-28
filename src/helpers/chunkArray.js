export const chunkArray = (array, size) => {
    let original = [...array];
    const result = [];
    while (original.length > 0) {
        const chunk = original.splice(0, size);
        result.push(chunk);
    }
    return result;
};
