#pragma once

#include <algorithm>

namespace ascii_character {

template <typename T>
T clampValue(T value, T low, T high) {
    return std::max(low, std::min(high, value));
}

void rgbToHsv(float r, float g, float b, float& h, float& s, float& v);
void hsvToRgb(float h, float s, float v, float& r, float& g, float& b);

} // namespace ascii_character
