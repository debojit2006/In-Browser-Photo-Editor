// This C++ code would be compiled to WebAssembly (Wasm)
// for high-performance image filtering in the browser.
#include <emscripten/emscripten.h>
#include <vector>
#include <algorithm> // For std::min and std::max

// This tells the C++ compiler to make functions linkable from C,
// which is necessary for WebAssembly to find them.
extern "C" {

// EMSCRIPTEN_KEEPALIVE prevents the compiler from optimizing away 
// this function, ensuring it's available to be called from JS.
EMSCRIPTEN_KEEPALIVE
void apply_grayscale(unsigned char *data, int len) {
    for (int i = 0; i < len; i += 4) {
        // A common luminance-preserving formula for grayscale
        int luma = (data[i] * 0.299) + (data[i + 1] * 0.587) + (data[i + 2] * 0.114);
        data[i]     = luma; // Red
        data[i + 1] = luma; // Green
        data[i + 2] = luma; // Blue
        // Alpha channel (data[i + 3]) is left unchanged
    }
}

EMSCRIPTEN_KEEPALIVE
void apply_brightness(unsigned char *data, int len, int brightness) {
    for (int i = 0; i < len; i += 4) {
        // Add brightness value and clamp between 0 and 255
        data[i]   = std::min(255, std::max(0, data[i] + brightness));
        data[i+1] = std::min(255, std::max(0, data[i+1] + brightness));
        data[i+2] = std::min(255, std::max(0, data[i+2] + brightness));
    }
}

} // extern "C"
