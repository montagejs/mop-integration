Mop integration
===============

Tests for integration between Mop, Montage and Mr.

## Environment variables

These can be set by a CI system to vary the combination of projects that is
tested.

`MR_VERSION` and `MONTAGE_VERSION` can be set at the same time, but that
probably isn't a good idea.

### MOP_VERSION, MR_VERSION, MONTAGE_VERSION

 - `#` + hash-or-ref. To use a ref from the respective git repository.
   e.g. `#master`, or `#fb0b642`
 - npm tag. To use a published version in npm.
   e.g. `latest` to use the most recent version, or `0.13.0`.
