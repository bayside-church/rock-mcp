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

export async function createClient() {
  if (!process.env.ROCK_API_BASE_URL) {
    throw new Error("ROCK_API_BASE_URL must be set");
  }

  if (
    (!process.env.ROCK_USERNAME || !process.env.ROCK_PASSWORD) &&
    !process.env.ROCK_API_KEY
  ) {
    throw new Error(
      "Either ROCK_USERNAME and ROCK_PASSWORD or ROCK_API_KEY must be set"
    );
  }

  if (process.env.ROCK_USERNAME && process.env.ROCK_PASSWORD) {
    const cookie = await login();
    if (!cookie) {
      throw new Error("Failed to login");
    }
    return axios.create({
      baseURL: process.env.ROCK_API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookie,
      },
    });
  }

  return axios.create({
    baseURL: process.env.ROCK_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      "Authorization-Token": process.env.ROCK_API_KEY,
    },
  });
}

async function login() {
  try {
    const username = process.env.ROCK_USERNAME;
    const password = process.env.ROCK_PASSWORD;
    const url = `${process.env.ROCK_API_BASE_URL}/api/Auth/Login`;

    const response = await axios.request({
      method: "post",
      maxBodyLength: Infinity,
      url,
      data: JSON.stringify({
        username,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status !== 200 && response.status !== 204) {
      return null;
    }

    if (!response.headers["set-cookie"]) {
      return null;
    }

    const rockCookie = response.headers["set-cookie"].find((c) =>
      c.startsWith(".ROCK=")
    );

    if (!rockCookie) {
      return null;
    }

    const cookie = rockCookie.split(";")[0];
    return cookie;
  } catch (error) {
    console.error("login error", error);
    return null;
  }
}
