#include "CharacterSets.h"

namespace ascii_character {

const std::vector<CharacterSetPreset>& characterSetPresets() {
    static const std::vector<CharacterSetPreset> presets {
        {"Classic", "@%#*+=-:. "},
        {"Dense", "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "},
        {"Minimal", "@#*:. "},
        {"Blocks", "#%*+=-:. "},
        {"Binary", "10"},
        {"Editorial", "MNHQ$OC?7>!:-. "},
        {"Fine Dots", "8&ohx+=;,. "}
    };
    return presets;
}

std::string characterSetByIndex(int index, const std::string& custom) {
    if (index == 0 && !custom.empty()) {
        return custom;
    }
    const auto& presets = characterSetPresets();
    const int safe = index <= 0 ? 1 : index;
    const size_t presetIndex = static_cast<size_t>(safe - 1) % presets.size();
    return presets[presetIndex].ramp;
}

} // namespace ascii_character
