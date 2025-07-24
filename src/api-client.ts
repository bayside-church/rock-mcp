import axios, { AxiosInstance, AxiosResponse } from "axios";

export interface RockAPIConfig {
  baseUrl: string;
  apiKey?: string;
  username?: string;
  password?: string;
  timeout?: number;
}

export interface APIRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// Handle API errors
export function formatAPIError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    let errorMessage = `API Error: ${error.response?.status} ${error.response?.statusText}`;
    if (error.response?.data) {
      errorMessage += `\nResponse: ${JSON.stringify(
        error.response.data,
        null,
        2
      )}`;
    }
    return errorMessage;
  } else if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error occurred";
}

export function createClient() {
  if (!process.env.ROCK_API_BASE_URL || !process.env.ROCK_API_KEY) {
    throw new Error("ROCK_API_BASE_URL and ROCK_API_KEY must be set");
  }

  return axios.create({
    baseURL: process.env.ROCK_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "Authorization-Token": process.env.ROCK_API_KEY,
    },
  });
}
