import { Response } from "express";
import { ApiResponse } from "../interfaces/response.interface";

export class ResponseHelper {

    /**
     * Send a successful JSON response
     * @param res Express Response object
     * @param data Payload data to return
     * @param message Success message (optional)
     * @param statusCode HTTP status code (default: 200)
     */
    static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
        const response: ApiResponse<T> = {
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }

    /**
     * Send an error JSON response
     * @param res Express Response object
     * @param message Error message
     * @param errors Detailed errors object (e.g. validation errors, validation array) (optional)
     * @param statusCode HTTP status code (default: 400)
     */
    static error(res: Response, message: string, errors?: any, statusCode = 400): Response {
        const response: ApiResponse = {
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        };
        return res.status(statusCode).json(response);
    }

}
