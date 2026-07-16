#include "GlyphAtlas.h"
#include "../../assets/glyphs/ascii_atlas_generated.h"
#include <algorithm>
#include <cmath>

namespace ascii_character {

const GlyphAtlas& GlyphAtlas::builtIn() {
    static GlyphAtlas instance;
    return instance;
}

bool GlyphAtlas::contains(char character) const {
    return character >= kFirstGlyph && character <= kLastGlyph;
}

float GlyphAtlas::coverage(char character, float normalizedX, float normalizedY, bool antialias) const {
    // Coordinates outside [0, 1] return zero
    if (normalizedX < 0.0f || normalizedX > 1.0f || normalizedY < 0.0f || normalizedY > 1.0f) {
        return 0.0f;
    }

    char targetChar = character;
    if (!contains(targetChar)) {
        targetChar = '?'; // Fallback
        if (!contains(targetChar)) {
            return 0.0f;
        }
    }

    // Space (char 32) returns 0.0f coverage immediately
    if (targetChar == ' ') {
        return 0.0f;
    }

    int glyphIndex = static_cast<int>(targetChar) - kFirstGlyph;
    int glyphOffset = glyphIndex * kGlyphWidth * kGlyphHeight;

    auto getPixel = [glyphOffset](int px, int py) -> float {
        px = std::max(0, std::min(kGlyphWidth - 1, px));
        py = std::max(0, std::min(kGlyphHeight - 1, py));
        return static_cast<float>(kGlyphCoverage[glyphOffset + py * kGlyphWidth + px]);
    };

    if (!antialias) {
        // Nearest-neighbor lookup
        int px = static_cast<int>(normalizedX * (kGlyphWidth - 1) + 0.5f);
        int py = static_cast<int>(normalizedY * (kGlyphHeight - 1) + 0.5f);
        return getPixel(px, py) / 255.0f;
    } else {
        // Bilinear interpolation
        float x = normalizedX * (kGlyphWidth - 1);
        float y = normalizedY * (kGlyphHeight - 1);

        int x0 = static_cast<int>(std::floor(x));
        int y0 = static_cast<int>(std::floor(y));
        int x1 = std::min(kGlyphWidth - 1, x0 + 1);
        int y1 = std::min(kGlyphHeight - 1, y0 + 1);

        float tx = x - x0;
        float ty = y - y0;

        float c00 = getPixel(x0, y0);
        float c10 = getPixel(x1, y0);
        float c01 = getPixel(x0, y1);
        float c11 = getPixel(x1, y1);

        float c0 = c00 * (1.0f - tx) + c10 * tx;
        float c1 = c01 * (1.0f - tx) + c11 * tx;
        float c = c0 * (1.0f - ty) + c1 * ty;

        return c / 255.0f;
    }
}

} // namespace ascii_character
