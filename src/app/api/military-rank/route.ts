import { nextjsRouteAdapter } from "@/backend/infra/adapters";
import { makeAddMilitaryRankController } from "@/backend/infra/factories";
import { HttpResponse } from "@/backend/presentation/protocols";
import { NextRequest, NextResponse } from "next/server";

const handler = async (request: NextRequest): Promise<NextResponse> => {
  switch (request.method) {
    case "POST":
      return await nextjsRouteAdapter({
        controller: makeAddMilitaryRankController(),
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
