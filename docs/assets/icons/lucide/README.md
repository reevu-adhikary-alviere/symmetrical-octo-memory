# Landing page icons

Source: https://github.com/lucide-icons/lucide/tree/main/icons
License: see LICENSE in this directory, including the Feather-derived icon notice.

Downloaded 2026-09-07. Original geometry retained; stroke colors changed to
purple (#7537d9) for products, magenta (#c0268c) for use cases, and blue
(#2563c9) for developer tools. These colors remain visible on light and dark
backgrounds. Icons are hosted with the docs; no third-party runtime is needed.

The welcome page references ../assets/icons/lucide/<name>.svg using the card
icon property and iconPosition="title". Scalar resolves custom SVG icons relative
to the Markdown source file during static rendering. Root-relative browser URLs
do not resolve through that build-time loader.
