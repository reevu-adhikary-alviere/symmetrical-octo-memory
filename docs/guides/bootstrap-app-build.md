---
title: "Build and run"
description: "Toolchain, dependencies, running against sandbox, linting, tests, and the CI pipeline"
---

# Build and run

A fresh clone runs against sandbox without configuration. Open it, resolve dependencies, pick a simulator or emulator, and you have a working banking app talking to test data.

## iOS

| | |
|---|---|
| Toolchain | Swift 6, strict concurrency |
| Deployment target | iOS 17.5 |
| Project | A single Xcode project, one app target plus unit and UI test targets |
| Dependencies | Swift Package Manager, resolved by Xcode on first open |
| Linter | SwiftLint |

Open the project, select the shared scheme and an iOS 17.5 simulator, and run. Package resolution happens on first open.

From the command line, the repository keeps its scripts under `.ops/scripts`, including a build script, unit and UI test scripts, and the static analysis scripts CI uses. Running `xcodebuild` directly works too, against the shared scheme and a simulator destination.

The Alviere packages resolve from four repositories, one per capability: accounts, cards, payments, and remittances. Alongside them the app pulls in networking, bank linking, direct-deposit switching, analytics and crash reporting, push notifications, in-app support, phone number parsing, and password strength checking. Everything outside the Alviere packages is replaceable, and you will probably want to swap several for whatever your organization already runs.

## Android

| | |
|---|---|
| Toolchain | Kotlin, JVM target 17 |
| Minimum SDK | 24 |
| Compile and target SDK | 37 |
| Dependencies | Gradle version catalog |
| Linter | detekt, with a baseline |
| Coverage | Kover |

Open the project in Android Studio and let Gradle sync. The version catalog pins every dependency in one file, and the four Alviere artifacts share a single version reference, so upgrading the SDK is a one-line change.

Three build types ship: debug, release, and a release build signed with the debug key. Reach for the third when you need to test a release build on a device before release signing exists.

Build scripts live under `.ops/scripts`, with detekt configuration and its baseline under `.ops`.

## Which environment it talks to

Both apps initialize the SDK against sandbox at startup, iOS in its app entry point and Android in its application class, reading from the single environment constant described in [Configure and brand](/guides/sdks/bootstrap-app/configure).

Sandbox does not connect to live systems. KYC and KYB validation, real-money transfers, and bank transfers are simulated, which is what makes the documented test scenarios work. See [Environments](/guides/getting-started/environments) for what sandbox does and does not do, and [Sandbox Testing](/guides/sandbox-testing/mock-services) for the scenarios.

Moving to production takes credentials for your program, the environment constant flipped, and your own vendor keys for the non-Alviere integrations. Ask your program manager for production credentials.

## Configuration you have to supply

Both repositories carry configuration files for the third-party integrations, populated with Alviere's own development values. Replace them with your own before you ship, including the analytics and crash reporting configuration, the push notification keys, and the support integration credentials. Treat any credential you find committed as one to rotate rather than reuse.

## Tests

iOS runs unit and UI test targets through a shared test plan, with execution order randomized so tests cannot quietly depend on each other. Android runs JUnit with a mocking library, instrumentation tests, and a mock web server for the network layer, with Kover reporting coverage.

## CI

Both repositories define the same pipeline shape, in four stages:

1. **Analyze.** Code quality, linting, static application security testing, and dependency scanning.
2. **Test.** Unit tests.
3. **Build.** A build artifact.
4. **UI test.** Interface tests.

The security and dependency scanning stages are worth keeping when you fork. They are the part of the pipeline that catches a vulnerable transitive dependency before a reviewer does.

## Related

- [Configure and brand](/guides/sdks/bootstrap-app/configure). Theme, assets, copy, and the switches.
- [What's included](/guides/sdks/bootstrap-app/features). What you will see once it runs.
- [Authentication](/guides/getting-started/authentication). Credential handling.
