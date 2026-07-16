#include "RenderEngine.h"

#include <iostream>
#include <vector>

int main() {
    constexpr int width = 64;
    constexpr int height = 36;
    std::vector<ascii_character::Pixel8> input(width * height);
    std::vector<ascii_character::Pixel8> output(width * height);

    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            const auto v = static_cast<uint8_t>((x * 255) / (width - 1));
            input[y * width + x] = {v, v, v, 255};
        }
    }

    ascii_character::Image8 in {width, height, width * static_cast<int>(sizeof(ascii_character::Pixel8)), input.data()};
    ascii_character::Image8 out {width, height, width * static_cast<int>(sizeof(ascii_character::Pixel8)), output.data()};
    ascii_character::RenderSettings settings;
    settings.pixelDensity = 16;

    ascii_character::RenderEngine engine;
    engine.render8(in, out, settings);

    int nonBlack = 0;
    for (const auto& p : output) {
        if (p.r || p.g || p.b) {
            ++nonBlack;
        }
    }

    if (nonBlack == 0) {
        std::cerr << "render_engine_smoke failed: output was blank\n";
        return 1;
    }

    std::cout << "render_engine_smoke passed: " << nonBlack << " lit pixels\n";
    return 0;
}
