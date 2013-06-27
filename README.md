Mop integration
===============

Tests integration between Mop, Montage and Mr.

## Environment variables

These can be set by a CI system to vary the combination of projects that is tested.

`MR_VERSION` and `MONTAGE_VERSION` may not be both set at the same time.

### MOP_VERSION, MR_VERSION, MONTAGE_VERSION

 - `#` + hash-or-ref. To use a ref from the respective git repository.
   e.g. `#master`, or `#fb0b642`
 - npm tag. To use a published version in npm.
   e.g. `latest` to use the most recent version, or `0.13.0`.
 - `.` + path. To use a directory relative to the current directory. For
   testing while developing. e.g. `.`, `../mop`, `./dir/mop`
