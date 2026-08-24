const textarea = document.getElementById("inputText");

// ===============================
// CASE CONVERSION
// ===============================

function convertCase(event, type) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // No text selected
    if (start === end) {
        alert("Please select the text you want to convert.");
        textarea.focus();
        return;
    }

    const selectedText = textarea.value.substring(start, end);
    let convertedText = "";

    switch (type) {
        case "upper":
            convertedText = selectedText.toUpperCase();
            break;

        case "lower":
            convertedText = selectedText.toLowerCase();
            break;

        case "capitalized":
            convertedText = selectedText
                .toLowerCase()
                .replace(/\b\w/g, char => char.toUpperCase());
            break;

        case "title":
            convertedText = selectedText
                .toLowerCase()
                .replace(/\b\w/g, char => char.toUpperCase());
            break;

        case "sentence":
            convertedText = selectedText
                .toLowerCase()
                .replace(/(^\s*\w|[.!?]\s+\w)/g, char =>
                    char.toUpperCase()
                );
            break;

        case "inverse":
            convertedText = [...selectedText]
                .map(char => {
                    if (char >= "a" && char <= "z") {
                        return char.toUpperCase();
                    }

                    if (char >= "A" && char <= "Z") {
                        return char.toLowerCase();
                    }

                    return char;
                })
                .join("");
            break;

        case "alternate":
            let index = 0;

            convertedText = [...selectedText]
                .map(char => {
                    // Don't count spaces/punctuation
                    if (!/[a-zA-Z]/.test(char)) {
                        return char;
                    }

                    const result =
                        index % 2 === 0
                            ? char.toLowerCase()
                            : char.toUpperCase();

                    index++;
                    return result;
                })
                .join("");
            break;

        default:
            convertedText = selectedText;
    }

    // Replace ONLY the selected text
    textarea.setRangeText(
        convertedText,
        start,
        end,
        "select"
    );

    // Keep textarea focused
    textarea.focus();

    updateStats();

    // Highlight the clicked button
    document.querySelectorAll(".case-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add("active");
    }
}


// ===============================
// STATISTICS
// ===============================

function updateStats() {
    const text = textarea.value;

    // Characters
    const characters = text.length;

    // Words
    const words = text.trim()
        ? text.trim().split(/\s+/).length
        : 0;

    // Paragraphs
    const paragraphs = text.trim()
        ? text.trim().split(/\n\s*\n/).length
        : 0;

    // Sentences
    const sentences = text.trim()
        ? text
            .split(/[.!?]+/)
            .filter(sentence => sentence.trim().length > 0)
            .length
        : 0;

    document.getElementById("charCount").textContent = characters;
    document.getElementById("wordCount").textContent = words;
    document.getElementById("paragraphCount").textContent = paragraphs;
    document.getElementById("sentenceCount").textContent = sentences;
}


// Update statistics while typing
textarea.addEventListener("input", updateStats);

// Initial statistics
updateStats();


// ===============================
// COPY TO CLIPBOARD
// ===============================

function copyToClipboard() {
    const text = textarea.value;

    if (!text.trim()) {
        alert("There is no text to copy.");
        return;
    }

    navigator.clipboard.writeText(text)
        .then(() => {
            const button = document.querySelector(".copy-btn");
            const originalText = button.textContent;

            button.textContent = "Copied!";

            setTimeout(() => {
                button.textContent = originalText;
            }, 1500);
        })
        .catch(() => {
            // Fallback for older browsers
            textarea.select();
            document.execCommand("copy");

            alert("Text copied to clipboard.");
        });
}


// ===============================
// CLEAR TEXT
// ===============================

function clearText() {
    textarea.value = "";

    document.querySelectorAll(".case-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    updateStats();
    textarea.focus();
}


// ===============================
// DOWNLOAD PDF
// ===============================

function downloadPDF() {
    const text = textarea.value;

    if (!text.trim()) {
        alert("Please enter some text first.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    const lines = pdf.splitTextToSize(text, maxWidth);

    let y = margin;

    lines.forEach(line => {
        if (y > 280) {
            pdf.addPage();
            y = margin;
        }

        pdf.text(line, margin, y);
        y += 7;
    });

    pdf.save("converted-text.pdf");
}


// ===============================
// DOWNLOAD WORD
// ===============================

function downloadWord() {
    const text = textarea.value;

    if (!text.trim()) {
        alert("Please enter some text first.");
        return;
    }

    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Converted Text</title>
        </head>
        <body>
            ${escapeHTML(text).replace(/\n/g, "<br>")}
        </body>
        </html>
    `;

    const blob = new Blob(
        [content],
        { type: "application/msword" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "converted-text.doc";
    link.click();

    URL.revokeObjectURL(url);
}


// ===============================
// HTML ESCAPE
// ===============================

function escapeHTML(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}