#pragma once

namespace ascii_character {

struct LinearRgba {
    float r = 0.0f;
    float g = 0.0f;
    float b = 0.0f;
    float a = 1.0f;
};

struct ImageView {
    int width = 0;
    int height = 0;
    int rowBytes = 0;
    void* data = nullptr;
};

} // namespace ascii_character
