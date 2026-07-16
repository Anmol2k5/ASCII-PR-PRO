#include "RenderEngine.h"
#include "GlyphAtlas.h"
#include "PixelAdapter.h"
#include "GridLayout.h"
#include "Utilities.h"

#include <algorithm>
#include <cmath>

namespace ascii_character {

namespace {

LinearRgba toLinear(const Pixel8& p) {
    return {p.r / 255.0f, p.g / 255.0f, p.b / 255.0f, p.a / 255.0f};
}

} // namespace

float RenderEngine::luminance(const LinearRgba& pixel) {
    return 0.2126f * pixel.r + 0.7152f * pixel.g + 0.0722f * pixel.b;
}

float RenderEngine::adjustLuminance(float value, const RenderSettings& settings) {
    value = (value - 0.5f) * settings.contrast + 0.5f + settings.brightness;
    value = std::max(0.0f, std::min(1.0f, value));
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

LinearRgba RenderEngine::mix(const LinearRgba& a, const LinearRgba& b, float t) {
    t = std::max(0.0f, std::min(1.0f, t));
    return {
        a.r * (1.0f - t) + b.r * t,
        a.g * (1.0f - t) + b.g * t,
        a.b * (1.0f - t) + b.b * t,
        a.a * (1.0f - t) + b.a * t
    };
}

LinearRgba RenderEngine::chooseInk(const LinearRgba& sample, float luminance,
                                    const LinearRgba& fg, const LinearRgba& bg,
                                    const LinearRgba& gStart, const LinearRgba& gEnd,
                                    ColorMode mode) {
    switch (mode) {
    case ColorMode::Source:
        return sample;
    case ColorMode::TwoTone:
        return luminance < 0.5f ? bg : fg;
    case ColorMode::Gradient:
        return mix(gStart, gEnd, luminance);
    case ColorMode::CustomForegroundBackground:
    case ColorMode::Monochrome:
    default:
        return fg;
    }
}

void RenderEngine::drawGlyph(PixelWriter& writer, int x, int y, int w, int h, char c,
                              const LinearRgba& ink, const LinearRgba& base, const RenderSettings& settings) {
    const int glyphW = std::max(1, static_cast<int>(w * settings.characterScale));
    const int glyphH = std::max(1, static_cast<int>(h * settings.characterScale));
    const int gx0 = x + (w - glyphW) / 2;
    const int gy0 = y + (h - glyphH) / 2;
    
    // Fill the background of the cell
    for (int cellY = y; cellY < y + h; ++cellY) {
        for (int cellX = x; cellX < x + w; ++cellX) {
            writer.write(cellX, cellY, base);
        }
    }
    
    const auto& atlas = GlyphAtlas::builtIn();
    
    for (int py = 0; py < glyphH; ++py) {
        for (int px = 0; px < glyphW; ++px) {
            float nx = static_cast<float>(px) / std::max(1, glyphW - 1);
            float ny = static_cast<float>(py) / std::max(1, glyphH - 1);
            float cov = atlas.coverage(c, nx, ny, settings.antiAlias);
            if (cov < 1e-4f) {
                continue;
            }
            const int ox = gx0 + px;
            const int oy = gy0 + py;
            writer.write(ox, oy, mix(base, ink, cov));
        }
    }
}

void RenderEngine::render8(const Image8& input, Image8& output, const RenderSettings& settings) const {
    if (!input.pixels || !output.pixels || input.width <= 0 || input.height <= 0) {
        return;
    }

    ImageView inView { input.width, input.height, input.rowbytes, input.pixels };
    ImageView outView { output.width, output.height, output.rowbytes, output.pixels };
    auto reader = createReader(HostPixelFormat::Argb8, inView);
    auto writer = createWriter(HostPixelFormat::Argb8, outView);
    if (!reader || !writer) {
        return;
    }

    render(*reader, *writer, settings);
}

void RenderEngine::render(PixelReader& reader, PixelWriter& writer, const RenderSettings& settings) const {
    // Convert settings colors to linear
    LinearRgba fg = toLinear(settings.foreground);
    LinearRgba bg = toLinear(settings.background);
    LinearRgba gStart = toLinear(settings.gradientStart);
    LinearRgba gEnd = toLinear(settings.gradientEnd);

    int imageW = reader.width();
    int imageH = reader.height();

    // Initialize layout
    GridLayout layout(imageW, imageH, settings);

    // Clear output with background color
    for (int y = 0; y < writer.height(); ++y) {
        for (int x = 0; x < writer.width(); ++x) {
            writer.write(x, y, bg);
        }
    }

    const std::string ramp = settings.characterSet.empty() ? std::string("@%#*+=-:. ") : settings.characterSet;
    const int nth = std::max(1, settings.renderEveryNthCell);

    float cx = imageW / 2.0f;
    float cy = imageH / 2.0f;
    bool hasRotation = std::abs(settings.rotationDegrees) > 0.001f;
    float rad = settings.rotationDegrees * (3.1415926535f / 180.0f);
    float cosR = std::cos(rad);
    float sinR = std::sin(rad);

    int cellIndex = 0;
    for (int r = 0; r < layout.rows(); ++r) {
        for (int c = 0; c < layout.columns(); ++c, ++cellIndex) {
            if (cellIndex % nth != 0) {
                continue;
            }

            GridCell cell = layout.cell(c, r);
            if (!cell.active) {
                continue;
            }

            // Determine sample points for the cell
            std::vector<std::pair<float, float>> samplePoints;
            float x0 = cell.centerX - cell.cellW / 2.0f;
            float y0 = cell.centerY - cell.cellH / 2.0f;

            if (settings.quality == Quality::Draft) {
                samplePoints.push_back({cell.centerX, cell.centerY});
            } else if (settings.quality == Quality::Normal) {
                float offsets[2] = {0.25f, 0.75f};
                for (float dy : offsets) {
                    for (float dx : offsets) {
                        samplePoints.push_back({x0 + dx * cell.cellW, y0 + dy * cell.cellH});
                    }
                }
            } else { // High
                float offsets[3] = {1.0f / 6.0f, 0.5f, 5.0f / 6.0f};
                for (float dy : offsets) {
                    for (float dx : offsets) {
                        samplePoints.push_back({x0 + dx * cell.cellW, y0 + dy * cell.cellH});
                    }
                }
            }

            // Sample input and accumulate
            float lumSum = 0.0f;
            float redSum = 0.0f;
            float greenSum = 0.0f;
            float blueSum = 0.0f;
            float alphaMax = 0.0f;
            int count = 0;

            for (const auto& pt : samplePoints) {
                float sx = pt.first;
                float sy = pt.second;

                // Apply rotation about the image center if enabled
                if (hasRotation) {
                    float dx = sx - cx;
                    float dy = sy - cy;
                    sx = cx + dx * cosR - dy * sinR;
                    sy = cy + dx * sinR + dy * cosR;
                }

                int ix = static_cast<int>(std::round(sx));
                int iy = static_cast<int>(std::round(sy));

                if (ix >= 0 && ix < imageW && iy >= 0 && iy < imageH) {
                    LinearRgba p = reader.read(ix, iy);
                    lumSum += luminance(p);
                    redSum += p.r;
                    greenSum += p.g;
                    blueSum += p.b;
                    alphaMax = std::max(alphaMax, p.a);
                    ++count;
                }
            }

            LinearRgba sourceAverage {};
            if (count > 0) {
                sourceAverage.r = redSum / count;
                sourceAverage.g = greenSum / count;
                sourceAverage.b = blueSum / count;
                sourceAverage.a = alphaMax;
            }

            if (settings.colorMode == ColorMode::Source && count > 0) {
                float h = 0.0f, s = 0.0f, v = 0.0f;
                rgbToHsv(sourceAverage.r, sourceAverage.g, sourceAverage.b, h, s, v);
                h += settings.hueShiftDegrees;
                h = std::fmod(h, 360.0f);
                if (h < 0.0f) {
                    h += 360.0f;
                }
                s *= settings.saturation;
                s = std::max(0.0f, std::min(1.0f, s));
                hsvToRgb(h, s, v, sourceAverage.r, sourceAverage.g, sourceAverage.b);
            }

            float rawLum = count > 0 ? lumSum / count : 0.0f;
            float lum = adjustLuminance(rawLum, settings);
            float ordered = settings.order == CharacterOrder::DarkToLight ? lum : 1.0f - lum;
            
            float clampedOrdered = std::max(0.0f, std::min(1.0f, ordered));
            size_t charIndex = static_cast<size_t>(std::round(clampedOrdered * static_cast<float>(ramp.size() - 1)));

            LinearRgba ink = chooseInk(sourceAverage, lum, fg, bg, gStart, gEnd, settings.colorMode);
            if (settings.preserveSourceAlpha) {
                ink.a = sourceAverage.a;
            }

            LinearRgba base = (settings.colorMode == ColorMode::CustomForegroundBackground) 
                ? bg 
                : LinearRgba {0.0f, 0.0f, 0.0f, 0.0f};

            // Draw glyph relative to layout position
            int drawX = static_cast<int>(std::round(x0));
            int drawY = static_cast<int>(std::round(y0));
            int drawW = static_cast<int>(std::round(cell.cellW));
            int drawH = static_cast<int>(std::round(cell.cellH));

            drawGlyph(writer, drawX, drawY, drawW, drawH, ramp[charIndex], ink, base, settings);
        }
    }

    // Handle blend with original
    if (settings.blendWithOriginal > 0.0f) {
        float blend = std::max(0.0f, std::min(1.0f, settings.blendWithOriginal));
        for (int y = 0; y < writer.height(); ++y) {
            for (int x = 0; x < writer.width(); ++x) {
                LinearRgba outColor = writer.read(x, y);
                LinearRgba inColor = reader.read(x, y);
                writer.write(x, y, mix(outColor, inColor, blend));
            }
        }
    }
}

} // namespace ascii_character
