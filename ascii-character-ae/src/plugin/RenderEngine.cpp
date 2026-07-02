#include "RenderEngine.h"

#include <algorithm>
#include <cmath>

namespace ascii_character {
namespace {

float clamp01(float v) {
    return std::max(0.0f, std::min(1.0f, v));
}

uint8_t toByte(float v) {
    return static_cast<uint8_t>(std::lround(clamp01(v) * 255.0f));
}

Pixel8 getPixel(const Image8& image, int x, int y) {
    x = std::max(0, std::min(image.width - 1, x));
    y = std::max(0, std::min(image.height - 1, y));
    const auto* row = reinterpret_cast<const uint8_t*>(image.pixels) + y * image.rowbytes;
    return reinterpret_cast<const Pixel8*>(row)[x];
}

Pixel8& pixelAt(Image8& image, int x, int y) {
    auto* row = reinterpret_cast<uint8_t*>(image.pixels) + y * image.rowbytes;
    return reinterpret_cast<Pixel8*>(row)[x];
}

} // namespace

float RenderEngine::luminance(const Pixel8& pixel) {
    return (0.2126f * pixel.r + 0.7152f * pixel.g + 0.0722f * pixel.b) / 255.0f;
}

float RenderEngine::adjustLuminance(float value, const RenderSettings& settings) {
    value = (value - 0.5f) * settings.contrast + 0.5f + settings.brightness;
    value = clamp01(value);
    if (settings.gamma > 0.001f) {
        value = std::pow(value, 1.0f / settings.gamma);
    }
    if (settings.threshold > 0) {
        value = value >= (settings.threshold / 255.0f) ? 1.0f : 0.0f;
    }
    if (settings.posterizeLevels > 1) {
        const float levels = static_cast<float>(settings.posterizeLevels - 1);
        value = std::round(value * levels) / levels;
    }
    return settings.invertLuminance ? 1.0f - value : value;
}

Pixel8 RenderEngine::mix(Pixel8 a, Pixel8 b, float t) {
    t = clamp01(t);
    return {
        toByte((a.r / 255.0f) * (1.0f - t) + (b.r / 255.0f) * t),
        toByte((a.g / 255.0f) * (1.0f - t) + (b.g / 255.0f) * t),
        toByte((a.b / 255.0f) * (1.0f - t) + (b.b / 255.0f) * t),
        toByte((a.a / 255.0f) * (1.0f - t) + (b.a / 255.0f) * t)
    };
}

Pixel8 RenderEngine::chooseInk(const Pixel8& sample, float lum, const RenderSettings& settings) {
    switch (settings.colorMode) {
    case ColorMode::Source:
        return sample;
    case ColorMode::TwoTone:
        return lum < 0.5f ? settings.background : settings.foreground;
    case ColorMode::Gradient:
        return mix(settings.gradientStart, settings.gradientEnd, lum);
    case ColorMode::CustomForegroundBackground:
    case ColorMode::Monochrome:
    default:
        return settings.foreground;
    }
}

uint8_t RenderEngine::glyphCoverage(char c, int x, int y, int w, int h) {
    const float nx = (x + 0.5f) / std::max(1, w);
    const float ny = (y + 0.5f) / std::max(1, h);
    const float cx = std::abs(nx - 0.5f);
    const float cy = std::abs(ny - 0.5f);
    const int density = std::max(1, static_cast<int>(c));
    const bool vertical = ((density >> 0) & 1) && cx < 0.08f;
    const bool horizontal = ((density >> 1) & 1) && cy < 0.08f;
    const bool diagA = ((density >> 2) & 1) && std::abs(nx - ny) < 0.10f;
    const bool diagB = ((density >> 3) & 1) && std::abs((1.0f - nx) - ny) < 0.10f;
    const bool box = ((density >> 4) & 1) && (cx > 0.34f || cy > 0.34f);
    const bool dot = ((density >> 5) & 1) && (cx * cx + cy * cy) < 0.055f;
    return (vertical || horizontal || diagA || diagB || box || dot) ? 255 : 0;
}

void RenderEngine::fillRect(Image8& image, int x0, int y0, int x1, int y1, Pixel8 color) {
    x0 = std::max(0, x0);
    y0 = std::max(0, y0);
    x1 = std::min(image.width, x1);
    y1 = std::min(image.height, y1);
    for (int y = y0; y < y1; ++y) {
        for (int x = x0; x < x1; ++x) {
            pixelAt(image, x, y) = color;
        }
    }
}

void RenderEngine::drawGlyph(Image8& image, int x, int y, int w, int h, char c, Pixel8 ink, Pixel8 base, const RenderSettings& settings) {
    const int glyphW = std::max(1, static_cast<int>(w * settings.characterScale));
    const int glyphH = std::max(1, static_cast<int>(h * settings.characterScale));
    const int gx0 = x + (w - glyphW) / 2;
    const int gy0 = y + (h - glyphH) / 2;
    fillRect(image, x, y, x + w, y + h, base);
    for (int py = 0; py < glyphH; ++py) {
        for (int px = 0; px < glyphW; ++px) {
            const uint8_t coverage = glyphCoverage(c, px, py, glyphW, glyphH);
            if (!coverage) {
                continue;
            }
            const int ox = gx0 + px;
            const int oy = gy0 + py;
            if (ox >= 0 && oy >= 0 && ox < image.width && oy < image.height) {
                pixelAt(image, ox, oy) = ink;
            }
        }
    }
}

void RenderEngine::render8(const Image8& input, Image8& output, const RenderSettings& settings) const {
    if (!input.pixels || !output.pixels || input.width <= 0 || input.height <= 0) {
        return;
    }

    const int columns = std::max(4, settings.pixelDensity);
    const int cellW = std::max(2, input.width / columns);
    const int cellH = std::max(2, static_cast<int>(cellW / std::max(0.1f, settings.cellAspectRatio)));
    const int stepW = std::max(1, static_cast<int>(cellW * settings.spacingX));
    const int stepH = std::max(1, static_cast<int>(cellH * settings.spacingY));
    const std::string ramp = settings.characterSet.empty() ? std::string("@%#*+=-:. ") : settings.characterSet;
    const int nth = std::max(1, settings.renderEveryNthCell);

    fillRect(output, 0, 0, output.width, output.height, settings.background);

    int cellIndex = 0;
    for (int y = settings.offsetY; y < input.height; y += stepH) {
        for (int x = settings.offsetX; x < input.width; x += stepW, ++cellIndex) {
            if (cellIndex % nth != 0) {
                continue;
            }

            float lumSum = 0.0f;
            int redSum = 0;
            int greenSum = 0;
            int blueSum = 0;
            int alphaMax = 0;
            int count = 0;
            Pixel8 sourceAverage {};
            for (int sy = y; sy < std::min(input.height, y + cellH); ++sy) {
                for (int sx = x; sx < std::min(input.width, x + cellW); ++sx) {
                    const Pixel8 p = getPixel(input, sx, sy);
                    lumSum += luminance(p);
                    redSum += p.r;
                    greenSum += p.g;
                    blueSum += p.b;
                    alphaMax = std::max(alphaMax, static_cast<int>(p.a));
                    ++count;
                }
            }
            if (count > 0) {
                sourceAverage.r = static_cast<uint8_t>(redSum / count);
                sourceAverage.g = static_cast<uint8_t>(greenSum / count);
                sourceAverage.b = static_cast<uint8_t>(blueSum / count);
                sourceAverage.a = static_cast<uint8_t>(alphaMax);
            }

            const float lum = adjustLuminance(count > 0 ? lumSum / count : 0.0f, settings);
            const float ordered = settings.order == CharacterOrder::DarkToLight ? lum : 1.0f - lum;
            const size_t charIndex = static_cast<size_t>(std::round(clamp01(ordered) * static_cast<float>(ramp.size() - 1)));
            Pixel8 ink = chooseInk(sourceAverage, lum, settings);
            if (settings.preserveSourceAlpha) {
                ink.a = sourceAverage.a;
            }
            Pixel8 base = settings.colorMode == ColorMode::CustomForegroundBackground ? settings.background : Pixel8 {0, 0, 0, settings.preserveSourceAlpha ? sourceAverage.a : 255};
            drawGlyph(output, x, y, cellW, cellH, ramp[charIndex], ink, base, settings);
        }
    }

    if (settings.blendWithOriginal > 0.0f) {
        for (int y = 0; y < output.height; ++y) {
            for (int x = 0; x < output.width; ++x) {
                pixelAt(output, x, y) = mix(pixelAt(output, x, y), getPixel(input, x, y), settings.blendWithOriginal);
            }
        }
    }
}

} // namespace ascii_character
