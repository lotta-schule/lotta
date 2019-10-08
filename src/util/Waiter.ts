export class Waiter {
    public static async wait(timeInMilliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, timeInMilliseconds));
    }
}
