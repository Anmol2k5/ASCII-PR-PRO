#include "Utilities.h"
#include <iostream>
#include <cassert>
#include <cmath>
#include <algorithm>

using namespace ascii_character;

bool floatNear(float a, float b, float tolerance = 1e-3f) {
    return std::abs(a - b) < tolerance;
}

void testHsvRoundTrip() {
    float r = 1.0f, g = 0.0f, b = 0.0f;
    float h = 0.0f, s = 0.0f, v = 0.0f;

    // Pure Red
    rgbToHsv(r, g, b, h, s, v);
    assert(floatNear(h, 0.0f));
    assert(floatNear(s, 1.0f));
    assert(floatNear(v, 1.0f));

    float r2, g2, b2;
    hsvToRgb(h, s, v, r2, g2, b2);
    assert(floatNear(r, r2));
    assert(floatNear(g, g2));
    assert(floatNear(b, b2));

    // Pure Green
    r = 0.0f; g = 1.0f; b = 0.0f;
    rgbToHsv(r, g, b, h, s, v);
    assert(floatNear(h, 120.0f));
    assert(floatNear(s, 1.0f));
    assert(floatNear(v, 1.0f));
    hsvToRgb(h, s, v, r2, g2, b2);
    assert(floatNear(r, r2));
    assert(floatNear(g, g2));
    assert(floatNear(b, b2));

    // White
    r = 1.0f; g = 1.0f; b = 1.0f;
    rgbToHsv(r, g, b, h, s, v);
    assert(floatNear(s, 0.0f));
    assert(floatNear(v, 1.0f));
    hsvToRgb(h, s, v, r2, g2, b2);
    assert(floatNear(r, r2));
    assert(floatNear(g, g2));
    assert(floatNear(b, b2));

    // Dark Gray
    r = 0.2f; g = 0.2f; b = 0.2f;
    rgbToHsv(r, g, b, h, s, v);
    assert(floatNear(s, 0.0f));
    assert(floatNear(v, 0.2f));
    hsvToRgb(h, s, v, r2, g2, b2);
    assert(floatNear(r, r2));
    assert(floatNear(g, g2));
    assert(floatNear(b, b2));

    std::cout << "testHsvRoundTrip passed\n";
}

void testHueShift() {
    float r = 1.0f, g = 0.0f, b = 0.0f;
    float h, s, v;
    rgbToHsv(r, g, b, h, s, v);

    // Shift hue by 120 degrees (Red -> Green)
    h += 120.0f;
    h = std::fmod(h, 360.0f);

    float r2, g2, b2;
    hsvToRgb(h, s, v, r2, g2, b2);
    assert(floatNear(r2, 0.0f));
    assert(floatNear(g2, 1.0f));
    assert(floatNear(b2, 0.0f));

    std::cout << "testHueShift passed\n";
}

void testSaturation() {
    float r = 1.0f, g = 0.0f, b = 0.0f;
    float h, s, v;
    rgbToHsv(r, g, b, h, s, v);

    // Scale saturation to 50%
    s *= 0.5f;

    float r2, g2, b2;
    hsvToRgb(h, s, v, r2, g2, b2);
    assert(floatNear(r2, 1.0f));
    assert(floatNear(g2, 0.5f));
    assert(floatNear(b2, 0.5f));

    std::cout << "testSaturation passed\n";
}

int main() {
    testHsvRoundTrip();
    testHueShift();
    testSaturation();
    std::cout << "All ColorControls unit tests passed!\n";
    return 0;
}
