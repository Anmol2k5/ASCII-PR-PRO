# FindAfterEffectsSDK.cmake
# Finds and validates the Adobe After Effects SDK

if(NOT AE_SDK_ROOT)
    set(AE_SDK_ROOT "$ENV{AE_SDK_ROOT}" CACHE PATH "Path to the Adobe After Effects SDK root")
endif()

if(NOT AE_SDK_ROOT)
    message(FATAL_ERROR "AE_SDK_ROOT is not set. Please set the AE_SDK_ROOT CMake variable or environment variable.")
endif()

# Normalize path
file(TO_CMAKE_PATH "${AE_SDK_ROOT}" AE_SDK_ROOT)

# Validate expected paths
set(AE_SDK_REQUIRED_HEADERS
    "${AE_SDK_ROOT}/Examples/Headers/AEConfig.h"
    "${AE_SDK_ROOT}/Examples/Headers/AE_Effect.h"
    "${AE_SDK_ROOT}/Examples/Util/entry.h"
)

foreach(HEADER IN LISTS AE_SDK_REQUIRED_HEADERS)
    if(NOT EXISTS "${HEADER}")
        message(FATAL_ERROR "AE_SDK_ROOT is invalid. Expected header not found: ${HEADER}")
    endif()
endforeach()

if(NOT EXISTS "${AE_SDK_ROOT}/Examples/Util/AEFX_SuiteHelper.h")
    message(FATAL_ERROR "AE_SDK_ROOT is invalid. Expected Examples/Util/AEFX_SuiteHelper.h under: ${AE_SDK_ROOT}")
endif()

# Set output variables
set(AfterEffectsSDK_FOUND TRUE)
set(AfterEffectsSDK_INCLUDE_DIRS
    "${AE_SDK_ROOT}/Examples/Headers"
    "${AE_SDK_ROOT}/Examples/Headers/SP"
    "${AE_SDK_ROOT}/Examples/Util"
)
set(AfterEffectsSDK_PIPLTOOL "${AE_SDK_ROOT}/Examples/Resources/PiPLtool.exe")

message(STATUS "Found After Effects SDK: ${AE_SDK_ROOT}")
