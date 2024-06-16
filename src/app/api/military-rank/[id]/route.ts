import { nextjsRouteAdapter } from "@/backend/infra/adapters";
import {
  makeGetMilitaryRankByIdController,
  makeUpdateMilitaryRankController,
} from "@/backend/infra/factories";

import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest, NextResponse } from "next/server";

const handler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  switch (request.method) {
    case "GET":
      return await nextjsRouteAdapter({
        controller: makeGetMilitaryRankByIdController(),
        request,
        dynamicParams: { id: params.id },
      });

    case "PUT":
      return await nextjsRouteAdapter({
        controller: makeUpdateMilitaryRankController(),
        request,
        dynamicParams: { id: params.id },
      });

    default:
      return NextResponse.json<HttpResponse>({
        body: { success: false, errorMessage: "Método não suportado." },
        statusCode: 405,
      });
  }
};

export { handler as GET, handler as PUT };
