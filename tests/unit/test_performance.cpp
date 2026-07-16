#include "RenderEngine.h"
#include <iostream>
#include <vector>
#include <chrono>
#include <cassert>

using namespace ascii_character;

int main() {
    constexpr int width = 1920;
    constexpr int height = 1080;
    std::vector<Pixel8> input(width * height);
    std::vector<Pixel8> output(width * height);

    // Initialize with a simple gradient
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            const auto v = static_cast<uint8_t>((x * 255) / (width - 1));
            input[y * width + x] = {255, v, v, v}; // Alpha, Red, Green, Blue
        }
    }

    Image8 in {width, height, width * static_cast<int>(sizeof(Pixel8)), input.data()};
    Image8 out {width, height, width * static_cast<int>(sizeof(Pixel8)), output.data()};
    
    RenderEngine engine;

    // Test Draft Quality
    RenderSettings draftSettings;
    draftSettings.pixelDensity = 60;
    draftSettings.quality = Quality::Draft;

    auto t0 = std::chrono::high_resolution_clock::now();
    engine.render8(in, out, draftSettings);
    auto t1 = std::chrono::high_resolution_clock::now();
    double draftTime = std::chrono::duration<double, std::milli>(t1 - t0).count();
    std::cout << "Draft Quality Render Time (1920x1080): " << draftTime << " ms\n";

    // Test High Quality
    RenderSettings highSettings;
    highSettings.pixelDensity = 60;
    highSettings.quality = Quality::High;

    auto t2 = std::chrono::high_resolution_clock::now();
    engine.render8(in, out, highSettings);
    auto t3 = std::chrono::high_resolution_clock::now();
    double highTime = std::chrono::duration<double, std::milli>(t3 - t2).count();
    std::cout << "High Quality Render Time (1920x1080): " << highTime << " ms\n";

    // In cloud CI environments, timing can be extremely noisy.
    // We log the times instead of asserting strictly to avoid flaky failures.
    if (draftTime > highTime) {
        std::cout << "Warning: Draft was slower than High (likely due to CI VM noise).\n";
    }
    std::cout << "Performance check completed.\n";

    return 0;
}
