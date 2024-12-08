const fs = require("fs");

// Function to create the Playfair matrix
function createPlayfairMatrix(key) {
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // 'J' is typically omitted in Playfair cipher
  let matrix = [];
  let usedChars = new Set();

  // Add key characters to the matrix
  for (let char of key.toUpperCase()) {
    if (alphabet.includes(char) && !usedChars.has(char)) {
      matrix.push(char);
      usedChars.add(char);
    }
  }

  // Add remaining alphabet characters
  for (let char of alphabet) {
    if (!usedChars.has(char)) {
      matrix.push(char);
    }
  }

  return matrix;
}

// Function to prepare text for encryption (replace non-alphabetic characters with placeholders)
function prepareTextForEncryption(text) {
  const placeholders = ["X", "Y", "Z", "W", "V"];
  let placeholderIndex = 0;

  return text
    .split("")
    .map((char, idx) => {
      if (/[^A-Za-z]/.test(char)) {
        const placeholder =
          placeholders[placeholderIndex % placeholders.length];
        placeholderIndex++;
        return placeholder; // Replace non-alphabetic characters with placeholders
      }
      return char.toUpperCase(); // Ensure all characters are uppercase
    })
    .join("");
}

// Function to find the position of a character in the matrix
function findPosition(matrix, char) {
  const index = matrix.indexOf(char);
  if (index === -1) {
    throw new Error(`Character ${char} not found in matrix`);
  }
  return [Math.floor(index / 5), index % 5];
}

// Function to encrypt the text using the Playfair cipher
function encryptPlayfair(matrix, text) {
  let encryptedText = "";

  for (let i = 0; i < text.length; i += 2) {
    const char1 = text[i];
    const char2 = text[i + 1] || "X"; // If there's an odd number of characters, add 'X'

    const [row1, col1] = findPosition(matrix, char1);
    const [row2, col2] = findPosition(matrix, char2);

    if (row1 === row2) {
      encryptedText += matrix[row1 * 5 + ((col1 + 1) % 5)];
      encryptedText += matrix[row2 * 5 + ((col2 + 1) % 5)];
    } else if (col1 === col2) {
      encryptedText += matrix[((row1 + 1) % 5) * 5 + col1];
      encryptedText += matrix[((row2 + 1) % 5) * 5 + col2];
    } else {
      encryptedText += matrix[row1 * 5 + col2];
      encryptedText += matrix[row2 * 5 + col1];
    }
  }

  return encryptedText;
}

// Function to encrypt the text, including handling non-alphabetic characters
function encryptWithPlaceholders(key, text) {
  // Replace non-alphabetic characters with placeholders
  const preparedText = prepareTextForEncryption(text);

  // Create the Playfair matrix
  const matrix = createPlayfairMatrix(key);

  // Encrypt the prepared text
  const encryptedText = encryptPlayfair(matrix, preparedText);

  // Track the positions of non-alphabetic characters
  const nonAlphaMap = text.split("").map((char, idx) => ({
    char: /[^A-Za-z]/.test(char) ? char : null,
    index: /[^A-Za-z]/.test(char) ? idx : null,
  }));

  const result = {
    encrypted: encryptedText,
    nonAlphaMap: nonAlphaMap.filter((item) => item.char !== null),
  };

  // Save the encrypted data to a file named enc.json
  fs.writeFileSync("enc.json", JSON.stringify(result, null, 2));

  return result;
}

// Export the functions for use in other files
module.exports = {
  createPlayfairMatrix,
  encryptPlayfair,
  prepareTextForEncryption,
  encryptWithPlaceholders,
};
