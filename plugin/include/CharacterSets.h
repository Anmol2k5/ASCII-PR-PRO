#pragma once

#include <string>
#include <vector>

namespace ascii_character {

struct CharacterSetPreset {
    const char* name;
    const char* ramp;
};

const std::vector<CharacterSetPreset>& characterSetPresets();
std::string characterSetByIndex(int index, const std::string& custom);

} // namespace ascii_character
