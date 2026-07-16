#include "ColorPalettes.h"

namespace ascii_character {

const std::vector<ColorPalettePreset>& colorPalettePresets() {
    static const std::vector<ColorPalettePreset> palettes {
        {"White on Black", {255,255,255,255}, {0,0,0,255}, {255,255,255,255}, {255,255,255,255}, ColorMode::Monochrome},
        {"Green Terminal", {70,255,120,255}, {0,8,3,255}, {0,80,35,255}, {160,255,180,255}, ColorMode::Gradient},
        {"Orange Terminal", {255,170,65,255}, {18,8,0,255}, {150,45,0,255}, {255,210,95,255}, ColorMode::Gradient},
        {"Blue Print", {100,190,255,255}, {2,18,42,255}, {30,80,155,255}, {205,235,255,255}, ColorMode::Gradient},
        {"High Contrast", {255,255,255,255}, {0,0,0,255}, {0,0,0,255}, {255,255,255,255}, ColorMode::TwoTone},
        {"Soft Minimal", {225,225,215,255}, {22,22,24,255}, {80,80,85,255}, {235,235,225,255}, ColorMode::Gradient},
        {"Original Colour", {255,255,255,255}, {0,0,0,255}, {0,0,0,255}, {255,255,255,255}, ColorMode::Source}
    };
    return palettes;
}

ColorPalettePreset colorPaletteByIndex(int index) {
    const auto& palettes = colorPalettePresets();
    const size_t safe = static_cast<size_t>(index < 0 ? 0 : index) % palettes.size();
    return palettes[safe];
}

} // namespace ascii_character
