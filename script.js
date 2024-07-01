const apiKey = " "; // Paste your hugging face api key here
const apiEndpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2";

const recentPrompts = JSON.parse(localStorage.getItem('recentPrompts')) || [];

function updateRecentPrompts() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = recentPrompts.map(prompt => `<li>${prompt}</li>`).join('');
}

function savePromptToHistory(prompt) {
    recentPrompts.unshift(prompt);
    if (recentPrompts.length > 5) {
        recentPrompts.pop();
    }
    localStorage.setItem('recentPrompts', JSON.stringify(recentPrompts));
    updateRecentPrompts();
}

document.getElementById("generateBtn").addEventListener("click", function () {
    const promptInput = document.getElementById("prompt");
    const errorMessage = document.getElementById("error-message");
    const loadingMessage = document.getElementById("loading");
    const imageContainer = document.getElementById("image-container");
    const prompt = promptInput.value.trim();

    if (!prompt) {
        errorMessage.innerText = "Please enter a prompt.";
        return;
    }

    errorMessage.innerText = "";
    loadingMessage.style.display = "inline-block";
    imageContainer.style.display = "none";

    savePromptToHistory(prompt);

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
    };

    const data = {
        "inputs": prompt,
        "max_iterations": 100,
        "timestep_respacing": "1.0",
        "random_seed": 0,
    };

    $.ajax({
        url: apiEndpoint,
        headers: headers,
        type: "POST",
        data: JSON.stringify(data),
        xhrFields: {
            responseType: 'blob'
        },
        success: function (response) {
            const generatedImage = document.createElement("img");
            generatedImage.src = URL.createObjectURL(response);
            generatedImage.alt = "Generated Image";

            const downloadBtn = document.getElementById("downloadBtn");
            downloadBtn.style.display = "inline-block";
            downloadBtn.addEventListener("click", function () {
                const a = document.createElement("a");
                a.href = generatedImage.src;
                a.download = "generated_image.png";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });

            loadingMessage.style.display = "none";
            imageContainer.innerHTML = '';
            imageContainer.appendChild(generatedImage);
            imageContainer.style.display = "block";
            console.log("Image generated successfully!");
        },
        error: function (xhr, status, error) {
            errorMessage.innerText = "Error generating image. Please try again.";
            loadingMessage.style.display = "none";
            console.error("Error:", error);
        },
    });
});

updateRecentPrompts();
