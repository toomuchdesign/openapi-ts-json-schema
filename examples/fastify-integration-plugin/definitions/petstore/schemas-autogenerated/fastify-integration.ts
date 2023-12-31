// File autogenerated with "openapi-ts-json-schema". Do not edit :)

import componentsSchemasPet from "./components/schemas/Pet";
import componentsSchemasPets from "./components/schemas/Pets";
import componentsSchemasError from "./components/schemas/Error";
import componentsSchemasOwner from "./components/schemas/Owner";

const componentsSchemasPetWithId = {
  ...componentsSchemasPet,
  $id: "/components/schemas/Pet",
} as const;
const componentsSchemasPetsWithId = {
  ...componentsSchemasPets,
  $id: "/components/schemas/Pets",
} as const;
const componentsSchemasErrorWithId = {
  ...componentsSchemasError,
  $id: "/components/schemas/Error",
} as const;
const componentsSchemasOwnerWithId = {
  ...componentsSchemasOwner,
  $id: "/components/schemas/Owner",
} as const;

// Allows json-schema-to-ts to hydrate $refs via the "references" option
export type RefSchemas = [
  typeof componentsSchemasPetWithId,
  typeof componentsSchemasPetsWithId,
  typeof componentsSchemasErrorWithId,
];

// $ref JSON schemas to be registered with "fastify.addSchema"
export const refSchemas = [
  componentsSchemasPetWithId,
  componentsSchemasPetsWithId,
  componentsSchemasErrorWithId,
];

// Extra JSON schemas to be registered with "fastify.addSchema"
export const sharedSchemas = [componentsSchemasOwnerWithId];
