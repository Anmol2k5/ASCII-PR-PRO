#include "PixelAdapter.h"
#ifndef TESTS_NO_AE_SDK
#include "AE_Effect.h"
#endif
#include <algorithm>
#include <cmath>

namespace ascii_character {

// ==========================================
// 8-bpc (ARGB 8) Adapter Implementation
// ==========================================

class PixelReader8 : public PixelReader {
    ImageView view_;
public:
    PixelReader8(const ImageView& view) : view_(view) {}
    
    int width() const override { return view_.width; }
    int height() const override { return view_.height; }
    
    LinearRgba read(int x, int y) const override {
        x = std::max(0, std::min(view_.width - 1, x));
        y = std::max(0, std::min(view_.height - 1, y));
        
        const auto* row = reinterpret_cast<const PF_Pixel8*>(
            reinterpret_cast<const unsigned char*>(view_.data) + y * view_.rowBytes);
        const PF_Pixel8& source = row[x];
        
        LinearRgba result;
        result.a = source.alpha / 255.0f;
        if (result.a > 1e-6f) {
            result.r = (source.red   / 255.0f) / result.a;
            result.g = (source.green / 255.0f) / result.a;
            result.b = (source.blue  / 255.0f) / result.a;
        } else {
            result.r = result.g = result.b = 0.0f;
        }
        
        result.r = std::max(0.0f, std::min(1.0f, result.r));
        result.g = std::max(0.0f, std::min(1.0f, result.g));
        result.b = std::max(0.0f, std::min(1.0f, result.b));
        result.a = std::max(0.0f, std::min(1.0f, result.a));
        return result;
    }
};

class PixelWriter8 : public PixelWriter {
    ImageView view_;
public:
    PixelWriter8(const ImageView& view) : view_(view) {}
    
    int width() const override { return view_.width; }
    int height() const override { return view_.height; }
    
    void write(int x, int y, const LinearRgba& pixel) override {
        if (x < 0 || x >= view_.width || y < 0 || y >= view_.height) {
            return;
        }
        
        auto* row = reinterpret_cast<PF_Pixel8*>(
            reinterpret_cast<unsigned char*>(view_.data) + y * view_.rowBytes);
        PF_Pixel8& dest = row[x];
        
        float a = std::max(0.0f, std::min(1.0f, pixel.a));
        float r = std::max(0.0f, std::min(1.0f, pixel.r)) * a;
        float g = std::max(0.0f, std::min(1.0f, pixel.g)) * a;
        float b = std::max(0.0f, std::min(1.0f, pixel.b)) * a;
        
        dest.alpha = static_cast<unsigned char>(std::round(a * 255.0f));
        dest.red   = static_cast<unsigned char>(std::round(r * 255.0f));
        dest.green = static_cast<unsigned char>(std::round(g * 255.0f));
        dest.blue  = static_cast<unsigned char>(std::round(b * 255.0f));
    }
    
    LinearRgba read(int x, int y) const override {
        x = std::max(0, std::min(view_.width - 1, x));
        y = std::max(0, std::min(view_.height - 1, y));
        
        const auto* row = reinterpret_cast<const PF_Pixel8*>(
            reinterpret_cast<const unsigned char*>(view_.data) + y * view_.rowBytes);
        const PF_Pixel8& source = row[x];
        
        LinearRgba result;
        result.a = source.alpha / 255.0f;
        if (result.a > 1e-6f) {
            result.r = (source.red   / 255.0f) / result.a;
            result.g = (source.green / 255.0f) / result.a;
            result.b = (source.blue  / 255.0f) / result.a;
        } else {
            result.r = result.g = result.b = 0.0f;
        }
        
        result.r = std::max(0.0f, std::min(1.0f, result.r));
        result.g = std::max(0.0f, std::min(1.0f, result.g));
        result.b = std::max(0.0f, std::min(1.0f, result.b));
        result.a = std::max(0.0f, std::min(1.0f, result.a));
        return result;
    }
};

// ==========================================
// 16-bpc (ARGB 16) Adapter Implementation
// ==========================================

class PixelReader16 : public PixelReader {
    ImageView view_;
public:
    PixelReader16(const ImageView& view) : view_(view) {}
    
    int width() const override { return view_.width; }
    int height() const override { return view_.height; }
    
    LinearRgba read(int x, int y) const override {
        x = std::max(0, std::min(view_.width - 1, x));
        y = std::max(0, std::min(view_.height - 1, y));
        
        const auto* row = reinterpret_cast<const PF_Pixel16*>(
            reinterpret_cast<const unsigned char*>(view_.data) + y * view_.rowBytes);
        const PF_Pixel16& source = row[x];
        
        LinearRgba result;
        result.a = source.alpha / 32768.0f;
        if (result.a > 1e-6f) {
            result.r = (source.red   / 32768.0f) / result.a;
            result.g = (source.green / 32768.0f) / result.a;
            result.b = (source.blue  / 32768.0f) / result.a;
        } else {
            result.r = result.g = result.b = 0.0f;
        }
        
        result.r = std::max(0.0f, std::min(1.0f, result.r));
        result.g = std::max(0.0f, std::min(1.0f, result.g));
        result.b = std::max(0.0f, std::min(1.0f, result.b));
        result.a = std::max(0.0f, std::min(1.0f, result.a));
        return result;
    }
};

class PixelWriter16 : public PixelWriter {
    ImageView view_;
public:
    PixelWriter16(const ImageView& view) : view_(view) {}
    
    int width() const override { return view_.width; }
    int height() const override { return view_.height; }
    
    void write(int x, int y, const LinearRgba& pixel) override {
        if (x < 0 || x >= view_.width || y < 0 || y >= view_.height) {
            return;
        }
        
        auto* row = reinterpret_cast<PF_Pixel16*>(
            reinterpret_cast<unsigned char*>(view_.data) + y * view_.rowBytes);
        PF_Pixel16& dest = row[x];
        
        float a = std::max(0.0f, std::min(1.0f, pixel.a));
        float r = std::max(0.0f, std::min(1.0f, pixel.r)) * a;
        float g = std::max(0.0f, std::min(1.0f, pixel.g)) * a;
        float b = std::max(0.0f, std::min(1.0f, pixel.b)) * a;
        
        dest.alpha = static_cast<unsigned short>(std::round(a * 32768.0f));
        dest.red   = static_cast<unsigned short>(std::round(r * 32768.0f));
        dest.green = static_cast<unsigned short>(std::round(g * 32768.0f));
        dest.blue  = static_cast<unsigned short>(std::round(b * 32768.0f));
    }
    
    LinearRgba read(int x, int y) const override {
        x = std::max(0, std::min(view_.width - 1, x));
        y = std::max(0, std::min(view_.height - 1, y));
        
        const auto* row = reinterpret_cast<const PF_Pixel16*>(
            reinterpret_cast<const unsigned char*>(view_.data) + y * view_.rowBytes);
        const PF_Pixel16& source = row[x];
        
        LinearRgba result;
        result.a = source.alpha / 32768.0f;
        if (result.a > 1e-6f) {
            result.r = (source.red   / 32768.0f) / result.a;
            result.g = (source.green / 32768.0f) / result.a;
            result.b = (source.blue  / 32768.0f) / result.a;
        } else {
            result.r = result.g = result.b = 0.0f;
        }
        
        result.r = std::max(0.0f, std::min(1.0f, result.r));
        result.g = std::max(0.0f, std::min(1.0f, result.g));
        result.b = std::max(0.0f, std::min(1.0f, result.b));
        result.a = std::max(0.0f, std::min(1.0f, result.a));
        return result;
    }
};

// ==========================================
// 32-bpc Float (ARGB 32f) Adapter Implementation
// ==========================================

class PixelReader32 : public PixelReader {
    ImageView view_;
public:
    PixelReader32(const ImageView& view) : view_(view) {}
    
    int width() const override { return view_.width; }
    int height() const override { return view_.height; }
    
    LinearRgba read(int x, int y) const override {
        x = std::max(0, std::min(view_.width - 1, x));
        y = std::max(0, std::min(view_.height - 1, y));
        
        const auto* row = reinterpret_cast<const PF_Pixel32*>(
            reinterpret_cast<const unsigned char*>(view_.data) + y * view_.rowBytes);
        const PF_Pixel32& source = row[x];
        
        LinearRgba result;
        result.a = source.alpha;
        if (result.a > 1e-6f) {
            result.r = source.red / result.a;
            result.g = source.green / result.a;
            result.b = source.blue / result.a;
        } else {
            result.r = result.g = result.b = 0.0f;
        }
        
        result.r = std::max(0.0f, std::min(1.0f, result.r));
        result.g = std::max(0.0f, std::min(1.0f, result.g));
        result.b = std::max(0.0f, std::min(1.0f, result.b));
        result.a = std::max(0.0f, std::min(1.0f, result.a));
        return result;
    }
};

class PixelWriter32 : public PixelWriter {
    ImageView view_;
public:
    PixelWriter32(const ImageView& view) : view_(view) {}
    
    int width() const override { return view_.width; }
    int height() const override { return view_.height; }
    
    void write(int x, int y, const LinearRgba& pixel) override {
        if (x < 0 || x >= view_.width || y < 0 || y >= view_.height) {
            return;
        }
        
        auto* row = reinterpret_cast<PF_Pixel32*>(
            reinterpret_cast<unsigned char*>(view_.data) + y * view_.rowBytes);
        PF_Pixel32& dest = row[x];
        
        float a = std::max(0.0f, std::min(1.0f, pixel.a));
        float r = std::max(0.0f, std::min(1.0f, pixel.r)) * a;
        float g = std::max(0.0f, std::min(1.0f, pixel.g)) * a;
        float b = std::max(0.0f, std::min(1.0f, pixel.b)) * a;
        
        dest.alpha = a;
        dest.red   = r;
        dest.green = g;
        dest.blue  = b;
    }
    
    LinearRgba read(int x, int y) const override {
        x = std::max(0, std::min(view_.width - 1, x));
        y = std::max(0, std::min(view_.height - 1, y));
        
        const auto* row = reinterpret_cast<const PF_Pixel32*>(
            reinterpret_cast<const unsigned char*>(view_.data) + y * view_.rowBytes);
        const PF_Pixel32& source = row[x];
        
        LinearRgba result;
        result.a = source.alpha;
        if (result.a > 1e-6f) {
            result.r = source.red / result.a;
            result.g = source.green / result.a;
            result.b = source.blue / result.a;
        } else {
            result.r = result.g = result.b = 0.0f;
        }
        
        result.r = std::max(0.0f, std::min(1.0f, result.r));
        result.g = std::max(0.0f, std::min(1.0f, result.g));
        result.b = std::max(0.0f, std::min(1.0f, result.b));
        result.a = std::max(0.0f, std::min(1.0f, result.a));
        return result;
    }
};

// ==========================================
// Factory Implementation
// ==========================================

std::unique_ptr<PixelReader> createReader(HostPixelFormat format, const ImageView& view) {
    if (format == HostPixelFormat::Argb8) {
        return std::make_unique<PixelReader8>(view);
    } else if (format == HostPixelFormat::Argb16) {
        return std::make_unique<PixelReader16>(view);
    } else if (format == HostPixelFormat::Argb32Float) {
        return std::make_unique<PixelReader32>(view);
    }
    return nullptr;
}

std::unique_ptr<PixelWriter> createWriter(HostPixelFormat format, const ImageView& view) {
    if (format == HostPixelFormat::Argb8) {
        return std::make_unique<PixelWriter8>(view);
    } else if (format == HostPixelFormat::Argb16) {
        return std::make_unique<PixelWriter16>(view);
    } else if (format == HostPixelFormat::Argb32Float) {
        return std::make_unique<PixelWriter32>(view);
    }
    return nullptr;
}

} // namespace ascii_character
