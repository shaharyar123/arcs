package(default_visibility = [
    "//javaharness/java/arcs/android/demo:__subpackages__",
    "//javaharness/javatests/arcs/android/demo:__subpackages__",
])

licenses(["notice"])

load("@build_bazel_rules_android//android:rules.bzl", "android_binary", "android_library")

android_library(
    name = "service",
    srcs = glob(["*.java"]),
    manifest = "AndroidManifest.xml",
    resource_files = glob(["res/**"]),
    deps = [
        "//javaharness/java/arcs/android/api",
        "//javaharness/java/arcs/android/client",
        "//javaharness/java/arcs/android/impl",
        "//javaharness/java/arcs/android/service",
        "//javaharness/java/arcs/api:api-android",
        "//javaharness/java/arcs/demo/particles:particles-android",
        "//javaharness/java/arcs/demo/services:services-android",
        "//javaharness/java/arcs/demo/ui:ui-android",
        "@com_google_dagger",
        "@flogger//jar",
        "@flogger_system_backend//jar",
        "@javax_inject_source//jar",
    ],
)
