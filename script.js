// Debounce function to limit how often calculations run
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleInput(event) {
    const textarea = event.target;
    updateCounts(textarea.value);
}

const updateCounts = debounce((text) => {
    // Update character count
    document.getElementById('charCount').textContent = text.length;
    
    // Update line count
    const lines = text.split(/\r\n|\r|\n/).length;
    document.getElementById('lineCount').textContent = lines;
    
    // Count URLs
    const urls = extractUrls(text);
    document.getElementById('urlCount').textContent = urls.length;
}, 500);

function extractUrls(text) {
    // Match URLs more comprehensively
    const urlRegex = /https?:\/\/[^\s]+/g;
    return text.match(urlRegex) || [];
}

async function handleSubmit() {
    const button = document.getElementById('submitButton');
    button.disabled = true;
    button.textContent = 'Loading URLs...';

    const textarea = document.querySelector('textarea');
    const urls = extractUrls(textarea.value);
    
    if (urls.length === 0) {
        alert('No URLs found in input');
        button.disabled = false;
        button.textContent = 'Launch URLs';
        return;
    }

    const batchSize = parseInt(document.getElementById('batchSize').value, 10);
    const urlDelay = parseInt(document.getElementById('urlDelay').value, 10);
    const batchDelay = parseInt(document.getElementById('batchDelay').value, 10);
    const shouldTestPopups = document.getElementById('testPopups').checked;

    try {
        // Only test first URL if checkbox is checked
        if (shouldTestPopups) {
            const firstWindow = window.open(urls[0], '_blank', 'noopener,noreferrer');
            if (!firstWindow) {
                alert('Please enable popups for this site to use URL Loadifier.\n\nLook for a popup blocker icon in your browser\'s address bar.');
                return;
            }
            // Start from index 1 since we already opened the first URL
            urls.shift();
        }

        // Process all remaining URLs
        for (let i = 0; i < urls.length; i += batchSize) {
            const batch = urls.slice(i, Math.min(i + batchSize, urls.length));
            
            for (const url of batch) {
                window.open(url, '_blank', 'noopener,noreferrer');
                await new Promise(resolve => setTimeout(resolve, urlDelay));
            }

            if (i + batchSize < urls.length) {
                await new Promise(resolve => setTimeout(resolve, batchDelay));
            }
        }
    } catch (error) {
        console.error('Error loading URLs:', error);
    } finally {
        button.disabled = false;
        button.textContent = 'Launch URLs';
    }
}

function showHelp() {
    // Create modal elements
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4';
    
    const content = document.createElement('div');
    content.className = 'bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl';
    
    content.innerHTML = `
        <div class="space-y-4">
            <h2 class="text-xl font-bold text-gray-800">URL Loadifier Help</h2>
            
            <p>URL Loadifier helps you open multiple URLs in new tabs with controlled timing.</p>
            
            <div class="space-y-2">
                <p class="font-medium">How to use:</p>
                <ol class="list-decimal list-outside ml-6 space-y-2">
                    <li>Paste your URLs into the text area (one per line or separated by spaces)</li>
                    <li>
                        <p>Adjust the settings if needed:</p>
                        <ul class="list-disc list-outside ml-6 mt-1">
                            <li>URLs per batch: How many URLs to open before pausing</li>
                            <li>Delay between URLs: Time to wait between opening each URL</li>
                            <li>Delay between batches: Time to wait after finishing a batch, before opening the next batch</li>
                        </ul>
                    </li>
                    <li>Click "Launch URLs" to begin</li>
                </ol>
            </div>

            <p>The popup test option will open one URL first to check if your browser allows popups. For some browsers (like Chrome on iOS) you may need to disable this test.</p>
            
            <p class="text-gray-600"><strong>Note:</strong> You may need to allow popups in your browser for this tool to work.</p>
            
            <button 
                class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onclick="this.closest('.fixed').remove()"
            >
                Close
            </button>
        </div>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
} 