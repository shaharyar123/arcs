load("//build_defs:build_defs.bzl", "arcs_cc_schema", "arcs_ts_test")
load("//build_defs/emscripten:build_defs.bzl", "cc_wasm_binary")

arcs_cc_schema(
    name = "schemas",
    src = "schemas.arcs",
    out = "entities.h",
)

cc_wasm_binary(
    name = "test-module",
    srcs = [
        "entity-class-test.cc",
        "particle-api-test.cc",
        "reference-class-test.cc",
    ],
    hdrs = [
        "entities.h",
        "test-base.h",
    ],
    deps = ["//src/wasm/cpp:arcs"],
)

arcs_ts_test(
    name = "wasm-cpp-test",
    src = "wasm-cpp-test.ts",
    deps = [":test-module"],
)
