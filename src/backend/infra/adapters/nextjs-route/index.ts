import {
  Controller,
  HttpRequest,
  HttpResponse,
} from "@/backend/presentation/protocols";
import { NextRequest, NextResponse } from "next/server";

interface AdapterParams {
  controller: Controller;
  request: NextRequest;
  dynamicParams?: any;
}

export const nextjsRouteAdapter = async ({
  controller,
  request,
  dynamicParams,
}: AdapterParams): Promise<NextResponse> => {
  const body =
    request.method === "PUT" ||
    request.method === "PATCH" ||
    request.method === "POST"
      ? await request.json()
      : {};

  const httpRequest: HttpRequest = {
    body,
    headers: request.headers,
    query: request.nextUrl.searchParams,
    params: dynamicParams,
  };

  const httpResponse: HttpResponse = await controller.handle(httpRequest);

  if (httpResponse.body.errorMessage) {
    return NextResponse.json<HttpResponse>({
      body: {
        success: httpResponse.body.success,
        errorMessage: httpResponse.body.errorMessage,
      },
      statusCode: httpResponse.statusCode,
    });
  }

  return NextResponse.json<HttpResponse>({
    body: {
      success: httpResponse.body.success,
      data: httpResponse.body.data,
    },
    statusCode: httpResponse.statusCode,
  });
};
