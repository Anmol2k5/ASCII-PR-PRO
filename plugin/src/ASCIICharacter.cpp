#include "ASCIICharacter.h"
#include "CharacterSets.h"
#include "ColorPalettes.h"
#include "Parameters.h"
#include "RenderEngine.h"

#include "AEConfig.h"
#include "entry.h"
#include "AE_Effect.h"
#include "AE_EffectCB.h"
#include "AE_EffectCBSuites.h"
#include "AE_Macros.h"
#include "Param_Utils.h"


using namespace ascii_character;

static PF_Err about(PF_InData* in_data, PF_OutData* out_data) {
    PF_SPRINTF(out_data->return_msg,
        "%s v%d.%d - native luminance-to-ASCII renderer. Development build.",
        ASCII_CHARACTER_PLUGIN_NAME,
        ASCII_CHARACTER_MAJOR_VERSION,
        ASCII_CHARACTER_MINOR_VERSION);
    return PF_Err_NONE;
}

static PF_Err globalSetup(PF_InData* in_data, PF_OutData* out_data) {
    out_data->my_version = PF_VERSION(
        ASCII_CHARACTER_MAJOR_VERSION,
        ASCII_CHARACTER_MINOR_VERSION,
        ASCII_CHARACTER_BUG_VERSION,
        ASCII_CHARACTER_STAGE,
        ASCII_CHARACTER_BUILD_VERSION);
    out_data->out_flags = 0;
    out_data->out_flags2 = 0;
    return PF_Err_NONE;
}

static PF_Err paramsSetup(PF_InData* in_data, PF_OutData* out_data) {
    PF_Err err = PF_Err_NONE;
    PF_ParamDef def;

    AEFX_CLR_STRUCT(def);
    PF_ADD_SLIDER("Pixel Density", 4, 300, 4, 300, 90, PARAM_PIXEL_DENSITY);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Cell Aspect Ratio", 10, 300, 10, 300, 55, PF_Precision_HUNDREDTHS, 0, 0, PARAM_CELL_ASPECT);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Character Scale", 10, 200, 10, 200, 92, PF_Precision_HUNDREDTHS, 0, 0, PARAM_CHARACTER_SCALE);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Character Spacing X", 25, 250, 25, 250, 100, PF_Precision_HUNDREDTHS, 0, 0, PARAM_SPACING_X);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Character Spacing Y", 25, 250, 25, 250, 100, PF_Precision_HUNDREDTHS, 0, 0, PARAM_SPACING_Y);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Blend With Original", 0, 100, 0, 100, 0, PF_Precision_HUNDREDTHS, 0, 0, PARAM_BLEND_ORIGINAL);
    AEFX_CLR_STRUCT(def);
    PF_ADD_CHECKBOX("Preserve Source Alpha", "On", TRUE, 0, PARAM_PRESERVE_ALPHA);
    AEFX_CLR_STRUCT(def);
    PF_ADD_CHECKBOX("Invert Luminance", "On", FALSE, 0, PARAM_INVERT_LUMINANCE);

    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Contrast", 0, 300, 0, 300, 100, PF_Precision_HUNDREDTHS, 0, 0, PARAM_CONTRAST);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Brightness", -100, 100, -100, 100, 0, PF_Precision_HUNDREDTHS, 0, 0, PARAM_BRIGHTNESS);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Gamma", 10, 400, 10, 400, 100, PF_Precision_HUNDREDTHS, 0, 0, PARAM_GAMMA);
    AEFX_CLR_STRUCT(def);
    PF_ADD_SLIDER("Threshold", 0, 255, 0, 255, 0, PARAM_THRESHOLD);
    AEFX_CLR_STRUCT(def);
    PF_ADD_SLIDER("Posterize Levels", 0, 32, 0, 32, 0, PARAM_POSTERIZE);

    AEFX_CLR_STRUCT(def);
    PF_ADD_POPUP("Character Set", 7, 1, "Classic|Dense|Minimal|Blocks|Binary|Editorial|Fine Dots", PARAM_CHARACTER_SET);
    AEFX_CLR_STRUCT(def);
    PF_ADD_POPUP("Character Order", 2, 1, "Dark to Light|Light to Dark", PARAM_CHARACTER_ORDER);

    AEFX_CLR_STRUCT(def);
    PF_ADD_POPUP("Colour Mode", 5, 2, "Original Source Colour|Monochrome|Two Tone|Gradient|Custom Foreground/Background", PARAM_COLOR_MODE);
    AEFX_CLR_STRUCT(def);
    PF_ADD_COLOR("Foreground Colour", 255, 255, 255, PARAM_FOREGROUND);
    AEFX_CLR_STRUCT(def);
    PF_ADD_COLOR("Background Colour", 0, 0, 0, PARAM_BACKGROUND);
    AEFX_CLR_STRUCT(def);
    PF_ADD_COLOR("Gradient Start Colour", 30, 255, 110, PARAM_GRADIENT_START);
    AEFX_CLR_STRUCT(def);
    PF_ADD_COLOR("Gradient End Colour", 255, 255, 255, PARAM_GRADIENT_END);
    AEFX_CLR_STRUCT(def);
    PF_ADD_ANGLE("Hue Shift", 0, PARAM_HUE_SHIFT);
    AEFX_CLR_STRUCT(def);
    PF_ADD_FLOAT_SLIDERX("Saturation", 0, 300, 0, 300, 100, PF_Precision_HUNDREDTHS, 0, 0, PARAM_SATURATION);

    AEFX_CLR_STRUCT(def);
    PF_ADD_POPUP("Horizontal Alignment", 3, 2, "Left|Center|Right", PARAM_HORIZONTAL_ALIGN);
    AEFX_CLR_STRUCT(def);
    PF_ADD_POPUP("Vertical Alignment", 3, 2, "Top|Center|Bottom", PARAM_VERTICAL_ALIGN);
    AEFX_CLR_STRUCT(def);
    PF_ADD_SLIDER("Offset X", -2000, 2000, -2000, 2000, 0, PARAM_OFFSET_X);
    AEFX_CLR_STRUCT(def);
    PF_ADD_SLIDER("Offset Y", -2000, 2000, -2000, 2000, 0, PARAM_OFFSET_Y);
    AEFX_CLR_STRUCT(def);
    PF_ADD_ANGLE("Rotation", 0, PARAM_ROTATION);
    AEFX_CLR_STRUCT(def);
    PF_ADD_POPUP("Quality", 3, 2, "Draft|Normal|High", PARAM_QUALITY);
    AEFX_CLR_STRUCT(def);
    PF_ADD_CHECKBOX("Anti-aliasing", "On", TRUE, 0, PARAM_ANTIALIAS);
    AEFX_CLR_STRUCT(def);
    PF_ADD_SLIDER("Render Only Every Nth Cell", 1, 32, 1, 32, 1, PARAM_NTH_CELL);

    out_data->num_params = PARAM_COUNT;
    return err;
}

static Pixel8 colorFromParam(const PF_ParamDef& param) {
    return {
        static_cast<uint8_t>(param.u.cd.value.red),
        static_cast<uint8_t>(param.u.cd.value.green),
        static_cast<uint8_t>(param.u.cd.value.blue),
        255
    };
}

static RenderSettings settingsFromParams(PF_ParamDef* params[]) {
    RenderSettings s;
    s.pixelDensity = params[PARAM_PIXEL_DENSITY]->u.sd.value;
    s.cellAspectRatio = params[PARAM_CELL_ASPECT]->u.fs_d.value / 100.0f;
    s.characterScale = params[PARAM_CHARACTER_SCALE]->u.fs_d.value / 100.0f;
    s.spacingX = params[PARAM_SPACING_X]->u.fs_d.value / 100.0f;
    s.spacingY = params[PARAM_SPACING_Y]->u.fs_d.value / 100.0f;
    s.blendWithOriginal = params[PARAM_BLEND_ORIGINAL]->u.fs_d.value / 100.0f;
    s.preserveSourceAlpha = params[PARAM_PRESERVE_ALPHA]->u.bd.value != 0;
    s.invertLuminance = params[PARAM_INVERT_LUMINANCE]->u.bd.value != 0;
    s.contrast = params[PARAM_CONTRAST]->u.fs_d.value / 100.0f;
    s.brightness = params[PARAM_BRIGHTNESS]->u.fs_d.value / 100.0f;
    s.gamma = params[PARAM_GAMMA]->u.fs_d.value / 100.0f;
    s.threshold = params[PARAM_THRESHOLD]->u.sd.value;
    s.posterizeLevels = params[PARAM_POSTERIZE]->u.sd.value;
    s.characterSet = characterSetByIndex(params[PARAM_CHARACTER_SET]->u.pd.value, "");
    s.order = params[PARAM_CHARACTER_ORDER]->u.pd.value == 1 ? CharacterOrder::DarkToLight : CharacterOrder::LightToDark;
    s.colorMode = static_cast<ColorMode>(params[PARAM_COLOR_MODE]->u.pd.value - 1);
    s.foreground = colorFromParam(*params[PARAM_FOREGROUND]);
    s.background = colorFromParam(*params[PARAM_BACKGROUND]);
    s.gradientStart = colorFromParam(*params[PARAM_GRADIENT_START]);
    s.gradientEnd = colorFromParam(*params[PARAM_GRADIENT_END]);
    s.saturation = params[PARAM_SATURATION]->u.fs_d.value / 100.0f;
    s.offsetX = params[PARAM_OFFSET_X]->u.sd.value;
    s.offsetY = params[PARAM_OFFSET_Y]->u.sd.value;
    s.quality = static_cast<Quality>(params[PARAM_QUALITY]->u.pd.value - 1);
    s.antiAlias = params[PARAM_ANTIALIAS]->u.bd.value != 0;
    s.renderEveryNthCell = params[PARAM_NTH_CELL]->u.sd.value;
    return s;
}

static PF_Err render(PF_InData*, PF_OutData*, PF_ParamDef* params[], PF_LayerDef* output) {
    const PF_LayerDef* input = &params[PARAM_INPUT]->u.ld;
    RenderSettings settings = settingsFromParams(params);
    RenderEngine engine;

    Image8 inImage {
        input->width,
        input->height,
        input->rowbytes,
        reinterpret_cast<Pixel8*>(input->data)
    };
    Image8 outImage {
        output->width,
        output->height,
        output->rowbytes,
        reinterpret_cast<Pixel8*>(output->data)
    };

    engine.render8(inImage, outImage, settings);
    return PF_Err_NONE;
}

extern "C" DllExport PF_Err EffectMain(
    PF_Cmd cmd,
    PF_InData* in_data,
    PF_OutData* out_data,
    PF_ParamDef* params[],
    PF_LayerDef* output,
    void*) {
    try {
        switch (cmd) {
        case PF_Cmd_ABOUT:
            return about(in_data, out_data);
        case PF_Cmd_GLOBAL_SETUP:
            return globalSetup(in_data, out_data);
        case PF_Cmd_PARAMS_SETUP:
            return paramsSetup(in_data, out_data);
        case PF_Cmd_RENDER:
            return render(in_data, out_data, params, output);
        default:
            return PF_Err_NONE;
        }
    } catch (...) {
        return PF_Err_INTERNAL_STRUCT_DAMAGED;
    }
}
