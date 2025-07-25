// --- This block represents script.js ---
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Icon Replacement (from Lucide icons library) ---
    lucide.createIcons();

    // --- DOM Element References ---
    const uploadInput = document.getElementById('upload');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const controlsPanel = document.getElementById('controls');
    const resetButton = document.getElementById('resetButton');
    const saveButton = document.getElementById('saveButton');
    const canvasPlaceholder = document.getElementById('canvas-placeholder');
    const canvasContainer = document.querySelector('.canvas-container');
    const placeholderIcon = canvasPlaceholder.querySelector('i');
    const placeholderText = canvasPlaceholder.querySelector('p');

    // --- Application State ---
    let originalImageData = null;
    let originalImage = new Image();
    
    // Defines the filters, their ranges, and default values
    const filters = {
        brightness: { label: 'Brightness', value: 0, min: -100, max: 100, unit: '' },
        contrast: { label: 'Contrast', value: 0, min: -100, max: 100, unit: '' },
        grayscale: { label: 'Grayscale', value: 0, min: 0, max: 100, unit: '%' },
        sepia: { label: 'Sepia', value: 0, min: 0, max: 100, unit: '%' }
    };

    // --- Initialization ---
    function init() {
        setupControls();
        addEventListeners();
    }

    // --- Event Listeners Setup ---
    function addEventListeners() {
        uploadInput.addEventListener('change', handleImageUpload);
        resetButton.addEventListener('click', resetAllFilters);
        saveButton.addEventListener('click', saveImage);
    }
    
    // --- UI Feedback Functions ---
    function showLoadingState(message) {
        placeholderIcon.setAttribute('data-lucide', 'loader-circle');
        lucide.createIcons(); // Re-render icons
        placeholderText.textContent = message;
        canvasPlaceholder.classList.remove('hidden');
        canvasContainer.classList.add('hidden');
    }

    function showErrorState(message) {
        placeholderIcon.setAttribute('data-lucide', 'alert-triangle');
        lucide.createIcons();
        placeholderText.textContent = message;
        alert(message); // Also show a system alert for clarity
    }

    // --- Image Handling (UPDATED with better feedback and error handling) ---
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // --- Step 1: Provide immediate feedback ---
        showLoadingState('Reading file...');

        const reader = new FileReader();

        // --- Step 2: Handle potential file reading errors ---
        reader.onerror = () => {
            showErrorState('Error: Could not read the selected file.');
        };

        reader.onload = (event) => {
            showLoadingState('Decoding image...');
            
            // --- Step 3: Handle potential image loading errors ---
            originalImage.onerror = () => {
                showErrorState('Error: The selected file is not a valid or supported image format.');
            };

            originalImage.onload = () => {
                try {
                    // Set canvas size to match image
                    canvas.width = originalImage.width;
                    canvas.height = originalImage.height;
                    
                    // Draw image and store its original pixel data
                    ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);
                    originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    // --- Step 4: Show the canvas and hide the placeholder ---
                    canvasPlaceholder.classList.add('hidden');
                    canvasContainer.classList.remove('hidden');

                    resetAllFilters(); // Apply default filter values
                } catch (err) {
                    console.error("Canvas drawing error:", err);
                    showErrorState('An unexpected error occurred while displaying the image.');
                }
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    // --- Controls and Filters ---
    function setupControls() {
        controlsPanel.innerHTML = ''; // Clear initial "upload an image" message
        for (const key in filters) {
            const filter = filters[key];
            const controlHTML = `
                <div class="space-y-2">
                    <label for="${key}" class="font-medium flex justify-between">
                        <span>${filter.label}</span>
                        <span id="${key}-value">${filter.value}${filter.unit}</span>
                    </label>
                    <input
                        type="range"
                        id="${key}"
                        min="${filter.min}"
                        max="${filter.max}"
                        value="${filter.value}"
                        data-filter="${key}"
                        class="w-full"
                        disabled 
                    >
                </div>
            `;
            controlsPanel.innerHTML += controlHTML;
        }
    }

    function resetAllFilters() {
        if (!originalImageData) return;

        for (const key in filters) {
            // Reset filter values to defaults
            if (key === 'brightness' || key === 'contrast') filters[key].value = 0;
            else filters[key].value = 0;
            
            // Update UI sliders and value displays
            const slider = document.getElementById(key);
            if (slider) {
                slider.value = filters[key].value;
                slider.disabled = false; // Enable the slider
                document.getElementById(`${key}-value`).textContent = `${filters[key].value}${filters[key].unit}`;
            }
        }
        applyAllFilters();
    }

    // --- Main Filter Application Logic (Simulating C++/Wasm) ---
    function applyAllFilters() {
        if (!originalImageData) return;

        const data = new Uint8ClampedArray(originalImageData.data);
        const len = data.length;

        const brightness = filters.brightness.value;
        const contrast = filters.contrast.value;
        const grayscale = filters.grayscale.value / 100;
        const sepia = filters.sepia.value / 100;
        
        const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));

        for (let i = 0; i < len; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];

            // 1. Apply Brightness
            r += brightness;
            g += brightness;
            b += brightness;

            // 2. Apply Contrast
            r = contrastFactor * (r - 128) + 128;
            g = contrastFactor * (g - 128) + 128;
            b = contrastFactor * (b - 128) + 128;

            // 3. Apply Sepia
            if (sepia > 0) {
                const sr = r * (1 - 0.607 * sepia) + g * (0.769 * sepia) + b * (0.189 * sepia);
                const sg = r * (0.349 * sepia) + g * (1 - 0.314 * sepia) + b * (0.168 * sepia);
                const sb = r * (0.272 * sepia) + g * (0.534 * sepia) + b * (1 - 0.869 * sepia);
                r = sr; g = sg; b = sb;
            }

            // 4. Apply Grayscale
            if (grayscale > 0) {
                const avg = 0.299 * r + 0.587 * g + 0.114 * b;
                r = r * (1 - grayscale) + avg * grayscale;
                g = g * (1 - grayscale) + avg * grayscale;
                b = b * (1 - grayscale) + avg * grayscale;
            }
            
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }

        ctx.putImageData(new ImageData(data, canvas.width, canvas.height), 0, 0);
    }
    
    // --- Save Functionality ---
    function saveImage() {
        if (!originalImageData) {
            alert("Please upload an image first.");
            return;
        }
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // --- Run the application ---
    init();
});
