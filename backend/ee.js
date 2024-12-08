const fs = require("fs");
const { createPlayfairMatrix } = require("./te.js");

// Function to find the position of a character in the matrix
function findPosition(matrix, char) {
  const index = matrix.indexOf(char);
  return [Math.floor(index / 5), index % 5];
}

// Function to decrypt the text using the Playfair cipher
function decryptPlayfair(matrix, text) {
  let decryptedText = "";

  for (let i = 0; i < text.length; i += 2) {
    const char1 = text[i];
    const char2 = text[i + 1] || "X"; // If there's an odd number of characters, add 'X'

    const [row1, col1] = findPosition(matrix, char1);
    const [row2, col2] = findPosition(matrix, char2);

    if (row1 === row2) {
      decryptedText += matrix[row1 * 5 + ((col1 - 1 + 5) % 5)];
      decryptedText += matrix[row2 * 5 + ((col2 - 1 + 5) % 5)];
    } else if (col1 === col2) {
      decryptedText += matrix[((row1 - 1 + 5) % 5) * 5 + col1];
      decryptedText += matrix[((row2 - 1 + 5) % 5) * 5 + col2];
    } else {
      decryptedText += matrix[row1 * 5 + col2];
      decryptedText += matrix[row2 * 5 + col1];
    }
  }

  return decryptedText;
}

// Function to decrypt the text, including restoring non-alphabetic characters
function decryptWithPlaceholders(key, encryptedText, nonAlphaMap) {
  // Create the Playfair matrix
  const matrix = createPlayfairMatrix(key);

  // Decrypt the encrypted text
  const decryptedText = decryptPlayfair(matrix, encryptedText);

  // Restore non-alphabetic characters
  let finalDecryptedText = decryptedText
    .split("")
    .map((char, idx) => {
      const nonAlpha = nonAlphaMap.find((item) => item.index === idx);
      if (nonAlpha) {
        return nonAlpha.char; // Restore the original non-alphabetic character
      }
      return char;
    })
    .join("");

  // Capitalize only the first letter of the entire text and lowercase the rest
  finalDecryptedText =
    finalDecryptedText.charAt(0).toUpperCase() +
    finalDecryptedText.slice(1).toLowerCase();

  return finalDecryptedText;
}

// Read the encrypted data from enc.json
const encryptedData = JSON.parse(fs.readFileSync("enc.json", "utf8"));
const { encrypted, nonAlphaMap } = encryptedData;

// Example key
const key = "HELLO";

// Decrypt the text from enc.json
const decryptedText = decryptWithPlaceholders(key, encrypted, nonAlphaMap);
console.log("Decrypted:", decryptedText);
