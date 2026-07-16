#pragma once

#include <algorithm>

namespace ascii_character {

template <typename T>
T clampValue(T value, T low, T high) {
    return std::max(low, std::min(high, value));
}

} // namespace ascii_character
