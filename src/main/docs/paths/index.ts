import { OpenAPIV3 } from "openapi-types";

import { militaryRanksPaths } from "./military-ranks.paths";

export const paths: OpenAPIV3.PathsObject = {
  ...militaryRanksPaths,
  // Adicione outros paths aqui conforme necessário
};
