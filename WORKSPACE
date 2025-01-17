load("//build_defs/emscripten:repo.bzl", "emsdk_repo")
load("//build_defs/kotlin_native:repo.bzl", "kotlin_native_repo")

# Install Emscripten via the emsdk.
emsdk_repo()

# Install the Kotlin-Native compiler
kotlin_native_repo()

maven_jar(
    name = "org_json_local",
    artifact = "org.json:json:20141113",
)

maven_jar(
    name = "flogger",
    artifact = "com.google.flogger:flogger:0.4",
)

maven_jar(
    name = "flogger_system_backend",
    artifact = "com.google.flogger:flogger-system-backend:0.4",
)

#git_repository(
#    name = "android_sdk_downloader",
#    remote = "https://github.com/quittle/bazel_android_sdk_downloader",
#    commit = "a08905c5571dc9a74027ec57c90ffad53d7f7efe",
#)

#load("@android_sdk_downloader//:rules.bzl", "android_sdk_repository")

#android_sdk_repository(
#    name = "androidsdk",
#    workspace_name = "arcs_javaharness",
#  api_level = 27,
#    build_tools_version = "27.0.3",
#)

android_sdk_repository(
    name = "androidsdk",
    api_level = 29,
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

rules_kotlin_version = "legacy-modded-0_26_1-02"

rules_kotlin_sha = "245d0bc1511048aaf82afd0fa8a83e8c3b5afdff0ae4fbcae25e03bb2c6f1a1a"

http_archive(
    name = "io_bazel_rules_kotlin",
    sha256 = rules_kotlin_sha,
    strip_prefix = "rules_kotlin-%s" % rules_kotlin_version,
    type = "zip",
    urls = ["https://github.com/cgruber/rules_kotlin/archive/%s.zip" % rules_kotlin_version],
)

load("@io_bazel_rules_kotlin//kotlin:kotlin.bzl", "kotlin_repositories", "kt_register_toolchains")

kotlin_repositories()  # if you want the default. Otherwise see custom kotlinc distribution below

kt_register_toolchains()  # to use the default toolchain, otherwise see toolchains below

# Load j2cl repository
http_archive(
    name = "com_google_j2cl",
    strip_prefix = "j2cl-master",
    url = "https://github.com/google/j2cl/archive/master.zip",
)

#http_archive(
#    name = "google_bazel_common",
#    strip_prefix = "bazel-common-1c225e62390566a9e88916471948ddd56e5f111c",
#    urls = ["https://github.com/google/bazel-common/archive/1c225e62390566a9e88916471948ddd56e5f111c.zip"],
#)

load("@com_google_j2cl//build_defs:repository.bzl", "load_j2cl_repo_deps")

load_j2cl_repo_deps()

load("@com_google_j2cl//build_defs:rules.bzl", "setup_j2cl_workspace")

setup_j2cl_workspace()

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

_JSINTEROP_BASE_VERSION = "master"

http_archive(
    name = "com_google_jsinterop_base",
    strip_prefix = "jsinterop-base-%s" % _JSINTEROP_BASE_VERSION,
    url = "https://github.com/google/jsinterop-base/archive/%s.zip" % _JSINTEROP_BASE_VERSION,
)

http_archive(
    name = "com_google_dagger",
    urls = ["https://github.com/google/dagger/archive/dagger-2.23.1.zip"],
)

maven_jar(
    name = "com_google_dagger_runtime",
    artifact = "com.google.dagger:dagger:jar:sources:2.23.1",
)

maven_jar(
    name = "javax_inject_source",
    artifact = "javax.inject:javax.inject:jar:sources:1",
)

maven_jar(
    name = "junit",
    artifact = "junit:junit:4.11",
)

http_archive(
    name = "com_google_elemental2",
    strip_prefix = "elemental2-master",
    url = "https://github.com/google/elemental2/archive/master.zip",
)

load("@com_google_elemental2//build_defs:repository.bzl", "load_elemental2_repo_deps")

load_elemental2_repo_deps()

load("@com_google_elemental2//build_defs:workspace.bzl", "setup_elemental2_workspace")

setup_elemental2_workspace()

http_archive(
    name = "build_bazel_rules_android",
    sha256 = "cd06d15dd8bb59926e4d65f9003bfc20f9da4b2519985c27e190cddc8b7a7806",
    strip_prefix = "rules_android-0.1.1",
    urls = ["https://github.com/bazelbuild/rules_android/archive/v0.1.1.zip"],
)
