import { nextjsRouteAdapter } from "@/backend/infra/adapters/nextjs-route";
import { makeGetMilitaryByIdController } from "@/backend/infra/factories/controllers";
import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest, NextResponse } from "next/server";

const handler = async (
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> => {
  switch (request.method) {
    case "GET":
      return await nextjsRouteAdapter({
        controller: makeGetMilitaryByIdController(),
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

export { handler as GET };
