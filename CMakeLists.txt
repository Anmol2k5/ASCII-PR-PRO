cmake_minimum_required(VERSION 3.22)
project(ASCIICharacterAE LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Path to After Effects SDK (defaults to the workspace folder we configured)
set(AE_SDK_ROOT "${CMAKE_CURRENT_SOURCE_DIR}/AfterEffectsSDK" CACHE PATH "Path to the Adobe After Effects SDK root")

option(ASCII_CHARACTER_BUILD_PLUGIN "Build the After Effects plugin" ON)
option(ASCII_CHARACTER_BUILD_TESTS "Build host-independent render tests" ON)

# Include custom CMake modules
list(APPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/cmake")

# Shared source files
set(ASCII_CHARACTER_CORE
    plugin/src/RenderEngine.cpp
    plugin/src/CharacterSets.cpp
    plugin/src/ColorPalettes.cpp
    plugin/src/Utilities.cpp
    plugin/src/PixelAdapter.cpp
    plugin/src/GlyphAtlas.cpp
    plugin/src/GridLayout.cpp
)

if (ASCII_CHARACTER_BUILD_PLUGIN)
    # 1. Discover After Effects SDK
    include(FindAfterEffectsSDK)

    # 2. Include PiPL compiler module
    include(ConfigurePiPL)

    # 3. Compile PiPL resource
    configure_pipl(ASCIICharacter plugin/resources/ASCIICharacterPiPL.r PIPL_RC_FILE)

    # 4. Define plugin target (include source files and generated PiPL RC)
    add_library(ASCIICharacter MODULE
        plugin/src/ASCIICharacter.cpp
        plugin/src/Parameters.cpp
        ${PIPL_RC_FILE}
        ${ASCII_CHARACTER_CORE}
    )

    # 5. Set include directories (using discovered SDK headers)
    target_include_directories(ASCIICharacter PRIVATE
        plugin/include
        plugin/resources
        ${AfterEffectsSDK_INCLUDE_DIRS}
    )

    # 6. Configure preprocessor definitions and compiler flags
    target_compile_definitions(ASCIICharacter PRIVATE
        AE_OS_WIN=1
        WIN_ENV=1
        _WINDOWS=1
    )

    # Link MSVC system libraries and configuration
    if (MSVC)
        target_compile_options(ASCIICharacter PRIVATE /W4 /permissive- /EHsc)
        set_target_properties(ASCIICharacter PROPERTIES SUFFIX ".aex")
    endif()
endif()

if (ASCII_CHARACTER_BUILD_TESTS)
    enable_testing()

    add_executable(render_engine_smoke
        tests/render_engine_smoke.cpp
        ${ASCII_CHARACTER_CORE}
    )
    target_include_directories(render_engine_smoke PRIVATE plugin/include)
    target_compile_definitions(render_engine_smoke PRIVATE TESTS_NO_AE_SDK=1)
    add_test(NAME render_engine_smoke COMMAND render_engine_smoke)

    add_executable(test_pixel_adapter
        tests/unit/test_pixel_adapter.cpp
        plugin/src/PixelAdapter.cpp
    )
    target_include_directories(test_pixel_adapter PRIVATE plugin/include)
    target_compile_definitions(test_pixel_adapter PRIVATE TESTS_NO_AE_SDK=1)
    add_test(NAME test_pixel_adapter COMMAND test_pixel_adapter)

    add_executable(test_grid_layout
        tests/unit/test_grid_layout.cpp
        plugin/src/GridLayout.cpp
    )
    target_include_directories(test_grid_layout PRIVATE plugin/include)
    target_compile_definitions(test_grid_layout PRIVATE TESTS_NO_AE_SDK=1)
    add_test(NAME test_grid_layout COMMAND test_grid_layout)

    add_executable(test_color_controls
        tests/unit/test_color_controls.cpp
        plugin/src/Utilities.cpp
    )
    target_include_directories(test_color_controls PRIVATE plugin/include)
    add_test(NAME test_color_controls COMMAND test_color_controls)

    add_executable(test_performance
        tests/unit/test_performance.cpp
        ${ASCII_CHARACTER_CORE}
    )
    target_include_directories(test_performance PRIVATE plugin/include)
    target_compile_definitions(test_performance PRIVATE TESTS_NO_AE_SDK=1)
    add_test(NAME test_performance COMMAND test_performance)
endif()
