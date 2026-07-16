# ConfigurePiPL.cmake
# Function to compile After Effects PiPL (.r) resources on Windows using relative paths to avoid space-in-path errors

function(configure_pipl TARGET_NAME PIPL_R_FILE OUTPUT_RC_VAR)
    if(NOT WIN32)
        message(FATAL_ERROR "ConfigurePiPL is only supported on Windows.")
    endif()

    get_filename_component(PIPL_R_ABS "${PIPL_R_FILE}" ABSOLUTE)
    get_filename_component(PIPL_NAME "${PIPL_R_FILE}" NAME_WE)

    set(PIPL_RR "${CMAKE_CURRENT_BINARY_DIR}/${PIPL_NAME}.rr")
    set(PIPL_RRC "${CMAKE_CURRENT_BINARY_DIR}/${PIPL_NAME}.rrc")
    set(PIPL_RC "${CMAKE_CURRENT_BINARY_DIR}/${PIPL_NAME}.rc")

    # Step 1: Preprocess the .r file using cl.exe (uses absolute path for source file, which cl.exe handles fine)
    add_custom_command(
        OUTPUT "${PIPL_RR}"
        WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
        COMMAND cl.exe /I "${AE_SDK_ROOT}/Examples/Headers" /EP "${PIPL_R_ABS}" > "${PIPL_NAME}.rr"
        DEPENDS "${PIPL_R_ABS}"
        COMMENT "Preprocessing PiPL resource: ${PIPL_R_FILE}"
        VERBATIM
    )

    # Step 2: Run PiPLtool.exe using relative paths to prevent legacy parsing errors with spaces
    add_custom_command(
        OUTPUT "${PIPL_RRC}"
        WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
        COMMAND "${AfterEffectsSDK_PIPLTOOL}" "${PIPL_NAME}.rr" "${PIPL_NAME}.rrc"
        DEPENDS "${PIPL_RR}"
        COMMENT "Compiling PiPL resource definitions using PiPLtool: ${PIPL_NAME}.rr"
        VERBATIM
    )

    # Step 3: Run cl.exe preprocessor to generate the final RC resource file using relative paths
    add_custom_command(
        OUTPUT "${PIPL_RC}"
        WORKING_DIRECTORY "${CMAKE_CURRENT_BINARY_DIR}"
        COMMAND cl.exe /D "MSWindows" /EP "${PIPL_NAME}.rrc" > "${PIPL_NAME}.rc"
        DEPENDS "${PIPL_RRC}"
        COMMENT "Generating final RC resource file: ${PIPL_NAME}.rc"
        VERBATIM
    )

    # Return the generated RC file path
    set(${OUTPUT_RC_VAR} "${PIPL_RC}" PARENT_SCOPE)
endfunction()
