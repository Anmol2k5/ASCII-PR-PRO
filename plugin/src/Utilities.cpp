#include "Utilities.h"
#include <cmath>

namespace ascii_character {

void rgbToHsv(float r, float g, float b, float& h, float& s, float& v) {
    float maxVal = std::max({r, g, b});
    float minVal = std::min({r, g, b});
    float delta = maxVal - minVal;

    v = maxVal;

    if (maxVal > 1e-6f) {
        s = delta / maxVal;
    } else {
        s = 0.0f;
        h = 0.0f;
        return;
    }

    if (delta < 1e-6f) {
        h = 0.0f;
    } else {
        if (r >= maxVal) {
            h = (g - b) / delta;
        } else if (g >= maxVal) {
            h = 2.0f + (b - r) / delta;
        } else {
            h = 4.0f + (r - g) / delta;
        }
        h *= 60.0f;
        if (h < 0.0f) {
            h += 360.0f;
        }
    }
}

void hsvToRgb(float h, float s, float v, float& r, float& g, float& b) {
    if (s < 1e-6f) {
        r = g = b = v;
        return;
    }

    h /= 60.0f;
    int i = static_cast<int>(std::floor(h));
    float f = h - i;
    float p = v * (1.0f - s);
    float q = v * (1.0f - s * f);
    float t = v * (1.0f - s * (1.0f - f));

    switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    }
}

} // namespace ascii_character
