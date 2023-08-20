# Developer's notes

## Remote $ref handling

Remote/external `$ref`s (`Pet.yaml`, `definitions.json#/Pet`) get always immediately dereferenced by fetching the specs and inlining the relevant schemas.
