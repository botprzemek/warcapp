export function canParse(data: string): boolean {
    try {
        JSON.parse(data);
    } catch (e) {
        return false;
    }
    return true;
}
