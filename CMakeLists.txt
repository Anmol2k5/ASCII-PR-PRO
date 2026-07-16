cmake_minimum_required(VERSION 3.22)
project(ASCIICharacterAE LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(AE_SDK_ROOT "" CACHE PATH "Path to the Adobe After Effects SDK root")
option(ASCII_CHARACTER_BUILD_PLUGIN "Build the After Effects plugin" ON)
option(ASCII_CHARACTER_BUILD_TESTS "Build host-independent render tests" OFF)

set(ASCII_CHARACTER_CORE
    src/plugin/RenderEngine.cpp
    src/plugin/CharacterSets.cpp
    src/plugin/ColorPalettes.cpp
    src/plugin/Utilities.cpp
)

if (ASCII_CHARACTER_BUILD_PLUGIN)
    add_library(ASCIICharacter MODULE
        src/plugin/ASCIICharacter.cpp
        src/plugin/Parameters.cpp
        ${ASCII_CHARACTER_CORE}
    )

    target_include_directories(ASCIICharacter PRIVATE
        src/plugin
        "${AE_SDK_ROOT}/Examples/Headers"
        "${AE_SDK_ROOT}/Examples/Util"
    )

    target_compile_definitions(ASCIICharacter PRIVATE
        AE_OS_WIN=1
        WIN_ENV=1
        _WINDOWS=1
    )

    if (MSVC)
        target_compile_options(ASCIICharacter PRIVATE /W4 /permissive- /EHsc)
        set_target_properties(ASCIICharacter PROPERTIES SUFFIX ".aex")
    endif()
endif()

if (ASCII_CHARACTER_BUILD_TESTS)
    add_executable(render_engine_smoke
        tests/render_engine_smoke.cpp
        ${ASCII_CHARACTER_CORE}
    )
    target_include_directories(render_engine_smoke PRIVATE src/plugin)
endif()
