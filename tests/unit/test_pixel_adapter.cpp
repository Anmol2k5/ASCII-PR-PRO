#define TESTS_NO_AE_SDK
#include "PixelAdapter.h"
#include <iostream>
#include <vector>
#include <cassert>
#include <cmath>

using namespace ascii_character;

bool floatNear(float a, float b, float tolerance = 1e-4f) {
    return std::abs(a - b) < tolerance;
}

void testColorRouting() {
    // 1x1 image representation
    PF_Pixel8 pixel;
    pixel.alpha = 255;
    pixel.red = 255;
    pixel.green = 0;
    pixel.blue = 0;

    ImageView view { 1, 1, 4, &pixel };
    auto reader = createReader(HostPixelFormat::Argb8, view);
    assert(reader != nullptr);

    LinearRgba color = reader->read(0, 0);
    assert(floatNear(color.r, 1.0f));
    assert(floatNear(color.g, 0.0f));
    assert(floatNear(color.b, 0.0f));
    assert(floatNear(color.a, 1.0f));

    // Write back green
    LinearRgba newColor { 0.0f, 1.0f, 0.0f, 1.0f };
    auto writer = createWriter(HostPixelFormat::Argb8, view);
    assert(writer != nullptr);
    writer->write(0, 0, newColor);

    assert(pixel.red == 0);
    assert(pixel.green == 255);
    assert(pixel.blue == 0);
    assert(pixel.alpha == 255);

    std::cout << "testColorRouting passed\n";
}

void testRowPadding() {
    // 2x2 image with padded rowBytes (e.g. 12 bytes instead of 8 bytes)
    // Row 0: Pixel(255, 0, 0), Pixel(0, 255, 0), Padding(4 bytes)
    // Row 1: Pixel(0, 0, 255), Pixel(255, 255, 255), Padding(4 bytes)
    std::vector<uint8_t> buffer(24, 0);
    
    // Row 0
    PF_Pixel8* row0 = reinterpret_cast<PF_Pixel8*>(buffer.data());
    row0[0] = { 255, 255, 0, 0 }; // Alpha, Red, Green, Blue
    row0[1] = { 255, 0, 255, 0 };

    // Row 1 (starts at offset 12)
    PF_Pixel8* row1 = reinterpret_cast<PF_Pixel8*>(buffer.data() + 12);
    row1[0] = { 255, 0, 0, 255 };
    row1[1] = { 255, 255, 255, 255 };

    ImageView view { 2, 2, 12, buffer.data() };
    auto reader = createReader(HostPixelFormat::Argb8, view);

    // Read Row 0, Col 1
    LinearRgba p01 = reader->read(1, 0);
    assert(floatNear(p01.r, 0.0f));
    assert(floatNear(p01.g, 1.0f));
    assert(floatNear(p01.b, 0.0f));

    // Read Row 1, Col 0
    LinearRgba p10 = reader->read(0, 1);
    assert(floatNear(p10.r, 0.0f));
    assert(floatNear(p10.g, 0.0f));
    assert(floatNear(p10.b, 1.0f));

    // Write to Row 1, Col 1
    auto writer = createWriter(HostPixelFormat::Argb8, view);
    writer->write(1, 1, LinearRgba{ 0.5f, 0.5f, 0.5f, 1.0f });

    PF_Pixel8 updated = row1[1];
    assert(updated.red == 128); // 0.5 * 255 = 127.5 -> rounded to 128
    assert(updated.green == 128);
    assert(updated.blue == 128);

    std::cout << "testRowPadding passed\n";
}

void testAlphaHandling() {
    PF_Pixel8 pixel;
    // 50% alpha white (premultiplied in AE is (128, 128, 128, 128))
    pixel.alpha = 128;
    pixel.red = 128;
    pixel.green = 128;
    pixel.blue = 128;

    ImageView view { 1, 1, 4, &pixel };
    auto reader = createReader(HostPixelFormat::Argb8, view);

    LinearRgba color = reader->read(0, 0);
    // Unpremultiplied result should be straight white (1.0, 1.0, 1.0, 0.5)
    assert(floatNear(color.a, 128.0f / 255.0f));
    assert(floatNear(color.r, 1.0f, 0.01f)); // Allow small rounding error
    assert(floatNear(color.g, 1.0f, 0.01f));
    assert(floatNear(color.b, 1.0f, 0.01f));

    // Write back 50% alpha white straight color
    auto writer = createWriter(HostPixelFormat::Argb8, view);
    writer->write(0, 0, LinearRgba{ 1.0f, 1.0f, 1.0f, 0.5f });

    // Output should be premultiplied back to 128
    assert(pixel.alpha == 128);
    assert(pixel.red == 128);
    assert(pixel.green == 128);
    assert(pixel.blue == 128);

    // Fully transparent color write
    writer->write(0, 0, LinearRgba{ 1.0f, 0.5f, 0.2f, 0.0f });
    assert(pixel.alpha == 0);
    assert(pixel.red == 0);
    assert(pixel.green == 0);
    assert(pixel.blue == 0);

    std::cout << "testAlphaHandling passed\n";
}

void testDeepColorAdapters() {
    // Test 16-bpc
    PF_Pixel16 pixel16;
    pixel16.alpha = 32768;
    pixel16.red = 32768;
    pixel16.green = 0;
    pixel16.blue = 16384; // 50% blue

    ImageView view16 { 1, 1, 8, &pixel16 };
    auto reader16 = createReader(HostPixelFormat::Argb16, view16);
    assert(reader16 != nullptr);

    LinearRgba color16 = reader16->read(0, 0);
    assert(floatNear(color16.r, 1.0f));
    assert(floatNear(color16.g, 0.0f));
    assert(floatNear(color16.b, 0.5f));
    assert(floatNear(color16.a, 1.0f));

    auto writer16 = createWriter(HostPixelFormat::Argb16, view16);
    assert(writer16 != nullptr);
    writer16->write(0, 0, LinearRgba{ 0.0f, 1.0f, 0.25f, 0.5f });

    // Output should be premultiplied: alpha = 16384, red = 0, green = 16384, blue = 16384 * 0.25 = 4096
    assert(pixel16.alpha == 16384);
    assert(pixel16.red == 0);
    assert(pixel16.green == 16384);
    assert(pixel16.blue == 4096);

    // Test 32-bpc
    PF_Pixel32 pixel32;
    pixel32.alpha = 1.0f;
    pixel32.red = 1.0f;
    pixel32.green = 0.0f;
    pixel32.blue = 0.5f;

    ImageView view32 { 1, 1, 16, &pixel32 };
    auto reader32 = createReader(HostPixelFormat::Argb32Float, view32);
    assert(reader32 != nullptr);

    LinearRgba color32 = reader32->read(0, 0);
    assert(floatNear(color32.r, 1.0f));
    assert(floatNear(color32.g, 0.0f));
    assert(floatNear(color32.b, 0.5f));
    assert(floatNear(color32.a, 1.0f));

    auto writer32 = createWriter(HostPixelFormat::Argb32Float, view32);
    assert(writer32 != nullptr);
    writer32->write(0, 0, LinearRgba{ 0.0f, 1.0f, 0.25f, 0.5f });

    // Output should be premultiplied: alpha = 0.5, red = 0.0, green = 0.5, blue = 0.125
    assert(floatNear(pixel32.alpha, 0.5f));
    assert(floatNear(pixel32.red, 0.0f));
    assert(floatNear(pixel32.green, 0.5f));
    assert(floatNear(pixel32.blue, 0.125f));

    std::cout << "testDeepColorAdapters passed\n";
}

int main() {
    testColorRouting();
    testRowPadding();
    testAlphaHandling();
    testDeepColorAdapters();
    std::cout << "All PixelAdapter unit tests passed!\n";
    return 0;
}
