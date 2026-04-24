export class AppError extends Error {
    constructor(public statusCode: number, public customMessage: string){
        super()
    }
}