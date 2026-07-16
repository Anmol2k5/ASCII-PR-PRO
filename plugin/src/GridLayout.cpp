#include "GridLayout.h"
#include <algorithm>
#include <cmath>

namespace ascii_character {

GridLayout::GridLayout(int imageW, int imageH, const RenderSettings& settings)
    : imageW_(imageW)
    , imageH_(imageH)
{
    // 1. Calculate columns and rows based on pixelDensity and spacing
    cols_ = std::max(4, settings.pixelDensity);
    
    // Clamp cell width and height to minimum 2.0f
    cellW_ = static_cast<float>(imageW_) / cols_;
    cellW_ = std::max(2.0f, cellW_);
    
    cellH_ = cellW_ / std::max(0.1f, settings.cellAspectRatio);
    cellH_ = std::max(2.0f, cellH_);

    // Clamp step values to minimum 1.0f
    stepX_ = cellW_ * settings.spacingX;
    stepX_ = std::max(1.0f, stepX_);
    
    stepY_ = cellH_ * settings.spacingY;
    stepY_ = std::max(1.0f, stepY_);

    // Determine how many rows will fit vertically
    rows_ = static_cast<int>((imageH_ - cellH_) / stepY_) + 1;
    rows_ = std::max(1, rows_);

    // 2. Calculate total grid bounds
    float totalGridW = (cols_ - 1) * stepX_ + cellW_;
    float totalGridH = (rows_ - 1) * stepY_ + cellH_;

    // 3. Compute starting offset based on alignment
    switch (settings.horizontalAlign) {
    case GridAlignHorizontal::Left:
        startX_ = 0.0f;
        break;
    case GridAlignHorizontal::Right:
        startX_ = imageW_ - totalGridW;
        break;
    case GridAlignHorizontal::Center:
    default:
        startX_ = (imageW_ - totalGridW) / 2.0f;
        break;
    }

    switch (settings.verticalAlign) {
    case GridAlignVertical::Top:
        startY_ = 0.0f;
        break;
    case GridAlignVertical::Bottom:
        startY_ = imageH_ - totalGridH;
        break;
    case GridAlignVertical::Center:
    default:
        startY_ = (imageH_ - totalGridH) / 2.0f;
        break;
    }

    // Apply manual offset parameter
    startX_ += settings.offsetX;
    startY_ += settings.offsetY;
}

GridCell GridLayout::cell(int col, int row) const {
    GridCell c;
    c.col = col;
    c.row = row;
    
    float x = startX_ + col * stepX_;
    float y = startY_ + row * stepY_;
    
    c.cellW = cellW_;
    c.cellH = cellH_;
    c.centerX = x + cellW_ / 2.0f;
    c.centerY = y + cellH_ / 2.0f;
    
    // Relaxed active check to support rotated cells
    c.active = (x < imageW_ + 1000 && x + cellW_ > -1000 && y < imageH_ + 1000 && y + cellH_ > -1000);
    return c;
}

} // namespace ascii_character
