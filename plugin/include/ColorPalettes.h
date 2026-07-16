#pragma once

#include "RenderEngine.h"

#include <vector>

namespace ascii_character {

struct ColorPalettePreset {
    const char* name;
    Pixel8 foreground;
    Pixel8 background;
    Pixel8 gradientStart;
    Pixel8 gradientEnd;
    ColorMode mode;
};

const std::vector<ColorPalettePreset>& colorPalettePresets();
ColorPalettePreset colorPaletteByIndex(int index);

} // namespace ascii_character
