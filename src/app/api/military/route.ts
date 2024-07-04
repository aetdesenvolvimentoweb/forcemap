import { nextjsRouteAdapter } from "@/backend/infra/adapters/nextjs-route";
import { makeAddMilitaryController } from "@/backend/infra/factories/controllers";
import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest, NextResponse } from "next/server";

const handler = async (request: NextRequest): Promise<NextResponse> => {
  switch (request.method) {
    case "POST":
      return await nextjsRouteAdapter({
        controller: makeAddMilitaryController(),
        request,
      });

    default:
      return NextResponse.json<HttpResponse>({
        body: { success: false, errorMessage: "Método não suportado." },
        statusCode: 405,
      });
  }
};

export { handler as GET, handler as POST };
