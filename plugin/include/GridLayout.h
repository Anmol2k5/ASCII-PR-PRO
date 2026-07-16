#pragma once

#include "RenderTypes.h"
#include "RenderEngine.h"

namespace ascii_character {

struct GridCell {
    int col = 0;
    int row = 0;
    float centerX = 0.0f;
    float centerY = 0.0f;
    float cellW = 0.0f;
    float cellH = 0.0f;
    bool active = true;
};

class GridLayout {
public:
    GridLayout(int imageW, int imageH, const RenderSettings& settings);
    int columns() const { return cols_; }
    int rows() const { return rows_; }
    GridCell cell(int col, int row) const;
private:
    int imageW_;
    int imageH_;
    int cols_;
    int rows_;
    float cellW_;
    float cellH_;
    float stepX_;
    float stepY_;
    float startX_;
    float startY_;
};

} // namespace ascii_character
