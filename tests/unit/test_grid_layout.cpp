#include "GridLayout.h"
#include <iostream>
#include <cassert>
#include <cmath>

using namespace ascii_character;

bool floatNear(float a, float b, float tolerance = 1e-3f) {
    return std::abs(a - b) < tolerance;
}

void testBasicLayout() {
    RenderSettings settings;
    settings.pixelDensity = 10;
    settings.cellAspectRatio = 1.0f; // Square cells
    settings.spacingX = 1.0f;
    settings.spacingY = 1.0f;
    settings.horizontalAlign = GridAlignHorizontal::Left;
    settings.verticalAlign = GridAlignVertical::Top;
    settings.offsetX = 0;
    settings.offsetY = 0;

    GridLayout layout(100, 100, settings);
    assert(layout.columns() == 10);
    // cellW = 100/10 = 10
    // stepX = 10 * 1 = 10
    // cellH = 10 / 1.0 = 10
    // stepY = 10 * 1 = 10
    // rows = (100 - 10) / 10 + 1 = 10
    assert(layout.rows() == 10);

    GridCell cell00 = layout.cell(0, 0);
    assert(floatNear(cell00.cellW, 10.0f));
    assert(floatNear(cell00.cellH, 10.0f));
    assert(floatNear(cell00.centerX, 5.0f));
    assert(floatNear(cell00.centerY, 5.0f));

    GridCell cell99 = layout.cell(9, 9);
    assert(floatNear(cell99.centerX, 95.0f));
    assert(floatNear(cell99.centerY, 95.0f));

    std::cout << "testBasicLayout passed\n";
}

void testAlignmentAndOffsets() {
    RenderSettings settings;
    settings.pixelDensity = 8; // cellW = 100/8 = 12.5
    settings.cellAspectRatio = 1.0f;
    settings.spacingX = 1.0f;
    settings.spacingY = 1.0f;
    settings.horizontalAlign = GridAlignHorizontal::Center;
    settings.verticalAlign = GridAlignVertical::Center;
    settings.offsetX = 5;
    settings.offsetY = -5;

    // Total width of grid = (8-1)*12.5 + 12.5 = 100
    // Start X (Center) = (100 - 100) / 2 = 0 + offsetX (5) = 5
    // Start Y (Center) = (100 - 100) / 2 = 0 + offsetY (-5) = -5

    GridLayout layout(100, 100, settings);
    GridCell cell00 = layout.cell(0, 0);
    assert(floatNear(cell00.centerX, 5.0f + 12.5f / 2.0f)); // 11.25
    assert(floatNear(cell00.centerY, -5.0f + 12.5f / 2.0f)); // 1.25

    std::cout << "testAlignmentAndOffsets passed\n";
}

void testClamping() {
    RenderSettings settings;
    settings.pixelDensity = 1000; // cellW = 100/1000 = 0.1f -> clamped to 2.0f!
    settings.cellAspectRatio = 1.0f;
    settings.spacingX = 0.1f; // stepX = 2.0 * 0.1 = 0.2f -> clamped to 1.0f!
    settings.spacingY = 0.1f;

    GridLayout layout(100, 100, settings);
    GridCell cell00 = layout.cell(0, 0);
    assert(cell00.cellW >= 2.0f);
    assert(cell00.cellH >= 2.0f);

    std::cout << "testClamping passed\n";
}

int main() {
    testBasicLayout();
    testAlignmentAndOffsets();
    testClamping();
    std::cout << "All GridLayout unit tests passed!\n";
    return 0;
}
