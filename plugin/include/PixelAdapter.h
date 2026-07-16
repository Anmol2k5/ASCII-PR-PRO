#pragma once

#include "RenderTypes.h"
#include <memory>

#ifdef TESTS_NO_AE_SDK
typedef unsigned char A_u_char;
typedef struct {
    A_u_char alpha, red, green, blue;
} PF_Pixel8;
#endif

namespace ascii_character {

enum class HostPixelFormat {
    Argb8,
    Argb16,
    Argb32Float
};

class PixelReader {
public:
    virtual ~PixelReader() = default;
    virtual LinearRgba read(int x, int y) const = 0;
    virtual int width() const = 0;
    virtual int height() const = 0;
};

class PixelWriter {
public:
    virtual ~PixelWriter() = default;
    virtual void write(int x, int y, const LinearRgba& pixel) = 0;
    virtual int width() const = 0;
    virtual int height() const = 0;
};

std::unique_ptr<PixelReader> createReader(HostPixelFormat format, const ImageView& view);
std::unique_ptr<PixelWriter> createWriter(HostPixelFormat format, const ImageView& view);

} // namespace ascii_character
