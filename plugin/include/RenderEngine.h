#pragma once

#include <cstdint>
#include <string>
#include <vector>
#include "RenderTypes.h"

namespace ascii_character {

struct Pixel8 {
    uint8_t r = 0;
    uint8_t g = 0;
    uint8_t b = 0;
    uint8_t a = 255;
};

struct Image8 {
    int width = 0;
    int height = 0;
    int rowbytes = 0;
    Pixel8* pixels = nullptr;
};

enum class CharacterOrder { DarkToLight = 0, LightToDark = 1 };
enum class ColorMode { Source = 0, Monochrome, TwoTone, Gradient, CustomForegroundBackground };
enum class Quality { Draft = 0, Normal, High };
enum class GridAlignHorizontal { Left = 0, Center, Right };
enum class GridAlignVertical { Top = 0, Center, Bottom };

struct RenderSettings {
    int pixelDensity = 90;
    float cellAspectRatio = 0.55f;
    float characterScale = 0.92f;
    float spacingX = 1.0f;
    float spacingY = 1.0f;
    float blendWithOriginal = 0.0f;
    bool preserveSourceAlpha = true;
    bool invertLuminance = false;

    float contrast = 1.0f;
    float brightness = 0.0f;
    float gamma = 1.0f;
    int threshold = 0;
    int posterizeLevels = 0;

    std::string characterSet = "@%#*+=-:. ";
    CharacterOrder order = CharacterOrder::DarkToLight;
    ColorMode colorMode = ColorMode::Monochrome;
    Pixel8 foreground {255, 255, 255, 255};
    Pixel8 background {0, 0, 0, 255};
    Pixel8 gradientStart {30, 255, 110, 255};
    Pixel8 gradientEnd {255, 255, 255, 255};
    float hueShiftDegrees = 0.0f;
    float saturation = 1.0f;

    GridAlignHorizontal horizontalAlign = GridAlignHorizontal::Center;
    GridAlignVertical verticalAlign = GridAlignVertical::Center;
    int offsetX = 0;
    int offsetY = 0;
    float rotationDegrees = 0.0f;
    Quality quality = Quality::Normal;
    bool antiAlias = true;
    int renderEveryNthCell = 1;
};

class PixelWriter;
class PixelReader;

class RenderEngine {
public:
    void render8(const Image8& input, Image8& output, const RenderSettings& settings) const;

private:
    static float luminance(const LinearRgba& pixel);
    static float adjustLuminance(float value, const RenderSettings& settings);
    static LinearRgba mix(const LinearRgba& a, const LinearRgba& b, float t);
    static LinearRgba chooseInk(const LinearRgba& sample, float luminance,
                                const LinearRgba& fg, const LinearRgba& bg,
                                const LinearRgba& gStart, const LinearRgba& gEnd,
                                ColorMode mode);
    static void drawGlyph(PixelWriter& writer, int x, int y, int w, int h, char c,
                          const LinearRgba& ink, const LinearRgba& base, const RenderSettings& settings);
};

} // namespace ascii_character
