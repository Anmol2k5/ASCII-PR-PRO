# Commercialization

## Positioning

ASCII Character is a native After Effects effect for editors who want clean,
art-directable ASCII looks without building text grids by hand.

One-line pitch:

> Turn footage into crisp, animated ASCII art directly inside After Effects.

## Ideal Buyers

- Motion designers making title sequences, music videos, and social edits.
- YouTubers and short-form editors who want terminal, hacker, and retro looks.
- Template creators who need a reliable effect for resale projects.
- Agencies making technology, cybersecurity, and product-launch visuals.

## Pricing

- Personal: $19-$29.
- Commercial: $49-$79.
- Studio: $149-$299 with team seats and priority support.

## Trial Strategy

Ship a watermarked trial or time-limited build. Keep development mode unlocked.
Do not embed API secrets or license secrets in a panel or frontend script.

## License Architecture

Add a `LicenseService` interface with implementations:

- `DevelopmentLicenseService`: always unlocked.
- `LocalSignedLicenseService`: validates a signed local license file.
- `StoreLicenseService`: adapter for Gumroad, Lemon Squeezy, or AEScripts.

The renderer should depend only on an `isUnlocked()` decision, not on store
logic.

## Packaging

Gumroad / Lemon Squeezy:

- Zip with `.aex`, docs, EULA, and install instructions.
- Include checksum and version number.

AEScripts:

- Follow AEScripts packaging and licensing requirements.
- Prepare clean marketing screenshots and compatibility matrix.

## Windows Installer

First release can ship as a zip. A later installer can use WiX Toolset or Inno
Setup to detect Adobe plugin folders and copy the `.aex`.

## Release Checklist

- Confirm AE versions supported.
- Smoke test 1080p and 4K.
- Render Queue and Media Encoder test.
- Verify no user-specific paths.
- Verify no copied proprietary DaVinci preset text.
- Update changelog.
- Package Release build.
- Archive exact source commit and build artifacts.

## Support Checklist

- Ask for AE version, OS version, GPU model, footage format, comp bit depth, and
  screenshot of effect settings.
- Reproduce with a solid and a still image.
- Ask whether the plugin is installed in app Plug-ins or MediaCore.
- Check whether third-party security software blocked the `.aex`.
