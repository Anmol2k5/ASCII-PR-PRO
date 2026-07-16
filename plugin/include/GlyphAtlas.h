#pragma once

namespace ascii_character {

class GlyphAtlas {
public:
    static const GlyphAtlas& builtIn();
    
    // Returns coverage in range [0.0, 1.0]
    float coverage(char character, float normalizedX, float normalizedY, bool antialias) const;
    
    bool contains(char character) const;
};

} // namespace ascii_character
