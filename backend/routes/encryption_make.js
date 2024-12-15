function createPlayfairMatrix(key) {
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  let matrix = [];
  let usedChars = new Set();

  for (let char of key.toUpperCase()) {
    if (alphabet.includes(char) && !usedChars.has(char)) {
      matrix.push(char);
      usedChars.add(char);
    }
  }

  for (let char of alphabet) {
    if (!usedChars.has(char)) {
      matrix.push(char);
    }
  }

  // Reshape the matrix into a 5x5 grid
  matrix = matrix.reduce((acc, _, index) => {
    const rowIndex = Math.floor(index / 5);
    if (!acc[rowIndex]) {
      acc[rowIndex] = [];
    }
    acc[rowIndex].push(_);
    return acc;
  }, []);

  console.log(matrix);
  return matrix;
}

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
        return placeholder;
      }
      return char.toUpperCase();
    })
    .join("");
}

function findPosition(matrix, char) {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === char) {
        return [i, j];
      }
    }
  }
  throw new Error(`Character ${char} not found in matrix`);
}

function encryptPlayfair(matrix, text) {
  let encryptedText = "";

  for (let i = 0; i < text.length; i += 2) {
    const char1 = text[i];
    const char2 = text[i + 1] || "X";

    const [row1, col1] = findPosition(matrix, char1);
    const [row2, col2] = findPosition(matrix, char2);

    let encryptedChars;
    if (row1 === row2) {
      encryptedChars = [
        matrix[row1][(col1 + 1) % 5],
        matrix[row2][(col2 + 1) % 5],
      ]; // Same row
    } else if (col1 === col2) {
      encryptedChars = [
        matrix[(row1 + 1) % 5][col1],
        matrix[(row2 + 1) % 5][col2],
      ]; // Same column
    } else {
      encryptedChars = [matrix[row1][col2], matrix[row2][col1]]; // Rectangle swap
    }

    encryptedText += encryptedChars.join("");
  }

  console.log(encryptedText);
  return encryptedText;
}

function decryptPlayfair(matrix, text) {
  let decryptedText = "";

  for (let i = 0; i < text.length; i += 2) {
    const char1 = text[i];
    const char2 = text[i + 1] || "X";

    const [row1, col1] = findPosition(matrix, char1);
    const [row2, col2] = findPosition(matrix, char2);

    if (row1 === row2) {
      decryptedText += matrix[row1][((col1 - 1 + 5) % 5)];
      decryptedText += matrix[row2][((col2 - 1 + 5) % 5)];
    } else if (col1 === col2) {
      decryptedText += matrix[((row1 - 1 + 5) % 5)][col1];
      decryptedText += matrix[((row2 - 1 + 5) % 5)][col2];
    } else {
      decryptedText += matrix[row1][col2];
      decryptedText += matrix[row2][col1];
    }
  }

  return decryptedText;
}

function encryptWithPlaceholders(key, text) {
  const preparedText = prepareTextForEncryption(text);
  const matrix = createPlayfairMatrix(key);
  const encryptedText = encryptPlayfair(matrix, preparedText);

  const nonAlphaMap = text.split("").map((char, idx) => ({
    char: /[^A-Za-z]/.test(char) ? char : null,
    index: /[^A-Za-z]/.test(char) ? idx : null,
  }));

  const result = {
    encrypted: encryptedText,
    nonAlphaMap: nonAlphaMap.filter((item) => item.char !== null),
  };

  return result;
}

function decryptFile(key, encryptedText, nonAlphaMap) {
  const matrix = createPlayfairMatrix(key);
  const decryptedText = decryptPlayfair(matrix, encryptedText);

  let finalDecryptedText = decryptedText
    .split("")
    .map((char, idx) => {
      const nonAlpha = nonAlphaMap.find((item) => item.index === idx);
      if (nonAlpha) {
        return nonAlpha.char;
      }
      return char;
    })
    .join("");

  finalDecryptedText =
    finalDecryptedText.charAt(0).toUpperCase() +
    finalDecryptedText.slice(1).toLowerCase();

  return finalDecryptedText;
}

module.exports = {
  createPlayfairMatrix,
  encryptPlayfair,
  decryptPlayfair,
  prepareTextForEncryption,
  encryptWithPlaceholders,
  decryptFile,
};
